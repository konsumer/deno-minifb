let path = ""
if (Deno.build.os === "linux") {
  path = "./target/debug/libdeno_minifb.so"
} else if (Deno.build.os === "windows") {
  path = "./target/debug/deno_minifb.dll"
} else if (Deno.build.os === "darwin") {
  path = "./target/debug/libdeno_minifb.dylib"
}

const dylib = Deno.dlopen(path, {
})

function show(title:string, width=800, height=600) {

}

export default show
