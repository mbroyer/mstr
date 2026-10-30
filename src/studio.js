/* ===== Teststudio (nur teststudio.html): echte Drumkits von DrumGizmo.org statt der eingebauten Klänge ===== */
/* KITMP3 (Klangname -> MP3 als Base64) setzt build.py davor. Clap, Perc und FX bleiben eingebaut. */
var KITS=[
  {id:'',n:'Original',d:'Die eingebauten MSTR-Klänge'},
  {id:'drs',n:'DRS',d:'DRSKit 2.1, handgebautes Kit von DRSDrums, Paiste-Becken'},
  {id:'crocell',n:'Crocell',d:'CrocellKit 1.1, Studio-Kit der Metal-Band Crocell'},
  {id:'muldjord',n:'Muldjord',d:'MuldjordKit 3, Tama Superstar von 2010'},
  {id:'aasimonster',n:'Aasimonster',d:'The Aasimonster 2.1, großes Rock-Kit'},
  {id:'shitty',n:'Shitty',d:'ShittyKit 1.2, Stagg-Einsteigerkit, roh und trocken'}];
var ROLES=[['kick','Kick'],['snare','Snare'],['rim','Rim'],['hhc','HH zu'],['hho','HH auf'],['hhp','Pedal'],['tom','Tom'],['ftom','Floor'],['crash','Crash'],['ride','Ride']];
/* Welcher Kit-Klang für welches Zeichen einer Spur */
var KMAP={hats:{x:'hhc',o:'hho',k:'hhp'},beat:{b:'kick'},snare:{p:'snare',k:'rim'},toms:{b:'kick',p:'snare',t:'tom',c:'crash'}};
var LVL={kick:1.25,snare:1.1,rim:.9,hhc:.75,hho:.6,hhp:.7,tom:1,ftom:1,crash:.6,ride:.7};
var KB={},kit=lsGet('mstr-kit');if(kit==null||!KITS.some(function(k){return k.id===kit;}))kit='drs';
var openHat=null;

/* MP3 dekodieren und die Stille am Anfang (MP3-Vorlauf) abschneiden, damit der Schlag genau auf dem Schritt sitzt */
function kitBuf(key){
  if(KB[key]||!KITMP3[key]||!ac)return KB[key]||null;
  KB[key]='busy';
  ac.decodeAudioData(b64buf(KITMP3[key])).then(function(buf){
    var L=buf.getChannelData(0),R=buf.numberOfChannels>1?buf.getChannelData(1):L,pk=0,i,a=0;
    for(i=0;i<L.length;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));
    while(a<L.length&&Math.abs(L[a])<pk*.05&&Math.abs(R[a])<pk*.05)a++;a=Math.max(0,a-(buf.sampleRate*.001|0));
    var out=ac.createBuffer(buf.numberOfChannels,buf.length-a,buf.sampleRate),c;
    for(c=0;c<buf.numberOfChannels;c++)out.getChannelData(c).set(buf.getChannelData(c).subarray(a));
    KB[key]=out;}).catch(function(){delete KB[key];});
  return null;
}
function loadKit(id){if(!id||!getAC())return;ROLES.forEach(function(r){kitBuf(id+'-'+r[0]);});}
function hasRole(id,r){return !!KITMP3[id+'-'+r];}

function hit(r,t,v,id){
  var buf=KB[kit+'-'+r];if(!buf||buf==='busy')return false;
  var s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;g.gain.value=v*LVL[r];s.connect(g);g.connect(B.OUT);
  if(r==='snare'||r==='rim'||r==='tom'||r==='ftom')send(g,B.REV,.06);
  /* Hi-Hat: zu oder Pedal würgt die offene ab */
  if((r==='hhc'||r==='hhp')&&openHat){openHat.gain.cancelScheduledValues(t);openHat.gain.setTargetAtTime(0,t,.012);openHat=null;}
  if(r==='hho')openHat=g;
  if(r==='kick')duck(t);
  s.start(t);return true;
}
var synthPlay=play;
play=function(id,t,n){
  if(!bus())return;if(useOwn(id))return playRec(id,t,n);
  var r=kit&&KMAP[id]&&KMAP[id][n[1]],v=n[3];
  if(r==='hhp'&&!hasRole(kit,'hhp')){r='hhc';v*=.45;}
  if(r==='rim'&&!hasRole(kit,'rim'))r=null;
  if(r){kitBuf(kit+'-'+r);if(hit(r,t,v,id))return;}
  synthPlay(id,t,n);
};
function pad(r){try{getAC();if(!ac)return;if(ac.state==='suspended')ac.resume();if(!bus())return;loadKit(kit);var t=ac.currentTime+.02;
  if(!hit(r,t,1))setTimeout(function(){hit(r,ac.currentTime+.02,1);},250);}catch(e){}}

/* Leiste unter der Vorlage: Kit wählen, Einzelklänge anhören, Quelle */
(function(){
  var el=document.createElement('section');el.className='studio';el.setAttribute('aria-label','Teststudio');
  el.innerHTML='<div class="srow"><span class="eyebrow">Teststudio · Drumkit</span><a class="eyebrow" href="https://drumgizmo.org/wiki/doku.php?id=kits" target="_blank" rel="noopener">drumgizmo.org</a></div>'+
    '<div class="kits" role="radiogroup" aria-label="Drumkit"></div><p class="sub" id="kitD"></p><div class="pads"></div>';
  var tr=document.getElementById('tracks');tr.parentNode.insertBefore(el,tr);
  var kr=el.querySelector('.kits'),pr=el.querySelector('.pads');
  function draw(){
    kr.innerHTML='';KITS.forEach(function(k){var b=document.createElement('button');b.type='button';b.className='kchip'+(k.id===kit?' sel':'');b.textContent=k.n;
      b.setAttribute('role','radio');b.setAttribute('aria-checked',k.id===kit?'true':'false');
      b.addEventListener('click',function(){kit=k.id;lsSet('mstr-kit',kit);openHat=null;loadKit(kit);draw();if(kit)pad('snare');});kr.appendChild(b);});
    var K=KITS.filter(function(k){return k.id===kit;})[0];
    document.getElementById('kitD').textContent=K.d+(kit?'. Samples von DrumGizmo.org, CC BY 4.0. Clap, Perc und FX bleiben eingebaut.':'.');
    pr.innerHTML='';pr.hidden=!kit;
    if(kit)ROLES.forEach(function(r){if(!hasRole(kit,r[0]))return;var b=document.createElement('button');b.type='button';b.className='kpad';b.textContent=r[1];
      b.addEventListener('pointerdown',function(e){e.preventDefault();pad(r[0]);b.classList.add('hit');setTimeout(function(){b.classList.remove('hit');},120);});
      b.addEventListener('click',function(e){if(e.detail===0)pad(r[0]);});pr.appendChild(b);});
  }
  draw();
  /* Klänge vorladen, sobald der Ton freigeschaltet ist */
  ['pointerdown','keydown'].forEach(function(ev){document.addEventListener(ev,function(){setTimeout(function(){loadKit(kit);},0);},true);});
})();
