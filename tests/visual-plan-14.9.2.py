from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
css=(root/'assets/css/training-nutrition-visual-14.9.1.css').read_text()
fixture='''<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;background:#090b0e;color:#fff;font-family:system-ui}.life-nut-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.v27-plan{display:grid;gap:12px}*{box-sizing:border-box}</style><style>'''+css+'''</style></head><body><main>
<div class="life-nut-grid life-clean-grid-v149">'''+''.join(f'<article class="life-clean-card-v149" style="padding:14px;border-radius:15px"><small>0{i}</small><h3>Bloco {i}</h3><p>Explicação curta que não atravessa a borda.</p></article>' for i in range(1,5))+'''</div>
<div class="life-clean-summary-v149" style="margin-top:12px">'''+''.join(f'<div><small>INDICADOR</small><b>{i}</b></div>' for i in range(4))+'''</div>
<div class="v27-plan"><article class="life-day-card-v149"><b>Treino personalizado · Terça</b><div class="life-plan-ex-grid-v149">'''+''.join(f'<article class="life-plan-ex-card-v149"><div class="life-plan-ex-thumb-v149 fallback"><span>●</span></div><div class="life-plan-ex-content-v149"><div class="life-plan-ex-top-v149"><small>OMBROS</small><b>Desenvolvimento com halteres</b></div><div class="life-plan-ex-chips-v149"><span>3 séries</span><span>8–12 repetições</span></div><p class="life-plan-ex-note-v149">Consulte a técnica e o vídeo quando disponível.</p><div class="life-plan-ex-actions-v149"><button>COMO FAZER</button><button>PROCURAR VÍDEO</button></div></div></article>' for i in range(3))+'''</div></article></div>
<div class="life-meal-grid-v149">'''+''.join(f'<article class="life-meal-card-v149"><div class="life-meal-icon-v149">☀</div><div class="life-meal-content-v149"><small>REFEIÇÃO</small><b>Almoço com variedade</b><p>Refeição simples que cabe na sua rotina sem restrições rígidas.</p></div></article>' for i in range(4))+'''</div>
</main></body></html>'''
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
  n=0
  for w in [320,390,768,1440]:
    for theme in ['night','day']:
      page=b.new_page(viewport={'width':w,'height':900})
      page.set_content(fixture,wait_until='load')
      if theme=='day':page.evaluate("document.documentElement.classList.add('life-theme-day')")
      page.locator('.life-plan-ex-actions-v149 button').first.scroll_into_view_if_needed()
      dimension=page.evaluate('''()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,grid:getComputedStyle(document.querySelector('.life-clean-grid-v149')).gridTemplateColumns,boxes:Array.from(document.querySelectorAll('.life-plan-ex-card-v149')).map(x=>Math.ceil(x.getBoundingClientRect().width)),buttonHit:document.elementFromPoint(document.querySelector('.life-plan-ex-actions-v149 button').getBoundingClientRect().left+8,document.querySelector('.life-plan-ex-actions-v149 button').getBoundingClientRect().top+8)?.tagName,cardColor:getComputedStyle(document.querySelector('.life-clean-card-v149')).backgroundImage})''')
      assert dimension['width']<=dimension['viewport']+2,(w,theme,dimension)
      assert dimension['buttonHit']=='BUTTON',(w,theme,dimension)
      assert max(dimension['boxes'])<=w-16,(w,theme,dimension)
      assert 'rgb(255, 255, 255)' in dimension['cardColor'] if theme=='day' else 'rgba(18, 20, 28' in dimension['cardColor'],(w,theme,dimension)
      n+=1
      print('PASS',w,theme,'no horizontal overflow; actionable buttons; theme rendered')
      page.close()
  b.close()
  print('PASS',n,'browser layout checks (isolated fixture; not full authenticated app)')
