import { useState, useEffect } from 'react';
import { sb, rowToFeedback, rowToMatching, rowToDemande, rowToRentree, rowToSuggestion, rowToStock, LS_TO_SB } from './lib/supabase';
import { today } from './lib/utils';
import { USERS } from './constants/brand';
import { INIT_STOCK, INIT_SCRIPTS, INIT_OBJECTIONS, INIT_FEEDBACKS, INIT_MATCHINGS, INIT_DEMANDES, INIT_RENTREE, INIT_SUGGESTIONS, FORMATION_DEFAULT } from './constants/data';

import LoginScreen from './components/layout/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import { LoadingOverlay } from './components/ui';

import SalesDash from './components/sales/Dashboard';
import SalesLanterne from './components/sales/Lanterne';
import SalesPlanning from './components/sales/Planning';
import SalesRendezvous from './components/sales/Rendezvous';
import SalesReglages from './components/sales/Reglages';
import SalesMoi from './components/sales/Moi';
import SalesBoutique from './components/sales/Boutique';
import SalesTrophees from './components/sales/SalleTrophees';
import { Annonces as SalesAnnonces, Evenements as SalesEvenements, Trombinoscope as SalesTrombinoscope } from './components/sales/Communaute';
import { useRdvNotifier } from './lib/useRdvNotifier';
import { initEconomySync, getEquipped } from './lib/economy';
import { THEMES } from './constants/themes';
import ThemeAnimations from './components/ui/ThemeAnimations';
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
import ManagerNotifications from './components/manager/Notifications';
import ManagerBoutique from './components/manager/BoutiqueManager';

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
        // Sync EDT et Plan de table depuis Supabase → localStorage
        const edtRow=cfg.data.find(r=>r.key==="edt_published");
        if(edtRow?.value) try{localStorage.setItem("sherpas_edt_published_v1",edtRow.value);localStorage.setItem("sherpas_edt_v1",edtRow.value);}catch(e){}
        const ptRow=cfg.data.find(r=>r.key==="plan_table_published");
        if(ptRow?.value) try{localStorage.setItem("sherpas_plan_table_published_v1",ptRow.value);}catch(e){}
        // Sync toutes les autres clés config → localStorage
        Object.entries(LS_TO_SB).forEach(([lsKey,sbKey])=>{
          const row=cfg.data.find(r=>r.key===sbKey);
          if(row?.value) try{localStorage.setItem(lsKey,row.value);}catch(e){}
        });
      }
      setDbReady(true);
    } catch(e){
      console.warn("Supabase indisponible — mode local actif:",e.message);
      setDbError(e.message);
      setDbReady(false);
    } finally { setLoading(false); }
  }

  function handleLogin(u){
    // Le rôle "formateur" est désormais redirigé vers l'espace manager (formateur supprimé)
    // Les rôles "team_leader" et "admin" landent par défaut dans l'espace sales (ils sont dans l'équipe)
    const roleToSpace={sales:"sales",team_leader:"sales",admin:"sales",manager:"manager",formateur:"manager"};
    const roleToPage={sales:"dash",team_leader:"dash",admin:"dash",manager:"m-vue",formateur:"m-vue"};
    // Support du paramètre ?page=xxx dans l'URL (utilisé par l'extension Chrome)
    const params = new URLSearchParams(window.location.search);
    const forcedPage = params.get("page");
    setUser(u);
    setSpace(roleToSpace[u.role]||"sales");
    setPage(forcedPage || roleToPage[u.role]||"dash");
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

  async function deleteFeedback(id){
    setFeedbacks(p=>p.filter(f=>f.id!==id));
    try{await sb.from("feedbacks").delete().eq("id",id);}
    catch(e){console.warn("Supabase delete feedback failed:",e.message);}
  }
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

  const myFeedbacks = (user.role==="sales"||user.role==="team_leader"||user.role==="admin") ? feedbacks.filter(f=>f.auteur===user.name) : feedbacks;
  const myDemandes  = (user.role==="sales"||user.role==="team_leader"||user.role==="admin") ? demandes.filter(d=>d.auteur===user.name)  : demandes;
  const myRentree   = (user.role==="sales"||user.role==="team_leader"||user.role==="admin") ? rentree.filter(r=>r.auteur===user.name)   : rentree;
  const myMatchings = (user.role==="sales"||user.role==="team_leader"||user.role==="admin") ? matchings.filter(m=>m.auteur===user.name) : matchings;

  const dbBanner = loading
    ? <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"9px 16px",marginBottom:12,fontSize:12,color:"#1D4ED8",display:"flex",alignItems:"center",gap:8}}><div style={{width:14,height:14,border:"2px solid #93C5FD",borderTopColor:"#1D4ED8",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/> Synchronisation avec Supabase...</div>
    : dbError
    ? <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"9px 16px",marginBottom:12,fontSize:12,color:"#991B1B",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>Warning Mode local ({dbError.slice(0,60)})</span><button onClick={loadAll} style={{background:"#EF4444",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>Réessayer</button></div>
    : null;

  const pages={
    dash:      ()=><SalesDash rentree={myRentree} user={user}/>,
    lanterne:  ()=><SalesLanterne stock={stock} setMatchings={addMatching} user={user}/>,
    planning:  ()=><SalesPlanning user={user}/>,
    rdv:       ()=><SalesRendezvous user={user}/>,
    reglages:  ()=><SalesReglages user={user}/>,
    moi:       ()=><SalesMoi user={user}/>,
    boutique:  ()=><SalesBoutique user={user}/>,
    trophees:  ()=><SalesTrophees user={user}/>,
    "plan-table": ()=><SalesPlanDeTable user={user}/>,
    "stats":     ()=><Statistiques user={user} isManager={false}/>,
    "objectifs": ()=><ObjectifsSales user={user}/>,
    scripts:   ()=><SalesScripts scripts={scripts}/>,
    objections:()=><SalesObjections objections={objections} setSuggestions={(s)=>addSuggestion(s)}/>,
    ressources:()=><SalesRessources scripts={scripts} objections={objections} setSuggestions={(s)=>addSuggestion(s)} user={user}/>,
    formation: ()=><SalesFormation formations={formations} progress={progress} setProgress={saveProgress} user={user}/>,
    feedback:  ()=><SalesFeedback feedbacks={myFeedbacks} setFeedbacks={addFeedback} setSuggestions={addSuggestion} user={user}/>,
    annonces:  ()=><SalesAnnonces/>,
    evenements:()=><SalesEvenements/>,
    trombinoscope:()=><SalesTrombinoscope/>,
    demandes:  ()=><SalesDemandes demandes={myDemandes} setDemandes={addDemande} user={user}/>,
    rentree:   ()=><SalesRentree rentree={myRentree} setRentree={addRentree} user={user}/>,
    "m-vue":        ()=><ManagerVue feedbacks={feedbacks} rentree={rentree} matchings={matchings}/>,
    "m-equipe":     ()=><ManagerEquipe user={user}/>,
    "m-edt":        ()=><ManagerEmploiDuTemps user={user}/>,
    "m-plan":       ()=><ManagerPlanDeTable user={user}/>,
    "m-stats":      ()=><Statistiques user={user} isManager={true}/>,
    "m-objectifs":  ()=><ManagerObjectifs user={user}/>,
    "m-carte":      ()=><ManagerCarte user={user}/>,
    "m-notif":      ()=><ManagerNotifications user={user}/>,
    "m-boutique":   ()=><ManagerBoutique user={user}/>,
    "m-matching":   ()=><ManagerMatching matchings={matchings}/>,
    "m-besoins":    ()=><ManagerBesoins feedbacks={feedbacks}/>,
    "m-rentree":    ()=><ManagerRentree rentree={rentree}/>,
    "m-feedback":   ()=><ManagerFeedbacks feedbacks={feedbacks} deleteFeedback={deleteFeedback}/>,
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
    <ThemedSidebar role={space} page={page} setPage={setPage} setSpace={setSpace} onLogout={logout} user={user} dbReady={dbReady} loading={loading}/>
    <ThemedContent user={user}>
      {dbBanner}
      <Page/>
    </ThemedContent>
    <RdvAlertOverlay user={user}/>
  </div>;
}

// Wrapper qui passe le thème équipé à la sidebar
function ThemedSidebar(props) {
  const [themeId, setThemeId] = useState(() => getEquipped(props.user?.email).theme || "default");
  useEffect(() => {
    const cleanup = initEconomySync();
    const h = () => setThemeId(getEquipped(props.user?.email).theme || "default");
    window.addEventListener("sherpointsChanged", h);
    h();
    return () => { window.removeEventListener("sherpointsChanged", h); cleanup && cleanup(); };
  }, [props.user?.email]);
  const theme = THEMES[themeId] || THEMES.default;
  return <Sidebar {...props} theme={theme} />;
}

// Wrapper qui applique le thème équipé au contenu principal
function ThemedContent({ user, children }) {
  const [themeId, setThemeId] = useState(() => getEquipped(user?.email).theme || "default");
  useEffect(() => {
    const cleanup = initEconomySync();
    const h = () => setThemeId(getEquipped(user?.email).theme || "default");
    window.addEventListener("sherpointsChanged", h);
    h();
    return () => { window.removeEventListener("sherpointsChanged", h); cleanup && cleanup(); };
  }, [user?.email]);
  const theme = THEMES[themeId] || THEMES.default;
  const bgStyle = theme.bgImage
    ? { background: `url("${theme.bgImage}") center top / cover no-repeat fixed, ${theme.bg}` }
    : { background: theme.bg };
  const themeVars = theme.vars || {};
  return (
    <div data-theme={theme.id} className={theme.dark ? "theme-dark" : ""}
      style={{ flex: 1, overflow: "auto", padding: 26, marginLeft: 226, position: "relative", transition: "background .3s", ...bgStyle, ...themeVars }}>
      {theme.dark && <DarkThemeOverrides />}
      <ThemeAnimations theme={theme} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// CSS injecté en mode sombre : force les textes/fonds clairs en variantes sombres lisibles
function DarkThemeOverrides() {
  // Helper : ciblage d'un attribut style contenant une chaîne (insensible à l'espace)
  // On utilise [style*="..."] qui matche n'importe quelle position dans le style inline
  return (
    <style>{`
      /* ── TEXTES SOMBRES → CLAIRS ── */
      .theme-dark [style*="color: #18181B"], .theme-dark [style*="color:#18181B"],
      .theme-dark [style*="color: rgb(24, 24, 27)"] { color: #F5F5F5 !important; }
      .theme-dark [style*="color: #3F3F46"], .theme-dark [style*="color:#3F3F46"],
      .theme-dark [style*="color: #52525B"], .theme-dark [style*="color:#52525B"] { color: #E4E4E7 !important; }
      .theme-dark [style*="color: #71717A"], .theme-dark [style*="color:#71717A"] { color: #D4D4D8 !important; }
      .theme-dark [style*="color: #A1A1AA"], .theme-dark [style*="color:#A1A1AA"] { color: #A1A1AA !important; }
      .theme-dark [style*="color: #D4D4D8"], .theme-dark [style*="color:#D4D4D8"] { color: #71717A !important; }

      /* Couleurs sémantiques (success green, error red, warning orange, info blue) éclaircies */
      .theme-dark [style*="color: #15803D"], .theme-dark [style*="color:#15803D"],
      .theme-dark [style*="color: #166534"], .theme-dark [style*="color:#166534"],
      .theme-dark [style*="color: #14532D"], .theme-dark [style*="color:#14532D"] { color: #4ADE80 !important; }
      .theme-dark [style*="color: #B91C1C"], .theme-dark [style*="color:#B91C1C"],
      .theme-dark [style*="color: #DC2626"], .theme-dark [style*="color:#DC2626"],
      .theme-dark [style*="color: #E11D48"], .theme-dark [style*="color:#E11D48"],
      .theme-dark [style*="color: #991B1B"], .theme-dark [style*="color:#991B1B"] { color: #FB7185 !important; }
      .theme-dark [style*="color: #92400E"], .theme-dark [style*="color:#92400E"],
      .theme-dark [style*="color: #9A3412"], .theme-dark [style*="color:#9A3412"],
      .theme-dark [style*="color: #7C2D12"], .theme-dark [style*="color:#7C2D12"],
      .theme-dark [style*="color: #A16207"], .theme-dark [style*="color:#A16207"],
      .theme-dark [style*="color: #D97706"], .theme-dark [style*="color:#D97706"] { color: #FBBF24 !important; }
      .theme-dark [style*="color: #1E40AF"], .theme-dark [style*="color:#1E40AF"],
      .theme-dark [style*="color: #1D4ED8"], .theme-dark [style*="color:#1D4ED8"],
      .theme-dark [style*="color: #0B68B4"], .theme-dark [style*="color:#0B68B4"] { color: #60A5FA !important; }
      .theme-dark [style*="color: #6D28D9"], .theme-dark [style*="color:#6D28D9"],
      .theme-dark [style*="color: #7C3AED"], .theme-dark [style*="color:#7C3AED"] { color: #A78BFA !important; }

      /* ── FONDS CLAIRS → SOMBRES ── */
      .theme-dark [style*="background: #fff"], .theme-dark [style*="background:#fff"],
      .theme-dark [style*="background: #FFF"], .theme-dark [style*="background:#FFF"],
      .theme-dark [style*="background: #FFFFFF"], .theme-dark [style*="background:#FFFFFF"],
      .theme-dark [style*="background-color: #fff"], .theme-dark [style*="background-color:#fff"] { background-color: rgba(39,39,42,0.92) !important; }

      .theme-dark [style*="background: #F8FAFF"], .theme-dark [style*="background:#F8FAFF"],
      .theme-dark [style*="background: #fafafa"], .theme-dark [style*="background:#fafafa"],
      .theme-dark [style*="background: #FAFAFA"], .theme-dark [style*="background:#FAFAFA"],
      .theme-dark [style*="background: #F4F4F5"], .theme-dark [style*="background:#F4F4F5"],
      .theme-dark [style*="background: #F8FFF9"], .theme-dark [style*="background:#F8FFF9"] { background-color: rgba(63,63,70,0.7) !important; }

      /* Pastels colorés → dark + tinte */
      .theme-dark [style*="background: #F0FDF4"], .theme-dark [style*="background:#F0FDF4"],
      .theme-dark [style*="background: #ECFDF5"], .theme-dark [style*="background:#ECFDF5"],
      .theme-dark [style*="background: #D1FAE5"], .theme-dark [style*="background:#D1FAE5"] { background-color: rgba(22,163,74,0.18) !important; }

      .theme-dark [style*="background: #FEF2F2"], .theme-dark [style*="background:#FEF2F2"],
      .theme-dark [style*="background: #FFF1F2"], .theme-dark [style*="background:#FFF1F2"] { background-color: rgba(225,29,72,0.18) !important; }

      .theme-dark [style*="background: #FEF3C7"], .theme-dark [style*="background:#FEF3C7"],
      .theme-dark [style*="background: #FFFBEB"], .theme-dark [style*="background:#FFFBEB"],
      .theme-dark [style*="background: #FFF7ED"], .theme-dark [style*="background:#FFF7ED"],
      .theme-dark [style*="background: #FFF7F0"], .theme-dark [style*="background:#FFF7F0"] { background-color: rgba(217,119,6,0.18) !important; }

      .theme-dark [style*="background: #EFF6FF"], .theme-dark [style*="background:#EFF6FF"],
      .theme-dark [style*="background: #EAF9FF"], .theme-dark [style*="background:#EAF9FF"],
      .theme-dark [style*="background: #DBEAFE"], .theme-dark [style*="background:#DBEAFE"] { background-color: rgba(59,130,246,0.18) !important; }

      .theme-dark [style*="background: #FAF5FF"], .theme-dark [style*="background:#FAF5FF"],
      .theme-dark [style*="background: #F5F3FF"], .theme-dark [style*="background:#F5F3FF"],
      .theme-dark [style*="background: #FCE7F3"], .theme-dark [style*="background:#FCE7F3"] { background-color: rgba(168,85,247,0.18) !important; }

      /* ── INPUTS / SELECTS / TEXTAREAS ── */
      .theme-dark input, .theme-dark textarea, .theme-dark select {
        background-color: rgba(39,39,42,0.95) !important;
        color: #F5F5F5 !important;
        border-color: rgba(82,82,91,0.6) !important;
      }
      .theme-dark input::placeholder, .theme-dark textarea::placeholder { color: #71717A !important; }
      .theme-dark select option { background-color: #18181B !important; color: #F5F5F5 !important; }

      /* ── DIVERS ── */
      .theme-dark code { background: rgba(82,82,91,0.4) !important; color: #F5F5F5 !important; padding: 1px 5px; border-radius: 4px; }
      .theme-dark hr, .theme-dark [style*="border-bottom: 1px solid #F4F4F5"] { border-color: rgba(82,82,91,0.4) !important; }

      /* Bordures claires → légèrement plus visibles sur fond noir */
      .theme-dark [style*="border: 1px solid #E4E4E7"], .theme-dark [style*="border:1px solid #E4E4E7"],
      .theme-dark [style*="border: 1px solid #F4F4F5"], .theme-dark [style*="border:1px solid #F4F4F5"] { border-color: rgba(82,82,91,0.5) !important; }
    `}</style>
  );
}

// Overlay global pour les alertes RDV — affiché quel que soit l'onglet actif
function RdvAlertOverlay({ user }) {
  const { alertRdv, dismissAlert, snoozeAlert, markDone } = useRdvNotifier(user);
  if (!alertRdv) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", color: "#fff", borderRadius: 20, padding: "30px 36px", maxWidth: 440, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.4)", animation: "pulseRdv 1.5s infinite" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📞</div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", opacity: .85, marginBottom: 6 }}>Rendez-vous maintenant</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>{alertRdv.titre}</div>
        {alertRdv.contact && <div style={{ fontSize: 14, marginBottom: 6 }}>📱 {alertRdv.contact}</div>}
        {alertRdv.notes && <div style={{ fontSize: 13, opacity: .9, marginBottom: 14, whiteSpace: "pre-wrap" }}>{alertRdv.notes}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={markDone} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#16A34A", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>✅ Terminé</button>
          <button onClick={() => snoozeAlert(5)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>+5 min</button>
          <button onClick={() => snoozeAlert(15)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>+15 min</button>
          <button onClick={dismissAlert} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.3)", background: "transparent", color: "rgba(255,255,255,.75)", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Fermer</button>
        </div>
      </div>
      <style>{`@keyframes pulseRdv { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }`}</style>
    </div>
  );
}
