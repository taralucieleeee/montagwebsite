# Bilder austauschen – so geht's

Einfach die Datei mit dem passenden Namen in den richtigen Ordner legen (alte Datei überschreiben).
Das Format ist egal: **`.jpg`, `.png` oder `.webp`** – die Website findet das Bild automatisch.
Fehlt ein Bild, zeigt die Seite einen grauen Platzhalter mit dem erwarteten Dateinamen.

> Tipp: Danach im Browser einmal neu laden. Die Vorschau (`python3 scripts/serve.py`) speichert nichts zwischen.

---

## `home/` – Startseite

Die Bilder erscheinen im Raster oben **und** fallen am Ende der Seite in den Footer.

Die Bilder heißen einfach `1`, `2`, `3` … und stehen in dieser Reihenfolge auf der Seite (3 pro Reihe).
Sonderfälle:

- `3.png` – runder Radar-Sticker, dreht sich beim Scrollen (PNG transparent)
- `7.png` – Schaufensterpuppe; der Rahmen zeigt nur einen Ausschnitt (in `index.html` festgelegt)
- `16.png` – Stern, dreht sich ebenfalls beim Scrollen
- `9.mp4`, `26.mp4` – **Videos**: läuft stumm in Schleife. `9-poster.jpg` ist das Standbild davon
  (wird beim Laden und für die fallenden Bilder unten benutzt). Neues Video? Standbild neu machen lassen.

Von allen Bildern fallen unten im Footer 10 zufällig ausgewählte herunter.

Mehr Bilder? Datei `8.png` usw. ablegen und in `index.html` einen `<a class="project …">`-Block kopieren.

Hier wird **nicht** zugeschnitten: Jeder Rahmen übernimmt die Form seines Bildes (Hoch-, Querformat, quadratisch – alles geht).
Die Bilder stehen unten bündig, 3 pro Reihe. Breite, Name beim Hovern und Link stehen in `index.html` (`md:w-[…vw]`, `data-title`, `href`).

## `collab/` – Karten im Menüpunkt „collab“

| Datei | Karte | Form |
|---|---|---|
| `1.jpg` | Exhibitions | Hochformat 2 : 3 |
| `2.jpg` | Events | Hochformat 2 : 3 |
| `3.jpg` | Marketing | Hochformat 2 : 3 |

## Projektseiten (Montag Market, Exhibition Radar)

Die Projektseiten benutzen **dieselben Dateien aus `home/`** – einfach mit Nummer.
Welche Nummer auf welcher Seite steht, legt `montag-market.html` bzw. `exhibition-radar.html` fest
(eine `<img src="images/home/…">`-Zeile kopieren oder löschen).
Die Ordner `montag-market/` und `exhibition-radar/` werden zurzeit nicht benutzt.

- **Montag Market, Edition 1 (20.12.24):** 4, 5, 8, 15, 11, 17, 22, 7
- **Montag Market, Edition 2 (21. Dezember):** 6, 9 (Video), 16 (Stern, dreht sich), 24, 25, 26 (Video)
- **Exhibition Radar:** 1, 2, 3 (Sticker, dreht sich), 20, 21, 13, 14, 28, 18, 27, 10, 12, 23, 19

Videos (`.mp4`) brauchen ein Standbild `NUMMER-poster.jpg` daneben.

## `deko/` – nicht anfassen

Falter (`butterfly/`) und die Shop-Blume (`drawings/flower.svg`) – gehören zum Design.

---

## Export aus Figma

- **Format:** Fotos als **JPG**, Grafiken mit Transparenz als **PNG**.
- **Größe:** `2x` exportieren. Breiter als 2400 px muss kein Bild sein.
- **Zu groß geworden?** Im Terminal im Projektordner ausführen – verkleinert alle Bilder,
  die breiter als 2400 px sind (Seitenverhältnis bleibt, Original wird ersetzt):

  ```
  npm run images
  ```
