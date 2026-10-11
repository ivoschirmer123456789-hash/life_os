"""Static browser smoke on real login markup (no Supabase network or authenticated flows)."""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).parent
soup=BeautifulSoup((ROOT/'index.html').read_text(),'html.parser')
auth=soup.find(id='life-auth')
if auth is None: raise AssertionError('auth screen missing')
# Only CSS used by actual deployment; inline to avoid blocked local file URLs in sandbox.
styles='\n'.join((ROOT/n).read_text() for n in [
    'assets/css/life-bundle-9.4.2.css',
    'assets/css/design-system-9.4.2.css',
    'assets/css/signature-9.4.2.css',
    'assets/css/apex-9.4.2.css',
    'assets/css/release-12.5.css',
    'assets/css/release-12.6.css',
])
fragment=f'''<!doctype html><html lang="pt-BR" class="dark"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>{styles}</style></head><body class="tech-bg"><main>{str(auth)}</main></body></html>'''
js=(ROOT/'assets/js/life-production-12.6.js').read_text()
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in [360,390,768,1440]:
        page=browser.new_page(viewport={'width':width,'height':900})
        page.set_content(fragment,wait_until='domcontentloaded')
        page.evaluate('''() => {
          const a=document.getElementById('life-auth');
          a.classList.remove('hidden');
          a.style.display='';
        }''')
        page.add_script_tag(content=js)
        assert page.locator('#la-email').count() == 1
        assert page.locator('#la-login').count() == 1
        assert page.locator('#la-password').get_attribute('type') == 'password'
        ok=page.evaluate("LifeProduction126.requestGuard({loggedIn:true,role:'FREE',checkoutUrl:'https://www.mercadopago.com.br/checkout'})")
        assert ok['ok'] is True
        bad=page.evaluate("LifeProduction126.requestGuard({loggedIn:true,role:'FREE',checkoutUrl:'https://mercadopago.com.br.evil.example'})")
        assert bad['ok'] is False
        scroll=page.evaluate('''() => ({body:document.body.scrollWidth, doc:document.documentElement.scrollWidth, viewport:window.innerWidth})''')
        # Existing auth shell can scroll vertically, but must not require sideways scroll.
        assert scroll['doc'] <= scroll['viewport'] + 8, f'horizontal overflow at {width}: {scroll}'
        results.append({'width':width,'auth_present':True,'guard_ok':True,'no_horizontal_overflow':True})
        page.close()
    browser.close()
print(json.dumps(results,ensure_ascii=False))
print('PASS: 4 visual/DOM smoke tests. Does NOT exercise authenticated app, Supabase or payments.')
