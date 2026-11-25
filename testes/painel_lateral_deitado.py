import asyncio,sys
from playwright.async_api import async_playwright
G=sys.argv[1] if len(sys.argv)>1 else '2d'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
    await ctx.add_init_script("try{localStorage.setItem('c11-ui',JSON.stringify({gfx:'%s'}))}catch(e){}"%G)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(1000)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('#mv-full').click()");await pg.wait_for_timeout(6000 if G!='2d' else 1500)
    await pg.evaluate("const i=document.querySelector('.intro');i&&i.click()");await pg.wait_for_timeout(6000)
    await pg.screenshot(path=f'/tmp/sd_{G}_0.png')
    await pg.tap('[data-hud=cfg]');await pg.wait_for_timeout(300);await pg.locator('#mpop button',has_text='Lances').tap();await pg.wait_for_timeout(600)
    await pg.screenshot(path=f'/tmp/sd_{G}_1.png')
    await pg.tap('[data-mt=tac]');await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/sd_{G}_2.png')
    c1=await pg.evaluate("document.querySelector('#clk').textContent");await pg.wait_for_timeout(3000);c2=await pg.evaluate("document.querySelector('#clk').textContent");print('relógio',c1,c2)
    await pg.tap('[data-sidex]');await pg.wait_for_timeout(500);print('fechou:',await pg.evaluate("!document.body.classList.contains('side-open')"),'scrollY',await pg.evaluate("scrollY+document.querySelector('main').scrollTop"))
    print(errs[:3]);await b.close()
asyncio.run(main())
