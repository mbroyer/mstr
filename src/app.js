/* Monster-Beatbox: Spielstand, Icons, Vorlesen */
var KEY='monster-beatbox-v1'; /* fester Speicherschlüssel: nicht umbenennen, sonst geht der Beat verloren */
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')return s;}catch(e){}return {};}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
var IC_P='var(--accent)',IC_L='var(--xp)',IC_D='#1d0a14';
var ICONS={
  play:'<path d="M14 8l28 16-28 16z" fill="'+IC_D+'" stroke="'+IC_D+'" stroke-width="4" stroke-linejoin="round"/>',
  speak:'<circle cx="24" cy="24" r="21" fill="'+IC_L+'"/><path d="M11 20v8h6l8 6V14l-8 6z" fill="'+IC_D+'"/><path d="M30 18a8 8 0 0 1 0 12M35 13a15 15 0 0 1 0 22" stroke="'+IC_D+'" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
};
function icoSvg(id){return '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">'+(ICONS[id]||'')+'</svg>';}
/* Vorlesen mit der deutschen Gerätestimme */
function say(text,force){
  if(!text||!force||!window.speechSynthesis)return;
  try{var ss=speechSynthesis;if(ss.speaking||ss.pending)ss.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang='de-DE';u.rate=.9;
    var de=ss.getVoices().filter(function(v){return /^de/i.test(v.lang);});if(de[0])u.voice=de[0];
    ss.speak(u);}catch(e){}
}
