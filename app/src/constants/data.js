export const INIT_STOCK=[
  {typ:"Étudiant grande école",dispo:true,nb:47,note:"Profil le plus demandé"},
  {typ:"Étudiant université",dispo:true,nb:134,note:"Très disponible toutes zones"},
  {typ:"Professeur EN",dispo:false,nb:3,note:"Stock très limité"},
  {typ:"AESH",dispo:false,nb:1,note:"Recrutement en cours"},
  {typ:"Professeur certifié",dispo:true,nb:12,note:"Disponible Paris/Lyon"},
  {typ:"Formateur",dispo:true,nb:8,note:"En ligne et domicile"},
];
export const INIT_SCRIPTS={
  intro:{title:"Introduction",color:"#16A34A",steps:[{label:"Accroche",text:"Bonjour [Prénom], c'est [Votre prénom] des Sherpas 👋 Avez-vous deux minutes ?"},{label:"Légitimité",text:"Je vous appelle car vous avez demandé des informations sur nos cours particuliers."},{label:"Ordre du jour",text:"Mon objectif est de comprendre votre situation et voir si on peut vous aider. Ça vous convient ?"}]},
  decouverte:{title:"Découverte",color:"#0B68B4",steps:[{label:"Situation",text:"En quelle classe est votre enfant ? Dans quelle(s) matière(s) rencontre-t-il des difficultés ?"},{label:"Problème",text:"Depuis combien de temps observez-vous ces difficultés ?"},{label:"Implication",text:"Est-ce que cela impacte sa confiance en lui ?"},{label:"Besoin",text:"Idéalement, qu'aimeriez-vous voir changer dans les 2-3 prochains mois ?"}]},
  pitch:{title:"Présentation",color:"#7C3AED",steps:[{label:"Solution",text:"Les Sherpas met en relation des élèves avec des professeurs triés sur le volet, issus des meilleures grandes écoles 🎓"},{label:"Différenciation",text:"Nos profs sont sélectionnés à moins de 5% ✨ Compatibilité garantie, changement gratuit si besoin."},{label:"Preuve sociale",text:"Des milliers de familles accompagnées, un taux de satisfaction de 98% ⭐"}]},
  closing:{title:"Closing",color:"#DA4F00",steps:[{label:"Reformulation",text:"Si je résume : vous cherchez un professeur en [matière] pour [prénom], c'est bien ça ?"},{label:"Engagement",text:"On a justement plusieurs profils disponibles. Je peux vous proposer une mise en relation dès cette semaine 🚀"},{label:"Objection finale",text:"Je comprends que vous voulez réfléchir. Qu'est-ce qui vous empêche de vous lancer aujourd'hui ?"},{label:"Closing doux",text:"Parfait ! Je vous envoie un récapitulatif et je vous rappelle [date]. Bonne journée 😊"}]},
};
export const INIT_OBJECTIONS=[
  {id:"prix",color:"#E11D48",icon:"💰",label:"C'est trop cher",ref:"Vous trouvez que le tarif ne correspond pas à vos attentes ?",arg:"Ramené à une heure par semaine, c'est moins qu'un abonnement streaming. Et là on parle de l'avenir scolaire de votre enfant 📚",rebond:"Plutôt que le prix, comparons au résultat : si votre enfant passe de 8 à 14 en maths, qu'est-ce que ça vaut pour vous ?"},
  {id:"qualite",color:"#1E40AF",icon:"🎓",label:"Je préfère un vrai prof",ref:"Vous voulez être sûr que le professeur est vraiment qualifié ?",arg:"Nos Sherpas sont sélectionnés à moins de 5% ✨",rebond:"Un prof qui a réussi le bac il y a 2 ans connaît exactement ce qu'on attend aux examens aujourd'hui."},
  {id:"timing",color:"#DA4F00",icon:"📅",label:"C'est pas le bon moment",ref:"Vous avez l'impression que ce n'est pas urgent ?",arg:"En accompagnement scolaire, le temps est l'ennemi principal. Chaque semaine sans aide, les lacunes s'accumulent.",rebond:"Quel serait le bon moment ? Et qu'est-ce qui se passe si on attend jusqu'à là ?"},
  {id:"concurrence",color:"#0B68B4",icon:"🤝",label:"J'ai déjà quelqu'un",ref:"Vous avez déjà un suivi. Qu'est-ce qui vous a poussé à chercher une autre option ?",arg:"Notre valeur ajoutée : suivi des sessions, remplacement facile, diversité de profils 💪",rebond:"Y a-t-il des matières sans suivi actuellement ?"},
  {id:"reflechir",color:"#71717A",icon:"🤔",label:"Je dois réfléchir",ref:"Quelque chose vous freine encore. Qu'est-ce qui vous manque pour décider ?",arg:"Qu'est-ce qui vous ferait basculer du côté du oui ?",rebond:"Budget, timing ou doutes sur la qualité ?"},
];
export const INIT_FEEDBACKS=[
  {id:1,date:"2026-04-02",auteur:"Julien",  anonyme:false,clientTypes:["Parent stressé"],  objections:["Prix"],           bien:["Découverte client"],bloque:["Closing"],                  confiance:7,suggestions:"Script pour parents comparant avec Superprof."},
  {id:2,date:"2026-04-02",auteur:"Jonathan",anonyme:false,clientTypes:["Parent rationnel"], objections:["Qualité du prof"],bien:["Pitch produit"],      bloque:["Gestion objection qualité"],confiance:5,suggestions:""},
  {id:3,date:"2026-04-01",auteur:"Julien",  anonyme:false,clientTypes:["Parent pressé"],    objections:["Je dois réfléchir"],bien:["Closing"],           bloque:[],                           confiance:9,suggestions:"Le script de closing est très efficace."},
  {id:4,date:"2026-04-01",auteur:"Jonathan",anonyme:true, clientTypes:["Parent négociateur"],objections:["Prix","Concurrence"],bien:["Découverte client"],bloque:["Closing"],               confiance:4,suggestions:"Besoin d'un script pour deux objections simultanées."},
  {id:5,date:"2026-03-31",auteur:"Julien",  anonyme:false,clientTypes:["Parent stressé"],   objections:["Prix"],           bien:["Introduction"],       bloque:["Pitch trop long"],          confiance:6,suggestions:""},
];
export const INIT_MATCHINGS=[
  {id:1,date:"2026-04-02",auteur:"Julien",  idealTyp:"Étudiant grande école",chosenTyp:"Étudiant grande école",followed:true, niveau:"Lycée général",psycho:"Compétiteur / Haut Potentiel"},
  {id:2,date:"2026-04-02",auteur:"Jonathan",idealTyp:"Professeur EN",        chosenTyp:"Étudiant université",  followed:false,niveau:"Collège",      psycho:"Stressé / Anxieux"},
  {id:3,date:"2026-04-01",auteur:"Julien",  idealTyp:"Étudiant grande école",chosenTyp:"Étudiant grande école",followed:true, niveau:"Prépa",       psycho:"Compétiteur / Haut Potentiel"},
  {id:4,date:"2026-04-01",auteur:"Jonathan",idealTyp:"AESH",                 chosenTyp:"Professeur EN",        followed:false,niveau:"Collège",      psycho:"Stressé / Anxieux"},
  {id:5,date:"2026-03-31",auteur:"Julien",  idealTyp:"Étudiant université",  chosenTyp:"Étudiant université",  followed:true, niveau:"Primaire",     psycho:"Introverti / Réservé"},
];
export const INIT_DEMANDES=[
  {id:1,date:"2026-04-02",auteur:"Julien",  cp:"92200",ville:"Neuilly",      matieres:["Maths"],    niveau:"Lycée général",typo:["Étudiant grande école"]},
  {id:2,date:"2026-04-01",auteur:"Jonathan",cp:"75016",ville:"Paris 16e",    matieres:["Français"], niveau:"Collège",      typo:["Professeur EN"]},
  {id:3,date:"2026-04-01",auteur:"Julien",  cp:"69006",ville:"Lyon",         matieres:["Maths"],    niveau:"Prépa",        typo:["Étudiant grande école"]},
  {id:4,date:"2026-03-31",auteur:"Jonathan",cp:"13008",ville:"Marseille",    matieres:["Anglais"],  niveau:"Lycée général", typo:["Étudiant université"]},
];
export const INIT_RENTREE=[
  {id:1,date:"2026-04-02",auteur:"Julien",  famille:"Dupont", classe:"Terminale",    matieres:["Maths","Physique"],        rappel:"2026-08-15",notes:"Budget validé"},
  {id:2,date:"2026-04-01",auteur:"Jonathan",famille:"Leclerc",classe:"5ème",         matieres:["Français"],                rappel:"2026-07-01",notes:""},
  {id:3,date:"2026-04-01",auteur:"Julien",  famille:"Petit",  classe:"2ème prépa",   matieres:["Maths","Physique","Chimie"],rappel:"2026-08-01",notes:"Déjà client"},
  {id:4,date:"2026-03-31",auteur:"Jonathan",famille:"Bernard",classe:"CE2",          matieres:["Maths","Français"],        rappel:"2026-07-15",notes:"Enfant DYS"},
];
export const INIT_SUGGESTIONS=[
  {id:1,date:"2026-04-02",auteur:"Julien",  type:"objection",contenu:"Ajouter réponse à 'Je vais d'abord essayer avec mon enfant'",statut:"pending"},
  {id:2,date:"2026-04-01",auteur:"Jonathan",type:"script",   contenu:"Script closing pour parents comparant avec Superprof",statut:"pending"},
];
export const FORMATION_DEFAULT={
  sales:{title:"Expertise Sales",icon:"📞",color:"#16A34A",modules:[{id:1,title:"Fondamentaux de la vente",duration:"45 min",done:true,score:92,description:"Les bases de la persuasion et du cycle de vente Sherpas"},{id:2,title:"Découverte client — SPIN",duration:"60 min",done:true,score:85,description:"Méthode SPIN : Situation, Problème, Implication, Need-payoff"},{id:3,title:"Cycle de vente Sherpas",duration:"35 min",done:false,description:"Comprendre le tunnel de vente de l'appel au closing"},{id:4,title:"Techniques de closing",duration:"40 min",done:false,description:"Closing assumptif, doux, récapitulatif"}]},
  education:{title:"Secteur Éducation",icon:"🏫",color:"#0B68B4",modules:[{id:5,title:"Le système scolaire français",duration:"45 min",done:false,description:"De la maternelle au bac : programmes, enjeux, acteurs"},{id:6,title:"DYS, TDAH — troubles d'apprentissage",duration:"50 min",done:false,description:"Identifier et accompagner les profils atypiques"},{id:7,title:"Profils psychologiques élèves",duration:"40 min",done:false,description:"Les 4 profils de la Lanterne : introverti, décrocheur, compétiteur, stressé"},{id:8,title:"La Prépa — codes et attentes",duration:"35 min",done:false,description:"MPSI, PCSI, ECG : comprendre pour mieux prescrire"}]},
  argumentaires:{title:"Argumentaires V5",icon:"💡",color:"#DA4F00",modules:[{id:9,title:"Feature-to-Benefit : vendre les profils",duration:"55 min",done:false,description:"Transformer les caractéristiques d'un prof en bénéfices concrets"},{id:10,title:"Maîtriser la Matrice Dual Path",duration:"60 min",done:false,description:"Quand suivre l'idéal Matrice, quand pivoter"},{id:11,title:"Recadrer les attentes parentales",duration:"45 min",done:false,description:"Gérer les demandes irréalistes avec confiance et pédagogie"}]},
  neuro:{title:"Profils Neuroatypiques",icon:"🧠",color:"#7C3AED",modules:[{id:101,title:"Introduction aux profils neuroatypiques",duration:"40 min",done:false,description:"TDAH, TSA, DYS, HPI — comprendre les bases neurologiques et les impacts sur l'apprentissage"},{id:102,title:"TDAH — Accompagner l'attention",duration:"45 min",done:false,description:"Techniques pour maintenir l'attention, adapter le rythme, gérer l'impulsivité en cours"},{id:103,title:"TSA — Communiquer autrement",duration:"50 min",done:false,description:"Communication explicite, rituels prévisibles, gestion sensorielle"},{id:104,title:"DYS — Outils de compensation",duration:"45 min",done:false,description:"Dyslexie, dysorthographie, dyspraxie — adaptations pédagogiques concrètes"},{id:105,title:"HPI — Stimuler sans surcharger",duration:"40 min",done:false,description:"Double exceptionnalité, ennui scolaire, gestion émotionnelle du haut potentiel"},{id:106,title:"Profils complexes — Multi-troubles",duration:"55 min",done:false,description:"Quand plusieurs troubles coexistent : lecture globale et stratégie d'accompagnement"},{id:107,title:"Utiliser la Matrice Neuro en appel",duration:"50 min",done:false,description:"Simulation : prescrire le bon profil prof pour chaque trouble, argumenter avec les parents"}]},
};
