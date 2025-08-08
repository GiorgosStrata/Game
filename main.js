// main.js
// Wire UI -> battle logic -> rendering loop

// Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const weaponASelect = document.getElementById('weaponA');
const weaponBSelect = document.getElementById('weaponB');
const abilitiesAEl = document.getElementById('abilitiesA');
const abilitiesBEl = document.getElementById('abilitiesB');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedRange = document.getElementById('speed');
const logEl = document.getElementById('log');
const statusAEl = document.getElementById('statusA');
const statusBEl = document.getElementById('statusB');

// fill weapon selects
Object.keys(WeaponTypes).forEach(k=>{
  const o1 = document.createElement('option'); o1.value = k; o1.innerText = k;
  const o2 = o1.cloneNode(true);
  weaponASelect.appendChild(o1);
  weaponBSelect.appendChild(o2);
});

// fill ability pickers
Object.keys(AbilityDefs).forEach(k=>{
  const btnA = document.createElement('div'); btnA.className = 'ability'; btnA.innerText = k;
  const btnB = document.createElement('div'); btnB.className = 'ability'; btnB.innerText = k;
  btnA.addEventListener('click', ()=> btnA.classList.toggle('selected'));
  btnB.addEventListener('click', ()=> btnB.classList.toggle('selected'));
  abilitiesAEl.appendChild(btnA);
  abilitiesBEl.appendChild(btnB);
});

// initial fighters
let fighterA = new Fighter('A', weaponASelect.value || 'Spear', []);
let fighterB = new Fighter('B', weaponBSelect.value || 'Dagger', []);
let battle = new Battle(fighterA, fighterB);

// update selects to default choices
weaponASelect.value = 'Spear';
weaponBSelect.value = 'Dagger';

// UI actions
startBtn.addEventListener('click', ()=>{
  // read UI choices into fighters (sandbox mode)
  const wA = weaponASelect.value;
  const wB = weaponBSelect.value;
  const abilA = Array.from(abilitiesAEl.children).filter(c=>c.classList.contains('selected')).map(c=>c.innerText);
  const abilB = Array.from(abilitiesBEl.children).filter(c=>c.classList.contains('selected')).map(c=>c.innerText);

  // set fighter weapons & abilities
  fighterA.setWeapon(wA); fighterA.abilities = abilA.slice(0,3);
  fighterB.setWeapon(wB); fighterB.abilities = abilB.slice(0,3);

  battle = new Battle(fighterA, fighterB);
  battle.start();
  log('Fight started: ' + fighterA.weaponKey + ' vs ' + fighterB.weaponKey);
  updateStatus();
});

pauseBtn.addEventListener('click', ()=>{
  if(battle.state === 'FIGHTING'){ battle.pause(); pauseBtn.innerText = 'Resume'; log('Paused'); }
  else if(battle.state === 'PAUSED'){ battle.resume(); pauseBtn.innerText = 'Pause'; log('Resumed'); }
});

stepBtn.addEventListener('click', ()=>{
  // single-frame advance regardless of state
  if(battle.state === 'PAUSED' || battle.state === 'IDLE' || battle.state === 'FIGHTING'){
    battle.update();
    render();
    updateStatus();
  }
});

resetBtn.addEventListener('click', ()=>{
  // new random fighters but keep UI selections
  const wA = weaponASelect.value; const wB = weaponBSelect.value;
  fighterA = new Fighter('A', wA, []);
  fighterB = new Fighter('B', wB, []);
  // re-apply selected abilities
  const abilA = Array.from(abilitiesAEl.children).filter(c=>c.classList.contains('selected')).map(c=>c.innerText);
  const abilB = Array.from(abilitiesBEl.children).filter(c=>c.classList.contains('selected')).map(c=>c.innerText);
  fighterA.abilities = abilA.slice(0,3); fighterB.abilities = abilB.slice(0,3);
  battle = new Battle(fighterA, fighterB);
  battle._placeFighters();
  log('Fighters reset');
  render();
  updateStatus();
});

// small helpers
function log(txt){ logEl.innerText = txt; }
function updateStatus(){
  statusAEl.innerText = `HP: ${Math.max(0, Math.round(fighterA.hp))}/${fighterA.maxHp}\nWeapon: ${fighterA.weaponKey}\nDmg:${fighterA.dmg} Range:${fighterA.range} SPD:${fighterA.speed.toFixed(2)}\nAbilities: ${fighterA.abilities.join(', ') || '—'}`;
  statusBEl.innerText = `HP: ${Math.max(0, Math.round(fighterB.hp))}/${fighterB.maxHp}\nWeapon: ${fighterB.weaponKey}\nDmg:${fighterB.dmg} Range:${fighterB.range} SPD:${fighterB.speed.toFixed(2)}\nAbilities: ${fighterB.abilities.join(', ') || '—'}`;
}

// rendering
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  renderBackground();
  renderArena();
  renderFighter(fighterA, 'left');
  renderFighter(fighterB, 'right');
  renderFX();
  renderHUD();
}

function render(){
  draw();
  updateStatus();
  // show winner message in log if finished
  if(battle.state === 'FINISHED'){
    log(`Winner: ${battle.winner.id} (${battle.winner.weaponKey})`);
  }
}

function renderBackground(){
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'#061425'); g.addColorStop(1,'#041023');
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
}
function renderArena(){
  ctx.fillStyle = '#071122'; ctx.fillRect(0, canvas.height*0.72, canvas.width, canvas.height*0.28);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.beginPath(); ctx.moveTo(canvas.width/2, canvas.height*0.72); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
}

function renderFighter(f, side){
  // body
  ctx.save();
  ctx.translate(f.x, f.y);
  // shadow
  ctx.beginPath();
  ctx.ellipse(8, 60, 46, 18, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();

  // draw weapon sprite rotated to face opponent
  const facing = (side === 'left') ? 1 : -1;
  const img = new Image();
  img.src = f.sprite;
  // draw asynchronously — to avoid reloading each frame, cache images (simple)
  if(!renderFighter._cache) renderFighter._cache = {};
  if(!renderFighter._cache[f.sprite]){
    const cacheImg = new Image();
    cacheImg.src = f.sprite;
    renderFighter._cache[f.sprite] = cacheImg;
  }
  const cache = renderFighter._cache[f.sprite];
  const scale = 0.9;
  const angle = facing === 1 ? 0.18 : -0.18;
  ctx.save();
  ctx.rotate(angle);
  ctx.drawImage(cache, -12 * facing, -10, cache.width * 0.9, cache.height * 0.9);
  ctx.restore();

  // circular body
  ctx.beginPath();
  ctx.arc(0,0,28,0,Math.PI*2); ctx.fillStyle = '#07172b'; ctx.fill();
  // emblem
  ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fillStyle = f.color; ctx.fill();
  ctx.restore();
}

function renderFX(){
  battle.fx.forEach(f=>{
    if(f.type === 'spark'){
      ctx.fillStyle = 'rgba(255,220,120,0.7)';
      ctx.beginPath(); ctx.arc(f.x, f.y, 8*(f.life/36), 0, Math.PI*2); ctx.fill();
    } else if(f.type === 'burn'){
      ctx.fillStyle = 'rgba(255,90,40,0.35)';
      ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, Math.PI*2); ctx.fill();
    } else if(f.type === 'explosion'){
      ctx.fillStyle = 'rgba(255,130,60,0.12)';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r*(f.life/36), 0, Math.PI*2); ctx.fill();
    } else if(f.type === 'bigkill'){
      ctx.fillStyle = 'rgba(255,220,120,0.08)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    } else if(f.type === 'ice'){
      ctx.fillStyle = 'rgba(160,230,255,0.18)';
      ctx.beginPath(); ctx.arc(f.x, f.y, 12, 0, Math.PI*2); ctx.fill();
    } else if(f.type === 'heal'){
      ctx.fillStyle = 'rgba(160,255,180,0.22)';
      ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, Math.PI*2); ctx.fill();
    } else if(f.type === 'stun'){
      ctx.fillStyle = 'rgba(255,255,180,0.18)';
      ctx.beginPath(); ctx.arc(f.x, f.y, 14, 0, Math.PI*2); ctx.fill();
    }
  });
}

function renderHUD(){
  // top bars
  const pad = 24;
  const barW = 300;
  // A
  drawHealthBar(fighterA, pad, 28, barW);
  drawHealthBar(fighterB, canvas.width - pad - barW, 28, barW);
}
function drawHealthBar(f, x, y, w){
  ctx.fillStyle = '#091a1f'; ctx.fillRect(x-2,y-6,w+4,20);
  ctx.fillStyle = '#143036'; ctx.fillRect(x,y,w,14);
  const pct = Math.max(0, f.hp / f.maxHp);
  ctx.fillStyle = f.color; ctx.fillRect(x, y, w*pct, 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.strokeRect(x-2,y-6,w+4,20);
  ctx.fillStyle = '#d9f2ff'; ctx.font = '600 16px Inter';
  ctx.fillText(`${f.id} — ${f.weaponKey}`, x, y-10);
}

// main loop
let last = performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const speed = parseFloat(speedRange.value);
  const dt = (now - last) * 0.06 * speed; last = now;

  // slow-mo handling
  let steps = 1;
  if(battle.slowMoFor && battle.slowMoFor > 0){
    steps = 0.18;
    battle.slowMoFor--;
  }

  // advance a variable number of update steps (integer)
  const count = Math.max(1, Math.round(steps * speed));
  for(let i=0;i<count;i++){
    battle.update();
  }

  // if battle finished, ensure no further attacks happen and render final
  render();

  // if finished, show winner and keep state until reset/start pressed
  if(battle.state === 'FINISHED'){
    // nothing else: user must press Reset or Start to continue
  }
}
requestAnimationFrame(loop);

// initial render
fighterA.setWeapon(weaponASelect.value || 'Spear');
fighterB.setWeapon(weaponBSelect.value || 'Dagger');
battle._placeFighters();
render();
updateStatus();
log('Ready. Choose weapons & abilities, then Start.');
