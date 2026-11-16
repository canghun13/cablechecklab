// Execute the shipped PPS controller; no dependency installation or browser emulation.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'tools/pps-range-checker/index.html'),'utf8');
const fields={},defaults={},handlers={},selectors={},timers=[],events=[];let copied='',printed=0,states=0;
for(const m of html.matchAll(/<input id="([^"]+)"[^>]*type="number"[^>]*value="([^"]+)"[^>]*>/g))fields[m[1]]={value:m[2]},defaults[m[1]]=m[2];
assert.equal(Object.keys(fields).length,6);
for(const n of ['result','status','headline','summary','details','evidence'])selectors['[data-'+n+']']={textContent:'',innerHTML:'',setAttribute(){},classList:{contains:k=>selectors['[data-status]'].className?.split(' ').includes(k)},querySelectorAll:()=>[...selectors['[data-details]'].innerHTML.matchAll(/<li>(.*?)<\/li>/g)].map(m=>({textContent:m[1]}))};
for(const n of ['copy','print'])selectors['[data-'+n+']']={textContent:'',addEventListener:(e,f)=>handlers[n]=f};
const form={elements:fields,addEventListener:(n,f)=>handlers[n]=f},tool={dataset:{tool:'pps'},querySelector:s=>s==='form'?form:selectors[s],querySelectorAll:()=>[]};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),{document:{querySelector:s=>s==='[data-tool]'?tool:null},window:{location:{pathname:'/tools/pps-range-checker/'},gtag:(...a)=>events.push(a),print:()=>printed++},FormData:class{get(n){return fields[n]?.value??null}},navigator:{clipboard:{writeText:async t=>copied=t}},setTimeout:f=>timers.push(f)});
function run(v={}){Object.entries(v).forEach(([k,v])=>fields[k].value=String(v));handlers.change();states++;const text=['status','headline','summary'].map(n=>selectors['[data-'+n+']'].textContent).join('\n')+selectors['[data-details]'].innerHTML;assert(!/NaN|Infinity|undefined|<script>/.test(text));return text;}
function reset(){Object.entries(defaults).forEach(([k,v])=>fields[k].value=v);handlers.reset();while(timers.length)timers.shift()();}
(async()=>{
assert.match(run(),/Range match/);
assert.match(run({maxW:30}),/Range match/);assert.match(run({deviceV:11}),/Range mismatch/);assert.match(run(),/power exceeds/);
for(const v of [3.3,9,10,11,11.01,21,21.01])for(const a of [.01,2.99,3,3.01,5])for(const ceiling of [1,27,30,33,105]){
 const r=run({deviceV:v,deviceA:a,minV:3.3,maxV:11,maxA:3,maxW:ceiling});
 if(v>21)assert.match(r,/Check input/);else assert.match(r,v>=3.3&&v<=11&&a<=3&&v*a<=ceiling?/Range match/:/Range mismatch/);
}
for(const k of Object.keys(fields))for(const bad of ['',0,-1,'NaN','Infinity','<script>']){reset();assert.match(run({[k]:bad}),/Check input/);}
reset();assert.match(run({minV:12}),/Check input/);reset();assert.match(run({maxV:22}),/Check input/);
reset();handlers.submit({preventDefault(){}});await handlers.copy({currentTarget:selectors['[data-copy]']});assert.match(copied,/Range match/);assert.match(copied,/27 W/);handlers.print();assert.equal(printed,1);
reset();for(const[k,v]of Object.entries(defaults))assert.equal(fields[k].value,v);
for(const name of ['tool_run','tool_result','copy_result','print_result','reset_tool'])assert(events.some(e=>e[1]===name));
assert.match(html,/Which PPS numbers should I enter\?/);assert.match(html,/required documented ceiling/);assert(!html.includes('watts, if declared'));
assert.match(fs.readFileSync(path.join(root,'assets/styles.css'),'utf8'),/@media print/);
console.log('PASS: '+states+' PPS states; documented 30W example, voltage/current/power limits, invalid inputs, Reset, shipped Copy/Print, named event emission and help contract. Fixture-only Print, not physical charging or saved PDF.');
})();
