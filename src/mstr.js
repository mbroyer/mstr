/* ===== MSTR: Raster, Transport, Vorlagen, Spur-Einstellungen ===== */
(function(){
  /* Vorschläge zum Würfeln für Becken, Perc, Toms, FX und die eigene Aufnahme (16 Schritte) */
  var COMMON={cym:['c...............','r.r.r.r.r.r.r.r.','..r...r...r...r.'],click:['1.1.1.1.1.1.1.1.','....2.......2...','3..3..3...3.3...'],toms:['b...p...b...p...','b.......t.t.....','b..b....p...tt..'],fx:['....m.......m...','n.....n...n.....','............z...'],mic:['....a.......a...','a.......a.a.....','..a...a...a.h.t.']};
  var NM={lofi:'Lo-Fi',house:'House',funk:'Funk',rock:'Rock',techno:'Techno',trap:'Trap',onedrop:'One Drop',pop80:'Beat It',dnb:"Drum'n'Bass",afrobeats:'Afrobeats',reggaeton:'Reggaeton',minimal:'Minimal',twostep:'2-Step',jungle:'Jungle',electro:'Electro',amapiano:'Amapiano'};
  /* Je Vorlage eigene Muster für Becken, Perc, Toms und FX. Becken: c Crash, r Ride, h China. Perc: 1 Shaker, 2 Tamburin, 3 Clave, 4 Conga, 5 Cowbell.
     FX: m Snap, n Sub, s Reverse, l Wirbel, z Riser. Riser und Reverse dauern vier Schritte, auf Schritt 13 laufen sie genau in die nächste Eins */
  var EXTRA={
    lofi:['................','..1...1...1...1.','................','..............n.'],
    house:['r.r.r.r.r.r.r.r.','1.11.11.1.11.11.','................','............z...'],
    funk:['c...............','....2..4....2.4.','......t.......p.','....m.......m...'],
    rock:['c...............','....2.......2...','..........t.t...','............s...'],
    techno:['..r...r...r...r.','1.1.1.1.1.1.1.1.','............tt..','............z...'],
    trap:['c...............','..........3.....','......t.......tt','n.....n...n.....'],
    onedrop:['................','..3...3...3...3.','.............ttp','................'],
    pop80:['c...............','....2.......2...','................','............l...'],
    dnb:['c...............','1.1.1.1.1.1.1.1.','..........p...tt','............z...'],
    afrobeats:['................','4..4..4...4.4...','................','....m.......m...'],
    reggaeton:['c...............','..2...2...2...2.','................','............z...'],
    minimal:['..............h.','......3.......3.','..............t.','............s...'],
    twostep:['................','1.1.1.1.1.1.1.1.','................','............s...'],
    jungle:['c...............','................','..............tp','n.........n.....'],
    electro:['................','..5.....5.....5.','................','............z...'],
    amapiano:['................','1111111111111111','......b..b....b.','................']};

  /* Spur-Icons: feine Linien, 24er Raster */
  var ICON={
    hats:'<path d="M4 8.5h16M6 11h12M12 4v16M9 20h6"/>',
    beat:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2" class="f"/>',
    snare:'<rect x="4" y="8.5" width="16" height="7" rx="1.5"/><path d="M8 8.5l-1.5 7M12.75 8.5l-1.5 7M17.5 8.5l-1.5 7"/>',
    click:'<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="4.5" r="1.3" class="f"/><circle cx="19.5" cy="12" r="1.3" class="f"/><circle cx="12" cy="19.5" r="1.3" class="f"/><circle cx="4.5" cy="12" r="1.3" class="f"/>',
    toms:'<circle cx="4.8" cy="14" r="2.3"/><circle cx="10.8" cy="13" r="3.2"/><circle cx="18.2" cy="12" r="4.2"/>',
    fx:'<path d="M3 12c2.2-6 4.3-6 6 0s3.8 6 6 0 3.8-6 6 0"/>',
    cym:'<path d="M3.5 10.5c3-2.4 14-2.4 17 0"/><path d="M12 8.6V20M8.5 20h7"/><circle cx="12" cy="7.4" r="1" class="f"/>',
    mic:'<rect x="9" y="3.5" width="6" height="10.5" rx="3"/><path d="M6.2 11.2a5.8 5.8 0 0 0 11.6 0M12 17v3.5M9 20.5h6"/>'};
  var MIC=trIx('mic');
  /* Start-Vorlage für den ersten Besuch: Amapiano */
  var START=Math.max(0,BEATS.map(function(b){return b.n;}).indexOf('amapiano'));
  var pat,vol=[],mute=[],solo=[],pre=0,edited=false,title='',brush=TRACKS.map(function(t){return t.s[0][0];}),pk=[],lastDice=[];
  var cells=[],rows=[],playing=false,step=0,bar=0,nextT=0,timer=0,queue=[],raf=0,shown=-1,drop=0;
  var $=function(id){return document.getElementById(id);};
  var app=$('app'),tracksEl=$('tracks'),playB=$('play'),dropB=$('drop'),sheet=$('sheet');
  var beats=document.querySelectorAll('.beatrow .grp span:first-child');

  function zero(){return new Array(N+1).join('0');}
  function empty(){var a=[],r;for(r=0;r<R;r++)a.push(zero());return a;}
  function dots(s){return s.split('').map(function(ch){return ch==='.'?'0':ch;}).join('');}
  function clean(g){
    if(!Array.isArray(g)||g.length!==R)return null;
    return g.map(function(x,r){if(typeof x!=='string'||x.length!==N)return zero();
      return x.split('').map(function(ch){return sndIx(r,ch)>=0?ch:'0';}).join('');});
  }
  function rowFromBeat(Bt,id){
    var o='',k;
    for(k=0;k<N;k++){var K=Bt.K.charAt(k),Sn=Bt.S.charAt(k),H=Bt.H.charAt(k);
      o+=id==='beat'?(K==='x'?'b':'0'):id==='snare'?(Sn==='x'?'p':Sn==='o'?'k':Sn==='c'?'c':'0'):(H==='x'?'x':H==='O'?'o':H==='o'?'k':'0');}
    return o;
  }
  /* Für die Umrechnung alter Stände: Crashes (c) aus der Toms-Zeile in die Becken-Zeile */
  function onlyC(x){return x.replace(/[^c]/g,'0');}
  function noC(x){return x.replace(/c/g,'0');}
  /* Die Spur Aufnahme gehört dir: eine Vorlage lässt sie, wie sie ist */
  function fromBeat(i){var Bt=BEATS[i],X=EXTRA[Bt.n],r;for(r=0;r<3;r++)pat[r]=rowFromBeat(Bt,TRACKS[r].id);
    for(r=3;r<R;r++)if(r!==MIC)pat[r]=dots(X?X[r-3]:COMMON[TRACKS[r].id][0]);bpm=Bt.bpm;sw=Bt.sw;pre=i;edited=false;title='';}
  function num(x,lo,hi,d){x=+x;return isFinite(x)?Math.max(lo,Math.min(hi,x)):d;}
  function arr(a,f,d){var o=[],r;for(r=0;r<R;r++)o.push(Array.isArray(a)&&a.length===R?f(a[r]):d);return o;}

  var P=S.pat,col='f'; /* Farbe des Orbits je Beat: Schlüssel aus CARD.HUES (f Flieder, m Mint, k Koralle, b Bernstein, e Eisblau) */
  /* Alter Stand (vor v2): Spuren hats, beat, clap, snare, click, toms, fx. Die Clap wandert in die Snare,
     die Becken aus der Toms-Spur in die neue Becken-Spur an Stelle 3 */
  if(P&&!P.v&&Array.isArray(P.g)&&P.g.length===7){
    var g=P.g.map(function(x){return typeof x==='string'&&x.length===N?x:zero();}),sn='',k;
    for(k=0;k<N;k++)sn+=g[3].charAt(k)!=='0'?g[3].charAt(k):g[2].charAt(k)==='c'?'c':'0';
    var mv=function(a,d){return Array.isArray(a)&&a.length===7?[a[0],a[1],a[3],d,a[4],a[5],a[6]]:a;};
    P.g=[g[0],g[1],sn,onlyC(g[5]),g[4],noC(g[5]),g[6]];P.vol=mv(P.vol,.8);P.mute=mv(P.mute,false);P.solo=mv(P.solo,false);P.br=mv(P.br,'c');P.v=2;
  }
  /* Stand v2: sieben Spuren, die Spur Aufnahme kommt leer dazu */
  if(P&&P.v===2&&Array.isArray(P.g)&&P.g.length===7){
    var add=function(a,d){if(Array.isArray(a)&&a.length===7)a.push(d);};
    add(P.g,zero());add(P.vol,.8);add(P.mute,false);add(P.solo,false);add(P.br,'a');P.v=3;
  }
  /* Stand v3: Boom Bap, Disco, Afro und Hardtechno sind ersetzt (durch Lo-Fi, One Drop, Reggaeton, 2-Step).
     Wer eine davon geladen hatte, behält das Muster, es heißt dann Eigener Beat */
  if(P&&P.v===3){if([0,6,10,12].indexOf(P.pre)>=0)P.pre=-1;P.v=4;}
  /* Stand v4: Bossa ist durch Beat It ersetzt, Shuffle durch Afrobeats */
  if(P&&P.v===4){if(P.pre===7||P.pre===9)P.pre=-1;P.v=5;}
  if(P&&clean(P.g)){pat=clean(P.g);bpm=Math.round(num(P.bpm,60,180,100));sw=num(P.sw,0,.6,0);pre=P.pre|0;if(pre<-1||pre>=BEATS.length)pre=-1;edited=!!P.ed;title=typeof P.nm==='string'?P.nm.slice(0,40):'';if(P.col&&CARD.HUES[P.col])col=P.col;}
  else{pat=empty();fromBeat(START);}
  vol=arr(P&&P.vol,function(x){return num(x,0,1,.8);},.8);
  mute=arr(P&&P.mute,function(x){return !!x;},false);
  solo=arr(P&&P.solo,function(x){return !!x;},false);
  if(P&&Array.isArray(P.br)&&P.br.length===R)brush=brush.map(function(d,r){return sndIx(r,P.br[r])>=0?P.br[r]:d;});
  function persist(){S.pat={v:5,g:pat,bpm:bpm,sw:sw,vol:vol,mute:mute,solo:solo,pre:pre,ed:edited,br:brush,nm:title,col:col};save();}
  function anySolo(){return solo.some(Boolean);}
  /* ARR: beim Rechnen der Karte entscheidet das Arrangement je Takt mit, welche Spur klingt */
  var ARR=null,playT0=0;
  function audible(r){if(ARR&&r<MIC&&!ARR(r))return false;return anySolo()?solo[r]:!mute[r];}
  function gainOf(r){return Math.pow(vol[r]/.8,1.6);} /* 80 % entspricht dem Originalpegel */

  /* ---------- Raster ---------- */
  function build(){
    tracksEl.innerHTML='';cells=[];rows=[];
    TRACKS.forEach(function(T,r){
      var row=document.createElement('div');row.className='trk'+(r===MIC?' own':'');
      var tl=document.createElement('div');tl.className='tl';
      var ic=document.createElement('span');ic.className='ic';ic.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICON[T.id]||'')+'</svg>';tl.appendChild(ic);
      var tn=document.createElement('button');tn.type='button';tn.className='tn';tn.setAttribute('aria-haspopup','dialog');
      tn.innerHTML='<span class="nm">'+T.n+'</span><span class="tb"></span><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      tn.setAttribute('aria-label',T.n+': Einstellungen');
      tn.addEventListener('click',function(){trackSheet(r);});
      tl.appendChild(tn);
      row.appendChild(tl);
      var steps=document.createElement('div');steps.className='steps';cells.push([]);
      for(var g=0;g<4;g++){var grp=document.createElement('div');grp.className='grp';
        for(var c=0;c<4;c++)(function(s){
          var b=document.createElement('button');b.type='button';b.className='dot';b.setAttribute('aria-label',T.n+', step '+(s+1));
          b.addEventListener('click',function(){
            if(held===b){held=null;return;} /* nach langem Drücken kein Umschalten */
            if(r===MIC&&!REC.mic){trackSheet(r);return;} /* ohne Aufnahme gibt es nichts zu setzen: erst aufnehmen */
            var a=pat[r].split(''),on=a[s]!=='0';a[s]=on?'0':brush[r];pat[r]=a.join('');
            if(!on&&!playing)now(T.id,brush[r],gainOf(r));changed();
          });
          hold(b,r,s);grp.appendChild(b);cells[r][s]=b;
        })(g*4+c);
        steps.appendChild(grp);}
      row.appendChild(steps);tracksEl.appendChild(row);rows.push(row);
    });
    paint();
  }
  /* ---------- Variation je Schritt: lange drücken (oder Rechtsklick) öffnet über dem Punkt die Klänge der Spur ---------- */
  var held=null,vp=null;
  function hold(b,r,s){
    if(TRACKS[r].s.length<2)return; /* Kick: nur ein Klang, langes Drücken schaltet wie Antippen */
    var tm=0,x0=0,y0=0;
    function stop(){clearTimeout(tm);tm=0;}
    b.addEventListener('pointerdown',function(e){
      if(e.button>0)return;stop();held=null;x0=e.clientX;y0=e.clientY;
      tm=setTimeout(function(){tm=0;held=b;if(navigator.vibrate)try{navigator.vibrate(8);}catch(x){}varPick(b,r,s);},420);});
    b.addEventListener('pointermove',function(e){if(tm&&Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0)>10)stop();});
    ['pointerup','pointercancel','pointerleave'].forEach(function(n){b.addEventListener(n,stop);});
    b.addEventListener('contextmenu',function(e){e.preventDefault();if(!vp||vp._b!==b)varPick(b,r,s);});
  }
  function varClose(){if(!vp)return;var b=vp._b;vp.remove();vp=null;document.removeEventListener('pointerdown',varOut,true);window.removeEventListener('scroll',varClose,true);window.removeEventListener('resize',varClose);
    if(b)b.classList.remove('vsel');}
  function varOut(e){if(vp&&!vp.contains(e.target)&&e.target!==vp._b)varClose();}
  function varPick(b,r,s){
    varClose();
    if(r===MIC&&!REC.mic){held=null;trackSheet(r);return;}
    var T=TRACKS[r],w=pat[r].charAt(s);
    vp=document.createElement('div');vp.className='vpick';vp.setAttribute('role','menu');vp.setAttribute('aria-label',T.n+', step '+(s+1));vp._b=b;
    T.s.forEach(function(sd,k){var o=document.createElement('button');o.type='button';o.className='opt';o.setAttribute('role','menuitemradio');
      o.setAttribute('aria-checked',w===sd[0]?'true':'false');o.setAttribute('aria-pressed',w===sd[0]?'true':'false');
      o.innerHTML='<i>'+(k+1)+'</i>'+sd[1];
      o.addEventListener('click',function(){var a=pat[r].split('');a[s]=sd[0];pat[r]=a.join('');if(!playing)now(T.id,sd[0],gainOf(r));varClose();changed();});
      vp.appendChild(o);});
    if(w!=='0'){var x=document.createElement('button');x.type='button';x.className='opt off';x.setAttribute('role','menuitem');x.textContent='Off';
      x.addEventListener('click',function(){var a=pat[r].split('');a[s]='0';pat[r]=a.join('');varClose();changed();});vp.appendChild(x);}
    document.body.appendChild(vp);b.classList.add('vsel');
    /* Über dem Punkt, sonst darunter; nie über den Rand hinaus */
    var br=b.getBoundingClientRect(),pr=vp.getBoundingClientRect(),W=document.documentElement.clientWidth,top=br.top-pr.height-10;
    if(top<8)top=br.bottom+10;
    vp.style.left=Math.max(8,Math.min(W-pr.width-8,br.left+br.width/2-pr.width/2))+'px';vp.style.top=top+'px';
    setTimeout(function(){if(!vp)return;document.addEventListener('pointerdown',varOut,true);window.addEventListener('scroll',varClose,true);window.addEventListener('resize',varClose);},0);
    var f=vp.querySelector('[aria-checked="true"]')||vp.querySelector('button');f.focus({preventScroll:true});
  }
  function paint(){
    var r,s,so=anySolo();
    for(r=0;r<R;r++){
      var T=TRACKS[r],multi=T.s.length>1;
      for(s=0;s<N;s++){var w=pat[r].charAt(s),b=cells[r][s],on=w!=='0',k=sndIx(r,w);
        b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
        b.textContent=on&&multi&&(T.id==='click'||k>0)?(T.id==='click'?w:String(k+1)):'';}
      rows[r].classList.toggle('quiet',!audible(r));
      rows[r].querySelector('.tb').textContent=r===MIC&&!REC.mic?'Record your own sound':multi?T.s[sndIx(r,brush[r])][1]:'';
    }
    app.classList.toggle('solo',so);
    $('bpm').textContent=bpm;$('swTxt').textContent='Swing '+Math.round(sw*100)+' %';
    /* Eigener Name (beim Teilen vergeben) geht vor; sonst Name der Vorlage */
    $('preTxt').textContent=title||(pre>=0?NM[BEATS[pre].n]:'Your beat');
    $('sub').textContent=title&&pre>=0?'based on '+NM[BEATS[pre].n]:pre>=0&&edited?'edited':'';
    /* Eine unveränderte Vorlage behält ihren Namen: kein Stift, kein Namens-Blatt */
    if(cb&&molOn)cardLabel();
  }
  function changed(){edited=true;paint();persist();}
  /* Benennen geht nur bei eigenen oder veränderten Beats; Namen werden nur erzeugt, nie getippt */
  function canName(){return pre<0||edited;}

  /* ---------- Wiedergabe ---------- */
  function head(s,b){
    var r;
    if(shown>=0)for(r=0;r<R;r++)cells[r][shown].classList.remove('ph');
    shown=s;if(s>=0)molHit(s,b);
    if(s>=0)for(r=0;r<R;r++){cells[r][s].classList.add('ph');if(pat[r].charAt(s)!=='0'&&audible(r)&&!drop)flash(r);}
    /* Taktzähler und Fortschrittslinie folgen dem laufenden Schritt */
    for(r=0;r<beats.length;r++)beats[r].classList.toggle('cur',s>=0&&r===Math.floor(s/4));
    app.style.setProperty('--prog',s<0?0:(s+1)/N);
  }
  /* Das Spur-Icon blinkt kurz in Flieder, wenn die Spur klingt */
  function flash(r){var ic=rows[r].querySelector('.ic');ic.classList.remove('hit');void ic.offsetWidth;ic.classList.add('hit');clearTimeout(ic._t);ic._t=setTimeout(function(){ic.classList.remove('hit');},140);}
  function loop(){
    var nw=ac.currentTime;
    while(queue.length&&queue[0].t<=nw){head(queue[0].s,queue[0].b);queue.shift();}
    if(playing)raf=requestAnimationFrame(loop);
  }
  function at(t,f){setTimeout(f,Math.max(0,(t-ac.currentTime)*1000));}
  function sched(){
    var six=st();
    while(nextT<ac.currentTime+.15){
      var s=step,t=nextT+((s%4===2)?six*sw:0),r;
      if(s===0){fxTempo();if(drop===1){drop=2;dropBuild(t,N*six);}else if(drop===2){drop=0;dropBoom(t);}}
      /* Drop: ein Takt Anlauf mit dem eigenen Beat (siehe dropBuild), die letzten zwei Schritte Pause, dann der Einschlag */
      if(drop===2)dropStep(s,t,six);
      else playStep(s,t,six,bar);
      queue.push({s:s,t:t,b:bar});
      step=(step+1)%N;if(!step)bar++;nextT+=six;
    }
  }
  /* Ein Schritt des Beats (ohne Drop): Spuren, Stottern, Pumpen */
  function playStep(s,t,six,bar){
    /* Stottern: am Ende jedes n-ten Takts spielt statt der letzten Schritte immer wieder der erste davon, in Zweiunddreißigsteln */
    var L=FX.stut&&(bar+1)%FXO.stut===0?fxStutLen():0,src=N-L,k,r;
    if(L&&s>=src){for(r=0;r<R;r++)if(audible(r)){var w2=pat[r].charAt(src);if(w2!=='0')for(k=0;k<2;k++)play(TRACKS[r].id,t+k*six/2,[src,w2,2,gainOf(r)*(1-.35*(s-src+k/2)/L)]);}}
    else for(r=0;r<R;r++)if(audible(r)){var w=pat[r].charAt(s);if(w!=='0')play(TRACKS[r].id,t,[s,w,2,gainOf(r)]);}
    fxPump(t,s);
  }
  /* Drop: je nach Beat anders. Der Beat läuft im Anlauf weiter, nur ohne Kick, Toms, Becken und FX in der zweiten Hälfte.
     Ein Wirbel mit dem Snare-Klang des Beats (Snare, Clap oder Rim) wird schneller: Viertel, Achtel, Sechzehntel.
     Tempo ab 150: alles doppelt so schnell. Unter 100 (Lo-Fi, One Drop, Reggaeton): der Filter schließt sich und es wird dunkel,
     sonst öffnet sich ein Hochpass und der Bass verschwindet. Die letzten zwei Schritte sind still bis auf ein rückwärts laufendes Becken */
  var dmode='up',droll='p',dcut=8;
  function dropPlan(){
    dmode=bpm>=150?'fast':bpm<100?'dark':'up';dcut=dmode==='dark'?12:8;
    var c={},k,best='p',n=0;for(k=0;k<N;k++){var w=pat[2].charAt(k);if(w==='p'||w==='c'||w==='k')c[w]=(c[w]||0)+1;}
    for(k in c)if(c[k]>n){n=c[k];best=k;}droll=best;
  }
  function dropStep(s,t,six){
    var r,id,ev,j;
    if(s===12)play('fx',t,[s,'s',2,.9]);
    if(s>=N-2)return;
    for(r=0;r<R;r++)if(audible(r)){var w=pat[r].charAt(s);id=TRACKS[r].id;if(w==='0')continue;
      if(s>=dcut&&(id==='beat'||id==='toms'||id==='cym'||id==='fx'))continue;play(id,t,[s,w,2,gainOf(r)]);}
    ev=s<8?4:s<12?2:1;if(dmode==='fast')ev/=2;if(dmode==='dark')ev=s<8?0:s<12?4:2;
    if(!ev)return;var lv=.2+.6*s/N;
    if(ev>=1){if(s%ev===0)play('snare',t,[s,droll,2,lv]);}
    else for(j=0;j<2;j++)play('snare',t+j*six/2,[s,droll,2,lv]);
  }
  function dropBuild(t,bar){
    dropPlan();
    var f=B.FILT,fr=f.frequency;fr.cancelScheduledValues(t);f.Q.cancelScheduledValues(t);
    if(dmode==='dark'){fr.setValueAtTime(20000,t);fr.exponentialRampToValueAtTime(380,t+bar*.85);f.Q.setValueAtTime(.7,t);f.Q.linearRampToValueAtTime(5,t+bar*.85);}
    else{fr.setValueAtTime(20,ac.currentTime);f.type='highpass';fr.setValueAtTime(20,t);fr.exponentialRampToValueAtTime(dmode==='fast'?1800:1300,t+bar*.85);f.Q.setValueAtTime(.7,t);f.Q.linearRampToValueAtTime(3,t+bar*.85);
      /* leiser Riser: Rauschband steigt mit */
      var sr=ac.createBufferSource();sr.buffer=B.NZ;sr.loop=true;var bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=2;bp.frequency.setValueAtTime(500,t);bp.frequency.exponentialRampToValueAtTime(8000,t+bar*.85);
      var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+bar*.85);g.gain.exponentialRampToValueAtTime(.0001,t+bar*.87);sr.connect(bp);bp.connect(g);g.connect(B.OUT);send(g,B.REV,.35);sr.start(t);sr.stop(t+bar);}
    at(t,function(){app.classList.add('building');});
  }
  /* Einschlag: Filter sofort offen, Kick, Crash, ein kurzer, tiefer Sub-Schlag (kein langes Abwärtsheulen) und ein Hauch Luft im Hall */
  function dropBoom(t){
    var f=B.FILT,fr=f.frequency;fr.cancelScheduledValues(t);f.Q.cancelScheduledValues(t);
    if(f.type==='highpass'){fr.setValueAtTime(20,t);at(t+.05,function(){filtOpen();});}else{fr.setValueAtTime(20000,t);f.Q.setValueAtTime(.7,t);}
    play('beat',t,[0,'b',2,1]);play('cym',t,[0,'c',2,dmode==='dark'?.6:.9]);
    var g=vca(t,.003,.06,.5,.75,B.SAT),o=osc('sine',110,t,t+.7,g);o.frequency.exponentialRampToValueAtTime(46,t+.06);
    nz(t,.35,.18,'highpass',5000,.7,.45);
    at(t,function(){app.classList.remove('building');dropB.classList.remove('on');});
  }
  function filtOpen(){if(!B||!ac)return;var f=B.FILT,t=ac.currentTime;f.frequency.cancelScheduledValues(t);f.Q.cancelScheduledValues(t);f.type='lowpass';f.frequency.setValueAtTime(20000,t);f.Q.setValueAtTime(.7,t);}
  function dropReset(){drop=0;app.classList.remove('building');dropB.classList.remove('on');filtOpen();}
  dropB.addEventListener('click',function(){if(drop)return;if(!playing)setPlay(true);if(!playing)return;drop=1;dropB.classList.add('on');});
  var I_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
      I_STOP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';
  function setPlay(on){
    if(on===playing)return;
    if(on){
      try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();bus();}catch(e){return;}
      playing=true;step=0;bar=0;fxStart();nextT=ac.currentTime+.06;playT0=nextT;queue=[];sched();timer=setInterval(sched,25);raf=requestAnimationFrame(loop);
    }else{
      playing=false;dropReset();fxHalt();clearInterval(timer);cancelAnimationFrame(raf);queue=[];head(-1);
    }
    app.classList.toggle('live',on);
    playB.innerHTML=on?I_STOP:I_PLAY;playB.classList.toggle('on',on);playB.setAttribute('aria-label',on?'Stop (Space)':'Play (Space)');
  }
  playB.addEventListener('click',function(){setPlay(!playing);});
  /* Handy gesperrt, App oder Tab gewechselt: Beat anhalten und den Ton sofort stumm schalten (auch nachklingende Hallfahnen) */
  function away(){setPlay(false);try{if(ac&&ac.state==='running'&&ac.suspend)ac.suspend();}catch(e){}}
  document.addEventListener('visibilitychange',function(){if(document.hidden)away();});
  window.addEventListener('pagehide',away);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&vp){var vb=vp._b;varClose();vb.focus({preventScroll:true});return;}
    if(e.key==='Escape'&&!sheet.hidden){closeSheet();return;}
    if(e.key==='Escape'&&cardT){cardStop();return;}
    if(e.code!=='Space'||e.repeat)return;var tg=e.target,tn=tg&&tg.tagName;
    if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT'||!sheet.hidden)return;
    e.preventDefault();setPlay(!playing);
  });

  /* ---------- Unterseiten: Spur, Vorlagen, Tempo. Eigener Verlaufseintrag, damit Zurück im Browser funktioniert ---------- */
  var lastFocus=null,pageName='',pushed=false,ignoreHash=false;
  var BACK='<div class="pnav"><button type="button" class="ib" data-close aria-label="Back"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="mark"><i aria-hidden="true"></i>MSTR</span><span class="sp"></span></div>';
  /* half: Blatt von unten (Tempo), der Sequencer bleibt darüber sichtbar */
  var catcher=document.createElement('div');catcher.className='catcher';catcher.hidden=true;document.body.appendChild(catcher);
  catcher.addEventListener('click',function(){closeSheet();});
  function openSheet(html,init,name,half){
    /* page: ganze Seite ohne Zurück-Pfeil (Willkommen), nur die Marke oben */
    var page=half==='page';if(page)half=false;
    lastFocus=document.activeElement;sheet.innerHTML=(half?'<div class="grab" aria-hidden="true"></div>':page?'<div class="pnav"><span class="mark"><i aria-hidden="true"></i>MSTR</span></div>':BACK)+html;sheet.hidden=false;sheet.scrollTop=0;
    sheet.classList.toggle('half',!!half);sheet.classList.toggle('top',half==='top');catcher.hidden=!half;
    if(!half)document.body.classList.add('noscroll');
    var xb=sheet.querySelector('[data-close]');if(xb)xb.addEventListener('click',closeSheet);
    if(init)init(sheet);
    var f=sheet.querySelector('[data-focus]')||(page?null:sheet.querySelector('button'));if(f)f.focus({preventScroll:true});
    /* Willkommen öffnet ohne Geste: ein Hash dort würde den Verlaufseintrag ersetzen (Chrome), darum kein eigener Eintrag */
    pageName=name;if(page){pushed=false;return;}
    if(location.hash!=='#'+name){pushed=true;location.hash=name;}
  }
  function hideSheet(){if(sheet.__stop){sheet.__stop();sheet.__stop=null;}sheet.hidden=true;catcher.hidden=true;sheet.innerHTML='';document.body.classList.remove('noscroll');if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
  function closeSheet(){if(sheet.hidden)return;hideSheet();if(pushed){pushed=false;ignoreHash=true;history.back();}}
  window.addEventListener('hashchange',function(){if(ignoreHash){ignoreHash=false;return;}if(!sheet.hidden&&location.hash!=='#'+pageName){pushed=false;hideSheet();}});
  var X='',XB='<button type="button" class="ib" data-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
  function presetSheet(){
    var order=BEATS.map(function(b,i){return i;}).sort(function(a,b){return BEATS[a].bpm-BEATS[b].bpm||a-b;});
    openSheet('<div class="sh-top"><span class="eyebrow" id="sheetT">Describe a beat</span></div>'+
      '<form class="sayf" autocomplete="off"><textarea id="sayIn" rows="2" maxlength="200" enterkeyhint="send" aria-labelledby="sheetT"></textarea>'+
      '<button type="submit" class="ib go" id="sayGo" aria-label="Make the beat" title="Make the beat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>'+
      '<p class="shnote left">Style, mood, tempo, sounds, effects. In your own words, English or German.</p>'+
      '<h2 class="ed">or pick one<br><em>'+BEATS.length+' beats by tempo</em></h2><div class="plist" role="listbox" aria-label="Beats"></div>'+
      '<div class="field"><span class="lbl">Theme</span><div class="seg2 three" id="themeSeg"><button type="button" data-t="system">System</button><button type="button" data-t="light">Light</button><button type="button" data-t="dark">Dark</button></div></div>'+
      '<a class="lab" href="https://asimplemanslab.com/" aria-label="Made with love by A Simple Man\u2019s Lab"><span>Made with love by</span><i aria-hidden="true"></i></a>',function(el){
      sayInit(el);
      el.querySelectorAll('#themeSeg button').forEach(function(b){b.addEventListener('click',function(){S.theme=b.dataset.t;save();themeUI();});});
      themeUI();
      var list=el.querySelector('.plist'),e=document.createElement('button');e.type='button';e.id='clr';e.className='pitem'+(pre<0&&pat.slice(0,7).join('')===empty().slice(0,7).join('')?' sel':'');e.setAttribute('role','option');
      e.innerHTML='<span class="n">Empty grid</span><span class="v">'+bpm+'<small>BPM</small></span>';e.addEventListener('click',function(){clearAll();closeSheet();});list.appendChild(e);
      order.forEach(function(i){var Bt=BEATS[i],b=document.createElement('button');b.type='button';b.className='pitem'+(i===pre?' sel':'');b.setAttribute('role','option');b.setAttribute('aria-selected',i===pre?'true':'false');
        if(i===pre)b.setAttribute('data-focus','');
        b.innerHTML='<span class="n">'+NM[Bt.n]+'</span><span class="v">'+Bt.bpm+'<small>BPM</small></span>';
        b.addEventListener('click',function(){fromBeat(i);paint();persist();closeSheet();if(!playing)setPlay(true);});list.appendChild(b);});
    },'vorlagen');
  }
  $('preBtn').addEventListener('click',presetSheet);
  /* ---------- Beat aus Worten: beschreiben, abschicken, der Beat ist da (Regeln in worte.js, alles im Browser).
     Ersetzt die sieben eingebauten Spuren, Tempo, Swing und Effekte; die Spur Aufnahme bleibt. Die Beschreibung wird der Name.
     Nochmal abschicken gibt eine Variante. Rückgängig über den Hinweis ---------- */
  function beatRows(i){var Bt=BEATS[i],X=EXTRA[Bt.n],o=[],r;for(r=0;r<7;r++)o.push(r<3?rowFromBeat(Bt,TRACKS[r].id):dots(X?X[r-3]:COMMON[TRACKS[r].id][0]));return o;}
  var SAY=['dusty slow hip hop with vinyl','dark fast techno, lots of echo','happy summer beat with cowbell','dreamy, minimal, a bit of swing','drum and bass without hats'];
  var SAYF='<form class="sayf" autocomplete="off"><textarea id="sayIn" rows="2" maxlength="200" enterkeyhint="send" aria-label="Describe a beat"></textarea>'+
      '<button type="submit" class="ib go" id="sayGo" aria-label="Make the beat" title="Make the beat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>';
  /* Das Feld „Describe a beat“ (Beat-Liste und Willkommen): Enter oder Pfeil schickt ab, leer nimmt das Beispiel, die letzte Beschreibung steht wieder drin */
  function sayInit(el,after){
    var inp=el.querySelector('#sayIn'),f=el.querySelector('form.sayf');
    var used=[].map.call(el.querySelectorAll('.chip'),function(c){return c.textContent;}),pool=SAY.filter(function(x){return used.indexOf(x)<0;});
    inp.value=typeof S.say==='string'?S.say:'';inp.placeholder=pool[Math.floor(Math.random()*pool.length)];
    function go(v){v=v||inp.value.trim()||inp.placeholder;S.say=v===inp.placeholder?inp.value.trim():v;if(after)after();save();closeSheet();sayBeat(v);}
    f.addEventListener('submit',function(e){e.preventDefault();go();});
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go();}});
    el.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){go(c.textContent);});});
  }
  /* ---------- Vibe: die Frage „What's the vibe?“ ist der Einstieg (erster Besuch) und „Change vibe“ im Orbit.
     Drei Reihen Wörter (Stimmung, Energie, Farbe), die der Parser sicher kennt; Tippen baut den Satz im Feld, Tippen ins Feld erlaubt
     eigene Wörter. „Make the beat“ schickt ab, „Surprise me“ würfelt. Beim ersten Besuch ohne X (S.seen danach), sonst mit X ---------- */
  var VIBE=[['Mood',['calm','dark','happy','sad','party','angry','dreamy','epic','playful']],['Energy',['slow','steady','fast','minimal','busy','swing']],['Colour',['dusty','warm','clean','spacey','dub','glitchy']]];
  function vibe(on){
    if(on===false){S.seen=1;save();if(pageName==='vibe'&&!sheet.hidden)closeSheet();return;}
    var first=!S.seen;S.seen=1;save();
    openSheet('<div class="sh-top"><span class="eyebrow">'+(first?'Your beat starts here':'New beat')+'</span>'+(first?'':XB)+'</div><h2 class="ed" id="sheetT">What\u2019s the vibe?</h2>'+
      '<form class="sayf vibef" autocomplete="off"><textarea id="sayIn" rows="2" maxlength="200" enterkeyhint="send" aria-labelledby="sheetT" placeholder="Tap words, or type"></textarea></form>'+
      VIBE.map(function(g){return '<div class="vgrp"><span class="lbl">'+g[0]+'</span><div class="chips">'+g[1].map(function(w){return '<button type="button" class="chip" data-w="'+w+'" aria-pressed="false">'+w+'</button>';}).join('')+'</div></div>';}).join('')+
      '<div class="vgo"><button type="button" class="lnk" id="vSurprise">Surprise me</button><button type="button" class="pill go big" id="sayGo">Make the beat<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>',function(el){
      var inp=el.querySelector('#sayIn'),chips=[].slice.call(el.querySelectorAll('.chip'));
      inp.value=typeof S.say==='string'?S.say:'';
      function has(w){return new RegExp('(^|[^a-z])'+w+'(?=[^a-z]|$)','i').test(inp.value);}
      function mark(){chips.forEach(function(c){var on=has(c.dataset.w);c.classList.toggle('on',on);c.setAttribute('aria-pressed',on?'true':'false');});}
      function go(v){v=String(v||inp.value).trim();if(!v)v=surprise();S.say=v;save();closeSheet();sayBeat(v);molSet(true);}
      function surprise(){var p=function(a){return a[Math.floor(Math.random()*a.length)];},w=[p(VIBE[0][1]),p(VIBE[1][1])];if(Math.random()<.5)w.push(p(VIBE[2][1]));return w.join(' · ');}
      chips.forEach(function(c){c.addEventListener('click',function(){var w=c.dataset.w;
        if(has(w))inp.value=inp.value.replace(new RegExp('(^|[^a-z])'+w+'(?=[^a-z]|$)','i'),'$1').replace(/\s*·\s*·\s*/g,' · ').replace(/^\s*·\s*|\s*·\s*$/g,'').trim();
        else inp.value=inp.value.trim()?inp.value.trim()+' · '+w:w;
        mark();});});
      inp.addEventListener('input',mark);mark();
      el.querySelector('form').addEventListener('submit',function(e){e.preventDefault();go();});
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go();}});
      el.querySelector('#sayGo').addEventListener('click',function(){go();});
      el.querySelector('#vSurprise').addEventListener('click',function(){inp.value=surprise();mark();go();});
    },'vibe','page');
  }
  /* „Another take“: dieselbe Beschreibung noch einmal (der Parser würfelt leicht); ohne Beschreibung nimmt er den Stil der Vorlage, ohne beides fragt er nach dem Vibe */
  function anotherTake(){var t=typeof S.say==='string'&&S.say.trim()?S.say:pre>=0?BEATS[pre].n:'';if(!t){vibe();return;}sayBeat(t);}
  var lastSay=typeof S.say==='string'?S.say.trim():'';
  function sayBeat(text){
    text=String(text||'').trim();if(!text)return false;
    /* Gleicher Satz wie eben = ein neuer Take: andere Vorlage, wenn die Stimmung eine hergibt, und deutlich anderes Muster (bis zu acht Würfe) */
    var again=text===lastSay,ctxW={n:BEATS.map(function(b){return b.n;}),bpm:BEATS.map(function(b){return b.bpm;}),sw:BEATS.map(function(b){return b.sw;}),rows:beatRows,avoid:again?pre:null},o,tries=0;
    do{o=WORTE(text,ctxW);}while(again&&++tries<8&&o.g.reduce(function(n,row,r){for(var k=0;k<16;k++)if(row.charAt(k)!==pat[r].charAt(k))n++;return n;},0)<12);
    lastSay=text;
    var r;
    for(r=0;r<7;r++)pat[r]=o.g[r];
    bpm=o.bpm;sw=o.sw;pre=o.pre;edited=true;
    FXS.forEach(function(f){var id=f[0],x=o.fx[id];FX[id]=!!x;if(x){FXA[id]=x[0];if(f[4]&&f[4].some(function(q){return q[0]===x[1];}))FXO[id]=x[1];}});
    fxSave();fxApply(false);fxUI();
    /* Der Name kommt aus dem Beat selbst, nicht aus dem getippten Text */
    title=CARD.title(cardModel(),Math.floor(Math.random()*8));paint();persist();
    if(!playing)setPlay(true);
    return true;
  }

  function tempoSheet(){
    var taps=[];
    openSheet('<div class="sh-top"><span class="eyebrow" id="sheetT">Tempo and swing</span>'+XB+'</div>'+
      '<div class="bpmrow"><button type="button" class="ib lg" id="tDown" aria-label="Slower">−</button><label class="big" for="tBpm"><input id="tBpm" type="number" inputmode="numeric" min="60" max="180" value="'+bpm+'" aria-label="Tempo in BPM"><small>bpm</small></label><button type="button" class="ib lg" id="tUp" aria-label="Faster">+</button></div>'+
      '<button type="button" class="pill wide" id="tTap">Tap tempo</button>'+
      '<div class="slider"><div class="lb"><span>Swing on every second eighth</span><b id="tSwV"></b></div><input type="range" id="tSw" min="0" max="60" step="1" value="'+Math.round(sw*100)+'" aria-label="Swing in percent"></div>'+
      '<div class="swbar" id="tSwBar" aria-hidden="true"></div>',function(el){
      var inp=el.querySelector('#tBpm'),sl=el.querySelector('#tSw');
      function setB(v){bpm=Math.round(num(v,60,180,bpm));inp.value=bpm;paint();persist();}
      function swUI(){el.querySelector('#tSwV').textContent=sl.value+' %';var h='',k;for(k=0;k<8;k++)h+='<i class="'+(k%2?'':'q')+'" style="left:'+(k/8*100+(k%2?sw*100/16:0))+'%"></i>';el.querySelector('#tSwBar').innerHTML=h;}
      el.querySelector('#tDown').addEventListener('click',function(){setB(bpm-1);});
      el.querySelector('#tUp').addEventListener('click',function(){setB(bpm+1);});
      inp.addEventListener('change',function(){setB(inp.value);});
      el.querySelector('#tTap').addEventListener('click',function(){var n=performance.now();taps=taps.filter(function(t){return n-t<2500;});taps.push(n);if(taps.length>1)setB(60000*(taps.length-1)/(n-taps[0]));});
      sl.addEventListener('input',function(){sw=sl.value/100;swUI();paint();});
      sl.addEventListener('change',persist);
      swUI();
    },'tempo',true);
  }
  $('tempoBtn').addEventListener('click',tempoSheet);

  /* Effekte: halbes Blatt, der Beat läuft darüber weiter. Jede Zeile schaltet einen Effekt, der Punkt rechts wird Flieder.
     Ist ein Effekt an, klappen darunter sein Regler und (bei Echo und Filter) die Auswahl auf */
  var fxB=$('fxBtn');
  function fxUI(){var n=fxCount();fxB.classList.toggle('on',n>0);$('fxN').textContent=n?' '+n:'';fxB.setAttribute('aria-label','Effects'+(n?', '+n+' on':''));}
  function fxSheet(){
    openSheet('<div class="sh-top"><span class="eyebrow" id="sheetT">Effects</span>'+XB+'</div><div class="fxlist">'+
      FXS.map(function(f){var id=f[0];return '<div class="fxrow" data-fx="'+id+'"><button type="button" class="fxi" aria-pressed="'+(FX[id]?'true':'false')+'"><span><b>'+f[1]+'</b><small>'+f[2]+'</small></span><i aria-hidden="true"></i></button>'+
        '<div class="fxctl"><div class="slider"><div class="lb"><span>'+f[3]+'</span><b>'+FXA[id]+' %</b></div><input type="range" min="0" max="100" step="1" value="'+FXA[id]+'" aria-label="'+f[1]+': '+f[3]+'"></div>'+
        (f[4]?'<div class="opts">'+f[4].map(function(o){return '<button type="button" class="opt" data-v="'+o[0]+'" aria-pressed="'+(FXO[id]===o[0]?'true':'false')+'">'+o[1]+'</button>';}).join('')+'</div>':'')+'</div></div>';}).join('')+'</div>',function(el){
      el.querySelectorAll('.fxrow').forEach(function(row){var id=row.getAttribute('data-fx'),b=row.querySelector('.fxi'),sl=row.querySelector('input'),v=row.querySelector('.lb b');
        b.addEventListener('click',function(){var on=!FX[id];if(on&&!playing)setPlay(true);fxSet(id,on);b.setAttribute('aria-pressed',on?'true':'false');fxUI();});
        sl.addEventListener('input',function(){fxAmt(id,sl.value);v.textContent=sl.value+' %';});
        sl.addEventListener('change',function(){fxAmt(id,sl.value,true);});
        row.querySelectorAll('.opt').forEach(function(o){o.addEventListener('click',function(){fxOpt(id,+o.getAttribute('data-v'));
          row.querySelectorAll('.opt').forEach(function(x){x.setAttribute('aria-pressed',x===o?'true':'false');});});});});
    },'effekte',true);
  }
  fxB.addEventListener('click',fxSheet);
  fxUI();

  function trackSheet(r){
    var T=TRACKS[r],id=T.id,mic=r===MIC,busy=false;
    /* Nur die Spur Aufnahme hat das Mikrofon, ganz oben. Die übrigen Spuren klingen immer eingebaut */
    var REC_UI=mic?'<div class="recbox"><div class="rings" aria-hidden="true"><i></i><i></i><i></i></div><button type="button" class="rec" id="kRec" aria-label="Record your own sound, 1 second"><i></i></button>'+
      '<p class="recst" id="kRecSt" aria-live="polite"></p></div>':'';
    openSheet('<div class="sh-top"><div><span class="eyebrow">Track '+(r+1)+' of '+R+'</span><h2 class="tt" id="sheetT">'+T.n+'</h2></div>'+X+'</div>'+REC_UI+
      '<div class="more" id="kMore">'+
      (T.s.length>1?'<div class="field"><span class="lbl">'+(mic?'Pitch for new steps':'Sound for new steps')+'</span><div class="opts" id="kSnd"></div></div>':'')+
      '<div class="slider"><div class="lb"><span>Volume</span><b id="kVolV"></b></div><input type="range" id="kVol" min="0" max="100" step="1" value="'+Math.round(vol[r]*100)+'" aria-label="Volume '+T.n+'"></div>'+
      '<div class="seg2"><button type="button" id="kMute">Mute</button><button type="button" id="kSolo">Solo</button></div>'+
      '<div class="acts"><button type="button" class="pill" id="kDice">Suggest</button><button type="button" class="pill" id="kClr">Clear track</button>'+(mic?'<button type="button" class="pill" id="kDel">Delete recording</button>':'')+'</div></div>',function(el){
      var vs=el.querySelector('#kVol');
      function ui(){
        el.querySelector('#kVolV').textContent=vs.value+' %';
        el.querySelector('#kMute').setAttribute('aria-pressed',mute[r]?'true':'false');
        el.querySelector('#kSolo').setAttribute('aria-pressed',solo[r]?'true':'false');
        if(mic){var has=!!REC.mic;el.querySelector('#kMore').hidden=!has;
          if(!busy)el.querySelector('#kRecSt').textContent=has?'Your sound is saved. Tap to record again.':'Record 1 second: a clap, a snap, a word, a glass.';}
        var o=el.querySelector('#kSnd');if(o)[].forEach.call(o.children,function(b,k){b.setAttribute('aria-pressed',T.s[k][0]===brush[r]?'true':'false');});
      }
      var o=el.querySelector('#kSnd');
      if(o)T.s.forEach(function(sd){var b=document.createElement('button');b.type='button';b.className='opt';b.textContent=sd[1];
        b.addEventListener('click',function(){brush[r]=sd[0];now(id,sd[0],gainOf(r));ui();paint();persist();});o.appendChild(b);});
      vs.addEventListener('input',function(){vol[r]=vs.value/100;ui();});
      vs.addEventListener('change',function(){persist();now(id,brush[r],gainOf(r));});
      el.querySelector('#kMute').addEventListener('click',function(){mute[r]=!mute[r];ui();paint();persist();});
      el.querySelector('#kSolo').addEventListener('click',function(){solo[r]=!solo[r];ui();paint();persist();});
      el.querySelector('#kDice').addEventListener('click',function(){dice(r);if(!playing)setPlay(true);});
      el.querySelector('#kClr').addEventListener('click',function(){pat[r]=zero();changed();});
      if(mic){
        el.querySelector('#kDel').addEventListener('click',function(){dropRec(id);pat[r]=zero();changed();ui();});
        var rb=el.querySelector('#kRec'),stE=el.querySelector('#kRecSt'),box=el.querySelector('.recbox');
        rb.addEventListener('click',function(){if(busy)return;busy=true;rb.disabled=true;
          record(id,function(msg,lv){stE.textContent=msg;box.classList.toggle('count',lv===1);box.classList.toggle('on',lv===2);},
            function(ok){busy=false;rb.disabled=false;box.classList.remove('on','count');
              /* Erste Aufnahme in eine leere Spur: gleich auf 2 und 4 legen, damit man sie im Beat hört */
              if(ok&&pat[r]===zero()){pat[r]=dots(COMMON.mic[0]);changed();}
              ui();paint();});});
      }
      ui();
    },'spur-'+id);
  }
  function dice(r){
    var id=TRACKS[r].id,ix;
    if(r<3){do{ix=Math.floor(Math.random()*BEATS.length);}while(ix===lastDice[r]&&BEATS.length>1);lastDice[r]=ix;pat[r]=rowFromBeat(BEATS[ix],id);}
    else{pk[r]=((pk[r]||0)+1)%3;pat[r]=dots(COMMON[id][pk[r]]);}
    changed();
  }

  /* ---------- Leeren mit Rückgängig ---------- */
  var toast=null,undo=null;
  function showToast(msg,act,fn){
    if(toast)toast.remove();toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');
    toast.innerHTML='<span>'+msg+'</span>'+(act?'<button type="button">'+act+'</button>':'');app.appendChild(toast);
    var t=toast;if(act)t.querySelector('button').addEventListener('click',function(){fn();t.remove();});
    setTimeout(function(){if(t.parentNode)t.remove();},5000);
  }
  /* Leeres Raster: erster Eintrag der Beat-Liste */
  function clearAll(){
    undo={g:pat.slice(),pre:pre,ed:edited,nm:title};pat=empty();pre=-1;edited=false;title='';paint();persist();
    showToast('All tracks cleared','Undo',function(){pat=undo.g;pre=undo.pre;edited=undo.ed;title=undo.nm;paint();persist();});
  }

  /* ---------- Beat teilen: der ganze Beat steckt im Link (?b=…), es gibt keinen Server.
     Aufbau: 1.<bpm>.<swing %>.<vorlage>.<raster>.<lautstärke>.<mute/solo>.<effekte>
     vorlage: Name der Vorlage, mit * wenn verändert, leer bei eigenem Beat. raster: die sieben eingebauten Spuren hintereinander,
     Läufe von Nullen als Großbuchstaben (A = 1 … P = 16). lautstärke: je Spur zwei Zeichen Base36 (leer, wenn alle 80 %).
     mute/solo: Bitmasken Base36. effekte: je eingeschaltetem Effekt Nummer, Stärke (2 Zeichen Base36) und Auswahl.
     Danach optional .<name>: der eigene Name, URL-kodiert (Punkte als %2E), höchstens 40 Zeichen.
     Danach optional .<farbe>: ein Buchstabe für die Orbit-Farbe (f m k b e), fehlt er, ist es Flieder; dann steht der Name davor, notfalls leer.
     Die Spur Aufnahme fehlt absichtlich: die Aufnahme liegt nur auf dem eigenen Gerät, beim Empfänger bleibt seine Spur, wie sie ist ---------- */
  var SR=MIC<0?R:MIC; /* geteilt werden die Spuren vor der Aufnahme */
  function b36(v){return (v<36?'0':'')+v.toString(36);}
  function shareCode(){
    var g='',z=0,k,r,c,m=0,so=0,v='',f='';
    for(r=0;r<SR;r++)for(k=0;k<N;k++){c=pat[r].charAt(k);
      if(c==='0'){z++;if(z===16){g+='P';z=0;}continue;}
      if(z){g+=String.fromCharCode(64+z);z=0;}g+=c;}
    if(z)g+=String.fromCharCode(64+z);
    for(r=0;r<SR;r++){if(mute[r])m|=1<<r;if(solo[r])so|=1<<r;}
    if(vol.slice(0,SR).some(function(x){return Math.round(x*100)!==80;}))for(r=0;r<SR;r++)v+=b36(Math.round(vol[r]*100));
    FXS.forEach(function(x,i){var id=x[0];if(FX[id])f+=i+b36(FXA[id])+(x[4]?FXO[id]:0);});
    return ['1',bpm,Math.round(sw*100),pre>=0?BEATS[pre].n+(edited?'*':''):'',g,v,m||so?m.toString(36)+'_'+so.toString(36):'',f].concat(title||col!=='f'?[encodeURIComponent(title).replace(/\./g,'%2E')]:[],col!=='f'?[col]:[]).join('.');
  }
  /* Liest einen Link-Code. Ungültig: null, dann bleibt alles, wie es ist */
  function readCode(s){
    var p=String(s||'').split('.').map(function(x){try{return decodeURIComponent(x);}catch(e){return '';}}),g='',k,c,r;
    if(p.length<8||p.length>10||p[0]!=='1')return null;
    for(k=0;k<p[4].length;k++){c=p[4].charAt(k);if(c>='A'&&c<='P')g+=new Array(c.charCodeAt(0)-63).join('0');else g+=c;}
    if(g.length!==SR*N)return null;
    var rows=[];for(r=0;r<SR;r++){var row=g.substr(r*N,N);for(k=0;k<N;k++)if(row.charAt(k)!=='0'&&sndIx(r,row.charAt(k))<0)return null;rows.push(row);}
    var o={g:rows,bpm:Math.round(num(p[1],60,180,100)),sw:num(p[2],0,60,0)/100,pre:-1,ed:false,vol:null,mute:0,solo:0,fx:[],nm:(p[8]||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,40),col:CARD.HUES[p[9]]?p[9]:'f'};
    var nm=p[3].replace(/\*$/,''),ix=BEATS.map(function(b){return b.n;}).indexOf(nm);if(nm&&ix>=0){o.pre=ix;o.ed=/\*$/.test(p[3]);}
    if(p[5].length===SR*2){o.vol=[];for(r=0;r<SR;r++)o.vol.push(num(parseInt(p[5].substr(r*2,2),36),0,100,80)/100);}
    var ms=p[6].split('_');if(ms.length===2){o.mute=parseInt(ms[0],36)||0;o.solo=parseInt(ms[1],36)||0;}
    for(k=0;k+4<=p[7].length;k+=4){var i=+p[7].charAt(k),F=FXS[i];if(!F)continue;
      o.fx.push([F[0],num(parseInt(p[7].substr(k+1,2),36),0,100,50),+p[7].charAt(k+3)]);}
    return o;
  }
  function snap(){return {pat:pat.slice(),bpm:bpm,sw:sw,pre:pre,ed:edited,nm:title,col:col,vol:vol.slice(),mute:mute.slice(),solo:solo.slice(),
    fx:JSON.parse(JSON.stringify(FX)),fxa:JSON.parse(JSON.stringify(FXA)),fxo:JSON.parse(JSON.stringify(FXO))};}
  function restore(z){pat=z.pat;bpm=z.bpm;sw=z.sw;pre=z.pre;edited=z.ed;title=z.nm;col=z.col||'f';hueUI();vol=z.vol;mute=z.mute;solo=z.solo;
    FXS.forEach(function(f){var id=f[0];FX[id]=z.fx[id];FXA[id]=z.fxa[id];FXO[id]=z.fxo[id];});fxSave();fxApply(false);fxUI();paint();persist();}
  function useCode(o){
    var r;for(r=0;r<SR;r++){pat[r]=o.g[r];mute[r]=!!(o.mute&1<<r);solo[r]=!!(o.solo&1<<r);if(o.vol)vol[r]=o.vol[r];}
    bpm=o.bpm;sw=o.sw;pre=o.pre;edited=o.ed;title=o.nm;col=o.col||'f';hueUI();
    FXS.forEach(function(f){FX[f[0]]=false;});
    o.fx.forEach(function(x){var F=FXS.filter(function(f){return f[0]===x[0];})[0];FX[x[0]]=true;FXA[x[0]]=x[1];if(F[4]&&F[4].some(function(q){return q[0]===x[2];}))FXO[x[0]]=x[2];});
    fxSave();fxApply(false);persist();
  }
  /* Geteilte Links zeigen immer auf die Website, egal wo die App gerade läuft */
  var SITE='https://asimplemanslab.com/mstr/app/';
  function shareUrl(){return SITE+'?b='+shareCode();}
  /* Handy mit Teilen-Menü: der Link wird gesendet. Rechner: er wird kopiert, und der Knopf sagt das auch */
  function nativeShare(){return !!navigator.share&&matchMedia('(pointer: coarse)').matches;}
  function shareBeat(copied){
    var url=shareUrl(),name=title||(pre>=0?NM[BEATS[pre].n]:'my beat'),note=pat[MIC]&&pat[MIC]!==zero()?' Your recording stays on this device.':'';
    /* Handy: das Teilen-Menü des Systems. Sonst (oder wenn es fehlt) den Link kopieren */
    if(nativeShare()){
      navigator.share({title:name+' · MSTR',text:'Listen to “'+name+'” on MSTR',url:url}).then(function(){closeSheet();if(note)showToast(note.trim());}).catch(function(){});return;}
    function shown(){if(copied)copied();else showToast('Link copied.'+note);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(shown,function(){window.prompt('Copy this link',url);});
    else window.prompt('Copy this link',url);
  }
  /* Ton für die Karte: der Bogen über 8 Takte plus Schlussschlag (Kick und Crash) und Nachklang, offline gerechnet,
     ohne Vorlauf (der Clip fängt leer an). done(AudioBuffer|null) */
  function renderClip(done){
    getAC();var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!ac||!OAC)return done(null);
    if(REC.mic&&!REC.mic.buf){decodeRec('mic');var w=0,iv=setInterval(function(){if(!REC.mic||REC.mic.buf||++w>20){clearInterval(iv);renderClip(done);}},100);return;}
    var six=st(),barT=N*six,sr=ac.sampleRate,n=Math.round(CARD.clipLen(bpm)*sr),off,keep={ac:ac,B:B,bac:_bac,oc:_oc,og:_og,live:FXLIVE},s,k;
    try{
      off=new OAC(2,n,sr);
      ac=off;B=null;_bac=null;_oc=null;bus();FXLIVE=true;fxApply(true);
      for(k=0;k<CARD.NBAR;k++){(function(k){ARR=function(r){return CARD.active(r,k);};})(k);fxTempo();
        if(k===CARD.NBAR-1){play('beat',k*barT,[0,'b',2,gainOf(1)]);play('cym',k*barT,[0,'c',2,gainOf(3)]);}
        else for(s=0;s<N;s++)playStep(s,k*barT+s*six+((s%4===2)?six*sw:0),six,k);}
    }catch(e){off=null;}
    ARR=null;ac=keep.ac;B=keep.B;_bac=keep.bac;_oc=keep.oc;_og=keep.og;FXLIVE=keep.live;
    if(!off)return done(null);
    var p=off.startRendering();
    if(p&&p.then)p.then(done,function(){done(null);});else off.oncomplete=function(e){done(e.renderedBuffer);};
  }
  function baseName(){
    return (title||(pre>=0?NM[BEATS[pre].n]:'MSTR beat')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'MSTR-beat';
  }
  function canSendFile(f){try{return !!(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]}));}catch(e){return false;}}
  function saveFile(f){var u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},4000);}
  /* Teilen: Name und „By“ im Namens-Blatt (Titel antippen; der Würfel schlägt einen Titel aus dem Beat vor),
     „Share video“ im Orbit macht das Video, darunter steht der Link */
  var handle=typeof S.by==='string'?S.by.slice(0,24):'';
  /* Karte: die eingeschalteten Effekte wandern mit ins Bild (Stärke 0–1 und Auswahl), GLASS ist die Durchsichtigkeit der Atome */
  var GLASS=0;
  function cardFx(){var o={};FXS.forEach(function(f){var id=f[0];if(FX[id])o[id]={a:FXA[id]/100,o:FXO[id]};});return o;}
  function cardModel(){return CARD.model(pat.slice(0,7),bpm,sw,cardFx(),col);}
  /* Farbwahl im Orbit: fünf Punkte, die Farbe gehört zum Beat, reist im Link mit und gilt für Orbit und Video (die App bleibt Flieder) */
  var hueRow=$('hue');
  function hueUI(){var on=hueRow.querySelector('[aria-checked="true"]');if(on&&on.dataset.hue===col)return;
    hueRow.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-checked',b.dataset.hue===col?'true':'false');});app.style.setProperty('--orbit',CARD.HUES[col]);}
  function setHue(k){if(!CARD.HUES[k]||k===col)return;col=k;hueUI();persist();if(typeof cardLabel==='function')cardLabel();}
  Object.keys(CARD.HUES).forEach(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.hue=k;b.style.setProperty('--c',CARD.HUES[k]);
    b.setAttribute('aria-label',{f:'Lilac',m:'Mint',k:'Coral',b:'Amber',e:'Ice blue'}[k]);b.title=b.getAttribute('aria-label');b.addEventListener('click',function(){setHue(k);});hueRow.appendChild(b);});
  hueUI();
  function setTitle(v){v=v.replace(/[\u0000-\u001f]/g,'').trim().slice(0,40);if(v!==title){title=v;paint();persist();}}
  function nameSheet(){
    openSheet('<div class="sh-top"><span class="eyebrow" id="sheetT">Name your beat</span>'+XB+'</div>'+
      '<div class="namef"><span class="lbl">Name</span><div class="namer"><strong class="nameo" id="shName"></strong>'+
      '<button type="button" class="pill dice" id="shDice"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Another name</button></div></div>'+
      '<label class="byf"><span class="lbl">By</span><input id="shBy" type="text" maxlength="24" autocomplete="off" placeholder="@you"></label>'+
      '<p class="shnote">Names come from the beat itself: tempo, swing and the loudest track. Both appear on your card, the name also travels with the link.</p>',function(el){
      var out=el.querySelector('#shName'),dice=el.querySelector('#shDice'),diceN=0,m=cardModel();
      /* Ohne Namen bekommt der Beat gleich einen; „Another name“ geht die Vorschläge durch */
      if(!title)setTitle(CARD.title(m,diceN));diceN++;out.textContent=title;
      dice.addEventListener('click',function(){setTitle(CARD.title(m,diceN++));out.textContent=title;});
      var by=el.querySelector('#shBy');by.value=handle;
      by.addEventListener('input',function(){handle=by.value.replace(/[\u0000-\u001f\s]/g,'').slice(0,24);S.by=handle;save();});
      by.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();closeSheet();}});
    },'name','top');
  }
  /* Der Link ist ein runder Knopf neben dem Video-Knopf; die Hinweiszeile darunter antwortet kurz */
  (function(){
    var sb=$('shSend'),sbT=0;
    function sendLabel(){var t=nativeShare()?'Send link':'Copy link';sb.setAttribute('aria-label',t);sb.title=t;sb.classList.remove('ok');}
    sendLabel();window.addEventListener('resize',sendLabel);
    sb.addEventListener('click',function(){shareBeat(function(){
      var own=pat[MIC]&&pat[MIC]!==zero();cardNote('Link copied.'+(own?' Your recording stays on this device.':''));
      sb.classList.add('ok');sb.setAttribute('aria-label','Link copied');clearTimeout(sbT);sbT=setTimeout(function(){sendLabel();cardNote('');},2500);});});
  })();
  /* „Share“ in der Karten-Ansicht: Ton offline rechnen, Video in Echtzeit aufnehmen (die Karten-Ansicht zeigt derweil die Aufnahme),
     dann teilen (Handy) oder sichern (Rechner). Ohne Video gibt es ein Bild. Dieselbe Datei wird beim zweiten Tipp sofort gegeben */
  var cb=$('shCardBtn'),ct=$('shCardT'),cardT=null,cfile=null,ckey='',busyC=false,cardGen=0,video=CARD.canVideo();
  function cardOpts(){return {title:title||(pre>=0?NM[BEATS[pre].n]:'Your beat'),by:handle,preset:pre>=0?NM[BEATS[pre].n]:'',glass:GLASS,file:baseName()+'-'+bpm+'bpm'};}
  /* Der Knopf heißt von Anfang an „Share video“ (Rechner: „Save video“), während der Erstellung „Generating · 12 s“ mit Füllstand;
     die Zeile darunter erklärt jeden Schritt (erst entsteht das Video, dann öffnet sich das Teilen-Menü). Ändert sich der Beat, fängt es von vorn an */
  function cardKey(){var o=cardOpts();return shareCode()+'|'+o.title+'|'+o.by;}
  function cardNote(t){ct.textContent=t;ct.hidden=!t||!molOn;}
  function cardLabel(){if(busyC)return;cb.classList.remove('gen');cb.style.removeProperty('--p');var ready=cfile&&ckey===cardKey(),mob=nativeShare(),secs=Math.round(CARD.clipLen(bpm));
    cb.textContent=video?(mob?'Share video':'Save video'):(mob?'Share image':'Save image');
    if(!video){cardNote(ready?'Ready. Tap to share it again.':'');return;}
    cardNote(ready?(mob?'Ready, '+secs+' s with sound. Tap to share.':'Ready, '+secs+' s with sound. Tap to save it again.'):'');}
  /* Am Handy reist der Link als Text mit dem Video: in Chats kommt beides in einer Nachricht an, Instagram nimmt nur das Video */
  /* Am Handy öffnet erst ein frischer Tipp das Teilen-Menü (iOS verweigert es ohne Geste); verweigert es trotzdem, wird die Datei gesichert */
  function giveCard(f){
    if(navigator.share&&matchMedia('(pointer: coarse)').matches&&canSendFile(f)){
      var t=cardOpts().title;
      navigator.share({files:[f],title:t+' · MSTR',text:t+' · open and remix the beat: '+shareUrl()}).catch(function(e){
        if(e&&e.name==='AbortError')return;
        if(e&&e.name==='NotAllowedError'){cardNote('Tap Share video once more to open the share sheet.');return;}
        saveFile(f);cardNote('Sharing did not work here, saved '+f.name+' instead.');});return;}
    saveFile(f);cardNote('Saved '+f.name+'. Copy the link too, so friends can open the beat.');
  }
  /* Abbruch: auch während der Ton noch gerechnet wird (dann verfällt das Ergebnis) */
  function cardStop(){cardGen++;if(cardT){cardT();cardT=null;}if(busyC){busyC=false;cb.disabled=false;cardLabel();}}
  cb.addEventListener('click',function(){
    if(busyC)return;var o=cardOpts(),key=cardKey(),scene=new CARD.Scene(cardModel());
    if(cfile&&ckey===key)return giveCard(cfile);
    if(!video){CARD.image(scene,o,function(f){if(!f){cardNote('That did not work in this browser.');return;}cfile=f;ckey=key;cardLabel();giveCard(f);});return;}
    busyC=true;setPlay(false);cb.disabled=true;cb.textContent='Preparing sound …';cardNote('One moment.');var gen=++cardGen;
    renderClip(function(buf){
      if(gen!==cardGen)return;
      if(!buf){busyC=false;cb.disabled=false;cardLabel();cardNote('That did not work in this browser.');return;}
      o.mirror=molC;o.mirrorBg=molDark()?'#0E0E0F':'#FFFFFF';cb.classList.add('gen');cardNote('Generating the video with sound. Keep this screen open until it is done, the arrow cancels.');
      cardT=CARD.record(ac,buf,scene,o,function(t,tot){cb.style.setProperty('--p',Math.min(1,t/tot));cb.textContent='Generating · '+Math.ceil(tot-t)+' s';},function(f,why){
        busyC=false;cb.disabled=false;cardT=null;
        if(why==='abort'){cardLabel();return;}
        if(!f){cardLabel();cardNote('Recording did not work here. Saving a picture instead.');CARD.image(scene,o,function(f2){if(f2){cfile=f2;ckey=key;giveCard(f2);}});return;}
        cfile=f;ckey=key;cardLabel();if(!nativeShare())giveCard(f);});
    });
  });
  cardLabel();
  /* Geteilter Link geöffnet: Beat übernehmen, Adresse aufräumen, mit Rückgängig */
  var shared=null;
  (function(){
    var m=/[?&]b=([^&#]*)/.exec(location.search),o=m&&readCode(m[1]);
    if(m)try{history.replaceState(null,'',location.href.split('?')[0]+location.hash);}catch(e){}
    if(o){shared=snap();useCode(o);}
  })();

  /* ---------- Farbschema ---------- */
  var TN={system:'system',light:'light',dark:'dark'};
  /* Das Farbschema wohnt am Ende der Beat-Liste (drei Schalter), nicht mehr im Kopf der Seite */
  function themeUI(){var t=applyTheme();if(molOn)forceDark();var sg=$('themeSeg');if(sg)[].forEach.call(sg.children,function(b){b.setAttribute('aria-pressed',b.dataset.t===t?'true':'false');});}
  if(window.matchMedia)try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',themeUI);}catch(e){}

  build();themeUI();fxUI();playB.innerHTML=I_PLAY;
  if(shared){var before=shared;showToast(title?'“'+title+'” loaded':'Shared beat loaded','Undo',function(){restore(before);});}
  else if(!P&&!S.seen&&!location.hash)vibe();
  /* ---------- Molekül-Ansicht: das Raster gegen das Ring-Molekül der Karte tauschen, live mit dem Beat.
     Schläge kommen aus head() (Schritt, Takt), Mute, Solo und Drop entscheiden mit; steht der Beat, steht das Bild.
     Ein Tipp aufs Molekül bringt das Raster zurück, bearbeitet wird nur dort ---------- */
  var molC=$('mol'),molX=molC.getContext('2d'),vOrbit=$('vOrbit'),vMachine=$('vMachine'),machineRow=$('machineRow'),takes=$('takes'),vibeTxt=$('vibeTxt'),foot=$('cardfoot'),molS=null,molKey='',molRaf=0,molOn=false,molTick=0,molLast=0;
  /* Der Orbit ist immer schwarz, auch wenn das Grid hell ist: solange er an ist, steht die Seite auf dunkel */
  function molDark(){return true;}
  function forceDark(){document.documentElement.setAttribute('data-theme','dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#0E0E0F');}
  function molModel(){var k=shareCode();if(k===molKey&&molS)return;molKey=k;var m=cardModel();
    if(molS)molS.m=m;else{molS=new CARD.Scene(m);molS.clip=false;molS.act=function(r){return audible(r)&&!drop;};}}
  /* Die Farbpunkte sitzen im Bild direkt über dem Titel, bündig mit ihm (Titelstreifen = untere 130 Einheiten) */
  var hueY=0;
  function molSize(){var b=molC.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=Math.round(b.width*d),h=Math.round(b.height*d);
    if(w&&h&&(molC.width!==w||molC.height!==h)){molC.width=w;molC.height=h;}
    var sc=Math.min(b.width/540,b.height/760),y=Math.round(130*sc+48);if(y!==hueY){hueY=y;hueRow.style.transform='translateY(-'+y+'px)';hueRow.style.paddingLeft=Math.round(24*sc-11)+'px';}}
  /* Die Schleife läuft, solange die Ansicht an ist. Ein Fehler beim Zeichnen bricht sie nicht ab, und molGo startet sie
     immer frisch, damit ein liegen gebliebener Frame (etwa nach dem Sperren des Handys) sie nicht blockiert */
  function molDraw(){molRaf=0;if(!molOn)return;molLast=performance.now();
    try{if(!(molTick++%12))molModel();molSize();
      if(playing)molS.time(ac.currentTime-playT0,performance.now());else if(molS.ct>=0)molS.reset();
      var d=molDark(),o=cardOpts();if(!busyC)CARD.view(molX,molC.width,molC.height,molS,{fg:d?'#F3F3F4':'#0F0F10',bg:d?'#0E0E0F':'#FFFFFF',dark:d,title:o.title,by:o.by,preset:o.preset,hint:playing?'':'TAP TO PLAY',edit:canName()});
    }catch(e){}
    molRaf=requestAnimationFrame(molDraw);}
  function molGo(){if(!molOn)return;if(molRaf)cancelAnimationFrame(molRaf);molRaf=requestAnimationFrame(molDraw);}
  function molHit(s,b){if(!molOn||!molS)return;if(performance.now()-molLast>400)molGo();var L=FX.stut&&(b+1)%FXO.stut===0?fxStutLen():0,src=N-L,stu=L&&s>=src,q=stu?src:s,h=[],r;
    if(!drop)for(r=0;r<7;r++)if(pat[r].charAt(q)!=='0'&&audible(r))h.push(r);
    molS.fire({s:q,b:b,h:h,st:stu?1:0},performance.now());
    if(stu)setTimeout(function(){if(molOn&&playing)molS.fire({s:q,b:b,h:h,st:1},performance.now());},st()*500);}
  var transport=document.querySelector('.transport');
    /* Der Orbit ist die Startseite, das Raster ist „die Maschine“ dahinter (S.view 'grid'); Play wandert mit in die Reihe bei Another take */
  function molSet(on){molOn=!!on;if(!molOn)cardStop();app.classList.toggle('molecule',molOn);molC.hidden=!molOn;foot.hidden=!molOn;hueRow.hidden=!molOn;takes.hidden=!molOn;machineRow.hidden=!molOn;vOrbit.hidden=molOn;vibeTxt.hidden=!molOn;
    if(molOn){takes.insertBefore(playB,takes.firstChild);cardLabel();vibeUI();forceDark();}else{transport.insertBefore(playB,transport.firstChild);ct.hidden=true;themeUI();}
    S.view=molOn?'':'grid';save();if(molOn){molModel();molSize();molGo();}}
  function vibeUI(){var t=typeof S.say==='string'?S.say.trim():'';vibeTxt.textContent=t.length>26?t.slice(0,25).trim()+'…':t;}
  vMachine.addEventListener('click',function(){molSet(false);});vOrbit.addEventListener('click',function(){molSet(true);});
  $('takeBtn').addEventListener('click',anotherTake);$('vibeBtn').addEventListener('click',function(){vibe();});
  /* Unterer Streifen (Titel und Zeile) öffnet den Namen, der Rest spielt oder stoppt */
  function molTitleHit(e){var r=molC.getBoundingClientRect(),sc=Math.min(r.width/540,r.height/760);return e.clientY-r.top>r.height-130*sc;}
  /* Wischen über den Orbit (links/rechts) schaltet die Farbe weiter, ein Tipp bleibt ein Tipp: erst ab 40 px quer, und mehr quer als längs */
  var swX=0,swY=0,swOn=false,swiped=false,HK=Object.keys(CARD.HUES);
  function hueStep(d){setHue(HK[(HK.indexOf(col)+d+HK.length)%HK.length]);}
  molC.addEventListener('pointerdown',function(e){swX=e.clientX;swY=e.clientY;swOn=true;swiped=false;});
  molC.addEventListener('pointermove',function(e){if(!swOn||swiped||busyC)return;var dx=e.clientX-swX,dy=e.clientY-swY;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;hueStep(dx<0?1:-1);}});
  molC.addEventListener('pointerup',function(){swOn=false;});molC.addEventListener('pointercancel',function(){swOn=false;swiped=false;});
  molC.addEventListener('click',function(e){if(swiped){swiped=false;return;}if(busyC)return;if(molTitleHit(e)){if(canName())nameSheet();}else setPlay(!playing);});
  molC.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!busyC&&canName())nameSheet();}});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)molGo();});window.addEventListener('pageshow',molGo);
  molSet(S.view!=='grid');

  window.MSTR={name:nameSheet,welcome:vibe,vibe:vibe,take:anotherTake,view:molSet,say:sayBeat,setPlay:setPlay,renderClip:renderClip,card:CARD,code:shareCode,url:shareUrl,hue:setHue,state:function(){return {pat:pat.slice(),bpm:bpm,sw:sw,pre:pre,playing:playing,col:col,fx:JSON.parse(JSON.stringify(FX)),fxa:JSON.parse(JSON.stringify(FXA)),fxo:JSON.parse(JSON.stringify(FXO))};}};
})();
