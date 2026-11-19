import numpy as np
from PIL import Image
from scipy import ndimage
R='/home/user/AirfieldLab/data/'
def filled(a):
    lu=((a>=1)&(a<=12))|((a>=20)&(a<=28))
    idx=ndimage.distance_transform_edt(~lu, return_distances=False, return_indices=True)
    out=a[idx[0],idx[1]]
    out[a==0]=0
    return out
class Land:
    def __init__(self):
        self.ai=np.array(Image.open(R+'land_in.png')); self.ao=np.array(Image.open(R+'land_out.png'))
        self.fi=filled(self.ai); self.fo=filled(self.ao)
    def sample(self, e, n, fill=True):
        e=np.asarray(e,float); n=np.asarray(n,float)
        A=self.fi if fill else self.ai; B=self.fo if fill else self.ao
        xi=np.floor((e+3600)/2.5).astype(int); yi=np.floor((5000-n)/2.5).astype(int)
        ini=(xi>=0)&(xi<3200)&(yi>=0)&(yi<4000)
        xo=np.floor((e+10000)/8).astype(int); yo=np.floor((12000-n)/8).astype(int)
        ino=(xo>=0)&(xo<2500)&(yo>=0)&(yo<3000)
        c=np.zeros(e.shape,np.uint8)
        c[ino]=B[yo[ino],xo[ino]]
        ci=np.zeros(e.shape,np.uint8); ci[ini]=A[yi[ini],xi[ini]]
        use=ini&(ci>0); c[use]=ci[use]
        return c
