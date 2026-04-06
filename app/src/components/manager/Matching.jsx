import { ST, C, GC, Pill } from '../ui';

function ManagerMatching({matchings}){
  const total=matchings.length;const followed=matchings.filter(m=>m.followed).length;const pivoted=total-followed;const pct=total?Math.round((followed/total)*100):0;
  // Profils les plus souvent pivotés
  const pivots={};matchings.filter(m=>!m.followed).forEach(m=>{const k=`${m.idealTyp} → ${m.chosenTyp}`;pivots[k]=(pivots[k]||0)+1;});
  const pivotRanking=Object.entries(pivots).sort((a,b)=>b[1]-a[1]);
  // Profils idéaux les plus recommandés
  const idealCounts={};matchings.forEach(m=>{idealCounts[m.idealTyp]=(idealCounts[m.idealTyp]||0)+1;});
  const idealRank=Object.entries(idealCounts).sort((a,b)=>b[1]-a[1]);
  // Psychos qui pivotent le plus
  const psychoPivots={};matchings.filter(m=>!m.followed).forEach(m=>{psychoPivots[m.psycho]=(psychoPivots[m.psycho]||0)+1;});

  return <div>
    <ST emoji="⚖️" sub="Analyse de l'écart entre le profil idéal recommandé et le profil réellement vendu.">Idéal vs Manuel</ST>

    {/* Score global */}
    <GC style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <Pill color="#fff" bg="rgba(255,255,255,.2)">Taux de suivi Idéal Sherpas</Pill>
          <div style={{fontSize:36,fontWeight:900,color:"#fff",marginTop:5,fontFamily:"'Outfit',sans-serif"}}>{pct}%</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginTop:1}}>{followed} suivis · {pivoted} pivots manuels · {total} matchings total</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif"}}>{pct}%</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.7)"}}>Idéal</div>
          </div>
        </div>
      </div>
      <div style={{marginTop:12,height:8,background:"rgba(255,255,255,.2)",borderRadius:99}}><div style={{height:8,background:"#fff",borderRadius:99,width:`${pct}%`}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>0% — Toujours en pivot</span><span style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>100% — Toujours l'Idéal</span></div>
    </GC>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      {/* Profils idéaux les + recommandés */}
      <C>
        <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>✦ Profils Idéal les + recommandés</div>
        {idealRank.map(([typ,n],i)=><div key={typ} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
          <span style={{fontSize:14}}>{["🥇","🥈","🥉","🏅","🎖️"][i]||"•"}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#3F3F46"}}>{typ}</span><span style={{fontSize:11,color:"#A1A1AA"}}>{n}x</span></div>
            <div style={{height:3,background:"#F4F4F5",borderRadius:99}}><div style={{height:3,background:"#16A34A",borderRadius:99,width:`${total>0?(n/total)*100:0}%`}}/></div>
          </div>
        </div>)}
      </C>

      {/* Pivots les plus fréquents */}
      <C>
        <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>🔄 Pivots les plus fréquents</div>
        {pivotRanking.length===0?<div style={{fontSize:12,color:"#A1A1AA"}}>Aucun pivot enregistré — l'équipe suit l'Idéal 🎉</div>:pivotRanking.map(([label,n],i)=><div key={label} style={{marginBottom:10,padding:"9px 11px",background:"#FFF7F0",borderRadius:9,borderLeft:"3px solid #DA4F00"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,fontWeight:700,color:"#C2410C",fontFamily:"'Outfit',sans-serif"}}>{label}</span><Pill color="#DA4F00">{n}x</Pill></div>
        </div>)}
      </C>
    </div>

    {/* Psychos qui pivotent */}
    <C style={{marginBottom:12}}>
      <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>🧠 Profils psycho les plus difficiles à matcher</div>
      {Object.entries(psychoPivots).length===0?<div style={{fontSize:12,color:"#A1A1AA"}}>Aucune donnée de pivot disponible.</div>:Object.entries(psychoPivots).sort((a,b)=>b[1]-a[1]).map(([ps,n])=><div key={ps} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,paddingBottom:9,borderBottom:"1px solid #F4F4F5"}}>
        <div style={{fontSize:13,color:"#3F3F46",fontWeight:600}}>{ps}</div>
        <Pill color="#E11D48">{n} pivot{n>1?"s":""}</Pill>
      </div>)}
    </C>

    {/* Historique */}
    <C>
      <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>📋 Historique des matchings</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {matchings.slice(0,8).map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:m.followed?"#F0FDF4":"#FFF7F0",border:`1px solid ${m.followed?"#C0EAD3":"#FED7AA"}`}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:m.followed?"#16A34A":"#DA4F00",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,flexShrink:0}}>{m.followed?"✓":"⚡"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{m.auteur} · {m.psycho}</div>
            <div style={{fontSize:11,color:"#71717A",marginTop:1}}>{m.followed?`Idéal suivi : ${m.idealTyp}`:`Pivot : ${m.idealTyp} → ${m.chosenTyp}`}</div>
          </div>
          <span style={{fontSize:10,color:"#A1A1AA"}}>{m.date}</span>
        </div>)}
      </div>
    </C>
  </div>;
}

export default ManagerMatching;
