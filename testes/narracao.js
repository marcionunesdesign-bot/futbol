/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');let tot=0,lan=0;const N=10;let sample=null;
for(let g=0;g<N;g++){const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(C.G.div.A[(g+3)%20]),{userSide:0,seed:1000+g});m.runToEnd(30*700);const ev=m.events.filter(e=>e.text);tot+=ev.length;lan+=ev.filter(e=>e.type==='lance').length;if(g===0)sample=ev.slice(0,28).map(e=>e.min+"' "+e.text)}
console.log('linhas no painel por jogo:',(tot/N).toFixed(0),'| novas (lances):',(lan/N).toFixed(0));console.log(sample.join('\n'))
