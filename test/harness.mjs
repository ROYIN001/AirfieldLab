import fs from 'fs';
// The pure (DOM-free) source files, evaluated in build order and in strict mode, as in the page (a
// <script type="module"> is always strict), so a missing const/let throws here as it would in the browser.
export const PURE = ['10-atmo.js', '15-geo.js', '20-flight.js'];
const src = PURE.map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
export const M = new Function('"use strict";\n' + src + '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, papiSeen, ilsAt, gpHeight, atmosphere, wrapPi, rwyLocal, PAPI, densityAltitudeFt, sunPosition, setActiveRunway, RWY_END, RUNWAYS, llToNE, neToLL, ARP, windFrom, eulerToQ, qToR, qToEuler, mulR, mulRT, Wind };')();
