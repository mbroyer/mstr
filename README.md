# MSTR

Gesprochen „Muster“. Ein Step-Sequencer im Browser für Erwachsene: sieben eingebaute Spuren und eine für den eigenen Klang, je 16 Schritte, Punkte antippen, Play drücken. Alle Klänge entstehen per Web Audio, es gibt keine Samples. Die Oberfläche ist auf Englisch. Eine einzelne HTML-Seite ohne Login und ohne Datenbank.

Herausgelöst aus der Monster-Beatbox in NumNum (Repo `mbroyer/numnum`, Datei `src/beatbox.js`).

- 7 Spuren: Hi-Hat (Zu, Offen, Tick), Kick, Snare (Snare, Rim, Rauschen, Clap), Becken (Crash, Ride, China), Perc (Shaker, Tamburin, Clave, Conga, Cowbell), Toms (Tief, Mittel, Hoch), FX (Snap, Sub, Reverse, Wirbel, Riser)
- Spur 8 „Aufnahme“: der eigene Klang (1 Sekunde übers Mikrofon, nur auf diesem Gerät) in drei Tonhöhen (Normal, Tief, Hoch). Nur hier gibt es das Mikrofon; Vorlagen lassen diese Spur unverändert
- Je Spur: Klangauswahl (für neue Schritte), Mute, Solo, Lautstärke, Vorschlag
- Variation je Schritt: einen Punkt lange drücken (Touch oder Maus, am Rechner auch Rechtsklick) öffnet darüber die Klänge der Spur, nummeriert wie die Ziffer im Punkt; die Wahl gilt nur für diesen Schritt, „Off“ löscht ihn. Kurz antippen schaltet wie bisher. Kick hat nur einen Klang, dort schaltet auch langes Drücken. Die Variationen stecken im Speicherstand und im geteilten Link
- 16 Vorlagen (Amapiano als Start, Lo-Fi, One Drop, Reggaeton, Afrobeats, Funk, Rock, House, Beat It, Minimal, 2-Step, Trap, Techno, Drum'n'Bass, Jungle, Electro, Amapiano) mit Tempo und Swing, Tempo 60–180 BPM mit Tap-Tempo, Swing auf jedem zweiten Achtel
- Drop: ein Takt Anlauf mit dem eigenen Beat (ohne Kick in der zweiten Hälfte) und einem schneller werdenden Wirbel mit dem Snare-Klang des Beats; unter 100 BPM schließt sich ein Tiefpass, sonst öffnet sich ein Hochpass, ab 150 BPM alles doppelt so schnell; zwei Schritte Pause mit Reverse-Becken, dann Kick, Crash und Sub
- Effekte (FX, zuschaltbar, gespeichert), je mit Regler: Raum (langer Hall, Menge), Echo (Menge, Abstand 1/8, 1/8 punktiert oder 1/4 im Tempo), Filter (Tiefpass, der sich öffnet und schließt; Tiefe, 1, 2 oder 4 Takte), Pumpen (alles außer Kick atmet im Takt; Tiefe, Viertel oder Achtel), Stottern (am Taktende wiederholt sich ein Schritt in Zweiunddreißigsteln; Länge 2–8 Schritte, jeder, jeder 2. oder 4. Takt), Vinyl (dumpfer, körnig, Knistern; Stärke). Kick und Sub bleiben ohne Raum und Echo. Beim Stoppen verstummen die Effekte sofort. Gespeichert in `mstr-v1` unter `fx`, `fxa`, `fxo`
- Leiste unten: Play, Effects, Drop (Blitz), Tempo. Auf Handys bis 430 px zeigen Effects und Drop nur ihr Symbol (Effects mit Zahl, wenn Effekte an sind)
- Zwei Ansichten, Umschalter „Grid | Orbit“ oben rechts (`#vGrid`, `#vCard`, gespeichert unter `view`): das Raster ist zum Bauen, der Orbit (die Karte) zum Zusehen und Teilen. Im Raster gibt es keinen Teilen-Knopf. „Clear“ ist der erste Eintrag „Empty grid“ in der Beat-Liste (mit Rückgängig)
- Name: Titel oben antippen (kleiner Stift dahinter, auch in der Karte unter dem Molekül) öffnet das Namens-Blatt von oben, damit die Tastatur am Handy die Felder nicht verdeckt: Name (bleibt gespeichert und steht oben als Titel, „based on …“ darunter, wenn er auf einer Vorlage beruht; eine Vorlage wählen oder Empty grid löscht ihn; der Würfel daneben schlägt einen Titel aus dem Beat vor, etwa „Velvet Thump“ oder „Shaker at 2 AM“: Stimmung der Wörter nach Tempo, Swing-Wörter ab 22 % Swing, Hauptwort nach der lautesten Spur, jederzeit überschreibbar) und „By“ (`@name`, gespeichert unter `by`). Beides steht auf der Karte
- Orbit-Ansicht: das Ring-Molekül der Karte (Canvas `#mol`) live mit dem Beat, darunter wie auf der fertigen Karte Titel, Vorlage, Tempo, Swing, Hits, oben rechts „by @name“. Schläge kommen aus der Wiedergabe, Mute, Solo und Drop entscheiden mit, Effekte sind zu sehen, im Stand ruht das Bild mit dem Hinweis „Tap to play“. Im Orbit gibt es keine Leiste unten: Play und Effekte stehen in der Reihe neben dem Video-Knopf, ein Tipp auf den Ring spielt oder stoppt ebenfalls, ein Tipp auf den Titel benennt, Drop und Tempo wohnen im Raster. Der Orbit füllt genau den sichtbaren Bereich (100dvh), damit auf dem iPhone nichts unter die Safari-Leiste rutscht. Unter dem Molekül der Knopf, der den Ablauf erzählt: „Create video“ (mit Zeile „22 s with sound, for Story, Reels and chats …“), während der Aufnahme „Generating · 12 s“ mit Füllstand von links und dem Hinweis, den Bildschirm offen zu lassen, danach „Share video“ (Handy) bzw. „Save video“ (Rechner); ändert sich der Beat, steht wieder „Create video“. Daneben „⋯“ mit Link und WAV-Loop
- Link („⋯“ in der Karte): „Send link“ (Handy, Teilen-Menü) bzw. „Copy link“ (Rechner, kopiert und bestätigt mit „✓ Link copied“, das Blatt bleibt offen). Der ganze Beat steckt im Link `https://asimplemanslab.com/mstr/app/?b=…` (sieben eingebaute Spuren, Tempo, Swing, Vorlage, Lautstärke, Mute/Solo, Effekte, Name), ohne Server; der Link zeigt immer auf die Website. Wer den Link öffnet, bekommt den Beat mit Namen (mit Rückgängig), seine eigene Spur Aufnahme bleibt, wie sie ist; die Aufnahme selbst reist nicht mit
- Die Karte („Share video“): der Beat als Ring-Molekül (Story 9:16, 1080 × 1920; oben 15 % und unten 16 % bleiben frei für die Leisten von Instagram und Co., der Ring füllt die Breite, alle Texte liegen dazwischen; dahinter ein leises Licht um die Mitte und wenige feine Sterne, fest je Beat), jeder Schlag ein Atom auf einem Ring je Spur (Kick innen, FX außen), was gleichzeitig klingt hängt an einer Linie von innen nach außen, die beim Spielen aufblitzt; Atome treiben, verbinden sich mit ihren nächsten Nachbarn, federn bei Treffern und driften am Taktende auseinander. Dazu Titel, „by @name“, Tempo, Swing, Hits. Ton offline gerechnet wie der WAV-Loop, aber als Bogen über 8 Takte (Takt 1 Kick und Hats, Takt 2 dazu Snare und Perc, ab Takt 3 alles, Takt 7 ohne Kick) plus Schlussschlag mit Kick und Crash und 2,4 s Nachklang, danach treiben die Atome auseinander; das Video entsteht in Echtzeit (Canvas plus Ton über MediaRecorder, MP4 wo der Browser es kann, sonst WebM) und ist zu hören, solange es aufnimmt; die Karten-Ansicht zeigt derweil die Aufnahme, die Wiedergabe stoppt dafür. Ohne MediaRecorder gibt es die Karte als PNG. Zurück zum Raster oder Escape bricht die Aufnahme ab. Dieselbe Datei kommt beim zweiten Tipp sofort. Regel: Es darf nie eine haken- oder windradförmige Figur entstehen, deshalb keine Bögen zu Nachbarschritten, kein Drehversatz zwischen den Ringen, feste Versätze je Atom und bei erkannter vierfacher Drehsymmetrie nur gerade Linien nach außen (siehe `src/card.js`). Die eingeschalteten Effekte sind im Bild zu sehen: Room legt Schimmer um die Atome, Echo lässt Geister im Echo-Abstand nach außen ziehen, Filter dimmt die hohen Spuren im Takt und öffnet eine Blende, Pump zieht alles außer der Kick zusammen, Stutter lässt das Molekül zittern und den letzten Schritt doppelt blitzen, Vinyl legt Korn, Staub und Knistern darüber. Bei manchen Schlägen bleiben kleine Staubkörner zurück, die nach außen und oben in die Atmosphäre gleiten
- „Download WAV“ („⋯“ in der Karte): vier Takte als nahtloser Loop zum Samplen (Stereo, unkomprimiert, Dateiname mit Name und Tempo, z. B. `Sunday-Groove-113bpm.wav`), offline berechnet (`ac` wird kurz gegen einen OfflineAudioContext getauscht), genau wie es klingt, mit Effekten und eigener Aufnahme. Ein Takt Vorlauf wird mitgerechnet und abgeschnitten, so liegen Hall und Echo vom Ende schon am Anfang. Am Handy übers Teilen-Menü („In Dateien sichern“), am Rechner als Download
- Leertaste startet und stoppt, „Leeren“ lässt sich rückgängig machen
- Heller und dunkler Modus (folgt dem System oder fest eingestellt)
- Der Beat liegt in localStorage unter `mstr-v1` (nie umbenennen), die Aufnahme unter `mstr-rec-mic` (ältere Aufnahmen anderer Spuren werden beim Laden dorthin übernommen)

## Design
Schwarz, Weiß und ein Signal: Die Akzentfarbe Flieder (`#C7B3FF`) erscheint nur für Takt und Zustände: den laufenden Schritt, die Zählzeiten 1, 5, 9 und 13 (leicht getönt), den Taktzähler und die Fortschrittslinie beim Abspielen, gedrückte Schalter (Mute, Solo, gewählter Klang), die Aufnahme, eingeschaltete Effekte, die gewählte Vorlage und Play während der Wiedergabe. Schriften: Figtree, Instrument Serif (nur Seitentitel), JetBrains Mono (Labels).

## Bauen und testen

```
python3 build.py        # schreibt index.html (eine einzelne Seite)
python3 tests/t1.py     # Playwright-Rauchtest bei 390 px (PW_CHROME=Pfad zu Chrome, falls nötig)
python3 tests/t2.py     # jeder Klang, alle Vorlagen, Drop
python3 tests/t3.py     # Spur Aufnahme
python3 tests/t4.py     # Stopp beim Sperren / Tab verlassen
python3 tests/t5.py     # Effekte schalten, Regler, Pegel, gespeichert
python3 tests/t6.py     # Drop je Beat-Art
python3 tests/t7.py     # Beat teilen per Link
python3 tests/t8.py     # Variation je Schritt per langem Drücken
python3 tests/t9.py     # WAV-Loop zum Samplen
python3 tests/t10.py    # Namens-Blatt, Karten-Ansicht, Video mit Ton
python3 tests/t11.py    # Umschalter Grid | Orbit, Orbit-Ansicht live
```

## Dateien
- `src/app.js` – Speicherstand, Farbschema
- `src/audio.js` – AudioContext, Ton-Freischaltung (iPad), Master-Ausgang mit Limiter
- `src/beats.js` – die 16 Vorlagen
- `src/card.js` – Karte: Ring-Molekül, Titel-Generator, Video- und Bildausgabe
- `src/klang.js` – Spuren, Klangerzeugung, Bus mit Hall, Delay, Sättigung und Sidechain, zuschaltbare Effekte, eigene Aufnahmen
- `src/mstr.js` – Raster, Sequencer, Drop, Vorlagen, Tempo, Spur-Einstellungen
- `src/mstr.css` – Styles
- `src/body.html` – Seitenaufbau
