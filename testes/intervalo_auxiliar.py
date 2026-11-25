import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
    await ctx.add_init_script("try{localStorage.setItem('c11-ui',JSON.stringify({gfx:'2d'}))}catch(e){}")
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(1000)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('#mv-full').click()");await pg.wait_for_timeout(1500)
    await pg.evaluate("const i=document.querySelector('.intro');i&&i.click()");await pg.wait_for_timeout(1200)
    await pg.evaluate("document.querySelector('.mbar [data-sp=\"4\"]').click()")
    await pg.evaluate("setInterval(()=>{const r=document.querySelector('#rp');if(r&&!r.hidden)r.click()},500)")
    for i in range(80):
      await pg.wait_for_timeout(3000)
      if await pg.evaluate("!document.querySelector('#modal').hidden&&document.querySelector('#modal').innerText.toUpperCase().includes('INTERVALO')"):break
    await pg.screenshot(path='/tmp/ht1.png');await pg.evaluate("document.querySelector('#modal>.frame').scrollTop=280");await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/ht2.png')
    print(errs);await b.close()
asyncio.run(main())
