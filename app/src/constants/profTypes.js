export const PROF_TYPES=["Étudiant grande école","Étudiant université","Professeur EN","AESH","Professeur certifié","Formateur"];

export const PSYCH_PROFILES=["Introverti / Réservé","Décrocheur / Démotivé","Compétiteur / Haut Potentiel","Stressé / Anxieux"];
export const VIE_OBJECTIFS=["Remise à niveau","Réussite concours","Méthodologie pure","Excellence académique"];
export const NIVEAUX=["Primaire","Collège","Lycée général","Lycée pro","BTS / IUT","Prépa","Université"];
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
