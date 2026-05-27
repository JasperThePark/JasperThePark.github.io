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
let lastshiftx = Math.cos(this.angle) * (50 * 0.2);
let lastshifty = Math.sin(this.angle) * (50 * 0.2);
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
        let shiftX = lastshiftx
        let shiftY = lastshifty
        if(state!='start'){
            shiftX = Math.cos(this.angle) * (r * 0.2);
            shiftY = Math.sin(this.angle) * (r * 0.2);
        }
        lastshiftx = shiftX
        lastshifty = shiftY
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
        
        this.draw();
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

        this.draw();
    }
}
let startmusic = new Audio('startmusic.mp3')
let camerashutter = new Audio('camerashutter.mp3')
startmusic.volume = 0.8
camerashutter.volume = 0.9
const player = new pacMan({
    position: { x: canvas.width / 2, y: canvas.height -60 },
    velocity: { x: 0, y: 0 },
    radius: 40, 
});
const press = new texteff(canvas.width/2-180,50,2000,400,1,'Press Any Key To Play Music')
const title = new texteff2(canvas.width-550,canvas.height/3,2000,400,0,'Rat Escape')
const play = new texteff3(canvas.width-370,canvas.height/3+100,2000,400,0,'‣START')
let click = new Audio('clcik.mp3')
click.currentTime = 1
canvas.addEventListener('click', (event) => {
    if(state!='start')return
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    if (mouseX >= canvas.width-370&&
            mouseX <= canvas.width-370+343 &&
            mouseY >= canvas.height/3+30&& 
            mouseY <= canvas.height/3+30+82) {
        console.log("Start text clicked! Initiating game...");
        startmusic.pause()
        click.play()
        state = 'begin'
    }
});
document.addEventListener('keydown', () => {
    startmusic.play().catch(e => console.log('press to start'));
}, { once: true });
const red = new ghost({
    position: {
        x: canvas.width - blocksize * 5, 
        y: canvas.height -60
    },
    velocity: { x: 0, y: 0 },
    name: 'blinky',
});
let id;
let laststate = 'intro'
let cameraEffectTimer = 0;
let fadeToBlackOpacity = 0; // transition cause idk how to fade whole screen
function animate() {
    if (cameraEffectTimer > 0) {
        cameraEffectTimer-=3;
        context.translate(-20, -12);
        context.globalAlpha = 1/(cameraEffectTimer/4); 
        context.scale(1.02, 1.02); 
    }
    if(cameraEffectTimer<0){
        context.globalAlpha = 1
        cameraEffectTimer = 0
    }
    context.fillStyle = bgcolor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    press.draw()
    title.draw()
    play.draw()
    player.update();
    red.update();
    if(red.position.x>-200 && state=='intro' ){
        player.velocity.x=-5
        red.velocity.x=-5
    }else if(state!='start' && state!='begin'){
        state = 'payback'
        console.log('peak')
        red.scared = true
        red.velocity.x=9
        player.velocity.x = 10
        player.velocity.y = 5
    }if(state!=laststate&&state=='payback'){
        camerashutter.currentTime = 0.5
        camerashutter.play()
        console.log('launched')
        player.position.y = -290
        player.position.x = -600
    }
    if(state=='payback'&&red.position.x>=canvas.width/3){
        player.velocity.x = 0
        player.velocity.y = 0
        red.velocity.y = 0
        red.velocity.x = 0
        state = 'start'
        console.log('HHEHEHEHE')
        cameraEffectTimer = 13;
    }
    if(state=='start'){
        play.opacity+=0.01
        title.opacity+=0.01
    }
    laststate = state
    if (state === 'begin') {
        fadeToBlackOpacity += 0.05; 
        if (fadeToBlackOpacity > 1) fadeToBlackOpacity = 1; 
    }


    if (fadeToBlackOpacity > 0) {
        context.fillStyle = `rgba(0, 0, 0, ${fadeToBlackOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
        
    id = requestAnimationFrame(animate);
    if(fadeToBlackOpacity>=1){
        context.setTransform(1, 0, 0, 1, 0, 0);
        cancelAnimationFrame(id)
        window.currentGameState = 'game'
    }
}

animate();