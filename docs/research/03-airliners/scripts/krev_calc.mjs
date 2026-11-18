// krev_calc.mjs — independent recompute of หัวข้อ 3.10 (topic 3.10, K) test values by the reviewer.
const KT = 1852/3600, FT = 0.3048, D = 180/Math.PI, g0 = 9.80665, FPS_KT = 1.6878099;
const r = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const o = [];
// 1 Vref fits (topic 2)
for (const m of [60000, 66361]) o.push(`Vref30(${m}) ${r(0.5595*Math.sqrt(m),2)}  Vref40 ${r(0.5392*Math.sqrt(m),2)}`);
const vref = 0.5595*Math.sqrt(60000);
o.push(`Vapp A/T ${r(vref+5,2)} kt = ${r((vref+5)*KT,2)} m/s`);
// 2 Boeing additive
for (const [hw,gu] of [[10,0],[20,0],[20,10],[0,25],[30,15]]) { const add = Math.min(20, Math.max(5, 0.5*hw+gu)); o.push(`Boeing HW${hw} G${gu}: add ${add} -> ${r(Math.min(vref+add, 175-5),1)} kt; gust kept ${Math.min(gu, add)}`); }
// 3 Airbus APPR COR
for (const hw of [0,12,15,20,30,45,60]) { const c = Math.min(15, Math.max(5, hw/3)); o.push(`Airbus HW${hw}: COR ${r(c,2)} VAPP ${r(128.5+c,2)}`); }
o.push(`GS mini ceo ${133.5+1*15} neo ${r(133.5+0.33*15,2)}; A330 blend 12.5 s k=${r(1-(1-0.33)*0.5,3)} -> ${r((1-(0.67)*0.5)*15,3)} ; 25 s ${r(0.33*15,2)}`);
// 4 ATR
for (const [hw,gu] of [[0,0],[15,0],[15,10],[60,0]]) { const wf = Math.min(15, Math.max(hw/3, gu)); o.push(`ATR HW${hw} G${gu}: WF ${r(wf,2)} VAPP ${Math.max(106+wf,95)}`); }
// 5 flare kinematics
const tan3 = Math.tan(3/D);
function flare(V, hF, H, dV, RDH=54, std=2.5){ const s0 = V*FPS_KT*Math.sin(3/D); const K=(s0-std)/hF, hB=std/K, tF=Math.log((hF+hB)/hB)/K; const xw=(RDH-H)*FT/tan3; const xs = xw - hF*FT/tan3; const xtd = xs + (V-dV/2)*KT*tF; return `sink ${r(s0*60,0)} fpm K ${r(K,3)} hB ${r(hB,1)} tF ${r(tF,2)} xw ${r(xw,1)} xs ${r(xs,0)} TD ${r(xtd,0)} m (${r(xtd/FT,0)} ft) Vtd ${r(V-dV,1)}`; }
o.push('737 20ft: '+flare(vref+5, 20, 14.2, 5));
o.push('737 30ft: '+flare(vref+5, 30, 14.2, 5));
o.push('A320 30ft: '+flare(133.5, 30, 16.0, 8));
o.push('A330 40ft: '+flare(140, 40, 28.1, 8));
o.push('ATR 20ft: '+flare(106, 20, 6.5, 7.5));
o.push(`float 140 kt 1 s = ${r(140*KT,1)} m = ${r(140*KT/FT,0)} ft`);
o.push(`AC91-79B (1.1)^2=${r(1.21,2)}, 10ft/tan3 = ${r(10/tan3,1)} ft; 2 s at 118 kt = ${r(2*118*FPS_KT,0)} ft`);
const v135 = 135*KT;
o.push(`req decel TD500 ${r(v135**2/(2*(3150-500)),3)} TD1200 ${r(v135**2/(2*(3150-1200)),3)}`);
// 6 pitch sensitivity
for (const [n,CL,CLa,V] of [['737',1.444,5.257,142.05],['A320',1.786,5.302,133.5],['A321',1.80,5.317,143.3]]) o.push(`${n} dth/dV ${r(D*2*CL/(V*CLa),3)} deg/kt, 10 kt ${r(10*D*2*CL/(V*CLa),2)}`);
// 7 crab
for (const [n,V] of [['A320',133.5],['737',142.05],['A321',144.2],['ATR',106]]) o.push(`${n} crab ` + [10,20,30,38].map(x=>r(Math.asin(x/V)*D,1)).join('/'));
// 8 sideslip
function slip(CYb,CYdr,Cnb,Cndr,CL,V,xw){ const b=Math.asin(xw/V), dr=-Cnb*b/Cndr, CY=CYb*b+CYdr*dr; return [r(b*D,1), r(dr*D,1), r(Math.asin(-CY/CL)*D,1), r(CY/b,3)]; }
for (const xw of [10,20,30]) o.push(`A320 slip ${xw}: ${slip(-0.719,0.235,0.113,-0.121,1.786,133.5,xw)} ; 737: ${slip(-0.87,0.23,0.167,-0.118,1.444,142.05,xw)}`);
o.push(`FOBN implied CY 10kt ${r(1.786*Math.sin(3/D)/Math.asin(10/133.5),3)} 30kt ${r(1.786*Math.sin(9/D)/Math.asin(30/133.5),3)}`);
// 9 nacelle contact: rigid rotation of a point (d, h) about the low-side wheel contact -> tan(phi) = h/d (author used asin)
const d = 4.902 - 5.715/2, dw = 35.79/2 - 5.715/2;
const both = (h, dd) => `asin ${r(Math.asin(h/dd)*D,2)} atan ${r(Math.atan2(h,dd)*D,2)}`;
for (const [lab,h] of [['MTW 0',0.48],['MTW -2.5 L3.2',0.48-3.2*Math.sin(2.5/D)],['MTW -2.5 L5',0.48-5*Math.sin(2.5/D)],['MTW dc0.1',0.38],['OEW 0',0.64],['OEW -2.5 L3.2',0.64-3.2*Math.sin(2.5/D)],['OEW -2.5 L5',0.64-5*Math.sin(2.5/D)]]) o.push(`nacelle ${lab} (h ${r(h,3)}): ${both(h,d)}`);
for (const h of [3.66,3.91]) o.push(`wingtip ${h}: ${both(h,dw)}`);
// 10 tail margins
for (const [n,a,f,c,e] of [['737',2.4,2.5,9,11],['A320',2.5,4,11.7,13.5],['A321',2.4,4.2,9.7,11.2],['ATR',-0.75,4.5,5.9,8]]) o.push(`${n} TD ${r(a+f,2)} margin ${r(c-a-f,2)} / ${r(e-a-f,2)}`);
// 11 decel
function stop(V0kt, a1, td, a2, vsw){ const V0=V0kt*KT; if(!a2) return [r(V0*td+V0*V0/(2*a1),0), r(td+V0/a1,1)]; const Vs=vsw*KT; return [r(V0*td+(V0*V0-Vs*Vs)/(2*a1)+Vs*Vs/(2*a2),0), r(td+(V0-Vs)/a1+Vs/a2,1)]; }
o.push(`737 AB1 ${stop(135,4*FT,1)} AB2 ${stop(135,5*FT,1)} AB3 ${stop(135,7.2*FT,1)} MAX ${stop(135,14*FT,1,12*FT,80)}`);
o.push(`A320 LO1.7/4 ${stop(130,1.7,4)} ${stop(120,1.7,4)} LO2/2 ${stop(130,2,2)} ${stop(120,2,2)} MED ${stop(130,3,2)} ${stop(120,3,2)}`);
o.push(`manual mu .35 ${r(.35*g0,2)} ${stop(135,.35*g0,1)} mu .45 ${r(.45*g0,2)} ${stop(135,.45*g0,1)}`);
o.push(`AB3 130->60 ${r(70*KT/(7.2*FT),1)} s; A320 MED 130->70 ${r(60*KT/3,1)} s`);
// 12 conversions
o.push(`kt/s -> m/s2: ${[3,6,8,10].map(x=>r(x*KT,3))}`);
o.push(`ft/s2: ${[4,5,7.2,14,12].map(x=>r(x*FT,3))}`);
o.push(`kt->m/s: ${[5,15,17,20,25,26,30,33,34,35,36,38,40,60,70,72].map(x=>x+':'+r(x*KT,3)).join(' ')}`);
o.push(`ft->m: ${[20,27,30,40,200,300,400,500,1000,1500].map(x=>x+':'+r(x*FT,3)).join(' ')}`);
o.push(`fpm->m/s: ${[240,360,540,600,720,840,928,1000].map(x=>x+':'+r(x*FT/60,3)).join(' ')}; 2.4 ft/s ${r(2.4*FT,3)} 11.5 ft/s ${r(11.5*FT,3)}`);
o.push(`GP origin: ${[54,53,55].map(h=>r(h*FT/tan3,1))}`);
o.push(`dispatch ${r(1000/0.6,1)} wet ${r(1000/0.6*1.15,1)} FSF tw10 ${r(1.1*1.1,3)}`);
o.push(`rotation ${[2,2.5,3].map(q=>r(8.5/q,2))} A330 ${r(10/3,2)}`);
o.push(`theta_lim 737 c=.5 ${11-(11-9)*0.5}`);
console.log(o.join('\n'));
// 13 wingtip: ACAPS 3.66-3.91 m is the NON-winglet 737-800 (span 34.32 m); winglet version tip is 6.50-6.76 m (winglet top)
const dB = 34.32/2 - 5.715/2;
console.log(`wingtip base 737-800 (semi-span 17.16, d ${r(dB,2)}): 3.66 -> asin ${r(Math.asin(3.66/dB)*D,2)} atan ${r(Math.atan2(3.66,dB)*D,2)}; 3.91 -> asin ${r(Math.asin(3.91/dB)*D,2)} atan ${r(Math.atan2(3.91,dB)*D,2)}`);
console.log(`winglet top 6.50 at semi-span 17.9: atan ${r(Math.atan2(6.5,dw)*D,1)}`);
