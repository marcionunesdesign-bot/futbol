/*SEEDRND*/{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}}
const SRC=process.argv[2];const N=+(process.argv[3]||30);
global.C11_DATA=require(SRC+'/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require(SRC+'/real.js');global.C11=require(SRC+'/core.js');const {Match}=require(SRC+'/match.js');
const C=C11;C.newGame('Flamengo','M');const tot={};const wx={};let g=0,sh=0,cn=0,post=0;
for(let i=0;i<N;i++){const opp=C.G.div.A[(i+3)%20];const m=new Match(C.aiTeam('Flamengo'),C.aiTeam(opp),{userSide:0,seed:1000+i,autoSubsUser:true});m.runToEnd(30*700);
 for(const k in m.phys)tot[k]=(tot[k]||0)+m.phys[k];wx[m.weather]=(wx[m.weather]||0)+1;g+=m.T[0].score+m.T[1].score;sh+=m.T[0].st.sh+m.T[1].st.sh;cn+=m.T[0].st.co+m.T[1].st.co;post+=m.events.filter(e=>e.type==='post').length}
const o={};for(const k in tot)o[k]=(tot[k]/N).toFixed(2);o.gols=(g/N).toFixed(2);o.chutes=(sh/N).toFixed(1);o.escanteios=(cn/N).toFixed(1);o.traves=(post/N).toFixed(2);o.clima=wx;console.log(JSON.stringify(o))
