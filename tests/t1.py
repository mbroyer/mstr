# Rauchtest: Seite lädt ohne Fehler, Einführung, 7 Monster-Reihen, Play, Vorlage, kurzer Takt, Stand bleibt nach Neuladen
import os,sys
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/beatbox.html'
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto(url);pg.wait_for_timeout(300)
    assert pg.locator('.dmintro').count()==1,'Einführung fehlt'
    pg.click('.dmi-skip');pg.wait_for_timeout(200)
    assert pg.locator('.dmblk').count()==7,pg.locator('.dmblk').count()
    assert pg.locator('.dmblk.lock').count()==0
    assert pg.locator('#beatCard.live').count()==1,'spielt nicht'
    pg.click('#dmPlay');pg.click('#dmPre button:nth-child(5)');pg.wait_for_timeout(200)
    assert pg.locator('#dmPre button.on').count()==1
    assert pg.locator('.dmblk').first.locator('.dmc').count()==16
    pg.click('#dmKurz');pg.wait_for_timeout(100)
    assert pg.locator('.dmblk').first.locator('.dmc').count()==8
    on=pg.locator('.dmc.on').count()
    pg.reload();pg.wait_for_timeout(300)
    assert pg.locator('.dmintro').count()==0,'Einführung kommt erneut'
    assert pg.locator('.dmc.on').count()==on,'Stand verloren'
    pg.screenshot(path=H+'/tests/t1.png',full_page=True)
    b.close()
assert not err,err
print('t1 ok')
