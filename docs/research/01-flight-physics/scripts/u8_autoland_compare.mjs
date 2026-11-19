// U8: autoland with the current model vs the proposed ground-effect prototype (U7 patch). ค่าประมาณ.
import fs from 'fs';
const dir = 'src/';
const base = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const u7 = fs.readFileSync(new URL('./u7_proposed_ge.mjs', import.meta.url), 'utf8');
function patched(src) { // re-apply the same replacements as U7
  const GE = u7.match(/const GE = `([\s\S]*?)`;/)[1];
  src = src.replace('// ── small vector / quaternion helpers ──', GE + '\n// ── small vector / quaternion helpers ──');
  src = src.replace("const hw = Math.max(0.2, h - 0.35);                       // wing height above ground\n    const ge = (16 * hw / AC.b) ** 2; const phiGE = ge / (1 + ge);",
    "const acN = mulR(R, [GEP.xac, 0, GEP.zac]); const hw = Math.max(0.05, h - acN[2]); const hb = hw / AC.b;\n    const kL = geKL(hb), kDi = geKDi(hb), phiGE = kDi;");
  src = src.replace("const CLlin = AC.CL0 + AC.CLflap * f + AC.CLa * (1 + 0.12 * (1 - phiGE)) * alpha + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;",
    "const CLw = (AC.CL0 + AC.CLflap * f + AC.CLa * alpha) * kL; const CLlin = CLw + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;\n    const epsOGE = GEP.deda / GEP.CLaW * CLw / kL; const dEps = (1 - kDi * kL) * epsOGE * GEP.kTail;");
  src = src.replace("AC.K * phiGE * (CLlin - 0.15) ** 2", "AC.K * kDi * (CLlin - 0.15) ** 2");
  src = src.replace("- 0.06 * (1 - phiGE) - sig * 0.25", "- GEP.etaH * GEP.VH * GEP.at * dEps - sig * 0.25");
  if (!src.includes('geKDi(hb)')) throw new Error('patch failed');
  return src;
}
const mk = (src) => new Function(src + '\nreturn { Flight, SCENARIOS, KT, FT, DEG, RAD, setActiveRunway };')();
for (const [name, src] of [['current', base], ['proposedGE', patched(base)]]) {
  const MM = mk(src);
  for (const rw of ['21R', '03L']) for (const sk of ['calm', 'xl']) {
    MM.setActiveRunway(rw);
    const f = new MM.Flight({ wind: MM.SCENARIOS[sk], pilot: 'ap', seed: 5 });
    let minDe = 0, flareDe = [];
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); if (f.ap.mode === 'FLARE') minDe = Math.min(minDe, f.ac.de); }
    const td = f.ev.td, s = f.ev.score();
    console.log(name, rw, sk, JSON.stringify({ crashed: f.crashed, score: s && s.total, td_s: td && +td.s.toFixed(0), vs_fpm: td && +td.vsFpm.toFixed(0), ias: td && +td.ias.toFixed(1), pitch: td && +td.pitch.toFixed(1), minDeFlare_deg: +(minDe * MM.RAD).toFixed(1) }));
  }
}
