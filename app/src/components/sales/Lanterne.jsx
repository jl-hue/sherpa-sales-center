import { useState } from 'react';
import { C, GC, Pill, Btn, Chips, ST, CopyBtn, Logo } from '../ui';
import { PROF_TYPES, NIVEAUX, MATIERES, PSYCH_PROFILES } from '../../constants/profTypes';
import { computeV5, getLabel, refine } from '../../lib/matching';
import { getArgs } from '../../lib/argEngine';
import { today } from '../../lib/utils';
import MatriceNeuro from './MatriceNeuro';

function SalesLanterne({stock,setMatchings,user}){
  const [activeTab,setActiveTab]=useState("prescription");
  // ── État Prescription ──────────────────────────────────────────
  // Inputs
  const [step,setStep]=useState(1);
  const [prenom,setPrenom]=useState("");
  const [niveau,setNiveau]=useState("");
  const [matieres,setMatieres]=useState([]);
  const [psycho,setPsycho]=useState("");
  const [accomp,setAccomp]=useState(5);
  const [objectifVie,setObjectifVie]=useState("");
  const [souhaitParent,setSouhaitParent]=useState("");
  // Results
  const [portrait,setPortrait]=useState(null);
  const [chosenB,setChosenB]=useState("");
  const [activeOption,setActiveOption]=useState("A");
  const [scriptGenerated,setScriptGenerated]=useState(false);

  const stockMap=Object.fromEntries(stock.map(s=>[s.typ,s]));
  const canAnalyze=niveau&&psycho&&objectifVie;

  function analyze(){
    const p=computeV5(niveau,psycho,objectifVie,accomp);
    setPortrait(p);
    setChosenB(stock.find(s=>s.dispo)?.typ||PROF_TYPES[0]);
    setStep(2);
    setScriptGenerated(false);
  }
  function reset(){setStep(1);setPortrait(null);setChosenB("");setActiveOption("A");setScriptGenerated(false);setPrenom("");setNiveau("");setMatieres([]);setPsycho("");setAccomp(5);setObjectifVie("");setSouhaitParent("");}

  async function generateScript(){
    setScriptGenerated(true);
    const idealTyp=portrait[0].typ;
    const chosenTyp=activeOption==="A"?idealTyp:chosenB;
    const followed=activeOption==="A";
    await setMatchings({id:Date.now(),date:today(),auteur:user?.name||"Moi",idealTyp,chosenTyp,followed,niveau,psycho});
  }

  const accompLabel=accomp<=3?"Douceur & Empathie":accomp>=7?"Fermeté & Cadre":"Équilibre";
  const accompColor=accomp<=3?"#16A34A":accomp>=7?"#DA4F00":"#0B68B4";

  // ─── STEP 1: Formulaire ───────────────────────────────────────
  if(step===1||step===2) return <div>
    {/* Onglets */}
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {[["prescription","🔦 Prescription","Diagnostic + Dual Path"],["neuro","🧠 Neuroatypiques","Matrice prof × trouble"]].map(([id,label,sub])=>(
        <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,padding:"10px 14px",borderRadius:12,border:`2px solid ${activeTab===id?"#16A34A":"#E4E4E7"}`,background:activeTab===id?"#E1FFED":"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
          <div style={{fontSize:13,fontWeight:800,color:activeTab===id?"#16A34A":"#18181B",fontFamily:"'Outfit',sans-serif"}}>{label}</div>
          <div style={{fontSize:11,color:"#71717A",marginTop:2}}>{sub}</div>
        </button>
      ))}
    </div>

    {/* Tab Neuroatypiques */}
    {activeTab==="neuro"&&<MatriceNeuro/>}

    {/* Tab Prescription */}
    {activeTab==="prescription"&&step===1&&<div>
    <ST emoji="🔦" sub="Le cerveau stratégique de l'application — prescription & argumentation dynamique.">Lanterne Match V5</ST>

    {/* Prénom */}
    <C style={{marginBottom:12}}>
      <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>👤 Prénom de l'élève <span style={{fontSize:12,fontWeight:400,color:"#A1A1AA"}}>(optionnel, personnalise les scripts)</span></div>
      <input value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Ex : Lucas, Emma, Thomas..." style={{width:"100%",fontSize:14,border:"1px solid #E4E4E7",borderRadius:10,padding:"10px 14px",boxSizing:"border-box",fontFamily:"'Outfit',sans-serif",fontWeight:600,color:"#18181B"}}/>
    </C>

    {/* Diagnostic académique */}
    <C style={{marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:16,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:8}}>📚 Diagnostic académique</div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#71717A",marginBottom:8}}>Niveau scolaire <span style={{color:"#E11D48"}}>*</span></div>
        <Chips options={NIVEAUX} selected={niveau} onChange={setNiveau} color="#16A34A" single={true}/>
      </div>
      <div>
        <div style={{fontSize:12,fontWeight:600,color:"#71717A",marginBottom:4}}>Matière(s)</div>
        <div style={{fontSize:11,color:"#A1A1AA",marginBottom:8}}>Affine la prescription (médecine, ingénieurs, droit…)</div>
        <Chips options={MATIERES} selected={matieres} onChange={setMatieres} color="#DA4F00"/>
      </div>
    </C>

    {/* Profil psychologique — NOUVEAU */}
    <C style={{marginBottom:12,borderLeft:"4px solid #16A34A"}}>
      <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:4,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:8}}>🧠 Profil Psychologique <span style={{fontSize:11,background:"#E1FFED",color:"#16A34A",borderRadius:99,padding:"2px 8px",fontWeight:700}}>NOUVEAU V5</span></div>
      <div style={{fontSize:12,color:"#71717A",marginBottom:12}}>La personnalité de l'élève détermine le profil de prof idéal</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {PSYCH_PROFILES.map(p=>{
          const on=psycho===p;
          const emoji={"Introverti / Réservé":"🤫","Décrocheur / Démotivé":"😮‍💨","Compétiteur / Haut Potentiel":"🔥","Stressé / Anxieux":"😰"}[p]||"👤";
          return <button key={p} onClick={()=>setPsycho(on?"":p)} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${on?"#16A34A":"#E4E4E7"}`,background:on?"#E1FFED":"#FAFAFA",textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
            <div style={{fontSize:18,marginBottom:4}}>{emoji}</div>
            <div style={{fontSize:12,fontWeight:700,color:on?"#16A34A":"#3F3F46",fontFamily:"'Outfit',sans-serif"}}>{p}</div>
          </button>;
        })}
      </div>
    </C>

    {/* Besoin d'accompagnement — NOUVEAU */}
    <C style={{marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:4,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:8}}>⚖️ Besoin d'accompagnement <span style={{fontSize:11,background:"#E1FFED",color:"#16A34A",borderRadius:99,padding:"2px 8px",fontWeight:700}}>NOUVEAU V5</span></div>
      <div style={{fontSize:12,color:"#71717A",marginBottom:12}}>Positionnez le curseur selon le besoin de l'élève</div>
      <input type="range" min={0} max={10} value={accomp} onChange={e=>setAccomp(Number(e.target.value))} style={{width:"100%",accentColor:accompColor,background:`linear-gradient(to right, #16A34A ${accomp*10}%, #E4E4E7 ${accomp*10}%)`}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,alignItems:"center"}}>
        <span style={{fontSize:12,color:"#16A34A",fontWeight:700}}>🫶 Douceur / Empathie</span>
        <Pill color={accompColor}>{accompLabel}</Pill>
        <span style={{fontSize:12,color:"#DA4F00",fontWeight:700}}>💪 Fermeté / Cadre</span>
      </div>
    </C>

    {/* Objectif de vie — NOUVEAU */}
    <C style={{marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:4,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:8}}>🎯 Objectif de vie <span style={{fontSize:11,background:"#E1FFED",color:"#16A34A",borderRadius:99,padding:"2px 8px",fontWeight:700}}>NOUVEAU V5</span></div>
      <div style={{fontSize:12,color:"#71717A",marginBottom:12}}>Qu'est-ce que cette famille veut vraiment accomplir ?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {[["Remise à niveau","🔄","Rattraper le niveau de la classe"],["Réussite concours","🏆","Intégrer une grande école ou un programme sélectif"],["Méthodologie pure","🗂️","Apprendre à apprendre"],["Excellence académique","⭐","Être le meilleur dans sa matière"]].map(([o,em,desc])=>{
          const on=objectifVie===o;
          return <button key={o} onClick={()=>setObjectifVie(on?"":o)} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${on?"#0B68B4":"#E4E4E7"}`,background:on?"#EFF6FF":"#FAFAFA",textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
            <div style={{fontSize:18,marginBottom:4}}>{em}</div>
            <div style={{fontSize:12,fontWeight:700,color:on?"#1E40AF":"#3F3F46",fontFamily:"'Outfit',sans-serif"}}>{o}</div>
            <div style={{fontSize:11,color:"#A1A1AA",marginTop:2}}>{desc}</div>
          </button>;
        })}
      </div>
    </C>

    {/* Souhait parent */}
    <C style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:4,fontFamily:"'Outfit',sans-serif"}}>👨‍👩‍👧 Souhait du parent <span style={{fontSize:12,fontWeight:400,color:"#A1A1AA"}}>(optionnel)</span></div>
      <div style={{fontSize:12,color:"#71717A",marginBottom:10}}>Quel type de prof demande-t-il ? (influence l'option B)</div>
      <Chips options={["Pas d'avis",...PROF_TYPES]} selected={souhaitParent} onChange={setSouhaitParent} color="#DA4F00" single={true}/>
    </C>

    {/* Stock */}
    <C style={{marginBottom:14,background:"#F0FDF4",border:"1px solid #C0EAD3",padding:"12px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><Logo size={15}/><span style={{fontSize:12,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>Stock plateforme Sherpas (temps réel)</span></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{stock.map(s=><span key={s.typ} style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:s.dispo?"#D1FAE5":"#FEE2E2",color:s.dispo?"#15803D":"#B91C1C",fontWeight:600,border:`1px solid ${s.dispo?"#86EFAC":"#FCA5A5"}`}}>{s.dispo?"✓":"✗"} {s.typ} ({s.nb})</span>)}</div>
    </C>

    {!canAnalyze&&<div style={{fontSize:12,color:"#A1A1AA",marginBottom:10,textAlign:"center"}}>Remplis niveau, profil psychologique et objectif de vie pour continuer</div>}
    <Btn onClick={analyze} disabled={!canAnalyze} full color="#16A34A" style={{padding:"13px",borderRadius:99,fontSize:15}}>🔦 Allumer la Lanterne V5 →</Btn>
  </div>}{/* fin step 1 prescription */}

    {/* ─── STEP 2: Dual Path + Arguments ─── */}
    {activeTab==="prescription"&&step===2&&portrait&&(()=>{
  const idealTyp=portrait[0].typ;
  const idealLabel=getLabel(idealTyp,psycho);
  const idealRefined=refine(idealTyp,matieres);
  const idealDispo=stockMap[idealTyp]?.dispo;

  const chosenTyp=activeOption==="A"?idealTyp:chosenB;
  const chosenLabel=getLabel(chosenTyp,psycho);
  const chosenRefined=refine(chosenTyp,matieres);
  const args=getArgs(chosenTyp,psycho);
  const nom=prenom||"l'élève";

  function injectPrenom(text){return text.replace(/\[Prénom\]/g,prenom||"votre enfant").replace(/\[nom\]/g,prenom||"votre enfant");}

  const fullScript=args?`🎯 SCRIPT PERSONNALISÉ — ${chosenLabel}
Profil : ${chosenRefined}
Élève : ${nom} | Psycho : ${psycho} | Objectif : ${objectifVie}

🪝 LE CROCHET
${injectPrenom(args.hook)}

🏆 L'ARGUMENT DE CONFIANCE
${injectPrenom(args.trust)}

🌉 LE PONT PÉDAGOGIQUE
${injectPrenom(args.bridge)}

↩️ L'ARGUMENT DE REBOND
${injectPrenom(args.rebound)}`:"";

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div>
        <h1 style={{fontSize:21,fontWeight:900,color:"#18181B",margin:"0 0 2px",fontFamily:"'Outfit',sans-serif"}}>🔦 Résultat Lanterne V5</h1>
        <p style={{color:"#71717A",fontSize:13}}>Dual Path · {nom} · {psycho} · {objectifVie}</p>
      </div>
      <Btn onClick={reset} outline color="#71717A" sm>← Nouveau</Btn>
    </div>

    {/* ── DUAL PATH ── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>

      {/* OPTION A — Idéal Sherpas */}
      <button onClick={()=>setActiveOption("A")} style={{borderRadius:16,border:`2px solid ${activeOption==="A"?"#16A34A":"#E4E4E7"}`,background:activeOption==="A"?"#F0FDF4":"#fff",padding:18,textAlign:"left",cursor:"pointer",transition:"all .2s",position:"relative"}}>
        {activeOption==="A"&&<div style={{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:"#16A34A",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800}}>✓</div>}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontSize:18}}>✦</div>
          <Pill color="#16A34A" bg="#E1FFED">OPTION A — L'Idéal Sherpas</Pill>
        </div>
        <div style={{fontSize:11,color:"#A1A1AA",marginBottom:4,fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Algorithme Matrice</div>
        <div style={{fontSize:16,fontWeight:800,color:"#18181B",lineHeight:1.3,fontFamily:"'Outfit',sans-serif",marginBottom:4}}>{idealLabel}</div>
        <div style={{fontSize:12,color:"#16A34A",fontWeight:600,marginBottom:10}}>↳ {idealRefined}</div>
        <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
          {portrait.slice(0,3).map(({typ,score},i)=><div key={typ} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:90,fontSize:10,color:"#71717A",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{typ}</div>
            <div style={{flex:1,height:4,background:"#E4E4E7",borderRadius:99}}><div style={{height:4,background:i===0?"#16A34A":"#C0EAD3",borderRadius:99,width:`${portrait[0].score>0?(score/portrait[0].score)*100:0}%`}}/></div>
          </div>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:idealDispo?"#16A34A":"#E11D48"}}/>
          <span style={{fontSize:11,fontWeight:600,color:idealDispo?"#15803D":"#B91C1C"}}>{idealDispo?`✓ Disponible en stock (${stockMap[idealTyp]?.nb})`:  "✗ Stock indisponible"}</span>
        </div>
      </button>

      {/* OPTION B — Choix Sales */}
      <button onClick={()=>setActiveOption("B")} style={{borderRadius:16,border:`2px solid ${activeOption==="B"?"#0B68B4":"#E4E4E7"}`,background:activeOption==="B"?"#EFF6FF":"#fff",padding:18,textAlign:"left",cursor:"pointer",transition:"all .2s",position:"relative"}}>
        {activeOption==="B"&&<div style={{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:"#0B68B4",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800}}>✓</div>}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontSize:18}}>🎛️</div>
          <Pill color="#0B68B4" bg="#DBEAFE">OPTION B — Choix Sales</Pill>
        </div>
        <div style={{fontSize:11,color:"#A1A1AA",marginBottom:8,fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Sélection manuelle (stock réel)</div>
        <select value={chosenB} onChange={e=>setChosenB(e.target.value)} onClick={e=>{e.stopPropagation();setActiveOption("B");}} style={{width:"100%",fontSize:13,fontWeight:700,border:"2px solid #DBEAFE",borderRadius:10,padding:"9px 12px",fontFamily:"'Outfit',sans-serif",color:"#1E40AF",background:"#fff",cursor:"pointer",marginBottom:10}}>
          {PROF_TYPES.map(t=>{const s=stockMap[t];return <option key={t} value={t}>{s?.dispo?"✓":"✗"} {t} ({s?.nb||0})</option>;})}
        </select>
        {chosenB&&<div>
          <div style={{fontSize:14,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif",marginBottom:3}}>{getLabel(chosenB,psycho)}</div>
          <div style={{fontSize:12,color:"#0B68B4",fontWeight:600,marginBottom:8}}>↳ {refine(chosenB,matieres)}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:stockMap[chosenB]?.dispo?"#16A34A":"#E11D48"}}/>
            <span style={{fontSize:11,fontWeight:600,color:stockMap[chosenB]?.dispo?"#15803D":"#B91C1C"}}>{stockMap[chosenB]?.dispo?`✓ Disponible (${stockMap[chosenB]?.nb})`:"✗ Stock indisponible"}</span>
          </div>
        </div>}
      </button>
    </div>

    {/* ── BOUTON GÉNÉRER ── */}
    {!scriptGenerated&&<Btn onClick={generateScript} full color="#18181B" style={{padding:"13px",borderRadius:99,fontSize:14,marginBottom:16}}>⚡ Générer le Script Personnalisé — {activeOption==="A"?"Idéal Sherpas":"Choix Sales"}</Btn>}

    {/* ── ARGUMENT GENERATOR ── */}
    {scriptGenerated&&args&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📜 Script Personnalisé</div>
          <div style={{fontSize:12,color:"#71717A",marginTop:2}}>{chosenLabel} · {nom} · {psycho}</div>
        </div>
        <CopyBtn text={fullScript}/>
      </div>

      {[
        {icon:"🪝",label:"LE CROCHET (Hook)",desc:"Pourquoi ce profil va matcher avec la personnalité de l'enfant",text:args.hook,color:"#16A34A",bg:"#F0FDF4",border:"#C0EAD3"},
        {icon:"🏆",label:"ARGUMENT DE CONFIANCE (Trust)",desc:"Pourquoi ce profil rassure le parent",text:args.trust,color:"#0B68B4",bg:"#EFF6FF",border:"#BFDBFE"},
        {icon:"🌉",label:"LE PONT PÉDAGOGIQUE",desc:"Le bénéfice concret pour l'élève",text:args.bridge,color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE"},
        {icon:"↩️",label:"ARGUMENT DE REBOND",desc:"Pour contrer l'objection classique liée à ce profil",text:args.rebound,color:"#DA4F00",bg:"#FFF7F0",border:"#FED7AA"},
      ].map(({icon,label,desc,text,color,bg,border})=>(
        <C key={label} style={{marginBottom:10,background:bg,border:`1px solid ${border}`,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <span style={{fontSize:16}}>{icon}</span>
                <Pill color={color}>{label}</Pill>
              </div>
              <div style={{fontSize:11,color:"#71717A"}}>{desc}</div>
            </div>
            <CopyBtn text={injectPrenom(text)}/>
          </div>
          <div style={{fontSize:14,color:"#3F3F46",lineHeight:1.75,marginTop:8,fontStyle:"italic",fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,.7)",borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${color}`}}>
            "{injectPrenom(text)}"
          </div>
        </C>
      ))}

      <div style={{marginTop:4}}>
        <Btn onClick={()=>{setScriptGenerated(false);}} outline color="#71717A" sm>Changer d'option</Btn>
      </div>
    </div>}

    {scriptGenerated&&!args&&<C style={{background:"#FFF7F0",border:"1px solid #FED7AA",textAlign:"center",padding:24}}>
      <div style={{fontSize:20,marginBottom:8}}>🔧</div>
      <div style={{fontSize:14,color:"#92400E",fontWeight:600}}>Arguments en cours d'enrichissement pour ce profil</div>
      <div style={{fontSize:12,color:"#71717A",marginTop:4}}>Ce profil sera disponible dans la prochaine mise à jour.</div>
    </C>}
  </div>;
    })()}
  </div>;
}

export default SalesLanterne;
