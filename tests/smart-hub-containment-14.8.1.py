"""Layout regression on a representative DOM using the exact production CSS.
Run from anywhere with `python tests/smart-hub-containment-14.8.1.py`.
Requires playwright Python and Chromium installed.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
html=(root/'tests/fixtures/smart-hub.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="/(assets/css/[^"]+)">', lambda m: '<style>'+ (root/m.group(1).split('?')[0]).read_text(encoding='utf-8') + '</style>', html)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    checks = 0
    for width in [360, 390, 412, 768, 1024, 1440]:
        for theme in ['night', 'day']:
            page = browser.new_page(viewport={'width': width, 'height': 820})
            page.set_content(html, wait_until="load")
            if theme == 'day':
                page.evaluate("document.documentElement.classList.add('life-theme-day')")
            m = page.evaluate('''() => {
              const hub=document.getElementById('hub'), suggestions=document.getElementById('suggest'), modal=document.getElementById('modal');
              const a=hub.getBoundingClientRect(), b=suggestions.getBoundingClientRect();
              const h=document.getElementById('modal-title').getBoundingClientRect();
              const topElement=document.elementFromPoint(Math.max(0,Math.min(innerWidth-3,a.left+20)),Math.max(0,Math.min(innerHeight-3,a.top+20)));
              return {
                card: a.toJSON(), suggestion: b.toJSON(),
                pos:getComputedStyle(suggestions).position, z:getComputedStyle(hub).zIndex,
                modalOnTop:modal.contains(topElement),
                formAccessible:document.elementFromPoint(h.left+h.width/2,h.top+h.height/2)?.closest('.v27-modal')===modal,
                viewport:document.documentElement.clientWidth,
                scrollWidth:document.documentElement.scrollWidth
              };
            }''')
            tests = {
                'card in viewport': m['card']['left'] >= -1 and m['card']['right'] <= width+1,
                'suggestions in card': m['suggestion']['left'] >= m['card']['left']-1 and m['suggestion']['right'] <= m['card']['right']+1 and m['suggestion']['bottom'] <= m['card']['bottom']+1,
                'suggestions in document flow': m['pos'] == 'static',
                'form above hub': m['modalOnTop'],
                'question accessible': m['formAccessible'],
                'no horizontal overflow': m['scrollWidth'] <= m['viewport']+1,
            }
            for name, result in tests.items():
                assert result, f'{width}px {theme} {name} failed: {m}'
                checks += 1
            if width == 390 and theme == 'night':
                page.screenshot(path='/mnt/data/LIFE_OS_14_8_1_TESTE_390.png', full_page=True)
            page.close()
    browser.close()
    print(f'{checks} checks on 12 layout/theme scenarios passed')
