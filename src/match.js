/* Camisa 11 — motor de partida (sem DOM). Campo 105 x 68 m. Time do lado 0 ataca para +x. */
var C11Match=(function(){
'use strict';
const C=(typeof C11!=='undefined')?C11:require('./core.js');
const L=105,W=68,GW=7.32;let RNG=Math.random;const R=()=>RNG();
// sorteio determinístico (multiplayer: os dois lados simulam a mesma partida)
function mulberry(a){a=a>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+R()*(b-a),hyp=Math.hypot;
const pick=a=>a[Math.floor(R()*a.length)];
const SPEED=[.8,1,1.25];

function depth(x,s){return s===0?x/L:1-x/L}
function lat(y,s){return s===0?y/W:1-y/W}
function toX(d,s){return s===0?d*L:L-d*L}
function toY(w,s){return s===0?w*W:W-w*W}
function goalX(s){return s===0?L:0}           // gol que o lado s ataca
function ownGoalX(s){return s===0?0:L}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const l2=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l2;t=clamp(t,0,1);return {d:hyp(px-ax-t*dx,py-ay-t*dy),t}}

const TXT={
  goal:['GOOOOL! {p} balança a rede!','É GOL! {p} não perdoa!','GOL do {t}! {p} manda pro fundo!','Golaço de {p}!'],
  save:['{g} faz a defesa!','Que defesa de {g}!','{g} espalma o chute de {p}.'],
  miss:['{p} finaliza para fora.','Por cima! {p} isolou.','{p} bate e a bola passa perto da trave.'],
  block:['Chute travado pela zaga.'],
  card:['Cartão amarelo para {p}.'],red:['Vermelho! {p} está expulso.'],
  corner:['Escanteio para o {t}.'],fk:['Falta em {p}.'],inj:['{p} sente e pede atendimento.']
};
/* narração dos lances do meio do jogo (painel de lances) */
const NARR={
  drib_pedalada:['Pedalada de {p}! Deixou o marcador no chão.','{p} pedala, pedala... e passa!','Que pedalada de {p}!'],
  drib_chapeu:['Chapéuzinho de {p}! A torcida vai à loucura.','{p} dá um chapéu no marcador!','Olha o chapéu de {p}!'],
  drib_caneta:['Caneta! {p} passou a bola entre as pernas do marcador.','Que caneta de {p}!','{p} humilha com uma caneta!'],
  drib_roleta:['{p} gira por cima da bola e sai jogando. Que roleta!','Roleta de {p}! Lindo drible.','{p} dá o giro e deixa o marcador para trás.'],
  drib_falha:['{p} tenta o drible de efeito, mas o marcador não cai.','{p} inventa demais e perde a bola.'],
  desarme:['{p} chega firme e desarma {q}.','Bom desarme de {p}.','{p} rouba a bola de {q}.'],
  carrinho:['Carrinho preciso de {p}!','{p} vai no carrinho e tira a bola de {q}.','Carrinhaço de {p}, na bola!'],
  corte:['{p} se estica no carrinho e corta o passe!','Corte providencial de {p}, de carrinho.'],
  ombro:['{p} ganha no corpo e fica com a bola.','Ombro a ombro, {p} leva a melhor sobre {q}.'],
  dividida:['Bola dividida no meio-campo!','Dividida forte, a bola espirra.'],
  dominio:['{p} não consegue dominar e a bola escapa.','A bola veio forte e {p} não segurou.'],
  escorregao:['{p} escorrega no gramado molhado!','Gramado pesado: {p} perde o equilíbrio.'],
  primeira:['{p} pega de primeira!','{p} emenda direto, sem deixar cair!'],
  cruz:['{p} cruza na área!','Cruzamento de {p}!','{p} levanta na área.'],
  lanc:['{p} lança para {q}.','Bola longa de {p} procurando {q}.','{p} vira o jogo para {q}.'],
  tabela:['{p} tabela com {q}.','Bonita tabela entre {p} e {q}!'],
  contra:['Contra-ataque do {t}!','O {t} sai em velocidade no contra-ataque!'],
  area:['{p} invade a área!','{p} chega na área com perigo!','{p} entra na área...'],
  toque:['O {t} troca passes com paciência.','Toque de bola do {t}, rodando de um lado para o outro.','O {t} gira a bola procurando espaço.'],
  gkcruz:['{g} sai bem e fica com o cruzamento.','{g} sobe mais alto que todo mundo e segura.'],
  gksoco:['{g} sai socando a bola para longe.']
};
const fill=(s,o)=>s.replace(/\{(\w)\}/g,(_,k)=>o[k]||'');

class Match{
  constructor(home,away,opts={}){
    this.opts=opts;RNG=opts.seed!=null?mulberry(opts.seed):Math.random;this.T=[this.mkTeam(home,0),this.mkTeam(away,1)];
    {/* clima e vento: decididos pelo confronto, iguais para os dois técnicos no online */let h=0;const key=this.T[0].name+'|'+this.T[1].name+'|'+(opts.wkey??opts.seed??'');for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;
      this.weather=opts.weather||(h%20<3?'chuva':h%20<9?'tarde':'noite');this.wet=this.weather==='chuva';this.wxHash=h;
      const wa=((h>>>7)%628)/100,ws=(this.weather==='noite'?.5:1.8)*(((h>>>3)%100)/100);this.vento={x:Math.cos(wa)*ws,y:Math.sin(wa)*ws};this.phys={bad:0,first:0,duel:0,slip:0,defl:0,divid:0,postIn:0}}
    this.matchSec=opts.matchSec||300;this.half=this.matchSec/2;this.t=0;this.phase='ready';
    this.ball={x:L/2,y:W/2,z:0,st:'own',own:null,vx:0,vy:0,last:0};
    this.events=[];this.dead=0;this.deadFn=null;this.tick=0;this.lastSide=0;this.excite=0;this.htDone=false;
    this.kickoff(0,true);
  }
  mkTeam(src,side){
    const P=src.players||C.G.players;const human=(this.opts.humans||[this.opts.userSide??0]).includes(side);
    const T={side,boost:src.boost||1,club:src.club,name:src.club.short||src.club.name,slots:src.slots,tac:side===(this.opts.userSide??0)&&!this.opts.seed?src.tactic:Object.assign({},src.tactic),ai:!human,fam:src.fam??70,score:0,subsLeft:5,
      st:{pos:0,sh:0,sot:0,xg:0,pa:0,pc:0,tk:0,fo:0,co:0,yc:0},mps:[],bench:src.subs.map(id=>P[id]).filter(Boolean),out:[]};
    src.line.forEach((id,i)=>{const p=P[id];if(p)T.mps.push(this.mkMp(p,T,i,i===0?1:i+1))});
    T.takers=(src.tactic&&src.tactic.takers)||{};
    return T;
  }
  mkMp(p,T,si,num){
    const role=T.slots[si].role;const pf=C.posFactor(p.p,role);
    const mood=(.94+((p.mo||60)+(p.re||55))/1700)*(T.side===0?1.03:1)*(T.boost||1);const fam=.96+(T.fam||70)/2500;
    const con=p.con??10;this._forms=this._forms||{};const form=this._forms[p.id]??(this._forms[p.id]=1+(R()+R()+R()-1.5)*.11*(1.3-con/20));
    const gk=k=>k==='gol'||k==='ref'||k==='sai';const a={};for(const k of C.ATTR)a[k]=(p.t[k]??10)*mood*fam*form*(gk(k)?(role==='GOL'?1:.3):pf);
    return {id:p.id,p,side:T.side,si,num,a,x:0,y:0,vx:0,vy:0,tx:0,ty:0,sprint:false,stam:p.fi??100,frozen:0,ctrl:0,
      form,r:6.2,s:{pa:0,pc:0,sh:0,sot:0,g:0,as:0,tk:0,int:0,sv:0,kp:0},min0:this.t||0,yc:0,off:false,ph:R()*6,face:T.side===0?1:-1,skin:p.id%5,hair:(p.id*7)%4,lp:null,lpT:0};
  }
  get minute(){return Math.min(90,Math.floor(this.t/this.matchSec*90))+(this.t>=this.matchSec?0:0)}
  teamOf(mp){return this.T[mp.side]}
  opp(s){return this.T[1-s]}
  active(T){return T.mps.filter(m=>!m.off)}
  gk(T){return T.mps.find(m=>!m.off&&T.slots[m.si].role==='GOL')||this.active(T)[0]}
  slotOf(mp){return this.T[mp.side].slots[mp.si]}
  taker(T,kind){const id=T.takers&&T.takers[kind];const on=this.active(T).filter(m=>T.slots[m.si].role!=='GOL');let m=on.find(x=>x.id===id);
    if(!m){const k=kind==='pen'?(x=>x.a.fin*1.2+x.a.vis*.5):kind==='ck'?(x=>x.a.pas+x.a.vis*.5):(x=>x.a.fin+x.a.pas);m=on.slice().sort((a,b)=>k(b)-k(a))[0]}return m}
  ev(type,side,text,extra={}){const e={t:this.t,min:this.minute,type,side,text,...extra};this.events.push(e);if(this.onEvent)this.onEvent(e);return e}

  /* ---------- reinícios ---------- */
  kickoff(side,first,walk){
    for(const T of this.T)for(const m of this.active(T)){const s=T.slots[m.si];const d=Math.min(s.df.d*.95,.46);m.koX=toX(d,T.side);m.koY=toY(s.df.w,T.side);if(!walk){m.x=m.koX;m.y=m.koY;m.vx=m.vy=0}m.frozen=0}
    const T=this.T[side];const fw=this.active(T).filter(m=>m.si!==0).sort((a,b)=>hyp(a.koX-L/2,a.koY-W/2)-hyp(b.koX-L/2,b.koY-W/2))[0];
    if(walk){// depois do gol: todos voltam correndo para as posições; a saída só acontece com o time posicionado
      fw.koX=L/2-(side===0?.6:-.6);fw.koY=W/2;this.ball.x=L/2;this.ball.y=W/2;this.ball.z=0;
      this.koWait=0;this.setDead(3.4,()=>{
        fw.x=fw.koX;fw.y=fw.koY;this.give(fw,true);this.ball.x=L/2;this.ball.y=W/2;fw.decide=this.t+.6;fw.ko=true},{kind:'ko'});return}
    fw.x=fw.koX=L/2-(side===0?.6:-.6);fw.y=fw.koY=W/2;fw.vx=fw.vy=0;this.give(fw,true);this.ball.x=L/2;this.ball.y=W/2;fw.decide=this.t+.8;fw.ko=true;
    this.dead=first?.6:1;this.deadFn=null;
  }
  koReady(){// todos de volta ao próprio campo, perto da posição de saída
    for(const T of this.T)for(const m of this.active(T)){if(m.koX==null)continue;if(hyp(m.x-m.koX,m.y-m.koY)>1.6)return false;if((m.x-L/2)*(m.koX-L/2)<0&&Math.abs(m.koX-L/2)>1)return false}return true}
  // troca de cena: na volta longa para a bola parada mostra só o começo da corrida e corta para todos já posicionados
  sceneCut(dt){const sp=this.setup;if(!sp||sp.cutDone||sp.kind==='gol'||sp.kind==='pen')return;sp.age=(sp.age||0)+dt;if(sp.age<(sp.kind==='ko'?.9:.45))return;sp.cutDone=true;
    let far=0;for(const T of this.T)for(const m of this.active(T))if(hyp(m.x-m.tx,m.y-m.ty)>6)far++;const tk=sp.taker;
    if(far<2&&!(tk&&hyp(tk.x-tk.tx,tk.y-tk.ty)>5))return;
    for(const T of this.T)for(const m of this.active(T)){const dx=m.tx-m.x,dy=m.ty-m.y,d=hyp(dx,dy);if(d>2.5){const k=(d-1.2)/d;m.x+=dx*k;m.y+=dy*k}m.vx=m.vy=0}
    this.cutId=(this.cutId||0)+1}
  setDead(sec,fn,setup){this.ball.st='dead';this.ball.own=null;this.dead=sec;this.deadFn=fn;this.setup=setup||null}
  give(mp,silent){const b=this.ball;const hz=b.z||0;mp.ko=mp.setP=mp.throwIn=false;b._fresh=true;if(!silent&&this.opts.sound&&b.st==='fly')this.opts.sound('trap',mp);b.st='own';b.own=mp;b.vx=b.vy=0;b.vz=0;b.z=0;b.fly=null;this.lastSide=mp.side;b.last=mp.side;
    mp.ctrl=this.t+(silent?0:.1+(1-mp.a.dri/20)*.18+(this._hardPass?.15:0)+(hyp(mp.vx||0,mp.vy||0)>5?.12:0)+(hz>1.6?.16:hz>1.1?.12:hz>.45?.06:0));/* (8) amortecer no peito/cabeça leva mais tempo */mp.decide=mp.ctrl+this.react(mp);this._hardPass=false}
  react(mp){const T=this.T[mp.side];return rnd(.12,.32)*[1.3,1,.78][T.tac.tempo??1]*(1.16-(mp.a.vis*.5+mp.a.dec*.5)/20*.34)}

  /* ---------- passo ---------- */
  step(dt){
    if(this.phase==='ft')return;
    for(const T of this.T)for(const m of T.mps){m._px=m.x;m._py=m.y;m._pph=m.ph}const bb=this.ball;bb._px=bb.x;bb._py=bb.y;bb._pz=bb.z;
    if(this.phase==='ready')this.phase='play';
    if(this.phase==='ht')return;
    if(this.dead>0){this.dead-=dt;this.updateTargets(dt,true);if(this.goalCele)this.celeTargets();this.move(dt);this.outMove(dt);this.netMove(dt);this.sceneCut(dt);if(this.dead<=0&&this.setup&&this.setup.kind==='ko'&&!this.koReady()&&(this.koWait=(this.koWait||0)+dt)<14){this.dead=.05;return}if(this.dead<=0){const f=this.deadFn;this.deadFn=null;this.setup=null;if(f)f()}return}
    this.t+=dt;this.tick++;
    if(!this.htDone&&this.t>=this.half){this.htDone=true;this.flip=true;this.phase='ht';this.ev('ht',null,'Fim do primeiro tempo.');this.kickoff(1);this.dead=.5;return}
    if(this.t>=this.matchSec){this.phase='ft';this.ev('ft',null,'Fim de jogo!');this.finish();return}
    const ps=this.ball.st==='own'?this.ball.own.side:this.ball.st==='fly'?this.ball.fly.side:null;if(ps!==null)this.T[ps].st.pos+=dt;
    this.updateTargets(dt,false);this.move(dt);this.separate();this.updateBall(dt);this.fatigue(dt);
    if(this.tick%60===0){this.aiSubs();this.aiTactics()}
    // empolgação (para áudio/câmera)
    const b=this.ball;const dg=Math.min(hyp(b.x-0,b.y-W/2),hyp(b.x-L,b.y-W/2));this.excite+=((dg<25?1-dg/25:0)-this.excite)*dt*2;
  }
  fatigue(dt){for(const T of this.T){const pr=T.tac.press??1;for(const m of this.active(T)){const drain=(m.sprint?.32:.14)*(1+pr*.12)*(1.55-m.a.res/20*.9);m.stam=Math.max(20,m.stam-drain*dt*(this.opts.fatigueMul||1))}}}
  spd(m){return (5.3+m.a.vel*.16)*(.68+.32*m.stam/100)}
  acc(m){return 3.4+(m.a.ace||10)*.2}

  updateTargets(dt,dead){
    const b=this.ball;const poss=b.st==='own'?b.own.side:b.st==='fly'?b.fly.side:null;
    const tt=this.t;
    // (11) contra-ataque: roubou a bola no próprio campo -> 2 atacantes disparam
    if(poss!=null&&this._poss!=null&&poss!==this._poss&&b.st==='own'&&!dead){const T=this.T[poss];if(depth(b.x,poss)<.5){
        const fw=this.active(T).filter(m=>['ATA','PD','PE','MEI'].includes(T.slots[m.si].role)&&m!==b.own&&m.stam>35).sort((x,y)=>(y.a.vel||10)-(x.a.vel||10)).slice(0,2);
        for(const m of fw){m.runUntil=tt+2.6;m.runW=clamp(lat(m.y,poss)+(.5-lat(m.y,poss))*.3,.15,.85)}if(fw.length)this.narr('contra',poss,{t:T.name})}}
    if(poss!=null)this._poss=poss;
    for(const T of this.T){
      const s=T.side,O=this.T[1-s];const tac=T.tac;const att=poss===s;
      /* bola alta no ar: o time já se ajusta para onde ela vai cair (ninguém fica parado esperando) */
      const fl=b.st==='fly'&&b.fly&&(b.fly.h>2||b.fly.kind==='clear'||b.fly.kind==='cross')?b.fly:null;const rx=fl?(fl.ix??fl.tx):b.x,ry=fl?(fl.iy??fl.ty):b.y;
      const bd=depth(rx,s),bw=lat(ry,s);
      let lastDef=0;for(const o of this.active(O))if(O.slots[o.si].role!=='GOL')lastDef=Math.max(lastDef,depth(o.x,s));
      for(const m of this.active(T)){
        const sl=T.slots[m.si];const fn=C.fnOf(sl.role,sl.fn);const gk=sl.role==='GOL';let td,tw;
        if(att){const a=sl.a;
          if(gk){td=(tac.line===2?.04:.025)+bd*(tac.line===2?.17:.12)+(fn.fwd||0);tw=.5+(bw-.5)*.2}// (22) linha alta: goleiro adiantado
          else{
            td=.1+a.d*.7+bd*.28+(tac.ment||0)*.03+(fn.fwd||0)-(fn.hold||0);
            tw=.5+(a.w-.5)*(1+((tac.width??1)-1)*.16)+(bw-.5)*.12;
            if(fn.wide)tw+=Math.sign(tw-.5)*fn.wide;
            if(fn.inside)tw+=(.5-tw)*fn.inside*2;
            if(fn.box&&bd>.5){const k=clamp((bd-.5)/.25,0,1);td+=(.88-td)*fn.box*4*k;tw+=(.5-tw)*.4*k}
            if(fn.drop)td-=fn.drop*(bd>.35?1:.5);
            if(fn.roam){td+=Math.cos(tt*.21+m.si)*.05;tw+=Math.sin(tt*.27+m.si*2)*.13}
            if(fn.cover){td-=.04;tw+=(bw-.5)*.3}
            if(sl.arrow){const k=clamp((bd-.26)/.28,0,1);td+=(sl.arrow.d-a.d)*k;tw+=(sl.arrow.w-a.w)*k}
            const ro=sl.role,flank=a.w<.5?0:1,ballFlank=bw<.5?0:1,wide=Math.abs(bw-.5)>.28;
            // (9) amplitude: pontas abertos colados na linha lateral na construção
            if((ro==='PD'||ro==='PE')&&bd<.74&&!(m.runUntil>tt))tw=flank?.94:.06;
            // (4) centroavante na linha do último zagueiro; (7) pivô: na saída de bola vem buscar
            if(ro==='ATA'){if(bd>.32)td=Math.max(td,lastDef-.012);else td=Math.min(td,bd+.3)}
            // (30) personalidade: matador fica na área; meia criativo busca o jogo mais atrás
            if(ro==='ATA'&&(m.a.fin||10)>=15&&bd>.5)td+=.025;
            if(ro==='MEI'&&(m.a.vis||10)>=15&&(m.a.pas||10)>=15&&bd<.5)td-=.05;
            // (3) ultrapassagem do lateral pelo lado da bola
            if((ro==='LD'||ro==='LE')&&bd>.4&&flank===ballFlank){if(!(m.ovUntil>tt)&&R()<.006*(m.stam/100)&&depth(m.x,s)>bd-.3)m.ovUntil=tt+5.5;if(m.ovUntil>tt){const wg=this.active(T).find(w=>{const r2=T.slots[w.si].role;return (r2==='PD'||r2==='PE')&&(lat(w.y,s)<.5?0:1)===flank});td=Math.max(td,bd+.08,wg?depth(wg.x,s)+.06:0);tw=flank?.95:.05;m.ovRun=true}}
            // (10) cruzamento: área ocupada (1º pau, 2º pau, marca do pênalti, entrada da área)
            if(bd>.74&&wide){const sg=ballFlank?1:-1;
              if(ro==='ATA'){td=.935;tw=.5+sg*.06}
              else if((ro==='PD'||ro==='PE')&&flank!==ballFlank){td=.925;tw=.5-sg*.1}
              else if(ro==='MEI'){td=.88;tw=.5-sg*.02}// (6) meia chega de trás na área
              else if(ro==='MC'&&m.si%2===0){td=.79;tw=.5}}
            // corrida em diagonal nas costas da zaga (pode cair em impedimento se o passe atrasar)
            if(['ATA','PD','PE','MEI'].includes(sl.role)&&bd>.35){if(!(m.runUntil>tt)&&R()<.011*(1+(m.a.vis||10)/20)*clamp(m.stam/80,.4,1)){m.runUntil=tt+1.4+R();m.runW=(sl.role==='PD'||sl.role==='PE')?clamp(tw+(.5-tw)*rnd(.45,.75),.15,.85):clamp(tw+(R()-.5)*.25,.1,.9)}
              if(m.runUntil>tt){td=Math.max(td,lastDef+.035);tw=m.runW;m.sprint=true}}
          }
        }else{const a=sl.df;
          const lineD=[.15,.22,.3][tac.line??1];
          if(gk){td=.022+Math.max(0,bd-.5)*.06;tw=.5+(bw-.5)*.18}
          else{
            td=a.d+(lineD-.22)+(bd-.5)*.34-(fn.track?.04:0)+(tac.ment||0)*.015;
            tw=.5+(a.w-.5)*.84+(bw-.5)*.36;
            if(a.d<.3)td=Math.min(td,Math.max(.06,bd-.015));
          }
        }
        td=clamp(td,.015,.97);tw=clamp(tw,.03,.97);
        let spr=!!((m.runUntil>tt||m.ovRun)&&att);m.ovRun=false;
        if(att&&m.wallUntil>tt){td=depth(m.wallX,s);tw=lat(m.wallY,s);spr=true}// (2) tabela: quem tocou corre para receber de volta
        // (17) recomposição: perdeu a bola e ficou à frente dela -> volta correndo (cansado volta trotando)
        if(!att&&!gk&&depth(m.x,s)>td+.1&&m.stam>38)spr=true;
        m.tx=toX(td,s);m.ty=toY(tw,s);m.sprint=spr;m._td=td;
        // goleiro sai do gol para fechar o ângulo no mano a mano
        if(gk&&!att&&b.st==='own'&&b.own.side!==s){const c=b.own,ogx=ownGoalX(s);const dg=hyp(c.x-ogx,c.y-W/2);if(dg<20&&Math.abs(c.y-W/2)<16){const k=clamp((20-dg)/14,0,1)*.42;m.tx=ogx+(c.x-ogx)*k;m.ty=W/2+(c.y-W/2)*k;m.sprint=dg<12}}
      }
      this.shapeTeam(T,att,bd,lastDef);
    }
    if(dead){this.setPieceTargets();return}
    // marcação / pressão / apoio
    if(b.st==='own'){
      const car=b.own,A=this.T[car.side],O=this.T[1-car.side];
      const pressR=[9,16,26][O.tac.press??1];
      const ds=this.active(O).filter(m=>O.slots[m.si].role!=='GOL').map(m=>({m,d:hyp(m.x-car.x,m.y-car.y)})).sort((a,b)=>a.d-b.d);
      const og=ownGoalX(O.side);
      const pr0=ds[0]&&ds[0].m,prR=pressR*(pr0?1+(((pr0.a.agr||10)-10)*.03+((pr0.a.des||10)-10)*.02):1);
      if(ds[0]&&ds[0].d<prR){const m=ds[0].m;const ux=(og-car.x),uy=(W/2-car.y),ul=hyp(ux,uy)||1;m.tx=car.x+ux/ul*.9;m.ty=car.y+uy/ul*.9;m.sprint=m.stam>30;m.press=true;
        // (15) cobertura: lateral saiu para pressionar -> o zagueiro mais perto fecha o espaço dele
        const rr=O.slots[m.si].role;if(rr==='LD'||rr==='LE'){let cb=null,cd=1e9;for(const z of this.active(O)){if(O.slots[z.si].role!=='ZAG')continue;const d=hyp(z.x-m.x,z.y-m.y);if(d<cd){cd=d;cb=z}}if(cb){cb.cover=m.y}}}
      if(ds[1]&&(O.tac.press??1)>=1&&ds[1].d<20){const m=ds[1].m;const ux=(og-car.x),uy=(W/2-car.y),ul=hyp(ux,uy)||1;m.tx=car.x+ux/ul*6;m.ty=car.y+uy/ul*6;m.sprint=ds[1].d>6}
      const pressing=new Set(ds.slice(0,2).map(x=>x.m));
      const atts=this.active(A).filter(m=>m!==car);
      // (16) pressão coordenada: os próximos fecham as linhas de passe para os companheiros mais perto do portador
      if((O.tac.press??1)>=1){const near=atts.filter(a=>A.slots[a.si].role!=='GOL').map(a=>({a,d:hyp(a.x-car.x,a.y-car.y)})).filter(x=>x.d<24).sort((x,y)=>x.d-y.d).slice(0,2);
        for(const {a} of near){const lx=car.x+(a.x-car.x)*.62,ly=car.y+(a.y-car.y)*.62;let best=null,bd2=14;
          for(const {m} of ds){if(pressing.has(m))continue;const role=O.slots[m.si].role;if(role==='ZAG')continue;const d=hyp(m.x-lx,m.y-ly);if(d<bd2){bd2=d;best=m}}
          if(best){best.tx=lx;best.ty=ly;best.sprint=bd2>5;best.lane=true;pressing.add(best)}}}
      const marked=new Set();const kMark=[.25,.55,.85][O.tac.press??1];// (18) pressão baixa = marcação por zona; alta = individual
      for(const m of this.active(O)){if(pressing.has(m)||O.slots[m.si].role==='GOL')continue;
        let best=null,bd=9;for(const a of atts){if(marked.has(a))continue;const d=hyp(a.x-m.tx,a.y-m.ty);if(d<bd){bd=d;best=a}}// (20) ninguém marca o mesmo atacante em dupla
        if(best)marked.add(best);
        if(m.cover!=null){m.ty=m.ty+(m.cover-m.ty)*.35;m.cover=null}
        if(best){const ux=og-best.x,uy=W/2-best.y,ul=hyp(ux,uy)||1;const gx=best.x+ux/ul*1.6,gy=best.y+uy/ul*1.6;const k=kMark*(O.slots[m.si].df.d<.3?1:.8)*(O.slots[m.si].role==='VOL'?.6:1);m.tx=m.tx*(1-k)+gx*k;m.ty=m.ty*(1-k)+gy*k}
        // a marcação não desmancha o bloco: zagueiro acompanha de lado, mas fica perto da linha; meio-campo dentro da faixa do meio
        if(O._line!=null){const r=O.slots[m.si].role,dd=depth(m.tx,O.side),ln=O._line;
          if(r==='ZAG'||r==='LD'||r==='LE')m.tx=toX(clamp(dd,ln-.015,ln+(O.tac.press===2?.07:.025)),O.side);
          else if(r==='VOL'||r==='MC'||r==='MEI')m.tx=toX(clamp(dd,ln+.04,ln+(O.tac.press===2?.2:.16)),O.side)}}
      // linhas de passe: quem está sem a bola procura espaço
      if(this.tick%6===0){const bdA=depth(car.x,car.side);const sup=new Set(atts.filter(m=>{const r=A.slots[m.si].role;return r!=='GOL'&&!(r==='ATA'&&bdA>.4)&&!(m.runUntil>tt)&&!(m.ovUntil>tt)}).map(m=>({m,d:hyp(m.x-car.x,m.y-car.y)})).filter(x=>x.d<30).sort((a,b)=>a.d-b.d).slice(0,3).map(x=>x.m));const taken=[];
        const OFF=[[0,0],[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,3],[3,-3],[-3,-3]],OFF2=OFF.concat([[7,0],[-7,0],[0,7],[0,-7],[5,5],[-5,5],[5,-5],[-5,-5]]);
        for(const m of atts){if(A.slots[m.si].role==='GOL')continue;const isS=sup.has(m);
        let bx=0,by=0,bv=-1e9;
        const wing=(A.slots[m.si].role==='PD'||A.slots[m.si].role==='PE')&&bdA<.74;
        for(const [ox,oy] of (isS?OFF2:OFF)){const x=clamp(m.tx+ox,1,L-1),y=clamp(m.ty+oy,1,W-1);if(wing&&Math.abs(y-W/2)<Math.abs(m.ty-W/2)-1.5)continue;
          let open=10;for(const o of this.active(O)){const d=hyp(o.x-x,o.y-y);if(d<open)open=d}
          let lane=6;for(const o of this.active(O)){const sd=segDist(o.x,o.y,car.x,car.y,x,y);if(sd.t>.05&&sd.t<.95&&sd.d<lane)lane=sd.d}
          const dc=hyp(x-car.x,y-car.y);let v=open*.6+lane*.8-hyp(ox,oy)*.25-(dc<6?4:0);
          // (1) apoio: os 3 mais próximos querem estar a 8-20 m, com linha de passe limpa e sem amontoar
          if(isS){v+=(dc>=8&&dc<=20?3:0)+(lane>2.5?2.5:0);for(const [tx,ty] of taken)if(hyp(x-tx,y-ty)<6)v-=4}
          if(v>bv){bv=v;bx=ox;by=oy}}
        m.sx=bx;m.sy=by;m.sup=isS;if(isS)taken.push([clamp(m.tx+bx,1,L-1),clamp(m.ty+by,1,W-1)])}}
      for(const m of atts){if(m.sx!=null){m.tx=clamp(m.tx+m.sx,1,L-1);m.ty=clamp(m.ty+m.sy,1,W-1);if(m.sup&&hyp(m.tx-m.x,m.ty-m.y)>4)m.sprint=true}}// apoio chega rápido
      // portador
      if(car.ko||car.setP||car.throwIn){car.tx=car.x;car.ty=car.y;car.sprint=false;car.drib=null;// cobrador parado: só pode tocar a bola
        if(car.ko)for(const m of this.active(O)){const dx=m.tx-L/2,dy=m.ty-W/2,dd=hyp(dx,dy)||1;if(dd<9.6){m.tx=L/2+dx/dd*9.6;m.ty=W/2+dy/dd*9.6}if((m.tx-L/2)*(ownGoalX(O.side)-L/2)<0)m.tx=L/2+(ownGoalX(O.side)>L/2?1:-1)*.5;m.press=false;m.sprint=false}}
      else if(car.drib){car.tx=car.drib.x;car.ty=car.drib.y;car.sprint=true}
      else{/* conduz para a frente desviando do marcador: nada de ficar parado cara a cara */const dir=car.side===0?1:-1;const no=this.nearestOpp(car);let ty=car.y;
        if(no.o&&no.d<3.5&&(no.o.x-car.x)*dir>-.3){ty+=(car.y>=no.o.y?1:-1)*(3.5-no.d)*.9;if(no.d<1.9&&this.t<car.decide-.15&&this.t>=car.ctrl)car.decide=this.t+.05}
        car.tx=clamp(car.x+dir*(no.o&&no.d<2.5?1.6:2.4),1,L-1);car.ty=clamp(ty,1.5,W-1.5)}
    }else if(b.st==='fly'){
      const f=b.fly;const lx=f.ix??f.tx,ly=f.iy??f.ty,rem=Math.max(0,(f.dur-f.t)+(f.wd>0?f.wd:0)),high=f.h>2||f.kind==='clear'||f.kind==='cross';
      if(f.recv&&!f.recv.off){const r=f.recv;r.tx=lx;r.ty=ly;r.sprint=true;
        if(high&&f.recv!==f.from){/* ataca a bola: se vai chegar cedo, vem de trás no tempo certo em vez de esperar parado */const dx=lx-r.x,dy=ly-r.y,dd=hyp(dx,dy),eta=dd/this.spd(r);const spare=rem-.35-eta;
          if(spare>.15&&dd>.5){const back=Math.min(6,spare*this.spd(r)*.75);const ux=dd?dx/dd:0,uy=dd?dy/dd:0;r.tx=lx-ux*back;r.ty=ly-uy*back;r.sprint=spare<.6}else if(dd<=.5){const dir=f.side===0?1:-1;r.tx=lx-dir*.9;r.ty=ly}}}
      if(high&&f.kind!=='shot'){/* segunda bola: dois de cada time fecham a zona onde a bola vai cair */
        for(const T of this.T){const atk=T.side===f.side;const dir=T.side===0?1:-1;const cand=this.active(T).filter(m=>T.slots[m.si].role!=='GOL'&&m!==f.recv&&m!==f.icp&&m!==f.from&&m!==f.ch0&&m!==f.ch1&&!m.press).map(m=>({m,d:hyp(m.x-lx,m.y-ly)})).filter(o=>o.d<24).sort((a,c)=>a.d-c.d).slice(atk?0:1,atk?2:3);
          cand.forEach((o,i)=>{const m=o.m;const ang=(i?1:-1)*.9;const sc=clamp(rem/1.3,.3,1);/* vão fechando junto com a queda da bola */const ox=(atk?dir*4.5:-dir*5)*sc,oy=Math.sin(ang)*5.5*sc;m.tx=clamp(lx+ox*Math.cos(ang),1,L-1);m.ty=clamp(ly+oy,1,W-1);m.sprint=o.d>9})}}
      if(f.icp){f.icp.tx=f.ix;f.icp.ty=f.iy;f.icp.sprint=true}
      if(f.kind==='cross'){for(const T of this.T){let best=null,bd=1e9;for(const m of this.active(T)){if(T.slots[m.si].role==='GOL')continue;const d=hyp(m.x-f.tx,m.y-f.ty)/this.spd(m)-(m.a.cab||10)*.02;if(d<bd){bd=d;best=m}}if(best){best.tx=f.tx;best.ty=f.ty;best.sprint=true;best.press=false;f['ch'+T.side]=best}}}
      if(f.kind==='pass'||f.kind==='clear'){const O=this.T[1-f.side];let best=null,bd=1e9;for(const m of this.active(O)){if(O.slots[m.si].role==='GOL')continue;const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd){bd=d;best=m}}if(best&&bd<(f.h>2||f.kind==='clear'?24:15)&&best!==f.icp){best.tx=f.tx;best.ty=f.ty;best.sprint=true}}
      // chute: o goleiro firma na posição e só ajusta um passo para o lado (o mergulho fica por conta da animação)
      if(f.kind==='shot'){const g=this.gk(this.T[1-f.side]);if(g){if(g.shotY0==null||g.shotF!==f){g.shotF=f;g.shotX0=g.x;g.shotY0=g.y}g.tx=g.shotX0;g.ty=g.shotY0+clamp((f.gy??g.shotY0)-g.shotY0,-.9,.9);g.sprint=false}}
    }else if(b.st==='loose'){
      for(const T of this.T){let best=null,bd=1e9;for(const m of this.active(T)){const d=hyp(m.x-b.x,m.y-b.y)/this.spd(m);if(d<bd){bd=d;best=m}}if(best){best.tx=b.x+b.vx*.3;best.ty=b.y+b.vy*.3;best.sprint=true}}
      const g=this.gk(this.T[b.x<L/2?0:1]);if(g&&hyp(g.x-b.x,g.y-b.y)<12&&Math.abs(b.x-ownGoalX(g.side))<16.5){g.tx=b.x;g.ty=b.y;g.sprint=true}
    }
    for(const T of this.T)for(const m of this.active(T)){if(m!==b.own)m.press=m.press&&b.st==='own';m.lane=false}
  }
  // (13) linha de 4 em bloco e (8) time compacto: as linhas andam juntas
  shapeTeam(T,att,bd,lastDef){const s=T.side;const out=this.active(T).filter(m=>T.slots[m.si].role!=='GOL');if(!out.length)return;
    const role=m=>T.slots[m.si].role,isDef=m=>['ZAG','LD','LE'].includes(role(m)),isMid=m=>['VOL','MC','MEI'].includes(role(m)),isFwd=m=>['ATA','PD','PE'].includes(role(m));
    const defs=out.filter(isDef);const set=(m,td)=>{td=clamp(td,.015,.97);m._td=td;m.tx=toX(td,s)};
    T._line=null;
    if(!att){
      if(defs.length>=3){const zs=defs.filter(m=>role(m)==='ZAG');const base=(zs.length?zs:defs);let line=base.reduce((a,m)=>a+m._td,0)/base.length;
        const tac=T.tac,low=(tac.line===0)||((tac.ment||0)<0);if(low)line=Math.min(line,.15);// (21) retranca: bloco baixo perto da área
        // (14) linha de impedimento: sobe junto quando o adversário recua a bola
        const b=this.ball;if(!low&&b.st==='own'&&b.own.side!==s){const dirO=b.own.side===0?1:-1;if(b.own.vx*dirO<-1.2)line+=.045}
        if(!low&&b.st==='fly'&&b.fly.side!==s&&b.fly.kind==='pass'){const dirO=b.fly.side===0?1:-1;if((b.fly.tx-b.fly.fx)*dirO<-3)line+=.05}
        if(low)for(const m of out)m.ty=W/2+(m.ty-W/2)*.82;
        T._line=line;for(const m of defs){if(m.press)continue;const fb=role(m)!=='ZAG';set(m,line+(fb?.012:0))}
        for(const m of out){if(m.press||m.lane)continue;if(isMid(m))set(m,clamp(m._td,line+.05,role(m)==='VOL'?line+.1:line+.15));else if(isFwd(m))set(m,Math.min(m._td,line+(role(m)==='ATA'?.33:.25)))}}
    }else{
      // atacando: a defesa acompanha a subida (sem deixar buraco entre as linhas)
      for(const m of out){if(isDef(m)&&!(m.runUntil>this.t))set(m,Math.max(m._td,bd-.44));else if(isMid(m)&&!(m.runUntil>this.t))set(m,Math.max(m._td,bd-.3))}
    }}
  celeTargets(){// comemoração: o autor corre para a bandeirinha e os companheiros vão abraçá-lo
    const g=this.goalCele,sc=g.mp,T=this.T[g.side];if(!g.cx){const gx=goalX(sc.side);g.cx=gx+(gx>L/2?-1.5:1.5);g.cy=sc.y<W/2?1.5:W-1.5}
    sc.tx=g.cx;sc.ty=g.cy;sc.sprint=true;
    for(const q of this.active(T)){if(q===sc||T.slots[q.si].role==='GOL')continue;const d=hyp(q.x-sc.x,q.y-sc.y);if(d<35){const a=(q.id%7)/7*6.283;q.tx=sc.x+Math.cos(a)*1.3;q.ty=sc.y+Math.sin(a)*1.3}}
  }
  setPieceTargets(){
    const sp=this.setup;if(!sp)return;
    if(sp.kind==='ko'){for(const T of this.T)for(const m of this.active(T)){if(m.koX==null)continue;m.tx=m.koX;m.ty=m.koY;m.sprint=hyp(m.x-m.koX,m.y-m.koY)>8}return}
    if(sp.kind==='corner'){const A=this.T[sp.side],O=this.T[1-sp.side];const gx=goalX(sp.side);const dir=sp.side===0?-1:1;
      const big=this.active(A).filter(m=>A.slots[m.si].role!=='GOL'&&m!==sp.taker).sort((a,b)=>b.a.cab-a.a.cab).slice(0,5);
      big.forEach((m,i)=>{m.tx=gx+dir*(6+(i%3)*3.5)+Math.sin(this.t*1.1+i*1.7)*1.4;m.ty=W/2+(i-2)*4+Math.cos(this.t*.9+i)*1.6});// (24) se mexem antes da cobrança
      const defs=this.active(O).filter(m=>O.slots[m.si].role!=='GOL').sort((a,b)=>b.a.cab-a.a.cab).slice(0,6);
      defs.forEach((m,i)=>{const t=big[i%big.length];m.tx=t.tx+dir*-1.2;m.ty=t.ty+(i>=big.length?2:0)});
      // (23) um defensor em cada trave
      const posts=this.active(O).filter(m=>O.slots[m.si].role!=='GOL'&&!defs.includes(m)).sort((a,b)=>hyp(a.x-gx,a.y-W/2)-hyp(b.x-gx,b.y-W/2)).slice(0,2);
      posts.forEach((m,i)=>{m.tx=gx-dir*-.7;m.ty=W/2+(i?3.4:-3.4)});
      if(sp.taker){sp.taker.tx=sp.x+(sp.x<L/2?-.6:.6);sp.taker.ty=sp.y+(sp.y<W/2?-.5:.5);sp.taker.sprint=true}
      const g2=this.gk(O);if(g2){g2.tx=gx+(sp.side===0?-.6:.6);g2.ty=W/2+(sp.y<W/2?-1.5:1.5)}
    }else if(sp.kind==='pen'){const gx=goalX(sp.side);for(const T of this.T)for(const m of this.active(T)){if(m===sp.taker){m.tx=sp.x-(sp.side===0?1:-1);m.ty=W/2;continue}
        if(T.slots[m.si].role==='GOL'&&T.side!==sp.side){m.tx=gx;m.ty=W/2;continue}if(Math.abs(m.tx-gx)<18){m.tx=gx+(sp.side===0?-19:19)}}}
    else if(sp.kind==='lateral'&&sp.taker){// (26) lateral: dois companheiros se aproximam para receber curto
      const A=this.T[sp.taker.side];const near=this.active(A).filter(m=>m!==sp.taker&&A.slots[m.si].role!=='GOL').sort((a,b)=>hyp(a.x-sp.x,a.y-sp.y)-hyp(b.x-sp.x,b.y-sp.y)).slice(0,2);
      const into=sp.y<W/2?1:-1;near.forEach((m,i)=>{m.tx=clamp(sp.x+(i?-7:7),2,L-2);m.ty=clamp(sp.y+into*(i?9:5),1,W-1)});
      sp.taker.tx=sp.x;sp.taker.ty=sp.y;sp.taker.sprint=true}
    else if(sp.kind==='tiro'&&sp.taker){// tiro de meta: o goleiro se afasta uns passos e vem correndo para bater
      const g=sp.taker,dir=sp.x<L/2?1:-1,run=this.dead>.8;
      // (27) zagueiros abrem nos cantos da área para a saída curta
      {const T=this.T[g.side];this.active(T).filter(m=>T.slots[m.si].role==='ZAG').slice(0,2).forEach((m,i)=>{m.tx=sp.x+dir*12;m.ty=W/2+(i?14:-14)})}g.tx=run?sp.x-dir*3:sp.x-dir*.3;g.ty=run?sp.y-1.4:sp.y-.15;g.sprint=run&&hyp(g.x-g.tx,g.y-g.ty)>5}
    else if(sp.taker){sp.taker.tx=sp.x;sp.taker.ty=sp.y;sp.taker.sprint=true}
    if(sp.kind==='falta'&&sp.taker){const A=this.T[sp.taker.side],dep=depth(sp.x,A.side);
      if(dep>.68&&Math.abs(sp.y-W/2)>12){const gx=goalX(A.side),dir=A.side===0?-1:1;// (25) falta lateral: cabeceadores na área
        this.active(A).filter(m=>m!==sp.taker&&A.slots[m.si].role!=='GOL').sort((a,b)=>b.a.cab-a.a.cab).slice(0,4).forEach((m,i)=>{m.tx=gx+dir*(7+(i%2)*4);m.ty=W/2+(i-1.5)*4.5})}const O=this.T[1-sp.taker.side];for(const m of this.active(O)){const dx=m.tx-sp.x,dy=m.ty-sp.y,d=hyp(dx,dy)||1;if(d<9.3){m.tx=clamp(sp.x+dx/d*9.3,.5,L-.5);m.ty=clamp(sp.y+dy/d*9.3,.5,W-.5)}}}
  }
  separate(){// corpos não se atravessam: quem fica a menos de 0,7 m é afastado (o dono da bola cede menos)
    const all=[];for(const T of this.T)for(const m of this.active(T))all.push(m);const own=this.ball.own;
    for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=.7||d<1e-4)continue;
      const push=(.7-d)*.5,ux=dx/d,uy=dy/d;const wa=a===own?.25:b===own?.75:.5,wb=1-wa;a.x-=ux*push*2*wa;a.y-=uy*push*2*wa;b.x+=ux*push*2*wb;b.y+=uy*push*2*wb}}
  move(dt){
    for(const T of this.T)for(const m of this.active(T)){
      if(m.frozen>0){m.frozen-=dt;const fr=m.slideT!=null&&this.t-m.slideT<1.95?(this.t-m.slideT<.32?.95:.55):m.kwT!=null&&this.t-m.kwT<.35?.9:.85;m.vx*=fr;m.vy*=fr;m.x+=m.vx*dt;m.y+=m.vy*dt;continue}
      const dx=m.tx-m.x,dy=m.ty-m.y,d=hyp(dx,dy);const own=this.ball.own===m;
      if(own&&(m.ko||m.setP||m.throwIn)){m.vx=m.vy=0;continue}// cobrador parado esperando para tocar
      // (28) ritmo de deslocamento: perto do lance corre; longe dele trota/anda para se reposicionar
      const dB=hyp(m.x-this.ball.x,m.y-this.ball.y),nearB=dB<30;if(m.sprint&&!own&&m.stam<58&&dB>22&&!m.press)m.sprint=false;// (29) cansado não dispara longe do lance
      let v=this.spd(m)*(m.sprint?1:d>12?.95:d>6?(nearB?.9:.78):d>2.5?(nearB?.68:.55):.38)*(own?.86:1)*(m.slowUntil>this.t?.35:1);
      const want=d<.25?0:Math.min(v,d*3);const ux=d?dx/d:0,uy=d?dy/d:0;
      let ak=Math.min(1,dt*this.acc(m));const sp0=hyp(m.vx,m.vy);
      if(sp0>3.5&&want>.5){const dot=(m.vx*ux+m.vy*uy)/sp0;/* (12) inércia: em velocidade, virar e frear custa; agilidade e drible ajudam */
        if(dot<.75){const ag=((m.a.ace||10)/20)*.28+((m.a.dri||10)/20)*.14;ak*=clamp(.42+ag+(dot+1)*.14,.42,1)}
        /* (13) gramado molhado: virada brusca em velocidade pode virar escorregão */
        if(this.wet&&sp0>5.6&&dot<-.15&&R()<dt*.18*(1.3-((m.a.ace||10)/20))){m.frozen=.6;m.anim={k:'stumble',t:this.t};this.px('slip');this.narr('escorregao',m.side,{p:m.p.n,pid:m.id});if(own){const b=this.ball;b.st='loose';b.own=null;b.vx=m.vx*.8;b.vy=m.vy*.8;b.vz=0;this.lastTouch=m.side;m.drib=null}continue}}
      m.vx+=(ux*want-m.vx)*ak;m.vy+=(uy*want-m.vy)*ak;
      m.x=clamp(m.x+m.vx*dt,-.6,L+.6);m.y=clamp(m.y+m.vy*dt,-.6,W+.6);
      const sp=hyp(m.vx,m.vy);m.ph+=sp*dt*2.15;
      const bf=this.ball.st==='fly'&&this.ball.fly&&this.ball.fly.recv===m;let fw=m.face;
      if(bf||(!own&&sp<1.2&&this.ball.st!=='own')||(!own&&sp<1.2&&this.ball.own&&this.ball.own.side!==m.side))fw=Math.sign(this.ball.x-m.x)||m.face;else if(Math.abs(m.vx)>.3)fw=Math.sign(m.vx);
      m.face=fw;m.fs=(m.fs??fw)+(fw-(m.fs??fw))*Math.min(1,dt*6);
    }
    // separação leve
    if(this.tick%3===0){const all=[...this.active(this.T[0]),...this.active(this.T[1])];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy);if(d<1.1&&d>0){const k=(1.1-d)*.25;a.x-=dx/d*k;a.y-=dy/d*k;b.x+=dx/d*k;b.y+=dy/d*k}}}
  }

  /* ---------- bola ---------- */
  updateBall(dt){
    const b=this.ball;
    if(b.st==='own'){const m=b.own;const sp=hyp(m.vx,m.vy);
      // bola colada no pé: vai à frente na direção da corrida e é "empurrada" a cada passada
      const ux=sp>.6?m.vx/sp:(m.fs??m.face),uy=sp>.6?m.vy/sp:0;const run=Math.min(1,sp/6);const cyc=(m.ph*.5)%1;
      // toque: a bola sai rápido do pé (15% do ciclo) e o jogador a alcança aos poucos (85%)
      const push=cyc<.15?cyc/.15:1-(cyc-.15)/.85;const off=.36+run*(.18+.62*push);
      const tx=m.x+ux*off,ty=m.y+uy*off*.9+.08;const e=Math.min(1,dt*(b._fresh?9:22));b.x+=(tx-b.x)*e;b.y+=(ty-b.y)*e;b.z=Math.max(0,(b.z||0)-dt*6);
      if(b._fresh&&hyp(tx-b.x,ty-b.y)<.15)b._fresh=false;
      // a bola que o jogador conduz também sai de campo (antes ele podia dar a volta por fora e voltar)
      if(!b._fresh&&(b.x<-.15||b.x>L+.15||b.y<-.15||b.y>W+.15)){this.lastTouch=m.side;b.own=null;b.st='loose';b.vx=m.vx;b.vy=m.vy;m.drib=null;if(this.checkOut())return}
      if(run>.25&&cyc<m._cyc){m.tt=this.t;if(this.opts.sound)this.opts.sound('touch',m)}m._cyc=cyc;
      if(m.drib&&hyp(m.x-m.drib.x,m.y-m.drib.y)<1)m.drib=null;
      {const inBox=depth(m.x,m.side)>.843&&Math.abs(m.y-W/2)<20;if(inBox&&!m._inBox&&!m.setP&&this.T[m.side].slots[m.si].role!=='GOL')this.narr('area',m.side,{p:m.p.n,pid:m.id});m._inBox=inBox}
      this.tackles(m,dt);if(b.own!==m)return;
      if(this.t>=m.decide&&this.t>=m.ctrl)this.decide(m);
      return}
    if(b.st==='fly'){const f=b.fly;if(f.wd>0){f.wd-=dt;return}f.t+=dt;const k=Math.min(1,f.t/f.dur);const ex=f.ix??f.tx,ey=f.iy??f.ty;
      let ke=f.kind==='shot'?k:(f.h<.6?1-Math.pow(1-k,1.55):k);
      {/* (4) resistência do ar: bola forte sai rápida e perde velocidade no fim (mesmo tempo de chegada) */const c=f.kind==='shot'?.85:f.h>3?.55:0;if(c)ke=(1-Math.exp(-c*ke))/(1-Math.exp(-c))}
      b.x=f.fx+(ex-f.fx)*ke;b.y=f.fy+(ey-f.fy)*ke;b.z=f.h*4*k*(1-k)+(f.endZ||0)*k;
      if(f.cv){/* (1) efeito: a bola faz curva no meio do caminho e chega no mesmo ponto */const dx=ex-f.fx,dy=ey-f.fy,dl=hyp(dx,dy)||1,c=f.cv*4*ke*(1-ke);b.x+=-dy/dl*c;b.y+=dx/dl*c}
      if(k>=1)this.arrive(f);return}
    if(b.st==='loose'){b.x+=b.vx*dt;b.y+=b.vy*dt;
      /* (2) quique de verdade: gravidade, perda de energia (menor na grama molhada) e atrito diferente no ar e no chão */
      b.vz=(b.vz||0)-9.8*dt;b.z=(b.z||0)+b.vz*dt;let air=b.z>.02;if(b.z<=0){b.z=0;if(b.vz<-1.4){b.vz=-b.vz*(this.wet?.42:.56);const k=this.wet?.86:.9;b.vx*=k;b.vy*=k;air=true}else b.vz=0}
      const fr=Math.max(0,1-(air?.25:(this.wet?1.9:1.5))*dt);b.vx*=fr;b.vy*=fr;/* (3) na chuva a bola rola menos */
      if(this.checkOut())return;
      let best=null,bs=-1,sides=0,cand=[];if(!(b.spillT&&this.t-b.spillT<.3)&&b.z<1.9)for(const T of this.T){let here=false;for(const m of this.active(T)){const d=hyp(m.x-b.x,m.y-b.y);if(d<1.3&&m.frozen<=0){here=true;cand.push(m);const isGk=T.slots[m.si].role==='GOL'&&Math.abs(b.x-ownGoalX(T.side))<16.5;const s=R()*(m.a.dri+m.a.frc)+(isGk?30:0);if(s>bs){bs=s;best=m}}}if(here)sides++}
      /* (17) dividida: dois adversários chegam juntos e a bola espirra */
      if(best&&sides===2&&!cand.some(m=>this.T[m.side].slots[m.si].role==='GOL')&&R()<.35){this.px('divid');this.narr('dividida',best.side);const a=R()*6.283,v=rnd(3,6.5);b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v;b.vz=rnd(0,2.2);b.spillT=this.t;for(const m of cand)m.frozen=Math.max(m.frozen||0,.25);best=null}
      if(best){this.give(best);if(best.side!==this.lastTouch)this.T[best.side].st.tk+=0;this.lastTouch=best.side}
    }
  }
  // bola saindo de campo: continua rolando/voando um pouco antes da reposição
  outPlay(fn,vx,vy,vz){const b=this.ball;b.st='outp';b.own=null;b.fly=null;b.vx=vx;b.vy=vy;b.vz=vz||0;this.dead=1.15;this.deadFn=fn;this.setup=null}
  outMove(dt){const b=this.ball;if(b.st!=='outp')return;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vz=(b.vz||0)-9.8*dt;b.z=Math.max(0,(b.z||0)+b.vz*dt);if(b.z<=0&&b.vz<0)b.vz=-b.vz*.35;
    const fr=Math.max(0,1-(b.z>0?.3:1.6)*dt);b.vx*=fr;b.vy*=fr;
    // placas de publicidade
    if(b.x<-4.3||b.x>L+4.3){b.x=clamp(b.x,-4.3,L+4.3);b.vx*=-.25}if(b.y<-3.8||b.y>W+3.8){b.y=clamp(b.y,-3.8,W+3.8);b.vy*=-.25}}
  narr(k,side,v={}){const now=this.t;const nk=this._nk||(this._nk={});const cd={contra:22,toque:25,area:10,cruz:10,lanc:10}[k]||7;if(now-(this._nl??-9)<2.4||now-(nk[k]??-99)<cd)return;const arr=NARR[k];if(!arr)return;nk[k]=now;this._nl=now;this.ev('lance',side,fill(arr[(this.tick+(v.n||0))%arr.length],v),v.pid?{pid:v.pid}:{})}
  px(k){const p=this.phys||(this.phys={});p[k]=(p[k]||0)+1}
  netMove(dt){const b=this.ball;if(b.st!=='net')return;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vz=(b.vz||0)-9.8*dt;b.z=Math.max(0,b.z+b.vz*dt);if(b.z===0)b.vz=0;
    const back=b.netX,dir=back>L/2?1:-1;if((b.x-back)*dir>0){b.x=back;b.vx=-b.vx*.12;b.vy*=.4}/* fundo da rede segura a bola */
    b.y=clamp(b.y,W/2-GW/2+.15,W/2+GW/2-.15);const fr=Math.max(0,1-(b.z>0?.6:3)*dt);b.vx*=fr;b.vy*=fr}
  checkOut(){
    const b=this.ball;if(b.x>0&&b.x<L&&b.y>0&&b.y<W)return false;
    const last=this.lastTouch??this.lastSide;
    const vx=b.vx||0,vy=b.vy||0;
    if(b.y<=0||b.y>=W){const side=1-last;const y=b.y<=0?.3:W-.3;const x=clamp(b.x,1,L-1);this.outPlay(()=>this.restartWith(side,x,y,'lateral'),vx,vy);return true}
    const lineSide=b.x<=0?0:1;// lado cujo gol fica nessa linha
    const top=b.y<W/2;if(last===lineSide)this.outPlay(()=>this.corner(1-lineSide,top),vx,vy);else this.outPlay(()=>this.goalKick(lineSide),vx,vy);
    return true;
  }
  restartWith(side,x,y,kind){
    const T=this.T[side];let best=null,bd=1e9;for(const m of this.active(T)){if(T.slots[m.si].role==='GOL')continue;const d=hyp(m.x-x,m.y-y);if(d<bd){bd=d;best=m}}
    this.setDead(kind==='falta'?1.1:kind==='lateral'?1.3:.9,()=>{best.x=x;best.y=y;this.give(best,true);if(kind==='lateral')best.throwIn=true;else best.setP=true;best.decide=this.t+(kind==='lateral'?.6:.25)},{kind,taker:best,x,y});this.ball.x=x;this.ball.y=y;
  }
  goalKick(side){const g=this.gk(this.T[side]);const x=side===0?5.5:L-5.5;this.ball.x=x;this.ball.y=W/2;
    this.setDead(2.1,()=>{g.x=x-(side===0?.3:-.3);g.y=W/2-.15;g.vx=g.vy=0;this.give(g,true);g.setP=true;g.gkKick=true;g.decide=this.t+.02},{kind:'tiro',taker:g,x,y:W/2})}// tiro de meta: o goleiro bate de primeira (passe ou chutão), sem conduzir
  corner(side,top){const x=side===0?L-.4:.4,y=top?.4:W-.4;this.T[side].st.co++;this.ev('corner',side,fill(pick(TXT.corner),{t:this.T[side].name}));
    const A=this.T[side];const taker=this.taker(A,'ck');
    this.ball.x=x;this.ball.y=y;this.ball.z=0;this.setDead(2.8,()=>this.cross(taker,side,x,y),{kind:'corner',side,taker,x,y});}
  /* cruzamento: o erro de mira é decidido na saída da bola, para os jogadores lerem a trajetória */
  crossErr(f){const cq=f.from&&f.from.a?(f.from.a.cru||10):10;f.cv=(R()<.5?-1:1)*rnd(.8,2.2);f.tx=clamp(f.tx+(this.vento?this.vento.x:0)*f.dur*.3,1,L-1);f.ty=clamp(f.ty+(this.vento?this.vento.y:0)*f.dur*.3,1,W-1);const tired=f.from?(1-f.from.stam/100)*.12:0;if(R()>.5+cq/20*.45-tired){f.tx=clamp(f.tx+rnd(-4,4),1,L-1);f.ty=clamp(f.ty+rnd(-7,7),1,W-1)}}
  cross(taker,side,x,y){
    const gx=goalX(side);const dir=side===0?-1:1;const tx=gx+dir*rnd(5,11),ty=W/2+rnd(-6,6);
    const tdir=x<L/2?-1:1;taker.x=x+tdir*.5;taker.y=y+(y<W/2?-.4:.4);taker.kt=this.t;taker.kk='cross';if(this.opts.sound)this.opts.sound('pass',taker);this.ball.x=x;this.ball.y=y;this.lastTouch=side;this.T[side].st.pa++;
    this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'cross',side,fx:x,fy:y,tx,ty,t:0,dur:1.25,h:5,from:taker,endZ:0};this.crossErr(this.ball.fly);this.wind(taker,this.ball.fly);
  }

  /* ---------- decisões ---------- */
  nearestOpp(m,x=m.x,y=m.y){let bd=99,bo=null;for(const o of this.active(this.T[1-m.side])){const d=hyp(o.x-x,o.y-y);if(d<bd){bd=d;bo=o}}return {d:bd,o:bo}}
  shotGeom(x,y,side){const gx=goalX(side);const a1=Math.atan2(W/2-GW/2-y,gx-x),a2=Math.atan2(W/2+GW/2-y,gx-x);let th=Math.abs(a2-a1);if(th>Math.PI)th=2*Math.PI-th;
    return {th,dist:hyp(gx-x,W/2-y),base:Math.min(.62,.8*Math.pow(th,2.3))}}
  gkFactor(x,y,side){const g=this.gk(this.T[1-side]);if(!g)return 2;const gx=goalX(side);const sd=segDist(g.x,g.y,x,y,gx,W/2);const off=sd.d+Math.max(0,hyp(g.x-gx,g.y-W/2)-7)*.5;return clamp(1+(off-1.2)*.09,.85,1.8)}
  shotSkill(m,dG){return dG>19?(m.a.lon||m.a.fin)*.7+m.a.fin*.3:m.a.fin}
  decide(m){
    if(m.throwIn){// lateral: cobrado com as mãos para um companheiro próximo
      const T0=this.T[m.side];const c=this.active(T0).filter(q=>q!==m&&T0.slots[q.si].role!=='GOL').map(q=>({q,d:hyp(q.x-m.x,q.y-m.y)})).filter(o=>o.d>4&&o.d<22).sort((a,b)=>a.d-b.d+rnd(-3,3));
      if(c.length){const o=c[0];return this.pass(m,o.q,.95,0,o.d)}m.throwIn=false}
    if(m.setP){m.setP=false;// bola parada: a cobrança tem que ser passe (ou chute) — o cobrador não pode sair conduzindo
      const T0=this.T[m.side],md0=depth(m.x,m.side);const c=this.active(T0).filter(q=>q!==m&&T0.slots[q.si].role!=='GOL').map(q=>({q,d:hyp(q.x-m.x,q.y-m.y),f:depth(q.x,m.side)-md0})).filter(o=>o.d>6&&o.d<40&&this.nearestOpp(o.q).d>2.5).sort((a,b)=>(b.f*30-b.d*.15+rnd(-4,4))-(a.f*30-a.d*.15+rnd(-4,4)));
      if(m.gkKick){m.gkKick=false;
        // (27) saída curta com os zagueiros abertos (time que gosta de tocar sai jogando mais)
        const sh=c.filter(o=>o.d<24&&['ZAG','LD','LE','VOL'].includes(T0.slots[o.q.si].role)).sort((a,b)=>a.d-b.d);
        if(sh.length&&R()<[.3,.55,.35][T0.tac.pass??1]){const o=sh[0];return this.pass(m,o.q,.95,0,o.d)}
        if(!c.length||R()<.45)return this.clear(m)}
      const o=c[0]||this.active(T0).filter(q=>q!==m).map(q=>({q,d:hyp(q.x-m.x,q.y-m.y)})).sort((a,b)=>a.d-b.d)[0];if(o)return this.pass(m,o.q,.95,0,o.d)}
    if(m.ko){m.ko=false;// saída de bola: toca para trás/lado, como no futebol de verdade
      const T0=this.T[m.side],md0=depth(m.x,m.side);const c=this.active(T0).filter(q=>q!==m&&T0.slots[q.si].role!=='GOL'&&depth(q.x,m.side)<md0-.02).map(q=>({q,d:hyp(q.x-m.x,q.y-m.y)})).filter(o=>o.d>6&&o.d<28).sort((a,b)=>a.d-b.d+rnd(-4,4));
      if(c.length){const o=c[0];return this.pass(m,o.q,.97,0,o.d)}
      // ninguém atrás na distância ideal: toca para o companheiro mais próximo que não esteja à frente
      const c2=this.active(T0).filter(q=>q!==m&&T0.slots[q.si].role!=='GOL'&&depth(q.x,m.side)<=md0+.005).map(q=>({q,d:hyp(q.x-m.x,q.y-m.y)})).filter(o=>o.d>2).sort((a,b)=>a.d-b.d);
      if(c2.length){const o=c2[0];return this.pass(m,o.q,.97,0,o.d)}}
    const T=this.T[m.side],O=this.T[1-m.side],tac=T.tac;const isGk=T.slots[m.si].role==='GOL';const sl=T.slots[m.si];const fn=C.fnOf(sl.role,sl.fn);
    const press=this.nearestOpp(m).d;const gx=goalX(m.side);const dG=hyp(gx-m.x,W/2-m.y);const md=depth(m.x,m.side);
    const nz=1.4-(m.a.dec||10)/20*.8;const style=tac.pass??1,tempo=tac.tempo??1,ment=tac.ment||0;
    let best={k:'hold',v:.12+nz*rnd(0,.05)};let safe=null;
    // finalizar
    if(!isGk&&dG<32){const g=this.shotGeom(m.x,m.y,m.side);const pf=press<1?.6:press<2.5?.8:press<4?.92:1;
      const est=g.base*pf*this.gkFactor(m.x,m.y,m.side)*(.6+this.shotSkill(m,dG)/20*.7);
      const v=est*18+(dG<11?.3:0)+(dG<18?.15:0)+ment*.06-(dG>28?.12:0)+nz*rnd(0,.14);if(v>best.v)best={k:'shot',v}}
    // passes
    const maxD=style===2?58:style===0?30:44;
    for(const q of this.active(T)){if(q===m)continue;const d=hyp(q.x-m.x,q.y-m.y);if(d<4||d>maxD)continue;
      const qd=depth(q.x,m.side),prog=qd-md;const qIsGk=T.slots[q.si].role==='GOL';
      const open=clamp(this.nearestOpp(q).d/8,0,1);
      let risk=0;for(const o of this.active(O)){const sd=segDist(o.x,o.y,m.x,m.y,q.x,q.y);if(sd.t>.08&&sd.t<.96){const r=clamp(1-sd.d/3,0,1)*(d>28?sd.t>.8?1:.25:1);if(r>risk)risk=r}}
      const ps=clamp(.97-d*.006*(1.4-m.a.pas/20)-risk*.6-(press<2?.06:0)-(1-open)*.15,.05,.97);
      let val=ps*(.34+prog*(1.6+style*.35+tempo*.18+(fn.build?.25:0))+open*.22+(qd>.72?.3:0)+(qd>.7&&Math.abs(lat(q.y,m.side)-.5)<.25?.12:0));
      if(style===0&&d>22)val*=.8;if(qIsGk)val*=press<3?.7:.3;if(prog<-.15&&press>5)val*=.75;
      if(q.wallUntil>this.t&&q.wallTo===m&&prog>0)val+=.28*ps;// (2) devolve na tabela
      if(sl.role==='ATA'&&press<1.8&&prog<0&&d<14)val+=.15;// (7) pivô: segura de costas e escora para quem vem de trás
      val+=nz*rnd(0,.07);
      if(ps>.85&&prog>-.12&&(!safe||val>safe.v))safe={k:'pass',v:val,q,ps,risk,d};
      if(val>best.v)best={k:'pass',v:val,q,ps,risk,d}}
    // passe em profundidade (nas costas da defesa)
    if(!isGk&&md>.3){const dir=m.side===0?1:-1;let lastDef=0;for(const o of this.active(O))if(O.slots[o.si].role!=='GOL')lastDef=Math.max(lastDef,depth(o.x,m.side));
      const ogk=this.gk(O);
      for(const q of this.active(T)){if(q===m||T.slots[q.si].role==='GOL')continue;const qd=depth(q.x,m.side);if(qd<md-.02||qd<lastDef-.12)continue;
        const px=clamp(q.x+dir*rnd(7,12),2,L-2),py=clamp(q.y+(W/2-q.y)*.15,3,W-3);const pd=depth(px,m.side);if(pd>.95)continue;
        const d=hyp(px-m.x,py-m.y);if(d<8||d>45)continue;const open=this.nearestOpp(m,px,py).d;if(open<3.5)continue;if(ogk&&hyp(ogk.x-px,ogk.y-py)<7)continue;
        let risk=0;for(const o of this.active(O)){const sd=segDist(o.x,o.y,m.x,m.y,px,py);if(sd.t>.1&&sd.t<.95){const r=clamp(1-sd.d/2.6,0,1);if(r>risk)risk=r}}
        const ps=clamp(.9-d*.008*(1.4-m.a.pas/20)-risk*.55-(press<2?.08:0)+(m.a.vis-10)*.01,.05,.9);
        const val=ps*(.45+(pd-md)*2+(pd>lastDef?.4:0)+clamp(open/10,0,.3))+nz*rnd(0,.08)+(tempo-1)*.05;
        if(val>best.v)best={k:'thru',v:val,q,ps,px,py,d}}}
    // cruzamento
    if(!isGk&&md>.7){const lw=lat(m.y,m.side);if(lw<.2||lw>.8){const gx2=goalX(m.side);const inBox=this.active(T).filter(q=>q!==m&&Math.abs(q.x-gx2)<17&&Math.abs(q.y-W/2)<14).length;
      const v=.32+inBox*.14+((m.a.cru||m.a.pas)-10)*.02+nz*rnd(0,.1);if(v>best.v)best={k:'cross',v}}}
    // conduzir
    if(!isGk){let ahead=99;const dir=m.side===0?1:-1;for(const o of this.active(O)){const dx=(o.x-m.x)*dir;if(dx>0&&dx<12&&Math.abs(o.y-m.y)<5)ahead=Math.min(ahead,hyp(o.x-m.x,o.y-m.y))}
      let v=(.12+m.a.dri/20*.26)*(ahead>8?1.2:ahead>3?.7:.4)+(press>4?.06:0)+(md>.6?.16:0)+(md>.75?.08:0)-(sl.role==='ZAG'?.12:0)+nz*rnd(0,.08);
      if(v>best.v)best={k:'drib',v,ahead}}
    // afastar
    if(md<.22&&press<2.2&&!isGk){const v=.55;if(v>best.v)best={k:'clear',v}}
    if(isGk&&best.k==='hold'){best={k:'clear',v:1}}
    // (12) paciência: sem espaço para frente, troca passe seguro em vez de forçar
    if(safe&&(best.k==='pass'||best.k==='thru')&&best.ps<.55&&md<.66&&safe.v>=best.v*.62&&(tac.tempo??1)<2)best=safe;
    m.drib=null;
    if(best.k==='shot')return this.shoot(m);
    if(best.k==='pass')return this.pass(m,best.q,best.ps,best.risk,best.d);
    if(best.k==='thru')return this.pass(m,best.q,best.ps,.2,best.d,{x:best.px,y:best.py});
    if(best.k==='cross'){const gx2=goalX(m.side);const dir=m.side===0?-1:1;const tgt=this.active(T).filter(q=>q!==m&&Math.abs(q.x-gx2)<18).sort((a,b)=>b.a.cab-a.a.cab)[0];
      const tx=tgt?clamp(tgt.x,Math.min(gx2,gx2+dir*14),Math.max(gx2,gx2+dir*14)):gx2+dir*rnd(6,11),ty=tgt?clamp(tgt.y,W/2-9,W/2+9):W/2+rnd(-5,5);
      T.st.pa++;m.s.pa++;if(tgt){tgt.lp=m;tgt.lpT=this.t}this.narr('cruz',m.side,{p:m.p.n,pid:m.id});
      this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'cross',side:m.side,fx:this.ball.x,fy:this.ball.y,tx:gx2+dir*Math.abs(tx-gx2),ty,t:0,dur:hyp(tx-m.x,ty-m.y)/17+.3,h:4.5,from:m,endZ:0};this.crossErr(this.ball.fly);this.wind(m,this.ball.fly);this.lastTouch=m.side;return}
    if(best.k==='clear')return this.clear(m);
    if(best.k==='drib'){const dir=m.side===0?1:-1;const no=this.nearestOpp(m);
      /* dribles de efeito: com o marcador perto, o craque escolhe um dos três (pedalada, chapéu, roleta) */
      if(no.o&&no.d<4.2&&no.d>1.2&&!(m.trick&&this.t-m.trick.t<2.5)){const dr=m.a.dri||10,tq=(m.a.tec||m.a.dri||10);const want=.10+(dr-10)*.035;
        if(dr>=12&&R()<want){const o=no.o;const sgn=m.y>o.y?1:-1;const beat=clamp(.42+(dr-(o.a.des||10))*.04+((m.a.ace||10)-(o.a.ace||10))*.015,.15,.85);
          const front=Math.abs((o.x-m.x)*dir)>.6&&Math.abs(o.y-m.y)<1.1;const pick=R();
          const k=front&&no.d<2.6&&pick<.32?'caneta':pick<.45?'pedalada':pick<.72&&tq>=13&&Math.abs((o.x-m.x)*dir)>.6?'chapeu':'roleta';
          m.trick={k,t:this.t,o:o.id,ok:R()<beat};m.fx={k:'drible',t:this.t};this.narr(m.trick.ok?'drib_'+k:'drib_falha',m.side,{p:m.p.n,pid:m.id});
          if(k==='pedalada'){/* pedalas no lugar e arrancada para o lado oposto ao que o marcador comprou */m.slowUntil=this.t+.5;m.drib={x:clamp(m.x+dir*rnd(3.5,5.5),1,L-1),y:clamp(m.y+sgn*rnd(2.5,4),2,W-2)};m.decide=this.t+.95;if(m.trick.ok){o.frozen=Math.max(o.frozen||0,.7);o.anim={k:'beaten',t:this.t}}return}
          if(k==='roleta'){/* gira por cima da bola e sai pelo lado do marcador, protegendo com o corpo */m.slowUntil=this.t+.7;m.drib={x:clamp(m.x+dir*rnd(2.5,4),1,L-1),y:clamp(m.y-sgn*rnd(1.8,3),2,W-2)};m.decide=this.t+1.1;if(m.trick.ok){o.frozen=Math.max(o.frozen||0,.8);o.anim={k:'beaten',t:this.t}}return}
          if(k==='caneta'){/* caneta: bola rasteira entre as pernas do marcador; o driblador contorna e busca */const tx=clamp(o.x+dir*rnd(2.5,3.5),1,L-1),ty=clamp(o.y+rnd(-.4,.4),1,W-1);m.kt=this.t;m.kk='pass';
            this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'pass',self:true,side:m.side,from:m,recv:m,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur:.42,h:0,endZ:0};this.lastTouch=m.side;
            if(m.trick.ok){o.frozen=Math.max(o.frozen||0,.9);o.anim={k:'beaten',t:this.t}}else{this.ball.fly.icp=o;this.ball.fly.ix=o.x;this.ball.fly.iy=o.y;this.ball.fly.dur=.2}m.drib=null;return}
          /* chapéu: levanta a bola por cima do marcador e busca do outro lado */
          const tx=clamp(o.x+dir*rnd(3,4.5),1,L-1),ty=clamp(o.y+(m.y-o.y)*.3,1,W-1);m.kt=this.t;m.kk='pass';
          this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'pass',self:true,side:m.side,from:m,recv:m,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur:.75,h:2.1,endZ:0};this.lastTouch=m.side;
          if(m.trick.ok){o.frozen=Math.max(o.frozen||0,.9);o.anim={k:'beaten',t:this.t}}m.drib=null;return}}let ty=m.y;if(no.o&&no.d<6)ty+=(m.y>no.o.y?1:-1)*rnd(2,5);ty+=(W/2-m.y)*(md>.7?.3:.05);
      m.drib={x:clamp(m.x+dir*rnd(4,7),1,L-1),y:clamp(ty,2,W-2)};m.decide=this.t+rnd(.3,.55);return}
    m.decide=this.t+rnd(.25,.5);
  }
  pass(m,q,ps,risk,d,pt){
    const T=this.T[m.side],O=this.T[1-m.side];T.st.pa++;m.s.pa++;m.kt=this.t;if(this.opts.sound)this.opts.sound('pass',m);
    const isGkP=T.slots[m.si].role==='GOL'&&this.ball.st==='own';
    const lead=.35;let tx=pt?pt.x:q.x+(q.tx-q.x)*lead*.3,ty=pt?pt.y:q.y+(q.ty-q.y)*lead*.3;tx=clamp(tx,.5,L-.5);ty=clamp(ty,.5,W-.5);
    if(!pt&&!m.throwIn&&!m.setP&&!isGkP&&d<22&&this.nearestOpp(m).d>2&&depth(m.x,m.side)>.3&&R()<.3+((m.a.vis||10)-10)*.02){const dir=m.side===0?1:-1;
      m.wallUntil=this.t+1.9;m.wallTo=q;this.narr('tabela',m.side,{p:m.p.n,q:q.p.n,pid:m.id});m.wallX=clamp(m.x+dir*rnd(9,14),2,L-2);m.wallY=clamp(m.y+(q.y-m.y)*.25+(W/2-m.y)*.15,3,W-3)}// (2) tabela
    const wasThrow=!!m.throwIn;const lofted=pt?d>30:(d>27||(risk>.45&&d>15));m.kk=m.throwIn?'throw':isGkP&&d<32&&!pt&&m.gkHold?'gthrow':lofted?'long':'pass';m.throwIn=false;m.gkHold=false;
    const speed=(lofted?15.5:d<15?17:19)*(this.wet&&!lofted?.93:1);let dur=d/speed+(lofted?.25:.05);
    const press=this.nearestOpp(m).d;
    const acc=clamp(.99-d*.0028*(1.5-m.a.pas/20)-(press<1.8?.07:0)-(lofted?.05:0)-(1-m.stam/100)*.06-(this.wet?.02:0),.55,.985);/* (20) cansado erra mais */
    let recv=q;
    if(R()>acc){if(lofted){/* (19) lançamento mal calculado: cai curto ou longo e quica */const ul=hyp(tx-m.x,ty-m.y)||1,e=(R()<.5?-1:1)*rnd(4,9),lat=rnd(-2.5,2.5);tx=clamp(tx+(tx-m.x)/ul*e-(ty-m.y)/ul*lat,-1,L+1);ty=clamp(ty+(ty-m.y)/ul*e+(tx-m.x)/ul*lat,-1,W+1)}else{const ang=R()*6.283,e=rnd(3,8);tx=clamp(tx+Math.cos(ang)*e,-1,L+1);ty=clamp(ty+Math.sin(ang)*e,-1,W+1)}recv=null}
    if(lofted){/* (18) vento desvia a bola alta */tx=clamp(tx+(this.vento?this.vento.x:0)*dur*.3,-1,L+1);ty=clamp(ty+(this.vento?this.vento.y:0)*dur*.3,-1,W+1)}
    // interceptação
    let icp=null,ix,iy,its=1;
    for(const o of this.active(O)){const sd=segDist(o.x,o.y,m.x,m.y,tx,ty);if(sd.t<.06)continue;if(lofted&&sd.t<.82)continue;
      const reach=.8+this.spd(o)*sd.t*dur*.35;
      if(sd.d>reach){/* fora do alcance da perna: às vezes estica no carrinho para cortar o passe */if(!lofted&&!icp&&sd.d<reach+1.7&&sd.t>.15&&O.slots[o.si].role!=='GOL'&&o.frozen<=0&&R()<.06+((o.a.des||10)-10)*.008){its=sd.t;icp=o;ix=m.x+(tx-m.x)*sd.t;iy=m.y+(ty-m.y)*sd.t;this._slideIcp=o}continue}
      let p=(1-sd.d/reach)*(.2+(o.a.des+o.a.cpo)/40*.38);if(!lofted&&sd.d<.55)p=Math.max(p,.9);if(R()<p&&sd.t<its){its=sd.t;icp=o;ix=m.x+(tx-m.x)*sd.t;iy=m.y+(ty-m.y)*sd.t}}
    // impedimento: recebedor à frente do último defensor no momento do passe
    let offs=false;if(recv&&!wasThrow){const qd=depth(q.x,m.side);let ld=0;for(const o of this.active(O))if(O.slots[o.si].role!=='GOL')ld=Math.max(ld,depth(o.x,m.side));if(qd>.5&&qd>ld+.006&&qd>depth(this.ball.x,m.side)&&R()<.88)offs=true}
    if(lofted&&d>28&&recv)this.narr('lanc',m.side,{p:m.p.n,q:q.p.n,pid:m.id});
    const f={kind:'pass',side:m.side,from:m,recv,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur,h:lofted?Math.min(9,d*.18):0,endZ:lofted&&recv?rnd(.3,1.7):0,offs,offX:q.x,offY:q.y,cv:lofted?rnd(-.6,.6):0};/* (8) bola alta chega na altura do peito/coxa/cabeça */
    if(icp){f.icp=icp;f.ix=ix;f.iy=iy;f.dur=dur*its+.05;if(this._slideIcp===icp)f.slideIcp=true}this._slideIcp=null;
    this._hardPass=lofted;this.ball.st='fly';this.ball.own=null;this.ball.fly=f;this.lastTouch=m.side;if(m.kk!=='throw'&&m.kk!=='gthrow')this.wind(m,f);
    q.lp=m;q.lpT=this.t;
  }
  wind(m,f){// o jogador arma o chute/passe (~0,26 s) e só então a bola sai: o pé encontra a bola na animação
    f.wd=.26;m.kwT=this.t;m.frozen=Math.max(m.frozen||0,.3);m.drib=null}
  clear(m){m.kt=this.t;m.kk='long';m.gkHold=false;if(this.opts.sound)this.opts.sound('pass',m);const T=this.T[m.side];const dir=m.side===0?1:-1;const tx=clamp(m.x+dir*rnd(30,48),5,L-5),ty=clamp(m.y+rnd(-18,18),3,W-3);
    // tenta achar companheiro adiantado
    let best=null,bv=0;for(const q of this.active(T)){if(q===m)continue;const dq=hyp(q.x-tx,q.y-ty);if(dq<14&&(1-dq/14)>bv){bv=1-dq/14;best=q}}
    const d=hyp(tx-m.x,ty-m.y);T.st.pa++;m.s.pa++;
    this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'clear',side:m.side,from:m,recv:best,fx:this.ball.x,fy:this.ball.y,tx:clamp(tx+(this.vento?this.vento.x:0)*(d/16+.3)*.35,3,L-3),ty:clamp(ty+(this.vento?this.vento.y:0)*(d/16+.3)*.35,3,W-3),t:0,dur:d/16+.3,h:Math.min(14,d*.25),endZ:0,cv:rnd(-1,1)};this.wind(m,this.ball.fly);
    this._hardPass=true;this.lastTouch=m.side;if(best){best.lp=m;best.lpT=this.t}
  }
  shoot(m,opt={}){
    m.kt=this.t;m.kk=opt.head?'head':'shot';
    const T=this.T[m.side],O=this.T[1-m.side];const g=this.shotGeom(m.x,m.y,m.side);const press=this.nearestOpp(m).d;
    const cmpK=1.25-(m.a.cmp||10)/20*.5;let pf=press<1?.6:press<2.5?.8:press<4?.92:1;pf=1-(1-pf)*cmpK;const gkF=this.gkFactor(m.x,m.y,m.side);
    const sk=opt.head?m.a.cab:opt.fk?(m.a.bp||m.a.fin):this.shotSkill(m,g.dist);
    let xg=g.base*pf*gkF*(.6+sk/20*.7)*(.82+.18*m.stam/100)*(opt.head?.55:1)*(opt.fk?.6:1);
    if(opt.first)xg*=clamp(.74+((m.a.fin||10)+(m.a.dri||10)-20)*.012,.55,1.05)*(opt.volley?.85:1);/* (9) de primeira: técnica pesa mais */
    if(opt.head)xg*=.86+clamp(opt.run||0,0,7)*.04;/* (10) quem chega correndo cabeceia mais forte */
    xg=clamp(xg,.005,.85);
    if(opt.pen)xg=clamp(.74+(((m.a.bp||m.a.fin)+(m.a.cmp||10))/2-12)*.013-((this.gk(O)?this.gk(O).a.ref:10)-12)*.012,.55,.9);
    const gk=this.gk(O);const gq=gk?(gk.a.gol*.4+(gk.a.ref||gk.a.gol)*.6):8;
    const pGoal=opt.pen?xg:clamp(xg*3.05*(1.28-gq/20*.55),.004,.9);
    const pOn=Math.max(pGoal+.06,clamp(.26+sk/20*.36+g.base*.45-(1-pf)*.25-(1-m.stam/100)*.1-(opt.first?.05:0),.15,.92));/* (20) cansado chuta mais torto */
    const r=R();let out,cn=null;
    if(opt.pen)out=r<pGoal?'goal':r<pOn?'save':'miss';
    else if(r<pOn){/* (15) colocação x alcance do goleiro: no canto é mais difícil de pegar */cn=clamp(R()*.8+.1+((sk||10)-10)*.02,0,1);out=R()<clamp(pGoal/pOn*(.6+.8*cn),0,.97)?'goal':'save'}
    else out=R()<.2&&press<1.5?'block':'miss';if(out==='miss'&&!opt.pen&&R()<.14)out='post';
    xg=pGoal;T.st.sh++;T.st.xg+=xg;m.s.sh++;if(out==='goal'||out==='save')T.st.sot++,m.s.sot++;
    const gx=goalX(m.side);const gdir=m.side===0?1:-1;let ty,endZ=0,tx=gx+gdir*1.3;
    if(cn!=null){const gy=gk?clamp(gk.y,W/2-GW/2+.5,W/2+GW/2-.5):W/2;const far=gy<W/2?1:-1;const sd=R()<.75?far:-far;const reach=2.1+((gk?(gk.a.ref||10):10)-10)*.05;
      ty=clamp(gy+sd*(out==='goal'?Math.max(reach*.75,cn*(GW/2+1)):Math.min(reach,.4+cn*1.6)),W/2-GW/2+.25,W/2+GW/2-.25);endZ=cn>.7&&R()<.5?rnd(1.6,2.25):rnd(0,1.4);if(out==='save')tx=gx+(m.side===0?-.6:.6)}
    else if(out==='goal')ty=W/2+rnd(-GW/2+.4,GW/2-.4),endZ=rnd(0,2.1);
    else if(out==='save')ty=(gk?gk.y:W/2)+rnd(-1.6,1.6),endZ=rnd(0,1.5),tx=gx+(m.side===0?-.6:.6);
    else if(out==='block'){const no=this.nearestOpp(m);tx=no.o?no.o.x:m.x;ty=no.o?no.o.y:m.y}
    else{ty=W/2+(R()<.5?-1:1)*rnd(GW/2+.5,GW/2+7);endZ=R()<.4?rnd(2.6,5):rnd(0,1.5);tx=gx+gdir*rnd(1,2.5)}
    if(out==='post'){const bar=R()<.3;tx=gx;ty=bar?W/2+rnd(-GW/2+.5,GW/2-.5):W/2+(R()<.5?-1:1)*GW/2;endZ=bar?2.38:rnd(.3,2.2)}
    let defl=null;/* (16) desvio: zagueiro na linha do chute muda a trajetória */
    if(!opt.pen&&!opt.fk&&out!=='block'){for(const o of this.active(O)){if(O.slots[o.si].role==='GOL')continue;const sd=segDist(o.x,o.y,m.x,m.y,tx,ty);if(sd.d<.75&&sd.t>.12&&sd.t<.85&&R()<.28){defl={o,x:m.x+(tx-m.x)*sd.t,y:m.y+(ty-m.y)*sd.t,orig:out};break}}}
    if(defl){tx=defl.x;ty=defl.y;endZ=rnd(.2,1.2)}
    const d=hyp(tx-m.x,ty-m.y);
    // assistência pendente
    const assist=m.lp&&m.lp.side===m.side&&this.t-m.lpT<6&&m.lp!==m?m.lp:null;if(assist){assist.s.kp++;assist.r+=.12}
    this.ball.st='fly';this.ball.own=null;
    this.ball.fly={kind:'shot',sp:opt.pen?'pen':opt.fk?'fk':null,side:m.side,from:m,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur:Math.max(.25,d/((out==='block'?30:27)*(opt.head?.62+clamp(opt.run||0,0,7)*.04:1))),h:opt.head?.6:.4,endZ,out:defl?'defl':out,defl,xg,assist,gx:tx,gy:ty,cv:!opt.head&&!opt.pen&&!defl&&d>15&&R()<.5?rnd(-1.4,1.4)*(.4+(m.a.fin||10)/25):0};
    this.lastTouch=m.side;m.drib=null;if(!opt.head&&!opt.fk&&!opt.pen&&!opt.first)this.wind(m,this.ball.fly);
    this.ev('shot',m.side,'',{pid:m.id,xg,out});
    if(this.opts.sound)this.opts.sound('shot',m);
  }
  tackles(car,dt){
    const O=this.T[1-car.side];const pr=O.tac.press??1;
    /* (11) ombro a ombro: marcador correndo ao lado do portador; o mais forte desequilibra o outro */
    {const cs=hyp(car.vx,car.vy);if(cs>3)for(const o of this.active(O)){if(o.frozen>0||O.slots[o.si].role==='GOL')continue;const d=hyp(o.x-car.x,o.y-car.y);if(d<.85||d>1.5)continue;const os=hyp(o.vx,o.vy);if(os<3)continue;const al=(o.vx*car.vx+o.vy*car.vy)/(os*cs);if(al<.55||R()>dt*.9)continue;
      this.px('duel');const pw=((o.a.frc||10)-(car.a.frc||10))*.05+((o.a.agr||10)-10)*.015-((car.a.dri||10)-10)*.01;
      if(R()<clamp(.4+pw,.12,.8)){const b=this.ball;car.anim={k:'stumble',t:this.t};car.slowUntil=this.t+.6;car.frozen=.3;b.st='loose';b.own=null;b.vx=car.vx*.85+rnd(-1,1);b.vy=car.vy*.85+rnd(-1,1);b.vz=0;this.lastTouch=car.side;o.fx={k:'desarme',t:this.t};o.s.tk++;O.st.tk++;o.r+=.08;this.narr('ombro',o.side,{p:o.p.n,q:car.p.n,pid:o.id});return}
      o.frozen=.45;o.anim={k:'beaten',t:this.t};car.r+=.03;break}}
    for(const o of this.active(O)){if(o.frozen>0)continue;const d=hyp(o.x-car.x,o.y-car.y);if(d>1.6)continue;
      if(R()>(.6+pr*.22)*dt*(o.press?1.3:1))continue;
      const slideOk=R()<.2;if(d>1.15&&!slideOk)continue;// fora do alcance da perna: só o carrinho chega
      const foul=d<1.05&&R()<.12+pr*.03+((o.a.agr||10)-10)*.007+(o.a.des<car.a.dri-3?.05:0);
      if(foul){this.foul(o,car);return}
      const tr=car.trick&&this.t-car.trick.t<1.2?(car.trick.ok?.22:-.08):0;/* durante o drible de efeito: bem feito protege, mal feito entrega a bola */
      const pS=clamp(-tr+.36+(o.a.des-car.a.dri)*.035+(o.a.frc-car.a.frc)*.012+((o.a.agr||10)-10)*.006+((o.a.ace||10)-(car.a.ace||10))*.006-(this.t<car.ctrl?-.12:0),.12,.82);
      const slide=d>1.15||R()<.2;
      if(R()<pS){o.s.tk++;o.r+=.12;O.st.tk++;car.r-=.06;o.fx={k:'desarme',t:this.t};
        this.narr(slide?'carrinho':'desarme',o.side,{p:o.p.n,q:car.p.n,pid:o.id});
        if(slide){this.slideOf(o,car);const b=this.ball;b.st='loose';b.own=null;const a=Math.atan2(car.y-o.y,car.x-o.x)+rnd(-.6,.6);b.vx=Math.cos(a)*rnd(4,7);b.vy=Math.sin(a)*rnd(4,7);this.lastTouch=o.side}
        else{o.anim={k:'shoulder',t:this.t};car.anim={k:'stumble',t:this.t};if(R()<.62){this.give(o)}else{const b=this.ball;b.st='loose';b.own=null;b.vx=rnd(-4,4);b.vy=rnd(-4,4);this.lastTouch=o.side}}
        car.frozen=.35;return}
      else{o.frozen=.75;car.r+=.04;car.fx={k:'drible',t:this.t};if(slide)this.slideOf(o,car);else o.anim={k:'beaten',t:this.t}}
    }
  }
  // carrinho: o jogador desliza ~1,5 m na direção do adversário, fica no chão e levanta (parado de verdade)
  slideOf(o,car){const a=Math.atan2(car.y-o.y,car.x-o.x);o.anim={k:'slide',t:this.t};o.frozen=1.95;const v=Math.max(5.5,hyp(o.vx||0,o.vy||0)+1.5);o.vx=Math.cos(a)*v;o.vy=Math.sin(a)*v;o.slideT=this.t}/* desliza ~1,5 m, para no chão e levanta */
  foul(o,car){
    const O=this.T[o.side];O.st.fo++;o.r-=.1;car.anim={k:'fall',t:this.t};car.frozen=Math.max(car.frozen,2.2);if(R()<.5)this.slideOf(o,car);
    this.ev('foul',car.side,fill(pick(TXT.fk),{p:car.p.n}));
    if(R()<.1+(o.a.agr||10)*.004){o.yc++;O.st.yc++;this.cardT={t:this.t,red:o.yc>=2};if(o.yc>=2){o.off=true;o.red=true;this.ev('red',o.side,fill(pick(TXT.red),{p:o.p.n}),{pid:o.id});o.r-=1.2}else this.ev('card',o.side,fill(pick(TXT.card),{p:o.p.n}),{pid:o.id})}
    if(R()<.035){car.injured=true;this.ev('inj',car.side,fill(pick(TXT.inj),{p:car.p.n}),{pid:car.id});this.autoSubInjury(car)}
    const x=car.x,y=car.y;const side=car.side;const g=this.shotGeom(x,y,side);
    const T=this.T[side];
    const gx=goalX(side);if(Math.abs(x-gx)<16.5&&Math.abs(y-W/2)<20.16){this.penalty(side);return}
    let taker=car.off?this.active(T).filter(m=>T.slots[m.si].role!=='GOL')[0]:car;
    if(g.dist<29&&g.th>.2){const fk=this.taker(T,'fk');if(fk)taker=fk}
    this.setDead(1.4,()=>{taker.x=x;taker.y=y;this.give(taker,true);
      if(g.dist<29&&g.th>.2&&R()<.5){taker.decide=1e9;this.shoot(taker,{fk:true})}else{taker.decide=this.t+.5;taker.setP=true}},{kind:'falta',taker,x,y});
    this.ball.x=x;this.ball.y=y;
  }
  penalty(side){
    const T=this.T[side],O=this.T[1-side];const tk=this.taker(T,'pen');const gx=goalX(side);const sx=gx+(side===0?-11:11);
    this.ev('pen',side,`Pênalti para o ${T.name}! ${tk.p.n} vai bater.`,{pid:tk.id});
    this.ball.x=sx;this.ball.y=W/2;
    this.setDead(2.6,()=>{tk.x=sx-(side===0?.6:-.6);tk.y=W/2;const g=this.gk(O);if(g){g.x=gx+(side===0?-.3:.3);g.y=W/2}
      this.give(tk,true);tk.decide=1e9;this.shoot(tk,{pen:true})},{kind:'pen',taker:tk,x:sx,y:W/2,side});
  }
  arrive(f){
    const b=this.ball;
    if(f.kind==='shot'){
      const A=this.T[f.side],O=this.T[1-f.side];const m=f.from;
      if(f.out==='defl'){this.px('defl');const o=f.defl.o;const gx=goalX(f.side),gd=f.side===0?1:-1;const rr=R();this.lastTouch=O.side;
        if(rr<(f.defl.orig==='goal'?.35:f.defl.orig==='save'?.16:.06)){/* desvio que engana o goleiro */this.ev('miss',f.side,`Desviou em ${o.p.n}!`);this.ball.fly={kind:'shot',side:f.side,from:m,fx:f.tx,fy:f.ty,tx:gx+gd*1.3,ty:W/2+rnd(-GW/2+.5,GW/2-.5),t:0,dur:.45,h:.3,endZ:rnd(.2,1.8),out:'goal',xg:f.xg,assist:f.assist};b.st='fly';return}
        if(rr<.62){const top=f.ty<W/2;this.ev('miss',f.side,`Desviou em ${o.p.n} e foi para escanteio.`);this.outPlay(()=>this.corner(f.side,top),gd*rnd(5,9),(top?-1:1)*rnd(2,6),rnd(1,3));return}
        b.st='loose';b.own=null;b.x=f.tx;b.y=f.ty;b.z=f.endZ;const a=Math.atan2(f.ty-f.fy,f.tx-f.fx)+rnd(-1.4,1.4);b.vx=Math.cos(a)*rnd(5,10);b.vy=Math.sin(a)*rnd(5,10);b.vz=rnd(1,4);o.r+=.05;return}
      if(f.out==='goal'){A.score++;m.s.g++;m.r+=1.1;if(f.assist){f.assist.s.as++;f.assist.r+=.55}
        const gk=this.gk(O);if(gk)gk.r-=.35;for(const d of this.active(O))if(O.slots[d.si].role!=='GOL'&&O.slots[d.si].df.d<.3)d.r-=.12;
        this.ev('goal',f.side,fill(pick(TXT.goal),{p:m.p.n,t:A.name}),{pid:m.id,assist:f.assist?f.assist.id:null,score:[this.T[0].score,this.T[1].score],xg:f.xg});
        b.x=f.tx;b.y=f.ty;this.goalCele={side:f.side,mp:m};
        this.setDead(5.2,()=>{this.goalCele=null;this.kickoff(1-f.side,false,true)},{kind:'gol'});
        {/* (6) rede: a bola continua, estufa a rede, é segurada e cai */const sp=hyp(f.tx-f.fx,f.ty-f.fy)/Math.max(.2,f.dur),dl=hyp(f.tx-f.fx,f.ty-f.fy)||1;b.st='net';b.vx=(f.tx-f.fx)/dl*sp*.55;b.vy=(f.ty-f.fy)/dl*sp*.55;b.vz=0;b.z=f.endZ||0;b.netX=goalX(f.side)+(f.side===0?1:-1)*1.9}
        return}
      if(f.out==='save'){const gk=this.gk(O);gk.s.sv++;gk.r+=.32;gk.anim={k:'catch',t:this.t};this.ev('save',O.side,fill(pick(TXT.save),{g:gk.p.n,p:m.p.n}),{pid:gk.id});
        if(R()<.55){this.give(gk);gk.gkHold=true;gk.decide=this.t+1.6}else if(R()<.55){gk.anim={k:'parry',t:this.t};const top=b.y<W/2;const gd=f.side===0?1:-1;this.outPlay(()=>this.corner(f.side,top),gd*rnd(5,9),(top?-1:1)*rnd(3,7),rnd(2,5))}else{b.st='loose';b.own=null;b.vx=(f.side===0?-1:1)*rnd(6,11);b.vy=rnd(-7,7);this.lastTouch=O.side}return}
      if(f.out==='block'){const no=this.nearestOpp({x:f.tx,y:f.ty,side:f.side});if(no.o){no.o.r+=.1;no.o.s.int++}
        if(R()<.42){const top=f.ty<W/2;const gd=f.side===0?1:-1;this.lastTouch=O.side;this.ev('miss',f.side,pick(TXT.block));this.outPlay(()=>this.corner(f.side,top),gd*rnd(7,12),(top?-1:1)*rnd(2,6),rnd(1,4));return}b.st='loose';b.own=null;b.vx=rnd(-8,8);b.vy=rnd(-8,8);this.lastTouch=O.side;this.ev('miss',f.side,pick(TXT.block));return}
      if(f.out==='post'){this.postT={t:this.t,x:f.tx,y:f.ty,z:f.endZ};const gd=f.side===0?1:-1;const sp=hyp(f.tx-f.fx,f.ty-f.fy)/Math.max(.2,f.dur);const ux=(f.tx-f.fx)/(sp*f.dur||1),uy=(f.ty-f.fy)/(sp*f.dur||1);
        const bar=f.endZ>2.3;const ps=f.ty<W/2?-1:1;const off=rnd(-.11,.11);/* (5) trave: o rebote depende de onde a bola bate no poste */
        if(!bar&&off*ps<-.05&&R()<.25){this.px('postIn');this.ev('post',f.side,`Bateu na trave e entrou!`,{pid:m.id});f.out='goal';f.tx=goalX(f.side)+gd*1.2;f.ty=W/2+ps*(GW/2-.5);return this.arrive(f)}
        this.ev('post',f.side,bar?`No travessão! ${m.p.n} quase marca!`:`Na trave! ${m.p.n} quase marca!`,{pid:m.id});b.st='loose';b.own=null;b.x=f.tx-gd*.3;b.y=f.ty;b.z=f.endZ;
        if(bar){b.vx=-gd*Math.abs(ux)*sp*rnd(.2,.4);b.vy=uy*sp*.3;b.vz=R()<.5?-rnd(2,5):rnd(1.5,4)}else{const inward=off*ps<0;b.vx=-gd*Math.abs(ux)*sp*rnd(.3,.5);b.vy=(inward?-ps:ps)*sp*rnd(.15,.35)+uy*sp*.2;b.vz=rnd(0,1.5)}
        this.lastTouch=f.side;return}
      m.anim={k:'lament',t:this.t};this.ev('miss',f.side,fill(pick(TXT.miss),{p:m.p.n}));{const ux=f.tx-f.fx,uy=f.ty-f.fy,ul=hyp(ux,uy)||1,sp=f.endZ>2.4?12:9;this.outPlay(()=>this.goalKick(O.side),ux/ul*sp,uy/ul*sp,f.endZ>2.4?2:0)}return}
    if(f.kind==='cross'){
      const A=this.T[f.side],O=this.T[1-f.side];
      const near=(T)=>{let best=null,bd=99;for(const m of this.active(T)){if(T.slots[m.si].role==='GOL')continue;const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd){bd=d;best=m}}return {m:best,d:bd}};
      const reach=m=>m?2.1+((m.a.cab||10)-10)*.055+((m.a.frc||10)-10)*.025+((m.a.ace||10)-10)*.015+(hyp(m.vx,m.vy)>2.5?.25:0):0;/* (14) salto: cabeceio, força, impulsão e corrida */
      const a=near(A),d=near(O);const gk=this.gk(O);
      const pA=clamp(.38+((a.m?a.m.a.cab:8)-(d.m?d.m.a.cab:8))*.03+(a.d<d.d?.12:-.12),.12,.7);
      if(gk&&hyp(gk.x-f.tx,gk.y-f.ty)<5+((gk.a.sai||10)-10)*.15&&R()<.3+(gk.a.sai||10)*.012){if(R()<.35){gk.anim={k:'punch',t:this.t};this.narr('gksoco',O.side,{g:gk.p.n,pid:gk.id});b.st='loose';b.own=null;b.x=f.tx;b.y=f.ty;b.z=2.2;const dir=O.side===0?1:-1;b.vx=dir*rnd(9,15);b.vy=rnd(-6,6);this.lastTouch=O.side;return}this.give(gk);gk.gkHold=true;gk.anim={k:'catchHigh',t:this.t};this.narr('gkcruz',O.side,{g:gk.p.n,pid:gk.id});gk.decide=this.t+1.6;return}
      const aIn=a.m&&a.d<=reach(a.m),dIn=d.m&&d.d<=reach(d.m);
      if(aIn&&(!dIn||R()<pA)){const hx=a.m.x+(f.tx-a.m.x)*.5,hy=a.m.y+(f.ty-a.m.y)*.5;a.m.jumpT=this.t;const run=hyp(a.m.vx,a.m.vy);this.give(a.m,true);b.x=hx;b.y=hy;b.z=2;this.shoot(a.m,{head:true,run});return}
      if(!dIn){/* ninguém alcança: a bola cai e quica na área */b.st='loose';b.own=null;b.x=f.tx;b.y=f.ty;b.z=.6;const ux=f.tx-f.fx,uy=f.ty-f.fy,ul=hyp(ux,uy)||1;b.vx=ux/ul*4;b.vy=uy/ul*4;this.lastTouch=f.side;return}
      d.m.jumpT=this.t;
      if(R()<.3){d.m.r+=.05;const top=f.ty<W/2;const gd=f.side===0?1:-1;this.lastTouch=O.side;this.outPlay(()=>this.corner(f.side,top),gd*rnd(6,10),(top?-1:1)*rnd(3,8),rnd(2,5));return}
      {d.m.r+=.06;const dir=O.side===0?1:-1;b.st='fly';b.fly={kind:'clear',side:O.side,from:d.m,recv:null,fx:f.tx,fy:f.ty,tx:clamp(f.tx+dir*rnd(18,32),3,L-3),ty:clamp(f.ty+rnd(-15,15),3,W-3),t:0,dur:1.1,h:8,endZ:0};this.lastTouch=O.side;return}
    }
    // passe / afastamento
    const A=this.T[f.side];
    if(f.icp&&!f.icp.off&&f.slideIcp){/* corte de carrinho: desliza na linha do passe; às vezes fica com a bola, às vezes só desvia */const o=f.icp;o.s.int++;o.r+=.12;f.from.r-=.05;this.slideOf(o,{x:f.ix,y:f.iy});this.px('slideIcp');this.narr('corte',o.side,{p:o.p.n,pid:o.id});o.fx={k:'desarme',t:this.t};
      if(R()<.35){o.frozen=.2;this.give(o);o.anim=null;o.slideT=null}else{b.st='loose';b.own=null;b.x=f.ix;b.y=f.iy;const a=Math.atan2(f.ty-f.fy,f.tx-f.fx)+(R()<.5?-1:1)*rnd(.9,1.9);b.vx=Math.cos(a)*rnd(4,8);b.vy=Math.sin(a)*rnd(4,8);b.vz=0;b.spillT=this.t;this.lastTouch=o.side}return}
    if(f.icp&&!f.icp.off){const o=f.icp;o.s.int++;o.r+=.1;f.from.r-=.05;this.give(o);this.lastTouch=o.side;return}
    if(f.offs){const D=1-f.side;this.flagT={t:this.t,x:f.offX,side:f.side};this.ev('off',f.side,`Impedimento! A bandeira sobe para ${f.recv?f.recv.p.n:'o atacante'}.`,{pid:f.recv?f.recv.id:null});b.x=f.tx;b.y=f.ty;this.restartWith(D,clamp(f.offX,1,L-1),clamp(f.offY,1,W-1),'falta');return}
    let taker=null,bd=2.4;
    if(f.recv&&!f.recv.off){const d=hyp(f.recv.x-f.tx,f.recv.y-f.ty);if(d<3.2){taker=f.recv;bd=d}}
    for(const T of this.T)for(const m of this.active(T)){const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd-(m.side!==f.side?.3:0)){bd=d;taker=m}}
    b.x=f.tx;b.y=f.ty;
    if(f.self&&f.recv&&!f.recv.off){const d=hyp(f.recv.x-f.tx,f.recv.y-f.ty);if(d<2.6&&(!taker||taker===f.recv||bd>d-.4)){taker=f.recv}}
    if(taker&&taker.side===f.side&&!f.self&&f.kind==='pass'&&!taker.off){const ts=this.T[taker.side].slots[taker.si].role;const gx=goalX(taker.side),dG=hyp(gx-taker.x,W/2-taker.y);
      /* (9) chute de primeira: bola chegando na área e atacante bem colocado */
      if(ts!=='GOL'&&dG<19&&Math.abs(taker.y-W/2)<13&&R()<.12+((taker.a.fin||10)-10)*.016){A.st.pc++;f.from.s.pc++;this.give(taker,true);b.z=f.endZ||0;this.px('first');this.narr('primeira',taker.side,{p:taker.p.n,pid:taker.id});this.shoot(taker,{first:true,volley:(f.endZ||0)>.6});return}
      /* (7) domínio: passe forte, bola alta, chuva, cansaço e marcação fazem a bola espirrar */
      const bs=hyp(f.tx-f.fx,f.ty-f.fy)/Math.max(.2,f.dur);const pBad=clamp((bs-16)*.017+(f.h>3?.045:0)+((f.endZ||0)>1.2?.03:0)+(this.wet?.05:0)-((taker.a.dri||10)-10)*.014+(1-taker.stam/100)*.06+(this.nearestOpp(taker).d<2?.04:0),0,.32);
      if(R()<pBad){const ul=hyp(f.tx-f.fx,f.ty-f.fy)||1;b.x=f.tx;b.y=f.ty;b.z=f.endZ||0;b.st='loose';b.own=null;b.vx=(f.tx-f.fx)/ul*rnd(2.5,5.5)+rnd(-1.5,1.5);b.vy=(f.ty-f.fy)/ul*rnd(2.5,5.5)+rnd(-1.5,1.5);b.vz=(f.endZ||0)>.8?rnd(1,2.5):0;b.spillT=this.t;taker.frozen=Math.max(taker.frozen||0,.25);this.lastTouch=taker.side;this.px('bad');this.narr('dominio',taker.side,{p:taker.p.n,pid:taker.id});return}}
    if(taker){if(taker.side===f.side&&!f.self){const sk=this._stk&&this._stk.s===f.side?this._stk:(this._stk={s:f.side,n:0});sk.n++;if(sk.n===10)this.narr('toque',f.side,{t:A.name})}else this._stk=null;
      if(f.self&&taker===f.recv){f.from.r+=.05}else if(taker.side===f.side){A.st.pc++;f.from.s.pc++;f.from.r+=.02}else{taker.s.int++;taker.r+=.08;f.from.r-=.05}this.give(taker);this.lastTouch=taker.side;return}
    const ux=f.tx-f.fx,uy=f.ty-f.fy,ul=hyp(ux,uy)||1;b.st='loose';b.own=null;b.vx=ux/ul*5;b.vy=uy/ul*5;this.lastTouch=f.side;if(f.side===f.from.side)f.from.r-=.03;
    this.checkOut();
  }

  /* ---------- substituições ---------- */
  sub(side,outId,inPid){
    const T=this.T[side];if(T.subsLeft<=0)throw new Error('Sem substituições disponíveis.');
    const i=T.mps.findIndex(m=>m.id===outId&&!m.off);if(i<0)throw new Error('Jogador não está em campo.');
    const bi=T.bench.findIndex(p=>p.id===inPid);if(bi<0)throw new Error('Jogador não está no banco.');
    const old=T.mps[i];const p=T.bench[bi];const nm=this.mkMp(p,T,old.si,12+(5-T.subsLeft));nm.x=old.x;nm.y=old.y;nm.min0=this.t;
    old.off=true;old.subbed=true;old.minOut=this.t;T.out.push(old);T.mps[i]=nm;T.bench.splice(bi,1);T.subsLeft--;
    if(this.ball.own===old){this.give(nm,true)}
    this.ev('sub',side,`Sai ${old.p.n}, entra ${p.n}.`,{pid:p.id});return nm;
  }
  autoSubInjury(m){const T=this.T[m.side];if(T.subsLeft<=0||!T.bench.length){m.stam=Math.min(m.stam,40);return}
    const role=T.slots[m.si].role;const cand=T.bench.slice().sort((a,b)=>C.ratingIn(b,role)-C.ratingIn(a,role))[0];
    setTimeout?0:0;this.pendingSub=this.pendingSub||[];this.pendingSub.push([m.side,m.id,cand.id]);}
  aiTactics(){
    const min=this.minute;const marks=[46,60,72,82];if(!marks.includes(min)||this._aiMin===min)return;this._aiMin=min;
    for(const T of this.T){if(!T.ai)continue;const O=this.T[1-T.side];const diff=T.score-O.score;const t=T.tac;const old=JSON.stringify([t.ment,t.press,t.tempo]);
      const xgD=T.st.xg-O.st.xg;
      if(diff<0){t.ment=Math.min(2,(t.ment||0)+1);t.press=2;t.tempo=2;if(min>=72)t.pass=2}
      else if(diff>0&&min>=60){t.ment=Math.max(-2,(t.ment||0)-1);t.tempo=0;t.press=xgD<0?2:1}
      else if(diff===0&&min>=72){t.ment=xgD>.3?1:xgD<-.3?-1:t.ment||0}
      if(JSON.stringify([t.ment,t.press,t.tempo])!==old){const txt=diff<0?`O técnico do ${T.name} manda o time para cima.`:diff>0?`O ${T.name} recua e tenta segurar o resultado.`:`O ${T.name} ajusta a postura em campo.`;this.ev('tac',T.side,txt)}}
  }
  aiSubs(){
    if(this.pendingSub&&this.pendingSub.length){for(const [s,o,i] of this.pendingSub.splice(0))try{this.sub(s,o,i)}catch(e){}}
    const min=this.minute;if(min<58)return;
    for(const T of this.T){if(!T.ai&&!(T.side===this.opts.userSide&&this.opts.autoSubsUser))continue;if(T.subsLeft<=1&&min<80)continue;
      const tired=this.active(T).filter(m=>T.slots[m.si].role!=='GOL'&&m.stam<58).sort((a,b)=>a.stam-b.stam)[0];
      if(tired&&T.bench.length&&R()<.5){const role=T.slots[tired.si].role;const cand=T.bench.filter(p=>p.p!=='GOL'||role==='GOL').sort((a,b)=>C.ratingIn(b,role)-C.ratingIn(a,role))[0];if(cand)try{this.sub(T.side,tired.id,cand.id)}catch(e){}}}
  }
  resumeFromHT(){if(this.phase==='ht')this.phase='play'}

  /* ---------- fim ---------- */
  finish(){
    for(const T of this.T){const O=this.T[1-T.side];const res=T.score>O.score?.35:T.score<O.score?-.3:0;
      for(const m of [...T.mps,...T.out]){m.r+=res;if(O.score===0&&(T.slots[m.si].role==='GOL'||T.slots[m.si].df.d<.3))m.r+=.45;m.r=clamp(m.r,3,10)}}
  }
  result(){
    const [H,A]=this.T;const ratings={},minutes={},fit={},scorers=[],assists=[],injuries=[],oppScorers=[];
    const u=this.opts.userSide??0;
    for(const T of this.T)for(const m of [...T.mps,...T.out]){if(T.side!==u)continue;const mins=Math.round(((m.minOut??this.t)-m.min0)/this.matchSec*90);ratings[m.id]=+m.r.toFixed(1);minutes[m.id]=Math.max(1,mins);fit[m.id]=Math.round(m.stam);if(m.injured)injuries.push({pid:m.id,rounds:1+Math.floor(R()*4)})}
    for(const e of this.events)if(e.type==='goal'){if(e.side===u){scorers.push(e.pid);if(e.assist)assists.push(e.assist)}else oppScorers.push(e.pid)}
    return {home:H.club.id,away:A.club.id,hg:H.score,ag:A.score,ratings,minutes,fit,scorers,assists,injuries,oppScorers};
  }
  runToEnd(maxSteps=1e6){const dt=1/30;let n=0;while(this.phase!=='ft'&&n<maxSteps){if(this.phase==='ht')this.resumeFromHT();this.step(dt);n++}return this}
  snapshot(){const a=[];this._f=this.flip;for(const T of this.T)for(const m of T.mps)a.push(m.off?null:[m.x,m.y,m.ph,m.fs??m.face]);return {t:this.t,b:[this.ball.x,this.ball.y,this.ball.z],p:a,own:this.ball.own?this.ball.own.id:null,sc:[this.T[0].score,this.T[1].score]}}
}
return {mulberry,Match,L,W,GW,depth,lat,toX,toY};
})();
if(typeof module!=='undefined')module.exports=C11Match;
