import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'m'),(1366,800,'d')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<500,has_touch=w<500);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/');await pg.wait_for_timeout(1200);await pg.click('.cta a.btn.pri');await pg.wait_for_timeout(1200)
      await pg.screenshot(path=f'/tmp/f3_{nm}_0.png');print(nm,'1ª vez, tela:',await pg.evaluate("document.querySelector('.ns-in').className"))
      for i in [2,7]:
        await pg.click('[data-ns=div]');await pg.click('[data-div=D]');await pg.click(f'[data-pick]:nth-child({i})');await pg.click('.ns-bar .ns-btn');await pg.fill('#s-name','Márcio');await pg.click('#s-go');await pg.wait_for_timeout(1300)
        await pg.goto('http://localhost:8769/conheca/');await pg.wait_for_timeout(800);await pg.click('.cta a.btn.pri');await pg.wait_for_timeout(1300)
      await pg.screenshot(path=f'/tmp/f3_{nm}_1.png')
      print(nm,'carreiras na lista:',await pg.evaluate("document.querySelectorAll('.ns-save').length"))
      # apagar não abre a carreira
      pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
      await pg.click('.ns-save:nth-child(2) .ns-del');await pg.wait_for_timeout(800);print(nm,'depois de apagar:',await pg.evaluate("document.querySelectorAll('.ns-save').length"),'continua no início:',await pg.evaluate("!document.querySelector('#start').hidden"))
      await pg.click('.ns-save:nth-child(1)',position={'x':120,'y':30});await pg.wait_for_timeout(1500);print(nm,'tocou na linha -> jogo aberto:',await pg.evaluate("document.querySelector('#start').hidden"),await pg.evaluate("C11.G.user"))
      print(errs[:3]);await ctx.close()
    await b.close()
asyncio.run(main())
