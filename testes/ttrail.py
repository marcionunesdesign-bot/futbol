import asyncio,base64
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':1280,'height':720})).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.on('console',lambda m:errs.append(m.text[:200]) if '3D' in m.text else None)
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(9000)
    await pg.evaluate("MV.pause();cancelAnimationFrame(__MVst.raf);__MVst.rd.introT=0")
    d=await pg.evaluate("""(()=>{const H=__MVst.rd,E=H.eng,m=MV.m;for(let i=0;i<400&&!(m.ball.st==='own'&&!(m.dead>0));i++)m.step(1/30);const c=m.ball.own;
      const dr=()=>{let v=H.r2.view();if(v.flip)v=H.r2.flipView(v);E.draw(v,1/30,H.r2.info,1,null)};dr();const ring=E.ownRing&&E.ownRing.visible;
      m.shoot(c);let shot=null;for(let i=0;i<60;i++){m.step(1/30);dr();if(m.ball.st==='fly'&&m.ball.fly.kind==='shot'&&m.ball.fly.t/m.ball.fly.dur>.55){shot=E.trM.geometry.drawRange.count;break}}
      return JSON.stringify({ring,trailPts:shot,img:E.cv.toDataURL('image/jpeg',.85)})})()""")
    import json;j=json.loads(d);open('/tmp/trail.jpg','wb').write(base64.b64decode(j['img'].split(',')[1]));print('anel visível:',j['ring'],'pontos do rastro:',j['trailPts'],errs[:3]);await b.close()
asyncio.run(main())
