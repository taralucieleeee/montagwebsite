#!/bin/sh
# Verkleinert alle Bilder in images/ (außer deko/), die breiter als MAX Pixel sind.
# Seitenverhältnis bleibt, die Datei wird ersetzt. Nutzt "sips" (auf jedem Mac vorhanden).
# Start: npm run images
MAX=2400
cd "$(dirname "$0")/.." || exit 1
found=0
find images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -not -path 'images/deko/*' | while read -r file; do
  width=$(sips -g pixelWidth "$file" 2>/dev/null | awk '/pixelWidth/ {print $2}')
  [ -z "$width" ] && continue
  if [ "$width" -gt "$MAX" ]; then
    case "$file" in
      *.jpg|*.jpeg|*.JPG|*.JPEG) sips --resampleWidth "$MAX" -s formatOptions 82 "$file" >/dev/null ;;
      *) sips --resampleWidth "$MAX" "$file" >/dev/null ;;
    esac
    echo "verkleinert: $file ($width px → $MAX px)"
  fi
done
echo "fertig – alle Bilder sind höchstens $MAX px breit."
