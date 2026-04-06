import React from 'react';
import { GC, C, Pill, Stat } from '../ui';
import { Logo } from '../ui/Logo';

function SalesDash({rentree,user}){
  const nom=user?.name||"";
  return <div>
    <GC style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Logo size={18} white={true}/><Pill color="#fff" bg="rgba(255,255,255,.2)">Sales Center V5</Pill></div>
          <div style={{fontSize:21,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",marginBottom:4}}>Bonjour {nom} 👋</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.8)"}}>Le cerveau stratégique de votre vente ✦ Dual Path · Feature-to-Benefit</div>
        </div>
        <div style={{fontSize:44}}>🏔️</div>
      </div>
    </GC>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
      <Stat icon="🔦" label="Lanterne V5" value="Actif" sub="Dual Path + Arguments" color="#16A34A"/>
      <Stat icon="🏫" label="Réservoir rentrée" value={rentree.length} sub={`${rentree.length*300}€`} color="#0B68B4"/>
    </div>
    <C style={{background:"#F0FDF4",border:"1px solid #C0EAD3",marginBottom:12}}>
      <div style={{fontWeight:800,fontSize:13,color:"#15803D",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>✦ Nouveautés V5 — Lanterne augmentée</div>
      {[["🧠","Profil psychologique","Introverti, Décrocheur, Compétiteur, Stressé"],["⚖️","Curseur accompagnement","Douceur/Empathie ↔ Fermeté/Cadre"],["🎯","Objectif de vie","Remise à niveau, Concours, Méthode, Excellence"],["🔀","Dual Path matching","Option A (Idéal) vs Option B (Manuel)"],["📜","Générateur d'arguments","Hook, Trust, Pont pédagogique, Rebond"],["📋","Bouton Copier","Colle le script directement dans tes outils"]].map(([ic,t,d])=><div key={t} style={{display:"flex",gap:10,marginBottom:9,paddingBottom:9,borderBottom:"1px solid #C0EAD3"}}><span style={{fontSize:16,flexShrink:0}}>{ic}</span><div><div style={{fontSize:12,fontWeight:700,color:"#15803D",fontFamily:"'Outfit',sans-serif"}}>{t}</div><div style={{fontSize:11,color:"#71717A"}}>{d}</div></div></div>)}
    </C>
  </div>;
}

export default SalesDash;
