import { C } from '@data/theme';

export const initials = n => n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();

const AV_BG = ["#ffedd5","#dbeafe","#dcfce7","#fce7f3","#ede9fe","#fef9c3"];
const AV_FG = ["#c2410c","#1d4ed8","#15803d","#be185d","#6d28d9","#a16207"];
export const avBg = n => AV_BG[n.charCodeAt(0) % 6];
export const avFg = n => AV_FG[n.charCodeAt(0) % 6];
// kept for backwards compat — returns the foreground color
export const avC = n => avFg(n);

export const fmtD = d => { try{return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}catch{return d;}};
export const fmtS = d => { try{return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});}catch{return d;}};
export const dLeft = d => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  return isNaN(diff) ? null : diff;
};
export const hColor = (pct,status,deadline) => {
  if (status==="Completed")          return C.green;
  if (new Date(deadline)<new Date()) return C.red;
  if (pct===0)                       return C.text3;
  if (pct<30)                        return C.amber;
  return C.brand;
};
