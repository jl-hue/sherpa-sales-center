import { useState } from 'react';
import { ST, C, Pill } from '../ui';
import { USERS } from '../../constants/brand';

function ManagerFeedbacks({feedbacks}){
  const [filter,setFilter]=useState("tous");
  const filtered=
    filter==="julien"   ? feedbacks.filter(f=>f.auteur==="Julien") :
    filter==="jonathan" ? feedbacks.filter(f=>f.auteur==="Jonathan") :
    filter==="anonymes" ? feedbacks.filter(f=>f.anonyme) :
    feedbacks;

  function getUserColor(auteur){
    const u=USERS.find(x=>x.name===auteur);
    return u?u.color:"#71717A";
  }
  function getUserAvatar(auteur,anonyme){
    if(anonyme) return "?";
    const u=USERS.find(x=>x.name===auteur);
    return u?u.avatar:auteur[0];
  }

  const tabs=[
    ["tous","Tous 📋",feedbacks.length],
    ["julien","Julien 📞",feedbacks.filter(f=>f.auteur==="Julien").length],
    ["jonathan","Jonathan 📞",feedbacks.filter(f=>f.auteur==="Jonathan").length],
    ["anonymes","Anonymes 🕵️",feedbacks.filter(f=>f.anonyme).length],
  ];

  return <div>
    <ST emoji="💬" sub="Tous les feedbacks de l'équipe — filtrables par Sales.">Feedbacks équipe</ST>

    {/* Stats rapides */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {USERS.filter(u=>u.role==="sales").map(u=>{
        const mine=feedbacks.filter(f=>f.auteur===u.name);
        const avgC=mine.length?Math.round(mine.reduce((s,f)=>s+f.confiance,0)/mine.length*10)/10:0;
        const cc=avgC>=7?"#16A34A":avgC>=5?"#DA4F00":"#E11D48";
        return <C key={u.id} style={{padding:14,textAlign:"center",borderTop:`3px solid ${u.color}`}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",margin:"0 auto 6px"}}>{u.avatar}</div>
          <div style={{fontSize:18,fontWeight:900,color:cc,fontFamily:"'Outfit',sans-serif"}}>{avgC}/10</div>
          <div style={{fontSize:11,color:"#71717A",marginTop:1}}>{u.name} · confiance</div>
          <div style={{fontSize:10,color:"#A1A1AA"}}>{mine.length} feedback{mine.length>1?"s":""}</div>
        </C>;
      })}
      {(()=>{const avgC=feedbacks.length?Math.round(feedbacks.reduce((s,f)=>s+f.confiance,0)/feedbacks.length*10)/10:0;const cc=avgC>=7?"#16A34A":avgC>=5?"#DA4F00":"#E11D48";return <C key="avg" style={{padding:14,textAlign:"center",borderTop:"3px solid #7C3AED"}}><div style={{fontSize:22,marginBottom:6}}>📊</div><div style={{fontSize:18,fontWeight:900,color:cc,fontFamily:"'Outfit',sans-serif"}}>{avgC}/10</div><div style={{fontSize:11,color:"#71717A",marginTop:1}}>Moyenne équipe</div><div style={{fontSize:10,color:"#A1A1AA"}}>{feedbacks.length} feedbacks total</div></C>;})()}
      {(()=>{const anon=feedbacks.filter(f=>f.anonyme).length;return <C key="anon" style={{padding:14,textAlign:"center",borderTop:"3px solid #6B7280"}}><div style={{fontSize:22,marginBottom:6}}>🕵️</div><div style={{fontSize:18,fontWeight:900,color:"#6B7280",fontFamily:"'Outfit',sans-serif"}}>{anon}</div><div style={{fontSize:11,color:"#71717A",marginTop:1}}>Anonymes</div><div style={{fontSize:10,color:"#A1A1AA"}}>{feedbacks.length>0?Math.round((anon/feedbacks.length)*100):0}% du total</div></C>;})()}
    </div>

    {/* Onglets filtre */}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {tabs.map(([k,l,n])=><button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:99,border:`2px solid ${filter===k?"#16A34A":"#E4E4E7"}`,background:filter===k?"#16A34A":"#fff",color:filter===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:6}}>{l}<span style={{background:filter===k?"rgba(255,255,255,.3)":"#F4F4F5",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{n}</span></button>)}
    </div>

    {/* Liste */}
    {filtered.length===0&&<C style={{textAlign:"center",padding:32,color:"#A1A1AA",fontSize:13}}>Aucun feedback pour ce filtre.</C>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {filtered.map(f=>{
        const cc=f.confiance>=8?"#16A34A":f.confiance>=5?"#DA4F00":"#E11D48";
        const uColor=getUserColor(f.auteur);
        const avatar=getUserAvatar(f.auteur,f.anonyme);
        return <C key={f.id} style={{borderLeft:`4px solid ${cc}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:f.anonyme?"#E4E4E7":uColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",fontFamily:"'Outfit',sans-serif"}}>{avatar}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{f.auteur}</div>
                <div style={{fontSize:10,color:"#A1A1AA"}}>📅 {f.date}</div>
              </div>
            </div>
            <Pill color={cc}>Confiance : {f.confiance}/10</Pill>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:f.suggestions?8:0}}>
            {[["👤 Clients",f.clientTypes,"#16A34A"],["🛡️ Objections",f.objections,"#E11D48"],["✅ Points forts",f.bien||[],"#16A34A"],["🚧 Blocages",f.bloque,"#DA4F00"]].map(([icon,items,c])=>(
              <div key={icon} style={{background:c+"08",borderRadius:8,padding:"9px 10px"}}>
                <div style={{fontSize:11,fontWeight:700,color:c,marginBottom:4,fontFamily:"'Outfit',sans-serif"}}>{icon}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{(items||[]).length===0?<span style={{fontSize:10,color:"#A1A1AA"}}>—</span>:(items||[]).map(i=><span key={i} style={{fontSize:10,padding:"1px 6px",borderRadius:99,background:c+"15",color:c,fontWeight:600}}>{i}</span>)}</div>
              </div>
            ))}
          </div>
          {f.suggestions&&<div style={{fontSize:11,color:"#3F3F46",background:"#F8FFF9",borderRadius:7,padding:"8px 10px",fontStyle:"italic",borderLeft:"2px solid #C0EAD3"}}>💡 "{f.suggestions}"</div>}
        </C>;
      })}
    </div>
  </div>;
}

export default ManagerFeedbacks;
