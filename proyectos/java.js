const cEl=document.getElementById('cur'),c2=document.getElementById('cur2');
let mx=0,my=0,cx=0,cy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
  c2.style.left=mx+'px';c2.style.top=my+'px';});
(function lerp(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;
  cEl.style.left=cx+'px';cEl.style.top=cy+'px';requestAnimationFrame(lerp);})();
document.addEventListener('mousedown',()=>{cEl.style.width='14px';cEl.style.height='14px'});
document.addEventListener('mouseup',()=>{cEl.style.width='26px';cEl.style.height='26px'});

const LABELS=['Inicio','La Gran Revelación','La Espera','Programa','Confirmar'];
const scEls=[0,1,2,3,4].map(i=>document.getElementById('s'+i));
const dots=document.querySelectorAll('.nd');
const scLabel=document.getElementById('scLabel');
const photoBg=document.getElementById('photoBg');
const photoOv=document.getElementById('photoOverlay');
const vigEl=document.getElementById('vignette');
const doorsEl=document.getElementById('doorsStage');
const flash=document.getElementById('flash');

let cur=0,busy=false,doorsOpened=false;

function setPhotoState(sceneIdx, instant){
  const T=instant?'none':'transform 1.4s cubic-bezier(.25,.46,.45,.94), opacity 1.2s ease, filter 1.4s ease';
  photoBg.style.transition=T;
  if(sceneIdx===0){
    
    photoBg.style.opacity='0';
    photoBg.style.transform='scale(1.15)';
    photoBg.style.filter='none';
    photoOv.style.background='rgba(4,1,10,0)';
    vigEl.style.opacity='0';
  } else if(sceneIdx===1){
    
    photoBg.style.opacity='1';
    photoBg.style.transform='scale(1.08)';
    photoBg.style.filter='none';
    photoOv.style.background='rgba(4,1,10,.12)';
    vigEl.style.opacity='1';
  } else {
    
    photoBg.style.opacity='1';
    photoBg.style.transform='scale(1)';
    photoBg.style.filter='brightness(.80) saturate(.85)';
    photoOv.style.background='rgba(4,1,10,.15)';
    vigEl.style.opacity='1';
  }
}

function goTo(next){
  if(busy||next===cur||next<0||next>=5)return;
  busy=true;
  const dir=next>cur;
  const leaving=scEls[cur];
  const entering=scEls[next];
  const prev=cur;
  cur=next;

  
  flash.style.transition='background .18s ease';
  flash.style.background='rgba(201,169,110,.06)';
  setTimeout(()=>{flash.style.transition='background .6s ease';flash.style.background='rgba(201,169,110,0)';},180);

  
  leaving.style.transition='transform .7s ease';
  leaving.style.transform=dir?'translateY(-3.5%) scale(.97)':'translateY(3.5%) scale(.97)';
  leaving.style.pointerEvents='none';
  
  setTimeout(()=>{ leaving.style.opacity='0'; },50);
  leaving.classList.remove('on');

  
  setPhotoState(next);

  
  if(next===1&&!doorsOpened) openDoors();
  if(prev===1&&next===0){
    doorsEl.style.transition='opacity .8s ease';
    doorsEl.style.opacity='1';
    doorsEl.style.pointerEvents='all';
  }

  
  setTimeout(()=>{
    
    leaving.style.transition='none';
    leaving.style.opacity='0';
    leaving.style.transform='none';

    
    if(next===0){
      entering.querySelectorAll('.s0-crown,.s0-tag,.s0-name,.s0-rule,.s0-xv,.s0-date,.s0-hint').forEach(el=>{
        el.style.animation='none';
        el.style.opacity='1';
        el.style.transform='translateY(0)';
      });
      const crownSvg=entering.querySelector('.s0-crown svg');
      if(crownSvg) crownSvg.style.animation='float 5s ease-in-out infinite';
    }

    
    entering.classList.remove('scene-entering');
    entering.style.transition='none';
    entering.style.opacity='0';
    entering.style.transform=dir?'translateY(4%) scale(.96)':'translateY(-4%) scale(.96)';
    entering.classList.add('on');

    
    
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        entering.style.transition='transform .95s cubic-bezier(.25,.46,.45,.94)';
        entering.style.opacity='1';
        entering.style.transform='translateY(0) scale(1)';
        
        entering.classList.add('scene-entering');
      });
    });

    dots.forEach((d,i)=>d.classList.toggle('on',i===cur));
    scLabel.style.transition='opacity .3s ease';
    scLabel.style.opacity='0';
    setTimeout(()=>{scLabel.textContent=LABELS[cur];scLabel.style.opacity='1';},300);

    
    
    setTimeout(()=>{
      entering.style.transition='none';
      entering.style.opacity='1';
      entering.style.transform='none';
      busy=false;
    },1050);
    
    setTimeout(()=>{
      entering.classList.remove('scene-entering');
    },1600);
  },680);
}

function openDoors(){
  doorsOpened=true;
  doorsEl.classList.add('open');
  doorsEl.style.transition='opacity 1.2s 2.8s ease';
  setTimeout(()=>{
    doorsEl.style.opacity='0';
    doorsEl.style.pointerEvents='none';
  },2800);
  
  setTimeout(()=>{
    document.getElementById('s1cap').classList.add('show');
    document.getElementById('s1line').classList.add('show');
  },1800);
}

let wCool=false;
window.addEventListener('wheel',e=>{
  if(wCool||Math.abs(e.deltaY)<30)return;
  wCool=true;setTimeout(()=>wCool=false,1200);
  if(e.deltaY>0)goTo(cur+1);else goTo(cur-1);
},{passive:true});

let ty=0;
window.addEventListener('touchstart',e=>{ty=e.touches[0].clientY},{passive:true});
window.addEventListener('touchend',e=>{
  const d=ty-e.changedTouches[0].clientY;
  if(Math.abs(d)>60){if(d>0)goTo(cur+1);else goTo(cur-1);}
},{passive:true});

window.addEventListener('keydown',e=>{
  if([' ','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();goTo(cur+1);}
  if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goTo(cur-1);}
});

dots.forEach(d=>d.addEventListener('click',()=>goTo(+d.dataset.i)));

const evD=new Date('2025-06-14T19:00:00');
function tick(){
  let d=Math.max(0,evD-new Date());
  document.getElementById('cdD').textContent=String(Math.floor(d/86400000)).padStart(2,'0');
  document.getElementById('cdH').textContent=String(Math.floor(d%86400000/3600000)).padStart(2,'0');
  document.getElementById('cdM').textContent=String(Math.floor(d%3600000/60000)).padStart(2,'0');
  document.getElementById('cdS').textContent=String(Math.floor(d%60000/1000)).padStart(2,'0');
}
tick();setInterval(tick,1000);

const cv=document.getElementById('bgCanvas'),ctx=cv.getContext('2d');
function rsz(){cv.width=innerWidth;cv.height=innerHeight;}rsz();
window.addEventListener('resize',rsz);
const pts=[];
for(let i=0;i<110;i++){
  const p=Math.random()<.35;
  pts.push(p?{
    type:'p',x:Math.random()*innerWidth,y:Math.random()*innerHeight*2.2-innerHeight*0.6,
    sz:Math.random()*14+5,sx:(Math.random()-.5)*.5,sy:Math.random()*.7+.2,
    r:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.022,
    op:Math.random()*.3+.05,
    col:['#f4c2d0','#e8a0b8','#d4849e','#f9d4df'][Math.floor(Math.random()*4)]
  }:{
    type:'s',x:Math.random()*innerWidth,y:Math.random()*innerHeight,
    sz:Math.random()*2.2+.4,sx:(Math.random()-.5)*.15,sy:(Math.random()-.5)*.15,
    op:Math.random(),od:(Math.random()-.5)*.016,
    col:['#c9a96e','#e8d5a3','#fffdf5'][Math.floor(Math.random()*3)]
  });
}
(function loop(){
  ctx.clearRect(0,0,cv.width,cv.height);
  pts.forEach(p=>{
    if(p.type==='p'){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.globalAlpha=p.op;ctx.fillStyle=p.col;
      ctx.beginPath();ctx.ellipse(0,0,p.sz*.36,p.sz,0,0,Math.PI*2);ctx.fill();ctx.restore();
      p.x+=p.sx;p.y+=p.sy;p.r+=p.rs;
      if(p.y>cv.height+24){p.y=-24;p.x=Math.random()*cv.width;}
    }else{
      ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,p.op));
      ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=7;
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fill();ctx.restore();
      p.x+=p.sx;p.y+=p.sy;p.op+=p.od;
      if(p.op<=0||p.op>=1)p.od*=-1;
      if(p.x<0||p.x>cv.width)p.sx*=-1;
      if(p.y<0||p.y>cv.height)p.sy*=-1;
    }
  });
  requestAnimationFrame(loop);
})();

document.addEventListener('click',e=>{
  for(let i=0;i<14;i++){
    const s={type:'s',x:e.clientX,y:e.clientY,
      sz:Math.random()*3+.5,sx:(Math.random()-.5)*6,sy:(Math.random()-.5)*6,
      op:1,od:-.028,col:['#c9a96e','#f4c2d0','#fff','#ecdeb4'][Math.floor(Math.random()*4)]};
    pts.push(s);setTimeout(()=>pts.splice(pts.indexOf(s),1),4000);
  }
});

function sendRSVP(btn){
  const sp=btn.querySelector('span');
  sp.textContent='✦ ¡Confirmado con amor! ✦';
  btn.style.borderColor='rgba(110,201,122,.7)';btn.style.color='#a8e6b0';
  setTimeout(()=>{sp.textContent='Con mucho gusto asistiré ✦';btn.style.borderColor='';btn.style.color='';},4000);
}

setPhotoState(0,true);

scEls.forEach((el,i)=>{
  el.style.transition='none';
  el.style.opacity= i===0 ? '1' : '0';
  el.style.transform='none';
});