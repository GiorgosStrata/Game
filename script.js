const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const NPC_SIZE = 20;
const NPC_SPEED = 100;
const NPC_EMOJIS = ["😴", "💃", "🍔", "😡"];

class NPC {
  constructor(x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;
    this.state = NPC_EMOJIS[Math.floor(Math.random() * NPC_EMOJIS.length)];

    // Personality: "lazy", "hyper", or "glitchy"
    const types = ["lazy", "hyper", "glitchy"];
    this.type = types[Math.floor(Math.random() * types.length)];
    this.speedMultiplier = this.type === "lazy" ? 0.5 : this.type === "hyper" ? 1.5 : 1;

    this.setRandomVelocity();

    this.infected = false;
  }

  setRandomVelocity() {
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * NPC_SPEED * this.speedMultiplier;
    this.vy = Math.sin(angle) * NPC_SPEED * this.speedMultiplier;
  }

  move(deltaTime) {
    // Glitchy NPC randomly flips velocity
    if (this.type === "glitchy" && Math.random() < 0.01) {
      this.vx *= -1;
      this.vy *= -1;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Bounce off walls
    if (this.x <= 0 || this.x >= canvas.width - NPC_SIZE) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height - NPC_SIZE) this.vy *= -1;
  }

  draw() {
    // Red color if infected, else blue
    ctx.fillStyle = this.infected ? "#ff4c4c" : "#00c8ff";
    ctx.fillRect(this.x, this.y, NPC_SIZE, NPC_SIZE);

    // Draw emoji above NPC
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.fillText(this.state, this.x + NPC_SIZE / 2, this.y - 5);
  }
}

const npcs = [];
const initialCount = 10;
for (let i = 0; i < initialCount; i++) npcs.push(new NPC());

let lastTime = 0;

function checkInfection() {
  for (let i = 0; i < npcs.length; i++) {
    if (!npcs[i].infected) continue;

    for (let j = 0; j < npcs.length; j++) {
      if (i === j || npcs[j].infected) continue;

      if (
        npcs[i].x < npcs[j].x + NPC_SIZE &&
        npcs[i].x + NPC_SIZE > npcs[j].x &&
        npcs[i].y < npcs[j].y + NPC_SIZE &&
        npcs[i].y + NPC_SIZE > npcs[j].y
      ) {
        npcs[j].infected = true;
        npcs[j].state = "🦠";
      }
    }
  }
}

// Screen shake variables
let shakeDuration = 0;
const shakeIntensity = 5;

function applyShake() {
  if (shakeDuration > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    canvas.style.transform = `translate(${dx}px, ${dy}px)`;
    shakeDuration -= 1;
  } else {
    canvas.style.transform = "";
  }
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const npc of npcs) {
    npc.move(deltaTime);
    npc.draw();
  }

  checkInfection();
  applyShake();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// Spawn NPC on canvas click
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - NPC_SIZE / 2;
  const y = e.clientY - rect.top - NPC_SIZE / 2;
  npcs.push(new NPC(x, y));
});

// Infect one random NPC when 'I' key pressed
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "i") {
    const uninfected = npcs.filter(npc => !npc.infected);
    if (uninfected.length > 0) {
      const victim = uninfected[Math.floor(Math.random() * uninfected.length)];
      victim.infected = true;
      victim.state = "🦠";
    }
  }
});

// Chaos button randomizes NPC velocities and triggers screen shake
document.getElementById("chaosButton").addEventListener("click", () => {
  for (const npc of npcs) {
    npc.setRandomVelocity();
  }
  shakeDuration = 20; // frames of screen shake
});
