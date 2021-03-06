# I use a special version that came from denoland/deno/pull/11648
# DENO := $(shell which deno)
DENO = $(PWD)/../deno-pr-buffers/target/debug/deno

.PHONY: help clean setup test demo deno web

#: Show this help
help:
	@cat $(MAKEFILE_LIST) | deno run -q https://deno.land/x/makehelp@0.0.1/help.ts

#: Install tools for development
setup:
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
	curl -fsSL https://deno.land/x/install/install.sh | sh

#: Clean rust lib
clean:
	cargo clean

#: Build rust lib
build: src/lib.rs
	cargo build

#: Test the deno integration
test: build
	$(DENO) test --unstable --allow-all

#: Run a webgpu demo
webgpu: build
	$(DENO) run --unstable --allow-all ./examples/webgpu.ts

#: Run a simple canvas demo
canvas: build
	$(DENO) run --unstable --allow-all ./examples/canvas.ts

#: Run a deno-themed canvas demo, that also works in browser
cross: build
	$(DENO) run --unstable --allow-all ./examples/canvas_cross.js

#: Run the deno-themed canvas demo, in browser
web:
	cd examples && npx live-server