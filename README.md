# MSTR

Gesprochen „Muster“. Ein Step-Sequencer im Browser für Erwachsene: sieben eingebaute Spuren und eine für den eigenen Klang, je 16 Schritte, Punkte antippen, Play drücken. Alle Klänge entstehen per Web Audio, es gibt keine Samples. Eine einzelne HTML-Seite ohne Login und ohne Datenbank.

Herausgelöst aus der Monster-Beatbox in NumNum (Repo `mbroyer/numnum`, Datei `src/beatbox.js`).

- 7 Spuren: Hi-Hat (Zu, Offen, Tick), Kick, Snare (Snare, Rim, Rauschen, Clap), Becken (Crash, Ride, China), Perc (Shaker, Tamburin, Clave, Conga, Cowbell), Toms (Tief, Mittel, Hoch), FX (Snap, Sub, Reverse, Wirbel, Riser)
- Spur 8 „Aufnahme“: der eigene Klang (1 Sekunde übers Mikrofon, nur auf diesem Gerät) in drei Tonhöhen (Normal, Tief, Hoch). Nur hier gibt es das Mikrofon; Vorlagen lassen diese Spur unverändert
- Je Spur: Klangauswahl, Mute, Solo, Lautstärke, Vorschlag
- 13 Vorlagen (Lo-Fi als Start, One Drop, Reggaeton, Shuffle, Funk, Rock, House, Bossa, Minimal, 2-Step, Trap, Techno, Drum'n'Bass) mit Tempo und Swing, Tempo 60–180 BPM mit Tap-Tempo, Swing auf jedem zweiten Achtel
- Drop: ein Takt Anlauf mit Filter, dann der Knall
- Leertaste startet und stoppt, „Leeren“ lässt sich rückgängig machen
- Heller und dunkler Modus (folgt dem System oder fest eingestellt)
- Der Beat liegt in localStorage unter `mstr-v1` (nie umbenennen), die Aufnahme unter `mstr-rec-mic` (ältere Aufnahmen anderer Spuren werden beim Laden dorthin übernommen)

## Design
Schwarz, Weiß und ein Signal: Die Akzentfarbe Flieder (`#C7B3FF`) erscheint nur für Takt und Zustände: den laufenden Schritt, die Zählzeiten 1, 5, 9 und 13 (leicht getönt), den Taktzähler und die Fortschrittslinie beim Abspielen, gedrückte Schalter (Mute, Solo, gewählter Klang), die Aufnahme, die gewählte Vorlage und Play während der Wiedergabe. Schriften: Figtree, Instrument Serif (nur Seitentitel), JetBrains Mono (Labels).

## Bauen und testen

```
python3 build.py        # schreibt index.html (eine einzelne Seite)
python3 tests/t1.py     # Playwright-Rauchtest bei 390 px (PW_CHROME=Pfad zu Chrome, falls nötig)
python3 tests/t2.py     # jeder Klang, alle Vorlagen, Drop
python3 tests/t3.py     # Spur Aufnahme
```

## Dateien
- `src/app.js` – Speicherstand, Farbschema
- `src/audio.js` – AudioContext, Ton-Freischaltung (iPad), Master-Ausgang mit Limiter
- `src/beats.js` – die 13 Vorlagen
- `src/klang.js` – Spuren, Klangerzeugung, Bus mit Hall, Delay, Sättigung und Sidechain, eigene Aufnahmen
- `src/mstr.js` – Raster, Sequencer, Drop, Vorlagen, Tempo, Spur-Einstellungen
- `src/mstr.css` – Styles
- `src/body.html` – Seitenaufbau
