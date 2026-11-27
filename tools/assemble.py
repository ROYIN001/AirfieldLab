import numpy as np, cv2, json, pickle, math, sys
sys.path.insert(0,'/home/claude/data/proc'); sys.path.insert(0,'/home/claude/data/chart')
from geo import THR, NAV, latlon, enu, dms
from graph import rdp
from merge import E0,N1
H2,centers,pls=pickle.load(open('tw_pl.pkl','rb'))
poly=json.load(open('af_polys.json'))
im=cv2.imread('af_1m.png')[:,:,::-1].astype(int)
# ---------- runways (AIP) ----------
RW=[('03L','21R',60,0),('03R','21L',45,350)]
def rwy_frame(a,b,disp):
    A=np.array(THR[a]); B=np.array(THR[b]); u=(B-A)/np.linalg.norm(B-A)
    return A,u,np.array([u[1],-u[0]]),float(np.linalg.norm(B-A))+disp
def dist_to_rwy(p):
    best=1e9
    for a,b,w,disp in RW:
        A,u,r,L=rwy_frame(a,b,disp); q=p-A; s=q@u; t=q@r
        if -60<=s<=L+60: best=min(best,abs(t))
    return best
# ---------- taxiways ----------
def med_color(P):
    cols=[]
    for j in range(len(P)-1):
        a,b=P[j],P[j+1]; n=max(2,int(np.hypot(*(b-a))/3))
        for t in np.linspace(0,1,n):
            e,nn=a+(b-a)*t; x=int(e-E0); y=int(N1-nn)
            if 0<=x<im.shape[1] and 0<=y<im.shape[0]: cols.append(im[y,x])
    return np.median(np.array(cols),0) if cols else np.array([0,0,0])
apmask=np.zeros(im.shape[:2],np.uint8)
for p in poly['apron']:
    cv2.fillPoly(apmask,[np.array([[e-E0,N1-n] for e,n in p['outer']],np.int32)],1)
    for h in p['holes']: cv2.fillPoly(apmask,[np.array([[e-E0,N1-n] for e,n in h],np.int32)],0)
def frac_on_apron(P):
    c=0;t=0
    for j in range(len(P)-1):
        a,b=P[j],P[j+1]; n=max(2,int(np.hypot(*(b-a))/4))
        for s in np.linspace(0,1,n):
            e,nn=a+(b-a)*s; x=int(e-E0); y=int(N1-nn)
            if 0<=x<apmask.shape[1] and 0<=y<apmask.shape[0]: c+=apmask[y,x]; t+=1
    return c/max(t,1)
tw=[]
for p in pls:
    P=np.array(p['pts'],float)
    c=med_color(P)
    if np.abs(c-np.array([187,187,204])).sum()>9: continue
    L=float(np.hypot(*np.diff(P,axis=0).T).sum())
    if L<4: continue
    # extend endpoints that stop short of a runway
    for end in (0,-1):
        q=P[end]; nb=P[1] if end==0 else P[-2]
        d=dist_to_rwy(q)
        if d<60:
            v=q-nb; v/=np.linalg.norm(v)+1e-9
            # march until inside runway half-width
            for k in range(1,60):
                q2=q+v*k
                if dist_to_rwy(q2)<12: break
            if end==0: P=np.vstack([q2,P])
            else: P=np.vstack([P,q2])
    fa=frac_on_apron(P)
    tw.append(dict(k='lane' if fa>0.6 else 'twy', p=P.round(1).tolist()))
print('taxiways',len(tw),'lanes',sum(t['k']=='lane' for t in tw))
# ---------- terminal split into hall + piers ----------
tmask=np.zeros(im.shape[:2],np.uint8)
for p in poly['term']:
    cv2.fillPoly(tmask,[np.array([[e-E0,N1-n] for e,n in p['outer']],np.int32)],1)
core=cv2.morphologyEx(tmask,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(55,55)))
piers=((tmask>0)&(core==0)).astype(np.uint8)
piers=cv2.morphologyEx(piers,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(5,5)))
from extract_poly import polys
P_core=polys(core,eps=1.5,minarea=2000)
P_pier=polys(piers,eps=1.2,minarea=400)
print('terminal core',len(P_core),sum(p['area'] for p in P_core),'piers',len(P_pier),sum(p['area'] for p in P_pier))
def q(pts): return [[round(x,1),round(y,1)] for x,y in pts]
out={'tw':tw,
     'apron':[dict(o=q(p['outer']),h=[q(h) for h in p['holes']]) for p in poly['apron']],
     'hall':[dict(o=q(p['outer']),h=[q(h) for h in p['holes']]) for p in P_core],
     'pier':[dict(o=q(p['outer'])) for p in P_pier],
     'bld':[], 'water':[dict(o=q(p['outer']),h=[q(h) for h in p['holes']]) for p in poly['water'] if p['area']>=150],
     'golf':[dict(o=q(p['outer']),h=[q(h) for h in p['holes']]) for p in poly['golf']]}
rng=np.random.RandomState(11)
for kind in ('bld','milbld'):
    for p in poly[kind]:
        a=p['area']
        if kind=='milbld':
            h=22 if a>3500 else (12 if a>900 else 7+rng.rand()*3)
            k='h' if a>3500 else 'm'
        else:
            if a>6000: h=20+rng.rand()*6; k='w'
            elif a>1500: h=11+rng.rand()*8; k='b'
            elif a>300: h=8+rng.rand()*8; k='b'
            else: h=6+rng.rand()*4; k='s'
        out['bld'].append(dict(o=q(p['outer']),z=round(h,1),k=k))
print('buildings',len(out['bld']),'water',len(out['water']),'golf',len(out['golf']))
infra=json.load(open('infra_lines.json'))
out['tollway']=infra['motor'][0]
out['rail']=infra['rail'][0]
out['phahon']=infra['primary'][0]
out=dict(source='OpenStreetMap contributors (map renders vectorised by tools/); building heights are estimates',
         license='ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/)',**out)   # the two fields come first
json.dump(out,open('/home/claude/data/out/vtbd_af.json','w'),separators=(',',':'))
import os; print('json KB',os.path.getsize('/home/claude/data/out/vtbd_af.json')//1024)
