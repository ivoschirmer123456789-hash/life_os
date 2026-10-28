/* LIFE OS 12.4: predictable weekly scheduling, backup validation and safe CSV exports. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LifeQuality124=api;})(typeof globalThis!=='undefined'?globalThis:undefined,function(){
 'use strict';
 const DAY=86400000;
 const pad=n=>String(n).padStart(2,'0');
 const localKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const dateFromKey=key=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(key||'')))return null;const [y,m,d]=key.split('-').map(Number);const x=new Date(y,m-1,d);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d?x:null;};
 const minFromTime=value=>{const m=/^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(value||''));return m?Number(m[1])*60+Number(m[2]):null;};
 const fmtTime=n=>`${pad(Math.floor(n/60))}:${pad(n%60)}`;
 const duration=v=>{const n=Number(v);return Number.isFinite(n)?Math.min(90,Math.max(15,Math.round(n/5)*5)):30;};
 const eventDuration=event=>{const m=String(event?.m||'').match(/(?:^|\D)(\d{1,3})\s*min/i);return Math.max(10,Math.min(240,m?Number(m[1]):60));};
 const windows=Object.freeze({manha:[8*60,12*60],tarde:[13*60,18*60],noite:[18*60,21*60]});
 const cleanText=(v,max=150)=>String(v||'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
 function eventSpan(e){const start=minFromTime(e&&e.t);const date=String(e&&e.date||'');if(!dateFromKey(date)||start===null)return null;return {date,start,end:start+eventDuration(e),taskId:String(e.linkedTaskId||'')};}
 function collision(a,b){return a.date===b.date&&a.start<b.end&&b.start<a.end;}
 function priorityScore(t,now){const p=String(t?.priority||'').toLowerCase();const a=/urgent|urgente|critica|crítica/.test(p)?100:/alta|high/.test(p)?60:/baixa|low/.test(p)?0:20;const due=Date.parse(t?.dueAt||t?.due||'');return a+(Number.isFinite(due)?Math.max(0,30-Math.ceil((due-now)/DAY)):0);}
 function buildWeek({tasks=[],events=[],startDate='',days='uteis',period='tarde',minutesPerDay=90,now=Date.now()}={}){
   const clock=new Date(now),today=new Date(clock.getFullYear(),clock.getMonth(),clock.getDate());
   const start=startDate?dateFromKey(startDate):today;
   if(!start||start<today)return {ok:false,error:'Escolha uma data de início válida, a partir de hoje.',items:[],skipped:[]};
   if(!windows[period])return {ok:false,error:'Período inválido.',items:[],skipped:[]};
   if(!['uteis','todos'].includes(days))return {ok:false,error:'Seleção de dias inválida.',items:[],skipped:[]};
   const budget=Math.floor(Number(minutesPerDay));if(!Number.isFinite(budget)||budget<30||budget>180)return {ok:false,error:'Escolha entre 30 e 180 minutos por dia.',items:[],skipped:[]};
   const existing=(Array.isArray(events)?events:[]).map(eventSpan).filter(Boolean);
   const scheduled=new Set(existing.map(x=>x.taskId).filter(Boolean));
   const open=(Array.isArray(tasks)?tasks:[]).filter(t=>t&&typeof t==='object'&&!t.done&&!t.completed&&!t.waiting&&String(t.id||'')&&!scheduled.has(String(t.id)))
     .sort((a,b)=>priorityScore(b,now)-priorityScore(a,now));
   const plan=[],skipped=[];const usedIds=new Set();
   const dates=Array.from({length:7},(_,i)=>{const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);return {date:localKey(d),day:d.getDay(),d};});
   for(const {date,day,d} of dates){
     if(days==='uteis'&&(day===0||day===6))continue;
     let [left,right]=windows[period];
     if(d.getTime()===today.getTime())left=Math.max(left,Math.ceil((clock.getHours()*60+clock.getMinutes()+1)/15)*15);
     if(left>=right)continue;
     let used=0;
     for(const task of open){
       if(plan.length>=40||usedIds.has(String(task.id)))continue;
       const deadline=task.dueAt||task.due||null;
       const last=deadline?new Date(deadline):null;
       if(last&&!Number.isNaN(last.getTime())&&last>=today&&d>new Date(last.getFullYear(),last.getMonth(),last.getDate()))continue;
       const len=duration(task.duration);
       if(used+len>budget)continue;
       for(let candidate=left;candidate+len<=right;candidate+=15){
         const item={date,start:candidate,end:candidate+len,taskId:String(task.id),title:cleanText(task.text||task.title||'Tarefa'),minutes:len,area:cleanText(task.category||'Organização',45)};
         if(!item.title)continue;
         if(existing.some(x=>collision(item,x))||plan.some(x=>collision(item,x)))continue;
         plan.push(item);usedIds.add(item.taskId);used+=len;break;
       }
       if(used>=budget)break;
     }
   }
   for(const t of open)if(!usedIds.has(String(t.id)))skipped.push({taskId:String(t.id),title:cleanText(t.text||t.title||'Tarefa')});
   return {ok:true,items:plan,skipped,considered:open.length,daysAvailable:dates.filter(x=>days==='todos'||(x.day!==0&&x.day!==6)).length};
 }
 function validateWeek(items,events=[],now=Date.now()){
   if(!Array.isArray(items)||items.length===0||items.length>40)return {ok:false,error:'Nenhum bloco válido para adicionar.'};
   const occupied=(Array.isArray(events)?events:[]).map(eventSpan).filter(Boolean), seen=new Set();
   for(const x of items){
     const date=dateFromKey(x?.date),start=Number(x?.start),end=Number(x?.end),id=String(x?.taskId||'');
     if(!date||!id||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>1440||end-start<15||end-start>90||seen.has(id))return {ok:false,error:'Proposta inválida ou duplicada.'};
     seen.add(id);
     if(new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(start/60),start%60).getTime()<now-60000)return {ok:false,error:'Há um horário no passado. Gere novamente a proposta.'};
     const span={date:x.date,start,end,taskId:id};
     if(occupied.some(e=>collision(span,e)||e.taskId===id))return {ok:false,error:'A agenda mudou ou a tarefa já foi agendada. Gere a proposta novamente.'};
     if(items.some(y=>y!==x&&collision(span,y)))return {ok:false,error:'Os blocos da proposta se sobrepõem.'};
   }
   return {ok:true};
 }
 const allowed=/^(l18_|l32_|l33_|l35_|l42_|l49_|l60_|life_custom_workouts_v2$|life_free_custom_workout_v82$|life_theme$|life_last_area$|life_favorites_v4$|life_recents_v4$|life_pins_v4$|life_activity_v4$|life_ai_[a-z0-9_]+$|life_finance_[a-z0-9_]+$|life_food_[a-z0-9_]+$|life_capture_[a-z0-9_]+$|life_workout_[a-z0-9_]+$|life_goals_v1$|life_habits_v1$|lifeos_v5_tasks$|life_settings_v1$|life_notifications_v1$|life_reminders_v1$|life_notification_prefs_v1$|life_training_age$|life_study_[a-z0-9_]+$|life_org_[a-z0-9_]+$|life_weather_[a-z0-9_]+$|life_home_hidden_v121$|life_pantry_v4$|life_product_events_v1$|life_first_value_done$|life_local_dirty_at$|life_trash_v1$|life_system_errors_v9$|life_form_[a-z0-9_]+$|life_weekly_preferences_v124$|life13_preferences_v1$)/;
 function validateBackup(bundle){
   if(!bundle||typeof bundle!=='object'||Array.isArray(bundle)||!bundle.data||typeof bundle.data!=='object'||Array.isArray(bundle.data))return {ok:false,error:'Formato de backup inválido.'};
   if(!Number.isFinite(Number(bundle.version))||Number(bundle.version)<1||Number(bundle.version)>12)return {ok:false,error:'Versão de backup incompatível.'};
   if(typeof bundle.updatedAt!=='string'||!Number.isFinite(Date.parse(bundle.updatedAt)))return {ok:false,error:'Data do backup inválida.'};
   const entries=Object.entries(bundle.data);
   if(entries.length===0||entries.length>400)return {ok:false,error:'Quantidade de entradas inválida.'};
   let total=0;
   for(const [k,v] of entries){
      if(!allowed.test(k)||typeof v!=='string')return {ok:false,error:'Backup contém campos não reconhecidos.'};
      total+=k.length+v.length*2;
      if(v.length>1500000||total>5500000)return {ok:false,error:'Arquivo de backup excede o limite permitido.'};
   }
   return {ok:true,count:entries.length};
 }
 function escapeCSV(value){const t=String(value??'').replace(/\r\n?/g,'\n');const safe=/^[\s]*[=+\-@\t]/.test(t)?"'"+t:t;return '"'+safe.replace(/"/g,'""')+'"';}
 function csvTable(headers,rows){if(!Array.isArray(headers)||!Array.isArray(rows)||headers.length>20||rows.length>5000)throw new Error('Limite de exportação excedido');return '\ufeff'+[headers,...rows].map(row=>row.map(escapeCSV).join(';')).join('\r\n');}
 function exportTasks(tasks=[]){return csvTable(['Título','Categoria','Prioridade','Status','Prazo'],(Array.isArray(tasks)?tasks:[]).slice(0,5000).map(t=>[t.text||t.title||'',t.category||'',t.priority||'',t.done||t.completed?'Concluída':'Pendente',t.dueAt||t.due||'']));}
 function exportActivity(activity=[]){return csvTable(['Data','Área','Tipo','Descrição'],(Array.isArray(activity)?activity:[]).slice(0,5000).map(x=>[x.date||'',x.go||'',x.type||'',x.title||'']));}
 function dailySeries(activity=[],days=14,now=Date.now()){
   const n=Math.max(7,Math.min(30,Math.floor(Number(days)||14))),today=new Date(now),day=new Date(today.getFullYear(),today.getMonth(),today.getDate());
   const bins=Array.from({length:n},(_,i)=>{const d=new Date(day.getFullYear(),day.getMonth(),day.getDate()-(n-1-i));return {date:localKey(d),count:0,label:pad(d.getDate())+'/'+pad(d.getMonth()+1)};});
   const byKey=new Map(bins.map((b,i)=>[b.date,i]));for(const x of Array.isArray(activity)?activity:[]){const raw=String(x?.date||'').trim();const plain=/^\d{4}-\d{2}-\d{2}$/.test(raw);const t=plain?dateFromKey(raw):new Date(raw);if(!t||Number.isNaN(t.getTime())||t.getTime()>now)continue;const index=byKey.get(localKey(t));if(index!==undefined)bins[index].count++;}return bins;
 }
 return Object.freeze({buildWeek,validateWeek,validateBackup,csvTable,exportTasks,exportActivity,dailySeries,localKey,allowed});
});
