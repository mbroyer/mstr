# Karte teilen: Name und „By“ im Namens-Blatt (Titel-Würfel aus dem Beat, änderbar, gespeichert), „Share“ in der Karten-Ansicht macht
# das Video mit Ton (so lang wie der Clip: 8 Takte plus Schlussschlag und Nachklang), Ton des Clips folgt dem Arrangement, nie Hakenkreuz-Schutz vergessen
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    ctx=b.new_context(viewport={'width':390,'height':844},accept_downloads=True);pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.evaluate("MSTR.welcome(false)");pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#tempoBtn').click()");pg.wait_for_timeout(200)
    pg.fill('#tBpm','160');pg.dispatch_event('#tBpm','change');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    # Namens-Blatt über den Titel: Würfel zweimal verschieden, steht sofort oben als Name; danach von Hand änderbar; By bleibt gespeichert
    pg.click('#preName');pg.wait_for_timeout(300)
    assert pg.locator('#shName').is_visible() and pg.locator('#shDice').is_visible() and pg.evaluate('document.activeElement.id')=='shName'
    pg.click('#shDice');t1=pg.input_value('#shName');pg.click('#shDice');t2=pg.input_value('#shName')
    print('titel',t1,'|',t2);assert t1 and t2 and t1!=t2 and pg.inner_text('#preName')==t2
    assert pg.evaluate("MSTR.card.title(MSTR.card.model(MSTR.state().pat,160,0),0)")==t1,'gleicher Beat, gleicher Vorschlag'
    pg.fill('#shName','Card Test');assert pg.inner_text('#preName')=='Card Test'
    pg.fill('#shBy','@mark');pg.wait_for_timeout(100)
    assert pg.evaluate("JSON.parse(localStorage.getItem('mstr-v1')).by")=='@mark'
    pg.keyboard.press('Enter');pg.wait_for_timeout(200);assert pg.locator('#sheet').is_hidden()
    # Karten-Ansicht: Share-Knopf und Mehr, kein Teilen-Knopf in der Leiste
    assert pg.locator('#share').count()==0
    pg.click('#vCard');pg.wait_for_timeout(200)
    assert pg.locator('#shCardBtn').is_visible() and pg.locator('#shSend').is_visible() and pg.locator('#shWav').is_visible() and pg.inner_text('#shCardBtn')=='Save video' and 'with sound' in pg.inner_text('#shCardT')
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    # Arrangement: Takt 1 nur Kick und Hats, Takt 7 ohne Kick, Takt 9 nichts (Schlussschlag kommt extra)
    assert pg.evaluate("[MSTR.card.active(1,0),MSTR.card.active(2,0),MSTR.card.active(1,6),MSTR.card.active(0,8)]")==[True,False,False,False]
    # Ton des Clips: Länge genau 9 Takte plus Nachklang, am Anfang sofort Ton (Kick auf der 1), im Schlusstakt nur der eine Schlag
    d=pg.evaluate("""new Promise(r=>MSTR.renderClip(b=>{if(!b)return r(null);const c=b.getChannelData(0),sr=b.sampleRate,bar=240/160;
      const rms=(a,z)=>{let s=0,n=0;for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++){s+=c[i]*c[i];n++;}return Math.sqrt(s/n);};
      r({dur:b.duration,first:rms(0,.1),fin:rms(8*bar,8*bar+.1),late:rms(8*bar+1.6,8*bar+2.0)});}))""")
    print('clip',d);assert d and abs(d['dur']-(9*240/160+2.4))<.01 and d['first']>.02 and d['fin']>.02 and d['late']<d['fin']/3
    # Effekte wandern in die Karte: normiert je id {a,o}; Stutter verdoppelt die Ereignisse am Taktende; Zeichnen mit allen Effekten und Glas läuft fehlerfrei
    fxm=pg.evaluate("""(()=>{const C=MSTR.card,m=C.model(MSTR.state().pat,160,0,{room:.5,echo:{a:1,o:4},sweep:{a:.5},pump:{a:.5,o:2},stut:{a:1,o:1},lofi:1}),S=new C.Scene(m),cv=document.createElement('canvas');cv.width=540;cv.height=960;
      const x=cv.getContext('2d');C.story(x,540,960,S,{title:'T',glass:1});S.seek(0.01);for(let t=0;t<6;t+=.05){S.seek(t);C.story(x,540,960,S,{title:'T',glass:1,live:true});}
      return {room:m.fx.room.a,echoO:m.fx.echo.o,sweepO:m.fx.sweep.o,ev:S.ev.length,plain:C.model(MSTR.state().pat,160,0).fx};})()""")
    print('fx',fxm);assert fxm['room']==.5 and fxm['echoO']==4 and fxm['sweepO']==2 and fxm['ev']>9*16 and fxm['plain']=={}
    # Video: Aufnahme in Echtzeit, Datei kommt als Download (am Rechner), Name mit Titel und Tempo; Wiedergabe stoppt dafür
    assert pg.evaluate('MSTR.card.canVideo()')
    pg.click('#mol',position={'x':180,'y':120});pg.wait_for_timeout(300);assert pg.evaluate('MSTR.state().playing'),'Tipp auf den Ring spielt'
    with pg.expect_download(timeout=60000) as dl:pg.click('#shCardBtn')
    f=dl.value;print('datei',f.suggested_filename,os.path.getsize(f.path()))
    assert f.suggested_filename in ('Card-Test-160bpm.mp4','Card-Test-160bpm.webm') and os.path.getsize(f.path())>200000
    assert 'Saved Card-Test-160bpm' in pg.inner_text('#shCardT')
    assert not pg.evaluate('MSTR.state().playing')
    # Noch einmal tippen ohne Änderung: dieselbe Datei sofort, ohne neue Aufnahme
    with pg.expect_download(timeout=3000) as dl2:pg.click('#shCardBtn')
    assert dl2.value.suggested_filename==f.suggested_filename
    # Zurück zum Raster während der Aufnahme: Aufnahme bricht ab, kein Download, Knopf wieder frei
    bx=pg.locator('#mol').bounding_box();pg.click('#mol',position={'x':60,'y':bx['height']-40});pg.wait_for_timeout(300);pg.fill('#shName','Other');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#shCardBtn');pg.wait_for_timeout(1500);pg.click('#vGrid');pg.wait_for_timeout(600)
    assert pg.locator('#tracks').is_visible() and pg.locator('#shCardBtn').is_hidden()
    pg.click('#vCard');pg.wait_for_timeout(100);assert pg.evaluate("document.querySelector('#shCardBtn').disabled")==False
    b.close()
assert not err,err
print('t10 ok')
