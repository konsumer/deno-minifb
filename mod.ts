let path = Deno.env.get("DENO_MINIFB_LOCATION") ?? "";

if (path === "") {
  if (Deno.build.os === "linux") {
    path = "./target/debug/libdeno_minifb.so";
  } else if (Deno.build.os === "windows") {
    path = "./target/debug/deno_minifb.dll";
  } else if (Deno.build.os === "darwin") {
    path = "./target/debug/libdeno_minifb.dylib";
  } else throw new Error(`Unsupported OS: ${Deno.build.os}`);
}

const lib = Deno.dlopen(path, {
  get_last_error: {
    parameters: [],
    result: "pointer",
  },

  window_new: {
    parameters: ["pointer", "pointer", "usize", "usize"],
    result: "u8",
  },

  window_set_title: {
    parameters: ["u32", "pointer"],
    result: "u8",
  },

  window_topmost: {
    parameters: ["u32", "u8"],
    result: "u8",
  },

  window_set_cursor_visibility: {
    parameters: ["u32", "u8"],
    result: "u8",
  },

  window_set_background_color: {
    parameters: ["u32", "u8", "u8", "u8"],
    result: "u8",
  },

  window_set_position: {
    parameters: ["u32", "isize", "isize"],
    result: "u8",
  },

  window_set_key_repeat_delay: {
    parameters: ["u32", "f32"],
    result: "u8",
  },

  window_set_key_repeat_rate: {
    parameters: ["u32", "f32"],
    result: "u8",
  },

  window_close: {
    parameters: ["u32"],
    result: "u8",
  },

  window_is_open: {
    parameters: ["u32", "pointer"],
    result: "u8",
  },

  window_is_active: {
    parameters: ["u32", "pointer"],
    result: "u8",
  },

  window_limit_update_rate: {
    parameters: ["u32", "u64"],
    result: "u8",
  },

  window_update_with_buffer: {
    parameters: ["u32", "pointer", "usize", "usize"],
    result: "u8",
  },

  window_update: {
    parameters: ["u32"],
    result: "u8",
  },
});

const encode = (str: string): Uint8Array => (Deno as any).core.encode(str);

const cstr = (str: string) => {
  const buf = new Uint8Array(str.length + 1);
  buf.set(encode(str));
  return buf;
};

function unwrap(result: unknown) {
  if (result === 0) {
    const lastErrorPtr = lib.symbols.get_last_error() as Deno.UnsafePointer;
    if (lastErrorPtr.value === 0n) return;
    const lastError = new Deno.UnsafePointerView(lastErrorPtr).getCString();
    throw new Error(lastError);
  }
}

export class MiniFB {
  #id = 0;

  constructor(
    title: string,
    public width: number,
    public height: number,
  ) {
    const idPtr = new Uint32Array(1);
    unwrap(lib.symbols.window_new(
      idPtr,
      cstr(title),
      width,
      height,
    ));
    this.#id = idPtr[0];
  }

  setTitle(value: string) {
    unwrap(lib.symbols.window_set_title(this.#id, cstr(value)));
  }

  topmost(topmost: boolean) {
    unwrap(lib.symbols.window_topmost(this.#id, topmost ? 1 : 0));
  }

  setCursorVisibility(visible: boolean) {
    unwrap(lib.symbols.window_set_cursor_visibility(this.#id, visible ? 1 : 0));
  }

  setBackgroundColor(r: number, g: number, b: number) {
    unwrap(lib.symbols.window_set_background_color(this.#id, r, g, b));
  }

  setPosition(x: number, y: number) {
    unwrap(lib.symbols.window_set_position(this.#id, x, y));
  }

  setKeyRepeatDelay(delay: number) {
    unwrap(lib.symbols.window_set_key_repeat_delay(this.#id, delay));
  }

  setKeyRepeatRate(rate: number) {
    unwrap(lib.symbols.window_set_key_repeat_rate(this.#id, rate));
  }

  /**
   * Limits the Window's update rate to the given number of microeconds, or 0 to disable.
   *
   * @param micros Microseconds to limit the update rate to
   */
  limitUpdateRate(micros: number) {
    unwrap(lib.symbols.window_limit_update_rate(this.#id, micros));
  }

  /**
   * Returns true if the Window is open.
   */
  get open() {
    const result = new Uint8Array(1);
    unwrap(lib.symbols.window_is_open(this.#id, result));
    return result[0] === 1;
  }

  /**
   * Returns true if the Window is active.
   */
  get active() {
    const result = new Uint8Array(1);
    unwrap(lib.symbols.window_is_active(this.#id, result));
    return result[0] === 1;
  }

  /**
   * @param buffer Frame Buffer containing RGBA data
   * @param width Width of the buffer, defaults to the Window's width
   * @param height Height of the buffer, defaults to the Window's height
   */
  updateWithBuffer(buffer: Uint8Array, width?: number, height?: number) {
    unwrap(
      lib.symbols.window_update_with_buffer(
        this.#id,
        buffer,
        width ?? this.width,
        height ?? this.height,
      ),
    );
  }

  /**
   * Updates the window without drawing a buffer, mostly event handlers related.
   */
  update() {
    unwrap(lib.symbols.window_update(this.#id));
  }

  /**
   * Closes (and deletes internal reference of) the Window.
   */
  close() {
    unwrap(lib.symbols.window_close(this.#id));
  }
}
