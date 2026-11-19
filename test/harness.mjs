import fs from 'fs';
// The pure (DOM-free) source files, evaluated in build order.
export const PURE = ['10-atmo.js', '15-geo.js', '16-engine.js', '18-input.js', '20-flight.js'];
const src = PURE.map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
// strict, as in the page (a <script type="module"> is always strict): a missing const/let throws here too
export const M = new Function('"use strict";\n' + src + `
return { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, NM, DEG, RAD, G0, RHO0, papiSeen, ilsAt, gpHeight, atmosphere, wrapPi, rwyLocal, rwyToNED, PAPI,
  densityAltitudeFt, sunPosition, setActiveRunway, RWY_END, RUNWAYS, llToNE, neToLL, ARP, windFrom,
  ENG, PROP, Turboprop, propeller, Wind, Autopilot, PilotLaws, brakeLikeAPilot, Evaluator, EVENT_TEXT, SURFACES, surfaceMu, wetMu, nwsMax, stickGain, vfeFor, flapIndex, buffetAlpha,
  eulerToQ, qToEuler, qToR, mulR, mulRT, clamp, lerp, smoothstep,
  KeyAxis, shapeAxis, readPad, pickInput, INPUT_DEFAULTS };`)();
