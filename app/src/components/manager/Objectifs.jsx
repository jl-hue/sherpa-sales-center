import React, { useState, useEffect } from 'react';
import { sb, fetchTeam, syncToSupabase, loadFromSupabase, subscribeConfig } from '../../lib/supabase';
import { C, Btn, ST } from '../ui';

const LS_OKR = "sherpas_okr_v1";
const LS_PALIERS = "sherpas_paliers_v1";
const LS_DEFIS = "sherpas_defis_v1";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const TRIMESTRES = ["T1 (Sep-Nov)","T2 (Déc-Fév)","T3 (Mar-Mai)","T4 (Jun-Aoû)"];
// Trimestres commencent en septembre : Sep=T1, Déc=T2, Mar=T3, Jun=T4
function getCurrentTrimestre() { return Math.floor(((new Date().getMonth() + 4) % 12) / 3); }
function getTrimestreAnnee() {
  const m = new Date().getMonth();
  const y = new Date().getFullYear();
  return m >= 8 ? y : y - 1; // Sep-Déc = année en cours, Jan-Aoû = année précédente
}
function getCurrentMoisKey() { return `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2,"0")}`; }
function getTrimestreKey(t, y) { return `${y}-T${t}`; }

function Objectifs({ user }) {
  const [team, setTeam] = useState([]);
  const [tab, setTab] = useState("okr"); // okr | paliers | defis

  // ── OKR par sales (trimestriels) ──
  const [okrs, setOkrs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_OKR) || "{}"); } catch { return {}; }
  });
  const [editingOkr, setEditingOkr] = useState(null);
  const [okrDraft, setOkrDraft] = useState({ kr1: "", kr2: "", kr3: "", pigAxe: "", pigAction1: "", pigAction2: "", pigAction3: "", pigEval: "" });
  const [okrTrimestre, setOkrTrimestre] = useState(getCurrentTrimestre());
  const [okrAnnee, setOkrAnnee] = useState(getTrimestreAnnee());
  const okrKey = getTrimestreKey(okrTrimestre, okrAnnee);

  // ── Paliers de vente ──
  // Structure: { names: [{emoji, nom}, ...], members: { email: { ventes, seuils: [10,25,50,80] } } }
  const [paliers, setPaliers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PALIERS) || '{}'); } catch { return {}; }
  });
  const palierNames = paliers.names || [
    { emoji: "🥉", nom: "Bronze" },
    { emoji: "🥈", nom: "Argent" },
    { emoji: "🥇", nom: "Or" },
    { emoji: "💎", nom: "Diamant" },
  ];
  const [palierMois, setPalierMois] = useState(new Date().getMonth());
  const [palierAnnee, setPalierAnnee] = useState(new Date().getFullYear());
  const palierMoisKey = `${palierAnnee}-${String(palierMois).padStart(2,"0")}`;
  const palierMembers = (paliers.monthly && paliers.monthly[palierMoisKey]) || {};

  // ── Défis mensuels ──
  const [defis, setDefis] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_DEFIS) || "[]"); } catch { return []; }
  });
  const [newDefi, setNewDefi] = useState({ titre: "", description: "", mois: new Date().getMonth(), annee: new Date().getFullYear() });

  useEffect(() => { fetchTeam().then(setTeam); }, []);

  const [published, setPublished] = useState(false);
  const [pubTimestamp, setPubTimestamp] = useState(() => localStorage.getItem("sherpas_objectifs_pub_ts") || "");
  // Timestamps de publication consolidés (sync Supabase pour que tous les managers voient en temps réel)
  const [okrPubTs, setOkrPubTs] = useState(() => { try { return JSON.parse(localStorage.getItem("sherpas_okr_pub_ts") || "{}"); } catch { return {}; } });
  const [paliersPubTs, setPaliersPubTs] = useState(() => { try { return JSON.parse(localStorage.getItem("sherpas_paliers_pub_ts") || "{}"); } catch { return {}; } });
  const [defisPubTs, setDefisPubTs] = useState(() => localStorage.getItem("sherpas_defis_pub_ts") || "");

  // Hydrate depuis Supabase + subscribe realtime
  // Au mount : merge local + remote (remote prioritaire), push si local-only détecté
  useEffect(() => {
    (async () => {
      // OKR
      const ro = (await loadFromSupabase("okr_pub_ts")) || {};
      let lo = {}; try { lo = JSON.parse(localStorage.getItem("sherpas_okr_pub_ts") || "{}"); } catch {}
      // Migration : récupérer aussi les anciennes clés individuelles `sherpas_okr_pub_ts_${k}`
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("sherpas_okr_pub_ts_")) {
            const periodKey = k.replace("sherpas_okr_pub_ts_", "");
            if (!lo[periodKey]) lo[periodKey] = localStorage.getItem(k);
          }
        }
      } catch {}
      const okrMerged = { ...lo, ...ro };
      setOkrPubTs(okrMerged);
      localStorage.setItem("sherpas_okr_pub_ts", JSON.stringify(okrMerged));
      if (Object.keys(lo).some(k => !(k in ro))) await syncToSupabase("okr_pub_ts", okrMerged);

      // Paliers
      const rp = (await loadFromSupabase("paliers_pub_ts")) || {};
      let lp = {}; try { lp = JSON.parse(localStorage.getItem("sherpas_paliers_pub_ts") || "{}"); } catch {}
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("sherpas_paliers_pub_ts_")) {
            const periodKey = k.replace("sherpas_paliers_pub_ts_", "");
            if (!lp[periodKey]) lp[periodKey] = localStorage.getItem(k);
          }
        }
      } catch {}
      const palMerged = { ...lp, ...rp };
      setPaliersPubTs(palMerged);
      localStorage.setItem("sherpas_paliers_pub_ts", JSON.stringify(palMerged));
      if (Object.keys(lp).some(k => !(k in rp))) await syncToSupabase("paliers_pub_ts", palMerged);

      // Défis (string global, prend remote si existe sinon push local)
      const rd = await loadFromSupabase("defis_pub_ts");
      const ld = localStorage.getItem("sherpas_defis_pub_ts") || "";
      if (rd) { setDefisPubTs(rd); localStorage.setItem("sherpas_defis_pub_ts", rd); }
      else if (ld) { await syncToSupabase("defis_pub_ts", ld); }
    })();
    const chO = subscribeConfig("okr_pub_ts", v => { setOkrPubTs(v); localStorage.setItem("sherpas_okr_pub_ts", JSON.stringify(v)); });
    const chP = subscribeConfig("paliers_pub_ts", v => { setPaliersPubTs(v); localStorage.setItem("sherpas_paliers_pub_ts", JSON.stringify(v)); });
    const chD = subscribeConfig("defis_pub_ts", v => { setDefisPubTs(v); localStorage.setItem("sherpas_defis_pub_ts", v); });
    return () => { [chO, chP, chD].forEach(c => { try { sb.removeChannel(c); } catch {} }); };
  }, []);

  function saveOkrs(next) { setOkrs(next); localStorage.setItem(LS_OKR, JSON.stringify(next)); syncToSupabase("okr", next); }
  function savePaliers(next) { setPaliers(next); localStorage.setItem(LS_PALIERS, JSON.stringify(next)); syncToSupabase("paliers", next); }
  function saveDefis(next) { setDefis(next); localStorage.setItem(LS_DEFIS, JSON.stringify(next)); syncToSupabase("defis", next); }

  function publier() {
    localStorage.setItem("sherpas_objectifs_published_v1", JSON.stringify({ okrs, paliers, defis }));
    syncToSupabase("okr_published", okrs);
    syncToSupabase("paliers_published", paliers);
    syncToSupabase("defis_published", defis);
    const ts = `${new Date().toLocaleString("fr-FR")} par ${user?.name || user?.email || "?"}`;
    localStorage.setItem("sherpas_objectifs_pub_ts", ts);
    setPubTimestamp(ts);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  }

  return (
    <div>
      <ST emoji="🎯" sub="OKR individuels, objectifs de vente avec paliers, et défis mensuels.">Objectifs & Défis</ST>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10, marginBottom: 14 }}>
        {[
          { id: "okr", label: "🎯 OKR & PIG" },
          { id: "paliers", label: "📈 Paliers de vente" },
          { id: "defis", label: "🏆 Défis mensuels" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t.id ? "#fff" : "transparent", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 11, fontWeight: 800, color: tab === t.id ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ OKR INDIVIDUELS ════════ */}
      {tab === "okr" && (
        <div>
          {/* Sélecteur trimestre */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button onClick={() => { if (okrTrimestre === 0) { setOkrTrimestre(3); setOkrAnnee(a => a - 1); } else setOkrTrimestre(t => t - 1); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
              {TRIMESTRES[okrTrimestre]} {okrAnnee}
              {okrTrimestre === getCurrentTrimestre() && okrAnnee === new Date().getFullYear() && <span style={{ marginLeft: 8, fontSize: 9, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>EN COURS</span>}
            </div>
            <button onClick={() => { if (okrTrimestre === 3) { setOkrTrimestre(0); setOkrAnnee(a => a + 1); } else setOkrTrimestre(t => t + 1); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
          </div>

          {/* Bouton valider OKR pour ce trimestre */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Btn onClick={() => {
              const pub = JSON.parse(localStorage.getItem("sherpas_okr_published_v1") || "{}");
              pub[okrKey] = {};
              team.forEach(m => { const o = okrs[`${m.email}|${okrKey}`]; if (o) pub[okrKey][m.email] = o; });
              localStorage.setItem("sherpas_okr_published_v1", JSON.stringify(pub));
              const ts = `${new Date().toLocaleString("fr-FR")} par ${user?.name || user?.email || "?"}`;
              const nextTs = { ...okrPubTs, [okrKey]: ts };
              setOkrPubTs(nextTs);
              localStorage.setItem("sherpas_okr_pub_ts", JSON.stringify(nextTs));
              syncToSupabase("okr_pub_ts", nextTs);
              setPublished("okr"); setTimeout(() => setPublished(false), 3000);
            }} color="#16A34A" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 11 }}>
              {published === "okr" ? "✅ Publié !" : `📤 Valider ${TRIMESTRES[okrTrimestre]}`}
            </Btn>
            {okrPubTs[okrKey] && <span style={{ fontSize: 9, color: "#71717A" }}>✅ {okrPubTs[okrKey]}</span>}
          </div>

          {[...team].sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email)).map(m => {
            const okr = okrs[`${m.email}|${okrKey}`];
            const isEditing = editingOkr === m.email;
            return (
              <C key={m.email} style={{ marginBottom: 10, borderLeft: `3px solid ${m.color || "#16A34A"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{m.avatar || (m.name||"").slice(0,2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{m.name || m.email.split("@")[0]}</div>
                  </div>
                  <button onClick={() => {
                    if (isEditing) { setEditingOkr(null); return; }
                    setEditingOkr(m.email);
                    setOkrDraft(okr || { kr1: "", kr2: "", kr3: "", pigAxe: "", pigAction1: "", pigAction2: "", pigAction3: "", pigEval: "" });
                  }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#71717A" }}>
                    {isEditing ? "Annuler" : okr ? "✏️ Modifier" : "➕ Définir"}
                  </button>
                </div>

                {okr && !isEditing && (
                  <div style={{ marginTop: 4 }}>
                    {/* OKR */}
                    {[okr.kr1, okr.kr2, okr.kr3].some(Boolean) && (
                      <div style={{ padding: "8px 10px", background: "#F0FDF4", borderRadius: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#16A34A", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>🎯 OKR</div>
                        {["kr1","kr2","kr3"].map((k, i) => okr[k] && (
                          <div key={i} style={{ marginBottom: 4 }}>
                            <div style={{ fontSize: 11, color: "#3F3F46", display: "flex", gap: 6 }}>
                              <span style={{ color: "#16A34A", fontWeight: 700 }}>#{i+1}</span> {okr[k]}
                            </div>
                            {okr[`${k}Comment`] && <div style={{ fontSize: 10, color: "#71717A", fontStyle: "italic", marginLeft: 20, marginTop: 2 }}>💬 {okr[`${k}Comment`]}</div>}
                          </div>
                        ))}
                        {okr.okrComment && <div style={{ fontSize: 10, color: "#15803D", fontStyle: "italic", marginTop: 6, padding: "4px 8px", background: "rgba(255,255,255,.7)", borderRadius: 4 }}>💬 {okr.okrComment}</div>}
                      </div>
                    )}
                    {/* PIG */}
                    {okr.pigAxe && (
                      <div style={{ padding: "8px 10px", background: "#F5F3FF", borderRadius: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>📌 PIG</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#18181B", marginBottom: 4 }}>Axe : {okr.pigAxe}</div>
                        {["pigAction1","pigAction2","pigAction3"].map((k, i) => okr[k] && (
                          <div key={i} style={{ marginBottom: 4 }}>
                            <div style={{ fontSize: 11, color: "#3F3F46", display: "flex", gap: 6 }}>
                              <span style={{ color: "#7C3AED", fontWeight: 700 }}>→</span> {okr[k]}
                            </div>
                            {okr[`${k}Comment`] && <div style={{ fontSize: 10, color: "#71717A", fontStyle: "italic", marginLeft: 20, marginTop: 2 }}>💬 {okr[`${k}Comment`]}</div>}
                          </div>
                        ))}
                        {okr.pigEval && (
                          <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700 }}>
                            Évaluation : {okr.pigEval === "vert" ? "🟢" : okr.pigEval === "orange" ? "🟠" : okr.pigEval === "rouge" ? "🔴" : "—"}
                          </div>
                        )}
                        {okr.pigComment && <div style={{ fontSize: 10, color: "#6D28D9", fontStyle: "italic", marginTop: 6, padding: "4px 8px", background: "rgba(255,255,255,.7)", borderRadius: 4 }}>💬 {okr.pigComment}</div>}
                      </div>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div style={{ marginTop: 8 }}>
                    {/* OKR */}
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#16A34A", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>🎯 OKR — Objectifs</div>
                    {["kr1","kr2","kr3"].map((k, i) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <input value={okrDraft[k]} onChange={e => setOkrDraft({...okrDraft, [k]: e.target.value})} placeholder={`Objectif ${i+1}`}
                          style={{ width: "100%", fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px", boxSizing: "border-box" }} />
                        <textarea value={okrDraft[`${k}Comment`] || ""} onChange={e => setOkrDraft({...okrDraft, [`${k}Comment`]: e.target.value})} placeholder={`💬 Commentaire objectif ${i+1}`}
                          rows={1} style={{ width: "100%", fontSize: 10, border: "1px solid #E4E4E7", borderRadius: 6, padding: "4px 10px", marginTop: 2, boxSizing: "border-box", resize: "vertical", color: "#71717A", fontStyle: "italic" }} />
                      </div>
                    ))}

                    {/* Commentaire général OKR */}
                    <textarea value={okrDraft.okrComment || ""} onChange={e => setOkrDraft({...okrDraft, okrComment: e.target.value})} placeholder="💬 Commentaire général OKR"
                      rows={2} style={{ width: "100%", fontSize: 10, border: "1px solid #C0EAD3", borderRadius: 6, padding: "6px 10px", marginBottom: 10, boxSizing: "border-box", resize: "vertical", background: "#F0FDF4", fontStyle: "italic" }} />

                    {/* PIG */}
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4, marginTop: 10 }}>📌 PIG — Plan Individuel de Grinta</div>
                    <input value={okrDraft.pigAxe || ""} onChange={e => setOkrDraft({...okrDraft, pigAxe: e.target.value})} placeholder="Axe d'amélioration"
                      style={{ width: "100%", fontSize: 12, border: "1px solid #DDD6FE", borderRadius: 6, padding: "7px 10px", marginBottom: 6, boxSizing: "border-box", fontWeight: 700 }} />
                    {["pigAction1","pigAction2","pigAction3"].map((k, i) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <input value={okrDraft[k] || ""} onChange={e => setOkrDraft({...okrDraft, [k]: e.target.value})} placeholder={`Action clé ${i+1}`}
                          style={{ width: "100%", fontSize: 11, border: "1px solid #DDD6FE", borderRadius: 6, padding: "6px 10px", boxSizing: "border-box" }} />
                        <textarea value={okrDraft[`${k}Comment`] || ""} onChange={e => setOkrDraft({...okrDraft, [`${k}Comment`]: e.target.value})} placeholder={`💬 Commentaire action ${i+1}`}
                          rows={1} style={{ width: "100%", fontSize: 10, border: "1px solid #DDD6FE", borderRadius: 6, padding: "4px 10px", marginTop: 2, boxSizing: "border-box", resize: "vertical", color: "#71717A", fontStyle: "italic" }} />
                      </div>
                    ))}

                    {/* Commentaire général PIG */}
                    <textarea value={okrDraft.pigComment || ""} onChange={e => setOkrDraft({...okrDraft, pigComment: e.target.value})} placeholder="💬 Commentaire général PIG (évaluation, feedback...)"
                      rows={3} style={{ width: "100%", fontSize: 10, border: "1px solid #DDD6FE", borderRadius: 6, padding: "6px 10px", marginBottom: 6, boxSizing: "border-box", resize: "vertical", background: "#F5F3FF", fontStyle: "italic" }} />

                    <div style={{ fontSize: 10, fontWeight: 600, color: "#71717A", marginBottom: 4 }}>Évaluation fin quarter</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {[{id:"vert",emoji:"🟢",label:"Atteint"},{id:"orange",emoji:"🟠",label:"En cours"},{id:"rouge",emoji:"🔴",label:"Non atteint"}].map(ev => (
                        <button key={ev.id} onClick={() => setOkrDraft({...okrDraft, pigEval: ev.id})}
                          style={{ flex: 1, padding: "6px", borderRadius: 6, border: `2px solid ${okrDraft.pigEval === ev.id ? "#18181B" : "#E4E4E7"}`, background: okrDraft.pigEval === ev.id ? "#F4F4F5" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
                          {ev.emoji} {ev.label}
                        </button>
                      ))}
                    </div>

                    <Btn onClick={() => { saveOkrs({...okrs, [`${m.email}|${okrKey}`]: okrDraft}); setEditingOkr(null); }} color="#16A34A" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, marginTop: 4 }}>
                      💾 Sauvegarder
                    </Btn>
                  </div>
                )}
              </C>
            );
          })}
        </div>
      )}

      {/* ════════ PALIERS DE VENTE ════════ */}
      {tab === "paliers" && (
        <div>
          {/* Sélecteur mois */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button onClick={() => { if (palierMois === 0) { setPalierMois(11); setPalierAnnee(a => a - 1); } else setPalierMois(m => m - 1); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
              {MOIS[palierMois]} {palierAnnee}
              {palierMois === new Date().getMonth() && palierAnnee === new Date().getFullYear() && <span style={{ marginLeft: 8, fontSize: 9, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>CE MOIS</span>}
            </div>
            <button onClick={() => { if (palierMois === 11) { setPalierMois(0); setPalierAnnee(a => a + 1); } else setPalierMois(m => m + 1); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
          </div>

          {/* Bouton valider paliers pour ce mois */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Btn onClick={() => {
              const pub = JSON.parse(localStorage.getItem("sherpas_paliers_published_v1") || "{}");
              pub[palierMoisKey] = { names: palierNames, members: palierMembers };
              localStorage.setItem("sherpas_paliers_published_v1", JSON.stringify(pub));
              const ts = `${new Date().toLocaleString("fr-FR")} par ${user?.name || user?.email || "?"}`;
              const nextTs = { ...paliersPubTs, [palierMoisKey]: ts };
              setPaliersPubTs(nextTs);
              localStorage.setItem("sherpas_paliers_pub_ts", JSON.stringify(nextTs));
              syncToSupabase("paliers_pub_ts", nextTs);
              setPublished("paliers"); setTimeout(() => setPublished(false), 3000);
            }} color="#16A34A" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 11 }}>
              {published === "paliers" ? "✅ Publié !" : `📤 Valider ${MOIS[palierMois]}`}
            </Btn>
            {paliersPubTs[palierMoisKey] && <span style={{ fontSize: 9, color: "#71717A" }}>✅ {paliersPubTs[palierMoisKey]}</span>}
          </div>

          {/* Config des noms de paliers (commun à tous) */}
          <C style={{ marginBottom: 14, background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#6D28D9", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>⚙️ Noms des paliers (commun à tous)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {palierNames.map((p, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#A1A1AA", fontWeight: 700, width: 14 }}>{idx + 1}.</span>
                  <select value={p.emoji} onChange={e => {
                    const next = [...palierNames]; next[idx] = { ...p, emoji: e.target.value };
                    savePaliers({ ...paliers, names: next, monthly: { ...paliers.monthly, [palierMoisKey]: palierMembers } });
                  }} style={{ fontSize: 14, padding: "2px", border: "1px solid #DDD6FE", borderRadius: 4, width: 40 }}>
                    {["🥉","🥈","🥇","💎","🏆","🚀","👑","🌟","⭐","🔥","💪","🎖️"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input value={p.nom} onChange={e => {
                    const next = [...palierNames]; next[idx] = { ...p, nom: e.target.value };
                    savePaliers({ ...paliers, names: next, monthly: { ...paliers.monthly, [palierMoisKey]: palierMembers } });
                  }} style={{ flex: 1, fontSize: 11, border: "1px solid #DDD6FE", borderRadius: 4, padding: "4px 8px", fontWeight: 700 }} />
                  {palierNames.length > 3 && <button onClick={() => {
                    const next = palierNames.filter((_, i) => i !== idx);
                    savePaliers({ ...paliers, names: next, monthly: { ...paliers.monthly, [palierMoisKey]: palierMembers } });
                  }} style={{ fontSize: 10, color: "#A1A1AA", background: "none", border: "none", cursor: "pointer" }}>×</button>}
                </div>
              ))}
              {palierNames.length < 4 && (
                <button onClick={() => {
                  savePaliers({ ...paliers, names: [...palierNames, { emoji: "🎯", nom: "Palier " + (palierNames.length + 1) }], monthly: { ...paliers.monthly, [palierMoisKey]: palierMembers } });
                }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "1px dashed #DDD6FE", background: "#fff", cursor: "pointer", color: "#7C3AED", fontWeight: 700, alignSelf: "flex-start" }}>
                  ➕ Ajouter un palier
                </button>
              )}
            </div>
          </C>

          {/* Progression par sales */}
          {[...team].sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email)).map(m => {
            const mem = palierMembers[m.email] || { ventes: 0, seuils: [] };
            const seuils = mem.seuils || [];
            const ventes = mem.ventes || 0;
            // Build combined palier list
            const combined = palierNames.map((p, i) => ({ ...p, seuil: seuils[i] || 0 })).filter(p => p.seuil > 0);
            const maxSeuil = combined.length > 0 ? combined[combined.length - 1].seuil : 100;
            const nextP = combined.find(p => p.seuil > ventes);

            return (
              <C key={m.email} style={{ marginBottom: 10, borderLeft: `3px solid ${m.color || "#16A34A"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{m.avatar || (m.name||"").slice(0,2).toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", flex: 1 }}>{m.name || m.email.split("@")[0]}</div>
                  <input type="number" value={ventes} onChange={e => {
                    savePaliers({ ...paliers, names: palierNames, monthly: { ...paliers.monthly, [palierMoisKey]: { ...palierMembers, [m.email]: { ...mem, ventes: parseInt(e.target.value) || 0 } } } });
                  }} style={{ width: 50, fontSize: 12, border: "1px solid #E4E4E7", borderRadius: 6, padding: "4px 6px", textAlign: "center", fontWeight: 800 }} />
                  <span style={{ fontSize: 10, color: "#71717A" }}>ventes</span>
                  {nextP && <span style={{ fontSize: 9, color: "#D97706", fontWeight: 600 }}>→ {nextP.emoji} {nextP.nom} ({nextP.seuil - ventes})</span>}
                </div>

                {/* Barre + paliers */}
                {combined.length > 0 && (
                  <div style={{ height: 6, background: "#F4F4F5", borderRadius: 99, overflow: "visible", position: "relative", marginBottom: 6 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (ventes / maxSeuil) * 100)}%`, background: m.color || "#16A34A", borderRadius: 99 }} />
                    {combined.map(p => (
                      <div key={p.seuil} style={{ position: "absolute", left: `${Math.min(96, (p.seuil / maxSeuil) * 100)}%`, top: -4, fontSize: 10 }} title={`${p.nom} (${p.seuil})`}>{p.emoji}</div>
                    ))}
                  </div>
                )}

                {/* Seuils individuels */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {palierNames.map((p, i) => {
                    const seuil = seuils[i] || "";
                    const atteint = seuil && ventes >= seuil;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 6, background: atteint ? "#F0FDF4" : "#FAFAFA", border: `1px solid ${atteint ? "#86EFAC" : "#E4E4E7"}` }}>
                        <span style={{ fontSize: 12 }}>{p.emoji}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: atteint ? "#15803D" : "#71717A" }}>{p.nom}</span>
                        <input type="number" value={seuil} onChange={e => {
                          const newSeuils = [...seuils]; while (newSeuils.length <= i) newSeuils.push(0); newSeuils[i] = parseInt(e.target.value) || 0;
                          savePaliers({ ...paliers, names: palierNames, monthly: { ...paliers.monthly, [palierMoisKey]: { ...palierMembers, [m.email]: { ...mem, seuils: newSeuils } } } });
                        }} placeholder="—" style={{ width: 40, fontSize: 10, border: "1px solid #E4E4E7", borderRadius: 4, padding: "2px 4px", textAlign: "center", fontWeight: 700 }} />
                        {atteint && <span style={{ fontSize: 9, color: "#16A34A" }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </C>
            );
          })}
        </div>
      )}

      {/* ════════ DÉFIS MENSUELS ════════ */}
      {tab === "defis" && (
        <div>
          {/* Bouton valider défis */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Btn onClick={() => {
              localStorage.setItem("sherpas_defis_published_v1", JSON.stringify(defis));
              const ts = `${new Date().toLocaleString("fr-FR")} par ${user?.name || user?.email || "?"}`;
              setDefisPubTs(ts);
              localStorage.setItem("sherpas_defis_pub_ts", ts);
              syncToSupabase("defis_pub_ts", ts);
              setPublished("defis"); setTimeout(() => setPublished(false), 3000);
            }} color="#16A34A" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 11 }}>
              {published === "defis" ? "✅ Publié !" : "📤 Valider les défis"}
            </Btn>
            {defisPubTs && <span style={{ fontSize: 9, color: "#71717A" }}>✅ {defisPubTs}</span>}
          </div>

          {/* Défi actuel */}
          {defis.filter(d => d.mois === new Date().getMonth() && d.annee === new Date().getFullYear()).map((d, i) => (
            <C key={i} style={{ marginBottom: 12, background: "linear-gradient(135deg, #7C3AED, #A855F7)", border: "none", color: "#fff", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", opacity: .8, marginBottom: 6 }}>🏆 Défi du mois — {MOIS[d.mois]} {d.annee}</div>
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>{d.titre}</div>
              <div style={{ fontSize: 12, opacity: .9, lineHeight: 1.5 }}>{d.description}</div>
            </C>
          ))}

          {/* Créer un défi */}
          <C style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>➕ Créer un défi mensuel</div>
            <input value={newDefi.titre} onChange={e => setNewDefi({...newDefi, titre: e.target.value})} placeholder="Titre du défi (ex: 50 cours d'essai)"
              style={{ width: "100%", fontSize: 12, border: "1px solid #E4E4E7", borderRadius: 6, padding: "8px 10px", marginBottom: 6, boxSizing: "border-box", fontWeight: 700 }} />
            <textarea value={newDefi.description} onChange={e => setNewDefi({...newDefi, description: e.target.value})} placeholder="Description (objectif, règles, récompense...)"
              rows={3} style={{ width: "100%", fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "8px 10px", marginBottom: 6, boxSizing: "border-box", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <select value={newDefi.mois} onChange={e => setNewDefi({...newDefi, mois: parseInt(e.target.value)})}
                style={{ flex: 1, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px" }}>
                {MOIS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <input type="number" value={newDefi.annee} onChange={e => setNewDefi({...newDefi, annee: parseInt(e.target.value)})}
                style={{ width: 70, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px" }} />
            </div>
            <Btn onClick={() => {
              if (!newDefi.titre) return;
              saveDefis([...defis, { ...newDefi }]);
              setNewDefi({ titre: "", description: "", mois: new Date().getMonth(), annee: new Date().getFullYear() });
            }} color="#7C3AED" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>🏆 Créer le défi</Btn>
          </C>

          {/* Historique des défis */}
          {defis.length > 0 && (
            <C>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>📋 Tous les défis</div>
              {defis.map((d, i) => {
                const isCurrent = d.mois === new Date().getMonth() && d.annee === new Date().getFullYear();
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: isCurrent ? "#F5F3FF" : "#FAFAFA", borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${isCurrent ? "#7C3AED" : "#E4E4E7"}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#18181B" }}>{d.titre}</div>
                      <div style={{ fontSize: 10, color: "#71717A" }}>{MOIS[d.mois]} {d.annee}{isCurrent ? " · EN COURS" : ""}</div>
                    </div>
                    <button onClick={() => saveDefis(defis.filter((_, j) => j !== i))}
                      style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#E11D48", cursor: "pointer" }}>×</button>
                  </div>
                );
              })}
            </C>
          )}
        </div>
      )}
    </div>
  );
}

export default Objectifs;
