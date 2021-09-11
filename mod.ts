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
    paramaters: ["u32", "buffer", "usize", "usize"],
    result: "void"
  }
})

export default class Window {
  #id
  buffer
  height
  width

  constructor(title="minifb", width=800, height=600){
    this.#id = lib.symbols.window_new(new Uint8Array([...Deno.encode(title), 0]), width, height)
    this.buffer = (new Uint8Array(width*height*4)).fill(0)
    this.width = width
    this.height = height
  }
  
  update(){
     lib.symbols.window_update(this.#id, this.buffer, this.width, this.height)
  }
}
