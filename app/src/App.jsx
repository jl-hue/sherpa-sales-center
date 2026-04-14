import { useState, useEffect } from 'react';
import { sb, rowToFeedback, rowToMatching, rowToDemande, rowToRentree, rowToSuggestion, rowToStock } from './lib/supabase';
import { today } from './lib/utils';
import { USERS } from './constants/brand';
import { INIT_STOCK, INIT_SCRIPTS, INIT_OBJECTIONS, INIT_FEEDBACKS, INIT_MATCHINGS, INIT_DEMANDES, INIT_RENTREE, INIT_SUGGESTIONS, FORMATION_DEFAULT } from './constants/data';

import LoginScreen from './components/layout/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import { LoadingOverlay } from './components/ui';

import SalesDash from './components/sales/Dashboard';
import SalesLanterne from './components/sales/Lanterne';
import SalesPlanning from './components/sales/Planning';
import SalesPlanDeTable from './components/sales/PlanDeTableView';
import Statistiques from './components/shared/Statistiques';
import ObjectifsSales from './components/sales/ObjectifsSales';
import SalesScripts from './components/sales/Scripts';
import SalesRessources from './components/sales/Ressources';
import SalesObjections from './components/sales/Objections';
import SalesFormation from './components/sales/Formation';
import SalesFeedback from './components/sales/Feedback';
import SalesDemandes from './components/sales/Demandes';
import SalesRentree from './components/sales/Rentree';

import ManagerVue from './components/manager/VueGlobale';
import ManagerMatching from './components/manager/Matching';
import ManagerBesoins from './components/manager/Besoins';
import ManagerRentree from './components/manager/Rentree';
import ManagerFeedbacks from './components/manager/Feedbacks';
import ManagerProgression from './components/manager/Progression';
import ManagerUsers from './components/manager/Users';
import ManagerEquipe from './components/manager/Equipe';
import ManagerEmploiDuTemps from './components/manager/EmploiDuTemps';
import ManagerPlanDeTable from './components/manager/PlanDeTable';
import ManagerObjectifs from './components/manager/Objectifs';
import ManagerCarte from './components/manager/CarteFrance';

import FormateurScripts from './components/formateur/Scripts';
import FormateurFormations from './components/formateur/Formations';
import FormateurStock from './components/formateur/Stock';
import FormateurSuggestions from './components/formateur/Suggestions';
import FormateurUsers from './components/formateur/Users';

export default function App(){
  const [user,setUser]       = useState(null);
  const [space,setSpace]     = useState(null);
  const [page,setPage]       = useState(null);
  const [loading,setLoading] = useState(false);
  const [dbReady,setDbReady] = useState(false);
  const [dbError,setDbError] = useState(null);

  const [scripts]              = useState(INIT_SCRIPTS);
  const [objections]           = useState(INIT_OBJECTIONS);
  const [feedbacks,  setFeedbacks]   = useState(INIT_FEEDBACKS);
  const [demandes,   setDemandes]    = useState(INIT_DEMANDES);
  const [rentree,    setRentree]     = useState(INIT_RENTREE);
  const [suggestions,setSuggestions] = useState(INIT_SUGGESTIONS);
  const [stock,      setStock]       = useState(INIT_STOCK);
  const [matchings,  setMatchings]   = useState(INIT_MATCHINGS);
  const [formations, setFormations]  = useState(FORMATION_DEFAULT);
  const [extraUsers, setExtraUsers]  = useState([]);
  const [progress, setProgress] = useState({});

  async function loadAll(){
    setLoading(true); setDbError(null);
    try {
      const [fb,ma,dm,rt,sg,sk,cfg] = await Promise.all([
        sb.from("feedbacks").select("*").order("created_at",{ascending:false}),
        sb.from("matchings").select("*").order("created_at",{ascending:false}),
        sb.from("demandes").select("*").order("created_at",{ascending:false}),
        sb.from("rentree").select("*").order("created_at",{ascending:false}),
        sb.from("suggestions").select("*").order("created_at",{ascending:false}),
        sb.from("stock").select("*").order("id"),
        sb.from("config").select("*"),
      ]);
      const anyErr = fb.error||ma.error||dm.error||rt.error||sg.error||sk.error;
      if(anyErr) throw new Error(anyErr.message);
      if(fb.data?.length)  setFeedbacks(fb.data.map(rowToFeedback));
      if(ma.data?.length)  setMatchings(ma.data.map(rowToMatching));
      if(dm.data?.length)  setDemandes(dm.data.map(rowToDemande));
      if(rt.data?.length)  setRentree(rt.data.map(rowToRentree));
      if(sg.data?.length)  setSuggestions(sg.data.map(rowToSuggestion));
      if(sk.data?.length)  setStock(sk.data.map(rowToStock));
      if(cfg.data&&!cfg.error){
        const fRow=cfg.data.find(r=>r.key==="formations");
        const uRow=cfg.data.find(r=>r.key==="extra_users");
        if(fRow?.value) try{setFormations(JSON.parse(fRow.value));}catch(e){}
        if(uRow?.value) try{setExtraUsers(JSON.parse(uRow.value));}catch(e){}
        const pRow=cfg.data.find(r=>r.key==="formation_progress");
        if(pRow?.value) try{setProgress(JSON.parse(pRow.value));}catch(e){}
      }
      setDbReady(true);
    } catch(e){
      console.warn("Supabase indisponible — mode local actif:",e.message);
      setDbError(e.message);
      setDbReady(false);
    } finally { setLoading(false); }
  }

  function handleLogin(u){
    const roleToSpace={sales:"sales",manager:"manager",formateur:"formateur"};
    const roleToPage={sales:"dash",manager:"m-vue",formateur:"f-scripts"};
    setUser(u);
    setSpace(roleToSpace[u.role]);
    setPage(roleToPage[u.role]);
    setTimeout(()=>loadAll(), 0);
  }

  async function logout(){
    try { await sb.auth.signOut(); } catch {}
    setUser(null);setSpace(null);setPage(null);
    setDbReady(false);setDbError(null);
    setFeedbacks(INIT_FEEDBACKS);setMatchings(INIT_MATCHINGS);
    setDemandes(INIT_DEMANDES);setRentree(INIT_RENTREE);setSuggestions(INIT_SUGGESTIONS);setProgress({});
  }

  useEffect(()=>{
    if(!user||!dbReady) return;
    const handler=()=>loadAll();
    const channels=[
      sb.channel("fb-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"feedbacks"},handler).subscribe(),
      sb.channel("ma-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"matchings"},handler).subscribe(),
      sb.channel("dm-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"demandes"},handler).subscribe(),
      sb.channel("rt-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"rentree"},handler).subscribe(),
      sb.channel("sg-rt").on("postgres_changes",{event:"*",schema:"public",table:"suggestions"},handler).subscribe(),
      sb.channel("sk-rt").on("postgres_changes",{event:"*",schema:"public",table:"stock"},handler).subscribe(),
    ];
    return ()=>channels.forEach(c=>{ try{sb.removeChannel(c);}catch(e){} });
  },[user,dbReady]);

  async function addFeedback(f){
    setFeedbacks(p=>[f,...p]);
    try{const row={date:f.date,auteur:f.auteur,anonyme:f.anonyme,client_types:f.clientTypes||[],objections:f.objections||[],bien:f.bien||[],bloque:f.bloque||[],confiance:f.confiance,suggestions:f.suggestions||""};await sb.from("feedbacks").insert(row);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function addMatching(m){
    setMatchings(p=>[m,...p]);
    try{const row={date:m.date,auteur:m.auteur,ideal_typ:m.idealTyp,chosen_typ:m.chosenTyp,followed:m.followed,niveau:m.niveau||"",psycho:m.psycho||""};await sb.from("matchings").insert(row);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function addDemande(d){
    setDemandes(p=>[d,...p]);
    try{const row={date:d.date,auteur:d.auteur,cp:d.cp,ville:d.ville,matieres:d.matieres||[],niveau:d.niveau,typo:d.typo||[]};await sb.from("demandes").insert(row);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function addRentree(r){
    setRentree(p=>[r,...p]);
    try{const row={date:r.date,auteur:r.auteur,famille:r.famille,classe:r.classe,matieres:r.matieres||[],rappel:r.rappel,notes:r.notes||""};await sb.from("rentree").insert(row);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function addSuggestion(s){
    setSuggestions(p=>[s,...p]);
    try{const row={date:s.date,auteur:s.auteur,type:s.type,contenu:s.contenu,statut:"pending"};await sb.from("suggestions").insert(row);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function updateSuggestionStatut(id,statut){
    setSuggestions(p=>p.map(s=>s.id===id?{...s,statut}:s));
    try{await sb.from("suggestions").update({statut}).eq("id",id);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function deleteSuggestion(id){
    setSuggestions(p=>p.filter(s=>s.id!==id));
    try{await sb.from("suggestions").delete().eq("id",id);}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function updateStock(newStock){
    setStock(newStock);
    try{for(const s of newStock){await sb.from("stock").update({dispo:s.dispo,nb:s.nb}).eq("typ",s.typ);}}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function saveFormations(next){
    setFormations(next);
    try{await sb.from("config").upsert({key:"formations",value:JSON.stringify(next)},{onConflict:"key"});}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function saveProgress(next){
    setProgress(next);
    try{await sb.from("config").upsert({key:"formation_progress",value:JSON.stringify(next)},{onConflict:"key"});}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }
  async function saveExtraUsers(fn){
    const next=typeof fn==="function"?fn(extraUsers):fn;
    setExtraUsers(next);
    try{await sb.from("config").upsert({key:"extra_users",value:JSON.stringify(next)},{onConflict:"key"});}
    catch(e){console.warn("Supabase write skipped:",e.message);}
  }

  if(!user||!space||!page) return <LoginScreen onLogin={handleLogin}/>;

  const myFeedbacks = user.role==="sales" ? feedbacks.filter(f=>f.auteur===user.name) : feedbacks;
  const myDemandes  = user.role==="sales" ? demandes.filter(d=>d.auteur===user.name)  : demandes;
  const myRentree   = user.role==="sales" ? rentree.filter(r=>r.auteur===user.name)   : rentree;
  const myMatchings = user.role==="sales" ? matchings.filter(m=>m.auteur===user.name) : matchings;

  const dbBanner = loading
    ? <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"9px 16px",marginBottom:12,fontSize:12,color:"#1D4ED8",display:"flex",alignItems:"center",gap:8}}><div style={{width:14,height:14,border:"2px solid #93C5FD",borderTopColor:"#1D4ED8",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/> Synchronisation avec Supabase...</div>
    : dbError
    ? <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"9px 16px",marginBottom:12,fontSize:12,color:"#991B1B",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>Warning Mode local ({dbError.slice(0,60)})</span><button onClick={loadAll} style={{background:"#EF4444",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>Réessayer</button></div>
    : null;

  const pages={
    dash:      ()=><SalesDash rentree={myRentree} user={user}/>,
    lanterne:  ()=><SalesLanterne stock={stock} setMatchings={addMatching} user={user}/>,
    planning:  ()=><SalesPlanning user={user}/>,
    "plan-table": ()=><SalesPlanDeTable user={user}/>,
    "stats":     ()=><Statistiques user={user} isManager={false}/>,
    "objectifs": ()=><ObjectifsSales user={user}/>,
    scripts:   ()=><SalesScripts scripts={scripts}/>,
    objections:()=><SalesObjections objections={objections} setSuggestions={(s)=>addSuggestion(s)}/>,
    ressources:()=><SalesRessources scripts={scripts} objections={objections} setSuggestions={(s)=>addSuggestion(s)}/>,
    formation: ()=><SalesFormation formations={formations} progress={progress} setProgress={saveProgress} user={user}/>,
    feedback:  ()=><SalesFeedback feedbacks={myFeedbacks} setFeedbacks={addFeedback} setSuggestions={addSuggestion} user={user}/>,
    demandes:  ()=><SalesDemandes demandes={myDemandes} setDemandes={addDemande} user={user}/>,
    rentree:   ()=><SalesRentree rentree={myRentree} setRentree={addRentree} user={user}/>,
    "m-vue":        ()=><ManagerVue feedbacks={feedbacks} rentree={rentree} matchings={matchings}/>,
    "m-equipe":     ()=><ManagerEquipe user={user}/>,
    "m-edt":        ()=><ManagerEmploiDuTemps user={user}/>,
    "m-plan":       ()=><ManagerPlanDeTable user={user}/>,
    "m-stats":      ()=><Statistiques user={user} isManager={true}/>,
    "m-objectifs":  ()=><ManagerObjectifs user={user}/>,
    "m-carte":      ()=><ManagerCarte user={user}/>,
    "m-matching":   ()=><ManagerMatching matchings={matchings}/>,
    "m-besoins":    ()=><ManagerBesoins feedbacks={feedbacks}/>,
    "m-rentree":    ()=><ManagerRentree rentree={rentree}/>,
    "m-feedback":   ()=><ManagerFeedbacks feedbacks={feedbacks}/>,
    "m-progression":()=><ManagerProgression matchings={matchings}/>,
    "m-users":      ()=><ManagerUsers extraUsers={extraUsers} setExtraUsers={saveExtraUsers}/>,
    "f-scripts":    ()=><FormateurScripts scripts={scripts} setScripts={()=>{}}/>,
    "f-formations": ()=><FormateurFormations formations={formations} setFormations={saveFormations} progress={progress} setProgress={saveProgress}/>,
    "f-stock":      ()=><FormateurStock stock={stock} setStock={updateStock}/>,
    "f-suggestions":()=><FormateurSuggestions suggestions={suggestions} setSuggestions={setSuggestions} updateStatut={updateSuggestionStatut} deleteSugg={deleteSuggestion}/>,
    "f-users":      ()=><FormateurUsers/>,
  };
  const Page=pages[page]||(()=>null);

  return <div style={{display:"flex",height:"100vh",fontFamily:"'Inter',sans-serif",background:"#F8FFF9"}}>
    <Sidebar role={space} page={page} setPage={setPage} setSpace={setSpace} onLogout={logout} user={user} dbReady={dbReady} loading={loading}/>
    <div style={{flex:1,overflow:"auto",padding:26,marginLeft:226}}>
      {dbBanner}
      <Page/>
    </div>
  </div>;
}
