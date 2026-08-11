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

  const number = (name) => Number(new FormData(form).get(name));
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

  const calculators = { charge: chargeCheck, cable: cableDecode, display: displayPlan, multiport: multiportPlan, troubleshoot };
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
