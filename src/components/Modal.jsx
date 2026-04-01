import { C, card } from '@data/theme';

const sh = "0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)";

export default function Modal({title,sub,onClose,children,footer,width=520}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(2px)"}}>
      <div style={{...card,borderRadius:20,width,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",boxShadow:sh}}>
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,background:C.surface,zIndex:1}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.text,letterSpacing:"-.01em"}}>{title}</div>
            {sub&&<div style={{fontSize:12,color:C.text3,marginTop:2}}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{padding:"5px 10px",borderRadius:8,background:C.surf2,border:"none",cursor:"pointer",fontSize:18,fontWeight:400,lineHeight:1,marginLeft:12,flexShrink:0,color:"#64748b"}}>×</button>
        </div>
        <div style={{padding:"20px 24px"}}>{children}</div>
        {footer&&<div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,justifyContent:"flex-end",position:"sticky",bottom:0,background:C.surface}}>{footer}</div>}
      </div>
    </div>
  );
}
