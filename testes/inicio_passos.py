import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'m'),(1366,800,'d')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<500,has_touch=w<500,device_scale_factor=2);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1000)
      await pg.screenshot(path=f'/tmp/ns_{nm}_0.png')
      await pg.click('[data-ns=div]');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/ns_{nm}_1.png')
      await pg.click('[data-div=D]');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/ns_{nm}_2a.png')
      await pg.click('[data-pick]:nth-child(5)');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/ns_{nm}_2.png')
      await pg.go_back();await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/ns_{nm}_back.png');print(nm,'voltar do aparelho no passo 2 ->',await pg.evaluate("document.querySelector('.ns-in').className"))
      await pg.click('[data-div=D]');await pg.wait_for_timeout(300);await pg.click('[data-pick]:nth-child(5)');await pg.click('.ns-bar .btn');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/ns_{nm}_3.png')
      await pg.fill('#s-name','Márcio');await pg.click('#s-go');await pg.wait_for_timeout(1500)
      print(nm,'começou:',await pg.evaluate("document.querySelector('#start').hidden"),await pg.evaluate("C11.G.user+' / '+C11.G.manager"))
      await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1200)
      st=await pg.evaluate("document.querySelector('#start').hidden")
      if st:
        await pg.evaluate("U.closeModal&&U.closeModal()");await pg.evaluate("document.querySelector('#b-menu').click()");await pg.wait_for_timeout(300)
      print(nm,'abre direto na carreira:',st,errs[:3])
      await ctx.close()
    await b.close()
asyncio.run(main())
