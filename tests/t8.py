# Beat als Audiodatei: Teilen-Blatt, vier Takte offline berechnet, WAV mit richtiger Länge, Ton ab der Eins, Speichern am Rechner,
# Wiedergabe läuft dabei ungestört weiter, mit Effekten und mit eigener Aufnahme
import os,struct,base64,io,wave,math
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
def wav(path):
    data=open(path,'rb').read()
    assert data[:4]==b'RIFF' and data[8:12]==b'WAVE'
    ch,sr=struct.unpack('<HI',data[22:28]);n=struct.unpack('<I',data[40:44])[0]//(2*ch)
    return ch,sr,n,struct.unpack('<%dh'%(n*ch),data[44:44+n*ch*2])
def rms(x):return (sum(v*v for v in x)/max(1,len(x)))**.5/32768
# eigener Klang: 0,2 s Ton als WAV
buf=io.BytesIO();w=wave.open(buf,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(44100)
w.writeframes(b''.join(struct.pack('<h',int(20000*math.sin(i/44100*2*math.pi*600)*(1-i/8820))) for i in range(8820)));w.close()
REC=base64.b64encode(buf.getvalue()).decode()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    ctx=b.new_context(viewport={'width':390,'height':844},accept_downloads=True);pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#tempoBtn').click()");pg.wait_for_timeout(200)
    pg.fill('#tBpm','180');pg.dispatch_event('#tBpm','change');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#play');pg.wait_for_timeout(300)
    pg.click('#share');pg.wait_for_timeout(200)
    assert pg.locator('#shLink').is_visible() and pg.locator('#shAudio').is_visible()
    assert pg.evaluate('document.documentElement.scrollWidth')<=390
    pg.click('#shAudio')
    pg.wait_for_selector('#shAudio.ready',timeout=15000)
    assert pg.evaluate('MSTR.state().playing'),'Wiedergabe läuft weiter'
    t=pg.inner_text('#shAudio');print(t.replace('\n',' | '));assert 'Save audio' in t and '7 seconds' in t
    with pg.expect_download() as d:pg.click('#shAudio')
    dl=d.value;print(dl.suggested_filename);assert dl.suggested_filename=='MSTR-Amapiano-180bpm.wav'
    ch,sr,n,smp=wav(dl.path())
    print('kanäle',ch,'rate',sr,'sekunden',round(n/sr,3))
    assert ch==2 and abs(n/sr-(.02+4*16*60/180/4+1.5))<.01
    r=rms(smp[::5]);peak=max(abs(x) for x in smp)/32768;print('rms',round(r,3),'peak',round(peak,3));assert r>.02 and peak<1
    on=next(i for i,x in enumerate(smp) if abs(x)>3000)//ch;print('erster Ton bei ms',round(on/sr*1000,1));assert on/sr<.03
    assert rms(smp[-int(sr*.05)*ch:])<.002,'klingt am Ende aus'
    # Echo an und eigene Aufnahme in der Spur Mic: beides im Mitschnitt
    pg.keyboard.press('Escape');pg.evaluate('MSTR.setPlay(false)')
    pg.evaluate("localStorage.setItem('mstr-rec-mic','%s')"%REC)
    pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('mstr-v1'));s.pat.g=s.pat.g.map((x,i)=>i==7?'a'+'0'.repeat(15):'0'.repeat(16));s.fx={echo:1};localStorage.setItem('mstr-v1',JSON.stringify(s));})()")
    pg.reload();pg.wait_for_timeout(300)
    pg.click('#share');pg.wait_for_timeout(200)
    assert 'with your recording' in pg.inner_text('#shAudio')
    pg.click('#shAudio');pg.wait_for_selector('#shAudio.ready',timeout=15000)
    with pg.expect_download() as d:pg.click('#shAudio')
    ch,sr,n,smp=wav(d.value.path())
    head=rms(smp[:int(sr*.2)*ch]);echo=rms(smp[int(sr*.3)*ch:int(sr*.6)*ch]);rest=rms(smp[int(sr*1.2)*ch:int(sr*1.3)*ch])
    print('aufnahme',round(head,3),'echo',round(echo,4),'später',round(rest,4))
    assert head>.05,'eigene Aufnahme hörbar';assert echo>.003,'Echo hörbar'
    b.close()
assert not err,err
print('ok')
