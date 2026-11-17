// Prototype Node test (no dependencies) for section 7 parameters. Usage: node ops.test.mjs <params.json>
import fs from 'node:fs';
const P = JSON.parse(fs.readFileSync(process.argv[2] || new URL('./vtbd_ops.json', import.meta.url), 'utf8'));
let fails = 0; const ok = (id, c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + id + ' ' + msg); if (!c) fails++; };
const T = P.traffic, R = P.runway_config, KT = 0.514444, DEG = Math.PI / 180;
const sum = (a) => a.reduce((x, y) => x + y, 0);
// T-G01..03 hourly profile
ok('T-G01', Math.abs(sum(T.hourly_weights) - 1) < 1e-4 && T.hourly_weights.length === 24, 'sum w = ' + sum(T.hourly_weights).toFixed(6));
const depShare = sum(T.hourly_weights.map((w, h) => w * T.hourly_departure_share[h]));
ok('T-G02', Math.abs(depShare - 0.5) <= 0.01, 'dep share = ' + depShare.toFixed(4));
const D = T.annual_movements / 365, wmax = Math.max(...T.hourly_weights);
ok('T-G03', D * T.peak_day_factor.value * wmax <= T.check_capacity_per_hour, 'peak-day max hour = ' + (D * T.peak_day_factor.value * wmax).toFixed(1));
// T-G04 shares
const fm = sum(Object.values(T.fleet_mix)), al = sum(T.airlines.map((a) => a.share));
const agg = {}; for (const a of T.airlines) for (const [t, v] of Object.entries(a.types)) agg[t] = (agg[t] || 0) + a.share * v;
const maxDiff = Math.max(...Object.keys(T.fleet_mix).map((k) => Math.abs((agg[k] || 0) - T.fleet_mix[k])));
ok('T-G04', Math.abs(fm - 1) < 1e-4 && Math.abs(al - 1) < 1e-4 && T.airlines.every((a) => Math.abs(sum(Object.values(a.types)) - 1) < 1e-3) && maxDiff < 1e-3, `fleet ${fm.toFixed(4)} airlines ${al.toFixed(4)} maxDiff ${maxDiff.toExponential(1)}`);
// T-G05 deterministic day (largest remainder)
function apportion(total, w) { const q = w.map((x) => x * total), n = q.map(Math.floor); let r = total - sum(n);
  q.map((x, i) => [x - n[i], i]).sort((a, b) => b[0] - a[0]).slice(0, r).forEach(([, i]) => n[i]++); return n; }
const day = apportion(Math.round(D), T.hourly_weights);
ok('T-G05', Math.abs(sum(day) - D) / D <= 0.10 && Math.max(...day) <= T.check_capacity_per_hour, `day = ${sum(day)} (D = ${D.toFixed(1)}), max hour ${Math.max(...day)}`);
// T-G06 stochastic days with capacity clamp + carry-over
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function poisson(l, r) { if (l > 30) { const u = r(), v = r(); return Math.max(0, Math.round(l + Math.sqrt(l) * Math.sqrt(-2 * Math.log(u || 1e-12)) * Math.cos(2 * Math.PI * v))); }
  const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
const rnd = mulberry32(12345); let within = 0, maxH = 0; const N = 1000;
for (let dI = 0; dI < N; dI++) { let carry = 0, tot = 0; for (let h = 0; h < 24; h++) { let c = poisson(D * T.hourly_weights[h], rnd) + carry; const cap = T.check_capacity_per_hour; carry = Math.max(0, c - cap); c = Math.min(c, cap); maxH = Math.max(maxH, c); tot += c; } tot += carry; if (Math.abs(tot - D) / D <= 0.10) within++; }
ok('T-G06', within / N >= 0.95 && maxH <= T.check_capacity_per_hour, `days within 10 %: ${(within / N * 100).toFixed(1)} %, max hour ${maxH}`);
// T-G07..09 statistics
ok('T-G07', T.annual_movements_intl + T.annual_movements_dom === T.annual_movements, 'intl + dom = total');
ok('T-G08', Math.abs(T.lcc_movements / T.annual_movements - 0.9336) < 5e-4, 'LCC share ' + (T.lcc_movements / T.annual_movements).toFixed(4));
const codeC = ['A320', 'A20N', 'A21N', 'B738', 'B739', 'B38M'].reduce((s, k) => s + (T.fleet_mix[k] || 0), 0);
const seatsAvg = sum(Object.entries(T.fleet_mix).map(([k, v]) => v * T.seats[k])), lf = T.pax_per_movement / seatsAvg;
ok('T-G09', codeC >= 0.90 && lf >= 0.70 && lf <= 0.90, `code C ${codeC.toFixed(4)}, seats ${seatsAvg.toFixed(1)}, LF ${lf.toFixed(3)}`);
// T-G10..12 exits
const EM = R.exit_model; const J_OK = new Set(['A320', 'A20N', 'B738', 'B739', 'B38M', 'AT76', 'BIZJ']);
function sreq(t, kind, wet) { const a = EM.decel_ms2[t] * (wet ? EM.wet_factor : 1), v = EM.v_td_kt[t] * KT, ve = EM.v_exit_kt[kind] * KT; return EM.s_td_m[t] + (v * v - ve * ve) / (2 * a); }
function pick(list, t, wet) { for (const x of list) { if (x.id === 'J' && !J_OK.has(t)) continue; if (x.s_m >= sreq(t, x.kind, wet)) return x.id; } return list[list.length - 1].id; }
const ex = { ...R.dir21.exits, ...R.dir03.exits };
const sorted = Object.values(ex).every((l) => l.every((x, i) => i === 0 || x.s_m >= l[i - 1].s_m));
ok('T-G10', sorted && Object.entries(ex).every(([k, l]) => l.every((x) => x.s_m > 0 && x.s_m <= (k === '21L' ? 3150.5 : 3701.5))), 'exits sorted and inside runway');
const exp = [['21R', 'A320', false, 'O'], ['21R', 'A320', true, 'R'], ['21R', 'B738', false, 'R'], ['21R', 'AT76', false, 'J'], ['21R', 'A333', false, 'R'], ['03L', 'A320', false, 'J'], ['03L', 'A320', true, 'F'], ['03L', 'B738', true, 'E'], ['03L', 'A333', false, 'F'], ['03L', 'A21N', false, 'F'], ['21L', 'A320', false, 'S'], ['03R', 'B738', false, 'D']];
const got = exp.map(([r, t, w, e]) => [r, t, w, e, pick(ex[r], t, w)]);
ok('T-G11', got.every((g) => g[3] === g[4]), got.map((g) => `${g[0]} ${g[1]} ${g[2] ? 'wet' : 'dry'} ${g[4]}`).join('; '));
ok('T-G12', ['21R', '03L'].every((r) => [false, true].every((w) => pick(ex[r], 'A333', w) !== 'J' && pick(ex[r], 'A21N', w) !== 'J')), 'A333/A21N never use J');
// T-G13 overflow rule
const ovf = (a) => Math.min(Math.max(0, a - R.overflow.primary_only_up_to_arrivals_per_hour), Math.floor(R.overflow.max_secondary_fraction * a));
ok('T-G13', ovf(10) === 0 && ovf(14) === 0 && ovf(20) === 6 && ovf(30) === 15, `ovf(10,14,20,30) = ${[10, 14, 20, 30].map(ovf)}`);
// T-G14 runway direction selection
const hdg03 = 28.7; // true heading 03L from the AIP thresholds (repo: RWY_END["03L"].hdg)
function dir(windFrom, kt, month) { const h = kt * Math.cos((windFrom - hdg03) * DEG); if (h > R.select.headwind_threshold_kt) return '03'; if (h < -R.select.headwind_threshold_kt) return '21'; return R.select.default_by_month['03'].includes(month) ? '03' : '21'; }
ok('T-G14', dir(40, 10, 7) === '03' && dir(200, 10, 12) === '21' && dir(0, 0, 11) === '03' && dir(0, 0, 7) === '21' && dir(120, 10, 1) === '03', 'direction rule');
// T-G15 route rules
const routes = Object.entries(P.taxi_routes).filter(([k, v]) => /^(DEP|ARR)/.test(k));
const names = new Set(['A', 'B', 'B North', 'C', 'C South', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']);
ok('T-G15', routes.every(([, v]) => v.every((x) => x.startsWith('HOLD:') || names.has(x))) && routes.every(([, v]) => !v.includes('Y') && !v.includes('T')), 'designators valid, no Y/T in civil routes');
ok('T-G16', P.taxi_routes.ARR21L_S.includes('HOLD:21R') && P.taxi_routes.ARR03R_D.includes('HOLD:03L'), 'secondary-runway arrivals hold before crossing');
// T-G17 turnaround
const tri = (a) => (a[0] + a[1] + a[2]) / 3;
ok('T-G17', Object.values(T.turnaround_min).every((a) => a[0] <= a[1] && a[1] <= a[2]) && tri(T.turnaround_min.A320) >= 37 && tri(T.turnaround_min.A320) <= 61, 'A320 mean ' + tri(T.turnaround_min.A320).toFixed(1) + ' min');
// T-G18 coordinates
const lat0 = 13 + 54 / 60 + 51.74 / 3600, lon0 = 100 + 36 / 60 + 20.49 / 3600, a = 6378137, f = 1 / 298.257223563, e2 = f * (2 - f), s2 = Math.sin(lat0 * DEG) ** 2;
const M = a * (1 - e2) / (1 - e2 * s2) ** 1.5, Nn = a / Math.sqrt(1 - e2 * s2), cp = Math.cos(lat0 * DEG);
const llen = (la, lo) => [(lo - lon0) * DEG * Nn * cp, (la - lat0) * DEG * M];
const allEx = Object.values(ex).flat(); const maxErr = Math.max(...allEx.map((x) => { const [e, n] = llen(x.lat, x.lon); return Math.hypot(e - x.en[0], n - x.en[1]); }));
ok('T-G18', maxErr <= 0.15, 'exit lat/lon vs en max error ' + maxErr.toFixed(3) + ' m');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
