/* LIFE OS 10.0 — Experience Edition
   Optional progressive enhancement. Does not alter authentication, purchases or cloud data.
   Navigates through the app's own v42Go routing and respects existing FREE / PRO rules.
*/
(() => {
  'use strict';
  if (window.LIFEExperience10) return;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const symbols = {auto_awesome:'✦',search:'⌕',timer:'◷',edit_note:'✎',insights:'◩',folder_open:'▤',today:'▦',checklist:'☑',menu_book:'▣',fitness_center:'✚',restaurant:'◈',account_balance_wallet:'▥',palette:'◉',north_east:'↗',add:'+',download:'↓',play_arrow:'▶',pause:'Ⅱ',replay:'↻',check:'✓'};
  const icon = name => `<span class="lx-icon" aria-hidden="true">${symbols[name] || '✦'}</span>`;
  const fold = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const root = document.createElement('div');
  root.id = 'life-experience-10';
  root.innerHTML = `
    <button class="lx-launch" type="button" aria-label="Abrir Central LIFE" title="Central LIFE · Ctrl + K">
      <span class="lx-launch-emblem">${icon('auto_awesome')}</span><span class="lx-launch-label">CENTRAL LIFE</span><kbd>⌘ K</kbd>
    </button>
    <div class="lx-backdrop" hidden>
      <section class="lx-panel" role="dialog" aria-modal="true" aria-label="Central de comandos LIFE OS" tabindex="-1">
        <header class="lx-head">
          <span class="lx-spark">✦</span>
          <div><small>LIFE OS <span class="lx-version">10.0</span> / COMMAND CENTER</small><h2>O que vamos fazer?</h2><p>Menos caminhos. Mais resultado.</p></div>
          <button type="button" class="lx-close" aria-label="Fechar central de comandos">×</button>
        </header>
        <div class="lx-search">${icon('search')}<input type="search" class="lx-input" aria-label="Buscar ações no LIFE" placeholder="Busque uma área, ação ou ferramenta…" autocomplete="off"><kbd>ESC</kbd></div>
        <div class="lx-chips"><button type="button" data-action="focus">${icon('timer')} Foco</button><button type="button" data-action="capture">${icon('edit_note')} Capturar</button><button type="button" data-action="insights">${icon('insights')} Meu dia</button></div>
        <div class="lx-commands" aria-label="Resultados da busca"></div>
        <footer class="lx-footer"><span><b>↵</b> Abrir</span><span><b>↑↓</b> Navegar</span><span><b>ESC</b> Fechar</span></footer>
      </section>
    </div>
    <div class="lx-tool" hidden>
      <section class="lx-tool-card" role="dialog" aria-modal="true" aria-label="Ferramenta LIFE" tabindex="-1">
        <header><small class="lx-tool-tag">LIFE OS / QUICK ACTION</small><button type="button" class="lx-tool-close" aria-label="Fechar ferramenta">×</button></header>
        <div class="lx-tool-body"></div>
      </section>
    </div>
    <div class="lx-toast" role="status" aria-live="polite"></div>`;
  document.body.appendChild(root);
  const launch = $('.lx-launch',root), backdrop = $('.lx-backdrop',root), commandInput = $('.lx-input',root);
  const commandList = $('.lx-commands',root), tool = $('.lx-tool',root), toolBody = $('.lx-tool-body',root), toolTag = $('.lx-tool-tag',root);
  let selected = 0, visible = [], previousFocus = null, metrics = null;
  let timer = null, timerEnd = 0, remainingSeconds = 25*60, currentDuration = 25*60, timerRunning = false;
  let toastTimeout = null, lastOpenTool = '';
  const store = {
    read(key,fallback) { try {const raw = localStorage.getItem(key); return raw===null ? fallback : JSON.parse(raw);}catch (_) {return fallback;} },
    write(key,value) { try {localStorage.setItem(key,JSON.stringify(value)); return true;}catch (_) {return false;} }
  };
  // Deliberately device-only: an unauthenticated/shared browser should never imply cloud sync.
  const NOTE_KEY = 'life_quick_notes_v10';
  const FOCUS_KEY = 'life_focus_sessions_v10';
  const scopedKey = base => {
    const id = String(window.lifeLastSupabaseProfile?.user?.id || 'local');
    return base+'_'+id.replace(/[^a-z0-9_-]/gi,'');
  };
  const PREF_KEY = 'life_experience_prefs_v10';
  const defaults = {appearance:'signature', reducedMotion:false};
  const preferences = {...defaults,...store.read(PREF_KEY,{})};
  function applyPreferences(){document.documentElement.dataset.lifeExperience = preferences.appearance; document.documentElement.classList.toggle('lx-reduce-motion',!!preferences.reducedMotion);}
  applyPreferences();
  function isAuthenticated(){
    const auth = $('#life-auth');
    if(!auth)return false;
    if(document.documentElement.dataset.lifeSessionPending==='true')return false;
    const style = getComputedStyle(auth);
    return auth.classList.contains('hidden') || auth.hidden || style.display==='none' || style.visibility==='hidden';
  }
  function updateLauncher(){launch.hidden=!isAuthenticated();}
  function showToast(message){
    const toast = $('.lx-toast',root);toast.textContent=message;toast.classList.add('visible');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3500);
  }
  function closeAll(){if(!backdrop.hidden)closeCommands();if(!tool.hidden)closeTool();}
  function dialogIsOpen(){return !backdrop.hidden || !tool.hidden;}
  function unlockDocument(){if(!dialogIsOpen())document.body.classList.remove('lx-modal-open');}
  function restoreFocus(){if(previousFocus && previousFocus.isConnected)previousFocus.focus({preventScroll:true});}
  function openCommands(){
    if(!isAuthenticated())return;
    if(!tool.hidden)closeTool(false);
    previousFocus=document.activeElement;
    backdrop.hidden=false;document.body.classList.add('lx-modal-open');commandInput.value='';drawCommands();commandInput.focus();
  }
  function closeCommands(restore=true){
    if(backdrop.hidden)return;
    backdrop.hidden=true;unlockDocument();if(restore)restoreFocus();
  }
  function openTool(name,markup){
    if(!isAuthenticated())return;
    if(!backdrop.hidden)closeCommands(false);
    if(!tool.hidden)closeTool(false);
    previousFocus=document.activeElement;lastOpenTool=name;
    toolTag.textContent='LIFE OS / '+name.toUpperCase();toolBody.innerHTML=markup;
    tool.hidden=false;document.body.classList.add('lx-modal-open');
    $('.lx-tool-close',root).focus();
  }
  function closeTool(restore=true){
    if(tool.hidden)return;
    tool.hidden=true;stopTimer();unlockDocument();if(restore)restoreFocus();
  }
  function navigate(target){
    if(!isAuthenticated())return;
    window.dispatchEvent(new CustomEvent('life:navigate',{detail:{target}}));
  }
  const actions = [
    {id:'insights',section:'SEU DIA',label:'Resumo inteligente',hint:'Tarefas e compromissos reais de hoje',icon:'insights',keys:'hoje painel meu dia resumo evolução',run:openInsights},
    {id:'focus',section:'SEU DIA',label:'Modo Imersão',hint:'Timer de foco sem distrações',icon:'timer',keys:'foco estudar pomodoro concentração cronômetro',run:openFocus},
    {id:'capture',section:'CRIAR',label:'Capturar uma ideia',hint:'Anote rapidamente neste navegador',icon:'edit_note',keys:'captura bloco nota anotação ideia',run:openCapture},
    {id:'notes',section:'CRIAR',label:'Minhas capturas',hint:'Consultar ou exportar anotações locais',icon:'folder_open',keys:'minhas notas capturas',run:openCaptures},
    {id:'today',section:'NAVEGAR',label:'Abrir Hoje',hint:'Seu painel principal',icon:'today',keys:'início home',run:()=>navigate('Hoje')},
    {id:'tasks',section:'NAVEGAR',label:'Abrir Tarefas',hint:'Organização e compromissos',icon:'checklist',keys:'organizar metas tarefas agenda',run:()=>navigate('Tarefas')},
    {id:'study',section:'NAVEGAR',label:'Abrir Estudos',hint:'Estudar e revisar',icon:'menu_book',keys:'study os enem aprender',run:()=>navigate('Estudos')},
    {id:'fitness',section:'NAVEGAR',label:'Abrir Fitness',hint:'Treinos e exercícios',icon:'fitness_center',keys:'academia musculação',run:()=>navigate('Fitness')},
    {id:'food',section:'NAVEGAR',label:'Abrir Alimentação',hint:'Planos e receitas',icon:'restaurant',keys:'comida dieta cozinha nutrição',run:()=>navigate('Dieta')},
    {id:'finance',section:'NAVEGAR',label:'Abrir Finanças',hint:'Dinheiro, orçamento e metas',icon:'account_balance_wallet',keys:'money os gasto saldo',run:()=>navigate('Finanças')},
    {id:'ai',section:'NAVEGAR',label:'Abrir LIFE AI',hint:'Assistente já existente, conforme seu plano',icon:'auto_awesome',keys:'ia inteligência artificial assistente',run:()=>navigate('IA')},
    {id:'settings',section:'PERSONALIZAR',label:'Visual da Central LIFE',hint:'Escolher acabamento e movimento',icon:'palette',keys:'configuração personalizar aparência tema',run:openPreferences}
  ];
  function drawCommands(){
    const query=fold(commandInput.value.trim());
    visible=actions.filter(a=>fold(a.label+' '+a.hint+' '+a.keys).includes(query));
    selected=Math.max(0,Math.min(selected,visible.length-1));commandList.replaceChildren();
    let section='';
    visible.forEach((a,index)=>{
      if(a.section!==section){section=a.section;const title=document.createElement('div');title.className='lx-group';title.textContent=section;commandList.appendChild(title);}
      const btn=document.createElement('button');btn.type='button';btn.className='lx-command'+(index===selected?' selected':'');btn.dataset.index=String(index);
      btn.innerHTML=`<span class="lx-cmd-icon">${icon(a.icon)}</span><span class="lx-cmd-copy"><strong></strong><small></small></span>${icon('north_east')}`;
      $('.lx-cmd-copy strong',btn).textContent=a.label;$('.lx-cmd-copy small',btn).textContent=a.hint;
      btn.addEventListener('click',()=>execute(a));btn.addEventListener('mouseenter',()=>{selected=index;highlightSelection();});commandList.appendChild(btn);
    });
    if(!visible.length){const empty=document.createElement('p');empty.className='lx-empty';empty.textContent='Nenhum comando encontrado. Experimente “foco”, “nota” ou “estudos”.';commandList.appendChild(empty);}
  }
  function highlightSelection(){commandList.querySelectorAll('.lx-command').forEach(el=>el.classList.toggle('selected',Number(el.dataset.index)===selected));}
  function execute(action){closeCommands(false);action.run();}
  function readNotes(){return store.read(scopedKey(NOTE_KEY),[]).filter(x=>x&&typeof x.text==='string').slice(-150);}
  function openCapture(){
    openTool('CAPTURA RÁPIDA',`<div class="lx-tool-eyebrow">PENSAMENTO → REGISTRO</div><h2>Não deixe a ideia escapar.</h2><p>Anotações rápidas ficam <strong>somente neste dispositivo</strong> até serem exportadas. Não são sincronizadas.</p><textarea class="lx-note-entry" rows="5" maxlength="2000" placeholder="Uma ideia, lembrete ou coisa importante…" aria-label="Sua anotação"></textarea><div class="lx-button-row"><button type="button" class="lx-primary lx-save">SALVAR IDEIA ${icon('north_east')}</button><button type="button" class="lx-secondary lx-review">VER ANOTAÇÕES</button></div>`);
    const entry=$('.lx-note-entry',toolBody);entry.focus();
    $('.lx-save',toolBody).onclick=()=>{
      const content=entry.value.trim();if(!content){showToast('Escreva uma ideia para salvar.');entry.focus();return;}
      const next=[...readNotes(),{id:'n_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),date:new Date().toISOString(),text:content}].slice(-150);
      if(store.write(scopedKey(NOTE_KEY),next)){closeTool();showToast('Ideia salva neste navegador.');}
      else showToast('Armazenamento indisponível. Copie sua ideia antes de fechar.');
    };
    $('.lx-review',toolBody).onclick=openCaptures;
  }
  function openCaptures(){
    const notes=readNotes().slice().reverse();
    openTool('MINHAS CAPTURAS',`<div class="lx-tool-eyebrow">ARQUIVO LOCAL</div><h2>Ideias no seu ritmo.</h2><p>${notes.length} captura${notes.length===1?'':'s'} salva${notes.length===1?'':'s'} neste navegador. Não são sincronizadas com o Supabase.</p><div class="lx-notes"></div><div class="lx-button-row"><button class="lx-primary lx-new" type="button">${icon('add')} NOVA CAPTURA</button><button class="lx-secondary lx-export" type="button">${icon('download')} EXPORTAR</button></div>`);
    const area=$('.lx-notes',toolBody);
    if(!notes.length){area.innerHTML='<p class="lx-empty">Seu arquivo local está vazio.</p>';}
    notes.forEach(n=>{
      const item=document.createElement('article');const top=document.createElement('div');top.className='lx-note-top';
      const date=document.createElement('small');const parsed=new Date(n.date);date.textContent=Number.isNaN(parsed.getTime())?'Registro':parsed.toLocaleString('pt-BR');
      const del=document.createElement('button');del.type='button';del.textContent='Excluir';del.setAttribute('aria-label','Excluir anotação');
      del.onclick=()=>{if(!confirm('Excluir esta anotação deste dispositivo?'))return; if(store.write(scopedKey(NOTE_KEY),readNotes().filter(x=>x.id!==n.id))){openCaptures();showToast('Anotação excluída.');}else showToast('Não foi possível excluir.');};
      top.append(date,del);const content=document.createElement('p');content.textContent=n.text;item.append(top,content);area.appendChild(item);
    });
    $('.lx-new',toolBody).onclick=openCapture;
    $('.lx-export',toolBody).disabled=!notes.length;
    $('.lx-export',toolBody).onclick=()=>{
      const content=notes.map(n=>`[${new Date(n.date).toLocaleString('pt-BR')}]\n${n.text}`).join('\n\n----------------\n\n');
      const blob=new Blob(['LIFE OS 10.0 — MINHAS CAPTURAS\n\n',content],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='life-os-capturas.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
    };
  }
  function stopTimer(){if(timer)clearInterval(timer);timer=null;timerRunning=false;document.title='LIFE OS 10.0 — Seu sistema pessoal';}
  function clock(seconds){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
  function readFocus(){return store.read(scopedKey(FOCUS_KEY),[]).filter(s=>s&&Number.isFinite(s.minutes)).slice(-120);}
  function openFocus(){
    stopTimer();currentDuration=25*60;remainingSeconds=currentDuration;
    openTool('MODO IMERSÃO',`<div class="lx-tool-eyebrow">DEEP WORK / SEU TEMPO</div><h2>Uma coisa de cada vez.</h2><p>Escolha uma tarefa. O tempo é seu — sem notificações desnecessárias.</p><input class="lx-goal" maxlength="100" aria-label="Objetivo desta sessão de foco" placeholder="Em que você vai se concentrar?" type="text"><div class="lx-duration" aria-label="Duração do foco"><button class="lx-duration-btn" data-minutes="15" type="button">15 MIN</button><button class="lx-duration-btn active" data-minutes="25" type="button">25 MIN</button><button class="lx-duration-btn" data-minutes="45" type="button">45 MIN</button></div><div class="lx-clock" role="timer" aria-label="Tempo restante">25:00</div><div class="lx-focus-actions"><button class="lx-primary lx-toggle" type="button">${icon('play_arrow')} INICIAR FOCO</button><button class="lx-secondary lx-reset" type="button">REINICIAR</button></div><p class="lx-focus-tip">Mantenha o LIFE aberto. Apenas sessões concluídas entram no histórico local.</p>`);
    const display=$('.lx-clock',toolBody),toggle=$('.lx-toggle',toolBody),durationBtns=[...toolBody.querySelectorAll('.lx-duration-btn')];
    const update=()=>{display.textContent=clock(remainingSeconds);document.title=(timerRunning?'['+clock(remainingSeconds)+'] ':'')+'LIFE OS 10.0 — Seu sistema pessoal';};
    const setPause=(paused)=>{toggle.innerHTML=(paused?icon('play_arrow')+' CONTINUAR':icon('pause')+' PAUSAR');};
    const tick=()=>{
      if(!timerRunning)return;
      remainingSeconds=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));update();
      if(remainingSeconds===0){stopTimer();const goal=$('.lx-goal',toolBody)?.value.trim()||'';const history=[...readFocus(),{date:new Date().toISOString(),minutes:currentDuration/60,goal}].slice(-120);
        store.write(scopedKey(FOCUS_KEY),history);toggle.innerHTML=icon('replay')+' RECOMEÇAR';showToast('Sessão de foco concluída. Bom trabalho!');}
    };
    durationBtns.forEach(button=>button.onclick=()=>{stopTimer();currentDuration=Number(button.dataset.minutes)*60;remainingSeconds=currentDuration;durationBtns.forEach(b=>b.classList.toggle('active',b===button));toggle.innerHTML=icon('play_arrow')+' INICIAR FOCO';update();});
    toggle.onclick=()=>{
      if(timerRunning){remainingSeconds=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));stopTimer();update();setPause(true);return;}
      if(!remainingSeconds)remainingSeconds=currentDuration;
      timerRunning=true;timerEnd=Date.now()+remainingSeconds*1000;timer=setInterval(tick,300);setPause(false);update();
    };
    $('.lx-reset',toolBody).onclick=()=>{stopTimer();remainingSeconds=currentDuration;toggle.innerHTML=icon('play_arrow')+' INICIAR FOCO';update();};
    $('.lx-goal',toolBody).focus();
  }
  function requestMetrics(){window.dispatchEvent(new Event('life:v10:metrics-request'));}
  function openInsights(){
    requestMetrics();const current=metrics||{};
    const sessions=readFocus();const today=new Date().toLocaleDateString('sv-SE');
    const todaySessions=sessions.filter(x=>x.date && new Date(x.date).toLocaleDateString('sv-SE')===today);
    const minutes=todaySessions.reduce((acc,x)=>acc+x.minutes,0);
    const hasTasks=Number.isFinite(current.tasksTotal);
    openTool('MEU DIA',`<div class="lx-tool-eyebrow">LIFE / DAILY SIGNAL</div><h2>Seu dia em perspectiva.</h2><p>Um resumo dos dados realmente registrados no LIFE.</p><div class="lx-insight-grid"><div><small>PLANOS CONCLUÍDOS</small><b class="lx-count-done">—</b></div><div><small>PENDENTES AGORA</small><b class="lx-count-open">—</b></div><div><small>COMPROMISSOS</small><b class="lx-count-events">—</b></div><div><small>FOCO LOCAL HOJE</small><b class="lx-count-focus">—</b></div></div><div class="lx-progress-heading"><span>Seu progresso</span><strong class="lx-progress-number">—</strong></div><div class="lx-meter"><i></i></div><div class="lx-next-block"><small>PRÓXIMO PASSO REGISTRADO</small><strong></strong><p>Atualizado conforme os planos da área Hoje.</p></div><div class="lx-button-row"><button type="button" class="lx-primary lx-open-tasks">ABRIR TAREFAS ${icon('north_east')}</button><button type="button" class="lx-secondary lx-start-focus">INICIAR FOCO</button></div>`);
    $('.lx-count-done',toolBody).textContent=hasTasks?`${current.tasksDone}/${current.tasksTotal}`:'—';
    $('.lx-count-open',toolBody).textContent=hasTasks?String(current.tasksOpen):'—';
    $('.lx-count-events',toolBody).textContent=Number.isFinite(current.eventsTotal)?String(current.eventsTotal):'—';
    $('.lx-count-focus',toolBody).textContent=minutes+' min';
    $('.lx-progress-number',toolBody).textContent=hasTasks?String(current.progress)+'%':'Sem dados';
    $('.lx-meter i',toolBody).style.width=hasTasks?Math.max(0,Math.min(100,Number(current.progress)))+'%':'0%';
    $('.lx-next-block strong',toolBody).textContent=hasTasks?(current.nextTask||'Seu dia está livre para planejar.'):'Abra Hoje para carregar seu resumo.';
    $('.lx-open-tasks',toolBody).onclick=()=>{closeTool();navigate('Tarefas');};
    $('.lx-start-focus',toolBody).onclick=openFocus;
  }
  function openPreferences(){
    openTool('PERSONALIZAÇÃO',`<div class="lx-tool-eyebrow">APARÊNCIA / CONTROLE</div><h2>Do seu jeito.</h2><p>Ajuste somente os efeitos visuais da Central LIFE. Seu tema principal e seus dados continuam intactos.</p><div class="lx-pref-options"><label><span><strong>Acabamento</strong><small>O visual da Central LIFE</small></span><select class="lx-pref-appearance"><option value="signature">Signature · iluminação suave</option><option value="minimal">Essencial · menos brilho</option></select></label><label><span><strong>Reduzir movimento</strong><small>Animações mais discretas</small></span><input type="checkbox" class="lx-pref-motion"></label></div><button class="lx-primary lx-apply" type="button">SALVAR APARÊNCIA ${icon('check')}</button>`);
    $('.lx-pref-appearance',toolBody).value=preferences.appearance;
    $('.lx-pref-motion',toolBody).checked=preferences.reducedMotion;
    $('.lx-apply',toolBody).onclick=()=>{
      preferences.appearance=$('.lx-pref-appearance',toolBody).value;
      preferences.reducedMotion=$('.lx-pref-motion',toolBody).checked;
      if(store.write(PREF_KEY,preferences)){applyPreferences();closeTool();showToast('Aparência salva neste navegador.');}
      else showToast('Não foi possível salvar estas preferências.');
    };
  }
  function trapFocus(e,dialog){
    if(e.key!=='Tab')return;
    const tabbable=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')].filter(x=>x.getClientRects().length);
    if(!tabbable.length){e.preventDefault();return;}
    const first=tabbable[0],last=tabbable[tabbable.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  }
  launch.addEventListener('click',openCommands);
  $('.lx-close',root).addEventListener('click',()=>closeCommands());
  $('.lx-tool-close',root).addEventListener('click',()=>closeTool());
  backdrop.addEventListener('click',event=>{if(event.target===backdrop)closeCommands();});
  tool.addEventListener('click',event=>{if(event.target===tool)closeTool();});
  commandInput.addEventListener('input',()=>{selected=0;drawCommands();});
  $('.lx-chips',root).addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const action=actions.find(a=>a.id===button.dataset.action);if(action)execute(action);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(!tool.hidden){event.preventDefault();closeTool();}
      else if(!backdrop.hidden){event.preventDefault();closeCommands();}
      return;
    }
    if(!backdrop.hidden){
      if(event.key==='ArrowDown'){event.preventDefault();selected=Math.min(visible.length-1,selected+1);highlightSelection();}
      if(event.key==='ArrowUp'){event.preventDefault();selected=Math.max(0,selected-1);highlightSelection();}
      if(event.key==='Enter' && document.activeElement===commandInput && visible[selected]){event.preventDefault();execute(visible[selected]);}
      trapFocus(event,$('.lx-panel',root));
    } else if(!tool.hidden){trapFocus(event,$('.lx-tool-card',root));}
  });
  window.addEventListener('life:v10:metrics',event=>{metrics=event.detail||null;});
  window.addEventListener('life:supabase-profile',()=>{setTimeout(updateLauncher,20);closeAll();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&timerRunning&&typeof timer==='number'){remainingSeconds=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));if(remainingSeconds<=0){const el=$('.lx-clock',toolBody);if(el)el.textContent='00:00';}}});
  window.LIFEExperience10={open:openCommands,focus:openFocus,capture:openCapture,insights:openInsights,openPreferences};
  updateLauncher();setInterval(updateLauncher,3000);
})();
