import sys, json, base64, struct, numpy as np
d=json.load(open(sys.argv[1]))
ob=base64.b64decode(d['obb']); n=len(ob)//12
a=np.frombuffer(ob,dtype=np.dtype([('e','<i2'),('n','<i2'),('w','<u2'),('d','<u2'),('h','<u2'),('yaw','u1'),('f','u1')]))
e=a['e']/2; nn=a['n']/2; h=a['h']/10; r=np.hypot(e,nn)
pb=base64.b64decode(d['poly']); i=0; P=[]
while i<len(pb):
    k,hh,f=struct.unpack_from('<BHB',pb,i); i+=4
    v=np.frombuffer(pb[i:i+4*k],dtype='<i2').reshape(-1,2)/2; i+=4*k
    P.append((v.mean(0),hh/10,f>>4))
pc=np.array([p[0] for p in P]); ph=np.array([p[1] for p in P]); pr=np.hypot(pc[:,0],pc[:,1])
H=np.concatenate([h,ph]); R=np.concatenate([r,pr]); F=np.concatenate([a['f']>>4,[p[2] for p in P]])
print('obb',n,'poly',len(P),'total',len(H))
for lo,hi in [(0,2000),(2000,5000),(5000,10000)]:
    m=(R>=lo)&(R<hi); print(lo,hi,int(m.sum()),'p50 %.1f p90 %.1f max %.1f'%(np.median(H[m]),np.percentile(H[m],90),H[m].max()))
print('h>45',int((H>45).sum()),'h>60',int((H>60).sum()),'max',H.max(),'min',H.min())
print('src codes',{int(k):int((F==k).sum()) for k in np.unique(F)})
print('obst',[(o['id'],o['h']) for o in d['obst']])
