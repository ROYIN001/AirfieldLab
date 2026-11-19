// Keyboard map safety (owner's research round 1, docs/research/01-flight-physics/11-input.md, T-I-07 and T-I-08).
// Run: node --test test/keys.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/18-keys.js', import.meta.url), 'utf8');
const K = new Function('"use strict";\n' + src + '\nreturn { DEFAULT_KEYMAP, TOGGLE_ACTIONS, keymapProblems, resolveKey, isToggleEdge };')();

test('T-I-07: no modifier keys in the keymap; flight keys ignored with Ctrl, Meta or Alt', () => {
  assert.deepEqual(K.keymapProblems(K.DEFAULT_KEYMAP), []);
  assert.equal(K.resolveKey('KeyW', { ctrl: true }), null);
  assert.equal(K.resolveKey('KeyR', { meta: true }), null);
  assert.equal(K.resolveKey('KeyS', { alt: true }), null);
  // the check itself: the old map (Shift/Ctrl throttle) is flagged
  assert.deepEqual(K.keymapProblems({ ShiftLeft: 'tu', ControlLeft: 'td', ControlRight: 'td' }), ['ControlLeft', 'ControlRight']);
});

test('keys resolve by physical code, Shift alone does not block', () => {
  assert.equal(K.resolveKey('KeyW'), 'up');
  assert.equal(K.resolveKey('KeyW', { shift: true }), 'up');
  assert.equal(K.resolveKey('KeyQ', {}), 'rl');
  assert.equal(K.resolveKey('KeyX'), null);
  assert.equal(K.resolveKey('toString'), null);   // no inherited properties
});

test('throttle on = / − , PageUp / PageDown and Numpad 9 / 3, not on Shift or Ctrl', () => {
  for (const c of ['Equal', 'PageUp', 'Numpad9']) assert.equal(K.resolveKey(c), 'tu', c);
  for (const c of ['Minus', 'PageDown', 'Numpad3']) assert.equal(K.resolveKey(c), 'td', c);
  for (const c of ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight']) assert.equal(K.resolveKey(c), null, c);
});

test('T-I-08: a held toggle key fires once (key repeat ignored)', () => {
  // keydown C (repeat false), then 20 auto-repeat keydowns, then keyup: the camera changes once
  const events = [{ type: 'keydown', code: 'KeyC', repeat: false }];
  for (let i = 0; i < 20; i++) events.push({ type: 'keydown', code: 'KeyC', repeat: true });
  events.push({ type: 'keyup', code: 'KeyC', repeat: false });
  let edges = 0, cams = 0;
  for (const e of events) {
    if (e.type !== 'keydown') continue;
    const act = K.resolveKey(e.code, { ctrl: e.ctrlKey, meta: e.metaKey, alt: e.altKey });
    if (K.TOGGLE_ACTIONS.has(act) && K.isToggleEdge(e)) { edges++; if (act === 'cam') cams++; }
  }
  assert.equal(edges, 1);
  assert.equal(cams, 1);
  assert.equal(K.isToggleEdge({ repeat: false, ctrlKey: true }), false);
});

test('every toggle and held action has a key', () => {
  const acts = new Set(Object.values(K.DEFAULT_KEYMAP));
  for (const a of ['up', 'dn', 'lt', 'rt', 'rl', 'rr', 'tu', 'td', 'br', 'cam', 'take', 'pause', 'restart']) assert.ok(acts.has(a), a);
  for (const a of K.TOGGLE_ACTIONS) assert.ok(acts.has(a), a);
});
