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
    let ratio = ceiling / need;
    const notes = ['Electrical ceiling: ' + fmt(ceiling) + ' W, set by ' + bottlenecks.join(' + ') + '.'];
    if (ppsNeeded && !pps) { ratio = Math.min(ratio, .5); notes.push('The device needs PPS, but PPS was not confirmed on the charger. Expect a fallback profile.'); }
    if (proprietary) notes.push('The advertised maximum depends on a proprietary protocol; standard USB PD may be lower.');
    const delivered = Math.max(1, need * ratio);
    const kind = ratio >= .9 && !proprietary ? 'ok' : ratio >= .6 && !proprietary ? 'warn' : 'bad';
    const label = kind === 'ok' ? 'Likely full-rate' : kind === 'warn' ? 'Limited' : 'Compatibility risk';
    paint(kind, label, fmt(delivered) + ' W ceiling', kind === 'ok' ? 'The declared chain can meet the device target.' : 'At least one declared requirement may limit charging.', notes, 'This is a declared-capability check, not a live measurement. Battery temperature, state of charge, system load, port sharing, cable condition, and vendor protocols can reduce actual power.');
  }

  function cableDecode() {
    const power = number('power');
    const data = number('data');
    const length = number('length');
    const marked = checked('marked');
    const video = checked('video');
    const claims = [];
    const cautions = [];
    claims.push('Declared charging ceiling: ' + power + ' W.');
    claims.push(data === 0 ? 'No high-speed data claim supplied; treat as USB 2.0 / charge-first until verified.' : 'Declared data rate: ' + data + ' Gbps.');
    if (power > 60 && !marked) cautions.push('Above 60 W requires a 5 A electronically marked cable; no marking/e-marker evidence was confirmed.');
    if (video && data < 5) cautions.push('A charge-only or USB 2.0 cable is not a safe choice for USB-C video.');
    if (length > 2 && data >= 40) cautions.push('Long passive high-speed cables are difficult; verify active/passive type and certified data rating.');
    if (video && data >= 5) claims.push('A full-featured high-speed C-to-C cable is a plausible DP Alt Mode path, but the source and display must also support video.');
    const kind = cautions.length ? 'warn' : marked ? 'ok' : 'info';
    paint(kind, kind === 'ok' ? 'Declared fit' : kind === 'warn' ? 'Verify before use' : 'Unknown', power + ' W / ' + (data || 'USB 2.0?') + (data ? ' Gbps' : ''), cautions.length ? 'The labels do not fully support the intended use.' : 'The declared capabilities are internally plausible.', claims.concat(cautions), 'A browser cannot read the cable e-marker. Packaging, certification records, a hardware tester, or operating-system telemetry is needed to verify the actual cable. Connector shape alone proves no data, video, or charging capability.');
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
    paint(fits ? (load < .85 ? 'ok' : 'warn') : 'bad', fits ? (load < .85 ? 'Fits estimate' : 'Tight fit') : 'Over capacity', fmt(estimated, 2) + ' Gbps', fits ? 'Estimated active video fits the selected usable link payload.' : 'Estimated video demand exceeds the selected usable payload.', ['Selected payload: ' + fmt(capacity, 2) + ' Gbps.', (fits ? 'Estimated headroom: ' : 'Estimated shortfall: ') + fmt(Math.abs(margin), 2) + ' Gbps.', streams > 1 ? streams + ' identical display streams included.' : 'One display stream included.'], 'This is not a VESA timing compliance calculator. Blanking, DSC, MST overhead, adapters, dock lane allocation, GPU limits, and OS display support can change the outcome. Use exact timing data when available.');
  }

  function multiportPlan() {
    const total = number('total');
    const wants = [1, 2, 3, 4].map((i) => Math.max(0, number('device' + i) || 0));
    const caps = [1, 2, 3, 4].map((i) => Math.max(0, number('cap' + i) || 0));
    if (!Number.isFinite(total) || total <= 0 || !wants.some((w) => w > 0)) {
      paint('bad', 'Check input', '—', 'Add a positive charger budget and at least one device.', ['Unused rows can stay at zero.'], 'No allocation can be estimated without a total budget.');
      return;
    }
    const requested = wants.map((w, i) => Math.min(w, caps[i] || w));
    const sum = requested.reduce((a, b) => a + b, 0);
    const scale = sum > total ? total / sum : 1;
    const allocated = requested.map((w) => w * scale);
    const rows = allocated.map((w, i) => wants[i] > 0 ? 'Device ' + (i + 1) + ': about ' + fmt(w) + ' W of ' + fmt(wants[i]) + ' W wanted' : null).filter(Boolean);
    const kind = sum <= total ? 'ok' : scale >= .7 ? 'warn' : 'bad';
    paint(kind, sum <= total ? 'Budget fits' : 'Shared budget', fmt(allocated.reduce((a, b) => a + b, 0)) + ' W planned', sum <= total ? 'The entered per-port targets fit inside the total charger budget.' : 'A proportional allocation would reduce one or more device targets.', rows.concat(['Combined capped demand: ' + fmt(sum) + ' W.', 'Total charger budget: ' + fmt(total) + ' W.']), 'Real multi-port chargers do not necessarily split power proportionally. Their port-combination table and renegotiation behavior control actual allocation. Enter manufacturer per-port caps and verify the specific combination before purchase.');
  }

  function troubleshoot() {
    const symptom = value('symptom');
    const changed = value('changed');
    const known = value('known');
    const paths = {
      slow: ['Check the device charging target and required protocol (PD, PPS, or vendor-specific).', 'Test one device on one charger port; shared ports may lower the available profile.', 'Try a known-good 5 A e-marked cable when the target exceeds 60 W.', 'Compare power at low battery charge and cool temperature; charging naturally tapers.'],
      none: ['Inspect and clean the ports; stop if moisture, heat, bent pins, or damage is present.', 'Try a known-good charger and cable separately to isolate the failed part.', 'For small C-powered devices that only work with A-to-C, the device may lack proper USB-C sink signaling.', 'Check whether the selected charger port is output-only and supports the needed voltage.'],
      video: ['Confirm the source USB-C port explicitly supports DisplayPort Alt Mode, USB4, or Thunderbolt video.', 'Use a full-featured cable; a charging cable may have no high-speed lanes.', 'Remove the dock and test a direct USB-C-to-display path.', 'Lower refresh rate/color depth to test a bandwidth limitation.'],
      dual: ['Confirm how many displays the host GPU and operating system support.', 'Check whether the dock uses MST, Thunderbolt/USB4 tunneling, or DisplayLink.', 'macOS generally does not provide two independent extended displays through ordinary MST.', 'Check dock lane allocation and the combined display bandwidth.'],
      disconnect: ['Check for multi-port charger renegotiation when another device is attached.', 'Replace long or marginal high-speed cables.', 'Test without hubs/adapters, then add one component at a time.', 'Check heat, firmware updates, and port power-saving settings.']
    };
    const list = paths[symptom] || paths.none;
    if (changed === 'yes') list.unshift('Start with the most recent changed cable, charger, dock, display setting, or software update.');
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
