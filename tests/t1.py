# Rauchtest: Seite lädt ohne Fehler, 7 Spuren à 16 Schritte, Play, Vorlage, Mute, Tempo, Leeren mit Rückgängig, Stand bleibt nach Neuladen
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto(url);pg.evaluate("MSTR.welcome(false)");pg.wait_for_timeout(300)
    assert pg.locator('.tracks .trk').count()==8,pg.locator('.tracks .trk').count()
    assert pg.locator('.tracks .trk').first.locator('.dot').count()==16
    assert pg.locator('.tracks .ic svg').count()==8,'Spur-Icons fehlen'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390,'waagerechtes Scrollen'
    assert pg.inner_text('#preName')=='Amapiano'
    on=pg.locator('.dot.on').count();assert on>0
    # Schritt setzen
    pg.locator('.tracks .trk').nth(2).locator('.dot').first.click()
    assert pg.locator('.dot.on').count()==on+1
    # Play und Playhead
    pg.click('#play');pg.wait_for_timeout(400)
    assert pg.locator('#play.on').count()==1,'spielt nicht'
    assert pg.locator('.dot.ph').count()==8,'kein Playhead'
    pg.keyboard.press('Space');pg.wait_for_timeout(100)
    assert pg.locator('#play.on').count()==0,'Leertaste stoppt nicht'
    # Vorlage wählen
    pg.click('#preBtn');assert pg.locator('.pitem').count()==17
    pg.click('.pitem:has-text("House")');pg.wait_for_timeout(100)
    assert pg.inner_text('#preName')=='House' and pg.inner_text('#bpm')=='116'
    assert pg.locator('#sheet').is_hidden()
    pg.click('#play')
    # Mute
    # Mute wohnt auf der Spurseite, nicht mehr im Raster
    assert pg.locator('.tracks .ms').count()==0
    pg.locator('.tracks .trk').nth(1).locator('.tn').click();pg.click('#kMute');pg.click('#sheet [data-close]')
    assert pg.locator('.tracks .trk.quiet').count()==1
    # Spur-Blatt
    pg.locator('.tracks .trk').first.locator('.tn').click()
    assert pg.locator('#sheet .opt').count()==3
    pg.click('#sheet .opt:has-text("Open")')
    pg.screenshot(path=H+'/tests/t1-spur.png')
    pg.click('#sheet [data-close]');assert pg.locator('#sheet').is_hidden(),'Zurück schließt nicht'
    # Browser-Zurück schließt die Unterseite
    pg.click('#preBtn');pg.wait_for_timeout(100);assert pg.evaluate('location.hash')=='#vorlagen'
    pg.screenshot(path=H+'/tests/t1-vorlagen.png')
    pg.go_back();pg.wait_for_timeout(200);assert pg.locator('#sheet').is_hidden(),'Browser-Zurück schließt nicht'
    assert 'Open' in pg.locator('.tracks .trk').first.locator('.tb').inner_text()
    # Tempo
    pg.click('#tempoBtn');pg.click('#tUp');pg.click('#tUp')
    pg.screenshot(path=H+'/tests/t1-tempo.png')
    pg.keyboard.press('Escape')
    assert pg.inner_text('#bpm')=='118'
    # Leeren und Rückgängig
    on=pg.locator('.dot.on').count()
    pg.click('#preBtn');pg.wait_for_timeout(200);assert pg.locator('.pitem').first.inner_text().startswith('Empty grid');pg.click('#clr');pg.wait_for_timeout(200);assert pg.locator('.dot.on').count()==0
    pg.click('.toast button');assert pg.locator('.dot.on').count()==on
    pg.screenshot(path=H+'/tests/t1.png',full_page=True)
    pg.reload();pg.wait_for_timeout(300)
    assert pg.locator('.dot.on').count()==on,'Stand verloren'
    assert pg.inner_text('#bpm')=='118' and pg.locator('.tracks .trk.quiet').count()==1
    # Farbschema: drei Schalter am Ende der Beat-Liste
    pg.click('#preBtn');pg.wait_for_timeout(200);pg.click('#themeSeg [data-t="light"]');assert pg.evaluate('document.documentElement.dataset.theme')=='light'
    pg.click('#themeSeg [data-t="dark"]');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    assert pg.evaluate('document.documentElement.dataset.theme')=='dark' and pg.locator('#theme').count()==0
    assert 'Open' in pg.locator('.tracks .trk').first.locator('.tb').inner_text(),'Klangwahl verloren'
    pg.wait_for_timeout(400)
    pg.screenshot(path=H+'/tests/t1-dark.png',full_page=True)
    b.close()
assert not err,err
print('t1 ok')
