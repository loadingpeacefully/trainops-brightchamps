import { useState } from "react";
import { C, field, mkBtn } from '@data/theme';
import { VERTICALS } from '@data/nav';
import Modal from '@components/Modal';

export default function AddTeacherModal({onClose,onAdd}) {
  const [form,setForm]=useState({name:"",email:"",phone:"",vertical:"Codechamps",joinDate:new Date().toISOString().split("T")[0]});
  const [err,setErr]=useState({});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const validate=()=>{const e={};if(!form.name.trim())e.name="Required";if(!form.email.trim())e.email="Required";else if(!/\S+@\S+\.\S+/.test(form.email))e.email="Invalid email";setErr(e);return!Object.keys(e).length;};
  const Lbl=({k,label,type="text",ph=""})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:9,fontWeight:600,color:C.text3,marginBottom:5}}>{label}</label>
      <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{...field,borderColor:err[k]?C.red:C.border2}}/>
      {err[k]&&<div style={{fontSize:10,color:C.red,marginTop:3}}>{err[k]}</div>}
    </div>
  );
  return (
    <Modal title="Add Teacher" sub="Added immediately to roster" onClose={onClose}
      footer={<><button onClick={onClose} style={mkBtn("secondary")}>Cancel</button><button onClick={()=>{if(validate())onAdd(form);}} style={mkBtn("primary")}>Add Teacher</button></>}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <div style={{gridColumn:"span 2"}}><Lbl k="name" label="Full Name *" ph="Priya Sharma"/></div>
        <Lbl k="email" label="Email *" type="email" ph="priya@gmail.com"/>
        <Lbl k="phone" label="Phone" ph="+91 98765 43210"/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:9,fontWeight:600,color:C.text3,marginBottom:5}}>Vertical</label>
          <select value={form.vertical} onChange={e=>set("vertical",e.target.value)} style={{...field,cursor:"pointer"}}>
            {VERTICALS.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:9,fontWeight:600,color:C.text3,marginBottom:5}}>Join Date</label>
          <input type="date" value={form.joinDate} onChange={e=>set("joinDate",e.target.value)} style={field}/>
        </div>
      </div>
    </Modal>
  );
}
