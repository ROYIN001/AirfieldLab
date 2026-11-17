import math
W,H=1920,992   # CSS viewport
def X(lon,z): return (lon+180)/360*256*2**z
def Y(lat,z):
    p=math.radians(lat); return (1-math.log(math.tan(p)+1/math.cos(p))/math.pi)/2*256*2**z
def lon_of(x,z): return x/(256*2**z)*360-180
def lat_of(y,z):
    n=math.pi*(1-2*y/(256*2**z)); return math.degrees(math.atan(math.sinh(n)))
def bbox_for(lat,lon,z,frac=0.9):
    xc,yc=X(lon,z),Y(lat,z)
    hw,hh=W*frac/2,H*frac/2
    return (lon_of(xc-hw,z), lat_of(yc+hh,z), lon_of(xc+hw,z), lat_of(yc-hh,z))
def url(lat,lon,z):
    b=bbox_for(lat,lon,z)
    # center of bbox in mercator equals requested center only if we use mercator-symmetric bbox (we do)
    return "https://www.openstreetmap.org/export/embed.html?bbox=%.6f,%.6f,%.6f,%.6f&layer=mapnik"%b
