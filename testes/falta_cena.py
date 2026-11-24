import asyncio,sys
from playwright.async_api import async_playwright
TAG=sys.argv[1] if len(sys.argv)>1 else 'a'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':800,'height':450})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(7000)
    await pg.evaluate("""(()=>{__MVst.paused=true;__MVst.cine=true;const m=__MVst.m;const w=__MVst.rd;const T=m.T[0],O=m.T[1];const tk=m.active(T).find(x=>T.slots[x.si].role==='MEI')||m.active(T)[5];const gk=m.gk(O);
      const gx=m.T[0].side===0?105:0;const f={kind:'shot',sp:'fk',side:0,from:tk,fx:gx-24,fy:30,tx:gx+.6,ty:34+2.6,endZ:1.6,out:'save',dur:1};
      const wall=m.active(O).filter(x=>x!==gk).slice(0,4);w.cine(f,m,()=>{});window.__C=w.eng.cineS;})()""")
    await pg.wait_for_timeout(200)
    ts=[0.3,1.0,1.4,1.6,1.7,1.8,1.9,2.05,2.3,2.6,2.9,3.3]
    await pg.evaluate("(()=>{const E=C11Render3D.Hybrid.E;E.__cf=E.cineFrame.bind(E);E.cineFrame=()=>({done:false})})()")
    for i,tt in enumerate(ts):
      d=await pg.evaluate(f"(()=>{{const E=C11Render3D.Hybrid.E;const S=E.cineS;if(!S)return null;const n=Math.max(1,Math.round(({tt}-S.t)/0.0333));for(let k=0;k<n;k++)E.__cf(0.0333);return E.r.domElement.toDataURL('image/png')}})()")
      if d:
        pass
      for nm,js in [('tk',"const P=S.Pt;const p=P.root.position;E.cam.position.set(p.x-1.6,1.4,p.z+1.9);E.cam.fov=30;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x,1.0,p.z)"),('gk',"const P=S.Pg;const p=P.root.position;E.cam.position.set(p.x-Math.sign(p.x)*7,1.6,p.z+1.5);E.cam.fov=40;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x,1.0,p.z)")]:
        if (nm=='tk' and i in (0,3,5)) or (nm=='gk' and i in (5,7,8,9)):
          d2=await pg.evaluate("(()=>{const E=C11Render3D.Hybrid.E;const S=E.cineS;"+js+";E.r.render(E.s,E.cam);return E.r.domElement.toDataURL('image/png')})()")
          import base64;open(f'/tmp/fkc_{TAG}_{nm}_{i}.png','wb').write(base64.b64decode(d2.split(',')[1]))
      if d:
        import base64;open(f'/tmp/fk_{TAG}_{i}.png','wb').write(base64.b64decode(d.split(',')[1]))
    print(errs[:3]);await b.close()
asyncio.run(main())
