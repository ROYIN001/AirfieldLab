import json, pandas as pd, numpy as np, sys
O=sys.argv[1]
rings=pd.read_csv(f'{O}/height_stats_rings.csv'); lu=pd.read_csv(f'{O}/height_stats_landuse.csv'); ab=pd.read_csv(f'{O}/height_stats_areabin.csv')
cnt=json.load(open(f'{O}/counts.json')); aip=json.load(open(f'{O}/aip_obstacle_matches.json')); t30=pd.read_csv(f'{O}/tallest30.csv')
fb=pd.read_csv(f'{O}/fallback_class_area.csv')
J={}
J['building_sources']=[
 {"id":"overture_buildings","release":"2026-10-21.0","heights_in_bbox_pct":0.053,"floors_in_bbox_pct":0.145,"licence":"ODbL-1.0 (theme)","attribution":"© OpenStreetMap contributors, Overture Maps Foundation; Microsoft; Google Open Buildings; Esri Community Maps","repo_use":"raw or derived may be committed under ODbL-1.0 (share-alike on derived database)","src":["H3","H4","H5"],"conf":"high"},
 {"id":"google_open_buildings_v3","licence":"CC-BY-4.0 or ODbL-1.0 (user's choice)","heights":False,"repo_use":"derived footprints may be committed; choose ODbL to match OSM-derived data","src":["H4","H7","H8"],"conf":"medium"},
 {"id":"google_open_buildings_2_5d_temporal_v1","years":"2016-2023","effective_res_m":4,"height_range_m":[0,100],"licence":"CC-BY-4.0 or ODbL-1.0 (user's choice); Copernicus Sentinel-2 notice","repo_use":"derived per-building heights may be committed; do not commit raw GeoTIFFs (size)","src":["H9","H10"],"conf":"high"},
 {"id":"microsoft_global_ml_buildings","licence":"CDLA-Permissive-2.0 (README) / ODbL-1.0 (as redistributed in Overture)","heights_in_area":False,"repo_use":"use via Overture (ODbL)","src":["H17","H4"],"conf":"medium"},
 {"id":"global_building_atlas_lod1","licence":"CC-BY-NC-4.0 (GBA.Polygon, GBA.LoD1, GBA.Height); ODbL-1.0 (GBA.ODbLPolygon only)","repo_use":"do not commit heights; validation only","rmse_asia_m":5.9,"src":["H12","H13","H15"],"conf":"high"},
 {"id":"ghsl_ghs_built_h_r2023a","grid_m":100,"licence":"not verified this round","repo_use":"not needed","src":["H18"],"conf":"low"},
 {"id":"aip_ad_2_10","licence":"© CAAT; facts and coordinates may be used with citation, charts not reproduced","src":["H1","H2"],"conf":"high"}]
def ringrow(ds):
    d=rings[rings.dataset==ds]; out={}
    for _,r in d.iterrows(): out[r.group]={"n":int(r.n),"p10":r.p10,"p25":r.p25,"p50":r.p50,"p75":r.p75,"p90":r.p90,"p95":r.p95,"p99":r.p99,"max":r['max'],"n_gt45":int(r.n_gt45)}
    return out
J['height_stats']={"radius_m":10000,"counts":{"overture":cnt['overture_2026-10-21.0'],"google_open_buildings_v3":cnt['google_open_buildings_v3'],"gba_lod1":cnt['gba_lod1']},
  "overture_sources_r10":cnt['overture_sources_r10'],"overture_tags_r10":cnt['overture_tags_r10'],
  "h_rs_by_ring_m":ringrow('overture+2.5D p90 (h_rs)'),"gba_by_ring_m":ringrow('gba_lod1 height'),
  "h_rs_by_landuse_m":{r['class']:{"class_id":int(r.class_id),"n":int(r.n_overture),"p50":r.h_rs_p50,"p90":r.h_rs_p90} for _,r in lu.iterrows()},
  "validation_vs_osm":{"vs_height_tag_n":230,"t25_p90_median_err_m":-0.25,"t25_p90_mae_m":4.62,"gba_median_err_m":-3.48,"gba_mae_m":4.95,"vs_floors_n":694,"t25_p90_vs_3f1_mae_m":4.00,"storey_height_osm_median_m":3.20,"storey_height_n":25},
  "src":["H3","H7","H10","H14","H21"],"est":True,"conf":"medium"}
J['tallest']=[{"rank":i+1,"lat":float(r.lat),"lon":float(r.lon),"e":float(r.e),"n":float(r.n),"h_m":float(r.h_rs),"h_ft":round(float(r.h_rs)/0.3048),"t25_med":float(r.t25_med),"gba":None if pd.isna(r.gba_med) else float(r.gba_med),"footprint_src":r.src,"name":None if pd.isna(r.name_pub) else r.name_pub,"est":True} for i,(_,r) in enumerate(t30.iterrows())]
J['aip_obstacle_matches']=[{"id":o['id'],"type":o['type'],"aip_hgt_m":o['aip_hgt_m'],"aip_hgt_ft":o['aip_hgt_ft'],"marking":o['marking'],
   "lat":o['lat_aip_2026_05_14'],"lon":o['lon_aip_2026_05_14'],"en":o['en_2026_05_14'],
   "lat_airac_2026_10_29":o['lat_aip_2026_10_29'],"lon_airac_2026_10_29":o['lon_aip_2026_10_29'],"en_airac_2026_10_29":o['en_2026_10_29'],
   "dataset_match":o['overture_nearest'],"gba_nearest_height_m":o['gba_nearest']['height'],"t25_raster_max_r25_m":o['t25_raster_max_r25'],
   "represented_in_data":None,"src":["H1","H2","H21"]} for o in aip]
rep={'OBS1':(False,'mast not in building data; small base building only'),'OBS2':(False,'mast not in building data'),'OBS3':(True,'t25_max 77.3 >= 76'),'OBS4':(True,'t25_p90 94.2 >= 85.1'),'OBS5':(False,'no building >= 48 m within 150 m in 2023 data')}
for o in J['aip_obstacle_matches']: o['represented_in_data']=rep[o['id']][0]; o['note']=rep[o['id']][1]
rules=[{"order":1,"if":"OSM height tag present","h":"height","conf":"medium"},
       {"order":2,"if":"OSM num_floors present","h":"3.0*num_floors+1.0","conf":"medium","est":True},
       {"order":3,"if":"2.5D pixels in footprint >= 2","h":"P90(building_height in footprint); if P50 < 0.4*P90 and P90 > 20 then P50","conf":"medium","est":True},
       {"order":4,"if":"otherwise","h":"area-bin x land-use median (table)","conf":"low","est":True},
       {"order":5,"if":"AIP AD 2.10 obstacle within 30 m","h":"max(h, AIP HGT)","conf":"high"}]
tab={}
for _,r in fb.iterrows():
    tab.setdefault(r.cg,[]).append({"area_bin":r.ab,"n":int(r.n),"p50":r.p50,"p90":r.p90})
J['height_fallback_rules']={"storey_m":3.0,"base_m":1.0,"clip_m":[2.5,120.0],"rules":rules,
   "area_bins_all":[{"area_min":int(r.area_min),"area_max":None if pd.isna(r.area_max) else int(r.area_max),"n":int(r.n),"p50":r.p50,"p90":r.p90} for _,r in ab.iterrows()],
   "class_area_p50":tab,"src":["H6","H10","H21"],"est":True}
json.dump(J,open(f'{O}/section_H_params.json','w'),ensure_ascii=False,indent=1)
print(len(json.dumps(J,ensure_ascii=False)))
