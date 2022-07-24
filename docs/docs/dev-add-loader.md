---
id: dev-add-loader
title: File type implementation
---

In order to load data from a particlar **file type**, two classes must be implemented: a _data loader_ class and a _data source_ class.

## The data loader class

Each data loader class should inherit from [`AbstractTwoStepLoader`](https://github.com/vitessce/vitessce/blob/main/src/loaders/AbstractTwoStepLoader.js) which has two constructor parameters:

- `dataSource` (`any`) - A data source instance. See the [data source](#the-data-source) section below.
- `fileDef` (`object`) - A file definition from view config `datasets[].files[]`.
- `fileDef.type` (`string`) - The data type.
- `fileDef.fileType` (`string`) - The file type.
- `fileDef.url` (`string`) - The URL to the file.
- `fileDef.requestInit` (`string`) - An object to pass as the `fetch()` [`init` parameter](https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters). Optional.
- `fileDef.options` (`object|array`) - Options for the file definition. Optional.
- `fileDef.coordinationValues` (`object`) - Coordination values for the file definition. Optional.

Each loader class must implement its own `load()` method.

### The `load()` return value

The `load()` method should return a promise that resolves to a [`LoaderResult`](https://github.com/vitessce/vitessce/blob/main/src/loaders/LoaderResult.js) instance.

Depending on the **data type** of the **file type**, the `data` parameter of the `LoaderResult` constructor should be a JS object with the following structure:

| Data Type | `data` object |
|-----|-----|
| `obsEmbedding` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsEmbedding`: `ZarrArray<number[]>` <br/> } |
| `obsLabels` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsLabels`: `string[]`  <br/> } |
| `obsLocations` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsLocations`: `ZarrArray<number[]>` <br/> } |
| `obsSegmentations` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsSegmentations`: `ZarrArray<number[]>`, <br/> &nbsp;&nbsp; `obsSegmentationsType`: `string` <br/> } |
| `obsSets` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsSets`: `object` <br/> } |
| `obsFeatureMatrix` | { <br/> &nbsp;&nbsp; `obsIndex`: `string[]`, <br/> &nbsp;&nbsp; `featureIndex`: `string[]`, <br/> &nbsp;&nbsp; `obsFeatureMatrix`: `ZarrArray<number[]>` <br/> } |
| `image` | { <br/> &nbsp;&nbsp; `image`: `object` <br/> } |

where `ZarrArray<T>` is an object `{ data: T, shape: number[] }`. 

## The data source class

The data source class is instantiated per-URL.
This means that multiple data loader instances can share the same data source instance (as long as the `fileDef.url` value is the same).

For instance, AnnData-Zarr stores typically contain multiple data types located under the same URL (e.g., http://localhost:8000/anndata.zarr), all of which share the same cell and gene indices (`obsIndex` in `anndata.zarr/obs/index` and `featureIndex` in `anndata.zarr/var/index`, respectively). A shared data source instance can handle cacheing of the `obsIndex` and `featureIndex` values to prevent redundant network requests and Zarr array parsing.

## Validation of file definition `options`

We delegate validation of the `options` value passed in the file definition to the loader (or the expansion function, in the case of a joint file type).
If your loader inherits from `AbstractTwoStepLoader`, this can be done by setting a JSON object containing a JSON schema definition as `this.optionsSchema` in the `constructor`:

```js
class MyLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = obsEmbeddingAnndataSchema;
  }

  async load() {
    // super.load() will perform validation of this.options against this.optionsSchema
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    // ... omitted ...
  }
}
```

## The file type registry

Similar to the [view type registry](/docs/dev-add-component/#the-view-type-registry), there must be a mapping between a **file type** name and the actual data loader & data source class definitions to facilitate usage of the file type name as a string ([`datasets[].files[].fileType`](/docs/view-config-json/#datasets)) in the JSON view config. 
The [file type registry](https://github.com/vitessce/vitessce/blob/main/src/loaders/types.js) maps file types to `[data source, data loader]` tuples.
Every file type in the registry must be [mapped to a data type](https://github.com/vitessce/vitessce/blob/main/src/app/constant-relationships.js) as well.

:::tip
The plugin analog of the file type registry is the [`registerPluginFileType`](/docs/dev-plugins/#plugin-file-types) function.
:::