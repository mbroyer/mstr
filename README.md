# MSTR

Gesprochen „Muster“. Ein Step-Sequencer im Browser für Erwachsene: sieben Spuren mit je 16 Schritten, Punkte antippen, Play drücken. Alle Klänge sind synthetisch: ein Drum-Kit nach dem Vorbild analoger Drum-Machines, das beim ersten Ton einmal Sample für Sample berechnet wird. Es gibt keine Sample-Dateien und damit keine Lizenzfragen. Eine einzelne HTML-Seite ohne Login und ohne Datenbank.

Herausgelöst aus der Monster-Beatbox in NumNum (Repo `mbroyer/numnum`, Datei `src/beatbox.js`).

- 7 Spuren: Hi-Hat (Zu, Offen, Pedal; die offene wird von der nächsten geschlossenen abgewürgt), Kick, Clap, Snare (Snare, Rim, Snare 2), Perc (Shaker, Tamburin, Clave, Conga, Cowbell), Toms (Tom tief, mittel, hoch, Crash, Ride), FX (Snap, Sub, Reverse, Wirbel, Riser)
- Je Spur: Klangauswahl, Mute, Solo, Lautstärke, Vorschlag, eigene Aufnahme (1 Sekunde, nur auf diesem Gerät)
- 13 Vorlagen mit Tempo und Swing, Tempo 60–180 BPM mit Tap-Tempo, Swing auf jedem zweiten Achtel
- Drop: ein Takt Anlauf mit Filter, dann der Knall
- Leertaste startet und stoppt, „Leeren“ lässt sich rückgängig machen
- Heller und dunkler Modus (folgt dem System oder fest eingestellt)
- Der Beat liegt in localStorage unter `mstr-v1` (nie umbenennen), Aufnahmen unter `mstr-rec-*`

## Design
Schwarz, Weiß und ein Signal: Die Akzentfarbe Flieder (`#C7B3FF`) erscheint nur für Zustände, also den laufenden Schritt, die Aufnahme, die gewählte Vorlage und Play während der Wiedergabe. Schriften: Figtree, Instrument Serif (nur Seitentitel), JetBrains Mono (Labels).

## Bauen und testen

```
python3 build.py        # schreibt index.html (eine einzelne Seite)
python3 tests/t1.py     # Playwright-Rauchtest bei 390 px (PW_CHROME=Pfad zu Chrome, falls nötig)
python3 tests/t2.py     # löst jeden Klang aus, spielt alle Vorlagen und den Drop
```

## Dateien
- `src/app.js` – Speicherstand, Farbschema
- `src/audio.js` – AudioContext, Ton-Freischaltung (iPad), Master-Ausgang mit Limiter
- `src/beats.js` – die 13 Vorlagen
- `src/kit.js` – das Drum-Kit als reines DSP (Kick, Snares, Hats, Becken, Toms, Percussion)
- `src/klang.js` – Spuren, Wiedergabe des Kits, Bus mit Hall, Sättigung und Sidechain, eigene Aufnahmen
- `src/mstr.js` – Raster, Sequencer, Drop, Vorlagen, Tempo, Spur-Einstellungen
- `src/mstr.css` – Styles
- `src/body.html` – Seitenaufbau
