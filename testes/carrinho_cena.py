import asyncio,base64
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':360,'height':300})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(5000)
    for i,a in enumerate([0.1,0.3,0.6,1.0,1.4,1.85]):
      d=await pg.evaluate("""(a)=>{__MVst.paused=true;__MVst.cine=true;const E=C11Render3D.Hybrid.E;const P=[...E.pl.values()].filter(x=>!x.inf.gk)[2];let tt=0;for(let k=0;k<=Math.round(a*30);k++){P.pose({mv:0,t:50+k/30,anim:{k:'slide',a:k/30}})}
        const p=P.root.position;E.cam.position.set(p.x+3.2,1.3,p.z+3.2);E.cam.fov=38;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x,.6,p.z);E.r.render(E.s,E.cam);return E.r.domElement.toDataURL('image/png')}""",a)
      open(f'/tmp/sl_{i}.png','wb').write(base64.b64decode(d.split(',')[1]))
    print(errs[:2]);await b.close()
asyncio.run(main())
