# Mosaic Open Buildings 2.5D Temporal (2023) height + presence over the study bbox at 2 m (UTM 47N)
import json, sys, numpy as np, rasterio
from rasterio.windows import from_bounds
from rasterio.enums import Resampling
MAN=sys.argv[1]; OUT=sys.argv[2]; RES=float(sys.argv[3]) if len(sys.argv)>3 else 2.0
x0,x1,y0,y1=661300.0,685700.0,1526700.0,1551000.0
W=int(round((x1-x0)/RES)); H=int(round((y1-y0)/RES))
hgt=np.full((H,W),-99,np.float32); pres=np.full((H,W),-99,np.float32)
d=json.load(open(MAN)); pre='https://storage.googleapis.com/open-buildings-temporal-data/v1/geotiffs/3'
for ts in d['tilesets']:
    for s in ts['sources']:
        a=s['affineTransform']; tx0=a['translateX']; ty1=a['translateY']; tx1=tx0+12500; ty0=ty1-12500
        if not (tx1>x0 and tx0<x1 and ty1>y0 and ty0<y1): continue
        u='/vsicurl/'+pre+s['uris'][0]
        bx0=max(x0,tx0); bx1=min(x1,tx1); by0=max(y0,ty0); by1=min(y1,ty1)
        with rasterio.open(u) as r:
            win=from_bounds(bx0,by0,bx1,by1,r.transform)
            ow=int(round((bx1-bx0)/RES)); oh=int(round((by1-by0)/RES))
            arr=r.read([2,3],window=win,out_shape=(2,oh,ow),resampling=Resampling.nearest)
        c0=int(round((bx0-x0)/RES)); r0=int(round((y1-by1)/RES))
        sub_h=hgt[r0:r0+oh,c0:c0+ow]; sub_p=pres[r0:r0+oh,c0:c0+ow]
        m=arr[1]>sub_p
        sub_h[m]=arr[0][m]; sub_p[m]=arr[1][m]
        print(s['uris'][0], ow, oh, float((arr[1]>-99).mean()), file=sys.stderr)
np.savez_compressed(OUT, hgt=hgt, pres=pres, x0=x0, y1=y1, res=RES)
print('done', H, W)
