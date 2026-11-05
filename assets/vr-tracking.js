/* Declared-capability worksheets, not device detection or hardware certification. */
(() => {
  'use strict';
  const result = (kind, label, title, summary, details = [], boundary = '') => ({ kind, label, title, summary, details, boundary });
  const generationBoundary = 'One declared device and its optical tracking requirement only. SteamVR app support does not establish Lighthouse sensor support, radio pairing, shared coordinates or wired-PCVR compatibility.';
  const receiverBoundary = 'Logical radio slots only, conditional on exact receiver/device support and verified available channels. Not USB-port capacity, RF performance, app tracker support or a purchase guarantee.';
  const syncBoundary = 'Logical synchronization worksheet for the documented consumer cases shown, not placement, field of view, coverage, range, tracking accuracy or a physical-installation approval.';
  const faultBoundary = 'User-entered observations narrow the next unresolved layer; they do not prove a cause or detect hardware. No calibration measurements, firmware/install commands, security changes, device opening or laser inspection.';
  const calculators = {
    vrgeneration(api) {
      const stations = api.enum('stations', ['v1', 'v2', 'mixed', 'none', 'unknown']);
      const sensors = api.enum('sensors', ['v1only', 'both', 'insideout', 'unknown']);
      const evidence = api.enum('generationEvidence', ['yes', 'no']);
      const done = (kind, label, title, summary, details = []) => result(kind, label, title, summary, details, generationBoundary);
      if (sensors === 'unknown' || evidence === 'no') return done('warn', 'EVIDENCE NEEDED', 'Confirm the device tracking requirement', 'Use the exact device manual to distinguish 1.0-only sensors, sensors supporting both generations, and independent inside-out tracking. A SteamVR label alone does not decide this.');
      if (sensors === 'insideout') return done('info', 'INDEPENDENT TRACKING', 'Do not route this device through Lighthouse', 'This declared device determines its pose independently of Lighthouse stations. Other Lighthouse-tracked accessories still need their own optical and radio paths.', ['Mixed tracking spaces can require a supported bridge and coordinate alignment; no Quest or other headset is assumed to work automatically.']);
      if (stations === 'mixed') return done('bad', 'MIXED GENERATIONS', 'Separate the station generations', 'Base Station 1.0 and 2.0 do not form one shared optical setup for this declared Lighthouse device.');
      if (stations === 'unknown') return done('warn', 'STATIONS UNKNOWN', 'Identify the station generation', 'The device declaration is not enough to choose an optical path while the station generation is unknown.');
      if (stations === 'none') return done('bad', 'OPTICAL PATH MISSING', 'A declared Lighthouse device needs stations', 'No Lighthouse station is included in this declared path. A wireless receiver alone does not supply the optical reference.');
      if (stations === 'v2' && sensors === 'v1only') return done('bad', 'GENERATION CONFLICT', 'The declared sensors do not support 2.0', 'A 1.0-only Lighthouse sensor declaration does not support Base Station 2.0. A different USB cable or extra receiver does not change that requirement.');
      return done('ok', 'DECLARED OPTICAL MATCH', 'The declared optical generations intersect', 'The station generation is supported by the device declaration. Plan radio receivers and station synchronization separately; this is not a complete working-system verdict.');
    },
    vrreceivers(api) {
      const classicNeed = api.number('classicNeed', 0, 32), classicTotal = api.number('classicTotal', 0, 32), classicReserved = api.number('classicReserved', 0, 32);
      const ultimateNeed = api.number('ultimateNeed', 0, 5), ultimateTotal = api.number('ultimateTotal', 0, 5), ultimateReserved = api.number('ultimateReserved', 0, 5);
      const classicProof = api.enum('classicProof', ['yes', 'unknown']), ultimateProof = api.enum('ultimateProof', ['yes', 'unknown']);
      const done = (kind, label, title, summary, details = []) => result(kind, label, title, summary, details, receiverBoundary);
      if (classicReserved > classicTotal || ultimateReserved > ultimateTotal) return done('bad', 'INVALID RESERVATION', 'Reserved channels exceed declared capacity', 'For each pool, reserved channels must be included within its declared total, not added to it.');
      if (!classicNeed && !ultimateNeed) return done('info', 'NO RADIO DEMAND', 'No devices requested', 'Enter devices needing receiver channels to build an assignment. Spare capacity is not proof of a compatible device.');
      const pools = [
        { name: 'Classic compatible pool', need: classicNeed, total: classicTotal, reserved: classicReserved, proof: classicProof },
        { name: 'One Ultimate dongle', need: ultimateNeed, total: ultimateTotal, reserved: ultimateReserved, proof: ultimateProof }
      ];
      const rows = [], assignments = []; let shortfall = 0, unresolved = false;
      for (const pool of pools) {
        const available = pool.total - pool.reserved;
        if (pool.need && pool.proof !== 'yes') unresolved = true;
        const verified = pool.proof === 'yes';
        const deficit = verified ? Math.max(0, pool.need - available) : null;
        if (pool.need && deficit !== null) shortfall += deficit;
        rows.push([pool.name, pool.need, pool.total, pool.reserved, verified ? available : 'Unverified', verified ? deficit : 'Unresolved']);
        if (verified) for (let n = 1; n <= Math.min(pool.need, available); n += 1) assignments.push([pool.name, `Requested device ${n}`, `Logical free channel ${n}`]);
      }
      const details = [{ html: api.table(['Pool', 'Requested', 'Total slots', 'Reserved', 'Available', 'Shortfall'], rows) }];
      if (assignments.length) details.push({ html: api.table(['Pool', 'Device label', 'Worksheet assignment'], assignments) });
      details.push('Logical free-channel numbers are worksheet labels, not physical dongle ports, headset addresses or instructions to re-pair devices. Keep existing assignments intact until the exact manual supports a change.');
      details.push('A Tundra SW3/SW5/SW7 can expose multiple compatible channels. Ultimate uses a different receiver family and camera-based tracking. Do not transfer spare capacity between these pools.');
      if (shortfall) return done('bad', 'VERIFIED SHORTFALL', 'A verified pool lacks receiver channels', `${shortfall} requested device(s) cannot be assigned within verified available capacity.${unresolved ? ' Another requested pool is also unverified.' : ''}`, details);
      if (unresolved) return done('warn', 'CAPACITY UNVERIFIED', 'Complete receiver evidence before assigning', 'At least one requested pool lacks verified receiver capacity or exact device-family support. Its numbers do not establish a fit.', details);
      return done('ok', 'CONDITIONAL ASSIGNMENT', 'The requested radio slots can be allocated', 'Each requested device has one logical slot in its verified compatible pool. Optical tracking, app support and radio reliability remain separate checks.', details);
    },
    vrsync(api) {
      const generation = api.enum('syncGeneration', ['v1', 'v2', 'mixed', 'unknown']);
      const count = api.number('stationCount', 0, 4);
      const route = api.enum('syncRoute', ['optical', 'cable', 'unknown']);
      const visibility = api.enum('interStation', ['clear', 'blocked', 'unknown']);
      const cable = api.enum('approvedCable', ['yes', 'no', 'unknown']);
      const channels = [1, 2, 3, 4].map(n => api.number(`channel${n}`, 1, 16));
      const done = (kind, label, title, summary, details = []) => result(kind, label, title, summary, details, syncBoundary);
      if (!count) return done('info', 'NO STATIONS', 'No synchronization plan requested', 'No Lighthouse stations are included. This is not a complete tracking verdict for any connected device.');
      if (generation === 'mixed') return done('bad', 'MIXED GENERATIONS', 'Do not combine 1.0 and 2.0 stations', 'Choose one supported optical generation for this tracked set before planning synchronization.');
      if (generation === 'unknown') return done('warn', 'GENERATION UNKNOWN', 'Identify the station generation first', 'Generation 1.0 synchronization modes and generation 2.0 channels are different systems.');
      if (generation === 'v2') {
        const active = channels.slice(0, count);
        if (new Set(active).size !== active.length) return done('bad', 'CHANNEL COLLISION', 'Give active 2.0 stations distinct channels', 'The entered active station channels contain duplicates. Check exact station setup instructions; this worksheet does not change any hardware.', [{ html: api.table(['Station', 'Entered channel'], active.map((v, i) => [i + 1, v])) }]);
        return done('ok', '2.0 CHANNEL PLAN', 'Active stations have distinct declared channels', 'Up to four active 2.0 stations in this consumer tracked set use distinct channels from 1–16. They do not use a 1.0 station-to-station sync cable.', [{ html: api.table(['Station', 'Channel'], active.map((v, i) => [i + 1, v])) }, 'The optical/cable route and inter-station visibility fields apply only to 1.0 and are not used for this 2.0 plan.']);
      }
      if (count > 2) return done('bad', '1.0 COUNT CONFLICT', 'This 1.0 plan supports one or two stations', 'The documented consumer 1.0 synchronization case does not support three or four active stations.');
      if (count === 1) return done('ok', 'SINGLE 1.0 STATION', 'Use the documented single-station mode', 'The documented single Base Station 1.0 case uses mode A. No second station exists to synchronize with.', ['A single station does not guarantee coverage or continuous visibility of every device.']);
      if (route === 'unknown') return done('warn', 'SYNC ROUTE UNKNOWN', 'Choose the documented 1.0 synchronization path', 'Two 1.0 stations need their documented optical-sync or approved sync-cable setup.');
      if (route === 'cable') {
        if (cable !== 'yes') return done('warn', 'CABLE EVIDENCE NEEDED', 'Confirm the approved synchronization cable', 'Do not infer cable approval from a fitting connector. This route remains unresolved until the exact station manual/cable evidence confirms it.');
        return done('ok', '1.0 CABLE SYNC', 'Documented cable route: modes A and b', 'The declared approved sync-cable case uses mode A on one 1.0 station and mode b on the other.', ['These labels describe the documented HTC consumer case, not arbitrary audio sockets or other tracking systems.']);
      }
      if (visibility !== 'clear') return done('warn', 'OPTICAL SYNC UNRESOLVED', 'Confirm unobstructed inter-station sync', visibility === 'blocked' ? 'The declared optical sync path is blocked. Use the exact manual to resolve visibility or verify an approved sync-cable route.' : 'Inter-station optical visibility is unknown; do not assume the stations can synchronize.');
      return done('ok', '1.0 OPTICAL SYNC', 'Documented optical route: modes b and c', 'With declared unobstructed optical synchronization, the documented two-station 1.0 case uses modes b and c.', ['This records the sync requirement only. It does not determine device visibility, station mounting or room coverage.']);
    },
    vrfault(api) {
      const baseline = api.enum('supportedBaseline', ['yes', 'no', 'unknown']);
      const family = api.enum('trackingFamily', ['lighthouse', 'camera', 'unknown']);
      const paired = api.enum('pairedSignal', ['yes', 'no', 'unknown']);
      const runtime = api.enum('runtimePresent', ['yes', 'no', 'unknown']);
      const pose = api.enum('validPose', ['yes', 'no', 'unknown']);
      const app = api.enum('appDetected', ['yes', 'no', 'unknown']);
      const role = api.enum('appAssigned', ['yes', 'no', 'unknown']);
      const coordinates = api.enum('coordinateSpace', ['same', 'different', 'unknown']);
      const scope = api.enum('affectedScope', ['single', 'multiple']);
      const done = (kind, label, title, summary, details = []) => result(kind, label, title, summary, details, faultBoundary);
      const scopeNote = scope === 'single' ? 'One device is affected: retain a working device as a comparison, without changing its pairing or calibration.' : 'Multiple devices are affected: record shared receiver, station generation, runtime and app dependencies before changing individual devices.';
      const details = [scopeNote, 'An LED indication must be interpreted using the exact device manual. Pairing, runtime detection, a valid tracked pose and app/body-role assignment are separate observations.'];
      if (baseline !== 'yes') return done('warn', 'BASELINE UNVERIFIED', 'Establish a supported tracking baseline', 'Confirm device/receiver/optical-generation and runtime/app support before interpreting substitutions. Do not experiment with unsupported hardware merely to fill this record.', details);
      if ((paired === 'no' && runtime === 'yes') || (runtime === 'no' && pose === 'yes') || (app === 'no' && role === 'yes')) return done('warn', 'OBSERVATIONS CONFLICT', 'Record one consistent device and session', 'The entered stages conflict for this wireless tracking path. Recheck the device identity, manual-defined indicator and observation time before selecting a failed layer.', details);
      if (paired === 'no') return done('warn', 'PAIRING LAYER OPEN', 'Record the receiver ownership evidence', 'A supported pairing indication has not been observed. Confirm the documented receiver assignment; optical station LEDs do not prove radio pairing.', details);
      if (paired === 'unknown') return done('info', 'PAIRING UNKNOWN', 'Record the device pairing indication', 'Use the exact device manual to interpret its pairing state. Do not treat an unknown LED or color as a successful connection.', details);
      if (runtime === 'no') return done('warn', 'RUNTIME LAYER OPEN', 'Pairing has not established runtime visibility', 'The device indicates pairing but is absent from the runtime. Record receiver ownership and the supported runtime/device bridge; a paired LED alone does not establish tracking.', details);
      if (runtime === 'unknown') return done('info', 'RUNTIME UNKNOWN', 'Observe the runtime device list', 'The hardware pairing observation is not enough to decide whether the runtime detects the device.', details);
      if (pose === 'no') return done('warn', 'POSE LAYER OPEN', 'Separate runtime presence from tracked pose', family === 'lighthouse' ? 'The device is present but lacks a valid pose. Record compatible optical generation, station state and device visibility using the exact manual. Receiver presence does not prove the optical path.' : family === 'camera' ? 'The device is present but lacks a valid pose. Record the camera-tracking/map state described by its exact manual; adding Lighthouse stations is not a generic fix.' : 'The device is present but lacks a valid pose. Identify its tracking technology before selecting an optical-station or camera-tracking observation.', details);
      if (pose === 'unknown') return done('info', 'POSE UNKNOWN', 'Observe runtime tracking before app setup', 'A visible runtime device is not necessarily producing a valid tracked pose. Record that observation separately.', details);
      if (app === 'no') return done('warn', 'APP DETECTION OPEN', 'The runtime pose is not reaching the app', 'A valid runtime pose has been observed, but the app does not detect the device. Check documented app/runtime integration and supported tracker roles before replacing optical hardware.', details);
      if (app === 'unknown') return done('info', 'APP DETECTION UNKNOWN', 'Record the app device list', 'Runtime tracking is observed. Whether the intended app receives the tracker remains unknown.', details);
      if (role === 'no') return done('warn', 'APP ROLE OPEN', 'Assign the documented intended role', 'The app detects the tracker but its intended role is not assigned. Use the app’s supported role workflow; do not infer a failed radio or station from a wrong avatar/body role.', details);
      if (role === 'unknown') return done('info', 'APP ROLE UNKNOWN', 'Record the intended app assignment', 'The tracker reaches the app, but the intended body/object role is not yet verified.', details);
      if (coordinates !== 'same') return done('warn', 'SPACE ALIGNMENT OPEN', 'Check the shared coordinate-space evidence', coordinates === 'different' ? 'Working runtime tracking and assigned app roles are declared in different coordinate spaces. Verify a supported alignment route; no static worksheet measures or performs that calibration.' : 'Tracking and assignment are observed, but a shared coordinate space is unverified. Do not assume a SteamVR label aligns independently tracked devices.', details);
      return done('info', 'OBSERVATIONS RECORDED', 'All recorded tracking stages are observed', 'Pairing, runtime visibility, valid pose, app detection, intended assignment and a shared coordinate space are declared. This record does not certify accuracy or explain any remaining intermittent fault.', details);
    }
  };
  window.CCLLab.mount({ workbench: 'vr-tracking', calculators });
})();
