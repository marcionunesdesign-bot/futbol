import asyncio,base64
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':1280,'height':720})).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(2500)
    await pg.evaluate("MV.pause();document.querySelectorAll('.intro').forEach(e=>e.remove());cancelAnimationFrame(__MVst.raf);__MVst.rd.introT=0")
    for k in [.55,.8,.86,.92]:
      d=await pg.evaluate(f"""(()=>{{const H=__MVst.rd,E=H.eng;cancelAnimationFrame(__MVst.raf);let v=H.r2.view();if(v.flip)v=H.r2.flipView(v);for(let i=0;i<3;i++)E.draw(v,1/60,H.r2.info,1,{k});return E.cv.toDataURL('image/jpeg',.85)}})()""")
      open(f'/tmp/k_{int(k*100)}.jpg','wb').write(base64.b64decode(d.split(',')[1]))
    print(errs[:3]);await b.close()
asyncio.run(main())
