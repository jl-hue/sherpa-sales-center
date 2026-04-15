import { useState, useRef, useMemo } from 'react';
import { syncToSupabase } from '../../lib/supabase';
import { C, GC, Pill, Btn, Chips, ST, CopyBtn, Logo } from '../ui';
import { PROF_TYPES, NIVEAUX, MATIERES, PSYCH_PROFILES, PROF_HIERARCHY, CLASSES_PRIMAIRE, CLASSES_COLLEGE, CLASSES_LYCEE_GENERAL, CLASSES_LYCEE_TECHNO, CLASSES_LYCEE_PRO, CLASSES_BTS, CLASSES_UNIV, PREPA_FILIERES, SPE_PREMIERE, PARCOURSUP_OPTIONS, PARCOURSUP_HIERARCHY, LYCEE_TECHNO_SERIES, getRecommendedHierarchy, getMatieresDisponibles } from '../../constants/profTypes';
import { computeV5, getLabel, refine } from '../../lib/matching';
import { getArgs } from '../../lib/argEngine';
import { today } from '../../lib/utils';
import { NEURO_MATRIX, NEURO_TROUBLES, NEURO_COLORS, NEURO_EMOJIS, NEURO_PROFS } from '../../constants/neuroMatrix';
import { getEcheances, getProgramme, getProgrammeDetails } from '../../constants/familyToolkit';

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
  const { niveau, classe, brevetPrep, spes = [], parcoursupCible, parcoursupEcole, prepaFiliere, prepaAnnee, univFiliere, serieTechno } = diag || {};
  const parts = [];
  if (niveau === "Collège" && classe) {
    parts.push(`en ${classe}`);
    if (classe === "3e" && brevetPrep) parts.push(`prépare le brevet`);
  } else if (niveau === "Lycée général" && classe) {
    parts.push(`en ${classe}`);
    if (spes.length > 0) parts.push(`spés ${spes.join("/")}`);
    if (parcoursupCible) parts.push(`cible ${parcoursupCible}`);
    if (parcoursupEcole) parts.push(`vise ${parcoursupEcole}`);
  } else if (niveau === "Lycée techno" && classe) {
    parts.push(`en ${classe}`);
    if (serieTechno) parts.push(`série ${serieTechno}`);
  } else if (niveau === "Lycée pro" && classe) {
    parts.push(`en ${classe}`);
  } else if (niveau === "Prépa" && prepaFiliere) {
    parts.push(`en ${prepaAnnee || ""} prépa ${prepaFiliere}`.trim().replace("  ", " "));
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

// ── Guide neuroatypique inspiré du PAP (Plan d'Accompagnement Personnalisé) ──
function getNeuroGuide(trouble, nom, niveau) {
  const n = nom || "votre enfant";
  const guides = {
    "TDAH": {
      questions: [
        `"${n} a-t-il/elle un PAP ou un PPS en place avec son école ? Si oui, quelles adaptations sont prévues ?"`,
        `"Comment se passe son temps d'attention en cours : combien de temps avant que l'attention ne décroche ?"`,
        `"Est-ce qu'il/elle bénéficie d'un tiers-temps aux évaluations ?"`,
        `"Avez-vous identifié des moments de la journée où ${n} est plus disponible cognitivement ?"`,
        `"Y a-t-il un suivi médical en cours (pédopsychiatre, neuropédiatre) ?"`,
        `"Quels outils marchent déjà à la maison pour cadrer son travail (timer, listes, récompenses) ?"`,
      ],
      arguments: [
        `"Conformément aux recommandations du PAP, notre prof va structurer la séance en blocs de 15-20 minutes max avec micro-pauses — c'est exactement ce qu'il faut pour le TDAH."`,
        `"Nous privilégions un seul objectif clair par séance : on ne surcharge pas la mémoire de travail de ${n}."`,
        `"Notre approche utilise les supports visuels et concrets (schémas, mind-mapping, manipulation) pour ancrer les notions, comme le préconise le PAP."`,
        `"Les consignes seront données une à la fois, à l'oral ET à l'écrit, pour éviter les pertes d'information."`,
        `"On valorise les efforts et les petites réussites — c'est essentiel pour reconstruire l'estime de soi d'un enfant TDAH qui entend trop souvent 'tu peux mieux faire'."`,
      ],
      adaptationsPAP: [
        `Séances courtes (max 1h) avec pauses programmées toutes les 15-20 min`,
        `Consignes courtes, claires, données une par une`,
        `Supports visuels (schémas, surlignage, codes couleur)`,
        `Reformulation systématique des consignes par ${n}`,
        `Utilisation du timer (méthode Pomodoro adaptée)`,
        `Environnement de travail dépouillé (pas de stimuli parasites)`,
        `Tiers-temps et accompagnement aux devoirs`,
        `Renforcement positif systématique`,
      ],
    },
    "TSA": {
      questions: [
        `"${n} a-t-il/elle un PPS (Projet Personnalisé de Scolarisation) ? Quelles aménagements sont en place ?"`,
        `"Quels sont ses centres d'intérêt spécifiques ? On peut s'en servir comme leviers."`,
        `"Y a-t-il des particularités sensorielles à connaître (son, lumière, contact, odeurs) ?"`,
        `"Quelles routines fonctionnent bien à la maison qu'on pourrait reproduire en séance ?"`,
        `"Y a-t-il des sujets ou situations à éviter (déclencheurs d'anxiété) ?"`,
        `"Comment ${n} communique-t-il/elle quand il/elle est en surcharge ?"`,
        `"Préférez-vous que les séances aient lieu toujours au même horaire et au même endroit ?"`,
      ],
      arguments: [
        `"Avec ${n}, la prévisibilité est clé : nos séances suivent toujours le même rituel, le même créneau, le même prof — pas de changement de dernière minute."`,
        `"Notre prof annonce le déroulé de chaque séance dès le début (avec un planning visuel si besoin) — comme préconisé pour les profils TSA."`,
        `"Nous évitons les consignes implicites ou métaphoriques qui peuvent être déroutantes : tout est explicite et littéral."`,
        `"Si ${n} a un intérêt spécifique, on l'utilise comme support pédagogique — c'est le levier d'engagement le plus puissant."`,
        `"Nous laissons des temps de pause sans interaction si nécessaire — on respecte le besoin de retrait."`,
        `"Le prof ne forcera jamais le contact visuel ou physique — on s'adapte au confort de ${n}."`,
      ],
      adaptationsPAP: [
        `Cadre prévisible : même horaire, même lieu, même structure de séance`,
        `Planning visuel affiché en début de séance`,
        `Consignes explicites, littérales, écrites`,
        `Pas de double tâche (écouter + écrire en simultané)`,
        `Utilisation des intérêts spécifiques comme leviers`,
        `Anticipation des transitions et changements`,
        `Respect des particularités sensorielles`,
        `Communication alternative si besoin (pictogrammes, écrit)`,
      ],
    },
    "DYS": {
      questions: [
        `"Quel(s) trouble(s) DYS exactement : dyslexie, dysorthographie, dyspraxie, dyscalculie, dysphasie ?"`,
        `"${n} a-t-il/elle un PAP en place ? Quelles adaptations sont prévues ?"`,
        `"Bénéficie-t-il/elle d'un suivi orthophonique ? À quelle fréquence ?"`,
        `"A-t-il/elle un ordinateur personnel pour les évaluations (saisie au lieu de l'écriture manuscrite) ?"`,
        `"Quels supports fonctionnent le mieux : oral, visuel, kinesthésique ?"`,
        `"Le tiers-temps est-il accordé aux évaluations ?"`,
        `"Quels sont ses points forts qu'on peut renforcer ?"`,
      ],
      arguments: [
        `"Notre prof connaît les outils de compensation DYS : police OpenDyslexic, surlignage en couleur, audio, dictée vocale — il/elle s'adapte au profil de ${n}."`,
        `"Nous travaillons à l'oral plus qu'à l'écrit quand c'est possible : ${n} peut montrer ce qu'il/elle sait sans être pénalisé(e) par la transcription."`,
        `"Les consignes sont reformulées et fragmentées, comme le préconise le PAP."`,
        `"On part TOUJOURS des points forts : un enfant DYS qui réussit en oral va prendre confiance avant qu'on attaque les difficultés écrites."`,
        `"Notre prof ne corrige pas TOUTES les fautes d'un coup : on cible un objectif par séance pour ne pas décourager."`,
        `"Pour les maths (dyscalculie), on utilise la manipulation concrète avant l'abstrait — règles, jetons, schémas."`,
      ],
      adaptationsPAP: [
        `Polices adaptées (OpenDyslexic, Verdana, Comic Sans, taille 14+)`,
        `Interlignage 1.5 minimum`,
        `Surlignage en couleur des mots-clés`,
        `Consignes lues à voix haute par le prof`,
        `Énoncés reformulés et fragmentés`,
        `Tiers-temps aux évaluations`,
        `Utilisation de l'ordinateur (correcteur, dictée vocale)`,
        `Notation indulgente sur l'orthographe (sauf en français)`,
        `Pas de copie au tableau (donner photocopie)`,
      ],
    },
    "HPI": {
      questions: [
        `"${n} a-t-il/elle été diagnostiqué(e) HPI ? Quel test (WISC, WAIS) ?"`,
        `"Y a-t-il une asynchronie particulière : très en avance dans certains domaines, en retard dans d'autres ?"`,
        `"S'ennuie-t-il/elle en classe ? Comment se manifeste cet ennui (provocation, retrait, dispersion) ?"`,
        `"Quels sont ses centres d'intérêt passionnels ?"`,
        `"Comment réagit-il/elle face à l'erreur : perfectionnisme, blocage, abandon ?"`,
        `"A-t-il/elle un cumul HPI + autre trouble (DYS, TDAH, TSA) ? C'est très fréquent."`,
        `"Préférez-vous qu'on le/la stimule intellectuellement ou qu'on travaille d'abord la méthode ?"`,
      ],
      arguments: [
        `"Notre prof va aller plus vite et plus loin que le programme officiel — un HPI s'éteint quand on le/la cantonne au minimum."`,
        `"Le prof traite ${n} comme un interlocuteur intellectuel à part entière — pas comme 'un enfant à encadrer'."`,
        `"Nous travaillons sur des projets ambitieux qui donnent du sens à l'apprentissage : la 'pourquoi-question' avant la 'comment-question'."`,
        `"Pour le perfectionnisme, on travaille la tolérance à l'erreur en montrant que les grands chercheurs se trompent en permanence — c'est ce qui fait avancer la pensée."`,
        `"On encourage les questions latérales et les digressions enrichissantes — le HPI apprend en arborescence, pas en ligne droite."`,
        `"Si ${n} cumule HPI + autre trouble, on gère les deux dimensions : challenger ET adapter."`,
      ],
      adaptationsPAP: [
        `Approfondissement et enrichissement plutôt que répétition`,
        `Projets transversaux et exploratoires`,
        `Travail sur la méthode et l'organisation (point faible fréquent)`,
        `Tolérance à l'erreur travaillée explicitement`,
        `Pas de tâches répétitives (rejet immédiat)`,
        `Liberté de questions tangentes`,
        `Si HPI + DYS/TDAH : double prise en charge cohérente`,
      ],
    },
    "Multi-dys / profil complexe": {
      questions: [
        `"Quels troubles exactement sont diagnostiqués chez ${n} ? Et depuis quand ?"`,
        `"Quels professionnels suivent ${n} aujourd'hui (orthophoniste, ergothérapeute, psychomotricien, neuropsychologue, psychiatre) ?"`,
        `"A-t-il/elle un PPS (Projet Personnalisé de Scolarisation) ou un PAP en place ?"`,
        `"Quel est le trouble qui pèse LE PLUS dans la scolarité aujourd'hui ?"`,
        `"Quelles adaptations marchent déjà ?"`,
        `"Y a-t-il une équipe éducative régulière avec l'école ? Comment se passe la coordination ?"`,
        `"Quel est votre objectif principal pour cette année : maintien, progrès académique, bien-être, ou tout cela ?"`,
      ],
      arguments: [
        `"Avec un profil complexe comme celui de ${n}, on ne peut pas appliquer une recette toute faite — notre prof construit un parcours sur-mesure semaine après semaine."`,
        `"Nous priorisons UN objectif principal pour ne pas surcharger ${n} : la régularité et le progrès lent valent mieux qu'une ambition irréaliste."`,
        `"Notre prof communique avec les autres professionnels qui suivent ${n} — orthophoniste, ergo, psychologue — pour aller dans la même direction."`,
        `"On respecte le rythme de ${n} : si une séance n'est pas productive, on la transforme en moment de récupération sans culpabilité."`,
        `"Notre approche valorise TOUS les progrès, même minimes — c'est crucial pour maintenir la motivation sur la durée."`,
        `"Nous savons que les bons jours alternent avec les mauvais — on s'adapte sans jamais ajouter de pression."`,
      ],
      adaptationsPAP: [
        `Plan personnalisé revu chaque mois selon l'évolution`,
        `Coordination avec les autres professionnels du suivi`,
        `Un seul objectif prioritaire par période`,
        `Adaptation au jour le jour selon l'état de l'enfant`,
        `Pas de double tâche, pas de surcharge cognitive`,
        `Tous les types d'adaptations DYS/TDAH/TSA combinés selon besoin`,
        `Bienveillance absolue, valorisation du moindre effort`,
      ],
    },
  };
  return guides[trouble] || null;
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

// ── Map PROF_TYPES (Sherpas) → NEURO_PROFS (matrice) ─────────────
// Mappage strictement aligné sur la matrice fournie
const PROF_TO_NEURO = {
  // Étudiants : pas de formation pédagogique spécifique -> proche d'un Étudiant en Psycho
  "Étudiant grande école": "Étudiant en Psychologie",
  "Étudiant université": "Étudiant en Psychologie",
  // Professeur EN classique = enseignant titulaire
  "Professeur EN": "Professeur EN classique",
  "Professeur certifié": "Professeur EN classique",
  // AESH = AESH / AVS dans la matrice
  "AESH": "AESH / AVS",
  // Formateur = profil méthodologie/pédagogie -> Prof EN Psychopédagogie
  "Formateur": "Prof EN Psychopédagogie",
};

function findNeuroMatch(profTyp, trouble) {
  // 1. Match direct (cas où le profTyp est déjà un NEURO_PROFS)
  let entry = NEURO_MATRIX.find(r => r.prof === profTyp && r.trouble === trouble);
  if (entry) return entry;
  // 2. Mapping Sherpas -> matrice neuro
  const mapped = PROF_TO_NEURO[profTyp];
  if (mapped) {
    entry = NEURO_MATRIX.find(r => r.prof === mapped && r.trouble === trouble);
    if (entry) return entry;
  }
  // 3. Match partiel sur le nom (ex: "Psychologue", "Psychopédagogie", etc.)
  if (profTyp) {
    const lower = profTyp.toLowerCase();
    if (lower.includes("psychologue")) entry = NEURO_MATRIX.find(r => r.prof === "Psychologue" && r.trouble === trouble);
    else if (lower.includes("psychopédagogie") || lower.includes("psychopedagogie")) entry = NEURO_MATRIX.find(r => r.prof === "Prof EN Psychopédagogie" && r.trouble === trouble);
    else if (lower.includes("aesh") || lower.includes("avs")) entry = NEURO_MATRIX.find(r => r.prof === "AESH / AVS" && r.trouble === trouble);
    else if (lower.includes("étudiant en psycho") || lower.includes("etudiant en psycho")) entry = NEURO_MATRIX.find(r => r.prof === "Étudiant en Psychologie" && r.trouble === trouble);
    else if (lower.includes("certifié") || lower.includes("certifie") || lower.includes("agrégé") || lower.includes("agrege") || lower.includes("capes")) entry = NEURO_MATRIX.find(r => r.prof === "Professeur EN classique" && r.trouble === trouble);
    if (entry) return entry;
  }
  return null;
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
// MULTI-CHILDREN HELPER
// ═══════════════════════════════════════════════════════════════════
function emptyEnfant(id) {
  return {
    id: id || Date.now(),
    prenom: "", niveau: "", classe: "", brevetPrep: false, spes: [],
    parcoursupCategorie: "", parcoursupCible: "", parcoursupEcole: "",
    prepaFiliere: "", prepaAnnee: "", univFiliere: "", serieTechno: "",
    matieres: [], psycho: "", accomp: 5, objectifVie: "",
    neuroActive: false, neuroTrouble: "",
    moyenneGenerale: "", moyennesMat: {},
    openMatGroup: null,
    listeEnvoyee: false,
  };
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
function SalesLanterne({ stock, setMatchings, user }) {
  // ── State: Step ─────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── State: Multi-children ─────────────────────────────────────
  const [enfants, setEnfants] = useState([emptyEnfant(1)]);
  const [activeEnfantIdx, setActiveEnfantIdx] = useState(0);
  // Helper: current child
  const ef = enfants[activeEnfantIdx] || emptyEnfant();
  // Helper: update current child field
  function setEF(field, val) {
    setEnfants(prev => prev.map((e, i) => i === activeEnfantIdx ? { ...e, [field]: val } : e));
  }

  const [souhaitParent, setSouhaitParent] = useState("");

  // ── State: Parent profile ──────────────────────────────────────
  const [parentProfile, setParentProfile] = useState("");

  // ── State: Nombre de profs ─────────────────────────────────────
  const [nbProfs, setNbProfs] = useState("1");

  // ── State: Disponibilités famille ──────────────────────────────
  const [dispoJours, setDispoJours] = useState([]); // ["Lundi","Mardi",...]
  const [dispoCreneaux, setDispoCreneaux] = useState([]); // ["Matin","Midi","Après-midi","Soir"]
  const [dispoNote, setDispoNote] = useState("");

  // ── State: Budget famille ──
  const [budget, setBudget] = useState(""); // "petit" | "moyen" | "gros"
  // ── State: Note perso ──
  const [notePerso, setNotePerso] = useState("");
  // ── State: 2e créneaux dispo ──
  const [dispoJours2, setDispoJours2] = useState([]);
  const [dispoCreneaux2, setDispoCreneaux2] = useState([]);

  // ── State: Mode de cours (domicile / en ligne / peu importe) ──
  const [modeCours, setModeCours] = useState("");
  const [villeClient, setVilleClient] = useState("");
  const [villeCP, setVilleCP] = useState("");
  const [villeSearch, setVilleSearch] = useState("");
  const [villeSuggestions, setVilleSuggestions] = useState([]);
  const [villeLoading, setVilleLoading] = useState(false);

  // Autocomplétion ville via API gouv
  function rechercheVille(q) {
    if (q.length < 2) { setVilleSuggestions([]); return; }
    setVilleLoading(true);
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=6`)
      .then(r => r.json())
      .then(data => {
        const results = (data.features || []).map(f => ({
          label: `${f.properties.city || f.properties.name} (${f.properties.postcode})`,
          ville: f.properties.city || f.properties.name,
          cp: f.properties.postcode,
        }));
        setVilleSuggestions([...new Map(results.map(r => [r.label, r])).values()]);
      })
      .catch(() => setVilleSuggestions([]))
      .finally(() => setVilleLoading(false));
  }

  // ── State: Collapsible sections ────────────────────────────────
  const [openParent, setOpenParent] = useState(false);
  const [openPsycho, setOpenPsycho] = useState(false);
  const [openObjectif, setOpenObjectif] = useState(false);

  // ── State: Guide d'argumentation (Step 2) ──────────────────────
  const [profProposeNom, setProfProposeNom] = useState(""); // ex: "Martin, étudiant en Prépa MP à Louis-le-Grand"
  const [profProposePath, setProfProposePath] = useState([]); // selection en cascade dans PROF_HIERARCHY
  const [expandedRank, setExpandedRank] = useState(null); // index du top 3 deplie
  const [openTop3, setOpenTop3] = useState(false);
  const [openToolkit, setOpenToolkit] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);

  // ── Step 3 : Analyse IA d'un prof Sherpas (Gemini) ──────────────
  const [profUrl, setProfUrl] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiArguments, setAiArguments] = useState(null); // { hook, trust, bridge, rebound, summary }
  const [aiRawContent, setAiRawContent] = useState(""); // contenu brut récupéré (debug)
  const [showRawContent, setShowRawContent] = useState(false);

  // ── Pas de prof à domicile (signalement zone) ──────────────────
  const [noProfSignaled, setNoProfSignaled] = useState(false);
  function signalerPasDeProf() {
    if (!villeClient || modeCours !== "domicile") return;
    const demandes = JSON.parse(localStorage.getItem("sherpas_demandes_zones_v1") || "[]");
    demandes.push({
      ville: villeClient,
      cp: villeCP,
      niveau: ef.niveau || "",
      matieres: ef.matieres.join(", "),
      date: new Date().toISOString(),
      auteur: user?.email || "",
    });
    localStorage.setItem("sherpas_demandes_zones_v1", JSON.stringify(demandes));
    syncToSupabase("demandes_zones", demandes);
    setNoProfSignaled(true);
    setTimeout(() => setNoProfSignaled(false), 3000);
  }

  // ── Step 3 : Recherche auto de profs Sherpas ──────────────────
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState(null); // [{ nom, url, score, raison }]
  const [searchCity, setSearchCity] = useState("");
  const [searchMode, setSearchMode] = useState("online"); // "online" | "atHome"

  function buildSherpasSearchUrl() {
    const params = new URLSearchParams();
    // Matière (on prend la première sélectionnée, sans accents/caractères spéciaux pour l'URL)
    if (ef.matieres.length > 0) {
      const m = ef.matieres[0]
        .replace("Physique-Chimie", "Physique-chimie")
        .replace("Histoire-Géo", "Histoire-géographie")
        .replace("SES", "SES")
        .replace("SVT", "SVT");
      params.set("subject", m);
    }
    // Niveau
    const niveauMap = {
      "Primaire": "primaire",
      "Collège": "college",
      "Lycée général": "lycee",
      "Lycée pro": "lycee",
      "Lycée techno": "lycee",
      "BTS": "superieur",
      "Prépa": "superieur",
      "Université": "superieur",
    };
    const nivKey = niveauMap[ef.niveau];
    if (nivKey) params.set("educationalStages", nivKey);
    // Mode online / à domicile
    params.set("courseLocation", searchMode);
    if (searchMode === "atHome" && searchCity.trim()) {
      params.set("address", searchCity.trim());
    }
    return `https://sherpas.com/professeurs?${params.toString()}`;
  }

  async function searchProfsWithAI() {
    setSearchError("");
    setSearchResults(null);
    if (!ef.niveau || ef.matieres.length === 0) {
      setSearchError("Il faut au moins un niveau et une matière en Step 1");
      return;
    }
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) { setSearchError("Clé Groq manquante"); return; }
    setSearchLoading(true);
    try {
      const searchUrl = buildSherpasSearchUrl();
      // Fetch le markdown de la page de recherche via Jina Reader
      const mdContent = await fetch(`https://r.jina.ai/${searchUrl}`).then(r => r.text());

      if (!mdContent || mdContent.length < 200) {
        throw new Error("Jina Reader n'a pas pu récupérer la page. Réessaye dans quelques secondes.");
      }

      const truncated = mdContent.slice(0, 10000);

      // Contexte diag
      const ctx = [];
      if (ef.niveau) ctx.push(`Niveau : ${ef.niveau}${ef.classe ? " " + ef.classe : ""}`);
      if (ef.matieres.length > 0) ctx.push(`Matières : ${ef.matieres.join(", ")}`);
      if (ef.spes.length > 0) ctx.push(`Spécialités : ${ef.spes.join(", ")}`);
      if (ef.prepaFiliere) ctx.push(`Prépa : ${ef.prepaAnnee || ""} ${ef.prepaFiliere}`.trim());
      if (ef.objectifVie) ctx.push(`Objectif : ${ef.objectifVie}`);
      if (ef.psycho) ctx.push(`Profil psy enfant : ${ef.psycho}`);
      if (ef.neuroActive && ef.neuroTrouble) ctx.push(`Neuroatypique : ${ef.neuroTrouble}`);

      const prompt = `Tu es un expert en sélection de profs pour Les Sherpas. Voici la page de résultats de recherche Sherpas (markdown brut) :

--- PAGE DE RECHERCHE ---
${truncated}
--- FIN ---

DEMANDE FAMILLE :
${ctx.map(c => `- ${c}`).join("\n")}

Mission : identifie les 5 MEILLEURS profs parmi la liste ci-dessus. Pour chacun, extrait UNIQUEMENT ce qui est écrit dans le markdown : le prénom, le titre exact de l'annonce (la ligne qui commence par ###), le prix, le nombre d'heures données, le nombre d'avis. INTERDIT d'inventer. INTERDIT de générer des URLs (on n'en a pas accès). Note chaque prof sur 100 selon la cohérence parcours/expérience/matière/niveau.

Format JSON STRICT :
{
  "results": [
    {
      "nom": "<prénom exact du prof>",
      "titre": "<titre EXACT de l'annonce du prof extrait du markdown>",
      "prix": "<prix extrait, ex: '31,45€/h'>",
      "experience": "<nb heures/avis extrait, ex: '92h données, 13 avis'>",
      "score": <0-100>,
      "raison": "<pourquoi ce prof matche — 1 phrase>"
    }
  ],
  "verdict": "<analyse globale en 1 phrase>"
}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Erreur Groq");
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      parsed._searchUrl = searchUrl;
      setSearchResults(parsed);
    } catch (err) {
      setSearchError(err.message || String(err));
    } finally {
      setSearchLoading(false);
    }
  }

  async function analyzeProfWithAI() {
    setAiError("");
    setAiArguments(null);
    if (!profUrl.trim()) { setAiError("Colle d'abord un lien Sherpas"); return; }
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) { setAiError("⚠️ Clé Groq manquante. Ajoute VITE_GROQ_API_KEY dans Netlify env vars."); return; }
    setAiLoading(true);
    try {
      // 1. Fetch URL via Jina Reader (CORS-friendly, gratuit)
      const readerUrl = `https://r.jina.ai/${profUrl.trim()}`;
      const profContent = await fetch(readerUrl).then(r => r.text());
      const truncated = profContent.slice(0, 6000);
      setAiRawContent(truncated);

      // 2. Construire le contexte Step 1 + Step 2
      const ctx = [];
      if (ef.prenom) ctx.push(`Élève : ${ef.prenom}`);
      if (ef.niveau) ctx.push(`Niveau : ${ef.niveau}${ef.classe ? " " + ef.classe : ""}`);
      if (ef.spes.length > 0) ctx.push(`Spécialités : ${ef.spes.join(", ")}`);
      if (ef.prepaFiliere) ctx.push(`Prépa : ${ef.prepaAnnee || ""} ${ef.prepaFiliere}`.trim());
      if (ef.serieTechno) ctx.push(`Série techno : ${ef.serieTechno}`);
      if (ef.matieres.length > 0) ctx.push(`Matières : ${ef.matieres.join(", ")}`);
      if (ef.objectifVie) ctx.push(`Objectif : ${ef.objectifVie}`);
      if (ef.neuroActive && ef.neuroTrouble) ctx.push(`Neuroatypique : ${ef.neuroTrouble}`);
      if (ef.psycho) ctx.push(`Profil psy enfant : ${ef.psycho}`);
      if (parentProfile) {
        const ppLab = PARENT_PROFILES.find(p => p.id === parentProfile)?.label;
        if (ppLab) ctx.push(`Profil parent : ${ppLab}`);
      }

      const prompt = `Tu es un expert STRICT et HONNÊTE en évaluation de profils profs chez Les Sherpas. Tu n'es PAS un commercial flatteur — tu es un auditeur rigoureux. Ton rôle est de vérifier si un prof matche vraiment une demande, pas de faire plaisir au sales.

--- PROFIL PROF (texte brut récupéré du site) ---
${truncated}
--- FIN PROFIL ---

DEMANDE FAMILLE :
${ctx.map(c => `- ${c}`).join("\n")}

═══════════════════════════════════════════════
RÈGLES DE NOTATION ULTRA-STRICTES :
═══════════════════════════════════════════════

1. **PREUVE OBLIGATOIRE** : Pour chaque critère, tu DOIS d'abord chercher une CITATION EXACTE dans le profil prof avant de mettre une note. Si tu ne trouves AUCUNE preuve textuelle → score = 0 et evidence = "Aucune mention dans le profil".

2. **MATIÈRES** :
   - 100 = la matière demandée est explicitement mentionnée dans le profil avec une citation claire
   - 50 = matière proche/connexe mentionnée (ex: maths-physique pour une demande maths)
   - 0 = la matière n'apparaît PAS du tout dans le profil

3. **NIVEAU** :
   - 100 = le niveau exact (ex: "Seconde" pour une demande Seconde) ou la catégorie (ex: "lycée") est mentionné
   - 50 = niveau adjacent (ex: prof collège pour demande Seconde)
   - 0 = niveau pas mentionné OU explicitement exclu

4. **PARCOURS (légitimité académique)** : C'est un critère CRUCIAL. Le parcours du prof doit être COHÉRENT avec la matière et le niveau demandés.
   - 100 = parcours d'excellence PARFAITEMENT aligné (ex: prépa MP/X pour maths terminale/prépa, ENS pour philo, Assas pour droit, école d'ingé post-prépa pour physique lycée…)
   - 80 = parcours cohérent et solide (ex: L3 maths pour maths lycée, LLCE anglais pour anglais collège)
   - 50 = parcours plausible mais pas idéal (ex: étudiant en médecine pour maths collège)
   - 20 = parcours INCOHÉRENT avec la matière/niveau demandés (ex: école de commerce post-bac pour maths prépa, DUT TC pour maths terminale, licence d'histoire pour physique)
   - 0 = aucune info sur le parcours ou parcours non-académique
   EXEMPLES CONCRETS :
   • Prof → école de commerce post-bac (type SKEMA post-bac) enseignant maths prépa = 20/100 (incohérent)
   • Prof → prépa scientifique MPSI/MP puis école d'ingé enseignant maths terminale = 100/100 (excellent)
   • Prof → DUT TC enseignant maths terminale = 25/100 (parcours peu sélectif en maths)
   • Prof → Normale Sup/X/Centrale enseignant maths = 100/100
5. **EXPÉRIENCE** : note GÉNÉREUSE basée sur les preuves chiffrées dans le profil (nombre d'élèves, heures de cours données, stages, années d'expérience, diplômes pédagogiques). Barème :
   - 100 = expérience massive (50+ élèves OU 500h+ de cours OU 5+ années OU prof titulaire EN)
   - 90 = très solide (20+ élèves OU 200h+ de cours OU stages pédagogiques ET chiffres solides)
   - 80 = solide (10+ élèves OU 100h+ de cours OU stages en enseignement)
   - 70 = bonne (5+ élèves OU 50h+ de cours)
   - 50 = débutant avec quelques élèves
   - 20 = aucune expérience mentionnée
   RÈGLE : si le profil mentionne un chiffre d'élèves ≥ 10 OU un total d'heures ≥ 100h OU des stages pédagogiques, le score MINIMUM est 80. Ne sois PAS avare, cumule les preuves.

5. **INTERDIT** : inventer des compétences que le profil ne mentionne pas. Si le prof ne dit rien sur "anglais", tu ne peux pas dire "il enseigne sûrement l'anglais".

6. **HONNÊTETÉ AVANT TOUT** : Si le match global est faible (<40), dis-le clairement dans le verdict avec un ❌. Le sales préfère savoir la vérité plutôt que perdre la confiance du client.

═══════════════════════════════════════════════

Format JSON STRICT (rien d'autre) :
{
  "matchScore": <0-100 — RÈGLE DE CALCUL OBLIGATOIRE : matieres, niveau et parcours sont BLOQUANTS. Si matieres < 50 OU niveau < 50 OU parcours < 40, le score global NE PEUT PAS dépasser 35. Si deux ou plus de ces critères sont insuffisants, max = 20. Sinon, moyenne pondérée : matieres 30%, niveau 25%, parcours 25%, experience 10%, profilPsy 7%, specifique 3%>,
  "verdict": "<✅ Excellent / ⚠️ Moyen / ❌ Faible — explication factuelle en 1 phrase>",
  "criteria": {
    "matieres": {
      "score": <0-100>,
      "evidence": "<CITATION EXACTE du profil prouvant le score, ou 'Aucune mention'>",
      "comment": "<analyse en 1 phrase>"
    },
    "niveau": {
      "score": <0-100>,
      "evidence": "<CITATION EXACTE>",
      "comment": "<1 phrase>"
    },
    "parcours": {
      "score": <0-100>,
      "evidence": "<CITATION EXACTE du parcours académique : école, diplôme, filière>",
      "comment": "<analyse de cohérence parcours ↔ matière/niveau demandés en 1 phrase>"
    },
    "experience": {
      "score": <0-100>,
      "evidence": "<CITATION : années d'expérience, nb d'élèves>",
      "comment": "<1 phrase>"
    },
    "profilPsy": {
      "score": <0-100>,
      "evidence": "<CITATION ou 'Aucune info dans le profil'>",
      "comment": "<adapté à ${ef.psycho || "(non renseigné)"} ?>"
    },
    "specifique": {
      "score": <0-100>,
      "evidence": "<CITATION ou 'Non mentionné'>",
      "comment": "<adapté à ${ef.neuroActive ? ef.neuroTrouble : "objectif " + (ef.objectifVie || "non précisé")} ?>"
    }
  },
  "summary": "<résumé factuel du profil prof basé sur le contenu réel — ne rien inventer>",
  "hook": "<argument crochet basé UNIQUEMENT sur ce qui est dans le profil>",
  "trust": "<argument confiance avec citation du profil>",
  "bridge": "<pont pédagogique factuel>",
  "personnalisation": "<adaptation honnête, ne pas inventer>",
  "rebound": "<réponse à l'objection probable de la famille>"
}`;

      // 3. Appel Groq (Llama 3.3 70B, gratuit, rapide)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Erreur Groq");
      const text = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(text);

      // ── Safety net : reclampe le score si l'IA a triché ──
      // Règle : matieres, niveau et parcours sont bloquants.
      const matScore = parsed.criteria?.matieres?.score ?? 0;
      const nivScore = parsed.criteria?.niveau?.score ?? 0;
      const parScore = parsed.criteria?.parcours?.score ?? 100;
      if (typeof parsed.matchScore === "number") {
        const fails = [];
        if (matScore < 50) fails.push("matière");
        if (nivScore < 50) fails.push("niveau");
        if (parScore < 40) fails.push("parcours incohérent");
        let cap = 100;
        if (fails.length >= 2) cap = 20;
        else if (fails.length === 1) cap = 35;
        if (parsed.matchScore > cap) {
          parsed.matchScore = cap;
          parsed.verdict = `❌ Match faible — ${fails.join(" + ")} ne correspond${fails.length > 1 ? "ent" : ""} pas à la demande (score plafonné automatiquement).`;
        }
      }
      setAiArguments(parsed);
    } catch (err) {
      setAiError(err.message || String(err));
    } finally {
      setAiLoading(false);
    }
  }

  // ── State: Results ─────────────────────────────────────────────
  const [chosenRebond, setChosenRebond] = useState("");
  const [rebondPath, setRebondPath] = useState([]); // ex: ["Étudiant grande école", "École d'ingénieurs", "Prépa MP (Maths-Physique)"]

  const stockMap = Object.fromEntries(stock.map(s => [s.typ, s]));

  // ── Auto-compute portrait live (remplace l'ancien bouton "Allumer la Lanterne") ──
  // Dès que niveau est rempli, on calcule. Psycho/objectif prennent un fallback en Step 1.
  const portrait = useMemo(() => {
    const current = enfants[activeEnfantIdx];
    if (!current?.niveau) return null;
    if (current.neuroActive && current.neuroTrouble) {
      const badgeScore = { ideal: 100, acceptable: 60, deconseille: 20 };
      const matrixEntries = NEURO_MATRIX.filter(e => e.trouble === current.neuroTrouble);
      return matrixEntries
        .map(e => ({ typ: e.prof, score: badgeScore[e.badge] || 0, neuroEntry: e }))
        .sort((a, b) => b.score - a.score);
    }
    const psychoEff = current.psycho || "Stressé / Anxieux";
    const objectifEff = current.objectifVie || "Remise à niveau";
    return computeV5(current.niveau, psychoEff, objectifEff, current.accomp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enfants, activeEnfantIdx]);

  const canAnalyze = ef.niveau; // navigation libre, juste besoin du niveau pour avoir un résultat

  function reset() {
    setStep(1);
    setChosenRebond("");
    setRebondPath([]);
    setEnfants([emptyEnfant(1)]);
    setActiveEnfantIdx(0);
    setSouhaitParent("");
    setParentProfile("");
    setNbProfs("1");
    setDispoJours([]);
    setDispoCreneaux([]);
    setDispoNote("");
    setModeCours("");
    setVilleClient("");
    setBudget("");
    setNotePerso("");
    setDispoJours2([]);
    setDispoCreneaux2([]);
    setVilleCP("");
    setVilleSearch("");
    setVilleSuggestions([]);
    setProfProposeNom("");
    setProfProposePath([]);
  }

  const matchingSavedRef = useRef(false);

  function resetAndSave() {
    if (!matchingSavedRef.current && portrait) {
      matchingSavedRef.current = true;
      const idealTyp = portrait[0].typ;
      setMatchings({ id: Date.now(), date: today(), auteur: user?.name || "Moi", idealTyp, chosenTyp: idealTyp, followed: true, niveau: ef.niveau, psycho: ef.psycho });
    }
    reset();
    matchingSavedRef.current = false;
  }

  const accompLabel = ef.accomp <= 3 ? "Douceur & Empathie" : ef.accomp >= 7 ? "Fermete & Cadre" : "Equilibre";
  const accompColor = ef.accomp <= 3 ? "#16A34A" : ef.accomp >= 7 ? "#DA4F00" : "#0B68B4";

  function injectPrenom(text) {
    if (!text) return "";
    return text.replace(/\[Prénom\]/g, ef.prenom || "votre enfant").replace(/\[nom\]/g, ef.prenom || "votre enfant");
  }

  // ── Helper: Build full script for a given prof type ────────────
  function buildFullScript(typ) {
    const nom = ef.prenom || "l'eleve";
    const label = getLabel(typ, ef.psycho);
    const refined = refine(typ, ef.matieres);
    const args = getArgs(typ, ef.psycho);
    const pp = parentProfile || "rationnel";
    const ppLabel = PARENT_PROFILES.find(p => p.id === pp)?.label || "Parent rationnel";
    const diagCtx = { niveau: ef.niveau, classe: ef.classe, brevetPrep: ef.brevetPrep, spes: ef.spes, parcoursupCible: ef.parcoursupCible, parcoursupEcole: ef.parcoursupEcole, prepaFiliere: ef.prepaFiliere, prepaAnnee: ef.prepaAnnee, univFiliere: ef.univFiliere, serieTechno: ef.serieTechno };
    const introText = getIntroScript(pp, nom, ef.psycho, diagCtx);
    const spinQuestions = getSpinQuestions(pp, nom, ef.psycho, ef.objectifVie, diagCtx);
    const closingText = getClosingScript(pp, nom, label, diagCtx);
    const neuroEntry = (ef.neuroActive && ef.neuroTrouble) ? findNeuroMatch(typ, ef.neuroTrouble) : null;

    return [
      `═══ SCRIPT COMPLET — ${label} ═══`,
      `Eleve : ${nom} | Psycho : ${ef.psycho} | Objectif : ${ef.objectifVie} | Parent : ${ppLabel}`,
      `Profil : ${refined}`,
      ef.neuroActive && ef.neuroTrouble ? `Neuro : ${ef.neuroTrouble}` : null,
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
      neuroEntry ? `\n── SECTION 4 : NEURO (${ef.neuroTrouble}) ──` : null,
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
    if (!ef.neuroActive || !ef.neuroTrouble) return null;
    const neuroEntry = findNeuroMatch(typ, ef.neuroTrouble);
    const neuroBadge = neuroEntry ? NEURO_BADGE[neuroEntry.badge] : null;
    const nom = ef.prenom || "l'eleve";

    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>{NEURO_EMOJIS[ef.neuroTrouble] || "🧩"}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", fontFamily: "'Outfit',sans-serif" }}>NEURO — {ef.neuroTrouble}</span>
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
  // MAIN RENDER : 3 steps (besoins / psycho enfant / famille)
  // ═══════════════════════════════════════════════════════════════
  const matAnalysis = (nbProfs === "1" && ef.matieres.length >= 2) ? analyzeMatieresCompatibility(ef.matieres, ef.niveau) : null;
    const nom = ef.prenom || "l'eleve";

    // ── Recommandation hierarchique LIVE (preview) ──
    // Si neuro actif + trouble selectionne : prend le meilleur profil neuro de la matrice
    let livePath = null;
    let liveEmoji = "🎯", liveDesc = "", liveLabel = "", liveBadge = null;
    if (ef.neuroActive && ef.neuroTrouble) {
      const matrixEntries = NEURO_MATRIX
        .filter(e => e.trouble === ef.neuroTrouble)
        .sort((a, b) => {
          const score = { ideal: 100, acceptable: 60, deconseille: 20 };
          return (score[b.badge] || 0) - (score[a.badge] || 0);
        });
      const best = matrixEntries[0];
      if (best) {
        livePath = ["🧠 Profil neuro", best.prof];
        liveEmoji = best.badge === "ideal" ? "✅" : best.badge === "acceptable" ? "⚠️" : "❌";
        liveLabel = best.prof;
        liveDesc = `Spécialiste ${ef.neuroTrouble} — ${best.badge === "ideal" ? "Profil idéal" : best.badge === "acceptable" ? "Acceptable" : "Déconseillé"}`;
        liveBadge = best.badge;
      }
    } else if (ef.niveau) {
      livePath = getRecommendedHierarchy({
        niveau: ef.niveau, classe: ef.classe, brevetPrep: ef.brevetPrep, spes: ef.spes, parcoursupCategorie: ef.parcoursupCategorie, parcoursupCible: ef.parcoursupCible, parcoursupEcole: ef.parcoursupEcole, prepaFiliere: ef.prepaFiliere, univFiliere: ef.univFiliere, serieTechno: ef.serieTechno,
        matieres: ef.matieres, psycho: ef.psycho, objectif: ef.objectifVie
      });
    }
    if (livePath && !ef.neuroActive) {
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

        {/* ── Multi-children tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
          {enfants.map((child, idx) => {
            const isActive = idx === activeEnfantIdx;
            return (
              <div key={child.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setActiveEnfantIdx(idx)}
                  style={{
                    padding: "8px 14px", borderRadius: 10,
                    border: `2px solid ${isActive ? "#0B68B4" : "#E4E4E7"}`,
                    background: isActive ? "#EFF6FF" : "#FAFAFA",
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    color: isActive ? "#1E40AF" : "#71717A",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  {child.prenom || `Enfant ${idx + 1}`}
                  {child.listeEnvoyee && <span style={{ marginLeft: 5, color: "#16A34A" }}>📤</span>}
                </button>
                {enfants.length > 1 && (
                  <button
                    onClick={() => {
                      const newEnfants = enfants.filter((_, i) => i !== idx);
                      setEnfants(newEnfants);
                      setActiveEnfantIdx(Math.min(activeEnfantIdx, newEnfants.length - 1));
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", fontSize: 14, padding: "0 2px" }}
                  >×</button>
                )}
              </div>
            );
          })}
          <button
            onClick={() => {
              const newChild = emptyEnfant(Date.now());
              setEnfants(prev => [...prev, newChild]);
              setActiveEnfantIdx(enfants.length);
            }}
            style={{
              padding: "8px 12px", borderRadius: 10, border: "2px dashed #D4D4D8",
              background: "#FAFAFA", cursor: "pointer", fontSize: 12, fontWeight: 700,
              color: "#71717A", fontFamily: "'Outfit',sans-serif",
            }}
          >+ Ajouter un enfant</button>
        </div>

        {/* ── SCRIPT CRM : bouton sticky en haut ── */}
        {(() => {
          if (!ef.niveau && !ef.prenom && enfants.length <= 1) return null;
          const ppLab = PARENT_PROFILES.find(p => p.id === parentProfile)?.label || "";
          const lines = [];
          if (modeCours) lines.push(`📍 Mode : ${modeCours === "domicile" ? "À domicile" + (villeClient ? " — " + villeClient : "") : modeCours === "enligne" ? "En ligne" : "Peu importe"}`);

          // Multi-children vs single child
          if (enfants.length > 1) {
            lines.push(`👨‍👩‍👧 ${enfants.length} ENFANTS`);
            enfants.forEach((child, idx) => {
              if (child.niveau || child.matieres.length > 0) {
                lines.push(`\n── Enfant ${idx + 1}${child.prenom ? ` (${child.prenom})` : ""} ──`);
                if (child.niveau) {
                  let niv = child.niveau;
                  if (child.classe) niv += ` · ${child.classe}`;
                  if (child.brevetPrep) niv += ` (prep brevet)`;
                  if (child.serieTechno) niv += ` · ${child.serieTechno}`;
                  if (child.spes.length > 0) niv += ` · spés ${child.spes.join("/")}`;
                  if (child.prepaFiliere) niv += ` · ${child.prepaAnnee ? child.prepaAnnee + " " : ""}prépa ${child.prepaFiliere}`;
                  if (child.univFiliere) niv += ` · ${child.univFiliere}`;
                  lines.push(`• Niveau : ${niv}`);
                }
                if (child.matieres.length > 0) lines.push(`• Matières : ${child.matieres.join(", ")}`);
                if (child.listeEnvoyee) lines.push(`• 📤 Liste envoyée`);
                else lines.push(`• ⏳ Liste non envoyée`);
              }
            });
            lines.push("");
          } else {
            lines.push(`🎓 DIAGNOSTIC ACADÉMIQUE`);
            if (ef.niveau) {
              let niv = ef.niveau;
              if (ef.classe) niv += ` · ${ef.classe}`;
              if (ef.brevetPrep) niv += ` (prep brevet)`;
              if (ef.serieTechno) niv += ` · ${ef.serieTechno}`;
              if (ef.spes.length > 0) niv += ` · spés ${ef.spes.join("/")}`;
              if (ef.prepaFiliere) niv += ` · ${ef.prepaAnnee ? ef.prepaAnnee + " " : ""}prépa ${ef.prepaFiliere}`;
              if (ef.univFiliere) niv += ` · ${ef.univFiliere}`;
              lines.push(`• Niveau : ${niv}`);
            }
            if (ef.matieres.length > 0) lines.push(`• Matières : ${ef.matieres.join(", ")}`);
            if (ef.parcoursupCible) lines.push(`• Parcoursup : ${ef.parcoursupCible}${ef.parcoursupEcole ? " — " + ef.parcoursupEcole : ""}`);
            if (ef.objectifVie) lines.push(`• Objectif : ${ef.objectifVie}`);
            if (nbProfs) lines.push(`• Nombre de profs souhaité : ${nbProfs}`);
            if (ef.neuroActive && ef.neuroTrouble) lines.push(`• Neuroatypique : ${ef.neuroTrouble}`);
            // Moyennes
            const hasMoyMat = Object.keys(ef.moyennesMat).some(k => ef.moyennesMat[k]);
            if (ef.moyenneGenerale || hasMoyMat) {
              lines.push(``);
              lines.push(`📊 MOYENNES`);
              if (ef.moyenneGenerale) lines.push(`• Générale : ${ef.moyenneGenerale}/20`);
              ef.matieres.forEach(m => {
                if (ef.moyennesMat[m]) lines.push(`• ${m} : ${ef.moyennesMat[m]}/20`);
              });
            }
            // Liste de profs
            if (ef.listeEnvoyee) lines.push(`📤 Liste de profs : ENVOYÉE`);
            else lines.push(`⏳ Liste de profs : Non envoyée`);
          }

          lines.push(``);
          // Disponibilités
          if (dispoJours.length > 0 || dispoCreneaux.length > 0 || dispoNote) {
            lines.push(`📅 DISPONIBILITÉS`);
            if (dispoJours.length > 0) lines.push(`• Créneaux 1 : ${dispoJours.join(", ")} — ${dispoCreneaux.join(", ")}`);
            if (dispoNote) lines.push(`• Note : ${dispoNote}`);
            if (dispoJours2.length > 0 || dispoCreneaux2.length > 0) lines.push(`• Créneaux 2 : ${dispoJours2.join(", ")} — ${dispoCreneaux2.join(", ")}`);
            lines.push(``);
          }
          if (budget) {
            const budgetLabel = { petit: "Budget serré", moyen: "Budget moyen", gros: "Budget confortable" }[budget];
            lines.push(`💰 ${budgetLabel}`);
            lines.push(``);
          }
          if (notePerso) {
            lines.push(`📝 NOTE`);
            lines.push(`${notePerso}`);
            lines.push(``);
          }
          if (ef.psycho) {
            lines.push(`🧠 PROFIL PSY ÉLÈVE`);
            lines.push(`• Personnalité : ${ef.psycho}`);
            lines.push(``);
          }
          if (parentProfile || souhaitParent) {
            lines.push(`👨‍👩‍👧 PROFIL FAMILLE`);
            if (ppLab) lines.push(`• Profil parent : ${ppLab}`);
            if (souhaitParent && souhaitParent !== "Pas d'avis") lines.push(`• Souhait : ${souhaitParent}`);
            lines.push(``);
          }
          while (lines.length && lines[lines.length - 1] === "") lines.pop();
          const scriptText = lines.join("\n");
          return <div style={{ position: "sticky", top: 0, zIndex: 50, marginBottom: 12, paddingTop: 8, paddingBottom: 4, background: "transparent" }}>
            <C style={{ marginBottom: 0, background: "linear-gradient(135deg,#0369A1,#0EA5E9)", border: "none", padding: "14px 18px", color: "#fff", boxShadow: "0 6px 16px rgba(3,105,161,.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 22 }}>📋</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>Script CRM prêt à coller</div>
                    <div style={{ fontSize: 11, opacity: .9, marginTop: 2 }}>Généré en live à partir de tes inputs</div>
                  </div>
                </div>
                <button onClick={() => setEF("listeEnvoyee", !ef.listeEnvoyee)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: ef.listeEnvoyee ? "1px solid #86EFAC" : "1px solid rgba(255,255,255,.4)", background: ef.listeEnvoyee ? "#16A34A" : "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", transition: "all .15s", display: "flex", alignItems: "center", gap: 4 }}>
                  {ef.listeEnvoyee ? "📤 Envoyée" : "⏳ Non envoyée"}
                </button>
                <CopyBtn text={scriptText} />
                <button onClick={() => { if (confirm("Effacer le diagnostic en cours ?")) resetAndSave(); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#E11D48", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>↺ Nouveau</button>
              </div>
              <textarea value={notePerso} onChange={e => setNotePerso(e.target.value)} placeholder="📝 Note personnalisée..."
                rows={2} style={{ width: "100%", fontSize: 12, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.95)", borderRadius: 8, padding: "8px 12px", marginTop: 8, boxSizing: "border-box", resize: "vertical", color: "#18181B", fontFamily: "'Inter',sans-serif", outline: "none" }} />
            </C>
          </div>;
        })()}

        {/* Mode de cours */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 8, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>📍 Mode de cours</div>
          <div style={{ display: "flex", gap: 6, marginBottom: modeCours === "domicile" ? 10 : 0 }}>
            {[
              { id: "enligne", emoji: "💻", label: "En ligne" },
              { id: "domicile", emoji: "🏠", label: "À domicile" },
              { id: "peuimporte", emoji: "🤷", label: "Peu importe" },
            ].map(m => {
              const on = modeCours === m.id;
              return (
                <button key={m.id} onClick={() => setModeCours(on ? "" : m.id)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${on ? "#16A34A" : "#E4E4E7"}`, background: on ? "#F0FDF4" : "#FAFAFA", cursor: "pointer", textAlign: "center", transition: "all .15s" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{m.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: on ? "#15803D" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>{m.label}</div>
                </button>
              );
            })}
          </div>
          {modeCours === "domicile" && (
            <div style={{ position: "relative" }}>
              {villeClient ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F0FDF4", border: "2px solid #16A34A", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D", flex: 1 }}>📍 {villeClient} ({villeCP})</span>
                  <button onClick={() => { setVilleClient(""); setVilleCP(""); setVilleSearch(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#71717A" }}>×</button>
                </div>
              ) : (
                <>
                  <input type="text" value={villeSearch} onChange={e => { const v = e.target.value; setVilleSearch(v); setVilleClient(""); setVilleCP(""); rechercheVille(v); }}
                    placeholder="Tape une ville ou un code postal..."
                    style={{ width: "100%", fontSize: 12, border: "1px solid #C0EAD3", borderRadius: 8, padding: "8px 12px", boxSizing: "border-box" }} />
                  {villeLoading && <div style={{ fontSize: 10, color: "#71717A", marginTop: 4, fontStyle: "italic" }}>Recherche...</div>}
                  {villeSuggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #E4E4E7", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)", zIndex: 50, marginTop: 4, maxHeight: 200, overflowY: "auto" }}>
                      {villeSuggestions.map((s, i) => (
                        <button key={i} onClick={() => { setVilleClient(s.ville); setVilleCP(s.cp); setVilleSearch(""); setVilleSuggestions([]); }}
                          style={{ width: "100%", padding: "8px 12px", border: "none", borderBottom: i < villeSuggestions.length - 1 ? "1px solid #F4F4F5" : "none", background: "#fff", cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#18181B" }}>
                          📍 {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </C>

        {/* Diagnostic academique */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 16, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>📚 Diagnostic academique</div>

          {/* Prénom de l'enfant */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 4 }}>Prénom de l'enfant</div>
            <input
              type="text"
              value={ef.prenom}
              onChange={e => setEF("prenom", e.target.value)}
              placeholder="Ex: Léa, Thomas..."
              style={{ width: "100%", fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 8 }}>Niveau scolaire <span style={{ color: "#E11D48" }}>*</span></div>
            <Chips options={NIVEAUX} selected={ef.niveau} onChange={n => { setEF("niveau", n); setEF("classe", ""); setEF("brevetPrep", false); setEF("spes", []); setEF("parcoursupCible", ""); setEF("prepaFiliere", ""); setEF("serieTechno", ""); const dispos = getMatieresDisponibles(n, "", "", ""); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} color="#16A34A" single={true} />
          </div>

          {/* QUESTIONS CONDITIONNELLES SELON NIVEAU */}
          {ef.niveau === "Primaire" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe précise</div>
              <Chips options={CLASSES_PRIMAIRE} selected={ef.classe} onChange={c => { setEF("classe", c); }} color="#16A34A" single={true} />
            </div>
          )}
          {ef.niveau === "Collège" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe précise <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_COLLEGE} selected={ef.classe} onChange={c => { setEF("classe", c); const dispos = getMatieresDisponibles("Collège", c); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} color="#16A34A" single={true} />
              {ef.classe === "3e" && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setEF("brevetPrep", !ef.brevetPrep)} style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${ef.brevetPrep ? "#16A34A" : "#D4D4D8"}`, background: ef.brevetPrep ? "#16A34A" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 12 }}>{ef.brevetPrep ? "✓" : ""}</button>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>Prépare le brevet (DNB) ?</span>
                </div>
              )}
            </div>
          )}

          {ef.niveau === "Lycée général" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_LYCEE_GENERAL} selected={ef.classe} onChange={c => { setEF("classe", c); setEF("spes", []); setEF("parcoursupCible", ""); const dispos = getMatieresDisponibles("Lycée général", c); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} color="#16A34A" single={true} />

              {(ef.classe === "Première" || ef.classe === "Terminale") && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>{ef.classe === "Première" ? "Spécialités (3 choix)" : "Spécialités conservées (2 choix)"}</div>
                  <div style={{ fontSize: 11, color: "#71717A", marginBottom: 8 }}>Sélectionne {ef.classe === "Première" ? "les 3 spécialités" : "les 2 spécialités gardées"}</div>
                  <Chips options={SPE_PREMIERE} selected={ef.spes} onChange={v => setEF("spes", v)} color="#0B68B4" />
                </div>
              )}

              {ef.classe === "Terminale" && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>🎯 Cible Parcoursup</div>
                  <div style={{ fontSize: 11, color: "#71717A", marginBottom: 8 }}>Sélection en 3 étapes : catégorie → option → école précise</div>

                  {/* Étape 1 : Catégorie */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>1. Type d'études</div>
                  <select value={ef.parcoursupCategorie} onChange={e => { setEF("parcoursupCategorie", e.target.value); setEF("parcoursupCible", ""); setEF("parcoursupEcole", ""); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff", marginBottom: 10 }}>
                    <option value="">— Sélectionner —</option>
                    {Object.entries(PARCOURSUP_HIERARCHY).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k}</option>)}
                  </select>

                  {/* Étape 2 : Option précise */}
                  {ef.parcoursupCategorie && PARCOURSUP_HIERARCHY[ef.parcoursupCategorie] && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>2. Filière / Programme précis</div>
                      <select value={ef.parcoursupCible} onChange={e => { setEF("parcoursupCible", e.target.value); setEF("parcoursupEcole", ""); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff", marginBottom: 10 }}>
                        <option value="">— Sélectionner —</option>
                        {Object.entries(PARCOURSUP_HIERARCHY[ef.parcoursupCategorie].options).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Étape 3 : École précise */}
                  {ef.parcoursupCible && PARCOURSUP_HIERARCHY[ef.parcoursupCategorie]?.options[ef.parcoursupCible] && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#71717A", marginBottom: 5 }}>3. École / Établissement ciblé <span style={{ color: "#A1A1AA" }}>(optionnel)</span></div>
                      <select value={ef.parcoursupEcole} onChange={e => setEF("parcoursupEcole", e.target.value)} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff" }}>
                        <option value="">— Sélectionner (optionnel) —</option>
                        {PARCOURSUP_HIERARCHY[ef.parcoursupCategorie].options[ef.parcoursupCible].ecoles.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Récapitulatif */}
                  {ef.parcoursupCible && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #C0EAD3", fontSize: 11, color: "#15803D" }}>
                      🎯 <strong>{ef.parcoursupCategorie}</strong> › {ef.parcoursupCible}{ef.parcoursupEcole && ` › ${ef.parcoursupEcole}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {ef.niveau === "Lycée techno" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_LYCEE_TECHNO} selected={ef.classe} onChange={c => { setEF("classe", c); const dispos = getMatieresDisponibles("Lycée techno", c, "", ef.serieTechno); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} color="#16A34A" single={true} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginTop: 12, marginBottom: 8 }}>Série technologique <span style={{ color: "#E11D48" }}>*</span></div>
              <select value={ef.serieTechno} onChange={e => { const s = e.target.value; setEF("serieTechno", s); const dispos = getMatieresDisponibles("Lycée techno", ef.classe, "", s); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff" }}>
                <option value="">— Sélectionner la série —</option>
                {LYCEE_TECHNO_SERIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {ef.niveau === "Lycée pro" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_LYCEE_PRO} selected={ef.classe} onChange={c => setEF("classe", c)} color="#16A34A" single={true} />
            </div>
          )}

          {ef.niveau === "BTS / IUT" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Classe <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={CLASSES_BTS} selected={ef.classe} onChange={c => setEF("classe", c)} color="#16A34A" single={true} />
            </div>
          )}

          {ef.niveau === "Prépa" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Année <span style={{ color: "#E11D48" }}>*</span></div>
              <Chips options={["1re année", "2e année"]} selected={ef.prepaAnnee} onChange={v => setEF("prepaAnnee", v)} color="#16A34A" single={true} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginTop: 12, marginBottom: 8 }}>Filière de prépa <span style={{ color: "#E11D48" }}>*</span></div>
              <select value={ef.prepaFiliere} onChange={e => { const f = e.target.value; setEF("prepaFiliere", f); const dispos = getMatieresDisponibles("Prépa", "", f); setEF("matieres", ef.matieres.filter(m => dispos.includes(m))); }} style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter',sans-serif", background: "#fff" }}>
                <option value="">— Sélectionner —</option>
                {PREPA_FILIERES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {ef.niveau === "Université" && (
            <div style={{ marginBottom: 14, padding: 12, background: "#F0FDF4", borderRadius: 10, border: "1px solid #C0EAD3" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>Année</div>
              <Chips options={CLASSES_UNIV} selected={ef.classe} onChange={c => setEF("classe", c)} color="#16A34A" single={true} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginTop: 12, marginBottom: 6 }}>Filière</div>
              <input value={ef.univFiliere} onChange={e => setEF("univFiliere", e.target.value)} placeholder="Ex : Médecine, Maths-info, Droit, Lettres..." style={{ width: "100%", fontSize: 13, border: "1px solid #C0EAD3", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box", fontFamily: "'Inter',sans-serif" }} />
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 4 }}>Matiere(s)</div>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 8 }}>Clique sur un groupe pour voir les matières</div>
            {(() => {
              const dispos = getMatieresDisponibles(ef.niveau, ef.classe, ef.prepaFiliere, ef.serieTechno);
              // Groupes de matières
              const GROUPS = [
                { id: "scientifique", label: "🔬 Scientifique", color: "#0B68B4",
                  mats: ["Maths","Maths expertes","Maths complémentaires","Physique","Chimie","SVT","NSI","Sciences de l'ingénieur","Biologie-Écologie","Biotechnologies","Technologie","Informatique"] },
                { id: "litteraire", label: "📖 Littéraire", color: "#D97706",
                  mats: ["Français","Littérature","Philosophie","HLP","LLCE","Latin","Grec ancien"] },
                { id: "langues", label: "🌍 Langues", color: "#16A34A",
                  mats: ["Anglais","Espagnol","Allemand","Italien","Chinois","Japonais","Russe","Arabe","Portugais"] },
                { id: "sciences_humaines", label: "🏛️ Sciences Humaines", color: "#7C3AED",
                  mats: ["Histoire-Géo","HGGSP","SES","EMC"] },
                { id: "economie_droit", label: "💼 Éco & Droit", color: "#0369A1",
                  mats: ["Économie","Management","Droit","Gestion","Comptabilité","Marketing","Finance","Sciences de gestion"] },
                { id: "autre", label: "📚 Autre", color: "#71717A",
                  mats: ["📚 Soutien scolaire (toutes matières)","Autre"] },
              ];
              // Construire les groupes visibles (uniquement ceux qui ont des matières dispo)
              const visibleGroups = GROUPS.map(g => ({
                ...g,
                mats: g.mats.filter(m => dispos.includes(m))
              })).filter(g => g.mats.length > 0);
              // Matières non classées → dans "Autre"
              const knownMats = new Set(GROUPS.flatMap(g => g.mats));
              const unclassified = dispos.filter(m => !knownMats.has(m));
              if (unclassified.length > 0) {
                const autreGrp = visibleGroups.find(g => g.id === "autre");
                if (autreGrp) autreGrp.mats = [...autreGrp.mats, ...unclassified];
                else visibleGroups.push({ id: "autre", label: "📚 Autre", color: "#71717A", mats: unclassified });
              }

              return (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {visibleGroups.map(g => {
                      const nbSelected = g.mats.filter(m => ef.matieres.includes(m)).length;
                      const isOpen = ef.openMatGroup === g.id;
                      return (
                        <button key={g.id} onClick={() => setEF("openMatGroup", isOpen ? null : g.id)}
                          style={{
                            padding: "10px 12px", borderRadius: 10,
                            border: `2px solid ${isOpen ? g.color : nbSelected > 0 ? g.color : "#E4E4E7"}`,
                            background: isOpen ? g.color + "12" : nbSelected > 0 ? g.color + "08" : "#FAFAFA",
                            textAlign: "left", cursor: "pointer", transition: "all .15s",
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                          }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: isOpen || nbSelected > 0 ? g.color : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{g.label}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {nbSelected > 0 && <span style={{ fontSize: 10, background: g.color, color: "#fff", borderRadius: 99, padding: "1px 7px", fontWeight: 800 }}>{nbSelected}</span>}
                            <span style={{ fontSize: 11, color: isOpen ? g.color : "#A1A1AA", transition: "transform .2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {ef.openMatGroup && (() => {
                    const g = visibleGroups.find(gg => gg.id === ef.openMatGroup);
                    if (!g) return null;
                    return (
                      <div style={{ marginTop: 10, padding: "10px 12px", background: g.color + "08", border: `1px dashed ${g.color}`, borderRadius: 10 }}>
                        <Chips options={g.mats} selected={ef.matieres} onChange={v => setEF("matieres", v)} color={g.color} />
                      </div>
                    );
                  })()}
                  {ef.matieres.length > 0 && (
                    <div style={{ marginTop: 10, padding: "8px 10px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#15803D", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>✓ Matières sélectionnées</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {ef.matieres.map(m => (
                          <span key={m} style={{ fontSize: 11, background: "#fff", color: "#15803D", padding: "3px 10px", borderRadius: 99, border: "1px solid #86EFAC", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                            {m}
                            <button onClick={() => setEF("matieres", ef.matieres.filter(x => x !== m))} style={{ background: "none", border: "none", cursor: "pointer", color: "#71717A", fontSize: 13, padding: 0, lineHeight: 1 }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </C>

        {/* Nombre de profs */}
        {ef.matieres.length>=2&&<C style={{ marginBottom: 12, borderLeft: `4px solid ${nbProfs==="1"?"#0B68B4":"#16A34A"}` }}>
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

        {/* Neuroatypique toggle */}
        <C style={{ marginBottom: 12, borderLeft: `4px solid ${ef.neuroActive ? "#7C3AED" : "#E4E4E7"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ef.neuroActive ? 12 : 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                🧩 Neuroatypique
                <span style={{ fontSize: 11, background: ef.neuroActive ? "#F5F3FF" : "#F4F4F5", color: ef.neuroActive ? "#7C3AED" : "#71717A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                  {ef.neuroActive ? "ACTIF" : "OFF"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>L'eleve a un profil neuroatypique</div>
            </div>
            <button onClick={() => { setEF("neuroActive", !ef.neuroActive); if (ef.neuroActive) setEF("neuroTrouble", ""); }}
              style={{
                width: 48, height: 26, borderRadius: 99, border: "none", cursor: "pointer", position: "relative",
                background: ef.neuroActive ? "#7C3AED" : "#D4D4D8", transition: "background .2s",
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3,
                left: ef.neuroActive ? 25 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }} />
            </button>
          </div>

          {ef.neuroActive && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#71717A", marginBottom: 8 }}>Type de trouble <span style={{ color: "#E11D48" }}>*</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {NEURO_TROUBLES.map(t => {
                  const on = ef.neuroTrouble === t;
                  const tc = NEURO_COLORS[t] || "#6B7280";
                  return (
                    <button key={t} onClick={() => setEF("neuroTrouble", on ? "" : t)}
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

        {/* Moyennes (optionnel) */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            📊 Moyennes <span style={{ fontSize: 11, fontWeight: 400, color: "#A1A1AA" }}>(optionnel)</span>
          </div>
          <div style={{ fontSize: 12, color: "#71717A", marginBottom: 12 }}>Moyenne générale et par matière choisie</div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", display: "block", marginBottom: 4 }}>Moyenne générale / 20</label>
            <input type="number" min="0" max="20" step="0.5" value={ef.moyenneGenerale} onChange={e => setEF("moyenneGenerale", e.target.value)}
              placeholder="ex: 12.5"
              style={{ width: "100%", fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box" }} />
          </div>
          {(() => {
            const matsPourMoy = ef.matieres.filter(m => m !== "📚 Soutien scolaire (toutes matières)" && m !== "Autre");
            if (matsPourMoy.length === 0) return null;
            return (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>Moyennes par matière</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {matsPourMoy.map(mat => (
                    <div key={mat}>
                      <label style={{ fontSize: 10, color: "#71717A", display: "block", marginBottom: 3 }}>{mat}</label>
                      <input type="number" min="0" max="20" step="0.5"
                        value={ef.moyennesMat[mat] || ""}
                        onChange={e => setEF("moyennesMat", { ...ef.moyennesMat, [mat]: e.target.value })}
                        placeholder="/20"
                        style={{ width: "100%", fontSize: 12, border: "1px solid #E4E4E7", borderRadius: 6, padding: "7px 10px", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </C>

        {/* Disponibilités famille */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            📅 Disponibilités <span style={{ fontSize: 11, fontWeight: 400, color: "#A1A1AA" }}>(optionnel)</span>
          </div>
          <div style={{ fontSize: 12, color: "#71717A", marginBottom: 10 }}>Quand la famille est disponible pour les cours</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>Jours</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"].map(j => {
                const on = dispoJours.includes(j);
                return <button key={j} onClick={() => setDispoJours(on ? dispoJours.filter(x=>x!==j) : [...dispoJours, j])}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${on?"#16A34A":"#E4E4E7"}`, background: on?"#F0FDF4":"#FAFAFA", cursor: "pointer", fontSize: 11, fontWeight: 700, color: on?"#15803D":"#71717A", transition: "all .15s" }}>
                  {j.slice(0,3)}
                </button>;
              })}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>Créneaux</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {[
                ["Matin (8h-12h)","🌅"],
                ["Midi (12h-14h)","☀️"],
                ["Après-midi (14h-17h)","🌤️"],
                ["Fin de journée (17h-19h)","🌇"],
                ["Soir (19h-21h)","🌙"],
              ].map(([c, em]) => {
                const on = dispoCreneaux.includes(c);
                return <button key={c} onClick={() => setDispoCreneaux(on ? dispoCreneaux.filter(x=>x!==c) : [...dispoCreneaux, c])}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${on?"#0B68B4":"#E4E4E7"}`, background: on?"#EFF6FF":"#FAFAFA", cursor: "pointer", fontSize: 11, fontWeight: 700, color: on?"#1E40AF":"#71717A", transition: "all .15s" }}>
                  {em} {c}
                </button>;
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 4 }}>Précision (optionnel)</div>
            <input type="text" value={dispoNote} onChange={e => setDispoNote(e.target.value)}
              placeholder="Ex: Pas le mercredi après-midi, uniquement en visio..."
              style={{ width: "100%", fontSize: 12, border: "1px solid #E4E4E7", borderRadius: 8, padding: "8px 12px", boxSizing: "border-box" }} />
          </div>
        </C>

        {/* 2e créneau de disponibilité */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 4, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            📅 2e créneau <span style={{ fontSize: 11, fontWeight: 400, color: "#A1A1AA" }}>(optionnel, si la famille a 2 enfants ou 2 créneaux)</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 4 }}>Jours</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"].map(j => {
                const on = dispoJours2.includes(j);
                return <button key={j} onClick={() => setDispoJours2(on ? dispoJours2.filter(x=>x!==j) : [...dispoJours2, j])}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${on?"#0B68B4":"#E4E4E7"}`, background: on?"#EFF6FF":"#FAFAFA", cursor: "pointer", fontSize: 11, fontWeight: 700, color: on?"#1E40AF":"#71717A" }}>{j.slice(0,3)}</button>;
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3F3F46", marginBottom: 4 }}>Créneaux</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {[["Matin (8h-12h)","🌅"],["Midi (12h-14h)","☀️"],["Après-midi (14h-17h)","🌤️"],["Fin de journée (17h-19h)","🌇"],["Soir (19h-21h)","🌙"]].map(([c, em]) => {
                const on = dispoCreneaux2.includes(c);
                return <button key={c} onClick={() => setDispoCreneaux2(on ? dispoCreneaux2.filter(x=>x!==c) : [...dispoCreneaux2, c])}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${on?"#0B68B4":"#E4E4E7"}`, background: on?"#EFF6FF":"#FAFAFA", cursor: "pointer", fontSize: 11, fontWeight: 700, color: on?"#1E40AF":"#71717A" }}>{em} {c}</button>;
              })}
            </div>
          </div>
        </C>

        {/* Budget famille */}
        <C style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>💰 Budget famille <span style={{ fontSize: 11, fontWeight: 400, color: "#A1A1AA" }}>(optionnel)</span></div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "petit", emoji: "💸", label: "Serré" },
              { id: "moyen", emoji: "💰", label: "Moyen" },
              { id: "gros", emoji: "🤑", label: "Confortable" },
            ].map(b => {
              const on = budget === b.id;
              return (
                <button key={b.id} onClick={() => setBudget(on ? "" : b.id)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${on ? "#D97706" : "#E4E4E7"}`, background: on ? "#FFFBEB" : "#FAFAFA", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{b.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: on ? "#92400E" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>{b.label}</div>
                </button>
              );
            })}
          </div>
        </C>

        {/* 🎭 Profil du parent (collapsible) */}
        <C style={{ marginBottom: 12, borderLeft: `4px solid ${parentProfile ? "#D97706" : "#E4E4E7"}` }}>
          <button
            onClick={() => setOpenParent(!openParent)}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                  🎭 Profil du parent
                  {parentProfile && <span style={{ fontSize: 11, color: "#D97706", fontWeight: 600 }}>· {PARENT_PROFILES.find(p => p.id === parentProfile)?.label}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>Adapte l'introduction, les questions SPIN et le closing du script</div>
              </div>
              <span style={{ fontSize: 16, color: "#71717A", transform: openParent ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </div>
          </button>
          {openParent && (
            <div style={{ marginTop: 12 }}>
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
            </div>
          )}
        </C>

        {/* 🧠 Profil Psychologique (collapsible) */}
        <C style={{ marginBottom: 12, borderLeft: `4px solid ${ef.psycho ? "#16A34A" : "#E4E4E7"}` }}>
          <button
            onClick={() => setOpenPsycho(!openPsycho)}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                  🧠 Profil Psychologique <span style={{ fontSize: 11, background: "#E1FFED", color: "#16A34A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>V5</span>
                  {ef.psycho && <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>· {ef.psycho}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>La personnalité de l'élève détermine le profil de prof idéal</div>
              </div>
              <span style={{ fontSize: 16, color: "#71717A", transform: openPsycho ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </div>
          </button>
          {openPsycho && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {PSYCH_PROFILES.map(p => {
                  const on = ef.psycho === p;
                  const emoji = { "Introverti / Réservé": "🤫", "Décrocheur / Démotivé": "😮‍💨", "Compétiteur / Haut Potentiel": "🔥", "Stressé / Anxieux": "😰" }[p] || "👤";
                  return (
                    <button key={p} onClick={() => setEF("psycho", on ? "" : p)}
                      style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${on ? "#16A34A" : "#E4E4E7"}`, background: on ? "#E1FFED" : "#FAFAFA", textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#16A34A" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{p}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </C>

        {/* 🎯 Objectif de vie (collapsible) */}
        <C style={{ marginBottom: 12, borderLeft: `4px solid ${ef.objectifVie ? "#0B68B4" : "#E4E4E7"}` }}>
          <button
            onClick={() => setOpenObjectif(!openObjectif)}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                  🎯 Objectif de vie <span style={{ fontSize: 11, background: "#E1FFED", color: "#16A34A", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>V5</span>
                  {ef.objectifVie && <span style={{ fontSize: 11, color: "#0B68B4", fontWeight: 600 }}>· {ef.objectifVie}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>Qu'est-ce que cette famille veut vraiment accomplir ?</div>
              </div>
              <span style={{ fontSize: 16, color: "#71717A", transform: openObjectif ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </div>
          </button>
          {openObjectif && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {[
                  ["Remise à niveau", "🔄", "Rattraper le niveau de la classe"],
                  ["Réussite concours", "🏆", "Integrer une grande ecole ou un programme selectif"],
                  ["Méthodologie pure", "🗂️", "Apprendre a apprendre"],
                  ["Excellence académique", "⭐", "Etre le meilleur dans sa matiere"],
                ].map(([o, em, desc]) => {
                  const on = ef.objectifVie === o;
                  return (
                    <button key={o} onClick={() => setEF("objectifVie", on ? "" : o)}
                      style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${on ? "#0B68B4" : "#E4E4E7"}`, background: on ? "#EFF6FF" : "#FAFAFA", textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{em}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#1E40AF" : "#3F3F46", fontFamily: "'Outfit',sans-serif" }}>{o}</div>
                      <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 2 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </C>

        {/* ── STEP 3 : Recherche automatique de profs via IA ── */}
        <C style={{ marginBottom: 12, borderLeft: "4px solid #16A34A", background: "#F0FDF4" }}>
          <Btn onClick={() => {
            // Utilise le modeCours sélectionné plus haut
            if (modeCours === "domicile" && villeClient) { setSearchMode("atHome"); setSearchCity(villeClient); }
            else { setSearchMode("online"); }
            setTimeout(searchProfsWithAI, 100);
          }} disabled={searchLoading || !ef.niveau || ef.matieres.length === 0} full color="#16A34A" style={{ padding: "12px", borderRadius: 99, fontSize: 14 }}>
            {searchLoading ? "🔎 Recherche en cours..." : "🔍 Trouver un prof avec l'IA"}
          </Btn>
          {modeCours === "domicile" && villeClient && (
            <Btn onClick={signalerPasDeProf} outline color="#E11D48" style={{ padding: "10px", borderRadius: 99, fontSize: 12, marginTop: 8, width: "100%" }}>
              {noProfSignaled ? "✅ Zone signalée !" : `📍 Pas de prof à domicile à ${villeClient}`}
            </Btn>
          )}
          {searchError && <div style={{ marginTop: 8, padding: "9px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 11, color: "#B91C1C" }}>{searchError}</div>}
          {searchResults && (
            <div style={{ marginTop: 12 }}>
              {searchResults.verdict && (
                <div style={{ marginBottom: 10, padding: "8px 12px", background: "#fff", borderRadius: 8, fontSize: 12, color: "#3F3F46", fontStyle: "italic", borderLeft: "3px solid #16A34A" }}>
                  💬 {searchResults.verdict}
                </div>
              )}
              {(searchResults.results || []).map((r, i) => {
                const col = r.score >= 75 ? "#16A34A" : r.score >= 50 ? "#D97706" : "#E11D48";
                // Slugify le titre pour construire l'URL Sherpas : /t/titre-slugifie
                const slug = (r.titre || "")
                  .toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire accents
                  .replace(/['']/g, "") // retire apostrophes
                  .replace(/[^a-z0-9]+/g, "-") // non-alphanum → tiret
                  .replace(/^-+|-+$/g, "") // trim tirets
                  .replace(/-+/g, "-"); // collapse tirets
                const profileUrl = slug ? `https://sherpas.com/t/${slug}?locationOfInterest=online` : null;
                return (
                  <div key={i} style={{ marginBottom: 8, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #C0EAD3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>#{i + 1} · {r.nom || "Prof"}{r.prix ? ` · ${r.prix}` : ""}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: "'Outfit',sans-serif" }}>{r.score}/100</div>
                    </div>
                    {r.titre && <div style={{ fontSize: 12, color: "#3F3F46", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{r.titre}</div>}
                    {r.experience && <div style={{ fontSize: 10, color: "#71717A", marginBottom: 4 }}>📊 {r.experience}</div>}
                    {r.raison && <div style={{ fontSize: 11, color: "#3F3F46", fontStyle: "italic", marginBottom: 6 }}>💡 {r.raison}</div>}
                    {profileUrl && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <a href={profileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "4px 10px", background: "#EFF6FF", color: "#0B68B4", borderRadius: 6, fontSize: 10, fontWeight: 700, textDecoration: "none", border: "1px solid #BFDBFE" }}>🔗 Voir profil</a>
                        <button onClick={() => { setProfUrl(profileUrl); }} style={{ padding: "4px 10px", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✨ Analyser en détail</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {searchResults._searchUrl && (
                <a href={searchResults._searchUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, padding: "8px 12px", background: "#16A34A", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>👉 Voir les profils sur sherpas.com</a>
              )}
            </div>
          )}
        </C>

        {/* ── Résultats IA (si profUrl renseigné via recherche auto) ── */}
        {aiArguments && <C style={{ marginBottom: 12, background: "#FAF5FF", border: "2px solid #DDD6FE", padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#6D28D9", fontFamily: "'Outfit',sans-serif" }}>🎯 Analyse IA du profil</div>
            <CopyBtn text={JSON.stringify(aiArguments, null, 2)} />
          </div>

          {/* SCORE GLOBAL + VERDICT */}
          {typeof aiArguments.matchScore === "number" && (() => {
            const s = aiArguments.matchScore;
            const color = s >= 75 ? "#16A34A" : s >= 50 ? "#D97706" : "#E11D48";
            const bg = s >= 75 ? "#F0FDF4" : s >= 50 ? "#FFFBEB" : "#FEF2F2";
            const border = s >= 75 ? "#86EFAC" : s >= 50 ? "#FDE68A" : "#FCA5A5";
            return <div style={{ marginBottom: 14, padding: "16px 18px", background: bg, border: `2px solid ${border}`, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color, fontFamily: "'Outfit',sans-serif" }}>{s}<span style={{ fontSize: 16, opacity: .7 }}>/100</span></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Score global de match</div>
                  <div style={{ height: 8, background: "#fff", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s}%`, background: color, transition: "width .4s" }} />
                  </div>
                </div>
              </div>
              {aiArguments.verdict && <div style={{ fontSize: 13, color: "#3F3F46", fontWeight: 600, marginTop: 4 }}>{aiArguments.verdict}</div>}
            </div>;
          })()}

          {/* SCORES PAR CRITÈRE */}
          {aiArguments.criteria && (
            <div style={{ marginBottom: 14, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>📊 Détail par critère</div>
              {[
                ["matieres", "📚 Matières"],
                ["niveau", "🎓 Niveau"],
                ["parcours", "🎖️ Parcours académique"],
                ["experience", "⭐ Expérience"],
                ["profilPsy", "🧠 Profil psy"],
                ["specifique", "🎯 Spécifique"],
              ].map(([key, label]) => {
                const c = aiArguments.criteria[key];
                if (!c) return null;
                const sc = c.score || 0;
                const col = sc >= 75 ? "#16A34A" : sc >= 50 ? "#D97706" : "#E11D48";
                return <div key={key} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3F3F46" }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: col, fontFamily: "'Outfit',sans-serif" }}>{sc}/100</span>
                  </div>
                  <div style={{ height: 5, background: "#F4F4F5", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: `${sc}%`, background: col, transition: "width .3s" }} />
                  </div>
                  {c.evidence && (
                    <div style={{ fontSize: 10, color: "#3F3F46", background: "#F4F4F5", padding: "4px 8px", borderRadius: 4, marginBottom: 3, borderLeft: `2px solid ${col}` }}>
                      📌 <span style={{ fontStyle: "italic" }}>{c.evidence}</span>
                    </div>
                  )}
                  {c.comment && <div style={{ fontSize: 10, color: "#71717A", fontStyle: "italic", lineHeight: 1.4 }}>{c.comment}</div>}
                </div>;
              })}
            </div>
          )}

          {aiArguments.summary && (
            <div style={{ marginBottom: 12, padding: "10px 12px", background: "#fff", borderRadius: 8, fontSize: 12, color: "#3F3F46", fontStyle: "italic", borderLeft: "3px solid #7C3AED" }}>
              📋 {aiArguments.summary}
            </div>
          )}
          {[
            ["hook", "🪝 LE CROCHET", "#16A34A"],
            ["trust", "🏆 CONFIANCE", "#0B68B4"],
            ["bridge", "🌉 PONT PÉDAGOGIQUE", "#D97706"],
            ["personnalisation", "🎭 PERSONNALISATION", "#7C3AED"],
            ["rebound", "↩️ REBOND OBJECTION", "#E11D48"],
          ].map(([key, label, color]) => aiArguments[key] && (
            <div key={key} style={{ marginBottom: 10, padding: "12px 14px", background: "#fff", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
              <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.6 }}>{aiArguments[key]}</div>
            </div>
          ))}

          {/* Toggle contenu brut récupéré (debug) */}
          {aiRawContent && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowRawContent(!showRawContent)}
                style={{ background: "none", border: "1px dashed #A1A1AA", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#71717A", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                {showRawContent ? "🔒 Masquer" : "🔍 Voir"} le contenu brut récupéré (debug)
              </button>
              {showRawContent && (
                <pre style={{ marginTop: 8, padding: "10px 12px", background: "#18181B", color: "#E4E4E7", borderRadius: 8, fontSize: 10, lineHeight: 1.5, maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {aiRawContent}
                </pre>
              )}
            </div>
          )}
        </C>}

        {/* Matieres compatibility analysis (shown in step 1 if applicable) */}
        {matAnalysis && matAnalysis.type === "college_polyvalent" && (()=>{
          const matsList = ef.matieres.join(", ");
          const polyScript = `Bonne nouvelle — au niveau ${ef.niveau}, un seul professeur peut tout à fait accompagner ${nom} en ${matsList}.\n\nPourquoi ? Parce qu'au collège, le programme reste suffisamment généraliste pour qu'un bon étudiant universitaire ou un professeur de l'Éducation Nationale maîtrise l'ensemble des matières.\n\nCe que je vous recommande :\n• Un étudiant universitaire polyvalent (L2-M1) qui a un bon niveau général — il pourra travailler toutes les matières avec ${nom} dans la même séance\n• Ou un professeur de l'Éducation Nationale qui enseigne déjà à ce niveau et connaît parfaitement les attendus du programme\n\nL'avantage d'un seul prof pour ${nom} :\n• Un seul interlocuteur = ${nom} crée un vrai lien de confiance\n• Le prof voit les connexions entre les matières (ex : la rigueur en maths aide en français)\n• Organisation simplifiée pour vous — un seul créneau, un seul suivi\n• Le prof connaît les forces ET les faiblesses de ${nom} dans toutes les matières\n\nC'est d'ailleurs ce qu'on recommande jusqu'à la 3ème — un prof polyvalent qui suit l'élève globalement est souvent plus efficace que plusieurs spécialistes à ce niveau.`;
          return <C style={{ marginBottom: 14, background: "#F0FDF4", border: "2px solid #86EFAC", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <Pill color="#16A34A">1 PROF POLYVALENT — {ef.niveau}</Pill>
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
                <div style={{ fontSize: 11, color: "#71717A" }}>{ef.matieres.join(" + ")} → {matAnalysis.combo.filiere}</div>
              </div>
              <CopyBtn text={getComboScript(matAnalysis.combo, nom, ef.niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #16A34A" }}>
              {getComboScript(matAnalysis.combo, nom, ef.niveau)}
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
                <div style={{ fontSize: 11, color: "#71717A" }}>{ef.matieres.join(" + ")} — Filieres trop differentes</div>
              </div>
              <CopyBtn text={getIncompatibleScript(matAnalysis, nom, ef.niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #E11D48" }}>
              {getIncompatibleScript(matAnalysis, nom, ef.niveau)}
            </div>
          </C>
        )}

        {/* SOUTIEN SCOLAIRE — toutes matieres */}
        {matAnalysis && matAnalysis.type === "soutien_scolaire" && (()=>{
          const isPrimaire = ef.niveau === "Primaire";
          const isCollege = ef.niveau === "Collège";
          const isLycee = ef.niveau === "Lycée général" || ef.niveau === "Lycée pro";
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
                <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>{ef.matieres.join(" + ")} sont dans le meme domaine. Un bon profil peut couvrir les deux.</div>
              </div>
            </div>
          </C>
        )}


        {!ef.niveau && <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 10, textAlign: "center" }}>Renseigne le niveau pour voir la recommandation en direct</div>}

        {/* ── RESULTS PANEL : Top 3 + Toolkit + (step 3) Guide argumentation ── */}
        {portrait && renderResults()}

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Btn onClick={resetAndSave} full outline color="#71717A" style={{ padding: "11px", borderRadius: 99, fontSize: 13 }}>↺ Nouveau diagnostic</Btn>
        </div>
      </div>
    );

  // ═══════════════════════════════════════════════════════════════
  // RENDER RESULTS : Top 3 + Toolkit (always) + Guide argumentation (step 3)
  // Appelée depuis step 1 — rend le panel résultats toujours visible
  // ═══════════════════════════════════════════════════════════════
  function renderResults() {
    if (!portrait) return null;
    const nom = ef.prenom || "l'eleve";
    const top3 = portrait.slice(0, 3);
    const maxScore = top3[0]?.score || 1;
    const pp = parentProfile || "rationnel";
    const ppLabel = PARENT_PROFILES.find(p => p.id === pp)?.label || "Parent rationnel";

    // ── Analyse compatibilite matieres (visible aussi en Step 2) ──
    const matAnalysisStep2 = (nbProfs === "1" && ef.matieres.length >= 2) ? analyzeMatieresCompatibility(ef.matieres, ef.niveau) : null;

    // ── Recommandation hiérarchique précise ──
    const recommendedPath = getRecommendedHierarchy({
      niveau: ef.niveau, classe: ef.classe, brevetPrep: ef.brevetPrep, spes: ef.spes, parcoursupCategorie: ef.parcoursupCategorie, parcoursupCible: ef.parcoursupCible, parcoursupEcole: ef.parcoursupEcole, prepaFiliere: ef.prepaFiliere, univFiliere: ef.univFiliere, serieTechno: ef.serieTechno,
      matieres: ef.matieres, psycho: ef.psycho, objectif: ef.objectifVie
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
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8, padding: "12px 14px", background: "#FAFAFA", borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600, marginBottom: 2 }}>🔦 Résultats en direct</div>
            <div style={{ color: "#71717A", fontSize: 11 }}>
              {nom}{ef.psycho ? ` · ${ef.psycho}` : ""}{ef.objectifVie ? ` · ${ef.objectifVie}` : ""}
              {ef.serieTechno && <span style={{ color: "#0B68B4", fontWeight: 600 }}> · 🏛️ {ef.serieTechno}</span>}
              {ef.neuroActive && ef.neuroTrouble && <span style={{ color: "#7C3AED", fontWeight: 600 }}> · 🧩 {ef.neuroTrouble}</span>}
              {parentProfile && <span style={{ color: "#D97706", fontWeight: 600 }}> · 🎭 {ppLabel}</span>}
            </div>
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
                <div style={{ fontSize: 11, color: "#71717A" }}>{ef.matieres.join(" + ")} — Filières trop différentes</div>
              </div>
              <CopyBtn text={getIncompatibleScript(matAnalysisStep2, nom, ef.niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #E11D48" }}>
              {getIncompatibleScript(matAnalysisStep2, nom, ef.niveau)}
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
                <div style={{ fontSize: 11, color: "#71717A" }}>{ef.matieres.join(" + ")} → {matAnalysisStep2.combo.filiere}</div>
              </div>
              <CopyBtn text={getComboScript(matAnalysisStep2.combo, nom, ef.niveau)} />
            </div>
            <div style={{ fontSize: 13, color: "#3F3F46", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #16A34A" }}>
              {getComboScript(matAnalysisStep2.combo, nom, ef.niveau)}
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
            💡 Basé sur : {ef.niveau}{ef.classe ? ` ${ef.classe}` : ""}{ef.brevetPrep ? " (brevet)" : ""}{ef.serieTechno ? ` · ${ef.serieTechno}` : ""}{ef.spes.length > 0 ? ` · spés ${ef.spes.join("/")}` : ""}{ef.parcoursupCible ? ` · cible ${ef.parcoursupCible}` : ""}{ef.prepaFiliere ? ` · ${ef.prepaAnnee ? ef.prepaAnnee + " " : ""}${ef.prepaFiliere}` : ""}
          </div>
        </C>

        {/* ── BOITE A OUTILS FAMILLE : echeances + programmes ── */}
        {(()=>{
          const echeances = ef.niveau ? getEcheances(ef.niveau) : [];
          const matieresWithProg = ef.matieres.filter(m => m !== "📚 Soutien scolaire (toutes matières)" && m !== "Autre");
          if (echeances.length === 0 && matieresWithProg.length === 0) return null;
          const classeForProg = ef.classe === "Première" ? "Première (spé)"
            : ef.classe === "Terminale" ? "Terminale (spé)"
            : ef.classe;
          return <C style={{ marginBottom: 12, background: "#EFF6FF", border: "2px solid #BFDBFE", padding: openToolkit ? "16px 20px" : "12px 18px", cursor: "pointer" }} onClick={() => setOpenToolkit(!openToolkit)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🧰</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#1E40AF", fontFamily: "'Outfit',sans-serif" }}>Boîte à outils famille</div>
                  <div style={{ fontSize: 11, color: "#3B82F6" }}>Échéances + programmes officiels</div>
                </div>
              </div>
              <span style={{ fontSize: 16, color: "#1E40AF", transition: "transform .2s", transform: openToolkit ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </div>
            {openToolkit && <div onClick={e => e.stopPropagation()} style={{ marginTop: 14 }}>

            {/* Echeances */}
            {echeances.length > 0 && (
              <div style={{ marginBottom: matieresWithProg.length > 0 ? 16 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>📅 Échéances clés — {niveau}{classe ? ` (${classe})` : ""}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {echeances.map((e, i) => {
                    const c = e.type === "exam" ? "#E11D48" : e.type === "warn" ? "#DA4F00" : "#0B68B4";
                    const bg = e.type === "exam" ? "#FEF2F2" : e.type === "warn" ? "#FFF7F0" : "#EFF6FF";
                    const ic = e.type === "exam" ? "📝" : e.type === "warn" ? "⚠️" : "ℹ️";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: bg, borderRadius: 8, borderLeft: `3px solid ${c}` }}>
                        <span style={{ fontSize: 14 }}>{ic}</span>
                        <div style={{ minWidth: 110, fontSize: 11, fontWeight: 700, color: c, fontFamily: "'Outfit',sans-serif" }}>{e.date}</div>
                        <div style={{ flex: 1, fontSize: 12, color: "#3F3F46" }}>{e.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Programmes par matiere */}
            {matieresWithProg.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>📚 Grandes lignes du programme</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {matieresWithProg.map(mat => {
                    const prog = getProgramme(mat, niveau, classeForProg);
                    if (!prog) return null;
                    let items = Array.isArray(prog) ? prog : prog.items;
                    let classeLabel = !Array.isArray(prog) && prog.__key ? ` — ${prog.__key}` : "";
                    const details = getProgrammeDetails(mat, niveau);
                    return (
                      <div key={mat} style={{ padding: "12px 14px", background: "#fff", borderRadius: 8, border: "1px solid #BFDBFE" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#1E40AF", marginBottom: 8, fontFamily: "'Outfit',sans-serif" }}>📖 {mat}{classeLabel}</div>
                        {details?.objectifs && (
                          <div style={{ marginBottom: 8, padding: "8px 10px", background: "#F0FDF4", borderRadius: 6, borderLeft: "3px solid #16A34A" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#15803D", marginBottom: 3, textTransform: "uppercase" }}>🎯 Objectifs</div>
                            <div style={{ fontSize: 11, color: "#3F3F46", lineHeight: 1.6 }}>{details.objectifs}</div>
                          </div>
                        )}
                        {items && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#1E40AF", marginBottom: 4, textTransform: "uppercase" }}>📚 Chapitres</div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#3F3F46", lineHeight: 1.7 }}>
                              {items.map((it, i) => <li key={i}>{it}</li>)}
                            </ul>
                          </div>
                        )}
                        {details?.difficultes && (
                          <div style={{ marginBottom: 8, padding: "8px 10px", background: "#FEF2F2", borderRadius: 6, borderLeft: "3px solid #E11D48" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#B91C1C", marginBottom: 4, textTransform: "uppercase" }}>⚠️ Points difficiles</div>
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: "#3F3F46", lineHeight: 1.6 }}>
                              {details.difficultes.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                        )}
                        {details?.conseils && (
                          <div style={{ padding: "8px 10px", background: "#FFFBEB", borderRadius: 6, borderLeft: "3px solid #D97706" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#92400E", marginBottom: 3, textTransform: "uppercase" }}>💡 Conseil Sherpas</div>
                            <div style={{ fontSize: 11, color: "#3F3F46", lineHeight: 1.6, fontStyle: "italic" }}>{details.conseils}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>}
          </C>;
        })()}

      </>
    );
  }


  return null;
}

export default SalesLanterne;
