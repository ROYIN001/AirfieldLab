import numpy as np, cv2, networkx as nx
def skel_graph(sk):
    ys,xs=np.nonzero(sk); S=set(zip(ys.tolist(),xs.tolist()))
    nb=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    deg={}
    for (y,x) in S:
        deg[(y,x)]=sum(((y+dy,x+dx) in S) for dy,dx in nb)
    nodes={p for p,d in deg.items() if d!=2}
    # cluster adjacent junction pixels
    visited=set(); paths=[]
    def neighbors(p):
        y,x=p; return [(y+dy,x+dx) for dy,dx in nb if (y+dy,x+dx) in S]
    used_edges=set()
    for nd in nodes:
        for q in neighbors(nd):
            e=(nd,q)
            if e in used_edges: continue
            path=[nd,q]; used_edges.add((nd,q)); used_edges.add((q,nd))
            prev,cur=nd,q
            while cur not in nodes:
                nxt=[r for r in neighbors(cur) if r!=prev and (cur,r) not in used_edges]
                if not nxt: break
                # prefer 4-neighbours
                nxt.sort(key=lambda r: abs(r[0]-cur[0])+abs(r[1]-cur[1]))
                r=nxt[0]; used_edges.add((cur,r)); used_edges.add((r,cur))
                path.append(r); prev,cur=cur,r
            paths.append(path)
    # loops without nodes
    return paths, nodes, deg
def rdp(pts,eps):
    pts=np.asarray(pts,float)
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1]; ab=b-a; L=np.hypot(*ab)
    if L<1e-9: d=np.hypot(*(pts-a).T)
    else:
        q=pts-a; d=np.abs(ab[0]*q[:,1]-ab[1]*q[:,0])/L
    i=int(np.argmax(d))
    if d[i]>eps:
        l=rdp(pts[:i+1],eps); r=rdp(pts[i:],eps); return np.vstack([l[:-1],r])
    return np.array([a,b])
