// krev_score.mjs — reviewer's independent re-implementation of the scoring rules as written in หัวข้อ 3.10 §3.10.10 (comment block)
const prof = { b737:{td:[-8,5],p:[3.5,7],nz:2.2}, a320:{td:[-8,5],p:[4.5,8],nz:2.6}, a321:{td:[-8,5],p:[4.5,7.5],nz:2.6}, a330:{td:[-8,5],p:[3.5,7.5],nz:2.6}, atr:{td:[-12,-2],p:[2,5.5],nz:2.0} };
function sinkPts(f){ if(f<=240) return 40; if(f<=360) return 40-10*(f-240)/120; if(f<=600) return 30-20*(f-360)/240; return 0; }
function posPts(d){ if(d<0||d>900) return 0; if(d>=300&&d<=600) return 25; if(d>=220&&d<=750) return 18; return 10; }
function S(c, P){
  let t = sinkPts(c.sink) + posPts(c.d) + (Math.abs(c.cl)<=2?15:Math.abs(c.cl)<=5?12:Math.abs(c.cl)<=10?6:0);
  const dv=c.ias-c.vref; t += (dv>=P.td[0]&&dv<=P.td[1])?10:(dv>=P.td[0]-5&&dv<=P.td[1]+7)?6:2;
  t += (c.pitch>=P.p[0]&&c.pitch<=P.p[1]?3:1) + (Math.abs(c.bank)<=2?3:Math.abs(c.bank)<=5?1.5:0) + (Math.abs(c.crab)<=2?2:Math.abs(c.crab)<=5?1:0) + (Math.abs(c.drift)<=0.8?2:Math.abs(c.drift)<=1.6?1:0);
  if(c.tail) t=Math.min(t,25); if(c.sink>600||(c.nz??1)>P.nz) t=Math.min(t,35); if(c.high) t=Math.min(t,40); else if(c.bounce) t-=10; if(c.d>900) t=Math.min(t,50); if(c.pc) t-=5;
  return Math.round(Math.max(0,t));
}
const cases = [
 ['T1 737 nominal (exp 100)', {sink:150,d:450,cl:1,ias:132,vref:134,pitch:5,bank:1,crab:1,drift:0.2}, prof.b737],
 ['T2 JA56AN-like (exp 15)', {sink:100,d:420,cl:1,ias:135,vref:134,pitch:6,bank:0.5,crab:0.5,drift:0.1,bounce:true,tail:true,nz:2.4}, prof.b737],
 ['T3 F-GTAT-like (exp 70)', {sink:400,d:500,cl:2,ias:130,vref:136,pitch:8.4,bank:1,crab:2,drift:0.5,bounce:true,nz:1.9,pc:true}, prof.a321],
 ['T4 VH-FVZ-like (exp 35)', {sink:928,d:400,cl:1,ias:105,vref:113,pitch:6,bank:0,crab:0,drift:0,nz:2.97}, prof.atr],
 ['T5 long 1000 m (exp 50)', {sink:150,d:1000,cl:1,ias:131,vref:134,pitch:5,bank:0,crab:0,drift:0}, prof.b737],
 ['T6 A320 bank 6 crab 7 (exp 94)', {sink:200,d:450,cl:1,ias:136,vref:134,pitch:5,bank:6,crab:7,drift:1.0}, prof.a320],
 ['T12 A330 nominal (exp 100)', {sink:180,d:480,cl:1.5,ias:136,vref:138,pitch:5,bank:1,crab:1,drift:0.3}, prof.a330],
];
for (const [n,c,P] of cases) console.log(`${n}: ${S(c,P)}`);
// hard-landing flags (nz > hardNz or sink > hardSink fps)
for (const [n,nz,fps,hn,hs] of [['G-DHJH',2.65,11.5,2.6,9],['F-GTAT',1.9,400/60,2.6,9],['VH-YQR 2nd',2.96,null,2.2,10],['VH-VUJ comp',1.94,null,2.2,10],['JA56AN',2.4,100/60,2.2,10],['VT-JTD 2nd',2.79,null,2.2,10],['VH-FVZ',2.97,928/60,2.0,10]]) console.log(`hard ${n}: ${nz>hn || (fps!==null && fps>hs)}`);
