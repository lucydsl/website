---
layout: ../layouts/Page.astro
title: Install
lede: A native compiler, a JavaScript package, and a plugin for Vite.
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

## JavaScript

The compiler is also available as a JavaScript package, [@lucy/liblucy](https://www.npmjs.com/package/@lucy/liblucy), which runs the compiler as WebAssembly in Node.js or the browser. This is what the Vite plugin uses, and you can use it directly:

```shell
npm install @lucy/liblucy
```

```js
import { ready, compile } from '@lucy/liblucy';

await ready;

const { js } = compile(source, 'toggle.lucy');
```

`compile(source, filename, options)` returns an object whose `js` is the compiled module. Pass `{ dts: true }` as the options to also get TypeScript declarations as `dts` (experimental). If the source doesn't compile, `compile` prints the errors to the console and throws an error whose `diagnostics` lists them, each with a `severity`, `message`, `line` and `column`.

## Vite

[Vite](https://vite.dev/) users can use the [@lucy/vite](https://www.npmjs.com/package/@lucy/vite) plugin to import `.lucy` files. It needs Vite 6.3 or later. Install the plugin:

```shell
npm install @lucy/vite --save-dev
```

And add it to your config:

__vite.config.js__

```js
import { defineConfig } from 'vite';
import lucy from '@lucy/vite';

export default defineConfig({
  plugins: [lucy()]
});
```

Then import a `.lucy` file from your JavaScript. Each machine in the file is exported as a function that creates it:

```js
import { createToggle } from './toggle.lucy';

const toggle = createToggle().start();
```

This works in the dev server and in builds. A file that doesn't compile fails the build, with the error's file and line.

The imports are typed, too. The plugin writes TypeScript declarations beside each `.lucy` file as it compiles it (`toggle.lucy` gets `toggle.lucy.d.ts`), and TypeScript reads them with no extra configuration. Commit them, or add `*.lucy.d.ts` to your `.gitignore` and build before you type check. Pass `{ dts: false }` to turn them off.
