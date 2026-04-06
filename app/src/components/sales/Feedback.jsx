import { useState } from 'react';
import { ST, C, Tog, Chips, Pill, Btn } from '../ui';
import { today } from '../../lib/utils';

function SalesFeedback({feedbacks,setFeedbacks,setSuggestions,user}){
  const already=feedbacks.some(f=>f.date===today()&&f.auteur===user?.name);
  const [anon,setAnon]=useState(false);const [ct,setCt]=useState([]);const [obj,setObj]=useState([]);const [bien,setBien]=useState([]);const [bloque,setBloque]=useState([]);const [conf,setConf]=useState(7);const [sug,setSug]=useState("");const [done,setDone]=useState(false);
  const CLIENT_T=["Parent stressé","Parent rationnel","Parent indécis","Parent pressé","Parent négociateur","Nouveau prospect"];
  const OBJ_O=["Prix","Qualité du prof","Timing","Concurrence","Je dois réfléchir","Pas disponible","Autre"];
  const BIEN_O=["Découverte client","Rapport rapide","Pitch produit","Gestion d'objection","Closing","Reformulation","Dual Path réussi"];
  const BLOQUE_O=["Closing","Gestion objection prix","Gestion objection qualité","Dual Path difficile","Manque de confiance"];
  const auteur=anon?"Anonyme":(user?.name||"Moi");
  async function submit(){
    const newFb={id:Date.now(),date:today(),auteur,anonyme:anon,clientTypes:ct,objections:obj,bien,bloque,confiance:conf,suggestions:sug};
    await setFeedbacks(newFb);
    if(sug.trim()) await setSuggestions({id:Date.now(),date:today(),auteur,type:"feedback",contenu:sug,statut:"pending"});
    setDone(true);
  }
  if(done||already)return <div><ST emoji="💬">Feedback envoyé ✅</ST><C style={{textAlign:"center",padding:40}}><div style={{fontSize:48}}>🎉</div><div style={{fontSize:18,fontWeight:800,color:"#18181B",marginTop:10,fontFamily:"'Outfit',sans-serif"}}>Merci {user?.name} !</div><div style={{fontSize:12,color:"#71717A",marginTop:5}}>Ton retour aide l'équipe à progresser. À demain 👋</div></C></div>;
  const cc=conf>=8?"#16A34A":conf>=5?"#DA4F00":"#E11D48";const ok=ct.length>0&&obj.length>0;
  return <div>
    <ST emoji="💬" sub="Retour quotidien pour améliorer l'équipe.">Mon feedback du jour</ST>
    <C style={{marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>Soumettre anonymement</div><div style={{fontSize:11,color:"#71717A"}}>Le manager voit les données mais pas ton nom</div></div><Tog value={anon} onChange={setAnon}/></C>
    {[["👤 Types de clients *",CLIENT_T,ct,setCt,"#16A34A"],["🛡️ Objections difficiles *",OBJ_O,obj,setObj,"#E11D48"],["✅ Ce qui a bien fonctionné",BIEN_O,bien,setBien,"#16A34A"],["🚧 Ce qui a bloqué",BLOQUE_O,bloque,setBloque,"#DA4F00"]].map(([l,opts,val,setter,c])=><C key={l} style={{marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:9,fontFamily:"'Outfit',sans-serif"}}>{l}</div><Chips options={opts} selected={val} onChange={setter} color={c}/></C>)}
    <C style={{marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:3,fontFamily:"'Outfit',sans-serif"}}>🎯 Niveau de confiance</div><div style={{display:"flex",alignItems:"center",gap:14,marginTop:10}}><input type="range" min={1} max={10} value={conf} onChange={e=>setConf(Number(e.target.value))} style={{flex:1,accentColor:cc}}/><div style={{width:42,height:42,borderRadius:"50%",background:cc+"18",border:`2px solid ${cc}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:cc,flexShrink:0,fontFamily:"'Outfit',sans-serif"}}>{conf}</div></div><div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:11,color:"#A1A1AA"}}>😟</span><span style={{fontSize:11,color:"#A1A1AA"}}>😊</span></div></C>
    <C style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:7,fontFamily:"'Outfit',sans-serif"}}>💡 Suggestions</div><textarea value={sug} onChange={e=>setSug(e.target.value)} placeholder="Une idée, un manque, une amélioration…" rows={3} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:9,padding:"9px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/></C>
    {!ok&&<div style={{fontSize:12,color:"#E11D48",marginBottom:7}}>* Complète les champs obligatoires</div>}
    <Btn onClick={submit} disabled={!ok} full color="#16A34A" style={{padding:"13px",borderRadius:99,fontSize:14}}>Envoyer mon feedback →</Btn>
  </div>;
}

export default SalesFeedback;
