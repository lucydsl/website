---
layout: install.njk
---

# Install Lucy

The following are currently supported methods of installing __Lucy__.

## Installer

```bash
curl -sSf https://lucylang.org/install.sh | bash
```

This will install the `lc` binary to your `$HOME/.lucy` folder. Open a new terminal and run:

```bash
lc --help
```

## Build Tools

Lucy is available for the following build tools:

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
import lucy from '../../rollup-plugin-lucy.mjs';

export default {
  plugins: [
    lucy()
  ]
}
```