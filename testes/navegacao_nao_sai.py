import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    navs=[];pg.on('framenavigated',lambda f:navs.append(f.url) if f==pg.main_frame else None)
    await pg.goto('http://localhost:8769/?jogar');await pg.wait_for_timeout(1000)
    await pg.evaluate("(document.querySelector('[data-ns=div]')||{click(){}}).click()");await pg.click('[data-div=D]');await pg.click('[data-pick]:nth-child(2)');await pg.click('.ns-bar .ns-btn');await pg.fill('#s-name','M');await pg.click('#s-go');await pg.wait_for_timeout(1500)
    await pg.evaluate("U.closeModal&&U.closeModal();window.__vivo=1");n0=0
    v=lambda: pg.evaluate("document.body.dataset.view")
    await pg.tap('.tile[data-go=league]');await pg.wait_for_timeout(300);await pg.go_back();await pg.wait_for_timeout(400);print('1 liga+voltar ->',await v())
    await pg.tap('.tile[data-go=squad]');await pg.wait_for_timeout(300);await pg.evaluate("document.querySelector('tr[data-player]').click()");await pg.wait_for_timeout(400)
    await pg.go_back();await pg.wait_for_timeout(400);print('2 ficha+voltar ->',await v())
    await pg.go_back();await pg.wait_for_timeout(400);print('3 voltar ->',await v())
    # aviso aberto/fechado e troca rápida de telas (o caso do bug)
    for k in range(4):
      await pg.evaluate("U.openModal('<p>teste</p>')");await pg.evaluate("U.closeModal();U.go('training');U.go('match');U.go('squad')");await pg.wait_for_timeout(200)
      await pg.tap('#nav [data-go=home]');await pg.wait_for_timeout(300)
    print('4 Início depois de avisos ->',await v(),'| continua no jogo?',await pg.evaluate('window.__vivo===1'), pg.url)
    await pg.tap('#nav [data-go=squad]');await pg.wait_for_timeout(300);await pg.tap('#b-back');await pg.wait_for_timeout(300);print('5 seta do topo ->',await v())
    await pg.tap('#b-menu');await pg.wait_for_timeout(300);await pg.go_back();await pg.wait_for_timeout(400);print('6 menu fechado pelo voltar:',await pg.evaluate("document.querySelector('#modal').hidden"),'| continua no jogo?',await pg.evaluate('window.__vivo===1'))
    print('erros',errs[:3]);await b.close()
asyncio.run(main())
