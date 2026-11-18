# Compare repo building data (vtbd_af.json bld/hall/pier/cbld and city.json generated boxes) with 2.5D / GBA heights
import sys, json, base64, struct, numpy as np, shapely
sys.path.insert(0, sys.argv[1]); from geo import en_to_ll
from pyproj import Transformer
from rasterio.features import rasterize
from rasterio.transform import from_origin
D=sys.argv[2]; O=sys.argv[3]
z=np.load(f'{D}/t25d_2023_2m.npz'); hgt=z['hgt']; x0=float(z['x0']); y1=float(z['y1']); res=float(z['res']); H,W=hgt.shape
tr=Transformer.from_crs(4326,32647,always_xy=True)
def en2utm(c):
    la,lo=en_to_ll(c[:,0],c[:,1]); x,y=tr.transform(lo,la); return np.column_stack([x,y])
af=json.load(open('/home/user/AirfieldLab/data/vtbd_af.json'))
res_out={}
def stats_polys(items, key):
    geoms=[shapely.transform(shapely.Polygon(it['o']), en2utm) for it in items]
    lab=rasterize(((g,i+1) for i,g in enumerate(geoms) if g.is_valid and g.area>0), out_shape=(H,W), transform=from_origin(x0,y1,res,res), fill=0, dtype='int32')
    m=lab>0; L=lab[m]; V=hgt[m]; o=np.argsort(L,kind='stable'); L=L[o]; V=V[o]
    ids,st,cn=np.unique(L,return_index=True,return_counts=True)
    rows=[]
    for i,s,c in zip(ids,st,cn):
        v=V[s:s+c]; v=v[v>-99]
        if not v.size: continue
        it=items[i-1]
        rows.append(dict(i=int(i-1),k=it.get('k',key),z=it.get('z'),area=round(geoms[i-1].area,1),med=float(np.median(v)),p90=float(np.percentile(v,90)),mx=float(v.max())))
    return rows
for key in ('hall','pier','bld','cbld'):
    rows=stats_polys(af[key], key)
    res_out[key]=rows
    zz=np.array([r['z'] if r['z'] is not None else np.nan for r in rows],float); p90=np.array([r['p90'] for r in rows]); med=np.array([r['med'] for r in rows])
    print(key, len(af[key]), 'with data', len(rows), 'repo z median', np.nanmedian(zz) if np.isfinite(zz).any() else None, '2.5D p90 median', np.median(p90), 'med median', np.median(med), 'p90 max', p90.max())
    if key=='bld':
        for k in 'sbmhw':
            sel=[r for r in rows if r['k']==k]
            if sel: print('  bld kind',k,len(sel),'repo z med %.1f'%np.median([r['z'] for r in sel]),'2.5D p90 med %.1f'%np.median([r['p90'] for r in sel]), 'p90 p95 %.1f'%np.percentile([r['p90'] for r in sel],95), 'MAE(z vs p90) %.1f'%np.mean([abs(r['z']-r['p90']) for r in sel]))
    if key in ('hall','pier'):
        for r in rows: print('  ',key,r['i'],r['area'],'med %.1f p90 %.1f max %.1f'%(r['med'],r['p90'],r['mx']))
# towers: max 2.5D within radius
for name,(e,n) in {'TWR-S':(-893,-355),'TWR-N':(-254,929)}.items():
    c=en2utm(np.array([[e,n]],float))[0]; col=int((c[0]-x0)/res); row=int((y1-c[1])/res)
    for rad in (6,12,25):
        k=int(rad/res); sub=hgt[row-k:row+k+1,col-k:col+k+1]; yy,xx=np.mgrid[-k:k+1,-k:k+1]; v=np.where(xx*xx+yy*yy<=k*k,sub,-99)
        i=np.unravel_index(np.argmax(v),v.shape); print(name,rad,'max %.1f'%v.max(),'at de %.0f dn %.0f'%((i[1]-k)*res,-(i[0]-k)*res))
    res_out[name]={'r12_max':float(np.where(True,hgt[row-6:row+7,col-6:col+7],0).max())}
# generated city boxes
c=json.load(open('/home/user/AirfieldLab/data/city.json')); buf=base64.b64decode(c['bld']); n=len(buf)//9
arr=np.frombuffer(buf[:n*9],dtype=np.dtype([('e','<i2'),('n','<i2'),('w','u1'),('d','u1'),('h','u1'),('yaw','u1'),('k','u1')]))
e=arr['e']/2; nn=arr['n']/2; h=arr['h']/4; kind=arr['k']>>4; r=np.hypot(e,nn)
gen={'count':int(n),'by_kind':{int(k):int((kind==k).sum()) for k in np.unique(kind)},'h_pct':{p:float(np.percentile(h,p)) for p in (10,25,50,75,90,95,99,100)},
     'e_range':[float(e.min()),float(e.max())],'n_range':[float(nn.min()),float(nn.max())],
     'rings':{f'{a}-{b}':{'n':int(((r>=a)&(r<b)).sum()),'p50':float(np.median(h[(r>=a)&(r<b)])) if ((r>=a)&(r<b)).any() else None,'p90':float(np.percentile(h[(r>=a)&(r<b)],90)) if ((r>=a)&(r<b)).any() else None} for a,b in [(0,2000),(2000,5000),(5000,10000)]},
     'n_over_30':int((h>30).sum()),'n_over_40':int((h>40).sum())}
cz=np.array([b['z'] for b in af['cbld']]); bz=np.array([b['z'] for b in af['bld']])
res_out['generated']=gen; res_out['cbld_z']={p:float(np.percentile(cz,p)) for p in (10,50,90,100)}; res_out['bld_z']={p:float(np.percentile(bz,p)) for p in (10,50,90,100)}
print(json.dumps(gen)); print('cbld z',res_out['cbld_z'],'bld z',res_out['bld_z'])
json.dump(res_out,open(f'{O}/repo_compare.json','w'),indent=1)
