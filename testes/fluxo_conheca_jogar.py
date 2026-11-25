import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'m'),(1366,800,'d')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<500,has_touch=w<500,device_scale_factor=1);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/');await pg.wait_for_timeout(1500);print(nm,'entrou em:',pg.url)
      await pg.click('.cta a.btn.pri');await pg.wait_for_timeout(1500);print(nm,'após Jogar:',pg.url)
      await pg.screenshot(path=f'/tmp/fl_{nm}_1.png')
      await pg.click('[data-div=D]');await pg.wait_for_timeout(300);await pg.click('[data-pick]:nth-child(5)');await pg.wait_for_timeout(200);await pg.screenshot(path=f'/tmp/fl_{nm}_2.png')
      await pg.click('.ns-bar .ns-btn');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/fl_{nm}_3.png')
      await pg.fill('#s-name','Márcio');await pg.click('#s-go');await pg.wait_for_timeout(1500);print(nm,'carreira:',await pg.evaluate("C11.G.user"))
      await pg.reload();await pg.wait_for_timeout(1200);print(nm,'recarregou (mesma sessão):',pg.url)
      p2=await ctx.new_page();await p2.goto('http://localhost:8769/');await p2.wait_for_timeout(1500);print(nm,'nova aba ->',p2.url,'| botão:',await p2.evaluate("document.querySelector('.cta a.btn.pri').textContent"))
      await p2.click('.cta a.btn.pri');await p2.wait_for_timeout(1500);await p2.evaluate("document.querySelector('#start').hidden||0")
      print(nm,'start visível?',await p2.evaluate("!document.querySelector('#start').hidden"))
      if await p2.evaluate("!document.querySelector('#start').hidden"):await p2.screenshot(path=f'/tmp/fl_{nm}_home.png')
      print(errs[:3]);await ctx.close()
    await b.close()
asyncio.run(main())
