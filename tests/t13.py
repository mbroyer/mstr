# Willkommen: nur beim ersten Besuch die Frage, wie es losgeht (leeres Raster, Beat-Liste, Beat beschreiben), danach nie wieder; geteilter Link überspringt es
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    def fresh():
        c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page();pg.on('pageerror',lambda e:err.append(str(e)));pg.goto(url);pg.wait_for_timeout(300);return pg
    # Erster Besuch: Blatt ohne Zurück-Pfeil, drei Karten, Feld und drei Beispiele, kein waagerechtes Scrollen
    pg=fresh()
    assert pg.locator('#sheet').is_visible() and pg.locator('#wScratch').is_visible() and pg.locator('#wPick').is_visible() and pg.locator('#sayIn').is_visible()
    assert pg.locator('#sheet [data-close]').count()==0 and pg.locator('#sheet .chip').count()==3
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    pg.screenshot(path=H+'/tests/t13-welcome.png')
    # Leeres Raster: alles leer, Blatt zu, Neuladen zeigt kein Willkommen mehr
    pg.click('#wScratch');pg.wait_for_timeout(300)
    assert pg.locator('#sheet').is_hidden() and pg.locator('.dot.on').count()==0 and pg.inner_text('#preName')=='Your beat'
    pg.reload();pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden() and pg.locator('.dot.on').count()==0
    # Beat wählen: führt in die Beat-Liste, Wahl spielt
    pg=fresh();pg.click('#wPick');pg.wait_for_timeout(300)
    assert pg.locator('.pitem').count()==17;pg.click('.pitem:has-text("House")');pg.wait_for_timeout(300)
    assert pg.locator('#sheet').is_hidden() and pg.inner_text('#preName')=='House' and pg.evaluate('MSTR.state().playing')
    pg.reload();pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden() and pg.inner_text('#preName')=='House'
    # Beschreiben per Beispiel-Chip: Beat läuft, Name wird erzeugt (nicht der Text)
    pg=fresh();t=pg.locator('#sheet .chip').nth(1).inner_text();pg.locator('#sheet .chip').nth(1).click();pg.wait_for_timeout(400)
    nm=pg.inner_text('#preName');assert pg.locator('#sheet').is_hidden() and nm and nm.lower()!=t.lower() and nm!='Your beat' and pg.evaluate('MSTR.state().playing'),(nm,t)
    # Beschreiben per Feld und Enter
    pg=fresh();pg.fill('#sayIn','dark fast techno');pg.keyboard.press('Enter');pg.wait_for_timeout(400)
    assert pg.inner_text('#sub')=='based on Techno' and pg.locator('#sheet').is_hidden()
    # Geteilter Link: kein Willkommen, Beat ist da
    code=pg.evaluate('MSTR.code()');pg.evaluate('MSTR.setPlay(false)')
    c=b.new_context(viewport={'width':390,'height':844});q=c.new_page();q.on('pageerror',lambda e:err.append(str(e)));q.goto(url+'?b='+code);q.wait_for_timeout(400)
    assert q.locator('#sheet').is_hidden() and q.inner_text('#sub')=='based on Techno'
    # Escape schließt das Blatt ohne Verlaufseintrag, beim nächsten Laden kommt es nicht wieder
    pg=fresh();pg.keyboard.press('Escape');pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden() and pg.evaluate('location.hash')==''
    pg.reload();pg.wait_for_timeout(300);assert pg.locator('#sheet').is_hidden()
    b.close()
assert not err,err
print('t13 ok')
