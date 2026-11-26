// zrev_testvals.mjs — independent recomputation by the round-3 reviewer (2026-11-18) of every
// equation-derived number and V-type test expectation in 08-fbw-laws.md. No dependencies.
const KT = 1852/3600, FT = 0.3048, LBF = 4.4482216152605, G = 9.80665, D = Math.PI/180;
const f = (x, n=4) => Number(x).toFixed(n);
const out = [];
const P = (k, v) => out.push(k.padEnd(48) + v);
// ISA density
function rhoISA(h){ const T=288.15-0.0065*h; return 1.225*Math.pow(T/288.15, 4.255876); }

P('400 ft/s -> m/s, kt', f(400*FT,3)+' '+f(400*FT/KT,2));
P('240 kt -> m/s', f(240*KT,2));
P('100 m/s -> kt', f(100/KT,2));
P('15 deg/s -> rad/s', f(15*D,4));
P('VMO 350 / 356 / 361 / 366 kt -> m/s', [350,356,361,366].map(v=>f(v*KT,3)).join(' '));
P('6/15/16 kt -> m/s', [6,15,16].map(v=>f(v*KT,3)).join(' '));
P('5/10/25/30 kt -> m/s', [5,10,25,30].map(v=>f(v*KT,3)).join(' '));
P('60/440 kt -> m/s', [60,440].map(v=>f(v*KT,3)).join(' '));
P('1 kt/s, 2 kt/s, 3 kt', [1,2,3].map(v=>f(v*KT,3)).join(' '));
P('50/30/100/400 ft -> m', [50,30,100,400].map(v=>f(v*FT,3)).join(' '));
// T-Z-01
const stickToDnz=(s,cfg)=>{const [mn,mx]=cfg==='clean'?[-1,2.5]:[0,2]; return s>=0? s*(mx-1) : -s*(mn-1);};
P('T-Z-01 clean nz @ +1,+.5,-.5,-1', [1,.5,-.5,-1].map(s=>1+stickToDnz(s,'clean')).join(' '));
P('T-Z-01 FULL nz @ +1,+.5,-.5,-1', [1,.5,-.5,-1].map(s=>1+stickToDnz(s,'full')).join(' '));
// T-Z-02
const nzRef=(th,ph)=>Math.cos(th*D)/Math.cos(Math.min(Math.abs(ph),33)*D);
P('T-Z-02 nzRef(0,30),(0,33),(0,45),(10,0)', [nzRef(0,30),nzRef(0,33),nzRef(0,45),nzRef(10,0)].map(x=>f(x,4)).join(' '));
P('acos(1/2.5) deg (max level bank at 2.5 g)', f(Math.acos(1/2.5)/D,2));
// turn coordination
const Vapp=133.5*KT;
P('r_cmd g tan33/V @133.5 kt deg/s', f(G*Math.tan(33*D)/Vapp/D,3));
// D-AXLA ratios (T-Z-14)
const VS=123/1.23; P('T-Z-14 VS1g, Vamax/VS1g, CL ratio (1.23)', f(VS,2)+' '+f(107/VS,4)+' '+f((VS/107)**2,4));
const VS2=123/1.28; P('  with 1.28: VS1g, Vamax/VS1g, CL ratio', f(VS2,2)+' '+f(107/VS2,4)+' '+f((VS2/107)**2,4));
P('ALT stall warning 1.03 VS1g -> CL ratio', f(1/1.03**2,4));
// T-Z-13 alpha thresholds with หัวข้อ 3.3 data
const m=64500,S=122.6,CLa=5.302, cfgs={FULL:{CL0:1.369,CLmax:2.88},CONF0:{CL0:0.12,CLmax:1.31}};
for (const [k,c] of Object.entries(cfgs)){
  const aCLmax=(c.CLmax-c.CL0)/CLa/D, CLam=0.873*c.CLmax, amax=(CLam-c.CL0)/CLa/D, aprot=amax-3, afl=amax-2.5;
  const CLat=a=>c.CL0+CLa*a*D, V=CL=>Math.sqrt(2*m*G/(1.225*S*CL))/KT;
  P(`T-Z-13 ${k}: a(CLmax), amax, aprot, afloor`, [aCLmax,amax,aprot,afl].map(x=>f(x,2)).join(' '));
  P(`  ${k}: VS1g, Vamax, Vafloor, Vaprot, VLS(1.23)`, [V(c.CLmax),V(CLam),V(CLat(afl)),V(CLat(aprot)),1.23*V(c.CLmax)].map(x=>f(x,1)).join(' '));
}
// T-Z-15 flare
const thRef=(memo,t)=>{const r=(Math.max(-2,memo)+2)/8; return Math.max(-2, memo - r*t);};
P('T-Z-15 memo2.5 t0,t4,t8,t10', [0,4,8,10].map(t=>thRef(2.5,t)).join(' '));
P('T-Z-15 memo5 t4; memo-3 t0', thRef(5,4)+' '+thRef(-3,0));
P('flare blend w at 40 ft', f(Math.min(1,Math.max(0,(50-40)/20)),2));
P('sink 3 deg @133.5 kt m/s, fpm', f(Vapp*Math.sin(3*D),3)+' '+f(Vapp*Math.sin(3*D)/FT*60,0));
P('3.70 m/s, 2.10 m/s -> fpm', f(3.70/FT*60,0)+' '+f(2.10/FT*60,0));
// T-Z-18
const R=(ph,lim)=>{const a=Math.abs(ph); if(a<=33) return 0; if(a<=lim) return 15*(a-33)/(lim-33); return 15+5*Math.min(1,(a-lim)/5);};
P('T-Z-18 R(30;67),R(50;67),R(67;67),R(40;45)', [R(30,67),R(50,67),R(67,67),R(40,45)].join(' '));
P('T-Z-18 HSP R(20)=15*20/40', 15*20/40);
// roll gains: Lp, Lu at 133.5 kt, 300 m
const rho=rhoISA(300), b=34.10, Ixx=1.749e6, qb=0.5*rho*Vapp**2;
const Lp=qb*S*b*(-0.509)*(b/(2*Vapp))/Ixx, Lu=qb*S*b*0.05/Ixx;
const wn=2, z=0.8, Kphi=wn*wn/Lu, Kp=(2*z*wn+Lp)/Lu;
P('rho(300 m), qbar', f(rho,4)+' '+f(qb,1));
P('Lp, Lu', f(Lp,4)+' '+f(Lu,4));
P('Kphi, Kp, Ki', f(Kphi,2)+' '+f(Kp,2)+' '+f(0.5*Kphi,2));
P('open-loop steady p full u (-Lu/Lp) deg/s', f(-Lu/Lp/D,2));
// closed loop char. eq check: s^2 + (Kp Lu - Lp) s + Kphi Lu
P('closed loop 2 zeta wn, wn^2', f(Kp*Lu-Lp,3)+' '+f(Kphi*Lu,3));
// qbar / schedule
const q0=0.5*1.225*Vapp**2; P('qbar 133.5 kt SL, sch=8000/q', f(q0,0)+' '+f(8000/q0,3));
const q330=0.5*rhoISA(600)*(330*KT)**2; P('qbar 330 kt @600 m, sch', f(q330,0)+' '+f(Math.min(4,Math.max(0.3,8000/q330)),3));
// HSP T-Z-25
const VMO=350, hspDnz=v=>Math.min(0.75,Math.max(0,0.075*(v-VMO-6))), auth=v=>Math.min(1,Math.max(0,(VMO+16-v)/10));
P('T-Z-25 dnz,auth @356,361,366', [356,361,366].map(v=>hspDnz(v)+'/'+auth(v)).join(' '));
P('slope 0.075 g/kt -> g/(m/s)', f(0.075/KT,4));
// sidestick T-Z-30
const bo=1.1*LBF, fp=22.5*LBF, fo=5.6*LBF, fi=7.8*LBF;
P('T-Z-30 breakout, Fpitch, Fout, Fin N', [bo,fp,fo,fi].map(x=>f(x,2)).join(' '));
P('T-Z-30 gradients N/deg', [(fp-bo)/16,(fo-bo)/20,(fi-bo)/20].map(x=>f(x,3)).join(' '));
P('dual input 2 deg as fraction pitch, roll', f(2/16,3)+' '+f(2/20,3));
// T-Z-31 expo (round 1: s=(1-e)x+e x^3, scaled dead zone)
const shape=(x,dz,e)=>{const a=Math.abs(x); if(a<=dz) return 0; const y=(a-dz)/(1-dz); return Math.sign(x)*((1-e)*y+e*y**3);};
P('T-Z-31 dz0: s, dnz clean', f(shape(.5,0,.5),4)+' '+f(1.5*shape(.5,0,.5),4));
P('T-Z-31 dz0.04 (gamepad round 1): s, dnz', f(shape(.5,.04,.5),4)+' '+f(1.5*shape(.5,.04,.5),4));
P('round1 T-I-01 check f(0.5;dz.08,e.5)', f(shape(.5,.08,.5),4));
P('keyboard: 1/0.5 s, 1/2.5 s', 1/0.5+' '+1/2.5);
P('240 Hz step ms', f(1000/240,3));
// T-Z-32 ground blend
P('T-Z-32 blend at 2.5 s, 5 s', 2.5/5+' '+Math.min(1,5/5));
// HUD flare: 30 deg level turn nz
P('nz level turn 30/33/45', [30,33,45].map(a=>f(1/Math.cos(a*D),4)).join(' '));
console.log(out.join('\n'));
