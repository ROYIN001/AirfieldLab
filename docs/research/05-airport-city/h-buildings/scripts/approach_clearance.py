# Clearance of city_v2 buildings below the 3 deg glide path in a +-500 m corridor, 0-8 km before each threshold
import sys, json, base64, struct, math, numpy as np
sys.path.insert(0, sys.argv[1]); from geo import ll_to_en, dms
d=json.load(open(sys.argv[2]))
ob=base64.b64decode(d['obb'])
a=np.frombuffer(ob,dtype=np.dtype([('e','<i2'),('n','<i2'),('w','<u2'),('d','<u2'),('h','<u2'),('yaw','u1'),('f','u1')]))
E=list(a['e']/2); N=list(a['n']/2); H=list(a['h']/10)
pb=base64.b64decode(d['poly']); i=0
while i<len(pb):
    k,hh,f=struct.unpack_from('<BHB',pb,i); i+=4
    v=np.frombuffer(pb[i:i+4*k],dtype='<i2').reshape(-1,2)/2; i+=4*k
    for x,y in v: E.append(x); N.append(y); H.append(hh/10)   # every vertex (conservative)
for o in d['obst']: E.append(o['e']); N.append(o['n']); H.append(o['h'])
E=np.array(E); N=np.array(N); H=np.array(H)
T={'03L':(dms(13,53,49.24),dms(100,35,45.38)),'21R':(dms(13,55,34.87),dms(100,36,44.62)),'03R':(dms(13,53,58.45),dms(100,36,5.50)),'21L':(dms(13,55,28.33),dms(100,36,55.97))}
T={k:np.array(ll_to_en(*v)) for k,v in T.items()}
pair={'03L':'21R','21R':'03L','03R':'21L','21L':'03R'}; rdh={'03L':55,'21R':54,'21L':53,'03R':50}
tan3=math.tan(math.radians(3))
res={}
for r in T:
    u=T[pair[r]]-T[r]; u/=np.hypot(*u); rn=np.array([u[1],-u[0]])
    p=np.stack([E,N],1)-T[r]; s=p@u; t=p@rn
    m=(s<0)&(s>-8000)&(np.abs(t)<=500)
    hgp=rdh[r]*0.3048+(-s[m])*tan3; c=hgp-H[m]; j=np.argmin(c)
    # also ratio of height to glide path height
    q=np.argmax(H[m]/hgp)
    res[r]={'n_pts':int(m.sum()),'min_clear_m':round(float(c[j]),1),'at_s':round(float(s[m][j]),1),'at_t':round(float(t[m][j]),1),'h':float(H[m][j]),'hgp':round(float(hgp[j]),1),
            'max_ratio':round(float((H[m]/hgp)[q]),3),'ratio_at_s':round(float(s[m][q]),1),'ratio_h':float(H[m][q]),
            'n_h_gt_45':int((H[m]>45).sum())}
    print(r,res[r])
json.dump(res,open(sys.argv[3],'w'),indent=1)
