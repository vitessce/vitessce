---
id: installation
title: Installation
sidebar_label: Installation
slug: /installation
---

:::tip

These are the **JavaScript** installation instructions.

Looking for the [**Python**](https://vitessce.github.io/vitessce-python/getting_started.html#installation) or [**R**](https://vitessce.github.io/vitessce-r/#installation) installation instructions?

:::

Installation requires [NodeJS](https://nodejs.org/). Vitessce has been tested with NodeJS 14, and should work with versions 8, 10, 12, 13, and 14.

To install Vitessce from [NPM](https://www.npmjs.com/package/vitessce), go to your project folder in the terminal, and run:

```sh
npm install --save vitessce
```

## Troubleshooting

:::note

NodeJS 14 may require the `max_old_space_size` option to be increased:
```sh
export NODE_OPTIONS=--max_old_space_size=4096
```

:::
