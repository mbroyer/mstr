/* ===== Beat aus Worten: eine Beschreibung (Englisch oder Deutsch) wird zu einem Beat, ganz ohne Server.
   Stichworte für Stil, Stimmung, Tempo, Swing, Dichte, Klänge und Effekte. Der Stil wählt die Vorlage als Grundlage,
   der Rest verändert sie; dazu etwas Zufall, so gibt dieselbe Beschreibung beim nächsten Mal eine Variante.
   WORTE(text, ctx) liefert {pre, bpm, sw, g (sieben Spuren), fx {id:[Stärke, Auswahl]}}.
   Jeder Beat bekommt Effekte: genannte zuerst, sonst die, die zum Stil passen (außer „dry“/„trocken“).
   ctx: n (Namen der Vorlagen), bpm (ihr Tempo), sw (ihr Swing), rows(i) (ihre sieben Spuren), rnd (Zufall 0–1) ===== */
var WORTE=(function(){
  /* Stile in Reihenfolge der Vorlagen-Namen; was im Text zuerst steht, gewinnt */
  var STYLE={
    lofi:'lo-?fi|chill ?hop|hip ?hop|boom ?bap|jazzy|study|lernen|beats to',
    house:'house|deep house|disco|club',
    funk:'funk|funky|groovy|soul',
    rock:'rock|punk|indie|band|garage rock|grunge',
    techno:'techno|rave|warehouse|berlin|industrial|hard ?techno',
    trap:'trap|drill|rap|808s',
    onedrop:'reggae|dub|one ?drop|ska|jamaica',
    pop80:'pop|80s|80er|eighties|beat it|michael jackson|synth ?pop',
    dnb:"drum ?(and|n|'n'|&) ?bass|dnb|d&b|liquid",
    afrobeats:'afro|afrobeat|afrobeats|nigeria|lagos|afropop',
    reggaeton:'reggaeton|dembow|latin|perreo',
    minimal:'minimal techno|minimal|microhouse|tech ?house',
    twostep:'2 ?-?step|two ?-?step|uk garage|ukg|garage',
    jungle:'jungle|breakbeat|breaks|amen',
    electro:'electro|robot|kraftwerk|machine|maschine|roboter',
    amapiano:'amapiano|log drum|south africa|piano'};
  /* Stimmung, wenn kein Stil genannt ist */
  var MOOD=[
    ['dark|duester|finster|night|nacht|evil|horror|creepy|gruselig|underground|keller|cave|hoehle','techno','minimal'],
    ['sad|traurig|melanchol|rain|regen|lonely|einsam|sleep|schlaf|mellow|sunday|sonntag|cozy|gemuetlich|coffee|kaffee','lofi','onedrop'],
    ['happy|froehlich|sunny|sonnig|summer|sommer|beach|strand|holiday|urlaub|bright|hell','afrobeats','house'],
    ['party|dance|tanz|tanzen|dancefloor|feier|wedding|hochzeit','house','amapiano'],
    ['angry|wuetend|aggressive|aggressiv|hard|hart|brutal|heavy|schwer|metal','techno','trap'],
    ['funny|lustig|silly|albern|bouncy|huepf|playful|verspielt','funk','reggaeton'],
    ['epic|episch|stadium|stadion|huge|riesig|big room','rock','pop80'],
    ['heart|heartbeat|herz|herzschlag|pulse|puls|hypnotic|hypnotisch|trance','minimal','techno'],
    ['fast|schnell|frantic|hektisch|energy|energie|running|laufen|workout|sport','dnb','jungle'],
    ['slow|langsam|lazy|faul|relaxed|entspannt|calm|ruhig','lofi','onedrop']];
  /* Klänge: Spur, Zeichen, Muster (null: eigene Regel unten) */
  var SOUND=[
    ['clap|klatsch',2,'c'],['rim|rimshot|sidestick',2,'k'],
    ['cowbell|kuhglocke',4,'..5.....5.....5.'],['shaker|rassel',4,'1.1.1.1.1.1.1.1.'],['conga|bongo|hand ?drum|percussion|perkussion',4,'4..4..4...4.4...'],
    ['tambourine|tamburin',4,'....2.......2...'],['clave|wood|holz',4,'3..3..3...3.3...'],
    ['ride',3,'r.r.r.r.r.r.r.r.'],['crash|becken|cymbal',3,'c...............'],['china',3,'..............h.'],
    ['toms?|fill|wirbel',5,'..........t.p.b.'],
    ['808|sub|bass|wobble',6,null],['snap|finger|schnips',6,'....m.......m...'],['riser|build|aufbau|rising',6,'............z...'],
    ['reverse|rueckwaerts',6,'............s...'],['roll|drumroll',6,'............l...'],
    ['open ?hats?|offene',0,null]];
  /* Spuren für „ohne …“ */
  var ROW=[['hats?|hi-?hats?|hihats?',0],['kicks?|bass ?drum|bassdrum',1],['snares?|claps?',2],['cymbals?|becken|crash|ride',3],['perc|percussion|perkussion|shaker|cowbell',4],['toms?',5],['fx|effects|effekte',6],['drums?',-1]];
  /* Effekte: id, Wörter, Auswahl (Echo und Filter) */
  var FXW=[
    ['room','reverb|hall|room|raum|space|spacious|weit|cathedral|kirche|church|cave|hoehle|dreamy|traeum|ambient|ethereal|atmospher|wide|big room',0],
    ['echo','echo|delay|dub|spacey|weltall|outer space|bouncing',3],
    ['sweep','filter|sweep|underwater|unter ?wasser|muffled|dumpf|gedaempft|wobble|wobbly|breathing filter',2],
    ['pump','pump|pumping|sidechain|side-chain|breath|atmen|atmend|ducking|pumpend',4],
    ['stut','stutter|stotter|glitch|glitchy|chopped|broken|kaputt|stuttering',2],
    ['lofi','vinyl|dust|dusty|staub|old|alt|retro|crackle|knister|tape|kassette|cassette|warm|grain|grainy|lo-?fi|record|schallplatte|platte']];
  /* Effekte, die zum Stil gehören, wenn keine genannt sind: der erste immer, der zweite zur Hälfte */
  var STYLEFX={
    lofi:[['lofi',45,0],['room',30,0]],house:[['pump',40,4],['sweep',35,4]],funk:[['room',25,0],['stut',30,2]],rock:[['room',45,0]],
    techno:[['sweep',45,2],['pump',45,4]],trap:[['room',45,0],['stut',35,4]],onedrop:[['echo',55,3],['room',30,0]],pop80:[['room',60,0],['echo',25,2]],
    dnb:[['room',30,0],['echo',30,2]],afrobeats:[['room',30,0],['echo',25,3]],reggaeton:[['echo',30,2],['room',25,0]],minimal:[['sweep',35,4],['echo',25,3]],
    twostep:[['sweep',35,2],['pump',35,2]],jungle:[['echo',35,2],['stut',35,4]],electro:[['sweep',40,2],['stut',30,2]],amapiano:[['room',35,0],['echo',30,3]]};
  /* Stimmung bringt ihren Effekt mit, wenn er nicht schon dabei ist */
  var MOODFX=[['dark|duester|finster|night|nacht|underground|keller|cave|hoehle','sweep',40,4],['sad|traurig|melanchol|rain|regen|lonely|einsam|sleep|schlaf','room',50,0],
    ['party|dance|tanz|tanzen|dancefloor|feier|club','pump',40,4],['angry|wuetend|aggressive|aggressiv|hard|hart|brutal|heavy','stut',40,2],
    ['happy|froehlich|sunny|sonnig|summer|sommer|beach|strand','echo',25,3],['epic|episch|stadium|stadion|huge|riesig','room',70,0]];
  var DRY='dry|trocken|clean|sauber|no effects|without effects|ohne effekte|keine effekte|pur|pure|raw|roh';
  var MORE='very|super|lots of|lot of|loads of|tons of|heavy|massive|extreme|really|sehr|extrem|viel|voll|krass|ganz viel|mega|so much',
      LESS='a bit|a little|little|slight|slightly|subtle|soft|light|leicht|etwas|wenig|bisschen|dezent|sanft|kaum';

  function norm(t){return ' '+String(t||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9&'\-]+/g,' ')+' ';}
  /* Wortgrenzen; deutsche Endungen (langsamER, düsterE, schnellEN) zählen mit */
  function re(w){return new RegExp('(^|[^a-z0-9])(?:'+w+')(?:e|er|es|en|em|ern|s|n|r)?(?=[^a-z0-9]|$)','g');}
  function find(t,w){var m=re(w).exec(t);return m?m.index+m[1].length:-1;}
  /* Ist das Wort an Stelle i verneint („no hats“, „ohne Kick“, „keine Becken“)? */
  function neg(t,i){return /(^|\s)(no|not|without|ohne|kein|keine|keinen|keiner|less|weniger|zero|minus)\s+(\S+\s+)?$/.test(t.slice(Math.max(0,i-30),i));}
  function amount(t,i){var b=t.slice(Math.max(0,i-26),i);return re(MORE).test(b)?82:re(LESS).test(b)?28:55;}
  function set(row,k,ch){return row.slice(0,k)+ch+row.slice(k+1);}
  function dots(s){return s.replace(/\./g,'0');}

  return function(text,ctx){
    var t=norm(text),rnd=ctx.rnd||Math.random,i,k,best=-1,bi=1e9,id;
    function pick(a){return a[Math.floor(rnd()*a.length)];}
    function idx(n){return ctx.n.indexOf(n);}
    /* Stil: was zuerst im Text steht; „minimal techno“ zählt als Minimal */
    for(id in STYLE){i=find(t,STYLE[id]);if(i>=0&&(i<bi||(i===bi&&id==='minimal'))&&!neg(t,i)){bi=i;best=idx(id);}}
    if(best<0){var mi=1e9;MOOD.forEach(function(m){var j=find(t,m[0]);if(j>=0&&j<mi){mi=j;best=idx(rnd()<.6?m[1]:m[2]);}});}
    /* Tempo als Zahl (nicht „80s“ oder „90er“) */
    var num=/(^|\s)(\d{2,3})\s*(bpm)?(?=\s)/.exec(t.replace(/\b\d{2}(s|er|ies)\b/g,' ')),bpm=null;
    if(num&&+num[2]>=60&&+num[2]<=180)bpm=+num[2];
    if(best<0&&bpm){var d=1e9;ctx.bpm.forEach(function(b,j){var e=Math.abs(b-bpm)+rnd()*6;if(e<d){d=e;best=j;}});}
    if(best<0)best=Math.floor(rnd()*ctx.n.length);
    var g=ctx.rows(best).slice(0,7),sw=ctx.sw[best],base=ctx.bpm[best];

    /* Tempo-Wörter */
    if(!bpm){var f=1;
      if(find(t,'very slow|super slow|sehr langsam|crawling|schleppend')>=0)f=.78;
      else if(find(t,'slow|slower|langsam|lazy|faul|chill|chilled|relaxed|entspannt|laid ?back|calm|ruhig|sleepy|mellow')>=0)f=.88;
      if(find(t,'very fast|super fast|sehr schnell|insane|wahnsinnig')>=0)f=1.22;
      else if(find(t,'fast|faster|schnell|quick|hektisch|frantic|rush|uptempo|up-tempo|energetic|treibend|driving')>=0)f=1.1;
      if(find(t,'half ?time|halftime')>=0)f*=.75;if(find(t,'double ?time')>=0)f*=1.3;
      bpm=Math.round(base*f+(rnd()-.5)*4);}
    bpm=Math.max(60,Math.min(180,bpm));
    /* Swing */
    if(find(t,'swing|swung|shuffle|wonky|drunk|betrunken|lazy|laid ?back|groovy|jazzy|bouncy|dilla|loose|locker')>=0)sw=Math.max(sw,find(t,'very|heavy|sehr|drunk|betrunken|dilla')>=0?.45:.3);
    if(find(t,'straight|gerade|tight|exakt|robotic|mechanical|mechanisch|quantized|stiff|steif')>=0)sw=0;

    /* Dichte */
    var sparse=find(t,'minimal|sparse|empty|leer|simple|reduced|reduziert|sparsam|stripped|bare|nackt|quiet|leise|space|luftig|airy')>=0&&ctx.n[best]!=='minimal'||find(t,'very minimal|super minimal')>=0,
        busy=find(t,'busy|dense|full|voll|wild|crazy|verrueckt|chaotic|chaos|energetic|driving|treibend|lots of drums|complex|komplex|intense|intensiv|frantic|hektisch')>=0;
    if(sparse&&!busy){
      g[0]=g[0].replace(/./g,function(c,j){return j%4===2?c:'0';});if(g[0]===dots('................'))g[0]=dots('..o...o...o...o.');
      g[2]=g[2].replace(/k/g,'0');g[4]=dots('................');g[5]=dots('................');g[6]=dots('................');
      g[1]=g[1].replace(/./g,function(c,j){return j%4===0||j===0?c:'0';});if(g[1].charAt(0)==='0')g[1]=set(g[1],0,'b');}
    if(busy){
      for(k=0;k<16;k++)if(g[0].charAt(k)==='0'&&(k%2===0||rnd()<.5))g[0]=set(g[0],k,k%2?'k':'x');
      [7,10,15].forEach(function(s){if(g[2].charAt(s)==='0'&&rnd()<.6)g[2]=set(g[2],s,'k');});
      [3,10,14].forEach(function(s){if(g[1].charAt(s)==='0'&&rnd()<.4)g[1]=set(g[1],s,'b');});
      if(g[4]===dots('................'))g[4]=dots(pick(['1.1.1.1.1.1.1.1.','4..4..4...4.4...','..1...1...1...1.']));
      if(g[5]===dots('................'))g[5]=dots('............tpb.');}

    /* Etwas Zufall, damit jede Beschreibung leicht anders klingt: ein paar Hats tauschen, mal eine Ghost-Note */
    for(k=0;k<16;k++){var c=g[0].charAt(k);if(c==='x'&&k%4===3&&rnd()<.2)g[0]=set(g[0],k,'k');}
    if(!sparse&&rnd()<.5){var gs=pick([3,7,11,14,15]);if(g[2].charAt(gs)==='0')g[2]=set(g[2],gs,'k');}
    if(!sparse&&rnd()<.3){var ks=pick([6,10,11,14]);if(g[1].charAt(ks)==='0')g[1]=set(g[1],ks,'b');}

    /* Klänge, die genannt werden; „ohne …“ leert die Spur */
    SOUND.forEach(function(s){i=find(t,s[0]);if(i<0||neg(t,i))return;var r=s[1];
      if(s[0]==='808|sub|bass|wobble'){if(find(t.replace(/drum ?(and|n|'n'|&) ?bass|bass ?drum|bassdrum/g,' '),s[0])<0)return;
        var o='';for(k=0;k<16;k++)o+=g[1].charAt(k)!=='0'&&(k%8===0||rnd()<.35)?'n':g[6].charAt(k);g[6]=o;return;}
      if(s[0]==='open ?hats?|offene'){for(k=2;k<16;k+=4)g[0]=set(g[0],k,'o');return;}
      if(r===2){g[2]=g[2].replace(/p/g,s[2]);if(g[2].indexOf(s[2])<0){g[2]=set(g[2],4,s[2]);g[2]=set(g[2],12,s[2]);}return;}
      var p=dots(s[2]),o2='';for(k=0;k<16;k++)o2+=p.charAt(k)!=='0'?p.charAt(k):g[r].charAt(k);g[r]=o2;});
    ROW.forEach(function(w){var j,rg=re(w[0]),m;while((m=rg.exec(t))){j=m.index+m[1].length;if(neg(t,j)){
      if(w[1]<0){g[0]=g[1]=g[2]=g[3]=g[4]=g[5]=dots('................');}else g[w[1]]=dots('................');}}});

    /* Effekte: alles aus, außer was gesagt wird; Lo-Fi und Dub bringen ihr Vinyl und Echo mit */
    var fx={};
    FXW.forEach(function(f){i=find(t,f[1]);if(i>=0&&!neg(t,i))fx[f[0]]=[amount(t,i),f[2]];});
    if(ctx.n[best]==='lofi'&&!fx.lofi&&find(t,'vinyl|staub|dust')<0&&!/(no|without|ohne|kein)\s+(vinyl|crackle|knistern)/.test(t))fx.lofi=[45,0];
    if(find(t,'dub')>=0&&!fx.echo)fx.echo=[60,3];
    if(find(t,'dreamy|traeum|ambient|ethereal|floating|schweben')>=0&&!fx.echo)fx.echo=[35,3];
    /* Nichts genannt: der Stil bringt seine Effekte mit, die Stimmung legt einen dazu; „dry“ lässt alles aus */
    if(find(t,DRY)<0){
      if(!Object.keys(fx).length){var sf=STYLEFX[ctx.n[best]]||[['room',30,0]];fx[sf[0][0]]=[sf[0][1],sf[0][2]];if(sf[1]&&rnd()<.5)fx[sf[1][0]]=[sf[1][1],sf[1][2]];}
      MOODFX.forEach(function(m){if(!fx[m[1]]&&Object.keys(fx).length<3&&find(t,m[0])>=0&&!neg(t,find(t,m[0])))fx[m[1]]=[m[2],m[3]];});}
    return {pre:best,bpm:bpm,sw:Math.max(0,Math.min(.6,sw)),g:g,fx:fx};
  };
})();
