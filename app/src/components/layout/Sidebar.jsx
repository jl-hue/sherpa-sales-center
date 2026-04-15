import { useState, useEffect } from 'react';
import { B } from '../../constants/brand';
import { Logo } from '../ui';

// ── Widget Heures de reach ──
// 🟢 9h-10h, 12h-14h, 17h+ | 🟠 11h30-12h, 16h-17h | 🔴 10h-11h30, 14h-16h
function getReachStatus(d) {
  const h = d.getHours();
  const m = d.getMinutes();
  const t = h + m / 60;
  if (t >= 9 && t < 10) return { label: "Reach", color: "#4ADE80", bg: "rgba(74,222,128,.18)", emoji: "🟢", desc: "Heure de reach" };
  if (t >= 12 && t < 14) return { label: "Reach", color: "#4ADE80", bg: "rgba(74,222,128,.18)", emoji: "🟢", desc: "Heure de reach" };
  if (t >= 17 && t < 22) return { label: "Reach", color: "#4ADE80", bg: "rgba(74,222,128,.18)", emoji: "🟢", desc: "Heure de reach" };
  if (t >= 10 && t < 11.5) return { label: "Unreach", color: "#F87171", bg: "rgba(248,113,113,.18)", emoji: "🔴", desc: "Heure d'unreach" };
  if (t >= 14 && t < 16) return { label: "Unreach", color: "#F87171", bg: "rgba(248,113,113,.18)", emoji: "🔴", desc: "Heure d'unreach" };
  if (t >= 11.5 && t < 12) return { label: "Médium", color: "#FDE047", bg: "rgba(253,224,71,.22)", emoji: "🟡", desc: "Heure médium" };
  if (t >= 16 && t < 17) return { label: "Médium", color: "#FDE047", bg: "rgba(253,224,71,.22)", emoji: "🟡", desc: "Heure médium" };
  return { label: "Hors plage", color: "rgba(255,255,255,.4)", bg: "rgba(255,255,255,.06)", emoji: "⚪", desc: "Hors plages de reach" };
}

function ClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000); // update every second
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const s = getReachStatus(now);
  return (
    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,.08)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif", letterSpacing: "-.02em" }}>{hh}:{mm}<span style={{ fontSize: 12, opacity: .6 }}>:{ss}</span></div>
        <span style={{ fontSize: 15 }}>{s.emoji}</span>
      </div>
      <div style={{ padding: "4px 8px", borderRadius: 6, background: s.bg, display: "inline-block" }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: s.color, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</span>
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", marginTop: 5, lineHeight: 1.4 }}>{s.desc}</div>
    </div>
  );
}

function SidebarWithUser({role,page,setPage,setSpace,onLogout,user,dbReady,loading}){
  const th=B[role];
  const menus={
    sales:[["dash","📊","Tableau de bord"],["planning","📋","Mon planning ✦"],["objectifs","🏆","Objectifs & Classement"],["stats","📈","Mes stats"],["lanterne","🔦","Lanterne V5 ✦"],["ressources","📚","Ressources"],["formation","🎓","Formation"],["feedback","💬","Mon feedback"]],
    manager:[["m-vue","🧭","Vue d'ensemble"],["m-equipe","👥","Gestion équipe ✦"],["m-edt","📅","Emploi du temps ✦"],["m-plan","🪑","Plan de table ✦"],["m-carte","🗺️","Carte demandes ✦"],["m-stats","📈","Stats équipe ✦"],["m-objectifs","🎯","Objectifs & Défis ✦"],["m-notif","📧","Notifications email"],["m-besoins","🎯","Besoins formation"],["m-feedback","💬","Feedbacks équipe"],["m-progression","👥","Progression"]],
    formateur:[["f-scripts","📞","Éditeur Scripts"],["f-formations","🎓","Éditeur Formations"],["f-stock","📦","Gestion du Stock"],["f-suggestions","💡","Suggestions équipe"],["f-users","👤","Utilisateurs"]],
  };
  return <div style={{width:226,background:th.sidebar,display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",position:"fixed",top:0,left:0,zIndex:30}}>
    {/* Header */}
    <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><Logo size={20} white={true}/><span style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",letterSpacing:"-.02em"}}>LES SHERPAS</span></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,background:th.accent+"28",color:th.accent,borderRadius:99,padding:"3px 10px",fontWeight:800,fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>{th.emoji} {th.label}</span><span style={{fontSize:10,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",borderRadius:99,padding:"3px 8px",fontFamily:"'Outfit',sans-serif"}}>V5</span></div>
    </div>
    {/* Switcher d'espace (manager + admin) */}
    {(user.role === "manager" || user.role === "admin") && setSpace && (
      <div style={{padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>🔀 Changer d'espace</div>
        <div style={{display:"flex",gap:4}}>
          {[
            {sp:"sales",icon:"📞",label:"Sales",page:"dash"},
            {sp:"manager",icon:"👔",label:"Manager",page:"m-vue"},
            {sp:"formateur",icon:"🎓",label:"Formateur",page:"f-scripts"},
          ].map(({sp,icon,label,page:pg})=>{
            const on = role === sp;
            return <button key={sp} onClick={()=>{setSpace(sp);setPage(pg);}} style={{
              flex:1,padding:"6px 4px",borderRadius:6,border:"none",cursor:"pointer",
              background:on?"rgba(255,255,255,.14)":"transparent",
              color:on?"#fff":"rgba(255,255,255,.4)",
              fontSize:9,fontWeight:700,fontFamily:"'Outfit',sans-serif",
              textAlign:"center",transition:"all .15s",
            }}>
              <div style={{fontSize:13,marginBottom:1}}>{icon}</div>
              {label}
            </button>;
          })}
        </div>
      </div>
    )}
    {/* Nav */}
    <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
      {(menus[role]||[]).map(([id,icon,label])=><button key={id} onClick={()=>setPage(id)} style={{width:"100%",padding:"9px 10px",borderRadius:9,border:"none",background:page===id?th.accent+"22":"transparent",color:page===id?th.accent:"rgba(255,255,255,.42)",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:page===id?700:400,fontFamily:"'Inter',sans-serif",marginBottom:2,borderLeft:`3px solid ${page===id?th.accent:"transparent"}`}}><span style={{fontSize:14}}>{icon}</span>{label}</button>)}
    </nav>
    <ClockWidget />
    {/* User footer */}
    <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"5px 8px",borderRadius:7,background:"rgba(255,255,255,.06)"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:loading?"#FCD34D":dbReady?"#4ADE80":"#F87171",boxShadow:`0 0 6px ${loading?"#FCD34D":dbReady?"#4ADE80":"#F87171"}`,flexShrink:0}}/>
        <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"'Outfit',sans-serif"}}>{loading?"Synchro…":dbReady?"Supabase 🟢":"Local 🔴"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:user.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{user.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:5}}>{user.name}{user.role==="admin" && <span title="Gestionnaire du site" style={{fontSize:9,fontWeight:900,background:"linear-gradient(135deg,#FBBF24,#F59E0B)",color:"#451A03",padding:"1px 6px",borderRadius:99,letterSpacing:".04em",textTransform:"uppercase"}}>👑 Admin</span>}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{user.email}</div>
        </div>
      </div>
      <button onClick={onLogout} style={{width:"100%",padding:"7px",borderRadius:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,textAlign:"center"}}>🚪 Se déconnecter</button>
    </div>
  </div>;
}

export default SidebarWithUser;
