import { useState } from "react";
import { C, field, mkBtn } from '@data/theme';
import { CATEGORIES } from '@data/courses';
import Modal from '@components/Modal';
import Av from '@components/Av';
import { StatusTag } from '@components/Tag';

export default function AssignModal({teachers,courses,preCourseId,preTeacherId,onClose,onAssign}) {
  const [step,setStep]=useState(preCourseId?2:1);
  const [cid,setCid]=useState(preCourseId||"c1");
  const [tids,setTids]=useState(preTeacherId?[preTeacherId]:[]);
  const [dl,setDl]=useState(()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().split('T')[0];});
  const [ts,setTs]=useState("");
  const toggleT=id=>setTids(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const filt=teachers.filter(t=>!ts||t.name.toLowerCase().includes(ts.toLowerCase())||t.email.toLowerCase().includes(ts.toLowerCase()));
  const allIn=filt.length>0&&filt.every(t=>tids.includes(t.id));
  const selC=courses.find(c=>c.id===cid);
  const steps=["Select Course","Select Teachers","Confirm"];
  return (
    <Modal title="Assign Course" sub={`Step ${step}/3 — ${steps[step-1]}`} onClose={onClose} width={560}
      footer={<>{step>1&&<button onClick={()=>setStep(s=>s-1)} style={mkBtn("secondary")}>← Back</button>}{step<3&&<button onClick={()=>setStep(s=>s+1)} disabled={step===2&&tids.length===0} style={{...mkBtn("primary"),opacity:step===2&&tids.length===0?.4:1}}>Continue →</button>}{step===3&&<button onClick={()=>{onAssign(cid,tids,dl);onClose();}} style={mkBtn("primary")}>Confirm Assignment</button>}</>}>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:400,overflowY:"auto"}}>
          {Object.entries(CATEGORIES).map(([catId,cat])=>{
            const catCourses=courses.filter(c=>c.cat===catId&&c.status==="active");
            return (<div key={catId}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,color:cat.color,padding:"8px 4px 4px"}}><span style={{width:8,height:8,borderRadius:"50%",background:cat.color,display:"block",flexShrink:0}}/>{cat.label}</div>
              {catCourses.map(c=>(
                <div key={c.id} onClick={()=>setCid(c.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:7,cursor:"pointer",background:cid===c.id?cat.color+"12":"transparent",border:`1px solid ${cid===c.id?cat.color+"44":C.border}`,marginBottom:3,transition:"all .1s"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{c.icon}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.text3,marginTop:2}}>{c.modules} modules · {(c.enrolled??0).toLocaleString()} enrolled</div></div>
                  {cid===c.id&&<span style={{color:cat.color,fontSize:12}}>✓</span>}
                </div>
              ))}
            </div>);
          })}
        </div>
      )}
      {step===2&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={ts} onChange={e=>setTs(e.target.value)} placeholder="Search teachers…" style={{...field,flex:1}}/>
            <button onClick={()=>setTids(allIn?tids.filter(x=>!filt.map(t=>t.id).includes(x)):[...new Set([...tids,...filt.map(t=>t.id)])])} style={{...mkBtn("secondary"),flexShrink:0,padding:"7px 13px",fontSize:11}}>{allIn?"Deselect all":"Select all"}</button>
          </div>
          <div style={{border:`1px solid ${C.border}`,borderRadius:8,maxHeight:320,overflowY:"auto"}}>
            {filt.length===0&&<div style={{padding:24,textAlign:"center",fontSize:11,color:C.text3}}>No teachers found</div>}
            {filt.map((t,i)=>{const sel=tids.includes(t.id);return(
              <div key={t.id} onClick={()=>toggleT(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",cursor:"pointer",background:sel?C.brandLo:"transparent",borderBottom:i<filt.length-1?`1px solid ${C.border}`:"none",transition:"all .1s"}}>
                <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${sel?C.brand:C.border2}`,background:sel?C.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>}</div>
                <Av name={t.name} size={26}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.text3}}>{t.vertical||'—'}</div></div>
                <StatusTag status={t.status}/>
              </div>
            );})}
          </div>
          {tids.length>0&&<div style={{marginTop:8,fontSize:11,color:C.brand,fontWeight:700}}>{tids.length} selected</div>}
        </div>
      )}
      {step===3&&(
        <div>
          <div style={{background:C.surf2,borderRadius:8,padding:"14px 16px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:18}}>{selC?.icon}</span><div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{selC?.name}</div><div style={{fontSize:11,color:C.text3}}>{selC?.modules} modules</div></div></div>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,marginBottom:8}}>Assigned to</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {tids.slice(0,6).map(tid=>{const t=teachers.find(x=>x.id===tid);return t?<div key={tid} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border2}`,background:C.surf3}}><Av name={t.name} size={14}/><span style={{fontSize:10,color:C.text2}}>{t.name}</span></div>:null;})}
              {tids.length>6&&<div style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:10,color:C.text3}}>+{tids.length-6} more</div>}
            </div>
            <div><label style={{display:"block",fontSize:11,fontWeight:600,color:C.text3,marginBottom:5}}>Deadline</label><input type="date" value={dl} onChange={e=>setDl(e.target.value)} style={field}/></div>
          </div>
          <div style={{padding:"10px 12px",background:C.brandLo,borderRadius:7,borderLeft:`3px solid ${C.brand}`,fontSize:11,color:C.brand}}>{tids.length} teacher{tids.length!==1?"s":""} will receive an email notification.</div>
        </div>
      )}
    </Modal>
  );
}
