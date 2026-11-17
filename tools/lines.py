import numpy as np, cv2, networkx as nx, math, sys
sys.path.insert(0,'/home/claude/data/proc')
from skimage.morphology import skeletonize
from graph import rdp
from graph2 import build_graph, trace
def mask_lines(mask, res, e0, n1, minlen=400, eps=3.0, close=5):
    m=mask.astype(np.uint8)
    if close: m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(close,close)))
    sk=skeletonize(m>0)
    G=build_graph(sk)
    out=[]
    for comp in nx.connected_components(G):
        sub=G.subgraph(comp)
        if len(comp)*res<minlen: continue
        # longest shortest path between endpoints (diameter approx via 2 BFS)
        start=next(iter(comp))
        d=nx.single_source_dijkstra_path_length(sub,start,weight='w'); a=max(d,key=d.get)
        d2,paths=nx.single_source_dijkstra(sub,a,weight='w'); b=max(d2,key=d2.get)
        path=paths[b]
        L=d2[b]*res
        if L<minlen: continue
        P=np.array([[e0+(x+0.5)*res, n1-(y+0.5)*res] for (y,x) in path])
        P=rdp(P,eps)
        out.append((L,P))
    out.sort(key=lambda t:-t[0])
    return out
