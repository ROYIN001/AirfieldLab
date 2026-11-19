// ───────────────────────── Keyboard map (pure, no DOM) ─────────────────────────
// Physical keys (KeyboardEvent.code), so a Thai layout works: with Kedmanee active, W gives key "ไ" but code "KeyW".
// No Control, Meta or Alt anywhere: Chrome keeps Ctrl/Cmd + T, W and N for itself (they are not sent to the page
// outside full screen), and the old throttle-down key (Ctrl) held with W (push) made Ctrl+W, which closed the tab.
// Flight keys are ignored while one of those modifiers is down, so browser shortcuts (Ctrl+R, Ctrl+L, …) still work.
// Toggles (camera, take control, pause, restart) act once per press: the operating system's key repeat is ignored.
// Source: owner's research round 1, docs/research/01-flight-physics/11-input.md §11.4.4–11.4.5 (tests T-I-07, T-I-08).
const DEFAULT_KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'dn', KeyS: 'dn',                          // pitch: push / pull
  ArrowLeft: 'lt', KeyA: 'lt', ArrowRight: 'rt', KeyD: 'rt',                       // roll
  KeyQ: 'rl', KeyE: 'rr',                                                          // rudder
  Equal: 'tu', PageUp: 'tu', Numpad9: 'tu', Minus: 'td', PageDown: 'td', Numpad3: 'td',   // throttle up / down
  KeyB: 'br',                                                                      // brakes
  KeyC: 'cam', KeyT: 'take', KeyP: 'pause', KeyR: 'restart',                       // toggles
};
const TOGGLE_ACTIONS = new Set(['cam', 'take', 'pause', 'restart']);

// Codes that must never be bound: the modifier keys themselves.
function keymapProblems(keymap = DEFAULT_KEYMAP) {
  return Object.keys(keymap).filter((code) => /^(Control|Meta|Alt|OS)(Left|Right)$|^AltGraph$/.test(code));
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
