import asyncio,base64,sys
from playwright.async_api import async_playwright
TAG=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':640,'height':360})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(6000)
    await pg.evaluate("(()=>{const it=document.querySelector('.intro');if(it)it.click()})()");await pg.wait_for_timeout(2500)
    # pausa o laço normal e conduz manualmente: dispara um tiro de meta e avança o jogo e o desenho quadro a quadro
    await pg.evaluate("""(()=>{const st=__MVst;st.paused=true;const m=st.m;m.ball.st='dead';m.goalKick(0);window.__frames=[];})()""")
    for i in range(18):
      d=await pg.evaluate("""(()=>{const st=__MVst,m=st.m,E=C11Render3D.Hybrid.E;for(let k=0;k<6;k++)m.step(1/30);const g=m.gk(m.T[0]);const P=E.pl.get(g.id);
        st.rd.draw(null,.1);st.rd.draw(null,.1);const p=P.root.position;E.cam.position.set(p.x+ (p.x<0?14:-14),7,p.z+9);E.cam.fov=40;E.cam.updateProjectionMatrix();E.cam.lookAt(p.x+(p.x<0?8:-8),0,p.z);E.r.render(E.s,E.cam);
        return [E.r.domElement.toDataURL('image/png'),m.ball.st,+m.t.toFixed(2),g.setP?1:0,m.setup?m.setup.kind:'']})()""")
      open(f'/tmp/gk_{TAG}_{i}.png','wb').write(base64.b64decode(d[0].split(',')[1]));print(i,d[1:])
    print(errs[:3]);await b.close()
asyncio.run(main())
