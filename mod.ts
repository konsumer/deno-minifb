let path = Deno.env.get("DENO_MINIFB_LOCATION") || ""

if (path === "") {
  if (Deno.build.os === "linux") {
    path = "./target/debug/libdeno_minifb.so"
  } else if (Deno.build.os === "windows") {
    path = "./target/debug/deno_minifb.dll"
  } else if (Deno.build.os === "darwin") {
    path = "./target/debug/libdeno_minifb.dylib"
  }
}

const lib = Deno.dlopen(path, {
  window_new: {
    parameters: ["buffer", "usize", "usize"],
    result: "usize"
  },

  window_update: {
    paramaters: ["usize", "buffer", "usize", "usize"],
    result: "void"
  }
})

// convert a string into a buffer (that can be used with FFI string)
const strToBuffer = (str:string) => new Uint8Array([...new TextEncoder().encode(str), 0])

export default class Window {
  #id
  #height
  #width
  buffer

  constructor(title="minifb", width=800, height=600){
    this.#id = lib.symbols.window_new(strToBuffer(title), width, height)
    this.buffer = (new Uint8Array(width*height)).fill(0)
    this.#width = width
    this.#height = height
  }
  
  update(){
     lib.symbols.window_update(this.#id, this.buffer, this.#width, this.#height)
  }
}
