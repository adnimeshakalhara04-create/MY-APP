(()=>{
  const KEY='etRecallUnit06AdvancedPrintV1';
  const $=s=>document.querySelector(s);
  const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
  let state={};
  try{state=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{state={}}
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const currentId=()=>$('#unitPicker')?.value==='06'?($('#editCard')?.value||''):'';
  const get=id=>({cardH:clamp(state[id]?.cardH,72,128,128),answerY:clamp(state[id]?.answerY,-35,35,0),locked:!!state[id]?.locked});
  const set=(id,patch)=>{if(!id)return;state[id]={...get(id),...patch};save();sync();applyAll()};

  function ensureUI(){
    const host=$('#imageEditor');
    if(!host||$('#u06Advanced'))return;
    const box=document.createElement('div');
    box.id='u06Advanced';
    box.innerHTML=`<div class="control-title" style="margin-top:12px">Unit 06 • index(5) extra controls</div>
      <div class="range-row"><span>Answer Y</span><input id="u06AnswerY" type="range" min="-35" max="35" step="1" value="0"><output id="u06AnswerYOut">0%</output></div>
      <div class="range-row"><span>Card Height</span><input id="u06CardH" type="range" min="72" max="128" step="1" value="128"><output id="u06CardHOut">128mm</output></div>
      <label class="check-row"><input id="u06CardLock" type="checkbox"> 🔒 A/B Card Height Lock</label>
      <div class="hint">A හා B දෙපැත්තට එකම card height. Answer position එක වෙනම ඉහළ/පහළ adjust කළ හැක.</div>
      <button class="btn ghost" id="u06AdvancedReset" type="button" style="width:100%;margin-top:8px">Reset Unit 06 extra controls</button>`;
    host.appendChild(box);
    $('#u06AnswerY').addEventListener('input',e=>set(currentId(),{answerY:Number(e.target.value)}));
    $('#u06CardH').addEventListener('input',e=>{const id=currentId();if(id&&!get(id).locked)set(id,{cardH:Number(e.target.value)})});
    $('#u06CardLock').addEventListener('change',e=>set(currentId(),{locked:e.target.checked}));
    $('#u06AdvancedReset').addEventListener('click',()=>{const id=currentId();if(!id)return;delete state[id];save();sync();applyAll()});
    $('#editCard')?.addEventListener('change',()=>setTimeout(()=>{sync();applyAll()},0));
    $('#unitPicker')?.addEventListener('change',()=>setTimeout(()=>{sync();applyAll()},0));
  }

  function sync(){
    ensureUI();
    const box=$('#u06Advanced');if(!box)return;
    const id=currentId();
    box.style.display=id?'block':'none';
    if(!id)return;
    const v=get(id);
    $('#u06AnswerY').value=v.answerY;$('#u06AnswerYOut').textContent=v.answerY+'%';
    $('#u06CardH').value=v.cardH;$('#u06CardHOut').textContent=v.cardH+'mm';
    $('#u06CardLock').checked=v.locked;$('#u06CardH').disabled=v.locked;
  }

  function applyCard(el){
    if($('#unitPicker')?.value!=='06')return;
    const id=el.dataset.card;if(!id)return;
    const v=get(id);
    if(el.classList.contains('image-mode')||el.querySelector('.pimage')||el.dataset.side==='a'){
      el.style.height=v.cardH+'mm';
      el.style.minHeight=v.cardH+'mm';
      el.style.maxHeight=v.cardH+'mm';
    }
    if(el.dataset.side==='a'){
      const text=el.querySelector('.ptext');if(text)text.style.transform=`translateY(${v.answerY}%)`;
    }
  }
  function applyAll(){document.querySelectorAll('.pcard[data-card]').forEach(applyCard)}

  function openEditor(id){
    if(!id||$('#unitPicker')?.value!=='06')return;
    const printTab=document.querySelector('.tab[data-view="print"]');if(printTab)printTab.click();
    const setSel=$('#printSet');if(setSel&&setSel.value!=='image'){setSel.value='image';setSel.dispatchEvent(new Event('change',{bubbles:true}))}
    setTimeout(()=>{
      const edit=$('#editCard');if(edit){edit.value=id;edit.dispatchEvent(new Event('change',{bubbles:true}))}
      sync();applyAll();
      $('#imageEditor')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    },30);
  }

  document.addEventListener('click',e=>{
    if($('#unitPicker')?.value!=='06')return;
    if(e.target.closest('input,button,label,select'))return;
    const imageCard=e.target.closest('#imageGrid .image-card');
    if(imageCard){const m=imageCard.querySelector('.badge')?.textContent.match(/06-\d{3}/);if(m)openEditor(m[0]);return}
    const p=e.target.closest('#preview .pcard.question[data-card]');if(p)openEditor(p.dataset.card);
  });

  let lastObservedId='';
  const observer=new MutationObserver(()=>{
    ensureUI();
    const id=currentId();
    if(id!==lastObservedId){lastObservedId=id;sync()}
    applyAll();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',()=>{ensureUI();lastObservedId=currentId();sync();applyAll()});
})();
