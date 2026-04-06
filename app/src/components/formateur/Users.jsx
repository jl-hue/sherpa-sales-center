import { ST, C, Pill } from '../ui';
import { USERS, PASSWORD } from '../../constants/brand';

function FormateurUsers(){
  const rc={sales:"#16A34A",manager:"#0B68B4",formateur:"#DA4F00"};
  const roleLabel={sales:"Sales 📞",manager:"Manager 👔",formateur:"Formateur 🎓"};
  return <div><ST emoji="👤" sub="Comptes actifs et rôles — mot de passe commun géré par le Formateur.">Utilisateurs</ST>
    <C style={{marginBottom:14,background:"#F0FDF4",border:"1px solid #C0EAD3",padding:"13px 16px"}}><div style={{fontSize:13,color:"#15803D",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>🔒 Mot de passe actuel : <span style={{letterSpacing:"0.1em",background:"#D1FAE5",padding:"2px 10px",borderRadius:6,fontFamily:"monospace",fontSize:14}}>{PASSWORD}</span> — Pour le changer, modifie le fichier HTML (variable PASSWORD).</div></C>
    <C style={{padding:0,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"#F8FFF9",borderBottom:"2px solid #C0EAD3"}}>{["Compte","Email","Rôle","Accès"].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#71717A",textTransform:"uppercase",fontFamily:"'Outfit',sans-serif"}}>{h}</th>)}</tr></thead>
      <tbody>{USERS.map((u,i)=><tr key={u.id} style={{borderBottom:"1px solid #F4F4F5",background:i%2===0?"#F8FFF9":"#fff"}}>
        <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif"}}>{u.avatar}</div>
            {u.name}
          </div>
        </td>
        <td style={{padding:"12px 14px",fontSize:12,color:"#71717A"}}>{u.email}</td>
        <td style={{padding:"12px 14px"}}><Pill color={rc[u.role]}>{roleLabel[u.role]}</Pill></td>
        <td style={{padding:"12px 14px"}}><Pill color="#16A34A">Actif ✓</Pill></td>
      </tr>)}</tbody>
    </table></C>
  </div>;
}

export default FormateurUsers;
