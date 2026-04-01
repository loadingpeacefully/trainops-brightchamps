import { C, F } from '@data/theme';

export default function SectionHeader({title,sub,action}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-.02em",fontFamily:F.display}}>{title}</h2>
        {sub&&<p style={{margin:"3px 0 0",fontSize:13,color:C.text3}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
