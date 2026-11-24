import asyncio,base64,json,sys
from playwright.async_api import async_playwright
TAG=sys.argv[1];LEFT=sys.argv[2]=='1' if len(sys.argv)>2 else False
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':360,'height':360})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(6000)
    await pg.evaluate(f"""(()=>{{__MVst.paused=true;__MVst.cine=true;const m=__MVst.m;const w=__MVst.rd;const T=m.T[0],O=m.T[1];const tk=m.active(T).find(x=>T.slots[x.si].role==='MEI')||m.active(T)[5];
      const gx=105;const f={{kind:'shot',sp:'fk',side:0,from:tk,fx:gx-24,fy:30,tx:gx+.6,ty:34+2.6,endZ:1.6,out:'save',dur:1,left:{str(LEFT).lower()}}};w.cine(f,m,()=>{{}});
      const E=C11Render3D.Hybrid.E;E.__cf=E.cineFrame.bind(E);E.cineFrame=()=>({{done:false}});}})()""")
    res=[]
    ts=[1.0,1.2,1.4,1.55,1.65,1.75,1.85,1.95,2.05,2.2,2.4,2.7]
    for i,tt in enumerate(ts):
      d=await pg.evaluate(f"""(()=>{{const E=C11Render3D.Hybrid.E;const S=E.cineS;const n=Math.max(1,Math.round(({tt}-S.t)/0.0333));for(let k=0;k<n;k++)E.__cf(0.0333);
        const P=S.Pt;const Q=E.cam.quaternion.constructor;const qa=new Q(),qb=new Q();P.root.updateMatrixWorld(true);P.B.pelvis.getWorldQuaternion(qa);P.B.spine_03.getWorldQuaternion(qb);const rel=qa.clone().invert().multiply(qb);
        if(!window.__r0)window.__r0=rel.clone();const ang=2*Math.acos(Math.min(1,Math.abs(window.__r0.dot(rel))))*57.3;
        const p=P.root.position;const h=P.root.rotation.y;E.cam.position.set(p.x+Math.cos(h)*3.2,1.3,p.z-Math.sin(h)*3.2);E.cam.fov=40;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x,.9,p.z);E.r.render(E.s,E.cam);
        return [E.r.domElement.toDataURL('image/png'),+ang.toFixed(0),S.left]}})()""")
      open(f'/tmp/fk2_{TAG}_{i}.png','wb').write(base64.b64decode(d[0].split(',')[1]));res.append(d[1])
    print('deformacao_coluna_graus',res,'canhoto',d[2],errs[:2]);await b.close()
asyncio.run(main())
