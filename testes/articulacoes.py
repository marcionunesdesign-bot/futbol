import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1]
JS="""(()=>{const e=C11Render3D.Hybrid.E;let T=1000;const realNow=performance.now.bind(performance);performance.now=()=>T*1000;
 const names=['thigh_l','thigh_r','calf_l','calf_r','spine_01','spine_02','spine_03','neck_01','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','pelvis'];const res={};
 const cases={corrida_queda:[{mv:1.3},{mv:0,anim:{k:'fall',a:.6}}],corrida_carrinho:[{mv:1.2},{mv:0,anim:{k:'slide',a:.4}}],parado_chute:[{mv:0},{mv:.5,kick:.5,kk:'shot'}],corrida_tropeco:[{mv:1.1},{mv:.4,anim:{k:'stumble',a:.3}}]};
 for(const sp of [1,2,4]){for(const [nm,[A,B]] of Object.entries(cases)){let mx=0,sum=0,n=0;const Ps=[...e.pl.values()].slice(0,8);
   for(const P of Ps){let gt=0;const st=i=>{const s=i%20<10?A:B;return Object.assign({t:gt},s)};
     for(let i=0;i<60;i++){T+=1/60;gt+=sp/60;const q0={};for(const k of names){const b=P.B[k];if(b)q0[k]=b.quaternion.clone()}P.pose(st(i));
       for(const k of names){const b=P.B[k];if(!b||!q0[k])continue;const a=2*Math.acos(Math.min(1,Math.abs(q0[k].dot(b.quaternion))));if(i%10===0&&i>0){mx=Math.max(mx,a)}sum+=a;n++}}}
   res[nm+'_'+sp+'x']=+mx.toFixed(2)}}
 performance.now=realNow;return res})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':640,'height':360})).new_page()
    await pg.goto(URL);await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal();U.go('match')");await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#mv-full').click()")
    await pg.wait_for_function("C11Render3D.Hybrid.E&&C11Render3D.Hybrid.E.ready",timeout=90000);await pg.wait_for_timeout(3000)
    await pg.evaluate("document.querySelector('#mv-pause')&&0")
    print(json.dumps(await pg.evaluate(JS)));await b.close()
asyncio.run(main())
