# WAV-Loop zum Samplen: Teilen-Knopf unten in der Leiste, Download, Länge genau 4 Takte, Ton ab der ersten Probe,
# nahtlos (Echo des letzten Takts liegt schon am Anfang), eigene Aufnahme drin, Wiedergabe ungestört, Dateiname mit Name und Tempo
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
buf=io.BytesIO();w=wave.open(buf,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(44100)
w.writeframes(b''.join(struct.pack('<h',int(20000*math.sin(i/44100*2*math.pi*600)*(1-i/8820))) for i in range(8820)));w.close()
REC=base64.b64encode(buf.getvalue()).decode()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    for vw in (360,390):
        pg=b.new_page(viewport={'width':vw,'height':800});pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
        assert pg.evaluate('document.documentElement.scrollWidth')<=vw,vw
        assert pg.locator('#share').count()==0;pg.click('#vCard');pg.wait_for_timeout(100)
        r=pg.locator('#shWav').bounding_box();assert r['x']+r['width']<=vw and pg.locator('#shCardBtn').is_visible() and pg.locator('#shSend').is_visible()
        pg.close()
    ctx=b.new_context(viewport={'width':390,'height':844},accept_downloads=True);pg=ctx.new_page();pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#tempoBtn').click()");pg.wait_for_timeout(200)
    pg.fill('#tBpm','120');pg.dispatch_event('#tBpm','change');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#play');pg.wait_for_timeout(300)
    pg.click('#preName');pg.wait_for_timeout(200);pg.fill('#shName','Café Loop');pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    pg.click('#vCard');pg.wait_for_timeout(200)
    with pg.expect_download(timeout=15000) as d:pg.click('#shWav')
    dl=d.value;print(dl.suggested_filename);assert dl.suggested_filename=='Cafe-Loop-120bpm.wav'
    assert pg.evaluate('MSTR.state().playing'),'Wiedergabe läuft weiter'
    pg.wait_for_timeout(200);assert 'Saved Cafe-Loop-120bpm.wav' in pg.inner_text('#shCardT')
    ch,sr,n,smp=wav(dl.path())
    print('kanäle',ch,'rate',sr,'sekunden',round(n/sr,4))
    assert ch==2 and n==round(8*sr),'genau 4 Takte bei 120 BPM = 8 s'
    r=rms(smp[::5]);peak=max(abs(x) for x in smp)/32768;print('rms',round(r,3),'peak',round(peak,3));assert r>.02 and peak<1
    on=next(i for i,x in enumerate(smp) if abs(x)>3000)//ch;print('erster Ton bei ms',round(on/sr*1000,2));assert on/sr<.012
    # Echo an, nur die Spur Mic mit einem Schlag auf der 4 im letzten Viertel: das Echo davon muss am Anfang der Datei klingen
    pg.evaluate('MSTR.setPlay(false)')
    pg.evaluate("localStorage.setItem('mstr-rec-mic','%s')"%REC)
    pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('mstr-v1'));s.pat.g=s.pat.g.map((x,i)=>i==7?'0'.repeat(14)+'a0':'0'.repeat(16));s.fx={echo:1};s.fxo={echo:4};localStorage.setItem('mstr-v1',JSON.stringify(s));})()")
    pg.reload();pg.wait_for_timeout(300)
    with pg.expect_download(timeout=15000) as d:pg.click('#shWav')
    pg.wait_for_timeout(200);assert 'with your recording' in pg.inner_text('#shCardT')
    ch,sr,n,smp=wav(d.value.path())
    six=60/120/4;first=rms(smp[:int(sr*.15)*ch]);last=rms(smp[int(14*six*sr)*ch:int((14*six+.15)*sr)*ch]);quiet=rms(smp[int(sr*1.0)*ch:int(sr*1.2)*ch])
    print('Echo am Anfang',round(first,4),'Mic-Schlag',round(last,4))
    assert last>.05,'eigene Aufnahme hörbar';assert first>.01,'Echo des letzten Takts liegt am Anfang (nahtlos)'
    b.close()
assert not err,err
print('ok')
