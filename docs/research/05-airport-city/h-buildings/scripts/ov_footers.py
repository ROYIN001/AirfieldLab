import sys, re, json, requests, concurrent.futures as cf
sys.path.insert(0, sys.argv[1]); from rangefile import RangeFile, sess
import pyarrow.parquet as pq
REL=sys.argv[2]; OUT=sys.argv[3]
BASE='https://overturemaps-us-west-2.s3.amazonaws.com/'
pref=f'release/{REL}/theme=buildings/type=building/'
t=sess().get(BASE+'?list-type=2&prefix='+pref).text
keys=re.findall(r'<Key>(.*?)</Key>',t); sizes=[int(s) for s in re.findall(r'<Size>(.*?)</Size>',t)]
def stats(ks):
    k,s=ks
    f=RangeFile(BASE+k, size=s, block=1<<20)
    # read footer tail generously
    pf=pq.ParquetFile(f)
    md=pf.metadata; sch=pf.schema_arrow
    names=[md.schema.column(i).path for i in range(md.num_columns)]
    idx={n:i for i,n in enumerate(names)}
    rgs=[]
    for r in range(md.num_row_groups):
        rg=md.row_group(r); st={}
        for c in ('bbox.xmin','bbox.xmax','bbox.ymin','bbox.ymax'):
            cs=rg.column(idx[c]).statistics
            st[c]=(cs.min,cs.max) if cs is not None and cs.has_min_max else None
        rgs.append(dict(r=r,n=rg.num_rows,xmin=st['bbox.xmin'][0],xmax=st['bbox.xmax'][1],ymin=st['bbox.ymin'][0],ymax=st['bbox.ymax'][1]))
    return dict(key=k,size=s,rows=md.num_rows,rgs=rgs,names=names if k==keys[0] else None)
res=[]
with cf.ThreadPoolExecutor(16) as ex:
    for i,r in enumerate(ex.map(stats, zip(keys,sizes))):
        res.append(r)
        if i%50==0: print(i, file=sys.stderr)
json.dump(res, open(OUT,'w'))
print(len(res), sum(r['rows'] for r in res))
