/* LIFE OS 15.7.2 · Modo convidado sem conta e sem persistência de dados.
 * Instalar ANTES de qualquer script do aplicativo ou da autenticação.
 * Dados ficam apenas na memória da página: atualizar, sair ou fechar descarta tudo.
 * A única marca no sessionStorage nativo é o seletor técnico de modo, nunca dados pessoais.
 */
(function () {
  'use strict';
  const FLAG = 'life_guest_mode_tab_v1572';
  let realTab;
  try { realTab = window.sessionStorage; } catch (_) { realTab = null; }
  const enabled = !!(realTab && realTab.getItem(FLAG) === '1');
  const api = {
    active: false,
    available: !!realTab,
    enter: function () {
      if (!realTab) return false;
      try {
        realTab.setItem(FLAG, '1');
        window.location.reload();
        return true;
      } catch (_) { return false; }
    },
    exit: function () {
      try { realTab && realTab.removeItem(FLAG); } catch (_) {}
      // Descartar todos os dados temporários sem copiar nada para armazenamento real.
      window.location.reload();
    }
  };
  window.lifeGuest = api;
  if (!enabled) return;

  function memoryStorage() {
    const data = new Map();
    const methods = {
      get length() { return data.size; },
      clear() { data.clear(); },
      key(n) { return [...data.keys()][Number(n)] ?? null; },
      getItem(k) { k = String(k); return data.has(k) ? data.get(k) : null; },
      setItem(k, v) { data.set(String(k), String(v)); },
      removeItem(k) { data.delete(String(k)); }
    };
    return new Proxy(methods, {
      get(target, key) {
        if (Reflect.has(target, key)) return Reflect.get(target, key);
        return typeof key === 'string' && data.has(key) ? data.get(key) : undefined;
      },
      set(target, key, value) {
        if (typeof key === 'string' && !Reflect.has(target, key)) {
          data.set(key, String(value)); return true;
        }
        return false;
      },
      deleteProperty(target, key) { data.delete(String(key)); return true; },
      ownKeys() { return [...data.keys(), ...Reflect.ownKeys(methods)]; },
      getOwnPropertyDescriptor(target, key) {
        if (Reflect.has(target, key)) return Reflect.getOwnPropertyDescriptor(target, key);
        return data.has(key) ? {configurable: true, enumerable: true, writable: true, value: data.get(key)} : undefined;
      },
      has(target, key) { return Reflect.has(target,key) || data.has(String(key)); }
    });
  }

  // A falha em isolar um dos dois armazenamentos cancela o acesso de convidado,
  // sem tocar nos dados e sessões já existentes.
  try {
    const guestLocal = memoryStorage();
    const guestTab = memoryStorage();
    const localDesc = Object.getOwnPropertyDescriptor(window,'localStorage');
    const tabDesc = Object.getOwnPropertyDescriptor(window,'sessionStorage');
    if ((localDesc && !localDesc.configurable) || (tabDesc && !tabDesc.configurable)) throw new Error('storage_not_configurable');
    Object.defineProperty(window,'localStorage', {configurable:true, enumerable:true, get:()=>guestLocal});
    Object.defineProperty(window,'sessionStorage', {configurable:true, enumerable:true, get:()=>guestTab});
    if(window.localStorage !== guestLocal || window.sessionStorage !== guestTab) throw new Error('storage_override_not_verified');
    api.active = true;
    document.documentElement.dataset.lifeGuest = 'true';
    document.documentElement.dataset.lifePlan = 'FREE';
  } catch (_) {
    if (realTab) try { realTab.removeItem(FLAG); } catch (__) {}
    // Não permitir que o app continue parcialmente em modo convidado.
    api.active = false;
    api.available = false;
    api.enter = function(){ return false; };
    api.exit = function(){ window.location.reload(); };
    document.documentElement.dataset.lifeGuest = 'unavailable';
    const m = document.createElement('meta'); m.name='life-guest-unavailable'; m.content='true';
    document.head.appendChild(m);
    window.addEventListener('load', function(){
      const msg=document.getElementById('la-msg');
      if(msg)msg.textContent='O modo convidado não está disponível neste navegador. Entre com uma conta para continuar.';
    }, {once:true});
  }
})();
