(function(){
  // Friendly command shortcut: Ctrl/Cmd+K already exists; '/' opens it when not typing.
  window.addEventListener('keydown',function(e){
    const tag=(e.target&&e.target.tagName||'').toLowerCase();
    if(e.key==='/' && !['input','textarea','select'].includes(tag)){
      const btn=document.querySelector('button[aria-label="Abrir busca global"]');
      if(btn){e.preventDefault();btn.click();}
    }
  });
  // Mark an install/session quality event without collecting content written by the user.
  window.addEventListener('appinstalled',()=>window.lifeProductEvent&&window.lifeProductEvent('pwa_installed',{}));
})();
