import { useState } from 'react';
import { ST, C, Btn, Pill, Stat } from '../ui';
import { USERS } from '../../constants/brand';
import { today } from '../../lib/utils';

function ManagerUsers({extraUsers,setExtraUsers}){
  const [showForm,setShowForm]=useState(false);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("sales");
  const [done,setDone]=useState(false);
  const AVATAR_COLORS=["#16A34A","#0B68B4","#DA4F00","#7C3AED","#E11D48","#0891B2","#D97706"];
  const allUsers=[...USERS,...(extraUsers||[])];

  function getInitials(n){return n.trim().split(" ").map(w=>w[0]||"").join("").slice(0,2).toUpperCase();}
  function randColor(){return AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)];}

  function addUser(){
    if(!name.trim()||!email.trim()) return;
    const newUser={
      id:"user_"+Date.now(),
      name:name.trim(),
      prenom:name.trim().split(" ")[0],
      role,
      avatar:getInitials(name),
      color:randColor(),
      email:email.trim(),
      createdAt:today(),
    };
    setExtraUsers(p=>[...(p||[]),newUser]);
    setName("");setEmail("");setRole("sales");setShowForm(false);setDone(true);
    setTimeout(()=>setDone(false),3000);
  }
  function deleteUser(id){
    setExtraUsers(p=>(p||[]).filter(u=>u.id!==id));
  }

  const rc={sales:"#16A34A",manager:"#0B68B4",formateur:"#DA4F00"};
  const rl={sales:"Sales 📞",manager:"Manager 👔",formateur:"Formateur 🎓"};

  return <div>
    <ST emoji="👥" sub="Créez et gérez les comptes de l'équipe. Le mot de passe est commun à tous les comptes.">Gestion des utilisateurs</ST>

    {done&&<div style={{marginBottom:12,padding:"11px 16px",borderRadius:10,background:"#D1FAE5",border:"1px solid #86EFAC",fontSize:13,fontWeight:600,color:"#15803D"}}>✅ Utilisateur créé ! Il peut se connecter dès maintenant avec le mot de passe commun.</div>}

    {/* Mot de passe commun */}
    <C style={{marginBottom:14,background:"#F0FDF4",border:"1px solid #C0EAD3"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🔒</span>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>Mot de passe commun : <span style={{fontFamily:"monospace",background:"#D1FAE5",padding:"2px 10px",borderRadius:6,fontSize:14,letterSpacing:".1em"}}>Sherpas2026</span></div>
          <div style={{fontSize:11,color:"#71717A",marginTop:2}}>Tous les comptes utilisent le même mot de passe. Pour le changer, modifie la variable PASSWORD dans le HTML.</div>
        </div>
      </div>
    </C>

    {/* Stats rapides */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[["📞","Sales",allUsers.filter(u=>u.role==="sales").length,"#16A34A"],["👔","Managers",allUsers.filter(u=>u.role==="manager").length,"#0B68B4"],["🎓","Formateurs",allUsers.filter(u=>u.role==="formateur").length,"#DA4F00"]].map(([ic,l,v,c])=>(
        <C key={l} style={{padding:14,textAlign:"center",borderTop:`3px solid ${c}`}}>
          <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
          <div style={{fontSize:22,fontWeight:900,color:c,fontFamily:"'Outfit',sans-serif"}}>{v}</div>
          <div style={{fontSize:11,color:"#71717A"}}>{l}</div>
        </C>
      ))}
    </div>

    {/* Bouton créer */}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
      <Btn color="#1E40AF" onClick={()=>setShowForm(!showForm)}>+ Créer un utilisateur</Btn>
    </div>

    {/* Formulaire création */}
    {showForm&&<C style={{marginBottom:14,border:"2px solid #1E40AF",background:"#EFF6FF"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#1E40AF",marginBottom:14,fontFamily:"'Outfit',sans-serif"}}>➕ Nouveau compte</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Prénom & Nom *</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Marie Dupont" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"9px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
        <div><div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:5}}>Email *</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="marie@sherpas.com" type="email" style={{width:"100%",fontSize:13,border:"1px solid #E4E4E7",borderRadius:8,padding:"9px 12px",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}/></div>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:600,color:"#71717A",marginBottom:8}}>Rôle *</div>
        <div style={{display:"flex",gap:9}}>
          {[["sales","Sales 📞","#16A34A"],["manager","Manager 👔","#0B68B4"],["formateur","Formateur 🎓","#DA4F00"]].map(([r,l,c])=>(
            <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${role===r?c:"#E4E4E7"}`,background:role===r?c+"10":"#fff",color:role===r?c:"#71717A",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{l}</button>
          ))}
        </div>
      </div>
      {!name.trim()||!email.trim()?<div style={{fontSize:11,color:"#E11D48",marginBottom:8}}>* Prénom/Nom et Email requis</div>:null}
      <div style={{display:"flex",gap:8}}>
        <Btn color="#1E40AF" onClick={addUser} disabled={!name.trim()||!email.trim()}>Créer le compte →</Btn>
        <Btn outline color="#71717A" onClick={()=>setShowForm(false)}>Annuler</Btn>
      </div>
    </C>}

    {/* Tableau des utilisateurs */}
    <C style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"#EFF6FF",borderBottom:"2px solid #BFDBFE"}}>{["Compte","Email","Rôle","Statut","Action"].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#71717A",textTransform:"uppercase",fontFamily:"'Outfit',sans-serif"}}>{h}</th>)}</tr></thead>
        <tbody>
          {allUsers.map((u,i)=>{
            const isBuiltIn=USERS.some(x=>x.id===u.id);
            return <tr key={u.id} style={{borderBottom:"1px solid #F4F4F5",background:i%2===0?"#F8FAFF":"#fff"}}>
              <td style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{u.avatar}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#18181B",fontFamily:"'Outfit',sans-serif"}}>{u.name}</div>
                    {!isBuiltIn&&<div style={{fontSize:10,color:"#A1A1AA"}}>Créé le {u.createdAt||""}</div>}
                  </div>
                </div>
              </td>
              <td style={{padding:"12px 14px",fontSize:12,color:"#71717A"}}>{u.email}</td>
              <td style={{padding:"12px 14px"}}><Pill color={rc[u.role]}>{rl[u.role]}</Pill></td>
              <td style={{padding:"12px 14px"}}>{isBuiltIn?<Pill color="#16A34A">Compte fixe</Pill>:<Pill color="#0B68B4">Actif ✓</Pill>}</td>
              <td style={{padding:"12px 14px"}}>
                {!isBuiltIn
                  ?<button onClick={()=>deleteUser(u.id)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #FEE2E2",background:"#FFF1F2",color:"#E11D48",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Supprimer</button>
                  :<span style={{fontSize:11,color:"#A1A1AA"}}>—</span>
                }
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </C>
  </div>;
}

export default ManagerUsers;
