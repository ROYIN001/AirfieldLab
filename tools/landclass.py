import numpy as np, cv2, sys
sys.path.insert(0,'/home/claude/data/proc')
from mosaic import load_shots, build
# id, name, list of RGB refs, tol (L1)
CL=[
 (1,'land',[(242,239,233),(241,238,232)],7),
 (2,'resid',[(224,223,223),(223,223,223)],5),
 (3,'comm',[(242,218,217),(255,214,209),(241,217,217),(244,223,217)],7),
 (4,'indus',[(235,219,232)],7),
 (5,'mil',[(234,218,213),(244,226,220),(235,214,208),(235,217,211),(244,220,214),(232,220,214),(235,220,214)],8),
 (6,'aero',[(233,231,226),(232,229,226)],5),
 (7,'grass',[(205,235,176),(220,244,190),(223,247,193)],10),
 (8,'park',[(200,250,204),(170,224,203)],10),
 (9,'golf',[(222,246,192)],8),
 (10,'forest',[(173,209,158),(172,208,157)],10),
 (11,'farm',[(238,240,213),(200,215,171)],8),
 (12,'water',[(170,211,223),(177,200,210),(169,210,222)],12),
 (13,'road',[(255,255,255),(254,254,254)],4),
 (14,'road2',[(247,250,191)],9),
 (15,'road1',[(252,214,164)],10),
 (16,'trunk',[(249,178,156)],10),
 (17,'motor',[(232,146,162)],12),
 (18,'rail',[(112,112,112),(153,153,153),(140,140,140)],14),
 (19,'bld',[(217,208,201),(216,207,200)],6),
 (20,'apron',[(218,218,224)],5),
 (21,'twy',[(187,187,204)],12),
 (22,'parking',[(238,238,238)],3),
 (23,'school',[(255,255,229)],5),
 (24,'worship',[(208,208,208)],5),
 (25,'constr',[(199,199,180)],8),
 (26,'cemetery',[(170,203,175)],8),
 (27,'term',[(196,182,171)],10),
 (28,'milbld',[(220,197,191)],8),
]
NAMES={c[0]:c[1] for c in CL}
def classify(im):
    rgb=im[:,:,::-1].astype(np.int16)
    H,W=rgb.shape[:2]
    cls=np.zeros((H,W),np.uint8); best=np.full((H,W),999,np.int16)
    for cid,name,refs,tol in CL:
        for r in refs:
            d=np.abs(rgb-np.array(r,np.int16)).sum(2)
            m=(d<=tol)&(d<best)
            cls[m]=cid; best[m]=d[m]
    return cls
def fill_unknown(cls, valid):
    unk=((cls==0)&valid).astype(np.uint8)
    # nearest known pixel label
    src=(cls>0).astype(np.uint8)
    d,lab=cv2.distanceTransformWithLabels(1-src,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    ys,xs=np.nonzero(src)
    # labels index known pixels in raster order; build lookup
    lut=np.zeros(lab.max()+1,np.uint8)
    lut[lab[ys,xs]]=cls[ys,xs]
    out=cls.copy()
    m=unk>0
    out[m]=lut[lab[m]]
    return out
def mode3(cls):
    # 3x3 majority to clean speckle, keep thin roads by protecting road classes
    H,W=cls.shape
    best=cls.copy(); bc=np.zeros((H,W),np.uint8)
    pad=np.pad(cls,1,mode='edge')
    stack=np.stack([pad[dy:dy+H,dx:dx+W] for dy in range(3) for dx in range(3)],0)
    for c in np.unique(cls):
        cnt=(stack==c).sum(0).astype(np.uint8)
        m=cnt>bc; best[m]=c; bc[m]=cnt[m]
    keep=np.isin(cls,[13,14,15,16,17,18,12])
    out=np.where(keep&(bc<6),cls,best)
    return out.astype(np.uint8)
