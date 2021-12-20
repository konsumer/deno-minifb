import { MiniFB } from "../mod.ts";

const win = new MiniFB("Hello World", 800, 600);
const buffer = new Uint8Array(win.width * win.height * 4);

const loop = setInterval(() => {
  if (win.open) win.updateWithBuffer(buffer);
  else clearInterval(loop);
}, 1000 / 60);
