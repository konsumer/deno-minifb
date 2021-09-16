// this demonstrates using the same code in a browser or in deno
// normally you would probly import just the function that operates on canvas, and keep the platform-specfic code in a wrapper
// but I waanted to keep it all self-contained in a single file

/* global Image, Deno */

// this is a compatability layer
class CanvasUtils {
  // load more libs, if you're in deno
  constructor () {
    if ('Deno' in window) {
      this.libs = Promise.all([
        import('https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/master/mod.ts'),
        import('../mod.ts')
      ])
        .then(([canvas, minifb]) => ({ canvas, minifb }))
    }
  }

  // return a canvas
  async canvas (width, height) {
    if ('Deno' in window) {
      const libs = await this.libs
      const canvas = libs.canvas.createCanvas(width, height)
      canvas.window = new libs.minifb.MiniFB('deno minifb!', width, height)
      return canvas
    } else {
      const c = document.querySelector('canvas')
      c.width = width
      c.height = height
      return c
    }
  }

  // return an image
  async image (src) {
    if ('Deno' in window) {
      const libs = await this.libs
      return libs.canvas.loadImage(src)
    } else {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = src
      })
    }
  }

  // setup main loop
  loop (cb, canvas) {
    if ('Deno' in window) {
      setInterval(() => {
        if (canvas.window.open) {
          cb(canvas)
          canvas.window.updateWithBuffer(canvas.getRawBuffer(0, 0, canvas.width, canvas.height))
        } else {
          Deno.exit(0)
        }
      }, 1000 / 60)
    } else {
      const frame = () => {
        cb(canvas)
        window.requestAnimationFrame(frame)
      }
      window.requestAnimationFrame(frame)
    }
  }
}

// everythign below here is same code, regardless of platform

// this is a spritesheet animation-manager
class Animation {
  constructor (image, frames = [0], speed = 1000, width = 32, height = 32) {
    this.image = image
    this.playing = true
    this.speed = speed
    this.width = width
    this.height = height
    this.frame = 0

    // pre-compute image-quad top-left
    const x = image.width / width
    this.frames = frames.map(f => [(f % x) * height, Math.floor(f / x) * width])
  }

  draw (context, time, x = 0, y = 0, sx = 1, sy = 1) {
    if (this.playing) {
      this.frame = Math.floor(time / this.speed) % this.frames.length
    }
    const f = this.frames[this.frame]
    context.drawImage(this.image, f[0], f[1], this.width, this.height, x, y, this.width * sx, this.height * (sy || sx))
  }
}

const spritesheet = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAAYAgMAAACO68K2AAAACVBMVEUAAADk5+P///9QNmNfAAAA6UlEQVRIx7WTMQ4DIQwEl4gqFfWVqaJ7BXwnT6E6vhCliV+ZNaYguhQpTDOyxkhrLEBAQo7GHJECjF4eJaZURsNqa3h553nPHr7znj1W7H32WLH32TMNlo+ejzCMl0e4yIv5JPNJ5vfayyNc5Y1ozCTzO708yq0K80nm9zorf/n7U73yv/O70COLSAPIIxrNeHlM7bkRvbyq2gbZqD2/9raLR9lla7qvrY06kEf08vpaH8wnmd9pxsvrt+a++Pd0j7xWg9VefgQYrWH08s7znr3zvGePFXufPVbsffZY935GwLr38xWw7h4ft7H6qDQfww4AAAAASUVORK5CYII='

async function main () {
  const utils = new CanvasUtils()
  const image = await utils.image(spritesheet)

  // this seems required by deno-canvas, not sure why
  image.height = 24
  image.width = 384

  const denoLogo = new Animation(image, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 150, 24, 24)
  const canvas = await utils.canvas(800, 800)
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false
  utils.loop(() => denoLogo.draw(context, Date.now(), 0, 0, 34, 34), canvas)
}
main()
