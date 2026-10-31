# Baut index.html (eine einzelne Seite) aus src/
import os
H=os.path.dirname(os.path.abspath(__file__))+'/'
def r(n): return open(H+'src/'+n,encoding='utf8').read()
js='\n'.join(r(n) for n in ['app.js','audio.js','beats.js','klang.js','card.js','worte.js','mstr.js'])
out='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="MSTR">
<title>MSTR</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
'''+r('mstr.css')+'''</style>
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
open(H+'index.html','w',encoding='utf8').write(out)
print(len(out))
