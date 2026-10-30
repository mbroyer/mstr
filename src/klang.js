/* ===== Klang: alle Spuren per Web Audio erzeugt, über einen Bus mit Hall, Delay, Sättigung und Sidechain ===== */
/* Spuren: id (für die Klangerzeugung), Name, Klänge [Zeichen im Pattern, Name] */
var TRACKS=[
  {id:'hats',n:'Hi-Hat',s:[['x','Zu'],['o','Offen'],['k','Tick']]},
  {id:'beat',n:'Kick',s:[['b','Kick']]},
  {id:'snare',n:'Snare',s:[['p','Snare'],['k','Rim'],['s','Rauschen'],['c','Clap']]},
  {id:'cym',n:'Becken',s:[['c','Crash'],['r','Ride'],['h','China']]},
  {id:'click',n:'Perc',s:[['1','Shaker'],['2','Tamburin'],['3','Clave'],['4','Conga'],['5','Cowbell']]},
  {id:'toms',n:'Toms',s:[['b','Tief'],['p','Mittel'],['t','Hoch']]},
  {id:'fx',n:'FX',s:[['m','Snap'],['n','Sub'],['s','Reverse'],['l','Wirbel'],['z','Riser']]},
  /* Eigene Spur: spielt nur die eigene Aufnahme, in drei Tonhöhen */
  {id:'mic',n:'Aufnahme',s:[['a','Normal'],['t','Tief'],['h','Hoch']]}];
var N=16,R=TRACKS.length;
var PENT=[0,57,60,62,64,67],RATE=[1,.84,1.19,1.33,1.5];
var bpm=100,sw=0;
function hz(m){return 440*Math.pow(2,(m-69)/12);}
function sndIx(r,w){var b=TRACKS[r].s,i;for(i=0;i<b.length;i++)if(b[i][0]===w)return i;return -1;}
function trIx(id){var r;for(r=0;r<R;r++)if(TRACKS[r].id===id)return r;return -1;}
function st(){return 60/bpm/4;}

var B=null,_bac=null;
function bus(){
  getAC();if(!ac)return null;if(_bac===ac&&B)return B;_bac=ac;B={};var i;
  B.OUT=ac.createGain();B.OUT.gain.value=.9;B.FILT=ac.createBiquadFilter();B.FILT.type='lowpass';B.FILT.frequency.value=20000;B.FILT.Q.value=.7;B.OUT.connect(B.FILT);B.FILT.connect(OUT());
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
/* Gefiltertes Rauschen, dessen Hüllkurve der Aufrufer selbst setzt (Gain startet bei 0) */
function band(t,d,type,f,q,dest){var s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=B.NZ;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*.4);s.stop(t+d+.05);return g;}
/* Crash wie bei der 808: sechs Rechteckoszillatoren modulieren Rauschen (dichter Metallklang ohne Einzeltöne),
   ein mittleres Band klingt kurz, ein hohes lange, dazu der Stockanschlag */
function crash(t,v){
  var mt=ac.createGain();mt.gain.value=.2;[205,304,370,523,540,800].forEach(function(f){osc('square',f*1.6,t,t+2,mt);});
  var sz=ac.createBufferSource(),rm=ac.createGain();sz.buffer=B.NZ;sz.loop=true;rm.gain.value=0;mt.connect(rm.gain);sz.connect(rm);sz.start(t,Math.random()*.4);sz.stop(t+2);
  var mid=ac.createBiquadFilter(),gm=ac.createGain();mid.type='bandpass';mid.frequency.value=3400;mid.Q.value=.8;rm.connect(mid);mid.connect(gm);gm.connect(B.DUCK);
  gm.gain.setValueAtTime(.0001,t);gm.gain.exponentialRampToValueAtTime(1.1*v,t+.002);gm.gain.exponentialRampToValueAtTime(.0001,t+.4);
  var hi=ac.createBiquadFilter(),gh=ac.createGain();hi.type='highpass';hi.frequency.value=6500;rm.connect(hi);hi.connect(gh);gh.connect(B.DUCK);
  gh.gain.setValueAtTime(.0001,t);gh.gain.exponentialRampToValueAtTime(.9*v,t+.002);gh.gain.exponentialRampToValueAtTime(.25*v,t+.15);gh.gain.exponentialRampToValueAtTime(.0001,t+1.8);send(gh,B.REV,.1);
  var gs=band(t,.05,'highpass',2000,.7,B.DUCK);gs.gain.setValueAtTime(.35*v,t);gs.gain.exponentialRampToValueAtTime(.001,t+.025);
}
var CYP=null;
function cymbal(t,v,o){
  if(!CYP){var x=7;CYP=[];for(var j=0;j<40;j++){x=(x*16807)%2147483647;var r1=x/2147483647;x=(x*16807)%2147483647;CYP.push([r1,x/2147483647]);}}
  var out=ac.createGain(),lp=ac.createBiquadFilter();out.gain.value=1;lp.type='lowpass';lp.frequency.value=o.lp;out.connect(lp);lp.connect(B.DUCK);if(o.rev)send(lp,B.REV,o.rev);
  for(var i=0;i<o.n;i++){var q=CYP[i],f=o.lo*Math.pow(o.hi/o.lo,q[0]),d=o.dec*(.35+.65*q[1])*Math.pow(1000/f,.15),
    g=ac.createGain(),os=ac.createOscillator();os.type=o.trash?'square':'sine';os.frequency.value=f;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09*v/Math.sqrt(o.n/10)*(o.trash?.35:1),t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    os.connect(g);g.connect(out);os.start(t);os.stop(t+d+.05);}
  var gs=band(t,.06,'highpass',3000,.7,lp);gs.gain.setValueAtTime(o.stick*v,t);gs.gain.exponentialRampToValueAtTime(.001,t+.03);
}
function duck(t){B.DUCK.gain.cancelScheduledValues(t);B.DUCK.gain.setValueAtTime(.5,t);B.DUCK.gain.linearRampToValueAtTime(1,t+st()*2);}
var dr={
  tom:function(t,f,v){var g=vca(t,.001,0,.25,v);var o=osc('sine',f,t,t+.28,g);o.frequency.exponentialRampToValueAtTime(f*.78,t+.2);send(g,B.REV,.25);}
};
/* n = [Schritt, Klangzeichen, Länge, Lautstärke] */
function playSynth(id,t,n){
  if(id==='mic')return;
  var v=n[3],w=n[1],six=st();
  if(id==='beat'){var kl=bpm>=128?.38:.22;
    var g=vca(t,.001,0,kl,1.05*v,kl>.3?B.SAT:B.OUT);var o=osc('sine',150,t,t+kl+.05,g);o.frequency.exponentialRampToValueAtTime(kl>.3?44:52,t+.07);
    nz(t,.018,.9*v,'lowpass',450,1);nz(t,.006,.25*v,'bandpass',2200,1);
    var gb=vca(t,.002,0,.06,.25*v),lb=ac.createBiquadFilter();lb.type='lowpass';lb.frequency.value=320;lb.connect(gb);osc('sawtooth',75,t,t+.08,lb);duck(t);}
  else if(id==='hats'){
    if(w==='o'){nz(t,.004,.3*v,'highpass',3000);nz(t+.004,.26,.28*v,'bandpass',6800,1.2,.1);}
    else if(w==='k'){nz(t,.025,.35*v,'bandpass',3400,3);}
    else{nz(t,.004,.35*v,'highpass',3000);nz(t+.003,.045,.32*v,'bandpass',7200,1.3);}}
  else if(id==='snare'){
    if(w==='c'){[0,.009,.019].forEach(function(o2,i){nz(t+o2,.012,.5*v,'bandpass',1400+i*300,1.6);});nz(t+.026,.16,.5*v,'bandpass',3200,.8,.25);}
    else if(w==='p'){nz(t,.014,.8*v,'lowpass',900,1);nz(t+.008,.16,.6*v,'bandpass',2300,.7,.18);var gp=vca(t,.001,0,.05,.18*v);osc('triangle',240,t,t+.07,gp);}
    else if(w==='k'){nz(t,.007,.6*v,'highpass',4000);nz(t+.004,.08,.7*v,'bandpass',1700,2.2,.15);var gk=vca(t,.001,0,.04,.2*v);osc('triangle',420,t,t+.06,gk);}
    else{nz(t,.012,.7*v,'lowpass',900,1);nz(t+.01,.45,.45*v,'bandpass',4300,.8,.3);}}
  else if(id==='click'){
    /* Percussion: Shaker, Tamburin, Clave, Conga, Cowbell */
    if(w==='1'){var gs=band(t,.12,'bandpass',6500,1.4,B.DUCK);gs.gain.setValueAtTime(0,t);gs.gain.linearRampToValueAtTime(.32*v,t+.018);gs.gain.exponentialRampToValueAtTime(.001,t+.1);
      var g2=band(t,.06,'highpass',9000,.7,B.DUCK);g2.gain.setValueAtTime(.12*v,t+.012);g2.gain.exponentialRampToValueAtTime(.001,t+.05);}
    else if(w==='2'){var gj=vca(t,.001,0,.14,.14*v,B.DUCK),fj=ac.createBiquadFilter(),hj=ac.createBiquadFilter();fj.type='bandpass';fj.frequency.value=9000;fj.Q.value=1;hj.type='highpass';hj.frequency.value=6000;fj.connect(hj);hj.connect(gj);
      [5100,6300,7400,8900].forEach(function(f){osc('square',f,t,t+.16,fj);});
      [0,.022].forEach(function(o2,i){var gn=band(t+o2,.12,'highpass',7500,.7,B.DUCK);gn.gain.setValueAtTime((i?.16:.28)*v,t+o2);gn.gain.exponentialRampToValueAtTime(.001,t+o2+.09);send(gn,B.REV,.06);});}
    else if(w==='3'){var gv=vca(t,.001,0,.045,.38*v,B.DUCK);osc('sine',2500,t,t+.07,gv);var gv2=vca(t,.001,0,.012,.06*v,B.DUCK);osc('triangle',5000,t,t+.03,gv2);send(gv,B.REV,.15);}
    /* Conga: Fellmoden einer Trommel (unharmonische Verhältnisse) ohne Gleitton, dazu der Handanschlag */
    else if(w==='4'){[[1,1,.18],[1.59,.45,.07],[2.14,.25,.05],[2.65,.15,.035]].forEach(function(m){var gm=vca(t,.001,0,m[2],.42*m[1]*v,B.DUCK);osc('sine',300*m[0],t,t+m[2]+.05,gm);send(gm,B.REV,.1);});
      var gh=band(t,.06,'bandpass',900,.9,B.DUCK);gh.gain.setValueAtTime(.35*v,t);gh.gain.exponentialRampToValueAtTime(.001,t+.03);nz(t,.006,.18*v,'highpass',2500,.7,0,B.DUCK);}
    /* Cowbell: unharmonische Teiltöne einer echten Kuhglocke, jeder mit eigenem Ausklang, dazu der Stockanschlag */
    else{[[587,1,.28],[845,.85,.34],[1245,.35,.12],[1640,.45,.1],[2470,.25,.07],[3330,.15,.05]].forEach(function(m){var gm=vca(t,.0015,0,m[2],.11*m[1]*v,B.DUCK),om=osc('sine',m[0],t,t+m[2]+.05,gm);om.frequency.setValueAtTime(m[0]*1.006,t);om.frequency.exponentialRampToValueAtTime(m[0],t+.02);send(gm,B.REV,.08);});
      nz(t,.008,.25*v,'bandpass',3200,1.5,0,B.DUCK);nz(t,.004,.15*v,'highpass',6000,.7,0,B.DUCK);}}
  /* Becken: viele unharmonische Sinus-Teiltöne (fest ausgewürfelt, damit jeder Schlag gleich klingt), jeder mit eigenem Ausklang.
     Das ergibt den schimmernden Metallklang; Rauschen gibt es nur für den Stockanschlag */
  else if(id==='cym'){
    if(w==='r')cymbal(t,v*.3,{lo:2500,hi:9000,n:14,dec:.7,lp:6000,stick:.08,rev:.08});
    else if(w==='h')cymbal(t,v*.9,{lo:600,hi:7000,n:24,dec:.8,lp:9000,stick:.35,rev:.15,trash:1});
    else crash(t,v);}
  else if(id==='toms'){dr.tom(t,w==='b'?100:w==='p'?140:190,.6*v);}
  else if(id==='fx'){
    /* Snap: harter Klick des Fingers, dann die Resonanz der hohlen Hand (schmales Band um 1,8 und 3,2 kHz), ein leiser Körper und etwas Raum.
       Die Resonanz schwankt bei jedem Schnipsen leicht, wie bei einer echten Hand */
    if(w==='m'){var rj=1+(Math.random()-.5)*.12;
      var gc=band(t,.01,'highpass',3500,.7,B.DUCK);gc.gain.setValueAtTime(.55*v,t);gc.gain.exponentialRampToValueAtTime(.001,t+.003);
      var gr=band(t,.08,'bandpass',1800*rj,6,B.DUCK);gr.gain.setValueAtTime(.0001,t);gr.gain.exponentialRampToValueAtTime(1.6*v,t+.0015);gr.gain.exponentialRampToValueAtTime(.001,t+.045);send(gr,B.REV,.22);
      var gh=band(t,.05,'bandpass',3200*rj,4,B.DUCK);gh.gain.setValueAtTime(.0001,t);gh.gain.exponentialRampToValueAtTime(.7*v,t+.001);gh.gain.exponentialRampToValueAtTime(.001,t+.025);send(gh,B.REV,.15);
      var gk=vca(t,.001,0,.018,.12*v,B.DUCK);osc('sine',260,t,t+.04,gk);}
    /* Sub: kurzer, tiefer 808-Bass, läuft über die Sättigung */
    else if(w==='n'){var gb=vca(t,.002,.05,.4,.9*v,B.SAT),ob=osc('sine',95,t,t+.5,gb);ob.frequency.exponentialRampToValueAtTime(52,t+.05);duck(t);}
    /* Reverse: rückwärts laufendes Becken, schwillt über vier Schritte an und bricht ab */
    else if(w==='s'){var L=six*4,gv=band(t,L,'highpass',4000,.6,B.DUCK);gv.gain.setValueAtTime(.0001,t);gv.gain.exponentialRampToValueAtTime(.4*v,t+L);gv.gain.setValueAtTime(0,t+L);send(gv,B.REV,.3);}
    /* Wirbel: sechs Snare-Schläge in Zweiunddreißigsteln, lauter werdend */
    else if(w==='l'){for(var i=0;i<6;i++)playSynth('snare',t+i*six/2,[0,'p',1,v*(.3+.12*i)]);}
    /* Riser: nur Rauschen, Hochpass und Band öffnen sich über vier Schritte, mit viel Hall, dann bricht es ab */
    else if(w==='z'){var L=six*4,gz=ac.createGain(),hz2=ac.createBiquadFilter(),bz=ac.createBiquadFilter();hz2.type='highpass';hz2.frequency.setValueAtTime(150,t);hz2.frequency.exponentialRampToValueAtTime(3000,t+L);
      bz.type='bandpass';bz.Q.value=.8;bz.frequency.setValueAtTime(800,t);bz.frequency.exponentialRampToValueAtTime(9000,t+L);hz2.connect(bz);bz.connect(gz);gz.connect(B.DUCK);
      gz.gain.setValueAtTime(.0001,t);gz.gain.exponentialRampToValueAtTime(.45*v,t+L);gz.gain.setValueAtTime(0,t+L);
      var sz=ac.createBufferSource();sz.buffer=B.NZ;sz.loop=true;sz.connect(hz2);sz.start(t);sz.stop(t+L+.02);send(gz,B.REV,.45);}}
}

/* ---------- Eigener Klang: 1 Sekunde aufnehmen, Stille abschneiden, als WAV auf diesem Gerät speichern. Nur für die Spur Aufnahme ---------- */
var REC={};
/* Früher konnte jede Spur eine Aufnahme haben: die erste vorhandene wandert in die Spur Aufnahme, die übrigen fallen weg */
TRACKS.forEach(function(m){if(m.id==='mic')return;var s=lsGet('mstr-rec-'+m.id);if(s&&!lsGet('mstr-rec-mic'))lsSet('mstr-rec-mic',s);if(s)lsSet('mstr-rec-'+m.id,null);lsSet('mstr-own-'+m.id,null);});
(function(){var s=lsGet('mstr-rec-mic');if(s)REC.mic={b64:s};})();
function b64buf(s){var bin=atob(s),a=new Uint8Array(bin.length),i;for(i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer;}
function trimBuf(buf){var d=buf.getChannelData(0),sr=buf.sampleRate,peak=0,i;for(i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));if(peak<.01)return null;
  var th=peak*.12,a=0,b=d.length-1;while(a<d.length&&Math.abs(d[a])<th)a++;while(b>a&&Math.abs(d[b])<th*.5)b--;a=Math.max(0,a-sr*.01|0);b=Math.min(d.length,b+sr*.08|0,a+sr*.7|0);
  var out=ac.createBuffer(1,b-a,sr),o=out.getChannelData(0),g=.9/peak;for(i=a;i<b;i++)o[i-a]=d[i]*g;var f=sr*.01|0;for(i=0;i<f;i++){o[i]*=i/f;o[out.length-1-i]*=i/f;}return out;}
function decodeRec(id){var r=REC[id];if(!r||r.buf||r.busy||!ac)return;r.busy=true;ac.decodeAudioData(b64buf(r.b64)).then(function(buf){r.buf=trimBuf(buf)||buf;r.busy=false;}).catch(function(){r.busy=false;delete REC[id];});}
function wavB64(buf){var d=buf.getChannelData(0),stp=buf.sampleRate>=44100?2:1,sr=buf.sampleRate/stp,n=Math.floor(d.length/stp),ab=new ArrayBuffer(44+n*2),v=new DataView(ab),i;
  function w(o,t){for(var j=0;j<t.length;j++)v.setUint8(o+j,t.charCodeAt(j));}
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i*stp]));v.setInt16(44+i*2,x*32767,true);}
  var u=new Uint8Array(ab),bin='';for(i=0;i<u.length;i+=8192)bin+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(bin);}
function useOwn(id){return id==='mic'&&!!REC.mic;}
function playRec(id,t,n){var r=REC[id];if(!r.buf){decodeRec(id);return playSynth(id,t,n);}var s=ac.createBufferSource();s.buffer=r.buf;var k=Math.max(0,sndIx(trIx(id),n[1]));s.playbackRate.value=id==='click'?Math.pow(2,(PENT[+n[1]]-60)/12):RATE[k%5];
  var g=vca(t,.003,0,.06,.9*n[3],id==='beat'?B.SAT:B.DUCK);s.connect(g);s.start(t);if(id==='beat')duck(t);send(g,B.REV,.15);}
function play(id,t,n){if(!bus())return;if(useOwn(id))return playRec(id,t,n);playSynth(id,t,n);}
function now(id,w,v){try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();play(id,ac.currentTime+.02,[0,w,2,v==null?1:v]);}catch(e){}}
/* Aufnahme direkt als Samples über Web Audio statt MediaRecorder: Safari auf dem iPad liefert dort MP4, das sich oft nicht dekodieren lässt */
function record(id,status,done){
  getAC();if(!ac){status('Ton ist hier nicht verfügbar.');return done(false);}if(ac.state==='suspended')ac.resume();bus();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){status('Dieser Browser erlaubt kein Mikrofon.');return done(false);}
  status('Mikrofon wird geöffnet …');
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}}).then(function(stream){
    if(ac.state!=='running')ac.resume();
    var src=ac.createMediaStreamSource(stream),proc=ac.createScriptProcessor(2048,1,1),mute=ac.createGain(),parts=[],on=false;mute.gain.value=0;
    proc.onaudioprocess=function(e){if(on)parts.push(new Float32Array(e.inputBuffer.getChannelData(0)));};
    src.connect(proc);proc.connect(mute);mute.connect(ac.destination);
    function fin(){on=false;try{src.disconnect();proc.disconnect();mute.disconnect();}catch(e){}stream.getTracks().forEach(function(tr){tr.stop();});
      setTimeout(function(){if(ac.state!=='running')ac.resume();},300);
      var n=0,k,o=0;parts.forEach(function(x){n+=x.length;});if(!n){status('Die Aufnahme ist leer. Bitte noch einmal versuchen.');return done(false);}
      var raw=ac.createBuffer(1,n,ac.sampleRate),d=raw.getChannelData(0);for(k=0;k<parts.length;k++){d.set(parts[k],o);o+=parts[k].length;}
      var tb=trimBuf(raw);if(!tb){status('Zu leise. Bitte näher ans Mikrofon und noch einmal.');return done(false);}
      var b64=wavB64(tb);REC[id]={b64:b64,buf:tb};lsSet('mstr-rec-'+id,b64);
      status('Gespeichert, nur auf diesem Gerät.');setTimeout(function(){playRec(id,ac.currentTime+.05,[0,TRACKS[trIx(id)].s[0][0],2,1]);},300);done(true);}
    status('3',1);setTimeout(function(){status('2',1);},500);setTimeout(function(){status('1',1);},1000);
    setTimeout(function(){status('Aufnahme läuft',2);on=true;setTimeout(fin,1100);},1500);})
  .catch(function(){status('Kein Zugriff aufs Mikrofon. Bitte in den Browser-Einstellungen erlauben.');done(false);});
}
function dropRec(id){delete REC[id];lsSet('mstr-rec-'+id,null);}
