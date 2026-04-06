import { PROF_TYPES, RULES, PROF_LABELS, REFINE } from '../constants/profTypes';

export function computeV5(niveau,psycho,objectif_vie,accomp){
  const s=Object.fromEntries(PROF_TYPES.map(k=>[k,0]));
  const add=(r)=>{if(r)Object.entries(r).forEach(([k,v])=>{s[k]=(s[k]||0)+v;});};
  // Warn if missing rule (helps debug + fallback)
  if(!RULES.niveau[niveau]) console.warn(`computeV5: niveau "${niveau}" non trouvé dans RULES.niveau`);
  if(!RULES.psycho[psycho]) console.warn(`computeV5: psycho "${psycho}" non trouvé dans RULES.psycho`);
  if(!RULES.objectif_vie[objectif_vie]) console.warn(`computeV5: objectif_vie "${objectif_vie}" non trouvé dans RULES.objectif_vie`);
  add(RULES.niveau[niveau]);add(RULES.psycho[psycho]);add(RULES.objectif_vie[objectif_vie]);
  const a=Number.isFinite(accomp)?accomp:5;
  const douceurW=Math.max(0,(5-a)/5);const fermetW=Math.max(0,(a-5)/5);
  Object.entries(RULES.accomp_douceur).forEach(([k,v])=>{s[k]=(s[k]||0)+(v*douceurW);});
  Object.entries(RULES.accomp_fermete).forEach(([k,v])=>{s[k]=(s[k]||0)+(v*fermetW);});
  // Fallback: si tous les scores sont a 0, donner un boost generique
  const total=Object.values(s).reduce((sum,v)=>sum+v,0);
  if(total===0){
    s["Étudiant université"]=10;
    s["Étudiant grande école"]=8;
    s["Professeur EN"]=6;
  }
  return Object.entries(s).sort((a,b)=>b[1]-a[1]).map(([typ,score])=>({typ,score}));
}

export function getLabel(typ,psycho){return PROF_LABELS[typ]?.[psycho]||PROF_LABELS[typ]?.default||typ;}

export function refine(typ,matieres){
  const map=REFINE[typ];if(!map)return typ;
  for(const m of(matieres||[]))if(map[m])return map[m];
  return map.default||typ;
}
