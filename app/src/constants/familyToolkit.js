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
  "Lycée techno": [
    { date: "Janvier-Mars (1ère)", label: "Épreuves anticipées de Français (écrit + oral du Bac)", type: "exam" },
    { date: "Mars (Terminale)", label: "Épreuves de spécialité du Bac techno (2 enseignements de spé)", type: "exam" },
    { date: "Juin (Terminale)", label: "Épreuve écrite de Philosophie + Grand Oral techno", type: "exam" },
    { date: "Janvier-Mars", label: "Parcoursup : formulation des vœux (BTS, BUT, écoles, université)", type: "warn" },
    { date: "Avril-Mai", label: "Parcoursup : confirmation + dossier", type: "warn" },
    { date: "Juin-Juillet", label: "Parcoursup : phase d'admission principale", type: "warn" },
    { date: "Toute l'année", label: "Bulletins trimestriels (poids fort dans Parcoursup pour le techno)", type: "info" },
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
    "Lycée techno": {
      "Seconde": ["Fonctions de base", "Statistiques descriptives", "Géométrie repérée", "Probabilités simples"],
      "Première (STMG/STI2D/ST2S/STL)": ["Suites arithmétiques et géométriques", "Fonctions polynômes de degré 2", "Dérivation (STI2D/STL plus poussée)", "Probabilités conditionnelles", "Statistiques à deux variables"],
      "Terminale (STMG/STI2D/ST2S/STL)": ["Suites et fonctions (dérivation, intégration allégée en STI2D/STL)", "Fonction exponentielle", "Probabilités (loi binomiale)", "Statistiques inférentielles"],
    },
    "Lycée pro": ["Calcul numérique et algébrique", "Fonctions affines et linéaires", "Statistiques et probabilités de base", "Géométrie et trigonométrie appliquées", "Mathématiques appliquées à la filière (BTP, industrie, tertiaire)"],
    "BTS / IUT": ["Analyse (dérivation, intégration selon filière)", "Algèbre linéaire (BUT Info, BUT GMP)", "Statistiques et probabilités appliquées", "Mathématiques financières (BTS Compta-Gestion, Banque)", "Calcul matriciel et optimisation (BUT Info)"],
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
    "Prépa": ["Mécanique du point et du solide (MPSI/PCSI/PTSI)", "Électromagnétisme (équations de Maxwell en PC/PSI)", "Thermodynamique (principes, machines thermiques)", "Optique géométrique et ondulatoire", "Électrocinétique et électronique", "Mécanique des fluides (PSI/PT)", "Physique quantique (PC/PSI)"],
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
    "Prépa": ["Atomistique et liaison chimique (PCSI)", "Thermodynamique chimique", "Cinétique chimique avancée", "Chimie organique (mécanismes réactionnels, stéréochimie)", "Chimie des solutions (acides-bases, oxydoréduction, complexation)", "Cristallographie (BCPST/PC)"],
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
    "Prépa": ["Biologie cellulaire et moléculaire (BCPST)", "Génétique formelle et moléculaire", "Physiologie animale et végétale", "Écologie et évolution", "Géologie (tectonique, pétrographie, paléontologie)", "Biochimie structurale et métabolique"],
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
    "Lycée techno": {
      "Première (anticipées techno)": ["3 œuvres au programme du Bac techno (changent chaque année)", "Contraction de texte + essai (épreuve écrite spécifique au techno)", "Préparation à l'oral du Bac (16 textes)", "Grammaire (question de grammaire à l'oral)"],
    },
    "Lycée pro": ["Lecture d'œuvres intégrales et de groupements de textes (allégé)", "Rédaction de textes courts (articles, lettres, récits)", "Maîtrise de l'orthographe et de la grammaire fonctionnelle", "Expression orale (présentations, débats)", "Contrôle en cours de formation (CCF)"],
    "BTS / IUT": ["Culture générale et expression (épreuve commune à tous les BTS)", "Synthèse de documents (écrit)", "Écriture personnelle argumentée", "Thème annuel au programme (change chaque année, 2 thèmes en BTS 2)"],
    "Prépa": ["2 œuvres au programme de Français-Philo (changent chaque année, thème commun)", "Méthode de la dissertation sur œuvres", "Méthode du résumé de texte (ECG/ECT)", "Culture générale littéraire et philosophique"],
  },
  "Philosophie": {
    "Lycée général": {
      "Terminale": ["17 notions au programme : conscience, inconscient, raison, vérité, art, religion, justice, État, liberté, devoir, bonheur, temps, langage, technique, nature, travail, science", "Méthode de la dissertation", "Méthode de l'explication de texte", "Auteurs au programme (Platon à aujourd'hui)"],
    },
    "Lycée techno": {
      "Terminale techno": ["8 notions au programme (allégé) : l'art, le bonheur, la conscience, la justice, le langage, la nature, la technique, le travail", "Méthode de la dissertation (sujet plus guidé qu'en général)", "Méthode de l'explication de texte (extrait court)", "Auteurs au programme (liste allégée)"],
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
    "Lycée techno": {
      "Seconde": ["Grandes étapes de l'Antiquité au XVIIIe", "Géo : sociétés face aux risques, mondialisation"],
      "Première": ["Europe et France de 1789 à 1914", "Géo : recompositions du monde"],
      "Terminale": ["Le monde de 1945 à nos jours (programme allégé par rapport au général)", "Géo : dynamiques de la mondialisation et acteurs"],
    },
    "Lycée pro": ["Grandes périodes historiques (Révolution à nos jours, allégé)", "Géographie : France, Europe, mondialisation", "Éducation morale et civique (EMC)", "Étude de documents au CCF"],
    "Prépa": ["Histoire moderne et contemporaine (khâgne A/L : depuis 1850)", "Histoire des mondes contemporains (B/L, ECG)", "Géographie politique et économique (B/L, HGGMC en ECG)", "Méthode de la dissertation et du commentaire de documents"],
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
    "Lycée techno": ["Niveau B1 visé au Bac techno", "Axes thématiques communs avec le général (allégés)", "Vocabulaire lié à la filière (gestion, santé, industrie)", "Compréhension de documents authentiques simples", "Expression orale guidée (support visuel au Bac)"],
    "Lycée pro": ["Niveau A2 à B1 selon filière", "Anglais appliqué au métier (vocabulaire professionnel)", "Compréhension orale sur audio courts", "Expression orale de base (présentation de soi, du métier)", "CCF à l'oral"],
    "BTS / IUT": ["Niveau B2 visé en fin de BTS/BUT", "Anglais professionnel lié à la filière (commerce, informatique, industrie)", "Compréhension de documents techniques et de presse", "Expression orale en situation professionnelle", "Rédaction de mails et rapports courts"],
    "Prépa": ["Niveau C1 visé", "Version (traduction anglais→français) et thème (français→anglais)", "Dissertation en anglais sur un sujet de civilisation", "Synthèse de documents de presse anglo-saxonne", "Oral sur article de presse avec analyse"],
  },
  "Espagnol": {
    "Collège": ["Présent, prétérit, futur simples", "Ser/Estar", "Vocabulaire quotidien", "Pays hispanophones"],
    "Lycée général": ["Niveau B2 visé", "Subjonctif présent et imparfait", "Concordance des temps", "Civilisation hispanique"],
    "Lycée techno": ["Niveau B1 visé au Bac techno", "Subjonctif présent (initiation)", "Vocabulaire de la vie courante et professionnelle", "Compréhension de documents simples sur le monde hispanophone"],
    "Lycée pro": ["Niveau A2 à B1", "Espagnol appliqué au métier", "Vocabulaire professionnel de base", "Expression orale courte"],
    "BTS / IUT": ["Niveau B2 visé", "Espagnol des affaires ou technique selon filière", "Compréhension de documents professionnels", "Expression écrite et orale en situation pro"],
    "Prépa": ["Niveau C1 visé", "Version et thème (ECG, khâgne LV1/LV2)", "Civilisation hispanique contemporaine", "Synthèse de documents et essai argumenté"],
  },
  "Allemand": {
    "Collège": ["Présent, prétérit", "Déclinaisons (nominatif, accusatif)", "Verbes à particule", "Vocabulaire quotidien"],
    "Lycée général": ["Niveau B2 visé", "Subjonctif (Konjunktiv)", "Tournures complexes", "Civilisation allemande"],
    "Lycée techno": ["Niveau B1 visé au Bac techno", "Déclinaisons (nom, acc, datif)", "Subordonnées courantes", "Vocabulaire de la vie courante et du monde professionnel"],
    "Lycée pro": ["Niveau A2 à B1", "Allemand appliqué au métier", "Vocabulaire professionnel de base", "Expression orale courte"],
    "BTS / IUT": ["Niveau B2 visé", "Allemand des affaires ou technique", "Compréhension de documents professionnels", "Expression écrite et orale en situation pro"],
    "Prépa": ["Niveau C1 visé", "Version et thème (ECG, khâgne LV1/LV2)", "Civilisation allemande contemporaine (RFA, réunification, Europe)", "Synthèse de documents et essai argumenté"],
  },
  "Économie": {
    "Lycée général": ["Spé SES (voir SES)"],
    "Lycée techno": ["STMG : Sciences de gestion et numérique (1ère)", "STMG : spé Management, Gestion-finance, Mercatique, Ressources humaines, Systèmes d'information (Tle)", "Économie appliquée à la gestion d'entreprise", "Analyse financière de base"],
    "Lycée pro": ["Économie-Droit en BTS Tertiaires", "Notions de marché, entreprise, consommation", "Environnement économique de l'entreprise"],
    "BTS / IUT": ["Économie générale (BTS Tertiaires, BUT GEA, BUT TC)", "Analyse économique de l'entreprise", "Marchés, concurrence, politiques publiques", "Économie internationale (commerce)"],
    "Prépa": ["ECG voie éco : ESH (Économie, Sociologie, Histoire du monde contemporain)", "ECG voie maths appliquées : HGGMC + Maths appliquées", "B/L : Économie générale + Sociologie", "Khâgne B/L : Sciences économiques et sociales"],
    "Université": ["Microéconomie", "Macroéconomie", "Statistiques", "Histoire de la pensée économique"],
  },
  "Informatique": {
    "Lycée général": {
      "Seconde (SNT)": ["Internet, web, réseaux sociaux", "Données structurées", "Photo numérique", "Cartographie"],
      "Première (spé NSI)": ["Histoire de l'informatique", "Représentation des données", "Types construits", "Langages et programmation (Python)", "Algorithmes de tri"],
      "Terminale (spé NSI)": ["Structures de données (listes, arbres, graphes)", "Bases de données (SQL)", "Programmation orientée objet", "Algorithmique avancée"],
    },
    "Lycée techno": ["Bureautique avancée", "Notions de bases de données", "Réseaux d'entreprise", "Systèmes d'information de gestion (STMG)"],
    "Lycée pro": ["Bureautique (traitement de texte, tableur)", "Usages numériques professionnels selon filière", "Initiation aux bases de données (Bac pro GA, SN)", "Réseaux et maintenance (Bac pro SN)"],
    "BTS / IUT": ["BTS SIO SLAM : développement (Java, C#, PHP, SQL)", "BTS SIO SISR : réseaux, systèmes, cybersécurité", "BUT Informatique : algorithmique, programmation, web, bases de données, projets tutorés", "Génie logiciel et méthodes agiles"],
    "Université": ["Algorithmique", "Programmation (Python, Java, C)", "Bases de données", "Systèmes d'exploitation", "Réseaux"],
  },
  "Technologie": {
    "Collège": {
      "6e": ["Découverte du monde technique", "Objets techniques du quotidien", "Initiation aux outils numériques"],
      "5e-3e": ["Conception et fabrication d'objets", "Programmation (Scratch, robotique)", "Énergie et environnement", "Modélisation 3D", "Informatique et sciences du numérique"],
    },
  },
  "Droit": {
    "Lycée techno": ["Droit civil de base (contrats, responsabilité)", "Droit du travail (contrat de travail, salariés)", "Droit commercial (entreprises, commerçants)", "Notion de droit social et fiscal", "Spécifique STMG : Droit appliqué à la gestion"],
    "Lycée pro": ["Droit du travail (BTS Tertiaires)", "Droit commercial (Commerce/Vente)", "Droit social (RH/Assistanat)"],
    "BTS / IUT": ["Droit civil et droit commercial", "Droit du travail", "Droit fiscal de base"],
    "Université": ["Droit civil (personnes, contrats, responsabilité)", "Droit constitutionnel", "Droit administratif", "Droit pénal", "Droit du travail", "Droit commercial"],
  },
};

// ─── DÉTAILS PÉDAGOGIQUES par matière + niveau ───
// Pour chaque combinaison : objectifs de l'année, compétences évaluées,
// points difficiles classiques, conseils Sherpas pour la prescription.
export const PROGRAMME_DETAILS = {
  "Maths": {
    "Collège": {
      objectifs: "Construire le sens des nombres et des opérations, développer le raisonnement logique, manipuler les outils géométriques de base, préparer le brevet en 3e.",
      competences: ["Calculer (mental, écrit, posé)", "Raisonner et argumenter (démonstrations en 4e-3e)", "Modéliser des situations concrètes", "Utiliser le numérique (Geogebra, calculatrice)"],
      difficultes: ["La gestion des nombres relatifs (4e)", "Le calcul littéral (factorisation, développement)", "Le passage au raisonnement abstrait (Thalès, Pythagore)", "La trigonométrie (3e)"],
      conseils: "Au collège, l'enjeu n'est pas de tout savoir mais de bien comprendre les bases. Un prof patient qui prend le temps de manipuler avant d'abstraire est idéal. Méfiance avec les profs trop académiques qui foncent dans les exercices.",
    },
    "Lycée général": {
      objectifs: "Préparer aux études supérieures scientifiques et économiques. La spé Maths en 1ère/Tle est exigeante : niveau attendu très supérieur au tronc commun.",
      competences: ["Calcul algébrique avancé", "Analyse (dérivation, intégration, limites)", "Probabilités et statistiques", "Démonstration rigoureuse", "Géométrie dans l'espace (Tle)"],
      difficultes: ["La transition Seconde→Première spé (chute brutale du niveau)", "Les suites et la récurrence (Première)", "L'intégration et les primitives (Tle)", "Les démonstrations formelles", "Les probabilités conditionnelles (théorème de Bayes)"],
      conseils: "En spé Maths, ne JAMAIS prendre de retard — ça se rattrape difficilement. Pour Terminale, vise un étudiant en école d'ingénieurs ou en prépa MP/PC qui a passé le bac il y a 2-3 ans. Évite les profs EN classiques sauf si la famille cherche du rattrapage de bases.",
    },
    "Lycée techno": {
      objectifs: "Consolider les bases mathématiques et les appliquer à un contexte professionnel (gestion, industrie, santé, labo). Le niveau est moins abstrait qu'en général.",
      competences: ["Calcul numérique et algébrique appliqué", "Lecture et construction de graphiques", "Statistiques descriptives et probabilités", "Utilisation de la calculatrice et du tableur", "Résolution de problèmes concrets liés à la filière"],
      difficultes: ["Le décalage entre les maths 'théoriques' et les applications attendues", "La dérivation et l'intégration (plus poussées en STI2D/STL)", "Les statistiques inférentielles", "La rigueur de rédaction exigée au Bac"],
      conseils: "Pour le techno, l'erreur classique est de prendre un prof 'top niveau' qui va trop vite. Préférer un étudiant en BUT scientifique, école d'ingé post-bac (INSA, UTC) ou ancien élève de techno qui a réussi — il comprendra les attentes réalistes.",
    },
    "Lycée pro": {
      objectifs: "Consolider les bases de calcul et de raisonnement pour les besoins du métier. Les maths pro sont très appliquées (chantier, atelier, vente...).",
      competences: ["Calcul de pourcentages, proportions, échelles", "Géométrie appliquée (surfaces, volumes)", "Lecture de graphiques et tableaux", "Statistiques de base", "Résolution de problèmes contextualisés au métier"],
      difficultes: ["Le manque de bases du collège chez beaucoup d'élèves", "Le passage du concret à l'abstrait", "La confiance en soi (souvent cassée par l'échec antérieur)"],
      conseils: "Au lycée pro, la pédagogie est PLUS importante que le niveau du prof. Privilégier un étudiant BUT, BTS ou école d'ingé post-bac avec du recul humain — et surtout patient. Éviter les profils 'prépa' trop théoriques.",
    },
    "BTS / IUT": {
      objectifs: "Maîtriser les outils mathématiques nécessaires à la filière (info, GMP, compta, électronique...). Le niveau et le contenu varient fortement selon la spécialité.",
      competences: ["Analyse et dérivation appliquées", "Algèbre linéaire (pour BUT Info, GMP)", "Statistiques et probabilités appliquées", "Mathématiques financières (BTS Compta, Banque)", "Calcul matriciel et optimisation"],
      difficultes: ["L'écart entre le lycée et la rigueur attendue en BUT", "L'algèbre linéaire abstraite (BUT Info)", "L'application au contexte métier qui déroute les élèves", "Les statistiques en BTS tertiaires"],
      conseils: "Cibler un étudiant ayant fait la même filière ou une école d'ingé. Pour BUT Info, un étudiant en école d'ingé info ou en master maths-info. Pour BTS Compta, quelqu'un en DCG/DSCG ou école de commerce.",
    },
    "Prépa": {
      objectifs: "Préparer les concours des grandes écoles (X, Mines, Centrale, ENS...). Niveau extrêmement élevé, rythme intense.",
      competences: ["Algèbre linéaire avancée", "Analyse (séries, fonctions de plusieurs variables)", "Topologie", "Probabilités", "Démonstration rigoureuse et rédaction soignée"],
      difficultes: ["La densité du programme", "La rapidité d'exécution exigée", "La rédaction au niveau concours", "La gestion du stress aux khôlles"],
      conseils: "Pour la prépa, SEUL un étudiant ayant fait la même filière convient (MPSI/MP, PCSI/PC...). Idéalement quelqu'un en école après concours. Les profs EN sont rarement adaptés.",
    },
  },
  "Physique": {
    "Collège": {
      objectifs: "Découvrir les phénomènes physiques de base, manipuler en TP, relier observations et explications scientifiques.",
      competences: ["Observer et décrire", "Mesurer et calculer (formules simples)", "Schématiser un circuit ou une expérience", "Utiliser le vocabulaire scientifique"],
      difficultes: ["Distinguer poids et masse", "L'électricité (intensité, tension, résistance)", "Les unités de mesure et conversions"],
      conseils: "Au collège, on est encore dans la découverte. L'essentiel est de donner le goût des sciences. Un étudiant en école d'ingénieurs ou en sciences fait très bien l'affaire.",
    },
    "Lycée général": {
      objectifs: "En spé Physique-Chimie, préparer les études scientifiques supérieures (médecine, ingénierie, recherche). Programme dense mêlant physique et chimie.",
      competences: ["Modéliser un phénomène", "Résoudre une équation différentielle (Tle)", "Maîtriser les ondes (acoustique, optique)", "Comprendre les transferts énergétiques", "Pratique expérimentale rigoureuse"],
      difficultes: ["Mécanique avancée (forces, énergie, mouvements complexes)", "Optique géométrique et ondulatoire", "Thermodynamique (Tle)", "L'écart entre cours théorique et exercices d'application"],
      conseils: "En spé Physique-Chimie, les exercices types du Bac sont prévisibles : un bon prof connaît les annales et entraîne sur les sujets type. Cible un étudiant en école d'ingé (Centrale, Mines) ou en prépa PC.",
    },
    "Prépa": {
      objectifs: "Maîtriser les bases théoriques et expérimentales pour les concours (X, Mines, Centrale, ENS). Rigueur mathématique et intuition physique.",
      competences: ["Mécanique classique et du solide", "Électromagnétisme (équations de Maxwell en PC/PSI)", "Thermodynamique et machines thermiques", "Optique géométrique et ondulatoire", "Physique quantique (PC/PSI)", "Rédaction et démonstration rigoureuse au niveau concours"],
      difficultes: ["L'électromagnétisme (formalisme mathématique lourd)", "La thermodynamique (conventions et signes)", "La rapidité d'exécution aux concours", "L'articulation entre math et physique"],
      conseils: "Un étudiant ayant fait la MÊME filière (PCSI/PC, MPSI/MP, PTSI/PT) est indispensable. Idéalement en école après les concours (X, Centrale, Mines, ENS). Les profs EN sont rarement au niveau concours.",
    },
  },
  "Chimie": {
    "Lycée général": {
      objectifs: "Comprendre la matière à l'échelle moléculaire, prévoir les transformations, réaliser des synthèses organiques (Tle).",
      competences: ["Écrire et équilibrer une équation chimique", "Calculer des concentrations et des quantités de matière", "Maîtriser la nomenclature organique", "Comprendre la cinétique et les équilibres"],
      difficultes: ["La nomenclature organique (Tle)", "Les acides-bases et le pH", "L'oxydoréduction et les piles", "La cinétique chimique"],
      conseils: "En Tle, la chimie est un peu plus 'apprentissage' que la physique. Un étudiant en pharmacie, médecine ou école de chimie fait très bien l'affaire. La rigueur d'écriture est clé.",
    },
    "Prépa": {
      objectifs: "Construire les fondements de la chimie générale et organique pour les concours. Rigueur et capacité à mécaniser des réactions.",
      competences: ["Atomistique et liaison chimique", "Thermodynamique et cinétique chimique", "Chimie des solutions (acides-bases, oxydoréduction, complexation)", "Chimie organique (mécanismes réactionnels, stéréochimie)", "Cristallographie (BCPST/PC)"],
      difficultes: ["Les mécanismes en chimie organique (nombreux et à mémoriser finement)", "La cinétique formelle", "La stéréochimie", "Les diagrammes E-pH et potentiel-pH"],
      conseils: "Pour la prépa PC ou BCPST, cibler un étudiant ayant réussi les concours (ENS, Mines, Centrale, AgroParisTech, ENSCM, Chimie ParisTech). La chimie orga demande de la pratique intensive et un prof qui connaît les annales.",
    },
  },
  "SVT": {
    "Collège": {
      objectifs: "Comprendre le vivant, le corps humain, la planète Terre. Le programme prépare aussi à l'éducation à la santé et à l'environnement.",
      competences: ["Observer et identifier (cellules, organes, écosystèmes)", "Lire un graphique ou un tableau", "Construire un raisonnement scientifique simple"],
      difficultes: ["La génétique (3e) — vocabulaire ADN, allèles, gènes", "Le système immunitaire (3e)", "L'évolution des espèces"],
      conseils: "La SVT au collège n'est généralement pas la matière la plus problématique. Un étudiant en médecine, en école d'ingé biotech ou en bio fait l'affaire.",
    },
    "Lycée général": {
      objectifs: "En spé SVT, préparer médecine, pharma, vétérinaire, kiné, sciences de la vie. Programme exigeant en biologie cellulaire et géologie.",
      competences: ["Maîtriser le vocabulaire scientifique précis", "Lire et analyser des documents scientifiques (graphiques, schémas, photos)", "Argumenter à partir de données expérimentales", "Construire un raisonnement structuré"],
      difficultes: ["La génétique moléculaire (transcription, traduction, mitose, méiose)", "L'immunologie", "La géologie (tectonique, climats anciens)", "La rédaction structurée à l'épreuve du Bac"],
      conseils: "Pour la spé SVT en Tle, idéal : étudiant en médecine PASS/LAS ou en école d'ingé bio (AgroParisTech, ENSAT). Les bilingues doivent maîtriser le vocabulaire technique.",
    },
    "Prépa": {
      objectifs: "En BCPST, maîtriser une biologie et une géologie d'un niveau L2-L3 pour les concours (AgroParisTech, ENS Bio, véto). Programme très dense.",
      competences: ["Biologie cellulaire et moléculaire fine", "Génétique formelle et moléculaire", "Physiologie animale et végétale", "Écologie et évolution", "Géologie (tectonique, pétrographie, paléontologie)", "Travaux pratiques (TP de biologie et géologie notés)"],
      difficultes: ["Le volume de connaissances à mémoriser", "La rigueur attendue aux TP (dessins, observations)", "La géologie (souvent la matière la moins aimée)", "La rédaction de synthèses à partir de documents"],
      conseils: "Uniquement un ancien BCPST passé en école (AgroParisTech, ENS, véto, ENSAT). Un étudiant en médecine ou en L3 bio NE SUFFIT PAS — le programme de prépa est très spécifique.",
    },
  },
  "Français": {
    "Collège": {
      objectifs: "Lire et comprendre des œuvres variées, écrire correctement, s'exprimer à l'oral, préparer le brevet en 3e.",
      competences: ["Compréhension de textes (questions de lecture)", "Rédaction (récit, description, argumentation)", "Grammaire et orthographe", "Vocabulaire et culture littéraire"],
      difficultes: ["L'analyse littéraire (figures de style, thèmes)", "La rédaction structurée", "L'orthographe (homophones, accords)", "La conjugaison (passé simple, subjonctif)"],
      conseils: "Au collège, le français est très formel — on évalue beaucoup l'orthographe et la rédaction. Un étudiant en lettres ou en hypokhâgne est idéal. Pour les enfants en grande difficulté, un prof EN classique peut être utile.",
    },
    "Lycée général": {
      objectifs: "En 1ère, préparer les épreuves anticipées de français au Bac (écrit + oral). Lecture des œuvres au programme, méthode du commentaire et de la dissertation.",
      competences: ["Commentaire composé (analyse littéraire structurée)", "Dissertation littéraire", "Contraction de texte (séries technologiques)", "Oral du Bac (24 textes étudiés à présenter)"],
      difficultes: ["La méthode du commentaire (problématique, plan, argumentation)", "L'analyse fine d'un texte court", "La dissertation littéraire avec citations", "Tenir 20 min à l'oral du Bac"],
      conseils: "Pour les épreuves anticipées de français, l'idéal est un étudiant en hypokhâgne/khâgne ou en lettres modernes (L3+). La méthode est essentielle — même un bon élève peut bloquer sans la technique du commentaire.",
    },
    "Lycée techno": {
      objectifs: "Préparer les épreuves anticipées du Bac techno (écrit + oral). Programme allégé (3 œuvres) et épreuve écrite spécifique : contraction de texte + essai.",
      competences: ["Contraction de texte (résumé au quart)", "Essai argumenté court en lien avec le texte", "Oral du Bac (16 textes étudiés)", "Question de grammaire à l'oral"],
      difficultes: ["La contraction de texte (exercice très technique)", "L'essai qui attend une argumentation structurée", "L'oral (16 textes à maîtriser)", "La question de grammaire (surprend beaucoup d'élèves)"],
      conseils: "Pour les épreuves anticipées en techno, cibler un étudiant en lettres modernes ou hypokhâgne qui a l'habitude de la méthode spécifique au techno (différente du général). Un ancien élève de techno qui a eu son Bac est souvent idéal car il connaît les attentes réalistes.",
    },
    "Lycée pro": {
      objectifs: "Consolider les bases de la rédaction, de la lecture et de l'expression orale pour le Bac pro. Programme allégé axé sur l'utile.",
      competences: ["Rédaction de textes courts (récit, article, lettre)", "Lecture d'œuvres et de groupements de textes", "Expression orale (présentations, débats)", "Orthographe et grammaire fonctionnelles"],
      difficultes: ["L'orthographe (grosses lacunes fréquentes)", "La structuration d'un texte argumentatif", "Le manque de lecture préalable"],
      conseils: "Pour le pro, la pédagogie prime : un étudiant en lettres avec beaucoup de patience et de bienveillance. Éviter les profils 'littéraires exigeants' qui peuvent décourager.",
    },
    "BTS / IUT": {
      objectifs: "Réussir l'épreuve de Culture Générale et Expression (commune à tous les BTS). 2 thèmes annuels, synthèse de documents et écriture personnelle.",
      competences: ["Synthèse de 3-4 documents en 3h (méthode très codifiée)", "Écriture personnelle argumentée (30-40 lignes)", "Culture générale liée aux thèmes annuels", "Rigueur rédactionnelle"],
      difficultes: ["La méthode de la synthèse (très spécifique, rien à voir avec le lycée)", "La gestion du temps (3h = serré)", "La culture générale sur les thèmes au programme", "Le passage de l'avis personnel à l'argumentation"],
      conseils: "Pour le BTS, la méthode est TOUT. Cibler un étudiant en lettres, hypokhâgne, ou un ancien élève de BTS qui a eu une bonne note en Culture Générale. Les annales corrigées sont indispensables.",
    },
    "Prépa": {
      objectifs: "Réussir l'épreuve de Français-Philo en prépa scientifique (X, Centrale, Mines) ou commerciale (HEC, ESSEC). 2 œuvres à connaître finement sur un thème commun.",
      competences: ["Dissertation sur les œuvres au programme (4h)", "Résumé de texte (ECG/ECT, parfois X)", "Culture littéraire et philosophique approfondie", "Maîtrise d'un thème commun (ex : 'le monde', 'le mal', 'la parole')"],
      difficultes: ["La densité des œuvres à connaître par cœur", "Le passage de l'analyse au problème philosophique", "Les attentes très différentes selon les concours (X vs HEC)", "La rédaction en temps limité"],
      conseils: "Pour les prépas scientifiques, cibler un étudiant d'école d'ingé qui a eu une bonne note en F-Philo, ou un khâgneux. Pour les prépas ECG/HEC, un normalien ou un étudiant à HEC/ESSEC qui a réussi cette épreuve.",
    },
  },
  "Philosophie": {
    "Lycée général": {
      objectifs: "En Terminale, apprendre à problématiser, argumenter et écrire un raisonnement philosophique. Pas de connaissances à apprendre par cœur, mais à mobiliser.",
      competences: ["Dissertation philosophique (introduction, plan, argumentation, conclusion)", "Explication de texte (analyse linéaire d'un extrait)", "Mobiliser les notions et auteurs", "Pensée critique et argumentation"],
      difficultes: ["La problématisation (transformer une question en problème)", "Construire un plan dialectique", "Mobiliser les bons auteurs au bon moment", "Rédiger 4-6 pages structurées en 4h"],
      conseils: "La philo Tle est très spécifique : c'est moins une question de QI qu'une question de méthode. Un étudiant en khâgne (ENS Lettres) ou en master philo est l'idéal absolu. Les profs EN agrégés sont aussi excellents.",
    },
    "Lycée techno": {
      objectifs: "Préparer l'épreuve de philo du Bac techno avec un programme allégé (8 notions au lieu de 17). Les sujets sont plus guidés et le niveau attendu plus accessible.",
      competences: ["Dissertation sur un sujet guidé (avec pistes)", "Explication de texte sur un extrait court", "Mobiliser quelques notions clés", "Rédiger un raisonnement structuré sur 3-4 pages"],
      difficultes: ["La problématisation (même allégée, elle reste difficile)", "L'organisation d'un plan", "Le vocabulaire philosophique", "La rédaction sous contrainte de temps"],
      conseils: "Pour la philo en techno, cibler un étudiant en khâgne ou en master philo, mais capable de pédagogie simple. Éviter les profils trop abstraits — viser quelqu'un qui sait vulgariser. Les annales techno sont indispensables.",
    },
  },
  "Histoire-Géo": {
    "Collège": {
      objectifs: "Connaître les grandes périodes historiques, comprendre les enjeux géographiques contemporains, préparer le brevet HG-EMC en 3e.",
      competences: ["Mémoriser des dates et personnages clés", "Lire et analyser un document (carte, image, texte)", "Rédiger un développement court structuré", "Construire une chronologie"],
      difficultes: ["La densité du programme (volume à mémoriser)", "L'analyse de documents au brevet", "La géographie (cartographie, vocabulaire spécifique)"],
      conseils: "L'HG au collège demande surtout de la mémorisation structurée. Un étudiant en histoire, géographie ou Sciences Po est idéal.",
    },
    "Lycée général": {
      objectifs: "Préparer les épreuves du Bac (en spé HGGSP ou tronc commun). Maîtriser des chronologies complexes et l'analyse de documents.",
      competences: ["Composition (sujet long de type Bac)", "Étude de documents (analyse critique, mise en perspective)", "Croquis de géographie", "Argumentation historique avec exemples précis"],
      difficultes: ["La densité chronologique du programme de Tle (1930 → aujourd'hui)", "Le passage de la mémorisation à l'analyse", "Les croquis de géographie au Bac"],
      conseils: "Pour HG en Tle, un étudiant en hypokhâgne, à Sciences Po, ou en master histoire-géo est parfait. Pour HGGSP en spé, viser un Sciences Po ou ENS Lettres-SHS.",
    },
    "Lycée techno": {
      objectifs: "Maîtriser les grandes lignes de l'histoire contemporaine et de la géographie mondialisée, en version allégée par rapport au général.",
      competences: ["Mémoriser les dates et notions clés (programme allégé)", "Étude de documents (méthode simplifiée)", "Rédaction d'un court développement", "Vocabulaire géographique et historique de base"],
      difficultes: ["La densité du programme malgré l'allègement", "La méthode de l'étude de documents", "Le vocabulaire spécifique"],
      conseils: "Un étudiant en histoire, géographie ou Sciences Po convient parfaitement. La clé est la méthode et la mémorisation structurée — éviter les profils trop académiques qui en feraient trop.",
    },
    "Lycée pro": {
      objectifs: "Maîtriser les repères historiques et géographiques essentiels pour la citoyenneté et le Bac pro. Programme très allégé.",
      competences: ["Repères chronologiques de la Révolution à nos jours", "Lecture de cartes et documents simples", "Étude de cas concrets", "Éducation civique (EMC)"],
      difficultes: ["Le manque de repères préalables", "La mémorisation sans méthode"],
      conseils: "Un étudiant en histoire-géo ou Sciences Po, avec une approche pédagogique simple et concrète. Privilégier l'étude de cas et les supports visuels (cartes, vidéos).",
    },
    "Prépa": {
      objectifs: "En khâgne A/L ou B/L, maîtriser un programme de plusieurs siècles d'histoire et de géographie pour les concours des ENS. En ECG, préparer l'épreuve d'HGGMC (Histoire, Géographie, Géopolitique du Monde Contemporain).",
      competences: ["Dissertation d'histoire sur plusieurs siècles", "Commentaire de documents (cartes, textes, images)", "Maîtrise d'une historiographie précise", "Culture géopolitique contemporaine (ECG)"],
      difficultes: ["Le volume gigantesque de connaissances", "La maîtrise de l'historiographie (auteurs, courants)", "La dissertation de géopolitique (ECG)", "La synthèse rapide au concours"],
      conseils: "Pour A/L ou B/L, cibler un étudiant normalien (ENS Ulm, Lyon, Cachan) ou à Sciences Po. Pour ECG HGGMC, un étudiant à HEC/ESSEC/ESCP qui a eu une bonne note est idéal. Un prof EN agrégé peut aussi convenir.",
    },
  },
  "SES": {
    "Lycée général": {
      objectifs: "En spé SES, préparer les études d'économie, sociologie, sciences politiques, écoles de commerce. Programme exigeant en raisonnement et rédaction.",
      competences: ["Maîtriser les concepts économiques (marché, prix, monnaie...)", "Comprendre les mécanismes sociaux (déviance, intégration, mobilité)", "Lire et interpréter des données statistiques", "Construire une dissertation argumentée"],
      difficultes: ["La distinction entre approche micro et macro-économique", "Les statistiques (taux de variation, élasticité, indices)", "La dissertation type Bac", "Mémoriser auteurs et théories"],
      conseils: "Pour la spé SES, idéal : étudiant en prépa ECG, à Sciences Po, ou en école de commerce post-prépa. Les profs EN agrégés en SES sont aussi très efficaces.",
    },
  },
  "Anglais": {
    "Collège": {
      objectifs: "Atteindre le niveau A2 en fin de 5e et B1 en fin de 3e. Compréhension orale/écrite, expression orale/écrite simples.",
      competences: ["Vocabulaire de la vie courante (~1500 mots)", "Grammaire de base (présent, passé, futur, modaux)", "Compréhension orale (accents standards)", "Petite expression écrite (mails, descriptions)"],
      difficultes: ["La prononciation (notamment 'th', sons longs/courts)", "Les modaux (can, must, should, would...)", "Les temps du passé (preterit vs present perfect)", "La compréhension orale sur audio rapide"],
      conseils: "Au collège, un étudiant bilingue ou en LEA suffit. L'oral est souvent le point faible — favoriser un prof qui fait parler beaucoup l'élève.",
    },
    "Lycée général": {
      objectifs: "Atteindre le niveau B2 (parfois C1) en fin de Terminale. Maîtriser les 4 compétences (CO, CE, EO, EE) au niveau Bac.",
      competences: ["Vocabulaire thématique avancé (~3000-4000 mots)", "Grammaire complète (subjonctif, conditionnels, voix passive)", "Compréhension de documents authentiques (presse, vidéos)", "Expression orale en interaction et en continu"],
      difficultes: ["La fluidité orale et l'accent", "Les structures complexes (would have, could have...)", "La rédaction d'essais argumentés", "Pour la spé LLCE Anglais : analyse littéraire en anglais"],
      conseils: "Pour le lycée, idéal : étudiant en LEA, LLCER, école de commerce internationale ou Sciences Po. Pour la spé LLCE, prendre quelqu'un en master anglais ou agrégé.",
    },
    "Lycée techno": {
      objectifs: "Atteindre le niveau B1 (parfois B2) au Bac techno. L'oral est important (support visuel imposé à l'épreuve).",
      competences: ["Vocabulaire lié à la filière techno (management, santé, industrie)", "Grammaire de base maîtrisée", "Compréhension de documents authentiques simples", "Expression orale guidée par un document"],
      difficultes: ["L'oral du Bac techno avec document imposé", "Le vocabulaire technique de la filière", "La fluidité orale"],
      conseils: "Un étudiant bilingue, en LEA ou en école de commerce fait très bien l'affaire. L'essentiel est de faire beaucoup pratiquer l'oral à partir de documents type Bac techno.",
    },
    "Lycée pro": {
      objectifs: "Atteindre le niveau A2-B1 au Bac pro. Anglais appliqué au métier (vocabulaire professionnel, situations concrètes).",
      competences: ["Vocabulaire professionnel de la filière", "Phrases simples en situation pro", "Compréhension d'audios courts", "Expression orale de base (se présenter, présenter son métier)"],
      difficultes: ["Le manque de bases du collège", "La confiance à l'oral", "La prononciation"],
      conseils: "Pour le lycée pro, viser un étudiant patient et pédagogue. Un bilingue ou un étudiant en LEA avec une approche concrète et bienveillante. Éviter les profils trop académiques.",
    },
    "BTS / IUT": {
      objectifs: "Atteindre le niveau B2 à la sortie du BTS/BUT. Anglais professionnel avec vocabulaire lié à la filière (commerce, informatique, industrie, tourisme).",
      competences: ["Vocabulaire professionnel spécialisé (business, IT, engineering...)", "Rédaction de mails professionnels et de rapports courts", "Compréhension de documents techniques ou de presse", "Expression orale en situation professionnelle (réunions, présentations)"],
      difficultes: ["Le passage de l'anglais général à l'anglais professionnel", "La rédaction d'un rapport ou d'un mail professionnel", "La présentation orale en anglais (soutenance)"],
      conseils: "Un étudiant en école de commerce internationale, LEA, ou un bilingue ayant une expérience professionnelle est idéal. Pour les filières techniques, privilégier quelqu'un ayant l'habitude du vocabulaire technique.",
    },
    "Prépa": {
      objectifs: "Atteindre le niveau C1 pour les concours (X, Centrale, Mines, ENS, HEC). Version, thème, dissertation et synthèse sont exigés.",
      competences: ["Version (traduction anglais→français exigeante)", "Thème (français→anglais, idioms)", "Dissertation ou synthèse sur un sujet de civilisation", "Analyse d'articles de presse anglo-saxonne", "Oral sur article de presse"],
      difficultes: ["La traduction en version (registre, fidélité)", "Le thème (idiomatisme, structure)", "La culture anglo-saxonne exigée aux concours", "La fluidité orale au niveau concours"],
      conseils: "Cibler un ancien préparationnaire qui a eu de bonnes notes en anglais aux concours (khâgne LV1 anglais, HEC, Sciences Po, ENS Ulm). Un bilingue anglais ayant fait des études supérieures en France (pour connaître les attentes françaises) est idéal.",
    },
  },
  "Espagnol": {
    "Collège": {
      objectifs: "Atteindre le niveau A2 en fin de 4e et B1 en fin de 3e. LV2 commencée en 5e.",
      competences: ["Vocabulaire de la vie courante", "Conjugaison des verbes réguliers et irréguliers de base", "Différencier ser/estar", "Utiliser le passé simple (pretérito perfecto simple)"],
      difficultes: ["Ser vs Estar", "Les verbes à diphtongue (querer, poder...)", "Le subjonctif (apparaît dès la 4e)", "La prononciation (jota, ñ, accents)"],
      conseils: "Pour l'espagnol, un étudiant en LEA ou natif/bilingue est l'idéal. Pour la spé en Tle, un étudiant en master études hispaniques.",
    },
    "Lycée général": {
      objectifs: "Atteindre le niveau B2 en LV2. Maîtriser les 4 compétences au niveau Bac.",
      competences: ["Subjonctif présent et imparfait", "Concordance des temps (si + imparfait...)", "Vocabulaire de la civilisation hispanique", "Expression orale fluide en interaction"],
      difficultes: ["Le subjonctif imparfait", "La concordance des temps complexe", "La civilisation (Espagne et Amérique latine)"],
      conseils: "Pour le Bac, viser quelqu'un qui maîtrise vraiment le subjonctif et a une bonne connaissance de la culture hispanique (Sciences Po, master études hispaniques, LLCER).",
    },
    "Lycée techno": {
      objectifs: "Atteindre le niveau B1 au Bac techno en LV2 espagnol. Oral important avec document.",
      competences: ["Vocabulaire quotidien et professionnel simple", "Conjugaison présent, passé, futur", "Initiation au subjonctif", "Compréhension orale de supports authentiques"],
      difficultes: ["Le subjonctif qui arrive tard", "La différence ser/estar", "L'oral avec document imposé"],
      conseils: "Un étudiant bilingue, natif ou en LEA. L'approche doit rester concrète : bcp d'oral et peu de grammaire pure.",
    },
    "Lycée pro": {
      objectifs: "Atteindre le niveau A2-B1. Espagnol simple, appliqué à des situations concrètes liées au métier.",
      competences: ["Vocabulaire de base et professionnel", "Se présenter et présenter son métier", "Compréhension de consignes simples"],
      difficultes: ["Le manque de bases", "La confiance à l'oral"],
      conseils: "Un natif hispanophone ou un étudiant en LEA, pédagogue et patient.",
    },
    "BTS / IUT": {
      objectifs: "Atteindre le niveau B2. Espagnol des affaires ou technique selon la filière.",
      competences: ["Vocabulaire professionnel spécialisé", "Rédaction de documents professionnels simples", "Compréhension de documents de presse hispanique", "Expression orale en situation pro"],
      difficultes: ["Le vocabulaire technique", "La maîtrise du subjonctif en situation pro"],
      conseils: "Un étudiant en école de commerce avec une expérience à l'étranger (Erasmus Espagne/Amérique latine), ou natif.",
    },
    "Prépa": {
      objectifs: "Atteindre le niveau C1 pour les concours. Version, thème, dissertation de civilisation hispanique.",
      competences: ["Version et thème exigeants", "Dissertation sur civilisation (Espagne et Amérique latine)", "Synthèse d'articles de presse hispanique", "Oral sur article de presse"],
      difficultes: ["Le subjonctif imparfait et plus-que-parfait", "La culture hispanique contemporaine (politique, société)", "La traduction idiomatique"],
      conseils: "Cibler un normalien (ENS Lyon études hispaniques), un khâgneux LV espagnol, ou un bilingue ayant fait une prépa. La culture hispanique contemporaine est essentielle.",
    },
  },
  "Allemand": {
    "Collège": {
      objectifs: "Atteindre le niveau A2 en fin de 4e et B1 en fin de 3e. Souvent commencé en 5e (LV2) ou en 6e (LV1 ou bilangue).",
      competences: ["Présent et prétérit", "Cas grammaticaux : nominatif et accusatif", "Vocabulaire courant (~1000 mots)", "Compréhension orale sur audio standard"],
      difficultes: ["Les déclinaisons (le grand piège)", "Les verbes à particules séparables", "L'ordre des mots dans la subordonnée", "Le genre des noms (der/die/das)"],
      conseils: "L'allemand est notoirement difficile pour les déclinaisons. Idéal : étudiant en LEA, LLCER, étudiant français bilingue, ou natif allemand vivant en France.",
    },
    "Lycée général": {
      objectifs: "Atteindre le niveau B2 en LV2 (parfois C1 en bilangue). Maîtriser les 4 compétences au niveau Bac.",
      competences: ["Konjunktiv I et II (subjonctif)", "Toutes les déclinaisons (nom, accusatif, datif, génitif)", "Subordonnées complexes", "Civilisation allemande (Histoire, géographie politique)"],
      difficultes: ["Le Konjunktiv II (style indirect)", "Le génitif", "La rédaction d'essais structurés en allemand"],
      conseils: "Pour le Bac d'allemand, idéal : étudiant Sciences Po Berlin, master études germaniques, ou agrégé d'allemand.",
    },
    "Lycée techno": {
      objectifs: "Atteindre le niveau B1 en LV2 au Bac techno. Bases grammaticales solides et vocabulaire pro simple.",
      competences: ["Déclinaisons (nom, acc, datif)", "Présent et prétérit", "Subordonnées courantes", "Compréhension orale simple"],
      difficultes: ["Les déclinaisons (toujours le grand piège)", "L'ordre des mots", "La prononciation"],
      conseils: "Un natif allemand en France ou un étudiant en LEA. La rigueur des déclinaisons est essentielle mais il faut rester pédagogique.",
    },
    "Lycée pro": {
      objectifs: "Atteindre le niveau A2-B1. Allemand professionnel appliqué au métier (pour les régions frontalières notamment).",
      competences: ["Vocabulaire de base et pro", "Phrases simples", "Compréhension de consignes"],
      difficultes: ["Le manque de bases", "Les déclinaisons"],
      conseils: "Un natif allemand ou un étudiant en LEA, avec beaucoup de pédagogie et de patience.",
    },
    "BTS / IUT": {
      objectifs: "Atteindre le niveau B2. Allemand des affaires ou technique, très utile en région frontalière et pour le commerce international.",
      competences: ["Vocabulaire professionnel spécialisé", "Rédaction de documents pro", "Compréhension de documents de presse", "Expression orale pro"],
      difficultes: ["Les structures complexes (Konjunktiv II)", "Le vocabulaire technique"],
      conseils: "Un étudiant en école de commerce avec un Erasmus en Allemagne, ou un natif. Le bilinguisme est un vrai plus.",
    },
    "Prépa": {
      objectifs: "Atteindre le niveau C1 pour les concours. Version, thème, dissertation de civilisation allemande contemporaine.",
      competences: ["Version et thème exigeants", "Konjunktiv I et II maîtrisés", "Dissertation sur la civilisation (RFA, réunification, Europe)", "Synthèse d'articles de presse allemande", "Oral sur article de presse"],
      difficultes: ["Le Konjunktiv (style indirect complexe)", "Le génitif", "La culture allemande contemporaine (politique, société, histoire)"],
      conseils: "Cibler un normalien (ENS Ulm études germaniques), un khâgneux LV1 allemand, ou un bilingue germano-français ayant fait une prépa. L'agrégé d'allemand est l'idéal absolu.",
    },
  },
  "Économie": {
    "Lycée techno": {
      objectifs: "En STMG, maîtriser les sciences de gestion (1ère) puis une spécialité (Tle : Management, Gestion-finance, Mercatique, RH, SIG). L'approche est concrète, centrée sur l'entreprise.",
      competences: ["Analyser une situation d'entreprise", "Mobiliser les notions de gestion", "Lire un bilan, un compte de résultat (Gestion-finance)", "Comprendre la stratégie marketing (Mercatique)", "Étude de cas type Bac techno"],
      difficultes: ["Le volume de notions à mémoriser", "L'étude de cas au Bac (4h, très structurée)", "La distinction entre les spécialités (choisir en 1ère pour la Tle)"],
      conseils: "Pour STMG, cibler un étudiant en école de commerce post-bac (EMLyon, KEDGE, NEOMA) ou en BUT GEA/TC. Un ancien élève de STMG ayant réussi en école de commerce est idéal car il connaît le Bac techno.",
    },
    "Lycée pro": {
      objectifs: "Comprendre l'environnement économique et juridique de l'entreprise (BTS Tertiaires). Économie simple, appliquée.",
      competences: ["Notions d'entreprise, marché, concurrence", "Lire un document économique simple", "Analyser une situation concrète"],
      difficultes: ["Le vocabulaire économique", "L'analyse de documents"],
      conseils: "Un étudiant en BTS, BUT GEA, ou en école de commerce post-bac. La pédagogie doit rester concrète et liée à l'actualité.",
    },
    "BTS / IUT": {
      objectifs: "Maîtriser l'économie générale et l'économie d'entreprise pour les examens (BTS Tertiaires, BUT GEA, BUT TC). Épreuves de synthèse et analyse.",
      competences: ["Micro et macroéconomie appliquées", "Analyse des marchés et de la concurrence", "Politique économique", "Analyse d'articles et de documents"],
      difficultes: ["La rédaction de synthèses économiques", "La distinction entre approches théoriques", "L'application à des cas concrets"],
      conseils: "Un étudiant en école de commerce (EDHEC, EMLyon, HEC) ou en master économie. Pour BUT GEA, un ancien BUT ayant continué en école est idéal.",
    },
    "Prépa": {
      objectifs: "En ECG voie éco, maîtriser l'ESH (Économie, Sociologie, Histoire du monde contemporain). En B/L, économie générale et sociologie.",
      competences: ["Dissertation d'économie (ESH, 4h)", "Maîtrise des courants de pensée (classiques, keynésiens, monétaristes, néo-classiques)", "Culture historique et sociologique", "Synthèse d'arguments complexes"],
      difficultes: ["Le volume des auteurs à maîtriser", "La dissertation ESH (exigence méthodologique forte)", "L'articulation histoire-éco-socio", "La rédaction en temps limité"],
      conseils: "Cibler un étudiant à HEC, ESSEC ou ESCP ayant fait ECG voie éco avec une bonne note en ESH. Pour la B/L, un normalien (ENS Paris-Saclay, Ulm). Un prof EN agrégé en SES peut aussi convenir.",
    },
    "Université": {
      objectifs: "Comprendre les mécanismes économiques (micro et macro), maîtriser les outils mathématiques et statistiques, lire la pensée économique.",
      competences: ["Microéconomie (théorie du consommateur, du producteur, marchés)", "Macroéconomie (PIB, inflation, croissance, chômage)", "Statistiques et économétrie", "Histoire de la pensée économique"],
      difficultes: ["Les modèles mathématiques (calculs de dérivées partielles, optimisation)", "L'économétrie (régressions linéaires, tests)", "La distinction entre courants théoriques (classiques, keynésiens, monétaristes...)"],
      conseils: "Pour l'université, idéal : étudiant en master économie, à Dauphine ou en école de commerce post-prépa.",
    },
  },
  "Informatique": {
    "Lycée général": {
      objectifs: "En spé NSI, apprendre à programmer (Python), comprendre les algorithmes et structures de données, manipuler des bases de données.",
      competences: ["Programmation Python (variables, fonctions, boucles, conditions)", "Structures de données (listes, dictionnaires, arbres, graphes)", "Algorithmes de tri et de recherche", "Bases de données SQL", "Programmation orientée objet (Tle)"],
      difficultes: ["Le passage de l'algorithme au code", "La récursivité", "La complexité algorithmique", "Les structures de données avancées (arbres, graphes)"],
      conseils: "Pour la spé NSI, idéal : étudiant en école d'ingénieurs informatique (EPITA, INSA, CentraleSupélec), MIAGE, ou BUT info. La pratique du code est essentielle.",
    },
    "Lycée techno": {
      objectifs: "En STMG SIG (Systèmes d'information de gestion), comprendre les outils numériques de l'entreprise : bases de données, réseaux, ERP, bureautique avancée.",
      competences: ["Bases de données relationnelles (SQL de base)", "Bureautique avancée (tableur, requêtes)", "Réseaux d'entreprise (notions)", "Systèmes d'information de gestion", "Étude de cas type Bac"],
      difficultes: ["Le SQL (requêtes SELECT, JOIN)", "La modélisation de données (MCD)", "L'abstraction des SI"],
      conseils: "Un étudiant en BTS SIO, BUT Info, MIAGE ou école d'ingé info fait l'affaire. Privilégier quelqu'un qui a fait du SQL récemment.",
    },
    "Lycée pro": {
      objectifs: "Maîtriser les outils numériques professionnels (bureautique, bases de données simples, maintenance) selon la filière (Bac pro GA, SN, MELEC).",
      competences: ["Bureautique (Word, Excel)", "Initiation aux bases de données (Bac pro GA)", "Maintenance informatique (Bac pro SN)", "Usages pro du numérique"],
      difficultes: ["Le manque de bases en logique", "La confiance technique"],
      conseils: "Un étudiant en BTS SIO, BUT Info ou école post-bac. L'approche doit être très pratique et progressive.",
    },
    "BTS / IUT": {
      objectifs: "En BTS SIO ou BUT Info, maîtriser la programmation, les bases de données, les réseaux et la gestion de projet. Très pratique.",
      competences: ["Programmation (Java, C#, PHP, Python selon filière)", "SQL et bases de données relationnelles", "Développement web (HTML/CSS/JS, frameworks)", "Réseaux et systèmes (BTS SIO SISR, BUT Info R&T)", "Méthodes agiles et projets tutorés"],
      difficultes: ["La programmation orientée objet (POO)", "Les frameworks modernes (Spring, Symfony, React)", "La complexité algorithmique", "Les projets tutorés à rendre"],
      conseils: "Cibler un étudiant en école d'ingé info (EPITA, EPITECH, INSA, CentraleSupélec) ou en master info. Pour BTS SIO, un ancien BTS SIO passé en école est idéal. La pratique du code récente est essentielle.",
    },
    "Université": {
      objectifs: "Maîtriser les fondamentaux théoriques et pratiques de l'informatique pour aller vers l'ingénierie logicielle, la data science ou la recherche.",
      competences: ["Algorithmique avancée et complexité", "Programmation multi-langage (Python, Java, C, JavaScript)", "Bases de données relationnelles et NoSQL", "Réseaux et systèmes d'exploitation", "Mathématiques discrètes"],
      difficultes: ["L'algorithmique (notamment NP-complétude)", "Les systèmes d'exploitation (gestion mémoire, processus)", "La programmation système (C, pointeurs, mémoire)"],
      conseils: "Pour l'université, idéal : étudiant en master info, école d'ingénieurs informatique, ou doctorant en informatique.",
    },
  },
  "Technologie": {
    "Collège": {
      objectifs: "Découvrir le monde technique, les objets du quotidien, comprendre comment ils fonctionnent. Initier à la programmation et à la modélisation 3D dès la 5e.",
      competences: ["Identifier les fonctions d'un objet technique", "Programmer en Scratch (5e-3e)", "Modéliser en 3D (SketchUp, FreeCAD)", "Lire et créer un schéma technique", "Comprendre la chaîne d'énergie"],
      difficultes: ["Le passage de l'idée au schéma technique", "La programmation Scratch (logique algorithmique)", "Les unités d'énergie et de puissance"],
      conseils: "La techno au collège est très pratique — un étudiant en école d'ingénieurs (INSA, UTC, Polytech) ou en BUT GMP/Génie Civil est idéal. Évite les profs trop théoriques.",
    },
  },
  "Droit": {
    "Lycée techno": {
      objectifs: "En STMG (et un peu en STHR), comprendre le cadre juridique de l'entreprise et de la vie quotidienne. Le droit est étroitement lié à l'économie et au management.",
      competences: ["Identifier une situation juridique", "Qualifier juridiquement les faits", "Mobiliser une règle de droit", "Argumenter une solution juridique", "Analyser un contrat ou une décision de justice"],
      difficultes: ["Le vocabulaire juridique (très précis)", "La méthode du cas pratique", "Distinguer droit civil / droit commercial / droit du travail", "Mémoriser les articles de loi clés"],
      conseils: "Pour le droit en STMG, idéal : étudiant en Licence ou Master Droit, ou en école de commerce avec spécialisation juridique. La méthode est très rigoureuse — la pratique répétée d'études de cas est essentielle.",
    },
    "Lycée pro": {
      objectifs: "Comprendre les bases juridiques applicables à une activité professionnelle (droit du travail, droit commercial, droit social).",
      competences: ["Connaître ses droits en tant que salarié ou commerçant", "Lire un contrat de travail", "Identifier les obligations légales d'un commerçant"],
      difficultes: ["Le vocabulaire juridique", "Les règles du droit du travail (souvent contre-intuitives)"],
      conseils: "Un étudiant en Licence Droit ou en BTS Tertiaire (Notariat, Comptabilité-Gestion) fait très bien l'affaire.",
    },
    "Université": {
      objectifs: "Acquérir une formation juridique complète pour devenir avocat, juriste d'entreprise, magistrat, notaire ou pour s'orienter vers le master.",
      competences: ["Méthode du cas pratique", "Méthode du commentaire d'arrêt", "Dissertation juridique", "Analyse de la jurisprudence", "Maîtrise du Code civil et du Code du travail"],
      difficultes: ["Le volume de connaissances", "La méthode du commentaire d'arrêt (très spécifique)", "Le passage de L1 (très théorique) à L2 (plus pratique)", "Les partiels (3h-4h sans documents)"],
      conseils: "Pour la fac de droit, idéal : étudiant en M1/M2 Droit, ou un avocat junior. Les anciens étudiants d'Assas (Paris 2) sont particulièrement recherchés. Méthode = clé de la réussite.",
    },
  },
};

// Helper : recupere les details pedagogiques pour une matiere + niveau
export function getProgrammeDetails(matiere, niveau) {
  return PROGRAMME_DETAILS[matiere]?.[niveau] || null;
}

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
    // Match exact d'abord
    if (classe && n[classe]) return { __key: classe, items: n[classe], allClasses: n };
    // Match intelligent : on cherche une key qui contient la classe (ex: "5e" est dans "5e-3e" ou "5e-4e")
    if (classe) {
      const matched = Object.keys(n).find(k => k.includes(classe));
      if (matched) return { __key: matched, items: n[matched], allClasses: n };
    }
    // Fallback : première sous-classe trouvée
    const firstKey = Object.keys(n)[0];
    return { __key: firstKey, items: n[firstKey], allClasses: n };
  }
  return n;
}
