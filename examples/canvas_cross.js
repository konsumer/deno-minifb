// this demonstrates using the same code in a browser or in deno
// normally you would probly import just the function that operates on canvas or whatever
// but I waanted to keep it all self-contained in a single file

// this is a spritesheet animation-manager
class Animation {
  constructor (image, frames = [0], speed = 1000, width = 32, height = 32) {
    if (typeof image === 'string') {
      this.image = new Image()
      this.image.src = image
    } else {
      this.image = image
    }
    this.playing = true
    this.speed = speed
    this.width = width
    this.height = height
    this.frame = 0

    // pre-compute image-quad top-left
    const x = image.width / width
    this.frames = frames.map(f => [(f % x) * height, Math.floor(f / x) * width])
  }

  draw (context, time, x, y, sx = 1, sy = 1) {
    if (this.playing) {
      this.frame = Math.floor(time / this.speed) % this.frames.length
    }
    const f = this.frames[this.frame]
    context.drawImage(this.image, f[0], f[1], this.width, this.height, x, y, this.width * sx, this.height * (sy || sx))
  }
}

const spritesheet = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAAYAgMAAACO68K2AAAACVBMVEUAAADk5+P///9QNmNfAAAA6UlEQVRIx7WTMQ4DIQwEl4gqFfWVqaJ7BXwnT6E6vhCliV+ZNaYguhQpTDOyxkhrLEBAQo7GHJECjF4eJaZURsNqa3h553nPHr7znj1W7H32WLH32TMNlo+ejzCMl0e4yIv5JPNJ5vfayyNc5Y1ozCTzO708yq0K80nm9zorf/n7U73yv/O70COLSAPIIxrNeHlM7bkRvbyq2gbZqD2/9raLR9lla7qvrY06kEf08vpaH8wnmd9pxsvrt+a++Pd0j7xWg9VefgQYrWH08s7znr3zvGePFXufPVbsffZY935GwLr38xWw7h4ft7H6qDQfww4AAAAASUVORK5CYII='

let denoLogo

const currentScene = {
  async setup (canvas) {
    let loadImage
    if ('Deno' in window) {
      loadImage = (await import('https://deno.land/x/canvas/mod.ts')).loadImage
    } else {
      loadImage = src => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = src
      })
    }
    const image = await loadImage(spritesheet)
    denoLogo = new Animation(image, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 150, 24, 24)
  },

  draw (time, ctx) {
    denoLogo.draw(ctx, time, 0, 0, 20, 20)
  }
}

async function mainDeno () {
  const { createCanvas } = await import('https://deno.land/x/canvas/mod.ts')
  const { MiniFB } = await import('../mod.ts')
  const canvas = createCanvas(400, 400)
  const ctx = canvas.getContext('2d')
  const win = new MiniFB('minifb!', 400, 400)

  setInterval(() => {
    if (win.open) {
      currentScene.draw(Date.now(), ctx)
      win.updateWithBuffer(canvas.getRawBuffer(0, 0, 400, 400))
      // win.update()
    } else {
      Deno.exit(0)
    }
  }, 1000 / 60)
}

async function mainBrowser () {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  ctx.webkitImageSmoothingEnabled = false
  ctx.mozImageSmoothingEnabled = false
  ctx.imageSmoothingEnabled = false

  const frame = () => {
    currentScene.draw(Date.now(), ctx)
    window.requestAnimationFrame(frame)
  }

  await currentScene.setup(canvas)
  window.requestAnimationFrame(frame)
}

if ('Deno' in window) {
  mainDeno()
} else {
  mainBrowser()
}
