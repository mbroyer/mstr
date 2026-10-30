# Baut index.html (eine einzelne Seite) aus src/
# python3 build.py studio  baut zusätzlich teststudio.html mit den DrumGizmo-Kits aus kits/drumgizmo/
import os, sys, glob, base64, json
H=os.path.dirname(os.path.abspath(__file__))+'/'
def r(n): return open(H+'src/'+n,encoding='utf8').read()
def page(js, css, title):
    return '''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="MSTR">
<title>'''+title+'''</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
'''+css+'''</style>
</head>
<body>
'''+r('body.html')+'''<script>
(function(){
'use strict';
'''+js+'''
})();
</script>
</body>
</html>
'''
js='\n'.join(r(n) for n in ['app.js','audio.js','beats.js','klang.js','mstr.js'])
out=page(js, r('mstr.css'), 'MSTR')
open(H+'index.html','w',encoding='utf8').write(out)
print('index.html', len(out))
if 'studio' in sys.argv[1:]:
    mp3={os.path.basename(f)[:-4]: base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob(H+'kits/drumgizmo/*.mp3'))}
    sjs=js+'\nvar KITMP3='+json.dumps(mp3,separators=(',',':'))+';\n'+r('studio.js')
    st=page(sjs, r('mstr.css')+r('studio.css'), 'MSTR Teststudio')
    open(H+'teststudio.html','w',encoding='utf8').write(st)
    print('teststudio.html', len(st))
