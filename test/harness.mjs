import fs from 'fs';
// The pure (DOM-free) source files, evaluated in build order and in strict mode, as in the page (a
// <script type="module"> is always strict), so a missing const/let throws here as it would in the browser.
export const PURE = ['10-atmo.js', '15-geo.js', '18-keys.js', '20-flight.js', '21-metar.js', '25-input.js'];
const src = PURE.map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
// The aircraft flown (plan B3): the page loads data/aircraft/trainer.json and calls setAircraft before any Aircraft
// exists; here the card is read from disk and set below, so M.AC holds the trainer as soon as this module is loaded.
export const AIRCRAFT_CARD = new URL('../data/aircraft/trainer.json', import.meta.url);
export const M = new Function('"use strict";\n' + src + `
return { FIELD, AC, setAircraft, acFromCard, table1, table2, toSI, UNIT_SI, pctMAC, armAtPctMAC, thrustAvail, stallBlend, iasToCas, casToIas, speedsKias, SPD, Approach, inertiaInverse, engineLoads, Aircraft, Flight, Evaluator, aWarnAt, Recorder, qNlerp, SCENARIOS, KT, FT, DEG, RAD, G0, papiSeen, ilsAt, gpHeight, atmosphere, wrapPi, rwyLocal, PAPI, densityAltitudeFt, densityAltitudeDryFt, satVap, relHumidity, dewPoint, fieldPressure, airDensity, pressureAltitudeFt, WX_DEFAULT, sunPosition, setActiveRunway, RWY_END, RUNWAYS, llToNE, neToLL, ARP, windFrom, PAPI_GEOM, rwyToNED, eulerToQ, qToR, qToEuler, mulR, mulRT, Wind, logLaw, WIND_PROFILE, W20_PER_KT_LEGACY, windW20, GUST_FACTOR_3S, newtonSolve, qMul,
  clamp, KeyState, INPUT_CFG, calBipolar, calUnipolar, restStats, suggestDeadzone, detectAxis, dzAxial, dzRadial, circleToSquare,
  expoCurve, powCurve, shapeAxis, shapeLever, keyRamp, KeyAxis, keyDir, flapNotch, brakePair, parseGamepadId, padLabel, readPad,
  Arbiter, InputAxis, PilotInput, tiltUp, upOnScreen, tiltRecline, tiltAngles, tiltGrip, pickScreenAngle, tiltAxis, TiltStick, wrap360,
  papiFromMEHT, PAPI_MEHT_ANG, PAPI_SITINGS, eyeAboveBeam, setPapiSiting,
  parseMetar, metarCeilingFt, metarRvrFor, metarGustSigmaKt, metarRainMmh, metarRunway, metarIssuedMs };`)();
// setAircraft also re-solves the PAPI siting in use for the new aircraft's eye and antenna (setPapiSiting), so the
// `ils` siting exists from here on, as in the page.
M.setAircraft(JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8')));
