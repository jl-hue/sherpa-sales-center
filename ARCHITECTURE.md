# Architecture — Sherpas Sales Center V5

## Vue d'ensemble

```
                    +------------------+
                    |   LoginScreen    |
                    |  (auth simple)   |
                    +--------+---------+
                             |
                    handleLogin(user)
                             |
                    +--------v---------+
                    |       App        |
                    | (state central)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v--------+
     |   Sales    |  |   Manager   |  |  Formateur  |
     | (8 pages)  |  |  (7 pages)  |  |  (5 pages)  |
     +------------+  +-------------+  +-------------+
```

## Authentification

```
 Utilisateur        Mot de passe          Role
 +-----------+     +-------------+     +-----------+
 | Julien    | --> | Sherpas2026 | --> | sales     |
 | Jonathan  | --> | (commun)    | --> | sales     |
 | Manager   | --> |             | --> | manager   |
 | Formateur | --> |             | --> | formateur |
 +-----------+     +-------------+     +-----------+

 + Utilisateurs dynamiques via config Supabase (extra_users)
```

## Flux de donnees (Supabase)

```
 +-------------------+       +-------------------+
 |   React State     |       |     Supabase      |
 |   (local-first)   |       |   (cloud sync)    |
 +--------+----------+       +--------+----------+
          |                            |
          |  1. Login -> loadAll()     |
          |  ========================> |
          |  <-- feedbacks, matchings  |
          |      demandes, rentree,    |
          |      suggestions, stock,   |
          |      config                |
          |                            |
          |  2. User submits form      |
          |  -- setState (immediat) -->|
          |  -- sb.insert (async) ---->|
          |                            |
          |  3. Real-time (channels)   |
          |  <== postgres_changes ===  |
          |  (INSERT/UPDATE/DELETE)     |
          |                            |
          |  4. Fallback               |
          |  Si Supabase KO:           |
          |  INIT_DATA locales         |
          +----------------------------+
```

## Tables Supabase (7)

```
 feedbacks          matchings           demandes
 +---------------+  +---------------+  +---------------+
 | id            |  | id            |  | id            |
 | date          |  | date          |  | date          |
 | auteur        |  | auteur        |  | auteur        |
 | anonyme       |  | ideal_typ     |  | cp            |
 | client_types[]|  | chosen_typ    |  | ville         |
 | objections[]  |  | followed      |  | matieres[]    |
 | bien[]        |  | niveau        |  | niveau        |
 | bloque[]      |  | psycho        |  | typo[]        |
 | confiance     |  | created_at    |  | created_at    |
 | suggestions   |  +---------------+  +---------------+
 | created_at    |
 +---------------+

 rentree             suggestions         stock
 +---------------+  +---------------+  +---------------+
 | id            |  | id            |  | typ (PK)      |
 | date          |  | date          |  | dispo          |
 | auteur        |  | auteur        |  | nb             |
 | famille       |  | type          |  | note           |
 | classe        |  | contenu       |  +---------------+
 | matieres[]    |  | statut        |
 | rappel        |  | created_at    |  config
 | notes         |  +---------------+  +---------------+
 | created_at    |                     | key (PK)      |
 +---------------+                     | value (JSON)  |
                                       +---------------+
                                       keys: formations,
                                             extra_users
```

## Moteur de Matching — Lanterne V5

```
 INPUTS                          ALGORITHME                    OUTPUT
 +-------------------+          +-------------------+         +-------------------+
 | Niveau scolaire   |--+       | computeV5()       |         | Classement des    |
 | Profil psycho     |--+-----> | Score = sum of:    |-------> | 6 types de profs  |
 | Objectif de vie   |--+       |   RULES.niveau     |         | tries par score   |
 | Curseur accomp.   |--+       |   RULES.psycho     |         +-------------------+
 +-------------------+          |   RULES.objectif   |                 |
                                |   RULES.accomp     |          +------v------+
                                +-------------------+          | Dual Path   |
                                                               +------+------+
                                                               |      |
                                                        +------v+  +--v-------+
                                                        |Opt. A |  | Opt. B   |
                                                        |Ideal  |  | Manuel   |
                                                        |Matrice|  | (stock)  |
                                                        +---+---+  +----+-----+
                                                            |           |
                                                     +------v-----------v------+
                                                     |   ARG_ENGINE            |
                                                     |   4 scripts:            |
                                                     |   Hook, Trust,          |
                                                     |   Bridge, Rebound       |
                                                     +-------------------------+
```

## Composants React par role

```
 SALES (8 pages)                MANAGER (7 pages)           FORMATEUR (5 pages)
 +------------------------+    +------------------------+   +------------------------+
 | SalesDash         [/]  |    | ManagerVue        [/]  |   | FormateurScripts  [/]  |
 | SalesLanterne     [*]  |    | ManagerMatching   [*]  |   | FormateurFormations[*] |
 |   +- MatriceNeuro      |    | ManagerBesoins        |   | FormateurStock         |
 | SalesScripts           |    | ManagerRentree        |   | FormateurSuggestions   |
 | SalesObjections        |    | ManagerFeedbacks      |   | FormateurUsers         |
 | SalesFormation         |    | ManagerProgression    |   +------------------------+
 | SalesFeedback          |    | ManagerUsers      [*] |
 | SalesDemandes          |    +------------------------+
 | SalesRentree           |
 +------------------------+    [/] = page d'accueil du role
                               [*] = composant complexe (>100 lignes)
```

## Composants UI partages (Atoms)

```
 +-------+  +--------+  +------+  +-----+  +-------+
 |  C    |  |  GC    |  | Pill |  | Btn |  |  Tog  |
 | Card  |  | Green  |  | Tag  |  |     |  |Toggle |
 | blanc |  | Card   |  |      |  |     |  |       |
 +-------+  +--------+  +------+  +-----+  +-------+

 +-------+  +------+  +--------+  +---------+  +------+
 | Chips |  |  ST  |  |  Stat  |  | CopyBtn |  | Logo |
 | Multi |  |Title |  |  KPI   |  | Copier  |  | SVG  |
 | Select|  |      |  |  Card  |  | Script  |  |      |
 +-------+  +------+  +--------+  +---------+  +------+
```

## Arborescence cible (Vite + React)

```
sherpas-sales-center/
+-- index.html
+-- package.json
+-- vite.config.js
+-- .env                        VITE_SUPABASE_URL, VITE_SUPABASE_KEY
+-- .gitignore
+-- src/
    +-- main.jsx                Point d'entree React
    +-- App.jsx                 Auth + routing + state central
    +-- styles/
    |   +-- global.css          Reset, fonts, animations
    +-- lib/
    |   +-- supabase.js         Client + row converters
    |   +-- matching.js         computeV5, getLabel, refine, getArgs
    |   +-- utils.js            today(), cArr()
    +-- constants/
    |   +-- brand.js            Couleurs B, PASSWORD, USERS
    |   +-- profTypes.js        PROF_TYPES, RULES, PROF_LABELS, REFINE
    |   +-- argEngine.js        ARG_ENGINE (scripts de vente)
    |   +-- neuroMatrix.js      NEURO_MATRIX, NEURO_PROFS, NEURO_TROUBLES
    |   +-- data.js             INIT_STOCK, INIT_SCRIPTS, INIT_OBJECTIONS...
    |   +-- formations.js       FORMATION_DEFAULT
    +-- components/
        +-- ui/                 C, GC, Pill, Btn, Tog, Chips, ST, Stat,
        |                       CopyBtn, Logo, LoadingOverlay
        +-- layout/
        |   +-- Sidebar.jsx
        |   +-- LoginScreen.jsx
        +-- sales/
        |   +-- Dashboard.jsx
        |   +-- Lanterne.jsx    (inclut MatriceNeuro)
        |   +-- Scripts.jsx
        |   +-- Objections.jsx
        |   +-- Formation.jsx
        |   +-- Feedback.jsx
        |   +-- Demandes.jsx
        |   +-- Rentree.jsx
        +-- manager/
        |   +-- VueGlobale.jsx
        |   +-- Matching.jsx
        |   +-- Besoins.jsx
        |   +-- Rentree.jsx
        |   +-- Feedbacks.jsx
        |   +-- Progression.jsx
        |   +-- Users.jsx
        +-- formateur/
            +-- Scripts.jsx
            +-- Formations.jsx
            +-- Stock.jsx
            +-- Suggestions.jsx
            +-- Users.jsx
```
