/* FUTBOL — multiplayer: liga entre amigos e partida ao vivo (lockstep pelo servidor) */
var ON=(function(){
'use strict';
const C=C11;const $=s=>document.querySelector(s);const esc=s=>U.esc(s);const money=C.money;
const S={tab:'liga',lid:null,league:null,live:null,poll:null,busy:false};
const api=(a,body,qs)=>ACC.api(a,body,qs);
/* ---------- time do técnico: foto do elenco atual (para os outros jogarem contra) ---------- */
function snapTeam(){const G=C.G,c=C.userClub(),t=G.tactic;C.validateLineup();
  const ids=[...t.lineup,...t.subs].filter(Boolean);const idx=new Map(ids.map((id,i)=>[id,i]));
  const players=ids.map(id=>{const p=G.players[id];return {n:p.n,p:p.p,t:{...p.t},mo:p.mo,re:p.re,fi:Math.max(85,p.fi||100),con:p.con,a:p.a,pe:p.pe,look:p.look||null}});
  const tk={};for(const k in (t.takers||{}))if(idx.has(t.takers[k]))tk[k]=idx.get(t.takers[k]);
  return {v:1,club:{name:c.name,short:c.short,kit:c.kit,acc:c.acc,div:c.div},mgr:G.manager,formation:t.formation,slots:JSON.parse(JSON.stringify(t.slots)),
    tactic:{ment:t.ment,press:t.press,tempo:t.tempo,width:t.width,line:t.line,pass:t.pass,takers:tk},nl:t.lineup.filter(Boolean).length,players,fam:G.fam,str:+C.teamStrength(c).toFixed(1),at:Date.now()}}
/* monta o time do snapshot dentro do jogo (clube e jogadores temporários, removidos depois) */
function mat(sn,side,tag){const G=C.G;const key='mp:'+side+':'+tag;const base=8e6+side*1e5;
  const ids=sn.players.map((p,i)=>{const id=base+i;G.players[id]={...p,t:{...p.t},id,c:key,st:{j:0,g:0,as:0},fm:[],w:0,v:0,pot:0,y:false,inj:0};return id});
  const dup=side===1&&G.clubs['mp:0:h']&&G.clubs['mp:0:h'].name===sn.club.name;const kit=dup?[sn.club.kit[1]||'#fff',sn.club.kit[0],sn.club.kit[2]||sn.club.kit[0],'liso']:sn.club.kit;
  G.clubs[key]={id:key,name:sn.club.name+(dup?' (2)':''),short:sn.club.short+(dup?' 2':''),kit,acc:sn.club.acc,div:sn.club.div||'A',players:ids,formation:sn.formation,fans:20000,level:70,money:0,youth:[]};
  const nl=sn.nl||11;const tac={...sn.tactic,takers:{}};for(const k in (sn.tactic.takers||{}))tac.takers[k]=ids[sn.tactic.takers[k]];
  return {club:G.clubs[key],slots:JSON.parse(JSON.stringify(sn.slots)),line:ids.slice(0,nl),subs:ids.slice(nl),tactic:tac,fam:sn.fam||70,boost:1}}
function cleanup(){const G=C.G;if(!G)return;for(const k of Object.keys(G.clubs))if(k.startsWith('mp:'))delete G.clubs[k];for(const id of Object.keys(G.players))if(+id>=8e6)delete G.players[id];
  if(G._tacBak){G.tactic=G._tacBak;delete G._tacBak}C.save()}
/* ---------- liga entre amigos ---------- */
function table(L){const rows={};for(const m of L.members)rows[m.uid]={uid:m.uid,name:m.name,club:m.team?m.team.club:null,j:0,v:0,e:0,d:0,gp:0,gc:0,pts:0};
  for(const r of L.results){const f=L.league.fixtures[r.rnd]&&L.league.fixtures[r.rnd][r.idx];if(!f)continue;const [h,a]=f,H=rows[h],A=rows[a];if(!H||!A)continue;const x=r.data;
    H.j++;A.j++;H.gp+=x.hg;H.gc+=x.ag;A.gp+=x.ag;A.gc+=x.hg;if(x.hg>x.ag){H.v++;H.pts+=3;A.d++}else if(x.hg<x.ag){A.v++;A.pts+=3;H.d++}else{H.e++;A.e++;H.pts++;A.pts++}}
  return Object.values(rows).sort((a,b)=>b.pts-a.pts||(b.gp-b.gc)-(a.gp-a.gc)||b.gp-a.gp)}
function memberOf(L,uid){return L.members.find(m=>m.uid===uid)}
async function loadLeague(id){const j=await api('mpl_get',null,'&id='+id);S.league=j;S.lid=id;return j}
function teamsFor(L,f){const h=memberOf(L,f[0]),a=memberOf(L,f[1]);if(!h||!a||!h.team||!a.team)throw new Error('Um dos técnicos ainda não enviou o time.');return [h,a]}
function resOf(L,rnd,idx){return L.results.find(r=>r.rnd===rnd&&r.idx===idx)}
function compact(r,m){return {hg:r.hg,ag:r.ag,sc:(r.scorers||[]).map(id=>{const p=C.G.players[id];return p?p.n:''}).filter(Boolean).slice(0,12),st:[]}}
async function playFixture(idx,watch){const L=S.league;const rnd=L.league.round;const f=L.league.fixtures[rnd][idx];const [h,a]=teamsFor(L,f);
  const us=f[0]===L.me?0:f[1]===L.me?1:0;cleanup();const H=mat(h.team,0,'h'),Aw=mat(a.team,1,'a');const seed=watch?null:(L.league.seed+rnd*97+idx*13)>>>0;
  if(watch){// o técnico mexe no próprio time durante o jogo: a tática da partida vira a tática ativa
    const G=C.G,mine=us===0?H:Aw,sn=us===0?h.team:a.team;G._tacBak=G.tactic;G.tactic={...JSON.parse(JSON.stringify(G._tacBak)),...mine.tactic,formation:sn.formation,slots:mine.slots,lineup:mine.line,subs:mine.subs};mine.tactic=G.tactic}
  const onEnd=async r=>{const data={hg:r.hg,ag:r.ag,sc:(r.scorers||[]).map(id=>C.G.players[id]?C.G.players[id].n:'').filter(Boolean),live:!!watch};cleanup();
    try{await api('mpl_result',{id:L.league.id,rnd,idx,data});U.toast(`Resultado enviado: ${h.team.club.short} ${r.hg} × ${r.ag} ${a.team.club.short}`)}catch(e){U.toast('⚠️ '+esc(e.message))}
    await loadLeague(L.league.id);U.go('online')};
  MV.startOnline({home:H,away:Aw,us,seed,label:`${esc(L.league.name)} · Rodada ${rnd+1}`,quick:!watch,onEnd})}
function playFixtureQuick(idx){return new Promise(res=>{const L=S.league;const rnd=L.league.round;const f=L.league.fixtures[rnd][idx];const [h,a]=teamsFor(L,f);cleanup();const H=mat(h.team,0,'h'),Aw=mat(a.team,1,'a');
  const m=new C11Match.Match(H,Aw,{userSide:0,seed:(L.league.seed+rnd*97+idx*13)>>>0,humans:[]});m.runToEnd();const r=m.result();const data={hg:r.hg,ag:r.ag,sc:(r.scorers||[]).map(id=>C.G.players[id]?C.G.players[id].n:'').filter(Boolean)};cleanup();
  api('mpl_result',{id:L.league.id,rnd,idx,data}).catch(e=>U.toast('⚠️ '+esc(e.message))).then(res)})}
/* ---------- partida ao vivo: lockstep ---------- */
function makeNet(id,side){const DELAY=60;const n={id,side,DELAY,other:-1,since:0,out:[],sched:new Map(),seen:new Set(),lastSent:null,lastApplied:null,seq:0,m:null,timer:null,ended:false};
  n.maxTick=()=>n.other+DELAY;
  const tacOf=(t,slots)=>JSON.stringify({v:{ment:t.ment,press:t.press,tempo:t.tempo,width:t.width,line:t.line,pass:t.pass},slots:(slots||[]).map(s=>({fn:s.fn,arrow:s.arrow||null,a:s.a,df:s.df}))});
  n.attach=m=>{n.m=m;const T=m.T[side];n.lastApplied=tacOf(T.tac,T.slots);n.lastSent=tacOf(C.G.tactic,C.G.tactic.slots);
    const orig=m.sub.bind(m);m._sub=orig;m.sub=(s,o,i)=>{if(s!==side||n.applying)return orig(s,o,i);n.push({t:'sub',o,i});U.toast('🔁 Substituição enviada: entra em 2 s nas duas telas.')};
    n.timer=setInterval(n.sync,250);n.sync()};
  n.push=cmd=>{cmd.u=side+':'+(++n.seq)+':'+Date.now();const tick=n.m.tick+DELAY;n.out.push({tick,cmd});n.add(side,tick,cmd)};
  n.add=(sd,tick,cmd)=>{if(n.seen.has(cmd.u))return;n.seen.add(cmd.u);if(!n.sched.has(tick))n.sched.set(tick,[]);n.sched.get(tick).push({sd,cmd});n.sched.get(tick).sort((a,b)=>a.sd-b.sd||(a.cmd.u<b.cmd.u?-1:1))};
  n.apply=m=>{const L=n.sched.get(m.tick);if(!L)return;n.sched.delete(m.tick);n.applying=true;for(const {sd,cmd} of L){const T=m.T[sd];
      try{if(cmd.t==='tac'){Object.assign(T.tac,cmd.v.v);(cmd.v.slots||[]).forEach((s,k)=>{if(T.slots[k])Object.assign(T.slots[k],JSON.parse(JSON.stringify(s)))});if(sd===side)n.lastApplied=tacOf(T.tac,T.slots)}
        else if(cmd.t==='sub'){m.sub(sd,cmd.o,cmd.i);if(sd===side)try{MV&&0}catch(e){}}}catch(e){}}n.applying=false};
  n.watch=m=>{const T=m.T[side];const cur=tacOf(T.tac,T.slots);if(cur!==n.lastApplied){// mudança feita direto no motor (botões rápidos): vira comando
      const o=JSON.parse(cur);Object.assign(C.G.tactic,o.v);const back=JSON.parse(n.lastApplied);Object.assign(T.tac,back.v);back.slots.forEach((s,k)=>{if(T.slots[k])Object.assign(T.slots[k],s)})}
    const want=tacOf(C.G.tactic,C.G.tactic.slots);if(want!==n.lastSent){n.lastSent=want;n.push({t:'tac',v:JSON.parse(want)})}};
  n.sync=async()=>{if(n.busy||!n.m)return;n.busy=true;try{const out=n.out.splice(0);const fin=n.m.phase==='ft'&&side===0&&!n.ended?n.m.result():null;
      const j=await api('live_post',{id,hb:n.m.tick,since:n.since,cmds:out,result:fin?{hg:fin.hg,ag:fin.ag}:undefined});if(fin)n.ended=true;for(const c of j.cmds){n.since=Math.max(n.since,c.id);if(c.side!==side)n.add(c.side,c.tick,c.cmd)}n.other=j.hb[1-side];
      if(n.m.phase==='ft'&&(side===1||n.ended))n.stop()}catch(e){console.warn(e)}n.busy=false};
  n.stop=()=>{clearInterval(n.timer);n.timer=null};
  return n}
async function liveStart(id){const j=await api('live_get',null,`&id=${id}&full=1`);const side=j.side;cleanup();
  const H=mat(j.teams[0],0,'h'),Aw=mat(j.teams[1],1,'a');const G=C.G;G._tacBak=G.tactic;const mine=side===0?H:Aw;
  G.tactic=JSON.parse(JSON.stringify({...G._tacBak,formation:j.teams[side].formation,slots:mine.slots,lineup:mine.line,subs:mine.subs,...j.teams[side].tactic,takers:mine.tactic.takers}));
  const net=makeNet(id,side);
  MV.startOnline({home:H,away:Aw,us:side,seed:j.seed,net,label:`Ao vivo · ${esc(j.names[0])} × ${esc(j.names[1])}`,onEnd:async r=>{net.stop();cleanup();let msg=`Fim: ${r.hg} × ${r.ag}`;if(side===1){for(let k=0;k<6;k++){try{const g=await api('live_get',null,`&id=${id}`);if(g.result){if(g.result.hg!==r.hg||g.result.ag!==r.ag)msg=`Resultado oficial (mandante): ${g.result.hg} × ${g.result.ag}`;break}}catch(e){}await new Promise(z=>setTimeout(z,800))}}S.live=null;U.toast(msg);U.go('online')}})}
function stopPoll(){if(S.poll){clearInterval(S.poll);S.poll=null}}
async function livePoll(){if(!S.live)return;try{const j=await api('live_get',null,`&id=${S.live.id}`);S.live.st=j;if(j.status==='play'&&!S.live.started){S.live.started=true;stopPoll();await liveStart(S.live.id);return}if(U.view==='online')render()}catch(e){}}
/* ---------- tela ---------- */
async function render(){const el=$('#v-online');if(!el)return;stopPoll();
  if(!ACC.st.online){el.innerHTML=head()+`<div class="frame"><p>O modo online precisa do jogo aberto pelo site (ondasites.com.br/futbol).</p></div>`;return}
  if(!ACC.st.user){el.innerHTML=head()+`<div class="frame on-login"><div class="on-ic">🌐</div><h2>Entre na sua conta para jogar online</h2><p class="muted">Crie uma liga com seus amigos ou desafie alguém ao vivo, cada um com o time da sua carreira.</p><button class="btn big" id="on-login">Entrar ou criar conta</button></div>`;$('#on-login').onclick=()=>ACC.authForm(()=>render());return}
  const tabs=`<div class="seg on-tabs"><button data-ontab="liga" class="${S.tab==='liga'?'on':''}">🏆 Liga dos amigos</button><button data-ontab="live" class="${S.tab==='live'?'on':''}">🔴 Partida ao vivo</button></div>`;
  let body='';
  if(S.tab==='liga'){
    if(S.lid&&S.league){body=leagueHtml(S.league)}
    else{let L=[];try{L=(await api('mpl_list')).leagues}catch(e){}
      body=`<div class="grid on-g"><div class="frame"><div class="h">Suas ligas</div>${L.length?L.map(l=>`<button class="on-row" data-onl="${l.id}"><b>${esc(l.name)}</b><span>${l.n} técnico(s) · ${l.status==='open'?'aguardando início':l.status==='done'?'encerrada':'rodada '+(l.round+1)} · código <code>${esc(l.code)}</code></span><i>›</i></button>`).join(''):'<p class="muted">Você ainda não está em nenhuma liga.</p>'}</div>
       <div class="col" style="gap:14px"><div class="frame"><div class="h">Criar liga</div><p class="muted" style="margin:0 0 8px">Você recebe um código para mandar aos amigos. Cada um entra com o time atual da carreira dele.</p><div class="row"><input type="text" id="on-lname" placeholder="Nome da liga" style="flex:1"><button class="btn sm" id="on-create">Criar</button></div></div>
       <div class="frame"><div class="h">Entrar numa liga</div><div class="row"><input type="text" id="on-lcode" placeholder="Código (ex.: K7Q2XM)" style="flex:1;text-transform:uppercase"><button class="btn sm" id="on-join">Entrar</button></div></div>
       <div class="frame on-how"><div class="h">Como funciona</div><ol><li>Crie a liga e mande o código no WhatsApp.</li><li>Cada técnico envia o time da sua carreira (escalação, tática e jogadores).</li><li>O criador começa a liga: turno e returno, todos contra todos.</li><li>Em cada rodada você joga o seu jogo assistindo e mexendo no time; o time do amigo joga com a tática que ele deixou.</li><li>O criador pode simular os jogos pendentes para a rodada andar.</li></ol></div></div></div>`}}
  else{const lv=S.live;
    if(lv&&lv.st){const j=lv.st;const me=j.side;body=`<div class="frame on-live"><div class="eyebrow">Partida ao vivo</div><div class="on-code">${esc(j.code)}</div><p class="muted">Mande esse código para o seu adversário. Quando os dois estiverem prontos, a partida começa ao mesmo tempo nas duas telas.</p>
      <div class="on-vs"><div class="${j.names[0]?'ok':''}"><b>${esc(j.names[0]||'—')}</b><small>${j.ready[0]?'✅ pronto':'mandante'}</small></div><i>×</i><div class="${j.names[1]?'ok':''}"><b>${esc(j.names[1]||'aguardando…')}</b><small>${j.names[1]?(j.ready[1]?'✅ pronto':'visitante'):'esperando entrar'}</small></div></div>
      ${j.status==='ready'&&!j.ready[me]?'<button class="btn big" id="on-ready">✅ Estou pronto</button>':j.status==='wait'?'<div class="on-wait"><span></span>Esperando o adversário entrar com o código…</div>':'<div class="on-wait"><span></span>Esperando o adversário confirmar…</div>'}
      <button class="btn ghost sm" id="on-lvcancel" style="margin-top:10px">Sair</button></div>`}
    else body=`<div class="grid on-g"><div class="frame"><div class="h">Desafiar um amigo</div><p class="muted" style="margin:0 0 10px">Os dois técnicos jogam a mesma partida ao vivo, cada um no seu aparelho: mudanças de tática e substituições aparecem nas duas telas (com 2 s de atraso, para ficar igual para os dois).</p><button class="btn big" id="on-lvcreate">🔴 Criar partida ao vivo</button></div>
      <div class="frame"><div class="h">Tenho um código</div><div class="row"><input type="text" id="on-lvcode" placeholder="Código da partida" style="flex:1;text-transform:uppercase"><button class="btn sm" id="on-lvjoin">Entrar</button></div><p class="dim" style="font-size:12.5px">Você entra com o time da sua carreira atual. O resultado não conta na sua temporada.</p></div></div>`}
  el.innerHTML=head()+tabs+body;bind();
  if(S.tab==='live'&&S.live&&!S.live.started)S.poll=setInterval(livePoll,1500)}
function head(){return `<div class="page-head"><div><div class="eyebrow">Multiplayer</div><h1 class="title">Online</h1></div><div class="sp"></div>${ACC.st.user?`<div class="stat" style="text-align:right"><b>${esc(ACC.st.user.name)}</b><span>conectado</span></div>`:''}</div>`}
function leagueHtml(L){const lg=L.league;const me=L.me;const owner=lg.owner===me;const T=table(L);const mine=memberOf(L,me);const rnd=lg.round;const fx=lg.fixtures[rnd]||[];
  const nm=uid=>{const m=memberOf(L,uid);return m?(m.team?m.team.club.short:m.name):'?'};
  const crestOf=uid=>{const m=memberOf(L,uid);return m&&m.team?U.crest({kit:m.team.club.kit,short:m.team.club.short,name:m.team.club.name},22):''};
  return `<div class="row" style="margin-bottom:10px"><button class="btn ghost sm" id="on-back">‹ Ligas</button><div class="sp"></div><span class="dim">Código para convidar: <code class="on-c">${esc(lg.code)}</code></span></div>
  <div class="grid on-g"><div class="col" style="gap:14px"><div class="frame"><div class="h">${esc(lg.name)} <small>${lg.status==='open'?'aguardando início':lg.status==='done'?'encerrada':`rodada ${rnd+1} de ${lg.fixtures.length}`}</small></div>
    <table><thead><tr><th>#</th><th>Clube · técnico</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${T.map((r,i)=>`<tr class="${r.uid===me?'me':''}"><td>${i+1}</td><td><div class="row">${crestOf(r.uid)}<b>${esc(r.club?r.club.short:'—')}</b><span class="dim">· ${esc(r.name)}</span></div></td><td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.gp-r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div>
    ${lg.status==='running'?`<div class="frame"><div class="h">Rodada ${rnd+1}</div>${fx.map((f,i)=>{const r=resOf(L,rnd,i);const mineF=f.includes(me);return `<div class="on-fx ${mineF?'me':''}"><span>${crestOf(f[0])}${esc(nm(f[0]))}</span><b>${r?`${r.data.hg} × ${r.data.ag}`:'×'}</b><span>${esc(nm(f[1]))}${crestOf(f[1])}</span>${!r&&mineF?`<button class="btn xs" data-onplay="${i}">▶ Jogar</button><button class="btn ghost xs" data-onquick="${i}">Rápido</button>`:''}</div>${r&&r.data.sc&&r.data.sc.length?`<div class="dim on-sc">⚽ ${r.data.sc.map(esc).join(', ')}</div>`:''}`}).join('')}
      ${owner&&fx.some((f,i)=>!resOf(L,rnd,i))?'<button class="btn ghost sm" id="on-simall" style="margin-top:8px">Simular jogos pendentes da rodada</button>':''}</div>`:''}</div>
   <div class="col" style="gap:14px"><div class="frame"><div class="h">Técnicos</div>${L.members.map(m=>`<div class="on-mem"><b>${esc(m.name)}</b><span>${m.team?`${esc(m.team.club.name)} · força ${m.team.str}`:'⏳ ainda não enviou o time'}</span></div>`).join('')}
     <button class="btn sm" id="on-send" style="margin-top:8px">${mine&&mine.team?'Atualizar meu time':'Enviar meu time'}</button><p class="dim" style="font-size:12px;margin:6px 0 0">Envia a escalação, a tática e os jogadores da sua carreira atual (${esc(C.userClub().name)}).</p></div>
    ${lg.status==='open'?`<div class="frame"><div class="h">Começar</div>${owner?`<p class="muted" style="margin:0 0 8px">Precisa de pelo menos 2 técnicos com time enviado.</p><div class="row"><button class="btn" data-onstart="2">Começar (ida e volta)</button><button class="btn ghost" data-onstart="1">Só ida</button></div>`:'<p class="muted" style="margin:0">Aguardando o criador começar a liga.</p>'}<button class="btn ghost xs" id="on-leave" style="margin-top:8px">Sair da liga</button></div>`:''}</div></div>`}
function bind(){const on=(s,f)=>{const e=$(s);if(e)e.onclick=U.err(f)};
  document.querySelectorAll('[data-ontab]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.ontab;render()});
  document.querySelectorAll('[data-onl]').forEach(b=>b.onclick=U.err(async()=>{await loadLeague(+b.dataset.onl);render()}));
  on('#on-create',async()=>{const j=await api('mpl_create',{name:$('#on-lname').value,team:snapTeam()});U.toast(`Liga criada! Código ${j.code}`);await loadLeague(j.id);render()});
  on('#on-join',async()=>{const j=await api('mpl_join',{code:$('#on-lcode').value,team:snapTeam()});U.toast('Você entrou na liga.');await loadLeague(j.id);render()});
  on('#on-back',()=>{S.lid=null;S.league=null;render()});
  on('#on-send',async()=>{await api('mpl_team',{id:S.lid,team:snapTeam()});U.toast('Time enviado.');await loadLeague(S.lid);render()});
  on('#on-leave',async()=>{if(!confirm('Sair desta liga?'))return;await api('mpl_leave',{id:S.lid});S.lid=null;S.league=null;render()});
  document.querySelectorAll('[data-onstart]').forEach(b=>b.onclick=U.err(async()=>{await api('mpl_start',{id:S.lid,turns:+b.dataset.onstart});U.toast('A liga começou!');await loadLeague(S.lid);render()}));
  document.querySelectorAll('[data-onplay]').forEach(b=>b.onclick=U.err(()=>playFixture(+b.dataset.onplay,true)));
  document.querySelectorAll('[data-onquick]').forEach(b=>b.onclick=U.err(()=>playFixture(+b.dataset.onquick,false)));
  on('#on-simall',async()=>{const L=S.league;const rnd=L.league.round;for(let i=0;i<L.league.fixtures[rnd].length;i++)if(!resOf(L,rnd,i))await playFixtureQuick(i);await loadLeague(S.lid);U.toast('Rodada simulada.');render()});
  on('#on-lvcreate',async()=>{const j=await api('live_create',{team:snapTeam()});S.live={id:j.id};await livePoll();render()});
  on('#on-lvjoin',async()=>{const j=await api('live_join',{code:$('#on-lvcode').value,team:snapTeam()});S.live={id:j.id};await livePoll();render()});
  on('#on-ready',async()=>{await api('live_ready',{id:S.live.id});await livePoll();render()});
  on('#on-lvcancel',()=>{S.live=null;render()});}
return {render,cleanup,snapTeam,get S(){return S}};
})();
