import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':320,'height':180})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(6000)
    await pg.evaluate("(()=>{const it=document.querySelector('.intro');if(it)it.click()})()");await pg.wait_for_timeout(2500)
    res=[]
    for i,(ty,ez) in enumerate([(31.2,.4),(37.0,1.2),(30.5,2.0),(36.2,.15),(32.5,1.7),(35.8,2.2)]):
      r=await pg.evaluate("""([ty,ez])=>{const st=__MVst,m=st.m,E=C11Render3D.Hybrid.E;st.paused=true;const O=m.T[1];const g=m.gk(O);const gx=O.side===0?0:105;const dir=gx>50?1:-1;
        g.x=gx-dir*1.2;g.y=34;g.vx=g.vy=0;const sh=m.active(m.T[0])[8];sh.x=gx-dir*18;sh.y=34;
        m.ball.st='fly';m.ball.own=null;const tx=gx-dir*.6;m.ball.fly={kind:'shot',side:m.T[0].side,from:sh,fx:sh.x,fy:sh.y,tx,ty,t:0,dur:.75+Math.random()*.05,h:.4,endZ:ez,out:'save',xg:.1,assist:null,gx:tx,gy:ty};m.ball.x=sh.x;m.ball.y=sh.y;
        for(let k=0;k<40;k++){st.rd.draw(null,1/30)}
        const V=E.ball.position.constructor;const fp=new V();let best=9;const P=E.pl.get(g.id);
        for(let k=0;k<30;k++){m.ball.fly.t=Math.min(m.ball.fly.dur,(k/29)*m.ball.fly.dur);m.ball.x=m.ball.fly.fx+(m.ball.fly.tx-m.ball.fly.fx)*(m.ball.fly.t/m.ball.fly.dur);m.ball.y=m.ball.fly.fy+(m.ball.fly.ty-m.ball.fly.fy)*(m.ball.fly.t/m.ball.fly.dur);m.ball.z=m.ball.fly.endZ*(m.ball.fly.t/m.ball.fly.dur);st.rd.draw(null,m.ball.fly.dur/29);
          if(k>=26){P.root.updateMatrixWorld(true);const tw=[E.ball.position.x,E.ball.position.y,E.ball.position.z];for(const n of ['hand_l','hand_r']){const bb=P.B[n];bb.getWorldPosition(fp);best=Math.min(best,Math.hypot(fp.x-tw[0],fp.y-tw[1],fp.z-tw[2]))}}}
        m.ball.st='dead';return +best.toFixed(2)}""",[ty,ez])
      res.append(r)
    print(json.dumps({'mao_ate_bola_no_contato_m':res,'media':round(sum(res)/len(res),2)}),errs[:2]);await b.close()
asyncio.run(main())
