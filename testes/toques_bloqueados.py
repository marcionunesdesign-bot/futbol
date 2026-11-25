import asyncio,json,sys
from playwright.async_api import async_playwright
JS=open('/tmp/hit.py').read().split('JS="""')[1].split('"""')[0]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);pg=await ctx.new_page()
    await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1200)
    # passos iniciais
    async def scan(nm,scroller):
      H=await pg.evaluate(f"({scroller}).scrollHeight");seen={}
      for y in range(0,max(H,1),300):
        await pg.evaluate(f"({scroller}).scrollTo(0,{y});scrollTo(0,{y})");await pg.wait_for_timeout(200)
        for r in await pg.evaluate(JS):seen.setdefault(r['t']+' | coberto por '+r['who'],[]).append(r['top'])
      print(nm,len(seen));[print('   ',k,v[:5]) for k,v in list(seen.items())[:12]]
    await scan('div',"document.scrollingElement")
    await pg.click('[data-div=D]');await pg.wait_for_timeout(300);await pg.click('[data-pick]:nth-child(2)');await scan('clube',"document.scrollingElement")
    await pg.click('.ns-bar .ns-btn');await pg.fill('#s-name','M');await pg.click('#s-go');await pg.wait_for_timeout(1500);await pg.evaluate("U.closeModal&&U.closeModal()")
    sc="document.querySelector('main')"
    for v in ['home','squad','tactics','training','market','club','league']:
      await pg.evaluate(f"U.go('{v}')");await pg.wait_for_timeout(500);await scan(v,sc)
    await b.close()
asyncio.run(main())
