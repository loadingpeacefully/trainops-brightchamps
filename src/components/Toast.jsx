import { C } from '@data/theme';

const sh = "0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)";

export default function Toast({toast}) {
  if(!toast) return null;
  const bg   = toast.type==="error"?C.redLo   :toast.type==="warn"?C.amberLo :C.greenLo;
  const color= toast.type==="error"?C.red      :toast.type==="warn"?C.amber   :C.green;
  return <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:bg,border:`1px solid ${color}22`,borderRadius:12,padding:"11px 18px",fontSize:13,fontWeight:600,color,whiteSpace:"nowrap",pointerEvents:"none",boxShadow:sh}}>{toast.msg}</div>;
}
