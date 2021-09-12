# deno minifb

This is a thin wrapper around [minifb](https://github.com/emoon/minifb) that you can use in deno. Combine it with [canvas](https://github.com/DjDeveloperr/deno-canvas) for native window that works like the [canvas web API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or [webgpu](https://deno.land/x/deno@v1.9.2/op_crates/webgpu) for 3D stuff (**note**: it runs very slow webgpu, unusbale for a game.)

# WIP

We are still working on it. The first goal is to get a basic window for canvas, but eventually we plan to add mouse, key, exit-handler, and loop-lifecycle stuff (for locking into a specific framerate.) The evenutal goal is to be a minimal piece to making performant native games in deno, using standardd web APIs.

## deno support

Currently, you need to run deno from [this PR](https://github.com/denoland/deno/pull/11648).

I compiled it on linux, liek this:

```
git clone --recursive https://github.com/eliassjogreen/deno.git deno-pr-buffers
cd deno-pr-buffers
cargo build
```

Then set `DENO` in the Makefile.

## usage

```ts
// TODO
```

## development

You will need `deno`, `make`, and `cargo` (for rust) in your path. On mac or linux, run `make setup` to install everything you need.

Run `make` for some help.
