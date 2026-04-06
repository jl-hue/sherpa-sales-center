import { ST, C, GC, Pill } from '../ui';
import { cArr } from '../../lib/utils';

function ManagerRentree({rentree}){
  const total=rentree.length*300;const matieres=cArr(rentree,"matieres");const rappels=[...rentree].sort((a,b)=>(a.rappel||"").localeCompare(b.rappel||""));
  return <div>
    <ST emoji="📈" sub="Pipeline de rentrée et CA anticipé.">Réservoir Rentrée</ST>
    <GC style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Pill color="#fff" bg="rgba(255,255,255,.2)">CA Anticipé Rentrée</Pill><div style={{fontSize:32,fontWeight:900,color:"#fff",marginTop:4,fontFamily:"'Outfit',sans-serif"}}>{total.toLocaleString()}€</div><div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>{rentree.length} projets × 300€/mois</div></div><div style={{fontSize:36}}>📈</div></div></GC>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <C><div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>📚 Matières + demandées</div>{matieres.slice(0,5).map(([m,n],i)=><div key={m} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:14}}>{["🥇","🥈","🥉","🏅","🎖️"][i]}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#3F3F46"}}>{m}</span><span style={{fontSize:11,color:"#16A34A",fontWeight:700}}>{n}×</span></div><div style={{height:3,background:"#F4F4F5",borderRadius:99}}><div style={{height:3,background:"#16A34A",borderRadius:99,width:`${rentree.length>0?(n/rentree.length)*100:0}%`}}/></div></div></div>)}</C>
      <C><div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>📅 Rappels à venir</div>{rappels.map(r=><div key={r.id} style={{marginBottom:9,paddingBottom:9,borderBottom:"1px solid #F4F4F5",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{r.famille}</div><div style={{fontSize:11,color:"#71717A"}}>{r.classe}</div></div><Pill color="#16A34A">📅 {r.rappel}</Pill></div>)}</C>
    </div>
    <C style={{background:"#F0FDF4",border:"1px solid #C0EAD3"}}><div style={{fontWeight:700,fontSize:13,color:"#15803D",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>💰 Simulation CA</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{[["Pessimiste",Math.round(total*.5),"#E11D48"],["Réaliste",Math.round(total*.75),"#DA4F00"],["Optimiste",total,"#16A34A"]].map(([l,v,c])=><div key={l} style={{padding:"10px 12px",background:"#fff",borderRadius:10,border:`1px solid ${c}25`}}><div style={{fontSize:10,color:"#71717A",marginBottom:3,fontFamily:"'Outfit',sans-serif"}}>{l} (50/75/100%)</div><div style={{fontSize:16,fontWeight:900,color:c,fontFamily:"'Outfit',sans-serif"}}>{v.toLocaleString()}€</div></div>)}</div></C>
  </div>;
}

export default ManagerRentree;
