import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// Joins every src/NN-*.js (in name order) into the /*__APP__*/ marker of src/template.html.
export function assemble() {
  const dir = new URL('./src/', import.meta.url);
  const files = fs.readdirSync(dir).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
  const js = files.map((f) => `// ==== ${f} ====\n` + fs.readFileSync(new URL(f, dir), 'utf8')).join('\n');
  const tpl = fs.readFileSync(new URL('template.html', dir), 'utf8');
  if (!tpl.includes('/*__APP__*/')) throw new Error('marker missing');
  return { html: tpl.replace('/*__APP__*/', () => js), js, tpl, files };
}

// A pull request's preview page (CLAUDE.md, "Preview each pull request"): the same page with "พรีวิว PR #n" in the
// tab title and a badge beside the brand, so a preview is never mistaken for the live artifact. Nothing else changes.
export function checkPr(pr) {
  if (!/^[1-9]\d{0,5}$/.test(String(pr))) throw new Error(`preview: PR number expected, got "${pr}"`);
  return String(pr);
}
export function previewHtml(html, pr) {
  checkPr(pr);
  const tag = `พรีวิว PR #${pr}`;
  const title = /<title>([^<]*)<\/title>/, brand = /(<div class="brand">[\s\S]*?<b>AIRFIELD LAB<\/b>)/;
  if (!title.test(html) || !brand.test(html) || !html.includes('</style>')) throw new Error('preview: title, brand or </style> missing in the template');
  return html
    .replace(title, (m, t) => `<title>${tag} · ${t}</title>`)
    .replace('</style>', '.pv { flex: none; background: var(--warn); color: var(--ink); font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }\n</style>')
    .replace(brand, (m) => `${m}<mark class="pv">${tag}</mark>`);
}

// Every file under data/, as paths relative to data/ with forward slashes (they are also the published paths).
export function dataFiles(dir = path.join(ROOT, 'data')) {
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true }).filter((d) => d.isFile())
    .map((d) => path.relative(dir, path.join(d.parentPath ?? d.path, d.name)).split(path.sep).join('/')).sort();
}

// Writes <out>/index.html and copies data/ (sub-folders included) beside it; returns the data paths it copied.
export function build({ out = path.join(ROOT, 'dist'), preview = null } = {}) {
  const { html, files } = assemble();
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), preview == null ? html : previewHtml(html, preview));
  const data = dataFiles();
  fs.cpSync(path.join(ROOT, 'data'), out, { recursive: true });
  return { html, files, data };
}

// node build.mjs                               → dist/index.html plus the data files (importing this module only assembles)
// node build.mjs --preview <PR> [--out <dir>]   → dist-preview/pr-<PR>/ (or <dir>) with the preview title and badge,
//                                                 and the Artifact `files` map with absolute paths. A folder per PR keeps
//                                                 each preview on its own file path and dist/ for the live build only.
// (real paths: Node resolves symlinks for the main module, process.argv[1] keeps them)
const isMain = (() => { try { return !!process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch (e) { return false; } })();
if (isMain) {
  try {
    const { values } = parseArgs({ options: { preview: { type: 'string' }, out: { type: 'string' } }, strict: true });
    const preview = values.preview == null ? null : checkPr(values.preview);
    const out = path.resolve(values.out ?? path.join(ROOT, preview == null ? 'dist' : `dist-preview/pr-${preview}`));
    const { html, files, data } = build({ out, preview });
    console.log(`built ${path.relative(process.cwd(), path.join(out, 'index.html'))}`, (html.length / 1024).toFixed(0) + ' KB from', files.join(', '));
    if (preview != null) {
      console.log(`preview PR #${preview}: publish ${path.join(out, 'index.html')} with files =`);
      console.log(JSON.stringify(Object.fromEntries(data.map((f) => [f, path.join(out, f)]))));
    }
  } catch (e) { console.error('build.mjs: ' + e.message); process.exit(1); }
}
