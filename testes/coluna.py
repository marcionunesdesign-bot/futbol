import asyncio,json,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':480,'height':270})).new_page()
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(7000)
    await pg.evaluate("(()=>{const b=document.querySelector('#mv-spd [data-sp=\"2\"]');if(b)b.click();const it=document.querySelector('.intro');if(it)it.click()})()")
    await pg.wait_for_timeout(2500);await pg.evaluate("window.__spt=[]");await pg.wait_for_timeout(40000)
    r=await pg.evaluate("(()=>{const h=window.__spt;const q=(a,x)=>{a=a.slice().sort((p,q)=>p-q);return +a[Math.floor(x*(a.length-1))].toFixed(1)};const n=h.filter(x=>!x[1]).map(x=>x[0]),k=h.filter(x=>x[1]).map(x=>x[0]);return {normal:{n:n.length,p50:q(n,.5),p90:q(n,.9),p99:q(n,.99),acima32:+(100*n.filter(x=>x>32).length/n.length).toFixed(2)},chute:{n:k.length,p50:q(k,.5),p90:q(k,.9),p99:q(k,.99),acima40:+(100*k.filter(x=>x>40).length/k.length).toFixed(1)}}})()")
    print(json.dumps(r));await b.close()
asyncio.run(main())
