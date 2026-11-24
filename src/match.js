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
const fill=(s,o)=>s.replace(/\{(\w)\}/g,(_,k)=>o[k]||'');

class Match{
  constructor(home,away,opts={}){
    this.opts=opts;RNG=opts.seed!=null?mulberry(opts.seed):Math.random;this.T=[this.mkTeam(home,0),this.mkTeam(away,1)];
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
  give(mp,silent){const b=this.ball;mp.ko=mp.setP=mp.throwIn=false;b._fresh=true;if(!silent&&this.opts.sound&&b.st==='fly')this.opts.sound('trap',mp);b.st='own';b.own=mp;b.vx=b.vy=0;b.z=0;b.fly=null;this.lastSide=mp.side;b.last=mp.side;
    mp.ctrl=this.t+(silent?0:.1+(1-mp.a.dri/20)*.18+(this._hardPass?.15:0)+(hyp(mp.vx||0,mp.vy||0)>5?.12:0));mp.decide=mp.ctrl+this.react(mp);this._hardPass=false}
  react(mp){const T=this.T[mp.side];return rnd(.12,.32)*[1.3,1,.78][T.tac.tempo??1]*(1.16-(mp.a.vis*.5+mp.a.dec*.5)/20*.34)}

  /* ---------- passo ---------- */
  step(dt){
    if(this.phase==='ft')return;
    for(const T of this.T)for(const m of T.mps){m._px=m.x;m._py=m.y;m._pph=m.ph}const bb=this.ball;bb._px=bb.x;bb._py=bb.y;bb._pz=bb.z;
    if(this.phase==='ready')this.phase='play';
    if(this.phase==='ht')return;
    if(this.dead>0){this.dead-=dt;this.updateTargets(dt,true);if(this.goalCele)this.celeTargets();this.move(dt);this.outMove(dt);this.sceneCut(dt);if(this.dead<=0&&this.setup&&this.setup.kind==='ko'&&!this.koReady()&&(this.koWait=(this.koWait||0)+dt)<14){this.dead=.05;return}if(this.dead<=0){const f=this.deadFn;this.deadFn=null;this.setup=null;if(f)f()}return}
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
    for(const T of this.T){
      const s=T.side,O=this.T[1-s];const tac=T.tac;const att=poss===s;
      const bd=depth(b.x,s),bw=lat(b.y,s);
      let lastDef=0;for(const o of this.active(O))if(O.slots[o.si].role!=='GOL')lastDef=Math.max(lastDef,depth(o.x,s));
      for(const m of this.active(T)){
        const sl=T.slots[m.si];const fn=C.fnOf(sl.role,sl.fn);const gk=sl.role==='GOL';let td,tw;
        if(att){const a=sl.a;
          if(gk){td=.025+bd*.12+(fn.fwd||0);tw=.5+(bw-.5)*.2}
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
            td=Math.min(td,Math.max(lastDef,bd)+.012);
            // corrida em diagonal nas costas da zaga (pode cair em impedimento se o passe atrasar)
            if(['ATA','PD','PE','MEI'].includes(sl.role)&&bd>.35){if(!(m.runUntil>tt)&&R()<.011*(1+(m.a.vis||10)/20)){m.runUntil=tt+1.4+R();m.runW=clamp(tw+(R()-.5)*.25,.1,.9)}
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
        const spr=!!(m.runUntil>tt&&att);m.tx=toX(td,s);m.ty=toY(tw,s);m.sprint=spr;
        // goleiro sai do gol para fechar o ângulo no mano a mano
        if(gk&&!att&&b.st==='own'&&b.own.side!==s){const c=b.own,ogx=ownGoalX(s);const dg=hyp(c.x-ogx,c.y-W/2);if(dg<20&&Math.abs(c.y-W/2)<16){const k=clamp((20-dg)/14,0,1)*.42;m.tx=ogx+(c.x-ogx)*k;m.ty=W/2+(c.y-W/2)*k;m.sprint=dg<12}}
      }
    }
    if(dead){this.setPieceTargets();return}
    // marcação / pressão / apoio
    if(b.st==='own'){
      const car=b.own,A=this.T[car.side],O=this.T[1-car.side];
      const pressR=[9,16,26][O.tac.press??1];
      const ds=this.active(O).filter(m=>O.slots[m.si].role!=='GOL').map(m=>({m,d:hyp(m.x-car.x,m.y-car.y)})).sort((a,b)=>a.d-b.d);
      const og=ownGoalX(O.side);
      if(ds[0]&&ds[0].d<pressR){const m=ds[0].m;const ux=(og-car.x),uy=(W/2-car.y),ul=hyp(ux,uy)||1;m.tx=car.x+ux/ul*.9;m.ty=car.y+uy/ul*.9;m.sprint=true;m.press=true}
      if(ds[1]&&(O.tac.press??1)>=1&&ds[1].d<20){const m=ds[1].m;const ux=(og-car.x),uy=(W/2-car.y),ul=hyp(ux,uy)||1;m.tx=car.x+ux/ul*6;m.ty=car.y+uy/ul*6;m.sprint=ds[1].d>6}
      const pressing=new Set(ds.slice(0,2).map(x=>x.m));
      const atts=this.active(A).filter(m=>m!==car);
      for(const m of this.active(O)){if(pressing.has(m)||O.slots[m.si].role==='GOL')continue;
        let best=null,bd=9;for(const a of atts){const d=hyp(a.x-m.tx,a.y-m.ty);if(d<bd){bd=d;best=a}}
        if(best){const ux=og-best.x,uy=W/2-best.y,ul=hyp(ux,uy)||1;const gx=best.x+ux/ul*1.6,gy=best.y+uy/ul*1.6;const k=.55*(O.slots[m.si].df.d<.3?1:.8);m.tx=m.tx*(1-k)+gx*k;m.ty=m.ty*(1-k)+gy*k}}
      // linhas de passe: quem está sem a bola procura espaço
      if(this.tick%8===0)for(const m of atts){if(A.slots[m.si].role==='GOL')continue;
        let bx=0,by=0,bv=-1e9;
        for(const [ox,oy] of [[0,0],[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,3],[3,-3],[-3,-3]]){const x=clamp(m.tx+ox,1,L-1),y=clamp(m.ty+oy,1,W-1);
          let open=10;for(const o of this.active(O)){const d=hyp(o.x-x,o.y-y);if(d<open)open=d}
          let lane=6;for(const o of this.active(O)){const sd=segDist(o.x,o.y,car.x,car.y,x,y);if(sd.t>.05&&sd.t<.95&&sd.d<lane)lane=sd.d}
          const dc=hyp(x-car.x,y-car.y);const v=open*.6+lane*.8-hyp(ox,oy)*.25-(dc<6?4:0);if(v>bv){bv=v;bx=ox;by=oy}}
        m.sx=bx;m.sy=by}
      for(const m of atts){if(m.sx!=null){m.tx=clamp(m.tx+m.sx,1,L-1);m.ty=clamp(m.ty+m.sy,1,W-1)}}
      // portador
      if(car.ko||car.setP||car.throwIn){car.tx=car.x;car.ty=car.y;car.sprint=false;car.drib=null;// cobrador parado: só pode tocar a bola
        if(car.ko)for(const m of this.active(O)){const dx=m.tx-L/2,dy=m.ty-W/2,dd=hyp(dx,dy)||1;if(dd<9.6){m.tx=L/2+dx/dd*9.6;m.ty=W/2+dy/dd*9.6}if((m.tx-L/2)*(ownGoalX(O.side)-L/2)<0)m.tx=L/2+(ownGoalX(O.side)>L/2?1:-1)*.5;m.press=false;m.sprint=false}}
      else if(car.drib){car.tx=car.drib.x;car.ty=car.drib.y;car.sprint=true}else{car.tx=car.x+(car.side===0?1:-1)*.8;car.ty=car.y}
    }else if(b.st==='fly'){
      const f=b.fly;if(f.recv&&!f.recv.off){f.recv.tx=f.ix??f.tx;f.recv.ty=f.iy??f.ty;f.recv.sprint=true}
      if(f.icp){f.icp.tx=f.ix;f.icp.ty=f.iy;f.icp.sprint=true}
      if(f.kind==='pass'||f.kind==='clear'){const O=this.T[1-f.side];let best=null,bd=1e9;for(const m of this.active(O)){if(O.slots[m.si].role==='GOL')continue;const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd){bd=d;best=m}}if(best&&bd<15&&best!==f.icp){best.tx=f.tx;best.ty=f.ty;best.sprint=true}}
      // chute: o goleiro firma na posição e só ajusta um passo para o lado (o mergulho fica por conta da animação)
      if(f.kind==='shot'){const g=this.gk(this.T[1-f.side]);if(g){if(g.shotY0==null||g.shotF!==f){g.shotF=f;g.shotX0=g.x;g.shotY0=g.y}g.tx=g.shotX0;g.ty=g.shotY0+clamp((f.gy??g.shotY0)-g.shotY0,-.9,.9);g.sprint=false}}
    }else if(b.st==='loose'){
      for(const T of this.T){let best=null,bd=1e9;for(const m of this.active(T)){const d=hyp(m.x-b.x,m.y-b.y)/this.spd(m);if(d<bd){bd=d;best=m}}if(best){best.tx=b.x+b.vx*.3;best.ty=b.y+b.vy*.3;best.sprint=true}}
      const g=this.gk(this.T[b.x<L/2?0:1]);if(g&&hyp(g.x-b.x,g.y-b.y)<12&&Math.abs(b.x-ownGoalX(g.side))<16.5){g.tx=b.x;g.ty=b.y;g.sprint=true}
    }
    for(const T of this.T)for(const m of this.active(T))if(m!==b.own)m.press=m.press&&b.st==='own';
  }
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
      big.forEach((m,i)=>{m.tx=gx+dir*(6+(i%3)*3.5);m.ty=W/2+(i-2)*4});
      const defs=this.active(O).filter(m=>O.slots[m.si].role!=='GOL').sort((a,b)=>b.a.cab-a.a.cab).slice(0,6);
      defs.forEach((m,i)=>{const t=big[i%big.length];m.tx=t.tx+dir*-1.2;m.ty=t.ty+(i>=big.length?2:0)});
      if(sp.taker){sp.taker.tx=sp.x+(sp.x<L/2?-.6:.6);sp.taker.ty=sp.y+(sp.y<W/2?-.5:.5);sp.taker.sprint=true}
      const g2=this.gk(O);if(g2){g2.tx=gx+(sp.side===0?-.6:.6);g2.ty=W/2+(sp.y<W/2?-1.5:1.5)}
    }else if(sp.kind==='pen'){const gx=goalX(sp.side);for(const T of this.T)for(const m of this.active(T)){if(m===sp.taker){m.tx=sp.x-(sp.side===0?1:-1);m.ty=W/2;continue}
        if(T.slots[m.si].role==='GOL'&&T.side!==sp.side){m.tx=gx;m.ty=W/2;continue}if(Math.abs(m.tx-gx)<18){m.tx=gx+(sp.side===0?-19:19)}}}
    else if(sp.kind==='tiro'&&sp.taker){// tiro de meta: o goleiro se afasta uns passos e vem correndo para bater
      const g=sp.taker,dir=sp.x<L/2?1:-1,run=this.dead>.8;g.tx=run?sp.x-dir*3:sp.x-dir*.3;g.ty=run?sp.y-1.4:sp.y-.15;g.sprint=run&&hyp(g.x-g.tx,g.y-g.ty)>5}
    else if(sp.taker){sp.taker.tx=sp.x;sp.taker.ty=sp.y;sp.taker.sprint=true}
    if(sp.kind==='falta'&&sp.taker){const O=this.T[1-sp.taker.side];for(const m of this.active(O)){const dx=m.tx-sp.x,dy=m.ty-sp.y,d=hyp(dx,dy)||1;if(d<9.3){m.tx=clamp(sp.x+dx/d*9.3,.5,L-.5);m.ty=clamp(sp.y+dy/d*9.3,.5,W-.5)}}}
  }
  separate(){// corpos não se atravessam: quem fica a menos de 0,7 m é afastado (o dono da bola cede menos)
    const all=[];for(const T of this.T)for(const m of this.active(T))all.push(m);const own=this.ball.own;
    for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=.7||d<1e-4)continue;
      const push=(.7-d)*.5,ux=dx/d,uy=dy/d;const wa=a===own?.25:b===own?.75:.5,wb=1-wa;a.x-=ux*push*2*wa;a.y-=uy*push*2*wa;b.x+=ux*push*2*wb;b.y+=uy*push*2*wb}}
  move(dt){
    for(const T of this.T)for(const m of this.active(T)){
      if(m.frozen>0){m.frozen-=dt;const fr=m.slideT!=null&&this.t-m.slideT<.6?.93:m.kwT!=null&&this.t-m.kwT<.35?.9:.85;m.vx*=fr;m.vy*=fr;m.x+=m.vx*dt;m.y+=m.vy*dt;continue}
      const dx=m.tx-m.x,dy=m.ty-m.y,d=hyp(dx,dy);const own=this.ball.own===m;
      if(own&&(m.ko||m.setP||m.throwIn)){m.vx=m.vy=0;continue}// cobrador parado esperando para tocar
      let v=this.spd(m)*(m.sprint||d>8?1:d>3?.78:.45)*(own?.86:1);
      const want=d<.25?0:Math.min(v,d*3);const ux=d?dx/d:0,uy=d?dy/d:0;
      const ak=Math.min(1,dt*this.acc(m));m.vx+=(ux*want-m.vx)*ak;m.vy+=(uy*want-m.vy)*ak;
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
      this.tackles(m,dt);if(b.own!==m)return;
      if(this.t>=m.decide&&this.t>=m.ctrl)this.decide(m);
      return}
    if(b.st==='fly'){const f=b.fly;if(f.wd>0){f.wd-=dt;return}f.t+=dt;const k=Math.min(1,f.t/f.dur);const ex=f.ix??f.tx,ey=f.iy??f.ty;
      const ke=f.kind==='shot'?k:(f.h<.6?1-Math.pow(1-k,1.55):k);b.x=f.fx+(ex-f.fx)*ke;b.y=f.fy+(ey-f.fy)*ke;b.z=f.h*4*k*(1-k)+(f.kind==='shot'?f.endZ*k:0);
      if(k>=1)this.arrive(f);return}
    if(b.st==='loose'){b.x+=b.vx*dt;b.y+=b.vy*dt;const fr=Math.max(0,1-1.5*dt);b.vx*=fr;b.vy*=fr;b.z=Math.max(0,b.z-dt*8);
      if(this.checkOut())return;
      let best=null,bs=-1;for(const T of this.T)for(const m of this.active(T)){const d=hyp(m.x-b.x,m.y-b.y);if(d<1.3&&m.frozen<=0){const isGk=T.slots[m.si].role==='GOL'&&Math.abs(b.x-ownGoalX(T.side))<16.5;const s=R()*(m.a.dri+m.a.frc)+(isGk?30:0);if(s>bs){bs=s;best=m}}}
      if(best){this.give(best);if(best.side!==this.lastTouch)this.T[best.side].st.tk+=0;this.lastTouch=best.side}
    }
  }
  // bola saindo de campo: continua rolando/voando um pouco antes da reposição
  outPlay(fn,vx,vy,vz){const b=this.ball;b.st='outp';b.own=null;b.fly=null;b.vx=vx;b.vy=vy;b.vz=vz||0;this.dead=1.15;this.deadFn=fn;this.setup=null}
  outMove(dt){const b=this.ball;if(b.st!=='outp')return;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vz=(b.vz||0)-9.8*dt;b.z=Math.max(0,(b.z||0)+b.vz*dt);if(b.z<=0&&b.vz<0)b.vz=-b.vz*.35;
    const fr=Math.max(0,1-(b.z>0?.3:1.6)*dt);b.vx*=fr;b.vy*=fr;
    // placas de publicidade
    if(b.x<-4.3||b.x>L+4.3){b.x=clamp(b.x,-4.3,L+4.3);b.vx*=-.25}if(b.y<-3.8||b.y>W+3.8){b.y=clamp(b.y,-3.8,W+3.8);b.vy*=-.25}}
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
  cross(taker,side,x,y){
    const gx=goalX(side);const dir=side===0?-1:1;const tx=gx+dir*rnd(5,11),ty=W/2+rnd(-6,6);
    const tdir=x<L/2?-1:1;taker.x=x+tdir*.5;taker.y=y+(y<W/2?-.4:.4);taker.kt=this.t;taker.kk='cross';if(this.opts.sound)this.opts.sound('pass',taker);this.ball.x=x;this.ball.y=y;this.lastTouch=side;this.T[side].st.pa++;
    this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'cross',side,fx:x,fy:y,tx,ty,t:0,dur:1.25,h:5,from:taker,endZ:0};this.wind(taker,this.ball.fly);
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
      if(m.gkKick){m.gkKick=false;if(!c.length||R()<.45)return this.clear(m)}
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
    let best={k:'hold',v:.12+nz*rnd(0,.05)};
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
      val+=nz*rnd(0,.07);
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
    m.drib=null;
    if(best.k==='shot')return this.shoot(m);
    if(best.k==='pass')return this.pass(m,best.q,best.ps,best.risk,best.d);
    if(best.k==='thru')return this.pass(m,best.q,best.ps,.2,best.d,{x:best.px,y:best.py});
    if(best.k==='cross'){const gx2=goalX(m.side);const dir=m.side===0?-1:1;const tgt=this.active(T).filter(q=>q!==m&&Math.abs(q.x-gx2)<18).sort((a,b)=>b.a.cab-a.a.cab)[0];
      const tx=tgt?clamp(tgt.x,Math.min(gx2,gx2+dir*14),Math.max(gx2,gx2+dir*14)):gx2+dir*rnd(6,11),ty=tgt?clamp(tgt.y,W/2-9,W/2+9):W/2+rnd(-5,5);
      T.st.pa++;m.s.pa++;if(tgt){tgt.lp=m;tgt.lpT=this.t}
      this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'cross',side:m.side,fx:this.ball.x,fy:this.ball.y,tx:gx2+dir*Math.abs(tx-gx2),ty,t:0,dur:hyp(tx-m.x,ty-m.y)/17+.3,h:4.5,from:m,endZ:0};this.wind(m,this.ball.fly);this.lastTouch=m.side;return}
    if(best.k==='clear')return this.clear(m);
    if(best.k==='drib'){const dir=m.side===0?1:-1;const no=this.nearestOpp(m);let ty=m.y;if(no.o&&no.d<6)ty+=(m.y>no.o.y?1:-1)*rnd(2,5);ty+=(W/2-m.y)*(md>.7?.3:.05);
      m.drib={x:clamp(m.x+dir*rnd(4,7),1,L-1),y:clamp(ty,2,W-2)};m.decide=this.t+rnd(.3,.55);return}
    m.decide=this.t+rnd(.25,.5);
  }
  pass(m,q,ps,risk,d,pt){
    const T=this.T[m.side],O=this.T[1-m.side];T.st.pa++;m.s.pa++;m.kt=this.t;if(this.opts.sound)this.opts.sound('pass',m);
    const isGkP=T.slots[m.si].role==='GOL'&&this.ball.st==='own';
    const lead=.35;let tx=pt?pt.x:q.x+(q.tx-q.x)*lead*.3,ty=pt?pt.y:q.y+(q.ty-q.y)*lead*.3;tx=clamp(tx,.5,L-.5);ty=clamp(ty,.5,W-.5);
    const wasThrow=!!m.throwIn;const lofted=pt?d>30:(d>27||(risk>.45&&d>15));m.kk=m.throwIn?'throw':isGkP&&d<32&&!pt&&m.gkHold?'gthrow':lofted?'long':'pass';m.throwIn=false;m.gkHold=false;
    const speed=lofted?15.5:d<15?17:19;let dur=d/speed+(lofted?.25:.05);
    const press=this.nearestOpp(m).d;
    const acc=clamp(.99-d*.0028*(1.5-m.a.pas/20)-(press<1.8?.07:0)-(lofted?.05:0),.55,.985);
    let recv=q;
    if(R()>acc){const ang=R()*6.283,e=rnd(3,8);tx=clamp(tx+Math.cos(ang)*e,-1,L+1);ty=clamp(ty+Math.sin(ang)*e,-1,W+1);recv=null}
    // interceptação
    let icp=null,ix,iy,its=1;
    for(const o of this.active(O)){const sd=segDist(o.x,o.y,m.x,m.y,tx,ty);if(sd.t<.06)continue;if(lofted&&sd.t<.82)continue;
      const reach=.8+this.spd(o)*sd.t*dur*.35;if(sd.d>reach)continue;
      let p=(1-sd.d/reach)*(.2+(o.a.des+o.a.cpo)/40*.38);if(!lofted&&sd.d<.55)p=Math.max(p,.9);if(R()<p&&sd.t<its){its=sd.t;icp=o;ix=m.x+(tx-m.x)*sd.t;iy=m.y+(ty-m.y)*sd.t}}
    // impedimento: recebedor à frente do último defensor no momento do passe
    let offs=false;if(recv&&!wasThrow){const qd=depth(q.x,m.side);let ld=0;for(const o of this.active(O))if(O.slots[o.si].role!=='GOL')ld=Math.max(ld,depth(o.x,m.side));if(qd>.5&&qd>ld+.006&&qd>depth(this.ball.x,m.side)&&R()<.88)offs=true}
    const f={kind:'pass',side:m.side,from:m,recv,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur,h:lofted?Math.min(9,d*.18):0,endZ:0,offs,offX:q.x,offY:q.y};
    if(icp){f.icp=icp;f.ix=ix;f.iy=iy;f.dur=dur*its+.05}
    this._hardPass=lofted;this.ball.st='fly';this.ball.own=null;this.ball.fly=f;this.lastTouch=m.side;if(m.kk!=='throw'&&m.kk!=='gthrow')this.wind(m,f);
    q.lp=m;q.lpT=this.t;
  }
  wind(m,f){// o jogador arma o chute/passe (~0,26 s) e só então a bola sai: o pé encontra a bola na animação
    f.wd=.26;m.kwT=this.t;m.frozen=Math.max(m.frozen||0,.3);m.drib=null}
  clear(m){m.kt=this.t;m.kk='long';m.gkHold=false;if(this.opts.sound)this.opts.sound('pass',m);const T=this.T[m.side];const dir=m.side===0?1:-1;const tx=clamp(m.x+dir*rnd(30,48),5,L-5),ty=clamp(m.y+rnd(-18,18),3,W-3);
    // tenta achar companheiro adiantado
    let best=null,bv=0;for(const q of this.active(T)){if(q===m)continue;const dq=hyp(q.x-tx,q.y-ty);if(dq<14&&(1-dq/14)>bv){bv=1-dq/14;best=q}}
    const d=hyp(tx-m.x,ty-m.y);T.st.pa++;m.s.pa++;
    this.ball.st='fly';this.ball.own=null;this.ball.fly={kind:'clear',side:m.side,from:m,recv:best,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur:d/16+.3,h:Math.min(14,d*.25),endZ:0};this.wind(m,this.ball.fly);
    this._hardPass=true;this.lastTouch=m.side;if(best){best.lp=m;best.lpT=this.t}
  }
  shoot(m,opt={}){
    m.kt=this.t;m.kk=opt.head?'head':'shot';
    const T=this.T[m.side],O=this.T[1-m.side];const g=this.shotGeom(m.x,m.y,m.side);const press=this.nearestOpp(m).d;
    const cmpK=1.25-(m.a.cmp||10)/20*.5;let pf=press<1?.6:press<2.5?.8:press<4?.92:1;pf=1-(1-pf)*cmpK;const gkF=this.gkFactor(m.x,m.y,m.side);
    const sk=opt.head?m.a.cab:opt.fk?(m.a.bp||m.a.fin):this.shotSkill(m,g.dist);
    let xg=g.base*pf*gkF*(.6+sk/20*.7)*(.82+.18*m.stam/100)*(opt.head?.55:1)*(opt.fk?.6:1);xg=clamp(xg,.005,.85);
    if(opt.pen)xg=clamp(.74+(((m.a.bp||m.a.fin)+(m.a.cmp||10))/2-12)*.013-((this.gk(O)?this.gk(O).a.ref:10)-12)*.012,.55,.9);
    const gk=this.gk(O);const gq=gk?(gk.a.gol*.4+(gk.a.ref||gk.a.gol)*.6):8;
    const pGoal=opt.pen?xg:clamp(xg*3.05*(1.28-gq/20*.55),.004,.9);
    const pOn=Math.max(pGoal+.06,clamp(.26+sk/20*.36+g.base*.45-(1-pf)*.25,.15,.92));
    const r=R();let out=r<pGoal?'goal':r<pOn?'save':R()<.2&&press<1.5?'block':'miss';if(out==='miss'&&!opt.pen&&R()<.14)out='post';
    xg=pGoal;T.st.sh++;T.st.xg+=xg;m.s.sh++;if(out==='goal'||out==='save')T.st.sot++,m.s.sot++;
    const gx=goalX(m.side);const gdir=m.side===0?1:-1;let ty,endZ=0,tx=gx+gdir*1.3;
    if(out==='goal')ty=W/2+rnd(-GW/2+.4,GW/2-.4),endZ=rnd(0,2.1);
    else if(out==='save')ty=(gk?gk.y:W/2)+rnd(-1.6,1.6),endZ=rnd(0,1.5),tx=gx+(m.side===0?-.6:.6);
    else if(out==='block'){const no=this.nearestOpp(m);tx=no.o?no.o.x:m.x;ty=no.o?no.o.y:m.y}
    else{ty=W/2+(R()<.5?-1:1)*rnd(GW/2+.5,GW/2+7);endZ=R()<.4?rnd(2.6,5):rnd(0,1.5);tx=gx+gdir*rnd(1,2.5)}
    if(out==='post'){const bar=R()<.3;tx=gx;ty=bar?W/2+rnd(-GW/2+.5,GW/2-.5):W/2+(R()<.5?-1:1)*GW/2;endZ=bar?2.38:rnd(.3,2.2)}
    const d=hyp(tx-m.x,ty-m.y);
    // assistência pendente
    const assist=m.lp&&m.lp.side===m.side&&this.t-m.lpT<6&&m.lp!==m?m.lp:null;if(assist){assist.s.kp++;assist.r+=.12}
    this.ball.st='fly';this.ball.own=null;
    this.ball.fly={kind:'shot',sp:opt.pen?'pen':opt.fk?'fk':null,side:m.side,from:m,fx:this.ball.x,fy:this.ball.y,tx,ty,t:0,dur:Math.max(.25,d/(out==='block'?30:27)),h:opt.head?.6:.4,endZ,out,xg,assist,gx:tx,gy:ty};
    this.lastTouch=m.side;m.drib=null;if(!opt.head&&!opt.fk&&!opt.pen)this.wind(m,this.ball.fly);
    this.ev('shot',m.side,'',{pid:m.id,xg,out});
    if(this.opts.sound)this.opts.sound('shot',m);
  }
  tackles(car,dt){
    const O=this.T[1-car.side];const pr=O.tac.press??1;
    for(const o of this.active(O)){if(o.frozen>0)continue;const d=hyp(o.x-car.x,o.y-car.y);if(d>1.6)continue;
      if(R()>(.6+pr*.22)*dt*(o.press?1.3:1))continue;
      const slideOk=R()<.2;if(d>1.15&&!slideOk)continue;// fora do alcance da perna: só o carrinho chega
      const foul=d<1.05&&R()<.08+pr*.025+((o.a.agr||10)-10)*.007+(o.a.des<car.a.dri-3?.05:0);
      if(foul){this.foul(o,car);return}
      const pS=clamp(.36+(o.a.des-car.a.dri)*.035+(o.a.frc-car.a.frc)*.012+((o.a.agr||10)-10)*.006+((o.a.ace||10)-(car.a.ace||10))*.006-(this.t<car.ctrl?-.12:0),.12,.82);
      const slide=d>1.15||R()<.2;
      if(R()<pS){o.s.tk++;o.r+=.12;O.st.tk++;car.r-=.06;o.fx={k:'desarme',t:this.t};
        if(slide){this.slideOf(o,car);const b=this.ball;b.st='loose';b.own=null;const a=Math.atan2(car.y-o.y,car.x-o.x)+rnd(-.6,.6);b.vx=Math.cos(a)*rnd(4,7);b.vy=Math.sin(a)*rnd(4,7);this.lastTouch=o.side}
        else{o.anim={k:'shoulder',t:this.t};car.anim={k:'stumble',t:this.t};if(R()<.62){this.give(o)}else{const b=this.ball;b.st='loose';b.own=null;b.vx=rnd(-4,4);b.vy=rnd(-4,4);this.lastTouch=o.side}}
        car.frozen=.35;return}
      else{o.frozen=.75;car.r+=.04;car.fx={k:'drible',t:this.t};if(slide)this.slideOf(o,car);else o.anim={k:'beaten',t:this.t}}
    }
  }
  // carrinho: o jogador desliza ~1,5 m na direção do adversário, fica no chão e levanta (parado de verdade)
  slideOf(o,car){const a=Math.atan2(car.y-o.y,car.x-o.x);o.anim={k:'slide',t:this.t};o.frozen=1.7;o.vx=Math.cos(a)*5;o.vy=Math.sin(a)*5;o.slideT=this.t}
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
      if(f.out==='goal'){A.score++;m.s.g++;m.r+=1.1;if(f.assist){f.assist.s.as++;f.assist.r+=.55}
        const gk=this.gk(O);if(gk)gk.r-=.35;for(const d of this.active(O))if(O.slots[d.si].role!=='GOL'&&O.slots[d.si].df.d<.3)d.r-=.12;
        this.ev('goal',f.side,fill(pick(TXT.goal),{p:m.p.n,t:A.name}),{pid:m.id,assist:f.assist?f.assist.id:null,score:[this.T[0].score,this.T[1].score],xg:f.xg});
        b.x=f.tx;b.y=f.ty;this.goalCele={side:f.side,mp:m};
        this.setDead(5.2,()=>{this.goalCele=null;this.kickoff(1-f.side,false,true)},{kind:'gol'});return}
      if(f.out==='save'){const gk=this.gk(O);gk.s.sv++;gk.r+=.32;gk.anim={k:'catch',t:this.t};this.ev('save',O.side,fill(pick(TXT.save),{g:gk.p.n,p:m.p.n}),{pid:gk.id});
        if(R()<.55){this.give(gk);gk.gkHold=true;gk.decide=this.t+1.6}else if(R()<.55){gk.anim={k:'parry',t:this.t};const top=b.y<W/2;const gd=f.side===0?1:-1;this.outPlay(()=>this.corner(f.side,top),gd*rnd(5,9),(top?-1:1)*rnd(3,7),rnd(2,5))}else{b.st='loose';b.own=null;b.vx=(f.side===0?-1:1)*rnd(6,11);b.vy=rnd(-7,7);this.lastTouch=O.side}return}
      if(f.out==='block'){const no=this.nearestOpp({x:f.tx,y:f.ty,side:f.side});if(no.o){no.o.r+=.1;no.o.s.int++}
        if(R()<.42){const top=f.ty<W/2;const gd=f.side===0?1:-1;this.lastTouch=O.side;this.ev('miss',f.side,pick(TXT.block));this.outPlay(()=>this.corner(f.side,top),gd*rnd(7,12),(top?-1:1)*rnd(2,6),rnd(1,4));return}b.st='loose';b.own=null;b.vx=rnd(-8,8);b.vy=rnd(-8,8);this.lastTouch=O.side;this.ev('miss',f.side,pick(TXT.block));return}
      if(f.out==='post'){this.ev('post',f.side,`Na trave! ${m.p.n} quase marca!`,{pid:m.id});this.postT={t:this.t,x:f.tx,y:f.ty,z:f.endZ};b.st='loose';b.own=null;b.x=f.tx+(f.side===0?-.3:.3);b.y=f.ty;b.z=f.endZ;const dir=f.side===0?-1:1;b.vx=dir*rnd(6,12);b.vy=rnd(-6,6);this.lastTouch=f.side;return}
      m.anim={k:'lament',t:this.t};this.ev('miss',f.side,fill(pick(TXT.miss),{p:m.p.n}));{const ux=f.tx-f.fx,uy=f.ty-f.fy,ul=hyp(ux,uy)||1,sp=f.endZ>2.4?12:9;this.outPlay(()=>this.goalKick(O.side),ux/ul*sp,uy/ul*sp,f.endZ>2.4?2:0)}return}
    if(f.kind==='cross'){
      const A=this.T[f.side],O=this.T[1-f.side];
      const near=(T)=>{let best=null,bd=99;for(const m of this.active(T)){if(T.slots[m.si].role==='GOL'&&T===A)continue;const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd){bd=d;best=m}}return {m:best,d:bd}};
      const a=near(A),d=near(O);const gk=this.gk(O);
      const pA=clamp(.38+((a.m?a.m.a.cab:8)-(d.m?d.m.a.cab:8))*.03+(a.d<d.d?.12:-.12),.12,.7);
      const cq=f.from&&f.from.a?(f.from.a.cru||10):10;if(R()>.5+cq/20*.45){f.tx+=rnd(-4,4);f.ty+=rnd(-7,7)}
      if(gk&&hyp(gk.x-f.tx,gk.y-f.ty)<5+((gk.a.sai||10)-10)*.15&&R()<.3+(gk.a.sai||10)*.012){if(R()<.35){gk.anim={k:'punch',t:this.t};b.st='loose';b.own=null;b.x=f.tx;b.y=f.ty;b.z=2.2;const dir=O.side===0?1:-1;b.vx=dir*rnd(9,15);b.vy=rnd(-6,6);this.lastTouch=O.side;return}this.give(gk);gk.gkHold=true;gk.anim={k:'catchHigh',t:this.t};gk.decide=this.t+1.6;return}
      if(a.m&&R()<pA){a.m.x=f.tx;a.m.y=f.ty;this.give(a.m,true);this.shoot(a.m,{head:true});return}
      if(d.m&&R()<.3){d.m.r+=.05;const top=f.ty<W/2;const gd=f.side===0?1:-1;this.lastTouch=O.side;this.outPlay(()=>this.corner(f.side,top),gd*rnd(6,10),(top?-1:1)*rnd(3,8),rnd(2,5));return}
      if(d.m){d.m.r+=.06;const dir=O.side===0?1:-1;b.st='fly';b.fly={kind:'clear',side:O.side,from:d.m,recv:null,fx:f.tx,fy:f.ty,tx:clamp(f.tx+dir*rnd(18,32),3,L-3),ty:clamp(f.ty+rnd(-15,15),3,W-3),t:0,dur:1.1,h:8,endZ:0};this.lastTouch=O.side;return}
    }
    // passe / afastamento
    const A=this.T[f.side];
    if(f.icp&&!f.icp.off){const o=f.icp;o.s.int++;o.r+=.1;f.from.r-=.05;this.give(o);this.lastTouch=o.side;return}
    if(f.offs){const D=1-f.side;this.flagT={t:this.t,x:f.offX,side:f.side};this.ev('off',f.side,`Impedimento! A bandeira sobe para ${f.recv?f.recv.p.n:'o atacante'}.`,{pid:f.recv?f.recv.id:null});b.x=f.tx;b.y=f.ty;this.restartWith(D,clamp(f.offX,1,L-1),clamp(f.offY,1,W-1),'falta');return}
    let taker=null,bd=2.4;
    if(f.recv&&!f.recv.off){const d=hyp(f.recv.x-f.tx,f.recv.y-f.ty);if(d<3.2){taker=f.recv;bd=d}}
    for(const T of this.T)for(const m of this.active(T)){const d=hyp(m.x-f.tx,m.y-f.ty);if(d<bd-(m.side!==f.side?.3:0)){bd=d;taker=m}}
    b.x=f.tx;b.y=f.ty;
    if(taker){if(taker.side===f.side){A.st.pc++;f.from.s.pc++;f.from.r+=.02}else{taker.s.int++;taker.r+=.08;f.from.r-=.05}this.give(taker);this.lastTouch=taker.side;return}
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
