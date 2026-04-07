// ─── Boîte à outils famille : échéances + programmes officiels ───

// Dates clés selon le niveau scolaire (année type)
export const ECHEANCES = {
  "Primaire": [
    { date: "Juin", label: "Évaluations CM2 (entrée 6e)", type: "info" },
    { date: "Toute l'année", label: "Évaluations nationales CP/CE1/CM1", type: "info" },
  ],
  "Collège": [
    { date: "Sept-Oct", label: "Évaluations nationales 6e (Maths + Français)", type: "info" },
    { date: "Toute l'année", label: "Brevet blanc (3e) — généralement Janvier + Avril", type: "warn" },
    { date: "Fin Mai - Début Juin", label: "DNB — Diplôme National du Brevet (fin 3e)", type: "exam" },
    { date: "Mars", label: "Vœux d'orientation post-3e (lycée général/pro)", type: "warn" },
  ],
  "Lycée général": [
    { date: "Janvier-Mars (1ère)", label: "Épreuves anticipées de Français (écrit + oral du Bac)", type: "exam" },
    { date: "Mars (Terminale)", label: "Épreuves de spécialité du Bac (les 2 spés gardées)", type: "exam" },
    { date: "Juin (Terminale)", label: "Épreuve écrite de Philosophie + Grand Oral", type: "exam" },
    { date: "Janvier-Mars", label: "Parcoursup : formulation des vœux", type: "warn" },
    { date: "Avril-Mai", label: "Parcoursup : confirmation + dossier", type: "warn" },
    { date: "Juin-Juillet", label: "Parcoursup : phase d'admission principale", type: "warn" },
    { date: "Toute l'année", label: "Bulletins trimestriels (poids dans Parcoursup)", type: "info" },
  ],
  "Lycée pro": [
    { date: "Mars (Tle pro)", label: "CCF — Contrôles en Cours de Formation", type: "exam" },
    { date: "Juin (Tle pro)", label: "Épreuves finales du Bac pro", type: "exam" },
    { date: "Janvier-Mars", label: "Parcoursup : vœux post-bac (BTS, BUT, écoles)", type: "warn" },
  ],
  "BTS / IUT": [
    { date: "Mai-Juin (BTS 2)", label: "Épreuves finales du BTS", type: "exam" },
    { date: "Mai (BUT)", label: "Examens semestriels", type: "exam" },
    { date: "Toute l'année", label: "Soutenance de stage / projet tutoré", type: "warn" },
  ],
  "Prépa": [
    { date: "Janvier-Mai (2e année)", label: "Concours écrits (X, Centrale, Mines, ENS, HEC...)", type: "exam" },
    { date: "Juin-Juillet", label: "Oraux des concours (admissibles)", type: "exam" },
    { date: "Toute l'année", label: "Khôlles hebdomadaires (interrogations orales)", type: "info" },
    { date: "Décembre + Avril", label: "Concours blancs internes", type: "warn" },
  ],
  "Université": [
    { date: "Décembre-Janvier", label: "Examens du semestre 1 (partiels)", type: "exam" },
    { date: "Mai-Juin", label: "Examens du semestre 2 (partiels)", type: "exam" },
    { date: "Juin-Juillet", label: "Session de rattrapage", type: "warn" },
  ],
};

// Programmes officiels par matière + niveau (grandes lignes)
export const PROGRAMMES = {
  "Maths": {
    "Primaire": [
      "Numération et calcul (4 opérations, fractions)",
      "Géométrie (figures, mesures, périmètres, aires)",
      "Grandeurs et mesures (longueurs, durées, monnaie)",
      "Résolution de problèmes",
    ],
    "Collège": {
      "6e-5e": ["Nombres décimaux", "Fractions", "Proportionnalité", "Géométrie plane (cercles, triangles)", "Symétrie axiale"],
      "4e": ["Nombres relatifs", "Puissances", "Calcul littéral", "Théorème de Pythagore", "Statistiques"],
      "3e": ["Fonctions affines", "Calcul littéral (développement, factorisation)", "Théorème de Thalès", "Trigonométrie", "Probabilités", "Arithmétique (PGCD)"],
    },
    "Lycée général": {
      "Seconde": ["Fonctions (généralités)", "Géométrie analytique (droites)", "Statistiques et probabilités", "Vecteurs", "Trigonométrie"],
      "Première (spé)": ["Suites numériques", "Dérivation", "Fonctions exponentielle et logarithme", "Trigonométrie avancée", "Probabilités conditionnelles", "Produit scalaire"],
      "Terminale (spé)": ["Limites de suites et fonctions", "Continuité et dérivation avancée", "Fonction logarithme", "Primitives et intégrales", "Probabilités (lois)", "Géométrie dans l'espace", "Arithmétique (Tle expert)"],
    },
    "Prépa": ["Analyse (limites, séries, intégrales)", "Algèbre linéaire (espaces vectoriels, matrices)", "Probabilités avancées", "Géométrie", "Topologie"],
  },
  "Physique": {
    "Collège": {
      "5e-4e": ["États de la matière", "Électricité (circuits)", "Optique (lumière, ombres)", "Mouvements"],
      "3e": ["Énergie (formes, conservation)", "Électricité (puissance, énergie)", "Mécanique (vitesse, forces)", "Astronomie"],
    },
    "Lycée général": {
      "Seconde": ["Description de l'Univers", "Santé (signaux, médicaments)", "Pratique du sport", "Modélisation"],
      "Première (spé)": ["Mouvements et interactions", "Énergie : conversions et transferts", "Ondes et signaux", "Constitution et transformations de la matière"],
      "Terminale (spé)": ["Mécanique (forces, énergie, mouvements complexes)", "Ondes et signaux (acoustique, optique)", "Énergie : transferts thermiques", "Constitution de la matière (atomes, modèles)", "Réactions chimiques (acides-bases, oxydoréduction)"],
    },
  },
  "Chimie": {
    "Collège": {
      "5e-3e": ["Mélanges et solutions", "Atomes et molécules", "Réactions chimiques simples", "pH"],
    },
    "Lycée général": {
      "Seconde": ["Constitution de la matière", "Espèces chimiques", "Synthèse"],
      "Première (spé)": ["Structure des entités chimiques", "Évolution des systèmes", "Modélisation"],
      "Terminale (spé)": ["Cinétique chimique", "Équilibres chimiques", "Acides-bases", "Oxydoréduction", "Synthèse organique"],
    },
  },
  "SVT": {
    "Collège": {
      "6e-4e": ["Le vivant et son évolution", "Le corps humain (système digestif, respiratoire)", "La planète Terre (climat, séismes)"],
      "3e": ["Génétique (ADN, hérédité)", "Reproduction humaine", "Système immunitaire", "Activité humaine et environnement"],
    },
    "Lycée général": {
      "Seconde": ["La Terre dans l'Univers", "Enjeux planétaires contemporains", "Corps humain et santé"],
      "Première (spé)": ["Génétique et évolution", "Écosystèmes", "Corps humain (immunité, variations génétiques)"],
      "Terminale (spé)": ["Génétique et évolution avancées", "Climats et géologie", "Comportements humains et santé", "Procréation humaine"],
    },
  },
  "Français": {
    "Collège": {
      "6e-5e": ["Récits de création / monstres", "Lecture des contes", "Initiation à la grammaire", "Conjugaison de base"],
      "4e": ["La fiction pour interroger le réel", "Roman du XIXe siècle", "Conjugaison avancée", "Argumentation"],
      "3e": ["Récits d'enfance / autobiographie", "Visions poétiques du monde", "Argumentation et débat", "Brevet (français)"],
    },
    "Lycée général": {
      "Seconde": ["Roman et nouvelle", "Théâtre du XVIIe au XXIe", "Poésie du Moyen Âge à nos jours", "Littérature d'idées"],
      "Première (anticipées)": ["4 œuvres au programme du Bac (changent chaque année)", "Méthode du commentaire écrit", "Méthode de la dissertation", "Méthode de la contraction de texte (séries techno)", "Préparation à l'oral (24 textes)"],
    },
  },
  "Philosophie": {
    "Lycée général": {
      "Terminale": ["17 notions au programme : conscience, inconscient, raison, vérité, art, religion, justice, État, liberté, devoir, bonheur, temps, langage, technique, nature, travail, science", "Méthode de la dissertation", "Méthode de l'explication de texte", "Auteurs au programme (Platon à aujourd'hui)"],
    },
  },
  "Histoire-Géo": {
    "Collège": {
      "6e": ["Préhistoire", "Antiquité (Égypte, Grèce, Rome)", "Géo : habiter la Terre"],
      "5e": ["Moyen Âge", "Géo : ressources et inégalités"],
      "4e": ["XVIIIe-XIXe (Révolutions, industrialisation)", "Géo : urbanisation, mobilité"],
      "3e": ["XXe siècle (guerres mondiales, décolonisation, Ve République)", "Géo : France et Europe", "Brevet (HG-EMC)"],
    },
    "Lycée général": {
      "Seconde": ["Le monde méditerranéen antique", "XVe-XVIe : nouveaux mondes", "Géo : sociétés et environnements"],
      "Première": ["Révolution française à 1914", "Géo : recompositions territoriales"],
      "Terminale": ["1930 à nos jours (guerres, décolonisation, mondialisation)", "Géo : mers et océans, dynamiques territoriales"],
    },
  },
  "SES": {
    "Lycée général": {
      "Seconde": ["Comment crée-t-on des richesses ?", "Comment se forment les prix ?", "Quelles sont les principales relations sociales ?"],
      "Première (spé)": ["Marchés et défaillances", "Monnaie et financement", "Sociologie de la déviance, de l'école"],
      "Terminale (spé)": ["Croissance économique", "Mondialisation", "Politiques sociales", "Engagement politique"],
    },
  },
  "Anglais": {
    "Collège": ["Présent simple/continu", "Past simple", "Modaux (can, must, should)", "Vocabulaire quotidien", "Compréhension orale et écrite", "Expression orale en interaction"],
    "Lycée général": ["Niveau B2 visé au Bac", "4 axes thématiques (identités, espaces, fictions, etc.)", "Expression écrite et orale avancée", "Préparation aux 4 compétences (CO, CE, EO, EE)", "Spé LLCE Anglais : œuvres littéraires"],
  },
  "Espagnol": {
    "Collège": ["Présent, prétérit, futur simples", "Ser/Estar", "Vocabulaire quotidien", "Pays hispanophones"],
    "Lycée général": ["Niveau B2 visé", "Subjonctif présent et imparfait", "Concordance des temps", "Civilisation hispanique"],
  },
  "Allemand": {
    "Collège": ["Présent, prétérit", "Déclinaisons (nominatif, accusatif)", "Verbes à particule", "Vocabulaire quotidien"],
    "Lycée général": ["Niveau B2 visé", "Subjonctif (Konjunktiv)", "Tournures complexes", "Civilisation allemande"],
  },
  "Économie": {
    "Lycée général": ["Spé SES (voir SES)"],
    "Université": ["Microéconomie", "Macroéconomie", "Statistiques", "Histoire de la pensée économique"],
  },
  "Informatique": {
    "Lycée général": {
      "Seconde (SNT)": ["Internet, web, réseaux sociaux", "Données structurées", "Photo numérique", "Cartographie"],
      "Première (spé NSI)": ["Histoire de l'informatique", "Représentation des données", "Types construits", "Langages et programmation (Python)", "Algorithmes de tri"],
      "Terminale (spé NSI)": ["Structures de données (listes, arbres, graphes)", "Bases de données (SQL)", "Programmation orientée objet", "Algorithmique avancée"],
    },
    "Université": ["Algorithmique", "Programmation (Python, Java, C)", "Bases de données", "Systèmes d'exploitation", "Réseaux"],
  },
};

// Helper : recupere les echeances pour un niveau
export function getEcheances(niveau) {
  return ECHEANCES[niveau] || [];
}

// Helper : recupere les grandes lignes du programme pour une matiere + niveau
export function getProgramme(matiere, niveau, classe) {
  const m = PROGRAMMES[matiere];
  if (!m) return null;
  const n = m[niveau];
  if (!n) return null;
  // Cas où le programme dépend de la classe précise
  if (typeof n === "object" && !Array.isArray(n)) {
    if (classe && n[classe]) return n[classe];
    // Sinon renvoie la première sous-classe trouvée
    const firstKey = Object.keys(n)[0];
    return { __key: firstKey, items: n[firstKey], allClasses: n };
  }
  return n;
}
