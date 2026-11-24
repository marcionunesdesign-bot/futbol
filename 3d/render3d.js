// FUTBOL — motor visual 3D da partida (Three.js)
import * as T from './three.module.min.js';
import {loadAssets,makePlayer} from './players3d.js?v=35';
export {loadAssets};

const L=105,W=68,GW=7.32,GH=2.44;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wx=x=>x-L/2,wz=y=>y-W/2;

function canvasTex(w,h,draw,o={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(o.rep){t.wrapS=t.wrapT=T.RepeatWrapping}t.anisotropy=o.aniso||4;return t}

// ---------- gramado com faixas de corte e linhas ----------
function pitchTex(maxAniso,st){const G=st.grass||['#2f7835','#38883d'],mow=st.mow||'stripes',wearK=st.wear??.15;
  const M=7,PX=18;const w=(L+2*M)*PX,h=(W+2*M)*PX;
  const t=canvasTex(w,h,(g)=>{
    g.fillStyle=G[0];g.fillRect(0,0,w,h);
    const n=mow==='wide'?12:st.syn?24:20;for(let i=0;i<n;i++){g.fillStyle=i%2?G[0]:G[1];g.fillRect((M+i*L/n)*PX,0,L/n*PX+1,h)}
    if(mow==='checker'){const m=10;for(let j=0;j<m;j++){g.fillStyle=`rgba(${j%2?'0,0,0,.07':'255,255,255,.05'})`;g.fillRect(0,(M+j*W/m)*PX,w,W/m*PX+1)}}
    // faixas fora do campo
    g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,0,M*PX,h);g.fillRect(w-M*PX,0,M*PX,h);
    // ruído do gramado
    const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const r=(Math.random()-.5)*(st.syn?12:22);d[i]+=r*.5;d[i+1]+=r;d[i+2]+=r*.4}g.putImageData(im,0,0);
    // desgaste suave na pequena área e no meio
    const wear=(x,y,r,a)=>{const gr=g.createRadialGradient(x*PX,y*PX,0,x*PX,y*PX,r*PX);gr.addColorStop(0,`rgba(120,110,60,${a})`);gr.addColorStop(1,'rgba(120,110,60,0)');g.fillStyle=gr;g.fillRect((x-r)*PX,(y-r)*PX,2*r*PX,2*r*PX)};
    if(wearK>0){const k=wearK/.15;wear(M+3,M+W/2,5,.22*k);wear(M+L-3,M+W/2,5,.22*k);wear(M+L/2,M+W/2,6,.1*k);wear(M+11,M+W/2,2,.15*k);wear(M+L-11,M+W/2,2,.15*k);
      if(wearK>.25){for(let q=0;q<14;q++)wear(M+Math.random()*L,M+Math.random()*W,2+Math.random()*4,.12)}}
    g.strokeStyle='rgba(246,250,242,.93)';g.lineWidth=.13*PX;g.lineJoin='round';
    const X=x=>(M+x)*PX,Y=y=>(M+y)*PX;
    g.strokeRect(X(0),Y(0),L*PX,W*PX);g.beginPath();g.moveTo(X(L/2),Y(0));g.lineTo(X(L/2),Y(W));g.stroke();
    g.beginPath();g.arc(X(L/2),Y(W/2),9.15*PX,0,7);g.stroke();
    for(const s of [0,1]){const x0=s?L:0,d=s?-1:1;
      g.strokeRect(Math.min(X(x0),X(x0+d*16.5)),Y(W/2-20.16),16.5*PX,40.32*PX);
      g.strokeRect(Math.min(X(x0),X(x0+d*5.5)),Y(W/2-9.16),5.5*PX,18.32*PX);
      const a=Math.acos(5.5/9.15);g.beginPath();g.arc(X(x0+d*11),Y(W/2),9.15*PX,s?Math.PI-a:-a,s?Math.PI+a:a);g.stroke();
      g.fillStyle='#f4f8f0';g.beginPath();g.arc(X(x0+d*11),Y(W/2),.2*PX,0,7);g.fill();
      for(const cy of [0,W]){g.beginPath();g.arc(X(x0),Y(cy),1*PX,cy?(s?Math.PI:1.5*Math.PI):(s?Math.PI/2:0),cy?(s?1.5*Math.PI:2*Math.PI):(s?Math.PI:Math.PI/2));g.stroke()}}
    g.fillStyle='#f4f8f0';g.beginPath();g.arc(X(L/2),Y(W/2),.25*PX,0,7);g.fill();
  },{aniso:maxAniso});
  return {t,w:L+2*M,h:W+2*M};
}

// ---------- torcida (textura de arquibancada com pessoas) ----------
function crowdTex(cols,seats=['#22262c'],dens=.9){
  return canvasTex(2048,1024,(g,w,h)=>{
    g.fillStyle='#1a1d22';g.fillRect(0,0,w,h);
    const rows=16,rh=h/rows;
    for(let r=0;r<rows;r++){
      const sc=seats[(r>>1)%seats.length];g.fillStyle=sc;g.fillRect(0,r*rh,w,rh);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,r*rh,w,rh*.35);
      g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,r*rh+rh-2,w,2);
      let x=Math.random()*6;while(x<w){const cw=(9+Math.random()*5)*2;if(Math.random()>dens){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+2,r*rh+rh*.45,cw-4,rh*.35)}
        if(Math.random()<dens*(.85+.3*Math.sin(x*.01+r))){const c=Math.random()<.62?cols[Math.random()*cols.length|0]:['#e9e4da','#2a2f37','#8a8f96','#3d5a80','#b23a3a','#e0b04a'][Math.random()*6|0];
          const bx=x+cw/2,by=r*rh+rh*.95,hh=rh*(.62+Math.random()*.2);
          g.fillStyle=c;g.beginPath();g.ellipse(bx,by-hh*.28,cw*.42,hh*.36,0,0,7);g.fill();
          g.fillStyle=['#f1c7a5','#d9a57c','#b77b52','#8a5636','#5e3a22'][Math.random()*5|0];g.beginPath();g.arc(bx,by-hh*.78,cw*.24,0,7);g.fill();
          if(Math.random()<.12){g.strokeStyle=g.fillStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(bx-cw*.3,by-hh*.5);g.lineTo(bx-cw*.45,by-hh*1.05);g.moveTo(bx+cw*.3,by-hh*.5);g.lineTo(bx+cw*.45,by-hh*1.05);g.stroke()}
          if(Math.random()<.02){g.fillStyle=cols[0];g.fillRect(bx-cw*1.5,by-hh*1.25,cw*3,hh*.45)}
        }x+=cw}}
  },{rep:true,aniso:16});
}

function adTex(){
  const items=['FUTBOL','CAMPEONATO NACIONAL','TAÇA NACIONAL','FUTBOL MANAGER','ONDA SITES','FUTEBOL É PAIXÃO'];
  const cols=[['#0b5d2a','#ffffff'],['#101828','#f5c518'],['#b0121b','#ffffff'],['#f5f5f5','#0b3d91'],['#0e7c86','#ffffff'],['#1a1a1a','#3ee07a']];
  const t=canvasTex(2048,64,(g,w,h)=>{let x=0,i=0;while(x<w){const [bg,fg]=cols[i%cols.length];const s=items[i%items.length];g.font='800 40px "Barlow Condensed",Arial Narrow,sans-serif';const tw=g.measureText(s).width+80;
      g.fillStyle=bg;g.fillRect(x,0,tw,h);g.fillStyle=fg;g.textBaseline='middle';g.fillText(s,x+40,h/2+2);x+=tw;i++}},{rep:true});
  t.wrapT=T.ClampToEdgeWrapping;return t;
}
function netTex(){return canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;const n=8;for(let i=0;i<=n;i++){const p=i*w/n;g.beginPath();g.moveTo(p,0);g.lineTo(p,h);g.moveTo(0,p);g.lineTo(w,p);g.stroke()}},{rep:true})}
// bola clássica (gomos pretos e brancos do icosaedro truncado), desenhada direto no shader: nítida em qualquer zoom
function ballMat(){const P=(1+Math.sqrt(5))/2,V=[];
  for(const a of [-1,1])for(const b of [-1,1]){V.push([0,a,b*P],[a,b*P,0],[b*P,0,a])}
  const D=[];for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1])D.push([a,b,c]);for(const a of [-1,1])for(const b of [-1,1]){D.push([0,a/P,b*P],[a/P,b*P,0],[b*P,0,a/P])}
  const pts=V.concat(D).map(v=>{const l=Math.hypot(...v);return new T.Vector3(v[0]/l,v[1]/l,v[2]/l)});
  const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:.32,metalness:0});
  m.onBeforeCompile=sh=>{sh.uniforms.bp={value:pts};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBN=normalize(position);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vBN;uniform vec3 bp[32];')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`float d1=-2.,d2=-2.;int k1=0;for(int i=0;i<32;i++){float d=dot(vBN,bp[i]);if(d>d1){d2=d1;d1=d;k1=i;}else if(d>d2){d2=d;}}
        vec3 col=k1<12?vec3(.06,.065,.07):vec3(.97,.97,.95);float seam=smoothstep(.0,.018,d1-d2);col=mix(vec3(.25,.26,.27),col,seam);vec4 diffuseColor=vec4(col,opacity);`)};
  m.customProgramCacheKey=()=>'ball';return m}
function ballTex(){return canvasTex(512,256,(g,w,h)=>{g.fillStyle='#f7f7f5';g.fillRect(0,0,w,h);g.fillStyle='#16181b';
  const pts=[[.1,.5],[.3,.18],[.3,.82],[.5,.5],[.7,.18],[.7,.82],[.9,.5],[0,.08],[.5,.04],[1,.08],[0,.92],[.5,.96],[1,.92]];
  for(const [x,y] of pts){g.beginPath();for(let k=0;k<5;k++){const a=k/5*6.283-1.57;const r=h*.11*(1/(Math.cos((y-.5)*Math.PI)+.15));g.lineTo(x*w+Math.cos(a)*r*.55,y*h+Math.sin(a)*h*.11)}g.closePath();g.fill()}})}

export class Engine{
  constructor(holder,opts){
    this.o=opts;const cv=document.createElement('canvas');cv.className='gl3d';this.cv=cv;holder.prepend(cv);
    const lowEnd=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;this.low=lowEnd;
    const r=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});this.r=r;
    r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.08;
    r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    this.maxA=r.capabilities.getMaxAnisotropy();
    const s=new T.Scene();this.s=s;s.background=new T.Color('#0a1220');s.fog=new T.Fog('#0b1424',120,320);
    this.cam=new T.PerspectiveCamera(30,1.6,.5,600);
    this.pl=new Map();this.kick=new Map();this.head=new Map();this.time=0;
  }
  async init(base,kits,st){this.st0=st;
    await loadAssets(base);this.kits=kits;const s=this.s;
    // céu noturno com gradiente
    const sky=new T.Mesh(new T.SphereGeometry(400,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{},vertexShader:'varying vec3 vp;void main(){vp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vp;void main(){float h=normalize(vp).y;vec3 c=mix(vec3(.05,.08,.14),vec3(.01,.02,.05),clamp(h*2.,0.,1.));c+=vec3(.10,.09,.07)*pow(1.-abs(h),8.);gl_FragColor=vec4(c,1.);}'}));s.add(sky);
    // luzes de estádio
    s.add(new T.HemisphereLight('#d7e6ff','#284a24',.85));
    const key=new T.DirectionalLight('#fff4e2',2.4);key.position.set(-30,60,40);key.castShadow=true;key.shadow.mapSize.set(this.low?1024:2048,this.low?1024:2048);const sc=key.shadow.camera;sc.left=-40;sc.right=40;sc.top=30;sc.bottom=-30;sc.near=10;sc.far=160;key.shadow.bias=-.0006;key.shadow.normalBias=.02;s.add(key);s.add(key.target);this.key=key;
    const fill=new T.DirectionalLight('#bcd3ff',1.0);fill.position.set(40,45,-50);s.add(fill);
    const fill2=new T.DirectionalLight('#ffe9cc',.5);fill2.position.set(0,30,80);s.add(fill2);
    const rim=new T.DirectionalLight('#cfe0ff',1.1);rim.position.set(0,25,-90);s.add(rim);
    this.lampM=new T.MeshBasicMaterial({color:'#fffbe8'});
    this.glow=canvasTex(128,128,(g2,w,h)=>{const gr=g2.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,230,1)');gr.addColorStop(.25,'rgba(255,245,210,.55)');gr.addColorStop(1,'rgba(255,240,200,0)');g2.fillStyle=gr;g2.fillRect(0,0,w,h)});
    this.buildStadium(this.st0||{},kits);
    // gols
    const postM=new T.MeshStandardMaterial({color:'#f6f6f6',roughness:.35});const nt=netTex();
    for(const side of [0,1]){const grp=new T.Group();const d=side?1:-1;
      const cyl=(len,r=.06)=>new T.Mesh(new T.CylinderGeometry(r,r,len,10),postM);
      const p1=cyl(GH);p1.position.set(0,GH/2,-GW/2);const p2=cyl(GH);p2.position.set(0,GH/2,GW/2);const bar=cyl(GW+.12);bar.rotation.x=Math.PI/2;bar.position.set(0,GH,0);
      [p1,p2,bar].forEach(m=>{m.castShadow=true;grp.add(m)});
      const nm=(w,h)=>{const t=nt.clone();t.repeat.set(w/.9,h/.9);t.needsUpdate=true;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,transparent:true,side:T.DoubleSide,depthWrite:false,opacity:.8}))};
      const D=2.0,back=nm(GW,GH*.9);back.rotation.y=Math.PI/2;back.position.set(D*d,GH*.45,0);back.userData.x0=D*d;grp.add(back);(this.nets=this.nets||[])[side]=back;
      const top=nm(D,GW);top.rotation.x=Math.PI/2;top.rotation.z=Math.PI/2;top.position.set(D*d/2,GH*.95,0);grp.add(top);
      for(const zs of [-1,1]){const sd=new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(0,0),new T.Vector2(D*d,0),new T.Vector2(D*d,GH*.9),new T.Vector2(0,GH)])),back.material.clone());sd.material.map=nt.clone();sd.material.map.repeat.set(D/.9,GH/.9);sd.material.map.needsUpdate=true;sd.position.set(0,0,zs*GW/2);grp.add(sd)}
      grp.position.set(side?L/2:-L/2,0,0);s.add(grp)}
    // bola
    this.ball=new T.Mesh(new T.SphereGeometry(.11,40,28),ballMat());this.ball.castShadow=true;this.ball.scale.setScalar(1.55);s.add(this.ball);
    const bsh=new T.Mesh(new T.CircleGeometry(.2,16),new T.MeshBasicMaterial({color:'#000',transparent:true,opacity:.35,depthWrite:false}));bsh.rotation.x=-Math.PI/2;bsh.position.y=.015;s.add(bsh);this.bsh=bsh;
    this.camT=new T.Vector3(0,0,0);this.ready=true;
  }
  reset(kits,st){if(this.kits===kits)return;if(this.refs){for(const P of this.refs)this.s.remove(P.root);if(this.benchG)this.s.remove(this.benchG);this.refs=null;this.bench=null}for(const [,P] of this.pl)this.s.remove(P.root);this.pl.clear();this.kick.clear();this._bp=null;this.kits=kits;if(st)this.buildStadium(st,kits)}
  buildStadium(st,kits){
    if(this.stad){this.s.remove(this.stad);this.stad.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})}
    const G=new T.Group();this.stad=G;this.s.add(G);this.stId=st.id;this.ads=[];this.cts=[];
    const cap=st.cap||15000,type=st.t||'classic',big=cap>=35000;
    // gramado
    const pt=pitchTex(this.maxA,st);const g=new T.Mesh(new T.PlaneGeometry(pt.w,pt.h),new T.MeshStandardMaterial({map:pt.t,roughness:st.syn?.75:.93,metalness:0}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;G.add(g);
    const outer=new T.Mesh(new T.PlaneGeometry(320,260),new T.MeshStandardMaterial({color:type==='small'?'#2c4a26':'#20262b',roughness:1}));outer.rotation.x=-Math.PI/2;outer.position.y=-.03;outer.receiveShadow=true;G.add(outer);
    // pista de atletismo
    let off={arena:6.5,classic:8,small:7.5,bowl:11}[type]||8;
    if(st.track){off+=9;const tr=new T.Mesh(new T.RingGeometry(1,1.2,64),new T.MeshStandardMaterial({color:'#a4472f',roughness:.9}));
      const shp=(a,b)=>{const sh=new T.Shape();for(let i=0;i<=64;i++){const t=i/64*6.283;const x=Math.cos(t),z=Math.sin(t);const px=Math.sign(x)*Math.pow(Math.abs(x),.5)*a,pz=Math.sign(z)*Math.pow(Math.abs(z),.5)*b;i?sh.lineTo(px,pz):sh.moveTo(px,pz)}return sh};
      const o=shp(L/2+off-1,W/2+off-1),h=shp(L/2+7,W/2+5);o.holes.push(new T.Path(h.getPoints()));tr.geometry.dispose();tr.geometry=new T.ShapeGeometry(o);tr.rotation.x=Math.PI/2;tr.position.y=.01;tr.receiveShadow=true;G.add(tr)}
    // placas de publicidade
    const at=adTex();const blk=new T.MeshStandardMaterial({color:'#111'});
    const mkB=(len,x,z,ry)=>{const a=at.clone();a.repeat.set(len/40,1);a.needsUpdate=true;this.ads.push(a);const m=new T.Mesh(new T.BoxGeometry(len,.95,.2),[blk,blk,blk,blk,new T.MeshBasicMaterial({map:a,toneMapped:false}),blk]);m.position.set(x,.475,z);m.rotation.y=ry;G.add(m)};
    mkB(L+10,0,-W/2-4.5,0);mkB(W+4,-L/2-5.5,0,Math.PI/2);mkB(W+4,L/2+5.5,0,-Math.PI/2);
    // torcida: casa nas cores do mandante, visitante num canto
    const div={A:.9,B:.74,C:.6,D:.5}[st.div]||.7;const dens=Math.min(.95,div*(cap>50000?.85:cap<8000?1.15:1));
    const home=[kits[0].c1,kits[0].c2,kits[0].c1],away=[kits[1].c1,kits[1].c2];
    const seats=(st.seats||['#555']).map(c=>new T.Color(c).multiplyScalar(.55).getStyle());
    const texH=crowdTex(home.concat(home,[kits[1].c1]),seats,dens),texA=crowdTex(away,seats,Math.min(.9,dens*.9));
    // perfil da arquibancada pela capacidade
    const depth=Math.min(34,7+cap/2600),hgt=depth*.56;
    const seatM=(tex,rep,rows)=>{const t=tex.clone();t.repeat.set(rep,rows);t.needsUpdate=true;this.cts.push(t);return new T.MeshStandardMaterial({map:t,roughness:.95,side:T.DoubleSide})};
    const concrete=new T.MeshStandardMaterial({color:'#4a5058',roughness:.95}),dark=new T.MeshStandardMaterial({color:'#1a1e23',roughness:.9});
    const roofM=new T.MeshStandardMaterial({color:st.arches?'#e9e9e9':big?'#dcdfe2':'#2a3036',roughness:.7,side:T.DoubleSide,metalness:.1});
    // faixa de arquibancada ao longo de um caminho (pontos na borda interna + normal para fora)
    const nearG=new T.Group();G.add(nearG);this.nearG=nearG;nearG.visible=false;let tgt=G;
    const strip=(pts,d0,dep,h0,h1,tex,roof)=>{
      const n=pts.length,pos=[],uv=[],idx=[];let acc=0;
      for(let i=0;i<n;i++){const [x,z,nx,nz]=pts[i];if(i){acc+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1])}
        pos.push(x+nx*d0,h0,z+nz*d0,x+nx*(d0+dep),h1,z+nz*(d0+dep));uv.push(acc/26,0,acc/26,1);
        if(i<n-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
      const rows=Math.max(2,Math.round((h1-h0)/4.5));const t=tex.clone();t.repeat.set(1,rows);t.needsUpdate=true;this.cts.push(t);
      const m=new T.Mesh(geo,new T.MeshStandardMaterial({map:t,roughness:.95,side:T.DoubleSide}));m.receiveShadow=true;tgt.add(m);
      // muro de trás e frente
      const wall=(dd,y0,y1,mat)=>{const p2=[],i2=[];for(let i=0;i<n;i++){const [x,z,nx,nz]=pts[i];p2.push(x+nx*dd,y0,z+nz*dd,x+nx*dd,y1,z+nz*dd);if(i<n-1){const a=i*2;i2.push(a,a+1,a+2,a+1,a+3,a+2)}}
        const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(p2,3));g2.setIndex(i2);g2.computeVertexNormals();const mm=new T.Mesh(g2,mat);mm.material.side=T.DoubleSide;tgt.add(mm)};
      wall(d0,0,h0,concrete);wall(d0+dep,0,h1+(roof?6:1.5),dark);
      if(roof){const cover=roof===true?.95:roof;const p3=[],i3=[];for(let i=0;i<n;i++){const [x,z,nx,nz]=pts[i];const din=d0+dep-dep*cover-1.5;p3.push(x+nx*(d0+dep+.5),h1+6,z+nz*(d0+dep+.5),x+nx*din,h1+4.6,z+nz*din);if(i<n-1){const a=i*2;i3.push(a,a+1,a+2,a+1,a+3,a+2)}}
        const g3=new T.BufferGeometry();g3.setAttribute('position',new T.Float32BufferAttribute(p3,3));g3.setIndex(i3);g3.computeVertexNormals();const rm=new T.Mesh(g3,roofM);rm.castShadow=false;tgt.add(rm);
        // refletores na borda da cobertura
        if(big||type==='arena'){const lp=[];for(let i=0;i<n;i+=Math.max(1,Math.round(n/14))){const [x,z,nx,nz]=pts[i];const din=d0+dep-dep*cover-1.2;lp.push(new T.Vector3(x+nx*din,h1+4.4,z+nz*din))}
          for(const v of lp){const b=new T.Mesh(new T.BoxGeometry(2.4,.35,.35),this.lampM);b.position.copy(v);b.lookAt(0,0,0);tgt.add(b)}}}
    };
    const line=(x0,z0,x1,z1,nx,nz,k=24)=>{const p=[];for(let i=0;i<=k;i++){const t=i/k;p.push([x0+(x1-x0)*t,z0+(z1-z0)*t,nx,nz])}return p};
    const ring=(a,b,ex,skip)=>{const p=[];const N=4000;let lx=null,lz=null;for(let i=0;i<=N;i++){const th=i/N*6.283;if(skip(th)){lx=null;continue}const c=Math.cos(th),s2=Math.sin(th);const x=Math.sign(c)*Math.pow(Math.abs(c),2/ex)*a,z=Math.sign(s2)*Math.pow(Math.abs(s2),2/ex)*b;
      const nx=Math.sign(c)*Math.pow(Math.abs(c),2-2/ex)/a,nz=Math.sign(s2)*Math.pow(Math.abs(s2),2-2/ex)/b;const l=Math.hypot(nx,nz)||1;if(lx!==null&&Math.hypot(x-lx,z-lz)<2.2&&i<N)continue;lx=x;lz=z;p.push([x,z,nx/l,nz/l])}return p};
    const roofFull=st.roof==='full',roofPart=st.roof==='partial';
    if(type==='arena'||type==='bowl'){
      const ex=type==='arena'?7:2.8,a=L/2+off-(type==='bowl'?2:0),b=W/2+off;
      // lado da câmera fica sem arquibancada (é onde está a TV); ferradura abre um dos fundos
      const near=th=>th>.42&&th<Math.PI-.42,end=th=>st.open&&th>Math.PI-.5&&th<Math.PI+.5;
      // separa em trechos contínuos
      const pts=ring(a,b,ex,th=>near(th)||end(th));const segs=[];let cur=[];for(const q of pts){if(cur.length&&Math.hypot(q[0]-cur[cur.length-1][0],q[1]-cur[cur.length-1][1])>20){segs.push(cur);cur=[]}cur.push(q)}if(cur.length)segs.push(cur);
      // junta o fim com o começo (o anel dá a volta pelo ângulo 0)
      if(segs.length>1){const f=segs[segs.length-1],s0=segs[0];if(Math.hypot(f[f.length-1][0]-s0[0][0],f[f.length-1][1]-s0[0][1])<20){segs[0]=f.concat(s0);segs.pop()}}
      {const np=ring(a,b,ex,th=>!(near(th)));const ns=np.filter(q=>q[1]>0);if(ns.length>3){tgt=nearG;strip(ns,0,depth,1.2,1.2+hgt,texH,roofFull?.9:false);if(st.tiers>1)strip(ns,depth*.72,depth*.75,hgt+4.5,hgt+4.5+hgt*.7,texH,roofFull||roofPart?.95:false);tgt=G}}
      for(const sg of segs){strip(sg,0,depth,1.2,1.2+hgt,texH,roofFull?.9:false);
        if(st.tiers>1)strip(sg,depth*.72,depth*.75,hgt+4.5,hgt+4.5+hgt*.7,texH,roofFull||roofPart?.95:false)}
      if(roofPart&&!roofFull){strip(line(-L/2-4,-b,L/2+4,-b,0,-1),0,.01,0,0,texH,false)}
    }else{
      // retas: lateral do fundo (principal) + atrás dos gols
      const mainLen=type==='small'?L*.62:L+8;const mainD=type==='small'?depth*.8:depth;
      const far=line(-mainLen/2,-W/2-off,mainLen/2,-W/2-off,0,-1);
      strip(far,0,mainD,1,1+mainD*.56,texH,st.roof!=='none'?.85:false);
      if(type==='small'){// resto da lateral: degraus baixos, descobertos
        strip(line(-L/2-4,-W/2-off,-mainLen/2-1,-W/2-off,0,-1,8),0,6,.8,3.6,texH,false);strip(line(mainLen/2+1,-W/2-off,L/2+4,-W/2-off,0,-1,8),0,6,.8,3.6,texH,false)}
      if(st.tiers>1)strip(far,mainD*.7,mainD*.7,mainD*.56+4,mainD*.56+4+mainD*.45,texH,.95);
      tgt=nearG;if(type==='small')strip(line(L/2+4,W/2+off,-L/2-4,W/2+off,0,1,16),0,6,.8,3.6,texH,false);else strip(line(L/2+4,W/2+off,-L/2-4,W/2+off,0,1,20),0,depth*.85,1,1+depth*.47,texH,st.roof==='partial'?.6:false);tgt=G;
      const ends=st.ends||'full';
      if(ends!=='none'){const ed=ends==='low'?6:depth*.85,eh=ends==='low'?3.4:ed*.5;
        strip(line(-L/2-off,-W/2+1,-L/2-off,W/2+3,-1,0,16),0,ed,1,1+eh,texH,st.roof==='partial'&&ends==='full'?.7:false);
        strip(line(L/2+off,W/2+3,L/2+off,-W/2+1,1,0,16),0,ed,1,1+eh,texA,false)}
      // árvores e prédios ao redor (estádios de cidade pequena)
      const treeM=new T.MeshStandardMaterial({color:'#1f3a22',roughness:1}),trunk=new T.MeshStandardMaterial({color:'#3b2a1e'});
      const rnd=(i)=>((Math.sin(i*12.9898+cap)*43758.5453)%1+1)%1;
      for(let i=0;i<60;i++){const ang=rnd(i)*6.283;const R=95+rnd(i+99)*40;const x=Math.cos(ang)*R*1.2,z=Math.sin(ang)*R*.9-10;if(z>W/2+20&&Math.abs(x)<60)continue;
        const hT=6+rnd(i+7)*9;const tr=new T.Mesh(new T.ConeGeometry(hT*.35,hT,7),treeM);tr.position.set(x,hT/2+2,z);G.add(tr)}
      const bldM=[new T.MeshStandardMaterial({color:'#3b4148'}),new T.MeshStandardMaterial({color:'#4b4f55'}),new T.MeshStandardMaterial({color:'#2f353b'})];
      for(let i=0;i<26;i++){const ang=Math.PI+rnd(i+300)*Math.PI;const R=120+rnd(i+400)*50;const x=Math.cos(ang)*R*1.1,z=Math.sin(ang)*R*.8-20;const hB=8+rnd(i+500)*26;
        const bm=new T.Mesh(new T.BoxGeometry(10+rnd(i)*12,hB,10+rnd(i+1)*10),bldM[i%3]);bm.position.set(x,hB/2,z);G.add(bm)}
    }
    // arcos (Engenhão)
    if(false&&st.arches){const am=new T.MeshStandardMaterial({color:'#f2c230',roughness:.5});for(const sx of [-1,1]){const c=new T.Mesh(new T.TorusGeometry(L*.42,.9,8,48,Math.PI),am);c.position.set(sx*(L/2+off+depth*.6),hgt+2,-2);c.rotation.y=Math.PI/2;c.scale.set(.75,.55,1);G.add(c)}}
    // torres de refletor (estádios sem cobertura grande)
    if(!(big&&roofFull)&&type!=='arena'){const poleM=new T.MeshStandardMaterial({color:'#5a6069',metalness:.6,roughness:.4});
      const H=type==='small'?28:42;const xs=type==='small'?[-L/2-8,-L/6,L/6,L/2+8]:[-L/2-14,L/2+14];
      for(const x of xs)for(const z of (type==='small'?[-W/2-off-mainOff(type,depth)-2]:[-W/2-off-depth-4])){
        const pole=new T.Mesh(new T.CylinderGeometry(.4,.7,H,8),poleM);pole.position.set(x,H/2,z);G.add(pole);
        const hd=new T.Mesh(new T.BoxGeometry(type==='small'?4:8,type==='small'?2:4,.6),this.lampM);hd.position.set(x,H+1,z);hd.lookAt(0,0,0);G.add(hd);
        const sp=new T.Sprite(new T.SpriteMaterial({map:this.glow,blending:T.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sp.scale.set(type==='small'?16:26,type==='small'?16:26,1);sp.position.set(x,H+1,z);G.add(sp)}}
    function mainOff(t,d){return t==='small'?d*.8:d}
  }
  officials(v,dt,t,bx,bz){
    if(!this.refs){const refKit={c1:'#151515',c2:'#f2c230',c3:'#151515',pat:'liso',sh:'#151515'};
      this.refs=[0,1,2].map(i=>{const P=makePlayer({kit:refKit,skin:(i*2+1)%5,head:i,boot:'#111'});P.root.traverse(o=>{if(o.isMesh)o.castShadow=true});this.s.add(P.root);P.x=0;P.z=0;P.h=0;return P});
      // bandeirinha: pequena bandeira na mão
      const fm=new T.Mesh(new T.PlaneGeometry(.35,.28),new T.MeshBasicMaterial({color:'#ff3b30',side:T.DoubleSide}));fm.position.set(.25,.95,.1);this.flagMesh=[fm,fm.clone()];this.refs[1].root.add(this.flagMesh[0]);this.refs[2].root.add(this.flagMesh[1]);
      // cartão
      this.cardMesh=new T.Mesh(new T.PlaneGeometry(.12,.17),new T.MeshBasicMaterial({color:'#ffd60a',side:T.DoubleSide}));this.cardMesh.visible=false;this.refs[0].root.add(this.cardMesh);this.cardMesh.position.set(-.38,2.25,.05);
      // bancos de reservas no lado do fundo
      this.bench=[];this.benchG=new T.Group();this.s.add(this.benchG);for(const sd of [0,1]){const bx0=sd?10:-16;const roofM=new T.MeshStandardMaterial({color:'#9fb6c8',transparent:true,opacity:.35,side:T.DoubleSide});
        const rf=new T.Mesh(new T.BoxGeometry(7,.08,1.6),roofM);rf.position.set(bx0+3,1.9,-W/2-3.1);this.benchG.add(rf);const bk=new T.Mesh(new T.BoxGeometry(7,1.9,.1),new T.MeshStandardMaterial({color:'#2b3138'}));bk.position.set(bx0+3,.95,-W/2-3.9);this.benchG.add(bk);
        const seat=new T.Mesh(new T.BoxGeometry(7,.45,.5),new T.MeshStandardMaterial({color:'#20242a'}));seat.position.set(bx0+3,.22,-W/2-3.5);this.benchG.add(seat);
        for(let i=0;i<3;i++){const P=makePlayer({kit:this.kits[sd],skin:(i+sd*3)%5,head:i+sd});P.root.position.set(bx0+1.4+i*2.1,0,-W/2-3.35);P.root.rotation.y=0;P.pose({sit:1,t:i});this.benchG.add(P.root);this.bench.push(P)}}}
    const [rf,a1,a2]=this.refs;
    // árbitro acompanha o lance de longe, na diagonal
    const tx=clamp(bx-11,-L/2+5,L/2-5),tz=clamp(bz+(bz>0?-12:12)*.75,-W/2+3,W/2-3);
    // árbitros: velocidade real (acelera/freia), e o passo segue o sentido do movimento (de costas, de lado ou de frente) — sem deslizar
    const mv=(P,x,z,face,vmax=6.2)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);const want=d<.35?0:Math.min(vmax,d*1.6);const ux=d>1e-3?dx/d:0,uz=d>1e-3?dz/d:0;
      const ak=Math.min(1,dt*3.2);P.vx=(P.vx||0)+(ux*want-(P.vx||0))*ak;P.vz=(P.vz||0)+(uz*want-(P.vz||0))*ak;P.x+=P.vx*dt;P.z+=P.vz*dt;const sp=Math.hypot(P.vx,P.vz);
      let h=sp>3.2?Math.atan2(P.vx,P.vz):face;let dh=h-P.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));P.h+=dh*Math.min(1,dt*5);P.root.position.set(P.x,0,P.z);P.root.rotation.y=P.h;
      let back=0,side=0;if(sp>.4){let rel=Math.atan2(P.vx,P.vz)-P.h;rel=Math.atan2(Math.sin(rel),Math.cos(rel));if(Math.abs(rel)>2.1)back=1;else if(Math.abs(rel)>.9)side=Math.sign(rel)}
      return {mv:sp/7.2,back,side}};
    const r0=mv(rf,tx,tz,Math.atan2(bx-rf.x,bz-rf.z));
    const card=v.card;rf.pose({mv:r0.mv,t,card:!!card,back:r0.back,side:r0.side,refIdle:1});this.cardMesh.visible=!!card;if(card)this.cardMesh.material.color.set(card.red?'#e5262b':'#ffd60a');
    // bandeirinhas na lateral do fundo, cada um numa metade, na linha do penúltimo defensor (aprox. pela bola)
    const lz=-W/2-1.3;const fl=v.flag;
    const m1=mv(a1,clamp(Math.min(bx,0),-L/2,0),lz,0,5);a1.pose({mv:m1.mv,t,side:m1.side,back:m1.back,refIdle:1,flagUp:!!(fl&&fl.x<L/2)});
    const m2=mv(a2,clamp(Math.max(bx,0),0,L/2),lz,0,5);a2.pose({mv:m2.mv,t,side:m2.side,back:m2.back,refIdle:1,flagUp:!!(fl&&fl.x>=L/2)});
    for(const f of this.flagMesh)f.rotation.z=Math.sin(t*5)*.15;
  }
  setQuality(q){this.gq=q;const dpr=window.devicePixelRatio||1;// (30) gráfico: automático, leve ou alto
    if(q==='leve'){this.r.setPixelRatio(Math.min(1,dpr));this.r.shadowMap.enabled=false}
    else if(q==='alto'){this.r.setPixelRatio(Math.min(2,dpr));this.r.shadowMap.enabled=true;this.qLvl=0}
    else{this.r.setPixelRatio(Math.min(this.low?1.5:2,dpr));this.r.shadowMap.enabled=(this.qLvl||0)<3}
    this.r.setSize(this.w||1,this.h||1,false);this.s.traverse(o=>{if(o.material&&o.material.needsUpdate!==undefined)o.material.needsUpdate=true})}
  quality(ms){if(this.gq==='leve'||this.gq==='alto')return;// qualidade automática: se o aparelho não aguenta, reduz a resolução e as sombras para manter o movimento liso
    this.fq=(this.fq||ms)*.95+ms*.05;this.qN=(this.qN||0)+1;if(this.qN<90)return;this.qN=0;
    if(this.fq>24&&(this.qLvl||0)<3){this.qLvl=(this.qLvl||0)+1;const pr=[1.75,1.35,1,.8][this.qLvl];this.r.setPixelRatio(Math.min(pr,window.devicePixelRatio||1));this.r.setSize(this.w,this.h,false);if(this.qLvl>=2){this.key.shadow.mapSize.set(1024,1024);if(this.key.shadow.map){this.key.shadow.map.dispose();this.key.shadow.map=null}}if(this.qLvl>=3)this.r.shadowMap.enabled=false}}
  resize(w,h,dpr){this.w=w;this.h=h;this.r.setPixelRatio(Math.min(dpr,this.low?1.5:2));this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
  player(id,inf){let P=this.pl.get(id);if(P)return P;const kit=inf.gk?this.kits[inf.side].gk:this.kits[inf.side];
    const lk=inf.mp&&inf.mp.p&&inf.mp.p.look;P=makePlayer({model:lk?lk-1:null,kit,gk:inf.gk,skin:inf.skin,hair:inf.hair,head:(id*7+3)%5,num:inf.num,boot:['#141414','#f4f4f4','#1d4fd8','#f5c518','#e11d48'][id%5]});P.root.traverse(o=>{if(o.isMesh)o.castShadow=true});
    P.h=0;P.x=null;P.inf=inf;this.s.add(P.root);this.pl.set(id,P);return P}
  draw(v,dt,info,zoom,intro){
    if(!this.ready)return;this.time+=dt;const t=this.time;
    const nowR=performance.now()/1000;const rdt=this._lr?Math.min(.1,Math.max(.001,nowR-this._lr)):dt;this._lr=nowR;const hdt=Math.min(dt,rdt*1.6);// giro do corpo no máximo 1,6x mais rápido que o normal
    // bola
    const b=v.b;let bx=wx(b.x),bz=wz(b.y),by=Math.max(0,b.z||0)+.19;const fly=v.fly;
    // gol: a bola fica dentro da rede e a rede estufa
    if(v.cele){const sg=bx>0?1:-1;if(Math.abs(bx)>L/2-2){bx=sg*(L/2+1.5);bz=clamp(bz,-GW/2+.5,GW/2-.5);by=.2}
      if(!this.netT||this.netSide!==sg||t-this.netT>8){if(!this.celeOn){this.netT=t;this.netSide=sg}}this.celeOn=true}else this.celeOn=false;
    if(fly&&fly.kind==='shot'&&fly.out==='goal'&&fly.t!=null&&fly.dur&&fly.t/fly.dur>.97){const sg=bx>0?1:-1;if(!this.celeOn&&(!this.netT||t-this.netT>3)){this.netT=t;this.netSide=sg;this.netAmp=.75+.55*clamp(Math.abs(bz)/(GW/2),0,1)+.25*clamp((by-.5)/1.8,0,1)}}// (6) no ângulo a rede estufa mais
    if(this.nets){for(const side of [0,1]){const n=this.nets[side];const sg=side?1:-1;let o=0;if(this.netT&&this.netSide===sg){const k=t-this.netT;o=k<1.6?Math.sin(Math.min(1,k/.18)*Math.PI/2)*Math.exp(-k*2.2)*(this.netAmp||.9):0}n.position.x=n.userData.x0+sg*o;n.scale.y=1-o*.08}}
    // quem tem a bola
    let ownP=null;this._throwP=null;
    // jogadores
    const seen=new Set();
    const cutNow=v.cut!=null&&v.cut!==this.lastCut&&!v.replay;if(v.cut!=null)this.lastCut=v.cut;if(cutNow){this.bD=null;this.cutT=t}
    for(const p of v.pl){const inf=info.get(p.id);if(!inf)continue;seen.add(p.id);const P=this.player(p.id,inf);P.root.visible=true;
      if(cutNow){P.x=null;P.vx=P.vz=0;P.mvS=0;P.db=null}
      let x=wx(p.x),z=wz(p.y);
      if(P.x==null){P.x=x;P.z=z;P.h=cutNow?Math.atan2(bx-x,bz-z):inf.side===0?Math.PI/2:-Math.PI/2;P.ox=0;P.oz=0}
      // nunca "teletransporta": se a posição real pular, o jogador corre até lá
      {const jx=x-P.x,jz=z-P.z,jd=Math.hypot(jx,jz);const fast=v.replay?60:(jd>1.5?12:0);if(fast&&jd>.05){const st2=Math.min(jd,fast*dt*(1+jd/20));x=P.x+jx/jd*st2;z=P.z+jz/jd*st2;P.glide=1}else P.glide=0}
      const own=v.own===p.id&&!fly;const near=Math.hypot(bx-x,bz-z)<3.5;
      // suavização (mola amortecida): tira o tremido das mudanças de alvo do motor sem atrasar quem está na bola
      if(!P.glide&&!v.replay){const k=1-Math.exp(-dt*(own||near?28:11));x=P.x+(x-P.x)*k;z=P.z+(z-P.z)*k}
      const ddx=x-P.x,ddz=z-P.z;P.x=x;P.z=z;
      const ivx=ddx/Math.max(dt,1e-3),ivz=ddz/Math.max(dt,1e-3);const kv=1-Math.exp(-dt*7);P.vx=(P.vx||0)+(ivx-(P.vx||0))*kv;P.vz=(P.vz||0)+(ivz-(P.vz||0))*kv;
      const dx=P.vx*dt,dz=P.vz*dt,sp=Math.hypot(P.vx,P.vz);
      // direção: com histerese entre "olhar para onde corre" e "olhar para a bola", e giro com velocidade máxima
      let tgt=P.h;const bdist=Math.hypot(bx-x,bz-z);P.runFace=P.runFace?sp>.9:sp>1.6;
      if(p.kick&&fly&&Math.hypot(wx(fly.fx)-x,wz(fly.fy)-z)<2)tgt=Math.atan2(wx(fly.tx)-x,wz(fly.ty)-z);else if(own&&bdist>.15)tgt=Math.atan2(bx-x,bz-z);else if(inf.gk&&Math.abs(x)>L/2-30)tgt=Math.atan2(bx-x,bz-z);// goleiro perto do gol: sempre de frente para a bola (anda de lado/de costas)
      else if(P.runFace)tgt=Math.atan2(P.vx,P.vz);else tgt=Math.atan2(bx-x,bz-z);
      let dh=tgt-P.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));const ak=p.anim&&p.anim.k;if(ak==='slide'||ak==='fall'||ak==='getup')dh=0;/* no chão não gira o corpo (o giro torcia a cintura) */const maxT=(own?9:P.runFace?6.5:4)*hdt;P.h+=clamp(dh*Math.min(1,hdt*(own?12:8)),-maxT,maxT);
      // chute
      let kick=0;if(p.kick){if(!this.kick.has(p.id))this.kick.set(p.id,t)}const k0=this.kick.get(p.id);if(k0!=null){kick=(t-k0)/.6;if(kick>=1){this.kick.delete(p.id);kick=0}}
      // passada calculada pela velocidade real na tela: pé não "patina" no gramado
      P.gph=(P.gph||0)+sp*dt*2.05;P.mvS=(P.mvS||0)+(clamp(sp/7.2,0,1.3)-(P.mvS||0))*Math.min(1,dt*6);
      const pose={mv:P.mvS,ph:P.gph,kick:kick?clamp(kick,.001,1):0,t:t+p.id};
      // estilo de cada um: quem é rápido tem passada mais longa; aceleração aparece na inclinação do corpo
      {const a=inf.mp&&inf.mp.a||{};pose.stride=.94+((a.vel||10)-10)*.008+((a.ace||10)-10)*-.003;P.accS=(P.accS||0)+(((sp-(P.spPrev??sp))/Math.max(dt,1e-3))-(P.accS||0))*Math.min(1,dt*5);P.spPrev=sp;pose.acc=P.accS;P.dri=a.dri||10}
      const foot=inf.mp&&inf.mp.p&&inf.mp.p.pe;pose.left=foot==='E'||(foot==='A'&&p.id%2===0);
      if(p.touch&&!kick)pose.touch=1;
      if(kick){if(P.kickH==null){P.kickH=by;if(p.kk==='shot'&&by>1.45&&!inf.gk)P.bikeT=t}pose.ballH=P.kickH}else P.kickH=null;
      if(P.bikeT&&t-P.bikeT<2.6)pose.skill={k:'bike',a:t-P.bikeT};else P.bikeT=null;
      // drible de efeito: giro 360 quando muda de direção bruscamente com a bola no pé
      /* dribles de efeito vindos do motor: roleta (giro 360), pedalada (pernas por cima da bola); o chapéu é o toque + a bola no alto */
      if(p.trick&&!kick){if(p.trick.k==='roleta')pose.skill={k:'spin',a:p.trick.a*1.1};else if(p.trick.k==='pedalada'&&p.trick.a<.75)pose.skill={k:'step',a:p.trick.a}}
      // goleiro: lê o chute e mergulha no canto onde a bola vai
      let ox=0,oz=0;
      if(inf.gk&&fly&&fly.kind==='shot'&&fly.side!==inf.side&&fly.t!=null&&fly.dur&&Math.abs(wx(fly.tx)-x)<9){
        // goleiro lê o chute: escolhe o movimento pela altura e pela distância lateral da bola
        const key=fly.fx+'|'+fly.fy+'|'+fly.dur;const lat=wz(fly.ty)-z;const need=Math.abs(lat);const hz=fly.endZ||0;
        if(P.gkKey!==key||!P.gkA){P.gkKey=key;const side=Math.sign(-Math.sin(P.h)*lat)||1;let kind;
          if(need>1.5)kind=hz<.55?'block':'dive';else if(fly.out==='goal'&&hz>2.0)kind='miss';else if(hz>1.9)kind='catchH';else if(hz>.9)kind='catchM';else if(hz>.25)kind='catchL';else kind='scoop';
          const rf=fly.out==='save'?1:fly.out==='goal'?.6:.8;P.gkA={kind,side,reach:need*rf,tEnd:null,pre:0,post:0}}
        const k=clamp(fly.t/fly.dur,0,1);P.gkA.pre=clamp((k-.1)/.9,0,1);P.gkA.post=0;P.gkA.tEnd=null}
      else if(inf.gk&&P.gkA){if(P.gkA.tEnd==null)P.gkA.tEnd=t;P.gkA.pre=1;P.gkA.post=t-P.gkA.tEnd;if(P.gkA.post>4||own&&P.gkA.post>1.6)P.gkA=null}
      if(inf.gk&&P.gkA)pose.gkA={kind:P.gkA.kind,side:P.gkA.side,reach:P.gkA.reach,pre:P.gkA.pre,post:P.gkA.post};
      if(!pose.gkA&&inf.gk&&v.own&&info.get(v.own)&&info.get(v.own).side!==inf.side&&Math.abs(bx-x)<30)pose.ready=1;
      P.ox+=(ox-P.ox)*Math.min(1,dt*10);P.oz+=(oz-P.oz)*Math.min(1,dt*(oz?8:3));
      P.root.position.set(x+P.ox,0,z+P.oz);P.root.rotation.y=P.h;
      // cabeceio
      if(!inf.gk&&by>1.5&&by<2.8&&bdist<1.2){pose.jump=1}
      // comemoração
      if(v.cele&&v.cele.mp&&info.get(v.cele.mp.id)&&inf.side===info.get(v.cele.mp.id).side){const cx=wx(v._flipped?L-v.cele.mp.x:v.cele.mp.x);
        if(p.id===v.cele.mp.id)pose.cele=2+((p.id+(this.goals=this.goals||0))%4);else if(Math.abs(cx-x)<25)pose.cele=1}
      // tipo de chute/passe, animações especiais, goleiro com a bola na mão
      pose.kk=p.kk;
      // animações especiais contadas em tempo real (o relógio do jogo para nas bolas paradas)
      if(p.anim&&P.animId!==p.anim.id+p.anim.k){P.animId=p.anim.id+p.anim.k;P.animT0=t;P.animK=p.anim.k;if(p.anim.k==='slide')this.spray(x,z,P.h)}
      if(P.animK){const age=t-P.animT0;const lim=P.animK==='fall'?2.3:P.animK==='slide'?1.93:P.animK==='lament'?1.5:1.3;if(age>lim||(own&&!(P.animK==='shoulder'&&age<.6))||(v.setup&&v.setup.taker===p.id))P.animK=null;else pose.anim={k:P.animK,a:age}}if(p.hold&&v.own===p.id)pose.hold=1;
      // lateral: segura a bola acima da cabeça
      if(v.setup&&v.setup.kind==='lateral'&&v.setup.taker===p.id){pose.throwPrep=1;P.throwing=1}else P.throwing=0;
      // anda de costas ou de lado quando o corpo está virado para a bola e o movimento é para outro lado
      if(!own&&!P.glide&&sp>.6&&sp<6.5&&!kick&&!pose.dive){const mvA=Math.atan2(dx,dz);let rel=mvA-P.h;rel=Math.atan2(Math.sin(rel),Math.cos(rel));
        if(Math.abs(rel)>2.1)pose.back=1;else if(Math.abs(rel)>1.0)pose.side=Math.sign(rel)}
      // inclina na curva e freia
      const turn=(P.lastH!=null?Math.atan2(Math.sin(P.h-P.lastH),Math.cos(P.h-P.lastH))/Math.max(dt,1e-3):0);P.lastH=P.h;
      P.lean=(P.lean||0)+(clamp(-turn*sp*.012,-.22,.22)-(P.lean||0))*Math.min(1,hdt*6);pose.lean=P.lean;P.trn=(P.trn||0)+(clamp(turn,-8,8)-(P.trn||0))*Math.min(1,hdt*8);pose.turn=P.trn;pose.own=own?1:0;pose.spd=sp;
      const acc=(sp-(P.lastSp??sp))/Math.max(dt,1e-3);P.lastSp=sp;P.brk=(P.brk||0)+((acc<-14&&sp>1.5?1:0)-(P.brk||0))*Math.min(1,dt*5);if(P.brk>.05)pose.brake=P.brk;
      // domínio: bola chegando alta perto do jogador
      if(fly&&fly.kind!=='shot'&&by>.5&&bdist<1.6&&!inf.gk){pose.trap=by>1.65?'head':by>1.15?'chest':'thigh'}
      // disputa de cabeça: quem está perto da bola alta salta junto
      if(!inf.gk&&!pose.jump&&by>1.4&&by<3&&bdist<2.2&&fly){pose.jump=clamp(1-(bdist-1)/1.2,0,1)}
      {let lk=Math.atan2(bx-x,bz-z)-P.h;lk=Math.atan2(Math.sin(lk),Math.cos(lk));pose.look=lk}
      P._pose=pose;P.pose(pose);if(pose.jump&&!pose.dive){P.body.position.y=Math.max(P.body.position.y,clamp(by-1.85,.05,.55)*pose.jump)}
      if(pose.hold){ownP={P,x:x+P.ox,z:z+P.oz,mv:0,ph:0,hold:1}}
      if(P.throwing){this._throwP={P,x:x+P.ox,z:z+P.oz}}
      if(own&&!pose.hold){ownP={P,x:x+P.ox,z:z+P.oz,mv:pose.mv,ph:pose.ph}}
    }
    // bola colada no pé de quem conduz (sem mudar o lance, só o desenho)
    if(ownP&&ownP.hold){const P=ownP.P;bx=ownP.x+Math.sin(P.h)*.32;bz=ownP.z+Math.cos(P.h)*.32;by=1.1}
    else if(this._throwP&&v.dead){const P=this._throwP.P;bx=this._throwP.x+Math.sin(P.h)*.05;bz=this._throwP.z+Math.cos(P.h)*.05;by=2.15}
    else if(ownP&&by<.6){const P=ownP.P;const hx=Math.sin(P.h),hz=Math.cos(P.h);const sp=Math.hypot(P.vx||0,P.vz||0);
      // condução física: a bola rola à frente e perde velocidade; o pé que chega nela dá o toque (craque: toque curto e colado; perna-de-pau: bola longe)
      const DB=P.db||(P.db={d:.45,v:0,lat:0});if(P.dbT===undefined||this.time-P.dbT>.25){DB.d=.45;DB.v=0}P.dbT=this.time;P.root.updateMatrixWorld(true);
      const sk=clamp(((P.dri||10)-5)/15,0,1);DB.v=Math.max(0,DB.v-dt*2.2);DB.d+=(DB.v-sp)*dt;
      const fp=this._fp||(this._fp=new T.Vector3());let touched=false;
      if(sp>.9){for(const fb of ['ball_l','ball_r']){const b=P.B[fb];if(!b)continue;b.getWorldPosition(fp);const fd=(fp.x-ownP.x)*hx+(fp.z-ownP.z)*hz;
        if(fd>DB.d-.16&&fp.y<.3&&!touched){DB.v=sp+.6+(1-sk)*1.9+Math.min(1.2,sp*.12);DB.d=Math.max(DB.d,fd+.12);DB.lat=((fp.x-ownP.x)*hz-(fp.z-ownP.z)*hx)*.6;touched=true}}}
      else{DB.d+=(.38-DB.d)*Math.min(1,dt*4);DB.v=0}
      DB.d=clamp(DB.d,.3,.55+sp*(.16+.2*(1-sk)));DB.lat*=Math.exp(-dt*3);
      const tx=ownP.x+hx*DB.d+hz*DB.lat,tz=ownP.z+hz*DB.d-hx*DB.lat;
      const k=Math.hypot(bx-ownP.x,bz-ownP.z)<2.2?1:0;bx+=(tx-bx)*k;bz+=(tz-bz)*k}
    // bola nunca some/teletransporta: a posição desenhada persegue a real (rolando rápido); só em reposição longa ela some e reaparece suave
    {const D=this.bD||(this.bD={x:bx,y:by,z:bz,s:1});const ex=bx-D.x,ey=by-D.y,ez=bz-D.z,d=Math.hypot(ex,ey,ez);
      if(v.replay||d<.02){D.x=bx;D.y=by;D.z=bz}
      else if(v.dead&&d>1.5&&!fly){D.fade=1;D.tx=bx;D.ty=by;D.tz=bz}// bola parada reposicionada: some e reaparece no lugar (nada de bola voando sozinha)
      else{const spd=fly?95:v.dead?32:24;const st=Math.min(d,Math.max(spd*dt,d*(1-Math.exp(-dt*(fly?40:16)))));D.x+=ex/d*st;D.y+=ey/d*st;D.z+=ez/d*st}
      if(D.fade){D.s-=dt*5;if(D.s<=0){D.s=0;D.x=D.tx;D.y=D.ty;D.z=D.tz;D.fade=0}}else D.s=Math.min(1,D.s+dt*5);
      bx=D.x;by=D.y;bz=D.z;this.ball.scale.setScalar(1.55*Math.max(.001,D.s))}
    if(this._bp){const dx=bx-this._bp.x,dz=bz-this._bp.z;const d=Math.hypot(dx,dz);if(d<5&&d>1e-4){const ax=new T.Vector3(dz,0,-dx).normalize();this.ball.rotateOnWorldAxis(ax,d/.19)}}
    this._bp={x:bx,z:bz};this.ball.position.set(bx,by,bz);this.bsh.position.set(bx,.015,bz);this.bsh.material.opacity=.35/(1+by*.6);
    for(const [id,P] of this.pl)if(!seen.has(id))P.root.visible=false;
    {// (14) anel no gramado sob quem está com a bola
      if(!this.ownRing){this.ownRing=new T.Mesh(new T.RingGeometry(.55,.72,40),new T.MeshBasicMaterial({color:'#ffe066',transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));this.ownRing.rotation.x=-Math.PI/2;this.s.add(this.ownRing)}
      const show=!!ownP&&!v.replay&&intro==null;this.ownRing.visible=show;if(show){this.ownRing.position.set(ownP.x,.035,ownP.z);this.ownRing.material.opacity=.55+.25*Math.sin(t*6)}}
    {// (5) rastro da bola nos chutes e lançamentos fortes
      const strong=fly&&(fly.kind==='shot'||fly.kind==='clear'||(fly.kind==='cross'))&&!v.replay;const tr=this.trail||(this.trail=[]);
      if(strong){tr.push(bx,by,bz);if(tr.length>66)tr.splice(0,3)}else if(tr.length)tr.splice(0,Math.min(tr.length,9));
      if(!this.trM){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(66),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(66),3));
        this.trM=new T.Line(g,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));this.trM.frustumCulled=false;this.s.add(this.trM)}
      const n=tr.length/3,P=this.trM.geometry.attributes.position.array,Cc=this.trM.geometry.attributes.color.array;for(let i=0;i<n;i++){P[i*3]=tr[i*3];P[i*3+1]=tr[i*3+1];P[i*3+2]=tr[i*3+2];const a=(i+1)/n;Cc[i*3]=a;Cc[i*3+1]=a*.95;Cc[i*3+2]=a*.8}
      this.trM.geometry.setDrawRange(0,n);this.trM.geometry.attributes.position.needsUpdate=true;this.trM.geometry.attributes.color.needsUpdate=true;this.trM.visible=n>2}
    {// (19) impedimento: linha traçada no gramado enquanto o bandeirinha sinaliza
      const fl=v.flag;if(!this.offM){this.offM=new T.Mesh(new T.PlaneGeometry(.22,W),new T.MeshBasicMaterial({color:'#ffd60a',transparent:true,opacity:.75,depthWrite:false}));this.offM.rotation.x=-Math.PI/2;this.offM.position.y=.03;this.s.add(this.offM)}
      this.offM.visible=!!(fl&&fl.x!=null)&&!v.replay;if(this.offM.visible){this.offM.position.x=wx(fl.x);this.offM.material.opacity=.55+.25*Math.sin(t*8)}}
    // jogadores não se atravessam: afasta levemente quem está colado (só no desenho)
    if(intro!=null&&intro<.97){// (23) entrada: os dois times perfilados no meio-campo, de frente para a câmera; depois caminham para as posições
      const k=clamp((intro-.8)/.17,0,1),e=k*k*(3-2*k);const bySide=[[],[]];for(const [id,P] of this.pl){if(!P.root.visible||!P.inf)continue;bySide[P.inf.side?1:0].push(P)}
      bySide.forEach((arr,sd)=>{arr.sort((a,b)=>(a.inf.num||0)-(b.inf.num||0));arr.forEach((P,i)=>{const lx=(sd?1:-1)*(2.2+i*1.15),lz=2.5;const rx=P.root.position.x,rz=P.root.position.z;
        P.root.position.set(lx+(rx-lx)*e,0,lz+(rz-lz)*e);P.root.rotation.y=e<.05?0:P.root.rotation.y;if(e<.02)P.pose({mv:0,t})})})}
    {const arr=[];for(const [id,P] of this.pl)if(P.root.visible&&!P.animK)arr.push(P);for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const a=arr[i].root.position,b=arr[j].root.position;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>0.001&&d<.62){const k=(.62-d)/2/d;a.x-=dx*k;a.z-=dz*k;b.x+=dx*k;b.z+=dz*k}}}
    this.officials(v,dt,t,bx,bz);
    // câmera de transmissão: fixa no meio-campo, alta, acompanha a bola girando
    // câmera esperta: aproxima nos lances de área, abre no meio-campo
    const inBox=Math.abs(bx)>L/2-22&&Math.abs(bz)<22;{const bp=this._bsp0;const sp=bp?Math.hypot(bx-bp.x,bz-bp.z)/Math.max(dt,1e-3):0;this._bsp0={x:bx,z:bz};this.bsp=(this.bsp||0)+(Math.min(sp,30)-(this.bsp||0))*Math.min(1,dt*2)}
    const counter=!v.dead&&!fly&&this.bsp>6.2&&Math.abs(bx)<L/2-24;// (2) contra-ataque: câmera abre
    this.zk=(this.zk||1)+(((inBox?1.22:v.dead?1.1:counter?.86:1))-(this.zk||1))*Math.min(1,dt*.8);
    const Z=(zoom||1)*this.zk;const portrait=this.w<this.h*1.05;
    let tx=bx,tz=bz;if(v.cele&&v.cele.mp){const m=v.cele.mp;tx=wx(v._flipped?L-m.x:m.x);tz=wz(v._flipped?W-m.y:m.y)}
    this.camT.x+=(clamp(tx,-L/2+6,L/2-6)-this.camT.x)*Math.min(1,dt*2.2);this.camT.z+=(clamp(tz*.55,-12,12)-this.camT.z)*Math.min(1,dt*1.6);
    const dist=(portrait?58:64)/Math.pow(Z,.5),hgt=(portrait?24:19)/Math.pow(Z,.3);
    const camX=this.camT.x*.4;this.cam.position.set(camX,hgt,W/2+dist*.62);
    const span=(portrait?24:40)/Z;const d=this.cam.position.distanceTo(new T.Vector3(this.camT.x,0,this.camT.z));
    const hf=2*Math.atan(span/2/d);this.cam.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(hf/2)/this.cam.aspect));this.cam.updateProjectionMatrix();
    this.cam.lookAt(this.camT.x,1.5,this.camT.z);
    if(typeof window!=='undefined'&&window.__dbgCam){this.cam.position.set(bx-5,3.2,bz+9);this.cam.fov=38;this.cam.updateProjectionMatrix();this.cam.lookAt(bx,.9,bz)}
    if(v.dead&&v.setup&&v.setup.kind==='corner'&&!v.replay&&intro==null){// (3) escanteio visto de trás do gol
      const sg=bx>0?1:-1;const cp=new T.Vector3(sg*(L/2+11),10.5,-bz*.12);this.cornerCam=this.cornerCam?this.cornerCam.lerp(cp,Math.min(1,dt*3)):this.cam.position.clone().lerp(cp,.15);
      this.cam.position.copy(this.cornerCam);this.cam.fov=50;this.cam.updateProjectionMatrix();this.cam.lookAt(sg*(L/2-11),1.2,bz*.15)}else this.cornerCam=null;
    if(v.replay&&intro==null){// replay com outro ângulo: atrás do gol ou rente ao gramado
      const sg=bx>0?1:-1;if(v.replayAng==='goal'){this.cam.position.set(sg*(L/2+14),5.5,clamp(bz*.4,-8,8));this.cam.fov=38}else{this.cam.position.set(bx-sg*14,2.6,bz+18);this.cam.fov=40}
      this.cam.updateProjectionMatrix();this.cam.lookAt(bx,1,bz)}
    if(this.nearG)this.nearG.visible=intro!=null&&intro<.74||!!this.debugCam;
    if(intro!=null){// abertura: câmera passeia pelo estádio mostrando as duas torcidas e termina na posição de TV
      const k=intro,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const a=-2.3+2.3*e;const R=135-45*e;
      const ip=new T.Vector3(Math.sin(a)*R,64-30*e,Math.cos(a)*R);const blend=clamp((k-.75)/.25,0,1);
      const tv=this.cam.position.clone();this.cam.position.copy(ip.lerp(tv,blend));this.cam.fov=T.MathUtils.lerp(48,this.cam.fov,blend);this.cam.updateProjectionMatrix();
      this.cam.lookAt(this.camT.x*blend,(1-blend)*6+1.5*blend,this.camT.z*blend)}
    this.key.position.set(this.camT.x-30,60,this.camT.z+40);this.key.target.position.set(this.camT.x,0,this.camT.z);
    // placas animadas e torcida pulando no gol
    if(this.ads)for(const a of this.ads)a.offset.x=(t*.04)%1;
    {const hot=!v.dead&&Math.abs(bx)>L/2-24;this.hype=(this.hype||0)+((hot?1:0)-(this.hype||0))*Math.min(1,dt*1.5)}// (9) torcida levanta nos ataques
    if(this.cts){const j=v.cele?Math.abs(Math.sin(t*9))*.006:Math.sin(t*1.3)*.0006+Math.abs(Math.sin(t*5.5))*.0024*(this.hype||0);for(const c of this.cts)c.offset.y=j}
    this.fxStep(rdt,t);if(!this.wearDone)this.addWear();
    if(this.debugCam){const [p,q,f]=this.debugCam;this.cam.position.set(...p);this.cam.fov=f||50;this.cam.updateProjectionMatrix();this.cam.lookAt(...q)}
    this.sprayStep(rdt);this.r.render(this.s,this.cam);
  }
  // ---------- cena especial: pênalti / falta vista de trás do batedor ----------
  cineStart(c){this.cineS=Object.assign({t:0},c);const S=this.cineS;
    S.Pt=this.player(c.taker.id,c.taker.inf);S.Pg=c.gk?this.player(c.gk.id,c.gk.inf):null;S.Pw=(c.wall||[]).map(w=>this.player(w.id,w.inf));
    const bx=wx(c.fx),bz=wz(c.fy),gx=wx(c.tx>L/2?L:0),gz=0;S.b={x:bx,z:bz};S.g={x:gx,z:gz};
    const dx=gx-bx,dz=gz-bz,dl=Math.hypot(dx,dz);S.dir={x:dx/dl,z:dz/dl};S.h=Math.atan2(dx,dz);S.side={x:S.dir.z,z:-S.dir.x};
    S.tgt={x:wx(c.tx>L/2?L+.6:-.6),z:wz(c.ty)};if(c.out==='save'){S.tgt.x=gx-Math.sign(dx)*.4}
    if(c.out==='miss'){S.tgt.x=gx+Math.sign(dx)*2.5}
    S.TT={run:1.1,kick:1.85,fly:c.sp==='pen'?.55:1.0};S.end=S.TT.kick+S.TT.fly+1.6;S.curl=c.sp==='fk'?(c.left?1:-1)*1.8:0;
    // barreira
    S.Pw.forEach((P,i)=>{const d=9.15,o=(i-(S.Pw.length-1)/2)*.62;P.root.position.set(bx+S.dir.x*d+S.side.x*(o+.6),0,bz+S.dir.z*d+S.side.z*(o+.6));P.root.rotation.y=S.h+Math.PI;P.pose({mv:0,t:i})});
    return S}
  cineFrame(dt){const S=this.cineS;if(!S)return {done:true};S.t+=dt;const t=S.t,TT=S.TT;const sm=x=>x<0?0:x>1?1:x*x*(3-2*x);
    // batedor: parado, corrida curta em diagonal e chute com o pé certo
    const lat=(S.left?-1:1)*1.0;const back=3.4;
    const p0={x:S.b.x-S.dir.x*back-S.side.x*lat,z:S.b.z-S.dir.z*back-S.side.z*lat},p1={x:S.b.x-S.dir.x*.55-S.side.x*lat*.32,z:S.b.z-S.dir.z*.55-S.side.z*lat*.32};
    const rk=sm((t-TT.run)/(TT.kick-TT.run-.05));const Pt=S.Pt;Pt.root.visible=true;Pt.root.position.set(p0.x+(p1.x-p0.x)*rk,0,p0.z+(p1.z-p0.z)*rk);
    {/* olha para onde corre e, nas últimas passadas, vira para o gol (giro suave, sem torcer a cintura) */const hr=Math.atan2(p1.x-p0.x,p1.z-p0.z);let dh=S.h-hr;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;const tw=sm((t-(TT.kick-.45))/.4);Pt.root.rotation.y=t<TT.run?S.h:hr+dh*tw}
    const kk=t>=TT.kick-.26?Math.min(1,(t-(TT.kick-.26))/.6):0;const runV=t>TT.run&&t<TT.kick-.22?Math.min(.55,(t-TT.run)*1.4):0;
    Pt.pose({mv:runV,kick:kk>0&&kk<1?kk:0,kk:'shot',left:S.left,t,noDrib:1,look:0});
    // bola
    let bx=S.b.x,bz=S.b.z,by=.19;const fk=(t-TT.kick)/TT.fly;
    if(fk>0){const k=Math.min(1,fk);const e=k;bx=S.b.x+(S.tgt.x-S.b.x)*e+S.side.x*S.curl*Math.sin(Math.PI*k);bz=S.b.z+(S.tgt.z-S.b.z)*e+S.side.z*S.curl*Math.sin(Math.PI*k);
      by=.19+(S.sp==='pen'?.3:2.2)*4*k*(1-k)+(S.endZ||0)*k;
      if(fk>1){const a=fk-1;if(S.out==='goal'){bx=S.tgt.x+Math.sign(S.dir.x)*Math.min(.8,a*3);by=Math.max(.2,(S.endZ||0)+.19-a*4)}
        else if(S.out==='save'){bx=S.tgt.x-Math.sign(S.dir.x)*a*5;bz=S.tgt.z+(S.tgt.z>0?1:-1)*a*3;by=Math.max(.19,1+(S.endZ||0)*.5-a*3)}
        else{bx=S.tgt.x+Math.sign(S.dir.x)*a*6;by=Math.max(.19,(S.endZ||0)-a*2)}}
      if(fk>1&&!S.net&&S.out==='goal'){S.net=1;this.netT=this.time;this.netSide=Math.sign(S.dir.x)}}
    this.ball.position.set(bx,by,bz);this.bsh.position.set(bx,.015,bz);if(fk>0&&fk<1.3)this.ball.rotateOnWorldAxis(new T.Vector3(S.side.x,0,S.side.z),dt*30);
    // goleiro: espera, dá um passinho e mergulha no canto (no gol chega atrasado)
    if(S.Pg){const P=S.Pg;const gx=S.g.x-Math.sign(S.dir.x)*.3;const dl=S.tgt.z-0;const dk=sm((t-TT.kick-(S.out==='goal'?.12:.02))/(TT.fly*.8));
      const reach=S.out==='save'?1:S.out==='goal'?.55:.7;P.root.visible=true;
      const sideZ=clamp(S.b.z*.12,-1.2,1.2);/* cobre o canto do lado da bola */const tk0=t-TT.kick;const shuffle=tk0<0?Math.sin(t*5.5)*.09*Math.min(1,t/.6):0;
      const lunge=tk0>0?sm(tk0/(TT.fly*.8))*clamp(S.tgt.z-sideZ,-1.4,1.4)*(S.out==='goal'?.35:.55):0;/* dá o passo para o lado da bola antes do mergulho */
      P.root.position.set(gx,0,sideZ+shuffle+lunge);P.root.rotation.y=S.h+Math.PI;
      const ds=Math.sign(-Math.sin(S.h+Math.PI)*dl)||1;const tk=t-TT.kick-(S.out==='goal'?.12:.02);
      if(tk>0){const need=Math.abs(dl),hz=S.endZ||0;if(!S.gkKind)S.gkKind=need>1.5?(hz<.55?'block':'dive'):(S.out==='goal'&&hz>2?'miss':hz>1.9?'catchH':hz>.9?'catchM':hz>.25?'catchL':'scoop');
        const fl=TT.fly*.8;P.pose({t,mv:0,gkA:{kind:S.gkKind,side:ds,reach:need*reach,pre:Math.min(1,tk/fl),post:Math.max(0,tk-fl)}})}
      else P.pose({ready:1,crouch:.8,mv:Math.abs(Math.cos(t*5.5))*.06,side:Math.cos(t*5.5)>0?1:-1,t})}
    // câmera atrás do batedor, aproximando
    const cb=sm(t/1.6),ch=S.sp==='pen'?2.1:3.2,cd=(S.sp==='pen'?7.5:10.5)-cb*1.6;
    this.cam.position.set(S.b.x-S.dir.x*cd+S.side.x*(S.left?.9:-.9),ch,S.b.z-S.dir.z*cd+S.side.z*(S.left?.9:-.9));this.cam.fov=34;this.cam.updateProjectionMatrix();
    const fx=fk>0?Math.min(1,fk):0;this.cam.lookAt(S.g.x*(.75+.25*fx)+S.b.x*(.25-.25*fx),1.1,S.tgt.z*.4*fx);
    if(this.nearG)this.nearG.visible=false;
    // rede
    if(this.nets){for(const side of [0,1]){const n=this.nets[side];const sg=side?1:-1;let o=0;if(this.netT&&this.netSide===sg){const k=this.time-this.netT;o=k<1.4?Math.sin(Math.min(1,k/.18)*Math.PI/2)*Math.exp(-k*2.2)*.9:0}n.position.x=n.userData.x0+sg*o}}
    this.time+=dt;this.r.render(this.s,this.cam);
    const txt=fk>1.05?({goal:'GOOOL!',save:'DEFENDEU!',miss:'PRA FORA!',block:'NA BARREIRA!'})[S.out]:null;
    if(t>=S.end){this.cineS=null;return {done:true,txt}}return {done:false,txt}}
  // ---------- clima, sinalizadores e gramado ----------
  setWeather(w){if(!this.ready||this.wx===w)return;this.wx=w;const s=this.s;
    if(!this.wx0)this.wx0={bg:s.background.clone(),fogC:s.fog.color.clone(),fn:s.fog.near,ff:s.fog.far,exp:this.r.toneMappingExposure};const o=this.wx0;
    s.background.copy(o.bg);s.fog.color.copy(o.fogC);s.fog.near=o.fn;s.fog.far=o.ff;this.r.toneMappingExposure=o.exp;
    if(w==='tarde'){s.background.set('#7fb0e8');s.fog.color.set('#b9cfe8');s.fog.near=160;s.fog.far=420;this.r.toneMappingExposure=o.exp*1.28}// (7) jogo de tarde
    if(w==='chuva'){s.background.set('#1b2330');s.fog.color.set('#2a3442');s.fog.near=50;s.fog.far=210;this.r.toneMappingExposure=o.exp*.9}// (8) chuva
    if(this.rainM)this.rainM.visible=w==='chuva';if(w==='chuva'&&!this.rainM){const n=this.low?1400:3200;const g=new T.BufferGeometry();const P=new Float32Array(n*6);
      for(let i=0;i<n;i++){const x=(Math.random()-.5)*130,y=Math.random()*40,z=(Math.random()-.5)*95;P.set([x,y,z,x+.05,y-.9,z],i*6)}g.setAttribute('position',new T.BufferAttribute(P,3));
      this.rainM=new T.LineSegments(g,new T.LineBasicMaterial({color:'#aac4e6',transparent:true,opacity:.35,depthWrite:false}));this.rainM.frustumCulled=false;s.add(this.rainM)}}
  setFlares(on){if(!this.ready)return;if(!on){if(this.flG)this.flG.visible=false;return}if(this.flG){this.flG.visible=true;return}// (10) sinalizadores atrás dos gols
    const G=new T.Group();this.flG=G;this.s.add(G);const glow=this.glow;this.flares=[];
    for(const sg of [-1,1])for(let i=0;i<5;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:glow,color:'#ff3b1f',blending:T.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sp.scale.set(3,3,1);sp.position.set(sg*(L/2+13+Math.random()*6),6+Math.random()*5,(i-2)*7+Math.random()*3);G.add(sp);this.flares.push(sp)}
    const n=260;const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));this.smk=new T.Points(g,new T.PointsMaterial({size:2.4,color:'#d7cfc8',transparent:true,opacity:.28,depthWrite:false}));this.smk.frustumCulled=false;G.add(this.smk);this.smkP=[]}
  fxStep(dt,t){
    if(this.rainM&&this.rainM.visible){const P=this.rainM.geometry.attributes.position.array;for(let i=0;i<P.length;i+=6){P[i+1]-=dt*30;P[i+4]-=dt*30;if(P[i+4]<0){const y=38+Math.random()*4;P[i+1]=y;P[i+4]=y-.9}}this.rainM.geometry.attributes.position.needsUpdate=true}
    if(this.flG&&this.flG.visible){for(const f of this.flares){const k=.75+.25*Math.sin(t*23+f.position.z)*Math.sin(t*7.3+f.position.x);f.material.opacity=k;f.scale.setScalar(2.6+k)}
      const sp=this.smkP;if(sp.length<260&&Math.random()<.9){const f=this.flares[Math.floor(Math.random()*this.flares.length)];sp.push({x:f.position.x,y:f.position.y,z:f.position.z,vy:1.5+Math.random(),vx:(Math.random()-.5)*.6,life:6})}
      const P=this.smk.geometry.attributes.position.array;let i=0;this.smkP=sp.filter(q=>(q.life-=dt)>0);for(const q of this.smkP){q.y+=q.vy*dt;q.x+=q.vx*dt;P[i*3]=q.x;P[i*3+1]=q.y;P[i*3+2]=q.z;i++}this.smk.geometry.setDrawRange(0,i);this.smk.geometry.attributes.position.needsUpdate=true}}
  addWear(){this.wearDone=true;// (27) gramado gasto na pequena área, na marca do pênalti e no círculo central
    const tex=canvasTex(128,128,(g,w,h)=>{for(let i=0;i<260;i++){const x=w/2+(Math.random()-.5)*w*.8,y=h/2+(Math.random()-.5)*h*.8,r=2+Math.random()*6;const d=Math.hypot(x-w/2,y-h/2)/(w/2);g.fillStyle=`rgba(${110+Math.random()*30|0},${95+Math.random()*25|0},60,${.22*(1-d)})`;g.beginPath();g.arc(x,y,r,0,7);g.fill()}});
    const mk=(x,z,sx,sz)=>{const m=new T.Mesh(new T.PlaneGeometry(sx,sz),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.position.set(x,.02,z);m.renderOrder=1;this.s.add(m)};
    for(const sg of [-1,1]){mk(sg*(L/2-3),0,7,12);mk(sg*(L/2-11),0,3.5,3.5)}mk(0,0,6,6)}
  spray(x,z,h){// grama levantada no carrinho
    if(!this.sprG){const n=26*6;const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));
      this.sprM=new T.Points(g,new T.PointsMaterial({size:.11,vertexColors:true,transparent:true,opacity:.95,depthWrite:false}));this.sprM.frustumCulled=false;this.s.add(this.sprM);this.sprG=g;this.sprP=[];this.sprN=n}
    const fx=Math.sin(h),fz=Math.cos(h);for(let i=0;i<26;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*2.6;const dirt=Math.random()<.3;
      this.sprP.push({x:x+fx*.4,y:.05,z:z+fz*.4,vx:fx*sp*1.3+Math.cos(a)*sp*.5,vy:1.2+Math.random()*2.2,vz:fz*sp*1.3+Math.sin(a)*sp*.5,life:.55+Math.random()*.45,c:dirt?[.45,.33,.2]:[.3+Math.random()*.15,.62+Math.random()*.15,.25]})}
    if(this.sprP.length>this.sprN)this.sprP.splice(0,this.sprP.length-this.sprN)}
  sprayStep(dt){if(!this.sprG)return;const P=this.sprG.attributes.position.array,C=this.sprG.attributes.color.array;let i=0;
    this.sprP=this.sprP.filter(q=>(q.life-=dt)>0);for(const q of this.sprP){q.vy-=9.8*dt;q.x+=q.vx*dt;q.y=Math.max(.02,q.y+q.vy*dt);q.z+=q.vz*dt;q.vx*=.96;q.vz*=.96;
      P[i*3]=q.x;P[i*3+1]=q.y;P[i*3+2]=q.z;C[i*3]=q.c[0];C[i*3+1]=q.c[1];C[i*3+2]=q.c[2];i++}
    for(let j=i;j<this.sprN;j++){P[j*3+1]=-50}this.sprG.attributes.position.needsUpdate=true;this.sprG.attributes.color.needsUpdate=true;this.sprG.setDrawRange(0,Math.max(1,i))}
  screenOf(id,z){const P=this.pl.get(id);if(!P||!P.root.visible)return null;const v=new T.Vector3(P.root.position.x,z,P.root.position.z).project(this.cam);return [(v.x+1)/2*this.w,(1-v.y)/2*this.h,v.z<1]}
  project(x,y,z){const p=new T.Vector3(wx(x),z,wz(y)).project(this.cam);return [(p.x+1)/2*this.w,(1-p.y)/2*this.h,p.z<1]}
  dispose(){try{this.r.dispose();this.cv.remove()}catch(e){}}
}
