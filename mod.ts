let path = Deno.env.get("DENO_MINIFB_LOCATION") ?? ""

if (path === "") {
  if (Deno.build.os === "linux") {
    path = "./target/debug/libdeno_minifb.so"
  } else if (Deno.build.os === "windows") {
    path = "./target/debug/deno_minifb.dll"
  } else if (Deno.build.os === "darwin") {
    path = "./target/debug/libdeno_minifb.dylib"
  } else throw new Error(`Unsupported OS: ${Deno.build.os}`)
}

const lib = Deno.dlopen(path, {
  window_new: {
    parameters: ["buffer", "usize", "usize"],
    result: "u32",
  },

  window_close: {
    parameters: ["u32"],
    result: "u32",
  },

  window_is_open: {
    parameters: ["u32"],
    result: "u32",
  },

  window_is_active: {
    parameters: ["u32"],
    result: "u32",
  },

  window_limit_update_rate: {
    parameters: ["u32", "u64"],
    result: "u32",
  },

  window_update_with_buffer: {
    parameters: ["u32", "buffer", "usize", "usize"],
    result: "u32",
  },

  window_update: {
    parameters: ["u32"],
    result: "u32",
  },
})

const encode = (str: string): Uint8Array => (Deno as any).core.encode(str)

const ERROR_CODES: {
  [code: number]: string | undefined
} = {
  2: "Window not found",
  3: "Failed to updateWithBuffer"
}

function unwrap(result: number) {
  let error;
  if ((error = ERROR_CODES[result])) {
    throw new Error(`Unwrap called on Error Value (${result}): ${error}`)
  }
}

function unwrapBoolean(result: number): boolean {
  if (result !== 0 && result !== 1) {
    unwrap(result)
    return false
  } else {
    return result === 1
  }
}

export class MiniFB {
  #id

  constructor(
    title: string,
    public width: number,
    public height: number
  ) {
    this.#id = lib.symbols.window_new(
      new Uint8Array([...encode(title), 0]),
      width,
      height
    )
  }

  /**
   * Limits the Window's update rate to the given number of microeconds, or 0 to disable.
   * 
   * @param micros Microseconds to limit the update rate to
   */
  limitUpdateRate(micros: number) {
    unwrap(lib.symbols.window_limit_update_rate(this.#id, micros) as number)
  }

  /**
   * Returns true if the Window is open.
   */
  get open() {
    return unwrapBoolean(lib.symbols.window_is_open(this.#id) as number)
  }

  /**
   * Returns true if the Window is active.
   */
  get active() {
    return unwrapBoolean(lib.symbols.window_is_active(this.#id) as number)
  }

  /**
   * 
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
        height ?? this.height
      ) as number
    )
  }

  /**
   * Updates the window without drawing a buffer, mostly event handlers related.
   */
  update() {
    unwrap(lib.symbols.window_update(this.#id) as number)
  }

  /**
   * Closes (and deletes internal reference of) the Window.
   */
  close() {
    unwrap(lib.symbols.window_close(this.#id) as number)
  }
}
