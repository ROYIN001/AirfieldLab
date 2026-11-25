// Credits and licences (research round 5 §11, tests T-K01…T-K05). T-K05 (plan item A3): the page footer, the source
// comment of src/15-geo.js and the data provenance in CLAUDE.md cite the AIRAC cycle that
// test/fixtures/aip_vtbd_current.json holds, so a cycle update in the fixture asks for the same update in the text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const AIP = JSON.parse(read('test/fixtures/aip_vtbd_current.json')).aip_vtbd_current;
const [Y, MO, D] = AIP.meta.airac_effective.split('-').map(Number);
const EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const cycleEN = `AIRAC ${String(D).padStart(2, '0')} ${EN[MO - 1]} ${Y}`, cycleTH = `AIRAC ${D} ${TH[MO - 1]} ${Y}`;
// every <p class="foot"> paragraph of the page (credits first, then the physics note)
const footer = () => { const f = [...read('src/template.html').matchAll(/<p class="foot">([\s\S]*?)<\/p>/g)].map((m) => m[1]).join(' · '); assert.ok(f, 'footer'); return f; };

test(`T-K05 the footer cites the fixture's cycle (${cycleTH}) and no older one`, () => {
  const f = footer();
  assert.ok(f.includes(cycleTH), `footer: ${f.slice(0, 120)}…`);
  assert.equal([...f.matchAll(/AIRAC/g)].length, 1, 'one AIRAC cycle in the footer');
  assert.ok(!f.includes('14 พ.ค. 2026'), 'the 14 พ.ค. 2026 cycle is gone');
});

test(`T-K05 src/15-geo.js names ${cycleEN} as its source and CLAUDE.md does the same`, () => {
  const src = read('src/15-geo.js').split('\n').find((l) => l.startsWith('// Source: AIP Thailand AD 2 VTBD'));
  assert.ok(src && src.includes(`(CAAT, ${cycleEN}`), src);
  const prov = read('CLAUDE.md').split('\n').find((l) => l.startsWith('- Runways, lights, navaids: AIP Thailand AD 2 VTBD'));
  assert.ok(prov && prov.includes(cycleEN), prov);
});
