import numpy as np, math
def dms(d,m,s): return d+m/60+s/3600
a=6378137.0; f=1/298.257223563; e2=f*(2-f)
LAT0=dms(13,54,51.74); LON0=dms(100,36,20.49)
_p=math.radians(LAT0)
M=a*(1-e2)/(1-e2*math.sin(_p)**2)**1.5; N=a/math.sqrt(1-e2*math.sin(_p)**2)
def enu(lat,lon): return np.array([math.radians(lon-LON0)*N*math.cos(_p), math.radians(lat-LAT0)*M])
def latlon(e,n): return (LAT0+math.degrees(n/M), LON0+math.degrees(e/(N*math.cos(_p))))
THR={'03L':enu(dms(13,53,49.24),dms(100,35,45.38)),'21R':enu(dms(13,55,34.87),dms(100,36,44.62)),
     '03R':enu(dms(13,53,58.45),dms(100,36,5.50)),'21L':enu(dms(13,55,28.33),dms(100,36,55.97))}
NAV={'LOC21R':enu(dms(13,53,40.6),dms(100,35,40.6)),'LOC21L':enu(dms(13,53,51.8),dms(100,36,1.8)),
     'LOC03L':enu(dms(13,55,43.8),dms(100,36,49.7)),'DVOR':enu(dms(13,53,36.7),dms(100,35,46.3)),
     'GP03L':enu(dms(13,53,56.4),dms(100,35,54.0)),'GP21R':enu(dms(13,55,23.4),dms(100,36,42.8)),
     'GP21L':enu(dms(13,55,21.2),dms(100,36,47.4))}
