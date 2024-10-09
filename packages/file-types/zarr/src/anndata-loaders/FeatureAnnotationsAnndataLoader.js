// @ts-check
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/vit-s';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureAnnotation, Keys } from '@vitessce/types' */

/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class FeatureAnnotationsAnndataLoader extends AbstractTwoStepLoader {

    /**
     * @returns {Promise<LoaderResult<Keys>>}
     */
    async loadKeys() {
        const attrs = await this.dataSource._loadAttrs('var')
        const keys = attrs['column-order']
        return new LoaderResult(
            { keys },
            null,
        )
    }

    /**
     * @param {string} selection
     * @returns {Promise<LoaderResult<FeatureAnnotation>>}
     */
    async loadSelection(selection) {
        return new LoaderResult(
            {
                annotation: await this.dataSource._loadColumn(`var/${selection}`),
            },
            null,
        )
    }
}
