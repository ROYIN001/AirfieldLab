// Independent strip-theory roll ratio (reviewer). Follower centred on the left core of the leader's pair.
let LIN=process.argv[2]==="lin";const KT=0.514444, DEG=Math.PI/180;
const b=10.2,S=16.3,lam=0.6,cr=2*S/(b*(1+lam)),CLa=4.8,V=95*KT, ClMax=0.16*20*DEG;
const chord=y=>cr*(1-(1-lam)*Math.abs(y)/(b/2));
function ratio(G,b0,rc,clipDeg=null,off=0){let s=0;const n=4000,dy=b/n;for(let i=0;i<n;i++){const y=-b/2+(i+0.5)*dy, yl=y+off;
 let wup=-G/(2*Math.PI)*yl/(yl*yl+rc*rc) - G/(2*Math.PI)*(b0-yl)/((b0-yl)**2+rc*rc);
 let da=LIN?wup/V:Math.atan2(wup,V); if(clipDeg!=null) da=Math.max(-clipDeg*DEG,Math.min(clipDeg*DEG,da));
 s+= -chord(y)*CLa*da*y*dy;} return (s/(S*b))/ClMax;}
const A={G:283.4,b0:Math.PI*35.8/4,rc:0.035*35.8}, B={G:281.4,b0:Math.PI*35.79/4,rc:0.035*35.79};
console.log('A320 ratio',ratio(A.G,A.b0,A.rc).toFixed(3),'738W',ratio(B.G,B.b0,B.rc).toFixed(3),'738W clip12',ratio(B.G,B.b0,B.rc,12).toFixed(3),'A320 clip12',ratio(A.G,A.b0,A.rc,12).toFixed(3));
console.log('G for ratio1 A320',(A.G/Math.abs(ratio(A.G,A.b0,A.rc))).toFixed(1),'738',(B.G/Math.abs(ratio(B.G,B.b0,B.rc))).toFixed(1));
console.log('rc 5% A320',ratio(A.G,A.b0,0.05*35.8).toFixed(3),'offset +-5m',ratio(A.G,A.b0,A.rc,null,5).toFixed(2),ratio(A.G,A.b0,A.rc,null,-5).toFixed(2));
console.log('peak BH vtheta A320',(A.G/(4*Math.PI*A.rc)).toFixed(1));
for(const g of [0.72,0.38,0.12,0.23,0.06,0.01,0.03]) process.stdout.write((g*Math.abs(ratio(A.G,A.b0,A.rc))).toFixed(2)+' '); console.log();
