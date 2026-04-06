import { useState } from 'react';
import { ST, GC, C, Chips, Pill, Btn } from '../ui';
import { MATIERES } from '../../constants/profTypes';
import { today } from '../../lib/utils';

function SalesRentree({rentree,setRentree,user}){
  const [nom,setNom]=useState("");const [classe,setClasse]=useState("");const [mat,setMat]=useState([]);const [rappel,setRappel]=useState("");const [notes,setNotes]=useState("");const [done,setDone]=useState(false);
  async function submit(){await setRentree({id:Date.now(),date:today(),auteur:user?.name||"Moi",famille:nom,classe,matieres:mat,rappel,notes});setNom("");setClasse("");setMat([]);setRappel("");setNotes("");setDone(true);setTimeout(()=>setDone(false),2500);}
  const can=nom&&classe&&mat.length>0&&rappel;
  const CLASSES=["CP","CE1","CE2","CM1","CM2","6ème","5ème","4ème","3ème","Seconde","Première","Terminale","1ère prépa","2ème prépa","BTS 1","BTS 2"];
  return <div>
    <ST emoji="🏫" sub="Capture les projets de septembre.">Réservoir Rentrée</ST>
    {done&&<div style={{marginBottom:10,padding:"11px 14px",borderRadius:10,background:"#D1FAE5",fontSize:12,fontWeight:600,color:"#15803D"}}>✅ Enregistré !</div>}
    <GC style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Pill color="#fff" bg="rgba(255,255,255,.2)">CA Anticipé Rentrée</Pill><div style={{fontSize:26,fontWeight:900,color:"#fff",marginTop:5,fontFamily:"'Outfit',sans-serif"}}>{(rentree.length*300).toLocaleString()}€</div><div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>{rentree.length} projets × ~300€/mois</div></div><div style={{fontSize:38}}>🏫</div></div></GC>
    <C style={{marginBottom:12}}>
      <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>Nouveau projet</div>
      <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:4}}>Nom de la famille *</div><input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Famille Dupont" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:9,padding:"8px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
      <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:7}}>Classe à la rentrée *</div><Chips options={CLASSES} selected={classe} onChange={setClasse} color="#16A34A" single={true}/></div>
      <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:7}}>Matière(s) *</div><Chips options={MATIERES.slice(0,10)} selected={mat} onChange={setMat} color="#16A34A"/></div>
      <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:4}}>Date de rappel *</div><input type="date" value={rappel} onChange={e=>setRappel(e.target.value)} style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:9,padding:"8px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
      <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:4}}>Notes</div><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:9,padding:"8px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/></div>
      <Btn onClick={submit} disabled={!can} full color="#16A34A" style={{borderRadius:99}}>Enregistrer →</Btn>
    </C>
    {rentree.map(r=><C key={r.id} style={{marginBottom:8,padding:"13px 16px",borderLeft:"4px solid #16A34A"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>👨‍👩‍👧 {r.famille} · {r.classe}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>{(r.matieres||[]).map(m=><Pill key={m} color="#16A34A">{m}</Pill>)}</div>{r.notes&&<div style={{fontSize:11,color:"#71717A",marginTop:4,fontStyle:"italic"}}>"{r.notes}"</div>}</div><Pill color="#16A34A">📅 {r.rappel}</Pill></div></C>)}
  </div>;
}

export default SalesRentree;
