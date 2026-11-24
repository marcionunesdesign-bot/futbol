/* Camisa 11 — prancheta tática */
var TV=(function(){
'use strict';
const C=C11,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const S={hist:[],last:null,sel:1,tab:'a',tool:'move',rival:false,selArrow:null,rehearse:'ataque',root:null,inMatch:false};
const R$=q=>S.root.querySelector(q),R$$=q=>[...S.root.querySelectorAll(q)];
let drag=null,reh=null;
const PW=680,PH=1050;
const G=()=>C.G,P=id=>C.G.players[id];
const toXY=s=>[s.w*PW,(1-s.d)*PH];
const MENT=['Retranca','Defensiva','Equilibrada','Ofensiva','Tudo ao ataque'];
function nextOpp(){const um=C.nextUserMatch();if(!um)return null;return um.home===G().user?um.away:um.home}
function undo(){if(!S.hist.length){U.toast('Nada para desfazer.');return}const g=G();const prev=S.hist.pop();if(S.inMatch&&JSON.parse(prev).formation!==g.tactic.formation){U.toast('Com a bola rolando não dá para desfazer a troca de formação.');return}
  g.tactic=JSON.parse(prev);S.last=prev;S.undoing=true;C.validateLineup();C.save();U.toast('↶ Mudança desfeita.');render()}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='z'||e.shiftKey)return;if(!S.root||!S.root.isConnected||!S.root.offsetParent)return;if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;e.preventDefault();undo()});
function render(root,opts){
  if(root&&root.nodeType){S.root=root;S.inMatch=!!(opts&&opts.inMatch)}else if(!S.root||!S.root.isConnected||!S.inMatch){S.root=$('#v-tactics');S.inMatch=false}
  if(S.inMatch){const vt=$('#v-tactics');if(vt)vt.innerHTML=''}
  const g=G(),t=g.tactic,c=C.userClub();if(!S.inMatch)C.validateLineup();
  // histórico para desfazer (Ctrl+Z): guarda a tática anterior sempre que algo muda
  {const cur=JSON.stringify(g.tactic);if(S.last&&S.last!==cur&&!S.undoing){S.hist.push(S.last);if(S.hist.length>50)S.hist.shift()}S.last=cur;S.undoing=false}
  const saved=g.savedTac||[];
  const sl=t.slots[S.sel]||t.slots[0];const pSel=P(t.lineup[S.sel]);const fns=C.FN[C.fnGroup(sl.role)];
  const seg=(key,labels,offset=0)=>`<div class="seg">${labels.map((l,i)=>`<button data-tk="${key}" data-tv="${i+offset}" class="${(t[key]??0)===i+offset?'on':''}">${l}</button>`).join('')}</div>`;
  const opp=nextOpp();
  S.root.innerHTML=`<div class="tac${S.inMatch?' inmatch':''}">
  <div class="frame">
    <div class="tac-tools"><button class="btn ghost xs" data-undo ${S.hist.length?'':'disabled'} title="Desfazer (Ctrl+Z)">↶ Desfazer${S.hist.length?` <small>(${S.hist.length})</small>`:''}</button><button class="btn xs" data-savetac>💾 Salvar tática</button></div>
    ${saved.length?`<div class="tac-saved">${saved.map((x,i)=>`<span class="tsv"><button data-loadtac="${i}" title="Carregar">${U.esc(x.n)} <small>${x.t.formation}</small></button><button data-deltac="${i}" title="Apagar">✕</button></span>`).join('')}</div>`:''}
    <div class="h">Plano de jogo</div>
    <div class="ctl"><label>Formação</label><select id="t-form" ${S.inMatch?'disabled title="A formação não muda com a bola rolando"':''}>${C.FORMATIONS.map(f=>`<option ${f===t.formation?'selected':''}>${f}</option>`).join('')}</select></div>
    <div class="ctl"><label>Mentalidade · ${MENT[t.ment+2]}</label><input type="range" min="-2" max="2" step="1" value="${t.ment}" id="t-ment"></div>
    <div class="ctl"><label>Pressão sem a bola</label>${seg('press',['Baixa','Média','Alta'])}</div>
    <div class="ctl"><label>Linha defensiva</label>${seg('line',['Baixa','Média','Alta'])}</div>
    <div class="ctl"><label>Ritmo</label>${seg('tempo',['Lento','Normal','Rápido'])}</div>
    <div class="ctl"><label>Largura</label>${seg('width',['Estreita','Normal','Aberta'])}</div>
    <div class="ctl"><label>Passe</label>${seg('pass',['Curto','Misto','Direto'])}</div>
    <div class="h" style="margin-top:18px">Instrução individual</div>
    ${pSel?`<div class="row" style="margin-bottom:8px">${U.posTag(sl.role)}<b>${U.esc(pSel.n)}</b></div>`:''}
    <div class="fnopt">${fns.map(f=>`<button data-fn="${f.k}" class="${sl.fn===f.k?'on':''}"><b>${f.n}</b>${fnDesc(f)}</button>`).join('')}</div>
    ${sl.arrow?`<button class="btn ghost xs" style="margin-top:8px" data-delarrow="${S.sel}">Apagar a seta deste jogador</button>`:''}
    <div class="h" style="margin-top:18px">Batedores</div>
    ${[['pen','Pênaltis'],['fk','Faltas'],['ck','Escanteios']].map(([k,l])=>`<div class="ctl"><label>${l}</label><select data-taker="${k}"><option value="">Automático</option>${t.lineup.map(P).filter(p=>p&&p.p!=='GOL').map(p=>`<option value="${p.id}" ${(t.takers||{})[k]===p.id?'selected':''}>${U.esc(p.n)} · fin ${Math.round(p.t.fin)} · pas ${Math.round(p.t.pas)}</option>`).join('')}</select></div>`).join('')}
  </div>
  <div class="frame board-wrap">
    <div class="row wrap" style="gap:8px">
      <div class="seg" style="width:230px"><button data-tab="a" class="${S.tab==='a'?'on':''}">Com bola</button><button data-tab="df" class="${S.tab==='df'?'on':''}">Sem bola</button></div>
      <div class="seg" style="width:250px"><button data-tool="move" class="${S.tool==='move'?'on':''}">✥ Posicionar</button><button data-tool="arrow" class="${S.tool==='arrow'?'on':''}" ${S.tab!=='a'?'disabled':''}>➚ Setas</button></div>
      <button class="btn ${S.rival?'':'ghost'} xs" data-rival ${opp?'':'disabled'}>Ver rival</button>
      <div class="sp"></div>
      ${S.inMatch?'<button class="btn xs" data-closetac>✓ Voltar ao jogo</button>':`<select id="t-reh" style="min-height:32px">${[['saida','Saída de bola'],['ataque','Ataque'],['recomp','Recomposição']].map(([k,l])=>`<option value="${k}" ${S.rehearse===k?'selected':''}>${l}</option>`).join('')}</select>
      <button class="btn xs" data-rehearse ${opp?'':'disabled'}>▶ Ensaiar</button>`}
    </div>
    <div class="board" id="board">${boardSvg()}</div>
    <div class="row wrap dim" style="font-size:12.5px;gap:14px"><span>${S.tab==='a'?'Arraste a camisa para mudar a posição com a bola. Use “Setas” e arraste da camisa para desenhar a corrida (estilo CM).':'Posição sem a bola: onde cada um volta quando o time perde a posse.'}</span><span class="sp"></span><button class="btn ghost xs" data-resetshape>Restaurar formação</button><button class="btn ghost xs" data-cleararrows>Limpar setas</button></div>
  </div>
  ${S.inMatch?`<div class="frame"><div class="h">Com a bola rolando</div><p class="muted" style="font-size:14px">Tudo o que você muda aqui vale na hora: posições com e sem bola, setas de corrida, funções, mentalidade, pressão e linha.</p><p class="muted" style="font-size:14px">Para trocar jogadores, use a aba <b>Elenco</b> ao lado do campo.</p><button class="btn" style="width:100%" data-closetac>✓ Voltar ao jogo</button></div>`:`<div class="frame lineup">${lineupHtml()}</div>`}</div>`;
  bindBoard();
}
function fnDesc(f){const m={gk:'Fica na pequena área.',gkl:'Sai mais do gol e joga adiantado.',zag:'Defende a área e joga simples.',cons:'Sai jogando com passes para a frente.',cob:'Fica mais atrás, na sobra.',la:'Apoia o ataque com equilíbrio.',ldf:'Segura a posição na linha de defesa.',ala:'Vira ponta: sobe muito pelo corredor.',gp:'Fica na frente da zaga, protege.',cl:'Cobre o lado onde está a bola.',ca:'Chega na área quando o time ataca.',b2b:'Defende e ataca o campo todo.',arm:'Recua para receber e armar.',inf:'Entra na área por trás da defesa.',mei:'Organiza e dá o último passe.',enc:'Joga colado ao centroavante.',flu:'Se movimenta livre entre as linhas.',pa:'Abre o campo junto à linha lateral.',pi:'Corta para dentro e finaliza.',rec:'Volta para fechar a linha de meio.',ul:'Joga no limite do impedimento.',piv:'Recua para segurar e tabelar.',mov:'Sai da área e arrasta marcadores.'};return `<span class="dim" style="font-size:12.5px">${m[f.k]||''}</span>`}
function lineupHtml(){
  const t=G().tactic,c=C.userClub();
  const row=(id,kind,i,lab)=>{const p=P(id);if(!p)return '';const role=kind==='slot'?t.slots[i].role:p.p;const fit=p.fi;
    const pf=kind==='slot'?C.posFactor(p.p,role):1;
    return `<div class="li ${kind==='slot'&&i===S.sel?'sel':''}" draggable="true" data-pid="${p.id}" data-kind="${kind}" data-i="${i}"><span class="n">${lab}</span>${U.posTag(role)}<span class="nm">${U.esc(p.n)}<small>${p.p!==role?`<span style="color:${pf<.85?'var(--bad)':'var(--warn)'}">⚠ é ${p.p}, jogando de ${role} (nota ${C.ovr(p)} → ${Math.round(C.ratingIn(p,role))})</span>`:C.moodText(p)}${p.inj?' · lesionado':''}</small></span>${U.fitBar(fit)}${U.ovrTag(Math.round(C.ratingIn(p,role)))}</div>`};
  const out=c.players.filter(id=>!t.lineup.includes(id)&&!t.subs.includes(id));
  return `<div class="h">Titulares <small>${t.formation} · força ${C.teamStrength(c).toFixed(1)}</small></div><p class="li-leg">Sigla = posição no time · barra = condição física · número = nota <b>nessa posição</b> (cai quando o jogador está improvisado)</p>${t.lineup.map((id,i)=>row(id,'slot',i,i===0?1:i+1)).join('')}
  <div class="h" style="margin-top:14px">Banco <small>arraste sobre a camisa ou o titular</small></div>${t.subs.map((id,i)=>row(id,'sub',i,'R')).join('')}
  <div class="h" style="margin-top:14px">Não relacionados</div>${out.map((id,i)=>row(id,'out',i,'–')).join('')||'<p class="dim">—</p>'}
  <button class="btn ghost sm" style="width:100%;margin-top:12px" data-autolineup>Escalar os melhores</button>`;
}
function boardSvg(){
  const g=G(),t=g.tactic,c=C.userClub();const kit=c.kit;const gkKit=['#f5c518','#1d1d1d','#1d1d1d','liso'];
  const lines=`<rect x="0" y="0" width="${PW}" height="${PH}" fill="#2c6a33"/>${[...Array(14)].map((_,i)=>i%2?'':`<rect x="0" y="${i*PH/14}" width="${PW}" height="${PH/14}" fill="#317539"/>`).join('')}
   <g fill="none" stroke="#eef6ea" stroke-opacity=".8" stroke-width="3"><rect x="0" y="0" width="${PW}" height="${PH}"/><line x1="0" y1="${PH/2}" x2="${PW}" y2="${PH/2}"/><circle cx="${PW/2}" cy="${PH/2}" r="91.5"/>
   <rect x="${PW/2-201.6}" y="0" width="403.2" height="165"/><rect x="${PW/2-91.6}" y="0" width="183.2" height="55"/><rect x="${PW/2-201.6}" y="${PH-165}" width="403.2" height="165"/><rect x="${PW/2-91.6}" y="${PH-55}" width="183.2" height="55"/>
   <path d="M${PW/2-73} 165 A91.5 91.5 0 0 0 ${PW/2+73} 165"/><path d="M${PW/2-73} ${PH-165} A91.5 91.5 0 0 1 ${PW/2+73} ${PH-165}"/></g>
   <rect x="${PW/2-36.6}" y="-14" width="73.2" height="14" fill="none" stroke="#fff" stroke-width="4"/><rect x="${PW/2-36.6}" y="${PH}" width="73.2" height="14" fill="none" stroke="#fff" stroke-width="4"/>
   <text x="${PW/2}" y="-24" text-anchor="middle" fill="#ffffff80" font-family="Barlow Condensed" font-weight="700" font-size="20" letter-spacing="3">ATAQUE ▲</text>`;
  let rival='';const opp=nextOpp();
  if(S.rival&&opp){const oc=G().clubs[opp];const os=C.buildSlots(oc.formation);const ln=C.bestLineup(oc,os).line;const k=oc.kit;
    rival=os.map((s,i)=>{const sh=S.tab==='a'?s.df:s.a;const x=(1-sh.w)*PW,y=sh.d*PH;const p=P(ln[i]);return `<g opacity=".55" transform="translate(${x},${y})"><circle r="22" fill="${k[0]}" stroke="${k[1]}" stroke-width="4"/><text y="7" text-anchor="middle" font-family="Barlow Condensed" font-weight="800" font-size="21" fill="${U.lum(k[0])>.55?'#111':'#fff'}">${i===0?1:i+1}</text>${p?`<text y="40" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="15" fill="#fff" stroke="#0009" stroke-width="3" paint-order="stroke">${U.esc(U.surname(p.n))} ${C.ovr(p)}</text>`:''}</g>`}).join('')}
  const arrows=S.tab==='a'?t.slots.map((s,i)=>{if(!s.arrow)return '';const [x1,y1]=toXY(s.a),[x2,y2]=toXY(s.arrow);return `<g class="arrow ${S.selArrow===i?'sel':''}" data-ai="${i}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffe46b" stroke-width="5" stroke-dasharray="14 9" marker-end="url(#ah)" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22"/><circle class="ahd" data-ah="${i}" cx="${x2}" cy="${y2}" r="13" fill="#ffe46b33" stroke="#ffe46b" stroke-width="2"/></g>`}).join(''):'';
  const shirts=t.slots.map((s,i)=>{const p=P(t.lineup[i]);const [x,y]=toXY(s[S.tab]);const isGk=s.role==='GOL';const fn=C.fnOf(s.role,s.fn);const ink=U.lum((isGk?gkKit:kit)[0])>.55?'#111':'#fff';
    const fit=p?p.fi:100;const nm=p?U.surname(p.n).toUpperCase():'—';
    return `<g class="shirt ${S.sel===i?'sel':''}" data-si="${i}" transform="translate(${x},${y})">
      ${S.sel===i?'<circle r="50" fill="#fff36b22" stroke="#fff36b" stroke-width="3"/>':''}
      <g transform="translate(-40,-50) scale(.8)"><use href="#${isGk?'tkG':'tkK'}b"/></g>
      <text y="4" text-anchor="middle" font-family="Barlow Condensed,Impact" font-weight="800" font-size="34" fill="${ink}" stroke="${ink==='#fff'?'#0009':'#fff9'}" stroke-width="3" paint-order="stroke">${i===0?1:i+1}</text>
      <rect x="-50" y="33" width="100" height="22" rx="5" fill="#0a0c0dd9"/><text class="lbl" y="50" text-anchor="middle" style="font-size:17px;stroke-width:0">${U.esc(nm.slice(0,11))}</text>
      <rect x="-26" y="57" width="52" height="5" rx="2.5" fill="#ffffff26"/><rect x="-26" y="57" width="${52*fit/100}" height="5" rx="2.5" fill="${fit<60?'#ff4d4f':fit<80?'#ffb340':'#34d17b'}"/>
      <rect x="-38" y="65" width="76" height="17" rx="4" fill="var(--acc)"/><text class="fnb" y="78" text-anchor="middle" fill="var(--accink)">${fn.s}</text></g>`}).join('');
  return `<svg id="tsvg" viewBox="-30 -50 ${PW+60} ${PH+110}"><defs>${U.shirtDefs('tkK',kit)}${U.shirtDefs('tkG',gkKit)}<marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#ffe46b"/></marker></defs>
   ${lines}${rival}<g id="arrows">${arrows}</g><line id="tmparrow" stroke="#ffe46b" stroke-width="5" stroke-dasharray="14 9" marker-end="url(#ah)" visibility="hidden"/>${shirts}</svg>`;
}
function svgPt(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const r=pt.matrixTransform(svg.getScreenCTM().inverse());return [r.x,r.y]}
function toShape(x,y,gk){const d=Math.max(gk?.01:.04,Math.min(gk?.12:.97,1-y/PH)),w=Math.max(.03,Math.min(.97,x/PW));return {d:+d.toFixed(3),w:+w.toFixed(3)}}
function bindBoard(){
  const svg=R$('#tsvg');if(!svg)return;const t=G().tactic;
  // celular: só trava a rolagem quando o dedo pega uma camisa/seta; no resto do campo a tela rola normal
  svg.addEventListener('touchstart',e=>{if(e.target.closest('[data-ah],.shirt,.arrow'))e.preventDefault()},{passive:false});
  svg.addEventListener('pointerdown',e=>{const ah=e.target.closest('[data-ah]');const sh=e.target.closest('.shirt');const ar=e.target.closest('.arrow');
    if(ah){drag={kind:'arrowEdit',i:+ah.dataset.ah};S.selArrow=+ah.dataset.ah;svg.setPointerCapture(e.pointerId);return}
    if(sh){const i=+sh.dataset.si;const changed=S.sel!==i;S.sel=i;S.selArrow=null;
      if(S.tool==='arrow'&&S.tab==='a'){drag={kind:'arrowNew',i};}else drag={kind:'move',i,moved:false};
      svg.setPointerCapture(e.pointerId);if(changed){$$('.shirt',svg).forEach(g=>g.classList.toggle('sel',+g.dataset.si===i));}return}
    if(ar){S.selArrow=+ar.dataset.ai;S.sel=+ar.dataset.ai;render();return}
  });
  svg.addEventListener('pointermove',e=>{if(!drag)return;const [x,y]=svgPt(svg,e);const s=t.slots[drag.i];
    if(drag.kind==='move'){drag.moved=true;const g=svg.querySelector(`.shirt[data-si="${drag.i}"]`);g.setAttribute('transform',`translate(${Math.max(0,Math.min(PW,x))},${Math.max(0,Math.min(PH,y))})`)}
    else{const [x1,y1]=drag.kind==='arrowNew'?toXY(s.a):toXY(s.a);const l=R$('#tmparrow');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x);l.setAttribute('y2',y);l.setAttribute('visibility','visible');
      if(drag.kind==='arrowEdit'){const gA=svg.querySelector(`.arrow[data-ai="${drag.i}"]`);if(gA)gA.style.opacity=.25}}});
  const up=e=>{if(!drag)return;const [x,y]=svgPt(svg,e);const s=t.slots[drag.i];const gk=s.role==='GOL';
    if(drag.kind==='move'){if(drag.moved){s[S.tab]=toShape(x,y,gk);if(S.tab==='a'&&s.arrow){/* mantém a seta relativa */}C.save()}drag=null;render();return}
    const [x1,y1]=toXY(s.a);const len=Math.hypot(x-x1,y-y1);
    if(!gk){if(len<28){if(drag.kind==='arrowEdit')s.arrow=null}else s.arrow=toShape(x,y,false)}
    drag=null;C.save();render()};
  svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',()=>{drag=null;render()});
  // arrastar da lista para a camisa
  svg.addEventListener('dragover',e=>e.preventDefault());
  svg.addEventListener('drop',e=>{e.preventDefault();const pid=+e.dataTransfer.getData('text/pid');if(!pid)return;const [x,y]=svgPt(svg,e);
    let bi=-1,bd=1e9;t.slots.forEach((s,i)=>{const [sx,sy]=toXY(s[S.tab]);const d=Math.hypot(sx-x,sy-y);if(d<bd){bd=d;bi=i}});if(bd<90){place(pid,{kind:'slot',i:bi});S.sel=bi;C.save();render()}});
  R$$('.lineup .li').forEach(el=>{
    el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/pid',el.dataset.pid);e.dataTransfer.effectAllowed='move'});
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('drop')});el.addEventListener('dragleave',()=>el.classList.remove('drop'));
    el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('drop');const pid=+e.dataTransfer.getData('text/pid');if(!pid||pid==+el.dataset.pid)return;place(pid,{kind:el.dataset.kind,i:+el.dataset.i});C.save();render()});
    el.addEventListener('click',e=>{const k=el.dataset.kind,i=+el.dataset.i,pid=+el.dataset.pid;
      if(k==='slot'){if(S.sel===i){const t2=G().tactic;U.S.navList=[...t2.lineup,...t2.subs,...C.userClub().players.filter(x=>!t2.lineup.includes(x)&&!t2.subs.includes(x))];U.playerModal(pid);return}S.sel=i;render();return}
      if(S.sel!=null){place(pid,{kind:'slot',i:S.sel});C.save();render()}});
  });
}
function where(pid){const t=G().tactic;let i=t.lineup.indexOf(pid);if(i>=0)return {kind:'slot',i};i=t.subs.indexOf(pid);if(i>=0)return {kind:'sub',i};return {kind:'out'}}
function place(pid,target){const t=G().tactic;const from=where(pid);
  const occ=target.kind==='slot'?t.lineup[target.i]:target.kind==='sub'?t.subs[target.i]:null;
  const setAt=(loc,id)=>{if(loc.kind==='slot')t.lineup[loc.i]=id;else if(loc.kind==='sub'){if(id)t.subs[loc.i]=id;else t.subs.splice(loc.i,1)}};
  if(P(pid).inj&&target.kind!=='out'){U.toast('⚠️ Jogador lesionado.');return}
  if(from.kind==='out'){if(target.kind==='out')return;setAt(target,pid);return}
  if(target.kind==='out'){if(from.kind==='slot'){U.toast('Arraste um reserva para o lugar do titular.');return}t.subs.splice(from.i,1);return}
  setAt(target,pid);setAt(from,occ);
}
function bindControls(){
  document.addEventListener('click',U.err(e=>{if(!S.root||!S.root.isConnected||!S.root.contains(e.target))return;if(e.target.closest('[data-closetac]')){U.closeModal();S.inMatch=false;S.root=null;return}const b=e.target.closest('[data-tk],[data-fn],[data-tab],[data-tool],[data-rival],[data-delarrow],[data-cleararrows],[data-resetshape],[data-autolineup],[data-rehearse],[data-undo],[data-savetac],[data-loadtac],[data-deltac]');if(!b)return;
    const t=G().tactic,d=b.dataset;
    if(d.tk){t[d.tk]=+d.tv;C.save();render();return}
    if('undo' in d){undo();return}
    if('savetac' in d){const g=G();g.savedTac=g.savedTac||[];const n=(prompt('Nome desta tática (ex.: "Contra-ataque 4-3-3")',`${t.formation} ${['','defensiva','equilibrada','ofensiva'][Math.sign(t.ment)+2]||''}`.trim())||'').trim();if(!n)return;
      const i=g.savedTac.findIndex(x=>x.n===n);const item={n,t:JSON.parse(JSON.stringify(t))};if(i>=0)g.savedTac[i]=item;else{g.savedTac.push(item);if(g.savedTac.length>8)g.savedTac.shift()}C.save();U.toast('💾 Tática "'+U.esc(n)+'" salva.');render();return}
    if(d.loadtac!=null){const g=G();const x=(g.savedTac||[])[+d.loadtac];if(!x)return;if(S.inMatch&&x.t.formation!==t.formation){U.toast('Com a bola rolando não dá para trocar a formação.');return}
      g.tactic=JSON.parse(JSON.stringify(x.t));C.validateLineup();C.save();U.toast('📋 Tática "'+U.esc(x.n)+'" carregada. Desfaça com Ctrl+Z.');render();return}
    if(d.deltac!=null){const g=G();const x=(g.savedTac||[])[+d.deltac];if(!x||!confirm('Apagar a tática "'+x.n+'"?'))return;g.savedTac.splice(+d.deltac,1);C.save();render();return}
    if(d.fn){t.slots[S.sel].fn=d.fn;C.save();render();return}
    if(d.tab){S.tab=d.tab;if(S.tab!=='a')S.tool='move';render();return}
    if(d.tool){S.tool=d.tool;render();return}
    if('rival' in d){S.rival=!S.rival;render();return}
    if(d.delarrow){t.slots[+d.delarrow].arrow=null;S.selArrow=null;C.save();render();return}
    if('cleararrows' in d){t.slots.forEach(s=>s.arrow=null);C.save();render();return}
    if('resetshape' in d){const fresh=C.buildSlots(t.formation);t.slots.forEach((s,i)=>{s.a=fresh[i].a;s.df=fresh[i].df});C.save();render();return}
    if('autolineup' in d){C.autoLineup();C.save();render();return}
    if('rehearse' in d){rehearse();return}
  }));
  document.addEventListener('change',U.err(e=>{if(!S.root||!S.root.isConnected||!S.root.contains(e.target))return;const t=G().tactic;
    if(e.target.id==='t-form'){C.setFormation(e.target.value);S.sel=1;C.save();U.toast('Nova formação: o entrosamento caiu. Treino tático ajuda a recuperar.');render()}
    if(e.target.id==='t-ment'){t.ment=+e.target.value;C.save();render()}
    if(e.target.id==='t-reh'){S.rehearse=e.target.value}
    if(e.target.dataset.taker){t.takers=t.takers||{};t.takers[e.target.dataset.taker]=+e.target.value||null;C.save();U.toast('Batedor definido.')}}));
}
/* ensaio: alguns segundos do motor de jogo com as instruções atuais */
function rehearse(){
  const opp=nextOpp();if(!opp)return;if(reh){cancelAnimationFrame(reh.raf);reh.cv.remove();reh=null}
  const home=C.userTeam(),away=C.aiTeam(opp);
  const m=new C11Match.Match(home,away,{matchSec:5400,userSide:0});m.dead=0;m.phase='play';
  const T0=m.T[0],T1=m.T[1];const kind=S.rehearse;
  let car;
  if(kind==='saida'){car=m.gk(T0);m.ball.x=6;m.ball.y=34}
  else if(kind==='ataque'){car=m.active(T0).filter(x=>['MC','MEI','VOL'].includes(T0.slots[x.si].role)).sort((a,b)=>b.a.pas-a.a.pas)[0]||m.active(T0)[5];m.ball.x=60;m.ball.y=34}
  else{car=m.active(T1).filter(x=>['MC','MEI','VOL'].includes(T1.slots[x.si].role))[0]||m.active(T1)[5];m.ball.x=46;m.ball.y=30}
  car.x=m.ball.x;car.y=m.ball.y;m.give(car,true);car.decide=.7;
  m.updateTargets(0,false);for(const T of m.T)for(const x of m.active(T)){if(x!==car){x.x=x.tx;x.y=x.ty}}
  const box=R$('#board');const cv=document.createElement('canvas');box.appendChild(cv);
  const rd=new C11Render.Renderer(cv,m,{mode:'top',vertical:true,userSide:0,arrows:true});
  let last=performance.now(),el=0;const lab=document.createElement('div');lab.className='replay';lab.textContent='ENSAIO · '+({saida:'SAÍDA DE BOLA',ataque:'ATAQUE',recomp:'RECOMPOSIÇÃO'})[kind];box.appendChild(lab);
  reh={cv,m};const tick=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;el+=dt;let n=Math.round(dt*30);for(let i=0;i<n;i++)m.step(1/30);rd.draw();
    if(el<9&&m.phase==='play'&&m.dead<=0||el<9&&m.dead>0&&el<2){reh.raf=requestAnimationFrame(tick)}else{cv.style.transition='opacity .5s';cv.style.opacity=0;lab.remove();setTimeout(()=>{cv.remove();reh=null},500)}};
  reh.raf=requestAnimationFrame(tick);
  cv.onclick=()=>{el=99};
}
bindControls();
return {render,S};
})();
