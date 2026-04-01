import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, card, field, mkBtn } from '@data/theme';
import { CATEGORIES } from '@data/courses';
import SectionHeader from '@components/SectionHeader';
import PBar from '@components/PBar';

const btn = (bg, color, radius=20) => ({
  padding:"8px 18px", borderRadius:radius, background:bg, color,
  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6,
});

export default function Courses({courses,assignments,setAssignOpen}) {
  const navigate = useNavigate();
  const [catFilter,setCat]=useState("all");
  const activeCats=[...new Set(courses.filter(c=>c.status==="active").map(c=>c.cat))];
  const visibleCats=catFilter==="all"?activeCats:[catFilter];
  return (
    <div>
      <SectionHeader title="Courses" sub={`${courses.filter(c=>c.status==="active").length} active · ${Object.keys(CATEGORIES).length} subjects · ${assignments.length} assigned`}/>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
        <button onClick={()=>setCat("all")} style={{...btn(catFilter==="all"?C.brand:C.surface,catFilter==="all"?"#fff":C.text2,20),fontSize:12,padding:"6px 14px",border:`1px solid ${catFilter==="all"?C.brand:C.border}`}}>All</button>
        {Object.entries(CATEGORIES).map(([id,cat])=>(
          <button key={id} onClick={()=>setCat(id)} style={{...btn(catFilter===id?cat.color:C.surface,catFilter===id?"#fff":C.text2,20),fontSize:12,padding:"6px 14px",border:`1px solid ${catFilter===id?cat.color:C.border}`}}>
            {cat.label} · {courses.filter(c=>c.cat===id&&c.status==="active").length}
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        {visibleCats.map(catId=>{
          const cat=CATEGORIES[catId]||CATEGORIES['coding'],catCourses=courses.filter(c=>c.cat===catId);
          return (
            <div key={catId}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:cat.color,display:"inline-block",flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:cat.color,letterSpacing:".06em",textTransform:"uppercase"}}>{cat.label}</span>
                <div style={{height:1,flex:1,background:C.border}}/>
                <span style={{fontSize:12,color:C.text3}}>
                  {catCourses.filter(c=>c.status==="active").length} courses · {catCourses.reduce((s,c)=>s+assignments.filter(a=>a.courseId===c.id).length,0)} assigned
                </span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {catCourses.map(c=>(
                  <div key={c.id} style={{...card,opacity:c.status==="draft"?.6:1,display:"flex",flexDirection:"column"}}>
                    {c.status==="draft"&&(
                      <div style={{padding:"5px 14px",borderBottom:`1px solid ${C.border}`,background:C.surf2,borderRadius:"16px 16px 0 0"}}>
                        <span style={{fontSize:11,fontWeight:700,color:C.text3,background:C.border,padding:"2px 8px",borderRadius:8}}>Draft</span>
                      </div>
                    )}
                    <div style={{padding:"18px 20px",flex:1}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                        <div style={{width:42,height:42,borderRadius:12,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{c.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.3}}>{c.name}</div>
                          <div style={{fontSize:12,color:C.text3,marginTop:3}}>{c.desc}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:10,marginBottom:14}}>
                        {[["📦 Modules",c.modules],["👥 Assigned",assignments.filter(a=>a.courseId===c.id).length||"—"]].map(([l,v])=>(
                          <div key={l} style={{flex:1,padding:"8px 12px",background:C.surf2,borderRadius:10,border:`1px solid ${C.border}`}}>
                            <div style={{fontSize:11,color:C.text3,marginBottom:2}}>{l}</div>
                            <div style={{fontSize:16,fontWeight:800,color:C.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {c.status==="active"&&(()=>{
                        const ca=assignments.filter(a=>a.courseId===c.id);
                        const avgPct=ca.length>0?Math.round(ca.reduce((s,a)=>s+(a.pct||0),0)/ca.length):0;
                        return ca.length>0?(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                              <span style={{fontSize:11,color:C.text3}}>Avg Completion</span>
                              <span style={{fontSize:12,fontWeight:700,color:cat.color}}>{avgPct}%</span>
                            </div>
                            <PBar pct={avgPct} h={6} color={cat.color}/>
                          </div>
                        ):<div style={{fontSize:11,color:C.text3}}>No assignments yet</div>;
                      })()}
                    </div>
                    <div style={{display:"flex",gap:8,padding:"12px 20px",borderTop:`1px solid ${C.border}`,background:C.surf2,borderRadius:"0 0 16px 16px"}}>
                      <button onClick={()=>setAssignOpen(c.id)}
                        style={{...btn(c.status==="draft"?C.surface:C.brand,c.status==="draft"?C.text2:"#fff",10),flex:1,justifyContent:"center",fontSize:12,padding:"7px 12px",border:c.status==="draft"?`1px solid ${C.border}`:"none"}}>
                        {c.status==="draft"?"Publish & Assign":"Assign Teachers"}
                      </button>
                      <button onClick={()=>navigate("/analytics")} style={{...btn(C.surface,C.text2,10),fontSize:12,padding:"7px 12px",border:`1px solid ${C.border}`}}>Analytics</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
