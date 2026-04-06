import React, { useState } from 'react';
import { NEURO_MATRIX, NEURO_PROFS, NEURO_TROUBLES, NEURO_COLORS, NEURO_EMOJIS } from '../../constants/neuro';
import { CopyBtn } from '../ui/CopyBtn';

function MatriceNeuro(){
  const [filtreProf,setFiltreProf]=useState("Tous");
  const [filtreTrouble,setFiltreTrouble]=useState("Tous");
  const [expanded,setExpanded]=useState(null);

  const filtered=NEURO_MATRIX.filter(r=>{
    if(filtreProf!=="Tous"&&r.prof!==filtreProf) return false;
    if(filtreTrouble!=="Tous"&&r.trouble!==filtreTrouble) return false;
    return true;
  });

  const BADGE={
    ideal:  {label:"✅ Idéal",     bg:"#D1FAE5",color:"#15803D",border:"#86EFAC"},
    acceptable:{label:"⚠️ Acceptable",bg:"#FEF9C3",color:"#854D0E",border:"#FDE047"},
    deconseille:{label:"❌ Déconseillé",bg:"#FEE2E2",color:"#991B1B",border:"#FCA5A5"},
  };

  return <div>
    {/* En-tête */}
    <div style={{marginBottom:18}}>
      <div style={{fontSize:15,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif",marginBottom:3}}>🧠 Matrice Neuroatypiques</div>
      <div style={{fontSize:12,color:"#71717A"}}>Matching prof × trouble — Réalité + argument commercial</div>
    </div>

    {/* Légende */}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {Object.values(BADGE).map(b=><span key={b.label} style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:b.bg,color:b.color,border:`1px solid ${b.border}`,fontWeight:700}}>{b.label}</span>)}
    </div>

    {/* Filtres */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"#71717A",marginBottom:6,fontFamily:"'Outfit',sans-serif"}}>Filtrer par professeur</div>
        <select value={filtreProf} onChange={e=>{setFiltreProf(e.target.value);setExpanded(null);}} style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:9,padding:"8px 12px",fontFamily:"'Inter',sans-serif",color:"#18181B",background:"#fff"}}>
          <option>Tous</option>
          {NEURO_PROFS.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"#71717A",marginBottom:6,fontFamily:"'Outfit',sans-serif"}}>Filtrer par trouble</div>
        <select value={filtreTrouble} onChange={e=>{setFiltreTrouble(e.target.value);setExpanded(null);}} style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:9,padding:"8px 12px",fontFamily:"'Inter',sans-serif",color:"#18181B",background:"#fff"}}>
          <option>Tous</option>
          {NEURO_TROUBLES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
    </div>

    {/* Compteur */}
    <div style={{fontSize:11,color:"#A1A1AA",marginBottom:10}}>{filtered.length} combinaison{filtered.length>1?"s":""} affichée{filtered.length>1?"s":""}</div>

    {/* Cartes */}
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {filtered.map((r,i)=>{
        const b=BADGE[r.badge];
        const key=r.prof+r.trouble;
        const open=expanded===key;
        const tc=NEURO_COLORS[r.trouble]||"#6B7280";
        return <div key={key} style={{borderRadius:14,border:`1px solid ${b.border}`,background:b.bg,overflow:"hidden"}}>
          <button onClick={()=>setExpanded(open?null:key)} style={{width:"100%",padding:"12px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:9,flex:1,minWidth:0}}>
                <span style={{fontSize:18,flexShrink:0}}>{NEURO_EMOJIS[r.trouble]||"🔷"}</span>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:800,color:tc,background:tc+"15",borderRadius:99,padding:"2px 8px",whiteSpace:"nowrap"}}>{r.trouble}</span>
                    <span style={{fontSize:10,color:"#71717A",fontWeight:600}}>×</span>
                    <span style={{fontSize:11,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{r.prof}</span>
                  </div>
                  <div style={{marginTop:4}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:b.bg,color:b.color,border:`1px solid ${b.border}`,fontWeight:700}}>{b.label}</span></div>
                </div>
              </div>
              <span style={{fontSize:14,color:b.color,flexShrink:0}}>{open?"▲":"▼"}</span>
            </div>
          </button>

          {open&&<div style={{padding:"0 16px 16px"}}>
            <div style={{height:1,background:b.border,marginBottom:12}}/>
            {/* Réalité */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:800,color:b.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>📋 La réalité</div>
              <div style={{fontSize:13,color:"#3F3F46",lineHeight:1.7,background:"rgba(255,255,255,.6)",borderRadius:9,padding:"10px 13px",borderLeft:`3px solid ${b.color}`}}>{r.realite}</div>
            </div>
            {/* En appel */}
            <div>
              <div style={{fontSize:10,fontWeight:800,color:b.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>📞 En appel</div>
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{flex:1,fontSize:13,color:"#3F3F46",lineHeight:1.7,fontStyle:"italic",background:"rgba(255,255,255,.6)",borderRadius:9,padding:"10px 13px",borderLeft:`3px solid ${b.color}`}}>{r.appel}</div>
                <CopyBtn text={r.appel}/>
              </div>
            </div>
          </div>}
        </div>;
      })}
      {filtered.length===0&&<div style={{textAlign:"center",padding:28,color:"#A1A1AA",fontSize:13}}>Aucune combinaison pour ces filtres.</div>}
    </div>
  </div>;
}

export default MatriceNeuro;
