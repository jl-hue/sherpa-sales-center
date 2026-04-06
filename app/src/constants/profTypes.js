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

// Liste plate (legacy, utilisée par l'ancien select)
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

// Hiérarchie complète Parcoursup avec écoles cibles précises
export const PARCOURSUP_HIERARCHY = {
  "Prépa scientifique": {
    emoji: "🔬",
    options: {
      "MPSI / MP (Maths-Physique)": {
        emoji: "📐",
        ecoles: ["Louis-le-Grand (Paris)", "Henri-IV (Paris)", "Sainte-Geneviève (Versailles)", "Stanislas (Paris)", "Hoche (Versailles)", "Saint-Louis (Paris)", "Janson-de-Sailly (Paris)", "Massena (Nice)", "Du Parc (Lyon)", "Fermat (Toulouse)", "Pierre de Fermat (Toulouse)", "Autre"],
      },
      "PCSI / PC (Physique-Chimie)": {
        emoji: "⚗️",
        ecoles: ["Louis-le-Grand (Paris)", "Henri-IV (Paris)", "Sainte-Geneviève (Versailles)", "Stanislas (Paris)", "Saint-Louis (Paris)", "Du Parc (Lyon)", "Fermat (Toulouse)", "Hoche (Versailles)", "Autre"],
      },
      "PTSI / PT (Physique-Techno)": {
        emoji: "⚙️",
        ecoles: ["Chaptal (Paris)", "Roosevelt (Reims)", "Vaucanson (Grenoble)", "La Martinière Monplaisir (Lyon)", "Autre"],
      },
      "BCPST (Bio-Chimie-Physique)": {
        emoji: "🧬",
        ecoles: ["Henri-IV (Paris)", "Saint-Louis (Paris)", "Hoche (Versailles)", "Pierre de Fermat (Toulouse)", "Du Parc (Lyon)", "Janson-de-Sailly (Paris)", "Lakanal (Sceaux)", "Autre"],
      },
      "MPI (Maths-Physique-Informatique)": {
        emoji: "💻",
        ecoles: ["Louis-le-Grand (Paris)", "Henri-IV (Paris)", "Stanislas (Paris)", "Sainte-Geneviève (Versailles)", "Autre"],
      },
      "TSI (Techno-Sciences-Industrielles)": {
        emoji: "🏭",
        ecoles: ["Chaptal (Paris)", "La Martinière Diderot (Lyon)", "Livet (Nantes)", "Autre"],
      },
    },
  },
  "Prépa éco / commerce": {
    emoji: "💼",
    options: {
      "ECG voie Maths Appro + ESH": {
        emoji: "📊",
        ecoles: ["Ipésup (Paris)", "Saint-Louis (Paris)", "Notre-Dame du Grandchamp (Versailles)", "Stanislas (Paris)", "Sainte-Geneviève (Versailles)", "Du Parc (Lyon)", "Autre"],
      },
      "ECG voie Maths Appliquées + HGGMC": {
        emoji: "📈",
        ecoles: ["Ipésup (Paris)", "Notre-Dame du Grandchamp", "Stanislas (Paris)", "Saint-Louis (Paris)", "Autre"],
      },
      "ECT (Bac STMG)": {
        emoji: "💰",
        ecoles: ["Lycée Albert de Mun (Paris)", "Lycée Saint-Louis-de-Gonzague (Paris)", "Autre"],
      },
    },
  },
  "Prépa littéraire": {
    emoji: "📚",
    options: {
      "Khâgne A/L (Hypokhâgne)": {
        emoji: "📖",
        ecoles: ["Henri-IV (Paris)", "Louis-le-Grand (Paris)", "Janson-de-Sailly (Paris)", "Fénelon (Paris)", "Du Parc (Lyon)", "Pierre de Fermat (Toulouse)", "Lakanal (Sceaux)", "Autre"],
      },
      "Khâgne B/L (Lettres-Sciences sociales)": {
        emoji: "🏛️",
        ecoles: ["Henri-IV (Paris)", "Lakanal (Sceaux)", "Du Parc (Lyon)", "Janson-de-Sailly (Paris)", "Autre"],
      },
      "Chartes (Archives-Paléographie)": {
        emoji: "📜",
        ecoles: ["Henri-IV (Paris)", "Louis-le-Grand (Paris)", "Autre"],
      },
    },
  },
  "École d'ingénieurs post-bac": {
    emoji: "🔧",
    options: {
      "Réseau INSA (Lyon, Toulouse, Rennes, Rouen, Strasbourg)": {
        emoji: "🏛️",
        ecoles: ["INSA Lyon", "INSA Toulouse", "INSA Rennes", "INSA Rouen", "INSA Strasbourg", "INSA Centre Val de Loire", "INSA Hauts-de-France"],
      },
      "UTC / UTT / UTBM": {
        emoji: "⚙️",
        ecoles: ["UTC Compiègne", "UTT Troyes", "UTBM Belfort-Montbéliard"],
      },
      "Réseau Polytech": {
        emoji: "🔬",
        ecoles: ["Polytech Paris-Saclay", "Polytech Sorbonne", "Polytech Lyon", "Polytech Nice", "Polytech Marseille", "Polytech Nantes", "Polytech Grenoble", "Autre"],
      },
      "Concours Avenir / Puissance Alpha / Geipi": {
        emoji: "🏅",
        ecoles: ["ESILV (Paris-La Défense)", "ECE (Paris)", "EPF (Sceaux)", "ESIEE (Paris)", "ESTP (Cachan)", "Autre"],
      },
      "Prépa intégrée Polytechnique (Cycle Bachelor)": {
        emoji: "🎯",
        ecoles: ["X Bachelor (Polytechnique)", "Autre"],
      },
    },
  },
  "École de commerce post-bac": {
    emoji: "🏢",
    options: {
      "Concours SESAME": {
        emoji: "🌍",
        ecoles: ["KEDGE BBA", "EDHEC BBA (Lille)", "EM Strasbourg BBA", "EM Normandie BBA", "ESSEC BBA", "Autre"],
      },
      "Concours ACCÈS": {
        emoji: "🎓",
        ecoles: ["ESSCA (Angers)", "IÉSEG (Lille/Paris)", "ESDES (Lyon)"],
      },
      "Concours ECRICOME / PASS": {
        emoji: "💼",
        ecoles: ["NEOMA BS", "KEDGE BS", "Rennes School of Business", "Autre"],
      },
      "Programmes Bachelor": {
        emoji: "📋",
        ecoles: ["EBS Paris", "ESCE Paris", "ICN BS", "Autre"],
      },
    },
  },
  "Sciences Po / IEP": {
    emoji: "🌍",
    options: {
      "Sciences Po Paris": {
        emoji: "🇫🇷",
        ecoles: ["Sciences Po Paris (campus Paris)", "Sciences Po Reims", "Sciences Po Le Havre", "Sciences Po Menton", "Sciences Po Nancy", "Sciences Po Poitiers", "Sciences Po Dijon"],
      },
      "Réseau ScPo (concours commun)": {
        emoji: "📍",
        ecoles: ["Sciences Po Lille", "Sciences Po Lyon", "Sciences Po Toulouse", "Sciences Po Aix", "Sciences Po Rennes", "Sciences Po Strasbourg", "Sciences Po Saint-Germain-en-Laye"],
      },
      "Sciences Po Bordeaux": { emoji: "🍷", ecoles: ["Sciences Po Bordeaux"] },
      "Sciences Po Grenoble": { emoji: "🏔️", ecoles: ["Sciences Po Grenoble"] },
    },
  },
  "Médecine / Santé": {
    emoji: "⚕️",
    options: {
      "PASS (Parcours Accès Santé Spécifique)": {
        emoji: "🩺",
        ecoles: ["Sorbonne Université (Paris)", "Université Paris-Cité", "Université Paris-Saclay", "Lyon 1", "Aix-Marseille", "Bordeaux", "Lille", "Toulouse Paul Sabatier", "Strasbourg", "Autre"],
      },
      "LAS (Licence Accès Santé)": {
        emoji: "🧬",
        ecoles: ["LAS Sciences de la Vie", "LAS Psycho", "LAS Sciences", "LAS Droit", "LAS STAPS", "LAS Lettres", "Autre"],
      },
      "Études d'Orthophonie / Ergo / Kiné": {
        emoji: "💆",
        ecoles: ["IFMK (Kiné)", "Centre de formation orthophonie", "École d'ergothérapie", "Autre"],
      },
      "Concours infirmier (IFSI hors Parcoursup)": {
        emoji: "💉",
        ecoles: ["IFSI Paris", "IFSI Lyon", "Autre IFSI"],
      },
    },
  },
  "Université": {
    emoji: "🎒",
    options: {
      "Licence Sciences (Maths, Physique, Info, Chimie)": {
        emoji: "🔬",
        ecoles: ["Sorbonne Université", "Paris-Saclay", "Université Paris-Cité", "Lyon 1 (Claude Bernard)", "Aix-Marseille Université", "Toulouse III", "Autre"],
      },
      "Licence SVT / Biologie": {
        emoji: "🌱",
        ecoles: ["Sorbonne Université", "Paris-Saclay", "Lyon 1", "Autre"],
      },
      "Licence Lettres / Philo": {
        emoji: "📖",
        ecoles: ["Sorbonne Université (Paris IV)", "Paris-Nanterre", "Lyon 2 (Lumière)", "Autre"],
      },
      "Licence Histoire / Géographie": {
        emoji: "🗺️",
        ecoles: ["Sorbonne Université", "Paris 1 Panthéon-Sorbonne", "Paris-Nanterre", "Autre"],
      },
      "Licence Droit": {
        emoji: "⚖️",
        ecoles: ["Paris 1 Panthéon-Sorbonne", "Paris 2 Assas", "Paris-Saclay", "Lyon 3", "Aix-Marseille", "Autre"],
      },
      "Licence Économie / Gestion / AES": {
        emoji: "💰",
        ecoles: ["Paris 1", "Paris-Dauphine", "Paris-Saclay", "Lyon 2", "Autre"],
      },
      "Licence LEA / LLCER (Langues)": {
        emoji: "🌐",
        ecoles: ["Sorbonne Nouvelle (Paris 3)", "INALCO (Paris)", "Paris-Nanterre", "Autre"],
      },
      "Licence Psychologie": {
        emoji: "🧠",
        ecoles: ["Paris-Cité", "Paris-Nanterre", "Lyon 2", "Autre"],
      },
      "STAPS (Sport)": {
        emoji: "🏃",
        ecoles: ["Paris-Saclay", "Paris-Cité", "Lyon 1", "Autre"],
      },
    },
  },
  "BTS / BUT (DUT)": {
    emoji: "🛠️",
    options: {
      "BUT Informatique": { emoji: "💻", ecoles: ["IUT Orsay", "IUT Lyon 1", "IUT Toulouse 3", "Autre"] },
      "BUT Gestion / GEA": { emoji: "📊", ecoles: ["IUT Sceaux", "IUT Paris-Rives de Seine", "Autre"] },
      "BUT Mesures Physiques": { emoji: "📏", ecoles: ["IUT Orsay", "IUT Lyon 1", "Autre"] },
      "BTS Commerce International": { emoji: "🌍", ecoles: ["Lycée privé/public BTS CI", "Autre"] },
      "BTS Comptabilité-Gestion": { emoji: "💰", ecoles: ["Lycée privé/public BTS CG", "Autre"] },
      "BTS Tourisme / Hôtellerie": { emoji: "🏨", ecoles: ["Lycée hôtelier", "Autre"] },
      "Autre BTS / BUT": { emoji: "📋", ecoles: ["À préciser"] },
    },
  },
  "École spécialisée": {
    emoji: "🎨",
    options: {
      "École d'art / design (Beaux-Arts, ENSAD)": {
        emoji: "🎨",
        ecoles: ["ENSAD (Paris)", "ENSBA (Beaux-Arts Paris)", "Boulle (Paris)", "Olivier de Serres (Paris)", "Estienne (Paris)", "Autre"],
      },
      "École d'architecture (ENSA)": {
        emoji: "🏛️",
        ecoles: ["ENSA Paris-Belleville", "ENSA Paris-Val de Seine", "ENSA Versailles", "ENSA Lyon", "Autre"],
      },
      "École de cinéma / audiovisuel": {
        emoji: "🎬",
        ecoles: ["La Fémis (Paris)", "Louis Lumière (Saint-Denis)", "ESRA", "Autre"],
      },
      "Conservatoire (musique, danse, théâtre)": {
        emoji: "🎭",
        ecoles: ["CNSMD Paris", "CNSMD Lyon", "Conservatoire régional", "Autre"],
      },
    },
  },
  "Pas encore décidé / Autre": {
    emoji: "❓",
    options: {
      "Année de césure / réorientation": { emoji: "🛤️", ecoles: ["—"] },
      "Études à l'étranger": { emoji: "🌍", ecoles: ["UK", "USA", "Canada", "Belgique", "Suisse", "Autre"] },
      "Pas encore décidé": { emoji: "🤔", ecoles: ["—"] },
    },
  },
};
export const MATIERES=["Maths","Français","Anglais","Physique","Chimie","SVT","Histoire-Géo","Philosophie","Espagnol","Allemand","Économie","Informatique","Autre"];

export const RULES={
  niveau:{"Primaire":{"Professeur EN":35,"Étudiant université":25,"AESH":15},"Collège":{"Professeur EN":25,"Étudiant université":25,"Étudiant grande école":10,"AESH":10},"Lycée général":{"Étudiant grande école":30,"Professeur certifié":25,"Étudiant université":15},"Lycée pro":{"Professeur EN":25,"Professeur certifié":20,"Formateur":20},"BTS / IUT":{"Étudiant université":30,"Professeur certifié":20,"Formateur":15},"Prépa":{"Étudiant grande école":45,"Professeur certifié":20},"Université":{"Étudiant grande école":35,"Étudiant université":25,"Professeur certifié":15}},
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
// Mapping filière → matières enseignées dans cette filière
// Permet de detecter une incoherence entre la cible Parcoursup et la matiere demandee
const FILIERE_MATIERES = {
  "Prépa MP (Maths-Physique)": ["Maths", "Physique", "Informatique", "Anglais", "Français", "Philosophie"],
  "Prépa PC (Physique-Chimie)": ["Maths", "Physique", "Chimie", "Anglais", "Français", "Philosophie"],
  "Prépa PT (Physique-Techno)": ["Maths", "Physique", "Anglais", "Français", "Philosophie"],
  "Prépa BCPST (Bio-Chimie)": ["Maths", "Physique", "Chimie", "SVT", "Anglais", "Français", "Philosophie"],
  "Prépa ECG (Éco-Gestion)": ["Maths", "Économie", "Histoire-Géo", "Anglais", "Espagnol", "Allemand", "Français", "Philosophie"],
  "Prépa ECT (Techno)": ["Maths", "Économie", "Anglais", "Français"],
  "Khâgne A/L (Lettres)": ["Français", "Philosophie", "Histoire-Géo", "Anglais", "Espagnol", "Allemand"],
  "Khâgne B/L (Lettres-Sciences)": ["Maths", "Français", "Philosophie", "Histoire-Géo", "Économie", "Anglais"],
  "INSA / UTC / Polytech": ["Maths", "Physique", "Chimie", "Informatique", "Anglais"],
  "École post-bac (commerce)": ["Économie", "Anglais", "Français", "Espagnol", "Maths"],
  "Sciences Po Paris": ["Histoire-Géo", "Philosophie", "Économie", "Français", "Anglais"],
  "IEP Région": ["Histoire-Géo", "Philosophie", "Économie", "Français", "Anglais"],
  "PASS / LAS (1re année)": ["SVT", "Chimie", "Physique", "Maths"],
  "Médecine (DFGSM)": ["SVT", "Chimie", "Physique"],
  "Maths / MIAGE": ["Maths", "Informatique", "Physique"],
  "SVT / Biologie": ["SVT", "Chimie", "Maths"],
  "Informatique / BUT info": ["Maths", "Informatique"],
  "Physique / Chimie": ["Physique", "Chimie", "Maths"],
  "Lettres modernes / classiques": ["Français", "Philosophie", "Histoire-Géo"],
  "Histoire / Géographie": ["Histoire-Géo", "Français"],
  "LEA / LLCER (langues)": ["Anglais", "Espagnol", "Allemand", "Français"],
  "Économie / AES": ["Économie", "Maths", "Histoire-Géo"],
  "Droit": ["Français", "Histoire-Géo", "Philosophie"],
};

// Etant donne une matiere, retourne le chemin vers le bon profil universitaire
function getProfilForMatiere(matieres) {
  if (!matieres || matieres.length === 0) return null;
  if (matieres.includes("Histoire-Géo")) return ["Étudiant université", "Lettres & Sciences humaines", "Histoire / Géographie"];
  if (matieres.includes("Philosophie") || matieres.includes("Français")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
  if (matieres.includes("Anglais") || matieres.includes("Espagnol") || matieres.includes("Allemand")) return ["Étudiant université", "Lettres & Sciences humaines", "LEA / LLCER (langues)"];
  if (matieres.includes("Économie")) return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
  if (matieres.includes("SVT")) return ["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"];
  if (matieres.includes("Chimie") && !matieres.includes("Maths")) return ["Étudiant université", "Médecine / Pharmacie", "Pharmacie"];
  if (matieres.includes("Informatique")) return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
  if (matieres.includes("Physique") || matieres.includes("Chimie")) return ["Étudiant université", "Sciences (maths, physique, info)", "Physique / Chimie"];
  if (matieres.includes("Maths")) return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
  return null;
}

// Vérifie si la filière visée couvre les matières demandées
function filiereCouvreMatieres(filiere, matieres) {
  if (!matieres || matieres.length === 0) return true;
  const couvertes = FILIERE_MATIERES[filiere];
  if (!couvertes) return true; // Pas de mapping = on suppose OK
  // Toutes les matieres demandees doivent etre dans la filiere
  return matieres.every(m => couvertes.includes(m) || m === "Autre");
}

// Wrapper qui priorise la matiere demandee si elle n'est pas couverte par la filiere Parcoursup
function maybeOverrideForMatiere(filierePath, matieres) {
  if (!filierePath || filierePath.length === 0) return filierePath;
  const filiereFinal = filierePath[filierePath.length - 1];
  if (filiereCouvreMatieres(filiereFinal, matieres)) return filierePath;
  // La filiere ne couvre pas la matiere demandee → on prend la matiere
  const profilMatiere = getProfilForMatiere(matieres);
  return profilMatiere || filierePath;
}

// Wrapper public : applique l'override matière à TOUTES les recommandations
export function getRecommendedHierarchy(diag) {
  const path = _getRecommendedHierarchyRaw(diag);
  return maybeOverrideForMatiere(path, diag?.matieres || []);
}

function _getRecommendedHierarchyRaw(diag) {
  const { niveau, classe, brevetPrep, spes = [], parcoursupCategorie, parcoursupCible, parcoursupEcole, prepaFiliere, univFiliere, matieres = [], psycho, objectif } = diag || {};

  const has = (m) => matieres.includes(m);
  const hasAny = (...mats) => mats.some(m => matieres.includes(m));

  // ── PRIMAIRE / COLLEGE (sauf 3e brevet) ──
  if (niveau === "Primaire" || (niveau === "Collège" && classe !== "3e")) {
    // Selon matière dominante
    if (hasAny("Français", "Histoire-Géo", "Philosophie")) {
      return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }
    if (hasAny("Anglais", "Espagnol", "Allemand")) {
      return ["Étudiant université", "Lettres & Sciences humaines", "LEA / LLCER (langues)"];
    }
    if (hasAny("SVT", "Chimie") && !has("Maths")) {
      return ["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"];
    }
    // Cas general (maths, physique, ou plusieurs matieres) -> prof polyvalent universite sciences
    return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
  }

  // ── 3E + BREVET ──
  if (niveau === "Collège" && classe === "3e" && brevetPrep) {
    if (hasAny("Français", "Histoire-Géo", "Philosophie")) {
      return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }
    if (hasAny("Anglais", "Espagnol", "Allemand")) {
      return ["Étudiant université", "Lettres & Sciences humaines", "LEA / LLCER (langues)"];
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

    // TERMINALE — Parcoursup decide (priorise parcoursupCategorie + parcoursupCible)
    if (classe === "Terminale") {
      const cat = parcoursupCategorie || "";
      const ps = parcoursupCible || "";
      // Helper: applique la logique d'override matière si la filière ne couvre pas la matière demandée
      const wrap = (path) => maybeOverrideForMatiere(path, matieres);

      // ── PREPA SCIENTIFIQUE ──
      if (cat === "Prépa scientifique") {
        if (ps.includes("MPSI") || ps.includes("MP ") || ps.startsWith("MP")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]);
        if (ps.includes("PCSI") || ps.includes("PC ") || ps.startsWith("PC")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa PC (Physique-Chimie)"]);
        if (ps.includes("PTSI") || ps.includes("PT ") || ps.startsWith("PT")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa PT (Physique-Techno)"]);
        if (ps.includes("BCPST")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa BCPST (Bio-Chimie)"]);
        if (ps.includes("MPI")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]);
        if (ps.includes("TSI")) return wrap(["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"]);
        return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]);
      }

      // ── PREPA ECO / COMMERCE ──
      if (cat === "Prépa éco / commerce") {
        if (ps.includes("ECT")) return wrap(["Étudiant grande école", "École de commerce", "Prépa ECT (Techno)"]);
        return wrap(["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"]);
      }

      // ── PREPA LITTERAIRE ──
      if (cat === "Prépa littéraire") {
        if (ps.includes("B/L")) return wrap(["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne B/L (Lettres-Sciences)"]);
        if (ps.includes("Chartes")) return wrap(["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"]);
        return wrap(["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"]);
      }

      // ── ECOLE D'INGE POST-BAC ──
      if (cat === "École d'ingénieurs post-bac") {
        if (ps.includes("Polytechnique") || ps.includes("Bachelor")) return wrap(["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]);
        return wrap(["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"]);
      }

      // ── ECOLE DE COMMERCE POST-BAC ──
      if (cat === "École de commerce post-bac") {
        return wrap(["Étudiant grande école", "École de commerce", "École post-bac (commerce)"]);
      }

      // ── SCIENCES PO / IEP ──
      if (cat === "Sciences Po / IEP") {
        if (ps.includes("Sciences Po Paris")) return wrap(["Étudiant grande école", "Sciences Po", "Sciences Po Paris"]);
        return wrap(["Étudiant grande école", "Sciences Po", "IEP Région"]);
      }

      // ── MEDECINE / SANTE ──
      if (cat === "Médecine / Santé") {
        if (ps.includes("PASS")) return wrap(["Étudiant université", "Médecine / Pharmacie", "PASS / LAS (1re année)"]);
        if (ps.includes("LAS")) return wrap(["Étudiant université", "Médecine / Pharmacie", "PASS / LAS (1re année)"]);
        if (ps.includes("Orthophonie") || ps.includes("Ergo") || ps.includes("Kiné")) return wrap(["Étudiant université", "Médecine / Pharmacie", "Médecine (DFGSM)"]);
        if (ps.includes("infirmier")) return wrap(["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"]);
        return wrap(["Étudiant université", "Médecine / Pharmacie", "PASS / LAS (1re année)"]);
      }

      // ── UNIVERSITE ──
      if (cat === "Université") {
        if (ps.includes("Sciences") && !ps.includes("SVT")) {
          if (has("Informatique") || spes.includes("NSI (Numérique-Sciences info)")) return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
          return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
        }
        if (ps.includes("SVT") || ps.includes("Biologie")) return ["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"];
        if (ps.includes("Lettres") || ps.includes("Philo")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
        if (ps.includes("Histoire") || ps.includes("Géographie")) return ["Étudiant université", "Lettres & Sciences humaines", "Histoire / Géographie"];
        if (ps.includes("Droit")) return ["Étudiant université", "Économie / Gestion / Droit", "Droit"];
        if (ps.includes("Économie") || ps.includes("Gestion") || ps.includes("AES")) return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
        if (ps.includes("LEA") || ps.includes("LLCER") || ps.includes("Langues")) return ["Étudiant université", "Lettres & Sciences humaines", "LEA / LLCER (langues)"];
        if (ps.includes("Psychologie")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
        if (ps.includes("STAPS")) return ["Étudiant université", "Sciences (maths, physique, info)", "SVT / Biologie"];
        return ["Étudiant université", "Sciences (maths, physique, info)", "Maths / MIAGE"];
      }

      // ── BTS / BUT ──
      if (cat === "BTS / BUT (DUT)") {
        if (ps.includes("Informatique")) return ["Étudiant université", "Sciences (maths, physique, info)", "Informatique / BUT info"];
        if (ps.includes("Mesures Physiques")) return ["Étudiant université", "Sciences (maths, physique, info)", "Physique / Chimie"];
        if (ps.includes("Gestion") || ps.includes("Comptabilité") || ps.includes("Commerce")) return ["Étudiant université", "Économie / Gestion / Droit", "Économie / AES"];
        return ["Professeur certifié", "CAPLP (lycée pro)"];
      }

      // ── ECOLE SPECIALISEE ──
      if (cat === "École spécialisée") {
        if (ps.includes("art") || ps.includes("design") || ps.includes("Beaux-Arts")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
        if (ps.includes("architecture") || ps.includes("ENSA")) return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
        if (ps.includes("cinéma") || ps.includes("audiovisuel")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
        if (ps.includes("Conservatoire") || ps.includes("musique")) return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
        return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
      }

      // ── PAS ENCORE DECIDE / AUTRE ──
      if (cat === "Pas encore décidé / Autre") {
        // On retombe sur le defaut selon les spes
      }

      // Defaut Terminale selon spés (si Parcoursup non rempli ou cat non matchee)
      if (spes.includes("Maths") && spes.includes("Physique-Chimie")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"];
      if (spes.includes("Maths") && spes.includes("SVT")) return ["Étudiant grande école", "École d'ingénieurs", "Prépa BCPST (Bio-Chimie)"];
      if (spes.includes("Maths") && spes.includes("SES")) return ["Étudiant grande école", "École de commerce", "Prépa ECG (Éco-Gestion)"];
      if (spes.includes("HLP (Humanités-Lettres-Philo)") || spes.includes("HGGSP")) return ["Étudiant grande école", "École normale supérieure (ENS)", "Khâgne A/L (Lettres)"];
      if (spes.includes("LLCE Anglais") || spes.includes("LLCE Espagnol")) return ["Étudiant université", "Lettres & Sciences humaines", "LEA / LLCER (langues)"];
      if (spes.includes("Maths")) return ["Étudiant grande école", "École d'ingénieurs", "INSA / UTC / Polytech"];
      return ["Étudiant université", "Lettres & Sciences humaines", "Lettres modernes / classiques"];
    }
  }

  // ── LYCEE PRO ──
  if (niveau === "Lycée pro") {
    return ["Professeur certifié", "CAPLP (lycée pro)"];
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
