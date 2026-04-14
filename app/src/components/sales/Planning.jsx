import { useState, useEffect, useMemo } from 'react';
import { C, Btn, Pill, ST } from '../ui';

// ── Constantes planning ──
const TIME_PER_AFFAIRE = 3; // minutes
const PAUSE_DURATION = 60; // minutes

// Priorité : index plus petit = plus important
const PRIORITY_ORDER = [
  { key: "call0",           label: "Call 0",             emoji: "📞", color: "#E11D48", note: "⚠️ Obligatoire · Priorité reach" },
  { key: "vendresAboVeille", label: "Vendres Abo veille", emoji: "🌙", color: "#D97706", note: "⚠️ Obligatoire · À partir de 12h30" },
  { key: "vendresAbo",      label: "Vendres Abo",        emoji: "💰", color: "#0B68B4", note: "⚠️ Obligatoire · En fin de journée" },
  { key: "relance1",        label: "Relance 1",          emoji: "1️⃣", color: "#16A34A", note: "" },
  { key: "relance2",        label: "Relance 2",          emoji: "2️⃣", color: "#15803D", note: "" },
  { key: "relance3",        label: "Relance 3",          emoji: "3️⃣", color: "#166534", note: "" },
  { key: "relance4",        label: "Relance 4",          emoji: "4️⃣", color: "#14532D", note: "" },
  { key: "closingReste",    label: "Closing (reste)",    emoji: "🎯", color: "#7C3AED", note: "À traiter à 10h" },
];

// ── Reach helpers ──
// 🟢 9h-10h, 12h-14h, 17h+ | 🟡 11h30-12h, 16h-17h | 🔴 10h-11h30, 14h-16h
function getReachType(hour) {
  if (hour >= 9 && hour < 10) return "reach";
  if (hour >= 12 && hour < 14) return "reach";
  if (hour >= 17 && hour < 22) return "reach";
  if (hour >= 10 && hour < 11.5) return "unreach";
  if (hour >= 14 && hour < 16) return "unreach";
  if (hour >= 11.5 && hour < 12) return "medium";
  if (hour >= 16 && hour < 17) return "medium";
  return "offhours";
}
function reachColor(t) {
  return t === "reach" ? "#16A34A" : t === "unreach" ? "#E11D48" : t === "medium" ? "#EAB308" : "#A1A1AA";
}
function reachLabel(t) {
  return t === "reach" ? "🟢 Reach" : t === "unreach" ? "🔴 Unreach" : t === "medium" ? "🟡 Médium" : "⚪ Hors plage";
}

// parse "HH:MM" → minutes depuis minuit
const parseTime = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const fmtTime = (min) => { const h = Math.floor(min / 60); const m = min % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; };

// ── Découpe la journée en segments [startMin, endMin, reachType] sans la pause ──
function buildSegments(startMin, endMin, pauseStartMin) {
  const pauseEndMin = pauseStartMin + PAUSE_DURATION;
  // On divise en sous-segments selon les changements de reach type
  const breakpoints = [9*60, 10*60, 11*60+30, 12*60, 14*60, 16*60, 17*60].filter(b => b > startMin && b < endMin);
  const allPoints = [startMin, ...breakpoints, pauseStartMin, pauseEndMin, endMin].filter(p => p >= startMin && p <= endMin);
  allPoints.sort((a, b) => a - b);
  const unique = [...new Set(allPoints)];
  const segments = [];
  for (let i = 0; i < unique.length - 1; i++) {
    const a = unique[i], b = unique[i + 1];
    if (a === b) continue;
    // Skip la pause
    if (a >= pauseStartMin && b <= pauseEndMin) continue;
    const mid = (a + b) / 2 / 60;
    segments.push({ start: a, end: b, duration: b - a, reach: getReachType(mid) });
  }
  return segments;
}

// ── Planifie les tâches dans les segments ──
// Stratégie :
// 1. closingReste → dans le segment contenant 10h (ou le plus proche)
// 2. vendresAboVeille → à partir de 12h30 strict
// 3. call0 et relances par priorité → reach > medium > unreach, remplissant
function schedule(counts, startMin, endMin, pauseStartMin) {
  const segments = buildSegments(startMin, endMin, pauseStartMin).map(s => ({ ...s, remaining: s.duration, tasks: [] }));
  const queue = []; // [{ key, qty, strictStart?, preferReach? }]

  // Tâches avec contrainte horaire (closingReste à 10h, vendresAboVeille à 12h30)
  // On ajoute les autres dans l'ordre de priorité
  PRIORITY_ORDER.forEach(p => {
    const qty = counts[p.key] || 0;
    if (qty === 0) return;
    let strictStart = null;
    if (p.key === "closingReste") strictStart = 10 * 60;
    if (p.key === "vendresAboVeille") strictStart = 12 * 60 + 30;
    queue.push({ key: p.key, label: p.label, emoji: p.emoji, color: p.color, qty, strictStart });
  });

  // Fonction utilitaire : affecte N minutes d'une tâche à un segment
  function allocate(segIdx, taskKey, minutes) {
    const s = segments[segIdx];
    const alloc = Math.min(s.remaining, minutes);
    s.remaining -= alloc;
    const existing = s.tasks.find(t => t.key === taskKey);
    if (existing) existing.minutes += alloc;
    else {
      const meta = queue.find(q => q.key === taskKey);
      s.tasks.push({ key: taskKey, label: meta.label, emoji: meta.emoji, color: meta.color, minutes: alloc });
    }
    return alloc;
  }

  // ═══ ÉTAPE 1 : Vendres Abo → placés à la FIN de journée (comptage à l'envers) ═══
  const vendresAboTask = queue.find(t => t.key === "vendresAbo");
  if (vendresAboTask && vendresAboTask.qty > 0) {
    let remaining = vendresAboTask.qty * TIME_PER_AFFAIRE;
    for (let i = segments.length - 1; i >= 0 && remaining > 0; i--) {
      const alloc = allocate(i, vendresAboTask.key, remaining);
      remaining -= alloc;
    }
  }

  // ═══ ÉTAPE 2 : Vendres Abo Veille → strictement à partir de 12h30 ═══
  const vendresVeilleTask = queue.find(t => t.key === "vendresAboVeille");
  if (vendresVeilleTask && vendresVeilleTask.qty > 0) {
    let remaining = vendresVeilleTask.qty * TIME_PER_AFFAIRE;
    for (let i = 0; i < segments.length && remaining > 0; i++) {
      if (segments[i].start < 12 * 60 + 30) continue;
      const alloc = allocate(i, vendresVeilleTask.key, remaining);
      remaining -= alloc;
    }
  }

  // ═══ ÉTAPE 3 : Closing reste → à 10h ═══
  const closingTask = queue.find(t => t.key === "closingReste");
  if (closingTask && closingTask.qty > 0) {
    let remaining = closingTask.qty * TIME_PER_AFFAIRE;
    for (let i = 0; i < segments.length && remaining > 0; i++) {
      if (segments[i].start < 10 * 60) continue;
      const alloc = allocate(i, closingTask.key, remaining);
      remaining -= alloc;
    }
  }

  // ═══ ÉTAPE 4 : Call 0 + Relances → reach d'abord, puis medium, puis unreach ═══
  const reachOrder = ["reach", "medium", "unreach", "offhours"];
  const remainingTasks = queue.filter(t => !["vendresAbo", "vendresAboVeille", "closingReste"].includes(t.key));
  remainingTasks.forEach(t => {
    let remaining = t.qty * TIME_PER_AFFAIRE;
    for (const rType of reachOrder) {
      if (remaining <= 0) break;
      for (let i = 0; i < segments.length && remaining > 0; i++) {
        if (segments[i].reach !== rType) continue;
        if (segments[i].remaining <= 0) continue;
        const alloc = allocate(i, t.key, remaining);
        remaining -= alloc;
      }
    }
    if (remaining > 0 && segments.length > 0) {
      const last = segments[segments.length - 1];
      const existing = last.tasks.find(tt => tt.key === t.key);
      if (existing) existing.minutes += remaining;
      else last.tasks.push({ key: t.key, label: t.label, emoji: t.emoji, color: t.color, minutes: remaining });
      last.remaining -= remaining;
    }
  });

  return segments;
}

const LS_KEY = "sherpas_planning_v1";
function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Réinitialise automatiquement si les données datent d'un autre jour
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return null;
    return data;
  } catch { return null; }
}

// Récupère les horaires du jour depuis l'emploi du temps publié
function getEdtHoraires(email) {
  try {
    const pub = JSON.parse(localStorage.getItem("sherpas_edt_published_v1") || "{}");
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const cell = pub[`${email}|${today}`];
    if (cell && cell.status === "working" && cell.start_time && cell.end_time) {
      return { start: cell.start_time, end: cell.end_time };
    }
  } catch {}
  return null;
}

function Planning({ user }) {
  const persisted = loadPersisted();
  const edtHoraires = getEdtHoraires(user?.email);

  // ── State (persisté en localStorage) ──
  const [counts, setCounts] = useState(persisted?.counts || {
    call0: 0, vendresAboVeille: 0, vendresAbo: 0,
    relance1: 0, relance2: 0, relance3: 0, relance4: 0,
    closingReste: 0,
  });
  const [startTime, setStartTime] = useState(persisted?.startTime || edtHoraires?.start || "09:00");
  const [endTime, setEndTime] = useState(persisted?.endTime || edtHoraires?.end || "18:00");
  const [pauseChoice, setPauseChoice] = useState(persisted?.pauseChoice || "13:00");
  const [now, setNow] = useState(new Date());

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(LS_KEY, JSON.stringify({ date: today, counts, startTime, endTime, pauseChoice }));
  }, [counts, startTime, endTime, pauseChoice]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);
  const pauseStartMin = parseTime(pauseChoice);
  const nowMinAbs = now.getHours() * 60 + now.getMinutes();

  // ── Planning dynamique : on replanifie à partir de NOW (ou du start si on n'a pas commencé) ──
  const effectiveStart = Math.max(startMin, nowMinAbs);
  const effectivePauseStart = nowMinAbs >= pauseStartMin + PAUSE_DURATION
    ? pauseStartMin // pause déjà passée → reste dans l'historique mais n'est plus prise en compte
    : pauseStartMin;

  // ── Calculs dérivés (à partir de maintenant) ──
  const totalAffaires = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalTimeNeeded = totalAffaires * TIME_PER_AFFAIRE;

  // Temps dispo = temps entre effectiveStart et endMin moins la pause (si elle est encore à venir)
  let totalAvailable = Math.max(0, endMin - effectiveStart);
  const pauseAlreadyPassed = nowMinAbs >= pauseStartMin + PAUSE_DURATION;
  const pauseInProgress = nowMinAbs >= pauseStartMin && nowMinAbs < pauseStartMin + PAUSE_DURATION;
  if (!pauseAlreadyPassed) {
    // Si la pause est encore devant ou en cours
    if (pauseInProgress) {
      // On retire seulement le temps de pause restant
      totalAvailable -= (pauseStartMin + PAUSE_DURATION - nowMinAbs);
    } else if (pauseStartMin + PAUSE_DURATION <= endMin) {
      totalAvailable -= PAUSE_DURATION;
    }
  }
  totalAvailable = Math.max(0, totalAvailable);

  const delta = totalAvailable - totalTimeNeeded;
  const onTrack = delta >= 0;

  // ── Heure de fin estimée : now + temps de travail + pause (si encore à venir) ──
  let estimatedEnd = nowMinAbs + totalTimeNeeded;
  if (!pauseAlreadyPassed) {
    if (pauseInProgress) {
      // Si on est dans la pause, rajouter le temps de pause restant
      estimatedEnd += (pauseStartMin + PAUSE_DURATION - nowMinAbs);
    } else if (estimatedEnd > pauseStartMin) {
      // La pause tombe pendant notre charge → on ajoute 1h
      estimatedEnd += PAUSE_DURATION;
    }
  }

  // On planifie à partir de maintenant (effectiveStart) jusqu'à la fin
  const segments = useMemo(
    () => schedule(counts, effectiveStart, endMin, pauseStartMin),
    [counts, effectiveStart, endMin, pauseStartMin]
  );

  // ── Ce que je dois faire MAINTENANT ──
  const nowMin = nowMinAbs;
  const currentSeg = segments.find(s => nowMin >= s.start && nowMin < s.end);
  const inPause = nowMin >= pauseStartMin && nowMin < pauseStartMin + PAUSE_DURATION;

  // Temps restant = total available depuis maintenant (déjà calculé ci-dessus)
  const remainingAvailable = totalAvailable;
  const remainingWork = segments.reduce((sum, s) => sum + (s.duration - s.remaining), 0);

  return (
    <div>
      <ST emoji="📋" sub="Organise ta journée, priorise par heures de reach, visualise ta charge en direct.">Mon Planning</ST>

      {/* ── Inputs : comptes d'affaires ── */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>📊 Mes affaires à traiter</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {PRIORITY_ORDER.map((p, idx) => (
            <div key={p.key} style={{ padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, border: `2px solid ${p.color}22`, borderLeft: `3px solid ${p.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 800, color: p.color, fontFamily: "'Outfit',sans-serif" }}>{p.label}</div>
                <span style={{ fontSize: 9, background: p.color + "18", color: p.color, borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>#{idx + 1}</span>
              </div>
              <input type="number" min={0} value={counts[p.key]} onChange={e => setCounts({ ...counts, [p.key]: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{ width: "100%", fontSize: 14, fontWeight: 700, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px", boxSizing: "border-box", textAlign: "center", color: "#18181B" }} />
              {p.note && <div style={{ fontSize: 9, color: "#A1A1AA", marginTop: 4, fontStyle: "italic" }}>{p.note}</div>}
            </div>
          ))}
        </div>
      </C>

      {/* ── Horaires ── */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>⏰ Mes horaires</div>
          {edtHoraires && <span style={{ fontSize: 9, color: "#16A34A", fontWeight: 700, background: "#F0FDF4", padding: "2px 8px", borderRadius: 4 }}>📅 Synchro emploi du temps ({edtHoraires.start} - {edtHoraires.end})</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Début</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              style={{ width: "100%", fontSize: 14, fontWeight: 700, border: "1px solid #E4E4E7", borderRadius: 8, padding: "8px 10px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Fin</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
              style={{ width: "100%", fontSize: 14, fontWeight: 700, border: "1px solid #E4E4E7", borderRadius: 8, padding: "8px 10px", boxSizing: "border-box" }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 6 }}>Pause déjeuner (1h)</label>
          <div style={{ display: "flex", gap: 6 }}>
            {["13:00", "13:30", "14:00"].map(t => (
              <button key={t} onClick={() => setPauseChoice(t)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${pauseChoice === t ? "#16A34A" : "#E4E4E7"}`, background: pauseChoice === t ? "#F0FDF4" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: pauseChoice === t ? "#15803D" : "#71717A" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </C>

      {/* ── Bilan global (dynamique, à partir de maintenant) ── */}
      <C style={{ marginBottom: 12, background: onTrack ? "linear-gradient(135deg,#16A34A,#62E58E)" : "linear-gradient(135deg,#E11D48,#F97316)", border: "none", color: "#fff", padding: "16px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", opacity: .9, marginBottom: 6 }}>
          {onTrack ? "✅ Tu peux tout traiter avant la fin" : `⚠️ Déficit de ${Math.abs(delta)} min — tu ne finiras pas à l'heure`}
          {(() => {
            const obligMin = ((counts.call0 || 0) + (counts.vendresAbo || 0) + (counts.vendresAboVeille || 0)) * TIME_PER_AFFAIRE;
            const canDoOblig = totalAvailable >= obligMin;
            return !canDoOblig ? " · ❌ Pas assez de temps pour les obligatoires (Call 0 + Vendres Abo)" : "";
          })()}
        </div>
        <div style={{ fontSize: 9, opacity: .75, marginBottom: 10 }}>Calcul dynamique depuis {fmtTime(nowMinAbs)} jusqu'à {endTime}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, opacity: .8 }}>Affaires</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{totalAffaires}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: .8 }}>À traiter</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{Math.floor(totalTimeNeeded / 60)}h{String(totalTimeNeeded % 60).padStart(2, "0")}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: .8 }}>Restant</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{Math.floor(totalAvailable / 60)}h{String(totalAvailable % 60).padStart(2, "0")}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: .8 }}>Marge</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{delta >= 0 ? "+" : ""}{delta}min</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,.18)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏁</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: .85, textTransform: "uppercase", letterSpacing: ".06em" }}>Heure de fin estimée</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>
              {fmtTime(estimatedEnd)}
              {totalTimeNeeded === 0 && <span style={{ fontSize: 11, opacity: .8, marginLeft: 8 }}>(rien à traiter)</span>}
              {estimatedEnd > endMin && <span style={{ fontSize: 11, opacity: .9, marginLeft: 8 }}>(+ {estimatedEnd - endMin} min après ta fin prévue)</span>}
            </div>
          </div>
        </div>
      </C>

      {/* ── Que faire MAINTENANT ── */}
      {!inPause && currentSeg && currentSeg.tasks.length > 0 && (
        <C style={{ marginBottom: 12, background: "#FFFBEB", border: "2px solid #FCD34D", padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>🎯 À faire maintenant · {fmtTime(Math.max(currentSeg.start, nowMin))} - {fmtTime(currentSeg.end)} · {reachLabel(currentSeg.reach)}</div>
          {currentSeg.tasks.map(t => (
            <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{t.emoji}</span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#18181B" }}>{t.label}</div>
              <div style={{ fontSize: 11, color: t.color, fontWeight: 700 }}>{Math.round(t.minutes / TIME_PER_AFFAIRE)} affaires · {t.minutes}min</div>
            </div>
          ))}
        </C>
      )}
      {inPause && (
        <C style={{ marginBottom: 12, background: "#EFF6FF", border: "2px solid #BFDBFE", padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🍽️</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF" }}>Pause déjeuner jusqu'à {fmtTime(pauseStartMin + PAUSE_DURATION)}</div>
        </C>
      )}

      {/* ── Timeline de la journée ── */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>🗓️ Ma journée · charge par période</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {segments.map((s, i) => {
            const col = reachColor(s.reach);
            const used = s.duration - s.remaining;
            const pct = s.duration > 0 ? (used / s.duration) * 100 : 0;
            const isPast = nowMin >= s.end;
            const isCurrent = nowMin >= s.start && nowMin < s.end;
            return (
              <div key={i} style={{ padding: "10px 12px", background: isCurrent ? "#FFFBEB" : isPast ? "#F4F4F5" : "#fff", borderRadius: 8, border: `1px solid ${isCurrent ? "#FCD34D" : "#E4E4E7"}`, opacity: isPast ? .5 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                    {fmtTime(s.start)} - {fmtTime(s.end)} <span style={{ fontSize: 10, color: col, marginLeft: 6 }}>{reachLabel(s.reach)}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#71717A" }}>{used}min / {s.duration}min</div>
                </div>
                <div style={{ height: 6, background: "#E4E4E7", borderRadius: 99, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, transition: "width .3s" }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.tasks.map(t => (
                    <span key={t.key} style={{ fontSize: 10, background: t.color + "18", color: t.color, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                      {t.emoji} {t.label} · {Math.round(t.minutes / TIME_PER_AFFAIRE)}
                    </span>
                  ))}
                  {s.tasks.length === 0 && <span style={{ fontSize: 10, color: "#A1A1AA", fontStyle: "italic" }}>Libre</span>}
                </div>
              </div>
            );
          })}
        </div>
      </C>

      {/* ── Charge restante sur la journée ── */}
      <C style={{ marginBottom: 12, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#15803D", marginBottom: 4 }}>⏳ Restant aujourd'hui</div>
        <div style={{ fontSize: 11, color: "#3F3F46" }}>Temps dispo : <b>{remainingAvailable}min</b> · Charge planifiée : <b>{remainingWork}min</b></div>
      </C>
    </div>
  );
}

export default Planning;
