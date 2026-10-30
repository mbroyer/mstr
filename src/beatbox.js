/* ===== Monster-Beatbox: der Beat-Baukasten. Jede Reihe ist ein Monster mit einem Mund-Geräusch. ===== */
(function(){
  /* Reihen: id und Monsterstufe (Index in STAGES, bestimmt das Aussehen). Alle Reihen sind von Anfang an offen. */
  var MON=[
    {id:'hats',st:1},{id:'beat',st:0},{id:'clap',st:3},{id:'snare',st:4},
    {id:'click',st:5},{id:'toms',st:8},{id:'fx',st:12}];
  var BLK={hats:[['x','ts'],['o','tsss'],['k','tk']],beat:[['b','B']],clap:[['c','tschak']],snare:[['p','Pf'],['k','K'],['s','Pssh']],
    click:[['1','1'],['2','2'],['3','3'],['4','4'],['5','5']],toms:[['b','Bumm'],['p','Zack'],['t','Dum'],['c','Tsching']],fx:[['m','dum'],['n','dun'],['s','Pssh'],['l','brrr'],['z','zipp']]};
  var SYL={hats:{x:'ts',o:'tsss',k:'tk'},beat:{b:'B'},clap:{c:'tschak'},snare:{p:'Pf!',k:'K!',s:'Pssh'},click:{1:'tok',2:'tok',3:'tok',4:'tok',5:'tok'},toms:{b:'Bumm',p:'Zack',t:'Dum',c:'Tsching'},fx:{s:'Pssh',m:'dum',n:'dun',l:'brrr',z:'zipp'}};
  /* Vorschläge für die drei oberen Reihen (16 Schritte) */
  var COMMON={click:['1..3..5...4.3...','1.3.5.3.1.3.5.4.','5..4..3.1..3..5.'],toms:['b...p...b...p...','b.......t.t.c...','b..b....p...tt..'],fx:['s.......m.m.n.n.','s...m...s.n.lll.','z.......s...m.n.']};
  var NM={boombap:'Boom Bap',house:'House',funk:'Funk',rock:'Rock',techno:'Techno',trap:'Trap',disco:'Disco',bossa:'Bossa',dnb:"Drum'n'Bass",shuffle:'Shuffle',afro:'Afro',minimal:'Minimal',hardtechno:'Hardtechno'};
  var introSeen=false;
  function sndFix(id,str){return str;}
  var PENT=[0,57,60,62,64,67],RATE=[1,.84,1.19,1.33,1.5];
  function hz(m){return 440*Math.pow(2,(m-69)/12);}
  function blkIx(id,w){var b=BLK[id],i;for(i=0;i<b.length;i++)if(b[i][0]===w)return i;return -1;}
  function lbl(id,w){var i=blkIx(id,w);return i<0?'':(BLK[id][i][1]==='tschak'?'tsch':BLK[id][i][1]);}
  function syl(id,w){return SYL[id]&&SYL[id][w]||'';}
  var bc=document.getElementById('beatCard');
  var grid=document.getElementById('dmGrid'),pre=document.getElementById('dmPre'),playB=document.getElementById('dmPlay'),bpmEl=document.getElementById('dmBpm'),secEl=document.getElementById('dmSec'),secList=document.getElementById('dmSecList');
  var N=16,R=MON.length,pat,bpm,sw=0,found={},own=false,pk=[],lastDice=[];
  var drop=0,cells=[],mons=[],playing=false,step=0,nextT=0,timer=0,queue=[],raf=0,shown=-1,dark=false,curPre=-1;
  function mir(){return !!S.kurz;}                   /* Kurzer Takt: nur 8 Felder, die zweite Hälfte wiederholt die erste */
  function vis(){return mir()?8:N;}
  function openRow(r){return true;}
  function st(){return 60/(dark?bpm*.8:bpm)/4;}
  function empty(){var a=[],r;for(r=0;r<R;r++)a.push(new Array(N+1).join('0'));return a;}
  function clean(g){
    if(!Array.isArray(g)||g.length!==R)return null;
    return g.map(function(x,r){if(typeof x!=='string'||x.length!==N)return new Array(N+1).join('0');
      return x.split('').map(function(ch){return blkIx(MON[r].id,ch)>=0?ch:'0';}).join('');});
  }
  function rowFromBeat(B,id){
    var o='',k;
    for(k=0;k<N;k++){var K=B.K.charAt(k),Sn=B.S.charAt(k),H=B.H.charAt(k);
      o+=id==='beat'?(K==='x'?'b':'0'):id==='snare'?(Sn==='x'?'p':Sn==='o'?'k':'0'):id==='clap'?(Sn==='c'?'c':'0'):(H==='x'?'x':H==='O'?'o':H==='o'?'k':'0');}
    return o;
  }
  /* Die oberen Monster bekommen je Vorlage eigene Stimmen: Zungenklick, Schlagzeug, Effekte (16 Schritte) */
  var EXTRA={
    boombap:['1..3..5...4.3...','........t.t.....','............l...'],
    house:['..3...5...3...1.','............c...','z...............'],
    funk:['1.3.5.3.1.3.5.4.','......t.......p.','..............s.'],
    rock:['5...3...5...3.1.','..........t.t.c.','s...............'],
    techno:['1...1...1...1...','............tt..','z.......s.......'],
    trap:['5..4..3.1..3..5.','......t.......tt','........s.....l.'],
    disco:['..5...3...5...1.','....c.......c...','..............z.'],
    bossa:['1..3..5.1..3..4.','..t..t..t..t..t.','........m...n...'],
    dnb:['1.3.5.4.3.1.5.3.','..........p...tt','s.......s.......'],
    shuffle:['1..1..3..3..5..5','..........t..t..','............l...'],
    afro:['1.3.4.3.5.3.4.3.','t..t..t.t..t..t.','..............s.'],
    minimal:['......3.......1.','..............t.','z...............'],
    hardtechno:['1...1...1...1.1.','............c.c.','s.......s...l...']};
  function fromBeat(i){var B=BEATS[i],r,ex=EXTRA[B.n]||COMMON;for(r=0;r<4;r++)pat[r]=rowFromBeat(B,MON[r].id);
    for(r=4;r<R;r++){var src=EXTRA[B.n]?ex[r-4]:COMMON[MON[r].id][0];pat[r]=sndFix(MON[r].id,src.split('').map(function(ch){return ch==='.'?'0':ch;}).join(''));}for(r=0;r<4;r++)pat[r]=sndFix(MON[r].id,pat[r]);bpm=B.bpm;sw=B.sw;}
  /* Alter Stand (4 Reihen Kick, Snare, Clap, Hat aus 0/1) wird übernommen */
  function migrate(){
    var g=S.pat&&S.pat.g;
    if(!S.pat||!Array.isArray(g))return false;
    if(g.length===5&&g.every(function(x){return typeof x==='string'&&x.length===N;}))g=g.slice(0,4).map(function(x,i){if(i!==3)return x;return x.split('').map(function(ch,k){return ch==='1'||g[4].charAt(k)==='1'?'1':'0';}).join('');});
    if(g.length!==4||!g.every(function(x){return typeof x==='string'&&x.length===N&&/^[01]+$/.test(x);}))return false;
    pat=empty();pat[0]=g[3].replace(/1/g,'x');pat[1]=g[0].replace(/1/g,'b');pat[2]=g[2].replace(/1/g,'c');pat[3]=g[1].replace(/1/g,'p');
    bpm=Math.max(60,Math.min(180,S.pat.bpm|0||100));sw=+S.pat.sw||0;own=true;return true;
  }
  if(S.pat&&S.pat.v===2&&clean(S.pat.g)){pat=clean(S.pat.g);bpm=Math.max(60,Math.min(180,S.pat.bpm|0||100));sw=+S.pat.sw||0;found=(S.pat.f&&typeof S.pat.f==='object')?S.pat.f:{};own=!!S.pat.own;introSeen=!!S.pat.i;}
  else if(migrate()){S.pat={v:2,g:pat,bpm:bpm,sw:sw,f:found,own:own};save();}
  else{pat=empty();fromBeat(0);}
  function persist(){S.pat={v:2,g:pat,bpm:bpm,sw:sw,f:found,own:own,i:introSeen};save();}
  function anyOn(){var r,s;for(r=0;r<R;r++)if(openRow(r))for(s=0;s<vis();s++)if(pat[r].charAt(s)!=='0')return true;return false;}

  /* ---------- Klang: Mund-Geräusche (Luft, Lippen, Zunge) über einen eigenen Bus in den App-Ausgang ---------- */
  var B=null,_bac=null;
  function bus(){
    getAC();if(!ac)return null;if(_bac===ac&&B)return B;_bac=ac;B={};var i;
    B.OUT=ac.createGain();B.OUT.gain.value=.9;B.FILT=ac.createBiquadFilter();B.FILT.type='lowpass';B.FILT.frequency.value=dark?1100:20000;B.FILT.Q.value=.7;B.OUT.connect(B.FILT);B.FILT.connect(OUT());
    B.DUCK=ac.createGain();B.DUCK.connect(B.OUT);
    var len=ac.sampleRate*1.1|0,ir=ac.createBuffer(2,len,ac.sampleRate),ch;for(ch=0;ch<2;ch++){var d=ir.getChannelData(ch);for(i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);}
    B.REV=ac.createConvolver();B.REV.buffer=ir;var rg=ac.createGain();rg.gain.value=.25;B.REV.connect(rg);rg.connect(B.OUT);
    B.DLY=ac.createDelay(2);var fb=ac.createGain(),lp=ac.createBiquadFilter(),dg=ac.createGain();lp.type='lowpass';lp.frequency.value=2800;fb.gain.value=.3;dg.gain.value=.25;
    B.DLY.connect(lp);lp.connect(fb);fb.connect(B.DLY);lp.connect(dg);dg.connect(B.OUT);
    B.SAT=ac.createWaveShaper();var cv=new Float32Array(1024);for(i=0;i<1024;i++){var x=i/512-1;cv[i]=Math.tanh(x*2.5)/Math.tanh(2.5);}B.SAT.curve=cv;var sg=ac.createGain();sg.gain.value=.8;B.SAT.connect(sg);sg.connect(B.OUT);
    B.NZ=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var c=B.NZ.getChannelData(0);for(i=0;i<c.length;i++)c[i]=Math.random()*2-1;
    return B;
  }
  function send(node,dest,amt){var g=ac.createGain();g.gain.value=amt;node.connect(g);g.connect(dest);}
  function vca(t,a,hold,rel,v,dest){var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+a);if(hold>0)g.gain.setValueAtTime(Math.max(.0002,v),t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel);g.connect(dest||B.OUT);return g;}
  function nz(t,d,v,type,f,q,rev,dest){var s=ac.createBufferSource();s.buffer=B.NZ;var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||.8;var g=vca(t,.001,0,d,v,dest);s.connect(fl);fl.connect(g);if(rev)send(g,B.REV,rev);s.start(t,Math.random()*.4);s.stop(t+d+.05);return g;}
  function osc(type,f,t,end,dest){var o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(dest);o.start(t);o.stop(end);return o;}
  function duck(t){B.DUCK.gain.cancelScheduledValues(t);B.DUCK.gain.setValueAtTime(.5,t);B.DUCK.gain.linearRampToValueAtTime(1,t+st()*2);}
  /* Die alten Trommelklänge aus drumBeat, hier über den Beatbox-Bus */
  var dr={
    kick:function(t,v){var g=vca(t,.001,0,.28,v);var o=osc('sine',150,t,t+.3,g);o.frequency.exponentialRampToValueAtTime(42,t+.16);},
    noise:function(t,v,len,hp){var s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=vca(t,.001,0,len,v);s.buffer=B.NZ;f.type='highpass';f.frequency.value=hp;s.connect(f);f.connect(g);s.start(t,Math.random()*.4);s.stop(t+len+.05);},
    snare:function(t,v){dr.noise(t,v,.16,1800);var g=vca(t,.001,0,.12,v*.6);var o=osc('triangle',220,t,t+.14,g);o.frequency.exponentialRampToValueAtTime(140,t+.08);send(g,B.REV,.15);},
    tom:function(t,f,v){var g=vca(t,.001,0,.25,v);var o=osc('sine',f,t,t+.28,g);o.frequency.exponentialRampToValueAtTime(f*.55,t+.2);send(g,B.REV,.25);},
    clap:function(t,v){var k;for(k=0;k<3;k++)dr.bp(t+k*.011,v,.07,1200);dr.bp(t+.035,v,.14,1500);},
    bp:function(t,v,len,f){var s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=vca(t,.001,0,len,v);s.buffer=B.NZ;fl.type='bandpass';fl.frequency.value=f;s.connect(fl);fl.connect(g);s.start(t,Math.random()*.4);s.stop(t+len+.05);}
  };
  function playSynth(id,t,n){
    var len=n[2]*st(),v=n[3],w=n[1],six=st();
    if(id==='beat'){var kl=bpm>=128?.38:.22;
      var g=vca(t,.001,0,kl,1.05*v,kl>.3?B.SAT:B.OUT);var o=osc('sine',150,t,t+kl+.05,g);o.frequency.exponentialRampToValueAtTime(kl>.3?44:52,t+.07);
      nz(t,.018,.9*v,'lowpass',450,1);nz(t,.006,.25*v,'bandpass',2200,1);
      var gb=vca(t,.002,0,.06,.25*v),lb=ac.createBiquadFilter();lb.type='lowpass';lb.frequency.value=320;lb.connect(gb);osc('sawtooth',75,t,t+.08,lb);duck(t);}
    else if(id==='hats'){
      if(w==='o'){nz(t,.004,.3*v,'highpass',3000);nz(t+.004,.26,.28*v,'bandpass',6800,1.2,.1);}
      else if(w==='k'){nz(t,.025,.35*v,'bandpass',3400,3);}
      else{nz(t,.004,.35*v,'highpass',3000);nz(t+.003,.045,.32*v,'bandpass',7200,1.3);}}
    else if(id==='clap'){[0,.009,.019].forEach(function(o2,i){nz(t+o2,.012,.5*v,'bandpass',1400+i*300,1.6)});nz(t+.026,.16,.5*v,'bandpass',3200,.8,.25);}
    else if(id==='snare'){
      if(w==='p'){nz(t,.014,.8*v,'lowpass',900,1);nz(t+.008,.16,.6*v,'bandpass',2300,.7,.18);var gp=vca(t,.001,0,.05,.18*v);osc('triangle',240,t,t+.07,gp);}
      else if(w==='k'){nz(t,.007,.6*v,'highpass',4000);nz(t+.004,.08,.7*v,'bandpass',1700,2.2,.15);var gk=vca(t,.001,0,.04,.2*v);osc('triangle',420,t,t+.06,gk);}
      else{nz(t,.012,.7*v,'lowpass',900,1);nz(t+.01,.45,.45*v,'bandpass',4300,.8,.3);}}
    else if(id==='click'){var fc=hz(PENT[+w]+12),gc=vca(t,.001,0,.08,.45*v,B.DUCK);var oc=osc('sine',fc*.55,t,t+.1,gc);oc.frequency.exponentialRampToValueAtTime(fc,t+.016);nz(t,.006,.25*v,'bandpass',fc*3,2,0,B.DUCK);send(gc,B.DLY,.25);send(gc,B.REV,.15);}
    else if(id==='toms'){if(w==='b'){dr.kick(t,.8*v);duck(t);}else if(w==='p')dr.snare(t,.5*v);else if(w==='t'){dr.tom(t,150,.55*v);}else{dr.noise(t,.3*v,.9,5000);}}
    else if(id==='fx'){
      if(w==='s')playSynth('snare',t,[0,'s',1,v]);
      else if(w==='m'||w==='n'){var hi2=w==='m',gt=vca(t,.003,0,.22,.7*v);var ot=osc('sine',hi2?230:150,t,t+.3,gt);ot.frequency.exponentialRampToValueAtTime(hi2?150:95,t+.18);nz(t,.02,.4*v,'lowpass',700,1);send(gt,B.REV,.25);}
      else if(w==='l'){var gl=vca(t,.004,0,six*2.2,.5*v),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(gl);var am=ac.createGain();am.gain.value=.5;am.connect(lp);var lf=ac.createOscillator(),lg=ac.createGain();lf.type='square';lf.frequency.value=32;lg.gain.value=.5;lf.connect(lg);lg.connect(am.gain);lf.start(t);lf.stop(t+.25);var sr=ac.createBufferSource();sr.buffer=B.NZ;sr.connect(am);sr.start(t,Math.random()*.4);sr.stop(t+.25);osc('sawtooth',90,t,t+.25,am);}
      else if(w==='z'){var gz=vca(t,.01,six*3,.04,.35*v),bz=ac.createBiquadFilter();bz.type='bandpass';bz.Q.value=4;bz.frequency.setValueAtTime(600,t);bz.frequency.exponentialRampToValueAtTime(6000,t+six*3.6);bz.connect(gz);var sz=ac.createBufferSource();sz.buffer=B.NZ;sz.connect(bz);sz.start(t,Math.random()*.4);sz.stop(t+.5);send(gz,B.REV,.3);}}
  }
  /* ---------- Eigene Geräusche: 1 Sekunde aufnehmen, Stille abschneiden, als Stimme des Monsters spielen (nur auf diesem Gerät) ---------- */
  var REC={},ownV={};
  try{MON.forEach(function(m){var s=localStorage.getItem('beatbox-rec-'+m.id);if(s){ownV[m.id]=localStorage.getItem('beatbox-own-'+m.id)!=='0';REC[m.id]={b64:s};}});}catch(e){}
  function b64buf(s){var bin=atob(s),a=new Uint8Array(bin.length),i;for(i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer;}
  function trimBuf(buf){var d=buf.getChannelData(0),sr=buf.sampleRate,peak=0,i;for(i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));if(peak<.01)return null;
    var th=peak*.12,a=0,b=d.length-1;while(a<d.length&&Math.abs(d[a])<th)a++;while(b>a&&Math.abs(d[b])<th*.5)b--;a=Math.max(0,a-sr*.01|0);b=Math.min(d.length,b+sr*.08|0,a+sr*.7|0);
    var out=ac.createBuffer(1,b-a,sr),o=out.getChannelData(0),g=.9/peak;for(i=a;i<b;i++)o[i-a]=d[i]*g;var f=sr*.01|0;for(i=0;i<f;i++){o[i]*=i/f;o[out.length-1-i]*=i/f;}return out;}
  function decodeRec(id){var r=REC[id];if(!r||r.buf||r.busy||!ac)return;r.busy=true;ac.decodeAudioData(b64buf(r.b64)).then(function(buf){r.buf=trimBuf(buf)||buf;r.busy=false;}).catch(function(){r.busy=false;delete REC[id];});}
  function wavB64(buf){var d=buf.getChannelData(0),st=buf.sampleRate>=44100?2:1,sr=buf.sampleRate/st,n=Math.floor(d.length/st),ab=new ArrayBuffer(44+n*2),v=new DataView(ab),i;
    function w(o,t){for(var j=0;j<t.length;j++)v.setUint8(o+j,t.charCodeAt(j));}
    w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
    for(i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i*st]));v.setInt16(44+i*2,x*32767,true);}
    var u=new Uint8Array(ab),bin='';for(i=0;i<u.length;i+=8192)bin+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(bin);}
  function useOwn(id){return !!(REC[id]&&ownV[id]);}
  function playRec(id,t,n){var r=REC[id];if(!r.buf){decodeRec(id);return playSynth(id,t,n);}var s=ac.createBufferSource();s.buffer=r.buf;var k=Math.max(0,blkIx(id,n[1]));s.playbackRate.value=id==='click'?Math.pow(2,(PENT[+n[1]]-60)/12):RATE[k%5];
    var g=vca(t,.003,0,.06,.9*n[3],id==='beat'?B.SAT:B.DUCK);s.connect(g);s.start(t);if(id==='beat')duck(t);send(g,B.REV,.15);}
  function play(id,t,n){if(!bus())return;if(useOwn(id))return playRec(id,t,n);playSynth(id,t,n);}
  function now(id,w){try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();play(id,ac.currentTime+.02,[0,w,2,1]);}catch(e){}}
  function micPanel(r){
    var m=MON[r],id=m.id,nm=STAGES[m.st].name,p=document.createElement('div');p.className='dmmicp';
    p.innerHTML='<b>🎤 '+nm+' mit deiner Stimme</b><div class="st"></div>';
    var stE=p.querySelector('.st');function sayS(s,rec){stE.textContent=s;stE.classList.toggle('rec',!!rec);}
    sayS(REC[id]?'Du hast schon ein Geräusch aufgenommen.':'Mach ein Geräusch wie „'+BLK[id][0][1]+'“!');
    var go=document.createElement('button');go.type='button';go.className='go';go.textContent='● Aufnehmen (1 Sekunde)';p.appendChild(go);
    var hear=document.createElement('button');hear.type='button';hear.textContent='▶ Anhören';hear.disabled=!REC[id];p.appendChild(hear);
    var tog=document.createElement('button');tog.type='button';tog.disabled=!REC[id];p.appendChild(tog);
    function tt(){tog.textContent=ownV[id]?'Monster-Stimme nehmen':'Meine Stimme nehmen';}tt();
    var cl=document.createElement('button');cl.type='button';cl.textContent='Fertig';p.appendChild(cl);bc.appendChild(p);
    cl.onclick=function(){p.remove();build();};
    hear.onclick=function(){getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();bus();if(REC[id]&&REC[id].buf)playRec(id,ac.currentTime+.02,[0,BLK[id][0][0],2,1]);else decodeRec(id);};
    tog.onclick=function(){ownV[id]=!ownV[id];try{localStorage.setItem('beatbox-own-'+id,ownV[id]?'1':'0')}catch(e){}tt();};
    go.onclick=function(){getAC();if(!ac){sayS('Ton geht hier gerade nicht.');return;}if(ac.state==='suspended')ac.resume();bus();
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){sayS('Hier geht das Mikrofon nicht.');return;}
      go.disabled=true;sayS('Mikrofon …');
      /* Aufnahme direkt als Samples über Web Audio statt MediaRecorder: Safari auf dem iPad liefert dort MP4, das sich oft nicht dekodieren lässt */
      navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}}).then(function(stream){
        if(ac.state!=='running')ac.resume();
        var src=ac.createMediaStreamSource(stream),proc=ac.createScriptProcessor(2048,1,1),mute=ac.createGain(),parts=[],on=false;mute.gain.value=0;
        proc.onaudioprocess=function(e){if(on)parts.push(new Float32Array(e.inputBuffer.getChannelData(0)));};
        src.connect(proc);proc.connect(mute);mute.connect(ac.destination);
        function fin(){on=false;try{src.disconnect();proc.disconnect();mute.disconnect();}catch(e){}stream.getTracks().forEach(function(tr){tr.stop()});
          setTimeout(function(){if(ac.state!=='running')ac.resume();},300);
          var n=0,k,o=0;parts.forEach(function(x){n+=x.length;});if(!n){sayS('Das hat nicht geklappt. Noch mal?');go.disabled=false;return;}
          var raw=ac.createBuffer(1,n,ac.sampleRate),d=raw.getChannelData(0);for(k=0;k<parts.length;k++){d.set(parts[k],o);o+=parts[k].length;}
          var tb=trimBuf(raw);if(!tb){sayS('Das war zu leise. Noch mal?');go.disabled=false;return;}
          var b64=wavB64(tb);REC[id]={b64:b64,buf:tb};ownV[id]=true;
          try{localStorage.setItem('beatbox-rec-'+id,b64);localStorage.setItem('beatbox-own-'+id,'1')}catch(e){}
          sayS('Super! So klingt es:');setTimeout(function(){playRec(id,ac.currentTime+.05,[0,BLK[id][0][0],2,1]);},350);hear.disabled=tog.disabled=false;tt();go.disabled=false;}
        sayS('3');setTimeout(function(){sayS('2')},500);setTimeout(function(){sayS('1')},1000);setTimeout(function(){sayS('● Jetzt!',true);on=true;setTimeout(function(){fin();sayS('…')},1100);},1500);})
      .catch(function(){sayS('Kein Mikrofon erlaubt. Bitte in den Einstellungen erlauben.');go.disabled=false;});};
  }
  /* ---------- Geheimnisse ---------- */
  function half(r){var n=vis(),h=n/2,c=pat[r],i,k=0;var all=true;for(i=1;i<n;i++)if(c.charAt(i)!==c.charAt(0))all=false;if(all)return false;for(i=0;i<h;i++){if(c.charAt(i)!==c.charAt(i+h))return false;if(c.charAt(i)!=='0')k++;}return k>=2;}
  function full(r){var n=vis(),c=pat[r],i;if(c.charAt(0)==='0')return false;for(i=1;i<n;i++)if(c.charAt(i)!==c.charAt(0))return false;return true;}
  var SEC=[
    {k:'groove',t:'Boots and Cats!',d:'Ei auf 1 und 3, Stachling auf 2 und 4',f:function(){if(!openRow(3))return false;var q=vis()/4,b=pat[1],s=pat[3];return b.charAt(0)!=='0'&&b.charAt(2*q)!=='0'&&s.charAt(q)!=='0'&&s.charAt(3*q)!=='0';}},
    {k:'echo',t:'Echo!',d:'Zwei Reihen, deren zweite Hälfte die erste wiederholt',f:function(){var r,k=0;for(r=0;r<R;r++)if(openRow(r)&&half(r))k++;return k>=2;}},
    {k:'treppe',t:'Treppe!',d:'Flatterling klickt 1 2 3 4 5 der Reihe nach',f:function(){if(!openRow(4))return false;return pat[4].slice(0,vis()).replace(/0/g,'').indexOf('12345')>=0;}},
    {k:'schatten',t:'Schattenmodus!',d:'Drei Reihen ganz voll mit demselben Geräusch',f:function(){var r,k=0;for(r=0;r<R;r++)if(openRow(r)&&full(r))k++;return k>=3;}}];
  function nFound(){return SEC.filter(function(s){return found[s.k]}).length;}
  function secUI(){secEl.innerHTML=(nFound()?'🔓':'🔒')+' '+nFound()+'/'+SEC.length;secEl.setAttribute('aria-label','Geheimnisse '+nFound()+' von '+SEC.length);
    secList.innerHTML='';SEC.forEach(function(s){var d=document.createElement('div');d.className='dmsecrow'+(found[s.k]?' on':'');d.innerHTML=found[s.k]?'<b>'+s.t+'</b><small>'+s.d+'</small>':'<b>???</b><small>Noch nicht gefunden</small>';secList.appendChild(d);});}
  function checkSecrets(){SEC.forEach(function(s){var on=s.f();if(on&&!s.now){s.now=true;at(nextT,function(){celebrateSec(s)});}else if(!on)s.now=false;});}
  function at(t,f){setTimeout(f,Math.max(0,(t-ac.currentTime)*1000));}
  function celebrateSec(s){
    var neu=!found[s.k];found[s.k]=1;persist();if(s.k==='schatten')setDark(true);secUI();
    var b=document.createElement('div');b.className='dmbanner';b.innerHTML=(neu?'🔓 ':'')+s.t+'<small>'+s.d+'</small>';bc.appendChild(b);setTimeout(function(){b.remove()},2600);
    if(!dark){mood('joy');setTimeout(function(){mood(null)},1800);}
    var cols=['#ff4f9a','#ffc21f','#6fe0d0','#b8f56a','#a98bff'],i;for(i=0;i<30;i++){var c=document.createElement('i');c.className='dmconf';c.style.left=(Math.random()*100)+'%';c.style.background=cols[i%5];c.style.setProperty('--dx',(Math.random()*120-60)+'px');c.style.setProperty('--r',(Math.random()*720)+'deg');c.style.animationDelay=(Math.random()*.4)+'s';bc.appendChild(c);setTimeout(function(c){c.remove()}.bind(null,c),2400);}
    try{if(ac&&bus())nz(ac.currentTime,1.2,.06,'bandpass',2500,.6,.4);}catch(e){}
  }
  function mood(m){mons.forEach(function(el,r){if(el)el.innerHTML=monsterSvg(MON[r].st,dark?'sad':m);});}
  function setDark(on){if(dark===on)return;dark=on;bc.classList.toggle('dark',on);mood(null);paint();
    if(ac&&B){var t=ac.currentTime;B.FILT.frequency.cancelScheduledValues(t);B.FILT.frequency.setValueAtTime(B.FILT.frequency.value,t);B.FILT.frequency.exponentialRampToValueAtTime(on?1100:20000,t+.8);}}
  function changed(){own=true;if(dark&&!SEC[3].f())setDark(false);paint();persist();}

  /* ---------- Aufbau ---------- */
  function word(r,w){var el=mons[r];if(!el||!w)return;var n=el.querySelector('.dmword');if(!n){n=document.createElement('span');n.className='dmword';el.appendChild(n);}n.textContent=w;n.classList.remove('go');void n.offsetWidth;n.classList.add('go');}
  function dance(r){var el=mons[r];if(!el)return;var cls=useOwn(MON[r].id)?'d-own':'d-'+MON[r].id;el.className=el.className.replace(/ ?d-\w+/g,'');void el.offsetWidth;el.classList.add(cls);clearTimeout(el._dt);el._dt=setTimeout(function(){el.classList.remove(cls)},380);}
  function dice(r){
    var id=MON[r].id,ix;
    if(r<4){do{ix=Math.floor(Math.random()*BEATS.length);}while(ix===lastDice[r]);lastDice[r]=ix;pat[r]=sndFix(id,rowFromBeat(BEATS[ix],id));}
    else{pk[r]=((pk[r]||0)+1)%3;pat[r]=sndFix(id,COMMON[id][pk[r]].split('').map(function(ch){return ch==='.'?'0':ch;}).join(''));}
    if(mir())pat[r]=pat[r].slice(0,8)+pat[r].slice(0,8);
    changed();
  }
  function build(){
    grid.innerHTML='';cells=[];mons=[];var n=vis();
    MON.forEach(function(M,r){
      cells.push([]);mons.push(null);
      var blk=document.createElement('div');blk.className='dmblk';
      var mo=document.createElement('div');mo.className='dmmon'+(useOwn(M.id)?' own':'');mo.innerHTML=monsterSvg(M.st,dark?'sad':null);mo.setAttribute('role','button');mo.setAttribute('aria-label',STAGES[M.st].name+' macht sein Geräusch');mo.tabIndex=0;
      mo.addEventListener('click',function(){now(M.id,brush[r]);dance(r);word(r,syl(M.id,brush[r])||'!');});
      blk.appendChild(mo);mons[r]=mo;
      [0,1].forEach(function(h){
        if(h&&n===8)return;
        var row=document.createElement('div');row.className='dmrow h'+h;var c;
        for(c=0;c<8;c++)(function(s){
          var b=document.createElement('button');b.type='button';b.className='dmc g'+((s>>2)&1);b.setAttribute('aria-label','Feld '+(s+1));
          b.addEventListener('click',function(){
            var a=pat[r].split(''),on=a[s]!=='0';a[s]=on?'0':brush[r];if(n===8)a[s+8]=a[s];pat[r]=a.join('');
            if(!on&&!playing)now(M.id,brush[r]);changed();
          });
          row.appendChild(b);cells[r][s]=b;
        })(h*8+c);
        blk.appendChild(row);
      });
      var tl=document.createElement('div');tl.className='dmtools';
      if(BLK[M.id].length>1)BLK[M.id].forEach(function(bk,k){var b=document.createElement('button');b.type='button';b.className='dmbr c'+(k%5);b.textContent=bk[1];b.setAttribute('aria-pressed',brush[r]===bk[0]?'true':'false');
        b.addEventListener('click',function(){brush[r]=bk[0];now(M.id,bk[0]);dance(r);var k2=tl.querySelectorAll('.dmbr');[].forEach.call(k2,function(x,j){x.setAttribute('aria-pressed',j===k?'true':'false');});});tl.appendChild(b);});
      var dc=document.createElement('button');dc.type='button';dc.className='dmdice';dc.textContent='🎲';dc.setAttribute('aria-label','Vorschlag für '+STAGES[M.st].name);dc.addEventListener('click',function(){dice(r);if(!playing)setPlay(true);});tl.appendChild(dc);
      var mc=document.createElement('button');mc.type='button';mc.className='dmmic'+(useOwn(M.id)?' on':'');mc.textContent='🎤';mc.setAttribute('aria-label','Eigenes Geräusch für '+STAGES[M.st].name);mc.addEventListener('click',function(){micPanel(r);});tl.appendChild(mc);
      blk.appendChild(tl);grid.appendChild(blk);
    });
    paint();secUI();
  }
  var brush=MON.map(function(m){return BLK[m.id][0][0];});
  function paint(){
    var r,s,n=vis();
    for(r=0;r<R;r++)if(cells[r].length)for(s=0;s<n;s++){var w=pat[r].charAt(s),b=cells[r][s];b.className=b.className.replace(/ ?(on|c\d)/g,'');if(w!=='0'){b.classList.add('on','c'+(blkIx(MON[r].id,w)%5));b.textContent=lbl(MON[r].id,w);}else b.textContent='';}
    bpmEl.textContent=dark?Math.round(bpm*.8):bpm;
    var k=pre.children,j;for(j=0;j<k.length;j++)k[j].classList.toggle('on',j===curPre);
  }
  function head(s,hits){
    var r;
    if(shown>=0)for(r=0;r<R;r++)if(cells[r][shown])cells[r][shown].classList.remove('now');
    shown=s;
    grid.classList.remove('run0','run1');if(s>=0&&vis()===16)grid.classList.add('run'+(s>>3));
    if(s>=0)for(r=0;r<R;r++)if(cells[r][s])cells[r][s].classList.add('now');
    if(hits)hits.forEach(function(h){dance(h[0]);if(Math.random()<.25)word(h[0],syl(MON[h[0]].id,h[1]));});
  }
  function loop(){
    var nw=ac.currentTime;
    while(queue.length&&queue[0].t<=nw){head(queue[0].s,queue[0].h);queue.shift();}
    if(playing)raf=requestAnimationFrame(loop);
  }
  function sched(){
    var six=st(),n=vis();
    while(nextT<ac.currentTime+.15){
      var s=step,t=nextT+((s%4===2)?six*sw:0),r,hits=[];
      if(s===0){checkSecrets();if(drop===1){drop=2;dropBuild(t,n*six);}else if(drop===2){drop=0;dropBoom(t);}}
      /* Drop: ein Takt Anlauf nur mit Hi-Hat und immer lauterem Trommelwirbel, die letzten zwei Schläge Stille, dann der Knall */
      if(drop===2){if(s<n-2){play('snare',t,[s,'p',2,.2+.8*s/n]);if(openRow(0)&&pat[0].charAt(s)!=='0')play('hats',t,[s,pat[0].charAt(s),2,1]);hits.push([3,'p']);}}
      else for(r=0;r<R;r++)if(openRow(r)){var w=pat[r].charAt(s);if(w!=='0'){play(MON[r].id,t,[s,w,2,1]);hits.push([r,w]);}}
      queue.push({s:s,t:t,h:hits});
      step=(step+1)%n;nextT+=six;
    }
  }
  function dropBuild(t,bar){
    var f=B.FILT.frequency,top=dark?1100:20000;f.cancelScheduledValues(t);f.setValueAtTime(320,t);f.exponentialRampToValueAtTime(top,t+bar*.9);
    var sr=ac.createBufferSource();sr.buffer=B.NZ;sr.loop=true;var bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=3;bp.frequency.setValueAtTime(400,t);bp.frequency.exponentialRampToValueAtTime(7000,t+bar*.85);
    var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+bar*.85);g.gain.exponentialRampToValueAtTime(.0001,t+bar*.88);sr.connect(bp);bp.connect(g);g.connect(B.OUT);send(g,B.REV,.3);sr.start(t);sr.stop(t+bar);
    at(t,function(){bc.classList.add('building');});
  }
  function dropBoom(t){
    play('beat',t,[0,'b',2,1]);play('snare',t,[0,'s',2,1]);
    var g=vca(t,.005,.15,.9,.9,B.SAT),o=osc('sine',80,t,t+1.1,g);o.frequency.exponentialRampToValueAtTime(30,t+.9);
    at(t,function(){bc.classList.remove('building');dropB.classList.remove('on');bc.classList.remove('dropped');void bc.offsetWidth;bc.classList.add('dropped');
      if(!dark){mood('joy');setTimeout(function(){mood(null)},1600);}
      var cols=['#ff4f9a','#ffc21f','#6fe0d0','#b8f56a','#a98bff'],i;for(i=0;i<24;i++){var c=document.createElement('i');c.className='dmconf';c.style.left=(Math.random()*100)+'%';c.style.background=cols[i%5];c.style.setProperty('--dx',(Math.random()*120-60)+'px');c.style.setProperty('--r',(Math.random()*720)+'deg');bc.appendChild(c);setTimeout(function(c){c.remove()}.bind(null,c),2000);}});
  }
  function dropReset(){drop=0;bc.classList.remove('building');if(dropB)dropB.classList.remove('on');if(B){var f=B.FILT.frequency,t=ac.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(dark?1100:20000,t);}}
  var dropB=document.getElementById('dmDrop');
  dropB.addEventListener('click',function(){if(drop)return;if(!playing)setPlay(true);if(!playing)return;drop=1;dropB.classList.add('on');});
  function setPlay(on){
    if(on===playing)return;
    if(on){
      try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();bus();}catch(e){return;}
      playing=true;step=0;nextT=ac.currentTime+.06;queue=[];sched();timer=setInterval(sched,25);raf=requestAnimationFrame(loop);
      bc.classList.add('live');bc.style.setProperty('--beat',(120/(dark?bpm*.8:bpm))+'s');
    }else{
      playing=false;dropReset();clearInterval(timer);cancelAnimationFrame(raf);queue=[];head(-1);bc.classList.remove('live');
    }
    playB.innerHTML=icoSvg(on?'stop':'play');playB.classList.toggle('on',on);
  }
  ICONS.stop='<rect x="9" y="9" width="30" height="30" rx="7" fill="'+IC_D+'"/>';
  pre.innerHTML='';
  var SI={
    boombap:'<rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="8" cy="14" r="3"/><circle cx="16" cy="14" r="3"/><path d="M7 8V5h10v3"/>',
    house:'<path d="M3 11L12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    funk:'<rect x="2.5" y="9" width="8" height="6" rx="2.5" fill="currentColor"/><rect x="13.5" y="9" width="8" height="6" rx="2.5" fill="currentColor"/><path d="M10.5 11h3M2.5 11L1 8M21.5 11L23 8"/>',
    rock:'<path d="M13 2L5 14h6l-1 8 9-12h-6z" fill="currentColor"/>',
    techno:'<rect x="5" y="7" width="14" height="12" rx="3"/><circle cx="9.5" cy="13" r="1.6" fill="currentColor"/><circle cx="14.5" cy="13" r="1.6" fill="currentColor"/><path d="M12 7V4"/><circle cx="12" cy="3.4" r="1.2" fill="currentColor"/>',
    trap:'<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-2 6 5 12M15 3l2 6-5 12"/>',
    disco:'<circle cx="12" cy="13.5" r="8"/><path d="M4 13.5h16M12 5.5v16M6 8.5c3 2 9 2 12 0M6 18.5c3-2 9-2 12 0M12 2v3.5"/>',
    bossa:'<path d="M12.5 22c0-6 0-9 1-12"/><path d="M13.5 10C9.5 6 5.5 8 4 10.5M13.5 10c3-4 7-3 8 0M13.5 10c-1-4 0-7 2-8.5M13.5 10C10 9 7 11 7 14.5"/>',
    dnb:'<path d="M12 2c4 3 5 8 3 14H9C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="1.8" fill="currentColor"/><path d="M9 14l-3.5 4M15 14l3.5 4M12 18v4"/>',
    shuffle:'<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="9" r="1.4" fill="currentColor"/><circle cx="9" cy="15" r="1.4" fill="currentColor"/><circle cx="15" cy="15" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
    afro:'<ellipse cx="12" cy="6" rx="6.5" ry="2.6"/><path d="M5.5 6l2 14h9l2-14"/><path d="M8.5 12h7"/>',
    minimal:'<circle cx="12" cy="12" r="2.8" fill="currentColor"/><circle cx="12" cy="12" r="8.5"/>',
    hardtechno:'<path d="M12 2c1 4.5 5.5 6.5 5.5 11.5a5.5 5.5 0 01-11 0c0-2 1-3.3 2.2-4.3.1 2 1 3 2.3 3.2C11 8 10 5.5 12 2z" fill="currentColor"/>'
  };
  BEATS.forEach(function(Bt,i){
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',NM[Bt.n]||Bt.n);b.title=NM[Bt.n]||Bt.n;
    b.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true" style="color:#1d0a14"><circle cx="24" cy="24" r="22" fill="'+(i%2?IC_L:IC_P)+'"/><g transform="translate(11 11) scale(1.1)" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+(SI[Bt.n]||'')+'</g></svg>';
    b.addEventListener('click',function(){fromBeat(i);if(mir()){var r;for(r=0;r<R;r++)pat[r]=pat[r].slice(0,8)+pat[r].slice(0,8);}curPre=i;changed();if(!playing)setPlay(true);});
    pre.appendChild(b);
  });
  /* ---------- Einführung beim ersten Öffnen (später über das Fragezeichen) ---------- */
  var INTRO=[
    {t:'Deine Monster machen Musik!',s:'Jedes Monster macht ein Geräusch mit dem Mund. Tipp auf ein Monster, dann hörst du es.',v:'mons'},
    {t:'Bau deinen Beat!',s:'Tipp auf die Kästchen. Dort macht das Monster sein Geräusch. Drück auf Play, dann spielt dein Beat.',v:'grid'},
    {t:'Finde die Geheimnisse!',s:'Manche Beats sind besonders. Wenn du einen findest, feiern deine Monster. Oben siehst du, wie viele du schon hast.',v:'gift'}];
  function introViz(v){
    if(v==='mons')return [1,2,3].map(function(k,i){return '<div class="dmmon dmi-m" style="animation-delay:'+(i*.25)+'s">'+monsterSvg(MON[k-1].st,'happy')+'</div>';}).join('');
    if(v==='grid'){var o='<div class="dmi-g">',k;for(k=0;k<8;k++)o+='<span class="dmc '+(k%4===0?'on c0':k===6?'on c1':'g'+((k>>2)&1))+'" style="animation-delay:'+(k*.2)+'s"></span>';return o+'</div><span class="dmi-play">▶</span>';}
    return '<span class="dmi-gift">🔒</span><span class="dmi-arrow">➜</span><span class="dmi-gift">🔓</span>';
  }
  function intro(){
    var old=bc.querySelector('.dmintro');if(old)old.remove();setPlay(false);
    var ov=document.createElement('div');ov.className='dmintro';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','So geht die Monster-Beatbox');bc.appendChild(ov);var i=0;
    function done(){ov.remove();introSeen=true;if(!anyOn()){fromBeat(0);curPre=0;}persist();paint();setPlay(true);}
    function step(){var I=INTRO[i],last=i===INTRO.length-1;
      ov.innerHTML='<div class="dmi-viz">'+introViz(I.v)+'</div><b class="dmi-t">'+I.t+'</b><p class="dmi-s">'+I.s+'</p>'+
        '<div class="dmi-dots">'+INTRO.map(function(x,k){return '<i'+(k===i?' class="on"':'')+'></i>';}).join('')+'</div>'+
        '<div class="dmi-bar"><button type="button" class="dmi-spk" aria-label="Vorlesen">'+icoSvg('speak')+'</button><button type="button" class="btn dmi-go">'+(last?'Los geht\'s!':'Weiter')+'</button></div>'+
        (last?'':'<button type="button" class="dmi-skip">Überspringen</button>');
      ov.querySelector('.dmi-spk').onclick=function(){say(I.t+' '+I.s,true);};
      ov.querySelector('.dmi-go').onclick=function(){if(last)done();else{i++;step();}};
      var sk=ov.querySelector('.dmi-skip');if(sk)sk.onclick=done;
      var ms=ov.querySelectorAll('.dmi-m');[].forEach.call(ms,function(m,k){m.onclick=function(){now(MON[k].id,BLK[MON[k].id][0][0]);};});
      if(S.speak!==false)say(I.t+' '+I.s,true);
    }
    step();
  }
  playB.addEventListener('click',function(){setPlay(!playing);});
  document.getElementById('dmSlow').addEventListener('click',function(){bpm=Math.max(60,bpm-6);paint();persist();if(playing)bc.style.setProperty('--beat',(120/(dark?bpm*.8:bpm))+'s');});
  document.getElementById('dmFast').addEventListener('click',function(){bpm=Math.min(180,bpm+6);paint();persist();if(playing)bc.style.setProperty('--beat',(120/(dark?bpm*.8:bpm))+'s');});
  document.getElementById('dmClr').addEventListener('click',function(){pat=empty();curPre=-1;changed();});
  secEl.addEventListener('click',function(){secList.hidden=!secList.hidden;});
  document.getElementById('dmHelp').addEventListener('click',intro);
  /* Kurzer Takt (8 Felder) für die Kleinsten, umschaltbar oben */
  var kz=document.getElementById('dmKurz');
  function kurzUI(){kz.textContent=mir()?'8':'16';kz.setAttribute('aria-pressed',mir()?'true':'false');}
  kz.addEventListener('click',function(){S.kurz=!S.kurz;if(mir()){var r;for(r=0;r<R;r++)pat[r]=pat[r].slice(0,8)+pat[r].slice(0,8);}kurzUI();changed();build();});
  kurzUI();build();playB.innerHTML=icoSvg('play');
  if(!introSeen)intro();
})();
