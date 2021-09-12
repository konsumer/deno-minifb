import { Window } from "../mod.ts"
import { createCanvas } from "https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/dc0969b15f1e30a866a6bf6bed8b8a4b7393f925/mod.ts"

const width = 500, height = 500

const canvas = createCanvas(width, height)
const ctx = canvas.getContext("2d")
const window = new Window("My Window", width, height)

// https://stackoverflow.com/a/45140101/12101923
function strokeStar(x: number, y: number, r: number, n: number, inset: number) {
  ctx.save()
  ctx.beginPath()
  ctx.translate(x, y)
  ctx.moveTo(0, 0 - r)
  for (let i = 0; i < n; i++) {
    ctx.rotate(Math.PI / n)
    ctx.lineTo(0, 0 - (r * inset))
    ctx.rotate(Math.PI / n)
    ctx.lineTo(0, 0 - r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

ctx.fillStyle = 'yellow'
const r = (width - 20) / 2
strokeStar(r + 10, r + 10, r, 5, 0.5)

window.updateWithBuffer(canvas.getRawBuffer(0, 0, width, height))

setInterval(() => {
  if (window.isOpen) {
    window.update()
  } else {
    Deno.exit(0)
  }
}, 1000 / 60)
