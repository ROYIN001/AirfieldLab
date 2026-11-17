import cv2, numpy as np, json, sys, math, time
from skimage.morphology import skeletonize
sys.path.insert(0,'/home/claude/data/chart')
from geo import THR
t0=time.time()
im=cv2.imread('af_1m.png'); E0,N1=-2800,4000; H,W=im.shape[:2]
rgb=im[:,:,::-1].astype(np.int16)
def near(c,tol): return (np.abs(rgb-np.array(c,np.int16)).sum(2)<=tol)
M={}
M['line']=near((187,187,204),14)
M['apron']=near((218,218,224),6)
M['term']=near((196,182,171),12)
M['bld']=near((217,208,201),8)|near((216,207,200),6)
M['milbld']=near((220,197,191),8)
M['water']=near((170,211,223),12)|near((177,200,210),12)
M['grass']=near((205,235,176),12)
M['golf']=near((222,246,192),10)
M['aero']=near((233,231,226),6)|near((232,229,226),6)
M['parking']=near((238,238,238),3)
print({k:round(float(v.mean()),4) for k,v in M.items()}, round(time.time()-t0,1))
def px(e,n): return (e-E0, N1-n)
# runway exclusion mask
rmask=np.zeros((H,W),np.uint8)
for a,b,wid in [('03L','21R',60),('03R','21L',45)]:
    A=np.array(THR[a]); B=np.array(THR[b]); u=(B-A)/np.linalg.norm(B-A); nrm=np.array([u[1],-u[0]])
    ext = 350 if b=='21L' else 0
    P=[A-u*30+nrm*(wid/2+12), B+u*(30+ext)+nrm*(wid/2+12), B+u*(30+ext)-nrm*(wid/2+12), A-u*30-nrm*(wid/2+12)]
    cv2.fillPoly(rmask,[np.array([px(*p) for p in P],np.int32)],1)
np.save('rwy_mask.npy',rmask)
line=M['line'].astype(np.uint8)
line[rmask>0]=0
# bridge label gaps: close with small kernel then remove tiny comps
line=cv2.morphologyEx(line,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
n,lab,st,_=cv2.connectedComponentsWithStats(line,8)
keep=np.zeros(n,bool); keep[1:]=st[1:,cv2.CC_STAT_AREA]>=120
line=keep[lab].astype(np.uint8)
sk=skeletonize(line>0)
print('skeleton px',int(sk.sum()), round(time.time()-t0,1))
np.save('tw_skel.npy',sk)
np.save('tw_line.npy',line)
# width estimate via distance transform
dt=cv2.distanceTransform(line,cv2.DIST_L2,5)
w=dt[sk]*2
print('line width px median',np.median(w),'p10',np.percentile(w,10),'p90',np.percentile(w,90))
for k in ['apron','term','bld','milbld','water','grass','golf','aero','parking']:
    np.save('m_%s.npy'%k,M[k])
