# @vitessce/launcher

This subpackage provides a React component for launching Vitessce.
It allows users to load local files via drag-and-drop or file selection, as well as load remote data and configurations from URL.

<!-- We will focus on the URL-based launching, then move to the local file features via standard file input dialog, then finally drag-and-drop. -->

## Goals

- Support both query parameter routing (`vitessce.io/?config={something}`) and hash-based routing (`vitessce.io/#?config={something}`).
- Make it easy to embed as a React component into vitessce.io, dev.vitessce.io, and a future app.vitessce.io.
- Un-spaghetti code equivalent of https://github.com/vitessce/vitessce/blob/53455b86b8fe6fa6444dee2f38a707f40aa0beb0/sites/docs/src/pages/_Index.js#L318

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

## Other states to consider

- No URL parameters; Show the launcher UI.
- Awaiting URL parameter parsing.
- Loading config or data/metadata from URL.
- Loaded config but was invalid.
- Could not identify a valid/supported data format from data file extension(s).
- Failed to load config or data/metadata from URL.
- Error if BOTH config and source parameters are provided.
- Error if BOTH hash and query parameters are provided.
