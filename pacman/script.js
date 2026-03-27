const canvas = document.getElementById("gameCanvas")
const context = canvas.getContext("2d")
var bgcolor = "black"
canvas.width = 1528
let texts = []
canvas.height = 698
let isnextleveling = false
console.log(canvas.width,canvas.height)
let score = 0
let steroidsarr = []
let steroids2arr = []
let wallsarr = []
let holesarr = []
let pacmanspeed = 1
let currentLevel = 1
let playerLives = 3
let mouthopen = true
let mouthOpenness =  Math.abs(Math.sin(this.frame)) * this.radius*pacmanspeed
let blocksize = 36
console.log((canvas.width/4*3)/2-blocksize*4.5)
console.log(blocksize/2)
let grid = []
let isResetting = false;
let blinkymode = 'scatter'
let blinkyscattercount = 0
let blinkylastmodechange = 0
let blinkyisscattering = false
let blinkylastmove = 0
let blinkyrunningtime = 0
let blinkyrunninghome = false
const blinkyhome = { x: 12, y: 1}
let blinkytimer = 0


let winkymode = 'scatter'
let winkyscattercount = 0
let winkylastmodechange = 0
let winkyisscattering = false
let winkylastmove = 0
let winkyrunningtime = 0
let winkyrunninghome = false
const winkyhome = { x: 19, y: 1}
let winkytimer = 0


let id = ''
const maps = {
    0:["1111111111111111111111111111111".split(""),
       "1000000000015555555510000000001".split(""),
       "1011111111011115111110111111101".split(""),
       "1014000000000000000000000000101".split(""),
       "1010101111111110111111111010101".split(""),
       "1010101000000000100000041010101".split(""),
       "1000101011111010101111101010001".split(""),
       "1010101000000010101000101010101".split(""),
       "1010101011111010001010101010101".split(""),
       "3010000000001010100010101010103".split(""),
       "1010101011101010101010101010101".split(""),
       "1010101011101010101010101010101".split(""),
       "1000101011101010000010101010001".split(""),
       "1010101000041010101010101010101".split(""),
       "1010101111111010101010101010101".split(""),
       "1010000000000000000000000004101".split(""),
       "1011110111111110111111110111101".split(""),
       "1400000000000000000000000000001".split(""),
       "1111111111111111111111111111111".split("")],
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
}
const mapKeys = Object.keys(maps)
console.log(mapKeys)
x = Math.floor(Math.random()*mapKeys.length)
grid = maps[x]
ghostgrid = JSON.parse(JSON.stringify(maps2[x]));
winkygrid = JSON.parse(JSON.stringify(maps2[x]));
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
class FloatingText {
    constructor({ x, y, text }) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.alpha = 1;        // opacity (1 = full, 0 = invisible)
        this.life = 60;        // frames (60 ≈ 1 second at 60 FPS)
    }

    draw() {
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = "white";
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
        this.radius = 24; // Scaled up even more for visibility
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
        context.fillStyle = this.color6; // Inner Ear Color (Pink/Lighter)

        // Left Inner Ear (Tucked in)
        context.beginPath();
        context.moveTo(-r * 0.75, -r * 0.4);   // Moved inward from -0.9, -0.2
        context.lineTo(-r * 0.75, -r * 1.3);   // Pulled down from -1.6
        context.lineTo(-r * 0.25, -r * 0.75);  // Moved inward from -0.1, -0.8
        context.fill();

        // Right Inner Ear (Tucked in)
        context.beginPath();
        context.moveTo(r * 0.75, -r * 0.4);    // Moved inward from 0.9, -0.2
        context.lineTo(r * 0.75, -r * 1.3);    // Pulled down from -1.6
        context.lineTo(r * 0.25, -r * 0.75);   // Moved inward from 0.1, -0.8
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

        // 3. THE EARS (Increased size multipliers)
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
class steroids2{
    constructor({ position}){
        this.position = position
        this.radius = 14
    }
    draw() {
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
const mouseImg = new Image();
mouseImg.src = 'mouse.png';
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
        if((blinkymode!='run')&&(winkymode!='run')){
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
        }else{
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
        x: 12 * blocksize + blocksize / 2, // 1 * 36 + 18 = 54
        y: 1 * blocksize + blocksize / 2  // 1 * 36 + 18 = 54
    },
    velocity: { x: 0, y: 0 },
    name:'blinky',
});
const winky = new ghost({
    position: {
        x: 19 * blocksize + blocksize / 2, // 1 * 36 + 18 = 54
        y: 1 * blocksize + blocksize / 2  // 1 * 36 + 18 = 54
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
let desiredVelocity = { x: 0, y: 0 };

addEventListener("keydown", ({ key }) => {
    switch (key.toLowerCase()) {
        case 'w': desiredVelocity = { x: 0, y: -4 }; break;
        case 'a': desiredVelocity = { x: -4, y: 0 }; break;
        case 's': desiredVelocity = { x: 0, y: 4 }; break;
        case 'd': desiredVelocity = { x: 4, y: 0 }; break;
    }
});
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
const MOVE_INTERVAL = 1000/fps;

function animate(currentTime) {
    requestAnimationFrame(animate);
    if(isResetting)return
    if(isnextleveling)return
    if (!lastTime) {
        lastTime = currentTime;
        return;
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    accumulator += deltaTime;

    while (accumulator >= MOVE_INTERVAL) {
        accumulator -= MOVE_INTERVAL;
        
        if(blinkytimer>0){
            console.log(ghostgrid[2][15])
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
                    console.log('scatter')
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
                blinkyrunningtime = -1
            }
            blinkyrunningtime+=1
        }



        if(winkytimer>0){
            console.log(winkygrid[2][15])
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
                    console.log('scatter')
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
                winkyrunningtime = -1
            }
            winkyrunningtime+=1
        }

        document.getElementById('points').innerText = `Points: ${score}`
        document.getElementById('levels').innerText = `Level: ${currentLevel}`
        updateLivesUI()
        context.fillStyle = bgcolor
        context.fillRect(0, 0, canvas.width, canvas.height)
        for (let i = wallsarr.length - 1; i >= 0; i--) {
            wallsarr[i].draw()
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
                score+=100
                if(!blinkyrunninghome && blinkytimer==0){
                    blinkymode = 'run'
                    blinkyrunningtime = 0
                    console.log('collected')
                }
                if(!winkyrunninghome && winkytimer==0){
                    winkymode = 'run'
                    winkyrunningtime = 0
                    console.log('collected')
                }

                steroids2arr.splice(i,1)
            }
        }

        // 1. TURNING LOGIC (Check if we CAN turn)
        let canTurn = true;
        const desiredPacman = {
            position: {
                x: player.position.x + desiredVelocity.x,
                y: player.position.y + desiredVelocity.y
            },
            radius: player.radius
        };

        for (let i = 0; i < wallsarr.length; i++) {
            if (rectCircleCollision(wallsarr[i], desiredPacman)) {
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
            let ghostSpeed = 3.5;
            red.velocity.x = nextMove.x * ghostSpeed;
            red.velocity.y = nextMove.y * ghostSpeed;
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
            let ghostSpeed = 2.8;
            winky.velocity.x = nextMove.x * ghostSpeed;
            winky.velocity.y = nextMove.y * ghostSpeed;
        }


        if (circleCollision(player, red)) {
            if(blinkymode!='run' &&!isResetting){
                isResetting = true
                console.log(blinkymode)
                playerLives -= 1;
                updateLivesUI()
                if (playerLives <= 0) {
                    alert("Game Over! Final Score: " + score);
                    cancelAnimationFrame(id)
                } else {
                    cancelAnimationFrame(id)
                    setTimeout(() => {
                        
                        // Reset positions here so the player sees them jump back
                        player.position.x = blocksize - 16;
                        player.position.y = canvas.height / 2 - 8;
                        player.velocity = { x: 0, y: 0 };
                        desiredVelocity = { x: 0, y: 0 };
                        
                        // Reset Blinky's position
                        red.position.x = 12 * blocksize + blocksize / 2;
                        red.position.y = 1 * blocksize + blocksize / 2;
                        
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
                        player.angle = 0
                        lastTime = performance.now(); 
                        blinkytimer = 0;
                        winkytimer = 0;
                        blinkyrunninghome = false;
                        winkyrunninghome = false;
                        isResetting = false; // Unlock the game!
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
            if(winkymode!='run'&&!isResetting){
                isResetting = true
                console.log(winkymode)
                playerLives -= 1;
                updateLivesUI()
                
                if (playerLives <= 0) {
                    alert("Game Over! Final Score: " + score);
                    cancelAnimationFrame(id)
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

                        winky.position.x = 19 * blocksize + blocksize / 2;
                        winky.position.y = 1 * blocksize + blocksize / 2;
                        
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
                        winkyrunninghome = false;
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
        player.update();
        winky.update()
        red.update();
        for (let i = texts.length - 1; i >= 0; i--) {
            texts[i].update();

            if (texts[i].life <= 0) {
                texts.splice(i, 1);
            }
        }
        if(steroidsarr.length==0 && steroids2arr.length==0 &&!isnextleveling){
            console.log('resetting')
            x = Math.floor(Math.random()*mapKeys.length)
            grid = maps[x]
            isnextleveling = true
            fps+=10
            ghostgrid = JSON.parse(JSON.stringify(maps2[x]));
            winkygrid = JSON.parse(JSON.stringify(maps2[x]));
            currentLevel+=1
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
                        player.angle = 0
                        lastTime = performance.now(); 
                        isnextleveling = false; // Unlock the game!
                        blinkytimer = 0;
                        winkytimer = 0;
                        blinkyrunninghome = false;
                        winkyrunninghome = false;
                        id = requestAnimationFrame(animate);
                        
                    }, 2500);

        }
    }
}

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
            targetX = blinkyhome.x
            targetY = blinkyhome.y 
        }
        if (startX === targetX && startY === targetY) {
            if (blinkymode === 'scatter') {
                blinkymode = 'chase'; // Instantly flip back to chase
            }
            if(blinkyrunninghome && blinkytimer==0){
                blinkymode = 'chase'
                ghostgrid[2][15] = '1'
                console.log(ghostgrid[2][15])
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
            targetX = winkyhome.x
            targetY = winkyhome.y 
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