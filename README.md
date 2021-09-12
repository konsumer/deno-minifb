# deno minifb

This is a thin wrapper around [minifb](https://github.com/emoon/minifb) that you can use in deno. Combine it with [canvas](https://github.com/DjDeveloperr/deno-canvas) for native window that works like the [canvas web API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or [webgpu](https://deno.land/x/deno@v1.9.2/op_crates/webgpu) for 3D stuff.

# WIP

We are still working on it. Also, currently, you need to run deno from [this PR](https://github.com/denoland/deno/pull/11648). The first goal is to get a basic window for canvas, but eventually we plan to add mouse, key, exit-handler, and loop-lifecycle stuff (for locking into a specific framerate.) Th evenutaly goal is to be a minimal piece to making performant native games in deno, using standardd web APIs.

## usage

```ts
// TODO
```

## development

You will need `deno`, `make`, and `cargo` (for rust) in your path. On mac or linux, run `make setup` to install everything you need.

Run `make` for some help.
