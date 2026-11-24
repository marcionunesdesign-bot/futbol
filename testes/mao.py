import asyncio,base64,json
from playwright.async_api import async_playwright
V=[('wk0',['Z',.2,0],1,0),('wk.65',['Z',.2,0],1,.65),('wk1',['Z',.2,0],1,1),('wk0nf',['Z',.2,0],0,0),('wk.65nf',['Z',.2,0],0,.65),('wk1nf',['Z',.2,0],0,1)]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':400,'height':400})).new_page()
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(6000)
    for i,(nm,cfg,fg,wk) in enumerate(V):
      d=await pg.evaluate("""([cfg,fg,wk])=>{window.__wk=wk;__MVst.paused=true;__MVst.cine=true;window.__ab=cfg;window.__nofg=!fg;const E=C11Render3D.Hybrid.E;const Ps=[...E.pl.values()].filter(x=>!x.inf.gk);const P=Ps[3];for(let k=0;k<40;k++)P.pose({mv:0,t:1+k*.02});P.root.updateMatrixWorld(true);
        const h=P.B.hand_r;const v=new h.position.constructor();h.getWorldPosition(v);const fw=new v.constructor(0,0,1).applyQuaternion(P.root.quaternion);const rt=new v.constructor(1,0,0).applyQuaternion(P.root.quaternion);
        E.cam.position.set(v.x+fw.x*.7-rt.x*.25,v.y+.15,v.z+fw.z*.7-rt.z*.25);E.cam.fov=35;E.cam.updateProjectionMatrix();E.cam.lookAt(v.x,v.y,v.z);E.r.render(E.s,E.cam);return E.r.domElement.toDataURL('image/png')}""",[cfg,fg,wk])
      open(f'/tmp/h2_{i}.png','wb').write(base64.b64decode(d.split(',')[1]))
    await b.close()
asyncio.run(main())
