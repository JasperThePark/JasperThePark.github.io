const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
let score = 0
let onSomething = false;
let speedBoost = 1;
let speedBoostTimer = 0;

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

  update(delta) {
    this.position.y += this.velocity.y * delta;
    this.draw();
  }
}

// ----- Spike -----
class Spike {
  constructor({ position, velocity,lastPiece}) {
    this.position = position;
    this.velocity = velocity;
    this.lastPiece = lastPiece
  }

  draw() {
    context.beginPath();
    context.moveTo(this.position.x - 25, this.position.y + 32);
    context.lineTo(this.position.x + 25, this.position.y + 32);
    context.lineTo(this.position.x, this.position.y - 20);
    context.fillStyle = "black";
    context.fill();
    context.closePath();

    context.strokeStyle = "white";
    context.stroke();
  }
  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost;
    this.draw();
  }
}

// ----- Block -----
class Block {
  constructor({ position, height,lastPiece }) {
    this.position = position;
    this.size = height || 50;
    this.velocity = { x: -5, y: 0 };
    this.lastPiece = lastPiece
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

  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost;
    this.draw();
  }
}
//circle
class Circle {
  constructor({ position },lastPiece) {
    this.position = position;
    this.radius = 20;
    this.velocity = { x: -5, y: 0 };
    this.lastPiece = lastPiece;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "yellow";
    context.shadowColor = "yellow";
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
    context.shadowColor = "transparent";
  }

  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost;
    this.draw();
  }
}

// ----- Level pieces -----
const levelPieces = {
  0: [
    //leave a 2px gap between them
    { type: "spike", offsetX: 0, offsetY: 0 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 0 },
    { type: "spike", offsetX: 156, offsetY: 0 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },
    { type: "block", offsetX: 208, offsetY: 50, height: 50 },
    { type: "spike", offsetX: 260, offsetY: 0 },
    { type: "block", offsetX: 312, offsetY: 0, height: 50 },
    { type: "block", offsetX: 312, offsetY: 50, height: 50 },
    { type: "block", offsetX: 312, offsetY: 150, height: 50, lastPiece: true },
  ],
  1: [
    { type: "spike", offsetX: 100, offsetY: 0, lastPiece: true },
  ],
  2: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 0, lastPiece: true },
  ],
  3: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0 },
    { type: "spike", offsetX: 104, offsetY: 0 },
    { type: "spike", offsetX: 156, offsetY: 0, lastPiece: true },
  ],
  4: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0 },
    { type: "block", offsetX: 52, offsetY: 110, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 156, offsetY: 0 },
    { type: "block", offsetX: 156, offsetY: 110, height: 50 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50,lastPiece: true },

  ],
  5: [
    {type: 'circle', offsetX:0,offsetY:20,lastPiece:true},
  ]
};

function spawnPiece(pieceName, startX) {
  const piece = levelPieces[pieceName];
  for (const obj of piece) {
    if (obj.type === "spike" && obj.lastPiece == true) {
      spikes.push(new Spike({
        position: { x: startX + obj.offsetX, y: ground.position.y - 32-obj.offsetY },
        velocity: { x: -5, y: 0 },
        lastPiece: true
      }));
    }else if (obj.type === "spike") {
      spikes.push(new Spike({
        position: { x: startX + obj.offsetX, y: ground.position.y - 32-obj.offsetY },
        velocity: { x: -5, y: 0 },
        lastPiece: false
      }));
    }
     else if (obj.type === "block" && obj.lastPiece) {
      blocks.push(new Block({
        position: { x: startX + obj.offsetX, y: ground.position.y - (obj.height || 50) / 2-obj.offsetY},
        height: obj.height || 50,
        lastPiece: true
      }));
    }
    
     else if (obj.type === "block") {
      blocks.push(new Block({
        position: { x: startX + obj.offsetX, y: ground.position.y - (obj.height || 50) / 2-obj.offsetY},
        height: obj.height || 50,
        lastPiece: false
      }));
    }
    else if (obj.type === "circle") {
      circles.push(new Circle({
        position: { x: startX + obj.offsetX, y: ground.position.y - obj.offsetY },
        lastPiece: obj.lastPiece || false
      }));
    }
  }
}

// ----- Initialize -----
const ground = new Ground({
  position: { x: 0, y: canvas.height * 19 / 24 + 40 },
  height: canvas.height - canvas.height * 19 / 24,
});

const player = new Player({
  position: { x: canvas.width / 4, y: ground.position.y - 40 },
});

let blocks = [];
let spikes = [];
let circles = [];
let retryButton = null;
let keys = { space: { pressed: false } };
let intervalId;

// ----- Collision helpers -----
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const area = (x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2));
  const a = ((px*(y2 - y3) + x2*(y3 - py) + x3*(py - y2))) / area;
  const b = ((x1*(py - y3) + px*(y3 - y1) + x3*(y1 - py))) / area;
  const c = 1 - a - b;
  return a >= 0 && b >= 0 && c >= 0;
}
function rectCircleCollision(player, circle) {
  const playerLeft = player.position.x - player.size / 2;
  const playerRight = player.position.x + player.size / 2;
  const playerTop = player.position.y - player.size / 2;
  const playerBottom = player.position.y + player.size / 2;

  const circleLeft = circle.position.x - circle.radius;
  const circleRight = circle.position.x + circle.radius;
  const circleTop = circle.position.y - circle.radius;
  const circleBottom = circle.position.y + circle.radius;

  return !(playerRight < circleLeft || 
           playerLeft > circleRight || 
           playerBottom < circleTop || 
           playerTop > circleBottom);
}

function rectTriangleCollision(player, spike) {
  const left = player.position.x - player.size / 2;
  const right = player.position.x + player.size / 2;
  const top = player.position.y - player.size / 2;
  const bottom = player.position.y + player.size / 2;

  const corners = [
    [left, top], [right, top], [left, bottom], [right, bottom]
  ];

  const A = [spike.position.x - 25, spike.position.y + 32];
  const B = [spike.position.x + 25, spike.position.y + 32];
  const C = [spike.position.x, spike.position.y - 20];

  for (const [x, y] of corners) {
    if (pointInTriangle(x, y, ...A, ...B, ...C)) return true;
  }
  return false;
}

function rectRectCollision(player, block) {
  const pL = player.position.x - player.size / 2;
  const pR = player.position.x + player.size / 2;
  const pT = player.position.y - player.size / 2;
  const pB = player.position.y + player.size / 2;

  const bL = block.position.x - block.size / 2;
  const bR = block.position.x + block.size / 2;
  const bT = block.position.y - block.size / 2;
  const bB = block.position.y + block.size / 2;

  if (pR > bL && pL < bR && pB > bT && pT < bB) {
    const overlapX = Math.min(pR - bL, bR - pL);
    const overlapY = Math.min(pB - bT, bB - pT);
    if (overlapY < overlapX) {
      // vertical collision
      if (player.velocity.y > 0) {
        player.position.y -= overlapY;
        player.velocity.y = 0;
      } else if (player.velocity.y < 0) {
        player.position.y += overlapY;
        player.velocity.y = 0;
      }
    } else {
      // horizontal collision
      if (player.position.x < block.position.x) player.position.x -= overlapX;
      else player.position.x += overlapX;
    }
    return true;
  }
  return false;
}

// ----- Controls -----
addEventListener("keydown", e => {
  if (e.code === "Space") keys.space.pressed = true;
});
addEventListener("keyup", e => {
  if (e.code === "Space") keys.space.pressed = false;
});

// ----- Click Retry -----
canvas.addEventListener("click", e => {
  // Jump if the player is standing on something and retryButton is NOT active
  if (!retryButton && typeof onSomething !== "undefined" && onSomething) {
    player.velocity.y = -14;
  }

  // Retry button logic
  if (retryButton) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { x, y, width, height } = retryButton;
    if (mx >= x && mx <= x + width && my >= y && my <= y + height) {
      restartGame();
    }
  }
});

// ----- Restart -----
function restartGame() {
  retryButton = null;
  spikes = [];
  blocks = [];
  player.position = { x: canvas.width / 4, y: ground.position.y - 40 };
  player.velocity = { x: 0, y: 0 };
  player.rotation = 0;
  score = 0
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    let idx = Math.floor(Math.random() * 6)
    spawnPiece(Math.floor(idx), canvas.width + 30);
  }, 3000);

  lastTime = performance.now();
  animate(lastTime);
}

// ----- Start Spawning -----
intervalId = setInterval(() => {
  let idx = Math.floor(Math.random() * 6)
  spawnPiece(Math.floor(idx), canvas.width + 30);
}, 3000);

// ----- Animation -----
let lastTime = performance.now();

function animate(currentTime) {
  const delta = Math.min((currentTime - lastTime) / 16.67, 3);
  lastTime = currentTime;
  const animationId = requestAnimationFrame(animate);

  context.fillStyle = "#04006B";
  context.fillRect(0, 0, canvas.width, canvas.height);
  ground.draw();
  player.update(delta);

  //score
  context.font = "bold 25px sans-serif";
  context.fillStyle = "white";
  context.fillText(`Score: ${score}`, 25, 25);

  player.velocity.y += 0.8 * delta;
  onSomething = false;

  // Blocks
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    block.update(delta,speedBoost);
    if (rectRectCollision(player, block)) onSomething = true;
    if (block.position.x + block.size / 2 < 0 && block.lastPiece){
      blocks.splice(i, 1);
      score+=1
      console.log(score)
    } 
    else if (block.position.x + block.size / 2 < 0) blocks.splice(i, 1);
  }
  //circle loop
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    circle.update(delta,speedBoost);

    if (rectCircleCollision(player, circle)) {
      // Jump boost
      player.velocity.y = -20; // ~1.5x normal jump

      speedBoost = 3; // global multiplier
      speedBoostTimer = 60; // lasts 1 second at 60fps

      // Remove circle
      circles.splice(i, 1);
    }

    if (circle.position.x + circle.radius < 0) circles.splice(i, 1);
  }
  // Ground
  if (player.position.y + player.size / 2 >= ground.position.y) {
    player.position.y = ground.position.y - player.size / 2;
    player.velocity.y = 0;
    onSomething = true;
  }

  // Jump
  if (keys.space.pressed && onSomething) player.velocity.y = -14;

  // Rotation
  if (!onSomething) player.rotation += 0.042 * delta;
  else player.rotation = 0;

  // Spikes
  for (let i = spikes.length - 1; i >= 0; i--) {
    const spike = spikes[i];
    spike.update(delta,speedBoost);
    if (rectTriangleCollision(player, spike)) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      gameOverScreen();
      return;
    }
    if (spike.position.x + 40 < 0 && spike.lastPiece){
      spikes.splice(i, 1);
      score+=1
      console.log(score)
    }
    else if (spike.position.x + 40 < 0) spikes.splice(i, 1);
  }
  if (speedBoostTimer > 0) {
    speedBoostTimer--;
    if (speedBoostTimer <= 0) speedBoost = 1;
  }
}

// ----- Game Over -----
function gameOverScreen() {
  context.font = "bold 100px sans-serif";
  context.fillStyle = "white";
  context.fillText("Game Over", canvas.width / 3, canvas.height / 2 - 100);

  const w = 300, h = 100;
  const x = canvas.width / 2 - w / 2;
  const y = canvas.height / 2;

  context.fillStyle = "#222";
  context.fillRect(x, y, w, h);
  context.strokeStyle = "white";
  context.lineWidth = 1;
  context.strokeRect(x, y, w, h);

  context.font = "bold 50px sans-serif";
  context.fillStyle = "white";
  context.fillText("Retry", x + 75, y + 65);

  retryButton = { x, y, width: w, height: h };
  
}

// ----- Start -----
animate(performance.now());
