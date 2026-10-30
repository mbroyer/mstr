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
    pg.goto(url);pg.wait_for_timeout(300)
    assert pg.locator('#share').is_visible()
    assert pg.evaluate('document.documentElement.scrollWidth')<=390,'waagerechtes Scrollen'
    pg.locator('.tracks .trk').nth(5).locator('.dot').nth(3).click()
    pg.locator('.tracks .trk').nth(4).locator('.ms.m').click()
    pg.click('#fxBtn');pg.wait_for_timeout(200)
    pg.locator('.fxrow .fxi').nth(1).click();pg.locator('.fxrow').nth(1).locator('.opt').nth(2).click()
    pg.locator('.fxrow .fxi').nth(5).click()
    r=pg.locator('.fxrow').nth(5).locator('input[type=range]');r.fill('73');r.dispatch_event('change')
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.evaluate("MSTR.setPlay(false)")
    st=pg.evaluate('MSTR.state()')
    code=pg.evaluate('MSTR.code()');print('code',len(code),code)
    link=pg.evaluate('MSTR.url()');assert link.startswith('file://') and '?b=' in link and '#' not in link
    pg.click('#share');pg.wait_for_timeout(300)
    assert pg.evaluate('navigator.clipboard.readText()')==link
    assert 'Link copied' in pg.inner_text('.toast')
    # Empfänger: eigener Stand (anderes Tempo, Mic-Zeile) wird ersetzt, die Mic-Zeile bleibt
    ctx2=b.new_context(viewport={'width':390,'height':844});q=ctx2.new_page();q.on('pageerror',lambda e:err.append(str(e)))
    q.goto(url);q.wait_for_timeout(300)
    q.evaluate("localStorage.setItem('mstr-v1',JSON.stringify({pat:{v:5,g:Array(8).fill('0'.repeat(16)).map((x,i)=>i==7?'a'+'0'.repeat(15):x),bpm:70,sw:0,pre:-1}}))")
    q.goto(link);q.wait_for_timeout(400)
    s2=q.evaluate('MSTR.state()')
    assert s2['pat'][:7]==st['pat'][:7],(s2['pat'],st['pat'])
    assert s2['pat'][7]=='a'+'0'*15,'Spur Aufnahme des Empfängers bleibt'
    assert s2['bpm']==st['bpm'] and abs(s2['sw']-st['sw'])<.01 and s2['pre']==st['pre']
    assert s2['fx']==st['fx'] and s2['fxa']['lofi']==73 and s2['fxo']['echo']==4,(s2['fx'],s2['fxa'],s2['fxo'])
    assert q.locator('#sub').inner_text()=='edited'
    assert q.locator('.tracks .trk').nth(4).locator('.ms.m').get_attribute('aria-pressed')=='true'
    assert '?b=' not in q.url,q.url
    assert 'Shared beat loaded' in q.inner_text('.toast')
    # bleibt nach Neuladen
    q.reload();q.wait_for_timeout(300);assert q.evaluate('MSTR.state()')['pat'][:7]==st['pat'][:7]
    # Rückgängig holt den alten Stand zurück
    q.goto(link);q.wait_for_timeout(300);q.click('.toast button');q.wait_for_timeout(100)
    s3=q.evaluate('MSTR.state()');assert s3['bpm']==st['bpm'] # vorheriger Stand war der geteilte Beat
    # kaputter Link: nichts passiert
    q.evaluate("localStorage.setItem('mstr-v1',JSON.stringify({pat:{v:5,g:Array(8).fill('0'.repeat(16)),bpm:70,sw:0,pre:-1}}))")
    q.goto(url+'?b=1.120.0..xyz...');q.wait_for_timeout(300)
    assert q.evaluate('MSTR.state()')['bpm']==70 and q.locator('.toast').count()==0
    # Undo nach geteiltem Link auf leerem Stand
    q.goto(link);q.wait_for_timeout(300);q.click('.toast button');q.wait_for_timeout(100)
    s4=q.evaluate('MSTR.state()');assert s4['bpm']==70 and s4['fx']['lofi'] is False,s4
    b.close()
assert not err,err
print('ok')
