(() => {
  'use strict';
  const result = (kind, label, title, summary, details, boundary) => ({kind, label, title, summary, details, boundary});
  const families = ['pf', 'pup', 'nxt', 'ev3', 'unknown'];
  const familyName = {pf:'Power Functions',pup:'Powered Up / LPF2',nxt:'MINDSTORMS NXT',ev3:'MINDSTORMS EV3',unknown:'Unverified family'};
  const text = (api, name) => {
    const value = api.value(name).trim();
    if (value.length > 40) throw new Error('Keep each group or task label within 40 characters.');
    return value;
  };
  const boundary = 'Planning from the selected profiles and declarations, not a hardware test, power budget or electrical safety approval. LEGO is a trademark of the LEGO Group, which does not sponsor, authorize or endorse this site. No wiring, pinout or firmware-installation recipe is supplied.';

  function brickRoute(api) {
    const source = api.enum('brSource', families), target = api.enum('brTarget', families);
    const kind = api.enum('brKind', ['motor','sensor','light','unknown']);
    const connection = api.enum('brConnection', ['direct','adapter','unknown']);
    const goal = api.enum('brGoal', ['basic','position','read','light','unknown']);
    const feedback = api.enum('brFeedback', ['yes','no','unknown']);
    const bridge = api.enum('brBridge', ['yes','no','unknown']);
    const rows = [
      ['Source', familyName[source] + ' / ' + kind],
      ['Receiver', familyName[target]],
      ['Connection class', connection === 'direct' ? 'Direct, unmodified connection' : connection === 'adapter' ? 'Exact documented adapter required' : 'Unverified'],
      ['Requested behavior', {basic:'Basic motor running',position:'Motor position / angle feedback',read:'Sensor readings',light:'Light operation',unknown:'Unverified'}[goal]]
    ];
    const details = [{html:api.table(['Layer','Requirement'],rows)}, 'A matching construction-brick shape or brand is not a common electrical interface. Physical family alignment does not establish app support.'];
    if ([source,target,kind,connection,goal].includes('unknown')) return result('warn','Identify the path','Connection family is still unverified','Identify both electronic systems, component kind and required behavior first.',details,boundary);
    if ((kind === 'motor' && !['basic','position'].includes(goal)) || (kind === 'sensor' && goal !== 'read') || (kind === 'light' && goal !== 'light')) return result('bad','Role conflict','Component and requested job differ','Choose the behavior belonging to the entered component; a cable cannot turn a light into a sensor.',details,boundary);
    if (goal === 'position' && feedback === 'no') return result('bad','Feedback missing','Basic motor power is not position feedback','A declared motor without rotation sensing cannot supply measured angle feedback through a passive lead.',details,boundary);
    if (connection === 'adapter') {
      if (bridge === 'no') return result('bad','Bridge unsupported','The declared adapter does not cover this path','Do not treat an unsupported adapter as a direct route.',details,boundary);
      return result('warn','Verify exact bridge','Adapter functionality needs exact evidence',bridge === 'yes' ? 'Your declaration identifies an adapter route, not a universal bridge. Confirm direction, sensor/feedback support and the exact software before connection.' : 'No adapter function has been established. An adapter shell alone does not preserve sensor data or feedback.',details,boundary);
    }
    if ((source === 'pf' && target === 'pup') || (source === 'pup' && target === 'pf')) return result('bad','Direct-system conflict','Power Functions and Powered Up are not direct mates','The official systems use different connectors and control technology. Keep an exact documented bridge separate from a direct connection.',details,boundary);
    if (source === 'ev3' && target === 'nxt' && kind === 'sensor') return result('bad','Sensor direction conflict','EV3 sensors are not supported by the NXT brick','The NXT/EV3 sensor compatibility direction is not symmetric, despite similar cables.',details,boundary);
    if (goal === 'position' && (source === 'pf' || target === 'pf')) return result('warn','Verify feedback transport','A PF motor-power route does not establish rotation data','Internal servo behavior and readable position feedback are different functions. Verify the exact controller and exposed feedback rather than treating a power lead as a data bridge.',details,boundary);
    const mindstorms = ['nxt','ev3'].includes(source) && ['nxt','ev3'].includes(target) && ['motor','sensor'].includes(kind);
    const same = source === target && (source === 'pup' || (source === 'pf' && ['motor','light'].includes(kind)));
    if (!mindstorms && !same) return result('warn','Unlisted direct route','No direct route is established by this profile','Do not infer a bridge between LPF2, Power Functions and Mindstorms generations. Check the exact component documentation.',details,boundary);
    if (goal === 'position' && feedback !== 'yes') return result('warn','Verify feedback','The position requirement is unresolved','A motor may run without exposing rotation feedback. Confirm the exact motor and software function.',details,boundary);
    return result('info','Family route documented','Direct family route is available in this scope','This identifies a physical component-family route, not every model, sensor mode, app or firmware feature. Continue with the control path separately.',details,boundary);
  }

  function brickPorts(api) {
    const profile = api.enum('bpProfile',['city','technic','prime','unknown']);
    const runtime = api.enum('bpRuntime',['stock','pybricks','unknown']);
    const pairMode = api.enum('bpPair',['none','drivebase']);
    const left = api.enum('bpLeft',['none','1','2','3','4','5','6']), right = api.enum('bpRight',['none','1','2','3','4','5','6']);
    const portChoices = ['none','A','B','C','D','E','F'], roleChoices = ['unused','dc','encoder','sensor','light','unknown'];
    const connections = Array.from({length:6},(_,i) => ({
      index:i+1, label:text(api,'bp'+(i+1)+'Label') || 'Connection '+(i+1),
      role:api.enum('bp'+(i+1)+'Role',roleChoices),
      physical:api.enum('bp'+(i+1)+'Physical',portChoices),
      program:api.enum('bp'+(i+1)+'Program',portChoices)
    }));
    const active = connections.filter(row=>row.role !== 'unused');
    const ports = {city:['A','B'],technic:['A','B','C','D'],prime:['A','B','C','D','E','F'],unknown:[]}[profile];
    const issues = [], notes = ['Each active row represents one independent external connection. The worksheet does not allocate current, validate splitters or detect a connected hub.'];
    const rows = active.map(row=>[row.label,{dc:'Motor without rotation sensor',encoder:'Motor with rotation sensor',sensor:'Sensor',light:'Light',unknown:'Unverified component'}[row.role],row.physical === 'none' ? 'Missing' : row.physical,row.program === 'none' ? 'Missing' : row.program]);
    if (profile === 'unknown') return result('warn','Select a hub profile','External port map is unverified','Choose the exact supported profile. Do not count buttons, a status light or built-in motors as extra external sockets.',[{html:api.table(['Task','Component','Physical port','Program port'],rows)},...notes],boundary);
    if (!active.length) return result('info','No assignments','Add a connection task','An empty worksheet is not a validated kit.',notes,boundary);
    for (const row of active) {
      if (!ports.includes(row.physical)) issues.push(row.label+': physical port is missing or outside this profile.');
      if (!ports.includes(row.program)) issues.push(row.label+': program port is missing or outside this profile.');
      if (ports.includes(row.physical) && ports.includes(row.program) && row.physical !== row.program) issues.push(row.label+': physical '+row.physical+' differs from program '+row.program+'.');
    }
    for (const type of ['physical','program']) for (const port of ports) {
      const matches = active.filter(row=>row[type] === port);
      if (matches.length > 1) issues.push('Port '+port+' has multiple independent '+type+' assignments: '+matches.map(row=>row.label).join(', ')+'.');
    }
    if (pairMode === 'drivebase') {
      const l = connections.find(row=>String(row.index) === left), r = connections.find(row=>String(row.index) === right);
      if (!l || !r || left === right) issues.push('DriveBase needs two different active connection rows.');
      else if ([l.role,r.role].some(role=>!['encoder','unknown'].includes(role))) issues.push('Pybricks DriveBase requires two motors with rotation sensing, not a sensor, light or basic DC motor.');
      else if (l.role === 'unknown' || r.role === 'unknown') notes.push('The proposed DriveBase pair has an unverified component; confirm both rotation-sensing motors.');
      else notes.push('DriveBase pair: '+l.label+' (left) and '+r.label+' (right). This is a program assignment, not measured wheel synchronization.');
      if (runtime !== 'pybricks') issues.push('This DriveBase pair rule is scoped to an already-installed, documented Pybricks runtime.');
    }
    const details = [{html:api.table(['Task','Component','Physical port','Program port'],rows)},...issues,...notes];
    if (issues.length) return result('bad','Assignment conflict','The port worksheet needs correction',issues.length+' declared mapping or pair constraint'+(issues.length===1?' is':'s are')+' unresolved. Port count alone cannot establish a correct setup.',details,boundary);
    if (runtime === 'unknown' || active.some(row=>row.role === 'unknown')) return result('warn','Map only','Port map is distinct; component/runtime evidence remains unverified',active.length+' independent connections occupy '+active.length+' of '+ports.length+' external ports. Confirm every component role and exact app/device functionality before use.',details,boundary);
    notes.push('Unused external ports: '+(ports.filter(port=>!active.some(row=>row.physical===port)).join(', ') || 'none')+'.');
    return result('ok','Declared map consistent','Physical and program assignments agree',active.length+' independent connections occupy '+active.length+' of '+ports.length+' external ports. This checks assignment consistency, not motor/sensor support or available power.',[{html:api.table(['Task','Component','Physical port','Program port'],rows)},...notes],boundary);
  }

  function brickIR(api) {
    const system = api.enum('biSystem',['pf','other','unknown']);
    const receivers = Array.from({length:6},(_,i)=>({label:'Receiver '+(i+1),channel:api.enum('bi'+(i+1)+'Channel',['0','1','2','3','4','unknown']),red:text(api,'bi'+(i+1)+'Red'),blue:text(api,'bi'+(i+1)+'Blue')}));
    const details = ['Only stock Power Functions IR addressing is modeled: one channel setting applies to both red and blue outputs of each receiver. It is not Powered Up BLE pairing or a clone 2.4 GHz system.'];
    if (system !== 'pf') return result('warn','Different control system','PF IR addressing does not cover this declaration','Identify the actual protocol before using this map.',details,boundary);
    if (receivers.some(row=>row.channel==='unknown')) return result('warn','Channel unverified','Complete receiver channel settings','Unknown receiver channels cannot establish collision-free addressing.',details,boundary);
    if (receivers.some(row=>row.channel==='0' && (row.red || row.blue))) return result('bad','Inactive row conflict','An inactive receiver still has a control group','Clear its red/blue group labels or select the receiver channel.',details,boundary);
    const active=receivers.filter(row=>row.channel!=='0' && (row.red || row.blue));
    if (!active.length) return result('info','No control demand','Enter a receiver output group','Blank output groups are unused. An empty plan is not a working-control verdict.',details,boundary);
    const map = new Map(), groupAddresses = new Map();
    for (const receiver of active) for (const color of ['red','blue']) if (receiver[color]) {
      const address=receiver.channel+' / '+color, group=receiver[color], key=group.toLocaleLowerCase('en-US');
      if (!map.has(address)) map.set(address,[]);
      map.get(address).push({receiver:receiver.label,group,key});
      if (!groupAddresses.has(key)) groupAddresses.set(key,{label:group,addresses:new Set()});
      groupAddresses.get(key).addresses.add(address);
    }
    let collisions=0, shared=0;
    const rows=[];
    for (let channel=1;channel<=4;channel++) for (const color of ['red','blue']) {
      const address=channel+' / '+color, entries=map.get(address)||[], groups=new Set(entries.map(row=>row.key));
      const state=groups.size>1?'Unintended group collision':entries.length>1?'Intentional command broadcast':entries.length?'One declared group':'Unused';
      if (groups.size>1) collisions++; else if (entries.length>1) shared++;
      rows.push([String(channel),color,entries.map(row=>row.receiver+': '+row.group).join('; ')||'—',state]);
    }
    details.push({html:api.table(['Channel','Output','Receiver / intended group','Address result'],rows)});
    for (const group of groupAddresses.values()) if(group.addresses.size>1) details.push(group.label+' spans '+group.addresses.size+' addresses and needs separate commands; the label does not link those addresses automatically.');
    details.push('A handset selects one channel at a time. Eight addresses do not mean one handset independently manipulates eight outputs simultaneously. More receivers may share addresses intentionally.');
    details.push('Identical group names are matched ignoring case and surrounding spaces. Intentional broadcast is a command relationship, not proof of equal motor speed or mechanical synchronization.');
    if (collisions) return result('bad','Broadcast conflict','Different jobs share a PF IR address',collisions+' channel/output address'+(collisions===1?' has':'es have')+' more than one intended group. Change the declared assignment before treating these as independent controls.',details,boundary);
    return result('ok','Logical address map','No unintended group collision is declared',active.length+' receivers use '+map.size+' of 8 channel/output addresses; '+shared+' addresses intentionally broadcast to matching groups. Verify the real receiver settings separately.',details,boundary);
  }

  function brickControl(api) {
    const hub=api.enum('bcHub',['pf','city','technic','prime','other','unknown']);
    const goal=api.enum('bcGoal',['remote','app','onboard','unknown']);
    const controller=api.enum('bcController',['pfir','puremote','phone','none','other','unknown']);
    const runtime=api.enum('bcRuntime',['stock','pybricks','other','unknown']);
    const receiver=api.enum('bcReceiver',['yes','no','unknown']);
    const device=api.enum('bcDevice',['yes','no','unknown']);
    const program=api.enum('bcProgram',['yes','no','unknown']);
    const chain={pf:'Power Functions receiver / outputs',city:'City Hub 88009',technic:'Technic Hub 88012',prime:'SPIKE Large Hub 45601',other:'Other exact hub',unknown:'Unverified hub'}[hub];
    const details=[{html:api.table(['Layer','Entered route'],[['Control goal',{remote:'Physical remote',app:'Phone / tablet app',onboard:'Program running on the hub',unknown:'Unverified'}[goal]],['Controller',{pfir:'Power Functions IR remote',puremote:'Powered Up Remote 88010',phone:'Phone / tablet',none:'No external controller',other:'Other controller',unknown:'Unverified'}[controller]],['Receiving hardware',chain],['Runtime',{stock:'Original / stock software',pybricks:'Already-installed Pybricks',other:'Other documented runtime',unknown:'Unverified'}[runtime]]])},
      'This is the human-controller-to-hub path, not the separate motor/sensor-to-hub connection. Nothing on this page pairs Bluetooth devices, controls motors or installs firmware.'];
    if ([hub,goal,controller,runtime].includes('unknown')) return result('warn','Identify control route','Controller or runtime is still unverified','Identify the exact hub, controller, desired job and runtime before treating a route as available.',details,boundary);
    if (hub==='other' || controller==='other' || runtime==='other') return result('warn','Exact implementation','This route needs its exact documentation','A third-party bridge or runtime may add functions, but its exact supported hub/controller and required program are outside the finite profiles here.',details,boundary);
    if (goal==='remote') {
      if (controller==='pfir' && hub==='pf' && runtime==='stock') {
        if(receiver!=='yes') return result(receiver==='no'?'bad':'warn','Receiver required','Complete the PF IR receiving path','A PF IR handset needs the matching IR receiver and declared same-channel settings. A battery box alone is not that receiver.',details,boundary);
        details.push('Route: PF IR handset → same-channel PF IR receiver → chosen red/blue output. Use the IR address planner for multiple independent groups.');
        return result('ok','Documented route class','PF IR control chain is declared complete','The receiver is declared present. This does not verify reception, battery condition, motor load or range.',details,boundary);
      }
      if (controller==='pfir' && hub!=='pf') return result('bad','Control technology conflict','A PF IR handset is not a direct BLE controller','A matching motor connection cannot translate infrared commands to a Powered Up hub.',details,boundary);
      if (controller==='puremote' && hub==='pf') return result('bad','Control technology conflict','A Powered Up remote is not a PF IR transmitter','A documented external bridge would be a separate implementation, not this direct stock route.',details,boundary);
      if (controller==='puremote' && hub==='city' && runtime==='stock') return result('ok','Documented route class','City Hub and Powered Up remote have a stock route','Route: Remote 88010 → documented Bluetooth pairing → City Hub 88009. Motor behavior and multi-hub selection remain exact-function questions.',details,boundary);
      if (controller==='puremote' && ['city','technic','prime'].includes(hub) && runtime==='pybricks') {
        if(program!=='yes') return result('warn','Program required','Installed firmware is not a complete control program','The documented Pybricks remote capability also needs a suitable loaded/running program for the intended control. No installation or program execution is performed here.',details,boundary);
        return result('info','Documented custom route','Declared Pybricks remote program supplies the route','Route: Powered Up remote → supported Pybricks hub/runtime → declared control program → assigned motor ports. Confirm the exact installed version and program.',details,boundary);
      }
      return result('warn','Verify remote function','This stock remote route is not established here','Do not apply a Pybricks support table to original hub software, or assume every Bluetooth hub accepts Remote 88010 directly.',details,boundary);
    }
    if (goal==='app') {
      if(controller!=='phone') return result('bad','Controller role conflict','The app route needs its phone or tablet','A physical remote declaration is not a phone-app connection.',details,boundary);
      if(hub==='pf') return result('warn','Bridge not modeled','Stock Power Functions is not a direct BLE app endpoint','A phone-to-IR or third-party receiving bridge needs its own exact documented implementation.',details,boundary);
      if(runtime==='pybricks') return result('warn','Different runtime','Do not assume the original app controls Pybricks firmware','Use the exact documented browser/program/control path for the already-installed runtime; no firmware change is advised here.',details,boundary);
      if(device!=='yes') return result(device==='no'?'bad':'warn','Check current app device','App-device support is unresolved','Use the current official device guide and the app for this exact hub. A generic Bluetooth logo alone is not sufficient.',details,boundary);
      const app=hub==='prime'?'SPIKE App':hub==='technic'?'CONTROL+ or an appropriate Powered Up program':'Powered Up app';
      return result('info','Documented app class','The stock app connection class is identified','Route: declared supported phone/tablet → '+app+' → '+chain+'. Exact app version, component functions and profile still need confirmation.',details,boundary);
    }
    if(controller!=='none') return result('bad','Goal / controller conflict','Choose an on-hub program path explicitly','For this worksheet, an onboard program runs without an external controller; remote/app operation is a different goal.',details,boundary);
    if(hub==='pf') return result('bad','No programmable hub','A stock PF receiver is not an onboard program host','A third-party controller would be a separate documented system.',details,boundary);
    if(program!=='yes') return result('warn','Program unverified','A suitable on-hub program is not established','Hardware presence or a previously installed runtime does not show that the required program is loaded and usable.',details,boundary);
    if(runtime==='pybricks' || (runtime==='stock' && hub==='prime')) return result('info','Declared program route','The declared program supplies the on-hub path','Confirm the exact installed runtime, program and assigned ports. This does not inspect storage or start the robot.',details,boundary);
    return result('warn','Verify runtime capability','This stock profile does not establish an onboard route','Do not infer autonomous program execution from the presence of a hub or Bluetooth alone.',details,boundary);
  }

  window.CCLLab.mount({workbench:'brick-connections',calculators:{brickroute:brickRoute,brickports:brickPorts,brickir:brickIR,brickcontrol:brickControl}});
})();
