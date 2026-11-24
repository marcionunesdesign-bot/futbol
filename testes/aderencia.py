import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1];SP=sys.argv[2] if len(sys.argv)>2 else '1';SEC=int(sys.argv[3]) if len(sys.argv)>3 else 70
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':320,'height':180})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text[:200]) if '3D' in m.text else None)
    await pg.goto(URL);await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(7000)
    await pg.evaluate(f"(()=>{{const b=document.querySelector('#mv-spd [data-sp=\"{SP}\"]');if(b)b.click();const it=document.querySelector('.intro');if(it)it.click()}})()")
    await pg.wait_for_timeout(2000)
    await pg.evaluate("""(()=>{const E=C11Render3D.Hybrid.E;const V=E.ball.position.constructor;const fp=new V();const W=window.__A={own:[],behind:0,ownN:0,gkHold:[],save:[],gkKick:{n:0,byGk:0,ballAtFootAtKick:[]}};let lastSt=null;
      const near=(P,names)=>{let mn=9;for(const n of names){const b=P.B[n];if(!b)continue;b.getWorldPosition(fp);mn=Math.min(mn,Math.hypot(fp.x-E.ball.position.x,fp.z-E.ball.position.z,(fp.y-E.ball.position.y)*.6))}return mn};
      const f=()=>{W.fr=(W.fr||0)+1;try{const m=__MVst.m;if(m&&!__MVst.paused){const b=m.ball;
        if(b.st==='own'&&b.own&&!(m.dead>0)){const P=E.pl.get(b.own.id);if(P){P.root.updateMatrixWorld(true);if(b.own.gkHold){W.gkHold.push(near(P,['hand_l','hand_r']))}else if(!b.own.setP&&!b.own.ko){const d=near(P,['ball_l','ball_r','foot_l','foot_r']);W.own.push(d);if(d>1.5&&(W.far=W.far||[]).length<25){const D=E.bD||{};W.far.push({d:+d.toFixed(1),sim:[+(b.x).toFixed(1),+(b.y).toFixed(1)],dono:[+b.own.x.toFixed(1),+b.own.y.toFixed(1)],desen:[+E.ball.position.x.toFixed(1),+E.ball.position.z.toFixed(1)],raiz:[+P.root.position.x.toFixed(1),+P.root.position.z.toFixed(1)],vis:P.root.visible,fade:D.fade||0,ctrl:+(b.own.ctrl-m.t).toFixed(2),flip:!!m.flip})}W.ownN++;const hx=Math.sin(P.h),hz=Math.cos(P.h);const fd=(E.ball.position.x-P.root.position.x)*hx+(E.ball.position.z-P.root.position.z)*hz;if(fd<0)W.behind++}}}
        if(b.st==='fly'&&b.fly&&b.fly.kind==='shot'&&(b.fly.out==='save')){const k=b.fly.t/b.fly.dur;if(k>.88){const O=m.T[1-b.fly.side];const g=m.gk(O);const P=g&&E.pl.get(g.id);if(P){P.root.updateMatrixWorld(true);W.save.push(+near(P,['hand_l','hand_r']).toFixed(2))}}}
        if(m.setup&&m.setup.kind==='tiro'&&lastSt!=='tiro'){W.gkKick.n++}lastSt=m.setup?m.setup.kind:null}
        }catch(e){W.err=String(e)}requestAnimationFrame(f)};requestAnimationFrame(f)})()""")
    await pg.wait_for_timeout(SEC*1000)
    r=await pg.evaluate("""(()=>{const W=__A;const q=(a,x)=>{if(!a.length)return null;a=a.slice().sort((p,q)=>p-q);return +a[Math.floor(x*(a.length-1))].toFixed(2)};
      return {conducao:{quadros:W.ownN,dist_pe_mediana:q(W.own,.5),p90:q(W.own,.9),p99:q(W.own,.99),longe_mais_80cm:+(100*W.own.filter(x=>x>.8).length/Math.max(1,W.own.length)).toFixed(1)+'%',bola_atras_do_corpo:+(100*W.behind/Math.max(1,W.ownN)).toFixed(1)+'%'},
        goleiro_segurando:{quadros:W.gkHold.length,dist_mao_mediana:q(W.gkHold,.5),p90:q(W.gkHold,.9)},defesas:{quadros:W.save.length,dist_mao_mediana:q(W.save,.5),p90:q(W.save,.9),amostras:W.save.slice(0,12)},longe:W.far||[],tiros_de_meta:W.gkKick.n,fr:W.fr,err:W.err||null,tempo_jogo:+__MVst.m.t.toFixed(0)}})()""")
    print(json.dumps(r,ensure_ascii=False),errs[:2]);await b.close()
asyncio.run(main())
