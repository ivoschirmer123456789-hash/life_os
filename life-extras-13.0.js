/* LIFE OS 13.0 — extras on existing areas, no new primary navigation.
   Pure helpers exported for independent tests; view uses React 18 already loaded by LIFE. */
(function(root,factory){ 'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LifeExtras130=api;})(typeof globalThis!=='undefined'?globalThis:undefined,function(){
 'use strict';
 const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
 const safeArr=x=>Array.isArray(x)?x:[];
 const done=t=>!!(t&&(t.done===true||t.completed===true||t.status==='done'));
 const taskDate=t=>new Date(t?.doneAt||t?.completedAt||t?.finishedAt||0).getTime();
 const activityDate=a=>new Date(a?.date||a?.at||a?.createdAt||0).getTime();
 function weekSummary({tasks=[],activity=[],projects=[],now=Date.now()}={}){
   const start=now-7*86400000, end=now;
   const ts=safeArr(tasks),acts=safeArr(activity),pr=safeArr(projects);
   const completed=ts.filter(t=>done(t)&&taskDate(t)>=start&&taskDate(t)<=end).length;
   const logged=acts.filter(a=>{const v=activityDate(a);return v>=start&&v<=end;});
   const areas={}; logged.forEach(a=>{const k=clean(a.go||a.area||a.type||'LIFE',45);areas[k]=(areas[k]||0)+1});
   return {completed,open:ts.filter(t=>!done(t)).length,activities:logged.length,projects:pr.length,areas:Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0,6),periodDays:7};
 }
 function milestoneDraft({goal,steps=[],deadline='',now=Date.now()}={}){
    const g=clean(goal,120),rows=safeArr(steps).map(t=>clean(t,140)).filter(Boolean).slice(0,12);
    if(!g||rows.length===0)return {ok:false,error:'Escolha uma meta e escreva pelo menos uma etapa.',items:[]};
    const start=new Date(now);start.setHours(12,0,0,0);
    let finish=null;
    if(deadline){if(!/^\d{4}-\d{2}-\d{2}$/.test(deadline))return {ok:false,error:'Data inválida.',items:[]};finish=new Date(deadline+'T12:00:00');if(!Number.isFinite(finish.getTime())||[finish.getFullYear(),String(finish.getMonth()+1).padStart(2,'0'),String(finish.getDate()).padStart(2,'0')].join('-')!==deadline||finish<=start)return {ok:false,error:'Escolha uma data futura.',items:[]};}
    const items=rows.map((title,i)=>{let due=null;if(finish){const d=new Date(start.getTime()+Math.round((finish.getTime()-start.getTime())*(i+1)/rows.length));due=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}return {title,due,step:i+1};});
    return {ok:true,items};
 }
 function feedbackClean(form){
   const category=['Erro','Sugestão','Dúvida'].includes(form?.category)?form.category:'Sugestão';
   const message=clean(form?.message,1200);
   if(message.length<10)return {ok:false,error:'Descreva em pelo menos 10 caracteres.'};
   return {ok:true,entry:{id:'fb_'+Date.now().toString(36),category,message,createdAt:new Date().toISOString(),state:'rascunho_local'}};
 }
 const enc=s=>new TextEncoder().encode(s),esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'');
 const u16=(n)=>[n&255,(n>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
 function crc32(b){let v=0xffffffff;for(const c of b){v^=c;for(let j=0;j<8;j++)v=(v>>>1)^((v&1)?0xedb88320:0);}return (v^0xffffffff)>>>0;}
 function zipStore(files){const chunks=[],central=[];let offset=0;for(const [name,bytes] of files){const filename=enc(name),crc=crc32(bytes);const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(bytes.length),...u32(bytes.length),...u16(filename.length),...u16(0)]);chunks.push(local,filename,bytes);central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(bytes.length),...u32(bytes.length),...u16(filename.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]),filename);offset+=local.length+filename.length+bytes.length;}
  const size=central.reduce((n,v)=>n+v.length,0),end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(size),...u32(offset),...u16(0)]);const out=new Uint8Array(offset+size+end.length);let p=0;for(const v of [...chunks,...central,end]){out.set(v,p);p+=v.length;}return out;
 }
 function worksheet(rows){const ar=safeArr(rows).slice(0,5001);return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetData>`+ ar.map((row,i)=>`<row r="${i+1}">`+safeArr(row).slice(0,16).map((v,j)=>{const col=String.fromCharCode(65+j);const s=esc(clean(v,30000));return `<c r="${col}${i+1}" t="inlineStr"><is><t xml:space="preserve">${s}</t></is></c>`;}).join('')+`</row>`).join('')+'</sheetData></worksheet>';}
 function xlsxBytes({tasks=[],activity=[],projects=[],summary={}}={}){
  const books=[
    ['Resumo',[['LIFE OS — Relatório','Valor'],['Período','Últimos 7 dias'],['Tarefas concluídas',String(summary.completed||0)],['Tarefas em aberto',String(summary.open||0)],['Atividades registradas',String(summary.activities||0)],['Projetos',String(summary.projects||0)]]],
    ['Tarefas',[['Tarefa','Área','Status','Prioridade','Prazo'],...safeArr(tasks).slice(0,4500).map(t=>[t.text||t.title||'',t.category||'',done(t)?'Concluída':'Pendente',t.priority||'',t.dueAt||t.due||''])]],
    ['Atividades',[['Data','Área','Tipo','Descrição'],...safeArr(activity).slice(0,4500).map(a=>[a.date||'',a.go||a.area||'',a.type||'',a.title||''])]],
    ['Projetos',[['Projeto','Próximo passo','Progresso'],...safeArr(projects).slice(0,4500).map(p=>[p.n||p.name||'',p.next||'',p.p||''])]]
  ];
  const content=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${books.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
  const workbook=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${books.map(([name],i)=>`<sheet name="${name}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${books.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}</Relationships>`;
  const rootrels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const files=[['[Content_Types].xml',enc(content)],['_rels/.rels',enc(rootrels)],['xl/workbook.xml',enc(workbook)],['xl/_rels/workbook.xml.rels',enc(rels)],...books.map(([_,rows],i)=>[`xl/worksheets/sheet${i+1}.xml`,enc(worksheet(rows))])];return zipStore(files);
 }
 function download(bytes,filename,type){const blob=new Blob([bytes],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 function safeRead(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(_){return fallback}}
 function safeWrite(key,data){try{localStorage.setItem(key,JSON.stringify(data));if(key==='life13_preferences_v1')localStorage.setItem('life_local_dirty_at',new Date().toISOString());return true}catch(_){return false}}
 function ui({area,tasks=[],activity=[],projects=[],goals=[],onCreateMilestones,onWeeklyReview,onOpenProjects,onOpenTrash,onGo,cloudStatus='local',cloudLastSync='',online=true,onSync,aiContextFlags={},onAiContext}){
  const R=window.React,E=R.createElement;
  const [open,setOpen]=R.useState(false),[feedback,setFeedback]=R.useState({category:'Sugestão',message:''}),[notice,setNotice]=R.useState('');
  const feedbackKey='life13_feedback_v1_'+clean(window.lifeLastSupabaseProfile?.user?.id||localStorage.getItem('life_data_owner_uid_v123')||'unlinked',48).replace(/[^a-z0-9_-]/gi,'');
  const [fbDrafts,setFbDrafts]=R.useState(()=>safeRead(feedbackKey,[]));
  const [prefs,setPrefs]=R.useState(()=>safeRead('life13_preferences_v1',{lab:false,weeklyDigest:false}));
  const [goalId,setGoalId]=R.useState(''),[milestones,setMilestones]=R.useState(''),[deadline,setDeadline]=R.useState('');
  const [pending,setPending]=R.useState(null);
  const summary=R.useMemo(()=>weekSummary({tasks,activity,projects}),[tasks,activity,projects]);
  const say=message=>{setNotice(message);};
  const title=area==='Tarefas'?'Projetos, metas e recuperação':area==='Life'?'Metas e progresso dos projetos':area==='Evolução'?'Relatórios e revisão semanal':area==='Perfil'?'Privacidade, suporte e novidades':'Resumo semanal';
  if(!['Tarefas','Life','Evolução','Perfil','Hoje'].includes(area))return null;
  if(area==='Hoje'&&!prefs.weeklyDigest)return null;
  const btn=(text,fn,disabled=false,kind='')=>E('button',{type:'button',className:kind,disabled,onClick:fn},text);
  const summaryCard=E('div',{className:'life13-summary'},[
   ['Tarefas concluídas',summary.completed],['Em aberto',summary.open],['Registros na semana',summary.activities],['Projetos',summary.projects]
  ].map(([label,n])=>E('div',{key:label},E('small',null,label),E('strong',null,String(n)))));
  const progress=E('div',{className:'life13-progression'},E('strong',null,'Metas em andamento'),E('p',null,`${goals.filter(g=>!g.done).length} meta(s) abertas · ${projects.length} projeto(s) já cadastrados.`),btn('Abrir projetos existentes',()=>onOpenProjects?.()));
  const drafts=safeArr(fbDrafts);
  let inside = null;
  if(area==='Hoje'){
    inside=E('div',{className:'life13-body'}, summaryCard,btn('Revisão semanal',()=>onWeeklyReview?.()));
  } else if(area==='Tarefas'||area==='Life'){
    const goalOptions=safeArr(goals).filter(g=>!g.done).map(g=>E('option',{key:g.id,value:g.id},g.title));
    const selectGoal=E('label',null,'Meta',E('select',{value:goalId,onChange:e=>{setGoalId(e.target.value);setPending(null);}},E('option',{value:''},'Selecione uma meta'),...goalOptions));
    const inputSteps=E('label',null,'Etapas (uma por linha)',E('textarea',{value:milestones,onChange:e=>{setMilestones(e.target.value);setPending(null);},placeholder:'Definir a primeira entrega\nExecutar e registrar\nRevisar o resultado',rows:3,maxLength:1200}));
    const inputDeadline=E('label',null,'Prazo final (opcional)',E('input',{type:'date',value:deadline,onChange:e=>{setDeadline(e.target.value);setPending(null);}}));
    const preview=btn('Pré-visualizar etapas',()=>{
      const goal=safeArr(goals).find(x=>String(x.id)===String(goalId));
      const p=milestoneDraft({goal:goal?.title,steps:milestones.split('\n'),deadline});
      if(!p.ok){say(p.error);return;}
      setPending({goalId,items:p.items});say('Confira as etapas antes de adicionar.');
    });
    const pendingPanel=pending?E('div',{className:'life13-preview'},
      ...pending.items.map((m,i)=>E('div',{key:i},`${i+1}. ${m.title}${m.due?' · '+m.due:''}`)),
      btn(`Adicionar ${pending.items.length} etapa(s)`,()=>{
        if(!confirm('Adicionar estas etapas à lista de tarefas?'))return;
        onCreateMilestones?.(pending.goalId,pending.items);
        setPending(null);setMilestones('');say('Etapas adicionadas.');
      })) : null;
    const milestoneSection=E('section',null,
       E('h4',null,'Transformar meta em etapas'),
       E('p',null,'Escolha uma meta e escreva suas próprias etapas. A lista de tarefas só muda após sua confirmação.'),
       selectGoal,inputSteps,inputDeadline,preview,pendingPanel);
    const reviewSection=E('section',null,
       E('h4',null,'Recuperação e revisão'),
       E('p',null,'Use a lixeira para recuperar itens e a revisão semanal para replanejar sem criar novas abas.'),
       btn('Revisão semanal',()=>onWeeklyReview?.()),
       btn('Abrir lixeira',()=>onOpenTrash?.()),
       btn('Ver evolução',()=>onGo?.('Evolução')));
    inside=E('div',{className:'life13-body'},progress,milestoneSection,reviewSection);
  } else if(area==='Evolução'){
    const excel=btn('Baixar Excel (.xlsx)',()=>{
       try{download(xlsxBytes({tasks,activity,projects,summary}),'LIFE_OS_13_relatorio.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');say('Planilha gerada.');}
       catch(e){say('Não foi possível gerar a planilha.');}
    });
    const print=btn('Imprimir / salvar PDF',()=>{
       document.body.classList.add('life13-print-mode');const original=document.title;document.title='LIFE OS · Relatório semanal';
       const end=()=>{document.body.classList.remove('life13-print-mode');document.title=original;window.removeEventListener('afterprint',end)};
       window.addEventListener('afterprint',end);setTimeout(()=>{window.print();setTimeout(end,15000)},80);
    });
    const doc=E('div',{className:'life13-print-document',id:'life13-print-document'},
      E('h2',null,'LIFE OS · Relatório semanal'),E('p',null,'Período: últimos 7 dias'),
      E('p',null,`Tarefas concluídas: ${summary.completed} · Em aberto: ${summary.open} · Atividades: ${summary.activities} · Projetos: ${summary.projects}`),
      E('h3',null,'Áreas com registros'),
      ...(summary.areas.length?summary.areas.map(([label,n])=>E('p',{key:label},`${label}: ${n}`)):[E('p',{key:'none'},'Nenhuma atividade registrada na semana.')])
    );
    inside=E('div',{className:'life13-body'},summaryCard,E('section',null,
       E('h4',null,'Relatório semanal'),
       E('p',null,'Gerado a partir dos registros existentes; números ausentes não são inventados.'),
       E('div',{className:'life13-inline'},excel,print),doc,
       btn('Abrir revisão guiada',()=>onWeeklyReview?.())));
  } else {
    const syncSection=E('section',null,E('h4',null,'Sincronização e dados'),
      E('p',null,online?'Conexão disponível.':'Offline: mudanças aguardam conexão.'),
      E('p',null,`Status: ${cloudStatus} · Última sincronização: ${cloudLastSync?new Date(cloudLastSync).toLocaleString('pt-BR'):'não confirmada'}`),
      btn('Verificar sincronização',()=>onSync?.(),!online));
    const flags=[['tasks','Tarefas'],['notes','Notas'],['projects','Projetos'],['goals','Metas'],['finance','Finanças']];
    const aiSection=E('section',null,E('h4',null,'Contexto da LIFE AI'),
      E('p',null,'Marque o que o chat pode receber nas próximas solicitações.'),
      ...flags.map(([key,label])=>E('label',{key,className:'life13-check'},
        E('input',{type:'checkbox',checked:!!aiContextFlags[key],onChange:e=>onAiContext?.(key,e.target.checked)}),label)));
    const feedbackSection=E('section',null,E('h4',null,'Feedback'),
      E('p',null,'Rascunho local; não é enviado automaticamente.'),
      E('select',{value:feedback.category,onChange:e=>setFeedback(x=>({...x,category:e.target.value}))},
        ...['Sugestão','Erro','Dúvida'].map(x=>E('option',{key:x,value:x},x))),
      E('textarea',{rows:3,maxLength:1200,value:feedback.message,
        placeholder:'Descreva o problema ou a sugestão (10+ caracteres)',onChange:e=>setFeedback(x=>({...x,message:e.target.value}))}),
      btn('Guardar rascunho',()=>{
         const result=feedbackClean(feedback);if(!result.ok){say(result.error);return;}
         const list=[result.entry,...drafts].slice(0,30);
         if(safeWrite(feedbackKey,list)){setFbDrafts(list);setFeedback({...feedback,message:''});say('Rascunho salvo localmente.');}
         else say('Sem espaço para guardar o rascunho.');
      }),
      btn('Enviar feedback',async()=>{
        const r=feedbackClean(feedback);if(!r.ok){say(r.error);return;}
        if(!window.lifeSupabase?.functions?.invoke){say('Serviço não publicado. Guarde um rascunho.');return;}
        say('Enviando com sua conta...');
        try{const {data,error}=await window.lifeSupabase.functions.invoke('life-feedback',{body:{category:r.entry.category,message:r.entry.message}});
          if(error||data?.ok!==true){say('Não foi possível enviar. Salve um rascunho.');return;}
          setFeedback(x=>({...x,message:''}));say('Feedback recebido pelo servidor.');
        }catch(_){say('Serviço indisponível. Nenhum envio confirmado.');}
      }),
      E('p',null,`${drafts.length} rascunho(s) local(is).`),
      btn('Exportar feedback JSON',()=>download(enc(JSON.stringify({version:1,feedback:drafts},null,2)),'LIFE_feedback.json','application/json'),drafts.length===0));
    const labSection=E('section',null,E('h4',null,'Laboratório de novidades'),
      E('p',null,'Opcional. As funções experimentais ficam dentro das abas existentes.'),
      E('label',{className:'life13-check'},E('input',{type:'checkbox',checked:!!prefs.weeklyDigest,
        onChange:e=>{const next={...prefs,weeklyDigest:e.target.checked};if(safeWrite('life13_preferences_v1',next))setPrefs(next)}}),'Mostrar resumo semanal na Home'),
      E('label',{className:'life13-check'},E('input',{type:'checkbox',checked:!!prefs.lab,
        onChange:e=>{const next={...prefs,lab:e.target.checked};if(safeWrite('life13_preferences_v1',next))setPrefs(next)}}),'Participar do laboratório'),
      prefs.lab&&E('p',{className:'life13-experimental'},'Laboratório habilitado neste aparelho.'));
    const privacySection=E('section',null,E('h4',null,'Privacidade e conta'),
      E('p',null,'Você pode exportar dados pelo Perfil. Solicitar exclusão de conta remota exige atendimento do responsável pelo LIFE; apagar apenas o dispositivo não exclui sua conta no Supabase.'),
      btn('Política de privacidade',()=>window.open('privacy.html','_blank','noopener')),
      btn('Suporte',()=>window.open('support.html','_blank','noopener')),
      btn('Solicitar exclusão da conta',async()=>{
        if(!confirm('Registrar um PEDIDO de exclusão? A conta NÃO é apagada imediatamente.'))return;
        const typed=prompt('Para confirmar, escreva EXCLUIR MINHA CONTA');
        if(typed!=='EXCLUIR MINHA CONTA'){say('Pedido cancelado.');return;}
        if(!window.lifeSupabase?.functions?.invoke){say('Serviço ainda não publicado. Consulte o suporte oficial.');return;}
        try{const {data,error}=await window.lifeSupabase.functions.invoke('life-delete-request',{body:{confirm:typed}});
          if(error||data?.ok!==true){say('Pedido não confirmado pelo servidor.');return;}
          say('Solicitação registrada e pendente de atendimento. A conta permanece ativa.');
        }catch(_){say('Não foi possível registrar a solicitação.');}
      }));
    inside=E('div',{className:'life13-body'},syncSection,aiSection,feedbackSection,labSection,privacySection);
  }
  return E('section',{className:'life13-extras','aria-label':title},E('details',{open,onToggle:e=>{if(e.target.tagName==='DETAILS')setOpen(e.target.open)}},
    E('summary',null,E('span',null,E('small',null,'LIFE / FERRAMENTAS COMPLEMENTARES'),E('strong',null,title)),E('span',{className:'life13-chevron','aria-hidden':true},'⌄')),
    inside,notice&&E('p',{role:'status',className:'life13-status'},notice)));
 }
 return Object.freeze({clean,weekSummary,milestoneDraft,feedbackClean,xlsxBytes,download,ui});
});
