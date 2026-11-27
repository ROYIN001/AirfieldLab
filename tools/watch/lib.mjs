// Pure helpers of the AIP watch (plan item A10; research round 2 R2-09, round 5 R5-P3-7 and R5-S1-8). They read the
// pages of the Thailand eAIP (https://aip.caat.or.th, © CAAT): the index of editions, a package cover, the lists of
// AIP supplements (SUP) and circulars (AIC), the amendment list and the page AD 2 VTBD; split AD 2 VTBD into its
// sections, compare two editions, check the values of test/fixtures/aip_vtbd_current.json against an edition's text,
// classify SUP/AIC titles and validate tools/watch/reviewed.json. No network, no file system and no process access
// here: tools/watch/watch.mjs does the IO. The page structure was read from the eAIP editions of 29 OCT, 26 NOV and
// 24 DEC 2026 (Eurocontrol eAIP toolbox 2.0 output). Nothing of the AIP text is stored in the repo.

// ---- dates and the AIRAC cycle --------------------------------------------------------------------------------
export const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'))
  && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
// '26 NOV 2026' (also '2 OCT 2025', 'Effective 26 NOV 2026') -> '2026-11-26'; null when there is no such date
export function parseDMY(s) {
  const m = /(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})/.exec(String(s ?? ''));
  if (!m) return null;
  const mo = MON.indexOf(m[2].toUpperCase());
  const d = `${m[3]}-${String(mo + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return mo >= 0 && isDate(d) ? d : null;
}
export const fmtDMY = (iso) => { const [y, m, d] = iso.split('-'); return `${d} ${MON[+m - 1]} ${y}`; };
export const addDays = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

// AIRAC effective dates repeat every 28 days (ICAO Annex 15, chapter 6, and Doc 8126). Anchor: AIRAC 29 OCT 2026,
// AMDT 11/26 on the eAIP index; 26 NOV 2026, 24 DEC 2026 and 21 JAN 2027 follow (AIC 07/26 lists the 2027 dates).
export const AIRAC_ANCHOR = '2026-10-29', AIRAC_DAYS = 28;
const mod = (a, n) => ((a % n) + n) % n;
export const isAirac = (iso) => isDate(iso) && mod(daysBetween(AIRAC_ANCHOR, iso), AIRAC_DAYS) === 0;
export const airacOnOrAfter = (iso) => addDays(AIRAC_ANCHOR, Math.ceil(daysBetween(AIRAC_ANCHOR, iso) / AIRAC_DAYS) * AIRAC_DAYS);
export const airacAfter = (iso) => airacOnOrAfter(addDays(iso, 1));
export function airacDates(fromIso, n) { const out = [airacOnOrAfter(fromIso)]; while (out.length < n) out.push(addDays(out.at(-1), AIRAC_DAYS)); return out; }
// An AIRAC package is published at least 42 days before it takes effect (ICAO Annex 15, chapter 6, and Doc 8126, the
// AIRAC system); the eAIP index shows exactly that: 26 NOV 2026 published 15 OCT 2026, 24 DEC 2026 published 12 NOV 2026.
export const AIRAC_PUBLISH_DAYS = 42;
export const airacPublished = (effective) => addDays(effective, -AIRAC_PUBLISH_DAYS);

// ---- HTML to text ----------------------------------------------------------------------------------------------
export const EAIP_ROOT = 'https://aip.caat.or.th/';
// pages of one edition, relative to <folder>/html/ (folder as the index links it, e.g. 2026-11-26-AIRAC)
export const EDITION_PAGES = {
  ad2: 'eAIP/VT-AD-2.VTBD-en-GB.html', amdt: 'eAIP/VT-AMDT-en-GB.html', cover: 'VT-cover-en-GB.html',
  sups: 'eSUP/VT-eSUPs-en-GB.html', aics: 'eAIC/VT-eAICs-en-GB.html',
};
export const editionUrl = (folder, page) => new URL(`${folder}/html/${EDITION_PAGES[page] ?? page}`, EAIP_ROOT).href;
export const basename = (u) => String(u).split(/[?#]/)[0].split('/').pop();
// What a page of each kind must hold before it is used or cached (a 200 error page, a cut download or a changed
// layout fails here): true, or why not.
export const PAGE_CHECK = {
  ad2: (h) => /\bid="VTBD-AD-2\.\d+"/.test(h) || 'no section VTBD-AD-2.n',
  amdt: (h) => /\bid="amdtGroups"|>\s*Effective\s+\d{1,2}\s+[A-Z]{3}\s+\d{4}/i.test(h) || 'no list of changes (amdtGroups or "Effective <date>")',
  cover: (h) => /Effective date:/i.test(h) || 'no "Effective date:"',
  sups: (h) => /Published as of/i.test(h) || 'no "Published as of"',
  aics: (h) => /Published as of/i.test(h) || 'no "Published as of"',
  item: (h) => /<title>\s*(?:AIP\s+)?(?:SUP|AIC)\s+\d/i.test(h) || /name="EM\.effectiveDateStart"/.test(h) || 'no SUP/AIC title or EM.effectiveDateStart',
};

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '–', mdash: '—', deg: '°', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', times: '×', minus: '−' };
export const decodeEntities = (s) => String(s)
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (_, d) => String.fromCodePoint(parseInt(d, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
// Scripts (the Cloudflare beacon window.__CF$cv$params of every eAIP page included), styles, comments and a BOM
export const stripScripts = (h) => String(h).replace(/^﻿/, '').replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
// inline text of a fragment: tags out, entities decoded, whitespace collapsed
export const inlineText = (h) => decodeEntities(stripScripts(h).replace(/<br\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// Cloudflare email obfuscation: <a class="__cf_email__" data-cfemail="HEX">[email protected]</a>. The key (first byte)
// changes with every download, so the address is decoded: a changed address still shows as a change.
export function decodeCfEmail(hex) {
  const k = parseInt(hex.slice(0, 2), 16); let s = '';
  for (let i = 2; i + 1 < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k);
  return s;
}
const VOID = new Set(['br', 'img', 'meta', 'input', 'col', 'hr', 'link', 'area', 'base', 'wbr', 'source', 'param']);
const BLOCK = new Set(['p', 'div', 'tr', 'td', 'th', 'li', 'ul', 'ol', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot',
  'caption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'pre', 'blockquote', 'hr']);
// Amendment marks of the eAIP (eAIP-Amdt-hide.css hides the deleted text, so it is not in force): every element whose
// class names AmdtDeleted* (<del>, but also <span>, <p>, <tr>) goes with its content; <ins> and AmdtInserted* stay
// as plain text. Nested elements of the same name are counted so that the whole deleted element goes, no more.
export function dropDeleted(h) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let out = '', last = 0, m, skip = null, depth = 0;
  while ((m = re.exec(h))) {
    const [, close, name0, attrs] = m, name = name0.toLowerCase(), self = VOID.has(name) || /\/\s*$/.test(attrs);
    if (skip) {
      if (name === skip && !self) { if (close) { if (--depth === 0) { skip = null; last = re.lastIndex; } } else depth++; }
      continue;
    }
    if (!close && !self && (name === 'del' || /\bclass\s*=\s*["'][^"']*\bAmdtDeleted/i.test(attrs))) {
      out += h.slice(last, m.index); skip = name; depth = 1;
    }
  }
  return out + (skip ? '' : h.slice(last));
}
// What is not content and nothing more: scripts, comments, amendment marks (deleted text out, inserted text kept),
// the hidden data-binding tokens of the eAIP toolbox (<span class="sdParams" style="display: none;">TAD_HP;GEO_LAT;229
// </span>, only when the span holds nothing but such a token), the email obfuscation, the source's line breaks and
// indentation. Block elements end a line; inline tags vanish without a space, so "135307.<del>01</del><ins>9</ins>N"
// reads 135307.9N as in the next edition. Chart links (AD 2.24) keep their target, so a re-issued chart shows, and
// every picture (<img>: AD 2.20, 2.22 and 2.23 hold eight in 2026) becomes its own line "[img <file name>]", so an
// added, removed or renamed picture shows. A new picture saved under the same file name still goes unseen: only a
// hash of the image file would catch that.
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
function contentHtml(fragment) {
  let h = dropDeleted(stripScripts(fragment));
  h = h.replace(/<span\b[^>]*class="(?:sd|ac)Params"[^>]*>\s*T[A-Z_]+;[A-Za-z_.:0-9]+;\d+\s*<\/span>/g, '');
  h = h.replace(/<a\b[^>]*data-cfemail="([0-9a-fA-F]+)"[^>]*>[\s\S]*?<\/a>/g, (_, hex) => decodeCfEmail(hex));
  h = h.replace(/\s+/g, ' ');
  h = h.replace(/<a\b[^>]*href="([^"]*graphics\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `${t} [${basename(href)}]`);
  return h.replace(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*?\bsrc\s*=\s*"([^"]*)"(?:[^>"']|"[^"]*"|'[^']*')*>/gi, (_, s) => `<br/>[img ${basename(decodeEntities(s))}]<br/>`);
}
export function htmlLines(fragment) {
  const h = contentHtml(fragment).replace(TAG, (_, c, n) => (BLOCK.has(n.toLowerCase()) ? '\n' : ''));
  return decodeEntities(h).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
// The same content with one line per table row: the cells joined by ' | ', empty cells kept (so a value that moves
// into the next cell of its row is a change), the lines inside a cell joined by ' / '; text outside tables as in
// htmlLines. compareAd2 compares this form; the facts read htmlLines. A table inside a cell (none in 2026) is read
// as lines of that cell. A row of empty cells only is left out.
export function htmlRows(fragment) {
  const h = contentHtml(fragment), CELL = '\u0003', LINE = '\u0002';
  let s = '', row = false, cell = false, inner = 0, last = 0, m;
  const endCell = () => { if (cell) { s += CELL; cell = false; } };
  const endRow = () => { if (row) { endCell(); s += '\n'; row = false; } };
  TAG.lastIndex = 0;
  while ((m = TAG.exec(h))) {
    const t = h.slice(last, m.index); last = TAG.lastIndex;
    if (cell || !row) s += t; else if (t.trim()) s += t + CELL;   // text in a row between cells: a cell of its own
    const close = !!m[1], n = m[2].toLowerCase(), self = VOID.has(n) || /\/\s*$/.test(m[3]);
    if (inner) { if (n === 'table') inner += close ? -1 : self ? 0 : 1; if (BLOCK.has(n)) s += LINE; continue; }
    if (n === 'table' && !close && cell) { if (!self) inner = 1; s += LINE; continue; }
    if (n === 'tr') { endRow(); if (!close && !self) { s += '\n'; row = true; } }
    else if (n === 'td' || n === 'th') {
      if (!row) { s += '\n'; row = true; }
      endCell();
      if (!close) { cell = true; if (self) endCell(); }
    } else if (['table', 'thead', 'tbody', 'tfoot'].includes(n)) endRow();
    else if (BLOCK.has(n)) s += cell ? LINE : row ? '' : '\n';
  }
  s += h.slice(last); endRow();
  const clean = (x) => x.split(LINE).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' / ');
  return decodeEntities(s).split('\n').map((l) => {
    const cells = l.split(CELL);
    if (cells.length === 1) return clean(l);
    if (cells.at(-1).trim() === '') cells.pop();
    const c = cells.map(clean);
    return c.some(Boolean) ? c.join(' | ').replace(/ {2,}/g, ' ').trim() : '';
  }).filter(Boolean);
}

// ---- eAIP index -----------------------------------------------------------------------------------------------
// Rows of the three tables "Currently Effective Issue", "Next Issues", "Expired Issues (Archives)": effective date
// (the link to <YYYY-MM-DD>-AIRAC/html/index-en-GB.html), publication date, short description with the AMDT number
// ("This Package Contains AIRAC AIP AMDT 12/26"; "NIL AIRAC AIP AMDT 10/23 (...)" when the package holds no AMDT).
export function parseIndex(html) {
  const h = stripScripts(html);
  const heads = [...h.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((m) => ({ i: m.index, t: inlineText(m[1]) }));
  const statusAt = (pos) => {
    let s = null;
    for (const x of heads) if (x.i < pos) {
      if (/currently\s+effective/i.test(x.t)) s = 'current'; else if (/next\s+issue/i.test(x.t)) s = 'next'; else if (/expired|archive/i.test(x.t)) s = 'expired';
    }
    return s;
  };
  const out = [], seen = new Set(), warnings = [];
  const parts = h.split(/(?=<tr\b)/i);
  let pos = 0;
  for (const p of parts) {
    const a = /<a\b[^>]*href="((\d{4}-\d{2}-\d{2})[^"/]*)\/html\/index[^"]*"[^>]*>([\s\S]*?)<\/a>/i.exec(p);
    if (a && isDate(a[2]) && !seen.has(a[2])) {
      const tds = [...p.matchAll(/<td\b[^>]*>([\s\S]*?)(?=<\/td>|<td\b|<\/tr>|$)/gi)].map((m) => inlineText(m[1]));
      const desc = tds[2] ?? '', shown = parseDMY(inlineText(a[3]));
      if (shown && shown !== a[2]) warnings.push(`${a[2]}: link text says ${inlineText(a[3])}`);
      const amdt = /AMDT\s+(\d{1,2}\/\d{2})/i.exec(desc);
      seen.add(a[2]);
      out.push({ effective: a[2], published: parseDMY(tds[1]), amdt: amdt ? amdt[1] : null, nil: /^\s*NIL\b/i.test(desc),
        description: desc, status: statusAt(pos + a.index), folder: a[1] });
    }
    pos += p.length;
  }
  return { editions: out, warnings };
}

// ---- package cover, SUP and AIC lists, item pages -------------------------------------------------------------
// An item's id from its URL: eSUP/VT-eSUP-26-25-A-en-GB.html is SUP A25/26, eAIC/VT-eAIC-26-07-en-GB.html AIC 07/26;
// folder is the path segment the item lives in (2026-07-24, or 2026-12-24-AIRAC for an AIRAC SUP).
export function itemFromUrl(u) {
  let m = /\/((\d{4}-\d{2}-\d{2})[^/]*)\/html\/eSUP\/VT-eSUP-(\d{2})-(\d{1,3})-([A-Za-z])-en-GB\.html/.exec(u);
  if (m) { const s = m[5].toUpperCase(), n = m[4].padStart(2, '0'); return { kind: 'sup', series: s, number: n, year: m[3], id: `${s}${n}/${m[3]}`, folder: m[1], date: m[2] }; }
  m = /\/((\d{4}-\d{2}-\d{2})[^/]*)\/html\/eAIC\/VT-eAIC-(\d{2})-(\d{1,3})-en-GB\.html/.exec(u);
  if (m) { const n = m[4].padStart(2, '0'); return { kind: 'aic', series: '', number: n, year: m[3], id: `${n}/${m[3]}`, folder: m[1], date: m[2] }; }
  return null;
}
// cover VT-cover-en-GB.html: "Effective date: 26 NOV 2026", "Publication date: ...", the AMDT and the list of the SUPs
// and AICs issued with the package (<li>AIRAC AIP SUP <a href="../../2026-11-26-AIRAC/html/eSUP/...">B27/26</a></li>).
// An entry without a link ("<li>AIP SUP A42/26</li>") keeps its id from the text, with url null and nolink true.
const idFromText = (t) => {
  const m = /\b(SUP|AIC)\s*([AB]?)\s*(\d{1,3})\/(\d{2})\b/i.exec(t);
  if (!m) return null;
  const kind = m[1].toLowerCase(), series = kind === 'sup' ? m[2].toUpperCase() : '', number = m[3].padStart(2, '0');
  return { kind, series, number, year: m[4], id: `${series}${number}/${m[4]}`, url: null, nolink: true };
};
export function parseCover(html, url) {
  const h = stripScripts(html), t = inlineText(h);
  const items = [];
  for (const li of h.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const a = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(li[1]);
    if (!a) {
      const text = inlineText(li[1]), it = idFromText(text);
      if (it) items.push({ ...it, airac: /AIRAC/i.test(text), text, title: '' });
      continue;
    }
    const abs = new URL(decodeEntities(a[1]), url).href, it = itemFromUrl(abs), label = inlineText(li[1].slice(0, a.index));
    const kind = it?.kind ?? (/\bSUP\b/i.test(label) ? 'sup' : /\bAIC\b/i.test(label) ? 'aic' : null);
    if (!kind) continue;
    items.push({ ...(it ?? { kind, id: inlineText(a[2]) }), kind, airac: /AIRAC/i.test(label), url: abs, text: inlineText(a[2]), title: '' });
  }
  const amdt = /AMDT\s+(\d{1,2}\/\d{2})/i.exec(t);
  return { effective: parseDMY(/Effective date:\s*([^<\n]+)/i.exec(h)?.[1]), published: parseDMY(/Publication date:\s*([^<\n]+)/i.exec(h)?.[1]),
    amdt: amdt ? amdt[1] : null, items };
}
// eSUP/VT-eSUPs-en-GB.html and eAIC/VT-eAICs-en-GB.html: "Published as of 12 NOV 2026", series headings
// (<div class="H1">... Series: A</div>) and one <div class="SUP-Subject-..." title="Published on 17 SEP 2026"> per item
// with <a href="../../../<folder>/html/eSUP/..."><strong>25/26</strong></a> <span>TITLE</span>
export function parseItemList(html, url, kind) {
  const h = stripScripts(html), items = [];
  let series = '';
  const re = /<div\b[^>]*class="H1"[^>]*>([\s\S]*?)<\/div>|<div\b[^>]*class="(?:SUP|AIC)-Subject-[^"]*"([^>]*)>([\s\S]*?)<\/div>/gi;
  for (const m of h.matchAll(re)) {
    if (m[1] !== undefined) { series = /Series:\s*([A-Z])\b/.exec(inlineText(m[1]))?.[1] ?? ''; continue; }
    const a = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(m[3]);
    const published = parseDMY(/Published on ([^"]+)/i.exec(m[2])?.[1]);
    if (!a) {   // no link: the id from the first NN/YY of the text, the rest is the title
      const text = inlineText(m[3]), nn = /^\D{0,12}?(\d{1,3})\/(\d{2})\b\s*/.exec(text);
      if (!nn) continue;
      const se = kind === 'sup' ? series : '';
      items.push({ kind, id: `${se}${nn[1].padStart(2, '0')}/${nn[2]}`, series: se, number: nn[1].padStart(2, '0'), year: nn[2], url: null, nolink: true, title: text.slice(nn[0].length), published });
      continue;
    }
    const abs = new URL(decodeEntities(a[1]), url).href, it = itemFromUrl(abs), shown = inlineText(a[2]);
    const nn = /^(\d{1,3})\/(\d{2})$/.exec(shown);
    const id = it?.id ?? (nn ? `${kind === 'sup' ? series : ''}${nn[1].padStart(2, '0')}/${nn[2]}` : shown);
    items.push({ ...(it ?? {}), kind, id, series: it?.series ?? (kind === 'sup' ? series : ''), url: abs,
      title: inlineText(m[3].slice(a.index + a[0].length)), published });
  }
  return { asOf: parseDMY(/Published as of ([^<]+)/i.exec(h)?.[1]), items };
}
// one SUP or AIC page (<title>SUP 36 26 TITLE</title>, meta EM.effectiveDateStart / EM.effectiveDateEnd)
export function parseItemPage(html) {
  const h = String(html), meta = (n) => decodeEntities(new RegExp(`<meta\\b[^>]*name="${n}"[^>]*content="([^"]*)"|<meta\\b[^>]*content="([^"]*)"[^>]*name="${n}"`, 'i').exec(h)?.slice(1).find((x) => x !== undefined) ?? '');
  const title = inlineText(/<title>([\s\S]*?)<\/title>/i.exec(h)?.[1] ?? '').replace(/^(?:AIP\s+)?(?:SUP|AIC)\s+\d{1,3}\s+\d{2}\s*/i, '');
  const end = meta('EM.effectiveDateEnd').trim();
  return { title, effective: isDate(meta('EM.effectiveDateStart')) ? meta('EM.effectiveDateStart') : parseDMY(meta('EM.effectiveDateStart')),
    until: /^(UFN|PERM)$/i.test(end) ? end.toUpperCase() : parseDMY(end) ?? (isDate(end) ? end : null), published: meta('DC.date') || null,
    series: meta('EM.series'), number: meta('EM.number'), year: meta('EM.year'), type: meta('EM.documentType') };
}

// ---- amendment list -------------------------------------------------------------------------------------------
// eAIP/VT-AMDT-en-GB.html lists every change of the package, grouped by part and page; an AD 2 VTBD change shows as
// the group AD-2.VTBD, as details ids ...-VTBD-AD-2.<n>details and as links to VT-AD-2.VTBD-en-GB.html?amdt=show#ID_.
export function parseAmdt(html, icao = 'VTBD') {
  const h = stripScripts(html), q = icao.replace(/[^A-Z]/g, '');
  const secs = new Set([...h.matchAll(new RegExp(`${q}-AD-2\\.(\\d+)details`, 'g'))].map((m) => +m[1]));
  const links = (h.match(new RegExp(`VT-AD-2\\.${q}-en-GB\\.html`, 'g')) || []).length;
  const group = new RegExp(`AD-2\\.${q}(?:plus|details)\\b`).test(h);
  const text = inlineText(h);
  return { effective: parseDMY(/Effective\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4})/i.exec(text)?.[1]), namesAd2: group || links > 0 || secs.size > 0,
    sections: [...secs].sort((a, b) => a - b).map((n) => `AD 2.${n}`), links,
    mentions: (text.match(new RegExp(`\\b${q}\\b|DON\\s*MUEANG`, 'gi')) || []).length };
}

// ---- AD 2 VTBD: sections and comparison -----------------------------------------------------------------------
// Sections are the top-level <div id="VTBD-AD-2.<n>"> (AD 2.1 ... AD 2.24 in 2026, AD 2.25 when there is one; AD 2.24
// is the charts list); sub-items (VTBD-AD-2.20.3.1 ...) belong to their section. 'head' is what stands before AD 2.1
// (the aerodrome's name) with the edition's own dates and AMDT number replaced, the only header the HTML page has.
// sections: lines (htmlLines) for the facts; rows: one line per table row (htmlRows) for compareAd2. A section id that
// comes twice (a broken page) keeps the content of both blocks and is listed in duplicates.
export function splitAd2(html, { icao = 'VTBD', edition = null } = {}) {
  const h = stripScripts(html), body = h.slice(Math.max(0, h.search(/<body\b/i)));
  const re = new RegExp(`<div\\b[^>]*\\bid="${icao}-AD-2\\.(\\d+)"`, 'g'), pos = [];
  for (const m of body.matchAll(re)) pos.push([`AD 2.${m[1]}`, m.index]);
  const sections = {}, rows = {}, duplicates = [];
  for (let i = 0; i < pos.length; i++) {
    const [k, at] = pos[i], part = body.slice(at, i + 1 < pos.length ? pos[i + 1][1] : undefined);
    if (k in sections) { duplicates.push(k); sections[k].push(...htmlLines(part)); rows[k].push(...htmlRows(part)); continue; }
    sections[k] = htmlLines(part); rows[k] = htmlRows(part);
  }
  let head = pos.length ? htmlLines(body.slice(0, pos[0][1])) : [];
  if (edition) {
    const own = [edition.effective, edition.published].filter(isDate).flatMap((d) => [fmtDMY(d), d]);
    if (edition.amdt) own.push(`AMDT ${edition.amdt}`);
    head = head.map((l) => own.reduce((s, x) => s.split(x).join('<edition>'), l));
  }
  return { head, sections, rows, duplicates, order: Object.keys(sections).sort(secCmp) };
}
export const secCmp = (a, b) => (+a.replace(/\D+/g, '') - +b.replace(/\D+/g, '')) || a.localeCompare(b);
// Lines equal after folding differ only by letter case or by spacing (spacing between two digits still counts):
// "Dimensions of RWY(M)" (29 OCT 2026) and "Dimensions of RWY (m)" (26 NOV 2026). Reported as 'cosmetic', never hidden.
export const foldLines = (lines) => lines.join(' ').toLowerCase().replace(/(\d)\s+(?=\d)/g, '$1\u0001').replace(/\s+/g, '').replace(/\u0001/g, ' ');

// Myers' O(ND) line diff (E. Myers, "An O(ND) difference algorithm and its variations", Algorithmica 1, 1986)
export function diffLines(a, b) {
  const n = a.length, m = b.length, max = n + m, off = max + 1, trace = [];
  const v = new Int32Array(2 * max + 3);
  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[off + k - 1] < v[off + k + 1]) ? v[off + k + 1] : v[off + k - 1] + 1, y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[off + k] = x;
      if (x >= n && y >= m) break outer;
    }
  }
  const ops = [];
  let x = n, y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const t = trace[d], k = x - y;
    const pk = k === -d || (k !== d && t[off + k - 1] < t[off + k + 1]) ? k + 1 : k - 1, px = t[off + pk], py = px - pk;
    while (x > px && y > py) { ops.push(['=', a[x - 1]]); x--; y--; }
    if (d > 0) { if (x === px) ops.push(['+', b[y - 1]]); else ops.push(['-', a[x - 1]]); }
    x = px; y = py;
  }
  return ops.reverse();
}
// unified-style text of a diff with `ctx` lines of context around each change
export function diffText(ops, ctx = 1) {
  const keep = ops.map(() => false);
  ops.forEach(([o], i) => { if (o !== '=') for (let j = Math.max(0, i - ctx); j <= Math.min(ops.length - 1, i + ctx); j++) keep[j] = true; });
  const out = [];
  ops.forEach(([o, l], i) => { if (keep[i]) out.push(`${o === '=' ? ' ' : o} ${l}`); else if (i > 0 && keep[i - 1]) out.push('  ...'); });
  return out;
}
// Section by section: 'same' (every line equal), 'cosmetic' (equal after foldLines), 'changed', 'added', 'removed'.
// Table rows are compared whole (splitAd2 rows), so that a value that moves between cells is a change.
export function compareAd2(base, next) {
  const keys = [...new Set([...base.order, ...next.order, 'head'])].sort((a, b) => (a === 'head' ? -1 : b === 'head' ? 1 : secCmp(a, b)));
  const of = (x, k) => (k === 'head' ? x.head : (x.rows ?? x.sections)[k]);
  return keys.map((k) => {
    const a = of(base, k), b = of(next, k);
    if (!a) return { section: k, status: 'added', added: b, removed: [], diff: b.map((l) => `+ ${l}`) };
    if (!b) return { section: k, status: 'removed', added: [], removed: a, diff: a.map((l) => `- ${l}`) };
    if (a.length === b.length && a.every((l, i) => l === b[i])) return { section: k, status: 'same', added: [], removed: [], diff: [] };
    const ops = diffLines(a, b);
    return { section: k, status: foldLines(a) === foldLines(b) ? 'cosmetic' : 'changed',
      added: ops.filter((o) => o[0] === '+').map((o) => o[1]), removed: ops.filter((o) => o[0] === '-').map((o) => o[1]), diff: diffText(ops) };
  });
}

// ---- facts of the fixture against an edition's text ----------------------------------------------------------
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// a number as the AIP prints it: optional leading zeros (029.00°), trailing zeros (2.0, 243.0), a space or comma between
// thousands (2 850m, 1,093 ft); never a part of a longer number
export function numSrc(v) {
  const [i, f] = String(Math.abs(v)).split('.');
  const g = i.length > 3 ? i.replace(/\B(?=(\d{3})+$)/g, '[ ,]?') : i;
  return `(?<![\\d.])0*${f ? `${g}\\.${f}0*` : `${g}(?:\\.0+)?`}(?!\\.?\\d)`;
}
// 135349.24N 1003545.38E with any spacing inside or between the two parts
export const dmsSrc = (s) => String(s).trim().split(/\s+/).map((p) => p.split('').map(esc).join('\\s*')).join('\\s*');
// words with any spacing; a roman numeral also matches the eAIP's "ll" for II (AD 2.19 prints "ILS CAT ll")
export const wordsSrc = (s) => String(s).trim().split(/\s+/).map((t) => (/^I{1,3}$/.test(t) ? `[Il]{${t.length}}(?![Il])` : esc(t))).join('\\s*');
const RX = (src) => new RegExp(src, 'i');
const colourSrc = (c) => c.split('/').map((w) => esc(w)).join('\\s*\\/\\s*');

// every leaf of the fixture: [path, value] with paths like ends.03L.thr.dms, runways.03L/21R.cwy_m[0]
export function leafPaths(o, pre = '') {
  if (o === null || typeof o !== 'object') return [[pre, o]];
  const out = [];
  if (Array.isArray(o)) o.forEach((v, i) => out.push(...leafPaths(v, `${pre}[${i}]`)));
  else for (const [k, v] of Object.entries(o)) out.push(...leafPaths(v, pre ? `${pre}.${k}` : k));
  return out;
}
// leaves that no AD 2 text can confirm, each with its reason (the report lists them; nothing is skipped silently)
export const NOT_TEXT = [
  [/^meta\./, 'meta', 'record of the cycle, its sources and checks; not an AIP value'],
  [/(^|\.)(src|conf|note|est_note|sources|wmm_src)(\[\d+\])?$/, 'meta', 'source code, confidence or note of the fixture'],
  [/_20260514/, 'earlier', 'value of AIRAC 14 MAY 2026, printed rounded since 29 OCT 2026 (research 5d-aip-update.md U1)'],
  [/\.dist_from_thr_est_m\./, 'estimate', 'estimate: AD 2.14 publishes the MEHT, not the distance'],
  [/^magvar\.wmm2025_deg\./, 'other', 'World Magnetic Model 2025, not the AIP'],
  [/\.(lat|lon)$|\.en\[\d\]$/, 'derived', 'decimal or local form of the dms coordinates checked beside it'],
  [/\.(radius_m|meht_m|gp_origin_from_thr_m|true_brg_from_coords|thr_to_opp_thr_m)$/, 'derived', 'computed by the repo from published values'],
  [/^magvar\.(pub_deg|annual_change_deg_per_yr)$/, 'derived', 'decimal form of pub_text / annual_text'],
  [/^ends\.[^.]+\.approach\.(vpa_deg|tch_ft)$/, 'chart', 'read from the approach chart (a PDF listed in AD 2.24), not printed in the AD 2 text'],
];

// The facts: every value of the fixture that the simulator relies on, each with the AD 2 section it is printed in and
// a pattern built from the fixture's own value (no number is typed here). Rows of a table are cut at the line that
// holds the runway designator; AD 2.12 items 7-14 (no designator) at the slope of each end, in the fixture's order.
export function buildFacts(fx) {
  const F = [], add = (id, section, paths, test) => F.push({ id, section, paths: [].concat(paths), test });
  const RW = Object.keys(fx.runways ?? {}), ENDS = RW.flatMap((r) => r.split('/')), rwOf = (e) => RW.find((r) => r.split('/').includes(e));
  const has = (text, src, what) => (RX(src).test(text) ? true : `${what} not found`);
  // id -> its row: the designator line up to the next designator line, or up to the first header line of the table
  // that follows (AD 2.12 prints items 7-14 as a second table without designators: "Slope of RWY-SWY" ...)
  const STOP = { 'AD 2.12': /^Slope\s+of\s+RWY/i };
  const rows = (lines, ids, stop = null) => {
    const out = {}; let cur = null;
    for (const l of lines) {
      if (ids.includes(l)) { cur = l in out ? null : l; if (cur) out[cur] = ''; continue; }
      if (stop?.test(l)) cur = null;
      if (cur) out[cur] += l + '\n';
    }
    return out;
  };
  const row = (S, sec, e) => rows(S(sec).lines, ENDS, STOP[sec])[e];
  const inRow = (sec, e, src, what) => (S) => { const r = row(S, sec, e); return r === undefined ? `row ${e} not found` : has(r, src, what); };

  // AD 2.2
  const P = fx.arp?.published_current;
  if (P) add('ARP coordinates', 'AD 2.2', 'arp.published_current.dms', (S) => has(S('AD 2.2').text, dmsSrc(P.dms), P.dms));
  if (fx.arp?.site) {
    const m = /RWY\s+(\S+),\s*(\d+)\s*m from THR RWY\s+(\S+)/i.exec(fx.arp.site);
    add('ARP site', 'AD 2.2', 'arp.site', (S) => (m ? has(S('AD 2.2').text, `RWY\\s*${esc(m[1])}\\s*,\\s*${numSrc(m[2])}\\s*m\\s*from\\s*THR\\s*RWY\\s*${esc(m[3])}`, fx.arp.site) : 'fixture text not understood'));
  }
  if (fx.elevation) add('aerodrome elevation', 'AD 2.2', ['elevation.current_m', 'elevation.current_ft'],
    (S) => has(S('AD 2.2').text, `${numSrc(fx.elevation.current_m)}\\s*m\\s*\\(\\s*${numSrc(fx.elevation.current_ft)}\\s*ft\\s*\\)`, `${fx.elevation.current_m} m (${fx.elevation.current_ft} ft)`));
  if ('ref_temp_c' in fx) add('reference temperature', 'AD 2.2', 'ref_temp_c', (S) => has(S('AD 2.2').text, `${numSrc(fx.ref_temp_c)}\\s*°\\s*C`, `${fx.ref_temp_c}°C`));
  if ('geoid_undulation_m' in fx) add('geoid undulation', 'AD 2.2', 'geoid_undulation_m', (S) => has(S('AD 2.2').text,
    `Geoid\\s*Undulation[^\\n]*\\n\\s*${fx.geoid_undulation_m === null ? 'NIL\\b' : `${numSrc(fx.geoid_undulation_m)}\\s*m`}`, `geoid undulation ${fx.geoid_undulation_m ?? 'NIL'}`));
  if (fx.magvar) {
    const a = /^(\d+)\s+(\d+)\s+([EW])\s+\((\d{4})\)$/.exec(fx.magvar.pub_text ?? ''), b = /^(\d+)\s+(\d+)\s+([EW])$/.exec(fx.magvar.annual_text ?? '');
    const dm = (d, mi, hs) => `${numSrc(+d)}\\s*°\\s*${numSrc(+mi)}\\s*['′’]\\s*${hs}`;
    add('magnetic variation and annual change', 'AD 2.2', ['magvar.pub_text', 'magvar.annual_text'], (S) => (a && b
      ? has(S('AD 2.2').text, `${dm(a[1], a[2], a[3])}\\s*\\(\\s*${a[4]}\\s*\\)\\s*\\/\\s*${dm(b[1], b[2], b[3])}`, `${fx.magvar.pub_text} / ${fx.magvar.annual_text}`)
      : 'fixture text not understood'));
  }

  // AD 2.10 obstacles, in the fixture's order: each row is the text between the coordinates of the row before and its own
  (fx.obstacles_ad2_10 ?? []).forEach((o, i) => {
    const p = `obstacles_ad2_10[${i}]`;
    const chunk = (S) => {
      const t = S('AD 2.10').text; let from = 0;
      for (let j = 0; j <= i; j++) {
        const m = RX(dmsSrc(fx.obstacles_ad2_10[j].dms)).exec(t.slice(from));
        if (!m) return null;
        if (j === i) return t.slice(from, from + m.index);
        from += m.index + m[0].length;
      }
      return null;
    };
    const t = (fn) => (S) => { const c = chunk(S); return c === null ? `obstacle ${o.dms} not found` : fn(c); };
    add(`obstacle ${i + 1} coordinates`, 'AD 2.10', `${p}.dms`, t(() => true));
    add(`obstacle ${i + 1} type`, 'AD 2.10', `${p}.type`, t((c) => has(c, wordsSrc(o.type), o.type)));
    add(`obstacle ${i + 1} height`, 'AD 2.10', `${p}.hgt_m`, t((c) => has(c, `HGT\\s*${numSrc(o.hgt_m)}\\s*m`, `HGT ${o.hgt_m} m`)));
    add(`obstacle ${i + 1} marking and lighting`, 'AD 2.10', [`${p}.lgt`, `${p}.marked`], t((c) => {
      const lit = /\bLighted\b/i.test(c), marked = /\bMarked\b/i.test(c);
      return lit === !!o.lgt && marked === !!o.marked ? true : `text: ${marked ? 'marked' : 'not marked'}, ${lit ? 'lighted' : 'not lighted'}`;
    }));
  });

  // AD 2.12 rows 1-6 (designator, bearing, dimensions, PCR and surface, THR coordinates, THR elevation)
  for (const e of ENDS) {
    const E = fx.ends[e], R = fx.runways[rwOf(e)], rp = `runways.${rwOf(e)}`;
    if (!E) continue;
    add(`THR ${e} coordinates`, 'AD 2.12', `ends.${e}.thr.dms`, inRow('AD 2.12', e, dmsSrc(E.thr.dms), E.thr.dms));
    add(`RWY ${e} true bearing`, 'AD 2.12', `ends.${e}.true_brg_pub`, inRow('AD 2.12', e, `${numSrc(E.true_brg_pub)}\\s*°`, `${E.true_brg_pub}°`));
    add(`THR ${e} elevation`, 'AD 2.12', [`ends.${e}.thr_elev_m`, `ends.${e}.thr_elev_ft`],
      inRow('AD 2.12', e, `THR\\s*${numSrc(E.thr_elev_m)}\\s*m\\s*\\/\\s*${numSrc(E.thr_elev_ft)}`, `THR ${E.thr_elev_m} m/${E.thr_elev_ft}`));
    add(`RWY ${e} length and width`, 'AD 2.12', [`${rp}.len_m`, `${rp}.wid_m`], inRow('AD 2.12', e, `${numSrc(R.len_m)}\\s*[x×]\\s*${numSrc(R.wid_m)}`, `${R.len_m}x${R.wid_m}`));
    const pcr = String(R.pcr ?? '').match(/PCR\s*\d+(?:\/[A-Z]){4}/g) ?? [];
    add(`RWY ${e} PCR`, 'AD 2.12', `${rp}.pcr`, (S) => (pcr.length ? pcr.map((c) => inRow('AD 2.12', e, wordsSrc(c.replace('PCR', 'PCR ')), c)(S)).find((r) => r !== true) ?? true : 'fixture text not understood'));
    add(`RWY ${e} surface`, 'AD 2.12', `${rp}.surface`, (S) => {
      const s = String(R.surface ?? ''), first = /^(\w+)/.exec(s)?.[1];
      const c = /concrete (\d+) m from THR (\S+) end and (\d+) m from THR (\S+) end/i.exec(s);
      const need = [[first ? esc(first) : '(?!)', first]];
      if (c) {
        const [n1, n2] = c[2] === e ? [c[1], c[3]] : c[4] === e ? [c[3], c[1]] : [null, null];
        if (n1 === null) return 'fixture text not understood';
        need.push([`${numSrc(n1)}\\s*m\\s*FM\\s*THR\\s*and\\s*${numSrc(n2)}\\s*m\\s*RWY\\s*ends`, `${n1} m FM THR and ${n2} m RWY ends`], ['Concrete', 'Concrete']);
      } else if (/concrete/i.test(s)) return 'fixture text not understood';
      return need.map(([src, w]) => inRow('AD 2.12', e, src, w)(S)).find((r) => r !== true) ?? true;
    });
  }
  // AD 2.12 rows 7-14: anchored on each end's slope ("-0.05% 0% -0.05% (350m 2 850m 500m)"), then SWY, CWY, strip, RESA
  const slopeSrc = (s) => {
    const parts = String(s ?? '').split(',').map((x) => /^([+-]?)(\d+(?:\.\d+)?)%\s+(\d+)\s*m$/.exec(x.trim()));
    if (!parts.length || parts.some((x) => !x)) return null;
    return parts.map(([, sg, v]) => `${sg === '-' ? '-\\s*' : sg === '+' ? '\\+\\s*' : '(?<![-+]\\s*)'}${numSrc(v)}\\s*%`).join('\\s*')
      + `\\s*\\(\\s*${parts.map(([, , , l]) => `${numSrc(l)}\\s*m`).join('\\s*')}\\s*\\)`;
  };
  const segs = (S) => {   // end -> text after its slope up to the next end's slope
    const t = S('AD 2.12').text, at = {}; let from = 0;
    for (const e of ENDS) {
      const src = slopeSrc(fx.runways[rwOf(e)]?.slope?.[e]);
      const m = src && RX(src).exec(t.slice(from));
      if (m) { at[e] = [from + m.index, from + m.index + m[0].length]; from += m.index + m[0].length; }
    }
    const ks = ENDS.filter((e) => e in at), out = {};
    ks.forEach((e, j) => { out[e] = t.slice(at[e][1], j + 1 < ks.length ? at[ks[j + 1]][0] : undefined); });
    return out;
  };
  for (const e of ENDS) {
    const r = rwOf(e), R = fx.runways[r], k = r.split('/').indexOf(e), rp = `runways.${r}`;
    const inSeg = (fn) => (S) => { const g = segs(S)[e]; return g === undefined ? `slope of RWY ${e} not found` : fn(g); };
    if (R.slope?.[e] !== undefined) add(`RWY ${e} slope`, 'AD 2.12', `${rp}.slope.${e}`, inSeg(() => (slopeSrc(R.slope[e]) ? true : 'fixture text not understood')));
    if (R.swy !== undefined) add(`RWY ${e} stopway`, 'AD 2.12', `${rp}.swy`, inSeg((g) => has(g, `^\\s*${R.swy === 'NIL' ? 'NIL\\b' : wordsSrc(R.swy)}`, `SWY ${R.swy}`)));
    if (R.cwy_m?.[k] !== undefined) add(`RWY ${e} clearway`, 'AD 2.12', `${rp}.cwy_m[${k}]`, inSeg((g) => has(g, `${numSrc(R.cwy_m[k])}\\s*[x×]\\s*\\d+`, `CWY ${R.cwy_m[k]} m`)));
    if (R.strip_m) add(`RWY ${e} strip`, 'AD 2.12', [`${rp}.strip_m[0]`, `${rp}.strip_m[1]`], inSeg((g) => has(g, `${numSrc(R.strip_m[0])}\\s*[x×]\\s*${numSrc(R.strip_m[1])}`, `strip ${R.strip_m.join('x')}`)));
    if (R.resa_m?.[e]) add(`RWY ${e} RESA`, 'AD 2.12', [`${rp}.resa_m.${e}[0]`, `${rp}.resa_m.${e}[1]`], inSeg((g) => has(g, `${numSrc(R.resa_m[e][0])}\\s*[x×]\\s*${numSrc(R.resa_m[e][1])}`, `RESA ${R.resa_m[e].join('x')}`)));
  }

  // AD 2.13 declared distances: the first four numbers of the row, and the displaced threshold as TORA - LDA
  const declared = (S, e) => { const r = row(S, 'AD 2.13', e); if (r === undefined) return null; const n = r.split('\n').filter((l) => /^\d[\d ,]*$/.test(l)).slice(0, 4).map((l) => +l.replace(/[ ,]/g, '')); return n.length === 4 ? n : null; };
  for (const e of ENDS) {
    const D = fx.ends[e]?.declared;
    if (!D) continue;
    ['tora', 'toda', 'asda', 'lda'].forEach((k, j) => add(`${e} ${k.toUpperCase()}`, 'AD 2.13', `ends.${e}.declared.${k}`, (S) => {
      const n = declared(S, e); return !n ? `row ${e} not read` : n[j] === D[k] ? true : `text ${n[j]} m, fixture ${D[k]} m`;
    }));
    if ('disp_m' in fx.ends[e]) add(`THR ${e} displacement (TORA - LDA)`, 'AD 2.13', `ends.${e}.disp_m`, (S) => {
      const n = declared(S, e); return !n ? `row ${e} not read` : n[0] - n[3] === fx.ends[e].disp_m ? true : `text TORA - LDA = ${n[0] - n[3]} m, fixture ${fx.ends[e].disp_m} m`;
    });
  }

  // AD 2.14 lights: approach lights, PAPI and MEHT, TDZ, centre line and edge lights (colours by distance)
  const lightSrcs = (s) => {   // "3700 m, 60 m, white; yellow last 600 m; LIH" -> patterns as AD 2.14 prints them
    const segsL = String(s).split(';').map((x) => x.trim()).filter(Boolean), out = [];
    const f = /^(\d+)\s*m,\s*(\d+)\s*m(?:,\s*([a-z/]+))?$/i.exec(segsL[0] ?? '');
    if (!f) return null;
    const L = +f[1];
    out.push([`${numSrc(f[1])}\\s*m\\s*,\\s*${numSrc(f[2])}\\s*m${f[3] ? `\\s*${colourSrc(f[3])}` : ''}`, segsL[0]]);
    for (const c of segsL.slice(1).flatMap((x) => x.split(/,\s*(?![^(]*\))/)).map((x) => x.trim())) {
      let m;
      if (/^LI[HML]$/i.test(c)) out.push([esc(c), c]);
      else if ((m = /^([a-z/]+) from (\d+) m$/i.exec(c))) out.push([`FM\\s*${numSrc(m[2])}\\s*m[^;]{0,24}?${colourSrc(m[1])}`, c]);
      else if ((m = /^([a-z/]+) last (\d+) m$/i.exec(c))) out.push([`FM\\s*${numSrc(L - +m[2])}\\s*m\\s*-\\s*${numSrc(L)}\\s*m\\s*${colourSrc(m[1])}`, c]);
      else if ((m = /^([a-z/]+) first (\d+) m(?:\s*\(.*\))?$/i.exec(c))) out.push([`${colourSrc(m[1])}\\s*[;,]?\\s*FM\\s*${numSrc(m[2])}\\s*m`, c]);
      else if ((m = /^([a-z/]+) (\d+)-(\d+) m$/i.exec(c))) out.push([`FM\\s*${numSrc(m[2])}\\s*m\\s*-\\s*${numSrc(m[3])}\\s*m\\s*${colourSrc(m[1])}`, c]);
      else return null;
    }
    return out;
  };
  const pairs = (r) => (r.match(/(?<![\d.])\d[\d ]*\s*m\s*,\s*\d+\s*m/g) ?? []).length;   // "3700 m, 60 m": length, spacing
  for (const e of ENDS) {
    const E = fx.ends[e], r = rwOf(e), R = fx.runways[r], ep = `ends.${e}`;
    if (!E) continue;
    if (E.als) {
      add(`${e} approach lights`, 'AD 2.14', [`${ep}.als.type`, `${ep}.als.len_m`, `${ep}.als.intensity`],
        inRow('AD 2.14', e, `${wordsSrc(E.als.type)}\\s*${numSrc(E.als.len_m)}\\s*m\\s*${esc(E.als.intensity ?? '')}`, `${E.als.type} ${E.als.len_m} m ${E.als.intensity ?? ''}`));
      if ('flg' in E.als) add(`${e} approach flashing lights`, 'AD 2.14', `${ep}.als.flg`,
        (S) => { const x = row(S, 'AD 2.14', e); return x === undefined ? `row ${e} not found` : /\bwith\s*FLG\b/i.test(x) === !!E.als.flg ? true : `text ${/FLG/i.test(x) ? 'has' : 'has no'} FLG`; });
    }
    if (E.papi) add(`${e} PAPI and MEHT`, 'AD 2.14', [`${ep}.papi.side`, `${ep}.papi.angle_deg`, `${ep}.papi.meht_ft`],
      inRow('AD 2.14', e, `PAPI\\s*${esc(E.papi.side)}\\s*${numSrc(E.papi.angle_deg)}\\s*°\\s*\\(\\s*${numSrc(E.papi.meht_ft)}\\s*ft\\s*\\)`, `PAPI ${E.papi.side} ${E.papi.angle_deg}° (${E.papi.meht_ft} ft)`));
    if ('tdz_lgt_m' in E && E.papi) add(`${e} touchdown zone lights`, 'AD 2.14', `${ep}.tdz_lgt_m`, inRow('AD 2.14', e,
      `\\(\\s*${numSrc(E.papi.meht_ft)}\\s*ft\\s*\\)\\s*${E.tdz_lgt_m > 0 ? `${numSrc(E.tdz_lgt_m)}\\s*m` : 'NIL\\b'}`, `TDZ ${E.tdz_lgt_m > 0 ? E.tdz_lgt_m + ' m' : 'NIL'}`));
    const lightFact = (what, key, s, count) => add(`${e} ${what}`, 'AD 2.14', `runways.${r}.${key}`, (S) => {
      const x = row(S, 'AD 2.14', e);
      if (x === undefined) return `row ${e} not found`;
      if (s === 'NIL') return pairs(x) === count ? true : `text has ${pairs(x)} length/spacing pairs, expected ${count} (no centre line lights)`;
      const L = lightSrcs(s);
      return L ? L.map(([src, w]) => has(x, src, w)).find((q) => q !== true) ?? true : 'fixture text not understood';
    });
    if (R.rcl !== undefined) lightFact('runway centre line lights', 'rcl', R.rcl, 1);
    const ek = R[`redl_${e}`] !== undefined ? `redl_${e}` : 'redl';
    if (R[ek] !== undefined) lightFact('runway edge lights', ek, R[ek], 0);
  }

  // AD 2.17 ATS airspace
  const Z = fx.atz;
  if (Z) {
    const T = (src, w) => (S) => has(S('AD 2.17').text, src, w);
    add('ATZ name', 'AD 2.17', 'atz.name', T(`${wordsSrc(String(Z.name).replace(/\s*ATZ$/, ''))}[^\\n]{0,60}?\\bATZ\\b`, Z.name));
    add('ATZ centre', 'AD 2.17', 'atz.centre', T(dmsSrc(Z.centre), Z.centre));
    add('ATZ radius', 'AD 2.17', 'atz.radius_nm', T(`radius\\s*${numSrc(Z.radius_nm)}\\s*NM`, `radius ${Z.radius_nm} NM`));
    add('ATZ upper limit', 'AD 2.17', 'atz.upper_ft_agl', T(`${numSrc(Z.upper_ft_agl)}\\s*ft\\s*\\/?\\s*AGL`, `${Z.upper_ft_agl} ft AGL`));
    add('ATZ class', 'AD 2.17', 'atz.class', T(`classification\\s*${esc(Z.class)}(?![A-Za-z])`, `class ${Z.class}`));
    add('transition altitude', 'AD 2.17', 'atz.transition_alt_ft', T(`Transition\\s*altitude\\s*${numSrc(Z.transition_alt_ft)}\\s*ft`, `${Z.transition_alt_ft} ft`));
  }

  // AD 2.18 frequencies, each in the row of its call sign (the row ends at its hours, H24). The emergency pair (note 1)
  // must stand in each row of the Don Mueang units that printed it in AD 2.18 of 29 OCT 2026: approach, arrival, tower.
  const CALL = { TWR: 'Don Mueang Tower', GND: 'Don Mueang Ground', DEL: 'Don Mueang Delivery', APP_DMK: 'Don Mueang Approach', ARR_DMK: 'Don Mueang Arrival', ATIS: 'ATIS' };
  const EMERGENCY_ROWS = ['APP_DMK', 'ARR_DMK', 'TWR'];
  const callRow = (t, k) => RX(`(?:^|\\n)${wordsSrc(CALL[k])}\\n([\\s\\S]*?)(?:\\nH24\\b|$)`).exec(t)?.[1];
  for (const [k, fs] of Object.entries(fx.comms_ad2_18 ?? {})) {
    if (!Array.isArray(fs)) continue;
    fs.forEach((f, j) => add(`AD 2.18 ${k} ${f} MHz`, 'AD 2.18', `comms_ad2_18.${k}[${j}]`, (S) => {
      const t = S('AD 2.18').text;
      if (k === 'emergency') {
        if (!/1\)\s*Emergency frequency/i.test(t)) return 'note "1) Emergency frequency" not found';
        const miss = EMERGENCY_ROWS.filter((u) => { const r = callRow(t, u); return r === undefined || !RX(`${numSrc(f)}\\s*MHz\\s*1\\)`).test(r); });
        return miss.length ? `${f} MHz 1) (emergency) not in the row of ${miss.map((u) => CALL[u]).join(', ')}` : true;
      }
      if (!CALL[k]) return `no call sign known for ${k}`;
      const r = callRow(t, k);
      return r !== undefined ? has(r, `${numSrc(f)}\\s*MHz`, `${f} MHz`) : `${CALL[k]} not found`;
    }));
  }

  // AD 2.19 navaids: blocks start at "ILS CAT ..." or at a navaid type line followed by its ident
  const blocks = (lines) => {
    const out = []; let cur = null;
    lines.forEach((l, i) => {
      const nav = Object.keys(fx.navaids ?? {}).find((n) => { const [ty, id] = n.split(/\s+/); return l === ty && lines[i + 1] === id; });
      if (/^ILS\b/.test(l) || nav) { cur = { nav: nav ?? null, lines: [] }; out.push(cur); }
      if (cur) cur.lines.push(l);
    });
    return out.map((b) => ({ ...b, text: b.lines.join('\n'), loc: /LOC\s*-?\s*\n?\s*(\d{2}[LRC]?)\b/.exec(b.lines.join('\n'))?.[1] ?? null }));
  };
  for (const [n, V] of Object.entries(fx.navaids ?? {})) {
    const np = `navaids.${n}`, inB = (src, w) => (S) => { const b = blocks(S('AD 2.19').lines).find((x) => x.nav === n); return b ? has(b.text, src, w) : `${n} not found`; };
    if (V.dms) add(`${n} position`, 'AD 2.19', `${np}.dms`, inB(dmsSrc(V.dms), V.dms));
    if (V.vor_mhz) add(`${n} frequency`, 'AD 2.19', `${np}.vor_mhz`, inB(`${numSrc(V.vor_mhz)}\\s*MHz`, `${V.vor_mhz} MHz`));
    if (V.dme_ch) add(`${n} DME channel`, 'AD 2.19', `${np}.dme_ch`, inB(`CH\\s*${esc(V.dme_ch)}\\b`, `CH ${V.dme_ch}`));
    if (V.hours) add(`${n} hours`, 'AD 2.19', `${np}.hours`, inB(`\\b${esc(V.hours)}\\b`, V.hours));
    if (V.dme_elev) {
      const m = /published (\d+(?:\.\d+)?) m \((\d+) ft\)/.exec(V.dme_elev);
      add(`${n} DME elevation`, 'AD 2.19', `${np}.dme_elev`, m ? inB(`${numSrc(m[1])}\\s*m\\s*\\(\\s*${numSrc(m[2])}\\s*ft\\s*\\)`, `${m[1]} m (${m[2]} ft)`) : () => 'fixture text not understood');
    }
    if (V.coverage_note) {
      const rs = [...V.coverage_note.matchAll(/(\d{3})-(\d{3}):\s*(?:not below\s*)?(\d+)\s*ft/g)], nm = /at (\d+) NM/.exec(V.coverage_note);
      add(`${n} coverage restrictions`, 'AD 2.19', `${np}.coverage_note`, (S) => {
        if (!rs.length || !nm) return 'fixture text not understood';
        const chk = [...rs.map((x) => [`Radial\\s*${numSrc(x[1])}\\s*°?\\s*-\\s*${numSrc(x[2])}\\s*°?[^\\n]{0,40}?${numSrc(x[3])}\\s*ft`, `${x[1]}-${x[2]}: ${x[3]} ft`]), [`${numSrc(nm[1])}\\s*NM`, `${nm[1]} NM`]];
        return chk.map(([src, w]) => inB(src, w)(S)).find((q) => q !== true) ?? true;
      });
    }
  }
  for (const e of ENDS) {
    const A = fx.ends[e]?.approach, ap = `ends.${e}.approach`;
    if (!A) continue;
    if (A.kind !== 'ILS') {
      add(`${e} ${A.kind} approach (no ILS in AD 2.19, chart in AD 2.24)`, 'AD 2.24', `${ap}.kind`, (S) => {
        if (blocks(S('AD 2.19').lines).some((b) => b.loc === e)) return `AD 2.19 lists an ILS for ${e}`;
        return has(S('AD 2.24').text, `${wordsSrc(A.kind)}\\s*RWY\\s*${esc(e)}\\b`, `${A.kind} RWY ${e} chart`);
      });
      continue;
    }
    const inI = (src, w) => (S) => { const b = blocks(S('AD 2.19').lines).find((x) => x.loc === e); return b ? has(b.text, src, w) : `ILS ${e} not found`; };
    const opp = rwOf(e).split('/').find((x) => x !== e);
    add(`${e} ILS`, 'AD 2.19', `${ap}.kind`, inI('^ILS\\b', 'ILS'));
    if (A.cat) add(`${e} ILS category`, 'AD 2.19', `${ap}.cat`, inI(`^ILS\\s*CAT\\s*${wordsSrc(A.cat)}`, `ILS CAT ${A.cat}`));
    if (A.ident) add(`${e} ILS ident and LOC frequency`, 'AD 2.19', [`${ap}.ident`, `${ap}.loc_mhz`], inI(`\\b${esc(A.ident)}\\s*${numSrc(A.loc_mhz)}\\s*MHz`, `${A.ident} ${A.loc_mhz} MHz`));
    if (A.gp_mhz) add(`${e} GP frequency`, 'AD 2.19', `${ap}.gp_mhz`, inI(`GP\\s*${esc(e)}\\s*${numSrc(A.gp_mhz)}\\s*MHz`, `GP ${e} ${A.gp_mhz} MHz`));
    if (A.dme_ch) add(`${e} DME channel`, 'AD 2.19', `${ap}.dme_ch`, inI(`CH\\s*${esc(A.dme_ch)}\\b`, `CH ${A.dme_ch}`));
    if (A.gp_deg) add(`${e} glide path angle`, 'AD 2.19', `${ap}.gp_deg`, inI(`Glide\\s*Path\\s*${numSrc(A.gp_deg)}\\s*°`, `Glide Path ${A.gp_deg}°`));
    if (A.rdh_ft) add(`${e} RDH`, 'AD 2.19', `${ap}.rdh_ft`, inI(`RDH\\)?\\s*is[^\\n]{0,24}?${numSrc(A.rdh_ft)}\\s*ft`, `RDH ${A.rdh_ft} ft`));
    if (A.rdh_m !== undefined) add(`${e} RDH in metres`, 'AD 2.19', `${ap}.rdh_m`, (S) => {
      const b = blocks(S('AD 2.19').lines).find((x) => x.loc === e);
      if (!b) return `ILS ${e} not found`;
      const m = /RDH\)?\s*is\s*(\d+(?:\.\d+)?)\s*m\b/i.exec(b.text);
      return m ? (+m[1] === A.rdh_m ? true : `text ${m[1]} m, fixture ${A.rdh_m} m`) : { status: 'derived', why: 'not printed; the fixture derives it from rdh_ft' };
    });
    if (A.loc_course_width_deg) add(`${e} LOC course width`, 'AD 2.19', `${ap}.loc_course_width_deg`, inI(`Course\\s*width\\s*${numSrc(A.loc_course_width_deg)}\\s*°`, `course width ${A.loc_course_width_deg}°`));
    // each antenna in its own row (GP and DME of 21R and 21L share coordinates): the row's first line, then at most four
    // short lines (frequency, channel, hours) before the coordinates
    const rowHead = { loc: `\\b${esc(A.ident ?? 'LOC')}`, gp: `(?:^|\\n)GP\\s*${esc(e)}`, dme: `(?:^|\\n)DME(?:\\s*${esc(e)})?` };
    for (const w of ['loc', 'gp', 'dme']) if (A[w]?.dms) add(`${e} ${w.toUpperCase()} position`, 'AD 2.19', `${ap}.${w}.dms`,
      inI(`${rowHead[w]}[ \\t]*\\n(?:[^\\n]{0,12}\\n){0,4}${dmsSrc(A[w].dms)}`, `${w.toUpperCase()} ${A[w].dms}`));
    if (A.dme_colocated) add(`${e} DME co-located`, 'AD 2.19', `${ap}.dme_colocated`, inI(`Co-?\\s*located\\s*with\\s*${esc(A.dme_colocated)}\\b`, `co-located with ${A.dme_colocated}`));
    if (A.pub_loc_from_opp_thr_m) add(`${e} LOC distance beyond THR ${opp}`, 'AD 2.19', `${ap}.pub_loc_from_opp_thr_m`, inI(`LOC\\s*${numSrc(A.pub_loc_from_opp_thr_m)}\\s*m\\.?[^\\n]{0,30}?from\\s*THR\\s*RWY\\s*${esc(opp)}\\b`, `LOC ${A.pub_loc_from_opp_thr_m} m from THR RWY ${opp}`));
    if (A.pub_gp_from_thr_m) add(`${e} GP distance from THR`, 'AD 2.19', `${ap}.pub_gp_from_thr_m`, inI(`GP\\s*${numSrc(A.pub_gp_from_thr_m)}\\s*m\\.?[^\\n]{0,30}?from\\s*THR\\s*RWY\\s*${esc(e)}\\b`, `GP ${A.pub_gp_from_thr_m} m from THR RWY ${e}`));
    if (A.pub_gp_offset_m) add(`${e} GP offset from the centre line`, 'AD 2.19', `${ap}.pub_gp_offset_m`, inI(`${numSrc(A.pub_gp_offset_m)}\\s*m\\.?[^\\n]{0,30}?from\\s*RWY\\s*centre\\s*line`, `${A.pub_gp_offset_m} m from RWY centre line`));
    if (A.remarks) add(`${e} ILS remarks`, 'AD 2.19', `${ap}.remarks`, (S) => {
      const out = [];
      for (const c of A.remarks.split(';').map((x) => x.trim())) {
        let m;
        if ((m = /^coverage (\d+) DME \((\w+)\) up to (\d+) ft (\w+)$/i.exec(c))) out.push([`coverage\\s*${numSrc(m[1])}\\s*DME\\s*\\(\\s*${esc(m[2])}\\s*\\)[^\\n]{0,24}?${numSrc(m[3])}\\s*ft\\s*\\/?\\s*${esc(m[4])}`, c]);
        else if ((m = /^GP unusable beyond (\d+) deg (right|left) of LOC course$/i.exec(c))) out.push([`GP\\s*unusable\\s*beyond\\s*${numSrc(m[1])}\\s*°\\s*${m[2]}`, c]);
        else return 'fixture text not understood';
      }
      return out.map(([src, w]) => inI(src, w)(S)).find((q) => q !== true) ?? true;
    });
  }
  return F;
}

// Run the facts on one edition's sections. Result per fact: status pass | fail | derived, and why when not pass.
export function checkFacts(fx, ad2) {
  const cache = {};
  const S = (k) => (cache[k] ??= { lines: ad2.sections[k] ?? [], text: (ad2.sections[k] ?? []).join('\n') });
  return buildFacts(fx).map((f) => {
    let r;
    try { r = f.test(S); } catch (e) { r = `error: ${e.message}`; }
    const status = r === true ? 'pass' : typeof r === 'object' && r ? r.status : 'fail';
    return { id: f.id, section: f.section, paths: f.paths, status, why: r === true ? '' : typeof r === 'object' && r ? r.why : String(r) };
  });
}
// every leaf of the fixture: checked by a fact (its result), or why no text can check it, or 'unclassified'
export function factCoverage(fx, results) {
  const by = new Map();
  for (const r of results) for (const p of r.paths) by.set(p, [...(by.get(p) ?? []), r]);
  return leafPaths(fx).map(([path, value]) => {
    const rs = by.get(path);
    if (rs) return { path, value, status: rs.some((r) => r.status === 'fail') ? 'fail' : rs.every((r) => r.status === 'derived') ? 'derived' : 'checked', facts: rs.map((r) => r.id) };
    const n = NOT_TEXT.find(([re]) => re.test(path));
    return n ? { path, value, status: n[1], why: n[2] } : { path, value, status: 'unclassified', why: 'no rule checks this value' };
  });
}

// ---- SUP / AIC titles and tools/watch/reviewed.json ------------------------------------------------------------
// Civil airports of AIP Thailand AD 2 other than VTBD, by the place names of the eAIP menu (AIRAC 26 NOV 2026). The
// military aerodromes of AD 2 are not listed by name: their titles carry the ICAO code (owner rule: code only).
export const AD2_NAMES = ['SUVARNABHUMI', 'CHIANG MAI', 'CHIANG RAI', 'MAE FAH LUANG', 'PHUKET', 'U-TAPAO', 'RAYONG', 'PATTAYA', 'HAT YAI',
  'BURI RAM', 'BURIRAM', 'CHUMPHON', 'KHON KAEN', 'KRABI', 'LAMPANG', 'LOEI', 'MAE HONG SON', 'PAI', 'NAKHON PHANOM',
  'NAKHON RATCHASIMA', 'NAKHON SI THAMMARAT', 'NAN', 'NARATHIWAT', 'PATTANI', 'PHETCHABUN', 'PHITSANULOK', 'PHRAE',
  'HUA HIN', 'RANONG', 'ROI ET', 'SAKON NAKHON', 'SUKHOTHAI', 'SURAT THANI', 'SAMUI', 'TAK', 'MAE SOT', 'TRANG',
  'TRAT', 'UBON RATCHATHANI', 'UDON THANI', 'BETONG'];
// a name as a whole word, any spacing or hyphen between its words; the lists sometimes lose the space before a word
// ("VICINITY OFEXAMPLE FIELD(VTZZ)"), so a name may also follow "OF" directly
const NAME_RE = new RegExp(`(?:(?<![A-Z])|(?<=OF))(?:${AD2_NAMES.map((n) => n.split(/[\s-]+/).join('[\\s-]*')).join('|')})(?![A-Z])`);
// From the title only: 'vtbd' (names VTBD or Don Mueang), 'other' (names another aerodrome, by an ICAO code VTxx or by
// a name of AD2_NAMES, and nothing in Bangkok or VTBD), 'unclear' (anything else: Bangkok FIR, GNSS, schedules,
// charges, health, and any "AIRPORT" or "HELIPORT" that names no aerodrome: such an item can concern VTBD).
export function classifyTitle(title) {
  const t = String(title ?? '').toUpperCase();
  if (!t.trim()) return 'unclear';
  if (/VTBD|DON\s*-?\s*MU(?:E)?ANG|DONMUEANG/.test(t)) return 'vtbd';
  if (/BANGKOK/.test(t)) return 'unclear';
  const codes = [...t.matchAll(/(?:^|[^A-Z])(VT[A-Z]{2})(?![A-Z])/g)].map((m) => m[1]);
  if (codes.some((c) => c !== 'VTBD') || NAME_RE.test(t)) return 'other';
  return 'unclear';
}
// Words that would name a military unit, school or academy (owner rule: such SUPs are written as their ICAO code only)
export const MILITARY_DENY = [/\bacadem(?:y|ies)\b/i, /\bschools?\b/i, /\bsquadrons?\b/i, /\bwing\s*\d+/i, /\b\d+\s*(?:st|nd|rd|th)\s+wing\b/i,
  /\bair\s*force\b/i, /\bair\s+(?:division|command)\b/i, /\bnavy\b|\bnaval\b/i, /\barmy\b/i, /\bregiment\b/i, /\bbattalion\b/i, /\bbrigade\b/i,
  /\bRTAF\b|\bRTN\b|\bRTA\b/i, /โรงเรียน/, /วิทยาลัย/, /สถาบันการบิน/, /กองบิน/, /ฝูงบิน/, /กองทัพ/, /กองพล/, /กองพัน/, /กรมทหาร/,
  /ทหาร(?:บก|เรือ|อากาศ)/, /นายเรืออากาศ/, /นักเรียนนาย/];
const ENTRY_KEYS = new Set(['read', 'basis', 'vtbd', 'note', 'folder', 'in', 'until', 'status', 'repo']);
const KEY_RE = { sup: /^[AB]\d{2}\/\d{2}$/, aic: /^\d{2}\/\d{2}$/ };
const norm = (s) => String(s).toUpperCase().replace(/\s+/g, ' ').trim();
// Problems of a reviewed.json object ([] when it is fine). opts.titles: id -> title (kind:id, e.g. 'sup:A25/26'), to
// check that a 'title' judgement names another aerodrome and that no note copies a title; opts.today: no read date after it.
export function validateReviewed(obj, { titles = null, today = null } = {}) {
  const P = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return ['reviewed.json is not a JSON object'];
  for (const k of Object.keys(obj)) if (!['_meta', 'sup', 'aic'].includes(k)) P.push(`unknown top-level key "${k}"`);
  const M = obj._meta;
  if (!M || typeof M !== 'object') P.push('_meta missing');
  else {
    for (const k of ['about', 'rules']) if (typeof M[k] !== 'string' || !M[k].trim()) P.push(`_meta.${k} must be a non-empty string`);
    if (!isDate(M.updated)) P.push('_meta.updated must be a date YYYY-MM-DD');
    // _meta.rules states the rule itself (it may name the words it forbids); _meta.about describes the content
    const hit = typeof M.about === 'string' && MILITARY_DENY.find((re) => re.test(M.about));
    if (hit) P.push(`_meta.about names a military unit, school or academy (${hit.source}); write the ICAO code only`);
  }
  for (const kind of ['sup', 'aic']) {
    const L = obj[kind];
    if (L === undefined) continue;
    if (!L || typeof L !== 'object' || Array.isArray(L)) { P.push(`${kind} must be an object`); continue; }
    for (const [id, e] of Object.entries(L)) {
      const at = `${kind} ${id}`;
      if (!KEY_RE[kind].test(id)) P.push(`${at}: key must look like ${kind === 'sup' ? 'A25/26 (series A or B, two-digit number)' : '07/26'}`);
      if (!e || typeof e !== 'object' || Array.isArray(e)) { P.push(`${at}: entry must be an object`); continue; }
      for (const k of Object.keys(e)) if (!ENTRY_KEYS.has(k)) P.push(`${at}: unknown field "${k}"`);
      if (!isDate(e.read)) P.push(`${at}: read must be a date YYYY-MM-DD`);
      else if (today && e.read > today) P.push(`${at}: read ${e.read} is after today ${today}`);
      if (!['text', 'title'].includes(e.basis)) P.push(`${at}: basis must be "text" or "title"`);
      if (typeof e.vtbd !== 'boolean') P.push(`${at}: vtbd must be true or false`);
      if (typeof e.note !== 'string' || !e.note.trim()) P.push(`${at}: note must be a non-empty string`);
      if (e.basis === 'title' && e.vtbd !== false) P.push(`${at}: basis "title" is allowed only for an item that does not concern VTBD`);
      if (e.folder !== undefined && !(typeof e.folder === 'string' && /^\d{4}-\d{2}-\d{2}(-AIRAC)?$/.test(e.folder) && isDate(e.folder.slice(0, 10)))) P.push(`${at}: folder must be YYYY-MM-DD (or YYYY-MM-DD-AIRAC)`);
      if (e.in !== undefined && !isDate(e.in)) P.push(`${at}: in must be a date YYYY-MM-DD`);
      if (e.until !== undefined && !['UFN', 'PERM'].includes(e.until) && !isDate(e.until)) P.push(`${at}: until must be a date YYYY-MM-DD, "UFN" or "PERM"`);
      if (isDate(e.in) && isDate(e.until) && e.until < e.in) P.push(`${at}: until before in`);
      for (const k of ['status', 'repo']) if (e[k] !== undefined && (typeof e[k] !== 'string' || !e[k].trim())) P.push(`${at}: ${k} must be a non-empty string`);
      for (const k of ['note', 'status', 'repo']) {
        const hit = typeof e[k] === 'string' && MILITARY_DENY.find((re) => re.test(e[k]));
        if (hit) P.push(`${at}: ${k} names a military unit, school or academy (${hit.source}); write the ICAO code only`);
      }
      const title = titles?.[`${kind}:${id}`];
      if (title) {
        if (e.basis === 'title' && classifyTitle(title) !== 'other') P.push(`${at}: basis "title" needs a title that names another aerodrome and nothing in Bangkok or VTBD`);
        if (norm(title).length >= 20 && typeof e.note === 'string' && norm(e.note).includes(norm(title))) P.push(`${at}: note copies the title; write it in our own words`);
      }
    }
  }
  return P;
}
// items of the lists and covers against reviewed.json
export function compareItems(items, reviewed) {
  const R = { sup: reviewed?.sup ?? {}, aic: reviewed?.aic ?? {} }, listed = new Set(items.map((i) => `${i.kind}:${i.id}`));
  const unreviewed = [], reviewedListed = [];
  for (const it of items) {
    const r = R[it.kind]?.[it.id];
    if (r) reviewedListed.push({ ...it, review: r }); else unreviewed.push({ ...it, class: classifyTitle(it.title) });
  }
  const gone = ['sup', 'aic'].flatMap((k) => Object.keys(R[k]).filter((id) => !listed.has(`${k}:${id}`)).map((id) => ({ kind: k, id, review: R[k][id] })));
  return { unreviewed, reviewedListed, vtbdListed: reviewedListed.filter((x) => x.review.vtbd === true), gone };
}
// a stub for reviewed.json, to fill in by hand (vtbd null and an empty note do not pass validateReviewed on purpose)
export const reviewStub = (it) => ({ read: '', basis: 'text', vtbd: null, note: '', ...(it.folder ? { folder: it.folder } : {}),
  ...(it.effective ? { in: it.effective } : {}), ...(it.until ? { until: it.until } : {}) });
