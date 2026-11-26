/* Camisa 11 — tela da partida */
var MV=(function(){
'use strict';
const C=C11,A=C11Audio,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const G=()=>C.G,P=id=>C.G.players[id],esc=s=>U.esc(s);
const st=window.__MVst={m:null,rd:null,um:null,us:0,live:false,paused:true,speed:1,mode:'full',cam:'tv',arrows:false,tab:'feed',frames:[],replay:null,tail:0,acc:0,raf:0,last:0,lastSnap:-1,done:false,pens:null,ffBlock:false};
function opp(){return st.um.home===G().user?st.um.away:st.um.home}
/* ---------- partida salva: sair do app e voltar continua de onde parou ---------- */
const SNAPKEY='c11-live';let lastSnapT=0;
function snapEnc(root){const g=G();const ext=new Map();for(const id in g.players)ext.set(g.players[id],{$p:id});for(const k in g.clubs)ext.set(g.clubs[k],{$c:k});if(g.tactic){ext.set(g.tactic,{$t:1});if(g.tactic.slots)ext.set(g.tactic.slots,{$ts:1})}
  const ids=new Map(),objs=[];let bad=false;
  const walk=v=>{if(typeof v==='function'){bad=true;return null}if(v===null||typeof v!=='object'){if(typeof v==='number'&&!isFinite(v))return {$n:String(v)};return v}
    if(ext.has(v))return ext.get(v);if(ids.has(v))return {$r:ids.get(v)};if(v instanceof Set||v instanceof Map){bad=true;return null}
    const id=objs.length;ids.set(v,id);const out=Array.isArray(v)?[]:{};objs.push(out);
    if(Array.isArray(v))v.forEach((x,i)=>out[i]=walk(x));else for(const k of Object.keys(v)){if(k==='opts'||k==='onEvent')continue;const x=v[k];if(x===undefined)continue;if(typeof x==='function'){bad=true;continue}out[k]=walk(x)}
    return {$r:id}};
  const r=walk(root);return bad?null:{r,objs}}
function snapDec(s){const g=G();const objs=s.objs,done=[];
  const res=v=>{if(v===null||typeof v!=='object')return v;if(!Array.isArray(v)){if('$r' in v)return get(v.$r);if('$p' in v)return g.players[v.$p];if('$c' in v)return g.clubs[v.$c];if('$t' in v)return g.tactic;if('$ts' in v)return g.tactic.slots;if('$n' in v)return Number(v.$n)}return v};
  const get=i=>{if(done[i])return done[i];const o=objs[i];const out=Array.isArray(o)?[]:{};done[i]=out;if(Array.isArray(o))o.forEach((x,j)=>out[j]=res(x));else for(const k in o)out[k]=res(o[k]);return out};
  return res(s.r)}
function snapSave(force){const m=st.m;if(!m||!st.um||st.um.online)return;const now=performance.now();if(!force&&now-lastSnapT<2500)return;
  if(m.deadFn||typeof m.setup==='function')return;lastSnapT=now;
  try{const e=snapEnc(m);if(!e)return;const g=G();localStorage.setItem(SNAPKEY,JSON.stringify({v:1,cid:g.cid,season:g.season,date:g.date,user:g.user,home:st.um.home,away:st.um.away,us:st.us,mode:st.mode,speed:st.speed,pens:st.pens,feed:(st.feedHtml||'').slice(0,20000),m:e}))}catch(err){}}
function snapClear(){try{localStorage.removeItem(SNAPKEY)}catch(e){}}
function snapLoad(um){let s;try{s=JSON.parse(localStorage.getItem(SNAPKEY)||'null')}catch(e){return false}if(!s||s.v!==1)return false;const g=G();
  if(s.cid!==g.cid||s.season!==g.season||s.date!==g.date||s.user!==g.user||s.home!==um.home||s.away!==um.away){snapClear();return false}
  try{const m=snapDec(s.m);Object.setPrototypeOf(m,C11Match.Match.prototype);m.opts={userSide:s.us,sound:ballSfx};m.onEvent=onEvent;
    coReset();st.m=m;st.um=um;st.us=s.us;st.mode=s.mode||'full';st.speed=s.speed||1;st.pens=s.pens||null;st.feedHtml=s.feed||'';st.frames=[];st.replay=null;st.tail=0;st.cam=U.PREF.cam||st.cam;
    st.done=false;st.live=true;st.paused=true;return true}catch(e){snapClear();return false}}
addEventListener('pagehide',()=>snapSave(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)snapSave(true)});
/* ---------- auxiliar técnico: sugestões de substituição e de tática ---------- */
function subAdvice(){const m=st.m;if(!m)return {subs:[],tac:null};const T=m.T[st.us],O=m.T[1-st.us];const min=m.minute;const out=[];
  if(T.subsLeft>0){const used=new Set();
    const cands=m.active(T).map(x=>{const role=T.slots[x.si].role;let why=null,score=0;
      if(x.stam<50){why=`cansado (${Math.round(x.stam)}%)`;score=60-x.stam}
      else if(min>=58&&x.r<5.7){why=`mal no jogo (nota ${x.r.toFixed(1)})`;score=(6-x.r)*12}
      else if(min>=55&&x.yc&&['ZAG','VOL','LD','LE'].includes(role)){why='pendurado com amarelo';score=14}
      else if(min>=65&&x.stam<62){why=`perdendo fôlego (${Math.round(x.stam)}%)`;score=(66-x.stam)*.8}
      return {x,role,why,score}}).filter(o=>o.why&&o.role!=='GOL').sort((a,b)=>b.score-a.score);
    for(const o of cands){const g=C.GROUP[o.role];let best=null,bv=-1;
      for(const p of T.bench){if(used.has(p.id)||p.inj)continue;const pg=C.GROUP[p.p];const v=C.ratingIn(p,o.role)*(pg===g?1:.86)*(.7+.3*p.fi/100);if(v>bv){bv=v;best=p}}
      if(best&&bv>=Math.min(o.x.r*9,C.ratingIn(o.x.p,o.role))*.9){used.add(best.id);const oO=Math.round(C.ratingIn(o.x.p,o.role)),iO=Math.round(C.ratingIn(best,o.role)),oF=Math.round(o.x.stam),iF=Math.round(best.fi);const gain=Math.round(iO*(.62+.38*iF/100)-oO*(.62+.38*oF/100));
        out.push({outId:o.x.id,inId:best.id,outN:U.surname(o.x.p.n),inN:U.surname(best.n),inPos:best.p,outPos:o.x.p.p,why:o.why,role:o.role,oO,iO,oF,iF,oR:o.x.r,gain})}
      if(out.length>=3)break}}
  let tac=null;const diff=T.score-O.score;const t=T.tac;
  if(min>=65&&diff<0&&t.ment<1)tac={k:'ment',v:Math.min(2,t.ment+(diff<=-2?2:1)),txt:diff<=-2?'Perdendo por 2: tudo ao ataque':'Atrás no placar: mentalidade ofensiva'};
  else if(min>=78&&diff===1&&t.ment>-1)tac={k:'ment',v:-1,txt:'Segure o resultado: mentalidade defensiva'};
  else if(min>=70&&diff===0&&t.ment<0&&T.st.xg>O.st.xg)tac={k:'ment',v:1,txt:'Você cria mais: arrisque para vencer'};
  return {subs:out,tac}}
const fisC=f=>f<50?'var(--bad)':f<70?'var(--warn)':'var(--good,#3ecf6e)';
function subCard(s,compact){const g=s.gain;const verd=g>=4?['vale muito a pena','good']:g>=1?['vale a pena','good']:g>=-1?['troca equilibrada','warn']:['não compensa','bad'];
  const pl=(lab,n,pos,ovr,fis,extra)=>`<div class="sc-p"><span class="sc-l">${lab}</span><b>${esc(n)}</b><span class="sc-m">${U.posTag(pos)} <span title="Força nessa posição">⭐ ${ovr}</span> <span style="color:${fisC(fis)}" title="Condição física">💪 ${fis}%</span>${extra||''}</span></div>`;
  return `<div class="sadv-r sc"><div class="sc-row">${pl('SAI',s.outN,s.outPos,s.oO,s.oF,` <span title="Nota no jogo">📝 ${s.oR.toFixed(1)}</span>`)}<span class="sc-x">⇄</span>${pl('ENTRA',s.inN,s.inPos,s.iO,s.iF,s.inPos!==s.role?` <span class="chip warn" title="Vai jogar fora da posição">de ${s.role}</span>`:'')}</div>
    <div class="sc-f"><small>${esc(s.why)} · <b class="sc-v ${verd[1]}">${g>0?'+':''}${g} ${verd[0]}</b></small><button class="btn xs" data-dosub="${s.outId}:${s.inId}">Trocar</button></div></div>`}
function adviceHtml(){const a=subAdvice();if(!a.subs.length&&!a.tac)return '';
  return `<div class="sadv"><div class="h" style="margin-bottom:6px">💡 Sugestões do auxiliar</div>${a.subs.map(s=>subCard(s)).join('')}
   ${a.tac?`<div class="sadv-r"><span>🧠 <b>${esc(a.tac.txt)}</b></span><button class="btn xs" data-dotac="${a.tac.k}:${a.tac.v}">Aplicar</button></div>`:''}</div>`}
function bindAdvice(root){$$('[data-dosub]',root).forEach(b=>b.onclick=U.err(()=>{const [o,i]=b.dataset.dosub.split(':').map(Number);const T=st.m.T[st.us];const on=T.mps.find(x=>x.id===o),inn=T.bench.find(p=>p.id===i);st.m.sub(st.us,o,i);st.rd.buildInfo();A.sub&&A.sub();U.toast(`🔁 Sai ${esc(U.surname(on.p.n))} (${T.slots[on.si].role}) · entra ${esc(U.surname(inn.n))} (${inn.p}) jogando de ${T.slots[on.si].role}`);hideTip();panel()}));
  $$('[data-dotac]',root).forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.dotac.split(':');st.m.T[st.us].tac[k]=+v;C.save();U.toast('Instrução enviada ao time.');hideTip();panel()})}
/* ---------- assistente tático: lê o jogo, sugere decisões e mede se a mudança está dando certo ---------- */
const CO={hist:[],lastMin:-1,key:null,tac:null,changes:[],queue:[],cur:null,cool:{},nextRead:0,hideAt:0,assist:null};
const CO_L={ment:['Retranca','Defensiva','Equilibrada','Ofensiva','Tudo ao ataque'],press:['Pressão baixa','Pressão média','Pressão alta'],line:['Linha baixa','Linha média','Linha alta'],tempo:['Ritmo lento','Ritmo normal','Ritmo rápido'],width:['Time estreito','Largura normal','Time aberto'],pass:['Passe curto','Passe misto','Passe direto']};
const CO_K=['ment','press','line','tempo','width','pass'];
const coLab=(k,v)=>k==='ment'?'Mentalidade '+CO_L.ment[v+2].toLowerCase():CO_L[k][v];
function coReset(){CO.hist=[];CO.lastMin=-1;CO.key=null;CO.tac=null;CO.changes=[];CO.queue=[];CO.cur=null;CO.cool={};CO.nextRead=0;CO.hideAt=0;CO.assist=null;const el=$('#acoach');if(el){el.hidden=true;el.innerHTML=''}}
function coSnap(){const m=st.m,T=m.T[st.us],O=m.T[1-st.us];const pick=S=>({sh:S.st.sh,sot:S.st.sot,xg:S.st.xg,pa:S.st.pa,pc:S.st.pc,tk:S.st.tk,pos:S.st.pos,g:S.score});
  const on=m.active(T);return {min:m.minute,my:pick(T),op:pick(O),stam:on.length?on.reduce((a,x)=>a+x.stam,0)/on.length:100}}
function coAt(min){let s=CO.hist[0];for(const h of CO.hist){if(h.min<=min)s=h;else break}return s}
function coWin(a,b){/* números entre duas leituras, já em "a cada 10 minutos" */if(!a||!b)return null;const dm=Math.max(1,b.min-a.min);const d=k=>({my:b.my[k]-a.my[k],op:b.op[k]-a.op[k]});
  const pos=d('pos'),sh=d('sh'),xg=d('xg'),pa=d('pa'),pc=d('pc'),tk=d('tk'),g=d('g');const r=v=>v*10/dm;
  return {dm,pos:pos.my+pos.op>0?Math.round(pos.my/(pos.my+pos.op)*100):50,mySh:r(sh.my),opSh:r(sh.op),myXg:r(xg.my),opXg:r(xg.op),acc:pa.my>=15?Math.round(pc.my/pa.my*100):null,tk:r(tk.my),gf:g.my,ga:g.op,rawOpSh:sh.op,rawMySh:sh.my,rawOpXg:xg.op}}
const coKey=t=>CO_K.map(k=>t[k]).join(',');
function coTick(){const m=st.m;if(!m||st.done||st.skipping||!st.live)return;const T=m.T[st.us];
  if(m.minute!==CO.lastMin&&m.phase==='play'){CO.lastMin=m.minute;CO.hist.push(coSnap());if(CO.hist.length>140)CO.hist.shift();
    const key=coKey(T.tac);if(CO.key!=null&&key!==CO.key)coChanged(CO.tac,{...T.tac});CO.key=key;CO.tac={...T.tac};
    for(const ch of CO.changes)if(!ch.done&&m.minute-ch.min>=8){ch.done=1;ch.res=coEval(ch);CO.queue.push({k:'eval',ch})}
    if(m.minute>=CO.nextRead&&!CO.queue.some(q=>q.k==='tac')){const s=coRead();if(s){CO.queue.push({k:'tac',s});CO.cool[s.id]=m.minute;CO.nextRead=m.minute+6}}}
  coShow()}
function coChanged(from,to){const m=st.m;const diff=CO_K.filter(k=>from[k]!==to[k]);if(!diff.length)return;
  /* várias mudanças seguidas contam como uma decisão só */
  const last=CO.changes[CO.changes.length-1];if(last&&!last.done&&m.minute-last.min<=2){last.to={...to};last.diff=CO_K.filter(k=>last.from[k]!==to[k]);if(!last.diff.length)CO.changes.pop();coTrack();return}
  const prevMin=Math.max(0,...CO.changes.map(c=>c.min));const base=Math.max(prevMin,m.minute-10,CO.hist[0]?CO.hist[0].min:0);
  CO.changes.push({min:m.minute,from:{...from},to:{...to},diff,base,assist:CO.assist&&m.minute-CO.assist.min<=2?CO.assist.txt:null});CO.assist=null;coTrack()}
function coAim(ch){const d=k=>(ch.to[k]-ch.from[k]);const atk=d('ment')+.5*Math.sign(d('pass'))+.5*Math.sign(d('tempo'))+.5*Math.sign(d('line'))+.3*Math.sign(d('width'));
  if(atk>=.45)return 'atk';if(atk<=-.45)return 'def';if(d('press')>0)return 'press';if(d('press')<0)return 'poupar';return d('pass')<0||d('tempo')<0?'controle':'atk'}
function coEval(ch){const m=st.m;const b0=coAt(ch.base),b1=coAt(ch.min),a1=CO.hist[CO.hist.length-1];
  let B=coWin(b0,b1);const A2=coWin(b1,a1);if(!B||B.dm<3)B=coWin(CO.hist[0],b1);if(!A2)return null;
  const aim=coAim(ch);const L=[];const f1=v=>v.toFixed(1).replace('.',','),pct=v=>v+'%';
  const line=(lab,bv,av,fmt,better)=>{const up=av>bv;const same=Math.abs(av-bv)<(fmt===pct?3:.6);L.push({lab,b:fmt(bv),a:fmt(av),dir:same?0:up?1:-1,good:same?0:(up===better?1:-1)})};
  let score=0;
  if(aim==='atk'){line('Suas finalizações (a cada 10 min)',B?B.mySh:0,A2.mySh,f1,true);line('Suas chances (xG a cada 10 min)',B?+B.myXg.toFixed(2):0,+A2.myXg.toFixed(2),v=>v.toFixed(2).replace('.',','),true);
    score+=(A2.myXg-(B?B.myXg:0))*6+(A2.mySh-(B?B.mySh:0))*.35+A2.gf*1.4;const risk=A2.opXg-(B?B.opXg:0);if(risk>.25){line('Finalizações do rival',B?B.opSh:0,A2.opSh,f1,false);score-=risk*3}score-=A2.ga*1.1}
  else if(aim==='def'){line('Finalizações do rival (a cada 10 min)',B?B.opSh:0,A2.opSh,f1,false);line('Chances do rival (xG a cada 10 min)',B?+B.opXg.toFixed(2):0,+A2.opXg.toFixed(2),v=>v.toFixed(2).replace('.',','),false);
    score+=((B?B.opXg:0)-A2.opXg)*6+((B?B.opSh:0)-A2.opSh)*.35-A2.ga*1.6+(A2.ga===0&&B&&B.ga>0?.8:0)}
  else if(aim==='press'||aim==='controle'){line('Sua posse de bola',B?B.pos:50,A2.pos,pct,true);if(aim==='press')line('Desarmes (a cada 10 min)',B?B.tk:0,A2.tk,f1,true);else if(A2.acc!=null)line('Acerto de passe',B&&B.acc!=null?B.acc:A2.acc,A2.acc,pct,true);
    score+=(A2.pos-(B?B.pos:50))*.08+(aim==='press'?(A2.tk-(B?B.tk:0))*.25:0)+((B?B.opSh:0)-A2.opSh)*.2-A2.ga*1.1+A2.gf*.8}
  else{line('Finalizações do rival (a cada 10 min)',B?B.opSh:0,A2.opSh,f1,false);const s0=b1?b1.stam:100,s1=a1.stam;L.push({lab:'Fôlego médio do time',b:Math.round(s0)+'%',a:Math.round(s1)+'%',dir:s1<s0?-1:1,good:0});score+=((B?B.opSh:0)-A2.opSh)*.3-A2.ga*1.2+.4}
  if(A2.gf)L.push({lab:'Gols seus depois da mudança',b:'',a:String(A2.gf),dir:1,good:1});if(A2.ga)L.push({lab:'Gols sofridos depois da mudança',b:'',a:String(A2.ga),dir:1,good:-1});
  const verd=score>=1.1?'good':score<=-1.1?'bad':'neutral';return {aim,lines:L.slice(0,4),verd,score,mins:A2.dm}}
function coRead(){/* leituras do auxiliar com base nos últimos 10 minutos */const m=st.m;if(m.minute<12||m.minute>88)return null;const T=m.T[st.us],O=m.T[1-st.us],t=T.tac;const now=CO.hist[CO.hist.length-1];const W=coWin(coAt(m.minute-10),now);if(!W||W.dm<6)return null;
  if(CO.changes.some(c=>!c.done))return null;/* espera medir a última decisão antes de sugerir outra */
  const ok=id=>!CO.cool[id]||m.minute-CO.cool[id]>=18;const diff=T.score-O.score;const S=[];
  const add=(id,pri,obs,k,v,why)=>{if(!ok(id)||v==null||t[k]===v)return;if(CO.changes.some(c=>c.done&&c.res&&c.res.verd==='good'&&c.diff.includes(k)&&m.minute-c.min<22))return;/* não desmancha o que acabou de dar certo */S.push({id,pri,obs,k,v,txt:coLab(k,v),why})};
  if(m.minute>=65&&diff<0&&t.ment<1)add('perdendo',9,diff<=-2?`Faltam ${90-m.minute} minutos e você perde por ${-diff}.`:`Faltam ${90-m.minute} minutos e você está atrás no placar.`,'ment',Math.min(2,t.ment+(diff<=-2?2:1)),'Mais gente chegando na área para buscar o gol.');
  if(m.minute>=78&&diff===1&&t.ment>-1)add('segurar',8,`Você vence por 1 gol a ${90-m.minute} minutos do fim.`,'ment',-1,'Fechar os espaços e segurar o resultado.');
  if(W.rawOpSh>=3||W.rawOpXg>=.55){if(t.line>0)add('sufoco',7,`O rival finalizou ${W.rawOpSh} vezes nos últimos 10 minutos.`,'line',t.line-1,'Linha mais baixa tira o espaço nas costas da defesa.');else if(t.ment>-1&&diff>=0)add('sufoco2',6,`O rival finalizou ${W.rawOpSh} vezes nos últimos 10 minutos.`,'ment',t.ment-1,'Mais gente atrás da linha da bola.')}
  if(W.pos<=38&&W.rawOpSh>=1){if(t.press<2&&now.stam>=62)add('semposse',6,`O rival está com ${100-W.pos}% da bola nos últimos 10 minutos.`,'press',2,'Pressão alta para recuperar a bola mais perto do gol deles.');else if(t.press===2&&now.stam<58)add('cansado',6,`Seu time está com ${Math.round(now.stam)}% de fôlego e mesmo pressionando o rival tem ${100-W.pos}% da bola.`,'press',1,'Pressão média para não quebrar o time fisicamente.')}
  if(W.pos>=58&&W.rawMySh<=1){if(t.pass<2)add('esteril',5,`Você tem ${W.pos}% da bola, mas finalizou só ${W.rawMySh} vez${W.rawMySh===1?'':'es'} em 10 minutos.`,'pass',2,'Passes mais verticais para chegar mais rápido no ataque.');else if(t.tempo<2)add('esteril2',5,`Você tem ${W.pos}% da bola, mas quase não finaliza.`,'tempo',2,'Ritmo mais rápido para pegar a defesa desarrumada.')}
  if(W.acc!=null&&W.acc<68&&t.pass===2)add('erra',4,`Seu time acertou só ${W.acc}% dos passes nos últimos 10 minutos.`,'pass',1,'Passe misto para errar menos e segurar a bola.');
  if(now.stam<52&&t.tempo===2)add('folego',4,`O time está com ${Math.round(now.stam)}% de fôlego no ritmo rápido.`,'tempo',1,'Ritmo normal para chegar inteiro ao fim do jogo.');
  if(m.minute>=60&&diff===0&&t.ment<=0&&W.myXg>W.opXg+.3&&W.rawMySh>=3)add('arrisca',5,`Você criou mais que o rival nos últimos 10 minutos (${W.rawMySh} finalizações).`,'ment',t.ment+1,'Arriscar um pouco mais para transformar o domínio em gol.');
  S.sort((a,b)=>b.pri-a.pri);return S[0]||null}
const coIc=p=>`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="${p}"/></svg>`;
const IC_COACH='M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,7H13.5A2,2 0 0,1 15.5,9V14.5H14V22H10V14.5H8.5V9A2,2 0 0,1 10.5,7M20,17A2,2 0 0,1 22,19A2,2 0 0,1 20,21A2,2 0 0,1 18,19A2,2 0 0,1 20,17Z';
const IC_CHART='M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z';
function coTrack(){const el=$('#acoach-trk');if(!el)return;const ch=CO.changes.find(c=>!c.done);if(!ch){el.hidden=true;return}const m=st.m;const k=Math.min(8,Math.max(0,m.minute-ch.min));
  el.hidden=false;el.innerHTML=`${coIc(IC_CHART)}<span>Medindo: <b>${esc(ch.diff.map(x=>coLab(x,ch.to[x])).join(' · '))}</b></span><i><s style="width:${k/8*100}%"></s></i>`}
function coShow(){const el=$('#acoach');if(!el)return;coTrack();const now=performance.now();
  if(CO.cur&&now<CO.hideAt)return;if(CO.cur){CO.cur=null;el.hidden=true;el.innerHTML=''}
  /* substituições do auxiliar entram na mesma fila */
  if(!CO.queue.length||st.replay||st.goalRp||(st.m&&st.m.goalCele))return;/* não cobre gol nem replay */const q=CO.queue.shift();if(!q)return;CO.cur=q;const m=st.m;
  if(q.k==='tac'){const s=q.s;el.className='acoach ac-tac';el.innerHTML=`<div class="ac-h">${coIc(IC_COACH)}<b>Auxiliar</b><span>${m.minute}'</span></div><p class="ac-obs">${esc(s.obs)}</p><p class="ac-sug">Sugestão: <b>${esc(s.txt)}</b><small>${esc(s.why)}</small></p><div class="ac-b"><button class="btn xs" data-coapply>Aplicar</button><button class="btn ghost xs" data-cox>Agora não</button></div>`;
    el.querySelector('[data-coapply]').onclick=()=>{const T=st.m.T[st.us];CO.assist={min:st.m.minute,txt:s.txt};T.tac[s.k]=s.v;C.save();A.click&&A.click();U.toast('Instrução enviada. Vou medir o efeito nos próximos 8 minutos.');coHide();coTick();if(st.tab==='tac')panel()};
    CO.hideAt=now+20000}
  else if(q.k==='eval'){const ch=q.ch,r=ch.res;if(!r){CO.cur=null;return coShow()}const V={good:['Está funcionando','good'],neutral:['Sem efeito claro ainda','warn'],bad:['Não está funcionando','bad']}[r.verd];
    el.className='acoach ac-eval '+V[1];el.innerHTML=`<div class="ac-h">${coIc(IC_CHART)}<b>Retorno da decisão</b><span>${ch.min}' → ${m.minute}'</span></div><p class="ac-obs"><b>${esc(ch.diff.map(x=>coLab(x,ch.to[x])).join(' · '))}</b></p>
      <div class="ac-l">${r.lines.map(l=>`<div class="${l.good>0?'up':l.good<0?'dn':''}"><span>${esc(l.lab)}</span><b>${l.b!==''?esc(l.b)+' → ':''}${esc(l.a)} ${l.dir>0?'▲':l.dir<0?'▼':'='}</b></div>`).join('')}</div>
      <div class="ac-v"><em class="${V[1]}">${V[0]}</em>${r.verd==='bad'?`<button class="btn xs" data-coundo>Voltar como estava</button>`:''}<button class="btn ghost xs" data-cox>${r.verd==='bad'?'Manter':'OK'}</button></div>`;
    const u=el.querySelector('[data-coundo]');if(u)u.onclick=()=>{const T=st.m.T[st.us];ch.diff.forEach(k=>T.tac[k]=ch.from[k]);C.save();U.toast('Tática anterior de volta.');coHide();coTick();if(st.tab==='tac')panel()};
    CO.hideAt=now+(r.verd==='bad'?22000:15000)}
  else if(q.k==='sub'){el.className='acoach ac-sub';el.innerHTML=q.html;bindAdvice(el);const x=el.querySelector('#tip-x');if(x)x.onclick=coHide;CO.hideAt=now+16000}
  el.hidden=false;const x=el.querySelector('[data-cox]');if(x)x.onclick=coHide}
function coHide(){CO.hideAt=0;const el=$('#acoach');if(el){el.hidden=true;el.innerHTML=''}CO.cur=null}
function coHalfHtml(){/* intervalo: leitura do 1º tempo + decisões tomadas */const m=st.m;if(!CO.hist.length)return coHistHtml();const W=coWin(CO.hist[0],coSnap());if(!W)return coHistHtml();const T=m.T[st.us],t=T.tac;const L=[];let sug=null;
  const sh=W.rawMySh,osh=W.rawOpSh;L.push(`Você teve <b>${W.pos}%</b> da bola e finalizou <b>${sh}</b> vez${sh===1?'':'es'}; o rival, <b>${osh}</b>.`);
  if(osh>=sh+3){L.push('O rival chegou bem mais. Vale proteger a defesa.');if(t.line>0)sug={k:'line',v:t.line-1};else if(t.ment>-1)sug={k:'ment',v:t.ment-1}}
  else if(W.pos>=58&&sh<=3){L.push('Muita posse, pouca finalização. Falta profundidade.');if(t.pass<2)sug={k:'pass',v:2};else if(t.tempo<2)sug={k:'tempo',v:2}}
  else if(W.pos<=40){L.push('O rival ficou com a bola. Dá para apertar a saída deles.');if(t.press<2)sug={k:'press',v:2}}
  else if(T.score<m.T[1-st.us].score&&t.ment<1){L.push('Você precisa do gol no 2º tempo.');sug={k:'ment',v:t.ment+1}}
  else L.push('O plano está equilibrado. Dá para manter.');
  return `<div class="co-half"><div class="h">Leitura do auxiliar</div>${L.map(x=>`<p>${x}</p>`).join('')}${sug?`<div class="sadv-r"><span>Sugestão: <b>${esc(coLab(sug.k,sug.v))}</b></span><button class="btn xs" data-dotac="${sug.k}:${sug.v}">Aplicar</button></div>`:''}${coHistHtml()}</div>`}
function coHistHtml(){const L=CO.changes.filter(c=>c.done&&c.res);if(!L.length&&!CO.changes.length)return '';const V={good:['funcionou','good'],neutral:['sem efeito claro','warn'],bad:['não funcionou','bad']};
  return `<div class="co-hist"><div class="h">Efeito das suas decisões</div>${CO.changes.map(c=>`<div class="co-r"><span>${c.min}'</span><b>${esc(c.diff.map(x=>coLab(x,c.to[x])).join(' · '))}</b>${c.done&&c.res?`<em class="${V[c.res.verd][1]}">${V[c.res.verd][0]}</em>`:'<em class="dim">medindo…</em>'}</div>`).join('')}</div>`}

let tipMin=-99;function hideTip(){const t=$('#subtip');if(t)t.hidden=true;if(CO.cur&&CO.cur.k==='sub')coHide()}
function tipTick(){const m=st.m;if(!m||st.done||m.minute<55||m.minute-tipMin<8||st.skipping)return;const a=subAdvice();const s=a.subs[0];if(!s)return;tipMin=m.minute;
  const t={};t.innerHTML=`<div class="st-txt">💡 <b>Auxiliar</b>${s?`<span class="st-l"><span class="st-k">SAI</span> <b>${esc(s.outN)}</b> <span class="st-m">${s.role} · ⭐${s.oO} · <span style="color:${fisC(s.oF)}">💪${s.oF}%</span> · 📝${s.oR.toFixed(1)}</span></span><span class="st-l"><span class="st-k">ENTRA</span> <b>${esc(s.inN)}</b> <span class="st-m">${s.inPos} · ⭐${s.iO} · <span style="color:${fisC(s.iF)}">💪${s.iF}%</span></span></span><span class="st-l dim">${esc(s.why)} · <b class="sc-v ${s.gain>=1?'good':s.gain>=-1?'warn':'bad'}">${s.gain>0?'+':''}${s.gain}</b></span>`:` ${esc(a.tac.txt)}`}</div><div class="row" style="gap:6px;flex-wrap:nowrap">${s?`<button class="btn xs" data-dosub="${s.outId}:${s.inId}">Trocar</button>`:`<button class="btn xs" data-dotac="${a.tac.k}:${a.tac.v}">Aplicar</button>`}<button class="btn ghost xs" id="tip-x">Agora não</button></div>`;
  CO.queue.push({k:'sub',html:'<div class="ac-h">'+coIc(IC_COACH)+'<b>Auxiliar</b><span>'+m.minute+"'</span></div>"+t.innerHTML.replace('💡 <b>Auxiliar</b>','')});coShow()}
function render(){if(st.m&&st.live&&!st.done&&st.m.phase!=='ft'){/* voltando para a partida: torcida de volta, música baixa */try{A.crowd(true);A.fadeMusic(0,.8)}catch(e){}}
  const um=C.nextUserMatch();
  if(!um){$('#v-match').innerHTML=`<div class="frame" style="text-align:center;padding:40px"><h1 class="title">Sem jogos</h1><p class="muted">A temporada terminou.</p><button class="btn" id="b-cont2">Continuar</button></div>`;$('#b-cont2').onclick=()=>$('#b-continue').click();return}
  if(um.type==='BYE'){$('#v-match').innerHTML=`<div class="frame" style="text-align:center;padding:48px"><div class="eyebrow">${esc(um.label)}</div><h1 class="title" style="margin:10px 0">Rodada de folga</h1><p class="muted">Seu time não joga nesta rodada. O elenco treina e recupera condição física.</p><button class="btn big" id="mv-bye">Avançar ▸</button></div>`;$('#mv-bye').onclick=U.err(()=>{C.finishDate(null);U.toast('Rodada de folga concluída.');U.go('home');if(G().lastSummary)$('#b-continue').click()});return}
  if(!st.m&&snapLoad(um)){layout();if(st.m.phase==='ft'){finish();return}const b=$('#mv-play');if(b)b.textContent=st.m.phase==='ht'?'▶ 2º tempo':'▶ Continuar jogo';$('#clk')&&($('#clk').textContent=st.m.minute+"'");U.toast('⏯ Partida retomada de onde você parou');return}
  if(st.m&&!st.done){layout();return}
  if(st.m&&st.done){layout();summary();return}
  pre(um);
}
function pre(um){
  st.um=um;const g=G(),u=g.user;const H=U.clubOf(um.home),Aw=U.clubOf(um.away);const o=U.clubOf(opp());
  const oslots=C.buildSlots(o.formation),oline=C.bestLineup(o,oslots).line;C.validateLineup();const t=g.tactic;
  const sel=st.preSel||null;
  const row=(id,i,isSub)=>{const p=P(id);if(!p)return '';const s=isSub?null:t.slots[i];const r=isSub?C.ovr(p):Math.round(C.ratingIn(p,s.role));return `<div class="row prow ${sel===id?'sel':''} ${p.inj?'inj':''}" data-sw="${id}" title="Clique para trocar"><span class="num dim" style="width:22px">${isSub?'R':i+1}</span>${U.posTag(isSub?p.p:s.role)}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.n)}${isSub&&p.p!==p.p?'':''}</span>${isSub?'':`<span class="dim" style="font-size:12px">${C.fnOf(s.role,s.fn).s}</span>`}${U.fitBar(p.fi)}${U.ovrTag(r)}</div>`};
  const lineL=t.lineup.map((id,i)=>row(id,i,false)).join('')+`<div class="h" style="margin:12px 0 4px;font-size:13px">Banco <small>clique num titular e depois num reserva para trocar</small></div>`+t.subs.map(id=>row(id,0,true)).join('');
  // visão geral da tática: campinho com a formação
  const pitch=`<div class="pre-pitch"><div class="pp-lines"></div>${t.slots.map((s,i)=>{const p=P(t.lineup[i]);if(!p)return '';const x=s.a.w*100,y=100-(s.a.d*100);return `<div class="pp-dot ${sel===p.id?'sel':''}" data-sw="${p.id}" style="left:${x}%;top:${Math.max(6,Math.min(94,y))}%"><i style="background:${C.userClub().kit[0]};border-color:${C.userClub().kit[1]}">${i+1}</i><span>${esc(U.surname(p.n))}</span></div>`}).join('')}</div>`;  const lineO=oline.map((id,i)=>{const p=P(id);return p?`<div class="row" style="padding:4px 0;border-bottom:1px solid var(--line)">${U.posTag(oslots[i].role)}<span style="flex:1">${esc(p.n)}</span>${U.ovrTag(C.ovr(p))}</div>`:''}).join('');
  $('#v-match').innerHTML=`${G().trainPending?`<div class="frame warnbar">⚠️ <span><b>Você ainda não treinou esta semana.</b> Sem treino o time entra mais fraco e perde entrosamento.</span><button class="btn sm" data-autotrain>Ligar treino automático</button><button class="btn sm" data-go="training">Treinar agora</button></div>`:''}<div class="banner prem-banner" style="min-height:220px;justify-content:center;margin-bottom:16px"><div class="pat" style="background:linear-gradient(100deg,${H.kit[0]} 0 49.6%,#000 49.6% 50.4%,${Aw.kit[0]} 50.4%)"></div>
    <div class="vs" style="width:100%;max-width:900px"><div class="t" style="font-size:34px">${U.crest(H,96)}${esc(H.name)}</div><div><div class="eyebrow" style="color:#fff;text-align:center">${esc(um.label)}</div><div class="x" style="font-size:72px;text-shadow:0 4px 20px #000">VS</div></div><div class="t" style="font-size:34px">${U.crest(Aw,96)}${esc(Aw.name)}</div></div></div>
  <div class="grid pre-grid" style="grid-template-columns:1fr 1fr 1fr">
   <div class="frame pre-me" style="order:${um.home===u?0:2}"><div class="h">Seu time · ${esc(C.userClub().short)} <small>${t.formation} · força ${C.teamStrength(C.userClub()).toFixed(1)}</small></div>${pitch}${lineL}<button class="btn ghost sm" style="margin-top:10px" data-go="tactics">Tática completa</button></div>
   <div class="frame prem-act" style="order:1;display:flex;flex-direction:column;gap:12px;justify-content:flex-start;align-self:start">
     <div class="bicho"><div class="h" style="margin:0">💰 Bicho <small>bônus por resultado, motiva o time</small></div>
       ${[['win','Vitória (por jogador)'],['draw','Empate (por jogador)'],['goal','Por gol marcado']].map(([k,l])=>`<label class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><span class="muted" style="font-size:13px">${l}</span><select data-bonus="${k}">${[0,2000,5000,10000,25000,50000,100000,250000].map(v=>`<option value="${v}" ${(g.bonus&&g.bonus[k]||0)===v?'selected':''}>${v?C.money(v):'Sem bicho'}</option>`).join('')}</select></label>`).join('')}
       <div class="dim" style="font-size:12.5px" id="bicho-info">${bichoInfo()}</div></div>
     <button class="btn big go" id="mv-full">▶ Assistir ao jogo</button>
     <button class="btn ghost big" id="mv-hl">⏩ Melhores momentos</button>
     <button class="btn ghost" id="mv-quick">Resultado rápido</button>
     <p class="dim" style="font-size:13px;text-align:center;margin:0">Durante o jogo: pause (barra de espaço), troque jogadores, mude o bloco e as funções. A mudança aparece em campo na hora.</p></div>
   <div class="frame" style="order:${um.home===u?2:0}"><div class="h">${esc(o.short)} <small>${o.formation} · força ${C.teamStrength(o).toFixed(1)}</small></div>${lineO}</div></div>`;
  document.querySelectorAll('#v-match [data-sw]').forEach(el=>el.onclick=U.err(()=>{const id=+el.dataset.sw;if(st.preSel==null||st.preSel===id){st.preSel=st.preSel===id?null:id;pre(um);return}const a=st.preSel;st.preSel=null;if(U.swapPlayers(a,id)){C.validateLineup();C.save()}pre(um)}));
  document.querySelectorAll('[data-bonus]').forEach(el=>el.onchange=()=>{C.setBonus(el.dataset.bonus,el.value);$('#bicho-info').innerHTML=bichoInfo()});$('#mv-full').onclick=()=>start('full');$('#mv-hl').onclick=()=>start('hl');$('#mv-quick').onclick=()=>start('quick');
}
function bichoInfo(){const g=G();const b=g.bonus||{};const n=14;const w=(b.win||0)*n+(b.goal||0)*2*7;const boost=C.bonusBoost();
  return w?`Custo estimado numa vitória por 2 a 0: <b>${C.money(w)}</b> · motivação +${((boost-1)*100).toFixed(1)}%`:'Sem bicho: o elenco joga só pelo salário.'}
function start(mode){
  A.init();const um=st.um;const u=G().user;st.us=um.home===u?0:1;
  const home=um.home===u?C.userTeam():C.aiTeam(um.home),away=um.away===u?C.userTeam():C.aiTeam(um.away);
  coReset();st.m=new C11Match.Match(home,away,{userSide:st.us,sound:ballSfx,wkey:(G().season||'')+'-'+(G().round||G().date||0)});
  st.done=false;st.frames=[];st.replay=null;st.tail=0;st.pens=null;st.hm=null;st._hmT=null;st.mode=mode==='quick'?'full':mode;st.speed=U.PREF.speed||1;st.cam=U.PREF.cam||st.cam;st.feedHtml='';
  st.m.onEvent=onEvent;snapClear();tipMin=-99;
  if(mode==='quick'){st.m.runToEnd();const ur=st.m.result();roundShow(ur,()=>finish());return}
  st.live=true;st.paused=true;layout();A.fadeMusic(0,1.2);A.gate(true);A.crowd(true);st.last=performance.now();cancelAnimationFrame(st.raf);st.raf=requestAnimationFrame(loop);
  intro(()=>{st.paused=false;st.last=performance.now();const b=$('#mv-play');if(b)b.innerHTML='❚❚ Pausar';(A.kickoffWhistle?A.kickoffWhistle():A.whistle(1))});
}
/* ---------- multiplayer: partida contra o time de outro técnico ---------- */
function startOnline(cfg){A.init();st.online=cfg;st.um={home:cfg.home.club.id,away:cfg.away.club.id,label:cfg.label||'Amistoso online',type:'F',online:true,knock:false};st.us=cfg.us;
  coReset();st.m=new C11Match.Match(cfg.home,cfg.away,{userSide:cfg.us,sound:ballSfx,seed:cfg.seed,humans:cfg.net?[0,1]:[cfg.us]});
  st.done=false;st.frames=[];st.replay=null;st.tail=0;st.pens=null;st.hm=null;st._hmT=null;st.mode='full';st.speed=cfg.net?1:(U.PREF.speed||1);st.cam=U.PREF.cam||st.cam;st.feedHtml='';st.net=cfg.net||null;st.htT=0;
  st.m.onEvent=onEvent;tipMin=-99;if(st.net)st.net.attach(st.m);
  if(cfg.quick){st.m.runToEnd();const r=st.m.result();st.m=null;st.online=null;cfg.onEnd&&cfg.onEnd(r);return}
  U.go('match');st.live=true;st.paused=true;layout();
  if(st.net){const pb=$('#pbox');if(pb&&!$('#netwait')){const w=document.createElement('div');w.id='netwait';w.className='netwait';w.hidden=true;w.innerHTML='<span></span>Aguardando o outro técnico…';pb.appendChild(w)}}
  A.fadeMusic(0,1.2);A.gate(true);A.crowd(true);st.last=performance.now();cancelAnimationFrame(st.raf);st.raf=requestAnimationFrame(loop);
  intro(()=>{st.paused=false;st.last=performance.now();const b=$('#mv-play');if(b)b.innerHTML=st.net?'🔴 Ao vivo':'❚❚ Pausar';(A.kickoffWhistle?A.kickoffWhistle():A.whistle(1))});
}
/* ---------- câmera de bola parada: pênalti e falta vistos de trás do batedor ---------- */
function spCam(fly,done){const rnd=(a,b)=>a+Math.random()*(b-a);const pb=$('#pbox'),cv0=$('#mcv');if(!pb||!cv0){done();return}const R=cv0.getBoundingClientRect(),PB=pb.getBoundingClientRect();
  const cv=document.createElement('canvas');cv.className='spcam';cv.style.cssText=`left:${R.left-PB.left}px;top:${R.top-PB.top}px;width:${R.width}px;height:${R.height}px`;pb.appendChild(cv);
  const dpr=Math.min(2,devicePixelRatio||1),W=R.width,H=R.height;cv.width=W*dpr;cv.height=H*dpr;const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
  const kits=st.rd.kits,side=fly.side,tk=kits[side],gk=kits[1-side].gk;const out=fly.out;const pen=fly.sp==='pen';
  const gy=H*.5,gL=W*.22,gR=W*.78,gH=H*.27;const dir=Math.random()<.5?-1:1;
  const tx=out==='goal'?(W/2+dir*W*rnd(.14,.24)):out==='save'?(W/2+dir*W*rnd(.06,.16)):(W/2+dir*W*rnd(.3,.36));const ty=out==='miss'&&Math.random()<.5?gy-gH*1.25:gy-gH*rnd(.15,.8);
  const kdir=out==='save'?dir:(Math.random()<.65?-dir:dir);const T0=performance.now();const KICK=.75,FLY=.5,END=2.7;let raf;
  const name=fly.from&&fly.from.p?U.surname(fly.from.p.n):'';
  const crowd=Array.from({length:260},(_,i)=>({x:Math.random()*W,y:Math.random()*H*.3,c:[tk.c1,'#e6e1d6','#2b2f33',kits[1-side].c1][i%4],p:Math.random()*6}));
  const frame=now=>{const t=(now-T0)/1000;ctx.clearRect(0,0,W,H);
    // arquibancada e placas
    ctx.fillStyle='#0b0d0f';ctx.fillRect(0,0,W,gy);for(const c of crowd){ctx.fillStyle=c.c;ctx.globalAlpha=.75;ctx.fillRect(c.x,c.y*.55+Math.sin(t*6+c.p)*1.5,3,4)}ctx.globalAlpha=1;
    ctx.fillStyle='#14171a';ctx.fillRect(0,H*.17,W,gy-H*.17);for(let i=0;i<6;i++){ctx.fillStyle=i%2?tk.c1:'#e8e8e8';ctx.fillRect(i*W/6+4,H*.18,W/6-8,H*.045)}
    // gramado em perspectiva
    for(let i=0;i<10;i++){const y0=gy+(H-gy)*Math.pow(i/10,1.6),y1=gy+(H-gy)*Math.pow((i+1)/10,1.6);ctx.fillStyle=i%2?'#2f7d38':'#36883f';ctx.fillRect(0,y0,W,y1-y0)}
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*.22,gy);ctx.lineTo(W*.12,gy+H*.12);ctx.lineTo(W*.88,gy+H*.12);ctx.lineTo(W*.78,gy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*.04,gy);ctx.lineTo(-W*.2,H*.98);ctx.moveTo(W*.96,gy);ctx.lineTo(W*1.2,H*.98);ctx.stroke();
    if(pen){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(W/2,H*.86,W*.012,H*.006,0,0,6.283);ctx.fill()}
    // rede e gol
    ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1;for(let x=gL;x<=gR;x+=W*.015){ctx.beginPath();ctx.moveTo(x,gy-gH);ctx.lineTo(x+(x-W/2)*.06,gy-gH*.25);ctx.lineTo(x,gy);ctx.stroke()}for(let y=gy-gH;y<=gy;y+=gH/9){ctx.beginPath();ctx.moveTo(gL,y);ctx.lineTo(gR,y);ctx.stroke()}
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,W*.006);ctx.beginPath();ctx.moveTo(gL,gy);ctx.lineTo(gL,gy-gH);ctx.lineTo(gR,gy-gH);ctx.lineTo(gR,gy);ctx.stroke();
    // goleiro (pula depois do chute)
    const kt=Math.max(0,t-KICK-.08);const dv=Math.min(1,kt/.45);const gx=W/2+kdir*dv*W*.13,gyy=gy-Math.sin(Math.min(1,dv)*Math.PI*.7)*gH*.35;
    ctx.save();ctx.translate(gx,gyy);ctx.rotate(kdir*dv*1.15);C11Render.drawPerson(ctx,0,0,H*.15,{kit:gk,gk:true,ph:t*2,mv:t<KICK?.15:0,face:.01,skin:2,hair:1});ctx.restore();
    // barreira na falta
    if(!pen){const jump=Math.max(0,Math.sin(Math.min(1,Math.max(0,(t-KICK+.1)/.5))*Math.PI))*H*.05;for(let i=0;i<4;i++)C11Render.drawPerson(ctx,W*(.4+i*.065),H*.66-jump,H*.17,{kit:kits[1-side],ph:0,mv:0,face:.01,skin:i%3,hair:i})}
    // bola
    let bx=W/2,by=H*.86,br=H*.022;if(t>=KICK){const k=Math.min(1,(t-KICK)/FLY);const e=1-Math.pow(1-k,2);bx=W/2+(tx-W/2)*e+(pen?0:Math.sin(k*Math.PI)*dir*W*.05);by=H*.86+(ty-H*.86)*e-Math.sin(k*Math.PI)*H*(pen?.04:.16);br=H*(.022-.014*e)}
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(bx,Math.max(by+br,t<KICK?by+br:gy+(H*.86-gy)*(1-Math.min(1,(t-KICK)/FLY))),br*1.1,br*.35,0,0,6.283);ctx.fill();
    const g=ctx.createRadialGradient(bx-br*.3,by-br*.3,br*.1,bx,by,br);g.addColorStop(0,'#fff');g.addColorStop(1,'#a9b2ad');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx,by,br,0,6.283);ctx.fill();
    // batedor correndo de costas para a câmera
    const ru=Math.min(1,t/KICK);const sx=W*(.3+.13*ru),sy=H*(1.1-.12*ru);C11Render.drawPerson(ctx,sx,sy,H*.2,{kit:tk,ph:t*9,mv:t<KICK?.9:.2,face:.12,skin:1,hair:2,kick:t>KICK-.12&&t<KICK+.25});
    // letreiros
    ctx.font=`800 ${Math.max(14,H*.05)}px "Barlow Condensed",sans-serif`;ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText(pen?'PÊNALTI':'FALTA',W*.03,H*.08);ctx.font=`600 ${Math.max(11,H*.03)}px Inter,sans-serif`;ctx.fillStyle='#ddd';ctx.fillText(name,W*.03,H*.13);
    if(t>KICK+FLY){const res=out==='goal'?'GOOOL!':out==='save'?'DEFENDEU!':out==='block'?'NA BARREIRA!':'PRA FORA!';ctx.textAlign='center';ctx.font=`900 ${H*.12}px "Barlow Condensed",sans-serif`;ctx.lineWidth=6;ctx.strokeStyle='#000a';ctx.strokeText(res,W/2,H*.25);ctx.fillStyle=out==='goal'?'#ffe27a':'#fff';ctx.fillText(res,W/2,H*.25)}
    if(t<END)raf=requestAnimationFrame(frame);else{cv.remove();done()}};
  raf=requestAnimationFrame(frame);cv.onclick=()=>{cancelAnimationFrame(raf);cv.remove();done()}}
/* torcidas na abertura: as duas arquibancadas pulando, bandeirões, sinalizadores e papel picado */
function crowdShow(cv,k1,k2){if(!cv)return()=>{};const ctx=cv.getContext('2d');const dpr=Math.min(2,devicePixelRatio||1);const r=(cv.parentElement||cv).getBoundingClientRect();const W=Math.max(300,r.width),H=Math.max(200,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.scale(dpr,dpr);
  const rnd=(a,b)=>a+Math.random()*(b-a);const fans=[];const rows=11;
  for(let side=0;side<2;side++){const kit=side?k2:k1;for(let row=0;row<rows;row++){const y=H*.12+row*(H*.92/rows);const sz=H*.028+row*H*.004;const n=Math.ceil((W/2)/(sz*1.15));
    for(let i=0;i<n;i++){const x=side*W/2+i*(sz*1.15)+rnd(-2,2)+(row%2)*sz*.5;fans.push({x,y,sz,c:Math.random()<.72?kit[0]:Math.random()<.6?kit[1]:'#e8e2d6',sk:['#f1c9a5','#c68d5f','#8d5a3b','#5a3825'][Math.random()*4|0],ph:rnd(0,6.28),sp:rnd(5,9),arm:Math.random()<.45,side})}}}
  const flags=[0,1].flatMap(side=>[0,1,2].map(i=>({side,x:side*W/2+W*(.08+i*.15),y:H*(.25+i*.12),w:W*.11,h:H*.12,c:(side?k2:k1),ph:rnd(0,6)})));
  const conf=Array.from({length:90},()=>({x:rnd(0,W),y:rnd(-H,0),v:rnd(40,90),c:Math.random()<.5?k1[0]:k2[0],s:rnd(2,4),r:rnd(0,6)}));
  const smoke=[0,1].map(side=>({x:side?W*.88:W*.12,c:side?k2[0]:k1[0]}));
  let raf,t0=performance.now();
  const frame=now=>{const t=(now-t0)/1000;ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#05070a');sky.addColorStop(1,'#151a1e');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // refletores
    for(const lx of [W*.2,W*.8]){const g=ctx.createRadialGradient(lx,0,0,lx,0,H*.9);g.addColorStop(0,'rgba(255,250,225,.35)');g.addColorStop(1,'rgba(255,250,225,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
    // fumaça dos sinalizadores
    for(const s of smoke){for(let i=0;i<5;i++){const yy=H*(.95-i*.17)-((t*30)%40);const g=ctx.createRadialGradient(s.x+Math.sin(t+i)*20,yy,0,s.x,yy,H*.25);g.addColorStop(0,s.c+'88');g.addColorStop(1,s.c+'00');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}}
    // torcedores pulando
    for(const f of fans){const j=Math.max(0,Math.sin(t*f.sp+f.ph))*f.sz*.55;const y=f.y-j;ctx.fillStyle=f.c;ctx.beginPath();ctx.roundRect?ctx.roundRect(f.x-f.sz*.45,y,f.sz*.9,f.sz*1.3,f.sz*.3):ctx.rect(f.x-f.sz*.45,y,f.sz*.9,f.sz*1.3);ctx.fill();
      ctx.fillStyle=f.sk;ctx.beginPath();ctx.arc(f.x,y-f.sz*.15,f.sz*.36,0,6.283);ctx.fill();
      if(f.arm){ctx.strokeStyle=f.c;ctx.lineWidth=f.sz*.22;ctx.lineCap='round';const a=Math.sin(t*f.sp*.7+f.ph)*.5;ctx.beginPath();ctx.moveTo(f.x-f.sz*.35,y+f.sz*.2);ctx.lineTo(f.x-f.sz*.6+a*f.sz*.3,y-f.sz*.75);ctx.moveTo(f.x+f.sz*.35,y+f.sz*.2);ctx.lineTo(f.x+f.sz*.6-a*f.sz*.3,y-f.sz*.75);ctx.stroke()}}
    // bandeirões tremulando
    for(const fl of flags){ctx.save();ctx.translate(fl.x,fl.y);const seg=12;for(let s=0;s<2;s++){ctx.fillStyle=fl.c[s]||fl.c[0];ctx.beginPath();for(let i=0;i<=seg;i++){const x=i/seg*fl.w,yy=Math.sin(t*4+fl.ph+i*.6)*fl.h*.12+s*fl.h/2;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}for(let i=seg;i>=0;i--){const x=i/seg*fl.w,yy=Math.sin(t*4+fl.ph+i*.6)*fl.h*.12+(s+1)*fl.h/2;ctx.lineTo(x,yy)}ctx.closePath();ctx.fill()}
      ctx.strokeStyle='#ddd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-fl.h*.2);ctx.lineTo(0,fl.h*1.4);ctx.stroke();ctx.restore()}
    // papel picado
    for(const c of conf){c.y+=c.v/60;c.x+=Math.sin(t*2+c.r)*.6;if(c.y>H)c.y=-10;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(t*3+c.r);ctx.fillStyle=c.c;ctx.fillRect(-c.s/2,-c.s/4,c.s,c.s/2);ctx.restore()}
    raf=requestAnimationFrame(frame)};raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf)}
/* ---------- abertura da partida: escudos, competição e destaques ---------- */
function stadOf(){try{return C11_STADIUMS.of(st.m.T[0].club)}catch(e){return {n:'Estádio'}}}
function stadTxt(){if(!st.m)return '';const s=stadOf();return ` no ${s.n}${s.c?', em '+s.c:''}`}
function intro(done){const m=st.m;const [H,Aw]=m.T;const pb=$('#pbox');if(!pb){done();return}
  const top=T=>T.mps.slice().sort((a,b)=>C.ovr(b.p)-C.ovr(a.p)).slice(0,3).map(x=>`<span>${esc(U.surname(x.p.n))} <b>${C.ovr(x.p)}</b></span>`).join('');
  const el=document.createElement('div');el.className='intro';el.innerHTML=`<canvas class="in-cv"></canvas><div class="in-bg" style="--k1:${H.club.kit[0]};--k2:${Aw.club.kit[0]}"></div>
    <div class="in-comp">${esc(st.um.label)}</div><div class="in-std">🏟️ ${esc(stadOf().n)}${stadOf().c?' · '+esc(stadOf().c):''}</div>
    <div class="in-row"><div class="in-t l">${U.crest(H.club,120)}<b>${esc(H.club.short||H.name)}</b><small>${top(H)}</small></div>
      <div class="in-vs">VS</div>
      <div class="in-t r">${U.crest(Aw.club,120)}<b>${esc(Aw.club.short||Aw.name)}</b><small>${top(Aw)}</small></div></div>
    <div class="in-tip">toque para começar</div>`;
  const is3=typeof C11Render3D!=='undefined'&&st.rd instanceof C11Render3D.Hybrid;if(is3){el.classList.add('in3d');st.rd.introT=performance.now()}
  if(/final/i.test(st.um.label||'')&&!/semi|quartas|oitavas/i.test(st.um.label||'')){try{A.init();A.fanfare()}catch(e){}}// (24) final: vinheta de entrada
  pb.appendChild(el);const stopCrowd=is3?()=>{}:crowdShow(el.querySelector('.in-cv'),H.club.kit,Aw.club.kit);
  let fin=false;const end=()=>{if(fin)return;fin=true;
    if(!is3){el.classList.add('out');setTimeout(()=>{stopCrowd();el.remove()},450);done();return}
    /* transição de cena: escurece, os times já aparecem posicionados para a saída de bola, e clareia com o apito */
    const bk=document.createElement('div');bk.className='in-cut';pb.appendChild(bk);requestAnimationFrame(()=>requestAnimationFrame(()=>bk.classList.add('on')));
    setTimeout(()=>{stopCrowd();el.remove();if(st.rd)st.rd.introT=0;if(st.m)st.m.cutId=(st.m.cutId||0)+1;
      setTimeout(()=>{bk.classList.remove('on');done();setTimeout(()=>bk.remove(),600)},320)},400)};
  el.onclick=end;setTimeout(end,is3?5600:4200)}
function ballSfx(k){if(st.skipping||!visible())return;if(k==='touch'&&st.speed>2)return;if(k==='touch')A.touch();else if(k==='pass')A.pass();else if(k==='shot')A.shot();else if(k==='trap')A.trap();else A.kick()}
function visible(){return U.view==='match'&&!st.replay&&!(st.mode==='hl'&&st.tail<=0)}
function layout(){
  const m=st.m;const [H,Aw]=m.T;
  $('#v-match').innerHTML=`<div class="matchv"><div class="pitchbox" id="pbox"><button class="mexit" data-go="home" title="Sair para o menu">☰</button><canvas id="mcv"></canvas>${hudHtml()}<div class="acoach-w"><div class="acoach-trk" id="acoach-trk" hidden></div><div class="acoach" id="acoach" hidden></div></div>
    <div class="score"><div class="tm h" style="box-shadow:inset 6px 0 ${H.club.kit[0]}"><span class="nm-l">${esc(H.name)}</span><span class="nm-s">${esc(H.club.short||H.name)}</span><span class="sbx" id="sbx0"></span> ${U.crest(H.club,30)}</div><div class="g" id="sc0">${H.score}</div><div class="clk" id="clk">0'</div><div class="g" id="sc1">${Aw.score}</div><div class="tm" style="box-shadow:inset -6px 0 ${Aw.club.kit[0]}">${U.crest(Aw.club,30)} <span class="sbx" id="sbx1"></span><span class="nm-l">${esc(Aw.name)}</span><span class="nm-s">${esc(Aw.club.short||Aw.name)}</span></div></div>
    <div class="subtip" id="subtip" hidden></div><div class="replay" id="rp" hidden>REPLAY</div><div class="ff" id="ff" hidden></div><div class="goalfx" id="gfx"></div>
    <div class="mbar"><button class="btn sm" id="mv-play">${st.paused?'▶ Jogar':'❚❚ Pausar'}</button>
      <div class="seg" id="mv-mode" style="width:220px"><button data-mm="full" class="${st.mode==='full'?'on':''}">Completo</button><button data-mm="hl" class="${st.mode==='hl'?'on':''}">Só os lances</button></div>
      <div class="seg" id="mv-spd" style="width:150px" ${st.mode==='hl'?'hidden':''}>${[1,2,4].map(s=>`<button data-sp="${s}" class="${st.speed===s?'on':''}">${s}x</button>`).join('')}</div>
      <div class="sp"></div>
      <button class="btn ghost sm" id="mv-zoom" title="Zoom da câmera">🔍 ${zoomLbl()}</button><div class="seg" style="width:170px"><button data-cam="tv" class="${st.cam==='tv'?'on':''}">TV</button><button data-cam="top" class="${st.cam==='top'?'on':''}">Tática</button></div>
      <button class="btn sm" id="mv-tac">📋 Prancheta</button><button class="btn ghost sm" id="mv-ar">${st.arrows?'Ocultar setas':'Ver setas'}</button><button class="btn ghost sm" id="mv-mini">${U.PREF.mini===false?'Mostrar mapa':'Ocultar mapa'}</button><button class="btn ghost sm" id="mv-gq">Gráfico: ${({auto:'automático',leve:'leve',alto:'alto'})[U.PREF.gq||'auto']}</button><button class="btn ghost sm" id="mv-end">Simular até o fim</button></div></div>
   <div class="side"><button class="side-x" data-sidex aria-label="Fechar">✕</button><div class="frame" id="mstats"></div>
    <div class="frame" style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="seg" style="margin-bottom:10px">${[['feed','Lances'],['tac','Tática'],['sub','Elenco']].map(([k,l])=>`<button data-mt="${k}" class="${st.tab===k?'on':''}">${l}</button>`).join('')}</div><div class="feed" id="mpanel"></div></div></div></div>`;
  const cv=$('#mcv');const R3=U.PREF.gfx!=='2d'&&typeof C11Render3D!=='undefined'&&C11Render3D.supported();st.rd=new (R3?C11Render3D.Hybrid:C11Render.Renderer)(cv,st.m,{mode:st.cam,userSide:st.us,arrows:st.arrows,zoom:zoomVal()});
  $('#mv-play').onclick=toggle;$('#mv-end').onclick=()=>{if(st.done)return;if(st.um&&st.um.online){U.toast(st.net?'Partida ao vivo: não dá para pular.':'Jogo de liga online: assista até o fim ou use o resultado rápido antes de começar.');return}if(!confirm('Simular o restante da partida?'))return;st.skipping=true;U.closeModal();st.m.runToEnd();st.skipping=false;finish()};
  $('#mv-tac').onclick=()=>{pause();U.openModal('<div id="mtac"></div>');$('#modal').classList.add('wide');TV.render($('#mtac'),{inMatch:true})};
  $('#mv-ar').onclick=()=>{st.arrows=!st.arrows;st.rd.o.arrows=st.arrows;$('#mv-ar').textContent=st.arrows?'Ocultar setas':'Ver setas'};
  $('#mv-mini').onclick=()=>{U.PREF.mini=U.PREF.mini===false;U.savePref&&U.savePref();$('#mv-mini').textContent=U.PREF.mini===false?'Mostrar mapa':'Ocultar mapa'};
  $('#mv-gq').onclick=()=>{const o=['auto','leve','alto'];U.PREF.gq=o[(o.indexOf(U.PREF.gq||'auto')+1)%3];U.savePref&&U.savePref();$('#mv-gq').textContent='Gráfico: '+({auto:'automático',leve:'leve',alto:'alto'})[U.PREF.gq];try{st.rd.eng&&st.rd.eng.setQuality&&st.rd.eng.setQuality(U.PREF.gq)}catch(e){}};
  sbx();
  $$('[data-mm]').forEach(b=>b.onclick=()=>{st.mode=b.dataset.mm;st.replay=null;st.tail=0;$$('[data-mm]').forEach(x=>x.classList.toggle('on',x===b));$('#mv-spd').hidden=st.mode==='hl'});
  $$('[data-sp]').forEach(b=>b.onclick=()=>{st.speed=+b.dataset.sp;$$('[data-sp]').forEach(x=>x.classList.toggle('on',x===b))});
  const zb=$('#mv-zoom');if(zb)zb.onclick=()=>{const L=[1,1.5,2];const cur=U.PREF.zoom==null||U.PREF.zoom==='auto'?zoomVal():U.PREF.zoom;U.PREF.zoom=L.find(x=>x>cur+.01)||L[0];try{localStorage.setItem('c11-ui',JSON.stringify(U.PREF))}catch(e){}st.rd.setZoom(U.PREF.zoom);zb.textContent='🔍 '+zoomLbl();st.rd.draw()};
  $$('[data-cam]').forEach(b=>b.onclick=()=>{st.cam=b.dataset.cam;st.rd.setMode(st.cam);$$('[data-cam]').forEach(x=>x.classList.toggle('on',x===b));st.rd.draw()});
  $$('[data-mt]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.mt;$$('[data-mt]').forEach(x=>x.classList.toggle('on',x===b));panel()});
  stats();panel();st.rd.draw();hudBind();coTrack();sideOpen(false);{const sx=$('[data-sidex]');if(sx)sx.onclick=()=>sideOpen(false)}
  {const rp=$('#rp');if(rp){rp.style.cursor='pointer';rp.title='Toque para pular';rp.onclick=()=>{if(st.replay){st.replay.t=1e9}}}}
  {const mb=$('#pbox .mbar'),pb=$('#pbox');if(mb&&pb){const btn=document.createElement('button');btn.className='mbar-more';btn.textContent='›';btn.title='Mais opções';pb.appendChild(btn);
    const upd=()=>{const over=mb.scrollWidth>mb.clientWidth+4&&getComputedStyle(mb).position==='absolute';const end=mb.scrollLeft+mb.clientWidth>=mb.scrollWidth-6;btn.classList.toggle('on',over&&!end);
      const r=mb.getBoundingClientRect(),P=pb.getBoundingClientRect();btn.style.top=(r.top-P.top+(r.height-34)/2)+'px';};
    btn.onclick=()=>{mb.scrollBy({left:mb.clientWidth*.7,behavior:'smooth'})};mb.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);setTimeout(upd,60);setTimeout(upd,600)}}
}
/* ---------- celular: 4 ícones no canto (velocidade, câmera, prancheta, ajustes) ---------- */
const HUD_IC={spd:'M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z',
  cam:'M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z',
  tac:'M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z',
  cfg:'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z'};
function hudHtml(){return `<div class="mhud" id="mhud">${[['spd','Velocidade'],['cam','Câmera'],['tac','Prancheta tática'],['cfg','Ajustes']].map(([k,l])=>`<button data-hud="${k}" title="${l}" aria-label="${l}"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="${HUD_IC[k]}"/></svg></button>`).join('')}<div class="mpop" id="mpop" hidden></div></div>`}
function hudPop(k){const pop=$('#mpop');if(!pop)return;if(k==null||pop.dataset.k===k&&!pop.hidden){pop.hidden=true;pop.dataset.k='';$$('[data-hud]').forEach(b=>b.classList.remove('on'));return}
  const mb=s=>$('#pbox .mbar '+s);const clk=s=>()=>{const b=mb(s);if(b)b.click();setTimeout(()=>hudFill(k),40)};
  pop.dataset.k=k;pop.hidden=false;$$('[data-hud]').forEach(b=>b.classList.toggle('on',b.dataset.hud===k));hudFill(k);pop._clk=clk}
function hudFill(k){const pop=$('#mpop');if(!pop||pop.hidden)return;const mb=s=>$('#pbox .mbar '+s);
  const it=[];const seg=(lab,opts)=>`<div class="mp-g"><span>${lab}</span><div class="seg">${opts.map(o=>`<button data-mp="${o.s}" class="${o.on?'on':''}" ${o.dis?'disabled':''}>${o.l}</button>`).join('')}</div></div>`;
  const btn=(s,l,cls='')=>`<button class="btn ${cls} sm" data-mp="${s}">${l}</button>`;
  if(k==='spd'){const p=mb('#mv-play');it.push(btn('#mv-play',p&&/Jogar|2º/.test(p.textContent)?'▶ Jogar':'❚❚ Pausar','go'));
    it.push(seg('Velocidade',[1,2,4].map(s=>({s:`[data-sp='${s}']`,l:s+'x',on:st.speed===s,dis:st.mode==='hl'}))));
    it.push(seg('Assistir',[{s:'[data-mm=full]',l:'Jogo completo',on:st.mode==='full'},{s:'[data-mm=hl]',l:'Só os lances',on:st.mode==='hl'}]))}
  else if(k==='cam'){it.push(seg('Câmera',[{s:'[data-cam=tv]',l:'TV',on:st.cam==='tv'},{s:'[data-cam=top]',l:'Tática',on:st.cam==='top'}]));
    it.push(`<div class="mp-r">${btn('#mv-zoom','Zoom: '+zoomLbl(),'ghost')}${btn('#mv-ar',st.arrows?'Ocultar setas':'Ver setas','ghost')}${btn('#mv-mini',U.PREF.mini===false?'Mostrar mapa':'Ocultar mapa','ghost')}</div>`)}
  else if(k==='cfg'){it.push(`<div class="mp-c">${btn('@stats','Lances, tática, elenco e estatísticas','ghost')}${btn('#mv-gq','Gráfico: '+({auto:'automático',leve:'leve',alto:'alto'})[U.PREF.gq||'auto'],'ghost')}${btn('#mv-end','Simular até o fim','ghost')}${btn('@exit','Sair para o menu','ghost')}</div>`)}
  pop.innerHTML=it.join('');
  $$('[data-mp]',pop).forEach(b=>b.onclick=e=>{e.stopPropagation();const s=b.dataset.mp;
    if(s==='@exit'){hudPop(null);U.go('home');return}
    if(s==='@stats'){hudPop(null);if(matchMedia('(max-height:520px) and (orientation:landscape)').matches){sideOpen(true);return}const sd=$('.matchv .side');if(sd)sd.scrollIntoView({behavior:'smooth',block:'start'});return}
    const t=mb(s);if(t)t.click();if(s==='#mv-end'||s==='#mv-play'&&k==='spd'&&false){hudPop(null);return}setTimeout(()=>hudFill(k),40)})}
function sideOpen(on){document.body.classList.toggle('side-open',!!on)}
function hudBind(){$$('[data-hud]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.hud;if(k==='tac'){hudPop(null);const t=$('#mv-tac');if(t)t.click();return}hudPop(k)});
  const pb=$('#pbox');if(pb&&!pb._hudc){pb._hudc=1;pb.addEventListener('click',e=>{if(!e.target.closest('.mhud,.mbar'))hudPop(null);if(!e.target.closest('.acoach-w'))sideOpen(false)})}}

function zoomVal(){const z=U.PREF.zoom;if(z==null||z==='auto')return innerWidth<600?1.6:innerHeight<520?1.3:1;return +z}
function zoomLbl(){const z=zoomVal();return z>=1.9?'Perto':z>1.1?'Médio':'Longe'}
function resize(){if(st.rd){st.rd.resize();st.rd.draw()}}
function toggle(){if(!st.m||st.done)return;A.init();if(st.m.phase==='ht'){if(st.net){U.toast('O 2º tempo começa sozinho para os dois técnicos.');return}A.crowd(true);htGo();return}if(st.net&&!st.paused){U.toast('Partida ao vivo contra outro técnico não pode ser pausada.');return}st.paused=!st.paused;if(!st.paused){A.crowd(true);A.fadeMusic(0,1.2)}else snapSave(true);const b=$('#mv-play');if(b)b.textContent=st.paused?'▶ Jogar':'❚❚ Pausar';if(!st.paused){st.last=performance.now();cancelAnimationFrame(st.raf);st.raf=requestAnimationFrame(loop)}else panel()}
function pause(){if(!st.paused)toggle()}
function snap(){const m=st.m;const pl=[];for(const T of m.T)for(const x of T.mps)if(!x.off)pl.push({id:x.id,x:x.x,y:x.y,ph:x.ph,face:x.face,mv:Math.min(1,Math.hypot(x.vx,x.vy)/6.5),kick:x.kt!=null&&m.t-x.kt<.22,kk:x.kk,touch:x.tt!=null&&m.t-x.tt<.2,anim:x.anim?{k:x.anim.k,id:x.anim.t}:null,hold:!!x.gkHold});
  const F=m.ball.fly;const f=m.ball.st==='fly'?{kind:F.kind,fx:F.fx,fy:F.fy,tx:F.tx,ty:F.ty,ix:F.ix,iy:F.iy,t:F.t,dur:F.dur,out:F.out,endZ:F.endZ,side:F.side,h:F.h}:null;const gc=m.goalCele;
  return {t:m.t,pl,b:{x:m.ball.x,y:m.ball.y,z:m.ball.z},own:m.ball.own?m.ball.own.id:null,fly:f,flip:!!m.flip,cele:gc?{side:gc.side,mp:{id:gc.mp.id,x:gc.mp.x,y:gc.mp.y}}:null}}
function lerpView(a,b,k){if(!b)return a;if(a.flip!==b.flip)return a;const map=new Map(b.pl.map(p=>[p.id,p]));return {pl:a.pl.map(p=>{const q=map.get(p.id);return q?{...p,x:p.x+(q.x-p.x)*k,y:p.y+(q.y-p.y)*k,ph:p.ph+(q.ph-p.ph)*k}:p}),b:{x:a.b.x+(b.b.x-a.b.x)*k,y:a.b.y+(b.b.y-a.b.y)*k,z:a.b.z+(b.b.z-a.b.z)*k},own:a.own,fly:a.fly&&{...a.fly,t:a.fly.t!=null&&b.fly&&b.fly.t!=null?a.fly.t+(b.fly.t-a.fly.t)*k:a.fly.t},flip:a.flip,cele:a.cele,replay:true}}
function loop(now){
  const m=st.m;if(!m||st.done)return;const dtR=Math.min(.1,(now-st.last)/1000);st.last=now;snapSave();
  if(st.cine){st.raf=requestAnimationFrame(loop);return}
  {const f=m.ball.fly;if(f&&f.sp&&f!==st.spShown&&!st.paused&&!st.skipping&&visible()&&f.t<.05&&U.PREF.spcam!==false){st.spShown=f;st.cine=true;const cdone=()=>{st.cine=false;st.last=performance.now()};if(!(st.rd.cine&&st.rd.cine(f,m,cdone)))spCam(f,cdone);st.raf=requestAnimationFrame(loop);return}}
  if(U.view!=='match'){st.raf=requestAnimationFrame(loop);return}
  if((m.cutId||0)!==(st.cutSeen||0)){st.cutSeen=m.cutId||0;const pb=$('#pbox');if(pb&&!st.skipping){const f=document.createElement('div');f.className='cutfade';pb.appendChild(f);setTimeout(()=>f.remove(),700)}}
  if(!st.paused&&m.phase!=='ht'){
    if(st.goalRp&&!m.goalCele&&!st.replay){const g=st.goalRp;st.goalRp=null;const fr=st.frames.filter(f=>f.t>=g.t-5.5&&f.t<=g.t+1.6);
      if(fr.length>8&&visible()){st.replay={fr,t:0,slow:.5,goal:true,gt:g.t,ang:Math.random()<.5?'goal':'side',z0:st.rd.zoom};try{st.rd.setZoom(Math.min(2.4,(zoomVal()||1)*1.6))}catch(e){}const rp=$('#rp');if(rp){rp.textContent='REPLAY DO GOL';rp.hidden=false}}}
    if(st.hlRp&&!st.replay&&!st.goalRp&&performance.now()>=st.hlRp.at&&m.ball.st!=='fly'){const g=st.hlRp;st.hlRp=null;const fr=st.frames.filter(f=>f.t>=g.t-4&&f.t<=g.t+.9);
      if(fr.length>8&&visible()){st.replay={fr,t:0,slow:.6,goal:true,ang:'goal',z0:st.rd.zoom};const rp=$('#rp');if(rp){rp.textContent='REPLAY';rp.hidden=false}}}
    if(st.replay){const r=st.replay;const fi=r.fr[Math.min(r.fr.length-1,Math.floor(r.t/.1))];const sl=r.gt!=null&&fi&&fi.t>r.gt-1.3&&fi.t<r.gt+.3?.28:(r.slow||1);/* (20) câmera lenta no momento do chute */r.t+=dtR*sl;const i=Math.floor(r.t/.1);const k=(r.t%.1)/.1;
      if(i>=r.fr.length-1){st.replay=null;if(r.goal){try{st.rd.setZoom(r.z0||zoomVal())}catch(e){}st.last=performance.now()}else st.tail=3.2;const rp=$('#rp');if(rp){rp.hidden=true;rp.textContent='REPLAY'}}else{const lv=lerpView(r.fr[i],r.fr[i+1],k);lv.replayAng=r.ang;st.rd.draw(lv,dtR)}}
    if(!st.replay){
      let sim=st.mode==='hl'?(st.tail>0?dtR:dtR*24):dtR*st.speed;if(st.tail>0)st.tail-=dtR;
      st.acc+=sim;st.ffBlock=false;
      if(st.net){st.net.watch(m);const wait=m.tick>=st.net.maxTick();st.netWait=wait;const w=$('#netwait');if(w)w.hidden=!wait;if(wait)st.acc=Math.min(st.acc,1/30)}
      while(st.acc>=1/30&&!st.done&&m.phase!=='ft'&&m.phase!=='ht'&&!st.ffBlock&&!(st.net&&m.tick>=st.net.maxTick())){if(st.net)st.net.apply(m);m.step(1/30);st.acc-=1/30;heatSample();
        if(m.t-st.lastSnap>=.1){st.lastSnap=m.t;st.frames.push(snap());if(st.frames.length>170)st.frames.shift()}}
      if(st.ffBlock)st.acc=0;
      const ff=st.mode==='hl'&&st.tail<=0&&!st.replay;$('#ff').hidden=!ff;if(ff)$('#ff').innerHTML=`<div>⏩ ${m.minute}'<small>avançando até o próximo lance</small></div>`;
      if(!st.replay){st.rd.alpha=st.mode==='hl'&&st.tail<=0?1:Math.min(1,st.acc*30);st.rd.draw(null,dtR)}
    }
    A.excite(m.excite);if(now-(st.lastStats||0)>1000){st.lastStats=now;stats();tipTick();coTick()}
  }else{st.rd.alpha=1;st.rd.draw(null,dtR);if(st.um&&st.um.online&&m.phase==='ht'){st.htT=st.htT||now;if(now-st.htT>7000){st.htT=0;htGo()}}}
  $('#clk').textContent=(m.phase==='ht'?'INT':m.minute+"'");
  if(m.phase==='ft'&&!st.done){finish();return}
  st.raf=requestAnimationFrame(loop);
}
function banner(title,sub,color){const pb=$('#pbox');if(!pb)return;let el=$('#lt');if(!el){el=document.createElement('div');el.id='lt';el.className='lt';pb.appendChild(el)}
  el.innerHTML=`<i style="background:${color||'var(--acc)'}"></i><div><b>${esc(title)}</b><span>${esc(sub||'')}</span></div>`;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),3400)}
function onEvent(e){
  const m=st.m;
  if(e.type==='shot'&&st.mode==='hl'&&st.tail<=0&&!st.replay&&st.live){const t0=e.t-5.5;const fr=st.frames.filter(f=>f.t>=t0);if(fr.length>4){st.replay={fr,t:0};st.ffBlock=true;$('#rp').hidden=false;$('#ff').hidden=true}else st.tail=3}
  if(e.type==='shot'&&st.mode==='hl'&&st.tail>0)st.tail=Math.max(st.tail,3);
  const live=st.live&&U.view==='match'&&!st.skipping;
  if(st.live&&!st.skipping){const T=m.T[e.side??0];const pn=e.pid&&P(e.pid)?P(e.pid).n:'';
    if(e.type==='goal')banner(`GOL — ${pn} ${e.min}'`,`${m.T[0].name} ${m.T[0].score} × ${m.T[1].score} ${m.T[1].name}${e.assist&&P(e.assist)?' · assistência de '+P(e.assist).n:''}`,T.club.acc);
    else if(e.type==='card')banner(`🟨 ${pn}`,`Cartão amarelo · ${T.name} · ${e.min}'`,'#f5c518');
    else if(e.type==='red')banner(`🟥 ${pn}`,`Expulso · ${T.name} · ${e.min}'`,'#e02424');
    else if(e.type==='sub')banner(`🔁 Substituição · ${T.name}`,e.text,T.club.acc);
    else if(e.type==='pen')banner(`⚠ Pênalti! ${T.name}`,`${pn} vai para a cobrança`,T.club.acc);
    else if(e.type==='save')banner(`Defesaça de ${pn}`,`${T.name} · ${e.min}'`,T.club.acc);}
  if(e.type==='goal'&&st.live&&!st.skipping&&st.mode!=='hl'&&U.PREF.goalReplay!==false)st.goalRp={t:e.t};
  if((e.type==='post'||(e.type==='save'&&Math.random()<.5))&&st.live&&!st.skipping&&st.mode!=='hl'&&U.PREF.goalReplay!==false&&!st.goalRp)st.hlRp={t:e.t,at:performance.now()+1700};
  if(e.type==='off'&&st.live&&!st.skipping){A.whistle&&A.whistle(1,false,true,.5);banner('IMPEDIMENTO',e.text||'','#e5b10a')}
  if(e.type==='post'&&st.live&&!st.skipping){A.post&&A.post();banner('NA TRAVE!',e.text||'',m.T[e.side].club.acc)}
  if(e.type==='card'||e.type==='red'||e.type==='sub')sbx();
  if(e.type==='goal'){$('#sc0')&&($('#sc0').textContent=m.T[0].score);$('#sc1')&&($('#sc1').textContent=m.T[1].score);if(live){A.goal(e.side===st.us);try{if(U.PREF.vibe!==false&&e.side===st.us&&navigator.vibrate)navigator.vibrate([90,60,160])}catch(_){}const g=$('#gfx');if(g){g.innerHTML=`<b>GOL!</b>`;setTimeout(()=>{g.innerHTML=''},2700)}}if(st.mode==='hl')st.tail=Math.max(st.tail,3.6)}
  if(live&&!st.skipping){if(e.type==='save')A.save();else if(e.type==='miss')A.ohh();else if(e.type==='sub')A.sub();else if(e.type==='card')A.card(false);else if(e.type==='red')A.card(true);else if(e.type==='foul')A.foul();else if(e.type==='corner')A.corner();else if(e.type==='inj')A.whistle(1,false,true)}
  if(e.type==='pen'&&st.live&&!st.skipping)A.whistle(1);
  if(e.type==='ht'&&st.live&&!st.skipping){A.whistle(2);setTimeout(()=>{if(!st.done&&st.m&&st.m.phase==='ht')htModal()},300)}
  if(e.type==='ft'&&st.live){const sc=m.T[st.us].score-m.T[1-st.us].score;A.final(sc>0)}
  if(e.text){st.feedHtml=`<div class="ev ${e.type}"><time>${e.min}'</time><p>${e.type==='goal'?'⚽ ':e.type==='card'?'🟨 ':e.type==='red'?'🟥 ':e.type==='sub'?'🔁 ':e.type==='inj'?'✚ ':''}${esc(e.text)}</p></div>`+st.feedHtml;if(st.tab==='feed')panel()}
  stats();
}
function lumOf(c){const h=String(c||'').replace('#','');if(h.length<6)return .5;const r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;return .2126*r+.7152*g+.0722*b}
function barCol(i){const k=st.rd&&st.rd.kits&&st.rd.kits[i];if(!k)return i?'#8d959c':'#fff';const a=k.c1,b=k.c2;if(lumOf(a)>=.16)return a;if(lumOf(b)>=.16&&String(b).toLowerCase()!==String((st.rd.kits[1-i]||{}).c1).toLowerCase())return b;return i?'#8d959c':'#e9ecef'}
function stats(){const m=st.m;const el=$('#mstats');if(!el)return;const [H,Aw]=m.T;const tot=H.st.pos+Aw.st.pos||1;
  const bar=(l,a,b,fmt=x=>x)=>{const s=(a+b)||1;return `<div class="sbar"><b>${fmt(a)}</b><div class="mid"><span class="lbl">${l}</span><div class="tr"><i style="width:${a/s*100}%;background:${barCol(0)}"></i><i style="width:${b/s*100}%;background:${barCol(1)}"></i></div></div><b style="text-align:right">${fmt(b)}</b></div>`};
  el.innerHTML=bar('Posse',Math.round(H.st.pos/tot*100),Math.round(Aw.st.pos/tot*100),x=>x+'%')+bar('Finalizações',H.st.sh,Aw.st.sh)+bar('No alvo',H.st.sot,Aw.st.sot)+bar('Chances (xG)',+H.st.xg.toFixed(1),+Aw.st.xg.toFixed(1))+bar('Passes certos',H.st.pc,Aw.st.pc)+bar('Desarmes',H.st.tk,Aw.st.tk)+bar('Escanteios',H.st.co,Aw.st.co)}
function panel(){const el=$('#mpanel');if(!el)return;const m=st.m;const T=m.T[st.us];const t=T.tac;
  if(st.tab==='feed'){el.innerHTML=st.feedHtml||`<p class="dim">O jogo vai começar${stadTxt()}.</p>`;return}
  if(st.tab==='tac'){const MENT=['Retranca','Defensiva','Equilibrada','Ofensiva','Tudo ao ataque'];const seg=(k,ls)=>`<div class="seg">${ls.map((l,i)=>`<button data-qt="${k}" data-qv="${i}" class="${t[k]===i?'on':''}">${l}</button>`).join('')}</div>`;
    el.innerHTML=`<div class="ctl"><label>Mentalidade · ${MENT[t.ment+2]}</label><div class="seg">${MENT.map((l,i)=>`<button data-qt="ment" data-qv="${i-2}" class="${t.ment===i-2?'on':''}" title="${l}">${['−2','−1','0','+1','+2'][i]}</button>`).join('')}</div></div>
     <div class="ctl"><label>Bloco / linha</label>${seg('line',['Baixo','Médio','Alto'])}</div><div class="ctl"><label>Pressão</label>${seg('press',['Baixa','Média','Alta'])}</div><div class="ctl"><label>Passe</label>${seg('pass',['Curto','Misto','Direto'])}</div>
     ${coHistHtml()}<div class="h" style="margin-top:12px">Funções em campo</div>${m.active(T).map(x=>{const s=T.slots[x.si];const fns=C.FN[C.fnGroup(s.role)];return `<div class="row" style="padding:3px 0">${U.posTag(s.role)}<span style="flex:1;font-size:13.5px">${esc(U.surname(x.p.n))}</span><select data-qf="${x.si}" style="min-height:30px;font-size:13px">${fns.map(f=>`<option value="${f.k}" ${s.fn===f.k?'selected':''}>${f.n}</option>`).join('')}</select></div>`}).join('')}`;
    $$('[data-qt]',el).forEach(b=>b.onclick=()=>{t[b.dataset.qt]=+b.dataset.qv;C.save();panel()});
    $$('[data-qf]',el).forEach(s=>s.onchange=()=>{T.slots[+s.dataset.qf].fn=s.value;C.save();U.toast('Instrução enviada ao jogador.')});return}
  // elenco / substituições
  const on=m.active(T).slice().sort((a,b)=>a.si-b.si);
  el.innerHTML=adviceHtml()+`<div class="h">Em campo <small>${T.subsLeft} troca(s)</small></div>${on.map(x=>`<label class="row" style="padding:4px 0;border-bottom:1px solid var(--line);cursor:pointer"><input type="radio" name="sout" value="${x.id}">${U.posTag(T.slots[x.si].role)}<span style="flex:1;font-size:13.5px">${x.num} ${esc(U.surname(x.p.n))}${x.yc?' 🟨':''}</span>${U.fitBar(x.stam)}${U.rtTag(x.r)}</label>`).join('')}
   <div class="h" style="margin-top:12px">Banco</div>${T.bench.map(p=>`<label class="row" style="padding:4px 0;border-bottom:1px solid var(--line);cursor:pointer"><input type="radio" name="sin" value="${p.id}">${U.posTag(p.p)}<span style="flex:1;font-size:13.5px">${esc(p.n)}<small class="sub-fit" data-fit="${p.id}"></small></span>${U.fitBar(p.fi)}${U.ovrTag(C.ovr(p))}</label>`).join('')||'<p class="dim">Sem reservas.</p>'}
   <div id="sub-sum" class="sub-sum dim">Escolha quem sai e quem entra.</div>
   <button class="btn sm" style="margin-top:10px;width:100%" id="dosub" ${T.subsLeft?'':'disabled'}>Fazer substituição</button>`;
  bindAdvice(el);
  // mostra em que posição o reserva vai jogar e se fica fora de posição
  const upd=()=>{const o=$('input[name=sout]:checked',el),i=$('input[name=sin]:checked',el);const x=o&&on.find(q=>q.id===+o.value);const role=x&&T.slots[x.si].role;
    $$('[data-fit]',el).forEach(s=>{const p=T.bench.find(b=>b.id===+s.dataset.fit);if(!role||!p){s.textContent='';return}const ok=C.GROUP[p.p]===C.GROUP[role];s.className='sub-fit '+(ok?'ok':'bad');s.textContent=` → ${role} ${Math.round(C.ratingIn(p,role))}${ok?'':' · fora de posição'}`});
    const sm=$('#sub-sum',el);if(!sm)return;if(x&&i){const p=T.bench.find(b=>b.id===+i.value);const ok=C.GROUP[p.p]===C.GROUP[role];sm.className='sub-sum '+(ok?'ok':'bad');sm.innerHTML=`Sai <b>${esc(U.surname(x.p.n))}</b> (${role}) · entra <b>${esc(U.surname(p.n))}</b> (${p.p}) jogando de <b>${role}</b>${ok?'':' ⚠️ fora de posição'}`}else{sm.className='sub-sum dim';sm.textContent=x?`${U.surname(x.p.n)} joga de ${role}. Escolha quem entra.`:'Escolha quem sai e quem entra.'}};
  $$('input[name=sout],input[name=sin]',el).forEach(r=>r.onchange=upd);
  $('#dosub').onclick=U.err(()=>{const o=$('input[name=sout]:checked'),i=$('input[name=sin]:checked');if(!o||!i)throw new Error('Escolha quem sai e quem entra.');const x=on.find(q=>q.id===+o.value),role=T.slots[x.si].role,p=T.bench.find(b=>b.id===+i.value);
    m.sub(st.us,+o.value,+i.value);st.rd.buildInfo();A.sub&&A.sub();U.toast(`🔁 Sai ${esc(U.surname(x.p.n))} (${role}) · entra ${esc(U.surname(p.n))} (${p.p}) jogando de ${role}${C.GROUP[p.p]===C.GROUP[role]?'':' ⚠️ fora de posição'}`);panel()});
}
// placar: cartões e substituições de cada time (11)
function sbx(){const m=st.m;if(!m)return;for(const s of [0,1]){const el=$('#sbx'+s);if(!el)continue;const T=m.T[s];const ev=(m.events||[]).filter(e=>e.side===s);
  const y=ev.filter(e=>e.type==='card').length,r=ev.filter(e=>e.type==='red').length,sb=ev.filter(e=>e.type==='sub').length;
  el.innerHTML=(y?`<i class="cy" title="Amarelos">${y}</i>`:'')+(r?`<i class="cr" title="Expulsos">${r}</i>`:'')+(sb?`<i class="cs" title="Substituições">${sb}</i>`:'')}}
// mapa de calor do seu time (17): posições amostradas a cada 0,5 s de jogo
function heatSample(){const m=st.m;if(!m||m.phase!=='play')return;if(st._hmT!=null&&m.t-st._hmT<.5)return;st._hmT=m.t;const H=st.hm||(st.hm=new Float32Array(21*14));
  for(const p of m.active(m.T[st.us])){if(m.T[st.us].slots[p.si].role==='GOL')continue;let x=p.x/105,y=p.y/68;if(st.us===1){x=1-x;y=1-y}const i=Math.max(0,Math.min(20,x*21|0)),j=Math.max(0,Math.min(13,y*14|0));H[j*21+i]++}}
function heatHtml(){const H=st.hm;if(!H)return '';let mx=0;for(const v of H)mx=Math.max(mx,v);if(!mx)return '';let c='';for(let j=0;j<14;j++)for(let i=0;i<21;i++){const k=H[j*21+i]/mx;if(k<.06)continue;c+=`<i style="left:${i/21*100}%;top:${j/14*100}%;opacity:${Math.min(.9,k*1.1).toFixed(2)};background:${k>.66?'#ff3b30':k>.33?'#ffb020':'#ffe36b'}"></i>`}
  return `<div class="heat"><div class="heat-h">Mapa de calor do seu time <small>→ ataque</small></div><div class="heat-f">${c}<span class="hc"></span><span class="hm"></span></div></div>`}
function htModal(){const m=st.m;pauseRaw();U.openModal(`<div class="eyebrow">Intervalo</div><h1 class="title ht-t">${esc(m.T[0].name)} <span class="num">${m.T[0].score} × ${m.T[1].score}</span> ${esc(m.T[1].name)}</h1><div class="ht-act"><button class="btn" id="ht-go">▶ Começar o 2º tempo</button><button class="btn ghost" data-go="tactics">📋 Prancheta</button></div><div id="htstats" class="ht-stats"></div>
  <p class="dim" style="font-size:12.5px;margin:8px 0 0">Dá para trocar jogadores e funções na aba “Elenco” ao lado do campo.</p>`);
  $('#htstats').innerHTML=($('#mstats')?$('#mstats').innerHTML:'')+heatHtml()+coHalfHtml();bindAdvice($('#htstats'));$('#ht-go').onclick=htGo}
function pauseRaw(){st.paused=true;const b=$('#mv-play');if(b)b.textContent='▶ Jogar'}
function htGo(){U.closeModal();st.m.resumeFromHT();A.whistle(1);st.paused=false;const b=$('#mv-play');if(b)b.textContent='❚❚ Pausar';st.last=performance.now();cancelAnimationFrame(st.raf);st.raf=requestAnimationFrame(loop)}
/* ---------- resultado rápido: a rodada inteira, por divisão, com relógio ---------- */
const RD_IC={g:'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,7L15.5,9.5L14.2,13.6H9.8L8.5,9.5L12,7Z',
  r:'M7,3H17A2,2 0 0,1 19,5V19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V5A2,2 0 0,1 7,3Z',i:'M10,3H14V10H21V14H14V21H10V14H3V10H10V3Z'};
const rdI=k=>`<svg class="rd-i ${k}" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="${RD_IC[k]}"/></svg>`;
function rdLum(c){const h=String(c||'#000').replace('#','');if(h.length<6)return .5;const v=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);return .2126*v[0]+.7152*v[1]+.0722*v[2]}
function rdPill(id){const c=G().clubs[id];const k=c.kit||['#333','#fff'];let bg=k[0],fg=k[1];if(Math.abs(rdLum(bg)-rdLum(fg))<.32)fg=rdLum(bg)>.5?'#111':'#fff';return `<span class="rd-tm" style="background:${bg};color:${fg};${rdLum(bg)<.06?'box-shadow:inset 0 0 0 1px #ffffff2e':''}">${esc(c.short||c.name)}</span>`}
function roundShow(ur,done){
  const g=G();let rp;try{rp=C.roundPreview()}catch(e){console.error(e);done();return}
  const uc=C.userClub();const me={h:ur.home,a:ur.away,gh:ur.hg,ga:ur.ag,tl:(ur.tl||[]).slice().sort((x,y)=>x.m-y.m),me:1,pens:ur.pens||null};
  const groups=[];
  if(rp.kind==='L'){[uc.div,...C.DIVS.filter(d=>d!==uc.div)].forEach(d=>{const L=(rp.games[d]||[]).slice();if(d===uc.div)L.unshift(me);groups.push({t:'Série '+d,L})})}
  else groups.push({t:'Taça Nacional',L:[me,...(rp.games.C||[])]});
  const all=groups.flatMap(x=>x.L);const um=st.um||{};
  const ov=document.createElement('div');ov.className='rd';ov.innerHTML=`<div class="rd-in">
    <div class="rd-top"><div><div class="rd-eye">Resultado rápido</div><div class="rd-tt">${esc(um.label||'Rodada')}</div></div>
      <div class="rd-clk"><b id="rd-m">0'</b><span id="rd-s">1º tempo</span><i><s id="rd-p"></s></i></div>
      <div class="rd-ctl"><button class="rd-b" id="rd-x2">2x</button><button class="rd-b" id="rd-skip">Pular</button></div></div>
    <div class="rd-body">${groups.map((gr,gi)=>`<section class="rd-g"><h3>${gr.t}</h3>${gr.L.map((x,i)=>`<div class="rd-row ${x.me?'me':''}" data-k="${gi}-${i}">${rdPill(x.h)}<b class="rd-sc" data-s="0">0</b><b class="rd-sc" data-s="1">0</b>${rdPill(x.a)}<span class="rd-ev"></span></div>`).join('')}</section>`).join('')}</div>
    <div class="rd-end" id="rd-end" hidden><button class="btn big go" id="rd-go">Ver meu jogo ›</button></div></div>`;
  document.body.appendChild(ov);
  const rows=groups.flatMap((gr,gi)=>gr.L.map((x,i)=>({x,el:ov.querySelector(`[data-k="${gi}-${i}"]`),k:0,sc:[0,0]})));
  const nm=pid=>{const p=G().players[pid];if(!p)return '';const w=p.n.split(' ');return w.length>1&&w[w.length-1].length>2?w[w.length-1]:p.n};
  let t=0,spd=1,last=performance.now(),htWait=0,raf=0,ended=false;
  const MPS=90/17;/* 90 minutos em ~17 s */
  const show=()=>{const m=Math.min(90,Math.floor(t));$('#rd-m').textContent=(t>=90?90:m)+"'";$('#rd-s').textContent=t>=90?'Fim de jogo':htWait>0?'Intervalo':t>=45?'2º tempo':'1º tempo';$('#rd-p').style.width=Math.min(100,t/90*100)+'%';
    for(const r of rows){while(r.k<r.x.tl.length&&r.x.tl[r.k].m<=t){const e=r.x.tl[r.k++];
        if(e.k==='g'){r.sc[e.s]++;r.el.querySelector(`[data-s="${e.s}"]`).textContent=r.sc[e.s];r.el.classList.remove('flash');void r.el.offsetWidth;r.el.classList.add('flash');if(r.x.me){const ours=e.s===st.us;try{A.goal&&A.goal(ours)}catch(_){}}}
        const lab={g:'',r:' expulso',i:' lesionado'}[e.k];r.el.querySelector('.rd-ev').innerHTML=`${rdI(e.k)}<span>${esc(nm(e.pid))}${lab} ${e.m}'</span>`;r.el.querySelector('.rd-ev').className='rd-ev on '+e.k}}};
  const end=()=>{if(ended)return;ended=true;t=90;show();for(const r of rows){if(r.x.pens){r.el.querySelector('.rd-ev').innerHTML=`<span>pênaltis ${r.x.pens[0]}×${r.x.pens[1]}</span>`;r.el.querySelector('.rd-ev').className='rd-ev on'}
      if(r.sc[0]===r.sc[1])r.el.classList.add('dr')}try{A.whistle&&A.whistle(3,true)}catch(_){}$('#rd-end').hidden=false;$('#rd-skip').hidden=true;$('#rd-x2').hidden=true};
  const frame=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;
    if(htWait>0){htWait-=dt;if(htWait<=0)try{A.whistle&&A.whistle(1)}catch(_){}}
    else{const t0=t;t+=dt*MPS*spd;if(t0<45&&t>=45){t=45;htWait=1.3;try{A.whistle&&A.whistle(2,true)}catch(_){}}}
    show();if(t>=90){end();return}raf=requestAnimationFrame(frame)};
  const close=()=>{cancelAnimationFrame(raf);ov.classList.add('out');setTimeout(()=>ov.remove(),220);done()};
  $('#rd-x2').onclick=()=>{spd=spd===1?2.5:1;$('#rd-x2').classList.toggle('on',spd>1)};
  $('#rd-skip').onclick=()=>{cancelAnimationFrame(raf);end()};
  $('#rd-go').onclick=close;
  try{A.whistle&&A.whistle(1)}catch(_){}
  show();raf=requestAnimationFrame(frame)}

function finish(){
  const m=st.m;st.done=true;st.live=false;cancelAnimationFrame(st.raf);lastSnapT=0;snapSave(true);
  if($('#v-match .matchv')){$('#sc0').textContent=m.T[0].score;$('#sc1').textContent=m.T[1].score;$('#clk').textContent='FIM';$('#ff').hidden=true;$('#rp').hidden=true;st.rd.draw()}else layout();
  if(st.um.knock&&m.T[0].score===m.T[1].score&&!st.pens){shootoutSetup();return}
  summary();
}
/* ---------- disputa de pênaltis ---------- */
const SIDES=[['L','Esq.'],['M','Meio'],['R','Dir.'],['?','Livre']];
function penSkill(x){return x.a.fin*1.2+x.a.vis*.4+x.a.pas*.2+(x.stam/100)*2}
function shootoutSetup(){
  const m=st.m;const T=m.T[st.us];const on=m.active(T).filter(x=>T.slots[x.si].role!=='GOL');const gk=m.gk(T);
  const pref=G().tactic.takers&&G().tactic.takers.pen;
  let order=on.slice().sort((a,b)=>(b.id===pref)-(a.id===pref)||penSkill(b)-penSkill(a));
  st.so={order:order.map(x=>({id:x.id,side:'?',pow:'col'})),gk:'ler'};
  const row=(o,i)=>`<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><b class="num" style="width:26px;font-size:20px">${i+1}º</b>
    <select data-so="${i}" style="flex:1">${order.map(x=>`<option value="${x.id}" ${x.id===o.id?'selected':''}>${esc(x.p.n)} · fin ${Math.round(x.a.fin)} · ${Math.round(x.stam)}%</option>`).join('')}</select>
    <div class="seg" style="width:230px">${SIDES.map(([k,l])=>`<button data-sos="${i}" data-v="${k}" class="${o.side===k?'on':''}">${l}</button>`).join('')}</div>
    <div class="seg" style="width:170px"><button data-sop="${i}" data-v="col" class="${o.pow==='col'?'on':''}">Colocado</button><button data-sop="${i}" data-v="for" class="${o.pow==='for'?'on':''}">Forte</button></div></div>`;
  const draw=()=>{U.openModal(`<div class="eyebrow">Empate em ${m.T[0].score} × ${m.T[1].score} · ${esc(st.um.label)}</div><h1 class="title" style="margin:6px 0 12px">Disputa de pênaltis</h1>
    <p class="muted">Escolha a ordem dos 5 batedores (depois, se empatar, seguem os próximos) e como cada um bate. Colocado erra menos o gol, mas o goleiro pega mais se adivinhar. Forte é mais difícil de defender, mas pode ir para fora.</p>
    ${st.so.order.slice(0,5).map(row).join('')}
    <div class="row" style="margin-top:14px;gap:12px"><b>Goleiro ${esc(gk?gk.p.n:'')}</b><div class="seg" style="width:440px">${[['L','Pula esq.'],['R','Pula dir.'],['M','Fica no meio'],['ler','Lê o batedor']].map(([k,l])=>`<button data-sog="${k}" class="${st.so.gk===k?'on':''}">${l}</button>`).join('')}</div></div>
    <button class="btn big" id="so-go" style="width:100%;margin-top:16px">Começar as cobranças ▸</button>`);
    $('#modal').onclick=null;const xb=$('#modal .x');if(xb)xb.remove();
    $$('[data-so]').forEach(sel=>sel.onchange=()=>{const i=+sel.dataset.so,id=+sel.value;const j=st.so.order.findIndex(o=>o.id===id);const tmp=st.so.order[i];st.so.order[i]=st.so.order[j];st.so.order[j]=tmp;draw()});
    $$('[data-sos]').forEach(b=>b.onclick=()=>{st.so.order[+b.dataset.sos].side=b.dataset.v;draw()});
    $$('[data-sop]').forEach(b=>b.onclick=()=>{st.so.order[+b.dataset.sop].pow=b.dataset.v;draw()});
    $$('[data-sog]').forEach(b=>b.onclick=()=>{st.so.gk=b.dataset.sog;draw()});
    $('#so-go').onclick=shootoutRun;};
  draw();
}
function kick(k,gk,side,pow,dive){
  const pick=()=>['L','M','R'][Math.random()<.42?0:Math.random()<.72?2:1];if(side==='?')side=pick();
  const fin=k.a.fin,g=gk?gk.a.gol:10;
  const miss=side==='M'?.03:pow==='for'?.1+(12-fin)*.006:.05+(12-fin)*.008;
  if(Math.random()<Math.max(.01,miss))return {r:'fora',side};
  if(dive==='ler')dive=Math.random()<.35+(g-12)*.02?side:['L','M','R'].filter(x=>x!==side)[Math.random()<.5?0:1];
  if(dive===side){const sv=(side==='M'?.65:pow==='for'?.32:.52)+(g-12)*.015-(fin-12)*.01;if(Math.random()<sv)return {r:'defesa',side,dive}}
  else if(Math.random()<.03+(g-12)*.004)return {r:'defesa',side,dive};
  return {r:'gol',side,dive};
}
function shootoutRun(){
  const m=st.m;const U2=st.us;const T=[m.T[0],m.T[1]];const so=st.so;
  const aiOrder=s=>m.active(T[s]).filter(x=>T[s].slots[x.si].role!=='GOL').sort((a,b)=>penSkill(b)-penSkill(a));
  const lists=[0,1].map(s=>s===U2?so.order.map(o=>({mp:m.active(T[s]).find(x=>x.id===o.id),side:o.side,pow:o.pow})).filter(o=>o.mp):aiOrder(s).map(x=>({mp:x,side:'?',pow:Math.random()<.5?'col':'for'})));
  const sc=[0,0],log=[[],[]];let i=0,done=false;const first=Math.random()<.5?0:1;
  const view=()=>`<div class="eyebrow">Disputa de pênaltis</div><div class="pso-h"><div class="pso-t">${U.crest(T[0].club,54)}<b>${esc(T[0].name)}</b></div><div class="pso-sc">${sc[0]} × ${sc[1]}</div><div class="pso-t">${U.crest(T[1].club,54)}<b>${esc(T[1].name)}</b></div></div>
    <div class="grid g2">${[0,1].map(s=>`<div>${log[s].map(l=>`<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line)"><span style="width:26px;font-size:18px">${l.r==='gol'?'⚽':l.r==='defesa'?'🧤':'❌'}</span><span style="flex:1">${esc(l.n)}</span><span class="dim" style="font-size:12px">${{L:'esquerda',M:'meio',R:'direita'}[l.side]}${l.r==='defesa'?' · goleiro pegou':l.r==='fora'?' · para fora':''}</span></div>`).join('')}</div>`).join('')}</div>
    <div id="so-end" style="margin-top:14px"></div>`;
  U.openModal(view());$('#modal').onclick=null;{const xb=$('#modal .x');if(xb)xb.remove()}
  const step=()=>{
    const round=Math.floor(i/2),s=(i%2===0)?first:1-first;const L=lists[s];const k=L[round%L.length];const gk=m.gk(T[1-s]);
    const dive=(1-s)===U2?(so.gk):(['L','M','R'][Math.floor(Math.random()*3)]);
    const r=kick(k.mp,gk,k.side,k.pow,dive);if(r.r==='gol')sc[s]++;log[s].push({n:k.mp.p.n,...r});
    if(r.r==='gol')A.goal(s===U2);else if(r.r==='defesa')A.save();else A.ohh(s===U2?1:.5);i++;
    const taken=[log[0].length,log[1].length];
    if(i<=10){const rem=[5-taken[0],5-taken[1]];if(sc[0]+Math.max(0,rem[0])<sc[1]||sc[1]+Math.max(0,rem[1])<sc[0])done=true}
    if(i>=10&&i%2===0&&sc[0]!==sc[1])done=true;
    const fr=$('#modal>.frame');if(fr){fr.innerHTML=`<button class="iconbtn x" data-close hidden>✕</button>`+view()}
    if(done){st.pens=[sc[0],sc[1]];const w=sc[U2]>sc[1-U2];$('#so-end').innerHTML=`<div style="font:800 30px var(--hd);text-transform:uppercase;margin-bottom:10px">${w?'🏆 Classificado nos pênaltis!':'Eliminado nos pênaltis'}</div><button class="btn big" id="so-ok" style="width:100%">Ver resumo ▸</button>`;$('#so-ok').onclick=()=>summary();return}
    setTimeout(step,1300);
  };setTimeout(step,900);
}
function plFeedback(x,T){const s=x.s,role=T.slots[x.si].role;const pct=s.pa?Math.round(s.pc/s.pa*100):null;const f=[];
  if(s.g>=2)f.push(`${s.g} gols, decisivo`);else if(s.g)f.push('marcou');if(s.as)f.push(s.as>1?`${s.as} assistências`:'deu assistência');
  if(role==='GOL'&&s.sv)f.push(`${s.sv} defesa${s.sv>1?'s':''}`);if(s.tk+s.int>=4)f.push('roubou muitas bolas');
  if(pct!=null&&s.pa>=10&&pct>=85)f.push(`passe certo (${pct}%)`);if(pct!=null&&s.pa>=6&&pct<65)f.push(`errou passes (${pct}%)`);
  if(s.sh>=3&&!s.g)f.push(`chutou ${s.sh}x sem marcar`);if(x.yc)f.push('levou amarelo');if(x.stam<45&&role!=='GOL')f.push('terminou esgotado');
  if(!f.length)f.push(x.r>=7?'boa partida':x.r<5.8?'partida fraca':'regular');return f.slice(0,2).join(' · ')}
function sumLines(m,T,O,mine){const L=[];const xg=T.st.xg,xo=O.st.xg;
  L.push(xg>xo+.5?`Criamos mais chances (xG ${xg.toFixed(1)} × ${xo.toFixed(1)}).`:xo>xg+.5?`O adversário criou mais (xG ${xg.toFixed(1)} × ${xo.toFixed(1)}).`:`Jogo equilibrado em chances (xG ${xg.toFixed(1)} × ${xo.toFixed(1)}).`);
  const sc=(g)=>{const a=mine.filter(o=>C.GROUP[T.slots[o.x.si].role]===g);return a.length?a.reduce((s,o)=>s+o.x.r,0)/a.length:null};
  const secs=[['D','defesa'],['M','meio-campo'],['A','ataque']].map(([g,n])=>({n,v:sc(g)})).filter(o=>o.v!=null).sort((a,b)=>b.v-a.v);
  if(secs.length>1)L.push(`Melhor setor: <b>${secs[0].n}</b> (${secs[0].v.toFixed(1)}). Mais fraco: <b>${secs[secs.length-1].n}</b> (${secs[secs.length-1].v.toFixed(1)}).`);
  if(mine[0])L.push(`Destaque: <b>${esc(mine[0].x.p.n)}</b> (${mine[0].x.r.toFixed(1)}) — ${esc(plFeedback(mine[0].x,T))}.`);
  const tired=mine.filter(o=>o.x.stam<50&&!o.x.subbed);if(tired.length)L.push(`Cansaço: ${tired.slice(0,3).map(o=>esc(U.surname(o.x.p.n))+' ('+Math.round(o.x.stam)+'%)').join(', ')} — pense em poupar no treino.`);
  const pos=Math.round(T.st.pos/((T.st.pos+O.st.pos)||1)*100);if(pos<40)L.push(`Tivemos só ${pos}% de posse: a tática pode estar recuada demais.`);else if(pos>62&&T.st.sot<3)L.push(`Muita posse (${pos}%) e pouca finalização no alvo: falta profundidade.`);
  return L}
function summary(){
  const m=st.m;const res=m.result();const [H,Aw]=m.T;const T=m.T[st.us];
  const mine=[...T.mps,...T.out].map(x=>({x,min:res.minutes[x.id]||0})).filter(o=>o.min>0).sort((a,b)=>b.x.r-a.x.r);
  const all=[...H.mps,...H.out,...Aw.mps,...Aw.out];const motm=all.slice().sort((a,b)=>b.r-a.r)[0];
  const goals=m.events.filter(e=>e.type==='goal');
  const won=(st.us===0?H.score>Aw.score:Aw.score>H.score)||(st.pens&&(st.us===0?st.pens[0]>st.pens[1]:st.pens[1]>st.pens[0]));
  const O=m.T[1-st.us];const draw=!won&&T.score===O.score&&!st.pens;const res3=won?'v':draw?'e':'d';
  const gl=side=>goals.filter(e=>e.side===side).map(e=>`<div>⚽ <b>${e.min}'</b> ${esc(U.surname(P(e.pid)?.n||''))}${e.og?' (contra)':''}</div>`).join('')||'<div class="dim">—</div>';
  const sb=(l,a,b,f=x=>x)=>{const s=(a+b)||1;return `<div class="ftb"><b>${f(a)}</b><div><span>${l}</span><i><s style="width:${a/s*100}%;background:${st.us===0?'var(--acc)':'#9aa3a8'}"></s><s style="width:${b/s*100}%;background:${st.us===1?'var(--acc)':'#9aa3a8'}"></s></i></div><b>${f(b)}</b></div>`};
  const pos0=Math.round(H.st.pos/((H.st.pos+Aw.st.pos)||1)*100);
  const best=mine[0],worst=mine.slice().sort((a,b)=>a.x.r-b.x.r)[0];
  st.talk={kind:null,pid:null};
  U.openModal(`<div class="ft">
   <div class="ft-head"><span class="eyebrow">Fim de jogo · ${esc(st.um.label)}</span><span class="ft-res ${res3}">${won?'Vitória':draw?'Empate':'Derrota'}</span></div>
   <div class="ft-board">
     <div class="ft-team">${U.crest(H.club,56)}<b>${esc(H.club.short||H.name)}</b><div class="ft-gl">${gl(0)}</div></div>
     <div class="ft-score"><span>${H.score}</span><i>×</i><span>${Aw.score}</span>${st.pens?`<small>pên. ${st.pens[0]}–${st.pens[1]}</small>`:''}</div>
     <div class="ft-team">${U.crest(Aw.club,56)}<b>${esc(Aw.club.short||Aw.name)}</b><div class="ft-gl">${gl(1)}</div></div>
   </div>
   <div class="ft-stats">${sb('Posse',pos0,100-pos0,x=>x+'%')}${sb('Finalizações',H.st.sh,Aw.st.sh)}${sb('Chances (xG)',+H.st.xg.toFixed(1),+Aw.st.xg.toFixed(1),x=>x.toFixed(1))}</div>
   <div class="ft-motm">⭐ <span>Craque do jogo</span><b>${esc(motm.p.n)}</b>${U.rtTag(motm.r)}</div>
   <div class="ft-sum"><div class="h" style="margin-bottom:6px">📋 Resumo do auxiliar</div><ul>${sumLines(m,T,O,mine).map(l=>`<li>${l}</li>`).join('')}</ul></div>
   <div class="ft-talk"><div class="h" style="margin-bottom:8px">Vestiário <small>elogie ou cobre · afeta a moral e o próximo jogo</small></div>
     <div class="ft-opts g3">
       <button data-grp="elogiar_grupo">👏<b>Elogiar o grupo</b></button>
       <button data-grp="cobrar_grupo">📢<b>Cobrar o grupo</b></button>
       <button data-grp="nada" class="on">🤐<b>Nada ao grupo</b></button>
     </div>
     <div class="ft-pls">${mine.map(({x,min})=>`<div class="ft-pl" data-row="${x.id}">${U.posTag(T.slots[x.si].role)}<div class="ft-pn"><b>${esc(x.p.n)}</b><small>${min}' · ${esc(plFeedback(x,T))}</small></div>${U.rtTag(x.r)}<div class="ft-pb"><button data-ind="elogiar" data-tp="${x.id}" title="Elogiar">👏</button><button data-ind="cobrar" data-tp="${x.id}" title="Cobrar">📢</button></div></div>`).join('')}</div>
     <div class="dim" style="font-size:12px;margin-top:6px">Até 3 conversas individuais. Elogiar quem jogou mal ou cobrar quem jogou bem gera atrito.</div>
     <div id="ft-react" class="ft-react" hidden></div></div>
   <div class="ft-go"><button class="btn big" id="mv-commit" style="width:100%">${st.um.online?'Voltar ao modo online ▸':'Continuar ▸'}</button></div></div>`);
  st.talk={kind:'nada',ind:{}};
  const upd=()=>{const t=st.talk;$$('[data-grp]').forEach(b=>b.classList.toggle('on',b.dataset.grp===t.kind));$$('[data-ind]').forEach(b=>b.classList.toggle('on',t.ind[b.dataset.tp]===b.dataset.ind));
    const n=Object.keys(t.ind).length;const r=$('#ft-react');const parts=[];if(t.kind!=='nada')parts.push(t.kind==='elogiar_grupo'?'elogiar o grupo':'cobrar o grupo');
    for(const id in t.ind)parts.push((t.ind[id]==='elogiar'?'elogiar ':'cobrar ')+U.surname(P(+id).n));r.hidden=!parts.length;r.innerHTML=parts.length?`Você vai ${parts.join(', ')}. As reações aparecem ao continuar.`:'';};
  $$('[data-grp]').forEach(b=>b.onclick=()=>{st.talk.kind=b.dataset.grp;upd()});
  $$('[data-ind]').forEach(b=>b.onclick=()=>{const id=b.dataset.tp,k=b.dataset.ind,t=st.talk;if(t.ind[id]===k)delete t.ind[id];else{if(!t.ind[id]&&Object.keys(t.ind).length>=3){U.toast('No máximo 3 conversas individuais.');return}t.ind[id]=k}upd()});
  const rt={};mine.forEach(({x})=>rt[x.id]=+x.r.toFixed(2));const perf=+(T.st.xg-O.st.xg).toFixed(2);st.talkCtx={res3,perf,rt};
  $('#modal').onclick=null;
  if(st.um.online){$('#mv-commit').onclick=U.err(()=>{const r=st.m.result();const cfg=st.online;st.m=null;st.done=false;st.net=null;st.online=null;U.closeModal();A.crowd(false);A.fadeMusic(1,1.5);cfg&&cfg.onEnd&&cfg.onEnd(r)});return}
  $('#mv-commit').onclick=U.err(()=>{snapClear();U.S.lastMatchT=Date.now();const r=m.result();if(st.pens)r.pens=st.pens;const before=G().season;const tk=st.talk||{},tc=st.talkCtx;C.finishDate(r);if(tc){const outs=[];if(tk.kind&&tk.kind!=='nada')outs.push(C.teamTalk(tk.kind,null,tc.res3,tc.perf,tc.rt));for(const id in (tk.ind||{}))outs.push(C.teamTalk(tk.ind[id],+id,tc.res3,tc.perf,tc.rt,true));outs.forEach((out,i)=>setTimeout(()=>U.toast(({ok:'💬 ',warn:'⚠️ ',bad:'😠 ',mute:'🤐 '})[out.tone]+esc(out.txt)),400+i*1600))}if(G().lastBonus)U.toast('💰 Bicho pago ao elenco: '+C.money(G().lastBonus.paid));if(G().trainLog)setTimeout(()=>U.toast('🏋️ Treino feito: veja o relatório na aba Treino'),1200);st.m=null;st.done=false;U.closeModal();A.crowd(false);A.fadeMusic(1,1.5);
    U.toast(won?'Vitória! A diretoria gostou.':'Resultado registrado.');
    if(G().season!==before||G().lastSummary){U.go('home');$('#b-continue').click()}else if(G().jobOffers&&G().sacked){U.go('home');$('#b-continue').click()}else U.go('home')});
}
return {startOnline,render,resize,toggle,pause,heatHtml,get m(){return st.m},get live(){return st.live}};
})();
