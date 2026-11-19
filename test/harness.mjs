import fs from 'fs';
const src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
export const M = new Function(src + '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, papiSeen, ilsAt, gpHeight, atmosphere, wrapPi, rwyLocal, PAPI, densityAltitudeFt, sunPosition, setActiveRunway, RWY_END, RUNWAYS, llToNE, neToLL, ARP, windFrom, PAPI_GEOM, rwyToNED, eulerToQ };')();
