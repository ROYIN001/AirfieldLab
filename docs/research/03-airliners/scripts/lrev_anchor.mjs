// Reviewer (หัวข้อ 3.3): AAIB D-AIRE pitch 1.5 deg was recorded at ~150 kt (stable segment above 1,000 ft), not at VAPP.
// Re-anchor alpha = theta - gamma = 1.5 + 3 = 4.5 deg at 150 kt and see what alpha/theta follow at the report's VAPP.
const KT = 0.514444, g = 9.80665, rho = 1.225, S = 122.6, D = Math.PI / 180;
const CL = (m, v) => 2 * m * g / (rho * S * (v * KT) ** 2);
function run(name, m, Vanchor, Vapp, CLa) {
  const CL0 = CL(m, Vanchor) - CLa * 4.5 * D;
  const a = (CL(m, Vapp) - CL0) / CLa / D;
  console.log(name, 'CL@anchor', CL(m, Vanchor).toFixed(3), 'CL0 FULL', CL0.toFixed(3), 'CL@VAPP', CL(m, Vapp).toFixed(3), 'alpha@VAPP', a.toFixed(2), 'theta@VAPP', (a - 3).toFixed(2));
}
run('A321ceo 73t anchor 150 kt -> VAPP 143.3', 73000, 150, 143.3, 5.317);
run('A321ceo 73t anchor 143.3 (report)', 73000, 143.3, 143.3, 5.317);
// A320 borrows the anchor: same speed margin above VAPP (+6.7 kt) gives
run('A320 64.5t anchor 140.2 -> VAPP 133.5', 64500, 133.5 + 6.7, 133.5, 5.302);
run('A320 64.5t anchor 133.5 (report)', 64500, 133.5, 133.5, 5.302);
