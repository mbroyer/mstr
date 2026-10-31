# Wiedergabe stoppt, wenn das Handy gesperrt oder der Tab/die App verlassen wird (visibilitychange, pagehide)
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.evaluate("MSTR.welcome(false);MSTR.view(false)");pg.wait_for_timeout(300)
    hide="""()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));}"""
    show="""()=>{delete document.hidden;delete document.visibilityState;}"""
    pg.click('#play');pg.wait_for_timeout(400)
    assert pg.evaluate('MSTR.state()')['playing']
    pg.evaluate(hide);pg.wait_for_timeout(100)
    assert not pg.evaluate('MSTR.state()')['playing'],'Sperren/Tab verlassen muss stoppen'
    assert pg.locator('#play.on').count()==0
    pg.evaluate(show)
    # wieder abspielen geht danach normal
    pg.click('#play');pg.wait_for_timeout(400)
    assert pg.evaluate('MSTR.state()')['playing']
    pg.evaluate("()=>window.dispatchEvent(new Event('pagehide'))");pg.wait_for_timeout(100)
    assert not pg.evaluate('MSTR.state()')['playing'],'pagehide muss stoppen'
    pg.click('#play');pg.wait_for_timeout(400)
    assert pg.evaluate('MSTR.state()')['playing']
    b.close()
assert not err,err
print('t4 ok')
