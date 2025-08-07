const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const NPC_COUNT = 20;
const NPC_SIZE = 10;
const NPC_SPEED = 100;

class NPC {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.setRandomVelocity();
  }

  setRandomVelocity() {
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * NPC_SPEED;
    this.vy = Math.sin(angle) * NPC_SPEED;
  }

  move(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Bounce off edges
    if (this.x <= 0 || this.x >= canvas.width - NPC_SIZE) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height - NPC_SIZE) this.vy *= -1;
  }

  draw() {
    ctx.fillStyle = "#00c8ff";
    ctx.fillRect(this.x, this.y, NPC_SIZE, NPC_SIZE);
  }
}

const npcs = [];
for (let i = 0; i < NPC_COUNT; i++) {
  npcs.push(new NPC());
}

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const npc of npcs) {
    npc.move(deltaTime);
    npc.draw();
  }

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// Chaos Button
document.getElementById("chaosButton").addEventListener("click", () => {
  for (const npc of npcs) {
    npc.setRandomVelocity();
  }
});
