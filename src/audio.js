/* FUTBOL — som gerado no navegador, com timbres acústicos: bateria de escola de samba, cordas dedilhadas,
   metais de fanfarra e coro de torcida. Sem sintetizador "eletrônico". */
var C11Audio=(function(){
'use strict';
let ctx=null,master,comp,musicBus,sfxBus,crowdBus,verb,verbIn,noiseBuf,timer=null,step=0,nextT=0,playing=false;
const DEF={music:true,sfx:true,mv:0.5,sv:0.7,cv:0.7,track:-1,rtrack:-1};
const S=Object.assign({},DEF,JSON.parse((()=>{try{return localStorage.getItem('c11-audio')}catch(e){return null}})()||'{}'));
const saveS=()=>{try{localStorage.setItem('c11-audio',JSON.stringify(S))}catch(e){}};
let onTrack=null;
function init(){
  if(ctx){if(ctx.state==='suspended')ctx.resume();return}
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC({latencyHint:'playback'});
  const resumeAll=()=>{if(!ctx||document.hidden)return;if(ctx.state!=='running'){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{})}if(rOn&&rm&&rm.el.paused&&!rm.el.ended&&musicBus.gain.value>.001)rm.el.play().catch(()=>{})};
  ['pointerdown','touchend','keydown','click'].forEach(ev=>document.addEventListener(ev,resumeAll,true));addEventListener('pageshow',resumeAll);addEventListener('focus',resumeAll);
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden){if(rm&&!rm.el.paused)rm.el.pause()}else setTimeout(resumeAll,150)});
  ctx.onstatechange=()=>{if(ctx.state!=='running'&&!document.hidden)setTimeout(resumeAll,400)};
  setInterval(()=>{if(ctx&&!document.hidden&&ctx.state!=='running')resumeAll()},2000);
  master=ctx.createGain();master.connect(ctx.destination);
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3.5;comp.connect(master);
  musicBus=ctx.createGain();musicBus.gain.value=S.music?S.mv*.6:0;musicBus.connect(comp);
  sfxBus=ctx.createGain();sfxBus.gain.value=S.sfx?S.sv:0;sfxBus.connect(comp);
  crowdBus=ctx.createGain();crowdBus.gain.value=S.sfx?S.cv:0;crowdBus.connect(comp);
  const len=ctx.sampleRate*4;noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);const d=noiseBuf.getChannelData(0);let b0=0,b1=0,b2=0;
  for(let i=0;i<len;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.0526;d[i]=(b0+b1+b2+w*.1848)*.18}
  const il=ctx.sampleRate*2.2|0,ir=ctx.createBuffer(2,il,ctx.sampleRate);
  for(let c=0;c<2;c++){const x=ir.getChannelData(c);for(let i=0;i<il;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/il,3)*.55}
  verb=ctx.createConvolver();verb.buffer=ir;verbIn=ctx.createGain();verbIn.gain.value=.45;verbIn.connect(verb);verb.connect(comp);
  musVerb=ctx.createGain();musVerb.gain.value=.22;musicBus.connect(musVerb);musVerb.connect(verb);
}
let musVerb;
function noise(){const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;return s}
const N=n=>440*Math.pow(2,(n-69)/12);
function env(g,t,a,dcy,peak){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+dcy)}
function osc(type,f,t,dur,vol,dest,a=.005){const o=ctx.createOscillator();o.type=type;o.frequency.value=f;const g=ctx.createGain();env(g,t,a,dur,vol);o.connect(g);g.connect(dest);o.start(t);o.stop(t+a+dur+.05);return o}
function nz(t,dur,vol,freq,type,dest,q=1,att=.003){const s=noise();const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=ctx.createGain();env(g,t,att,dur,vol);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*3);s.stop(t+att+dur+.05)}

/* ---------- instrumentos acústicos ---------- */
// corda dedilhada (Karplus-Strong): violão, cavaquinho, baixo
const ksCache={};
function ksBuf(f,bright,dur){const key=Math.round(f*10)+'_'+bright;if(ksCache[key])return ksCache[key];
  const sr=ctx.sampleRate,len=Math.floor(sr*dur),b=ctx.createBuffer(1,len,sr),d=b.getChannelData(0);const P=Math.max(2,Math.round(sr/f));const ring=new Float32Array(P);
  for(let i=0;i<P;i++)ring[i]=(Math.random()*2-1)*(1-bright*.3)+(i<P/2?.3:-.3)*bright*.2;
  let idx=0;const k=.996-(1-bright)*.004;for(let i=0;i<len;i++){const nx=(idx+1)%P;const v=(ring[idx]+ring[nx])*.5*k;d[i]=ring[idx];ring[idx]=v;idx=nx}
  return ksCache[key]=b}
function pluck(f,t,vol,dest,bright=.6,dur=1.6){const s=ctx.createBufferSource();s.buffer=ksBuf(f,bright,dur);const g=ctx.createGain();g.gain.value=vol;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800+bright*4000;s.connect(lp);lp.connect(g);g.connect(dest);s.start(t)}
// metal de sopro (trompete/trombone/tuba): serrote com formante, vibrato e sopro
function horn(f,t,dur,vol,dest,kind='tpt'){const F={tpt:[1200,2600],tbn:[600,1400],tuba:[300,700]}[kind];
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.985,t);o.frequency.linearRampToValueAtTime(f,t+.06);
  const v=ctx.createOscillator();v.frequency.value=5.2;const vg=ctx.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.006,t+.35);v.connect(vg);vg.connect(o.frequency);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.2;lp.frequency.setValueAtTime(F[0]*.5,t);lp.frequency.linearRampToValueAtTime(F[0]*1.3,t+.05);lp.frequency.linearRampToValueAtTime(F[0],t+dur);
  const bp=ctx.createBiquadFilter();bp.type='peaking';bp.frequency.value=F[1];bp.gain.value=5;
  const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.04);g.gain.setValueAtTime(vol*.85,t+Math.max(.06,dur-.08));g.gain.linearRampToValueAtTime(0,t+dur+.05);
  o.connect(lp);lp.connect(bp);bp.connect(g);g.connect(dest);o.start(t);v.start(t);o.stop(t+dur+.1);v.stop(t+dur+.1);
  nz(t,.05,vol*.12,F[1],'bandpass',dest,2,.002)}
// percussão de escola de samba
function surdo(t,f,vol,dest,muted){const o=ctx.createOscillator();o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);const g=ctx.createGain();env(g,t,.004,muted?.18:.7,vol);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.9);nz(t,.04,vol*.35,700,'lowpass',dest,.7,.001)}
function caixa(t,vol,dest){nz(t,.09,vol,3200,'bandpass',dest,.9,.001);nz(t,.05,vol*.6,6500,'highpass',dest,.5,.001);osc('triangle',240,t,.04,vol*.35,dest,.001)}
function repique(t,vol,dest){osc('triangle',520,t,.07,vol*.6,dest,.001);nz(t,.06,vol*.6,2600,'bandpass',dest,1.5,.001)}
function tamborim(t,vol,dest){osc('triangle',980,t,.035,vol,dest,.001);nz(t,.02,vol*.6,5000,'highpass',dest,.7,.001)}
function agogo(t,hi,vol,dest){const f=hi?1150:860;[1,2.76,5.4].forEach((m,i)=>osc('sine',f*m,t,.18/(i+1),vol/(i+1.4),dest,.001))}
function ganza(t,vol,dest){nz(t,.045,vol,7500,'highpass',dest,.6,.012)}
function pandeiro(t,vol,dest,slap){nz(t,.08,vol*.7,9000,'highpass',dest,.4,.002);if(slap)osc('triangle',300,t,.06,vol*.5,dest,.001)}
function bumbo(t,vol,dest){const o=ctx.createOscillator();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.12);const g=ctx.createGain();env(g,t,.003,.35,vol);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.5)}
function prato(t,vol,dest,dur=1.4){nz(t,dur,vol,6000,'highpass',dest,.3,.002);nz(t,dur*.6,vol*.5,3500,'bandpass',dest,.8,.002)}
function timpano(t,f,vol,dest){const o=ctx.createOscillator();o.frequency.setValueAtTime(f*1.08,t);o.frequency.exponentialRampToValueAtTime(f,t+.08);const g=ctx.createGain();env(g,t,.004,1.1,vol);o.connect(g);g.connect(dest);o.start(t);o.stop(t+1.3);nz(t,.12,vol*.3,400,'lowpass',dest,.8,.001)}
function apito(t,vol,dest,dur=.3){const o=ctx.createOscillator();o.frequency.value=2700;const l=ctx.createOscillator();l.frequency.value=34;const lg=ctx.createGain();lg.gain.value=110;l.connect(lg);lg.connect(o.frequency);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.setValueAtTime(vol,t+dur-.03);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(dest);o.start(t);l.start(t);o.stop(t+dur+.02);l.stop(t+dur+.02)}
// coro de torcida (várias vozes com formante de vogal "ô")
function coro(f,t,dur,vol,dest,vowel='o'){const F=vowel==='a'?[800,1200]:[450,850];const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(vol,t+.08);out.gain.setValueAtTime(vol,t+dur*.75);out.gain.linearRampToValueAtTime(0,t+dur);
  const f1=ctx.createBiquadFilter();f1.type='bandpass';f1.frequency.value=F[0];f1.Q.value=5;const f2=ctx.createBiquadFilter();f2.type='bandpass';f2.frequency.value=F[1];f2.Q.value=6;
  f1.connect(out);f2.connect(out);out.connect(dest);
  for(let v=0;v<6;v++){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=f*(v%3===2?2:1)*(1+(Math.random()-.5)*.018);o.connect(f1);o.connect(f2);o.start(t+Math.random()*.04);o.stop(t+dur+.05)}
  nz(t,dur,vol*.25,F[0],'bandpass',dest,2,.05)}

/* ---------- trilhas ---------- */
const TRACKS=[
 {name:'Batucada da Geral',bpm:104,swing:.06,
  MEL:[[0,64,2],[4,67,1],[6,69,2],[10,67,1],[12,64,3]],
  step(t,s,bar,B){
    if(s===0)surdo(t,60,.55,B);if(s===8)surdo(t,48,.75,B);if(s===12&&bar%2)surdo(t,70,.35,B,true);if(s===6)surdo(t,82,.3,B,true);
    caixa(t,s%4===2?.13:s%2?.05:.08,B);if(s%2===0)ganza(t+.01,.05,B);
    if([0,3,6,10,13].includes(s))agogo(t,s===6||s===13,.05,B);
    if([2,5,7,11,14].includes(s)&&bar%2)tamborim(t,.11,B);
    if(bar%4===3&&s>=8)repique(t,.12+(s-8)*.01,B);
    if(bar%4===0&&s===0)apito(t,.05,B,.25);
    if(bar>=4)for(const [ss,n,l] of this.MEL)if(ss===s)coro(N(n-12),t,l*.16+.1,.05,B)}},
 {name:'Samba de Arquibancada',bpm:98,swing:.09,
  CH:[[45,57,64,67,72],[50,57,62,66,72],[43,55,62,65,71],[48,55,64,67,71],[42,57,60,64,69],[47,54,63,66,69],[40,59,62,67,71],[40,56,62,64,68]],
  RIFF:[[0,76],[3,74],[6,72],[8,74],[11,76],[14,79]],
  step(t,s,bar,B){const ch=this.CH[bar];
    if(s===0)surdo(t,62,.4,B);if(s===8)surdo(t,50,.55,B);
    pandeiro(t,s%4===0?.1:.05,B,s%8===4);if(s%2===1)ganza(t,.04,B);
    if([0,6,8,14].includes(s))pluck(N(ch[0])/(s>=8?1:2),t,.5,B,.35,1.2);
    if([2,5,7,10,13,15].includes(s))ch.slice(1).forEach((n,i)=>pluck(N(n+12),t+i*.008,.13,B,.8,.5)); // cavaquinho
    if(bar%2===1&&[2,10].includes(s))ch.slice(2).forEach(n=>horn(N(n),t,.14,.035,B,'tpt'));
    if(bar>=4&&bar<6)for(const [ss,n] of this.RIFF)if(ss===s)horn(N(n),t,.2,.06,B,'tpt')}},
 {name:'Fanfarra do Estádio',bpm:116,swing:0,
  CH:[[48,60,64,67],[53,60,65,69],[55,59,62,67],[48,60,64,67],[53,57,65,69],[48,55,64,67],[55,59,62,65],[48,55,60,64]],
  MEL:[[0,72,3],[4,76,1],[6,79,2],[8,84,4],[12,79,2],[14,76,1]],
  step(t,s,bar,B){const ch=this.CH[bar];
    if(s%4===0)bumbo(t,.5,B);if(s===0&&bar%4===0)prato(t,.07,B);
    caixa(t,s%4===2?.11:(bar%2&&s>11)?.08:.035,B);
    if(s===0||s===8)horn(N(ch[0]-12),t,.38,.12,B,'tuba');if(s===4||s===12)horn(N(ch[0]-5),t,.3,.09,B,'tuba');
    if(s===2||s===6||s===10||s===14)ch.slice(1).forEach(n=>horn(N(n),t,.12,.03,B,'tbn'));
    if(bar%2===0||bar>=6)for(const [ss,n,l] of this.MEL)if(ss===s)horn(N(n-(bar%4===2?2:0)),t,l*.12+.05,.065,B,'tpt')}},
 {name:'Hino do Campeonato',bpm:84,swing:0,
  CH:[[50,62,66,69],[47,62,66,71],[43,62,67,71],[45,61,64,69],[50,62,66,69],[43,59,67,71],[45,61,64,67],[50,62,66,69]],
  step(t,s,bar,B){const ch=this.CH[bar];
    if(s===0){ch.slice(1).forEach(n=>horn(N(n),t,2.2,.03,B,'tbn'));horn(N(ch[0]-12),t,2.2,.08,B,'tuba');coro(N(ch[2]),t,2.4,.035,B,'a')}
    if(s===0||s===8)timpano(t,N(ch[0]-12),.4,B);if(bar%2&&s>=12)timpano(t,N(ch[0]-12),.12+(s-12)*.05,B);
    if(bar===7&&s===0)prato(t,.08,B,2.4);
    if(bar%4<2&&[0,6,8,12].includes(s))horn(N(ch[[3,2,3,1][[0,6,8,12].indexOf(s)]]+12),t,s===8?.5:.32,.06,B,'tpt')}},
 {name:'Bossa do Vestiário',bpm:92,swing:.1,
  CH:[[50,62,66,69,73],[47,63,66,69,71],[52,62,67,71,74],[45,61,64,67,71],[54,61,64,69,73],[47,63,66,69,71],[52,62,67,71,74],[45,61,67,70,73]],
  step(t,s,bar,B){const ch=this.CH[bar];
    if(s===0||s===6||s===8||s===14)pluck(N(s===6||s===14?ch[0]+7:ch[0])/2,t,.55,B,.3,1.4);
    if([0,3,6,10,13].includes(s)&&!(bar%4===3&&s>8))ch.slice(1).forEach((n,i)=>pluck(N(n),t+i*.012,.12,B,.55,1.2));
    nz(t,.07,s%4===2?.05:.025,5500,'bandpass',B,.6,.015); // vassourinha
    if(s===4||s===12)osc('triangle',200,t,.05,.04,B,.002)}}
];
let cur=0,trackStart=0,order=[];
function pickNext(){if(S.track>=0)return S.track;if(!order.length){order=TRACKS.map((_,i)=>i).sort(()=>Math.random()-.5);if(order[0]===cur&&order.length>1)order.push(order.shift())}return order.shift()}
function setTrack(i,announce=true){cur=i;step=0;trackStart=ctx?ctx.currentTime:0;if(announce&&onTrack)onTrack(TRACKS[cur].name)}
function schedule(){
  while(nextT<ctx.currentTime+.15){
    const T=TRACKS[cur],s=step%16,bar=Math.floor(step/16)%8,six=60/T.bpm/4;
    if(s===0&&bar===0&&step>0&&S.track<0&&ctx.currentTime-trackStart>110){setTrack(pickNext());continue}
    try{T.step(nextT,s,bar,musicBus)}catch(e){}
    step++;nextT+=six*(T.swing?(s%2?1-T.swing:1+T.swing):1);
  }
}
function music(on){if(on===undefined)on=S.music;if(!ctx)return;
  if(realOK){if(on&&!rOn){rOn=true;if(rm&&rm.el.paused&&!rm.el.ended){rm.el.play().catch(()=>{});rm.g.gain.cancelScheduledValues(ctx.currentTime);rm.g.gain.linearRampToValueAtTime(.62,ctx.currentTime+1.2)}else rPlay(rPick(scene),false)}else if(!on&&rOn){rOn=false;if(rm){const x=rm;x.g.gain.linearRampToValueAtTime(0,ctx.currentTime+.6);setTimeout(()=>{if(!rOn)x.el.pause()},700)}}return}
if(on&&!playing){playing=true;if(step===0)setTrack(S.track>=0?S.track:pickNext(),false);nextT=ctx.currentTime+.05;timer=setInterval(schedule,30)}else if(!on&&playing){playing=false;clearInterval(timer)}}
function next(){if(!ctx)return;if(realOK){if(S.rtrack>=0){S.rtrack=(S.rtrack+1)%RALL.length;saveS()}rPlay(rPick(scene));return}S.track>=0?setTrack((S.track=(S.track+1)%TRACKS.length)):setTrack(pickNext());saveS();nextT=ctx.currentTime+.05}
function choose(i){if(realOK){S.rtrack=i;saveS();if(ctx&&rOn)rPlay(i>=0?i:rPick(scene));return}S.track=i;saveS();if(!ctx)return;setTrack(i>=0?i:pickNext());nextT=ctx.currentTime+.05}
function fadeMusic(to,sec=.8){if(!ctx)return;if(realOK&&rm){const x=rm;if(to<=0.01)setTimeout(()=>{if(rm===x&&musicBus.gain.value<.01)x.el.pause()},sec*1000+300);else if(rOn&&x.el.paused&&!x.el.ended)x.el.play().catch(()=>{})}musicBus.gain.cancelScheduledValues(ctx.currentTime);musicBus.gain.setValueAtTime(musicBus.gain.value,ctx.currentTime);musicBus.gain.linearRampToValueAtTime(S.music?S.mv*.6*to:0,ctx.currentTime+sec)}


/* ---------- trilhas gravadas (Pixabay, uso livre) ---------- */
const MUS_BASE=(typeof window!=='undefined'&&window.FUTBOL_MUS)||'mus/';
const RPL={menu:[['menu1','Carnaval do Futebol'],['menu2','Samba de Arquibancada'],['menu3','Batucada do Rio'],['menu4','Samba do Horizonte'],['menu5','Samba da Manhã']],
  tac:[['tac1','Bossa da Prancheta'],['tac2','Bossa Nova do Treinador'],['tac3','Bossa do Vestiário'],['tac4','Samba Jazz de Estudo']]};
const RALL=[...RPL.menu,...RPL.tac];
let realOK=typeof location!=='undefined'&&/^https?:/.test(location.protocol),scene='menu',rm=null,rOn=false;const rOrd={menu:[],tac:[]};
function rPick(sc){if(S.rtrack>=0&&RALL[S.rtrack])return S.rtrack;const L=RPL[sc];if(!rOrd[sc].length){rOrd[sc]=L.map((_,i)=>i).sort(()=>Math.random()-.5);if(rm&&RALL[RALL.indexOf(L[rOrd[sc][0]])]&&RALL.indexOf(L[rOrd[sc][0]])===rm.i&&L.length>1)rOrd[sc].push(rOrd[sc].shift())}return RALL.indexOf(L[rOrd[sc].shift()])}
function rStop(x,sec=1.6){if(!x)return;const t=ctx.currentTime;x.g.gain.cancelScheduledValues(t);x.g.gain.setValueAtTime(x.g.gain.value,t);x.g.gain.linearRampToValueAtTime(0,t+sec);setTimeout(()=>{try{x.el.pause();x.src.disconnect()}catch(e){}},sec*1000+100)}
function rPlay(i,announce=true){if(!ctx||!RALL[i])return;const old=rm;const el=new Audio();el.preload='auto';el.src=MUS_BASE+RALL[i][0]+'.mp3';
  let src;try{src=ctx.createMediaElementSource(el)}catch(e){realOK=false;return synthFallback()}
  const g=ctx.createGain();g.gain.value=0;src.connect(g);g.connect(musicBus);
  const x={el,src,g,i};rm=x;if(!window._futUnlock){window._futUnlock=1;const u=()=>{try{ctx.resume()}catch(e){}if(rOn&&rm&&rm.el.paused&&!rm.el.ended)rm.el.play().catch(()=>{})};document.addEventListener('pointerdown',u,true);document.addEventListener('keydown',u,true)}el.onended=()=>{if(rm===x&&rOn)rPlay(rPick(scene))};
  let errs=0;el.onerror=()=>{if(rm!==x)return;errs++;if(errs<3){setTimeout(()=>{if(rm===x){el.load();el.play().catch(()=>{})}},1500)}else{rm=null;rPlay(rPick(scene),false)}};el.addEventListener('stalled',()=>{if(rm===x&&rOn)setTimeout(()=>{if(rm===x&&el.paused&&rOn)el.play().catch(()=>{})},2000)});
  const p=el.play();if(p&&p.catch)p.catch(()=>{});g.gain.linearRampToValueAtTime(.62,ctx.currentTime+2.2);rStop(old);if(announce&&onTrack)onTrack(RALL[i][1])}
function synthFallback(){if(rOn){rOn=false;playing=false;music(true)}}
function sceneSet(sc){if(sc===scene)return;scene=sc;if(realOK&&rOn&&!(S.rtrack>=0))rPlay(rPick(sc))}

/* ---------- portão de metal (abertura de tela, leilão, partida) ---------- */
function gate(big){if(!ctx)return;const t=ctx.currentTime+.02;const d=big?1.6:.9;
  // rangido metálico: ruído em filtros ressonantes com afinação que desliza
  const s=noise();const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.1);g.gain.setValueAtTime(.18,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);
  [420,1130,2380].forEach((f,i)=>{const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=28-i*6;bp.frequency.setValueAtTime(f,t);bp.frequency.linearRampToValueAtTime(f*(1.18+i*.05),t+d*.45);bp.frequency.linearRampToValueAtTime(f*.96,t+d);s.connect(bp);bp.connect(g)});
  g.connect(sfxBus);g.connect(verbIn);s.start(t);s.stop(t+d+.1);
  // trinco + batida da grade
  const e=t+d;[1,2.41,3.87,5.23].forEach((m,i)=>osc('sine',190*m,e,1.1/(i+1),.14/(i+1),verbIn,.001));osc('square',95,e,.12,.06,sfxBus,.001);nz(e,.25,.25,900,'lowpass',sfxBus,.8,.001);nz(e,.08,.12,5000,'highpass',sfxBus,.7,.001)}

/* ---------- gravações reais de estádio (Freesound, CC0) ---------- */
const SND_BASE=(typeof window!=='undefined'&&window.FUTBOL_SND)||'snd/';
const BUF={},LOADING={};
// trechos úteis de cada gravação (corta o resto para gastar pouca memória no celular)
const SEG={bat:[6,11],amb_chile:[18,42,1],amb_maraca:[26,30,1],amb_org4:[0,36.3,1],amb_org2:[0,10.5],goal:[3.6,17.5],goal2:[22.6,9.5],uh:[31,7.5],ooh:[2.4,4.6],aplauso:[0,5.8],kicks:[0,13.86],kick1:[0,.78],kick2:[0,.74],touch1:[0,.5],apito:[0,.5],apito2:[0,3.3]};
const OFF={};
function decodeLow(ab,n){const sr=/^(touch|kick|apito)/.test(n)?32000:22050;const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;let dc=null;try{dc=new OAC(1,1,sr)}catch(e){}
  const dec=c=>new Promise((ok,no)=>{try{const p=c.decodeAudioData(ab.slice(0),ok,no);if(p&&p.catch)p.catch(no)}catch(e){no(e)}});
  return (dc?dec(dc).catch(()=>dec(ctx)):dec(ctx)).then(a=>{const sg=SEG[n]||[0,a.duration];const R=a.sampleRate;const st=Math.max(0,Math.floor(sg[0]*R));const len=Math.max(1,Math.min(a.length-st,Math.floor(sg[1]*R)));
    const F=sg[2]?Math.min(Math.floor(R*1.2),len>>2):0;const out=ctx.createBuffer(1,len-F,R);const o=out.getChannelData(0);const chs=[];for(let c=0;c<a.numberOfChannels;c++)chs.push(a.getChannelData(c));const nc=chs.length;
    for(let i=0;i<len-F;i++){let v=0;for(let c=0;c<nc;c++)v+=chs[c][st+i];o[i]=v/nc}
    if(F)for(let i=0;i<F;i++){const k=i/F;let v=0;for(let c=0;c<nc;c++)v+=chs[c][st+len-F+i];o[i]=o[i]*k+(v/nc)*(1-k)}
    OFF[n]=sg[0];const nf=NOTCH[n];if(!nf||!OAC)return out;
    // tira apitos/cornetas contínuos da gravação (filtro notch renderizado uma vez só)
    try{const oc=new OAC(1,out.length,R);const s=oc.createBufferSource();s.buffer=out;let node=s;for(const f of nf){const q=oc.createBiquadFilter();q.type='notch';q.frequency.value=f;q.Q.value=3.5;node.connect(q);node=q}node.connect(oc.destination);s.start();
      return oc.startRendering().then(b=>b,()=>out)}catch(e){return out}})}
const NOTCH={amb_maraca:[2350,2500,2650],amb_org4:[1500],goal:[1500,1600,1700],aplauso:[]};
function load(n){if(BUF[n])return Promise.resolve(BUF[n]);if(LOADING[n])return LOADING[n];if(!ctx||!/^https?:/.test(location.protocol))return Promise.resolve(null);
  LOADING[n]=fetch((n==='bat'?MUS_BASE+'menu3':SND_BASE+n)+'.mp3',{cache:'force-cache'}).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>decodeLow(b,n)).then(b=>(BUF[n]=b)).catch(()=>{LOADING[n]=null;return null});return LOADING[n]}
function preload(){['touch1','kicks','kick2','kick1','amb_maraca','amb_org4','apito','goal','uh','ooh','aplauso','goal2','bat','apito2','amb_org2'].reduce((p,n)=>p.then(()=>load(n)),Promise.resolve())}
// toca um trecho [off, off+dur] com fade de entrada/saída
function clip(n,off,dur,vol,dest,fi=.04,fo=.6,rate=1,when=0){const b=BUF[n];if(!b||!ctx)return null;off=Math.max(0,off-(OFF[n]||0));if(off>=b.duration-.05)off=0;const t=ctx.currentTime+when;const s=ctx.createBufferSource();s.buffer=b;s.playbackRate.value=rate;const g=ctx.createGain();
  dur=Math.min(dur,b.duration-off);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+fi);g.gain.setValueAtTime(vol,t+Math.max(fi,dur/rate-fo));g.gain.linearRampToValueAtTime(0,t+dur/rate);
  s.connect(g);g.connect(dest||crowdBus);s.start(t,off,dur+.05);return {s,g}}
// camadas de ambiente em loop
const BED={};
function bed(n,vol,lp){const b=BUF[n];if(!b||BED[n])return;const s=ctx.createBufferSource();s.buffer=b;s.loop=true;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=lp||9000;const g=ctx.createGain();g.gain.value=0;
  const p=ctx.createStereoPanner?ctx.createStereoPanner():null;s.connect(f);f.connect(g);if(p){p.pan.value=n==='amb_org4'?-.35:n==='amb_org2'?.4:0;g.connect(p);p.connect(crowdBus)}else g.connect(crowdBus);
  s.start(ctx.currentTime,Math.random()*(b.duration-2));g.gain.linearRampToValueAtTime(vol,ctx.currentTime+2.5);BED[n]={s,g,f,base:vol}}
function bedsOff(){const t=ctx.currentTime;for(const k in BED){const x=BED[k];x.g.gain.cancelScheduledValues(t);x.g.gain.setValueAtTime(x.g.gain.value,t);x.g.gain.linearRampToValueAtTime(0,t+1);setTimeout(()=>{try{x.s.stop()}catch(e){}},1200);delete BED[k]}}
function bedLevel(mult,tc=.5,lp){const t=ctx.currentTime;for(const k in BED){const x=BED[k];x.g.gain.cancelScheduledValues(t);x.g.gain.setTargetAtTime(x.base*mult,t,tc);if(lp)x.f.frequency.setTargetAtTime(lp,t,tc)}}
const real=()=>!!BUF.amb_maraca;
let bedWanted=false;
function startBeds(){if(!crowdOn||!ctx)return;bed('amb_maraca',.95,7000);bed('amb_org4',1.15);
  if(real()&&crowdGain){crowdGain.gain.setTargetAtTime(.05,ctx.currentTime,.8);chantGain.gain.setTargetAtTime(0,ctx.currentTime,.8)}}
/* ---------- torcida ---------- */
let crowdOn=false,crowdSrc=[],crowdGain,crowdFilt,chantGain,drumTimer=null,drumStep=0,drumT=0,drumLevel=.25,drumBoostUntil=0,chantT=0;
function drumsTick(){ // bateria da torcida, longe (com reverb)
  if(real()){drumT=ctx.currentTime+.1;return}
  while(drumT<ctx.currentTime+.15){const s=drumStep%16,six=60/112/4,boost=ctx.currentTime<drumBoostUntil,v=drumLevel*(boost?2.2:1)*(real()?.45:1);const dst=verbIn;
    if(s===0)surdo(drumT,58,.4*v,dst);if(s===8)surdo(drumT,46,.55*v,dst);if(boost&&s===6)surdo(drumT,72,.25*v,dst,true);
    if(s%2===0||boost)caixa(drumT,(s%4===2?.07:.035)*v,dst);
    if(boost&&[0,3,6,10,13].includes(s))agogo(drumT,s===6||s===13,.03*v,dst);
    drumStep++;drumT+=six;}
  if(crowdOn&&!real()&&ctx.currentTime>chantT){chantT=ctx.currentTime+18+Math.random()*20;const t=ctx.currentTime+.1,b=48+Math.floor(Math.random()*3);
    [[0,0,.5],[.55,0,.5],[1.1,4,.5],[1.65,7,.9],[2.7,4,.5],[3.25,0,1]].forEach(([d,iv,l])=>coro(N(b+12+iv),t+d,l,.03*(1+drumLevel),crowdBus,'o'))}
}
function crowd(on){if(!ctx)return;
  if(on&&!crowdOn){crowdOn=true;crowdGain=ctx.createGain();crowdGain.gain.value=0;crowdFilt=ctx.createBiquadFilter();crowdFilt.type='bandpass';crowdFilt.frequency.value=700;crowdFilt.Q.value=.6;
    const a=noise();a.connect(crowdFilt);crowdFilt.connect(crowdGain);crowdGain.connect(crowdBus);a.start();
    chantGain=ctx.createGain();chantGain.gain.value=0;const f2=ctx.createBiquadFilter();f2.type='bandpass';f2.frequency.value=330;f2.Q.value=4;const b=noise();b.connect(f2);f2.connect(chantGain);chantGain.connect(crowdBus);b.start();
    const lfo=ctx.createOscillator();lfo.frequency.value=1.63;const lg=ctx.createGain();lg.gain.value=.04;lfo.connect(lg);lg.connect(chantGain.gain);lfo.start();
    crowdSrc=[a,b,lfo];crowdGain.gain.linearRampToValueAtTime(.32,ctx.currentTime+1.5);chantGain.gain.linearRampToValueAtTime(.06,ctx.currentTime+2);
    drumT=ctx.currentTime+.3;drumStep=0;chantT=ctx.currentTime+6;drumTimer=setInterval(drumsTick,40);
    Promise.all([load('amb_maraca'),load('amb_org4')]).then(startBeds);preload()}
  else if(!on&&crowdOn){crowdOn=false;clearInterval(drumTimer);bedsOff();const t=ctx.currentTime;crowdGain.gain.linearRampToValueAtTime(0,t+.8);chantGain.gain.linearRampToValueAtTime(0,t+.8);const src=crowdSrc;setTimeout(()=>src.forEach(s=>{try{s.stop()}catch(e){}}),1000)}
}
let lastEx=0;
function excite(x){if(!crowdOn)return;x=Math.max(0,Math.min(1,x));drumLevel=.22+x*.25;if(Math.abs(x-lastEx)<.03)return;lastEx=x;const t=ctx.currentTime;
  if(real()){const ch=BED.amb_chile;if(ch){ch.g.gain.setTargetAtTime(.25+x*.75,t,.6)}const m=BED.amb_maraca;if(m){m.g.gain.setTargetAtTime(.7+x*.45,t,.6);m.f.frequency.setTargetAtTime(5000+x*5000,t,.6)}return}crowdGain.gain.setTargetAtTime(.3+x*.45,t,.4);crowdFilt.frequency.setTargetAtTime(650+x*650,t,.4)}
function roar(peak,len,bright){const t=ctx.currentTime;
  if(real()){bedLevel(1.5,.15,11000);setTimeout(()=>ctx&&bedLevel(1,1.2,7000),len*1000);return}
  if(crowdOn){crowdGain.gain.cancelScheduledValues(t);crowdGain.gain.setValueAtTime(crowdGain.gain.value,t);crowdGain.gain.linearRampToValueAtTime(peak,t+.25);crowdGain.gain.setTargetAtTime(.45,t+len,1.2);crowdFilt.frequency.setValueAtTime(bright,t)}
  nz(t,len,.7*peak/1.6,bright*.85,'bandpass',crowdBus,.4,.08);}
function applause(dur=3,vol=.6){if(!ctx)return;if(BUF.aplauso){clip('aplauso',Math.random()*Math.max(0,5.6-dur),Math.min(dur,5.6),vol*1.6,crowdBus,.25,Math.min(1.2,dur/2));return}const t0=ctx.currentTime;const n=Math.round(dur*55);for(let i=0;i<n;i++){const t=t0+Math.random()*dur,fade=1-(t-t0)/dur*.7;nz(t,.025,vol*.25*fade*(.5+Math.random()),1500+Math.random()*2500,'bandpass',crowdBus,1.4,.001)}}
function corneta(t){horn(N(70),t,1.2,.07,verbIn,'tpt');horn(N(73),t+.02,1.2,.05,verbIn,'tpt')}
function fogos(t,n=10){for(let i=0;i<n;i++){const tt=t+.4+Math.random()*2.8;nz(tt,.09,.35,1200+Math.random()*1500,'lowpass',verbIn,.7,.001);nz(tt,.05,.15,4000,'highpass',sfxBus,.7,.001)}}
function goal(ours=true){if(!ctx)return;const t=ctx.currentTime;
  if(real()&&ours&&BUF.goal){
    // GOL: estádio explode (duas gravações de gol juntas), rojões, corneta e a bateria da torcida
    bedLevel(.2,.05);clip('goal',3.7,17,2.6,crowdBus,.03,4);if(BUF.goal2)clip('goal2',22.75,9,1.5,crowdBus,.05,3,1,.15);
    fogos(t+.2,12);corneta(t+.9);corneta(t+2.4);
    if(BUF.bat)clip('bat',6,10,.85,sfxBus,.8,3,1,2.6);
    drumBoostUntil=t+14;setTimeout(()=>ctx&&bedLevel(1.35,1.5),9000);setTimeout(()=>ctx&&bedLevel(1,3),17000);setTimeout(()=>applause(4,.5),11000);return}
  if(real()&&!ours){bedLevel(.25,.25,3000);clip('uh',31.3,3.5,.9,crowdBus,.1,1.6,.82);setTimeout(()=>ctx&&bedLevel(.8,2,6000),3500);setTimeout(()=>ctx&&bedLevel(1,3,7000),9000);return}
  if(!ours){if(crowdOn){crowdGain.gain.cancelScheduledValues(t);crowdGain.gain.setValueAtTime(crowdGain.gain.value,t);crowdGain.gain.linearRampToValueAtTime(.15,t+.4);crowdGain.gain.setTargetAtTime(.32,t+2.5,1.5)}
    nz(t,2.2,.22,900,'bandpass',verbIn,.5,.1);ohh(.7);return}
  roar(1.6,3.2,1300);nz(t+.05,2.6,.35,2600,'bandpass',crowdBus,.7);
  corneta(t+.5);fogos(t,12);drumBoostUntil=t+10;
  // "É GOOOL" da arquibancada + canto
  coro(N(57),t+.15,2.4,.07,crowdBus,'o');
  setTimeout(()=>{if(!ctx)return;const t2=ctx.currentTime;[[0,0,.45],[.5,0,.45],[1,4,.45],[1.5,7,.8],[2.4,5,.45],[2.9,4,.45],[3.4,2,.9]].forEach(([d,iv,l])=>coro(N(57+iv),t2+d,l,.06,crowdBus,'o'))},2400);
  setTimeout(()=>applause(3,.5),3200);
}
function ohh(k=1){if(!ctx||!crowdOn)return;const t=ctx.currentTime;
  if(BUF.uh||BUF.ooh){bedLevel(.55,.1);setTimeout(()=>ctx&&bedLevel(1,1),2600);const r=Math.random();if(BUF.uh&&r<.55)clip('uh',31.25+(Math.random()<.5?0:3.2),3.2,1.3*k,crowdBus,.08,1.2);else if(BUF.ooh)clip('ooh',2.55,4.2,1.5*k,crowdBus,.06,1.5);else clip('uh',31.25,3.2,1.3*k,crowdBus,.08,1.2);return}coro(N(52),t,1.1,.05*k,crowdBus,'o');const g=ctx.createGain();const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(320,t+1.2);const s=noise();s.connect(f);f.connect(g);g.connect(crowdBus);env(g,t,.15,1.3,.45*k);s.start(t);s.stop(t+1.6)}
function whistle(n=1,long=false,short=false){if(!ctx)return;let t=ctx.currentTime+.02;
  if(BUF.apito){let w=0;for(let i=0;i<n;i++){const lg=long&&i===n-1;if(lg&&BUF.apito2){clip('apito2',0,1.25,1.1,sfxBus,.01,.25,1,w);w+=1.4}else{const d=short?.28:.46;clip('apito',0,d,1.1,sfxBus,.005,.08,1,w);w+=d+.14}}return}for(let i=0;i<n;i++){const d=long&&i===n-1?.9:short?.12:.22;apito(t,.12,sfxBus,d);apito(t,.05,verbIn,d);t+=d+.12}}
function sub(){if(!ctx)return;if(BUF.apito)clip('apito',0,.3,.6,sfxBus,.005,.08);setTimeout(()=>applause(2.2,.3),350)}
function card(red){if(!ctx)return;whistle(red?2:1,false,true);if(!crowdOn)return;const t=ctx.currentTime+.3;
  nz(t,1.4,red?.35:.22,260,'bandpass',crowdBus,2,.25);for(let i=0;i<(red?10:5);i++){const tt=t+Math.random()*1.2,o=ctx.createOscillator();o.frequency.setValueAtTime(2200+Math.random()*900,tt);o.frequency.linearRampToValueAtTime(1600+Math.random()*600,tt+.5);const g=ctx.createGain();env(g,tt,.05,.5,.012);o.connect(g);g.connect(verbIn);o.start(tt);o.stop(tt+.6)}}
function foul(){whistle(1,false,true)}
function corner(){if(!ctx||!crowdOn)return;const t=ctx.currentTime;if(real()){bedLevel(1.35,.3,10000);setTimeout(()=>ctx&&bedLevel(1,.8,7000),1800);return}crowdGain.gain.setTargetAtTime(.75,t,.3);crowdGain.gain.setTargetAtTime(.4,t+1.8,.8)}
function save(){ohh(.9);setTimeout(()=>applause(1.6,.4),700)}
function post(){if(!ctx)return;const t=ctx.currentTime;[[740,1.4,.22],[1180,1,.14],[1990,.7,.09],[3100,.4,.05]].forEach(([f,d,v])=>osc('sine',f,t,d,v,sfxBus,.001));setTimeout(()=>ohh(1),150)}
// fanfarra de campeão: metais em tríade, tímpanos, pratos, fogos e a torcida
function fanfare(){if(!ctx)return;if(ctx.state!=='running'){try{ctx.resume()}catch(e){}}const t=ctx.currentTime+.08;const B=N(60);
  const seq=[[0,0,.18],[.2,0,.18],[.4,0,.18],[.6,4,.55],[1.2,7,.55],[1.8,12,1.6]];
  seq.forEach(([d,iv,l])=>{horn(N(60+iv),t+d,l,.09,verbIn,'tpt');horn(N(55+iv),t+d,l,.07,verbIn,'tbn');if(iv>=4)horn(N(48+iv),t+d,l,.06,verbIn,'tuba')});
  [[0,1],[.6,1],[1.2,1.2],[1.8,1.5],[2.1,1.2],[2.4,1.5]].forEach(([d,v])=>timpano(t+d,N(36),.35*v,verbIn));
  prato(t+1.8,.22,verbIn,2.4);prato(t+3.4,.18,verbIn,2);
  [[3.6,7],[4.2,9],[4.8,12],[5.4,16]].forEach(([d,iv])=>{horn(N(60+iv),t+d,.5,.07,verbIn,'tpt');horn(N(64+iv),t+d,.5,.05,verbIn,'tpt')});
  fogos(t+.5,18);setTimeout(()=>{applause(5,.55);try{corneta(ctx.currentTime+.2)}catch(e){}},900)}
function final(won){if(!ctx)return;whistle(3,true);if(won){setTimeout(()=>{roar(1.1,3,1100);applause(4,.6);corneta(ctx.currentTime+.3);drumBoostUntil=ctx.currentTime+8},1500)}else setTimeout(()=>applause(2.5,.3),1500)}

/* ---------- toques na bola (gravações reais) ---------- */
const KOFF=[.53,1.91,3.61,4.93,6.35,7.79,8.99,10.35,11.64,13.05];let lastTouchT=0;
const rr=(a,b)=>a+Math.random()*(b-a);
function touch(){if(!ctx)return;const t=ctx.currentTime;if(t-lastTouchT<.09)return;lastTouchT=t;
  if(BUF.touch1){clip('touch1',.03,.32,rr(.35,.6),sfxBus,.002,.12,rr(.85,1.2));return}
  bumbo(t,.12,sfxBus)}
function trap(){if(!ctx)return;const t=ctx.currentTime;if(t-lastTouchT<.06)return;lastTouchT=t;
  if(BUF.touch1){clip('touch1',.03,.35,rr(.55,.8),sfxBus,.002,.14,rr(.75,.95));return}bumbo(t,.2,sfxBus)}
function pass(){if(!ctx)return;lastTouchT=ctx.currentTime;
  if(BUF.kicks){const o=KOFF[Math.random()*KOFF.length|0]-.03;clip('kicks',o,.55,rr(.45,.7),sfxBus,.003,.2,rr(.95,1.1));return}kickSfx()}
function shot(){if(!ctx)return;lastTouchT=ctx.currentTime;
  if(BUF.kick2){clip('kick2',.03,.7,1.15,sfxBus,.002,.25,rr(.92,1.04));if(BUF.kick1)clip('kick1',.03,.7,1.4,verbIn,.002,.3);return}kickSfx();kickSfx()}
function kickSfx(){if(!ctx)return;const t=ctx.currentTime;bumbo(t,.35,sfxBus);nz(t,.05,.18,1800,'lowpass',sfxBus)}
function click(){if(!ctx)return;const t=ctx.currentTime;[1,2.7].forEach((m,i)=>osc('sine',1400*m,t,.05/(i+1),.03/(i+1),sfxBus,.001))}
function set(k,v){S[k]=v;saveS();if(!ctx)return;musicBus.gain.setTargetAtTime(S.music?S.mv*.6:0,ctx.currentTime,.1);sfxBus.gain.setTargetAtTime(S.sfx?S.sv:0,ctx.currentTime,.1);crowdBus.gain.setTargetAtTime(S.sfx?S.cv:0,ctx.currentTime,.1);if(k==='music')music(v)}
return {fanfare,get loaded(){return Object.keys(BUF).map(k=>k+":"+BUF[k].duration.toFixed(1)+"s@"+BUF[k].sampleRate)},init,preload,touch,trap,pass,shot,music,next,choose,fadeMusic,crowd,excite,goal,ohh,whistle,kick:kickSfx,click,sub,card,foul,corner,save,post,applause,final,set,gate,
  get tracks(){return realOK?RALL.map(t=>t[1]):TRACKS.map(t=>t.name)},get current(){return realOK?(rm?RALL[rm.i][1]:''):TRACKS[cur].name},get trackSel(){return realOK?(S.rtrack??-1):S.track},scene:sceneSet,set onTrack(f){onTrack=f},get S(){return S},get ready(){return !!ctx}};
})();
