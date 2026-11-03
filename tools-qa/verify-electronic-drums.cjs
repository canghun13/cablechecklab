// No dependency installation: execute shipped controllers against HTML-derived fields.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const routes={drumtrigger:'drum-trigger-preflight',drumallocation:'drum-input-allocation-planner',hihatroute:'hi-hat-control-route-planner',drumfault:'drum-trigger-fault-isolator'};
const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');let states=0;
function fixture(id){
 const html=fs.readFileSync(path.join(root,'tools',routes[id],'index.html'),'utf8'),fields={},defaults={},handlers={},events=[],timers=[];
 const label=name=>decode(html.match(new RegExp('<label for="'+name+'">(.*?)</label>'))[1]);
 for(const m of html.matchAll(/<select id="([^"]+)"[^>]*>(.*?)<\/select>/gs)){const options=[...m[2].matchAll(/<option value="([^"]+)"([^>]*)>(.*?)<\/option>/gs)].map(o=>({value:o[1],textContent:decode(o[3]),selected:/selected/.test(o[2])}));const val=(options.find(o=>o.selected)||options[0]).value;fields[m[1]]={name:m[1],tagName:'SELECT',type:'select-one',value:val,options,labels:[{textContent:label(m[1])}]};defaults[m[1]]=val;}
 for(const m of html.matchAll(/<input id="([^"]+)"[^>]*type="number"[^>]*value="([^"]+)"[^>]*>/gs)){fields[m[1]]={name:m[1],tagName:'INPUT',type:'number',value:m[2],dataset:{unit:m[0].match(/data-unit="([^"]+)"/)?.[1]||''},labels:[{textContent:label(m[1])}]};defaults[m[1]]=m[2];}
 const form={elements:Object.assign(Object.values(fields),fields),addEventListener:(n,fn)=>{handlers[n]=fn;}},selectors={};
 for(const n of ['result','status','headline','summary','details','evidence'])selectors['[data-'+n+']']={_text:'',innerHTML:'',setAttribute(){},get textContent(){return this._text+decode(this.innerHTML.replace(/<[^>]*>/g,''));},set textContent(s){this._text=s;},querySelectorAll(){return [...this.innerHTML.matchAll(/<li>(.*?)<\/li>/gs)].map(m=>({textContent:decode(m[1].replace(/<[^>]*>/g,''))}));},classList:{contains:n=>selectors['[data-status]'].className?.split(' ').includes(n)}};
 let copied='',printed=0;for(const n of ['copy','print'])selectors['[data-'+n+']']={textContent:'',addEventListener:(e,fn)=>{handlers[n]=fn;}};
 const tool={dataset:{tool:id},querySelector:s=>s==='form'?form:selectors[s],querySelectorAll:()=>[{getAttribute:()=>'/tools/electronic-drums/'}]};
 vm.runInNewContext(source,{document:{querySelector:s=>s==='[data-tool]'?tool:null},window:{location:{pathname:'/tools/'+routes[id]+'/'},gtag:(...a)=>events.push(a),print:()=>printed++},FormData:class{get(n){return fields[n]?.value??null;}},navigator:{clipboard:{writeText:async s=>{copied=s;}}},setTimeout:fn=>timers.push(fn)});
 return {fields,defaults,events,set(values){for(const[n,v]of Object.entries(values))fields[n].value=String(v);handlers.change();return this.result();},result(){states++;const text=['status','headline','summary','details','evidence'].map(n=>selectors['[data-'+n+']'].textContent).join('\n');assert(!/NaN|Infinity|undefined/.test(text),text);assert(!/<script>/.test(selectors['[data-details]'].innerHTML));assert.match(text,/Input record/);assert.match(text,new RegExp('https://cablechecklab.com/tools/'+routes[id]+'/'));return text;},kind(){return selectors['[data-status]'].className;},reset(){for(const[n,v]of Object.entries(defaults))fields[n].value=v;handlers.reset();while(timers.length)timers.shift()();},async actions(){handlers.submit({preventDefault(){}});await handlers.copy({currentTarget:selectors['[data-copy]']});handlers.print();assert.equal(printed,1);assert.match(copied,/Input record/);assert.match(copied,/Confidence boundary/);assert.match(copied,/https:\/\/cablechecklab.com\/tools\//);for(const[,name,p]of events){assert(['tool_run','tool_result','copy_result','print_result','reset_tool'].includes(name));assert.equal(p.workbench,'electronic-drums');assert(Object.keys(p).every(k=>['tool_id','workbench','source_context','result_state'].includes(k)));}return copied;}};
}
function enumWalk(f,names,fn){function step(i,v){if(i===names.length){const r=f.set(v);assert(!/Check input/.test(r));fn?.(v,r);return;}const n=names[i];for(const o of f.fields[n].options)step(i+1,{...v,[n]:o.value});}step(0,{});}

(async()=>{
 const t=fixture('drumtrigger');assert.match(t.result(),/unverified/);
 assert.match(t.set({dtPad:'switch',dtMode:'switch',dtZones:'2',dtCapacity:'2',dtLead:'approved',dtEvidence:'yes'}),/requirements align/);
 assert.match(t.set({dtCapacity:'1'}),/Declared conflict/);t.reset();
 enumWalk(t,Object.keys(t.fields),v=>{
   if(t.kind().includes('ok'))assert(v.dtEvidence==='yes'&&v.dtLead==='approved'&&Number(v.dtCapacity)>=Number(v.dtZones)&&!['unknown'].includes(v.dtPad)&&v.dtMode!=='unknown'&&(v.dtFeature==='zones'||v.dtFeatureSupport==='yes'));
 });
 const h=fixture('hihatroute');assert.match(h.result(),/conditional/);
 assert.match(h.set({hhController:'continuous',hhPort:'continuous',hhLead:'separate',hhEvidence:'yes'}),/Both information paths/);
 assert.match(h.set({hhPort:'switch'}),/Control-route conflict/);
 h.reset();enumWalk(h,Object.keys(h.fields),v=>{if(h.kind().includes('ok'))assert(v.hhEvidence==='yes'&&!Object.values(v).includes('unknown')&&v.hhLead!=='audioy');});
 const f=fixture('drumfault');assert.match(f.result(),/baseline/);
 assert.match(f.set({dfBaseline:'yes',dfActivity:'yes',dfAudio:'no'}),/Output layer/);
 assert.match(f.set({dfCollision:'yes'}),/shared input assignment/);
 f.reset();enumWalk(f,Object.keys(f.fields),()=>assert(!f.kind().includes('ok')));
 const a=fixture('drumallocation');assert.match(a.result(),/Conditional budget/);
 assert.match(a.set({daPool:'yes',daSplitProof:'yes'}),/Documented pool budget fits/);
 assert.match(a.set({daDual:3}),/Pad shortfall/);a.reset();
 assert.match(a.set({daTotal:0,daReserved:0,daEligible:0,daDual:0,daSingle:0}),/No demand/);
 assert.match(a.set({daTotal:2,daEligible:2,daDual:0,daSingle:2,daPool:'yes',daSplitProof:'no'}),/Documented pool budget fits/);
 assert.match(a.set({daSingle:3}),/Unsupported pool/);a.reset();
 // Independent resource DP: each group can host empty, one dual, one single,
 // or two singles only when eligible. No use of the controller formula.
 let oraclePlans=0;
 for(let available=0;available<=32;available++)for(let eligible=0;eligible<=available;eligible++){
  let reachable=new Set(['0,0']);
  for(let i=0;i<available;i++){const next=new Set();for(const item of reachable){const[d,s]=item.split(',').map(Number);next.add(item);next.add((d+1)+','+s);next.add(d+','+(s+1));if(i<eligible)next.add(d+','+(s+2));}reachable=next;}
  for(let dual=0;dual<=available;dual++)for(let single=0;single<=64;single++){
   // Exercise every capacity boundary and all feasible demands up to 8 groups;
   // larger pools use every dual-count and first/last feasible + first infeasible single demand.
   const feasible=reachable.has(dual+','+single);
   if(available>8 && single>0 && reachable.has(dual+','+(single-1))===feasible && reachable.has(dual+','+(single+1))===feasible)continue;
   const r=a.set({daTotal:available+0,daReserved:0,daEligible:eligible,daDual:dual,daSingle:single,daPool:'yes',daSplitProof:'yes'});
   oraclePlans++;
   assert.equal(a.kind().includes('ok'),feasible&&dual+single>0,'A='+available+' E='+eligible+' D='+dual+' S='+single+' '+r);
   if(a.kind().includes('ok')){
    const rows=[...r.matchAll(/Plan group (\d+): (Dual-zone pad \d+|Single pads \d+ \+ \d+ \(documented split\)|Single pad \d+|Unused)/g)];
    assert.equal(rows.length,available);
    assert.equal(rows.filter(m=>m[2].startsWith('Dual-zone')).length,dual);
    assert.equal(rows.reduce((n,m)=>n+(m[2].startsWith('Single pads')?2:m[2].startsWith('Single pad')?1:0),0),single);
    assert(rows.filter(m=>m[2].includes('(documented split)')).every(m=>Number(m[1])>available-eligible));
   }
  }
 }
 // Reserve accounting must match an equivalent retained pool.
 for(let reserve=0;reserve<=8;reserve++){const x=a.set({daTotal:8,daReserved:reserve,daEligible:0,daDual:0,daSingle:8-reserve,daPool:'yes',daSplitProof:'no'});assert.equal(a.kind().includes('ok'),reserve<8,x);}
 for(const id of Object.keys(routes)){
  const q=fixture(id);
  for(const[n,field]of Object.entries(q.fields)){
   for(const bad of field.tagName==='SELECT'?['','invalid','<script>','NaN']:['','-1','Infinity','NaN','<script>','1.5','1000'])assert.match(q.set({[n]:bad}),/Check input/);
   q.set({[n]:q.defaults[n]});
  }
  q.reset();const copied=await q.actions();for(const field of Object.values(q.fields))assert(copied.includes(field.labels[0].textContent));
  if(id==='drumallocation')assert.match(copied,/groups/);
  q.reset();for(const[n,v]of Object.entries(q.defaults))assert.equal(q.fields[n].value,v);
 }
 const calls=[],listeners=[];vm.runInNewContext(source,{document:{querySelector:()=>null,querySelectorAll:()=>[{getAttribute:()=>'/tools/drum-input-allocation-planner/',addEventListener:(n,fn)=>listeners.push(fn)}]},window:{location:{pathname:'/tools/electronic-drums/'},gtag:(...a)=>calls.push(a)}});listeners[0]();assert.equal(calls[0][1],'workbench_to_tool_click');assert.equal(calls[0][2].workbench,'electronic-drums');
 const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');assert.match(css,/@media print\s*\{[\s\S]*?\.site-header, \.site-footer, \.tool-panel, \.tool-actions, \.breadcrumbs \{ display: none !important;/);assert.match(css,/data-tool="drumfault"[\s\S]*?\.tool-notes \{ display: none !important;/);
 console.log('PASS: '+states+' shipped drum states; '+oraclePlans+' independent DP allocation cases, HTML enums, feature/control conflicts, observation precedence, invalid/empty/nonfinite, Reset, shipped Copy/Print, input units/URL/boundary, coarse events');
})().catch(e=>{console.error(e);process.exitCode=1;});
