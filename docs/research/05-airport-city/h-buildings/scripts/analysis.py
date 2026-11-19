import sys, json, numpy as np, pandas as pd
sys.path.insert(0, sys.argv[1]); from geo import en_to_ll, ll_to_en, dms
from landuse import Land
D=sys.argv[2]; O=sys.argv[3]
ov=pd.read_parquet(f'{D}/ov_local.parquet',columns=['id','src','name','height','num_floors','class','subtype','e','n','area'])
ov=ov.merge(pd.read_parquet(f'{D}/ov_t25d_gba.parquet'),on='id')
gba=pd.read_parquet(f'{D}/gba_local.parquet',columns=['src','height','var','e','n','area'])
gob=pd.read_parquet(f'{D}/gob_local.parquet')
L=Land()
for df in (ov,gba,gob):
    df['r']=np.hypot(df.e,df.n); df['lu']=L.sample(df.e.values,df.n.values,True)
RINGS=[(0,2000),(2000,5000),(5000,10000)]
def ringname(a,b): return f'{a//1000}-{b//1000}km'
# ---- estimator
def best_remote(d):
    p90=d.t25_p90.values; med=d.t25_med.values; g=d.gba_med.values
    h=p90.copy(); src=np.full(len(d),'t25_p90',object)
    lean=(med<0.4*p90)&(p90>20)
    alt=np.fmax(med,g); h[lean]=alt[lean]; src[lean]='t25_med|gba (lean guard)'
    bad=~np.isfinite(h)|(d.npx.values<2)
    h[bad]=g[bad]; src[bad]='gba'
    h=np.clip(h,2.5,None)
    return h,src
ov['h_rs'],ov['h_rs_src']=best_remote(ov)
STOREY=3.0; BASE=1.0
h=ov.h_rs.values.copy(); hs=ov.h_rs_src.values.copy()
f=ov.num_floors.notna().values; h[f]=ov.num_floors.values[f]*STOREY+BASE; hs[f]='osm num_floors'
t=ov.height.notna().values; h[t]=ov.height.values[t]; hs[t]='osm height'
ov['h_best']=h; ov['h_best_src']=hs
# ---- counts
cnt={}
for name,df in (('overture_2026-10-21.0',ov),('gba_lod1',gba),('google_open_buildings_v3',gob)):
    c={'bbox_total':int(len(df)),'r_le_10km':int((df.r<=10000).sum())}
    for a,b in RINGS: c[ringname(a,b)]=int(((df.r>=a)&(df.r<b)).sum())
    c['repo_land_in_extent']=int(((df.e>=-3600)&(df.e<4400)&(df.n>=-5000)&(df.n<5000)).sum())
    cnt[name]=c
o10=ov[ov.r<=10000]
cnt['overture_sources_r10']={k:int(v) for k,v in o10.src.value_counts().items()}
osm=o10[o10.src=='OpenStreetMap']
cnt['overture_tags_r10']={'with_height':int(o10.height.notna().sum()),'with_num_floors':int(o10.num_floors.notna().sum()),'with_name':int(o10.name.notna().sum()),
  'pct_height':round(100*o10.height.notna().mean(),3),'pct_num_floors':round(100*o10.num_floors.notna().mean(),3),
  'osm_count':int(len(osm)),'osm_pct_height':round(100*osm.height.notna().mean(),2),'osm_pct_num_floors':round(100*osm.num_floors.notna().mean(),2)}
g10=gba[gba.r<=10000]
cnt['gba_sources_r10']={k:int(v) for k,v in g10.src.value_counts().items()}
cnt['gob_conf_r10']={'min':float(gob[gob.r<=10000].conf.min()),'p50':float(gob[gob.r<=10000].conf.median()),'pct_ge_0.75':round(100*float((gob[gob.r<=10000].conf>=0.75).mean()),1)}
cnt['overture_area_r10']={p:round(float(np.percentile(o10.area,p)),1) for p in (10,50,90,99)}
json.dump(cnt,open(f'{O}/counts.json','w'),indent=1,ensure_ascii=False)
print(json.dumps(cnt,indent=0,ensure_ascii=False))
# ---- height stats per ring
P=[10,25,50,75,90,95,99]
rows=[]
def addrow(ds,grp,vals):
    v=vals[np.isfinite(vals)]
    if len(v)==0: return
    r={'dataset':ds,'group':grp,'n':int(len(v))}; r.update({f'p{p}':round(float(np.percentile(v,p)),1) for p in P}); r['max']=round(float(v.max()),1)
    r['n_gt30']=int((v>30).sum()); r['n_gt45']=int((v>45).sum()); rows.append(r)
for a,b in RINGS+[(0,10000)]:
    sel=(ov.r>=a)&(ov.r<b); addrow('overture+2.5D p90 (h_rs)',ringname(a,b),ov.h_rs[sel].values)
    addrow('overture h_best',ringname(a,b),ov.h_best[sel].values)
    addrow('gba_lod1 height',ringname(a,b),gba.height[(gba.r>=a)&(gba.r<b)].values)
hs=pd.DataFrame(rows); hs.to_csv(f'{O}/height_stats_rings.csv',index=False); print(hs.to_string())
# ---- per land-use class (r<=10 km)
NAMES={0:'nodata',1:'land',2:'residential',3:'commercial',4:'industrial',5:'military',6:'aerodrome',7:'grass',8:'park',9:'golf',10:'forest',11:'farm',12:'water',20:'apron',21:'taxiway',22:'parking',23:'school',24:'temple',25:'construction',26:'cemetery',27:'terminal',28:'military building'}
rows=[]
for c,nm in NAMES.items():
    s=ov[(ov.r<=10000)&(ov.lu==c)]
    if len(s)<30: continue
    v=s.h_rs.values; v=v[np.isfinite(v)]
    g=gba[(gba.r<=10000)&(gba.lu==c)].height.values
    rows.append({'class_id':c,'class':nm,'n_overture':len(s),'h_rs_p25':round(float(np.percentile(v,25)),1),'h_rs_p50':round(float(np.median(v)),1),'h_rs_p75':round(float(np.percentile(v,75)),1),'h_rs_p90':round(float(np.percentile(v,90)),1),'h_rs_p99':round(float(np.percentile(v,99)),1),
                 'area_p50':round(float(s.area.median()),1),'n_gba':len(g),'gba_p50':round(float(np.median(g)),1) if len(g) else None,'gba_p90':round(float(np.percentile(g,90)),1) if len(g) else None})
lu=pd.DataFrame(rows); lu.to_csv(f'{O}/height_stats_landuse.csv',index=False); print(lu.to_string())
# ---- area-binned fallback (residential/commercial etc.)
rows=[]
for a0,a1 in [(0,50),(50,100),(100,200),(200,500),(500,2000),(2000,1e9)]:
    s=ov[(ov.r<=10000)&(ov.area>=a0)&(ov.area<a1)]
    v=s.h_rs.values; v=v[np.isfinite(v)]
    rows.append({'area_min':a0,'area_max':a1 if a1<1e9 else None,'n':len(s),'p25':round(float(np.percentile(v,25)),1),'p50':round(float(np.median(v)),1),'p75':round(float(np.percentile(v,75)),1),'p90':round(float(np.percentile(v,90)),1)})
ab=pd.DataFrame(rows); ab.to_csv(f'{O}/height_stats_areabin.csv',index=False); print(ab.to_string())
# ---- validation against OSM tags
val=[]
v=ov[(ov.r<=12000)&ov.height.notna()]
for c in ['t25_med','t25_p90','t25_max','gba_med','h_rs']:
    e=(v[c]-v.height).dropna(); val.append({'reference':'osm height tag','estimate':c,'n':len(e),'median_err':round(float(e.median()),2),'MAE':round(float(e.abs().mean()),2),'RMSE':round(float(np.sqrt((e**2).mean())),2)})
v=ov[(ov.r<=12000)&ov.num_floors.notna()&(ov.num_floors>0)]
for c in ['t25_med','t25_p90','gba_med','h_rs']:
    e=(v[c]-(v.num_floors*STOREY+BASE)).dropna(); val.append({'reference':f'osm num_floors*{STOREY}+{BASE}','estimate':c,'n':len(e),'median_err':round(float(e.median()),2),'MAE':round(float(e.abs().mean()),2),'RMSE':round(float(np.sqrt((e**2).mean())),2)})
both=ov[(ov.r<=12000)&ov.num_floors.notna()&ov.height.notna()&(ov.num_floors>0)]
sh=(both.height/both.num_floors)
val.append({'reference':'osm height/num_floors','estimate':'storey height','n':len(sh),'median_err':round(float(sh.median()),2),'MAE':None,'RMSE':None})
vv=pd.DataFrame(val); vv.to_csv(f'{O}/osm_validation.csv',index=False); print(vv.to_string())
# floors-bin table
v=v.copy(); v['fb']=pd.cut(v.num_floors,[0,1,2,3,5,8,12,20,60])
fb=v.groupby('fb',observed=True).agg(n=('num_floors','size'),floors_med=('num_floors','median'),t25_p90_med=('t25_p90','median'),h_rs_med=('h_rs','median'),gba_med=('gba_med','median')).round(1)
fb['h_rs_per_floor']=(fb.h_rs_med/fb.floors_med).round(2); fb.to_csv(f'{O}/osm_floors_bins.csv'); print(fb.to_string())
# ---- tallest 30 (r<=10 km, area>=300, remote-sensing estimate, lean-guarded)
MIL=('ทหาร','กองบัญชาการ','กองทัพ','Air Force','Army','Navy','military','ทอ.','ทบ.','ทร.','กองบิน','โรงเรียนนายเรืออากาศ','พิพิธภัณฑ์กองทัพ','ภูมิพล')
def safe(nm, lu):
    if nm is None or (isinstance(nm,float)): return None
    if any(m.lower() in nm.lower() for m in MIL) or lu in (5,28): return '(ไม่แสดงชื่อ: พื้นที่ทางทหาร/ราชการ)'
    return nm
s=ov[(ov.r<=10000)&(ov.area>=300)].sort_values('h_rs',ascending=False).head(30).copy()
la,lo=en_to_ll(s.e.values,s.n.values); s['lat']=np.round(la,6); s['lon']=np.round(lo,6)
s['name_safe']=[safe(a,b) for a,b in zip(s.name,s.lu)]
s['lu_name']=[NAMES.get(int(c),str(c)) for c in s.lu]
cols=['lat','lon','e','n','r','area','h_rs','t25_med','t25_p90','t25_max','gba_med','num_floors','height','src','name_safe','lu_name']
s=s[cols].round({'e':1,'n':1,'r':0,'area':0,'h_rs':1,'t25_med':1,'t25_p90':1,'t25_max':1,'gba_med':1})
s.to_csv(f'{O}/tallest30.csv',index=False); print(s.to_string())
g=gba[(gba.r<=10000)].sort_values('height',ascending=False).head(10).copy()
la,lo=en_to_ll(g.e.values,g.n.values); g['lat']=la; g['lon']=lo; print(g.round(4).to_string())
ov.drop(columns=[]).to_parquet(f'{D}/ov_enriched.parquet')
