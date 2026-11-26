import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'m'),(1366,900,'d')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<500,has_touch=w<500);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1000)
      await pg.evaluate("(document.querySelector('[data-ns=div]')||{click(){}}).click()");await pg.click('[data-div=D]');await pg.click('[data-pick]:nth-child(2)');await pg.click('.ns-bar .ns-btn');await pg.fill('#s-name','M');await pg.click('#s-go');await pg.wait_for_timeout(1500)
      await pg.evaluate("U.closeModal&&U.closeModal()")
      for k in range(3):
        await pg.evaluate("U.go('training')");await pg.wait_for_timeout(300)
        await pg.evaluate("const b=document.querySelector('#t-run');b&&b.click()");await pg.wait_for_timeout(300)
        await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(400);await pg.evaluate("document.querySelector('#mv-quick').click()");await pg.wait_for_timeout(600)
        await pg.evaluate("document.querySelector('#rd-skip').click()");await pg.wait_for_timeout(300);await pg.evaluate("document.querySelector('#rd-go').click()");await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelector('#mv-commit').click()");await pg.wait_for_timeout(800);await pg.evaluate("U.closeModal&&U.closeModal()")
      await pg.evaluate("U.go('training')");await pg.wait_for_timeout(300);await pg.evaluate("const b=document.querySelector('#t-run');b&&b.click()");await pg.wait_for_timeout(500)
      await pg.evaluate("document.querySelector('.tverd').scrollIntoView()");await pg.wait_for_timeout(200);await pg.screenshot(path=f'/tmp/tr_{nm}_1.png')
      await pg.evaluate("document.querySelector('.thist').scrollIntoView()");await pg.wait_for_timeout(200);await pg.screenshot(path=f'/tmp/tr_{nm}_2.png')
      await pg.evaluate("U.go('youth')");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/yo_{nm}_1.png')
      print(nm,'opções:',await pg.evaluate("[...document.querySelector('[data-ytr]').options].map(o=>o.textContent).join(' | ')"))
      bt=await pg.query_selector('[data-yideal]')
      if bt:await bt.click();await pg.wait_for_timeout(300);print(nm,'após ideal, botão:',await pg.evaluate("!!document.querySelector('[data-yideal]')"))
      await pg.evaluate("document.querySelector('.ycard').scrollIntoView()");await pg.wait_for_timeout(200);await pg.screenshot(path=f'/tmp/yo_{nm}_2.png')
      print(nm,errs[:3]);await ctx.close()
    await b.close()
asyncio.run(main())
