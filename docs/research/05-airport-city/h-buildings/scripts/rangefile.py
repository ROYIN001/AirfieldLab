import requests, os, io, threading
CA='/root/.ccr/ca-bundle.crt'
_s=threading.local()
def sess():
    if not hasattr(_s,'s'):
        s=requests.Session(); s.verify=CA; _s.s=s
    return _s.s
class RangeFile(io.RawIOBase):
    """Seekable read-only file over HTTP range requests with a block cache."""
    def __init__(self, url, size=None, block=1<<20):
        self.url=url; self.pos=0; self.block=block; self.cache={}; self.nreq=0; self.nbytes=0
        if size is None:
            r=sess().head(url); r.raise_for_status(); size=int(r.headers['Content-Length'])
        self.size=size
    def readable(self): return True
    def seekable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        if whence==0: self.pos=off
        elif whence==1: self.pos+=off
        else: self.pos=self.size+off
        return self.pos
    def fetch(self, a, b):  # inclusive a..b-1
        for k in range(3):
            try:
                r=sess().get(self.url, headers={'Range':f'bytes={a}-{b-1}'}, timeout=120)
                r.raise_for_status(); self.nreq+=1; self.nbytes+=len(r.content); return r.content
            except Exception as ex:
                err=ex
        raise err
    def read(self, n=-1):
        if n is None or n<0: n=self.size-self.pos
        n=min(n, self.size-self.pos)
        if n<=0: return b''
        a=self.pos; b=a+n
        if n>4*self.block:
            data=self.fetch(a,b)
        else:
            bs=self.block; parts=[]
            for blk in range(a//bs, (b-1)//bs+1):
                if blk not in self.cache:
                    self.cache[blk]=self.fetch(blk*bs, min(self.size,(blk+1)*bs))
                parts.append(self.cache[blk])
            buf=b''.join(parts); off=a-(a//bs)*bs; data=buf[off:off+n]
        self.pos=b; return data
    def readinto(self, b):
        d=self.read(len(b)); b[:len(d)]=d; return len(d)
