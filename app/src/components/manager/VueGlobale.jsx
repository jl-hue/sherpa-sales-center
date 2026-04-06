import { ST, C, GC, Stat, Pill, Logo } from '../ui';
import { cArr } from '../../lib/utils';
import { USERS } from '../../constants/brand';

function ManagerVue({feedbacks,rentree,matchings}){
  const objC=cArr(feedbacks,"objections").slice(0,3);const bloqC=cArr(feedbacks,"bloque").slice(0,3);
  const avgC=feedbacks.length?Math.round(feedbacks.reduce((s,f)=>s+f.confiance,0)/feedbacks.length*10)/10:0;
  const cc=avgC>=7?"#16A34A":avgC>=5?"#DA4F00":"#E11D48";
  const followed=matchings.filter(m=>m.followed).length;const pctFollow=matchings.length?Math.round((followed/matchings.length)*100):0;

  const salesUsers=USERS.filter(u=>u.role==="sales");
  function salesStats(name){
    const fb=feedbacks.filter(f=>f.auteur===name);
    const ma=matchings.filter(m=>m.auteur===name);
    const avgConf=fb.length?Math.round(fb.reduce((s,f)=>s+f.confiance,0)/fb.length*10)/10:0;
    const pctIdeal=ma.length?Math.round((ma.filter(m=>m.followed).length/ma.length)*100):0;
    return {fb:fb.length,ma:ma.length,avgConf,pctIdeal};
  }

  return <div>
    <ST emoji="🧭" sub="Vue globale orientée formation — alimentée en temps réel.">Vue d'ensemble</ST>

    {/* KPIs globaux */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <Stat icon="💬" label="Feedbacks" value={feedbacks.length} color="#0B68B4"/>
      <Stat icon="🎯" label="Confiance moy." value={`${avgC}/10`} color={cc}/>
      <Stat icon="⚖️" label="Suivi Idéal" value={`${pctFollow}%`} sub={`${followed}/${matchings.length} matchings`} color="#16A34A"/>
      <Stat icon="📈" label="CA Rentrée" value={`${(rentree.length*300).toLocaleString()}€`} color="#16A34A"/>
    </div>

    {/* Julien vs Jonathan */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      {salesUsers.map(u=>{
        const st=salesStats(u.name);
        const cConf=st.avgConf>=7?"#16A34A":st.avgConf>=5?"#DA4F00":"#E11D48";
        const cIdeal=st.pctIdeal>=70?"#16A34A":st.pctIdeal>=40?"#DA4F00":"#E11D48";
        return <C key={u.id} style={{borderTop:`4px solid ${u.color}`,padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{u.avatar}</div>
            <div><div style={{fontSize:15,fontWeight:800,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{u.name}</div><div style={{fontSize:11,color:"#71717A"}}>Sales 📞 · {st.fb} feedback{st.fb>1?"s":""}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:cConf+"10",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,color:cConf,fontFamily:"'Outfit',sans-serif"}}>{st.avgConf}/10</div>
              <div style={{fontSize:10,color:"#71717A",marginTop:2}}>Confiance moy.</div>
            </div>
            <div style={{background:cIdeal+"10",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,color:cIdeal,fontFamily:"'Outfit',sans-serif"}}>{st.pctIdeal}%</div>
              <div style={{fontSize:10,color:"#71717A",marginTop:2}}>Suivi Idéal</div>
            </div>
          </div>
          <div style={{marginTop:8,height:4,background:"#E4E4E7",borderRadius:99}}><div style={{height:4,background:u.color,borderRadius:99,width:`${st.pctIdeal}%`,transition:"width .5s"}}/></div>
        </C>;
      })}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <C>
        <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>🛡️ Objections signalées</div>
        {objC.map(([l,n],i)=><div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:["#E11D48","#DA4F00","#0B68B4"][i]+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:["#E11D48","#DA4F00","#0B68B4"][i],fontFamily:"'Outfit',sans-serif"}}>{i+1}</div>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#3F3F46"}}>{l}</span><span style={{fontSize:11,color:"#A1A1AA"}}>{n}x</span></div><div style={{height:3,background:"#F4F4F5",borderRadius:99}}><div style={{height:3,background:["#E11D48","#DA4F00","#0B68B4"][i],borderRadius:99,width:`${feedbacks.length>0?(n/feedbacks.length)*100:0}%`}}/></div></div>
        </div>)}
      </C>
      <C>
        <div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>🚧 Blocages récurrents</div>
        {bloqC.map(([l,n],i)=><div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#DA4F0018",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#DA4F00",fontFamily:"'Outfit',sans-serif"}}>{i+1}</div>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#3F3F46"}}>{l}</span><span style={{fontSize:11,color:"#A1A1AA"}}>{n}x</span></div><div style={{height:3,background:"#F4F4F5",borderRadius:99}}><div style={{height:3,background:"#DA4F00",borderRadius:99,width:`${feedbacks.length>0?(n/feedbacks.length)*100:0}%`}}/></div></div>
        </div>)}
      </C>
    </div>

    <C style={{background:"#F0FDF4",border:"1px solid #C0EAD3"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Logo size={14}/><span style={{fontSize:13,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>Recommandations formation automatiques</span></div>
      {["Roleplay objection prix — session équipe cette semaine","Atelier closing dual path — basé sur les pivots récents","Module 'Profils psychologiques' — renforcement toute l'équipe"].map((a,i)=><div key={i} style={{marginBottom:9,paddingBottom:9,borderBottom:i<2?"1px solid #C0EAD3":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:12,color:"#3F3F46"}}>→ {a}</div><Pill color="#16A34A">Prioritaire</Pill></div>)}
    </C>
  </div>;
}

export default ManagerVue;
