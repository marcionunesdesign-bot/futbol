import asyncio,base64,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':360,'height':300})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text[:200]) if '3D' in m.text else None)
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(6000)
    await pg.evaluate("(()=>{const it=document.querySelector('.intro');if(it)it.click()})()");await pg.wait_for_timeout(2500)
    for case in ['bike','finta']:
      await pg.evaluate(f"""(()=>{{const st=__MVst,m=st.m;st.paused=true;const T=m.T[0];const a=m.active(T).find(x=>T.slots[x.si].role==='ATA')||m.active(T)[9];
        a.x=95;a.y=34;a.vx=a.vy=0;for(const o of m.active(m.T[1]))if(m.T[1].slots[o.si].role!=='GOL'){{o.x=Math.min(o.x,80)}}
        if('{case}'==='bike'){{m.give(a,true);m.ball.z=1.9;m.ball.x=a.x+.3;m.ball.y=a.y;m.shoot(a,{{bike:true}})}}
        else{{m.give(a,true);a.x=60;a.y=34;const o=m.active(m.T[1])[4];o.x=62.5;o.y=34.2;o.vx=o.vy=0;a.trick={{k:'finta',t:m.t,o:o.id,ok:true,s:1}};a.fx={{k:'drible',t:m.t}};a.drib={{x:64,y:31}};a.slowUntil=m.t+.35}}
        window.__case={{id:a.id}};for(let k=0;k<20;k++)st.rd.draw(null,1/30)}})()""")
      for i in range(8):
        d=await pg.evaluate("""(()=>{const st=__MVst,m=st.m,E=C11Render3D.Hybrid.E;for(let k=0;k<4;k++){m.step(1/30);st.rd.draw(null,1/30)}const P=E.pl.get(__case.id);const p=P.root.position;const h=P.h;
          E.cam.position.set(p.x+Math.cos(h)*4.2,1.6,p.z-Math.sin(h)*4.2);E.cam.fov=42;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x,1,p.z);E.r.render(E.s,E.cam);return E.r.domElement.toDataURL('image/png')})()""")
        open(f'/tmp/bk_{case}_{i}.png','wb').write(base64.b64decode(d.split(',')[1]))
    print(errs[:3]);await b.close()
asyncio.run(main())
