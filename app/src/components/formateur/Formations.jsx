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
  const [viewMode,setViewMode]=useState("edit"); // "edit" or "progress"

  const [mTitle,setMTitle]=useState("");const [mDur,setMDur]=useState("");const [mDesc,setMDesc]=useState("");
  const [pTitle,setPTitle]=useState("");const [pIcon,setPIcon]=useState("");const [pColor,setPColor]=useState("#16A34A");
  const [npTitle,setNpTitle]=useState("");const [npIcon,setNpIcon]=useState("📚");const [npColor,setNpColor]=useState("#7C3AED");

  const COLORS=["#16A34A","#0B68B4","#DA4F00","#7C3AED","#E11D48","#0891B2"];

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

  const pill=F[pilier]||Object.values(F)[0];
  const allModules=Object.values(F).flatMap(p=>p.modules);
  const salesUsers=USERS.filter(u=>u.role==="sales");

  return <div>
    <ST emoji="🎓" sub="Gérez les formations et suivez la progression de l'équipe.">Éditeur Formations</ST>

    {/* Mode toggle */}
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[["edit","✏️ Éditeur","Créer et modifier les formations"],["progress","📊 Suivi équipe","Voir la progression des Sales"]].map(([id,label,sub])=>(
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
              <C style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderLeft:`4px solid ${pill.color}`}}>
                <div style={{width:32,height:32,borderRadius:9,background:pill.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{m.title}</div>
                  <div style={{fontSize:11,color:"#A1A1AA",marginTop:1}}>⏱ {m.duration}{m.description&&` · ${m.description}`}</div>
                </div>
                <div style={{display:"flex",gap:5}}>
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
  </div>;
}

export default FormateurFormations;
