/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { ObsEmbeddingData, MatrixResult } from '@vitessce/types' */
/**
 * Loader for embedding arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class ObsEmbeddingAnndataLoader<DataSourceType extends AnnDataSource> extends AbstractTwoStepLoader<DataSourceType> {
    constructor(dataSource: DataSourceType, params: import("@vitessce/types").LoaderParams);
    /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise<MatrixResult>} A promise for an array of columns.
     */
    loadEmbedding(): Promise<MatrixResult>;
    embedding: Promise<{
        data: [any[] | Int8Array | Int16Array | Int32Array | BigInt64Array | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Float32Array | Float64Array | import("@zarrita/typedarray").BoolArray | import("@zarrita/typedarray").UnicodeStringArray | import("@zarrita/typedarray").ByteStringArray, any[] | Int8Array | Int16Array | Int32Array | BigInt64Array | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Float32Array | Float64Array | import("@zarrita/typedarray").BoolArray | import("@zarrita/typedarray").UnicodeStringArray | import("@zarrita/typedarray").ByteStringArray];
        shape: [number, number];
    }> | undefined;
    /**
     *
     * @returns {Promise<LoaderResult<ObsEmbeddingData>>}
     */
    load(): Promise<LoaderResult<ObsEmbeddingData>>;
}
import type AnnDataSource from '../AnnDataSource.js';
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import type { MatrixResult } from '@vitessce/types';
import { LoaderResult } from '@vitessce/vit-s';
import type { ObsEmbeddingData } from '@vitessce/types';
//# sourceMappingURL=ObsEmbeddingAnndataLoader.d.ts.map