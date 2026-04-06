import { useState } from 'react';
import { ST, C, Chips, Pill, Btn } from '../ui';
import { MATIERES, NIVEAUX, PROF_TYPES } from '../../constants/profTypes';
import { today } from '../../lib/utils';

function SalesDemandes({demandes,setDemandes,user}){
  const [cp,setCp]=useState("");const [ville,setVille]=useState("");const [mat,setMat]=useState([]);const [niv,setNiv]=useState("");const [typo,setTypo]=useState([]);const [ok2,setOk2]=useState(false);
  async function submit(){await setDemandes({id:Date.now(),date:today(),auteur:user?.name||"Moi",cp,ville,matieres:mat,niveau:niv,typo});setCp("");setVille("");setMat([]);setNiv("");setTypo([]);setOk2(true);setTimeout(()=>setOk2(false),2500);}
  const can=cp.length===5&&mat.length>0&&niv&&typo.length>0;
  return <div>
    <ST emoji="📍" sub="Renseigne chaque famille sans match.">Demandes sans match</ST>
    {ok2&&<div style={{marginBottom:10,padding:"11px 14px",borderRadius:10,background:"#D1FAE5",fontSize:12,fontWeight:600,color:"#15803D"}}>✅ Enregistré !</div>}
    <C style={{marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>📍 Localisation</div><div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:8}}><div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Code postal *</div><input value={cp} onChange={e=>setCp(e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="75016" maxLength={5} style={{width:"100%",fontSize:14,fontWeight:700,border:"1px solid #E4E4E7",borderRadius:9,padding:"9px 12px",boxSizing:"border-box",letterSpacing:".08em",fontFamily:"'Outfit',sans-serif"}}/></div><div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Ville</div><input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Paris 16e" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:9,padding:"9px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div></div></C>
    <C style={{marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:9,fontFamily:"'Outfit',sans-serif"}}>📚 Matière(s) *</div><Chips options={MATIERES} selected={mat} onChange={setMat} color="#16A34A"/></C>
    <C style={{marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:9,fontFamily:"'Outfit',sans-serif"}}>🎓 Niveau *</div><Chips options={NIVEAUX} selected={niv} onChange={setNiv} color="#16A34A" single={true}/></C>
    <C style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:9,fontFamily:"'Outfit',sans-serif"}}>👤 Profil souhaité *</div><Chips options={PROF_TYPES} selected={typo} onChange={setTypo} color="#0B68B4"/></C>
    {!can&&<div style={{fontSize:12,color:"#E11D48",marginBottom:7}}>* Code postal 5 chiffres + matière + niveau + profil requis</div>}
    <Btn onClick={submit} disabled={!can} full color="#16A34A" style={{padding:"12px",borderRadius:99,fontSize:13}}>Enregistrer →</Btn>
    {demandes.filter(d=>d.date===today()).length>0&&<div style={{marginTop:16}}><div style={{fontSize:12,fontWeight:700,color:"#3F3F46",marginBottom:7,fontFamily:"'Outfit',sans-serif"}}>Saisies d'aujourd'hui</div>{demandes.filter(d=>d.date===today()).map(d=><C key={d.id} style={{marginBottom:7,padding:"11px 14px",borderLeft:"4px solid #16A34A"}}><div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📍 {d.cp} {d.ville&&`— ${d.ville}`}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}><Pill color="#16A34A">{d.niveau}</Pill>{(d.matieres||[]).map(m=><Pill key={m} color="#0B68B4">{m}</Pill>)}</div></C>)}</div>}
  </div>;
}

export default SalesDemandes;
