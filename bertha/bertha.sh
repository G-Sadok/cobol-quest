#!/usr/bin/env bash
# ============================================================
#  BERTHA - Moulinette de correction COBOL QUEST (CGBA, 1987)
#  Usage :
#    ./bertha/bertha.sh J03/ex05          corrige un exercice
#    ./bertha/bertha.sh --auto-test       verifie l'installation
#  Convention des tests : tests/<Jxx>/<exYY>/testNN/ contenant
#    expected.txt   sortie attendue (obligatoire)
#    in.txt         entree standard a injecter (optionnel)
#    args           arguments de ligne de commande (optionnel)
#    fixtures/      fichiers a copier avant execution (optionnel)
#    check_<nom>    fichier attendu produit par le programme,
#                   compare a <nom> dans le bac a sable (optionnel)
#  Regles : sortie comparee EXACTEMENT, espaces de fin ignores.
# ============================================================
set -u
ROUGE='\033[0;31m'; VERT='\033[0;32m'; JAUNE='\033[1;33m'; FIN='\033[0m'
RACINE="$(cd "$(dirname "$0")/.." && pwd)"

die() { echo -e "${ROUGE}BERTHA : $1${FIN}"; exit 8; }

command -v cobc >/dev/null 2>&1 || die "cobc introuvable. Relisez J00."

# ---------- mode auto-test ----------
if [ "${1:-}" = "--auto-test" ]; then
    TMP=$(mktemp -d)
    cat > "$TMP/hello.cob" <<'EOF'
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY "BERTHA EST VIVANTE".
           STOP RUN.
EOF
    if cobc -x -Wall -o "$TMP/hello" "$TMP/hello.cob" 2>"$TMP/err" \
       && [ "$("$TMP/hello")" = "BERTHA EST VIVANTE" ]; then
        echo -e "${VERT}[OK] Installation complete. BERTHA EST VIVANTE.${FIN}"
        rm -rf "$TMP"; exit 0
    else
        cat "$TMP/err"; rm -rf "$TMP"; die "auto-test en echec."
    fi
fi

CIBLE="${1:-}"
[ -z "$CIBLE" ] && die "usage : bertha.sh Jxx/exYY (ou Mxx, RUSHxx, J10/xx)"
REND="$RACINE/rendu/$CIBLE"
TSTS="$RACINE/tests/$CIBLE"
[ -d "$REND" ] || die "rendu introuvable : $REND"
[ -d "$TSTS" ] || die "tests introuvables : $TSTS (creez-les depuis les exemples \$> du sujet)"

# ---------- compilation ----------
BAC=$(mktemp -d)
trap 'rm -rf "$BAC"' EXIT
cp "$REND"/*.cob "$BAC"/ 2>/dev/null || die "aucun .cob dans $REND"
cp "$REND"/*.CPY "$BAC"/ 2>/dev/null || true
cp "$REND"/*.cpy "$BAC"/ 2>/dev/null || true
SOURCES=$(ls "$BAC"/*.cob)
PROG="$BAC/programme"
if ! cobc -x -Wall -o "$PROG" $SOURCES 2>"$BAC/compil.log"; then
    echo -e "${ROUGE}[KO] LA COMPILATION A ECHOUE${FIN}"
    echo "------- message du compilateur -------"
    cat "$BAC/compil.log"
    echo "--------------------------------------"
    echo "Rappel Norme : colonne 7, zones A/B, point final, END-IF..."
    exit 1
fi
grep -qi warning "$BAC/compil.log" && \
    { echo -e "${JAUNE}[!] Avertissements (la Norme les interdit) :${FIN}"; cat "$BAC/compil.log"; }

# ---------- execution des tests ----------
TOTAL=0; REUSSIS=0
for T in "$TSTS"/test*/; do
    [ -d "$T" ] || continue
    TOTAL=$((TOTAL+1)); NOM=$(basename "$T")
    ZONE=$(mktemp -d); cp "$PROG" "$ZONE/prog"
    [ -d "$T/fixtures" ] && cp -r "$T/fixtures/." "$ZONE/"
    ARGS=""; [ -f "$T/args" ] && ARGS=$(cat "$T/args")
    ( cd "$ZONE"
      if [ -f "$T/in.txt" ]; then ./prog $ARGS < "$T/in.txt" > sortie.txt 2>&1
      else ./prog $ARGS > sortie.txt 2>&1; fi )
    OK=1
    # comparaison de la sortie ecran (espaces de fin ignores)
    if ! diff <(sed -e 's/[ \t]*$//' "$ZONE/sortie.txt") \
              <(sed -e 's/[ \t]*$//' "$T/expected.txt") > "$ZONE/ecart.txt"; then
        OK=0
        echo -e "${ROUGE}[KO] $NOM — la sortie differe :${FIN}"
        head -20 "$ZONE/ecart.txt"
    fi
    # comparaison des fichiers produits (check_NOM vs NOM)
    for C in "$T"/check_*; do
        [ -e "$C" ] || continue
        F=$(basename "$C"); F=${F#check_}
        if [ ! -f "$ZONE/$F" ]; then
            OK=0; echo -e "${ROUGE}[KO] $NOM — fichier absent : $F${FIN}"
        elif ! diff <(sed -e 's/[ \t]*$//' "$ZONE/$F") \
                    <(sed -e 's/[ \t]*$//' "$C") > "$ZONE/ecartf.txt"; then
            OK=0; echo -e "${ROUGE}[KO] $NOM — fichier $F differe :${FIN}"
            head -10 "$ZONE/ecartf.txt"
        fi
    done
    if [ $OK -eq 1 ]; then
        REUSSIS=$((REUSSIS+1)); echo -e "${VERT}[OK] $NOM${FIN}"
    fi
    rm -rf "$ZONE"
done

# ---------- verdict ----------
echo "=============================================="
if [ $TOTAL -eq 0 ]; then
    die "aucun test dans $TSTS — creez tests/$CIBLE/test01/expected.txt"
elif [ $REUSSIS -eq $TOTAL ]; then
    echo -e "${VERT} BERTHA DIT OUI : $REUSSIS/$TOTAL — XP acquis, cochez votre feuille de route.${FIN}"
    exit 0
else
    echo -e "${ROUGE} BERTHA DIT NON : $REUSSIS/$TOTAL. Relisez le sujet, l'exemple \$> fait foi.${FIN}"
    exit 1
fi
