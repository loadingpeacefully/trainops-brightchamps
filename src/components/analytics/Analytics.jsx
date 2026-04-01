import { useState, useEffect } from "react";
import { C, card } from '@data/theme';
import { CATEGORIES } from '@data/courses';
import { dLeft } from '@data/helpers';
import Kpi from '@components/Kpi';
import SectionHeader from '@components/SectionHeader';
import EmptyState from '@components/EmptyState';

const btn = (bg, color, radius=20) => ({
  padding:"8px 18px", borderRadius:radius, background:bg, color,
  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6,
});

export default function Analytics({teachers,assignments,courses}) {
  const firstActive = courses.find(c=>c.status==='active')?.id || 'c1';
  const [cid,setCid]=useState(firstActive);

  useEffect(()=>{
    if(courses.length>0 && !courses.find(c=>c.id===cid)){
      const first=courses.find(c=>c.status==='active');
      if(first) setCid(first.id);
    }
  },[courses]);

  const c=courses.find(x=>x.id===cid)||courses.find(x=>x.status==='active')||courses[0];
  if(!c) return <div style={{padding:40,color:C.text3}}>No courses available. Click Pull to load.</div>;
  const courseAssigns=assignments.filter(a=>a.courseId===cid);
  const assignedCount=courseAssigns.length;
  const completedCount=courseAssigns.filter(a=>(a.completionStatus||a.status)==="Completed").length;
  const compPct=assignedCount>0?((completedCount/assignedCount)*100).toFixed(1):0;
  const onTrack=courseAssigns.filter(a=>(a.completionStatus||a.status)==="In Progress"&&dLeft(a.deadline)>0).length;
  const atRisk=courseAssigns.filter(a=>(a.completionStatus||a.status)!=="Completed"&&dLeft(a.deadline)<=0).length;
  return(
    <div>
      <SectionHeader title="Analytics" sub="Module-level insight by course"/>
      <div style={{...card,padding:"12px 16px",marginBottom:20,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".06em",marginRight:4,flexShrink:0}}>Course</span>
        {courses.filter(c=>c.status==="active").map(course=>{
          const cat=CATEGORIES[course.cat]||CATEGORIES['coding'],active=cid===course.id;
          return<button key={course.id} onClick={()=>setCid(course.id)} style={{...btn(active?cat.color:C.surf2,active?"#fff":C.text2,20),fontSize:12,padding:"5px 12px",border:`1px solid ${active?cat.color:C.border}`,display:"flex",alignItems:"center",gap:5}}><span>{course.icon}</span>{course.name}</button>;
        })}
      </div>
      {c.status==="draft"?<EmptyState icon="🧠" title="Draft Course" sub="Publish to see analytics."/>:<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
          <Kpi label="Assigned" value={assignedCount} sub={`${onTrack} on track`} icon="👥" accent={C.blue}/>
          <Kpi label="Completion Rate" value={`${compPct}%`} sub={`${completedCount} of ${assignedCount} completed`} icon="✅" accent={C.green}/>
          <Kpi label="At Risk" value={atRisk} sub={`overdue · ${onTrack} on track`} icon="⚠️" accent={atRisk>0?C.red:C.text3}/>
        </div>
        <div style={{...card,padding:"40px 20px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>📊</div>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>Module-level analytics coming in Phase 2</div>
          <div style={{fontSize:12,color:C.text3}}>Will be powered by live Adhyayan data via Metabase</div>
        </div>
      </>}
    </div>
  );
}
