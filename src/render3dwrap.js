// FUTBOL — ponte para o motor 3D: usa o 2D enquanto o 3D carrega (ou se o aparelho não suportar WebGL)
const C11Render3D=(()=>{
  const base=()=>{try{return new URL('3d/',location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'')).href}catch(e){return '3d/'}};
  let modP=null;const mod=()=>modP||(modP=import(base()+'render3d.js?v=32'));
  function supported(){try{const c=document.createElement('canvas');return !!(window.WebGL2RenderingContext&&c.getContext('webgl2'))}catch(e){return false}}
  class Hybrid{
    constructor(cv,m,opts){this.r2=new C11Render.Renderer(cv,m,opts);const d2=this.r2.draw.bind(this.r2);this.d2=d2;this.r2.draw=(v,dt)=>this.draw(v,dt);this.cv=cv;this.m=m;this.on=false;this.eng=null;this._a=1;
      const holder=cv.parentElement;this.holder=holder;
      mod().then(async M=>{let e=Hybrid.E;
        if(!e){e=Hybrid.E=new M.Engine(holder,{});e.cv.style.cssText='position:absolute;pointer-events:none;opacity:0;transition:opacity .6s';e.initP=e.init(base(),this.r2.kits,this.stadium())}
        else{holder.prepend(e.cv);e.cv.style.opacity=0}
        await e.initP;e.reset(this.r2.kits,this.stadium());this.eng=e;this.place();this.on=true;requestAnimationFrame(()=>{e.cv.style.opacity=1});this.draw()}).catch(err=>{console.warn('3D indisponível',err);this.fail=true;this.on=false});
      if(window.ResizeObserver){this.ro=new ResizeObserver(()=>this.place());this.ro.observe(cv)}}
    stadium(){const c=this.m.T[0].club;const st=typeof C11_STADIUMS!=='undefined'?C11_STADIUMS.of(c):{};return Object.assign({div:c&&c.div},st)}
    get zoom(){return this.r2.zoom}
    get o(){return this.r2.o}get kits(){return this.r2.kits}get info(){return this.r2.info}
    get alpha(){return this.r2.alpha}set alpha(a){this.r2.alpha=a}
    buildInfo(){this.r2.buildInfo()}setZoom(z){this.r2.setZoom(z)}
    setMode(md){this.r2.setMode(md);this.place()}
    resize(){this.r2.resize();this.place()}
    cine(f,m,done){if(!this.use3d()||!this.eng.cineStart)return false;
      const fl=m.flip,X=x=>fl?105-x:x,Y=y=>fl?68-y:y;const O=m.T[1-f.side];const r2=this.r2;
      const inf=id=>{if(!r2.info.get(id))r2.buildInfo();return r2.info.get(id)};
      const gk=m.gk(O);const pe=f.from&&f.from.p&&f.from.p.pe;
      const wall=f.sp==='fk'?m.active(O).filter(x=>x!==gk).sort((a,b)=>Math.hypot(a.x-f.fx,a.y-f.fy)-Math.hypot(b.x-f.fx,b.y-f.fy)).slice(0,4).map(x=>({id:x.id,inf:inf(x.id)})):[];
      this.eng.cineStart({taker:{id:f.from.id,inf:inf(f.from.id)},gk:gk?{id:gk.id,inf:inf(gk.id)}:null,wall,fx:X(f.fx),fy:Y(f.fy),tx:X(f.tx),ty:Y(f.ty),endZ:f.endZ,out:f.out,sp:f.sp,left:pe==='E'});
      let last=performance.now();const ctx=r2.ctx;
      const step=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;const r=this.eng.cineFrame(dt);
        ctx.setTransform(r2.dpr||1,0,0,r2.dpr||1,0,0);ctx.clearRect(0,0,r2.cw,r2.ch);
        ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(14,14,f.sp==='pen'?92:76,24);ctx.fillStyle='#fff';ctx.font='800 14px "Barlow Condensed",sans-serif';ctx.textAlign='left';ctx.fillText(f.sp==='pen'?'PÊNALTI':'FALTA',24,31);
        if(r.txt){const sz=Math.min(r2.cw/7,72);ctx.font=`900 ${sz}px "Barlow Condensed",sans-serif`;ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(r.txt,r2.cw/2,r2.ch*.42);ctx.fillStyle=f.out==='goal'?'#fff36b':'#fff';ctx.fillText(r.txt,r2.cw/2,r2.ch*.42)}
        if(r.done){try{if(m.ball.fly===f)f.t=Math.max(f.t,f.dur-.001)}catch(e){}done();return}requestAnimationFrame(step)};
      requestAnimationFrame(step);return true}
    use3d(){return this.on&&this.eng&&this.r2.o.mode!=='top'}
    place(){const e=this.eng;if(!e)return;const c=this.cv;e.cv.style.left=c.offsetLeft+'px';e.cv.style.top=c.offsetTop+'px';e.cv.style.width=c.offsetWidth+'px';e.cv.style.height=c.offsetHeight+'px';e.cv.style.display=this.use3d()?'block':'none';c.style.position='relative';c.style.zIndex=1;
      if(c.offsetWidth>0)e.resize(c.offsetWidth,c.offsetHeight,window.devicePixelRatio||1)}
    draw(v,dt=1/60){
      if(this.r2.o.mode!=='top'&&!this.on&&!this.fail){// 3D ainda carregando: tela de carregamento em vez do 2D
        const r2=this.r2,c=r2.ctx;c.setTransform(r2.dpr||1,0,0,r2.dpr||1,0,0);const g=c.createLinearGradient(0,0,0,r2.ch);g.addColorStop(0,'#0b1424');g.addColorStop(1,'#14361b');c.fillStyle=g;c.fillRect(0,0,r2.cw,r2.ch);
        const tt=performance.now()/1000;c.fillStyle='#fff';c.textAlign='center';c.font='700 15px "Barlow Condensed",sans-serif';c.globalAlpha=.85;c.fillText('PREPARANDO O ESTÁDIO…',r2.cw/2,r2.ch/2+34);c.globalAlpha=1;
        c.strokeStyle='#ffffff30';c.lineWidth=4;c.beginPath();c.arc(r2.cw/2,r2.ch/2,16,0,7);c.stroke();c.strokeStyle='#fff';c.beginPath();c.arc(r2.cw/2,r2.ch/2,16,tt*5,tt*5+1.6);c.stroke();return}
      if(!this.use3d()){if(this.eng)this.eng.cv.style.display='none';return this.d2(v,dt)}
      if(this.eng.cv.style.display==='none')this.place();
      const r2=this.r2;v=v||r2.view();if(v.flip)v=r2.flipView(v);
      for(const p of v.pl)if(!r2.info.get(p.id))r2.buildInfo();
      {// clima e sinalizadores do jogo: sorteados pelo confronto (o mesmo para os dois técnicos no online)
        const M=window.__MVst&&window.__MVst.m;if(M&&this.wxFor!==M){this.wxFor=M;let h=0;const key=M.T[0].name+'|'+M.T[1].name+'|'+((typeof C11!=='undefined'&&C11.G)?C11.G.season+'-'+(C11.G.round||C11.G.date||0):'');for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;
          const w=h%20<3?'chuva':h%20<9?'tarde':'noite';const lab=(window.__MVst.um&&window.__MVst.um.label)||'';const big=/final|semi|taça|clássico/i.test(lab)||h%5===0;this.wxKind=w;this.flKind=big}
        if(this.eng.setWeather)this.eng.setWeather(this.wxKind||'noite');if(this.eng.setFlares&&this.flKind!==this.flSet){this.flSet=this.flKind;this.eng.setFlares(!!this.flKind)}
        if(this.eng.setQuality&&this.gqSet!==((typeof U!=='undefined'&&U.PREF.gq)||'auto')){this.gqSet=(typeof U!=='undefined'&&U.PREF.gq)||'auto';this.eng.setQuality(this.gqSet)}}
      const ik=this.introT?(performance.now()-this.introT)/6000:1;if(ik>=1)this.introT=0;const t0=performance.now();this.eng.draw(v,Math.min(.1,dt||1/60),r2.info,r2.zoom||1,ik<1?ik:null);if(this.eng.quality)this.eng.quality(dt*1000||16);
      // nomes por cima (canvas 2D transparente)
      const ctx=r2.ctx;ctx.setTransform(r2.dpr||1,0,0,r2.dpr||1,0,0);ctx.clearRect(0,0,r2.cw,r2.ch);
      if(r2.o.labels!==false&&!this.introT){for(const p of v.pl){const inf=r2.info.get(p.id);if(!inf)continue;const own=v.own===p.id;if(!own&&inf.side!==r2.o.userSide)continue;
        const [sx,sy,ok]=(this.eng.screenOf&&this.eng.screenOf(p.id,2.25))||this.eng.project(p.x,p.y,2.25);if(!ok||sx<-30||sx>r2.cw+30)continue;
        const nm=own?`${inf.num} ${inf.name}`:String(inf.num);ctx.font=`700 ${own?13:10}px "Barlow Condensed",sans-serif`;const tw=ctx.measureText(nm).width;
        ctx.fillStyle=own?'rgba(10,12,10,.8)':'rgba(10,12,10,.45)';ctx.fillRect(sx-tw/2-4,sy-15,tw+8,own?16:13);ctx.fillStyle=own?'#fff36b':'#fff';ctx.textAlign='center';ctx.fillText(nm,sx,sy-(own?3:4));
        // (15) cansaço: barrinha sob o número dos seus jogadores quando o fôlego passa de 40% gasto
        if(inf.side===r2.o.userSide&&p.st!=null&&p.st<60){const w=Math.max(tw+8,18),k=p.st/100;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(sx-w/2,sy+1,w,3);ctx.fillStyle=k<.35?'#ef4444':k<.5?'#f59e0b':'#facc15';ctx.fillRect(sx-w/2,sy+1,w*k,3)}}}
      // (12) minimapa: campo inteiro no canto, com os dois times e a bola
      if(!this.introT&&!(typeof U!=='undefined'&&U.PREF.mini===false)){const mw=Math.min(132,r2.cw*.3),mh=mw*68/105,x0=r2.cw-mw-8,y0=r2.ch-mh-8;
        ctx.fillStyle='rgba(8,30,14,.72)';ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.fillRect(x0,y0,mw,mh);ctx.strokeRect(x0+.5,y0+.5,mw-1,mh-1);
        ctx.beginPath();ctx.moveTo(x0+mw/2,y0);ctx.lineTo(x0+mw/2,y0+mh);ctx.stroke();ctx.beginPath();ctx.arc(x0+mw/2,y0+mh/2,mh*.13,0,7);ctx.stroke();
        ctx.strokeRect(x0+.5,y0+mh*.2,mw*.157,mh*.6);ctx.strokeRect(x0+mw-mw*.157-.5,y0+mh*.2,mw*.157,mh*.6);
        const px=X=>x0+X/105*mw,py=Y=>y0+Y/68*mh;
        for(const p of v.pl){const inf=r2.info.get(p.id);if(!inf)continue;ctx.fillStyle=inf.side===0?(this.mmC0||'#e11d48'):(this.mmC1||'#f8fafc');if(!this.mmC0&&window.__MVst&&__MVst.m){try{this.mmC0=__MVst.m.T[0].club.kit[0];this.mmC1=__MVst.m.T[1].club.kit[0];if(this.mmC0===this.mmC1)this.mmC1='#f8fafc'}catch(e){}}
          ctx.beginPath();ctx.arc(px(p.x),py(p.y),v.own===p.id?3.4:2.4,0,7);ctx.fill();if(inf.side===r2.o.userSide){ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke()}}
        if(v.b){ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.beginPath();ctx.arc(px(v.b.x),py(v.b.y),2.6,0,7);ctx.fill();ctx.stroke()}}
      // efeitos de lance: DRIBLE! / DESARME! subindo sobre o jogador
      if(!this.introT){const nowp=performance.now()/1000;this.pops=this.pops||[];this.popSeen=this.popSeen||new Set();
        for(const p of v.pl){if(!p.fx)continue;const key=p.id+':'+p.fx.id+p.fx.k;if(this.popSeen.has(key))continue;this.popSeen.add(key);if(this.popSeen.size>300)this.popSeen=new Set([key]);
          if(this.pops.some(q=>nowp-q.t0<.9))continue;this.pops.push({id:p.id,k:p.fx.k,t0:nowp,x:p.x,y:p.y})}
        this.pops=this.pops.filter(q=>nowp-q.t0<1.2);
        for(const q of this.pops){const a=(nowp-q.t0)/1.2;const pos=(this.eng.screenOf&&this.eng.screenOf(q.id,2.7))||this.eng.project(q.x,q.y,2.7);if(!pos||!pos[2])continue;
          const txt=q.k==='drible'?'DRIBLE!':'DESARME!';ctx.save();ctx.globalAlpha=Math.max(0,a<.12?a/.12:1-Math.max(0,(a-.62)/.38));const sc=1+.35*Math.max(0,1-a*6);
          ctx.translate(pos[0],pos[1]-20-a*26);ctx.rotate(-.06);ctx.scale(sc,sc);ctx.font='italic 900 19px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.lineJoin='round';
          ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(txt,0,0);ctx.fillStyle=q.k==='drible'?'#ffd60a':'#4ade80';ctx.fillText(txt,0,0);ctx.restore()}}
    }
  }
  // pré-carrega o motor e os jogadores assim que o jogo abre (a partida já começa em 3D)
  function preload(){if(!supported())return;try{mod().then(M=>M.loadAssets&&M.loadAssets(base())).catch(()=>{})}catch(e){}}
  return {Hybrid,supported,preload};
})();
