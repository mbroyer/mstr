/* Monster-Zeichnungen (aus NumNum: src/monster.js + Vokki-Gesichter) */
var STAGES=[
  {from:1,name:'Ei',snd:0,c:['#e6f9c4','#7fb83a','#f6ffe3']},
  {from:2,name:'Knackei',snd:0,c:['#9be35e','#6fbb36','#f4f7e6']},
  {from:3,name:'Schlüpfling',snd:1,c:['#b8f56a','#6aa91f','#efffd2']},
  {from:4,name:'Zottel',snd:1,c:['#ffa53a','#e07a14','#ffe2b8']},
  {from:5,name:'Stachling',snd:2,c:['#ff9ccc','#d94a8f','#ffe3f1']},
  {from:6,name:'Flatterling',snd:3,c:['#5aa8ff','#3a7ed8','#d2e8ff']},
  {from:8,name:'Flügeldrache',snd:3,c:['#6fe0d0','#1f9a8a','#d8fff8']},
  {from:9,name:'Glutdrache',snd:4,c:['#e2489a','#b32a74','#ffc4e2']},
  {from:11,name:'Feuerdrache',snd:4,c:['#ff8a5c','#d93a1f','#ffe2c8']},
  {from:13,name:'Kristalldrache',snd:5,c:['#7fd3ff','#4aa2e0','#e6f7ff']},
  {from:15,name:'Legende',snd:5,c:['#ffd75e','#e0a800','#fff4c4']},
  {from:17,name:'Sturmdrache',snd:6,c:['#5b7aa6','#3c5884','#bccfe9']},
  {from:20,name:'Schattendrache',snd:6,c:['#4a4f7a','#0b0d18','#c9d3ff']}
];
function stageOf(L){var s=0;STAGES.forEach(function(x,i){if(L>=x.from)s=i;});return s;}
/* Num: kleiner Drache im flachen Cartoon-Stil. Keine Umrisse: Formen leben von Farbe, eine dunklere Fläche derselben Farbe gibt Volumen.
   Jede Stufe hat eine eigene Silhouette. Augen und Mund sitzen immer an denselben Koordinaten, damit moodSvg passt. */
var monId=0;
var IRIS=['#ffe14d','#ffe14d','#fff06a','#7dffe0','#ffe14d','#fff1b0','#38f0ff'];
function flameSvg(x,y,a,b,k){
  k=k||1;
  return '<g class="tw"><path transform="translate('+x+' '+y+') scale('+k+')" d="M0 0q-7 -6 -3 -15q3 6 6 3q-1 -7 4 -12q5 10 2 18q-2 6 -9 6z" fill="'+a+'"/><path transform="translate('+x+' '+y+') scale('+k+')" d="M0 0q-3 -3 -1 -8q2 3 3 1q1 3 0 7z" fill="'+b+'"/></g>';
}
function spikyBody(){
  var pts=[],N=22,i,a,r,cx=60,cy=70;
  for(i=0;i<N*2;i++){
    a=Math.PI*2*i/(N*2)-Math.PI/2;
    r=(i%2?41:50);
    if(Math.sin(a)>0.35&&i%2===0)r=44;
    pts.push((cx+Math.cos(a)*r*1.02).toFixed(1)+' '+(cy+Math.sin(a)*r*0.9).toFixed(1));
  }
  return 'M'+pts.join('L')+'Z';
}
var SPIKY=spikyBody();
function mixHex(a,b,t){
  var p=function(h,i){return parseInt(h.substr(1+i*2,2),16);},r='#',i,v;
  for(i=0;i<3;i++){v=Math.round(p(a,i)*(1-t)+p(b,i)*t);r+=(v<16?'0':'')+v.toString(16);}
  return r;
}
/* Farben je Stufe: Grundfarbe, Schattenseite, Bauch/Flecken, Hornfarbe, Hornspitze, Iris */
var PAL=[
  {b:'#a6de6e',d:'#79bb45',l:'#dcf6bd',h:'#fff3c8',t:'#ffb43a',i:'#4fb3ff'},
  {b:'#86dc4b',d:'#5bb02a',l:'#dcf8bd',h:'#fff3c8',t:'#ff9a2e',i:'#ff9a2e'},
  {b:'#ff78b4',d:'#d9508f',l:'#ffc4de',h:'#b98cff',t:'#7b4dff',i:'#3cc7b4'},
  {b:'#36c4b2',d:'#21968a',l:'#b6f2e8',h:'#fff3c8',t:'#ffcf3a',i:'#ff6a8a'},
  {b:'#ff6b3d',d:'#d6432a',l:'#ffd3ad',h:'#fff0c4',t:'#ff9f2e',i:'#ffd23a'},
  {b:'#ffc83a',d:'#e39d12',l:'#fff1b6',h:'#ffffff',t:'#ff8a2a',i:'#ff4f7a'},
  {b:'#45478a',d:'#2a2b5c',l:'#5d61ad',h:'#a64dff',t:'#ff3df2',i:'#38f0ff'},
  {b:'#9be35e',d:'#6fbb36',l:'#f4f7e6',h:'#fff3c8',t:'#ffb43a',i:'#4fb3ff'},
  {b:'#ffa53a',d:'#e07a14',l:'#ffe2b8',h:'#fff3c8',t:'#ff5d8f',i:'#6a4dff'},
  {b:'#5aa8ff',d:'#3a7ed8',l:'#d2e8ff',h:'#ffd9ec',t:'#ff7bb0',i:'#ffb21f'},
  {b:'#e2489a',d:'#b32a74',l:'#ffc4e2',h:'#ffd166',t:'#ff6a1f',i:'#ffb21f'},
  {b:'#7fd3ff',d:'#4aa2e0',l:'#e6f7ff',h:'#ffffff',t:'#b9a4ff',i:'#8a5cff'},
  {b:'#5b7aa6',d:'#3c5884',l:'#bccfe9',h:'#e2e9f3',t:'#ffe14d',i:'#ffe14d'}
];
/* Reihenfolge der Stufen: Zahl = Bauplan (1 Ei … 7 Schattendrache, 8–13 die Zwischenstufen) */
var KIND=[1,8,2,9,3,10,4,11,5,12,6,13,7];
IRIS=KIND.map(function(n){return PAL[n-1].i;});
function monsterSvg(stage,mood){
  var n=KIND[stage],p=PAL[n-1],id='mg'+(++monId),K='#1b2340',W='#ffffff',MR='#6b1630',TG='#ff7b93';
  var s=['1','.78','.88','.94','1','1','1','1','.84','.9','.97','1','1'][n-1];
  var g='<svg viewBox="0 0 120 124" aria-hidden="true"'+((mood||n===7)?' class="'+(mood?'moodon ':'')+(n===7?'dark':'')+'"':'')+'><defs>'+
    (n===7?'<radialGradient id="'+id+'b"><stop offset="0" stop-color="#a64dff" stop-opacity=".6"/><stop offset=".55" stop-color="#38f0ff" stop-opacity=".2"/><stop offset="1" stop-color="#38f0ff" stop-opacity="0"/></radialGradient>':'')+
    '<radialGradient id="'+id+'a"><stop offset="0" stop-color="#ffe27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient></defs>';
  g+='<ellipse cx="60" cy="117" rx="32" ry="4.5" fill="#000" opacity=".14"/>';
  var cid=0;
  /* Körperfläche mit Schattenseite: dunkle Form, darüber die helle, nach links oben versetzt und auf die Form beschnitten */
  var blob=function(d,b,dk,dx,dy,extra){
    var c=id+'c'+(++cid);
    return '<clipPath id="'+c+'"><path d="'+d+'"/></clipPath><path d="'+d+'" fill="'+dk+'"/><g clip-path="url(#'+c+')"><path d="'+d+'" fill="'+b+'" transform="translate('+(dx==null?-8:dx)+' '+(dy==null?-6:dy)+')"/>'+(extra||'')+'</g>';
  };
  var mirror=function(inner){return '<g transform="translate(120 0) scale(-1 1)">'+inner+'</g>';};
  var limb=function(d,col,w){return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';};
  /* gestreiftes Horn: dicke Linie, darüber dieselbe Linie gestrichelt in der Spitzenfarbe */
  var stripeHorn=function(d,w){return limb(d,p.h,w)+'<path d="'+d+'" fill="none" stroke="'+p.t+'" stroke-width="'+w+'" stroke-dasharray="3.5 5" />';};
  /* spitzes Horn mit farbiger Spitze */
  var horn=function(bx,by,tx,ty,w){
    var ax=bx-w,bx2=bx+w,mx=bx+(tx-bx)*.55,my=by+(ty-by)*.55,k=.45;
    return '<path d="M'+ax+' '+by+'Q'+(mx-w*k)+' '+my+' '+tx+' '+ty+'Q'+(mx+w*k)+' '+my+' '+bx2+' '+by+'Z" fill="'+p.h+'"/>'+
      '<path d="M'+(bx+(tx-bx)*.6-w*.3)+' '+(by+(ty-by)*.6)+'L'+tx+' '+ty+'L'+(bx+(tx-bx)*.6+w*.3)+' '+(by+(ty-by)*.6)+'Z" fill="'+p.t+'"/>';
  };
  var eyes=function(X,ey,r,sc,ir){
    var o='<g class="eyes">';
    X.forEach(function(x){
      o+='<circle cx="'+x+'" cy="'+ey+'" r="'+r+'" fill="'+(sc||W)+'"/><circle cx="'+(x+r*.12)+'" cy="'+(ey+r*.1)+'" r="'+(r*.58)+'" fill="'+(ir||p.i)+'"/><circle cx="'+(x+r*.15)+'" cy="'+(ey+r*.12)+'" r="'+(r*.32)+'" fill="'+K+'"/><circle cx="'+(x-r*.12)+'" cy="'+(ey-r*.2)+'" r="'+(r*.17)+'" fill="#fff"/>';
    });
    return o+'</g>';
  };
  /* offener Mund: dunkelrot, Zunge unten, eckige Zähne oben */
  var mouth=function(cx,y,w,h,teeth,tc,cls){
    var c=id+'m'+(++cid),d='M'+(cx-w)+' '+y+'Q'+cx+' '+(y-h*.25)+' '+(cx+w)+' '+y+'Q'+(cx+w*.9)+' '+(y+h)+' '+cx+' '+(y+h)+'Q'+(cx-w*.9)+' '+(y+h)+' '+(cx-w)+' '+y+'Z';
    var o='<g class="'+(cls||'mouth')+'"><clipPath id="'+c+'"><path d="'+d+'"/></clipPath><path d="'+d+'" fill="'+MR+'"/><g clip-path="url(#'+c+')"><ellipse cx="'+cx+'" cy="'+(y+h)+'" rx="'+(w*.6)+'" ry="'+(h*.5)+'" fill="'+TG+'"/>';
    (teeth||[]).forEach(function(t){o+='<rect x="'+(cx+t[0])+'" y="'+(y-h*.3)+'" width="'+t[1]+'" height="'+(h*.3+t[2])+'" rx="1.2" fill="'+(tc||W)+'"/>';});
    return o+'</g></g>';
  };
  /* Einzelnes Auge: weiß, Iris, Pupille, Glanzpunkt; optional Lid (Anteil von oben, geneigt), Wimpern, Schlitzpupille, Blickrichtung */
  var eye=function(x,y,r,o){
    o=o||{};var c=id+'e'+(++cid),lx=(o.look||[0,0])[0]*r*.28,ly=(o.look||[0,0])[1]*r*.28;
    var e='<clipPath id="'+c+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'"/></clipPath><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(o.sc||W)+'"/><g clip-path="url(#'+c+')">';
    e+='<circle cx="'+(x+lx)+'" cy="'+(y+ly)+'" r="'+(r*(o.ir||.6))+'" fill="'+(o.iris||p.i)+'"/>';
    e+=o.slit?'<ellipse cx="'+(x+lx)+'" cy="'+(y+ly)+'" rx="'+(r*.13)+'" ry="'+(r*.45)+'" fill="'+K+'"/>':'<circle cx="'+(x+lx)+'" cy="'+(y+ly)+'" r="'+(r*.33)+'" fill="'+K+'"/>';
    e+='<circle cx="'+(x+lx-r*.2)+'" cy="'+(y+ly-r*.22)+'" r="'+(r*.15)+'" fill="#fff"/><circle cx="'+(x+lx+r*.18)+'" cy="'+(y+ly+r*.2)+'" r="'+(r*.07)+'" fill="#fff"/>';
    if(o.lid)e+='<g transform="rotate('+(o.tilt||0)+' '+x+' '+y+')"><rect x="'+(x-r-2)+'" y="'+(y-r-2)+'" width="'+(2*r+4)+'" height="'+(2*r*o.lid+2)+'" fill="'+(o.lidc||p.d)+'"/><path d="M'+(x-r-2)+' '+(y-r+2*r*o.lid)+'H'+(x+r+2)+'" stroke="'+K+'" stroke-opacity=".35" stroke-width="1.6"/></g>';
    e+='</g>';
    if(o.lash){var sg=o.lash;e+='<path d="M'+(x+sg*r*.55)+' '+(y-r*.82)+'l'+(sg*3)+' -4M'+(x+sg*r*.85)+' '+(y-r*.45)+'l'+(sg*4.5)+' -2.5M'+(x+sg*r*.98)+' '+(y-r*.02)+'l'+(sg*4.5)+' 0" stroke="'+K+'" stroke-width="2" stroke-linecap="round"/>';}
    return e;
  };
  var arc=function(d,col,w,op){return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"'+(op?' opacity="'+op+'"':'')+'/>';};
  var leg=function(x,col){return '<path d="M'+(x-11)+' 92V110Q'+(x-11)+' 117 '+(x-4)+' 117H'+(x+4)+'Q'+(x+11)+' 117 '+(x+11)+' 110V92Z" fill="'+col+'"/>'+arc('M'+(x-3.5)+' 117v-4.5M'+(x+3.5)+' 117v-4.5',K,1.5,.3)+arc('M'+(x-8)+' 117.5l-1 3M'+x+' 118v3M'+(x+8)+' 117.5l1 3','#fff',2.4);};
  /* ---- Anhängsel im selben Stil wie der Körper: jede Form hat eine helle und eine dunkle Seite ---- */
  var F=function(v){return (+v).toFixed(1);};
  var bez=function(q,t){var u=1-t;if(q.length===3)return [u*u*q[0][0]+2*u*t*q[1][0]+t*t*q[2][0],u*u*q[0][1]+2*u*t*q[1][1]+t*t*q[2][1]];
    return [u*u*u*q[0][0]+3*u*u*t*q[1][0]+3*u*t*t*q[2][0]+t*t*t*q[3][0],u*u*u*q[0][1]+3*u*u*t*q[1][1]+3*u*t*t*q[2][1]+t*t*t*q[3][1]];};
  /* Spitz zulaufende Röhre entlang einer oder mehrerer Bezierkurven (Horn, Schwanz).
     o: w0/w1 Breite an Wurzel/Spitze, cl/cd helle/dunkle Farbe, tip:[hell,dunkel] ab tipAt, ridge: Anzahl Rillen, flip: Lichtseite tauschen */
  var tube=function(segs,o){
    var C=[],N=14,i,j,L=[],R=[],a,b,dx,dy,len,w,T;
    segs.forEach(function(q,si){for(j=(si?1:0);j<=N;j++)C.push(bez(q,j/N));});
    T=C.length-1;
    for(i=0;i<=T;i++){a=C[Math.max(0,i-1)];b=C[Math.min(T,i+1)];dx=b[0]-a[0];dy=b[1]-a[1];len=Math.hypot(dx,dy)||1;
      w=(o.w0+(o.w1-o.w0)*Math.pow(i/T,o.pow||1))/2;L.push([C[i][0]-dy/len*w,C[i][1]+dx/len*w]);R.push([C[i][0]+dy/len*w,C[i][1]-dx/len*w]);}
    if(o.flip){var tmp=L;L=R;R=tmp;}
    var poly=function(A,B,k0,k1){var d='M'+F(A[k0][0])+' '+F(A[k0][1]);for(i=k0+1;i<=k1;i++)d+='L'+F(A[i][0])+' '+F(A[i][1]);for(i=k1;i>=k0;i--)d+='L'+F(B[i][0])+' '+F(B[i][1]);return d+'Z';};
    var out='<path d="'+poly(L,C,0,T)+'" fill="'+o.cl+'"/><path d="'+poly(C,R,0,T)+'" fill="'+o.cd+'"/>';
    if(o.tip){var k=Math.round(T*(o.tipAt||.7));out+='<path d="'+poly(L,C,k,T)+'" fill="'+o.tip[0]+'"/><path d="'+poly(C,R,k,T)+'" fill="'+o.tip[1]+'"/>';}
    if(o.ridge){var st=Math.floor(T*.85/(o.ridge+1));for(j=1;j<=o.ridge;j++){i=j*st;out+='<path d="M'+F(L[i][0])+' '+F(L[i][1])+'Q'+F(C[i][0]+(C[Math.min(T,i+1)][0]-C[i][0])*2)+' '+F(C[i][1]+(C[Math.min(T,i+1)][1]-C[i][1])*2)+' '+F(R[i][0])+' '+F(R[i][1])+'" fill="none" stroke="'+(o.rc||K)+'" stroke-opacity="'+(o.ro||.25)+'" stroke-width="1.6" stroke-linecap="round"/>';}}
    if(o.cap)out+='<circle cx="'+F(C[T][0])+'" cy="'+F(C[T][1])+'" r="'+F(o.w1/2)+'" fill="'+o.cd+'"/>';
    return out;
  };
  /* Flamme in drei Schichten */
  var flame=function(x,y,k,cols){
    cols=cols||['#ff5a1f','#ffa31a','#ffe066'];
    var f=function(sc,c){return '<path transform="translate('+x+' '+y+') scale('+(k*sc)+')" d="M0 0C-8 0 -11 -7 -8 -13C-6 -9 -3 -9 -3 -12C-3 -17 0 -21 3 -24C2 -18 7 -16 8 -10C9 -5 6 0 0 0Z" fill="'+c+'"/>';};
    return '<g class="tw">'+f(1,cols[0])+f(.7,cols[1])+f(.42,cols[2])+'</g>';
  };
  /* Fledermausflügel: Arm bis zum Handgelenk, drei Fingerknochen, Hautsegel mit gebogenem Rand, Felder abwechselnd hell und dunkel */
  var batWing=function(o){
    var r=o.root,w=o.wrist,t=o.tips,e=o.end,m=o.mem,out='';
    var sc=function(a,b,k){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;return [F(mx+(w[0]-mx)*k),F(my+(w[1]-my)*k)];};
    var pts=[t[0]].concat(t.slice(1)).concat([e]);
    for(var i=0;i<pts.length-1;i++){var c=sc(pts[i],pts[i+1],o.scal||.32);
      out+='<path d="M'+w[0]+' '+w[1]+'L'+pts[i][0]+' '+pts[i][1]+'Q'+c[0]+' '+c[1]+' '+pts[i+1][0]+' '+pts[i+1][1]+(i===pts.length-2?'L'+r[0]+' '+r[1]:'')+'Z" fill="'+m[i%2]+'"/>';}
    out+='<path d="M'+r[0]+' '+r[1]+'L'+w[0]+' '+w[1]+'L'+e[0]+' '+e[1]+'Z" fill="'+m[1]+'"/>';
    out+=tube([[r,[(r[0]+w[0])/2,(r[1]+w[1])/2-4],w]],{w0:o.bw+3,w1:o.bw,cl:o.bl,cd:o.bd});
    t.forEach(function(tp){out+=tube([[w,[(w[0]+tp[0])/2,(w[1]+tp[1])/2-3],tp]],{w0:o.bw,w1:1.2,cl:o.bl,cd:o.bd});});
    out+='<circle cx="'+w[0]+'" cy="'+w[1]+'" r="'+(o.bw*.7)+'" fill="'+o.bl+'"/><path d="M'+t[0][0]+' '+t[0][1]+'l-3 -4l4 1Z" fill="'+(o.claw||'#fff')+'"/>';
    return out;
  };
  /* Federflügel: Federn nebeneinander, jede mit heller und dunkler Hälfte und Kiel */
  var featherWing=function(root,n,len,ang0,ang1,cl,cd,ki){
    var out='',i,a,tx,ty,mx,my,nx,ny,wd;
    for(i=n-1;i>=0;i--){a=(ang0+(ang1-ang0)*i/(n-1))*Math.PI/180;wd=5+i*.6;var L2=len*(1-i*.08);
      tx=root[0]+Math.cos(a)*L2;ty=root[1]+Math.sin(a)*L2;mx=(root[0]+tx)/2;my=(root[1]+ty)/2;nx=-Math.sin(a)*wd;ny=Math.cos(a)*wd;
      out+='<path d="M'+F(root[0])+' '+F(root[1])+'Q'+F(mx+nx)+' '+F(my+ny)+' '+F(tx)+' '+F(ty)+'Z" fill="'+cd+'"/><path d="M'+F(root[0])+' '+F(root[1])+'Q'+F(mx-nx)+' '+F(my-ny)+' '+F(tx)+' '+F(ty)+'Z" fill="'+cl+'"/>'+
        '<path d="M'+F(root[0])+' '+F(root[1])+'L'+F(tx)+' '+F(ty)+'" stroke="'+ki+'" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>';}
    return out;
  };
  /* ---- Stimmungen im selben Stil: Augen und Mund je Monster an ihrer eigenen Stelle ---- */
  var FACE={1:{E:[[46,82,8.5],[74,82,8.5]],m:[60,92,9]},8:{E:[[44,64,10],[76,64,10]],m:[60,76,9]},2:{E:[[60,62,15]],m:[60,84,13]},
    3:{E:[[42,66,9],[78,64,10.5],[60,48,6]],m:[60,80,12]},10:{E:[[44,66,12],[76,66,12]],m:[60,82,11]},
    7:{E:[[44,67,10],[76,67,10],[40,47,5],[80,47,5]],m:[60,82,15],sc:'#38f0ff',ir:'#d9fbff',slit:1}};
  var moodArt=function(md){
    if(!md)return '';
    var f=FACE[n]||{E:[[44,66,10],[76,66,10]],m:[60,80,14]},E=f.E,mx=f.m[0],my=f.m[1],mw=f.m[2],o='',lc=n===7?'#38f0ff':K;
    var happy=function(){E.forEach(function(e){o+='<path d="M'+F(e[0]-e[2]*.75)+' '+F(e[1]+e[2]*.25)+'Q'+e[0]+' '+F(e[1]-e[2]*.95)+' '+F(e[0]+e[2]*.75)+' '+F(e[1]+e[2]*.25)+'" fill="none" stroke="'+lc+'" stroke-width="'+F(Math.max(2.4,e[2]*.36))+'" stroke-linecap="round"/>';});};
    var open=function(look,lid,sad){E.forEach(function(e){o+=eye(e[0],e[1],e[2],{look:look,sc:f.sc,iris:f.ir,slit:f.slit,lid:lid,lidc:p.d,tilt:sad?(e[0]<60?-16:e[0]>60?16:0):0});});};
    var big=function(k){o+=mouth(mx,my,mw*k,mw*k*1.05,[[-mw*k*.5,mw*k*.32,1.5],[mw*k*.12,mw*k*.32,1.5]],n===7?'#38f0ff':'#fff','mm');};
    var star=function(x,y,r,c,cl){return '<path class="'+cl+'" d="M'+x+' '+(y-r)+'Q'+x+' '+y+' '+(x+r)+' '+y+'Q'+x+' '+y+' '+x+' '+(y+r)+'Q'+x+' '+y+' '+(x-r)+' '+y+'Q'+x+' '+y+' '+x+' '+(y-r)+'Z" fill="'+c+'"/>';};
    var spark=star(8,30,8,'#ffe066','tw')+star(112,22,6,'#ff7bb0','tw tw2')+star(114,74,6,'#7fe3ff','tw tw3')+star(4,80,5,'#b8f56a','tw tw2');
    if(md==='happy'||md==='wave'){happy();big(1);}
    else if(md==='thumb'){happy();big(1);
      o+='<g class="thmb" transform="translate(84 58) rotate(-12) scale(1.3)"><rect x="0" y="8" width="22" height="18" rx="8" fill="'+p.d+'"/><rect x="0" y="8" width="19" height="15" rx="7" fill="'+p.b+'"/><path d="M4 11V0Q4 -7 10 -7Q14 -7 14 -1L13 9Z" fill="'+p.b+'"/><path d="M10 -7Q14 -7 14 -1L13 9L10 9Z" fill="'+p.d+'"/><path d="M4 16H18M4 21H18" stroke="'+p.d+'" stroke-width="1.6" stroke-linecap="round"/></g>'+spark;}
    else if(md==='tongue'){happy();
      o+='<path d="M'+(mx-mw*.8)+' '+my+'Q'+mx+' '+(my+mw*.9)+' '+(mx+mw*.8)+' '+my+'" fill="none" stroke="'+MR+'" stroke-width="3.2" stroke-linecap="round"/>';
      o+='<g class="tng"><path d="M'+(mx-6)+' '+(my+5)+'V'+(my+14)+'Q'+mx+' '+(my+23)+' '+(mx+6)+' '+(my+14)+'V'+(my+5)+'Z" fill="'+TG+'"/><path d="M'+mx+' '+(my+5)+'V'+(my+19)+'Q'+(mx+5)+' '+(my+17)+' '+(mx+6)+' '+(my+14)+'V'+(my+5)+'Z" fill="#e85a77"/><path d="M'+mx+' '+(my+9)+'V'+(my+16)+'" stroke="'+MR+'" stroke-width="1.6" stroke-linecap="round" opacity=".5"/></g>'+spark;}
    else if(md==='dance'||md==='flip'||md==='party'||md==='salto'||md==='joy'){happy();big(1.25);o+=spark;}
    else if(md==='chomp'){happy();big(2.1);} /* Maul weit auf: gleich wird gefuttert */
    else if(md==='chew'){ /* kaut: Augen offen, Mund zu, volle Backen */
      open([0,.15]);
      o+='<circle cx="'+F(mx-mw*1.25)+'" cy="'+F(my-1)+'" r="'+F(mw*.55)+'" fill="#ff8aa8" opacity=".45"/><circle cx="'+F(mx+mw*1.25)+'" cy="'+F(my-1)+'" r="'+F(mw*.55)+'" fill="#ff8aa8" opacity=".45"/>';
      o+='<path d="M'+F(mx-mw*.55)+' '+F(my+1)+'Q'+mx+' '+F(my+5)+' '+F(mx+mw*.55)+' '+F(my+1)+'" fill="none" stroke="'+MR+'" stroke-width="3.2" stroke-linecap="round"/>';}
    else if(md==='medal'){happy();
      o+='<path d="M'+(mx-mw*.7)+' '+my+'Q'+mx+' '+(my+mw*.8)+' '+(mx+mw*.7)+' '+my+'Q'+mx+' '+(my+mw*.35)+' '+(mx-mw*.7)+' '+my+'Z" fill="'+MR+'"/>';
      var yy=Math.min(104,my+20);
      o+='<path d="M'+(mx-9)+' '+(yy-14)+'L'+(mx-2)+' '+(yy-4)+'L'+(mx+2)+' '+(yy-4)+'L'+(mx+9)+' '+(yy-14)+'L'+(mx+4)+' '+(yy-14)+'L'+mx+' '+(yy-8)+'L'+(mx-4)+' '+(yy-14)+'Z" fill="#ff4f6a"/><circle cx="'+mx+'" cy="'+(yy+3)+'" r="8" fill="#e3a21a"/><circle cx="'+(mx-1)+'" cy="'+(yy+2)+'" r="6.5" fill="#ffd23a"/>'+star(mx-1,yy+2,4,'#fff6c8','')+spark;}
    else if(md==='cheer'){open([.2,-.8]);big(.9);o+=spark;}
    else if(md==='sleep'){
      E.forEach(function(e){o+='<path d="M'+F(e[0]-e[2]*.75)+' '+e[1]+'Q'+e[0]+' '+F(e[1]+e[2]*.8)+' '+F(e[0]+e[2]*.75)+' '+e[1]+'" fill="none" stroke="'+lc+'" stroke-width="'+F(Math.max(2.4,e[2]*.34))+'" stroke-linecap="round"/>';});
      o+='<ellipse cx="'+mx+'" cy="'+(my+4)+'" rx="4" ry="5" fill="'+MR+'"/><ellipse cx="'+mx+'" cy="'+(my+6.5)+'" rx="2.6" ry="2" fill="'+TG+'"/>';
      o+='<text class="zz" x="92" y="30" font-size="18" font-weight="800" fill="#c9d3ff" font-family="sans-serif">z</text><text class="zz zz2" x="102" y="16" font-size="13" font-weight="800" fill="#c9d3ff" font-family="sans-serif">z</text>';}
    else if(md==='sad'){open([0,.8],.32,1);
      o+='<path d="M'+(mx-mw*.6)+' '+(my+8)+'Q'+mx+' '+(my-2)+' '+(mx+mw*.6)+' '+(my+8)+'" fill="none" stroke="'+MR+'" stroke-width="3.4" stroke-linecap="round"/>';
      var tx=E[0][0]-E[0][2]*.5,ty=E[0][1]+E[0][2]+2;
      o+='<g class="tear"><path d="M'+tx+' '+ty+'Q'+(tx-6)+' '+(ty+9)+' '+tx+' '+(ty+12)+'Q'+(tx+6)+' '+(ty+9)+' '+tx+' '+ty+'Z" fill="#5cb8ff"/><path d="M'+tx+' '+ty+'Q'+(tx+6)+' '+(ty+9)+' '+tx+' '+(ty+12)+'Z" fill="#3d93e0"/><circle cx="'+(tx-1.6)+'" cy="'+(ty+8)+'" r="1.3" fill="#fff"/></g>';}
    else{ /* hm */
      open([.7,-.7]);
      o+='<path d="M'+(mx-mw*.6)+' '+(my+4)+'Q'+(mx-mw*.3)+' '+my+' '+mx+' '+(my+4)+'T'+(mx+mw*.6)+' '+(my+4)+'" fill="none" stroke="'+MR+'" stroke-width="3.2" stroke-linecap="round"/>';
      var sx=E[E.length>2?1:E.length-1][0]+14,sy=E[0][1]-14;
      o+='<g class="tear"><path d="M'+sx+' '+sy+'Q'+(sx-5)+' '+(sy+7)+' '+sx+' '+(sy+10)+'Q'+(sx+5)+' '+(sy+7)+' '+sx+' '+sy+'Z" fill="#5cb8ff"/><path d="M'+sx+' '+sy+'Q'+(sx+5)+' '+(sy+7)+' '+sx+' '+(sy+10)+'Z" fill="#3d93e0"/></g>';}
    return '<g class="mood">'+o+'</g>';
  };
  if(n===1){
    var egg='M60 8C88 8 104 50 104 80C104 104 86 114 60 114C34 114 16 104 16 80C16 50 32 8 60 8Z';
    g+='<g class="mbob">'+tube([[[47,22],[44,12],[40,4]]],{w0:10,w1:1,cl:p.h,cd:mixHex(p.h,p.t,.45),tip:[p.t,mixHex(p.t,K,.2)],tipAt:.6})+tube([[[73,22],[76,12],[80,4]]],{w0:10,w1:1,cl:p.h,cd:mixHex(p.h,p.t,.45),tip:[p.t,mixHex(p.t,K,.2)],tipAt:.6})+
      blob(egg,p.b,p.d,-9,-6,'<circle cx="40" cy="36" r="6" fill="'+p.d+'" opacity=".45"/><circle cx="72" cy="26" r="7" fill="'+p.d+'" opacity=".45"/><circle cx="86" cy="54" r="5" fill="'+p.d+'" opacity=".45"/><circle cx="28" cy="62" r="4" fill="'+p.d+'" opacity=".45"/><circle cx="60" cy="46" r="3.5" fill="'+p.d+'" opacity=".45"/><path d="M18 70L30 62L40 72L52 62L62 72L74 62L84 72L96 62L104 70" fill="none" stroke="'+p.l+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>')+
      '<path d="M50 14L56 4L62 12L68 6" fill="none" stroke="'+p.d+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<g class="brows">'+arc('M39 70Q46 66 52 70M68 70Q74 66 81 70',p.d,3)+'</g><g class="eyes">'+eye(46,82,8.5,{look:[.3,-.7]})+eye(74,82,8.5,{look:[.3,-.7]})+'</g>'+
      '<g class="mouth"><ellipse cx="60" cy="96" rx="4.5" ry="5.5" fill="'+MR+'"/><ellipse cx="60" cy="99" rx="3" ry="2" fill="'+TG+'"/><rect x="58" y="90.5" width="4" height="3" rx="1" fill="#fff"/></g>'+
      '<circle cx="34" cy="92" r="4.5" fill="#ff6f8f" opacity=".35"/><circle cx="86" cy="92" r="4.5" fill="#ff6f8f" opacity=".35"/>'+moodArt(mood)+'</g></svg>';
    return g;
  }
  if(n===8){ /* Knackei: der Kopf schaut schon aus der Schale, ein Schalenstück sitzt noch als Hut obendrauf */
    var head='M60 30C84 30 98 48 98 70C98 92 82 104 60 104C38 104 22 92 22 70C22 48 36 30 60 30Z';
    var shell='M16 82L27 72L38 83L49 72L60 83L71 72L82 83L93 72L104 82C104 106 86 117 60 117C34 117 16 106 16 82Z';
    var cap='M34 40L42 47L50 39L58 47L66 39L74 47L82 40C80 24 70 14 58 14C46 14 36 24 34 40Z';
    g+='<g class="mbob">'+tube([[[30,76],[18,72],[16,62]]],{w0:9,w1:7,cl:p.b,cd:p.d,cap:1})+tube([[[90,76],[102,72],[104,62]]],{w0:9,w1:7,cl:p.b,cd:p.d,cap:1})+
      blob(head,p.b,p.d,-8,-6,'<circle cx="34" cy="56" r="3.5" fill="'+p.d+'" opacity=".5"/><circle cx="88" cy="60" r="4.5" fill="'+p.d+'" opacity=".5"/>')+
      '<g class="brows">'+arc('M34 52Q42 47 50 51M70 51Q78 47 86 52',p.d,3)+'</g><g class="eyes">'+eye(44,64,10,{look:[.2,.3]})+eye(76,64,10,{look:[.2,.3]})+'</g>'+
      '<circle cx="28" cy="76" r="4.5" fill="#ff6f8f" opacity=".35"/><circle cx="92" cy="76" r="4.5" fill="#ff6f8f" opacity=".35"/>'+
      mouth(60,76,9,7,[[-4,3.5,1],[.5,3.5,1]])+
      blob(shell,p.l,'#d6dfbf',-7,-5,'<circle cx="34" cy="96" r="4" fill="'+p.d+'" opacity=".35"/><circle cx="74" cy="104" r="5" fill="'+p.d+'" opacity=".35"/><circle cx="90" cy="92" r="3" fill="'+p.d+'" opacity=".35"/><circle cx="52" cy="108" r="3" fill="'+p.d+'" opacity=".35"/>')+
      '<circle cx="23" cy="78" r="6" fill="'+p.b+'"/><circle cx="97" cy="78" r="6" fill="'+p.d+'"/>'+arc('M19 80l-1 3M23 81.5v3M27 80l1 3M93 80l-1 3M97 81.5v3M101 80l1 3','#fff',2)+
      '<g transform="rotate(-14 58 30)">'+blob(cap,p.l,'#d6dfbf',-6,-4,'<circle cx="50" cy="26" r="3" fill="'+p.d+'" opacity=".35"/><circle cx="66" cy="22" r="2.5" fill="'+p.d+'" opacity=".35"/>')+'</g>'+
      moodArt(mood)+'</g></svg>';
    return g;
  }
  if(n===7){
    var dsp=function(x,y,col){return '<path d="M'+x+' '+(y-5)+'L'+(x+4)+' '+y+'L'+x+' '+(y+5)+'L'+(x-4)+' '+y+'Z" fill="'+col+'"/>';};
    g+='<circle cx="60" cy="64" r="68" fill="url(#'+id+'b)" class="aura"/>';
    g+='<g class="orbit">'+dsp(128,64,'#38f0ff')+dsp(26,122,'#ff3df2')+dsp(26,6,'#a64dff')+'</g>';
    g+='<path class="bolt" d="M-4 8L8 26L2 28L14 50" fill="none" stroke="#38f0ff" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round"/><path class="bolt b2" d="M124 14L112 34L118 36L108 58" fill="none" stroke="#ff3df2" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round"/>';
    g+='<rect class="pt" x="4" y="100" width="5" height="5" fill="#38f0ff"/><rect class="pt p2" x="112" y="96" width="4" height="4" fill="#ff3df2"/><rect class="pt p3" x="100" y="108" width="4" height="4" fill="#a64dff"/>';
  }
  if(n===6){
    var rays='',k;
    for(k=0;k<16;k++)rays+='<path d="M60 64Q52 10 60 -12Q68 10 60 64Z" transform="rotate('+(k*22.5)+' 60 64)" fill="'+(k%2?'#ffb347':'#ffe066')+'" opacity="'+(k%2?'.22':'.32')+'"/>';
    rays+='<path d="M8 20l2 5l5 2l-5 2l-2 5l-2 -5l-5 -2l5 -2Z M112 24l1.5 4l4 1.5l-4 1.5l-1.5 4l-1.5 -4l-4 -1.5l4 -1.5Z M104 104l1.5 4l4 1.5l-4 1.5l-1.5 4l-1.5 -4l-4 -1.5l4 -1.5Z" fill="#fff6c8"/>';
    g+='<g class="rays">'+rays+'</g><circle cx="60" cy="64" r="60" fill="url(#'+id+'a)" class="aura"/>';
  }
  g+='<g class="mbob"><g transform="translate(60 112) scale('+s+') translate(-60 -112)">';
  var body,spots='',belly='<ellipse cx="60" cy="101" rx="24" ry="14" fill="'+p.l+'"/>';
  /* ---- hinten: Schwanz, Flügel, Kragen ---- */
  var hd=mixHex(p.h,p.t,.45),td=mixHex(p.t,K,.22),tail=function(segs,w0,w1,extra){return tube(segs,{w0:w0,w1:w1,cl:p.b,cd:p.d,ridge:extra&&extra.ridge,rc:p.d,ro:.6,cap:1});};
  if(n===2){
    g+=tail([[[86,102],[110,110],[112,92]]],12,5)+tube([[[112,93],[112,86],[118,82]]],{w0:5,w1:1,cl:p.h,cd:hd});
    body='M60 30C88 30 102 50 102 76C102 100 86 112 60 112C34 112 18 100 18 76C18 50 32 30 60 30Z';
    spots='<circle cx="34" cy="62" r="4" fill="'+p.d+'" opacity=".5"/><circle cx="86" cy="56" r="5" fill="'+p.d+'" opacity=".5"/><circle cx="78" cy="42" r="3" fill="'+p.d+'" opacity=".5"/>';
  }
  if(n===3){
    g+=tail([[[86,100],[108,114],[112,96]]],11,7);
    g+=tube([[[114,84],[116,78],[117,72]]],{w0:6,w1:1,cl:p.h,cd:p.t})+tube([[[121,90],[126,89],[130,86]]],{w0:6,w1:1,cl:p.h,cd:p.t})+tube([[[107,88],[103,85],[100,81]]],{w0:6,w1:1,cl:p.h,cd:p.t});
    g+='<circle cx="113" cy="91" r="9" fill="'+p.d+'"/><circle cx="111" cy="89" r="7" fill="'+p.b+'"/><circle cx="109" cy="87" r="2" fill="'+p.l+'"/>';
    body=SPIKY;
    spots='<circle cx="36" cy="54" r="6" fill="'+p.l+'" opacity=".7"/><circle cx="84" cy="48" r="4.5" fill="'+p.l+'" opacity=".7"/><circle cx="90" cy="70" r="3" fill="'+p.l+'" opacity=".7"/><circle cx="28" cy="74" r="3" fill="'+p.l+'" opacity=".7"/>';
  }
  if(n===4){
    g+=tail([[[80,100],[112,124],[118,94]],[[118,94],[124,72],[108,64]]],13,5,{ridge:4});
    g+='<path d="M110 66C96 62 92 48 98 40C104 48 110 50 112 58C114 48 120 44 124 46C124 56 118 64 110 66Z" fill="'+p.d+'"/><path d="M110 66C100 60 98 50 98 40C104 48 110 52 110 66Z" fill="'+p.b+'"/><path d="M110 66L102 48M110 66L120 50" stroke="'+p.l+'" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>';
    var w4=batWing({root:[32,58],wrist:[6,26],tips:[[-20,0],[-32,34],[-22,64]],end:[24,82],mem:['#9cf0e2','#72d9c9'],bl:p.b,bd:p.d,bw:5,scal:.3});
    g+='<g class="wing">'+w4+'</g><g class="wing wr">'+mirror(w4)+'</g>';
    body='M60 20C90 20 108 40 106 66C104 84 88 92 82 100C80 108 70 112 60 112C50 112 40 108 38 100C32 92 16 84 14 66C12 40 30 20 60 20Z';
    spots='<path d="M60 22L60 34M46 24L48 34M74 24L72 34" stroke="'+p.d+'" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
  }
  if(n===5){
    g+=tail([[[80,96],[120,108],[116,72]]],18,7,{ridge:3})+flame(116,74,1.5);
    g+='<path d="M98 100L104 92L106 102ZM110 92L117 86L115 97ZM114 80L121 76L118 86Z" fill="'+p.h+'"/>';
    var w5=batWing({root:[28,56],wrist:[4,22],tips:[[-14,4],[-22,28],[-14,48]],end:[20,64],mem:['#ffa77c','#f07f52'],bl:p.b,bd:p.d,bw:5,scal:.34});
    g+='<g class="wing">'+w5+'</g><g class="wing wr">'+mirror(w5)+'</g>';
    body='M26 30C40 20 80 20 94 30C108 44 108 70 106 84C102 104 84 112 60 112C36 112 18 104 14 84C12 70 12 44 26 30Z';
    belly='<ellipse cx="60" cy="105" rx="22" ry="9" fill="'+p.l+'"/>';
    spots='<circle cx="30" cy="50" r="4" fill="'+p.d+'" opacity=".55"/><circle cx="92" cy="46" r="5" fill="'+p.d+'" opacity=".55"/><circle cx="96" cy="62" r="3" fill="'+p.d+'" opacity=".55"/><circle cx="24" cy="66" r="3" fill="'+p.d+'" opacity=".55"/>';
  }
  if(n===6){
    g+=tail([[[84,96],[116,112],[120,80]]],12,5);
    g+=featherWing([120,82],4,22,-120,-50,'#ffb347','#ff8a2a','#fff1b6');
    var w6=featherWing([28,66],4,26,-150,-205,'#fff6d6','#ffd36b','#e39d12');
    g+='<g class="wing">'+w6+'</g><g class="wing wr">'+mirror(w6)+'</g>';
    /* Sonnenkragen: Blütenblätter mit heller und dunkler Hälfte */
    var col='',k2,an,tx2,ty2;
    for(k2=0;k2<9;k2++){an=(-180+k2*22.5)*Math.PI/180;tx2=60+Math.cos(an)*50;ty2=50+Math.sin(an)*46;
      var nx=-Math.sin(an)*15,ny=Math.cos(an)*15,mx2=60+Math.cos(an)*30,my2=50+Math.sin(an)*28,c1=k2%2?'#ff8a2a':'#ffa94a',c2=k2%2?'#e8701a':'#ff8a2a';
      col+='<path d="M60 50Q'+F(mx2+nx)+' '+F(my2+ny)+' '+F(tx2)+' '+F(ty2)+'Z" fill="'+c2+'"/><path d="M60 50Q'+F(mx2-nx)+' '+F(my2-ny)+' '+F(tx2)+' '+F(ty2)+'Z" fill="'+c1+'"/><circle cx="'+F(60+Math.cos(an)*44)+'" cy="'+F(50+Math.sin(an)*41)+'" r="2" fill="#ffe066"/>';}
    g+=col;
    body='M60 22C88 22 104 46 104 74C104 98 84 110 60 110C36 110 16 98 16 74C16 46 32 22 60 22Z';
    belly='<path d="M44 84L60 78L76 84L76 102L60 108L44 102Z" fill="'+p.l+'"/><path d="M50 88L60 84L70 88L70 99L60 103L50 99Z" fill="#ffe27a"/>';
  }
  if(n===7){
    g+=tail([[[80,100],[112,114],[116,86]],[[116,86],[120,70],[106,64]]],10,4)+flame(106,66,1.3,['#7b4dff','#38f0ff','#e9feff']);
    var w7=batWing({root:[30,62],wrist:[2,22],tips:[[-12,-4],[-28,26],[-22,58]],end:[22,80],mem:['#2b2d63','#1d1e42'],bl:'#5d61ad',bd:'#3a3c78',bw:4.5,scal:.4,claw:'#38f0ff'});
    g+='<g class="wing">'+w7+'</g><g class="wing wr">'+mirror(w7)+'</g>';
    body='M60 18C84 18 100 34 103 56C106 78 100 98 84 108C76 113 68 114 60 114C52 114 44 113 36 108C20 98 14 78 17 56C20 34 36 18 60 18Z';
    spots='<circle cx="32" cy="48" r="5" fill="'+p.l+'" opacity=".6"/><circle cx="90" cy="44" r="4" fill="'+p.l+'" opacity=".6"/><circle cx="86" cy="90" r="3" fill="'+p.l+'" opacity=".6"/>';
    belly='<ellipse cx="60" cy="96" rx="24" ry="15" fill="'+p.l+'" opacity=".55"/>';
  }
  if(n===9){ /* Zottel: Fellknäuel mit welligem Rand und Puschelschwanz */
    g+=tail([[[86,100],[108,108],[110,94]]],11,7);
    var pu='';[[112,90,8],[106,86,6],[116,96,6]].forEach(function(c){pu+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="'+p.d+'"/><circle cx="'+(c[0]-1.5)+'" cy="'+(c[1]-1.5)+'" r="'+(c[2]-2)+'" fill="'+p.b+'"/>';});g+=pu;
    var bp='',kk,N2=22;for(kk=0;kk<=N2;kk++){var aa=Math.PI*2*kk/N2-Math.PI/2,bb=Math.PI*2*(kk+.5)/N2-Math.PI/2;
      var x1=60+Math.cos(aa)*42,y1=72+Math.sin(aa)*40,xc=60+Math.cos(bb)*48,yc=72+Math.sin(bb)*46;bp+=(kk?'Q'+F(xc)+' '+F(yc)+' ':'M')+F(x1)+' '+F(y1);}
    body=bp+'Z';
    spots='<path d="M30 60q4 -6 8 0M80 50q4 -6 8 0M86 74q4 -6 8 0M26 82q4 -6 8 0" fill="none" stroke="'+p.d+'" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>';
  }
  if(n===10){ /* Flatterling: rund, erste kleine Flügel, Fledermausohren */
    g+=tail([[[86,102],[110,110],[112,94]]],10,4)+tube([[[112,95],[114,88],[120,86]]],{w0:6,w1:1,cl:p.h,cd:p.t});
    var w10=batWing({root:[26,64],wrist:[8,44],tips:[[-6,28],[-12,48],[-4,66]],end:[20,78],mem:['#a9d1ff','#7fb6f5'],bl:p.b,bd:p.d,bw:4,scal:.35});
    g+='<g class="wing">'+w10+'</g><g class="wing wr">'+mirror(w10)+'</g>';
    body='M60 32C86 32 102 50 102 74C102 98 86 112 60 112C34 112 18 98 18 74C18 50 34 32 60 32Z';
    spots='<circle cx="32" cy="58" r="4" fill="'+p.l+'" opacity=".6"/><circle cx="88" cy="54" r="3" fill="'+p.l+'" opacity=".6"/><circle cx="84" cy="64" r="2" fill="'+p.l+'" opacity=".6"/>';
  }
  if(n===11){ /* Glutdrache: Glutflecken, Flamme auf dem Kopf, Flammenschwanz */
    g+=tail([[[82,98],[114,112],[116,82]]],13,5,{ridge:3})+flame(116,84,1.2);
    var w11=batWing({root:[30,60],wrist:[6,28],tips:[[-14,8],[-24,36],[-16,62]],end:[22,78],mem:['#ff9ccb','#f06fae'],bl:p.b,bd:p.d,bw:4.5,scal:.3});
    g+='<g class="wing">'+w11+'</g><g class="wing wr">'+mirror(w11)+'</g>';
    body='M60 22C88 22 106 42 104 68C102 90 86 112 60 112C34 112 18 90 16 68C14 42 32 22 60 22Z';
    spots='<circle cx="30" cy="54" r="4" fill="#ffb21f" opacity=".8"/><circle cx="30" cy="54" r="2" fill="#fff1a0"/><circle cx="96" cy="42" r="4" fill="#ffb21f" opacity=".8"/><circle cx="96" cy="42" r="2" fill="#fff1a0"/><circle cx="94" cy="70" r="3" fill="#ffb21f" opacity=".8"/><circle cx="24" cy="74" r="2.5" fill="#ffb21f" opacity=".8"/>';
  }
  if(n===12){ /* Kristalldrache: Eisblau, Kristallzacken auf Rücken und Schwanz */
    g+=tail([[[82,100],[114,118],[118,90]],[[118,90],[122,74],[110,68]]],13,5,{ridge:4});
    var cr=function(x,y,h,w,a){return '<g transform="rotate('+a+' '+x+' '+y+')"><path d="M'+(x-w)+' '+y+'L'+(x-w*.6)+' '+(y-h*.7)+'L'+x+' '+(y-h)+'L'+x+' '+y+'Z" fill="#ffffff"/><path d="M'+x+' '+y+'L'+x+' '+(y-h)+'L'+(x+w*.6)+' '+(y-h*.7)+'L'+(x+w)+' '+y+'Z" fill="#a9dcff"/></g>';};
    g+=cr(110,70,16,5,-30)+cr(116,78,12,4,10);
    var w12=batWing({root:[30,58],wrist:[4,24],tips:[[-18,0],[-30,32],[-20,62]],end:[22,80],mem:['#d4f1ff','#a6dcf7'],bl:p.b,bd:p.d,bw:4.5,scal:.3,claw:'#ffffff'});
    g+='<g class="wing">'+w12+'</g><g class="wing wr">'+mirror(w12)+'</g>';
    g+=cr(40,30,16,6,-25)+cr(80,30,16,6,25)+cr(52,24,14,5,-8)+cr(68,24,14,5,8)+cr(60,22,18,6,0);
    body='M60 20C90 20 108 42 106 70C104 96 86 112 60 112C34 112 16 96 14 70C12 42 30 20 60 20Z';
    spots='<path d="M30 52l3 -5l3 5l-3 5Z M88 48l3 -5l3 5l-3 5Z M92 70l2 -4l2 4l-2 4Z" fill="#ffffff" opacity=".7"/>';
  }
  if(n===13){ /* Sturmdrache: Gewitterwolken am Hals, Blitzschwanz */
    g+=tail([[[82,100],[114,114],[116,84]]],12,5,{ridge:3});
    g+='<path d="M116 86L108 70L116 72L110 56L124 76L116 74Z" fill="#ffe14d"/><path d="M116 86L112 76L116 74Z" fill="#ffb21f"/>';
    var w13=batWing({root:[30,58],wrist:[2,22],tips:[[-18,-2],[-32,30],[-22,62]],end:[22,80],mem:['#8fa6c7','#6d86ad'],bl:p.b,bd:p.d,bw:4.5,scal:.34,claw:'#ffe14d'});
    g+='<g class="wing">'+w13+'</g><g class="wing wr">'+mirror(w13)+'</g>';
    body='M60 18C90 18 108 40 106 68C104 94 86 112 60 112C34 112 16 94 14 68C12 40 30 18 60 18Z';
    spots='<circle cx="30" cy="52" r="4" fill="'+p.l+'" opacity=".5"/><circle cx="90" cy="48" r="3.5" fill="'+p.l+'" opacity=".5"/>';
  }
  /* ---- Hörner: spitz zulaufend, mit Schattenseite, Rillen und farbiger Spitze ---- */
  var H=function(segs,w0,o){o=o||{};return tube(segs,{w0:w0,w1:o.w1||1,cl:o.cl||p.h,cd:o.cd||hd,tip:[p.t,td],tipAt:o.at||.62,ridge:o.r,rc:o.rc||p.t,ro:.55,flip:o.flip});};
  var HM=function(segs,w0,o){return H(segs,w0,o)+mirror(H(segs,w0,Object.assign({},o||{},{flip:!(o&&o.flip)})));};
  if(n===2)g+=HM([[[40,42],[32,34],[31,22]]],10,{r:2});
  if(n===3)g+=HM([[[42,38],[32,28],[32,12]]],12,{r:3});
  if(n===4)g+=HM([[[42,34],[22,30],[4,8]]],12,{r:4,at:.7})+H([[[60,28],[60,16],[60,6]]],9,{r:2});
  if(n===5)g+=HM([[[38,40],[10,46],[-2,22],[18,10]],[[18,10],[32,4],[40,18],[30,26]]],15,{w1:4,r:7,at:.8});
  if(n===6)g+=HM([[[40,36],[28,28],[26,4]]],12,{r:3,at:.66})+H([[[60,30],[60,16],[60,0]]],11,{r:3,at:.66});
  if(n===7)g+=HM([[[40,38],[14,28],[10,-6]]],12,{r:4})+HM([[[48,28],[40,12],[48,-8]]],9,{r:3});
  if(n===9)g+=HM([[[44,38],[38,30],[38,22]]],9,{r:2})+flame(60,34,.9,[p.d,p.b,p.l]).replace('class="tw"','')+flame(48,36,.6,[p.d,p.b,p.l]).replace('class="tw"','')+flame(72,36,.6,[p.d,p.b,p.l]).replace('class="tw"','');
  if(n===10)g+=HM([[[38,44],[26,30],[24,12]]],16,{cl:p.b,cd:p.d,r:0,at:.99})+HM([[[38,42],[30,32],[27,18]]],8,{cl:p.h,cd:mixHex(p.h,p.t,.4),at:.99});
  if(n===11)g+=HM([[[42,32],[28,24],[24,8]]],11,{r:3})+flame(60,26,1.1);
  if(n===13)g+=HM([[[42,32],[16,26],[2,8]]],12,{r:4,at:.75});
  /* ---- Beine und Arme liegen hinter dem Körper und wachsen aus ihm heraus ---- */
  if(n!==7)g+=leg(40,p.b)+leg(80,p.d);
  if(n===2||n===3||n===5||n===6||n===4||n>=9){
    var ay=n===5?74:n===4?78:80,ax=n===5?16:n===4?24:20,aw=n===5?12:9,hand=function(x,y,dir){return arc('M'+x+' '+y+'l'+(-dir*2.5)+' 3.5M'+(x+dir*3)+' '+(y+1)+'l'+(-dir*.5)+' 4M'+(x+dir*6.5)+' '+y+'l'+(dir*1.5)+' 3.5','#fff',2.2);};
    g+=limb('M'+(ax+14)+' '+(ay-4)+'Q'+(ax-8)+' '+(ay+2)+' '+(ax-6)+' '+(ay+16),p.b,aw)+hand(ax-9,ay+19,1);
    g+=limb('M'+(106-ax)+' '+(ay-4)+'Q'+(128-ax)+' '+(ay+2)+' '+(126-ax)+' '+(ay+16),p.d,aw)+hand(129-ax,ay+19,-1);
  }
  /* ---- Körper ---- */
  g+=blob(body,p.b,p.d,-9,-7,spots+belly);
  if(n===7)g+='<path d="M28 104Q40 122 52 110Q60 124 68 110Q80 122 92 104Q80 114 72 108Q60 116 48 108Q40 114 28 104Z" fill="'+p.d+'"/>';
  /* ---- Details auf dem Körper ---- */
  var bl=mixHex(p.l,p.d,.35);
  if(n===2)g+=arc('M46 96Q60 100 74 96M44 103Q60 108 76 103',bl,2,.8)+arc('M54 34Q52 24 46 22M60 32Q60 20 62 16M66 34Q70 26 76 26',p.d,3)+'<circle cx="34" cy="78" r="1.2" fill="'+p.d+'"/><circle cx="31" cy="82" r="1.2" fill="'+p.d+'"/><circle cx="36" cy="83" r="1.2" fill="'+p.d+'"/><circle cx="86" cy="78" r="1.2" fill="'+p.d+'"/><circle cx="89" cy="82" r="1.2" fill="'+p.d+'"/><circle cx="84" cy="83" r="1.2" fill="'+p.d+'"/>';
  if(n===3)g+='<path d="M22 84L14 80L20 90ZM98 84L106 80L100 90Z" fill="'+p.b+'"/>'+arc('M48 97Q60 101 72 97M47 104Q60 108 73 104',bl,2,.8);
  if(n===4)g+=arc('M44 96Q60 100 76 96M43 103Q60 107 77 103M47 109Q60 112 73 109',bl,2,.9)+'<path d="M60 20L64 13L68 21ZM50 21L52 14L57 21ZM70 21L75 15L76 23Z" fill="'+p.d+'"/>'+
    '<g class="wing">'+arc('M30 60L-14 32M30 60L-8 50M30 60L-18 70',mixHex(p.b,p.d,.4),2,.8)+'</g><g class="wing wr">'+mirror(arc('M30 60L-14 32M30 60L-8 50M30 60L-18 70',mixHex(p.b,p.d,.4),2,.8))+'</g>';
  if(n===5)g+=arc('M44 103H76M48 108H72',bl,2,.8)+'<path d="M50 24L54 14L58 24ZM62 24L66 14L70 24Z" fill="'+p.d+'"/>';
  if(n===6)g+='<path d="M30 46Q60 36 90 46L88 52Q60 42 32 52Z" fill="#ff8a2a"/><circle cx="44" cy="45" r="2" fill="#fff"/><circle cx="76" cy="45" r="2" fill="#fff"/><path d="M60 37L65 43L60 50L55 43Z" fill="#ff3d5a"/><path d="M60 37L65 43L60 43Z" fill="#ff8aa0"/>';
  if(n===7)g+=arc('M60 22V32M24 76L32 80M96 76L88 80',p.i,2,.6);
  if(n===9||n===10||n===11)g+=arc('M46 97Q60 101 74 97M45 104Q60 108 75 104',bl,2,.8);
  if(n===12)g+=arc('M44 96Q60 100 76 96M43 103Q60 107 77 103',bl,2,.9)+'<path d="M26 84l3 -4l3 4l-3 4Z M88 84l3 -4l3 4l-3 4Z" fill="#b9a4ff"/>';
  if(n===13){g+=arc('M44 98H76M46 105H74',bl,2,.8);var cl2='';[[46,24,7],[56,20,8],[66,21,7.5],[75,26,6.5]].forEach(function(c){cl2+='<circle cx="'+c[0]+'" cy="'+(c[1]+2)+'" r="'+c[2]+'" fill="#9fb3cf"/><circle cx="'+(c[0]-1)+'" cy="'+c[1]+'" r="'+c[2]+'" fill="#e8eef7"/>';});g+=cl2;}
  /* ---- Gesicht: jedes Monster hat eigene Augen und einen eigenen Ausdruck ---- */
  var blush=function(op){return '<circle cx="26" cy="82" r="5" fill="#ff6f8f" opacity="'+op+'"/><circle cx="94" cy="82" r="5" fill="#ff6f8f" opacity="'+op+'"/>';};
  if(n===2){ /* Schlüpfling: ein großes Zyklopenauge, staunend, Hasenzähne */
    g+='<g class="brows">'+arc('M47 44Q60 38 73 44',p.d,3.5)+'</g><g class="eyes">'+eye(60,62,15,{look:[.4,.1],ir:.55})+'</g>'+blush(.35);
    g+=mouth(60,84,13,11,[[-5.5,5,3],[.5,5,3]]);
  }
  if(n===3){ /* Stachling: drei Augen, frech, Zunge raus */
    g+='<g class="brows">'+arc('M33 54Q42 50 50 55M70 52Q78 48 86 53',p.d,3)+'</g><g class="eyes">'+eye(42,66,9,{look:[.5,0]})+eye(78,64,10.5,{look:[.5,0]})+eye(60,48,6,{look:[.5,-.3]})+'</g>'+blush(.35);
    var tc=id+'t'+(++cid);
    g+='<g class="mouth"><path d="M47 79Q58 92 72 78Q60 82 47 79Z" fill="'+MR+'"/><rect x="62" y="79" width="4.5" height="5" rx="1" fill="#fff"/><path d="M56 84Q55 96 61 97Q67 97 66 85Z" fill="'+TG+'"/><path d="M61 87V93" stroke="'+MR+'" stroke-width="1.4" stroke-linecap="round" opacity=".6"/></g>';
  }
  if(n===4){ /* Flügeldrache: lässig, halb geschlossene Lider, schiefes Grinsen mit einem Zahn */
    g+='<g class="brows"></g><g class="eyes">'+eye(44,66,10,{lid:.4,tilt:-8,look:[.6,.2]})+eye(76,66,10,{lid:.4,tilt:8,look:[.6,.2]})+'</g>'+blush(.25);
    g+='<ellipse cx="55" cy="76" rx="1.6" ry="1.2" fill="'+p.d+'"/><ellipse cx="65" cy="76" rx="1.6" ry="1.2" fill="'+p.d+'"/>';
    g+='<g class="mouth"><path d="M46 83Q62 90 76 80Q72 92 60 93Q50 92 46 83Z" fill="'+MR+'"/><path d="M64 87Q60 93 54 91Q58 88 64 87Z" fill="'+TG+'"/><path d="M68 84L71 84L69.5 89Z" fill="#fff"/></g>';
  }
  if(n===5){ /* Feuerdrache: grimmig, schräge Lider, Zähne zusammengebissen, Rauch aus den Nüstern */
    g+='<g class="brows">'+arc('M32 52L54 59M88 52L66 59',p.d,6)+'</g><g class="eyes">'+eye(44,66,9.5,{lid:.38,tilt:16,look:[0,.3]})+eye(76,66,9.5,{lid:.38,tilt:-16,look:[0,.3]})+'</g>';
    g+='<ellipse cx="55" cy="75" rx="2" ry="1.5" fill="'+MR+'"/><ellipse cx="65" cy="75" rx="2" ry="1.5" fill="'+MR+'"/><circle class="pt" cx="54" cy="72" r="2.500" fill="#cfd8d4"/><circle class="pt p2" cx="66" cy="72" r="2.500" fill="#cfd8d4"/>';
    var mc=id+'q'+(++cid),md='M42 80H78Q78 94 60 94Q42 94 42 80Z';
    g+='<g class="mouth"><clipPath id="'+mc+'"><path d="'+md+'"/></clipPath><path d="'+md+'" fill="'+MR+'"/><g clip-path="url(#'+mc+')">';
    [42,48.5,55,61.5,68,74.5].forEach(function(x){g+='<rect x="'+(x+.5)+'" y="79" width="5.5" height="6" rx="1" fill="#fff"/>';});
    [45,51.5,58,64.5,71].forEach(function(x){g+='<rect x="'+(x+.5)+'" y="87.5" width="5.5" height="7" rx="1" fill="#fff"/>';});
    g+='</g></g>';
  }
  if(n===6){ /* Legende: stolz und freundlich, Wimpern, geschlossenes Lächeln mit zwei Zähnchen */
    g+='<g class="brows">'+arc('M34 56Q42 51 51 54M69 54Q78 51 86 56',p.d,3)+'</g><g class="eyes">'+eye(44,66,10,{lid:.18,lidc:p.d,lash:-1,look:[.2,.1]})+eye(76,66,10,{lid:.18,lidc:p.d,lash:1,look:[.2,.1]})+'</g>'+blush(.4);
    g+='<g class="mouth"><path d="M45 80Q60 94 75 80Q60 88 45 80Z" fill="'+MR+'"/><path d="M52 83.5L55 83.8L53.5 88ZM65 83.8L68 83.5L66.5 88Z" fill="#fff"/></g>';
  }
  if(n===9){ /* Zottel: verschmitzt, ein Auge zugekniffen, breites Grinsen */
    g+='<g class="brows">'+arc('M34 54Q42 50 51 54M69 56Q78 54 86 58',p.d,3.5)+'</g><g class="eyes">'+eye(44,66,10,{look:[.3,.2]})+'<path d="M68 67Q76 61 84 67" fill="none" stroke="'+K+'" stroke-width="3.5" stroke-linecap="round"/><path d="M84 67l3 -2M83 63l2.5 -3" stroke="'+K+'" stroke-width="2" stroke-linecap="round"/></g>'+blush(.4);
    g+=mouth(60,80,15,12,[[-9,5,1.5],[-3,5,2],[3,5,1.5]]);
  }
  if(n===10){ /* Flatterling: große staunende Augen, ein großer Zahn */
    g+='<g class="brows">'+arc('M33 52Q42 46 51 51M69 51Q78 46 87 52',p.d,3)+'</g><g class="eyes">'+eye(44,66,12,{look:[0,.2],ir:.62})+eye(76,66,12,{look:[0,.2],ir:.62})+'</g>'+blush(.35);
    g+='<g class="mouth"><path d="M50 82Q60 92 70 82Q60 85 50 82Z" fill="'+MR+'"/><rect x="57.5" y="82" width="5" height="6" rx="1.2" fill="#fff"/></g>';
  }
  if(n===11){ /* Glutdrache: aufgeregt, Funkelaugen, offener Mund mit Zunge */
    g+='<g class="brows">'+arc('M33 53Q42 48 51 53M69 53Q78 48 87 53',p.d,3.5)+'</g><g class="eyes">'+eye(44,66,10.5,{look:[.1,0]})+eye(76,66,10.5,{look:[.1,0]})+'<path d="M40 63l1.2 -3l1.2 3l3 1.2l-3 1.2l-1.2 3l-1.2 -3l-3 -1.2Z M72 63l1.2 -3l1.2 3l3 1.2l-3 1.2l-1.2 3l-1.2 -3l-3 -1.2Z" fill="#fff"/></g>'+blush(.35);
    g+=mouth(60,80,14,14,[[-9,4,3],[5,4,3]]);
  }
  if(n===12){ /* Kristalldrache: ruhig und weise, schwere Lider, feines Lächeln */
    g+='<g class="brows">'+arc('M34 55Q42 52 51 55M69 55Q78 52 86 55',p.d,3)+'</g><g class="eyes">'+eye(44,66,10,{lid:.3,lidc:p.d,look:[.1,.2],lash:-1})+eye(76,66,10,{lid:.3,lidc:p.d,look:[.1,.2],lash:1})+'</g>'+blush(.3);
    g+='<g class="mouth"><path d="M48 81Q60 92 72 81Q60 86 48 81Z" fill="'+MR+'"/><path d="M53 83L56 83.5L54.5 87.5ZM64 83.5L67 83L65.5 87.5Z" fill="#fff"/></g>';
  }
  if(n===13){ /* Sturmdrache: entschlossen, gelbe Blitzaugen, Zähne gebleckt */
    g+='<g class="brows">'+arc('M32 54L54 60M88 54L66 60',p.d,5)+'</g><g class="eyes">'+eye(44,67,10,{lid:.25,tilt:12,look:[0,.2],slit:1})+eye(76,67,10,{lid:.25,tilt:-12,look:[0,.2],slit:1})+'</g>'+blush(.2);
    g+=mouth(60,80,15,12,[[-12,4.5,1],[-6,4.5,2],[1.5,4.5,2],[7.5,4.5,1]]);
  }
  if(n===7){ /* Schattendrache: vier Augen, leuchtend mit Schlitzpupillen, böses Zackengrinsen */
    g+='<g class="brows">'+arc('M31 56L54 62M89 56L66 62','#38f0ff',4.5)+'</g><g class="eyes">'+eye(44,67,10,{sc:'#38f0ff',iris:'#d9fbff',slit:1,lid:.3,tilt:14,lidc:p.d})+eye(76,67,10,{sc:'#38f0ff',iris:'#d9fbff',slit:1,lid:.3,tilt:-14,lidc:p.d})+eye(40,47,5,{sc:'#38f0ff',iris:'#d9fbff',slit:1})+eye(80,47,5,{sc:'#38f0ff',iris:'#d9fbff',slit:1})+'</g>'+blush(.2);
    g+=mouth(60,82,16,12,[[-14,4,0],[-8,4,1],[-2,4,0],[4,4,1],[10,4,0]],'#38f0ff');
  }
  g+=moodArt(mood);
  g+='</g></g></svg>';
  return g;
}

function moodSvg(stage,mood){
  if(!mood)return '';
  var egg=stage===0,X=egg?[46,74]:[44,76],ey=egg?82:66,m=egg?92:81,hw=egg?9:13,K='#1b2340',o='';
  function arcEyes(){X.forEach(function(x){o+='<path d="M'+(x-7)+' '+(ey+3)+'Q'+x+' '+(ey-8)+' '+(x+7)+' '+(ey+3)+'" fill="none" stroke="'+K+'" stroke-width="3.5" stroke-linecap="round"/>';});}
  function openEyes(dx,dy){X.forEach(function(x){
    if(egg)o+='<circle cx="'+(x+dx)+'" cy="'+(ey+dy)+'" r="5.500" fill="'+K+'"/>';
    else o+='<circle cx="'+x+'" cy="'+ey+'" r="9" fill="'+IRIS[stage]+'" stroke="'+K+'" stroke-width="1.5"/><ellipse cx="'+(x+1+dx*.6)+'" cy="'+(ey+.5+dy*.6)+'" rx="2.7" ry="6.2" fill="'+K+'"/>';});}
  function fg(x){return '<path d="M'+x+' '+(m+.5)+'L'+(x+4)+' '+(m+.5)+'L'+(x+2)+' '+(m+6)+'Z" fill="#fff" stroke="'+K+'" stroke-width="1" stroke-linejoin="round"/>';}
  function bigMouth(w,d){o+='<path d="M'+(60-w)+' '+m+'Q60 '+(m+d)+' '+(60+w)+' '+m+'Z" fill="#7a2a3a" stroke="'+K+'" stroke-width="2.500" stroke-linejoin="round"/><path d="M'+(60-w*.45)+' '+(m+d*.42)+'Q60 '+(m+d*.2)+' '+(60+w*.45)+' '+(m+d*.42)+'Q60 '+(m+d*.7)+' '+(60-w*.45)+' '+(m+d*.42)+'Z" fill="#ff7b8f"/>'+fg(60-w*.7)+fg(60+w*.7-4);}
  var spark='<path class="tw" d="M8 26l2.500 6 6 2.500-6 2.500L8 43l-2.500-6L-0.500 34.500l6-2.500z" fill="#b8f56a"/><path class="tw tw2" d="M110 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ff4f9a"/><path class="tw tw3" d="M112 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#b8f56a"/><path class="tw tw2" d="M2 76l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffe3f1"/>';
  if(mood==='happy'||mood==='wave'){arcEyes();bigMouth(hw,egg?14:18);}
  else if(mood==='thumb'){
    arcEyes();bigMouth(hw,egg?14:18);
    o+='<g class="thmb" transform="translate(80 62) rotate(-12) scale(1.45)"><rect x="0" y="8" width="24" height="20" rx="6" fill="#b8f56a" stroke="#6aa91f" stroke-width="1.5"/><path d="M5 10L5 -2Q5 -9 11 -9Q16 -9 15 -2L14 8Z" fill="#b8f56a" stroke="#6aa91f" stroke-width="1.5" stroke-linejoin="round"/><path d="M5 17H22M5 22H22" stroke="#6aa91f" stroke-width="1.2" stroke-linecap="round"/></g>';
    o+=spark;
  }
  else if(mood==='tongue'){
    arcEyes();
    o+='<path d="M'+(60-hw)+' '+m+'Q60 '+(m+14)+' '+(60+hw)+' '+m+'" fill="none" stroke="'+K+'" stroke-width="3" stroke-linecap="round"/>';
    o+='<g class="tng"><path d="M54 '+(m+8)+'L54 '+(m+17)+'Q60 '+(m+26)+' 66 '+(m+17)+'L66 '+(m+8)+'Z" fill="#ff7b8f" stroke="'+K+'" stroke-width="2.200" stroke-linejoin="round"/><path d="M60 '+(m+12)+'L60 '+(m+19)+'" stroke="#d94a68" stroke-width="2" stroke-linecap="round"/></g>';
    o+=spark;
  }
  else if(mood==='dance'||mood==='flip'||mood==='party'||mood==='salto'){
    arcEyes();bigMouth(hw+3,egg?20:26);o+=spark;
  }
  else if(mood==='medal'){
    arcEyes();bigMouth(hw-3,egg?6:9);o+=spark;
    o+='<path d="M51 '+(egg?98:91)+'L57 '+(egg?103:97)+'M69 '+(egg?98:91)+'L63 '+(egg?103:97)+'" stroke="#e04a5a" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="'+(egg?106:101)+'" r="'+(egg?6.500:7.500)+'" fill="#b8f56a" stroke="#a87600" stroke-width="2.200"/><path transform="translate(0 '+(egg?-6:-11)+')" d="M60 107l1.600 3.200 3.500.5-2.600 2.400.7 3.500-3.200-1.800-3.200 1.800.7-3.500-2.600-2.400 3.500-.5z" fill="#ff6a3d"/>';
  }
  else if(mood==='cheer'){
    openEyes(0,-2);bigMouth(hw-2,egg?9:12);
    o+='<g transform="rotate(35 82 46)"><rect x="70" y="40" width="24" height="11" rx="5" fill="#b8f56a" stroke="#6aa91f" stroke-width="1.500"/><rect x="78" y="40" width="8" height="11" fill="#e7b183"/></g>';
  }
  else if(mood==='sleep'){
    X.forEach(function(x){o+='<path d="M'+(x-7)+' '+(ey)+'Q'+x+' '+(ey+8)+' '+(x+7)+' '+(ey)+'" fill="none" stroke="'+K+'" stroke-width="3.500" stroke-linecap="round"/>';});
    o+='<ellipse cx="60" cy="'+(m+4)+'" rx="4" ry="5" fill="#7a2a3a" stroke="'+K+'" stroke-width="2"/>';
    o+='<text class="zz" x="92" y="30" font-size="18" font-weight="800" fill="#a3aed8" font-family="sans-serif">z</text><text class="zz zz2" x="102" y="16" font-size="13" font-weight="800" fill="#a3aed8" font-family="sans-serif">z</text>';
  }
  else if(mood==='joy'){
    arcEyes();bigMouth(hw+3,egg?20:26);
    o+='<path class="tw" d="M8 26l2.500 6 6 2.500-6 2.500L8 43l-2.500-6L-0.500 34.500l6-2.500z" fill="#b8f56a"/><path class="tw tw2" d="M110 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ff4f9a"/><path class="tw tw3" d="M112 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#b8f56a"/><path class="tw tw2" d="M2 76l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffe3f1"/>';
  }
  else if(mood==='sad'){
    openEyes(0,3);
    o+='<path d="M'+(X[0]-10)+' '+(ey-10)+'L'+(X[0]+8)+' '+(ey-17)+'M'+(X[1]-8)+' '+(ey-17)+'L'+(X[1]+10)+' '+(ey-10)+'" fill="none" stroke="'+(stage===STAGES.length-1?'#38f0ff':K)+'" stroke-width="3" stroke-linecap="round"/>';
    o+='<path d="M'+(60-hw*.6)+' '+(m+9)+'Q60 '+(m-1)+' '+(60+hw*.6)+' '+(m+9)+'" fill="none" stroke="'+K+'" stroke-width="3" stroke-linecap="round"/>';
    o+='<path class="tear" d="M'+(X[0]-4)+' '+(ey+11)+'Q'+(X[0]-9)+' '+(ey+19)+' '+(X[0]-4)+' '+(ey+22)+'Q'+(X[0]+1)+' '+(ey+19)+' '+(X[0]-4)+' '+(ey+11)+'Z" fill="#7ccbff" stroke="#3d9bd6" stroke-width="1.500"/>';
  }
  else{ /* hm */
    openEyes(2,-3);
    o+='<path d="M'+(60-hw*.6)+' '+(m+4)+'Q'+(60-hw*.2)+' '+(m)+' 60 '+(m+4)+'T'+(60+hw*.6)+' '+(m+4)+'" fill="none" stroke="'+K+'" stroke-width="3" stroke-linecap="round"/>';
    o+='<path class="tear" d="M'+(X[1]+12)+' '+(ey-14)+'Q'+(X[1]+8)+' '+(ey-8)+' '+(X[1]+12)+' '+(ey-5)+'Q'+(X[1]+16)+' '+(ey-8)+' '+(X[1]+12)+' '+(ey-14)+'Z" fill="#7ccbff" stroke="#3d9bd6" stroke-width="1.500"/>';
  }
  return '<g class="mood">'+o+'</g>';
}
