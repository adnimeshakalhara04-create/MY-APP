(()=>{
  const nativeFetch=window.fetch.bind(window);
  const DATA_BASE='https://raw.githubusercontent.com/adnimeshakalhara04-create/MY-APP/2a0714771c1d29dbd5a49b14ec60468e2ee06809';
  const CHUNKS=['unit06-1.json','unit06-2.json','unit06-3.json','unit06-4.json','unit06-5.json'];

  // Exact image-card IDs and 9-section grouping from the latest ET වැඩක් ලබාදීම Unit 05 app.
  const UNIT05_IMAGE_IDS=new Set([
    '05-012','05-013','05-014','05-015','05-016','05-017','05-018','05-019','05-020','05-021','05-022','05-023','05-024','05-025','05-026',
    '05-032','05-033','05-036','05-037','05-038','05-042','05-043','05-045','05-046','05-047','05-050','05-051','05-053','05-054','05-055','05-056','05-057',
    '05-059','05-060','05-062','05-064','05-070','05-071','05-075','05-081','05-084','05-085','05-089','05-092','05-093','05-094','05-107','05-109',
    '05-110','05-111','05-116','05-125'
  ]);

  function unit05Section(id){
    const n=Number(String(id).split('-')[1]);
    if(n<=26)return '5.1 චලිත';
    if(n<=38)return 'Cam';
    if(n<=47)return 'Rack & Pinion';
    if(n<=56)return 'Screw Thread';
    if(n<=60)return 'Slider Crank';
    if(n<=69)return 'Power Transmission';
    if(n<=93)return 'Belt Drives';
    if(n<=108)return 'Belt Calculations';
    return 'Chain & Sprocket';
  }

  function parseUnit05Source(src){
    const s=src.indexOf('const units=');
    let e=src.indexOf('\n\nconst $=',s);
    if(e<0)e=src.indexOf('const $=',s);
    if(s<0||e<0)throw new Error('Unit 05 dataset marker not found');
    const expr=src.slice(s+'const units='.length,e).trim().replace(/;$/,'');
    const units=Function('"use strict";return ('+expr+');')();
    const sourceUnit=units.find(x=>String(x.id)==='05')||units[0];
    if(!sourceUnit||!Array.isArray(sourceUnit.cards))throw new Error('Unit 05 source bank missing');
    const cards=sourceUnit.cards.map((c,i)=>{
      const id='05-'+String(i+1).padStart(3,'0');
      const q=Array.isArray(c)?String(c[0]??''):String(c.q??c.question??'');
      const a=Array.isArray(c)?String(c[1]??''):String(c.a??c.answer??'');
      return {id,baseId:id,q,a,section:unit05Section(id),image:UNIT05_IMAGE_IDS.has(id),part:1,parts:1};
    }).filter(c=>c.q||c.a);
    const sections=new Set(cards.map(c=>c.section));
    const imageSlots=cards.filter(c=>c.image).length;
    if(cards.length!==125||sections.size!==9||imageSlots!==52){
      throw new Error(`Unit 05 source integrity failed: cards=${cards.length}, sections=${sections.size}, images=${imageSlots}`);
    }
    window.ET_UNIT05_CARDS=cards;
    window.ET_UNIT05_STATS={cards:125,sections:9,imageSlots:52,source:'ET වැඩක් ලබාදීම latest app'};
    return [{...sourceUnit,cards}];
  }

  function openDb(name,version,createStore=false){
    return new Promise(resolve=>{
      if(!('indexedDB' in window)){resolve(null);return}
      const req=indexedDB.open(name,version);
      req.onupgradeneeded=()=>{if(createStore&&!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images')};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
  }

  async function migrateLegacyImages(){
    try{
      if(!('indexedDB' in window))return;
      if(indexedDB.databases){
        const list=await indexedDB.databases();
        if(!list.some(x=>x.name==='ETRecallUnit06DB'))return;
      }
      const oldDb=await openDb('ETRecallUnit06DB',1,false);
      if(!oldDb||!oldDb.objectStoreNames.contains('images')){oldDb?.close();return}
      const all=await new Promise(resolve=>{
        const tx=oldDb.transaction('images','readonly'),st=tx.objectStore('images'),keysReq=st.getAllKeys();
        keysReq.onsuccess=()=>{
          const keys=keysReq.result||[],out=[];
          if(!keys.length){resolve(out);return}
          let left=keys.length;
          keys.forEach(k=>{const r=st.get(k);r.onsuccess=()=>{if(r.result)out.push([String(k),r.result]);if(--left===0)resolve(out)};r.onerror=()=>{if(--left===0)resolve(out)}});
        };
        keysReq.onerror=()=>resolve([]);
      });
      oldDb.close();
      if(!all.length)return;
      const newDb=await openDb('ETRecallImagesV3',1,true);
      if(!newDb)return;
      await new Promise(resolve=>{
        const tx=newDb.transaction('images','readwrite'),st=tx.objectStore('images');
        all.forEach(([k,v])=>st.put(v,`06:${k}`));
        tx.oncomplete=resolve;tx.onerror=resolve;
      });
      newDb.close();
      console.info(`ET Recall: migrated ${all.length} legacy Unit 06 images`);
    }catch(err){console.warn('Unit 06 legacy image migration skipped',err)}
  }

  async function loadUnit06(){
    const chunks=await Promise.all(CHUNKS.map(name=>nativeFetch(`${DATA_BASE}/${name}`,{cache:'no-store'}).then(r=>{
      if(!r.ok)throw new Error(`${name}: ${r.status}`);
      return r.json();
    })));
    const cards=chunks.flat();
    const unique=new Set(cards.map(c=>c.baseId));
    const imageParts=cards.filter(c=>c.image).length;
    const textParts=cards.length-imageParts;
    const imageSlots=new Set(cards.filter(c=>c.image).map(c=>c.baseId)).size;
    if(cards.length!==425||unique.size!==364||textParts!==320||imageParts!==105||imageSlots!==60){
      throw new Error(`Unit 06 source integrity failed: cards=${cards.length}, unique=${unique.size}, text=${textParts}, image=${imageParts}, slots=${imageSlots}`);
    }
    window.ET_UNIT06_CARDS=cards;
    window.ET_UNIT06_STATS={cards:425,unique:364,text:320,image:105,imageSlots:60};
    await migrateLegacyImages();
    return {unit:'06',title:'ස්වයංචල තාක්ෂණවේදය',source:'index(5).html',cards};
  }

  window.fetch=async(input,init)=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';

    if(/(^|\/)app\.js(?:\?|$)/.test(url)){
      try{
        const r=await nativeFetch(input,init);
        if(!r.ok)return r;
        const src=await r.text();
        const units=parseUnit05Source(src);
        const synthetic=`const units=${JSON.stringify(units)};\n\nconst $=null;`;
        return new Response(synthetic,{status:200,headers:{'Content-Type':'application/javascript; charset=utf-8','X-ET-Source':'ET-work-chat-latest-Unit05'}});
      }catch(err){
        console.error('Unit 05 adapter failed',err);
        return new Response('const units=[];\n\nconst $=null;',{status:500,headers:{'Content-Type':'application/javascript; charset=utf-8'}});
      }
    }

    if(/(^|\/)unit06\.json(?:\?|$)/.test(url)){
      try{
        const data=await loadUnit06();
        return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','X-ET-Source':'index(5).html'}});
      }catch(err){
        console.error('Unit 06 adapter failed',err);
        return new Response(JSON.stringify({cards:[]}),{status:500,headers:{'Content-Type':'application/json'}});
      }
    }
    return nativeFetch(input,init);
  };
})();
