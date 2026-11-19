import sys, json, concurrent.futures as cf
sys.path.insert(0, sys.argv[1]); from rangefile import RangeFile
import pyarrow.parquet as pq, pyarrow as pa, pyarrow.compute as pc
FOOT=sys.argv[2]; OUT=sys.argv[3]; TYPE=sys.argv[4] if len(sys.argv)>4 else 'building'
W,E,S,N=100.494,100.717,13.806,14.023
BASE='https://overturemaps-us-west-2.s3.amazonaws.com/'
R=json.load(open(FOOT))
jobs=[]
for f in R:
    rs=[g['r'] for g in f['rgs'] if g['xmin'] is not None and g['xmax']>=W and g['xmin']<=E and g['ymax']>=S and g['ymin']<=N]
    if rs: jobs.append((f['key'],f['size'],rs))
COLS=['id','names','sources','height','min_height','num_floors','level','subtype','class','roof_shape','roof_height','has_parts','is_underground','geometry','bbox']
def run(j):
    k,s,rs=j; f=RangeFile(BASE+k,size=s,block=1<<22); pf=pq.ParquetFile(f)
    cols=[c for c in COLS if c in pf.schema_arrow.names]
    out=[]
    for r in rs:
        t=pf.read_row_group(r, columns=cols)
        b=t.column('bbox')
        xmin=pc.struct_field(b,'xmin'); xmax=pc.struct_field(b,'xmax'); ymin=pc.struct_field(b,'ymin'); ymax=pc.struct_field(b,'ymax')
        m=pc.and_(pc.and_(pc.greater_equal(xmax,W),pc.less_equal(xmin,E)),pc.and_(pc.greater_equal(ymax,S),pc.less_equal(ymin,N)))
        out.append(t.filter(m)); print(k[-60:-40],r,t.num_rows,out[-1].num_rows,f.nbytes>>20,'MB',file=sys.stderr)
    return out
tabs=[]
with cf.ThreadPoolExecutor(4) as ex:
    for o in ex.map(run, jobs): tabs+=o
T=pa.concat_tables(tabs)
pq.write_table(T, OUT, compression='zstd')
print('rows', T.num_rows)
