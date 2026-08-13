#!/usr/bin/env bash
# ============================================================
#  LANCE_MISSION — Boucle de construction autonome COBOL QUEST
#  Cible : application macOS (.app / .dmg)
#  Usage :  ./lance_mission.sh [nb_iterations_max]   (defaut 25)
#
#  Chaque tour lance Claude Code en mode automatique (headless)
#  avec PROMPT_APP.md ; l'agent traite UNE tache de ETAT_APP.md
#  en suivant CAHIER_DES_CHARGES.md et le design depose dans
#  design/, verifie (build + tests), journalise et COMMITTE
#  chaque evolution. La boucle s'arrete quand
#  app/.MISSION_TERMINEE apparait, ou au plafond.
#
#  ATTENTION : --dangerously-skip-permissions autorise l'agent
#  a editer des fichiers et lancer des commandes SANS
#  confirmation. Ne lancez cette boucle QUE dans ce dossier,
#  sans identifiants sensibles a portee. Variante plus prudente
#  (confirmations demandees pour les commandes, donc boucle non
#  totalement autonome) :  --permission-mode acceptEdits
# ============================================================
set -u
MAX_TOURS="${1:-25}"
ICI="$(cd "$(dirname "$0")" && pwd)"
cd "$ICI"

# --- garde-fous ---
[ -f CAHIER_DES_CHARGES.md ] && [ -f PROMPT_APP.md ] && [ -f ETAT_APP.md ] \
  || { echo "ERREUR : lancez ce script depuis le dossier cobol-quest (cahier des charges introuvable)."; exit 8; }
command -v claude >/dev/null 2>&1 \
  || { echo "ERREUR : la commande 'claude' est introuvable."
       echo "Installez Claude Code :  npm install -g @anthropic-ai/claude-code"
       echo "puis connectez-vous en lancant une fois :  claude"; exit 8; }
command -v node >/dev/null 2>&1 || { echo "ERREUR : Node.js (v18+) est requis."; exit 8; }
command -v git  >/dev/null 2>&1 || { echo "ERREUR : git est requis."; exit 8; }

# --- design present ? ---
NB_DESIGN=$(find design -type f ! -name 'A_LIRE.md' 2>/dev/null | wc -l | tr -d ' ')
if [ "$NB_DESIGN" -eq 0 ]; then
    echo "AVERTISSEMENT : le dossier design/ ne contient pas encore les livrables"
    echo "de Claude Design (voir CDC_DESIGN.md). La boucle utilisera la direction"
    echo "artistique de repli du cahier des charges (§7)."
    printf "Continuer quand meme ? [o/N] "
    read -r REP
    case "$REP" in o|O|oui|OUI) : ;; *) echo "Deposez le design puis relancez."; exit 0 ;; esac
fi

# --- identite git de l'utilisateur (les commits seront a VOTRE nom) ---
if [ -z "$(git config user.name 2>/dev/null)" ] || [ -z "$(git config user.email 2>/dev/null)" ]; then
    echo "ERREUR : identite git absente. Configurez-la une fois pour toutes :"
    echo '  git config --global user.name  "Votre Nom"'
    echo '  git config --global user.email "vous@exemple.com"'
    exit 8
fi

# --- git initialise (la regle des commits commence ici) ---
NOUVEAU_DEPOT=0
if [ ! -d .git ]; then
    git init -q
    printf "node_modules/\ndist/\nrelease/\napp/src/corpus/\n.MISSION_TERMINEE\nboucle.log\n" > .gitignore
    NOUVEAU_DEPOT=1
fi

# --- signature des commits : l'agent ne s'ajoute JAMAIS comme contributeur ---
# 1) reglage projet : attribution vide (ni Co-Authored-By, ni credit de PR)
mkdir -p .claude
if [ ! -f .claude/settings.json ]; then
    printf '{\n  "attribution": { "commit": "", "pr": "" }\n}\n' > .claude/settings.json
fi
# 2) filet mecanique : un hook git nettoie toute auto-attribution residuelle
HOOK=.git/hooks/commit-msg
if [ ! -f "$HOOK" ]; then
    cat > "$HOOK" <<'FINHOOK'
#!/bin/sh
# Retire toute auto-attribution d'outil du message de commit
sed -i.bak -e '/^Co-Authored-By:/d' \
           -e '/Generated with \[Claude Code\]/d' \
           -e '/Generated with Claude Code/d' "$1"
rm -f "$1.bak"
FINHOOK
    chmod +x "$HOOK"
fi

if [ "$NOUVEAU_DEPOT" -eq 1 ]; then
    git add -A && git commit -qm "chantier: etat initial (corpus + cahiers des charges + design + boucle)"
    echo "Depot git initialise, etat initial committe."
fi

echo "=============================================="
echo " COBOL QUEST - CONSTRUCTION DE L'APPLICATION MAC"
echo " Plafond : $MAX_TOURS iterations"
echo " Loi     : CAHIER_DES_CHARGES.md + design/"
echo " Suivi   : ETAT_APP.md / JOURNAL_CONSTRUCTION.md / git log"
echo " Arret   : Ctrl+C a tout moment (l'etat et les commits"
echo "           sont conserves, la boucle reprend ou elle en etait)"
echo "=============================================="

TOUR=0
while [ "$TOUR" -lt "$MAX_TOURS" ]; do
    TOUR=$((TOUR+1))
    RESTE=$(grep -c '^- \[ \]' ETAT_APP.md || true)
    BLOQUEES=$(grep -c '^- \[!\]' ETAT_APP.md || true)
    echo ""
    echo "---- TOUR $TOUR/$MAX_TOURS ---- ($RESTE taches restantes, $BLOQUEES bloquees) ----"
    date '+%Y-%m-%d %H:%M:%S'

    claude -p "$(cat PROMPT_APP.md)" \
        --dangerously-skip-permissions \
        2>&1 | tee -a boucle.log
    # VARIANTE /goal (optionnelle, Claude Code recent requis, dossier marque
    # "de confiance") : chaque tour s'auto-verifie et enchaine ses propres
    # sous-tours jusqu'a ce que SA tache soit reellement finie. Pour l'activer,
    # remplacez l'appel ci-dessus par :
    #   claude -p "/goal La premiere tache non cochee (ou marquee [!]) de ETAT_APP.md est entierement realisee en suivant strictement PROMPT_APP.md : build et tests verts, ETAT_APP.md coche, JOURNAL_CONSTRUCTION.md complete, git status propre. Stop apres 15 tours au maximum." \
    #       --dangerously-skip-permissions 2>&1 | tee -a boucle.log
    CODE=$?
    [ $CODE -ne 0 ] && { echo "[!] claude a rendu le code $CODE — pause 30 s." | tee -a boucle.log; sleep 30; }

    # --- filet de securite : aucune evolution ne reste hors git ---
    if [ -n "$(git status --porcelain)" ]; then
        git add -A
        git commit -qm "boucle: commit de securite (tour $TOUR) — modifications laissees par l'agent"
        echo "[git] Commit de securite pose (l'agent avait laisse des fichiers non committes)."
    fi

    if [ -f app/.MISSION_TERMINEE ]; then
        echo ""
        echo "=============================================="
        echo " MISSION TERMINEE en $TOUR tours. Historique : git log --oneline"
        echo " Pour construire l'application Mac :"
        echo "   cd app && npm install && npm run dist:mac"
        echo " Le .dmg apparait dans app/release/ — glissez COBOL Quest"
        echo " dans Applications. Premiere ouverture (app non signee) :"
        echo " clic droit sur l'app -> Ouvrir -> Ouvrir."
        echo " Pour developper/tester sans empaqueter : npm run dev:app"
        echo "=============================================="
        exit 0
    fi
    sleep 3
done

echo ""
echo "=============================================="
echo " Plafond de $MAX_TOURS tours atteint sans .MISSION_TERMINEE."
echo " Consultez ETAT_APP.md et git log. Relancez ./lance_mission.sh"
echo " pour continuer (l'etat est conserve), ou ouvrez une session"
echo " interactive :  claude   puis dites :"
echo " « Lis CAHIER_DES_CHARGES.md et ETAT_APP.md, debloque la tache en cours. »"
echo "=============================================="
exit 1
