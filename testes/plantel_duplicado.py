import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8769/index.html');await pg.wait_for_timeout(800)
    r=await pg.evaluate("""()=>{const C=C11;C.newGame(C.D.divisions.B[3],'T');const G=C.G;
      const where=pid=>Object.keys(G.clubs).filter(id=>G.clubs[id].players.includes(pid));
      /* 1) jogador de outro clube num lote aberto; você compra por proposta antes do leilão fechar */
      const L=G.auction&&G.auction.lots.find(l=>!l.mine&&!l.done&&l.seller);let out={};
      if(L){const pl=G.players[L.pid];G.clubs[G.user].money=2e9;C.makeOffer(pl.id,1e9,pl.w*3);
        const i=G.auction.lots.indexOf(L);try{C.closeLot(i,null)}catch(e){out.err=e.message}
        out.lote={jogador:pl.n,clubes:where(pl.id),dono:pl.c,cancelado:!!L.cancel}}
      /* 2) save estragado: um jogador seu aparece também em outro clube; um de outro clube aparece no seu */
      const u=G.clubs[G.user];const other=G.clubs[G.div.A[0]];const mine=u.players[0];const theirs=other.players[0];
      other.players.push(mine);u.players.push(theirs);const n=C.fixRosters();
      out.reparo={consertos:n,meu:where(mine),deles:where(theirs),dono_deles:G.players[theirs].c,eu:G.user};
      let dup=0;const seen={};for(const id in G.clubs)for(const pid of G.clubs[id].players){if(seen[pid])dup++;seen[pid]=1;if(G.players[pid].c!==id)dup++}out.problemas_restantes=dup;return out}""")
    print(json.dumps(r,ensure_ascii=False,indent=1),errs);await b.close()
asyncio.run(main())
