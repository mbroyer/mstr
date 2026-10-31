# Beat aus Worten: Sprechblase öffnet das Feld, Abschicken macht einen Beat (Stil, Tempo, Swing, Klänge, ohne …, Effekte),
# Spur Aufnahme bleibt, Name wird erzeugt (nie der getippte Text), jeder Beat hat Effekte (außer „dry“), Rückgängig, Stand bleibt nach Neuladen
import os,json
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url='file://'+H+'/index.html'
err=[]
Z='0'*16
with sync_playwright() as p:
    b=p.chromium.launch(**({'executable_path':os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}))
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.goto(url);pg.evaluate("MSTR.welcome(false);MSTR.view(false)");pg.wait_for_timeout(300)
    pg.evaluate("localStorage.setItem('mstr-v1',JSON.stringify({seen:1,view:'grid',pat:{v:5,g:Array(8).fill('0'.repeat(16)).map((x,i)=>i==7?'a'+'0'.repeat(15):x),bpm:100,sw:0,pre:-1}}))")
    pg.reload();pg.wait_for_timeout(300)
    assert pg.locator('#sayBtn').count()==0 and pg.locator('#preBtn').is_visible(),'Beschreiben wohnt in der Beat-Liste'
    assert pg.evaluate('document.documentElement.scrollWidth')<=390,'waagerechtes Scrollen'
    def say(t):
        pg.evaluate('MSTR.say('+json.dumps(t)+')');return pg.evaluate('MSTR.state()')
    # Stil und Tempo-Wörter
    s=say('dusty slow hip hop with vinyl');assert pg.inner_text('#sub')=='based on Lo-Fi' and s['bpm']<82 and s['fx']['lofi'],s
    nm=pg.inner_text('#preName');assert nm and nm.lower()!='dusty slow hip hop with vinyl' and not pg.evaluate("document.querySelector('#preName').classList.contains('fixed')"),nm
    assert s['pat'][7]=='a'+'0'*15,'Spur Aufnahme bleibt'
    s=say('dark fast techno, lots of echo');assert pg.inner_text('#sub')=='based on Techno' and s['bpm']>138 and s['fx']['echo'] and s['fxa']['echo']>=80,s
    assert not s['fx']['lofi'],'Effekte, die nicht genannt sind, gehen aus'
    # Ohne Effekt-Wörter bringt der Stil seine mit; „dry“ lässt alle aus
    for txt in ['reggae','techno','asdf qwer','happy summer beat','slow hip hop']:
        s=say(txt);assert any(s['fx'].values()),(txt,s['fx'])
    s=say('reggae');assert s['fx']['echo'],s['fx']
    s=say('dry techno');assert not any(s['fx'].values()),s['fx']
    # Deutsch mit Endungen, Zahl als Tempo, „80s“ ist kein Tempo
    s=say('schneller treibender Techno mit Stottern');assert pg.inner_text('#sub')=='based on Techno' and s['bpm']>138 and s['fx']['stut'],s
    s=say('something at 90 bpm');assert s['bpm']==90
    s=say('80s pop');assert pg.inner_text('#sub')=='based on Beat It' and s['bpm']!=80
    # Stimmungs-Wörter (die Chips der Vibe-Seite) landen stabil bei passenden Vorlagen, nie beim Zufall
    CH={'calm':['Lo-Fi','One Drop','Funk','Reggaeton'],'dark':['Techno','Trap','Minimal',"Drum'n'Bass",'Electro'],'happy':['Afrobeats','Funk','House','Reggaeton','Beat It'],
        'sad':['Lo-Fi','One Drop','Trap','2-Step'],'party':['House','Funk','Amapiano','Reggaeton','Beat It','Afrobeats'],'angry':['Rock','Techno','Trap','Jungle'],
        'dreamy':['Lo-Fi','One Drop'],'epic':['Rock','Beat It',"Drum'n'Bass",'Trap'],'playful':['Funk','Reggaeton','Afrobeats','Beat It'],'slow':['Lo-Fi','One Drop','Funk','Reggaeton'],
        'fast':["Drum'n'Bass",'Jungle','2-Step','Techno','Beat It'],'dusty':['Lo-Fi','Funk'],'warm':['Lo-Fi','Funk'],'spacey':['Minimal','Electro','2-Step',"Drum'n'Bass",'Techno'],'dub':['One Drop'],
        'glitchy':['Electro','Jungle','2-Step'],'nervous':['Minimal','Electro','Jungle','2-Step'],'romantic':['Lo-Fi','One Drop','Reggaeton','2-Step'],'festival':['House','Afrobeats','Amapiano','Reggaeton'],
        'focus':['Lo-Fi','Minimal','House'],'tired':['Lo-Fi','One Drop'],'late night drive':['Techno','Electro','House','Minimal','Trap',"Drum'n'Bass",'Beat It'],
        # Stil-Reihe: jedes Wort trifft genau seinen Stil
        'funk':['Funk'],'hip hop':['Lo-Fi'],'house':['House'],'reggae':['One Drop'],'rock':['Rock'],'80s':['Beat It'],'afro':['Afrobeats'],'latin':['Reggaeton'],
        'trap':['Trap'],'garage':['2-Step'],'jungle':['Jungle'],'techno':['Techno']}
    # (derselbe Satz mehrmals hintereinander ist ein neuer Take: dann kommen auch die übrigen Stile der genannten Stimmungen in Frage)
    for w,ok in CH.items():
        for i in range(4):
            s=say(w);bs=pg.inner_text('#sub').replace('based on ','');assert bs in ok,(w,bs,ok)
    s=say('dreamy');assert s['bpm']<80,s['bpm']
    # Breite: 60 zufällige Vibes aus Stimmung und Energie verteilen sich auf viele Stile, Techno ist nicht vorn
    import random,collections;random.seed(3);C=collections.Counter();WS=list(CH)[:22]
    for i in range(60):say(' · '.join(random.sample(WS,2)));C[pg.inner_text('#sub')]+=1
    print('stile',C.most_common(5));assert len(C)>=8 and C.most_common(1)[0][1]<=20 and C['based on Techno']<=8
    # Another take: derselbe Vibe gibt deutlich andere Muster (im Schnitt mindestens 12 von 112 Schritten) und mehr als eine Vorlage
    ds=[];bases=set();prev=say('sad · dreamy · minimal')
    for i in range(8):
        s=say('sad · dreamy · minimal');ds.append(sum(a!=c for r1,r2 in zip(prev['pat'][:7],s['pat'][:7]) for a,c in zip(r1,r2)));bases.add(pg.inner_text('#sub'));prev=s
    print('takes',ds,bases);assert sum(ds)/len(ds)>=12 and len(bases)>=2
    # Klänge und ohne …
    s=say('happy summer beat with cowbell');assert '5' in s['pat'][4],s['pat']
    s=say('drum and bass without hats');assert pg.inner_text('#sub')=="based on Drum'n'Bass" and s['pat'][0]==Z and 'n' not in s['pat'][6],s['pat']
    for i in range(6):
        s=say('subtle house groove, no kick');assert s['pat'][1]==Z and 'n' not in s['pat'][6],s['pat']
    s=say('Langsamer Beat ohne Becken, mit Clap und viel Hall');assert s['pat'][3]==Z and 'c' in s['pat'][2] and s['fx']['room'] and s['fxa']['room']>=80,s
    s=say('loose swung funk');assert s['sw']>=.3
    s=say('straight robotic electro');assert s['sw']==0 and pg.inner_text('#sub')=='based on Electro'
    # Unsinn gibt trotzdem einen Beat
    s=say('asdf qwer');assert any(r!=Z for r in s['pat'][:7])
    # Über die Oberfläche: Beat-Liste, Feld oben, Text, Enter. Läuft danach, Rückgängig stellt den vorherigen Beat her
    before=pg.evaluate('MSTR.state()')
    pg.evaluate('MSTR.setPlay(false)')
    pg.click('#preBtn');pg.wait_for_timeout(300)
    assert pg.locator('#sayIn').is_visible() and pg.locator('.pitem').count()==17;pg.click('#sayIn')
    assert pg.get_attribute('#sayIn','placeholder')
    pg.fill('#sayIn','reggae with lots of dub echo');pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    assert pg.locator('#sheet').is_hidden()
    s=pg.evaluate('MSTR.state()');assert s['playing'] and pg.inner_text('#sub')=='based on One Drop' and s['fx']['echo'],s
    assert pg.locator('.toast').count()==0,'kein „New beat / Undo“ mehr'
    # Leeres Feld nimmt das Beispiel; der Pfeil schickt ab; die letzte Beschreibung steht beim nächsten Mal drin
    pg.click('#preBtn');pg.wait_for_timeout(300);pg.fill('#sayIn','');ph=pg.get_attribute('#sayIn','placeholder');p0=pg.evaluate('MSTR.state()')['pat']
    pg.click('#sayGo');pg.wait_for_timeout(300)
    assert pg.inner_text('#preName').lower()!=ph.lower() and pg.inner_text('#preName') and pg.evaluate('MSTR.state()')['pat']!=p0,'Beispiel wird abgeschickt, Name kommt aus dem Beat'
    pg.click('#preBtn');pg.wait_for_timeout(300);pg.fill('#sayIn','minimal techno with ride');pg.click('#sayGo');pg.wait_for_timeout(300)
    s=pg.evaluate('MSTR.state()');pg.evaluate('MSTR.setPlay(false)')
    pg.reload();pg.wait_for_timeout(300)
    nm=pg.inner_text('#preName');assert nm and nm!='Minimal techno with ride' and pg.evaluate('MSTR.state()')['pat']==s['pat']
    pg.click('#preBtn');pg.wait_for_timeout(300);assert pg.input_value('#sayIn')=='minimal techno with ride'
    pg.keyboard.press('Escape')
    assert not err,err
    b.close()
print('ok')
