import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeam } from '../../lib/supabase';
import { C, ST } from '../ui';

const SEATS_PER_SIDE = 4;
const TOTAL_SEATS = SEATS_PER_SIDE * 2 + 1;
const NB_POLES = 2;

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function PlanDeTableView({ user }) {
  const [team, setTeam] = useState([]);
  const [plan, setPlan] = useState({});
  const today = fmtDate(new Date());

  useEffect(() => { fetchTeam().then(setTeam); }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sherpas_plan_table_published_v1");
      if (raw) {
        const all = JSON.parse(raw);
        if (all[today]) setPlan(all[today]);
      }
    } catch {}
  }, []);

  const seatEntries = Object.entries(plan).filter(([k]) => k.startsWith("pole_"));
  const remoteEntries = Object.entries(plan).filter(([k]) => k.startsWith("remote_"));

  function renderSeat(poleIdx, seatIdx, position) {
    const key = `pole_${poleIdx}_seat_${seatIdx}`;
    const email = plan[key];
    const m = email ? team.find(t => t.email === email) : null;
    const isMe = m && m.email === user?.email;

    return (
      <div key={key} style={{
        width: position === "bout" ? 70 : 60, height: position === "bout" ? 60 : 54,
        borderRadius: 10,
        border: `2px ${m ? "solid" : "dashed"} ${isMe ? "#D97706" : m ? (m.color || "#16A34A") : "#E4E4E7"}`,
        background: isMe ? "#FFFBEB" : m ? (m.color + "12") : "#FAFAFA",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: isMe ? "0 0 8px rgba(217,119,6,.3)" : "none",
      }}>
        {m ? (
          <>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: m.color || "#16A34A",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 8, fontWeight: 900, fontFamily: "'Outfit',sans-serif",
            }}>
              {m.avatar || (m.name || "").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontSize: 8, fontWeight: isMe ? 900 : 700, color: isMe ? "#D97706" : "#18181B", marginTop: 2, fontFamily: "'Outfit',sans-serif", textAlign: "center" }}>
              {(m.name || m.email.split("@")[0]).split(" ")[0]}
            </div>
            {isMe && <div style={{ fontSize: 7, color: "#D97706", fontWeight: 800 }}>← TOI</div>}
          </>
        ) : (
          <div style={{ fontSize: 14, color: "#E4E4E7" }}>·</div>
        )}
      </div>
    );
  }

  function renderPole(poleIdx) {
    return (
      <div key={poleIdx} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#18181B", marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>Pôle {poleIdx + 1}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: SEATS_PER_SIDE }, (_, i) => renderSeat(poleIdx, i, "left"))}
          </div>
          <div style={{
            width: 50, minHeight: SEATS_PER_SIDE * 60,
            background: "linear-gradient(180deg, #D4A574 0%, #C49A6C 100%)",
            borderRadius: 8, border: "2px solid #A67C52",
            display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8,
          }}>
            <div style={{ fontSize: 8, color: "#fff", opacity: 0.6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Table</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: SEATS_PER_SIDE }, (_, i) => renderSeat(poleIdx, SEATS_PER_SIDE + i, "right"))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          {renderSeat(poleIdx, SEATS_PER_SIDE * 2, "bout")}
        </div>
      </div>
    );
  }

  if (seatEntries.length === 0 && remoteEntries.length === 0) {
    return (
      <div>
        <ST emoji="🪑" sub="Visualise ta place et celle de ton équipe.">Plan de table</ST>
        <C style={{ textAlign: "center", padding: 30, color: "#A1A1AA" }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🪑</div>
          <div style={{ fontSize: 13 }}>Pas de plan de table publié pour aujourd'hui</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Le manager n'a pas encore validé le plan du jour</div>
        </C>
      </div>
    );
  }

  return (
    <div>
      <ST emoji="🪑" sub="Visualise ta place et celle de ton équipe.">Plan de table</ST>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: NB_POLES }, (_, i) => renderPole(i))}
      </div>

      {remoteEntries.length > 0 && (
        <C style={{ marginTop: 14, background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "10px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1E40AF", marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>💻 En ligne ({remoteEntries.length})</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {remoteEntries.map(([key, email]) => {
              const m = team.find(t => t.email === email);
              if (!m) return null;
              const isMe = m.email === user?.email;
              return (
                <span key={key} style={{ fontSize: 10, padding: "3px 8px", background: isMe ? "#FFFBEB" : "#fff", borderRadius: 6, border: `1px solid ${isMe ? "#D97706" : "#BFDBFE"}`, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: m.color || "#0B68B4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 900 }}>{m.avatar || (m.name || "").slice(0, 2).toUpperCase()}</span>
                  {(m.name || email.split("@")[0]).split(" ")[0]}
                  {isMe && <span style={{ fontSize: 7, color: "#D97706", fontWeight: 800 }}>← TOI</span>}
                </span>
              );
            })}
          </div>
        </C>
      )}
    </div>
  );
}

export default PlanDeTableView;
