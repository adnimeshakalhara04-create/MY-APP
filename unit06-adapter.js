(()=>{
  const nativeFetch=window.fetch.bind(window);
  const DATA_BASE='https://raw.githubusercontent.com/adnimeshakalhara04-create/MY-APP/2a0714771c1d29dbd5a49b14ec60468e2ee06809';
  const CHUNKS=['unit06-1.json','unit06-2.json','unit06-3.json','unit06-4.json','unit06-5.json'];

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
