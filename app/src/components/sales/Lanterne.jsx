import { useState, useRef } from 'react';
import { C, GC, Pill, Btn, Chips, ST, CopyBtn, Logo } from '../ui';
import { PROF_TYPES, NIVEAUX, MATIERES, PSYCH_PROFILES, PROF_HIERARCHY, CLASSES_COLLEGE, CLASSES_LYCEE_GENERAL, CLASSES_LYCEE_PRO, CLASSES_BTS, CLASSES_UNIV, PREPA_FILIERES, SPE_PREMIERE, PARCOURSUP_OPTIONS, PARCOURSUP_HIERARCHY, getRecommendedHierarchy } from '../../constants/profTypes';
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
// Construit une chaine de contexte academique precis pour personnaliser les scripts
function buildAcademicContext(diag) {
  const { niveau, classe, brevetPrep, spes = [], parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere } = diag || {};
  const parts = [];
  if (niveau === "Collège" && classe) {
    parts.push(`en ${classe}`);
    if (classe === "3e" && brevetPrep) parts.push(`prépare le brevet`);
  } else if (niveau === "Lycée général" && classe) {
    parts.push(`en ${classe}`);
    if (spes.length > 0) parts.push(`spés ${spes.join("/")}`);
    if (parcoursupCible) parts.push(`cible ${parcoursupCible}`);
    if (parcoursupEcole) parts.push(`vise ${parcoursupEcole}`);
  } else if (niveau === "Lycée pro" && classe) {
    parts.push(`en ${classe}`);
  } else if (niveau === "Prépa" && prepaFiliere) {
    parts.push(`en prépa ${prepaFiliere}`);
  } else if (niveau === "Université") {
    if (classe) parts.push(`en ${classe}`);
    if (univFiliere) parts.push(univFiliere);
  } else if (niveau) {
    parts.push(`en ${niveau}`);
  }
  return parts.length > 0 ? parts.join(", ") : niveau || "";
}

function getIntroScript(parentProfile, nom, psycho, diag) {
  const n = nom || "votre enfant";
  const ctx = buildAcademicContext(diag);
  const ctxStr = ctx ? ` (${ctx})` : "";
  const intros = {
    stresse: `Bonjour, je vous appelle suite à votre demande pour ${n}${ctxStr}. Avant toute chose, je veux vous rassurer : vous avez fait le bon choix en nous contactant. Chez Sherpas, on ne laisse personne sans solution. Je vais prendre le temps de bien comprendre la situation de ${n} pour vous proposer exactement le bon accompagnement — pas un profil générique, mais quelqu'un de spécifiquement adapté à son niveau et à ses besoins. Vous n'êtes pas seul dans cette démarche.`,
    rationnel: `Bonjour, je vous contacte suite à votre inscription pour ${n}${ctxStr}. Je vais être concret et factuel : je vais analyser le profil de ${n} en croisant 4 critères — niveau scolaire précis, profil psychologique, objectif de vie et besoin d'accompagnement — pour déterminer le type de professeur le plus adapté. Notre algorithme de matching a un taux de satisfaction de 94% sur les 3 premiers mois. Commençons par les faits.`,
    presse: `Bonjour, je vais aller droit au but. J'ai analysé votre demande pour ${n}${ctxStr}. En 5 minutes, je vais vous présenter le profil idéal, vous expliquer pourquoi, et on peut démarrer dès cette semaine si le match vous convient. On y va ?`,
    negociateur: `Bonjour, merci d'avoir choisi Sherpas pour ${n}${ctxStr}. Je sais que vous comparez probablement plusieurs solutions — et c'est normal. Ce que je vais vous montrer, c'est pourquoi notre approche est différente : on ne vend pas des heures de cours, on prescrit un profil de prof sur mesure adapté précisément au contexte de ${n}. Le ROI est mesurable dès le premier mois. Laissez-moi vous expliquer.`,
    indecis: `Bonjour, je vous appelle pour ${n}${ctxStr}. Je comprends que ce n'est pas forcément facile de savoir par où commencer — beaucoup de parents nous disent la même chose. C'est justement pour ça qu'on est là : je vais vous guider étape par étape. On va d'abord comprendre la situation de ${n} ensemble, et ensuite je vous proposerai une première séance découverte sans engagement. Ça vous va ?`,
  };
  return intros[parentProfile] || intros.rationnel;
}

function getSpinQuestions(parentProfile, nom, psycho, objectifVie, diag) {
  const n = nom || "votre enfant";
  const ctx = buildAcademicContext(diag);
  const niveau = diag?.niveau;
  const classe = diag?.classe;
  const parcoursupCible = diag?.parcoursupCible;
  // Question contextuelle additionnelle selon le niveau
  let contextQ = null;
  if (niveau === "Lycée général" && classe === "Terminale" && !parcoursupCible) {
    contextQ = `CONTEXTE PARCOURSUP : "${n} est en Terminale — quelle orientation post-bac vise-t-il/elle exactement ? Prépa, école post-bac, université, médecine ?"`;
  } else if (niveau === "Lycée général" && classe === "Première") {
    contextQ = `CONTEXTE SPÉS : "Quelles spécialités ${n} a choisies en Première, et pense-t-il/elle les garder en Terminale ?"`;
  } else if (niveau === "Collège" && classe === "3e" && diag?.brevetPrep) {
    contextQ = `CONTEXTE BREVET : "${n} prépare le DNB — quels sont les sujets/matières où vous sentez le plus de tension ?"`;
  } else if (niveau === "Prépa") {
    contextQ = `CONTEXTE PRÉPA : "${n} est en prépa ${diag?.prepaFiliere || ""} — quels sont les concours visés et l'année ?"`;
  }
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
  const base = questions[parentProfile] || questions.rationnel;
  return contextQ ? [contextQ, ...base] : base;
}

// ── Guide d'argumentation par profil parent ─────────────────────
function getArgumentationGuide(parentProfile, nom, profPropose, diag, profProfilLabel) {
  const n = nom || "votre enfant";
  // Combinaison label hierarchique + precisions texte
  const profCombined = [profProfilLabel, profPropose].filter(Boolean).join(" — ");
  const p = profCombined || "ce profil";
  const ctx = buildAcademicContext(diag);
  const ctxStr = ctx ? ` (${ctx})` : "";

  const guides = {
    stresse: {
      questions: [
        `"Qu'est-ce qui vous inquiète le plus pour ${n} en ce moment ?"`,
        `"Avez-vous déjà essayé d'autres solutions qui n'ont pas fonctionné ?"`,
        `"Si rien ne change, qu'est-ce que ça veut dire pour ${n} dans 6 mois ?"`,
        `"Qu'est-ce qui vous rassurerait sur le profil du prof ?"`,
      ],
      arguments: [
        `"On a sélectionné ${p} précisément pour son côté rassurant et sa capacité à créer un climat de confiance. C'est exactement ce dont ${n} a besoin."`,
        `"Vous n'êtes pas seul dans cette démarche : notre équipe pédagogique supervise chaque match et reste disponible si vous avez des questions."`,
        `"Si jamais ça ne convient pas, on change immédiatement de prof — c'est garanti, sans frais."`,
        `"La première séance est un test : zéro engagement, vous voyez si ${n} se sent à l'aise avant de continuer."`,
      ],
      objections: [
        `Si elle dit "je dois en parler à mon conjoint" → "Bien sûr, c'est important. Voulez-vous qu'on bloque déjà un créneau de découverte sans engagement, le temps que vous en parliez ensemble ?"`,
        `Si elle hésite sur le prix → "Je comprends. Sachez que la première séance est offerte si jamais ${n} ne veut pas continuer."`,
      ],
    },
    rationnel: {
      questions: [
        `"Quel est le niveau actuel de ${n} en chiffres : moyenne générale, classement ?"`,
        `"Quels objectifs concrets visez-vous d'ici la fin de l'année ?"`,
        `"Avez-vous identifié précisément les chapitres ou compétences qui posent problème ?"`,
        `"Comment souhaitez-vous mesurer la progression ?"`,
      ],
      arguments: [
        `"${p} a été sélectionné via notre algorithme de matching avec un taux de réussite de 94% sur les profils similaires à ${n}${ctxStr}."`,
        `"Notre méthodologie repose sur 4 critères croisés : niveau, profil psychologique, objectif et besoin d'accompagnement."`,
        `"Chaque séance fait l'objet d'un compte-rendu structuré que vous recevez par email. Vous mesurez la progression objectivement."`,
        `"Statistiquement, les élèves qui suivent ce type d'accompagnement progressent de 3 à 5 points en moyenne en 3 mois."`,
      ],
      objections: [
        `Si elle compare les prix → "Le ratio prix/résultat est notre meilleur argument. Les plateformes low-cost ont 50% d'abandon en 2 mois."`,
        `Si elle veut des références → "Je peux vous transmettre des études de cas anonymisées sur des profils similaires."`,
      ],
    },
    presse: {
      questions: [
        `"En une phrase : c'est quoi LE problème principal de ${n} aujourd'hui ?"`,
        `"C'est urgent à cause de quoi ? Examen, passage, décrochage ?"`,
        `"On peut commencer cette semaine — ça vous va ?"`,
      ],
      arguments: [
        `"J'ai ${p} qui correspond exactement. Il/elle est disponible dès cette semaine."`,
        `"Pas de bla-bla : on lance la première séance, on voit si ça matche, et on ajuste."`,
        `"Vous n'avez rien à signer aujourd'hui — juste à valider le créneau."`,
      ],
      objections: [
        `Si elle dit "je vais réfléchir" → "Bien sûr. Mais sachez qu'on a 3 demandes en cours pour ce profil. Si vous voulez le bloquer, c'est maintenant."`,
      ],
    },
    negociateur: {
      questions: [
        `"Avez-vous déjà essayé du soutien scolaire ailleurs ? Qu'est-ce qui n'a pas marché ?"`,
        `"Combien avez-vous déjà investi sans résultat satisfaisant ?"`,
        `"Qu'est-ce qui ferait basculer votre décision aujourd'hui ?"`,
      ],
      arguments: [
        `"${p} n'est pas un prof lambda — c'est une prescription précise. C'est ce qui justifie notre approche premium."`,
        `"Notre ROI est mesurable : en moyenne, +3 points en 3 mois sur les profils similaires."`,
        `"On prescrit le bon profil d'abord, on facture ensuite. Si ${n} ne progresse pas, c'est qu'on s'est trompé — et c'est notre responsabilité."`,
        `"Comparativement aux cours en agence (2 à 3x plus cher) ou aux plateformes sans matching (50% d'abandon), notre approche est la plus efficiente."`,
      ],
      objections: [
        `Si elle veut négocier le prix → "Je ne peux pas baisser le tarif horaire, mais je peux vous offrir la première séance découverte. Deal ?"`,
      ],
    },
    indecis: {
      questions: [
        `"Parlez-moi de ${n} — comment ça se passe à l'école au quotidien ?"`,
        `"Si vous deviez identifier UN truc qui bloque ${n}, ce serait quoi ?"`,
        `"Est-ce que ça commence à affecter sa confiance, son moral ?"`,
        `"Vous préférez démarrer par une seule séance test, sans engagement ?"`,
      ],
      arguments: [
        `"${p} est exactement le profil qu'il faut pour ${n}${ctxStr}. Mais je ne vous demande pas de vous engager maintenant."`,
        `"On a un protocole simple : 1 séance découverte, vous voyez si ça plaît, vous décidez après."`,
        `"87% des parents dans votre situation sont satisfaits dès le premier mois. Mais ce qui compte, c'est ce que VOUS allez ressentir après cette première séance."`,
        `"Un pas à la fois — on commence doucement et on ajuste."`,
      ],
      objections: [
        `Si elle dit "je ne sais pas" → "C'est normal. Justement, la séance découverte est faite pour ça : pas besoin de décider maintenant."`,
        `Si elle veut comparer → "Bien sûr. Mais notez qu'on est la seule plateforme à proposer une prescription personnalisée. Les autres vendent des heures."`,
      ],
    },
  };

  const fomo = {
    stresse: `"Je veux être transparent : ${p} est très demandé et je n'ai que 2 créneaux disponibles cette semaine pour ${n}. Je peux vous bloquer un créneau maintenant — vous aurez 24h pour confirmer définitivement, sans aucun engagement. Si vous attendez, je risque de ne plus l'avoir disponible."`,
    rationnel: `"Donnée factuelle : ${p} accompagne actuellement 6 élèves et n'a plus que 2 créneaux libres cette semaine. Si vous validez aujourd'hui, je vous garantis le créneau optimal pour ${n}. Demain, je ne peux pas garantir."`,
    presse: `"On a 3 demandes en cours pour ${p} — si vous voulez sécuriser, c'est maintenant. Demain, je ne pourrai pas vous le promettre."`,
    negociateur: `"Petit point honnête : ${p} est notre meilleur match pour ${n}, mais c'est aussi l'un de nos profils les plus demandés. Si vous validez aujourd'hui, je vous bloque le tarif actuel. Si vous attendez, j'ai 2 autres familles intéressées qui pourraient prendre la place."`,
    indecis: `"Je vais être franc avec vous : ${p} a été spécifiquement identifié pour ${n}, mais d'autres familles sont sur le coup. Je peux vous bloquer une séance découverte sans engagement aujourd'hui — comme ça vous gardez la priorité. Si vous attendez et qu'on me prend le créneau, je ne pourrai pas faire revenir ce profil avant 2-3 semaines."`,
  };

  return {
    questions: guides[parentProfile]?.questions || guides.rationnel.questions,
    arguments: guides[parentProfile]?.arguments || guides.rationnel.arguments,
    objections: guides[parentProfile]?.objections || guides.rationnel.objections,
    fomo: fomo[parentProfile] || fomo.rationnel,
  };
}

function getClosingScript(parentProfile, nom, chosenLabel, diag) {
  const n = nom || "votre enfant";
  const ctx = buildAcademicContext(diag);
  const ctxStr = ctx ? ` (${ctx})` : "";
  const closings = {
    stresse: `Pour récapituler : pour ${n}${ctxStr}, on a identifié un profil "${chosenLabel}" qui va d'abord créer un environnement sécurisant. Notre équipe pédagogique supervise chaque match. Si jamais le premier prof ne convient pas, on change immédiatement — c'est garanti. La première séance est un test : zéro risque pour vous. Je peux bloquer un créneau dès maintenant pour que ${n} commence dans les meilleures conditions. Vous serez accompagné de bout en bout.`,
    rationnel: `En synthèse : pour ${n}${ctxStr}, le profil "${chosenLabel}" est statistiquement le plus adapté selon nos 4 critères de matching. Taux de réussite sur des profils similaires : 94%. Je vous envoie un récap par email avec les détails de la prescription. Première séance planifiable sous 48h. Souhaitez-vous qu'on fixe un créneau ?`,
    presse: `Voilà le plan : pour ${n}${ctxStr}, profil "${chosenLabel}", première séance possible dès cette semaine. Je bloque le créneau maintenant et vous recevez la confirmation dans l'heure. On avance ?`,
    negociateur: `Le profil "${chosenLabel}" est notre meilleure prescription pour ${n}${ctxStr}. Comparativement aux cours en agence (2 à 3x plus cher) ou aux plateformes sans matching (50% d'abandon au bout de 2 mois), notre approche est la plus efficiente. Première séance découverte incluse. Je vous propose de tester et de mesurer les résultats vous-même. Deal ?`,
    indecis: `Je résume pour que ce soit clair : pour ${n}${ctxStr}, on a un profil "${chosenLabel}" qui semble vraiment coller à ce dont ${n} a besoin. 87% des parents dans votre situation sont satisfaits dès le premier mois. Mais je ne vous demande pas de vous engager maintenant — juste de tester UNE séance. Si ça ne convient pas, zéro frais, zéro obligation. Et si ça plaît à ${n}, on continue. Un pas à la fois. Ça vous va ?`,
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
const PROF_TO_NEURO = {
  "Étudiant grande école": "Étudiant en Psychologie",
  "Étudiant université": "Étudiant en Psychologie",
  "Professeur EN": "Professeur EN classique",
  "AESH": "AESH / AVS",
  "Professeur certifié": "Professeur EN classique",
  "Formateur": "Prof EN Psychopédagogie",
};

function findNeuroMatch(profTyp, trouble) {
  let entry = NEURO_MATRIX.find(r => r.prof === profTyp && r.trouble === trouble);
  if (entry) return entry;
  const mapped = PROF_TO_NEURO[profTyp];
  if (mapped) {
    entry = NEURO_MATRIX.find(r => r.prof === mapped && r.trouble === trouble);
  }
  return entry || null;
}

// ── NEURO + NIVEAU : alerte post-college ────────────────────────
const NIVEAUX_NEURO_OK = ["Primaire", "Collège"];
function getNeuroNiveauWarning(niveau, trouble, nom, classe) {
  const n = nom || "votre enfant";
  if (NIVEAUX_NEURO_OK.includes(niveau)) return null;
  const ctxClasse = classe ? ` (${classe})` : "";
  return {
    warning: true,
    title: `${trouble} + ${niveau}${ctxClasse} — Approche mixte recommandée`,
    script: `Soyons précis sur l'enjeu : à partir du ${niveau.toLowerCase()}${ctxClasse}, on peut TOUT À FAIT trouver un prof adapté pour ${n}, mais l'approche change.\n\nAu collège, on a des profils spécialisés (AESH, prof en psychopédagogie) qui couvrent à la fois le programme et l'accompagnement du ${trouble}.\n\nÀ partir du lycée, le niveau académique monte — il faut souvent COMBINER deux choses :\n\n1. Un prof spécialiste de la matière (notre prescription Lanterne ci-dessus) qui assure le niveau académique\n2. Si le ${trouble} est marqué : un suivi parallèle avec un professionnel adapté (orthophoniste, neuropsychologue, coach DYS/TDAH)\n\nLA BONNE NOUVELLE : nos profs sont briefés sur le profil de chaque élève. Pour ${n}, le prof saura :\n• Découper les consignes en étapes courtes et claires\n• Proposer des supports visuels et des schémas\n• Adapter le rythme avec des pauses régulières\n• Éviter les doubles tâches (écouter + écrire en même temps)\n• Reformuler systématiquement ce qui n'est pas compris\n\nDans nos profils, le PROF EN PSYCHOPÉDAGOGIE est particulièrement adapté — c'est le profil qui combine le mieux maîtrise du programme + sensibilité aux profils atypiques.\n\nEt si nécessaire, on peut faciliter la communication entre notre prof et le spécialiste qui suit ${n}. Ça vous parle ?`
  };
}

// ═══════════════════════════════════════════════════════════════════
// COMPATIBILITE MATIERES — 1 prof pour plusieurs matieres ?
// ═══════════════════════════════════════════════════════════════════
const MATIERE_FAMILIES={
  sciences:["Maths","Physique","Chimie","SVT","Informatique"],
  lettres:["Français","Philosophie","Histoire-Géo"],
  langues:["Anglais","Espagnol","Allemand"],
  eco:["Économie"],
};
const COMPATIBLE_COMBOS=[
  {mats:["Maths","Physique"],profil:"étudiant en école d'ingénieurs (X, Centrale, Mines, CentraleSupélec)",filiere:"prépa MP/PC",icon:"🔧"},
  {mats:["Maths","Physique","Chimie"],profil:"étudiant en prépa PC ou école d'ingénieurs généraliste",filiere:"prépa PC",icon:"🔬"},
  {mats:["Physique","Chimie"],profil:"étudiant en prépa PC ou école de chimie",filiere:"prépa PC / chimie",icon:"⚗️"},
  {mats:["SVT","Chimie"],profil:"étudiant en prépa BCPST ou médecine",filiere:"prépa BCPST / PASS",icon:"🧬"},
  {mats:["Maths","SVT"],profil:"étudiant issu de prépa BCPST (biologie + maths poussées)",filiere:"prépa BCPST",icon:"🌿"},
  {mats:["SVT","Physique"],profil:"étudiant en prépa BCPST ou biophysique",filiere:"prépa BCPST",icon:"🔬"},
  {mats:["Maths","Informatique"],profil:"étudiant en école d'ingénieurs informatique (EPITA, ENSIMAG, CentraleSupélec)",filiere:"prépa MP option info",icon:"💻"},
  {mats:["Maths","Économie"],profil:"étudiant en école de commerce (HEC, ESSEC) ou prépa ECG",filiere:"prépa ECG",icon:"📊"},
  {mats:["Français","Histoire-Géo"],profil:"étudiant en hypokhâgne/khâgne ou Sciences Po",filiere:"prépa A/L ou B/L",icon:"📚"},
  {mats:["Français","Philosophie"],profil:"étudiant en khâgne (ENS Lettres)",filiere:"prépa A/L",icon:"📖"},
  {mats:["Histoire-Géo","Philosophie"],profil:"étudiant en khâgne ou Sciences Po",filiere:"prépa A/L / Sciences Po",icon:"🏛️"},
  {mats:["Anglais","Espagnol"],profil:"étudiant en LEA ou école de commerce internationale",filiere:"LEA / commerce",icon:"🌍"},
  {mats:["Anglais","Allemand"],profil:"étudiant en LEA ou LLCER bilingue",filiere:"LEA",icon:"🌍"},
  {mats:["Économie","Histoire-Géo"],profil:"étudiant en prépa B/L ou Sciences Po",filiere:"prépa B/L",icon:"🏛️"},
  {mats:["Français","Anglais"],profil:"étudiant en LEA ou lettres bilingue",filiere:"LEA / LLCER",icon:"📝"},
];

const NIVEAUX_COLLEGE = ["Primaire", "Collège"];
const NIVEAUX_POLYVALENT = ["Primaire", "Collège", "Lycée pro"];

function analyzeMatieresCompatibility(matieres, niveau) {
  // Cas special : Soutien scolaire = 1 prof polyvalent toutes matieres
  if (matieres && matieres.includes("📚 Soutien scolaire (toutes matières)")) {
    return { compatible: true, type: "soutien_scolaire", mats: matieres, niveau };
  }
  if (!matieres || matieres.length <= 1) return { compatible: true, type: "single" };

  if (NIVEAUX_POLYVALENT.includes(niveau)) {
    return { compatible: true, type: "college_polyvalent", mats: matieres, niveau };
  }

  const families = new Set();
  matieres.forEach(m => {
    Object.entries(MATIERE_FAMILIES).forEach(([fam, list]) => {
      if (list.includes(m)) families.add(fam);
    });
  });

  const sorted = [...matieres].sort();
  let bestMatch = null;
  let bestScore = 0;
  for (const combo of COMPATIBLE_COMBOS) {
    const comboSorted = [...combo.mats].sort();
    const matches = comboSorted.filter(m => sorted.includes(m)).length;
    if (matches === comboSorted.length && matches >= 2 && matches > bestScore) {
      bestMatch = combo;
      bestScore = matches;
    }
  }

  if (bestMatch) {
    return { compatible: true, type: "combo", combo: bestMatch, allMats: matieres };
  }

  if (families.size > 1) {
    return { compatible: false, type: "incompatible", families: [...families], mats: matieres };
  }

  return { compatible: true, type: "same_family", families: [...families] };
}

function getIncompatibleScript(analysis, nom, niveau) {
  const n = nom || "votre enfant";
  const matsList = analysis.mats.join(" et ");
  return `Je comprends que vous cherchiez un seul professeur pour ${matsList} — c'est naturel de vouloir simplifier.\n\nMais soyons honnêtes : un prof excellent en maths ne sera pas forcément bon en philo, et inversement. Ce sont des disciplines fondamentalement différentes qui demandent des compétences et des méthodes distinctes.\n\nCe que je vous recommande, c'est ce qu'on appelle une « prescription croisée » : un prof spécialisé par pôle. Concrètement :\n${analysis.mats.map((m,i) => `  ${i+1}. Un prof dédié en ${m} — sélectionné spécifiquement pour le niveau ${niveau} de ${n}`).join("\n")}\n\nPourquoi c'est mieux ?\n• Chaque prof est expert dans SA matière — pas « moyen partout »\n• ${n} progresse 2x plus vite avec un spécialiste qu'avec un généraliste\n• On sélectionne chaque prof en fonction du profil psychologique de ${n}\n• Le coût reste maîtrisé : 1h par matière par semaine, c'est souvent suffisant\n\nJe peux vous faire la prescription pour chaque matière séparément — comme ça vous verrez exactement quel profil on recommande pour chacune. On y va ?`;
}

function getComboScript(combo, nom, niveau) {
  const n = nom || "votre enfant";
  return `Excellente nouvelle — pour ${combo.mats.join(" et ")}, on a exactement le profil qu'il faut.\n\nJe vous recommande ${combo.profil}. Pourquoi ? Parce qu'en ${combo.filiere}, on étudie ces matières ensemble à un niveau très poussé.\n\nConcrètement, ce type de profil :\n• Maîtrise ${combo.mats.join(" ET ")} au niveau ${niveau} et au-delà\n• A traversé des concours où ces matières sont combinées — il connaît les passerelles entre elles\n• Peut aider ${n} à voir les liens entre les matières, pas juste les traiter séparément\n• Un seul interlocuteur = plus de cohérence dans la méthode de travail\n\nC'est un profil rare et très demandé — on en a en stock, mais je vous conseille de ne pas trop tarder.`;
}

// ── Rebond Script for Step 3 ────────────────────────────────────
function getRebondScript(idealTyp, chosenTyp, psycho, nom, niveau) {
  const n = nom || "votre enfant";
  const idealLabel = getLabel(idealTyp, psycho);
  const chosenLabel = getLabel(chosenTyp, psycho);
  const chosenArgs = getArgs(chosenTyp, psycho);

  let advantages = "";
  if (chosenArgs) {
    advantages = [
      chosenArgs.hook ? `• ${chosenArgs.hook}` : null,
      chosenArgs.bridge ? `• ${chosenArgs.bridge}` : null,
    ].filter(Boolean).join("\n");
  }

  return `La famille s'attendait a un profil "${idealLabel}" — c'est ce que notre algorithme recommandait en premier.\n\nMais vous proposez un profil "${chosenLabel}", et c'est tout a fait defendable. Voici comment presenter ce choix :\n\n1. RECONNAITRE L'ATTENTE\n"Je comprends — notre analyse pointait vers un profil ${idealLabel} pour ${n}. C'est effectivement un excellent choix sur le papier."\n\n2. TRANSITION VERS LE PROFIL PROPOSE\n"Cela dit, le profil ${chosenLabel} qu'on a en stock presente des avantages specifiques que je veux vous montrer :"\n\n${advantages || `• Ce profil a une approche pedagogique differente qui peut tres bien fonctionner pour ${n}\n• La disponibilite immediate est un vrai plus — commencer vite, c'est souvent plus important que le profil parfait`}\n\n3. BENEFICE CONCRET POUR L'ENFANT\n"Pour ${n} concretement, un profil ${chosenLabel} va :\n• Pouvoir demarrer rapidement — chaque semaine compte dans la progression\n• Apporter ${psycho === "Introverti / Réservé" ? "un cadre rassurant et une approche patiente" : psycho === "Décrocheur / Démotivé" ? "une dynamique nouvelle et motivante" : psycho === "Compétiteur / Haut Potentiel" ? "un niveau d'exigence adapte au potentiel" : "un accompagnement adapte au profil"} de ${n}\n• Etre supervise par notre equipe — si le match ne fonctionne pas, on ajuste immediatement"\n\n4. CLOSING\n"Le plus important, c'est de commencer. Un bon prof disponible maintenant vaut mieux qu'un prof parfait dans 3 semaines. Et avec notre suivi, on s'assure que ça fonctionne des la premiere seance. On y va ?"`;
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

  // ── State: Nombre de profs ─────────────────────────────────────
  const [nbProfs, setNbProfs] = useState("1");

  // ── State: Diagnostic académique détaillé ──────────────────────
  const [classe, setClasse] = useState("");
  const [brevetPrep, setBrevetPrep] = useState(false);
  const [spes, setSpes] = useState([]);
  const [parcoursupCategorie, setParcoursupCategorie] = useState(""); // ex: "Prépa scientifique"
  const [parcoursupCible, setParcoursupCible] = useState(""); // ex: "MPSI / MP (Maths-Physique)"
  const [parcoursupEcole, setParcoursupEcole] = useState(""); // ex: "Louis-le-Grand (Paris)"
  const [prepaFiliere, setPrepaFiliere] = useState("");
  const [univFiliere, setUnivFiliere] = useState("");

  // ── State: Guide d'argumentation (Step 2) ──────────────────────
  const [profProposeNom, setProfProposeNom] = useState(""); // ex: "Martin, étudiant en Prépa MP à Louis-le-Grand"
  const [profProposePath, setProfProposePath] = useState([]); // selection en cascade dans PROF_HIERARCHY

  // ── State: Results ─────────────────────────────────────────────
  const [portrait, setPortrait] = useState(null);
  const [chosenRebond, setChosenRebond] = useState("");
  const [rebondPath, setRebondPath] = useState([]); // ex: ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]

  const stockMap = Object.fromEntries(stock.map(s => [s.typ, s]));
  const canAnalyze = niveau && psycho && objectifVie;

  function analyze() {
    const p = computeV5(niveau, psycho, objectifVie, accomp);
    setPortrait(p);
    setStep(2);
  }

  function reset() {
    setStep(1);
    setPortrait(null);
    setChosenRebond("");
    setRebondPath([]);
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
    setNbProfs("1");
    setClasse("");
    setBrevetPrep(false);
    setSpes([]);
    setParcoursupCategorie("");
    setParcoursupCible("");
    setParcoursupEcole("");
    setPrepaFiliere("");
    setUnivFiliere("");
    setProfProposeNom("");
    setProfProposePath([]);
  }

  const matchingSavedRef = useRef(false);

  function resetAndSave() {
    if (!matchingSavedRef.current && portrait) {
      matchingSavedRef.current = true;
      const idealTyp = portrait[0].typ;
      setMatchings({ id: Date.now(), date: today(), auteur: user?.name || "Moi", idealTyp, chosenTyp: idealTyp, followed: true, niveau, psycho });
    }
    reset();
    matchingSavedRef.current = false;
  }

  const accompLabel = accomp <= 3 ? "Douceur & Empathie" : accomp >= 7 ? "Fermete & Cadre" : "Equilibre";
  const accompColor = accomp <= 3 ? "#16A34A" : accomp >= 7 ? "#DA4F00" : "#0B68B4";

  function injectPrenom(text) {
    if (!text) return "";
    return text.replace(/\[Prénom\]/g, prenom || "votre enfant").replace(/\[nom\]/g, prenom || "votre enfant");
  }

  // ── Helper: Build full script for a given prof type ────────────
  function buildFullScript(typ) {
    const nom = prenom || "l'eleve";
    const label = getLabel(typ, psycho);
    const refined = refine(typ, matieres);
    const args = getArgs(typ, psycho);
    const pp = parentProfile || "rationnel";
    const ppLabel = PARENT_PROFILES.find(p => p.id === pp)?.label || "Parent rationnel";
    const diagCtx = { niveau, classe, brevetPrep, spes, parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere };
    const introText = getIntroScript(pp, nom, psycho, diagCtx);
    const spinQuestions = getSpinQuestions(pp, nom, psycho, objectifVie, diagCtx);
    const closingText = getClosingScript(pp, nom, label, diagCtx);
    const neuroEntry = (neuroActive && neuroTrouble) ? findNeuroMatch(typ, neuroTrouble) : null;

    return [
      `═══ SCRIPT COMPLET — ${label} ═══`,
      `Eleve : ${nom} | Psycho : ${psycho} | Objectif : ${objectifVie} | Parent : ${ppLabel}`,
      `Profil : ${refined}`,
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
  }

  // ── Helper: Render the 4 argument mini-cards ──────────────────
  function renderArgCards(args) {
    if (!args) return (
      <C style={{ marginBottom: 10, background: "#FFF7F0", border: "1px solid #FED7AA", textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>🔧</div>
        <div style={{ fontSize: 14, color: "#92400E", fontWeight: 600 }}>Arguments en cours d'enrichissement pour ce profil</div>
        <div style={{ fontSize: 12, color: "#71717A", marginTop: 4 }}>Ce profil sera disponible dans la prochaine mise a jour.</div>
      </C>
    );
    const cards = [
      { icon: "🪝", label: "HOOK", desc: "Pourquoi ce profil matche", text: args.hook, color: "#16A34A", bg: "#F0FDF4", border: "#C0EAD3" },
      { icon: "🏆", label: "TRUST", desc: "Rassure le parent", text: args.trust, color: "#0B68B4", bg: "#EFF6FF", border: "#BFDBFE" },
      { icon: "🌉", label: "BRIDGE", desc: "Benefice eleve", text: args.bridge, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
      { icon: "↩️", label: "REBOUND", desc: "Contre l'objection", text: args.rebound, color: "#DA4F00", bg: "#FFF7F0", border: "#FED7AA" },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cards.map(({ icon, label, desc, text, color, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</span>
              </div>
              <CopyBtn text={injectPrenom(text)} />
            </div>
            <div style={{ fontSize: 11, color: "#71717A", marginBottom: 3 }}>{desc}</div>
            <div style={{ fontSize: 12, color: "#3F3F46", lineHeight: 1.6, fontStyle: "italic", borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
              "{injectPrenom(text)}"
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Helper: Render neuro section for a given prof type ────────
  function renderNeuroSection(typ) {
    if (!neuroActive || !neuroTrouble) return null;
    const neuroEntry = findNeuroMatch(typ, neuroTrouble);
    const neuroBadge = neuroEntry ? NEURO_BADGE[neuroEntry.badge] : null;
    const nom = prenom || "l'eleve";

    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>{NEURO_EMOJIS[neuroTrouble] || "🧩"}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", fontFamily: "'Outfit',sans-serif" }}>NEURO — {neuroTrouble}</span>
        </div>
        {neuroEntry ? (
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: neuroBadge.bg, color: neuroBadge.color,
                border: `1px solid ${neuroBadge.border}`, fontWeight: 700,
              }}>
                {neuroEntry.badge === "ideal" ? "✅" : neuroEntry.badge === "acceptable" ? "⚠️" : "❌"} {neuroBadge.label}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>📋 Realite</div>
              <div style={{ fontSize: 12, color: "#3F3F46", lineHeight: 1.6, background: "rgba(255,255,255,.6)", borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid #7C3AED" }}>
                {neuroEntry.realite}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>📞 En appel</div>
                <CopyBtn text={neuroEntry.appel} />
              </div>
              <div style={{ fontSize: 12, color: "#3F3F46", lineHeight: 1.6, fontStyle: "italic", background: "rgba(255,255,255,.6)", borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid #7C3AED" }}>
                {neuroEntry.appel}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "12px 14px", textAlign: "center", color: "#71717A", fontSize: 12 }}>
            Aucune combinaison trouvee dans la matrice neuro pour ce profil x {neuroTrouble}.
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: DIAGNOSTIC FORM
  // ═══════════════════════════════════════════════════════════════
  if (step === 1) {
    const matAnalysis = (nbProfs === "1" && matieres.length >= 2) ? analyzeMatieresCompatibility(matieres, niveau) : null;
    const nom = prenom || "l'eleve";

    // ── Recommandation hierarchique LIVE (preview) ──
    const livePath = niveau ? getRecommendedHierarchy({
      niveau, classe, brevetPrep, spes, parcoursupCategorie, parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere,
      matieres, psycho, objectif: objectifVie
    }) : null;
    let liveEmoji = "🎯", liveDesc = "", liveLabel = "";
    if (livePath) {
      let node = PROF_HIERARCHY;
      for (let i = 0; i < livePath.length; i++) {
        const k = livePath[i];
        if (node && node[k]) {
          if (i === livePath.length - 1) {
            liveEmoji = node[k].emoji || "🎯";
            liveDesc = node[k].description || "";
            liveLabel = k;
          }
          node = node[k].children || {};
        }
      }
    }

    return (
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
            <Chips options={NIVEAUX} selected={niveau} onChange={n => { setNiveau(n); setClasse(""); setBrevetPrep(false); setSpes([]); setParcoursupCible(""); setPrepaFiliere(""); }} color="#16A34A" single={true} />
          </div>

          {/* QUESTIONS CONDITIONNELLES SELON NIVEAU */}
          {niveau === "Collège" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe précise <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_COLLEGE} selected={classe} onChange={setClasse} color="#16A34A" single={true} />
              {classe === "3e" && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setBrevetPrep(!brevetPrep)} style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${brevetPrep ? "#16A34A" : "#D4D4D8"}`, background: brevetPrep ? "#16A34A" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 12 }}>{brevetPrep ? "✓" : ""}</button>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>Prépare le brevet (DNB) ?</span>
                </div>
              )}
            </div>
          )}

          {niveau === "Lycée général" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_LYCEE_GENERAL} selected={classe} onChange={c => { setClasse(c); setSpes([]); setParcoursupCible(""); }} color="#16A34A" single={true} />

              {(classe === "Première" || classe === "Terminale") && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>{classe === "Première" ? "Spécialités (3 choix)" : "Spécialités conservées (2 choix)"}</div>
                  <div style={{ fontSize: 11, color: "#71717A", marginBottom: 8 }}>Sélectionne {classe === "Première" ? "les 3 spécialités" : "les 2 spécialités gardées"}</div>
                  <Chips options={SPE_PREMIERE} selected={spes} onChange={setSpes} color="#0B68B4" />
                </div>
              )}

              {classe === "Terminale" && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>🎯 Cible Parcoursup</div>
                  <div style={{ fontSize: 11, color: "#71717A", marginBottom: 8 }}>Sélection en 3 étapes : catégorie → option → école précise</div>

                  {/* Étape 1 : Catégorie */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>1. Type d'études</div>
                  <select value={parcoursupCategorie} onChange={e => { setParcoursupCategorie(e.target.value); setParcoursupCible(""); setParcoursupEcole(""); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff", marginBottom: 10 }}>
                    <option value="">— Sélectionner —</option>
                    {Object.entries(PARCOURSUP_HIERARCHY).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k}</option>)}
                  </select>

                  {/* Étape 2 : Option précise */}
                  {parcoursupCategorie && PARCOURSUP_HIERARCHY[parcoursupCategorie] && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>2. Filière / Programme précis</div>
                      <select value={parcoursupCible} onChange={e => { setParcoursupCible(e.target.value); setParcoursupEcole(""); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff", marginBottom: 10 }}>
                        <option value="">— Sélectionner —</option>
                        {Object.entries(PARCOURSUP_HIERARCHY[parcoursupCategorie].options).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Étape 3 : École précise */}
                  {parcoursupCible && PARCOURSUP_HIERARCHY[parcoursupCategorie]?.options[parcoursupCible] && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>3. École / Établissement ciblé <span style={{ color: "#A1A1AA" }}>(optionnel)</span></div>
                      <select value={parcoursupEcole} onChange={e => setParcoursupEcole(e.target.value)} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff" }}>
                        <option value="">— Sélectionner (optionnel) —</option>
                        {PARCOURSUP_HIERARCHY[parcoursupCategorie].options[parcoursupCible].ecoles.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Récapitulatif */}
                  {parcoursupCible && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #C0EAD3", fontSize: 11, color: "#15803D" }}>
                      🎯 <strong>{parcoursupCategorie}</strong> › {parcoursupCible}{parcoursupEcole && ` › ${parcoursupEcole}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {niveau === "Lycée pro" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_LYCEE_PRO} selected={classe} onChange={setClasse} color="#16A34A" single={true} />
            </div>
          )}

          {niveau === "BTS / IUT" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_BTS} selected={classe} onChange={setClasse} color="#16A34A" single={true} />
            </div>
          )}

          {niveau === "Prépa" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Filière de prépa <span style={{ color: "#E11D48" }}>*</span></div>
              <select value={prepaFiliere} onChange={e => setPrepaFiliere(e.target.value)} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff" }}>
                <option value="">— Sélectionner —</option>
                {PREPA_FILIERES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {niveau === "Université" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Année</div>
              <Chips options={CLASSES_UNIV} selected={classe} onChange={setClasse} color="#16A34A" single={true} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginTop: 12, marginBottom: 6 }}>Filière</div>
              <input value={univFiliere} onChange={e => setUnivFiliere(e.target.value)} placeholder="Ex : Médecine, Maths-info, Droit, Lettres..." style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box", fontFamily: "'Inter',sans-serif" }} />
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 4 }}>Matiere(s)</div>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 8 }}>Affine la prescription (medecine, ingenieurs, droit...)</div>
            <Chips options={MATIERES} selected={matieres} onChange={setMatieres} color="#DA4F00" />
          </div>
        </C>

        {/* Nombre de profs */}
        {matieres.length>=2&&<C style={{ marginBottom: 12, borderLeft: `4px solid ${nbProfs==="1"?"#0B68B4":"#16A34A"}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            👥 Nombre de professeurs
            <span style={{ fontSize: 11, background: "#EFF6FF", color: "#0B68B4", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>NOUVEAU</span>
          </div>
          <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>La famille souhaite un seul prof pour toutes les matieres, ou un par matiere ?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {[["1","1️⃣","Un seul prof","Pour toutes les matieres selectionnees"],["multi","👥","Plusieurs profs","Un specialiste par matiere"]].map(([id,em,label,desc])=>{
              const on=nbProfs===id;
              return <button key={id} onClick={()=>setNbProfs(id)} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${on?"#0B68B4":"#E4E4E7"}`,background:on?"#EFF6FF":"#FAFAFA",textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
                <div style={{fontSize:18,marginBottom:4}}>{em}</div>
                <div style={{fontSize:12,fontWeight:700,color:on?"#1E40AF":"#3F3F46",fontFamily:"'Outfit',sans-serif"}}>{label}</div>
                <div style={{fontSize:11,color:"#A1A1AA",marginTop:2}}>{desc}</div>
              </button>;
            })}
          </div>
        </C>}

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
          <div style={{ fontSize: 12, color: "#71717A", marginBottom: 10 }}>Quel type de prof demande-t-il ?</div>
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

        {/* Matieres compatibility analysis (shown in step 1 if applicable) */}
        {matAnalysis && matAnalysis.type === "college_polyvalent" && (()=>{
          const matsList = matieres.join(", ");
          const polyScript = `Bonne nouvelle — au niveau ${niveau}, un seul professeur peut tout à fait accompagner ${nom} en ${matsList}.\n\nPourquoi ? Parce qu'au collège, le programme reste suffisamment généraliste pour qu'un bon étudiant universitaire ou un professeur de l'Éducation Nationale maîtrise l'ensemble des matières.\n\nCe que je vous recommande :\n• Un étudiant universitaire polyvalent (L2-M1) qui a un bon niveau général — il pourra travailler toutes les matières avec ${nom} dans la même séance\n• Ou un professeur de l'Éducation Nationale qui enseigne déjà à ce niveau et connaît parfaitement les attendus du programme\n\nL'avantage d'un seul prof pour ${nom} :\n• Un seul interlocuteur = ${nom} crée un vrai lien de confiance\n• Le prof voit les connexions entre les matières (ex : la rigueur en maths aide en français)\n• Organisation simplifiée pour vous — un seul créneau, un seul suivi\n• Le prof connaît les forces ET les faiblesses de ${nom} dans toutes les matières\n\nC'est d'ailleurs ce qu'on recommande jusqu'à la 3ème — un prof polyvalent qui suit l'élève globalement est souvent plus efficace que plusieurs spécialistes à ce niveau.`;
          return <C style={{ marginBottom: 14, background: "#F0FDF4", border: "2px solid #86EFAC", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <Pill color="#16A34A">1 PROF POLYVALENT — {niveau}</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{matsList} — Un seul prof peut tout couvrir a ce niveau</div>
              </div>
              <CopyBtn text={polyScript} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #16A34A" }}>
              {polyScript}
            </div>
          </C>;
        })()}

        {matAnalysis && matAnalysis.type === "combo" && (
          <C style={{ marginBottom: 14, background: "#F0FDF4", border: "2px solid #86EFAC", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>{matAnalysis.combo.icon}</span>
                  <Pill color="#16A34A">1 PROF POSSIBLE — Combo compatible</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{matieres.join(" + ")} → {matAnalysis.combo.filiere}</div>
              </div>
              <CopyBtn text={getComboScript(matAnalysis.combo, nom, niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #16A34A" }}>
              {getComboScript(matAnalysis.combo, nom, niveau)}
            </div>
          </C>
        )}

        {matAnalysis && matAnalysis.type === "incompatible" && (
          <C style={{ marginBottom: 14, background: "#FEF2F2", border: "2px solid #FCA5A5", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <Pill color="#E11D48">ALERTE — Matieres incompatibles pour 1 prof</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{matieres.join(" + ")} — Filieres trop differentes</div>
              </div>
              <CopyBtn text={getIncompatibleScript(matAnalysis, nom, niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #E11D48" }}>
              {getIncompatibleScript(matAnalysis, nom, niveau)}
            </div>
          </C>
        )}

        {/* SOUTIEN SCOLAIRE — toutes matieres */}
        {matAnalysis && matAnalysis.type === "soutien_scolaire" && (()=>{
          const isPrimaire = niveau === "Primaire";
          const isCollege = niveau === "Collège";
          const isLycee = niveau === "Lycée général" || niveau === "Lycée pro";
          let recommandation = "";
          let script = "";
          if (isPrimaire) {
            recommandation = "Professeur des écoles";
            script = `Pour ${nom} en primaire, la meilleure approche c'est UN seul professeur des écoles qui couvre toutes les matières.\n\nPourquoi ?\n• En primaire, le programme est conçu pour être enseigné par UN seul prof — c'est le modèle de l'Éducation Nationale\n• ${nom} a besoin de stabilité et d'un seul interlocuteur pour construire un lien de confiance\n• Le prof voit l'enfant globalement : ses forces, ses fragilités, son rythme\n• Lecture, écriture, calcul, éveil — tout est lié à cet âge, un seul prof comprend les transferts d'apprentissage\n\nNotre recommandation : un professeur des écoles expérimenté qui adapte ses séances au niveau exact de ${nom}. Il peut aussi être un excellent étudiant en sciences de l'éducation ou en master MEEF.`;
          } else if (isCollege) {
            recommandation = "Étudiant universitaire polyvalent";
            script = `Pour ${nom} au collège, on peut tout à fait trouver UN seul prof qui couvre toutes les matières — c'est même souvent la meilleure approche jusqu'à la 3ème.\n\nPourquoi ?\n• Le programme du collège reste suffisamment généraliste pour qu'un bon étudiant universitaire (L2-M2) maîtrise l'ensemble\n• ${nom} crée un vrai lien de confiance avec un interlocuteur unique\n• Les matières se renforcent mutuellement (rigueur en maths aide en français, méthode en histoire aide en SVT...)\n• Organisation simplifiée pour vous : un seul créneau, un seul suivi\n• Le prof connaît les forces ET les faiblesses de ${nom} dans toutes les matières\n\nNotre recommandation : un étudiant universitaire avec un bon niveau général (L3-M2 idéalement) ou un professeur de l'EN qui enseigne déjà à ce niveau.`;
          } else if (isLycee) {
            recommandation = "Coach scolaire / méthodologie";
            script = `Pour ${nom} au lycée, je vais être transparent : trouver UN seul prof excellent dans TOUTES les matières est très compliqué à ce niveau. Le lycée exige des spécialistes par domaine.\n\nMais voici ce qu'on peut faire pour répondre à votre besoin :\n\n1. Un coach scolaire / méthodologie — il ne va pas enseigner les matières, il va apprendre à ${nom} à mieux travailler dans TOUTES les matières (organisation, méthode, gestion du stress, planification)\n\n2. Si besoin, on complète avec 1 ou 2 spécialistes sur les matières où ${nom} a le plus de difficultés (souvent maths + français suffisent)\n\nL'avantage : ${nom} gagne en autonomie et en méthode pour TOUTES ses matières, pas juste celles où on a un prof. C'est un investissement qui rayonne sur toute la scolarité.\n\nVoulez-vous qu'on commence par le coaching méthodologique ?`;
          } else {
            recommandation = "Coach scolaire / méthodologie";
            script = `Pour un soutien scolaire global, on recommande un coach méthodologie qui travaille la méthode de travail (transversale à toutes les matières) plutôt qu'un prof spécialiste.`;
          }
          return <C style={{ marginBottom: 14, background: "#EFF6FF", border: "2px solid #BFDBFE", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>📚</span>
                  <Pill color="#0B68B4">SOUTIEN SCOLAIRE — Toutes matières</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{niveau || "Tous niveaux"} → {recommandation}</div>
              </div>
              <CopyBtn text={script} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #0B68B4" }}>
              {script}
            </div>
          </C>;
        })()}

        {matAnalysis && matAnalysis.type === "same_family" && (
          <C style={{ marginBottom: 14, background: "#FFFBEB", border: "1px solid #FDE68A", padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", fontFamily: "'Outfit',sans-serif" }}>Matieres de la meme famille — 1 prof possible</div>
                <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>{matieres.join(" + ")} sont dans le meme domaine. Un bon profil peut couvrir les deux.</div>
              </div>
            </div>
          </C>
        )}

        {/* RECOMMANDATION LIVE — toujours visible si niveau renseigné */}
        {livePath && (
          <C style={{ marginBottom: 14, background: "linear-gradient(135deg,#16A34A,#62E58E)", border: "none", padding: "16px 18px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Pill color="#fff" bg="rgba(255,255,255,.25)">🎯 RECOMMANDATION EN DIRECT</Pill>
              <span style={{ fontSize: 10, opacity: .8 }}>Mise à jour à chaque champ</span>
            </div>
            <div style={{ fontSize: 11, opacity: .85, marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>
              {livePath.join(" › ")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 32 }}>{liveEmoji}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>{liveLabel}</div>
                {liveDesc && <div style={{ fontSize: 11, opacity: .9, marginTop: 3 }}>{liveDesc}</div>}
              </div>
            </div>
          </C>
        )}

        {!canAnalyze && <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 10, textAlign: "center" }}>Remplis niveau, profil psychologique et objectif de vie pour continuer</div>}
        <Btn onClick={analyze} disabled={!canAnalyze} full color="#16A34A" style={{ padding: "13px", borderRadius: 99, fontSize: 15 }}>
          🔦 Allumer la Lanterne V5 →
        </Btn>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: RESULTAT — TOP 3 PROFILS
  // ═══════════════════════════════════════════════════════════════
  if (step === 2 && portrait) {
    const nom = prenom || "l'eleve";
    const top3 = portrait.slice(0, 3);
    const maxScore = top3[0]?.score || 1;
    const pp = parentProfile || "rationnel";
    const ppLabel = PARENT_PROFILES.find(p => p.id === pp)?.label || "Parent rationnel";

    // ── Analyse compatibilite matieres (visible aussi en Step 2) ──
    const matAnalysisStep2 = (nbProfs === "1" && matieres.length >= 2) ? analyzeMatieresCompatibility(matieres, niveau) : null;

    // ── Recommandation hiérarchique précise ──
    const recommendedPath = getRecommendedHierarchy({
      niveau, classe, brevetPrep, spes, parcoursupCategorie, parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere,
      matieres, psycho, objectif: objectifVie
    });
    // Récupère l'emoji + description du nœud final
    let recoNode = PROF_HIERARCHY;
    let recoFinalEmoji = "🎯";
    let recoFinalDesc = "";
    let recoFinalLabel = "";
    for (let i = 0; i < recommendedPath.length; i++) {
      const k = recommendedPath[i];
      if (recoNode && recoNode[k]) {
        if (i === recommendedPath.length - 1) {
          recoFinalEmoji = recoNode[k].emoji || "🎯";
          recoFinalDesc = recoNode[k].description || "";
          recoFinalLabel = k;
        }
        recoNode = recoNode[k].children || {};
      }
    }
    const rankLabels = ["1er", "2e", "3e"];
    const rankColors = ["#16A34A", "#0B68B4", "#D97706"];
    const rankBgs = ["#F0FDF4", "#EFF6FF", "#FFFBEB"];
    const rankBorders = ["#86EFAC", "#BFDBFE", "#FDE68A"];

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 900, color: "#18181B", margin: "0 0 2px", fontFamily: "'Outfit',sans-serif" }}>🔦 Resultat Lanterne V5</h1>
            <p style={{ color: "#71717A", fontSize: 13, margin: 0 }}>
              Top 3 Profils · {nom} · {psycho} · {objectifVie}
              {neuroActive && neuroTrouble && <span style={{ color: "#7C3AED", fontWeight: 600 }}> · 🧩 {neuroTrouble}</span>}
              {parentProfile && <span style={{ color: "#D97706", fontWeight: 600 }}> · 🎭 {ppLabel}</span>}
            </p>
          </div>
        </div>

        {/* ── ALERTES MATIERES INCOMPATIBLES (Step 2) ── */}
        {matAnalysisStep2 && matAnalysisStep2.type === "incompatible" && (
          <C style={{ marginBottom: 14, background: "#FEF2F2", border: "2px solid #FCA5A5", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <Pill color="#E11D48">ALERTE — Matières incompatibles pour 1 prof</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{matieres.join(" + ")} — Filières trop différentes</div>
              </div>
              <CopyBtn text={getIncompatibleScript(matAnalysisStep2, nom, niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #E11D48" }}>
              {getIncompatibleScript(matAnalysisStep2, nom, niveau)}
            </div>
          </C>
        )}

        {matAnalysisStep2 && matAnalysisStep2.type === "combo" && (
          <C style={{ marginBottom: 14, background: "#F0FDF4", border: "2px solid #86EFAC", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>{matAnalysisStep2.combo.icon}</span>
                  <Pill color="#16A34A">1 PROF POSSIBLE — Combo compatible</Pill>
                </div>
                <div style={{ fontSize: 11, color: "#71717A" }}>{matieres.join(" + ")} → {matAnalysisStep2.combo.filiere}</div>
              </div>
              <CopyBtn text={getComboScript(matAnalysisStep2.combo, nom, niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #16A34A" }}>
              {getComboScript(matAnalysisStep2.combo, nom, niveau)}
            </div>
          </C>
        )}

        {/* RECOMMANDATION HIERARCHIQUE PRECISE */}
        <C style={{ marginBottom: 16, background: "linear-gradient(135deg,#16A34A,#62E58E)", border: "none", padding: "20px 22px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Pill color="#fff" bg="rgba(255,255,255,.25)">🎯 PROFIL IDEAL — RECOMMANDATION PRECISE</Pill>
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>
            {recommendedPath.join(" › ")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 36 }}>{recoFinalEmoji}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>{recoFinalLabel}</div>
              {recoFinalDesc && <div style={{ fontSize: 12, opacity: .9, marginTop: 4 }}>{recoFinalDesc}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,.15)", borderRadius: 10, fontSize: 12, lineHeight: 1.6 }}>
            💡 Basé sur : {niveau}{classe ? ` ${classe}` : ""}{brevetPrep ? " (brevet)" : ""}{spes.length > 0 ? ` · spés ${spes.join("/")}` : ""}{parcoursupCible ? ` · cible ${parcoursupCible}` : ""}{prepaFiliere ? ` · ${prepaFiliere}` : ""}
          </div>
        </C>

        {/* ── GUIDE D'ARGUMENTATION ── */}
        {(()=>{
          const diagCtx = { niveau, classe, brevetPrep, spes, parcoursupCategorie, parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere };
          const profProfilLabel = profProposePath.length > 0 ? profProposePath[profProposePath.length - 1] : "";
          const guide = getArgumentationGuide(parentProfile || "rationnel", nom, profProposeNom, diagCtx, profProfilLabel);
          return <C style={{ marginBottom: 16, background: "#FFFBEB", border: "2px solid #FCD34D", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>🎤</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#92400E", fontFamily: "'Outfit',sans-serif" }}>Guide d'argumentation</div>
                <div style={{ fontSize: 11, color: "#A16207" }}>Adapté au profil parent : {ppLabel}</div>
              </div>
            </div>

            {/* SELECTEUR HIERARCHIQUE PROF PROPOSE */}
            <div style={{ marginBottom: 14, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #FDE68A" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>👨‍🏫 Profil du professeur proposé</div>

              {/* Breadcrumb */}
              {profProposePath.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "6px 10px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A", flexWrap: "wrap" }}>
                  <button onClick={() => setProfProposePath([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#D97706", fontWeight: 700 }}>↺ Reset</button>
                  {profProposePath.map((p, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#A1A1AA", fontSize: 11 }}>›</span>
                      <button onClick={() => setProfProposePath(profProposePath.slice(0, i + 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#92400E", fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>{p}</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Cascade */}
              {(()=>{
                let currentLevel = PROF_HIERARCHY;
                for (const key of profProposePath) {
                  if (currentLevel[key]?.children) currentLevel = currentLevel[key].children;
                  else return null;
                }
                const entries = Object.entries(currentLevel || {});
                if (entries.length === 0) return null;
                return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {entries.map(([key, val]) => {
                    const hasChildren = val.children && Object.keys(val.children).length > 0;
                    return (
                      <button key={key} onClick={() => setProfProposePath([...profProposePath, key])} style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #FDE68A", background: "#FFFBEB", textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{val.emoji || "📌"}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", fontFamily: "'Outfit',sans-serif", flex: 1 }}>{key}</span>
                          {hasChildren && <span style={{ fontSize: 12, color: "#A1A1AA" }}>›</span>}
                        </div>
                        {val.description && <div style={{ fontSize: 10, color: "#A1A1AA", marginTop: 3, marginLeft: 20 }}>{val.description}</div>}
                      </button>
                    );
                  })}
                </div>;
              })()}

              {/* Selection finale */}
              {profProposePath.length >= 2 && (()=>{
                const last = profProposePath[profProposePath.length - 1];
                let node = PROF_HIERARCHY;
                for (let i = 0; i < profProposePath.length - 1; i++) node = node[profProposePath[i]]?.children || {};
                const finalNode = node[last];
                return <div style={{ marginTop: 10, padding: "10px 12px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #C0EAD3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{finalNode?.emoji || "✓"}</span>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#15803D", fontFamily: "'Outfit',sans-serif" }}>{last}</div>
                  </div>
                  {finalNode?.description && <div style={{ fontSize: 11, color: "#71717A", marginTop: 3, marginLeft: 22 }}>{finalNode.description}</div>}
                </div>;
              })()}
            </div>


            {/* Questions à poser */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", fontFamily: "'Outfit',sans-serif" }}>❓ Questions à poser à la famille</div>
                <CopyBtn text={guide.questions.join("\n\n")} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {guide.questions.map((q, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#3F3F46", padding: "9px 12px", background: "rgba(255,255,255,.7)", borderRadius: 8, borderLeft: "3px solid #D97706", fontStyle: "italic" }}>
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Arguments */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", fontFamily: "'Outfit',sans-serif" }}>💪 Arguments à utiliser</div>
                <CopyBtn text={guide.arguments.join("\n\n")} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {guide.arguments.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#3F3F46", padding: "9px 12px", background: "rgba(255,255,255,.7)", borderRadius: 8, borderLeft: "3px solid #16A34A", fontStyle: "italic" }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Objections */}
            {guide.objections.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", fontFamily: "'Outfit',sans-serif" }}>🛡️ Gestion des objections</div>
                  <CopyBtn text={guide.objections.join("\n\n")} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {guide.objections.map((o, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#3F3F46", padding: "9px 12px", background: "rgba(255,255,255,.7)", borderRadius: 8, borderLeft: "3px solid #0B68B4" }}>
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOMO */}
            <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#E11D48,#F97316)", borderRadius: 12, color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>FOMO — Créer l'urgence</div>
                </div>
                <CopyBtn text={guide.fomo} />
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, fontStyle: "italic", padding: "10px 14px", background: "rgba(255,255,255,.18)", borderRadius: 10 }}>
                {guide.fomo}
              </div>
              <div style={{ fontSize: 10, opacity: .85, marginTop: 8 }}>💡 À utiliser quand le parent hésite — crée la peur de manquer l'opportunité</div>
            </div>
          </C>;
        })()}

        {/* TOP 3 CARDS */}
        {top3.map(({ typ, score }, idx) => {
          const label = getLabel(typ, psycho);
          const refined = refine(typ, matieres);
          const args = getArgs(typ, psycho);
          const dispo = stockMap[typ]?.dispo;
          const nb = stockMap[typ]?.nb || 0;
          const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
          const color = rankColors[idx];
          const bg = rankBgs[idx];
          const border = rankBorders[idx];
          const fullScript = buildFullScript(typ);

          // Neuro
          const neuroEntry = (neuroActive && neuroTrouble) ? findNeuroMatch(typ, neuroTrouble) : null;
          const neuroBadge = neuroEntry ? NEURO_BADGE[neuroEntry.badge] : null;
          const neuroWarn = (neuroActive && neuroTrouble) ? getNeuroNiveauWarning(niveau, neuroTrouble, nom, classe) : null;

          return (
            <C key={typ} style={{ marginBottom: 14, border: `2px solid ${border}`, background: idx === 0 ? bg : "#fff", padding: "18px 20px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: color, display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 900,
                    fontFamily: "'Outfit',sans-serif", flexShrink: 0,
                  }}>
                    {rankLabels[idx]}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", lineHeight: 1.3 }}>{label}</div>
                    <div style={{ fontSize: 12, color, fontWeight: 600 }}>↳ {refined}</div>
                  </div>
                </div>
                <CopyBtn text={fullScript} />
              </div>

              {/* Score bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 6, background: "#E4E4E7", borderRadius: 99 }}>
                  <div style={{ height: 6, background: color, borderRadius: 99, width: `${pct}%`, transition: "width .3s" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'Outfit',sans-serif", minWidth: 36, textAlign: "right" }}>{pct}%</span>
              </div>

              {/* Stock status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: dispo ? "#16A34A" : "#E11D48" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: dispo ? "#15803D" : "#B91C1C" }}>
                  {dispo ? `✓ Disponible en stock (${nb})` : `✗ Stock indisponible (${nb})`}
                </span>
              </div>

              {/* 4 Argument mini-cards */}
              {renderArgCards(args)}

              {/* Neuro section */}
              {renderNeuroSection(typ)}

              {/* Neuro niveau warning */}
              {neuroWarn && (
                <div style={{ marginTop: 10 }}>
                  <C style={{ background: "#FFFBEB", border: "2px solid #FDE68A", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>⚠️</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", fontFamily: "'Outfit',sans-serif" }}>{neuroWarn.title}</span>
                      </div>
                      <CopyBtn text={neuroWarn.script} />
                    </div>
                    <div style={{ fontSize: 12, color: "#3F3F46", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid #D97706", maxHeight: 200, overflow: "auto" }}>
                      {neuroWarn.script}
                    </div>
                  </C>
                </div>
              )}
            </C>
          );
        })}

        {/* Bottom buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          <Btn onClick={() => { setChosenRebond(""); setRebondPath([]); setStep(3); }} full color="#DA4F00" style={{ padding: "14px", borderRadius: 99, fontSize: 15 }}>
            Je n'ai pas ces profils en stock →
          </Btn>
          <Btn onClick={resetAndSave} full outline color="#71717A" style={{ padding: "11px", borderRadius: 99, fontSize: 13 }}>
            ← Nouveau diagnostic
          </Btn>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: REBOND — CHOIX MANUEL
  // ═══════════════════════════════════════════════════════════════
  if (step === 3 && portrait) {
    const nom = prenom || "l'eleve";
    const idealTyp = portrait[0].typ;
    const idealLabel = getLabel(idealTyp, psycho);

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 21, fontWeight: 900, color: "#18181B", margin: "0 0 2px", fontFamily: "'Outfit',sans-serif" }}>🔄 Plan B — Quel prof avez-vous trouve ?</h1>
          <p style={{ color: "#71717A", fontSize: 13, margin: 0 }}>
            Selection manuelle d'un profil alternatif · Ideal etait : {idealLabel}
          </p>
        </div>

        {/* Prof type selector — CASCADE HIERARCHY */}
        <C style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>
            Affinez le profil du prof que vous avez trouvé :
          </div>

          {/* Breadcrumb path */}
          {rebondPath.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "8px 12px", background: "#FFF7F0", borderRadius: 8, border: "1px solid #FED7AA", flexWrap: "wrap" }}>
            <button onClick={() => { setRebondPath([]); setChosenRebond(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#DA4F00", fontWeight: 700 }}>↺ Reset</button>
            {rebondPath.map((p, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#A1A1AA", fontSize: 11 }}>›</span>
                <button onClick={() => { setRebondPath(rebondPath.slice(0, i + 1)); setChosenRebond(rebondPath[0]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#92400E", fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>{p}</button>
              </span>
            ))}
          </div>}

          {/* Cascade selector */}
          {(()=>{
            // Determine current level
            let currentLevel = PROF_HIERARCHY;
            for (const key of rebondPath) {
              if (currentLevel[key]?.children) {
                currentLevel = currentLevel[key].children;
              } else {
                return null; // Leaf reached
              }
            }
            const entries = Object.entries(currentLevel || {});
            if (entries.length === 0) return null;

            return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {entries.map(([key, val]) => {
                const isLevel0 = rebondPath.length === 0;
                const stock = isLevel0 ? stockMap[key] : null;
                const hasChildren = val.children && Object.keys(val.children).length > 0;
                return (
                  <button key={key} onClick={() => {
                    const newPath = [...rebondPath, key];
                    setRebondPath(newPath);
                    if (isLevel0) setChosenRebond(key);
                  }}
                    style={{
                      padding: "12px 14px", borderRadius: 12,
                      border: "2px solid #E4E4E7",
                      background: "#FAFAFA",
                      textAlign: "left", cursor: "pointer", transition: "all .15s",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{val.emoji || "📌"}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#3F3F46", fontFamily: "'Outfit',sans-serif", flex: 1 }}>{key}</span>
                      {hasChildren && <span style={{ fontSize: 14, color: "#A1A1AA" }}>›</span>}
                      {stock && <span style={{ fontSize: 10, color: stock.dispo ? "#15803D" : "#B91C1C", fontWeight: 600 }}>{stock.dispo ? "✓" : "✗"} {stock.nb}</span>}
                    </div>
                    {val.description && <div style={{ fontSize: 11, color: "#71717A", marginLeft: 26 }}>{val.description}</div>}
                  </button>
                );
              })}
            </div>;
          })()}

          {/* Final selection summary */}
          {rebondPath.length >= 2 && (()=>{
            const last = rebondPath[rebondPath.length - 1];
            // Walk path to get last node info
            let node = PROF_HIERARCHY;
            for (let i = 0; i < rebondPath.length - 1; i++) {
              node = node[rebondPath[i]]?.children || {};
            }
            const finalNode = node[last];
            return <div style={{ marginTop: 12, padding: "12px 16px", background: "#F0FDF4", border: "2px solid #C0EAD3", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{finalNode?.emoji || "✓"}</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#15803D", fontFamily: "'Outfit',sans-serif" }}>Profil sélectionné : {last}</div>
              </div>
              {finalNode?.description && <div style={{ fontSize: 11, color: "#71717A", marginLeft: 26 }}>{finalNode.description}</div>}
              <div style={{ fontSize: 10, color: "#A1A1AA", marginTop: 6, marginLeft: 26 }}>Catégorie : {chosenRebond}</div>
            </div>;
          })()}
        </C>

        {/* Chosen rebond details */}
        {chosenRebond && (() => {
          const label = getLabel(chosenRebond, psycho);
          const refined = refine(chosenRebond, matieres);
          const args = getArgs(chosenRebond, psycho);
          const rebondScript = getRebondScript(idealTyp, chosenRebond, psycho, nom, niveau);
          const fullScript = buildFullScript(chosenRebond);

          return (
            <div>
              {/* Prof info */}
              <C style={{ marginBottom: 14, background: "#FFF7F0", border: "2px solid #FED7AA", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "#DA4F00", fontWeight: 600 }}>↳ {refined}</div>
                  </div>
                  <CopyBtn text={fullScript} />
                </div>

                {/* 4 Arguments */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#DA4F00", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>4 Arguments de vente</div>
                  {renderArgCards(args)}
                </div>

                {/* Neuro */}
                {renderNeuroSection(chosenRebond)}
              </C>

              {/* Rebond script */}
              <C style={{ marginBottom: 14, background: "#EFF6FF", border: "2px solid #BFDBFE", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 16 }}>🔄</span>
                      <Pill color="#0B68B4">SCRIPT DE REBOND</Pill>
                    </div>
                    <div style={{ fontSize: 11, color: "#71717A" }}>
                      Comment presenter {chosenRebond} alors que l'algorithme recommandait {idealTyp}
                    </div>
                  </div>
                  <CopyBtn text={rebondScript} />
                </div>
                <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #0B68B4" }}>
                  {rebondScript}
                </div>
              </C>
            </div>
          );
        })()}

        {/* Bottom buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <Btn onClick={() => setStep(2)} flex={1} outline color="#71717A" style={{ padding: "11px", borderRadius: 99, fontSize: 13 }}>
            ← Retour aux resultats
          </Btn>
          <Btn onClick={resetAndSave} flex={1} outline color="#71717A" style={{ padding: "11px", borderRadius: 99, fontSize: 13 }}>
            ← Nouveau diagnostic
          </Btn>
        </div>
      </div>
    );
  }

  return null;
}

export default SalesLanterne;
