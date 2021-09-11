.PHONY: help clean build

#: Show this help
help:
	@cat $(MAKEFILE_LIST) | deno run -q https://deno.land/x/makehelp@0.0.1/help.ts

#: clean rust lib
clean:
	cargo clean

#: build rust lib
build: target/debug/libdeno_minifb.dylib

#: test the deno integration
test: target/debug/libdeno_minifb.dylib
	deno test --unstable --allow-all

target/debug/libdeno_minifb.dylib:
	cargo build