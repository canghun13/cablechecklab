// Run with Node.js. Executes the shipped controllers, not duplicate decision logic.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const routes = { audiosignal: 'audio-signal-path-checker', headsetadapter: 'headset-adapter-selector', micpower: 'microphone-power-preflight', audionoise: 'audio-hum-isolator' };
let states = 0;
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
function fixture(id) {
  const html = fs.readFileSync(path.join(root, 'tools', routes[id], 'index.html'), 'utf8');
  const fields = {}, defaults = {}, handlers = {}, events = [], timers = [];
  for (const match of html.matchAll(/<select id="([^"]+)"[^>]*>(.*?)<\/select>/gs)) {
    const options = [...match[2].matchAll(/<option value="([^"]+)"([^>]*)>(.*?)<\/option>/gs)].map(m => ({ value: m[1], textContent: decode(m[3]), selected: /selected/.test(m[2]) }));
    const value = (options.find(o => o.selected) || options[0]).value;
    fields[match[1]] = { value, options, type: 'select-one' }; defaults[match[1]] = value;
  }
  for (const match of html.matchAll(/<input id="([^"]+)"[^>]*type="checkbox"([^>]*)>/gs)) {
    fields[match[1]] = { type: 'checkbox', checked: /checked/.test(match[2]) }; defaults[match[1]] = fields[match[1]].checked;
  }
  const form = { elements: fields, addEventListener: (n, fn) => { handlers[n] = fn; } };
  const selectors = {};
  for (const name of ['result', 'status', 'headline', 'summary', 'details', 'evidence']) {
    selectors['[data-' + name + ']'] = { _text: '', innerHTML: '', setAttribute() {}, get textContent() { return this._text + decode(this.innerHTML.replace(/<[^>]*>/g, '')); }, set textContent(s) { this._text = s; }, querySelectorAll() { return [...this.innerHTML.matchAll(/<li>(.*?)<\/li>/gs)].map(m => ({ textContent: decode(m[1]) })); }, classList: { contains: n => selectors['[data-status]'].className?.split(' ').includes(n) } };
  }
  let copied = '', printCalls = 0;
  for (const name of ['copy', 'print']) selectors['[data-' + name + ']'] = { addEventListener(n, fn) { handlers[name] = fn; }, textContent: '' };
  const tool = { dataset: { tool: id }, querySelector: s => s === 'form' ? form : selectors[s], querySelectorAll: () => [{ getAttribute: () => '/tools/analog-audio/' }] };
  vm.runInNewContext(source, {
    document: { querySelector: s => s === '[data-tool]' ? tool : null },
    window: { location: { pathname: '/tools/' + routes[id] + '/' }, gtag: (...args) => events.push(args), print: () => printCalls++ },
    FormData: class { get(n) { return fields[n]?.value ?? null; } },
    navigator: { clipboard: { writeText: async s => { copied = s; } } },
    setTimeout: fn => timers.push(fn)
  });
  return {
    fields, defaults, events,
    set(values) { for (const [n, v] of Object.entries(values)) { if (fields[n].type === 'checkbox') fields[n].checked = v; else fields[n].value = v; } handlers.change(); return this.result(); },
    result() { states++; const text = ['status','headline','summary','details','evidence'].map(n => selectors['[data-' + n + ']'].textContent).join('\n'); assert(!/NaN|Infinity|undefined/.test(text)); assert(!/<script>/.test(selectors['[data-details]'].innerHTML)); assert.match(text, /Input record/); assert.match(text, /https:\/\/cablechecklab.com\/tools\//); return text; },
    reset() { for (const [n,v] of Object.entries(defaults)) { if (fields[n].type === 'checkbox') fields[n].checked=v; else fields[n].value=v; } handlers.reset(); while(timers.length) timers.shift()(); },
    async actions() { handlers.submit({ preventDefault() {} }); await handlers.copy({ currentTarget: selectors['[data-copy]'] }); handlers.print(); assert.equal(printCalls,1); assert.match(copied,/Input record/); assert.match(copied,/Confidence boundary/); assert.match(copied,/https:\/\/cablechecklab.com/); for(const [,name,payload] of events) { assert(['tool_run','tool_result','copy_result','print_result','reset_tool'].includes(name)); assert.equal(payload.workbench,'analog-audio'); assert(Object.keys(payload).every(k=>['tool_id','workbench','source_context','result_state'].includes(k))); } return copied; }
  };
}
(async () => {
  const a = fixture('audiosignal');
  assert.match(a.result(), /Stereo is not balanced mono/);
  assert.match(a.set({asInput:'pair',asCable:'breakout',asEvidence:'yes'}), /Declared role fit/);
  assert.match(a.set({asEvidence:'unknown'}), /Levels and wiring unverified/);
  assert.match(a.set({asOutput:'speaker'}), /Speaker power is not line level/);
  assert.match(a.set({asOutput:'insert'}), /Insert send\/return is not stereo/);
  assert.match(a.set({asOutput:'digital'}), /Digital audio needs a conversion stage/);
  assert.match(a.set({asOutput:'balanced',asInput:'stereo',asCable:'direct'}), /Balanced mono is not stereo/);
  assert.match(a.set({asOutput:'unknown'}), /Roles unverified/);
  a.reset(); await a.actions();
  const h = fixture('headsetadapter');
  assert.match(h.result(), /Wrong splitter function/);
  assert.match(h.set({hsAdapter:'split'}), /Wiring unverified/);
  assert.match(h.set({hsWiring:'ctia',hsTarget:'ctia'}), /TRRS headset to separate PC jacks/);
  assert.match(h.set({hsTarget:'omtp'}), /CTIA\/OMTP conversion required/);
  assert.match(h.set({hsPlug:'dual',hsPort:'combo',hsTarget:'ctia',hsAdapter:'combine'}), /Separate headset plugs to one combo jack/);
  assert.match(h.set({hsPort:'headphones'}), /Microphone path missing/);
  assert.match(h.set({hsMic:false}), /Playback-only goal/);
  h.reset(); await h.actions();
  const m=fixture('micpower');
  assert.match(m.result(), /Power path not established/);
  assert.match(m.set({mpPath:'converter'}), /Converter unverified/);
  assert.match(m.set({mpConfirmed:true}), /Declared converter route/);
  assert.match(m.set({mpNeed:'p48',mpSupply:'p48',mpPath:'direct'}), /Declared power fit/);
  assert.match(m.set({mpConfirmed:false}), /Electrical details unverified/);
  assert.match(m.set({mpNeed:'none'}), /Keep unneeded supply off/);
  assert.match(m.set({mpSupply:'off'}), /No external power selected/);
  assert.match(m.set({mpNeed:'unknown'}), /Power unverified/);
  m.reset(); await m.actions();
  const n=fixture('audionoise');
  assert.match(n.result(), /Establish one clean baseline/);
  assert.match(n.set({anBattery:'quiet'}), /Laptop power-path sensitivity/);
  assert.match(n.set({anBranch:'quiet'}), /removed signal branch matters/);
  assert.match(n.set({anCable:'fixes'}), /Original signal cable or contact first/);
  assert.match(n.set({anBare:'persists'}), /Speaker\/output baseline first/);
  assert.match(n.result(), /Never remove protective earth/);
  n.reset(); await n.actions();
  for (const id of Object.keys(routes)) {
    const f=fixture(id), entries=Object.entries(f.fields);
    function walk(index, values) { if(index===entries.length) { const result=f.set(values); assert(!/Check input/.test(result)); return; } const [name,field]=entries[index]; for(const v of field.type==='checkbox'?[false,true]:field.options.map(o=>o.value)) walk(index+1,{...values,[name]:v}); }
    walk(0,{});
    f.reset();
    for(const [name,field] of entries.filter(([,field])=>field.type!=='checkbox')) {
      for(const invalid of ['', 'unlisted', '<script>']) { assert.match(f.set({[name]:invalid}),/Check input/); }
      f.set({[name]:f.defaults[name]});
    }
    f.reset(); assert.match(await f.actions(),/Input record/);
  }
  // Workbench transition uses the same coarse event schema.
  const calls=[], listeners=[];
  vm.runInNewContext(source,{ document:{querySelector:()=>null,querySelectorAll:()=>[{getAttribute:()=>'/tools/audio-signal-path-checker/',addEventListener:(n,fn)=>listeners.push(fn)}]},window:{location:{pathname:'/tools/analog-audio/'},gtag:(...a)=>calls.push(a)} });
  listeners[0](); assert.equal(calls[0][1],'workbench_to_tool_click'); assert.equal(calls[0][2].workbench,'analog-audio');
  console.log('PASS: '+states+' audio result states; all enum combinations, invalid/missing fields, independent branches, Reset, Copy including safety/input/URL, Print invocation, coarse event privacy and workbench transitions');
})().catch(e=>{console.error(e);process.exitCode=1;});
