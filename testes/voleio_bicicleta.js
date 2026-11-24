/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');const C=C11;C.newGame('Flamengo','M');let bk=0,vo=0,N=120,gb=0,gv=0;
for(let g=0;g<N;g++){const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(C.G.div.A[(g+3)%20]),{userSide:0,seed:5000+g});const sh=m.shoot.bind(m);let last=null;m.shoot=function(p,o){last=o&&o.bike?'b':o&&o.volley?'v':null;return sh(p,o)};
 const ev=m.ev.bind(m);m.ev=function(t,...a){if(t==='goal'&&last==='b')gb++;if(t==='goal'&&last==='v')gv++;return ev(t,...a)};m.runToEnd(30*700);bk+=(m.phys.bike||0);vo+=(m.phys.volley||0)}
console.log(JSON.stringify({jogos:N,bicicletas:bk,gols_de_bicicleta:gb,voleios:vo,gols_de_voleio:gv}))
