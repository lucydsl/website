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