// rev_oracle_cmp.mjs - recompute max |JS - JSBSim| for every oracle run from the saved rows (review of sec 12)
import fs from 'fs';
const D = 'docs/research/01-flight-physics/scripts/s12/';
const rd = (f) => JSON.parse(fs.readFileSync(D + f, 'utf8'));
const js0 = rd('oracle_js_noadot.json'), js1 = rd('oracle_js_adot.json');
console.log('cols', js0.cols);
const wrap = (d) => ((d + 540) % 360) - 180;
function cmp(js, f) {
  const jb = rd(f), A = js.rows, B = jb.rows, n = Math.min(A.length, B.length), m = {};
  for (let i = 0; i < n; i++) for (let c = 1; c < js.cols.length; c++) {
    let d = A[i][c] - B[i][c]; if (/psi/.test(js.cols[c])) d = wrap(d);
    m[js.cols[c]] = Math.max(m[js.cols[c]] || 0, Math.abs(d));
  }
  const last = n - 1;
  return { f, n, t_end: A[last][0], h_js: A[last][1], h_jsb: B[last][1], psi_js: A[last][7], psi_jsb: B[last][7], max: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, +v.toPrecision(3)])) };
}
for (const f of ['oracle_jsb_noadot_240hz_ab3.json', 'oracle_jsb_noadot_240hz_default.json', 'oracle_jsb_noadot_120hz_default.json', 'oracle_jsb_noadot_1200hz_ab3.json']) console.log(JSON.stringify(cmp(js0, f)));
console.log(JSON.stringify(cmp(js1, 'oracle_jsb_adot_240hz_ab3.json')));
