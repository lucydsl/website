---
layout: ../layouts/Page.astro
title: Install
lede: A native compiler, a JavaScript package, and plugins for build tools.
---

## Installer

```bash
curl -sSf https://lucy.spooky.click/install.sh | bash
```

This will install the `lucyc` binary to your `$HOME/.lucy` folder. Open a new terminal and run:

```bash
lucyc --help
```

Then compile a Lucy file to a JavaScript module with:

```bash
lucyc --out-file toggle.js toggle.lucy
```

> The installer downloads the latest [release](https://github.com/lucydsl/liblucy/releases), which predates the plain JavaScript compiler that these docs describe and still outputs XState machines. Until the next release, you can build `lucyc` from source with `make bin/lucyc`; see [Contributing](docs/contributing/).

## JavaScript

The compiler is also available as a JavaScript package, [@lucy/liblucy](https://www.npmjs.com/package/@lucy/liblucy), which runs the compiler as WebAssembly in Node.js or the browser. This is what build tool plugins use, and you can use it directly:

```shell
npm install @lucy/liblucy
```

```js
import { ready, compile } from '@lucy/liblucy';

await ready;

const { js } = compile(source, 'toggle.lucy');
```

`compile(source, filename, options)` returns an object whose `js` is the compiled module. Pass `{ dts: true }` as the options to also get TypeScript declarations as `dts` (experimental). If the source doesn't compile, `compile` prints the errors to the console and throws an error whose `diagnostics` lists them, each with a `severity`, `message`, `line` and `column`.

> As with the installer, the version of `@lucy/liblucy` on npm is older and has a different API (`compileXstate`). `compile` will be there in the next release.

## Build Tools

Lucy is available for the following build tools:

> These plugins haven't been updated for the plain JavaScript compiler yet. They use an older version of liblucy, so they produce XState machines rather than the output described in these docs.

### Snowpack

[Snowpack](https://www.snowpack.dev/) users can use the [@lucy/snowpack-plugin](https://www.npmjs.com/package/@lucy/snowpack-plugin) package to load `.lucy` files.

First install the plugin:

```shell
npm install @lucy/snowpack-plugin
```

Then add it to your `snowpack.config.js` configuration in the `plugins` section like so:

```js

module.exports = {
  // ... Other configuration

  plugins: [
    '@lucy/snowpack-plugin'
  ]
};
```

### Rollup

[Rollup](https://rollupjs.org/) users can use the [@lucy/rollup-plugin](https://www.npmjs.com/package/@lucy/rollup-plugin) package to load `.lucy` files. Install the plugin:

```shell
npm install @lucy/rollup-plugin --save-dev
```

And use it in your Rollup config:

__rollup.config.mjs__

```js
import lucy from '@lucy/rollup-plugin';

export default ({
  input: 'entry.js',
  plugins: [lucy()],
  output: [{
    file: 'bundle.js',
    format: 'es'
  }]
});
```

### Vite

[Vite](https://vitejs.dev/) supports Rollup plugins out of the box, so you can use the [@lucy/rollup-plugin](https://www.npmjs.com/package/@lucy/rollup-plugin) package in a Vite project.

Install:

```shell
npm install @lucy/rollup-plugin --save-dev
```

And in your config:

__vite.config.mjs__

```js
import lucy from '@lucy/rollup-plugin';

export default {
  plugins: [
    lucy()
  ]
}
```
