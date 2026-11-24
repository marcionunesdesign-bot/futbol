import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':1280,'height':720})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:200]));pg.on('console',lambda m:errs.append(m.text[:200]) if ('3D' in m.text or 'rror' in m.text) and 'Failed to load' not in m.text else None)
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000)
    await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/v_intro.png')
    await pg.wait_for_timeout(9000);await pg.screenshot(path='/tmp/v_play.png')
    E="C11Render3D.Hybrid.E"
    await pg.evaluate(f"{E}.setWeather('chuva');{E}.setFlares(true)");await pg.wait_for_timeout(2500);await pg.screenshot(path='/tmp/v_chuva.png')
    await pg.evaluate(f"{E}.setWeather('tarde')");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/v_tarde.png')
    # cartões no placar
    await pg.evaluate("const m=MV.m;m.ev('card',0,'teste');m.ev('sub',1,'teste')");await pg.wait_for_timeout(300)
    # impedimento
    await pg.evaluate("MV.m.flagT={t:MV.m.t,x:70,side:0}");await pg.wait_for_timeout(900);await pg.screenshot(path='/tmp/v_off.png')
    # chute forte com rastro
    for i in range(30):
      ok=await pg.evaluate("(()=>{const m=MV.m;if(m.ball.st==='own'&&!(m.dead>0)){m.shoot(m.ball.own);return true}return false})()")
      if ok:break
      await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(350);await pg.screenshot(path='/tmp/v_trail.png')
    # escanteio
    await pg.evaluate("MV.m.corner(0,true)");await pg.wait_for_timeout(1800);await pg.screenshot(path='/tmp/v_corner.png')
    # mapa de calor
    html=await pg.evaluate("MV.heatHtml()");print('heat',len(html))
    print(errs[:5]);await b.close()
asyncio.run(main())
