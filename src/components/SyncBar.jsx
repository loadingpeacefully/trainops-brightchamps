import { C, card } from '@data/theme';
import { SHEETS, SHEET_FILE } from '@data/nav';

export default function SyncBar({syncStatus,lastSynced,pendingT,pendingA,onPull,onPush}) {
  const pending=pendingT+pendingA, busy=syncStatus==="pulling"||syncStatus==="pushing", done=syncStatus==="done";
  const parts=[...(pendingT>0?[`${pendingT} new teacher${pendingT>1?"s":""}`]:[]),...(pendingA>0?[`${pendingA} assignment${pendingA>1?"s":""}`]:[])];
  const btnBase={padding:"6px 12px",borderRadius:9,fontSize:12,fontWeight:700,fontFamily:"inherit",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6};
  return (
    <div style={{...card,display:"flex",alignItems:"center",gap:12,padding:"9px 16px",marginBottom:22,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
        <div style={{width:24,height:24,borderRadius:7,background:"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#2e7d32",fontSize:12}}>✦</span>
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{SHEET_FILE}.xlsx</div>
          <div style={{fontSize:10,color:C.text3}}>
            {busy?<span style={{color:C.brand}}>{syncStatus==="pulling"?"⟳ Pulling from sheet…":"⟳ Pushing changes…"}</span>:done?<span style={{color:C.green}}>✓ Synced just now</span>:`Last synced: ${lastSynced}`}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {SHEETS.map(s=>(
          <div key={s.id||s.tab} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:8,background:C.surf2,border:`1px solid ${C.border}`}}>
            {s.icon&&<span style={{fontSize:11}}>{s.icon}</span>}
            <span style={{fontSize:10,fontWeight:600,color:C.text2}}>{s.tab}</span>
            {!s.writable&&<span style={{fontSize:9,color:C.text3,background:C.border,padding:"1px 4px",borderRadius:4}}>read</span>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {pending>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:1,padding:"4px 10px",borderRadius:10,background:C.brandLo,border:`1px solid ${C.brandXlo}`}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.brand}}/>
              <span style={{fontSize:11,fontWeight:700,color:C.brand}}>{pending} pending write{pending!==1?"s":""}</span>
            </div>
            {parts.length>0&&<span style={{fontSize:10,color:C.brand,opacity:.75,paddingLeft:11}}>{parts.join(", ")}</span>}
          </div>
        )}
        <button onClick={onPull} disabled={busy}
          style={{...btnBase,background:C.surf2,color:C.text3,border:`1px solid ${C.border}`,opacity:busy?.5:1,cursor:busy?"not-allowed":"pointer"}}>
          {syncStatus==="pulling"?"⟳":"↓"} Pull
        </button>
        <button onClick={onPush} disabled={busy||pending===0}
          style={{...btnBase,background:pending>0&&!busy?C.brand:C.border,color:pending>0&&!busy?"#fff":C.text3,border:"none",opacity:(busy||pending===0)?.5:1,cursor:(busy||pending===0)?"not-allowed":"pointer"}}>
          {syncStatus==="pushing"?"⟳":"↑"} Push {pending>0?`(${pending})`:""}
        </button>
      </div>
    </div>
  );
}
