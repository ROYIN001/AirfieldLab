# Per-building statistics of Open Buildings 2.5D Temporal (2023) heights and GBA heights, on Overture footprints
import sys, numpy as np, pyarrow.parquet as pq, pyarrow as pa, shapely
from pyproj import Transformer
from rasterio.features import rasterize
from rasterio.transform import from_origin
D=sys.argv[1]
z=np.load(f'{D}/t25d_2023_2m.npz'); hgt=z['hgt']; pres=z['pres']; x0=float(z['x0']); y1=float(z['y1']); res=float(z['res'])
H,W=hgt.shape; T=from_origin(x0,y1,res,res)
tr=Transformer.from_crs(4326,32647,always_xy=True)
def utm(g):
    return shapely.transform(g, lambda c: np.column_stack(tr.transform(c[:,0],c[:,1])))
# Overture labels
t=pq.read_table(f'{D}/ov_buildings_bbox.parquet',columns=['id','geometry'])
g=utm(shapely.from_wkb(t.column('geometry').to_numpy(zero_copy_only=False)))
n=len(g)
lab=rasterize(((gg,i+1) for i,gg in enumerate(g)), out_shape=(H,W), transform=T, fill=0, dtype='int32')
print('rasterized overture', file=sys.stderr)
# GBA heights raster
tg=pq.read_table(f'{D}/gba_bbox.parquet',columns=['height','geometry'])
gg=utm(shapely.from_wkb(tg.column('geometry').to_numpy(zero_copy_only=False))); hh=tg.column('height').to_numpy()
gba=rasterize(((a,float(b)) for a,b in zip(gg,hh) if b==b), out_shape=(H,W), transform=T, fill=-1, dtype='float32')
print('rasterized gba', file=sys.stderr)
m=lab>0
L=lab[m]; Hh=hgt[m]; P=pres[m]; G=gba[m]
o=np.argsort(L,kind='stable'); L=L[o]; Hh=Hh[o]; P=P[o]; G=G[o]
ids,start,cnt=np.unique(L,return_index=True,return_counts=True)
med=np.full(n,np.nan,np.float32); p90=np.full(n,np.nan,np.float32); mx=np.full(n,np.nan,np.float32); pm=np.full(n,np.nan,np.float32); gm=np.full(n,np.nan,np.float32); npx=np.zeros(n,np.int32)
for i,s,c in zip(ids,start,cnt):
    h=Hh[s:s+c]; v=h>-99
    if v.any():
        hv=h[v]; med[i-1]=np.median(hv); p90[i-1]=np.percentile(hv,90); mx[i-1]=hv.max(); pm[i-1]=np.median(P[s:s+c][v])
    gv=G[s:s+c]; gv=gv[gv>=0]
    if gv.size: gm[i-1]=np.median(gv)
    npx[i-1]=c
# buildings with no pixel: sample at centroid
c=shapely.centroid(g); cx=shapely.get_x(c); cy=shapely.get_y(c)
col=np.floor((cx-x0)/res).astype(int); row=np.floor((y1-cy)/res).astype(int)
nop=(npx==0)&(col>=0)&(col<W)&(row>=0)&(row<H)
hv=hgt[row[nop],col[nop]]; med[nop]=np.where(hv>-99,hv,np.nan); p90[nop]=med[nop]; mx[nop]=med[nop]; pm[nop]=pres[row[nop],col[nop]]
gv=gba[row[nop],col[nop]]; gm[nop]=np.where(gv>=0,gv,np.nan)
out=pa.table({'id':t.column('id'),'npx':npx,'t25_med':med,'t25_p90':p90,'t25_max':mx,'t25_pres':pm,'gba_med':gm})
pq.write_table(out,f'{D}/ov_t25d_gba.parquet'); print('done', n, int((npx>0).sum()), int(np.isfinite(med).sum()))
