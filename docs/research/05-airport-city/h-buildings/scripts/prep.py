# Build per-building base tables (centroid, local e/n, area) for Overture, GBA, Google Open Buildings v3
import sys, numpy as np, pyarrow.parquet as pq, pyarrow as pa, shapely, csv
sys.path.insert(0, sys.argv[1]); from geo import ll_to_en
D=sys.argv[2]
def local(geoms):
    def tf(c):
        e,n=ll_to_en(c[:,1],c[:,0]); return np.column_stack([e,n])
    return shapely.transform(geoms, tf)
# Overture
t=pq.read_table(f'{D}/ov_buildings_bbox.parquet')
g=shapely.from_wkb(t.column('geometry').to_numpy(zero_copy_only=False))
gl=local(g); c=shapely.centroid(gl); ce=shapely.get_x(c); cn=shapely.get_y(c)
src=[s[0]['dataset'] if s else None for s in t.column('sources').to_pylist()]
names=[ (n or {}).get('primary') if isinstance(n,dict) else None for n in t.column('names').to_pylist()]
out=pa.table({'id':t.column('id'),'src':src,'name':names,'height':t.column('height'),'num_floors':t.column('num_floors'),'min_height':t.column('min_height'),
  'subtype':t.column('subtype'),'class':t.column('class'),'e':ce,'n':cn,'area':shapely.area(gl),'wkb_local':shapely.to_wkb(gl)})
pq.write_table(out,f'{D}/ov_local.parquet'); print('overture',out.num_rows)
# GBA
t=pq.read_table(f'{D}/gba_bbox.parquet')
g=shapely.from_wkb(t.column('geometry').to_numpy(zero_copy_only=False)); gl=local(g); c=shapely.centroid(gl)
out=pa.table({'id':t.column('id'),'src':t.column('source'),'height':t.column('height'),'var':t.column('var'),'region':t.column('region'),
  'e':shapely.get_x(c),'n':shapely.get_y(c),'area':shapely.area(gl),'wkb_local':shapely.to_wkb(gl)})
pq.write_table(out,f'{D}/gba_local.parquet'); print('gba',out.num_rows)
# GOB v3 (no geometry kept, centroid+area+confidence)
lat=[];lon=[];ar=[];cf=[]
csv.field_size_limit(10**8)
with open(f'{D}/gob_v3_bbox.csv') as fh:
    r=csv.reader(fh); next(r)
    for row in r: lat.append(float(row[0])); lon.append(float(row[1])); ar.append(float(row[2])); cf.append(float(row[3]))
e,n=ll_to_en(np.array(lat),np.array(lon))
out=pa.table({'lat':lat,'lon':lon,'e':e,'n':n,'area':ar,'conf':cf})
pq.write_table(out,f'{D}/gob_local.parquet'); print('gob',out.num_rows)
