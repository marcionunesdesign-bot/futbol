/* Camisa 11 — desenho da partida: câmera de TV em perspectiva (jogadores com corpo) e visão tática de cima */
var C11Render=(function(){
'use strict';
const L=105,W=68,GW=7.32;
const SKIN=['#f1c7a5','#d9a57c','#b77b52','#8a5636','#5e3a22'],HAIR=['#1b1410','#3b2416','#6b4a2a','#141414'];
const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255]};
const cdist=(a,b)=>{const x=hex(a),y=hex(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])};
const shade=(h,f)=>{const [r,g,b]=hex(h);const c=v=>Math.max(0,Math.min(255,Math.round(f>0?v+(255-v)*f:v*(1+f))));return `rgb(${c(r)},${c(g)},${c(b)})`};
function kits(home,away){
  const k=c=>({c1:c.kit[0],c2:c.kit[1],c3:c.kit[2],pat:c.kit[3]});
  const h=k(home);let a=k(away);
  if(cdist(h.c1,a.c1)<150||cdist(h.c1,a.c2)<60&&cdist(h.c2,a.c1)<60){a=cdist(h.c1,'#f4f4f4')>200?{c1:'#f4f4f4',c2:away.kit[0],c3:away.kit[0],pat:'liso'}:{c1:away.kit[1]==='#ffffff'?'#20232a':away.kit[1],c2:away.kit[0],c3:'#ffffff',pat:'liso'}}
  const shorts=x=>x.pat==='liso'?(cdist(x.c1,'#ffffff')<40?'#f2f2f2':x.c2==='#ffffff'&&cdist(x.c1,'#111111')>60?'#ffffff':x.c2):x.c2;
  h.sh=shorts(h);a.sh=shorts(a);
  h.gk={c1:'#f5c518',c2:'#1d1d1d',c3:'#1d1d1d',pat:'liso',sh:'#1d1d1d'};a.gk={c1:'#2ec27e',c2:'#0e3b26',c3:'#0e3b26',pat:'liso',sh:'#0e3b26'};
  if(cdist(a.gk.c1,h.c1)<120)a.gk.c1='#e86a1f';if(cdist(h.gk.c1,a.c1)<120)h.gk.c1='#b06bf2';
  return [h,a];
}
function fillShirt(ctx,x,y,w,h,kit,o={}){
  ctx.save();ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,w*.25):ctx.rect(x,y,w,h);ctx.clip();
  ctx.fillStyle=kit.c1;ctx.fillRect(x,y,w,h);ctx.fillStyle=kit.c2;
  if(kit.pat==='listras'){const n=5;for(let i=1;i<n;i+=2)ctx.fillRect(x+w*i/n,y,w/n,h)}
  else if(kit.pat==='listras_h'){const n=5;for(let i=1;i<n;i+=2)ctx.fillRect(x,y+h*i/n,w,h/n)}
  else if(kit.pat==='faixa'){ctx.beginPath();ctx.moveTo(x,y+h*.05);ctx.lineTo(x+w*.35,y);ctx.lineTo(x+w,y+h*.7);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill()}
  else if(kit.pat==='faixa_h'){ctx.fillRect(x,y+h*.38,w,h*.26)}
  else if(kit.pat==='metade'){ctx.fillRect(x+w/2,y,w/2,h)}
  // tecido: textura de malha bem sutil
  if(w>14){ctx.globalAlpha=.03;ctx.strokeStyle='#000';ctx.lineWidth=Math.max(.5,w*.012);for(let i=-h;i<w;i+=Math.max(3,w*.12)){ctx.beginPath();ctx.moveTo(x+i,y);ctx.lineTo(x+i+h,y+h);ctx.stroke()}ctx.globalAlpha=1}
  // volume 3D: luz vem de cima/esquerda (relativo ao lado para onde o jogador olha)
  const f=o.f||1,lx=f>0?.3:.7;
  const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(0,0,0,.42)');g.addColorStop(Math.max(.05,lx-.22),'rgba(0,0,0,.05)');g.addColorStop(lx,'rgba(255,255,255,.34)');g.addColorStop(Math.min(.95,lx+.25),'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  const gv=ctx.createLinearGradient(x,y,x,y+h);gv.addColorStop(0,'rgba(255,255,255,.18)');gv.addColorStop(.35,'rgba(255,255,255,0)');gv.addColorStop(1,'rgba(0,0,0,.32)');ctx.fillStyle=gv;ctx.fillRect(x,y,w,h);
  // dobras do tecido que mexem com a passada
  if(w>10){const ph=o.ph||0;ctx.strokeStyle='rgba(0,0,0,.13)';ctx.lineWidth=Math.max(.6,w*.03);ctx.lineCap='round';
    for(let i=0;i<2;i++){const yy=y+h*(.42+i*.17)+Math.sin(ph+i)*h*.03;ctx.beginPath();ctx.moveTo(x+w*(.18+i*.05),yy);ctx.quadraticCurveTo(x+w*.5,yy+h*.07*Math.sin(ph*.5+i),x+w*(.82-i*.04),yy-h*.05);ctx.stroke()}
    ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=Math.max(.5,w*.025);ctx.beginPath();ctx.moveTo(x+w*lx-w*.1,y+h*.15);ctx.quadraticCurveTo(x+w*lx,y+h*.35,x+w*lx-w*.04,y+h*.62);ctx.stroke()}
  ctx.restore();
}
function torsoPath(ctx,x0,y0,x1,y1,wTop,wBot,lean){ // ombros (x0,y0) -> cintura (x1,y1), com ombros arredondados e peito
  const t=wTop/2,bt=wBot/2,my=(y0+y1)/2,mx=(x0+x1)/2;
  ctx.beginPath();ctx.moveTo(x0-t*.72,y0-wTop*.02);
  ctx.quadraticCurveTo(x0,y0-wTop*.16,x0+t*.72,y0-wTop*.02);                 // linha dos ombros
  ctx.quadraticCurveTo(x0+t*1.04,y0+wTop*.04,x0+t*.98,y0+wTop*.24);         // ombro direito arredondado
  ctx.quadraticCurveTo(mx+t*1.02,my,x1+bt,y1);                               // lateral com volume
  ctx.quadraticCurveTo(x1,y1+wBot*.1,x1-bt,y1);                              // cintura
  ctx.quadraticCurveTo(mx-t*1.02,my,x0-t*.98,y0+wTop*.24);
  ctx.quadraticCurveTo(x0-t*1.04,y0+wTop*.04,x0-t*.72,y0-wTop*.02);ctx.closePath()}
function limb(ctx,ax,ay,bx,by,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke()}
function drawPerson(ctx,sx,sy,s,o){
  // o: kit, ph (fase da passada), mv (0..1 velocidade), face (1/-1), skin, hair, hl, gk, kick
  const h=1.82*s*(o.scale||1.18),k=o.kit,f=o.face||1;const run=Math.max(0,Math.min(1,o.mv||0));const ph=o.ph||0;
  const sock=k.c3&&k.c3!==k.c1?k.c3:k.c2||k.c1;const skin=SKIN[o.skin]||SKIN[1];const skinD=shade(skin,-.22);
  const bob=Math.abs(Math.cos(ph))*h*.028*run;const lean=(run*.2+(o.kick?.12:0))*f;
  // sombra
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(sx+h*.14,sy+h*.012,h*.26+run*h*.06,h*.062,-.12,0,6.283);ctx.fill();
  if(o.hl){ctx.strokeStyle=o.hl;ctx.lineWidth=Math.max(1.5,h*.032);ctx.beginPath();ctx.ellipse(sx,sy,h*.3,h*.085,0,0,6.283);ctx.stroke()}
  ctx.lineCap='round';ctx.lineJoin='round';
  const hipX=sx+lean*h*.05,hipY=sy-h*.5-bob,L1=h*.255,L2=h*.255,lw=Math.max(1.4,h*.075);
  const legP=(phase,front)=>{let a=Math.sin(phase)*.7*run;let bend=.1+Math.max(0,-Math.cos(phase))*1.05*run;
      if(o.kick&&front){a=.95;bend=.15}
      const kx=hipX+Math.sin(a)*L1*f,ky=hipY+Math.cos(a)*L1;const b2=a-bend;const fx=kx+Math.sin(b2)*L2*f,fy=Math.min(sy,ky+Math.cos(b2)*L2);
      return {kx,ky,fx,fy}};
  const drawLeg=(q,dark)=>{const sh=dark?shade(k.sh,-.25):k.sh,so=dark?shade(sock,-.25):sock;
    limb(ctx,hipX,hipY,q.kx,q.ky,lw*1.12,sh);                                          // coxa (calção)
    limb(ctx,q.kx,q.ky,q.kx+(q.fx-q.kx)*.25,q.ky+(q.fy-q.ky)*.25,lw*.92,dark?skinD:skin); // joelho
    limb(ctx,q.kx+(q.fx-q.kx)*.25,q.ky+(q.fy-q.ky)*.25,q.fx,q.fy,lw*.9,so);             // meião
    ctx.fillStyle=dark?'#0b0b0b':'#161616';ctx.beginPath();ctx.ellipse(q.fx+f*h*.035,q.fy+h*.004,h*.055,h*.022,f*.15,0,6.283);ctx.fill();if(h>20&&!dark){ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(q.fx+f*h*.045,q.fy-h*.006,h*.022,h*.007,f*.15,0,6.283);ctx.fill()}}; // chuteira
  const back=legP(ph+Math.PI,false),frontL=legP(ph,true);
  const shY=hipY-h*.31,shX=hipX+lean*h*.32;
  const armP=(phase)=>{const a=-Math.sin(phase)*.85*run+(run<.15?.12:0);const ex=shX+Math.sin(a)*h*.17*f,ey=shY+Math.cos(a)*h*.17;const b=a+(.5+run*.9);const hx=ex+Math.sin(b)*h*.16*f,hy=ey+Math.cos(b)*h*.15;return {ex,ey,hx,hy}};
  const drawArm=(q,dark)=>{limb(ctx,shX,shY+h*.02,q.ex,q.ey,lw*1.02,dark?shade(k.c1,-.3):k.c1);if(h>20){const cx=shX+(q.ex-shX)*.82,cy=shY+h*.02+(q.ey-shY-h*.02)*.82;limb(ctx,cx,cy,q.ex,q.ey,lw*1.04,dark?shade(k.c2||k.c1,-.3):(k.c2||k.c1))}limb(ctx,q.ex,q.ey,q.hx,q.hy,lw*.74,dark?skinD:skin);
    if(o.gk){ctx.fillStyle=dark?'#cfcfcf':'#f2f2f2';ctx.beginPath();ctx.arc(q.hx,q.hy,h*.038,0,6.283);ctx.fill()}};
  drawLeg(back,true);drawArm(armP(ph),true);
  // calção
  {const sg=ctx.createLinearGradient(hipX-h*.135,0,hipX+h*.135,0);sg.addColorStop(0,shade(k.sh,-.3));sg.addColorStop(f>0?.35:.65,shade(k.sh,.12));sg.addColorStop(1,shade(k.sh,-.35));ctx.fillStyle=sg;
   ctx.beginPath();ctx.moveTo(hipX-h*.125,hipY-h*.06);ctx.lineTo(hipX+h*.125,hipY-h*.06);ctx.lineTo(hipX+h*.135,hipY+h*.07);ctx.lineTo(hipX-h*.135,hipY+h*.07);ctx.closePath();ctx.fill();
   if(h>22){ctx.strokeStyle=k.c2&&k.c2!==k.sh?k.c2:shade(k.sh,.4);ctx.lineWidth=h*.012;ctx.beginPath();ctx.moveTo(hipX+f*h*.12,hipY-h*.055);ctx.lineTo(hipX+f*h*.13,hipY+h*.065);ctx.stroke()}}
  drawLeg(frontL,false);
  // tronco com a camisa
  const tw=h*(.33-.08*Math.min(1,Math.abs(f))),bw=h*(.25-.05*Math.min(1,Math.abs(f)));ctx.save();torsoPath(ctx,shX,shY,hipX,hipY-h*.04,tw,bw,lean);ctx.clip();
  const bx=Math.min(shX,hipX)-h*.2,by=shY-h*.06;fillShirt(ctx,bx,by,h*.4+Math.abs(shX-hipX),h*.36,k,{f,ph});ctx.restore();
  ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=Math.max(.7,h*.014);torsoPath(ctx,shX,shY,hipX,hipY-h*.04,tw,bw,lean);ctx.stroke();
  // gola
  if(h>18){ctx.fillStyle=k.c2&&k.c2!==k.c1?k.c2:shade(k.c1,-.35);ctx.beginPath();ctx.ellipse(shX+f*h*.01,shY+h*.005,h*.055,h*.022,0,0,Math.PI);ctx.fill();
    ctx.fillStyle=shade(SKIN[o.skin]||SKIN[1],-.3);ctx.beginPath();ctx.ellipse(shX+f*h*.01,shY,h*.035,h*.012,0,0,Math.PI);ctx.fill()}
  // número nas costas quando de lado
  drawArm(armP(ph+Math.PI),false);
  // pescoço e cabeça
  const hx=shX+f*h*.02+lean*h*.06,hy=shY-h*.11;
  limb(ctx,shX,shY,hx,hy+h*.03,lw*.8,skinD);
  const hr=h*.075;const hg=ctx.createRadialGradient(hx-f*hr*.3,hy-hr*.3,hr*.2,hx,hy,hr);hg.addColorStop(0,shade(skin,.12));hg.addColorStop(1,skinD);
  ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(hx,hy,hr*.92,hr,0,0,6.283);ctx.fill();
  ctx.fillStyle=HAIR[o.hair]||HAIR[0];ctx.beginPath();
  if((o.hair||0)%4===3){ctx.arc(hx,hy-hr*.2,hr*.95,Math.PI*1.08,Math.PI*1.92)}else{ctx.ellipse(hx-f*hr*.12,hy-hr*.25,hr*.98,hr*.8,0,Math.PI,Math.PI*2)}ctx.fill();
  if(Math.abs(f)>.35){ctx.fillStyle=skinD;ctx.beginPath();ctx.arc(hx+f*hr*.75,hy+hr*.1,hr*.18,0,6.283);ctx.fill()} // nariz/perfil
}

class Renderer{
  constructor(canvas,match,opts={}){this.cv=canvas;this.ctx=canvas.getContext('2d');this.m=match;this.o=Object.assign({mode:'tv',vertical:false,userSide:0,arrows:false,labels:true},opts);
    this.camX=L/2;this.camY=W/2;this.kits=kits(match.T[0].club,match.T[1].club);this.crowd=null;this.zoom=opts.zoom||1;this.resize();this.info=new Map();this.buildInfo();
    if(window.ResizeObserver){let last='';this.ro=new ResizeObserver(()=>{const r=this.cv.getBoundingClientRect();const k=Math.round(r.width)+'x'+Math.round(r.height);if(k!==last&&r.width>0){last=k;this.resize();this.draw()}});this.ro.observe(this.cv)}}
  setZoom(z){this.zoom=z}
  buildInfo(){for(const T of this.m.T)for(const mp of [...T.mps,...T.out])this.info.set(mp.id,{side:T.side,num:mp.num,skin:mp.skin,hair:mp.hair,name:mp.p.n,gk:T.slots[mp.si].role==='GOL',mp})}
  resize(){const r=this.cv.getBoundingClientRect();const dpr=Math.min(3,window.devicePixelRatio||1);this.dpr=dpr;this.cw=Math.max(300,r.width);this.ch=Math.max(200,r.height);this.cv.width=this.cw*dpr;this.cv.height=this.ch*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.crowd=null}
  setMode(m){this.o.mode=m}
  // ----- projeção TV -----
  setupTV(){const cw=this.cw,ch=this.ch;this.Z0=78;const far=this.Z0/(this.Z0+W+6);this.farY=ch*.17;this.nearY=ch*1.02;this.A=(this.nearY-this.farY)/(1-far);this.hor=this.nearY-this.A;this.ppm=cw/(cw<520?60:cw<900?50:42)}
  P(x,y,z=0){const sc=this.Z0/(this.Z0+(W+3-y));return [this.cw/2+(x-this.camX)*this.ppm*sc,this.hor+this.A*sc-z*this.ppm*sc,this.ppm*sc]}
  view(){
    // estado ao vivo -> visão
    const m=this.m,pl=[];
    const al=Math.max(0,Math.min(1,this.alpha??1));const I=(a,b)=>a==null||Math.abs(b-a)>12?b:a+(b-a)*al;
    for(const T of m.T)for(const mp of T.mps){if(mp.off)continue;pl.push({id:mp.id,x:I(mp._px,mp.x),y:I(mp._py,mp.y),ph:mp._pph!=null?mp._pph+(mp.ph-mp._pph)*al:mp.ph,face:mp.fs??mp.face,mv:Math.min(1,Math.hypot(mp.vx,mp.vy)/6.5),kick:mp.kt!=null&&m.t-mp.kt<.22,kk:mp.kk,touch:mp.tt!=null&&m.t-mp.tt<.2,anim:mp.anim?{k:mp.anim.k,id:mp.anim.t}:null,st:Math.round(mp.stam),trick:mp.trick&&m.t-mp.trick.t<1.3?{k:mp.trick.k,a:m.t-mp.trick.t,id:mp.trick.t}:null,fx:mp.fx?{k:mp.fx.k,id:mp.fx.t}:null,hold:!!mp.gkHold})}
    const b=m.ball;return {pl,b:{x:I(b._px,b.x),y:I(b._py,b.y),z:I(b._pz,b.z)},own:b.own?b.own.id:null,fly:b.st==='fly'?b.fly:null,cele:m.goalCele,flip:!!m.flip,cut:m.cutId||0,setup:m.setup&&m.dead>0?{kind:m.setup.kind,taker:m.setup.taker?m.setup.taker.id:null}:null,flag:m.flagT&&m.t-m.flagT.t<3?{a:m.t-m.flagT.t,x:m.flagT.x}:null,post:m.postT&&m.t-m.postT.t<1?{a:m.t-m.postT.t,x:m.postT.x,y:m.postT.y,z:m.postT.z}:null,dead:m.dead>0,card:m.cardT&&m.t-m.cardT.t<2.4?{red:m.cardT.red}:null}
  }
  flipView(v){const fx=x=>L-x,fy=y=>W-y;const o={...v,pl:v.pl.map(p=>({...p,x:fx(p.x),y:fy(p.y),face:-(p.face||1)})),b:{...v.b,x:fx(v.b.x),y:fy(v.b.y)},flag:v.flag?{...v.flag,x:fx(v.flag.x)}:null,post:v.post?{...v.post,x:fx(v.post.x),y:fy(v.post.y)}:null};
    if(v.fly)o.fly={...v.fly,fx:fx(v.fly.fx),fy:fy(v.fly.fy),tx:fx(v.fly.tx),ty:fy(v.fly.ty),ix:v.fly.ix!=null?fx(v.fly.ix):undefined,iy:v.fly.iy!=null?fy(v.fly.iy):undefined};o.flip=false;o._flipped=true;return o}
  draw(v,dt=1/60){
    v=v||this.view();if(v.flip)v=this.flipView(v);this.flipped=!!v._flipped;if(this.o.mode==='top')return this.drawTop(v);
    this.setupTV();const ctx=this.ctx,cw=this.cw,ch=this.ch;
    // câmera
    const half=cw/2/this.ppm;let tx=v.b.x;if(v.cele){const mp=v.cele.mp;tx=this.flipped?L-mp.x:mp.x}
    tx=Math.max(half-6,Math.min(L-half+6,tx));this.camX+=(tx-this.camX)*Math.min(1,dt*2.2);
    // zoom de câmera: aproxima em volta da bola (desenho vetorial, sem perder nitidez)
    const Z=this.o.mode==='top'?1:(this.zoom||1);
    if(Z>1.01){const [fx,fy]=this.P(v.b.x,v.b.y,0);this.fy=this.fy==null?fy:this.fy+(fy-this.fy)*Math.min(1,dt*3);this.fx=this.fx==null?fx:this.fx+(fx-this.fx)*Math.min(1,dt*3);
      const ox=Math.max(cw-cw*Z,Math.min(0,cw/2-this.fx*Z)),oy=Math.max(ch-ch*Z,Math.min(0,ch*.58-this.fy*Z));const d=this.dpr||1;ctx.setTransform(d*Z,0,0,d*Z,d*ox,d*oy)}
    // arquibancada
    this.drawStands();
    // gramado
    const cor=(x,y)=>this.P(x,y);
    const poly=(pts,fill)=>{ctx.beginPath();pts.forEach(([x,y],i)=>{const [a,b]=cor(x,y);i?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.closePath();ctx.fillStyle=fill;ctx.fill()};
    poly([[-8,-3],[L+8,-3],[L+8,W+5],[-8,W+5]],'#2a6330');
    const n=18;for(let i=0;i<n;i++){const x0=i*L/n,x1=(i+1)*L/n;poly([[x0,0],[x1,0],[x1,W],[x0,W]],i%2?'#2f6d35':'#37803d')}
    for(let j=0;j<8;j++){if(j%2)continue;const y0=j*W/8,y1=(j+1)*W/8;ctx.globalAlpha=.07;poly([[0,y0],[L,y0],[L,y1],[0,y1]],'#000');ctx.globalAlpha=1}
    if(!this.noise){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const im=x.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=22}x.putImageData(im,0,0);this.noise=ctx.createPattern(c,'repeat')}
    ctx.save();ctx.beginPath();[[-8,-3],[L+8,-3],[L+8,W+5],[-8,W+5]].forEach(([x,y],i)=>{const [a,b2]=cor(x,y);i?ctx.lineTo(a,b2):ctx.moveTo(a,b2)});ctx.closePath();ctx.clip();ctx.fillStyle=this.noise;ctx.globalCompositeOperation='overlay';ctx.fillRect(0,0,cw,ch);ctx.restore();
    // linhas
    ctx.strokeStyle='rgba(245,250,240,.9)';ctx.lineWidth=2;ctx.shadowColor='rgba(255,255,255,.35)';ctx.shadowBlur=3;
    const line=pts=>{ctx.beginPath();pts.forEach(([x,y],i)=>{const [a,b]=cor(x,y);i?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.stroke()};
    line([[0,0],[L,0],[L,W],[0,W],[0,0]]);line([[L/2,0],[L/2,W]]);
    const circ=(cx,cy,r,a0=0,a1=6.283)=>{const pts=[];for(let i=0;i<=40;i++){const a=a0+(a1-a0)*i/40;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}line(pts)};
    circ(L/2,W/2,9.15);
    for(const s of [0,1]){const x=s?L:0,d=s?-1:1;line([[x,W/2-20.16],[x+d*16.5,W/2-20.16],[x+d*16.5,W/2+20.16],[x,W/2+20.16]]);line([[x,W/2-9.16],[x+d*5.5,W/2-9.16],[x+d*5.5,W/2+9.16],[x,W/2+9.16]]);
      const a=Math.acos(5.5/9.15);circ(x+d*11,W/2,9.15,s?Math.PI-a:-a,s?Math.PI+a:a)}
    ctx.fillStyle='#eef6ea';for(const [x,y] of [[L/2,W/2],[11,W/2],[L-11,W/2]]){const [a,b,s]=cor(x,y);ctx.beginPath();ctx.ellipse(a,b,s*.25,s*.12,0,0,6.283);ctx.fill()}
    ctx.shadowBlur=0;
    // traço do passe
    // TV: sem linha tracejada; só uma marca discreta onde a bola alta vai cair
    if(v.fly&&v.fly.kind!=='shot'&&v.fly.h>=.6){const [mx,my,ms]=this.P(v.fly.ix??v.fly.tx,v.fly.iy??v.fly.ty);ctx.strokeStyle='rgba(255,250,200,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(mx,my,ms*.45,ms*.16,0,0,6.283);ctx.stroke()}
    if(this.o.arrows)this.drawArrowsTV(line);
    // gols do fundo (lado de cima)
    // ordenar objetos por profundidade
    const objs=v.pl.map(p=>({y:p.y,p}));objs.push({y:v.b.y,ball:v.b});
    objs.push({y:W/2-GW/2-.01,goal:0},{y:W/2-GW/2-.01,goal:1});
    objs.sort((a,b)=>a.y-b.y);
    for(const o of objs){
      if(o.goal!==undefined){this.drawGoal(o.goal);continue}
      if(o.ball){const b=o.ball;this.trail=this.trail||[];this.trail.push([b.x,b.y,b.z]);if(this.trail.length>9)this.trail.shift();
        if(v.fly&&v.fly.kind==='shot'||b.z>1.2){ctx.lineCap='round';for(let i=1;i<this.trail.length;i++){const [x0,y0,z0]=this.trail[i-1],[x1,y1,z1]=this.trail[i];const p0=this.P(x0,y0,z0+.11),p1=this.P(x1,y1,z1+.11);ctx.strokeStyle=`rgba(255,255,230,${i/this.trail.length*.5})`;ctx.lineWidth=Math.max(1,p1[2]*.22*i/this.trail.length);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}}const [gx,gy,s]=cor(b.x,b.y);const hz=Math.max(0,b.z);const sh=1/(1+hz*.35);ctx.fillStyle=`rgba(0,0,0,${.42*sh})`;ctx.beginPath();ctx.ellipse(gx+hz*s*.04,gy,s*.24*(1+hz*.08),s*.09,0,0,6.283);ctx.fill();
        // giro da bola pelo deslocamento
        if(this._bp){const d=Math.hypot(b.x-this._bp[0],b.y-this._bp[1]);if(d<6){this.bspin=(this.bspin||0)+d/.11*(b.x>=this._bp[0]?1:-1)}}this._bp=[b.x,b.y];
        const [bx,by]=this.P(b.x,b.y,b.z+.11);const r=Math.max(2.6,s*.2);const g=ctx.createRadialGradient(bx-r*.35,by-r*.4,r*.1,bx,by,r);g.addColorStop(0,'#ffffff');g.addColorStop(.7,'#e9eeea');g.addColorStop(1,'#9aa49f');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx,by,r,0,6.283);ctx.fill();
        ctx.save();ctx.beginPath();ctx.arc(bx,by,r,0,6.283);ctx.clip();ctx.fillStyle='#1c1f22';const sp=this.bspin||0;for(let k=0;k<5;k++){const a=sp+k*1.2566;const cx=Math.cos(a),vis=Math.sin(a);if(vis<-.1)continue;const px=bx+cx*r*.62,py=by+(k%2?-.35:.3)*r;ctx.beginPath();ctx.arc(px,py,r*.26*(.55+.45*vis),0,6.283);ctx.fill()}
        ctx.restore();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=Math.max(.6,r*.12);ctx.beginPath();ctx.arc(bx,by,r,0,6.283);ctx.stroke();continue}
      const p=o.p;let inf=this.info.get(p.id);if(!inf){this.buildInfo();inf=this.info.get(p.id)}if(!inf)continue;const [sx,sy,s]=cor(p.x,p.y);if(sx<-40||sx>cw+40)continue;
      const kit=inf.gk?this.kits[inf.side].gk:this.kits[inf.side];
      const hl=v.own===p.id?'#fff36b':null;
      drawPerson(ctx,sx,sy,s,{kit,ph:p.ph,mv:p.mv??.6,face:p.face||1,skin:inf.skin,hair:inf.hair,hl,gk:inf.gk,kick:p.kick});
      if(this.o.labels&&(v.own===p.id||(inf.side===this.o.userSide&&s>11&&Z<1.2))){const nm=v.own===p.id?`${inf.num} ${inf.name}`:String(inf.num);
        const zf=1/Math.sqrt(Z);ctx.font=`700 ${(v.own===p.id?12:10)*zf}px "Barlow Condensed",sans-serif`;const tw=ctx.measureText(nm).width;const ly=sy-2.2*s-10*zf;
        ctx.fillStyle=v.own===p.id?'rgba(10,12,10,.78)':'rgba(10,12,10,.5)';ctx.fillRect(sx-tw/2-4*zf,ly-10*zf,tw+8*zf,14*zf);ctx.fillStyle=v.own===p.id?'#fff36b':'#fff';ctx.textAlign='center';ctx.fillText(nm,sx,ly+1)}
    }
    // vinheta
    if(Z>1.01){const d=this.dpr||1;ctx.setTransform(d,0,0,d,0,0)}
    const lg=ctx.createRadialGradient(cw*.5,-ch*.2,ch*.2,cw*.5,ch*.4,ch*1.1);lg.addColorStop(0,'rgba(255,250,225,.16)');lg.addColorStop(.5,'rgba(255,250,225,.04)');lg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=lg;ctx.fillRect(0,0,cw,ch);
    const vg=ctx.createRadialGradient(cw/2,ch*.55,Math.min(cw,ch)*.35,cw/2,ch*.55,Math.max(cw,ch)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,cw,ch);
  }
  drawGoal(s){
    const ctx=this.ctx;const x=s?L:0,d=s?1:-1;const y0=W/2-GW/2,y1=W/2+GW/2,H=2.44,D=2;
    const P=(a,b,c)=>this.P(a,b,c);
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.8;
    for(let i=0;i<=8;i++){const y=y0+(y1-y0)*i/8;const a=P(x,y,H),b=P(x+d*D,y,H*.7),c=P(x+d*D,y,0);ctx.beginPath();ctx.moveTo(...a.slice(0,2));ctx.lineTo(...b.slice(0,2));ctx.lineTo(...c.slice(0,2));ctx.stroke()}
    for(let i=0;i<=4;i++){const z=H*.7*i/4;const a=P(x+d*D,y0,z),b=P(x+d*D,y1,z);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
    ctx.strokeStyle='#f6f6f6';ctx.lineWidth=2.6;ctx.lineCap='round';
    const a=P(x,y0,0),b=P(x,y0,H),c=P(x,y1,H),e=P(x,y1,0);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(e[0],e[1]);ctx.stroke();
  }
  drawStands(){
    const ctx=this.ctx,cw=this.cw;const [,fy]=this.P(0,-3);
    if(!this.crowd||this.crowd.w!==cw){const c=document.createElement('canvas');c.width=cw*2;c.height=Math.max(10,Math.ceil(fy));const x=c.getContext('2d');
      const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'#07090a');g.addColorStop(1,'#1a1e22');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
      const cols=[this.kits[0].c1,this.kits[0].c2,'#d9d4c7','#3b3f44',this.kits[1].c1];
      for(let i=0;i<c.width*c.height/14;i++){const yy=Math.random()*c.height*.86;x.fillStyle=cols[Math.random()*cols.length|0];x.globalAlpha=.25+yy/c.height*.6;x.fillRect(Math.random()*c.width,yy,2,2.4)}
      x.globalAlpha=1;this.crowd={c,w:cw}}
    const off=((this.camX*3)%(cw))|0;ctx.drawImage(this.crowd.c,off,0,cw,this.crowd.c.height,0,0,cw,this.crowd.c.height);
    // placas
    const [x0,y0]=this.P(-10,-3,1),[x1]=this.P(L+10,-3,1);const [,yb]=this.P(0,-3,0);
    ctx.fillStyle='#0e1a12';ctx.fillRect(x0,y0,x1-x0,yb-y0);
    ctx.font=`800 ${Math.max(9,(yb-y0)*.7)}px "Barlow Condensed",sans-serif`;ctx.textBaseline='middle';
    const ads=['FUTBOL','ONDA SITES','CAMPEONATO NACIONAL','TAÇA NACIONAL'];for(let i=0;i<10;i++){const [ax]=this.P(-8+i*12.5,-3,0);ctx.fillStyle=i%2?this.kits[0].c1:'#e8e8e8';ctx.fillText(ads[i%4],ax,(y0+yb)/2)}
    ctx.textBaseline='alphabetic';
  }
  drawArrowsTV(line){const m=this.m,T=m.T[this.o.userSide];for(const mp of T.mps){if(mp.off)continue;const sl=T.slots[mp.si];if(!sl.arrow)continue;
    const C=window.C11Match;let ax=C.toX(sl.arrow.d,T.side),ay=C.toY(sl.arrow.w,T.side),px=mp.x,py=mp.y;if(this.flipped){ax=L-ax;ay=W-ay;px=L-px;py=W-py}this.ctx.strokeStyle='rgba(255,236,120,.7)';this.ctx.setLineDash([4,5]);line([[px,py],[ax,ay]]);this.ctx.setLineDash([])}}
  // ----- visão de cima -----
  drawTop(v){
    const ctx=this.ctx,cw=this.cw,ch=this.ch,vert=this.o.vertical;
    const pw=vert?W:L,ph=vert?L:W;const sc=Math.min((cw-16)/pw,(ch-16)/ph);const ox=(cw-pw*sc)/2,oy=(ch-ph*sc)/2;
    const T=(x,y)=>vert?[ox+y*sc,oy+(L-x)*sc]:[ox+x*sc,oy+y*sc];this.T2=T;this.sc=sc;
    ctx.fillStyle='#22562c';ctx.fillRect(0,0,cw,ch);
    for(let i=0;i<14;i++){if(i%2)continue;const [a,b]=T(i*L/14,0),[c,d]=T((i+1)*L/14,W);ctx.fillStyle='#276131';ctx.fillRect(Math.min(a,c),Math.min(b,d),Math.abs(c-a),Math.abs(d-b))}
    ctx.strokeStyle='rgba(235,245,230,.75)';ctx.lineWidth=1.4;
    const line=pts=>{ctx.beginPath();pts.forEach(([x,y],i)=>{const [a,b]=T(x,y);i?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.stroke()};
    line([[0,0],[L,0],[L,W],[0,W],[0,0]]);line([[L/2,0],[L/2,W]]);const [cx,cy]=T(L/2,W/2);ctx.beginPath();ctx.arc(cx,cy,9.15*sc,0,6.283);ctx.stroke();
    for(const s of [0,1]){const x=s?L:0,d=s?-1:1;line([[x,W/2-20.16],[x+d*16.5,W/2-20.16],[x+d*16.5,W/2+20.16],[x,W/2+20.16]]);line([[x,W/2-9.16],[x+d*5.5,W/2-9.16],[x+d*5.5,W/2+9.16],[x,W/2+9.16]]);
      ctx.lineWidth=3;line([[x,W/2-GW/2],[x,W/2+GW/2]]);ctx.lineWidth=1.4}
    if(v.fly&&v.fly.kind!=='shot'){ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(255,250,200,.6)';line([[v.fly.fx,v.fly.fy],[v.fly.ix??v.fly.tx,v.fly.iy??v.fly.ty]]);ctx.setLineDash([])}
    if(this.o.arrows){const m=this.m,Tm=m.T[this.o.userSide];for(const mp of Tm.mps){if(mp.off)continue;const sl=Tm.slots[mp.si];if(!sl.arrow)continue;const C=window.C11Match;let ax=C.toX(sl.arrow.d,Tm.side),ay=C.toY(sl.arrow.w,Tm.side),px=mp.x,py=mp.y;if(this.flipped){ax=L-ax;ay=W-ay;px=L-px;py=W-py}ctx.strokeStyle='rgba(255,236,120,.75)';ctx.setLineDash([4,4]);line([[px,py],[ax,ay]]);ctx.setLineDash([])}}
    const r=Math.max(9,1.7*sc);
    for(const p of v.pl){let inf=this.info.get(p.id);if(!inf){this.buildInfo();inf=this.info.get(p.id)}if(!inf)continue;const [x,y]=T(p.x,p.y);const kit=inf.gk?this.kits[inf.side].gk:this.kits[inf.side];
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(x+1.5,y+2,r,0,6.283);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.clip();fillShirt(ctx,x-r,y-r,r*2,r*2,kit);ctx.restore();
      ctx.lineWidth=v.own===p.id?3:1.5;ctx.strokeStyle=v.own===p.id?'#fff36b':'rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.stroke();
      ctx.font=`800 ${Math.round(r*1.05)}px "Barlow Condensed",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=2.5;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(inf.num,x,y+.5);ctx.fillStyle='#fff';ctx.fillText(inf.num,x,y+.5);ctx.textBaseline='alphabetic'}
    const [bx,by]=T(v.b.x,v.b.y);const br=Math.max(3,.55*sc)*(1+v.b.z*.08);ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.arc(bx+2,by+2+v.b.z*1.2,br,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,br,0,6.283);ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.stroke();
  }
}
return {Renderer,kits,drawPerson,fillShirt,shade};
})();
