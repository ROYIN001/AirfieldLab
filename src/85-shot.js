// PNG snapshot credit. A saved picture is a Produced Work of the OpenStreetMap-derived data in data/, so it carries
// the ODbL 4.3 notice and, for ODbL 4.6, where the data it was made from can be had (data/LICENSE-DATA.md).
// Pure (no DOM): stampCredit draws into the bottom-right corner of a 2D context of size w × h;
// test/licenses.test.mjs runs it against a stub context.
const SHOT_CREDIT = '© ผู้ร่วมพัฒนา OpenStreetMap ข้อมูลภายใต้ ODbL (openstreetmap.org/copyright) · ไฟล์ข้อมูล github.com/ROYIN001/AirfieldLab · AIP Thailand · ใช้เพื่อการฝึกเท่านั้น';
function stampCredit(g, w, h) {
  const width = (s) => g.measureText(s).width, room = w * 0.96;
  let px = Math.max(11, Math.round(h / 70));
  for (;; px--) { g.font = `${px}px system-ui, sans-serif`; if (px <= 7 || width(SHOT_CREDIT) <= room) break; }
  // still too wide at 7 px: one part per line, so the © notice never falls off the left edge
  const lines = width(SHOT_CREDIT) <= room ? [SHOT_CREDIT] : SHOT_CREDIT.split(' · ');
  const pad = Math.round(px * 0.45), lh = Math.round(px * 1.3), tw = Math.max(...lines.map(width));
  const x = Math.max(pad, w - tw - pad), bh = lines.length * lh + 2 * pad;
  g.fillStyle = 'rgba(0, 0, 0, 0.55)'; g.fillRect(x - pad, h - bh, w - x + pad, bh);
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'bottom';
  lines.forEach((s, i) => g.fillText(s, x, h - pad - (lines.length - 1 - i) * lh));
}
