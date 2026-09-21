const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const songs=Array.from({length:21},(_,i)=>({title:`Canción del mes ${i+1}`,artist:`Mes ${i+1} · Brian & Noelia`,src:`musica/mes${i+1}/cancion1.mp3`,icon:String(i+1).padStart(2,'0')}));
const secretSong={title:'Sorpresa',artist:'Canción desbloqueada ♡',src:'musica/regalo/sopresa.mp3',icon:'🎁',secret:true};
const audio=$('#audio-element');let songIndex=0,isPlaying=false;
function visibleSongs(){return localStorage.getItem('giftUnlocked')==='yes'?[...songs,secretSong]:songs}
function renderSongList(){const box=$('#song-list');box.innerHTML='';visibleSongs().forEach((s,i)=>{const b=document.createElement('button');b.className='song-row'+(i===songIndex?' active':'');b.innerHTML=`<span>${s.icon}</span><span><b>${s.title}</b><small>${s.artist}</small></span>`;b.onclick=()=>{loadSong(i,true);$('#song-menu').hidden=true};box.appendChild(b)});if(localStorage.getItem('giftUnlocked')!=='yes'){const d=document.createElement('div');d.className='song-row locked';d.innerHTML='<span>🔒</span><span><b>Sorpresa</b><small>Completa los 3 niveles</small></span>';box.appendChild(d)}}
function loadSong(i,autoplay=false){const list=visibleSongs();songIndex=(i+list.length)%list.length;const s=list[songIndex];audio.pause();isPlaying=false;$('#btn-play').textContent='▶';$('#song-title').textContent=s.title;$('#artist-name').textContent=s.artist;$('#album-art').textContent=s.icon;audio.src=s.src;audio.load();renderSongList();if(autoplay)playCurrent()}
function playCurrent(){audio.play().then(()=>{isPlaying=true;$('#btn-play').textContent='Ⅱ';$('#record').classList.add('spinning')}).catch(()=>{})}
function formatTime(v){return Number.isFinite(v)?`${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`:'0:00'}
$('#btn-play').onclick=()=>{if(isPlaying){audio.pause()}else playCurrent()};audio.onpause=()=>{isPlaying=false;$('#btn-play').textContent='▶';$('#record').classList.remove('spinning')};audio.onplay=()=>{isPlaying=true;$('#btn-play').textContent='Ⅱ';$('#record').classList.add('spinning')};$('#btn-next').onclick=()=>loadSong(songIndex+1,true);$('#btn-prev').onclick=()=>loadSong(songIndex-1,true);$('#queue-toggle').onclick=()=>{$('#song-menu').hidden=!$('#song-menu').hidden;renderSongList()};$('#queue-close').onclick=()=>$('#song-menu').hidden=true;$('#volume').oninput=e=>audio.volume=e.target.value;$('#progress-bar').oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/100};audio.ontimeupdate=()=>{$('#current-time').textContent=formatTime(audio.currentTime);$('#duration-time').textContent=formatTime(audio.duration);if(audio.duration)$('#progress-bar').value=audio.currentTime/audio.duration*100};audio.onended=()=>loadSong(songIndex+1,true);audio.volume=.8;

let completed=Number(localStorage.getItem('gameProgress')||0);function updateProgress(){$$('.progress-node').forEach((n,i)=>{n.classList.toggle('done',i<completed);n.classList.toggle('active',i===completed)});if(completed>=3){$$('.progress-node')[3].classList.add('active')}}
function showLevel(n){$$('.level').forEach(x=>x.classList.remove('active'));$('#level-'+n).classList.add('active');$('#level-'+n).scrollIntoView({behavior:'smooth',block:'center'})}
function levelComplete(n){playWinSound();confetti();completed=Math.max(completed,n);localStorage.setItem('gameProgress',completed);updateProgress();$('#level-dialog-title').textContent=n===1?'¡Encontraste todos los pares! ❤️':n===2?'¡Torre terminada! 🍰':'¡El sapito llegó! 🐸';$('#level-dialog-text').textContent=n<3?`Superaste la prueba ${n}. Te espera el nivel ${n+1}.`:'Ya completaste las tres pruebas. Tu regalo está listo para desbloquearse.';$('#level-next').textContent=n<3?'Ir al siguiente nivel':'Desbloquear mi regalo';$('#level-next').onclick=()=>{$('#level-dialog').close();if(n<3)showLevel(n+1);else showGift()};$('#level-dialog').showModal()}

// NIVEL 1: Flappy sapito
const fc=$('#flappy-canvas'),f=fc.getContext('2d');let frog,pipes,flappyRun=false,flappyAnim,passed=0,frame=0;
function resizeCanvas(c){const r=c.getBoundingClientRect();c.width=Math.max(600,Math.floor(r.width*devicePixelRatio));c.height=Math.floor(Math.min(440,r.width*.47)*devicePixelRatio)}
function resetFlappy(){resizeCanvas(fc);frog={x:fc.width*.18,y:fc.height*.45,vy:0,r:22*devicePixelRatio};pipes=[];passed=0;frame=0;$('#flappy-score').textContent=0;drawFlappy()}
function flap(){if(flappyRun)frog.vy=-7.2*devicePixelRatio}
function drawFlappy(){const w=fc.width,h=fc.height;f.clearRect(0,0,w,h);let g=f.createLinearGradient(0,0,0,h);g.addColorStop(0,'#67345c');g.addColorStop(1,'#251321');f.fillStyle=g;f.fillRect(0,0,w,h);f.fillStyle='#ffffff10';for(let i=0;i<18;i++){f.beginPath();f.arc((i*97+frame*.25)%w,(i*71)%h,2*devicePixelRatio,0,7);f.fill()}pipes.forEach(p=>{f.fillStyle='#c78a62';f.fillRect(p.x,0,p.w,p.top);f.fillRect(p.x,p.bottom,p.w,h-p.bottom);f.fillStyle='#f0bd7e';f.fillRect(p.x-5*devicePixelRatio,p.top-14*devicePixelRatio,p.w+10*devicePixelRatio,14*devicePixelRatio);f.fillRect(p.x-5*devicePixelRatio,p.bottom,p.w+10*devicePixelRatio,14*devicePixelRatio)});f.font=`${34*devicePixelRatio}px serif`;f.textAlign='center';f.textBaseline='middle';f.fillText('🪽🐸🪽',frog.x,frog.y)}
function flappyLoop(){if(!flappyRun)return;frame++;const w=fc.width,h=fc.height,scale=devicePixelRatio;frog.vy+=.38*scale;frog.y+=frog.vy;if(frame%95===0){const gap=185*scale,margin=52*scale,top=margin+Math.random()*(h-gap-margin*2);pipes.push({x:w+20*scale,w:66*scale,top,bottom:top+gap,done:false})}for(const p of pipes){p.x-=3.4*scale;if(!p.done&&p.x+p.w<frog.x){p.done=true;passed++;$('#flappy-score').textContent=passed;if(passed>=5){flappyRun=false;cancelAnimationFrame(flappyAnim);drawFlappy();levelComplete(3);return}}if(frog.x+frog.r>p.x&&frog.x-frog.r<p.x+p.w&&(frog.y-frog.r<p.top||frog.y+frog.r>p.bottom)){return failFlappy()}}pipes=pipes.filter(p=>p.x+p.w>-10);if(frog.y-frog.r<0){frog.y=frog.r;frog.vy=Math.abs(frog.vy)*.45}else if(frog.y+frog.r>h){frog.y=h-frog.r;frog.vy=-Math.abs(frog.vy)*.55}drawFlappy();flappyAnim=requestAnimationFrame(flappyLoop)}
function failFlappy(){flappyRun=false;cancelAnimationFrame(flappyAnim);playLoseSound();$('#flappy-fail-dialog').showModal()}
function startFlappy(){if(flappyRun)return;resetFlappy();flappyRun=true;$('#flappy-start').hidden=true;flappyLoop()}$('#flappy-start').onclick=startFlappy;$('#flappy-retry').onclick=()=>{$('#flappy-fail-dialog').close();startFlappy()};fc.addEventListener('pointerdown',e=>{e.preventDefault();if(!flappyRun)startFlappy();else flap()});addEventListener('keydown',e=>{if(e.code==='Space'&&$('#level-3').classList.contains('active')){e.preventDefault();if(!flappyRun)startFlappy();else flap()}});

// NIVEL 2: torre dulce
const sc=$('#stack-canvas'),s=sc.getContext('2d');
let blocks=[],moving,stackRun=false,stackAnim,dir=1,fallingPieces=[];

function resetStack(){
  resizeCanvas(sc);
  const w=sc.width,h=sc.height,scale=devicePixelRatio;
  const baseW=270*scale;
  blocks=[{x:(w-baseW)/2,y:h-48*scale,w:baseW,h:32*scale,flavor:0}];
  moving={x:0,y:h-80*scale,w:baseW,h:32*scale,flavor:1};
  fallingPieces=[]; dir=1;
  $('#stack-score').textContent=0;
  $('#stack-start').textContent='Empezar nivel';
  drawStack();
}
function roundRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function drawCake(b,i){
  const scale=devicePixelRatio;
  const palettes=[['#5b2b20','#9b5038','#f4c5a8'],['#d98ca3','#f3b8c8','#fff0e5'],['#9b673f','#d7a66f','#fff0c8'],['#f1dfbd','#fff4dc','#d49b6a'],['#b76a72','#eaa3a7','#ffe0cf'],['#6e3c2b','#b86f4e','#f4d4ad']];
  const c=palettes[(b.flavor??i)%palettes.length];
  s.fillStyle=c[0];roundRect(s,b.x,b.y,b.w,b.h,7*scale);
  s.fillStyle=c[1];roundRect(s,b.x,b.y,b.w,Math.max(8*scale,b.h*.42),7*scale);
  s.fillStyle=c[2];
  const dollops=Math.max(2,Math.floor(b.w/(42*scale)));
  for(let k=0;k<dollops;k++){const x=b.x+(k+.5)*b.w/dollops;s.beginPath();s.arc(x,b.y+5*scale,4.5*scale,0,Math.PI*2);s.fill()}
  s.fillStyle='#ffffff35';s.fillRect(b.x+8*scale,b.y+8*scale,Math.max(0,b.w-16*scale),2*scale);
}
function drawStack(){
  const w=sc.width,h=sc.height,scale=devicePixelRatio;
  s.clearRect(0,0,w,h);let g=s.createLinearGradient(0,0,0,h);g.addColorStop(0,'#4b2446');g.addColorStop(1,'#1d101a');s.fillStyle=g;s.fillRect(0,0,w,h);
  // mesa
  s.fillStyle='#ffffff0d';s.fillRect(0,h-16*scale,w,16*scale);
  blocks.forEach((b,i)=>drawCake(b,i)); if(moving)drawCake(moving,blocks.length);
  fallingPieces.forEach((b,i)=>drawCake(b,i+3));
}
function stackLoop(){
  if(!stackRun)return;
  const scale=devicePixelRatio;
  moving.x+=4.0*scale*dir;
  if(moving.x<=0){moving.x=0;dir=1}else if(moving.x+moving.w>=sc.width){moving.x=sc.width-moving.w;dir=-1}
  for(const p of fallingPieces){p.y+=p.vy;p.vy+=.38*scale;p.x+=p.vx}
  fallingPieces=fallingPieces.filter(p=>p.y<sc.height+80*scale);
  drawStack();stackAnim=requestAnimationFrame(stackLoop)
}
function dropBlock(){
  if(!stackRun)return;
  const scale=devicePixelRatio,prev=blocks[blocks.length-1];
  const left=Math.max(prev.x,moving.x),right=Math.min(prev.x+prev.w,moving.x+moving.w),overlap=right-left;
  // Solo pierde cuando realmente no toca absolutamente nada de la torre.
  if(overlap<=0){
    fallingPieces.push({...moving,vx:dir*1.4*scale,vy:2*scale});moving=null;stackRun=false;cancelAnimationFrame(stackAnim);drawStack();
    $('#stack-start').textContent='La torre cayó · reintentar';$('#stack-start').hidden=false;return;
  }
  // La parte que queda afuera se corta y cae visualmente; la parte apoyada permanece.
  if(moving.x<left)fallingPieces.push({x:moving.x,y:moving.y,w:left-moving.x,h:moving.h,flavor:moving.flavor,vx:-1.2*scale,vy:1.5*scale});
  if(moving.x+moving.w>right)fallingPieces.push({x:right,y:moving.y,w:moving.x+moving.w-right,h:moving.h,flavor:moving.flavor,vx:1.2*scale,vy:1.5*scale});
  blocks.push({x:left,y:moving.y,w:overlap,h:moving.h,flavor:moving.flavor});
  const score=blocks.length-1;$('#stack-score').textContent=score;
  if(score>=17){stackRun=false;cancelAnimationFrame(stackAnim);moving=null;drawStack();levelComplete(2);return}
  let newY=moving.y-32*scale;
  if(newY<75*scale){blocks.forEach(b=>b.y+=32*scale);fallingPieces.forEach(b=>b.y+=32*scale);newY+=32*scale}
  const nextFlavor=(moving.flavor+1)%6;
  moving={x:dir>0?0:sc.width-overlap,y:newY,w:overlap,h:32*scale,flavor:nextFlavor};dir*=-1;
}
$('#stack-start').onclick=()=>{resetStack();stackRun=true;$('#stack-start').hidden=true;stackLoop()};
sc.addEventListener('pointerdown',e=>{e.preventDefault();dropBlock()});

// NIVEL 1: memoria — 18 cartas / 9 parejas con imágenes PNG
const memoryImages=[
  'images/memory/01_fresa.png','images/memory/02_flor.png','images/memory/03_sapo.png',
  'images/memory/04_torta.png','images/memory/05_carta.png','images/memory/06_corazon.png',
  'images/memory/07_estrella.png','images/memory/08_regalo.png','images/memory/09_luna.png'
];
let first=null,lock=false,matches=0;
function resetMemory(){
  const vals=[...memoryImages,...memoryImages].sort(()=>Math.random()-.5),board=$('#memory-board');
  board.innerHTML='';first=null;lock=false;matches=0;$('#memory-score').textContent=0;
  vals.forEach((v,i)=>{const b=document.createElement('button');b.className='memory-card';b.dataset.value=v;b.innerHTML=`<span class="memory-back">♡</span><span class="memory-front"><img src="${v}" alt="Carta de memoria"></span>`;b.onclick=()=>flipCard(b);board.appendChild(b)})
}
function flipCard(b){if(lock||b.classList.contains('flipped')||b.classList.contains('matched'))return;b.classList.add('flipped');if(!first){first=b;return}if(first.dataset.value===b.dataset.value){first.classList.add('matched');b.classList.add('matched');first=null;matches++;$('#memory-score').textContent=matches;if(matches===9)setTimeout(()=>levelComplete(1),450)}else{lock=true;const a=first;first=null;setTimeout(()=>{a.classList.remove('flipped');b.classList.remove('flipped');lock=false},700)}}
$('#memory-start').onclick=resetMemory;

// Chat + entrenamiento privado
const starter=[{q:'te amo',a:'yo te amo más boba, muchísimo más ❤️'},{q:'cuanto me amas',a:'un montón, más de lo que entra en esta página ❤️'},{q:'regalo',a:'jijiji no te voy a spoilear. Primero gana los tres niveles, rata ❤️'},{q:'recuerdo',a:'Hay demasiados. Por eso el álbum dice “muy pronto”… no pienso dejar nuestros recuerdos a medias.'}];
function ownTraining(){try{return JSON.parse(localStorage.getItem('brianTraining')||'[]')}catch{return[]}}function norm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').trim()}function botReply(t){const c=norm(t);let best=null,score=0;for(const e of [...starter,...ownTraining()]){const words=norm(e.q).split(/\s+/).filter(w=>w.length>2),hits=words.filter(w=>c.includes(w)).length,now=words.length?hits/words.length:0;if(now>score){score=now;best=e}}return best&&score>=.5?best.a:'Jajaja todavía no sé responder eso como Brian. Pero puedo seguir aprendiendo ❤️'}
function appendMessage(t,who){const d=document.createElement('div');d.className=`message ${who}-message`;d.textContent=t;$('#chat-messages').appendChild(d);$('#chat-messages').scrollTop=$('#chat-messages').scrollHeight}function sendMessage(t){if(!t.trim())return;appendMessage(t,'user');setTimeout(()=>appendMessage(botReply(t),'bot'),400)}
$('#chat-form').onsubmit=e=>{e.preventDefault();sendMessage($('#user-input').value);$('#user-input').value=''};$$('.quick-prompts button').forEach(b=>b.onclick=()=>sendMessage(b.dataset.prompt));
function renderTraining(){const own=ownTraining(),box=$('#training-list');box.innerHTML='';own.forEach((e,i)=>{const d=document.createElement('div');d.className='training-item';d.textContent=`“${e.q}” → ${e.a}`;const x=document.createElement('button');x.textContent='×';x.onclick=()=>{own.splice(i,1);localStorage.setItem('brianTraining',JSON.stringify(own));renderTraining()};d.prepend(x);box.appendChild(d)})}
const ADMIN_PASSWORD='brian';$('#trainer-secret').onclick=()=>$('#admin-lock').showModal();$('#admin-form').onsubmit=e=>{e.preventDefault();if(norm($('#admin-password').value)===ADMIN_PASSWORD){$('#admin-lock').close();renderTraining();$('#trainer-dialog').showModal();$('#admin-password').value=''}else $('#admin-error').textContent='Clave incorrecta'};$('#trainer-form').onsubmit=e=>{e.preventDefault();const own=ownTraining();own.push({q:$('#training-input').value.trim(),a:$('#training-answer').value.trim()});localStorage.setItem('brianTraining',JSON.stringify(own));e.target.reset();renderTraining()};

function showGift(){const unlocked=localStorage.getItem('giftUnlocked')==='yes',ready=completed>=3;$('#gift-locked-games').hidden=ready||unlocked;$('#gift-lock').hidden=!ready||unlocked;$('#gift-win').hidden=!unlocked;$('#gift-dialog').showModal()}
function confetti(){const box=$('#confetti');box.innerHTML='';for(let i=0;i<110;i++){const p=document.createElement('i');p.textContent=['✦','♥','●','★'][i%4];p.style.left=Math.random()*100+'vw';p.style.animationDelay=Math.random()*1.4+'s';p.style.setProperty('--drift',(Math.random()*220-110)+'px');p.style.fontSize=(10+Math.random()*20)+'px';box.appendChild(p)}setTimeout(()=>box.innerHTML='',6500)}
function unlockGift(){localStorage.setItem('giftUnlocked','yes');$('#gift-lock').hidden=true;$('#gift-win').hidden=false;$('#final-prize').hidden=true;$('#celebrate-btn').hidden=false;$('#celebrate-count').textContent='0 / 7';celebrateClicks=0;updateProgress();renderSongList()}
$('#gift-open').onclick=showGift;$('#back-to-game').onclick=()=>{$('#gift-dialog').close();showLevel(Math.min(completed+1,3))};$('#gift-form').onsubmit=e=>{e.preventDefault();if($('#gift-password').value.replace(/\D/g,'')==='050125')unlockGift();else{$('#gift-error').textContent='Esa no es nuestra fecha… intenta otra vez ♡';$('#gift-password').select()}};$('#album-soon').onclick=()=>$('#album-dialog').showModal();$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());


function tone(freq,start,dur,type='sine',vol=.08){try{const C=window.AudioContext||window.webkitAudioContext,ctx=window.__gameAudio||(window.__gameAudio=new C()),o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime+start);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+start+dur);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+start);o.stop(ctx.currentTime+start+dur)}catch(e){}}
function playWinSound(){tone(523,0,.13,'triangle');tone(659,.12,.13,'triangle');tone(784,.24,.2,'triangle');tone(1047,.39,.35,'triangle')}
function playLoseSound(){tone(330,0,.16,'square',.045);tone(247,.15,.18,'square',.045);tone(196,.31,.28,'square',.045)}
let celebrateClicks=0;
const partyIds=['19457094','12302383','7276342','15881288','15509299','6971491121048290146','20596681','6653374357598496313'];
function launchParty(){confetti();playWinSound();const layer=$('#party-gifs');layer.innerHTML='';layer.classList.add('show');for(let i=0;i<12;i++){const d=document.createElement('div');d.className='party-gif';d.style.left=(2+Math.random()*78)+'vw';d.style.top=(4+Math.random()*68)+'vh';d.style.transform=`rotate(${Math.random()*18-9}deg) scale(${.72+Math.random()*.42})`;d.innerHTML=`<div class="tenor-gif-embed" data-postid="${partyIds[i%partyIds.length]}" data-share-method="host" data-aspect-ratio="1" data-width="100%"></div>`;layer.appendChild(d)}if(window.Tenor&&Tenor.init)Tenor.init();else{const old=document.querySelector('script[src="https://tenor.com/embed.js"]');if(old){const n=document.createElement('script');n.src=old.src;n.async=true;document.body.appendChild(n)}}$('#celebrate-btn').hidden=true;$('#celebrate-count').textContent='¡A CELEBRAR! ♥';$('#final-prize').hidden=false;loadSong(visibleSongs().length-1,true);setTimeout(()=>{layer.classList.remove('show');layer.innerHTML=''},12000)}
$('#celebrate-btn').onclick=()=>{celebrateClicks++;$('#celebrate-count').textContent=celebrateClicks+' / 7';tone(420+celebrateClicks*45,0,.08,'triangle',.035);$('#celebrate-btn').style.transform=`scale(${1+celebrateClicks*.025}) rotate(${celebrateClicks%2?'-2':'2'}deg)`;if(celebrateClicks>=7)launchParty()};
updateProgress();resetFlappy();resetStack();resetMemory();loadSong(0);if(completed>0&&completed<3)showLevel(completed+1);
addEventListener('resize',()=>{if(!flappyRun)resetFlappy();if(!stackRun)resetStack()});
