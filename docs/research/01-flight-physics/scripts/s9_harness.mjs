// Extended harness: same three pure files as test/harness.mjs, more internals exposed (read-only use of the repo)
import fs from 'fs';
const root = 'src/';
const src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(root + f, 'utf8')).join('\n');
export const M = new Function(src + '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, Wind, Autopilot, PilotLaws, Evaluator, Recorder, KT, FT, DEG, RAD, G0, atmosphere, wrapPi, qToR, qToEuler, eulerToQ, makeRng, gauss, stallBlend, thrustAvail, mulR, mulRT, cross, setActiveRunway, clamp };')();
