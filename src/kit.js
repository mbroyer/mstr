/* ===== Drum-Kit: jeder Klang wird einmal Sample für Sample berechnet (analoge Drum-Machine-Modelle), danach nur noch abgespielt ===== */
/* Reines DSP ohne Web Audio: KIT[name](sampleRate) liefert ein Float32Array mit Spitzenpegel 1 */
var KIT=(function(){
  var TAU=Math.PI*2;
  /* 808-Metallklang: sechs Rechteckoszillatoren mit unharmonischen Frequenzen */
  var METAL=[205.3,304.4,369.6,522.7,540,800];
  function rnd(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296*2-1;};}
  function noise(n,seed){var r=rnd(seed),x=new Float32Array(n),i;for(i=0;i<n;i++)x[i]=r();return x;}
  /* Biquad nach RBJ, filtert an Ort und Stelle */
  function bq(x,sr,type,f,q){
    var w=TAU*Math.min(f,sr*.45)/sr,cs=Math.cos(w),al=Math.sin(w)/(2*(q||.707)),b0,b1,b2,a0=1+al,a1=-2*cs,a2=1-al,i;
    if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=b0;}else if(type==='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=b0;}else{b0=al;b1=0;b2=-al;}
    b0/=a0;b1/=a0;b2/=a0;a1/=a0;a2/=a0;
    var x1=0,x2=0,y1=0,y2=0;
    for(i=0;i<x.length;i++){var v=x[i],y=b0*v+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=v;y2=y1;y1=y;x[i]=y;}
    return x;
  }
  function metal(n,sr,k){var x=new Float32Array(n),ph=METAL.map(function(){return Math.random();}),i,j;
    for(i=0;i<n;i++){var s=0;for(j=0;j<6;j++){ph[j]+=METAL[j]*k/sr;if(ph[j]>=1)ph[j]-=1;s+=ph[j]<.5?1:-1;}x[i]=s/6;}return x;}
  function sat(x,d){var n=Math.tanh(d),i;for(i=0;i<x.length;i++)x[i]=Math.tanh(x[i]*d)/n;return x;}
  /* Ende sanft ausblenden, Gleichanteil entfernen, auf Spitzenpegel 1 bringen */
  function fin(x,sr){var i,f=Math.min(x.length,sr*.006|0),p=0,m=0;
    for(i=0;i<f;i++)x[x.length-1-i]*=i/f;
    for(i=0;i<x.length;i++)m+=x[i];m/=x.length;
    for(i=0;i<x.length;i++){x[i]-=m;p=Math.max(p,Math.abs(x[i]));}
    if(p>0)for(i=0;i<x.length;i++)x[i]/=p;return x;}
  function N(sr,s){return Math.ceil(sr*s);}

  function kick(sr,long){
    var n=N(sr,long?.9:.55),x=new Float32Array(n),c=bq(noise(n,1),sr,'bp',3200,.8),ph=0,i;
    for(i=0;i<n;i++){var t=i/sr,f=(long?44:52)+(long?190:170)*Math.exp(-t/.03)+40*Math.exp(-t/.004);
      ph+=TAU*f/sr;var a=Math.min(1,t/.0006)*Math.exp(-t/(long?.34:.17));
      x[i]=Math.sin(ph)*a+c[i]*.35*Math.exp(-t/.0025);}
    return fin(sat(x,long?2.2:1.5),sr);
  }
  function snare(sr,hi){
    var n=N(sr,.42),x=new Float32Array(n),z=noise(n,2),f1=hi?250:185,f2=hi?440:330,p1=0,p2=0,i;
    if(hi){bq(z,sr,'bp',5200,.6);bq(z,sr,'hp',1800);}else{bq(z,sr,'hp',900);bq(z,sr,'lp',8500);}
    for(i=0;i<n;i++){var t=i/sr,pe=1+.22*Math.exp(-t/.012);p1+=TAU*f1*pe/sr;p2+=TAU*f2*pe/sr;
      var tone=Math.sin(p1)*Math.exp(-t/.055)+.6*Math.sin(p2)*Math.exp(-t/.035);
      var nz=z[i]*Math.exp(-t/(hi?.075:.12))*(1+1.5*Math.exp(-t/.004));
      x[i]=Math.min(1,t/.0005)*(tone*(hi?.45:.6)+nz*.8);}
    return fin(sat(x,1.4),sr);
  }
  function rim(sr){
    var n=N(sr,.09),x=new Float32Array(n),z=bq(noise(n,3),sr,'hp',3000),i;
    for(i=0;i<n;i++){var t=i/sr;x[i]=Math.sin(TAU*1700*t)*Math.exp(-t/.008)+.6*Math.sin(TAU*480*t)*Math.exp(-t/.016)+.5*z[i]*Math.exp(-t/.003);}
    return fin(bq(sat(x,2.2),sr,'hp',300),sr);
  }
  function clap(sr){
    var n=N(sr,.5),x=noise(n,4),i,k;bq(x,sr,'bp',1150,1.1);bq(x,sr,'hp',650);
    for(i=0;i<n;i++){var t=i/sr,e=0;for(k=0;k<3;k++){var o=k*.0105;if(t>=o&&t<o+.0105)e+=Math.exp(-(t-o)/.0045);}
      if(t>=.031)e+=.85*Math.exp(-(t-.031)/.095);x[i]*=e*Math.min(1,t/.0004);}
    return fin(x,sr);
  }
  /* Hi-Hats: Metallklang durch Bandpass und doppelten Hochpass, dazu etwas Luft */
  function hat(sr,kind){
    var len={x:.16,o:.85,k:.1}[kind],tau={x:.022,o:.22,k:.011}[kind],n=N(sr,len),x=metal(n,sr,1),z=bq(noise(n,5),sr,'hp',8000),i;
    bq(x,sr,'bp',kind==='k'?8200:10000,.9);bq(x,sr,'hp',7000);bq(x,sr,'hp',7000);
    for(i=0;i<n;i++){var t=i/sr;x[i]=(x[i]+z[i]*.18)*Math.exp(-t/tau)*Math.min(1,t/.0003);}
    return fin(x,sr);
  }
  function cymbal(sr,ride){
    var n=N(sr,ride?1.5:2.4),a=metal(n,sr,ride?1.6:1.15),b=metal(n,sr,ride?2.37:1.71),z=noise(n,6),x=new Float32Array(n),i;
    for(i=0;i<n;i++)x[i]=a[i]*b[i]+z[i]*(ride?.15:.45);
    bq(x,sr,'bp',ride?5200:6200,ride?1.4:.5);bq(x,sr,'hp',ride?2500:3200);
    for(i=0;i<n;i++){var t=i/sr,e=ride?.75*Math.exp(-t/.45)+.25*Math.exp(-t/.02):Math.exp(-t/.7)*(1+.8*Math.exp(-t/.03));
      if(ride)x[i]=x[i]+.35*(Math.sin(TAU*2780*t)+.6*Math.sin(TAU*4120*t))*Math.exp(-t/.3);x[i]*=e*Math.min(1,t/.0008);}
    return fin(x,sr);
  }
  function tom(sr,f){
    var n=N(sr,.75),x=new Float32Array(n),z=bq(noise(n,7),sr,'lp',2500),tau=.26*Math.pow(100/f,.35),p1=0,p2=0,i;
    for(i=0;i<n;i++){var t=i/sr,pe=1+.35*Math.exp(-t/.05);p1+=TAU*f*pe/sr;p2+=TAU*f*1.6*pe/sr;
      x[i]=Math.min(1,t/.0006)*(Math.sin(p1)*Math.exp(-t/tau)+.22*Math.sin(p2)*Math.exp(-t/.07)+.3*z[i]*Math.exp(-t/.006));}
    return fin(sat(x,1.3),sr);
  }
  function shaker(sr){
    var n=N(sr,.16),x=noise(n,8),i;bq(x,sr,'bp',7000,1.2);bq(x,sr,'hp',4000);
    for(i=0;i<n;i++){var t=i/sr;x[i]*=t<.012?Math.pow(t/.012,2):Math.exp(-(t-.012)/.04);}
    return fin(x,sr);
  }
  function tamb(sr){
    var n=N(sr,.3),a=bq(noise(n,9),sr,'bp',9000,2.2),b=bq(noise(n,10),sr,'bp',12500,2.5),x=new Float32Array(n),i;
    for(i=0;i<n;i++){var t=i/sr,e=Math.exp(-t/.05)*Math.min(1,t/.001)+(t>=.018?.6*Math.exp(-(t-.018)/.06):0);x[i]=(a[i]+b[i]*.8)*e;}
    return fin(bq(x,sr,'hp',5000),sr);
  }
  function clave(sr){
    var n=N(sr,.12),x=new Float32Array(n),i;
    for(i=0;i<n;i++){var t=i/sr;x[i]=(Math.sin(TAU*2450*t)+.12*Math.sin(TAU*4900*t))*Math.exp(-t/.022)*Math.min(1,t/.0003);}
    return fin(x,sr);
  }
  function conga(sr){
    var n=N(sr,.45),x=new Float32Array(n),z=bq(noise(n,11),sr,'bp',1800,1),p=0,i;
    for(i=0;i<n;i++){var t=i/sr;p+=TAU*330*(1+.12*Math.exp(-t/.01))/sr;x[i]=Math.min(1,t/.0005)*(Math.sin(p)*Math.exp(-t/.11)+.25*z[i]*Math.exp(-t/.008));}
    return fin(sat(x,1.2),sr);
  }
  function cowbell(sr){
    var n=N(sr,.5),x=new Float32Array(n),a=0,b=0,i;
    for(i=0;i<n;i++){a+=540/sr;b+=800/sr;a-=a|0;b-=b|0;x[i]=(a<.5?1:-1)+(b<.5?1:-1);}
    bq(x,sr,'bp',900,1.3);bq(x,sr,'hp',400);
    for(i=0;i<n;i++){var t=i/sr;x[i]*=(.7*Math.exp(-t/.012)+.3*Math.exp(-t/.16))*Math.min(1,t/.0004);}
    return fin(x,sr);
  }
  function snap(sr){
    var n=N(sr,.15),x=bq(noise(n,12),sr,'bp',2300,2.5),i;
    for(i=0;i<n;i++){var t=i/sr;x[i]=x[i]*(Math.exp(-t/.006)+(t>=.004?.5*Math.exp(-(t-.004)/.03):0))+.3*Math.sin(TAU*1400*t)*Math.exp(-t/.01);}
    return fin(x,sr);
  }
  function sub(sr){
    var n=N(sr,1.6),x=new Float32Array(n),p=0,i;
    for(i=0;i<n;i++){var t=i/sr;p+=TAU*(49+60*Math.exp(-t/.045))/sr;x[i]=Math.sin(p)*Math.exp(-t/.7)*Math.min(1,t/.002);}
    return fin(sat(x,1.6),sr);
  }
  function rev(sr){var x=cymbal(sr,false),n=N(sr,1.4),y=new Float32Array(n),i;for(i=0;i<n;i++)y[i]=x[n-1-i];return fin(y,sr);}

  return {
    kick:function(sr){return kick(sr,false);},kickLong:function(sr){return kick(sr,true);},
    snare:function(sr){return snare(sr,false);},snare2:function(sr){return snare(sr,true);},rim:rim,clap:clap,
    hatC:function(sr){return hat(sr,'x');},hatO:function(sr){return hat(sr,'o');},hatP:function(sr){return hat(sr,'k');},
    crash:function(sr){return cymbal(sr,false);},ride:function(sr){return cymbal(sr,true);},reverse:rev,
    tomL:function(sr){return tom(sr,92);},tomM:function(sr){return tom(sr,132);},tomH:function(sr){return tom(sr,185);},
    shaker:shaker,tamb:tamb,clave:clave,conga:conga,cowbell:cowbell,snap:snap,sub:sub
  };
})();
