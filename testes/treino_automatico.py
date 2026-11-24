import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.click('[data-div=A]');await pg.click('#s-go');await pg.wait_for_timeout(1200);await pg.evaluate("U.closeModal&&U.closeModal()")
    await pg.evaluate("U.go('match')");await pg.wait_for_timeout(800)
    print('aviso com botão:',await pg.evaluate("!!document.querySelector('[data-autotrain]')"),'pendente antes:',await pg.evaluate("C11.G.trainPending"))
    await pg.click('[data-autotrain]');await pg.wait_for_timeout(600)
    print('ligado:',await pg.evaluate("C11.G.autoTrain"),'pendente depois:',await pg.evaluate("C11.G.trainPending"),'toast:',await pg.evaluate("(document.querySelector('#toast')||{}).textContent"))
    r=await pg.evaluate("""(()=>{const g=C11.G;const um=C11.nextUserMatch();const before=g.trainLog;C11.finishDate({hg:1,ag:0,home:um.home,away:um.away,minutes:{},scorers:[],cards:[],stats:{}});return {pendente_apos_jogo:g.trainPending,treino_auto:g.autoLog}})()""")
    print('depois de um jogo:',r)
    await pg.evaluate("U.go('training')");await pg.wait_for_timeout(500)
    print('tela de treino:',await pg.evaluate("(document.querySelector('.tauto')||{}).textContent"))
    await pg.screenshot(path='/tmp/tauto.png');print(errs[:3]);await b.close()
asyncio.run(main())
