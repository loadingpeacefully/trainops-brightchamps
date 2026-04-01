import { useState } from "react";
import { C, card } from '@data/theme';

export default function Kpi({label,value,sub,accent=C.text2,icon,onClick}) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...card,padding:"18px 20px",display:"flex",flexDirection:"column",gap:4,
        cursor:onClick?"pointer":"default",
        outline:hov&&onClick?`2px solid ${accent}`:"2px solid transparent",
        transition:"outline .12s"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
        {icon&&<span style={{fontSize:15}}>{icon}</span>}
        <span style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</span>
        {onClick&&<span style={{marginLeft:"auto",fontSize:9,color:hov?(accent||C.brand):C.text3,fontWeight:600,transition:"color .12s"}}>VIEW →</span>}
      </div>
      <div style={{fontSize:28,fontWeight:800,color:accent,lineHeight:1,letterSpacing:"-.02em"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.text3,marginTop:2}}>{sub}</div>}
    </div>
  );
}
