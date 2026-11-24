import asyncio,json
from playwright.async_api import async_playwright
B='http://127.0.0.1:8811/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();errs=[]
    # Aparelho A: conta, carreira, avança e envia; depois avança mais (nuvem fica para trás)
    c1=await b.new_context(viewport={'width':390,'height':844});a=await c1.new_page();a.on('pageerror',lambda e:errs.append('A '+str(e)))
    await a.goto(B);await a.wait_for_timeout(1500)
    r=await a.evaluate("""(async()=>{await ACC.api('register',{email:'m@t.com',password:'segredo1',name:'Márcio'}).catch(()=>0);const j=await ACC.api('login',{email:'m@t.com',password:'segredo1'});ACC.st.user=j.user;
      C11.newGame('Vasco da Gama','Márcio');C11.G.slot=1;C11.G.date=2;C11.save();await ACC.push();
      // progresso que não chegou à nuvem (app fechado antes do envio)
      ACC.st.user=null;C11.G.date=9;C11.G.fac=C11.G.fac||{};C11.G.fac.estadio=4;C11.save();await CAR.put(C11.G);ACC.st.user=j.user;
      return {local:C11.current().date}})()""")
    print('A local:',r)
    # 1) mesma máquina: "Jogar" na nuvem (antiga) deve abrir a versão do aparelho (data 9)
    r2=await a.evaluate("""(async()=>{await ACC.list();const g=await ACC.load(1);await new Promise(r=>setTimeout(r,800));const s=await ACC.api('load',null,'&slot=1');return {aberta:g.date,estadio:(g.fac||{}).estadio,nuvem_agora:s.data.date}})()""")
    print('1) Jogar da nuvem num aparelho mais avançado:',r2)
    # 2) aparelho B desatualizado tenta salvar por cima: servidor recusa
    c2=await b.new_context(viewport={'width':390,'height':844});bb=await c2.new_page();bb.on('pageerror',lambda e:errs.append('B '+str(e)))
    await bb.goto(B);await bb.wait_for_timeout(1500)
    r3=await bb.evaluate("""(async()=>{const j=await ACC.api('login',{email:'m@t.com',password:'segredo1'});ACC.st.user=j.user;const s=await ACC.api('load',null,'&slot=1');const g=s.data;g.date=3;g.slot=1;C11.loadObj(g);
      const res=await ACC.api('save',{slot:1,meta:{prog:C11.progressOf(g),rev:1},data:g});const s2=await ACC.api('load',null,'&slot=1');return {resposta:res.stale?'recusado (versão velha)':'aceito',nuvem_continua:s2.data.date}})()""")
    print('2) aparelho desatualizado tentando salvar:',r3)
    # 3) Continuar: biblioteca do aparelho com cópia velha, atual mais nova
    r4=await a.evaluate("""(async()=>{const g=JSON.parse(JSON.stringify(C11.G));g.date=1;g.savedAt=1;await CAR.put(g);/* biblioteca velha */
      return true})()""")
    await a.reload();await a.wait_for_timeout(1500)
    btn=await a.evaluate("(()=>{const b=document.querySelector('[data-lload]');return b?b.textContent:null})()")
    await a.evaluate("document.querySelector('[data-lload]').click()");await a.wait_for_timeout(1200)
    print('3) botão',btn,'na lista do aparelho abriu a rodada',await a.evaluate("C11.G.date"),'(a atual era 9)')
    print('erros:',errs[:3]);await b.close()
asyncio.run(main())
