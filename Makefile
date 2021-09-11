.PHONY: help clean test

#: Show this help
help:
	@cat $(MAKEFILE_LIST) | deno run -q https://deno.land/x/makehelp@0.0.1/help.ts

#: clean rust lib
clean:
	cargo clean

#: build rust lib
build: src/lib.rs
	cargo build

#: test the deno integration
test: build
	deno test --unstable --allow-all

