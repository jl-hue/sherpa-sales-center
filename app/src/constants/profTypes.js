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
