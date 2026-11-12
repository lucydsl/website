---
layout: ../layouts/Page.astro
title: VSCode Extension
lede: Syntax highlighting for Lucy in Visual Studio Code.
---

## Installation

Search for Lucy in the VS Code marketplace and install the extension.

## Highlighting

The VSCode Lucy plugin is able to highlight files with the `.lucy` file extension and JavaScript using the `machine` tagged template function.

For example:

__example.lucy__

```lucy
initial state start {
  complete => end
}

final state end {}
```

And when embedded in JavaScript:

__example.js__

```js
const exampleMachine = machine`
  initial state start {
    complete => end
  }

  final state end {}
`;
```

> Important: The tagged template function *must* be named `machine` for highlighting to work in embedded JavaScript.

> Lucy itself no longer provides a `machine` tag function: the old one came from `@lucy/xstate`, which targeted XState. Compiling `.lucy` files is now the main way to use Lucy, and the highlighting works for any template tagged `machine`.

## Code Completion

Coming Soon!