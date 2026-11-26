// orev_edit_rows.mjs — reviewer (continued run): replace one whole table row by its leading text with new row(s).
// usage: node orev_edit_rows.mjs <file> <rowPrefix> <newRowsFile>
import fs from 'fs';
const [file, prefix, newFile] = process.argv.slice(2);
const lines = fs.readFileSync(file, 'utf8').split('\n');
const idx = lines.map((l, i) => l.startsWith(prefix) ? i : -1).filter(i => i >= 0);
if (idx.length !== 1) { console.error('matches', idx.length); process.exit(1); }
const repl = fs.readFileSync(newFile, 'utf8').replace(/\n+$/, '').split('\n');
lines.splice(idx[0], 1, ...repl);
fs.writeFileSync(file, lines.join('\n'));
console.log('replaced line', idx[0] + 1, 'with', repl.length, 'line(s)');
