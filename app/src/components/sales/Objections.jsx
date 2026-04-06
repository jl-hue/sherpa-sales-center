import React, { useState } from 'react';
import { ST, C, Pill, Btn, CopyBtn } from '../ui';
import { today } from '../../lib/utils';

function SalesObjections({objections,setSuggestions}){
  const [sel,setSel]=useState(null);const [showSug,setShowSug]=useState(false);const [sugText,setSugText]=useState("");const [done,setDone]=useState(false);
  async function submit(){await setSuggestions({id:Date.now(),date:today(),auteur:"Moi",type:"objection",contenu:sugText,statut:"pending"});setSugText("");setShowSug(false);setDone(true);setTimeout(()=>setDone(false),2000);}
  return <div>
    <ST emoji="🛡️" sub="Réponses structurées aux objections.">Fiches objections</ST>
    {done&&<div style={{marginBottom:10,padding:"11px 14px",borderRadius:10,background:"#D1FAE5",border:"1px solid #86EFAC",fontSize:12,fontWeight:600,color:"#15803D"}}>✅ Suggestion envoyée au Formateur !</div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{objections.map(o=><button key={o.id} onClick={()=>setSel(sel?.id===o.id?null:o)} style={{padding:"13px 14px",borderRadius:14,border:sel?.id===o.id?`2px solid ${o.color}`:"1px solid #E4E4E7",background:sel?.id===o.id?o.color+"08":"#fff",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><div style={{width:38,height:38,borderRadius:12,background:o.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{o.icon}</div><div><div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{o.label}</div><div style={{fontSize:11,color:"#A1A1AA",marginTop:1}}>Voir la réponse →</div></div></button>)}</div>
    {sel&&<C style={{borderTop:`4px solid ${sel.color}`,marginBottom:12}}><div style={{fontSize:15,fontWeight:800,color:"#18181B",marginBottom:14,fontFamily:"'Outfit',sans-serif"}}>{sel.icon} {sel.label}</div>{[["🔄 Reformulation",sel.ref,"#0B68B4"],["💪 Argument",sel.arg,sel.color],["↩️ Rebond",sel.rebond,"#16A34A"]].map(([l,t,c])=><div key={l} style={{background:c+"08",borderRadius:10,padding:"11px 14px",borderLeft:`4px solid ${c}`,marginBottom:9}}><Pill color={c}>{l}</Pill><div style={{fontSize:13,color:"#3F3F46",lineHeight:1.7,fontStyle:"italic",marginTop:6}}>{t}</div></div>)}</C>}
    <C style={{background:"#F0FDF4",border:"1px solid #C0EAD3",padding:"13px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:12,fontWeight:600,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>💡 Une objection manque ?</div><Btn onClick={()=>setShowSug(!showSug)} sm color="#16A34A" outline>Suggérer</Btn></div>{showSug&&<div style={{marginTop:10}}><textarea value={sugText} onChange={e=>setSugText(e.target.value)} placeholder="Décris l'objection et la réponse suggérée..." rows={3} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:9,padding:"9px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/><div style={{display:"flex",gap:7,marginTop:7}}><Btn onClick={submit} disabled={!sugText.trim()} sm color="#16A34A">Envoyer</Btn><Btn onClick={()=>setShowSug(false)} outline sm color="#71717A">Annuler</Btn></div></div>}</C>
  </div>;
}

export default SalesObjections;
