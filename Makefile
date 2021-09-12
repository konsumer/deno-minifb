# I use a special version that came from denoland/deno/pull/11648
# DENO := $(shell which deno)
DENO = $(PWD)/../deno-pr-buffers/target/debug/deno

.PHONY: help clean setup test demo

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

#: run a simple demo
demo: build
	$(DENO) run --unstable --allow-all ./examples/canvas.ts

#: run a deno-themed demo
deno: build
	$(DENO) run --unstable --allow-all ./examples/canvas_cross.js