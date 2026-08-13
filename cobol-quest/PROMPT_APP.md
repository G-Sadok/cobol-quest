Tu travailles sur le projet COBOL QUEST (application macOS). Protocole strict de
cette itération :

1. Lis `CAHIER_DES_CHARGES.md` (la loi du projet), le contenu du dossier
   `design/` (le design fait foi pour tout le visuel), puis `ETAT_APP.md`
   (la feuille de route).
2. S'il existe une tâche marquée `[!]` (bloquée), traite-la en priorité par le
   plus petit correctif possible. Sinon, prends la PREMIÈRE tâche non cochée.
3. Réalise UNE SEULE tâche, mais réalise-la EN ENTIER : code, puis vérifie -
   `cd app && npm run build` et `npx vitest run` (dès que les tests existent).
   Corrige jusqu'au vert avant de conclure.
4. GIT, RÈGLE CONTRACTUELLE : chaque évolution du projet est un commit.
   Commits atomiques (jamais deux sujets dans un commit ; une tâche qui touche
   plusieurs aspects = plusieurs commits), messages en français préfixés
   (`app:`, `design:`, `quiz:`, `electron:`, `tests:`, `doc:`). Il est INTERDIT
   de terminer une itération avec des fichiers non committés
   (`git status` doit être propre). SIGNATURE : les commits sont au nom de
   l'utilisateur, point final. Aucune mention d'un outil dans les messages ou
   les métadonnées : pas de ligne « Co-Authored-By », pas de « Generated with
   Claude Code », pas d'emoji robot. Interdit de modifier `git config`
   (user.name, user.email), le fichier `.claude/settings.json` ou le hook
   `.git/hooks/commit-msg` posés par la boucle. Interdit de t'ajouter comme
   auteur ou contributeur où que ce soit : champs `author`/`contributors` de
   package.json (les laisser vides ou au nom de l'utilisateur), README,
   LICENSE, en-têtes de fichiers, crédits de l'interface.
5. TYPOGRAPHIE, RÈGLE CONTRACTUELLE : le caractère « — » (tiret cadratin,
   em dash) est STRICTEMENT INTERDIT dans tout ce que tu écris : code,
   commentaires, chaînes de caractères de l'interface, JSON des quiz, messages
   de commit, README, JOURNAL_CONSTRUCTION.md, notes d'ETAT_APP.md. Utilise un
   tiret simple « - », des deux-points, des parenthèses, ou reformule la
   phrase. (Les fichiers du corpus et des cahiers des charges, en lecture
   seule, peuvent en contenir : ils ne sont pas concernés.)
6. Interdictions : ne modifie JAMAIS le corpus (`piscine/`, `missions/`,
   `phase3/`, `progression/`, `bertha/`, `00_PLAN_MAITRE.md`,
   `01_NORME_CGBA.md`, `02_J00_INSTALLATION.md`), ni `design/`, ni
   `CAHIER_DES_CHARGES.md`, `CDC_DESIGN.md`, `PROMPT_APP.md`,
   `lance_mission.sh`. Tu peux les LIRE. Tes écritures : `app/`, `ETAT_APP.md`,
   `JOURNAL_CONSTRUCTION.md` uniquement. Aucune dépendance hors de la liste du
   cahier des charges sans justification écrite au JOURNAL. Ne lance jamais
   `npm run dev`, `npm run dev:app` ni aucun serveur/watcher (ils ne rendent pas
   la main) : la vérification passe par `build`, `vitest run`, et pour
   l'empaquetage `dist:mac`.
7. Termine l'itération par, dans cet ordre :
   a. Cocher la tâche dans `ETAT_APP.md` (ou `[!] cause`) + une ligne de note
      datée en bas du fichier.
   b. Ajouter à `JOURNAL_CONSTRUCTION.md` un court paragraphe : tâche,
      décisions, fichiers touchés, verdict build/tests, liste des commits créés.
   c. Un dernier `git status` : s'il reste quoi que ce soit, committer.
8. Si TOUTES les tâches d'`ETAT_APP.md` sont cochées et que build + tests sont
   verts : `git tag v1.0.0`, crée `app/.MISSION_TERMINEE` (date + résumé),
   commit final.
9. Ta réponse texte doit être courte : tâche traitée, verdict build/tests,
   commits créés, prochaine tâche. Le travail est dans les fichiers.
