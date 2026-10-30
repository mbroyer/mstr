# Drop: je Beat-Art (dunkel unter 100 BPM, Hochpass, schnell ab 150) ohne Fehler, nicht übersteuert, danach klingt der Beat wieder voll
import os
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
err=[]
TAP="""(()=>{const c=AudioNode.prototype.connect;AudioNode.prototype.connect=function(d,...a){if(d instanceof AudioDestinationNode&&!(this instanceof AudioBufferSourceNode)&&!window.__an){const an=this.context.createAnalyser();an.fftSize=2048;c.call(this,an);window.__an=an;}return c.call(this,d,...a);};
window.__rms=(ms)=>new Promise(r=>{let s=0,n=0,pk=0;const b=new Float32Array(2048),iv=setInterval(()=>{window.__an.getFloatTimeDomainData(b);for(const x of b){s+=x*x;n++;pk=Math.max(pk,Math.abs(x));}},20);setTimeout(()=>{clearInterval(iv);r([Math.sqrt(s/n),pk]);},ms||1500);});})()"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844});pg.add_init_script(TAP)
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto('file://'+H+'/index.html');pg.wait_for_timeout(300)
    for name in ['Lo-Fi','House','Drum\'n\'Bass']:
        pg.click('#preBtn');pg.click('.pitem:has-text("%s")'%name);pg.wait_for_timeout(1200)
        base=pg.evaluate('__rms()')
        bar=60/pg.evaluate('MSTR.state()')['bpm']*4
        pg.click('#drop')
        pg.wait_for_function('document.querySelector(".app.building")',timeout=8000)
        pg.wait_for_function('!document.querySelector(".app.building")',timeout=8000)
        pg.wait_for_timeout(int(bar*1000))
        after=pg.evaluate('__rms()')
        print(name,base,after)
        assert after[1]<1.0 and after[0]>.6*base[0],(name,base,after)
    b.close()
assert not err,err
print('t6 ok')
