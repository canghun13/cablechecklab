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

  const tool = document.querySelector('[data-tool]');
  if (!tool) return;

  const form = tool.querySelector('form');
  const output = tool.querySelector('[data-result]');
  const status = tool.querySelector('[data-status]');
  const headline = tool.querySelector('[data-headline]');
  const summary = tool.querySelector('[data-summary]');
  const details = tool.querySelector('[data-details]');
  const evidence = tool.querySelector('[data-evidence]');

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
    if (![need, charger, cable].every((n) => Number.isFinite(n) && n > 0)) {
      paint('bad', 'Check input', '—', 'Enter positive wattage values.', ['Device, charger, and cable values must all be above zero.'], 'No estimate is produced from invalid inputs.');
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
    if (![power, data, length].every(Number.isFinite) || power <= 0 || data < 0 || length <= 0) {
      paint('bad', 'Check input', '—', 'Use valid cable claims and a positive length.', ['Choose a power claim, data claim, and cable length.'], 'No capability screen is produced from invalid inputs.');
      return;
    }
    const claims = [];
    const cautions = [];
    const dataLabel = data === 0 ? 'no verified high-speed data claim' : data < 1 ? fmt(data * 1000, 0) + ' Mbps' : fmt(data) + ' Gbps';
    let title = power + ' W / ' + dataLabel;

    if (connector === 'c-c') {
      claims.push('Declared charging ceiling: ' + power + ' W.');
      claims.push(data === 0 ? 'No high-speed data claim supplied; treat it as USB 2.0 or charge-first until verified.' : 'Declared data rate: ' + dataLabel + '.');
      if (power > 60 && !marked) cautions.push('Above 60 W requires a 5 A electronically marked cable; no exact-model marking, record, or tester evidence was confirmed.');
      if (video && data < 5) cautions.push('A charge-first or USB 2.0 C-to-C cable is not a safe choice for DisplayPort Alt Mode.');
      if (length > 2 && data >= 40) cautions.push('For a long high-speed cable, verify the exact length, active/passive construction, and certified data rating.');
      if (video && data >= 5) claims.push('A full-featured high-speed C-to-C cable is a plausible DisplayPort Alt Mode path, but source and display support remain separate requirements.');
    } else if (connector === 'a-c') {
      title = 'USB-A to USB-C';
      claims.push('This is a legacy USB-A host-side path, not a USB-C to USB-C Power Delivery cable.');
      claims.push('Declared data claim: ' + dataLabel + '. Verify the USB-A port and exact cable generation.');
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
    paint(kind, kind === 'ok' ? 'Declared fit' : kind === 'warn' ? 'Verify before use' : 'Unverified claim', title, cautions.length ? 'The selected claims do not fully establish the intended use.' : 'The declared capabilities are internally plausible.', claims.concat(cautions), 'A browser cannot read an e-marker or identify an adapter chipset. Packaging, the USB-IF product record, exact-model specifications, a hardware tester, or operating-system telemetry is needed to verify the product. Connector shape alone proves no data, video, or charging capability.');
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
    const wants = [1, 2, 3, 4].map((i) => Math.max(0, number('device' + i) || 0));
    const caps = [1, 2, 3, 4].map((i) => Math.max(0, number('cap' + i) || 0));
    if (!Number.isFinite(total) || total <= 0 || !wants.some((w) => w > 0)) {
      paint('bad', 'Check input', '—', 'Add a positive charger budget and at least one device.', ['Unused rows can stay at zero.'], 'No allocation can be estimated without a total budget.');
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
    if (usbDemand > usbCapacity) blockers.push('monitor hub demand exceeds entered USB upstream pool');
    const list = ['Display: ' + fmt(displayDemand, 2) + ' Gbps demand / ' + fmt(displayCapacity, 2) + ' Gbps usable capacity.', 'Charging: ' + fmt(laptopPower, 0) + ' W target / ' + fmt(powerCeiling, 0) + ' W declared monitor-and-cable ceiling.', 'Monitor USB: ' + fmt(usbDemand, 2) + ' Gbps demand / ' + fmt(usbCapacity, 2) + ' Gbps upstream pool.'];
    if (blockers.length) list.push('Blocking condition(s): ' + blockers.join('; ') + '.');
    if (unknown.length) list.push('Still verify: ' + unknown.join(', ') + '.');
    paint(blockers.length ? 'bad' : unknown.length ? 'warn' : 'ok', blockers.length ? 'One-cable plan blocked' : unknown.length ? 'One-cable plan unverified' : 'Declared one-cable fit', blockers.length ? blockers.length + ' blocker(s)' : unknown.length ? unknown.length + ' unknown(s)' : 'Video + power + USB', blockers.length ? 'At least one entered requirement cannot pass through this one-cable plan.' : unknown.length ? 'The numeric budgets fit, but a required video declaration is unknown.' : 'The entered video, charging, and USB requirements fit on paper.', list, 'This combines declared requirements; it does not prove an exact host/monitor pairing. Lane sharing, DSC, display timing, monitor KVM behavior, Ethernet/audio, wake/sleep, firmware, cable construction, and power negotiation still require exact-model verification.');
  }

  const calculators = { charge: chargeCheck, cable: cableDecode, display: displayPlan, multiport: multiportPlan, pps: ppsRangeCheck, pdrequirement: pdRequirement, cableselector: cableSelector, datapath: dataPathCheck, dsc: dscPlan, lanes: lanePlan, dockrequirement: dockRequirement, hubpower: hubPowerBudget, troubleshoot, usb4path: usb4FeaturePath, usb4budget: usb4Budget, adapterdirection: adapterDirection, mstchain: mstChain, pdfixed: pdFixedProfile, multiportcompare: multiportCompare, directdock: directDockIsolation, portdecode: portDecode, videochain: videoFeatureChain, hubbandwidth: hubBandwidth, rolematch: roleMatch, usb4fallback: usb4Fallback, highrefresh: highRefreshIsolation, dropout: peripheralDropout, onecablemonitor: oneCableMonitor };
  const calculate = calculators[tool.dataset.tool];
  if (!calculate) return;
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  form.addEventListener('reset', () => setTimeout(calculate, 0));
  tool.querySelector('[data-copy]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const text = [status.textContent, headline.textContent, summary.textContent, ...Array.from(details.querySelectorAll('li')).map((li) => li.textContent)].join('\n');
    try { await navigator.clipboard.writeText(text); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy result', 1500); } catch { button.textContent = 'Copy unavailable'; }
  });
  tool.querySelector('[data-print]')?.addEventListener('click', () => window.print());
  calculate();
})();
