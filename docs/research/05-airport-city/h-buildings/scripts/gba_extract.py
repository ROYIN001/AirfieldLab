import sys
sys.path.insert(0, sys.argv[1]); from rangefile import RangeFile
import pyarrow.parquet as pq, pyarrow as pa, pyarrow.compute as pc
U='https://s3.us-west-2.amazonaws.com/us-west-2.opendata.source.coop/tge-labs/globalbuildingatlas-lod1/e100_n15_e105_n10.parquet'
OUT=sys.argv[2]
W,E,S,N=100.494,100.717,13.806,14.023
f=RangeFile(U, block=1<<22); pf=pq.ParquetFile(f); md=pf.metadata
print(pf.schema_arrow); print(md.num_rows, md.num_row_groups, file=sys.stderr)
names=[md.schema.column(i).path for i in range(md.num_columns)]; idx={n:i for i,n in enumerate(names)}
print(names)
sel=[]
for r in range(md.num_row_groups):
    rg=md.row_group(r)
    def mm(c):
        s=rg.column(idx[c]).statistics; return (s.min,s.max) if s is not None and s.has_min_max else (None,None)
    xmin=mm('bbox.xmin'); xmax=mm('bbox.xmax'); ymin=mm('bbox.ymin'); ymax=mm('bbox.ymax')
    if xmin[0] is None: sel.append(r); continue
    if xmax[1]>=W and xmin[0]<=E and ymax[1]>=S and ymin[0]<=N: sel.append(r)
print('row groups', md.num_row_groups, 'selected', len(sel), file=sys.stderr)
tabs=[]
for r in sel:
    t=pf.read_row_group(r)
    b=t.column('bbox')
    m=pc.and_(pc.and_(pc.greater_equal(pc.struct_field(b,'xmax'),W),pc.less_equal(pc.struct_field(b,'xmin'),E)),pc.and_(pc.greater_equal(pc.struct_field(b,'ymax'),S),pc.less_equal(pc.struct_field(b,'ymin'),N)))
    tabs.append(t.filter(m)); print(r, t.num_rows, tabs[-1].num_rows, f.nbytes>>20, 'MB', file=sys.stderr)
T=pa.concat_tables(tabs); pq.write_table(T, OUT, compression='zstd'); print('rows', T.num_rows)
