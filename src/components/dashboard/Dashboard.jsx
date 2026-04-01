import { C, card } from '@data/theme';
import { CATEGORIES } from '@data/courses';
import Kpi from '@components/Kpi';
import SectionHeader from '@components/SectionHeader';

export default function Dashboard({teachers,assignments,courses,progress,onFilterTeachers}) {
  const assignedTids=new Set(assignments.map(a=>String(a.teacherId)));
  const inTraining=[...assignedTids].filter(tid=>{
    const t=teachers.find(x=>String(x.id)===tid);
    return progress.some(p=>String(p.teacherId)===tid||(t?.adhyayanUserId&&p.adhyayanUserId===t.adhyayanUserId))&&progress.some(p=>(String(p.teacherId)===tid||(t?.adhyayanUserId&&p.adhyayanUserId===t.adhyayanUserId))&&p.pct>0);
  }).length;
  const notStarted=[...assignedTids].filter(tid=>{
    const t=teachers.find(x=>String(x.id)===tid);
    const tp=progress.filter(p=>String(p.teacherId)===tid||(t?.adhyayanUserId&&p.adhyayanUserId===t.adhyayanUserId));
    return tp.length===0||tp.every(p=>p.pct===0);
  }).length;
  const overdue=assignments.filter(a=>(a.completionStatus||a.status)!=="Completed"&&new Date(a.deadline)<new Date()).length;
  const activeCourses=courses.filter(c=>c.status==="active").length;
  const draftCourses=courses.filter(c=>c.status==="draft").length;
  const totalAssigned=assignments.length;
  const catSummary=Object.entries(CATEGORIES).map(([catId,cat])=>{
    const catCourses=courses.filter(c=>c.cat===catId&&c.status==="active");
    const catCourseIds=catCourses.map(c=>c.id);
    const enrolled=assignments.filter(a=>catCourseIds.includes(a.courseId)).length;
    const catProg=progress.filter(p=>{
      const matchesAssign=assignments.some(a=>catCourseIds.includes(a.courseId)&&(String(a.teacherId)===String(p.teacherId)||(teachers.find(t=>String(t.id)===String(a.teacherId))?.adhyayanUserId&&p.adhyayanUserId===teachers.find(t=>String(t.id)===String(a.teacherId))?.adhyayanUserId)));
      return matchesAssign&&p.pct>0;
    });
    const avgComp=catProg.length?Math.round(catProg.reduce((s,p)=>s+p.pct,0)/catProg.length):0;
    return{...cat,catId,count:catCourses.length,enrolled,avgComp};
  });
  return (
    <div>
      <SectionHeader title="Dashboard" sub={new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <Kpi label="Active Courses" value={activeCourses} sub={`${draftCourses} draft · 4 subjects`} icon="📚" accent={C.text2}/>
        <Kpi label="In Training" value={inTraining} sub="at least 1 module started" icon="🟠" accent={C.brand} onClick={()=>onFilterTeachers({status:"In Progress",course:"all"})}/>
        <Kpi label="Not Started" value={notStarted} sub="need a nudge" icon="⏳" accent={C.text3} onClick={()=>onFilterTeachers({status:"Not Started",course:"all"})}/>
        <Kpi label="Overdue" value={overdue} sub="past their deadline" icon="🔴" accent={C.red} onClick={()=>onFilterTeachers({status:"overdue",course:"all"})}/>
      </div>
      <div style={{...card,padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>By Subject</div>
          <div style={{fontSize:12,color:C.text3}}>{totalAssigned.toLocaleString()} total assigned</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {catSummary.map(cat=>(
            <div key={cat.catId} style={{padding:"14px 16px",borderRadius:12,background:cat.bg,border:`1px solid ${cat.color}22`}}>
              <div style={{fontSize:10,fontWeight:700,color:cat.color,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>
                {cat.label} · {cat.count}
              </div>
              <div style={{fontSize:28,fontWeight:800,color:cat.color,lineHeight:1,marginBottom:4}}>{cat.avgComp}%</div>
              <div style={{fontSize:11,color:cat.color,opacity:.65,marginBottom:10}}>avg completion</div>
              <div style={{height:5,borderRadius:5,background:`${cat.color}22`,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${cat.avgComp}%`,background:cat.color,borderRadius:5}}/>
              </div>
              <div style={{fontSize:11,color:C.text2}}>{cat.enrolled.toLocaleString()} assigned</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
