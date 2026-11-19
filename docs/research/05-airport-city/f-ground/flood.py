import math
# row of masts along x every S m at height H; area: x in [0, S*k], y in [0, D] in front (one side)
# luminaire model: per mast total flux PHI, emitted uniformly into a downward cone of half-angle 75 deg, aimed mast-ward (generic):
# I = PHI / Omega (cd) inside cone, Omega = 2*pi*(1-cos(75deg))
def run(H=30.0, S=105.0, D=70.0, PHI=400000.0, MF=0.8, cone=75.0, step=2.5, h=0.0):
    Om = 2*math.pi*(1-math.cos(math.radians(cone))); I = PHI*MF/Om
    masts=[(i*S,0.0) for i in range(-3,7)]
    Es=[];Ev=[]
    x=S; 
    xs=[S+ i*step for i in range(int(S/step)+1)]; ys=[i*step for i in range(int(D/step)+1)]
    for x in xs:
        for y in ys:
            eh=0; ev=0
            for mx,my in masts:
                dx=x-mx; dy=y-my; d=math.hypot(dx,dy); hh=H-h
                th=math.atan2(d,hh)
                if math.degrees(th)>cone: continue
                r2=d*d+hh*hh
                eh+=I*math.cos(th)/r2
                ev+=I*math.sin(th)/r2   # vertical plane facing the mast
            Es.append(eh); Ev.append(ev)
    avg=sum(Es)/len(Es); mn=min(Es)
    return avg, mn, avg/mn, sum(Ev)/len(Ev)
for PHI in (300000,400000):
    for D in (60,70):
        a,m,u,v=run(PHI=PHI,D=D); a2,m2,u2,v2=run(PHI=PHI,D=D,h=2.0)
        print(f"PHI={PHI} D={D}: Eh_avg={a:.1f} lx Eh_min={m:.1f} U={u:.2f}  Ev_avg(2m)={v2:.1f}")
# lumen method checks
print(4*60000*0.4*0.8/2250, 20*2250/(60000*0.4*0.8))
I=100000; th=math.radians(60); print(I*math.cos(th)**3/30**2, I*math.sin(th)*math.cos(th)**2/28**2)
