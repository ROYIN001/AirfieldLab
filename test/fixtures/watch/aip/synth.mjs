// Synthetic eAIP pages for test/watch.test.mjs (plan item A10). They copy the tag structure of the real pages of
// https://aip.caat.or.th (Eurocontrol eAIP toolbox 2.0 output: the index of editions, a package cover, the SUP and AIC
// lists, the amendment list and AD 2 VTBD), but every word is made up here except the values of
// test/fixtures/aip_vtbd_current.json, which are already in the repo. No AIP text is copied. The AD 2 page prints the
// fixture's values the way the AIP prints them, with code written apart from tools/watch/lib.mjs, so that the test
// checks the lib's rules against an independent rendering.

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const dmy = (iso) => { const [y, m, d] = iso.split('-'); return `${d} ${MON[+m - 1]} ${y}`; };
const BEACON = `<script>window.__CF$cv$params={r:'0000synthetic',t:'MA==',u:'x',ut:'y',i:60};(function(){if(!document.body)return;var u='/cdn-cgi/challenge-platform/scripts/precursor/main.js?ray=0';})();</script>`;
const page = (title, body) => `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB" xml:lang="en-GB"><head><meta http-equiv="Content-type" content="text/html; charset=UTF-8"/><title>${title}</title></head><body>${body}${BEACON}</body></html>\n`;

// ---- index ------------------------------------------------------------------------------------------------------
// eds: [{effective, published, amdt, status: 'current'|'next'|'expired', nil?}]
export function indexHtml(eds) {
  const row = (e, i) => `
          <tr class="${i % 2 ? 'even' : 'odd'}-row">
            <td class="date"><a href="${e.effective}-AIRAC/html/index-en-GB.html">${dmy(e.effective)}</a></td>
            <td class="td-right-top-0-0 date">${dmy(e.published)}</td>
            <td valign="top">${e.nil ? `NIL AIRAC AIP AMDT ${e.amdt} (synthetic note)` : `This Package Contains AIRAC AIP AMDT ${e.amdt}`}</td>
            <td class="date" valign="top"><a href="https://example.invalid/etod/" style="color: red">Download</a></td>
          </tr>`;
  const table = (list, close = true) => `<table cellpadding="4" cellspacing="0" class="Table-all-0-left" rules="cols" width="100%"><thead><tr><th class="date">Effective date</th>
    <th class="date">Publication date</th><th>Short Description</th><th class="date">ETOD</th></tr></thead><tbody>${list.map(row).join('')}${close ? '</tbody>' : ''}</table>`;
  const of = (s) => eds.filter((e) => e.status === s);
  return page('Published eAIPs (synthetic)', `<div class="FrontPage"><table><tbody><tr><td><h1 class="H1">Published eAIPs</h1><h2>Synthetic</h2></td></tr></tbody></table></div>
<table class="transparent"><tbody>
<tr><td><h2>Currently Effective Issue</h2></td></tr><tr><td>${table(of('current'))}</td></tr>
<tr><td><h2>Next Issues</h2></td></tr><tr><td>${table(of('next'), false)}</td></tr>
<tr><td><h2>Expired Issues (Archives)</h2><p>Synthetic archive note.</p></td></tr><tr><td>${table(of('expired'))}</td></tr>
<tr><td><h3>Note: synthetic.</h3></td></tr></tbody></table>`);
}

// ---- cover, lists, amendment list -------------------------------------------------------------------------------
// items: [{kind: 'sup'|'aic', series, number, year, folder, airac?, title}]
const itemPath = (i) => (i.kind === 'sup' ? `${i.folder}/html/eSUP/VT-eSUP-${i.year}-${i.number}-${i.series}-en-GB.html` : `${i.folder}/html/eAIC/VT-eAIC-${i.year}-${i.number}-en-GB.html`);
export function coverHtml(ed, items) {
  const li = items.map((i) => `      <li>${i.kind === 'sup' ? `${i.airac ? 'AIRAC ' : ''}AIP SUP` : 'AIC'} <a href="../../${itemPath(i)}">${i.kind === 'sup' ? i.series : ''}${i.number}/${i.year}</a></li>`).join('\n');
  return '﻿' + page('AIP (synthetic cover)', `<div class="FrontPage"><h1 class="H1">eAIP</h1><h2>Synthetic</h2></div>
    <h3>Information on this eAIP</h3><p>Effective date: ${dmy(ed.effective)}<br />Publication date: ${dmy(ed.published)}</p>
    <h4>Description</h4><p>This eAIS package contains:</p><p>AIRAC AIP AMDT ${ed.amdt} (<a href="../pdf/x.pdf">synthetic</a>)</p>
    <ul>\n${li}\n    </ul>`);
}
export function listHtml(kind, asOf, items) {
  const groups = kind === 'sup' ? ['A', 'B'].map((s) => [s, items.filter((i) => i.series === s)]) : [['–', items]];
  const body = groups.map(([s, list]) => `<div class="H1"><a class="Plus" href="#" target="_self">-</a>Series: ${s}</div><div id="Series${s}details" style="display: block;">${list.map((i) =>
    `<div class="${kind === 'sup' ? 'SUP-Subject-' : 'AIC-Subject-Administrative'}" title="Published on ${dmy(i.published ?? asOf)}"><a href="../../../${itemPath(i)}"><strong>${i.number}/${i.year}</strong></a> <span id="ID_1">${i.title.replace(' AT ', ' <br Updated="No"/>AT ')}</span></div>`).join('')}</div>`).join('');
  return page(`List of ${kind === 'sup' ? 'AIP Supplements' : 'Circulars'} - `, `<div class="tab"><a href="../eAIP/VT-menu-en-GB.html">AIP</a></div><h2 class="effDate">Published as of ${dmy(asOf)}</h2>${body}`);
}
// an amendment list; vtbd: list of AD 2 section numbers changed at VTBD (empty: VTBD not named)
export function amdtHtml(ed, vtbd = []) {
  const g = `AIRAC-${ed.effective.slice(0, 4)}-${ed.amdt.replace('/', '_')}`;
  const other = `<div class="H3"><span class="Number">AD 2.VTZZ </span><span title="VTZZ Synthetic Airport">VTZZ Synthetic Airport</span></div><div id="${g}-VTZZ-AD-2.12details"><a href="../eAIP/VT-AD-2.VTZZ-en-GB.html?amdt=show#ID_1" class="amdtLink">►</a></div>`;
  const ours = vtbd.length ? `<div class="H3" onclick="showHide('${g}-AD-2.VTBD', TOGGLE); return false;"><a id="${g}-AD-2.VTBDplus" class="Plus" href="#">+</a><span class="Number"> </span><span title="VTBD Synthetic">VTBD Synthetic</span></div><div id="${g}-AD-2.VTBDdetails" style="display: none;">${vtbd.map((n) =>
    `<div class="H4"><span class="Number">AD 2.${n} </span><a href="../eAIP/VT-AD-2.VTBD-en-GB.html?amdt=show#ID_${n}" class="amdtLink">►</a></div><div id="${g}-VTBD-AD-2.${n}details"></div>`).join('')}</div>` : '';
  return page('List of Changes - Synthetic', `<h2>Effective ${dmy(ed.effective)}</h2><h2 class="amdtIntro">Synthetic list of changes.</h2><div id="amdtGroups"><div id="${g}"><div class="H2"><span class="Number">AD 2 </span><span title="AERODROMES">AERODROMES</span></div>${other}${ours}</div></div>`);
}

// ---- AD 2 VTBD from the fixture -----------------------------------------------------------------------------------
let uid = 1000;
const sd = (v, tok = 'TSYN;VAL;1') => `<span class="SD" id="ID_${uid++}">${v}</span><span class="sdParams" style="display: none;">${tok}</span>`;
const td = (...cells) => `<tr>${cells.map((c) => `<td><p>${c}</p></td>`).join('')}</tr>`;
const table = (rows) => `<table cellspacing="0"><tbody>${rows.join('')}</tbody></table>`;
const thou = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' ');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const cfEncode = (email, key) => { let h = key.toString(16).padStart(2, '0'); for (const c of email) h += (c.charCodeAt(0) ^ key).toString(16).padStart(2, '0'); return h; };
// "3700 m, 60 m, white; yellow last 600 m; LIH" -> "3700 m, 60 m<br/>White,<br/>FM 3100 m-3700 m<br/>Yellow; LIH"
function lightsText(s) {
  if (s === 'NIL') return 'NIL';
  const [first, ...more] = s.split(';').map((x) => x.trim());
  const [L, S, col] = first.split(',').map((x) => x.trim()), len = parseInt(L, 10);
  const out = [`${L}, ${S}${col ? `<br/>${cap(col)},` : ''}`];
  for (const c of more.flatMap((x) => x.split(/,\s*(?![^(]*\))/))) {
    let m;
    if (/^LI[HML]$/.test(c)) out.push(c);
    else if ((m = /^(\S+) from (\d+) m$/.exec(c))) out.push(`FM ${m[2]} m<br/>${m[1].split('/').map(cap).join('/')};`);
    else if ((m = /^(\S+) last (\d+) m$/.exec(c))) out.push(`FM ${len - m[2]} m-${len} m<br/>${cap(m[1])};`);
    else if ((m = /^(\S+) first (\d+) m/.exec(c))) out.push(`${cap(m[1])};<br/>FM ${m[2]} m`);
    else if ((m = /^(\S+) (\d+)-(\d+) m$/.exec(c))) out.push(`FM ${m[2]} m-${m[3]} m<br/>${cap(m[1])}`);
    else throw new Error(`synth: light clause not understood: ${c}`);
  }
  return out.join('<br/>');
}
// opts.marks: amendment marks as the eAIP shows them (inserted values in <ins>, old values in <del> and in elements of
// class AmdtDeletedAIRAC); opts.extra: {'AD 2.20': 'text'} adds a paragraph; opts.emailKey: Cloudflare email key.
// AD 2.20 holds one picture (<img src="../../graphics/ID_900001.gif">), as the real sections hold figures.
export function ad2Html(fx, { marks = false, extra = {}, emailKey = 0x35, effective = '2026-10-29', published = '2026-09-17' } = {}) {
  uid = 1000;
  const ins = (v) => (marks ? `<ins class=" AmdtInsertedAIRAC" title="Effective date: ${dmy(effective)}. " id="ID_${uid++}">\n   ${v}\n  </ins>` : v);
  const del = (v) => (marks ? `<del class=" AmdtDeletedAIRAC" title="Effective date: ${dmy(effective)}. " id="ID_${uid++}">${v}</del>` : '');
  const RW = Object.keys(fx.runways), ENDS = RW.flatMap((r) => r.split('/')), rwOf = (e) => RW.find((r) => r.split('/').includes(e));
  const S = {};
  const [mp, mt] = [/^(\d+) (\d+) ([EW]) \((\d{4})\)$/.exec(fx.magvar.pub_text), /^(\d+) (\d+) ([EW])$/.exec(fx.magvar.annual_text)];
  S[1] = `<p class="ADName">VTBD — Synthetic Aerodrome</p>`;
  S[2] = table([
    td('1', 'ARP coordinates and site at AD', `<div><span>${ins(sd(fx.arp.published_current.dms))}${marks ? `<span class=" AmdtDeletedAIRAC" title="x">999999.99N 9999999.99E</span>` : ''}</span></div><p>${fx.arp.site.replace('centre line RWY', 'centre line of RWY')}</p>`),
    td('3', 'Elevation/Reference temperature', `${ins(sd(fx.elevation.current_m))} ${del('9.99')}${sd('m')} (${fx.elevation.current_ft} ft) / ${sd(fx.ref_temp_c + '°')}${sd('C')}`),
    td('4', 'Geoid Undulation at AD ELEV PSN', fx.geoid_undulation_m === null ? 'NIL' : `${fx.geoid_undulation_m} m`),
    td('5', 'MAG VAR/Annual change', `${mp[1]}°${mp[2]}' ${mp[3]} (${mp[4]}) /${+mt[1]}°${+mt[2]}' ${mt[3]}`),
    td('6', 'Synthetic administration', `Email: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${cfEncode('ops@example.invalid', emailKey)}">[email&#160;protected]</a>`),
  ]);
  S[10] = table([td('Obstacle type', 'Elevation', 'Markings/LGT', 'Coordinates', 'Remarks'),
    ...fx.obstacles_ad2_10.map((o) => td('NIL', cap(o.type), `HGT ${o.hgt_m} m`, [o.marked && 'Marked', o.lgt && 'Lighted'].filter(Boolean).join(', '),
      `<div><span>${o.dms.split(' ')[0].replace(/(\d)(N)$/, `$1${del('7')}$2`)}</span> <span>${o.dms.split(' ')[1]}</span></div>`)), td('NIL')]);
  const surf = (e) => {
    const R = fx.runways[rwOf(e)], pcr = R.pcr.match(/PCR \d+(?:\/[A-Z]){4}/g), c = /concrete (\d+) m from THR (\S+) end and (\d+) m from THR (\S+) end/.exec(R.surface);
    if (!c) return `${pcr[0]}<br/>${cap(R.surface.split(/[;,]/)[0])}`;
    const [a, b] = c[2] === e ? [c[1], c[3]] : [c[3], c[1]];
    return `${pcr[0]}<br/>${cap(R.surface.split(/[;,]/)[0])}<br/>${a} m FM THR and<br/>${b} m RWY ends<br/>are ${pcr[1]}<br/>Concrete`;
  };
  const slope = (s) => { const p = s.split(',').map((x) => x.trim().split(/\s+/)); return `${p.map((x) => x[0]).join(' ')}<br/>(${p.map((x) => `${thou(x[1])}m`).join(' ')})`; };
  S[12] = table([td('Designations RWY NR', 'TRUE BRG', 'Dimensions of RWY (m)', 'Strength (PCR) and surface of RWY and SWY', 'THR coordinates', 'THR elevation'),
    td('1', '2', '3', '4', '5', '6'),
    ...ENDS.map((e) => { const E = fx.ends[e], R = fx.runways[rwOf(e)]; return td(e, `${String(Math.floor(E.true_brg_pub)).padStart(3, '0')}.00°`, `${R.len_m}x${R.wid_m}`, surf(e), sd(E.thr.dms), `THR ${E.thr_elev_m} m/${E.thr_elev_ft}`); }),
    td('Slope of RWY-SWY', 'SWY dimensions (m)', 'CWY dimensions (m)', 'Strip dimensions (m)', 'RESA dimensions (m)', 'Remarks'), td('7', '8', '9', '10', '11', '14'),
    ...ENDS.map((e) => { const r = rwOf(e), R = fx.runways[r], k = r.split('/').indexOf(e); return td(slope(R.slope[e]), R.swy, `${R.cwy_m[k]}x150`, R.strip_m.join('x'), R.resa_m[e].join('x'), 'NIL'); })]);
  S[13] = table([td('RWY Designator', 'TORA<br/>(m)', 'TODA<br/>(m)', 'ASDA<br/>(m)', 'LDA<br/>(m)', 'Remarks'), td('1', '2', '3', '4', '5', '6'),
    ...ENDS.map((e) => { const D = fx.ends[e].declared; return td(e, D.tora, D.toda, D.asda, D.lda, 'NIL'); })]);
  S[14] = table([td('RWY Designator', 'APCH LGT type LEN INTST', 'THR LGT colour WBAR', 'PAPI (MEHT)', 'TDZ, LGT LEN', 'RWY Centre Line LGT', 'RWY edge LGT', 'RWY End LGT', 'SWY LGT', 'Remarks'),
    ...ENDS.map((e) => {
      const E = fx.ends[e], R = fx.runways[rwOf(e)];
      return td(e, `${E.als.type.replace(' (', '<br/>(')}<br/>${E.als.len_m} m<br/>${E.als.intensity}${E.als.flg ? '<br/>with FLG' : ''}`, 'Green',
        `PAPI<br/>${cap(E.papi.side)}<br/>${E.papi.angle_deg}°<br/>(${E.papi.meht_ft} ft)`, E.tdz_lgt_m > 0 ? `${E.tdz_lgt_m} m` : 'NIL',
        lightsText(R.rcl), lightsText(R[`redl_${e}`] ?? R.redl), 'Red', 'NIL', 'NIL');
    })]);
  const Z = fx.atz;
  S[17] = table([td('1', 'Designation and lateral limits', `${Z.name.replace(/\s*ATZ$/, '')} Aerodrome Traffic Zone (ATZ) a circle, radius ${Z.radius_nm} NM centred on VTBD ARP (${Z.centre})`),
    td('2', 'Vertical limits', `${Z.upper_ft_agl} ft / AGL`), td('3', 'Airspace classification', Z.class), td('5', 'Transition altitude', `${thou(Z.transition_alt_ft).replace(' ', '')} ft MSL`)]);
  const C = fx.comms_ad2_18, em = `${C.emergency[0]} MHz1) / ${C.emergency[1].toFixed(1)} MHz1)`;
  const CALLS = [['APP', 'Don Mueang Approach', 'APP_DMK'], ['', 'Don Mueang Arrival', 'ARR_DMK'], ['TWR', 'Don Mueang Tower', 'TWR'], ['', 'Don Mueang Ground', 'GND'], ['', 'Don Mueang Delivery', 'DEL'], ['ATIS', 'Synthetic ATIS', 'ATIS']];
  S[18] = table([td('Service designation', 'Call sign', 'Frequency', 'Hours of operation', 'Remarks'),
    td('APP', 'Synthetic Approach', '199.9 MHz', 'H24', '1) Emergency frequency'),
    ...CALLS.map(([s, cs, k]) => td(s, cs, C[k].map((f) => `${f} MHz`).join('<br/>') + (['APP_DMK', 'ARR_DMK', 'TWR'].includes(k) ? `<br/>${em}` : ''), 'H24', ''))]);
  const N = Object.entries(fx.navaids).map(([n, V]) => {
    const [ty, id] = n.split(' '), rad = [...V.coverage_note.matchAll(/(\d{3})-(\d{3}):\s*(?:not below\s*)?(\d+)\s*ft/g)];
    const pub = /published (\d+) m \((\d+) ft\)/.exec(V.dme_elev);
    return td(ty, id, `${V.vor_mhz} MHz<br/>CH ${V.dme_ch}`, V.hours, sd(V.dms), `${pub[1]} m<br/>(${pub[2]} ft)`,
      `Synthetic restriction at ${/at (\d+) NM/.exec(V.coverage_note)[1]} NM:<br/>${rad.map((x) => `Radial ${x[1]}°-${x[2]}° not below ${thou(x[3])} ft.`).join('<br/>')}`);
  });
  const I = ENDS.filter((e) => fx.ends[e].approach.kind === 'ILS').map((e) => {
    const A = fx.ends[e].approach, opp = rwOf(e).split('/').find((x) => x !== e), rows = [];
    const rem = [`Reference Datum Height (RDH) is ${A.rdh_m !== undefined ? `${A.rdh_m} m (${A.rdh_ft} ft)` : `${A.rdh_ft} ft`}.`];
    if (A.remarks) { const m = /coverage (\d+) DME \((\w+)\) up to (\d+) ft (\w+)/.exec(A.remarks), g = /beyond (\d+) deg (\w+)/.exec(A.remarks); rem.push(`Synthetic coverage ${m[1]} DME (${m[2]}), ALT ${m[3]} ft/${m[4]}`, `GP unusable beyond ${g[1]}° ${g[2]} side`); }
    if (A.pub_loc_from_opp_thr_m) rem.push(`LOC ${A.pub_loc_from_opp_thr_m} m. from THR RWY ${opp}, synthetic.`);
    rem.push(`Course width ${A.loc_course_width_deg}°`, `B. Glide Path ${A.gp_deg}°`);
    if (A.pub_gp_from_thr_m) rem.push(`GP ${A.pub_gp_from_thr_m} m. from THR RWY ${e}, ${A.pub_gp_offset_m} m. from RWY centre line.`);
    rem.push(`Co-located with ${A.dme_colocated}`);
    rows.push(td(`ILS CAT ${A.cat === 'II' ? 'll' : A.cat}<br/>LOC-${e}`, A.ident, `${A.loc_mhz} MHz${A.dme_colocated === 'LOC' ? `<br/>CH${A.dme_ch}` : ''}`, 'H24', sd(A.loc.dms), '', rem.join('<br/>')));
    rows.push(td(`GP ${e}`, `${A.gp_mhz.toFixed(1)} MHz`, 'H24', sd(A.gp.dms)));
    rows.push(td(`DME ${e}`, A.dme_colocated === 'LOC' ? '' : `CH ${A.dme_ch}`, 'H24', sd(A.dme.dms), '0 m<br/>(0 ft)'));
    return rows.join('');
  });
  S[19] = table([td('Type of aid', 'ID', 'Frequency', 'Hours', 'Coordinates', 'Elevation', 'Remarks'), ...N, ...I]);
  S[24] = table(ENDS.map((e, i) => `<tr><td><p>Synthetic Approach Chart - ${fx.ends[e].approach.kind} RWY ${e}</p></td><td><a href="../../graphics/90000${i}.pdf">AD 2-VTBD-8-${i + 1}</a><span class="acParams" style="display: none;">TACLO;ACLO_SERVER_ID;${i}</span></td></tr>`));
  const body = Array.from({ length: 24 }, (_, i) => i + 1).map((n) => `<div id="VTBD-AD-2.${n}"><h4 class="Title" id="ID_${n}"><span class="Numbering">
        VTBD
       AD 2.${n}</span>  SYNTHETIC SECTION ${n}</h4>${S[n] ?? `<p>Synthetic text of section ${n}.</p>`}${n === 20 ? `<div id="VTBD-AD-2.20.1"><p>Synthetic item 1.</p><p class="Figure"><img class="Graphic" style="width: 10pxpx; height: 10pxpx; " id="ID_900001" src="../../graphics/ID_900001.gif" alt=""/></p></div>` : ''}${extra[`AD 2.${n}`] ? `<p>${extra[`AD 2.${n}`]}</p>` : ''}</div>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB"><head><title>Synthetic VTBD</title><meta name="DC.date" content="${published}"/><meta name="EM.effectiveDateStart" content="${effective}"/><script type="text/javascript">setActiveStyleSheet(1);</script></head><body onload="init()"><div id="floatingMenu"><input id="checkBox" type="checkbox"/></div><div id="AD-2"><h2 class="Title"><span class="Numbering">AD 2</span>  AERODROMES</h2><div id="AD-2.VTBD"><h3 class="TitleAD">VTBD — Synthetic Aerodrome</h3>${body}</div></div>${BEACON}</body></html>\n`;
}
