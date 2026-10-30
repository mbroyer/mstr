# Klangtest: jeden Klang jeder Spur einmal auslösen, alle Vorlagen kurz abspielen, Drop zünden; keine Fehler und jeder Klang in der Auswahl
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    want=[['Zu','Offen','Pedal'],None,None,['Snare','Sidestick','Rimshot'],['Shaker','Tamburin','Clave','Conga','Cowbell'],['Tom tief','Tom mittel','Tom hoch','Crash','Ride'],['Flam','Glocke','Splash','Wirbel','Triangel']]
    for r,w in enumerate(want):
        pg.locator('.tracks .trk').nth(r).locator('.tn').click();pg.wait_for_timeout(100)
        if w:
            assert pg.locator('#sheet .opt').all_inner_texts()==w,pg.locator('#sheet .opt').all_inner_texts()
            for t in w:pg.click('#sheet .opt:has-text("%s")'%t);pg.wait_for_timeout(80)
        pg.keyboard.press('Escape')
    pg.click('#play')
    pg.wait_for_timeout(800)
    for i in range(13):
        pg.click('#preBtn');pg.locator('.pitem').nth(i).click();pg.wait_for_timeout(500)
    pg.click('#drop');pg.wait_for_timeout(4500)
    assert pg.locator('#play.on').count()==1
    b.close()
assert not err,err
print('t2 ok')
