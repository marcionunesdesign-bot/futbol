/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];const N=20;
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');const R={};
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:1000+g,autoSubsUser:true});const seen=new Map();
 for(let i=0;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();m.step(1/30);
  for(const T of m.T)for(const p of T.mps){if(p.trick&&!seen.has(p.trick)){seen.set(p.trick,{p,t:m.t})}}
  for(const [tk,o] of seen){if(o.done)continue;if(m.t-o.t>1.6){o.done=1;const k=tk.k;R[k]=R[k]||{n:0,ok:0,manteve:0};R[k].n++;if(tk.ok)R[k].ok++;const b=m.ball;if(b.st==='own'?b.own.side===o.p.side:b.st==='fly'?b.fly.side===o.p.side:false)R[k].manteve++}}}}
for(const k in R)R[k].por_jogo=(R[k].n/N).toFixed(2);console.log(JSON.stringify(R))
