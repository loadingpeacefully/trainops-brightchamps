import { C } from '@data/theme';

export default function EmptyState({icon,title,sub}) {
  return (
    <div style={{padding:"48px 24px",textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:12}}>{icon}</div>
      <div style={{fontSize:14,fontWeight:700,color:C.text2,marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,color:C.text3,maxWidth:280,margin:"0 auto"}}>{sub}</div>
    </div>
  );
}
