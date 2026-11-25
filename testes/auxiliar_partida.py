import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
    await ctx.add_init_script("try{localStorage.setItem('c11-ui',JSON.stringify({gfx:'2d'}))}catch(e){}")
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(1000)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('#mv-full').click()");await pg.wait_for_timeout(1500)
    await pg.evaluate("const i=document.querySelector('.intro');i&&i.click()");await pg.wait_for_timeout(1200)
    for k in ['spd','cam','cfg']:
      await pg.tap(f'[data-hud={k}]');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/hud_{k}.png')
    await pg.tap('[data-hud=spd]');await pg.wait_for_timeout(200);await pg.locator('#mpop button',has_text='4x').tap();await pg.wait_for_timeout(200)
    print('vel 4x ativa no menu:',await pg.locator('#mpop button',has_text='4x').evaluate("b=>b.classList.contains('on')"))
    await pg.tap('#mcv',position={'x':300,'y':200});await pg.wait_for_timeout(200);print('menu fecha ao tocar no campo:',await pg.evaluate("document.querySelector('#mpop').hidden"))
    await pg.evaluate("""window.__co=[];new MutationObserver(()=>{const e=document.querySelector('#acoach');if(e&&!e.hidden&&e.innerText&&__co[__co.length-1]!==e.innerText){__co.push(e.innerText);const b=e.querySelector('[data-coapply]');if(b&&__co.filter(x=>x.includes('Sugestão')).length<=3)setTimeout(()=>b.click(),900)}}).observe(document.querySelector('#acoach'),{childList:true,subtree:true,attributes:true})""")
    shot=0
    for i in range(60):
      await pg.wait_for_timeout(5000)
      mn=await pg.evaluate("document.querySelector('#clk').textContent")
      if await pg.evaluate("!!document.querySelector('#acoach:not([hidden])')") and shot<4:
        shot+=1;await pg.screenshot(path=f'/tmp/coach_{shot}.png')
      if await pg.evaluate("!document.querySelector('#modal').hidden"):
        t=await pg.evaluate("document.querySelector('#modal').innerText.slice(0,40)")
        if 'INTERVALO' in t.upper():
          await pg.screenshot(path='/tmp/coach_ht.png');await pg.evaluate("document.querySelector('#modal>.frame').scrollTop=9999");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/coach_ht2.png');break
        await pg.evaluate("document.querySelector('#modal [data-close],#modal .x')&&0");await pg.evaluate("U.closeModal()");await pg.evaluate("document.querySelector('#mv-play').click()")
      if 'FIM' in mn or (await pg.evaluate("!document.querySelector('#clk')")):break
    print('minuto final',mn)
    print(json.dumps(await pg.evaluate("__co"),ensure_ascii=False,indent=0))
    print('erros',errs[:3]);await b.close()
asyncio.run(main())
