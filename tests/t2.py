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
    want=[['Closed','Open','Tick'],None,['Snare','Rim','Noise','Clap'],['Crash','Ride','China'],['Shaker','Tambourine','Clave','Conga','Cowbell'],['Low','Mid','High'],['Snap','Sub','Reverse','Roll','Riser']]
    for r,w in enumerate(want):
        pg.locator('.tracks .trk').nth(r).locator('.tn').click();pg.wait_for_timeout(100)
        if w:
            assert pg.locator('#sheet .opt').all_inner_texts()==w,pg.locator('#sheet .opt').all_inner_texts()
            for t in w:pg.click('#sheet .opt:has-text("%s")'%t);pg.wait_for_timeout(80)
        pg.keyboard.press('Escape')
    pg.click('#play')
    pg.wait_for_timeout(800)
    for i in range(16):
        pg.click('#preBtn');pg.locator('.pitem').nth(i).click();pg.wait_for_timeout(500)
    pg.click('#drop');pg.wait_for_timeout(4500)
    assert pg.locator('#play.on').count()==1
    # alter Stand mit Clap-Spur wird umgerechnet
    old={'pat':{'g':['x'+'0'*15,'b'+'0'*15,'0000c'+'0'*11,'p'+'0'*15,'1'+'0'*15,'b'*1+'0'*11+'c'+'0'*3,'m'+'0'*15],'bpm':100,'sw':0,'pre':-1,'vol':[.8]*7,'mute':[False,False,True,False,False,False,False],'solo':[False]*7}}
    pg.evaluate("s=>localStorage.setItem('mstr-v1',JSON.stringify(s))",old);pg.reload();pg.wait_for_timeout(300)
    st=pg.evaluate('MSTR.state()')['pat']
    assert st[2]=='p000c'+'0'*11 and st[3]=='0'*12+'c000' and st[5]=='b'+'0'*15,st
    assert pg.locator('.tracks .trk.quiet').count()==0,'Mute der alten Clap-Spur darf nicht auf eine andere Spur rutschen'
    b.close()
assert not err,err
print('t2 ok')
