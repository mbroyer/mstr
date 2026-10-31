# Beat teilen: Link-Code hin und zurück, Öffnen des Links lädt den Beat (ohne Spur Aufnahme), Adresse wird aufgeräumt, Rückgängig
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    # Absender: Vorlage verändern, Tempo, Swing, Lautstärke, Mute, Effekte
    ctx=b.new_context(viewport={'width':390,'height':844},permissions=['clipboard-read','clipboard-write'])
    pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto(url);pg.evaluate("MSTR.welcome(false);MSTR.view(false)");pg.wait_for_timeout(300)
    assert pg.locator('#vOrbit').is_visible() and pg.inner_text('#vOrbit').strip()=='Orbit' and pg.locator('#share').count()==0,'In der Maschine führt „Orbit“ zurück, kein Teilen-Knopf in der Leiste'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390,'waagerechtes Scrollen'
    pg.locator('.tracks .trk').nth(5).locator('.dot').nth(3).click()
    pg.locator('.tracks .trk').nth(4).locator('.tn').click();pg.click('#kMute');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#fxBtn');pg.wait_for_timeout(200)
    pg.locator('.fxrow .fxi').nth(1).click();pg.locator('.fxrow').nth(1).locator('.opt').nth(2).click()
    pg.locator('.fxrow .fxi').nth(5).click()
    r=pg.locator('.fxrow').nth(5).locator('input[type=range]');r.fill('73');r.dispatch_event('change')
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.evaluate("MSTR.setPlay(false)")
    SITE='https://asimplemanslab.com/mstr/app/'
    # Punkt setzen (erst dann ist der Beat benennbar), Titel antippen: Namens-Blatt, erzeugter Name steht sofort als Titel oben
    pg.locator('.tracks .trk').nth(4).locator('.dot').nth(5).click();pg.wait_for_timeout(100)
    pg.click('#preName');pg.wait_for_timeout(300)
    assert pg.locator('#shName').is_visible() and pg.locator('#sheet input:not(#shBy)').count()==0
    NAME=pg.inner_text('#shName');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    assert NAME and pg.inner_text('#preName')==NAME and pg.inner_text('#sub')=='based on Amapiano'
    pg.evaluate("MSTR.hue('m')") # Orbit-Farbe Mint reist mit
    st=pg.evaluate('MSTR.state()')
    code=pg.evaluate('MSTR.code()');print('code',len(code),code);assert code.endswith('.m')
    link=pg.evaluate('MSTR.url()');assert link.startswith(SITE+'?b=') and '#' not in link
    # Link: im Orbit als Textzeile unter dem Video-Knopf
    pg.keyboard.press('Escape');pg.wait_for_timeout(200);pg.click('#vOrbit');pg.wait_for_timeout(300);assert pg.locator('#more').count()==0
    assert pg.inner_text('#shSend')=='Copy link'
    pg.click('#shSend');pg.wait_for_timeout(300)
    assert pg.evaluate('navigator.clipboard.readText()')==link
    # Rechner: der Knopf heißt Copy link und bestätigt das Kopieren, die Hinweiszeile erklärt
    assert pg.inner_text('#shSend')=='\u2713 Link copied' and 'Paste it' in pg.inner_text('#shCardT')
    pg.wait_for_timeout(2700);assert pg.inner_text('#shSend')=='Copy link'
    pg.click('#vMachine')
    pg.reload();pg.wait_for_timeout(300);assert pg.inner_text('#preName')==NAME,'Name bleibt gespeichert'
    link=link.replace(SITE,url)
    # Empfänger: eigener Stand (anderes Tempo, Mic-Zeile) wird ersetzt, die Mic-Zeile bleibt
    ctx2=b.new_context(viewport={'width':390,'height':844});q=ctx2.new_page();q.on('pageerror',lambda e:err.append(str(e)))
    q.goto(url);q.evaluate("MSTR.welcome(false);MSTR.view(false)");q.wait_for_timeout(300)
    q.evaluate("localStorage.setItem('mstr-v1',JSON.stringify({pat:{v:5,g:Array(8).fill('0'.repeat(16)).map((x,i)=>i==7?'a'+'0'.repeat(15):x),bpm:70,sw:0,pre:-1}}))")
    q.goto(link);q.wait_for_timeout(400)
    s2=q.evaluate('MSTR.state()')
    assert s2['pat'][:7]==st['pat'][:7],(s2['pat'],st['pat'])
    assert s2['pat'][7]=='a'+'0'*15,'Spur Aufnahme des Empfängers bleibt'
    assert s2['bpm']==st['bpm'] and abs(s2['sw']-st['sw'])<.01 and s2['pre']==st['pre']
    assert s2['fx']==st['fx'] and s2['fxa']['lofi']==73 and s2['fxo']['echo']==4,(s2['fx'],s2['fxa'],s2['fxo'])
    assert q.inner_text('#preName')==NAME and s2['pre']==st['pre']
    assert s2['col']=='m','Orbit-Farbe kommt mit dem Link'
    assert q.locator('.tracks .trk.quiet').count()==1
    assert '?b=' not in q.url,q.url
    assert NAME+'\u201d loaded' in q.inner_text('.toast'),q.inner_text('.toast')
    # bleibt nach Neuladen
    q.reload();q.wait_for_timeout(300);assert q.evaluate('MSTR.state()')['pat'][:7]==st['pat'][:7]
    # Rückgängig holt den alten Stand zurück
    q.goto(link);q.wait_for_timeout(300);q.click('.toast button');q.wait_for_timeout(100);q.evaluate('MSTR.view(false)')
    s3=q.evaluate('MSTR.state()');assert s3['bpm']==st['bpm'] # vorheriger Stand war der geteilte Beat
    # Vorlage wählen löscht den eigenen Namen
    q.click('#preBtn');q.wait_for_timeout(200);q.locator('.pitem').first.click();q.wait_for_timeout(200)
    assert q.inner_text('#preName')!=NAME and q.inner_text('#sub')=='';q.evaluate('MSTR.setPlay(false)')
    # kaputter Link: nichts passiert
    q.evaluate("localStorage.setItem('mstr-v1',JSON.stringify({pat:{v:5,g:Array(8).fill('0'.repeat(16)),bpm:70,sw:0,pre:-1}}))")
    q.goto(url+'?b=1.120.0..xyz...');q.wait_for_timeout(300)
    assert q.evaluate('MSTR.state()')['bpm']==70 and q.locator('.toast').count()==0
    # Undo nach geteiltem Link auf leerem Stand
    q.goto(link);q.wait_for_timeout(300);q.click('.toast button');q.wait_for_timeout(100)
    s4=q.evaluate('MSTR.state()');assert s4['bpm']==70 and s4['fx']['lofi'] is False,s4
    # Handy mit Teilen-Menü: Send link, das Menü bekommt Titel, Text und Link
    m=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);mp=m.new_page();mp.on('pageerror',lambda e:err.append(str(e)))
    mp.add_init_script("navigator.share=d=>{window.__shared=d;return Promise.resolve();}")
    mp.goto(url);mp.evaluate("MSTR.welcome(false);MSTR.view(false)");mp.wait_for_timeout(300)
    mp.click('#vOrbit');mp.wait_for_timeout(300)
    assert mp.inner_text('#shSend')=='Send link'
    mp.click('#shSend');mp.wait_for_timeout(300)
    d=mp.evaluate('window.__shared');assert d['url'].startswith(SITE+'?b=') and 'Amapiano' in d['text'],d
    # Leiste am Handy: Effects und Drop tragen ihr Wort (erst unter 360 px nur das Symbol), alles passt ohne Scrollen
    for vw in (320,360,390):
        q2=b.new_page(viewport={'width':vw,'height':800});q2.goto(url);q2.evaluate("MSTR.welcome(false);MSTR.view(false)");q2.wait_for_timeout(200)
        assert q2.locator('#fxBtn .fxl').is_visible()==(vw>=360) and q2.evaluate('document.documentElement.scrollWidth')<=vw
        r=q2.locator('#tempoBtn').bounding_box();assert r['x']+r['width']<=vw-12,(vw,r)
    b.close()
assert not err,err
print('ok')
