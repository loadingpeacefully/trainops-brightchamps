import { useState, useEffect } from 'react';
import { C, F } from '@data/theme';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const email = session.user.email || '';
        if (!email.endsWith('@brightchamps.com')) {
          supabase.auth.signOut();
          setError('Access restricted to BrightChamps team members only.');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setError(null);
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.canvas,fontFamily:F.body}}>
      <div style={{width:400,background:"#FFFFFF",borderRadius:22,padding:48,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:48,height:48,borderRadius:12,background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🎓</div>
          <div style={{fontFamily:F.display,fontSize:24,fontWeight:800,color:C.text,marginTop:16}}>TrainOS</div>
          <div style={{fontSize:13,color:C.text3,marginTop:4}}>Admin Console · BrightChamps</div>
        </div>
        <div style={{marginTop:32}}>
          <button onClick={handleLogin} style={{width:"100%",padding:12,background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14,fontWeight:600,color:C.text,fontFamily:F.body,transition:"background .12s"}} onMouseEnter={e=>{e.currentTarget.style.background=C.surf2}} onMouseLeave={e=>{e.currentTarget.style.background="#FFFFFF"}}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
        {error && <div style={{textAlign:"center",fontSize:13,color:C.red,marginTop:16}}>{error}</div>}
        <div style={{textAlign:"center",fontSize:13,color:C.text3,marginTop:20}}>Restricted to BrightChamps team members</div>
      </div>
    </div>
  );
}
