// Reviewer: seed-to-seed spread of the T-W-01/02/07 statistics vs run length (h=100 ft, W20=15 kt, V=95 kt, dt=1/240).
const KT=0.514444, FT=0.3048, dt=1/240, V=95*KT;
const h=100, k=0.177+0.000823*h, sw=0.1*15*KT, su=sw/k**0.4, Lu=h/k**1.2*FT, Lw=h*FT;
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function run(seed,T){const r=rng(seed);let spare=null;const g=()=>{if(spare!==null){const v=spare;spare=null;return v;}let u,v,s;do{u=2*r()-1;v=2*r()-1;s=u*u+v*v;}while(s>=1||s===0);const m=Math.sqrt(-2*Math.log(s)/s);spare=v*m;return u*m;};
 const N=Math.round(T/dt), lu=Math.round(Lu/V/dt), lw=Math.round(Lw/V/dt);
 const tu=Lu/V, tw=Lw/V, au=Math.exp(-dt/tu), a=Math.exp(-dt/tw);
 // w: exact 2-state (x1'=-x1/tw + n, x2'=(x1-x2)/tw) driven by unit white noise; y = sigma*sqrt(tw)*(sqrt3*x1+(1-sqrt3)*x2)/tw  -> use Euler-Maruyama substeps (fine: dt/tw=0.0067)
 let u=0,x1=0,x2=0; const bu=new Float64Array(lu+1), bw=new Float64Array(lw+1); let su2=0,sw2=0,cu=0,cw=0,mu=0,mw=0,nu=0,nw=0;
 const c=sw*Math.sqrt(tw);
 for(let i=0;i<N+2400;i++){u=au*u+su*Math.sqrt(1-au*au)*g();
  const n=g()/Math.sqrt(dt); const dx1=(-x1/tw+n)*dt, dx2=((x1-x2)/tw)*dt; x1+=dx1; x2+=dx2;
  const w=c*(Math.sqrt(3)*x1+(1-Math.sqrt(3))*x2)/tw;
  if(i<2400) continue; const j=i-2400;
  su2+=u*u; sw2+=w*w; if(j>=lu){cu+=u*bu[(j-lu)%(lu+1)];nu++;} if(j>=lw){cw+=w*bw[(j-lw)%(lw+1)];nw++;}
  bu[j%(lu+1)]=u; bw[j%(lw+1)]=w;}
 const vu=su2/N, vw=sw2/N; return {su:Math.sqrt(vu)/su-1, sw:Math.sqrt(vw)/sw-1, Ru:cu/nu/vu, Rw:cw/nw/vw};}
for(const T of [2000,20000]){const R=[];for(let s=1;s<=12;s++)R.push(run(s*7919,T));
 const st=k=>{const m=R.reduce((a,b)=>a+b[k],0)/R.length;const sd=Math.sqrt(R.reduce((a,b)=>a+(b[k]-m)**2,0)/(R.length-1));return `${k} mean ${m.toFixed(3)} sd ${sd.toFixed(3)} max|dev| ${Math.max(...R.map(r=>Math.abs(r[k]-(k==='Ru'?Math.exp(-1):k==='Rw'?0.5*Math.exp(-1):0)))).toFixed(3)}`;};
 console.log('T',T,'|',st('su'),'|',st('sw'),'|',st('Ru'),'|',st('Rw'));}
