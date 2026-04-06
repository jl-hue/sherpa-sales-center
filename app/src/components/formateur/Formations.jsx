import { useState } from 'react';
import { ST, C, Btn, Pill } from '../ui';
import { FORMATION_DEFAULT } from '../../constants/data';
import { USERS } from '../../constants/brand';

function FormateurFormations({formations,setFormations,progress={},setProgress}){
  const F=formations&&Object.keys(formations).length>0?formations:FORMATION_DEFAULT;
  const [pilier,setPilier]=useState(Object.keys(F)[0]||"sales");
  const [editMod,setEditMod]=useState(null);
  const [editPilier,setEditPilier]=useState(null);
  const [showNewMod,setShowNewMod]=useState(false);
  const [showNewPilier,setShowNewPilier]=useState(false);
  const [viewMode,setViewMode]=useState("edit"); // "edit", "progress", or "toolbox"
  const [detailMod,setDetailMod]=useState(null); // {pk, idx} — full module editor

  const [mTitle,setMTitle]=useState("");const [mDur,setMDur]=useState("");const [mDesc,setMDesc]=useState("");
  const [pTitle,setPTitle]=useState("");const [pIcon,setPIcon]=useState("");const [pColor,setPColor]=useState("#16A34A");
  const [npTitle,setNpTitle]=useState("");const [npIcon,setNpIcon]=useState("📚");const [npColor,setNpColor]=useState("#7C3AED");

  const COLORS=["#16A34A","#0B68B4","#DA4F00","#7C3AED","#E11D48","#0891B2"];

  const [copiedSnippet,setCopiedSnippet]=useState(null);

  // Detail module editor state
  const [dmTitle,setDmTitle]=useState("");
  const [dmDur,setDmDur]=useState("");
  const [dmDesc,setDmDesc]=useState("");
  const [dmObjectives,setDmObjectives]=useState([]);
  const [dmContent,setDmContent]=useState([]);
  const [newObjText,setNewObjText]=useState("");

  function openDetailMod(pk,idx){
    const m=F[pk].modules[idx];
    setDmTitle(m.title||"");setDmDur(m.duration||"");setDmDesc(m.description||"");
    setDmObjectives(m.objectives?[...m.objectives]:[]);
    setDmContent(m.content?m.content.map(c=>({...c})):[]);
    setDetailMod({pk,idx});
  }
  function saveDetailMod(){
    if(!dmTitle.trim()||!detailMod) return;
    const next={...F};
    next[detailMod.pk]={...next[detailMod.pk],modules:[...next[detailMod.pk].modules]};
    next[detailMod.pk].modules[detailMod.idx]={
      ...next[detailMod.pk].modules[detailMod.idx],
      title:dmTitle,duration:dmDur,description:dmDesc,
      objectives:dmObjectives,content:dmContent
    };
    save(next);setDetailMod(null);
  }
  function addObjective(){if(!newObjText.trim())return;setDmObjectives(p=>[...p,newObjText.trim()]);setNewObjText("");}
  function removeObjective(idx){setDmObjectives(p=>p.filter((_,i)=>i!==idx));}
  function addContentBlock(type){
    const defaults={
      text:{type:"text",title:"Nouvelle section",body:""},
      quiz:{type:"quiz",title:"Quiz",body:"",quiz:[{question:"",choices:["","",""],correctIndex:0,explanation:""}]},
      exercise:{type:"exercise",title:"Exercice",body:"Consigne : ...\nDurée : ... min\nLivrable : ..."},
      checklist:{type:"checklist",title:"Points clés",body:"- [ ] Point 1\n- [ ] Point 2\n- [ ] Point 3"},
      link:{type:"link",title:"Ressources",body:"📎 Lien : ...\n📎 Lien : ..."},
      video:{type:"video",title:"Vidéo",body:"",url:""},
      pdf:{type:"pdf",title:"Document PDF",body:"",url:""},
    };
    setDmContent(p=>[...p,defaults[type]||defaults.text]);
  }
  function addQuizQuestion(blockIdx){
    setDmContent(p=>p.map((c,i)=>i===blockIdx?{...c,quiz:[...(c.quiz||[]),{question:"",choices:["","",""],correctIndex:0,explanation:""}]}:c));
  }
  function updateQuizQuestion(blockIdx,qIdx,field,val){
    setDmContent(p=>p.map((c,i)=>{if(i!==blockIdx)return c;const q=[...(c.quiz||[])];q[qIdx]={...q[qIdx],[field]:val};return{...c,quiz:q};}));
  }
  function updateQuizChoice(blockIdx,qIdx,cIdx,val){
    setDmContent(p=>p.map((c,i)=>{if(i!==blockIdx)return c;const q=[...(c.quiz||[])];const ch=[...q[qIdx].choices];ch[cIdx]=val;q[qIdx]={...q[qIdx],choices:ch};return{...c,quiz:q};}));
  }
  function addQuizChoice(blockIdx,qIdx){
    setDmContent(p=>p.map((c,i)=>{if(i!==blockIdx)return c;const q=[...(c.quiz||[])];q[qIdx]={...q[qIdx],choices:[...q[qIdx].choices,""]};return{...c,quiz:q};}));
  }
  function removeQuizChoice(blockIdx,qIdx,cIdx){
    setDmContent(p=>p.map((c,i)=>{if(i!==blockIdx)return c;const q=[...(c.quiz||[])];const ch=q[qIdx].choices.filter((_,ci)=>ci!==cIdx);const ci=q[qIdx].correctIndex>=cIdx&&q[qIdx].correctIndex>0?q[qIdx].correctIndex-1:q[qIdx].correctIndex;q[qIdx]={...q[qIdx],choices:ch,correctIndex:Math.min(ci,ch.length-1)};return{...c,quiz:q};}));
  }
  function removeQuizQuestion(blockIdx,qIdx){
    setDmContent(p=>p.map((c,i)=>i===blockIdx?{...c,quiz:(c.quiz||[]).filter((_,qi)=>qi!==qIdx)}:c));
  }
  function getYouTubeId(url){const m=url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);return m?m[1]:null;}
  function updateContentBlock(idx,field,val){setDmContent(p=>p.map((c,i)=>i===idx?{...c,[field]:val}:c));}
  function removeContentBlock(idx){setDmContent(p=>p.filter((_,i)=>i!==idx));}
  function moveContentBlock(idx,dir){
    setDmContent(p=>{const a=[...p];const target=idx+dir;if(target<0||target>=a.length)return a;[a[idx],a[target]]=[a[target],a[idx]];return a;});
  }

  function save(next){setFormations({...next});}

  function startEditMod(pk,idx){
    const m=F[pk].modules[idx];
    setMTitle(m.title);setMDur(m.duration);setMDesc(m.description||"");
    setEditMod({pk,idx});setShowNewMod(false);
  }
  function saveMod(){
    if(!mTitle.trim()) return;
    const next={...F};
    next[editMod.pk]={...next[editMod.pk],modules:[...next[editMod.pk].modules]};
    next[editMod.pk].modules[editMod.idx]={...next[editMod.pk].modules[editMod.idx],title:mTitle,duration:mDur,description:mDesc};
    save(next);setEditMod(null);
  }
  function deleteMod(pk,idx){
    const next={...F};
    next[pk]={...next[pk],modules:next[pk].modules.filter((_,i)=>i!==idx)};
    save(next);
  }
  function addMod(){
    if(!mTitle.trim()) return;
    const next={...F};
    const newMod={id:Date.now(),title:mTitle,duration:mDur||"30 min",done:false,description:mDesc};
    next[pilier]={...next[pilier],modules:[...next[pilier].modules,newMod]};
    save(next);setShowNewMod(false);setMTitle("");setMDur("");setMDesc("");
  }

  function startEditPilier(pk){
    setPTitle(F[pk].title);setPIcon(F[pk].icon);setPColor(F[pk].color);
    setEditPilier(pk);
  }
  function savePilier(){
    if(!pTitle.trim()) return;
    const next={...F};
    next[editPilier]={...next[editPilier],title:pTitle,icon:pIcon,color:pColor};
    save(next);setEditPilier(null);
  }
  function deletePilier(pk){
    if(Object.keys(F).length<=1){alert("Il faut au moins un pilier.");return;}
    const next={...F};delete next[pk];
    const firstKey=Object.keys(next)[0];
    save(next);setPilier(firstKey);
  }
  function addPilier(){
    if(!npTitle.trim()) return;
    const key="pilier_"+Date.now();
    const next={...F,[key]:{title:npTitle,icon:npIcon,color:npColor,modules:[]}};
    save(next);setPilier(key);setShowNewPilier(false);setNpTitle("");setNpIcon("📚");setNpColor("#7C3AED");
  }

  function resetUserProgress(userId){
    if(!setProgress) return;
    const next={...progress};
    delete next[userId];
    setProgress(next);
  }

  function toggleUserModule(userId, moduleId, score){
    if(!setProgress) return;
    const next={...progress};
    if(!next[userId]) next[userId]={};
    if(next[userId][moduleId]?.done){
      const u={...next[userId]};
      delete u[moduleId];
      next[userId]=u;
    } else {
      next[userId]={...next[userId],[moduleId]:{done:true,score:score||null}};
    }
    setProgress(next);
  }

  /* ── Toolbox helpers ── */
  const MODULE_TEMPLATES=[
    {emoji:"\uD83D\uDCD6",title:"Module th\u00e9orique",duration:"45 min",description:"Cours magistral avec supports visuels et exemples concrets"},
    {emoji:"\uD83E\uDDEA",title:"Quiz d'\u00e9valuation",duration:"20 min",description:"QCM et questions ouvertes pour valider les acquis"},
    {emoji:"\uD83C\uDFAD",title:"Roleplay / Simulation",duration:"60 min",description:"Mise en situation r\u00e9elle avec feedback personnalis\u00e9"},
    {emoji:"\uD83D\uDD27",title:"Atelier pratique",duration:"50 min",description:"Exercices guid\u00e9s en conditions r\u00e9elles"},
    {emoji:"\uD83D\uDCCB",title:"\u00c9tude de cas",duration:"40 min",description:"Analyse d\u2019une situation concr\u00e8te avec discussion"},
    {emoji:"\uD83D\uDCAC",title:"D\u00e9brief collectif",duration:"30 min",description:"Retour d\u2019exp\u00e9rience et partage de bonnes pratiques"},
  ];

  const CONTENT_BLOCKS=[
    {emoji:"\uD83D\uDCDD",label:"Texte",desc:"Contenu th\u00e9orique, d\u00e9finitions, explications",snippet:"\n\n\uD83D\uDCDD TEXTE\n[Contenu th\u00e9orique ici...]"},
    {emoji:"\uD83C\uDFAC",label:"Vid\u00e9o",desc:"Lien vers une vid\u00e9o de d\u00e9monstration",snippet:"\n\n\uD83C\uDFAC VID\u00c9O\nLien : [URL de la vid\u00e9o]\nDur\u00e9e : ___ min"},
    {emoji:"\u2753",label:"Quiz",desc:"Questions pour tester la compr\u00e9hension",snippet:"\n\n\u2753 QUIZ\n- Question 1 ?\n- Question 2 ?"},
    {emoji:"\u270F\uFE0F",label:"Exercice",desc:"Pratique guid\u00e9e avec consignes",snippet:"\n\n\u270F\uFE0F EXERCICE\nConsigne : [D\u00e9crire l\u2019exercice]\nDur\u00e9e : ___ min\nLivrable attendu : ___"},
    {emoji:"\u2705",label:"Checklist",desc:"Liste de points \u00e0 valider",snippet:"\n\n\u2705 CHECKLIST\n- [ ] Point 1\n- [ ] Point 2\n- [ ] Point 3"},
    {emoji:"\uD83D\uDD17",label:"Lien externe",desc:"Ressource compl\u00e9mentaire en ligne",snippet:"\n\n\uD83D\uDD17 LIEN EXTERNE\nTitre : ___\nURL : [lien]\nDescription : ___"},
  ];

  const RESOURCES=[
    {emoji:"\uD83D\uDCDE",label:"Scripts d\u2019appel",desc:"4 phases : Introduction, D\u00e9couverte, Pitch, Closing"},
    {emoji:"\uD83D\uDEE1\uFE0F",label:"Fiches objections",desc:"5 objections avec reformulation, argument et rebond"},
    {emoji:"\uD83E\uDDE0",label:"Matrice Neuroatypiques",desc:"25 combinaisons prof \u00d7 trouble avec arguments"},
    {emoji:"\uD83D\uDD26",label:"Moteur Lanterne V5",desc:"Algorithme Dual Path + g\u00e9n\u00e9rateur d\u2019arguments"},
    {emoji:"\uD83E\uDDE9",label:"Profils psychologiques",desc:"4 profils : Introverti, D\u00e9crocheur, Comp\u00e9titeur, Stress\u00e9"},
  ];

  function insertTemplate(tpl){
    const pk=pilier;
    if(!F[pk]) return;
    const next={...F};
    const newMod={id:Date.now(),title:`${tpl.emoji} ${tpl.title}`,duration:tpl.duration,done:false,description:tpl.description};
    next[pk]={...next[pk],modules:[...next[pk].modules,newMod]};
    save(next);
  }

  function copySnippet(snippet,idx){
    navigator.clipboard.writeText(snippet).then(()=>{
      setCopiedSnippet(idx);
      setTimeout(()=>setCopiedSnippet(null),1500);
    });
  }

  const pill=F[pilier]||Object.values(F)[0];
  const allModules=Object.values(F).flatMap(p=>p.modules);
  const salesUsers=USERS.filter(u=>u.role==="sales");

  const BLOCK_TYPES=[{id:"text",emoji:"📝",label:"Texte"},{id:"video",emoji:"🎬",label:"Vidéo"},{id:"pdf",emoji:"📄",label:"PDF"},{id:"quiz",emoji:"❓",label:"Quiz"},{id:"exercise",emoji:"✏️",label:"Exercice"},{id:"checklist",emoji:"✅",label:"Checklist"},{id:"link",emoji:"🔗",label:"Liens"}];
  const BLOCK_COLORS={text:"#0B68B4",video:"#E11D48",pdf:"#D97706",quiz:"#7C3AED",exercise:"#DA4F00",checklist:"#16A34A",link:"#6B7280"};

  // ═══ DETAIL MODULE EDITOR (full screen) ═══
  if(detailMod){
    const dm=F[detailMod.pk]?.modules[detailMod.idx];
    const pc=F[detailMod.pk]?.color||"#DA4F00";
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <Btn sm outline color="#71717A" onClick={()=>setDetailMod(null)} style={{marginBottom:8}}>← Retour aux modules</Btn>
          <h1 style={{fontSize:20,fontWeight:900,color:"#18181B",fontFamily:"'Outfit',sans-serif",margin:0}}>{dmTitle||"Nouveau module"}</h1>
          <div style={{fontSize:12,color:"#71717A",marginTop:2}}>{F[detailMod.pk]?.icon} {F[detailMod.pk]?.title} — Module {detailMod.idx+1}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn color="#71717A" outline onClick={()=>setDetailMod(null)}>Annuler</Btn>
          <Btn color={pc} onClick={saveDetailMod}>Sauvegarder</Btn>
        </div>
      </div>

      {/* Meta */}
      <C style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>Informations du module</div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
          <div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Titre *</div><input value={dmTitle} onChange={e=>setDmTitle(e.target.value)} style={{width:"100%",fontSize:14,fontWeight:700,border:"1px solid #E4E4E7",borderRadius:8,padding:"10px 12px",boxSizing:"border-box",fontFamily:"'Outfit',sans-serif"}}/></div>
          <div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Durée</div><input value={dmDur} onChange={e=>setDmDur(e.target.value)} placeholder="45 min" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"10px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
        </div>
        <div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Description courte</div><input value={dmDesc} onChange={e=>setDmDesc(e.target.value)} placeholder="Résumé en une ligne..." style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"10px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
      </C>

      {/* Objectives */}
      <C style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>🎯 Objectifs pédagogiques</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
          {dmObjectives.map((obj,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:"#F0FDF4",border:"1px solid #C0EAD3"}}>
              <span style={{color:"#16A34A",fontWeight:700,fontSize:12}}>✓</span>
              <span style={{flex:1,fontSize:12,color:"#3F3F46"}}>{obj}</span>
              <button onClick={()=>removeObjective(i)} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"#E11D48"}}>✗</button>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={newObjText} onChange={e=>setNewObjText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addObjective()} placeholder="Ajouter un objectif..." style={{flex:1,fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",fontFamily:"'Inter',sans-serif"}}/>
          <Btn sm color="#16A34A" onClick={addObjective} disabled={!newObjText.trim()}>+ Ajouter</Btn>
        </div>
      </C>

      {/* Content blocks */}
      <C style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📄 Contenu du module</div>
          <div style={{display:"flex",gap:4}}>
            {BLOCK_TYPES.map(bt=>(
              <button key={bt.id} onClick={()=>addContentBlock(bt.id)} title={`Ajouter ${bt.label}`} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #E4E4E7",background:"#FAFAFA",cursor:"pointer",fontSize:11,fontWeight:600,color:"#71717A",fontFamily:"'Outfit',sans-serif"}}>{bt.emoji} {bt.label}</button>
            ))}
          </div>
        </div>

        {dmContent.length===0&&<div style={{textAlign:"center",padding:32,color:"#A1A1AA",fontSize:13,border:"2px dashed #E4E4E7",borderRadius:10}}>Aucun contenu — utilise les boutons ci-dessus pour ajouter des blocs</div>}

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {dmContent.map((blk,i)=>{
            const bc=BLOCK_COLORS[blk.type]||"#71717A";
            const bt=BLOCK_TYPES.find(b=>b.id===blk.type);
            return <div key={i} style={{borderRadius:12,border:`1px solid ${bc}35`,overflow:"hidden"}}>
              {/* Block header */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:bc+"08",borderBottom:`1px solid ${bc}20`}}>
                <span style={{fontSize:16}}>{bt?.emoji||"📝"}</span>
                <Pill color={bc}>{bt?.label||blk.type}</Pill>
                <div style={{flex:1}}/>
                <button onClick={()=>moveContentBlock(i,-1)} disabled={i===0} style={{padding:"3px 6px",borderRadius:5,border:"1px solid #E4E4E7",background:"#fff",cursor:i===0?"default":"pointer",opacity:i===0?.3:1,fontSize:11}}>↑</button>
                <button onClick={()=>moveContentBlock(i,1)} disabled={i===dmContent.length-1} style={{padding:"3px 6px",borderRadius:5,border:"1px solid #E4E4E7",background:"#fff",cursor:i===dmContent.length-1?"default":"pointer",opacity:i===dmContent.length-1?.3:1,fontSize:11}}>↓</button>
                <button onClick={()=>removeContentBlock(i)} style={{padding:"3px 6px",borderRadius:5,border:"1px solid #FEE2E2",background:"#FFF1F2",cursor:"pointer",fontSize:11,color:"#E11D48"}}>🗑</button>
              </div>
              {/* Block body */}
              <div style={{padding:14}}>
                <div style={{marginBottom:8}}><input value={blk.title} onChange={e=>updateContentBlock(i,"title",e.target.value)} placeholder="Titre de la section" style={{width:"100%",fontSize:13,fontWeight:700,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",boxSizing:"border-box",fontFamily:"'Outfit',sans-serif"}}/></div>

                {/* Video block */}
                {blk.type==="video"&&<div>
                  <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>URL YouTube</div>
                  <input value={blk.url||""} onChange={e=>updateContentBlock(i,"url",e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",marginBottom:8}}/>
                  {getYouTubeId(blk.url)&&<div style={{borderRadius:10,overflow:"hidden",marginBottom:8}}><iframe width="100%" height="280" src={`https://www.youtube.com/embed/${getYouTubeId(blk.url)}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div>}
                  {blk.url&&!getYouTubeId(blk.url)&&<div style={{fontSize:11,color:"#E11D48",marginBottom:8}}>URL YouTube invalide</div>}
                  <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Description (optionnel)</div>
                  <textarea value={blk.body||""} onChange={e=>updateContentBlock(i,"body",e.target.value)} rows={2} placeholder="Ce que montre cette vidéo..." style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/>
                </div>}

                {/* PDF block */}
                {blk.type==="pdf"&&<div>
                  <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>URL du PDF</div>
                  <input value={blk.url||""} onChange={e=>updateContentBlock(i,"url",e.target.value)} placeholder="https://example.com/presentation.pdf" style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",marginBottom:8}}/>
                  {blk.url&&<div style={{borderRadius:10,overflow:"hidden",border:"1px solid #E4E4E7",marginBottom:8}}>
                    <iframe src={blk.url} width="100%" height="400" style={{border:"none",borderRadius:10}}/>
                  </div>}
                  <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Description (optionnel)</div>
                  <textarea value={blk.body||""} onChange={e=>updateContentBlock(i,"body",e.target.value)} rows={2} placeholder="Ce que contient ce document..." style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/>
                </div>}

                {/* Quiz block — visual editor */}
                {blk.type==="quiz"&&<div>
                  {(blk.quiz||[]).map((q,qIdx)=>(
                    <div key={qIdx} style={{padding:14,borderRadius:10,border:"1px solid #DDD6FE",background:"#F5F3FF",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{fontSize:12,fontWeight:800,color:"#7C3AED",fontFamily:"'Outfit',sans-serif"}}>Question {qIdx+1}</span>
                        <button onClick={()=>removeQuizQuestion(i,qIdx)} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"#E11D48"}}>Supprimer</button>
                      </div>
                      <input value={q.question} onChange={e=>updateQuizQuestion(i,qIdx,"question",e.target.value)} placeholder="Écris ta question ici..." style={{width:"100%",fontSize:13,fontWeight:600,border:"1px solid #DDD6FE",borderRadius:8,padding:"9px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",marginBottom:8}}/>
                      <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:6}}>Choix de réponses (coche la bonne)</div>
                      {q.choices.map((c,cIdx)=>(
                        <div key={cIdx} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                          <button onClick={()=>updateQuizQuestion(i,qIdx,"correctIndex",cIdx)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${q.correctIndex===cIdx?"#16A34A":"#D4D4D8"}`,background:q.correctIndex===cIdx?"#16A34A":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{q.correctIndex===cIdx&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}</button>
                          <input value={c} onChange={e=>updateQuizChoice(i,qIdx,cIdx,e.target.value)} placeholder={`Choix ${cIdx+1}`} style={{flex:1,fontSize:12,border:"1px solid #E4E4E7",borderRadius:6,padding:"6px 10px",fontFamily:"'Inter',sans-serif"}}/>
                          {q.choices.length>2&&<button onClick={()=>removeQuizChoice(i,qIdx,cIdx)} style={{border:"none",background:"none",cursor:"pointer",fontSize:11,color:"#E11D48"}}>x</button>}
                        </div>
                      ))}
                      <button onClick={()=>addQuizChoice(i,qIdx)} style={{fontSize:11,color:"#7C3AED",background:"none",border:"none",cursor:"pointer",fontWeight:600,marginTop:2}}>+ Ajouter un choix</button>
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:4}}>Explication (affichée après réponse)</div>
                        <input value={q.explanation||""} onChange={e=>updateQuizQuestion(i,qIdx,"explanation",e.target.value)} placeholder="Pourquoi c'est la bonne réponse..." style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:6,padding:"6px 10px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>addQuizQuestion(i)} style={{width:"100%",padding:10,borderRadius:8,border:"2px dashed #DDD6FE",background:"#F5F3FF",cursor:"pointer",fontSize:12,fontWeight:700,color:"#7C3AED",fontFamily:"'Outfit',sans-serif"}}>+ Ajouter une question</button>
                </div>}

                {/* Text, exercise, checklist, link — textarea */}
                {!["quiz","video","pdf"].includes(blk.type)&&<textarea value={blk.body} onChange={e=>updateContentBlock(i,"body",e.target.value)} rows={blk.body?.split("\n").length>6?Math.min(blk.body.split("\n").length+1,20):6} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"10px 12px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>}
              </div>
            </div>;
          })}
        </div>
      </C>

      {/* Save bar */}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn outline color="#71717A" onClick={()=>setDetailMod(null)}>Annuler</Btn>
        <Btn color={pc} onClick={saveDetailMod} style={{padding:"12px 28px"}}>Sauvegarder le module</Btn>
      </div>
    </div>;
  }

  return <div>
    <ST emoji="\uD83C\uDF93" sub="G\u00e9rez les formations et suivez la progression de l\u2019\u00e9quipe.">Éditeur Formations</ST>

    {/* Mode toggle */}
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[["edit","\u270F\uFE0F \u00c9diteur","Cr\u00e9er et modifier les formations"],["progress","\uD83D\uDCCA Suivi \u00e9quipe","Voir la progression des Sales"],["toolbox","\uD83E\uDDF0 Bo\u00eete \u00e0 outils","Templates, blocs et ressources"]].map(([id,label,sub])=>(
        <button key={id} onClick={()=>setViewMode(id)} style={{flex:1,padding:"10px 14px",borderRadius:12,border:`2px solid ${viewMode===id?"#DA4F00":"#E4E4E7"}`,background:viewMode===id?"#FFF7F0":"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
          <div style={{fontSize:13,fontWeight:800,color:viewMode===id?"#DA4F00":"#18181B",fontFamily:"'Outfit',sans-serif"}}>{label}</div>
          <div style={{fontSize:11,color:"#71717A",marginTop:2}}>{sub}</div>
        </button>
      ))}
    </div>

    {/* ═══ EDIT MODE ═══ */}
    {viewMode==="edit"&&<div>
    {/* Piliers */}
    <C style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📚 Piliers de formation</div>
        <Btn sm color="#DA4F00" onClick={()=>setShowNewPilier(!showNewPilier)}>+ Nouveau pilier</Btn>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {Object.entries(F).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
            <button onClick={()=>setPilier(k)} style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${pilier===k?v.color:"#E4E4E7"}`,background:pilier===k?v.color:"#fff",color:pilier===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.icon} {v.title}</button>
            <button onClick={()=>startEditPilier(k)} style={{padding:"5px 8px",borderRadius:8,border:"1px solid #E4E4E7",background:"#fff",cursor:"pointer",fontSize:12,color:"#71717A"}}>✏️</button>
          </div>
        ))}
      </div>

      {showNewPilier&&<div style={{marginTop:14,padding:14,background:"#F8FFF9",borderRadius:10,border:"1px solid #C0EAD3"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#15803D",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>Nouveau pilier</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8,marginBottom:8}}>
          <input value={npTitle} onChange={e=>setNpTitle(e.target.value)} placeholder="Nom du pilier" style={{fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",fontFamily:"'Inter',sans-serif"}}/>
          <input value={npIcon} onChange={e=>setNpIcon(e.target.value)} placeholder="🎯" style={{fontSize:18,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px",textAlign:"center"}}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {COLORS.map(c=><button key={c} onClick={()=>setNpColor(c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:npColor===c?"3px solid #18181B":"2px solid transparent",cursor:"pointer"}}/>)}
        </div>
        <div style={{display:"flex",gap:7}}>
          <Btn sm color="#16A34A" onClick={addPilier}>Créer</Btn>
          <Btn sm outline color="#71717A" onClick={()=>setShowNewPilier(false)}>Annuler</Btn>
        </div>
      </div>}

      {editPilier&&<div style={{marginTop:14,padding:14,background:"#FFF7F0",borderRadius:10,border:"1px solid #FED7AA"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#C2410C",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>Modifier le pilier</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px",gap:8,marginBottom:8}}>
          <input value={pTitle} onChange={e=>setPTitle(e.target.value)} style={{fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",fontFamily:"'Inter',sans-serif"}}/>
          <input value={pIcon} onChange={e=>setPIcon(e.target.value)} style={{fontSize:18,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px",textAlign:"center"}}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {COLORS.map(c=><button key={c} onClick={()=>setPColor(c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:pColor===c?"3px solid #18181B":"2px solid transparent",cursor:"pointer"}}/>)}
        </div>
        <div style={{display:"flex",gap:7}}>
          <Btn sm color="#DA4F00" onClick={savePilier}>Sauvegarder</Btn>
          <Btn sm outline color="#E11D48" onClick={()=>deletePilier(editPilier)}>🗑️ Supprimer</Btn>
          <Btn sm outline color="#71717A" onClick={()=>setEditPilier(null)}>Annuler</Btn>
        </div>
      </div>}
    </C>

    {pill&&<C>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{pill.icon} Modules — {pill.title}</div>
        <Btn sm color={pill.color} onClick={()=>{setShowNewMod(true);setEditMod(null);setMTitle("");setMDur("");setMDesc("");}}>+ Ajouter un module</Btn>
      </div>

      {showNewMod&&<div style={{marginBottom:14,padding:14,background:pill.color+"08",borderRadius:10,border:`1px solid ${pill.color}35`}}>
        <div style={{fontSize:12,fontWeight:700,color:pill.color,marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>Nouveau module</div>
        <div style={{marginBottom:8}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Titre *</div><input value={mTitle} onChange={e=>setMTitle(e.target.value)} placeholder="Titre du module" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
        <div style={{marginBottom:8}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Durée</div><input value={mDur} onChange={e=>setMDur(e.target.value)} placeholder="30 min" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
        <div style={{marginBottom:10}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Description</div><textarea value={mDesc} onChange={e=>setMDesc(e.target.value)} placeholder="Ce que les Sales vont apprendre…" rows={2} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/></div>
        <div style={{display:"flex",gap:7}}><Btn sm color={pill.color} onClick={addMod} disabled={!mTitle.trim()}>Ajouter</Btn><Btn sm outline color="#71717A" onClick={()=>setShowNewMod(false)}>Annuler</Btn></div>
      </div>}

      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {pill.modules.length===0&&<div style={{textAlign:"center",padding:24,color:"#A1A1AA",fontSize:13}}>Aucun module — clique sur "Ajouter un module".</div>}
        {pill.modules.map((m,i)=>(
          <div key={m.id||i}>
            {editMod?.pk===pilier&&editMod?.idx===i?(
              <div style={{padding:14,borderRadius:10,border:`2px solid ${pill.color}`,background:pill.color+"06"}}>
                <div style={{marginBottom:8}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Titre *</div><input value={mTitle} onChange={e=>setMTitle(e.target.value)} style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
                <div style={{marginBottom:8}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Durée</div><input value={mDur} onChange={e=>setMDur(e.target.value)} style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
                <div style={{marginBottom:10}}><div style={{fontSize:11,color:"#71717A",marginBottom:4}}>Description</div><textarea value={mDesc} onChange={e=>setMDesc(e.target.value)} rows={2} style={{width:"100%",fontSize:12,border:"1px solid #E4E4E7",borderRadius:8,padding:"8px 11px",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",gap:7}}><Btn sm color={pill.color} onClick={saveMod}>Sauvegarder</Btn><Btn sm outline color="#71717A" onClick={()=>setEditMod(null)}>Annuler</Btn></div>
              </div>
            ):(
              <C style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderLeft:`4px solid ${pill.color}`,cursor:"pointer"}} onClick={()=>openDetailMod(pilier,i)}>
                <div style={{width:32,height:32,borderRadius:9,background:pill.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{m.title}</div>
                  <div style={{fontSize:11,color:"#A1A1AA",marginTop:1}}>⏱ {m.duration}{m.description&&` · ${m.description}`}</div>
                  {(m.content?.length>0||m.objectives?.length>0)&&<div style={{display:"flex",gap:4,marginTop:4}}>{m.objectives?.length>0&&<Pill color="#16A34A">{m.objectives.length} objectifs</Pill>}{m.content?.length>0&&<Pill color="#0B68B4">{m.content.length} blocs</Pill>}</div>}
                </div>
                <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>openDetailMod(pilier,i)} style={{padding:"5px 9px",borderRadius:7,border:"1px solid #C0EAD3",background:"#F0FDF4",cursor:"pointer",fontSize:11,fontWeight:600,color:"#16A34A",fontFamily:"'Outfit',sans-serif"}}>Ouvrir</button>
                  <button onClick={()=>startEditMod(pilier,i)} style={{padding:"5px 9px",borderRadius:7,border:"1px solid #E4E4E7",background:"#fff",cursor:"pointer",fontSize:12}}>✏️</button>
                  <button onClick={()=>deleteMod(pilier,i)} style={{padding:"5px 9px",borderRadius:7,border:"1px solid #FEE2E2",background:"#FFF1F2",cursor:"pointer",fontSize:12,color:"#E11D48"}}>🗑️</button>
                </div>
              </C>
            )}
          </div>
        ))}
      </div>
    </C>}
    </div>}

    {/* ═══ PROGRESS MODE ═══ */}
    {viewMode==="progress"&&<div>
      {/* Pilier tabs */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {Object.entries(F).map(([k,v])=>(
          <button key={k} onClick={()=>setPilier(k)} style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${pilier===k?v.color:"#E4E4E7"}`,background:pilier===k?v.color:"#fff",color:pilier===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.icon} {v.title}</button>
        ))}
      </div>

      {/* Per-user progress */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {salesUsers.map(u=>{
          const up=progress[u.id]||{};
          const globalDone=allModules.filter(m=>up[m.id]?.done).length;
          const globalPct=allModules.length>0?Math.round((globalDone/allModules.length)*100):0;
          const pilModules=pill?.modules||[];
          const pilDone=pilModules.filter(m=>up[m.id]?.done).length;
          const pilPct=pilModules.length>0?Math.round((pilDone/pilModules.length)*100):0;
          const cc=globalPct>=70?"#16A34A":globalPct>=40?"#DA4F00":"#E11D48";

          return <C key={u.id} style={{borderTop:`4px solid ${u.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{u.avatar}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{u.name}</div>
                  <div style={{fontSize:11,color:"#71717A"}}>{globalDone}/{allModules.length} modules globaux</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:20,fontWeight:900,color:cc,fontFamily:"'Outfit',sans-serif"}}>{globalPct}%</div>
                  <div style={{fontSize:10,color:"#71717A"}}>global</div>
                </div>
                <Btn sm outline color="#E11D48" onClick={()=>resetUserProgress(u.id)}>Reset</Btn>
              </div>
            </div>

            {/* Global progress bar */}
            <div style={{height:6,background:"#E4E4E7",borderRadius:99,marginBottom:14}}>
              <div style={{height:6,background:cc,borderRadius:99,width:`${globalPct}%`,transition:"width .5s"}}/>
            </div>

            {/* Pilier-specific modules */}
            <div style={{fontSize:12,fontWeight:700,color:"#18181B",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>{pill?.icon} {pill?.title} — {pilDone}/{pilModules.length} ({pilPct}%)</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {pilModules.map(m=>{
                const done=up[m.id]?.done;
                const score=up[m.id]?.score;
                return <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:done?"#F0FDF4":"#FAFAFA",border:`1px solid ${done?"#C0EAD3":"#E4E4E7"}`}}>
                  <button onClick={()=>toggleUserModule(u.id,m.id,80)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${done?"#16A34A":"#E4E4E7"}`,background:done?"#16A34A":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#fff",flexShrink:0}}>{done?"✓":""}</button>
                  <div style={{flex:1,fontSize:12,color:done?"#15803D":"#71717A",fontWeight:done?600:400}}>{m.title}</div>
                  {done&&score&&<Pill color="#16A34A">{score}%</Pill>}
                </div>;
              })}
            </div>
          </C>;
        })}
      </div>
    </div>}

    {/* ═══ TOOLBOX MODE ═══ */}
    {viewMode==="toolbox"&&<div>

      {/* Pilier tabs (same as other modes so templates insert into the right pilier) */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {Object.entries(F).map(([k,v])=>(
          <button key={k} onClick={()=>setPilier(k)} style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${pilier===k?v.color:"#E4E4E7"}`,background:pilier===k?v.color:"#fff",color:pilier===k?"#fff":"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v.icon} {v.title}</button>
        ))}
      </div>

      {/* ── Section 1: Templates de modules ── */}
      <C style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📦 Templates de modules</div>
            <div style={{fontSize:11,color:"#71717A",marginTop:2}}>Ins\u00e9rer un module pr\u00e9-configur\u00e9 dans <span style={{fontWeight:700,color:pill?.color}}>{pill?.icon} {pill?.title}</span></div>
          </div>
          <Pill color={pill?.color||"#DA4F00"}>{pill?.modules?.length||0} modules</Pill>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {MODULE_TEMPLATES.map((tpl,i)=>(
            <div key={i} style={{padding:14,borderRadius:10,border:"1px solid #E4E4E7",background:"#FAFAFA",display:"flex",gap:12,alignItems:"flex-start",transition:"all .15s"}}>
              <div style={{width:40,height:40,borderRadius:10,background:"#fff",border:"1px solid #E4E4E7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{tpl.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{tpl.title}</div>
                <div style={{fontSize:11,color:"#71717A",marginTop:2}}>\u23F1 {tpl.duration}</div>
                <div style={{fontSize:11,color:"#A1A1AA",marginTop:3,lineHeight:1.4}}>{tpl.description}</div>
              </div>
              <button onClick={()=>insertTemplate(tpl)} title={`Ajouter dans ${pill?.title}`} style={{width:32,height:32,borderRadius:8,border:"1px solid #C0EAD3",background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"#16A34A",flexShrink:0,transition:"all .15s"}}>+</button>
            </div>
          ))}
        </div>
      </C>

      {/* ── Section 2: Blocs de contenu ── */}
      <C style={{marginBottom:14}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📝 Blocs de contenu</div>
          <div style={{fontSize:11,color:"#71717A",marginTop:2}}>Snippets \u00e0 copier puis coller dans la description d\u2019un module</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {CONTENT_BLOCKS.map((blk,i)=>(
            <div key={i} style={{padding:12,borderRadius:10,border:"1px solid #E4E4E7",background:"#FAFAFA",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:24,marginBottom:6}}>{blk.emoji}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{blk.label}</div>
              <div style={{fontSize:10,color:"#A1A1AA",marginTop:3,lineHeight:1.3,minHeight:26}}>{blk.desc}</div>
              <button onClick={()=>copySnippet(blk.snippet,i)} style={{marginTop:8,padding:"5px 14px",borderRadius:7,border:`1px solid ${copiedSnippet===i?"#16A34A":"#E4E4E7"}`,background:copiedSnippet===i?"#F0FDF4":"#fff",cursor:"pointer",fontSize:11,fontWeight:600,color:copiedSnippet===i?"#16A34A":"#71717A",fontFamily:"'Outfit',sans-serif",transition:"all .15s"}}>{copiedSnippet===i?"\u2713 Copi\u00e9 !":"Copier"}</button>
            </div>
          ))}
        </div>
      </C>

      {/* ── Section 3: Bibliothèque de ressources ── */}
      <C>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>📚 Biblioth\u00e8que de ressources</div>
          <div style={{fontSize:11,color:"#71717A",marginTop:2}}>Contenu existant dans l\u2019app, r\u00e9utilisable dans vos formations</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {RESOURCES.map((res,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,border:"1px solid #E4E4E7",background:"#FAFAFA"}}>
              <div style={{width:38,height:38,borderRadius:10,background:"#fff",border:"1px solid #E4E4E7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{res.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{res.label}</div>
                <div style={{fontSize:11,color:"#A1A1AA",marginTop:2}}>{res.desc}</div>
              </div>
              <Pill color="#7C3AED">R\u00e9f\u00e9rence</Pill>
            </div>
          ))}
        </div>
      </C>

    </div>}
  </div>;
}

export default FormateurFormations;
