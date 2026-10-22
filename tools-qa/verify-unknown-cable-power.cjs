// Run with Node.js. Exercises the real controller with a minimal DOM fixture.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');

function fixture(type, route, values) {
  let copied = '', printed = 0;
  const handlers = {}, fields = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { value: String(v), checked: false }]));
  const form = { elements: fields, addEventListener: (name, fn) => { handlers[name] = fn; } };
  const selectors = {};
  for (const name of ['result', 'status', 'headline', 'summary', 'details', 'evidence']) selectors['[data-' + name + ']'] = { textContent: '', innerHTML: '', setAttribute() {} };
  selectors['[data-status]'].classList = { contains: name => (selectors['[data-status]'].className || '').split(' ').includes(name) };
  selectors['[data-details]'].querySelectorAll = () => [...selectors['[data-details]'].innerHTML.matchAll(/<li>(.*?)<\/li>/g)].map(m => ({ textContent: m[1].replace(/<wbr>/g, '') }));
  for (const action of ['copy', 'print']) selectors['[data-' + action + ']'] = { textContent: '', innerHTML: '', addEventListener: (name, fn) => { handlers[action] = fn; } };
  const tool = { dataset: { tool: type }, querySelector: sel => sel === 'form' ? form : selectors[sel] || null, querySelectorAll: () => [] };
  vm.runInNewContext(source, {
    document: { querySelector: sel => sel === '[data-tool]' ? tool : null },
    window: { location: { pathname: '/tools/' + route + '/' }, print() { printed++; } },
    navigator: { clipboard: { async writeText(text) { copied = text; } } },
    FormData: class { get(name) { return fields[name]?.value ?? null; } },
    setTimeout
  });
  return {
    set(name, value) { if (!fields[name]) fields[name] = {}; fields[name].value = String(value); handlers.change(); },
    check(name, checked) { if (!fields[name]) fields[name] = {}; fields[name].checked = checked; handlers.change(); },
    result() { const text = Object.values(selectors).map(el => el.textContent + el.innerHTML).join('\n'); assert(!/NaN|Infinity/.test(text)); return text; },
    headline() { return selectors['[data-headline]'].textContent; },
    async copy() { await handlers.copy({ currentTarget: {} }); return copied; },
    print() { handlers.print(); return printed; }
  };
}

const decoderHtml = fs.readFileSync(path.join(root, 'tools/cable-decoder/index.html'), 'utf8');
const chargeHtml = fs.readFileSync(path.join(root, 'tools/charge-check/index.html'), 'utf8');
for (const html of [decoderHtml, chargeHtml]) {
  assert(html.includes('<option value="0">Not stated / unknown</option>'));
  assert(!html.includes('screen as 15 W'));
}
const decoder = fixture('cable', 'cable-decoder', { power: 60, data: 0, length: 1, connector: 'c-c' });
assert.match(decoder.headline(), /60 W/);
decoder.set('power', 0); assert.match(decoder.headline(), /Power unverified/); assert.match(decoder.result(), /no wattage ceiling can be inferred/);
decoder.check('marked', true); assert(!/Declared fit/i.test(decoder.result()));
for (const invalid of ['', '-1', 'Infinity']) { decoder.set('power', invalid); assert.match(decoder.result(), /Check input/); }
decoder.set('power', 60); decoder.check('marked', true); decoder.set('data', 0);
assert.match(decoder.headline(), /Data unverified/);
assert.match(decoder.result(), /no transfer-rate ceiling/);
assert.match(decoder.result(), /Input record: USB-C to USB-C cable; power 60 W; data Data unverified; length 1 m; relevant evidence confirmed; display video intended no/);
assert.match(decoder.result(), /https:\/\/cablechecklab.com\/<wbr>tools\/<wbr>cable-decoder\//);
assert(!/Declared fit/.test(decoder.result()));
decoder.check('video', true); assert.match(decoder.result(), /Alt Mode cable support is unverified/);
decoder.set('data', .48); assert.match(decoder.result(), /480 Mbps/); assert.match(decoder.result(), /USB 2.0-only/);
decoder.check('video', false); assert.match(decoder.result(), /Declared fit/);
decoder.set('data', 5); decoder.check('video', true); assert.match(decoder.result(), /plausible DisplayPort/);
for (const invalid of ['', '-1', 'Infinity', '.25']) { decoder.set('data', invalid); assert.match(decoder.result(), /Check input/); }
decoder.set('data', 0); decoder.set('connector', 'a-c'); assert.match(decoder.result(), /not a confirmed USB 2.0/);
decoder.set('connector', 'c-c'); decoder.check('video', false); decoder.check('marked', false);
decoder.set('power', 0);
for (const invalid of ['', '0', '-1', 'Infinity']) { decoder.set('length', invalid); assert.match(decoder.result(), /Check input/); }
decoder.set('length', 1); decoder.set('power', 240); decoder.check('marked', false); assert.match(decoder.result(), /5 A electronically marked/);
decoder.set('connector', 'a-c'); decoder.set('data', 40); assert.match(decoder.result(), /not plausible/);

const charge = fixture('charge', 'charge-check', { deviceW: 100, chargerW: 100, cableW: 100, scenario: 'single' });
assert.match(charge.headline(), /100 W electrical ceiling/);
charge.set('cableW', 0); assert.equal(charge.headline(), 'Charging ceiling unverified');
assert(!/Declared electrical fit/.test(charge.result()));
charge.set('chargerW', 50); assert.match(charge.result(), /charger port alone is below/);
charge.set('deviceW', 140); assert.match(charge.result(), /EPR/);
charge.check('ppsNeeded', true); assert.match(charge.result(), /PPS range is still unconfirmed/);
charge.set('scenario', 'multi'); assert.match(charge.result(), /occupied-port combination/);
charge.set('scenario', 'dock'); assert.match(charge.result(), /monitor PD output/);
for (const field of ['deviceW', 'chargerW']) {
  for (const invalid of ['', '0', '-1', 'Infinity']) { charge.set(field, invalid); assert.match(charge.result(), /Check input/); }
  charge.set(field, 100);
}
for (const invalid of ['', '-1', 'Infinity']) { charge.set('cableW', invalid); assert.match(charge.result(), /Check input/); }
charge.set('cableW', 60); assert.match(charge.headline(), /60 W electrical ceiling/);
console.log('PASS: unknown cable power/data ratings stay unverified; documented USB 2.0, active claims, video and unknowns remain distinct; known ratings, missing/nonfinite values, EPR, PPS, port limits and path notes regressions');
const outputFixture = fixture('cable', 'cable-decoder', { power: 60, data: 0, length: 1, connector: 'c-c' });
(async () => {
  const copied = await outputFixture.copy();
  assert.match(copied, /Data unverified/); assert.match(copied, /Input record:.*length 1 m/); assert.match(copied, /https:\/\/cablechecklab.com\/tools\/cable-decoder\//);
  assert.equal(outputFixture.print(), 1);
  outputFixture.set('length', ''); assert.match(outputFixture.result(), /Check input/); assert.equal(outputFixture.print(), 2); assert(!/Declared fit/.test(outputFixture.result()));
  console.log('PASS: shipped Copy handler receives unknown/input/unit/URL text; Print invokes window.print without promoting invalid input to fit');
})().catch(error => { console.error(error); process.exitCode = 1; });
