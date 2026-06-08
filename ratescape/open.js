const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

canvas.width = 1528;
canvas.height = 698;

const bgcolor = "black";
const blocksize = 36;
const pacmanspeed = 2;
const mouseImg = new Image(); 
mouseImg.src = "slamdown-removebg-preview.png"; 

let state = 'intro'; 
// Fix: 'this' is not valid in global space, using 0 fallback for initialization
let lastshiftx = Math.cos(0) * (50 * 0.2);
let lastshifty = Math.sin(0) * (50 * 0.2);
async function initSDK() {
    try {
        await window.CrazyGames.SDK.init();
        console.log("CrazyGames SDK initialized");
    } catch (e) {
        console.log("SDK init failed or running outside CrazyGames");
    }
}

initSDK();





// Grab the overlay screen element
const startScreen = document.getElementById('start-screen');

if (startScreen) {
    startScreen.addEventListener('click', () => {
        // 1. Permanently hide the start screen overlay
        startScreen.style.display = 'none';
        
        // 2. Safely ping CrazyGames that the user is starting the application context
        try {
            if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
                window.CrazyGames.SDK.game.gameplayStart();
                console.log("CrazyGames SDK: Automatic validation check passed.");
            }
        } catch (error) {
            console.warn("CrazyGames SDK not fully initialized or running locally:", error);
        }

        // 3. Kick off your transition logic!
        window.currentGameState = 'INTRO';
        startmusic.muted = isPlatformMuted();
        startmusic.play().catch(e => console.log('press to start'));
        // If your audio assets were waiting for user permission, trigger them here!
        // playIntroMusic();
        id123 = requestAnimationFrame(animate);
    });
}











class ghost {
    constructor({ name='blinky', position, velocity, color = 'yellow', color2 ='orange', color3 ='black', color4 = 'white', color5 ='#FFE066', color6 = '#ffd61d', color7 = 'orange' }) {
        this.position = position;
        this.velocity = velocity;
        this.name = name;
        this.radius = 50; 
        this.color = color;
        this.tailFrame = 0;
        this.angle = 0;
        this.color2 = color2;
        this.color3 = color3;
        this.color4 = color4;
        this.color5 = color5;
        this.color6 = color6;
        this.color7 = color7;
        this.scared = false;
    }

    draw() {
        context.save();
        context.translate(this.position.x, this.position.y);

        if (this.velocity.x > 0) this.angle = Math.PI;
        else if (this.velocity.x < 0) this.angle = 0;
        else if (this.velocity.y > 0) this.angle = Math.PI / 2;
        else if (this.velocity.y < 0) this.angle = -Math.PI / 2;

        context.scale(-1, 1);

        const r = this.radius;
        let shiftX = lastshiftx;
        let shiftY = lastshifty;
        if(state!='start'){
            shiftX = Math.cos(this.angle) * (r * 0.2);
            shiftY = Math.sin(this.angle) * (r * 0.2);
        }
        lastshiftx = shiftX;
        lastshifty = shiftY;
        if(state!=='start')this.tailFrame += 0.05;
        const frame = Math.floor(this.tailFrame % 5);
        
        context.save();
        context.rotate(this.angle + Math.PI); 
        context.beginPath();
        context.strokeStyle = this.color2;
        context.lineWidth = r * 0.2; 
        context.lineCap = "round";
        context.moveTo(r * 0.8, 0); 

        if (frame === 0) context.bezierCurveTo(r * 1.4, -r * 0.6, r * 2.0,  r * 0.8, r * 2.5, 0);
        if (frame === 1) context.bezierCurveTo(r * 1.4, -r * 0.4, r * 1.8,  r * 0.6, r * 2.2, r * 0.2);
        if (frame === 2) context.bezierCurveTo(r * 1.4, 0,        r * 1.6,  0,        r * 2.0, 0);
        if (frame === 3) context.bezierCurveTo(r * 1.4,  r * 0.4, r * 1.8, -r * 0.6, r * 2.2, -r * 0.2);
        if (frame === 4) context.bezierCurveTo(r * 1.4,  r * 0.6, r * 2.0, -r * 0.8, r * 2.5, 0);
        context.stroke();
        context.restore();

        context.fillStyle = this.color7; 
        context.beginPath();
        context.moveTo(-r * 0.9, -r * 0.2);
        context.lineTo(-r * 0.8, -r * 1.6); 
        context.lineTo(-r * 0.1, -r * 0.8);
        context.fill();

        context.beginPath();
        context.moveTo(r * 0.9, -r * 0.2);
        context.lineTo(r * 0.8, -r * 1.6); 
        context.lineTo(r * 0.1, -r * 0.8);
        context.fill();

        context.fillStyle = this.color6; 
        context.beginPath();
        context.moveTo(-r * 0.75, -r * 0.4);  
        context.lineTo(-r * 0.75, -r * 1.3);  
        context.lineTo(-r * 0.25, -r * 0.75);  
        context.fill();

        context.beginPath();
        context.moveTo(r * 0.75, -r * 0.4);   
        context.lineTo(r * 0.75, -r * 1.3);    
        context.lineTo(r * 0.25, -r * 0.75);   
        context.fill();

        if (this.scared) {
            context.fillStyle = this.color;
            context.beginPath();
            const numSpikes = 12;
            const outerRadius = r * 1.8;
            const innerRadius = r * 1.2;
            const vScale = 0.6; 

            for (let i = 0; i < numSpikes; i++) {
                const angle = (i / numSpikes) * Math.PI * 2;
                context.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius * vScale);
                const innerAngleOffset = 0.15;
                context.lineTo(Math.cos(angle + innerAngleOffset) * innerRadius, Math.sin(angle + innerAngleOffset) * innerRadius * vScale);
            }
            context.closePath();
            context.fill();
            
            context.fillStyle = this.color4;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.35, r * 0.45, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.35, r * 0.45, 0, 0, Math.PI * 2);
            context.fill();
            
            context.fillStyle = this.color3;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = this.color2;
            context.lineWidth = r * 0.12;
            context.beginPath();
            context.arc(shiftX, r * 0.8 + shiftY, r * 0.35, Math.PI * 1.2, Math.PI * 1.8);
            context.stroke();
        } else {
            context.beginPath();
            context.arc(0, 0, r, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();

            context.beginPath();
            context.arc(shiftX, (r * 0.4) + shiftY, r * 0.55, 0, Math.PI * 2);
            context.fillStyle = this.color5;
            context.fill();
            
            context.fillStyle = this.color4;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
            context.fill();
            
            context.fillStyle = this.color3;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
            context.fill();
            
            context.strokeStyle = this.color2;
            context.lineWidth = r * 0.1;
            context.beginPath();
            context.arc(-r * 0.15 + shiftX, r * 0.5 + shiftY, r * 0.15, 0, Math.PI); 
            context.stroke();
            context.beginPath();
            context.arc(r * 0.15 + shiftX, r * 0.5 + shiftY, r * 0.15, 0, Math.PI);  
            context.stroke();
        }
        
        context.fillStyle = this.color2;
        context.beginPath();
        context.ellipse(shiftX, r * 0.35 + shiftY, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class texteff{
    constructor(x,y,size,height,opacity,text){
        this.size = size
        this.height = height
        this.x = x
        this.y = y
        this.opacity = opacity
        this.text = text
    }
    draw(){
        context.save();
        context.globalAlpha = this.opacity;
        context.fillStyle = "white";
        context.font = "35px Anton";
        context.fillText(this.text, this.x, this.y);
        context.restore();
    }
}
class texteff2{
    constructor(x,y,size,height,opacity,text){
        this.size = size
        this.height = height
        this.x = x
        this.y = y
        this.opacity = opacity
        this.text = text
    }
    draw(){
        context.save();
        context.globalAlpha = this.opacity;
        context.fillStyle = "white";
        context.font = "100px Anton";
        context.fillText(this.text, this.x, this.y);
        context.restore();
    }
}
class texteff3{
    constructor(x,y,size,height,opacity,text){
        this.size = size
        this.height = height
        this.x = x
        this.y = y
        this.opacity = opacity
        this.text = text
    }
    draw(){
        context.save();
        context.globalAlpha = this.opacity;
        context.fillStyle = "white";
        context.font = "80px Tiny5";
        context.fillText(this.text, this.x, this.y);
        context.restore();
    }
}

class pacMan {
    constructor({ position, velocity, radius, angle = 0 }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius; 
        this.angle = angle;
        this.frame = 0;
        this.tailFrame = 0;
    }
    draw() {
        const r = this.radius;

        if (state !== 'payback' && state!=='start' && state!='begin') {
            context.save();
            context.translate(this.position.x, this.position.y);

            if (this.velocity.x > 0) this.angle = Math.PI;
            else if (this.velocity.x < 0) this.angle = 0;
            else if (this.velocity.y > 0) this.angle = Math.PI / 2;
            else if (this.velocity.y < 0) this.angle = -Math.PI / 2;
            
            context.rotate(this.angle);
            context.scale(-1, 1);

            this.tailFrame += 0.12; 
            const frame = Math.floor(this.tailFrame % 5);

            context.beginPath();
            context.strokeStyle = "#888"; 
            context.lineWidth = r * 0.23; 
            context.moveTo(-r + (r * 0.1), 0); 

            if (frame === 0) context.bezierCurveTo(-r - (r*0.3), -r * 1.1, -r - (r*1.7),  r * 1.7, -r - (r*2.0), 0);
            if (frame === 1) context.bezierCurveTo(-r - (r*0.3), -r * 0.6, -r - (r*1.7),  r * 1.1, -r - (r*2.0), r * 0.3);
            if (frame === 2) context.bezierCurveTo(-r - (r*0.3), 0,        -r - (r*1.7),  0,        -r - (r*2.0), 0);
            if (frame === 3) context.bezierCurveTo(-r - (r*0.3),  r * 0.6, -r - (r*1.7), -r * 1.1, -r - (r*2.0), -r * 0.3);
            if (frame === 4) context.bezierCurveTo(-r - (r*0.3),  r * 1.1, -r - (r*1.7), -r * 1.7, -r - (r*2.0), 0);
            context.stroke();

            const earSize = r * 0.7; 

            context.beginPath();
            context.arc(-r * 0.8, -r * 0.7, earSize, 0, Math.PI * 2);
            context.fillStyle = "grey";
            context.fill();
            context.beginPath();
            context.arc(-r * 0.8, -r * 0.7, earSize * 0.6, 0, Math.PI * 2);
            context.fillStyle = "#ff99cc"; 
            context.fill();

            context.beginPath();
            context.arc(-r * 0.8, r * 0.7, earSize, 0, Math.PI * 2);
            context.fillStyle = "grey";
            context.fill();
            context.beginPath();
            context.arc(-r * 0.8, r * 0.7, earSize * 0.6, 0, Math.PI * 2);
            context.fillStyle = "#ff99cc";
            context.fill();

            context.beginPath();
            context.arc(0, 0, r, 0, Math.PI * 2);
            context.fillStyle = "grey";
            context.fill();

            context.fillStyle = "white";
            context.beginPath();
            context.arc(r * 0.3, -r * 0.3, r * 0.3, 0, Math.PI * 2); 
            context.arc(r * 0.3,  r * 0.3, r * 0.3, 0, Math.PI * 2); 
            context.fill();
            
            context.fillStyle = "black";
            context.beginPath();
            context.arc(r * 0.35, -r * 0.3, r * 0.12, 0, Math.PI * 2);
            context.arc(r * 0.35,  r * 0.3, r * 0.12, 0, Math.PI * 2);
            context.fill();

            context.fillStyle = "#ff99cc";
            context.beginPath();
            context.arc(r * 0.8, 0, r * 0.23, 0, Math.PI * 2);
            context.fill();

            context.restore();
        } else {
            context.drawImage(
                mouseImg, 
                this.position.x - r, 
                this.position.y - r, 
                500, 
                500
            );
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const controller = new AbortController();
let startmusic = new Audio('startmusic.mp3');
let camerashutter = new Audio('camerashutter.mp3');
let click = new Audio('clcik.mp3');
startmusic.volume = 0.8;
camerashutter.volume = 0.9;
click.currentTime = 1;

const player = new pacMan({
    position: { x: canvas.width / 2, y: canvas.height - 60 },
    velocity: { x: 0, y: 0 },
    radius: 40, 
});

const title = new texteff2(canvas.width-550,canvas.height/3,2000,400,0,'Rat Escape');
const play = new texteff3(canvas.width-370,canvas.height/3+100,2000,400,0,'‣START');

// Group intro sounds so they can be muted externally by the gameplay manager
window.introSounds = [startmusic, camerashutter, click];

// Helper to safely check if CrazyGames is currently muted
function isPlatformMuted() {
    // 1. Check if the root SDK object exists
    if (!window.CrazyGames?.SDK) {
        return false;
    }

    // 2. Wrap the .game or .settings access in a try/catch block 
    // to absorb errors if the SDK isn't fully ready yet.
    try {
        return window.CrazyGames.SDK.game?.settings?.muteAudio || false;
    } catch (e) {
        // If the SDK screams "Not initialized yet!", catch it silently 
        // and assume the game isn't muted.
        return false;
    }
}
function handler(event){
    if(state != 'start') return;
    
        
        console.log("Start text clicked! Initiating game...");
        startmusic.pause();
        
        // FIX: Verify platform mute configuration before click execution
        click.muted = isPlatformMuted();
        click.play();
        
        state = 'instructions';
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log(e))
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari support */
            document.documentElement.webkitRequestFullscreen()
        }

}

canvas.addEventListener('click', handler);


const red = new ghost({
    position: {
        x: canvas.width - blocksize * 5, 
        y: canvas.height -60
    },
    velocity: { x: 0, y: 0 },
    name: 'blinky',
});

let id123;
let laststate = 'intro';
let cameraEffectTimer = 0;
let fadeToBlackOpacity = 0; 
let fadeToBlackOpacity2 = 0;
let instructiontimer = 0
let lastTime1 = 0;
let accumulator1 = 0;
let fps1 = 60;
let targetFPS1 = 1000/fps1;
let instruction = new Image()
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile) {
    instruction.src = 'instructionPHONE.png'; 
} else {
    // Load your standard keyboard layout image
    instruction.src = 'instruction.png'; 
}

function animate(currentTime1) {
    if(window.currentGameState!='INTRO')return
    if (!lastTime1) {
        lastTime1 = currentTime1;
        id123 = requestAnimationFrame(animate);
        return;
    }
    
    let deltaTime1 = currentTime1 - lastTime1;
    if(deltaTime1 > 250) deltaTime1 = 250;
    lastTime1 = currentTime1;
    accumulator1 += deltaTime1;
    
    // --- PHYSICS & GAME LOGIC STEP (Runs inside fixed steps) ---
    while (accumulator1 >= targetFPS1) {
        accumulator1 -= targetFPS1;
        
        if (cameraEffectTimer > 0) {
            cameraEffectTimer -= 3;
        }
        if (cameraEffectTimer < 0) {
            cameraEffectTimer = 0;
        }
        
        player.update();
        red.update();
        
        if(red.position.x > -200 && state == 'intro'){
            player.velocity.x = -5;
            red.velocity.x = -5;
        } else if(state != 'start' && state != 'begin' && state!='instructions'){
            state = 'payback';
            red.scared = true;
            red.velocity.x = 9;
            player.velocity.x = 10;
            player.velocity.y = 5;
        }
        
        if(state != laststate && state == 'payback'){
            camerashutter.currentTime = 0.5;
            camerashutter.muted = isPlatformMuted();
            camerashutter.play();
            player.position.y = -290;
            player.position.x = -600;
        }
        
        if(state == 'payback' && red.position.x >= canvas.width / 3){
            player.velocity.x = 0;
            player.velocity.y = 0;
            red.velocity.y = 0;
            red.velocity.x = 0;
            state = 'start';
            cameraEffectTimer = 13;
        }
        
        if(state == 'start'){
            play.opacity += 0.01;
            title.opacity += 0.01;
        }
        
        laststate = state;
        if(state=='instructions'){
            fadeToBlackOpacity2+=0.05;
            if(fadeToBlackOpacity2>1)fadeToBlackOpacity2 =1
        }
        if (state === 'begin') {
            fadeToBlackOpacity += 0.05; 
            if (fadeToBlackOpacity > 1) fadeToBlackOpacity = 1; 
        }
    }
    
    // --- RENDER GRAPHICS STEP (Runs once per screen refresh) ---
    context.save(); // Protect the main canvas matrix configuration

    if (cameraEffectTimer > 0) {
        context.translate(-20, -12);
        context.globalAlpha = 1 / (cameraEffectTimer / 4); 
        context.scale(1.02, 1.02); 
    } else {
        context.globalAlpha = 1;
    }

    context.fillStyle = bgcolor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    

    title.draw();
    play.draw();
    player.draw();
    red.draw();

    if (fadeToBlackOpacity2 > 0) {
        context.fillStyle = `rgba(0, 0, 0, 1)`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = fadeToBlackOpacity2
        context.drawImage(instruction, 0, 0, canvas.width, canvas.height);
        instructiontimer+=1
    }
    if(instructiontimer>220){
        state = 'begin'
    }
    if (fadeToBlackOpacity > 0) {
        context.fillStyle = `rgba(0, 0, 0, ${fadeToBlackOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // --- LOOP HANDOFF CONDITION ---
    if (fadeToBlackOpacity >= 1) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        cancelAnimationFrame(id123);
        canvas.removeEventListener('click', handler); 
        window.currentGameState = 'game';
        return; 
    }
    
    id123 = requestAnimationFrame(animate);
}

// Start the intro loop
