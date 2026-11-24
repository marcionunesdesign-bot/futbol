import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1];SP=sys.argv[2] if len(sys.argv)>2 else '1'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':480,'height':270})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(7000)
    await pg.evaluate(f"(()=>{{const b=document.querySelector('#mv-spd [data-sp=\"{SP}\"]');if(b)b.click();const it=document.querySelector('.intro');if(it)it.click()}})()")
    await pg.wait_for_timeout(2000)
    await pg.evaluate("""(()=>{const E=C11Render3D.Hybrid.E;window.__W={n:0,big:[],hist:[0,0,0,0,0]};const T=E.s.children[0].constructor;
      const Q=E.cam.quaternion.constructor;const qa=new Q(),qb=new Q(),qr=new Q();
      const f=()=>{for(const P of E.pl.values()){const B=P.B;if(!B.pelvis||!B.spine_03)continue;P.root.updateMatrixWorld(true);B.pelvis.getWorldQuaternion(qa);B.spine_03.getWorldQuaternion(qb);qr.copy(qa).invert().multiply(qb);if(!P.__r0){P.__r0=qr.clone()}const dd=Math.min(1,Math.abs(P.__r0.dot(qr)));let d=2*Math.acos(dd)*57.3;
        const W=__W;W.n++;W.hist[d<15?0:d<30?1:d<45?2:d<60?3:4]++;if(d>40&&W.big.length<60){const q=P._pose||{};W.big.push([+d.toFixed(0),q.anim?q.anim.k:'',q.kick?'kick:'+(q.kk||''):'',q.skill?q.skill.k:'',q.trap||'',+(q.mv||0).toFixed(2),q.back?'back':'',q.side?'side':'',q.own?'own':'',P.inf.gk?'gk':'',q.look!=null?+q.look.toFixed(1):'',q.turn!=null?+(+q.turn).toFixed(1):''])}}requestAnimationFrame(f)};requestAnimationFrame(f)})()""")
    await pg.wait_for_timeout(60000)
    r=await pg.evaluate("__W");tot=r['n'];print(json.dumps({'amostras':tot,'0-15':r['hist'][0],'15-30':r['hist'][1],'30-45':r['hist'][2],'45-60':r['hist'][3],'>60':r['hist'][4]}));
    import collections;c=collections.Counter(tuple(x[1:5]+[x[6],x[7],x[9]]) for x in r['big'])
    for k,v in c.most_common(12):print(v,k)
    print([x for x in r['big'][:15]],errs[:2]);await b.close()
asyncio.run(main())
