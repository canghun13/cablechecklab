/* Shared only by the explicitly loaded brick/VR workflows. No hardware access. */
(() => {
  'use strict';
  const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const table = (headers,rows) => '<div class="lab-table"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+escape(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((x,i)=>'<td data-label="'+escape(headers[i])+'">'+escape(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  function mount({workbench,calculators}) {
    const main=document.querySelector('main[data-lab]');
    if(!main || !calculators[main.dataset.tool]) return;
    const form=main.querySelector('form'),status=main.querySelector('[data-status]'),headline=main.querySelector('[data-headline]'),summary=main.querySelector('[data-summary]'),details=main.querySelector('[data-details]'),boundary=main.querySelector('[data-evidence]');
    const path=window.location.pathname,toolId=path.split('/').filter(Boolean)[1],url='https://cablechecklab.com'+path;
    const emit=(name,source,kind)=>{if(typeof window.gtag==='function')window.gtag('event',name,{tool_id:toolId,workbench,source_context:source,...(kind?{result_state:kind}:{})});};
    const value=name=>String(new FormData(form).get(name)??'');
    const api={value,escape,table,
      number(name,min=0,max=64){const raw=value(name),n=Number(raw);if(!raw.trim()||!Number.isFinite(n)||!Number.isInteger(n)||n<min||n>max)throw Error('Enter a finite whole-number count within the labeled bounds.');return n;},
      enum(name,choices){const v=value(name);if(!choices.includes(v))throw Error('Choose a listed value for every required selection.');return v;}
    };
    let kind='info';
    function calculate() {
      let result;
      try {
        for(const f of Array.from(form.elements).filter(f=>f.name)){
          if(f.tagName==='SELECT'&&!Array.from(f.options).some(o=>o.value===f.value))throw Error('A selection is missing or altered. Restore a listed value.');
          if(f.type==='number')api.number(f.name,Number(f.min||0),Number(f.max||64));
          if(f.type==='text' && (f.value.length>48 || /[\u0000-\u001f]/.test(f.value)))throw Error('Use short printable labels (up to 48 characters).');
        }
        result=calculators[main.dataset.tool](api);
        if(!result || !['ok','warn','bad','info'].includes(result.kind))throw Error('No valid result could be produced.');
      } catch(error) {
        result={kind:'bad',label:'Check input',title:'Complete valid inputs first',summary:error.message,details:['No fit, allocation or diagnosis is established from missing or invalid values.'],boundary:'Input validation only. This browser has not detected or tested any connected hardware.'};
      }
      kind=result.kind;
      status.className='status '+kind;status.textContent=result.label;headline.textContent=result.title;summary.textContent=result.summary;
      const record=Array.from(form.elements).filter(f=>f.name).map(f=>{
        const label=f.labels?.[0]?.textContent||f.name;
        const selected=f.tagName==='SELECT'?Array.from(f.options).find(o=>o.value===f.value)?.textContent:f.type==='number'&&(!value(f.name).trim()||!Number.isFinite(Number(value(f.name))))?'Invalid / missing':value(f.name);
        return label+': '+(selected?.trim()?selected:f.type==='text'?'Blank / unused':'Not provided / invalid')+(f.dataset?.unit?' '+f.dataset.unit:'');
      }).join('; ');
      details.innerHTML=[...(result.details||[]).map(x=>typeof x==='string'?escape(x):x.html),escape('Input record — '+record),escape('Page: '+url)].map(x=>'<li>'+x+'</li>').join('');
      boundary.innerHTML='<strong>Confidence boundary</strong>'+escape(result.boundary);
      main.querySelector('[data-result]').setAttribute('aria-live','polite');
    }
    form.addEventListener('input',calculate);form.addEventListener('change',calculate);
    form.addEventListener('submit',e=>{e.preventDefault();calculate();emit('tool_run','explicit_submit');emit('tool_result','explicit_submit',kind);});
    form.addEventListener('reset',()=>{emit('reset_tool','tool_controls');setTimeout(calculate,0);});
    main.querySelector('[data-copy]')?.addEventListener('click',async e=>{
      const button=e.currentTarget;
      const text=[status.textContent,headline.textContent,summary.textContent,...Array.from(details.querySelectorAll('li')).map(li=>li.innerText||li.textContent),'Confidence boundary: '+boundary.textContent.replace(/^Confidence boundary/,'')].join('\n');
      try{await navigator.clipboard.writeText(text);emit('copy_result','result_panel',kind);button.textContent='Copied';setTimeout(()=>button.textContent='Copy result',1500);}catch{button.textContent='Copy unavailable';}
    });
    main.querySelector('[data-print]')?.addEventListener('click',()=>{emit('print_result','result_panel',kind);window.print();});
    calculate();
  }
  window.CCLLab={mount};
})();
