"""Pick one hit per role from each DrumGizmo kit, mix the mics to stereo, write mp3.
Usage: python3 -I extract.py <outdir>"""
import sys, os, re, io, json, posixpath, subprocess, wave
import xml.etree.ElementTree as ET
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rzip import open_zip

OUT = sys.argv[1]
B = 'https://drumgizmo.org/kits/'
KITS = {
  'drs':      dict(zip='DRSKit/DRSKit2_1.zip', xml='DRSKit/DRSKit_full.xml', map=dict(
      kick='Kdrum_without_contact', snare='Snare', rim='Snare_rim', hhc='Hihat_closed', hho='Hihat_open',
      hhp='Hihat_foot', tom='Tom1', ftom='Tom3', crash='Crash_left_tip', ride='Ride_tip')),
  'crocell':  dict(zip='CrocellKit/CrocellKit1_1.zip', xml='CrocellKit/CrocellKit_full.xml', map=dict(
      kick='KDrumR', snare='Snare', rim='SnareRim', hhc='HihatClosed', hho='HihatOpen',
      hhp='HihatPedal', tom='Tom2', ftom='FTom1', crash='CrashR', ride='RideR')),
  'muldjord': dict(zip='MuldjordKit/MuldjordKit3.zip', xml='MuldjordKit3/MuldjordKit3.xml', map=dict(
      kick='KdrumR', snare='Snare', hhc='HihatClosed', hho='HihatOpen',
      tom='Tom2', ftom='Tom4', crash='CrashL', ride='RideR')),
  'aasimonster': dict(zip='Aasimonster/aasimonster2_1.zip', xml='aasimonster2/aasimonster.xml', map=dict(
      kick='kick_r', snare='snare_on_center', rim='snare_rim_shot', hhc='hihat_closed1', hho='hihat_open',
      tom='tom_2', ftom='tom_4', crash='crash1', ride='ride')),
  'shitty':   dict(zip='ShittyKit/ShittyKit1_2.zip', xml='ShittyKit/ShittyKit.xml', map=dict(
      kick='kick', snare='snare-Dyn-RH', rim='snare-RmClk', hhc='HH-closed', hho='HH-open',
      hhp='HH-pdl', tom='Tom-RH', ftom='Floor-RH', crash='Crash1', ride='ride')),
}
LEN = dict(kick=.7, snare=.6, rim=.35, hhc=.35, hho=1.0, hhp=.4, tom=.9, ftom=1.1, crash=2.0, ride=1.4)
LEVEL = float(os.environ.get('PCT', '0.8'))  # which strength of hit to take (0 soft .. 1 hardest)

def pan(ch):
    if not re.match(r'(?i)(oh|amb|room)', ch): return (1, 1)
    if re.search(r'(?i)(left|-l$|_l$|l$)', ch): return (1, .25)
    if re.search(r'(?i)(right|-r$|_r$|r$)', ch): return (.25, 1)
    return (1, 1)

def pick(inst):
    samples = inst.findall('./samples/sample')
    pw = [s.get('power') for s in samples]
    if all(p is not None for p in pw):
        order = sorted(samples, key=lambda s: float(s.get('power')))
        return order[min(len(order) - 1, int(LEVEL * len(order)))]
    by = {s.get('name'): s for s in samples}
    for v in inst.findall('./velocities/velocity'):
        if float(v.get('lower')) <= LEVEL < float(v.get('upper')):
            return by[v.find('sampleref').get('name')]
    return samples[-1]

def readwav(b):
    w = wave.open(io.BytesIO(b))
    n, c, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
    raw = w.readframes(n)
    if sw == 2: a = np.frombuffer(raw, '<i2').astype(np.float32) / 32768
    elif sw == 3:
        u = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.int32)
        a = ((u[:, 0] | (u[:, 1] << 8) | (u[:, 2] << 16)) << 8 >> 8).astype(np.float32) / 8388608
    elif sw == 4: a = np.frombuffer(raw, '<i4').astype(np.float32) / 2147483648
    return a.reshape(-1, c), sr

def readany(b):
    try: return readwav(b)
    except Exception:  # float wav etc.: let ffmpeg decode
        p = subprocess.run(['ffmpeg', '-v', 'error', '-i', '-', '-f', 'f32le', '-'], input=b, capture_output=True)
        pr = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=channels,sample_rate', '-of', 'json', '-'], input=b, capture_output=True)
        st = json.loads(pr.stdout)['streams'][0]
        return np.frombuffer(p.stdout, np.float32).reshape(-1, st['channels']), int(st['sample_rate'])

os.makedirs(OUT, exist_ok=True)
info = {}
only = sys.argv[2:] or list(KITS)
for kid in only:
    k = KITS[kid]
    z = open_zip(B + k['zip'])
    kit = ET.fromstring(z.read(k['xml']))
    kdir = posixpath.dirname(k['xml'])
    info[kid] = {}
    for role, iname in k['map'].items():
        ie = [i for i in kit.iter('instrument') if i.get('name') == iname][0]
        main = {c.get('in') for c in ie.findall('channelmap') if c.get('main') == 'true'}
        ipath = posixpath.normpath(posixpath.join(kdir, ie.get('file')))
        inst = ET.fromstring(z.read(ipath))
        s = pick(inst)
        files = {}
        for af in s.findall('audiofile'):
            files.setdefault(af.get('file'), []).append((af.get('channel'), int(af.get('filechannel'))))
        mix = None
        for f, chans in files.items():
            a, sr = readany(z.read(posixpath.normpath(posixpath.join(posixpath.dirname(ipath), f))))
            if mix is None: mix = np.zeros((a.shape[0], 2), np.float32)
            n = min(len(mix), len(a))
            for ch, fc in chans:
                g = 1.0 if (not main or ch in main) else 0.25
                l, r = pan(ch)
                mix[:n, 0] += a[:n, fc - 1] * g * l
                mix[:n, 1] += a[:n, fc - 1] * g * r
        env = np.abs(mix).max(1)
        pk = env.max()
        on = max(0, int(np.argmax(env > pk * .05)) - int(sr * .002))
        n = int(LEN[role] * sr)
        seg = mix[on:on + n].copy()
        fl = int(len(seg) * .35)
        seg[-fl:] *= np.linspace(1, 0, fl)[:, None] ** 2
        seg *= 0.89 / np.abs(seg).max()
        pcm = (seg * 32767).astype('<i2').tobytes()
        mp3 = os.path.join(OUT, f'{kid}-{role}.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(sr), '-ac', '2', '-i', '-',
                        '-ar', '44100', '-b:a', '112k', mp3], input=pcm, check=True)
        info[kid][role] = dict(instrument=iname, sample=s.get('name'), mics=len(sum(files.values(), [])))
        print(kid, role, iname, s.get('name'), os.path.getsize(mp3), flush=True)
json.dump(info, open(os.path.join(OUT, f'info-{"-".join(only)}.json'), 'w'), indent=1)
