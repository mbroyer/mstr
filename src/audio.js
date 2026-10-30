/* Ton: AudioContext, Freischalten bei der ersten Berührung, Master-Ausgang mit Limiter */
var ac=null;
function getAC(){
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    /* iOS (Safari 16.4+): als Medienwiedergabe anmelden, damit die Medienlautstärke gilt und nicht der leisere Umgebungsmodus */
    try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';}catch(e){}
    if(ac.state!=='running'&&ac.resume){var p=ac.resume();if(p&&p.catch)p.catch(function(){});}
  }catch(e){}
  return ac;
}
/* Browser erlauben Ton erst nach einer Berührung oder Taste: bei der ersten Eingabe Audio freischalten */
['pointerdown','touchend','keydown','click'].forEach(function(ev){
  document.addEventListener(ev,function(){
    var c=getAC();
    if(c&&!c.__u){c.__u=1;try{var b=c.createBuffer(1,1,22050),sr=c.createBufferSource();sr.buffer=b;sr.connect(c.destination);sr.start(0);}catch(e){}}
  },true);
});
/* Lautstärke: alle Klänge laufen über Master-Gain, Kompressor, Aufholverstärkung und einen weichen Begrenzer.
   Der Begrenzer fängt die Spitzen ab, die der Kompressor durchlässt; so bleibt nichts übersteuert und das Ganze
   kann deutlich lauter sein (vor allem für Handylautsprecher). OUT_PRE und OUT_MK steuern den Pegel */
var _oc=null,_og=null,OUT_PRE=2.4,OUT_MK=2.2;
function OUT(){if(_oc!==ac){_oc=ac;
  var g=ac.createGain();g.gain.value=OUT_PRE;
  var c=ac.createDynamicsCompressor();c.threshold.value=-20;c.knee.value=8;c.ratio.value=6;c.attack.value=.001;c.release.value=.12;
  var mk=ac.createGain();mk.gain.value=OUT_MK;
  /* Weicher Begrenzer: bis 0,6 linear, darüber sanft gerundet gegen 0,97 (ohne Oversampling, das würde wieder über 0 dB schwingen) */
  var lim=ac.createWaveShaper(),n=4096,cv=new Float32Array(n),i,K=.6,M=.97;
  for(i=0;i<n;i++){var x=i/(n-1)*4-2,a=Math.abs(x),y=a<=K?a:K+(M-K)*Math.tanh((a-K)/(M-K));cv[i]=x<0?-y:y;}
  lim.curve=cv;lim.oversample='none';
  g.connect(c);c.connect(mk);mk.connect(lim);lim.connect(ac.destination);_og=g;}
  return _og;}
