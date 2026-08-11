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

  const calculators = { charge: chargeCheck, cable: cableDecode, display: displayPlan, multiport: multiportPlan, pps: ppsRangeCheck, pdrequirement: pdRequirement, cableselector: cableSelector, datapath: dataPathCheck, dsc: dscPlan, lanes: lanePlan, dockrequirement: dockRequirement, hubpower: hubPowerBudget, troubleshoot };
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
