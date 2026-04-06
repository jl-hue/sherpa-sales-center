import { ST, C, Stat, Pill, Btn } from '../ui';

function FormateurSuggestions({suggestions,setSuggestions,updateStatut,deleteSugg}){
  const pending=suggestions.filter(s=>s.statut==="pending");const approved=suggestions.filter(s=>s.statut==="approved");
  async function approve(id){if(updateStatut)await updateStatut(id,"approved");else setSuggestions(p=>p.map(s=>s.id===id?{...s,statut:"approved"}:s));}
  async function reject(id){if(deleteSugg)await deleteSugg(id);else setSuggestions(p=>p.filter(s=>s.id!==id));}
  return <div>
    <ST emoji="💡" sub="Valide les suggestions remontées par les Sales.">Suggestions équipe</ST>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}><Stat icon="⏳" label="En attente" value={pending.length} color="#DA4F00"/><Stat icon="✅" label="Approuvées" value={approved.length} color="#16A34A"/></div>
    {pending.map(s=><C key={s.id} style={{marginBottom:9,borderLeft:"4px solid #DA4F00"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><Pill color="#DA4F00">{s.type}</Pill><span style={{fontSize:10,color:"#A1A1AA"}}>{s.auteur} · {s.date}</span></div><div style={{fontSize:12,color:"#3F3F46",background:"#FFF7F0",borderRadius:9,padding:"10px 12px",marginBottom:9,lineHeight:1.6,fontStyle:"italic"}}>"{s.contenu}"</div><div style={{display:"flex",gap:7}}><Btn onClick={()=>approve(s.id)} sm color="#16A34A">✓ Approuver</Btn><Btn onClick={()=>reject(s.id)} outline sm color="#E11D48">✗ Rejeter</Btn></div></C>)}
    {approved.map(s=><C key={s.id} style={{marginBottom:7,padding:"11px 14px",borderLeft:"4px solid #16A34A",background:"#F0FDF4"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>{s.auteur} · {s.date}</div><div style={{fontSize:12,color:"#3F3F46",marginTop:3,fontStyle:"italic"}}>"{s.contenu}"</div></div><Pill color="#16A34A">Intégré ✓</Pill></div></C>)}
  </div>;
}

export default FormateurSuggestions;
