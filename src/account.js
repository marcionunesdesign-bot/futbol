/* Onze Manager — conta e carreiras na nuvem (api/index.php) */
var ACC=(function(){
'use strict';
const C=C11;const st={online:/^https?:/.test(location.protocol),user:null,careers:[],timer:null,saving:false,last:0};
async function api(a,body,qs=''){const r=await fetch(`api/?a=${a}${qs}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-Onze':'1'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
  let j;try{j=await r.json()}catch(e){throw new Error('Servidor indisponível.')}if(!j.ok)throw new Error(j.error||'Erro');return j}
async function init(){if(!st.online)return;try{const j=await api('me');st.user=j.user;if(st.user)await list()}catch(e){st.online=false}}
async function list(){const j=await api('careers');st.careers=j.careers;return j.careers}
function meta(){const g=C.G;const c=C.userClub();const di=C.dateInfo();return {club:c.name,div:c.div,season:g.season,seasons:(g.seasonLog||[]).length,titles:(C.trophies?C.trophies().length:0),cid:g.cid,date:di?di.label:'Fim de temporada',manager:g.manager,money:c.money}}
function schedule(){if(!st.user||!C.G||!C.G.slot)return;clearTimeout(st.timer);st.timer=setTimeout(push,4000)}
async function push(){if(!st.user||!C.G||!C.G.slot||st.saving)return;st.saving=true;try{await api('save',{slot:C.G.slot,meta:meta(),data:C.G});st.last=Date.now();const b=document.getElementById('b-cloud');if(b){b.classList.remove('off');b.title='Salvo na nuvem às '+new Date().toLocaleTimeString('pt-BR')}}catch(e){const b=document.getElementById('b-cloud');if(b){b.classList.add('off');b.title='Falha ao salvar na nuvem: '+e.message}}finally{st.saving=false}}
async function load(slot){const j=await api('load',null,'&slot='+slot);j.data.slot=slot;C.loadObj(j.data);return j.data}
C.onSave=()=>{schedule();if(window.CAR)CAR.later()};
function authForm(onDone){
  U.openModal(`<div class="auth"><div class="auth-art"><div class="auth-field"></div><div class="auth-ball">⚽</div><div class="auth-logo">${(()=>{const l=document.querySelector('.logo-h');return l?l.outerHTML:'FUT<br>BOL'})()}</div>
      <ul class="auth-perks"><li>☁️ Suas carreiras salvas na nuvem</li><li>📱 Continue no celular ou no computador</li><li>🌐 Liga com amigos e partida ao vivo</li><li>🏆 Sala de troféus da sua carreira</li></ul></div>
    <div class="auth-form"><div class="eyebrow">Sua conta FUTBOL</div><h1 class="title" id="ac-title">Entrar</h1>
      <div class="seg auth-seg"><button data-am="login" class="on">Entrar</button><button data-am="register">Criar conta</button></div>
      <label class="auth-in" id="ac-name-w" hidden><span>👤</span><input type="text" id="ac-name" placeholder="Seu nome de treinador" autocomplete="name" maxlength="60"></label>
      <label class="auth-in"><span>✉️</span><input type="email" id="ac-email" placeholder="E-mail" autocomplete="email" inputmode="email"></label>
      <label class="auth-in"><span>🔒</span><input type="password" id="ac-pass" placeholder="Senha (mínimo 6)" autocomplete="current-password"><button type="button" class="auth-eye" id="ac-eye" aria-label="Mostrar senha">👁</button></label>
      <div class="auth-err" id="ac-err" hidden></div>
      <button class="btn big" id="ac-go" style="width:100%">Entrar</button>
      <p class="dim auth-note">Ao criar a conta, a carreira atual pode ser salva na nuvem pelo menu ☰. Seu e-mail não é exibido para outros técnicos.</p></div></div>`);
  U.$('#modal').classList.add('wide');let mode='login';
  const setMode=m=>{mode=m;U.$$('[data-am]').forEach(x=>x.classList.toggle('on',x.dataset.am===m));U.$('#ac-name-w').hidden=m!=='register';U.$('#ac-go').textContent=m==='login'?'Entrar':'Criar conta e jogar';U.$('#ac-title').textContent=m==='login'?'Entrar':'Criar conta';U.$('#ac-pass').autocomplete=m==='login'?'current-password':'new-password';U.$('#ac-err').hidden=true;(m==='register'?U.$('#ac-name'):U.$('#ac-email')).focus()};
  U.$$('[data-am]').forEach(b=>b.onclick=()=>setMode(b.dataset.am));
  U.$('#ac-eye').onclick=()=>{const i=U.$('#ac-pass');i.type=i.type==='password'?'text':'password'};
  const go=async()=>{const btn=U.$('#ac-go'),er=U.$('#ac-err');er.hidden=true;btn.disabled=true;const old=btn.textContent;btn.textContent='Aguarde…';
    try{const body={email:U.$('#ac-email').value.trim(),password:U.$('#ac-pass').value};if(mode==='register')body.name=U.$('#ac-name').value.trim();const j=await api(mode,body);st.user=j.user;await list();U.closeModal();U.toast(`Olá, ${U.esc(st.user.name)}! ⚽`);onDone&&onDone()}
    catch(e){console.error(e);if(!document.contains(er)){U.toast('⚠️ '+U.esc(e.message));return}er.textContent=e.message;er.hidden=false;btn.disabled=false;btn.textContent=old;const af=U.$('.auth-form');if(af){af.classList.remove('shake');void af.offsetWidth;af.classList.add('shake')}}};
  U.$('#ac-go').onclick=go;['#ac-pass','#ac-email','#ac-name'].forEach(s=>U.$(s).onkeydown=e=>{if(e.key==='Enter')go()});setTimeout(()=>U.$('#ac-email').focus(),80);
}
async function logout(){try{await api('logout',{})}catch(e){}st.user=null;st.careers=[]}
async function changePass(){const o=prompt('Senha atual:');if(o==null)return;const n=prompt('Nova senha (mín. 6):');if(n==null)return;await api('password',{old:o,new:n});U.toast('Senha alterada.')}
async function deleteAccount(){const p=prompt('Para excluir a conta e todas as carreiras na nuvem, digite sua senha:');if(!p)return;await api('delete_account',{password:p});st.user=null;st.careers=[];U.toast('Conta excluída.')}
async function delCareer(slot){await api('delete_career',{slot});await list()}
return {init,api,list,load,push,authForm,logout,changePass,deleteAccount,delCareer,meta,get st(){return st}};
})();
