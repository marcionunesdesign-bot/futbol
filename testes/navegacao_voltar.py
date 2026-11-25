import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await (await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
    await pg.click('[data-div=A]');await pg.click('#s-go');await pg.wait_for_timeout(1200);await pg.evaluate("U.closeModal&&U.closeModal()")
    v=lambda: pg.evaluate("document.body&&document.body.dataset.view")
    print('voltar visível no início?',await pg.evaluate("!document.querySelector('#b-back').hidden"))
    await pg.tap('.tile[data-go=league]');await pg.wait_for_timeout(400)
    print('liga, botão voltar visível:',await pg.is_visible('#b-back'));await pg.screenshot(path='/tmp/n2.png')
    await pg.go_back();await pg.wait_for_timeout(500);print('1) voltar do celular na Liga ->',await v())
    await pg.tap('.tile[data-go=squad]');await pg.wait_for_timeout(300);await pg.tap('#nav [data-go=tactics]');await pg.wait_for_timeout(300);await pg.tap('#nav [data-go=training]');await pg.wait_for_timeout(300)
    await pg.go_back();await pg.wait_for_timeout(500);print('2) plantel>tática>treino, voltar ->',await v())
    await pg.tap('#nav [data-go=squad]');await pg.wait_for_timeout(300);await pg.tap('#b-back');await pg.wait_for_timeout(400);print('3) botão voltar do topo ->',await v())
    await pg.tap('#nav [data-go=squad]');await pg.wait_for_timeout(300);await pg.tap('#nav [data-go=home]');await pg.wait_for_timeout(400);print('4) Início na barra ->',await v())
    await pg.tap('#nav [data-go=squad]');await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('[data-player]').click()");await pg.wait_for_timeout(400)
    print('ficha aberta:',await pg.evaluate("!document.querySelector('#modal').hidden"))
    await pg.go_back();await pg.wait_for_timeout(500);print('5) voltar com ficha aberta -> modal fechado:',await pg.evaluate("document.querySelector('#modal').hidden"),'tela:',await v())
    await pg.go_back();await pg.wait_for_timeout(500);print('6) voltar de novo ->',await v(), pg.url)
    print('erros',errs[:3]);await b.close()
asyncio.run(main())
