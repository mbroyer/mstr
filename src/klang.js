/* ===== Klang: alle Spuren per Web Audio erzeugt, über einen Bus mit Hall, Delay, Sättigung und Sidechain ===== */
/* Spuren: id (für die Klangerzeugung), Name, Klänge [Zeichen im Pattern, Name] */
var TRACKS=[
  {id:'hats',n:'Hi-Hat',s:[['x','Zu'],['o','Offen'],['k','Tick']]},
  {id:'beat',n:'Kick',s:[['b','Kick']]},
  {id:'clap',n:'Clap',s:[['c','Clap']]},
  {id:'snare',n:'Snare',s:[['p','Snare'],['k','Rim'],['s','Rauschen']]},
  {id:'click',n:'Perc',s:[['1','1'],['2','2'],['3','3'],['4','4'],['5','5']]},
  {id:'toms',n:'Toms',s:[['b','Kick 2'],['p','Snare 2'],['t','Tom'],['c','Becken']]},
  {id:'fx',n:'FX',s:[['m','Drop hoch'],['n','Drop tief'],['s','Rauschen'],['l','Buzz'],['z','Riser']]}];
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
function duck(t){B.DUCK.gain.cancelScheduledValues(t);B.DUCK.gain.setValueAtTime(.5,t);B.DUCK.gain.linearRampToValueAtTime(1,t+st()*2);}
var dr={
  kick:function(t,v){var g=vca(t,.001,0,.28,v);var o=osc('sine',150,t,t+.3,g);o.frequency.exponentialRampToValueAtTime(42,t+.16);},
  noise:function(t,v,len,hp){var s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=vca(t,.001,0,len,v);s.buffer=B.NZ;f.type='highpass';f.frequency.value=hp;s.connect(f);f.connect(g);s.start(t,Math.random()*.4);s.stop(t+len+.05);},
  snare:function(t,v){dr.noise(t,v,.16,1800);var g=vca(t,.001,0,.12,v*.6);var o=osc('triangle',220,t,t+.14,g);o.frequency.exponentialRampToValueAtTime(140,t+.08);send(g,B.REV,.15);},
  tom:function(t,f,v){var g=vca(t,.001,0,.25,v);var o=osc('sine',f,t,t+.28,g);o.frequency.exponentialRampToValueAtTime(f*.55,t+.2);send(g,B.REV,.25);}
};
/* n = [Schritt, Klangzeichen, Länge, Lautstärke] */
function playSynth(id,t,n){
  var v=n[3],w=n[1],six=st();
  if(id==='beat'){var kl=bpm>=128?.38:.22;
    var g=vca(t,.001,0,kl,1.05*v,kl>.3?B.SAT:B.OUT);var o=osc('sine',150,t,t+kl+.05,g);o.frequency.exponentialRampToValueAtTime(kl>.3?44:52,t+.07);
    nz(t,.018,.9*v,'lowpass',450,1);nz(t,.006,.25*v,'bandpass',2200,1);
    var gb=vca(t,.002,0,.06,.25*v),lb=ac.createBiquadFilter();lb.type='lowpass';lb.frequency.value=320;lb.connect(gb);osc('sawtooth',75,t,t+.08,lb);duck(t);}
  else if(id==='hats'){
    if(w==='o'){nz(t,.004,.3*v,'highpass',3000);nz(t+.004,.26,.28*v,'bandpass',6800,1.2,.1);}
    else if(w==='k'){nz(t,.025,.35*v,'bandpass',3400,3);}
    else{nz(t,.004,.35*v,'highpass',3000);nz(t+.003,.045,.32*v,'bandpass',7200,1.3);}}
  else if(id==='clap'){[0,.009,.019].forEach(function(o2,i){nz(t+o2,.012,.5*v,'bandpass',1400+i*300,1.6);});nz(t+.026,.16,.5*v,'bandpass',3200,.8,.25);}
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

/* ---------- Eigene Klänge: 1 Sekunde aufnehmen, Stille abschneiden, als WAV auf diesem Gerät speichern ---------- */
var REC={},ownV={};
TRACKS.forEach(function(m){var s=lsGet('mstr-rec-'+m.id);if(s){ownV[m.id]=lsGet('mstr-own-'+m.id)!=='0';REC[m.id]={b64:s};}});
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
function useOwn(id){return !!(REC[id]&&ownV[id]);}
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
      var b64=wavB64(tb);REC[id]={b64:b64,buf:tb};ownV[id]=true;lsSet('mstr-rec-'+id,b64);lsSet('mstr-own-'+id,'1');
      status('Gespeichert, nur auf diesem Gerät.');setTimeout(function(){playRec(id,ac.currentTime+.05,[0,TRACKS[trIx(id)].s[0][0],2,1]);},300);done(true);}
    status('3',1);setTimeout(function(){status('2',1);},500);setTimeout(function(){status('1',1);},1000);
    setTimeout(function(){status('Aufnahme läuft',2);on=true;setTimeout(fin,1100);},1500);})
  .catch(function(){status('Kein Zugriff aufs Mikrofon. Bitte in den Browser-Einstellungen erlauben.');done(false);});
}
function dropRec(id){delete REC[id];delete ownV[id];lsSet('mstr-rec-'+id,null);lsSet('mstr-own-'+id,null);}
