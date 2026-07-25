import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC-8_Ys-j18qWZU484P7NJMWDxs8aMc-K0",
    authDomain: "ratchase-pacman.firebaseapp.com",
    projectId: "ratchase-pacman",
    storageBucket: "ratchase-pacman.firebasestorage.app",
    messagingSenderId: "619931203243",
    appId: "1:619931203243:web:a97e7fb96e595fb40a69ee",
    measurementId: "G-N9P4VF36MW"
};

const app = initializeApp(firebaseConfig);
let db = getFirestore(app)
const analytics = getAnalytics(app);



//CRAZY GAMES STUFF
window.setGameMute = function(shouldMute) {
    // 1. Check if your background music exists, then mute/unmute it
    if (typeof curaudio !== 'undefined' && curaudio) {
        curaudio.muted = shouldMute;
    }
    
    // 2. Check if your skin shop music exists, then mute/unmute it
    if (typeof skinmusic !== 'undefined' && skinmusic) {
        skinmusic.muted = shouldMute;
    }

    // 3. Keep the intro screen sounds muted if they are lingering
    if (window.introSounds && Array.isArray(window.introSounds)) {
        window.introSounds.forEach(sound => {
            if (sound) sound.muted = shouldMute;
        });
    }
};

// This loop safely waits in the background until CrazyGames is ready.
// Once ready, it checks if the player already muted the site.
function initCrazyGamesSDK() {
    if (window.CrazyGames && window.CrazyGames.SDK) {
        const crazySDK = window.CrazyGames.SDK;

        try {
            // Check if the user loaded the page with mute already turned on
            const initialMute = crazySDK.game?.settings?.muteAudio || false;
            window.setGameMute(initialMute);

            // Listen for if they click the mute button while playing
            crazySDK.game.addSettingsChangeListener((newSettings) => {
                if (newSettings && newSettings.hasOwnProperty('muteAudio')) {
                    window.setGameMute(newSettings.muteAudio);
                }
            });
            
            console.log("CrazyGames Audio successfully connected!");
        } catch (error) {
            // SDK is still loading up, try again in a split second
            setTimeout(initCrazyGamesSDK, 100);
        }
    } else {
        // SDK script isn't on the page yet, try again in a split second
        setTimeout(initCrazyGamesSDK, 100);
    }
}
initCrazyGamesSDK();
let skin = 'base'
let paused = false
let gamestate = 'normal'
const canvas = document.getElementById("gameCanvas")
const context = canvas.getContext("2d")
var bgcolor = "black"
let justteleported = false
let mute = false
canvas.width = 1528
let texts = []
canvas.height = 698
let isnextleveling = false
console.log(canvas.width,canvas.height)
let score = 0
let steroidsarr = []
let steroids2arr = []
let wallsarr = []
let boundaries = []
let holesarr = []
let extra = 0
let pacmanspeed = 1+extra
let currentLevel = 1
let playerLives = 3
let blocksize = 36
console.log((canvas.width/4*3)/2-blocksize*4.5)
console.log(blocksize/2)
let grid = []
const maps = {
    //0 = hall, 1 = wall, 3 = portal, 4 = big orb, 5 = ghost chamber, 9 = special bounds
    0:["9999999999999999999999999999999".split(""),
       "9000000000015555555510000000009".split(""),
       "9011111111011115111110111111109".split(""),
       "9014000000000000000000000000109".split(""),
       "9010101111111110111111111010109".split(""),
       "9010101000000000100000041010109".split(""),
       "9000101011111010101111101010009".split(""),
       "9010101000000010101000101010109".split(""),
       "9010101011111010001010101010109".split(""),
       "3010000000001010100010101010103".split(""),
       "9010101011101010101010101010109".split(""),
       "9010101011101010101010101010109".split(""),
       "9000101011101010000010101010009".split(""),
       "9010101000041010101010101010109".split(""),
       "9010101111111010101010101010109".split(""),
       "9010000000000000000000000004109".split(""),
       "9011110111111110111111110111109".split(""),
       "9400000000000000000000000000009".split(""),
       "9999999999999999999999999999999".split("")],
    1:[
    "9999999999999999999999999999999".split(""),
    "9000000000000000000000000000009".split(""),
    "9011110111110110110111110111109".split(""),
    "9014000000000000000000000000109".split(""),
    "9010101011111110111111101010109".split(""),
    "9000101011400110110001101010009".split(""),
    "9010100011010000111411101010109".split(""),
    "9010101011000110110001101010109".split(""),
    "9010101011111110110101100010109".split(""),
    "3010101010000000000000101010103".split(""),
    "9010101010111115111110101010109".split(""),
    "9010100010155555555510100010109".split(""),
    "9010101010111111111110101010109".split(""),
    "9000101000000000000000001010109".split(""),
    "9010101111110101110111111010009".split(""),
    "9010100000000104010000000010109".split(""),
    "9010111011110111010111101110109".split(""),
    "9000000000000000000000000000049".split(""),
    "9999999999999999999999999999999".split("")
    ],
}
const maps2 = {
    0:["1111111111111111111111111111111".split(""),
       "1000000000010000000010000000001".split(""),
       "1011111111011110111110111111101".split(""),
       "1010000000000000000000000000101".split(""),
       "1010101111111110111111111010101".split(""),
       "1010101000000000100000001010101".split(""),
       "1000101011111010101111101010001".split(""),
       "1010101000000010101000101010101".split(""),
       "1010101011111010001010101010101".split(""),
       "3010000000001010100010101010103".split(""),
       "1010101011101010101010101010101".split(""),
       "1010101011101010101010101010101".split(""),
       "1000101011101010000010101010001".split(""),
       "1010101000001010101010101010101".split(""),
       "1010101111111010101010101010101".split(""),
       "1010000000000000000000000000101".split(""),
       "1011110111111110111111110111101".split(""),
       "1000000000000000000000000000001".split(""),
       "1111111111111111111111111111111".split("")],
    1:[
    "1111111111111111111111111111111".split(""),
    "1000000000000000000000000000001".split(""),
    "1011110111110110110111110111101".split(""),
    "1010000000000000000000000000101".split(""),
    "1010101011111110111111101010101".split(""),
    "1000101011000110110001101010001".split(""),
    "1010100011010000111011101010101".split(""),
    "1010101011000110110001101010101".split(""),
    "1010101011111110110101100010101".split(""),
    "0010101010000000000000101010100".split(""),
    "1010101010111110111110101010101".split(""),
    "1010100010100000000010100010101".split(""),
    "1010101010111111111110101010101".split(""),
    "1000101000000000000000001010101".split(""),
    "1010101111110101110111111010001".split(""),
    "1010100000000100010000000010101".split(""),
    "1010111011110111010111101110101".split(""),
    "1000000000000000000000000000001".split(""),
    "1111111111111111111111111111111".split("")
    ],
}
const mapKeys = Object.keys(maps)
console.log(mapKeys)
let idx = Math.floor(Math.random()*mapKeys.length)
grid = maps[idx]
let ghostgrid = JSON.parse(JSON.stringify(maps2[idx]));
let winkygrid = JSON.parse(JSON.stringify(maps2[idx]));
let darkgrid = JSON.parse(JSON.stringify(maps2[idx]));
let isResetting = false;
let blinkymode = 'scatter'
let blinkyscattercount = 0
let blinkylastmodechange = 0
let blinkyisscattering = false
let blinkylastmove = 0
let blinkyrunningtime = 0
let blinkyrunninghome = false
const blinkyhome = { 0:[12,1], 1:[11,11]}
let blinkytimer = 0


let winkymode = 'scatter'
let winkyscattercount = 0
let winkylastmodechange = 0
let winkyisscattering = false
let winkylastmove = 0
let winkyrunningtime = 0
let winkyrunninghome = false
const winkyhome = { 0:[19,1],1:[15,11]}
let winkytimer = 0

let darkmode = 'scatter'
let darkscattercount = 0
let darklastmodechange = 0
let darkisscattering = false
let darklastmove = 0
let darkrunningtime = 0
let darkrunninghome = false
const darkhome = {0:[16,1],1:[17,11]}
let darktimer = 0
let darkSpeed = 3.5
let blinkySpeed = 3.5;
let winkySpeed = 2.8;
let id
let isGameOver = false;
let toblock = {0:[]}
/**//*
    draw() {
        context.save();
        context.translate(this.position.x, this.position.y);

        context.beginPath();
        // The top dome (half circle)
        context.arc(0, 0, this.radius, Math.PI, 0);
        // The right wall going down
        context.lineTo(this.radius, this.radius);
        // The wavy bottom (3 points)
        context.lineTo(this.radius / 2, this.radius - 4);
        context.lineTo(0, this.radius);
        context.lineTo(-this.radius / 2, this.radius - 4);
        context.lineTo(-this.radius, this.radius);
        context.closePath();
        
        context.fillStyle = this.color;
        context.fill();

        context.beginPath();
        context.arc(-6, -4, 4.5, 0, Math.PI * 2); // Left eye
        context.arc(6, -4, 4.5, 0, Math.PI * 2);  // Right eye
        context.fillStyle = "white";
        context.fill();

        context.beginPath();
        context.arc(-6, -4, 2, 0, Math.PI * 2); 
        context.arc(6, -4, 2, 0, Math.PI * 2);  
        context.fillStyle = "blue";
        context.fill();

        context.restore();
    }
    */

    const PAUSE_BTN = {
        width: 240,
        height: 80,
        get x() { return (canvas.width * 0.9) - this.width / 2; },
        get y() { return this.height / 20; } // Evaluates precisely to 4px
    };

    const SKINS_BTN = {
        width: 150,
        height: 150,

        get x() { 
            const originalDrawX = (canvas.width * 0.9) - canvas.width * (250 / canvas.width) / 2;
            return originalDrawX + 100; 
        },
        get y() { 
            const originalDrawY = canvas.height * (125 / canvas.height) / 20;
            return originalDrawY + 120; 
        }
    };
class FloatingText {
    constructor({ x, y, text,color }) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.alpha = 1;        // opacity (1 = full, 0 = invisible)
        this.life = 60;        // frames (60 ≈ 1 second at 60 FPS)
        this.color = color
    }

    draw() {
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = "white";
        if(this.color)context.fillStyle = this.color
        context.font = "25px Anton";
        context.fillText(this.text, this.x, this.y);
        context.restore();
    }

    update() {
        this.life -= 1;
        this.alpha = Math.max(0, this.life / 60); 
        this.x-=0.5
        this.y-=0.5
        this.draw();
    }
}
class ghost {
    //color = head color 2 = tail,ears,nose,mouth color3 = pupils color4 = eyes, color5 = muzzle color6 = inner ears color 7 = outer ears
    constructor({ name='blinky',position, velocity, color = 'yellow',color2 ='orange',color3 ='black',color4 = 'white',color5 ='#FFE066',color6 = '#ffd61d',color7 = 'orange' }) {
        this.position = position;
        this.velocity = velocity;
        this.name = name
        this.radius = 24; // Scaled up
        this.color = color;
        this.tailFrame = 0;
        this.angle = 0;
        this.color2 = color2
        this.color3 = color3
        this.color4 = color4
        this.color5 = color5
        this.color6 = color6
        this.color7 = color7
        this.scared = false;
    }

    draw() {
        context.save();
        context.translate(this.position.x, this.position.y);

        // 1. CALCULATE ANGLE & SHIFT
        // This determines which way the cat "leans" and where the tail goes
        if (this.velocity.x > 0) this.angle = 0;
        else if (this.velocity.x < 0) this.angle = Math.PI;
        else if (this.velocity.y > 0) this.angle = Math.PI / 2;
        else if (this.velocity.y < 0) this.angle = -Math.PI / 2;

        const r = this.radius;
        const shiftX = Math.cos(this.angle) * (r * 0.2);
        const shiftY = Math.sin(this.angle) * (r * 0.2);

        // 2. THE TAIL (Now anchors to the "back" of the cat)
        this.tailFrame += 0.05;
        const frame = Math.floor(this.tailFrame % 5);
        
        context.save();
        // Rotate the tail only, so it stays opposite to movement
        context.rotate(this.angle + Math.PI); 
        context.beginPath();
        context.strokeStyle = this.color2;
        context.lineWidth = 5; // Thicker tail
        context.lineCap = "round";
        context.moveTo(r * 0.8, 0); 

        // 5-pose wiggle logic
        if (frame === 0) context.bezierCurveTo(r + 10, -15, r + 25, 20, r + 35, 0);
        if (frame === 1) context.bezierCurveTo(r + 10, -10, r + 20, 15, r + 30, 5);
        if (frame === 2) context.bezierCurveTo(r + 10, 0, r + 15, 0, r + 25, 0);
        if (frame === 3) context.bezierCurveTo(r + 10, 10, r + 20, -15, r + 30, -5);
        if (frame === 4) context.bezierCurveTo(r + 10, 15, r + 25, -20, r + 35, 0);
        context.stroke();
        context.restore();

        // 3. THE EARS (Increased size multipliers)
        context.fillStyle = this.color7; // Outer Ear Color

        // Left Outer Ear
        context.beginPath();
        context.moveTo(-r * 0.9, -r * 0.2);
        context.lineTo(-r * 0.8, -r * 1.6); 
        context.lineTo(-r * 0.1, -r * 0.8);
        context.fill();

        // Right Outer Ear
        context.beginPath();
        context.moveTo(r * 0.9, -r * 0.2);
        context.lineTo(r * 0.8, -r * 1.6); 
        context.lineTo(r * 0.1, -r * 0.8);
        context.fill();

        // --- INNER EARS ---
        context.fillStyle = this.color6; // Inner Ear Color 

        // Left Inner Ear (Tucked in)
        context.beginPath();
        context.moveTo(-r * 0.75, -r * 0.4);  
        context.lineTo(-r * 0.75, -r * 1.3);  
        context.lineTo(-r * 0.25, -r * 0.75);  
        context.fill();

        // Right Inner Ear (Tucked in)
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
            const vScale = 0.6; // Compressed vertical factor

            for (let i = 0; i < numSpikes; i++) {
                const angle = (i / numSpikes) * Math.PI * 2;
                // Squash y-coordinates ONLY
                context.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius * vScale);
                const innerAngleOffset = 0.15;
                context.lineTo(Math.cos(angle + innerAngleOffset) * innerRadius, Math.sin(angle + innerAngleOffset) * innerRadius * vScale);
            }
            context.closePath();
            context.fill();
            
            // Eyes (Vertical Ovals)
            context.fillStyle = this.color4;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.35, r * 0.45, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.35, r * 0.45, 0, 0, Math.PI * 2);
            context.fill();
            
            // Pupils
            context.fillStyle = this.color3;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = this.color2;
            context.lineWidth = 3;
            context.beginPath();
            context.arc(shiftX, r * 0.8 + shiftY, r * 0.35, Math.PI * 1.2, Math.PI * 1.8);
            context.stroke();
        }else{
            context.beginPath();
            context.arc(0, 0, r, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
            context.beginPath();
            context.arc(shiftX, (r * 0.4) + shiftY, r * 0.55, 0, Math.PI * 2);
            context.fillStyle = this.color5;
            context.fill();
            // Eyes (Vertical Ovals)
            context.fillStyle = this.color4;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
            context.fill();
            
            // Pupils
            context.fillStyle = this.color3;
            context.beginPath();
            context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
            context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
            context.fill();
            
            context.strokeStyle = this.color2;
            context.lineWidth = 2.5;
            context.beginPath();
            context.arc(-r * 0.15 + shiftX, r * 0.5 + shiftY, r * 0.15, 0, Math.PI); 
            context.stroke();
            context.beginPath();
            context.arc(r * 0.15 + shiftX, r * 0.5 + shiftY, r * 0.15, 0, Math.PI);  
            context.stroke();
        }
        

        

        // Nose & Mouth
        context.fillStyle = this.color2;
        context.beginPath();
        context.ellipse(shiftX, r * 0.35 + shiftY, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
        context.fill();


        context.restore();
    }
    draw2(){
        context.save();
        context.translate(this.position.x, this.position.y);

        if (this.velocity.x > 0) this.angle = 0;
        else if (this.velocity.x < 0) this.angle = Math.PI;
        else if (this.velocity.y > 0) this.angle = Math.PI / 2;
        else if (this.velocity.y < 0) this.angle = -Math.PI / 2;

        const r = this.radius;
        const shiftX = Math.cos(this.angle) * (r * 0.2);
        const shiftY = Math.sin(this.angle) * (r * 0.2);

        // 2. THE TAIL (Now anchors to the "back" of the cat)
        this.tailFrame += 0.12;
        const frame = Math.floor(this.tailFrame % 5);
        
        context.save();
        // Rotate the tail only, so it stays opposite to movement
        context.rotate(this.angle + Math.PI); 
        context.beginPath();
        context.strokeStyle = this.color2;
        context.lineWidth = 5; // Thicker tail
        context.lineCap = "round";
        context.moveTo(r * 0.8, 0); 

        // 5-pose wiggle logic
        if (frame === 0) context.bezierCurveTo(r + 10, -15, r + 25, 20, r + 35, 0);
        if (frame === 1) context.bezierCurveTo(r + 10, -10, r + 20, 15, r + 30, 5);
        if (frame === 2) context.bezierCurveTo(r + 10, 0, r + 15, 0, r + 25, 0);
        if (frame === 3) context.bezierCurveTo(r + 10, 10, r + 20, -15, r + 30, -5);
        if (frame === 4) context.bezierCurveTo(r + 10, 15, r + 25, -20, r + 35, 0);
        context.stroke();
        context.restore();

        // 3. THE EARS 
        context.fillStyle = this.color7;
        // Left Ear - positioned relative to head
        context.beginPath();
        context.moveTo(-r * 0.9, -r * 0.2);
        context.lineTo(-r * 0.8, -r * 1.6); // Made them taller
        context.lineTo(-r * 0.1, -r * 0.8);
        context.fill();
        // Right Ear
        context.beginPath();
        context.moveTo(r * 0.9, -r * 0.2);
        context.lineTo(r * 0.8, -r * 1.6); // Made them taller
        context.lineTo(r * 0.1, -r * 0.8);
        context.fill();

        

        // Eyes (Vertical Ovals)
        context.fillStyle = this.color4;
        context.beginPath();
        context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
        context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
        context.fill();
        
        // Pupils
        context.fillStyle = this.color3;
        context.beginPath();
        context.ellipse(-r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
        context.ellipse(r * 0.35 + shiftX, -r * 0.2 + shiftY, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    update() {
        if(this.name=='blinky'){
            if(!blinkyrunninghome){
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                
                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                this.draw();
            }else{
                this.position.x += this.velocity.x*2;
                this.position.y += this.velocity.y*2;

                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                this.draw2()
            }
        }else if(this.name=='winky'){
            if(!winkyrunninghome){
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                
                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                this.draw();
            }else{
                this.position.x += this.velocity.x*2.5; //2.5* 2.8 can be 7 which is the same as 3.5*2
                this.position.y += this.velocity.y*2.5;

                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                this.draw2()
            }
        }else if(this.name=='dark'){
            if(!darkrunninghome){
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                
                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                this.draw();
            }else{
                this.position.x += this.velocity.x*4; //2.5* 2.8 can be 7 which is the same as 3.5*2
                this.position.y += this.velocity.y*4;

                if (this.position.x > (grid[0].length) * blocksize) this.position.x = 0;
                else if (this.position.x < 0) this.position.x = (grid[0].length) * blocksize;
                else if (this.position.y > (grid.length) * blocksize) this.position.y = 0;
                else if (this.position.y < 0) this.position.y = (grid.length) * blocksize;
                this.draw2()
            }
        }
        
        
    }
}

class steroids{
    constructor({ position}){
        this.position = position
        this.radius = 8
    }
    draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = "orange"
        context.shadowColor = "orange"
        context.shadowBlur = 20
        context.fill()
        context.closePath()
        context.shadowBlur = 0
        context.shadowColor = "transparent"
    }
}
const cheeseImg = new Image();
cheeseImg.src = 'cheese.png';

const skinsImg = new Image();
skinsImg.src = 'skins.png';
class steroids2{
    constructor({ position}){
        this.position = position
        this.radius = 14
    }
    draw() {
        if(skin=='base'){
            cheeseImg.src = 'cheese.png'
        }else if(skin=='glitch'){
            cheeseImg.src = 'glitcheese-removebg-preview.png'
        }else{
            cheeseImg.src = 'fast_food-removebg-preview.png'
        }
        context.drawImage(
            cheeseImg, 
            this.position.x-20, 
            this.position.y-20, 
            this.radius * 2.8, 
            this.radius * 2.8
        );
    }
}
class wall{
    constructor({ position, height, width }) {
        this.position = position
        this.height= height || 50
        this.width= width|| 50
    }

    draw() {
        context.save()
        context.translate(this.position.x, this.position.y)
        context.fillStyle = "darkblue"
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        context.restore()
    }

    update() {
        this.draw()
    }
}
let clock = 0
let drumpanger = 0
let drumpslowstart = 0
let glitchclock = 0
let mouseImg = new Image();
mouseImg.src = 'mouse.png';
const drumpSources = {
    idle: 'angry_guy-removebg-preview.png',
    start: 'angry_guy1-removebg-preview.png',
    start2: 'angry_guy2-removebg-preview.png',
    start3: 'angry_guy3-removebg-preview.png',
    start4: 'angry_guy4-removebg-preview.png',
    start5: 'angry_guy5-removebg-preview.png',
    start6: 'angry_guy6-removebg-preview.png',
};
const glitchSources = {
    pos1:'glitchmousebuff1-removebg-preview.png',
    pos2:'glitchmousebuff1__1_-removebg-preview.png',
    pos3:'glitchmousebuff1__2_-removebg-preview.png',
    pos4:'glitchbuff-removebg-preview.png'
}
const drumpImages = {};
for (let item in drumpSources) {
    drumpImages[item] = new Image();
    drumpImages[item].src = drumpSources[item];
}
const glitchImages = {};
for (let item in glitchSources) {
    glitchImages[item] = new Image();
    glitchImages[item].src = glitchSources[item];
}
class pacMan {
    constructor({ position, velocity, radius, angle = 0 }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.angle = angle
        this.frame = 0
        this.tailFrame = 0
    }
    draw() {
        if((blinkymode!='run')&&(winkymode!='run')&&(darkmode!='run')){
            if(skin == 'base'){
                context.save();
                context.translate(this.position.x, this.position.y);

                // Rotate based on movement direction
                if (this.velocity.x > 0) this.angle = 0;
                else if (this.velocity.x < 0) this.angle = Math.PI;
                else if (this.velocity.y > 0) this.angle = Math.PI / 2;
                else if (this.velocity.y < 0) this.angle = -Math.PI / 2;
                context.rotate(this.angle);

                // 1. THE TAIL (Simple 5-Frame Cycle)
                this.tailFrame += 0.12; // Adjust this number to change the wiggle speed
                const frame = Math.floor(this.tailFrame % 5);

                context.beginPath();
                context.strokeStyle = "#888"; 
                context.lineWidth = 4;
                context.moveTo(-this.radius + 2, 0); 

                // Each frame slightly shifts the curve's points
                if (frame === 0) context.bezierCurveTo(-this.radius-5, -20, -this.radius-30, 30, -this.radius-35, 0);
                if (frame === 1) context.bezierCurveTo(-this.radius-5, -10, -this.radius-30, 20, -this.radius-35, 5);
                if (frame === 2) context.bezierCurveTo(-this.radius-5, 0, -this.radius-30, 0, -this.radius-35, 0);
                if (frame === 3) context.bezierCurveTo(-this.radius-5, 10, -this.radius-30, -20, -this.radius-35, -5);
                if (frame === 4) context.bezierCurveTo(-this.radius-5, 20, -this.radius-30, -30, -this.radius-35, 0);

                context.stroke();

                // 2. ears
                const earSize = this.radius * 0.7; // BIG ears
                context.lineWidth = 2;

                // Left Ear (Grey with Pink center)
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "grey";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#ff99cc"; // Brighter pink
                context.fill();

                // Right Ear
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "grey";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#ff99cc";
                context.fill();

                // 3. THE HEAD 
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.fillStyle = "grey";
                context.fill();

                // 4. THE FACE (Bigger eyes and lower nose)
                context.fillStyle = "white";
                context.beginPath();
                // Left Eye
                context.arc(this.radius * 0.3, -this.radius * 0.3, 5, 0, Math.PI * 2);
                // Right Eye
                context.arc(this.radius * 0.3, this.radius * 0.3, 5, 0, Math.PI * 2);
                context.fill();
                
                // Pupils
                context.fillStyle = "black";
                context.beginPath();
                context.arc(this.radius * 0.35, -this.radius * 0.3, 2, 0, Math.PI * 2);
                context.arc(this.radius * 0.35, this.radius * 0.3, 2, 0, Math.PI * 2);
                context.fill();

                // Small Pink Nose at the tip
                context.fillStyle = "#ff99cc";
                context.beginPath();
                context.arc(this.radius * 0.8, 0, 4, 0, Math.PI * 2);
                context.fill();

                context.restore();
            }else if(skin == 'glitch'){
                clock = (clock+1)%100
                context.save();
                context.translate(this.position.x, this.position.y);

                // Rotate based on movement direction
                if (this.velocity.x > 0) this.angle = 0;
                else if (this.velocity.x < 0) this.angle = Math.PI;
                else if (this.velocity.y > 0) this.angle = Math.PI / 2;
                else if (this.velocity.y < 0) this.angle = -Math.PI / 2;
                context.rotate(this.angle);

                // 1. THE TAIL (Simple 5-Frame Cycle)
                this.tailFrame += 0.12; // Adjust this number to change the wiggle speed
                const frame = Math.floor(this.tailFrame % 5);

                context.beginPath();
                if(clock<50){
                    context.strokeStyle = "#0c0079"; 
                }else{
                    context.strokeStyle = "#20be00"; 
                }
                context.lineWidth = 4;
                context.moveTo(-this.radius + 2, 0); 

                // Each frame slightly shifts the curve's points
                if (frame === 0) context.bezierCurveTo(-this.radius-5, -20, -this.radius-30, 30, -this.radius-35, 0);
                if (frame === 1) context.bezierCurveTo(-this.radius-5, -10, -this.radius-30, 20, -this.radius-35, 5);
                if (frame === 2) context.bezierCurveTo(-this.radius-5, 0, -this.radius-30, 0, -this.radius-35, 0);
                if (frame === 3) context.bezierCurveTo(-this.radius-5, 10, -this.radius-30, -20, -this.radius-35, -5);
                if (frame === 4) context.bezierCurveTo(-this.radius-5, 20, -this.radius-30, -30, -this.radius-35, 0);

                context.stroke();

                // 2. ears
                const earSize = this.radius * 0.7; // BIG ears
                context.lineWidth = 2;

                // Left Ear (Grey with Pink center)
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "#0c0079";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#2bff00"; // Brighter pink
                context.fill();

                // Right Ear
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "#0c0079";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#2bff00";
                context.fill();

                // 3. THE HEAD 
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.fillStyle = "#0e008f";
                context.fill();

                // 4. THE FACE (Bigger eyes and lower nose)
                context.fillStyle = "#2bff00";
                context.beginPath();
                // Left Eye
                context.arc(this.radius * 0.3, -this.radius * 0.3, 5, 0, Math.PI * 2);
                // Right Eye

                context.fill();
                
                // Pupils
                context.fillStyle = "#22cd00";
                context.beginPath();
                context.arc(this.radius * 0.35, this.radius * 0.3, 4, 0, Math.PI * 2);
                context.fill();

                // Small Pink Nose at the tip
                context.fillStyle = "#0c9200";
                context.beginPath();
                context.arc(this.radius * 0.8, 0, 4, 0, Math.PI * 2);
                context.fill();

                context.restore();
            }else if(skin == 'drump'){
                drumpanger = 0
                context.save();
                context.translate(this.position.x, this.position.y);

                // Rotate based on movement direction
                if (this.velocity.x > 0) this.angle = 0;
                else if (this.velocity.x < 0) this.angle = Math.PI;
                else if (this.velocity.y > 0) this.angle = Math.PI / 2;
                else if (this.velocity.y < 0) this.angle = -Math.PI / 2;
                context.rotate(this.angle);

                // 1. THE TAIL (Simple 5-Frame Cycle)
                this.tailFrame += 0.12; // Adjust this number to change the wiggle speed
                const frame = Math.floor(this.tailFrame % 5);

                context.beginPath();
                context.strokeStyle = "#f4e61c"; 
                context.lineWidth = 4;
                context.moveTo(-this.radius + 2, 0); 

                // Each frame slightly shifts the curve's points
                if (frame === 0) context.bezierCurveTo(-this.radius-5, -20, -this.radius-30, 30, -this.radius-35, 0);
                if (frame === 1) context.bezierCurveTo(-this.radius-5, -10, -this.radius-30, 20, -this.radius-35, 5);
                if (frame === 2) context.bezierCurveTo(-this.radius-5, 0, -this.radius-30, 0, -this.radius-35, 0);
                if (frame === 3) context.bezierCurveTo(-this.radius-5, 10, -this.radius-30, -20, -this.radius-35, -5);
                if (frame === 4) context.bezierCurveTo(-this.radius-5, 20, -this.radius-30, -30, -this.radius-35, 0);

                context.stroke();

                // 2. ears
                const earSize = this.radius * 0.7; // BIG ears
                context.lineWidth = 2;

                // Left Ear (yellow with orange center)
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "#fee04e";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, -this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#f39851";
                context.fill();

                // Right Ear
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize, 0, Math.PI * 2);
                context.fillStyle = "#fee04e";
                context.fill();
                context.beginPath();
                context.arc(-this.radius * 0.8, this.radius * 0.7, earSize * 0.6, 0, Math.PI * 2);
                context.fillStyle = "#f39851";
                context.fill();

                // 3. THE HEAD 
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.fillStyle = "#f39851";
                context.fill();

                // 4. THE FACE (Bigger eyes and lower nose)
                context.fillStyle = "white";
                context.beginPath();
                // Left Eye
                context.arc(this.radius * 0.3, -this.radius * 0.3, 5, 0, Math.PI * 2);
                // Right Eye
                context.arc(this.radius * 0.3, this.radius * 0.3, 5, 0, Math.PI * 2);
                context.fill();
                
                // Pupils
                context.fillStyle = "#e6e6e6";
                context.beginPath();
                context.arc(this.radius * 0.35, -this.radius * 0.3, 2, 0, Math.PI * 2);
                context.arc(this.radius * 0.35, this.radius * 0.3, 2, 0, Math.PI * 2);
                context.fill();

                // Small Pink Nose at the tip
                context.fillStyle = "#fee04e";
                context.beginPath();
                context.arc(this.radius * 0.8, 0, 4, 0, Math.PI * 2);
                context.fill();

                context.restore();
            }
            
        }else{
            if((blinkyrunningtime>=510 || winkyrunningtime>=510 || darkrunningtime>=510) && skin=='base'){
                mouseImg.src = 'mouse2.png';
            }
            if(skin=='glitch'){
                if(blinkyrunningtime>=510 || winkyrunningtime>=510 || darkrunningtime>=510){
                    mouseImg.src = 'glitch2.png'    
                }else{
                glitchclock = (glitchclock+1)%240
                    console.log(glitchclock)
                    if(glitchclock>180){
                        mouseImg = glitchImages.pos1
                    }else if(glitchclock>120){
                        mouseImg = glitchImages.pos2
                    }else if(glitchclock>60){
                        mouseImg = glitchImages.pos3
                    }else{
                        mouseImg = glitchImages.pos4
                    }
                }
            }
            if(skin=='drump'){
                drumpanger+=1
                if(drumpanger<78){
                    mouseImg=drumpImages.idle
                }else if(drumpanger<155){
                    mouseImg=drumpImages.start
                }else if(drumpanger<233){
                    mouseImg=drumpImages.start2
                }else if(drumpanger<311){
                    mouseImg=drumpImages.start3
                }else if(drumpanger<389){
                    mouseImg=drumpImages.start4
                }else if(drumpanger<467){
                    mouseImg=drumpImages.start5
                }else{
                    mouseImg=drumpImages.start6
                }

                if(drumpanger==77){
                    red.velocity.x = red.velocity.x/10*9
                    red.velocity.y = red.velocity.y/10*9
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-10%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*9
                    winky.velocity.y = winky.velocity.y/10*9
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-10%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*9
                    dark.velocity.y = dark.velocity.y/10*9
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-10%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*2){
                    red.velocity.x = red.velocity.x/10*8
                    red.velocity.y = red.velocity.y/10*8
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-20%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*8
                    winky.velocity.y = winky.velocity.y/10*8
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-20%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*8
                    dark.velocity.y = dark.velocity.y/10*8
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-20%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*3){
                    red.velocity.x = red.velocity.x/10*7
                    red.velocity.y = red.velocity.y/10*7
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-30%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*7
                    winky.velocity.y = winky.velocity.y/10*7
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-30%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*7
                    dark.velocity.y = dark.velocity.y/10*7
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-30%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*4){
                    red.velocity.x = red.velocity.x/10*6
                    red.velocity.y = red.velocity.y/10*6
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-40%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*6
                    winky.velocity.y = winky.velocity.y/10*6
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-40%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*6
                    dark.velocity.y = dark.velocity.y/10*6
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-40%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*5){
                    red.velocity.x = red.velocity.x/10*5
                    red.velocity.y = red.velocity.y/10*5
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-50%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*5
                    winky.velocity.y = winky.velocity.y/10*5
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-50%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*5
                    dark.velocity.y = dark.velocity.y/10*5
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-50%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*6){
                    red.velocity.x = red.velocity.x/10*4
                    red.velocity.y = red.velocity.y/10*4
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-60%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*4
                    winky.velocity.y = winky.velocity.y/10*4
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-60%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*4
                    dark.velocity.y = dark.velocity.y/10*4
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-60%",
                        color: 'red'
                    }));
                }else if(drumpanger==77*7){
                    red.velocity.x = red.velocity.x/10*3
                    red.velocity.y = red.velocity.y/10*3
                    texts.push(new FloatingText({
                        x: red.position.x,
                        y: red.position.y,
                        text: "-70%",
                        color: 'red'
                    }));
                    winky.velocity.x = winky.velocity.x/10*3
                    winky.velocity.y = winky.velocity.y/10*3
                    texts.push(new FloatingText({
                        x: winky.position.x,
                        y: winky.position.y,
                        text: "-70%",
                        color: 'red'
                    }));
                    dark.velocity.x = dark.velocity.x/10*3
                    dark.velocity.y = dark.velocity.y/10*3
                    texts.push(new FloatingText({
                        x: dark.position.x,
                        y: dark.position.y,
                        text: "-70%",
                        color: 'red'
                    }));
                }

                if(drumpanger==540)drumpanger = 0
            }
            context.drawImage(
                mouseImg, 
                this.position.x-36, 
                this.position.y-36, 
                this.radius * 5, 
                this.radius * 5
            );
        }
        
    }
    /*draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = "yellow"
        context.fill()
        context.closePath()

        
        this.frame += 0.15
        
        if(mouthopen){
            mouthOpenness = Math.abs(Math.sin(this.frame)) * this.radius*pacmanspeed
        }
        context.save()
        context.translate(this.position.x, this.position.y)
        context.rotate(this.angle)

        context.beginPath()
        context.moveTo(0, 0)
        
        context.lineTo(this.radius, -mouthOpenness)
        context.lineTo(this.radius, mouthOpenness)
        context.closePath()

        context.fillStyle = "black"
        context.fill()
        context.restore()
    }*/
    

    update() {
        this.position.x += this.velocity.x*pacmanspeed
        this.position.y += this.velocity.y*pacmanspeed
        if (this.position.x > (grid[0].length)*blocksize) {
            this.position.x = 0
        } else if (this.position.x < 0) {
            this.position.x = (grid[0].length)*blocksize
        }

        // Vertical warp
        if (this.position.y > canvas.height) {
            this.position.y = 0
        } else if (this.position.y < 0) {
            this.position.y = canvas.height
        }
        this.draw()
    }
}
class Hole {
    constructor({ position, height, width }) {
        this.position = position;
        this.height = height || 50;
        this.width = width || 50;
    }
}
const player = new pacMan({
    position: { x: blocksize-16, y: canvas.height / 2-8},
    velocity: { x: 0, y: 0 },
    radius: 17,
})
const ghostStartGridX = 1; 
const ghostStartGridY = 1;

const red = new ghost({
    position: {
        x: blinkyhome[idx][0] * blocksize + blocksize / 2, // 1 * 36 + 18 = 54
        y: blinkyhome[idx][1] * blocksize + blocksize / 2  // 1 * 36 + 18 = 54
    },
    velocity: { x: 0, y: 0 },
    name:'blinky',
});
const winky = new ghost({
    position: {
        x: winkyhome[idx][0] * blocksize + blocksize / 2, // 1 * 36 + 18 = 54
        y: winkyhome[idx][1] * blocksize + blocksize / 2  // 1 * 36 + 18 = 54
    },
    velocity: { x: 0, y: 0 },
    color:'#e6e6e6',
    color2:'pink',
    color3: '#4dcaff',
    color4: 'white',
    color5: 'white',
    color6: 'pink',
    color7:'#e6e6e6',
    name:'winky',
});
const linearGradient = context.createLinearGradient(0, 0, 150, 150);

linearGradient.addColorStop(0, "#8b3100"); 
linearGradient.addColorStop(1, '#ed755a'); 
const dark = new ghost({
    position: {
        x: darkhome[idx][0] * blocksize + blocksize / 2,
        y: darkhome[idx][1] * blocksize + blocksize / 2
    },
    velocity: { x: 0, y: 0 },
    color: '#8b3100',
    color2: '#ed755a',
    color3: 'white',
    color4: 'white',
    color5: '#ffc4c4',
    color6: '#ed755a',
    color7: linearGradient,
    name: 'dark',
});
let desiredVelocity = { x: 0, y: 0 };

addEventListener("keydown", ({ key }) => {
    switch (key.toLowerCase()) {
        case 'w': desiredVelocity = { x: 0, y: -4 }; break;
        case 'a': desiredVelocity = { x: -4, y: 0 }; break;
        case 's': desiredVelocity = { x: 0, y: 4 }; break;
        case 'd': desiredVelocity = { x: 4, y: 0 }; break;

        case 'arrowup': desiredVelocity = { x: 0, y: -4 }; break;
        case 'arrowleft': desiredVelocity = { x: -4, y: 0 }; break;
        case 'arrowdown': desiredVelocity = { x: 0, y: 4 }; break;
        case 'arrowright': desiredVelocity = { x: 4, y: 0 }; break;

        case 'escape': !paused ? pausegame() : resume()
    }
});
let touchStartX = 0
let touchStartY = 0

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
}, { passive: true })

canvas.addEventListener("touchend", (e) => {
    if (window.currentGameState === "INTRO") return

    let diffX = e.changedTouches[0].clientX - touchStartX
    let diffY = e.changedTouches[0].clientY - touchStartY

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) {
                desiredVelocity = { x: 4, y: 0 }
            } else {
                desiredVelocity = { x: -4, y: 0 }
            }
        }
    } else {
        if (Math.abs(diffY) > 30) {
            if (diffY > 0) {
                desiredVelocity = { x: 0, y: 4 }
            } else {
                desiredVelocity = { x: 0, y: -4 }
            }
        }
    }
}, { passive: true })
function updateLivesUI() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = 'Lives: '; // Clear current icons

    for (let i = 0; i < playerLives; i++) {
        const icon = document.createElement('div');
        icon.className = 'icon-wrapper'
        let mouseears = document.createElement('div')
        mouseears.className = 'leftmouseears'
        let mouseears2 = document.createElement('div')
        mouseears2.className = 'rightmouseears'

        let mouseearsin = document.createElement('div')
        mouseearsin.className = 'leftmouseearsin'
        let mouseearsin2 = document.createElement('div')
        mouseearsin2.className = 'rightmouseearsin'

        let mouseeyeleft1 = document.createElement('div')
        mouseeyeleft1.className = 'mouseeyeleft'
        let mouseeyeright1 = document.createElement('div')
        mouseeyeright1.className = 'mouseeyeright'

        let mouseeyeleftin1 = document.createElement('div')
        mouseeyeleftin1.className = 'mouseeyeleftin'
        let mouseeyerightin1 = document.createElement('div')
        mouseeyerightin1.className = 'mouseeyerightin'

        let mouse = document.createElement('div')
        mouse.className = 'life-icon';
        icon.appendChild(mouse)
        icon.appendChild(mouseears)
        icon.appendChild(mouseears2)
        icon.appendChild(mouseearsin)
        icon.appendChild(mouseearsin2)
        icon.appendChild(mouseeyeleft1)
        icon.appendChild(mouseeyeright1)
        icon.appendChild(mouseeyeleftin1)
        icon.appendChild(mouseeyerightin1)
        livesContainer.appendChild(icon);
    }
}
grid.forEach((row, y) => {
    row.forEach((symbol, x) => {
        // Calculate the exact center of this tile
        const centerX = x * blocksize + blocksize / 2;
        const centerY = y * blocksize + blocksize / 2;

        if (symbol === "1") {
            wallsarr.push(new wall({
                position: { x: centerX, y: centerY },
                width: blocksize,
                height: blocksize
            }));
        }else if(symbol==="9"){
            boundaries.push(new wall({
                position: { x: centerX, y: centerY },
                width: blocksize,
                height: blocksize
            }));
        }else if (symbol === "4") {
            steroids2arr.push(new steroids2({
                position: { x: centerX, y: centerY }
            }));
        } else if (symbol === "0") {
            steroidsarr.push(new steroids({
                position: { x: centerX, y: centerY }
            }));
        }
    });
});
function circleCollision(a,b){
    if(Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)<=(a.radius+b.radius)){
        return true
    }return false
}

function rectCircleCollision(player, circle) {
    // player = wall, circle = pacman
    const playerLeft = player.position.x - player.width / 2;
    const playerRight = player.position.x + player.width / 2;
    const playerTop = player.position.y - player.height / 2;
    const playerBottom = player.position.y + player.height / 2;

    const circleLeft = circle.position.x - circle.radius;
    const circleRight = circle.position.x + circle.radius;
    const circleTop = circle.position.y - circle.radius;
    const circleBottom = circle.position.y + circle.radius;

    // Strict overlap: removes the "stuck on edge" bug so you can slide along walls
    return (
        circleRight > playerLeft &&
        circleLeft < playerRight &&
        circleBottom > playerTop &&
        circleTop < playerBottom
    );
}
let lastTime = 0;
let accumulator = 0;
let fps = 60
let targetFPS = 1000/fps;
let interval = 0

let musics = ['megisss-simple-corporate-477081.mp3','echogatestudios-memories-of-a-simple-time-450676.mp3','geoffharvey-cute-creatures-150622.mp3','marmixer-light-year-265098.mp3','stardust.mp3','bluelikeu.mp3']
let curaudio = new Audio(musics[Math.floor(Math.random()*musics.length)])
curaudio.volume=0.2
let skinmusic = new Audio('skinmusic.mp3')
skinmusic.volume = 0.5
let haventplayedmusic = true
document.addEventListener('keydown', () => {
    if(window.currentGameState!='INTRO'&&haventplayedmusic){
        haventplayedmusic = false
        fadeinaudio(curaudio,0.2).catch(e => console.log('press to start'));
    }
});
const pausemusic = new Audio('pause music arthurhale-cheerful-simple-music.mp3');
function specialfloor(x){
    //round down to the nearest half
    if(x<1){
        return 0.25
    }
    return x-x%0.5
}
function animate(currentTime) {
    
    if (window.currentGameState === "INTRO") {
        requestAnimationFrame(animate);
        return;
    }
    if(gamestate!='choosingbase' && gamestate!='choosingglitch' && gamestate!='choosingdrump')document.getElementById('ui-layer').hidden = false
    
    if(skin=='base'){
        pacmanspeed = 1+extra
    }else if(skin=='glitch'){
        pacmanspeed = extra + specialfloor(Math.random()*1.5)+0.5
    }else if(skin=='drump'){
        pacmanspeed = 1+extra
        if(drumpslowstart<2)pacmanspeed = 0.75+extra
    }  
    if(skin=='glitch'){
        if (player.velocity.x === 0 && player.velocity.y === 0) {
            // Only check for stuckness if the glitch power is NOT actively running
            const isPhasingActive = (skin === 'glitch' && (blinkymode === 'run' || winkymode === 'run' || darkmode === 'run'));
            
            if (!isPhasingActive) {
                let directlyInWall = false;
                
                // Check if the player is fused inside any wall block
                for (let i = 0; i < wallsarr.length; i++) {
                    if (rectCircleCollision(wallsarr[i], player)) {
                        directlyInWall = true;
                        break;
                    }
                }
                
                // If they are trapped with zero velocity, rescue them immediately!
                if (directlyInWall) {
                    console.warn("Emergency Stuck Detector triggered! Rescuing player...");
                    glitchUnstuck();
                }
            }
        }
    }
    if (isGameOver) return;
    if (!currentTime) currentTime = performance.now();
    targetFPS = 1000/fps;
    id = requestAnimationFrame(animate);
    if(isResetting)return
    if(isnextleveling)return
    if (!lastTime) {
        lastTime = currentTime;
        return;
    }
    let deltaTime = currentTime - lastTime;
    if(deltaTime>50)deltaTime=50
    lastTime = currentTime;
    accumulator += deltaTime;
    
    while (accumulator >= targetFPS) {
        accumulator -= targetFPS;
        if(curaudio.ended){
            curaudio.src = musics[Math.floor(Math.random() * musics.length)];
            fadeinaudio(curaudio,0.2)
        }

        if(blinkytimer>0){
            blinkytimer+=1
            if(blinkytimer>200){
                blinkytimer = 0
                ghostgrid[2][15] = '0'
                blinkyrunninghome = false
            }
            
        }
        if(blinkymode=='run'){
            red.scared = true
        }else{
            red.scared = false
        }
        if(blinkymode=='chase' && blinkyscattercount<4 && !blinkyrunninghome){
            if(blinkylastmodechange>=480){
                if(Math.random()>0.35){
                    blinkymode = 'scatter'
                    blinkyscattercount+=1
                }
                blinkylastmodechange = 0
            }
            blinkylastmodechange+=1
        }
        if(blinkymode=='run'){
            if(blinkyrunningtime>=540){
                blinkymode = 'chase'
                glitchUnstuck()
                blinkyrunningtime = -1
            }
            blinkyrunningtime+=1
        }



        if(winkytimer>0){
            winkytimer+=1
            if(winkytimer>200){
                winkytimer = 0
                winkygrid[2][15] = '0'
                winkyrunninghome = false
            }
            
        }
        if(winkymode=='run'){
            winky.scared = true
        }else{
            winky.scared = false
        }
        if(winkymode=='chase' && winkyscattercount<4 && !winkyrunninghome){
            if(winkylastmodechange>=480){
                if(Math.random()>0.35){
                    winkymode = 'scatter'
                    winkyscattercount+=1
                }
                winkylastmodechange = 0
            }
            winkylastmodechange+=1
        }
        if(winkymode=='run'){
            if(winkyrunningtime>=540){
                winkymode = 'chase'
                glitchUnstuck()
                winkyrunningtime = -1
            }
            winkyrunningtime+=1
        }


        if(darktimer>0){
            darktimer+=1
            darkgrid[2][15] = '1'
            if(darktimer>200){
                darktimer = 0
                darkgrid[2][15] = '0'
                darkrunninghome = false
            }
            
        }
        if(darkmode=='run'){
            dark.scared = true
        }else{
            dark.scared = false
        }
        if(darkmode=='chase' && darkscattercount<4 && !darkrunninghome){
            if(darklastmodechange>=480){
                if(Math.random()>0.35){
                    darkmode = 'scatter'
                    darkscattercount+=1
                }
                darklastmodechange = 0
            }
            darklastmodechange+=1
        }
        if(darkmode=='run'){
            if(darkrunningtime>=540){
                darkmode = 'chase'
                glitchUnstuck()
                darkrunningtime = -1
            }
            darkrunningtime+=1
        }


        document.getElementById('points').innerText = `Points: ${score}`
        document.getElementById('levels').innerText = `Level: ${currentLevel}`
        updateLivesUI()
        context.fillStyle = bgcolor
        context.fillRect(0, 0, canvas.width, canvas.height)
        for (let i = wallsarr.length - 1; i >= 0; i--) {
            wallsarr[i].draw()
        }
        for (let i = boundaries.length - 1; i >= 0; i--) {
            boundaries[i].draw()
        }
        for (let i = steroidsarr.length - 1; i >= 0; i--) {
            if (circleCollision(player, steroidsarr[i])) {
                score += 10;
                steroidsarr.splice(i, 1);
            } else {
                steroidsarr[i].draw();
            }
        }
        
        for(let i=0;i<steroids2arr.length;i++){
            if (false==circleCollision(player,steroids2arr[i])){
                steroids2arr[i].draw()
            }else{
                if(skin == 'base'){
                    mouseImg.src = 'mouse.png';
                }else if(skin=='glitch'){
                    glitchclock = (glitchclock+1)%100
                    mouseImg.src = 'glitchbuff-removebg-preview.png'
                }else if(skin=='drump'){
                    drumpanger = 0
                    drumpslowstart+=1
                }
                score+=100
                if(!blinkyrunninghome && blinkytimer==0){
                    blinkymode = 'run'
                    blinkyrunningtime = 0
                }
                if(!winkyrunninghome && winkytimer==0){
                    winkymode = 'run'
                    winkyrunningtime = 0
                }
                if(!darkrunninghome && darktimer==0){
                    darkmode = 'run'
                    darkrunningtime = 0
                }

                steroids2arr.splice(i,1)
            }
        }
        if (typeof wasPhasingActive === 'undefined') {
            var wasPhasingActive = false;
        }

        const isAnyGhostRunning = (blinkymode === 'run' || winkymode === 'run' || darkmode === 'run');
        const isBuffActive = (skin === 'glitch' && isAnyGhostRunning);

        if (wasPhasingActive && !isBuffActive) {
            console.log("BUFF ENDED DETECTED: Running safety unstuck check!");
            glitchUnstuck(); 
        }

        wasPhasingActive = isBuffActive;


        // 1. TURNING LOGIC (Check if we CAN turn)
        let canTurn = true;
        const desiredPacman = {
            position: {
                x: player.position.x + desiredVelocity.x,
                y: player.position.y + desiredVelocity.y
            },
            radius: player.radius
        };
        if(!justteleported){
            if(((blinkymode!='run')&&(winkymode!='run')&&(darkmode!='run'))||skin!='glitch'){
                for (let i = 0; i < wallsarr.length; i++) {
                    if (rectCircleCollision(wallsarr[i], desiredPacman)) {
                        canTurn = false;
                        break;
                    }
                }
            }
            for (let i = 0; i < boundaries.length; i++) {
                if (rectCircleCollision(boundaries[i], desiredPacman)) {
                    canTurn = false;
                    break;
                }
            }

            if (canTurn && (desiredVelocity.x !== 0 || desiredVelocity.y !== 0)) {
                player.velocity = desiredVelocity;
                // Update angles for drawing
                if (player.velocity.x > 0) player.angle = 0;
                if (player.velocity.x < 0) player.angle = Math.PI;
                if (player.velocity.y > 0) player.angle = Math.PI / 2;
                if (player.velocity.y < 0) player.angle = -Math.PI / 2;
            }

            // 2. PAC-MAN COLLISION & SNAPPING (Combined into one loop)
            if (((blinkymode!='run')&&(winkymode!='run')&&(darkmode!='run'))||skin!='glitch'){
                for (let i = 0; i < wallsarr.length; i++) {
                    const futurePacman = {
                        position: {
                            x: player.position.x + player.velocity.x * pacmanspeed,
                            y: player.position.y + player.velocity.y * pacmanspeed
                        },
                        radius: player.radius
                    };

                    if (rectCircleCollision(wallsarr[i], futurePacman)) {

                        // SNAP TO EDGE: This clears the "stuck" pixels so turning works next frame
                        if (player.velocity.x > 0) {
                            player.position.x = wallsarr[i].position.x - (wallsarr[i].width / 2) - player.radius;
                        } else if (player.velocity.x < 0) {
                            player.position.x = wallsarr[i].position.x + (wallsarr[i].width / 2) + player.radius;
                        }

                        if (player.velocity.y > 0) {
                            player.position.y = wallsarr[i].position.y - (wallsarr[i].height / 2) - player.radius;
                        } else if (player.velocity.y < 0) {
                            player.position.y = wallsarr[i].position.y + (wallsarr[i].height / 2) + player.radius;
                        }

                        player.velocity = { x: 0, y: 0 };
                        break; 
                    }
                }
            }
            for (let i = 0; i < boundaries.length; i++) {
                const futurePacman = {
                    position: {
                        x: player.position.x + player.velocity.x * pacmanspeed,
                        y: player.position.y + player.velocity.y * pacmanspeed
                    },
                    radius: player.radius
                };

                if (rectCircleCollision(boundaries[i], futurePacman)) {

                    // SNAP TO EDGE: This clears the "stuck" pixels so turning works next frame
                    if (player.velocity.x > 0) {
                        player.position.x = boundaries[i].position.x - (boundaries[i].width / 2) - player.radius;
                    } else if (player.velocity.x < 0) {
                        player.position.x = boundaries[i].position.x + (boundaries[i].width / 2) + player.radius;
                    }

                    if (player.velocity.y > 0) {
                        player.position.y = boundaries[i].position.y - (boundaries[i].height / 2) - player.radius;
                    } else if (player.velocity.y < 0) {
                        player.position.y = boundaries[i].position.y + (boundaries[i].height / 2) + player.radius;
                    }

                    player.velocity = { x: 0, y: 0 };
                    break; 
                }
            }
        }
        if (Math.abs(red.position.x % blocksize - blocksize / 2) < 2 && 
            Math.abs(red.position.y % blocksize - blocksize / 2) < 2) {
            
            // 1. Precise Snapping
            const gGridX = Math.round((red.position.x - blocksize / 2) / blocksize);
            const gGridY = Math.round((red.position.y - blocksize / 2) / blocksize);
            const pGridX = Math.round((player.position.x - blocksize / 2) / blocksize);
            const pGridY = Math.round((player.position.y - blocksize / 2) / blocksize);

            red.position.x = gGridX * blocksize + blocksize / 2;
            red.position.y = gGridY * blocksize + blocksize / 2;

            // 2. Get the BFS direction
            const nextMove = getNextblinkyMove(gGridX, gGridY, pGridX, pGridY, ghostgrid);
            blinkylastmove = nextMove
            // 3. Set velocity based on speed (using 2 for smoothness)
            blinkySpeed = 3.5*(1+extra);
            if(skin=='drump'){
                blinkySpeed = blinkySpeed/10 * (10-Math.floor(drumpanger/77))
            }
            red.velocity.x = nextMove.x * blinkySpeed;
            red.velocity.y = nextMove.y * blinkySpeed;
        }
        if (Math.abs(winky.position.x % blocksize - blocksize / 2) < 2 && 
            Math.abs(winky.position.y % blocksize - blocksize / 2) < 2) {
            
            // 1. Precise Snapping
            const gGridX = Math.round((winky.position.x - blocksize / 2) / blocksize);
            const gGridY = Math.round((winky.position.y - blocksize / 2) / blocksize);
            const pGridX = Math.round((player.position.x - blocksize / 2) / blocksize);
            const pGridY = Math.round((player.position.y - blocksize / 2) / blocksize);

            winky.position.x = gGridX * blocksize + blocksize / 2;
            winky.position.y = gGridY * blocksize + blocksize / 2;

            // 2. Get the BFS direction
            const nextMove = getNextwinkyMove(gGridX, gGridY, pGridX, pGridY, winkygrid);
            winkylastmove = nextMove
            // 3. Set velocity based on speed (using 2 for smoothness)
            winkySpeed = 2.8*(1+extra);
            if(skin=='drump'){
                winkySpeed = winkySpeed/10 * (10-Math.floor(drumpanger/77))
            }
            winky.velocity.x = nextMove.x * winkySpeed;
            winky.velocity.y = nextMove.y * winkySpeed;
        }
        
        if (Math.abs(dark.position.x % blocksize - blocksize / 2) < 2 && 
            Math.abs(dark.position.y % blocksize - blocksize / 2) <2) {

            const gGridX = Math.round((dark.position.x - blocksize / 2) / blocksize);
            const gGridY = Math.round((dark.position.y - blocksize / 2) / blocksize);
            const pGridX = Math.round((player.position.x - blocksize / 2) / blocksize);
            const pGridY = Math.round((player.position.y - blocksize / 2) / blocksize);
            dark.position.x = gGridX * blocksize + blocksize / 2;
            dark.position.y = gGridY * blocksize + blocksize / 2;
            darkSpeed = 3.5
            if(darkrunninghome)darkSpeed = 1
            const nextMove = getNextdarkMove(gGridX, gGridY, pGridX, pGridY, darkgrid);
            darklastmove = nextMove;
            if(skin=='drump' &&drumpanger){
                darkSpeed = darkSpeed/10 * (10-Math.floor(drumpanger/77))
            }
            dark.velocity.x = nextMove.x * darkSpeed;
            dark.velocity.y = nextMove.y * darkSpeed;
        }

        if (circleCollision(player, red)) {
            if(blinkymode!='run' &&!isResetting&&!blinkyrunninghome){
                gamestate = 'resetting'
                isResetting = true
                playerLives -= 1;
                updateLivesUI()
                context.fillStyle = 'white'
                context.font = '1px "Press Start 2P"';
                context.textAlign = "center"
                
                context.fillText('Loadiing font', canvas.width, canvas.height);
                if (playerLives <= 0) {
                    cancelAnimationFrame(id)
                    document.getElementById('ui-layer').hidden = true
                    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, "black");
                    gradient.addColorStop(0.3, "black");
                    gradient.addColorStop(1, "#3533cd");  

                    context.fillStyle = gradient;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = 'white'
                    context.font = '60px "Press Start 2P"';
                    context.textAlign = "center"
                    
                    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 6);

                    context.textAlign = "center"
                    context.fillStyle = '#e9cb36'
                    context.font = '35px "Press Start 2P"';
                    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 4);


                    // Button properties
                    const x = canvas.width / 2 -canvas.width*0.08, y = canvas.height / 3 -canvas.height*0.05, width = 260, height = 70, radius = 20;

                    context.beginPath();
                    context.roundRect(x, y, width, height, radius); // Draws the rounded path
                    context.fillStyle = "#422bcd";
                    context.fill();

                    // Add text
                    context.fillStyle = "white";
                    context.font = '9px "Tiny5" bold';
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText("RETRY", canvas.width / 2, canvas.height / 3);
                    
                    context.textAlign = "center"
                    context.fillStyle = '#38b6ff'
                    context.font = '35px "Press Start 2P"';
                    context.fillText("Leaderboard", canvas.width / 2, canvas.height / 9 *4);
                                        
                    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                    window.refreshLeaderboard = async function() {
                        const list = document.getElementById("leaderboard");
                        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(9));
                        list.innerHTML = "<li>Loading...</li>";
                        if(isMobile)q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(3))
                        
                        const querySnapshot = await getDocs(q);
                        list.innerHTML = "";
                        let i =0
                        querySnapshot.forEach((doc) => {
                        i+=1
                        const data = doc.data();
                        list.innerHTML += `<li>${i}.                     ${data.name}: ${data.score}</li>`;
                        });
                    }
                    window.submitScore = async function(playerName, score) {

                        if(score === 0) return; 

                        try {
                        await addDoc(collection(db, "leaderboard"), {
                            name: playerName,
                            score: Number(score), 
                            timestamp: Date.now()
                        });
                        console.log("Score submitted successfully");
                        window.refreshLeaderboard();
                        } catch (error) {
                        console.error("Error adding score: ", error);
                        alert("Could not save score. Check console.");
                        }
                    }
                    const playerName = prompt("Game Over! Enter your name:");
                    if (playerName) {
                        window.submitScore(playerName, score);
                    } else {
                        window.refreshLeaderboard();
                    }
                    const overlay = document.getElementById('leaderboard-overlay');
                    overlay.style.display = 'block';
                    canvas.addEventListener('click', (event) => {
                        const rect = canvas.getBoundingClientRect();
                        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
                        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

                        const btnX = x;
                        const btnY = y+height/2;
                        const btnWidth = width;
                        const btnHeight = height;

                        if (playerLives <= 0 && 
                            mouseX >= btnX && mouseX <= btnX + btnWidth &&
                            mouseY >= btnY && mouseY <= btnY + btnHeight) {
                            
                            console.log("Retry button clicked!");
                            resetGame();
                        }
                    });
                    return
                } else {
                    cancelAnimationFrame(id)
                    setTimeout(() => {
                        
                        // Reset positions here so the player sees them jump back
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        // Reset Blinky's position
                        red.position.x = blinkyhome[idx][0] * blocksize + blocksize / 2;
                        red.position.y = blinkyhome[idx][1] * blocksize + blocksize / 2;
                        
                        // Give the player a tiny breather before the ghost attacks againi
                        blinkyscattercount = 0;
                        blinkylastmodechange = 0;

                        winky.position.x = winkyhome[idx][0] * blocksize + blocksize / 2;
                        winky.position.y = winkyhome[idx][1] * blocksize + blocksize / 2;

                        dark.position.x = darkhome[idx][0]*blocksize+blocksize/2
                        dark.position.y = darkhome[idx][1]*blocksize+blocksize/2
                        // Give the player a tiny breather before the ghost attacks again
                        winkymode = 'scatter';
                        winkyscattercount = 0;
                        winkylastmodechange = 0;
                        player.angle = 0
                        lastTime = performance.now(); 
                        blinkytimer = 0;
                        winkytimer = 0;
                        blinkyrunninghome = false;
                        winkyrunninghome = false;
                        isResetting = false; // Unlock the game!
                        gamestate = 'normal'
                        id = requestAnimationFrame(animate);
                    }, 2500);
                    
                
                }
            }else{
                if(blinkyrunninghome==false){
                    texts.push(new FloatingText({
                        x: player.position.x,
                        y: player.position.y,
                        text: "+200"
                    }));
                    score+=200
                }
                blinkyrunninghome = true
                console.log('ghost goes back to home')
            }
            
        }
        if (circleCollision(player, winky)) {
            if(winkymode!='run'&&!isResetting&&!winkyrunninghome){
                isResetting = true
                gamestate = 'resetting'
                console.log(winkymode)
                playerLives -= 1;
                updateLivesUI()
                context.fillStyle = 'white'
                context.font = '1px "Press Start 2P"';
                context.textAlign = "center"
                
                context.fillText('Loadiing font', canvas.width, canvas.height);
                if (playerLives <= 0) {
                    document.getElementById('ui-layer').hidden = true
                    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, "black");
                    gradient.addColorStop(0.3, "black");
                    gradient.addColorStop(1, "#3533cd");  

                    context.fillStyle = gradient;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = 'white'
                    context.font = '60px "Press Start 2P"';
                    context.textAlign = "center"
                    
                    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 6);

                    context.textAlign = "center"
                    context.fillStyle = '#e9cb36'
                    context.font = '35px "Press Start 2P"';
                    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 4);


                    // Button properties
                    const x = canvas.width / 2 -canvas.width*0.08, y = canvas.height / 3 -canvas.height*0.05, width = 260, height = 70, radius = 20;

                    context.beginPath();
                    context.roundRect(x, y, width, height, radius); // Draws the rounded path
                    context.fillStyle = "#422bcd";
                    context.fill();

                    // Add text
                    context.fillStyle = "white";
                    context.font = '9px "Tiny5" bold';
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText("RETRY", canvas.width / 2, canvas.height / 3);
                    
                    context.textAlign = "center"
                    context.fillStyle = '#38b6ff'
                    context.font = '35px "Press Start 2P"';
                    context.fillText("Leaderboard", canvas.width / 2, canvas.height / 9 *4);
                                        

                    window.refreshLeaderboard = async function() {
                        const list = document.getElementById("leaderboard");
                        list.innerHTML = "<li>Loading...</li>";
                        
                        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(9));
                        
                        const querySnapshot = await getDocs(q);
                        list.innerHTML = "";
                        let i =0
                        querySnapshot.forEach((doc) => {
                        i+=1
                        const data = doc.data();
                        list.innerHTML += `<li>${i}.                     ${data.name}: ${data.score}</li>`;
                        });
                    }
                    window.submitScore = async function(playerName, score) {

                        if(score === 0) return; 

                        try {
                        await addDoc(collection(db, "leaderboard"), {
                            name: playerName,
                            score: Number(score), 
                            timestamp: Date.now()
                        });
                        console.log("Score submitted successfully");
                        window.refreshLeaderboard();
                        } catch (error) {
                        console.error("Error adding score: ", error);
                        alert("Could not save score. Check console.");
                        }
                    }
                    const playerName = prompt("Game Over! Enter your name:");
                    if (playerName) {
                        window.submitScore(playerName, score);
                    } else {
                        window.refreshLeaderboard();
                    }
                    const overlay = document.getElementById('leaderboard-overlay');
                    overlay.style.display = 'block';
                    canvas.addEventListener('click', (event) => {
                        const rect = canvas.getBoundingClientRect();
                        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
                        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
                        
                        
                        const btnX = x;
                        const btnY = y+height/2;
                        const btnWidth = width;
                        const btnHeight = height;

                        if (playerLives <= 0 && 
                            mouseX >= btnX && mouseX <= btnX + btnWidth &&
                            mouseY >= btnY && mouseY <= btnY + btnHeight) {
                            
                            console.log("Retry button clicked!");
                            resetGame();
                        }
                    });
                    cancelAnimationFrame(id)
                    return
                } else {
                    cancelAnimationFrame(id)
                    setTimeout(() => {
                        
                        // Reset positions here so the player sees them jump back
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        red.position.x = 12 * blocksize + blocksize / 2;
                        red.position.y = 1 * blocksize + blocksize / 2;
                        
                        // Give the player a tiny breather before the ghost attacks again
                        blinkymode = 'scatter';
                        blinkyscattercount = 0;
                        blinkylastmodechange = 0;
                        darkmode = 'scatter'
                        darkscattercount = 0
                        darklastmodechange = 0
                        winky.position.x = 19 * blocksize + blocksize / 2;
                        winky.position.y = 1 * blocksize + blocksize / 2;
                        darkmode = 'scatter';
                        dark.position.x = 15*blocksize+blocksize/2
                        dark.position.y = 1*blocksize+blocksize/2
                        // Give the player a tiny breather before the ghost attacks again
                        winkymode = 'scatter';
                        winkyscattercount = 0;
                        winkylastmodechange = 0;
                        player.angle = 0
                        lastTime = performance.now(); 
                        isResetting = false; // Unlock the game!
                        blinkytimer = 0;
                        winkytimer = 0;
                        blinkyrunninghome = false;
                        darktimer = 0
                        darkrunninghome = false
                        winkyrunninghome = false;
                        gamestate = 'normal'
                        id = requestAnimationFrame(animate);
                        
                    }, 2500);

                
                }
            }else{
                if(!winkyrunninghome){
                    texts.push(new FloatingText({
                        x: player.position.x,
                        y: player.position.y,
                        text: "+200"
                    }));
                    score+=200
                }
               
                winkyrunninghome = true
                console.log('ghost goes back to home')
            }
            
        }
        if (circleCollision(player, dark)) {
            if(darkmode!='run'&&!isResetting&&!darkrunninghome){
                gamestate = 'resetting'
                isResetting = true
                playerLives -= 1;
                updateLivesUI()
                context.fillStyle = 'white'
                context.font = '1px "Press Start 2P"';
                context.textAlign = "center"
                
                context.fillText('Loadiing font', canvas.width, canvas.height);
                if (playerLives <= 0) {
                    document.getElementById('ui-layer').hidden = true
                    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, "black");
                    gradient.addColorStop(0.3, "black");
                    gradient.addColorStop(1, "#3533cd");  

                    context.fillStyle = gradient;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = 'white'
                    context.font = '60px "Press Start 2P"';
                    context.textAlign = "center"
                    
                    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 6);

                    context.textAlign = "center"
                    context.fillStyle = '#e9cb36'
                    context.font = '35px "Press Start 2P"';
                    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 4);


                    // Button properties
                    const x = canvas.width / 2 -canvas.width*0.08, y = canvas.height / 3 -canvas.height*0.05, width = 260, height = 70, radius = 20;

                    context.beginPath();
                    context.roundRect(x, y, width, height, radius); // Draws the rounded path
                    context.fillStyle = "#422bcd";
                    context.fill();

                    // Add text
                    context.fillStyle = "white";
                    context.font = '9px "Tiny5" bold';
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText("RETRY", canvas.width / 2, canvas.height / 3);
                    
                    context.textAlign = "center"
                    context.fillStyle = '#38b6ff'
                    context.font = '35px "Press Start 2P"';
                    context.fillText("Leaderboard", canvas.width / 2, canvas.height / 9 *4);
                                        

                    window.refreshLeaderboard = async function() {
                        const list = document.getElementById("leaderboard");
                        list.innerHTML = "<li>Loading...</li>";
                        
                        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(9));
                        
                        const querySnapshot = await getDocs(q);
                        list.innerHTML = "";
                        let i =0
                        querySnapshot.forEach((doc) => {
                        i+=1
                        const data = doc.data();
                        list.innerHTML += `<li>${i}.                     ${data.name}: ${data.score}</li>`;
                        });
                    }
                    window.submitScore = async function(playerName, score) {

                        if(score === 0) return; 

                        try {
                        await addDoc(collection(db, "leaderboard"), {
                            name: playerName,
                            score: Number(score), 
                            timestamp: Date.now()
                        });
                        console.log("Score submitted successfully");
                        window.refreshLeaderboard();
                        } catch (error) {
                        console.error("Error adding score: ", error);
                        alert("Could not save score. Check console.");
                        }
                    }
                    const playerName = prompt("Game Over! Enter your name:");
                    if (playerName) {
                        window.submitScore(playerName, score);
                    } else {
                        window.refreshLeaderboard();
                    }
                    const overlay = document.getElementById('leaderboard-overlay');
                    overlay.style.display = 'block';
                    canvas.addEventListener('click', (event) => {
                        const rect = canvas.getBoundingClientRect();
                        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
                        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

                        const btnX = x;
                        const btnY = y+height/2;
                        const btnWidth = width;
                        const btnHeight = height;

                        if (playerLives <= 0 && 
                            mouseX >= btnX && mouseX <= btnX + btnWidth &&
                            mouseY >= btnY && mouseY <= btnY + btnHeight) {
                            
                            console.log("Retry button clicked!");
                            resetGame();
                        }
                    });
                    cancelAnimationFrame(id)
                    return
                } else {
                    cancelAnimationFrame(id)
                    setTimeout(() => {
                        
                        // Reset positions here so the player sees them jump back
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        red.position.x = 12 * blocksize + blocksize / 2;
                        red.position.y = 1 * blocksize + blocksize / 2;
                        
                        // Give the player a tiny breather before the ghost attacks again
                        blinkymode = 'scatter';
                        blinkyscattercount = 0;
                        blinkylastmodechange = 0;

                        winkymode = 'scatter';
                        winky.position.x = 19 * blocksize + blocksize / 2;
                        winky.position.y = 1 * blocksize + blocksize / 2;
                        
                        darkmode = 'scatter';
                        dark.position.x = 15*blocksize+blocksize/2
                        dark.position.y = 1*blocksize+blocksize/2

                        // Give the player a tiny breather before the ghost attacks again
                        darkmode = 'scatter';
                        darkscattercount = 0;
                        darklastmodechange = 0;
                        player.angle = 0
                        lastTime = performance.now(); 
                        isResetting = false; // Unlock the game!
                        blinkytimer = 0;
                        winkytimer = 0;
                        darktimer = 0
                        blinkyrunninghome = false;
                        winkyrunninghome = false;
                        darkrunninghome = false
                        gamestate = 'normal'
                        id = requestAnimationFrame(animate);
                        
                    }, 2500);

                
                }
            }else{
                if(!darkrunninghome){
                    texts.push(new FloatingText({
                        x: player.position.x,
                        y: player.position.y,
                        text: "+200"
                    }));
                    score+=200
                }
               
                darkrunninghome = true
                console.log('ghost goes back to home')
            }
            
        }

        player.update();
        winky.update()
        red.update();
        dark.update();
        for (let i = texts.length - 1; i >= 0; i--) {
            texts[i].update();

            if (texts[i].life <= 0) {
                texts.splice(i, 1);
            }
        }
        if(steroidsarr.length==0 && steroids2arr.length==0 &&!isnextleveling){
            console.log('resetting')
            idx = Math.floor(Math.random()*mapKeys.length)
            grid = maps[idx]
            isnextleveling = true
            justteleported = false
            
            ghostgrid = JSON.parse(JSON.stringify(maps2[idx]));
            winkygrid = JSON.parse(JSON.stringify(maps2[idx]));
            darkgrid = JSON.parse(JSON.stringify(maps2[idx]));
            currentLevel+=1
            wallsarr = []
            grid.forEach((row, y) => {
                row.forEach((symbol, x) => {
                    // Calculate the exact center of this tile
                    const centerX = x * blocksize + blocksize / 2;
                    const centerY = y * blocksize + blocksize / 2;

                    if (symbol === "1") {
                        wallsarr.push(new wall({
                            position: { x: centerX, y: centerY },
                            width: blocksize,
                            height: blocksize
                        }));
                    } else if (symbol === "4") {
                        steroids2arr.push(new steroids2({
                            position: { x: centerX, y: centerY }
                        }));
                    } else if (symbol === "0") {
                        steroidsarr.push(new steroids({
                            position: { x: centerX, y: centerY }
                        }));
                    }
                });
            });

            cancelAnimationFrame(id)
                    setTimeout(() => {
                        
                        // Reset positions here so the player sees them jump back
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        red.position.x = 12 * blocksize + blocksize / 2;
                        red.position.y = 1 * blocksize + blocksize / 2;
                        fps+=5
                        // Give the player a tiny breather before the ghost attacks again
                        blinkymode = 'scatter';
                        blinkyscattercount = 0;
                        blinkylastmodechange = 0;

                        winky.position.x = 19 * blocksize + blocksize / 2;
                        winky.position.y = 1 * blocksize + blocksize / 2;
                        
                        // Give the player a tiny breather before the ghost attacks again
                        winkymode = 'scatter';
                        winkyscattercount = 0;
                        winkylastmodechange = 0;

                        dark.position.x = 15*blocksize+blocksize/2
                        dark.position.y = 1*blocksize+blocksize/2
                        
                        // Give the player a tiny breather before the ghost attacks again
                        darkmode = 'scatter';
                        darkscattercount = 0;
                        darklastmodechange = 0;


                        player.angle = 0
                        lastTime = performance.now(); 
                        isnextleveling = false; // Unlock the game!
                        blinkytimer = 0;
                        winkytimer = 0
                        darktimer = 0;
                        blinkyrunninghome = false;
                        drumpslowstart = 0
                        winkyrunninghome = false;
                        darkrunninghome = false;
                        context.fillStyle = bgcolor
                        context.fillRect(0, 0, canvas.width, canvas.height)
                        id = requestAnimationFrame(animate);
                        
                    }, 2500);

        }
    }

    context.fillStyle = "white";
    context.font = 'bold 30px "Press Start 2p"';
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Centers text inside your 240x80 pause button grid
    context.fillText(
        "Pause||", 
        PAUSE_BTN.x + PAUSE_BTN.width / 2, 
        PAUSE_BTN.y + PAUSE_BTN.height / 2
    );

    // Draw Skins Image using your exact 150x150 scale dimensions
    context.drawImage(
        skinsImg, 
        SKINS_BTN.x, 
        SKINS_BTN.y, 
        SKINS_BTN.width,
        SKINS_BTN.height
    );

    justteleported = false;
}
canvas.addEventListener('click', (event) => {
    if (window.currentGameState === "INTRO") return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    // --- PAUSE BUTTON CLICK ZONE ---
    if (mouseX >= PAUSE_BTN.x-10 && mouseX <= PAUSE_BTN.x + PAUSE_BTN.width+10 &&
        mouseY >= PAUSE_BTN.y-10 && mouseY <= PAUSE_BTN.y + PAUSE_BTN.height+10) {
        
        if (paused) {
            resume();
        } else {
            pausegame();
        }
        return; // Click registered, exit out
    }

    // --- SKINS BUTTON CLICK ZONE ---
    if (gamestate === 'resetting' || gamestate === 'gameover') return;

    if (mouseX >= SKINS_BTN.x && mouseX <= SKINS_BTN.x + SKINS_BTN.width &&
        mouseY >= SKINS_BTN.y && mouseY <= SKINS_BTN.y + SKINS_BTN.height) {
        
        if (paused) {
            resume();
        } else {
            skins();
        }
    }
});
animate()
function getNextblinkyMove(startX, startY, targetX, targetY, mapArray) {
    // Scatter Mode logic
    if(blinkymode=='run' && !blinkyrunninghome){
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        let queue = [];
        for (let dir of directions) {
            if (dir.dx === -blinkylastmove.x && dir.dy === -blinkylastmove.y) {
                continue; 
            }
            let nx = startX + dir.dx;
            let ny = startY + dir.dy;

            // Portal wrap-around
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            if (ny >= 0 && ny < mapArray.length) {
                // "3" is the portal tile in your map, "1" is a wall
                if (mapArray[ny][nx] !== '1') {
                    queue.push(dir);
                }
            }
        }
        if(queue.length>0){
            if(queue.length > 0) {
                let pick = queue[Math.floor(Math.random() * queue.length)];
                return { x: pick.dx, y: pick.dy };
            }
        }
        return {x:-1*blinkylastmove.x,y:-1*blinkylastmove.y} 
    }else{
        if (blinkymode === 'scatter') {
            targetX = mapArray[0].length - 2;
            targetY = 1;
        }
        if(blinkyrunninghome){
            targetX = blinkyhome[idx][0]
            targetY = blinkyhome[idx][1]
        }
        if (startX === targetX && startY === targetY) {
            if (blinkymode === 'scatter') {
                blinkymode = 'chase'; // Instantly flip back to chase
            }
            if(blinkyrunninghome && blinkytimer==0){
                blinkymode = 'chase'
                ghostgrid[2][15] = '1'
                blinkytimer = 1
            }
            return { x: 0, y: 0 };
        }

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        let queue = [];
        let visited = Array(mapArray.length).fill().map(() => Array(mapArray[0].length).fill(false));

        // Start BFS from the ghost's current neighbors
        for (let dir of directions) {
            let nx = startX + dir.dx;
            let ny = startY + dir.dy;

            // Portal wrap-around
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            if (ny >= 0 && ny < mapArray.length) {
                // "3" is the portal tile in your map, "1" is a wall
                if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {
                    if (nx === targetX && ny === targetY) return { x: dir.dx, y: dir.dy };
                    
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny, firstX: dir.dx, firstY: dir.dy });
                }
            }
        }

        while (queue.length > 0) {
            let cell = queue.shift();

            for (let dir of directions) {
                let nx = cell.x + dir.dx;
                let ny = cell.y + dir.dy;

                // Portal wrap-around
                if (nx < 0) nx = mapArray[0].length - 1;
                else if (nx >= mapArray[0].length) nx = 0;

                if (ny >= 0 && ny < mapArray.length) {
                    if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {
                        // If we found the target, return the direction we took at the very start
                        if (nx === targetX && ny === targetY) {
                            return { x: cell.firstX, y: cell.firstY };
                        }

                        visited[ny][nx] = true;
                        queue.push({ 
                            x: nx, 
                            y: ny, 
                            firstX: cell.firstX, 
                            firstY: cell.firstY 
                        });
                    }
                }
            }
        }
        return { x: 0, y: 0 };
    }
    
}
function getNextwinkyMove(startX, startY, targetX, targetY, mapArray) {
    let dirX = 0;
    let dirY = 0;

    if (player.velocity.x > 0) dirX = 1;
    else if (player.velocity.x < 0) dirX = -1;
    else if (player.velocity.y > 0) dirY = 1;
    else if (player.velocity.y < 0) dirY = -1;

    // Start from player's grid position
    let tx = targetX;
    let ty = targetY;

    // Move up to 4 tiles ahead, stopping at walls
    for (let i = 0; i < 4; i++) {
        let nx = tx + dirX;
        let ny = ty + dirY;

        // Bounds check
        if (nx < 0 || nx >= mapArray[0].length || ny < 0 || ny >= mapArray.length) break;

        // Stop if wall
        if (mapArray[ny][nx] === '1') break;

        tx = nx;
        ty = ny;
    }

    // Final target
    targetX = tx;
    targetY = ty;

    
    if(winkymode=='run' && !winkyrunninghome){
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        let queue = [];
        for (let dir of directions) {
            if (dir.dx === -winkylastmove.x && dir.dy === -winkylastmove.y) {
                continue; 
            }
            let nx = startX + dir.dx;
            let ny = startY + dir.dy;

            // Portal wrap-around
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            if (ny >= 0 && ny < mapArray.length) {
                // "3" is the portal tile in your map, "1" is a wall
                if (mapArray[ny][nx] !== '1') {
                    queue.push(dir);
                }
            }
        }
        if(queue.length>0){
           let pick = queue[Math.floor(Math.random() * queue.length)];
            return { x: pick.dx, y: pick.dy };
        }
        return {x:-1*winkylastmove.x,y:-1*winkylastmove.y} 
    }else{
        if (winkymode === 'scatter') {
            targetX = 1;
            targetY = 1;
        }
        else if(winkyrunninghome){
            targetX = winkyhome[idx][0]
            targetY = winkyhome[idx][1]
        }
        if (startX === targetX && startY === targetY) {
            if (winkymode === 'scatter') {
                winkymode = 'chase'; // Instantly flip back to chase
            }
            if(winkyrunninghome && winkytimer==0){
                winkymode = 'chase'
                winkygrid[2][15] = '1'
                winkytimer = 1
            }
            return { x: 0, y: 0 };
        }

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        let queue = [];
        let visited = Array(mapArray.length).fill().map(() => Array(mapArray[0].length).fill(false));

        // Start BFS from the ghost's current neighbors
        for (let dir of directions) {
            let nx = startX + dir.dx;
            let ny = startY + dir.dy;

            // Portal wrap-around
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            if (ny >= 0 && ny < mapArray.length) {
                // "3" is the portal tile in your map, "1" is a wall
                if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {
                    if (nx === targetX && ny === targetY) return { x: dir.dx, y: dir.dy };
                    
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny, firstX: dir.dx, firstY: dir.dy });
                }
            }
        }

        while (queue.length > 0) {
            let cell = queue.shift();

            for (let dir of directions) {
                let nx = cell.x + dir.dx;
                let ny = cell.y + dir.dy;

                // Portal wrap-around
                if (nx < 0) nx = mapArray[0].length - 1;
                else if (nx >= mapArray[0].length) nx = 0;

                if (ny >= 0 && ny < mapArray.length) {
                    if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {
                        // If we found the target, return the direction we took at the very start
                        if (nx === targetX && ny === targetY) {
                            return { x: cell.firstX, y: cell.firstY };
                        }

                        visited[ny][nx] = true;
                        queue.push({ 
                            x: nx, 
                            y: ny, 
                            firstX: cell.firstX, 
                            firstY: cell.firstY 
                        });
                    }
                }
            }
        }
        return { x: 0, y: 0 };
    }
    
}
function getNextdarkMove(startX, startY, targetX, targetY, mapArray) {

    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];

    // =========================
    // RUN MODE (random escape)
    // =========================
    if (darkmode === 'run' && !darkrunninghome) {

        let options = [];

        for (let dir of directions) {

            // prevent instant reverse
            if (dir.dx === -darklastmove.x && dir.dy === -darklastmove.y) continue;

            let nx = startX + dir.dx;
            let ny = startY + dir.dy;

            // wrap portals
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            // bounds safety
            if (ny < 0 || ny >= mapArray.length) continue;

            if (mapArray[ny][nx] !== '1') {
                options.push(dir);
            }
        }

        if (options.length === 0) return { x: 0, y: 0 };

        const pick = options[Math.floor(Math.random() * options.length)];
        return { x: pick.dx, y: pick.dy };
    }

    // =========================
    // SCATTER OVERRIDE
    // =========================
    if (darkmode === 'scatter') {
        targetX = mapArray[0].length - 2;
        targetY = mapArray.length - 2;
    }

    // =========================
    // HOME OVERRIDE
    // =========================
    if (darkrunninghome) {
        targetX = darkhome[idx][0];
        targetY = darkhome[idx][1];
    }

    // =========================
    // HARD ARRIVAL STOP (CRITICAL FIX)
    // =========================
    if (startX === targetX && startY === targetY) {

        if (darkmode === 'scatter') {
            darkmode = 'chase';
        }
        if (darkrunninghome &&darktimer==0) {
            darkmode = 'chase';
            darktimer = 1;

            darkgrid[2][15] = '1';

        }


        return { x: 0, y: 0 };
    }

    // =========================
    // BFS (CHASE MODE)
    // =========================
    let visited = Array.from(
        { length: mapArray.length },
        () => Array(mapArray[0].length).fill(false)
    );

    let queue = [];

    // seed neighbors
    for (let dir of directions) {

        if (dir.dx === -darklastmove.x && dir.dy === -darklastmove.y) continue;

        let nx = startX + dir.dx;
        let ny = startY + dir.dy;

        // wrap
        if (nx < 0) nx = mapArray[0].length - 1;
        else if (nx >= mapArray[0].length) nx = 0;

        // bounds check (IMPORTANT FIX)
        if (ny < 0 || ny >= mapArray.length) continue;

        if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {

            if (nx === targetX && ny === targetY) {
                return { x: dir.dx, y: dir.dy };
            }

            visited[ny][nx] = true;

            queue.push({
                x: nx,
                y: ny,
                firstX: dir.dx,
                firstY: dir.dy
            });
        }
    }

    let steps = 0;
    const MAX_STEPS = 1500; // PREVENT FREEZE

    while (queue.length > 0) {

        if (++steps > MAX_STEPS) {
            console.warn("BFS stopped (overflow safety)");
            return { x: 0, y: 0 };
        }

        let cell = queue.shift();

        for (let dir of directions) {

            let nx = cell.x + dir.dx;
            let ny = cell.y + dir.dy;

            // wrap
            if (nx < 0) nx = mapArray[0].length - 1;
            else if (nx >= mapArray[0].length) nx = 0;

            // bounds check (CRITICAL)
            if (ny < 0 || ny >= mapArray.length) continue;

            if (mapArray[ny][nx] !== '1' && !visited[ny][nx]) {

                if (nx === targetX && ny === targetY) {
                    return {
                        x: cell.firstX,
                        y: cell.firstY
                    };
                }

                visited[ny][nx] = true;

                queue.push({
                    x: nx,
                    y: ny,
                    firstX: cell.firstX,
                    firstY: cell.firstY
                });
            }
        }
    }

    return { x: 0, y: 0 };
}





function resetGame() {
    resume()
    justteleported = false
    gamestate = 'normal'
    clock = 0
    drumpanger = 0
    drumpslowstart = 0
    glitchclock = 0
    isGameOver = true;
    context.fillStyle = bgcolor
    context.fillRect(0, 0, canvas.width, canvas.height)
    let mapKeys = Object.keys(maps);
    wallsarr = [];
    boundaries = []
    steroidsarr = [];   
    steroids2arr = [];  
    playerLives = 3;         
    updateLivesUI()
    idx = Math.floor(Math.random()*mapKeys.length)
    grid = maps[idx]
    
        fps = 60
        score = 0
        ghostgrid = JSON.parse(JSON.stringify(maps2[idx]));
            winkygrid = JSON.parse(JSON.stringify(maps2[idx]));
            darkgrid = JSON.parse(JSON.stringify(maps2[idx]));
            currentLevel=1
            grid.forEach((row, y) => {
                row.forEach((symbol, x) => {
                    // Calculate the exact center of this tile
                    const centerX = x * blocksize + blocksize / 2;
                    const centerY = y * blocksize + blocksize / 2;

                    if (symbol === "1") {
                        wallsarr.push(new wall({
                            position: { x: centerX, y: centerY },
                            width: blocksize,
                            height: blocksize
                        }));
                    }else if (symbol === "9") {
                        boundaries.push(new wall({
                            position: { x: centerX, y: centerY },
                            width: blocksize,
                            height: blocksize
                        }));
                    } else if (symbol === "4") {
                        steroids2arr.push(new steroids2({
                            position: { x: centerX, y: centerY }
                        }));
                    } else if (symbol === "0") {
                        steroidsarr.push(new steroids({
                            position: { x: centerX, y: centerY }
                        }));
                    }
                });
            });
                        // Reset 
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        red.position.x = blinkyhome[idx][0] * blocksize + blocksize / 2;
                        red.position.y = blinkyhome[idx][1] * blocksize + blocksize / 2;
                       
                        blinkymode = 'scatter';
                        blinkyscattercount = 0;
                        blinkylastmodechange = 0;

                        winky.position.x = winkyhome[idx][0] * blocksize + blocksize / 2;
                        winky.position.y = winkyhome[idx][1] * blocksize + blocksize / 2;
                        

                        winkymode = 'scatter';
                        winkyscattercount = 0;
                        winkylastmodechange = 0;

                        dark.position.x = darkhome[idx][0]*blocksize+blocksize/2
                        dark.position.y = darkhome[idx][1]*blocksize+blocksize/2
                        
    
                        darkmode = 'scatter';
                        darkscattercount = 0;
                        darklastmodechange = 0;


                        player.angle = 0
                        lastTime = performance.now(); 
                        blinkytimer = 0;
                        winkytimer = 0;
                        darktimer = 0;
                        blinkyrunninghome = false;
                        winkyrunninghome = false;
                        darkrunninghome = false;

    isResetting = false
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'none';
    document.getElementById('ui-layer').hidden = false
    setTimeout(() => {
        lastTime = performance.now(); // Reset
        accumulator = 1000/60;            

        isGameOver = false;        
        animate();          // 4. Start fresh
    }, 250);
}
const pauseItems = new Image();
pauseItems.src = 'ui.png';
const mutedpause = new Image();
mutedpause.src = 'ui2.png';
function pausegame(){
    gamestate = 'paused'
    cancelAnimationFrame(id)
    paused = true
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.85)");
    gradient.addColorStop(1, "rgba(54, 51, 205, 0.85)");  
    context.fillStyle = gradient;
    context.roundRect(canvas.width*0.15, canvas.height*0.1, canvas.width*0.6, canvas.height*0.8,20);
    context.fill()
    pausemusic.currentTime = 0
    pausemusic.volume = 0.02
    fadeaudio(curaudio)
    fadeinaudio(pausemusic,0.02)
    if(!mute){
        context.drawImage(
            pauseItems, 
            canvas.width*0.15, 
            canvas.height*0.12, 
            canvas.width*0.6,
            canvas.height*0.8
        );
    }else{
        context.drawImage(
            mutedpause, 
            canvas.width*0.15, 
            canvas.height*0.12, 
            canvas.width*0.6,
            canvas.height*0.8
        );
    }
}
function resume(){
    console.log('resumed')
    document.getElementById('ui-layer').hidden = false
    fadeaudio(pausemusic)
    fadeaudio(skinmusic)
    gamestate = 'normal'
    fadeinaudio(curaudio,0.2)
    lastTime = performance.now(); 
    accumulator = 1000/60;         
    paused = false 
    animate();   
}
canvas.addEventListener('click', (event) => {
//pause screen -> resume button or mute or
    if(gamestate !='paused'){
            return
        }
                        const rect = canvas.getBoundingClientRect();
                        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
                        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
                        //resume
                        if (
                            mouseX >= canvas.width*0.2 && mouseX <= canvas.width*0.5 &&
                            mouseY >= canvas.height*0.65 && mouseY <= canvas.height*0.8) {

                            resume()
                        }
                        //mute
                        if (
                            mouseX <= canvas.width*0.29 &&
                            mouseY >= canvas.height*0.3 && mouseY <= canvas.height*0.55) {
                            if(mute==false){
                                mute = true
                                const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                                gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
                                gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.85)");
                                gradient.addColorStop(1, "rgba(54, 51, 205, 0.85)");  
                                context.fillStyle = gradient;
                                context.roundRect(canvas.width*0.15, canvas.height*0.1, canvas.width*0.6, canvas.height*0.8,20);
                                context.fill()
                                context.drawImage(
                                    mutedpause, 
                                    canvas.width*0.15, 
                                    canvas.height*0.12, 
                                    canvas.width*0.6,
                                    canvas.height*0.8
                                );
                                fadeaudio(pausemusic)
                            }else{
                                mute = false
                                const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                                gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
                                gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.85)");
                                gradient.addColorStop(1, "rgba(54, 51, 205, 0.85)");  
                                context.fillStyle = gradient;
                                context.roundRect(canvas.width*0.15, canvas.height*0.1, canvas.width*0.6, canvas.height*0.8,20);
                                context.fill()
                                context.drawImage(
                                    pauseItems, 
                                    canvas.width*0.15, 
                                    canvas.height*0.12, 
                                    canvas.width*0.6,
                                    canvas.height*0.8
                                );
                                fadeinaudio(curaudio,0.2)
                            } 
                            
                        }
                        //retry
                        if (
                            mouseX >= canvas.width*0.3 && mouseX<=canvas.width*0.6&&
                            mouseY >= canvas.height*0.3 && mouseY <= canvas.height*0.55) {
                                resetGame();
                            }
                        //skins
                    });
let baseimage = new Image()
baseimage.src = 'choosing.png'
let glitchimage = new Image()
glitchimage.src = 'choosing-glitch.png'
let drumpimage = new Image()
drumpimage.src = 'choosing-drump.png'
function drawBackgroundCover(img) {
                                // Calculate scaling ratios
                                const imgRatio = img.width / img.height;
                                const canvasRatio = canvas.width / canvas.height;
                                
                                let renderWidth, renderHeight, xOffset, yOffset;

                                if (canvasRatio > imgRatio) {
                                    // Canvas is wider than the image
                                    renderWidth = canvas.width;
                                    renderHeight = canvas.width / imgRatio;
                                    xOffset = 0;
                                    yOffset = (canvas.height - renderHeight) / 2;
                                } else {
                                    // Canvas is taller than the image
                                    renderWidth = canvas.height * imgRatio;
                                    renderHeight = canvas.height;
                                    xOffset = (canvas.width - renderWidth) / 2;
                                    yOffset = 0;
                                }

                                context.drawImage(img, xOffset, yOffset, renderWidth, renderHeight);
                            }
canvas.addEventListener('click',(event)=>{
//skins page -> base charcter selection
        if(gamestate !='skins'){
            return
        }
        console.log('basescreen')
        const rect = canvas.getBoundingClientRect()
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        if (
                            mouseX >= canvas.width*0.2 && mouseX <= canvas.width*0.34 &&
                            mouseY >= canvas.height*0.35 && mouseY <= canvas.height*0.6) {
                            document.getElementById('ui-layer').hidden = true
                            drawBackgroundCover(baseimage);
                            gamestate = 'choosingbase'
                        }
        if (
                            mouseX >= canvas.width*0.404 && mouseX <= canvas.width*0.52 &&
                            mouseY >= canvas.height*0.35 && mouseY <= canvas.height*0.6) {
                            document.getElementById('ui-layer').hidden = true
                            drawBackgroundCover(glitchimage);
                            gamestate = 'choosingglitch'
                        }
        if (
                            mouseX >= canvas.width*0.558 && mouseX <= canvas.width*0.7 &&
                            mouseY >= canvas.height*0.35 && mouseY <= canvas.height*0.6) {
                            document.getElementById('ui-layer').hidden = true
                            drawBackgroundCover(drumpimage);
                            gamestate = 'choosingdrump'
                        }
    })
canvas.addEventListener('click',(event)=>{
    //choosing screen -> base -> select
    if(gamestate !='choosingbase'){
            return
        }
        const rect = canvas.getBoundingClientRect()
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        if (
                            mouseX >= canvas.width*0.6 &&
                            mouseY >= canvas.height*0.75) {
                            skin = 'base'
                            resume()
                        }
        if (
                            mouseX <= canvas.width*0.5&&
                            mouseY >= canvas.height*0.65) {
                            animate();   
                            skins()
                        }
})
canvas.addEventListener('click',(event)=>{
    //choosing screen -> base -> select
    if(gamestate !='choosingglitch'){
            return
        }
        const rect = canvas.getBoundingClientRect()
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        if (
                            mouseX >= canvas.width*0.6 &&
                            mouseY >= canvas.height*0.75) {
                            skin = 'glitch'
                            resume()
                        }
        if (
                            mouseX <= canvas.width*0.5&&
                            mouseY >= canvas.height*0.65) {
                            animate();   
                            skins()
                        }
})
canvas.addEventListener('click',(event)=>{
    //choosing screen -> base -> select
    if(gamestate !='choosingdrump'){
            return
        }
        const rect = canvas.getBoundingClientRect()
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        if (
                            mouseX >= canvas.width*0.6 &&
                            mouseY >= canvas.height*0.75) {
                            skin = 'drump'
                            resume()
                        }
        if (
                            mouseX <= canvas.width*0.5&&
                            mouseY >= canvas.height*0.65) {
                            animate();   
                            skins()
                        }
})
const skinspng = new Image()
    skinspng.src = "pause_screen_items__1_-removebg-preview.png"
function skins(){
    if(gamestate=='resetting')return
    cancelAnimationFrame(id)
    paused = true
    fadeaudio(curaudio)
    fadeinaudio(skinmusic,0.5)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    gradient.addColorStop(0.6, "rgba(54, 51, 205, 0.85)");
    gradient.addColorStop(1, "rgba(54, 51, 205, 0.85)");  
    context.fillStyle = gradient;
    context.roundRect(canvas.width*0.15, canvas.height*0.1, canvas.width*0.6, canvas.height*0.8,20);
    context.fill()
    
    context.drawImage(
        skinspng, 
        canvas.width*0.15, 
        canvas.height*0, 
        canvas.width*0.6,
        canvas.height*0.8
    );
    gamestate = 'skins'
}



function fadeaudio(a){
    const fadeinterval = setInterval(() => {
        if(a.volume-0.05>0){
            console.log('fading')
            a.volume -= 0.05
        }else{
            a.volume = 0
            a.pause()
            clearInterval(fadeinterval)
        }
        
    }, 50);
}

function fadeinaudio(a,goto){
    a.volume = 0
    const fadeinterval = setInterval(() => {
        if(a.volume+0.05<goto){
            a.volume += 0.05
        }else{
            a.volume = goto
            if(!mute)a.play()
            curaudio.muted = isPlatformMuted();
            a.muted = isPlatformMuted();
            clearInterval(fadeinterval)
        }
        
    }, 50);
}

function glitchUnstuck() {
    console.log("%c--- GLITCH UNSTUCK DIAGNOSTICS START ---", "background: #222; color: #ff00ff; font-weight: bold;");
    console.log("Player exact pixel position before teleport:", player.position.x, player.position.y);

    
    let isinwall = false;
    for (let i = 0; i < wallsarr.length; i++) {
        if (rectCircleCollision(wallsarr[i], player)) {
            isinwall = true;
            break;
        }
    }
    
    if (!isinwall) {
        console.log("Exiting early because no wall collision was detected.");
        console.log("%c--- DIAGNOSTICS END ---", "background: #222; color: #ff00ff;");
        return; 
    }

    // Convert pixel position to clean map grid coordinates
    let startX = Math.floor(player.position.x / blocksize);
    let startY = Math.floor(player.position.y / blocksize);
    console.log(`Calculated Grid Starting Point: Column X = ${startX}, Row Y = ${startY}`);
    
    if (startY < 0 || startY >= grid.length || startX < 0 || startX >= grid[0].length) {
        console.error(`CRITICAL: Starting point is completely outside the grid array bounds! Map size is ${grid[0].length}x${grid.length}`);
    }

    startX = Math.max(0, Math.min(startX, grid[0].length - 1));
    startY = Math.max(0, Math.min(startY, grid.length - 1));

    let queue = [[startX, startY]];
    let visited = new Set();
    visited.add(`${startX},${startY}`);

    const directions = [
        {x: 0, y: -1}, 
        {x: 1, y: 0},  
        {x: 0, y: 1},  
        {x: -1, y: 0}  
    ];

    let safetyLoopCap = 0;
    let destinationFound = false;

    while (queue.length > 0 && safetyLoopCap < 2000) {
        safetyLoopCap++;
        let [cx, cy] = queue.shift();
        let tileType = grid[cy][cx];

        if (tileType == '0' || tileType == '3' || tileType == '4') {
            console.log(`%cBFS Success! Found empty space at Grid Column: ${cx}, Row: ${cy}. Tile character code is: "${tileType}"`, "color: #00ff00;");
            
            player.position.x = cx * blocksize + blocksize / 2;
            player.position.y = cy * blocksize + blocksize / 2;
            console.log(`Teleporting player pixel values to: X = ${player.position.x}, Y = ${player.position.y}`);

            // Apply the temporary radius shrink safety check
            const originalRadius = player.radius;
            player.radius = blocksize / 2 - 2; 

            setTimeout(() => {
                player.radius = originalRadius;
                // Double check if resetting radius breaks things again
                let stillStuck = false;
                for (let j = 0; j < wallsarr.length; j++) {
                    if (rectCircleCollision(wallsarr[j], player)) { stillStuck = true; break; }
                }
                console.log("Post-teleport status: Is player STILL stuck after radius reset?", stillStuck);
            }, 16); 

            destinationFound = true;
            break;
        }

        for (let dir of directions) {
            let nx = cx + dir.x;
            let ny = cy + dir.y;
            let key = `${nx},${ny}`;

            if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
    if (!destinationFound) {
        console.warn(`%cBFS exhausted completely after ${safetyLoopCap} iterations without finding a legal tile!`, "color: #ffaa00;");
        console.log("Triggering hard fallback placement...");
        player.position.x = blocksize * 2 + blocksize / 2;
        player.position.y = blocksize * 2 + blocksize / 2;
    }

    console.log("%c--- GLITCH UNSTUCK DIAGNOSTICS END ---", "background: #222; color: #ff00ff; font-weight: bold;");
}