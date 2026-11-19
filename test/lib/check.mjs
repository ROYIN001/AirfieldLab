// Tiny assertion helpers: every check prints ✓/✗ with its numbers; done() exits non-zero if any failed.
let fails = 0, count = 0;
export function check(name, ok, detail = '') {
  count++; if (!ok) fails++;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  return ok;
}
export const within = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
export const f1 = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : String(v));
export function done() {
  if (fails) { console.log(`\n${fails} of ${count} checks failed`); process.exit(1); }
  console.log(`\nall ${count} checks passed`);
}
