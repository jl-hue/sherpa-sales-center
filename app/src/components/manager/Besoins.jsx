import { ST, C, Pill } from '../ui';
import { cArr } from '../../lib/utils';

function ManagerBesoins({feedbacks}){
  const cc=cArr(feedbacks,"clientTypes");const bc=cArr(feedbacks,"bien").slice(0,4);const sugs=feedbacks.filter(f=>f.suggestions&&f.suggestions.trim()!=="");
  return <div>
    <ST emoji="🎯" sub="Ce dont l'équipe a besoin pour progresser.">Besoins formation</ST>
    <C style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>👤 Profils clients les + rencontrés</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{cc.map(([l,n])=><div key={l} style={{padding:"6px 12px",borderRadius:99,background:"#E1FFED",border:"1px solid #C0EAD3",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>{l}</span><span style={{fontSize:10,background:"#16A34A",color:"#fff",borderRadius:99,padding:"1px 7px",fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>{n}</span></div>)}</div></C>
    <C style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>✅ Points forts à capitaliser</div>{bc.map(([l,n],i)=><div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}><span style={{fontSize:16}}>{["🥇","🥈","🥉","🏅"][i]}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#3F3F46"}}>{l}</span><span style={{fontSize:11,color:"#16A34A",fontWeight:700}}>{n}×</span></div><div style={{height:3,background:"#F4F4F5",borderRadius:99}}><div style={{height:3,background:"#16A34A",borderRadius:99,width:`${feedbacks.length>0?(n/feedbacks.length)*100:0}%`}}/></div></div></div>)}</C>
    <C><div style={{fontWeight:700,fontSize:13,color:"#18181B",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>💡 Suggestions remontées</div>{sugs.length===0?<div style={{fontSize:12,color:"#A1A1AA"}}>Aucune suggestion.</div>:sugs.map(f=><div key={f.id} style={{marginBottom:9,padding:"10px 12px",background:"#F8FFF9",borderRadius:9,borderLeft:"3px solid #16A34A"}}><div style={{fontSize:10,color:"#A1A1AA",marginBottom:2}}>{f.auteur} · {f.date}</div><div style={{fontSize:12,color:"#3F3F46",fontStyle:"italic"}}>"{f.suggestions}"</div></div>)}</C>
  </div>;
}

export default ManagerBesoins;
