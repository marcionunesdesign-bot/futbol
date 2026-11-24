import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg=await (await b.new_context(viewport={'width':1280,'height':800})).new_page()
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("window.__tr=[];");await pg.click('[data-div=A]');await pg.click('#s-go');await pg.wait_for_timeout(1500)
    await pg.evaluate("U.closeModal&&U.closeModal();const o=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){__tr.push((this.src||'').split('/').pop());return o.call(this)};0")
    for v in ['tactics','squad','tactics','home','tactics','league','home']:
      await pg.evaluate(f"U.go('{v}')");await pg.wait_for_timeout(700)
    print('novas faixas iniciadas ao navegar 7 telas:',await pg.evaluate("__tr.filter((x,i,a)=>a.indexOf(x)===i)"))
    await b.close()
asyncio.run(main())
