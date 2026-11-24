import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/public/index.html');await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('[data-div=A]').click()");await pg.evaluate("document.querySelector('#s-go').click()");await pg.wait_for_timeout(800)
    await pg.evaluate("U.closeModal&&U.closeModal()")
    for caso in ['simples','convite']:
      s0=await pg.evaluate("C11.G.season")
      await pg.evaluate("""(()=>{const s=C11.G.season;let n=0;while(C11.G.season===s&&n<200){try{C11.finishDate(null)}catch(e){};n++}C11.G.celeQ=[];C11.G.fortune=null;return n})()""")
      if caso=='convite': await pg.evaluate("C11.G.jobOffers={sacked:false,list:C11.G.div.B.slice(0,2)}")
      else: await pg.evaluate("C11.G.jobOffers=null")
      await pg.evaluate("U.closeModal&&U.closeModal();U.go('home');document.querySelector('#b-continue').click()");await pg.wait_for_timeout(900)
      r1=await pg.evaluate("(()=>{const m=document.querySelector('#modal');return {aberto:!m.hidden,resumo:!!m.querySelector('.rs-step'),convite:!!m.querySelector('.job-wrap')}})()")
      if r1['resumo']:
        await pg.evaluate("document.querySelector('[data-recapend]').click()");await pg.wait_for_timeout(500)
      r2=await pg.evaluate("(()=>{const m=document.querySelector('#modal');return {aberto:!m.hidden,convite:!!m.querySelector('.job-wrap')}})()")
      print(caso,'temporada',s0,'->',await pg.evaluate("C11.G.season"),'| ao continuar:',r1,'| depois de fechar o resumo:',r2)
      await pg.evaluate("U.closeModal();C11.G.jobOffers=null")
    # resumo pendente ao reabrir
    await pg.evaluate("(()=>{C11.G.lastSummary=C11.G.seasonLog.slice(-1)[0];C11.save()})()")
    await pg.reload();await pg.wait_for_timeout(1500)
    print('ao reabrir o app com resumo pendente:',await pg.evaluate("(()=>{const m=document.querySelector('#modal');return {aberto:!m.hidden,resumo:!!m.querySelector('.rs-step')}})()"),errs[:3])
    await b.close()
asyncio.run(main())
