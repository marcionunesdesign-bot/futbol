/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
// Teste item a item da movimentação
const SRC=process.argv[2]||'/home/claude/futbol-repo/src';const N=+(process.argv[3]||16);
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');const L=105,W=68,hyp=Math.hypot;const dep=(x,s)=>s===0?x/L:1-x/L;
const k={onetwo:0,ovl:0,ovlN:0,counter:0,counterN:0,gkShort:0,gkN:0,post:0,postN:0,thr:0,thrN:0,wide:[],ataLine:[],midGap:[],lowLine:[],normLine:[],manD:[],zoneD:[],late:[],early:[],passHist:[]};
const role=(m,T)=>T.slots[m.si].role;
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+5)%20];const home=C.aiTeam('Flamengo'),away=C.aiTeam(opp);
  const m=new Match(home,away,{userSide:0,seed:2000+g,autoSubsUser:true});
  // metade dos jogos: time 1 em retranca (linha baixa) e pressão baixa; time 0 pressão alta
  if(g%2){m.T[1].tac.line=0;m.T[1].tac.press=0;m.T[0].tac.press=2}
  let lastOwn=null,hist=[],lastPoss=null,turnT=null,turnSide=null,lastSetup=null;
  for(let i=0;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();m.step(1/30);const b=m.ball;
    // tabela: A -> B -> A em menos de 4 s
    if(b.st==='own'&&b.own!==lastOwn){const o=b.own;hist.push({id:o.id,side:o.side,t:m.t});hist=hist.slice(-3);if(hist.length===3&&hist[0].id===hist[2].id&&hist[0].side===hist[1].side&&hist[1].side===hist[2].side&&hist[2].t-hist[0].t<4)k.onetwo++;lastOwn=o}
    // bolas paradas
    if(m.setup&&m.setup!==lastSetup){lastSetup=m.setup}if(m.setup&&m.setup.kind==='tiro'&&m.setup.taker)m.setup.taker._gkT=m.t;
    if(m.setup&&m.dead>0&&m.dead<.12){const sp=m.setup;
      if(sp.kind==='corner'){const O=m.T[1-sp.side];const gx=sp.side===0?L:0;k.postN++;const near=m.active(O).filter(x=>role(x,O)!=='GOL'&&Math.abs(x.x-gx)<2.5&&Math.abs(Math.abs(x.y-W/2)-3.4)<2).length;if(near>=2)k.post++}
      if(sp.kind==='lateral'&&sp.taker){const A=m.T[sp.taker.side];k.thrN++;const n=m.active(A).filter(x=>x!==sp.taker&&hyp(x.x-sp.x,x.y-sp.y)<12).length;if(n>=2)k.thr++}}
    if(i%6)continue;const play=(b.st==='own'||b.st==='fly')&&!(m.dead>0);if(!play)continue;
    const poss=b.st==='own'?b.own.side:b.fly.side;
    // tiro de meta: o primeiro passe do goleiro
    if(b.st==='fly'&&b.fly.from&&role(b.fly.from,m.T[b.fly.side])==='GOL'&&!b.fly._seen){b.fly._seen=1;const f=b.fly;if(f.from._gkT&&m.t-f.from._gkT<3){k.gkN++;if(f.kind==='pass'&&hyp(f.tx-f.fx,f.ty-f.fy)<26)k.gkShort++}}
    for(const s of [0,1]){const T=m.T[s];const act=m.active(T);const bd=dep(b.x,s);
      if(poss===s){
        const O=m.T[1-s];const dd=m.active(O).map(o=>dep(o.x,s)).sort((a,b)=>b-a);const last=Math.max(dd[1]||0,bd);// linha de impedimento: penúltimo adversário (conta o goleiro)
        for(const a of act){const r=role(a,T);
          if((r==='PD'||r==='PE')&&bd<.6&&!(a.runUntil>m.t)&&!(b.st==='own'&&b.own===a))k.wide.push(Math.abs(a.y-W/2));
          if(r==='ATA'&&bd>.4&&!(b.st==='own'&&b.own===a))k.ataLine.push((last-dep(a.x,s))*L);
          if((r==='LD'||r==='LE')&&bd>.5){const flank=a.y<W/2;const bf=b.y<W/2;if(flank===bf){k.ovlN++;const wg=act.find(w=>['PD','PE'].includes(role(w,T))&&(w.y<W/2)===flank);if(wg&&dep(a.x,s)>dep(wg.x,s))k.ovl++}}}
      }else{
        const out=act.filter(a=>role(a,T)!=='GOL');const defs=out.filter(a=>['ZAG','LD','LE'].includes(role(a,T))),mids=out.filter(a=>['VOL','MC','MEI'].includes(role(a,T)));
        if(defs.length&&mids.length){const dd=defs.reduce((x,a)=>x+dep(a.x,s),0)/defs.length,mm=mids.reduce((x,a)=>x+dep(a.x,s),0)/mids.length;k.midGap.push((mm-dd)*L);(s===1&&g%2?k.lowLine:k.normLine).push(dd*L)}
        if(b.st==='own'){const A=m.T[poss];for(const d of out){if(d.press||!['ZAG','LD','LE','VOL','MC'].includes(role(d,T)))continue;let nd=99;for(const a of m.active(A))nd=Math.min(nd,hyp(a.x-d.x,a.y-d.y));((T.tac.press??1)===2?k.manD:(T.tac.press??1)===0?k.zoneD:[]).push(nd)}}
      }
      // ritmo: corrida no começo x no fim (cansaço)
      const sp=act.filter(a=>hyp(a.vx,a.vy)>5.5).length/act.length;(m.minute<20?k.early:m.minute>75?k.late:[]).push(sp)}
    // contra-ataque: 2 s depois de roubar no próprio campo, atacantes em disparada
    if(lastPoss!=null&&poss!==lastPoss&&b.st==='own'&&dep(b.x,poss)<.5){turnT=m.t;turnSide=poss}
    if(turnT!=null&&m.t-turnT>1.5){const T=m.T[turnSide];k.counterN++;const n=m.active(T).filter(a=>['ATA','PD','PE','MEI'].includes(role(a,T))&&hyp(a.vx,a.vy)>5.5&&(turnSide===0?a.vx>0:a.vx<0)).length;if(n>=2)k.counter++;turnT=null}
    lastPoss=poss;
  }
  for(const T of m.T){const gk=m.gk(T);if(gk)gk._gkT=null}
}
const av=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN,f=(v,d=1)=>(+v).toFixed(d),pc=(a,b)=>b?f(a/b*100,0)+'%':'-';
console.log(JSON.stringify({
 tabelas_jogo:f(k.onetwo/N,1),ultrapassagem_lateral:pc(k.ovl,k.ovlN),contra_ataque_2_disparam:pc(k.counter,k.counterN),
 tiro_meta_curto:pc(k.gkShort,k.gkN)+' de '+k.gkN,escanteio_homem_nas_2_traves:pc(k.post,k.postN),lateral_2_perto:pc(k.thr,k.thrN),
 pontas_dist_centro_m:f(av(k.wide)),ata_atras_do_ultimo_zagueiro_m:f(av(k.ataLine)),distancia_defesa_meio_m:f(av(k.midGap)),
 linha_retranca_m:f(av(k.lowLine)),linha_normal_m:f(av(k.normLine)),dist_marcador_pressao_alta_m:f(av(k.manD)),dist_marcador_pressao_baixa_m:f(av(k.zoneD)),
 em_disparada_inicio:pc(av(k.early),1),em_disparada_fim:pc(av(k.late),1)},null,1))
