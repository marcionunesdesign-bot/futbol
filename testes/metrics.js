// Medidor de movimentação: N partidas com sorteio fixo, mede comportamento tático
const SRC=process.argv[2]||'/home/claude/futbol-repo/src';const N=+(process.argv[3]||20);
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');const L=105,W=68;const hyp=Math.hypot;
const acc={g:0,sh:0,pa:0,pc:0,off:0,tk:0,fo:0,co:0,
  lineStd:[],span:[],opts:[],press1:[],press2:[],recov:[],walk:0,jog:0,run:0,farN:0,box:[],dbl:0,dblN:0,gkSpMax:0,width:[],ovl:0,ovlN:0,sup:[],cnt:[],stuck:0,goalsPer:[]};
const DEF=new Set(['ZAG','LD','LE']);
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:1000+g,autoSubsUser:true});
  let lastPoss=null,turn=[];let i=0;
  for(;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();m.step(1/30);const b=m.ball;if(i%6)continue;
    const play=b.st==='own'||b.st==='fly'||b.st==='loose';if(!play||m.dead>0)continue;
    const poss=b.st==='own'?b.own.side:b.st==='fly'?b.fly.side:null;
    for(const s of [0,1]){const T=m.T[s];const act=m.active(T);const out=act.filter(x=>T.slots[x.si].role!=='GOL');
      if(poss!=null&&poss!==s){// defendendo
        const d=out.filter(x=>DEF.has(T.slots[x.si].role)).map(x=>x.x);if(d.length>=3){const mu=d.reduce((a,b)=>a+b)/d.length;acc.lineStd.push(Math.sqrt(d.reduce((a,b)=>a+(b-mu)**2,0)/d.length))}
        const xs=out.map(x=>x.x);acc.span.push(Math.max(...xs)-Math.min(...xs));
        const ys=out.map(x=>x.y);acc.width.push(Math.max(...ys)-Math.min(...ys));
        if(b.st==='own'){const c=b.own;const ds=out.map(x=>hyp(x.x-c.x,x.y-c.y)).sort((a,b)=>a-b);acc.press1.push(ds[0]);acc.press2.push(ds[1]);
          // dupla marcação de quem não tem a bola
          const A=m.T[c.side];for(const a of m.active(A)){if(a===c)continue;const n=out.filter(x=>hyp(x.x-a.x,x.y-a.y)<2).length;acc.dblN++;if(n>=2)acc.dbl++}}
      }
      if(poss===s&&b.st==='own'&&b.own.side===s){const c=b.own;const O=m.T[1-s];let n=0,sup=0;
        for(const a of act){if(a===c)continue;const d=hyp(a.x-c.x,a.y-c.y);if(d<6||d>28)continue;let lane=9;for(const o of m.active(O)){const dx=a.x-c.x,dy=a.y-c.y,l2=dx*dx+dy*dy;let t=((o.x-c.x)*dx+(o.y-c.y)*dy)/l2;if(t<.05||t>.95)continue;lane=Math.min(lane,hyp(o.x-c.x-t*dx,o.y-c.y-t*dy))}
          if(lane>2.5){n++;if(d<18)sup++}}acc.opts.push(n);acc.sup.push(sup)
        // ocupação da área no cruzamento
        const dep=s===0?c.x/L:1-c.x/L,wy=c.y/W;if(dep>.75&&Math.abs(wy-.5)>.3){const gx=s===0?L:0;acc.box.push(act.filter(a=>a!==c&&Math.abs(a.x-gx)<16.5&&Math.abs(a.y-W/2)<20).length)}}
      // ritmo: jogadores longe da bola
      for(const a of out){if(hyp(a.x-b.x,a.y-b.y)<35)continue;const sp=hyp(a.vx,a.vy);acc.farN++;if(sp<2)acc.walk++;else if(sp<5.2)acc.jog++;else acc.run++}
    }
    // recomposição: 3 s após perder a bola, quantos de quem perdeu ainda estão à frente da bola
    if(poss!=null&&lastPoss!=null&&poss!==lastPoss)turn.push({t:m.t,side:lastPoss});lastPoss=poss??lastPoss;
    turn=turn.filter(q=>{if(m.t-q.t<3)return true;if(poss!==q.side){const T=m.T[q.side];const out=m.active(T).filter(x=>T.slots[x.si].role!=='GOL');const ahead=out.filter(x=>q.side===0?x.x>b.x+5:x.x<b.x-5).length;acc.recov.push(ahead)}return false});
  }
  if(m.phase!=='ft')acc.stuck++;
  for(const T of m.T){acc.sh+=T.st.sh;acc.pa+=T.st.pa;acc.pc+=T.st.pc;acc.tk+=T.st.tk;acc.fo+=T.st.fo;acc.co+=T.st.co}acc.g+=m.T[0].score+m.T[1].score;acc.off+=(m.events||[]).filter(e=>/impedi/i.test(e.text||'')).length}
const av=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length):NaN;const f=(v,d=1)=>(+v).toFixed(d);
const r={jogos:N,travados:acc.stuck,gols_jogo:f(acc.g/N,2),chutes_jogo:f(acc.sh/N),passes_jogo:f(acc.pa/N),acerto_passe:f(acc.pc/acc.pa*100)+'%',impedimentos_jogo:f(acc.off/N,1),desarmes_jogo:f(acc.tk/N),faltas_jogo:f(acc.fo/N),escanteios_jogo:f(acc.co/N),
  linha4_desvio_m:f(av(acc.lineStd)),bloco_profundidade_m:f(av(acc.span)),bloco_largura_m:f(av(acc.width)),opcoes_passe:f(av(acc.opts),2),apoio_curto:f(av(acc.sup),2),
  pressao_1o_m:f(av(acc.press1)),pressao_2o_m:f(av(acc.press2)),dupla_marcacao:f(acc.dbl/acc.dblN*100,1)+'%',recomp_a_frente:f(av(acc.recov),2),
  ritmo_longe:`andando ${f(acc.walk/acc.farN*100,0)}% trote ${f(acc.jog/acc.farN*100,0)}% corrida ${f(acc.run/acc.farN*100,0)}%`,area_no_cruzamento:f(av(acc.box),2)};
console.log(JSON.stringify(r,null,1));
