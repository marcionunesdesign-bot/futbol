global.C11_DATA=require('/home/claude/futbol-repo/src/data.js');global.localStorage={s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v},removeItem(){}};
global.C11_REAL=require('/home/claude/futbol-repo/src/real.js');global.C11=require('/home/claude/futbol-repo/src/core.js');const {Match}=require('/home/claude/futbol-repo/src/match.js');
const C=C11;C.newGame('CSA','M');
const a=C.userTeam(),b=C.aiTeam('ABC');
const run=(seed,cmd)=>{const m=new Match(JSON.parse(JSON.stringify({...a,club:a.club})),JSON.parse(JSON.stringify({...b,club:b.club})),{userSide:0,seed,humans:[0,1]});
  for(let i=0;i<30*400&&m.phase!=='ft';i++){if(m.phase==='ht')m.resumeFromHT();if(cmd&&m.tick===cmd.tick)Object.assign(m.T[0].tac,cmd.v);m.step(1/30)}return [m.T[0].score,m.T[1].score,m.events.length,m.ball.x.toFixed(6)].join('|')};
console.log(run(42),run(42),run(43));console.log(run(42,{tick:900,v:{ment:2}}),run(42,{tick:900,v:{ment:2}}));
