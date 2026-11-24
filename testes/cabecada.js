/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];const N=+(process.argv[3]||30);
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');const hyp=Math.hypot;
let heads=0,tele=[],gols=0,crosses=0,headG=0;
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:2000+g,autoSubsUser:true});
  const prev=new Map();const sh=m.shoot.bind(m);
  m.shoot=function(p,o){if(o&&o.head){heads++;const q=prev.get(p);if(q)tele.push(hyp(p.x-q[0],p.y-q[1]))}return sh(p,o)};
  for(let i=0;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();
    for(const T of m.T)for(const p of T.mps)prev.set(p,[p.x,p.y]);
    const b=m.ball;const wasCross=b.st==='fly'&&b.fly&&b.fly.kind==='cross';m.step(1/30);if(wasCross&&!(m.ball.st==='fly'&&m.ball.fly&&m.ball.fly.kind==='cross'))crosses++}
  gols+=m.T[0].score+m.T[1].score;headG+=m.events.filter(e=>e.k==='goal'&&/cabe/i.test(e.txt||'')).length}
tele.sort((a,b)=>a-b);const p=q=>tele.length?tele[Math.floor(q*(tele.length-1))].toFixed(2):'-';
console.log(JSON.stringify({jogos:N,cruzamentos:crosses,cabecadas:heads,salto_mediana_m:p(.5),salto_p90_m:p(.9),salto_max_m:p(1),acima_1m:tele.filter(x=>x>1).length,gols_jogo:(gols/N).toFixed(2)}))
