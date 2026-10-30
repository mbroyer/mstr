# MSTR

Gesprochen „Muster“. Ein Step-Sequencer im Browser für Erwachsene: sieben Spuren mit je 16 Schritten, Punkte antippen, Play drücken. Alle Klänge entstehen per Web Audio, es gibt keine Samples. Eine einzelne HTML-Seite ohne Login und ohne Datenbank.

Herausgelöst aus der Monster-Beatbox in NumNum (Repo `mbroyer/numnum`, Datei `src/beatbox.js`).

- 7 Spuren: Hi-Hat (Zu, Offen, Tick), Kick, Clap, Snare (Snare, Rim, Rauschen), Perc (5 Tonhöhen, pentatonisch), Toms (Kick 2, Snare 2, Tom, Becken), FX (Drop hoch, Drop tief, Rauschen, Buzz, Riser)
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
python3 build.py studio # zusätzlich teststudio.html mit den DrumGizmo-Kits
python3 tests/t1.py     # Playwright-Rauchtest bei 390 px (PW_CHROME=Pfad zu Chrome, falls nötig)
```

## Dateien
- `src/app.js` – Speicherstand, Farbschema
- `src/audio.js` – AudioContext, Ton-Freischaltung (iPad), Master-Ausgang mit Limiter
- `src/beats.js` – die 13 Vorlagen
- `src/klang.js` – Spuren, Klangerzeugung, Bus mit Hall, Delay, Sättigung und Sidechain, eigene Aufnahmen
- `src/mstr.js` – Raster, Sequencer, Drop, Vorlagen, Tempo, Spur-Einstellungen
- `src/mstr.css` – Styles
- `src/body.html` – Seitenaufbau

## Teststudio (DrumGizmo-Kits)
`teststudio.html` ist MSTR mit einer Leiste zum Umschalten zwischen den eingebauten Klängen und fünf echten Drumkits von DrumGizmo.org (CC BY 4.0, siehe `kits/drumgizmo/LIZENZ.md`). Hi-Hat, Kick, Snare und Toms spielen dann Samples, Clap, Perc und FX bleiben eingebaut. Pads spielen jeden Kit-Klang einzeln. `index.html` bleibt unverändert.
- `src/studio.js`, `src/studio.css` – Kit-Auswahl, Pads, Abspielen der Samples
- `kits/drumgizmo/` – je Kit bis zu 10 MP3s (Kick, Snare, Rim, Hi-Hat zu/offen/Pedal, Tom, Floor, Crash, Ride)
- `tools/drumgizmo/` – holt die Klänge per HTTP-Range direkt aus den Kit-ZIPs (ohne die GB-großen Downloads)
