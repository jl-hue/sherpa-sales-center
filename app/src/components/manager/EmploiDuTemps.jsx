import React, { useState, useEffect, useMemo } from 'react';
import { sb, fetchTeam, loadFromSupabase, syncToSupabase, subscribeConfig } from '../../lib/supabase';
import { C, Btn, ST } from '../ui';

// ── Helpers dates ──
// ── Jours fériés français (2025-2027) ──
const JOURS_FERIES = {
  // 2025 (Pâques = 20 avril dimanche)
  "2025-01-01": "Jour de l'An",
  "2025-04-21": "Lundi de Pâques",
  "2025-05-01": "Fête du Travail",
  "2025-05-08": "Victoire 1945",
  "2025-05-29": "Ascension",
  "2025-06-09": "Lundi de Pentecôte",
  "2025-07-14": "Fête nationale",
  "2025-08-15": "Assomption",
  "2025-11-01": "Toussaint",
  "2025-11-11": "Armistice",
  "2025-12-25": "Noël",
  // 2026 (Pâques = 5 avril dimanche)
  "2026-01-01": "Jour de l'An",
  "2026-04-06": "Lundi de Pâques",
  "2026-05-01": "Fête du Travail",
  "2026-05-08": "Victoire 1945",
  "2026-05-14": "Ascension",
  "2026-05-25": "Lundi de Pentecôte",
  "2026-07-14": "Fête nationale",
  "2026-08-15": "Assomption",
  "2026-11-01": "Toussaint",
  "2026-11-11": "Armistice",
  "2026-12-25": "Noël",
  // 2027 (Pâques = 28 mars dimanche)
  "2027-01-01": "Jour de l'An",
  "2027-03-29": "Lundi de Pâques",
  "2027-05-01": "Fête du Travail",
  "2027-05-06": "Ascension",
  "2027-05-08": "Victoire 1945",
  "2027-05-17": "Lundi de Pentecôte",
  "2027-07-14": "Fête nationale",
  "2027-08-15": "Assomption",
  "2027-11-01": "Toussaint",
  "2027-11-11": "Armistice",
  "2027-12-25": "Noël",
};

function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d) {
  // Format YYYY-MM-DD en heure LOCALE (pas UTC, sinon décalage d'1 jour en France)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtLabel(d) {
  const jours = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

const STATUS_OPTIONS = [
  { id: "working", label: "Travail", emoji: "💼", color: "#16A34A", bg: "#F0FDF4" },
  { id: "formation", label: "Formation", emoji: "🎓", color: "#7C3AED", bg: "#F5F3FF" },
  { id: "ecole", label: "École", emoji: "🏫", color: "#D97706", bg: "#FFFBEB" },
  { id: "off", label: "Off", emoji: "🏠", color: "#A1A1AA", bg: "#F4F4F5" },
  { id: "maladie", label: "Maladie", emoji: "🤒", color: "#E11D48", bg: "#FEF2F2" },
  { id: "recup", label: "Récup", emoji: "🔄", color: "#0369A1", bg: "#E0F2FE" },
  { id: "pasdispo", label: "Pas dispo", emoji: "⛔", color: "#71717A", bg: "#F4F4F5" },
];

// Presets horaires courants
const PRESETS = [
  { value: "",             label: "— Choisir —" },
  { value: "09:00|18:30",  label: "9h - 18h30" },
  { value: "09:00|18:00",  label: "9h - 18h" },
  { value: "10:00|18:30",  label: "10h - 18h30" },
  { value: "09:00|17:00",  label: "9h - 17h" },
  { value: "10:00|18:00",  label: "10h - 18h" },
  { value: "formation",    label: "🎓 En formation" },
  { value: "ecole",        label: "🏫 École" },
  { value: "off",          label: "🏠 Off" },
  { value: "maladie",      label: "🤒 Maladie" },
  { value: "recup",        label: "🔄 Récup" },
  { value: "pasdispo",     label: "⛔ Pas dispo", freelanceOnly: true },
  { value: "09:00|13:00",  label: "Samedi 9h-13h", samediOnly: true },
  { value: "09:00|17:00",  label: "Samedi 9h-17h", samediOnly: true },
  { value: "10:00|14:00",  label: "Samedi 10h-14h", samediOnly: true },
];

const FUTURE_WEEKS = 26; // ~6 mois de semaines futures

function EmploiDuTemps({ user }) {
  const [team, setTeam] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [pastWeeksShown, setPastWeeksShown] = useState(0); // 0 = seulement semaine courante+futur
  const [saving, setSaving] = useState(null);
  const [autoSeed, setAutoSeed] = useState(0);
  const [customizing, setCustomizing] = useState(null); // "email|date" key of cell being customized
  const [customStart, setCustomStart] = useState("09:00");
  const [customEnd, setCustomEnd] = useState("18:00"); // incrémenté à chaque clic auto pour varier la disposition
  const [pubTimestamps, setPubTimestamps] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sherpas_edt_pub_timestamps_v1") || "{}"); } catch { return {}; }
  });

  const thisMonday = useMemo(() => getMonday(new Date()), []);

  // Toutes les semaines visibles : passées + courante + futures
  const allWeeks = useMemo(() => {
    const weeks = [];
    for (let w = -pastWeeksShown; w <= FUTURE_WEEKS; w++) {
      const mon = addDays(thisMonday, w * 7);
      weeks.push({ monday: mon, days: Array.from({ length: 7 }, (_, i) => addDays(mon, i)), offset: w });
    }
    return weeks;
  }, [thisMonday, pastWeeksShown]);

  const LS_EDT = "sherpas_edt_v1";

  // ── Tri : CDI > Alternance > Stage > Freelance, puis par ancienneté ──
  const STATUT_ORDER = { cdi: 0, alternance: 1, stage: 2, freelance: 3 };
  function sortTeam(list) {
    const statuts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");
    const dates = JSON.parse(localStorage.getItem("sherpas_user_dates_v1") || "{}");
    return [...list].sort((a, b) => {
      const sa = STATUT_ORDER[statuts[a.email] || "cdi"] ?? 9;
      const sb2 = STATUT_ORDER[statuts[b.email] || "cdi"] ?? 9;
      if (sa !== sb2) return sa - sb2;
      // Ancienneté : date la plus ancienne en premier
      const da = dates[a.email] || "2099-01-01";
      const db = dates[b.email] || "2099-01-01";
      return da.localeCompare(db);
    });
  }

  // Charge l'équipe (fallback local si Supabase vide)
  useEffect(() => { fetchTeam().then(data => setTeam(sortTeam(data))); }, []);

  // Sync pubTimestamps : Supabase ↔ localStorage (real-time pour tous les managers)
  // Au mount : merge local + remote (remote prioritaire), push si local-only détecté
  useEffect(() => {
    (async () => {
      const remote = (await loadFromSupabase("edt_pub_timestamps")) || {};
      let local = {};
      try { local = JSON.parse(localStorage.getItem("sherpas_edt_pub_timestamps_v1") || "{}"); } catch {}
      const merged = { ...local, ...remote };
      setPubTimestamps(merged);
      localStorage.setItem("sherpas_edt_pub_timestamps_v1", JSON.stringify(merged));
      const hasLocalOnly = Object.keys(local).some(k => !(k in remote));
      if (hasLocalOnly) await syncToSupabase("edt_pub_timestamps", merged);
    })();
    const ch = subscribeConfig("edt_pub_timestamps", val => {
      setPubTimestamps(val);
      localStorage.setItem("sherpas_edt_pub_timestamps_v1", JSON.stringify(val));
    });
    return () => { try { sb.removeChannel(ch); } catch {} };
  }, []);

  // Charge les plannings : Supabase > localStorage > edt_data.json
  useEffect(() => {
    (async () => {
      // 1. Essayer Supabase
      try {
        const { data: cfg } = await sb.from("config").select("value").eq("key", "edt_published").maybeSingle();
        if (cfg?.value) {
          const parsed = JSON.parse(cfg.value);
          if (Object.keys(parsed).length > 0) {
            setSchedules(parsed);
            localStorage.setItem(LS_EDT, JSON.stringify(parsed));
            localStorage.setItem("sherpas_edt_published_v1", JSON.stringify(parsed));
            return;
          }
        }
      } catch {}
      // 2. Fallback localStorage
      try {
        const raw = localStorage.getItem(LS_EDT);
        if (raw) { setSchedules(JSON.parse(raw)); return; }
      } catch {}
      // 3. Premier lancement : importer depuis edt_data.json
      try {
        const r = await fetch("/edt_data.json");
        if (r.ok) {
          const data = await r.json();
          if (data && Object.keys(data).length > 0) {
            setSchedules(data);
            localStorage.setItem(LS_EDT, JSON.stringify(data));
            localStorage.setItem("sherpas_edt_published_v1", JSON.stringify(data));
            // Push to Supabase
            try { await sb.from("config").upsert({ key: "edt_published", value: JSON.stringify(data) }, { onConflict: "key" }); } catch {}
          }
        }
      } catch {}
    })();
  }, []);

  function persist(newSchedules) {
    setSchedules(newSchedules);
    localStorage.setItem(LS_EDT, JSON.stringify(newSchedules));
  }

  function saveCell(email, date, status, startTime, endTime) {
    const key = `${email}|${date}`;
    setSaving(key);
    const row = { user_email: email, date, status, start_time: startTime || null, end_time: endTime || null };
    persist({ ...schedules, [key]: row });
    setTimeout(() => setSaving(null), 200);
  }

  function deleteCell(email, date) {
    const key = `${email}|${date}`;
    const n = { ...schedules };
    delete n[key];
    persist(n);
  }

  // ── Remplissage rapide : appliquer un preset à toute la semaine (lun-ven) pour un membre ──
  function fillWeek(email, weekDays, preset) {
    const updates = { ...schedules };
    weekDays.forEach(day => {
      const dateStr = fmtDate(day);
      const ferie = JOURS_FERIES[dateStr];
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      if (ferie || isWeekend) return; // skip fériés et weekends
      const key = `${email}|${dateStr}`;
      if (preset === "formation") updates[key] = { user_email: email, date: dateStr, status: "formation", start_time: null, end_time: null };
      else if (preset === "ecole") updates[key] = { user_email: email, date: dateStr, status: "ecole", start_time: null, end_time: null };
      else if (preset === "off") updates[key] = { user_email: email, date: dateStr, status: "off", start_time: null, end_time: null };
      else if (preset === "maladie") updates[key] = { user_email: email, date: dateStr, status: "maladie", start_time: null, end_time: null };
      else if (preset === "recup") updates[key] = { user_email: email, date: dateStr, status: "recup", start_time: null, end_time: null };
      else if (preset === "pasdispo") updates[key] = { user_email: email, date: dateStr, status: "pasdispo", start_time: null, end_time: null };
      else if (preset === "clear") delete updates[key];
      else {
        const [s, e] = preset.split("|");
        updates[key] = { user_email: email, date: dateStr, status: "working", start_time: s, end_time: e };
      }
    });
    persist(updates);
  }

  // ── Copier une semaine entière vers la suivante ──
  function copyWeekToNext(weekDays) {
    const updates = { ...schedules };
    team.forEach(m => {
      weekDays.forEach(day => {
        const srcKey = `${m.email}|${fmtDate(day)}`;
        const nextDay = addDays(day, 7);
        const dstKey = `${m.email}|${fmtDate(nextDay)}`;
        const ferie = JOURS_FERIES[fmtDate(nextDay)];
        if (ferie) return;
        if (schedules[srcKey]) updates[dstKey] = { ...schedules[srcKey], date: fmtDate(nextDay) };
      });
    });
    persist(updates);
  }

  // ── Semaines types prédéfinies ──
  // ── Semaines types ──
  // Lundi (ou jour après WE/pont) = toujours 9h-18h30 pour tout le monde
  // Reste de la semaine : Equipe A = 9h-18h (ven 9h-17h) / Equipe B = 10h-18h30 (ven 10h-18h)
  // ── Semaines types avec alternance ──
  // Lundi = toujours 9h-18h30 pour tous
  // Ensuite on alterne : 9h→18h / 10h→18h30, sauf vendredi : 9h→17h / 10h→18h
  // Équipe A : Lun 9h, Mar 10h, Mer 9h, Jeu 10h, Ven 9h
  // Équipe B : Lun 9h, Mar 9h, Mer 10h, Jeu 9h, Ven 10h (inversé)
  const SEMAINE_TYPES = [
    {
      label: "Équipe A (9h/10h alternés)",
      lun: "09:00|18:30", mar: "10:00|18:30", mer: "09:00|18:00", jeu: "10:00|18:30", ven: "09:00|17:00",
    },
    {
      label: "Équipe B (10h/9h alternés)",
      lun: "09:00|18:30", mar: "09:00|18:00", mer: "10:00|18:30", jeu: "09:00|18:00", ven: "10:00|18:00",
    },
  ];

  // ── Gestion intelligente du lundi / jour après WE prolongé ──
  // Si le jour précédent est un WE ou un férié → ce jour = 9h-18h30
  function isAfterWeekendOrBridge(day) {
    const prev = addDays(day, -1);
    if (prev.getDay() === 0 || prev.getDay() === 6) return true; // après sam/dim
    if (JOURS_FERIES[fmtDate(prev)]) return true; // après férié (pont)
    return false;
  }

  function applySemaineTypeV2(email, weekDays, type) {
    const baseMapping = { 1: type.lun, 2: type.mar, 3: type.mer, 4: type.jeu, 5: type.ven }; // dow → preset
    const updates = { ...schedules };
    weekDays.forEach(day => {
      const dateStr = fmtDate(day);
      const ferie = JOURS_FERIES[dateStr];
      if (ferie) return;
      const dow = day.getDay();
      if (dow === 0 || dow === 6) return; // skip weekend
      const key = `${email}|${dateStr}`;
      // Si c'est un jour après WE/pont → toujours 9h-18h30
      let preset = baseMapping[dow];
      if (isAfterWeekendOrBridge(day)) preset = "09:00|18:30";
      if (!preset) return;
      const [s, e] = preset.split("|");
      updates[key] = { user_email: email, date: dateStr, status: "working", start_time: s, end_time: e };
    });
    persist(updates);
  }

  function applySemaineType(email, weekDays, type) {
    const mapping = [null, type.lun, type.mar, type.mer, type.jeu, type.ven, null]; // dim=0, lun=1...sam=6
    const updates = { ...schedules };
    weekDays.forEach(day => {
      const dateStr = fmtDate(day);
      const ferie = JOURS_FERIES[dateStr];
      if (ferie) return;
      const dow = day.getDay();
      const preset = mapping[dow];
      const key = `${email}|${dateStr}`;
      if (!preset) { delete updates[key]; return; }
      const [s, e] = preset.split("|");
      updates[key] = { user_email: email, date: dateStr, status: "working", start_time: s, end_time: e };
    });
    persist(updates);
  }

  return (
    <div>
      <ST emoji="📅" sub="Planifie les horaires de l'équipe — visible par tous, éditable par le manager.">Emploi du temps</ST>

      {/* Bouton "Voir plus" pour les semaines passées */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <button onClick={() => setPastWeeksShown(p => p + 4)}
          style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #E4E4E7", background: "#FAFAFA", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#71717A", fontFamily: "'Outfit',sans-serif" }}>
          ⬆️ Voir {pastWeeksShown > 0 ? "encore plus" : "les semaines"} passées
        </button>
      </div>

      {/* Grille : lignes = jours (toutes semaines), colonnes = sales */}
      <div>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "2px solid #E4E4E7", fontFamily: "'Outfit',sans-serif", color: "#71717A", fontSize: 10, width: 130, minWidth: 130, position: "sticky", left: 0, top: 0, zIndex: 30, background: "#F8FFF9", boxShadow: "4px 0 8px rgba(0,0,0,.06)" }}>Jour</th>
              {team.map(m => {
                const statuts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");
                const st = statuts[m.email] || "cdi";
                const stLabel = { cdi: "sales", stage: "stage", alternance: "alternance", freelance: "freelance" }[st] || "sales";
                return (
                  <th key={m.email} style={{ padding: "10px 6px", textAlign: "center", borderBottom: "2px solid #E4E4E7", minWidth: 100, position: "sticky", top: 0, zIndex: 20, background: "#F8FFF9" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, margin: "0 auto 4px", fontFamily: "'Outfit',sans-serif" }}>{m.avatar || (m.name || m.email).slice(0, 2).toUpperCase()}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{(m.name || m.email.split("@")[0]).split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: "#A1A1AA" }}>{stLabel}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allWeeks.map(week => (
              <React.Fragment key={fmtDate(week.monday)}>
                {/* Séparateur de semaine + actions rapides */}
                {/* Bandeau titre semaine */}
                <tr>
                  <td colSpan={1 + team.length} style={{ padding: "6px 12px", background: week.offset === 0 ? "#16A34A" : "#18181B", borderTop: "3px solid #18181B" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>
                        {week.offset === 0 ? "📌 " : ""}Semaine du {fmtLabel(week.monday)}
                        {week.offset === 0 && <span style={{ marginLeft: 8, fontSize: 9, background: "rgba(255,255,255,.3)", padding: "2px 8px", borderRadius: 4 }}>CETTE SEMAINE</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {/* Remplissage auto cette semaine */}
                        <button onClick={() => {
                          setAutoSeed(s => s + 1);
                          const currentSeed = autoSeed + 1;
                          const updates = { ...schedules };
                          const statuts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");
                          team.forEach((m, idx) => {
                            // Freelances : skip le remplissage auto
                            if ((statuts[m.email] || "cdi") === "freelance") return;
                            // Alterne A/B : change à chaque clic + chaque semaine + chaque membre
                            const typeIdx = (idx + Math.abs(week.offset) + currentSeed) % 2;
                            const type = SEMAINE_TYPES[typeIdx];
                            const baseMapping = { 1: type.lun, 2: type.mar, 3: type.mer, 4: type.jeu, 5: type.ven };
                            week.days.forEach(day => {
                              const dateStr = fmtDate(day);
                              const key = `${m.email}|${dateStr}`;
                              const existing = updates[key];
                              if (existing && (existing.status === "ecole" || existing.status === "off" || existing.status === "formation" || existing.status === "maladie" || existing.status === "recup" || existing.status === "pasdispo")) return;
                              if (JOURS_FERIES[dateStr] || day.getDay() === 0 || day.getDay() === 6) return;
                              let preset = baseMapping[day.getDay()];
                              if (isAfterWeekendOrBridge(day)) preset = "09:00|18:30";
                              if (!preset) return;
                              const [s, e] = preset.split("|");
                              updates[key] = { user_email: m.email, date: dateStr, status: "working", start_time: s, end_time: e };
                            });
                          });
                          persist(updates);
                        }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                          🪄 Auto
                        </button>
                        {/* Clear cette semaine */}
                        <button onClick={() => {
                          const updates = { ...schedules };
                          team.forEach(m => {
                            week.days.forEach(day => {
                              const key = `${m.email}|${fmtDate(day)}`;
                              if (updates[key] && updates[key].status === "working") delete updates[key];
                            });
                          });
                          persist(updates);
                        }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                          🧹 Clear
                        </button>
                        {/* Valider cette semaine */}
                        <button onClick={async () => {
                          const pub = JSON.parse(localStorage.getItem("sherpas_edt_published_v1") || "{}");
                          team.forEach(m => {
                            week.days.forEach(day => {
                              const key = `${m.email}|${fmtDate(day)}`;
                              if (schedules[key]) pub[key] = schedules[key];
                              else delete pub[key];
                            });
                          });
                          localStorage.setItem("sherpas_edt_published_v1", JSON.stringify(pub));
                          // Sync to Supabase for all users
                          try { await sb.from("config").upsert({ key: "edt_published", value: JSON.stringify(pub) }, { onConflict: "key" }); } catch {}
                          const ts = { ...pubTimestamps, [fmtDate(week.monday)]: `${new Date().toLocaleString("fr-FR")} par ${user?.name || user?.email || "?"}` };
                          setPubTimestamps(ts);
                          localStorage.setItem("sherpas_edt_pub_timestamps_v1", JSON.stringify(ts));
                          syncToSupabase("edt_pub_timestamps", ts);
                        }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                          📤 Valider
                        </button>
                        {pubTimestamps[fmtDate(week.monday)] && (
                          <span style={{ fontSize: 8, color: week.offset === 0 ? "rgba(255,255,255,.7)" : "#A1A1AA" }}>✅ {pubTimestamps[fmtDate(week.monday)]}</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                {/* Ligne dropdowns par membre — alignée avec les colonnes */}
                <tr style={{ background: week.offset === 0 ? "#dcfce7" : "#F4F4F5" }}>
                  <td style={{ padding: "4px 8px", borderBottom: "2px solid #E4E4E7", fontSize: 9, color: "#71717A", fontWeight: 700, position: "sticky", left: 0, zIndex: 10, background: week.offset === 0 ? "#dcfce7" : "#F4F4F5" }}>Remplir ↓</td>
                  {team.map(m => (
                    <td key={m.email} style={{ padding: "3px 3px", borderBottom: "2px solid #E4E4E7" }}>
                      <select defaultValue=""
                        onChange={e => {
                          const v = e.target.value;
                          if (!v) return;
                          if (v.startsWith("type_")) {
                            const idx = parseInt(v.split("_")[1]);
                            applySemaineTypeV2(m.email, week.days, SEMAINE_TYPES[idx]);
                          } else {
                            fillWeek(m.email, week.days, v);
                          }
                          e.target.value = "";
                        }}
                        style={{ width: "100%", fontSize: 9, padding: "3px 2px", borderRadius: 4, border: "1px solid #D4D4D8", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#3F3F46" }}>
                        <option value="">⚡ {(m.name || m.email).split(" ")[0]}</option>
                        {PRESETS.filter(p => {
                          if (!p.value || p.samediOnly) return false;
                          const sts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");
                          if (p.freelanceOnly && (sts[m.email] || "cdi") !== "freelance") return false;
                          return true;
                        }).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        {SEMAINE_TYPES.map((st, i) => <option key={i} value={`type_${i}`}>📋 {st.label}</option>)}
                        <option value="clear">🗑️ Effacer</option>
                      </select>
                    </td>
                  ))}
                </tr>
              {week.days.map(day => {
              const dateStr = fmtDate(day);
              const isToday = fmtDate(new Date()) === dateStr;
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const ferie = JOURS_FERIES[dateStr];
              return (
                <tr key={dateStr} style={{ background: ferie ? "#FEF2F2" : isToday ? "#FFFBEB" : isWeekend ? "#E4E4E7" : "#fff" }}>
                  <td style={{ padding: "8px 8px", borderBottom: isWeekend ? "2px solid #A1A1AA" : "1px solid #F4F4F5", fontWeight: 700, color: ferie ? "#E11D48" : isToday ? "#D97706" : isWeekend ? "#71717A" : "#3F3F46", fontFamily: "'Outfit',sans-serif", fontSize: 11, position: "sticky", left: 0, zIndex: 10, background: ferie ? "#FEF2F2" : isToday ? "#FFFBEB" : isWeekend ? "#E4E4E7" : "#fff", minWidth: 130, boxShadow: "4px 0 8px rgba(0,0,0,.06)" }}>
                    {isToday && <span style={{ fontSize: 8, background: "#D97706", color: "#fff", borderRadius: 4, padding: "1px 5px", marginRight: 4, fontWeight: 800 }}>AUJOURD'HUI</span>}
                    {ferie && <span style={{ fontSize: 8, background: "#E11D48", color: "#fff", borderRadius: 4, padding: "1px 5px", marginRight: 4, fontWeight: 800 }}>FÉRIÉ</span>}
                    {fmtLabel(day)}
                    {ferie && <div style={{ fontSize: 9, color: "#E11D48", fontWeight: 600, marginTop: 2 }}>🇫🇷 {ferie}</div>}
                  </td>
                  {team.map(m => {
                    const key = `${m.email}|${dateStr}`;
                    const cell = schedules[key];
                    const isSaving = saving === key;
                    const st = cell ? STATUS_OPTIONS.find(s => s.id === cell.status) : null;
                    return (
                      <td key={m.email} style={{ padding: "5px 5px", borderBottom: "1px solid #F4F4F5", verticalAlign: "top" }}>
                        {ferie ? (
                          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "6px 6px", textAlign: "center", minHeight: 34 }}>
                            <div style={{ fontSize: 14 }}>🇫🇷</div>
                            <div style={{ fontSize: 9, color: "#E11D48", fontWeight: 700 }}>Férié</div>
                          </div>
                        ) : day.getDay() === 0 ? (
                          <div style={{ background: "#F4F4F5", border: "1px solid #E4E4E7", borderRadius: 8, padding: "6px 6px", textAlign: "center", minHeight: 34 }}>
                            <div style={{ fontSize: 9, color: "#A1A1AA", fontWeight: 700 }}>Repos</div>
                          </div>
                        ) : (() => {
                          // Valeur courante pour le select
                          let selectVal = "";
                          if (cell) {
                            if (cell.status === "formation") selectVal = "formation";
                            else if (cell.status === "ecole") selectVal = "ecole";
                            else if (cell.status === "off") selectVal = "off";
                            else if (cell.status === "maladie") selectVal = "maladie";
                            else if (cell.status === "recup") selectVal = "recup";
                            else if (cell.status === "pasdispo") selectVal = "pasdispo";
                            else if (cell.status === "working" && cell.start_time && cell.end_time) selectVal = `${cell.start_time}|${cell.end_time}`;
                          }
                          // Cherche le preset correspondant
                          const matched = PRESETS.find(p => p.value === selectVal);
                          const stMeta = cell ? STATUS_OPTIONS.find(s => s.id === cell.status) : null;
                          // Couleurs distinctes pour horaires : 9h = vert, 10h = bleu
                          let bgColor, borderColor;
                          if (cell && cell.status === "working") {
                            const starts9 = cell.start_time && cell.start_time.startsWith("09");
                            bgColor = starts9 ? "#F0FDF4" : "#EFF6FF";
                            borderColor = starts9 ? "#16A34A" : "#0B68B4";
                          } else {
                            bgColor = stMeta ? stMeta.bg : "#fff";
                            borderColor = stMeta ? stMeta.color + "66" : "#E4E4E7";
                          }

                          return (
                            <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "6px 6px", minHeight: 38, opacity: isSaving ? .5 : 1 }}>
                              <select
                                value={selectVal}
                                onChange={e => {
                                  const v = e.target.value;
                                  if (!v) { deleteCell(m.email, dateStr); return; }
                                  if (v === "formation") { saveCell(m.email, dateStr, "formation", null, null); return; }
                                  if (v === "ecole") { saveCell(m.email, dateStr, "ecole", null, null); return; }
                                  if (v === "off") { saveCell(m.email, dateStr, "off", null, null); return; }
                                  if (v === "maladie") { saveCell(m.email, dateStr, "maladie", null, null); return; }
                                  if (v === "recup") { saveCell(m.email, dateStr, "recup", null, null); return; }
                                  if (v === "pasdispo") { saveCell(m.email, dateStr, "pasdispo", null, null); return; }
                                  if (v === "custom") {
                                    setCustomizing(key);
                                    setCustomStart(cell?.start_time || "09:00");
                                    setCustomEnd(cell?.end_time || "18:00");
                                    return;
                                  }
                                  const [s, en] = v.split("|");
                                  saveCell(m.email, dateStr, "working", s, en);
                                }}
                                style={{
                                  width: "100%", fontSize: 10, fontWeight: 700,
                                  border: "none", background: "transparent",
                                  color: cell?.status === "working" ? (cell.start_time?.startsWith("09") ? "#15803D" : "#1E40AF") : stMeta ? stMeta.color : "#A1A1AA",
                                  cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                                  outline: "none",
                                }}>
                                {PRESETS.filter(p => {
                                  if (p.samediOnly && day.getDay() !== 6) return false;
                                  const statuts = JSON.parse(localStorage.getItem("sherpas_user_statuts_v1") || "{}");
                                  const isFreelance = (statuts[m.email] || "cdi") === "freelance";
                                  if (p.freelanceOnly && !isFreelance) return false;
                                  return true;
                                }).map(p => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                                <option value="custom">✏️ Personnaliser</option>
                                {/* Si la valeur courante n'est pas un preset (horaires custom) → l'afficher aussi */}
                                {selectVal && !matched && (
                                  <option value={selectVal}>{cell.start_time} - {cell.end_time}</option>
                                )}
                              </select>
                              {customizing === key && (
                                <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                                  <input type="time" value={customStart} onChange={e => setCustomStart(e.target.value)}
                                    style={{ flex: 1, fontSize: 9, border: "1px solid #E4E4E7", borderRadius: 4, padding: "2px 3px" }} />
                                  <input type="time" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                                    style={{ flex: 1, fontSize: 9, border: "1px solid #E4E4E7", borderRadius: 4, padding: "2px 3px" }} />
                                  <button onClick={() => { saveCell(m.email, dateStr, "working", customStart, customEnd); setCustomizing(null); }}
                                    style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, border: "none", background: "#16A34A", color: "#fff", cursor: "pointer", fontWeight: 700 }}>✓</button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>


      {/* Légende */}
      <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center" }}>
        {STATUS_OPTIONS.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: s.color, fontWeight: 600 }}>
            <span>{s.emoji}</span> {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmploiDuTemps;
