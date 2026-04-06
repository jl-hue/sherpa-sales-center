import { useState } from 'react';
import { ST, GC, C, Pill, Btn, CopyBtn } from '../ui';
import { FORMATION_DEFAULT } from '../../constants/data';

const BLOCK_COLORS={text:"#0B68B4",quiz:"#7C3AED",exercise:"#DA4F00",checklist:"#16A34A",link:"#6B7280"};
const BLOCK_EMOJIS={text:"📝",quiz:"❓",exercise:"✏️",checklist:"✅",link:"🔗"};

function SalesFormation({formations, progress={}, setProgress, user}){
  const F = formations && Object.keys(formations).length > 0 ? formations : FORMATION_DEFAULT;
  const [tab,setTab]=useState(Object.keys(F)[0]||"sales");
  const [showScore,setShowScore]=useState(false);
  const [scoreVal,setScoreVal]=useState(80);
  const [completingMod,setCompletingMod]=useState(null);
  const [openMod,setOpenMod]=useState(null); // {pilierKey, idx} — reading a module
  const [redoing,setRedoing]=useState(false);

  const userId = user?.id || "unknown";
  const userProgress = progress[userId] || {};

  function isModDone(moduleId){ return userProgress[moduleId]?.done === true; }
  function getModScore(moduleId){ return userProgress[moduleId]?.score; }

  const pill=F[tab]||Object.values(F)[0];
  if(!pill) return <div><ST emoji="🎓">Formation</ST><C style={{textAlign:"center",padding:32,color:"#A1A1AA"}}>Aucune formation disponible.</C></div>;

  const allModules = Object.values(F).flatMap(p=>p.modules);
  const total = allModules.length;
  const done = allModules.filter(m=>isModDone(m.id)).length;

  function completeModule(modId){
    if(!setProgress) return;
    const id = modId || completingMod;
    if(!id) return;
    const next = {...progress};
    if(!next[userId]) next[userId] = {};
    next[userId] = {...next[userId], [id]: {done:true, score:scoreVal}};
    setProgress(next);
    setCompletingMod(null);
    setShowScore(false);
    setScoreVal(80);
  }

  // ═══ MODULE READER (full content view) ═══
  if(openMod){
    const op=F[openMod.pk];
    const m=op?.modules[openMod.idx];
    if(!m) { setOpenMod(null); return null; }
    const pc=op.color||"#16A34A";
    const isDone=isModDone(m.id);
    const score=getModScore(m.id);
    const hasContent=m.content?.length>0||m.objectives?.length>0;
    const isCurrent=!isDone;

    return <div>
      <Btn sm outline color="#71717A" onClick={()=>{setOpenMod(null);setRedoing(false);}} style={{marginBottom:12}}>← Retour aux modules</Btn>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${pc},${pc}CC)`,borderRadius:16,padding:24,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <Pill color="#fff" bg="rgba(255,255,255,.2)">{op.icon} {op.title}</Pill>
              {isDone&&<Pill color="#fff" bg="rgba(255,255,255,.25)">Terminé {score?`— ${score}%`:""}</Pill>}
            </div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",margin:"0 0 6px"}}>{m.title}</h1>
            <div style={{fontSize:13,color:"rgba(255,255,255,.8)"}}>{m.description}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:6}}>⏱ {m.duration} · Module {openMod.idx+1}/{op.modules.length}</div>
          </div>
          <div style={{fontSize:48}}>{isDone?"✅":"📖"}</div>
        </div>
      </div>

      {/* Objectives */}
      {m.objectives?.length>0&&<C style={{marginBottom:14,borderLeft:`4px solid ${pc}`}}>
        <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>🎯 Objectifs de ce module</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {m.objectives.map((obj,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{width:22,height:22,borderRadius:6,background:pc+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:pc,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
              <span style={{fontSize:13,color:"#3F3F46",lineHeight:1.6}}>{obj}</span>
            </div>
          ))}
        </div>
      </C>}

      {/* Content blocks */}
      {m.content?.length>0&&<div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:18}}>
        {m.content.map((blk,i)=>{
          const bc=BLOCK_COLORS[blk.type]||"#71717A";
          const be=BLOCK_EMOJIS[blk.type]||"📝";
          return <C key={i} style={{borderLeft:`4px solid ${bc}`,padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 18px",background:bc+"08",borderBottom:`1px solid ${bc}20`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{be}</span>
              <span style={{fontSize:14,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{blk.title}</span>
              <div style={{flex:1}}/>
              <CopyBtn text={blk.body}/>
            </div>
            <div style={{padding:"16px 18px",fontSize:13,color:"#3F3F46",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif"}}>{blk.body}</div>
          </C>;
        })}
      </div>}

      {/* No content fallback */}
      {!hasContent&&<C style={{textAlign:"center",padding:40,marginBottom:18}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div style={{fontSize:14,fontWeight:700,color:"#71717A"}}>Ce module n'a pas encore de contenu détaillé</div>
        <div style={{fontSize:12,color:"#A1A1AA",marginTop:4}}>Le formateur peut ajouter du contenu depuis l'éditeur</div>
      </C>}

      {/* Complete button */}
      {isCurrent&&<div style={{background:pc+"08",borderRadius:14,border:`1px solid ${pc}35`,padding:18,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:800,color:pc,marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>Terminer ce module</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#71717A",marginBottom:6}}>Auto-évaluation (0-100)</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <input type="range" min={0} max={100} value={scoreVal} onChange={e=>setScoreVal(Number(e.target.value))} style={{flex:1,accentColor:pc}}/>
            <div style={{width:46,height:46,borderRadius:"50%",background:pc+"18",border:`2px solid ${pc}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:pc,flexShrink:0,fontFamily:"'Outfit',sans-serif"}}>{scoreVal}</div>
          </div>
        </div>
        <Btn color={pc} full onClick={()=>completeModule(m.id)} style={{padding:"13px",borderRadius:99,fontSize:14}}>Valider le module ✓</Btn>
      </div>}

      {isDone&&!redoing&&<C style={{background:"#F0FDF4",border:"1px solid #C0EAD3",textAlign:"center",padding:24}}>
        <div style={{fontSize:28,marginBottom:6}}>🎉</div>
        <div style={{fontSize:16,fontWeight:800,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>Module terminé {score?`— Score : ${score}%`:""}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
          <Btn sm outline color="#DA4F00" onClick={()=>setRedoing(true)}>Refaire le module</Btn>
          {openMod.idx<op.modules.length-1&&<Btn sm color="#16A34A" onClick={()=>{setRedoing(false);setOpenMod({pk:openMod.pk,idx:openMod.idx+1});}}>Module suivant →</Btn>}
        </div>
      </C>}

      {isDone&&redoing&&<div style={{background:"#DA4F00"+"08",borderRadius:14,border:"1px solid #FED7AA",padding:18,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:800,color:"#DA4F00",marginBottom:4,fontFamily:"'Outfit',sans-serif"}}>Refaire ce module</div>
        <div style={{fontSize:12,color:"#71717A",marginBottom:12}}>Ton ancien score ({score}%) sera remplacé par le nouveau.</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#71717A",marginBottom:6}}>Nouveau score (0-100)</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <input type="range" min={0} max={100} value={scoreVal} onChange={e=>setScoreVal(Number(e.target.value))} style={{flex:1,accentColor:"#DA4F00"}}/>
            <div style={{width:46,height:46,borderRadius:"50%",background:"#DA4F00"+"18",border:"2px solid #DA4F00",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:"#DA4F00",flexShrink:0,fontFamily:"'Outfit',sans-serif"}}>{scoreVal}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn color="#DA4F00" onClick={()=>{completeModule(m.id);setRedoing(false);}} style={{padding:"11px 20px",borderRadius:99}}>Valider le nouveau score ✓</Btn>
          <Btn outline color="#71717A" onClick={()=>setRedoing(false)}>Annuler</Btn>
        </div>
      </div>}
    </div>;
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
        <C style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",opacity:!isDone&&!isCurrent?.5:1,borderLeft:`4px solid ${isDone?pill.color:isCurrent?pill.color+"70":"#E4E4E7"}`,cursor:(isDone||isCurrent)?"pointer":"default"}} onClick={()=>(isDone||isCurrent)&&setOpenMod({pk:tab,idx:i})}>
          <div style={{width:34,height:34,borderRadius:10,background:isDone?pill.color+"18":"#F4F4F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isDone?"✅":isCurrent?"▶️":"🔒"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{m.title}</div>
            <div style={{fontSize:11,color:"#A1A1AA",marginTop:1}}>⏱ {m.duration}</div>
            {m.description&&<div style={{fontSize:11,color:"#71717A",marginTop:2,fontStyle:"italic"}}>{m.description}</div>}
            {(m.content?.length>0)&&<div style={{display:"flex",gap:4,marginTop:4}}><Pill color={pill.color}>{m.content.length} sections</Pill>{m.objectives?.length>0&&<Pill color="#16A34A">{m.objectives.length} objectifs</Pill>}</div>}
          </div>
          {isDone&&score&&<Pill color="#16A34A">{score}%</Pill>}
          {isCurrent&&!isCompleting&&<Btn sm color={pill.color} onClick={e=>{e.stopPropagation();setOpenMod({pk:tab,idx:i});}}>Commencer →</Btn>}
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
