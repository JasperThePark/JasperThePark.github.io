const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const myMusic = [
  "sounds/inono777-game-8-bit-399898.mp3",
  "sounds/kissan4-arcade-drift-578099.mp3",
  "sounds/lesiakower-arcade-party-173553.mp3",
  "sounds/nocopyrightsound633-arcade-beat-323176.mp3",
  "sounds/pixelmaniaxx-the-wandering-samurai-344699.mp3",
];

const bossmusic = [
  // Add boss tracks here later
];

class MusicManager {
  constructor(playlist, fadeTimeMs = 2000) {
    this.playlist = playlist;
    this.fadeTime = fadeTimeMs;
    this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    this.masterVolume = 0.1; // Default to 10% volume

    this.playerA = new Audio();
    this.playerB = new Audio();
    this.activePlayer = this.playerA;
    this.nextPlayer = this.playerB;

    this.playerA.addEventListener("timeupdate", () => this.checkCrossfade());
    this.playerB.addEventListener("timeupdate", () => this.checkCrossfade());

    this.isCrossfading = false;
  }

  setVolume(newVolume) {
    // Clamp between 0 and 1
    this.masterVolume = Math.max(0, Math.min(1, newVolume)); 
    
    // Immediately apply to BOTH players so volume changes are instant
    this.activePlayer.volume = this.masterVolume;
    this.nextPlayer.volume = this.masterVolume;
  }

  play() {
    this.activePlayer.src = this.playlist[this.currentIndex];
    this.activePlayer.volume = 0; // Start at 0 for the fade-in
    
    const playPromise = this.activePlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.fade(this.activePlayer, 0, 1);
      }).catch(error => {
        console.warn("Autoplay blocked. Waiting for first click.");
        document.addEventListener("click", () => {
          this.activePlayer.play();
          this.fade(this.activePlayer, 0, 1);
        }, { once: true });
      });
    }
  }

  checkCrossfade() {
    if (this.isCrossfading || !this.activePlayer.duration) return;
    const timeRemaining = this.activePlayer.duration - this.activePlayer.currentTime;
    if (timeRemaining <= this.fadeTime / 1000) {
      this.crossfade();
    }
  }

  crossfade() {
    this.isCrossfading = true;
    this.currentIndex = Math.floor(Math.random() * this.playlist.length);

    this.nextPlayer.src = this.playlist[this.currentIndex];
    this.nextPlayer.volume = 0;
    this.nextPlayer.play();

    this.fade(this.activePlayer, 1, 0);
    this.fade(this.nextPlayer, 0, 1);

    setTimeout(() => {
      this.activePlayer.pause();
      const temp = this.activePlayer;
      this.activePlayer = this.nextPlayer;
      this.nextPlayer = temp;
      this.isCrossfading = false;
    }, this.fadeTime);
  }

  fade(audioElement, startRatio, endRatio) {
    const steps = 20; 
    const interval = this.fadeTime / steps;
    let currentStep = 0;

    const fader = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      let currentRatio = startRatio + (endRatio - startRatio) * progress;
      
      // Always multiplies by the live masterVolume so changes take effect immediately
      let finalVolume = currentRatio * this.masterVolume;
      audioElement.volume = Math.max(0, Math.min(1, finalVolume));

      if (currentStep >= steps) clearInterval(fader);
    }, interval);
  }
}

const bgm = new MusicManager(myMusic, 3000);
let musicStarted = false;
let score = 0
let isbosspink = false
let isBossRed = false
let isBossNewAnim = false
let spawncount = 0
let onSomething = false;
let speedBoost = 1;
let bossing = false
let speedBoostTimer = 0;
let lastboss = 0
let bgcolor = "#04006B";
let groundcolor = "darkblue";
let lastspawn = 0
let ragespeed = 1
let playerColor = "#ad11dde3"
let playerShadowColor = 'transparent'
let playerStroke = 'white'
let rageDuration = 0
let last = 0
let x = 0
let secondlastspawn = 0
let fontsize = 0
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log(canvas.width,canvas.height)
let OGragespeed = 1
let OGrageDuration = 0
let rageActive = false
let particles = []
let ghostActive = false;
let spikeghost = false
let isGameOver = false;
const GHOST_PLAYER_COLOR = "rgba(129, 173, 255, 0.3)";
let ghostTimer = 0; 
let spiketimer = 0
const GHOST_DURATION = 210;
const OG_PLAYER_COLOR = "#ad11dde3"; 
let bossspawns = 0
const audioFiles = {
    jump: new Audio('sounds/jump effect.mp3'), 
    collect: new Audio('sounds/yelloworb.mp3'), 
    collect2: new Audio('sounds/blueorb transform.mp3'),
    ghostMode: new Audio('sounds/ghostmode2.mp3'),
    death: new Audio('sounds/death effect.mp3'),
    warp: new Audio('sounds/warp.mp3'),
    shield: new Audio('sounds/shield.mp3'),
    red: new Audio('sounds/red.mp3'),
    pink: new Audio('sounds/pink.mp3'),
    dyna: new Audio('sounds/dyna.mp3'),
};
const TOTAL_FRAMES = 42;
const bossFrames = [];
let loadedCount = 0;

for (let i = 1; i <= 23; i++) {
  const img = new Image();
  const paddedIndex = String(i).padStart(12, '0'); // Matches Wick Editor export
  img.src = `frame${paddedIndex}.png`; 
  img.onload = () => {
    loadedCount++;
    console.log(`Loaded frame ${i}: ${loadedCount}/${TOTAL_FRAMES}`);
  };

  img.onerror = () => {
    console.error(`FAILED to load image: frame${paddedIndex}.png. Check file path or name!`);
  };
  bossFrames.push(img);
}
for (let i = 1; i <= 19; i++) {
  const img = new Image();
  const paddedIndex = String(i+24).padStart(12, '0'); // Matches Wick Editor export
  img.src = `frame${paddedIndex}.png`; 
  img.onload = () => {
    loadedCount++;
    console.log(`Loaded frame ${i}: ${loadedCount}/${42}`);
  };

  img.onerror = () => {
    console.error(`FAILED to load image: frame${paddedIndex}.png. Check file path or name!`);
  };
  bossFrames.push(img);
}
const bossNewFrames = [];
const TOTAL_NEW_FRAMES = 120; 
let loadedNewCount = 0;

// Start the loop at 0 to catch frame000000000000
for (let i = 0; i < 120; i++) {
  const img = new Image();
  
  // Hardcode the 9 static zeroes, then pad the changing 3 digits (000 to 120)
  const suffix = String(i).padStart(3, '0');
  img.src = `blueattack/frame000000000${suffix}.png`; 
  
  img.onload = () => loadedNewCount++;
  img.onerror = () => loadedNewCount++; // Failsafe
  
  bossNewFrames.push(img);
}
let bosspinkFrames = []
const pinktotalframes = 58; 
let loadedpinkCount = 0;

// Start the loop at 0 to catch frame000000000000
for (let i = 0; i < 58; i++) {
  const img = new Image();
  
  // Hardcode the 9 static zeroes, then pad the changing 3 digits (000 to 120)
  const suffix = String(i).padStart(3, '0');
  img.src = `pinkattack/frame000000000${suffix}.png`; 
  
  img.onload = () => loadedpinkCount++;
  img.onerror = () => loadedpinkCount++; // Failsafe
  
  bosspinkFrames.push(img);
}

let isbossdip = false
let bossdipFrames = []
const diptotalframes = 15; 
let loadeddipCount = 0;

// Start the loop at 0 to catch frame000000000000
for (let i = 0; i < 15; i++) {
  const img = new Image();
  
  // Hardcode the 9 static zeroes, then pad the changing 3 digits (000 to 120)
  const suffix = String(i).padStart(3, '0');
  img.src = `run/frame000000000${suffix}.png`; 
  
  img.onload = () => loadeddipCount++;
  img.onerror = () => loadeddipCount++; // Failsafe
  
  bossdipFrames.push(img);
}

let gameState = "MENU"; // "MENU" or "PLAYING"
let showWarningModal = true;
let allowFlashes = true; // Controlled by the warning modal

let isGravityFlipped = false;
let gravDir = 1; // 1 is normal, -1 is inverted

function toggleGravity() {
  gravDir *= -1; // Instantly flips the state
  player.velocity.y = 25 * gravDir; 
  onSomething = false;
}

// Interactive Button Bounding Boxes (Updated dynamically in draw)
const buttons = {
  modalOff: { x: 0, y: 0, w: 0, h: 0 },
  modalOn:  { x: 0, y: 0, w: 0, h: 0 },
  skins:    { x: 0, y: 0, w: 0, h: 0 },
  start:    { x: 0, y: 0, w: 0, h: 0 }
};

// ==========================================
// HELPER: DRAW ROUNDED RECTANGLES
// ==========================================
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    // Fallback for older browsers
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
  }
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
  ctx.restore();
}

// ==========================================
// DRAW LOGO ("Cubic Dash") - Scale Aware
// ==========================================
function drawLogo(ctx, centerX, centerY, scale) {
  ctx.save();

  // 1. Draw Speed Trails behind cube
  ctx.strokeStyle = "#c0cadc";
  ctx.lineWidth = 4 * scale;
  const trailY = centerY + (10 * scale);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX - (240 * scale), trailY + (i * 16 * scale));
    ctx.lineTo(centerX - (130 * scale), trailY + (i * 16 * scale));
    ctx.stroke();
  }

  // 2. Draw Tilted Cube Icon
  ctx.save();
  ctx.translate(centerX - (145 * scale), centerY - (10 * scale));
  ctx.rotate((30 * Math.PI) / 180);

  // Outer Box
  drawRoundedRect(ctx, -40 * scale, -40 * scale, 80 * scale, 80 * scale, 6 * scale, null, "#dce4f0", 10 * scale);
  // Inner Filled Box
  drawRoundedRect(ctx, -35 * scale, -35 * scale, 70 * scale, 70 * scale, 4 * scale, "#0a2a66");
  drawRoundedRect(ctx, -18 * scale, -18 * scale, 36 * scale, 36 * scale, 3 * scale, "#dce4f0");
  ctx.restore();

  // 3. Draw Title Text
  ctx.fillStyle = "#ffffff";
  let titleFontSize = Math.max(32, Math.floor(64 * scale));
  ctx.font = `900 ${titleFontSize}px sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Cubic Dash", centerX - (70 * scale), centerY + (10 * scale));

  ctx.restore();
}

// ==========================================
// MAIN MENU RENDER LOOP (Mobile Responsive)
// ==========================================
function drawMenu() {
  if (gameState !== "MENU") return;

  // Calculate dynamic scale factor based on standard 800px reference width
  const baseWidth = 800;
  let scale = canvas.width / baseWidth;
  // Prevent it from shrinking or blowing up too aggressively on extreme viewports
  scale = Math.max(0.6, Math.min(scale, 1.5));

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Clear Background (Deep Navy Blue)
  context.fillStyle = "#0a2a66";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Title Screen (Logo + Main Buttons)
  drawLogo(context, cx, cy - (30 * scale), scale);

  // Main Buttons Layout (Scaled)
  const btnY = cy + (90 * scale);
  const btnW1 = 125 * scale;
  const btnW2 = 135 * scale;
  const btnH = 50 * scale;
  const btnRadius = 16 * scale;
  const fontSize = Math.max(16, Math.floor(28 * scale));

  // Skins Button (Dark Pill)
  buttons.skins = { x: cx - (140 * scale), y: btnY, w: btnW1, h: btnH };
  drawRoundedRect(context, buttons.skins.x, buttons.skins.y, buttons.skins.w, buttons.skins.h, btnRadius, "#0d224d");
  context.fillStyle = "#ffffff";
  context.font = `bold ${fontSize}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Skins", buttons.skins.x + buttons.skins.w / 2, buttons.skins.y + buttons.skins.h / 2);

  // Start Button (Light Pill)
  buttons.start = { x: cx + (5 * scale), y: btnY, w: btnW2, h: btnH };
  drawRoundedRect(context, buttons.start.x, buttons.start.y, buttons.start.w, buttons.start.h, btnRadius, "#dce4f0");
  context.fillStyle = "#0a2a66";
  context.fillText("Start", buttons.start.x + buttons.start.w / 2, buttons.start.y + buttons.start.h / 2);

  // 2. Draw Warning Modal Overlay (if active)
  if (showWarningModal) {
    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dark Modal Box (Scaled to fit smaller screen widths safely)
    const modalW = Math.min(canvas.width * 0.9, 420 * scale);
    const modalH = 220 * scale;
    const modalX = cx - modalW / 2;
    const modalY = cy - modalH / 2;

    drawRoundedRect(context, modalX, modalY, modalW, modalH, 18 * scale, "#111116", "#22222a", 2 * scale);

    // Warning Text
    context.fillStyle = "#ff1a1a";
    let warningFontSize = Math.max(12, Math.floor(15 * scale));
    context.font = `bold ${warningFontSize}px sans-serif`;
    context.textAlign = "left";
    context.textBaseline = "top";

    const warningText = "WARNING: This game contains bright, flashing lights that may trigger seizures for people with photosensitive epilepsy.";
    wrapText(context, warningText, modalX + (28 * scale), modalY + (24 * scale), modalW - (56 * scale), 20 * scale);

    // Modal Action Buttons
    const modalBtnY = modalY + modalH - (62 * scale);
    const modalBtnW = (modalW - (68 * scale)) / 2;
    const modalBtnH = 44 * scale;
    const modalBtnRadius = 10 * scale;
    const modalBtnFontSize = Math.max(13, Math.floor(17 * scale));

    // "Turn it Off" Button (Dark Grey)
    buttons.modalOff = { x: modalX + (28 * scale), y: modalBtnY, w: modalBtnW, h: modalBtnH };
    drawRoundedRect(context, buttons.modalOff.x, buttons.modalOff.y, buttons.modalOff.w, buttons.modalOff.h, modalBtnRadius, "#383838");
    context.fillStyle = "#ffffff";
    context.font = `bold ${modalBtnFontSize}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Turn it Off", buttons.modalOff.x + buttons.modalOff.w / 2, buttons.modalOff.y + buttons.modalOff.h / 2);

    // "Keep it on" Button (Bright Red)
    buttons.modalOn = { x: modalX + (36 * scale) + modalBtnW, y: modalBtnY, w: modalBtnW, h: modalBtnH };
    drawRoundedRect(context, buttons.modalOn.x, buttons.modalOn.y, buttons.modalOn.w, buttons.modalOn.h, modalBtnRadius, "#d90404");
    context.fillStyle = "#ffffff";
    context.fillText("Keep it on", buttons.modalOn.x + buttons.modalOn.w / 2, buttons.modalOn.y + buttons.modalOn.h / 2);
  }

  // Loop menu animation while in MENU state
  if (gameState === "MENU") {
    requestAnimationFrame(drawMenu);
  }
}

// Helper: Word Wrap for Canvas Text
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// ==========================================
// UNIFIED INTERACTION HANDLER (Mouse + Touch)
// ==========================================
function handleMenuInteraction(clientX, clientY) {
  if (gameState !== "MENU") return;

  const rect = canvas.getBoundingClientRect();
  const clickX = clientX - rect.left;
  const clickY = clientY - rect.top;

  const isInside = (btn) => clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h;

  // 1. Modal Active Interactions
  if (showWarningModal) {
    if (isInside(buttons.modalOff)) {
      allowFlashes = false;
      showWarningModal = false;
    } else if (isInside(buttons.modalOn)) {
      allowFlashes = true;
      showWarningModal = false;
    }
    return;
  }

  // 2. Title Screen Interactions
  if (isInside(buttons.start)) {
    gameState = "PLAYING";
    
    if (typeof animate === "function") {
      requestAnimationFrame(animate);
    }
  } else if (isInside(buttons.skins)) {
    console.log("Skins button clicked!");
  }
}

// Mouse Click Support
canvas.addEventListener("click", (e) => {
  handleMenuInteraction(e.clientX, e.clientY);
});

// Mobile Touch Support (Uses first touch coordinate and prevents default scrolling lag)
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    handleMenuInteraction(touch.clientX, touch.clientY);
    e.preventDefault(); // Prevents double-firing mouse events and screen bouncing
  }
}, { passive: false });

// Start the title screen on page load
drawMenu();
// ===== STATE & SUMMON SYSTEM =====
let bossFrameIndex = 0;
let frameTimer = 0;
const FRAMES_PER_ANIM_TICK = 5; // 12 FPS timing (60 / 12)

// 1. NORMAL BOSS SUMMON
function summonBoss() {
  // If already playing the normal animation, do nothing
  if (bossing && !isBossRed && !isBossNewAnim) return; 
  
  isBossRed = false;
  isBossNewAnim = false; // SWITCH OFF: Tells drawBoss to use original array
  isbosspink = false
  isbossdip = false
  bossing = true;
  bossFrameIndex = 0; // Starts at frame 0 of original array
  frameTimer = 0;
}

// 2. RED ATTACK (Your original 42-frame bossred)
function redattack() {
  if (isBossRed) return; 
  
  isBossRed = true;
  isBossNewAnim = false; // SWITCH OFF: Tells drawBoss to use original array
  isbosspink = false
  isbossdip = false
  bossing = true;
  bossFrameIndex = 23; // Starts at frame 23 of original array
  frameTimer = 0;
}

// 3. BLUE ATTACK (The new 121-frame looping animation)
function blueattack() {
  if (isBossNewAnim) return; 
  console.log('called')
  isBossRed = false; 
  isBossNewAnim = true; // SWITCH ON: Tells drawBoss to use the bossNewFrames array
  isbosspink = false
  isbossdip = false
  bossing = true;
  bossFrameIndex = 0; // Starts at frame 0 of the NEW array
  frameTimer = 0;
}
function pinkattack() {
  if (isbosspink) return; 
  isBossRed = false; 
  isbosspink = true; // SWITCH ON: Tells drawBoss to use the bossNewFrames array
  isBossNewAnim = false
  bossing = true;
  bossFrameIndex = 0; // Starts at frame 0 of the NEW array
  frameTimer = 0;
}
function bossrun() {
  if (isbossdip) return; 
  isBossRed = false; 
  isbosspink = false; // SWITCH ON: Tells drawBoss to use the bossNewFrames array
  isBossNewAnim = false
  isbossdip = true
  bossing = true;
  bossFrameIndex = 0; // Starts at frame 0 of the NEW array
  frameTimer = 0;
}
function drawBoss(ctx, delta) {
  // 1. Determine which animation sequence and framerate to use
  let activeArray = bossFrames;
  let currentTotalFrames = TOTAL_FRAMES;
  let currentLoadedCount = loadedCount;
  
  // Default to 12 FPS (5 game frames per animation frame)
  let currentTicksPerFrame = 5; 

  // Swap arrays and increase speed if the blue attack is active
  if (isBossNewAnim) {
    activeArray = bossNewFrames;
    currentTotalFrames = 120; // The 0-120 frames
    currentLoadedCount = loadedNewCount;
    
    // Switch to 60 FPS (1 game frame per animation frame)
    currentTicksPerFrame = 1; 
  }if (isbosspink) {
    activeArray = bosspinkFrames;
    currentTotalFrames = 58; // The 0-120 frames
    currentLoadedCount = loadedpinkCount;
    
    // Switch to 60 FPS (1 game frame per animation frame)
    currentTicksPerFrame = 2.5; 
  }if (isbossdip) {
    activeArray = bossdipFrames;
    currentTotalFrames = 15; // The 0-120 frames
    currentLoadedCount = loadeddipCount;
    
    // Switch to 60 FPS (1 game frame per animation frame)
    currentTicksPerFrame = 2.5; 
  }

  // 2. Safety Checks
  if (!bossing || currentLoadedCount < currentTotalFrames) return;
  const img = activeArray[bossFrameIndex];
  if (!img) return;

  // 3. Size and Position Math
  const scale = canvas.height / 696;
  const scaledWidth = 1528 * scale;
  const scaledHeight = 696 * scale;
  const drawX = (canvas.width - scaledWidth) / 2;
  const drawY = (ground.position.y - scaledHeight) + ground.height;

  // 4. Draw the Boss
  context.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

  frameTimer += delta;
  
  while (frameTimer >= currentTicksPerFrame) {
    frameTimer -= currentTicksPerFrame;
    
    // Original 12 FPS animation boundary check
    if (!isBossNewAnim && !isbosspink && !isbossdip) {
      const currentEndFrame = isBossRed ? currentTotalFrames - 1 : 22;
      if (bossFrameIndex < currentEndFrame) {
        bossFrameIndex++;
        if(bossFrameIndex==41){
          if (allowFlashes && typeof screenFlash !== "undefined") {
                screenFlash.trigger();
              }
              audioFiles.red.currentTime = 0
                audioFiles.red.play()
        }
      }
    } 
    // NEW 60 FPS check: Holds the final image
    else if(isBossNewAnim){
      // Only advance the frame if we haven't reached the end of the array
      if (bossFrameIndex < currentTotalFrames - 1) {
        bossFrameIndex++;
        if(bossFrameIndex==119){
          toggleGravity()
          audioFiles.warp.currentTime = 0
                audioFiles.warp.play()
          if (allowFlashes && typeof screenFlash !== "undefined") {
                screenblue.trigger();
                
              }
        }
      }
      
    }else if(isbosspink){
      // Only advance the frame if we haven't reached the end of the array
      if (bossFrameIndex < currentTotalFrames - 1) {
        bossFrameIndex++;
        if(bossFrameIndex== currentTotalFrames - 1){
          if (allowFlashes && typeof screenFlash !== "undefined") {
                screenpink.trigger();
              }
          audioFiles.pink.currentTime = 0
                audioFiles.pink.play()
        }
      }
      
    }else if(isbossdip){
      // Only advance the frame if we haven't reached the end of the array
      if (bossFrameIndex < currentTotalFrames - 1) {
        bossFrameIndex++;
        if(bossFrameIndex== currentTotalFrames - 1){
          toggleGravity()
          bossing = false
        }
      }
      
    }
  }
}
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


class FlashAnimation {
  constructor(totalFrames = 60,color = 'rgba(255, 200, 200, 1)',color2 = "rgba(255, 0, 0, 1)") {
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.active = false;
    this.color = color
    this.color2 = color2
  }

  // Use this to start the explosion sequence
  trigger() {
    this.active = true;
    this.currentFrame = 0;
  }

  update() {
    if (!this.active) return;
    this.currentFrame++;
    
    // Deactivate once the sequence finishes
    if (this.currentFrame >= this.totalFrames) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    
    // Phase 1: The Initial Blinding Impact (Frames 0-3)
    if (this.currentFrame <= 3) {
      ctx.fillStyle = this.color; // Blinding white/pinkish red
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } 
    // Phase 2: One Great Red Fade (Frames 4-60)
    else {
      // Calculate how much opacity we should have based on remaining frames
      const fadeDuration = this.totalFrames - 3; 
      const currentFadeFrame = this.currentFrame - 3;
      
      // Goes from 1.0 down to 0.0 smoothly
      const opacity = 1.0 - (currentFadeFrame / fadeDuration); 

      ctx.globalAlpha = opacity;
      ctx.fillStyle = this.color2; // Pure, intense red
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.restore();
  }
}
const screenFlash = new FlashAnimation(60)
const screenblue = new FlashAnimation(60,'rgb(227, 200, 255)','rgb(212, 0, 255)')
const screenpink = new FlashAnimation(60,'rgb(252, 200, 255)','rgb(255, 0, 238)')
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

    if (isGravityFlipped) {
      this.velocity.y *=-1
    } else {
      this.velocity.y *=1
    }

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
class Dynamite {
  constructor({ position, velocity = { x: -5, y: 0 }, lastPiece, angle = 45, scale = 0.25 }) {
    this.position = position;
    this.velocity = velocity; 
    this.lastPiece = lastPiece;
    this.angle = angle;
    this.scale = scale;
    this.size = 50;
  }

  drawStar(cx, cy, points, outerRadius, innerRadius, color) {
    context.beginPath();
    const step = Math.PI / points;
    let rot = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(rot) * r;
      const y = cy + Math.sin(rot) * r;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
      rot += step;
    }
    context.closePath();
    context.fillStyle = color;
    context.fill();
  }

  draw() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.angle * Math.PI) / 180);
    
    // SCALES EVERYTHING DOWN VISUALLY TO ~50x50
    context.scale(this.scale, this.scale);

    // Base styles
    context.fillStyle = "#a83226";
    context.strokeStyle = "#ff0000";
    context.lineWidth = 4;

    // 1. Back sticks
    context.beginPath();
    context.roundRect(-58, -80, 36, 160, 20);
    context.fill();
    context.stroke();

    context.beginPath();
    context.roundRect(22, -80, 36, 160, 20);
    context.fill();
    context.stroke();

    // 2. Front sticks
    context.beginPath();
    context.roundRect(-38, -85, 40, 170, 20);
    context.fill();
    context.stroke();

    context.beginPath();
    context.roundRect(-2, -85, 40, 170, 20);
    context.fill();
    context.stroke();

    // 3. Black straps
    context.strokeStyle = "black";
    context.lineWidth = 16;
    context.lineCap = "butt";

    context.beginPath();
    context.moveTo(-60, -35);
    context.quadraticCurveTo(0, -15, 60, -35);
    context.stroke();

    context.beginPath();
    context.moveTo(-60, 45);
    context.quadraticCurveTo(0, 65, 60, 45);
    context.stroke();

    // 4. Wires
    context.lineWidth = 4;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(-45, -80);
    context.quadraticCurveTo(-25, -110, 0, -115);

    context.moveTo(-18, -85);
    context.quadraticCurveTo(-8, -108, 0, -115);

    context.moveTo(18, -85);
    context.quadraticCurveTo(8, -108, 0, -115);

    context.moveTo(45, -80);
    context.quadraticCurveTo(25, -110, 0, -115);
    context.stroke();

    // 5. Fuse
    context.beginPath();
    context.moveTo(0, -115);
    context.bezierCurveTo(-15, -170, 30, -175, 35, -135);
    context.stroke();

    // 6. Spark Star
    this.drawStar(35, -135, 11, 16, 7, "#ff8c1a");

    context.restore();
  }

  update(delta, speedBoost = 1) {
    this.position.x += this.velocity.x * delta * speedBoost * ragespeed;
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
  constructor({ position,lastPiece }) {
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
class CircleP {
  constructor({ position }, lastPiece) {
    this.position = position;
    this.radius = 20;
    this.velocity = { x: -5, y: 0 };
    this.lastPiece = lastPiece;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "rgb(230, 0, 255)"; // Choose a distinct color (e.g., Orange)
    context.shadowColor = "lightpurple";
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
    }else if(spikeghost){
        baseColor = 'yellow'
    } 
    else {
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
    { type: "block", offsetX: 0, offsetY: 300, height: 50 },
    { type: "block", offsetX: 52, offsetY: 300, height: 50 },
    { type: "block", offsetX: 104, offsetY: 300, height: 50 },
    { type: "block", offsetX: 156, offsetY: 300, height: 50 },
    { type: "block", offsetX: 208, offsetY: 300, height: 50 },
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
    { type: "block", offsetX: 468, offsetY: 250, height: 50, lastPiece: true  },
  ],
  15:[
    { type: "block", offsetX: 0-52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 104-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 156-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 208-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 260-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 312-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 364-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 416-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 468-52, offsetY: 0, rotation:0},
    { type: "spike", offsetX: 520-52, offsetY: 0, rotation:0},

    { type: "block", offsetX: 150-52, offsetY: 80, height: 50 },
    { type: "block", offsetX: 300-52, offsetY: 160, height: 50, lastPiece: true  },
    {type: 'circle', offsetX: 420-52, offsetY: 70},
  ],
  16:[
    { type: "spike", offsetX: 0, offsetY: 0 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 312, offsetY: 0 },


    { type: "block", offsetX: 52, offsetY: 200, height: 50 },
    { type: "block", offsetX: 104, offsetY: 200, height: 50 },
    { type: "block", offsetX: 156, offsetY: 200, height: 50 },
    { type: "block", offsetX: 208, offsetY: 200, height: 50 },
    { type: "block", offsetX: 260, offsetY: 200, height: 50 ,lastPiece:true},
  ],
  17:[
    { type: "block", offsetX: -104, offsetY: 0, height: 50 },
    { type: "block", offsetX: -52, offsetY: 0, height: 50 },
    { type: "block", offsetX: -104, offsetY: 280, height: 50 },
    { type: "block", offsetX: -52, offsetY: 280, height: 50 },
    { type: "block", offsetX: 0, offsetY: 280, height: 50 },
    { type: "spike", offsetX: 0, offsetY: 280, rotation: 180},
    { type: "spike", offsetX: 0, offsetY:50 },
    { type: "block", offsetX: 52, offsetY: 280, height: 50 },
    { type: "block", offsetX: 104, offsetY: 280, height: 50 },
    { type: "block", offsetX: 156, offsetY: 280, height: 50 },
    { type: "block", offsetX: 208, offsetY: 280, height: 50 },
    { type: "block", offsetX: 260, offsetY: 280, height: 50 },
    { type: "spike", offsetX: 260, offsetY: 280, rotation: 180},
    { type: "spike", offsetX: 260, offsetY:50 , lastPiece: true},
    { type: "block", offsetX: 260+52, offsetY: 280, height: 50 },
    { type: "block", offsetX: 260+104, offsetY: 280, height: 50 },
    { type: "block", offsetX: 260+156, offsetY: 280, height: 50 },
    { type: "block", offsetX: 260+208, offsetY: 280, height: 50 },
    { type: "block", offsetX: 260+260, offsetY: 280, height: 50 },
    { type: "spike", offsetX: 260+260, offsetY: 280, rotation: 180},
    { type: "spike", offsetX: 260+260, offsetY: 50 , lastPiece: true},

    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY:0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260+52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260+104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260+156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260+208, offsetY: 0, height: 50 },
    { type: "block", offsetX: 260+260, offsetY:0, height: 50 },
{type: 'circleb', offsetX:260+260,offsetY:18+140},
  ],
  18:[
    { type: "spike", offsetX: -35+52, offsetY:0 },
    { type: "spike", offsetX: 104+52, offsetY:0 },
    { type: "spike", offsetX: -35+139/2+52, offsetY:208,rotation:180 },
    { type: "block", offsetX: -35+139/2+52, offsetY: 208, height: 50,lastPiece:true },
  ],
  19:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 104, height: 50 },
    { type: "block", offsetX: 156, offsetY: 104, height: 50 },
    { type: "block", offsetX: 208, offsetY: 104, height: 50 },
    { type: "spike", offsetX: 300, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 156, offsetY:156,rotation:0,lastPiece:true },
  ],
  20:[
    { type: "spike", offsetX: 0, offsetY:0,rotation:0 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104, offsetY:0,rotation:0 },
    { type: "block", offsetX: 156, offsetY: 104, height: 50 },
    { type: "block", offsetX: 364, offsetY: 260-104, height: 50 },
    { type: "spike", offsetX: 312, offsetY: 260-4-104, height: 50,rotation:-90},
    { type: "block", offsetX: 364, offsetY: 312-104, height: 50 },
    { type: "spike", offsetX: 312, offsetY: 312-4-104, height: 50,rotation:-90,lastPiece:true},
  ],
  21:[
    { type: "spike", offsetX: 0, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 52, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 156+20, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 208+20, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 312+40, offsetY:0,rotation:0,lastPiece:true },
  ],
  22:[
    { type: "spike", offsetX: 0, offsetY:260-35,rotation:180 },
    { type: "block", offsetX: 0, offsetY: 260-35, height: 50 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104, offsetY:0,rotation:0 },
    { type: "spike", offsetX: 156, offsetY:0,rotation:0 },
    {type: 'circlew', offsetX:208,offsetY:20},
    { type: "block", offsetX: 52, offsetY: 260-35, height: 50 },
    { type: "block", offsetX: 104, offsetY: 260-35, height: 50 },
    { type: "block", offsetX: 156, offsetY: 260-35, height: 50 },
    { type: "block", offsetX: 208, offsetY: 260-35, height: 50 },
    { type: "block", offsetX: 260, offsetY: 260-35, height: 50,lastPiece:true },
  ],
  23:[
    { type: "spike", offsetX: 0, offsetY:0-6,rotation:-90 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 104+30, offsetY:52-6,rotation:-90 },
    { type: "block", offsetX: 156+30, offsetY: 52, height: 50 },
    { type: "spike", offsetX: 104+30+30+104, offsetY:(104-9),rotation:-90 },
    { type: "block", offsetX: 156+30+104+30, offsetY: (52)*2, height: 50,lastPiece:true },
  ],
  24:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 104, height: 50 },
    {type: 'circlew', offsetX:260+20,offsetY:20},
    {type: 'spike', offsetX:312+20,offsetY:0},
  {type: 'spike', offsetX:312+80,offsetY:370,rotation:180},
  {type: 'block', offsetX:312+80,offsetY:370,lastPiece:true},
  ],
  25:[
    {type: 'spike', offsetX:-52,offsetY:0},
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    {type: 'circlew', offsetX:52+10,offsetY:20},
    { type: "block", offsetX: 104+20, offsetY: 0, height: 50 },

    { type: "block", offsetX: 208+20, offsetY: 208, height: 50 },
    { type: "spike", offsetX: 208+20, offsetY: 260 },
    { type: "block", offsetX: 260+20, offsetY: 208, height: 50 },
    { type: "spike", offsetX: 260+20, offsetY: 260 ,lastPiece:true},

  ],
  26:[
     { type: "block", offsetX: 0, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 0, offsetY: 250, rotation: 180},
    {type: 'circle', offsetX: 0,offsetY: 150},
    { type: "spike", offsetX: 0, offsetY: 50 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },

    { type: "block", offsetX: 52, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 250, rotation: 180},
    { type: "spike", offsetX: 52, offsetY: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },

    { type: "block", offsetX: 104, offsetY: 250, height: 50 },
    { type: "spike", offsetX: 104, offsetY: 250, rotation: 180},
    { type: "spike", offsetX: 104, offsetY: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 ,lastPiece:true},

  ],
  27:[
    { type: "circlew", offsetX: 0, offsetY: 20 },
     { type: "block", offsetX: 0, offsetY: 300, height: 50 },
     { type: "block", offsetX: 52, offsetY: 300, height: 50 },
    { type: "block", offsetX: 104, offsetY: 300, height: 50 },
     { type: "block", offsetX: 104, offsetY: 300-156, height: 50 },
     { type: "block", offsetX: 156, offsetY: 300-156, height: 50 },
     { type: "block", offsetX: 208, offsetY: 300-156, height: 50 },
     { type: "spike", offsetX: 260, offsetY: 300-156+52 },
     { type: "spike", offsetX: 312, offsetY: 300-156+52 },
     { type: "block", offsetX: 260, offsetY: 300-156, height: 50 },
     { type: "block", offsetX: 312, offsetY: 300-156, height: 50 },
      { type: "spike", offsetX: 208, offsetY: 0 },
     { type: "spike", offsetX: 260, offsetY: 0,lastPiece:true},
  ],
  28:[
    { type: "block", offsetX: -52, offsetY: 52, height: 50 },
    { type: "block", offsetX: 0-52, offsetY: 104, height: 50 },
    { type: "block", offsetX: 0-52, offsetY: 156, height: 50 },
    { type: "block", offsetX: 0-52, offsetY: 208, height: 50 },
    { type: "circlep", offsetX: 0, offsetY: 20},
    { type: "block", offsetX: 0, offsetY: 208, height: 50 },
{ type: "block", offsetX: 52, offsetY: 208, height: 50 },
{ type: "block", offsetX: 104, offsetY: 208, height: 50 },
{ type: "block", offsetX: 156, offsetY: 208, height: 50 },
{ type: "block", offsetX: 208, offsetY: 208, height: 50 },
{ type: "block", offsetX: 260, offsetY: 208, height: 50 },
{ type: "block", offsetX: 312, offsetY: 208, height: 50 },
{ type: "block", offsetX: 364, offsetY: 208, height: 50 },
{ type: "block", offsetX: 416, offsetY: 208, height: 50 },
{ type: "block", offsetX: 468, offsetY: 208, height: 50 },
{ type: "block", offsetX: 520, offsetY: 208, height: 50 },
{ type: "block", offsetX: 572, offsetY: 208, height: 50 },
{ type: "block", offsetX: 624, offsetY: 208, height: 50 },
{ type: "block", offsetX: 676, offsetY: 208, height: 50 },
{ type: "block", offsetX: 728, offsetY: 208, height: 50 },
{ type: "block", offsetX: 780, offsetY: 208, height: 50 },
{ type: "spike", offsetX: 260, offsetY: 208, rotation:180},
{ type: "spike", offsetX: 312, offsetY: 208, rotation:180},
{ type: "spike", offsetX: 468+30, offsetY: 208, rotation:180},
{ type: "spike", offsetX: 520+30, offsetY: 208, rotation:180},
{ type: "spike", offsetX: 260-104, offsetY: 0},
{ type: "spike", offsetX: 312-104, offsetY: 0},
{ type: "spike", offsetX: 468-104+30, offsetY: 0},
{ type: "spike", offsetX: 520-104+30, offsetY: 0},

{ type: "spike", offsetX: 676+30, offsetY: 208, rotation:180},
{ type: "circlep", offsetX: 758+30, offsetY: 156,lastPiece:true}
  ],
  29:[
    {type: 'circlep', offsetX: 0,offsetY: 150},
    { type: "spike", offsetX: 0, offsetY: 50 },
{ type: "spike", offsetX: 52, offsetY: 50 },
{ type: "spike", offsetX: 104, offsetY: 50 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
{ type: "block", offsetX: 52, offsetY: 0, height: 50 },
{ type: "block", offsetX: 104, offsetY: 0, height: 50 },
{ type: "block", offsetX:156, offsetY: 0, height: 50 },
{ type: "block", offsetX: 208, offsetY: 0, height: 50 },

{ type: "block", offsetX: 0, offsetY:312, height: 50 },
{ type: "block", offsetX: 0, offsetY: 312, height: 50 },
{ type: "block", offsetX: 52, offsetY: 312, height: 50 },
{ type: "block", offsetX: 104, offsetY: 312, height: 50 },
{ type: "block", offsetX:156, offsetY: 312, height: 50 },
{ type: "block", offsetX: 208, offsetY: 312, height: 50 },
{ type: "block", offsetX: 260, offsetY: 312, height: 50 },
{ type: "spike", offsetX: 156, offsetY: 312,rotation:180},
{ type: "spike", offsetX: 208, offsetY: 312,rotation:180},
{type: 'circlep', offsetX: 260,offsetY: 260,lastPiece:true},
  ],
  30:[
    { type: "block", offsetX: 0, offsetY: 52, height: 50 },
    { type: "block", offsetX: 0, offsetY: 104, height: 50 },
    { type: "block", offsetX: 0, offsetY: 156, height: 50 },
    { type: "block", offsetX: 0, offsetY: 208, height: 50 },
    { type: "block", offsetX: 52, offsetY: 52, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 104},
    { type: "block", offsetX: 52, offsetY: 208, height: 50 },
    { type: "block", offsetX: 104, offsetY: 208, height: 50 },
    { type: "block", offsetX: 156, offsetY: 208, height: 50 },
    { type: "block", offsetX: 208, offsetY: 208, height: 50 },
    { type: "circleb", offsetX: 208, offsetY: 156+20},
    { type: "block", offsetX: 260, offsetY: 208, height: 50 },
    { type: "block", offsetX: 260, offsetY: 156, height: 50 },
    { type: "block", offsetX: 260, offsetY: 104, height: 50 },
    { type: "block", offsetX: 260, offsetY: 52, height: 50 },
    { type: "block", offsetX: 208, offsetY: 52, height: 50,lastPiece:true },
    
  ],
  31:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "spike", offsetX: 52, offsetY: 0},
    { type: "spike", offsetX: 104, offsetY: 0},
    { type: "spike", offsetX: 156, offsetY: 0},
    { type: "spike", offsetX: 208, offsetY: 0},
    { type: "spike", offsetX: 260, offsetY: 0},
    { type: "block", offsetX: 312, offsetY: 0, height: 50 },
    { type: "block", offsetX: 78, offsetY: 80, height: 50 },
    { type: "block", offsetX: 234, offsetY: 80, height: 50,lastPiece:true },
  ],
  32:[

  ]
};
const jesterlevels = {
  0:[
    { type: "bomb", offsetX: -60, offsetY:18 },
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "bomb", offsetX: 60, offsetY:18 },
    { type: "block", offsetX: 120, offsetY: 0, height: 50 },
    { type: "bomb", offsetX: 180, offsetY:18 },
    { type: "block", offsetX: 240, offsetY: 0, height: 50 ,lastPiece:true},
  ],
  1:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "block", offsetX: 130, offsetY: 85, height: 50 },
    { type: "bomb", offsetX: 130, offsetY: 160, height: 50 },
    { type: "bomb", offsetX: 270, offsetY: 18, height: 50,lastPiece:true },
  ],
  2:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "bomb", offsetX: 71, offsetY: 18, height: 50 },
    { type: "block", offsetX: 142, offsetY: 0, height: 50,lastPiece:true },
  ],
  3:[
    { type: "bomb", offsetX: 0, offsetY: 18, height: 50 },
    { type: "block", offsetX: 52, offsetY: 0, height: 50 },
    { type: "block", offsetX: 104, offsetY: 0, height: 50 },
    { type: "block", offsetX: 156, offsetY: 0, height: 50 },
    { type: "block", offsetX: 208, offsetY: 0, height: 50 },
    { type: "block", offsetX: 52, offsetY: 208, height: 50 },
    { type: "block", offsetX: 104, offsetY: 208, height: 50 },
    { type: "block", offsetX: 156, offsetY: 208, height: 50 },
    { type: "block", offsetX: 208, offsetY: 208, height: 50 },
    { type: "bomb", offsetX: 156, offsetY: 156+18, height: 50 },
    { type: "bomb", offsetX: 260, offsetY: 40+18, height: 50 },
  ],
  4:[
    { type: "block", offsetX: 0, offsetY: 0, height: 50 },
    { type: "bomb", offsetX: 52, offsetY: 18, height: 50 },
    { type: "block", offsetX: 104, offsetY: 52, height: 50 },
    { type: "block", offsetX: 208+40, offsetY: 52, height: 50 },
    { type: "bomb", offsetX: 312+40, offsetY: 52+18+20, height: 50 },
    { type: "bomb", offsetX: 312+60, offsetY: 312, height: 50 },
  ],
  5:[
    { type: "spike", offsetX: 0, offsetY: canvas.height-104, rotation: 180},
    { type: "spike", offsetX: 52, offsetY: canvas.height-104, rotation: 180},
    { type: "block", offsetX: 52, offsetY: canvas.height-208, height: 50 },
    { type: "spike", offsetX: 104, offsetY: canvas.height-104, rotation: 180},
  ],
  6:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "spike", offsetX: 52, offsetY: canvas.height-104, rotation: 180},
    { type: "block", offsetX: 104, offsetY: canvas.height-52-104, height: 50 },
    { type: "spike", offsetX: 156, offsetY: canvas.height-104, rotation: 180},
    { type: "block", offsetX: 208, offsetY: canvas.height-52-104, height: 50,lastPiece:true },
  ],
  7:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "spike", offsetX: 52, offsetY: canvas.height-104, rotation: 180},
    { type: "spike", offsetX: 104, offsetY: canvas.height-104, rotation: 180},
    { type: "block", offsetX: 104, offsetY: canvas.height-156-104, height: 50 },
    { type: "spike", offsetX: 208, offsetY: canvas.height-104, rotation: 180,lastPiece:true},
  ],
  8:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "spike", offsetX: 52, offsetY: canvas.height-104, rotation: 180},
    { type: "spike", offsetX: 104, offsetY: canvas.height-104, rotation: 180},
    { type: "spike", offsetX: 156, offsetY: canvas.height-104, rotation: 180},
    { type: "block", offsetX: 104, offsetY: canvas.height-156-104, rotation: 180},
    { type: "block", offsetX: 200, offsetY: canvas.height-260-104, rotation: 180,lastPiece:true},
  ],
  9:[
      { type: "spike", offsetX: 0, offsetY: canvas.height-104, rotation: 180},
      { type: "block", offsetX: 52, offsetY: canvas.height-156, height:50},
      { type: "block", offsetX: 156+40, offsetY: canvas.height-104-52-52, height:50},
      { type: "spike", offsetX: 156+40, offsetY: canvas.height-104-52-52, rotation:180},
      { type: "spike", offsetX: 260+40, offsetY: canvas.height-104, rotation:180},
      { type: "block", offsetX: 364+60, offsetY: canvas.height-104-52-52, height:50},
      { type: "spike", offsetX: 364+60, offsetY: canvas.height-104-52-52, rotation:180},
  ],
  10:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "circle", offsetX: 0, offsetY: canvas.height-52-104-20-30 },
    { type: "bomb", offsetX: 208, offsetY: canvas.height-30-104,angle:225 },
    { type: "bomb", offsetX: 208, offsetY: canvas.height-30-104-208,angle:225 },
  ],
  11:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "bomb", offsetX: 65, offsetY: canvas.height-30-104,angle:225 },
    { type: "block", offsetX: 65, offsetY: canvas.height-156-104, height: 50 },
    { type: "block", offsetX: 125, offsetY: canvas.height-52-104, height: 50 },
    { type: "bomb", offsetX: 125, offsetY: canvas.height-104+22-104,angle:225 },
    { type: "bomb", offsetX: 185, offsetY: canvas.height-30-104,angle:225 },
    { type: "block", offsetX: 185, offsetY: canvas.height-156-104, height: 50 },
    { type: "block", offsetX: 245, offsetY: canvas.height-52-104, height: 50 },
    { type: "bomb", offsetX: 305, offsetY: canvas.height-30-104,angle:225,lastPiece:true },
  ],
  12:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "bomb", offsetX: 60, offsetY: canvas.height-30-104,angle:225 },
    { type: "block", offsetX: 120, offsetY: canvas.height-52-104, height: 50 },
    { type: "block", offsetX: 120, offsetY: canvas.height-156-104, height: 50 },
    { type: "bomb", offsetX: 180, offsetY: canvas.height-30-104,angle:225 },
    { type: "block", offsetX: 240, offsetY: canvas.height-52-104, height: 50,lastPiece:true },
  ],
  13:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "block", offsetX: 104, offsetY: canvas.height-156-104, height: 50 },
    { type: "bomb", offsetX: 260, offsetY: canvas.height-30-104, angle:225},
    { type: "bomb", offsetX: 260, offsetY: canvas.height-280-104, angle:225,lastPiece:true},
  ],
  14:[
    { type: "block", offsetX: 0, offsetY: canvas.height-52-104, height: 50 },
    { type: "bomb", offsetX: 60, offsetY: canvas.height-30-104, angle:225},
    { type: "block", offsetX: 120, offsetY: canvas.height-52-104-80, height: 50 },
    { type: "block", offsetX: 240, offsetY: canvas.height-52-104-80, height: 50 },
    { type: "bomb", offsetX: 160, offsetY: canvas.height-30-104-80-156, angle:225},
  ],
}
function spawnPiece(pieceName, startX) {
  if(!bossing){
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
      }else if (obj.type === "circlep") { 
        circlesP.push(new CircleP({
          position: { x: startX + obj.offsetX, y: ground.position.y - obj.offsetY },
          lastPiece: obj.lastPiece || false
        }));
      }
    }
  }else{
    const piece = jesterlevels[pieceName];
    bossspawns+=1
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
      }else if (obj.type === "circlep") { 
        circlesP.push(new CircleP({
          position: { x: startX + obj.offsetX, y: ground.position.y - obj.offsetY },
          lastPiece: obj.lastPiece || false
        }));
      }
      else if (obj.type === "bomb") { 
        bombs.push(new Dynamite({
          position: { x: startX + obj.offsetX, y: ground.position.y - obj.offsetY },
          angle:obj.angle,
          lastPiece: obj.lastPiece || false
        }));
      }
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
let circlesP = [];
let bombs = [];
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
  if(spikeghost) return false
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
  lastspawn=0
}

function rectRectCollision(player, block) {
  if (ghostActive) return;
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
      // VERTICAL COLLISION
      if (player.velocity.y > 0) { // Player is falling DOWN
        player.position.y -= overlapY;
        player.velocity.y = 0;
        // Only allow jump if gravity is normal (1)
        if (gravDir === 1) onSomething = true; 
        
      } else if (player.velocity.y < 0) { // Player is falling UP
        player.position.y += overlapY;
        player.velocity.y = 0;
        // Only allow jump if gravity is inverted (-1)
        if (gravDir === -1) onSomething = true; 
      }
    } else {
      // HORIZONTAL COLLISION (Walls)
      if (player.position.x < block.position.x) player.position.x -= overlapX;
      else player.position.x += overlapX;
      
      // Notice we DO NOT set onSomething = true here!
      // This completely removes the wall-jumping bug.
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
  lastboss = 0
  gravDir = 1
  isbossdip = false
  isbosspink = false
  isBossRed = false
  isBossNewAnim = false
  bossing =false
  lastspawn = 0
  bossFrameIndex = 0;
  spiketimer = 0
  frameTimer = 0;
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
  circlesP = []
  bombs = []
  rageActive = false
  ghostActive = false;
  spikeghost = false
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
  spawnTimer = 0;

  lastTime = performance.now();
  animate(lastTime);
}


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
  drawBoss(context, delta);
  ground.draw();
  
  player.update(delta); 
  screenFlash.update();
  screenFlash.draw(context);
  screenblue.update();
  screenblue.draw(context);
  screenpink.update()
  screenpink.draw(context)
  //score
  let fontSize = window.innerWidth < 600 ? 50 : 25; 
  context.font = `bold ${fontSize}px sans-serif`;
  context.fillStyle = "white";
  context.textAlign = "left"; 

  context.fillText(`Score: ${score}`, 20, fontSize + 10);
  player.velocity.y += 0.8 * delta*gravDir;
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
  lastspawn += delta*ragespeed*speedBoost;
  if((lastspawn>=140 && !bossing && last!=28 )|| (lastspawn>=180&&bossFrameIndex>=41) || (lastspawn>=300 && !bossing && last==28 )){
    console.log('spawning')
    if(bossFrameIndex==41 &&isBossRed){
      x = Math.floor(Math.random()*5)
      lastspawn = 0
      spawncount+=1
      console.log('dyna')
      spawnPiece(x, canvas.width + 30);
    }else if(bossFrameIndex==119&&isBossNewAnim){
      x = Math.floor(Math.random()*5)+5
      lastspawn = 0
      spawncount+=1
      console.log('grav')
      spawnPiece(x, canvas.width + 30);
    }else if(bossFrameIndex==57 && isbosspink){
      x = Math.floor(Math.random()*5)+10
      lastspawn = 0
      spawncount+=1
      spawnPiece(x, canvas.width + 30);
    }
    else{
      console.log('normal')
      secondlastspawn+=1
      x = Math.floor(Math.random()*32)
      if(!bossing){
        while(x == last || (last==8 && x==15) ||(last==15 && x==8) ){
          console.log('2nd PIECEEEEEEEEEEEE')
          x = Math.floor(Math.random()*levelPieces.length)
        }
      }
      if((last==8 && !bossing && x==13)||(last==15 && !bossing && x==13)){
        secondlastspawn = -60
      }
      last = x
      if(secondlastspawn>=0){
        lastspawn = 0
        spawnPiece(x, canvas.width + 30);
      }
    }
    
    
  }
   if (!musicStarted) {
    musicStarted = true;
    bgm.setVolume(0.1);
    bgm.play();
    
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
    block.update(delta, speedBoost);
    
    // FIX: Just call the collision check. 
    // Do NOT set onSomething = true here anymore!
    rectRectCollision(player, block); 
    
    if (block.position.x + block.size / 2 < 0 && block.lastPiece){
      blocks.splice(i, 1);
      score += 1;
      if ((score - lastboss) >= 10) {
        bossing = true;
        lastboss = score + 9;
        summonBoss();
        bossspawns = 0;
      }
    } 
    else if (block.position.x + block.size / 2 < 0) {
      blocks.splice(i, 1);
    }
  }
}
  if(bossing && bossFrameIndex==22 &&blocks.length+spikes.length+circles.length+circlesB.length+circlesW.length+bombs.length+circlesP.length==0){
    redattack()
  }
  if(bossing && isBossRed && bossspawns==4){
    blueattack()
  }if(bossing && isBossNewAnim && bossspawns==7){
    pinkattack()
  }
  if(bossing && isbosspink && bossspawns==10){
    bossrun()
  }
  //circle loop
  if (!isGameOver) {
    for (let i = circles.length - 1; i >= 0; i--) {
      const circle = circles[i];
      circle.update(delta,speedBoost);

      if (rectCircleCollision(player, circle)) {
        
        audioFiles.shield.currentTime = 0.6;
        audioFiles.shield.play()
        if(gravDir==1)player.velocity.y = -20; // ~1.5x normal jump
        else player.velocity.y = 6
        spikeghost = true;
         spiketimer = 120;
          
          //Set Ghost Appearance
          playerColor = 'yellow';
          playerShadowColor = 'lightyellow';
          playerStroke = 'darkyellow';
        speedBoost = 3; // global multiplier
        speedBoostTimer = 60; // lasts 1 second at 60fps
        updateSpawnInterval()
        // Remove circle
        circles.splice(i, 1);
        
      }
      if ((circle.position.x + 20)/ 2 < 0 && circle.lastPiece==true){
        circles.splice(i, 1);
        score+=1
        if((score-lastboss)>=10){
          bossing = true
          summonBoss();
          lastboss = score+11+8
        }
        console.log('circle spliced and point added')
      } 
      else if ((circle.position.x + 20) / 2 < 0){
        console.log('circle spliced')
        circles.splice(i, 1);
      }
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
  //circles Purple AKA gravity circles
  if (!isGameOver) {
    for (let i = circlesP.length - 1; i >= 0; i--) {
      const circle = circlesP[i];
      circle.update(delta, speedBoost);

      if (rectCircleCollision(player, circle) && !ghostActive) {
        // toggle
        audioFiles.warp.currentTime = 0; 
        audioFiles.warp.playbackRate = 2.0; 
        audioFiles.warp.play().catch(e => console.error("Collect audio failed:", e));
        toggleGravity()
        
        circlesP.splice(i, 1);
      }

      if (circle.position.x + circle.radius < 0) circlesW.splice(i, 1);
    }
  }
  //bombs/dynamite
  if (!isGameOver) {
    for (let i = bombs.length - 1; i >= 0; i--) {
      const bomb = bombs[i];
      bomb.update(delta, speedBoost);

      if (rectRectCollision(player, bomb)) {
       if (player.visible) {
              if (allowFlashes && typeof screenFlash !== "undefined") {
                screenFlash.trigger();
              }
              spawnParticles(player.position.x, player.position.y, playerColor);
              player.visible = false; // Hide player
              isGameOver = true; // Set flag to stop next frame
              audioFiles.dyna.currentTime = 0; 
              audioFiles.dyna.play().catch(e => console.error("Jump audio failed:", e));
          }

        updateSpawnInterval()
        
        bombs.splice(i, 1);
      }

      if (bomb.position.x + bomb.radius < 0) bombs.splice(i, 1);
    }
  }
  //border
  if(player.position.x<52/2){
    if (player.visible) {
              if (allowFlashes && typeof screenFlash !== "undefined") {
                screenFlash.trigger();
              }
              spawnParticles(player.position.x, player.position.y, playerColor);
              player.visible = false; // Hide player
              isGameOver = true; // Set flag to stop next frame
              
              audioFiles.death.currentTime = 0; 
              audioFiles.death.play().catch(e => console.error("Jump audio failed:", e));
          } 
  }
  //ground
  if (gravDir === 1 && player.position.y + player.size / 2 >= ground.position.y&& player.velocity.y!=-20) {
  player.position.y = ground.position.y - player.size / 2;
  player.velocity.y = 0;
  onSomething = true; // Gets jump back on the floor
}

// 2. FLIPPED GRAVITY (Hitting the ceiling)
if (gravDir === -1 && player.position.y - player.size / 2 <= 0&& player.velocity.y!=-20) {
  player.position.y = player.size / 2;
  player.velocity.y = 0;
  onSomething = true; // Gets jump back on the ceiling
}

// 3. (Optional) Head-bonking the ceiling during normal gravity
if (gravDir === 1 && player.position.y - player.size / 2 <= 0) {
  player.position.y = player.size / 2;
}
  // Jump
  if (keys.space.pressed && onSomething){
  player.velocity.y = -14 * gravDir; 
  onSomething = false;
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
              if (allowFlashes && typeof screenFlash !== "undefined") {
                screenFlash.trigger();
              }
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
        if((score-lastboss)>=10){
          bossing = true
          summonBoss();
          lastboss = score+3
        }
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
  }
  if (ghostTimer > 0) {
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
    }

    if (spiketimer > 0) {
        console.log('fading')
        spiketimer -= 1 * delta; // Use delta for time-compensated timer
        
        const timeRemaining = spiketimer / delta; // Time remaining in frames (approx. 60 FPS)

        if (timeRemaining <= 60 && timeRemaining > 0) {
            // --- 1. Flicker (Frames 60 down to 30) ---
            if (timeRemaining > 30 && (timeRemaining > 50 || (timeRemaining <= 40 && timeRemaining > 30))) {
                const isVisible = (Math.floor(timeRemaining) % 10) < 5; // Toggles every 5 frames
                playerColor = isVisible ? "yellow" : OG_PLAYER_COLOR;
            } 
            else if (timeRemaining <= 30) {
                // Calculate the fade factor (0 at 30 frames, 1 at 0 frames)
                const fadeFactor = (30 - timeRemaining) / 30; 
            
                  // Starts at 255, fades to 173
                  const r = Math.round(255 + (173 - 255) * fadeFactor);
                  // Starts at 255, fades to 17
                  const g = Math.round(255 + (17 - 255) * fadeFactor);
                  // Starts at 0, fades to 221
                  const b = Math.round(0 + (221 - 0) * fadeFactor);
                  // Starts at 0.3, fades to 1.0
                  const a = (0.3 + (1.0 - 0.3) * fadeFactor).toFixed(2);
                              
                  playerColor = `rgba(${r}, ${g}, ${b}, ${a})`;
            }
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
if (spiketimer <= 0 && spikeghost) { // Check ghostActive to run this block only once
        // --- GHOST MODE END ---
        spikeghost = false;
        
        // Reset colors to final, opaque, non-ghost state
        playerColor = OG_PLAYER_COLOR; 
        playerStroke = 'white';
        playerShadowColor = 'transparent';
        
        // Play the exit/transform sound
        audioFiles.collect3.currentTime = 0; 
        audioFiles.collect3.play().catch(e => console.error("Exit Ghost Mode audio failed:", e));

        // Check for immediate collision (optional, but good practice)
        for (const block of blocks) {
            rectRectCollision(player, block);
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
