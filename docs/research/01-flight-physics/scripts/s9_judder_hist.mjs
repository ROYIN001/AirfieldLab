// Step-count histogram at exact 120 Hz and 240 Hz timestamps (floating-point accumulator artefact), with and without an epsilon snap.
const dt = 1 / 240;
for (const f of [60, 120, 240]) for (const eps of [0, 1e-9]) {
  let acc = 0, last = 0; const h = {};
  for (let k = 1; k <= 100000; k++) { const now = k / f; const realDt = Math.min(0.1, now - last); last = now; acc += realDt; let n = 0;
    while (acc >= dt - eps && n < 60) { acc -= dt; n++; } if (k > 10) h[n] = (h[n] || 0) + 1; }
  console.log(`${f} Hz, eps ${eps}:`, JSON.stringify(h));
}
// same with integer microsecond timestamps as browsers deliver (rAF timestamps are ms with µs fraction), dt in integer ns ticks
