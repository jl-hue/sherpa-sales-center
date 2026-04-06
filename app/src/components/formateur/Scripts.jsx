import { useState } from 'react';
import { ST, C, Pill, Btn } from '../ui';

function FormateurScripts({scripts,setScripts}){
  const [phase,setPhase]=useState("intro");const [ed,setEd]=useState(null);const [val,setVal]=useState("");const p=scripts[phase];
  return <div>
    <ST emoji="📞" sub="Modifie les scripts visibles par les Sales.">Éditeur Scripts</ST>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{Object.entries(scripts).map(([k,v])=><button key={k} onClick={()=>setPhase(k)} style={{padding:"7px 16px",borderRadius:99,border:`2px solid ${phase===k?v.color:"#E4E4E7"}`,background:phase===k?v.color:"#fff",color:phase===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.title}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>{p.steps.map((s,i)=><C key={i} style={{borderLeft:`4px solid ${p.color}`,padding:"13px 16px"}}>{ed===i?<div><input defaultValue={s.label} style={{fontSize:10,fontWeight:800,color:p.color,textTransform:"uppercase",border:"none",borderBottom:`1px solid ${p.color}`,outline:"none",background:"transparent",marginBottom:7,width:"100%",fontFamily:"'Outfit',sans-serif"}} onChange={e=>{const u={...scripts};u[phase].steps[i].label=e.target.value;setScripts(u);}}/><textarea value={val} onChange={e=>setVal(e.target.value)} rows={3} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:9,padding:"9px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/><div style={{display:"flex",gap:7,marginTop:7}}><Btn onClick={()=>{const u={...scripts};u[phase].steps[i].text=val;setScripts(u);setEd(null);}} sm color="#16A34A">Sauvegarder</Btn><Btn onClick={()=>setEd(null)} outline sm color="#71717A">Annuler</Btn></div></div>:<div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{flex:1}}><Pill color={p.color}>{s.label}</Pill><div style={{fontSize:13,color:"#3F3F46",lineHeight:1.7,fontStyle:"italic",marginTop:6}}>"{s.text}"</div></div><div style={{display:"flex",gap:4}}><button onClick={()=>{setEd(i);setVal(s.text);}} style={{padding:"4px 8px",borderRadius:7,border:"1px solid #E4E4E7",background:"#fff",fontSize:11,cursor:"pointer"}}>✏️</button><button onClick={()=>{const u={...scripts};u[phase].steps.splice(i,1);setScripts(u);}} style={{padding:"4px 8px",borderRadius:7,border:"1px solid #FEE2E2",background:"#FFF1F2",fontSize:11,cursor:"pointer",color:"#E11D48"}}>🗑️</button></div></div>}</C>)}
      <button onClick={()=>{const u={...scripts};u[phase].steps.push({label:"Nouvelle étape",text:"Texte du script..."});setScripts(u);}} style={{padding:"11px",borderRadius:10,border:"2px dashed #C0EAD3",background:"#F0FDF4",fontSize:12,color:"#16A34A",cursor:"pointer",fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>+ Ajouter une étape</button>
    </div>
  </div>;
}

export default FormateurScripts;
