---
title: Contributing
layout: page.njk
---

# Contributing

If you want to fix a bug or implement a feature in the Lucy compiler, that should be done in the [liblucy](https://github.com/matthewp/liblucy) project.

Most development can be done using the `lucyc` CLI. You can build just this binary using `make bin/lucyc`. Below is instructions on building liblucy.

## Building liblucy

liblucy has 2 compilation targets:

* The CLI, `lucyc` (Lucy compiler) which is a native binary.
* Wasm, which has development and release versions. These can be loaded and used in Node.js, Deno, or in the browser.

> Note that building on Windows is not currently possible. We would love someone to contribute this!

### Prerequisites

* A __C compiler__: If you are using a Mac you should [install the XCode command line tools](https://www.embarcadero.com/starthere/xe5/mobdevsetup/ios/en/installing_the_commandline_tools.html) which gives you Clang. If you are on Linux you can install [GCC](https://gcc.gnu.org/).
* __[Emscripten](https://emscripten.org/)__: If you are only going to build the CLI you can skip this one. Emscripten is used to build to wasm.
* __[jq](https://stedolan.github.io/jq/)__
* __sed__: If on Mac you need [gsed](https://formulae.brew.sh/formula/gnu-sed).

### Building the CLI

You can build just the CLI by running:

```shell
make bin/lucyc
```

The `lucyc` command will be in `bin/lucyc`.

### Building wasm

The wasm binaries are built in 4 forms:

* dist/liblucy-debug-browser.mjs
* dist/liblucy-debug-node.mjs
* dist/liblucy-release-browser.mjs
* dist/liblucy-release-node.mjs

You can build any of these with make, such as:

```shell
make dist/liblucy-debug-browser.mjs
```

The release versions are built using `-O3`.

Each of these has a separate entrypoint in liblucy, such as `main-browser-dev.js`. When someone imports liblucy in Node this is controlled with the package.json `exports` field.

### Building all

You can build all of the binaries using:

```shell
make all
```