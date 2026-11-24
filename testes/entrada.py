import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1];TAG=sys.argv[2]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':960,'height':540})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000)
    await pg.wait_for_timeout(1500)
    if not await pg.evaluate("!!document.querySelector('.intro')"):
      await pg.evaluate("U.go('home')");await pg.wait_for_timeout(600);await pg.evaluate("U.go('match')");await pg.wait_for_timeout(600);await pg.evaluate("document.querySelector('#mv-full').click()")
      await pg.wait_for_timeout(1200)
    print('intro?',await pg.evaluate("!!document.querySelector('.intro')"))
    await pg.evaluate("""(()=>{window.__S=[];const e=C11Render3D.Hybrid.E;const t0=performance.now();const f=()=>{const a=[];for(const P of e.pl.values())a.push([P.root.position.x,P.root.position.z]);__S.push([performance.now()-t0,a]);if(performance.now()-t0<4000)requestAnimationFrame(f)};requestAnimationFrame(f);const it=document.querySelector('.intro');if(it)it.click();window.__clicked=!!it})()""")
    for k,ms in enumerate([250,500,700,1300]):
      await pg.wait_for_timeout(ms if k==0 else ms-[250,500,700,1300][k-1]);await pg.screenshot(path=f'/tmp/i_{TAG}_{k+1}.png')
    await pg.wait_for_timeout(2800)
    r=await pg.evaluate("""(()=>{const S=__S;let worst=0,vis=[];for(let i=1;i<S.length;i++){const [t,a]=S[i],[t0,b]=S[i-1];const dt=(t-t0)/1000;if(dt<=0)continue;let mx=0;for(let j=0;j<a.length;j++){const d=Math.hypot(a[j][0]-b[j][0],a[j][1]-b[j][1]);mx=Math.max(mx,d)}
      const blk=document.querySelector('.in-cut.on');vis.push([+(t/1000).toFixed(2),+(mx/dt).toFixed(1)])}return vis})()""")
    print(TAG,json.dumps(r[:40]),errs[:2]);await b.close()
asyncio.run(main())
