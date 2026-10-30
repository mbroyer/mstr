import io, sys, urllib.request, zipfile, json
class HttpFile:
    def __init__(s, url):
        s.url=url; s.pos=0
        r=urllib.request.urlopen(urllib.request.Request(url,method='HEAD')); s.size=int(r.headers['Content-Length'])
    def seekable(s): return True
    def readable(s): return True
    def tell(s): return s.pos
    def seek(s,o,w=0):
        s.pos = o if w==0 else s.pos+o if w==1 else s.size+o
        return s.pos
    def read(s,n=-1):
        if n<0: n=s.size-s.pos
        if n==0 or s.pos>=s.size: return b''
        end=min(s.pos+n,s.size)-1
        r=urllib.request.urlopen(urllib.request.Request(s.url,headers={'Range':f'bytes={s.pos}-{end}'}))
        d=r.read(); s.pos+=len(d); return d
def open_zip(url):
    return zipfile.ZipFile(HttpFile(url))
if __name__=='__main__':
    z=open_zip(sys.argv[1])
    for i in z.infolist(): print(i.file_size, i.filename)
