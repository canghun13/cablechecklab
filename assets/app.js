(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const workbenchIds = new Set(['charging', 'cables', 'displays', 'docks', 'usb4-thunderbolt', 'video-adapters', 'hdmi-routing', 'poe', 'analog-audio', 'digital-studio']);
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pageWorkbench = pathParts[0] === 'tools' && pathParts.length === 2 && workbenchIds.has(pathParts[1]) ? pathParts[1] : '';
  const track = (eventName, parameters = {}) => {
    if (typeof window.gtag !== 'function') return;
    const safeParameters = Object.fromEntries(Object.entries(parameters).filter(([, parameter]) => parameter !== '' && parameter !== undefined));
    window.gtag('event', eventName, safeParameters);
  };

  if (pageWorkbench) {
    document.querySelectorAll('a[href^="/tools/"]').forEach((link) => {
      const match = link.getAttribute('href')?.match(/^\/tools\/([^/]+)\/$/);
      const destination = match?.[1] || '';
      if (!destination || workbenchIds.has(destination)) return;
      link.addEventListener('click', () => track('workbench_to_tool_click', {
        tool_id: destination,
        workbench: pageWorkbench,
        source_context: 'workbench_card'
      }));
    });
  }

  const tool = document.querySelector('[data-tool]');
  if (!tool) return;

  const form = tool.querySelector('form');
  const output = tool.querySelector('[data-result]');
  const status = tool.querySelector('[data-status]');
  const headline = tool.querySelector('[data-headline]');
  const summary = tool.querySelector('[data-summary]');
  const details = tool.querySelector('[data-details]');
  const evidence = tool.querySelector('[data-evidence]');
  const toolId = pathParts[0] === 'tools' && pathParts.length >= 2 ? pathParts[1] : tool.dataset.tool;
  const parentWorkbenchPath = Array.from(tool.querySelectorAll('.breadcrumbs a')).map((link) => link.getAttribute('href') || '').find((href) => /^\/tools\/[^/]+\/$/.test(href) && workbenchIds.has(href.split('/')[2]));
  const toolWorkbench = parentWorkbenchPath ? parentWorkbenchPath.split('/')[2] : '';
  const analyticsContext = { tool_id: toolId, workbench: toolWorkbench };
  const resultState = () => ['ok', 'warn', 'bad', 'info'].find((stateName) => status.classList.contains(stateName)) || 'unknown';

  const number = (name) => {
    const raw = new FormData(form).get(name);
    return raw === null || String(raw).trim() === '' ? Number.NaN : Number(raw);
  };
  const value = (name) => String(new FormData(form).get(name) || '');
  const checked = (name) => Boolean(form.elements[name]?.checked);
  const safe = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
  const fmt = (n, digits = 1) => safe(n).toLocaleString(undefined, { maximumFractionDigits: digits });

  function paint(kind, label, title, text, list, note) {
    status.className = 'status ' + kind;
    status.textContent = label;
    headline.textContent = title;
    summary.textContent = text;
    details.innerHTML = list.map((item) => '<li>' + item + '</li>').join('');
    evidence.innerHTML = '<strong>Confidence boundary</strong>' + note;
    output.setAttribute('aria-live', 'polite');
  }

  function chargeCheck() {
    const need = number('deviceW');
    const charger = number('chargerW');
    const cable = number('cableW');
    const scenario = value('scenario');
    const proprietary = checked('proprietary');
    const ppsNeeded = checked('ppsNeeded');
    const pps = checked('pps');
    if (![need, charger, cable].every(Number.isFinite) || need <= 0 || charger <= 0 || cable < 0) {
      paint('bad', 'Check input', '—', 'Enter positive device and charger wattages.', ['Choose a cable rating or explicitly select Not stated / unknown.'], 'No estimate is produced from invalid inputs.');
      return;
    }
    if (cable === 0) {
      const notes = ['Device target: ' + fmt(need) + ' W; declared active charger port: ' + fmt(charger) + ' W.', 'No cable power rating supplied; do not infer a 15 W, 60 W, or higher cable rating from a USB-C plug or a charging session.'];
      if (charger < need) notes.push('The charger port alone is below the device target; confirming a cable rating will not remove that declared port limit.');
      if (need > 100) notes.push('Above 100 W also requires source/sink EPR support and a 5 A EPR cable.');
      if (ppsNeeded && !pps) notes.push('A matching PPS range is still unconfirmed; no fallback rate is inferred.');
      if (proprietary) notes.push('The vendor-specific protocol or cable requirement remains unconfirmed.');
      if (scenario === 'multi') notes.push('Verify the active-port output for this exact occupied-port combination.');
      if (scenario === 'dock') notes.push('Verify the dock or monitor PD output and every cable in the path.');
      paint('warn', 'Cable rating unverified', 'Charging ceiling unverified', 'Find exact-model cable power evidence before treating this chain as a fit or a quantified cable bottleneck.', notes, 'Unknown is not a low wattage rating. This browser cannot read an e-marker or measure charging power, and a successful low-power charge does not establish the cable maximum.');
      return;
    }
    const ceiling = Math.min(need, charger, cable);
    const bottlenecks = [];
    if (charger === ceiling) bottlenecks.push('charger profile');
    if (cable === ceiling) bottlenecks.push('cable rating');
    if (need === ceiling) bottlenecks.push('device demand');
    const ratio = ceiling / need;
    const notes = ['Electrical ceiling: ' + fmt(ceiling) + ' W, set by ' + bottlenecks.join(' + ') + '.'];
    const protocolIssues = [];
    if (need > 100) protocolIssues.push('A target above 100 W requires a mutually supported USB PD EPR profile across source and sink plus a 5 A EPR cable; entered wattages alone do not confirm that profile.');
    if (ppsNeeded && !pps) protocolIssues.push('The device needs PPS for the intended rate, but a matching charger PPS range was not confirmed. The fallback rate cannot be inferred from wattage alone.');
    if (proprietary) protocolIssues.push('The advertised maximum depends on a vendor-specific protocol or cable; standard USB PD may negotiate a different rate.');
    notes.push(...protocolIssues);
    if (scenario === 'multi') notes.push('Use the charger output table for this exact occupied-port combination; the total box wattage is not the active-port ceiling.');
    if (scenario === 'dock') notes.push('Verify the dock or monitor downstream PD output, any reserved host power, and every cable in the charging path.');

    let kind = 'ok';
    let label = 'Declared electrical fit';
    let summaryText = 'The entered wattage limits can meet the device target on paper.';
    if (ratio < 1) {
      kind = ratio >= .6 ? 'warn' : 'bad';
      label = 'Electrical bottleneck';
      summaryText = 'The declared electrical ceiling is below the device target.';
      notes.push('Gap to target: ' + fmt(need - ceiling) + ' W.');
    } else if (protocolIssues.length) {
      kind = 'warn';
      label = 'Protocol unverified';
      summaryText = 'Wattage fits on paper, but the intended charging protocol is not confirmed.';
    }
    paint(kind, label, fmt(ceiling) + ' W electrical ceiling', summaryText, notes, 'This is a declared-capability screen, not a prediction of negotiated or live charging power. Battery temperature, state of charge, system load, port sharing, cable condition, and vendor policy can reduce actual power.');
  }

  function cableDecode() {
    const power = number('power');
    const data = number('data');
    const length = number('length');
    const connector = value('connector');
    const marked = checked('marked');
    const video = checked('video');
    if (![power, data, length].every(Number.isFinite) || ![0, 60, 100, 240].includes(power) || ![0, .48, 5, 10, 20, 40, 80].includes(data) || !['c-c', 'a-c', 'c-dp', 'c-hdmi'].includes(connector) || length <= 0) {
      paint('bad', 'Check input', '—', 'Use valid cable claims and a positive length.', ['Choose a power claim, data claim, and cable length.', 'Page: https://cablechecklab.com/<wbr>tools/<wbr>cable-decoder/'], 'No capability screen is produced from invalid inputs.');
      return;
    }
    const claims = [];
    const cautions = [];
    const dataLabel = data === 0 ? 'Data unverified' : data < 1 ? fmt(data * 1000, 0) + ' Mbps' : fmt(data) + ' Gbps';
    const inputRecord = ['Input record: ' + ({'c-c': 'USB-C to USB-C cable', 'a-c': 'USB-A to USB-C cable', 'c-dp': 'USB-C to DisplayPort adapter cable', 'c-hdmi': 'USB-C to HDMI adapter cable'})[connector] + '; power ' + (power === 0 ? 'unknown' : power + ' W') + '; data ' + dataLabel + '; length ' + fmt(length) + ' m; relevant evidence ' + (marked ? 'confirmed' : 'not confirmed') + '; display video intended ' + (video ? 'yes' : 'no') + '.', 'Page: https://cablechecklab.com/<wbr>tools/<wbr>cable-decoder/'];
    let title = (power === 0 ? 'Power unverified' : power + ' W') + ' / ' + dataLabel;

    if (connector === 'c-c') {
      claims.push(power === 0 ? 'No cable power rating supplied; no wattage ceiling can be inferred.' : 'Declared charging ceiling: ' + power + ' W.');
      if (power === 0) cautions.push('Find the exact-model power rating or suitable cable-reader evidence before relying on this cable for the requested charging rate.');
      claims.push(data === 0 ? 'No USB data rating supplied; no transfer-rate ceiling, USB 2.0 class, or charge-only classification can be inferred.' : 'Declared data rate: ' + dataLabel + '.');
      if (data === 0) cautions.push('Find exact-model data capability evidence. A power mark or a successful charge does not establish USB data speed.');
      if (power > 60 && !marked) cautions.push('Above 60 W requires a 5 A electronically marked cable; no exact-model marking, record, or tester evidence was confirmed.');
      if (video && data === 0) cautions.push('DisplayPort Alt Mode cable support is unverified; no USB data class or video support was supplied.');
      if (video && data > 0 && data < 5) cautions.push('A declared USB 2.0-only C-to-C cable does not establish a full-featured DisplayPort Alt Mode path.');
      if (length > 2 && data >= 40) cautions.push('For a long high-speed cable, verify the exact length, active/passive construction, and certified data rating.');
      if (video && data >= 5) claims.push('A full-featured high-speed C-to-C cable is a plausible DisplayPort Alt Mode path, but source and display support remain separate requirements.');
    } else if (connector === 'a-c') {
      title = 'USB-A to USB-C';
      claims.push('This is a legacy USB-A host-side path, not a USB-C to USB-C Power Delivery cable.');
      claims.push('Declared data claim: ' + dataLabel + '. Verify the USB-A port and exact cable generation.');
      if (data === 0) cautions.push('No USB data rating supplied; an unknown cable is not a confirmed USB 2.0 or charge-only cable.');
      if (power > 15) cautions.push('A 60 W, 100 W, or 240 W USB-C cable power mark does not establish that rate over USB-A. USB PD is not negotiated through a standard A-to-C cable.');
      if (data > 10) cautions.push('A data claim above 10 Gbps is not plausible for a standard USB-A to USB-C cable path.');
      if (video) cautions.push('USB-A does not provide DisplayPort Alt Mode. A separate USB graphics adapter is a different product category.');
    } else {
      const displayName = connector === 'c-dp' ? 'DisplayPort' : 'HDMI';
      title = 'USB-C to ' + displayName + ' adapter cable';
      claims.push('This is a purpose-built video adapter cable, not a general full-featured USB-C to USB-C cable.');
      claims.push('Verify the exact supported resolution, refresh rate, color depth, HDR/HDCP features, and direction in the adapter specification.');
      if (data > 0) cautions.push('A USB data-rate claim does not by itself establish the adapter\'s ' + displayName + ' video modes.');
      cautions.push('The selected USB-C cable power rating does not establish charge-through support for this adapter cable.');
    }
    const kind = cautions.length ? 'warn' : marked ? 'ok' : 'info';
    paint(kind, kind === 'ok' ? 'Declared fit' : kind === 'warn' ? 'Verify before use' : 'Unverified claim', title, cautions.length ? 'The selected claims do not fully establish the intended use.' : 'The declared capabilities are internally plausible.', claims.concat(cautions, inputRecord), 'A browser cannot read an e-marker or identify an adapter chipset. Packaging, the USB-IF product record, exact-model specifications, a hardware tester, or operating-system telemetry is needed to verify the product. Connector shape alone proves no data, video, or charging capability.');
  }

  function displayPlan() {
    const width = number('width');
    const height = number('height');
    const refresh = number('refresh');
    const bpc = number('bpc');
    const chroma = number('chroma');
    const overhead = number('overhead');
    const capacity = number('capacity');
    const streams = number('streams');
    if ([width, height, refresh, bpc, chroma, overhead, capacity, streams].some((n) => !Number.isFinite(n) || n <= 0)) {
      paint('bad', 'Check input', '—', 'Use positive numeric values.', ['Resolution, refresh, color depth, capacity, and display count must be valid.'], 'This planner uses an estimate; exact video timings can differ.');
      return;
    }
    const raw = width * height * refresh * (bpc * 3) * chroma * streams / 1e9;
    const estimated = raw * (1 + overhead / 100);
    const load = estimated / capacity;
    const fits = load <= 1;
    const margin = capacity - estimated;
    const meter = output.querySelector('.meter span');
    if (meter) meter.style.setProperty('--meter', Math.min(100, load * 100) + '%');
    const resultNotes = ['Selected usable payload: ' + fmt(capacity, 2) + ' Gbps.', (fits ? 'Estimated headroom: ' : 'Estimated shortfall: ') + fmt(Math.abs(margin), 2) + ' Gbps.', streams > 1 ? streams + ' identical display streams included.' : 'One display stream included.'];
    if (streams > 1) resultNotes.push('Multiple-display arithmetic still requires a supported host display count and working MST, Thunderbolt, USB4, or other stream topology.');
    paint(fits ? (load < .85 ? 'ok' : 'warn') : 'bad', fits ? (load < .85 ? 'Within payload estimate' : 'Tight payload estimate') : 'Over payload estimate', fmt(estimated, 2) + ' Gbps estimated', fits ? 'The arithmetic fits the selected payload; device and topology support remain unverified.' : 'Estimated video demand exceeds the selected usable payload.', resultNotes, 'This is not a VESA timing compliance calculator or a compatibility verdict. Exact blanking, DSC, MST overhead, adapters, dock lane allocation, GPU limits, cable support, and OS display policy can change the outcome. Use exact timing data when available.');
  }

  function multiportPlan() {
    const total = number('total');
    const wants = [1, 2, 3, 4].map((i) => number('device' + i));
    const caps = [1, 2, 3, 4].map((i) => number('cap' + i));
    if (!Number.isFinite(total) || total <= 0 || ![...wants, ...caps].every((n) => Number.isFinite(n) && n >= 0) || !wants.some((w) => w > 0)) {
      paint('bad', 'Check input', '—', 'Add a positive charger budget, non-negative row values, and at least one device.', ['Use zero for both fields on an unused row; an empty field is not treated as zero.'], 'No allocation can be estimated from missing or invalid values.');
      return;
    }
    const missingCaps = wants.some((w, i) => w > 0 && caps[i] <= 0);
    if (missingCaps) {
      paint('bad', 'Check input', '—', 'Enter a positive port ceiling for every active device row.', ['Use zero for both fields only when a row is unused.'], 'The total charger wattage cannot substitute for an unknown per-port ceiling.');
      return;
    }
    const capped = wants.map((w, i) => w > 0 ? Math.min(w, caps[i]) : 0);
    const combined = capped.reduce((a, b) => a + b, 0);
    const shortfall = Math.max(0, combined - total);
    const portLimited = wants.some((w, i) => w > 0 && caps[i] < w);
    const rows = wants.map((w, i) => w > 0 ? 'Device ' + (i + 1) + ': ' + fmt(w) + ' W target; ' + fmt(caps[i]) + ' W port ceiling; up to ' + fmt(capped[i]) + ' W declared.' : null).filter(Boolean);
    rows.push('Combined capped demand: ' + fmt(combined) + ' W.');
    rows.push('Total simultaneous charger budget: ' + fmt(total) + ' W.');

    let kind = 'ok';
    let label = 'Declared budget fits';
    let title = fmt(combined) + ' W capped demand';
    let summaryText = 'The active device targets and port ceilings fit inside the entered total budget.';
    if (shortfall > 0) {
      kind = 'bad';
      label = 'Combination table required';
      title = fmt(shortfall) + ' W budget shortfall';
      summaryText = 'The simultaneous capped demand exceeds the entered total budget. Exact per-port outcomes cannot be inferred by dividing the shortfall proportionally.';
    } else if (portLimited) {
      kind = 'warn';
      label = 'Port-limited';
      summaryText = 'The total budget fits, but at least one selected port ceiling is below its device target.';
    }
    paint(kind, label, title, summaryText, rows, 'No per-device allocation is estimated. Real multi-port chargers may use fixed or dynamic rules, reserve power, or renegotiate when connections change. The exact manufacturer table for the occupied port combination is authoritative.');
  }

  function ppsRangeCheck() {
    const deviceV = number('deviceV');
    const deviceA = number('deviceA');
    const minV = number('minV');
    const maxV = number('maxV');
    const maxA = number('maxA');
    const maxW = number('maxW');
    if (![deviceV, deviceA, minV, maxV, maxA, maxW].every((n) => Number.isFinite(n) && n > 0) || minV > maxV) {
      paint('bad', 'Check input', '—', 'Enter positive values and a PPS minimum no higher than its maximum.', ['Copy one APDO range from the charger specification; do not combine values from different APDOs.'], 'No range result is produced from invalid input.');
      return;
    }
    if (deviceV > 21 || minV > 21 || maxV > 21) {
      paint('bad', 'Check input', '—', 'PPS entries must stay at or below 21 V.', ['Higher programmable-voltage ranges use an AVS APDO, not a PPS APDO. Use the exact APDO type and range from the source specification.'], 'This checker is limited to PPS. It does not evaluate SPR AVS or EPR AVS ranges.');
      return;
    }
    const requestW = deviceV * deviceA;
    const voltageFits = deviceV >= minV && deviceV <= maxV;
    const currentFits = deviceA <= maxA;
    const powerFits = requestW <= maxW;
    const fits = voltageFits && currentFits && powerFits;
    const list = [
      'Requested operating point: ' + fmt(deviceV, 2) + ' V × ' + fmt(deviceA, 2) + ' A = ' + fmt(requestW, 2) + ' W.',
      'Entered PPS APDO: ' + fmt(minV, 2) + '–' + fmt(maxV, 2) + ' V, up to ' + fmt(maxA, 2) + ' A and ' + fmt(maxW, 2) + ' W.',
      voltageFits ? 'Voltage is inside the entered range.' : 'Voltage is outside the entered range.',
      currentFits ? 'Requested current does not exceed the entered limit.' : 'Requested current exceeds the entered limit.',
      powerFits ? 'Requested power does not exceed the entered APDO ceiling.' : 'Requested power exceeds the entered APDO ceiling.'
    ];
    paint(fits ? 'ok' : 'bad', fits ? 'Range match' : 'Range mismatch', fmt(requestW, 2) + ' W request', fits ? 'The requested point is inside the single declared PPS range.' : 'At least one boundary of the entered PPS range does not cover the request.', list, 'A range match does not prove that the device will request this point, that the charger sustains it thermally, or that a vendor-specific charging mode is available. Check the exact APDO, port combination, and cable requirement.');
  }

  function pdRequirement() {
    const watts = number('targetW');
    const volts = number('targetV');
    if (![watts, volts].every((n) => Number.isFinite(n) && n > 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive target power and voltage.', ['Use a voltage profile the device is documented to request.'], 'This builder does not infer a Power Delivery profile from a product name.');
      return;
    }
    const amps = watts / volts;
    const beyondCurrent = amps > 5;
    const beyondPower = watts > 240;
    const sprOver = volts <= 20 && watts > 100;
    const epr = volts > 20;
    const possible = !beyondCurrent && !beyondPower && !sprOver;
    const cable = amps <= 3 && watts <= 60 ? 'A declared 60 W / 3 A C-to-C cable covers this operating point.' : 'Use a 5 A electronically marked cable; current certified new-purchase marking is 240 W.';
    const list = [
      'Required current: ' + fmt(amps, 2) + ' A at ' + fmt(volts, 1) + ' V.',
      epr ? 'Voltage is above 20 V, so the path requires USB PD Extended Power Range support.' : 'Voltage is within the Standard Power Range voltage boundary.',
      cable
    ];
    if (sprOver) list.push('More than 100 W cannot be delivered at 20 V or below within the 5 A USB PD ceiling; choose a documented EPR voltage/profile.');
    if (beyondCurrent) list.push('The requested point exceeds 5 A and is outside the USB PD cable-current ceiling.');
    if (beyondPower) list.push('The requested power exceeds the 240 W USB PD ceiling.');
    paint(possible ? (amps > 3 || epr ? 'warn' : 'ok') : 'bad', possible ? (epr ? 'EPR path required' : amps > 3 ? '5 A path required' : '3 A path sufficient') : 'Target outside PD boundary', fmt(amps, 2) + ' A required', possible ? 'This is the minimum electrical path implied by the entered operating point.' : 'The entered operating point cannot be represented by the standard USB PD limits used here.', list, 'This is a requirement builder, not a device compatibility verdict. The source, sink, cable, and any dock must all advertise a mutually supported profile; PPS and vendor-specific protocols are separate requirements.');
  }

  function cableSelector() {
    const power = number('needPower');
    const data = number('needData');
    const video = checked('needVideo');
    const tunneled = checked('needTunneled');
    if (!Number.isFinite(power) || power <= 0 || !Number.isFinite(data) || data < 0) {
      paint('bad', 'Check input', '—', 'Choose a positive charging target and a valid data target.', ['Select zero data only for a charging-only use case.'], 'No cable requirement is generated from invalid input.');
      return;
    }
    const list = [];
    const powerMark = power <= 60 ? '60 W' : power <= 240 ? '240 W / 5 A e-marked' : 'outside the USB PD 240 W ceiling';
    list.push('Power requirement: ' + powerMark + '.');
    if (data === 0) list.push('No high-speed USB data rate requested.');
    else list.push('Require an explicit USB ' + fmt(data, data < 1 ? 2 : 0) + (data < 1 ? ' Gbps (USB 2.0 class)' : ' Gbps') + ' or faster data claim on the exact cable.');
    if (video) list.push('Require a full-featured C-to-C cable explicitly suitable for the source/display path; power rating alone does not establish DisplayPort lanes.');
    if (tunneled) list.push('Require a USB4 or Thunderbolt-certified cable at the needed link rate; a generic “video cable” claim is not enough for tunneled data/display traffic.');
    const outside = power > 240;
    const titleParts = [powerMark];
    if (data >= 1) titleParts.push(fmt(data, 0) + ' Gbps+');
    if (video) titleParts.push('video');
    paint(outside ? 'bad' : 'info', outside ? 'Outside PD boundary' : 'Minimum claim set', titleParts.join(' · '), outside ? 'The charging target is outside the USB PD power range.' : 'Use these as minimum listing and packaging checks, then verify the exact model.', list, 'This selector cannot inspect cable construction, e-marker contents, certification, signal integrity, or active-cable compatibility. A cable that meets one requirement does not automatically meet the others.');
  }

  function dataPathCheck() {
    const parts = ['hostData', 'cableData', 'hubData', 'deviceData'].map(number);
    const loss = number('dataLoss');
    if (!parts.every((n) => Number.isFinite(n) && n > 0) || !Number.isFinite(loss) || loss < 0 || loss >= 100) {
      paint('bad', 'Check input', '—', 'Use positive declared link rates and an overhead below 100%.', ['For a direct path, choose “No hub / adapter” rather than zero.'], 'No throughput screen is produced from invalid inputs.');
      return;
    }
    const ceiling = Math.min(...parts);
    const labels = ['host port', 'cable', 'hub or adapter', 'device'];
    const bottlenecks = labels.filter((_, i) => parts[i] === ceiling);
    const estimate = ceiling * (1 - loss / 100);
    const list = labels.map((label, i) => label.charAt(0).toUpperCase() + label.slice(1) + ': ' + fmt(parts[i], 2) + ' Gbps declared.');
    list.push('Weakest declared link: ' + bottlenecks.join(' + ') + '.');
    list.push('Planning throughput after ' + fmt(loss, 1) + '% user-selected overhead: ' + fmt(estimate, 2) + ' Gbps.');
    paint('info', 'Declared bottleneck', fmt(ceiling, 2) + ' Gbps ceiling', 'The slowest declared component sets the link-rate ceiling.', list, 'This is not a file-transfer benchmark. Encoding, protocol tunneling, storage speed, controller design, shared hub traffic, thermals, drivers, and workload can reduce real throughput; USB marketing rates are signaling rates.');
  }

  function dscPlan() {
    const width = number('dscWidth');
    const height = number('dscHeight');
    const refresh = number('dscRefresh');
    const bpc = number('dscBpc');
    const chroma = number('dscChroma');
    const overhead = number('dscOverhead');
    const capacity = number('dscCapacity');
    if ([width, height, refresh, bpc, chroma, capacity].some((n) => !Number.isFinite(n) || n <= 0) || !Number.isFinite(overhead) || overhead < 0) {
      paint('bad', 'Check input', '—', 'Use positive display values, capacity, and a non-negative timing estimate.', ['Exact timing totals are preferable when known.'], 'No compression estimate is produced from invalid input.');
      return;
    }
    const demand = width * height * refresh * (bpc * 3) * chroma / 1e9 * (1 + overhead / 100);
    const ratio = demand / capacity;
    const required = Math.max(1, ratio);
    const meter = output.querySelector('.meter span');
    if (meter) meter.style.setProperty('--meter', Math.min(100, required / 3 * 100) + '%');
    const list = [
      'Estimated uncompressed payload: ' + fmt(demand, 2) + ' Gbps.',
      'Selected usable link payload: ' + fmt(capacity, 2) + ' Gbps.',
      ratio <= 1 ? 'The estimate fits without DSC.' : 'Minimum arithmetic compression ratio: ' + fmt(ratio, 2) + ':1.'
    ];
    if (ratio > 1) list.push('Both source and sink—and every dock or adapter that terminates or converts the stream—must support the required DSC path.');
    const kind = ratio <= 1 ? 'ok' : ratio <= 3 ? 'warn' : 'bad';
    const label = ratio <= 1 ? 'No compression required' : ratio <= 3 ? 'DSC required' : 'Beyond 3:1 planning range';
    paint(kind, label, ratio <= 1 ? fmt(capacity - demand, 2) + ' Gbps headroom' : fmt(ratio, 2) + ':1 minimum', ratio <= 1 ? 'The estimate fits inside the selected payload without DSC.' : ratio <= 3 ? 'The arithmetic falls within the common VESA DSC planning range, but support is not established.' : 'The estimated requirement exceeds the 3:1 DSC planning boundary used by this tool.', list, 'This is a payload ratio screen, not a DSC encoder model or VESA timing compliance result. Exact blanking, slices, bits-per-pixel choices, FEC, color format, and hardware limits can change whether a mode is exposed.');
  }

  function lanePlan() {
    const demand = number('laneDemand');
    const perLane = number('perLane');
    const keepUsb3 = checked('keepUsb3');
    if (![demand, perLane].every((n) => Number.isFinite(n) && n > 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive video payload and per-lane payload.', ['Use the estimated payload from Display Link Planner or an exact timing calculation.'], 'No lane result is produced from invalid input.');
      return;
    }
    const two = perLane * 2;
    const four = perLane * 4;
    const fitsTwo = demand <= two;
    const fitsFour = demand <= four;
    const list = [
      'Two DP lanes: ' + fmt(two, 2) + ' Gbps usable payload; conventional DP Alt Mode can keep the other high-speed pair for USB 3 data.',
      'Four DP lanes: ' + fmt(four, 2) + ' Gbps usable payload; conventional DP Alt Mode uses all high-speed lanes for video.',
      'Entered video demand: ' + fmt(demand, 2) + ' Gbps.'
    ];
    let kind = 'ok';
    let label = 'Two lanes fit';
    let title = 'Video + USB 3 path';
    let summaryText = 'The video estimate fits two DP lanes, leaving a conventional SuperSpeed USB lane pair available.';
    if (!fitsTwo && fitsFour) {
      kind = keepUsb3 ? 'warn' : 'ok';
      label = 'Four lanes required';
      title = keepUsb3 ? 'Tradeoff unresolved' : 'Video-first path';
      summaryText = keepUsb3 ? 'Four conventional DP Alt Mode lanes fit video but conflict with the request to preserve native USB 3 data.' : 'The estimate fits only when all four conventional Alt Mode lanes carry DisplayPort.';
      if (keepUsb3) list.push('Consider lower video demand or a verified USB4/Thunderbolt topology that tunnels both traffic types; do not assume a basic DP Alt Mode hub solves the conflict.');
    } else if (!fitsFour) {
      kind = 'bad';
      label = 'Over four-lane payload';
      title = fmt(demand - four, 2) + ' Gbps short';
      summaryText = 'The entered demand exceeds even four lanes at the selected link rate.';
      list.push('Lower the display payload, select a higher mutually supported link rate, or evaluate DSC separately.');
    }
    paint(kind, label, title, summaryText, list, 'Lane arithmetic does not prove that a source, cable, dock, or display supports the selected rate or lane assignment. USB4 and Thunderbolt use different tunneling and bandwidth-allocation behavior.');
  }

  function dockRequirement() {
    const os = value('dockOs');
    const displays = number('dockDisplays');
    const charge = number('dockCharge');
    const data = number('dockData');
    const pcie = checked('dockPcie');
    const usbGraphics = checked('dockUsbGraphics');
    if (![displays, charge, data].every(Number.isFinite) || displays < 0 || displays > 4 || charge < 0 || data < 0) {
      paint('bad', 'Check input', '—', 'Use valid display count, charging power, and data rate.', ['Use zero only when that function is not required.'], 'No dock checklist is produced from invalid input.');
      return;
    }
    const list = [];
    if (displays === 0) list.push('No external-display output required.');
    else if (displays === 1) list.push('Require one host-supported display stream and enough link payload for the target mode.');
    else if (os === 'windows') list.push('Require the host display count plus a verified MST, Thunderbolt, USB4, or USB-graphics topology for ' + displays + ' extended displays.');
    else if (os === 'macos') list.push('Do not assume an ordinary MST dock creates ' + displays + ' independent extended displays on macOS; verify the exact Mac display limit and Thunderbolt/native or USB-graphics topology.');
    else list.push('Verify the host GPU display count, desktop/session support, and the dock topology for ' + displays + ' displays.');
    if (displays > 0) list.push('Add the combined display payload and confirm lane allocation, DSC support, and each physical output mode.');
    if (charge === 0) list.push('No host charging pass-through required.');
    else if (charge <= 60) list.push('Require at least ' + fmt(charge, 0) + ' W delivered to the host after dock reserve; a 3 A cable can cover up to 60 W.');
    else if (charge <= 100) list.push('Require at least ' + fmt(charge, 0) + ' W delivered to the host after dock reserve and a 5 A e-marked host cable.');
    else if (charge <= 240) list.push('Require an EPR-capable dock path, power supply, host, and 240 W cable; verify the dock’s delivered-host figure, not only PSU wattage.');
    else list.push('Charging target exceeds the USB PD 240 W ceiling.');
    if (data >= 80) list.push('Require a mutually supported USB 80Gbps or Thunderbolt 5 class path for the data target.');
    else if (data >= 40) list.push('Require a mutually supported USB4 40Gbps or Thunderbolt 3/4/5 class path for the data target.');
    else if (data > 0) list.push('Require at least USB ' + fmt(data, 0) + ' Gbps on host, dock upstream link, and the needed downstream port.');
    if (pcie) list.push('Require explicit PCIe tunneling/enclosure support; connector shape and a generic USB4 label are not enough evidence for the exact accessory.');
    if (usbGraphics) list.push('USB-graphics software is acceptable; verify OS/driver support, security policy, and workload limits separately from native display output.');
    const impossible = charge > 240;
    const complex = displays > 1 || charge > 60 || data >= 40 || pcie;
    paint(impossible ? 'bad' : complex ? 'warn' : 'info', impossible ? 'Outside PD boundary' : complex ? 'Verify advanced path' : 'Baseline checklist', list.length + ' requirements', 'Use this checklist to reject docks whose exact specifications omit a required function.', list, 'This tool deliberately does not name a compatible model. Host firmware, GPU/display limits, OS policy, dock chipset, power reserve, cable, and exact occupied-port combination must all be verified.');
  }

  function hubPowerBudget() {
    const supply = number('hubSupply');
    const host = number('hubHost');
    const reserve = number('hubReserve');
    const devices = [1, 2, 3, 4].map((i) => number('hubDevice' + i));
    if (!Number.isFinite(supply) || supply <= 0 || ![host, reserve, ...devices].every((n) => Number.isFinite(n) && n >= 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive supply and non-negative declared budgets.', ['Unused device rows can stay at zero.'], 'No power budget is produced from invalid input.');
      return;
    }
    const peripheral = devices.reduce((a, b) => a + b, 0);
    const required = host + reserve + peripheral;
    const remaining = supply - required;
    const list = [
      'Power supply: ' + fmt(supply, 1) + ' W.',
      'Host delivery target: ' + fmt(host, 1) + ' W.',
      'Dock electronics/reserve: ' + fmt(reserve, 1) + ' W.',
      'Entered downstream device budget: ' + fmt(peripheral, 1) + ' W.',
      'Total declared budget: ' + fmt(required, 1) + ' W.'
    ];
    const fits = remaining >= 0;
    paint(fits ? (remaining < supply * .1 ? 'warn' : 'ok') : 'bad', fits ? (remaining < supply * .1 ? 'Tight budget' : 'Budget fits') : 'Budget shortfall', fits ? fmt(remaining, 1) + ' W remaining' : fmt(-remaining, 1) + ' W short', fits ? 'The explicit host, reserve, and downstream budgets fit inside the entered supply.' : 'The entered supply cannot cover all declared budgets at once.', list, 'This arithmetic does not predict how a dock allocates power or whether every port can deliver its label simultaneously. Use the manufacturer’s host-delivery figure, downstream limits, reserve policy, and active-port table; do not substitute generic device averages.');
  }

  function troubleshoot() {
    const symptom = value('symptom');
    const changed = value('changed');
    const known = value('known');
    const currentPath = value('path');
    const paths = {
      slow: ['Check the device charging target and required protocol (PD, PPS, or vendor-specific).', 'Test one device on one charger port; shared ports may lower the available profile.', 'Try a known-good 5 A e-marked cable when the target exceeds 60 W.', 'Compare power at low battery charge and cool temperature; charging naturally tapers.'],
      none: ['Inspect and clean the ports; stop if moisture, heat, bent pins, or damage is present.', 'Try a known-good charger and cable separately to isolate the failed part.', 'For small C-powered devices that only work with A-to-C, the device may lack proper USB-C sink signaling.', 'Check whether the selected charger port is output-only and supports the needed voltage.'],
      video: ['Confirm the source USB-C port explicitly supports DisplayPort Alt Mode, USB4, or Thunderbolt video.', 'Use a full-featured cable; a charging cable may have no high-speed lanes.', 'Remove the dock and test a direct USB-C-to-display path.', 'Lower refresh rate/color depth to test a bandwidth limitation.'],
      dual: ['Confirm how many displays the host GPU and operating system support.', 'Check whether the dock uses MST, Thunderbolt/USB4 tunneling, or DisplayLink.', 'macOS generally does not provide two independent extended displays through ordinary MST.', 'Check dock lane allocation and the combined display bandwidth.'],
      disconnect: ['Check for multi-port charger renegotiation when another device is attached.', 'Replace long or marginal high-speed cables.', 'Test without hubs/adapters, then add one component at a time.', 'Check heat, firmware updates, and port power-saving settings.']
    };
    const list = [...(paths[symptom] || paths.none)];
    if (changed === 'yes') list.unshift('Start with the most recent changed cable, charger, dock, display setting, or software update.');
    if (currentPath === 'dock') list.splice(changed === 'yes' ? 1 : 0, 0, 'Bypass the hub or dock and test one direct cable; if the fault clears, add dock functions back one at a time.');
    if (currentPath === 'monitor') list.splice(changed === 'yes' ? 1 : 0, 0, 'Bypass monitor power delivery and test charging and video as separate direct paths.');
    if (currentPath === 'adapters') list.splice(changed === 'yes' ? 1 : 0, 0, 'Remove every intermediate adapter, prove one direct connection, then restore adapters one at a time.');
    if (known === 'no') list.push('Create a control test with one known-good cable and one known-good port.');
    paint('info', 'Isolation plan', String(list.length) + ' checks', 'Work from the simplest known-good connection outward.', list, 'This flow narrows likely causes; it cannot inspect electrical safety, firmware, e-marker data, or negotiated link state. Stop using any component that is hot, damaged, swollen, wet, or intermittently arcing.');
  }

  function usb4FeaturePath() {
    const rates = ['u4Host', 'u4Cable', 'u4Device'].map(number);
    const workload = value('u4Workload');
    const source = value('u4SourceFeature');
    const cable = value('u4CableClass');
    const destination = value('u4DestinationFeature');
    if (!rates.every((n) => Number.isFinite(n) && n > 0) || !workload || !source || !cable || !destination) {
      paint('bad', 'Check input', '—', 'Choose a declared rate and capability state for every link.', ['Use “Unknown” when the exact specification is silent.'], 'No connector-only compatibility assumption is made.');
      return;
    }
    const ceiling = Math.min(...rates);
    const labels = { display: 'DisplayPort tunneling/output', pcie: 'PCIe tunneling', usb: 'USB data tunneling', mixed: 'the required mixed-workload features' };
    const states = [['Source', source], ['Cable', cable], ['Destination', destination]];
    const missing = states.filter(([, state]) => state === 'no').map(([name]) => name);
    const unknown = states.filter(([, state]) => state === 'unknown').map(([name]) => name);
    const list = [
      'Weakest declared USB4/Thunderbolt link rate: ' + fmt(ceiling, 0) + ' Gbps.',
      'Target workload requires ' + labels[workload] + '.',
      ...states.map(([name, state]) => name + ': ' + (state === 'yes' ? 'required feature explicitly declared.' : state === 'no' ? 'required feature explicitly absent.' : 'required feature not verified.'))
    ];
    if (missing.length) list.push('Blocking segment: ' + missing.join(', ') + '.');
    if (unknown.length) list.push('Verify before purchase: ' + unknown.join(', ') + '.');
    const kind = missing.length ? 'bad' : unknown.length ? 'warn' : 'ok';
    paint(kind, missing.length ? 'Feature path broken' : unknown.length ? 'Feature path unverified' : 'Declared feature path', fmt(ceiling, 0) + ' Gbps weakest link', missing.length ? 'At least one segment explicitly lacks the selected workload feature.' : unknown.length ? 'The entered rate fits a USB4-class path, but one or more required features remain unknown.' : 'Every entered segment explicitly declares the selected workload feature.', list, 'USB4 and Thunderbolt labels do not make every optional tunnel, display count, or accessory use case universal. This screen uses only the declarations you entered and does not observe negotiation, firmware, security authorization, or product certification.');
  }

  function usb4Budget() {
    const rate = number('u4Rate');
    const usable = number('u4Usable');
    const demands = ['u4DisplayGbps', 'u4UsbGbps', 'u4PcieGbps'].map(number);
    if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(usable) || usable <= 0 || usable > 100 || !demands.every((n) => Number.isFinite(n) && n >= 0)) {
      paint('bad', 'Check input', '—', 'Use a positive link rate, a usable share from 1–100%, and non-negative tunnel demands.', ['Zero is valid for an unused traffic class.'], 'No bandwidth allocation is inferred from invalid inputs.');
      return;
    }
    const budget = rate * usable / 100;
    const total = demands.reduce((sum, n) => sum + n, 0);
    const remaining = budget - total;
    const list = ['Planning budget: ' + fmt(rate, 0) + ' Gbps × ' + fmt(usable, 1) + '% = ' + fmt(budget, 2) + ' Gbps.', 'Display tunnels: ' + fmt(demands[0], 2) + ' Gbps.', 'USB traffic: ' + fmt(demands[1], 2) + ' Gbps.', 'PCIe traffic: ' + fmt(demands[2], 2) + ' Gbps.', 'Total entered demand: ' + fmt(total, 2) + ' Gbps.'];
    const fits = remaining >= 0;
    paint(fits ? (remaining < budget * .1 ? 'warn' : 'ok') : 'bad', fits ? (remaining < budget * .1 ? 'Tight planning budget' : 'Planning budget fits') : 'Planning shortfall', fits ? fmt(remaining, 2) + ' Gbps remaining' : fmt(-remaining, 2) + ' Gbps short', fits ? 'The entered traffic budgets fit inside the planning share.' : 'The entered traffic budgets exceed the selected planning share.', list, 'USB4 bandwidth is allocated dynamically and protocol overhead is not one universal percentage. The 90% default reflects a Windows USB4 planning limit for explicit allocation, not guaranteed application throughput. Real display, USB, and PCIe behavior depends on both routers, tunnels, drivers, and active traffic.');
  }

  function adapterDirection() {
    const source = value('adapterSource');
    const sink = value('adapterSink');
    const dpplus = value('adapterDpplus');
    if (!source || !sink || !dpplus) {
      paint('bad', 'Check input', '—', 'Choose the source signal, display input, and DP++ evidence state.', ['Read the connection from the computer/output toward the display/input.'], 'Connector shape alone does not establish conversion direction.');
      return;
    }
    const same = source === sink;
    let label = 'Active conversion required';
    let title = 'Protocol converter';
    let kind = 'warn';
    const list = ['Direction: ' + source.toUpperCase() + ' source → ' + sink.toUpperCase() + ' display input.'];
    if (same) { label = 'No protocol conversion'; title = 'Same-signal path'; kind = 'ok'; list.push('Use a cable or adapter that preserves the same signal and supports the target mode.'); }
    else if (source === 'usbc-dp' && sink === 'dp') { label = 'DP Alt Mode adapter'; title = 'Same DisplayPort protocol'; kind = 'ok'; list.push('A purpose-built USB-C-to-DisplayPort adapter/cable can expose the source DisplayPort signal without HDMI conversion.'); }
    else if (source === 'dp' && (sink === 'hdmi' || sink === 'dvi')) {
      if (dpplus === 'yes') { label = 'Passive path may work'; title = 'DP++ source required'; kind = 'warn'; list.push('A simple one-way DP-to-' + sink.toUpperCase() + ' adapter depends on explicit Dual-Mode DisplayPort (DP++) support and the adapter’s exact mode limits.'); }
      else { list.push(dpplus === 'no' ? 'The source explicitly lacks DP++; use an active DisplayPort-to-' + sink.toUpperCase() + ' converter.' : 'DP++ is not verified; choose an active converter or verify the source manual.'); }
    } else if (source === 'usbc-dp' && (sink === 'hdmi' || sink === 'dvi')) list.push('Use a one-way USB-C DisplayPort Alt Mode to ' + sink.toUpperCase() + ' protocol adapter rated for the exact mode and features.');
    else if (source === 'usb-a') { label = 'USB graphics adapter'; title = 'Driver-based video'; kind = 'warn'; list.push('USB-A carries no DisplayPort Alt Mode. This requires a USB graphics chipset, supported driver, and suitable workload expectations.'); }
    else if (sink === 'usbc-dp') { label = 'Specialized reverse converter'; title = 'Powered active path'; kind = 'bad'; list.push('A common USB-C-to-video cable is the wrong direction. Look for an explicitly powered ' + source.toUpperCase() + '-to-USB-C display converter and verify display compatibility.'); }
    else list.push('Use an active, directional ' + source.toUpperCase() + '-to-' + sink.toUpperCase() + ' protocol converter rated for the exact mode.');
    list.push('Verify resolution, refresh, color depth, HDR, HDCP, audio, DSC/VRR support, and direction on the exact adapter.');
    paint(kind, label, title, 'The required product category follows from signal direction, not connector fit.', list, 'This tool classifies conversion categories; it does not validate an exact adapter chipset, EDID handling, protected-content support, or target timing. DP++ is relevant only to a DisplayPort source converting to HDMI/DVI.');
  }

  function mstChain() {
    const os = value('mstOs');
    const displays = number('mstDisplays');
    const demand = number('mstDemand');
    const capacity = number('mstCapacity');
    const host = value('mstHost');
    const chain = value('mstChain');
    const mode = value('mstMode');
    if (!os || !Number.isFinite(displays) || displays < 1 || displays > 6 || !Number.isFinite(demand) || demand <= 0 || !Number.isFinite(capacity) || capacity <= 0 || !host || !chain || !mode) {
      paint('bad', 'Check input', '—', 'Complete the topology and use positive display-count and payload values.', ['Enter the combined payload for every display sharing this MST link.'], 'No MST verdict is produced from incomplete topology data.');
      return;
    }
    const blockers = [];
    const unknown = [];
    if (displays > 1 && host === 'no') blockers.push('host/source MST support'); else if (displays > 1 && host === 'unknown') unknown.push('host/source MST support');
    if (displays > 1 && chain === 'no') blockers.push('MST hub or intermediate DP-out support'); else if (displays > 1 && chain === 'unknown') unknown.push('MST hub or intermediate DP-out support');
    if (os === 'macos' && mode === 'extended' && displays > 1) blockers.push('ordinary MST extended-desktop policy on macOS');
    if (demand > capacity) blockers.push('combined link payload');
    const list = ['Topology: ' + displays + ' display(s), ' + mode + ' mode, ' + os + '.', 'Combined entered payload: ' + fmt(demand, 2) + ' Gbps; usable link payload: ' + fmt(capacity, 2) + ' Gbps.', host === 'yes' ? 'Source explicitly declares MST.' : 'Source MST: ' + host + '.', chain === 'yes' ? 'The MST hub or every intermediate daisy-chain display explicitly declares the required DP output/MST role.' : 'Chain MST role: ' + chain + '.'];
    if (blockers.length) list.push('Blocking condition(s): ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Still verify: ' + unknown.join('; ') + '.');
    const kind = blockers.length ? 'bad' : unknown.length ? 'warn' : 'ok';
    paint(kind, blockers.length ? 'Topology blocked' : unknown.length ? 'Topology unverified' : 'Declared MST path', blockers.length ? blockers.length + ' blocker(s)' : fmt(capacity - demand, 2) + ' Gbps headroom', blockers.length ? 'The entered ordinary MST topology has at least one explicit blocker.' : unknown.length ? 'Payload fits, but a required MST declaration is unknown.' : 'Payload and the declared ordinary MST topology are consistent.', list, 'This screens an ordinary DisplayPort MST branch. It does not represent Thunderbolt/USB4 multi-stream tunneling or USB graphics, and it cannot prove GPU display count, exact timing, DSC, adapter behavior, or operating-system version behavior.');
  }

  function pdFixedProfile() {
    const targetV = number('fixedTargetV');
    const targetA = number('fixedTargetA');
    const rows = [1, 2, 3, 4].map((i) => [number('fixedV' + i), number('fixedA' + i)]);
    if (![targetV, targetA].every((n) => Number.isFinite(n) && n > 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive fixed-voltage request and current.', ['Use a documented fixed PDO request, not a PPS operating point.'], 'No profile is inferred from device wattage alone.');
      return;
    }
    const partial = rows.some(([v, a]) => (Number.isFinite(v) && v > 0) !== (Number.isFinite(a) && a > 0));
    const profiles = rows.filter(([v, a]) => Number.isFinite(v) && v > 0 && Number.isFinite(a) && a > 0);
    if (partial || !profiles.length) {
      paint('bad', 'Check input', '—', 'Enter voltage and current together for at least one charger fixed profile.', ['Leave both fields blank for an unused row.'], 'Profiles from different ports or active-port combinations must not be combined.');
      return;
    }
    const exact = profiles.filter(([v]) => Math.abs(v - targetV) < .001);
    const matches = exact.filter(([, a]) => a >= targetA);
    const requestW = targetV * targetA;
    const list = ['Requested fixed point: ' + fmt(targetV, 2) + ' V × ' + fmt(targetA, 2) + ' A = ' + fmt(requestW, 2) + ' W.', ...profiles.map(([v, a], i) => 'Entered profile ' + (i + 1) + ': ' + fmt(v, 2) + ' V × ' + fmt(a, 2) + ' A = ' + fmt(v * a, 2) + ' W.')];
    if (!exact.length) list.push('No entered fixed profile uses the requested voltage.');
    else if (!matches.length) list.push('The voltage exists, but every entered profile at that voltage has insufficient current.');
    else list.push('Matching profile: ' + fmt(matches[0][0], 2) + ' V at up to ' + fmt(matches[0][1], 2) + ' A.');
    paint(matches.length ? 'ok' : 'bad', matches.length ? 'Fixed profile match' : 'Fixed profile mismatch', fmt(requestW, 2) + ' W request', matches.length ? 'One entered fixed PDO covers both the requested voltage and current.' : 'The entered fixed PDO list does not cover the request.', list, 'A fixed-PDO match does not prove that the device asks for it, that the active charger port exposes it in the current multi-port state, or that the cable and product support the full path. PPS/APDOs are a separate check.');
  }

  function multiportCompare() {
    const a = [1, 2, 3, 4].map((i) => number('scenarioA' + i));
    const b = [1, 2, 3, 4].map((i) => number('scenarioB' + i));
    if (![...a, ...b].every((n) => Number.isFinite(n) && n >= 0)) {
      paint('bad', 'Check input', '—', 'Enter non-negative manufacturer-table outputs for all ports.', ['Use zero only when that port is disabled in that exact scenario.'], 'This comparator does not invent missing table values.');
      return;
    }
    const totalA = a.reduce((s, n) => s + n, 0);
    const totalB = b.reduce((s, n) => s + n, 0);
    const changes = a.map((n, i) => b[i] - n);
    const list = changes.map((delta, i) => 'Port ' + (i + 1) + ': ' + fmt(a[i], 1) + ' W → ' + fmt(b[i], 1) + ' W (' + (delta > 0 ? '+' : '') + fmt(delta, 1) + ' W).');
    list.push('Declared scenario total: ' + fmt(totalA, 1) + ' W → ' + fmt(totalB, 1) + ' W (' + (totalB - totalA > 0 ? '+' : '') + fmt(totalB - totalA, 1) + ' W).');
    const disabled = changes.filter((d, i) => a[i] > 0 && b[i] === 0).length;
    paint(disabled ? 'warn' : 'info', disabled ? 'Port disabled in B' : 'Scenario comparison', fmt(changes.filter((d) => d !== 0).length, 0) + ' port changes', 'Compare exact occupied-port rows before moving a device or adding another cable.', list, 'These are declared table values, not measured allocations. Dynamic chargers may renegotiate when plugs change; port labels, total box wattage, and proportional division cannot substitute for the manufacturer row for each scenario.');
  }

  function directDockIsolation() {
    const functions = ['Power', 'Data', 'Video'];
    const direct = functions.map((name) => value('direct' + name));
    const dock = functions.map((name) => value('dock' + name));
    if ([...direct, ...dock].some((state) => !state)) {
      paint('bad', 'Check input', '—', 'Record pass, fail, or not tested for every direct and dock path.', ['Use the same host, target device, mode, and known-good cable where practical.'], 'No isolation inference is made from missing A/B results.');
      return;
    }
    const list = [];
    let dockOnly = 0;
    let directFail = 0;
    functions.forEach((name, i) => {
      if (direct[i] === 'pass' && dock[i] === 'fail') { dockOnly++; list.push(name + ': direct passes but dock path fails—inspect the dock function, upstream link, port, power budget, firmware, and adapter chain.'); }
      else if (direct[i] === 'fail') { directFail++; list.push(name + ': direct path also fails—resolve the host/cable/target or requirement before blaming the dock.'); }
      else if (direct[i] === 'pass' && dock[i] === 'pass') list.push(name + ': both paths pass in this control test.');
      else list.push(name + ': not sufficiently tested for a comparison.');
    });
    const kind = dockOnly ? 'warn' : directFail ? 'bad' : 'info';
    paint(kind, dockOnly ? 'Dock layer implicated' : directFail ? 'Direct baseline fails' : 'More isolation needed', dockOnly ? dockOnly + ' dock-only failure(s)' : directFail ? directFail + ' direct failure(s)' : 'No isolated failure', dockOnly ? 'At least one function passes directly and fails only through the dock.' : directFail ? 'A failing direct baseline prevents a dock-only diagnosis.' : 'The recorded comparison does not isolate a failing layer.', list, 'A/B results narrow the implicated layer; they do not identify an exact defective component. Control cable, port, mode, power source, device, and software variables, then add one dock function at a time.');
  }

  function portDecode() {
    const data = number('portData');
    const power = number('portPower');
    const direction = value('portDirection');
    const display = value('portDisplay');
    const pcie = value('portPcie');
    const usb4 = value('portUsb4');
    if (!Number.isFinite(data) || data < 0 || !Number.isFinite(power) || power < 0 || !direction || !display || !pcie || !usb4) {
      paint('bad', 'Check input', '—', 'Enter non-negative declared rates and choose every capability state.', ['Use zero and “Unknown” when the public specification does not declare a capability.'], 'No capability is inferred from the USB-C connector alone.');
      return;
    }
    const known = [];
    const unknown = [];
    known.push(data > 0 ? 'Declared data ceiling: ' + fmt(data, 0) + ' Gbps.' : 'No high-speed data rate supplied.');
    known.push(power > 0 ? 'Declared USB PD power: up to ' + fmt(power, 0) + ' W, direction ' + direction + '.' : 'No USB PD wattage supplied; direction ' + direction + '.');
    [['Display output', display], ['PCIe tunneling', pcie], ['USB4/Thunderbolt class', usb4]].forEach(([label, state]) => state === 'unknown' ? unknown.push(label) : known.push(label + ': ' + (state === 'yes' ? 'declared.' : 'explicitly not declared/absent.')));
    const contradictions = [];
    if (usb4 === 'yes' && data > 0 && data < 20) contradictions.push('USB4-class claim conflicts with a supplied link ceiling below 20 Gbps; recheck whether the number describes another downstream USB port.');
    if (power > 240) contradictions.push('The entered USB PD power exceeds the 240 W public USB PD ceiling.');
    if (pcie === 'yes' && usb4 === 'no') contradictions.push('PCIe tunneling normally requires a USB4/Thunderbolt-class path; clarify the published wording.');
    if (unknown.length) known.push('Still unknown: ' + unknown.join(', ') + '.');
    const kind = contradictions.length ? 'bad' : unknown.length ? 'warn' : 'info';
    paint(kind, contradictions.length ? 'Claims conflict' : unknown.length ? 'Incomplete port record' : 'Declared port record', known.filter((item) => !item.startsWith('Still unknown')).length + ' facts', contradictions.length ? 'At least one entered claim needs clarification.' : unknown.length ? 'The port record preserves unknowns instead of turning them into capabilities.' : 'The entered capabilities form a usable requirement record.', known.concat(contradictions), 'A port label may omit optional functions, and a computer can route different controllers to visually identical ports. Verify the exact model, port number, manual, operating-system telemetry, and certification record; this decoder cannot probe hardware.');
  }

  function videoFeatureChain() {
    const features = [['HDR', 'Hdr'], ['VRR / Adaptive Sync', 'Vrr'], ['HDCP', 'Hdcp'], ['Audio', 'Audio'], ['DSC', 'Dsc']];
    features.forEach(([, key]) => {
      const sourceSelect = form.elements['featureSource' + key];
      if (sourceSelect && !Array.from(sourceSelect.options).some((option) => option.value === 'skip')) {
        sourceSelect.add(new Option('Not required', 'skip'), 0);
      }
    });
    const missing = [];
    const unknown = [];
    const list = [];
    for (const [label, key] of features) {
      const states = [value('featureSource' + key), value('featureAdapter' + key), value('featureSink' + key)];
      if (states[0] === 'skip') {
        list.push(label + ': not required for this decision.');
        continue;
      }
      if (states.some((state) => !state)) {
        paint('bad', 'Check input', '—', 'Choose yes, no, or unknown for every required feature and segment.', ['Choose “Not required” in the source column to exclude an entire feature row.'], 'No end-to-end feature is inferred from a connector or bandwidth claim.');
        return;
      }
      if (states.includes('no')) { missing.push(label); list.push(label + ': blocked by ' + ['source', 'adapter/dock', 'display'].filter((_, i) => states[i] === 'no').join(', ') + '.'); }
      else if (states.includes('unknown')) { unknown.push(label); list.push(label + ': unverified at ' + ['source', 'adapter/dock', 'display'].filter((_, i) => states[i] === 'unknown').join(', ') + '.'); }
      else list.push(label + ': explicitly declared across source, adapter/dock, and display.');
    }
    const kind = missing.length ? 'bad' : unknown.length ? 'warn' : 'ok';
    const evaluated = list.filter((item) => !item.includes('not required')).length;
    paint(kind, missing.length ? 'Feature chain blocked' : unknown.length ? 'Feature chain unverified' : 'Declared feature chain', missing.length ? missing.length + ' blocked feature(s)' : unknown.length ? unknown.length + ' unknown feature(s)' : evaluated + ' feature(s) declared', missing.length ? 'At least one requested video feature is explicitly absent in the chain.' : unknown.length ? 'No explicit blocker was entered, but one or more segment claims are unknown.' : evaluated ? 'Every evaluated feature is explicitly declared end to end.' : 'No video feature is selected for evaluation.', list, 'An end-to-end declaration is necessary but not sufficient. Exact resolution/refresh combinations, color format, EDID, firmware, operating-system policy, content protection version, app behavior, and adapter implementation can still limit a feature.');
  }

  function hubBandwidth() {
    const upstream = number('hubUpstream');
    const share = number('hubShare');
    const demands = [1, 2, 3, 4].map((i) => number('hubDemand' + i));
    if (!Number.isFinite(upstream) || upstream <= 0 || !Number.isFinite(share) || share <= 0 || share > 100 || demands.some((n) => !Number.isFinite(n) || n < 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive upstream pool, a 1–100% planning share, and non-negative device demands.', ['Use zero for an unused device row.'], 'This planner uses only the values you enter; it does not infer controller efficiency or live traffic.');
      return;
    }
    const budget = upstream * share / 100;
    const total = demands.reduce((sum, n) => sum + n, 0);
    const margin = budget - total;
    const active = demands.filter((n) => n > 0).length;
    const list = demands.map((n, i) => 'Device ' + (i + 1) + ': ' + fmt(n, 2) + ' Gbps planning demand.');
    list.push('Shared upstream budget: ' + fmt(upstream, 2) + ' Gbps × ' + fmt(share, 1) + '% = ' + fmt(budget, 2) + ' Gbps.');
    list.push(margin >= 0 ? 'Planning headroom: ' + fmt(margin, 2) + ' Gbps.' : 'Planning shortfall: ' + fmt(-margin, 2) + ' Gbps.');
    paint(margin >= 0 ? 'ok' : 'bad', margin >= 0 ? 'Budget fits' : 'Shared pool exceeded', fmt(total, 2) + ' / ' + fmt(budget, 2) + ' Gbps', margin >= 0 ? 'The entered simultaneous demand fits inside the visible planning budget.' : 'The entered devices demand more than the selected shared planning budget.', list, 'This is an aggregate planning screen for one shared upstream USB pool. Protocol overhead, burstiness, storage workload, hub translation, controller topology, firmware, and operating-system scheduling affect measured throughput. A fit is not a speed guarantee.');
  }

  function roleMatch() {
    const aPower = value('roleAPower');
    const bPower = value('roleBPower');
    const aData = value('roleAData');
    const bData = value('roleBData');
    const aVideo = value('roleAVideo');
    const bVideo = value('roleBVideo');
    const powerIntent = value('rolePowerIntent');
    const dataIntent = value('roleDataIntent');
    const videoIntent = value('roleVideoIntent');
    if ([aPower, bPower, aData, bData, aVideo, bVideo, powerIntent, dataIntent, videoIntent].some((v) => !v)) {
      paint('bad', 'Check input', '—', 'Choose declared roles and the intended direction for power, data, and video.', ['Use Unknown when documentation does not declare a role, and Not needed for an unused function.'], 'Connector shape alone does not establish a role.');
      return;
    }
    const blockers = [];
    const unknown = [];
    const list = [];
    const supports = (role, required, dual) => role === required || role === dual;
    const checkPair = (label, intent, aRole, bRole, forwardRequired, reverseRequired, dual) => {
      if (intent === 'none') { list.push(label + ': not required.'); return; }
      const forward = intent === 'a-b';
      const leftRequired = forward ? forwardRequired : reverseRequired;
      const rightRequired = forward ? reverseRequired : forwardRequired;
      const left = forward ? aRole : bRole;
      const right = forward ? bRole : aRole;
      if (left === 'unknown' || right === 'unknown') unknown.push(label + ' role declaration');
      if (left !== 'unknown' && !supports(left, leftRequired, dual)) blockers.push(label + ' origin is not declared as ' + leftRequired);
      if (right !== 'unknown' && !supports(right, rightRequired, dual)) blockers.push(label + ' destination is not declared as ' + rightRequired);
      list.push(label + ': intended ' + (forward ? 'A → B' : 'B → A') + '; entered roles ' + left + ' → ' + right + '.');
    };
    checkPair('Power', powerIntent, aPower, bPower, 'source', 'sink', 'drp');
    checkPair('Data', dataIntent, aData, bData, 'host', 'device', 'drd');
    checkPair('Video', videoIntent, aVideo, bVideo, 'source', 'sink', 'dual');
    if (blockers.length) list.push('Role mismatch: ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Still verify: ' + unknown.join('; ') + '.');
    paint(blockers.length ? 'bad' : unknown.length ? 'warn' : 'ok', blockers.length ? 'Role mismatch' : unknown.length ? 'Roles unverified' : 'Declared roles align', blockers.length ? blockers.length + ' blocker(s)' : unknown.length ? unknown.length + ' unknown(s)' : 'A ↔ B', blockers.length ? 'At least one endpoint cannot perform the intended declared role.' : unknown.length ? 'No mismatch is proven, but one or more required roles are unknown.' : 'The entered endpoint roles align with every selected direction.', list, 'USB Power Delivery can swap some power and data roles when both products support the behavior. This checker compares declared roles only; it cannot prove policy, cable capability, Alt Mode entry, power level, or live negotiation.');
  }

  function usb4Fallback() {
    const target = number('fallbackTarget');
    const observed = number('fallbackObserved');
    const host = number('fallbackHost');
    const cable = number('fallbackCable');
    const device = number('fallbackDevice');
    const path = value('fallbackPath');
    const direct = value('fallbackDirect');
    const enumerated = value('fallbackEnumerated');
    if (![target, observed, host, cable, device].every((n) => Number.isFinite(n) && n >= 0) || target <= 0 || observed <= 0 || !path || !direct || !enumerated) {
      paint('bad', 'Check input', '—', 'Complete the target, observed rate, segment claims, path, direct test, and operating-system evidence.', ['Use 0 Gbps only for an unknown segment declaration.'], 'This isolates evidence; it does not read a negotiated link.');
      return;
    }
    const list = ['Target class: ' + fmt(target, 0) + ' Gbps; observed or reported class: ' + fmt(observed, 0) + ' Gbps.', 'Declared ceilings — host: ' + (host || 'unknown') + ', cable: ' + (cable || 'unknown') + ', device: ' + (device || 'unknown') + ' Gbps.'];
    const blockers = [];
    const unknown = [];
    [['host port', host], ['cable', cable], ['device', device]].forEach(([label, cap]) => cap === 0 ? unknown.push(label) : cap < target && blockers.push(label + ' declared at ' + cap + ' Gbps'));
    if (path === 'intermediary' && direct === 'target') blockers.push('intermediary path because the direct control reaches target');
    if (observed < target) list.push('Fallback gap: ' + fmt(target - observed, 0) + ' Gbps below the intended class.');
    else list.push('The entered observed class reaches the target; no rate fallback is present in this record.');
    if (enumerated === 'no') list.push('The intended USB4 hub/device is not listed by the operating system; recheck port, cable, intermediary, power, and device support.');
    if (direct === 'below') list.push('The direct control is also below target, so the intermediary is not isolated as the only cause.');
    if (blockers.length) list.push('Implicated evidence: ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Missing declarations: ' + unknown.join(', ') + '.');
    const atTarget = observed >= target;
    const conflict = atTarget && blockers.length;
    const kind = conflict ? 'warn' : atTarget ? 'ok' : blockers.length ? 'bad' : 'warn';
    paint(kind, conflict ? 'Claims conflict' : atTarget ? 'Target class reached' : blockers.length ? 'Fallback evidence found' : 'Fallback not isolated', fmt(observed, 0) + ' Gbps entered', conflict ? 'The entered observed class reaches target, but at least one segment declaration or path comparison contradicts it.' : atTarget ? 'The entered link class meets the intended target.' : blockers.length ? 'At least one entered segment or A/B test explains a lower class.' : 'The rate is below target, but the current evidence does not isolate a segment.', list, 'A marketed maximum is not proof of the live negotiated class, and application throughput is not the raw link rate. Verify exact port, cable, device, intermediary, power, firmware, operating-system USB4 listing, and a direct known-good control.');
  }

  function highRefreshIsolation() {
    const demand = number('refreshDemand');
    const capacity = number('refreshCapacity');
    const low = value('refreshLow');
    const direct = value('refreshDirect');
    const dock = value('refreshDock');
    const reduced = value('refreshReduced');
    const features = value('refreshFeatures');
    if (![demand, capacity].every((n) => Number.isFinite(n) && n > 0) || [low, direct, dock, reduced, features].some((v) => !v)) {
      paint('bad', 'Check input', '—', 'Enter positive payload values and complete every control-test state.', ['Use the same display, cable, timing, and feature settings when comparing paths.'], 'No exact mode is inferred from resolution and refresh labels alone.');
      return;
    }
    const list = ['Entered target payload: ' + fmt(demand, 2) + ' Gbps; entered usable path capacity: ' + fmt(capacity, 2) + ' Gbps.'];
    const blockers = [];
    const unknown = [];
    if (demand > capacity) blockers.push('target payload exceeds entered usable capacity');
    if (features === 'no') blockers.push('a required end-to-end feature is explicitly absent');
    if (features === 'unknown') unknown.push('HDR/VRR/DSC/color-depth feature chain');
    if (direct === 'pass' && dock === 'fail') blockers.push('dock/adapter path because the direct target mode passes');
    if (direct === 'fail') list.push('The target also fails directly; establish the host, cable, display, timing, and feature baseline before blaming a dock.');
    if (low === 'pass' && reduced === 'pass') list.push('Lower refresh and/or reduced color/HDR succeeds, which is consistent with a capacity or exact-mode feature boundary.');
    if (low === 'fail') blockers.push('basic lower-refresh baseline also fails');
    if (blockers.length) list.push('Implicated evidence: ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Still verify: ' + unknown.join(', ') + '.');
    paint(blockers.length ? 'bad' : unknown.length ? 'warn' : 'info', blockers.length ? 'Failure layer narrowed' : unknown.length ? 'Mode unverified' : 'More control evidence needed', demand > capacity ? fmt(demand - capacity, 2) + ' Gbps over' : fmt(capacity - demand, 2) + ' Gbps headroom', blockers.length ? 'The entered payload or A/B evidence identifies at least one boundary.' : unknown.length ? 'Payload fits, but an end-to-end feature declaration remains unknown.' : 'The entered record has no explicit capacity blocker; continue exact-mode isolation.', list, 'Payload arithmetic is a screen, not a mode guarantee. Exact timings, blanking, chroma, bit depth, HDR, DSC, VRR, GPU limits, MST, EDID, operating-system policy, firmware, and adapter implementation can change the result.');
  }

  function peripheralDropout() {
    const trigger = value('dropTrigger');
    const scope = value('dropScope');
    const direct = value('dropDirect');
    const powered = value('dropPowered');
    const lighter = value('dropLighter');
    const cable = value('dropCable');
    if ([trigger, scope, direct, powered, lighter, cable].some((v) => !v)) {
      paint('bad', 'Check input', '—', 'Complete the trigger, failure scope, and each controlled comparison.', ['Use Not tested when a control has not been run.'], 'A symptom alone does not identify a failed component.');
      return;
    }
    const list = ['Trigger: ' + trigger.replace('-', ' ') + '; scope: ' + scope.replace('-', ' ') + '.'];
    const evidence = [];
    if (direct === 'stable') evidence.push('hub/dock or shared upstream layer: direct connection is stable');
    if (direct === 'drops') evidence.push('device/host/cable/software baseline: direct connection also drops');
    if (powered === 'helps') evidence.push('power budget or power delivery: external power prevents the dropout');
    if (lighter === 'helps') evidence.push('shared load or bandwidth/power contention: lighter load prevents the dropout');
    if (cable === 'helps') evidence.push('original cable/path integrity: alternate known-good cable prevents the dropout');
    if (trigger === 'idle') evidence.push('power-state/resume path: the failure follows idle or wake');
    if (scope === 'all') evidence.push('common upstream link, hub power, or controller: all downstream functions drop together');
    else evidence.push('device-specific branch: only one peripheral drops');
    list.push(...evidence.map((item, i) => (i + 1) + '. ' + item + '.'));
    const strong = [direct, powered, lighter, cable].filter((v) => v === 'stable' || v === 'drops' || v === 'helps' || v === 'nochange').length;
    paint(strong >= 2 ? 'warn' : 'info', strong >= 2 ? 'Evidence ranked' : 'More A/B tests needed', evidence.length + ' clue(s)', strong >= 2 ? 'The controlled comparisons narrow the next layer to inspect.' : 'Run direct, powered, lighter-load, and known-good-cable controls one at a time.', list, 'These tests rank implicated layers; they do not diagnose an exact defective product. Preserve the same workload and change one variable at a time. Drivers, firmware, thermal behavior, connector fit, storage faults, and operating-system power policy can produce similar symptoms.');
  }

  function oneCableMonitor() {
    const hostVideo = value('monitorHostVideo');
    const cableVideo = value('monitorCableVideo');
    const monitorVideo = value('monitorInputVideo');
    const displayDemand = number('monitorDisplayDemand');
    const displayCapacity = number('monitorDisplayCapacity');
    const laptopPower = number('monitorLaptopPower');
    const monitorPower = number('monitorPowerOffer');
    const cablePower = number('monitorCablePower');
    const usbDemand = number('monitorUsbDemand');
    const usbCapacity = number('monitorUsbCapacity');
    if ([hostVideo, cableVideo, monitorVideo].some((v) => !v) || ![displayDemand, displayCapacity, laptopPower, monitorPower, cablePower, usbDemand, usbCapacity].every((n) => Number.isFinite(n) && n >= 0) || displayDemand <= 0 || displayCapacity <= 0) {
      paint('bad', 'Check input', '—', 'Complete the three video declarations and enter non-negative power/data values plus positive display payload values.', ['Use zero only when charging or monitor USB data is not required.'], 'A USB-C receptacle does not guarantee video, charging, or downstream USB.');
      return;
    }
    const blockers = [];
    const unknown = [];
    [['host video output', hostVideo], ['cable video path', cableVideo], ['monitor USB-C video input', monitorVideo]].forEach(([label, state]) => state === 'no' ? blockers.push(label) : state === 'unknown' && unknown.push(label));
    if (displayDemand > displayCapacity) blockers.push('display payload exceeds entered usable capacity');
    const powerCeiling = Math.min(monitorPower, cablePower);
    if (laptopPower > 0 && powerCeiling < laptopPower) blockers.push('monitor/cable charging ceiling is below laptop target');
    if (laptopPower > 100) unknown.push('USB PD EPR support across monitor, host, and 5 A EPR cable');
    if (usbDemand > usbCapacity) blockers.push('monitor hub demand exceeds entered USB upstream pool');
    const list = ['Display: ' + fmt(displayDemand, 2) + ' Gbps demand / ' + fmt(displayCapacity, 2) + ' Gbps usable capacity.', 'Charging: ' + fmt(laptopPower, 0) + ' W target / ' + fmt(powerCeiling, 0) + ' W declared monitor-and-cable ceiling.', 'Monitor USB: ' + fmt(usbDemand, 2) + ' Gbps demand / ' + fmt(usbCapacity, 2) + ' Gbps upstream pool.'];
    if (blockers.length) list.push('Blocking condition(s): ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Still verify: ' + unknown.join(', ') + '.');
    paint(blockers.length ? 'bad' : unknown.length ? 'warn' : 'ok', blockers.length ? 'One-cable plan blocked' : unknown.length ? 'One-cable plan unverified' : 'Declared one-cable fit', blockers.length ? blockers.length + ' blocker(s)' : unknown.length ? unknown.length + ' unknown(s)' : 'Video + power + USB', blockers.length ? 'At least one entered requirement cannot pass through this one-cable plan.' : unknown.length ? 'The numeric budgets fit, but a required video declaration is unknown.' : 'The entered video, charging, and USB requirements fit on paper.', list, 'This combines declared requirements; it does not prove an exact host/monitor pairing. Lane sharing, DSC, display timing, monitor KVM behavior, Ethernet/audio, wake/sleep, firmware, cable construction, and power negotiation still require exact-model verification.');
  }

  function hdmiRoutingSelector() {
    const sources = number('hrSources');
    const displays = number('hrDisplays');
    const behavior = value('hrBehavior');
    if (![sources, displays].every((n) => Number.isInteger(n) && n >= 1 && n <= 64)) {
      paint('bad', 'Check input', '—', 'Enter whole source and display counts from 1 to 64.', ['Count physical sources and independently connected display destinations.'], 'No device class is selected from invalid counts.');
      return;
    }
    let device = 'Direct HDMI link';
    let kind = 'ok';
    const list = ['Inventory: ' + sources + ' source(s), ' + displays + ' display destination(s).'];
    if (behavior === 'multiview') {
      device = 'HDMI multiviewer';
      list.push('The defining requirement is simultaneous composition of multiple sources on one screen.');
      if (displays > 1) list.push('If each destination needs independent multiview layouts, verify one processed output per destination or add a matrix after the multiview stage.');
    } else if (behavior === 'independent') {
      if (sources > 1 && displays > 1) device = 'HDMI matrix';
      else if (sources > 1) device = 'HDMI switch';
      else if (displays > 1) device = 'HDMI splitter';
      else device = 'Direct HDMI link';
      list.push('Independent crosspoint choice is only meaningful when both source and destination counts exceed one.');
    } else if (behavior === 'mirror') {
      if (displays > 1) device = sources > 1 ? 'HDMI switch + splitter, or matrix' : 'HDMI splitter';
      else device = sources > 1 ? 'HDMI switch' : 'Direct HDMI link';
      list.push('Every active display receives the same selected source.');
    } else {
      if (displays > 1) {
        device = sources > 1 ? 'HDMI matrix or switched distribution' : 'HDMI splitter';
        kind = 'warn';
        list.push('Clarify whether all displays mirror one selected source or each display needs its own selection.');
      } else device = sources > 1 ? 'HDMI switch' : 'Direct HDMI link';
    }
    list.push('Minimum physical capacity: ' + sources + ' input(s) and ' + displays + ' output(s), before spare ports.');
    paint(kind, kind === 'ok' ? 'Topology selected' : 'Behavior clarification needed', device, 'The entered viewing behavior maps to this routing class.', list, 'This selects a functional device class only. Verify exact resolution/refresh, EDID, scaling, HDR, VRR, audio, ARC/eARC, CEC, HDCP, cable, and extender declarations separately.');
  }

  function hdmiMatrixSize() {
    const sources = number('hmSources');
    const displays = number('hmDisplays');
    const spareInputs = number('hmSpareInputs');
    const spareOutputs = number('hmSpareOutputs');
    const audioZones = number('hmAudioZones');
    if (![sources, displays, spareInputs, spareOutputs, audioZones].every((n) => Number.isInteger(n) && n >= 0) || sources < 1 || displays < 1 || [sources, displays].some((n) => n > 64) || [spareInputs, spareOutputs, audioZones].some((n) => n > 32)) {
      paint('bad', 'Check input', '—', 'Use whole, non-negative counts within the displayed limits.', ['At least one source and one display zone are required.'], 'No capacity is calculated from invalid counts.');
      return;
    }
    const inputs = sources + spareInputs;
    const outputs = displays + audioZones + spareOutputs;
    const tiers = [2, 4, 8, 16, 32, 64, 128];
    const inputTier = tiers.find((tier) => tier >= inputs) || inputs;
    const outputTier = tiers.find((tier) => tier >= outputs) || outputs;
    const crosspoints = inputs * outputs;
    const list = [
      sources + ' active source(s) + ' + spareInputs + ' spare input(s) = ' + inputs + ' required inputs.',
      displays + ' display zone(s) + ' + audioZones + ' audio-only zone(s) + ' + spareOutputs + ' spare output(s) = ' + outputs + ' required outputs.',
      'The minimum route table contains ' + crosspoints.toLocaleString() + ' possible input-to-output crosspoints.',
      'A common power-of-two planning tier would be ' + inputTier + '×' + outputTier + '; actual product sizes vary.'
    ];
    paint('ok', 'Capacity planned', inputs + '×' + outputs + ' minimum', 'This is the smallest entered input/output capacity before product-specific feature checks.', list, 'An audio extractor does not always consume a matrix output, and some audio-only outputs follow rather than independently select a video route. Count only independently routable zones and verify the exact architecture.');
  }

  function hdmiMixedDisplay() {
    const source = number('hdSource');
    const target = number('hdTarget');
    const displayA = number('hdA');
    const displayB = number('hdB');
    const edid = value('hdEdid');
    const scaler = value('hdScaler');
    const labels = { 1: '1080p60', 2: '4K30', 3: '4K60', 4: '4K120' };
    if (![source, target, displayA, displayB].every((n) => Number.isInteger(n) && n >= 1 && n <= 4) || !['lowest', 'copyA', 'copyB', 'fixed'].includes(edid) || !['none', 'b', 'both'].includes(scaler)) {
      paint('bad', 'Check input', '—', 'Choose a valid mode, EDID policy, and scaler declaration.', ['No display behavior is inferred from an incomplete plan.'], 'The mode ladder is a planning simplification, not a timing database.');
      return;
    }
    if (target > source) {
      paint('bad', 'Source ceiling', labels[source] + ' maximum', 'The requested mode exceeds the entered source maximum.', ['Lower the target or verify a higher source output claim.'], 'A downstream scaler cannot make the source emit a mode above its declared output ceiling.');
      return;
    }
    const advertised = edid === 'lowest' ? Math.min(displayA, displayB) : edid === 'copyA' ? displayA : edid === 'copyB' ? displayB : target;
    const selected = Math.min(target, source, advertised);
    const aNeeds = selected > displayA;
    const bNeeds = selected > displayB;
    const aScaled = aNeeds && scaler === 'both';
    const bScaled = bNeeds && (scaler === 'b' || scaler === 'both');
    const unresolved = (aNeeds && !aScaled) || (bNeeds && !bScaled);
    const targetCapped = selected < target;
    const list = [
      'Requested source mode: ' + labels[target] + '; planned upstream mode: ' + labels[selected] + '.',
      'EDID policy presents up to ' + labels[advertised] + ' in this simplified mode ladder.',
      aNeeds ? (aScaled ? 'Display A needs and has declared per-output downscaling.' : 'Display A cannot accept the planned upstream mode and lacks declared downscaling.') : 'Display A accepts the planned upstream mode.',
      bNeeds ? (bScaled ? 'Display B needs and has declared per-output downscaling.' : 'Display B cannot accept the planned upstream mode and lacks declared downscaling.') : 'Display B accepts the planned upstream mode.'
    ];
    let kind = 'ok';
    let statusText = 'Declared shared-mode fit';
    let summaryText = 'Both displays can accept the planned upstream mode without undeclared processing.';
    if (unresolved) {
      kind = 'bad'; statusText = 'Mixed-mode conflict'; summaryText = 'At least one output cannot accept the planned upstream mode.';
    } else if (targetCapped) {
      kind = 'warn'; statusText = 'Common-mode fallback'; summaryText = 'Both displays fit, but the EDID policy lowers the requested mode.';
    } else if (aScaled || bScaled) {
      kind = 'warn'; statusText = 'Scaler required'; summaryText = 'The plan depends on exact declared per-output scaling behavior.';
    }
    paint(kind, statusText, labels[selected] + ' upstream', summaryText, list, 'This ordinal mode screen does not calculate pixel payload or prove timing, refresh conversion, HDR, VRR, chroma, bit depth, audio, HDCP, or scaler quality. Verify the exact router manual and each display input specification.');
  }

  function hdmiAudioRoute() {
    const source = value('haSource');
    const sink = value('haSink');
    const format = value('haFormat');
    const tvReturn = value('haTvReturn');
    const extractor = value('haExtractor');
    const formatName = { stereo: 'stereo PCM', compressed: 'compressed 5.1', ddp: 'Dolby Digital Plus / lossy Atmos', lossless: 'lossless multichannel' }[format];
    if (!formatName || !['tv', 'external'].includes(source) || !['earc', 'arc', 'hdmi', 'optical', 'analog'].includes(sink)) {
      paint('bad', 'Check input', '—', 'Choose every audio path field.', ['No route is produced from incomplete declarations.'], 'Connector names do not establish codec support.');
      return;
    }
    let route = '';
    let transport = '';
    const list = [];
    if (sink === 'earc' && (tvReturn === 'earc' || extractor === 'earc')) {
      route = tvReturn === 'earc' ? 'TV eARC → sound system' : 'Router eARC output → sound system';
      transport = 'earc';
    } else if (sink === 'arc' && (tvReturn === 'arc' || tvReturn === 'earc')) {
      route = 'TV ARC/eARC port → sound system ARC port'; transport = 'arc';
    } else if (sink === 'hdmi' && (source === 'external' || extractor === 'hdmi')) {
      route = extractor === 'hdmi' ? 'Router HDMI audio output → receiver HDMI input' : 'Source → receiver HDMI input → display'; transport = 'hdmi';
    } else if (sink === 'optical' && (tvReturn === 'optical' || extractor === 'optical')) {
      route = tvReturn === 'optical' ? 'TV optical output → sound system' : 'Router optical extraction → sound system'; transport = 'optical';
    } else if (sink === 'analog' && extractor === 'analog') {
      route = 'Router analog extraction → sound system'; transport = 'analog';
    }
    if (!route) {
      paint('bad', 'Missing route', 'No declared connector path', 'The entered source, return/extractor, and sound-system inputs do not form a complete declared route.', ['Choose an output the TV or router explicitly provides and an input the sound system accepts.', 'Do not treat an eARC-only soundbar port as a regular HDMI input.'], 'A purpose-built converter may bridge some paths, but its exact input direction, output type, codec support, CEC behavior, and video pass-through must be declared.');
      return;
    }
    list.push('Planned route: ' + route + '.');
    list.push('Requested audio class: ' + formatName + '.');
    let kind = 'warn';
    let label = 'Verify codec chain';
    let summaryText = 'The connector path is plausible; exact format support remains an end-to-end check.';
    const formatBlocked = (format === 'lossless' && !['earc', 'hdmi'].includes(transport)) || (format === 'ddp' && ['optical', 'analog'].includes(transport)) || (format === 'compressed' && transport === 'analog');
    if (formatBlocked) {
      kind = 'bad'; label = 'Transport mismatch'; summaryText = 'The selected transport is not a safe path for the requested audio class.';
      list.push('Use eARC or a declared HDMI audio path for lossless multichannel; verify the exact codec at every device.');
    } else {
      list.push('Transport class: ' + transport.toUpperCase() + '. Confirm source output, TV pass-through, router/extractor, and sink decode support.');
      if (format === 'stereo') { kind = 'ok'; label = 'Declared stereo route'; }
    }
    if (source === 'tv') list.push('TV-originated audio must leave through the TV return/output path; an upstream source extractor cannot capture a TV app by itself.');
    paint(kind, label, route, summaryText, list, 'This planner does not decode media, inspect EDID, or observe negotiated audio. ARC/eARC port assignment, CEC volume control, lip sync, codec licensing, app policy, and transcoding are exact-device behaviors.');
  }

  function hdmiDistributionIsolation() {
    const direct = value('hiDirect');
    const scope = value('hiScope');
    const lower = value('hiLower');
    const swap = value('hiSwap');
    const power = value('hiPower');
    const list = [];
    if (direct === 'no') {
      list.push('The direct baseline fails, so the router is not yet isolated as the cause.');
      list.push('Restore one source → one short known-good cable → one display before adding the router.');
      paint('bad', 'Direct baseline fails', 'Start before the router', 'A failing direct path prevents a distribution-only diagnosis.', list, 'Change one variable at a time. A direct failure can come from source mode, display input, cable, settings, power, or content policy.');
      return;
    }
    if (direct === 'unknown') list.push('Run the direct source-to-display control first; it is the highest-value missing observation.');
    if (swap === 'yes') list.push('Because the fault moved or cleared with a known-good cable swap, isolate that input or output cable segment and its connectors first.');
    if (lower === 'yes') list.push('A lower mode passes: compare exact bandwidth, cable certification, router mode support, and any extender ceiling.');
    if (scope === 'mixed') list.push('Mixed displays trigger the fault: inspect EDID selection, lowest-common-mode behavior, and declared per-output scaling.');
    if (scope === 'output') list.push('One output/zone fails: swap only the output cable and display between a passing and failing router output.');
    if (scope === 'source') list.push('One source fails everywhere: compare its direct output mode, input cable, router input, EDID exposure, and protected-content declaration.');
    if (scope === 'all') list.push('Everything fails: verify router power, selected routes, one known-good input/output pair, and the common EDID/firmware state.');
    if (scope === 'intermittent') list.push('Intermittent routes: reduce to one source/output, use short known-good cables, then add segments until the dropout returns.');
    if (power === 'yes') list.push('A full restart changes the result temporarily, which implicates negotiation or device state; record the exact power-up order and firmware versions.');
    if (swap === 'unknown') list.push('Next control: swap one known-good cable between a passing and failing segment without moving other devices.');
    if (lower === 'unknown') list.push('Next mode test: lower resolution or refresh only; do not change the topology at the same time.');
    const kind = direct === 'yes' ? 'warn' : 'info';
    const title = swap === 'yes' ? 'Cable segment implicated' : scope === 'mixed' ? 'EDID/scaling first' : scope === 'output' ? 'Output leg first' : scope === 'source' ? 'Source/input leg first' : scope === 'all' ? 'Common path first' : 'Reduce to one route';
    paint(kind, direct === 'yes' ? 'Router layer isolated' : 'Baseline still needed', title, 'The observation pattern identifies the next shortest controlled test.', list, 'This is an isolation plan, not a defect verdict. It cannot inspect live EDID, link errors, CEC traffic, HDCP authentication, or undocumented firmware. Use only compliant protected-content paths; do not bypass or strip HDCP.');
  }

  function poeClassCheck() {
    const pseType = number('pcPseType');
    const pdClass = number('pcPdClass');
    const portWatts = number('pcPortWatts');
    const maxClass = { 1: 3, 2: 4, 3: 6, 4: 8 }[pseType];
    const pdWatts = { 1: 3.84, 2: 6.49, 3: 13, 4: 25.5, 5: 40, 6: 51, 7: 62, 8: 71.3 }[pdClass];
    const pseWatts = { 1: 4, 2: 7, 3: 15.4, 4: 30, 5: 45, 6: 60, 7: 75, 8: 90 }[pdClass];
    if (!maxClass || !pdWatts || !Number.isFinite(portWatts) || portWatts < 0) {
      paint('bad', 'Check input', '—', 'Choose a valid IEEE PSE Type, PD Class, and non-negative port ceiling.', ['Use 0 W only when the per-port allocation is genuinely unknown.'], 'No standards-based match is produced from incomplete declarations.');
      return;
    }
    const typeFits = pdClass <= maxClass;
    const portKnown = portWatts > 0;
    const portFits = !portKnown || portWatts >= pseWatts;
    const list = [
      'Class ' + pdClass + ' can require up to ' + fmt(pseWatts, 1) + ' W allocated at the PSE and provides up to ' + fmt(pdWatts, 2) + ' W at the PD boundary.',
      'Entered PSE Type ' + pseType + ' supports standardized Classes 1–' + maxClass + '.',
      portKnown ? 'Declared per-port ceiling: ' + fmt(portWatts, 1) + ' W.' : 'Per-port allocation remains unknown; the total switch budget is not a substitute.'
    ];
    if (!typeFits) list.push('The requested PD class is above the entered PSE Type range.');
    if (!portFits) list.push('The entered per-port ceiling is below the PSE allocation associated with Class ' + pdClass + '.');
    const kind = !typeFits || !portFits ? 'bad' : portKnown ? 'ok' : 'warn';
    paint(kind, kind === 'bad' ? 'Class mismatch' : kind === 'ok' ? 'Declared class fit' : 'Port ceiling unverified', 'Type ' + pseType + ' → Class ' + pdClass, kind === 'bad' ? 'The entered source cannot satisfy the requested standardized class on paper.' : kind === 'ok' ? 'The entered Type and per-port ceiling cover the requested class.' : 'The Type covers the class, but the exact port allocation is missing.', list, 'This compares IEEE class boundaries, not live negotiation. Multi-event classification, LLDP, Autoclass, dual-signature PDs, cable condition, temperature, switch policy, and exact product implementation can change allocated or delivered power.');
  }

  function poeEquipmentSelector() {
    const destinations = number('peDestinations');
    const source = value('peSource');
    const endpoint = value('peEndpoint');
    const data = value('peData');
    const distance = value('peDistance');
    if (!Number.isInteger(destinations) || destinations < 1 || destinations > 64 || !['poe', 'ethernet', 'none'].includes(source) || !['ieee', 'dc', 'unknown'].includes(endpoint) || !['yes', 'no'].includes(data) || !['within', 'beyond'].includes(distance)) {
      paint('bad', 'Check input', '—', 'Complete the topology and use a destination count from 1 to 64.', ['Classify the endpoint from its exact input specification, not the presence of an RJ45 jack.'], 'No equipment class is selected from unknown topology fields.');
      return;
    }
    const list = ['Plan: ' + destinations + ' powered destination(s); Ethernet data ' + (data === 'yes' ? 'required' : 'not required') + '; ordinary copper channel limit ' + (distance === 'within' ? 'not exceeded' : 'exceeded or uncertain') + '.'];
    let device = '';
    let kind = 'ok';
    if (endpoint === 'unknown') {
      device = 'Verify the endpoint input first'; kind = 'warn';
      list.push('Do not choose an injector or splitter until the endpoint declares IEEE PoE or an exact DC voltage, polarity, connector, and current requirement.');
    } else if (distance === 'beyond') {
      device = destinations > 1 ? 'Powered intermediate switch or designed extender path' : 'PoE extender or powered intermediate link'; kind = 'warn';
      list.push('An extender consumes power and does not erase Ethernet channel, surge, grounding, or cable requirements. Fiber plus a powered remote switch is a separate architecture.');
    } else if (endpoint === 'ieee') {
      if (source === 'poe') device = destinations > 1 ? 'PoE switch ports' : 'Direct IEEE PoE port';
      else if (destinations > 1) device = 'PoE switch';
      else device = 'IEEE PoE injector (midspan)';
      list.push('Match the PSE Type/class, per-port allocation, total budget, data rate, and pair support to the PD.');
    } else {
      if (source === 'poe') device = 'IEEE PoE splitter with exact DC output';
      else if (data === 'yes') device = 'Matched injector + splitter path';
      else device = 'Direct listed DC power path';
      kind = 'warn';
      list.push('A non-PoE DC endpoint needs an exact splitter output voltage, polarity, connector, current capacity, and isolation declaration.');
    }
    if (source === 'none' && data === 'no' && endpoint === 'ieee') list.push('If Ethernet data is unnecessary, compare a direct listed power supply before adding network power equipment.');
    paint(kind, kind === 'ok' ? 'Equipment class selected' : 'Exact input verification required', device, 'The topology maps to this supply-device class.', list, 'This selects a functional class, not a product. Verify standards compliance, port and total power, input/output voltage, data rate, environment, surge protection, grounding, temperature, and local installation requirements.');
  }

  function poePowerBudget() {
    const budget = number('pbBudget');
    const reserve = number('pbReserve');
    const rows = [1, 2, 3, 4].map((i) => ({ qty: number('pbQty' + i), watts: number('pbWatts' + i) }));
    if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(reserve) || reserve < 0 || reserve >= 100 || rows.some((row) => !Number.isInteger(row.qty) || row.qty < 0 || !Number.isFinite(row.watts) || row.watts < 0) || !rows.some((row) => row.qty > 0 && row.watts > 0)) {
      paint('bad', 'Check input', '—', 'Enter a positive switch budget, 0–99% reserve, and at least one valid device row.', ['Use the allocation or maximum input figure required by your planning policy consistently across rows.'], 'No budget is calculated from missing or mixed input conventions.');
      return;
    }
    const active = rows.filter((row) => row.qty > 0 && row.watts > 0);
    const load = active.reduce((total, row) => total + row.qty * row.watts, 0);
    const usable = budget * (1 - reserve / 100);
    const margin = usable - load;
    const list = active.map((row, index) => 'Group ' + (index + 1) + ': ' + row.qty + ' × ' + fmt(row.watts, 1) + ' W = ' + fmt(row.qty * row.watts, 1) + ' W.');
    list.push('Entered switch budget: ' + fmt(budget, 1) + ' W; planning reserve: ' + fmt(reserve, 1) + '%; usable planning budget: ' + fmt(usable, 1) + ' W.');
    list.push((margin >= 0 ? 'Headroom after entered load: ' : 'Shortfall against usable budget: ') + fmt(Math.abs(margin), 1) + ' W.');
    paint(margin >= 0 ? (margin / usable >= .1 ? 'ok' : 'warn') : 'bad', margin >= 0 ? (margin / usable >= .1 ? 'Budget fits' : 'Tight budget') : 'Budget exceeded', fmt(load, 1) + ' W planned load', margin >= 0 ? 'The entered device groups fit inside the reserved planning budget.' : 'The entered device groups exceed the reserved planning budget.', list, 'Total budget is separate from per-port Type/class compatibility. Startup peaks, heaters, illuminators, negotiated allocation, LLDP, Autoclass, cable loss, temperature, redundant supplies, and switch policy require exact-device evidence. Do not mix measured draw with class allocation without stating the policy.');
  }

  function poePassthroughPlan() {
    const input = number('ppInput');
    const own = number('ppOwn');
    const declared = number('ppDeclared');
    const downstream = number('ppDownstream');
    const reserve = number('ppReserve');
    if (![input, own, declared, downstream, reserve].every((n) => Number.isFinite(n) && n >= 0) || input <= 0 || declared <= 0 || downstream <= 0) {
      paint('bad', 'Check input', '—', 'Enter positive incoming, declared-output, and downstream power plus non-negative self-use and reserve.', ['Use guaranteed power available at the powered switch input, not the upstream PSE headline alone.'], 'No downstream budget is inferred from incomplete declarations.');
      return;
    }
    const afterSelf = Math.max(0, input - own - reserve);
    const usable = Math.min(afterSelf, declared);
    const margin = usable - downstream;
    const list = [
      'Guaranteed input available at powered switch: ' + fmt(input, 1) + ' W.',
      'Self-use + reserve: ' + fmt(own + reserve, 1) + ' W; remainder before output limit: ' + fmt(afterSelf, 1) + ' W.',
      'Declared downstream PoE output budget: ' + fmt(declared, 1) + ' W; usable planning ceiling: ' + fmt(usable, 1) + ' W.',
      (margin >= 0 ? 'Headroom: ' : 'Shortfall: ') + fmt(Math.abs(margin), 1) + ' W against ' + fmt(downstream, 1) + ' W downstream demand.'
    ];
    paint(margin >= 0 ? (margin / usable >= .1 ? 'ok' : 'warn') : 'bad', margin >= 0 ? (margin / usable >= .1 ? 'Pass-through budget fits' : 'Tight pass-through budget') : 'Pass-through shortfall', fmt(usable, 1) + ' W usable downstream', margin >= 0 ? 'The entered downstream load fits both the input remainder and declared output budget.' : 'The downstream demand exceeds at least one declared pass-through boundary.', list, 'A PoE-powered switch may change output budget by input Type, DC versus PoE input, port, negotiation method, temperature, or firmware. Verify its exact input table, self-consumption method, output standards, per-port limits, cable channel, and startup behavior.');
  }

  function passivePoePreflight() {
    const sourceMode = value('pvSourceMode');
    const deviceMode = value('pvDeviceMode');
    const sourceV = number('pvSourceV');
    const deviceV = number('pvDeviceV');
    const polarity = value('pvPolarity');
    if (!['ieee', 'passive', 'unknown'].includes(sourceMode) || !['ieee', 'passive', 'unknown'].includes(deviceMode) || ![sourceV, deviceV].every((n) => Number.isFinite(n) && n >= 0) || !['yes', 'no', 'unknown'].includes(polarity)) {
      paint('bad', 'Check input', '—', 'Complete both power modes, voltage declarations, and pair/polarity evidence.', ['Use 0 V only when a voltage is not applicable or not documented.'], 'Unknown proprietary power is not treated as compatible.');
      return;
    }
    const list = ['Source: ' + sourceMode + (sourceV ? ', ' + fmt(sourceV, 1) + ' V' : '') + '; endpoint: ' + deviceMode + (deviceV ? ', ' + fmt(deviceV, 1) + ' V' : '') + '.'];
    let kind = 'bad';
    let label = 'Do not connect yet';
    let title = 'Compatibility not established';
    let summaryText = 'The entered declarations do not form a verified power pair.';
    if (sourceMode === 'ieee' && deviceMode === 'ieee') {
      kind = 'ok'; label = 'Standards-based path'; title = 'Use IEEE detection and classification'; summaryText = 'Both ends declare standards-based PoE; compare Type/class and budgets next.';
      list.push('Nominal open-circuit voltage entries are not used to replace IEEE detection, classification, and power negotiation.');
    } else if (sourceMode === 'passive' && deviceMode === 'passive') {
      const voltageFits = sourceV > 0 && deviceV > 0 && Math.abs(sourceV - deviceV) <= Math.max(0.5, deviceV * .03);
      if (voltageFits && polarity === 'yes') {
        kind = 'warn'; label = 'Declared proprietary match'; title = fmt(sourceV, 1) + ' V passive pair'; summaryText = 'Voltage and pair/polarity declarations align, but passive PoE has no IEEE detection safety net.';
        list.push('Also verify current capacity, powered pairs, connector pinout, cable limits, grounding, and exact model documentation before connection.');
      } else {
        if (!voltageFits) list.push('Source and endpoint voltage declarations are missing or do not match within this narrow screening tolerance.');
        if (polarity !== 'yes') list.push('Powered pair and polarity are not confirmed identical.');
      }
    } else if (sourceMode === 'unknown' || deviceMode === 'unknown') {
      kind = 'warn'; label = 'Power mode unknown'; title = 'Find the exact specification'; summaryText = 'At least one end is not identified as IEEE-standard or exact passive power.';
      list.push('A product label that says only “PoE” is insufficient when proprietary passive power may be involved.');
    } else {
      list.push('Standards-based and passive PoE are different powering systems; do not assume a voltage label makes them interoperable.');
    }
    paint(kind, label, title, summaryText, list, 'Passive PoE can energize conductors without IEEE detection and can damage incompatible equipment. This preflight is not an electrical safety approval. Use manufacturer documentation and appropriately rated/tested equipment; never experiment on an unknown port or endpoint.');
  }

  function poeFailureIsolation() {
    const detected = value('piDetected');
    const link = value('piLink');
    const scope = value('piScope');
    const cable = value('piCable');
    const port = value('piPort');
    const load = value('piLoad');
    const injector = value('piInjector');
    if ([detected, link, scope, cable, port, load, injector].some((entry) => !entry)) {
      paint('bad', 'Check input', '—', 'Complete every observation; choose Not tested where needed.', ['Preserve the same endpoint and change only one source, port, or cable at a time.'], 'A missing control is not treated as a pass or failure.');
      return;
    }
    const list = [];
    const clues = [];
    if (detected === 'no') clues.push('detection/classification or incompatible passive-versus-IEEE mode');
    if (detected === 'yes' && link === 'no') clues.push('data pairs, termination, port configuration, or endpoint boot state after power');
    if (link === 'yes') clues.push('power allocation or endpoint load rather than basic Ethernet continuity');
    if (scope === 'all') clues.push('common switch budget, supply, configuration, or thermal policy');
    if (scope === 'one') clues.push('one port, cable run, connector, or endpoint');
    if (scope === 'boot') clues.push('startup surge, class allocation, or total-budget headroom');
    if (scope === 'intermittent') clues.push('cable resistance/termination, load changes, temperature, or maintain-power behavior');
    if (cable === 'fixes') clues.push('original cable channel or termination');
    if (port === 'fixes') clues.push('original PSE port or its configuration/budget');
    if (load === 'fixes') clues.push('total budget or per-port power headroom');
    if (injector === 'fixes') clues.push('original PSE capability, port policy, or interoperability');
    if ([cable, port, load, injector].every((entry) => entry === 'untested')) list.push('Run one controlled test next: short known-good cable, then known-good compatible PSE port or injector.');
    clues.forEach((clue, index) => list.push((index + 1) + '. Inspect ' + clue + '.'));
    const isolated = [cable, port, load, injector].some((entry) => entry === 'fixes');
    const title = cable === 'fixes' ? 'Cable channel first' : port === 'fixes' ? 'Original port first' : load === 'fixes' ? 'Power budget first' : injector === 'fixes' ? 'Original PSE first' : detected === 'no' ? 'Detection path first' : 'Run the next control';
    paint(isolated ? 'warn' : 'info', isolated ? 'Failure layer narrowed' : 'More evidence needed', title, isolated ? 'At least one A/B control changes the result and implicates a layer.' : 'The current observations rank the next shortest test.', list, 'This is an isolation sequence, not a defect verdict. Exact voltage/current capture, pairset use, class events, LLDP, cable certification, switch logs, firmware, surge damage, and environmental limits require hardware or vendor evidence.');
  }

  function audioPaint(kind, label, title, text, list, note) {
    const names = {
      asOutput: 'Output', asInput: 'Input', asCable: 'Route', asEvidence: 'Manual evidence',
      hsPlug: 'Headset plugs', hsPort: 'Device jacks', hsWiring: 'Headset TRRS order', hsTarget: 'Receiving TRRS order', hsAdapter: 'Adapter in hand', hsMic: 'Microphone needed',
      mpNeed: 'Mic power need', mpSupply: 'Input supply', mpPath: 'Power route', mpConfirmed: 'Electrical evidence confirmed',
      anWhere: 'Noise location', anBare: 'Speakers without signal', anBattery: 'Battery control', anBranch: 'Branch control', anCable: 'Cable control', anWiring: 'Line wiring'
    };
    const escape = (entry) => String(entry).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
    const record = Object.entries(names).filter(([name]) => form.elements[name]).map(([name, caption]) => {
      const field = form.elements[name];
      const choice = field.type === 'checkbox' ? (field.checked ? 'Yes' : 'No') : Array.from(field.options || []).find(option => option.value === value(name))?.textContent || value(name) || 'Missing';
      return caption + ': ' + choice;
    }).join('; ');
    paint(kind, label, title, text, [...list, 'Input record — ' + escape(record), 'Page: https://cablechecklab.com/tools/' + toolId + '/'], note);
  }

  function audioChoicesValid(entries) {
    const valid = entries.every(([name, choices]) => choices.includes(value(name)));
    if (!valid) audioPaint('bad', 'Check input', 'Complete every selection', 'Choose a listed value for every field; unknown and not tested are valid evidence states.', ['A missing or altered field is not treated as a pass.'], 'No hardware measurement or compatibility verdict is produced from invalid inputs.');
    return valid;
  }

  function audioSignalPath() {
    if (!audioChoicesValid([
      ['asOutput', ['stereo', 'balanced', 'balanced-pair', 'unbalanced-pair', 'mono', 'insert', 'speaker', 'digital', 'unknown']],
      ['asInput', ['balanced', 'stereo', 'pair', 'mono', 'headphones', 'unknown']],
      ['asCable', ['direct', 'breakout', 'separate', 'converter', 'unknown']],
      ['asEvidence', ['yes', 'no', 'unknown']]
    ])) return;
    const source = value('asOutput'), sink = value('asInput'), cable = value('asCable'), proof = value('asEvidence');
    const note = 'This compares declared signal roles, not measured audio or a universal pinout. Mute and power down equipment before changing signal cables. Never join two powered outputs or connect a speaker-power output to a mic/line input. Exact levels, impedance, output topology and manufacturer wiring still matter.';
    if (source === 'speaker' || source === 'digital' || source === 'insert' || sink === 'headphones') {
      const why = source === 'speaker' ? 'Speaker power is not line level' : source === 'digital' ? 'Digital audio needs a conversion stage' : source === 'insert' ? 'Insert send/return is not stereo' : 'A line output is not a headphone amplifier';
      audioPaint('bad', 'Different interface required', why, 'A plug adapter does not establish the required electrical or signal conversion.', ['Stop this direct-cable plan.', 'Find the exact source/output and destination/input specifications before selecting an appropriate interface.'], note); return;
    }
    if (source === 'unknown' || sink === 'unknown' || cable === 'unknown') {
      audioPaint('warn', 'Roles unverified', 'Identify the signal on each contact', 'TRS describes three contacts; it does not identify balanced mono, stereo, or insert send/return.', ['Read the exact output and input labels/manuals.', 'Do not infer a signal role from connector size or the word balanced printed on a cable.'], note); return;
    }
    if (cable === 'direct' && ((source === 'stereo' && sink === 'balanced') || (source === 'balanced' && sink === 'stereo'))) {
      audioPaint('bad', 'Signal-role mismatch', source === 'stereo' ? 'Stereo is not balanced mono' : 'Balanced mono is not stereo', 'A straight TRS cable can mate while putting different signals on the receiver contacts.', source === 'stereo' ? ['A balanced mono input responds to a difference between its signal contacts, not a normal L+R sum.', 'Common center content can be reduced; cancellation depends on the recording.', 'For stereo recording use a suitable L/R breakout and two inputs. For one mono input use a documented summing mixer/converter, not a passive output short.'] : ['A stereo input can receive the balanced hot/cold conductors as different channels instead of a normal L/R program.', 'Use manufacturer-approved conversion or the correct mono input.'], note); return;
    }
    if (cable === 'converter') {
      audioPaint('warn', 'Conversion must be verified', 'Check the converter on both sides', 'A mixer, DI or other interface can change a path, but its name alone does not establish levels, channel count or power compatibility.', ['Verify the exact input role, output role, level range and powering.', 'A DI commonly provides a mic-level output; do not assume it is a stereo line-to-line adapter.'], note); return;
    }
    const fits = (source === 'stereo' && sink === 'stereo' && cable === 'direct') ||
      (source === 'balanced' && sink === 'balanced' && cable === 'direct') ||
      (source === 'mono' && sink === 'mono' && cable === 'direct') ||
      (source === 'stereo' && sink === 'pair' && cable === 'breakout') ||
      (['balanced-pair', 'unbalanced-pair'].includes(source) && sink === 'pair' && cable === 'separate');
    if (!fits || proof === 'no') {
      audioPaint('warn', proof === 'no' ? 'Documented conflict' : 'Route not established', 'Resolve wiring and channel roles', 'The selected plan does not establish the complete intended connection.', ['Stereo requires two independent channels; duplicating one mono output does not create stereo.', 'A breakout separates channels; it does not sum two outputs safely or turn an unbalanced source into a balanced source.', 'Use the exact manuals for mixed balanced/unbalanced wiring rather than a universal TRS-to-TS recipe.'], note); return;
    }
    audioPaint(proof === 'yes' ? 'ok' : 'warn', proof === 'yes' ? 'Declared role fit' : 'Levels and wiring unverified', sink === 'pair' ? 'Keep L and R on separate paths' : 'Signal roles align', 'The channel roles fit the selected route; electrical and physical compatibility remain separate evidence.', ['Selected route: ' + (cable === 'breakout' ? 'stereo breakout into two input channels' : cable === 'separate' ? 'two independent channel cables' : 'one direct signal cable') + '.', proof === 'yes' ? 'You confirmed compatible levels and exact wiring from the manuals.' : 'Confirm level range, input mode, connector wiring and impedance before connection.', 'No claim is made about sound quality, gain, cable faults or live negotiation.'], note);
  }

  function headsetAdapter() {
    if (!audioChoicesValid([
      ['hsPlug', ['trrs', 'dual', 'headphones', 'unknown']], ['hsPort', ['combo', 'dual', 'headphones', 'unknown']],
      ['hsWiring', ['ctia', 'omtp', 'unknown']], ['hsTarget', ['ctia', 'omtp', 'unknown']],
      ['hsAdapter', ['none', 'split', 'combine', 'share', 'swap', 'unknown']]
    ])) return;
    const plug = value('hsPlug'), port = value('hsPort'), wiring = value('hsWiring'), target = value('hsTarget'), adapter = value('hsAdapter'), mic = checked('hsMic');
    const note = 'This selects an analog connector/adapter class, not an exact-product guarantee. CTIA is L/R/Ground/Mic and OMTP swaps the last two contacts. Bias voltage, jack detection, remotes, app input selection and proprietary wiring still need documentation. It does not access or record a microphone.';
    if (mic && (plug === 'headphones' || port === 'headphones')) {
      audioPaint('bad', 'Microphone path missing', 'A splitter cannot create a mic path', 'At least one selected endpoint carries playback only.', ['Use a headset with an actual microphone and a device input that accepts it.', 'A headphone-only interface output is not a microphone input.'], note); return;
    }
    if (plug === 'unknown' || port === 'unknown') {
      audioPaint('warn', 'Endpoints unverified', 'Identify plugs and jack roles first', 'Count contacts and read the device jack label before choosing an adapter.', ['A headset combo jack and a headphone-only jack can look similar.', 'Keep USB/digital dongles and exact console policies outside this analog selector.'], note); return;
    }
    if (!mic) {
      audioPaint('info', 'Playback-only goal', 'Keep microphone requirements separate', 'For headphones alone, use a documented playback connection; headset microphone and button support is not established.', ['A two-headphone sharing splitter duplicates playback, not microphone capture.', 'For a TRRS headset on a TRS output, use a documented headphone adapter if contact alignment is uncertain.'], note); return;
    }
    const required = plug === 'trrs' && port === 'dual' ? 'split' : plug === 'dual' && port === 'combo' ? 'combine' : 'none';
    if (adapter === 'share') {
      audioPaint('bad', 'Wrong splitter function', 'Headphone sharing is not mic separation', 'A two-headphone splitter is not the required headset audio/microphone adapter.', ['For one TRRS headset and separate PC jacks, use a TRRS female to headphone + mic male adapter of the documented wiring.', 'For two headset plugs and one combo jack, the direction is the opposite.'], note); return;
    }
    if (plug === 'trrs' && (wiring === 'unknown' || target === 'unknown')) {
      audioPaint('warn', 'Wiring unverified', required === 'split' ? 'Headset-to-PC splitter class' : 'Verify the TRRS wiring', 'The physical route can be named, but microphone/ground contact compatibility is unresolved.', ['Check both headset wiring and the combo jack or splitter TRRS socket specification.', 'Do not assign CTIA/OMTP by brand, country or plug appearance.'], note); return;
    }
    if (plug === 'trrs' && wiring !== target) {
      audioPaint('warn', 'Mic/ground mismatch', 'CTIA/OMTP conversion required', 'The two declared TRRS pin orders differ.', ['Use a documented mic/ground-swap adapter; a size adapter or headphone-sharing cable is not equivalent.', required === 'split' ? 'You also need the correct headset-to-PC split direction; a swap adapter alone does not separate plugs.' : 'A documented bidirectional CTIA/OMTP converter addresses this contact swap only.'], note); return;
    }
    if (plug === 'dual' && port === 'combo' && target === 'unknown') {
      audioPaint('warn', 'Combo wiring unverified', 'Headset-to-combo combiner class', 'The device combo-jack wiring is needed to specify the combiner.', ['Use two female sockets for the headset plugs and one male TRRS device plug.', 'Require the output pin order declared by the exact combo jack.'], note); return;
    }
    const title = required === 'split' ? 'TRRS headset to separate PC jacks' : required === 'combine' ? 'Separate headset plugs to one combo jack' : 'No split/combiner needed';
    const actions = required === 'split' ? ['Required direction: one TRRS female socket to separate headphone and microphone male plugs.', 'The splitter TRRS socket must match the declared headset wiring.'] : required === 'combine' ? ['Required direction: separate headphone/mic female sockets to one TRRS male plug.', 'Specify the combo-jack pin order; check the adapter documentation explicitly.'] : ['Connect the corresponding headset and input/output roles directly.', 'A CTIA/OMTP swap is not needed for two matching declared TRRS orders.'];
    if (adapter !== required && !(required === 'none' && adapter === 'none')) actions.push('The selected adapter in hand does not match the required function; unknown is not a confirmed fit.');
    actions.push('Check microphone bias, input selection, mute and permissions if the physical path is right but capture still fails.');
    audioPaint('info', 'Required adapter class', title, 'This identifies what the route needs, not which retail cable is guaranteed to work.', actions, note);
  }

  function microphonePower() {
    if (!audioChoicesValid([
      ['mpNeed', ['plugin', 'p48', 'none', 'battery', 'unknown']], ['mpSupply', ['p48', 'plugin', 'off', 'unknown']],
      ['mpPath', ['passive', 'direct', 'converter', 'unknown']]
    ])) return;
    const need = value('mpNeed'), supply = value('mpSupply'), route = value('mpPath'), confirmed = checked('mpConfirmed');
    const note = 'This is a declared power-path preflight, not a live voltage test or safety certification. Turn equipment and phantom power off before recabling, follow discharge instructions, and never experiment with an unknown mic or adapter. Do not infer power needs from condenser/dynamic/ribbon labels alone.';
    if (need === 'unknown' || supply === 'unknown' || route === 'unknown') {
      audioPaint('warn', 'Power unverified', 'Find the exact mic and input specifications', 'Connector shape and microphone category do not identify the required supply.', ['Find power type, voltage/current range, pinout and exact adapter behavior.', 'Leave power off until the complete route is documented.'], note); return;
    }
    if (route === 'converter') {
      audioPaint('warn', confirmed ? 'Declared converter route' : 'Converter unverified', 'Check both sides of the powered adapter', 'A converter or external power box must explicitly support this mic, its required power, and the recorder-side signal.', [confirmed ? 'You report that the exact converter output, input supply and pinout are documented as suitable.' : 'No documented converter match was confirmed; do not assume every XLR-to-3.5 mm adapter converts power.', 'Confirm whether external power is needed and whether the recorder-side output blocks unwanted DC.', 'Power matching does not establish mic gain, noise, wiring or input-level compatibility.'], note); return;
    }
    if (need === 'none' || need === 'battery') {
      audioPaint(supply === 'off' ? 'info' : 'warn', supply === 'off' ? 'No external power selected' : 'Unneeded power present', supply === 'off' ? 'Verify the audio input next' : 'Keep unneeded supply off', 'This mic declaration does not request power from the input.', [need === 'battery' ? 'Check the microphone battery and its powered output mode.' : 'Use the exact manual; some passive or legacy microphones have special restrictions.', 'Do not infer that every balanced dynamic or ribbon microphone tolerates every phantom-powered route.'], note); return;
    }
    const matches = (need === 'p48' && supply === 'p48') || (need === 'plugin' && supply === 'plugin');
    if (!matches || route === 'passive') {
      audioPaint('bad', 'Power path not established', matches ? 'A passive adapter does not verify the power path' : 'The selected supply does not meet the mic declaration', 'Plug-in power and P48 phantom power are different systems; a connector-only cable cannot convert between them.', ['A plug-in-powered lavalier on a phantom input needs a documented power-converting adapter, not an ordinary passive XLR adapter.', 'A P48 microphone on an unpowered input needs the appropriate powered mic/interface path.', 'Do not infer any fixed plug-in-power voltage; verify the exact microphone range and source supply.'], note); return;
    }
    audioPaint(confirmed ? 'ok' : 'warn', confirmed ? 'Declared power fit' : 'Electrical details unverified', need === 'p48' ? 'P48 direct microphone path' : 'Plug-in-power direct microphone path', 'The selected power system matches in name; exact electrical and wiring evidence is still required.', [confirmed ? 'You confirmed compatible voltage/current requirements and the complete pinout in the manuals.' : 'Confirm voltage range, current capability and exact wiring before connecting or enabling power.', 'A battery-powered mode, external box or proprietary adapter can change the required route.', 'This does not prove that the microphone or cable is undamaged.'], note);
  }

  function audioNoiseIsolation() {
    if (!audioChoicesValid([
      ['anWhere', ['speakers', 'headphones', 'both', 'unknown']], ['anBare', ['untested', 'quiet', 'persists']],
      ['anBattery', ['untested', 'quiet', 'same', 'na']], ['anBranch', ['untested', 'quiet', 'same']],
      ['anCable', ['untested', 'fixes', 'same']], ['anWiring', ['unknown', 'balanced', 'unbalanced']]
    ])) return;
    const where = value('anWhere'), bare = value('anBare'), battery = value('anBattery'), branch = value('anBranch'), cable = value('anCable'), wiring = value('anWiring');
    const note = 'These observations rank a next test, not a root-cause diagnosis. No audio is recorded, played or measured. Lower volume, mute and power down equipment before changing signal cables. Never remove protective earth, alter mains wiring, open a power supply, or use a mains earth-lift adapter. Stop and seek qualified service for shocks, burning smells or suspected electrical faults.';
    const actions = [];
    let title = 'Establish one clean baseline', label = 'More evidence needed';
    if (where === 'unknown') actions.push('At a low normal listening level, note whether noise is present in headphones, powered speakers, or both.');
    if (bare === 'persists') {
      title = 'Speaker/output baseline first'; label = 'Noise survives source removal';
      actions.push('Noise persists with speaker signal inputs removed. The original source connection is not required for that observation.', 'Check the speaker manufacturer troubleshooting path and normal self-noise specification; a ground loop is not established.');
    } else if (cable === 'fixes') {
      title = 'Original signal cable or contact first'; label = 'A/B result changes';
      actions.push('A correctly specified known-good replacement changes the outcome.', 'Retest the original path once with settings unchanged; inspect connector fit and use manufacturer-approved cabling.');
    } else if (branch === 'quiet') {
      title = 'The removed signal branch matters'; label = 'A/B result changes';
      actions.push('Document which one user-accessible signal branch was removed.', 'Reconnect only after muting/powering down; repeat with settings unchanged. This implicates a path, not necessarily a failed device.');
    } else if (battery === 'quiet') {
      title = 'Laptop power-path sensitivity'; label = 'Battery A/B changes noise';
      actions.push('A battery-only laptop control changes the noise. Power-path coupling is a hypothesis, not proof of a ground loop.', 'Keep required equipment earth intact. Consult manufacturer support for an approved signal-side isolation option.');
    } else {
      actions.push('Compare one source through headphones with the powered-speaker route, then add one user-accessible signal branch at a time.', 'Record the same volume, gain, input mode and load for every comparison.');
    }
    if (where === 'both' || where === 'headphones') actions.push('Noise in headphones also warrants checking the source, input/gain path and supply; do not limit the investigation to speaker cables.');
    if (wiring === 'unbalanced') actions.push('If both endpoints offer balanced line I/O, compare a correctly specified balanced path. A TRS cable alone does not make unbalanced endpoints balanced.');
    if (wiring === 'unknown') actions.push('Use the Signal Path Checker to establish balanced/stereo/mono roles before buying an isolator.');
    actions.push('Do not purchase a generic USB isolator without verifying its USB speed, power budget and exact interface support.');
    audioPaint('info', label, title, 'Change one documented condition at a time and keep untested observations explicit.', actions, note);
  }


  // Digital studio: declared optical formats, capacity, timing routes and observations.
  function digitalPaint(kind, label, title, text, list, note) {
    const escape = entry => String(entry).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    const record = Array.from(form.elements).filter(field => field.name && ['SELECT', 'INPUT'].includes(field.tagName)).map(field => {
      const choice = field.tagName === 'SELECT' ? Array.from(field.options).find(option => option.value === field.value)?.textContent || 'Missing / altered' : String(field.value).trim() !== '' && Number.isFinite(Number(field.value)) ? field.value : 'Invalid / missing';
      return (field.labels?.[0]?.textContent || field.name) + ': ' + choice;
    }).join('; ');
    const routes = { opticalformat: 'optical-audio-format-checker', adatcapacity: 'adat-expansion-planner', digitalclock: 'digital-clock-route-planner', digitalfault: 'digital-audio-failure-isolator' };
    paint(kind, label, title, text, [...list, 'Input record — ' + escape(record), 'Page: https://cablechecklab.com/<wbr>tools/<wbr>' + routes[tool.dataset.tool] + '/'], note);
  }

  function digitalChoices(entries) {
    if (entries.every(([name, choices]) => choices.includes(value(name)))) return true;
    digitalPaint('bad', 'Check input', 'Complete every selection', 'Use listed values; unknown and not tested are explicit evidence states.', ['Missing or altered values never become a fit.'], 'No connection verdict is produced from invalid inputs.');
    return false;
  }

  function opticalFormatCheck() {
    if (!digitalChoices([['ofSource', ['adat', 'spdif', 'unknown']], ['ofTarget', ['adat', 'spdif', 'unknown']], ['ofDirection', ['out-in', 'out-out', 'in-in', 'unknown']], ['ofRoute', ['direct', 'passive', 'converter', 'unknown']], ['ofEvidence', ['yes', 'no', 'unknown']]])) return;
    const source = value('ofSource'), target = value('ofTarget'), direction = value('ofDirection'), route = value('ofRoute'), docs = value('ofEvidence');
    const note = 'This checks declared optical format and direction, not the physical cable, sample-rate support, channel budget, clock lock or encoded S/PDIF content. A TOSLINK plug is not a protocol detector; a format converter is not a passive shape adapter.';
    let kind = 'warn', label = 'Evidence needed', title = 'Identify both optical modes', text = 'Read the selected port mode in both manuals or control panels.';
    const list = ['ADAT and optical S/PDIF can use the same TOSLINK connector but are different digital formats.', 'Use a transmitting OUT port and a receiving IN port; the one-way audio route does not automatically provide a return clock route.'];
    const mismatch = source !== 'unknown' && target !== 'unknown' && source !== target;
    if (direction === 'out-out' || direction === 'in-in') {
      kind = 'bad'; label = 'Direction conflict'; title = 'OUT must feed IN'; text = 'The declared endpoints do not form a transmitter-to-receiver path.';
    } else if (docs === 'no') {
      kind = 'bad'; label = 'Documented conflict'; title = 'Resolve the manual conflict'; text = 'The exact route or mode is explicitly not supported.';
    } else if (mismatch && route !== 'converter' && route !== 'unknown') {
      kind = 'bad'; label = 'Format conflict'; title = 'A passive cable cannot translate this'; text = 'Changing the TOSLINK cable or plug shape does not convert ADAT to S/PDIF or the reverse.';
      list.push('Look for a device with the required selectable input mode or a converter explicitly accepting the source format and producing the destination format.');
    } else if (mismatch) {
      title = 'Verify an actual format converter'; text = 'A different format must be translated, not merely passed through.';
      list.push(docs === 'yes' && route === 'converter' ? 'A conversion route is declared in the manuals. Verify its input/output modes, channel mapping, supported rates and clock behavior separately.' : 'An unspecified converter, optical/coax transport box or DAC is not evidence of ADAT/S/PDIF translation.');
    } else if (source !== 'unknown' && target !== 'unknown' && direction === 'out-in' && route === 'direct' && docs === 'yes') {
      kind = 'ok'; label = 'Declared format match'; title = 'The optical modes agree'; text = 'Both declared ends use the same format in the correct direction. This is not a measured audio or sync pass.';
    } else if (source !== 'unknown' && target !== 'unknown') {
      title = 'Matching format, remaining route checks'; list.push('Confirm any adapter/converter and exact-model mode declarations before treating the complete route as supported.');
    }
    digitalPaint(kind, label, title, text, list, note);
  }

  function adatCapacityPlan() {
    if (!digitalChoices([['apSupport', ['yes', 'no', 'unknown']]])) return;
    const rate = number('apRate'), wanted = number('apWanted'), tx = number('apTx'), rx = number('apRx'), sourceCap = number('apSourceCap'), receiverCap = number('apReceiverCap'), support = value('apSupport');
    if (![44.1, 48, 88.2, 96, 176.4, 192].includes(rate) || ![wanted, tx, rx, sourceCap, receiverCap].every(Number.isInteger) || wanted < 1 || wanted > 32 || tx < 0 || tx > 8 || rx < 0 || rx > 8 || sourceCap < 0 || sourceCap > 64 || receiverCap < 0 || receiverCap > 64) {
      digitalPaint('bad', 'Check input', 'Use whole channel and port counts', 'Target: 1–32 channels; optical ports: 0–8; declared channel ceilings: 0–64 (0 means unknown).', ['Choose a listed sample rate in kHz.'], 'No capacity verdict is produced from invalid or nonfinite input.'); return;
    }
    const perLink = rate <= 48 ? 8 : rate <= 96 ? 4 : 2;
    const mode = rate <= 48 ? 'base-rate ADAT' : rate <= 96 ? 'S/MUX2' : 'S/MUX4';
    const required = Math.ceil(wanted / perLink), links = Math.min(tx, rx), slots = links * perLink;
    const bound = Math.min(slots, sourceCap || slots, receiverCap || slots);
    const note = 'This is a one-source-to-one-receiver, one-direction declared budget. Both devices must support the selected ADAT rate/mode. S/MUX4 at 176.4/192 kHz is not universal. Counts exclude analogue I/O and opposite-direction ports; clocking, firmware, DSP and exact hardware/DAW channel maps remain separate.';
    const list = ['Target: ' + wanted + ' channels at ' + fmt(rate) + ' kHz; mode: ' + mode + '.', 'Arithmetic when supported: ' + perLink + ' channels per optical link; at least ' + required + ' separate one-way links for the target.', 'Declared optical OUT ports: ' + tx + '; optical IN ports: ' + rx + '; paired links: ' + links + '.'];
    let kind = 'warn', label = 'Mode evidence needed', title = required + ' links if supported', text = 'Confirm the selected rate/mode at both ends before treating arithmetic as available channels.';
    if (support === 'no') {
      kind = 'bad'; label = 'Mode unsupported'; title = 'The selected ADAT mode is not supported'; text = 'More cables do not add a missing rate/mode capability.';
    } else if (tx === 0 || rx === 0) {
      kind = 'bad'; label = 'Missing optical port'; title = 'No declared one-way optical link'; text = 'A usable source OUT and receiver IN are both required.';
    } else if (support === 'yes') {
      list.push('Link-only slots: ' + slots + ' channels. Source channel ceiling: ' + (sourceCap || 'unknown') + '; receiver ceiling: ' + (receiverCap || 'unknown') + '.');
      if (bound < wanted) {
        kind = 'bad'; label = 'Declared budget shortfall'; title = 'At most ' + bound + ' channels within this budget'; text = 'The declared links or endpoint ceiling cannot meet the target.';
        if (slots < wanted) list.push('The target needs ' + required + ' usable OUT/IN port pairs. Extra cables alone cannot create extra ports.');
        if ((sourceCap && sourceCap < wanted) || (receiverCap && receiverCap < wanted)) list.push('An endpoint channel ceiling also matters; adding optical links will not remove that declared ceiling.');
      } else if (!sourceCap || !receiverCap) {
        label = 'Endpoint ceiling unknown'; title = slots + ' link slots; endpoint limits unverified'; text = 'The optical arithmetic fits, but an unknown channel ceiling is not permission to assume those channels are exposed.';
      } else {
        kind = 'ok'; label = 'Declared port budget fits'; title = wanted + ' channels fit the declared budget'; text = 'The chosen mode, link count and entered endpoint ceilings accommodate the target on paper.';
      }
      for (let i = 0; i < Math.min(required, links); i++) list.push('Logical bundle ' + (i + 1) + ': target channels ' + (i * perLink + 1) + '–' + Math.min((i + 1) * perLink, wanted) + '. This is an allocation worksheet, not a physical-port/DAW numbering claim.');
    }
    digitalPaint(kind, label, title, text, list, note);
  }

  function digitalClockPlan() {
    if (!digitalChoices([['cpLeader', ['a', 'b', 'unknown']], ['cpRoute', ['adat', 'spdif', 'word', 'unknown']], ['cpAudio', ['a-b', 'b-a', 'both', 'unknown']], ['cpEmit', ['yes', 'no', 'unknown']], ['cpFollow', ['yes', 'no', 'unknown']], ['cpWord', ['yes', 'no', 'unknown']]])) return;
    const rateA = number('cpRateA'), rateB = number('cpRateB');
    if (![rateA, rateB].every(rate => [0, 44.1, 48, 88.2, 96, 176.4, 192].includes(rate))) {
      digitalPaint('bad', 'Check input', 'Choose listed audio sample rates', '0 is the explicit unknown-rate option.', ['A missing or altered rate is not a match.'], 'No clock route is certified.'); return;
    }
    const leader = value('cpLeader'), route = value('cpRoute'), audio = value('cpAudio'), emit = value('cpEmit'), follow = value('cpFollow'), word = value('cpWord');
    const note = 'Two devices in one synchronous domain only, with no asynchronous sample-rate conversion. Planned settings are not measured lock. Exact devices may require a fixed leader; BNC word-clock base/double/quad-rate modes and termination are manual-specific. This is not a multi-device BNC distribution design or a sound-quality comparison.';
    const list = ['A dedicated word-clock cable carries timing, not the missing audio channels. ADAT and S/PDIF can carry embedded timing only in their transmission direction.'];
    let kind = 'warn', label = 'Clock evidence needed', title = 'Choose one timing leader', text = 'A clock follower needs a real input path from the selected leader.';
    if (rateA && rateB && rateA !== rateB) {
      kind = 'bad'; label = 'Audio-rate conflict'; title = 'The declared audio sample rates differ'; text = 'A cable does not resample audio. Use one supported session rate or a separately documented SRC system outside this planner.';
    } else if (leader !== 'unknown' && route !== 'unknown') {
      const lead = leader.toUpperCase(), slave = leader === 'a' ? 'B' : 'A';
      const transport = route === 'word' ? 'Word Clock' : route === 'adat' ? 'ADAT' : 'S/PDIF';
      list.push('<div class="digital-route"><strong>' + lead + ' · Internal</strong><span>clock → ' + transport + ' →</span><strong>' + slave + ' · ' + transport + ' sync</strong></div>');
      list.push('Planned settings: ' + lead + ' uses Internal; ' + slave + ' follows its incoming ' + transport + ' reference. Verify exact menu names and supported modes.');
      const embeddedPath = audio === 'both' || audio === (leader === 'a' ? 'a-b' : 'b-a');
      const pathKnown = route === 'word' ? word === 'yes' : embeddedPath;
      const missingPath = route === 'word' ? word === 'no' : audio !== 'unknown' && !embeddedPath;
      if (emit === 'no' || follow === 'no') {
        kind = 'bad'; label = 'Clock capability conflict'; title = 'The chosen leader/follower route is unsupported'; text = 'Follow the exact-model clock-source constraints; do not assume every optical receiver can slave from ADAT.';
      } else if (missingPath) {
        kind = 'bad'; label = 'Missing timing path'; title = route === 'word' ? 'Provide the documented OUT-to-IN clock route' : 'A return timing connection is required'; text = 'Audio travels opposite to the selected clock leader, or the selected BNC route is absent.';
        list.push('A follower cannot use an outgoing-only cable as its incoming clock reference. If supported, add a leader OUT → follower IN return link, use a documented word-clock route, or choose the other valid leader.');
      } else if (pathKnown && emit === 'yes' && follow === 'yes' && rateA && rateB) {
        kind = 'ok'; label = 'Declared clock route available'; title = lead + ' leads; ' + slave + ' follows'; text = 'The entered rate and timing path are internally consistent. Apply only supported settings, then confirm the receiver lock indicator.';
      } else {
        title = lead + ' → ' + slave + ': verify the timing route'; text = 'At least one rate, clock capability or incoming path remains unverified; no sync success is inferred.';
      }
      if (route === 'word') list.push('The selected rates are AUDIO sample rates, not a universal BNC clock-frequency prescription. Check full/base-rate output, input range, rated 75-ohm cabling and termination in both manuals; no passive splitting advice is given.');
    }
    digitalPaint(kind, label, title, text, list, note);
  }

  function digitalFaultIsolate() {
    if (!digitalChoices([['dfSymptom', ['silent', 'clicks', 'channels', 'rate-change', 'unknown']], ['dfLock', ['yes', 'no', 'unknown']], ['dfSource', ['yes', 'no', 'unknown']], ['dfReceive', ['yes', 'no', 'unknown']], ['dfDaw', ['yes', 'no', 'unknown']], ['dfRate', ['same', 'different', 'unknown']], ['dfCable', ['fixes', 'same', 'untested']]])) return;
    const symptom = value('dfSymptom'), lock = value('dfLock'), source = value('dfSource'), receive = value('dfReceive'), daw = value('dfDaw'), rate = value('dfRate'), cable = value('dfCable');
    const note = 'These are user observations on one identified channel, not live detection or a root-cause verdict. Lock does not prove correct audio routing, the complete channel map or absence of intermittent errors. Change one external condition at a time, keep levels low, do not look into optical emitters, rewire equipment or modify mains/earth.';
    const list = ['Record the same source channel at the source, receiver digital meter and DAW input; observations from different channels are not comparable.'];
    let label = 'Next controlled test', title = 'Establish clock and meter evidence', text = 'Untested observations remain unknown; do not replace equipment from a symptom alone.';
    if (rate === 'different') {
      title = 'Resolve the declared rate mismatch first'; text = 'The source, receiver and session are not in one declared audio-rate domain.';
      list.push('Check a supported common session rate and each device’s mode. This planner does not assume a sample-rate converter is present.');
    } else if ((lock === 'no' && (receive === 'yes' || daw === 'yes')) || (source === 'no' && receive === 'yes')) {
      label = 'Recheck observation points'; title = 'The observations need alignment'; text = 'A meter may be showing a local/other channel or a previously locked state.';
      list.push('Refresh lock status and repeat with one named source channel. Do not interpret the conflicting observations as a pass.');
    } else if (lock !== 'yes') {
      title = lock === 'no' ? 'Establish the incoming digital lock' : 'Read the receiver lock status first';
      list.push('Check OUT → IN, ADAT versus S/PDIF mode, selected sample rate and the actual leader-to-follower clock path.', 'Use the Format Checker and Clock Route Planner before assuming a cable failure. A visible optical light is not a protocol/lock test.');
    } else if (source === 'no') {
      title = 'Source signal before the digital link'; text = 'The selected source channel has no observed signal even though timing is reported locked.';
      list.push('Check the source input mode, normal gain and routing to its digital output. A replacement optical cable cannot create a missing source signal.');
    } else if (cable === 'fixes') {
      title = 'Original optical path is implicated'; text = 'A documented known-good cable control changed the outcome; this is not proof the cable alone is defective.';
      list.push('Retest once with the same ports, modes, clock and routing. Connector seating or the changed route may also matter.');
    } else if (symptom === 'channels' || symptom === 'rate-change') {
      title = 'Check S/MUX capacity and channel mapping'; text = 'A rate change can alter the channels per optical link and the exposed input map.';
      list.push('Compare each manual’s per-rate port/channel table with the ADAT Expansion Planner. Check whether another dedicated optical port is required; do not assume a second socket is an input.');
    } else if (receive === 'yes' && daw === 'no') {
      title = 'Receiver-to-DAW routing next'; text = 'Signal reaches the observed receiver digital meter but not the selected DAW input.';
      list.push('Check the selected audio device, mono/stereo input mapping, channel enable/arm and monitor routing. Record settings; do not reset the interface or DAW blindly.');
    } else if (daw === 'yes' && receive === 'yes') {
      title = symptom === 'clicks' ? 'Check intermittent sync and the monitored path' : 'Monitor/output path after recording input';
      list.push(symptom === 'clicks' ? 'A locked snapshot does not exclude intermittent sync errors. Watch status over time, confirm one clock leader, then compare one known-good optical cable with settings unchanged.' : 'The chosen DAW input shows signal. Check its monitoring/output destination and ordinary low-level listening controls rather than replace the optical input cable.');
    } else if (source === 'yes' && receive === 'no') {
      title = 'Source digital routing or receiving bank next'; text = 'The source meter moves, but the selected receiver digital input does not.';
      list.push('Confirm the source routes that channel to the digital OUT and the receiver uses the expected format/bank. Lock alone does not carry the missing analogue channel into that output.');
    } else if (symptom === 'clicks') {
      title = 'Observe lock over time before swapping parts'; list.push('Confirm one supported clock leader and a common audio rate. Then compare one known-good optical cable with routing unchanged.');
    } else {
      list.push('Find the first test point with signal: source input meter → receiver digital input meter → DAW input meter → monitor/output. Change only the first unresolved layer.');
    }
    if (rate === 'unknown') list.push('The common source/receiver/session audio rate is not yet verified.');
    if (cable === 'same') list.push('The known-good cable did not change this controlled test. That does not certify every cable/port or prove a software fault.');
    digitalPaint('info', label, title, text, list, note);
  }

  const calculators = { charge: chargeCheck, cable: cableDecode, display: displayPlan, multiport: multiportPlan, pps: ppsRangeCheck, pdrequirement: pdRequirement, cableselector: cableSelector, datapath: dataPathCheck, dsc: dscPlan, lanes: lanePlan, dockrequirement: dockRequirement, hubpower: hubPowerBudget, troubleshoot, usb4path: usb4FeaturePath, usb4budget: usb4Budget, adapterdirection: adapterDirection, mstchain: mstChain, pdfixed: pdFixedProfile, multiportcompare: multiportCompare, directdock: directDockIsolation, portdecode: portDecode, videochain: videoFeatureChain, hubbandwidth: hubBandwidth, rolematch: roleMatch, usb4fallback: usb4Fallback, highrefresh: highRefreshIsolation, dropout: peripheralDropout, onecablemonitor: oneCableMonitor, hdmirouting: hdmiRoutingSelector, hdmimatrix: hdmiMatrixSize, hdmimixed: hdmiMixedDisplay, hdmiaudio: hdmiAudioRoute, hdmiisolation: hdmiDistributionIsolation, poeclass: poeClassCheck, poeselector: poeEquipmentSelector, poebudget: poePowerBudget, poepassthrough: poePassthroughPlan, passivepoe: passivePoePreflight, poeisolation: poeFailureIsolation, audiosignal: audioSignalPath, headsetadapter: headsetAdapter, micpower: microphonePower, audionoise: audioNoiseIsolation, opticalformat: opticalFormatCheck, adatcapacity: adatCapacityPlan, digitalclock: digitalClockPlan, digitalfault: digitalFaultIsolate };
  const calculate = calculators[tool.dataset.tool];
  if (!calculate) return;
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
    track('tool_run', { ...analyticsContext, source_context: 'explicit_submit' });
    track('tool_result', { ...analyticsContext, result_state: resultState(), source_context: 'explicit_submit' });
  });
  form.addEventListener('reset', () => {
    track('reset_tool', { ...analyticsContext, source_context: 'tool_controls' });
    setTimeout(calculate, 0);
  });
  tool.querySelector('[data-copy]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const text = [status.textContent, headline.textContent, summary.textContent, ...Array.from(details.querySelectorAll('li')).map((li) => li.textContent), ...(['audiosignal', 'headsetadapter', 'micpower', 'audionoise', 'opticalformat', 'adatcapacity', 'digitalclock', 'digitalfault'].includes(tool.dataset.tool) ? [evidence.textContent.replace(/^Confidence boundary/, 'Confidence boundary: ')] : [])].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      track('copy_result', { ...analyticsContext, result_state: resultState(), source_context: 'result_panel' });
      button.textContent = 'Copied';
      setTimeout(() => button.textContent = 'Copy result', 1500);
    } catch { button.textContent = 'Copy unavailable'; }
  });
  tool.querySelector('[data-print]')?.addEventListener('click', () => {
    track('print_result', { ...analyticsContext, result_state: resultState(), source_context: 'result_panel' });
    window.print();
  });
  calculate();
})();
