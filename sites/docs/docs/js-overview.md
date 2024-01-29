---
id: js-overview
title: 'JavaScript API'
sidebar_label: Getting Started
---

The **JavaScript API** docs are intended for web developers who would like to integrate Vitessce into other web applications.

Vitessce can be integrated into [React](https://reactjs.org/) web applications as a React component.


## Usage in NodeJS environments

In other words, this section is relevant if you are building a web application or JavaScript library using build tools such as Vite, Rollup, or Webpack.
This type of usage requires [NodeJS](https://nodejs.org/) and NPM (or other JavaScript package manager).

### Installation

To install Vitessce from [NPM](https://www.npmjs.com/package/vitessce), go to your project folder in the terminal, and run:

```sh
npm install vitessce
```

Vitessce has been tested with NodeJS 16 and 18.


### Troubleshooting

:::note

NodeJS may require the `max_old_space_size` option to be increased:
```sh
export NODE_OPTIONS=--max_old_space_size=4096
```

:::

## Usage in plain HTML pages

Vitessce can be used in a plain HTML page by including `<script/>` tags.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My web page</title>
  </head>
  <body>
    <h1>Demo of Vitessce inside a plain HTML page</h1>
    <div id="root"></div>

    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.2.0?dev",
          "react-dom": "https://esm.sh/react-dom@18.2.0?dev",
          "react-dom/client": "https://esm.sh/react-dom@18.2.0/client?dev",
          "vitessce": "https://unpkg.com/vitessce@latest"
        }
      }
    </script>
    <script type="module">
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { Vitessce } from 'vitessce';

      const config = {
        version: '1.0.16',
        name: 'Example configuration',
        description: '',
        datasets: [],
        initStrategy: 'auto',
        coordinationSpace: {},
        layout: [{
          component: 'description',
          props: { description: 'Hello, world!' },
          x: 0, y: 0, w: 6, h: 6,
        }],
      };

      function MyApp() {
        return React.createElement(
          Vitessce,
          {
            height: 500,
            theme: 'light',
            config: config,
          }
        );
      }

      const container = document.getElementById('root');
      const root = createRoot(container);
      root.render(React.createElement(MyApp));
    </script>
  </body>
</html>
```

<!--
### Note about importmaps

If the browser version you are targeting does not support importmaps, then include the following above `<script type="importmap">`:

```html
<script async src="https://ga.jspm.io/npm:es-module-shims@1.6.1/dist/es-module-shims.js"></script>
```
-->

### Note about JavaScript formats

Vitessce is published as an ECMAScript [Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (ESM) in which React and ReactDOM are imported using bare import specifiers (e.g., `import React from 'react'`).
The Vitessce module does not include its own copy of React/ReactDOM (i.e., these dependencies are "externalized" at bundle time).
Among other reasons, this avoids a consumer application from getting a redundant copy in the case that it is already using React/ReactDOM.


In NodeJS contexts, these import statements can be resolved using the dependencies that have been npm-installed into `node_modules`.
In browser contexts, these import statements can be resolved using [importmaps](https://html.spec.whatwg.org/multipage/webappapis.html#import-maps).
In browser contexts in which you do not have full control over the importmaps on the page (e.g., [anywidget](https://github.com/manzt/anywidget) or [observable](https://observablehq.com/@keller-mark/vitessce-from-unpkg)), see [dynamic-importmap](https://github.com/keller-mark/dynamic-importmap).