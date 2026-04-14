import React, { useState, useEffect } from 'react';
import { fetchTeam } from '../../lib/supabase';
import { C, ST } from '../ui';

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const TRIMESTRES = ["T1 (Sep-Nov)","T2 (Déc-Fév)","T3 (Mar-Mai)","T4 (Jun-Aoû)"];

function ObjectifsSales({ user }) {
  const [team, setTeam] = useState([]);
  const [tab, setTab] = useState("paliers");

  // Published data
  const [pubPaliers, setPubPaliers] = useState({});
  const [pubDefis, setPubDefis] = useState([]);
  const [pubOkrs, setPubOkrs] = useState({});

  useEffect(() => {
    fetchTeam().then(setTeam);
    try { setPubPaliers(JSON.parse(localStorage.getItem("sherpas_paliers_published_v1") || "{}")); } catch {}
    try { setPubDefis(JSON.parse(localStorage.getItem("sherpas_defis_published_v1") || "[]")); } catch {}
    try { setPubOkrs(JSON.parse(localStorage.getItem("sherpas_okr_published_v1") || "{}")); } catch {}
  }, []);

  const now = new Date();
  const currentMoisKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2,"0")}`;
  const currentTrimIdx = Math.floor(((now.getMonth() + 4) % 12) / 3);
  const currentTrimYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const currentTrimKey = `${currentTrimYear}-T${currentTrimIdx}`;

  // Paliers du mois courant
  const monthData = pubPaliers[currentMoisKey] || {};
  const palierNames = monthData.names || [];
  const palierMembers = monthData.members || {};

  // Classement par ventes
  const sortedTeam = [...team]
    .map(m => ({ ...m, ventes: (palierMembers[m.email] || {}).ventes || 0, seuils: (palierMembers[m.email] || {}).seuils || [] }))
    .sort((a, b) => b.ventes - a.ventes);
  const maxVentes = Math.max(...sortedTeam.map(s => s.ventes), 1);

  // Défi du mois
  const defiDuMois = pubDefis.filter(d => d.mois === now.getMonth() && d.annee === now.getFullYear());

  // OKR du trimestre
  const trimOkrs = pubOkrs[currentTrimKey] || {};

  return (
    <div>
      <ST emoji="🏆" sub="Classement des ventes, paliers et défis du mois.">Objectifs & Classement</ST>

      <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10, marginBottom: 14 }}>
        {[
          { id: "paliers", label: "📈 Classement ventes" },
          { id: "defis", label: "🏆 Défis du mois" },
          { id: "okr", label: "🎯 OKR & PIG" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t.id ? "#fff" : "transparent", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 11, fontWeight: 800, color: tab === t.id ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ CLASSEMENT VENTES + PALIERS ════════ */}
      {tab === "paliers" && (
        <div>
          <C style={{ marginBottom: 14, background: "linear-gradient(135deg, #16A34A, #62E58E)", border: "none", color: "#fff", padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", opacity: .8, marginBottom: 4 }}>📈 Classement — {MOIS[now.getMonth()]} {now.getFullYear()}</div>
            {sortedTeam[0] && <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>🏆 {(sortedTeam[0].name || sortedTeam[0].email).split(" ")[0]} — {sortedTeam[0].ventes} ventes</div>}
          </C>

          {sortedTeam.map((s, idx) => {
            const isMe = s.email === user?.email;
            const combined = palierNames.map((p, i) => ({ ...p, seuil: s.seuils[i] || 0 })).filter(p => p.seuil > 0);
            const currentPalier = [...combined].reverse().find(p => s.ventes >= p.seuil);
            const nextP = combined.find(p => p.seuil > s.ventes);

            return (
              <C key={s.email} style={{ marginBottom: 8, borderLeft: isMe ? `4px solid #D97706` : `3px solid ${s.color || "#E4E4E7"}`, background: isMe ? "#FFFBEB" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 22, fontSize: 12, fontWeight: 900, color: idx === 0 ? "#D97706" : idx === 1 ? "#A1A1AA" : idx === 2 ? "#92400E" : "#D4D4D8", textAlign: "center", fontFamily: "'Outfit',sans-serif" }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{s.avatar || (s.name||"").slice(0,2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                      {(s.name || s.email.split("@")[0]).split(" ")[0]}
                      {isMe && <span style={{ marginLeft: 6, fontSize: 9, background: "#D97706", color: "#fff", borderRadius: 4, padding: "1px 6px" }}>TOI</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{s.ventes}</div>
                    <div style={{ fontSize: 8, color: "#71717A" }}>ventes</div>
                  </div>
                </div>

                {/* Barre */}
                <div style={{ height: 5, background: "#F4F4F5", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${(s.ventes / maxVentes) * 100}%`, background: s.color || "#16A34A", borderRadius: 99 }} />
                </div>

                {/* Badges paliers */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {combined.map((p, i) => {
                    const atteint = s.ventes >= p.seuil;
                    return (
                      <span key={i} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: atteint ? "#F0FDF4" : "#FAFAFA", border: `1px solid ${atteint ? "#86EFAC" : "#E4E4E7"}`, color: atteint ? "#15803D" : "#A1A1AA", fontWeight: 700 }}>
                        {p.emoji} {p.seuil}{atteint ? " ✓" : ""}
                      </span>
                    );
                  })}
                  {nextP && <span style={{ fontSize: 9, color: "#D97706" }}>→ {nextP.emoji} dans {nextP.seuil - s.ventes}</span>}
                </div>
              </C>
            );
          })}
        </div>
      )}

      {/* ════════ DÉFIS DU MOIS ════════ */}
      {tab === "defis" && (
        <div>
          {defiDuMois.length === 0 && (
            <C style={{ textAlign: "center", padding: 30, color: "#A1A1AA" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🏆</div>
              <div style={{ fontSize: 13 }}>Pas de défi publié pour {MOIS[now.getMonth()]}</div>
            </C>
          )}
          {defiDuMois.map((d, i) => (
            <C key={i} style={{ marginBottom: 12, background: "linear-gradient(135deg, #7C3AED, #A855F7)", border: "none", color: "#fff", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", opacity: .8, marginBottom: 6 }}>🏆 Défi — {MOIS[d.mois]} {d.annee}</div>
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>{d.titre}</div>
              <div style={{ fontSize: 12, opacity: .9, lineHeight: 1.5 }}>{d.description}</div>
            </C>
          ))}

          {/* Classement du mois (mêmes ventes que paliers) */}
          <C>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>📊 Classement du mois</div>
            {sortedTeam.map((s, idx) => {
              const isMe = s.email === user?.email;
              return (
                <div key={s.email} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: s.ventes > 0 ? 1 : 0.5 }}>
                  <div style={{ width: 18, fontSize: 11, fontWeight: 800, color: idx === 0 ? "#D97706" : "#A1A1AA", textAlign: "center" }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 900 }}>{s.avatar || (s.name||"").slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize: 11, fontWeight: isMe ? 800 : 600, color: isMe ? "#D97706" : "#18181B", flex: 1 }}>{(s.name || s.email).split(" ")[0]}{isMe ? " (toi)" : ""}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#18181B" }}>{s.ventes}</span>
                </div>
              );
            })}
          </C>
        </div>
      )}

      {/* ════════ OKR & PIG ════════ */}
      {tab === "okr" && (
        <div>
          <C style={{ marginBottom: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF" }}>📅 {TRIMESTRES[currentTrimIdx]} {currentTrimYear}-{currentTrimYear + 1}</div>
          </C>
          {(() => {
            const myOkr = trimOkrs[user?.email];
            if (!myOkr) return (
              <C style={{ textAlign: "center", padding: 30, color: "#A1A1AA" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>🎯</div>
                <div style={{ fontSize: 13 }}>Pas d'OKR & PIG publié pour ce trimestre</div>
              </C>
            );
            return (
              <>
                {/* OKR */}
                {[myOkr.kr1, myOkr.kr2, myOkr.kr3].some(Boolean) && (
                  <C style={{ marginBottom: 12, borderLeft: "4px solid #16A34A" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>🎯 Mes OKR</div>
                    {[myOkr.kr1, myOkr.kr2, myOkr.kr3].filter(Boolean).map((kr, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "6px 10px", background: "#F0FDF4", borderRadius: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#16A34A" }}>#{i+1}</span>
                        <span style={{ fontSize: 12, color: "#3F3F46" }}>{kr}</span>
                  </div>
                ))}
                  </C>
                )}

                {/* PIG */}
                {myOkr.pigAxe && (
                  <C style={{ borderLeft: "4px solid #7C3AED" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>📌 Mon PIG</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", marginBottom: 8 }}>Axe : {myOkr.pigAxe}</div>
                    {[myOkr.pigAction1, myOkr.pigAction2, myOkr.pigAction3].filter(Boolean).map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "6px 10px", background: "#F5F3FF", borderRadius: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED" }}>→</span>
                        <span style={{ fontSize: 12, color: "#3F3F46" }}>{a}</span>
                      </div>
                    ))}
                    {myOkr.pigEval && (
                      <div style={{ marginTop: 8, padding: "8px 10px", background: myOkr.pigEval === "vert" ? "#F0FDF4" : myOkr.pigEval === "orange" ? "#FFFBEB" : "#FEF2F2", borderRadius: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          Évaluation : {myOkr.pigEval === "vert" ? "🟢 Atteint" : myOkr.pigEval === "orange" ? "🟠 En cours" : "🔴 Non atteint"}
                        </div>
                        {myOkr.pigComment && <div style={{ fontSize: 11, color: "#3F3F46", lineHeight: 1.5, fontStyle: "italic" }}>{myOkr.pigComment}</div>}
                      </div>
                    )}
                  </C>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ObjectifsSales;
