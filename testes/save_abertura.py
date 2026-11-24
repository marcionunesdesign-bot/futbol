import asyncio
from playwright.async_api import async_playwright
B='http://127.0.0.1:8811/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(viewport={'width':390,'height':844});a=await c.new_page();errs=[];a.on('pageerror',lambda e:errs.append(str(e)))
    await a.goto(B);await a.wait_for_timeout(1500)
    await a.evaluate("""(async()=>{await ACC.api('register',{email:'b@t.com',password:'segredo1',name:'M'}).catch(()=>0);const j=await ACC.api('login',{email:'b@t.com',password:'segredo1'});ACC.st.user=j.user;
      C11.newGame('Vasco da Gama','M');C11.G.slot=1;C11.G.season=2031;C11.G.date=1;C11.save();await ACC.push();
      /* este aparelho fica com uma cópia velha (2030), como no seu computador */ACC.st.user=null;const g=JSON.parse(JSON.stringify(C11.G));g.season=2030;g.date=22;g.savedAt=1;localStorage.setItem('camisa11-save-v4',JSON.stringify(g));})()""")
    await a.reload();await a.wait_for_timeout(3500)
    print('ao abrir o app: temporada',await a.evaluate("C11.G.season"),'rodada',await a.evaluate("C11.G.date"),'| aviso:',await a.evaluate("(document.querySelector('#toast')||{}).textContent||''"),errs[:2])
    await b.close()
asyncio.run(main())
