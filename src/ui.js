/* Camisa 11 — interface */
var U=(function(){
'use strict';
const C=C11,MM=C11Match,RR=C11Render,A=C11Audio;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const G=()=>C.G;const P=id=>C.G.players[id];const money=C.money;
let view='home';const S={sel:null,tab:'a',tool:'move',rival:false,sort:{k:'pos',d:1},league:null,lot:0,reveal:null,squadF:'all',selArrow:null};
function toast(t){const e=$('#toast');e.innerHTML=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),3200)}
function err(f){return(...a)=>{try{return f(...a)}catch(e){toast('⚠️ '+esc(e.message));console.error(e)}}}

/* ---------- cores do clube ---------- */
const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255]};
const mix=(h,t,f)=>{const a=hex(h),b=hex(t);return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*f).toString(16).padStart(2,'0')).join('')};
const lum=h=>{const [r,g,b]=hex(h).map(v=>v/255);return .2126*r+.7152*g+.0722*b};
const PREF=Object.assign({acc:'club',custom:'#1f8f4e',font:1,motion:true,cam:'tv',speed:1,crowdTxt:true},(()=>{try{return JSON.parse(localStorage.getItem('c11-ui')||'{}')}catch(e){return {}}})());
function savePref(){try{localStorage.setItem('c11-ui',JSON.stringify(PREF))}catch(e){}applyPref()}
function isLight(){const m=PREF.mode||'dark';return m==='light'||(m==='auto'&&matchMedia('(prefers-color-scheme: light)').matches)}
function effW(){const w=innerWidth/(PREF.font||1);document.body.classList.toggle('effnarrow',w<1180);document.body.classList.toggle('effxs',w<370)}
addEventListener('resize',()=>effW());
function applyPref(){document.body.style.zoom=PREF.font!==1?PREF.font:'';document.documentElement.style.setProperty('--z',PREF.font||1);effW();document.body.classList.toggle('nomotion',!PREF.motion);const L=isLight();document.body.classList.toggle('light',L);const tc=document.querySelector('meta[name=theme-color]');if(tc)tc.content=L?'#ffffff':'#0b0c0e'}
try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{if(PREF.mode==='auto')applyPref()})}catch(e){}
function theme(club){const r=document.documentElement.style;const acc=PREF.acc==='custom'?PREF.custom:club.acc;
  r.setProperty('--acc',acc);r.setProperty('--acc2',mix(acc,'#ffffff',.3));r.setProperty('--accd',mix(acc,'#000000',.45));r.setProperty('--accink',lum(acc)>.55?'#121212':'#ffffff');
  r.setProperty('--c1',club.kit[0]);r.setProperty('--c2',club.kit[1]);document.querySelector('meta[name=theme-color]')?.setAttribute('content',isLight()?'#ffffff':'#0b0c0e')}
function patCss(k){const [c1,c2,c3,p]=k;
  if(p==='listras')return `repeating-linear-gradient(90deg,${c1} 0 44px,${c2} 44px 88px)`;
  if(p==='listras_h')return `repeating-linear-gradient(0deg,${c1} 0 40px,${c2} 40px 80px)`;
  if(p==='faixa')return `linear-gradient(118deg,${c1} 0 40%,${c2} 40% 56%,${c1} 56%)`;
  if(p==='faixa_h')return `linear-gradient(0deg,${c1} 0 38%,${c2} 38% 50%,${c3} 50% 62%,${c1} 62%)`;
  return `radial-gradient(ellipse at 80% 30%,${mix(c1,'#ffffff',.18)},${c1} 55%,${mix(c1,'#000000',.35)})`}
let uidc=0;
function crest(club,size=44){return club?crestV(club,size):''}
function crestV(club,size=44){const [c1,c2,c3,p]=club.kit;const id='cr'+(uidc++);const ini=club.short.replace(/[^A-Za-zÀ-ú ]/g,'').split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase()||club.short.slice(0,3).toUpperCase();
  const stripes=p==='listras'?[1,3].map(i=>`<rect x="${10+i*16}" y="0" width="16" height="100" fill="${c2}"/>`).join(''):p==='listras_h'?[1,3].map(i=>`<rect x="0" y="${8+i*18}" width="100" height="18" fill="${c2}"/>`).join(''):p==='faixa'?`<path d="M0 30 L30 0 L100 70 L100 100 Z" fill="${c2}"/>`:p==='faixa_h'?`<rect x="0" y="44" width="100" height="16" fill="${c2}"/>`:'';
  const ink=lum(c1)>.6?'#111':'#fff';
  return `<svg class="crest" width="${size}" height="${size*1.12}" viewBox="0 0 100 112"><defs><clipPath id="${id}"><path d="M50 4 L94 16 L90 62 Q84 92 50 108 Q16 92 10 62 L6 16 Z"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
  <g clip-path="url(#${id})"><rect width="100" height="112" fill="${c1}"/>${stripes}<rect width="100" height="112" fill="url(#${id}g)"/></g>
  <path d="M50 4 L94 16 L90 62 Q84 92 50 108 Q16 92 10 62 L6 16 Z" fill="none" stroke="${c3===c1?mix(c1,'#ffffff',.5):c3}" stroke-width="5"/>
  <text x="50" y="${ini.length>2?66:70}" text-anchor="middle" font-family="Barlow Condensed,Impact" font-weight="800" font-size="${ini.length>2?30:38}" fill="${ink}" stroke="${ink==='#fff'?'#0008':'#fff8'}" stroke-width="2" paint-order="stroke">${esc(ini)}</text></svg>`}
/* camisa 3D */
const SHIRT='M31 9 L43 4 Q50 11 57 4 L69 9 L93 23 L84 43 L74 38 L75 93 Q50 99 25 93 L26 38 L16 43 L7 23 Z';
function shirtDefs(id,kit){const [c1,c2,c3,p]=kit;
  const st=p==='listras'?[0,1,2,3].map(i=>`<rect x="${27+i*13}" y="0" width="6.5" height="100" fill="${c2}"/>`).join(''):p==='listras_h'?[0,1,2,3,4].map(i=>`<rect x="0" y="${16+i*18}" width="100" height="9" fill="${c2}"/>`).join(''):p==='faixa'?`<path d="M28 9 L40 6 L80 96 L64 98 Z" fill="${c2}"/>`:p==='faixa_h'?`<rect x="0" y="44" width="100" height="9" fill="${c2}"/><rect x="0" y="53" width="100" height="5" fill="${c3}"/>`:'';
  return `<clipPath id="${id}c"><path d="${SHIRT}"/></clipPath>
  <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".28" stop-color="#fff" stop-opacity=".06"/><stop offset=".62" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".48"/></linearGradient>
  <radialGradient id="${id}r" cx=".38" cy=".3" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <g id="${id}b"><g clip-path="url(#${id}c)"><rect width="100" height="100" fill="${c1}"/>${st}
   <path d="M7 23 L16 43 L26 38 L31 9 Z M93 23 L84 43 L74 38 L69 9 Z" fill="#000" opacity=".12"/>
   <path d="M38 40 Q44 62 37 90 M63 42 Q58 64 64 91" stroke="#000" stroke-opacity=".14" stroke-width="2.4" fill="none"/>
   <path d="M30 60 Q50 66 72 58" stroke="#fff" stroke-opacity=".1" stroke-width="2" fill="none"/>
   <rect width="100" height="100" fill="url(#${id}s)"/><rect width="100" height="100" fill="url(#${id}r)"/></g>
   <path d="M43 4 Q50 13 57 4" fill="none" stroke="${c3===c1?mix(c1,'#000000',.4):c3}" stroke-width="3.2"/>
   <path d="M16 43 L7 23 M84 43 L93 23" stroke="${c2}" stroke-width="3" opacity=".9"/></g>`}
function shirtSvg(kit,num,size=64,name){const id='sh'+(uidc++);const ink=lum(kit[0])>.55?'#111':'#fff';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="filter:drop-shadow(0 6px 8px #000a)"><defs>${shirtDefs(id,kit)}</defs><use href="#${id}b"/>${num!=null?`<text x="50" y="${name?72:68}" text-anchor="middle" font-family="Barlow Condensed,Impact" font-weight="800" font-size="${name?34:40}" fill="${ink}" stroke="${ink==='#fff'?'#0009':'#fff9'}" stroke-width="2.5" paint-order="stroke">${num}</text>`:''}${name?`<text x="50" y="36" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="11" fill="${ink}" letter-spacing=".5">${esc(name.toUpperCase().slice(0,12))}</text>`:''}</svg>`}
const posTag=p=>`<span class="pos ${C.GROUP[p]}">${p}</span>`;
const ovrTag=o=>`<span class="ovr ${o>=75?'hi':o>=62?'md':'lo'}">${o}</span>`;
const stars=n=>{n=Math.max(.5,Math.min(5,n));let s='';for(let i=1;i<=5;i++)s+=n>=i?'★':n>=i-.5?'⯪':'<s>★</s>';return `<span class="stars">${s}</span>`};
const potStars=p=>stars((p.pot-40)/11);
const fitBar=f=>`<div class="bar ${f<60?'b':f<80?'w':''}" title="Condição ${Math.round(f)}%"><i style="width:${f}%"></i></div>`;
const rtTag=r=>r?`<span class="rt ${r>=7.8?'e':r>=7?'g':r<6?'b':''}">${r.toFixed(1)}</span>`:'<span class="rt dim">–</span>';
const surname=n=>{const p=n.split(' ');return p.length>1?p[p.length-1]:n};
const clubOf=id=>G().clubs[id];

/* ---------- topo ---------- */
const MORE=['youth','club','market','online','auction','league','match'];
function moreSheet(){const g=G();const lots=g.auction&&g.auction.lots?g.auction.lots.filter(x=>!x.done).length:0;const c=C.userClub();
  const it=(go,ic,t,s,b)=>`<button class="mrow" data-go="${go}"><span class="mrow-ic">${ic}</span><span class="mrow-t"><b>${t}</b><small>${s}</small></span>${b?`<em class="mrow-b">${b}</em>`:''}<span class="mrow-ch">›</span></button>`;
  openModal(`<h1 class="title" style="margin-bottom:12px">Mais</h1><div class="mlist">${it('match','⚽','Partida','Próximo jogo e jogo ao vivo')}${it('auction','🔨','Leilão',lots?lots+' lote(s) esperando seu lance':'Reforços às cegas',lots||'')}${it('youth','🌱','Categoria de base',(c.youth||[]).length+' promessa(s)')}${it('market','🛒','Contratar jogadores','Buscar por posição, gols, nota e fazer proposta')}${it('club','🏟️','Clube e finanças','Investimentos, prêmios e caixa')}${it('online','🌐','Online','Liga com amigos e partida ao vivo')}${it('league','🏆','Classificação','Tabela, artilharia e Taça')}</div><div class="mlist" style="margin-top:12px"><button class="mrow" id="mm-menu"><span class="mrow-ic">⚙️</span><span class="mrow-t"><b>Menu e configurações</b><small>Perfil, sons, aparência, save</small></span><span class="mrow-ch">›</span></button></div>`);
  $('#mm-menu').onclick=()=>{A.click();menuModal('root')}}
const NAV=[['home','Início'],['squad','Plantel'],['tactics','Tática'],['training','Treino'],['market','Mercado'],['club','Finanças'],['auction','Leilão'],['youth','Base'],['league','Liga'],['match','Partida']];
function renderTop(){
  const g=G();const c=C.userClub();const di=C.dateInfo();
  const auOpen=g.auction&&g.auction.lots.some(x=>!x.done);
  $('#nav').innerHTML=NAV.map(([k,l])=>`<button data-go="${k}" class="${view===k?'on':''}">${l}${k==='auction'&&auOpen?'<i></i>':''}${k==='home'&&g.inbox.some(m=>!m.read)?'<i></i>':''}${k==='training'&&g.trainPending&&C.nextUserMatch()?'<i></i>':''}</button>`).join('')+`<button data-more class="more ${MORE.includes(view)?'on':''}">Mais${auOpen?'<i></i>':''}</button>`;
  $('#k-money').textContent=money(c.money);$('#k-date').textContent=di?di.label.replace('Taça Nacional · ','Taça · '):'Fim de temporada';$('#k-season').textContent=`Temporada ${g.season}`;
  $('#top-crest').innerHTML=crest(c,30);
  $('#b-music').classList.toggle('off',!A.S.music);const bc=$('#b-cloud');if(bc)bc.hidden=!(ACC.st.user&&G().slot);$('#b-sfx').classList.toggle('off',!A.S.sfx);
}
function go(v){document.body.dataset.view=v;if(v!=='auction'&&typeof auStage==='function')auStage(false);if(MV.live&&v!=='match'&&MV.m&&MV.m.phase!=='ft'){MV.pause()}view=v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));renderTop();const f={home:vHome,squad:vSquad,tactics:()=>TV.render($('#v-tactics')),training:vTraining,youth:vYouth,club:vClub,market:vMarket,online:()=>ON.render(),auction:vAuction,league:vLeague,match:MV.render}[v];f&&f();$('main').scrollTop=0;if(A.scene)A.scene(v==='tactics'?'tac':'menu');if(v==='match'&&A.ready&&A.preload)A.preload();
  if(v!=='match'&&A.ready){A.crowd(false);A.fadeMusic(1)}}

/* ---------- início ---------- */
function vHome(){
  const g=G(),c=C.userClub(),um=C.nextUserMatch();const t=C.sortedTable(c.div);const pos=t.findIndex(r=>r.id===c.id)+1;
  const last=g.ledger[g.ledger.length-1];const pay=C.payroll(c);
  const opp=um&&um.type!=='BYE'?clubOf(um.home===c.id?um.away:um.home):null;
  const mini=t.map((r,i)=>({...r,i})).filter((r,i)=>Math.abs(i+1-pos)<=2||i<1);
  const ps=c.players.map(P).filter(Boolean);const avg=ps.length?Math.round(ps.reduce((a,p)=>a+C.ovr(p),0)/ps.length):0;
  const inj=ps.filter(p=>p.inj).length,tired=ps.filter(p=>!p.inj&&p.fi<70).length;
  const form=(g.history||[]).filter(h=>h.home===g.user||h.away===g.user).slice(-5).map(h=>{const my=h.home===g.user?h.hg:h.ag,op=h.home===g.user?h.ag:h.hg;return my>op?'v':my<op?'d':'e'});
  const lots=g.auction&&g.auction.lots?g.auction.lots.filter(x=>!x.done).length:0;
  const tf=(C.TRAIN[g.training.focus]||{}).n||'Equilibrado';const yN=(c.youth||[]).length;const unread=g.inbox.filter(m=>!m.read).length;
  const conf=g.board.conf;
  const tile=(go,ic,tt,sub,badge,cls='')=>`<button class="tile ${cls}" data-go="${go}"><span class="tile-ic">${ic}</span><span class="tile-t">${tt}</span><span class="tile-s">${sub}</span>${badge?`<em>${badge}</em>`:''}</button>`;
  const next=um&&um.type==='BYE'?`<div class="hm-next"><div class="eyebrow">Próxima rodada · ${esc(um.label)}</div><p class="muted" style="margin:10px 0 14px">Seu time folga nesta rodada.</p><button class="btn big go hm-play" data-go="match">Avançar ▸</button></div>`
    :um?`<div class="hm-next ${um.type==='C'||um.type==='P'?'is-cup':''}">${um.type==='C'?`<div class="cup-ribbon">🏆 Jogo da Taça Nacional · ${esc(C.CUP_NAMES[C.dateInfo().cupRound]||'')} · mata-mata</div>`:um.type==='P'?`<div class="cup-ribbon dim">🏆 Data da Taça · você foi eliminado: jogo de colocação</div>`:''}<div class="hm-next-h"><span class="eyebrow">Próximo jogo</span><span class="dim">${esc(um.label)}</span></div>
      <div class="vs"><div class="t">${crest(clubOf(um.home),56)}${esc(clubOf(um.home).short)}</div><div class="x">×</div><div class="t">${crest(clubOf(um.away),56)}${esc(clubOf(um.away).short)}</div></div>
      <div class="hm-force"><span>Força</span><b class="num">${C.teamStrength(c).toFixed(0)}</b><i><s style="width:${Math.round(C.teamStrength(c)/(C.teamStrength(c)+C.teamStrength(opp))*100)}%"></s></i><b class="num">${C.teamStrength(opp).toFixed(0)}</b></div>
      <button class="btn big go hm-play" data-go="match">⚽ Jogar agora</button></div>`
    :`<div class="hm-next"><div class="eyebrow">Temporada encerrada</div><p class="muted">Avance para a próxima temporada.</p><button class="btn big go hm-play" data-go="match">Continuar ▸</button></div>`;
  $('#v-home').innerHTML=`
  <div class="hm-top">
    <div class="hm-club"><div class="pat" style="background:${patCss(c.kit)}"></div>
      <div class="hm-id">${crest(c,64)}<div style="min-width:0"><div class="eyebrow" style="color:#fff">${C.divName(c.div)} · ${g.season}</div><h1>${esc(c.name)}</h1><div class="dim hm-mgr">Técnico ${esc(g.manager)}</div></div></div>
      <div class="hm-sum">
        <div><b class="num">${pos}º</b><span>Posição</span></div>
        <div><b class="form">${form.length?form.map(x=>`<i class="f-${x}">${x.toUpperCase()}</i>`).join(''):'<small class="dim">—</small>'}</b><span>Últimos jogos</span></div>
        <div><b class="num" style="color:${conf<30?'var(--bad)':conf<55?'var(--warn)':'var(--ok)'}">${conf}%</b><span>Diretoria</span></div>
        <div><b class="num">${money(c.money).replace('R$ ','')}</b><span>Caixa R$</span></div>
      </div>
      <div class="hm-goal">🎯 <b>${esc(g.board.goal)}</b> <span class="dim">· Taça: ${esc(g.board.cupGoal)}</span></div>
      ${cupStatusHtml()}
    </div>
    ${next}
  </div>
  <div class="tiles">
    ${tile('squad','👥','Meu plantel',`${ps.length} jogadores · média ${avg}`,inj?`${inj} 🚑`:'','big')}
    ${tile('tactics','📋','Tática',`${esc(g.tactic.formation)} · escalação`,'')}
    ${tile('training','🏋️','Treino',g.trainPending?`⚠️ Pendente · ${esc(tf)}`:`Feito ✓ · ${esc(tf)}`,g.trainPending?'!':'',g.trainPending?'hot':'')}
    ${tile('auction','🔨','Leilão',lots?`${lots} lote(s) aberto(s)`:'Abre após o próximo jogo',lots||'',lots?'hot':'')}
    ${tile('youth','🌱','Base',`${yN} promessa(s)`,'')}
    ${tile('market','🛒','Contratar',`Buscar jogadores e fazer proposta`,'')}
    ${tile('club','🏟️','Clube',`Investir · prêmios · caixa`,'')}
    ${tile('online','🌐','Online',`Liga com amigos · ao vivo`,'')}
    ${tile('league','🏆','Classificação',`${pos}º de ${t.length} · ${C.divName(c.div)}`,'','wide')}
  </div>
  ${trophyShelfHtml()}
  <div class="grid hm-bottom">
    <div class="frame"><div class="h">Caixa de entrada <small>${unread?`${unread} nova(s)`:'tudo lido'}</small></div><div id="inbox" class="inbox-c">${inboxHtml()}</div></div>
    <div class="col" style="gap:16px">
      <div class="frame mini-t"><div class="h">${C.divName(c.div)} <small><a href="#" data-go="league" style="color:var(--acc2)">ver tabela ›</a></small></div>${tableHtml(c.div,mini)}</div>
      <div class="frame"><div class="h">Finanças</div><div class="fin-r"><span>Salários por jogo</span><b class="num">${money(pay)}</b></div>
        ${last?`<div class="fin-r"><span>Último jogo (TV ${money(last.tv)} + bilheteria ${money(last.gate)})</span><b class="num" style="color:${last.tot>=0?'var(--ok)':'var(--bad)'}">${last.tot>=0?'+':''}${money(last.tot)}</b></div>`:''}
        <div class="fin-r"><span>Temporada: entrou / saiu</span><b class="num">${money(g.seasonMoney.in)} / ${money(g.seasonMoney.out)}</b></div></div>
    </div>
  </div>`;
  setTimeout(()=>{if(view==='home')uiQueue()},350);
}
function threadHtml(m){if(!m.thread||!m.thread.length)return '';const g=G();const me=esc(g.manager||'Você');
  return `<div class="thr">${m.thread.map(x=>`<div class="bub ${x.w}"><small>${x.w==='you'?'Você':x.w==='pl'?'Jogador':'Clube'}</small>${esc(x.t)}</div>`).join('')}</div>${m.done?`<div class="thr-end ${m.done}">${m.done==='ok'?'✅ Negócio fechado':'❌ Encerrado'}</div>`:''}`}
function cupStatusHtml(){const g=G(),cup=g.cup,u=g.user;if(!cup)return '';const q=cup.qual&&cup.qual[u];
  let st;if(cup.champion===u)st='🏆 Campeão da Taça!';else if(cup.out&&cup.out[u])st=`Eliminado nas ${cup.out[u].replace(/ de final/,'')}`;else if(cup.alive.includes(u))st=`Vivo · próxima fase: ${C.CUP_NAMES[cup.round]||'—'}`;else st='Não está na Taça';
  return `<button class="hm-cup" data-cuprule><span class="ic">🏆</span><span><b>Taça Nacional: ${esc(st)}</b><small>${q?esc(q)+' · ':''}toque para ver como funciona</small></span></button>`}
function trophyShelfHtml(){const tr=C.trophies();const g=G();const seasons=[...new Set(tr.map(t=>t.season))];
  const ic={liga:'🏆',taca:'🥇',acesso:'⬆️'};
  return `<div class="frame trophy-shelf"><div class="h">Sala de troféus <small>${tr.length?tr.length+' conquista'+(tr.length>1?'s':''):'nenhum título ainda'}</small></div>
    ${tr.length?`<div class="tshelf">${tr.map((t,i)=>`<div class="troph k-${t.k}" style="animation-delay:${i*.08}s"><span class="ti">${ic[t.k]}</span><b>${esc(t.t)}</b><small>${t.season}${t.club!==g.user&&clubOf(t.club)?' · '+esc(clubOf(t.club).short):''}</small></div>`).join('')}</div>`
      :`<p class="muted" style="margin:0">Ganhe a sua série, a Taça Nacional ou suba de divisão para encher esta estante. Temporada atual: ${g.season}.</p>`}
    ${(g.seasonLog||[]).length?`<div class="tseasons">${(g.seasonLog||[]).slice().reverse().map(s=>{const won=tr.filter(t=>t.season===s.season);return `<div><b>${s.season}</b><span>${s.pos}º · Série ${s.div}</span><span>${won.length?won.map(t=>ic[t.k]).join(' '):'—'}</span></div>`}).join('')}</div>`:''}</div>`}
function inboxHtml(){const g=G();return g.inbox.slice(0,14).map(m=>{const of=m.offer&&!m.done?g.offers.find(o=>(m.offerId?o.id===m.offerId:o.pid===m.pid)&&o.until>g.date):null;
  return `<div class="msg ${m.read?'':'unread'} ${m.thread?'has-thr':''}" data-msg="${m.id}"><b>${esc(m.title)}</b>${m.body&&!(m.thread&&m.thread.length>1)?`<p>${esc(m.body)}</p>`:''}${threadHtml(m)}${of?`<div class="row" style="margin-top:8px"><button class="btn xs" data-offer="${of.id}" data-acc="1">Aceitar ${money(of.amt)}</button><button class="btn ghost xs" data-offer="${of.id}" data-acc="0">Recusar</button>${m.pid?`<button class="btn ghost xs" data-player="${m.pid}">Ver jogador</button>`:''}</div>`:m.pid&&P(m.pid)?`<div style="margin-top:6px"><button class="btn ghost xs" data-player="${m.pid}">Ver jogador</button></div>`:''}</div>`}).join('')||'<p class="muted">Nada por aqui.</p>'}
function zoneN(d){const g=G(),i=C.DIVS.indexOf(d),n=g.div[d].length,nx=C.DIVS[i+1];return {up:i>0?(n>=20?4:3):0,dn:nx?(g.div[nx].length>=20?4:3):0}}
function lastMoves(){const g=G();const s=g.lastSummary||(g.seasonLog||[]).slice(-1)[0];const m={};if(s&&s.moves)for(const [id,from,to] of s.moves)m[id]={from,to,up:C.DIVS.indexOf(to)<C.DIVS.indexOf(from),season:s.season};return m}
function moveChip(id){const m=lastMoves()[id];if(!m)return '';return `<span class="mvchip ${m.up?'up':'dn'}" title="${m.up?'Subiu':'Caiu'} da Série ${m.from} em ${m.season}">${m.up?'▲ subiu':'▼ caiu'}</span>`}
function tableHtml(d,rows){const g=G();rows=rows||C.sortedTable(d).map((r,i)=>({...r,i}));const n=g.div[d].length;const {up:zu,dn:zd}=zoneN(d);
  return `<table><thead><tr><th>#</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th><th>Últimos</th></tr></thead><tbody>${rows.map(r=>{const c=clubOf(r.id);const i=r.i;
    return `<tr class="${r.id===g.user?'me':''} ${i<zu?'zone-up':''} ${zd&&i>=n-zd?'zone-dn':''} ${i===0&&d==='A'?'zone-1':''} click" data-club="${r.id}"><td class="num">${i+1}</td><td><div class="row">${crest(c,20)}<b>${esc(c.short)}</b>${moveChip(r.id)}</div></td><td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.d}</td><td>${r.sg>0?'+':''}${r.sg}</td><td class="num" style="font-size:18px"><b>${r.pts}</b></td><td>${[...r.f].map(x=>`<span class="fm ${x}" style="width:18px;height:18px;font-size:11px">${x}</span>`).join(' ')}</td></tr>`}).join('')}</tbody></table>
  <div class="zlegend">${d==='A'?'<span class="z1">Campeão da Série A</span>':`<span class="zu">Acesso à Série ${C.DIVS[C.DIVS.indexOf(d)-1]} (${zu} primeiros)</span>`}${zd?`<span class="zd">Rebaixamento à Série ${C.DIVS[C.DIVS.indexOf(d)+1]} (${zd} últimos)</span>`:''}<span class="zm"><span class="mvchip up">▲ subiu</span><span class="mvchip dn">▼ caiu</span> na última temporada</span></div>`}
function movesHtml(d){const g=G();const m=lastMoves();const ids=Object.keys(m);if(!ids.length)return '';const s=g.lastSummary||(g.seasonLog||[]).slice(-1)[0];
  const into=ids.filter(id=>m[id].to===d),out=ids.filter(id=>m[id].from===d);
  const li=(arr,up)=>arr.map(id=>{const c=clubOf(id);return c?`<div class="mvrow ${up?'up':'dn'} ${id===g.user?'me':''}" data-club="${id}">${crest(c,22)}<b>${esc(c.short)}</b><small>${up?'▲':'▼'} Série ${m[id].from} → ${m[id].to}</small></div>`:''}).join('');
  const inU=into.filter(id=>m[id].up),inD=into.filter(id=>!m[id].up),outU=out.filter(id=>m[id].up),outD=out.filter(id=>!m[id].up);
  return `<div class="frame mvbox"><div class="h">Sobe e desce de ${s?s.season:''} <small>quem mudou de divisão na virada</small></div><div class="mvgrid">
   ${inU.length?`<div><div class="mvh up">Chegaram subindo</div>${li(inU,1)}</div>`:''}${inD.length?`<div><div class="mvh dn">Chegaram rebaixados</div>${li(inD,0)}</div>`:''}
   ${outU.length?`<div><div class="mvh up">Subiram daqui</div>${li(outU,1)}</div>`:''}${outD.length?`<div><div class="mvh dn">Caíram daqui</div>${li(outD,0)}</div>`:''}</div></div>`}

/* ---------- plantel ---------- */
/* ---------- plantel: arrastar um jogador sobre outro troca os dois ---------- */
function locOf(id){const t=G().tactic;let i=t.lineup.indexOf(id);if(i>=0)return {k:'slot',i};i=t.subs.indexOf(id);if(i>=0)return {k:'sub',i};return {k:'out'}}
function swapPlayers(a,b){const t=G().tactic;if(a===b)return false;const A=locOf(a),B=locOf(b);const pa=P(a),pb=P(b);
  if(A.k==='out'&&B.k==='out'){toast('Os dois estão fora da lista.');return false}
  if((B.k!=='out'&&pa.inj)||(A.k!=='out'&&pb.inj)){toast('⚠️ Jogador lesionado não pode ser relacionado.');return false}
  const put=(loc,id)=>{if(loc.k==='slot')t.lineup[loc.i]=id;else if(loc.k==='sub')t.subs[loc.i]=id};
  if(A.k==='out'){put(B,a)}else if(B.k==='out'){put(A,b)}else{put(A,b);put(B,a)}
  C.save();const lbl=(l,p)=>{if(l.k==='slot'){const r=t.slots[l.i].role;return `titular de ${r}${C.GROUP[p.p]===C.GROUP[r]?'':' ⚠️ fora de posição'}`}return l.k==='sub'?'reserva':'fora da lista'};
  toast(`🔁 ${esc(surname(pa.n))} (${pa.p}) agora é ${lbl(B,pa)} · ${esc(surname(pb.n))} (${pb.p}) agora é ${lbl(A,pb)}`);return true}
function bindSquadDrag(){const root=$('#v-squad');if(!root)return;
  root.querySelectorAll('[data-drag]').forEach(h=>{h.onclick=e=>e.stopPropagation();h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const id=+h.dataset.drag;const row=h.closest('tr');
    const gh=document.createElement('div');gh.className='drag-ghost';gh.innerHTML=row.querySelector('td:nth-child(2) b').outerHTML;document.body.appendChild(gh);row.classList.add('dragging');
    let over=null;const mv=ev=>{gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';const el=document.elementFromPoint(ev.clientX,ev.clientY);const tr=el&&el.closest('[data-sqrow]');
      if(over&&over!==tr)over.classList.remove('dropover');over=tr&&tr!==row?tr:null;if(over)over.classList.add('dropover');
      const m=$('main');const r=m.getBoundingClientRect();if(ev.clientY<r.top+60)m.scrollTop-=12;else if(ev.clientY>r.bottom-90)m.scrollTop+=12};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);gh.remove();row.classList.remove('dragging');
      if(over){over.classList.remove('dropover');if(swapPlayers(id,+over.dataset.sqrow)){A.click&&A.click();keepScroll(vSquad);renderTop()}}};
    mv(e);addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)}})}
function vSquad(){
  const c=C.userClub(),t=G().tactic;const ps=c.players.map(P).filter(Boolean);
  const k=S.sort.k,d=S.sort.d;const order=C.POS;
  const val={pos:p=>order.indexOf(p.p)*100-C.ovr(p),n:p=>p.n,a:p=>p.a,o:p=>-C.ovr(p),pot:p=>-p.pot,fm:p=>-(C.formAvg(p)||0),fi:p=>-p.fi,mo:p=>-(p.mo+p.re),v:p=>-p.v,w:p=>-p.w,g:p=>-p.st.g};
  const f=S.squadF;const list=ps.filter(p=>f==='all'||C.GROUP[p.p]===f).sort((a,b)=>{const x=val[k](a),y=val[k](b);return (x>y?1:x<y?-1:0)*d});
  const st=id=>t.lineup.includes(id)?'<span class="chip ok">Titular</span>':t.subs.includes(id)?'<span class="chip">Banco</span>':'<span class="chip dim">Fora</span>';
  const th=(key,l)=>`<th class="s" data-sort="${key}">${l}${k===key?(d>0?' ▾':' ▴'):''}</th>`;
  S.navList=list.map(p=>p.id);
  $('#v-squad').innerHTML=`<div class="page-head"><div><div class="eyebrow">Elenco profissional</div><h1 class="title">Plantel</h1></div><div class="sp"></div><button class="btn" data-go="market" style="margin-right:8px">🛒 Contratar jogadores</button><button class="btn ghost" data-go="auction" style="margin-right:8px">🔨 Leilão</button>
   <div class="seg" style="width:340px">${[['all','Todos'],['G','Gol'],['D','Defesa'],['M','Meio'],['A','Ataque']].map(([x,l])=>`<button data-sf="${x}" class="${f===x?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="frame" style="overflow:auto"><table class="sq-t"><thead><tr>${th('pos','Pos')}${th('n','Nome')}${th('a','Idade')}${th('o','Geral')}${th('pot','Potencial')}${th('fm','Forma')}${th('fi','Condição')}${th('mo','Humor')}<th>Relação</th>${th('g','Gols')}${th('v','Valor')}${th('w','Salário')}<th>Status</th></tr></thead><tbody>
  ${(()=>{const grp=id=>t.lineup.includes(id)?0:t.subs.includes(id)?1:2;const G3=[[],[],[]];list.forEach(p=>G3[grp(p.id)].push(p));
    const lab=[['tit','⚽ Titulares',`${G3[0].length} em campo · ${esc(t.formation)}`],['res','🪑 Reservas','no banco para o jogo'],['out','Fora da lista','não relacionados']];
    return G3.map((arr,gi)=>arr.length?`<tr class="sq-grp ${lab[gi][0]}"><td colspan="13"><b>${lab[gi][1]}</b> <span>${lab[gi][2]}</span></td></tr>`+arr.map(p=>`<tr class="click sq-${lab[gi][0]}" data-player="${p.id}" data-sqrow="${p.id}"><td><span class="dh" data-drag="${p.id}" title="Arraste para trocar">⠿</span>${posTag(p.p)}</td><td><b>${esc(p.n)}</b>${p.inj?` <span class="chip bad">lesão ${p.inj}</span>`:''}${p.pr?' <span class="chip warn">promessa</span>':''}${p.wantOut?' <span class="chip bad">quer sair</span>':''}${(G().toSell||[]).includes(p.id)?' <span class="chip warn">à venda</span>':''}</td><td>${p.a}</td><td>${ovrTag(C.ovr(p))}</td><td>${potStars(p)}</td><td>${rtTag(C.formAvg(p))}</td><td>${fitBar(p.fi)}</td><td>${C.moodText(p)}</td><td class="muted">${C.relText(p.re)}</td><td>${p.st.g}</td><td class="num">${money(p.v)}</td><td class="num dim">${money(p.w)}</td><td>${st(p.id)}</td></tr>`).join(''):'').join('')})()}</tbody></table></div>`;
  bindSquadDrag();
}

/* ---------- jogador ---------- */
function playerModal(pid){
  const p=P(pid);if(!p)return;const g=G();const mine=p.c===g.user;const c=p.c?clubOf(p.c):null;const o=C.ovr(p);
  const kit=c?c.kit:['#555','#999','#555','liso'];
  const lineIdx=g.tactic.lineup.indexOf(pid);const num=lineIdx>=0?(lineIdx===0?1:lineIdx+1):'';
  const att=C.ATTR_GROUPS.filter(([n])=>n!=='Goleiro'||p.p==='GOL').map(([n,ks])=>`<div><div class="dim" style="font:700 11px var(--tx);letter-spacing:.12em;text-transform:uppercase;margin:8px 0 4px">${n}</div>${ks.map(k=>{const v=p.t[k];return `<div class="attr"><span>${C.ATTR_LABEL[k]}</span><b style="color:${v>=15?'#7ee2a5':v>=11?'var(--ink)':v>=7?'var(--warn)':'var(--bad)'}">${Math.round(v)}</b><div class="bar ${v<7?'b':v<11?'w':''}"><i style="width:${v*5}%"></i></div></div>`}).join('')}</div>`).join('');
  const fm=p.fm.length?p.fm.map(r=>rtTag(r)).join(' '):'<span class="dim">sem jogos</span>';
  const yOK=mine&&p.y;const nl=(S.navList||[]);const ni=nl.indexOf(pid);S.curPid=pid;
  const nav=ni>=0&&nl.length>1?`<div class="pnav"><button class="iconbtn" data-pnav="-1" title="Anterior (←)">‹</button><span class="dim num">${ni+1} / ${nl.length}</span><button class="iconbtn" data-pnav="1" title="Próximo (→)">›</button></div>`:'';
  openModal(`${nav}<div class="row" style="gap:20px;align-items:center">${shirtSvg(kit,num||C.POS.indexOf(p.p)+1,110,surname(p.n))}<div style="flex:1">
    <div class="eyebrow">${c?esc(c.name):'Sem clube'} · ${C.POS_NAME[p.p]}${p.y?' · Base':''}</div><h1 class="title" style="font-size:52px">${esc(p.n)}</h1>
    <div class="row wrap" style="margin-top:6px">${posTag(p.p)}<span class="chip">${p.a} anos</span><span class="chip">Valor ${money(C.valueOf(p))}</span><span class="chip">Salário ${money(p.w)}/jogo</span>${p.sty?`<span class="chip acc">${esc(p.sty)}</span>`:''}<span class="chip">Pé ${({D:'direito',E:'esquerdo',A:'ambidestro'})[p.pe]||'direito'}</span><span class="chip" title="Quanto o rendimento varia de um jogo para outro">Regularidade ${p.con>=15?'alta':p.con>=9?'média':'baixa'}</span>${p.inj?`<span class="chip bad">Lesionado: ${p.inj} jogo(s)</span>`:''}</div></div>
    <div style="text-align:center"><div class="num" style="font-size:72px;line-height:.9;font-weight:800">${o}</div><div class="dim" style="font-size:12px;letter-spacing:.1em">GERAL</div><div style="margin-top:6px">${potStars(p)}</div><div class="dim" style="font-size:12px">potencial ${mine||p.a<=23?p.pot:'?'}</div></div></div>
  <div class="grid g2" style="margin-top:14px"><div class="attrs" style="grid-template-columns:1fr">${att}</div>
   <div class="col"><div class="frame" style="padding:14px"><div class="h">Temporada</div><div class="grid g4"><div class="stat"><b>${p.st.j}</b><span>Jogos</span></div><div class="stat"><b>${p.st.g}</b><span>Gols</span></div><div class="stat"><b>${p.st.as}</b><span>Assist.</span></div><div class="stat"><b>${C.formAvg(p)?C.formAvg(p).toFixed(1):'–'}</b><span>Nota</span></div></div><div style="margin-top:10px">Últimas notas: ${fm}</div></div>
   ${mine?`<div class="frame" style="padding:14px"><div class="h">Relação com o técnico</div>
     <div class="row"><span style="width:110px" class="muted">Humor</span><div class="bar a" style="flex:1"><i style="width:${p.mo}%"></i></div><b class="num" style="width:30px">${Math.round(p.mo)}</b></div>
     <div class="row" style="margin-top:6px"><span style="width:110px" class="muted">Relação</span><div class="bar ${p.re<30?'b':p.re<50?'w':''}" style="flex:1"><i style="width:${p.re}%"></i></div><b class="num" style="width:30px">${Math.round(p.re)}</b></div>
     <div class="row" style="margin-top:6px"><span style="width:110px" class="muted">Condição</span>${fitBar(p.fi)}<b class="num">${Math.round(p.fi)}%</b></div>
     <p class="muted" style="font-size:13.5px;margin:10px 0">${C.moodText(p)} · ${C.relText(p.re)}${p.bs>=2?` · ${p.bs} jogos sem entrar`:''}${p.pr?` · promessa: ${p.pr.got}/${p.pr.need} jogos`:''}</p>
     <div class="row wrap">${['elogiar','cobrar','tranquilizar','prometer'].map(k=>`<button class="btn ghost xs" data-talk="${k}" data-pid="${p.id}" ${p.tk===g.date?'disabled':''}>${{elogiar:'Elogiar',cobrar:'Cobrar',tranquilizar:'Tranquilizar',prometer:'Prometer vaga'}[k]}</button>`).join('')}</div></div>`:''}
   ${mine?`<div class="frame" style="padding:14px"><div class="h">Negociação</div><div class="row wrap">
      <input type="number" id="reserve" value="${Math.round(C.valueOf(p)*.8/5000)*5000}" step="5000" style="width:150px" title="Lance mínimo"><button class="btn sm" data-sell="${p.id}">Levar a leilão</button>
      ${yOK?`<button class="btn ghost sm" data-promote="${p.id}">Promover ao profissional</button>`:p.a<=19?`<button class="btn ghost sm" data-demote="${p.id}">Voltar para a base</button>`:''}
      <button class="btn ghost sm" data-release="${p.id}">Dispensar</button></div>
      <p class="dim" style="font-size:12.5px;margin:8px 0 0">O jogador entra no próximo leilão com o lance mínimo que você definir. Os clubes dão lances fechados; o maior leva.</p></div>`:''}
   ${!mine&&p.c?`<div class="frame" style="padding:14px"><div class="h">Fazer proposta <small>${esc(clubOf(p.c).short)} · seu caixa ${money(C.userClub().money)}</small></div>
     <div class="row wrap"><label class="col" style="gap:3px"><span class="dim" style="font-size:12px">Valor da transferência</span><input type="number" id="of-amt" step="10000" value="${Math.round(C.valueOf(p)/10000)*10000}" style="width:170px"></label>
     <label class="col" style="gap:3px"><span class="dim" style="font-size:12px">Salário por jogo</span><input type="number" id="of-wage" step="500" value="${Math.round(p.w*1.15/500)*500}" style="width:140px"></label>
     <button class="btn sm" data-offerp="${p.id}" style="align-self:flex-end">Enviar proposta</button></div><div id="of-res" style="margin-top:10px"></div>
     <p class="dim" style="font-size:12.5px;margin:8px 0 0">Titulares custam mais caro. O clube pode aceitar, recusar ou pedir mais; o jogador também precisa topar o salário.</p></div>`:''}
   </div></div>${(()=>{const g=G();const cur={s:g.season,c:p.c&&clubOf(p.c)?clubOf(p.c).short:'—',j:p.st.j||0,g:p.st.g||0,as:p.st.as||0,n:p.st.nn?p.st.ns/p.st.nn:0,inj:p.st.inj||0,now:1};const rows=[cur,...(p.hist||[]).slice().reverse()];
  const tot=rows.reduce((a,r)=>({j:a.j+r.j,g:a.g+r.g,as:a.as+r.as,inj:a.inj+r.inj}),{j:0,g:0,as:0,inj:0});
  return `<div class="phist"><div class="h">📜 Histórico na carreira <small>${tot.j} jogos · ${tot.g} gols · ${tot.as} assist. · ${tot.inj} lesões</small></div>
   <table class="ph-t"><thead><tr><th>Temporada</th><th>Clube</th><th>J</th><th>G</th><th>A</th><th>Nota</th><th>🚑</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.now?'now':''}"><td>${r.s}${r.now?' <small>atual</small>':''}</td><td><b>${esc(r.c)}</b></td><td>${r.j}</td><td><b>${r.g}</b></td><td>${r.as}</td><td>${r.n?rtTag(r.n):'<span class="dim">—</span>'}</td><td>${r.inj||'<span class="dim">0</span>'}</td></tr>`).join('')}</tbody></table>
   ${(p.log||[]).length?`<div class="ph-log">${p.log.slice(0,8).map(e=>`<div class="ph-ev ${e.t}"><span>${e.t==='inj'?'🚑':e.t==='transf'?'🔁':'•'}</span><b>${e.s}</b>${esc(e.txt)}</div>`).join('')}</div>`:''}</div>`})()}${mine&&!p.y?`<div class="boostrow"><span><b>⭐ Sessão especial</b><small>${p.boostS===g.season?'já feita nesta temporada':'+1 num atributo · '+money(C.playerBoostCost(p))}</small></span>${p.boostS===g.season?'':`<select id="boost-attr">${Object.keys(C.W[p.p]||{}).sort((a,b)=>(C.W[p.p][b]||0)-(C.W[p.p][a]||0)).map(k=>`<option value="${k}">${C.ATTR_LABEL[k]} (${Math.round(p.t[k])})</option>`).join('')}</select><button class="btn xs" data-boost="1" data-pid="${p.id}">Investir</button>`}</div>`:''}<div class="lookrow"><span class="dim">Visual no jogo 3D</span><div>${[['auto','Automático'],...[1,2,3,4,5,6].map(n=>[n,''])].map(([n,l])=>`<button class="lk ${(p.look||'auto')==n?'on':''}" data-look="${n}" data-pid="${p.id}" title="${l||'Visual '+n}" style="${n==='auto'?'':`background:${['#ae7d67','#644433','#664431','#a57a63','#835845','#563829'][n-1]}`}">${l||n}</button>`).join('')}</div></div>`);
}
function navPlayer(dir){const nl=S.navList||[];const i=nl.indexOf(S.curPid);if(i<0||!nl.length)return;const n=nl[(i+dir+nl.length)%nl.length];const fr=$('#modal>.frame');const k=fr?fr.scrollTop:0;playerModal(n);const f2=$('#modal>.frame');if(f2){f2.scrollTop=k;f2.style.animation='none';f2.offsetHeight;f2.style.animation=`slide${dir>0?'R':'L'} .22s ease`}}
function volPop(btn,kind){
  let el=$('#volpop');if(el&&el.dataset.k===kind){el.remove();return}if(el)el.remove();
  el=document.createElement('div');el.id='volpop';el.dataset.k=kind;
  const sl=(k,lab)=>`<label class="vp-r"><span>${lab}</span><input type="range" min="0" max="100" value="${Math.round((A.S[k]??.5)*100)}" data-vk="${k}"><b>${Math.round((A.S[k]??.5)*100)}</b></label>`;
  const on=kind==='music'?A.S.music:A.S.sfx;
  el.innerHTML=`<div class="vp-h"><b>${kind==='music'?'♫ Música':'🔊 Sons do jogo'}</b><button class="tgl ${on?'on':''}" data-vtg aria-label="Ligar/desligar"></button></div>${kind==='music'?sl('mv','Volume'):sl('sv','Efeitos')+sl('cv','Torcida')}`;
  document.body.appendChild(el);const r=btn.getBoundingClientRect(),z=PREF.font||1;
  el.style.top=(r.bottom/z+8)+'px';el.style.left=Math.max(8,Math.min(innerWidth/z-250,(r.left+r.width/2)/z-120))+'px';
  el.querySelector('[data-vtg]').onclick=e=>{const k=kind;A.set(k,!A.S[k]);if(k==='music'&&A.S.music&&view!=='match')A.music(true);e.target.classList.toggle('on',!!A.S[k]);renderTop()};
  el.querySelectorAll('[data-vk]').forEach(i=>i.oninput=()=>{const v=+i.value/100;i.nextElementSibling.textContent=i.value;
    if(kind==='music'&&!A.S.music&&v>0){A.set('music',true);if(view!=='match')A.music(true);el.querySelector('[data-vtg]').classList.add('on');renderTop()}
    if(kind==='sfx'&&!A.S.sfx&&v>0){A.set('sfx',true);el.querySelector('[data-vtg]').classList.add('on');renderTop()}
    A.set(i.dataset.vk,v)});
  setTimeout(()=>{const off=e=>{if(!el.isConnected){document.removeEventListener('pointerdown',off,true);return}if(!el.contains(e.target)&&e.target!==btn&&!btn.contains(e.target)){el.remove();document.removeEventListener('pointerdown',off,true)}};document.addEventListener('pointerdown',off,true)},0);
}
function openModal(html){const m=$('#modal');m.classList.remove('wide','fort-modal','cele-modal','recap-modal');m.innerHTML=`<div class="frame"><button class="iconbtn x" data-close>✕</button>${html}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';$('#modal').classList.remove('wide','fort-modal','cele-modal')}

/* ---------- treino ---------- */
function keepScroll(f){const m=$('main'),y=m?m.scrollTop:0;f();if(m){m.scrollTop=y;requestAnimationFrame(()=>m.scrollTop=y)}}
function vTraining(){
  const g=G(),c=C.userClub();const tr=g.training;const um=C.nextUserMatch();
  const ps=c.players.map(P).filter(Boolean).sort((a,b)=>C.POS.indexOf(a.p)-C.POS.indexOf(b.p)||C.ovr(b)-C.ovr(a));S.navList=ps.map(p=>p.id);
  const cnt={treino:0,individual:0,poupado:0,lesionado:0};ps.forEach(p=>{cnt[p.inj?'lesionado':p.rest?'poupado':p.tf?'individual':'treino']++});
  const tf=C.TRAIN[tr.focus];
  const opts=p=>{const w=C.W[p.p]||{};const keys=[...Object.keys(w).sort((a,b)=>w[b]-w[a]),...C.ATTR.filter(k=>!w[k]&&(p.p==='GOL'||!['gol','ref','sai'].includes(k)))];
    return `<option value="">Só o treino do grupo</option>${keys.map(k=>`<option value="${k}" ${p.tf===k?'selected':''}>${C.ATTR_LABEL[k]} (${Math.round(p.t[k])})</option>`).join('')}`};
  const rows=ps.map(p=>{const stt=p.inj?['lesionado','bad',`Lesionado · ${p.inj} jogo(s)`]:p.rest?['poupado','warn','Poupado']:p.tf?['individual','acc','Individual: '+C.ATTR_LABEL[p.tf]]:['treino','ok','Treino do grupo'];
    return `<div class="tp ${stt[0]}"><div class="tp-h" data-player="${p.id}">${posTag(p.p)}<b>${esc(p.n)}</b>${ovrTag(C.ovr(p))}</div>
      <div class="tp-fit">${fitBar(p.fi)}<span class="chip ${stt[1]}">${stt[2]}</span></div>
      ${p.inj?'':`<div class="tp-ctl"><select data-tf="${p.id}" aria-label="Treino individual de ${esc(p.n)}">${opts(p)}</select><button class="chipbtn ${p.rest?'on':''}" data-rest="${p.id}">${p.rest?'✓ Poupado':'Poupar'}</button></div>`}</div>`}).join('');
  const L=g.trainLog;
  const rep=L?(()=>{const rs=L.rows.map(r=>({...r,p:P(r.id)})).filter(r=>r.p);const gains=rs.filter(r=>Object.values(r.d).some(v=>v>0)).sort((a,b)=>Object.values(b.d).reduce((x,y)=>x+y,0)-Object.values(a.d).reduce((x,y)=>x+y,0));
    return `<div class="frame"><div class="h">Último treino <small>${C.TRAIN[L.focus].n} · ${['leve','normal','pesado'][L.int]} · ${rs.filter(r=>r.st==='treino'||r.st==='individual').length} treinaram</small></div>
      <div class="row wrap" style="gap:6px;margin-bottom:10px">${['treino','individual','poupado','lesionado','lesionou'].map(k=>{const n=rs.filter(r=>r.st===k).length;return n?`<span class="chip">${({treino:'Grupo',individual:'Individual',poupado:'Poupados',lesionado:'No DM',lesionou:'Lesionaram'})[k]}: ${n}</span>`:''}).join('')}</div>
      <div class="tlog">${gains.slice(0,14).map(r=>`<div class="tl" data-player="${r.id}">${posTag(r.p.p)}<b>${esc(r.p.n)}</b><span class="tl-g">${Object.entries(r.d).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`<i>+${v.toFixed(1)} ${C.ATTR_LABEL[k]}</i>`).join('')}</span><span class="dim tl-f">cond. ${r.fi[0]}→${r.fi[1]}%</span></div>`).join('')||'<p class="muted">Ninguém evoluiu nesta sessão. Jovens e quem joga evoluem mais.</p>'}</div></div>`})():`<div class="frame"><div class="h">Último treino</div><p class="muted">Assim que você realizar o treino desta semana, aqui aparece o relatório: quem treinou, quem foi poupado e quanto cada um evoluiu.</p></div>`;
  $('#v-training').innerHTML=`<div class="page-head"><div><div class="eyebrow">Centro de treinamento</div><h1 class="title">Treino</h1></div><div class="sp"></div>
    <div class="frame" style="padding:12px 16px;min-width:min(300px,100%)"><div class="h" style="margin-bottom:6px">Entrosamento tático <small>${g.tactic.formation}</small></div><div class="row" style="flex-wrap:nowrap"><div class="bar a" style="flex:1;height:10px"><i style="width:${g.fam}%"></i></div><b class="num" style="font-size:22px">${g.fam}%</b></div></div></div>
  ${(()=>{const pend=g.trainPending;const adv=C.trainAdvice();const tfA=C.TRAIN[adv.focus];const same=tr.focus===adv.focus&&tr.int===adv.int;
    return `<div class="frame tsess ${pend?'pend':'done'}"><div class="tsess-h"><div><div class="eyebrow">${pend?'Treino da semana · pendente':'Treino da semana · feito ✓'}</div>
      <div class="tnext-t">${pend?`Antes de ${um&&um.label?esc(um.label):'o próximo jogo'}`:'Time preparado para o jogo'}</div>
      <p class="muted" style="margin:4px 0 0">${pend?'Escolha o foco, a intensidade, quem treina individual e quem descansa. Depois toque em <b>Realizar treino</b>. Sem treino, o time perde entrosamento e rende menos.':'O próximo treino abre depois da partida. Veja abaixo quanto cada jogador evoluiu.'}</p></div>
      <div class="tcount"><div><b>${cnt.treino}</b><span>no grupo</span></div><div><b>${cnt.individual}</b><span>individual</span></div><div><b>${cnt.poupado}</b><span>poupados</span></div><div><b>${cnt.lesionado}</b><span>no DM</span></div></div></div>
      ${pend?`<div class="tadv"><div class="tadv-h">🧠 Sugestão do preparador: <b>${tfA.n}</b> · ${['leve','normal','pesada'][adv.int]}</div><ul>${adv.reasons.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>
        <div class="row wrap" style="gap:8px">${same?'<span class="chip ok">✓ Plano igual à sugestão</span>':`<button class="btn ghost sm" id="t-useadv">Usar sugestão</button>`}${adv.tired.length?`<button class="btn ghost sm" id="t-rest">Poupar ${adv.tired.length} cansado(s)</button>`:''}</div></div>
        <button class="btn big go" id="t-run" style="width:100%;margin-top:12px">🏋️ Realizar treino · ${esc(tf.n)} ${['leve','normal','pesado'][tr.int]}</button>`:''}</div>`})()}
  <div class="frame" style="margin:16px 0"><div class="h">Foco do grupo <small>${tf.n}</small></div><div class="train">${Object.entries(C.TRAIN).map(([k,v])=>`<button data-train="${k}" class="${tr.focus===k?'on':''}"><b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div>
   <div class="tint"><span class="muted">Intensidade</span><div class="seg">${['Leve','Normal','Pesada'].map((l,i)=>`<button data-int="${i}" class="${tr.int===i?'on':''}">${l}</button>`).join('')}</div>
   <span class="dim" style="font-size:13px">${['Evolui menos e recupera mais.','Equilíbrio entre evolução e desgaste.','Evolui mais rápido, cansa e pode lesionar.'][tr.int]}</span></div></div>
  <div class="grid g2" style="align-items:start"><div class="frame"><div class="h">Elenco no treino <small>toque no nome para ver a ficha</small></div><div class="tplist">${rows}</div></div>
   <div class="col" style="gap:16px">${rep}
   <div class="frame"><div class="h">Evolução na temporada</div><div class="tlog">${ps.slice().sort((a,b)=>(C.ovr(b)-b.so)-(C.ovr(a)-a.so)).slice(0,10).map(p=>{const d=C.ovr(p)-p.so;return `<div class="tl" data-player="${p.id}">${posTag(p.p)}<b>${esc(p.n)}</b><span class="dim">${p.so} → ${C.ovr(p)}</span><span class="num" style="margin-left:auto;color:${d>0?'var(--ok)':d<0?'var(--bad)':'var(--ink3)'}">${d>0?'▲ +':d<0?'▼ ':''}${d}</span></div>`}).join('')}</div></div></div></div>${(()=>{const yl=g.youthLog;const ys=(c.youth||[]).map(P).filter(Boolean);const ct=C.facLvl('ct');
    return `<div class="frame yt-box"><div class="h">🌱 Base: treina sozinha depois de cada jogo <small>estrutura ${'★'.repeat(g.academy.lvl)} = evolução +${g.academy.lvl*10}%</small></div>
    <p class="muted" style="margin:0 0 8px">Os garotos da base não usam o treino do profissional: cada um treina na função escolhida na aba Base, automaticamente, depois de cada partida. Quanto melhor a estrutura (★) da base, mais rápido eles evoluem — e quem ganha minutos no profissional evolui 25% a mais. O <b>Centro de treinamento</b> (aba Clube, nível ${ct}) acelera o treino do profissional em +${(ct-1)*12}%.</p>
    ${ys.length?`<table class="yt-t"><thead><tr><th>Garoto</th><th>Treina</th><th>Geral</th><th>Última semana</th></tr></thead><tbody>${ys.map(p=>{const r=yl&&yl.rows.find(x=>x.id===p.id);return `<tr class="click" data-player="${p.id}"><td><b>${esc(p.n)}</b> <span class="dim">${p.p} · ${p.a}a</span></td><td>${({equilibrado:'Equilibrado',tecnico:'Técnico',fisico:'Físico',finalizacao:'Finalização',defesa:'Defesa',goleiro:'Goleiro'})[p.tr||'equilibrado']}</td><td>${ovrTag(C.ovr(p))}</td><td>${r?`<b style="color:${r.g>0?'var(--ok)':'var(--ink3)'}">${r.g>0?'+':''}${r.g.toFixed(2)} pts</b>${r.o[1]>r.o[0]?` · geral ${r.o[0]}→${r.o[1]}`:''}`:'<span class="dim">treina após o próximo jogo</span>'}</td></tr>`}).join('')}</tbody></table>`:'<p class="dim">Nenhum garoto na base — faça uma peneira na aba Base.</p>'}
    <div class="row" style="margin-top:8px"><button class="btn ghost xs" data-go="youth">Mudar o treino dos garotos</button><button class="btn ghost xs" data-go="club">Investir em estrutura</button></div></div>`})()}`;
  const tr0=$('#t-run');if(tr0)tr0.onclick=err(()=>{const L=C.runTraining();A.init();A.applause&&A.applause(1.2,.25);const ups=L.rows.filter(r=>Object.values(r.d).some(v=>v>0)).length;toast(`🏋️ Treino feito! ${ups} jogador(es) evoluíram. Entrosamento ${L.fam}%.`);renderTop();vTraining();$('main').scrollTop=0});
  const ua=$('#t-useadv');if(ua)ua.onclick=()=>{const a=C.trainAdvice();g.training.focus=a.focus;g.training.int=a.int;C.save();toast('Plano do preparador aplicado.');keepScroll(vTraining)};
  const tr2=$('#t-rest');if(tr2)tr2.onclick=()=>{const a=C.trainAdvice();a.tired.forEach(id=>{const p=P(id);if(p&&!p.rest)C.setRest(id,true)});toast(`${a.tired.length} jogador(es) vão descansar.`);keepScroll(vTraining)};
  $$('#v-training [data-tf]').forEach(sel=>sel.onchange=()=>{C.setIndividual(+sel.dataset.tf,sel.value);toast(sel.value?`${esc(P(+sel.dataset.tf).n)}: treino individual de ${C.ATTR_LABEL[sel.value]}.`:'Volta ao treino do grupo.');keepScroll(vTraining)});
}

/* ---------- base ---------- */
function vYouth(){
  const g=G(),c=C.userClub();const NY=S.newY&&Date.now()-S.newY.t<600000?S.newY.ids:[];const ys=(c.youth||[]).map(P).filter(Boolean).sort((a,b)=>(NY.includes(b.id)-NY.includes(a.id))||b.pot-a.pot);const lvl=g.academy.lvl;const unc=Math.max(1,6-lvl)*2;
  const young=c.players.map(P).filter(p=>p&&p.a<=21).sort((a,b)=>b.pot-a.pot);
  $('#v-youth').innerHTML=`<div class="page-head"><div><div class="eyebrow">Categorias de base</div><h1 class="title">Base</h1></div><div class="sp"></div>
   <div class="frame row" style="padding:12px 16px;gap:18px"><div class="stat"><b>${'★'.repeat(lvl)}<span style="color:#ffffff22">${'★'.repeat(5-lvl)}</span></b><span>Estrutura da base</span></div>
    <button class="btn ghost sm" data-upgrade ${lvl>=5?'disabled':''}>Investir ${lvl<5?money(C.academyCost()):''}</button>
    <button class="btn sm" data-scout ${g.academy.scoutCd>0?'disabled':''}>Peneira · ${money(C.scoutCost())}${g.academy.scoutCd>0?` (em ${g.academy.scoutCd})`:''}</button></div></div>
  <p class="muted" style="margin:-6px 0 14px">Treine cada garoto numa função, dê minutos no profissional e valorize: quem joga bem recebe propostas e vale mais no leilão. Potencial estimado com margem de ±${unc} — quanto melhor a estrutura, mais preciso.</p>
  <div class="youth">${ys.map(p=>{const lo=Math.max(C.ovr(p)+1,p.pot-unc),hi=Math.min(99,p.pot+unc);const nw=NY.includes(p.id);return `<div class="frame ycard ${nw?'is-new':''}" style="${nw?`animation-delay:${NY.indexOf(p.id)*.35}s`:''}">${nw?'<span class="new-badge">✨ Novo da peneira</span>':''}<div class="row">${shirtSvg(['#e9ecef','#adb5bd','#e9ecef','liso'],null,54)}<div style="flex:1"><b style="font-size:17px">${esc(p.n)}</b><div class="row" style="margin-top:4px">${posTag(p.p)}<span class="chip">${p.a} anos</span></div></div><div style="text-align:center">${ovrTag(C.ovr(p))}<div class="dim" style="font-size:11px;margin-top:3px">hoje</div></div></div>
    <div class="row" style="justify-content:space-between"><span class="muted">Potencial</span><span>${potStars(p)} <b class="num">${lo}–${hi}</b></span></div>
    <div class="ctl" style="margin:0"><label>Treino individual</label><select data-ytr="${p.id}">${Object.keys(C.YTRAIN).map(k=>`<option value="${k}" ${p.tr===k?'selected':''}>${{equilibrado:'Equilibrado',tecnico:'Técnico',fisico:'Físico',finalizacao:'Finalização',defesa:'Defesa',goleiro:'Goleiro'}[k]}</option>`).join('')}</select></div>
    <div class="row wrap"><button class="btn xs" data-promote="${p.id}">Promover</button><button class="btn ghost xs" data-player="${p.id}">Detalhes / vender</button><button class="btn ghost xs" data-release="${p.id}">Dispensar</button></div></div>`}).join('')||'<p class="muted">Nenhum garoto na base. Faça uma peneira.</p>'}</div>
  <div class="frame" style="margin-top:16px"><div class="h">Crias e jovens no profissional <small>até 21 anos</small></div><table class="yt-t"><thead><tr><th>Pos</th><th>Nome</th><th>Idade</th><th>Geral</th><th>Potencial</th><th>Jogos</th><th>Nota</th><th>Valor</th></tr></thead><tbody>
  ${young.map(p=>`<tr class="click" data-player="${p.id}"><td>${posTag(p.p)}</td><td><b>${esc(p.n)}</b></td><td>${p.a}</td><td>${ovrTag(C.ovr(p))}</td><td>${potStars(p)}</td><td>${p.st.j}</td><td>${rtTag(C.formAvg(p))}</td><td class="num">${money(C.valueOf(p))}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">Nenhum jovem no elenco profissional.</td></tr>'}</tbody></table></div>`;
}

/* ---------- mercado: buscar e contratar ---------- */
function vMarket(){const g=G(),c=C.userClub();if(!S.mk)S.mk={pos:'all',sort:'ovr'};
  $('#v-market').innerHTML=`<div class="page-head"><div><div class="eyebrow">Mercado · propostas diretas</div><h1 class="title">Contratar jogadores</h1></div><div class="sp"></div><div class="stat" style="text-align:right"><b class="num">${money(c.money)}</b><span>Caixa disponível</span></div></div>
  <p class="muted" style="margin:-6px 0 12px">Toque num jogador para ver a ficha e fazer uma proposta (valor + salário). O clube dono responde na hora e a conversa fica na sua caixa de entrada. Para lances fechados, use o <a href="#" data-go="auction" style="color:var(--acc2)">Leilão</a>.</p>
    <div class="frame"><div class="h">Procurar jogadores <small>faça propostas diretas</small></div>
      <div class="row wrap"><select id="mk-pos"><option value="all">Todas posições</option>${C.POS.map(x=>`<option ${S.mk&&S.mk.pos===x?'selected':''}>${x}</option>`).join('')}</select>
      <select id="mk-div"><option value="">Todas séries</option>${C.DIVS.map(x=>`<option value="${x}" ${S.mk&&S.mk.div===x?'selected':''}>Série ${x}</option>`).join('')}</select>
      <select id="mk-max"><option value="">Qualquer valor</option>${[3e5,1e6,3e6,1e7,3e7].map(v=>`<option value="${v}" ${S.mk&&+S.mk.max===v?'selected':''}>até ${money(v)}</option>`).join('')}</select><input type="text" id="mk-q" placeholder="Nome" style="width:120px" value="${esc(S.mk&&S.mk.q||'')}"></div>
      <div class="row wrap" style="margin-top:6px"><select id="mk-sort">${[['ovr','Ordenar: melhor geral'],['g','Mais gols'],['as','Mais assistências'],['nota','Melhor nota'],['pot','Maior potencial'],['val','Mais barato'],['age','Mais jovem'],['j','Mais jogos']].map(([k,l])=>`<option value="${k}" ${S.mk&&S.mk.sort===k?'selected':''}>${l}</option>`).join('')}</select>
      <select id="mk-min"><option value="">Geral mínimo</option>${[60,65,70,75,80].map(v=>`<option value="${v}" ${S.mk&&+S.mk.min===v?'selected':''}>${v}+</option>`).join('')}</select>
      <label class="chk"><input type="checkbox" id="mk-hot" ${S.mk&&S.mk.hot?'checked':''}> 🔥 Destaques</label><label class="chk"><input type="checkbox" id="mk-young" ${S.mk&&S.mk.young?'checked':''}> 🌱 Promessas</label>
      <button class="btn sm" data-mksearch>Buscar</button></div>
      <div id="mk-list" style="margin-top:8px">${S.mk?mkList():'<p class="dim">Filtre por posição, série ou valor e clique em Buscar.</p>'}</div></div>
`}
/* ---------- clube: finanças, prêmios e investimentos ---------- */
function vClub(){const g=G(),c=C.userClub();const pt=C.prizeTable();const L=g.ledger.slice(-8).reverse();const tvj=C.DIV_TV[c.div];
  const fac=Object.entries(C.FAC).map(([k,f])=>{const l=C.facLvl(k),cost=C.facCost(k);return `<div class="frame fac"><div class="fac-h"><span class="fac-ic">${f.ic}</span><div><b>${f.n}</b><div class="stars">${'★'.repeat(l)}<span>${'★'.repeat(5-l)}</span></div></div></div>
    <p class="muted">${f.d}</p><div class="fac-now">Hoje: <b>${l>1?esc(f.fx(l)):'sem bônus'}</b></div>${cost!=null?`<div class="fac-next">Nível ${l+1}: ${esc(f.fx(l+1))}</div><button class="btn sm" data-fac="${k}" ${c.money<cost?'disabled':''}>Investir ${money(cost)}</button>`:'<div class="fac-next">Nível máximo ✓</div>'}</div>`}).join('');
  const acts=Object.entries(C.ACTS).map(([k,a])=>{const cost=Math.round(a.cost(c)/1000)*1000;const used=(g.actsUsed||{})[k]===g.date+'-'+g.season;return `<div class="act"><span class="fac-ic">${a.ic}</span><div style="flex:1"><b>${a.n}</b><small>${a.d}</small></div><button class="btn xs ${used?'ghost':''}" data-act="${k}" ${used||c.money<cost?'disabled':''}>${used?'Feito ✓':money(cost)}</button></div>`}).join('');
  $('#v-club').innerHTML=`<div class="page-head"><div><div class="eyebrow">Gestão do clube</div><h1 class="title">Clube e finanças</h1></div><div class="sp"></div><div class="stat" style="text-align:right"><b class="num">${money(c.money)}</b><span>Caixa disponível</span></div></div>
  <div class="grid club-g">
   <div class="col" style="gap:16px">
    <div class="frame"><div class="h">💰 Quanto vale ganhar <small>premiações pagas ao caixa</small></div>
      <table class="prz"><thead><tr><th>Competição</th><th>Campeão</th><th>Vice</th><th>Último</th></tr></thead><tbody>${C.DIVS.map(d=>`<tr class="${d===c.div?'me':''}"><td><b>Série ${d}</b>${d===c.div?' <span class="chip">sua série</span>':''}</td><td class="num"><b>${money(pt[d].champ)}</b></td><td class="num">${money(pt[d].second)}</td><td class="num dim">${money(pt[d].last)}</td></tr>`).join('')}</tbody></table>
      <div class="h" style="margin-top:12px;font-size:13px">🏆 Taça Nacional <small>cada fase que você passa paga</small></div>
      <div class="przc">${pt.cup.map(([l,v])=>`<div><span>${l}</span><b class="num">${money(v)}</b></div>`).join('')}</div>
      <p class="dim" style="font-size:12.5px;margin:8px 0 0">Na liga, cada posição abaixo do campeão recebe 7,5% a menos. A TV paga ${money(tvj)} por jogo na Série ${c.div}.</p></div>
    <div class="frame"><div class="h">📒 Últimos lançamentos</div>${L.length?L.map(x=>`<div class="fin-r"><span>${x.invName?'Investimento · '+esc(x.invName):`Jogo · TV ${money(x.tv)}${x.gate?` + bilheteria ${money(x.gate)}`:''}${x.loja?` + loja ${money(x.loja)}`:''} − salários ${money(-x.wages)}`}</span><b class="num" style="color:${x.tot>=0?'var(--ok)':'var(--bad)'}">${x.tot>=0?'+':''}${money(x.tot)}</b></div>`).join(''):'<p class="muted">Sem lançamentos ainda.</p>'}
      <div class="fin-r" style="margin-top:6px"><span><b>Temporada</b>: entrou / saiu</span><b class="num">${money(g.seasonMoney.in)} / ${money(g.seasonMoney.out)}</b></div></div>
    <div class="frame"><div class="h">⚡ Ações da semana <small>efeito imediato</small></div><div class="acts">${acts}</div></div>
   </div>
   <div><div class="h" style="margin:0 0 10px">🏗️ Investimentos permanentes <small>melhoram o clube para sempre</small></div><div class="facs">${fac}</div>
    <div class="frame" style="margin-top:12px"><div class="h">⭐ Investir num jogador</div><p class="muted" style="margin:0">Abra a ficha de um jogador do seu elenco e use “Sessão especial” para comprar +1 num atributo (uma vez por temporada por jogador).</p><button class="btn ghost sm" style="margin-top:8px" data-go="squad">Ir ao plantel</button></div></div>
  </div>`}
/* ---------- leilão ---------- */
function lotCard(showing){
  const g=G(),c=C.userClub(),au=g.auction;const lot=au.lots[showing];if(!lot)return '';
  const p=P(lot.pid);const seller=lot.seller?clubOf(lot.seller):null;const o=C.ovr(p);
  const kit=seller?seller.kit:['#ced4da','#868e96','#ced4da','liso'];
  const attrs=Object.entries(C.W[p.p]).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k])=>`<div class="attr"><span>${C.ATTR_LABEL[k]}</span><b>${Math.round(p.t[k])}</b><div class="bar"><i style="width:${p.t[k]*5}%"></i></div></div>`).join('');
  const dots=au.lots.map((l,j)=>`<i class="${j===showing?'cur':l.done?'done':''}"></i>`).join('');
  const maxBid=Math.max(lot.min,c.money);const start=Math.min(lot.suggest,maxBid);
  const step=lot.min>=2e6?100000:lot.min>=3e5?25000:5000;
  const bidUI=lot.done?revealHtml(lot):lot.mine?`<div class="au-bid"><div><div class="dim">Lance mínimo definido por você</div><div class="au-big num">${money(lot.min)}</div></div><button class="btn big" data-open="${showing}">Abrir envelopes</button></div>`:
    `<div class="au-bid"><div class="au-sug"><div><span class="dim">Mínimo</span><b class="num">${money(lot.min)}</b></div><div><span class="dim">Sugerido</span><b class="num" style="color:var(--acc2)">${money(lot.suggest)}</b></div><div><span class="dim">Seu caixa</span><b class="num">${money(c.money)}</b></div></div>
      <div class="au-amt"><button class="btn ghost" data-bstep="-1" aria-label="Diminuir">−</button><div class="au-val"><span class="dim">Seu lance fechado</span><b class="num" id="bidtxt">${money(start)}</b></div><button class="btn ghost" data-bstep="1" aria-label="Aumentar">+</button></div>
      <input type="range" id="bidr" min="${lot.min}" max="${maxBid}" step="${step}" value="${start}" ${c.money<lot.min?'disabled':''}><input type="hidden" id="bid" value="${start}" data-step="${step}">
      <div class="row au-quick"><button class="chipbtn" data-bset="${lot.min}">Mínimo</button><button class="chipbtn" data-bset="${lot.suggest}">Sugerido</button><button class="chipbtn" data-bset="${Math.round(lot.suggest*1.15/step)*step}">+15%</button><button class="chipbtn" data-bset="${Math.round(lot.suggest*1.3/step)*step}">+30%</button></div>
      <div class="row au-act"><button class="btn ghost" data-pass="${showing}">Passar</button><button class="btn big" data-bid="${showing}" ${c.money<lot.min?'disabled':''}>Dar lance 🔒</button></div>
      ${c.money<lot.min?'<div class="chip bad">Caixa insuficiente para o lance mínimo</div>':''}</div>`;
  return `<div class="au-card" style="--k1:${kit[0]};--k2:${kit[1]}">
    <div class="au-top"><div class="eyebrow">Lote ${showing+1} de ${au.lots.length}${lot.mine?' · seu jogador':''}</div><div class="dots">${dots}</div></div>
    <div class="au-player"><div class="au-shirt">${shirtSvg(kit,C.POS.indexOf(p.p)+1,110,surname(p.n))}</div>
      <div class="au-info"><div class="au-name">${esc(p.n)}</div>
        <div class="row wrap">${posTag(p.p)}<span class="chip">${p.a} anos</span>${p.sty?`<span class="chip">${esc(p.sty)}</span>`:''}<span class="chip">${seller?esc(seller.short)+' · '+C.divName(seller.div):'Sem clube'}</span></div>
        <div class="row au-meta"><div>${ovrTag(o)}<span class="dim">geral</span></div><div>${potStars(p)}<span class="dim">potencial</span></div><div class="dim">${p.st.j} j · ${p.st.g} g · sal. ${money(C.wageOf(p))}</div></div></div></div>
    <div class="attrs au-attrs">${attrs}</div>${bidUI}</div>`;
}
function auStage(open){
  let el=$('#austage');if(!open){if(el)el.remove();document.body.classList.remove('au-on');return}
  const au=G().auction;if(!au)return;const i=au.lots.findIndex(l=>!l.done);const showing=S.reveal!=null?S.reveal:i;
  if(!el){el=document.createElement('div');el.id='austage';document.body.appendChild(el)}document.body.classList.add('au-on');
  if(showing<0||!au.lots[showing]){el.innerHTML=`<div class="au-wrap"><div class="au-card au-end"><div class="eyebrow">Leilão encerrado</div><div class="au-name">Martelo batido</div><p class="muted">Um novo leilão abre depois do próximo jogo.</p><button class="btn big" data-austage-close>Voltar</button></div></div>`;return}
  const fresh=S._auLast!==showing;S._auLast=showing;
  el.innerHTML=`<div class="au-wrap"><button class="iconbtn au-x" data-austage-close aria-label="Fechar">✕</button>${fresh&&!au.lots[showing].done?`<div class="au-intro"><div class="au-lotn">LOTE ${showing+1}</div><div class="au-sub">${C.POS_NAME[P(au.lots[showing].pid).p]}</div></div>`:''}<div class="${fresh?'au-in':''}">${lotCard(showing)}</div></div>`;
  if(fresh&&!au.lots[showing].done){try{A.gate&&A.gate()}catch(e){}}
  const r=$('#bidr');if(r)r.oninput=()=>{$('#bid').value=r.value;$('#bidtxt').textContent=money(+r.value)};
}
function vAuction(){
  const g=G(),c=C.userClub(),au=g.auction;
  if(!au){$('#v-auction').innerHTML='<p>Sem leilão agora.</p>';return}
  const left=au.lots.filter(l=>!l.done).length;
  const main=`<div class="frame au-cta ${au.special?'is-special':''}"><div>${au.special?'<div class="sp-badge">✨ Leilão especial de pré-temporada · estrelas no martelo</div>':''}<div class="eyebrow">Sala do leilão</div><div class="au-name" style="font-size:clamp(30px,6vw,48px)">${left?`${left} jogador${left>1?'es':''} no martelo`:'Leilão encerrado'}</div><p class="muted" style="margin:6px 0 0">Os jogadores entram um por vez. Lance fechado: ninguém vê o seu, e o maior envelope leva.</p></div>
    ${left?`<button class="btn big" data-austage>🔨 Entrar na sala</button>`:''}
    ${left?`<div class="au-secret">${au.lots.filter(l=>!l.done).map(()=>'<i>?</i>').join('')}<span>Quem vai a leilão só é revelado dentro da sala.</span></div>`:`<p class="muted" style="margin:8px 0 0">🔒 O próximo leilão abre depois do próximo jogo.</p>`}
    ${au.lots.some(l=>l.done)?`<div class="au-mini">${au.lots.filter(l=>l.done).map(l=>{const p=P(l.pid);return p?`<div class="done">${posTag(p.p)}<b>${esc(surname(p.n))}</b><span class="dim">${l.winner?esc(clubOf(l.winner).short):'—'}</span></div>`:''}).join('')}</div>`:''}</div>`;
  const mineList=c.players.map(P).filter(Boolean).sort((a,b)=>C.ovr(b)-C.ovr(a));
  $('#v-auction').innerHTML=`<div class="page-head"><div><div class="eyebrow">Mercado · lances fechados</div><h1 class="title">Leilão</h1></div><div class="sp"></div><div class="stat" style="text-align:right"><b class="num">${money(c.money)}</b><span>Caixa disponível</span></div></div>
  <div class="auct"><div class="col" style="gap:16px">${main}</div>
   <div class="col" style="gap:16px">
    <div class="frame"><div class="h">Vender um jogador</div><div class="row wrap"><select id="sellsel" style="flex:1;min-width:0">${[...mineList,...(c.youth||[]).map(P).filter(Boolean)].map(p=>`<option value="${p.id}">${p.p} · ${esc(p.n)} · ${C.ovr(p)} · ${money(C.valueOf(p))}${p.y?' · base':''}</option>`).join('')}</select>
      <select id="sellmin" style="width:150px"><option value="">Lance mínimo…</option>${[.5,.7,.85,1,1.2,1.5].map(f=>`<option value="${f}">${Math.round(f*100)}% do valor</option>`).join('')}</select><button class="btn sm" data-sellsel>Leiloar</button></div>
      <p class="dim" style="font-size:12.5px;margin:8px 0 0">Entra no leilão desta semana (se ainda não começou) ou no próximo. Vender agora ou esperar ele valorizar: a decisão é sua.</p>
      ${(g.toSell||[]).length?`<div style="margin-top:8px" class="muted">Na fila: ${(g.toSell||[]).map(id=>esc(P(id)?.n)).join(', ')}</div>`:''}</div>
    <div class="frame mk-cta"><div class="h">🛒 Contratar jogadores <small>propostas diretas, fora do leilão</small></div><p class="muted" style="margin:0 0 8px">Procure em todas as séries por posição, gols, nota, destaques e promessas, e faça uma proposta ao clube.</p><button class="btn" data-go="market">Abrir o mercado de jogadores</button></div>
    <div class="frame"><div class="h">Histórico de lances</div><div style="max-height:52vh;overflow:auto">${g.auctionHistory.slice(0,25).map(h=>`<div class="msg" style="cursor:default"><b>${esc(h.name)} <span class="dim" style="font-weight:500">· ${h.pos} · ${h.ovr}</span></b><p>${h.winner?`${esc(clubOf(h.winner)?.short||'?')} levou por <b style="color:var(--ink)">${money(h.price)}</b>`:'Sem lance válido'} · ${h.bids.length} envelope(s)${h.bids.length?': '+h.bids.slice(0,4).map(b=>`${esc(b.you?'você':clubOf(b.club)?.short)} ${money(b.amt)}`).join(' · '):''}</p></div>`).join('')||'<p class="muted">Nenhum leilão ainda.</p>'}</div></div>
   </div></div>`;
  const auKey=G().season+'-'+G().date+'-'+au.lots.length;if(left&&view==='auction'&&S.auAuto!==auKey){S.auAuto=auKey;S.reveal=null;auStage(true)}
}
function mkList(){const r=C.searchPlayers({...S.mk,limit:50});S.navList=r.map(p=>p.id);let ri=0;
  return `<table class="mk-t"><thead><tr><th></th><th>Jogador</th><th>Ger</th><th>J</th><th>G</th><th>A</th><th>Nota</th><th>Valor</th></tr></thead><tbody>${r.map(p=>{const hot=C.formAvg(p)>=7||p.st.g>=3;return `<tr class="click mk-row" style="animation-delay:${Math.min(ri++,20)*.035}s" data-player="${p.id}"><td>${posTag(p.p)}</td><td><b>${esc(p.n)}</b>${hot?' <span title="Destaque">🔥</span>':''}${p.a<=21&&p.pot-C.ovr(p)>=6?' <span title="Promessa">🌱</span>':''}<div class="dim" style="font-size:12px">${esc(clubOf(p.c).short)} · ${p.a} anos · pot. ${p.pot}</div></td><td>${ovrTag(C.ovr(p))}</td><td class="num">${p.st.j}</td><td class="num"><b>${p.st.g}</b></td><td class="num">${p.st.as}</td><td>${p.st.j?rtTag(C.formAvg(p)):'<span class="dim">—</span>'}</td><td class="num">${money(C.valueOf(p))}</td></tr>`}).join('')||'<tr><td class="muted">Ninguém encontrado.</td></tr>'}</tbody></table>`}
function revealHtml(lot){const g=G();
  const win=lot.winner;const bids=lot.bids||[];
  const n=bids.length;return `<div class="h">Envelopes abertos</div>${n?bids.slice().reverse().map((b,jj)=>{const j=n-1-jj;return `<div class="env ${j===0&&win?'win':''} ${b.you?'you':''}" style="animation-delay:${.4+jj*.55}s"><span class="num dim">${j+1}º</span><b>${b.you?'Seu lance':esc(clubOf(b.club).name)}</b><b class="num" style="font-size:20px">${money(b.amt)}</b></div>`}).join(''):'<p class="muted">Nenhum envelope.</p>'}
  <div class="row au-result" style="justify-content:space-between;margin-top:12px;animation-delay:${.5+n*.55}s"><div style="font:800 26px var(--hd);text-transform:uppercase">${win?(win===g.user&&!lot.mine?'🎉 O jogador é seu!':lot.mine?`Vendido para o ${esc(clubOf(win).short)}`:`Vai para o ${esc(clubOf(win).short)}`):'Sem lance acima do mínimo'}</div>
  <button class="btn" data-nextlot>Próximo jogador ▸</button></div>`}

/* ---------- liga ---------- */
function vLeague(){
  const g=G();const d=S.league||C.userClub().div;
  const tabs=[...C.DIVS.map(x=>[x,'Série '+x]),['cup','Taça Nacional']];
  let body='';
  if(d==='cup'){const cup=g.cup;const rounds=C.CUP_NAMES.map((n,i)=>{const res=(cup.results||[])[i];const ties=res||(i===cup.round?cup.ties.map(([h,a])=>({h,a})):[]);
      return `<div><div class="h" style="font-size:13px">${n}</div>${ties.length?ties.map(t=>`<div class="tie"><div class="${t.w?(t.w===t.h?'w':'l'):''}"><span>${esc(clubOf(t.h).short)}</span><b>${t.gh??''}${t.pens?` (${t.pens[0]})`:''}</b></div><div class="${t.w?(t.w===t.a?'w':'l'):''}"><span>${esc(clubOf(t.a).short)}</span><b>${t.ga??''}${t.pens?` (${t.pens[1]})`:''}</b></div></div>`).join(''):'<div class="dim">a definir</div>'}</div>`}).join('');
    const qual=cup.qual||{};const parts=Object.keys(qual).length?Object.keys(qual):cup.alive;
    body=`<div class="frame cup-rule"><div class="h">Como funciona a Taça</div><p style="margin:0">${esc(C.CUP_RULE)}</p></div>
      <div class="frame"><div class="h">Taça Nacional ${g.season} <small>${cup.champion?'Campeão: '+esc(clubOf(cup.champion).name):cup.alive.length+' vivos'}</small></div><div class="bracket">${rounds}</div>
      <div class="h" style="margin-top:14px">Classificados</div><div class="cup-q">${parts.map(id=>`<div class="${id===g.user?'me':''} ${cup.out&&cup.out[id]?'out':''}" data-club="${id}">${crest(clubOf(id),22)}<b>${esc(clubOf(id).short)}</b><small>${esc(qual[id]||'')}${cup.out&&cup.out[id]?' · caiu nas '+esc(cup.out[id].replace(/ de final/,'')):cup.champion===id?' · CAMPEÃO':''}</small></div>`).join('')}</div>
      ${cup.round===0&&!cup.ties.length?`<p class="muted">O sorteio das oitavas acontece na primeira data da Taça.</p>`:''}</div>`}
  else{const top=Object.values(g.players).filter(p=>p.c&&g.div[d].includes(p.c)&&p.st.g>0).sort((a,b)=>b.st.g-a.st.g||b.st.as-a.st.as).slice(0,10);
    const lr=g.results[d]||[];const ri=Math.max(0,lr.length-1);const res=lr[ri]||[];
    body=`<div class="grid" style="grid-template-columns:1.5fr 1fr"><div class="col" style="gap:16px"><div class="frame"><div class="h">${C.divName(d)} <small>${(()=>{const z=zoneN(d);return [z.up?z.up+' primeiros sobem':'',z.dn?z.dn+' últimos caem':''].filter(Boolean).join(' · ')})()}</small></div>${tableHtml(d)}</div>${movesHtml(d)}</div>
     <div class="col" style="gap:16px"><div class="frame"><div class="h">Rodada ${ri+1} ${res.length?'':'<small>ainda não jogada</small>'}</div>${res.map(r=>`<div class="row" style="justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line)"><span style="flex:1;text-align:right">${esc(clubOf(r.h).short)}</span><b class="num" style="font-size:20px;width:64px;text-align:center">${r.gh} × ${r.ga}</b><span style="flex:1">${esc(clubOf(r.a).short)}</span></div>`).join('')}</div>
      <div class="frame"><div class="h">Artilharia</div><table><tbody>${top.map((p,i)=>`<tr class="click" data-player="${p.id}"><td class="dim">${i+1}</td><td><b>${esc(p.n)}</b><div class="dim" style="font-size:12px">${esc(clubOf(p.c).short)}</div></td><td>${posTag(p.p)}</td><td class="num" style="font-size:20px"><b>${p.st.g}</b></td></tr>`).join('')||'<tr><td class="muted">Sem gols ainda.</td></tr>'}</tbody></table></div></div></div>`}
  const past=(g.seasonLog||[]).filter(x=>x.recap).slice().reverse();if(past.length&&d!=='cup')body+=`<div class="frame rc-past"><div class="h">Resumões das temporadas</div><div class="row">${past.map(x=>`<button class="btn ghost sm" data-recap="${x.season}">${x.season}</button>`).join('')}</div></div>`;
  $('#v-league').innerHTML=`<div class="page-head"><div><div class="eyebrow">Competições ${g.season}</div><h1 class="title">Liga & Taça</h1></div><div class="sp"></div><div class="seg lg-seg" style="width:520px">${tabs.map(([k,l])=>`<button data-lg="${k}" class="${d===k?'on':''}">${innerWidth<560?l.replace('Série ','Série\u00a0').replace('Taça Nacional','Taça'):l}</button>`).join('')}</div></div>${body}`;
}
function clubModal(id){const c=clubOf(id);const ps=c.players.map(P).filter(Boolean).sort((a,b)=>C.POS.indexOf(a.p)-C.POS.indexOf(b.p)||C.ovr(b)-C.ovr(a));S.navList=ps.map(p=>p.id);
  openModal(`<div class="banner" style="min-height:130px;margin-bottom:14px"><div class="pat" style="background:${patCss(c.kit)}"></div>${crest(c,80)}<div><div class="eyebrow" style="color:#fff">${C.divName(c.div)} · força ${C.teamStrength(c).toFixed(0)} · ${c.formation}</div><h1 style="font-size:54px">${esc(c.name)}</h1></div></div>
  <table><thead><tr><th>Pos</th><th>Nome</th><th>Idade</th><th>Geral</th><th>Gols</th><th>Valor</th></tr></thead><tbody>${ps.map(p=>`<tr class="click" data-player="${p.id}"><td>${posTag(p.p)}</td><td>${esc(p.n)}</td><td>${p.a}</td><td>${ovrTag(C.ovr(p))}</td><td>${p.st.g}</td><td class="num">${money(C.valueOf(p))}</td></tr>`).join('')}</tbody></table>
  <p class="dim" style="font-size:13px">Clique num jogador para ver a ficha e fazer uma proposta.</p>`)}

/* ---------- eventos globais ---------- */
function bind(){
  document.addEventListener('click',err(e=>{
    const t=e.target.closest('[data-recapend],[data-recap],[data-offerp],[data-pnav],[data-go],[data-player],[data-close],[data-club],[data-sort],[data-sf],[data-train],[data-rest],[data-int],[data-lg],[data-talk],[data-sell],[data-promote],[data-demote],[data-release],[data-scout],[data-upgrade],[data-bid],[data-pass],[data-open],[data-nextlot],[data-mksearch],[data-bstep],[data-bset],[data-install],[data-austage],[data-austage-close],[data-sellsel],[data-offer],[data-msg],[data-job],[data-nojob],[data-more],[data-fort],[data-look],[data-fac],[data-act],[data-boost],[data-celeok],[data-trophies],[data-cuprule],#b-continue,#b-music,#b-sfx,#b-menu');
    if(!t)return;A.init();
    if(t.id==='b-music'||t.id==='b-sfx'){volPop(t,t.id==='b-music'?'music':'sfx');return}
    if(t.id==='b-menu'){menuModal('root');return}
    if(t.dataset.more!==undefined){moreSheet();return}
    if(t.id==='b-continue'){cont();return}
    const d=t.dataset;
    if(d.go){e.preventDefault();closeModal();if(d.lgset)S.league=d.lgset;go(d.go);return}
    if('recapend' in d){closeModal();const g=G();if(g.jobOffers)setTimeout(jobsModal,80);else if(!uiQueue()&&view==='home')vHome();return}
    if('close' in d||t.matches('[data-close]')){closeModal();return}
    if(d.pnav){navPlayer(+d.pnav);return}
    if(d.offerp){const pid=+d.offerp;const amt=+(d.amt||$('#of-amt').value),wage=+(d.wage||$('#of-wage').value);const r=C.makeOffer(pid,amt,wage);renderTop();
      if(r.status==='accepted'){A.goal();toast(esc(r.msg));closeModal();rerender();return}
      const el=$('#of-res');if(el)el.innerHTML=`<div class="chip ${r.status==='rejected'?'bad':'warn'}" style="white-space:normal;padding:8px 12px">${esc(r.msg)}</div>${r.status==='counter'||r.status==='wage'?`<div style="margin-top:8px"><button class="btn sm" data-offerp="${pid}" data-amt="${r.ask}" data-wage="${Math.max(wage,r.minWage||0)}">Aceitar: ${money(r.ask)} + ${money(Math.max(wage,r.minWage||0))}/jogo</button></div>`:''}`;return}
    if(d.talk){const r=C.talk(+d.pid,d.talk);toast(esc(r));playerModal(+d.pid);return}
    if(d.sell){const v=+$('#reserve').value||0;C.listForSale(+d.sell,v);toast(`${esc(P(+d.sell).n)} vai a leilão (mínimo ${money(v)}).`);closeModal();rerender();return}
    if(d.promote){C.promote(+d.promote);toast('Promovido ao profissional.');closeModal();rerender();return}
    if(d.demote){C.demote(+d.demote);toast('Voltou para a base.');closeModal();rerender();return}
    if(d.release){const p=P(+d.release);if(!confirm(`Dispensar ${p.n}?${p.y?'':' Multa: '+money(p.w*4)}`))return;C.release(+d.release);toast('Jogador dispensado.');closeModal();rerender();return}
    if(d.player){if(e.target.closest('[data-msg]'))e.stopPropagation();playerModal(+d.player);return}
    if(d.offer){const r=C.answerOffer(d.offer,d.acc==='1');toast((r&&r.ok?'✅ ':'↩️ ')+esc(r?r.txt:'Respondido.'));if(r&&r.ok)A.applause&&A.applause(1.5,.3);rerender();return}
    if(d.msg){const m=G().inbox.find(x=>x.id==+d.msg);if(m&&!m.read){m.read=true;C.save();t.classList.remove('unread');renderTop()}return}
    if(d.club){clubModal(d.club);return}
    if(d.sort){S.sort={k:d.sort,d:S.sort.k===d.sort?-S.sort.d:1};vSquad();return}
    if(d.sf){S.squadF=d.sf;vSquad();return}
    if(d.train){G().training.focus=d.train;C.save();keepScroll(vTraining);return}
    if(d.rest){const p=P(+d.rest);C.setRest(+d.rest,!p.rest);keepScroll(vTraining);return}
    if(d.int){G().training.int=+d.int;C.save();keepScroll(vTraining);return}
    if(d.lg){S.league=d.lg;vLeague();return}
    if('scout' in d){const [a,b]=C.scout();S.newY={ids:[a.id,b.id],t:Date.now()};toast(`🌱 Peneira: chegaram ${esc(a.n)} (${a.p}) e ${esc(b.n)} (${b.p}). Eles estão destacados na lista.`);try{A.goal&&A.applause?A.applause(2,.35):0}catch(e){}vYouth();renderTop();setTimeout(()=>{const el=document.querySelector('.ycard.is-new');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},120);return}
    if('upgrade' in d){C.upgradeAcademy();toast('Estrutura da base melhorou.');vYouth();renderTop();return}
    if(d.bstep||d.bset){const i=$('#bid'),r=$('#bidr');const st=+(i.dataset.step||5000);let v=d.bset?+d.bset:(+i.value||0)+(+d.bstep)*st;if(r){v=Math.max(+r.min,Math.min(+r.max,v));r.value=v}i.value=v;$('#bidtxt').textContent=money(v);A.click();return}
    if('install' in d){installApp();return}
    if('austage' in d){S.reveal=null;auStage(true);return}
    if('austageClose' in d){auStage(false);vAuction();return}
    if(d.bid){const v=Math.round((+$('#bid').value||0)/1000)*1000;const lot=C.closeLot(+d.bid,v);S.reveal=+d.bid;A.click();setTimeout(()=>{if(lot.winner===G().user)A.goal();else A.ohh&&A.ohh(.4)},800+((lot.bids||[]).length)*550);auStage(true);vAuction();renderTop();return}
    if(d.pass){const lot=C.closeLot(+d.pass,null);const p=P(lot.pid);S.reveal=null;A.click();toast(lot.winner?`${esc(surname(p.n))} foi para o ${esc(clubOf(lot.winner).short)} por ${money(lot.price)}`:`${esc(surname(p.n))}: ninguém deu lance`);auStage(true);vAuction();renderTop();return}
    if(d.open){C.closeLot(+d.open,null);S.reveal=+d.open;auStage(true);vAuction();renderTop();return}
    if('mksearch' in d){const back=view;S.mk={pos:$('#mk-pos').value,div:$('#mk-div').value,max:+$('#mk-max').value||0,q:$('#mk-q').value.trim(),sort:$('#mk-sort').value,min:+$('#mk-min').value||0,hot:$('#mk-hot').checked,young:$('#mk-young').checked};view==='market'?vMarket():vAuction();return}
    if(d.fac){const l=C.buyFac(d.fac);const f=C.FAC[d.fac];toast(`${f.ic} ${esc(f.n)} agora no nível ${l}!`);try{A.applause&&A.applause(1.6,.3)}catch(e){}renderTop();keepScroll(vClub);return}
    if(d.act){const cost=C.doAct(d.act);toast(`${C.ACTS[d.act].ic} ${esc(C.ACTS[d.act].n)}: feito (${money(cost)}).`);renderTop();keepScroll(vClub);return}
    if(d.boost){const pid=+d.pid;const k=$('#boost-attr').value;const cost=C.boostPlayer(pid,k);toast(`⭐ ${esc(P(pid).n)}: ${esc(C.ATTR_LABEL[k])} +1 (${money(cost)}).`);renderTop();playerModal(pid);return}
    if(d.look){const p=P(+d.pid);if(p){p.look=d.look==='auto'?null:+d.look;C.save();toast('Visual 3D do jogador atualizado.');playerModal(p.id)}return}
    if(d.fort!==undefined){const f=C.resolveFortune(+d.fort);if(f)fortuneResult(f);renderTop();return}
    if('recap' in d){const s=(G().seasonLog||[]).find(x=>x.season==d.recap);if(s)recapModal(s,false);return}
    if('celeok' in d){closeModal();document.body.classList.remove('cele-on');const g=G();setTimeout(()=>{if(uiQueue())return;if(g.jobOffers||g.lastSummary)cont();else if(view==='home')vHome()},60);return}
    if('cuprule' in d){openModal(`<div class="eyebrow">Taça Nacional ${G().season}</div><h1 class="title" style="margin:6px 0 10px">Como funciona</h1><p>${esc(C.CUP_RULE)}</p><p class="muted">Sua vaga: <b>${esc((G().cup.qual||{})[G().user]||'—')}</b>. Os jogos da Taça aparecem com a faixa dourada 🏆 no próximo jogo.</p><div class="row"><button class="btn" data-go="league" data-lgset="cup">Ver chaveamento</button><button class="btn ghost" data-close>Fechar</button></div>`);return}
    if('nextlot' in d){S.reveal=null;auStage(true);vAuction();return}
    if('sellsel' in d){const id=+$('#sellsel').value;const p=P(id);const f=+$('#sellmin').value||.8;const v=Math.round(C.valueOf(p)*f/5000)*5000;C.listForSale(id,v);toast(`${esc(p.n)} vai a leilão (mínimo ${money(v)}).`);vAuction();return}
    if(d.job){C.acceptJob(d.job);closeModal();theme(C.userClub());toast(`Bem-vindo ao ${esc(C.userClub().name)}!`);go('home');if(G().lastSummary)setTimeout(seasonModal,120);return}
    if('nojob' in d){C.declineJobs();closeModal();toast('Você seguiu no projeto.');if(G().lastSummary)setTimeout(seasonModal,120);return}
  }));
  const mkLive=()=>{if(!$('#mk-sort'))return;S.mk={pos:$('#mk-pos').value,div:$('#mk-div').value,max:+$('#mk-max').value||0,q:$('#mk-q').value.trim(),sort:$('#mk-sort').value,min:+$('#mk-min').value||0,hot:$('#mk-hot').checked,young:$('#mk-young').checked};const L=$('#mk-list');if(L)L.innerHTML=mkList()};
  let mkT=null;document.addEventListener('input',e=>{if(e.target.id==='mk-q'){clearTimeout(mkT);mkT=setTimeout(mkLive,220)}});
  document.addEventListener('change',e=>{if(/^mk-/.test(e.target.id||''))mkLive()});
  document.addEventListener('change',err(e=>{const t=e.target;if(t.dataset.ytr){P(+t.dataset.ytr).tr=t.value;C.save();toast('Treino individual ajustado.')}}));
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
  let tx=null;$('#modal').addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});$('#modal').addEventListener('touchend',e=>{if(tx==null||!$('#modal [data-pnav]'))return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>60)navPlayer(dx<0?1:-1);tx=null},{passive:true});
  window.addEventListener('resize',()=>{if(view==='match')MV.resize();if(view==='tactics')TV.render()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(!$('#modal').hidden&&$('#modal [data-pnav]')&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){if(e.key==='ArrowRight'){e.preventDefault();navPlayer(1)}if(e.key==='ArrowLeft'){e.preventDefault();navPlayer(-1)}}if(view==='match'&&e.code==='Space'&&!/INPUT|SELECT/.test(document.activeElement.tagName)){e.preventDefault();MV.toggle()}});
}
function rerender(){renderTop();go(view)}
function uiQueue(){const g=G();if(!$('#modal').hidden)return;
  if(g.celeQ&&g.celeQ.length){const c=g.celeQ.shift();C.save();celebrateScreen(c);return true}
  if(g.lastSummary){seasonModal();return true}/* resumo da temporada pendente: abre assim que der */
  if(g.fortune){const w=(S.lastMatchT||0)+5200-Date.now();if(w>0){clearTimeout(S.fortT);S.fortT=setTimeout(()=>{if(view==='home')uiQueue()},w);return true}fortuneModal(g.fortune);return true}return false}
function celebrateScreen(c){const club=clubOf(c.club)||C.userClub();const big={liga:'CAMPEÃO',taca:'CAMPEÃO',acesso:'ACESSO!'}[c.k]||'CAMPEÃO';
  openModal(`<div class="cele" style="--k1:${club.kit[0]};--k2:${club.kit[1]}"><canvas class="confetti"></canvas><div class="cele-rays"></div>
    <div class="cele-in"><div class="cele-cup">${c.k==='acesso'?'⬆️':'🏆'}</div><div class="cele-crest">${crest(club,96)}</div><div class="cele-big">${big}</div><h1>${esc(c.title)}</h1><p>${esc(c.sub||'')}</p>
    <div class="cele-mgr">Técnico ${esc(G().manager||'')} · ${esc(club.name)}</div><button class="btn big" data-celeok>Levantar a taça 🙌</button></div></div>`);
  $('#modal').classList.add('wide','cele-modal');document.body.classList.add('cele-on');try{A.init();A.fanfare&&A.fanfare()}catch(e){}confetti($('#modal .confetti'),club.kit)}
function confetti(cv,kit){if(!cv)return;const r=cv.getBoundingClientRect();cv.width=r.width;cv.height=r.height;const g=cv.getContext('2d');const cols=[kit[0],kit[1],'#f5c518','#ffffff'];
  const P=Array.from({length:160},()=>({x:Math.random()*cv.width,y:-Math.random()*cv.height,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,w:6+Math.random()*6,c:cols[Math.random()*4|0]}));
  const t0=performance.now();(function f(t){if(!cv.isConnected)return;g.clearRect(0,0,cv.width,cv.height);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(p.y>cv.height+10&&t-t0<6000){p.y=-10;p.x=Math.random()*cv.width}g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);g.restore()}requestAnimationFrame(f)})(t0)}
function fortuneModal(f){openModal(`<div class="fort ${f.good?'good':'bad'}"><div class="fort-card"><div class="fort-back">${f.good?'🍀 SORTE':'⚡ REVÉS'}</div><div class="fort-front">
    <div class="fort-tag">${f.good?'🍀 Sorte':'⚡ Revés'}</div><div class="fort-ic">${f.ic}</div><h1>${esc(f.t)}</h1><p>${esc(f.d)}</p>
    ${f.ch?`<div class="fort-ch">${f.ch.map((l,i)=>`<button class="btn ${i?'ghost':''}" data-fort="${i}">${esc(l)}</button>`).join('')}</div>`:`<div class="fort-res">${esc(f.res||'')}</div><button class="btn" data-fort="0">Seguir em frente</button>`}</div></div></div>`);
  $('#modal').classList.add('fort-modal');try{A.init();f.good?A.applause&&A.applause(1.2,.25):A.ohh&&A.ohh(.5)}catch(e){}}
function fortuneResult(f){if(!f.ch){closeModal();toast(`${f.good?'🍀':'⚡'} ${esc(f.res)}`);uiQueue();if(view==='home')vHome();return}
  openModal(`<div class="fort ${f.good?'good':'bad'} done"><div class="fort-card"><div class="fort-front"><div class="fort-tag">Você escolheu: ${esc(f.ch[f.pickI])}</div><div class="fort-ic">${f.ic}</div><h1>${esc(f.t)}</h1><div class="fort-res">${esc(f.res)}</div><button class="btn" data-close>OK</button></div></div></div>`);$('#modal').classList.add('fort-modal');if(view==='home')vHome()}
function cont(){const g=G();
  if(g.celeQ&&g.celeQ.length){closeModal();uiQueue();return}
  if(g.lastSummary){seasonModal();return}/* resumo primeiro; os convites vêm ao fechar */
  if(g.jobOffers){jobsModal();return}
  go('match');
}
function jobsModal(){const g=G();const j=g.jobOffers;
  const goalFor=c=>{const l=g.div[c.div].map(id=>clubOf(id)).sort((x,y)=>C.teamStrength(y)-C.teamStrength(x));const r=l.findIndex(x=>x.id===c.id)+1;
    return c.div==='A'?(r<=4?'Brigar pelo título':r<=10?'Terminar na metade de cima':'Evitar o rebaixamento'):(r<=4?'Subir de divisão':r<=10?'Ficar perto do acesso':'Manter o clube na divisão')};
  const star=c=>{const ps=c.players.map(P).filter(Boolean).sort((x,y)=>C.ovr(y)-C.ovr(x));return ps[0]?`${esc(ps[0].n)} (${C.ovr(ps[0])})`:'—'};
  const pos=c=>{const t=C.sortedTable(c.div);const i=t.findIndex(r=>r.id===c.id);return i>=0?`${i+1}º`:'—'};
  openModal(`<div class="job-wrap"><div class="job-top"><span class="eyebrow">${j.sacked?'Fim de ciclo':'Mercado de técnicos'}</span>
    <h1 class="title" style="margin:6px 0 4px">${j.sacked?'Você foi demitido':`${j.list.length} clube${j.list.length>1?'s querem':' quer'} você`}</h1>
    <p class="muted" style="margin:0">${j.sacked?'A diretoria encerrou o ciclo. Mas o seu telefone não parou de tocar: escolha o próximo desafio.':'Sua campanha chamou atenção. Abra os envelopes, compare as propostas e decida o futuro da sua carreira.'}</p></div>
  <div class="job-list">${j.list.map((id,k)=>{const c=clubOf(id);const kit=c.kit;return `<div class="job-card" style="--k1:${kit[0]};--k2:${kit[1]};animation-delay:${.15+k*.18}s">
      <div class="job-head"><span class="job-seal">✉ Convite oficial</span>${crest(c,84)}<h2>${esc(c.name)}</h2><span class="job-div">${C.divName(c.div)}</span></div>
      <p class="job-letter">“Prezado ${esc(g.manager||'treinador')}, o ${esc(c.short||c.name)} quer você no comando. Contamos com sua resposta.”<small>— Presidente do ${esc(c.short||c.name)}</small></p>
      <div class="job-facts"><div><span>Meta</span><b>${goalFor(c)}</b></div><div><span>Força</span><b>${C.teamStrength(c).toFixed(0)}</b></div><div><span>Caixa</span><b>${money(c.money)}</b></div><div><span>Na tabela</span><b>${pos(c)}</b></div></div>
      <div class="job-star">⭐ Craque: <b>${star(c)}</b></div>
      <button class="btn big go" style="width:100%" data-job="${id}">✍️ Assinar contrato</button></div>`}).join('')}</div>
  ${j.sacked?'':'<button class="btn ghost" style="width:100%;margin-top:12px" data-nojob>Recusar e continuar no projeto atual</button>'}</div>`);
  $('#modal').classList.add('wide');try{A.init();A.gate&&A.gate(false)}catch(e){}}
function seasonModal(){const g=G();const s=g.lastSummary;g.lastSummary=null;C.save();recapModal(s,true)}
function recapModal(s,fresh){const g=G();const R=s.recap||{};const cl=id=>clubOf(id)||{short:'?',name:'?',kit:['#333','#fff']};
  const mv=(s.moves||[]).filter(([c])=>c===s.club)[0];const up=mv&&C.DIVS.indexOf(mv[2])<C.DIVS.indexOf(mv[1]);
  const steps=[];const add=(eye,title,body)=>steps.push(`<section class="rs-step"><div class="rs-eye">${eye}</div><h2 class="rs-title">${title}</h2>${body}</section>`);
  // 1. sua temporada
  const big=mv?(up?'Acesso!':'Rebaixado'):s.pos===1?'Campeão!':`${s.pos}º lugar`;
  add(`Temporada ${s.season}`,esc(cl(s.club).short),`<div class="rs-hero ${mv?(up?'up':'dn'):s.pos===1?'up':''}">${crest(cl(s.club),88)}<b>${big}</b><span>${mv?(up?'Sobe para a ':'Cai para a ')+C.divName(mv[2]):C.divName(s.div)+(s.pos===1?'':' · '+s.pos+'º lugar')}</span></div>
    <div class="rs-kpis"><div><span>Premiação</span><b>${money(s.prize||0)}</b></div><div><span>Taça</span><b>${esc(s.cupOut||'—')}</b></div><div class="${s.met?'up':'dn'}"><span>Diretoria</span><b>${s.conf}%</b></div></div>
    <p class="rs-note">${s.met?'Meta da diretoria cumprida.':'A diretoria esperava mais. Atenção na próxima temporada.'}</p>`);
  if(R.champ){
  // 2. campeões
  add('Quem levantou a taça','Campeões',`<div class="rs-list">${C.DIVS.map(d=>`<div class="rs-row click" data-club="${R.champ[d]}">${crest(cl(R.champ[d]),40)}<div><b>${esc(cl(R.champ[d]).short)}</b><small>Série ${d}</small></div><span class="rs-tag">campeão</span></div>`).join('')}
    ${R.cup?`<div class="rs-row gold click" data-club="${R.cup}">${crest(cl(R.cup),40)}<div><b>${esc(cl(R.cup).short)}</b><small>Taça Nacional${R.cupF?` · final ${R.cupF.gh}×${R.cupF.ga}`:''}</small></div><span class="rs-tag">taça</span></div>`:''}</div>`);
  // 3. craque + prêmios
  const pl=(p,lab,stat)=>p?`<div class="rs-row click" data-player="${p.id}">${crest(cl(p.c),34)}<div><small>${lab}</small><b>${esc(p.n)}</b><small>${esc(cl(p.c).short)}</small></div><span class="rs-num">${stat}</span></div>`:'';
  add('Prêmios individuais','Craque da temporada',`${R.mvp?`<div class="rs-star click" data-player="${R.mvp.id}">${crest(cl(R.mvp.c),64)}<div><b>${esc(R.mvp.n)}</b><span>${posTag(R.mvp.p)} ${esc(cl(R.mvp.c).short)} · ${R.mvp.a} anos</span><div class="rs-stats"><i><b>${R.mvp.r.toFixed(1)}</b>nota</i><i><b>${R.mvp.g}</b>gols</i><i><b>${R.mvp.as}</b>assist.</i></div></div></div>`:''}
    <div class="rs-list">${pl(R.scorers[0],'Artilheiro',`${R.scorers[0]?R.scorers[0].g:0}<small>gols</small>`)}${pl(R.assist,'Garçom',`${R.assist?R.assist.as:0}<small>assist.</small>`)}${pl(R.gk,'Melhor goleiro',`${R.gk?R.gk.r.toFixed(1):''}<small>nota</small>`)}${pl(R.young,'Revelação',`${R.young?R.young.r.toFixed(1):''}<small>nota</small>`)}</div>`);
  // 4. seleção
  const rows=[['ATA'],['PE','MEI','PD'],['VOL','MC'],['LE','ZAG','ZAG','LD'],['GOL']];const xi=(R.xi||[]).filter(Boolean);const take={};
  add('Os 11 melhores do ano','Seleção da temporada',`<div class="rc-pitch">${rows.map(r=>`<div class="rc-line">${r.map(pos=>{const k=(take[pos]=(take[pos]||0)+1);const p=xi.filter(x=>x.slot===pos)[k-1];return p?`<div class="rc-dot click" data-player="${p.id}" style="--k1:${cl(p.c).kit[0]};--k2:${cl(p.c).kit[1]}"><span>${p.r.toFixed(1)}</span><b>${esc(p.n.split(' ').slice(-1)[0])}</b><small>${esc(cl(p.c).short)}</small></div>`:''}).join('')}</div>`).join('')}</div>`);
  // 5. sobe e desce + técnico do ano
  const sd=C.DIVS.map(d=>{const u=R.up[d]||[],dn=R.down[d]||[];if(!u.length&&!dn.length)return '';return `<div class="rs-sd"><div class="rs-sdh">Série ${d}</div>${u.map(id=>`<div class="rs-mini up ${id===s.club?'me':''} click" data-club="${id}">▲ ${esc(cl(id).short)}</div>`).join('')}${dn.map(id=>`<div class="rs-mini dn ${id===s.club?'me':''} click" data-club="${id}">▼ ${esc(cl(id).short)}</div>`).join('')}</div>`}).join('');
  const co=(R.coaches||[])[0];
  add('Nova divisão para eles','Sobe e desce',`<div class="rs-sdg">${sd}</div>${co?`<div class="rs-row click" data-club="${co.id}" style="margin-top:14px">${crest(cl(co.id),34)}<div><small>Técnico do ano</small><b>${esc(co.coach)}</b><small>${esc(cl(co.id).short)} · ${co.pos}º (previsão: ${co.exp}º)</small></div></div>`:''}`);
  // 6. mercado
  const xf=(R.xfers||[]).slice(0,5);if(xf.length)add(`${R.nx} negócios no ano`,'Maiores transações',`<div class="rs-list">${xf.map(m=>`<div class="rs-row click" data-player="${m.pid}">${posTag(m.pos)}<div><b>${esc(m.name)}</b><small>${esc(cl(m.from).short)} → ${esc(cl(m.to).short)}</small></div><span class="rs-num">${money(m.price)}</span></div>`).join('')}</div>`);
  }
  if(fresh&&steps.length){steps[steps.length-1]=steps[steps.length-1].replace(/<\/section>$/,`<button class="btn ghost rs-auc" data-go="auction">🔨 Ver o leilão especial</button></section>`)}
  openModal(`<div class="rs"><div class="rs-track">${steps.join('')}</div>
    <div class="rs-nav"><button class="btn ghost rs-prev" aria-label="Voltar">‹</button><div class="rs-dots">${steps.map((_,i)=>`<i data-rs="${i}"></i>`).join('')}</div><button class="btn rs-next">Próximo ›</button><button class="btn rs-end" data-recapend>${fresh?`Começar ${s.season+1} ▸`:'Fechar'}</button></div></div>`);
  const M=$('#modal');M.classList.add('recap-modal');const tr=M.querySelector('.rs-track'),n=steps.length;let cur=0;
  const go=i=>{cur=Math.max(0,Math.min(n-1,i));tr.style.transform=`translateX(${-cur*100}%)`;M.querySelectorAll('.rs-step').forEach((e,k)=>e.classList.toggle('on',k===cur));M.querySelectorAll('[data-rs]').forEach((e,k)=>e.classList.toggle('on',k===cur));
    M.querySelector('.rs-prev').style.visibility=cur?'visible':'hidden';const nx=M.querySelector('.rs-next');nx.hidden=cur===n-1;M.querySelector('.rs-end').hidden=cur!==n-1;M.querySelector('.rs').scrollTop=0};
  M.querySelector('.rs-prev').onclick=()=>go(cur-1);M.querySelector('.rs-next').onclick=()=>go(cur+1);M.querySelectorAll('[data-rs]').forEach(e=>e.onclick=()=>go(+e.dataset.rs));
  let x0=null;tr.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});tr.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1))});
  go(0);try{if(fresh){A.init();A.applause&&A.applause(1,.2)}}catch(e){}}
function careerStats(){const g=G();const u=g.user;const cr={j:0,v:0,e:0,d:0,gp:0,gc:0};for(const h of g.history||[]){if(h.home!==u&&h.away!==u)continue;const my=h.home===u?h.hg:h.ag,op=h.home===u?h.ag:h.hg;cr.j++;cr.gp+=my;cr.gc+=op;my>op?cr.v++:my<op?cr.d++:cr.e++}return cr}
function menuModal(tab){tab=tab||S.menuTab||'root';S.menuTab=tab;const g=G(),c=C.userClub();
  const tabs=[['perfil','👤','Perfil do treinador','Carreira, títulos e estatísticas'],['audio','🔊','Sons e volume','Música, efeitos e torcida'],['visual','🎨','Aparência','Cor, tamanho do texto, animações'],['jogo','⚽','Partidas','Câmera e velocidade padrão'],['dados','💾','Conta e save','Nuvem, exportar, novo jogo']];
  let body='';
  if(tab==='root'){const cs=careerStats();const ap=cs.j?Math.round((cs.v*3+cs.e)/(cs.j*3)*100):0;const ini=(g.manager||'T').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
    body=`<button class="mprof" data-mtab="perfil"><span class="prof-av sm" style="background:linear-gradient(135deg,${c.kit[0]},${c.kit[1]})">${esc(ini)}</span><span class="mrow-t"><b>${esc(g.manager||'Treinador')}</b><small>${esc(c.short||c.name)} · ${C.divName(c.div)} · ${cs.j} jogos · ${ap}% aproveit.</small></span><span class="mrow-ch">›</span></button>
      <div class="mlist"><button class="mrow" id="m-careers2"><span class="mrow-ic">🗂️</span><span class="mrow-t"><b>Minhas carreiras</b><small>trocar de carreira ou criar uma nova</small></span><span class="mrow-ch">›</span></button><button class="mrow" data-go="online"><span class="mrow-ic">🌐</span><span class="mrow-t"><b>Online</b><small>liga com amigos e partida ao vivo</small></span><span class="mrow-ch">›</span></button></div>
      <div class="mlist"><div class="mrow"><span class="mrow-ic">♫</span><span class="mrow-t"><b>Música</b></span><button class="tgl ${A.S.music?'on':''}" data-pf-audio="music" aria-label="Música"></button></div><div class="mrow"><span class="mrow-ic">📣</span><span class="mrow-t"><b>Efeitos e torcida</b></span><button class="tgl ${A.S.sfx?'on':''}" data-pf-audio="sfx" aria-label="Efeitos"></button></div></div>
      <div class="mlist">${tabs.slice(1).map(([k,ic,t,d])=>`<button class="mrow" data-mtab="${k}"><span class="mrow-ic">${ic}</span><span class="mrow-t"><b>${t}</b><small>${d}</small></span><span class="mrow-ch">›</span></button>`).join('')}${window.FUTBOL_INSTALL?`<button class="mrow" data-install><span class="mrow-ic">📲</span><span class="mrow-t"><b>Instalar app</b><small>Ícone na tela inicial, abre em tela cheia</small></span><span class="mrow-ch">›</span></button>`:''}</div>
      <p class="dim" style="font-size:12px;text-align:center;margin:14px 0 0">FUTBOL · o jogo salva sozinho</p>`}
  if(tab==='perfil'){const cs=careerStats();const ap=cs.j?Math.round((cs.v*3+cs.e)/(cs.j*3)*100):0;const ttl=(g.seasonLog||[]).filter(x=>x.champ&&x.div&&x.champ[x.div]===g.user).length+(g.seasonLog||[]).filter(x=>x.cup===g.user).length;
    const ini=(g.manager||'T').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
    body=`<div class="prof"><div class="prof-av" style="background:linear-gradient(135deg,${c.kit[0]},${c.kit[1]})">${esc(ini)}</div><div style="flex:1;min-width:0"><div class="eyebrow">Treinador · temporada ${g.season}</div>
      <input id="pf-name" value="${esc(g.manager||'')}" maxlength="28" class="prof-name" aria-label="Nome do treinador"><div class="row wrap" style="gap:6px;margin-top:6px"><span class="chip">${crest(c,18)} ${esc(c.name)}</span><span class="chip">${C.divName(c.div)}</span>${ACC.st.user?`<span class="chip">☁️ ${esc(ACC.st.user.email)}</span>`:''}</div></div></div>
      <div class="grid g4 pstats" style="margin-top:14px"><div class="stat"><b>${cs.j}</b><span>Jogos</span></div><div class="stat"><b>${cs.v}-${cs.e}-${cs.d}</b><span>V-E-D</span></div><div class="stat"><b>${ap}%</b><span>Aproveit.</span></div><div class="stat"><b>${ttl}</b><span>Títulos</span></div></div>
      <div class="grid g4 pstats" style="margin-top:8px"><div class="stat"><b>${cs.gp}</b><span>Gols pró</span></div><div class="stat"><b>${cs.gc}</b><span>Gols contra</span></div><div class="stat"><b>${g.board.conf}%</b><span>Diretoria</span></div><div class="stat"><b>${(g.seasonLog||[]).length}</b><span>Temporadas</span></div></div>
      ${(g.seasonLog||[]).length?`<div class="h" style="margin-top:14px">Carreira</div>${g.seasonLog.slice().reverse().map(x=>`<div class="msg" style="cursor:default"><b>${x.season} · Série ${x.div} · ${x.pos}º lugar</b><p>${x.met?'Meta cumprida':'Meta não cumprida'}${x.cupOut?' · Taça: '+esc(x.cupOut):''}</p></div>`).join('')}`:'<p class="muted" style="margin-top:12px">Sua primeira temporada está em andamento. O histórico aparece aqui no fim de cada ano.</p>'}`}
  if(tab==='audio')body=`<div class="set"><label class="set-r"><span>Música<small>trilha no menu e entre os jogos</small></span><button class="tgl ${A.S.music?'on':''}" data-pf-audio="music"></button></label>
    <label class="set-r"><span>Volume da música</span><input type="range" min="0" max="1" step=".05" value="${A.S.mv}" data-aud="mv"></label>
    <label class="set-r"><span>Trilha</span><span class="row" style="gap:6px;flex-wrap:nowrap"><select id="mtrack">${'<option value="-1"'+(A.trackSel<0?' selected':'')+'>🔀 Automática: samba nas telas, bossa na tática</option>'+A.tracks.map((n,i)=>`<option value="${i}"${A.trackSel===i?' selected':''}>♪ ${esc(n)}</option>`).join('')}</select><button class="btn ghost sm" id="mnext" title="Próxima">⏭</button></span></label>
    <label class="set-r"><span>Efeitos<small>apito, chute, portão, leilão</small></span><button class="tgl ${A.S.sfx?'on':''}" data-pf-audio="sfx"></button></label>
    <label class="set-r"><span>Volume dos efeitos</span><input type="range" min="0" max="1" step=".05" value="${A.S.sv}" data-aud="sv"></label>
    <label class="set-r"><span>Volume da torcida<small>barulho, batucada e cantos</small></span><input type="range" min="0" max="1" step=".05" value="${A.S.cv??.7}" data-aud="cv"></label>
    <div class="row wrap" style="gap:8px"><button class="btn ghost sm" data-test="gate">🔊 Testar portão</button><button class="btn ghost sm" data-test="goal">⚽ Testar gol</button><button class="btn ghost sm" data-test="sub">🔁 Testar substituição</button></div></div>`;
  if(tab==='visual')body=`<div class="set"><label class="set-r"><span>Tema<small>claro para usar de dia, escuro para a noite</small></span><span class="seg">${[['dark','🌙 Escuro'],['light','☀️ Claro'],['auto','Automático']].map(([v,l])=>`<button data-pf="mode:${v}" class="${(PREF.mode||'dark')===v?'on':''}">${l}</button>`).join('')}</span></label>
    <label class="set-r"><span>Cor do jogo</span><span class="seg"><button data-pf="acc:club" class="${PREF.acc==='club'?'on':''}">Do clube</button><button data-pf="acc:custom" class="${PREF.acc==='custom'?'on':''}">Escolher</button></span></label>
    ${PREF.acc==='custom'?`<div class="swatches">${['#1f8f4e','#c8102e','#1450a0','#f2c200','#8c1d3a','#e86a1f','#7a3cf0','#0fb5ae','#d8dde2'].map(x=>`<button style="background:${x}" data-pf="custom:${x}" class="${PREF.custom===x?'on':''}" aria-label="${x}"></button>`).join('')}</div>`:''}
    <label class="set-r"><span>Tamanho do texto</span><span class="seg">${[[.9,'Menor'],[1,'Normal'],[1.1,'Maior'],[1.2,'Grande']].map(([v,l])=>`<button data-pf="font:${v}" class="${PREF.font===v?'on':''}">${l}</button>`).join('')}</span></label>
    <label class="set-r"><span>Animações<small>desligue se o aparelho estiver lento</small></span><button class="tgl ${PREF.motion?'on':''}" data-pf="motion:${!PREF.motion}"></button></label></div>`;
  if(tab==='jogo')body=`<div class="set"><label class="set-r"><span>Gráficos da partida<small>3D com estádio e jogadores animados · 2D é mais leve</small></span><span class="seg"><button data-pf="gfx:3d" class="${PREF.gfx!=='2d'?'on':''}">3D</button><button data-pf="gfx:2d" class="${PREF.gfx==='2d'?'on':''}">2D leve</button></span></label>
    <label class="set-r"><span>Replays<small>gols, defesas difíceis e bolas na trave</small></span><span class="seg"><button data-pf="goalReplay:true" class="${PREF.goalReplay!==false?'on':''}">Ligado</button><button data-pf="goalReplay:false" class="${PREF.goalReplay===false?'on':''}">Desligado</button></span></label>
    <label class="set-r"><span>Câmera padrão</span><span class="seg"><button data-pf="cam:tv" class="${PREF.cam==='tv'?'on':''}">TV</button><button data-pf="cam:top" class="${PREF.cam==='top'?'on':''}">Tática</button></span></label>
    <label class="set-r"><span>Zoom da câmera<small>no celular, "Médio" aproxima o lance</small></span><span class="seg">${[['auto','Auto'],[1,'Longe'],[1.5,'Médio'],[2,'Perto']].map(([v,l])=>`<button data-pf="zoom:${v}" class="${String(PREF.zoom??'auto')===String(v)?'on':''}">${l}</button>`).join('')}</span></label>
    <label class="set-r"><span>Velocidade padrão</span><span class="seg">${[1,2,4].map(v=>`<button data-pf="speed:${v}" class="${PREF.speed===v?'on':''}">${v}x</button>`).join('')}</span></label>
    <p class="dim" style="font-size:13px">Vale a partir da próxima partida. Durante o jogo dá para mudar a qualquer momento.</p></div>`;
  if(tab==='dados')body=`${ACC.st.online?(ACC.st.user?`<div class="frame" style="padding:12px"><div class="h">Conta <small>${esc(ACC.st.user.email)}</small></div><div class="row wrap"><button class="btn sm" id="m-cloud">Salvar na nuvem agora</button><button class="btn ghost sm" id="m-careers">Minhas carreiras</button><button class="btn ghost sm" id="m-pass">Trocar senha</button><button class="btn ghost sm" id="m-logout">Sair</button><button class="btn ghost sm" id="m-delacc">Excluir conta</button></div><p class="dim" style="font-size:12.5px;margin:8px 0 0">Esta carreira está no espaço ${g.slot||'—'} e salva sozinha na nuvem.</p></div>`:`<div class="frame row" style="padding:12px;justify-content:space-between"><span class="muted">Entre para salvar esta carreira na nuvem.</span><button class="btn sm" id="m-login">Entrar / Criar conta</button></div>`):''}
    <div class="row wrap" style="margin-top:12px"><button class="btn ghost sm" id="m-export">Exportar save</button><label class="btn ghost sm">Importar save<input type="file" id="m-import" accept=".json" hidden></label><button class="btn ghost sm" id="m-new">Novo jogo</button>${window.FUTBOL_INSTALL?`<button class="btn sm" data-install>📲 Instalar app</button>`:''}</div>
    <p class="dim" style="font-size:13px">O jogo salva sozinho neste navegador. Exporte o save para continuar em outro aparelho.</p>`;
  const cur=tabs.find(x=>x[0]===tab);
  openModal(tab==='root'?`<h1 class="title" style="margin-bottom:14px">Menu</h1><div class="mbody">${body}</div>`:`<div class="mhead"><button class="mback" data-mtab="root">‹ Menu</button></div><h1 class="title msub" style="margin-bottom:14px">${cur?cur[2]:''}</h1><div class="mbody">${body}</div>`);
  $$('[data-mtab]').forEach(b=>b.onclick=()=>{A.click();menuModal(b.dataset.mtab)});
  const nm=$('#pf-name');if(nm)nm.onchange=()=>{g.manager=nm.value.trim()||'Treinador';C.save();toast('Nome atualizado.')};
  $$('[data-aud]').forEach(r=>r.oninput=()=>{A.init();A.set(r.dataset.aud,+r.value)});
  $$('[data-pf-audio]').forEach(b=>b.onclick=e=>{e.preventDefault();A.init();const k=b.dataset.pfAudio;A.set(k,!A.S[k]);renderTop();menuModal()});
  $$('[data-test]').forEach(b=>b.onclick=()=>{A.init();const k=b.dataset.test;if(k==='goal'){A.crowd(true);A.goal(true);setTimeout(()=>{if(U.view!=='match')A.crowd(false)},7000)}else A[k](true)});
  $$('[data-pf]').forEach(b=>b.onclick=e=>{e.preventDefault();const [k,v]=b.dataset.pf.split(':');PREF[k]=v==='true'?true:v==='false'?false:isNaN(+v)||k==='custom'?v:+v;savePref();theme(C.userClub());A.click();menuModal();if(k==='gfx'){if(v!=='2d'&&typeof C11Render3D!=='undefined')C11Render3D.preload();if(view==='match'&&MV.m){closeModal();MV.render();toast(v==='2d'?'Partida em 2D.':'Partida em 3D.')}}});
  const mt=$('#mtrack');if(mt)mt.onchange=e=>{A.init();A.choose(+e.target.value);if(!A.S.music){A.set('music',true);renderTop()}A.music(true)};const mn=$('#mnext');if(mn)mn.onclick=()=>{A.init();A.next();if(A.S.music)A.music(true)};
  const on=(id,f)=>{const e=$(id);if(e)e.onclick=err(f)};
  on('#m-cloud',async()=>{if(!g.slot){g.slot=Math.max(0,...ACC.st.careers.map(c=>c.slot))+1}await ACC.push();await ACC.list();toast('Carreira salva na nuvem.');menuModal()});
  on('#m-careers',()=>{closeModal();C.save();startScreen()});on('#m-careers2',async()=>{closeModal();C.save();try{await CAR.put(C.G)}catch(e){}startScreen()});
  on('#m-pass',()=>ACC.changePass());on('#m-logout',async()=>{await ACC.logout();toast('Você saiu da conta.');menuModal()});
  on('#m-delacc',async()=>{await ACC.deleteAccount();menuModal()});
  on('#m-login',()=>ACC.authForm(()=>{if(!g.slot)g.slot=Math.max(0,...ACC.st.careers.map(c=>c.slot))+1;ACC.push().then(()=>ACC.list());renderTop()}));
  on('#m-export',()=>{const b=new Blob([C.exportSave()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`futbol-${g.user}-${g.season}.json`;a.click()});
  const imp=$('#m-import');if(imp)imp.onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(err(t=>{C.importSave(t);location.reload()}))};
  on('#m-new',()=>{if(confirm('Começar um novo jogo? O save atual será apagado (exporte antes se quiser guardar).')){C.wipe();location.reload()}});
}

/* ---------- tela inicial ---------- */
/* ---------- carreiras guardadas no aparelho (quantas quiser) ---------- */
var CAR=(function(){let dbp=null,tm=null;
  const db=()=>dbp||(dbp=new Promise((res,rej)=>{if(!window.indexedDB){rej(new Error('sem IndexedDB'));return}const r=indexedDB.open('futbol',1);r.onupgradeneeded=()=>r.result.createObjectStore('careers',{keyPath:'cid'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  const run=async(mode,f)=>{const d=await db();return new Promise((res,rej)=>{const t=d.transaction('careers',mode);const r=f(t.objectStore('careers'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})};
  const meta=g=>{const c=g.clubs[g.user]||{};return {club:c.name||g.user,short:c.short||g.user,kit:c.kit,div:c.div,season:g.season,seasons:(g.seasonLog||[]).length,titles:(()=>{try{return C.trophies().length}catch(e){return 0}})(),manager:g.manager,upd:Date.now()}};
  const put=g=>run('readwrite',s=>s.put({cid:g.cid,meta:meta(g),data:JSON.stringify(g)})).catch(e=>console.warn('car',e));
  return {put,later(){clearTimeout(tm);tm=setTimeout(()=>{if(C.G&&C.G.cid&&!C.G._tacBak)put(C.G)},1500)},
    list:()=>run('readonly',s=>s.getAll()).then(a=>(a||[]).map(x=>({cid:x.cid,meta:x.meta})).sort((a,b)=>b.meta.upd-a.meta.upd)).catch(()=>[]),
    get:cid=>run('readonly',s=>s.get(cid)),del:cid=>run('readwrite',s=>s.delete(cid))}})();
window.CAR=CAR;
if(typeof document!=='undefined'){const fl=()=>{try{if(C.G&&C.G.cid&&!C.G._tacBak)CAR.put(C.G)}catch(e){}};document.addEventListener('visibilitychange',()=>{if(document.hidden)fl()});addEventListener('pagehide',fl)}/* fechando o app: guarda na hora */
function startScreen(){
  const st={div:'D',club:null,name:'',slot:null};
  const el=$('#start');el.hidden=false;$('.app').hidden=true;
  const tmp={};// clubes ainda não existem: usa dados base
  const draw=()=>{const list=C.D.divisions[st.div];if(!st.club||!list.includes(st.club))st.club=list[0];
    const fake=n=>({name:n,short:C.D.short[n]||n,kit:C.D.kits[n]||['#2b6cb0','#fff','#2b6cb0','liso']});
    const acc=n=>{const k=fake(n).kit;for(const c of k){const [r,g,b]=hex(c);if(Math.max(r,g,b)-Math.min(r,g,b)>90)return c}return '#d8dde2'};
    theme({acc:acc(st.club),kit:fake(st.club).kit});
    const card=(m,btns)=>`<div class="car-card"><div class="car-top">${m.kit?shirtSvg(m.kit,null,54):''}<div><b>${esc(m.club||'?')}</b><small>Série ${esc(m.div||'?')} · temporada ${m.season||''}</small></div></div><div class="car-stats"><span><b>${m.seasons||0}</b>temporada${(m.seasons||0)===1?'':'s'} jogada${(m.seasons||0)===1?'':'s'}</span><span><b>${m.titles||0}</b>título${(m.titles||0)===1?'':'s'}</span></div><div class="dim" style="font-size:12px">${esc(m.manager||'')}${m.upd?' · '+new Date(m.upd).toLocaleDateString('pt-BR'):''}</div><div class="row wrap" style="margin-top:8px">${btns}</div></div>`;
    const AS=ACC.st;const slotsHtml=!AS.online?'':!AS.user?`<div class="frame row wrap" style="margin-bottom:16px;justify-content:space-between"><span class="muted">Crie uma conta para salvar suas carreiras na nuvem e jogar de qualquer aparelho.</span><button class="btn sm" id="s-login">Entrar / Criar conta</button></div>`:
      `<div class="frame" id="s-cloud" style="margin-bottom:16px"><div class="h">Carreiras na nuvem <small>${U.esc(AS.user.name)} · <a href="#" id="s-logout" style="color:var(--acc2)">sair</a></small></div><div class="car-grid">${AS.careers.map(cr=>card({...cr.meta,upd:cr.upd*1000},`<button class="btn xs" data-cload="${cr.slot}">Jogar</button><button class="btn ghost xs" data-cdel="${cr.slot}">Apagar</button>`)).join('')}${AS.careers.length?'':'<p class="muted">Nenhuma carreira na nuvem ainda: a próxima que você criar fica salva aqui.</p>'}</div></div>`;
    const locHtml=st.loc&&st.loc.length?`<div class="frame" style="margin-bottom:16px"><div class="h">Carreiras neste aparelho <small>${st.loc.length} · crie quantas quiser</small></div><div class="car-grid">${st.loc.map(x=>card(x.meta,`<button class="btn xs" data-lload="${x.cid}">${C.G&&C.G.cid===x.cid?'Continuar':'Jogar'}</button><button class="btn ghost xs" data-ldel="${x.cid}">Apagar</button>`)).join('')}<button class="car-card car-new" data-newcar>＋<b>Nova carreira</b><small>escolha o clube abaixo</small></button></div></div>`:'';
    el.innerHTML=`<div class="start"><div class="stadium" aria-hidden="true"><i class="fl l"></i><i class="fl r"></i><div class="crowdbg"></div><div class="pitchbg"></div></div><div style="width:min(1100px,100%);position:relative;z-index:1">${locHtml}${slotsHtml}<div class="hero"><div class="eyebrow hero-eye">⚽ Manager de futebol brasileiro</div><div style="display:flex;justify-content:center;margin:10px 0 6px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 698 765" class="logo-s" style="height:min(26vh,220px);width:auto;display:block" aria-label="FUTBOL"><path fill="currentColor" fill-rule="evenodd" d="M340 7L588 78 597 83 530 91 338 39 56 123 45 186 11 286 28 102ZM687 86L693 87 675 138 618 146 573 288 506 294 548 157 548 153 534 153 483 159 490 133 502 111ZM470 111L481 113 434 265 425 280 410 295 382 311 272 326 243 319 229 299 228 287 277 134 300 128 341 124 341 132 301 256 302 264 308 269 337 267 363 261 374 248 413 119ZM254 132L264 133 247 181 130 197 121 227 219 216 221 218 206 259 201 264 107 275 86 340 82 344 14 366 6 366 80 156ZM660 203L663 224 666 406 642 409 639 209ZM601 305L606 305 607 309 560 446 669 433 676 433 677 436 647 492 597 498 483 514 475 514 475 510 536 314ZM449 323L468 323 485 330 497 342 502 360 473 462 463 483 443 505 412 522 290 536 269 528 260 517 255 495 279 413 295 371 318 348 342 336ZM222 346L236 346 256 353 266 362 271 384 260 421 233 444 249 462 249 474 240 505 222 529 207 540 182 550 24 568 17 568 17 564 81 363ZM410 376L424 377 431 388 407 460 390 474 336 480 327 472 327 463 350 393 368 381ZM32 386L36 386 35 443 27 469 7 526 12 395ZM188 396L197 396 203 402 200 414 193 423 184 427 121 433 122 425 129 404ZM169 470L176 470 183 476 179 492 170 501 109 510 96 510 108 477ZM624 519L631 520 626 541 615 564 603 578 339 760 333 759 121 621 71 588 70 583 106 580 201 641 203 570 258 565 258 677 287 699 304 709 306 707 306 560 310 558 362 556 363 714 408 682 410 548 464 542 466 643 583 561 594 549 604 522Z"/></svg></div>
        <h2 class="hero-title">Do campinho da Série D<br><span>à taça da Série A.</span></h2>
        <p class="hero-sub">Assuma um clube de verdade, com elenco oficial de 2026. Arremate reforços no leilão, revele craques na base, desenhe a tática com setas e veja o time obedecer em campo.</p>
        <div class="hero-feats"><span>🏟️ 80 clubes reais</span><span>👕 Elencos 2026</span><span>🔨 Leilão às cegas</span><span>📋 Tática com setas</span><span>🌱 Categoria de base</span><span>⚽ Jogo ao vivo</span></div>
        ${window.FUTBOL_INSTALL?`<button class="btn ghost sm install-chip" data-install>📲 Instalar app</button>`:''}<a class="btn ghost sm" href="conheca/" style="margin-top:6px">Conheça o FUTBOL ›</a><div class="hero-pick">⬇ Escolha seu clube e entre em campo</div></div>
      ${C.hasSave()?`<div style="text-align:center;margin-bottom:18px"><button class="btn big go" id="s-cont">Continuar carreira ▸</button></div>`:''}
      <div class="frame"><div class="row wrap" style="margin-bottom:14px"><input type="text" id="s-name" placeholder="Seu nome de treinador" value="${esc(st.name)}" style="flex:1;min-width:220px"><div class="seg" style="width:420px">${C.DIVS.map(d=>`<button data-div="${d}" class="${st.div===d?'on':''}">Série ${d}</button>`).join('')}</div></div>
      <div class="clubs">${list.map(n=>{const c=fake(n);return `<button data-pick="${esc(n)}" class="${st.club===n?'on':''}">${shirtSvg(c.kit,null,64)}${esc(c.short)}</button>`}).join('')}</div>
      <div class="row" style="margin-top:16px;justify-content:space-between"><span class="muted">${st.div==='D'?'Recomendado: começar na Série D e subir até a A.':'Clubes maiores têm mais caixa e mais cobrança.'}</span><button class="btn big" id="s-go">Assumir o ${esc(fake(st.club).short)} ▸</button></div></div></div></div>`;
    $$('[data-div]',el).forEach(b=>b.onclick=()=>{st.name=$('#s-name').value;st.div=b.dataset.div;st.club=null;draw()});
    $$('[data-pick]',el).forEach(b=>b.onclick=()=>{st.name=$('#s-name').value;st.club=b.dataset.pick;A.init();A.click();draw()});
    $('#s-go').onclick=async()=>{A.init();const AS=ACC.st;if(AS.user){st.slot=Math.max(0,...AS.careers.map(c=>c.slot))+1;if(st.slot>99){toast('Limite de 99 carreiras na nuvem: apague uma antiga.');return}}
      if(C.G&&C.G.cid)await CAR.put(C.G);// a carreira atual continua guardada
      C.newGame(st.club,$('#s-name').value.trim()||(AS.user?AS.user.name:'Treinador'));if(AS.user)C.G.slot=st.slot;C.save();if(AS.user)ACC.push().then(()=>ACC.list());launch()};
    const sl=$('#s-login');if(sl)sl.onclick=()=>ACC.authForm(()=>{draw();el.scrollTo({top:0,behavior:'smooth'});const f=$('#s-cloud');if(f){f.classList.add('cloud-hi');setTimeout(()=>f.classList.remove('cloud-hi'),2600)}
      const n=ACC.st.careers.length;toast(n?`${n} carreira${n>1?'s':''} na nuvem: toque em Jogar para continuar`:'Nenhuma carreira salva na nuvem nesta conta')});
    const so=$('#s-logout');if(so)so.onclick=e=>{e.preventDefault();ACC.logout().then(draw)};
    $$('[data-cnew]',el).forEach(b=>b.onclick=()=>{st.slot=+b.dataset.cnew;draw();$('#s-go').scrollIntoView({behavior:'smooth',block:'center'})});
    $$('[data-cload]',el).forEach(b=>b.onclick=err(async()=>{A.init();b.disabled=true;b.textContent='Carregando…';try{await ACC.load(+b.dataset.cload);launch()}catch(e){toast('⚠️ '+esc(e.message));b.disabled=false}}));
    $$('[data-cdel]',el).forEach(b=>b.onclick=err(async()=>{if(!confirm('Apagar esta carreira da nuvem?'))return;await ACC.delCareer(+b.dataset.cdel);draw()}));
    const sc=$('#s-cont');if(sc)sc.onclick=err(async()=>{A.init();C.load();if(C.G&&C.G.cid){try{const r=await CAR.get(C.G.cid);if(r){const w=C.newerSave(C.G,JSON.parse(r.data));if(w!==C.G)C.loadObj(w)}}catch(e){}}launch()});
    $$('[data-lload]',el).forEach(b=>b.onclick=err(async()=>{A.init();if(C.G&&C.G.cid&&C.G.cid!==b.dataset.lload)await CAR.put(C.G);const r=await CAR.get(b.dataset.lload);if(!r)throw new Error('Carreira não encontrada.');let g=JSON.parse(r.data);const cur=C.current();if(cur&&cur.cid===g.cid)g=C.newerSave(g,cur);/* nunca abre uma cópia mais velha que a atual */C.loadObj(g);launch()}));
    $$('[data-ldel]',el).forEach(b=>b.onclick=err(async()=>{const x=st.loc.find(y=>y.cid===b.dataset.ldel);if(!confirm(`Apagar a carreira do ${x?x.meta.club:''}? Não dá para desfazer.`))return;await CAR.del(b.dataset.ldel);if(C.G&&C.G.cid===b.dataset.ldel){C.wipe()}st.loc=await CAR.list();draw()}));
    const nc=$('[data-newcar]',el);if(nc)nc.onclick=()=>{$('#s-go').scrollIntoView({behavior:'smooth',block:'center'})};
  };draw();
  (async()=>{try{if(C.hasSave()&&C.load()&&C.G.cid){const have=await CAR.get(C.G.cid);if(!have)await CAR.put(C.G)}}catch(e){}st.loc=await CAR.list();draw()})();
}
A.onTrack=n=>{if(A.S.music&&view!=='match')toast('♪ '+esc(n))};
function launch(){$('#start').hidden=true;$('.app').hidden=false;C.validateLineup();theme(C.userClub());A.init();setTimeout(()=>A.gate&&A.gate(),150);A.music(A.S.music);go('home');if(G().jobOffers)jobsModal();else{try{const s=JSON.parse(localStorage.getItem('c11-live')||'null');if(s&&s.cid===G().cid&&s.season===G().season&&s.date===G().date&&s.user===G().user)go('match')}catch(e){}}}
/* ---------- instalar app (PWA) ---------- */
let deferredInstall=null;const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
window.FUTBOL_INSTALL=!standalone();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;window.FUTBOL_INSTALL=true;$$('[data-install]').forEach(b=>b.hidden=false)});
window.addEventListener('appinstalled',()=>{window.FUTBOL_INSTALL=false;$$('[data-install]').forEach(b=>b.hidden=true);toast('📲 FUTBOL instalado! Abra pelo ícone na tela inicial.')});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
async function installApp(){if(deferredInstall){deferredInstall.prompt();const r=await deferredInstall.userChoice.catch(()=>null);deferredInstall=null;return}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);const android=/android/i.test(navigator.userAgent);
  openModal(`<h1 class="title" style="margin-bottom:10px">Instalar o FUTBOL</h1><div class="col" style="gap:10px">${ios?`<div class="step"><b>1</b><span>Toque em <b>Compartilhar</b> <span style="font-size:20px">⎋</span> na barra do Safari.</span></div><div class="step"><b>2</b><span>Role e toque em <b>Adicionar à Tela de Início</b>.</span></div><div class="step"><b>3</b><span>Confirme em <b>Adicionar</b>. O escudo do FUTBOL aparece junto com seus apps.</span></div><p class="dim" style="font-size:13px">No iPhone, a instalação só funciona pelo Safari.</p>`:android?`<div class="step"><b>1</b><span>Toque nos <b>três pontinhos ⋮</b> do Chrome.</span></div><div class="step"><b>2</b><span>Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).</span></div>`:`<div class="step"><b>1</b><span>No Chrome ou Edge, clique no ícone de <b>instalar ⊕</b> na barra de endereço.</span></div><div class="step"><b>2</b><span>Ou abra o menu <b>⋮</b> e escolha <b>Instalar FUTBOL</b>.</span></div>`}</div>`)}
async function boot(){applyPref();bind();if(/[?&]instalar/.test(location.search))setTimeout(()=>{try{installApp()}catch(e){}},1500);setTimeout(()=>{try{if(PREF.gfx!=='2d'&&typeof C11Render3D!=='undefined')C11Render3D.preload()}catch(e){}},1200);await ACC.init();if(C.hasSave()&&C.load()){if(ACC.st.user&&!C.G.slot){C.G.slot=Math.max(0,...ACC.st.careers.map(c=>c.slot))+1;C.save()}launch()}else startScreen()}
return {swapPlayers,boot,go,toast,err,theme,PREF,savePref,menuModal,crest,shirtSvg,shirtDefs,SHIRT,patCss,posTag,ovrTag,rtTag,fitBar,esc,surname,playerModal,recapModal,seasonModal,openModal,closeModal,renderTop,clubOf,get view(){return view},S,lum,mix,$,$$};
})();
