import { B } from '../../constants/brand';
import { Logo } from '../ui';

function SidebarWithUser({role,page,setPage,onLogout,user,dbReady,loading}){
  const th=B[role];
  const menus={
    sales:[["dash","📊","Tableau de bord"],["lanterne","🔦","Lanterne V5 ✦"],["scripts","📞","Scripts d'appel"],["objections","🛡️","Fiches objections"],["formation","🎓","Formation"],["feedback","💬","Mon feedback"],["demandes","📍","Demandes sans match"],["rentree","🏫","Réservoir Rentrée"]],
    manager:[["m-vue","🧭","Vue d'ensemble"],["m-matching","⚖️","Idéal vs Manuel"],["m-besoins","🎯","Besoins formation"],["m-rentree","📈","Réservoir Rentrée"],["m-feedback","💬","Feedbacks équipe"],["m-progression","👥","Progression"]],
    formateur:[["f-scripts","📞","Éditeur Scripts"],["f-stock","📦","Gestion du Stock"],["f-suggestions","💡","Suggestions équipe"],["f-users","👤","Utilisateurs"]],
  };
  return <div style={{width:226,background:th.sidebar,display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",position:"sticky",top:0}}>
    {/* Header */}
    <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><Logo size={20} white={true}/><span style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",letterSpacing:"-.02em"}}>LES SHERPAS</span></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,background:th.accent+"28",color:th.accent,borderRadius:99,padding:"3px 10px",fontWeight:800,fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>{th.emoji} {th.label}</span><span style={{fontSize:10,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",borderRadius:99,padding:"3px 8px",fontFamily:"'Outfit',sans-serif"}}>V5</span></div>
    </div>
    {/* Nav */}
    <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
      {(menus[role]||[]).map(([id,icon,label])=><button key={id} onClick={()=>setPage(id)} style={{width:"100%",padding:"9px 10px",borderRadius:9,border:"none",background:page===id?th.accent+"22":"transparent",color:page===id?th.accent:"rgba(255,255,255,.42)",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:page===id?700:400,fontFamily:"'Inter',sans-serif",marginBottom:2,borderLeft:`3px solid ${page===id?th.accent:"transparent"}`}}><span style={{fontSize:14}}>{icon}</span>{label}</button>)}
    </nav>
    {/* User footer */}
    <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"5px 8px",borderRadius:7,background:"rgba(255,255,255,.06)"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:loading?"#FCD34D":dbReady?"#4ADE80":"#F87171",boxShadow:`0 0 6px ${loading?"#FCD34D":dbReady?"#4ADE80":"#F87171"}`,flexShrink:0}}/>
        <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"'Outfit',sans-serif"}}>{loading?"Synchro…":dbReady?"Supabase 🟢":"Local 🔴"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:user.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{user.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{user.email}</div>
        </div>
      </div>
      <button onClick={onLogout} style={{width:"100%",padding:"7px",borderRadius:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,textAlign:"center"}}>🚪 Se déconnecter</button>
    </div>
  </div>;
}

export default SidebarWithUser;
