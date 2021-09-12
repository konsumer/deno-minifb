.PHONY: help clean setup test

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
	deno test --unstable --allow-all

