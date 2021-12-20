import { Menu, MiniFB } from "../mod.ts";

const win = new MiniFB("Hello World", 800, 600);

// TODO: Causes heap corruption
// const menu = new Menu("Menu");
// menu.addItem("Item 1", 1);
// menu.addItem("Item 2", 2);
// menu.addSeparator();
// const submenu = new Menu("Sub Menu");
// submenu.addItem("Item 3", 3);
// menu.addSubMenu("Submenu", submenu);
// win.addMenu(menu);

const loop = setInterval(() => {
  if (win.open) {
    // TODO: Updating too often causes heap corruption as well...
    // win.setTitle(`Hello World | Mouse Pos: ${win.getMousePos()?.join(", ")}`);
    win.update();
  } else clearInterval(loop);
}, 1000 / 60);
