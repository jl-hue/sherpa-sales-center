import { useState } from 'react';
import { ST, GC, C, Pill, Btn } from '../ui';
import { FORMATION_DEFAULT } from '../../constants/data';

function SalesFormation({formations, progress={}, setProgress, user}){
  const F = formations && Object.keys(formations).length > 0 ? formations : FORMATION_DEFAULT;
  const [tab,setTab]=useState(Object.keys(F)[0]||"sales");
  const [showScore,setShowScore]=useState(false);
  const [scoreVal,setScoreVal]=useState(80);
  const [completingMod,setCompletingMod]=useState(null);

  const userId = user?.id || "unknown";
  const userProgress = progress[userId] || {};

  function isModDone(moduleId){ return userProgress[moduleId]?.done === true; }
  function getModScore(moduleId){ return userProgress[moduleId]?.score; }

  const pill=F[tab]||Object.values(F)[0];
  if(!pill) return <div><ST emoji="🎓">Formation</ST><C style={{textAlign:"center",padding:32,color:"#A1A1AA"}}>Aucune formation disponible.</C></div>;

  const allModules = Object.values(F).flatMap(p=>p.modules);
  const total = allModules.length;
  const done = allModules.filter(m=>isModDone(m.id)).length;

  function completeModule(){
    if(!completingMod || !setProgress) return;
    const next = {...progress};
    if(!next[userId]) next[userId] = {};
    next[userId] = {...next[userId], [completingMod]: {done:true, score:scoreVal}};
    setProgress(next);
    setCompletingMod(null);
    setShowScore(false);
    setScoreVal(80);
  }

  return <div>
    <ST emoji="🎓" sub={`${Object.keys(F).length} piliers de formation disponibles.`}>Formation</ST>
    <GC style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Pill color="#fff" bg="rgba(255,255,255,.2)">Ma progression</Pill><div style={{fontSize:28,fontWeight:900,color:"#fff",marginTop:5,fontFamily:"'Outfit',sans-serif"}}>{total>0?Math.round((done/total)*100):0}%</div><div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>{done}/{total} modules terminés</div></div><div style={{fontSize:40}}>🎓</div></div></GC>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{Object.entries(F).map(([k,v])=>{
      const pilDone=v.modules.filter(m=>isModDone(m.id)).length;
      return <button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${tab===k?v.color:"#E4E4E7"}`,background:tab===k?v.color:"#fff",color:tab===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.icon} {v.title} <span style={{opacity:.7,fontSize:11}}>({pilDone}/{v.modules.length})</span></button>;
    })}</div>
    <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>{pill.modules.map((m,i)=>{
      const isDone=isModDone(m.id);
      const score=getModScore(m.id);
      const doneCount=pill.modules.filter(x=>isModDone(x.id)).length;
      const isCurrent=!isDone&&i===pill.modules.findIndex(x=>!isModDone(x.id));
      const isCompleting=completingMod===m.id;
      return <div key={m.id||i}>
        <C style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",opacity:!isDone&&!isCurrent?.5:1,borderLeft:`4px solid ${isDone?pill.color:isCurrent?pill.color+"70":"#E4E4E7"}`}}>
          <div style={{width:34,height:34,borderRadius:10,background:isDone?pill.color+"18":"#F4F4F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isDone?"✅":isCurrent?"▶️":"🔒"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{m.title}</div>
            <div style={{fontSize:11,color:"#A1A1AA",marginTop:1}}>⏱ {m.duration}</div>
            {m.description&&<div style={{fontSize:11,color:"#71717A",marginTop:2,fontStyle:"italic"}}>{m.description}</div>}
          </div>
          {isDone&&score&&<Pill color="#16A34A">{score}%</Pill>}
          {isCurrent&&!isCompleting&&<Btn sm color={pill.color} onClick={()=>{setCompletingMod(m.id);setShowScore(true);}}>Terminer ✓</Btn>}
        </C>
        {isCompleting&&showScore&&<div style={{margin:"8px 0",padding:14,background:pill.color+"08",borderRadius:10,border:`1px solid ${pill.color}35`}}>
          <div style={{fontSize:12,fontWeight:700,color:pill.color,marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>Valider le module</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#71717A",marginBottom:6}}>Score obtenu (optionnel)</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min={0} max={100} value={scoreVal} onChange={e=>setScoreVal(Number(e.target.value))} style={{flex:1,accentColor:pill.color}}/>
              <div style={{width:42,height:42,borderRadius:"50%",background:pill.color+"18",border:`2px solid ${pill.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:pill.color,flexShrink:0,fontFamily:"'Outfit',sans-serif"}}>{scoreVal}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <Btn sm color={pill.color} onClick={completeModule}>Valider ✓</Btn>
            <Btn sm outline color="#71717A" onClick={()=>{setCompletingMod(null);setShowScore(false);}}>Annuler</Btn>
          </div>
        </div>}
      </div>;
    })}</div>
    <div style={{fontWeight:800,fontSize:14,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>⚡ Training — Simulations</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[["🔬","Labo des Objections","Objections aléatoires avec timer"],["🎯","Le Juste Match","Diagnostic dual path en conditions réelles"],["📞","Roleplay Feature-to-Benefit","Génère le bon argument au bon moment"]].map(([ic,t,d])=><C key={t} style={{cursor:"pointer",borderTop:`4px solid #16A34A`,padding:14}}><div style={{fontSize:24,marginBottom:6}}>{ic}</div><div style={{fontSize:12,fontWeight:700,color:"#18181B",marginBottom:3,fontFamily:"'Outfit',sans-serif"}}>{t}</div><div style={{fontSize:11,color:"#71717A",lineHeight:1.5}}>{d}</div></C>)}</div>
  </div>;
}

export default SalesFormation;
