#!/usr/bin/env bash
# Fabrique app/build/icon.icns avec les seuls outils macOS natifs (sips + iconutil).
# Source : design/icone.png si le design en fournit une, sinon le dessin de repli.
set -euo pipefail

ici="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
racine="$(cd "$ici/.." && pwd)"
source_design="$(cd "$racine/.." && pwd)/design/icone.png"
dossier_build="$racine/build"

for outil in sips iconutil; do
  if ! command -v "$outil" >/dev/null 2>&1; then
    echo "Erreur : $outil est introuvable. Ce script demande macOS." >&2
    exit 1
  fi
done

travail="$(mktemp -d)"
trap 'rm -rf "$travail"' EXIT

origine="$travail/origine.png"
if [ -f "$source_design" ]; then
  cp "$source_design" "$origine"
  echo "Source : design/icone.png"
else
  node "$ici/icone-repli.mjs" "$origine" 1024 >/dev/null
  echo "Source : dessin de repli (design/icone.png absent)"
fi

# Normalisation a 1024x1024 : sips refuse d'agrandir au-dela sans y toucher.
carre="$travail/carre.png"
sips -s format png -z 1024 1024 "$origine" --out "$carre" >/dev/null

# Les 10 tailles attendues par iconutil, en « cote nom_du_fichier ».
iconset="$travail/icon.iconset"
mkdir -p "$iconset"
for definition in \
  "16 icon_16x16" \
  "32 icon_16x16@2x" \
  "32 icon_32x32" \
  "64 icon_32x32@2x" \
  "128 icon_128x128" \
  "256 icon_128x128@2x" \
  "256 icon_256x256" \
  "512 icon_256x256@2x" \
  "512 icon_512x512" \
  "1024 icon_512x512@2x"; do
  cote="${definition% *}"
  nom="${definition#* }"
  sips -s format png -z "$cote" "$cote" "$carre" --out "$iconset/$nom.png" >/dev/null
done

mkdir -p "$dossier_build"
iconutil -c icns "$iconset" -o "$dossier_build/icon.icns"
echo "Icone ecrite : app/build/icon.icns ($(du -h "$dossier_build/icon.icns" | cut -f1))"
