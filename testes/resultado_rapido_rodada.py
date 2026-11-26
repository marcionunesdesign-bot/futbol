import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,nm in[(390,844,'m'),(1366,800,'d')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<500,has_touch=w<500);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1000)
      await pg.evaluate("(document.querySelector('[data-ns=div]')||{click(){}}).click()");await pg.click('[data-div=D]');await pg.click('[data-pick]:nth-child(2)');await pg.click('.ns-bar .ns-btn');await pg.fill('#s-name','M');await pg.click('#s-go');await pg.wait_for_timeout(1500)
      await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500)
      await pg.evaluate("document.querySelector('#mv-quick').click()");await pg.wait_for_timeout(5500);await pg.screenshot(path=f'/tmp/rq_{nm}_1.png')
      await pg.wait_for_timeout(13000);await pg.screenshot(path=f'/tmp/rq_{nm}_2.png')
      await pg.click('#rd-go');await pg.wait_for_timeout(800)
      r=await pg.evaluate("(()=>{const g=C11.G;return {rp:!!g.rp,clk:!!document.querySelector('#mv-commit')}})()");print(nm,r)
      await pg.evaluate("document.querySelector('#mv-commit').click()");await pg.wait_for_timeout(800)
      r=await pg.evaluate("""(()=>{const g=C11.G;const d=g.clubs[g.user].div;const R=g.results[d].filter(Boolean);const last=R[R.length-1];return {jogos:last.length,comTL:last.filter(x=>x.tl).length,gols:last.reduce((a,x)=>a+x.gh+x.ga,0),golsTL:last.reduce((a,x)=>a+(x.tl||[]).filter(e=>e.k==='g').length,0),les:Object.values(g.players).filter(p=>p.inj&&p.c!==g.user).length,rp:g.rp}})()""");print(nm,r,errs[:3])
      await ctx.close()
    await b.close()
asyncio.run(main())
