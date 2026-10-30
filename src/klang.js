/* ===== Klang: Spuren, Wiedergabe des Schlagzeugs über einen Bus mit Hall, Sättigung und Sidechain, eigene Aufnahmen ===== */
/* Spuren: id (für die Klangerzeugung), Name, Klänge [Zeichen im Pattern, Name]. Die Zeichen nie ändern, gespeicherte Beats hängen daran */
var TRACKS=[
  {id:'hats',n:'Hi-Hat',s:[['x','Zu'],['o','Offen'],['k','Pedal']]},
  {id:'beat',n:'Kick',s:[['b','Kick']]},
  {id:'clap',n:'Clap',s:[['c','Clap']]},
  {id:'snare',n:'Snare',s:[['p','Snare'],['k','Sidestick'],['s','Rimshot']]},
  {id:'click',n:'Perc',s:[['1','Shaker'],['2','Tamburin'],['3','Clave'],['4','Conga'],['5','Cowbell']]},
  {id:'toms',n:'Toms',s:[['b','Tom tief'],['p','Tom mittel'],['t','Tom hoch'],['c','Crash'],['r','Ride']]},
  {id:'fx',n:'Extras',s:[['m','Flam'],['n','Glocke'],['s','Splash'],['l','Wirbel'],['z','Triangel']]}];
var N=16,R=TRACKS.length;
var PENT=[0,57,60,62,64,67],RATE=[1,.84,1.19,1.33,1.5];
var bpm=100,sw=0;
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
  B.SAT=ac.createWaveShaper();var cv=new Float32Array(1024);for(i=0;i<1024;i++){var x=i/512-1;cv[i]=Math.tanh(x*2.5)/Math.tanh(2.5);}B.SAT.curve=cv;var sg=ac.createGain();sg.gain.value=.8;B.SAT.connect(sg);sg.connect(B.OUT);
  B.NZ=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var c=B.NZ.getChannelData(0);for(i=0;i<c.length;i++)c[i]=Math.random()*2-1;
  B.K={};decodeKit(B);
  return B;
}
function send(node,dest,amt){var g=ac.createGain();g.gain.value=amt;node.connect(g);g.connect(dest);}
function vca(t,a,hold,rel,v,dest){var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+a);if(hold>0)g.gain.setValueAtTime(Math.max(.0002,v),t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel);g.connect(dest||B.OUT);return g;}
function osc(type,f,t,end,dest){var o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(dest);o.start(t);o.stop(end);return o;}
function duck(t){B.DUCK.gain.cancelScheduledValues(t);B.DUCK.gain.setValueAtTime(.5,t);B.DUCK.gain.linearRampToValueAtTime(1,t+st()*2);}
/* Drum-Kit aus samples.js (echtes Schlagzeug, CC0): beim ersten Ton einmal dekodieren, Stille am Anfang (MP3-Vorlauf) überspringen */
var LVL={kick:1,snare:.9,stick:.7,rimshot:.85,flam:.85,buzz:.8,hatC:.55,hatO:.5,hatP:.5,splash:.5,crash:.55,ride:.5,bell:.5,tomL:.85,tomH:.85,shaker:.5,tamb:.5,clave:.5,conga:.7,cowbell:.5,triangle:.45,clap:.8};
function decodeKit(bb){Object.keys(SAMPLES).forEach(function(k){bb.K[k]=[];SAMPLES[k].forEach(function(s64,i){
  ac.decodeAudioData(b64buf(s64),function(buf){var d=buf.getChannelData(0),pk=0,j;for(j=0;j<d.length;j++)pk=Math.max(pk,Math.abs(d[j]));
    for(j=0;j<d.length&&Math.abs(d[j])<pk*.01;j++);bb.K[k][i]={b:buf,o:Math.max(0,j/buf.sampleRate-.001)};},function(){});});});}
var rrN={};
/* Spielt einen Klang; bei mehreren Aufnahmen (Round Robin) abwechselnd, damit Wiederholungen nicht maschinell klingen */
function hit(k,t,v,dest,rev,rate){var vs=B.K[k]||[],i=rrN[k]=((rrN[k]|0)+1)%Math.max(1,vs.length),x=vs[i]||vs[0];if(!x)return null;
  var s=ac.createBufferSource(),g=ac.createGain();s.buffer=x.b;if(rate)s.playbackRate.value=rate;g.gain.value=LVL[k]*v;s.connect(g);g.connect(dest||B.OUT);if(rev)send(g,B.REV,rev);s.start(t,x.o);return g;}
/* Offene Hi-Hat wird von der nächsten geschlossenen abgewürgt, wie am echten Becken */
var openHat=null;
function choke(t){if(openHat){openHat.gain.setTargetAtTime(0,t,.015);openHat=null;}}
var PERC={'1':'shaker','2':'tamb','3':'clave','4':'conga','5':'cowbell'},TOMS={b:'tomL',t:'tomH',c:'crash',r:'ride'},XTRA={m:'flam',n:'bell',s:'splash',l:'buzz',z:'triangle'};
/* n = [Schritt, Klangzeichen, Länge, Lautstärke] */
function playSynth(id,t,n){
  var v=n[3],w=n[1];
  if(id==='beat'){hit('kick',t,v);duck(t);}
  else if(id==='hats'){choke(t);var g=hit(w==='o'?'hatO':w==='k'?'hatP':'hatC',t,v,B.DUCK);if(w==='o')openHat=g;}
  else if(id==='clap')hit('clap',t,v,B.DUCK,.08);
  else if(id==='snare')hit(w==='k'?'stick':w==='s'?'rimshot':'snare',t,v,B.DUCK,.06);
  else if(id==='click')hit(PERC[w]||'shaker',t,v,B.DUCK);
  /* Der mittlere Tom ist der hohe, eine kleine Terz tiefer gestimmt */
  else if(id==='toms'){if(w==='p')hit('tomH',t,v,B.DUCK,0,.84);else hit(TOMS[w]||'tomL',t,v,B.DUCK);}
  else if(id==='fx')hit(XTRA[w]||'flam',t,v,B.DUCK,w==='m'||w==='l'?.06:0);
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
