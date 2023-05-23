---
id: troubleshooting
title: Troubleshooting
slug: /troubleshooting
---

This page contains tips for troubleshooting while writing Vitessce configurations.

### What is the current view config?

Vitessce always writes the current config to the browser console, both as a data URI and as JSON.

- In Chrome: right-click -> Inspect -> Console
- In Firefox: right-click -> Inspect -> Console

Look for the line

```
🚄 Vitessce (x.x.x) view configuration
```

### Is my data loading successfully?

The network tab in your browser's developer tools window can help to determine whether any files failed to load.
This can help to uncover incorrect URLs, cross-origin request (CORS) issues, AWS S3 bucket configuration issues, etc.


- In Chrome: right-click -> Inspect -> Network
- In Firefox: right-click -> Inspect -> Network

### How is the view config updating after each interaction?

By default, Vitessce does not validate or log the view config on every coordination scope change (instead validation occurs only on initial load).
However, by setting the parameter `debug=true` in the URL, you can enable this behavior.
Note that this has a major performance impact.

In the React context, you can use the [onConfigChange](/docs/js-react-vitessce/#onconfigchange) prop (e.g., set as `console.log` for equivalent behavior).

### How can I view non-minified information in the browser console?

Since v2 of the JS package, we publish both packages to NPM:
- `vitessce`: production build
- `@vitessce/dev`: development (non-minified) build

For improved debugging, temporarily swap out `vitessce` for `@vitessce/dev` in `package.json` (dependencies/devDependencies) and import statements:

```diff
- import { Vitessce } from 'vitessce';
+ import { Vitessce } from '@vitessce/dev';
```

In a plain HTML setting, simply remap the URL for `vitessce` in the importmap:

```diff {10-11}
 <script type="importmap">
 {
   "imports": {
-    "react": "https://esm.sh/react@18.2.0",
+    "react": "https://esm.sh/react@18.2.0?dev",
-    "react-dom": "https://esm.sh/react-dom@18.2.0",
+    "react-dom": "https://esm.sh/react-dom@18.2.0?dev",
-    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
+    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client?dev",
-    "vitessce": "https://unpkg.com/vitessce@latest"
+    "vitessce": "https://unpkg.com/@vitessce/dev@latest"
   }
 }
 </script>
```
