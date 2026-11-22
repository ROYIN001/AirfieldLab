// Keyboard handling (owner's research round 1, docs/research/01-flight-physics/11-input.md, T-I-07 and T-I-08).
// The decisions live in src/18-keys.js (KeyState); src/90-app.js only applies them, and the last test checks that it
// still does. Run: node --test test/keys.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/18-keys.js', import.meta.url), 'utf8');
const K = new Function('"use strict";\n' + src + '\nreturn { DEFAULT_KEYMAP, TOGGLE_ACTIONS, keymapProblems, resolveKey, isToggleEdge, KeyState };')();
const FLY = { train: true, flying: true };
const ev = (code, o = {}) => ({ code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...o });

test('T-I-07: no modifier keys in the keymap; keys pressed with Ctrl, Meta or Alt do nothing', () => {
  assert.deepEqual(K.keymapProblems(K.DEFAULT_KEYMAP), []);
  assert.equal(K.resolveKey('KeyW', { ctrl: true }), null);
  assert.equal(K.resolveKey('KeyR', { meta: true }), null);
  // the check itself flags the old map (Shift/Ctrl throttle)
  assert.deepEqual(K.keymapProblems({ ShiftLeft: 'tu', ControlLeft: 'td', ControlRight: 'td' }), ['ControlLeft', 'ControlRight']);
  // through the handler: Ctrl+W, Ctrl+S, Cmd+R and Alt+D neither hold a key, fire a toggle nor block the browser
  const k = new K.KeyState();
  for (const e of [ev('KeyW', { ctrlKey: true }), ev('KeyS', { ctrlKey: true }), ev('KeyR', { metaKey: true }), ev('KeyD', { altKey: true })]) {
    const d = k.down(e, FLY);
    assert.ok(!d.fire && !d.prevent && d.act === null, e.code);
  }
  assert.equal(k.size, 0);
});

test('pressing Ctrl, Meta or Alt releases held flight keys; Shift does not', () => {
  const k = new K.KeyState();
  k.down(ev('KeyS'), FLY); assert.ok(k.has('dn'));
  k.down(ev('ShiftLeft', { shiftKey: true }), FLY); assert.ok(k.has('dn'), 'Shift keeps the held key'); assert.ok(k.has('fine'), 'and is held itself');
  k.down(ev('KeyD', { shiftKey: true }), FLY); assert.ok(k.has('rt'), 'a key pressed with Shift is a flight key');
  k.down(ev('ControlLeft', { ctrlKey: true }), FLY); assert.equal(k.size, 0, 'Ctrl releases it');
  k.down(ev('KeyA'), FLY); k.down(ev('AltLeft', { altKey: true }), FLY); assert.equal(k.size, 0, 'Alt releases it');
});

test('macOS: S held, Cmd pressed and released, no keyup for S arrives: nothing stays held', () => {
  const k = new K.KeyState();
  k.down(ev('KeyS'), FLY);
  k.down(ev('MetaLeft', { metaKey: true }), FLY);
  k.up(ev('MetaLeft'));   // the browser never sends the keyup of S released while Cmd was down
  assert.equal(k.size, 0);
  // Cmd's keyup releases held keys by itself (its keydown may have gone to another window)
  for (const code of ['MetaLeft', 'MetaRight', 'OSLeft']) {
    k.down(ev('KeyS'), FLY); assert.ok(k.has('dn'));
    k.up(ev(code)); assert.equal(k.size, 0, `keyup ${code}`);
  }
});

test('two keys held: releasing one keeps the other; toggles are never held; modifier codes clear on their own', () => {
  const k = new K.KeyState();
  k.down(ev('KeyW'), FLY); k.down(ev('KeyD'), FLY);
  assert.deepEqual([...k].sort(), ['rt', 'up']);
  k.up(ev('KeyD'));
  assert.deepEqual([...k], ['up'], 'releasing D keeps W');
  k.up(ev('KeyX')); assert.deepEqual([...k], ['up'], 'keyup of an unbound key changes nothing');
  // a toggle key is not a held key, even before its keyup
  k.down(ev('KeyC'), FLY); assert.deepEqual([...k], ['up']);
  k.up(ev('KeyC')); assert.deepEqual([...k], ['up']);
  // a key that arrives with a modifier flag releases what was held and is not added (the modifier is down)
  k.down(ev('KeyA', { ctrlKey: true }), FLY); assert.equal(k.size, 0);
  // modifier keys clear by their code alone: AltGr on Linux is AltRight with altKey false, and some browsers report
  // the Windows key as OSLeft / OSRight with metaKey false
  for (const code of ['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'OSLeft', 'OSRight']) {
    k.down(ev('KeyS'), FLY); assert.ok(k.has('dn'));
    k.down(ev(code), FLY); assert.equal(k.size, 0, `keydown ${code}`);
  }
});

test('throttle on = / − , PageUp / PageDown and Numpad 9 / 3, not on Shift or Ctrl; Shift is the fine mode', () => {
  for (const c of ['Equal', 'PageUp', 'Numpad9']) assert.equal(K.resolveKey(c), 'tu', c);
  for (const c of ['Minus', 'PageDown', 'Numpad3']) assert.equal(K.resolveKey(c), 'td', c);
  for (const c of ['ControlLeft', 'ControlRight']) assert.equal(K.resolveKey(c), null, c);
  for (const c of ['ShiftLeft', 'ShiftRight']) assert.equal(K.resolveKey(c), 'fine', c);   // research round 1 §11.4.4
  const k = new K.KeyState();
  k.down(ev('PageUp'), FLY); assert.ok(k.has('tu')); k.up(ev('PageUp')); assert.ok(!k.has('tu'));
  assert.equal(K.resolveKey('toString'), null);   // no inherited properties
});

test('T-I-08: a held toggle key fires once (key repeat ignored), for C, T, P and R', () => {
  for (const code of ['KeyC', 'KeyT', 'KeyP', 'KeyR']) {
    const k = new K.KeyState();
    let fired = 0;
    if (k.down(ev(code), FLY).fire) fired++;
    for (let i = 0; i < 20; i++) if (k.down(ev(code, { repeat: true }), FLY).fire) fired++;
    k.up(ev(code));
    assert.equal(fired, 1, code);
    assert.equal(k.size, 0, `${code} is not a held key`);
  }
  // toggles only in training mode; Ctrl+C never
  const k = new K.KeyState();
  assert.equal(k.down(ev('KeyC'), { train: false, flying: false }).fire, false);
  assert.equal(k.down(ev('KeyC', { ctrlKey: true }), FLY).fire, false);
});

test('while flying, every bound key blocks the page default (no scrolling); otherwise nothing is blocked', () => {
  const k = new K.KeyState();
  for (const code of Object.keys(K.DEFAULT_KEYMAP)) assert.equal(k.down(ev(code), FLY).prevent, true, code);
  for (const code of ['ArrowDown', 'PageDown', 'KeyC']) assert.equal(new K.KeyState().down(ev(code), { train: true, flying: false }).prevent, false, code);
  assert.equal(k.down(ev('Space'), FLY).prevent, false, 'unbound keys keep their default');
});

test('every toggle and held action has a key', () => {
  const acts = new Set(Object.values(K.DEFAULT_KEYMAP));
  for (const a of ['up', 'dn', 'lt', 'rt', 'rl', 'rr', 'tu', 'td', 'br', 'fine', 'cam', 'take', 'pause', 'restart']) assert.ok(acts.has(a), a);
});

test('the app applies these decisions (src/90-app.js wiring)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /keys:\s*new KeyState\(\)/, 'app.keys is a KeyState');
  assert.match(app, /addEventListener\('keydown',[\s\S]{0,300}?app\.keys\.down\(e,/, 'keydown goes through app.keys.down');
  assert.match(app, /if \(k\.prevent\) e\.preventDefault\(\)/, 'keydown applies prevent');
  assert.match(app, /if \(!k\.fire\) return;/, 'toggles only when fire');
  assert.match(app, /addEventListener\('keyup', \(e\) => app\.keys\.up\(e\)\)/, 'keyup goes through app.keys.up');
  assert.match(app, /addEventListener\('blur', \(\) => app\.keys\.clear\(\)\)/, 'blur clears');
  assert.match(app, /addEventListener\('visibilitychange', \(\) => \{ if \(document\.hidden\) app\.keys\.clear\(\); \}\)/, 'hidden tab clears');
  assert.doesNotMatch(app, /KEYMAP\[e\.code\]|e\.code === 'Key[CTPR]'/, 'no second key map or raw toggle checks in the app');
});
