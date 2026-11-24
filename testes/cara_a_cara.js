/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];const N=20;const hyp=Math.hypot;
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');let own=0,stand=0,face=0,sp=[];
for(let g=0;g<N;g++){const opp=C.G.div.A[(g+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:1000+g,autoSubsUser:true});
 for(let i=0;i<30*700&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();m.step(1/30);const b=m.ball;if(b.st!=='own'||m.dead>0)continue;const c=b.own;if(c.setP||c.ko||c.throwIn)continue;if(m.T[c.side].slots[c.si].role==='GOL')continue;
  own++;const v=hyp(c.vx,c.vy);const no=m.nearestOpp(c);const dir=c.side===0?1:-1;if(no.o&&no.d<2.2&&(no.o.x-c.x)*dir>0){face++;sp.push(v);if(v<1.2)stand++}}}
sp.sort((a,b)=>a-b);console.log(JSON.stringify({marcador_colado_na_frente:(100*face/own).toFixed(1)+'%',parado_cara_a_cara:(100*stand/own).toFixed(1)+'% do tempo com bola',vel_mediana_cara_a_cara:sp[sp.length>>1].toFixed(2)}))
