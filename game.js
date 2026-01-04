// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

// ===== PLAYER =====
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  w: 50,
  h: 50,
  speed: 10,
  shield: false
};

// ===== INPUT FLAGS =====
let moveLeft = false;
let moveRight = false;

// ===== TOUCH (MOBILE) =====
canvas.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  moveLeft = x < canvas.width / 2;
  moveRight = x >= canvas.width / 2;
});

canvas.addEventListener("touchend", () => {
  moveLeft = false;
  moveRight = false;
});

// ===== MOUSE (PC) =====
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  moveLeft = x < canvas.width / 2;
  moveRight = x >= canvas.width / 2;
});

canvas.addEventListener("mouseup", () => {
  moveLeft = false;
  moveRight = false;
});

// ===== KEYBOARD (PC) =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d") moveRight = true;
});

document.addEventListener("keyup", e => {
  if (["ArrowLeft", "a"].includes(e.key)) moveLeft = false;
  if (["ArrowRight", "d"].includes(e.key)) moveRight = false;
});

// ===== GAME DATA =====
let obstacles = [];
let items = [];
let score = 0;
let level = 1;
let slowTime = 0;
let gameOver = false;

// ===== SPAWN =====
function spawnObstacle(boss = false) {
  obstacles.push({
    x: Math.random() * (canvas.width - 60),
    y: -60,
    w: boss ? 90 : 50,
    h: boss ? 90 : 50,
    hp: boss ? 5 : 1,
    speed: boss ? 2 : 4 + level * 0.5
  });
}

function spawnItem() {
  const type = Math.random() < 0.5 ? "slow" : "shield";
  items.push({
    type,
    x: Math.random() * (canvas.width - 30),
    y: -30,
    w: 30,
    h: 30,
    speed: 3
  });
}

setInterval(() => !gameOver && spawnObstacle(), 800);
setInterval(() => !gameOver && Math.random() < 0.3 && spawnItem(), 5000);

// ===== UPDATE =====
function update() {
  if (gameOver) return;

  level = Math.floor(score / 10) + 1;

  // Boss mỗi 5 level (50 điểm)
  if (score > 0 && score % 50 === 0 && !obstacles.some(o => o.hp > 1)) {
    spawnObstacle(true);
  }

  // Player move
  if (moveLeft) player.x -= player.speed;
  if (moveRight) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  if (slowTime > 0) slowTime--;

  obstacles.forEach(o => o.y += o.speed * (slowTime ? 0.4 : 1));

  obstacles = obstacles.filter(o => {
    if (o.y > canvas.height) {
      score++;
      return false;
    }
    return true;
  });

  items.forEach(i => i.y += i.speed);

  // Collision obstacle
  obstacles.forEach(o => {
    if (hit(player, o)) {
      if (player.shield) {
        player.shield = false;
        o.hp = 0;
      } else {
        gameOver = true;
      }
    }
  });

  // Collision item
  items = items.filter(i => {
    if (hit(player, i)) {
      if (i.type === "slow") slowTime = 300;
      if (i.type === "shield") player.shield = true;
      return false;
    }
    return i.y < canvas.height;
  });
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.shield ? "#0ff" : "#0f0";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  obstacles.forEach(o => {
    ctx.fillStyle = o.hp > 1 ? "#f0f" : "#f00";
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  items.forEach(i => {
    ctx.fillStyle = i.type === "slow" ? "#00f" : "#ff0";
    ctx.fillRect(i.x, i.y, i.w, i.h);
  });

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Level: ${level}`, 20, 70);
  ctx.fillText(`Shield: ${player.shield ? "ON" : "OFF"}`, 20, 100);

  if (gameOver) {
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Click / Chạm để chơi lại", canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = "left";
  }
}

function hit(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// Restart (PC + Mobile)
canvas.addEventListener("mousedown", () => gameOver && location.reload());
canvas.addEventListener("touchstart", () => gameOver && location.reload());

// ===== LOOP =====
(function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
})();
