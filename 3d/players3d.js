// FUTBOL — jogadores 3D v3 (modelos gerados no Magnific, esqueleto UE transferido): corpo humano realista (Quaternius Universal Base Characters, CC0)
// com animações de captura (Universal Animation Library, CC0) + ajustes procedurais (chute, goleiro, quedas)
import * as T from './three.module.min.js';
import {GLTFLoader} from './GLTFLoader.js';
import {clone as skClone} from './SkeletonUtils.js';

const SKIN=['#f1c7a5','#d9a57c','#b77b52','#8a5636','#5e3a22'],HAIR=['#1b1410','#3b2416','#6b4a2a','#141414','#2a1a10','#c9a06a'];
let ASSET=null;const MXV=6;
// aparências padrão (sem informação do jogador): modelos 1, 4 e 5. Os de pele negra (2, 3 e 6) só para quem for marcado assim
export const DEF_LOOK=[0,3,4];
const WAIST_DAMP=.7;// 70% da torção da coluna é removida
export const MODELS=[{f:'pl1.glb?v=4',skin:'#ae7d67'},{f:'pl2.glb?v=1',skin:'#644433'},{f:'pl3.glb?v=1',skin:'#664431'},{f:'pl4.glb?v=1',skin:'#a57a63'},{f:'pl5.glb?v=1',skin:'#835845'},{f:'pl6.glb?v=1',skin:'#563829'}];

// regiões do corpo por osso dominante: 0 pele,1 camisa,2 calção,3 meião,4 chuteira,5 cabelo,6 gola,7 sola/detalhe chuteira
function regions(geo){
  const si=geo.attributes.skinIndex,sw=geo.attributes.skinWeight,pos=geo.attributes.position,n=pos.count,R=new Float32Array(n);
  return {R,si,sw,pos,n};
}

// tecido: suaviza a malha sob a camisa/calção (some o "músculo pintado") e dá volume de pano
function clothW(x,y,z){const ax=Math.abs(x);
  const tY=1.48+.14*Math.min(1,Math.max(0,(ax-.065)/.075));if(ax<.235&&y>.95&&y<tY-.01)return 1;if(ax>.18&&ax<.355&&y>1.34&&y<1.57)return 1;if(ax<.27&&y>.70&&y<=.95)return 1;return 0}
function clothify(g){
  const pos=g.attributes.position,n=pos.count,idx=g.index?g.index.array:null;if(!idx)return;
  const id=new Int32Array(n),mp=new Map();let m=0;
  for(let i=0;i<n;i++){const k=Math.round(pos.getX(i)*2e3)+'_'+Math.round(pos.getY(i)*2e3)+'_'+Math.round(pos.getZ(i)*2e3);let v=mp.get(k);if(v===undefined){v=m++;mp.set(k,v)}id[i]=v}
  const P=new Float32Array(m*3);for(let i=0;i<n;i++){const v=id[i]*3;P[v]=pos.getX(i);P[v+1]=pos.getY(i);P[v+2]=pos.getZ(i)}
  const nb=Array.from({length:m},()=>new Set());
  for(let t=0;t<idx.length;t+=3){const a=id[idx[t]],b=id[idx[t+1]],c=id[idx[t+2]];nb[a].add(b).add(c);nb[b].add(a).add(c);nb[c].add(a).add(b)}
  const N=nb.map(s=>Int32Array.from(s));
  let w=new Float32Array(m);for(let v=0;v<m;v++)w[v]=clothW(P[v*3],P[v*3+1],P[v*3+2]);
  for(let it=0;it<4;it++){const w2=new Float32Array(m);for(let v=0;v<m;v++){let s=w[v];for(const u of N[v])s+=w[u];w2[v]=s/(N[v].length+1)}w=w2}
  for(let v=0;v<m;v++)w[v]=Math.min(1,Math.max(0,(w[v]-.55)*2.4));
  let S=P.slice();const step=(lam)=>{const S2=S.slice();for(let v=0;v<m;v++){if(w[v]<=0||!N[v].length)continue;let ax=0,ay=0,az=0;for(const u of N[v]){ax+=S[u*3];ay+=S[u*3+1];az+=S[u*3+2]}const k=N[v].length,f=lam*w[v];
    S2[v*3]+=(ax/k-S[v*3])*f;S2[v*3+1]+=(ay/k-S[v*3+1])*f;S2[v*3+2]+=(az/k-S[v*3+2])*f}S=S2};
  for(let it=0;it<18;it++){step(.6);step(-.63)}
  const nrm=(A)=>{const NN=new Float32Array(m*3);for(let t=0;t<idx.length;t+=3){const a=id[idx[t]],b=id[idx[t+1]],c=id[idx[t+2]];
      const ux=A[b*3]-A[a*3],uy=A[b*3+1]-A[a*3+1],uz=A[b*3+2]-A[a*3+2],vx=A[c*3]-A[a*3],vy=A[c*3+1]-A[a*3+1],vz=A[c*3+2]-A[a*3+2];
      const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx;for(const q of [a,b,c]){NN[q*3]+=cx;NN[q*3+1]+=cy;NN[q*3+2]+=cz}}
    for(let v=0;v<m;v++){const l=Math.hypot(NN[v*3],NN[v*3+1],NN[v*3+2])||1;NN[v*3]/=l;NN[v*3+1]/=l;NN[v*3+2]/=l}return NN};
  const NS=nrm(S);
  const D=new Float32Array(n*3),CN=new Float32Array(n*3),on=g.attributes.normal;
  for(let i=0;i<n;i++){const v=id[i],ww=w[v],off=.011*ww;
    D[i*3]=S[v*3]-P[v*3]+NS[v*3]*off;D[i*3+1]=S[v*3+1]-P[v*3+1]+NS[v*3+1]*off;D[i*3+2]=S[v*3+2]-P[v*3+2]+NS[v*3+2]*off;
    let nx=on.getX(i)*(1-ww)+NS[v*3]*ww,ny=on.getY(i)*(1-ww)+NS[v*3+1]*ww,nz=on.getZ(i)*(1-ww)+NS[v*3+2]*ww;const l=Math.hypot(nx,ny,nz)||1;CN[i*3]=nx/l;CN[i*3+1]=ny/l;CN[i*3+2]=nz/l}
  g.setAttribute('cloD',new T.BufferAttribute(D,3));g.setAttribute('cloN',new T.BufferAttribute(CN,3));
}
// olhos: esclera clara + íris escura (cores por vértice)
function eyeColors(g,F){const pos=g.attributes.position,n=pos.count,C=new Float32Array(n*3);
  for(const sg of [-1,1]){let cx=0,cy=0,cz=0,k=0,zm=-9;for(let i=0;i<n;i++)if(Math.sign(pos.getX(i))===sg){cx+=pos.getX(i);cy+=pos.getY(i);cz+=pos.getZ(i);k++}
    if(!k)continue;cx/=k;cy/=k;cz/=k;let r=0;for(let i=0;i<n;i++)if(Math.sign(pos.getX(i))===sg){r=Math.max(r,Math.hypot(pos.getX(i)-cx,pos.getY(i)-cy,pos.getZ(i)-cz))}
    for(let i=0;i<n;i++)if(Math.sign(pos.getX(i))===sg){const f=((pos.getX(i)-cx)*F.x+(pos.getY(i)-cy)*F.y+(pos.getZ(i)-cz)*F.z)/(r||1);const c=f>.6?[.04,.03,.025]:f>.48?[.18,.11,.07]:[.6,.56,.52];C.set(c,i*3)}}
  g.setAttribute('color',new T.BufferAttribute(C,3))}
export async function loadAssets(url){
  if(ASSET)return ASSET;
  const L=new GLTFLoader();const all=await Promise.all([...MODELS.map(x=>x.f),'a1.glb','a2.glb'].map(f=>L.loadAsync(url+f).catch(e=>null)));
  const a2=all.pop(),a1=all.pop();const mods=[];all.forEach((g,i)=>{if(!g)return;let bd=null;g.scene.traverse(o=>{if(o.isSkinnedMesh&&/Player/i.test(o.name))bd=o});
    if(!bd)return;const tx=bd.material&&bd.material.map;if(tx){tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4}mods.push({scene:g.scene,tex:tx,skin:MODELS[i].skin,i})});
  const m={scene:mods[0].scene};
  const clips={};for(const c of [...a1.animations,...a2.animations])clips[c.name]=c;
  // classifica cada vértice do corpo (camisa, calção, meião...) a partir do esqueleto
  let body=null;m.scene.traverse(o=>{if(o.isSkinnedMesh&&/Player/i.test(o.name))body=o});
  const bones=body.skeleton.bones.map(b=>b.name);const g=body.geometry;const {R,si,sw,pos,n}=regions(g);
  for(let i=0;i<n;i++){let bi=0,bw=-1;for(let k=0;k<4;k++){const w=sw.getComponent(i,k);if(w>bw){bw=w;bi=si.getComponent(i,k)}}
    const b=bones[bi]||'',x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);let r=0;
    if(/foot|ball/.test(b))r=y<.014?7:4;
    else if(/calf/.test(b))r=y<.5?3:0;
    else if(/thigh/.test(b))r=y>.70?2:0;
    else if(/pelvis|spine_01/.test(b))r=y<1.0?2:1;
    else if(/spine_02|spine_03|clavicle/.test(b))r=1;
    else if(/upperarm/.test(b))r=Math.abs(x)<.36?1:0;
    else if(/neck/.test(b))r=y<1.49?6:0;
    else if(/Head/.test(b))r=0;
    if(r===1&&y>1.47&&Math.abs(x)<.09&&z>-.02)r=6;// gola
    R[i]=r}
  g.setAttribute('region',new T.BufferAttribute(R,1));
  let tex=null;body.material&&(tex=body.material.map);if(tex){tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4}
  // animações de captura do Mixamo (retargetadas para o esqueleto do jogador)
  const MX={};try{const [mj,mb]=await Promise.all([fetch(url+'mx.json?v='+MXV).then(r=>r.json()),fetch(url+'mx.bin?v='+MXV).then(r=>r.arrayBuffer())]);const I16=new Int16Array(mb);
    for(const nm in mj.clips){const c=mj.clips[nm];const tr=[];const times=new Float32Array(c.n);for(let i=0;i<c.n;i++)times[i]=i/c.fps;
      mj.bones.forEach((b,bi)=>{const v=new Float32Array(c.n*4);const o=c.off+bi*c.n*4;for(let i=0;i<c.n*4;i++)v[i]=I16[o+i]/32767;tr.push(new T.QuaternionKeyframeTrack(b+'.quaternion',times,v))});
      clips[nm]=new T.AnimationClip(nm,c.dur,tr);MX[nm]=c}}catch(e){console.warn('mx',e)}
  ASSET={scene:m.scene,clips,tex,MX,models:mods};return ASSET;
}

// ---------- materiais ----------
const matCache=new Map();
function numTex(n){// (26) número nítido de perto: textura 256 px com contorno
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.font='800 208px "Barlow Condensed",Arial Narrow,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.lineJoin='round';g.lineWidth=10;g.strokeStyle='rgba(255,255,255,.55)';g.strokeText(String(n||''),128,140);g.fillStyle='#fff';g.fillText(String(n||''),128,140);const t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function bodyMat(kit,skin,hair,style,boot,bootAcc,num,gk,MD){MD=MD||ASSET.models[0];
  const key=[kit.c1,kit.c2,kit.c3,kit.pat,kit.sh,boot,num,gk,MD.i].join('|');if(matCache.has(key))return matCache.get(key);
  const m=new T.MeshStandardMaterial({map:MD.tex,roughness:.78,metalness:0});
  const U={c1:{value:new T.Color(kit.c1)},c2:{value:new T.Color(kit.c2||kit.c1)},cs:{value:new T.Color(kit.sh||kit.c2||'#111')},ck:{value:new T.Color(kit.c3||kit.c2||'#fff')},
    sk:{value:new T.Color(MD.skin)},bt:{value:new T.Color(boot)},ba:{value:new T.Color(bootAcc)},skb:{value:new T.Color(MD.skin)},
    pat:{value:['liso','listras','listras_h','faixa','faixa_h','metade'].indexOf(kit.pat||'liso')},numT:{value:numTex(num)},gl:{value:gk?1:0},glc:{value:new T.Color(kit.c2||'#222')}};
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vKP;attribute float _kp;varying float vKp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvKP=position;vKp=_kp;');
    s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vKP;varying float vKp;uniform vec3 c1,c2,cs,ck,sk,bt,ba,skb,glc;uniform int pat;uniform sampler2D numT;uniform float gl;')
     .replace('#include <map_fragment>',`#include <map_fragment>
      {vec3 t=diffuseColor.rgb;float y=vKP.y,ax=abs(vKP.x);
       float mx=max(t.r,max(t.g,t.b)),mn=min(t.r,min(t.g,t.b));float lum=dot(t,vec3(.299,.587,.114));
       float sat=(mx-mn)/max(mx,.02);float wh=smoothstep(.2,.1,sat)*smoothstep(.08,.2,lum);// pano branco do uniforme (inclui as dobras na sombra)
       float shade=clamp(pow(lum/.9,1.3),0.,1.1);
       bool KS=vKp>.5&&vKp<1.5,KH=vKp>1.5;if(KS||KH)wh=1.;
       vec3 col=t;
       // pele/cabelo: ajusta o tom de pele do jogador
       vec3 tint=sk/max(skb,vec3(.05));col=mix(t,t*tint,(1.-wh)*step(.13,y));
       if(KS||(y>1.0&&!KH)){float u=clamp((vKP.x+.2)/.4,0.,1.),v=clamp((y-1.0)/.52,0.,1.);float k=0.;
         if(pat==1)k=step(.5,fract(u*2.5+.25));else if(pat==2)k=step(.5,fract(v*3.+.25));else if(pat==3)k=step(abs(u-(1.-v)*.9-.05),.16);else if(pat==4)k=step(abs(v-.55),.12);else if(pat==5)k=step(.5,u);
         vec3 sc=mix(c1,c2,k);if(ax>.31)sc=c2;
         if(vKP.z<-.02&&ax<.13&&y>1.14&&y<1.42){vec2 nuv=vec2(.5-vKP.x/.26,(y-1.14)/.28);vec4 nt=texture2D(numT,nuv);sc=mix(sc,c2==c1?vec3(1.)-c1:c2,nt.a);}
         if(gl>.5&&ax>.62)sc=glc;
         col=mix(col,sc*shade,wh);}
       else if(KH||y>.5)col=mix(col,cs*shade,wh);
       else if(y>.12)col=mix(col,ck*shade,wh);
       else col=mix(col,bt*(.5+lum*1.6),smoothstep(.35,.1,lum)*step(y,.12));
       if(gl>.5&&ax>.62&&y>1.2)col=mix(glc,vec3(1.),.2)*(.6+lum*.5);
       diffuseColor.rgb=col;}`)};
  m.customProgramCacheKey=()=>'kitM';matCache.set(key,m);return m}

const V3=(x,y,z)=>new T.Vector3(x,y,z),X=V3(1,0,0),Y=V3(0,1,0),Z=V3(0,0,1);
const LOCO=[['Idle_Loop',0,0],['Walk_Loop',1.4,1.86],['Jog_Fwd_Loop',3.4,3.15],['Sprint_Loop',7,4.7]];
export function makePlayer(o){
  const root=new T.Group();const body=new T.Group();root.add(body);const MS=ASSET.models;const MD=MS[o.model!=null?o.model%MS.length:DEF_LOOK[((o.head||0)*3+(o.num||0)*5+(o.skin||0))%DEF_LOOK.length]%MS.length];const model=skClone(MD.scene);body.add(model);
  const skin=SKIN[(o.skin||0)%5],hair=HAIR[((o.hair||0)+(o.head||0))%HAIR.length],kit=o.kit,style=((o.head||0)*3+(o.hair||0))%4;
  const mat=bodyMat(kit,skin,hair,style,o.boot||'#141414',o.bootAcc||'#f4f4f4',o.num,o.gk,MD);
  model.traverse(m=>{if(!m.isSkinnedMesh)return;m.frustumCulled=false;m.castShadow=true;
    if(/Player/i.test(m.name))m.material=mat;else m.visible=false});
  root.updateMatrixWorld(true);
  // cabelo volumoso (black power) para alguns
  const B={};model.traverse(b=>{if(b.isBone)B[b.name]=b});
  /* ossos sujeitos ao limitador (todos menos dedos) e estado do relógio visual */
  const LB=Object.values(B).filter(b=>!/_0[123]_|thumb|index|middle|ring|pinky/.test(b.name));const PQ=new Map();let spKey=null,spR=0;
  // mão relaxada: dedos levemente dobrados (o modelo vem de mão espalmada)
  const FG=[];{const fax=[0,0,1];for(const sd of ['l','r'])for(const f of ['index','middle','ring','pinky'])for(const k of [1,2,3]){const b=B[f+'_0'+k+'_'+sd];if(!b)continue;const ang=(k===1?.55:k===2?.75:.5)*(f==='index'?.8:f==='pinky'?1.1:1);FG.push([b,new T.Quaternion().setFromAxisAngle(new T.Vector3(...fax),ang*(sd==='l'?1:-1)*((window.__fsg)||1))])}
  }
  root.updateMatrixWorld(true);
  // cabelo volumoso (black power) para alguns jogadores de pele escura
  if(false){const hm=new T.MeshStandardMaterial({color:hair,roughness:1});const h=new T.Mesh(new T.SphereGeometry(.125,20,14),hm);h.castShadow=true;
    const hb=new T.Object3D();B.Head.add(hb);hb.quaternion.copy(B.Head.getWorldQuaternion(new T.Quaternion()).invert().multiply(body.getWorldQuaternion(new T.Quaternion())));hb.add(h);h.position.set(0,.115,-.03);h.scale.set(1.02,.82,1.08)}
  // animações
  const mixer=new T.AnimationMixer(model);const act={};for(const k in ASSET.clips){const a=mixer.clipAction(ASSET.clips[k]);a.play();a.setEffectiveWeight(0);act[k]=a}
  // pose de referência para ajustes no espaço do corpo
  body.updateMatrixWorld(true);const inv=body.getWorldQuaternion(new T.Quaternion()).invert();
  const tq=new T.Quaternion(),tq2=new T.Quaternion(),pq=new T.Quaternion(),ax=new T.Vector3();
  // gira um osso no espaço do personagem (x=esquerda, y=cima, z=frente), por cima do que a animação já fez
  function rot(name,list,amt=1){const b=B[name];if(!b||amt<=0)return;tq.identity();for(const [a,ang] of list){tq2.setFromAxisAngle(ax.copy(a),ang*amt);tq.premultiply(tq2)}
    pq.identity();let p=b.parent;const chain=[];while(p&&p!==body){chain.push(p);p=p.parent}for(let i=chain.length-1;i>=0;i--)pq.multiply(chain[i].quaternion);
    const pinv=pq.clone().invert();b.quaternion.premultiply(pinv.multiply(tq).multiply(pq))}
  let lastT=null,lastR=null,phase=Math.random(),wPrev={};
  const SPAX={};for(const [k,c] of [['spine_01','spine_02'],['spine_02','spine_03'],['spine_03','neck_01']]){if(B[k]&&B[c]){const v=B[c].position.clone();if(v.lengthSq()>1e-8)SPAX[k]=v.normalize()}}
  const tw=new T.Quaternion(),tinv=new T.Quaternion(),sw=new T.Quaternion(),QI=new T.Quaternion();
  const W=(k,w,time)=>{const a=act[k];if(!a||w<=0)return;a.enabled=true;a.setEffectiveWeight(w);if(time!=null)a.time=time};
  const sm=x=>x<0?0:x>1?1:x*x*(3-2*x);
  // ---------- biblioteca de movimentos (Mixamo) ----------
  const MX=ASSET.MX||{};const names=Object.keys(MX);
  const F=(...subs)=>{for(const sb of subs){const n=names.find(k=>k.toLowerCase().includes(sb.toLowerCase())&&!k.endsWith('_M'));if(n)return n}return null};
  const side=(n,want)=>{if(!n)return null;const m=MX[n];if(!m)return n;return m.foot===want?n:(MX[n+'_M']?n+'_M':n)};
  const A={idle:F('offensive_idle','lx_Breathing_Idle'),walk:F('lx_Walking'),jog:F('jog_forward'),run:F('lx_Running'),sprint:F('lx_Sprint','lx_Fast_Run'),
    back:F('jog_backward'),strL:F('jog_strafe_left'),strR:F('jog_strafe_right'),
    pass:F('lx_Soccer_Pass','kick_soccerball'),shot:F('strike_foward','soccer_penalty_kick'),long:F('lx_Chip','soccer_penalty_kick'),pen:F('soccer_penalty_kick'),
    head:F('lx_Header','header_soccerball'),scissor:F('scissor_kick'),trap:F('lx_Receive','receive_soccerball'),thigh:F('mx27_kneeing'),spin:F('lx_Soccer_Spin'),volley:F('lx_Chip'),
    tackle:F('mx37_soccer_tackle','soccer_tackle'),trip:F('soccer_trip'),fallen:F('fallen_idle'),getup:F('standing_up','lx_Getting_Up'),stumble:F('lx_Stumble'),
    gkIdle:F('goalkeeper_idle'),gkDive:F('mx19_goalkeeper_diving','goalkeeper_diving'),gkDive2:F('mx20_goalkeeper_diving'),gkCatch:F('mx17_goalkeeper_catch','goalkeeper_catch'),gkCatchHi:F('mx04_goalkeeper_catch','mx05_goalkeeper_catch','goalkeeper_catch'),
    gkBlock:F('goalkeeper_body_block'),gkThrow:F('goalkeeper_overhand'),gkKick:F('goalkeeper_drop_kick'),gkSide:F('goalkeeper_sidestep'),gkScoop:F('goalkeeper_scoop'),
    throwIn:F('throw_in'),sit:F('lx_Sitting_Idle'),clap:F('lx_Clapping'),
    cele:[F('lx_Victory'),F('lx_Fist_Pump'),F('lx_Jumping'),F('lx_Cheering'),F('lx_Victory')],sad:F('lx_Disappointed'),refIdle:F('lx_Breathing_Idle','offensive_idle'),turn:F('lx_Running_To_Turn'),drib:F('lx_Soccer_Dribble'),
    GK:{dive:F('mx20_goalkeeper_diving'),dive2:F('mx19_goalkeeper_diving'),block:F('goalkeeper_body_block'),catchH:F('mx07_goalkeeper_catch'),catchM:F('mx05_goalkeeper_catch'),catchL:F('mx04_goalkeeper_catch'),scoop:F('goalkeeper_scoop'),miss:F('goalkeeper_miss')}};
  const HAS=!!(A.idle&&A.jog);
  // [clipe, velocidade natural (m/s), metros por ciclo de passada] — medidos no pé de apoio de cada clipe (sem patinar)
  const LOC=HAS?[[A.idle,0,1],[A.walk,1.6,1.80],[A.jog,3.0,2.02],[A.run,5.2,3.59],[A.sprint,7.2,2.99]].filter(x=>x[0]&&MX[x[0]]):null;
  const rootAt=(n,t)=>{const m=MX[n];if(!m)return [0,0,0];const f=Math.max(0,Math.min(m.n-1.001,t*m.fps));const i=f|0,u=f-i;const L=(arr)=>arr[i]+(arr[Math.min(m.n-1,i+1)]-arr[i])*u;return [L(m.hx)-m.hx[0],L(m.hy),L(m.hz)-m.hz[0]]};
  let RX=0,RY=0,RZ=0;
  const TG=new Map(),CW=new Map(),CT=new Map();
  const P=(n,w,time,root)=>{if(!n||w<=0||!act[n])return false;const a=act[n],d=a.getClip().duration;const tt=Math.max(0,Math.min(d-1e-3,time));TG.set(n,(TG.get(n)||0)+w);CT.set(n,tt);a.time=tt;
    const r=rootAt(n,a.time);RY+=r[1]*w;if(root===2){RX+=r[0]*w*.35;RZ+=r[2]*w*.35}return true};
  // chute em segundos reais: arma (~0,26 s até o contato) e acompanha o movimento depois
  const kickS=(n,k,lead)=>{const m=MX[n];if(!m)return 0;const s=k*.6;const adv=lead>.1?.2:0;/* o contato visual do pé vinha ~0,15 s depois da saída da bola */return Math.max(0,Math.min(m.dur-.02,m.hit-lead*1.3+s*1.3+adv))};
  const kickT=(n,k)=>{const m=MX[n];if(!m)return 0;const h=Math.min(m.hit,m.dur*.9);return k<.45?h*(k/.45):h+(m.dur-h)*((k-.45)/.55)};
  const lpPh={};
  function pose(p){
    const t=p.t||0;const dtS=lastT==null?0:Math.min(.4,Math.max(0,t-lastT));lastT=t;
    // tempo real x tempo do jogo: em 2x/4x o jogo corre, mas o corpo se mexe no máximo 1,6x (nada de pular de pose em pose)
    const nowR=performance.now()/1000;const rdt=lastR==null?0:Math.min(.1,Math.max(0,nowR-lastR));lastR=nowR;
    const spd=rdt>.002?Math.max(.2,Math.min(8,dtS/rdt)):1;const fast=spd>1.3;
    const dt=fast?Math.min(dtS,rdt*1.6):Math.min(.1,dtS);const fdt=fast?rdt:dt;
    for(const k in act){act[k].enabled=false;act[k].setEffectiveWeight(0)}
    body.rotation.set(0,0,0);body.position.set(0,0,0);RX=RY=RZ=0;TG.clear();
    const mv=p.mv??0,sp=mv*7.2;let special=p.anim&&p.anim.k;let an=p.anim?p.anim.a:0;let locoW=1;
    /* relógio visual: o movimento especial anda no tempo real (no máximo 1,6x), mesmo com o jogo em 2x/4x */
    {const key=special?special+'|'+(p.anim.t??''):null;if(key!==spKey){spKey=key;spR=0}if(special){spR+=fdt*1.6*(fast?1:Math.max(1,spd));an=Math.min(an,fast?spR:an)}}
    /* acelerado: sem os movimentos curtos (tropeço, ombrada, lamento) que viravam troca de pose a cada quadro */
    if(fast&&spd>1.6&&(special==='beaten'||special==='stumble'||special==='shoulder'||special==='lament'))special=null;
    const leftK=!!p.left,FT=leftK?'l':'r',K=leftK?'_l':'_r',O=leftK?'_r':'_l';
    if(!HAS){legacy(p,t,dt,sp);return}
    // ---------- ações especiais (substituem a locomoção) ----------
    if(p.sit){P(A.sit||A.refIdle,1,(t*.6)%((MX[A.sit]||{dur:4}).dur));locoW=0}
    else if(p.cele&&sp<.45){// comemora parado; correndo, usa a corrida normal (nada de deslizar na pose de comemoração)
      const c=A.cele[(p.cele-1)%5]||A.cele[0];const m=MX[c];if(m){P(c,1,(t*.9)%m.dur);locoW=0}}
    else if((special==='beaten'||special==='stumble')&&A.stumble&&an<.8){const m=MX[A.stumble];P(A.stumble,1,Math.min(m.dur-.02,an*1.3));locoW=0}// driblado / perdeu a bola: tropeça
    else if(special==='lament'&&A.sad){P(A.sad,1,Math.min(MX[A.sad].dur-.05,an*.9));locoW=0}
    else if(special==='slide'&&A.tackle){const n=side(A.tackle,FT);const m=MX[n];P(n,1,Math.min(m.dur-.02,an*1.45));locoW=0}
    else if(special==='fall'){const tr=A.trip||A.stumble;const d1=(MX[tr]?MX[tr].dur:1)/1.25;if(an<d1)P(tr,1,an*1.25);else if(an<d1+.3&&A.fallen)P(A.fallen,1,an-d1);else if(A.getup)P(A.getup,1,(an-d1-.3)*2.1);locoW=0}
    else if(special==='punch'&&A.gkBlock){P(A.gkBlock,1,kickT(A.gkBlock,Math.min(1,an/.7)),true);locoW=0}
    else if((special==='catch'||special==='catchHigh')&&A.gkCatch){const c=special==='catchHigh'?A.gkCatchHi:A.gkCatch;P(c,1,MX[c].hit*.6+an*.9,false);locoW=0}
    else if(p.gkA&&A.GK[p.gkA.kind]){// goleiro: movimento escolhido pela leitura do chute, sincronizado com a chegada da bola
      const g=p.gkA;let n=A.GK[g.kind];if(g.kind==='dive'&&A.GK.dive2&&(g.reach<2.2))n=A.GK.dive2;
      const m0=MX[n];const hi=Math.max(1,Math.round(m0.hit*m0.fps));const dirX=Math.sign(m0.hx[Math.min(m0.n-1,hi)]-m0.hx[0])||1;
      const lateral=g.kind==='dive'||g.kind==='block';if(lateral&&dirX!==g.side&&MX[n+'_M'])n=n+'_M';
      const m=MX[n];const pre=g.pre*g.pre*(3-2*g.pre);const ct=Math.min(m.dur-.02,m.hit*pre+g.post*1.05);P(n,1,ct);
      if(lateral){const hx=rootAt(n,m.hit)[0];const sc=Math.max(.5,Math.min(1.8,g.reach/Math.max(.3,Math.abs(hx))));const after=g.post-(m.dur-m.hit);const fade=after>0?Math.max(0,1-after/.7):1;
        RX+=rootAt(n,ct)[0]*sc*fade}
      locoW=0}
    else if(p.dive||special==='parry'){const d=p.dive||(p.anim&&p.anim.side)||-1;const sg=Math.sign(d)||1;const k=p.dive?Math.min(1,Math.abs(p.dive)):Math.min(1,an/.5);
      // escolhe o mergulho para o lado certo (pelo deslocamento da raiz do clipe)
      let n=(p.diveH||0)>.5&&A.gkDive2?A.gkDive2:A.gkDive;const m=MX[n];const hit=m?m.hit:1;const dirX=m?Math.sign(m.hx[Math.min(m.n-1,Math.round(hit*m.fps))]-m.hx[0]):1;
      if(dirX!==sg&&MX[n+'_M'])n=n+'_M';P(n,1,hit*k+(special==='parry'?an*.5:0),true);locoW=0}
    else if(p.throwPrep||(p.kk==='throw'&&p.kick)){const n=A.throwIn;if(n){const m=MX[n];P(n,1,p.kick?m.dur*(.45+.5*p.kick):m.dur*.3);locoW=0}}
    else if(p.kk==='gthrow'&&p.kick&&A.gkThrow){const m=MX[A.gkThrow];P(A.gkThrow,1,m.dur*(.3+.6*p.kick));locoW=0}
    else if(o.gk&&p.side&&sp>.3&&sp<4&&A.gkSide&&!p.own){// goleiro se deslocando de lado na linha do gol
      const n=p.side>0?A.gkSide:(MX[A.gkSide+'_M']?A.gkSide+'_M':A.gkSide);const m=MX[n];lpPh.g=((lpPh.g||0)+dt*sp/(Math.max(.8,Math.abs(m.v||2))*m.dur))%1;P(n,1,lpPh.g*m.dur);locoW=0}
    else if((p.ready||p.crouch||p.hold)&&A.gkIdle&&sp<1.2){P(A.gkIdle,1,(t*.8)%MX[A.gkIdle].dur);locoW=sp/1.2}
    else if(p.refIdle&&sp<.3){P(A.refIdle,1,(t*.5)%MX[A.refIdle].dur);locoW=0}
    // ---------- chute / cabeceio (por cima da locomoção, com entrada e saída suaves) ----------
    let kw=0;
    if(p.skill&&p.skill.k==='bike'){}
    else if(p.kick&&!(p.kk==='throw'||p.kk==='gthrow')){const k=p.kick;const base=p.kk==='head'?A.head:p.kk==='pass'?A.pass:p.kk==='long'||p.kk==='cross'?A.long:A.shot;
      let b2=base;
      const n=side(b2,FT);if(n){const big=b2===A.scissor;kw=big?1:Math.min(1,k/.13,(1-k)/.25);kw=Math.max(0,Math.min(1,kw));kw=kw*kw*(3-2*kw);P(n,kw,big?MX[n].hit*Math.min(1,k/.5)+Math.max(0,k-.5)*1.6:kickS(n,k,p.kk==='head'?.04:.26));if(big)locoW=0}}
    if(p.skill&&p.skill.k==='bike'&&A.scissor){// bicicleta: sobe, chuta no alto, cai e levanta (sem cortar no meio)
      const n=side(A.scissor,FT);const m=MX[n];const a=p.skill.a;kw=1;P(n,1,Math.min(m.dur-.02,a<.3?m.hit*(.5+a/.6):m.hit+(a-.3)*1.05));locoW=0}
    else if(p.kick){}
    else if(p.skill&&p.skill.k==='spin'&&A.spin&&!(fast&&spd>1.6)){const m=MX[A.spin];kw=Math.min(1,p.skill.a/.12,(1.2-p.skill.a)/.2);kw=Math.max(0,Math.min(1,kw));P(A.spin,kw,Math.min(m.dur-.02,p.skill.a*m.dur/1.2))}
    else if(special==='shoulder'&&A.pass&&an<.6){const n=side(A.pass,FT);const k=Math.min(1,an/.6);kw=Math.min(1,k/.15,(1-k)/.3);kw=Math.max(0,kw);kw=kw*kw*(3-2*kw);P(n,kw,kickT(n,k))}// desarme em pé: estica a perna na bola
    else if(fast&&spd>1.6&&p.trap){}
    else if(p.trap==='thigh'&&A.thigh){kw=.7;P(A.thigh,kw,MX[A.thigh].hit*.9)}
    else if(p.trap&&A.trap){kw=.6;P(A.trap,kw,MX[A.trap].hit*.8)}
    else if(p.jump&&!o.gk&&A.head){kw=1;P(A.head,1,MX[A.head].hit*.85);RY+=.28;locoW=0}
    // ---------- locomoção: mistura por velocidade com passada sincronizada ----------
    const lw=locoW*(1-kw);
    if(lw>0){
      if(p.back&&sp>.4&&A.back){const m=MX[A.back];const v=Math.max(.8,Math.abs(m.v));lpPh.b=((lpPh.b||0)+dt*sp/(v*m.dur))%1;P(A.back,lw,lpPh.b*m.dur)}
      else if(p.side&&sp>.4&&(A.strL||A.strR)){const n=p.side>0?A.strL:A.strR;const m=MX[n];lpPh.s=((lpPh.s||0)+dt*sp/(Math.max(.8,Math.abs(m.v||2))*m.dur))%1;P(n,lw,lpPh.s*m.dur)}
      else if(p.own&&sp>.8&&sp<6.2&&A.drib&&!p.noDrib){// conduzindo a bola: corrida com toques (mistura com o sprint quando acelera)
        const m=MX[A.drib];const dw=Math.max(0,Math.min(1,(5.6-sp)/.6));lpPh.d=((lpPh.d||0)+dt*sp/(4.37*(p.stride||1)))%1;P(A.drib,lw*dw,lpPh.d*m.dur);
        if(dw<1&&A.sprint){phase=(phase+dt*sp/(2.99*(p.stride||1)))%1;P(A.sprint,lw*(1-dw),phase*MX[A.sprint].dur)}}
      else{const sf=p.stride||1;let i=0;while(i<LOC.length-2&&sp>LOC[i+1][1])i++;const a0=LOC[i],a1=LOC[i+1]||a0;let f=a1===a0?0:Math.max(0,Math.min(1,(sp-a0[1])/(a1[1]-a0[1])));if(a1[0]===A.sprint)f=Math.min(f,.55);// o sprint capturado é muito curvado: sempre misturado com a corrida
        const m0=MX[a0[0]],m1=MX[a1[0]];
        // ciclos por segundo: pé travado no chão; acima da velocidade do sprint a passada alonga e a cadência sobe aos poucos
        const rate=c=>{if(!c[1])return 0;const top=c===LOC[LOC.length-1];if(top&&sp>c[1])return c[1]/(c[2]*sf)*Math.pow(sp/c[1],.45);return sp/(c[2]*sf)};
        if(sp<.15){P(LOC[0][0],lw,(t*.6)%MX[LOC[0][0]].dur)}
        else{const r0=rate(a0),r1=rate(a1);phase=(phase+dt*(a0[1]?r0*(1-f)+r1*f:r1))%1;
          if(!a0[1]){P(a0[0],lw*(1-f),(t*.6)%m0.dur);P(a1[0],lw*f,phase*m1.dur)}else{P(a0[0],lw*(1-f),phase*m0.dur);P(a1[0],lw*f,phase*m1.dur)}}}}
    // transição suave entre movimentos (crossfade ~0,15 s): nada de pulo de pose
    {const k=fdt>0?Math.min(1,fdt*(kw>.05||p.kick?30:9)):1;/* no chute a pose responde na hora: o pé encontra a bola no momento certo */let sum=0;const keys=new Set([...TG.keys(),...CW.keys()]);
      for(const n of keys){const tg=TG.get(n)||0;let c=CW.get(n);c=c==null?tg:c+(tg-c)*k;if(c<.01&&tg===0){CW.delete(n);continue}CW.set(n,c);sum+=c}
      for(const n of CW.keys()){const a=act[n];a.enabled=true;a.setEffectiveWeight(CW.get(n)/Math.max(1e-4,sum));if(!TG.has(n))a.time=CT.get(n)??a.time}}
    mixer.update(0);
    // trava a cintura: a coluna pode inclinar, mas quase não torce (nada de tronco virado ao contrário do quadril)
    if(!(special==='slide'||special==='fall'||p.dive||p.gkA||special==='parry'||special==='punch')){for(const k in SPAX){const b=B[k];if(!b)continue;const ax=SPAX[k];const q=b.quaternion;
      const d=q.x*ax.x+q.y*ax.y+q.z*ax.z;tw.set(ax.x*d,ax.y*d,ax.z*d,q.w);const l=Math.hypot(tw.x,tw.y,tw.z,tw.w);if(l<1e-6)continue;tw.x/=l;tw.y/=l;tw.z/=l;tw.w/=l;
      tinv.copy(tw).invert();sw.copy(q).multiply(tinv);tw.slerp(QI,fast?.92:WAIST_DAMP);q.copy(sw).multiply(tw)}}
    body.position.set(RX,RY,RZ);
    // ---------- ajustes finos por cima ----------
    const calm=!!p.cele;// comemorando: sem camadas procedurais (nada de torcer cintura)
    if(p.lean&&!calm)body.rotation.z=p.lean*.35;
    if(p.acc&&!calm&&!special&&!p.dive&&!kw&&lw>.5&&sp<6){const a=Math.max(-.05,Math.min(.07,p.acc*.012))*Math.min(1,sp/2);body.rotation.x=a}
    // virada: tronco e cabeça entram na curva antes das pernas; em giro brusco o corpo abaixa
    // (sem torção de tronco, agachada na virada ou freada procedural: só os movimentos capturados, sem distorcer a cintura)
    if(p.hold&&!p.dive){rot('upperarm_l',[[Z,-.4],[Y,-.5]]);rot('upperarm_r',[[Z,.4],[Y,.5]]);rot('lowerarm_l',[[Y,-1.1]]);rot('lowerarm_r',[[Y,1.1]])}
    if(p.card){rot('upperarm_r',[[Z,-1.9]])}
    if(p.flagUp){rot('upperarm_r',[[Z,-1.8]])}
    if(special==='shoulder'){const e=Math.sin(Math.min(1,an/.5)*Math.PI);body.rotation.z+=.2*e;rot('spine_02',[[Y,.35*e]])}
    /* pedalada: as pernas passam por cima da bola, uma de cada vez, com o corpo balançando para vender a finta */
    if(p.skill&&p.skill.k==='step'&&!(fast&&spd>1.6)){const a=p.skill.a,dur=.6;if(a<dur){const ph=a/dur*2;const lg=Math.floor(ph)%2?'l':'r';const e=Math.sin((ph%1)*Math.PI);const sg=lg==='r'?1:-1;const env=Math.min(1,a/.08,(dur-a)/.1);
      rot('thigh_'+lg,[[X,-.62*e*env],[Z,sg*.5*e*env]]);rot('calf_'+lg,[[X,.55*e*env]]);rot('spine_01',[[Z,-sg*.16*e*env]]);body.rotation.z+=-sg*.1*e*env}}
    if(p.look!=null&&!special&&!p.dive&&!kw&&!calm&&!p.back&&!p.side){const lk=Math.max(-.7,Math.min(.7,p.look));rot('neck_01',[[Y,lk*.18]]);rot('Head',[[Y,lk*.22]])}
    /* limitador de articulações: nenhum osso gira mais rápido que um corpo de verdade (em tempo real).
       É a trava final contra contorção: vale para qualquer velocidade do jogo e qualquer mistura de movimentos */
    {const lim=(kw>.05||p.kick||p.gkA||p.dive)?34:(fast?16:20);const mx=lim*Math.max(1/120,Math.min(.05,rdt||1/60));
      for(const b of LB){const q=b.quaternion;let pq=PQ.get(b);if(!pq){PQ.set(b,q.clone());continue}
        const d=Math.min(1,Math.abs(pq.x*q.x+pq.y*q.y+pq.z*q.z+pq.w*q.w));const ang=2*Math.acos(d);
        if(ang>mx){pq.slerp(q,mx/ang);q.copy(pq)}else pq.copy(q)}}
  }
  function legacy(p,t,dt,sp){let spAnim=sp;
    const special=p.anim&&p.anim.k;let locoW=1;
    // ---------- locomoção com mistura por velocidade e passada sincronizada ----------
    let i=0;while(i<LOCO.length-2&&sp>LOCO[i+1][1])i++;const a0=LOCO[i],a1=LOCO[i+1];const f=Math.max(0,Math.min(1,(sp-a0[1])/(a1[1]-a0[1])));
    const stride=a0[2]*(1-f)+a1[2]*f||1.86;if(sp>.15)phase+=dt*sp/stride*(p.back?-1:1);phase-=Math.floor(phase);
    const idleT=(t*.4)%1;
    const setL=(c,w)=>{if(w<=0)return;const a=act[c[0]];const d=a.getClip().duration;W(c[0],w*locoW,(c[1]?phase:idleT)*d)};
    if(p.sit){W('Sitting_Idle_Loop',1,(t*.6)%act.Sitting_Idle_Loop.getClip().duration);locoW=0}
    else if(p.cele===4){W('Dance_Loop',1,(t)%act.Dance_Loop.getClip().duration);locoW=0}
    else if(p.cele===3){const d=act.Jump_Start.getClip().duration;W('Jump_Start',1,((t*1.3)%1)*d);locoW=0}
    else if(special==='slide'){const a=p.anim.a;const d1=act.Slide_Start.getClip().duration;if(a<d1)W('Slide_Start',1,a);else if(a<d1+.35)W('Slide_Loop',1,(a-d1)%act.Slide_Loop.getClip().duration);else W('Slide_Exit',1,Math.min(act.Slide_Exit.getClip().duration-.01,a-d1-.35));locoW=0}
    else if(special==='fall'){const a=p.anim.a;const d=act.Death01.getClip().duration;if(a<.95)W('Death01',1,Math.min(d*.55,a*1.1));else{const k=Math.min(1,(a-.95)/.55);W('Death01',1-k,d*.55);W('LayToIdle',k,k*act.LayToIdle.getClip().duration*.8)}locoW=0}
    else if(special==='punch'){W('Punch_Cross',1,Math.min(.9,p.anim.a*1.4));locoW=0}
    else if(special==='catchHigh'||p.jump&&!p.dive){const d=act.Jump_Start.getClip().duration;const j=special==='catchHigh'?Math.min(1,p.anim.a/.6):p.jump;W('Jump_Start',1,d*(.35+.3*j));locoW=0}
    else if(p.throwPrep||(p.kk==='throw'&&p.kick)||(p.kk==='gthrow'&&p.kick)){const d=act.OverhandThrow.getClip().duration;W('OverhandThrow',1,p.kick?d*(.35+.55*p.kick):d*.3);locoW=0}
    else if(p.ready||p.crouch){const c=p.crouch||0;W('Crouch_Idle_Loop',.55+.45*c,(t*.5)%act.Crouch_Idle_Loop.getClip().duration);locoW=.45-.45*c;W('Idle_Loop',locoW,idleT*act.Idle_Loop.getClip().duration);locoW=0}
    else if(p.refIdle&&sp<.3){W('Idle_FoldArms_Loop',1,(t*.4)%act.Idle_FoldArms_Loop.getClip().duration);locoW=0}
    if(locoW>0){if(sp<=.15){setL(LOCO[0],1)}else{setL(a0,1-f);setL(a1,f)}}
    mixer.update(0);
    // ---------- ajustes por cima ----------
    const leftK=!!p.left,K=leftK?'_l':'_r',O=leftK?'_r':'_l';
    if(p.kick&&!(p.kk==='throw'||p.kk==='gthrow')){const k=p.kick;const back=k<.45?sm(k/.45):1-sm((k-.45)/.55);const fw=k<.45?0:Math.sin((k-.45)/.55*Math.PI);
      const am=p.kk==='pass'?.6:p.kk==='head'?0:p.kk==='long'||p.kk==='cross'?1.1:1;
      if(am>0){rot('thigh'+K,[[X,(.4*back-1.25*fw)*am]]);rot('calf'+K,[[X,(.85*back-.1*fw)*Math.max(.5,am)]]);rot('spine_02',[[X,-.1*fw*am]]);rot('foot'+K,[[X,-.3*fw]]);rot('thigh'+O,[[X,-.08]]);rot('calf'+O,[[X,.2]]);
        rot('spine_01',[[X,-.06*fw],[Y,(leftK?-1:1)*.18*fw]]);rot('upperarm'+O,[[Z,(leftK?1:-1)*.6*back]])}
      if(p.kk==='head'){rot('neck_01',[[X,-.5+1.1*Math.sin(k*Math.PI)]]);body.position.y=.35*Math.sin(k*Math.PI)}}
    else if(p.touch){rot('thigh'+K,[[X,-.35]]);rot('calf'+K,[[X,.2]])}
    if(p.trap){if(p.trap==='chest'){rot('spine_02',[[X,-.3]]);rot('spine_03',[[X,-.2]])}else{rot('thigh'+K,[[X,-1.0]]);rot('calf'+K,[[X,1.1]])}}
    if(p.side){const s=Math.sin(phase*Math.PI*2)*.3*p.side;rot('thigh_l',[[Z,Math.max(0,s)]]);rot('thigh_r',[[Z,Math.min(0,s)]])}
    if(p.lean)body.rotation.z=p.lean;if(p.brake)rot('spine_01',[[X,-.22*p.brake]]);
    if(p.hold){rot('upperarm_l',[[Z,-.4],[Y,-.5]]);rot('upperarm_r',[[Z,.4],[Y,.5]]);rot('lowerarm_l',[[Y,-1.1]]);rot('lowerarm_r',[[Y,1.1]])}
    if(p.card){rot('upperarm_r',[[Z,-1.9]])}
    if(p.flagUp){rot('upperarm_r',[[Z,-1.8]])}
    // goleiro: mergulho
    if(p.dive){const d=p.dive,k=Math.min(1,Math.abs(d)),sg=Math.sign(d),hh=p.diveH||0;
      body.rotation.z=-sg*(1.05+.35*hh)*k;body.position.y=(.3+.55*hh)*k;body.position.x=sg*.6*k;
      rot('upperarm_l',[[Z,(sg>0?2.3:2.0)*k]]);rot('upperarm_r',[[Z,-(sg<0?2.3:2.0)*k]]);rot('thigh_l',[[Z,(sg>0?-.1:.3)*k]]);rot('thigh_r',[[Z,(sg<0?.1:-.3)*k]])}
    if(special==='catch'&&p.anim.a<1.2){rot('upperarm_l',[[Z,-.3],[X,-1.0]]);rot('upperarm_r',[[Z,.3],[X,-1.0]]);rot('lowerarm_l',[[Y,-1.0]]);rot('lowerarm_r',[[Y,1.0]]);rot('spine_02',[[X,.3]])}
    if(special==='parry'&&p.anim.a<1){const e=Math.sin(Math.min(1,p.anim.a/.4)*Math.PI/2);body.rotation.z=-1.1*e;body.position.y=.35*e;rot('upperarm_l',[[Z,2.2*e]]);rot('upperarm_r',[[Z,-2.2*e]])}
    if(special==='lament'){const e=Math.min(1,p.anim.a/.35)*(p.anim.a>1.1?Math.max(0,1-(p.anim.a-1.1)/.3):1);rot('upperarm_l',[[Z,1.9*e],[X,-.6*e]]);rot('upperarm_r',[[Z,-1.9*e],[X,-.6*e]]);rot('lowerarm_l',[[Y,-2.0*e]]);rot('lowerarm_r',[[Y,2.0*e]]);rot('neck_01',[[X,-.3*e]])}
    if(special==='shoulder'){const e=Math.sin(Math.min(1,p.anim.a/.5)*Math.PI);body.rotation.z+=.25*e;rot('spine_02',[[Y,.4*e]])}
    // comemorações
    if(p.cele===1){rot('upperarm_l',[[Z,1.9]]);rot('upperarm_r',[[Z,-1.9]])}
    else if(p.cele===2){rot('upperarm_l',[[Z,.9],[X,-.1]]);rot('upperarm_r',[[Z,-.9],[X,-.1]]);rot('lowerarm_l',[[Y,0]]);body.rotation.z=.32*Math.sin(t*2.6)}
    else if(p.cele===3){rot('upperarm_r',[[Z,-2.3]])}
    else if(p.cele===5){rot('upperarm_l',[[Z,2.3]]);rot('upperarm_r',[[Z,-2.3]]);rot('neck_01',[[X,-.5]])}
    // cabeça acompanha a bola (olhar)
    if(p.look!=null&&!special&&!p.dive){const lk=Math.max(-.8,Math.min(.8,p.look));rot('neck_01',[[Y,lk*.3]]);rot('Head',[[Y,lk*.3]])}
  }
  pose({mv:0,t:0});
  const clipAt=(n,time)=>{for(const k in act){act[k].enabled=false;act[k].setEffectiveWeight(0)}body.position.set(0,0,0);const a=act[n];if(!a)return false;a.enabled=true;a.setEffectiveWeight(1);a.time=time;mixer.update(0);return true};
  return {root,body,pose,B,clipAt};
}
