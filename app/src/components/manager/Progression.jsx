import { ST, C, Btn, Pill } from '../ui';
import { USERS } from '../../constants/brand';

function ManagerProgression({matchings}){
  const salesUsers=USERS.filter(u=>u.role==="sales");
  function getStats(name){const m=matchings.filter(x=>x.auteur===name);const followed=m.filter(x=>x.followed).length;const pct=m.length?Math.round((followed/m.length)*100):0;return {total:m.length,followed,pct};}
  const teamData=salesUsers.map(u=>({...u,...getStats(u.name)}));
  return <div><ST emoji="👥" sub="Suivi individuel basé sur les matchings Dual Path.">Progression de l'équipe</ST>
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
      {teamData.map(u=>{const c=u.pct>=70?"#16A34A":u.pct>=40?"#DA4F00":"#E11D48";return <C key={u.id} style={{borderLeft:`4px solid ${c}`}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:44,height:44,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{u.avatar}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif",marginBottom:6}}>{u.name}</div><div style={{height:6,background:"#E4E4E7",borderRadius:99,marginBottom:4}}><div style={{height:6,background:c,borderRadius:99,width:`${u.pct}%`,transition:"width .5s"}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#71717A"}}><span>{u.followed}/{u.total} matchings suivis (Idéal)</span><span style={{color:c,fontWeight:700}}>{u.pct}% suivi Matrice</span></div></div></div></C>;})}
    </div>
    <C style={{background:"#F0FDF4",border:"1px solid #C0EAD3",padding:"14px 16px"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#15803D",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>💡 Actions recommandées</div>
      {teamData.map(u=>{const a=u.pct>=70?"Continuer sur cette lancée ✨":u.pct>=40?"Revoir le Dual Path en 1:1 🎯":"Session coaching prioritaire 🚨";const c=u.pct>=70?"#16A34A":u.pct>=40?"#DA4F00":"#E11D48";return <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:8,borderBottom:"1px solid #C0EAD3"}}><span style={{fontSize:13,color:"#3F3F46",fontWeight:600}}>{u.name}</span><span style={{fontSize:12,color:c,fontWeight:700}}>{a}</span></div>;})}
    </C>
  </div>;
}

export default ManagerProgression;
