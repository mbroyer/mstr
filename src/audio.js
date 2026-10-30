/* Ton: AudioContext, Freischalten bei der ersten Berührung, Master-Ausgang mit Limiter */
var ac=null;
function getAC(){
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
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
/* Lautstärke: alle Klänge laufen über Master-Gain + Limiter */
var _oc=null,_og=null;
function OUT(){if(_oc!==ac){_oc=ac;var g=ac.createGain();g.gain.value=2.8;var c=ac.createDynamicsCompressor();c.threshold.value=-14;c.knee.value=12;c.ratio.value=10;c.attack.value=.003;c.release.value=.15;g.connect(c);c.connect(ac.destination);_og=g;}return _og;}
