import React, { useState, useEffect, useMemo } from 'react';
import { GC, C, Pill, Stat } from '../ui';
import { Logo } from '../ui/Logo';
import { sb } from '../../lib/supabase';
import PlanDeTableView from './PlanDeTableView';

// ── Helpers dates (copiés de EmploiDuTemps) ──
function getMonday(d) { const dt = new Date(d); const day = dt.getDay(); dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1)); dt.setHours(0,0,0,0); return dt; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtLabel(d) { const j=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]; return `${j[d.getDay()]} ${d.getDate()}`; }

function MonPlanning({ user }) {
  const [schedules, setSchedules] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sherpas_edt_published_v1");
      if (raw) setSchedules(JSON.parse(raw));
    } catch {}
  }, []);

  const monday = useMemo(() => getMonday(new Date()), []);
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(monday, i)), [monday]); // Lundi à Samedi
  // juste lun-sam de cette semaine

  const email = user?.email;
  if (!email) return null;

  const hasData = days.some(d => schedules[`${email}|${fmtDate(d)}`]);
  if (!hasData) return null;

  return (
    <C style={{ marginBottom: 12, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>📅 Mon planning cette semaine</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {days.map(day => {
          const dateStr = fmtDate(day);
          const cell = schedules[`${email}|${dateStr}`];
          const isToday = fmtDate(new Date()) === dateStr;
          const colors = { working: "#16A34A", formation: "#7C3AED", ecole: "#0B68B4", off: "#A1A1AA" };
          const emojis = { working: "💼", formation: "🎓", ecole: "🏫", off: "🏠" };
          const col = cell ? colors[cell.status] || "#A1A1AA" : "#E4E4E7";
          return (
            <div key={dateStr} style={{
              flex: 1, minWidth: 60, padding: "8px 6px", borderRadius: 8, textAlign: "center",
              background: isToday ? "#FFFBEB" : "#fff",
              border: `2px solid ${isToday ? "#FCD34D" : col + "44"}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: isToday ? "#D97706" : "#71717A", marginBottom: 4 }}>{fmtLabel(day)}</div>
              {cell ? (
                <>
                  <div style={{ fontSize: 14 }}>{emojis[cell.status] || "—"}</div>
                  {cell.status === "working" && cell.start_time && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#16A34A", marginTop: 2 }}>{cell.start_time} - {cell.end_time}</div>
                  )}
                  {cell.status !== "working" && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: col, marginTop: 2 }}>{cell.status === "formation" ? "Formation" : cell.status === "ecole" ? "École" : "Off"}</div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 9, color: "#D4D4D8" }}>—</div>
              )}
            </div>
          );
        })}
      </div>
    </C>
  );
}

function MonPlanDeTable() {
  const [plan, setPlan] = useState(null);
  const [team, setTeam] = useState([]);
  const today = fmtDate(new Date());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sherpas_plan_table_published_v1");
      if (raw) {
        const all = JSON.parse(raw);
        if (all[today]) setPlan(all[today]);
      }
    } catch {}
  }, []);

  // Load team from Supabase
  useEffect(() => {
    sb.from("allowed_users").select("email, name, avatar, color").eq("active", true)
      .then(({ data }) => { if (data) setTeam(data); });
  }, []);

  if (!plan || Object.keys(plan).length === 0) return null;

  const seatEntries = Object.entries(plan).filter(([k]) => k.startsWith("pole_"));
  const remoteEntries = Object.entries(plan).filter(([k]) => k.startsWith("remote_"));

  return (
    <C style={{ marginBottom: 12, background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#6D28D9", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>🪑 Plan de table du jour</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {seatEntries.map(([key, email]) => {
          const m = team.find(t => t.email === email);
          if (!m) return null;
          const poleMatch = key.match(/pole_(\d+)_seat_(\d+)/);
          const pole = poleMatch ? parseInt(poleMatch[1]) + 1 : "?";
          return (
            <span key={key} style={{ fontSize: 10, padding: "3px 8px", background: "#fff", borderRadius: 6, border: `1px solid ${m.color || "#7C3AED"}`, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: m.color || "#7C3AED", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 900 }}>{m.avatar || (m.name||"").slice(0,2).toUpperCase()}</span>
              {(m.name || email.split("@")[0]).split(" ")[0]}
              <span style={{ fontSize: 8, color: "#A1A1AA" }}>P{pole}</span>
            </span>
          );
        })}
        {remoteEntries.map(([key, email]) => {
          const m = team.find(t => t.email === email);
          if (!m) return null;
          return (
            <span key={key} style={{ fontSize: 10, padding: "3px 8px", background: "#EFF6FF", borderRadius: 6, border: "1px solid #BFDBFE", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: m.color || "#0B68B4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 900 }}>{m.avatar || (m.name||"").slice(0,2).toUpperCase()}</span>
              {(m.name || email.split("@")[0]).split(" ")[0]}
              <span style={{ fontSize: 8, color: "#0B68B4" }}>💻</span>
            </span>
          );
        })}
      </div>
    </C>
  );
}

// ── Tips du jour (rotation quotidienne) ──
const QUOTES = [
  "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.",
  "Chaque appel est une opportunité de changer la vie d'un élève.",
  "La persévérance est la mère du succès.",
  "Un bon vendeur ne vend pas un produit, il résout un problème.",
  "L'énergie que tu mets dans ton premier appel définit ta journée.",
  "Les meilleurs closers sont ceux qui écoutent le plus.",
  "Chaque 'non' te rapproche du prochain 'oui'.",
  "Ta confiance se transmet au téléphone. Souris avant de décrocher.",
  "Le talent fait gagner des matchs, le travail d'équipe fait gagner des championnats.",
  "Ne compte pas les jours, fais que les jours comptent.",
  "Un parent convaincu aujourd'hui, c'est un élève qui réussit demain.",
  "La discipline est le pont entre les objectifs et les résultats.",
  "Ton pire appel d'aujourd'hui sera ta meilleure leçon de demain.",
  "Les obstacles sont ces choses effrayantes que tu vois quand tu détournes le regard de tes objectifs.",
  "Fais ce que tu peux, avec ce que tu as, là où tu es.",
  "Le meilleur moment pour commencer, c'était hier. Le deuxième meilleur, c'est maintenant.",
  "Sois la raison pour laquelle un parent raccroche avec le sourire.",
  "La réussite appartient à ceux qui se lèvent tôt… et qui appellent en heures de reach.",
  "L'excellence n'est pas un acte, c'est une habitude.",
  "Chaque famille que tu aides est une victoire. Cumule-les.",
];

function MotivationDuJour() {
  const dayIdx = new Date().getDate() % QUOTES.length;
  const quote = QUOTES[dayIdx];
  return (
    <C style={{ marginBottom: 12, background: "linear-gradient(135deg, #0D1F12 0%, #16A34A 100%)", border: "none", padding: "20px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>🏔️</div>
      <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.7, fontStyle: "italic", fontWeight: 500, fontFamily: "'Outfit',sans-serif" }}>"{quote}"</div>
    </C>
  );
}

// ── Mini stats ──
function MiniStats() {
  const [planning, setPlanning] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sherpas_planning_v1");
      if (raw) setPlanning(JSON.parse(raw));
    } catch {}
  }, []);

  if (!planning || !planning.counts) return null;
  const counts = planning.counts;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
      <Stat icon="📞" label="Call 0" value={counts.call0 || 0} sub="Priorité #1" color="#E11D48" />
      <Stat icon="💰" label="Vendres Abo" value={(counts.vendresAbo || 0) + (counts.vendresAboVeille || 0)} sub="À closer" color="#D97706" />
      <Stat icon="🔄" label="Relances" value={(counts.relance1||0)+(counts.relance2||0)+(counts.relance3||0)+(counts.relance4||0)} sub="En attente" color="#0B68B4" />
      <Stat icon="🎯" label="Total" value={total} sub={`${total * 3} min`} color="#16A34A" />
    </div>
  );
}

function SalesDash({rentree,user}){
  const nom = (user?.name || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return <div>
    <GC style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Logo size={18} white={true}/><Pill color="#fff" bg="rgba(255,255,255,.2)">Sales Center V5</Pill></div>
          <div style={{fontSize:21,fontWeight:900,color:"#fff",fontFamily:"'Outfit',sans-serif",marginBottom:4}}>{greeting} {nom} 👋</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.8)"}}>Ton assistant de vente augmenté par l'IA</div>
        </div>
        <div style={{fontSize:44}}>🏔️</div>
      </div>
    </GC>

    <MiniStats />
    <MonPlanning user={user} />
    <PlanDeTableView user={user} />
    <MotivationDuJour />
  </div>;
}

export default SalesDash;
