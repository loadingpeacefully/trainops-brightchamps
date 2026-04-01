import { C } from '@data/theme';

export function Tag({label,color,bg}) {
  const c = color || C.text3;
  const background = bg || c+"15";
  return <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12,background,color:c,whiteSpace:"nowrap"}}>{label}</span>;
}

export function StatusTag({status}) {
  const s = (status || '').trim().toLowerCase();
  const map = {
    'in progress':  { color: C.brand,   bg: C.brandLo },
    'completed':    { color: C.green,   bg: C.greenLo },
    'not started':  { color: C.text3,   bg: C.surf3 },
    'active':       { color: C.green,   bg: C.greenLo },
    'inactive':     { color: C.text3,   bg: C.surf3 },
    'offboarding':  { color: '#856404', bg: '#fff3cd' },
  };
  const m = map[s] || { color: C.text3, bg: C.surf3 };
  return <Tag label={status} color={m.color} bg={m.bg}/>;
}
