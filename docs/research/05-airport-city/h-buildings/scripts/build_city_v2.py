# Prototype of tools/buildings_overture.py: real footprints + heights -> compact binary-in-JSON (city_v2.json)
import sys, json, base64, struct, numpy as np, pandas as pd, shapely
sys.path.insert(0, sys.argv[1]); from geo import ll_to_en, en_to_ll, dms
D=sys.argv[2]; O=sys.argv[3]
POLY_R=4000.0     # full polygons inside this radius, oriented boxes outside
R_MAX=10000.0
STOREY=3.0; BASE=1.0
ov=pd.read_parquet(f'{D}/ov_enriched.parquet')
geo=pd.read_parquet(f'{D}/ov_local.parquet',columns=['id','wkb_local'])
ov=ov.merge(geo,on='id')
ov=ov[ov.r<=R_MAX].reset_index(drop=True)
# exclude what the repo already models (airfield buildings from vtbd_af.json)
af=json.load(open('/home/user/AirfieldLab/data/vtbd_af.json'))
excl=[shapely.Polygon(b['o']) for k in ('bld','hall','pier') for b in af[k]]
excl=shapely.union_all([p.buffer(0) for p in excl if p.is_valid or True])
g=shapely.from_wkb(ov.wkb_local.values)
cent=shapely.centroid(g)
inrepo=shapely.contains(excl,cent)
print('excluded (already in repo vtbd_af):', int(inrepo.sum()))
ov=ov[~inrepo].reset_index(drop=True); g=g[~inrepo]
# fallback table: land-use class x area bin medians of the remote-sensing height (from this analysis)
fb=pd.read_csv(f'{O}/height_stats_areabin.csv')
def fallback(area):
    for _,r in fb.iterrows():
        if area>=r.area_min and (pd.isna(r.area_max) or area<r.area_max): return r.p50
    return 6.0
# shipping estimator (no GBA: CC BY-NC): OSM height > OSM floors*3+1 > 2.5D p90 (lean guard -> median) > area-bin fallback
p90=ov.t25_p90.values; med=ov.t25_med.values
h=p90.copy(); src=np.full(len(ov),'t25_p90',object)
lean=(med<0.4*p90)&(p90>20); h[lean]=med[lean]; src[lean]='t25_med (lean guard)'
bad=~np.isfinite(h)|(ov.npx.values<2); h[bad]=[fallback(a) for a in ov.area.values[bad]]; src[bad]='fallback area-bin'
f=ov.num_floors.notna().values; h[f]=ov.num_floors.values[f]*STOREY+BASE; src[f]='osm num_floors'
t=ov.height.notna().values; h[t]=ov.height.values[t]; src[t]='osm height'
h=np.clip(h,2.5,120.0)
code={'osm height':0,'osm num_floors':1,'t25_p90':2,'t25_med (lean guard)':3,'gba':4,'fallback area-bin':5}
sc=np.array([code[s] for s in src],np.uint8)
print(pd.Series(src).value_counts())
near=ov.r.values<=POLY_R
# --- oriented boxes (12 bytes): i16 e*2, i16 n*2, u16 w*10, u16 d*10, u16 h*10, u8 yaw(0..pi), u8 flags(src<<4)
obb=bytearray(); nb=0
for gi,hh,s in zip(g[~near],h[~near],sc[~near]):
    rr=shapely.minimum_rotated_rectangle(gi); c=np.asarray(rr.exterior.coords)[:4]
    v1=c[1]-c[0]; v2=c[2]-c[1]; w=np.hypot(*v1); d=np.hypot(*v2); yaw=np.arctan2(v1[1],v1[0])%np.pi
    ce=c.mean(0)
    obb+=struct.pack('<hhHHHBB',int(round(ce[0]*2)),int(round(ce[1]*2)),min(65535,int(round(w*10))),min(65535,int(round(d*10))),int(round(hh*10)),int(yaw/np.pi*255)&255,int(s)<<4); nb+=1
# --- polygons: u8 nverts, u16 h*10, u8 flags, then i16 e*2,n*2 per vertex (simplified 0.5 m)
poly=bytearray(); npoly=0; nv=0
for gi,hh,s in zip(g[near],h[near],sc[near]):
    gi=shapely.simplify(gi,0.5,preserve_topology=True)
    if gi.geom_type=='MultiPolygon': gi=max(gi.geoms,key=lambda q:q.area)
    c=np.asarray(gi.exterior.coords)[:-1]
    if len(c)<3: continue
    if len(c)>255: c=c[:255]
    poly+=struct.pack('<BHB',len(c),int(round(hh*10)),int(s)<<4)
    for x,y in c: poly+=struct.pack('<hh',int(round(x*2)),int(round(y*2)))
    npoly+=1; nv+=len(c)
# --- AIP AD 2.10 obstacles (always injected; AIRAC 29 OCT 2026 values)
obst=[]
for k,typ,la,lo,hgt in [('OBS1','mast',dms(13,53,7.9),dms(100,33,51.1),70),('OBS2','mast',dms(13,54,53.0),dms(100,37,9.8),61),
                       ('OBS3','building',dms(13,53,39.0),dms(100,33,41.6),78),('OBS4','building',dms(13,52,12.8),dms(100,34,3.1),87),('OBS5','building',dms(13,57,11.1),dms(100,37,15.0),50)]:
    e,n=ll_to_en(la,lo); obst.append({'id':k,'type':typ,'lat':round(la,7),'lon':round(lo,7),'e':round(float(e),1),'n':round(float(n),1),'h':hgt,'src':'AIP VTBD AD 2.10 AIRAC 29 OCT 2026'})
out={'v':2,'note':'Building footprints © OpenStreetMap contributors, Overture Maps Foundation, Microsoft, Google (Open Buildings, Open Buildings 2.5D Temporal); heights estimated; ODbL 1.0',
     'poly_r':POLY_R,'obb':base64.b64encode(bytes(obb)).decode(),'poly':base64.b64encode(bytes(poly)).decode(),'obst':obst}
s=json.dumps(out,separators=(',',':'))
open(f'{O}/city_v2_sample.json','w').write(s)
import gzip
print('obb',nb,len(obb),'poly',npoly,'verts',nv,len(poly),'json MB',round(len(s)/1e6,2),'gzip MB',round(len(gzip.compress(s.encode()))/1e6,2))
