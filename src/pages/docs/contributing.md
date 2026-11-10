---
title: Contributing
layout: ../../layouts/Page.astro
---

# Contributing

If you want to fix a bug or implement a feature in the Lucy compiler, that should be done in the [liblucy](https://github.com/lucydsl/liblucy) project.

Most development can be done using the `lucyc` CLI. You can build just this binary using `make bin/lucyc`. Below are instructions on building and testing liblucy.

## Building liblucy

liblucy has 2 compilation targets:

* The CLI, `lucyc` (Lucy compiler) which is a native binary.
* Wasm, which the `@lucy/liblucy` package loads in Node.js or in the browser.

Both are built from the same C sources.

> Note that building on Windows is not currently possible. We would love someone to contribute this!

### Prerequisites

* A __C compiler__ that supports C17: [GCC](https://gcc.gnu.org/) or Clang. If you are using a Mac you can [install the Xcode command line tools](https://developer.apple.com/xcode/resources/), which gives you Clang.
* __make__ and __[jq](https://jqlang.github.io/jq/)__ (the Makefile reads the version from package.json).
* __[Node.js](https://nodejs.org/)__ to run the tests.
* A wasm toolchain, if you're building wasm. See below.

### Building the CLI

You can build just the CLI by running:

```shell
make bin/lucyc
```

The `lucyc` command will be in `bin/lucyc`.

The code builds without warnings under the strict set of warnings in the Makefile. CI makes them errors, and you can too:

```shell
make WERROR=1 bin/lucyc
```

### Building wasm

`make all` builds the wasm module as well as `lucyc`. The toolchain it needs, and how to get it, is described in the [liblucy readme](https://github.com/lucydsl/liblucy#readme).

## Testing

```shell
make test-native
```

This runs the tests against `bin/lucyc`:

* __Snapshot tests__ (`test/snapshots/`): each folder has an `input.lucy` and the `expected.js` it should compile to. `scripts/test_snapshots -u` updates the snapshots after a deliberate change to the output.
* __Unit tests__ (`test/unit/`), which check the CLI.
* __Behaviour tests__ (`test/behavior/`), which compile each feature, import the module in Node.js and run the machine.

`make test-wasm` runs the same tests through the wasm build, and `make test` runs everything.

`make test-sanitize` checks for memory errors and leaks. It runs the tests, and every `.lucy` file under `test/`, through native builds with AddressSanitizer and UndefinedBehaviorSanitizer. It needs GCC or Clang on Linux.

## Code layout and conventions

The C sources are in `src/`: `src/bin/` is `lucyc`, `src/wasm/` the wasm module's entry points, and `src/core/` the compiler that both build in, with the parser in `src/core/parser/` and the JavaScript printer in `src/core/js/`. The library's API is `src/core/lucy.h`.

The code is C17 with a few conventions: names are prefixed by their module (`parser_next_token`), each compile allocates from one arena, and the library never prints: errors and warnings are collected on the result. `make format` formats the code with clang-format. [src/README.md](https://github.com/lucydsl/liblucy/blob/main/src/README.md) describes the layout and the conventions in full.
