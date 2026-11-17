import numpy as np, networkx as nx, math
from graph import rdp
E0,N1=-2800,4000
def pix2m(path): return np.array([[E0+x+0.5, N1-y-0.5] for (y,x) in path])
def merge_deg2(H,centers):
    H=H.copy()
    changed=True
    while changed:
        changed=False
        for n in list(H.nodes()):
            if n in H and H.degree(n)==2:
                es=list(H.edges(n,keys=True,data=True))
                if len(es)!=2: continue
                (u1,v1,k1,d1),(u2,v2,k2,d2)=es
                if (u1==v1) or (u2==v2): continue
                a=v1 if u1==n else u1; b=v2 if u2==n else u2
                if a==n or b==n: continue
                p1=d1['path']; p2=d2['path']
                # orient: p1 from a..n, p2 from n..b
                def ends_at(p,node):
                    c=np.array(centers[node]); return np.hypot(*(np.array(p[-1])-c))<np.hypot(*(np.array(p[0])-c))
                if not ends_at(p1,n): p1=p1[::-1]
                if ends_at(p2,n): p2=p2[::-1]
                newp=list(p1)+list(p2[1:])
                H.remove_edge(u1,v1,k1); H.remove_edge(u2,v2,k2); H.remove_node(n)
                H.add_edge(a,b,path=newp,L=d1['L']+d2['L'])
                changed=True
    return H
def polylines(H,eps=0.8):
    out=[]
    for u,v,k,d in H.edges(keys=True,data=True):
        P=pix2m(d['path'])
        P=rdp(P,eps)
        out.append(dict(a=u,b=v,pts=P))
    return out
