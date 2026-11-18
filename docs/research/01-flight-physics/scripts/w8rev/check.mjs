// Independent reviewer re-computation for section 8 (wind).
import { M } from 'test/harness.mjs';
const { AC, KT, FT, DEG, G0, atmosphere, FIELD } = M;
const f=(x,n=4)=>Number(x).toFixed(n);
// Dryden table
const b=10.2, V=95*KT;
function lowAlt(hft,W20kt){const h=Math.min(Math.max(hft,10),1000),k=0.177+0.000823*h,sw=0.1*W20kt*KT;return{Lu:h/k**1.2*FT,Lw:h*FT,su:sw/k**0.4,sw};}
function integ(fn,w1=1e-5,w2=2000,n=400000){let s=0;const a=Math.log(w1),bb=Math.log(w2),d=(bb-a)/n;for(let i=0;i<n;i++){const w=Math.exp(a+(i+0.5)*d);s+=fn(w)*w*d;}return s;}
for(const [h,W] of [[50,15],[100,15],[300,15],[100,30]]){const P=lowAlt(h,W);
 const Pw=(w,L,s)=>s*s*L/(Math.PI*V)*(1+3*(L*w/V)**2)/(1+(L*w/V)**2)**2;
 const Pp=w=>P.sw**2/(V*P.Lw)*0.8*(Math.PI*P.Lw/(4*b))**(1/3)/(1+(4*b*w/(Math.PI*V))**2);
 const Pq=w=>(w/V)**2/(1+(4*b*w/(Math.PI*V))**2)*Pw(w,P.Lw,P.sw);
 const Pr=w=>(w/V)**2/(1+(3*b*w/(Math.PI*V))**2)*Pw(w,P.Lu,P.su);
 console.log(`h${h} W${W}: Lu ${f(P.Lu,1)} Lw ${f(P.Lw,1)} su ${f(P.su,3)} sw ${f(P.sw,3)} sp ${f(Math.sqrt(integ(Pp)))} closed ${f(0.954*P.sw/Math.cbrt(P.Lw*b*b))} simp ${f(1.9*P.sw/Math.sqrt(P.Lw*b))} sq ${f(Math.sqrt(integ(Pq)))} sr ${f(Math.sqrt(integ(Pr)))} sw_check ${f(Math.sqrt(integ(w=>Pw(w,P.Lw,P.sw))),3)}`);}
console.log('closed coeff',f(Math.sqrt(0.8*Math.PI**2/8)*(Math.PI/4)**(1/6),5));
// ETSO Dryden 100 ft vs 8785C
console.log('8785C Lu at 100 ft (ft)',f(lowAlt(100,15).Lu/FT,1),'su/sw',f(lowAlt(100,15).su/lowAlt(100,15).sw,3),'ETSO 5.6/3.5',f(5.6/3.5,3));
// wind profile W10=15
const pw=h=>15*(h/10)**(1/7), lg=(h,z0)=>15*Math.log(h/z0)/Math.log(10/z0);
for(const [nm,fn] of [['pow',pw],['z.03',h=>lg(h,.03)],['z.046',h=>lg(h,.046)],['z.5',h=>lg(h,.5)],['z1',h=>lg(h,1)]]){
 const hs=[10,50,100,300,1000].map(x=>f(fn(x*FT),1)); const h=100*FT,dh=0.5; const dudh=(fn(h+dh)-fn(h-dh))/(2*dh); const Vv=(95-15)*KT*Math.tan(3*DEG);
 console.log(nm,hs.join(' '),'rate kt/s',f(dudh*Vv,3),'F',f(dudh*KT*Vv/G0,4), 'rate with GS 95-local',f(dudh*(95-fn(h))*KT*Math.tan(3*DEG),3));}
console.log('z0 equiv 1/7',f(10*Math.exp(-7),5),'W20/W10',f((6.096/10)**(1/7),4));
// 25.341
for(const H of [30,107,350]) console.log('Uds/Fg H',H,f(56*(H/350)**(1/6),2),'m/s',f(56*(H/350)**(1/6)*FT,2));
// gust
const da=Math.atan(3/V); console.log('dalpha',f(da/DEG,3),'dn rho1.1262',f(0.5*1.1262*V*V*AC.S*AC.CLa*da/(AC.m*G0),3),'dn rho ISA+16 SL',f(0.5*atmosphere(FIELD.elev,16).rho*V*V*AC.S*AC.CLa*da/(AC.m*G0),3));
// fav
for(const t of [10,9,8,7,6,5]) process.stdout.write(f(20*KT/(G0*t),4)+' '); console.log();
// rho at 1000 ft
console.log('field elev',FIELD.elev,'rho1000ft isa+16',f(atmosphere(FIELD.elev+1000*FT,31-(15-0.0065*FIELD.elev)).rho,4));
// wake
const rho=1.1262;
for(const [nm,m,bs,Vk] of [['A320s',64500,35.8,137],['A320f',64500,34.1,137],['738W',66361,35.79,142]]){const Vw=Vk*KT,b0=Math.PI*bs/4,G=m*G0/(rho*Vw*b0),w0=G/(2*Math.PI*b0);console.log(nm,'b0',f(b0,2),'G0',f(G,1),'w0',f(w0,3),'fpm',f(w0/FT*60,0),'t0',f(b0/w0,1));
 const es=(e)=>Math.cbrt(e*b0)/w0; for(const e of [1e-4,1e-3,1e-2]){const s=es(e),Tss=-(1.27*Math.log(s)+0.57);const r=[3,4,5].map(D=>{const T=D*1852/Vw/(b0/w0);return f(Math.exp(-0.08*s*T)*0.5*(1-Math.tanh(0.75*(T-Tss-2.7))),2)});console.log('  eps',e,'eps*',f(s,3),'Tss+a',f(Tss+2.7,2),r.join('/'));}
 console.log('  age s',[3,4,5].map(D=>f(D*1852/Vw,0)).join('/'),'drop m',[3,4,5].map(D=>f(D*1852/Vw*w0,0)).join('/'));}
console.log('Gamma range A320 130-145kt',f(64500*G0/(rho*130*KT*Math.PI*35.8/4),0),f(64500*G0/(rho*145*KT*Math.PI*35.8/4),0));
console.log('Clda*20deg',f(0.16*20*DEG,4));
// Vicroy/OB
const OB=(r,z,lam,R,zs,eps)=>({u:lam*R*R/(2*r)*(1-Math.exp(-((r/R)**2)))*(Math.exp(-z/zs)-Math.exp(-z/eps)),w:-lam*Math.exp(-((r/R)**2))*(eps*(Math.exp(-z/eps)-1)-zs*(Math.exp(-z/zs)-1))});
const Vic=(r,z,um,rp,zm,c1,c2,al=2)=>{const lam=2*um/(rp*(Math.exp(c1)-Math.exp(c2))*Math.exp(1/(2*al)));const q=(r*r/(rp*rp))**al,g=Math.exp((2-q)/(2*al));return{u:lam*r/2*(Math.exp(c1*z/zm)-Math.exp(c2*z/zm))*g,w:-lam*(zm/c1*(Math.exp(c1*z/zm)-1)-zm/c2*(Math.exp(c2*z/zm)-1))*(1-q/2)*g};};
console.log('Vic TM w(0,300)',f(Vic(0,300,15,1000,60,-0.22,-2.75).w,3),'Vic92',f(Vic(0,300,15,1000,60,-0.15,-3.2175).w,3),'u(rp,zm)',f(Vic(1000,60,15,1000,60,-0.22,-2.75).u,9));
const dz=1e-3; console.log('Vic dudz at zm',(Vic(1000,60+dz,15,1000,60,-0.22,-2.75).u-Vic(1000,60-dz,15,1000,60,-0.22,-2.75).u)/(2*dz));
// OB matched to rp=1000,zm=60,um=15
{const R=1000/1.1212,zs=60/0.2196,eps=zs/12.5,lam=15/(0.2357*R);console.log('OB w(0,300)',f(OB(1e-6,300,lam,R,zs,eps).w,3),'u(1121,60)',f(OB(1.1212*R,60,lam,R,zs,eps).u,3));}
