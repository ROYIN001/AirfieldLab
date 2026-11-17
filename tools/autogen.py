import numpy as np, cv2, json, math, sys, struct, os
sys.path.insert(0,'/home/claude/data/proc')
from extract_poly import polys
cls=np.load('land_in.npy').copy(); E0,N1,R=-3600,5000,2.5
H,W=cls.shape
# --- clean rail speckle (text) -> nearest other class
rail=(cls==18).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(rail,8)
bad=np.zeros(n,bool)
for i in range(1,n):
    x,y,w,h,a=st[i]
    if math.hypot(w,h)*R<250: bad[i]=True
cls[bad[lab]]=0
# --- thin minor roads by 1px
road=(cls==13).astype(np.uint8)
er=cv2.erode(road,np.ones((3,3),np.uint8))
cls[(road>0)&(er==0)]=0
# fill zeros (inside coverage) with nearest
def fill(cls):
    src=(cls>0).astype(np.uint8)
    d,lab=cv2.distanceTransformWithLabels(1-src,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    ys,xs=np.nonzero(src); lut=np.zeros(lab.max()+1,np.uint8); lut[lab[ys,xs]]=cls[ys,xs]
    out=cls.copy(); m=cls==0; out[m]=lut[lab[m]]; return out
cov=np.load('land_in.npy')>0
cls=fill(cls); cls[~cov]=0
cv2.imwrite('/home/claude/data/out/land_in.png',cls)
np.save('land_in_clean.npy',cls)
# --- road distance & orientation
roads=np.isin(cls,[13,14,15,16,17]).astype(np.uint8)
dist=cv2.distanceTransform(1-roads,cv2.DIST_L2,5)*R
gx=cv2.Sobel(dist,cv2.CV_32F,1,0,ksize=5); gy=cv2.Sobel(dist,cv2.CV_32F,0,1,ksize=5)
# major road distance
major=np.isin(cls,[14,15,16,17]).astype(np.uint8)
dmaj=cv2.distanceTransform(1-major,cv2.DIST_L2,5)*R
# --- mapped buildings outside the 1 m airfield box -> polygons
inbox=np.zeros_like(cls,bool)
x0=int((-2800-E0)/R); x1=int((3000-E0)/R); y0=int((N1-4000)/R); y1=int((N1+3400)/R)
inbox[max(0,y0):y1, max(0,x0):x1]=True
bmask=((cls==19)&(~inbox)).astype(np.uint8)
P=polys(bmask,eps=2.0,minarea=60,res=R,e0=E0,n1=N1)
rng=np.random.RandomState(5)
mapped=[]
for p in P:
    a=p['area']
    if a>8000: h=14+rng.rand()*14
    elif a>2000: h=10+rng.rand()*12
    elif a>500: h=7+rng.rand()*12
    else: h=6+rng.rand()*6
    mapped.append(dict(o=[[round(x,1),round(y,1)] for x,y in p['outer']],z=round(min(h,45),1),k='c'))
print('mapped city buildings',len(mapped))
# --- autogen
buildable={1:0.75,2:1.0,3:0.9,4:0.7,23:0.35,24:0.3,5:0.25}
occ=np.zeros((H,W),np.uint8)
occ[np.isin(cls,[19,27,28])]=1          # mapped footprints occupied
occ=cv2.dilate(occ,np.ones((3,3),np.uint8))
# airfield exclusion polygon (rough) in local metres
af=np.array([[-2104,-2500],[-1567,-1500],[-763,0],[-214,1000],[334,2000],[664,2600],[1800,2600],[2000,1500],[1500,1100],[960,0],[100,-1638],[-200,-2500],[-900,-2950],[-1900,-2950]],float)
afmask=np.zeros((H,W),np.uint8)
cv2.fillPoly(afmask,[np.array([[(e-E0)/R,(N1-n)/R] for e,n in af],np.int32)],1)
def density(e,n):
    # distance to airport centre band
    d=math.hypot(e*0.9,n*0.55)
    return 1.0 if d<1700 else max(0.06,1.0-(d-1700)/2300)
out=[]
step=9.0
for gyv in np.arange(N1-step/2,N1-H*R,-step):
    for gxv in np.arange(E0+step/2,E0+W*R,step):
        e=gxv+(rng.rand()-0.5)*step*0.8; n=gyv+(rng.rand()-0.5)*step*0.8
        x=int((e-E0)/R); y=int((N1-n)/R)
        if x<2 or y<2 or x>=W-2 or y>=H-2: continue
        c=int(cls[y,x]); p=buildable.get(c,0)
        if p==0 or afmask[y,x] or occ[y,x]: continue
        dr=float(dist[y,x])
        if dr<2.5: continue
        if rng.rand()>p*density(e,n)*0.62: continue
        # orientation: gradient points away from nearest road
        ang=math.atan2(-float(gy[y,x]),float(gx[y,x]))   # in local e,n frame (y down -> flip)
        near_major=float(dmaj[y,x])<45
        r=rng.rand()
        if c in (4,) or (c==5):
            w=14+rng.rand()*22; d=18+rng.rand()*25; h=6+rng.rand()*6; kind=0
        elif near_major and r<0.05:
            w=18+rng.rand()*18; d=14+rng.rand()*8; h=(8+rng.randint(0,7))*3.1; kind=2   # condo/office 8-14 floors
        elif dr<22 and r<0.75:
            w=4+rng.rand()*4.5; d=10+rng.rand()*6; h=(2+rng.randint(0,3))*3.2; kind=1   # shophouse rows
        else:
            w=8+rng.rand()*6; d=8+rng.rand()*6; h=(1+rng.randint(0,2))*3.1+rng.rand()*1.5; kind=3  # detached house (gable)
        h=min(h,44.0)
        # footprint occupancy check (approx radius)
        rad=int(max(w,d)*0.45/R)
        ys=slice(max(0,y-rad),y+rad+1); xs=slice(max(0,x-rad),x+rad+1)
        if occ[ys,xs].any(): continue
        if roads[ys,xs].any() and kind!=1: continue
        occ[ys,xs]=1
        out.append((e,n,w,d,h,ang,kind))
print('autogen',len(out))
# --- write binary: int16 e*2, int16 n*2, u8 w*4, u8 d*4, u8 h*4, u8 yaw (0..255 -> 0..pi), u8 kind|colour
buf=bytearray()
for e,n,w,d,h,ang,kind in out:
    yaw=(ang%math.pi)/math.pi*255
    col=rng.randint(0,16)
    buf+=struct.pack('<hhBBBBB',int(round(e*2)),int(round(n*2)),min(255,int(w*4)),min(255,int(d*4)),min(255,int(h*4)),int(yaw)&255,(kind<<4)|col)
open('/home/claude/data/out/city_bld.bin','wb').write(buf)
json.dump(mapped,open('city_mapped.json','w'),separators=(',',':'))
print('bin KB',len(buf)//1024)
