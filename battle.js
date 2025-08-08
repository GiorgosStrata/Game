// battle.js
// Contains Fighter class and Battle state machine.
// States: IDLE, FIGHTING, PAUSED, FINISHED

class Fighter {
  constructor(id, weaponKey, abilities=[]){
    this.id = id;
    this.setWeapon(weaponKey);
    this.abilities = Array.from(abilities);
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.x = 0; this.y = 0;
    this.vx = 0; this.stunned = 0;
    this.cooldown = 0;
    this._burn = null;
    this._ice = 0;
    this.speedMul = 1;
    this.color = randomPalette();
  }

  setWeapon(weaponKey){
    const def = WeaponTypes[weaponKey];
    if(!def) throw new Error('Unknown weapon: ' + weaponKey);
    this.weaponKey = weaponKey;
    this.range = def.range;
    this.speed = def.speed;
    this.dmg = def.dmg;
    this.sprite = def.sprite;
    this.tipOffset = def.tipOffset || 36;
  }

  resetState(){
    this.hp = this.maxHp;
    this.cooldown = 0;
    this.stunned = 0;
    this._burn = null;
    this._ice = 0;
    this.speedMul = 1;
  }
}

class Battle {
  constructor(A, B){
    this.A = A; this.B = B;
    this.state = 'IDLE'; // IDLE, FIGHTING, PAUSED, FINISHED
    this.t = 0;
    this.fx = [];
    this.cameraShake = 0;
    this.winner = null;
    this.slowMoFor = 0;
  }

  start(){
    this.t = 0;
    this.fx = [];
    this.cameraShake = 0;
    this.winner = null;
    this.slowMoFor = 0;
    this.A.resetState();
    this.B.resetState();
    this._placeFighters();
    this.state = 'FIGHTING';
  }

  pause(){
    if(this.state === 'FIGHTING') this.state = 'PAUSED';
  }
  resume(){
    if(this.state === 'PAUSED') this.state = 'FIGHTING';
  }
  finish(winner){
    this.state = 'FINISHED';
    this.winner = winner;
    this.cameraShake = 18;
  }

  _placeFighters(){
    const W = 720, H = 1280;
    this.A.x = W*0.25; this.A.y = H*0.52;
    this.B.x = W*0.75; this.B.y = H*0.52;
  }

  // spawn small fx items
  spawnFX(type, x, y, opts = {}){
    const f = { type, x, y, life: opts.life || 36, r: opts.r || 0 };
    this.fx.push(f);
  }

  update(){
    if(this.state !== 'FIGHTING') return;
    this.t++;
    // update status effects & cooldowns
    [this.A, this.B].forEach(e=>{
      if(e._burn && e._burn.ticks > 0){
        e._burn.ticks--;
        if(e._burn.ticks % 30 === 0){
          e.hp -= e._burn.dmg;
          this.spawnFX('burn', e.x + (Math.random()*20-10), e.y + (Math.random()*10-5));
        }
      }
      if(e._ice && e._ice > 0){
        e._ice--;
        if(e._ice <= 0) e.speedMul = 1;
      }
      if(e.stunned && e.stunned > 0) e.stunned--;
      if(e.cooldown && e.cooldown > 0) e.cooldown--;
      // clamp hp
      if(e.hp <= 0 && this.state === 'FIGHTING'){
        const winner = (e === this.A) ? this.B : this.A;
        this.finish(winner);
        if(document.getElementById('slowOnKill').checked) this.slowMoFor = 160;
        this.spawnFX('bigkill', winner.x, winner.y, { life: 120 });
      }
    });

    // if fight finished, keep fx ticking but do not execute hits
    if(this.state === 'FINISHED') return;

    // AI step
    this._aiStep(this.A, this.B);
    this._aiStep(this.B, this.A);

    // update fx lifetime
    this.fx = this.fx.filter(f => {
      f.life--;
      return f.life > 0;
    });

    // camera shake decay
    this.cameraShake *= 0.92;
  }

  _aiStep(me, opp){
    if(me.stunned > 0) return;
    const dx = opp.x - me.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;
    // movement: only move if not in attack range
    if(dist > me.range * 0.85){
      const mv = me.speed * (me.speedMul || 1);
      me.vx = dir * mv;
      me.x += me.vx * (1 + (parseFloat(document.getElementById('speed').value) - 1));
      me.x = Math.max(60, Math.min(660, me.x));
    } else {
      // in range: attempt attack if cooldown ready and opponent alive
      if((me.cooldown || 0) <= 0 && opp.hp > 0){
        // perform hit
        const hitDmg = me.dmg;
        opp.hp -= hitDmg;
        me.cooldown = 30;
        this.spawnFX('spark', opp.x + (Math.random()*30-15), opp.y + (Math.random()*16-8));
        this.cameraShake = 6;
        // apply abilities in order
        me.abilities.forEach(abKey => {
          const def = AbilityDefs[abKey];
          if(def && typeof def.apply === 'function'){
            def.apply(me, opp, this);
          }
        });
      }
    }
  }
}

/* small helpers */
function randomPalette(){
  const palette = ['#ffd166','#ef476f','#06d6a0','#118ab2','#8338ec','#ff8fab'];
  return palette[Math.floor(Math.random()*palette.length)];
}
