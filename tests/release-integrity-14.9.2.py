from pathlib import Path
import subprocess,re,json,zipfile
from urllib.parse import unquote
root=Path(__file__).resolve().parent.parent
assert root.joinpath('index.html').exists()
html=(root/'index.html').read_text()
version='15.0.1'
assert f'content="{version}"' in html
assert f"version:'{version}'" in (root/'assets/js/config-9.4.2.js').read_text()
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
