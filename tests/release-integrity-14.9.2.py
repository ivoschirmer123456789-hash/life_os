from pathlib import Path
import subprocess,re,json,zipfile
from urllib.parse import unquote
root=Path(__file__).resolve().parent.parent
assert root.joinpath('index.html').exists()
html=(root/'index.html').read_text()
version='15.8.5'
assert f'content="{version}"' in html
assert f"version:'{version}'" in (root/'assets/js/config-15.7.1.js').read_text()
assert version in json.loads((root/'manifest.webmanifest').read_text())['name']
sw=(root/'service-worker.js').read_text()
assert f"ASSET_BUILD='{version}'" in sw
missing=[];references=[]
for link in re.findall(r'(?:src|href)="((?:assets/)[^"?]+)',html):
 references.append(link)
 if not (root/link).is_file():missing.append(link)
assert not missing,missing
swassets=re.findall(r"'\./([^']+)'",sw[sw.index('const SHELL='):sw.index('];')])
missing=[x for x in swassets if not (root/x).exists() and x not in ('', './')]
assert not missing,missing
assert 'assets/css/training-nutrition-visual-14.9.1.css' in swassets
scripts=list((root/'assets/js').glob('*.js'))+[root/'service-worker.js']
for script in scripts:
 p=subprocess.run(['node','--check',str(script)],capture_output=True,text=True)
 assert p.returncode==0,(script,p.stderr)
assert len(list((root/'assets/css').glob('*.css')))>=21
css=(root/'assets/css/training-nutrition-visual-14.9.1.css').read_text()
assert css.count('{')==css.count('}')
assert '.life-theme-day' in css
from tinycss2 import parse_stylesheet
errors=[t for t in parse_stylesheet(css,skip_comments=True,skip_whitespace=True) if t.type=='error']
assert not errors,errors
print('PASS',len(scripts),'JavaScript scripts syntax')
print('PASS',len(references),'HTML local asset links exist')
print('PASS',len(swassets),'SW precache paths exist')
print('PASS configuration, manifest, HTML and cache aligned')
print('PASS 21+ CSS, latest CSS syntax and dual-theme styles')


# LIFE OS 15.8.5 — structural control/checkout regression checks (not remote E2E)
app=(root/'assets/js/life-app-15.7.1.js').read_text()
assert app.count('React.createElement("button"') + app.count("React.createElement('button'") >= 600
assert "functions.invoke('mercadopago-create-checkout'" in app
assert "onClick:()=>startLifeProCheckout()" in app
assert "'ASSINAR O PRO'" in app
assert 'lifeCheckoutUrlFrom' in app and 'validCheckoutUrl(checkoutUrl)' in app
assert "'mercadopago-create-subscription'" not in app
assert 'LIFE_VALID_AREAS' in app
assert 'function validCheckoutUrl(' in (root/'assets/js/life-integrity-12.3.js').read_text()
assert (root/'supabase/functions/mercadopago-create-checkout/index.ts').exists()
assert 'life_apply_checkout_payment_v1585' in (root/'supabase/functions/mercadopago-create-checkout/index.ts').read_text()
assert 'mercadopago-checkout-webhook' in (root/'supabase/functions/mercadopago-create-checkout/index.ts').read_text()
assert not (root/'supabase/functions/mercadopago-create-subscription/index.ts').exists()
for page in ('landing.html','offline.html','privacy.html','support.html','terms.html'):
 assert (root/page).is_file()
print('PASS 12 checkout, CTA, pages, and action wiring regression guards')
