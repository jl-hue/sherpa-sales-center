import { useState, useRef } from 'react';
import { C, GC, Pill, Btn, Chips, ST, CopyBtn, Logo } from '../ui';
import { PROF_TYPES, NIVEAUX, MATIERES, PSYCH_PROFILES } from '../../constants/profTypes';
import { computeV5, getLabel, refine } from '../../lib/matching';
import { getArgs } from '../../lib/argEngine';
import { today } from '../../lib/utils';
import { NEURO_MATRIX, NEURO_TROUBLES, NEURO_COLORS, NEURO_EMOJIS } from '../../constants/neuroMatrix';

// ── Parent Profile Data ─────────────────────────────────────────
const PARENT_PROFILES = [
  { id: "stresse", label: "Parent stresse", emoji: "😟", desc: "Inquiet, cherche du rassurant et des garanties" },
  { id: "rationnel", label: "Parent rationnel", emoji: "🧮", desc: "Veut des chiffres, de la methode, du concret" },
  { id: "presse", label: "Parent presse", emoji: "⏱️", desc: "Pas de temps a perdre, veut une solution tout de suite" },
  { id: "negociateur", label: "Parent negociateur", emoji: "🤝", desc: "Compare, cherche le meilleur rapport qualite-prix" },
  { id: "indecis", label: "Parent indecis", emoji: "🤔", desc: "Hesite, a besoin d'etre guide pas a pas" },
];

// ── Script Generation by Parent Profile ─────────────────────────
function getIntroScript(parentProfile, nom, psycho) {
  const n = nom || "votre enfant";
  const intros = {
    stresse: `Bonjour, je vous appelle suite a votre demande pour ${n}. Avant toute chose, je veux vous rassurer : vous avez fait le bon choix en nous contactant. Chez Sherpas, on ne laisse personne sans solution. Je vais prendre le temps de bien comprendre la situation de ${n} pour vous proposer exactement le bon accompagnement — pas un profil generique, mais quelqu'un de specifiquement adapte. Vous n'etes pas seul dans cette demarche.`,
    rationnel: `Bonjour, je vous contacte suite a votre inscription. Je vais etre concret et factuel : je vais analyser le profil de ${n} en croisant 4 criteres — niveau scolaire, profil psychologique, objectif de vie et besoin d'accompagnement — pour determiner le type de professeur le plus adapte. Notre algorithme de matching a un taux de satisfaction de 94% sur les 3 premiers mois. Commençons par les faits.`,
    presse: `Bonjour, je vais aller droit au but. J'ai analyse votre demande pour ${n}. En 5 minutes, je vais vous presenter le profil ideal, vous expliquer pourquoi, et on peut demarrer des cette semaine si le match vous convient. On y va ?`,
    negociateur: `Bonjour, merci d'avoir choisi Sherpas pour ${n}. Je sais que vous comparez probablement plusieurs solutions — et c'est normal. Ce que je vais vous montrer, c'est pourquoi notre approche est differente : on ne vend pas des heures de cours, on prescrit un profil de prof sur mesure. Le ROI est mesurable des le premier mois. Laissez-moi vous expliquer.`,
    indecis: `Bonjour, je vous appelle pour ${n}. Je comprends que ce n'est pas forcement facile de savoir par ou commencer — beaucoup de parents nous disent la meme chose. C'est justement pour ca qu'on est la : je vais vous guider etape par etape. On va d'abord comprendre la situation ensemble, et ensuite je vous proposerai une premiere seance decouverte sans engagement. Ça vous va ?`,
  };
  return intros[parentProfile] || intros.rationnel;
}

function getSpinQuestions(parentProfile, nom, psycho, objectifVie) {
  const n = nom || "votre enfant";
  const questions = {
    stresse: [
      `SITUATION : "Pouvez-vous me decrire ce qui vous inquiete le plus pour ${n} en ce moment ?"`,
      `PROBLEME : "Qu'est-ce qui se passe quand ${n} se retrouve face a une difficulte — est-ce qu'il/elle se bloque, s'enerve, abandonne ?"`,
      `IMPLICATION : "Si rien ne change d'ici la fin de l'annee, qu'est-ce qui vous fait le plus peur pour ${n} ?"`,
      `NEED-PAYOFF : "Si je vous disais qu'on a un profil qui va d'abord rassurer ${n} avant de le/la faire progresser — est-ce que ca correspondrait a ce que vous cherchez ?"`,
    ],
    rationnel: [
      `SITUATION : "Quel est le niveau actuel de ${n} en termes de notes ? Ou se situe-t-il/elle par rapport a la moyenne de sa classe ?"`,
      `PROBLEME : "Quels sont les points de blocage concrets ? Lacunes de methode, comprehension, rythme de travail ?"`,
      `IMPLICATION : "Si ces lacunes persistent, quel impact sur l'orientation ou les concours vises ?"`,
      `NEED-PAYOFF : "Notre prescription va cibler precisement ces points. Vous preferez un suivi hebdomadaire avec reporting de progression ?"`,
    ],
    presse: [
      `SITUATION : "En une phrase, c'est quoi le probleme principal de ${n} ?"`,
      `PROBLEME : "C'est urgent parce que... examen, passage en classe superieure, decrochage ?"`,
      `IMPLICATION : "OK, donc si on ne fait rien maintenant, c'est [consequence]. C'est bien ca ?"`,
      `NEED-PAYOFF : "J'ai le profil qu'il faut. On peut demarrer des cette semaine. Ça vous va ?"`,
    ],
    negociateur: [
      `SITUATION : "Avez-vous deja essaye du soutien scolaire pour ${n} ? Qu'est-ce qui n'a pas fonctionne ?"`,
      `PROBLEME : "Qu'est-ce qui manquait dans les solutions precedentes — le suivi, la qualite du prof, l'adaptation ?"`,
      `IMPLICATION : "Combien de temps et d'argent avez-vous deja investi sans resultat satisfaisant ?"`,
      `NEED-PAYOFF : "Notre approche est differente : on prescrit le bon profil d'abord, on facture ensuite. Le resultat est mesurable. Ça vous parle ?"`,
    ],
    indecis: [
      `SITUATION : "Parlez-moi de ${n} — comment ca se passe a l'ecole en ce moment, au quotidien ?"`,
      `PROBLEME : "Si vous deviez identifier UN truc qui bloque ${n}, ce serait quoi ?"`,
      `IMPLICATION : "Est-ce que ca commence a affecter sa confiance, son moral ?"`,
      `NEED-PAYOFF : "Et si on commençait par une seule seance decouverte pour voir si le courant passe avec le prof ? Zero engagement, juste un test. Ça vous rassurerait ?"`,
    ],
  };
  return questions[parentProfile] || questions.rationnel;
}

function getClosingScript(parentProfile, nom, chosenLabel) {
  const n = nom || "votre enfant";
  const closings = {
    stresse: `Pour recapituler : on a identifie un profil "${chosenLabel}" qui va d'abord creer un environnement securisant pour ${n}. Notre equipe pedagogique supervise chaque match. Si jamais le premier prof ne convient pas, on change immediatement — c'est garanti. La premiere seance est un test : zero risque pour vous. Je peux bloquer un creneau des maintenant pour que ${n} commence dans les meilleures conditions. Vous serez accompagne de bout en bout.`,
    rationnel: `En synthese : le profil "${chosenLabel}" est statistiquement le plus adapte au profil de ${n} selon nos 4 criteres de matching. Taux de reussite sur des profils similaires : 94%. Je vous envoie un recap par email avec les details de la prescription. Premiere seance planifiable sous 48h. Souhaitez-vous qu'on fixe un creneau ?`,
    presse: `Voila le plan : profil "${chosenLabel}", premiere seance possible des cette semaine. Je bloque le creneau maintenant et vous recevez la confirmation dans l'heure. On avance ?`,
    negociateur: `Le profil "${chosenLabel}" est notre meilleure prescription pour ${n}. Comparativement aux cours en agence (2 a 3x plus cher) ou aux plateformes sans matching (50% d'abandon au bout de 2 mois), notre approche est la plus efficiente. Premiere seance decouverte incluse. Je vous propose de tester et de mesurer les resultats vous-meme. Deal ?`,
    indecis: `Je resume pour que ce soit clair : on a un profil "${chosenLabel}" qui semble vraiment coller a ce dont ${n} a besoin. 87% des parents dans votre situation sont satisfaits des le premier mois. Mais je ne vous demande pas de vous engager maintenant — juste de tester UNE seance. Si ca ne convient pas, zero frais, zero obligation. Et si ca plait a ${n}, on continue. Un pas a la fois. Ça vous va ?`,
  };
  return closings[parentProfile] || closings.rationnel;
}

// ── Neuro Badge Colors ──────────────────────────────────────────
const NEURO_BADGE = {
  ideal: { label: "Ideal", bg: "#D1FAE5", color: "#15803D", border: "#86EFAC" },
  acceptable: { label: "Acceptable", bg: "#FEF9C3", color: "#854D0E", border: "#FDE047" },
  deconseille: { label: "Deconseille", bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
};

// ── Map PROF_TYPES to NEURO_PROFS ───────────────────────────────
// The neuro matrix uses different prof names. This maps the chosen prof type to the closest neuro matrix prof.
const PROF_TO_NEURO = {
  "Etudiant grande ecole": "Etudiant en Psychologie",
  "Etudiant universite": "Etudiant en Psychologie",
  "Professeur EN": "Professeur EN classique",
  "AESH": "AESH / AVS",
  "Professeur certifie": "Professeur EN classique",
  "Formateur": "Prof EN Psychopedagogie",
};

function findNeuroMatch(profTyp, trouble) {
  // Try direct match first
  let entry = NEURO_MATRIX.find(r => r.prof === profTyp && r.trouble === trouble);
  if (entry) return entry;
  // Try mapped match
  const mapped = PROF_TO_NEURO[profTyp];
  if (mapped) {
    entry = NEURO_MATRIX.find(r => r.prof === mapped && r.trouble === trouble);
  }
  return entry || null;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
function SalesLanterne({ stock, setMatchings, user }) {
  // ── State: Step ─────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── State: Form inputs ─────────────────────────────────────────
  const [prenom, setPrenom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [matieres, setMatieres] = useState([]);
  const [psycho, setPsycho] = useState("");
  const [accomp, setAccomp] = useState(5);
  const [objectifVie, setObjectifVie] = useState("");
  const [souhaitParent, setSouhaitParent] = useState("");

  // ── State: Neuro toggle ────────────────────────────────────────
  const [neuroActive, setNeuroActive] = useState(false);
  const [neuroTrouble, setNeuroTrouble] = useState("");

  // ── State: Parent profile ──────────────────────────────────────
  const [parentProfile, setParentProfile] = useState("");

  // ── State: Results ─────────────────────────────────────────────
  const [portrait, setPortrait] = useState(null);
  const [chosenB, setChosenB] = useState("");
  const [activeOption, setActiveOption] = useState("A");
  const [scriptGenerated, setScriptGenerated] = useState(false);

  const stockMap = Object.fromEntries(stock.map(s => [s.typ, s]));
  const canAnalyze = niveau && psycho && objectifVie;

  function analyze() {
    const p = computeV5(niveau, psycho, objectifVie, accomp);
    setPortrait(p);
    setChosenB(stock.find(s => s.dispo)?.typ || PROF_TYPES[0]);
    setStep(2);
    setScriptGenerated(false);
  }

  function reset() {
    setStep(1);
    setPortrait(null);
    setChosenB("");
    setActiveOption("A");
    setScriptGenerated(false);
    setPrenom("");
    setNiveau("");
    setMatieres([]);
    setPsycho("");
    setAccomp(5);
    setObjectifVie("");
    setSouhaitParent("");
    setNeuroActive(false);
    setNeuroTrouble("");
    setParentProfile("");
  }

  const matchingSavedRef = useRef(false);
  function generateScript() {
    setScriptGenerated(true);
    matchingSavedRef.current = false;
  }
  // Save matching only when leaving step 2 (reset)
  function resetAndSave() {
    if (!matchingSavedRef.current && portrait && scriptGenerated) {
      matchingSavedRef.current = true;
      const idealTyp = portrait[0].typ;
      const chosenTyp = activeOption === "A" ? idealTyp : chosenB;
      const followed = activeOption === "A";
      setMatchings({ id: Date.now(), date: today(), auteur: user?.name || "Moi", idealTyp, chosenTyp, followed, niveau, psycho });
    }
    reset();
  }

  const accompLabel = accomp <= 3 ? "Douceur & Empathie" : accomp >= 7 ? "Fermete & Cadre" : "Equilibre";
  const accompColor = accomp <= 3 ? "#16A34A" : accomp >= 7 ? "#DA4F00" : "#0B68B4";

  function injectPrenom(text) {
    return text.replace(/\[Prénom\]/g, prenom || "votre enfant").replace(/\[nom\]/g, prenom || "votre enfant");
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: FORM
  // ═══════════════════════════════════════════════════════════════
  if (step === 1) return (
    <div>
      <ST emoji="🔦" sub="Le cerveau strategique de l'application — prescription, neuro & argumentation dynamique.">Lanterne Match V5</ST>

      {/* Prenom */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>
          👤 Prenom de l'eleve <span style={{ fontSize: 12, fontWeight: 400, color: "#A1A1AA" }}>(optionnel, personnalise les scripts)</span>
        </div>
        <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ex : Lucas, Emma, Thomas..."
          style={{ width: "100%", fontSize: 14, border: "1px solid #E4E4E7", borderRadius: 10, padding: "10px 14px", boxSizing: "border-box", fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: "#18181B" }} />
      </C>

      {/* Diagnostic academique */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 16, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>📚 Diagnostic academique</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 8 }}>Niveau scolaire <span style={{ color: "#E11D48" }}>*</span></div>
          <Chips options={NIVEAUX} selected={niveau} onChange={setNiveau} color="#16A34A" single={true} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 4 }}>Matiere(s)</div>
          <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 8 }}>Affine la prescription (medecine, ingenieurs, droit...)</div>
          <Chips options={MATIERES} selected={matieres} onChange={setMatieres} color="#DA4F00" />
        </div>
      </C>

      {/* Profil psychologique */}
      <C style={{ marginBottom: 12, borderLeft: "4px solid #16A34A" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          🧠 Profil Psychologique <span style={{ fontSize: 11, background: "#E1FFED", color: "#16A34A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>V5</span>
        </div>
        <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>La personnalite de l'eleve determine le profil de prof ideal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {PSYCH_PROFILES.map(p => {
            const on = psycho === p;
            const emoji = { "Introverti / Réservé": "🤫", "Décrocheur / Démotivé": "😮‍💨", "Compétiteur / Haut Potentiel": "🔥", "Stressé / Anxieux": "😰" }[p] || "👤";
            return (
              <button key={p} onClick={() => setPsycho(on ? "" : p)}
                style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${on ? "#16A34A" : "#E4E4E7"}`, background: on ? "#E1FFED" : "#FAFAFA", textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#16A34A" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{p}</div>
              </button>
            );
          })}
        </div>
      </C>

      {/* Neuroatypique toggle */}
      <C style={{ marginBottom: 12, borderLeft: `4px solid ${neuroActive ? "#7C3AED" : "#E4E4E7"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: neuroActive ? 12 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              🧩 Neuroatypique
              <span style={{ fontSize: 11, background: neuroActive ? "#F5F3FF" : "#F4F4F5", color: neuroActive ? "#7C3AED" : "#71717A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                {neuroActive ? "ACTIF" : "OFF"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>L'eleve a un profil neuroatypique</div>
          </div>
          <button onClick={() => { setNeuroActive(!neuroActive); if (neuroActive) setNeuroTrouble(""); }}
            style={{
              width: 48, height: 26, borderRadius: 99, border: "none", cursor: "pointer", position: "relative",
              background: neuroActive ? "#7C3AED" : "#D4D4D8", transition: "background .2s",
            }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3,
              left: neuroActive ? 25 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            }} />
          </button>
        </div>

        {neuroActive && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 8 }}>Type de trouble <span style={{ color: "#E11D48" }}>*</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {NEURO_TROUBLES.map(t => {
                const on = neuroTrouble === t;
                const tc = NEURO_COLORS[t] || "#6B7280";
                return (
                  <button key={t} onClick={() => setNeuroTrouble(on ? "" : t)}
                    style={{
                      padding: "8px 14px", borderRadius: 99, border: `2px solid ${on ? tc : "#E4E4E7"}`,
                      background: on ? tc + "15" : "#FAFAFA", cursor: "pointer", transition: "all .15s",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    <span style={{ fontSize: 15 }}>{NEURO_EMOJIS[t] || "🔷"}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: on ? tc : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </C>

      {/* Besoin d'accompagnement */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          ⚖️ Besoin d'accompagnement <span style={{ fontSize: 11, background: "#E1FFED", color: "#16A34A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>V5</span>
        </div>
        <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>Positionnez le curseur selon le besoin de l'eleve</div>
        <input type="range" min={0} max={10} value={accomp} onChange={e => setAccomp(Number(e.target.value))}
          style={{ width: "100%", accentColor: accompColor, background: `linear-gradient(to right, #16A34A ${accomp * 10}%, #E4E4E7 ${accomp * 10}%)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>🫶 Douceur / Empathie</span>
          <Pill color={accompColor}>{accompLabel}</Pill>
          <span style={{ fontSize: 12, color: "#DA4F00", fontWeight: 700 }}>💪 Fermete / Cadre</span>
        </div>
      </C>

      {/* Objectif de vie */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          🎯 Objectif de vie <span style={{ fontSize: 11, background: "#E1FFED", color: "#16A34A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>V5</span>
        </div>
        <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>Qu'est-ce que cette famille veut vraiment accomplir ?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[
            ["Remise à niveau", "🔄", "Rattraper le niveau de la classe"],
            ["Réussite concours", "🏆", "Integrer une grande ecole ou un programme selectif"],
            ["Méthodologie pure", "🗂️", "Apprendre a apprendre"],
            ["Excellence académique", "⭐", "Etre le meilleur dans sa matiere"],
          ].map(([o, em, desc]) => {
            const on = objectifVie === o;
            return (
              <button key={o} onClick={() => setObjectifVie(on ? "" : o)}
                style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${on ? "#0B68B4" : "#E4E4E7"}`, background: on ? "#EFF6FF" : "#FAFAFA", textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{em}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#1E40AF" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{o}</div>
                <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 2 }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </C>

      {/* Souhait parent */}
      <C style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>
          👨‍👩‍👧 Souhait du parent <span style={{ fontSize: 12, fontWeight: 400, color: "#A1A1AA" }}>(optionnel)</span>
        </div>
        <div style={{ fontSize: 12, color: "#71717A", marginBottom: 10 }}>Quel type de prof demande-t-il ? (influence l'option B)</div>
        <Chips options={["Pas d'avis", ...PROF_TYPES]} selected={souhaitParent} onChange={setSouhaitParent} color="#DA4F00" single={true} />
      </C>

      {/* Profil du parent */}
      <C style={{ marginBottom: 12, borderLeft: `4px solid ${parentProfile ? "#D97706" : "#E4E4E7"}` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          🎭 Profil du parent
          <span style={{ fontSize: 11, background: "#FFFBEB", color: "#D97706", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>NOUVEAU</span>
        </div>
        <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>Adapte l'introduction, les questions SPIN et le closing du script</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {PARENT_PROFILES.map(p => {
            const on = parentProfile === p.id;
            return (
              <button key={p.id} onClick={() => setParentProfile(on ? "" : p.id)}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: `2px solid ${on ? "#D97706" : "#E4E4E7"}`,
                  background: on ? "#FFFBEB" : "#FAFAFA",
                  textAlign: "left", cursor: "pointer", transition: "all .15s",
                }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{p.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#92400E" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{p.label}</div>
                <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 2 }}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </C>

      {/* Stock */}
      <C style={{ marginBottom: 14, background: "#F0FDF4", border: "1px solid #C0EAD3", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <Logo size={15} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D", fontFamily: "'Outfit',sans-serif" }}>Stock plateforme Sherpas (temps reel)</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {stock.map(s => (
            <span key={s.typ} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 99,
              background: s.dispo ? "#D1FAE5" : "#FEE2E2",
              color: s.dispo ? "#15803D" : "#B91C1C", fontWeight: 600,
              border: `1px solid ${s.dispo ? "#86EFAC" : "#FCA5A5"}`,
            }}>
              {s.dispo ? "✓" : "✗"} {s.typ} ({s.nb})
            </span>
          ))}
        </div>
      </C>

      {!canAnalyze && <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 10, textAlign: "center" }}>Remplis niveau, profil psychologique et objectif de vie pour continuer</div>}
      <Btn onClick={analyze} disabled={!canAnalyze} full color="#16A34A" style={{ padding: "13px", borderRadius: 99, fontSize: 15 }}>
        🔦 Allumer la Lanterne V5 →
      </Btn>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: RESULTS — Dual Path + Full Script
  // ═══════════════════════════════════════════════════════════════
  if (step === 2 && portrait) {
    const idealTyp = portrait[0].typ;
    const idealLabel = getLabel(idealTyp, psycho);
    const idealRefined = refine(idealTyp, matieres);
    const idealDispo = stockMap[idealTyp]?.dispo;

    const chosenTyp = activeOption === "A" ? idealTyp : chosenB;
    const chosenLabel = getLabel(chosenTyp, psycho);
    const chosenRefined = refine(chosenTyp, matieres);
    const args = getArgs(chosenTyp, psycho);
    const nom = prenom || "l'eleve";

    // Neuro match
    const neuroEntry = (neuroActive && neuroTrouble) ? findNeuroMatch(chosenTyp, neuroTrouble) : null;
    const neuroBadge = neuroEntry ? NEURO_BADGE[neuroEntry.badge] : null;

    // Parent profile for script
    const pp = parentProfile || "rationnel";
    const ppLabel = PARENT_PROFILES.find(p => p.id === pp)?.label || "Parent rationnel";

    // Build full script text
    const introText = getIntroScript(pp, nom, psycho);
    const spinQuestions = getSpinQuestions(pp, nom, psycho, objectifVie);
    const closingText = getClosingScript(pp, nom, chosenLabel);

    const fullScript = [
      `═══ SCRIPT COMPLET — ${chosenLabel} ═══`,
      `Eleve : ${nom} | Psycho : ${psycho} | Objectif : ${objectifVie} | Parent : ${ppLabel}`,
      `Profil : ${chosenRefined}`,
      neuroActive && neuroTrouble ? `Neuro : ${neuroTrouble}` : null,
      ``,
      `── SECTION 1 : INTRODUCTION ──`,
      introText,
      ``,
      `── SECTION 2 : DECOUVERTE (SPIN) ──`,
      ...spinQuestions,
      ``,
      `── SECTION 3 : PRESCRIPTION ──`,
      args ? `🪝 LE CROCHET\n${injectPrenom(args.hook)}` : null,
      args ? `\n🏆 L'ARGUMENT DE CONFIANCE\n${injectPrenom(args.trust)}` : null,
      args ? `\n🌉 LE PONT PEDAGOGIQUE\n${injectPrenom(args.bridge)}` : null,
      args ? `\n↩️ L'ARGUMENT DE REBOND\n${injectPrenom(args.rebound)}` : null,
      neuroEntry ? `\n── SECTION 4 : NEURO (${neuroTrouble}) ──` : null,
      neuroEntry ? `📋 Realite :\n${neuroEntry.realite}` : null,
      neuroEntry ? `\n📞 En appel :\n${neuroEntry.appel}` : null,
      ``,
      `── SECTION ${neuroEntry ? "5" : "4"} : CLOSING ──`,
      closingText,
    ].filter(Boolean).join("\n");

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 900, color: "#18181B", margin: "0 0 2px", fontFamily: "'Outfit',sans-serif" }}>🔦 Resultat Lanterne V5</h1>
            <p style={{ color: "#71717A", fontSize: 13 }}>
              Dual Path · {nom} · {psycho} · {objectifVie}
              {neuroActive && neuroTrouble && <span style={{ color: "#7C3AED", fontWeight: 600 }}> · 🧩 {neuroTrouble}</span>}
              {parentProfile && <span style={{ color: "#D97706", fontWeight: 600 }}> · 🎭 {ppLabel}</span>}
            </p>
          </div>
          <Btn onClick={resetAndSave} outline color="#71717A" sm>← Nouveau</Btn>
        </div>

        {/* ── DUAL PATH ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          {/* OPTION A — Ideal Sherpas */}
          <button onClick={() => setActiveOption("A")}
            style={{ borderRadius: 16, border: `2px solid ${activeOption === "A" ? "#16A34A" : "#E4E4E7"}`, background: activeOption === "A" ? "#F0FDF4" : "#fff", padding: 18, textAlign: "left", cursor: "pointer", transition: "all .2s", position: "relative" }}>
            {activeOption === "A" && <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>✦</div>
              <Pill color="#16A34A" bg="#E1FFED">OPTION A — L'Ideal Sherpas</Pill>
            </div>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 4, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase", letterSpacing: ".06em" }}>Algorithme Matrice</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#18181B", lineHeight: 1.3, fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>{idealLabel}</div>
            <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, marginBottom: 10 }}>↳ {idealRefined}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
              {portrait.slice(0, 3).map(({ typ, score }, i) => (
                <div key={typ} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 90, fontSize: 10, color: "#71717A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{typ}</div>
                  <div style={{ flex: 1, height: 4, background: "#E4E4E7", borderRadius: 99 }}>
                    <div style={{ height: 4, background: i === 0 ? "#16A34A" : "#C0EAD3", borderRadius: 99, width: `${portrait[0].score > 0 ? (score / portrait[0].score) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: idealDispo ? "#16A34A" : "#E11D48" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: idealDispo ? "#15803D" : "#B91C1C" }}>
                {idealDispo ? `✓ Disponible en stock (${stockMap[idealTyp]?.nb})` : "✗ Stock indisponible"}
              </span>
            </div>
          </button>

          {/* OPTION B — Choix Sales */}
          <button onClick={() => setActiveOption("B")}
            style={{ borderRadius: 16, border: `2px solid ${activeOption === "B" ? "#0B68B4" : "#E4E4E7"}`, background: activeOption === "B" ? "#EFF6FF" : "#fff", padding: 18, textAlign: "left", cursor: "pointer", transition: "all .2s", position: "relative" }}>
            {activeOption === "B" && <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: "#0B68B4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>🎛️</div>
              <Pill color="#0B68B4" bg="#DBEAFE">OPTION B — Choix Sales</Pill>
            </div>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 8, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase", letterSpacing: ".06em" }}>Selection manuelle (stock reel)</div>
            <select value={chosenB} onChange={e => setChosenB(e.target.value)}
              onClick={e => { e.stopPropagation(); setActiveOption("B"); }}
              style={{ width: "100%", fontSize: 13, fontWeight: 700, border: "2px solid #DBEAFE", borderRadius: 10, padding: "9px 12px", fontFamily: "'Outfit',sans-serif", color: "#1E40AF", background: "#fff", cursor: "pointer", marginBottom: 10 }}>
              {PROF_TYPES.map(t => { const s = stockMap[t]; return <option key={t} value={t}>{s?.dispo ? "✓" : "✗"} {t} ({s?.nb || 0})</option>; })}
            </select>
            {chosenB && <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>{getLabel(chosenB, psycho)}</div>
              <div style={{ fontSize: 12, color: "#0B68B4", fontWeight: 600, marginBottom: 8 }}>↳ {refine(chosenB, matieres)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stockMap[chosenB]?.dispo ? "#16A34A" : "#E11D48" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: stockMap[chosenB]?.dispo ? "#15803D" : "#B91C1C" }}>
                  {stockMap[chosenB]?.dispo ? `✓ Disponible (${stockMap[chosenB]?.nb})` : "✗ Stock indisponible"}
                </span>
              </div>
            </div>}
          </button>
        </div>

        {/* ── BOUTON GENERER ── */}
        {!scriptGenerated && (
          <Btn onClick={generateScript} full color="#18181B" style={{ padding: "13px", borderRadius: 99, fontSize: 14, marginBottom: 16 }}>
            ⚡ Generer le Script Complet — {activeOption === "A" ? "Ideal Sherpas" : "Choix Sales"}
          </Btn>
        )}

        {/* ═══ FULL SCRIPT ═══ */}
        {scriptGenerated && (
          <div>
            {/* Header + copy all */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>📜 Script Personnalisé</div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>{chosenLabel} · {nom} · {psycho}</div>
              </div>
              <CopyBtn text={fullScript} />
            </div>

            {/* ── PRESCRIPTION (4 arguments) ── */}
            {args && (
              <C style={{ marginBottom: 10, background: "#F0FDF4", border: "1px solid #C0EAD3", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 16 }}>💊</span>
                      <Pill color="#16A34A">SECTION 3 — PRESCRIPTION</Pill>
                    </div>
                    <div style={{ fontSize: 11, color: "#71717A" }}>Les 4 arguments du moteur ARG_ENGINE — {chosenLabel}</div>
                  </div>
                  <CopyBtn text={[
                    `🪝 ${injectPrenom(args.hook)}`,
                    `🏆 ${injectPrenom(args.trust)}`,
                    `🌉 ${injectPrenom(args.bridge)}`,
                    `↩️ ${injectPrenom(args.rebound)}`,
                  ].join("\n\n")} />
                </div>
                {[
                  { icon: "🪝", label: "LE CROCHET (Hook)", desc: "Pourquoi ce profil va matcher avec la personnalite de l'enfant", text: args.hook, color: "#16A34A", bg: "#F0FDF4", border: "#C0EAD3" },
                  { icon: "🏆", label: "ARGUMENT DE CONFIANCE (Trust)", desc: "Pourquoi ce profil rassure le parent", text: args.trust, color: "#0B68B4", bg: "#EFF6FF", border: "#BFDBFE" },
                  { icon: "🌉", label: "LE PONT PEDAGOGIQUE", desc: "Le benefice concret pour l'eleve", text: args.bridge, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
                  { icon: "↩️", label: "ARGUMENT DE REBOND", desc: "Pour contrer l'objection classique liee a ce profil", text: args.rebound, color: "#DA4F00", bg: "#FFF7F0", border: "#FED7AA" },
                ].map(({ icon, label, desc, text, color, bg, border }) => (
                  <div key={label} style={{ marginBottom: 8, background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color, fontFamily: "'Outfit',sans-serif" }}>{label}</span>
                      </div>
                      <CopyBtn text={injectPrenom(text)} />
                    </div>
                    <div style={{ fontSize: 11, color: "#71717A", marginBottom: 4 }}>{desc}</div>
                    <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Inter',sans-serif", borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
                      "{injectPrenom(text)}"
                    </div>
                  </div>
                ))}
              </C>
            )}

            {!args && (
              <C style={{ marginBottom: 10, background: "#FFF7F0", border: "1px solid #FED7AA", textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>🔧</div>
                <div style={{ fontSize: 14, color: "#92400E", fontWeight: 600 }}>Arguments en cours d'enrichissement pour ce profil</div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 4 }}>Ce profil sera disponible dans la prochaine mise a jour.</div>
              </C>
            )}

            {/* ── SECTION 4: NEURO (conditional) ── */}
            {neuroActive && neuroTrouble && (
              <C style={{ marginBottom: 10, background: "#F5F3FF", border: "1px solid #DDD6FE", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 16 }}>{NEURO_EMOJIS[neuroTrouble] || "🧩"}</span>
                      <Pill color="#7C3AED">SECTION 4 — NEURO ({neuroTrouble})</Pill>
                    </div>
                    <div style={{ fontSize: 11, color: "#71717A" }}>Matrice neuroatypique — {chosenLabel} x {neuroTrouble}</div>
                  </div>
                  {neuroEntry && <CopyBtn text={`Realite : ${neuroEntry.realite}\n\nEn appel : ${neuroEntry.appel}`} />}
                </div>

                {neuroEntry ? (
                  <div>
                    {/* Badge */}
                    <div style={{ marginBottom: 10 }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 99,
                        background: neuroBadge.bg, color: neuroBadge.color,
                        border: `1px solid ${neuroBadge.border}`, fontWeight: 700,
                      }}>
                        {neuroEntry.badge === "ideal" ? "✅" : neuroEntry.badge === "acceptable" ? "⚠️" : "❌"} {neuroBadge.label}
                      </span>
                    </div>

                    {/* Realite */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, fontFamily: "'Outfit',sans-serif" }}>📋 La realite</div>
                      <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.7, background: "rgba(255,255,255,.6)", borderRadius: 9, padding: "10px 13px", borderLeft: "3px solid #7C3AED" }}>
                        {neuroEntry.realite}
                      </div>
                    </div>

                    {/* En appel */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, fontFamily: "'Outfit',sans-serif" }}>📞 En appel</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ flex: 1, fontSize: 13, color: "#3F3F46", lineHeight: 1.7, fontStyle: "italic", background: "rgba(255,255,255,.6)", borderRadius: 9, padding: "10px 13px", borderLeft: "3px solid #7C3AED" }}>
                          {neuroEntry.appel}
                        </div>
                        <CopyBtn text={neuroEntry.appel} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 16, color: "#71717A", fontSize: 13 }}>
                    Aucune combinaison trouvee dans la matrice neuro pour {chosenLabel} x {neuroTrouble}.
                    <div style={{ fontSize: 11, marginTop: 4, color: "#A1A1AA" }}>La matrice couvre les profils : Psychologue, Prof EN Psychopedagogie, Professeur EN classique, AESH / AVS, Etudiant en Psychologie</div>
                  </div>
                )}
              </C>
            )}

            <div style={{ marginTop: 4 }}>
              <Btn onClick={() => { setScriptGenerated(false); }} outline color="#71717A" sm>Changer d'option</Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SalesLanterne;
