import json, sys
O=sys.argv[1]
p=json.load(open(f'{O}/section_H_params.json'))
ac=json.load(open(f'{O}/approach_clearance.json'))
bs=[
 {"id":"overture_buildings","release":"2026-10-21.0","n_r10km":429211,"pct_height":0.053,"pct_num_floors":0.145,"licence":"ODbL-1.0 (whole buildings theme)","attribution":"© OpenStreetMap contributors, Overture Maps Foundation","repo_use":"raw or derived may be committed; derived database must stay ODbL-1.0","src":["H3","H4","H5","H6"],"conf":"high"},
 {"id":"openstreetmap","n_r10km":28427,"pct_height":0.80,"pct_levels":2.19,"licence":"ODbL-1.0","attribution":"© OpenStreetMap contributors","repo_use":"derived data under ODbL with attribution","src":["H3","H22","H25"],"conf":"high"},
 {"id":"google_open_buildings_v3","n_r10km":607205,"min_confidence":0.65,"heights":False,"licence":"CC-BY-4.0 or ODbL-1.0 (user's choice)","repo_use":"choose ODbL; use through Overture","src":["H7","H8","H23"],"conf":"high"},
 {"id":"google_open_buildings_2_5d_temporal_v1","years":[2016,2023],"year_used":2023,"pixel_m":0.5,"effective_res_m":4,"height_range_m":[0,100],"stated_mae_m":1.5,"local_mae_vs_osm_m":4.62,"licence":"CC-BY-4.0 or ODbL-1.0 (user's choice)","repo_use":"commit derived per-building heights (choose ODbL); do not commit GeoTIFFs","src":["H9","H10","H11","H16","H21"],"conf":"medium"},
 {"id":"microsoft_global_ml_buildings","n_r10km_via_overture":89857,"heights_in_area":False,"licence":"CDLA-Permissive-2.0 (README); ODbL as listed by Overture","repo_use":"use through Overture (ODbL)","src":["H17","H4","H24"],"conf":"medium"},
 {"id":"global_building_atlas","n_r10km":551072,"rmse_global_m":5.5,"rmse_asia_m":5.9,"licence":"CC-BY-NC-4.0 (GBA.Polygon, GBA.LoD1, GBA.Height); ODbL-1.0 (GBA.ODbLPolygon)","repo_use":"do not commit; local validation only","src":["H12","H13","H14","H15"],"conf":"high"},
 {"id":"ghsl_ghs_built_h_r2023a","epoch":2018,"grid_m":100,"value":"average net building height per cell","licence":"EC reuse notice: reuse authorised with acknowledgement","repo_use":"allowed with credit but not needed (grid, not per building)","src":["H18"],"conf":"medium"},
 {"id":"3d_globfp","epoch":2020,"rmse_range_m":[1.9,14.6],"licence":"not verified","repo_use":"not recommended","src":["H19"],"conf":"low"},
 {"id":"bma_bdctl_polygon","content":"building-control ordinance zones (not footprints, no heights)","licence":"not specified","repo_use":"not usable","src":["H26"],"conf":"medium"},
 {"id":"aip_ad_2_10","licence":"© CAAT; facts and coordinates with citation; charts not reproduced","src":["H1","H2"],"conf":"high"}
]
hs=p['height_stats']
height_stats={"radius_m":10000,"counts":hs['counts'],"overture_sources_r10":hs['overture_sources_r10'],
 "h_rs_by_ring_m":hs['h_rs_by_ring_m'],"gba_by_ring_m":hs['gba_by_ring_m'],
 "repo_city_json":{"n":94612,"p50":6.75,"p90":12.75,"max":43.25,"n_gt40":15},
 "h_rs_by_landuse_m":{k:{"id":v['class_id'],"n":v['n'],"p50":v['p50'],"p90":v['p90']} for k,v in hs['h_rs_by_landuse_m'].items()},
 "validation_vs_osm":hs['validation_vs_osm'],"src":["H3","H7","H10","H14","H20","H21"],"est":True,"conf":"medium"}
tall=[{"rank":t['rank'],"lat":t['lat'],"lon":t['lon'],"en":[t['e'],t['n']],"h_m":t['h_m'],"h_ft":t['h_ft'],"gba_m":t['gba'],"fp":{"Google Open Buildings":"google","OpenStreetMap":"osm","Microsoft ML Buildings":"ms"}[t['footprint_src']],"name":t['name']} for t in p['tallest']]
aip=[]
for o in p['aip_obstacle_matches']:
    m=o['dataset_match']
    aip.append({"id":o['id'],"type":o['type'],"hgt_m":o['aip_hgt_m'] if o['id']!='OBS4' else 87.0,"hgt_m_airac_2026_05_14":o['aip_hgt_m'],"hgt_ft":o['aip_hgt_ft'],"marking":o['marking'],
      "airac_2026_10_29":{"lat":o['lat_airac_2026_10_29'],"lon":o['lon_airac_2026_10_29'],"en":o['en_airac_2026_10_29']},
      "airac_2026_05_14":{"lat":o['lat'],"lon":o['lon'],"en":o['en']},
      "match":{"dist_m":m['dist_m'],"footprint":m['src'],"area_m2":m['area_m2'],"t25_p50":m['t25_med'],"t25_p90":m['t25_p90'],"t25_max":m['t25_max'],"gba":m['gba_med'],"t25_max_r25":o['t25_raster_max_r25_m']},
      "in_data":o['represented_in_data'],"action":"inject from AIP (h = max(data, HGT))","src":["H1","H2","H21"],"conf":"high"})
fb=p['height_fallback_rules']
city={"file":"data/city_v2.json","prototype":"work/H/out/city_v2_sample.json","licence":"ODbL-1.0","n_total":427884,"n_obb":353302,"n_poly":74582,"n_poly_vertices":331452,
 "poly_radius_m":4000,"json_mb":7.82,"gzip_mb":4.78,
 "obb_record":"12 B LE: i16 2e, i16 2n, u16 10w, u16 10d, u16 10h, u8 yaw*255/pi, u8 src<<4",
 "poly_record":"u8 k, u16 10h, u8 src<<4, then k x (i16 2e, i16 2n)",
 "src_codes":{"0":"osm height","1":"osm num_floors","2":"t25d p90","3":"t25d p50 (lean guard)","4":"gba (never shipped)","5":"area-bin fallback"},
 "src_code_counts":{"0":220,"1":582,"2":426459,"3":104,"5":519},
 "rings":{"0-2km":{"n":10960,"p50":5.0,"p90":8.5,"max":59.5},"2-5km":{"n":104607,"p50":5.1,"p90":7.8,"max":72.7},"5-10km":{"n":312312,"p50":5.2,"p90":7.9,"max":97.5}},
 "n_gt45":192,"n_gt60":83,"h_range_m":[2.5,97.5],"src":["H21"],"est":True,"conf":"medium"}
apc={"method":"corridor |t|<=500 m, 0-8 km before threshold, all city_v2 points (box centres, polygon vertices, AIP obstacles); h_gp = RDH + d*tan(3 deg)","per_runway":ac,"src":["H1","H21"],"est":True}
out={"meta":{"section":"H","radius_m":10000,"bbox_ll":{"lat":[13.806,14.023],"lon":[100.494,100.717]},"arp":{"lat":13.9143722,"lon":100.6056917,"en":[0.0,0.0]},"overture_release":"2026-10-21.0","t25d_year":2023,"aip_airac":["2026-05-14","2026-10-29"],"src":["H1","H2","H3","H10","H20"]},
 "building_sources":bs,"height_stats":height_stats,"tallest":tall,"aip_obstacle_matches":aip,
 "height_fallback_rules":{"storey_m":fb['storey_m'],"base_m":fb['base_m'],"clip_m":fb['clip_m'],"rules":fb['rules'],
   "area_bins":[[b['area_min'],b['area_max'],b['p50'],b['p90']] for b in fb['area_bins_all']],
   "area_bins_cols":["area_min_m2","area_max_m2","p50_m","p90_m"],
   "class_area_p50_m":{k:[r['p50'] for r in v] for k,v in fb['class_area_p50'].items()},
   "class_area_bin_edges_m2":[0,50,100,200,500,2000],"src":["H6","H10","H21"],"est":True,"conf":"low"},
 "city_v2":city,"approach_clearance":apc,
 "exclusions":{"note":"drop data buildings whose centroid lies in vtbd_af bld/hall/pier, or within 40 m of TWR-S (-893,-355)/(-857,-373) and TWR-N (-254,929)","twr_s_t25_peak":{"en":[-857,-373],"h_m":56.9},"src":["H20","H21"],"est":True}}
s=json.dumps(out,ensure_ascii=False,separators=(',',':'))
json.loads(s)
# pretty but compact: one top-level key per block, arrays of objects one per line
lines=['{']
keys=list(out)
for i,k in enumerate(keys):
    v=out[k]; end=',' if i<len(keys)-1 else ''
    if isinstance(v,list):
        lines.append(f' "{k}":[')
        for j,x in enumerate(v):
            lines.append('  '+json.dumps(x,ensure_ascii=False,separators=(',',':'))+(',' if j<len(v)-1 else ''))
        lines.append(' ]'+end)
    elif isinstance(v,dict):
        lines.append(f' "{k}":{{')
        ks=list(v)
        for j,kk in enumerate(ks):
            lines.append(f'  "{kk}":'+json.dumps(v[kk],ensure_ascii=False,separators=(',',':'))+(',' if j<len(ks)-1 else ''))
        lines.append(' }'+end)
txt='\n'.join(lines)+'\n}'
json.loads(txt)
open(f'{O}/section_H_params_final.json','w').write(txt)
print(len(txt))
