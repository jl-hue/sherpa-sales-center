import { useState } from 'react';
import { PASSWORD, USERS } from '../../constants/brand';
import { Logo } from '../ui';

function LoginScreen({onLogin}){
  const [selectedUser,setSelectedUser]=useState(null);
  const [pwd,setPwd]=useState("");
  const [error,setError]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [loading,setLoading]=useState(false);

  function handleLogin(){
    if(!selectedUser){setError("Sélectionne ton compte.");return;}
    if(pwd!==PASSWORD){setError("Mot de passe incorrect. Réessaie.");setPwd("");return;}
    setError("");setLoading(true);
    setTimeout(()=>onLogin(selectedUser),700);
  }

  return <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#0D1F12 0%,#16A34A 60%,#62E58E 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
    {/* Déco */}
    <svg style={{position:"absolute",top:0,left:0,opacity:.08,pointerEvents:"none"}} width="400" height="280" viewBox="0 0 400 280"><path d="-20,80 Q80,20 180,100 Q280,180 380,60" stroke="white" strokeWidth="60" fill="none" strokeLinecap="round"/></svg>
    <svg style={{position:"absolute",bottom:0,right:0,opacity:.06,pointerEvents:"none"}} width="360" height="260" viewBox="0 0 360 260"><path d="0,200 Q100,100 220,160 Q320,210 380,100" stroke="white" strokeWidth="70" fill="none" strokeLinecap="round"/></svg>

    {/* Logo */}
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
      <Logo size={44} white={true}/>
      <span style={{fontSize:28,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",letterSpacing:"-.02em"}}>LES SHERPAS</span>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:32}}>
      <span style={{background:"rgba(255,255,255,.2)",color:"#fff",borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🏔️ Sales Center V5</span>
      <span style={{background:"rgba(255,255,255,.2)",color:"#fff",borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>Accès sécurisé 🔒</span>
    </div>

    {/* Login box */}
    <div style={{width:"100%",maxWidth:460,background:"rgba(255,255,255,.97)",borderRadius:24,padding:36,boxShadow:"0 24px 80px rgba(0,0,0,.25)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:20,fontWeight:900,color:"#18181B",fontFamily:"'Outfit',sans-serif",marginBottom:4}}>Connexion à ton espace</div>
        <div style={{fontSize:13,color:"#71717A"}}>Sélectionne ton compte puis entre le mot de passe</div>
      </div>

      {/* Sélection utilisateur */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:"#3F3F46",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>👤 Ton compte</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {USERS.map(u=>{
            const on=selectedUser?.id===u.id;
            const roleLabel={sales:"Sales 📞",manager:"Manager 👔",formateur:"Formateur 🎓"}[u.role];
            return <button key={u.id} onClick={()=>{setSelectedUser(u);setError("");}} style={{
              padding:"14px 16px",borderRadius:14,
              border:`2px solid ${on?u.color:"#E4E4E7"}`,
              background:on?u.color+"10":"#FAFAFA",
              cursor:"pointer",textAlign:"left",
              transition:"all .15s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:on?u.color:"#E4E4E7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{u.avatar}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:on?u.color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{u.name}</div>
                  <div style={{fontSize:11,color:"#71717A",marginTop:1}}>{roleLabel}</div>
                </div>
              </div>
              {on&&<div style={{width:8,height:8,borderRadius:"50%",background:u.color,position:"absolute",top:10,right:10}}/>}
            </button>;
          })}
        </div>
      </div>

      {/* Mot de passe */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:"#3F3F46",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>🔒 Mot de passe</div>
        <div style={{position:"relative"}}>
          <input
            type={showPwd?"text":"password"}
            value={pwd}
            onChange={e=>{setPwd(e.target.value);setError("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="••••••••••••"
            style={{width:"100%",fontSize:15,fontWeight:600,border:`2px solid ${error?"#E11D48":"#E4E4E7"}`,borderRadius:12,padding:"12px 48px 12px 16px",boxSizing:"border-box",fontFamily:"'Outfit',sans-serif",color:"#18181B",outline:"none",letterSpacing:".05em"}}
          />
          <button onClick={()=>setShowPwd(!showPwd)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#71717A"}}>{showPwd?"🙈":"👁️"}</button>
        </div>
        {error&&<div style={{fontSize:12,color:"#E11D48",marginTop:6,fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>⚠️ {error}</div>}
      </div>

      {/* Bouton */}
      <button onClick={handleLogin} disabled={loading} style={{
        width:"100%",padding:"14px",borderRadius:99,border:"none",
        background:loading?"#A1A1AA":"linear-gradient(135deg,#16A34A,#62E58E)",
        color:"#fff",fontWeight:800,fontSize:15,
        fontFamily:"'Outfit',sans-serif",cursor:loading?"not-allowed":"pointer",
        boxShadow:loading?"none":"0 4px 20px rgba(22,163,74,.4)",
        transition:"all .2s",
      }}>
        {loading?"Connexion en cours…":"Se connecter →"}
      </button>

      <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#A1A1AA"}}>
        Accès réservé à l'équipe Sherpas · Toute tentative est enregistrée
      </div>
    </div>
  </div>;
}

export default LoginScreen;
