# Variation je Schritt: lange drücken öffnet die Klänge der Spur, Wahl setzt nur diesen Schritt, Off löscht ihn, Link trägt die Variation
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
def press(pg,loc,ms=600,touch=False):
    bb=loc.bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+bb['height']/2
    pg.mouse.move(x,y);pg.mouse.down();pg.wait_for_timeout(ms);pg.mouse.up();pg.wait_for_timeout(100)
with sync_playwright() as p:
    b=p.chromium.launch(**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844});pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto(url);pg.evaluate("MSTR.welcome(false);MSTR.view(false)");pg.wait_for_timeout(300)
    pg.click('#preBtn');pg.wait_for_timeout(200);pg.click('#clr');pg.wait_for_timeout(200)
    hats=pg.locator('.tracks .trk').nth(0).locator('.dot')
    # Kurz antippen schaltet wie bisher, ohne Feld
    hats.nth(2).click();assert pg.evaluate('MSTR.state()')['pat'][0][2]=='x' and pg.locator('.vpick').count()==0
    # Lange drücken auf leeren Schritt: Feld mit den drei Hi-Hat-Klängen, ohne Off; der Schritt bleibt aus
    press(pg,hats.nth(5))
    vp=pg.locator('.vpick');assert vp.count()==1
    assert vp.locator('.opt').all_inner_texts()==['1\nClosed','2\nOpen','3\nTick'],vp.locator('.opt').all_inner_texts()
    assert pg.evaluate('MSTR.state()')['pat'][0][5]=='0','langes Drücken schaltet nicht um'
    bb=vp.bounding_box();assert bb['x']>=0 and bb['x']+bb['width']<=390,'Feld bleibt im Bild'
    assert bb['y']+bb['height']<=hats.nth(5).bounding_box()['y'],'Feld über dem Punkt'
    vp.locator('.opt',has_text='Open').click();pg.wait_for_timeout(100)
    st=pg.evaluate('MSTR.state()');assert st['pat'][0][5]=='o' and pg.locator('.vpick').count()==0
    assert hats.nth(5).inner_text()=='2','Punkt zeigt die Variation'
    # Pinsel für neue Schritte bleibt unverändert
    hats.nth(7).click();assert pg.evaluate('MSTR.state()')['pat'][0][7]=='x'
    # Gesetzter Schritt: gewählter Klang ist markiert, Off löscht ihn
    press(pg,hats.nth(5))
    assert pg.locator('.vpick .opt[aria-pressed=true]').inner_text()=='2\nOpen'
    pg.locator('.vpick .opt.off').click();assert pg.evaluate('MSTR.state()')['pat'][0][5]=='0'
    # Escape und Tippen daneben schließen
    press(pg,hats.nth(9));pg.keyboard.press('Escape');assert pg.locator('.vpick').count()==0
    press(pg,hats.nth(9));pg.mouse.click(200,20);pg.wait_for_timeout(50);assert pg.locator('.vpick').count()==0
    # Nach dem langen Drücken wird der nächste kurze Tipp nicht verschluckt
    hats.nth(9).click();assert pg.evaluate('MSTR.state()')['pat'][0][9]=='x'
    # Rechtsklick öffnet das Feld auch (Desktop); Perc zeigt fünf Klänge
    perc=pg.locator('.tracks .trk').nth(4).locator('.dot')
    perc.nth(0).click(button='right');assert pg.locator('.vpick .opt').count()==5
    pg.locator('.vpick .opt',has_text='Cowbell').click();assert pg.evaluate('MSTR.state()')['pat'][4][0]=='5'
    # Kick: nur ein Klang, langes Drücken schaltet ganz normal
    kick=pg.locator('.tracks .trk').nth(1).locator('.dot')
    press(pg,kick.nth(3));assert pg.locator('.vpick').count()==0 and pg.evaluate('MSTR.state()')['pat'][1][3]=='b'
    # Während der Wiedergabe genauso
    pg.evaluate('MSTR.setPlay(true)');press(pg,hats.nth(11));pg.locator('.vpick .opt',has_text='Tick').click()
    assert pg.evaluate('MSTR.state()')['pat'][0][11]=='k';pg.evaluate('MSTR.setPlay(false)')
    # Link trägt die Variationen
    code=pg.evaluate('MSTR.code()')
    q=b.new_page(viewport={'width':390,'height':844});q.on('pageerror',lambda e:err.append(str(e)))
    q.goto(url+'?b='+code);q.wait_for_timeout(300)
    assert q.evaluate('MSTR.state()')['pat'][:7]==pg.evaluate('MSTR.state()')['pat'][:7]
    # Gespeichert
    pg.reload();pg.wait_for_timeout(300);s=pg.evaluate('MSTR.state()')['pat'];assert s[0][11]=='k' and s[4][0]=='5'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    b.close()
assert not err,err
print('ok')
