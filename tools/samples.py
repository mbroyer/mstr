# Baut src/samples.js aus frei lizenzierten Aufnahmen (CC0):
#   Virtuosity Drums (Versilian Studios), https://github.com/sfzinstruments/virtuosity_drums
#   Versilian Community Sample Library (nur Clap), https://github.com/sgossner/VCSL
# Je Klang werden Nahmikrofon und Overheads gemischt, Stille vorn abgeschnitten, das Ende ausgeblendet
# und das Ergebnis als MP3 (Stereo, 128 kbit/s) base64-kodiert eingebettet. Braucht ffmpeg und numpy.
import os,sys,json,base64,subprocess,urllib.request
import numpy as np
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
CACHE=H+'tools/.cache/'
VD='https://raw.githubusercontent.com/sfzinstruments/virtuosity_drums/9f04cf9a734527edfbb0a4eee1f674e45bbf71bc/Samples/'
VCSL='https://raw.githubusercontent.com/sgossner/VCSL/c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e/'
SR=44100
def kit(group,name,mics):return [(VD+m+'/'+group+'/'+m+'_'+name+'.flac',g) for m,g in mics]
CLOSE_K=[('kickmic',1),('oh',.35)]
CLOSE_S=[('snaremic',1),('oh',.5)]
TOM=[('mid',1),('oh',.5)]
CYM=[('oh',1),('mid',.5)]
def perc(name):return [(VD+'perc/close/'+name,1)]
# Name: [Varianten (Round Robins), jede eine Liste (URL, Pegel)], maximale Länge in s
SOUNDS={
  'kick':([kit('kick','kick_snoff_vl3_rr1',CLOSE_K),kit('kick','kick_snoff_vl3_rr2',CLOSE_K)],.8),
  'snare':([kit('snare','snare_center_vl30',CLOSE_S),kit('snare','snare_center_vl31',CLOSE_S)],.8),
  'stick':([kit('snare','snare_crossstick_vl13',CLOSE_S)],.4),
  'rimshot':([kit('snare','snare_rimshot_vl10',CLOSE_S)],.9),
  'flam':([kit('snare','snare_flam_vl10',CLOSE_S)],.9),
  'buzz':([kit('snare','snare_buzz_vl10',CLOSE_S)],1.0),
  'hatC':([kit('hh','hh_closed_vl3_rr1',CYM),kit('hh','hh_closed_vl3_rr2',CYM)],.35),
  'hatO':([kit('hh','hh_open_vl3_rr1',CYM)],1.3),
  'hatP':([kit('hh','hh_pedal_vl2_rr1',CYM)],.35),
  'splash':([kit('hh','hh_splash_rr1',CYM)],1.4),
  'crash':([kit('crash','crash_crash_vl2_rr1',CYM)],2.6),
  'ride':([kit('ride','ride_ride_vl2_rr1',CYM)],1.8),
  'bell':([kit('ride','ride_bell_vl2_rr1',CYM)],1.8),
  'tomL':([kit('ltom','ltom_center_vl13',TOM)],1.2),
  'tomH':([kit('htom','htom_center_vl13',TOM)],1.0),
  'shaker':([perc('shaker/LShaker_Shake1D_rr1_Close.wav')],.4),
  'tamb':([perc('tambourine/Tamb1_Shake_rr1_Close.wav')],.6),
  'clave':([perc('claves/Claves1_Hit_v2_rr1_Close.wav')],.4),
  'conga':([perc('conga/Conga_22_HitN_51_100_rr1_Close.wav')],.6),
  'cowbell':([perc('cowbell/Cowbell1_Normal_v2_rr1_Close.wav')],.6),
  'triangle':([perc('triangle/Triangle1_Hit_v2_rr1_Close.wav')],1.6),
  'clap':([[(VCSL+'Idiophones/Struck%20Idiophones/Claps/Clap_rr1.wav',1)]],.6),
}
def get(url):
  p=CACHE+url.split('/Samples/')[-1].split('/')[-1].replace('%20','_')
  if not os.path.exists(p):
    os.makedirs(CACHE,exist_ok=True);urllib.request.urlretrieve(url,p)
  r=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True)
  return np.frombuffer(r.stdout,dtype=np.float32).reshape(-1,2)
def render(parts,maxlen):
  xs=[get(u)*g for u,g in parts];n=max(len(x) for x in xs);y=np.zeros((n,2),np.float32)
  for x in xs:y[:len(x)]+=x
  a=np.abs(y).max(axis=1);pk=a.max()
  on=max(0,int(np.argmax(a>pk*.02))-int(SR*.001))
  y=y[on:on+int(maxlen*SR)];a=np.abs(y).max(axis=1)
  idx=np.nonzero(a>pk*.003)[0];end=min(len(y),(idx[-1] if len(idx) else len(y))+int(SR*.02))
  y=y[:end];f=min(len(y),int(SR*.03));y[-f:]*=np.linspace(1,0,f)[:,None]
  return y/pk*.89
def mp3(y):
  r=subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','libmp3lame','-b:a','128k','-f','mp3','-'],input=y.astype(np.float32).tobytes(),capture_output=True,check=True)
  return base64.b64encode(r.stdout).decode()
out={};tot=0
for k,(vs,ml) in SOUNDS.items():
  out[k]=[];
  for v in vs:y=render(v,ml);b=mp3(y);tot+=len(b);out[k].append(b);print('%-9s %.2fs %6d B'%(k,len(y)/SR,len(b)),file=sys.stderr)
js='/* Aufnahmen eines echten Schlagzeugs (CC0): Virtuosity Drums von Versilian Studios, Clap aus der VCSL. Erzeugt von tools/samples.py, nicht von Hand ändern */\nvar SAMPLES='+json.dumps(out,separators=(',',':'))+';\n'
open(H+'src/samples.js','w').write(js);print('gesamt',tot,'Bytes base64',file=sys.stderr)
