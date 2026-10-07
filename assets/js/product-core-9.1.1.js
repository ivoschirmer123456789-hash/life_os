(function(){
  'use strict';
  const VERSION='9.1.1';
  const KEY='life_system_errors_v9';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const pad=n=>String(n).padStart(2,'0');
  const dateKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const safeParse=(s,f)=>{try{return JSON.parse(s)}catch(_){return f}};
  const safeGet=(k,f=null)=>{try{const v=localStorage.getItem(k);return v==null?f:v}catch(_){return f}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(_){return false}};
  const captureError=(error,context='runtime')=>{
    try{
      const rows=safeParse(safeGet(KEY,'[]'),[])||[];
      rows.unshift({id:'err_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),context,message:String(error?.message||error||'unknown_error').slice(0,500),stack:String(error?.stack||'').slice(0,1500),at:new Date().toISOString(),version:VERSION,url:location.pathname});
      safeSet(KEY,JSON.stringify(rows.slice(0,40)));
    }catch(_){ }
  };
  const readErrors=()=>safeParse(safeGet(KEY,'[]'),[])||[];
  const clearErrors=()=>safeSet(KEY,'[]');
  const weekdayMap={domingo:0,segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6};
  function resolveDate(text,now=new Date()){
    const n=norm(text), d=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    if(/\bamanha\b/.test(n)){d.setDate(d.getDate()+1);return d;}
    if(/\bhoje\b/.test(n))return d;
    const iso=n.match(/\b(\d{4})-(\d{2})-(\d{2})\b/); if(iso){const x=new Date(+iso[1],+iso[2]-1,+iso[3]);if(!Number.isNaN(x.getTime()))return x;}
    const br=n.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/); if(br){let y=br[3]?+br[3]:d.getFullYear();if(y<100)y+=2000;const x=new Date(y,+br[2]-1,+br[1]);if(!Number.isNaN(x.getTime()))return x;}
    for(const [name,target] of Object.entries(weekdayMap)){
      if(new RegExp('\\b'+name+'(?:-feira)?\\b').test(n)){
        let delta=(target-d.getDay()+7)%7;if(delta===0)delta=7;d.setDate(d.getDate()+delta);return d;
      }
    }
    return null;
  }
  function extractTime(text){
    const n=norm(text);
    let m=n.match(/(?:\bas\s*)?(\d{1,2})(?::|h)(\d{2})?\b/);
    if(!m)m=n.match(/\b(\d{1,2})\s*(?:horas?|h)\b/);
    if(!m)return '';
    const h=Math.max(0,Math.min(23,+m[1]||0)),mi=Math.max(0,Math.min(59,+m[2]||0));return pad(h)+':'+pad(mi);
  }
  function extractDuration(text){const n=norm(text);let m=n.match(/\b(\d{1,3})\s*(?:min|minutos?)\b/);if(m)return Math.max(5,Math.min(360,+m[1]));m=n.match(/\b(\d{1,2})\s*(?:hora|horas)\b/);if(!m)m=n.match(/(?:\bpor\b|\bduracao\b)\s*(\d{1,2})\s*h\b/);return m?Math.max(15,Math.min(360,(+m[1])*60)):30;}
  function extractAmount(text){
    const m=String(text||'').match(/(?:r\$\s*)?(\d{1,6}(?:[.,]\d{1,2})?)(?=\s*(?:reais|real|r\$|$))/i);
    if(!m)return null; const n=Number(String(m[1]).replace('.','').replace(',','.')); return Number.isFinite(n)?n:null;
  }
  function categoryFor(text){
    const n=norm(text);
    if(/academia|treino|corrida|cardio|fitness|muscul/.test(n))return 'Fitness';
    if(/estud|escola|enem|prova|aula|curso|revis|faculdade|redacao|matemat/.test(n))return 'Estudos';
    if(/trabalho|reuniao|cliente|empresa|job|freela|entrega/.test(n))return 'Trabalho';
    if(/banco|fatura|boleto|pagamento|gasto|receita|dinheiro|financ/.test(n))return 'Finanças';
    if(/consulta|dentista|medic|exame|terapia|saude/.test(n))return 'Saúde';
    if(/sono|casa|limpeza|rotina|organizar/.test(n))return 'Rotina';
    return 'Pessoal';
  }
  function commandKind(text){
    const n=norm(text).trim();
    const cmd=n.match(/^\/(tarefa|nota|gasto|compromisso|evento|estudo|projeto)\b/);
    if(cmd){return {tarefa:'TAREFA',nota:'NOTA',gasto:'GASTO',compromisso:'EVENTO',evento:'EVENTO',estudo:'ESTUDO',projeto:'PROJETO'}[cmd[1]];}
    return '';
  }
  function parseQuickCapture(text,now=new Date()){
    const raw=String(text||'').trim(), n=norm(raw), forced=commandKind(raw), date=resolveDate(raw,now), time=extractTime(raw), duration=extractDuration(raw), hasDuration=/\b\d{1,3}\s*(?:min|minutos?|hora|horas)\b|(?:\bpor\b|\bduracao\b)\s*\d{1,2}\s*h\b/.test(n), amount=extractAmount(raw), category=categoryFor(raw);
    let kind=forced;
    if(!kind){
      if(/\b(gastei|paguei|comprei por|despesa|gasto)\b/.test(n)&&amount!=null)kind='GASTO';
      else if(date||time||/\b(reuniao|consulta|dentista|aula|compromisso|evento)\b/.test(n))kind='EVENTO';
      else if(/\b(projeto|entrega|versao|lancamento)\b/.test(n))kind='PROJETO';
      else if(/\b(estudar|estudo|prova|revisao|simulado|redacao|matematica)\b/.test(n))kind='ESTUDO';
      else if(/\b(nota|anotar|ideia|pensamento)\b/.test(n))kind='NOTA';
      else if(/\b(fazer|lembrar|resolver|enviar|ligar|tarefa)\b/.test(n))kind='TAREFA';
      else kind='INBOX';
    }
    let title=raw.replace(/^\/(?:tarefa|nota|gasto|compromisso|evento|estudo|projeto)\s*/i,'').trim();
    const repeat=/\btodo dia\b|\bdiariamente\b/.test(n)?'Diário':/\btoda semana\b|\bsemanalmente\b/.test(n)?'Semanal':/\btodo mes\b|\bmensalmente\b/.test(n)?'Mensal':'Nunca';
    const dateStr=date?dateKey(date):'';
    const dueAt=dateStr?(dateStr+'T'+(time||'09:00')+':00'):'';
    const pieces=[kind,category]; if(dateStr)pieces.push(dateStr); if(time)pieces.push(time); if(hasDuration)pieces.push(duration+' min'); if(amount!=null)pieces.push('R$ '+amount.toFixed(2).replace('.',',')); if(repeat!=='Nunca')pieces.push(repeat);
    return {raw,title:title||raw,kind,category,sector:category,date:dateStr,time,duration,amount,repeat,dueAt,summary:pieces.join(' · '),confidence:forced?1:(date||time||amount!=null?0.9:0.7)};
  }
  const lowEnd=(()=>{try{return (navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)}catch(_){return false}})();
  try{if(lowEnd)document.documentElement.classList.add('life-lite-auto');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('life-os-reduced-motion')}catch(_){ }
  window.addEventListener('error',e=>captureError(e.error||e.message,'window.error'));
  window.addEventListener('unhandledrejection',e=>captureError(e.reason,'unhandledrejection'));
  window.LIFE_PLAN_MATRIX=Object.freeze({FREE:Object.freeze({areas:['Hoje','Tarefas','Estudos','Fitness','Finanças']}),PRO:Object.freeze({areas:['Hoje','Tarefas','Notas','Estudos','Fitness','Receitas','Finanças','IA','Life','Evolução','Favoritos','Perfil']}),OWNER:Object.freeze({inherits:'PRO',admin:true})});
  window.LIFEProductCore={version:VERSION,norm,dateKey,parseQuickCapture,captureError,readErrors,clearErrors,lowEnd};
})();
