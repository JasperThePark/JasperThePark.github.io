const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ----- Ground -----
class Ground {
  constructor({ position, height }) {
    this.position = position;
    this.height = height;
  }
  draw() {
    context.fillStyle = "darkblue";
    context.fillRect(0, this.position.y, canvas.width, this.height);
  }
}

// ----- Player -----
class Player {
  constructor({ position }) {
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.size = 50;
    this.rotation = 0;
  }

  draw() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.fillStyle = "#ad11dde3";
    context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    context.strokeStyle = "white";
    context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
    context.restore();
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

// ----- Spike -----
class Spike {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
  }

  draw() {
    context.beginPath();
    context.moveTo(this.position.x - 25, this.position.y + 42);
    context.lineTo(this.position.x + 25, this.position.y + 42);
    context.lineTo(this.position.x, this.position.y - 20);
    context.fillStyle = "black";
    context.fill();
    context.closePath();
    context.strokeStyle = "white";
    context.stroke();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

// ----- Block -----
class Block {
  constructor({ position, height }) {
    this.position = position;
    this.size = height || 50;
    this.velocity = { x: -5, y: 0 };
  }

  draw() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillStyle = "black";
    context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    context.strokeStyle = "white";
    context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
    context.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

// ----- Level pieces -----
const levelPieces = {
  0: [
    { type: "spike", offsetX: 0 },
    { type: "block", offsetX: 150, height: 50 },
  ],
  1: [
    { type: "block", offsetX: 0, height: 50 },
    { type: "spike", offsetX: 200 },
  ],
  2: [
    { type: "block", offsetX: 0, height: 50 },
    { type: "block", offsetX: 250, height: 50 },
  ]
};

function spawnPiece(pieceName, startX) {
  const piece = levelPieces[pieceName];
  for (const obj of piece) {
    if (obj.type === "spike") {
      spikes.push(new Spike({
        position: { x: startX + obj.offsetX, y: ground.position.y - 42 },
        velocity: { x: -5, y: 0 },
      }));
    } else if (obj.type === "block") {
      blocks.push(new Block({
        position: { x: startX + obj.offsetX, y: ground.position.y - (obj.height || 50)/2 },
        height: obj.height || 50
      }));
    }
  }
}

// ----- Initialize objects -----
const ground = new Ground({
  position: { x: 0, y: canvas.height * 19 / 24 + 40 },
  height: canvas.height - canvas.height * 19 / 24,
});

const player = new Player({
  position: { x: canvas.width / 4, y: ground.position.y - 40 },
});

let blocks = [];
let spikes = [];
const keys = { space: { pressed: false } };
let retryButton = null;
let intervalId;

// ----- Collision helpers -----
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const area = (x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2));
  const a = ((px*(y2 - y3) + x2*(y3 - py) + x3*(py - y2))) / area;
  const b = ((x1*(py - y3) + px*(y3 - y1) + x3*(y1 - py))) / area;
  const c = 1 - a - b;
  return a >= 0 && b >= 0 && c >= 0;
}

function rectTriangleCollision(player, spike) {
  const left = player.position.x - player.size / 2;
  const right = player.position.x + player.size / 2;
  const top = player.position.y - player.size / 2;
  const bottom = player.position.y + player.size / 2;

  const corners = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom]
  ];

  const A = [spike.position.x - 25, spike.position.y + 42];
  const B = [spike.position.x + 25, spike.position.y + 42];
  const C = [spike.position.x, spike.position.y - 20];

  for (const [x, y] of corners) {
    if (pointInTriangle(x, y, ...A, ...B, ...C)) return true;
  }

  if (
    (A[0] > left && A[0] < right && A[1] > top && A[1] < bottom) ||
    (B[0] > left && B[0] < right && B[1] > top && B[1] < bottom) ||
    (C[0] > left && C[0] < right && C[1] > top && C[1] < bottom)
  ) return true;

  return false;
}

function rectRectCollision(player, block) {
  const pLeft = player.position.x - player.size/2;
  const pRight = player.position.x + player.size/2;
  const pTop = player.position.y - player.size/2;
  const pBottom = player.position.y + player.size/2;

  const bLeft = block.position.x - block.size/2;
  const bRight = block.position.x + block.size/2;
  const bTop = block.position.y - block.size/2;
  const bBottom = block.position.y + block.size/2;

  return {
    top: pBottom > bTop && pTop < bTop && pRight > bLeft && pLeft < bRight,
    bottom: pTop < bBottom && pBottom > bBottom && pRight > bLeft && pLeft < bRight,
    left: pRight > bLeft && pLeft < bLeft && pBottom > bTop && pTop < bBottom,
    right: pLeft < bRight && pRight > bRight && pBottom > bTop && pTop < bBottom,
  };
}

// ----- Controls -----
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") keys.space.pressed = true;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") keys.space.pressed = false;
});

// ----- Retry button click -----
canvas.addEventListener("click", (event) => {
  if (!retryButton) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const { x, y, width, height } = retryButton;
  if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
    restartGame();
  }
});

// ----- Restart game -----
function restartGame() {
  retryButton = null;
  spikes = [];
  blocks = [];
  player.position = { x: canvas.width / 4, y: ground.position.y - 40 };
  player.velocity = { x: 0, y: 0 };
  player.rotation = 0;

  clearInterval(intervalId);
  intervalId = setInterval(() => {
    spawnPiece(Math.floor(Math.random()*3), canvas.width + 30);
  }, 3000);

  animate();
}

// ----- Spawn first pieces -----
intervalId = setInterval(() => {
  spawnPiece(Math.floor(Math.random()*3), canvas.width + 30);
}, 3000);

// ----- Main game loop -----
function animate() {
  const animationId = requestAnimationFrame(animate);
  context.fillStyle = "#04006B";
  context.fillRect(0, 0, canvas.width, canvas.height);
  ground.draw();
  player.update();

  // Gravity
  player.velocity.y += 0.8;

  // ----- Check collisions -----
  let isAirborne = true;

  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    block.update();

    const col = rectRectCollision(player, block);

    if (col.top) {
      player.position.y = block.position.y - player.size/2 - block.size/2;
      player.velocity.y = 0;
      isAirborne = false;
      player.rotation = 0;
    } else if (col.bottom) {
      player.position.y = block.position.y + player.size/2 + block.size/2;
      player.velocity.y = 0;
    } else if (col.left) {
      player.position.x = block.position.x - player.size/2 - block.size/2;
    } else if (col.right) {
      player.position.x = block.position.x + player.size/2 + block.size/2;
    }

    if (block.position.x + block.size/2 < 0) blocks.splice(i, 1);
  }

  // Ground check
  const groundY = ground.position.y;
  if (isAirborne && player.position.y + player.size/2 >= groundY) {
    player.position.y = groundY - player.size/2;
    player.velocity.y = 0;
    isAirborne = false;
    player.rotation = 0;
  }

  // Rotate only if airborne
  if (isAirborne) player.rotation += 0.042;

  // Jump
  if (keys.space.pressed && !isAirborne) player.velocity.y = -14;

  // ----- Spikes -----
  for (let i = spikes.length - 1; i >= 0; i--) {
    const spike = spikes[i];
    spike.update();

    if (rectTriangleCollision(player, spike)) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      gameOverScreen();
      return;
    }

    if (spike.position.x + 40 < 0) spikes.splice(i, 1);
  }
}

// ----- Game Over -----
function gameOverScreen() {
  context.font = "bold 100px sans-serif";
  context.fillStyle = "white";
  context.fillText("Game Over", canvas.width / 3, canvas.height / 2 - 100);

  const buttonWidth = 300;
  const buttonHeight = 100;
  const buttonX = canvas.width / 2 - buttonWidth / 2;
  const buttonY = canvas.height / 2;

  context.fillStyle = "#222";
  context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  context.strokeStyle = "white";
  context.lineWidth = 1;
  context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

  context.font = "bold 50px sans-serif";
  context.fillStyle = "white";
  context.fillText("Retry", buttonX + 75, buttonY + 65);

  retryButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
}

// ----- Start game -----
animate();
