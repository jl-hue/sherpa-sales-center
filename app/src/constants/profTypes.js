export const PROF_TYPES=["Étudiant grande école","Étudiant université","Professeur EN","AESH","Professeur certifié","Formateur"];

export const PSYCH_PROFILES=["Introverti / Réservé","Décrocheur / Démotivé","Compétiteur / Haut Potentiel","Stressé / Anxieux"];
export const VIE_OBJECTIFS=["Remise à niveau","Réussite concours","Méthodologie pure","Excellence académique"];
export const NIVEAUX=["Primaire","Collège","Lycée général","Lycée pro","BTS / IUT","Prépa","Université"];

// ─── Détails académiques par niveau ────────────────────────────
export const CLASSES_PRIMAIRE=["CP","CE1","CE2","CM1","CM2"];
export const CLASSES_COLLEGE=["6e","5e","4e","3e"];
export const CLASSES_LYCEE_GENERAL=["Seconde","Première","Terminale"];
export const CLASSES_LYCEE_PRO=["Seconde pro","Première pro","Terminale pro"];
export const CLASSES_BTS=["BTS 1","BTS 2","BUT 1","BUT 2","BUT 3"];
export const CLASSES_UNIV=["L1","L2","L3","M1","M2","Doctorat"];

export const PREPA_FILIERES=[
  "MPSI (Maths-Physique-Info)",
  "PCSI (Physique-Chimie-Info)",
  "PTSI (Physique-Techno-Info)",
  "BCPST (Bio-Chimie-Physique)",
  "MP (2e année MPSI)",
  "PC (2e année PCSI)",
  "PSI (2e année PCSI/PTSI)",
  "PT (2e année PTSI)",
  "ECG (Éco-Gestion)",
  "ECT (Technologique)",
  "Khâgne A/L (Lettres)",
  "Khâgne B/L (Lettres-Sciences sociales)",
];

export const SPE_PREMIERE=[
  "Maths","Physique-Chimie","SVT","SES","HGGSP",
  "HLP (Humanités-Lettres-Philo)","LLCE Anglais","LLCE Espagnol",
  "NSI (Numérique-Sciences info)","SI (Sciences de l'ingénieur)",
  "Arts","Bio-écologie","EPPCS","Maths complémentaires","Maths expertes",
];

export const PARCOURSUP_OPTIONS=[
  "Prépa MPSI / MP (Maths-Physique)",
  "Prépa PCSI / PC (Physique-Chimie)",
  "Prépa PTSI / PT (Physique-Techno)",
  "Prépa BCPST (Bio-Chimie)",
  "Prépa ECG (Éco-Commerce)",
  "Prépa Khâgne A/L (Lettres)",
  "Prépa Khâgne B/L (Lettres-Sciences sociales)",
  "École d'ingé post-bac (INSA, UTC, UTBM, Polytech)",
  "École de commerce post-bac (IÉSEG, ESCE, EBS)",
  "Sciences Po Paris",
  "IEP Région (Lyon, Bordeaux, etc.)",
  "Médecine — PASS / LAS",
  "Université — Licence Sciences",
  "Université — Licence Lettres / SHS",
  "Université — Licence Droit / Éco",
  "BTS / BUT",
  "Pas encore décidé",
];
export const MATIERES=["Maths","Français","Anglais","Physique","Chimie","SVT","Histoire-Géo","Philosophie","Espagnol","Allemand","Économie","Informatique","Autre"];

export const RULES={
  niveau:{"Primaire":{"Professeur EN":35,"Étudiant université":20},"Collège":{"Professeur EN":25,"Étudiant université":20,"Étudiant grande école":10},"Lycée général":{"Étudiant grande école":30,"Professeur certifié":20},"Lycée pro":{"Professeur EN":25,"Formateur":20},"BTS / IUT":{"Étudiant université":30,"Professeur certifié":20},"Prépa":{"Étudiant grande école":45},"Université":{"Étudiant grande école":35,"Étudiant université":25}},
  psycho:{"Introverti / Réservé":{"Étudiant université":35,"Étudiant grande école":15},"Décrocheur / Démotivé":{"Étudiant université":45,"Étudiant grande école":10},"Compétiteur / Haut Potentiel":{"Étudiant grande école":55,"Professeur certifié":20},"Stressé / Anxieux":{"Étudiant université":30,"Étudiant grande école":20,"AESH":10}},
  objectif_vie:{"Remise à niveau":{"Professeur EN":45,"Étudiant université":25},"Réussite concours":{"Étudiant grande école":55,"Professeur certifié":25},"Méthodologie pure":{"Formateur":45,"Étudiant grande école":20},"Excellence académique":{"Étudiant grande école":50,"Professeur certifié":25}},
  accomp_douceur:{"Étudiant université":30,"AESH":25,"Étudiant grande école":10},
  accomp_fermete:{"Professeur EN":35,"Professeur certifié":25,"Formateur":20},
};

export const PROF_LABELS={
  "Étudiant grande école":{
    "Introverti / Réservé":"Mentor discret & bienveillant","Décrocheur / Démotivé":"Passeur de flamme","Compétiteur / Haut Potentiel":"Mentor d'excellence","Stressé / Anxieux":"Coach de confiance",default:"Expert académique"
  },
  "Étudiant université":{
    "Introverti / Réservé":"Complice pédagogique","Décrocheur / Démotivé":"Remonteur de motivation","Compétiteur / Haut Potentiel":"Partenaire de progression","Stressé / Anxieux":"Soutien bienveillant",default:"Accompagnateur de proximité"
  },
  "Professeur EN":{
    "Introverti / Réservé":"Cadre sécurisant","Décrocheur / Démotivé":"Pilier de structure","Compétiteur / Haut Potentiel":"Exigeant & formateur","Stressé / Anxieux":"Ancre de stabilité",default:"Référent pédagogique"
  },
  "AESH":{"default":"Spécialiste DYS & TDAH"},
  "Professeur certifié":{"Compétiteur / Haut Potentiel":"Expert haute exigence","Stressé / Anxieux":"Cadre rassurant certifié",default:"Référence académique"},
  "Formateur":{"default":"Expert méthodes & organisation"},
};

// ─── Hiérarchie de typologies (sélection en cascade) ───────────
// Permet au Sales d'affiner le profil en sous-catégories précises
export const PROF_HIERARCHY = {
  "Étudiant grande école": {
    emoji: "🎓",
    description: "Étudiant en cursus sélectif (concours, prépa)",
    children: {
      "École d'ingénieurs": {
        emoji: "🔧",
        description: "Issu de prépa scientifique",
        children: {
          "Prépa MP (Maths-Physique)": { emoji: "📐", description: "X, Centrale, Mines, CentraleSupélec, ENS Ulm/Saclay" },
          "Prépa PC (Physique-Chimie)": { emoji: "⚗️", description: "Centrale, Mines, CPE Lyon, Chimie ParisTech" },
          "Prépa PSI (Physique-SI)": { emoji: "⚙️", description: "Arts et Métiers, Centrale, INSA" },
          "Prépa PT (Physique-Techno)": { emoji: "🏭", description: "Arts et Métiers, ENSAM, INSA" },
          "Prépa BCPST (Bio-Chimie)": { emoji: "🧬", description: "AgroParisTech, ENSAT, ENS Lyon, Véto" },
          "INSA / UTC / Polytech": { emoji: "🏛️", description: "Écoles post-bac d'ingénieurs" },
        }
      },
      "École de commerce": {
        emoji: "💼",
        description: "Issu de prépa économique",
        children: {
          "Prépa ECG (Éco-Gestion)": { emoji: "📊", description: "HEC, ESSEC, ESCP, EDHEC, EM Lyon" },
          "Prépa ECT (Techno)": { emoji: "📈", description: "Issus de bac STMG, vise les BSB" },
          "École post-bac (commerce)": { emoji: "🏢", description: "ESCE, IÉSEG, EBS, ESC Pau" },
        }
      },
      "École normale supérieure (ENS)": {
        emoji: "📚",
        description: "Issu de prépa littéraire ou scientifique",
        children: {
          "Khâgne A/L (Lettres)": { emoji: "📖", description: "ENS Ulm, Lyon, Paris-Saclay — Lettres" },
          "Khâgne B/L (Lettres-Sciences)": { emoji: "🏛️", description: "ENS Ulm, Lyon — Sciences sociales" },
          "ENS Sciences (MP, PC)": { emoji: "🧪", description: "ENS Ulm, Lyon, Saclay, Paris-Saclay" },
        }
      },
      "Sciences Po": {
        emoji: "🌍",
        description: "Issu de prépa B/L ou bac+0",
        children: {
          "Sciences Po Paris": { emoji: "🇫🇷", description: "IEP de Paris (rue Saint-Guillaume)" },
          "IEP Région": { emoji: "📍", description: "Lyon, Bordeaux, Lille, Aix, Strasbourg, Toulouse, Rennes" },
        }
      },
    }
  },
  "Étudiant université": {
    emoji: "🎒",
    description: "Étudiant en faculté (Licence, Master, Doctorat)",
    children: {
      "Médecine / Pharmacie": {
        emoji: "⚕️",
        description: "PASS, LAS, Médecine, Pharma",
        children: {
          "PASS / LAS (1re année)": { emoji: "🩺", description: "Première année santé — vise médecine, dentaire, pharma, kiné, sage-femme" },
          "Médecine (DFGSM)": { emoji: "👨‍⚕️", description: "2e-3e année médecine — bonne maîtrise SVT, chimie" },
          "Pharmacie": { emoji: "💊", description: "Étudiant en pharmacie — chimie, biologie, biochimie" },
        }
      },
      "Sciences (maths, physique, info)": {
        emoji: "🔬",
        description: "Faculté de sciences",
        children: {
          "Maths / MIAGE": { emoji: "📐", description: "Licence/Master Maths, MIAGE, mathématiques appliquées" },
          "Physique / Chimie": { emoji: "⚛️", description: "Licence/Master Physique, Chimie, physique-chimie" },
          "Informatique / BUT info": { emoji: "💻", description: "Licence info, BUT informatique, MIAGE" },
          "SVT / Biologie": { emoji: "🌱", description: "Licence Biologie, SVT, biochimie, biotechnologies" },
        }
      },
      "Lettres & Sciences humaines": {
        emoji: "📜",
        description: "Faculté de lettres et SHS",
        children: {
          "Lettres modernes / classiques": { emoji: "✍️", description: "LLCER, lettres modernes, lettres classiques" },
          "Histoire / Géographie": { emoji: "🗺️", description: "Licence Histoire-Géo, prépa concours CAPES" },
          "Philosophie": { emoji: "💭", description: "Licence/Master Philo" },
          "LEA / LLCER (langues)": { emoji: "🌐", description: "Anglais, espagnol, allemand, italien, chinois" },
        }
      },
      "Économie / Gestion / Droit": {
        emoji: "⚖️",
        description: "Faculté de droit ou éco-gestion",
        children: {
          "Économie / AES": { emoji: "💰", description: "Licence/Master Éco-Gestion, AES" },
          "Droit": { emoji: "📋", description: "Licence/Master Droit" },
        }
      },
    }
  },
  "Professeur EN": {
    emoji: "🏫",
    description: "Professeur de l'Éducation Nationale",
    children: {
      "Professeur des écoles (1er degré)": { emoji: "👩‍🏫", description: "Primaire — toutes matières, maternelle à CM2" },
      "Professeur certifié (CAPES)": { emoji: "🎯", description: "Collège/lycée — spécialiste d'une matière" },
      "Professeur agrégé": { emoji: "🏆", description: "Lycée/prépa — niveau d'expertise maximum" },
      "PRAG / PRCE en faculté": { emoji: "🎓", description: "Enseignant universitaire issu du secondaire" },
    }
  },
  "AESH": {
    emoji: "🤝",
    description: "Accompagnant spécialisé inclusion scolaire",
    children: {
      "AESH polyvalent": { emoji: "🌟", description: "Accompagnement général tous handicaps/troubles" },
      "AESH spécialisé DYS": { emoji: "📖", description: "Dyslexie, dyspraxie, dysorthographie" },
      "AESH spécialisé TDAH": { emoji: "⚡", description: "Troubles attentionnels et hyperactivité" },
      "AESH spécialisé TSA": { emoji: "🧩", description: "Troubles du spectre autistique" },
    }
  },
  "Professeur certifié": {
    emoji: "📝",
    description: "Enseignant titulaire d'un concours national",
    children: {
      "CAPES (collège/lycée)": { emoji: "✏️", description: "Certifié dans une matière précise" },
      "CAPLP (lycée pro)": { emoji: "🔧", description: "Lycée professionnel — matières pro et générales" },
      "Agrégation": { emoji: "🥇", description: "Le plus haut niveau d'exigence académique" },
    }
  },
  "Formateur": {
    emoji: "💡",
    description: "Spécialiste méthodes et organisation",
    children: {
      "Coach scolaire / méthodologie": { emoji: "🎯", description: "Méthodes de travail, gestion du temps, mémorisation" },
      "Coach orientation": { emoji: "🧭", description: "Parcoursup, orientation post-bac, choix de filière" },
      "Préparateur concours": { emoji: "🏅", description: "Spécialiste préparation concours (post-bac, grandes écoles)" },
      "Spécialiste neuroatypique": { emoji: "🧠", description: "Formé à l'accompagnement des profils DYS/TDAH/HPI/TSA" },
    }
  },
};

// ─── Recommandation hierarchique selon diagnostic ────────────
// Retourne le chemin precis dans PROF_HIERARCHY pour un diagnostic complet
export function getRecommendedHierarchy(diag) {
  const { niveau, classe, brevetPrep, spes = [], parcoursupCible, prepaFiliere, univFiliere, matieres = [], psycho, objectif } = diag || {};

  const has = (m) => matieres.includes(m);
  const hasAny = (...mats) => mats.some(m => matieres.includes(m));

  // ── PRIMAIRE / COLLEGE (sauf 3e brevet) ──
  if (niveau === "Primaire" || (niveau === "Collège" && classe !== "3e")) {
    return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
  }

  // ── 3E + BREVET ──
  if (niveau === "Collège" && classe === "3e" && brevetPrep) {
    if (hasAny("Français", "Histoire-Géo")) {
      return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }
    return ["Professeur EN", "Professeur certifié (CAPES)"];
  }

  // ── LYCEE GENERAL ──
  if (niveau === "Lycée général") {
    // SECONDE
    if (classe === "Seconde") {
      if (hasAny("Maths", "Physique", "Chimie", "SVT")) {
        return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
      }
      return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }

    // PREMIERE — selon spés
    if (classe === "Première") {
      if (spes.includes("Maths") && spes.includes("Physique-Chimie")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
      }
      if (spes.includes("Maths") && spes.includes("SVT")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa BCPST (Bio-Chimie)"];
      }
      if (spes.includes("Maths") && spes.includes("SES")) {
        return ["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"];
      }
      if (spes.includes("HGGSP") && spes.includes("HLP (Humanités-Lettres-Philo)")) {
        return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"];
      }
      if (spes.includes("NSI (Numérique-Sciences info)")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
      }
      return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
    }

    // TERMINALE — Parcoursup decide
    if (classe === "Terminale") {
      const ps = parcoursupCible || "";
      if (ps.includes("MPSI") || ps.includes("MP")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
      }
      if (ps.includes("PCSI") || ps.includes("PC")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa PC (Physique-Chimie)"];
      }
      if (ps.includes("PTSI") || ps.includes("PT")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa PT (Physique-Techno)"];
      }
      if (ps.includes("BCPST")) {
        return ["Étudiant grande école", "École d'ingénieurs", "Prépa BCPST (Bio-Chimie)"];
      }
      if (ps.includes("ECG") || ps.includes("Éco-Commerce")) {
        return ["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"];
      }
      if (ps.includes("Khâgne A/L") || ps.includes("Lettres)")) {
        return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"];
      }
      if (ps.includes("Khâgne B/L")) {
        return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne B/L (Lettres-Sciences)"];
      }
      if (ps.includes("INSA") || ps.includes("UTC")) {
        return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
      }
      if (ps.includes("commerce post-bac")) {
        return ["Étudiant grande école", "École de commerce", "École post-bac (commerce)"];
      }
      if (ps.includes("Sciences Po Paris")) {
        return ["Étudiant grande école", "Sciences Po", "Sciences Po Paris"];
      }
      if (ps.includes("IEP")) {
        return ["Étudiant grande école", "Sciences Po", "IEP Région"];
      }
      if (ps.includes("PASS") || ps.includes("LAS") || ps.includes("Médecine")) {
        return ["Étudiant université", "Médecine / Pharmacie", "PASS / LAS (1re année)"];
      }
      if (ps.includes("Sciences")) {
        if (has("SVT") || has("Chimie")) return ["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"];
        if (has("Informatique") || spes.includes("NSI (Numérique-Sciences info)")) return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
        return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
      }
      if (ps.includes("Lettres")) {
        return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
      }
      if (ps.includes("Droit") || ps.includes("Éco")) {
        return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
      }
      if (ps.includes("BTS") || ps.includes("BUT")) {
        return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
      }
      // Defaut Terminale selon spés
      if (spes.includes("Maths")) return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
      return ["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"];
    }
  }

  // ── LYCEE PRO ──
  if (niveau === "Lycée pro") {
    return ["Professeur EN", "Professeur certifié (CAPES)"];
  }

  // ── BTS / BUT ──
  if (niveau === "BTS / IUT") {
    if (hasAny("Maths", "Physique", "Informatique")) {
      return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
    }
    return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
  }

  // ── PREPA ──
  if (niveau === "Prépa") {
    const f = prepaFiliere || "";
    if (f.includes("MPSI") || f.includes("MP ")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
    if (f.includes("PCSI") || f.includes("PC ")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa PC (Physique-Chimie)"];
    if (f.includes("PTSI") || f.includes("PT ")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa PT (Physique-Techno)"];
    if (f.includes("BCPST")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa BCPST (Bio-Chimie)"];
    if (f.includes("ECG")) return ["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"];
    if (f.includes("Khâgne A/L")) return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"];
    if (f.includes("Khâgne B/L")) return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne B/L (Lettres-Sciences)"];
    return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
  }

  // ── UNIVERSITE ──
  if (niveau === "Université") {
    if (univFiliere) {
      const f = univFiliere.toLowerCase();
      if (f.includes("medecine") || f.includes("médecine") || f.includes("pharma")) return ["Étudiant université", "Médecine / Pharmacie", "Médecine (DFGSM)"];
      if (f.includes("info")) return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
      if (f.includes("math")) return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
      if (f.includes("droit")) return ["Étudiant université", "Économie / Gestion / Droit", "Droit"];
      if (f.includes("eco") || f.includes("éco")) return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
      if (f.includes("lettres") || f.includes("philo") || f.includes("histoire")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }
    return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
  }

  // Defaut
  return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
}

// Helper : récupère un item dans la hiérarchie par son chemin
export function getProfHierarchyPath(path) {
  let current = PROF_HIERARCHY;
  const result = [];
  for (const key of path) {
    if (!current || !current[key]) break;
    result.push({ key, ...current[key] });
    current = current[key].children;
  }
  return result;
}

export const REFINE={
  "Étudiant grande école":{
    "Maths":"étudiant en école d'ingénieurs (X, Centrale, CentraleSupélec, Mines...)","Physique":"étudiant en école d'ingénieurs (X, Centrale, Mines-ParisTech...)","Chimie":"étudiant en école de chimie (ENSC, CPE Lyon, Chimie ParisTech...)","Informatique":"étudiant en école d'ingénieurs informatique (CentraleSupélec, EPITA, INSA...)","SVT":"étudiant en école d'ingénieurs biosciences (AgroParisTech, ENSAT...)","Économie":"étudiant en école de commerce (HEC, ESSEC, ESCP, EDHEC...)","Anglais":"étudiant en école de commerce internationale (Sciences Po, ESSEC...)","Français":"étudiant en ENS / prépa lettres (khâgne, hypokhâgne)","Histoire-Géo":"étudiant en ENS / prépa B/L ou Sciences Po","Philosophie":"étudiant en ENS / prépa lettres (khâgne)",default:"étudiant en grande école (ingénieurs, commerce ou ENS)"
  },
  "Étudiant université":{
    "SVT":"étudiant en médecine / PASS-LAS (1re ou 2e année)","Chimie":"étudiant en pharmacie (Fac de sciences)","Français":"étudiant en lettres modernes (LEA ou LLC)","Histoire-Géo":"étudiant en histoire-géographie (Fac de lettres)","Philosophie":"étudiant en philosophie (Fac de lettres, L2-M2)","Anglais":"étudiant en LEA / LLCER","Espagnol":"étudiant en LEA / LLCER","Économie":"étudiant en économie-gestion (AES / ECO, L2-M2)","Maths":"étudiant en mathématiques (MIAGE, Fac de sciences)","Informatique":"étudiant en informatique (IUT, Licence info, BUT)","Physique":"étudiant en physique-chimie (Fac de sciences)",default:"étudiant universitaire (L2-M2, spécialité adaptée)"
  },
  "Professeur EN":{default:"professeur de l'Éducation Nationale (Certifié ou Agrégé)"},
  "AESH":{default:"accompagnant spécialisé DYS & TDAH (AESH)"},
  "Professeur certifié":{default:"professeur certifié (CAPES ou Agrégation)"},
  "Formateur":{default:"formateur professionnel (méthodes & organisation du travail)"},
};
