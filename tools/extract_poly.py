import numpy as np, cv2, json, math
E0,N1=-2800,4000
def fill_holes(mask,maxarea):
    m=mask.copy().astype(np.uint8)
    inv=(1-m).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(inv,4)
    small=np.zeros(n,bool); small[1:]=st[1:,cv2.CC_STAT_AREA]<maxarea
    # don't fill the component touching the border
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if x==0 or y==0 or x+w>=m.shape[1] or y+h>=m.shape[0]: small[i]=False
    m[small[lab]]=1
    return m
def polys(mask,eps=1.2,minarea=60,res=1.0,e0=E0,n1=N1):
    cs,hier=cv2.findContours(mask.astype(np.uint8),cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    out=[]
    if hier is None: return out
    hier=hier[0]
    for i,c in enumerate(cs):
        if hier[i][3]!=-1: continue
        a=cv2.contourArea(c)*res*res
        if a<minarea: continue
        ap=cv2.approxPolyDP(c,eps/res,True)[:,0,:]
        outer=[[round(e0+(x+0.5)*res,1),round(n1-(y+0.5)*res,1)] for x,y in ap]
        holes=[]
        j=hier[i][2]
        while j!=-1:
            hc=cs[j]
            if cv2.contourArea(hc)*res*res>=minarea:
                hp=cv2.approxPolyDP(hc,eps/res,True)[:,0,:]
                holes.append([[round(e0+(x+0.5)*res,1),round(n1-(y+0.5)*res,1)] for x,y in hp])
            j=hier[j][0]
        out.append(dict(outer=outer,holes=holes,area=round(a)))
    return out
