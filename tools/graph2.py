import numpy as np, networkx as nx, math
from graph import rdp
NB=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def build_graph(sk):
    ys,xs=np.nonzero(sk); S=set(zip(ys.tolist(),xs.tolist()))
    G=nx.Graph()
    for (y,x) in S:
        for dy,dx in NB:
            q=(y+dy,x+dx)
            if q in S: G.add_edge((y,x),q,w=math.hypot(dy,dx))
    # remove diagonal edges that duplicate a 4-path (staircase corners) to thin the graph
    rm=[]
    for (a,b) in G.edges():
        if abs(a[0]-b[0])+abs(a[1]-b[1])==2:
            c1=(a[0],b[1]); c2=(b[0],a[1])
            if (G.has_node(c1) and G.has_edge(a,c1) and G.has_edge(c1,b)) or (G.has_node(c2) and G.has_edge(a,c2) and G.has_edge(c2,b)):
                rm.append((a,b))
    G.remove_edges_from(rm)
    return G
def trace(G):
    deg=dict(G.degree())
    junc=[p for p,d in deg.items() if d>=3]
    J=G.subgraph(junc)
    clusters=list(nx.connected_components(J))
    cid={}
    for i,c in enumerate(clusters):
        for p in c: cid[p]=('J',i)
    centers={('J',i):tuple(np.mean(list(c),0)) for i,c in enumerate(clusters)}
    for p,d in deg.items():
        if d==1: cid[p]=('E',p); centers[('E',p)]=p
    edges=[]; seen=set()
    for p in cid:
        for q in G.neighbors(p):
            if q in cid and cid[q]==cid[p]: continue
            key=(p,q)
            if key in seen: continue
            path=[p]; prev=p; cur=q
            seen.add((p,q)); seen.add((q,p))
            while cur not in cid:
                path.append(cur)
                nx_=[r for r in G.neighbors(cur) if r!=prev]
                if not nx_: break
                prev,cur=cur,nx_[0]
                seen.add((prev,cur)); seen.add((cur,prev))
            if cur in cid:
                path.append(cur)
                a=cid[p]; b=cid[cur]
                if a==b and len(path)<4: continue
                edges.append((a,b,path))
    # isolated loops (no nodes) ignored
    return edges, centers
def to_polylines(edges,centers,prune=18):
    # graph of clusters
    H=nx.MultiGraph()
    for a,b,path in edges:
        L=sum(math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]) for i in range(len(path)-1))
        H.add_edge(a,b,path=path,L=L)
    # iterative spur pruning
    changed=True
    while changed:
        changed=False
        for n in list(H.nodes()):
            if H.degree(n)==1 and n[0]=='E':
                (u,v,k,d)=list(H.edges(n,keys=True,data=True))[0]
                other=v if u==n else u
                if d['L']<prune and H.degree(other)>=3:
                    H.remove_edge(u,v,k); H.remove_node(n); changed=True
    return H
