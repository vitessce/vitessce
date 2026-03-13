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

A single DataSource can back many DataLoaders — e.g., `AnnDataSource` is paired with `ObsLabelsAnndataLoader`, `ObsEmbeddingAnndataLoader`, etc.

## Data Loading Flow

```
View Component
  → useObsEmbeddingData(loaders, dataset, ...)     [data-hooks.js]
    → useDataType(DataType.OBS_EMBEDDING, ...)      [data-hook-utils.js]
      → useQuery({ queryFn: ... })                  [React Query]
        → getMatchingLoader(loaders, dataset, dataType)
        → loader.load()
        → returns { data, coordinationValues, urls }
  → returns [data, status, urls, error]
```

## Implementing a DataLoader

Extend `AbstractTwoStepLoader` and implement `load()`:

```ts
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export class MyFormatLoader extends AbstractTwoStepLoader {
  async load() {
    const { url } = this.file;
    const data = await this.dataSource.fetchSomething(url);
    const transformed = transform(data);
    return new LoaderResult(
      { myDataKey: transformed },
      [{ url, name: 'My File' }],  // urls shown in download button
    );
  }
}
```

## Registration

In `packages/main/all/src/base-plugins.ts`:

```ts
new PluginFileType(
  'myData.myFormat',       // fileType string used in view config files array
  DataType.MY_DATA,        // data type constant
  MyFormatLoader,          // loader class
  MyDataSource,            // data source class
  zMyFormatOptions,        // Zod schema for options (or z.object({}))
)
```

Add `DataType.MY_DATA` to `@vitessce/constants-internal` if it is a new data type.

## Examples to Study

- `packages/file-types/csv/` — simple CSV-based loaders
- `packages/file-types/zarr/` — complex Zarr/AnnData loading
- `packages/file-types/json/` — JSON-based loaders

## Documentation

- `sites/docs/docs/data-types-file-types.mdx`
- `sites/docs/docs/data-file-types.mdx`
