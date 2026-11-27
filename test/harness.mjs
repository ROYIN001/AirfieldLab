import fs from 'fs';
// The pure (DOM-free) source files, evaluated in build order and in strict mode, as in the page (a
// <script type="module"> is always strict), so a missing const/let throws here as it would in the browser.
export const PURE = ['10-atmo.js', '15-geo.js', '18-keys.js', '20-flight.js', '21-metar.js', '25-input.js'];
const src = PURE.map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
export const M = new Function('"use strict";\n' + src + `
return { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, papiSeen, ilsAt, gpHeight, atmosphere, wrapPi, rwyLocal, PAPI, densityAltitudeFt, sunPosition, setActiveRunway, RWY_END, RUNWAYS, llToNE, neToLL, ARP, windFrom, PAPI_GEOM, rwyToNED, eulerToQ, qToR, qToEuler, mulR, mulRT, Wind,
  clamp, KeyState, INPUT_CFG, calBipolar, calUnipolar, restStats, suggestDeadzone, detectAxis, dzAxial, dzRadial, circleToSquare,
  expoCurve, powCurve, shapeAxis, shapeLever, keyRamp, KeyAxis, keyDir, flapNotch, brakePair, parseGamepadId, padLabel, readPad,
  Arbiter, InputAxis, PilotInput, tiltUp, upOnScreen, tiltRecline, tiltAngles, tiltGrip, pickScreenAngle, tiltAxis, TiltStick, wrap360,
  papiFromMEHT, PAPI_MEHT_ANG, PAPI_SITINGS, eyeAboveBeam, setPapiSiting,
  parseMetar, metarCeilingFt, metarRvrFor, metarGustSigmaKt, metarRainMmh, metarRunway, metarIssuedMs };`)();
