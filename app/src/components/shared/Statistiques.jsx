import React, { useState, useEffect, useMemo } from 'react';
import { sb, fetchTeam } from '../../lib/supabase';
import { C, ST } from '../ui';

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getMonday(d) {
  const dt = new Date(d); const day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  dt.setHours(0,0,0,0); return dt;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function fmtLabel(d) {
  const j=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const m=["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
  return `${j[d.getDay()]} ${d.getDate()} ${m[d.getMonth()]}`;
}
function parseTime(s) { if (!s) return 0; const [h,m] = s.split(":").map(Number); return h * 60 + m; }
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function computeHours(members, schedules, days) {
  return members.map(m => {
    let totalMin = 0;
    days.forEach(day => {
      const cell = schedules[`${m.email}|${fmtDate(day)}`];
      if (cell && cell.status === "working" && cell.start_time && cell.end_time) {
        const mins = parseTime(cell.end_time) - parseTime(cell.start_time) - 60;
        totalMin += Math.max(0, mins);
      }
    });
    return { ...m, totalMin, totalH: (totalMin / 60).toFixed(1) };
  }).sort((a, b) => b.totalMin - a.totalMin);
}

function RankingCard({ stats, user, title }) {
  const [open, setOpen] = useState(false);
  const maxMin = Math.max(...stats.map(s => s.totalMin), 1);
  const totalTeamH = (stats.reduce((a, s) => a + s.totalMin, 0) / 60).toFixed(1);
  const nbPresents = stats.filter(s => s.totalMin > 0).length;
  return (
    <C style={{ marginBottom: 14, cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⏱️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{title}</div>
            <div style={{ fontSize: 10, color: "#71717A" }}>{nbPresents} présents · {totalTeamH}h total équipe</div>
          </div>
        </div>
        <span style={{ fontSize: 14, color: "#71717A", transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 12 }}>
          {stats.map((s, idx) => (
            <div key={s.email} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, fontSize: 11, fontWeight: 800, color: idx === 0 ? "#D97706" : "#A1A1AA", textAlign: "center" }}>
                {idx === 0 ? "🏆" : idx + 1}
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>
                {s.avatar || (s.name || "").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{(s.name || s.email.split("@")[0]).split(" ")[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: s.email === user?.email ? "#16A34A" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{s.totalH}h</span>
                </div>
                <div style={{ height: 6, background: "#F4F4F5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.totalMin / maxMin) * 100}%`, background: s.color || "#16A34A", borderRadius: 99, transition: "width .3s" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </C>
  );
}

function Statistiques({ user, isManager }) {
  const [team, setTeam] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [view, setView] = useState("semaine"); // "semaine" | "mois"
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => { fetchTeam().then(setTeam); }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: cfg } = await sb.from("config").select("value").eq("key", "edt_published").maybeSingle();
        if (cfg?.value) { setSchedules(JSON.parse(cfg.value)); return; }
      } catch {}
      try {
        const raw = localStorage.getItem("sherpas_edt_published_v1");
        if (raw) setSchedules(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const members = isManager ? team : team.filter(m => m.email === user?.email);

  // Semaine
  const monday = useMemo(() => addDays(getMonday(new Date()), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);
  const weekStats = useMemo(() => computeHours(members, schedules, weekDays), [members, schedules, weekDays]);

  // Mois
  const monthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);
  const monthDays = useMemo(() => {
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    const days = [];
    const last = new Date(y, m + 1, 0).getDate();
    for (let i = 1; i <= last; i++) days.push(new Date(y, m, i));
    return days;
  }, [monthDate]);
  const monthStats = useMemo(() => computeHours(members, schedules, monthDays), [members, schedules, monthDays]);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  return (
    <div>
      <ST emoji="📊" sub={isManager ? "Heures travaillées par l'équipe." : "Tes heures travaillées."}>{isManager ? "Statistiques équipe" : "Mes statistiques"}</ST>

      {/* Toggle semaine / mois */}
      <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10, marginBottom: 14 }}>
        <button onClick={() => setView("semaine")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: view === "semaine" ? "#fff" : "transparent", boxShadow: view === "semaine" ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 12, fontWeight: 800, color: view === "semaine" ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
          📅 Semaine
        </button>
        <button onClick={() => setView("mois")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: view === "mois" ? "#fff" : "transparent", boxShadow: view === "mois" ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 12, fontWeight: 800, color: view === "mois" ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
          🗓️ Mois
        </button>
      </div>

      {view === "semaine" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                Semaine du {fmtLabel(monday)}
                {weekOffset === 0 && <span style={{ marginLeft: 8, fontSize: 9, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>CETTE SEMAINE</span>}
              </div>
            </div>
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
            {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #16A34A", background: "#F0FDF4", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#16A34A" }}>Cette semaine</button>}
          </div>
          <RankingCard stats={weekStats} user={user} title="Heures cette semaine" />
        </>
      )}

      {view === "mois" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button onClick={() => setMonthOffset(m => m - 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                {MOIS[monthDate.getMonth()]} {monthDate.getFullYear()}
                {monthDate.getMonth() === thisMonth && monthDate.getFullYear() === thisYear && <span style={{ marginLeft: 8, fontSize: 9, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>CE MOIS</span>}
              </div>
            </div>
            <button onClick={() => setMonthOffset(m => m + 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
            {monthOffset !== 0 && <button onClick={() => setMonthOffset(0)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #16A34A", background: "#F0FDF4", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#16A34A" }}>Ce mois</button>}
          </div>
          <RankingCard stats={monthStats} user={user} title={`Heures en ${MOIS[monthDate.getMonth()]}`} />
        </>
      )}
    </div>
  );
}

export default Statistiques;
