import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'pt'),(844,390,'ls'),(1366,768,'dk')]:
      pg=await (await b.new_context(viewport={'width':w,'height':h},is_mobile=w<1000,has_touch=w<1000,device_scale_factor=2)).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
      await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(1000)
      await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
      await pg.evaluate("U.openModal('<div id=\"mtac\"></div>');document.querySelector('#modal').classList.add('wide');C11TV.render(document.querySelector('#mtac'),{inMatch:true})" if False else "(()=>{const T=window.TV||window.C11Tactics;U.openModal('<div id=\"mtac\"></div>');document.querySelector('#modal').classList.add('wide');T.render(document.querySelector('#mtac'),{inMatch:true})})()")
      await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/tac_{nm}.png')
      if nm=='pt':
        await pg.evaluate("document.querySelector('#modal>.frame').scrollTop=900");await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/tac_pt2.png')
        await pg.evaluate("document.querySelector('#modal>.frame').scrollTop=0");await pg.tap('[data-closetac]');await pg.wait_for_timeout(300);print('fechou:',await pg.evaluate("document.querySelector('#modal').hidden"));print(nm,errs[:2])
    await b.close()
asyncio.run(main())
