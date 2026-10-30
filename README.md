# Monster-Beatbox

Ein Beat-Baukasten für Kinder: sieben Monster, jedes macht ein Mund-Geräusch (Beatbox). Kästchen antippen, Play drücken, fertig ist der Beat. Herausgelöst aus NumNum (Repo `mbroyer/numnum`, Datei `src/beatbox.js`).

- 7 Reihen mit je 16 Schritten (oder kurzer Takt mit 8 Feldern, Knopf „16/8“ oben)
- 13 Vorlagen (Boom Bap, House, Funk, Rock, Techno, Trap, Disco, Bossa, Drum'n'Bass, Shuffle, Afro, Minimal, Hardtechno)
- Würfel je Reihe, Tempo mit Schnecke und Hase, Radiergummi, DROP
- Eigene Stimme: pro Monster 1 Sekunde aufnehmen (nur auf diesem Gerät)
- 4 Geheimnisse (Boots and Cats, Echo, Treppe, Schattenmodus)
- Alles von Anfang an offen, kein Login, keine Datenbank. Der Beat liegt in localStorage unter `monster-beatbox-v1` (nie umbenennen), Aufnahmen unter `beatbox-rec-*`.

## Bauen und testen

```
python3 build.py        # schreibt beatbox.html (eine einzelne Seite)
python3 tests/t1.py     # Playwright-Rauchtest bei 390 px (PW_CHROME=Pfad zu Chrome, falls nötig)
```

## Dateien
- `src/app.js` – Spielstand, Icons, Vorlesen
- `src/audio.js` – AudioContext, Ton-Freischaltung, Master-Ausgang mit Limiter
- `src/monster.js` – Monster-Zeichnungen (aus NumNum/Vokki)
- `src/beats.js` – die 13 Vorlagen
- `src/beatbox.js` – die Beatbox selbst: Klänge, Raster, Aufnahme, Geheimnisse, Einführung
- `src/basis.css`, `src/beatbox.css` – Styles
- `src/body.html` – Seitenaufbau
