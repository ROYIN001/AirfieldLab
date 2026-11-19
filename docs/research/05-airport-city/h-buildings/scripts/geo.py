import math, numpy as np
DEG=math.pi/180; lat0=13+54/60+51.74/3600; lon0=100+36/60+20.49/3600
a=6378137; f=1/298.257223563; e2=f*(2-f); s2=math.sin(lat0*DEG)**2
M=a*(1-e2)/(1-e2*s2)**1.5; N=a/math.sqrt(1-e2*s2); cosp=math.cos(lat0*DEG)
def ll_to_en(lat, lon):
    return ((np.asarray(lon)-lon0)*DEG*N*cosp, (np.asarray(lat)-lat0)*DEG*M)
def en_to_ll(e, n):
    return (lat0+np.asarray(n)/(DEG*M), lon0+np.asarray(e)/(DEG*N*cosp))
def dms(d,m,s): return d+m/60+s/3600
