/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];const N=20;const hyp=Math.hypot;
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');let still=0,near=0,recvSp=[],recvStillPct=0,recvN=0,voos=0,zona=[];
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:1000+g,autoSubsUser:true});let lastF=null;
 for(let i=0;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();m.step(1/30);const b=m.ball;
  if(b.st==='fly'&&b.fly&&(b.fly.h>2||b.fly.kind==='clear')&&b.fly.kind!=='shot'&&!(b.fly.wd>0)){const f=b.fly;if(f!==lastF){lastF=f;voos++}const lx=f.ix??f.tx,ly=f.iy??f.ty;
    if(i%3===0){let z=0;for(const T of m.T)for(const p of m.active(T)){if(T.slots[p.si].role==='GOL')continue;const d=hyp(p.x-lx,p.y-ly);if(d<25){near++;if(hyp(p.vx,p.vy)<1)still++}if(d<8)z++}zona.push(z)}
    if(f.recv&&f.t/f.dur>.85&&f.t/f.dur<.9){recvN++;const sp=hyp(f.recv.vx,f.recv.vy);recvSp.push(sp);if(sp<1)recvStillPct++}}}}
recvSp.sort((a,b)=>a-b);console.log(JSON.stringify({bolas_altas_jogo:(voos/N).toFixed(1),parados_perto_da_queda:(100*still/near).toFixed(1)+'%',recebedor_parado_na_chegada:(100*recvStillPct/recvN).toFixed(0)+'%',vel_recebedor_mediana:recvSp[recvSp.length>>1].toFixed(2),jogadores_a_8m_da_queda:(zona.reduce((a,b)=>a+b,0)/zona.length).toFixed(2)}))
