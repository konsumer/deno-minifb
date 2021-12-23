import { MfbWindow } from "./mod.ts";

const window = new MfbWindow(
  "Hello Window",
  800,
  600,
);

const buffer = new Uint8Array(800 * 600 * 4);

do {
  if (!window.update(buffer, 800, 600)) break;
} while (window.waitSync());
