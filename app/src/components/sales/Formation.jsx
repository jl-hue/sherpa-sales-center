import { useState } from 'react';
import { ST, GC, C, Pill, Btn, CopyBtn } from '../ui';
import { FORMATION_DEFAULT } from '../../constants/data';

const BLOCK_COLORS={text:"#0B68B4",video:"#E11D48",pdf:"#D97706",quiz:"#7C3AED",exercise:"#DA4F00",checklist:"#16A34A",link:"#6B7280"};
const BLOCK_EMOJIS={text:"📝",video:"🎬",pdf:"📄",quiz:"❓",exercise:"✏️",checklist:"✅",link:"🔗"};
function getYouTubeId(url){const m=url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);return m?m[1]:null;}

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

  // ═══ MODULE READER — STEP-BY-STEP INTERACTIVE ═══
  const [step,setStep]=useState(0);
  const [quizAnswers,setQuizAnswers]=useState({});  // {stepIdx: {qIdx: selectedChoice}}
  const [quizValidated,setQuizValidated]=useState({}); // {stepIdx: true}
  const [quizFeedback,setQuizFeedback]=useState(null); // {stepIdx, qIdx, correct, explanation}
  const [totalCorrect,setTotalCorrect]=useState(0);
  const [totalQuestions,setTotalQuestions]=useState(0);
  const [finished,setFinished]=useState(false);

  function resetModuleState(){setStep(0);setQuizAnswers({});setQuizValidated({});setQuizFeedback(null);setTotalCorrect(0);setTotalQuestions(0);setFinished(false);}

  if(openMod){
    const op=F[openMod.pk];
    const m=op?.modules[openMod.idx];
    if(!m) { setOpenMod(null); return null; }
    const pc=op.color||"#16A34A";
    const isDone=isModDone(m.id);
    const prevScore=getModScore(m.id);
    const hasContent=m.content?.length>0;
    const steps=m.content||[];
    const totalSteps=steps.length;
    const blk=steps[step];

    // Count all quiz questions in module
    const allQuizCount=steps.reduce((s,b)=>(s+(b.quiz?.length||0)),0);

    function selectAnswer(qIdx,choiceIdx){
      if(quizValidated[step]) return;
      setQuizAnswers(p=>({...p,[step]:{...(p[step]||{}),[qIdx]:choiceIdx}}));
      setQuizFeedback(null);
    }

    function validateQuiz(){
      if(!blk?.quiz) return;
      const answers=quizAnswers[step]||{};
      let correct=0;
      for(let i=0;i<blk.quiz.length;i++){
        if(answers[i]===blk.quiz[i].correctIndex) correct++;
      }
      const allAnswered=blk.quiz.every((_,i)=>answers[i]!==undefined);
      if(!allAnswered){setQuizFeedback({msg:"Réponds à toutes les questions avant de valider.",error:true});return;}
      const allCorrect=correct===blk.quiz.length;
      if(!allCorrect){
        const wrongIdx=blk.quiz.findIndex((q,i)=>answers[i]!==q.correctIndex);
        setQuizFeedback({msg:`${correct}/${blk.quiz.length} bonnes réponses. Corrige les erreurs pour continuer.`,error:true,wrongIdx});
        return;
      }
      setQuizValidated(p=>({...p,[step]:true}));
      setTotalCorrect(p=>p+correct);
      setTotalQuestions(p=>p+blk.quiz.length);
      setQuizFeedback({msg:`${correct}/${blk.quiz.length} — Parfait ! Tu peux continuer.`,error:false});
    }

    function nextStep(){
      if(blk?.quiz&&!quizValidated[step]) return;
      setQuizFeedback(null);
      if(step<totalSteps-1){setStep(step+1);}
      else {
        // Last step — finish
        const finalCorrect=totalCorrect+(quizValidated[step]?0:0);
        const finalTotal=totalQuestions;
        const finalScore=finalTotal>0?Math.round((finalCorrect/finalTotal)*100):100;
        setScoreVal(finalScore);
        setFinished(true);
      }
    }

    function finishModule(){
      completeModule(m.id);
      setFinished(false);
      resetModuleState();
    }

    // ── FINISHED SCREEN ──
    if(finished){
      const finalScore=allQuizCount>0?Math.round((totalCorrect/allQuizCount)*100):100;
      return <div>
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:64,marginBottom:16}}>{finalScore>=80?"🏆":finalScore>=60?"👏":"📚"}</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#18181B",fontFamily:"'Outfit',sans-serif",marginBottom:8}}>Module terminé !</h1>
          <div style={{fontSize:15,color:"#71717A",marginBottom:24}}>{m.title}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:16,background:"#F0FDF4",border:"2px solid #C0EAD3",borderRadius:16,padding:"20px 40px",marginBottom:24}}>
            <div>
              <div style={{fontSize:11,color:"#71717A",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>Score final</div>
              <div style={{fontSize:48,fontWeight:900,color:finalScore>=80?"#16A34A":finalScore>=60?"#DA4F00":"#E11D48",fontFamily:"'Outfit',sans-serif"}}>{finalScore}%</div>
            </div>
            <div style={{width:1,height:50,background:"#C0EAD3"}}/>
            <div>
              <div style={{fontSize:11,color:"#71717A",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>Bonnes réponses</div>
              <div style={{fontSize:28,fontWeight:900,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{totalCorrect}/{allQuizCount}</div>
            </div>
          </div>
          <div style={{fontSize:14,color:finalScore>=80?"#15803D":"#DA4F00",fontWeight:700,marginBottom:24}}>{finalScore>=80?"Excellent travail ! Tu maîtrises les fondamentaux.":finalScore>=60?"Bon travail, mais revois les points où tu as hésité.":"Il faut revoir ce module — n'hésite pas à le refaire."}</div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn outline color="#DA4F00" onClick={()=>{setFinished(false);resetModuleState();}}>Refaire le module</Btn>
            <Btn color="#16A34A" onClick={()=>{setScoreVal(finalScore);finishModule();}}>Enregistrer mon score ({finalScore}%)</Btn>
          </div>
          {prevScore&&<div style={{fontSize:12,color:"#A1A1AA",marginTop:12}}>Score précédent : {prevScore}%</div>}
        </div>
      </div>;
    }

    // ── STEP-BY-STEP VIEW ──
    return <div>
      <Btn sm outline color="#71717A" onClick={()=>{setOpenMod(null);setRedoing(false);resetModuleState();}} style={{marginBottom:12}}>← Retour aux modules</Btn>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${pc},${pc}CC)`,borderRadius:16,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <Pill color="#fff" bg="rgba(255,255,255,.2)">{op.icon} {op.title}</Pill>
            <h1 style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",margin:"6px 0 0"}}>{m.title}</h1>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif"}}>{step+1}/{totalSteps}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>étapes</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{height:6,background:"rgba(255,255,255,.2)",borderRadius:99}}>
          <div style={{height:6,background:"#fff",borderRadius:99,width:`${((step+1)/totalSteps)*100}%`,transition:"width .3s"}}/>
        </div>
      </div>

      {/* Objectives (only on step 0) */}
      {step===0&&m.objectives?.length>0&&<C style={{marginBottom:14,borderLeft:`4px solid ${pc}`}}>
        <div style={{fontSize:14,fontWeight:800,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>🎯 Objectifs</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {m.objectives.map((obj,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:pc,fontWeight:700,fontSize:12}}>✓</span>
              <span style={{fontSize:12,color:"#3F3F46"}}>{obj}</span>
            </div>
          ))}
        </div>
      </C>}

      {/* Current block content */}
      {blk&&(()=>{
        const bc=BLOCK_COLORS[blk.type]||"#71717A";
        const be=BLOCK_EMOJIS[blk.type]||"📝";
        return <C style={{borderLeft:`4px solid ${bc}`,padding:0,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 18px",background:bc+"08",borderBottom:`1px solid ${bc}20`,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>{be}</span>
            <span style={{fontSize:14,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{blk.title}</span>
            <div style={{flex:1}}/>
            <Pill color={bc}>{step+1}/{totalSteps}</Pill>
          </div>
          {/* Video embed */}
          {blk.type==="video"&&blk.url&&getYouTubeId(blk.url)&&<div style={{padding:"16px 18px"}}><div style={{borderRadius:10,overflow:"hidden"}}><iframe width="100%" height="360" src={`https://www.youtube.com/embed/${getYouTubeId(blk.url)}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div>{blk.body&&<div style={{padding:"12px 0 0",fontSize:13,color:"#3F3F46",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{blk.body}</div>}</div>}
          {/* PDF embed */}
          {blk.type==="pdf"&&blk.url&&<div style={{padding:"16px 18px"}}><div style={{borderRadius:10,overflow:"hidden",border:"1px solid #E4E4E7"}}><iframe src={blk.url} width="100%" height="500" style={{border:"none"}}/></div>{blk.body&&<div style={{padding:"12px 0 0",fontSize:13,color:"#3F3F46",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{blk.body}</div>}</div>}
          {/* Text/other content */}
          {!["video","pdf"].includes(blk.type)&&blk.body&&<div style={{padding:"16px 18px",fontSize:13,color:"#3F3F46",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif"}}>{blk.body}</div>}
        </C>;
      })()}

      {/* Quiz section */}
      {blk?.quiz&&<C style={{marginBottom:14,border:`2px solid #7C3AED35`,background:"#F5F3FF"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#7C3AED",marginBottom:14,fontFamily:"'Outfit',sans-serif"}}>❓ Quiz — Vérifie tes connaissances</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {blk.quiz.map((q,qIdx)=>{
            const selected=(quizAnswers[step]||{})[qIdx];
            const validated=quizValidated[step];
            const isCorrect=selected===q.correctIndex;
            return <div key={qIdx} style={{padding:14,borderRadius:10,background:"#fff",border:`1px solid ${validated?(isCorrect?"#C0EAD3":"#FCA5A5"):"#E4E4E7"}`}}>
              <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>{qIdx+1}. {q.question}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {q.choices.map((c,cIdx)=>{
                  const isSel=selected===cIdx;
                  const showCorrect=validated&&cIdx===q.correctIndex;
                  const showWrong=validated&&isSel&&!isCorrect;
                  return <button key={cIdx} onClick={()=>selectAnswer(qIdx,cIdx)} disabled={validated} style={{padding:"10px 14px",borderRadius:8,border:`2px solid ${showCorrect?"#16A34A":showWrong?"#E11D48":isSel?pc:"#E4E4E7"}`,background:showCorrect?"#F0FDF4":showWrong?"#FEF2F2":isSel?pc+"10":"#FAFAFA",textAlign:"left",cursor:validated?"default":"pointer",fontSize:12,color:showCorrect?"#15803D":showWrong?"#991B1B":"#3F3F46",fontWeight:isSel||showCorrect?700:400,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${showCorrect?"#16A34A":showWrong?"#E11D48":isSel?pc:"#D4D4D8"}`,background:isSel?(showCorrect?"#16A34A":showWrong?"#E11D48":pc):"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {isSel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                    </div>
                    {c}
                  </button>;
                })}
              </div>
              {validated&&<div style={{marginTop:8,fontSize:11,color:isCorrect?"#15803D":"#991B1B",fontStyle:"italic",padding:"6px 10px",borderRadius:6,background:isCorrect?"#F0FDF4":"#FEF2F2"}}>{isCorrect?"✓ Correct":"✗ Incorrect"}{q.explanation&&` — ${q.explanation}`}</div>}
            </div>;
          })}
        </div>

        {/* Quiz feedback */}
        {quizFeedback&&<div style={{marginTop:12,padding:"10px 14px",borderRadius:8,background:quizFeedback.error?"#FEF2F2":"#F0FDF4",border:`1px solid ${quizFeedback.error?"#FCA5A5":"#C0EAD3"}`,fontSize:12,fontWeight:600,color:quizFeedback.error?"#991B1B":"#15803D"}}>{quizFeedback.msg}</div>}

        {!quizValidated[step]&&<Btn color="#7C3AED" full onClick={validateQuiz} style={{marginTop:14,padding:"12px",borderRadius:99,fontSize:13}}>Valider mes réponses</Btn>}
      </C>}

      {/* Navigation */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>{step>0&&<Btn sm outline color="#71717A" onClick={()=>{setStep(step-1);setQuizFeedback(null);}}>← Étape précédente</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          {step<totalSteps-1&&<Btn color={pc} onClick={nextStep} disabled={blk?.quiz&&!quizValidated[step]} style={{padding:"10px 24px",borderRadius:99}}>{blk?.quiz&&!quizValidated[step]?"Valide le quiz d'abord":"Étape suivante →"}</Btn>}
          {step===totalSteps-1&&<Btn color="#16A34A" onClick={nextStep} disabled={blk?.quiz&&!quizValidated[step]} style={{padding:"10px 24px",borderRadius:99}}>{blk?.quiz&&!quizValidated[step]?"Valide le quiz d'abord":"Terminer le module →"}</Btn>}
        </div>
      </div>
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
          {isDone&&<Btn sm outline color="#DA4F00" onClick={e=>{e.stopPropagation();setOpenMod({pk:tab,idx:i});}}>Revoir</Btn>}
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
