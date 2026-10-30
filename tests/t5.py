# Effekte: Blatt öffnen, jeden Effekt schalten, Zustand bleibt nach Neuladen, Pegel mit Effekt in vernünftigem Rahmen
import os,json
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
# Abgriff: der Knoten, der ins AudioDestinationNode geht, bekommt einen Analyser daneben
TAP="""(()=>{const c=AudioNode.prototype.connect;AudioNode.prototype.connect=function(d,...a){if(d instanceof AudioDestinationNode&&!(this instanceof AudioBufferSourceNode)&&!window.__an){const an=this.context.createAnalyser();an.fftSize=2048;c.call(this,an);window.__an=an;}return c.call(this,d,...a);};
window.__rms=()=>new Promise(r=>{let s=0,n=0,pk=0;const b=new Float32Array(2048),iv=setInterval(()=>{window.__an.getFloatTimeDomainData(b);for(const x of b){s+=x*x;n++;pk=Math.max(pk,Math.abs(x));}},20);setTimeout(()=>{clearInterval(iv);r([Math.sqrt(s/n),pk]);},2000);});})()"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script(TAP)
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    assert pg.locator('#fxBtn').is_visible()
    # Transport passt in 390 px
    bx=pg.locator('#tempoBtn').bounding_box();assert bx['x']+bx['width']<=390,bx
    pg.click('#play');pg.wait_for_timeout(600)
    base=pg.evaluate('__rms()')
    pg.click('#fxBtn');pg.wait_for_timeout(300)
    assert pg.locator('.fxi').count()==4
    lv={}
    for i,id in enumerate(['room','echo','sweep','lofi']):
        it=pg.locator('.fxi').nth(i);it.click();pg.wait_for_timeout(300)
        assert it.get_attribute('aria-pressed')=='true'
        lv[id]=pg.evaluate('__rms()')
        it.click();pg.wait_for_timeout(200)
        assert pg.evaluate('MSTR.state()')['fx'][id] is False
    print('rms/peak ohne',base,'mit',lv)
    for id,(r,pk) in lv.items():
        assert pk<1.0,(id,pk)
        assert .4*base[0]<r<2.2*base[0],(id,r,base)
    # zwei an, Neuladen: bleiben an, Knopf zeigt die Zahl
    pg.locator('.fxi').nth(0).click();pg.locator('.fxi').nth(3).click()
    assert pg.locator('#fxBtn.on').count()==1 and pg.inner_text('#fxN').strip()=='2'
    pg.screenshot(path=os.environ.get('SHOT','/tmp/fx.png'))
    pg.reload();pg.wait_for_timeout(300)
    fx=pg.evaluate('MSTR.state()')['fx'];assert fx=={'room':True,'echo':False,'sweep':False,'lofi':True},fx
    assert pg.inner_text('#fxN').strip()=='2'
    b.close()
assert not err,err
print('t5 ok')
