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
  },
  "Chimie": {
    "Lycée général": {
      objectifs: "Comprendre la matière à l'échelle moléculaire, prévoir les transformations, réaliser des synthèses organiques (Tle).",
      competences: ["Écrire et équilibrer une équation chimique", "Calculer des concentrations et des quantités de matière", "Maîtriser la nomenclature organique", "Comprendre la cinétique et les équilibres"],
      difficultes: ["La nomenclature organique (Tle)", "Les acides-bases et le pH", "L'oxydoréduction et les piles", "La cinétique chimique"],
      conseils: "En Tle, la chimie est un peu plus 'apprentissage' que la physique. Un étudiant en pharmacie, médecine ou école de chimie fait très bien l'affaire. La rigueur d'écriture est clé.",
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
  },
  "Philosophie": {
    "Lycée général": {
      objectifs: "En Terminale, apprendre à problématiser, argumenter et écrire un raisonnement philosophique. Pas de connaissances à apprendre par cœur, mais à mobiliser.",
      competences: ["Dissertation philosophique (introduction, plan, argumentation, conclusion)", "Explication de texte (analyse linéaire d'un extrait)", "Mobiliser les notions et auteurs", "Pensée critique et argumentation"],
      difficultes: ["La problématisation (transformer une question en problème)", "Construire un plan dialectique", "Mobiliser les bons auteurs au bon moment", "Rédiger 4-6 pages structurées en 4h"],
      conseils: "La philo Tle est très spécifique : c'est moins une question de QI qu'une question de méthode. Un étudiant en khâgne (ENS Lettres) ou en master philo est l'idéal absolu. Les profs EN agrégés sont aussi excellents.",
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
  },
  "Économie": {
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
    "Université": {
      objectifs: "Maîtriser les fondamentaux théoriques et pratiques de l'informatique pour aller vers l'ingénierie logicielle, la data science ou la recherche.",
      competences: ["Algorithmique avancée et complexité", "Programmation multi-langage (Python, Java, C, JavaScript)", "Bases de données relationnelles et NoSQL", "Réseaux et systèmes d'exploitation", "Mathématiques discrètes"],
      difficultes: ["L'algorithmique (notamment NP-complétude)", "Les systèmes d'exploitation (gestion mémoire, processus)", "La programmation système (C, pointeurs, mémoire)"],
      conseils: "Pour l'université, idéal : étudiant en master info, école d'ingénieurs informatique, ou doctorant en informatique.",
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
    if (classe && n[classe]) return n[classe];
    // Sinon renvoie la première sous-classe trouvée
    const firstKey = Object.keys(n)[0];
    return { __key: firstKey, items: n[firstKey], allClasses: n };
  }
  return n;
}
