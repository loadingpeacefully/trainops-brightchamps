export const F = {
  display: "'Nunito Sans','Nunito',system-ui,sans-serif",
  body:    "'Poppins',system-ui,sans-serif",
  mono:    "'SF Mono','Fira Code','Courier New',monospace",
};

export const C = {
  canvas:"#FAFAFA",  surface:"#FCFCFC",  surf2:"#F5F5F5",  surf3:"#EEEEEE",
  border:"#E8E8E8",  border2:"#D0D0D0",
  text:"#0D1D2D",    text2:"#4D5D6D",    text3:"#6A737D",
  brand:"#4360FD",   brandLo:"#EEF1FF",  brandXlo:"#E5E9FF",
  green:"#16a34a",   greenLo:"#f0fdf4",
  red:"#dc2626",     redLo:"#fef2f2",
  amber:"#d97706",   amberLo:"#fffbeb",
  blue:"#3b82f6",    blueLo:"#eff6ff",
  purple:"#7c3aed",  purpleLo:"#f5f3ff",
};

const sh = "0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)";

export const card  = { background:"#FFFFFF", borderRadius:22, border:`1px solid ${C.border}`, boxShadow:sh };
export const field = { padding:"9px 13px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13,
                       color:C.text2, background:"#ffffff", width:"100%", boxSizing:"border-box",
                       fontFamily:"inherit", outline:"none" };
export const pill  = (active, color=C.text3) => ({
  padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600,
  border:`1.5px solid ${active?color:C.border}`,
  background:active?color+"15":"#ffffff", color:active?color:C.text3,
  cursor:"pointer", transition:"all .13s"
});
export const mkBtn = (variant="secondary", r=9) => {
  const base = { borderRadius:r, fontSize:13, fontWeight:700, border:"none", cursor:"pointer",
                 fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6,
                 transition:"opacity .12s", padding:"8px 18px" };
  if (variant==="primary")   return { ...base, background:C.brand, color:"#ffffff" };
  if (variant==="secondary") return { ...base, background:"#f1f5f9", color:"#475569", border:`1px solid ${C.border}` };
  if (variant==="ghost")     return { ...base, background:"transparent", color:C.text3, border:"none" };
  if (variant==="danger")    return { ...base, background:C.redLo, color:C.red, border:`1px solid ${C.red}22` };
  if (variant==="warn")      return { ...base, background:C.amberLo, color:C.amber, border:`1px solid ${C.amber}22` };
  return base;
};
