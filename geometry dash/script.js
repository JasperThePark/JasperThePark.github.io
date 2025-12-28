const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
let score = 0
let onSomething = false;
let speedBoost = 1;
let speedBoostTimer = 0;
let bgcolor = "#04006B";
let groundcolor = "darkblue";
let ragespeed = 1
let playerColor = "#ad11dde3"
let playerShadowColor = 'transparent'
let playerStroke = 'white'
let rageDuration = 0
let last,x = 0.0
let fontsize = 0
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let OGragespeed = 1
let OGrageDuration = 0
let rageActive = false
let particles = []
let ghostActive = false;
let isGameOver = false;
const GHOST_PLAYER_COLOR = "rgba(129, 173, 255, 0.3)";
let ghostTimer = 0; 
const GHOST_DURATION = 210;
const OG_PLAYER_COLOR = "#ad11dde3"; 
const audioFiles = {
    jump: new Audio('sounds/jump effect.mp3'), 
    collect: new Audio('sounds/yelloworb.mp3'), 
    collect2: new Audio('sounds/blueorb transform.mp3'),
    ghostMode: new Audio('sounds/ghostmode2.mp3'),
    death: new Audio('sounds/death effect.mp3'),
};
/**
 * Helper to get the world coordinates of a vertex after rotation
 * @param {Array<number>} vertex - The [x, y] local coords of the vertex
 * @param {Object} origin - The {x, y} world coords of the spike's origin
 * @param {number} angle - The spike's angle in degrees
 * @returns {Array<number>} - The [x, y] world coords of the rotated vertex
 */
function getRotatedVertex(vertex, origin, angle) {
  const angleRad = angle * Math.PI / 180;
  const [vx, vy] = vertex; 
  
  const rotatedX = vx * Math.cos(angleRad) - vy * Math.sin(angleRad);
  const rotatedY = vx * Math.sin(angleRad) + vy * Math.cos(angleRad);
  
  return [rotatedX + origin.x, rotatedY + origin.y];
}



// ----- Ground -----
class Ground {
  constructor({ position, height }) {
    this.position = position;
    this.height = height;
  }
  draw() {
    context.fillStyle = groundcolor;
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
    this.visible = true
  }

  draw() {
    if (!player.visible) return;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        
        // --- Shadow properties set directly on context ---
        context.shadowBlur = 15; // A reasonable blur amount for a glow
        context.shadowColor = playerShadowColor; 
        
        context.fillStyle = playerColor;
        context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        context.strokeStyle = playerStroke;
        context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        context.restore();
    }

  update(delta) {
    this.position.y += this.velocity.y * delta;
  }

}
class Particle {
    constructor({ position, velocity, color }) {
        this.position = position;
        this.velocity = velocity;
        this.size = 20;
        this.opacity = 1.0; 
        this.baseColor = color;
    }
    draw() {
        const currentRgba = this.baseColor.replace('rgb', 'rgba').replace(')', `, ${this.opacity})`);
        context.save();
        context.globalAlpha = this.opacity; 
        context.fillStyle = currentRgba;
        

        context.shadowBlur = 10; 
        context.shadowColor = currentRgba; 

        context.fillRect(this.position.x, this.position.y, this.size, this.size);
        

        context.restore(); 
    }

    // Inside the Particle class (modify update method)
    update(delta) {
        // ... (rest of velocity and position updates) ...
        this.velocity.y += 0.4 * delta;
        this.velocity.x *= 0.99; 
        
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;

        this.opacity -= 0.015 * delta; // Increased from 0.05
        this.size *= 0.95; 

        this.draw();
    }
}
// ----- Spike -----
class Spike {
  constructor({ position, velocity,lastPiece,angle=0}) {
    this.position = position;
    this.velocity = velocity;
    this.lastPiece = lastPiece
    this.angle = angle
  }

  draw() {
    context.save(); 
    context.translate(this.position.x, this.position.y); // move origin to spike position
    context.rotate(this.angle * Math.PI / 180); // convert degrees to radians if needed

    context.beginPath();
    context.moveTo(-25, 32); 
    context.lineTo(25, 32);
    context.lineTo(0, -20);
    context.closePath();

    context.fillStyle = "black";
    context.fill();

    context.strokeStyle = "white";
    context.stroke();

    context.restore();
  }
  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost*ragespeed;
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
    this.position.x += this.velocity.x * delta * speedBoost*ragespeed;
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
    this.position.x += this.velocity.x * delta * speedBoost*ragespeed;
    this.draw();
  }
}

class CircleB {
  constructor({ position },lastPiece) {
    this.position = position;
    this.radius = 20;
    this.velocity = { x: -5, y: 0 };
    this.lastPiece = lastPiece;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "lightblue";
    context.shadowColor = "lightblue";
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
    context.shadowColor = "transparent";
  }

  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost*ragespeed;
    this.draw();
  }
}
//circle with no speed effect just a jump boost
class CircleW {
  constructor({ position }, lastPiece) {
    this.position = position;
    this.radius = 20;
    this.velocity = { x: -5, y: 0 };
    this.lastPiece = lastPiece;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "orange"; // Choose a distinct color (e.g., Orange)
    context.shadowColor = "orange";
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
    context.shadowColor = "transparent";
  }

  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost * ragespeed;
    this.draw();
  }
}

function spawnParticles(x, y, playerColorString) {
    let baseColor;
    
    // Determine the base color based on the current player's visual state
    if (rageActive) {
        baseColor = 'rgb(255, 0, 0)'; // Bright Red for Rage
    } else if (ghostActive) {
        baseColor = 'rgb(129, 173, 255)'; // Base Blue for Ghost
    } else {
        baseColor = 'rgb(173, 17, 221)'; // Opaque Purple for Normal (#ad11dde3)
    }

    const particleCount = 20; 
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; 
        const speed = Math.random() * 4 + 8; 
        
        particles.push(new Particle({
            position: { x: x, y: y },
            velocity: {
                x: Math.cos(angle) * speed, 
                y: Math.sin(angle) * speed
            },
            color: baseColor // Pass the opaque RGB string to the new 'baseColor' property
        }));
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
  ],
  6: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0 },
    { type: "spike", offsetX: 102, offsetY: 0 },
    { type: "block", offsetX: 104, offsetY: 110, height: 50 },
    { type: "spike", offsetX: 156, offsetY: 0 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50,lastPiece: true},
  ],
  7: [
    { type: "block", offsetX: 0, offsetY: 230, height: 50 },
    { type: "spike", offsetX: 0, offsetY: 230, rotation: 180},
    { type: "spike", offsetX: 0, offsetY: 0 },
    
    { type: "block", offsetX: 170, offsetY: 230, height: 50 },
    { type: "spike", offsetX: 170, offsetY: 230, rotation: 180},
    { type: "spike", offsetX: 170, offsetY: 0 , lastPiece: true},
  ],
  8: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 0},
    { type: "spike", offsetX: 156, offsetY: 0},
    { type: "block", offsetX: 170, offsetY: 120, height: 50 },
    { type: "spike", offsetX: 208, offsetY: 0},
    { type: "spike", offsetX: 260, offsetY: 0},
    { type: "spike", offsetX: 312, offsetY: 0,lastPiece:true},
    {type: 'circle', offsetX:321,offsetY:250},
  ],
  9: [
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0 },
    { type: "spike", offsetX: 104, offsetY: 0 },
    { type: "spike", offsetX: 156, offsetY: 0},
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },

    //upperlayer
    { type: "block", offsetX: 0, offsetY: 250, height: 50 },
    { type: "block", offsetX: 52, offsetY: 250, height: 50 },
    { type: "block", offsetX: 104, offsetY: 250, height: 50 },
    { type: "block", offsetX: 156, offsetY: 250, height: 50 },
    { type: "block", offsetX: 208, offsetY: 250, height: 50, lastPiece: true },
  ],

  10: [
    { type: "spike", offsetX: 0, offsetY: 0 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 260, offsetY: 0 },

    //upper topper
    { type: "block", offsetX: 0, offsetY: 220, height: 50 },
    { type: "block", offsetX: 52, offsetY: 220, height: 50 },
    { type: "block", offsetX: 104, offsetY: 220, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 220, rotation:180 },
    { type: "block", offsetX: 156, offsetY: 220, height: 50 },
    { type: "spike", offsetX: 156, offsetY: 220, rotation:180 },
    { type: "block", offsetX: 208, offsetY: 220, height: 50 },
    { type: "block", offsetX: 260, offsetY: 220, height: 50 , lastPiece: true},
  ],

  11: [

    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    
    { type: "block", offsetX: 104, offsetY: 200, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 200, rotation: 180 }, 
    
    { type: "spike", offsetX: 156, offsetY: 0 },
    { type: "block", offsetX: 208, offsetY: 0, lastPiece: true },
  ],
  12: [
    { type: "block", offsetX: 0, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 0, offsetY: 250, rotation: 180},
    {type: 'circleb', offsetX: 0,offsetY: 150},
    { type: "spike", offsetX: 0, offsetY: 50 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },

    { type: "block", offsetX: 52, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 250, rotation: 180},
    { type: "spike", offsetX: 52, offsetY: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },

    { type: "block", offsetX: 104, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 250, rotation: 180},
    { type: "spike", offsetX: 104, offsetY: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },

    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 250, height: 50 },
    { type: "block", offsetX: 156, offsetY: 200, height: 50 },
    { type: "spike", offsetX: 156, offsetY: 200, rotation: 180},
    { type: "spike", offsetX: 156, offsetY: 100 },
    { type: "block", offsetX: 156, offsetY: 50, height: 50 },

    { type: "block", offsetX: 208, offsetY: 200, height: 50 },
    { type: "spike", offsetX: 208, offsetY: 200, rotation: 180},
    { type: "spike", offsetX: 208, offsetY: 100 },
    { type: "block", offsetX: 208, offsetY: 50, height: 50 },
    
    { type: "block", offsetX: 260, offsetY: 150, height: 50 },
    { type: "block", offsetX: 260, offsetY: 100, height: 50, lastPiece: true },
  ],
  13: [
    {type: 'circle', offsetX:0,offsetY:20},
    { type: "spike", offsetX: 104, offsetY: 0},
    { type: "spike", offsetX: 156, offsetY: 0},
    { type: "block", offsetX: 280, offsetY: 0, height: 50 },
    { type: "block", offsetX: 280, offsetY: 50, height: 50 },
    { type: "block", offsetX: 280, offsetY: 100, height: 50 },
    { type: "block", offsetX: 280, offsetY: 150, height: 50 },
    { type: "block", offsetX: 280, offsetY: 200, height: 50 },
    { type: "block", offsetX: 280, offsetY: 250, height: 50 },
    { type: "block", offsetX: 280, offsetY: 300, height: 50 },
    { type: "block", offsetX: 280, offsetY: 350, height: 50 },
    { type: "block", offsetX: 280, offsetY: 400, height: 50 },
    { type: "block", offsetX: 280, offsetY: 450, height: 50 },
    { type: "block", offsetX: 280, offsetY: 500, height: 50 },
    { type: "block", offsetX: 280, offsetY: 550, height: 50 },
    { type: "block", offsetX: 280, offsetY: 600, height: 50 },
    { type: "block", offsetX: 280, offsetY: 650, height: 50 },
    { type: "block", offsetX: 280, offsetY: 700, height: 50 },
    { type: "block", offsetX: 280, offsetY: 750, height: 50 },
    { type: "block", offsetX: 280, offsetY: 800, height: 50 },
    { type: "block", offsetX: 280, offsetY: 850, height: 50 },
    { type: "block", offsetX: 280, offsetY: 900, height: 50 },
    { type: "block", offsetX: 280, offsetY: 950, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1000, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1050, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1100, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1150, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1200, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1250, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1300, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1350, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1400, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1450, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1500, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1550, height: 50 },
    { type: "block", offsetX: 280, offsetY: 1600, height: 50, lastPiece:true },
    {type: 'circleb', offsetX:208,offsetY:200},
  ],
  14: [
    { type: "block", offsetX: -52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 156, offsetY: 50},
    {type: 'circlew', offsetX:275,offsetY:20},
    { type: "spike", offsetX: 350, offsetY: 0},

    //upper
    { type: "block", offsetX: -52, offsetY: 250, height: 50 },
    { type: "block", offsetX: 0, offsetY: 250, height: 50 },
    { type: "block", offsetX: 52, offsetY: 250, height: 50 },
    { type: "block", offsetX: 104, offsetY: 250, height: 50 },
    { type: "block", offsetX: 156, offsetY: 250, height: 50 },
    { type: "block", offsetX: 208, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 212, offsetY: 250, rotation:180},
    { type: "block", offsetX: 260, offsetY: 250, height: 50 },
    { type: "block", offsetX: 312, offsetY: 250, height: 50 },
    { type: "block", offsetX: 364, offsetY: 250, height: 50 },
    { type: "block", offsetX: 416, offsetY: 250, height: 50 },
    { type: "block", offsetX: 468, offsetY: 250, height: 50 },
  ],
  15:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 104, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 156, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 208, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 260, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 312, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 364, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 416, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 468, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 520, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 572, offsetY: 0, rotation:0},

    { type: "block", offsetX: 150, offsetY: 80, height: 50 },
    { type: "block", offsetX: 300, offsetY: 160, height: 50 },
    {type: 'circle', offsetX: 420, offsetY: 70},
  ],
};
function spawnPiece(pieceName, startX) {
  const piece = levelPieces[pieceName];
  for (const obj of piece) {
    if (obj.type === "spike") {
        const angle = obj.rotation || 0;
        let yPos;

        if (angle === 180) {
            // Flipped: The new base is at local y = -32.
            // We want pos.y - 32 = ground.y - offset.
            // So, pos.y = ground.y + 32 - offset.
            yPos = ground.position.y + 32 - obj.offsetY;
        } else {
            // Normal: The base is at local y = 32.
            // We want pos.y + 32 = ground.y - offset.
            // So, pos.y = ground.position.y - 32 - obj.offsetY;
            yPos = ground.position.y - 32 - obj.offsetY;
        }

        spikes.push(new Spike({
            position: { x: startX + obj.offsetX, y: yPos },
            velocity: { x: -5, y: 0 },
            lastPiece: obj.lastPiece || false, // Simplified boolean check
            angle: angle
        }));
    }
    // (Your existing "block" and "circle" code remains the same)
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
    else if (obj.type === "circleb") {
      circlesB.push(new CircleB({
        position: { x: startX + obj.offsetX, y: ground.position.y - obj.offsetY },
        lastPiece: obj.lastPiece || false
      }));
    }
    else if (obj.type === "circlew") { 
      circlesW.push(new CircleW({
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
player.visible = true
let blocks = [];
let spikes = [];
let circles = [];
let circlesB = [];
let circlesW = [];
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
  if (ghostActive) return false;
  const left = player.position.x - player.size / 2;
  const right = player.position.x + player.size / 2;
  const top = player.position.y - player.size / 2;
  const bottom = player.position.y + player.size / 2;

  const corners = [
    [left, top], [right, top], [left, bottom], [right, bottom]
  ];

  // Calculate rotated vertices
  const A = getRotatedVertex([-25, 32], spike.position, spike.angle); // Bottom-left base
  const B = getRotatedVertex([25, 32], spike.position, spike.angle);  // Bottom-right base
  const C = getRotatedVertex([0, -20], spike.position, spike.angle);  // Tip

  for (const [x, y] of corners) {
    if (pointInTriangle(x, y, ...A, ...B, ...C)) return true;
  }
  return false;
}
function updateSpawnInterval() {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    x = Math.floor(Math.random()*16)
    let idx = x
    while(x == last){
      x = Math.floor(Math.random()*16)
    }
    last = x
    spawnPiece(idx, canvas.width + 30);
  }, 3000 / ragespeed / speedBoost);
}
function rectRectCollision(player, block) {
  if (ghostActive)return;
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

addEventListener('mousedown',e=>{
  keys.space.pressed = true
})
addEventListener('mouseup',e=>{
  keys.space.pressed = false
})

// ----- Controls (Touch) -----
canvas.addEventListener('dblclick', (e) => {
    e.preventDefault(); 
});

// Start the jump on touchstart
addEventListener('touchstart',e=>{
    e.preventDefault(); 
    keys.space.pressed = true;
})

// Stop the jump on touchend
addEventListener('touchend',e=>{
    e.preventDefault(); 
    // Only handles the jump stop. Retry is handled by pointerup.
    keys.space.pressed = false; 
})


function handleInput(e) {

    e.preventDefault(); 
    

    if (!isGameOver || !retryButton) {
        return; 
    }

    // Determine coordinates (clientX/Y work for both mouse and pointer events)
    let mx, my;
    const rect = canvas.getBoundingClientRect();

    // If it's a touch event, use the last change
    if (e.changedTouches && e.changedTouches.length > 0) {
        mx = e.changedTouches[0].clientX - rect.left;
        my = e.changedTouches[0].clientY - rect.top;
    } else {
        // Standard pointer/mouse event
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
    }

    // Retry button logic
    const { x, y, width, height } = retryButton;
    if (mx >= x && mx <= x + width && my >= y && my <= y + height) {
        // Crucial: Reset key state before restarting
        keys.space.pressed = false; 
        document.getElementById('leaderboard-overlay').style.display = 'none';
        restartGame();
    }
}


canvas.addEventListener("pointerup", handleInput);

function handleInput(e) {
    // Prevent default touch behaviors (like scrolling/zooming)
    e.preventDefault(); // Moved inside to prevent scroll on tap

    // Determine coordinates based on event type
    let mx, my;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
        // Touch event (touchend)
        mx = e.changedTouches[0].clientX - rect.left;
        my = e.changedTouches[0].clientY - rect.top;
    } else {
        // Mouse event (click)
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
    }

    // Retry button logic ONLY executes if the game is over
    if (isGameOver && retryButton) { // <--- CRITICAL CHECK: Only process retry if game is over
        const { x, y, width, height } = retryButton;
        if (mx >= x && mx <= x + width && my >= y && my <= y + height) {
            // IMPORTANT: Stop the key press that initiated the touch/click
            keys.space.pressed = false; 
            document.getElementById('leaderboard-overlay').style.display = 'none';
            restartGame();
        }
    } else if (!isGameOver && e.type === 'click') {
      // For desktop users who click for a jump (though you have mousedown/up for that)
      keys.space.pressed = true;
      setTimeout(() => keys.space.pressed = false, 50); // Simulates a quick tap/click
    }
}


function restartGame() {
  isGameOver = false; 
  player.visible = true; 
  particles = [];      
  updateSpawnInterval()
  playerColor = OG_PLAYER_COLOR 
  retryButton = null;
  spikes = [];
  bgcolor = "#04006B";
  groundcolor = "darkblue";
  blocks = [];
  circles = [];
  circlesB = [];
  circlesW = [];
  rageActive = false
  ghostActive = false;
  ragespeed = 1
  rageDuration = 0
  OGrageDuration = 0
  OGragespeed = 1
  player.position = { x: canvas.width / 4, y: ground.position.y - 40 };
  player.velocity = { x: 0, y: 0 };
  player.rotation = 0;
  x = 0
  last = 0
  score = 0
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    x = Math.floor(Math.random()*16)
    let idx = x
    while(x == last){
      x = Math.floor(Math.random()*16)
    }
    last = x
    spawnPiece(Math.floor(idx), canvas.width + 30);
    
  }, 3000/ragespeed/speedBoost);

  lastTime = performance.now();
  animate(lastTime);
}

// ----- Start Spawning -----
intervalId = setInterval(() => {
  x = Math.floor(Math.random()*16)
  let idx = x
  while(x == last){
    x = Math.floor(Math.random()*16)
  }
  last = x

  spawnPiece(Math.floor(idx), canvas.width + 30);
}, 3000/ragespeed/speedBoost);

// ----- Animation -----
let lastTime = performance.now();
let currentAnimationId; // To store the ID for cancellation

function animate(currentTime) {
  currentAnimationId = requestAnimationFrame(animate); // Store ID immediately
  
  if (isGameOver) { 
    // Check if particles have settled or a short delay has passed (e.g., 1 frame)
    // Or, you could check if the particles array is empty, but a simple delay is better 
    // for an explosive effect.
    
    // --- 1. Draw one last frame to show the particles ---
    // (The rest of the animate function will draw the particles)
    
    // --- 2. Stop spawning new obstacles ---
    clearInterval(intervalId);
    
    // --- 3. Run game over logic and cancel animation on the NEXT call ---
    // We only draw the game over screen and cancel *after* the particles have been drawn once.
    if (particles.length === 0 && player.visible === false) { 
      // A more robust check: ensure all death particles have faded/left
      gameOverScreen();
      cancelAnimationFrame(currentAnimationId);

      const playerName = prompt("Game Over! Enter your name:");
      if (playerName) {
          window.submitScore(playerName, score);
      } else {
          window.refreshLeaderboard();
      }
      return;
    } else if (particles.length > 0) {
      // Keep running the animation loop until all particles are gone.
      // This ensures the explosion is fully visible.
    } else {
      // This case should cover when particles.length is 0 but visible is false (post-explosion)
      gameOverScreen();
      console.log('shutting off animations')
      cancelAnimationFrame(currentAnimationId);
      return;
    }
  
  }

  const delta = Math.min((currentTime - lastTime) / 16.67, 3);
  lastTime = currentTime;
  
  context.fillStyle = bgcolor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  ground.draw();
  
  player.update(delta); 
    
  //score
  let fontSize = window.innerWidth < 600 ? 50 : 25; 
  context.font = `bold ${fontSize}px sans-serif`;
  context.fillStyle = "white";
  context.textAlign = "left"; 

  context.fillText(`Score: ${score}`, 20, fontSize + 10);
    

  player.velocity.y += 0.8 * delta;
  onSomething = false;
  
  //particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update(delta);

    // Remove particle if it has faded out
    if (particle.opacity <= 0) {
        particles.splice(i, 1);
    }
  }
  
  //rage mode
  if(score>=30 && !rageActive){
    bgcolor = '#570000ff'
    groundcolor = 'darkred'
    ragespeed = 2.5
    rageDuration = 210
    OGrageDuration = 210
    OGragespeed = 2.5
    rageActive = true
    updateSpawnInterval()
  }
  // Blocks
  if (!isGameOver) {
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      block.update(delta,speedBoost);
      if (rectRectCollision(player, block)) onSomething = true;
      if (block.position.x + block.size / 2 < 0 && block.lastPiece){
        blocks.splice(i, 1);
        score+=1
      } 
      else if (block.position.x + block.size / 2 < 0) blocks.splice(i, 1);
    }
  }
  
  //circle loop
  if (!isGameOver) {
    for (let i = circles.length - 1; i >= 0; i--) {
      const circle = circles[i];
      circle.update(delta,speedBoost);

      if (rectCircleCollision(player, circle)) {
        // Jump boost
        audioFiles.collect.currentTime = 0; 
        audioFiles.collect.play().catch(e => console.error("Jump audio failed:", e));
        player.velocity.y = -20; // ~1.5x normal jump

        speedBoost = 3; // global multiplier
        speedBoostTimer = 60; // lasts 1 second at 60fps
        updateSpawnInterval()
        // Remove circle
        circles.splice(i, 1);
        
      }

      if (circle.position.x + circle.radius < 0) circles.splice(i, 1);
    }
  }
  //circles Blue (Ghost Mode)
  if (!isGameOver) {
    for (let i = circlesB.length - 1; i >= 0; i--) {
      const circle = circlesB[i];
      circle.update(delta,speedBoost);
      if (rectCircleCollision(player, circle)) {
          ghostActive = true;
          ghostTimer = GHOST_DURATION;
          
          audioFiles.collect2.currentTime = 0; 
          audioFiles.collect2.play().catch(e => console.error("Jump audio failed:", e));
          
          audioFiles.ghostMode.currentTime = 0; 
          audioFiles.ghostMode.play().catch(e => console.error("Jump audio failed:", e));
          //Set Ghost Appearance
          playerColor = GHOST_PLAYER_COLOR;
          playerShadowColor = 'lightblue';
          playerStroke = 'blue';
          
          circlesB.splice(i, 1);
      }

      if (circle.position.x + circle.radius < 0) circlesB.splice(i, 1);
    }
  }
  //circles Weak
  if (!isGameOver) {
    for (let i = circlesW.length - 1; i >= 0; i--) {
      const circle = circlesW[i];
      circle.update(delta, speedBoost);

      if (rectCircleCollision(player, circle)) {
        // WEAKER SPPEd BOOST
        audioFiles.collect.currentTime = 0; 
        audioFiles.collect.play().catch(e => console.error("Collect audio failed:", e));
        
        player.velocity.y = -20;

        speedBoost = 1.5; // Keep the same speed boost effect
        speedBoostTimer = 10; 
        updateSpawnInterval()
        
        circlesW.splice(i, 1);
      }

      if (circle.position.x + circle.radius < 0) circlesW.splice(i, 1);
    }
  }
  // Ground
  if (player.position.y + player.size / 2 >= ground.position.y) {
    player.position.y = ground.position.y - player.size / 2;
    player.velocity.y = 0;
    onSomething = true;
  }

  // Jump
  if (keys.space.pressed && onSomething){
  player.velocity.y = -14;
}
  // Rotation
  if (!onSomething) player.rotation += 0.042 * delta;
  else player.rotation = 0;

  // Spikes
  if (!isGameOver) {
    for (let i = spikes.length - 1; i >= 0; i--) {
      const spike = spikes[i];
      spike.update(delta,speedBoost);
      if (rectTriangleCollision(player, spike)) {
          // <<< FIX: Prepare for death, but DON'T cancel animation yet
          if (player.visible) {
              spawnParticles(player.position.x, player.position.y, playerColor);
              player.visible = false; // Hide player
              isGameOver = true; // Set flag to stop next frame
              audioFiles.death.currentTime = 0; 
              audioFiles.death.play().catch(e => console.error("Jump audio failed:", e));
          }
      }
      if (spike.position.x + 40 < 0 && spike.lastPiece){
        spikes.splice(i, 1);
        score+=1
      }
      else if (spike.position.x + 40 < 0) spikes.splice(i, 1);
    }
  }
  
  if (player.visible) { // <<< MOVED: Draw player after obstacle updates/checks
    player.draw();
  }
  
  if (speedBoostTimer > 0) {
    speedBoostTimer -= 1 * delta;
    if (speedBoostTimer <= 0) speedBoost = 1;
    updateSpawnInterval()
  }
  if (rageDuration > 0) {
    rageDuration--;
    ragespeed -= (OGragespeed-1)/OGrageDuration;
    if (rageDuration <= 0){
      ragespeed = 1;
      OGragespeed = 1
      OGrageDuration = 0
      updateSpawnInterval()
    } 
  }if (ghostTimer > 0) {
    ghostTimer -= 1 * delta; // Use delta for time-compensated timer
    
    const timeRemaining = ghostTimer / delta; // Time remaining in frames (approx. 60 FPS)

    if (timeRemaining <= 60 && timeRemaining > 0) {
        // --- 1. Flicker (Frames 60 down to 30) ---
        if (timeRemaining > 30 && (timeRemaining > 50 || (timeRemaining <= 40 && timeRemaining > 30))) {
            const isVisible = (Math.floor(timeRemaining) % 10) < 5; // Toggles every 5 frames
            playerColor = isVisible ? GHOST_PLAYER_COLOR : OG_PLAYER_COLOR;
        } 
        
        // --- 2. Fade (Frames 30 down to 0) ---
        else if (timeRemaining <= 30) {
            // Calculate the fade factor (0 at 30 frames, 1 at 0 frames)
            const fadeFactor = (30 - timeRemaining) / 30; 
            
            const r = Math.round(129 + (173 - 129) * fadeFactor);
            const g = Math.round(173 + (17 - 173) * fadeFactor);
            const b = Math.round(255 + (221 - 255) * fadeFactor);
            const a = (0.3 + (1.0 - 0.3) * fadeFactor).toFixed(2);
            
            playerColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    } 

    if (ghostTimer <= 0 && ghostActive) { // Check ghostActive to run this block only once
        // --- GHOST MODE END ---
        ghostActive = false;
        
        // Reset colors to final, opaque, non-ghost state
        playerColor = OG_PLAYER_COLOR; 
        playerStroke = 'white';
        playerShadowColor = 'transparent';
        
        // Play the exit/transform sound
        audioFiles.collect2.currentTime = 0; 
        audioFiles.collect2.play().catch(e => console.error("Exit Ghost Mode audio failed:", e));

        // Check for immediate collision (optional, but good practice)
        for (const block of blocks) {
            rectRectCollision(player, block);
        }
    }
  }
}
// ----- Game Over -----
function gameOverScreen() {
    let titleSize = window.innerWidth < 600 ? 50 : 100;
    context.font = `bold ${titleSize}px sans-serif`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 150);

    const w = 150, h=60
    let buttonX;
    
    if (window.innerWidth < 600) {
        buttonX = canvas.width / 2 - w - 10;//left on mobile
    } else {
        buttonX = canvas.width / 2 - w / 2;//center for laptop or bigger
    }
    
    const buttonY = canvas.height / 2 - 150+titleSize;

    context.fillStyle = "#2e3bcc";
    context.fillRect(buttonX, buttonY, w, h);
    context.font = "bold 20px sans-serif";
    context.fillStyle = "white";
    context.fillText("Retry", buttonX + w / 2, buttonY + 38);

    retryButton = { x: buttonX, y: buttonY, width: w, height:h };

    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'block';
    
    if (window.innerWidth < 600) {
        overlay.style.left = "70%"; 
        overlay.style.top = "65%";
        overlay.style.width = "180px"; 
    } else {
        overlay.style.left = "50%";
        overlay.style.top = "50%";
        overlay.style.width = "350px";
    }
}

// ----- Start -----
animate(performance.now());
