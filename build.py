# Baut beatbox.html (eine einzelne Seite) aus src/
import os
H=os.path.dirname(os.path.abspath(__file__))+'/'
def r(n): return open(H+'src/'+n,encoding='utf8').read()
js='\n'.join(r(n) for n in ['app.js','audio.js','monster.js','beats.js','beatbox.js'])
out='''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b2420">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Beatbox">
<title>Monster-Beatbox</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap">
<style>
'''+r('basis.css')+'\n'+r('beatbox.css')+'''
.beatcard{max-height:none;overflow:visible}
</style>
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
open(H+'beatbox.html','w',encoding='utf8').write(out)
print(len(out))
