const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

context.fillStyle = "black"
context.fillRect(0, 0, canvas.width, canvas.height)

class Player{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.rotation = 0
    }
    draw(){
        context.save()

        context.translate(this.position.x, this.position.y)
        context.rotate(this.rotation)
        context.translate(-this.position.x, -this.position.y)
        context.beginPath()
        context.arc(this.position.x, this.position.y, 5, 0, Math.PI*2, false)
        context.fillStyle = "red"
        context.fill()
        context.closePath()
        //context.fillStyle = "red"
        //context.fillRect(this.position.x, this.position.y, 100, 100)
        context.beginPath()
        context.moveTo(this.position.x+30, this.position.y)
        context.lineTo(this.position.x-10, this.position.y-10)
        context.lineTo(this.position.x-10, this.position.y+10)
        context.closePath()

        context.strokeStyle = "white"
        context.stroke()
        context.restore()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
          {
            x: this.position.x + cos * 30 - sin * 0,
            y: this.position.y + sin * 30 + cos * 0,
          },
          {
            x: this.position.x + cos * -10 - sin * 10,
            y: this.position.y + sin * -10 + cos * 10,
          },
          {
            x: this.position.x + cos * -10 - sin * -10,
            y: this.position.y + sin * -10 + cos * -10,
          },
        ]
      }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.radius = 5
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);

        context.closePath()
        context.fillStyle = projectileColor //bullet color
        context.fill()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Asteroid {
    constructor({ position, velocity, radius}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);

        context.closePath()
        context.strokeStyle = asteroidStroke //asteroid color
        context.stroke()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player({
    position: { x: canvas.width/2, y: canvas.height/2 },
    velocity: { x: 0, y: 0 },
})

const keys = {
    w: {
        pressed: false,
    },
   a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

const projectileColor = "cyan"
let asteroidStroke = "cyan"
const SPEED = 3 // suggestion 3 but if it 10 or more the asteroids will get deleted when u touch them while pressing w
const ROTATIONAL_SPEED = 0.05 // suggestion 0.05 but if over 1 it will bounce away asteroids and make the asteroids a random color
const FRICTION = 0.97 //suggestion 0.97
const PROJECTILE_SPEED = 3 //suggestion 3

player.draw()

const projectiles = []
const asteroids = []

const intervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let x, y
    let radius = 50 * Math.random() + 10

    switch (index) {
    case 0: //left
        x = 0 - radius
        y = Math.random() * canvas.height
        vx = 1
        vy = 0
        break
    case 1: //bottom
        x = Math.random() * canvas.width
        y = canvas.height + radius
        vx = 0
        vy = -1
        break
    case 2: //right
        x = canvas.width + radius
        y = Math.random() * canvas.width
        vx = -1
        vy = 0
        break
    case 3: //top
        x = Math.random() * canvas.width
        y = 0 - radius
        vx = 0
        vy = 1
        break
    }
    asteroids.push(
        new Asteroid({
            position: {
                x: x,
                y: y,
            },
            velocity: {
                x: vx,
                y: vy,
            },
            radius
         }))
         console.log(asteroids)}, 3000)//how many milli seconds per asteroid(recomended 3000)

function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x
    const yDifference = circle2.position.y - circle1.position.y

    const distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference)

    if (distance <= circle1.radius + circle2.radius){
        
        return true
    }

    return false
}

function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
      let start = triangle[i]
      let end = triangle[(i + 1) % 3]
  
      let dx = end.x - start.x
      let dy = end.y - start.y
      let length = Math.sqrt(dx * dx + dy * dy)
  
      let dot =
        ((circle.position.x - start.x) * dx +
          (circle.position.y - start.y) * dy) /
        Math.pow(length, 2)
  
      let closestX = start.x + dot * dx
      let closestY = start.y + dot * dy
  
      if (!isPointOnLineSegment(closestX, closestY, start, end)) {
        closestX = closestX < start.x ? start.x : end.x
        closestY = closestY < start.y ? start.y : end.y
      }
  
      dx = closestX - circle.position.x
      dy = closestY - circle.position.y
  
      let distance = Math.sqrt(dx * dx + dy * dy)
  
      if (distance <= circle.radius) {
        return true
      }
    }
  
    // No collision
    return false
  }
  
  function isPointOnLineSegment(x, y, start, end) {
    return (
      x >= Math.min(start.x, end.x) &&
      x <= Math.max(start.x, end.x) &&
      y >= Math.min(start.y, end.y) &&
      y <= Math.max(start.y, end.y)
    )
  }

function animate(){
    const animationId = window.requestAnimationFrame(animate)
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    player.update()

    for(let i = projectiles.length-1; i >= 0; i--){
        const projectile = projectiles[i]
        projectile.update()


        //projectile trash can
        if(projectile.position.x + projectile.radius < 0 || projectile.position.x - projectile.radius > canvas.width || projectile.position.y - projectile.radius > canvas.height || projectile.position.y + projectile.radius < 0){
            projectiles.splice(i, 1)
        }
    }
    //asteroids management

    for(let i = asteroids.length-1; i >= 0; i--){
        const asteroid = asteroids[i]
        asteroid.update()
        //gameover
        if (SPEED >= 10 && keys.w.pressed && circleTriangleCollision(asteroid, player.getVertices())){
            
            asteroids.splice(i, 1)
        }
        else if (ROTATIONAL_SPEED >= 1 && keys.a.pressed && circleTriangleCollision(asteroid, player.getVertices())){
            asteroid.velocity.x = Math.cos(135) * SPEED
            asteroid.velocity.y = Math.sin(135) * SPEED
            switch(Math.floor(Math.random() * 10)){
                case 0:
                    asteroidStroke = "white"
                    break;
                case 1:
                    asteroidStroke = "red"
                    break;
                case 2:
                    asteroidStroke = "orange"
                    break;
                case 3:
                    asteroidStroke = "yellow"
                    break;
                case 4:
                    asteroidStroke = "green"
                    break;
                case 5:
                    asteroidStroke = "cyan"
                    break;
                case 6:
                    asteroidStroke = "blue"
                    break;
                case 7:
                    asteroidStroke = "purple"
                    break;
                case 8:
                    asteroidStroke = "pink"
                    break;
                case 9:
                    asteroidStroke = "lime"
                    break;
            }
        }
        else if (ROTATIONAL_SPEED >= 1 && keys.d.pressed && circleTriangleCollision(asteroid, player.getVertices())){
            asteroid.velocity.x = Math.cos(45) * SPEED
            asteroid.velocity.y = Math.sin(45) * SPEED
            switch(Math.floor(Math.random() * 10)){
                case 0:
                    asteroidStroke = "white"
                    break;
                case 1:
                    asteroidStroke = "red"
                    break;
                case 2:
                    asteroidStroke = "orange"
                    break;
                case 3:
                    asteroidStroke = "yellow"
                    break;
                case 4:
                    asteroidStroke = "green"
                    break;
                case 5:
                    asteroidStroke = "cyan"
                    break;
                case 6:
                    asteroidStroke = "blue"
                    break;
                case 7:
                    asteroidStroke = "purple"
                    break;
                case 8:
                    asteroidStroke = "pink"
                    break;
                case 9:
                    asteroidStroke = "lime"
                    break;
            }
            
        }
        else if (circleTriangleCollision(asteroid, player.getVertices())){
            console.log("GAME OVER")
            window.cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            const gameover = "Game Over"
            const playagain = "refresh to play again"
            context.font = "bold 100px sans-serif"
            context.fillStyle = "red"
            context.fillText(gameover, canvas.width/2, canvas.height/2)
            context.font = "italic 25px sans-serif"
            const randomx = Math.round(Math.random() * 30 + 10)
            context.fillText(playagain, player.position.x - randomx, player.position.y + 30)
        }
        

        //asteroids trash can
        //____
    if(asteroid.position.x + asteroid.radius < 0 || asteroid.position.x - asteroid.radius > canvas.width || asteroid.position.y - asteroid.radius > canvas.height || asteroid.position.y + asteroid.radius < 0){
        asteroids.splice(i, 1)
    }
    for(let j = projectiles.length-1; j >= 0; j--){
        const projectile = projectiles[j]
        if (circleCollision(asteroid, projectile)){
            asteroids.splice(i, 1)
            projectiles.splice(j, 1)
        }
    }
    }
    

    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED
        player.velocity.y = Math.sin(player.rotation) * SPEED //speed of aircraft
    }else if (!keys.w.pressed) {
        player.velocity.x *= FRICTION
        player.velocity.y *= FRICTION //friction
    }

    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED //rotate
    else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED
}

animate()

window.addEventListener("keydown", (event)=>{
    switch(event.code) {
        case "KeyW":
            
            keys.w.pressed = true
            break

        case "KeyA":
            
            keys.a.pressed = true
            break

        case "KeyD":
            
            keys.d.pressed = true
            break
        case "Space":
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x+Math.cos(player.rotation) * 30,
                    y: player.position.y+Math.sin(player.rotation) * 30,
                },
                velocity: {
                    x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                    y: Math.sin(player.rotation) * PROJECTILE_SPEED, //ammo speed
                },
            }))
            
            

            break
    }
})

window.addEventListener("keyup", (event)=>{
    switch(event.code) {
        case "KeyW":
            
            keys.w.pressed = false
            break

        case "KeyA":
            
            keys.a.pressed = false
            break

        case "KeyD":
            
            keys.d.pressed = false
            break
    }
})