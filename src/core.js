/* Camisa 11 — núcleo: jogadores, clubes, temporada, taça, finanças, base, treino, leilão, diretoria */
var C11 = (function(){
'use strict';
const D = (typeof C11_DATA!=='undefined') ? C11_DATA : require('./data.js');
const R = Math.random;
const rnd=(a,b)=>a+R()*(b-a), rint=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const gauss=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const DIVS=['A','B','C','D'];

/* ---------- atributos ---------- */
const ATTR=['fin','lon','cab','pas','cru','dri','bp','des','mar','agr','vel','ace','res','frc','vis','dec','cpo','cmp','gol','ref','sai'];
const ATTR_LABEL={fin:'Finalização',lon:'Chute de longe',cab:'Cabeceio',pas:'Passe',cru:'Cruzamento',dri:'Drible',bp:'Bola parada',des:'Desarme',mar:'Marcação',agr:'Combatividade',
  vel:'Velocidade',ace:'Aceleração',res:'Resistência',frc:'Força',vis:'Visão de jogo',dec:'Decisão',cpo:'Posicionamento',cmp:'Frieza',gol:'Pegada',ref:'Reflexos',sai:'Saída do gol'};
const ATTR_GROUPS=[['Técnica',['fin','lon','cab','pas','cru','dri','bp']],['Defesa',['des','mar','agr']],['Físico',['vel','ace','res','frc']],['Mental',['vis','dec','cpo','cmp']],['Goleiro',['gol','ref','sai']]];
const W={
  GOL:{ref:.28,gol:.22,sai:.14,cpo:.14,dec:.06,cmp:.06,pas:.05,ace:.05},
  ZAG:{des:.2,mar:.2,cab:.14,frc:.12,cpo:.12,dec:.06,ace:.04,vel:.04,pas:.04,cmp:.04},
  LD:{des:.14,mar:.12,vel:.14,ace:.08,res:.12,cru:.12,pas:.1,dri:.06,cpo:.06,dec:.06},
  LE:{des:.14,mar:.12,vel:.14,ace:.08,res:.12,cru:.12,pas:.1,dri:.06,cpo:.06,dec:.06},
  VOL:{des:.18,mar:.13,pas:.16,res:.1,cpo:.13,frc:.08,dec:.1,agr:.06,vis:.06},
  MC:{pas:.22,vis:.16,res:.11,dec:.12,dri:.08,des:.07,cpo:.08,lon:.08,cmp:.08},
  MEI:{pas:.18,vis:.2,dri:.17,fin:.1,lon:.09,dec:.1,cmp:.08,ace:.08},
  PD:{vel:.16,ace:.14,dri:.2,cru:.12,pas:.1,fin:.12,dec:.08,cmp:.08},
  PE:{vel:.16,ace:.14,dri:.2,cru:.12,pas:.1,fin:.12,dec:.08,cmp:.08},
  ATA:{fin:.3,cab:.12,cpo:.16,cmp:.12,frc:.08,ace:.08,vel:.06,dri:.08}
};
/* perfis: cada posição tem estilos com pontos fortes coerentes */
const STYLES={
  GOL:[['Reflexos',{ref:3,ace:1}],['Seguro',{gol:3,sai:1,cpo:1}],['Goleiro-líbero',{sai:3,pas:3,dec:1}]],
  ZAG:[['Xerife',{cab:3,frc:3,agr:2,ace:-2,pas:-1}],['Zagueiro técnico',{pas:3,cpo:2,dec:2,frc:-1}],['Zagueiro rápido',{vel:3,ace:2,des:1,cab:-1}]],
  LD:[['Lateral apoiador',{cru:3,res:2,vel:1,mar:-1}],['Lateral defensivo',{des:3,mar:2,cru:-1}],['Ala',{vel:2,ace:2,dri:2,des:-2}]],
  LE:[['Lateral apoiador',{cru:3,res:2,vel:1,mar:-1}],['Lateral defensivo',{des:3,mar:2,cru:-1}],['Ala',{vel:2,ace:2,dri:2,des:-2}]],
  VOL:[['Cão de guarda',{des:3,agr:3,mar:2,pas:-1}],['Volante armador',{pas:3,vis:2,dec:1,agr:-1}],['Volante box-to-box',{res:3,lon:2,frc:1}]],
  MC:[['Organizador',{pas:3,vis:3,dec:1,frc:-1}],['Box-to-box',{res:3,des:2,lon:1}],['Chutador',{lon:3,bp:2,fin:1}]],
  MEI:[['Camisa 10',{vis:3,pas:2,bp:2,vel:-1}],['Meia-atacante',{fin:2,lon:2,dri:2}],['Driblador',{dri:3,ace:2,cmp:1}]],
  PD:[['Driblador',{dri:3,ace:2,cru:-1}],['Ponta de cruzamento',{cru:3,vel:2}],['Ponta artilheiro',{fin:3,cmp:1,cru:-1}]],
  PE:[['Driblador',{dri:3,ace:2,cru:-1}],['Ponta de cruzamento',{cru:3,vel:2}],['Ponta artilheiro',{fin:3,cmp:1,cru:-1}]],
  ATA:[['Matador',{fin:3,cmp:2,cpo:1,dri:-1}],['Pivô',{cab:3,frc:3,vel:-2,ace:-1}],['Atacante veloz',{vel:3,ace:3,frc:-2}],['Falso 9',{pas:2,vis:2,dri:2,cab:-2}]]
};
const NONGK=['fin','lon','cab','pas','cru','dri','bp','des','mar','agr','vel','ace','res','frc','vis','dec','cpo','cmp'];
/* save antigo: cria os atributos novos a partir dos antigos */
function migratePlayer(p){
  const t=p.t;if(t.lon!=null&&p.con!=null)return;
  const g=()=>gauss()*1.1,c=v=>Math.round(clamp(v,1,20)*10)/10;
  if(t.lon==null)t.lon=c(t.fin*.7+t.pas*.2+1+g());
  if(t.cru==null)t.cru=c(t.pas*.75+(['LD','LE','PD','PE'].includes(p.p)?3:0)+g());
  if(t.bp==null)t.bp=c((t.fin+t.pas)/2-1+g()*1.6);
  if(t.agr==null)t.agr=c(t.des*.6+t.frc*.3+1+g()*1.5);
  if(t.ace==null)t.ace=c(t.vel+g());
  if(t.dec==null)t.dec=c(t.vis*.6+t.cpo*.4+g());
  if(t.cmp==null)t.cmp=c(t.cpo*.5+t.fin*.3+2+g()*1.4);
  if(t.ref==null)t.ref=c(t.gol+g());
  if(t.sai==null)t.sai=c(t.gol*.85+g()*1.3);
  if(p.con==null)p.con=Math.round(clamp(8+(p.a-20)*.35+gauss()*3,3,20));
  if(!p.pe)p.pe=R()<.72?'D':R()<.8?'E':'A';
  if(!p.sty){const L=STYLES[p.p];p.sty=L?pick(L)[0]:''}
}
const POS=['GOL','LD','ZAG','LE','VOL','MC','MEI','PD','PE','ATA'];
const POS_NAME={GOL:'Goleiro',LD:'Lateral direito',ZAG:'Zagueiro',LE:'Lateral esquerdo',VOL:'Volante',MC:'Meio-campista',MEI:'Meia',PD:'Ponta direita',PE:'Ponta esquerda',ATA:'Atacante'};
const GROUP={GOL:'G',LD:'D',ZAG:'D',LE:'D',VOL:'M',MC:'M',MEI:'M',PD:'A',PE:'A',ATA:'A'};
const ovrFor=(t,pos)=>{let s=0;const w=W[pos];for(const k in w)s+=t[k]*w[k];return s*5};
const ovr=p=>Math.round(ovrFor(p.t,p.p));
function posFactor(pos,role){
  if(pos===role)return 1;
  if(pos==='GOL'||role==='GOL')return .45;
  const pair={LD:'LE',LE:'LD',PD:'PE',PE:'PD'};
  if(pair[pos]===role)return .95;
  if(GROUP[pos]===GROUP[role])return .9;
  const near={'D-M':1,'M-D':1,'M-A':1,'A-M':1};
  return near[GROUP[pos]+'-'+GROUP[role]]?.8:.65;
}
const ratingIn=(p,role)=>ovrFor(p.t,role)*posFactor(p.p,role);

/* ---------- funções (instruções individuais) ---------- */
const FN={
  GOL:[{k:'gk',n:'Goleiro',s:'GOL'},{k:'gkl',n:'Goleiro líbero',s:'LÍBERO',fwd:.05}],
  ZAG:[{k:'zag',n:'Zagueiro',s:'ZAG'},{k:'cons',n:'Zagueiro construtor',s:'CONSTRÓI',build:1},{k:'cob',n:'Cobertura',s:'COBRE',hold:.05}],
  LAT:[{k:'la',n:'Lateral apoiador',s:'APOIO',fwd:.06},{k:'ldf',n:'Lateral defensivo',s:'FICA',hold:.1},{k:'ala',n:'Ala',s:'ALA',fwd:.15,wide:.04}],
  VOL:[{k:'gp',n:'Guardar posição',s:'FIXO',hold:.08},{k:'cl',n:'Cobrir o lateral',s:'COBRE LAT',cover:1},{k:'ca',n:'Chegar à área',s:'CHEGA',box:.14}],
  MC:[{k:'b2b',n:'Box-to-box',s:'B2B',fwd:.05},{k:'arm',n:'Armador recuado',s:'ARMA',drop:.08,build:1},{k:'inf',n:'Infiltrar',s:'INFILTRA',box:.12}],
  MEI:[{k:'mei',n:'Armador',s:'ARMADOR',build:1},{k:'enc',n:'Encostar no atacante',s:'ENCOSTA',fwd:.1,inside:.12},{k:'flu',n:'Flutuar',s:'FLUTUA',roam:1}],
  PON:[{k:'pa',n:'Ponta aberto',s:'ABERTO',wide:.05},{k:'pi',n:'Ponta invertido',s:'CORTA',inside:.22,box:.06},{k:'rec',n:'Recompor',s:'RECOMPÕE',hold:.04,track:1}],
  ATA:[{k:'ul',n:'Prender a última linha',s:'ÚLTIMA',fwd:.05},{k:'piv',n:'Pivô',s:'PIVÔ',drop:.1},{k:'mov',n:'Atacante móvel',s:'MÓVEL',roam:1}]
};
const fnGroup=r=>({GOL:'GOL',ZAG:'ZAG',LD:'LAT',LE:'LAT',VOL:'VOL',MC:'MC',MEI:'MEI',PD:'PON',PE:'PON',ATA:'ATA'})[r];
const fnOf=(role,k)=>{const l=FN[fnGroup(role)];return l.find(f=>f.k===k)||l[0]};

/* ---------- formações (d = profundidade a partir do próprio gol, w = lado: 0 esquerda, 1 direita) ---------- */
const F_RAW={
 '4-3-3':[['GOL',.03,.5],['LE',.3,.1],['ZAG',.2,.36],['ZAG',.2,.64],['LD',.3,.9],['VOL',.38,.5],['MC',.5,.3],['MC',.5,.7],['PE',.72,.12],['ATA',.8,.5],['PD',.72,.88]],
 '4-4-2':[['GOL',.03,.5],['LE',.28,.1],['ZAG',.2,.36],['ZAG',.2,.64],['LD',.28,.9],['PE',.52,.12],['MC',.45,.38],['MC',.45,.62],['PD',.52,.88],['ATA',.76,.38],['ATA',.76,.62]],
 '4-2-3-1':[['GOL',.03,.5],['LE',.29,.1],['ZAG',.2,.36],['ZAG',.2,.64],['LD',.29,.9],['VOL',.38,.38],['VOL',.38,.62],['PE',.63,.14],['MEI',.62,.5],['PD',.63,.86],['ATA',.8,.5]],
 '4-1-4-1':[['GOL',.03,.5],['LE',.29,.1],['ZAG',.2,.36],['ZAG',.2,.64],['LD',.29,.9],['VOL',.35,.5],['PE',.6,.12],['MC',.52,.36],['MC',.52,.64],['PD',.6,.88],['ATA',.8,.5]],
 '4-3-1-2':[['GOL',.03,.5],['LE',.29,.1],['ZAG',.2,.36],['ZAG',.2,.64],['LD',.29,.9],['VOL',.37,.5],['MC',.46,.3],['MC',.46,.7],['MEI',.62,.5],['ATA',.78,.38],['ATA',.78,.62]],
 '3-5-2':[['GOL',.03,.5],['ZAG',.2,.26],['ZAG',.18,.5],['ZAG',.2,.74],['LE',.48,.07],['VOL',.37,.5],['MC',.5,.32],['MC',.5,.68],['LD',.48,.93],['ATA',.77,.38],['ATA',.77,.62]],
 '3-4-3':[['GOL',.03,.5],['ZAG',.2,.26],['ZAG',.18,.5],['ZAG',.2,.74],['LE',.48,.08],['MC',.44,.38],['MC',.44,.62],['LD',.48,.92],['PE',.74,.18],['ATA',.8,.5],['PD',.74,.82]],
 '5-3-2':[['GOL',.03,.5],['LE',.3,.07],['ZAG',.18,.28],['ZAG',.16,.5],['ZAG',.18,.72],['LD',.3,.93],['VOL',.4,.5],['MC',.48,.3],['MC',.48,.7],['ATA',.76,.38],['ATA',.76,.62]]
};
const FORMATIONS=Object.keys(F_RAW);
function buildSlots(name){
  return F_RAW[name].map(([role,d,w])=>{
    let dd=.06+d*.6, dw=.5+(w-.5)*.86;
    if(role==='PE'||role==='PD'){dd=.38;dw=role==='PE'?.1:.9}            // pontas viram linha de cinco sem a bola
    if(role==='ATA')dd=Math.min(dd,.5);
    if(role==='GOL'){dd=.03;dw=.5}
    return {role,a:{d,w},df:{d:+dd.toFixed(3),w:+dw.toFixed(3)},arrow:null,fn:FN[fnGroup(role)][0].k};
  });
}

/* ---------- valores ---------- */
function valueOf(p){
  const o=ovr(p);let v=Math.pow(1.13,o-50)*120000;
  if(p.a<=21)v*=1+Math.max(0,p.pot-o)/22; else if(p.a<=24)v*=1+Math.max(0,p.pot-o)/40;
  if(p.a>=30)v*=.75; if(p.a>=33)v*=.55;
  const f=formAvg(p); if(f) v*=clamp(1+(f-6.6)*.18,.8,1.35);   // quem joga bem vale mais
  return Math.max(15000,Math.round(v/5000)*5000);
}
const wageOf=p=>Math.max(2000,Math.round(valueOf(p)*.006/500)*500);
const formAvg=p=>p.fm&&p.fm.length?p.fm.reduce((a,b)=>a+b,0)/p.fm.length:0;

/* ---------- geração ---------- */
let uid=1;
const nextId=()=>(G?G.uid++:uid++);
function genName(){return R()<.24?pick(D.nick):pick(D.first)+' '+pick(D.last)}
const PROFILE={
  GOL:{ref:2,gol:2,sai:1,cpo:1,dec:.5},ZAG:{des:2,mar:2,cab:1.5,frc:1.5,cpo:1,dri:-2,fin:-2,cru:-2,lon:-1},
  LD:{des:1,mar:1,vel:1.5,res:1.5,cru:2,fin:-1.5,cab:-1},LE:{des:1,mar:1,vel:1.5,res:1.5,cru:2,fin:-1.5,cab:-1},
  VOL:{des:2,mar:1.5,pas:1,res:1,cpo:1.5,agr:1,dri:-1,fin:-1.5},MC:{pas:2,vis:1.5,res:1,dec:1,fin:-.5},
  MEI:{pas:1.5,vis:2,dri:1.5,lon:1,bp:1,des:-2,mar:-2,frc:-1},PD:{vel:2,ace:2,dri:2,cru:1,des:-2,mar:-2,cab:-1},
  PE:{vel:2,ace:2,dri:2,cru:1,des:-2,mar:-2,cab:-1},ATA:{fin:2.5,cab:1,cpo:2,cmp:1.5,des:-2.5,mar:-2.5,cru:-1}
};
function genPlayer(pos,target,age,club,opts={}){
  const base=target/5-2.2;const st=STYLES[pos]?pick(STYLES[pos]):['',{}];const prof=PROFILE[pos]||{};
  const ath=gauss()*.9,tec=gauss()*.9,men=gauss()*.9;            // traços correlacionados: atleta, técnico, cabeça
  const grp=k=>['vel','ace','res','frc'].includes(k)?ath:['fin','lon','pas','cru','dri','bp','cab'].includes(k)?tec:['vis','dec','cpo','cmp'].includes(k)?men:0;
  const t={};for(const k of ATTR)t[k]=clamp(base+(prof[k]||0)+(st[1][k]||0)+grp(k)+gauss()*1.25,1,20);
  if(pos!=='GOL'){t.gol=clamp(rnd(1,4),1,20);t.ref=clamp(rnd(1,5),1,20);t.sai=clamp(rnd(1,4),1,20)}
  else {for(const k of ['fin','lon','dri','cru','cab','bp'])t[k]=clamp(t[k]-6,1,20);for(const k of ['des','mar','agr','vel','res','frc','vis'])t[k]=clamp(t[k]-3.5,1,20)}
  t.ace=clamp(t.vel*.6+t.ace*.4,1,20);                          // velocidade e aceleração andam juntas
  if(age>=30){t.vel=clamp(t.vel-(age-29)*.35,1,20);t.ace=clamp(t.ace-(age-29)*.4,1,20);t.dec=clamp(t.dec+.8,1,20);t.cpo=clamp(t.cpo+.6,1,20)}
  if(age<=20){t.dec=clamp(t.dec-1,1,20);t.cmp=clamp(t.cmp-1,1,20)}
  const w=W[pos];for(let i=0;i<5;i++){const diff=(target-ovrFor(t,pos))/5;for(const k in w)t[k]=clamp(t[k]+diff*(1+gauss()*.2),1,20)}
  for(const k of ATTR)t[k]=Math.round(t[k]*10)/10;
  const o=ovrFor(t,pos);
  const extra=age<=17?rnd(8,30):age<=19?rnd(5,24):age<=21?rnd(2,16):age<=24?rnd(0,8):0;
  const p={id:nextId(),n:opts.name||genName(),a:age,p:pos,t,pot:Math.round(Math.min(97,o+extra*(opts.potMul||1))),mo:rint(60,80),re:rint(50,65),fi:100,fm:[],c:club,inj:0,
    st:{j:0,g:0,as:0},y:!!opts.youth,fn:null,tr:'equilibrado',bs:0,pr:null,tk:-1,so:Math.round(o),cards:0,
    sty:st[0],con:Math.round(clamp(9+(age-21)*.4+gauss()*3.2,3,20)),pe:pos==='PE'||pos==='LE'?(R()<.6?'E':R()<.85?'D':'A'):(R()<.78?'D':R()<.85?'E':'A')};
  p.v=valueOf(p);p.w=opts.youth?1500:wageOf(p);
  return p;
}
const SQUAD=['GOL','GOL','LD','LD','ZAG','ZAG','ZAG','ZAG','LE','LE','VOL','VOL','MC','MC','MC','MEI','MEI','PD','PD','PE','PE','ATA','ATA'];
const DIV_LEVEL={A:[71,78],B:[64,71],C:[57,64],D:[50,57]};
const DIV_MONEY={A:30e6,B:9e6,C:3e6,D:1.1e6};
const DIV_TV={A:1.6e6,B:450e3,C:140e3,D:45e3};
const DIV_GATE={A:[42000,55],B:[18000,35],C:[9000,22],D:[4500,15]};
/* investimentos do clube: cada nível custa mais e rende mais */
const FAC={
  est:{n:'Estádio',ic:'🏟️',d:'Mais lugares e camarotes: aumenta a capacidade e o preço do ingresso.',fx:l=>`Capacidade +${(l-1)*25}% · ingresso +${(l-1)*8}%`},
  torc:{n:'Experiência do torcedor',ic:'📣',d:'Telão, food trucks, sócio-torcedor: a torcida cresce mais rápido e lota mais o estádio.',fx:l=>`Ocupação +${(l-1)*4}% · torcida cresce +${(l*0.4).toFixed(1)}% por jogo em casa`},
  ct:{n:'Centro de treinamento',ic:'🏋️',d:'Campos, academia e análise de desempenho: os jogadores evoluem mais rápido no treino.',fx:l=>`Evolução no treino +${(l-1)*12}%`},
  med:{n:'Departamento médico',ic:'🩺',d:'Fisioterapia e recuperação: menos tempo lesionado e mais condição física depois do jogo.',fx:l=>`Recuperação física +${(l-1)*2} pts · lesões ${l>=3?'1 jogo mais curtas':'normais'} · menos lesões no treino`},
  mkt:{n:'Marketing e loja',ic:'🛍️',d:'Loja oficial, licenciamento e patrocínios: renda extra a cada jogo.',fx:l=>`Renda extra por jogo: ${money(DIV_TV[(G&&userClub()?userClub().div:'D')]*.05*(l-1))}`}};
function facLvl(k){G.fac=G.fac||{};return G.fac[k]||1}
function facCost(k){const l=facLvl(k);if(l>=5)return null;const base={A:5e6,B:1.4e6,C:420e3,D:140e3}[userClub().div];return Math.round(base*[1,1.8,3,5][l-1]*({est:1.6,torc:.8,ct:1.2,med:.9,mkt:1}[k])/5000)*5000}
function buyFac(k){const cost=facCost(k);if(cost==null)throw new Error('Já está no nível máximo.');const c=userClub();if(c.money<cost)throw new Error(`Faltam ${money(cost-c.money)} no caixa.`);
  c.money-=cost;G.seasonMoney.out+=cost;G.fac[k]=facLvl(k)+1;G.ledger.push({date:G.date,tv:0,gate:0,wages:0,academy:0,inv:-cost,invName:FAC[k].n,tot:-cost});if(G.ledger.length>16)G.ledger.shift();
  msg(`${FAC[k].ic} Investimento: ${FAC[k].n}`,`Nível ${G.fac[k]} concluído por ${money(cost)}. Efeito: ${FAC[k].fx(G.fac[k])}.`);save();return G.fac[k]}
/* ações pontuais com o dinheiro do clube */
const ACTS={
  hotel:{n:'Concentração em hotel',ic:'🏨',d:'Elenco concentrado antes do próximo jogo: moral +4 e entrosamento +3.',cost:c=>DIV_TV[c.div]*.25,go:c=>{c.players.forEach(i=>{const p=G.players[i];if(p)p.mo=clamp(p.mo+4,0,100)});G.fam=clamp(G.fam+3,0,100)}},
  festa:{n:'Ação com a torcida',ic:'🎉',d:'Treino aberto e brindes: torcida +3% e diretoria +2.',cost:c=>DIV_TV[c.div]*.3,go:c=>{c.fans=Math.round(c.fans*1.03);G.board.conf=clamp(G.board.conf+2,0,100)}},
  fisio:{n:'Mutirão de fisioterapia',ic:'💆',d:'Recupera +10% de condição física de todo o elenco agora.',cost:c=>DIV_TV[c.div]*.2,go:c=>{c.players.forEach(i=>{const p=G.players[i];if(p)p.fi=clamp(p.fi+10,30,100)})}},
  psico:{n:'Psicólogo esportivo',ic:'🧠',d:'Conversas individuais: relação com o técnico +5 para todos.',cost:c=>DIV_TV[c.div]*.22,go:c=>{c.players.forEach(i=>{const p=G.players[i];if(p)p.re=clamp(p.re+5,0,100)})}}};
function doAct(k){const A=ACTS[k];const c=userClub();G.actsUsed=G.actsUsed||{};if(G.actsUsed[k]===G.date+'-'+G.season)throw new Error('Já foi feito nesta semana.');const cost=Math.round(A.cost(c)/1000)*1000;if(c.money<cost)throw new Error('Caixa insuficiente.');
  c.money-=cost;G.seasonMoney.out+=cost;A.go(c);G.actsUsed[k]=G.date+'-'+G.season;save();return cost}
/* investimento individual: sessão especial para um jogador (+1 num atributo, uma vez por temporada) */
function playerBoostCost(p){return Math.max(20000,Math.round(valueOf(p)*.06/1000)*1000)}
function boostPlayer(pid,attr){const p=G.players[pid];const c=userClub();if(!p||p.c!==G.user)throw new Error('Só jogadores do seu clube.');if(p.boostS===G.season)throw new Error('Esse jogador já recebeu o investimento nesta temporada.');
  const cost=playerBoostCost(p);if(c.money<cost)throw new Error('Caixa insuficiente.');if(p.t[attr]==null)throw new Error('Atributo inválido.');if(p.t[attr]>=20)throw new Error('Já está no máximo.');
  c.money-=cost;G.seasonMoney.out+=cost;p.t[attr]=Math.min(20,+(p.t[attr]+1).toFixed(2));p.boostS=G.season;p.mo=clamp(p.mo+3,0,100);p.v=valueOf(p);save();return cost}
/* premiações (visíveis no jogo) */
const CUP_PRIZE=[0,.03,.06,.12,.5];// fração de DIV_PRIZE.A por fase alcançada: oitavas, quartas, semi, final, campeão
function prizeTable(){const out={};for(const d of DIVS)out[d]={champ:DIV_PRIZE[d],second:Math.round(DIV_PRIZE[d]*.925),last:Math.round(DIV_PRIZE[d]*.1)};
  out.cup=[['Chegar às quartas',DIV_PRIZE.A*.03],['Chegar à semifinal',DIV_PRIZE.A*.06],['Chegar à final',DIV_PRIZE.A*.12],['Campeão da Taça',DIV_PRIZE.A*.5]];return out}
const DIV_PRIZE={A:12e6,B:3e6,C:900e3,D:300e3};
function accentOf(k){
  const lum=h=>{const n=parseInt(h.slice(1),16);const r=n>>16,g=n>>8&255,b=n&255;return {l:(Math.max(r,g,b)+Math.min(r,g,b))/510,s:(Math.max(r,g,b)-Math.min(r,g,b))/255}};
  for(const c of [k[0],k[1],k[2]]){const x=lum(c);if(x.s>.35)return c}
  return '#d8dde2';
}
function makeClub(name,div,idx){
  const k=D.kits[name]||['#2b6cb0','#ffffff','#2b6cb0','liso'];
  const [lo,hi]=DIV_LEVEL[div];const level=hi-(idx/19)*(hi-lo)+gauss()*1.2;
  const c={id:name,name,short:D.short[name]||name,div,kit:k,acc:accentOf(k),level:Math.round(level),money:Math.round(DIV_MONEY[div]*rnd(.7,1.3)),fans:Math.round(DIV_GATE[div][0]*rnd(.6,1.2)),players:[],formation:pick(['4-3-3','4-4-2','4-2-3-1','4-1-4-1','3-5-2','4-3-1-2'])};
  const RL=(typeof C11_REAL!=='undefined')?C11_REAL:(typeof require!=='undefined'?(()=>{try{return require('./real.js')}catch(e){return null}})():null);
  const list=RL&&RL.clubs[name];
  if(list&&list.length){c.real=true;
    list.slice(0,32).forEach(([n,pos,num])=>{const st=RL.stars[n];
      const age=st?st[1]:num>=40?rint(18,21):clamp(Math.round(26+gauss()*3.6),19,35);
      const tgt=st?st[0]:Math.min(77,level-1+(num>=1&&num<=11?1:num<=25?-2:num>=40?-7:-4)+gauss()*2.5);
      const pl=genPlayer(pos,tgt,age,c.id,{name:n});pl.num=num||null;G.players[pl.id]=pl;c.players.push(pl.id)});
    const has=p=>c.players.filter(id=>G.players[id].p===p).length;
    const need={GOL:2,ZAG:2,LD:1,LE:1,MC:2,ATA:1};
    for(const pos in need)while(has(pos)<need[pos]){const pl=genPlayer(pos,level-3+gauss()*2,rint(19,24),c.id);G.players[pl.id]=pl;c.players.push(pl.id)}
    while(c.players.length<20){const pos=pick(SQUAD);const pl=genPlayer(pos,level-3+gauss()*2,rint(19,24),c.id);G.players[pl.id]=pl;c.players.push(pl.id)}
    return c}
  SQUAD.forEach((pos,i)=>{const first=i===0||SQUAD[i-1]!==pos;const age=clamp(Math.round(26+gauss()*4),18,35);
    const pl=genPlayer(pos,level+(first?2:-2)+gauss()*3.2,age,c.id);G.players[pl.id]=pl;c.players.push(pl.id)});
  return c;
}

/* ---------- estado ---------- */
let G=null;
const KEY='camisa11-save-v4';
let onSave=null;
/* qual cópia está mais avançada (versão; nas carreiras antigas, temporada e rodada) */
function progressOf(g){if(!g)return -1;return (g.season||0)*100000+(g.date||0)*10}
function newerSave(a,b){if(!a)return b;if(!b)return a;const pa=progressOf(a),pb=progressOf(b);if(pa!==pb)return pa>pb?a:b;const sa=a.savedAt||0,sb=b.savedAt||0;if(sa!==sb)return sa>sb?a:b;return (a.rev||0)>=(b.rev||0)?a:b}
function current(){try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):null}catch(e){return null}}
function save(){if(G){G.rev=(G.rev||0)+1;G.savedAt=Date.now()}try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){console.warn('save',e)}if(onSave)try{onSave()}catch(e){}}
function afterLoad(){if(!G)return;{const js=JSON.stringify(G);if(js.includes('Red Bull Bragantino'))G=JSON.parse(js.split('Red Bull Bragantino').join('Bragantino'))}if(!G.cid)G.cid='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);if(G._tacBak){G.tactic=G._tacBak;delete G._tacBak}for(const k of Object.keys(G.clubs||{}))if(k.startsWith('mp:'))delete G.clubs[k];for(const id of Object.keys(G.players||{}))if(+id>=8e6)delete G.players[id];for(const p of Object.values(G.players||{}))migratePlayer(p);if(G.trainPending===undefined)G.trainPending=true;
  try{const n=syncRosters();if(n)msg('Elencos oficiais',`Atualizamos ${n} nomes de jogadores para os elencos reais de 2026 de todos os clubes.`)}catch(e){console.error(e)}if(!G.bonus)G.bonus={win:0,draw:0,goal:0};if(!G.settings)G.settings={};
  if(!G.cal&&G.date===0&&G.user&&G.clubs[G.user]){try{startSeason(false);msg('Campeonato atualizado','As Séries A, B, C e D agora têm os 20 clubes reais de 2026, com elencos oficiais. A temporada recomeçou com 19 rodadas de liga e 4 datas de Taça Nacional.')}catch(e){console.error(e)}}}
/* ---------- conversa no vestiário depois do jogo ---------- */
// kind: elogiar_grupo | cobrar_grupo | elogiar | cobrar | nada ; res: 'v'|'e'|'d' ; perf: xG nosso - xG deles ; rt: notas {id:nota}
function teamTalk(kind,pid,res,perf,rt,acc){const c=userClub();const ps=c.players.map(id=>G.players[id]).filter(Boolean);const played=ps.filter(p=>rt[p.id]!=null);
  const mo=(p,d)=>{p.mo=clamp((p.mo||60)+d,0,100)};const re=(p,d)=>{p.re=clamp((p.re||55)+d,0,100)};
  let boost=1,txt='',tone='ok';const bad=res==='d'&&perf<-.4,unlucky=res==='d'&&perf>.3,lucky=res==='v'&&perf<-.4;
  if(kind==='elogiar_grupo'){
    if(res==='v'&&!lucky){played.forEach(p=>mo(p,5));ps.forEach(p=>mo(p,2));boost=1.025;txt='O grupo vibrou com o reconhecimento. Confiança lá em cima para o próximo jogo.'}
    else if(res==='e'||unlucky){played.forEach(p=>mo(p,3));boost=1.015;txt='O elenco gostou do apoio depois de um jogo duro. Clima bom no vestiário.'}
    else if(lucky){ps.forEach(p=>mo(p,2));boost=.99;txt='Vencemos sem jogar bem e o elogio deixou o time relaxado demais. Cuidado com a acomodação.';tone='warn'}
    else{ps.forEach(p=>mo(p,1));boost=.98;txt='Elogiar depois de uma derrota feia soou estranho. Os jogadores não sentiram cobrança.';tone='bad'}}
  else if(kind==='cobrar_grupo'){
    if(bad){played.forEach(p=>{mo(p,-1);re(p,1)});boost=1.035;txt='A bronca acordou o time. Os jogadores prometeram reação no próximo jogo.'}
    else if(res==='d'||res==='e'){played.forEach(p=>mo(p,-2));boost=1.015;txt='O grupo aceitou a cobrança, mas sentiu. Espere mais intensidade.';tone='warn'}
    else{ps.forEach(p=>{mo(p,-5);re(p,-4)});boost=.975;txt='Cobrar depois de uma vitória irritou o elenco. Alguns acharam injusto.';tone='bad'}}
  else if(kind==='elogiar'&&pid){const p=G.players[pid];const r=rt[pid];
    if(r!=null&&r>=7){mo(p,10);re(p,6);boost=1.01;txt=`${p.n} ficou motivado com o elogio público. Ele vai querer repetir a atuação.`}
    else if(r!=null&&r>=6.2){mo(p,6);re(p,3);txt=`${p.n} gostou do reconhecimento.`}
    else{mo(p,3);played.filter(x=>x.id!==pid&&rt[x.id]>=7).forEach(x=>{mo(x,-3);re(x,-2)});boost=.99;txt=`Elogiar ${p.n} depois de uma atuação fraca incomodou quem jogou bem.`;tone='warn'}}
  else if(kind==='cobrar'&&pid){const p=G.players[pid];const r=rt[pid];const proud=(p.con||10)>=13||p.a>=30;
    if(r!=null&&r<6.2){if(proud){mo(p,4);re(p,-1);txt=`${p.n} aceitou a cobrança como profissional e quer dar a volta por cima.`}else{mo(p,-6);re(p,-5);txt=`${p.n} ficou abalado com a cobrança. A confiança dele caiu.`;tone='warn'}}
    else{mo(p,-10);re(p,-10);ps.forEach(x=>mo(x,-1));boost=.985;txt=`${p.n} jogou bem e não entendeu a cobrança. Ficou irritado e o grupo estranhou.`;tone='bad'}}
  else{txt='Sem conversa: o grupo segue do jeito que está.';tone='mute'}
  G.talkBoost=acc?clamp((G.talkBoost||1)*boost,.95,1.06):boost;G.lastTalk={kind,pid,txt,tone};save();return {txt,tone,boost}}
const RVER=2;
function realGen(c,[n,pos,num]){const RL=(typeof C11_REAL!=='undefined')?C11_REAL:null;const st=RL&&RL.stars[n];const level=c.level||70;
  const age=st?st[1]:num>=40?rint(18,21):clamp(Math.round(26+gauss()*3.6),19,35);
  const tgt=st?st[0]:Math.min(77,level-1+(num>=1&&num<=11?1:num<=25?-2:num>=40?-7:-4)+gauss()*2.5);
  const pl=genPlayer(pos,tgt,age,c.id,{name:n});pl.num=num||null;return pl}
// saves antigos: troca nomes fictícios pelos elencos reais (mantém ids, então escalação, leilão e histórico continuam válidos)
function syncRosters(){const RL=(typeof C11_REAL!=='undefined')?C11_REAL:null;if(!RL||!G||(G.rv||0)>=RVER)return 0;
  const realNames=new Set();for(const k in RL.clubs)for(const r of RL.clubs[k])realNames.add(r[0]);
  const lot=new Set(((G.auction&&G.auction.lots)||[]).map(l=>l.pid));let n=0;
  for(const name in G.clubs){const c=G.clubs[name];const list=RL.clubs[name];if(!list||!list.length)continue;
    const cur=c.players.map(id=>G.players[id]).filter(Boolean);const names=new Set(cur.map(p=>p.n));
    const avail=list.slice(0,32).filter(r=>!names.has(r[0]));if(!avail.length)continue;
    const fict=cur.filter(p=>!realNames.has(p.n));
    for(const p of fict){let i=avail.findIndex(r=>r[1]===p.p);if(i<0)i=avail.findIndex(r=>(GROUP[r[1]]||'')===(GROUP[p.p]||'?'));if(i<0)i=0;const r=avail.splice(i,1)[0];if(!r)break;
      const np=realGen(c,r);const keep={id:p.id,c:p.c,inj:p.inj,fi:p.fi,st:p.st,fm:p.fm,mo:p.mo,re:p.re};Object.assign(p,np,keep);if(!p.st)p.st=np.st;p.so=Math.round(ovrFor(p.t,p.p));p.v=valueOf(p);n++;if(!avail.length)break}
    for(const r of avail){if(c.players.length>=32)break;const np=realGen(c,r);G.players[np.id]=np;c.players.push(np.id);n++}
    c.real=true}
  G.rv=RVER;return n}
function load(){try{const s=localStorage.getItem(KEY);if(s){G=JSON.parse(s);afterLoad();return true}}catch(e){}return false}
function hasSave(){try{return !!localStorage.getItem(KEY)}catch(e){return false}}
function wipe(){try{localStorage.removeItem(KEY)}catch(e){}G=null}
function exportSave(){return JSON.stringify(G)}
function importSave(txt){const g=JSON.parse(txt);if(!g||!g.clubs)throw new Error('arquivo inválido');G=g;save()}

/* calendário: saves antigos = 12 rodadas + 4 Taça; novo = 19 rodadas (turno único, 20 clubes) + 4 Taça */
const CAL_OLD=['L','L','L','C','L','L','L','C','L','L','L','C','L','L','L','C'];
const CAL20=['L','L','L','L','L','C','L','L','L','L','L','C','L','L','L','L','L','C','L','L','L','L','C'];
const cal=()=>(G&&G.cal)||CAL_OLD;
const nRounds=()=>cal().filter(x=>x==='L').length;
const CAL=CAL20;
const CUP_NAMES=['Oitavas de final','Quartas de final','Semifinal','Final'];
const CUP_QN={A:6,B:4,C:3,D:3};
const CUP_RULE='A Taça Nacional reúne 16 clubes em mata-mata (jogo único, pênaltis se empatar): os 6 primeiros da Série A, os 4 primeiros da B, os 3 primeiros da C e os 3 primeiros da D na temporada anterior. Se o seu clube não se classificar, ele entra com a vaga de convidado. São 4 datas no calendário: Oitavas, Quartas, Semifinal e Final.';

function newGame(clubName,manager){
  G={cid:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),v:3,uid:1,season:2026,date:0,user:null,manager:manager||'Treinador',clubs:{},players:{},div:{A:[],B:[],C:[],D:[]},
     fixtures:{},results:{},table:{},cup:null,auction:null,auctionHistory:[],inbox:[],board:{conf:60,goal:''},
     tactic:null,training:{focus:'equilibrado',int:1},fam:55,academy:{lvl:1,scoutCd:0},ledger:[],seasonMoney:{in:0,out:0},
     offers:[],history:[],jobOffers:null,played:{},sacked:false,seasonLog:[],cal:CAL20,trainPending:true,rv:2};
  for(const d of DIVS)D.divisions[d].forEach((n,i)=>{const c=makeClub(n,d,i);G.clubs[n]=c;G.div[d].push(n)});
  takeOver(clubName,true);
  startSeason(true);
  return G;
}
function takeOver(clubName,first){
  G.user=clubName;const c=G.clubs[clubName];
  G.tactic={formation:'4-3-3',slots:buildSlots('4-3-3'),lineup:[],subs:[],ment:0,press:1,tempo:1,width:1,line:1,pass:1};
  autoLineup();
  if(!c.youth){c.youth=[];for(let i=0;i<5;i++)addYouth(false)}
  G.fam=55;G.board.conf=60;
  if(!first)msg('Novo desafio',`Você assumiu o ${c.name}. A diretoria espera ${G.board.goal||'evolução'} e acompanha cada rodada.`);
}

/* ---------- escalação ---------- */
function userClub(){return G.clubs[G.user]}
function bestLineup(club,slots){
  const avail=club.players.map(id=>G.players[id]).filter(p=>p&&!p.inj&&!p.y);
  const used=new Set(),line=[];
  const order=slots.map((s,i)=>i).sort((a,b)=>(slots[a].role==='GOL'?-1:0)-(slots[b].role==='GOL'?-1:0));
  for(const i of order){let best=null,bv=-1;for(const p of avail){if(used.has(p.id))continue;const v=ratingIn(p,slots[i].role)*(.75+.25*(p.fi/100));if(v>bv){bv=v;best=p}}
    line[i]=best?best.id:null;if(best)used.add(best.id)}
  const subs=avail.filter(p=>!used.has(p.id)).sort((a,b)=>ovr(b)-ovr(a)).slice(0,9).map(p=>p.id);
  return {line,subs};
}
function autoLineup(){const {line,subs}=bestLineup(userClub(),G.tactic.slots);G.tactic.lineup=line;G.tactic.subs=subs}
function validateLineup(){
  const c=userClub(),t=G.tactic;const ids=new Set(c.players);
  t.lineup=t.lineup.map(id=>id&&ids.has(id)&&G.players[id]&&!G.players[id].inj?id:null);
  if(t.lineup.some(x=>!x)){const {line}=bestLineup(c,t.slots);const used=new Set(t.lineup.filter(Boolean));
    t.lineup=t.lineup.map((id,i)=>{if(id)return id;const cand=c.players.map(x=>G.players[x]).filter(p=>!p.inj&&!p.y&&!used.has(p.id)).sort((a,b)=>ratingIn(b,t.slots[i].role)-ratingIn(a,t.slots[i].role))[0];if(cand){used.add(cand.id);return cand.id}return line[i]})}
  const inL=new Set(t.lineup);t.subs=(t.subs||[]).filter(id=>ids.has(id)&&!inL.has(id)&&G.players[id]&&!G.players[id].inj).slice(0,9);
  if(t.subs.length<9){for(const p of c.players.map(x=>G.players[x]).filter(p=>!p.y&&!p.inj&&!inL.has(p.id)&&!t.subs.includes(p.id)).sort((a,b)=>ovr(b)-ovr(a))){if(t.subs.length>=9)break;t.subs.push(p.id)}}
}
function setFormation(name){const t=G.tactic;const old=t.slots;t.formation=name;t.slots=buildSlots(name);
  const keep=t.lineup.slice();const {line}=bestLineup(userClub(),t.slots);
  // tenta manter os mesmos onze, reposicionando
  const pool=keep.filter(Boolean);const used=new Set();t.lineup=t.slots.map((s,i)=>{let b=null,bv=-1;for(const id of pool){if(used.has(id))continue;const v=ratingIn(G.players[id],s.role);if(v>bv){bv=v;b=id}}if(b){used.add(b);return b}return line[i]});
  G.fam=Math.round(G.fam*.65);}
function teamStrength(club){
  const slots=club.id===G.user?G.tactic.slots:buildSlots(club.formation);
  const line=club.id===G.user?G.tactic.lineup:bestLineup(club,slots).line;
  let s=0,n=0;line.forEach((id,i)=>{const p=G.players[id];if(p){s+=ratingIn(p,slots[i].role)*(.85+.15*p.fi/100)*(.94+(p.mo+p.re)/1700);n++}});
  return n?s/11:40;
}
function aiTeam(clubId){
  const c=G.clubs[clubId];const slots=buildSlots(c.formation);const {line,subs}=bestLineup(c,slots);
  const diff=teamStrength(c)-(G.clubs[G.user]?teamStrength(G.clubs[G.user]):70);
  return {club:c,slots,line,subs,tactic:{ment:diff>4?1:diff<-4?-1:0,press:rint(0,2),tempo:1,width:1,line:diff<-5?0:1,pass:rint(0,2)}};
}
function bonusBoost(){const B=G.bonus||{};const wage=userClub().players.map(id=>G.players[id]).filter(Boolean).reduce((a,p)=>a+p.w,0)/22||5000;const x=((B.win||0)+(B.goal||0)*.6)/wage;return 1+Math.min(.045,x*.03)}
function userTeam(){validateLineup();const t=G.tactic;return {club:userClub(),slots:t.slots,line:t.lineup.slice(),subs:t.subs.slice(),tactic:t,fam:G.fam,boost:bonusBoost()*(G.trainPending?.97:1)*(G.talkBoost||1)}}

/* ---------- temporada ---------- */
function roundRobin(ids){
  const a=ids.slice();if(a.length%2)a.push(null);const n=a.length,rounds=[];
  for(let r=0;r<n-1;r++){const pr=[];for(let i=0;i<n/2;i++){const x=a[i],y=a[n-1-i];if(x&&y)pr.push((r+i)%2?[y,x]:[x,y])}rounds.push(pr);a.splice(1,0,a.pop())}
  return rounds;
}
function expandLeagues(){
  if(G.div.A.length>=20&&G.cal)return;
  const have=new Set(Object.keys(G.clubs));
  for(const d of DIVS){const list=D.divisions[d];
    for(const n of list){if(have.has(n))continue;
      let i=DIVS.indexOf(d),tgt=null;for(let k=0;k<4&&!tgt;k++){for(const j of [i+k,i-k]){const dd=DIVS[j];if(dd&&G.div[dd].length<20){tgt=dd;break}}}
      if(!tgt)continue;const c=makeClub(n,tgt,G.div[tgt].length);G.clubs[n]=c;G.div[tgt].push(n);have.add(n)}}
  G.cal=CAL20;G.v=Math.max(G.v||3,4);
}
function startSeason(first){
  G.date=0;G.fixtures={};G.results={};G.table={};G.played={};
  expandLeagues();
  const NR=nRounds();
  for(const d of DIVS){let rr=roundRobin(shuffle(G.div[d].slice()));if(rr.length>NR){const bye=G.div[d].includes(G.user)?rr.findIndex(r=>!r.some(f=>f.includes(G.user))):rr.length-1;rr=rr.filter((r,i)=>i!==(bye<0?rr.length-1:bye)).slice(0,NR)}G.fixtures[d]=rr;G.results[d]=[];G.table[d]={};for(const c of G.div[d])G.table[d][c]={j:0,v:0,e:0,d:0,gp:0,gc:0,pts:0,f:''}}
  // Taça Nacional: 16 clubes
  const pickTop=(d,n)=>G.div[d].slice().sort((a,b)=>teamStrength(G.clubs[b])-teamStrength(G.clubs[a])).slice(0,n);
  let cup=[];const qual={};const prev=G.prevTables||null;
  for(const d of DIVS){const src=(prev&&prev[d]?prev[d].filter(id=>G.clubs[id]):pickTop(d,20)).filter(id=>!cup.includes(id));
    src.slice(0,CUP_QN[d]).forEach((id,i)=>{cup.push(id);qual[id]=prev&&prev[d]?`${i+1}º da Série ${d} em ${G.season-1}`:`${i+1}º no ranking da Série ${d}`})}
  if(!cup.includes(G.user)){const o=cup.pop();delete qual[o];cup.push(G.user);qual[G.user]='Vaga de convidado'}
  cup=shuffle(cup);G.cup={alive:cup,ties:[],round:0,champion:null,out:{},qual};
  for(const p of Object.values(G.players)){p.st={j:0,g:0,as:0,inj:0,ns:0,nn:0};p.so=ovr(p);p.fm=p.fm.slice(-3)}
  const c=userClub();const rank=G.div[c.div].slice().sort((a,b)=>teamStrength(G.clubs[b])-teamStrength(G.clubs[a])).indexOf(G.user)+1;
  const goalPos=Math.max(1,Math.min(10,rank-(c.div==='D'?1:0)));
  G.board.goalPos=goalPos;G.board.goal=goalPos<=3?`terminar entre os 3 primeiros${c.div!=='A'?' e subir':''}`:goalPos<=6?`ficar entre os ${goalPos} primeiros`:`terminar acima da zona de rebaixamento`;
  G.board.cupGoal=rank<=4?'chegar à semifinal da Taça':'passar das oitavas da Taça';
  msg(`Temporada ${G.season}`,`A diretoria do ${c.name} definiu a meta: ${G.board.goal} na ${divName(c.div)} e ${G.board.cupGoal}. São ${nRounds()} rodadas de liga e 4 datas de Taça Nacional.`);
  msg('🏆 Taça Nacional '+G.season,`${G.cup.qual[G.user]==='Vaga de convidado'?'Seu clube entra na Taça com a vaga de convidado.':'Seu clube está classificado para a Taça ('+G.cup.qual[G.user]+').'} ${CUP_RULE}`);
  newAuction();
}
const divName=d=>'Série '+d;
function dateInfo(i=G.date){
  const K=cal();if(i>=K.length)return null;
  const kind=K[i];
  if(kind==='L'){const r=K.slice(0,i+1).filter(x=>x==='L').length-1;return {kind,leagueRound:r,label:`Rodada ${r+1} de ${nRounds()}`}}
  const cr=K.slice(0,i+1).filter(x=>x==='C').length-1;return {kind,cupRound:cr,label:`Taça Nacional · ${CUP_NAMES[cr]}`};
}
function nextUserMatch(){
  const di=dateInfo();if(!di)return null;const u=G.user;
  if(di.kind==='L'){const fx=G.fixtures[userClub().div][di.leagueRound].find(([h,a])=>h===u||a===u);return fx?{type:'L',home:fx[0],away:fx[1],label:`${divName(userClub().div)} · ${di.label}`}:{type:'BYE',label:`${divName(userClub().div)} · ${di.label} · folga`}}
  ensureCupDraw();
  const tie=G.cup.ties.find(([h,a])=>h===u||a===u);
  if(tie)return {type:'C',home:tie[0],away:tie[1],label:di.label,knock:true};
  // eliminado: jogo de colocação
  if(!G.cup.placement||G.cup.placement.date!==G.date){const pool=Object.keys(G.cup.out).filter(c=>c!==u);const opp=pick(pool.length?pool:G.div[userClub().div].filter(c=>c!==u));G.cup.placement={date:G.date,opp,home:R()<.5}}
  const pl=G.cup.placement;return {type:'P',home:pl.home?u:pl.opp,away:pl.home?pl.opp:u,label:'Taça Nacional · Jogo de colocação'};
}
function ensureCupDraw(){
  const di=dateInfo();if(!di||di.kind!=='C'||G.cup.round!==di.cupRound||G.cup.ties.length)return;
  const a=shuffle(G.cup.alive.slice());G.cup.ties=[];for(let i=0;i<a.length;i+=2)G.cup.ties.push([a[i],a[i+1]]);
}
/* simulação rápida (outros jogos) */
function poisson(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=R()}while(p>L);return k-1}
function quickResult(h,a,neutral){
  const mom=id=>{const c=G.clubs[id];const t=G.table[c.div]&&G.table[c.div][id];const f=t&&t.f?t.f.slice(-3):'';return ([...f].reduce((x,y)=>x+(y==='V'?1:y==='D'?-1:0),0))*.5};
  const sh=teamStrength(G.clubs[h])*(1+gauss()*.035)+mom(h),sa=teamStrength(G.clubs[a])*(1+gauss()*.035)+mom(a);
  const lh=1.3*Math.exp((sh-sa)*.055)+(neutral?0:.22),la=1.08*Math.exp((sa-sh)*.055);
  return [poisson(lh),poisson(la)];
}
function creditScorers(clubId,goals){
  const c=G.clubs[clubId];const ps=c.players.map(i=>G.players[i]).filter(p=>p&&!p.inj&&!p.y);
  const wG={ATA:6,PD:3.4,PE:3.4,MEI:2.6,MC:1.3,VOL:.6,LD:.4,LE:.4,ZAG:.5,GOL:0};
  const wA={MEI:4,PD:3,PE:3,MC:2.5,ATA:2,LD:1.4,LE:1.4,VOL:1,ZAG:.3,GOL:.1};
  const draw=(w,f)=>{let tot=0;const arr=ps.map(p=>{const x=(w[p.p]||0)*Math.pow(p.t[f]/10,2)*(ovr(p)>c.level-4?1.6:.5);tot+=x;return x});let r=R()*tot;for(let i=0;i<ps.length;i++){r-=arr[i];if(r<=0)return ps[i]}return ps[0]};
  const out=[];for(let i=0;i<goals;i++){const s=draw(wG,'fin');s.st.g++;out.push(s.id);if(R()<.7){const as=draw(wA,'pas');if(as!==s)as.st.as++}}
  // jogos e nota para quem joga
  ps.sort((a,b)=>ovr(b)-ovr(a)).slice(0,13).forEach(p=>{p.st.j++;const nt=+(6.4+gauss()*.55+(goals>1?.2:0)).toFixed(1);p.st.ns=(p.st.ns||0)+nt;p.st.nn=(p.st.nn||0)+1;p.fm.push(nt);if(p.fm.length>5)p.fm.shift()});
  return out;
}
function applyTable(d,h,a,gh,ga){
  const T=G.table[d],th=T[h],ta=T[a];th.j++;ta.j++;th.gp+=gh;th.gc+=ga;ta.gp+=ga;ta.gc+=gh;
  if(gh>ga){th.v++;th.pts+=3;ta.d++;th.f+='V';ta.f+='D'}else if(gh<ga){ta.v++;ta.pts+=3;th.d++;th.f+='D';ta.f+='V'}else{th.e++;ta.e++;th.pts++;ta.pts++;th.f+='E';ta.f+='E'}
  th.f=th.f.slice(-5);ta.f=ta.f.slice(-5);
}
function sortedTable(d){return Object.entries(G.table[d]).map(([id,r])=>({id,...r,sg:r.gp-r.gc})).sort((x,y)=>y.pts-x.pts||y.v-x.v||y.sg-x.sg||y.gp-x.gp)}
function penalties(h,a){let x=0,y=0;for(let i=0;i<5;i++){if(R()<.76)x++;if(R()<.76)y++}while(x===y){if(R()<.75)x++;if(R()<.75)y++}return [x,y]}

/* ---------- processar a data (depois do jogo do usuário) ---------- */
function finishDate(userRes){
  // userRes: {home,away,hg,ag,pens?,ratings:{pid:nota}, minutes:{pid:min}, fit:{pid:fi}, injuries:[{pid,rounds}], cards, scorers:[pid], assists:[pid], type}
  const di=dateInfo();const u=G.user;const report=[];
  const um=nextUserMatch();const bye=!userRes;if(bye)userRes={home:null,away:null,hg:0,ag:0,ratings:{},minutes:{},fit:{},scorers:[],assists:[],injuries:[],oppScorers:[]};
  if(di.kind==='L'){
    for(const d of DIVS){const res=[];
      for(const [h,a] of G.fixtures[d][di.leagueRound]){let gh,ga;
        if(h===u||a===u){gh=userRes.hg;ga=userRes.ag}else{[gh,ga]=quickResult(h,a);creditScorers(h,gh);creditScorers(a,ga)}
        applyTable(d,h,a,gh,ga);res.push({h,a,gh,ga})}
      G.results[d][di.leagueRound]=res}
  } else {
    const ties=G.cup.ties,res=[];
    for(const [h,a] of ties){let gh,ga,pens=null;
      if(h===u||a===u){gh=userRes.hg;ga=userRes.ag;pens=userRes.pens||null;if(gh===ga&&!pens)pens=penalties(h,a)}
      else{[gh,ga]=quickResult(h,a,true);creditScorers(h,gh);creditScorers(a,ga);if(gh===ga)pens=penalties(h,a)}
      const w=gh>ga||(pens&&pens[0]>pens[1])?h:a,l=w===h?a:h;G.cup.out[l]=CUP_NAMES[G.cup.round];res.push({h,a,gh,ga,pens,w})}
    G.cup.results=G.cup.results||[];G.cup.results[G.cup.round]=res;
    G.cup.alive=res.map(r=>r.w);G.cup.ties=[];G.cup.round++;
    {const mine0=res.find(r=>r.h===u||r.a===u);if(mine0&&mine0.w===u&&G.cup.round<4){const pz=Math.round(DIV_PRIZE.A*CUP_PRIZE[G.cup.round]);G.clubs[u].money+=pz;G.seasonMoney.in+=pz;msg('💰 Premiação da Taça',`Classificação para a ${CUP_NAMES[G.cup.round]} rendeu ${money(pz)} ao caixa.`)}}
    if(G.cup.alive.length===1){G.cup.champion=G.cup.alive[0];
      if(G.cup.champion===u){(G.cupWins=G.cupWins||[]).push({season:G.season,club:u});msg('🏆 Campeão da Taça Nacional!',`O ${userClub().name} levantou a Taça Nacional ${G.season}. Prêmio de ${money(DIV_PRIZE.A*.5)} no caixa.`);G.clubs[u].money+=DIV_PRIZE.A*.5;G.seasonMoney.in+=DIV_PRIZE.A*.5;celebrate('taca',`Campeão da Taça Nacional ${G.season}`,`Prêmio de ${money(DIV_PRIZE.A*.5)} no caixa`)}
      else msg('Taça Nacional decidida',`${G.clubs[G.cup.champion].name} é o campeão da Taça Nacional ${G.season}.`)}
    const mine=res.find(r=>r.h===u||r.a===u);
    if(mine){if(mine.w===u&&G.cup.alive.length>1)msg('Classificado!',`Vitória na ${CUP_NAMES[G.cup.round-1]}. Próxima fase: ${CUP_NAMES[G.cup.round]}.`);else if(mine.w!==u)msg('Fora da Taça',`Eliminado na ${CUP_NAMES[G.cup.round-1]}. Nas datas que restam, o time disputa jogos de colocação.`)}
  }
  if(!bye)applyUserMatch(userRes,um);G.talkBoost=1;
  weeklyMoney(bye?null:um);
  if(G.trainPending){G.fam=clamp(G.fam-3,0,100);if(!bye)msg('Time foi a campo sem treinar','Não houve treino antes deste jogo: o entrosamento caiu e o time rendeu menos. Faça o treino da semana na aba Treino antes de cada partida.')}
  postMatchRecover(userRes);G.lastMinutes=userRes?userRes.minutes:{};G.trainPending=true;G.trainLog=null;
  aiMaintenance();
  if(G.autoTrain)try{autoTrainNow()}catch(e){}
  if(!bye)boardUpdate(userRes,um);
  if(!bye)try{rollFortune(userRes)}catch(e){console.error(e)}
  resolveAuction();
  aiOffers();
  G.date++;
  if(G.date>=cal().length){endSeason();}
  else newAuction();
  save();
}
function applyUserMatch(r,um){
  const c=userClub();const won=(r.home===G.user?r.hg>r.ag:r.ag>r.hg),lost=(r.home===G.user?r.hg<r.ag:r.ag<r.hg);
  for(const id of c.players){const p=G.players[id];if(!p)continue;
    const min=r.minutes[id]||0;
    if(min>0){p.st.j++;const nt=r.ratings[id]||6;p.st.ns=(p.st.ns||0)+nt;p.st.nn=(p.st.nn||0)+1;p.st.min=(p.st.min||0)+min;p.fm.push(+nt.toFixed(1));if(p.fm.length>5)p.fm.shift();p.mo=clamp(p.mo+2+(nt>=7.2?3:nt<6?-3:0),0,100);p.re=clamp(p.re+1,0,100);p.bs=0;p.fi=clamp(r.fit[id]??p.fi,30,100)}
    else if(!p.y&&!p.inj){p.bs++;if(p.bs>=3){p.mo=clamp(p.mo-3,0,100);p.re=clamp(p.re-(ovr(p)>=c.level?3:1),0,100)}}
    if(won)p.mo=clamp(p.mo+2,0,100);if(lost)p.mo=clamp(p.mo-2,0,100);
    p.mo+= (62-p.mo)*.05;p.re+=(55-p.re)*.02;
    if(p.pr){if(min>0)p.pr.got++;if(G.date>=p.pr.until){if(p.pr.got<p.pr.need){p.re=clamp(p.re-25,0,100);p.mo=clamp(p.mo-12,0,100);msg('Promessa quebrada',`${p.n} esperava ser titular e jogou ${p.pr.got} de ${p.pr.need} jogos prometidos. A relação com você despencou.`,{pid:p.id})}else{p.re=clamp(p.re+6,0,100);}p.pr=null}}
    if(p.re<22&&!p.wantOut&&p.woS!==G.season){p.wantOut=true;p.woS=G.season;msg('Pedido de saída',`${p.n} está insatisfeito com você e pediu para ser negociado. Moral baixa derruba o rendimento em campo.`,{pid:p.id})}
    if(p.re>40)p.wantOut=false;
  }
  // bicho (bônus por resultado)
  const B=G.bonus||{win:0,draw:0,goal:0};const myG=r.home===G.user?r.hg:r.ag;const drew=!won&&!lost;
  const played=c.players.filter(id=>(r.minutes[id]||0)>0);
  const per=(won?B.win:drew?B.draw:0);const pay=played.length*per+myG*(B.goal||0)*Math.max(1,played.length*.5);
  if(pay>0){c.money-=Math.round(pay);G.seasonMoney.out+=Math.round(pay);G.lastBonus={paid:Math.round(pay),date:G.date};
    for(const id of played){const p=G.players[id];if(p){p.mo=clamp(p.mo+3,0,100);p.re=clamp(p.re+1,0,100)}}}
  else G.lastBonus=null;
  for(const id of r.scorers||[]){const p=G.players[id];if(p)p.st.g++}
  for(const id of r.assists||[]){const p=G.players[id];if(p)p.st.as++}
  for(const inj of r.injuries||[]){const p=G.players[inj.pid];if(p){p.inj=inj.rounds;p.st.inj=(p.st.inj||0)+1;plog(p,'inj',`Lesão em jogo · fora por ${inj.rounds} jogo(s)`);msg('Lesão',`${p.n} se machucou e deve ficar fora por ${inj.rounds} jogo(s).`,{pid:p.id})}}
  // adversário: créditos simples
  const opp=r.home===G.user?r.away:r.home;const og=r.home===G.user?r.ag:r.hg;creditScorers(opp,0);
  if(r.oppScorers)for(const id of r.oppScorers){const p=G.players[id];if(p)p.st.g++}
  G.history.push({season:G.season,date:G.date,type:um?um.type:'L',home:r.home,away:r.away,hg:r.hg,ag:r.ag,pens:r.pens||null,label:um?um.label:''});
}
function money(n){const s=n<0?'-':'';n=Math.abs(n);const f=(v,d)=>v.toFixed(d).replace(/\.0+$/,'').replace('.',',');if(n>=1e6)return `${s}R$ ${f(n/1e6,n>=1e8?0:1)} M`;if(n>=1e3)return `${s}R$ ${Math.round(n/1e3)} mil`;return `${s}R$ ${Math.round(n)}`}
function payroll(c){return c.players.reduce((s,id)=>s+(G.players[id]?G.players[id].w:0),0)+(c.youth||[]).reduce((s,id)=>s+(G.players[id]?G.players[id].w:0),0)}
function weeklyMoney(um){
  const c=userClub();const L={tv:DIV_TV[c.div],gate:0,wages:-payroll(c),academy:-G.academy.lvl*DIV_TV[c.div]*.06};
  if(um&&um.home===G.user){const [cap,price]=DIV_GATE[c.div];const t=G.table[c.div][G.user];const formBoost=t&&t.f?(t.f.split('V').length-1)*.04:0;
    const fe=facLvl('est'),ft=facLvl('torc');const occ=clamp(.45+formBoost+(um.type==='C'?.2:0)+(ft-1)*.04+gauss()*.05,.25,1);L.gate=Math.round(Math.min(cap*(1+(fe-1)*.25),c.fans*1.4)*occ*price*(1+(fe-1)*.08)*(um.type==='C'?1.5:1));c.fans=Math.round(c.fans*(1+ft*.004))}
  if(facLvl('mkt')>1)L.loja=Math.round(DIV_TV[c.div]*.05*(facLvl('mkt')-1));
  const tot=L.tv+L.gate+L.wages+L.academy+(L.loja||0);c.money+=tot;G.ledger.push({date:G.date,...L,tot});if(G.ledger.length>16)G.ledger.shift();
  G.seasonMoney.in+=L.tv+L.gate+(L.loja||0);G.seasonMoney.out+=-(L.wages+L.academy);
  if(c.money<0)msg('Caixa negativo',`O clube está no vermelho (${money(c.money)}). Venda jogadores no leilão ou a diretoria vai perder a paciência.`);
  for(const d of DIVS)for(const id of G.div[d]){if(id===G.user)continue;const o=G.clubs[id];o.money=Math.round(o.money+DIV_TV[d]*.55+DIV_TV[d]*.25*R())}
}
const TRAIN={
  equilibrado:{n:'Equilibrado',d:'Evolução distribuída e boa recuperação.',attrs:null,fam:2,rec:16},
  fisico:{n:'Físico',d:'Velocidade, aceleração, resistência e força. Cansa mais.',attrs:['vel','ace','res','frc'],fam:1,rec:10},
  tecnico:{n:'Técnico',d:'Passe, drible, cruzamento e visão de jogo.',attrs:['pas','dri','cru','vis'],fam:1,rec:15},
  tatico:{n:'Tático',d:'Entrosamento sobe rápido; posicionamento, decisão e marcação.',attrs:['cpo','dec','mar','vis'],fam:7,rec:15},
  ataque:{n:'Ataque',d:'Finalização, chute de longe, cabeceio e frieza.',attrs:['fin','lon','cab','cmp'],fam:1,rec:14},
  defesa:{n:'Defesa',d:'Desarme, marcação, cabeceio e combatividade.',attrs:['des','mar','cab','agr','cpo'],fam:2,rec:14},
  recuperacao:{n:'Recuperação',d:'Quase não evolui, mas devolve condição física e moral.',attrs:[],fam:0,rec:28,dev:.25}
};
const YTRAIN={equilibrado:null,tecnico:['pas','dri','cru','vis'],fisico:['vel','ace','res','frc'],finalizacao:['fin','lon','cab','cmp'],defesa:['des','mar','cpo','agr'],goleiro:['gol','ref','sai'],bolaparada:['bp','cru','lon']};
function grow(p,delta,focus){
  const w=W[p.p];const keys=Object.keys(w);
  for(const k of keys){const boost=focus&&focus.length?(focus.includes(k)?1.45:.75):1;p.t[k]=clamp(+(p.t[k]+delta/5*boost).toFixed(2),1,20)}
  if(focus)for(const k of focus)if(!w[k])p.t[k]=clamp(+(p.t[k]+Math.abs(delta)/5*.5).toFixed(2),1,20);
}
function devDelta(p,factor){
  const o=ovrFor(p.t,p.p);
  if(p.a<=23&&o<p.pot)return (p.pot-o)*.03*factor;
  if(p.a<=28&&o<p.pot)return (p.pot-o)*.018*factor;
  if(p.a>=31)return -(p.a-30)*.06*rnd(.5,1.4);
  return 0;
}
function trainAndRecover(r){
  const c=userClub();const tf=TRAIN[G.training.focus];const int=G.training.int;const intDev=[.7,1,1.35][int],intRec=[8,0,-8][int];
  G.fam=clamp(G.fam+tf.fam+(int===2?1:0),0,100);
  const log={date:G.date,season:G.season,focus:G.training.focus,int,rows:[],fam:G.fam};
  for(const id of c.players){const p=G.players[id];if(!p)continue;
    const before={...p.t},fi0=p.fi,o0=ovrFor(p.t,p.p);
    const played=(r.minutes[id]||0)>0;let st='treino';
    if(p.inj){st='lesionado';p.fi=clamp(p.fi+4,30,100)}
    else if(p.rest){st='poupado';p.fi=clamp(p.fi+tf.rec+14+p.t.res*.3,30,100);p.mo=clamp(p.mo+1,0,100);p.rest=false}
    else{
      const factor=(tf.dev??1)*intDev*(played?1.35:p.bs>2?.75:1)*(1+(facLvl('ct')-1)*.12);
      const d=devDelta(p,factor);if(d)grow(p,d,tf.attrs);
      if(p.tf&&p.t[p.tf]!=null){ // treino individual
        const room=Math.max(0,(p.pot-o0)/10);const g=(.05+.12*Math.min(1.5,room))*intDev*(p.a<=23?1.3:p.a>=31?.5:1)*(.75+R()*.5);
        p.t[p.tf]=clamp(+(p.t[p.tf]+g).toFixed(2),1,20);p.fi=clamp(p.fi-2,30,100);st='individual'}
      p.fi=clamp(p.fi+tf.rec+intRec+p.t.res*.3,30,100);
      if(int===2&&R()<.025*(1-(facLvl('med')-1)*.15)){p.inj=rint(1,3);p.st.inj=(p.st.inj||0)+1;plog(p,'inj',`Lesão no treino · fora por ${p.inj} jogo(s)`);st='lesionou';msg('Lesão no treino',`${p.n} sentiu no treino pesado: fora por ${p.inj} jogo(s).`,{pid:p.id})}
      if(G.training.focus==='recuperacao')p.mo=clamp(p.mo+2,0,100);
    }
    const dd={};for(const k of ATTR){const x=+(p.t[k]-before[k]).toFixed(2);if(Math.abs(x)>=.01)dd[k]=x}
    log.rows.push({id,st,d:dd,fi:[Math.round(fi0),Math.round(p.fi)],ovr:[Math.round(o0),Math.round(ovrFor(p.t,p.p))],tf:p.tf||null});
    p.v=valueOf(p);
  }
  G.trainLog=log;
}
// descanso natural depois do jogo (sem evolução: evolução só vem do treino feito pelo técnico)
function postMatchRecover(r){const c=userClub();
  const md=facLvl('med');for(const id of c.players){const p=G.players[id];if(!p)continue;if(p.inj){p.inj=Math.max(0,p.inj-(md>=3&&p.inj>1?2:1));p.fi=clamp(p.fi+8+(md-1)*2,30,100)}else p.fi=clamp(p.fi+6+p.t.res*.2+(md-1)*2,30,100)}
  const af=1+G.academy.lvl*.1;const ylog=[];
  for(const id of c.youth||[]){const p=G.players[id];if(!p)continue;const o0=ovr(p),t0={...p.t};const d=devDelta(p,1.05*af*(p.fm.length?1.25:1));grow(p,d,YTRAIN[p.tr]);p.v=valueOf(p);let gain=0;for(const k in p.t)gain+=p.t[k]-(t0[k]||0);ylog.push({id,tr:p.tr||'equilibrado',o:[o0,ovr(p)],g:+gain.toFixed(2)})}
  G.youthLog={date:G.date,season:G.season,af,rows:ylog};
  if(G.academy.scoutCd>0)G.academy.scoutCd--;}
function runTraining(){if(!G.trainPending)throw new Error('O treino desta semana já foi feito. O próximo abre depois do jogo.');
  trainAndRecover({minutes:G.lastMinutes||{}});
  G.trainPending=false;G.trainedAt=G.date;save();return G.trainLog}
// conselho do preparador: o que treinar nesta semana
function trainAdvice(){const c=userClub();const t=G.tactic;const um=nextUserMatch();
  const st=(t&&t.lineup||[]).map(id=>G.players[id]).filter(Boolean);const avgFi=st.length?st.reduce((a,p)=>a+p.fi,0)/st.length:90;
  const tired=c.players.map(id=>G.players[id]).filter(p=>p&&!p.inj&&p.fi<68);
  const mine=(G.history||[]).filter(h=>h.home===G.user||h.away===G.user).slice(-3);
  const gp=mine.reduce((a,h)=>a+(h.home===G.user?h.hg:h.ag),0),gc=mine.reduce((a,h)=>a+(h.home===G.user?h.ag:h.hg),0);
  let opp=null,diff=0;if(um&&um.type!=='BYE'){opp=G.clubs[um.home===G.user?um.away:um.home];diff=teamStrength(opp)-teamStrength(c)}
  const R=[];let focus='equilibrado',int=1;
  if(avgFi<74){focus='recuperacao';int=0;R.push(`Titulares com ${Math.round(avgFi)}% de condição: priorize recuperar.`)}
  else if(G.fam<50){focus='tatico';R.push(`Entrosamento em ${G.fam}%: o time ainda não se entende em campo.`)}
  else if(mine.length&&gc>=mine.length*2){focus='defesa';R.push(`${gc} gols sofridos nos últimos ${mine.length} jogos: arrume a defesa.`)}
  else if(mine.length&&gp<=mine.length*.67){focus='ataque';R.push(`Só ${gp} gol(s) nos últimos ${mine.length} jogos: treine finalização.`)}
  else if(opp&&diff>4){focus='tatico';R.push(`${opp.short} é mais forte (${Math.round(teamStrength(opp))} × ${Math.round(teamStrength(c))}): organização tática ajuda a competir.`)}
  else if(opp&&diff<-4){focus='ataque';int=2;R.push(`${opp.short} é mais fraco: dá para treinar pesado e ir para cima.`)}
  else{focus=avgFi>88?'fisico':'tecnico';R.push(avgFi>88?'Elenco descansado: bom momento para a parte física.':'Semana tranquila: aprimore passe e técnica.')}
  if(avgFi<82&&int===2)int=1;if(avgFi<80&&focus!=='recuperacao')R.push('Condição física média: evite a intensidade pesada.');
  if(tired.length)R.push(`${tired.length} jogador(es) abaixo de 68% de condição: sugiro poupar.`);
  return {focus,int,reasons:R,tired:tired.map(p=>p.id),opp:opp&&opp.short,diff}}
function setIndividual(pid,attr){const p=G.players[pid];if(!p)return;p.tf=attr||null;save()}
/* treino automático: o preparador escolhe foco, intensidade e quem descansa, e treina logo depois do jogo */
function autoTrainNow(){if(!G||!G.autoTrain||!G.trainPending)return null;const a=trainAdvice();G.training=G.training||{focus:'equilibrado',int:1};G.training.focus=a.focus;G.training.int=a.int;
  for(const id of userClub().players){const p=G.players[id];if(p&&!p.inj)p.rest=a.tired.includes(id)}
  const L=runTraining();const ups=(L&&L.rows||[]).filter(r=>Object.values(r.d).some(v=>v>0)).length;G.autoLog={date:G.date,season:G.season,focus:a.focus,int:a.int,fam:L?L.fam:G.fam,ups,rest:a.tired.length};save();return G.autoLog}
function setAutoTrain(on){G.autoTrain=!!on;save();return on?autoTrainNow():null}
function setRest(pid,v){const p=G.players[pid];if(!p)return;p.rest=!!v;save()}
function setBonus(k,v){G.bonus=G.bonus||{win:0,draw:0,goal:0};G.bonus[k]=Math.max(0,Math.round(+v||0));save()}
function aiMaintenance(){
  for(const d of DIVS)for(const id of G.div[d]){if(id===G.user)continue;const c=G.clubs[id];
    for(const pid of c.players){const p=G.players[pid];if(!p)continue;if(p.inj)p.inj--;else if(R()<.012)p.inj=rint(1,3);
      const dd=devDelta(p,.9);if(dd)grow(p,dd,null);p.v=valueOf(p)}
    c.money+=Math.round(DIV_TV[c.div]*.35);
    if(c.money<0&&c.players.length>18){// no vermelho: vende um jogador para quem tem caixa
      const sell=c.players.map(i=>G.players[i]).filter(Boolean).sort((a,b)=>valueOf(b)-valueOf(a))[rint(2,6)];
      const buyers=[];for(const d2 of DIVS)for(const b of G.div[d2])if(b!==id&&b!==G.user&&G.clubs[b].money>valueOf(sell||{})*1.2)buyers.push(b);
      if(sell&&buyers.length){const b=pick(buyers);transfer(sell,id,b,Math.round(valueOf(sell)*rnd(.8,1)/5000)*5000)}}}
}
function boardUpdate(r,um){
  const u=G.user;const myG=r.home===u?r.hg:r.ag,opG=r.home===u?r.ag:r.hg;
  const opp=G.clubs[r.home===u?r.away:r.home];const diff=(teamStrength(opp)-teamStrength(userClub()))/4;
  let dc=myG>opG?3+Math.max(0,diff):myG===opG?(diff>1?1:-1):-3+Math.min(0,diff)*.5;
  if(um&&um.type==='P')dc*=.3;
  const c=userClub();if(c.money<0)dc-=2;
  const pos=sortedTable(c.div).findIndex(x=>x.id===u)+1;if(dateInfo().kind==='L'&&G.date>4){if(pos<=G.board.goalPos)dc+=1;else if(pos>G.board.goalPos+3)dc-=1.5}
  G.board.conf=clamp(Math.round(G.board.conf+dc),0,100);
  if(G.board.conf<=8&&!G.sacked){G.sacked=true;jobOffersFor(true)}
}

/* ---------- base ---------- */
function addYouth(paid){
  const c=userClub();const lvl=G.academy.lvl;const pos=pick(['GOL','LD','ZAG','ZAG','LE','VOL','MC','MEI','MEI','PD','PE','ATA','ATA']);
  const age=rint(15,17);const p=genPlayer(pos,rnd(36,46)+lvl*2+(paid?2:0),age,c.id,{youth:true,potMul:1+lvl*.06+(paid?.08:0)});
  p.pot=clamp(Math.round(p.pot+gauss()*4+lvl*1.5),50,97);G.players[p.id]=p;c.youth.push(p.id);return p;
}
const scoutCost=()=>({A:350e3,B:120e3,C:45e3,D:18e3})[userClub().div];
const academyCost=()=>Math.round((G.academy.lvl)*({A:2.2e6,B:700e3,C:250e3,D:90e3})[userClub().div]);
function scout(){const c=userClub();if(G.academy.scoutCd>0)throw new Error(`Nova peneira em ${G.academy.scoutCd} jogo(s).`);const cost=scoutCost();if(c.money<cost)throw new Error('Caixa insuficiente para a peneira.');
  c.money-=cost;G.academy.scoutCd=4;const a=addYouth(true),b=addYouth(true);save();return [a,b]}
function upgradeAcademy(){const c=userClub();if(G.academy.lvl>=5)throw new Error('A base já está no nível máximo.');const cost=academyCost();if(c.money<cost)throw new Error('Caixa insuficiente.');c.money-=cost;G.academy.lvl++;save()}
function promote(pid){const c=userClub();const p=G.players[pid];c.youth=c.youth.filter(x=>x!==pid);p.y=false;p.w=Math.max(4000,wageOf(p));c.players.push(pid);p.mo=clamp(p.mo+10,0,100);p.re=clamp(p.re+8,0,100);save()}
function demote(pid){const c=userClub();const p=G.players[pid];if(p.a>19)throw new Error('Só jogadores até 19 anos podem voltar para a base.');c.players=c.players.filter(x=>x!==pid);c.youth.push(pid);p.y=true;p.w=1500;G.tactic.lineup=G.tactic.lineup.map(x=>x===pid?null:x);G.tactic.subs=G.tactic.subs.filter(x=>x!==pid);save()}
function release(pid){const c=userClub();const p=G.players[pid];const fee=p.y?0:p.w*4;if(c.money<fee)throw new Error('Caixa insuficiente para a rescisão.');c.money-=fee;c.players=c.players.filter(x=>x!==pid);if(c.youth)c.youth=c.youth.filter(x=>x!==pid);p.c=null;
  G.tactic.lineup=G.tactic.lineup.map(x=>x===pid?null:x);G.tactic.subs=G.tactic.subs.filter(x=>x!==pid);G.freeAgents=G.freeAgents||[];G.freeAgents.push(pid);save();return fee}

/* ---------- conversas ---------- */
function talk(pid,kind){
  const p=G.players[pid];if(p.tk===G.date)throw new Error(`Você já conversou com ${p.n} nesta semana.`);p.tk=G.date;
  const f=formAvg(p)||6.5;let txt='';
  if(kind==='elogiar'){if(f>=6.9){p.mo+=8;p.re+=5;txt=`${p.n} gostou do reconhecimento.`}else if(f<6.3){p.re-=3;txt=`${p.n} achou o elogio forçado: ele sabe que não vem jogando bem.`}else{p.mo+=4;p.re+=2;txt=`${p.n} agradeceu a confiança.`}}
  if(kind==='cobrar'){if(f<6.5){if(R()<.6){p.mo+=6;txt=`${p.n} aceitou a cobrança e promete reagir.`}else{p.re-=8;p.mo-=5;txt=`${p.n} não gostou da cobrança na frente do grupo.`}}else{p.re-=10;p.mo-=8;txt=`${p.n} achou a cobrança injusta: vinha bem.`}}
  if(kind==='prometer'){if(p.pr)throw new Error('Já existe uma promessa em andamento.');p.pr={until:G.date+4,need:3,got:0};p.re+=8;p.mo+=6;txt=`Você prometeu a ${p.n} ao menos 3 jogos nos próximos 4. Ele confia em você — não quebre a promessa.`}
  if(kind==='tranquilizar'){if(p.bs>=2){p.re+=4;txt=`${p.n} entendeu que a vez dele vai chegar.`}else{p.mo+=2;txt=`${p.n} disse que está tudo bem.`}}
  p.mo=clamp(p.mo,0,100);p.re=clamp(p.re,0,100);save();return txt;
}
const moodText=p=>{const m=(p.mo+p.re)/2;return m>=80?'Muito feliz':m>=65?'Feliz':m>=48?'Normal':m>=32?'Insatisfeito':'Quer sair'};
const relText=r=>r>=80?'Fã do técnico':r>=62?'Confia em você':r>=45?'Profissional':r>=28?'Desconfiado':'Em conflito';

/* ---------- leilão: um jogador por vez, lance fechado, maior lance leva ---------- */
function interestIn(club,p){
  const o=ovr(p);const pot=p.pot;const lvl=club.level;
  let fit=0;if(o>=lvl-3)fit=1+(o-lvl)*.06;else if(p.a<=21&&pot>=lvl+2)fit=.8+(pot-lvl)*.03;else return 0;
  if(club.money<p.v*.5)return 0;
  return fit*rnd(.6,1.25);
}
function aiBids(lot){
  const p=G.players[lot.pid];const bids=[];
  const base=valueOf(p);
  for(const d of DIVS)for(const id of G.div[d]){if(id===G.user||id===lot.seller)continue;const c=G.clubs[id];const it=interestIn(c,p);if(!it)continue;
    let max=base*clamp(.65+it*.45,.6,1.6)*(1+Math.max(0,p.pot-ovr(p))/60);max=Math.min(max,c.money*.45);
    if(max<lot.min)continue;if(R()<.45)continue;
    bids.push({club:id,amt:Math.round(max/5000)*5000})}
  return bids.sort((a,b)=>b.amt-a.amt).slice(0,6);
}
function lotFrom(pid,seller,minMul){const p=G.players[pid];const min=Math.max(10000,Math.round(valueOf(p)*minMul/5000)*5000);
  return {pid,seller,min,suggest:Math.round(min*1.15/5000)*5000,bids:null,userBid:null,done:false,winner:null,price:0}}
function newAuction(){
  const lots=[];const all=[];const ui=DIVS.indexOf(userClub().div);for(const d of DIVS)if(Math.abs(DIVS.indexOf(d)-ui)<=1)for(const id of G.div[d])if(id!==G.user)all.push(id);const ulv=userClub().level;
  // só alguns jogadores ficam disponíveis: clubes listam reservas e jogadores que querem sair
  const special=!!G.specialAuction;G.specialAuction=false;
  const n=special?rint(9,11):rint(5,7);const tried=new Set();
  if(special){// estrelas de clubes de todas as séries, com lance mínimo alto
    const stars=[];for(const d of DIVS)for(const cid of G.div[d])if(cid!==G.user)for(const id of G.clubs[cid].players){const p=G.players[id];if(p&&!p.inj&&ovr(p)>=ulv+2)stars.push(p)}
    shuffle(stars).sort((a,b)=>ovr(b)-ovr(a)).slice(0,12);for(const p of shuffle(stars.slice(0,14)).slice(0,4)){if(G.clubs[p.c].players.length<=18)continue;const L=lotFrom(p.id,p.c,rnd(.85,1.05));L.star=true;lots.push(L)}}
  while(lots.length<n&&tried.size<60){const cid=pick(all);tried.add(cid+lots.length);const c=G.clubs[cid];if(c.players.length<=18)continue;
    const cand=c.players.map(x=>G.players[x]).filter(p=>p&&!p.inj).sort((a,b)=>ovr(a)-ovr(b));
    const fit=cand.filter(p=>ovr(p)>=ulv-7||p.a<=21&&p.pot>=ulv);const p=pick(fit.length?fit:cand);if(!p||lots.some(l=>l.pid===p.id))continue;lots.push(lotFrom(p.id,cid,rnd(.6,.85)))}
  // jogador livre / promessa sem clube

  // jogadores que o usuário colocou à venda
  for(const pid of (G.toSell||[])){const p=G.players[pid];if(p&&p.c===G.user)lots.unshift({...lotFrom(pid,G.user,0),min:p.reserve||Math.round(valueOf(p)*.7/5000)*5000,mine:true})}
  G.toSell=[];
  G.auction={date:G.date,lots:shuffle(lots.filter(l=>!l.mine)).concat([]),cursor:0,special};
  if(special)msg('✨ Leilão especial de pré-temporada',`Abriu a janela! Este leilão tem ${lots.length} jogadores, ${lots.filter(l=>l.star).length} deles estrelas de outros clubes. Só acontece na virada da temporada.`);
  G.auction.lots=[...lots.filter(l=>l.mine),...G.auction.lots];
}
function listForSale(pid,reserve){const p=G.players[pid];if(p.c!==G.user)throw new Error('Jogador não é do seu clube.');G.toSell=G.toSell||[];if(G.toSell.includes(pid))throw new Error('Já está na fila do próximo leilão.');p.reserve=reserve;G.toSell.push(pid);
  // se o leilão da semana ainda não começou, entra já
  if(G.auction&&G.auction.cursor===0&&!G.auction.lots.some(l=>l.pid===pid)){G.auction.lots.unshift({...lotFrom(pid,G.user,0),min:reserve,mine:true});G.toSell=G.toSell.filter(x=>x!==pid)}
  save()}
function closeLot(i,userAmt){
  const lot=G.auction.lots[i];if(lot.done)return lot;
  const p=G.players[lot.pid];lot.bids=aiBids(lot);
  if(userAmt&&!lot.mine){const c=userClub();if(userAmt>c.money)throw new Error('Seu lance passa do caixa disponível.');if(userAmt<lot.min)throw new Error(`O lance mínimo é ${money(lot.min)}.`);lot.userBid=userAmt;lot.bids.push({club:G.user,amt:userAmt,you:true})}
  lot.bids.sort((a,b)=>b.amt-a.amt||(a.you?-1:1));
  lot.done=true;const top=lot.bids[0];
  if(top&&top.amt>=lot.min){lot.winner=top.club;lot.price=top.amt;transfer(p,lot.seller,top.club,top.amt)}
  G.auctionHistory.unshift({date:G.date,season:G.season,pid:p.id,name:p.n,pos:p.p,ovr:ovr(p),seller:lot.seller,winner:lot.winner,price:lot.price,bids:lot.bids.slice(0,6)});
  G.auctionHistory=G.auctionHistory.slice(0,60);
  if(lot.mine){if(lot.winner)msg('Vendido no leilão',`${p.n} foi para o ${G.clubs[lot.winner].name} por ${money(lot.price)}.`);else msg('Sem lance',`Ninguém cobriu o mínimo de ${money(lot.min)} por ${p.n}. Ele continua no elenco.`)}
  G.auction.cursor=Math.max(G.auction.cursor,i+1);save();return lot;
}
function transfer(p,from,to,price){
  if(from&&G.clubs[from]){const f=G.clubs[from];f.players=f.players.filter(x=>x!==p.id);if(f.youth)f.youth=f.youth.filter(x=>x!==p.id);f.money+=price;if(from===G.user){G.seasonMoney.in+=price;G.tactic.lineup=G.tactic.lineup.map(x=>x===p.id?null:x);G.tactic.subs=G.tactic.subs.filter(x=>x!==p.id)}}
  plog(p,'transf',`${from&&G.clubs[from]?G.clubs[from].short:'Sem clube'} → ${G.clubs[to].short}${price?' por '+money(price):''}`);
  if(from&&G.clubs[from])(G.xfer=G.xfer||[]).push({pid:p.id,name:p.n,pos:p.p,ovr:ovr(p),from,to,price});
  const t=G.clubs[to];t.players.push(p.id);t.money-=price;p.c=to;p.y=false;p.w=Math.max(p.w,wageOf(p));p.mo=clamp(p.mo+8,0,100);p.re=55;p.bs=0;p.pr=null;p.wantOut=false;p.fn=null;
  if(to===G.user){G.seasonMoney.out+=price;msg('Reforço contratado',`${p.n} (${p.p}, ${ovr(p)}) chegou por ${money(price)}. Salário: ${money(p.w)} por jogo.`,{pid:p.id})}
  if(G.freeAgents)G.freeAgents=G.freeAgents.filter(x=>x!==p.id);
}
function resolveAuction(){if(!G.auction)return;G.auction.lots.forEach((l,i)=>{if(!l.done)closeLot(i,null)})}
/* propostas diretas por jovens que se destacam */
function aiOffers(){
  G.offers=(G.offers||[]).filter(o=>o.until>G.date&&G.players[o.pid]&&G.players[o.pid].c===G.user);
  const c=userClub();
  for(const id of [...c.players,...(c.youth||[])]){const p=G.players[id];if(!p||p.a>23)continue;const f=formAvg(p);
    if(G.offers.some(o=>o.pid===id))continue;
    const chance=(p.pot-ovr(p)>8?.04:0)+(f>=7?.08:0)+(p.y?.02:0);if(R()>chance)continue;
    const buyers=[];for(const d of DIVS)for(const cid of G.div[d])if(cid!==G.user&&G.clubs[cid].money>p.v)buyers.push(cid);if(!buyers.length)continue;
    const b=pick(buyers);const amt=Math.round(valueOf(p)*rnd(.9,1.4)/5000)*5000;
    const oid='of'+id+'-'+G.date;G.offers.push({id:oid,pid:id,club:b,amt,until:G.date+2});
    msg('Proposta recebida',`${G.clubs[b].name} oferece ${money(amt)} por ${p.n} (${p.a} anos, ${ovr(p)} hoje, potencial ${p.pot}). Vale por 2 jogos.`,{pid:id,offer:true,offerId:oid,thread:[{w:'them',t:`Queremos ${p.n}. Oferecemos ${money(amt)}. Aguardamos sua resposta.`}]});
  }
}
function answerOffer(oid,accept){const i=G.offers.findIndex(o=>o.id===oid);if(i<0)throw new Error('Proposta expirada.');const o=G.offers[i];G.offers.splice(i,1);
  const p=G.players[o.pid];const cl=G.clubs[o.club];const m=G.inbox.find(x=>x.offerId===o.id)||G.inbox.find(x=>x.offer&&x.pid===o.pid);const th=m?(m.thread=m.thread||[]):[];
  let res;
  if(accept){transfer(p,G.user,o.club,o.amt);th.push({w:'you',t:`Aceito ${money(o.amt)} por ${p.n}.`},{w:'them',t:pick([`Negócio fechado! ${p.n} se apresenta amanhã no ${cl.short}. Obrigado pela parceria.`,`Perfeito. O dinheiro já está na conta do ${userClub().short}. Boa sorte na temporada!`])});res={ok:true,txt:`${p.n} vendido ao ${cl.short} por ${money(o.amt)}.`};msg('Negócio fechado',`${p.n} vendido ao ${cl.name} por ${money(o.amt)}.`,{pid:p.id,thread:[...th],done:'ok'})}
  else{p.mo=clamp(p.mo-3,0,100);th.push({w:'you',t:`Recuso. ${p.n} não está à venda por ${money(o.amt)}.`});
    if(!o.last&&R()<.45&&p.c===G.user){const amt=Math.round(o.amt*rnd(1.12,1.3)/5000)*5000;const no={id:'of'+p.id+'-'+G.date+'b',pid:p.id,club:o.club,amt,until:G.date+2,last:true};G.offers.push(no);
      th.push({w:'them',t:`Entendemos. Subimos para ${money(amt)} — é a nossa última oferta por ${p.n}.`});msg('Nova proposta',`O ${cl.name} voltou à mesa: agora oferece ${money(amt)} por ${p.n}.`,{pid:p.id,offer:true,offerId:no.id,thread:[...th]});res={ok:false,txt:`O ${cl.short} voltou com ${money(amt)}!`}}
    else{th.push({w:'them',t:pick([`Que pena. Vamos procurar outras opções no mercado.`,`Entendido. Se mudar de ideia, sabe onde nos encontrar.`])});res={ok:false,txt:`Proposta do ${cl.short} recusada.`}}
    if(p.a<=23)th.push({w:'pl',t:pick([`${p.n}: "Fico feliz que o clube confia em mim."`,`${p.n}: "Era uma chance boa... mas sigo focado aqui."`])})}
  if(m){m.done=accept?'ok':'no';m.read=true}
  save();return res}
function buyFromAuctionAllowed(){return true}
/* ---------- propostas por jogadores de outros clubes ---------- */
function askPrice(p){const c=G.clubs[p.c];const ranked=c.players.map(i=>G.players[i]).filter(Boolean).sort((a,b)=>ovr(b)-ovr(a));const rk=ranked.findIndex(x=>x.id===p.id);
  let m=rk<11?1.45:rk<16?1.15:.95;if(p.a<=22&&p.pot-ovr(p)>=6)m*=1.2;if(p.wantOut)m*=.85;if(c.players.length<=18)m*=1.25;return Math.round(valueOf(p)*m/5000)*5000}
function makeOffer(pid,amt,wage){
  const p=G.players[pid];const u=userClub();if(!p||!p.c||p.c===G.user)throw new Error('Jogador indisponível.');
  G.offersOut=G.offersOut||{};const prev=G.offersOut[pid];
  if(prev&&prev.date===G.date&&prev.status==='rejected')throw new Error(`O ${G.clubs[p.c].short} já recusou uma proposta por ${p.n} nesta semana.`);
  amt=Math.round(amt/1000)*1000;wage=Math.round(wage/500)*500;
  if(amt>u.money)throw new Error('Sua proposta passa do caixa disponível.');
  const ask=prev&&prev.date===G.date&&prev.ask?prev.ask:askPrice(p);
  const minWage=Math.round(p.w*(G.clubs[p.c].div<u.div?1.25:1.05)/500)*500;
  let r;
  if(amt>=ask){if(wage<minWage)r={status:'wage',ask,minWage,msg:`O ${G.clubs[p.c].short} aceita os ${money(amt)}, mas ${p.n} quer ganhar pelo menos ${money(minWage)} por jogo.`};
    else{p.w=wage;transfer(p,p.c,G.user,amt);p.w=wage;r={status:'accepted',ask,msg:`Negócio fechado! ${p.n} é do ${u.name} por ${money(amt)}.`}}}
  else if(amt>=ask*.8)r={status:'counter',ask,minWage,msg:`O ${G.clubs[p.c].short} recusou ${money(amt)} e pede ${money(ask)}. Salário mínimo do jogador: ${money(minWage)}.`};
  else r={status:'rejected',ask:null,msg:`O ${G.clubs[p.c].short} recusou na hora. Proposta muito abaixo do que eles esperam.`};
  G.offersOut[pid]={date:G.date,status:r.status,ask:r.ask,amt};
  {let m=G.inbox.find(x=>x.neg===pid&&x.season===G.season);if(!m){msg(`Negociação: ${p.n}`,'',{pid,neg:pid,thread:[]});m=G.inbox[0]}else{G.inbox.splice(G.inbox.indexOf(m),1);G.inbox.unshift(m)}
    const cl=G.clubs[p.c]||u;m.read=false;m.date=G.date;m.thread.push({w:'you',t:`Ofereço ${money(amt)} + salário de ${money(wage)} por jogo.`},{w:'them',t:(r.status==='accepted'?'✅ ':r.status==='rejected'?'❌ ':'↩️ ')+r.msg});
    m.body=r.status==='accepted'?`${p.n} contratado.`:r.status==='counter'?`O clube pede ${money(r.ask)}.`:r.status==='wage'?`Valor aceito; falta acertar o salário.`:'Proposta recusada.';m.done=r.status==='accepted'?'ok':r.status==='rejected'?'no':null}
  save();return r;
}
function searchPlayers(f){const out=[];const lv=userClub().level;
  for(const d of DIVS){if(f.div&&f.div!==d)continue;for(const cid of G.div[d]){if(cid===G.user)continue;for(const id of G.clubs[cid].players){const p=G.players[id];if(!p)continue;
    if(f.pos&&f.pos!=='all'&&(f.pos.length===1?GROUP[p.p]!==f.pos:p.p!==f.pos))continue;if(f.max&&valueOf(p)>f.max)continue;if(f.age&&p.a>f.age)continue;if(f.q&&!p.n.toLowerCase().includes(f.q.toLowerCase()))continue;
    if(f.min&&ovr(p)<+f.min)continue;if(f.hot&&!(formAvg(p)>=7||p.st.g>=3||p.st.as>=3))continue;if(f.young&&!(p.a<=21&&p.pot-ovr(p)>=6))continue;out.push(p)}}}
  const K={ovr:p=>ovr(p),g:p=>p.st.g*100+p.st.as,as:p=>p.st.as*100+p.st.g,nota:p=>p.st.j?formAvg(p):0,pot:p=>p.pot,val:p=>-valueOf(p),age:p=>-p.a,j:p=>p.st.j}[f.sort||'ovr']||(p=>ovr(p));
  return out.sort((a,b)=>K(b)-K(a)||ovr(b)-ovr(a)).slice(0,f.limit||40)}

/* ---------- fim de temporada ---------- */
function endSeason(){
  const u=G.user;const summary={season:G.season,moves:[],club:u};
  G.prevTables={};for(const d of DIVS)G.prevTables[d]=sortedTable(d).map(x=>x.id);
  for(const p of Object.values(G.players)){if(!p.st||!p.c)continue;(p.hist=p.hist||[]).push({s:G.season,c:G.clubs[p.c]?G.clubs[p.c].short:'—',cid:p.c,j:p.st.j||0,g:p.st.g||0,as:p.st.as||0,n:p.st.nn?+(p.st.ns/p.st.nn).toFixed(2):0,inj:p.st.inj||0,yc:p.cards||0,o:ovr(p)});if(p.hist.length>20)p.hist.shift()}
  const champ={};
  const up={},down={};
  for(let i=0;i<DIVS.length;i++){const d=DIVS[i];const t=sortedTable(d);champ[d]=t[0].id;
    const nm=t.length>=20?4:3;if(i>0)up[d]=t.slice(0,nm).map(x=>x.id);if(i<3)down[d]=t.slice(-(G.div[DIVS[i+1]]&&G.div[DIVS[i+1]].length>=20?4:3)).map(x=>x.id);
    if(G.div[d].includes(u))summary.pos=t.findIndex(x=>x.id===u)+1,summary.div=d;
    t.forEach((r,j)=>{const c=G.clubs[r.id];const prize=DIV_PRIZE[d]*Math.max(.1,1-j*.075);c.money+=prize;if(r.id===u){summary.prize=prize}})}
  for(let i=0;i<DIVS.length;i++){const d=DIVS[i];
    if(up[d]){const nd=DIVS[i-1];G.div[d]=G.div[d].filter(x=>!up[d].includes(x));G.div[nd].push(...up[d]);up[d].forEach(x=>{G.clubs[x].div=nd;summary.moves.push([x,d,nd])})}
    if(down[d]){const nd=DIVS[i+1];G.div[d]=G.div[d].filter(x=>!down[d].includes(x));G.div[nd].push(...down[d]);down[d].forEach(x=>{G.clubs[x].div=nd;summary.moves.push([x,d,nd])})}}
  // nível dos clubes acompanha a divisão aos poucos
  for(const d of DIVS)for(const id of G.div[d]){const c=G.clubs[id];const [lo,hi]=DIV_LEVEL[d];c.level=Math.round(clamp(c.level*.6+((lo+hi)/2)*.4,lo-4,hi+4))}
  summary.recap=seasonRecap(champ,up,down);
  summary.champ=champ;summary.cup=G.cup.champion;summary.cupOut=G.cup.out[u]||(G.cup.champion===u?'Campeão':'');
  // avaliação da diretoria
  const met=summary.pos<=G.board.goalPos;const cupStage=G.cup.champion===u?4:G.cup.out[u]?CUP_NAMES.indexOf(G.cup.out[u]):0;
  G.board.conf=clamp(G.board.conf+(met?15:-15)+(cupStage>=2?6:0),0,100);
  summary.met=met;summary.conf=G.board.conf;
  if(champ[summary.div]===u)celebrate('liga',`Campeão da Série ${summary.div} ${G.season}`,`Prêmio de ${money(summary.prize||0)} no caixa`);
  if(summary.prize)msg('💰 Premiação da liga',`${summary.pos}º lugar na Série ${summary.div}: ${money(summary.prize)} entraram no caixa.`);
  {const mv=summary.moves.find(m=>m[0]===u);if(mv&&DIVS.indexOf(mv[2])<DIVS.indexOf(mv[1]))celebrate('acesso',`Acesso à Série ${mv[2]}`,`${userClub().name} sobe de divisão em ${G.season}!`)}
  // envelhecimento, aposentadoria, base
  for(const p of Object.values(G.players)){p.a++;p.cards=0;}
  for(const d of DIVS)for(const id of G.div[d]){const c=G.clubs[id];
    c.players=c.players.filter(pid=>{const p=G.players[pid];if(!p)return false;if(p.a>=35&&R()<.6||p.a>=37){if(id===u)summary.retired=(summary.retired||[]).concat(p.n);delete G.players[pid];return false}return true});
    if(id!==u){while(c.players.length<22){const pos=pick(SQUAD);const pl=genPlayer(pos,c.level+gauss()*3,rint(17,22),id);G.players[pl.id]=pl;c.players.push(pl.id)}}}
  const c=userClub();
  // jovens com 19+ sobem automaticamente
  for(const pid of (c.youth||[]).slice()){const p=G.players[pid];if(p&&p.a>=19){promote(pid);summary.promoted=(summary.promoted||[]).concat(p.n)}}
  for(let i=0;i<2+G.academy.lvl%3;i++)addYouth(false);
  // limpa jogadores livres antigos
  if(G.freeAgents)for(const pid of G.freeAgents){delete G.players[pid]}G.freeAgents=[];
  for(const pid in G.players){const p=G.players[pid];if(!p.c&&!(G.auction&&G.auction.lots.some(l=>l.pid==pid)))delete G.players[pid]}
  // convites de clubes maiores
  summary.market=seasonMarket();
  const over=G.board.goalPos-summary.pos;jobOffersFor(false,over,cupStage);
  {const seen=new Set();const all=[...(G.xfer||[]),...(summary.market||[])].filter(x=>{const key=x.pid+'|'+x.from+'|'+x.to;if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>b.price-a.price);summary.recap.xfers=all.slice(0,10);summary.recap.nx=all.length;G.xfer=[]}
  G.seasonLog.push(summary);G.lastSummary=summary;G.season++;G.seasonMoney={in:0,out:0};
  G.specialAuction=true;startSeason(false);
}

/* ---------- resumão da temporada ---------- */
function hashS(t){let h=2166136261;for(const ch of String(t))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
function coachOf(id){if(id===G.user)return G.manager||'Você';const c=G.clubs[id];if(!c)return '—';if(!c.coach){const h=hashS(id+'#coach');c.coach=D.first[h%D.first.length]+' '+D.last[(h>>>8)%D.last.length]}return c.coach}
function seasonRecap(champ,up,down){
  const ps=Object.values(G.players).filter(p=>p.c&&G.clubs[p.c]&&p.st);
  const rt=p=>p.st.nn?p.st.ns/p.st.nn:0;const maxJ=Math.max(1,...ps.map(p=>p.st.j||0));const minJ=Math.max(4,Math.round(maxJ*.45));
  const card=(p,x)=>p?Object.assign({id:p.id,n:p.n,p:p.p,a:p.a,c:p.c,o:ovr(p),j:p.st.j||0,g:p.st.g||0,as:p.st.as||0,r:+rt(p).toFixed(2)},x||{}):null;
  const dw=d=>({A:1.15,B:1,C:.9,D:.8})[G.clubs[d.c].div]||1;
  const reg=ps.filter(p=>(p.st.j||0)>=minJ&&p.st.nn);
  const score=p=>(rt(p)*dw(p)+(p.st.g||0)*.035+(p.st.as||0)*.025);
  const mvp=reg.slice().sort((a,b)=>score(b)-score(a))[0];
  const scorers=ps.slice().sort((a,b)=>(b.st.g||0)-(a.st.g||0)||(b.st.as||0)-(a.st.as||0)).slice(0,5).filter(p=>p.st.g>0).map(p=>card(p));
  const assist=ps.slice().sort((a,b)=>(b.st.as||0)-(a.st.as||0)||(b.st.g||0)-(a.st.g||0))[0];
  const gk=reg.filter(p=>p.p==='GOL').sort((a,b)=>rt(b)*dw(b)-rt(a)*dw(a))[0];
  const young=reg.filter(p=>p.a<=21).sort((a,b)=>score(b)-score(a))[0];
  const slots=['GOL','LD','ZAG','ZAG','LE','VOL','MC','MEI','PE','ATA','PD'];const used=new Set();
  const xi=slots.map(pos=>{const alt={MC:['MC','VOL','MEI'],MEI:['MEI','MC'],VOL:['VOL','MC'],PE:['PE','PD','ATA'],PD:['PD','PE','ATA'],ATA:['ATA']}[pos]||[pos];
    const p=reg.filter(q=>!used.has(q.id)&&alt.includes(q.p)).sort((a,b)=>score(b)-score(a))[0];if(p){used.add(p.id);return card(p,{slot:pos})}return null});
  const teams=[];for(const d of DIVS){const t=sortedTable(d);t.forEach((r,i)=>teams.push({id:r.id,d,pos:i+1,pts:r.pts,gp:r.gp,gc:r.gc,j:r.j,v:r.v}))}
  const att=teams.slice().sort((a,b)=>b.gp/b.j-a.gp/a.j)[0],def=teams.slice().sort((a,b)=>a.gc/a.j-b.gc/b.j)[0];
  const unb=teams.slice().sort((a,b)=>(b.pts/(b.j*3))-(a.pts/(a.j*3)))[0];
  const coaches=[];for(const d of DIVS){const byLv=G.div[d].slice().sort((a,b)=>teamStrength(G.clubs[b])-teamStrength(G.clubs[a]));
    for(const t of teams.filter(x=>x.d===d)){const exp=byLv.indexOf(t.id)+1;const gain=exp-t.pos+(t.pos===1?3:0)+(DIVS.indexOf(d)===0?1.5:0);coaches.push({id:t.id,d,coach:coachOf(t.id),pos:t.pos,exp,gain})}}
  coaches.sort((a,b)=>b.gain-a.gain);
  const runner={};for(const d of DIVS)runner[d]=sortedTable(d)[1].id;
  let cupF=null;const fr=(G.cup.results||[])[CUP_NAMES.length-1];if(fr&&fr[0]){const t=fr[0];cupF={h:t.h,a:t.a,gh:t.gh,ga:t.ga,pens:t.pens||null,w:t.w}}
  return {season:G.season,champ,runner,up,down,cup:G.cup.champion,cupF,mvp:card(mvp),scorers,assist:card(assist),gk:card(gk),young:card(young),xi,
    att:att&&{id:att.id,gp:att.gp,j:att.j,d:att.d},def:def&&{id:def.id,gc:def.gc,j:def.j,d:def.d},best:unb&&{id:unb.id,pts:unb.pts,j:unb.j,d:unb.d,v:unb.v},coaches:coaches.slice(0,3)}}
function jobOffersFor(sacked,over=0,cupStage=0){
  const u=G.user;const cur=DIVS.indexOf(userClub().div);const offers=[];
  if(sacked){const pool=[...G.div[DIVS[Math.min(3,cur+1)]],...G.div[DIVS[cur]]].filter(x=>x!==u);shuffle(pool);G.jobOffers={sacked:true,list:pool.slice(0,3)};
    msg('Demitido','A diretoria perdeu a confiança e encerrou seu trabalho. Há clubes interessados — escolha seu próximo desafio.');return}
  if(over>=2||cupStage>=3||(over>=0&&cur>0&&R()<.4)){
    const target=DIVS[Math.max(0,cur-1)];const pool=G.div[target].filter(x=>x!==u).sort((a,b)=>G.clubs[b].level-G.clubs[a].level);
    const n=over>=4||cupStage>=3?3:over>=2?2:1;const list=shuffle(pool.slice(Math.max(0,pool.length-8))).slice(0,n);
    if(list.length){G.jobOffers={sacked:false,list};msg('Convites na mesa',`Sua campanha chamou atenção: ${list.map(x=>G.clubs[x].name).join(', ')} querem você. Aceite um convite ou continue o projeto.`)}}
}
function acceptJob(clubId){G.jobOffers=null;G.sacked=false;takeOver(clubId,false);validateLineup();newAuction();save()}
function declineJobs(){if(G.sacked)throw new Error('Você foi demitido: escolha um dos clubes.');G.jobOffers=null;save()}

/* ---------- celebrações (tela de campeão) ---------- */
function celebrate(k,title,sub){G.celeQ=G.celeQ||[];G.celeQ.push({k,title,sub,season:G.season,club:G.user})}
function trophies(){const out=[];for(const s of G.seasonLog||[]){const u=s.club||G.user;
    if(s.champ&&s.div&&s.champ[s.div]===u)out.push({season:s.season,k:'liga',t:`Série ${s.div}`,club:u});
    const cw=(G.cupWins||[]).find(x=>x.season===s.season);if(cw?true:s.cup===u)out.push({season:s.season,k:'taca',t:'Taça Nacional',club:cw?cw.club:u});
    const mv=(s.moves||[]).find(m=>m[0]===u);if(mv&&DIVS.indexOf(mv[2])<DIVS.indexOf(mv[1]))out.push({season:s.season,k:'acesso',t:`Acesso à Série ${mv[2]}`,club:u})}
  for(const cw of (G.cupWins||[]))if(!(G.seasonLog||[]).some(s=>s.season===cw.season))out.push({season:cw.season,k:'taca',t:'Taça Nacional',club:cw.club});
  if(!(G.cupWins||[]).length&&G.cup&&G.cup.champion===G.user&&!(G.seasonLog||[]).some(s=>s.season===G.season))out.push({season:G.season,k:'taca',t:'Taça Nacional',club:G.user});
  return out.sort((a,b)=>b.season-a.season)}
/* ---------- mercado da virada de temporada: clubes se reforçam entre si ---------- */
function seasonMarket(){const moves=[];const all=[];for(const d of DIVS)for(const id of G.div[d])if(id!==G.user)all.push(id);
  for(let k=0;k<40&&moves.length<14;k++){const buyer=pick(all);const bc=G.clubs[buyer];const bi=DIVS.indexOf(bc.div);
    const pool=all.filter(x=>x!==buyer&&DIVS.indexOf(G.clubs[x].div)>=bi&&G.clubs[x].players.length>18);if(!pool.length)continue;const sc=pick(pool);
    const cand=G.clubs[sc].players.map(i=>G.players[i]).filter(p=>p&&!p.inj&&ovr(p)>=bc.level-2).sort((a,b)=>ovr(b)-ovr(a));const p=cand[rint(0,Math.min(3,cand.length-1))];if(!p)continue;
    const price=Math.round(valueOf(p)*rnd(1,1.5)/5000)*5000;if(bc.money<price*.6)continue;
    transfer(p,sc,buyer,price);moves.push({pid:p.id,name:p.n,pos:p.p,ovr:ovr(p),from:sc,to:buyer,price})}
  moves.sort((a,b)=>b.price-a.price);if(moves.length)msg('🔁 Janela de transferências',`Mercado agitado na virada: ${moves.slice(0,3).map(m=>`${m.name} (${G.clubs[m.from].short} → ${G.clubs[m.to].short}, ${money(m.price)})`).join('; ')}${moves.length>3?` e mais ${moves.length-3} negócios`:''}.`);
  return moves}
/* ---------- sorte ou revés: um acontecimento depois de cada jogo ---------- */
const FORT={
  camisas:{good:1,ic:'👕',t:'Camisas esgotadas',make:(c,x)=>{const v=Math.round(x.tv*.5/1000)*1000;return {d:`A loja do clube vendeu todo o estoque depois do jogo. Lucro extra de ${money(v)}.`,v}},go:(f,c)=>{c.money+=f.v;G.seasonMoney.in+=f.v;return `+${money(f.v)} no caixa`}},
  vaquinha:{good:1,ic:'🤲',t:'Vaquinha da torcida',make:(c,x)=>{const v=Math.round(x.tv*.3/1000)*1000;return {d:`A torcida organizada fez uma vaquinha para ajudar o clube: ${money(v)}. O elenco ficou motivado.`,v}},go:(f,c)=>{c.money+=f.v;G.seasonMoney.in+=f.v;squad(c).forEach(p=>p.mo=clamp(p.mo+3,0,100));return `+${money(f.v)} · moral do elenco +3`}},
  joia:{good:1,ic:'💎',t:'Joia na base',make:(c,x)=>{const y=(c.youth||[]).map(i=>G.players[i]).filter(Boolean);const p=y.length?pick(y):null;return p?{d:`Os olheiros não param de falar de ${p.n} (${p.a} anos, ${p.p}). O potencial dele subiu.`,pid:p.id}:null},go:(f,c)=>{const p=G.players[f.pid];if(p){p.pot=Math.min(99,p.pot+rint(3,6))}return `Potencial de ${p?p.n:'?'} agora ${p?p.pot:'?'}`}},
  treino:{good:1,ic:'🔥',t:'Treino inspirado',make:(c,x)=>{const p=pick(squad(c).filter(p=>!p.inj));return p?{d:`${p.n} ficou depois do treino batendo bola e evoluiu.`,pid:p.id}:null},go:(f,c)=>{const p=G.players[f.pid];if(!p)return '';const ks=Object.keys(p.t);const k=pick(ks);p.t[k]=Math.min(20,p.t[k]+1);return `${p.n}: ${ATTR_LABEL[k]||k} +1`}},
  fairplay:{good:1,ic:'🕊️',t:'Prêmio fair play',make:(c,x)=>{const v=Math.round(x.tv*.25/1000)*1000;return {d:`A federação premiou o clube pela disciplina: ${money(v)}.`,v}},go:(f,c)=>{c.money+=f.v;G.seasonMoney.in+=f.v;return `+${money(f.v)} no caixa`}},
  convocado:{good:1,ic:'🇧🇷',t:'Convocação',make:(c,x)=>{const p=squad(c).filter(p=>!p.inj).sort((a,b)=>ovr(b)-ovr(a))[0];return p?{d:`${p.n} foi convocado para a seleção! Moral lá em cima, mas volta cansado da viagem.`,pid:p.id}:null},go:(f,c)=>{const p=G.players[f.pid];if(!p)return '';p.mo=clamp(p.mo+12,0,100);p.fi=clamp(p.fi-15,30,100);c.fans=Math.round(c.fans*1.02);return `${p.n}: moral +12, condição −15% · torcida +2%`}},
  bets:{good:1,ic:'📢',t:'Patrocínio na mesa',make:(c,x)=>{const v=Math.round(x.tv*1.1/1000)*1000;return {d:`Uma empresa quer o espaço nobre da camisa por ${money(v)}. Parte da torcida torce o nariz para a marca.`,v,ch:['Aceitar o dinheiro','Recusar']}},go:(f,c,i)=>{if(i===0){c.money+=f.v;G.seasonMoney.in+=f.v;G.board.conf=clamp(G.board.conf-3,0,100);c.fans=Math.round(c.fans*.98);return `+${money(f.v)} · torcida −2% · diretoria −3`}G.board.conf=clamp(G.board.conf+2,0,100);return 'A torcida aplaudiu a decisão · diretoria +2'}},
  amistoso:{good:1,ic:'🌎',t:'Convite para amistoso',make:(c,x)=>{const v=Math.round(x.tv*.8/1000)*1000;return {d:`Um clube do exterior paga ${money(v)} por um amistoso no meio da semana. O elenco vai cansar.`,v,ch:['Topar o amistoso','Poupar o elenco']}},go:(f,c,i)=>{if(i===0){c.money+=f.v;G.seasonMoney.in+=f.v;squad(c).forEach(p=>p.fi=clamp(p.fi-8,30,100));return `+${money(f.v)} · condição do elenco −8%`}squad(c).forEach(p=>p.fi=clamp(p.fi+3,30,100));return 'Elenco descansado · condição +3%'}},
  multa:{good:0,ic:'📄',t:'Multa da federação',make:(c,x)=>{const v=Math.round(x.tv*.3/1000)*1000;return {d:`O clube foi multado em ${money(v)} por atraso na entrada em campo.`,v}},go:(f,c)=>{c.money-=f.v;G.seasonMoney.out+=f.v;return `−${money(f.v)} no caixa`}},
  lesao:{good:0,ic:'🚑',t:'Lesão no treino',make:(c,x)=>{const p=pick(squad(c).filter(p=>!p.inj&&!p.y));return p?{d:`${p.n} torceu o tornozelo num treino leve.`,pid:p.id,v:rint(1,3)}:null},go:(f,c)=>{const p=G.players[f.pid];if(!p)return '';p.inj=f.v;return `${p.n} fora por ${f.v} jogo(s)`}},
  gramado:{good:0,ic:'🌧️',t:'Gramado alagado',make:(c,x)=>{const v=Math.round(x.tv*.45/1000)*1000;return {d:`A chuva destruiu parte do gramado. Reformar agora custa ${money(v)}.`,v,ch:['Reformar agora','Deixar como está']}},go:(f,c,i)=>{if(i===0){c.money-=f.v;G.seasonMoney.out+=f.v;return `−${money(f.v)} · gramado novo`}G.fam=clamp(G.fam-4,0,100);G.board.conf=clamp(G.board.conf-2,0,100);return 'Entrosamento −4 · diretoria −2'}},
  balada:{good:0,ic:'🌃',t:'Flagrado na balada',make:(c,x)=>{const p=pick(squad(c).filter(p=>!p.y));return p?{d:`${p.n} foi fotografado numa festa na véspera do jogo. A imprensa caiu em cima.`,pid:p.id,ch:['Multar o jogador','Passar pano']}:null},go:(f,c,i)=>{const p=G.players[f.pid];if(!p)return '';if(i===0){p.re=clamp(p.re-15,0,100);p.mo=clamp(p.mo-5,0,100);squad(c).forEach(q=>{if(q!==p)q.mo=clamp(q.mo+1,0,100)});return `${p.n}: relação −15 · elenco aprova`}squad(c).forEach(q=>q.mo=clamp(q.mo-2,0,100));G.board.conf=clamp(G.board.conf-3,0,100);return 'Elenco −2 de moral · diretoria −3'}},
  onibus:{good:0,ic:'🚌',t:'Ônibus quebrou',make:(c,x)=>{const v=Math.round(x.tv*.18/1000)*1000;return {d:`O ônibus do clube quebrou na volta. Conserto e transporte extra: ${money(v)}.`,v}},go:(f,c)=>{c.money-=f.v;G.seasonMoney.out+=f.v;return `−${money(f.v)} no caixa`}},
  salario:{good:0,ic:'💸',t:'Elenco cobra premiação',make:(c,x)=>{const v=Math.round(x.tv*.35/1000)*1000;return {d:`Os líderes do vestiário cobram a premiação atrasada: ${money(v)}.`,v,ch:['Pagar agora','Pedir paciência']}},go:(f,c,i)=>{if(i===0){c.money-=f.v;G.seasonMoney.out+=f.v;squad(c).forEach(p=>p.mo=clamp(p.mo+2,0,100));return `−${money(f.v)} · moral +2`}squad(c).forEach(p=>{p.mo=clamp(p.mo-5,0,100);p.re=clamp(p.re-2,0,100)});return 'Moral do elenco −5'}}
};
function squad(c){return c.players.map(i=>G.players[i]).filter(Boolean)}
function rollFortune(r){const c=userClub();const won=r.home===G.user?r.hg>r.ag:r.ag>r.hg,lost=r.home===G.user?r.hg<r.ag:r.ag<r.hg;
  const pGood=won?.68:lost?.38:.52;const good=R()<pGood;const keys=Object.keys(FORT).filter(k=>!!FORT[k].good===good&&k!==(G.lastFortune||''));
  const x={tv:DIV_TV[c.div]};for(let t=0;t<6;t++){const k=pick(keys);const F=FORT[k];const f=F.make(c,x);if(!f)continue;G.fortune={k,good:F.good,ic:F.ic,t:F.t,...f,id:G.uid++};G.lastFortune=k;
    if(!f.ch){G.fortune.res=F.go(G.fortune,c,0);G.fortune.auto=true}return}}
function resolveFortune(i){const f=G.fortune;if(!f)return null;const c=userClub();if(!f.auto)f.res=FORT[f.k].go(f,c,i);f.pickI=i;
  msg(`${f.good?'🍀 Sorte':'⚡ Revés'}: ${f.t}`,`${f.d}${f.ch?` Sua decisão: ${f.ch[i]}.`:''} Resultado: ${f.res}.`,{pid:f.pid});G.fortune=null;save();return f}
/* ---------- inbox ---------- */
function plog(p,t,txt){if(!p)return;p.log=p.log||[];p.log.unshift({s:G.season,d:G.date,t,txt});if(p.log.length>30)p.log.length=30}
function msg(title,body,extra={}){G.inbox.unshift({id:G.uid++,date:G.date,season:G.season,title,body,read:false,...extra});G.inbox=G.inbox.slice(0,80)}

return {autoTrainNow,setAutoTrain,newerSave,progressOf,current,get G(){return G},set G(v){G=v},set onSave(f){onSave=f},loadObj(o){G=o;afterLoad();try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}},D,R,rnd,rint,pick,clamp,gauss,shuffle,DIVS,ATTR,ATTR_LABEL,ATTR_GROUPS,W,POS,STYLES,migratePlayer,setIndividual,setRest,setBonus,bonusBoost,POS_NAME,GROUP,ovr,ovrFor,posFactor,ratingIn,FN,fnGroup,fnOf,
  FORMATIONS,buildSlots,valueOf,wageOf,formAvg,genPlayer,newGame,takeOver,save,load,hasSave,wipe,exportSave,importSave,userClub,bestLineup,autoLineup,validateLineup,setFormation,
  teamStrength,coachOf,aiTeam,userTeam,runTraining,trainAdvice,syncRosters,teamTalk,dateInfo,nextUserMatch,ensureCupDraw,finishDate,sortedTable,penalties,money,payroll,TRAIN,YTRAIN,scout,scoutCost,upgradeAcademy,academyCost,promote,demote,release,
  talk,moodText,relText,startSeason,expandLeagues,newAuction,makeOffer,askPrice,searchPlayers,listForSale,closeLot,answerOffer,acceptJob,declineJobs,CAL,CUP_NAMES,CUP_RULE,FAC,facLvl,facCost,buyFac,ACTS,doAct,playerBoostCost,boostPlayer,prizeTable,DIV_PRIZE,trophies,resolveFortune,FORT,divName,DIV_TV,msg,quickResult,valueOfNow:valueOf};
})();
if(typeof module!=='undefined')module.exports=C11;
