// lm_fixture_trainer_r1.mjs — writes lm_fixture_trainer_r1.json: the round-1 fictional trainer (= today's AC in
// src/20-flight.js:100-118 at commit cabf0f0) as a round-2 type card in leaf format. lm_card's self-test
// (T-LM-01…07) builds AC from this card and must reproduce round-1's published regression numbers.
import fs from 'node:fs';
import path from 'node:path';
import { HERE } from './lm_lib.mjs';
const L = (v, u, note = '', scope = 'aircraft') => ({ v, u, scope, src: ['R1:V19'], conf: 'สูง', est: true, note: note || 'ค่าของเครื่องฝึกสมมติรอบที่ 1 (AC ปัจจุบัน)' });
const card = {
  _meta: { note: 'fixture: เครื่องฝึกสมมติของรอบที่ 1 = AC ใน src/20-flight.js:100-118 (cabf0f0) ใช้ทดสอบ lm_card เท่านั้น ไม่ใช่เครื่องบินจริง' },
  trainer_r1: {
    airframe: {
      identity: L({ manufacturer: '-', model: 'AirfieldLab trainer (round 1)', variant: 'fictional', engine: 'turboprop 700 kW', seats: 2, category: 'aerobatic' }, '-'),
      weights: { training_mass: L(2250, 'kg'), MTOW: L(2250, 'kg') },
      inertia: { Ixx: L(2600, 'kg m2'), Iyy: L(7300, 'kg m2'), Izz: L(9200, 'kg m2'), Ixz: L(120, 'kg m2') },
      geometry: { length: L(10.1, 'm', 'ค่าประมาณ ใช้เฉพาะตรวจ radii') },
    },
    aero: {
      ref: { S: L(16.3, 'm2'), b: L(10.2, 'm'), c: L(1.65, 'm') },
      legacy: L({ CD0: 0.024, K: 0.062, CL0: 0.25, CLa: 4.8, CLflap: 0.55, CDflap: 0.050, CDgear: 0.020, Cm0: 0.045, Cma: -0.72, Cmflap: -0.10, aStall: 17.0, aStallFlap: -2.5 }, '-, 1/rad, deg'),
      derivatives: Object.fromEntries(Object.entries({ CLq: 7.5, CLadot: 1.6, CLde: 0.35, CYb: -0.60, CYdr: 0.15, CYr: 0.20, Clb: -0.085, Clp: -0.47, Clr: 0.11, Clda: 0.16, Cldr: 0.012, Cmq: -12.5, Cmadot: -4.5, Cmde: -1.15, Cnb: 0.075, Cnp: -0.055, Cnr: -0.14, Cnda: -0.010, Cndr: -0.072 }).map(([k, v]) => [k, L(v, '1/rad')])),
      flaps: { detents: L([{ name: 'UP', flap_deg: 0, dCL0: 0 }, { name: 'LDG', flap_deg: 40, dCL0: 0.55, dCD0: 0.05, dCm0: -0.10 }], '-', 'มุมแฟลป 40° เป็นค่าสมมติ') },
    },
    propulsion: { legacy: L({ P: 700e3, eta: 0.80, T0: 11500, idle: 0.045 }, 'W, -, N, -', '', 'engine'), layout: L([{ id: 1, pos: [3.5, 0, 0], axis: [1, 0, 0], type: 'turboprop', model: 'fictional', prop_sense: 1 }], 'm FRD', '', 'engine') },
    controls: { surfaces: { elevator: { travel_deg: L({ up: 22, down: 15 }, 'deg') }, aileron: { travel_deg: L({ up: 20, down: 20 }, 'deg') }, rudder: { travel_deg: L({ left: 25, right: 25 }, 'deg') } } },
    gear: {
      layout: L('tricycle_retract', '-', '', 'gear'),
      legacy: L([{ b: [2.30, 0, 1.36], k: 5.2e4, c: 5.0e3, stroke: 0.22, steer: true }, { b: [-0.35, -1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true }, { b: [-0.35, 1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true }], 'm FRD, N/m, N s/m, m', 'AC.gear ตรง (override ที่ lm_card รองรับ)', 'gear'),
    },
    speeds: { VS0_kt: L(71, 'kt CAS', 'AC.Vs0'), VREF_kt: L(88, 'kt CAS'), VAPP_kt: L(95, 'kt CAS') },
    validation: {
      trim_targets: { cruise: L({ ias_kt: 155, h_ft: 3000 }, 'kt, ft'), approach: L({ ias_kt: 95, h_m: 300, gamma_deg: -3 }, 'kt, m, deg') },
      takeoff_test: L({ flap: 'UP', VR_kt: 82, theta_deg: 10 }, 'kt, deg'),
      stall_test: L({ UP: 106, LDG: 96 }, 'kt', 'ความเร็วเริ่มต้นของ v10_perf'),
    },
  },
};
fs.writeFileSync(path.join(HERE, 'lm_fixture_trainer_r1.json'), JSON.stringify(card, null, 1) + '\n');
console.log('wrote lm_fixture_trainer_r1.json');
