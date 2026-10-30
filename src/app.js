/* MSTR: Speicherstand und Farbschema */
var KEY='mstr-v1'; /* fester Speicherschlüssel: nicht umbenennen, sonst geht der Beat verloren */
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')return s;}catch(e){}return {};}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}

/* Farbschema: System, hell oder dunkel */
var THEMES=['system','light','dark'];
function applyTheme(){
  var t=THEMES.indexOf(S.theme)>=0?S.theme:'system',de=document.documentElement;
  if(t==='system')de.removeAttribute('data-theme');else de.setAttribute('data-theme',t);
  var dark=t==='dark'||(t==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',dark?'#0E0E0F':'#FFFFFF');
  return t;
}
applyTheme();
