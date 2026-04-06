import { ST, C, Tog, Pill, Logo } from '../ui';

function FormateurStock({stock,setStock}){
  return <div>
    <ST emoji="📦" sub="Gère le stock de profs. Ces données alimentent la Lanterne V5 en temps réel.">Gestion du Stock</ST>
    <C style={{marginBottom:12,background:"#F0FDF4",border:"1px solid #C0EAD3",padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:7}}><Logo size={14}/><span style={{fontSize:12,fontWeight:600,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>🔦 Ce stock alimente directement la Lanterne V5 — modifications instantanément visibles.</span></div></C>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>{stock.map((s,i)=><C key={s.typ} style={{borderLeft:`4px solid ${s.dispo?"#16A34A":"#E11D48"}`,padding:"14px 18px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{s.typ}</div><div style={{fontSize:11,color:"#71717A",marginTop:2}}>{s.note}</div></div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#71717A",marginBottom:3}}>Quantité</div><input type="number" value={s.nb} min={0} onChange={e=>{const u=[...stock];u[i]={...u[i],nb:Number(e.target.value)};setStock(u);}} onBlur={()=>setStock([...stock])} style={{width:60,fontSize:13,fontWeight:700,border:"1px solid #E4E4E7",borderRadius:8,padding:"5px 8px",textAlign:"center",fontFamily:"'Outfit',sans-serif"}}/></div><div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#71717A",marginBottom:3}}>Dispo</div><Tog value={s.dispo} onChange={v=>{const u=[...stock];u[i]={...u[i],dispo:v};setStock(u);}} color="#16A34A"/></div><Pill color={s.dispo?"#16A34A":"#E11D48"}>{s.dispo?`✓ ${s.nb}`:"✗ Indispo"}</Pill></div></div></C>)}</div>
  </div>;
}

export default FormateurStock;
