import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(1000)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('#mv-full').click()");await pg.wait_for_timeout(7000)
    await pg.evaluate("const i=document.querySelector('.intro');i&&i.click()");await pg.wait_for_timeout(5000)
    await pg.screenshot(path='/tmp/cam1.png')
    
    for k in range(4):
      await pg.wait_for_timeout(7000);await pg.screenshot(path=f'/tmp/camx{k}.png')
    print(errs[:3]);await b.close()
asyncio.run(main())
