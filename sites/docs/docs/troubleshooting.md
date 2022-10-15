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
