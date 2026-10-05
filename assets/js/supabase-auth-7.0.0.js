(async function(){
const URL='https://hyakbyxkhbruybjuczvo.supabase.co', KEY='sb_publishable_yx17nsbW7vyMut_LYM5OYA_iC40kSYt';
window.LIFE_BACKEND={supabaseUrl:URL,publishableKey:KEY};
if(!window.supabase || typeof window.supabase.createClient!=='function'){
  const authEl=document.getElementById('life-auth'),msgEl=document.getElementById('la-msg');
  if(authEl)authEl.classList.remove('hidden');
  if(msgEl)msgEl.textContent='Não foi possível carregar a conexão da conta. Verifique sua internet e recarregue o LIFE.';
  return;
}
const db=window.supabase.createClient(URL,KEY); window.lifeSupabase=db;
const authStoreGet=(key,fallback='')=>{try{const v=localStorage.getItem(key);return v===null?fallback:v}catch(_){return fallback}};
const authStoreSet=(key,value)=>{try{localStorage.setItem(key,value);return true}catch(_){return false}};
const auth=document.getElementById('life-auth'),msg=document.getElementById('la-msg'),email=document.getElementById('la-email'),pass=document.getElementById('la-password'),owner=document.getElementById('life-owner-open'),chip=document.getElementById('life-account-chip'); let plan='FREE',me=null,forcedAuthView=null;
const say=t=>msg.textContent=t||'';
window.lifeProductEvent=window.lifeProductEvent||function(name,meta={}){try{const event={id:Date.now()+'_'+Math.random().toString(36).slice(2,6),name:String(name||'event').slice(0,80),meta:Object.fromEntries(Object.entries(meta||{}).slice(0,12).map(([k,v])=>[String(k).slice(0,40),String(v).slice(0,120)])),at:new Date().toISOString()};const key='life_product_events_v1',rows=JSON.parse(localStorage.getItem(key)||'[]');rows.unshift(event);localStorage.setItem(key,JSON.stringify(rows.slice(0,200)));Promise.resolve().then(async()=>{try{const client=window.lifeSupabase;if(!client)return;const {data:{session}}=await client.auth.getSession();if(!session?.user)return;await client.from('product_events').insert({user_id:session.user.id,event_name:event.name,meta:event.meta})}catch(e){}})}catch(e){}};
const authTheme=()=>authStoreGet('life_theme','night')==='day'?'day':'night';document.documentElement.dataset.lifeTheme=authTheme();const authThemeBtn=document.getElementById('la-theme-toggle');if(authThemeBtn)authThemeBtn.onclick=()=>{const next=authTheme()==='day'?'night':'day';authStoreSet('life_theme',next);document.documentElement.dataset.lifeTheme=next;window.dispatchEvent(new CustomEvent('life:theme-auth',{detail:{theme:next}}));};
const friendly=(e,kind='')=>{const m=(e&&e.message||'').toLowerCase();if(m.includes('already registered')||m.includes('already been registered')||m.includes('user already'))return 'Este e-mail já está cadastrado.';if(m.includes('invalid login credentials'))return 'E-mail ou senha incorretos.';if(m.includes('email not confirmed'))return 'Confirme seu e-mail antes de entrar.';if(m.includes('invalid email'))return 'Digite um e-mail válido.';if(m.includes('password')&&(m.includes('6')||m.includes('short')))return 'A senha precisa ter pelo menos 6 caracteres.';if(m.includes('rate limit'))return 'Muitas tentativas. Aguarde um pouco e tente novamente.';return kind==='signup'?'Não foi possível criar a conta. Confira os dados e tente novamente.':'Não foi possível concluir. Tente novamente.'};
const main=document.getElementById('la-main'),signupView=document.getElementById('la-signup-view'),recovery=document.getElementById('la-recovery'),newPassword=document.getElementById('la-new-password');function authView(v){main.style.display=v==='main'?'block':'none';signupView.style.display=v==='signup'?'block':'none';recovery.style.display=v==='recovery'?'block':'none';newPassword.style.display=v==='new'?'block':'none';say('')}
async function profile(user){
  me=user;
  if(!user){
    window.lifeLastSupabaseProfile=null;
    auth.classList.remove('hidden');
    owner.style.display='none';
    chip.style.display='none';
    window.dispatchEvent(new CustomEvent('life:supabase-profile',{detail:{user:null,plan:'FREE',rawPlan:'FREE',proUntil:null,subscriptionStatus:null}}));
    if(forcedAuthView)authView(forcedAuthView);
    return;
  }

  let result=await db.from('profiles').select('plan,pro_until,subscription_status').eq('id',user.id).single();
  if(result.error)result=await db.from('profiles').select('plan,pro_until').eq('id',user.id).single();
  if(result.error){
    // Falha de rede/RLS não deve prender a pessoa no login. Abrimos com o nível seguro FREE.
    plan='FREE';
    chip.textContent=plan; chip.style.display='block'; owner.style.display='none';
    document.documentElement.dataset.lifePlan=plan;
    const detail={user,plan:'FREE',rawPlan:'FREE',proUntil:null,subscriptionStatus:null,profileError:true};
    window.lifeLastSupabaseProfile=detail;
    window.dispatchEvent(new CustomEvent('life:supabase-profile',{detail}));
    if(forcedAuthView){auth.classList.remove('hidden');authView(forcedAuthView);}else{auth.classList.add('hidden');}
    say('');
    return;
  }
  const data=result.data||{},rawPlan=String(data.plan||'FREE').toUpperCase(),expiry=data.pro_until?new Date(data.pro_until).getTime():null,status=data.subscription_status?String(data.subscription_status).toLowerCase():null,validUntil=!data.pro_until||(Number.isFinite(expiry)&&expiry>Date.now()),expiredStatus=['expired','refunded','revoked'].includes(status||'');
  plan=rawPlan==='OWNER'?'OWNER':(rawPlan==='PRO'&&validUntil&&!expiredStatus?'PRO':'FREE');
  chip.textContent=plan;
  chip.style.display='block';
  owner.style.display=plan==='OWNER'?'block':'none';
  document.getElementById('lov-access').textContent=plan;
  document.documentElement.dataset.lifePlan=plan;

  // Fonte única da verdade: Supabase -> interface principal do LIFE.
  const detail={user,plan,rawPlan,proUntil:data.pro_until||null,subscriptionStatus:status};
  window.lifeLastSupabaseProfile=detail;
  window.dispatchEvent(new CustomEvent('life:supabase-profile',{detail}));

  if(forcedAuthView){
    auth.classList.remove('hidden');
    authView(forcedAuthView);
  }else{
    auth.classList.add('hidden');
  }
}
document.getElementById('la-login').onclick=async()=>{window.lifeExplicitAuth=true;say('Entrando…');const {data,error}=await db.auth.signInWithPassword({email:email.value.trim(),password:pass.value});if(error){say(friendly(error,'login'));return}pass.value='';say('');forcedAuthView=null;window.lifeProductEvent&&window.lifeProductEvent('login_success',{});await profile(data.user)};
document.getElementById('la-signup').onclick=async()=>{document.getElementById('la-signup-email').value=email.value.trim();await window.lifeOpenAuth('signup')};
document.getElementById('la-signup-back').onclick=()=>authView('main');
document.getElementById('la-create-account').onclick=async()=>{window.lifeExplicitAuth=false;const se=document.getElementById('la-signup-email').value.trim(),sp=document.getElementById('la-signup-password').value,sp2=document.getElementById('la-signup-password2').value;if(!se){say('Digite seu e-mail.');return}if(sp.length<6){say('A senha precisa ter pelo menos 6 caracteres.');return}if(sp!==sp2){say('As senhas não são iguais.');return}say('Criando conta…');const {data:{session:existingSession}}=await db.auth.getSession();if(existingSession)await db.auth.signOut();forcedAuthView='signup';const {data,error}=await db.auth.signUp({email:se,password:sp});if(error){say(friendly(error,'signup'));return}document.getElementById('la-signup-password').value='';document.getElementById('la-signup-password2').value='';const needsConfirmation=!data.session;if(data.session){await db.auth.signOut();}window.lifeProductEvent&&window.lifeProductEvent('account_created',{});say(needsConfirmation?'Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre normalmente.':'Conta criada com sucesso. Entre normalmente com seu e-mail e senha.');};
document.getElementById('la-forgot').onclick=()=>{document.getElementById('la-recovery-email').value=email.value.trim();authView('recovery')};document.getElementById('la-back').onclick=()=>authView('main');document.getElementById('la-send-recovery').onclick=async()=>{const re=document.getElementById('la-recovery-email').value.trim();if(!re){say('Digite seu e-mail.');return}say('Enviando…');const {error}=await db.auth.resetPasswordForEmail(re,{redirectTo:location.origin+location.pathname});if(error){say(friendly(error));return}say('Enviamos a recuperação para seu e-mail. Abra a mensagem do LIFE e siga a confirmação.')};document.getElementById('la-save-pass').onclick=async()=>{const a=document.getElementById('la-new-pass').value,b=document.getElementById('la-new-pass2').value;if(a.length<6){say('A nova senha precisa ter pelo menos 6 caracteres.');return}if(a!==b){say('As senhas não são iguais.');return}say('Salvando…');const {error}=await db.auth.updateUser({password:a});if(error){say(friendly(error));return}say('Senha alterada com sucesso.');setTimeout(()=>authView('main'),900)};db.auth.onAuthStateChange((event,s)=>{if(event==='PASSWORD_RECOVERY'){auth.classList.remove('hidden');authView('new')}});
window.lifeOpenAuth=async(mode='main')=>{
  forcedAuthView=mode;
  window.lifeAuthIntent=mode;
  if(mode==='main'||mode==='signup') window.lifeExplicitAuth=true;
  auth.classList.remove('hidden');
  authView(mode);
  if(mode==='signup'){
    chip.style.display='none';
    owner.style.display='none';
    document.getElementById('la-signup-email').focus();
  }
};
const {data:{session}}=await db.auth.getSession();await profile(session&&session.user);db.auth.onAuthStateChange((_e,s)=>setTimeout(()=>profile(s&&s.user),0));
const panel=document.getElementById('life-owner-panel'),close=document.getElementById('life-owner-close');window.lifeOpenOwnerControl=async()=>{if(plan!=='OWNER')return;panel.classList.add('open');panel.setAttribute('aria-hidden','false');await ownerData()};owner.onclick=window.lifeOpenOwnerControl;close.onclick=()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true')};
document.querySelectorAll('[data-lovtab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-lovtab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');['users','plans','preview'].forEach(x=>document.getElementById('lov-'+x).style.display=x===b.dataset.lovtab?'block':'none')});
const status=document.getElementById('lov-preview-status');let mode=authStoreGet('life_owner_preview','OWNER')||'OWNER';function paint(){if(status)status.textContent='Visualização atual: '+mode;document.querySelectorAll('[data-preview]').forEach(b=>b.classList.toggle('active',b.dataset.preview===mode))}document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{mode=b.dataset.preview;authStoreSet('life_owner_preview',mode);paint();window.dispatchEvent(new CustomEvent('life:owner-preview',{detail:{mode}}))});paint();
async function ownerData(){const box=document.getElementById('lov-real-users');box.innerHTML='<div class="lov-muted" style="padding:14px 0">Carregando…</div>';const {data,error}=await db.from('profiles').select('id,plan,created_at').order('created_at',{ascending:true});if(error){box.innerHTML='<div class="lov-muted" style="padding:14px 0">Login OWNER funcionando. Para listar todas as contas ainda falta liberar a política OWNER no banco.</div>';return}const rows=Array.isArray(data)?data:[];const planOf=x=>String(x?.plan||'FREE').toUpperCase();document.getElementById('lov-total').textContent=rows.length;document.getElementById('lov-free').textContent=rows.filter(x=>planOf(x)==='FREE').length;document.getElementById('lov-pro').textContent=rows.filter(x=>planOf(x)==='PRO').length;box.innerHTML=rows.map((x,i)=>{const p=planOf(x),dt=new Date(x.created_at);const ds=Number.isNaN(dt.getTime())?'Data indisponível':dt.toLocaleDateString('pt-BR');return '<div class="lov-row"><div class="lov-user"><b>'+(x.id===me?.id?'Você':'Usuário '+String(i+1).padStart(2,'0'))+'</b><span>'+ds+'</span></div><span class="lov-badge '+(p==='PRO'?'lov-pro':p==='OWNER'?'lov-owner':'')+'">'+p+'</span></div>'}).join('')}
})();
