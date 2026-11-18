// Static thrust implied by two JSBSim propeller files (values copied by hand from the LGPL-2.1 XML files, for comparison only)
const rho = 1.225, IN = 0.0254;
function staticFrom(tab, betas, D, rpm, P, ctf = 1, cpf = 1) {
  const n = rpm / 60, CPneed = P / (rho * n ** 3 * D ** 5);
  // linear search along beta at J=0
  const ct = tab.ct.map(v => v * ctf), cp = tab.cp.map(v => v * cpf);
  for (let k = 0; k < betas.length - 1; k++) if (CPneed >= cp[k] && CPneed <= cp[k + 1]) {
    const u = (CPneed - cp[k]) / (cp[k + 1] - cp[k]); const CT = ct[k] + u * (ct[k + 1] - ct[k]); const T = CT * rho * n * n * D ** 4;
    const Tid = Math.cbrt(2 * rho * Math.PI * D * D / 4) * P ** (2 / 3);
    return { beta: betas[k] + u * (betas[k + 1] - betas[k]), CPneed, CT, T, FM: (T / Tid) ** 1.5, CTCP: CT / CPneed };
  }
  return { CPneed, note: 'out of table' };
}
// prop_PT6.xml: J=0 row: CT 0.0691 (12 deg) 0.1091 (30 deg); CP 0.0804 0.1404; D 96 in; maxrpm 2345
console.log('JSBSim prop_PT6.xml @700kW 2345rpm:', staticFrom({ ct: [0.0691, 0.1091], cp: [0.0804, 0.1404] }, [12, 30], 96 * IN, 2345, 700e3));
console.log('JSBSim prop_PT6.xml @507kW(680hp) 2345rpm:', staticFrom({ ct: [0.0691, 0.1091], cp: [0.0804, 0.1404] }, [12, 30], 96 * IN, 2345, 680 * 745.7));
// pc7 Propeller.xml: J=0 row: beta -15 0 15 30 45 60; CT 0.0499 0.1140 0.1781 0.2421 0.3062 0.3702; CP 0.0067 0.0317 0.0792 0.1492 0.2418 0.3568; ct_factor 1.10, D 95 in; maxrpm 2200; 549.8 hp
console.log('JSBSim pc7 Propeller.xml @410kW 2200rpm:', staticFrom({ ct: [0.0499, 0.1140, 0.1781, 0.2421, 0.3062, 0.3702], cp: [0.0067, 0.0317, 0.0792, 0.1492, 0.2418, 0.3568] }, [-15, 0, 15, 30, 45, 60], 95 * IN, 2200, 549.8 * 745.7, 1.10, 1.0));
