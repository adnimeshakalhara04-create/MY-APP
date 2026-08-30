(()=>{
  const nativeFetch=window.fetch.bind(window);
  const DATA_BASE='https://cdn.jsdelivr.net/gh/adnimeshakalhara04-create/MY-APP@0edcf0812ca54e73b839753a0dc9592a4d9ea84c/data';
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
