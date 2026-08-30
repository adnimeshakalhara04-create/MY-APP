(()=>{
  const nativeFetch=window.fetch.bind(window);
  const DATA_BASE='https://cdn.jsdelivr.net/gh/adnimeshakalhara04-create/MY-APP@0edcf0812ca54e73b839753a0dc9592a4d9ea84c/data';

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
    const chunks=await Promise.all([1,2,3,4].map(n=>nativeFetch(`${DATA_BASE}/unit06-${n}.json`,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`Unit 06 chunk ${n}: ${r.status}`);return r.json()})));
    const cards=[];
    for(const data of chunks){
      const sections=data.s||[];
      for(const row of data.c||[]){
        const [baseId,sectionIndex,q,image,answers]=row;
        const parts=(answers||[]).length||1;
        (answers||['']).forEach((a,i)=>cards.push({id:baseId,baseId,section:sections[sectionIndex]||'Unit 06',q,a,image:!!image,part:i+1,parts}));
      }
    }
    window.ET_UNIT06_CARDS=cards;
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
