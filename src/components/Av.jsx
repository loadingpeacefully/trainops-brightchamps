import { avBg, avFg, initials } from '@data/helpers';

export default function Av({name,size=32}) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:avBg(name),color:avFg(name),
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.33,
      fontWeight:700,flexShrink:0,letterSpacing:"-.02em",fontFamily:"inherit"}}>
      {initials(name)}
    </div>
  );
}
