import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeam } from '../../lib/supabase';
import { C, Btn, ST } from '../ui';

// ── Config ──
const NB_POLES = 2;
const SEATS_PER_SIDE = 4;
const TOTAL_SEATS = SEATS_PER_SIDE * 2 + 1; // 4 gauche + 4 droite + 1 bout = 9

const LS_KEY = "sherpas_plan_table_v1";

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function fmtLabelFull(d) {
  const jours = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

function PlanDeTable({ user }) {
  const [team, setTeam] = useState([]);
  const [allPlans, setAllPlans] = useState({}); // { "2026-04-13": { "pole_0_seat_3": "email" }, ... }
  const [draggedEmail, setDraggedEmail] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(fmtDate(new Date()));
  const [published, setPublished] = useState(false);
  const [planPubTimestamps, setPlanPubTimestamps] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sherpas_plan_pub_timestamps_v1") || "{}"); } catch { return {}; }
  });

  const today = fmtDate(new Date());
  const assignments = allPlans[selectedDate] || {};
  const selectedDateObj = new Date(selectedDate + "T12:00:00");

  // Charge l'équipe (fallback local si Supabase vide)
  useEffect(() => { fetchTeam().then(setTeam); }, []);

  // Charge tous les plans par date
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Object.keys(data)[0]?.startsWith("pole_")) {
          // Migration ancien format → aujourd'hui
          const migrated = { [today]: data };
          setAllPlans(migrated);
          localStorage.setItem(LS_KEY, JSON.stringify(migrated));
        } else {
          setAllPlans(data);
        }
      }
    } catch {}
  }, []);

  // Charge l'emploi du temps publié (mis à jour après clic "Valider")
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sherpas_edt_published_v1");
      if (raw) setSchedules(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(nextAssignments) {
    const nextAll = { ...allPlans, [selectedDate]: nextAssignments };
    setAllPlans(nextAll);
    localStorage.setItem(LS_KEY, JSON.stringify(nextAll));
  }

  function assignSeat(poleIdx, seatIdx, email) {
    const key = `pole_${poleIdx}_seat_${seatIdx}`;
    const next = { ...assignments };
    Object.keys(next).forEach(k => { if (next[k] === email) delete next[k]; });
    if (email) next[key] = email;
    else delete next[key];
    persist(next);
  }

  function clearAll() {
    if (confirm(`Vider le plan du ${fmtLabelFull(selectedDateObj)} ?`)) persist({});
  }

  function copyToNextDay() {
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) nextDay.setDate(nextDay.getDate() + 1); // skip weekend
    const nextStr = fmtDate(nextDay);
    const nextAll = { ...allPlans, [nextStr]: { ...assignments } };
    setAllPlans(nextAll);
    localStorage.setItem(LS_KEY, JSON.stringify(nextAll));
    setSelectedDate(nextStr);
  }

  // ── Rotation auto : mélange aléatoire en respectant les présents ──
  function autoRotate() {
    const presents = presentsForDate;
    // Mélange Fisher-Yates
    const shuffled = [...presents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const next = {};
    let idx = 0;
    for (let p = 0; p < NB_POLES; p++) {
      for (let s = 0; s < TOTAL_SEATS; s++) {
        if (idx < shuffled.length) {
          next[`pole_${p}_seat_${s}`] = shuffled[idx].email;
          idx++;
        }
      }
    }
    persist(next);
  }

  // ── Présents / absents du jour ──
  const statuts = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}"); } catch { return {}; }
  }, []);

  const presentsForDate = useMemo(() => {
    return team.filter(m => {
      const cell = schedules[`${m.email}|${selectedDate}`];
      const isFreelance = (statuts[m.email] || "cdi") === "freelance";
      if (isFreelance && (!cell || cell.status === "pasdispo")) return false;
      if (!cell) return true;
      return cell.status === "working";
    });
  }, [team, schedules, selectedDate, statuts]);

  const absentsForDate = useMemo(() => {
    return team.filter(m => {
      const cell = schedules[`${m.email}|${selectedDate}`];
      const isFreelance = (statuts[m.email] || "cdi") === "freelance";
      if (isFreelance && (!cell || cell.status === "pasdispo")) return false;
      if (!cell) return false;
      return cell.status !== "working";
    });
  }, [team, schedules, selectedDate, statuts]);

  // ── Remote (en ligne) ──
  const remoteEmails = useMemo(() => {
    try {
      return Object.entries(assignments).filter(([k]) => k.startsWith("remote_")).map(([, v]) => v);
    } catch { return []; }
  }, [assignments]);

  function addRemote(email) {
    // Retirer de son ancien siège
    const next = { ...assignments };
    Object.keys(next).forEach(k => { if (next[k] === email) delete next[k]; });
    const idx = remoteEmails.length;
    next[`remote_${idx}_${Date.now()}`] = email;
    persist(next);
  }

  function removeRemote(email) {
    const next = { ...assignments };
    Object.keys(next).forEach(k => { if (k.startsWith("remote_") && next[k] === email) delete next[k]; });
    persist(next);
  }

  // Emails déjà placés (inclut remote)
  const placedEmails = new Set(Object.values(assignments));
  const unplaced = presentsForDate.filter(m => !placedEmails.has(m.email));

  // ── Render un siège ──
  function renderSeat(poleIdx, seatIdx, position) {
    const key = `pole_${poleIdx}_seat_${seatIdx}`;
    const email = assignments[key];
    const member = email ? team.find(m => m.email === email) : null;
    const isAbsent = member && !presentsForDate.find(m => m.email === email);
    const statuts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");

    return (
      <div
        key={key}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (draggedEmail) assignSeat(poleIdx, seatIdx, draggedEmail);
          setDraggedEmail(null);
        }}
        onClick={() => {
          if (!member && unplaced.length > 0) {
            assignSeat(poleIdx, seatIdx, unplaced[0].email);
          } else if (member) {
            assignSeat(poleIdx, seatIdx, null);
          }
        }}
        style={{
          width: position === "bout" ? 70 : 60,
          height: position === "bout" ? 60 : 54,
          borderRadius: 10,
          border: `2px ${member ? "solid" : "dashed"} ${member ? (isAbsent ? "#FCA5A5" : member.color || "#16A34A") : "#D4D4D8"}`,
          background: member ? (isAbsent ? "#FEF2F2" : member.color + "15") : "#FAFAFA",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all .15s", opacity: isAbsent ? 0.5 : 1,
          position: "relative",
        }}
      >
        {member ? (
          <>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: member.color || "#16A34A",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 8, fontWeight: 900, fontFamily: "'Outfit',sans-serif",
            }}
              draggable
              onDragStart={() => setDraggedEmail(member.email)}
            >
              {member.avatar || (member.name || "").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#18181B", marginTop: 2, fontFamily: "'Outfit',sans-serif", textAlign: "center", lineHeight: 1.1 }}>
              {(member.name || member.email.split("@")[0]).split(" ")[0]}
            </div>
            {isAbsent && <div style={{ fontSize: 7, color: "#E11D48", fontWeight: 700 }}>absent</div>}
          </>
        ) : (
          <div style={{ fontSize: 18, color: "#D4D4D8" }}>+</div>
        )}
      </div>
    );
  }

  // ── Render un pôle (table rectangulaire) ──
  function renderPole(poleIdx) {
    return (
      <div key={poleIdx} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>
          Pôle {poleIdx + 1}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Côté gauche (4 sièges en colonne) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: SEATS_PER_SIDE }, (_, i) => renderSeat(poleIdx, i, "left"))}
          </div>
          {/* La table */}
          <div style={{
            width: 50, minHeight: SEATS_PER_SIDE * 60,
            background: "linear-gradient(180deg, #D4A574 0%, #C49A6C 100%)",
            borderRadius: 8, border: "2px solid #A67C52",
            display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8,
          }}>
            <div style={{ fontSize: 8, color: "#fff", opacity: 0.6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Table</div>
          </div>
          {/* Côté droit (4 sièges en colonne) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: SEATS_PER_SIDE }, (_, i) => renderSeat(poleIdx, SEATS_PER_SIDE + i, "right"))}
          </div>
        </div>
        {/* Bout de table (1 siège) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          {renderSeat(poleIdx, SEATS_PER_SIDE * 2, "bout")}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Alerte changement : détecte si le plan actuel ne correspond plus aux présents ── */}
      {(() => {
        // Personnes placées (sièges + remote) qui sont absentes aujourd'hui
        const placedButAbsent = Object.values(assignments).filter(email => {
          const cell = schedules[`${email}|${today}`];
          return cell && cell.status !== "working";
        });
        // Personnes présentes non placées
        const presentNotPlaced = presentsForDate.filter(m => !placedEmails.has(m.email));

        // Prochains changements (demain, cette semaine)
        const alerts = [];
        const dow = new Date().getDay(); // 0=dim, 1=lun...
        const daysAhead = dow === 5 ? 3 : dow === 6 ? 2 : 1; // ven→lun, sam→lun, sinon demain
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + daysAhead);
        const tomorrowStr = fmtDate(tomorrow);
        const tomorrowLabel = daysAhead === 1 ? "demain" : "lundi prochain";

        // Compare présents aujourd'hui vs demain
        const presentsTomorrow = team.filter(m => {
          const cell = schedules[`${m.email}|${tomorrowStr}`];
          if (!cell) return true;
          return cell.status === "working";
        });
        const arrivingTomorrow = presentsTomorrow.filter(m => !presentsForDate.find(p => p.email === m.email));
        const leavingTomorrow = presentsForDate.filter(m => !presentsTomorrow.find(p => p.email === m.email));

        if (arrivingTomorrow.length > 0) alerts.push({ icon: "🟢", text: `${tomorrowLabel} : ${arrivingTomorrow.map(m => (m.name || m.email).split(" ")[0]).join(", ")} arrive${arrivingTomorrow.length > 1 ? "nt" : ""}` });
        if (leavingTomorrow.length > 0) alerts.push({ icon: "🔴", text: `${tomorrowLabel} : ${leavingTomorrow.map(m => (m.name || m.email).split(" ")[0]).join(", ")} part${leavingTomorrow.length > 1 ? "ent" : ""}` });

        const needsUpdate = placedButAbsent.length > 0 || presentNotPlaced.length > 0;

        if (!needsUpdate && alerts.length === 0) return null;
        return (
          <C style={{ marginBottom: 14, background: needsUpdate ? "#FEF2F2" : "#FFFBEB", border: `2px solid ${needsUpdate ? "#FCA5A5" : "#FDE68A"}`, padding: "12px 16px" }}>
            {needsUpdate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: alerts.length > 0 ? 8 : 0 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#B91C1C", fontFamily: "'Outfit',sans-serif" }}>Plan de table à mettre à jour</div>
                  <div style={{ fontSize: 11, color: "#71717A" }}>
                    {placedButAbsent.length > 0 && <span>{placedButAbsent.length} placé{placedButAbsent.length > 1 ? "s" : ""} mais absent{placedButAbsent.length > 1 ? "s" : ""} · </span>}
                    {presentNotPlaced.length > 0 && <span>{presentNotPlaced.length} présent{presentNotPlaced.length > 1 ? "s" : ""} non placé{presentNotPlaced.length > 1 ? "s" : ""}</span>}
                  </div>
                </div>
              </div>
            )}
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#92400E", marginTop: 4 }}>
                <span>{a.icon}</span> <span style={{ fontWeight: 600 }}>{a.text}</span>
              </div>
            ))}
          </C>
        );
      })()}

      <ST emoji="🪑" sub="Place ton équipe — les absents sont grisés. Drag & drop ou clic pour assigner.">Plan de table</ST>

      {/* Navigation par semaine */}
      {(() => {
        // Calcule le lundi de la semaine sélectionnée
        const selDt = new Date(selectedDate + "T12:00:00");
        const selDay = selDt.getDay();
        const mondayDt = new Date(selDt);
        mondayDt.setDate(selDt.getDate() - selDay + (selDay === 0 ? -6 : 1));
        const weekDays = Array.from({ length: 5 }, (_, i) => {
          const d = new Date(mondayDt);
          d.setDate(mondayDt.getDate() + i);
          return d;
        });
        const joursCourts = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

        // Détecte les variantes : jours où la liste des présents diffère du lundi
        const presentsForDay = (dateStr) => team.filter(m => {
          const cell = schedules[`${m.email}|${dateStr}`];
          const isFreelance = (statuts[m.email] || "cdi") === "freelance";
          if (isFreelance && (!cell || cell.status === "pasdispo")) return false;
          if (!cell) return true;
          return cell.status === "working";
        }).map(m => m.email).sort().join(",");

        const lundiPresents = presentsForDay(fmtDate(weekDays[0]));

        return (
          <div style={{ marginBottom: 14 }}>
            {/* Semaine nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={() => { const d = new Date(mondayDt); d.setDate(d.getDate() - 7); setSelectedDate(fmtDate(d)); }}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                  Semaine du {fmtLabelFull(mondayDt)}
                  {fmtDate(mondayDt) === fmtDate(getMonday(new Date())) && <span style={{ marginLeft: 8, fontSize: 9, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>CETTE SEMAINE</span>}
                </div>
              </div>
              <button onClick={() => { const d = new Date(mondayDt); d.setDate(d.getDate() + 7); setSelectedDate(fmtDate(d)); }}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
              {fmtDate(mondayDt) !== fmtDate(getMonday(new Date())) && (
                <button onClick={() => setSelectedDate(today)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #16A34A", background: "#F0FDF4", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#16A34A" }}>Aujourd'hui</button>
              )}
            </div>

            {/* Onglets jours */}
            <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10 }}>
              {weekDays.map((d, i) => {
                const dateStr = fmtDate(d);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === today;
                const dayPresents = presentsForDay(dateStr);
                const hasVariant = dayPresents !== lundiPresents;
                return (
                  <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: isSelected ? "#fff" : "transparent",
                      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                      textAlign: "center", transition: "all .15s",
                    }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: isSelected ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
                      {joursCourts[i]}
                    </div>
                    <div style={{ fontSize: 9, color: isToday ? "#16A34A" : "#A1A1AA", fontWeight: isToday ? 800 : 400 }}>
                      {d.getDate()}
                    </div>
                    {(() => {
                      const hasPlan = allPlans[dateStr] && Object.keys(allPlans[dateStr]).length > 0;
                      const pubRaw = localStorage.getItem("sherpas_plan_table_published_v1");
                      const pubAll = pubRaw ? JSON.parse(pubRaw) : {};
                      const isPublished = pubAll[dateStr] && Object.keys(pubAll[dateStr]).length > 0;
                      // Erreur = il y a des placés absents ou des présents non placés
                      const dayPresentsEmails = presentsForDay(dateStr).split(",");
                      const planEmails = hasPlan ? Object.values(allPlans[dateStr]) : [];
                      const hasError = hasPlan && (
                        planEmails.some(e => !dayPresentsEmails.includes(e)) ||
                        dayPresentsEmails.some(e => e && !planEmails.includes(e))
                      );

                      if (isPublished && !hasError) return <div style={{ fontSize: 10, margin: "2px auto 0" }} title="Publié">✅</div>;
                      if (hasError) return <div style={{ fontSize: 10, margin: "2px auto 0" }} title="Erreur : plan décalé">⚠️</div>;
                      if (hasPlan && !isPublished) return <div style={{ fontSize: 10, margin: "2px auto 0" }} title="En cours (non publié)">✏️</div>;
                      return <div style={{ fontSize: 10, margin: "2px auto 0", opacity: 0.3 }} title="Pas de plan">—</div>;
                    })()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Titre du jour sélectionné */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>
        {selectedDate === today ? "📌 " : ""}{fmtLabelFull(selectedDateObj)}
        {selectedDate === today && <span style={{ marginLeft: 6, fontSize: 10, background: "#16A34A", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>AUJOURD'HUI</span>}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={autoRotate} color="#7C3AED" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>🔀 Rotation auto</Btn>
        <Btn onClick={copyToNextDay} outline color="#0B68B4" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>📋→ Jour suivant</Btn>
        <Btn onClick={() => {
          const selDt = new Date(selectedDate + "T12:00:00");
          const selDay = selDt.getDay();
          const mondayDt = new Date(selDt);
          mondayDt.setDate(selDt.getDate() - selDay + (selDay === 0 ? -6 : 1));
          const nextAll = { ...allPlans };
          for (let i = 0; i < 5; i++) {
            const d = new Date(mondayDt);
            d.setDate(mondayDt.getDate() + i);
            const ds = fmtDate(d);
            if (ds !== selectedDate) nextAll[ds] = { ...assignments };
          }
          setAllPlans(nextAll);
          localStorage.setItem(LS_KEY, JSON.stringify(nextAll));
        }} outline color="#7C3AED" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>📋 Toute la semaine</Btn>
        <Btn onClick={clearAll} outline color="#71717A" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>🗑️ Vider</Btn>
        <Btn onClick={() => {
          const pub = JSON.parse(localStorage.getItem("sherpas_plan_table_published_v1") || "{}");
          pub[selectedDate] = assignments;
          localStorage.setItem("sherpas_plan_table_published_v1", JSON.stringify(pub));
          const ts = { ...planPubTimestamps, [selectedDate]: new Date().toLocaleString("fr-FR") };
          setPlanPubTimestamps(ts);
          localStorage.setItem("sherpas_plan_pub_timestamps_v1", JSON.stringify(ts));
          setPublished(true);
          setTimeout(() => setPublished(false), 3000);
        }} color="#16A34A" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12 }}>
          {published ? "✅ Publié !" : "📤 Valider & publier"}
        </Btn>
        {planPubTimestamps[selectedDate] && (
          <span style={{ fontSize: 10, color: "#71717A" }}>✅ Publié le {planPubTimestamps[selectedDate]}</span>
        )}
        <div style={{ fontSize: 11, color: "#71717A", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} /> {presentsForDate.length} présents
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E11D48", display: "inline-block", marginLeft: 8 }} /> {absentsForDate.length} absents
        </div>
      </div>

      {/* Non placés */}
      {unplaced.length > 0 && (
        <C style={{ marginBottom: 14, background: "#FFFBEB", border: "1px solid #FDE68A", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 6 }}>👤 Non placés ({unplaced.length}) — glisse-les sur un siège</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {unplaced.map(m => (
              <div key={m.email}
                draggable
                onDragStart={() => setDraggedEmail(m.email)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
                  background: "#fff", borderRadius: 8, border: `2px solid ${m.color || "#16A34A"}`,
                  cursor: "grab", fontSize: 10, fontWeight: 700, color: "#18181B",
                }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: m.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 900 }}>{m.avatar || (m.name || "").slice(0, 2).toUpperCase()}</div>
                {(m.name || m.email.split("@")[0]).split(" ")[0]}
              </div>
            ))}
          </div>
        </C>
      )}

      {/* Absents du jour */}
      {absentsForDate.length > 0 && (
        <C style={{ marginBottom: 14, background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", marginBottom: 6 }}>🚫 Absents ce jour ({absentsForDate.length})</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {absentsForDate.map(m => {
              const cell = schedules[`${m.email}|${selectedDate}`];
              const reason = cell ? { off: "Off", ecole: "École", formation: "Formation", maladie: "Maladie", pasdispo: "Pas dispo" }[cell.status] || cell.status : "?";
              return (
                <span key={m.email} style={{ fontSize: 10, color: "#71717A", padding: "3px 8px", background: "#fff", borderRadius: 6, border: "1px solid #FECACA" }}>
                  {(m.name || m.email.split("@")[0]).split(" ")[0]} · {reason}
                </span>
              );
            })}
          </div>
        </C>
      )}

      {/* Les pôles */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: NB_POLES }, (_, i) => renderPole(i))}
      </div>

      {/* ── Zone "En ligne" ── */}
      <C style={{ marginTop: 14, background: "#EFF6FF", border: "2px solid #BFDBFE", padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>💻 En ligne ({remoteEmails.length})</div>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (draggedEmail) addRemote(draggedEmail); setDraggedEmail(null); }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 40, padding: "8px 0" }}
        >
          {remoteEmails.map(email => {
            const m = team.find(t => t.email === email);
            if (!m) return null;
            return (
              <div key={email}
                draggable onDragStart={() => setDraggedEmail(email)}
                onClick={() => removeRemote(email)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                  background: "#fff", borderRadius: 8, border: `2px solid ${m.color || "#0B68B4"}`,
                  cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#18181B",
                }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color || "#0B68B4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 900 }}>{m.avatar || (m.name || "").slice(0, 2).toUpperCase()}</div>
                {(m.name || m.email.split("@")[0]).split(" ")[0]}
                <span style={{ fontSize: 8, color: "#0B68B4" }}>💻</span>
              </div>
            );
          })}
          {remoteEmails.length === 0 && <div style={{ fontSize: 10, color: "#93C5FD", fontStyle: "italic" }}>Glisse un sales ici ou clique sur "Non placés"</div>}
        </div>
      </C>

      <div style={{ fontSize: 10, color: "#A1A1AA", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>
        💡 Clic sur un siège vide = assigne le prochain non-placé · Clic sur un occupé = le retire · Drag & drop pour déplacer ou mettre en ligne
      </div>
    </div>
  );
}

export default PlanDeTable;
