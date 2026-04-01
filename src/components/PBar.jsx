import { C } from '@data/theme';

export default function PBar({pct,h=5,color}) {
  const c=color||(pct>0?C.brand:C.border);
  return <div style={{flex:1,height:h,borderRadius:h,background:C.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:c,borderRadius:h,transition:"width .5s ease"}}/></div>;
}
