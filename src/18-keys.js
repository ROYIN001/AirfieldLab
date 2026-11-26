// ───────────────────────── Keyboard map and key handling (pure, no DOM) ─────────────────────────
// Physical keys (KeyboardEvent.code), so a Thai layout works: with Kedmanee active, W gives key "ไ" but code "KeyW".
// No Control, Meta or Alt anywhere: Chrome keeps Ctrl/Cmd + T, W and N for itself (they are not sent to the page
// outside full screen), and the old throttle-down key (Ctrl) held with W (push) made Ctrl+W, which closed the tab.
// Pressing Ctrl, Meta or Alt releases every held flight key and keys pressed with one are ignored, so browser
// shortcuts (Ctrl+R, Ctrl+L, …) still work. On macOS the browser sends no keyup for a key released while Cmd is down,
// so Cmd's own keyup releases held keys too. Toggles (camera, take control, pause, restart) act once per press: the
// operating system's key repeat is ignored. Shift held is the fine mode (25-input.js halves the key ramps), and a key
// pressed and released between two frames still counts for one frame (KeyState.frame()).
// Source: owner's research round 1, docs/research/01-flight-physics/11-input.md §11.4.2, §11.4.4–11.4.5 (tests T-I-07,
// T-I-08, T-I-09).
const DEFAULT_KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'dn', KeyS: 'dn',                          // pitch: push / pull
  ArrowLeft: 'lt', KeyA: 'lt', ArrowRight: 'rt', KeyD: 'rt',                       // roll
  KeyQ: 'rl', KeyE: 'rr',                                                          // rudder
  Equal: 'tu', PageUp: 'tu', Numpad9: 'tu', Minus: 'td', PageDown: 'td', Numpad3: 'td',   // throttle up / down
  KeyB: 'br',                                                                      // brakes
  ShiftLeft: 'fine', ShiftRight: 'fine',                                           // fine mode while held
  KeyC: 'cam', KeyT: 'take', KeyP: 'pause', KeyR: 'restart',                       // toggles
};
const TOGGLE_ACTIONS = new Set(['cam', 'take', 'pause', 'restart']);
const MODIFIER_CODE = /^(Control|Meta|Alt|OS)(Left|Right)$|^AltGraph$/;

// Codes that must never be bound: the modifier keys themselves.
function keymapProblems(keymap = DEFAULT_KEYMAP) {
  return Object.keys(keymap).filter((code) => MODIFIER_CODE.test(code));
}

// The action for a key press, or null when the key is unbound or Ctrl, Meta or Alt is held.
// mods: { ctrl, meta, alt } (KeyboardEvent ctrlKey, metaKey, altKey)
function resolveKey(code, mods = {}, keymap = DEFAULT_KEYMAP) {
  if (mods.ctrl || mods.meta || mods.alt) return null;
  return Object.prototype.hasOwnProperty.call(keymap, code) ? keymap[code] : null;
}

// A toggle fires on the first keydown of a press only (repeat: false) and never with a modifier.
// e: a KeyboardEvent or { repeat, ctrlKey, metaKey, altKey }
function isToggleEdge(e) {
  return !e.repeat && !(e.ctrlKey || e.metaKey || e.altKey);
}

// Held flight keys plus the decisions for each key event; 90-app.js only applies what down() returns.
// ctx: { train: training mode is open, flying: a training flight is running }
class KeyState extends Set {
  constructor(keymap = DEFAULT_KEYMAP) { super(); this.keymap = keymap; this.tapped = new Set(); }
  clear() { super.clear(); if (this.tapped) this.tapped.clear(); }
  // the held actions for this frame: held now, or pressed since the last frame (a tap shorter than one frame would
  // otherwise be added and removed before the frame reads it); call once per frame
  frame() { const s = new Set([...this, ...this.tapped]); this.tapped.clear(); return s; }
  // returns { act, fire, prevent }: fire = run the toggle now, prevent = call preventDefault (no page scroll)
  down(e, ctx = {}) {
    if (MODIFIER_CODE.test(e.code) || e.ctrlKey || e.metaKey || e.altKey) { this.clear(); return { act: null, fire: false, prevent: false }; }
    const act = resolveKey(e.code, {}, this.keymap);
    if (!act) return { act: null, fire: false, prevent: false };
    const toggle = TOGGLE_ACTIONS.has(act);
    if (!toggle) { this.add(act); this.tapped.add(act); }
    return { act, fire: toggle && !!ctx.train && isToggleEdge(e), prevent: !!ctx.flying };
  }
  up(e) {
    if (/^(Meta|OS)(Left|Right)$/.test(e.code)) { this.clear(); return; }   // macOS: other keys' keyups never came
    const act = Object.prototype.hasOwnProperty.call(this.keymap, e.code) ? this.keymap[e.code] : null;
    if (act) this.delete(act);
  }
}
