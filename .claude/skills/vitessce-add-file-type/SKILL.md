---
name: vitessce-add-file-type
description: Use when adding a new file type or data loader to Vitessce. Covers the DataSource/DataLoader two-layer architecture, AbstractTwoStepLoader, LoaderResult, and plugin registration. Trigger when user says "add a file type", "new data loader", "load a new format", "new data source", "parse a new file format", or "implement a loader".
---

# Adding a New File Type

File type plugins follow a **two-layer pattern**:

| Layer | Responsibility | Examples |
|---|---|---|
| **DataSource** | Manages connection to a remote resource (URL/store). Handles fetching, caching, low-level I/O. | `JsonSource`, `CsvSource`, `AnnDataSource` |
| **DataLoader** | Reads specific data from the source, transforms it, returns a `LoaderResult`. Extends `AbstractTwoStepLoader`. | `ObsEmbeddingCsvLoader`, `ObsLabelsAnndataLoader` |

A single DataSource can back many DataLoaders — e.g., `AnnDataSource` is paired with
`ObsLabelsAnndataLoader`, `ObsEmbeddingAnndataLoader`, etc.

## Data Loading Flow

```
View Component
  → useObsEmbeddingData(loaders, dataset, ...)     [data-hooks.js]
    → useDataType(DataType.OBS_EMBEDDING, ...)      [data-hook-utils.js]
      → useQuery({ queryFn: dataQueryFn })          [React Query]
        → getMatchingLoader(loaders, dataset, dataType, matchOn)
        → loader.load()  →  LoaderResult
        → returns { data, coordinationValues, urls, requestInit }
  → returns [data, status, urls, error]
```

## Imports

`AbstractTwoStepLoader`, `AbstractLoader`, and `LoaderResult` are exported from
**`@vitessce/abstract`** (`packages/file-types/abstract/`), not from `@vitessce/vit-s`:

```ts
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';
```

## Implementing a DataLoader

Extend `AbstractTwoStepLoader` (which just adds `this.dataSource` on top of `AbstractLoader`) and
implement `load()`:

```ts
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class MyFormatLoader extends AbstractTwoStepLoader {
  async load() {
    const { url } = this;
    const raw = await this.dataSource.fetchSomething(url);
    return new LoaderResult(
      { myDataKey: transform(raw) },   // data — keys become what the data hook returns
      url,                             // url — string, or array of { url, name }
      null,                            // coordinationValues — optional
      null,                            // requestInit — optional
    );
  }
}
```

`LoaderResult`'s constructor is `(data, url, coordinationValues = null, requestInit = null)` — see
`packages/file-types/abstract/src/LoaderResult.js`. When `url` is a bare string, `dataQueryFn`
wraps it as `[{ url, name: dataType }]` for the download button; pass an array of `{ url, name }`
yourself to control the labels.

Returning a non-null `coordinationValues` is how a loader feeds data-dependent initial coordination
values (e.g. an embedding loader reporting its own `embeddingType`) back into the coordination space.

### Format families with a shared base loader

Rather than reimplementing `load()` per data type, most format families define one base class that
implements `load()` and delegates the transform to a subclass hook. For CSV, `CsvLoader` implements
`load()` and each concrete loader implements `loadFromCache(data)`:

```js
// packages/file-types/csv/src/csv-loaders/ObsEmbeddingCsv.js
import CsvLoader from './CsvLoader.js';

export default class ObsEmbeddingCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) return this.cachedResult;
    const { obsIndex: indexCol, obsEmbedding: [xCol, yCol] } = this.options;
    // ...
    this.cachedResult = { obsIndex, obsEmbedding };
    return this.cachedResult;
  }
}
```

If you are adding a new data type to an existing format, subclass that family's base loader rather
than `AbstractTwoStepLoader` directly.

## Registration

In `packages/main/all/src/base-plugins.ts`, add to the `baseFileTypes` array. The file uses local
helpers rather than constructing the plugin class directly:

```ts
makeFileType(
  'myData.myFormat',       // fileType string used in view config files array
  DataType.MY_DATA,        // data type constant
  MyFormatLoader,          // loader class
  MyDataSource,            // data source class
  zMyFormatOptions,        // Zod schema for options (or z.object({}))
)
```

`makeFileType` wraps `new PluginFileType(name, dataType, dataLoaderClass, dataSourceClass, optionsSchema)`.
For Zarr-backed types use `makeZarrFileTypes`, which additionally registers the `.zip` and `.h5ad`
store variants listed in `ALT_ZARR_STORE_TYPES`.

Add `DataType.MY_DATA` to `packages/constants-internal/src/constants.ts` if it is a new data type,
and export the loader/source from its sub-package's `src/index.js`.

Registering the plugin is also what makes the `fileType` string valid in a view config:
`packages/schemas/src/schema-builders.ts` builds the file-definition union from the registered
`PluginFileType` instances, so **no schema version bump is needed** for a new file type.

## Options schema

`options` in a file definition is validated by the `optionsSchema` you register. Existing schemas
live in `packages/schemas/src/file-def-options.ts`.

## Examples to Study

- `packages/file-types/csv/` — simple CSV-based loaders (`CsvSource` + `CsvLoader` base class)
- `packages/file-types/zarr/` — complex Zarr/AnnData loading
- `packages/file-types/json/` — JSON-based loaders

## Documentation

- `sites/docs/docs/data-types-file-types.mdx`
- `sites/docs/docs/data-file-types.mdx`
- `sites/docs/docs/tutorial-plugin-file-type.mdx` — the same flow as an external plugin
