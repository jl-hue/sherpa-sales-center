import React, { useState } from 'react';
import { ST, C, Pill } from '../ui';

function SalesScripts({scripts}){
  const [phase,setPhase]=useState("intro");const p=scripts[phase];
  return <div>
    <ST emoji="📞" sub="Suis les étapes de l'appel.">Scripts d'appel</ST>
    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>{Object.entries(scripts).map(([k,v])=><button key={k} onClick={()=>setPhase(k)} style={{padding:"8px 18px",borderRadius:99,border:`2px solid ${phase===k?v.color:"#E4E4E7"}`,background:phase===k?v.color:"#fff",color:phase===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.title}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{p.steps.map((s,i)=><C key={i} style={{borderLeft:`4px solid ${p.color}`,padding:"14px 18px"}}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><div style={{width:26,height:26,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:11,flexShrink:0,fontFamily:"'Outfit',sans-serif"}}>{i+1}</div><div><Pill color={p.color}>{s.label}</Pill><div style={{fontSize:13,color:"#3F3F46",lineHeight:1.7,fontStyle:"italic",marginTop:7}}>"{s.text}"</div></div></div></C>)}</div>
  </div>;
}

export default SalesScripts;
