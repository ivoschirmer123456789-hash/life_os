(function(){
  const errorKey='life_runtime_errors_v1';
  const storeError=(kind,value)=>{try{const list=JSON.parse(localStorage.getItem(errorKey)||'[]');list.unshift({kind,message:String(value?.message||value||'Erro desconhecido').slice(0,300),at:new Date().toISOString(),path:location.pathname});localStorage.setItem(errorKey,JSON.stringify(list.slice(0,25)))}catch(e){}};
  window.addEventListener('error',e=>storeError('error',e.error||e.message));
  window.addEventListener('unhandledrejection',e=>storeError('promise',e.reason));
  let installPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;window.dispatchEvent(new CustomEvent('life:pwa-ready'));});
  window.addEventListener('appinstalled',()=>{installPrompt=null;try{localStorage.setItem('life_pwa_installed','1')}catch(e){}});
  window.lifeInstallPWA=async function(){
    if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)return true;
    if(!installPrompt)return false;
    try{installPrompt.prompt();const choice=await installPrompt.userChoice;installPrompt=null;return choice?.outcome==='accepted'}catch(e){storeError('pwa-install',e);return false}
  };
})();
