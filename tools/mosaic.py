import sys, json, math, numpy as np, cv2
sys.path.insert(0,'/home/claude/data/chart'); sys.path.insert(0,'/home/claude/data/osm')
from geo import latlon, enu, M, N, LAT0, LON0, _p
import merc
S=1527/1920.0
HDR=55.0   # css px header height
MCX, MCY = 960.0, HDR+(992-HDR)/2
def load_shots():
    meta=json.load(open('/home/claude/data/osm/shots_meta.json'))
    shots=[]
    for m in meta:
        f=m['file'] if m['file'].startswith('/') else '/home/claude/data/osm/'+m['file']
        im=cv2.imread(f)
        valid=np.ones(im.shape[:2],np.uint8)
        valid[:46,:]=0; valid[:88,:228]=0; valid[:338,1488:]=0; valid[752:,:78]=0; valid[770:,1170:]=0
        valid[:, :3]=0; valid[:, -3:]=0; valid[-3:,:]=0
        shots.append(dict(im=im,valid=valid,z=m['z'],lat=m['lat'],lon=m['lon'],file=f))
    return shots
def grid_latlon(e0,e1,n0,n1,res):
    es=np.arange(e0,e1,res)+res/2; ns=np.arange(n1,n0,-res)-res/2   # row 0 = north
    E,Nn=np.meshgrid(es,ns)
    lat=LAT0+np.degrees(Nn/M); lon=LON0+np.degrees(E/(N*math.cos(_p)))
    return lat,lon
def shot_px(sh,lat,lon):
    z=sh['z']; k=256*2**z
    X=(lon+180)/360*k
    phi=np.radians(lat); Y=(1-np.log(np.tan(phi)+1/np.cos(phi))/math.pi)/2*k
    Xc=(sh['lon']+180)/360*k; pc=math.radians(sh['lat']); Yc=(1-math.log(math.tan(pc)+1/math.cos(pc))/math.pi)/2*k
    px=((X-Xc)+MCX)*S; py=((Y-Yc)+MCY)*S
    return px.astype(np.float32),py.astype(np.float32)
def build(e0,e1,n0,n1,res,zs=(17,16,15),shots=None,interp=cv2.INTER_LINEAR):
    shots=shots or load_shots()
    lat,lon=grid_latlon(e0,e1,n0,n1,res)
    H,W=lat.shape
    out=np.zeros((H,W,3),np.uint8); got=np.zeros((H,W),bool); zsrc=np.zeros((H,W),np.uint8)
    for z in zs:
        for sh in [s for s in shots if s['z']==z]:
            px,py=shot_px(sh,lat,lon)
            inb=(px>=0)&(py>=0)&(px<sh['im'].shape[1]-1)&(py<sh['im'].shape[0]-1)&(~got)
            if not inb.any(): continue
            v=cv2.remap(sh['valid'],px,py,cv2.INTER_NEAREST,borderValue=0)>0
            sel=inb&v
            if not sel.any(): continue
            col=cv2.remap(sh['im'],px,py,interp,borderMode=cv2.BORDER_CONSTANT)
            out[sel]=col[sel]; got|=sel; zsrc[sel]=z
    return out,got,zsrc
