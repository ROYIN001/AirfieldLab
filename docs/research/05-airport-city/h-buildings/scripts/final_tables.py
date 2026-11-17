import sys, json, numpy as np, pandas as pd, shapely
sys.path.insert(0, sys.argv[1]); from geo import ll_to_en, en_to_ll, dms
D=sys.argv[2]; O=sys.argv[3]
ov=pd.read_parquet(f'{D}/ov_enriched.parquet'); o10=ov[ov.r<=10000]
# ---- fallback table: class group x area bin, median of h_rs
grp={0:'unknown',1:'unknown',2:'residential',3:'commercial',4:'industrial',23:'school',24:'temple'}
o10=o10.assign(cg=[grp.get(int(c),'other') for c in o10.lu])
bins=[0,50,100,200,500,2000,1e9]; o10=o10.assign(ab=pd.cut(o10.area,bins,right=False))
t=o10.groupby(['cg','ab'],observed=True).h_rs.agg(['size','median',lambda s: s.quantile(0.9)]).round(1)
t.columns=['n','p50','p90']; t.to_csv(f'{O}/fallback_class_area.csv'); print(t.to_string())
# ---- AIP obstacle matches
geo=pd.read_parquet(f'{D}/ov_local.parquet',columns=['id','wkb_local']); g=shapely.from_wkb(geo.wkb_local.values)
idx={k:i for i,k in enumerate(geo.id.values)}
gba=pd.read_parquet(f'{D}/gba_local.parquet',columns=['src','height','e','n','area','wkb_local']); gg=shapely.from_wkb(gba.wkb_local.values)
z=np.load(f'{D}/t25d_2023_2m.npz'); H=z['hgt']; x0=float(z['x0']); y1=float(z['y1']); res=float(z['res'])
from pyproj import Transformer
tr=Transformer.from_crs(4326,32647,always_xy=True)
OB=[('OBS1','radio mast',(13,53,7.86),(100,33,51.09),(13,53,7.9),(100,33,51.1),70.0,'Marked, Lighted'),
    ('OBS2','radio mast',(13,54,52.97),(100,37,9.84),(13,54,53.0),(100,37,9.8),61.0,'Marked, Lighted'),
    ('OBS3','building',(13,53,39.003),(100,33,41.633),(13,53,39.0),(100,33,41.6),78.0,'Marked, Lighted'),
    ('OBS4','building',(13,52,12.77),(100,34,3.06),(13,52,12.8),(100,34,3.1),87.10,'Lighted'),
    ('OBS5','building',(13,57,11.09),(100,37,15.04),(13,57,11.1),(100,37,15.0),50.0,'Lighted')]
ovi=ov.set_index('id')
res_list=[]
for k,typ,la1,lo1,la2,lo2,hgt,mk in OB:
    la=dms(*la1); lo=dms(*lo1); e,n=ll_to_en(la,lo); e=float(e); n=float(n)
    la_b=dms(*la2); lo_b=dms(*lo2); e2,n2=ll_to_en(la_b,lo_b)
    p=shapely.Point(e,n); d=shapely.distance(g,p); i=int(np.argmin(d)); rid=geo.id.values[i]; r=ovi.loc[rid]
    d2=shapely.distance(gg,p); j=int(np.argmin(d2))
    x,y=tr.transform(lo,la); c=int((x-x0)/res); rr=int((y1-y)/res)
    def mx(rad):
        kk=int(rad/res); sub=H[rr-kk:rr+kk+1,c-kk:c+kk+1]; yy,xx=np.mgrid[-kk:kk+1,-kk:kk+1]; return round(float(np.where(xx*xx+yy*yy<=kk*kk,sub,-99).max()),1)
    row={'id':k,'type':typ,'aip_hgt_m':hgt,'aip_hgt_ft':round(hgt/0.3048),'marking':mk,
         'lat_aip_2026_05_14':round(la,7),'lon_aip_2026_05_14':round(lo,7),'en_2026_05_14':[round(e,1),round(n,1)],
         'lat_aip_2026_10_29':round(la_b,7),'lon_aip_2026_10_29':round(lo_b,7),'en_2026_10_29':[round(float(e2),1),round(float(n2),1)],
         'dist_from_arp_m':round(float(np.hypot(e,n))),
         'overture_nearest':{'dist_m':round(float(d[i]),1),'src':r.src,'area_m2':round(float(r.area),1),'t25_med':round(float(r.t25_med),1),'t25_p90':round(float(r.t25_p90),1),'t25_max':round(float(r.t25_max),1),'gba_med':None if not np.isfinite(r.gba_med) else round(float(r.gba_med),1),'h_best':round(float(r.h_best),1)},
         'gba_nearest':{'dist_m':round(float(d2[j]),1),'src':gba.src.values[j],'height':round(float(gba.height.values[j]),1)},
         't25_raster_max_r25':mx(25),'t25_raster_max_r50':mx(50),'t25_raster_max_r150':mx(150)}
    res_list.append(row); print(json.dumps(row,ensure_ascii=False))
json.dump(res_list,open(f'{O}/aip_obstacle_matches.json','w'),indent=1,ensure_ascii=False)
# ---- tallest 30 (exclude military land-use for publication), robust filter
MIL_LU=(5,28)
s=ov[(ov.r<=10000)&(ov.area>=300)&(~ov.lu.isin(MIL_LU))].copy()
s['robust']=s.t25_med>=0.5*s.t25_p90
s=s[s.robust].sort_values('h_rs',ascending=False).head(30)
la,lo=en_to_ll(s.e.values,s.n.values); s['lat']=np.round(la,6); s['lon']=np.round(lo,6)
MILW=('ทหาร','กองบัญชาการ','กองทัพ','Air Force','Army','Navy','military','กองบิน')
s['name_pub']=[None if (not isinstance(x,str)) or any(m.lower() in x.lower() for m in MILW) else x for x in s.name]
cols=['lat','lon','e','n','r','area','h_rs','t25_med','t25_p90','t25_max','gba_med','num_floors','height','src','name_pub']
s=s[cols].round({'e':1,'n':1,'r':0,'area':0,'h_rs':1,'t25_med':1,'t25_p90':1,'t25_max':1,'gba_med':1})
s.to_csv(f'{O}/tallest30.csv',index=False); print(s.to_string())
print('military-landuse excluded count among top by h_rs (r<=10km, area>=300):', int(((ov.r<=10000)&(ov.area>=300)&(ov.lu.isin(MIL_LU))&(ov.h_rs>=s.h_rs.min())).sum()))
