import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { C, F } from '@data/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,fontFamily:"'Poppins',sans-serif"}}>
          <h2 style={{color:"#4360FD",marginBottom:12}}>Something went wrong</h2>
          <p style={{color:"#64748B",marginBottom:16}}>{this.state.error.message}</p>
          <button onClick={()=>this.setState({error:null})} style={{background:"#4360FD",color:"#fff",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { COURSES } from '@data/courses';
import { NAV, LAST_PULL } from '@data/nav';
import { supabase } from './lib/supabase';
import { fetchTeachers, fetchCourses, fetchAssignments, fetchProgress, mergeData, pushTeacher, pushAssignments } from './lib/api';
import Av from '@components/Av';
import SyncBar from '@components/SyncBar';
import Login from '@components/Login';
import Dashboard from '@components/dashboard/Dashboard';
import Courses from '@components/courses/Courses';
import Analytics from '@components/analytics/Analytics';
import Teachers from '@components/teachers/Teachers';
import AssignModal from '@components/teachers/AssignModal';
import AddTeacherModal from '@components/teachers/AddTeacherModal';

const NAV_PATHS = {
  dashboard: "/",
  courses:   "/courses",
  analytics: "/analytics",
  teachers:  "/teachers",
};

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [session,setSession]         = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [teachers,setTeachers]       = useState([]);
  const [assignments,setAssigns]     = useState([]);
  const [courses,setCourses]         = useState(COURSES);
  const [progress,setProgress]       = useState([]);
  const [assignModal,setAssignModal] = useState(null);
  const [addTeacher,setAddTeacher]   = useState(false);
  const [syncStatus,setSyncStatus]   = useState("idle");
  const [lastSynced,setLastSynced]   = useState(LAST_PULL);
  const [tFilter,setTFilter]         = useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session:s}})=>{
      setSession(s);
      setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,s)=>{
      setSession(s);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const [initialLoadDone,setInitialLoadDone] = useState(false);

  // Auto-pull on mount after auth is confirmed
  useEffect(()=>{
    if(session && !authLoading) handlePull();
  },[session,authLoading]);

  const pendingT = useMemo(()=>teachers.filter(t=>t._pending).length,[teachers]);
  const pendingA = useMemo(()=>assignments.filter(a=>a._pending).length,[assignments]);

  // Merge assignments with teacher/course/progress data for Teachers page
  const mergedAssignments = useMemo(()=>mergeData(teachers, assignments, progress, courses),[teachers, assignments, progress, courses]);

  // Auto-push when pending assignments appear (e.g. after handleAssign)
  useEffect(()=>{
    const pending = assignments.filter(a=>a._pending);
    if(pending.length>0){
      const timer = setTimeout(()=>handlePush(),500);
      return ()=>clearTimeout(timer);
    }
  },[assignments]);

  const openAssign = (cid=null,tid=null) => setAssignModal({courseId:cid,teacherId:tid});

  const handleFilterTeachers = f => {
    setTFilter({...f,_ts:Date.now()});
    navigate("/teachers");
  };

  const handleAssign = (cid,tids,deadline) => {
    const newTids = tids.filter(tid => !assignments.some(a => String(a.teacherId)===String(tid) && a.courseId===cid));
    if (newTids.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    setAssigns(prev=>[...newTids.map(tid=>({id:Date.now()+tid,teacherId:tid,courseId:cid,assignedDate:today,deadline,status:"Not Started",_pending:true})),...prev]);
    navigate("/teachers");
  };

  const handleAddTeacher = form => {
    setTeachers(prev=>[...prev,{id:Date.now(),name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim()||"—",vertical:form.vertical||"",teamLead:"",region:"",joinDate:form.joinDate,status:"Active",_pending:true}]);
    setAddTeacher(false);
  };

  const handleUpdateDeadline = (id,date) =>
    setAssigns(prev=>prev.map(a=>a.id===id?{...a,deadline:date,_pending:true}:a));

  const handlePull = async () => {
    setSyncStatus("pulling");
    try {
      const [sheetTeachers, courseData, sheetAssigns, progressData] = await Promise.all([
        fetchTeachers(),
        fetchCourses(),
        fetchAssignments(),
        fetchProgress()
      ]);
      const pendingTeachers = teachers.filter(t => t._pending);
      const pendingAssigns  = assignments.filter(a => a._pending);
      setCourses(courseData);
      setTeachers([...sheetTeachers, ...pendingTeachers]);
      setAssigns([...sheetAssigns, ...pendingAssigns]);
      setProgress(progressData);
      setLastSynced("Just now");
      setSyncStatus("done");
      setInitialLoadDone(true);
    } catch (e) {
      console.error('[sync] Pull failed:', e);
      setSyncStatus("idle");
      setInitialLoadDone(true);
    }
    setTimeout(() => setSyncStatus("idle"), 2500);
  };

  const handlePush = async () => {
    if (pendingT + pendingA === 0) return;
    setSyncStatus("pushing");
    try {
      const pendingTeachers = teachers.filter(t => t._pending);
      const results = await Promise.all([
        ...pendingTeachers.map(t => pushTeacher(t)),
        pushAssignments(assignments)
      ]);
      const allOk = results.every(r => r.ok);
      if (allOk) {
        setTeachers(p => p.map(t => ({ ...t, _pending: false })));
        setAssigns(p => p.map(a => ({ ...a, _pending: false })));
        setLastSynced("Just now");
        setSyncStatus("done");
      } else {
        console.error('[sync] Some push operations failed:', results.filter(r => !r.ok));
        setSyncStatus("idle");
      }
    } catch (e) {
      console.error('[sync] Push failed:', e);
      setSyncStatus("idle");
    }
    setTimeout(() => setSyncStatus("idle"), 2500);
  };

  const isActive = navId => {
    const path = NAV_PATHS[navId];
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  if (authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.canvas}}>
      <div style={{width:48,height:48,borderRadius:12,background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🎓</div>
    </div>
  );

  if (!session) return <Login />;

  const displayName = session.user.user_metadata?.full_name || session.user.email;

  return (
    <div style={{display:"flex",background:C.canvas,fontFamily:F.body,minHeight:"100vh"}}>
      <div style={{width:210,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:10,background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎓</div>
            <div>
              <div style={{fontFamily:F.display,fontSize:14,fontWeight:800,color:C.text,letterSpacing:"-.02em"}}>TrainOS</div>
              <div style={{fontFamily:F.body,fontSize:10,color:C.text3,letterSpacing:".02em",marginTop:1}}>Admin Console</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          {NAV.map(n=>{
            const active=isActive(n.id);
            return <button key={n.id} onClick={()=>navigate(NAV_PATHS[n.id])} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",border:"none",cursor:"pointer",marginBottom:2,borderRadius:10,background:active?C.brandLo:"transparent",color:active?C.brand:C.text3,fontWeight:active?700:500,fontSize:13,textAlign:"left",fontFamily:F.body,transition:"all .12s"}}><span style={{fontSize:12,opacity:.7}}>{n.g}</span>{n.label}</button>;
          })}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Av name={displayName} size={28}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontFamily:F.body,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div><div style={{fontSize:10,color:C.text3}}>Admin</div></div>
          </div>
          <button onClick={()=>supabase.auth.signOut()} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.text3,padding:"6px 0 0",fontFamily:"inherit",width:"100%",textAlign:"left"}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,padding:"24px 32px",overflowY:"auto",minHeight:"100vh"}}>
        <SyncBar syncStatus={syncStatus} lastSynced={lastSynced} pendingT={pendingT} pendingA={pendingA} onPull={handlePull} onPush={handlePush}/>
        {!initialLoadDone&&syncStatus==='pulling'?(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:16}}>
            <div style={{fontSize:32}}>🎓</div>
            <div style={{fontSize:14,color:C.text3}}>Loading TrainOS data...</div>
          </div>
        ):<ErrorBoundary>
          <Routes>
            <Route path="/"          element={<Dashboard teachers={teachers} assignments={mergedAssignments} courses={courses} progress={progress} onFilterTeachers={handleFilterTeachers}/>}/>
            <Route path="/courses"   element={<Courses courses={courses} assignments={mergedAssignments} setAssignOpen={openAssign}/>}/>
            <Route path="/analytics" element={<Analytics teachers={teachers} assignments={mergedAssignments} courses={courses}/>}/>
            <Route path="/teachers"  element={<Teachers teachers={teachers} assignments={mergedAssignments} courses={courses} progress={progress} setAssignOpen={openAssign} onAddTeacher={()=>setAddTeacher(true)} onUpdateDeadline={handleUpdateDeadline} initialFilter={tFilter}/>}/>
            <Route path="*"          element={<Navigate to="/" replace/>}/>
          </Routes>
        </ErrorBoundary>}
      </div>
      {assignModal!==null&&<AssignModal teachers={teachers} courses={courses} preCourseId={assignModal.courseId} preTeacherId={assignModal.teacherId} onClose={()=>setAssignModal(null)} onAssign={handleAssign}/>}
      {addTeacher&&<AddTeacherModal onClose={()=>setAddTeacher(false)} onAdd={handleAddTeacher}/>}
    </div>
  );
}
