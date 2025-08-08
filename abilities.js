// abilities.js
// Ability definitions are modular and receive (attacker, target, battle).
// They must not directly mutate global state beyond the passed objects.

const AbilityDefs = {
  Fire: { name: 'Fire', desc: 'Burn damage over time', apply: applyFire },
  Ice:  { name: 'Ice', desc: 'Short slow on hit', apply: applyIce },
  Explosive: { name: 'Explosive', desc: 'Small area damage on hit', apply: applyExplosive },
  Lifesteal: { name: 'Lifesteal', desc: 'Heals attacker on hit', apply: applyLifesteal },
  Stun: { name: 'Stun', desc: 'Chance to stun target', apply: applyStun }
};

function applyFire(attacker, target, battle){
  if(!target._burn) target._burn = { ticks: 0, dmg: 0 };
  target._burn.ticks = 180; // frames
  target._burn.dmg = Math.max(1, Math.round(attacker.dmg * 0.12));
  battle.spawnFX('burn', target.x + rand(-12,12), target.y + rand(-8,8));
}
function applyIce(attacker, target, battle){
  target._ice = 40; // frames of slow
  target.speedMul = Math.min(1, (target.speedMul || 1));
  target.speedMul *= 0.55;
  battle.spawnFX('ice', target.x + rand(-12,12), target.y + rand(-8,8));
}
function applyExplosive(attacker, target, battle){
  const r = 72;
  battle.spawnFX('explosion', target.x, target.y, { r });
  [battle.A, battle.B].forEach(ent=>{
    const d = Math.hypot(ent.x - target.x, ent.y - target.y);
    if(d <= r){
      ent.hp -= Math.max(1, Math.round(attacker.dmg * 0.6));
    }
  });
}
function applyLifesteal(attacker, target, battle){
  const heal = Math.round(attacker.dmg * 0.25);
  attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
  battle.spawnFX('heal', attacker.x, attacker.y);
}
function applyStun(attacker, target, battle){
  // small chance
  if(Math.random() < 0.4){
    target.stunned = Math.max(target.stunned || 0, 36);
    battle.spawnFX('stun', target.x, target.y);
  }
}

/* utility */
function rand(a,b){ return a + (b-a)*Math.random(); }
