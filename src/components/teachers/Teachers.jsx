import { useState, useMemo, useEffect, useRef } from "react";
import { C, card, field, mkBtn } from '@data/theme';
import { fmtD, fmtS, dLeft, hColor } from '@data/helpers';
import { VERTICALS } from '@data/nav';
import Av from '@components/Av';
import { StatusTag } from '@components/Tag';
import PBar from '@components/PBar';
import Kpi from '@components/Kpi';
import SectionHeader from '@components/SectionHeader';
import EmptyState from '@components/EmptyState';
import Toast from '@components/Toast';

const btn = (bg, color, radius=20) => ({
  padding:"8px 18px", borderRadius:radius, background:bg, color,
  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6,
});

export default function Teachers({teachers,assignments,courses,progress,setAssignOpen,onAddTeacher,onUpdateDeadline,initialFilter}) {
  const [view,setView]=useState(assignments?.length>0?"assignments":"roster");
  const [search,setSearch]=useState("");
  const [vFilter,setVFilter]=useState("All");
  const [auditFilter,setAuditFilter]=useState("all");
  const [cFilter,setCFilter]=useState(initialFilter?.course||"all");
  const [sFilter,setSFilter]=useState(initialFilter?.status||"all");
  const [sort,setSort]=useState({col:"deadline",dir:"asc"});
  const [profile,setProfile]=useState(null);
  const [sel,setSel]=useState(new Set());
  const [editDL,setEditDL]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [toast,setToast]=useState(null);
  const toastRef=useRef(null);

  useEffect(()=>{if(initialFilter){setCFilter(initialFilter.course||"all");setSFilter(initialFilter.status||"all");setView("assignments");}},[initialFilter]);

  const showToast=(msg,type="success")=>{clearTimeout(toastRef.current);setToast({msg,type});toastRef.current=setTimeout(()=>setToast(null),2600);};

  const allRows=useMemo(()=>assignments.map(a=>{const t=a.teacher||teachers.find(x=>x.id===a.teacherId),c=a.course||courses.find(x=>x.id===a.courseId);return(t&&c)?{...a,teacher:t,course:c}:null;}).filter(Boolean),[assignments,teachers,courses]);

  const filteredRows=useMemo(()=>allRows.filter(r=>{
    if(cFilter!=="all"&&r.courseId!==cFilter) return false;
    const ds=r.completionStatus||r.status||'Not Started';
    const late=new Date(r.deadline)<new Date()&&ds!=="Completed";
    if(sFilter==="overdue"&&!late) return false;
    if(sFilter!=="all"&&sFilter!=="overdue"&&ds!==sFilter) return false;
    if(search&&!r.teacher.name.toLowerCase().includes(search.toLowerCase())&&!r.teacher.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }),[allRows,cFilter,sFilter,search]);

  const rows=useMemo(()=>{
    const s=[...filteredRows];const{col,dir}=sort;
    s.sort((a,b)=>{let va,vb;if(col==="teacher"){va=a.teacher.name;vb=b.teacher.name;}if(col==="deadline"){va=new Date(a.deadline);vb=new Date(b.deadline);}if(col==="progress"){va=a.pct;vb=b.pct;}if(col==="status"){va=a.status;vb=b.status;}return va<vb?(dir==="asc"?-1:1):va>vb?(dir==="asc"?1:-1):0;});
    return s;
  },[filteredRows,sort]);

  const tSort=col=>setSort(s=>s.col===col?{col,dir:s.dir==="asc"?"desc":"asc"}:{col,dir:"asc"});
  const SortH=({col:c,label})=>{
    const active=sort.col===c;
    return(
      <div onClick={()=>tSort(c)} style={{fontSize:11,fontWeight:600,color:active?C.brand:C.text3,cursor:"pointer",display:"flex",alignItems:"center",gap:3,userSelect:"none"}}>
        {label}<span style={{opacity:active?1:.3}}>{active&&sort.dir==="desc"?"↓":"↑"}</span>
      </div>
    );
  };

  const overdueN=allRows.filter(r=>(r.completionStatus||r.status)!=="Completed"&&new Date(r.deadline)<new Date()).length;
  const notStartN=allRows.filter(r=>(r.completionStatus||r.status)==="Not Started").length;
  const assignedCount=new Set(assignments.map(a=>String(a.teacherId))).size;
  const unassignedCount=teachers.length-assignedCount;
  const allIds=rows.map(r=>r.id);
  const allSel=allIds.length>0&&allIds.every(id=>sel.has(id));
  const toggleAll=()=>setSel(s=>allSel?new Set():new Set(allIds));
  const toggleOne=id=>setSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const selRows=rows.filter(r=>sel.has(r.id));

  const doRemind=rs=>{const names=rs.slice(0,2).map(r=>r.teacher.name.split(" ")[0]).join(", ");showToast(`⏳ ${names}${rs.length>2?` +${rs.length-2} more`:""} — email reminders coming soon`,"info");setSel(new Set());};
  const saveDL=id=>{if(editVal){onUpdateDeadline(id,editVal);showToast("Deadline updated");}setEditDL(null);setEditVal("");};

  if(profile!==null){
    const t=teachers.find(x=>x.id===profile);
    if(!t){setProfile(null);return null;}
    const ta=assignments.filter(a=>String(a.teacherId)===String(t.id));
    return (
      <div>
        <button onClick={()=>setProfile(null)} style={{...btn(C.surf2,C.brand,10),fontSize:12,marginBottom:20,border:`1px solid ${C.border}`}}>← Back</button>
        <div style={{...card,padding:"20px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <Av name={t.name} size={54}/>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:C.text}}>{t.name}</div>
            <div style={{fontSize:12,color:C.text3,marginTop:3}}>{t.email}{t.phone&&t.phone!=='—'?` · ${t.phone}`:''}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,flexWrap:"wrap"}}>
              <StatusTag status={t.status}/>
              <span style={{fontSize:12,color:C.text3}}>Joined {fmtD(t.joinDate)} · {t.vertical||'—'}</span>
              {t.teamLead&&<span style={{fontSize:12,color:C.text3}}>Team: {t.teamLead}</span>}
              {t.region&&<span style={{fontSize:12,color:C.text3}}>Region: {t.region}</span>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <button onClick={()=>setAssignOpen(null,t.id)} style={btn(C.brand,"#fff",10)}>+ Assign Course</button>
            {t.learningPathLink&&<a href={t.learningPathLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.brand,textDecoration:"none",fontWeight:600}}>Open Learning Path →</a>}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
          <Kpi label="Courses Assigned" value={ta.length} icon="📚" accent={C.text2}/>
          <Kpi label="Avg Completion" value={ta.length>0?`${Math.round(ta.reduce((s,a)=>s+a.pct,0)/ta.length)}%`:"—"} icon="📊" accent={C.brand}/>
          <Kpi label="Completed" value={ta.filter(a=>a.status==="Completed").length} icon="✅" accent={C.green}/>
        </div>
        <div style={{...card,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.text}}>Assigned Courses ({ta.length})</div>
          {ta.length===0&&<EmptyState icon="📚" title="No Courses Assigned" sub="Use Assign Course to get started."/>}
          {ta.map(a=>{
            const c=courses.find(x=>x.id===a.courseId);
            if(!c) return null;
            const ds=a.completionStatus||a.status||'Not Started',late=new Date(a.deadline)<new Date()&&ds!=="Completed",hc=hColor(a.pct,ds,a.deadline);
            return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:38,height:38,borderRadius:10,background:C.brandLo,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.text3,marginTop:2}}>Due {fmtD(a.deadline)}{late?" · ⚠ overdue":""}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                    <div style={{width:140}}><PBar pct={a.pct} h={5} color={hc}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:hc}}>{a.pct}%</span>
                    <span style={{fontSize:11,color:C.text3}}>{Math.round(a.pct/100*c.modules)}/{c.modules} modules</span>
                  </div>
                  {a.kc1Score!=null&&a.kc1Score!=='Not Completed'?<div style={{fontSize:11,color:C.text2,marginTop:4}}>KC1: {a.kc1Score}/10 · KC2: {a.kc2Score}/10 · Avg: {a.avgScore}/10</div>:a.kc1Score==='Not Completed'?<div style={{fontSize:11,color:C.text3,marginTop:4}}>KC: Not taken yet</div>:null}
                </div>
                <StatusTag status={a.completionStatus||a.status||'Not Started'}/>
              </div>
            );
          })}
        </div>
        {(()=>{
          const tp=progress.filter(p=>String(p.teacherId)===String(t.id)||(t.adhyayanUserId&&p.adhyayanUserId===t.adhyayanUserId));
          const unassignedProgress=tp.filter(p=>!ta.some(a=>a.courseId===p.courseId));
          if(unassignedProgress.length===0) return null;
          return(
            <div style={{...card,overflow:"hidden",marginTop:16}}>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.text}}>Progress from Adhyayan (not yet assigned)</div>
              {unassignedProgress.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{width:38,height:38,borderRadius:10,background:C.amberLo,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📊</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>Course: {p.courseId}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                      <div style={{width:140}}><PBar pct={p.pct} h={5} color={C.brand}/></div>
                      <span style={{fontSize:12,fontWeight:700,color:C.brand}}>{p.pct}%</span>
                    </div>
                    {p.kc1Score!=null&&<div style={{fontSize:11,color:C.text2,marginTop:4}}>KC1: {p.kc1Score}/10 · KC2: {p.kc2Score}/10 · Avg: {p.avgScore}/10</div>}
                  </div>
                  <StatusTag status={p.completionStatus}/>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  }

  const RosterView=()=>{
    const assignedIds=new Set(assignments.map(a=>String(a.teacherId)));
    const filteredTeachers=teachers.filter(t=>(!search||t.name.toLowerCase().includes(search.toLowerCase())||t.email.toLowerCase().includes(search.toLowerCase()))&&(vFilter==="All"||t.vertical===vFilter));
    return(
      <div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <select value={vFilter} onChange={e=>setVFilter(e.target.value)} style={{...field,width:"auto",cursor:"pointer",flexShrink:0}}>
            {["All",...VERTICALS].map(v=><option key={v} value={v}>{v==="All"?"All Verticals":v}</option>)}
          </select>
          <span style={{fontSize:11,color:C.text3,alignSelf:"center"}}>{filteredTeachers.length} teachers</span>
          {assignments.length===0&&<span style={{fontSize:12,color:C.text3}}>↓ Pull to load assignments</span>}
        </div>
        <div style={{...card,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 110px",padding:"10px 20px",borderBottom:`1px solid ${C.border}`,background:C.surf2}}>
            {["Teacher","Vertical","Joined","Assignments","Status"].map(h=><div key={h} style={{fontSize:11,fontWeight:600,color:C.text3}}>{h}</div>)}
          </div>
          {filteredTeachers.map((t,i,arr)=>{
          const assigned=assignments.filter(a=>String(a.teacherId)===String(t.id)).length,unassigned=!assignedIds.has(String(t.id));
          return(
            <div key={t.id} onClick={()=>setProfile(t.id)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 110px",padding:"12px 20px",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",alignItems:"center",cursor:"pointer",background:"transparent",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.surf2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                <Av name={t.name} size={30}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  <div style={{fontSize:11,color:C.text3}}>{t.email}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:C.text2}}>{t.vertical||'—'}</div>
              <div style={{fontSize:12,color:C.text3}}>{fmtS(t.joinDate)}</div>
              <div style={{fontSize:12,color:assigned>0?C.text2:C.amber,fontWeight:unassigned?700:400}}>{assigned>0?`${assigned} course${assigned>1?"s":""}`:unassigned?"Unassigned":"—"}</div>
              <StatusTag status={t.status}/>
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  const COLS="28px 1.6fr 1.2fr 80px 160px 100px 120px 100px";
  return(
    <div>
      <Toast toast={toast}/>
      <SectionHeader title="Teachers" sub={`${teachers.length} teachers · ${assignedCount} assigned · ${unassignedCount} unassigned · ${overdueN} overdue`}
        action={<div style={{display:"flex",gap:8}}>
          <button onClick={()=>setAssignOpen(null)} style={{...btn(C.surf2,C.text2,10),border:`1px solid ${C.border}`}}>Assign Course</button>
          <button onClick={onAddTeacher} style={btn(C.brand,"#fff",10)}>+ Add Teacher</button>
        </div>}/>
      <div style={{display:"flex",gap:0,marginBottom:18,borderBottom:`1px solid ${C.border}`}}>
        {[["assignments","Assignments",allRows.length],["roster","All Teachers",teachers.length],["audit","Data Audit",""]].map(([id,label,count])=>(
          <button key={id} onClick={()=>setView(id)} style={{padding:"9px 18px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:view===id?C.brand:C.text3,borderBottom:`2px solid ${view===id?C.brand:"transparent"}`,marginBottom:-1,transition:"color .12s",fontFamily:"inherit"}}>
            {label} <span style={{fontSize:11,opacity:.7}}>{count}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…" style={{...field,width:200,flexShrink:0}}/>
        {view==="assignments"&&<>
          <select value={cFilter} onChange={e=>setCFilter(e.target.value)} style={{...field,width:"auto",cursor:"pointer",flexShrink:0}}>
            <option value="all">All Courses</option>
            {courses.filter(c=>c.status==="active").map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div style={{display:"flex",gap:6}}>
            {[["all","All"],["In Progress","In Progress"],["Not Started","Not Started"],["overdue","Overdue"],["Completed","Completed"]].map(([val,label])=>{
              const active=sFilter===val;
              const col=val==="In Progress"?C.brand:val==="Completed"?C.green:val==="overdue"?C.red:val==="Not Started"?C.text3:C.text2;
              return<button key={val} onClick={()=>setSFilter(val)} style={{...btn(active?col:C.surf2,active?"#fff":C.text2,20),fontSize:11,padding:"5px 12px",border:`1px solid ${active?col:C.border}`}}>{label}</button>;
            })}
          </div>
        </>}
        <span style={{fontSize:11,color:C.text3,marginLeft:"auto"}}>{view==="assignments"?`${rows.length} result${rows.length!==1?"s":""}`:""}</span>
        {sel.size>0&&<div style={{width:"100%",display:"flex",alignItems:"center",gap:8,paddingTop:10,marginTop:2,borderTop:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,color:C.text2,fontWeight:600}}>{sel.size} selected</span>
          <button onClick={()=>doRemind(selRows)} style={{...btn(C.amberLo,C.amber,10),fontSize:11,padding:"5px 10px"}}>✉ Remind (soon) ({sel.size})</button>
          <button onClick={()=>setSel(new Set())} style={{...btn(C.surf2,C.text3,10),fontSize:11,padding:"5px 10px",border:`1px solid ${C.border}`}}>Clear</button>
        </div>}
      </div>
      {view==="roster"&&<RosterView/>}
      {view==="assignments"&&(
        <div style={{...card,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:COLS,padding:"10px 20px",background:C.surf2,borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
            <div onClick={toggleAll} style={{width:16,height:16,borderRadius:4,border:`2px solid ${allSel?C.brand:C.border}`,background:allSel?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{allSel&&<span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span>}</div>
            <div style={{paddingRight:16}}><SortH col="teacher" label="Teacher"/></div>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,paddingRight:16}}>Course</div>
            <div style={{paddingRight:16}}><SortH col="deadline" label="Days Left"/></div>
            <div style={{paddingRight:16}}><SortH col="progress" label="Progress"/></div>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,paddingRight:16}}>Deadline</div>
            <div style={{paddingRight:16}}><SortH col="status" label="Status"/></div>
            <div style={{fontSize:11,fontWeight:600,color:C.text3}}>Action</div>
          </div>
          {rows.length===0&&<EmptyState icon="🔍" title="No results" sub="Adjust the course or status filter."/>}
          {rows.map(r=>{
            const displayStatus=r.completionStatus||r.status||'Not Started',late=new Date(r.deadline)<new Date()&&displayStatus!=="Completed",dl=dLeft(r.deadline),hc=hColor(r.pct,displayStatus,r.deadline),isSel=sel.has(r.id),editingThis=editDL===r.id;
            return(
              <div key={r.id} style={{display:"grid",gridTemplateColumns:COLS,padding:"11px 20px",borderBottom:`1px solid ${C.border}`,background:isSel?C.brandLo:r._pending?"#fef9f6":"transparent",alignItems:"center",transition:"background .1s"}} onMouseEnter={e=>{if(!isSel&&!r._pending)e.currentTarget.style.background=C.surf2;}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?C.brandLo:r._pending?"#fef9f6":"transparent";}}>
                <div onClick={e=>{e.stopPropagation();toggleOne(r.id);}} style={{width:16,height:16,borderRadius:4,border:`2px solid ${isSel?C.brand:C.border}`,background:isSel?C.brand:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span>}</div>
                <div onClick={()=>setProfile(r.teacher.id)} style={{display:"flex",alignItems:"center",gap:8,minWidth:0,cursor:"pointer",paddingRight:16}}>
                  {r._pending&&<span style={{fontSize:8,color:C.brand,flexShrink:0}}>●</span>}
                  <Av name={r.teacher.name} size={28}/><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.teacher.name}</div><div style={{fontSize:11,color:C.text3}}>{r.teacher.vertical||'—'}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,paddingRight:16}}><span style={{fontSize:14,flexShrink:0}}>{r.course.icon}</span><span style={{fontSize:12,color:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.course.name}</span></div>
                <div style={{fontSize:12,fontWeight:700,color:displayStatus==="Completed"?C.green:late?C.red:dl!=null&&dl<=7?C.amber:C.text3,paddingRight:16}}>{displayStatus==="Completed"?"Done":dl==null?"—":late?`${Math.abs(dl)}d over`:`${dl}d left`}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,paddingRight:16}}><div style={{flex:1,minWidth:0}}><PBar pct={r.pct} h={5} color={hc}/></div><span style={{fontSize:12,fontWeight:700,color:hc,minWidth:42,flexShrink:0,textAlign:"right"}}>{r.pct}%</span></div>
                {editingThis?(
                  <div style={{display:"flex",alignItems:"center",gap:4,paddingRight:16,whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}><input type="date" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{...field,padding:"4px 7px",fontSize:11,width:115}} autoFocus/><button onClick={()=>saveDL(r.id)} style={{...btn(C.brand,"#fff",6),padding:"4px 8px",fontSize:11}}>✓</button><button onClick={()=>{setEditDL(null);setEditVal("");}} style={{...btn(C.surf2,C.text3,6),padding:"4px 7px",fontSize:11,border:`1px solid ${C.border}`}}>×</button></div>
                ):(
                  <span onClick={e=>{e.stopPropagation();setEditDL(r.id);setEditVal(r.deadline);}} title="Click to edit" style={{fontSize:12,color:late?C.red:C.text2,cursor:"pointer",textDecoration:"underline dotted",textUnderlineOffset:3,paddingRight:16,whiteSpace:"nowrap"}}>{fmtS(r.deadline)}</span>
                )}
                <div style={{paddingRight:16}}><StatusTag status={displayStatus}/></div>
                <div onClick={e=>e.stopPropagation()}>{(late||displayStatus==="Not Started")?<button onClick={()=>doRemind([r])} style={{...btn(late?C.redLo:C.amberLo,late?C.red:C.amber,10),padding:"5px 10px",fontSize:11}}>⏳ Remind</button>:<span style={{fontSize:12,color:C.text3}}>—</span>}</div>
              </div>
            );
          })}
        </div>
      )}
      {view==="audit"&&(()=>{
        const auditRows=teachers.map(t=>{
          const tid=String(t.id);
          const hasAssign=assignments.some(a=>String(a.teacherId)===tid);
          const prog=progress.find(p=>String(p.teacherId)===tid||(t.adhyayanUserId&&p.adhyayanUserId===t.adhyayanUserId));
          const hasProg=!!prog&&prog.pct>0;
          const status=hasAssign&&hasProg?"complete":hasAssign&&!hasProg?"no-progress":!hasAssign&&hasProg?"no-assignment":"ghost";
          return{...t,hasAssign,hasProg,progPct:prog?.pct||0,auditStatus:status};
        });
        const counts={complete:0,"no-progress":0,"no-assignment":0,ghost:0};
        auditRows.forEach(r=>counts[r.auditStatus]++);
        const statusColor={complete:C.green,"no-progress":C.amber,"no-assignment":C.brand,ghost:C.text3};
        const statusLabel={complete:"Complete","no-progress":"No Progress","no-assignment":"No Assignment",ghost:"Ghost"};
        return(
          <div style={{...card,overflow:"hidden"}}>
            <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              {[["all","All",teachers.length],["complete","Complete",counts.complete],["no-assignment","No Assignment",counts["no-assignment"]],["no-progress","No Progress",counts["no-progress"]],["ghost","Ghost",counts.ghost]].map(([id,label,n])=>(
                <button key={id} onClick={()=>setAuditFilter?.(id)} style={{...btn(id==="all"?C.surf2:statusColor[id]||C.surf2,id==="all"?C.text2:"#fff",20),fontSize:11,padding:"5px 12px",border:`1px solid ${C.border}`,opacity:1}}>{label} ({n})</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 80px 100px",padding:"10px 20px",background:C.surf2,borderBottom:`1px solid ${C.border}`}}>
              {["Teacher","Vertical","Assignment","Progress","Status"].map(h=><div key={h} style={{fontSize:11,fontWeight:600,color:C.text3}}>{h}</div>)}
            </div>
            {auditRows.filter(r=>auditFilter==="all"||r.auditStatus===auditFilter).slice(0,200).map((t,i)=>(
              <div key={t.id} onClick={()=>setProfile(t.id)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 80px 100px",padding:"10px 20px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.surf2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                  <Av name={t.name} size={26}/>
                  <div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div><div style={{fontSize:10,color:C.text3}}>{t.email}</div></div>
                </div>
                <div style={{fontSize:11,color:C.text2}}>{t.vertical||'—'}</div>
                <div style={{fontSize:11,color:t.hasAssign?C.green:C.text3}}>{t.hasAssign?"✅":"❌"}</div>
                <div style={{fontSize:11,color:t.hasProg?C.green:C.text3}}>{t.hasProg?`${t.progPct}%`:"❌"}</div>
                <div><span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:10,background:statusColor[t.auditStatus]+"15",color:statusColor[t.auditStatus]}}>{statusLabel[t.auditStatus]}</span></div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
