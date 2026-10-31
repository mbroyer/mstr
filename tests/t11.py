# Karten-Ansicht: Umschalter Grid | Card oben tauscht das Raster gegen die Karte, läuft live mit, bleibt gespeichert, Tipp aufs Molekül öffnet das Namens-Blatt
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    ctx=b.new_context(viewport={'width':390,'height':760});pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    assert pg.locator('#mol').is_hidden() and pg.locator('#tracks').is_visible()
    assert pg.evaluate('document.documentElement.dataset.theme')=='dark','neue Nutzer starten dunkel'
    assert pg.locator('#hue').is_hidden()
    pg.click('#vCard');pg.wait_for_timeout(200)
    assert pg.locator('#mol').is_visible() and pg.locator('#tracks').is_hidden() and pg.get_attribute('#vCard','aria-pressed')=='true' and pg.get_attribute('#vGrid','aria-pressed')=='false'
    assert pg.locator('.transport').is_hidden() and pg.locator('#shCardBtn').is_visible(),'in der Karte keine Leiste'
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).view")=='mol'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    box=pg.locator('#mol').bounding_box();assert box['height']>=320 and box['width']>=350
    # Im Stand atmet das Molekül nur leicht (keine Schläge), beim Spielen bewegt es sich
    snap="document.querySelector('#mol').toDataURL().length+'|'+document.querySelector('#mol').toDataURL().slice(-400)"
    assert pg.evaluate("document.querySelector('#mol').width")>=300
    pg.click('#mol',position={'x':180,'y':120});pg.wait_for_timeout(1200);b1=pg.evaluate(snap);pg.wait_for_timeout(300);b2=pg.evaluate(snap);assert b1!=b2,'bewegt sich beim Spielen'
    assert pg.evaluate('MSTR.state().playing')
    # Effekt an: Modell folgt (Raum), Blatt schließen, weiter spielen ohne Fehler
    pg.click('#vGrid');pg.click('#fxBtn');pg.wait_for_timeout(200);pg.locator('.fxrow[data-fx="room"] .fxi').click();pg.keyboard.press('Escape');pg.click('#vCard');pg.wait_for_timeout(900)
    assert pg.evaluate('MSTR.state().fx.room')
    # Neu laden: Ansicht bleibt; Tipp auf den Titel öffnet das Namens-Blatt oben (Tastatur verdeckt es nicht); Tipp auf den Ring stoppt; Grid bringt das Raster zurück
    pg.reload();pg.wait_for_timeout(400);assert pg.locator('#mol').is_visible()
    bx=pg.locator('#mol').bounding_box();pg.click('#mol',position={'x':60,'y':bx['height']-40});pg.wait_for_timeout(300);assert pg.locator('#shName').is_visible()
    assert pg.evaluate("document.querySelector('.sheet').classList.contains('top')&&document.querySelector('.sheet').getBoundingClientRect().top<=1"),'Namensblatt oben'
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#mol',position={'x':180,'y':120});pg.wait_for_timeout(300);assert pg.evaluate('MSTR.state().playing'),'Tipp auf den Ring spielt'
    pg.click('#mol',position={'x':180,'y':120});pg.wait_for_timeout(300);assert not pg.evaluate('MSTR.state().playing'),'Tipp auf den Ring stoppt'
    pg.click('#vGrid');pg.wait_for_timeout(200);assert pg.locator('#tracks').is_visible() and pg.locator('#mol').is_hidden()
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).view")==''
    # Zweites Umschalten, auch schnell hin und her: die Ansicht läuft weiter (iPhone blieb stehen)
    pg.click('#vCard');pg.click('#vGrid');pg.click('#vCard');pg.wait_for_timeout(1200)
    c1=pg.evaluate(snap);pg.wait_for_timeout(300);c2=pg.evaluate(snap);assert c1!=c2,'läuft nach dem zweiten Umschalten'
    # Farbwahl: fünf Punkte im Orbit, Koralle färbt Orbit und Link, bleibt nach dem Neuladen, Grid blendet die Punkte aus
    assert pg.locator('#hue button').count()==5 and pg.locator('#hue').is_visible()
    assert pg.get_attribute('#hue button[data-hue="f"]','aria-checked')=='true' and not pg.evaluate('MSTR.code()').endswith('.k')
    pg.wait_for_timeout(300);d1=pg.evaluate(snap);pg.click('#hue button[data-hue="k"]');pg.wait_for_timeout(300)
    assert pg.evaluate('MSTR.state().col')=='k' and pg.get_attribute('#hue button[data-hue="k"]','aria-checked')=='true' and pg.evaluate('MSTR.code()').endswith('.k')
    assert pg.evaluate("getComputedStyle(document.getElementById('shCardBtn')).backgroundColor")=='rgb(255, 154, 139)','Video-Knopf trägt die Orbit-Farbe'
    pg.reload();pg.wait_for_timeout(500);assert pg.evaluate('MSTR.state().col')=='k' and pg.get_attribute('#hue button[data-hue="k"]','aria-checked')=='true'
    pg.click('#vGrid');pg.wait_for_timeout(200);assert pg.locator('#hue').is_hidden()
    assert pg.evaluate("getComputedStyle(document.getElementById('play')).backgroundColor")!='rgb(255, 154, 139)','im Grid bleibt die App Flieder'
    b.close()
assert not err,err
print('t11 ok')
