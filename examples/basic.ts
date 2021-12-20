import { Menu, MiniFB } from "../mod.ts";

const win = new MiniFB("Hello World", 800, 600);

const menu = new Menu("Menu");
win.addMenu(menu);

const loop = setInterval(() => {
  if (win.open) win.update();
  else clearInterval(loop);
}, 1000 / 60);
