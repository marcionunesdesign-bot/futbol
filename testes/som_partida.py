import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.click('[data-div=A]');await pg.click('#s-go');await pg.wait_for_timeout(1500)
    await pg.evaluate("U.closeModal&&U.closeModal()");await pg.click('#b-continue');await pg.wait_for_timeout(1500);await pg.click('#mv-full');await pg.wait_for_timeout(9000)
    st=lambda: pg.evaluate("({torcida:C11Audio.crowdOn,ambiente:C11Audio.beds,ctx:C11Audio.ctxState,tela:document.body.dataset.view})")
    print('na partida:',await st())
    await pg.evaluate("U.go('tactics')");await pg.wait_for_timeout(1500);print('foi para tática:',await st())
    await pg.evaluate("U.go('match')");await pg.wait_for_timeout(3500);print('voltou para a partida:',await st())
    await pg.evaluate("C11Audio.bedsOff&&0");print(errs[:3]);await b.close()
asyncio.run(main())
