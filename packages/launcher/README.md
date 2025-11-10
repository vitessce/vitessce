# @vitessce/launcher

This subpackage provides a React component for launching Vitessce.
It allows users to load local files via drag-and-drop or file selection, as well as load remote data and configurations from URL.

## Goals

- Provide data-centric launching options, both in the UI and via URL params.
- Decouple the launching functionality from the Docusaurus framework.
- Support both query parameter routing (`/?config={something}`) and hash-based routing (`/#?config={something}`).
- Make it easy to embed as a React component into vitessce.io, dev.vitessce.io, and a future app.vitessce.io.
  - Uncontrolled component variant should manage state via the URL.
- Un-spaghetti code equivalent of https://github.com/vitessce/vitessce/blob/53455b86b8fe6fa6444dee2f38a707f40aa0beb0/sites/docs/src/pages/_Index.js#L318
- Should be modular enough so that it can potentially be used within Vitessce in the future with little modification (i.e., rather than the Launcher wrapping Vitessce, Vitessce could display the (controlled) launcher UI when no config (or a dataset-less config) is provided).

## Non-goals

- Text editor for config editing. This would eventually be available via the sidebar once a visualization has been launched.

## Usage via URL

```
# URL to JSON config file
https://app.vitessce.io/?config=https://example.com/path/to/config.json
https://app.vitessce.io/#?config=https://example.com/path/to/config.json

# URL to JSON config as data URI
https://app.vitessce.io/#?config=data:,{"name": "My config", ...}
https://app.vitessce.io/?config=data:,{"name": "My config", ...}

# One or more data sources. No config file; will use generateConfig function internally.
https://app.vitessce.io/?source=https://example.com/path/to/datafile1
https://app.vitessce.io/#?source=https://example.com/path/to/datafile1&source=https://example.com/path/to/datafile2
```
