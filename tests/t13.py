# Vibe: beim ersten Besuch die Frage „What's the vibe?“ (Wörter antippen oder tippen, Surprise me), danach der Orbit als Startseite;
# „Change vibe“ und „Another take“ im Orbit; geteilter Link überspringt die Frage; Wiederkehrer landen im Orbit
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    def fresh():
        c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page();pg.on('pageerror',lambda e:err.append(str(e)));pg.goto(url);pg.wait_for_timeout(300);return pg
    # Erster Besuch: ganze Seite ohne X, Feld, drei Wortreihen (21 Chips), Make the beat, Surprise me; kein waagerechtes Scrollen
    pg=fresh()
    assert pg.locator('#sheet').is_visible() and pg.locator('#sayIn').is_visible() and pg.locator('#sayGo').is_visible() and pg.locator('#vSurprise').is_visible()
    assert pg.locator('#sheet [data-close]').count()==0 and pg.locator('#sheet .chip').count()==21 and pg.locator('#sheet .vgrp').count()==3
    assert pg.evaluate('document.documentElement.scrollWidth')<=390 and pg.input_value('#sayIn')==''
    pg.screenshot(path=H+'/tests/t13-vibe.png')
    # Chips bauen den Satz, nochmal tippen nimmt das Wort raus; Make the beat: Blatt zu, Orbit läuft, Vibe steht oben
    pg.click('.chip[data-w="dark"]');pg.click('.chip[data-w="fast"]');pg.click('.chip[data-w="spacey"]')
    assert pg.input_value('#sayIn')=='dark · fast · spacey' and pg.get_attribute('.chip[data-w="fast"]','aria-pressed')=='true'
    pg.click('.chip[data-w="fast"]');assert pg.input_value('#sayIn')=='dark · spacey' and pg.get_attribute('.chip[data-w="fast"]','aria-pressed')=='false'
    pg.click('.chip[data-w="fast"]');pg.click('#sayGo');pg.wait_for_timeout(500)
    assert pg.locator('#sheet').is_hidden() and pg.locator('#mol').is_visible() and pg.locator('#tracks').is_hidden() and pg.evaluate('MSTR.state().playing')
    assert pg.text_content('#vibeTxt')=='dark · spacey · fast' and pg.evaluate('MSTR.state().bpm')>130
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).say")=='dark · spacey · fast'
    pg.screenshot(path=H+'/tests/t13-orbit.png')
    # Wiederkehrer: kein Blatt, Orbit mit dem letzten Beat
    s0=pg.evaluate('MSTR.state()');pg.evaluate('MSTR.setPlay(false)');pg.reload();pg.wait_for_timeout(400)
    assert pg.locator('#sheet').is_hidden() and pg.locator('#mol').is_visible() and pg.evaluate('MSTR.state()')['pat']==s0['pat']
    # Another take: gleicher Vibe, anderes Muster, läuft
    # Der Parser würfelt leicht; selten kommt zufällig dasselbe Muster, darum bis zu drei Takes
    for i in range(3):
        pg.click('#takeBtn');pg.wait_for_timeout(400);s1=pg.evaluate('MSTR.state()')
        if s1['pat']!=s0['pat']:break
    assert s1['pat']!=s0['pat'] and s1['playing'] and pg.text_content('#vibeTxt')=='dark · spacey · fast' and pg.locator('.toast').count()==0
    # Change vibe: Blatt mit X und dem alten Satz, Chips markiert; X schließt ohne Änderung
    # Rückmeldung: der Knopf zeigt kurz „Take N“ und blitzt, danach wieder „Another take“
    assert 'hit' in pg.get_attribute('#takeBtn','class') and pg.inner_text('#takeBtn').startswith('Take '),pg.inner_text('#takeBtn')
    pg.wait_for_timeout(1300);assert pg.inner_text('#takeBtn')=='Another take' and 'hit' not in pg.get_attribute('#takeBtn','class')
    # Change vibe hält den Beat an
    pg.evaluate('MSTR.setPlay(true)');pg.click('#vibeBtn');pg.wait_for_timeout(300);assert not pg.evaluate('MSTR.state().playing'),'Change vibe stoppt'
    assert pg.locator('#sheet [data-close]').count()==1 and pg.input_value('#sayIn')=='dark · spacey · fast' and pg.get_attribute('.chip[data-w="dark"]','aria-pressed')=='true'
    pg.click('#sheet [data-close]');pg.wait_for_timeout(200);assert pg.locator('#sheet').is_hidden() and pg.evaluate('MSTR.state()')['pat']==s1['pat'] and pg.evaluate('location.hash')==''
    # Eigene Wörter per Feld und Enter
    pg.click('#vibeBtn');pg.wait_for_timeout(300);pg.fill('#sayIn','reggae with dub echo');pg.keyboard.press('Enter');pg.wait_for_timeout(400)
    assert pg.locator('#sheet').is_hidden() and pg.evaluate('MSTR.state().fx.echo') and pg.text_content('#vibeTxt')=='reggae with dub echo'
    # Maschine: Link unten führt ins Raster, „Orbit“ oben links zurück; die Ansicht bleibt gespeichert
    pg.click('#vMachine');pg.wait_for_timeout(200);assert pg.locator('#tracks').is_visible() and pg.locator('#vOrbit').is_visible() and pg.locator('#takeBtn').is_hidden()
    pg.evaluate('MSTR.setPlay(false)');pg.reload();pg.wait_for_timeout(300);assert pg.locator('#tracks').is_visible()
    pg.click('#vOrbit');pg.wait_for_timeout(200);assert pg.locator('#mol').is_visible()
    # Surprise me: füllt und schickt ab
    pg=fresh();pg.click('#vSurprise');pg.wait_for_timeout(500)
    assert pg.locator('#sheet').is_hidden() and pg.evaluate('MSTR.state().playing') and pg.text_content('#vibeTxt')
    # Geteilter Link: keine Frage, Beat ist da, im Orbit
    code=pg.evaluate('MSTR.code()');pg.evaluate('MSTR.setPlay(false)')
    c=b.new_context(viewport={'width':390,'height':844});q=c.new_page();q.on('pageerror',lambda e:err.append(str(e)));q.goto(url+'?b='+code);q.wait_for_timeout(400)
    assert q.locator('#sheet').is_hidden() and q.locator('#mol').is_visible() and q.evaluate('MSTR.state()')['pat']==pg.evaluate('MSTR.state()')['pat']
    # Escape schließt die Frage ohne Verlaufseintrag, beim nächsten Laden kommt sie nicht wieder (Orbit mit dem Start-Beat)
    pg=fresh();pg.keyboard.press('Escape');pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden() and pg.evaluate('location.hash')=='' and pg.locator('#mol').is_visible()
    pg.reload();pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden()
    b.close()
assert not err,err
print('t13 ok')
