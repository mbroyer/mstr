/* ===== Karte: der Beat als Ring-Molekül, zum Teilen als Video mit Ton (Story 9:16) oder als Bild =====
   Jeder Schlag ist ein Atom auf einem Ring je Spur (Kick innen, FX außen). Was gleichzeitig klingt, hängt an einer Linie
   von innen nach außen, die aufblitzt, wenn der Schritt spielt. Atome treiben eigenständig, verbinden sich mit ihren
   nächsten Nachbarn, federn bei Treffern und driften am Taktende auseinander. Der Clip ist ein Bogen über 8 Takte
   (Spuren kommen nacheinander dazu, Takt 7 ohne Kick) plus Schlussschlag, danach treiben die Atome auseinander.
   Schutz: Es darf nie eine haken- oder windradförmige Figur entstehen. Deshalb gibt es keine Bögen zum Nachbarschritt,
   keinen Drehversatz zwischen den Ringen, jedes Atom sitzt fest leicht versetzt, und erkennt die Karte eine vierfache
   Drehsymmetrie, zeigt sie nur gerade Linien von innen nach außen. Beim Ändern bitte beibehalten
   Effekte sind sichtbar: Raum legt Schimmer um die Atome, Echo lässt Geister nach außen ziehen, Filter dimmt die hohen
   Spuren im Takt, Pump zieht alles außer der Kick zusammen, Stutter lässt das Molekül zittern und den letzten Schritt
   doppelt blitzen, Vinyl legt Korn, Staub und Knistern darüber. o.glass (0–1) macht Atome durchscheinend.
   Staub: bei manchen Schlägen bleiben kleine Körner zurück, die langsam nach außen und oben in die Atmosphäre gleiten */
var CARD=(function(){
  var LIL='#C7B3FF',INK='#0F0F10',WHT='#F3F3F4',GRY='#7A7A81',ORDER=[1,2,0,4,5,3,6],NBAR=9,TAIL=2.4;
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  /* feste Zufallsabweichung je Atom (bricht jede Drehsymmetrie) */
  function sj(seed,r,i,k){var v=Math.sin((seed%10007)*0.017+r*12.9898+i*78.233+k*37.719)*43758.5453;return (v-Math.floor(v))*2-1;}
  function clock(){return performance.now()/1000;}
  function reduce(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}

  /* Beat-Modell aus den sieben eingebauten Spuren (Zeichen '0' = aus) */
  /* Effekte normiert: je id {a: Stärke 0–1, o: Auswahl}; Zahl = nur Stärke */
  function fxNorm(f){var o={},k,D={echo:3,sweep:2,pump:4,stut:2};if(!f)return o;
    for(k in f){var v=f[k];if(!v)continue;var a=typeof v==='number'?v:(v.a==null?.5:v.a);o[k]={a:Math.max(0,Math.min(1,a)),o:(v&&v.o)||D[k]||0};}return o;}
  function model(rows,bpm,sw,fx){
    var R=rows.slice(0,7).map(function(r){return (r||'').padEnd(16,'0').slice(0,16);}),cnt=[],tot=0,dom=0,i;
    R.forEach(function(r){var n=0;for(i=0;i<16;i++)if(r.charAt(i)!=='0')n++;cnt.push(n);tot+=n;});
    var TYP=[8,4,3,1,6,2,1];for(i=1;i<7;i++)if(cnt[i]/TYP[i]>cnt[dom]/TYP[dom])dom=i;
    return {R:R,cnt:cnt,tot:tot,bpm:bpm,sw:sw,dom:dom,fx:fxNorm(fx),seed:hash(R.join('')+bpm)};
  }
  /* Arrangement: welche Spur in welchem Takt klingt (Takt 0 = erster). Takt 8 ist der Schlussschlag */
  function active(tr,bar){if(bar===0)return tr===1||tr===0;if(bar===1)return tr!==3&&tr!==5&&tr!==6;if(bar===6)return tr!==1;if(bar===8)return false;return true;}
  function clipLen(bpm){return NBAR*240/bpm+TAIL;}

  /* Titel aus dem Beat: Stimmung nach Tempo, Wörter für Swing, Hauptwort nach der lautesten Spur */
  var TW={
    slow:['Sunday','Velvet','Late','Slow','Honey','Fog','Porch','Dusk'],
    mid:['Golden','Rooftop','Soft','Kitchen','Copper','Amber','Low Tide','Balcony'],
    up:['Midnight','Neon','Basement','Warm','Tunnel','Corner','Silver','Cherry'],
    fast:['Rapid','Concrete','Electric','Strobe','Wire','Chrome','Jet','Glass'],
    hyper:['Hyper','Loose','Static','Paper','Sprint','Flash','Rust','Zero'],
    swing:['Lean','Tilt','Drunken','Loose','Lazy','Crooked'],
    noun:[['Ticker','Shimmer','Whisper','Hiss'],['Thump','Heartbeat','Engine','Pulse'],['Snap','Clap','Backbone','Crack'],['Halo','Wash','Bell','Bloom'],['Shaker','Rattle','Clockwork','Marble'],['Thunder','Roll','Drum','Canyon'],['Glitch','Signal','Ghost','Echo']],
    place:['Parking Lot','Night Bus','Kiosk','Hallway','Laundromat','Terrace','Backseat','Elevator'],
    hour:['2 AM','4 PM','6 AM','11 PM','Noon','Dawn','Golden Hour','Last Call']};
  function title(m,n){var g=rng((m.seed^0x7a11)+(n|0)*7919),pk=function(a){return a[Math.floor(g()*a.length)];},
      mood=m.bpm<90?'slow':m.bpm<110?'mid':m.bpm<128?'up':m.bpm<148?'fast':'hyper',adj=m.sw>.22&&g()<.5?pk(TW.swing):pk(TW[mood]),noun=pk(TW.noun[m.dom]),f=g();
    if(f<.4)return adj+' '+noun;if(f<.6)return noun+' at '+pk(TW.hour);if(f<.8)return pk(TW.place)+' '+noun;return 'The '+adj+' '+noun;}

  /* Eine Szene hält die Physik (Federn, Treffer) und den Stand im Clip */
  function Scene(m){this.m=m;this.clip=true;this.act=null;this.st={};this.hitT=[0,0,0,0,0,0,0];this.flashT=[];this.TV=[1,1,1,1,1,1,1];this.waves=[];this.step=-1;this.bar=0;this.ct=-1;this.barT=0;this.ghosts=[];this.dust=[];this.stutT=0;this.open=1;
    for(var i=0;i<16;i++)this.flashT.push(0);this.ev=events(m);this.ei=0;}
  /* Ereignisse des Clips in Sekunden: je Schritt die Spuren, die klingen */
  function events(m){var six=60/m.bpm/4,E=[],fx=m.fx,L=fx.stut?2+Math.round(fx.stut.a*6):0,b,s,r;
    var at=function(b,s){var h=[];for(r=0;r<7;r++)if(active(r,b)&&m.R[r].charAt(s)!=='0')h.push(r);return h;};
    for(b=0;b<NBAR;b++){var stb=L&&b<8&&(b+1)%(fx.stut.o||2)===0,src=16-L;
      for(s=0;s<16;s++){var hits=[],t=b*16*six+s*six+((s%4===2)?six*m.sw:0);
        if(b===8){if(s===0)hits=[1,3];}
        else if(stb&&s>=src){hits=at(b,src);E.push({t:t,s:src,b:b,h:hits,st:1});E.push({t:t+six/2,s:src,b:b,h:hits,st:1});continue;}
        else hits=at(b,s);
        E.push({t:t,s:s,b:b,h:hits});}}
    return E;}
  Scene.prototype.live=function(){return this.ct>=0;};
  Scene.prototype.pul=function(r,d){if(!this.live())return 0;var a=(performance.now()-this.hitT[r])/1000;return Math.max(0,1-a/(d||.2));};
  /* Ein Ereignis auslösen: Schläge der Spuren h auf Schritt s in Takt b (st: Stotter-Wiederholung) */
  Scene.prototype.fire=function(e,now){var self=this;
    if(e.s===0&&!e.st)this.barT=now;this.step=e.s;this.bar=e.b;if(e.st)this.stutT=now;
    var ec=this.m.fx.echo,six=60/this.m.bpm/4,DP=[.12,.2,.55,.9,.45,.5,.8];
    e.h.forEach(function(r){self.hitT[r]=now;self.waves.push({t:now,r:[62,92,32,152,122,182,212][ORDER.indexOf(r)]});
      if(self.dust.length<70&&Math.random()<DP[r]){var q=1+Math.floor(Math.random()*2);while(q--)self.dust.push({id:ORDER.indexOf(r)+'-'+e.s,t:now,life:2600+Math.random()*2600,da:(Math.random()-.5)*1.2,sp:7+Math.random()*13,ph:Math.random()*7,w:.6+Math.random(),sz:.9+Math.random()*1.3,lil:Math.random()<.35});}
      if(ec){var n=1+Math.round(ec.a*3),dt=ec.o*six*1000,k;for(k=1;k<=n;k++)self.ghosts.push({id:ORDER.indexOf(r)+'-'+e.s,t:now+k*dt,dt:dt,k:k});}});
    if(e.h.length)this.flashT[e.s]=now;};
  /* Zeit weiterstellen: Wellen, Geister und Staub altern, Filter-Blende und Sichtbarkeit der Spuren folgen */
  Scene.prototype.time=function(ct,now){this.ct=ct;
    this.waves=this.waves.filter(function(w){return now-w.t<1000;});
    this.ghosts=this.ghosts.filter(function(g){return now-g.t<g.dt;});
    this.dust=this.dust.filter(function(d){return now-d.t<d.life;});
    var sw=this.m.fx.sweep;this.open=sw?.5-.5*Math.cos(Math.PI*2*ct/(60/this.m.bpm/4*16*(sw.o||2))):1;
    for(var r=0;r<7;r++){var tg=(this.act?this.act(r):active(r,this.bar))?1:.1;this.TV[r]+=(tg-this.TV[r])*.07;}};
  /* Stand im Clip setzen: alle Ereignisse bis dahin auslösen */
  Scene.prototype.seek=function(ct){var now=performance.now();
    while(this.ei<this.ev.length&&this.ev[this.ei].t<=ct)this.fire(this.ev[this.ei++],now);
    this.time(ct,now);};
  Scene.prototype.outro=function(){if(!this.clip||!this.live()||this.bar!==8)return 0;return Math.min(1,(performance.now()-this.barT)/1000/(240/this.m.bpm));};
  Scene.prototype.reset=function(){this.st={};this.ei=0;this.ct=-1;this.step=-1;this.bar=0;this.waves=[];this.ghosts=[];this.dust=[];this.stutT=0;this.open=1;this.TV=[1,1,1,1,1,1,1];};

  function atoms(S,cx,cy,sc,live){
    var m=S.m,T=clock(),sd=Math.PI/8,bp=((live?S.ct:T)*m.bpm/240)%1,drift=live&&bp>.7?Math.pow((bp-.7)/.3,1.6)*30*sc:0,out=S.outro(),A=[],byStep=[],byId={},i;
    var fx=m.fx,six=60/m.bpm/4,pump=0,HI=[1,0,.4,1,.7,.2,.8];
    if(live&&fx.pump){var pp=(S.ct/(six*(fx.pump.o||4)))%1;pump=fx.pump.a*Math.exp(-pp*4.5)*.13;}
    var dim=live&&fx.sweep?fx.sweep.a*(1-S.open)*.85:0;
    for(i=0;i<16;i++)byStep[i]=[];
    ORDER.forEach(function(tr,r){var row=m.R[tr],rad=(62+r*30)*sc*(1+(live?Math.sin(T*(0.5+sj(m.seed,r,99,4)*.3)+r*1.1)*0.03:0)),
        rot=live?T*0.05+Math.sin(T*(0.21+0.13*sj(m.seed,r,99,5))+r*2.3)*0.12:0;
      for(i=0;i<16;i++){var v=row.charAt(i);if(v==='0')continue;
        var w1=0.35+0.3*sj(m.seed,r,i,6),w2=0.9+0.5*sj(m.seed,r,i,7),p1=sj(m.seed,r,i,8)*7,p2=sj(m.seed,r,i,9)*7,
            wr=live?(Math.sin(T*w1+p1)*8+Math.sin(T*w2+p2)*4)*sc:0,wa=live?(Math.sin(T*w1*.8+p2)*0.06+Math.sin(T*w2*1.3+p1)*0.03):0;
        var a=-Math.PI/2+i*sd+(i%2?m.sw*sd*.66:0)+rot+sj(m.seed,r,i,0)*0.16+wa,rr=(rad+sj(m.seed,r,i,1)*8*sc+wr)*(tr===1?1:1-pump)+out*80*sc*(.6+.4*sj(m.seed,r,i,12));
        var da=sj(m.seed,r,i,2)*Math.PI,tx=cx+Math.cos(a)*rr+Math.cos(da)*drift,ty=cy+Math.sin(a)*rr+Math.sin(da)*drift,id=r+'-'+i,p=S.st[id];
        if(!p||!live)p=S.st[id]={ox:0,oy:0,vx:0,vy:0,h:S.hitT[tr]};
        else{p.vx=(p.vx-p.ox*0.06)*0.87;p.vy=(p.vy-p.oy*0.06)*0.87;
          if(i===S.step&&p.h!==S.hitT[tr]){p.h=S.hitT[tr];var kk=(tr===1?10:7)*sc,ka=a+sj(m.seed,r,i,10)*.8;p.vx+=Math.cos(ka)*kk;p.vy+=Math.sin(ka)*kk;p.fresh=1;}
          p.ox+=p.vx;p.oy+=p.vy;}
        var at={r:r,tr:tr,i:i,v:v,a:a,x:tx+p.ox,y:ty+p.oy,vx:p.vx,vy:p.vy,hp:(live&&i===S.step)?S.pul(tr,.35):0,bs:sj(m.seed,r,i,3)>0?1:-1,st:p,ph:sj(m.seed,r,i,11)*7,vis:S.TV[tr]*(1-out*.8)*(1-dim*HI[tr]),pk:tr===1?1:1-pump*1.3};
        A.push(at);byStep[i].push(at);byId[id]=at;}});
    return {A:A,byStep:byStep,byId:byId};}
  /* Vierfache Drehsymmetrie erkennen: dann nur gerade Linien nach außen */
  function symScore(A,cx,cy){var n=0,s=0;A.forEach(function(p){var rx=cx-(p.y-cy),ry=cy+(p.x-cx),mn=1e9;A.forEach(function(q){if(q.tr!==p.tr)return;var d=Math.hypot(q.x-rx,q.y-ry);if(d<mn)mn=d;});s+=mn;n++;});return n?s/n:99;}
  function bonds(x,S,G,fg,sc,live){var T=clock(),A=G.A,E={},list=[],i,k;x.lineCap='round';
    var safe=symScore(A,G.cx,G.cy)<7*sc;
    if(safe){for(i=0;i<16;i++){var s=G.byStep[i];for(k=1;k<s.length;k++)list.push([s[k-1],s[k],1]);}}
    else A.forEach(function(p,ip){var near=[];A.forEach(function(q,iq){if(iq===ip)return;var d=Math.hypot(q.x-p.x,q.y-p.y);if(d<74*sc)near.push([d,iq]);});
      near.sort(function(u,v){return u[0]-v[0];});near.slice(0,2).forEach(function(n){var key=Math.min(ip,n[1])+'_'+Math.max(ip,n[1]);if(E[key])return;E[key]=1;list.push([p,A[n[1]],1-n[0]/(74*sc)]);});});
    list.forEach(function(L){var p=L[0],q=L[1],dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,hot=live&&(p.i===S.step||q.i===S.step)&&(p.hp>.2||q.hp>.2),
        rel=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny,bend=(live?Math.sin(T*1.4+p.i*1.7+q.r)*4*sc*q.bs:0)-rel*3;
      if(p.st.fresh&&!q.st.fresh){q.st.vx+=p.vx*.35;q.st.vy+=p.vy*.35;}else if(q.st.fresh&&!p.st.fresh){p.st.vx+=q.vx*.35;p.st.vy+=q.vy*.35;}
      x.strokeStyle=hot?LIL:fg;x.globalAlpha=(hot?.95:.12+.3*Math.min(1,L[2]*1.4))*Math.min(p.vis,q.vis);x.lineWidth=(hot?2.2:1.2)*sc;x.beginPath();x.moveTo(p.x,p.y);
      x.quadraticCurveTo((p.x+q.x)/2+nx*bend,(p.y+q.y)/2+ny*bend,q.x,q.y);x.stroke();x.globalAlpha=1;});
    A.forEach(function(p){p.st.fresh=0;});}
  /* Linie der gleichzeitigen Schläge von innen nach außen, blitzt beim Spielen auf */
  function chains(x,S,G,fg,sc,live){var now=performance.now(),i;x.lineCap='round';x.lineJoin='round';
    for(i=0;i<16;i++){var s=G.byStep[i];if(!s.length)continue;var f=live?Math.max(0,1-(now-S.flashT[i])/420):0,vv=1;
      s.forEach(function(p){vv=Math.min(vv,p.vis);});
      var pts=(f>0?[{x:G.cx,y:G.cy}]:[]).concat(s);if(pts.length<2)continue;
      var draw=function(){x.beginPath();x.moveTo(pts[0].x,pts[0].y);for(var k=1;k<pts.length-1;k++)x.quadraticCurveTo(pts[k].x,pts[k].y,(pts[k].x+pts[k+1].x)/2,(pts[k].y+pts[k+1].y)/2);x.lineTo(pts[pts.length-1].x,pts[pts.length-1].y);x.stroke();};
      x.strokeStyle=fg;x.globalAlpha=.24*vv;x.lineWidth=1.3*sc;draw();
      if(f>0){x.strokeStyle=LIL;x.globalAlpha=f;x.lineWidth=(1.5+f*2)*sc;draw();}
      x.globalAlpha=1;}}
  /* weicher Tropfen statt Kreis: wabert, zieht sich in Bewegungsrichtung lang, zittert beim Treffer */
  function blob(x,p,px,py,r){if(reduce()){x.moveTo(px+r,py);x.arc(px,py,r,0,7);return;}
    var T=clock(),N=12,sp=Math.hypot(p.vx,p.vy),dir=Math.atan2(p.vy,p.vx),st=Math.min(.3,sp*.035),wob=.08+p.hp*.3,P=[],k;
    for(k=0;k<N;k++){var th=k/N*Math.PI*2,rr=r*(1+wob*Math.sin(T*(1.2+(k%3)*.45)+p.ph+k*1.7)+wob*.5*Math.sin(T*2.3+p.ph*2+k*2.9)+st*Math.cos(2*(th-dir)));P.push([px+Math.cos(th)*rr,py+Math.sin(th)*rr]);}
    x.moveTo((P[N-1][0]+P[0][0])/2,(P[N-1][1]+P[0][1])/2);
    for(k=0;k<N;k++){var q=P[(k+1)%N];x.quadraticCurveTo(P[k][0],P[k][1],(P[k][0]+q[0])/2,(P[k][1]+q[1])/2);}x.closePath();}
  function halo(x,px,py,R,col,al){var g=x.createRadialGradient(px,py,0,px,py,R);g.addColorStop(0,col.replace('A',al.toFixed(3)));g.addColorStop(1,col.replace('A','0'));x.fillStyle=g;x.beginPath();x.arc(px,py,R,0,7);x.fill();}
  var LILA='rgba(199,179,255,A)',WHTA='rgba(243,243,244,A)';
  function atom(x,p,sc,fg,bg,kickStroke,glass,room){var tr=p.tr,v=p.v,px=p.x,py=p.y,va=(.3+.7*p.vis)*(1-.5*glass),k=(1+p.hp*.7)*(.35+.65*p.vis)*p.pk;
    /* Glas: nach jeder Füllung ein feiner Rand in derselben Farbe */
    var F=function(){x.fill();if(glass>.6){var a0=x.globalAlpha,s0=x.strokeStyle,w0=x.lineWidth;x.globalAlpha=.9*p.vis;x.strokeStyle=x.fillStyle;x.lineWidth=1.1*sc;x.stroke();x.globalAlpha=a0;x.strokeStyle=s0;x.lineWidth=w0;}};
    x.globalAlpha=p.vis;
    if(room>0)halo(x,px,py,(14+room*26)*sc*k*(tr===1?1.4:1),tr===1?LILA:WHTA,(.1+.22*room)*(1+p.hp));
    if(glass>0)halo(x,px,py,20*sc*k,tr===1?LILA:WHTA,.09*glass);
    x.globalAlpha=va;
    if(p.hp>0){x.strokeStyle=LIL;x.globalAlpha=p.hp*va;x.lineWidth=1.5*sc;x.beginPath();blob(x,p,px,py,(10+(1-p.hp)*22)*sc);x.stroke();x.globalAlpha=va;}
    x.fillStyle=p.hp>.3?LIL:fg;x.strokeStyle=x.fillStyle;x.lineWidth=2.4*sc;x.beginPath();
    if(tr===1){x.fillStyle=LIL;blob(x,p,px,py,12*sc*k);F();if(kickStroke){x.lineWidth=1.5*sc;x.strokeStyle=kickStroke;x.stroke();}}
    else if(tr===2){blob(x,p,px,py,8*sc*k);x.fillStyle=bg;F();x.stroke();if(v==='c'){x.beginPath();blob(x,p,px,py,3.5*sc*k);x.fillStyle=x.strokeStyle;F();}}
    else if(tr===0){blob(x,p,px,py,(v==='o'?7:v==='k'?3.5:5)*sc*k);F();}
    else if(tr===4){blob(x,p,px,py,4.5*sc*k);F();x.beginPath();blob(x,p,px,py,8*sc*k);x.lineWidth=1.2*sc;x.stroke();}
    else if(tr===5){blob(x,p,px,py,10*sc*k);F();}
    else if(tr===3){blob(x,p,px,py,3*sc*k);F();x.beginPath();blob(x,p,px,py,13*sc*k);x.lineWidth=1*sc;x.globalAlpha=.5*va;x.stroke();}
    else{blob(x,p,px,py,6*sc*k);F();x.beginPath();blob(x,p,px,py,11*sc*k);x.lineWidth=1*sc;x.globalAlpha=.6*va;x.stroke();}
    x.globalAlpha=1;}
  function ring(x,S,cx,cy,sc,fg,bg,live,glass){
    var m=S.m,T=clock(),g=rng(m.seed),i,fx=m.fx,now=performance.now(),room=fx.room?fx.room.a:0;glass=glass||0;
    if(live&&fx.stut&&now-S.stutT<110){var jj=(2+fx.stut.a*5)*sc;cx+=Math.sin(T*811)*jj;cy+=Math.cos(T*977)*jj;}
    var G=atoms(S,cx,cy,sc,live);G.cx=cx;G.cy=cy;
    if(room>0)halo(x,cx,cy,150*sc,LILA,.07+.1*room);
    if(fx.sweep&&live){x.globalAlpha=1;halo(x,cx,cy,(60+S.open*180)*sc,LILA,.04+.07*fx.sweep.a*S.open);}
    x.strokeStyle=fg;x.globalAlpha=.07+(fx.sweep?.08*fx.sweep.a*S.open:0);x.lineWidth=1*sc;for(i=0;i<7;i++){x.beginPath();x.arc(cx,cy,(62+i*30)*sc,0,7);x.stroke();}x.globalAlpha=1;
    bonds(x,S,G,fg,sc,live);chains(x,S,G,fg,sc,live);
    if(live)S.waves.forEach(function(w){var age=(performance.now()-w.t)/900;if(age>1||age<0)return;x.strokeStyle='rgba(199,179,255,'+(0.5*(1-age))+')';x.lineWidth=1.5*sc;x.beginPath();x.arc(cx,cy,(w.r+age*90)*sc,0,7);x.stroke();});
    var ne=Math.min(7,2+m.cnt[3]+m.cnt[6]);for(i=0;i<ne;i++){var orb=(70+g()*190)*sc,sp=(0.3+g()*0.6)*(m.bpm/110)*(g()>.5?1:-1),ph=g()*7,ea=ph+(live||!reduce()?T*sp:0);
      x.fillStyle=LIL;x.globalAlpha=.85;x.beginPath();x.arc(cx+Math.cos(ea)*orb,cy+Math.sin(ea)*orb,2.6*sc,0,7);x.fill();x.globalAlpha=1;}
    if(live&&fx.echo)S.ghosts.forEach(function(gh){var age=(now-gh.t)/gh.dt;if(age<0||age>=1)return;var p=G.byId[gh.id];if(!p)return;
      var d=gh.k*11*sc*(1+age*.7),qx=p.x+Math.cos(p.a)*d,qy=p.y+Math.sin(p.a)*d;
      x.globalAlpha=.6*fx.echo.a*Math.pow(.62,gh.k-1)*(1-age)*p.vis;x.fillStyle=LIL;x.beginPath();blob(x,p,qx,qy,(p.tr===1?9:6)*sc*(1-age*.4));x.fill();x.globalAlpha=1;});
    /* Staub: Körner lösen sich am Atom, treiben nach außen und leicht nach oben, schlingern dabei und verblassen */
    if(live)S.dust.forEach(function(d){var age=(now-d.t)/d.life,tt=(now-d.t)/1000;if(d.x0==null){var p=G.byId[d.id];if(!p)return;d.x0=p.x;d.y0=p.y;d.a=p.a+d.da;}
      var qx=d.x0+Math.cos(d.a)*d.sp*tt*sc+Math.sin(T*d.w+d.ph)*5*sc,qy=d.y0+Math.sin(d.a)*d.sp*tt*sc-9*tt*sc+Math.cos(T*d.w*.7+d.ph)*3*sc;
      x.globalAlpha=.75*Math.pow(1-age,1.3)*Math.min(1,age*10);x.fillStyle=d.lil?LIL:fg;x.beginPath();x.arc(qx,qy,d.sz*sc,0,7);x.fill();});
    x.globalAlpha=1;
    if(glass>0&&bg===INK)x.globalCompositeOperation='lighter';
    G.A.forEach(function(p){atom(x,p,sc,fg,bg,bg!==INK?INK:null,glass,room);});
    x.globalCompositeOperation='source-over';
    x.fillStyle=LIL;x.beginPath();x.arc(cx,cy,(14+S.pul(1)*9+(live?Math.sin(T*m.bpm/60*Math.PI)*1.5:0))*sc,0,7);x.fill();}
  /* Vinyl: Korn über der ganzen Karte, Staub, der langsam treibt, einzelne Knackser, dunklere Ränder */
  var GRAIN=null;function grain(){if(GRAIN)return GRAIN;var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d'),d=x.createImageData(256,256),i;
    for(i=0;i<d.data.length;i+=4){var v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()<.5?0:120;}x.putImageData(d,0,0);GRAIN=c;return c;}
  function vinyl(x,W,H,S,a,live,sc){var T=clock(),g=rng(S.m.seed^0x51),i;
    x.save();x.globalAlpha=.07+.11*a;var pt=x.createPattern(grain(),'repeat');x.translate(live?Math.floor(Math.random()*256):0,live?Math.floor(Math.random()*256):0);x.fillStyle=pt;x.fillRect(-256,-256,W+512,H+512);x.restore();
    x.fillStyle=WHT;var n=4+Math.round(a*6);for(i=0;i<n;i++){var sx=g()*W,sy=g()*H,sp=.2+g()*.5,ph=g()*7;x.globalAlpha=.18+.2*g();x.beginPath();x.arc((sx+Math.sin(T*sp+ph)*30*sc)%W,(sy+T*sp*18*sc)%H,(.8+g()*1.4)*sc,0,7);x.fill();}
    if(live&&Math.random()<a*.22){x.globalAlpha=.9;x.beginPath();x.arc(W*(.2+Math.random()*.6),380*sc+(Math.random()-.5)*400*sc,1.6*sc,0,7);x.fill();}
    x.globalAlpha=1;var v=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+(.3*a)+')');x.fillStyle=v;x.fillRect(0,0,W,H);}
  function mono(x,txt,X,Y,col,al,sc,sz){x.fillStyle=col;x.font='500 '+((sz||11)*sc)+'px "JetBrains Mono",ui-monospace,monospace';x.textAlign=al||'left';x.fillText(txt,X,Y);x.textAlign='left';}
  function fit(x,txt,max,size,fam){var s=size;do{x.font=s+'px '+fam;s-=2;}while(x.measureText(txt).width>max&&s>18);}
  /* Die ganze Karte (9:16) auf eine Fläche W×H zeichnen; o = {title, by, preset, live} */
  /* Story 9:16 (Einheiten: 540 × 960). Oben und unten bleibt Platz für die Leisten von Instagram und Co.:
     alles Wichtige liegt zwischen y = 150 und y = 800 (Instagram: Kopfzeile bis etwa 12 %, Antwortfeld ab etwa 84 %) */
  /* Tiefe: leises Licht um die Mitte und wenige feine Sterne (fest je Beat, keine Bewegung), o.space:false lässt es weg */
  function space(x,W,H,S,cx,cy,sc){
    var g=x.createRadialGradient(cx,cy,0,cx,cy,W*.95);g.addColorStop(0,'rgba(199,179,255,.09)');g.addColorStop(.45,'rgba(199,179,255,.025)');g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(0,0,W,H);
    var h=hash(S.m.bpm+':'+S.m.tot+':'+S.m.sw),i,r,n=110;
    for(i=0;i<n;i++){h=(Math.imul(h,1664525)+1013904223)>>>0;var px=(h%10000)/10000*W;h=(Math.imul(h,1664525)+1013904223)>>>0;var py=(h%10000)/10000*H;h=(Math.imul(h,1664525)+1013904223)>>>0;var q=(h%1000)/1000;
      var d=Math.hypot(px-cx,py-cy);if(d<250*sc&&q<.7)continue;
      r=(q<.85?.5+q*.7:1.1+q)*sc;x.fillStyle=(i%9===0?LILA:WHTA).replace('A',(.12+q*.35).toFixed(3));x.beginPath();x.arc(px,py,r,0,7);x.fill();}
  }
  function story(x,W,H,S,o){
    var sc=W/540,fg=WHT,bg=INK,live=!!o.live&&S.live();x.setTransform(1,0,0,1,0,0);
    x.fillStyle=bg;x.fillRect(0,0,W,H);if(o.space!==false)space(x,W,H,S,W/2,408*sc,sc);
    x.fillStyle=LIL;x.beginPath();x.arc(38*sc,164*sc,6*sc,0,7);x.fill();x.fillStyle=fg;x.font='700 '+(20*sc)+'px Figtree,sans-serif';x.textAlign='left';x.fillText('M S T R',52*sc,171*sc);
    if(o.by){x.font='600 '+(19*sc)+'px Figtree,sans-serif';x.textAlign='right';x.fillText('by '+(o.by.charAt(0)==='@'?o.by:'@'+o.by),W-32*sc,172*sc);x.textAlign='left';}
    ring(x,S,W/2,408*sc,sc*.84,fg,bg,live,o.glass);
    if(S.m.fx.lofi)vinyl(x,W,H,S,S.m.fx.lofi.a,live,sc);
    x.fillStyle=fg;fit(x,o.title,W-64*sc,80*sc,'"Instrument Serif",ui-serif,Georgia,serif');x.fillText(o.title,32*sc,700*sc);
    mono(x,((o.preset?o.preset+' · ':'')+S.m.bpm+' BPM · SWING '+Math.round(S.m.sw*100)+'% · '+S.m.tot+' HITS').toUpperCase(),32*sc,742*sc,GRY,'left',sc,16);
    var tot=clipLen(S.m.bpm),prog=live?Math.min(1,S.ct/tot):0;
    x.fillStyle='#2A2A2E';x.fillRect(32*sc,770*sc,W-64*sc,4*sc);x.fillStyle=LIL;x.fillRect(32*sc,770*sc,Math.max(4*sc,(W-64*sc)*prog),4*sc);
    x.fillStyle=bg;for(var k=1;k<NBAR;k++)x.fillRect(32*sc+(W-64*sc)*k*(240/S.m.bpm)/tot-sc,769*sc,2*sc,6*sc);
    mono(x,'TAP TO PLAY · ASIMPLEMANSLAB.COM/MSTR',32*sc,796*sc,GRY,'left',sc,14);}

  /* Karte im Sequencer: füllt eine Fläche W×H in den Farben der App; o = {fg, bg, dark, title, by, preset}.
     Unten stehen Titel und Zeile wie auf der fertigen Karte, oben rechts „by @name“, oben links o.hint (etwa TAP TO PLAY), o.edit zeichnet einen kleinen Stift hinter den Titel. Läuft der Beat nicht, steht das Bild */
  function view(x,W,H,S,o){var sc=Math.min(W/540,H/760),live=S.live(),txt=o.title?130*sc:0;x.setTransform(1,0,0,1,0,0);x.fillStyle=o.bg;x.fillRect(0,0,W,H);
    var rs=Math.min(sc,(H-txt-40*sc)/560);ring(x,S,W/2,(H-txt)/2,rs,o.fg,o.dark?INK:o.bg,live,0);if(S.m.fx.lofi&&o.dark)vinyl(x,W,H,S,S.m.fx.lofi.a,live,sc);
    if(o.hint)mono(x,o.hint,24*sc,34*sc,GRY,'left',sc);
    if(o.by){x.fillStyle=o.fg;x.font='600 '+(14*sc)+'px Figtree,sans-serif';x.textAlign='right';x.fillText('by '+(o.by.charAt(0)==='@'?o.by:'@'+o.by),W-24*sc,34*sc);x.textAlign='left';}
    if(o.title){x.fillStyle=o.fg;fit(x,o.title,W-48*sc,56*sc,'"Instrument Serif",ui-serif,Georgia,serif');x.fillText(o.title,24*sc,H-66*sc);
      if(o.edit){var tw=Math.min(x.measureText(o.title).width,W-48*sc),ps=18*sc;x.save();x.translate(24*sc+tw+12*sc,H-66*sc-ps);x.scale(ps/24,ps/24);x.strokeStyle=GRY;x.lineWidth=2;x.lineCap='round';x.lineJoin='round';x.stroke(new Path2D('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'));x.restore();}
      mono(x,((o.preset?o.preset+' · ':'')+S.m.bpm+' BPM · SWING '+Math.round(S.m.sw*100)+'% · '+S.m.tot+' HITS').toUpperCase(),24*sc,H-36*sc,GRY,'left',sc);}}
  /* Video aufnehmen: Canvas plus Ton aus dem fertig gerechneten Puffer, in Echtzeit (so lang wie der Clip).
     buf: AudioBuffer des Clips, ac: AudioContext. onTick(sek, gesamt). done(File|null, Grund) */
  function mime(){var L=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'],i;
    if(!window.MediaRecorder||!MediaRecorder.isTypeSupported)return null;for(i=0;i<L.length;i++)if(MediaRecorder.isTypeSupported(L[i]))return L[i];return null;}
  function canVideo(){var c=document.createElement('canvas');return !!(mime()&&c.captureStream&&window.AudioContext&&AudioContext.prototype.createMediaStreamDestination);}
  function record(ac,buf,S,o,onTick,done){
    var cv=document.createElement('canvas');cv.width=1080;cv.height=1920;var x=cv.getContext('2d'),mt=mime(),chunks=[],rec,src,dst,t0,raf,stopped=false,aborted=false,tot=clipLen(S.m.bpm);
    try{
      dst=ac.createMediaStreamDestination();src=ac.createBufferSource();src.buffer=buf;src.connect(dst);src.connect(ac.destination);
      var stream=cv.captureStream(30);dst.stream.getAudioTracks().forEach(function(t){stream.addTrack(t);});
      rec=new MediaRecorder(stream,{mimeType:mt,videoBitsPerSecond:6000000});
    }catch(e){return done(null,'start');}
    rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
    rec.onstop=function(){cancelAnimationFrame(raf);try{src.stop();}catch(e){}if(aborted)return done(null,'abort');
      var ext=mt.indexOf('mp4')>=0?'mp4':'webm',b=new Blob(chunks,{type:mt.split(';')[0]});
      if(!b.size)return done(null,'empty');done(new File([b],o.file+'.'+ext,{type:b.type}),null);};
    S.reset();story(x,1080,1920,S,o);
    function frame(){if(stopped)return;var ct=ac.currentTime-t0;if(ct<0)ct=0;S.seek(ct);story(x,1080,1920,S,{title:o.title,by:o.by,preset:o.preset,glass:o.glass,live:true});
      if(o.mirror){var mc=o.mirror,mx=mc.getContext('2d'),ms=Math.min(mc.width/1080,mc.height/1920),mw=1080*ms,mh=1920*ms;mx.setTransform(1,0,0,1,0,0);mx.fillStyle=o.mirrorBg||INK;mx.fillRect(0,0,mc.width,mc.height);mx.drawImage(cv,(mc.width-mw)/2,(mc.height-mh)/2,mw,mh);}
      onTick(ct,tot);if(ct>=tot){stopped=true;rec.stop();return;}raf=requestAnimationFrame(frame);}
    rec.start(250);t0=ac.currentTime+.1;src.start(t0);frame();
    return function(){if(stopped)return;stopped=true;aborted=true;cancelAnimationFrame(raf);try{rec.stop();}catch(e){}};
  }
  /* Standbild als PNG */
  function image(S,o,done){var cv=document.createElement('canvas');cv.width=1080;cv.height=1920;S.reset();story(cv.getContext('2d'),1080,1920,S,o);
    cv.toBlob(function(b){done(b?new File([b],o.file+'.png',{type:'image/png'}):null);},'image/png');}
  return {model:model,title:title,Scene:Scene,story:story,view:view,record:record,image:image,canVideo:canVideo,clipLen:clipLen,active:active,NBAR:NBAR,TAIL:TAIL};
})();
