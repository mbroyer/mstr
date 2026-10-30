# Gleicht die Lautheit je Instrument über alle Kits an (RMS der ersten 200 ms), Spitze bleibt unter -1 dBFS
import sys, os, glob, subprocess, numpy as np, collections
d = sys.argv[1]
def dec(f):
    return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','2','-ar','44100','-'],capture_output=True).stdout,np.float32).reshape(-1,2)
A = {f: dec(f) for f in sorted(glob.glob(d+'/*.mp3'))}
rms = {f: float(np.sqrt((a[:8820]**2).mean())) for f, a in A.items()}
by = collections.defaultdict(list)
for f in A: by[f.rsplit('-',1)[1]].append(f)
for role, fs in by.items():
    tgt = float(np.median([rms[f] for f in fs]))
    for f in fs:
        a = A[f]; g = min(tgt/rms[f], .89/np.abs(a).max())
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i','-','-b:a','112k',f], input=(a*g).astype(np.float32).tobytes(), check=True)
        print(os.path.basename(f), round(rms[f],3), '->', round(rms[f]*g,3))
