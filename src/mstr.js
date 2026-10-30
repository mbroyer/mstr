/* ===== MSTR: Raster, Transport, Vorlagen, Spur-Einstellungen ===== */
(function(){
  /* Vorschläge zum Würfeln für Becken, Perc, Toms, FX und die eigene Aufnahme (16 Schritte) */
  var COMMON={cym:['c...............','r.r.r.r.r.r.r.r.','..r...r...r...r.'],click:['1.1.1.1.1.1.1.1.','....2.......2...','3..3..3...3.3...'],toms:['b...p...b...p...','b.......t.t.....','b..b....p...tt..'],fx:['....m.......m...','n.....n...n.....','............z...'],mic:['....a.......a...','a.......a.a.....','..a...a...a.h.t.']};
  var NM={lofi:'Lo-Fi',house:'House',funk:'Funk',rock:'Rock',techno:'Techno',trap:'Trap',onedrop:'One Drop',bossa:'Bossa',dnb:"Drum'n'Bass",shuffle:'Shuffle',reggaeton:'Reggaeton',minimal:'Minimal',twostep:'2-Step'};
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
    bossa:['r.r.r.r.r.r.r.r.','3..3..3...3.3...','..t..t..t..t..t.','................'],
    dnb:['c...............','1.1.1.1.1.1.1.1.','..........p...tt','............z...'],
    shuffle:['r.r.r.r.r.r.r.r.','....2.......2...','..........t..t..','............l...'],
    reggaeton:['c...............','..2...2...2...2.','................','............z...'],
    minimal:['..............h.','......3.......3.','..............t.','............s...'],
    twostep:['................','1.1.1.1.1.1.1.1.','................','............s...']};

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
  var pat,vol=[],mute=[],solo=[],pre=0,edited=false,brush=TRACKS.map(function(t){return t.s[0][0];}),pk=[],lastDice=[];
  var cells=[],rows=[],playing=false,step=0,nextT=0,timer=0,queue=[],raf=0,shown=-1,drop=0;
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
    for(r=3;r<R;r++)if(r!==MIC)pat[r]=dots(X?X[r-3]:COMMON[TRACKS[r].id][0]);bpm=Bt.bpm;sw=Bt.sw;pre=i;edited=false;}
  function num(x,lo,hi,d){x=+x;return isFinite(x)?Math.max(lo,Math.min(hi,x)):d;}
  function arr(a,f,d){var o=[],r;for(r=0;r<R;r++)o.push(Array.isArray(a)&&a.length===R?f(a[r]):d);return o;}

  var P=S.pat;
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
  if(P&&clean(P.g)){pat=clean(P.g);bpm=Math.round(num(P.bpm,60,180,100));sw=num(P.sw,0,.6,0);pre=P.pre|0;if(pre<-1||pre>=BEATS.length)pre=-1;edited=!!P.ed;}
  else{pat=empty();fromBeat(0);}
  vol=arr(P&&P.vol,function(x){return num(x,0,1,.8);},.8);
  mute=arr(P&&P.mute,function(x){return !!x;},false);
  solo=arr(P&&P.solo,function(x){return !!x;},false);
  if(P&&Array.isArray(P.br)&&P.br.length===R)brush=brush.map(function(d,r){return sndIx(r,P.br[r])>=0?P.br[r]:d;});
  function persist(){S.pat={v:4,g:pat,bpm:bpm,sw:sw,vol:vol,mute:mute,solo:solo,pre:pre,ed:edited,br:brush};save();}
  function anySolo(){return solo.some(Boolean);}
  function audible(r){return anySolo()?solo[r]:!mute[r];}
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
      ['M','S'].forEach(function(k){var b=document.createElement('button');b.type='button';b.className='ms '+k.toLowerCase();b.textContent=k;
        b.setAttribute('aria-label',(k==='M'?'Stumm: ':'Solo: ')+T.n);
        b.addEventListener('click',function(){if(k==='M')mute[r]=!mute[r];else solo[r]=!solo[r];paint();persist();});tl.appendChild(b);});
      row.appendChild(tl);
      var steps=document.createElement('div');steps.className='steps';cells.push([]);
      for(var g=0;g<4;g++){var grp=document.createElement('div');grp.className='grp';
        for(var c=0;c<4;c++)(function(s){
          var b=document.createElement('button');b.type='button';b.className='dot';b.setAttribute('aria-label',T.n+', Schritt '+(s+1));
          b.addEventListener('click',function(){
            if(r===MIC&&!REC.mic){trackSheet(r);return;} /* ohne Aufnahme gibt es nichts zu setzen: erst aufnehmen */
            var a=pat[r].split(''),on=a[s]!=='0';a[s]=on?'0':brush[r];pat[r]=a.join('');
            if(!on&&!playing)now(T.id,brush[r],gainOf(r));changed();
          });
          grp.appendChild(b);cells[r][s]=b;
        })(g*4+c);
        steps.appendChild(grp);}
      row.appendChild(steps);tracksEl.appendChild(row);rows.push(row);
    });
    paint();
  }
  function paint(){
    var r,s,so=anySolo();
    for(r=0;r<R;r++){
      var T=TRACKS[r],multi=T.s.length>1;
      for(s=0;s<N;s++){var w=pat[r].charAt(s),b=cells[r][s],on=w!=='0',k=sndIx(r,w);
        b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
        b.textContent=on&&multi&&(T.id==='click'||k>0)?(T.id==='click'?w:String(k+1)):'';}
      rows[r].classList.toggle('quiet',!audible(r));
      rows[r].querySelector('.ms.m').setAttribute('aria-pressed',mute[r]?'true':'false');
      rows[r].querySelector('.ms.s').setAttribute('aria-pressed',solo[r]?'true':'false');
      rows[r].querySelector('.tb').textContent=r===MIC&&!REC.mic?'Eigenen Klang aufnehmen':multi?T.s[sndIx(r,brush[r])][1]:'';
    }
    app.classList.toggle('solo',so);
    $('bpm').textContent=bpm;$('swTxt').textContent='Swing '+Math.round(sw*100)+' %';
    $('preName').textContent=pre>=0?NM[BEATS[pre].n]:'Eigener Beat';
    $('sub').textContent=pre>=0?(edited?'Vorlage, bearbeitet':'Vorlage'):'Ohne Vorlage';
  }
  function changed(){edited=true;paint();persist();}

  /* ---------- Wiedergabe ---------- */
  function head(s){
    var r;
    if(shown>=0)for(r=0;r<R;r++)cells[r][shown].classList.remove('ph');
    shown=s;
    if(s>=0)for(r=0;r<R;r++){cells[r][s].classList.add('ph');if(pat[r].charAt(s)!=='0'&&audible(r)&&!drop)flash(r);}
    /* Taktzähler und Fortschrittslinie folgen dem laufenden Schritt */
    for(r=0;r<beats.length;r++)beats[r].classList.toggle('cur',s>=0&&r===Math.floor(s/4));
    app.style.setProperty('--prog',s<0?0:(s+1)/N);
  }
  /* Das Spur-Icon blinkt kurz in Flieder, wenn die Spur klingt */
  function flash(r){var ic=rows[r].querySelector('.ic');ic.classList.remove('hit');void ic.offsetWidth;ic.classList.add('hit');clearTimeout(ic._t);ic._t=setTimeout(function(){ic.classList.remove('hit');},140);}
  function loop(){
    var nw=ac.currentTime;
    while(queue.length&&queue[0].t<=nw){head(queue[0].s);queue.shift();}
    if(playing)raf=requestAnimationFrame(loop);
  }
  function at(t,f){setTimeout(f,Math.max(0,(t-ac.currentTime)*1000));}
  function sched(){
    var six=st();
    while(nextT<ac.currentTime+.15){
      var s=step,t=nextT+((s%4===2)?six*sw:0),r;
      if(s===0){if(drop===1){drop=2;dropBuild(t,N*six);}else if(drop===2){drop=0;dropBoom(t);}}
      /* Drop: ein Takt Anlauf nur mit Hi-Hat und lauter werdendem Wirbel, die letzten zwei Schritte Stille, dann der Knall */
      if(drop===2){if(s<N-2){play('snare',t,[s,'p',2,.2+.8*s/N]);if(audible(0)&&pat[0].charAt(s)!=='0')play('hats',t,[s,pat[0].charAt(s),2,gainOf(0)]);}}
      else for(r=0;r<R;r++)if(audible(r)){var w=pat[r].charAt(s);if(w!=='0')play(TRACKS[r].id,t,[s,w,2,gainOf(r)]);}
      queue.push({s:s,t:t});
      step=(step+1)%N;nextT+=six;
    }
  }
  function dropBuild(t,bar){
    var f=B.FILT.frequency;f.cancelScheduledValues(t);f.setValueAtTime(320,t);f.exponentialRampToValueAtTime(20000,t+bar*.9);
    var sr=ac.createBufferSource();sr.buffer=B.NZ;sr.loop=true;var bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=3;bp.frequency.setValueAtTime(400,t);bp.frequency.exponentialRampToValueAtTime(7000,t+bar*.85);
    var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+bar*.85);g.gain.exponentialRampToValueAtTime(.0001,t+bar*.88);sr.connect(bp);bp.connect(g);g.connect(B.OUT);send(g,B.REV,.3);sr.start(t);sr.stop(t+bar);
    at(t,function(){app.classList.add('building');});
  }
  function dropBoom(t){
    play('beat',t,[0,'b',2,1]);play('snare',t,[0,'s',2,1]);
    var g=vca(t,.005,.15,.9,.9,B.SAT),o=osc('sine',80,t,t+1.1,g);o.frequency.exponentialRampToValueAtTime(30,t+.9);
    at(t,function(){app.classList.remove('building');dropB.classList.remove('on');});
  }
  function dropReset(){drop=0;app.classList.remove('building');dropB.classList.remove('on');if(B&&ac){var f=B.FILT.frequency,t=ac.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(20000,t);}}
  dropB.addEventListener('click',function(){if(drop)return;if(!playing)setPlay(true);if(!playing)return;drop=1;dropB.classList.add('on');});
  var I_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
      I_STOP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';
  function setPlay(on){
    if(on===playing)return;
    if(on){
      try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();bus();}catch(e){return;}
      playing=true;step=0;nextT=ac.currentTime+.06;queue=[];sched();timer=setInterval(sched,25);raf=requestAnimationFrame(loop);
    }else{
      playing=false;dropReset();clearInterval(timer);cancelAnimationFrame(raf);queue=[];head(-1);
    }
    app.classList.toggle('live',on);
    playB.innerHTML=on?I_STOP:I_PLAY;playB.classList.toggle('on',on);playB.setAttribute('aria-label',on?'Stoppen (Leertaste)':'Abspielen (Leertaste)');
  }
  playB.addEventListener('click',function(){setPlay(!playing);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!sheet.hidden){closeSheet();return;}
    if(e.code!=='Space'||e.repeat)return;var tg=e.target,tn=tg&&tg.tagName;
    if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT'||!sheet.hidden)return;
    e.preventDefault();setPlay(!playing);
  });

  /* ---------- Unterseiten: Spur, Vorlagen, Tempo. Eigener Verlaufseintrag, damit Zurück im Browser funktioniert ---------- */
  var lastFocus=null,pageName='',pushed=false,ignoreHash=false;
  var BACK='<div class="pnav"><button type="button" class="ib" data-close aria-label="Zurück"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="mark"><i aria-hidden="true"></i>MSTR</span><span class="sp"></span></div>';
  /* half: Blatt von unten (Tempo), der Sequencer bleibt darüber sichtbar */
  var catcher=document.createElement('div');catcher.className='catcher';catcher.hidden=true;document.body.appendChild(catcher);
  catcher.addEventListener('click',function(){closeSheet();});
  function openSheet(html,init,name,half){
    lastFocus=document.activeElement;sheet.innerHTML=(half?'<div class="grab" aria-hidden="true"></div>':BACK)+html;sheet.hidden=false;sheet.scrollTop=0;
    sheet.classList.toggle('half',!!half);catcher.hidden=!half;
    if(!half)document.body.classList.add('noscroll');
    sheet.querySelector('[data-close]').addEventListener('click',closeSheet);
    if(init)init(sheet);
    var f=sheet.querySelector('[data-focus]')||sheet.querySelector('button');if(f)f.focus({preventScroll:true});
    pageName=name;if(location.hash!=='#'+name){pushed=true;location.hash=name;}
  }
  function hideSheet(){sheet.hidden=true;catcher.hidden=true;sheet.innerHTML='';document.body.classList.remove('noscroll');if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
  function closeSheet(){if(sheet.hidden)return;hideSheet();if(pushed){pushed=false;ignoreHash=true;history.back();}}
  window.addEventListener('hashchange',function(){if(ignoreHash){ignoreHash=false;return;}if(!sheet.hidden&&location.hash!=='#'+pageName){pushed=false;hideSheet();}});
  var X='',XB='<button type="button" class="ib" data-close aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
  function presetSheet(){
    var order=BEATS.map(function(b,i){return i;}).sort(function(a,b){return BEATS[a].bpm-BEATS[b].bpm||a-b;});
    openSheet('<div class="sh-top"><h2 class="ed" id="sheetT">'+BEATS.length+' Vorlagen<br><em>nach Tempo</em></h2>'+X+'</div><div class="plist" role="listbox" aria-label="Vorlagen"></div>',function(el){
      var list=el.querySelector('.plist');
      order.forEach(function(i){var Bt=BEATS[i],b=document.createElement('button');b.type='button';b.className='pitem'+(i===pre?' sel':'');b.setAttribute('role','option');b.setAttribute('aria-selected',i===pre?'true':'false');
        if(i===pre)b.setAttribute('data-focus','');
        b.innerHTML='<span class="n">'+NM[Bt.n]+'</span><span class="v">'+Bt.bpm+'<small>BPM</small></span>';
        b.addEventListener('click',function(){fromBeat(i);paint();persist();closeSheet();if(!playing)setPlay(true);});list.appendChild(b);});
    },'vorlagen');
  }
  $('preBtn').addEventListener('click',presetSheet);

  function tempoSheet(){
    var taps=[];
    openSheet('<div class="sh-top"><span class="eyebrow" id="sheetT">Tempo und Swing</span>'+XB+'</div>'+
      '<div class="bpmrow"><button type="button" class="ib lg" id="tDown" aria-label="Langsamer">−</button><label class="big" for="tBpm"><input id="tBpm" type="number" inputmode="numeric" min="60" max="180" value="'+bpm+'" aria-label="Tempo in BPM"><small>bpm</small></label><button type="button" class="ib lg" id="tUp" aria-label="Schneller">+</button></div>'+
      '<button type="button" class="pill wide" id="tTap">Tippen für Tempo</button>'+
      '<div class="slider"><div class="lb"><span>Swing auf jedem zweiten Achtel</span><b id="tSwV"></b></div><input type="range" id="tSw" min="0" max="60" step="1" value="'+Math.round(sw*100)+'" aria-label="Swing in Prozent"></div>'+
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

  function trackSheet(r){
    var T=TRACKS[r],id=T.id,mic=r===MIC,busy=false;
    /* Nur die Spur Aufnahme hat das Mikrofon, ganz oben. Die übrigen Spuren klingen immer eingebaut */
    var REC_UI=mic?'<div class="recbox"><div class="rings" aria-hidden="true"><i></i><i></i><i></i></div><button type="button" class="rec" id="kRec" aria-label="Eigenen Klang aufnehmen, 1 Sekunde"><i></i></button>'+
      '<p class="recst" id="kRecSt" aria-live="polite"></p></div>':'';
    openSheet('<div class="sh-top"><div><span class="eyebrow">Spur '+(r+1)+' von '+R+'</span><h2 class="tt" id="sheetT">'+T.n+'</h2></div>'+X+'</div>'+REC_UI+
      '<div class="more" id="kMore">'+
      (T.s.length>1?'<div class="field"><span class="lbl">'+(mic?'Tonhöhe für neue Schritte':'Klang für neue Schritte')+'</span><div class="opts" id="kSnd"></div></div>':'')+
      '<div class="slider"><div class="lb"><span>Lautstärke</span><b id="kVolV"></b></div><input type="range" id="kVol" min="0" max="100" step="1" value="'+Math.round(vol[r]*100)+'" aria-label="Lautstärke '+T.n+'"></div>'+
      '<div class="seg2"><button type="button" id="kMute">Stumm</button><button type="button" id="kSolo">Solo</button></div>'+
      '<div class="acts"><button type="button" class="pill" id="kDice">Vorschlag</button><button type="button" class="pill" id="kClr">Spur leeren</button>'+(mic?'<button type="button" class="pill" id="kDel">Aufnahme löschen</button>':'')+'</div></div>',function(el){
      var vs=el.querySelector('#kVol');
      function ui(){
        el.querySelector('#kVolV').textContent=vs.value+' %';
        el.querySelector('#kMute').setAttribute('aria-pressed',mute[r]?'true':'false');
        el.querySelector('#kSolo').setAttribute('aria-pressed',solo[r]?'true':'false');
        if(mic){var has=!!REC.mic;el.querySelector('#kMore').hidden=!has;
          if(!busy)el.querySelector('#kRecSt').textContent=has?'Dein Klang ist gespeichert. Tippen zum Neuaufnehmen.':'Nimm 1 Sekunde auf: klatschen, schnipsen, ein Wort, ein Glas.';}
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
  $('clr').addEventListener('click',function(){
    undo={g:pat.slice(),pre:pre,ed:edited};pat=empty();pre=-1;edited=false;paint();persist();
    showToast('Alle Spuren geleert','Rückgängig',function(){pat=undo.g;pre=undo.pre;edited=undo.ed;paint();persist();});
  });

  /* ---------- Farbschema ---------- */
  var TN={system:'wie System',light:'hell',dark:'dunkel'};
  function themeUI(){var t=applyTheme();$('theme').setAttribute('aria-label','Farbschema: '+TN[t]);$('theme').title='Farbschema: '+TN[t];}
  $('theme').addEventListener('click',function(){var t=THEMES.indexOf(S.theme);S.theme=THEMES[(t<0?1:t+1)%3];save();themeUI();});
  if(window.matchMedia)try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',themeUI);}catch(e){}

  build();themeUI();playB.innerHTML=I_PLAY;
  window.MSTR={setPlay:setPlay,state:function(){return {pat:pat.slice(),bpm:bpm,sw:sw,pre:pre,playing:playing};}};
})();
