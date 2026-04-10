
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Forzar scroll al top antes de que cualquier otra cosa corra
window.scrollTo(0, 0);

// ── Fix iOS 14/15: --real-vh para calc() en lugar de 100vh ──
(function(){
  function setRealVh(){
    document.documentElement.style.setProperty('--real-vh', (window.innerHeight * 0.01) + 'px');
  }
  setRealVh();
  window.addEventListener('resize', setRealVh);
  // También al rotar pantalla en móvil
  window.addEventListener('orientationchange', function(){ setTimeout(setRealVh, 150); });
})();


const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


(function(){
  const pre   = document.getElementById('preloader');
  const split = document.querySelector('.won-split');
  const mob   = document.querySelector('.won-mobile');

  // ── Función que dispara las animaciones de entrada ──
  function startHeroAnims(){
    if(prefersReducedMotion){
      if(split) split.classList.add('won-anim-done');
      if(mob)   mob.classList.add('won-anim-done');
      return;
    }
    // En móvil garantizamos al menos 120ms para que el navegador
    // haya pintado el primer frame y las transiciones clip-path sean visibles.
    // En desktop 20ms es suficiente porque el GPU ya tiene el layout listo.
    const minDelay = window.innerWidth <= 768 ? 120 : 20;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if(split) split.classList.add('won-anim-done');
        if(mob)   mob.classList.add('won-anim-done');
      }, minDelay);
    });
  }

  // ── Sin preloader en el DOM → arrancar directamente ──
  if(!pre){ startHeroAnims(); return; }

  let preShown  = false;
  let fontsReady = false;

  // Ocultar preloader hasta decidir si es necesario
  pre.style.opacity    = '0';
  pre.style.visibility = 'hidden';
  pre.style.transition = 'none';

  // Timer de 500ms: si las fuentes aún no están → mostrar preloader
  const showTimer = setTimeout(() => {
    if(!fontsReady){
      preShown             = true;
      pre.style.transition = '';      // restaurar transition CSS
      pre.style.opacity    = '1';
      pre.style.visibility = 'visible';
    }
  }, 500);

  // Cuando las fuentes estén listas
  function onFontsReady(){
    fontsReady = true;
    clearTimeout(showTimer);

    if(!preShown){
      // Carga rápida: nunca se mostró → quitar silencioso → arrancar anims
      if(pre.parentNode) pre.parentNode.removeChild(pre);
      startHeroAnims();
    } else {
      // Preloader visible → esperar al menos 700ms de animación de logo
      // luego fade out → arrancar anims al terminar el fade
      const shown = Date.now();
      const minDisplay = 700;
      const elapsed = Date.now() - shown;
      const wait = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        pre.classList.add('pre-hide');        // opacity:0 en 550ms (CSS)
        setTimeout(() => {
          if(pre.parentNode) pre.parentNode.removeChild(pre);
          startHeroAnims();
        }, 580);
      }, wait);
    }
  }

  document.fonts.ready
    .then(onFontsReady)
    .catch(onFontsReady);          // también arrancar si falla la API

  // Fallback absoluto: 5s
  setTimeout(onFontsReady, 5000);
})();


function openCalendly(){
  // Cargar CSS de Calendly solo la primera vez que se necesita
  if(!document.getElementById('calendly-css')){
    const lnk = document.createElement('link');
    lnk.id   = 'calendly-css';
    lnk.rel  = 'stylesheet';
    lnk.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(lnk);
  }
  if(typeof Calendly !== 'undefined'){
    Calendly.initPopupWidget({url:'https://calendly.com/webonada/studio'});
  } else {
    window.open('https://calendly.com/webonada/studio','_blank','noopener');
  }
  return false;
}


(function(){
  if(window.innerWidth > 768) return;
  try{ if(CSS.supports('height','1svh')) return; }catch(e){}
  function setRealVh(){
    document.documentElement.style.setProperty(
      '--real-vh',
      (window.visualViewport ? window.visualViewport.height : window.innerHeight) + 'px'
    );
  }
  setRealVh();

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', setRealVh, {passive:true});
  }
  window.addEventListener('orientationchange', ()=>setTimeout(setRealVh,200), {passive:true});
})();

window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',scrollY>50);
  document.getElementById('floatCta').classList.toggle('show',scrollY>400);
},{passive:true});


const hamburger=document.getElementById('hamburger');
const navDropdown=document.getElementById('navDropdown');
const navDropdownInner=document.getElementById('navDropdownInner');
let menuOpen=false;

function openMenu(){
  menuOpen=true;
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded','true');
  hamburger.setAttribute('aria-label','Cerrar menú de navegación');
  navDropdown.classList.add('open');
  document.body.style.overflow='hidden';
  // Move focus to first link in menu
  const firstLink = navDropdownInner.querySelector('a');
  if(firstLink) setTimeout(()=>firstLink.focus(), 100);
}
function closeMenu(){
  menuOpen=false;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded','false');
  hamburger.setAttribute('aria-label','Abrir menú de navegación');
  navDropdown.classList.remove('open');
  document.body.style.overflow='';
  hamburger.focus();
  // Siempre resetear el panel easter egg al cerrar el menú
  const panel = document.getElementById('navEasterPanel');
  const inner = document.getElementById('navDropdownInner');
  if(panel && inner){
    panel.style.transition='none';
    panel.style.opacity='0';
    panel.style.pointerEvents='none';
    inner.style.transition='none';
    inner.style.opacity='1';
    inner.style.pointerEvents='';
    // Restaurar transitions después del siguiente frame
    requestAnimationFrame(()=>{
      panel.style.transition='';
      inner.style.transition='';
    });
  }
}
hamburger.addEventListener('click',()=>menuOpen?closeMenu():openMenu());
navDropdownInner.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
navDropdown.addEventListener('click',e=>{if(!navDropdownInner.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)closeMenu();});

// Focus trap inside menu
navDropdown.addEventListener('keydown', e => {
  if(!menuOpen) return;
  const focusable = navDropdownInner.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0], last = focusable[focusable.length-1];
  if(e.key==='Tab'){
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});


function checkReveal(){
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>{
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight + 10){
      el.classList.add('visible');
    }
  });
}
const isMobileReveal = window.innerWidth <= 768;
const rvIO=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');rvIO.unobserve(e.target);}
}),{threshold:0, rootMargin: isMobileReveal ? '0px 0px 0px 0px' : '0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>rvIO.observe(el));
// Doble rAF garantiza que el layout ya pintó antes de medir posiciones
requestAnimationFrame(()=>requestAnimationFrame(()=>checkReveal()));
window.addEventListener('load', ()=>requestAnimationFrame(()=>checkReveal()));


/* ── Phone digit rules per country code ── */
const PHONE_RULES = {
  '+1':   {min:10,max:10, label:'10 dígitos'},
  '+34':  {min:9, max:9,  label:'9 dígitos'},
  '+52':  {min:10,max:10, label:'10 dígitos'},
  '+54':  {min:10,max:11, label:'10-11 dígitos'},
  '+55':  {min:10,max:11, label:'10-11 dígitos'},
  '+56':  {min:9, max:9,  label:'9 dígitos'},
  '+57':  {min:10,max:10, label:'10 dígitos'},
  '+58':  {min:10,max:11, label:'10-11 dígitos'},
  '+51':  {min:9, max:9,  label:'9 dígitos'},
  '+593': {min:9, max:9,  label:'9 dígitos'},
  '+598': {min:8, max:9,  label:'8-9 dígitos'},
  '+595': {min:9, max:10, label:'9-10 dígitos'},
  '+591': {min:8, max:8,  label:'8 dígitos'},
  '+502': {min:8, max:8,  label:'8 dígitos'},
  '+503': {min:8, max:8,  label:'8 dígitos'},
  '+504': {min:8, max:8,  label:'8 dígitos'},
  '+505': {min:8, max:8,  label:'8 dígitos'},
  '+506': {min:8, max:8,  label:'8 dígitos'},
  '+507': {min:7, max:8,  label:'7-8 dígitos'},
  '+509': {min:8, max:8,  label:'8 dígitos'},
  '+53':  {min:8, max:8,  label:'8 dígitos'},
  '+1787':{min:10,max:10, label:'10 dígitos'},
  '+44':  {min:10,max:10, label:'10 dígitos'},
  '+33':  {min:9, max:9,  label:'9 dígitos'},
  '+49':  {min:10,max:11, label:'10-11 dígitos'},
  '+39':  {min:9, max:10, label:'9-10 dígitos'},
};

/* ── Field error helpers ── */
function setFieldError(groupEl, errEl, msg) {
  groupEl.classList.add('has-error');
  errEl.textContent = msg;
  // re-trigger shake animation
  errEl.style.animation = 'none';
  errEl.offsetHeight; // reflow
  errEl.style.animation = '';
}
function clearFieldError(groupEl, errEl) {
  groupEl.classList.remove('has-error');
  errEl.textContent = '';
}
function getGroup(el) { return el.closest('.form-group'); }

/* ── Live validation: clear error on fix ── */
document.addEventListener('DOMContentLoaded', () => {
  const fields = [
    {id:'contact-name',   err:'err-name'},
    {id:'contact-email',  err:'err-email'},
    {id:'contact-phone',  err:'err-phone'},
    {id:'contact-project',err:'err-project'},
    {id:'contact-message',err:'err-message'},
  ];
  fields.forEach(({id, err}) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(err);
    if(!el || !errEl) return;
    el.addEventListener('input', () => {
      if(getGroup(el).classList.contains('has-error')) {
        clearFieldError(getGroup(el), errEl);
      }
    });
    el.addEventListener('change', () => {
      if(getGroup(el).classList.contains('has-error')) {
        clearFieldError(getGroup(el), errEl);
      }
    });
  });
  // Also clear phone error when country code changes
  const codeEl = document.getElementById('contact-phone-code');
  if(codeEl) codeEl.addEventListener('change', () => {
    const errEl = document.getElementById('err-phone');
    const phoneEl = document.getElementById('contact-phone');
    if(errEl && phoneEl) clearFieldError(getGroup(phoneEl), errEl);
  });
});

/* ── Validate all fields, return true if valid ── */
function validateForm(form) {
  let valid = true;

  const name    = document.getElementById('contact-name');
  const email   = document.getElementById('contact-email');
  const phone   = document.getElementById('contact-phone');
  const code    = document.getElementById('contact-phone-code');
  const project = document.getElementById('contact-project');
  const message = document.getElementById('contact-message');

  // Name
  const errName = document.getElementById('err-name');
  if(!name.value.trim() || name.value.trim().length < 2) {
    setFieldError(getGroup(name), errName, 'Ingresa tu nombre completo (mín. 2 caracteres)');
    valid = false;
  } else clearFieldError(getGroup(name), errName);

  // Email
  const errEmail = document.getElementById('err-email');
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if(!email.value.trim()) {
    setFieldError(getGroup(email), errEmail, 'El email es obligatorio');
    valid = false;
  } else if(!emailRx.test(email.value.trim())) {
    setFieldError(getGroup(email), errEmail, 'Ingresa un email válido (ej: tu@correo.com)');
    valid = false;
  } else clearFieldError(getGroup(email), errEmail);

  // Phone — digits only, length depends on country code
  const errPhone = document.getElementById('err-phone');
  const phoneGroup = getGroup(phone);
  if(phone.value.trim()) {
    const digits = phone.value.replace(/[^0-9]/g,'');
    const rule = PHONE_RULES[code.value] || {min:6,max:15,label:'6-15 dígitos'};
    if(digits.length < rule.min || digits.length > rule.max) {
      setFieldError(phoneGroup, errPhone, `Para ${code.value} se requieren ${rule.label} (ingresaste ${digits.length})`);
      valid = false;
    } else clearFieldError(phoneGroup, errPhone);
  } else clearFieldError(phoneGroup, errPhone);

  // Project
  const errProject = document.getElementById('err-project');
  if(!project.value) {
    setFieldError(getGroup(project), errProject, 'Selecciona el tipo de proyecto');
    valid = false;
  } else clearFieldError(getGroup(project), errProject);

  // Message
  const errMessage = document.getElementById('err-message');
  if(!message.value.trim() || message.value.trim().length < 10) {
    setFieldError(getGroup(message), errMessage, 'El mensaje debe tener al menos 10 caracteres');
    valid = false;
  } else clearFieldError(getGroup(message), errMessage);

  // Scroll to first error
  if(!valid) {
    const firstErr = form.querySelector('.form-group.has-error');
    if(firstErr) firstErr.scrollIntoView({behavior:'smooth', block:'center'});
  }

  return valid;
}

/* ── HOLOGRAPHIC SHATTER — form explodes into triangles that fly to mailbox ── */
function showPaperShatter(formData, onDone) {
  const form = document.getElementById('contactForm');
  if(!form){ onDone && onDone(); return; }

  const rect = form.getBoundingClientRect();
  const envOverlay = document.getElementById('sendEnvelope');
  const mailboxEl  = document.getElementById('envMailbox');
  const envScene   = document.getElementById('envScene');


  envOverlay.style.display = 'block';
  envScene.style.opacity   = '0';
  mailboxEl.style.opacity  = '0';
  mailboxEl.style.transition = 'opacity .35s ease';
  setTimeout(() => { mailboxEl.style.opacity = '1'; }, 350);


  const tc = document.createElement('canvas');
  tc.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998';
  tc.width = window.innerWidth; tc.height = window.innerHeight;
  document.body.appendChild(tc);
  const ctx = tc.getContext('2d');


  const fields = form.querySelectorAll('.form-group,.form-row,button[type=submit],#form-success,#form-error');
  fields.forEach(f => { f.style.transition = 'opacity .28s ease'; f.style.opacity = '0'; });


  const COLS = [
    'rgba(0,212,255,',    // cyan
    'rgba(26,111,255,',   // blue
    'rgba(168,85,247,',   // violet
    'rgba(61,155,255,',   // electric
    'rgba(255,255,255,'   // white accent
  ];
  const mbr = mailboxEl.getBoundingClientRect();
  const mbx = mbr.left + mbr.width / 2;
  const mby = mbr.top  + mbr.height / 2;

  const shards = [];
  const SHARD_COUNT = 36;
  for(let i = 0; i < SHARD_COUNT; i++){
    const ax  = rect.left + Math.random() * rect.width;
    const ay  = rect.top  + Math.random() * rect.height;
    const sz  = Math.random() * 32 + 10;
    const col = COLS[Math.floor(Math.random() * COLS.length)];
    const vx  = (Math.random() - .5) * 3.5;
    const vy  = (Math.random() - .5) * 3.5 - 1.2;
    const rot = Math.random() * Math.PI * 2;
    const vrot= (Math.random() - .5) * .18;
    const delay = i * 22;
    shards.push({ x: ax, y: ay, sz, col, vx, vy, rot, vrot, a: 0, delay, t: 0 });
  }

  let start = null;
  const SCATTER_DUR  = 700;
  const CONVERGE_DUR = 1400;
  const TOTAL = SCATTER_DUR + CONVERGE_DUR + 400;

  function drawShard(s){
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);

  
    ctx.beginPath();
    ctx.moveTo(0, -s.sz * .6);
    ctx.lineTo( s.sz * .5,  s.sz * .4);
    ctx.lineTo(-s.sz * .5,  s.sz * .4);
    ctx.closePath();
    ctx.fillStyle   = s.col + (s.a * .25) + ')';
    ctx.strokeStyle = s.col + (s.a * .92) + ')';
    ctx.lineWidth   = .9;
    ctx.fill();
    ctx.stroke();

  
    ctx.beginPath();
    ctx.moveTo(0, -s.sz * .6);
    ctx.lineTo(s.sz * .5, s.sz * .4);
    ctx.strokeStyle = s.col + (s.a * .7) + ')';
    ctx.lineWidth   = .4;
    ctx.stroke();

  
    ctx.beginPath();
    ctx.arc(0, 0, s.sz * .1, 0, Math.PI * 2);
    ctx.fillStyle = s.col + (s.a * .8) + ')';
    ctx.fill();

    ctx.restore();
  }

  function easeOut(t){ return 1 - Math.pow(1-t, 3); }

  function frame(ts){
    if(!start) start = ts;
    const el = ts - start;
    ctx.clearRect(0, 0, tc.width, tc.height);

    let allDone = true;

    shards.forEach(sh => {
      const local = el - sh.delay;
      if(local < 0){ allDone = false; return; }

      const progress = Math.min(local / TOTAL, 1);
      sh.t = progress;

      if(local < SCATTER_DUR){
      
        const p = local / SCATTER_DUR;
        sh.a = Math.min(p * 3, 1);
        sh.x += sh.vx * (1 - p * .6);
        sh.y += sh.vy * (1 - p * .6);
        sh.rot += sh.vrot;
        allDone = false;
      } else {
      
        const convLocal = local - SCATTER_DUR;
        const p = Math.min(convLocal / CONVERGE_DUR, 1);
        const ep = easeOut(p);
        sh.a = Math.max(0, 1 - ep * .94);
        sh.x += (mbx - sh.x) * ep * .1;
        sh.y += (mby - sh.y) * ep * .1;
        sh.rot += sh.vrot * 1.8;
        sh.sz  = Math.max(1, sh.sz * (1 - ep * .008));
        if(p < 1) allDone = false;
      }

      if(sh.a > .01) drawShard(sh);
    });

  
    if(el > SCATTER_DUR){
      const p = Math.min((el - SCATTER_DUR) / CONVERGE_DUR, 1);
      if(p > .6){
        const rp = (p - .6) / .4;
        const r  = rp * 28;
        ctx.beginPath();
        ctx.arc(mbx, mby, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${(1 - rp) * .7})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }
    }

    if(!allDone || el < TOTAL){ requestAnimationFrame(frame); }
    else { onArrival(); }
  }

  requestAnimationFrame(frame);

  function onArrival(){
  
    const mbBody = mailboxEl.querySelector('.env-mailbox-body');
    mbBody.style.transition = 'box-shadow .15s ease';
    mbBody.style.boxShadow  = '0 0 0 3px rgba(0,212,255,.9),0 0 50px rgba(0,212,255,.8),0 0 100px rgba(26,111,255,.5)';
    setTimeout(() => { mbBody.style.boxShadow = ''; }, 700);

  
    for(let i = 0; i < 26; i++){
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.random() * 60 + 14;
      const sp    = document.createElement('div');
      const sz    = Math.random() * 4 + 1;
      const col   = Math.random() > .5 ? 'rgba(0,212,255,.9)' : 'rgba(168,85,247,.9)';
      sp.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};left:${mbx}px;top:${mby}px;z-index:10000;pointer-events:none;transition:transform ${Math.random()*.45+.2}s ease,opacity .45s ease`;
      document.body.appendChild(sp);
      setTimeout(() => {
        sp.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
        sp.style.opacity   = '0';
      }, 10);
      setTimeout(() => sp.parentNode && sp.parentNode.removeChild(sp), 800);
    }

  
    setTimeout(() => {
      ctx.clearRect(0, 0, tc.width, tc.height);
      if(tc.parentNode) tc.parentNode.removeChild(tc);
      envOverlay.style.display = 'none';
      mailboxEl.style.opacity  = '0';
      mailboxEl.style.transition = '';
    
      form.style.display = 'none';
      onDone && onDone();
    }, 750);
  }
}


/* ── Form sent screen helpers ── */
function showFormSentScreen(){
  const screen  = document.getElementById('form-sent-screen');
  const icon    = document.getElementById('fss-icon');
  const text    = document.getElementById('fss-text');
  const actions = document.getElementById('fss-actions');
  const check   = document.getElementById('fss-check');
  if(!screen) return;

  screen.style.display = 'flex';
  // Trigger entrance animations on next frame
  requestAnimationFrame(() => requestAnimationFrame(() => {
    icon.style.opacity   = '1';
    icon.style.transform = 'scale(1)';
    text.style.opacity   = '1';
    text.style.transform = 'translateY(0)';
    actions.style.opacity   = '1';
    actions.style.transform = 'translateY(0)';
    if(check) check.style.strokeDashoffset = '0';
  }));

  screen.scrollIntoView({ behavior:'smooth', block:'center' });
}

function resetFormAndShow(){
  const form    = document.getElementById('contactForm');
  const screen  = document.getElementById('form-sent-screen');
  const icon    = document.getElementById('fss-icon');
  const text    = document.getElementById('fss-text');
  const actions = document.getElementById('fss-actions');
  const check   = document.getElementById('fss-check');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  if(!form || !screen) return;

  // Reset sent screen state for next use
  icon.style.opacity   = '0';
  icon.style.transform = 'scale(.6)';
  text.style.opacity   = '0';
  text.style.transform = 'translateY(18px)';
  actions.style.opacity   = '0';
  actions.style.transform = 'translateY(18px)';
  if(check) check.style.strokeDashoffset = '40';

  screen.style.display = 'none';

  // Restore form: reset fields, clear errors, restore opacity
  form.reset();
  form.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
  form.querySelectorAll('.form-group,.form-row,button[type=submit],#form-success,#form-error')
      .forEach(f => { f.style.opacity = ''; f.style.transition = ''; });
  if(successEl) successEl.style.display = 'none';
  if(errorEl)   errorEl.style.display   = 'none';

  // Fade form back in
  form.style.opacity    = '0';
  form.style.transition = 'opacity .45s ease';
  form.style.display    = '';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    form.style.opacity = '1';
    form.scrollIntoView({ behavior:'smooth', block:'center' });
  }));
  setTimeout(() => { form.style.opacity = ''; form.style.transition = ''; }, 500);
}

/* ── Submit handler ── */
async function submitForm(e){
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type=submit]');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');

  successEl.style.display = 'none';
  errorEl.style.display   = 'none';

  if(!validateForm(form)) return;

  btn.textContent='Enviando…'; btn.disabled=true; btn.style.opacity='.7';

  const formData = {
    name:      (document.getElementById('contact-name')       ||{}).value||'',
    email:     (document.getElementById('contact-email')      ||{}).value||'',
    phone:     (document.getElementById('contact-phone')      ||{}).value||'',
    phoneCode: (document.getElementById('contact-phone-code') ||{}).value||'',
    project:   (document.getElementById('contact-project')    ||{}).value||'',
    message:   (document.getElementById('contact-message')    ||{}).value||'',
  };

  try {
    const res = await fetch('https://formspree.io/f/xgopaael', {
      method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}
    });
    if(res.ok){
      form.reset();
      form.querySelectorAll('.form-group.has-error').forEach(g=>g.classList.remove('has-error'));
      if(typeof trackFormSubmit==='function') trackFormSubmit();
      btn.textContent='Enviar Mensaje'; btn.disabled=false; btn.style.opacity='1';
      showPaperShatter(formData, ()=>{
        showFormSentScreen();
      });
    } else { throw new Error('server'); }
  } catch(err){
    errorEl.style.display='block';
    errorEl.scrollIntoView({behavior:'smooth',block:'nearest'});
    btn.textContent='Enviar Mensaje'; btn.disabled=false; btn.style.opacity='1';
  }
}


(function(){
  const timeline  = document.getElementById('procTimeline');
  const spineFill = document.getElementById('spineFill');
  const spine     = timeline ? timeline.querySelector('.process-spine') : null;
  if(!timeline || !spineFill || !spine) return;

  const steps = Array.from(timeline.querySelectorAll('.proc-step'));
  const N     = steps.length;
  let started     = false;
  let currentFill = 0;

  // Duración de la línea viajando de un nodo al siguiente (ms)
  const LINE_DUR  = 800;
  // Pausa entre que la línea llega al nodo y el nodo se prende (ms)
  const NODE_WAIT = 120;
  // Pausa entre que el nodo se prende y empieza la línea hacia el siguiente (ms)
  const STEP_PAUSE = 300;


  function positionSpine(){
    const r1 = steps[0].querySelector('.proc-bubble').getBoundingClientRect();
    const rN = steps[N-1].querySelector('.proc-bubble').getBoundingClientRect();
    const tl = timeline.getBoundingClientRect();
    if(window.innerWidth <= 768){
      spine.style.left     = '28px';
      spine.style.right    = 'auto';
      spine.style.width    = '2px';
      spine.style.top      = (r1.top - tl.top + r1.height/2) + 'px';
      spine.style.bottom   = 'auto';
      spine.style.height   = (rN.bottom - r1.top - r1.height/2) + 'px';
      spine.style.clipPath = 'none';
    } else {
      spine.style.left     = (r1.left - tl.left + r1.width/2) + 'px';
      spine.style.right    = (tl.right - rN.right + rN.width/2) + 'px';
      spine.style.width    = 'auto';
      spine.style.top      = '44px';
      spine.style.bottom   = 'auto';
      spine.style.height   = '2px';
      spine.style.clipPath = 'none';
    }
  }


  function targetPct(i){
    if(N <= 1) return 100;
    return (i / (N - 1)) * 100;
  }


  function animFill(to, dur, onDone){
    const isMob = window.innerWidth <= 768;
    const from  = currentFill;
    const t0    = performance.now();
    currentFill = to;
    (function tick(now){
      const p    = Math.min((now - t0) / dur, 1);
      const ease = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      const val  = (from + (to - from) * ease) + '%';
      if(isMob) spineFill.style.height = val;
      else      spineFill.style.width  = val;
      if(p < 1) requestAnimationFrame(tick);
      else if(onDone) onDone();
    })(t0);
  }


  function runSequence(i){
    if(i >= N) return;

    if(i === 0){
      // Primer nodo: no hay línea que viajar, prender directo
      steps[0].classList.add('active');
      setTimeout(()=> runSequence(1), STEP_PAUSE);
      return;
    }

    // Animar línea desde el nodo anterior hasta este
    animFill(targetPct(i), LINE_DUR, ()=>{
      // Línea llegó → esperar NODE_WAIT → prender nodo
      setTimeout(()=>{
        steps[i].classList.add('active');
        // Nodo prendido → esperar STEP_PAUSE → ir al siguiente
        setTimeout(()=> runSequence(i + 1), STEP_PAUSE);
      }, NODE_WAIT);
    });
  }


  function resetFill(){
    const isMob = window.innerWidth <= 768;
    spineFill.style.width  = isMob ? '2px' : '0%';
    spineFill.style.height = isMob ? '0%'  : '2px';
    currentFill = 0;
  }

  window.addEventListener('resize', positionSpine, {passive:true});


  const obs = new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !started){
      started = true;
      requestAnimationFrame(()=>{
        positionSpine();
        resetFill();
        if(prefersReducedMotion){
          // Sin animación: todo activo de golpe
          steps.forEach(s => s.classList.add('active'));
          const isMob = window.innerWidth <= 768;
          if(isMob) spineFill.style.height = '100%';
          else      spineFill.style.width  = '100%';
        } else {
          runSequence(0);
        }
      });
    }
  }, {threshold: 0.15});

  obs.observe(timeline);
})();


(function(){
  if(prefersReducedMotion) return;

  const pc=document.getElementById('particle-canvas');
  const pctx=pc ? pc.getContext('2d') : null;
  let pW=0,pH=0;

  function resizeParticle(){
    if(!pc) return;
    pW=pc.width=innerWidth;
    pH=pc.height=innerHeight;
  }
  resizeParticle();
  window.addEventListener('resize',resizeParticle,{passive:true});

  // 50 partículas (era 90) — suficiente para el efecto, mucho más liviano
  const CELL=120, MAX_DIST=120;
  const P=[];
  if(pc) for(let i=0;i<50;i++) P.push({
    x:Math.random()*pW, y:Math.random()*pH,
    vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
    r:Math.random()*1.5+.5, a:Math.random()
  });

  function buildGrid(particles){
    const grid={};
    particles.forEach((p,i)=>{
      const cx=Math.floor(p.x/CELL), cy=Math.floor(p.y/CELL);
      const key=cx+','+cy;
      if(!grid[key]) grid[key]=[];
      grid[key].push(i);
    });
    return grid;
  }
  function getNeighbors(grid,p){
    const cx=Math.floor(p.x/CELL), cy=Math.floor(p.y/CELL);
    const result=[];
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){
      const key=(cx+dx)+','+(cy+dy);
      if(grid[key]) result.push(...grid[key]);
    }
    return result;
  }

  // Throttle a 30fps — el canvas de partículas no necesita 60fps
  const FPS=30, INTERVAL=1000/FPS;
  let lastFrame=0;
  let rafId;
  function mainLoop(ts){
    rafId=requestAnimationFrame(mainLoop);
    if(ts-lastFrame < INTERVAL) return;
    lastFrame=ts;
    if(pctx){
      pctx.clearRect(0,0,pW,pH);
      P.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=pW; if(p.x>pW)p.x=0;
        if(p.y<0)p.y=pH; if(p.y>pH)p.y=0;
        pctx.beginPath();
        pctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        pctx.fillStyle=`rgba(61,155,255,${p.a*.6})`;
        pctx.fill();
      });
      const grid=buildGrid(P);
      const drawn=new Set();
      const lineBuckets={};
      P.forEach((p,i)=>{
        const neighbors=getNeighbors(grid,p);
        neighbors.forEach(j=>{
          if(j<=i) return;
          const key=i+'-'+j;
          if(drawn.has(key)) return;
          drawn.add(key);
          const dx=p.x-P[j].x, dy=p.y-P[j].y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<MAX_DIST){
            const alpha=Math.round((1-d/MAX_DIST)*4)/4;
            if(!lineBuckets[alpha]) lineBuckets[alpha]=[];
            lineBuckets[alpha].push([p.x,p.y,P[j].x,P[j].y]);
          }
        });
      });
      pctx.lineWidth=.5;
      for(const alpha in lineBuckets){
        pctx.strokeStyle=`rgba(26,111,255,${alpha*.15})`;
        pctx.beginPath();
        lineBuckets[alpha].forEach(([x1,y1,x2,y2])=>{
          pctx.moveTo(x1,y1);
          pctx.lineTo(x2,y2);
        });
        pctx.stroke();
      }
    }
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ cancelAnimationFrame(rafId); }
    else { rafId=requestAnimationFrame(mainLoop); }
  });

  rafId=requestAnimationFrame(mainLoop);
})();

/* scroll glow eliminado */

const counterObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    counterObs.unobserve(e.target);
    const els = [e.target];
    if(prefersReducedMotion){
      els.forEach(el=>{ el.textContent=el.dataset.target+(el.dataset.suffix||''); });
      return;
    }
    const DURATION=2000, t0=performance.now();
    const counters=els.map(el=>({el,target:parseFloat(el.dataset.target),suffix:el.dataset.suffix||''}));
    (function tick(now){
      const p=Math.min((now-t0)/DURATION,1);
      const ease=1-Math.pow(1-p,3);
      counters.forEach(({el,target,suffix})=>{ el.textContent=Math.floor(ease*target)+suffix; });
      if(p<1) requestAnimationFrame(tick);
      else counters.forEach(({el,target,suffix})=>{ el.textContent=target+suffix; });
    })(t0);
  });
},{threshold:0.5});
document.querySelectorAll('[data-counter]').forEach(el => counterObs.observe(el));


document.querySelectorAll('.service-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
  });
});


(function(){
  const track=document.getElementById('testimonialsTrack');
  if(!track) return;
  const cards=Array.from(track.children);
  const prevBtn=document.getElementById('carouselPrev');
  const nextBtn=document.getElementById('carouselNext');
  const dots=Array.from(document.getElementById('carouselDots').children);
  let current=0;

  function getVisible(){
    const w=window.innerWidth;
    if(w<=600) return 1;
    if(w<=900) return 2;
    return 3;
  }

  function getCardWidth(){
    const visible=getVisible();
    const gap=visible>1?24:16; // 1.5rem or 1rem gap in px
    const trackW=track.parentElement.offsetWidth;
    return (trackW-(gap*(visible-1)))/visible;
  }

  function update(animate=true){
    const cardW=getCardWidth();
    const gap=getVisible()>1?24:16;
    // Clamp current
    const maxIdx=Math.max(0,cards.length-getVisible());
    if(current>maxIdx) current=maxIdx;
    // Set card widths
    cards.forEach(c=>{c.style.flex=`0 0 ${cardW}px`});
    // Move track
    const offset=current*(cardW+gap);
    if(!animate) track.style.transition='none';
    track.style.transform=`translateX(-${offset}px)`;
    if(!animate) setTimeout(()=>track.style.transition='',50);
    // Update buttons
    prevBtn.disabled=current===0;
    nextBtn.disabled=current>=maxIdx;
    // Update dots
    dots.forEach((d,i)=>{
      const active=i===current;
      d.classList.toggle('active',active);
      d.setAttribute('aria-selected',active?'true':'false');
    });
  }

  prevBtn.addEventListener('click',()=>{ if(current>0){current--;update();} });
  nextBtn.addEventListener('click',()=>{
    const maxIdx=Math.max(0,cards.length-getVisible());
    if(current<maxIdx){current++;update();}
  });
  dots.forEach((d,i)=>d.addEventListener('click',()=>{ current=i; update(); }));

  // Touch/swipe support
  let startX=0,isDragging=false;
  track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;isDragging=true;},{passive:true});
  track.addEventListener('touchend',e=>{
    if(!isDragging)return;
    const dx=e.changedTouches[0].clientX-startX;
    if(dx<-40) nextBtn.click();
    else if(dx>40) prevBtn.click();
    isDragging=false;
  },{passive:true});

  // Auto-advance every 5s on mobile
  let autoTimer;
  function startAuto(){
    if(getVisible()>=cards.length) return;
    autoTimer=setInterval(()=>{
      const maxIdx=Math.max(0,cards.length-getVisible());
      current=current>=maxIdx?0:current+1;
      update();
    },5000);
  }
  function stopAuto(){ clearInterval(autoTimer); }
  track.addEventListener('touchstart',stopAuto,{passive:true});
  if(!prefersReducedMotion) startAuto();

  window.addEventListener('resize',()=>update(false),{passive:true});
  update(false);
})();

(function(){
  const grid = document.getElementById('pricingGrid');
  const dots = document.querySelectorAll('.pricing-dot');
  if(!grid) return;

  const cards = Array.from(grid.querySelectorAll('.pricing-card'));
  const N = cards.length;
  let current = 1; // Empieza en la tarjeta Profesional (featured, índice 1)
  let startX = 0, startY = 0, dragging = false;

  function isMobile(){ return window.innerWidth <= 768; }

  // Calcula el offset px para centrar la tarjeta `idx`.
  // getOffset funciona correctamente aunque el grid tenga un transform aplicado,
  // porque la diferencia card.left - grid.left cancela el transform compartido.
  function getOffset(idx){
    const parentW = grid.parentElement ? grid.parentElement.offsetWidth : window.innerWidth;
    const card = cards[idx];
    if(!card) return 0;
    const cardRect = card.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const cardLeft = cardRect.left - gridRect.left;
    const cardW    = cardRect.width;
    return cardLeft - (parentW / 2 - cardW / 2);
  }

  function goTo(idx, animated){
    if(!isMobile()) return;
    // Límite estricto: si el índice está fuera del rango, no hace nada.
    // Esto evita la animación fantasma en el primer/último card.
    if(idx < 0 || idx >= N) return;
    current = idx;

    // NO se resetea a translateX(0) antes de animar: ese reset causaba
    // que el grid saltara visualmente al inicio y la animación se viera
    // en dirección contraria al swipe. getOffset no lo necesita (ver arriba).
    requestAnimationFrame(() => {
      const offset = getOffset(current);
      grid.style.transition = animated ? 'transform .4s cubic-bezier(.23,1,.32,1)' : 'none';
      grid.style.transform  = `translateX(-${offset}px)`;

      cards.forEach((c, i) => {
        const isActive = i === current;
        c.classList.toggle('pc-active', isActive);
        c.style.opacity   = isActive ? '1' : '0.45';
        c.style.transform = isActive ? 'scale(1)' : 'scale(0.93)';
      });

      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    });
  }

  function setupMobile(){
    if(!isMobile()) return;
    // El grid es flex-row con las tarjetas en línea
    // Cada tarjeta ocupa ~88% del container — el track es N*88% aprox
    grid.style.display        = 'flex';
    grid.style.flexWrap       = 'nowrap';
    grid.style.gap            = '0';
    grid.style.overflow       = 'visible';  // visible para que se vean las laterales
    grid.style.width          = (N * 88) + 'vw'; // ancho total del track
    grid.style.maxWidth       = 'none';
    grid.style.margin         = '0';
    grid.style.willChange     = 'transform';
    // Contenedor padre: overflow hidden para ocultar lo que sale
    const parent = grid.parentElement;
    if(parent){
      parent.style.overflow   = 'hidden';
      parent.style.position   = parent.style.position || 'relative';
    }
    cards.forEach(c => {
      c.style.flex      = `0 0 82vw`;
      c.style.maxWidth  = '82vw';
      c.style.margin    = '0 3vw';
      c.style.position  = '';
      c.style.left      = '';
      c.style.top       = '';
    });
    requestAnimationFrame(()=>requestAnimationFrame(()=> goTo(current, false)));
  }

  function resetDesktop(){
    grid.style.cssText = '';
    const parent = grid.parentElement;
    if(parent){ parent.style.overflow = ''; }
    cards.forEach(c => { c.style.cssText = ''; });
  }

  // Dots
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i, true)));

  // Touch swipe — escuchar en el PADRE (overflow:hidden) para no perder eventos
  const swipeTarget = grid.parentElement || grid;
  swipeTarget.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragging = true;
  }, {passive:true});
  swipeTarget.addEventListener('touchend', e => {
    if(!dragging || !isMobile()) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);
    // Solo swipe horizontal (ignora scroll vertical)
    if(Math.abs(dx) > 40 && Math.abs(dx) > dy){
      if(dx < 0) goTo(current + 1, true);
      else        goTo(current - 1, true);
    }
    dragging = false;
  }, {passive:true});

  // Resize
  let lastMob = isMobile();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const mob = isMobile();
      if(mob !== lastMob){
        lastMob = mob;
        mob ? setupMobile() : resetDesktop();
      } else if(mob){
        goTo(current, false); // recalcular offset si cambió ancho sin cambiar breakpoint
      }
    }, 100);
  }, {passive:true});

  // Init
  if(isMobile()) setupMobile();
})();


/* ── Malla de partículas del nav eliminada — se usan estrellas en won-right ── */


(function(){
  // Add intro class to ALL logos after 0.2s
  setTimeout(()=>{
    document.querySelectorAll('.logo').forEach(logo=>{
      logo.classList.add('logo-intro');
      // Remove class after animation completes so hover still works
      setTimeout(()=> logo.classList.remove('logo-intro'), 1100);
    });
  }, 200);
})();




const pfProjects = {
  marietic: {
    title: 'Marietic Beauty Studio',
    meta: 'Centro Estético · Catálogo de servicios con WhatsApp y redes sociales',
    url: 'https://www.marietic.com',
    poster: './videos/poster1.jpg'
  },
  monstercarr: {
    title: 'MonsterCarr',
    meta: 'Taller Automotriz · Latonería y pintura con presencia digital profesional',
    url: 'https://monstercarr.netlify.app',
    poster: './videos/poster2.jpg'
  },
  sofia: {
    title: 'Sofia Isabella',
    meta: 'Invitación 15 Años · Sitio web diseñado para celebrar una noche inolvidable',
    url: '/proyectos/sofia-isabella/',
    poster: './videos/poster3.jpg'
  }
};

(function(){
  const bg      = document.getElementById('pfModalBg');
  const img     = document.getElementById('pfModalImg');
  const closeBtn= document.getElementById('pfModalCloseBtn');

  function doClose(){
    bg.classList.remove('open');
    document.body.style.overflow = '';
    if(img) img.src = '';
  }

  if(closeBtn) closeBtn.addEventListener('click', doClose);
  bg.addEventListener('click', function(e){ if(e.target === bg) doClose(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') doClose(); });

  window.openPfModal = function(id){
    const p = pfProjects[id]; if(!p) return;
    document.getElementById('pfModalTitle').textContent = p.title;
    document.getElementById('pfModalMeta').textContent  = p.meta;
    document.getElementById('pfModalLink').href         = p.url;
    if(img){ img.src = p.poster; img.alt = p.title; }
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closePfModal = doClose;
})();


(function(){
  if(prefersReducedMotion) return;
  const sep = document.getElementById('ufoSeparator');
  if(!sep) return;

  // Colores y tamaños de asteroides
  const astColors = [
    'rgba(139,163,192,.5)',
    'rgba(61,155,255,.42)',
    'rgba(168,85,247,.4)',
    'rgba(110,140,190,.48)',
    'rgba(180,200,230,.35)'
  ];

  // Crear asteroides dinámicamente
  const count = 22;
  for(let i = 0; i < count; i++){
    const a = document.createElement('div');
    a.className = 'ufo-ast ' + (Math.random() > 0.5 ? 'go-r' : 'go-l');
    const s   = 3 + Math.random() * 6;
    const sh  = s * (0.45 + Math.random() * 0.55);
    const dur = 5 + Math.random() * 10;
    const del = -(Math.random() * 14);
    const top = 10 + Math.random() * 80;
    const col = astColors[Math.floor(Math.random() * astColors.length)];
    const rot = Math.random() * 360;
    a.style.cssText = `width:${s}px;height:${sh}px;background:${col};top:${top}%;`
      + `animation-duration:${dur}s;animation-delay:${del}s;`
      + `transform:rotate(${rot}deg);border-radius:40%`;
    sep.appendChild(a);
  }

  const allAnimEls = () => sep.querySelectorAll('.ufo-ast, .ufo-ship, .ufo-light, .ufo-star');

  document.addEventListener('visibilitychange', () => {
    const state = document.hidden ? 'paused' : 'running';
    allAnimEls().forEach(el => { el.style.animationPlayState = state; });
  });

  let sepVisible = false;
  const sepObs = new IntersectionObserver(entries => {
    sepVisible = entries[0].isIntersecting;
    const state = sepVisible ? 'running' : 'paused';
    allAnimEls().forEach(el => { el.style.animationPlayState = state; });
  }, { rootMargin: '100px' });
  sepObs.observe(sep);
})();


(function(){
  if(prefersReducedMotion) return;

  const sep   = document.getElementById('ufoSeparator');
  const ship  = document.getElementById('ufoShip');
  const h1El  = document.getElementById('ufoH1');

  // Construir spans de letra para el h1 (solo desktop, offsetParent != null)
  if(h1El && h1El.offsetParent !== null){
    const text = h1El.textContent.trim();
    h1El.innerHTML = '';
    for(let i = 0; i < text.length; i++){
      const sp = document.createElement('span');
      sp.className = 'ufo-letter' + (text[i] === ' ' ? ' sp' : '');
      sp.textContent = text[i] === ' ' ? ' ' : text[i];
      h1El.appendChild(sp);
    }
  }

  const allStats = [
    document.getElementById('ufoStat0'),
    document.getElementById('ufoStat1'),
    document.getElementById('ufoStat2')
  ];
  // En móvil ufoH1 tiene display:none → offsetParent null → no se incluye
  // En móvil los stats sí existen pero pueden estar en layout especial (display:contents)
  // Usamos allStats directamente para que en móvil también funcione la lógica de parar la nave
  const stats = allStats.filter(s => s != null);
  if(!sep || !ship || stats.length === 0) return;

  // Letras del h1 como unidades individuales a revelar
  const h1Letters = (h1El && h1El.offsetParent !== null)
    ? Array.from(h1El.querySelectorAll('.ufo-letter'))
    : [];
  const h1LetterRevealed = h1Letters.map(() => false);

  const revealed = stats.map(() => false);
  let active = false;
  let rafId  = null;

  function getStatPositions(){
    const sepRect = sep.getBoundingClientRect();
    return stats.map(st => {
      const r = st.getBoundingClientRect();
      return (r.left + r.width / 2 - sepRect.left) / sepRect.width;
    });
  }

  // Precalcular posición de cada letra relativa al separador (llamar tras primer RAF)
  let letterPositions = null;
  function getLetterPositions(){
    if(!h1Letters.length) return [];
    const sepRect = sep.getBoundingClientRect();
    return h1Letters.map(l => {
      const r = l.getBoundingClientRect();
      return (r.left + r.width / 2 - sepRect.left) / sepRect.width;
    });
  }

  function checkShipReveal(){
    const sepRect  = sep.getBoundingClientRect();
    const shipRect = ship.getBoundingClientRect();
    // Usamos el borde DERECHO de la nave: lo que ya pasó queda revelado
    const shipRight = shipRect.right;
    const shipRel   = (shipRight - sepRect.left) / sepRect.width;

    // Revelar letras: la nave ya pasó por encima de esa letra
    if(!letterPositions) letterPositions = getLetterPositions();
    letterPositions.forEach((lp, i) => {
      if(!h1LetterRevealed[i] && shipRel >= lp + 0.018){
        h1LetterRevealed[i] = true;
        // pequeño retraso escalonado tras el paso de la nave
        const delay = 80;
        setTimeout(() => h1Letters[i].classList.add('show'), delay);
      }
    });

    // Revelar stats con el centro de la nave (lógica original)
    const shipCX  = shipRect.left + shipRect.width / 2;
    const shipCRel = (shipCX - sepRect.left) / sepRect.width;
    const positions = getStatPositions();
    positions.forEach((pos, i) => {
      if(!revealed[i] && shipCRel >= pos + 0.06){
        revealed[i] = true;
        stats[i].classList.add('revealed');
      }
    });

    const lettersAllDone = h1LetterRevealed.length === 0 || h1LetterRevealed.every(r => r);
    const statsAllDone   = revealed.length === 0 || revealed.every(r => r);
    if(lettersAllDone && statsAllDone){ active = false; return; }
    rafId = requestAnimationFrame(checkShipReveal);
  }

  const obs = new IntersectionObserver(entries => {
    if(entries[0].isIntersecting && !active && !revealed.every(r => r)){
      active = true;

      // Fallback: si la nave ya terminó (display:none), revelar todo de golpe
      if(ship.style.display === 'none'){
        stats.forEach((s, i) => { revealed[i] = true; s.classList.add('revealed'); });
        if(h1Letters.length) h1Letters.forEach(l => l.classList.add('show'));
        active = false;
        return;
      }

      // Primera pasada única: infinite → 1
      ship.style.animationIterationCount = '1';
      ship.addEventListener('animationend', function onEnd(e){
        if(e.animationName === 'ufoMove'){
          ship.removeEventListener('animationend', onEnd);
          ship.style.transition = 'opacity .5s ease';
          ship.style.opacity    = '0';
          // Garantía: revelar todo lo que quedó pendiente sin importar si fue visto
          stats.forEach((s, i) => {
            if(!revealed[i]){ revealed[i] = true; s.classList.add('revealed'); }
          });
          if(h1Letters.length){
            h1Letters.forEach(l => l.classList.add('show'));
          }
          setTimeout(() => { ship.style.display = 'none'; }, 520);
        }
      });

      rafId = requestAnimationFrame(checkShipReveal);
    } else if(!entries[0].isIntersecting && rafId){
      cancelAnimationFrame(rafId); rafId = null; active = false;
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  obs.observe(sep);

  document.addEventListener('visibilitychange', () => {
    if(document.hidden && rafId){
      cancelAnimationFrame(rafId); rafId = null; active = false;
    } else if(!document.hidden && !active && !revealed.every(r => r)){
      const rect = sep.getBoundingClientRect();
      if(rect.top < window.innerHeight && rect.bottom > 0){
        active = true; rafId = requestAnimationFrame(checkShipReveal);
      }
    }
  });
})();

/* Hero y footer — abre el fullscreen global */
function openEasterEgg(){
  const eg = document.getElementById('easterEgg');
  eg.classList.add('eg-open');
  document.body.style.overflow = 'hidden';
  if(typeof trackCTA === 'function') trackCTA('easter-egg');
}
function closeEasterEgg(){
  const eg = document.getElementById('easterEgg');
  eg.classList.remove('eg-open');
  document.body.style.overflow = '';
}

/* Nav hamburguesa — fade cruzado DENTRO del menú, sin cerrarlo */
function openNavEasterEgg(){
  const inner = document.getElementById('navDropdownInner');
  const panel = document.getElementById('navEasterPanel');
  if(!inner || !panel) return;
  // Fade out links
  inner.style.transition = 'opacity .3s ease';
  inner.style.opacity    = '0';
  inner.style.pointerEvents = 'none';
  // Fade in panel en el mismo fondo
  setTimeout(() => {
    panel.style.opacity       = '1';
    panel.style.pointerEvents = 'all';
  }, 280);
  if(typeof trackCTA === 'function') trackCTA('easter-egg');
}
function closeNavEasterEgg(goToContact){
  const inner = document.getElementById('navDropdownInner');
  const panel = document.getElementById('navEasterPanel');
  const drop  = document.getElementById('navDropdown');
  const ham   = document.getElementById('hamburger');
  if(!inner || !panel) return;

  if(goToContact){
    // Cerrar menú completo y navegar
    drop.classList.remove('open');
    if(ham){ ham.classList.remove('open'); ham.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
    // Resetear estado interno
    panel.style.opacity = '0'; panel.style.pointerEvents = 'none';
    inner.style.opacity = '1'; inner.style.pointerEvents = '';
    return;
  }
  // Volver al menú: fade out panel, fade in links
  panel.style.transition = 'opacity .3s ease';
  panel.style.opacity    = '0';
  panel.style.pointerEvents = 'none';
  setTimeout(() => {
    inner.style.transition  = 'opacity .3s ease';
    inner.style.opacity     = '1';
    inner.style.pointerEvents = '';
  }, 280);
}

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    closeEasterEgg();
    closeNavEasterEgg(false);
  }
});


(function(){
  const banner=document.getElementById('cookie-banner');
  if(!banner) return;
  if(localStorage.getItem('cookie-consent')) return;
  setTimeout(()=>banner.classList.add('show'), 1500);
  document.getElementById('cookieAccept').addEventListener('click',()=>{
    localStorage.setItem('cookie-consent','accepted');
    banner.classList.remove('show');
  });
  document.getElementById('cookieDecline').addEventListener('click',()=>{
    localStorage.setItem('cookie-consent','declined');
    banner.classList.remove('show');
  });
})();


(function(){
  const sel = document.getElementById('contact-phone-code');
  if(!sel) return;
  // Mapa código ISO → prefijo telefónico
  const countryMap = {
    US:'+1',CA:'+1',AR:'+54',BO:'+591',BR:'+55',CL:'+56',
    CO:'+57',CR:'+506',CU:'+53',DE:'+49',EC:'+593',ES:'+34',
    FR:'+33',GB:'+44',GT:'+502',HN:'+504',HT:'+509',IT:'+39',
    MX:'+52',NI:'+505',PA:'+507',PE:'+51',PR:'+1787',
    PY:'+595',SV:'+503',UY:'+598',VE:'+58'
  };
  fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout?AbortSignal.timeout(4000):undefined})
    .then(r=>r.json())
    .then(d=>{
      const code = countryMap[d.country_code];
      if(code){
        for(let i=0;i<sel.options.length;i++){
          if(sel.options[i].value===code){ sel.selectedIndex=i; break; }
        }
      }
    })
    .catch(()=>{}); // silencioso si falla
})();


/* ── Estrellas en sección WEB/NADA (lado NADA) ── */
(function(){
  const wonRight = document.getElementById('wonRight');
  const wonMobBot = document.querySelector('.won-mob-bot');
  if(!wonRight && !wonMobBot) return;

  function addStars(container, count) {
    for(let i = 0; i < count; i++){
      const s = document.createElement('div');
      s.className = 'won-star';
      const size = 1 + Math.random() * 2;
      s.style.cssText = [
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + (Math.random() * 96) + '%',
        'top:'    + (Math.random() * 96) + '%',
        'animation-delay:' + -(Math.random() * 4) + 's',
        'animation-duration:' + (2 + Math.random() * 3) + 's'
      ].join(';');
      container.appendChild(s);
    }
  }

  if(wonRight)  addStars(wonRight, 55);
  if(wonMobBot) addStars(wonMobBot, 30);
})();
