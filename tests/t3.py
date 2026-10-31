# Spur Aufnahme: nur sie hat das Mikrofon, alte Stände und alte Aufnahmen werden übernommen, mit Aufnahme spielt sie ohne Fehler
import os,io,wave,math,base64
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
buf=io.BytesIO();w=wave.open(buf,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050)
w.writeframes(b''.join(int(20000*math.sin(i/8)*math.exp(-i/3000)).to_bytes(2,'little',signed=True) for i in range(8000)));w.close()
WAV=base64.b64encode(buf.getvalue()).decode()
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('file://'+H+'/index.html');pg.evaluate("MSTR.welcome(false)");pg.wait_for_timeout(300)
    mic=pg.locator('.tracks .trk').nth(7)
    assert 'own' in mic.get_attribute('class') and mic.locator('.nm').text_content()=='Mic'
    # Nur die Spur Aufnahme hat den Aufnahmeknopf
    for r in range(7):
        pg.locator('.tracks .trk').nth(r).locator('.tn').click();assert pg.locator('#kRec').count()==0,r;pg.keyboard.press('Escape')
    # Ohne Aufnahme öffnet ein Schritt die Spur, statt einen stummen Punkt zu setzen
    mic.locator('.dot').first.click();pg.wait_for_timeout(100)
    assert pg.locator('#kRec').count()==1 and pg.locator('#kMore').is_hidden()
    pg.screenshot(path=H+'/tests/t3-leer.png')
    pg.keyboard.press('Escape');assert mic.locator('.dot.on').count()==0
    # Vorlage lässt die eigene Spur in Ruhe
    pg.evaluate("localStorage.setItem('mstr-rec-mic',arguments[0])".replace('arguments[0]','"%s"'%WAV));pg.reload();pg.wait_for_timeout(300)
    mic=pg.locator('.tracks .trk').nth(7)
    mic.locator('.dot').nth(4).click();assert mic.locator('.dot.on').count()==1
    pg.click('#preBtn');pg.click('.pitem:has-text("Techno")');pg.wait_for_timeout(600)
    assert mic.locator('.dot.on').count()==1,'Vorlage hat die eigene Spur überschrieben'
    mic.locator('.tn').click();assert pg.locator('#kMore').is_visible()
    assert pg.locator('#sheet .opt').all_inner_texts()==['Normal','Low','High']
    for t in ['Low','High','Normal']:pg.click('#sheet .opt:has-text("%s")'%t);pg.wait_for_timeout(80)
    pg.screenshot(path=H+'/tests/t3-spur.png')
    pg.click('#kDice');pg.wait_for_timeout(1500)
    pg.click('#kDel');assert pg.locator('#kMore').is_hidden()
    pg.keyboard.press('Escape');assert mic.locator('.dot.on').count()==0
    assert pg.evaluate("localStorage.getItem('mstr-rec-mic')") is None
    pg.screenshot(path=H+'/tests/t3.png',full_page=True)
    # Stand v2 mit sieben Spuren und Aufnahme auf der Kick: Muster bleibt, Aufnahme wandert in die eigene Spur
    v2={'pat':{'v':2,'g':['x'+'0'*15,'b'+'0'*15,'p'+'0'*15,'c'+'0'*15,'1'+'0'*15,'t'+'0'*15,'m'+'0'*15],'bpm':90,'sw':0,'pre':-1,'vol':[.8]*7,'mute':[False]*6+[True],'solo':[False]*7,'br':['x','b','p','c','1','b','m']}}
    pg.evaluate("s=>{localStorage.setItem('mstr-v1',JSON.stringify(s.v));localStorage.setItem('mstr-rec-beat',s.w);localStorage.setItem('mstr-own-beat','1');}",{'v':v2,'w':WAV})
    pg.reload();pg.wait_for_timeout(300)
    st=pg.evaluate('MSTR.state()');assert st['bpm']==90 and st['pat'][:7]==v2['pat']['g'] and st['pat'][7]=='0'*16,st
    assert pg.locator('.tracks .trk').nth(6).get_attribute('class')=='trk quiet'
    assert pg.evaluate("[localStorage.getItem('mstr-rec-mic')!==null,localStorage.getItem('mstr-rec-beat'),localStorage.getItem('mstr-own-beat')]")==[True,None,None]
    b.close()
assert not err,err
print('t3 ok')
