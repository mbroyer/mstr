# Molekül-Ansicht: Schalter oben tauscht das Raster gegen die Karte, läuft live mit, bleibt gespeichert, Tipp aufs Molekül zurück
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    ctx=b.new_context(viewport={'width':390,'height':760});pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    assert pg.locator('#mol').is_hidden() and pg.locator('#tracks').is_visible()
    pg.click('#view');pg.wait_for_timeout(200)
    assert pg.locator('#mol').is_visible() and pg.locator('#tracks').is_hidden() and pg.get_attribute('#view','aria-pressed')=='true'
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).view")=='mol'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    box=pg.locator('#mol').bounding_box();assert box['height']>=320 and box['width']>=350
    # Im Stand atmet das Molekül nur leicht (keine Schläge), beim Spielen bewegt es sich
    snap="document.querySelector('#mol').toDataURL().length+'|'+document.querySelector('#mol').toDataURL().slice(-400)"
    assert pg.evaluate("document.querySelector('#mol').width")>=300
    pg.click('#play');pg.wait_for_timeout(1200);b1=pg.evaluate(snap);pg.wait_for_timeout(300);b2=pg.evaluate(snap);assert b1!=b2,'bewegt sich beim Spielen'
    assert pg.evaluate('MSTR.state().playing')
    # Effekt an: Modell folgt (Raum), Blatt schließen, weiter spielen ohne Fehler
    pg.click('#fxBtn');pg.wait_for_timeout(200);pg.locator('.fxrow[data-fx="room"] .fxi').click();pg.keyboard.press('Escape');pg.wait_for_timeout(900)
    assert pg.evaluate('MSTR.state().fx.room')
    # Neu laden: Ansicht bleibt; Tipp aufs Molekül bringt das Raster zurück
    pg.reload();pg.wait_for_timeout(400);assert pg.locator('#mol').is_visible()
    pg.click('#mol');pg.wait_for_timeout(200);assert pg.locator('#tracks').is_visible() and pg.locator('#mol').is_hidden()
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).view")==''
    b.close()
assert not err,err
print('t11 ok')
