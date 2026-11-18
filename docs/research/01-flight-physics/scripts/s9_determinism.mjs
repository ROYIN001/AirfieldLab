// Determinism: (1) same run twice → bit-identical? (2) 1-ulp perturbations of libm results (emulating another engine's Math.*)
// (3) 1e-9 m initial-position perturbation. Measures the spread of touchdown results in calm and gusty crosswind.
import { M } from './s9_harness.mjs';
const { Flight, SCENARIOS } = M;
function landing(sc, patch) {
  const saved = {}; if (patch) for (const k of ['exp', 'tanh', 'pow', 'atan2', 'sin', 'cos', 'log']) { saved[k] = Math[k]; const f = Math[k]; Math[k] = (...a) => { const r = f(...a); return r * (1 + patch * Number.EPSILON); }; }
  try {
    const f = new Flight({ wind: SCENARIOS[sc], pilot: 'ap', seed: 5 });
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
    const td = f.ev.td; return { s: td.s, vs: td.vsFpm, tl: td.tl, score: f.ev.score().total, xEnd: Array.from(f.ac.x.slice(0, 3)) };
  } finally { for (const k in saved) Math[k] = saved[k]; }
}
for (const sc of ['calm', 'xl']) {
  const a = landing(sc), b = landing(sc);
  const same = a.xEnd.every((v, i) => Object.is(v, b.xEnd[i]));
  const p = landing(sc, 1), m = landing(sc, -1);
  console.log(`${sc}: repeat bit-identical=${same}; base TD s=${a.s.toFixed(3)} m vs=${a.vs.toFixed(1)} fpm tl=${a.tl.toFixed(3)} score=${a.score}`);
  console.log(`   libm +1ulp: TD s=${p.s.toFixed(3)} vs=${p.vs.toFixed(1)} tl=${p.tl.toFixed(3)} score=${p.score} | libm -1ulp: TD s=${m.s.toFixed(3)} vs=${m.vs.toFixed(1)} tl=${m.tl.toFixed(3)} score=${m.score}`);
  console.log(`   end-state difference |Δx| (m): +ulp ${Math.hypot(...p.xEnd.map((v, i) => v - a.xEnd[i])).toExponential(2)}, -ulp ${Math.hypot(...m.xEnd.map((v, i) => v - a.xEnd[i])).toExponential(2)}`);
}
// divergence growth of a 1e-9 m initial perturbation along the flight (xl)
for (const sc of ['calm', 'xl']) {
  const A = new Flight({ wind: SCENARIOS[sc], pilot: 'ap', seed: 5 }), B = new Flight({ wind: SCENARIOS[sc], pilot: 'ap', seed: 5 });
  B.ac.x[1] += 1e-9; const out = [];
  for (let t = 0; t < 200 && !A.ev.td && !B.ev.td; ) { A.tick(A.dt); B.tick(B.dt); t = A.ac.t; if (Math.abs(t % 20) < A.dt / 2) out.push(`t${t.toFixed(0)}:${Math.hypot(A.ac.x[0] - B.ac.x[0], A.ac.x[1] - B.ac.x[1], A.ac.x[2] - B.ac.x[2]).toExponential(1)}`); }
  console.log(`${sc} 1e-9 m perturbation, |Δpos| (m): ${out.join(' ')}`);
}
