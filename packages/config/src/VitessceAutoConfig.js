import { CoordinationType as ct, FileType } from '@vitessce/constants-internal';
import {
  VitessceConfig,
} from './VitessceConfig.js';

import { HINTS_CONFIG, HINT_TYPE_TO_FILE_TYPE_MAP } from './constants.js';

/**
 * @param {Object} hintsConfig. The hints config for the given dataset.
 *
 * @param {Array} possibleViews. All views for a given file type, supported by the dataset.
 * The array contains arrays of strings, each of size >= 1, where the first element of each string
 * is a VitessceConfig view name ('description', 'spatial', 'layerController', etc.)
 *
 * @returns {Array of strings} the intersection of VitessceConfig view names in
 * possibleViews and requiredViews.
 */
const filterViews = (hintsConfig, possibleViews) => {
  const requiredViews = Object.keys(hintsConfig.views);

  if (requiredViews.length === 0) {
    return possibleViews;
  }

  const resultViews = [];

  requiredViews.forEach((requiredView) => {
    const match = possibleViews.find(possibleView => possibleView[0] === requiredView);
    if (match) resultViews.push(match);
  });

  if (resultViews.length === 0) {
    throw new Error('No views found that are compatible with the supplied dataset URLs and hint.');
  }
  return resultViews;
};

class AbstractAutoConfig {
  async composeViewsConfig() { /* eslint-disable-line class-methods-use-this */
    throw new Error('The composeViewsConfig() method has not been implemented.');
  }

  async composeFileConfig() { /* eslint-disable-line class-methods-use-this */
    throw new Error('The composeFileConfig() method has not been implemented.');
  }
}

class OmeTiffAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.RASTER_JSON;
    this.fileName = fileUrl.split('/').at(-1);
  }

  async composeViewsConfig(hintsConfig) { /* eslint-disable-line class-methods-use-this */
    return filterViews(
      hintsConfig,
      [['description'], ['spatial'], ['layerController']],
    );
  }

  async composeFileConfig() {
    return {
      fileType: this.fileType,
      options: {
        images: [
          {
            metadata: {
              isBitmask: false,
            },
            name: this.fileName,
            type: 'ome-tiff',
            url: this.fileUrl,
          },
        ],
        schemaVersion: '0.0.2',
        usePhysicalSizeScaling: false,
      },
    };
  }
}

class OmeZarrAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.RASTER_OME_ZARR;
    this.fileName = fileUrl.split('/').at(-1);
  }

  async composeViewsConfig(hintsConfig) { /* eslint-disable-line class-methods-use-this */
    return filterViews(
      hintsConfig,
      [['description'], ['spatial'], ['layerController']],
    );
  }

  async composeFileConfig() {
    return {
      fileType: this.fileType,
      type: 'raster',
      url: this.fileUrl,
    };
  }
}

class AnndataZarrAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.ANNDATA_ZARR;
    this.fileName = fileUrl.split('/').at(-1);
    this.metadataSummary = {};
  }

  async composeFileConfig() {
    this.metadataSummary = await this.setMetadataSummary();

    const options = {
      obsEmbedding: [],
      obsFeatureMatrix: {
        path: 'X',
      },
    };

    this.metadataSummary.obsm.forEach((key) => {
      if (key.toLowerCase().includes(('obsm/x_segmentations'))) {
        options.obsSegmentations = { path: key };
      }
      if (key.toLowerCase().includes(('obsm/x_spatial'))) {
        options.obsLocations = { path: key };
      }
      if (key.toLowerCase().includes('obsm/x_umap')) {
        options.obsEmbedding.push({ path: key, embeddingType: 'UMAP' });
      }
      if (key.toLowerCase().includes('obsm/x_tsne')) {
        options.obsEmbedding.push({ path: key, embeddingType: 't-SNE' });
      }
      if (key.toLowerCase().includes('obsm/x_pca')) {
        options.obsEmbedding.push({ path: key, embeddingType: 'PCA' });
      }
    });

    const supportedObsSetsKeys = [
      'cluster', 'clusters', 'subcluster', 'cell_type', 'celltype', 'leiden', 'louvain', 'disease', 'organism', 'self_reported_ethnicity', 'tissue', 'sex',
    ];

    this.metadataSummary.obs.forEach((key) => {
      supportedObsSetsKeys.forEach((supportedKey) => {
        if (key.toLowerCase() === ['obs', supportedKey].join('/')) {
          if (!('obsSets' in options)) {
            options.obsSets = [
              {
                name: 'Cell Type',
                path: [key],
              },
            ];
          } else {
            options.obsSets[0].path.push(key);
          }
        }
      });
    });

    // if length of path is 1, storing the value as an array doesn't work
    // es-lint-disable-next-line max-len
    // Example: https://s3.amazonaws.com/vitessce-data/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr
    options.obsSets = options.obsSets?.map((obsSet) => {
      if (obsSet.path.length === 1) {
        return {
          ...obsSet,
          path: obsSet.path[0],
        };
      }
      return obsSet;
    });

    return {
      options,
      fileType: this.fileType,
      url: this.fileUrl,
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene',
        featureValueType: 'expression',
      },
    };
  }

  async composeViewsConfig(hintsConfig) {
    this.metadataSummary = await this.setMetadataSummary();
    const possibleViews = [];

    const hasCellSetData = this.metadataSummary.obs
      .filter(key => key.toLowerCase().includes('cluster')
        || key.toLowerCase().includes('cell_type')
        || key.toLowerCase().includes('celltype'));

    if (hasCellSetData.length > 0) {
      possibleViews.push(['obsSets']);
    }

    this.metadataSummary.obsm.forEach((key) => {
      if (key.toLowerCase().includes('obsm/x_umap')) {
        possibleViews.push(['scatterplot', { mapping: 'UMAP' }]);
      }
      if (key.toLowerCase().includes('obsm/x_tsne')) {
        possibleViews.push(['scatterplot', { mapping: 't-SNE' }]);
      }
      if (key.toLowerCase().includes('obsm/x_pca')) {
        possibleViews.push(['scatterplot', { mapping: 'PCA' }]);
      }
      if (key.toLowerCase().includes(('obsm/x_segmentations'))) {
        possibleViews.push(['layerController']);
      }
      if (key.toLowerCase().includes(('obsm/x_spatial'))) {
        possibleViews.push(['spatial']);
      }
    });

    possibleViews.push(['obsSetSizes']);
    possibleViews.push(['obsSetFeatureValueDistribution']);

    if (this.metadataSummary.X) {
      possibleViews.push(['heatmap']);
      possibleViews.push(['featureList']);
    }

    const views = filterViews(hintsConfig, possibleViews);
    return views;
  }

  async setMetadataSummaryWithZmetadata(response) { /* eslint-disable-line class-methods-use-this */
    const metadataFile = await response.json();
    if (!metadataFile.metadata) {
      throw new Error('Could not generate config: .zmetadata file is not valid.');
    }

    const obsmKeys = Object.keys(metadataFile.metadata)
      .filter(key => key.startsWith('obsm/X_'))
      .map(key => key.split('/.zarray')[0]);

    const obsKeysArr = Object.keys(metadataFile.metadata)
      .filter(key => key.startsWith('obs/')).map(key => key.split('/.za')[0]);

    function uniq(a) {
      return a.sort().filter((item, pos, ary) => !pos || item !== ary[pos - 1]);
    }
    const obsKeys = uniq(obsKeysArr);

    const X = Object.keys(metadataFile.metadata).filter(key => key.startsWith('X'));

    return {
      // Array of keys in obsm that are found by the fetches above
      obsm: obsmKeys,
      // Array of keys in obs that are found by the fetches above
      obs: obsKeys,
      // Boolean indicating whether the X array was found by the fetches above
      X: X.length > 0,
    };
  }

  async setMetadataSummaryWithoutZmetadata() {
    const knownMetadataFileSuffixes = [
      '/obsm/X_pca/.zarray',
      '/obsm/X_umap/.zarray',
      '/obsm/X_tsne/.zarray',
      '/obsm/X_spatial/.zarray',
      '/obsm/X_segmentations/.zarray',
      '/obs/.zattrs',
      '/X/.zarray',
      '/X/data/.zarray', // for https://s3.amazonaws.com/vitessce-data/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr
    ];

    const getObsmKey = (url) => {
      // Get the substring "X_pca" from a URL like
      // http://example.com/foo/adata.zarr/obsm/X_pca/.zarray
      const obsmKeyStartIndex = `${this.fileUrl}/`.length;
      const obsmKeyEndIndex = url.length - '/.zarray'.length;
      return url.substring(obsmKeyStartIndex, obsmKeyEndIndex);
    };

    const promises = knownMetadataFileSuffixes.map(suffix => fetch(`${this.fileUrl}${suffix}`));

    const fetchResults = await Promise.all(promises);
    const okFetchResults = fetchResults.filter(j => j.ok);
    const metadataSummary = {
      // Array of keys in obsm that are found by the fetches above
      obsm: [],
      // Array of keys in obs that are found by the fetches above
      obs: [],
      // Boolean indicating whether the X array was found by the fetches above
      X: false,
    };

    const obsPromiseResult = okFetchResults.find(
      r => r.url === (`${this.fileUrl}/obs/.zattrs`),
    );

    const isObsValid = obsAttr => Object.keys(obsAttr).includes('column-order')
      && Object.keys(obsAttr).includes('encoding-version')
      && Object.keys(obsAttr).includes('encoding-type')
      && obsAttr['encoding-type'] === 'dataframe'
      && (obsAttr['encoding-version'] === '0.1.0' || obsAttr['encoding-version'] === '0.2.0');

    if (obsPromiseResult) {
      const obsAttrs = await obsPromiseResult.json();
      if (isObsValid(obsAttrs)) {
        obsAttrs['column-order'].forEach(key => metadataSummary.obs.push(`obs/${key}`));
      } else {
        throw new Error('Could not generate config: /obs/.zattrs file is not valid.');
      }
    }

    okFetchResults
      .forEach((r) => {
        if (r.url.startsWith(`${this.fileUrl}/obsm`)) {
          const obsmKey = getObsmKey(r.url);
          if (obsmKey) {
            metadataSummary.obsm.push(obsmKey);
          }
        } else if (r.url.startsWith(`${this.fileUrl}/X`)) {
          metadataSummary.X = true;
        }
      });

    return metadataSummary;
  }

  async setMetadataSummary() {
    if (Object.keys(this.metadataSummary).length > 0) {
      return this.metadataSummary;
    }

    const metadataExtension = '.zmetadata';
    const url = [this.fileUrl, metadataExtension].join('/');
    return fetch(url).then((response) => {
      if (response.ok) {
        return this.setMetadataSummaryWithZmetadata(response);
      }
      if (response.status === 404) {
        return this.setMetadataSummaryWithoutZmetadata();
      }
      throw new Error(`Could not generate config: ${response.statusText}`);
    }).catch((error) => {
      throw new Error(`Could not generate config for URL ${this.fileUrl}: ${error}`);
    });
  }
}

const configClasses = [
  {
    extensions: ['.ome.tif', '.ome.tiff', '.ome.tf2', '.ome.tf8'],
    class: OmeTiffAutoConfig,
    name: 'OME-TIFF',
  },
  {
    extensions: ['.h5ad.zarr', '.adata.zarr', '.anndata.zarr'],
    class: AnndataZarrAutoConfig,
    name: 'AnnData-Zarr',
  },
  {
    extensions: ['ome.zarr'],
    class: OmeZarrAutoConfig,
    name: 'OME-Zarr',
  },
];

function calculateCoordinates(viewsNumb) {
  const rows = Math.ceil(Math.sqrt(viewsNumb));
  const cols = Math.ceil(viewsNumb / rows);
  const width = 12 / cols;
  const height = 12 / rows;
  const coords = [];

  for (let i = 0; i < viewsNumb; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * width;
    const y = row * height;

    // The coordinates have to be integer values:
    coords.push([
      Math.floor(x),
      Math.floor(y),
      // Ensure width/height is at least 1.
      Math.max(1, Math.floor(width)),
      Math.max(1, Math.floor(height)),
    ]);
  }

  return coords;
}

const spatialSegmentationLayerValue = {
  radius: 65,
  stroked: true,
  visible: true,
  opacity: 1,
};

/**
 * Inserts the spatial coordination space into the VitessceConfig views.
 * @param {Array of VitessceConfigView} of views
 * @param {VitessceConfig} vc instance
 */
function insertCoordinationSpaceForSpatial(views, vc) {
  const [
    spatialSegmentationLayer,
    spatialImageLayer,
    spatialZoom,
    spatialTargetX,
    spatialTargetY,
  ] = vc.addCoordination(
    ct.SPATIAL_SEGMENTATION_LAYER,
    ct.SPATIAL_IMAGE_LAYER,
    ct.SPATIAL_ZOOM,
    ct.SPATIAL_TARGET_X,
    ct.SPATIAL_TARGET_Y,
  );

  // Note: this always assumes the segmentation is polygon-based.
  // In the future, we may want to support both polygon-based and bitmask-based.
  spatialSegmentationLayer.setValue(spatialSegmentationLayerValue);
  // Note: this always assumes the image is RGB.
  // In the future, we may want to support both RGB and multi-channel.
  spatialImageLayer.setValue([
    {
      type: 'raster',
      index: 0,
      colormap: null,
      transparentColor: null,
      opacity: 1,
      domainType: 'Min/Max',
      channels: [
        {
          selection: {
            c: 0,
          },
          color: [
            255,
            0,
            0,
          ],
          visible: true,
          slider: [
            0,
            255,
          ],
        },
        {
          selection: {
            c: 1,
          },
          color: [
            0,
            255,
            0,
          ],
          visible: true,
          slider: [
            0,
            255,
          ],
        },
        {
          selection: {
            c: 2,
          },
          color: [
            0,
            0,
            255,
          ],
          visible: true,
          slider: [
            0,
            255,
          ],
        },
      ],
    },
  ]);

  views.forEach((view) => {
    if (view.view.component === 'spatial' || view.view.component === 'layerController') {
      view.useCoordination(spatialImageLayer);
      view.useCoordination(spatialSegmentationLayer);
      view.useCoordination(spatialZoom);
      view.useCoordination(spatialTargetX);
      view.useCoordination(spatialTargetY);
    }
  });
}

/**
 * Returns the type of the file, based on the file extension.
 * @param {string} url of the file.
 * @returns {object} An element from the `configClasses` array, which will be an object with
 * the properties `extensions: string[]`, `class` (an AutoConfig class definition) and
 * `name`: string.
 */
function getFileType(url) {
  const match = configClasses.find(obj => obj.extensions.filter(
    ext => url.endsWith(ext),
  ).length === 1);
  if (!match) {
    throw new Error('One or more of the URLs provided point to unsupported file types.');
  }
  return match;
}

async function generateViewDefinition(url, vc, dataset, hintsConfig) {
  let ConfigClassName;
  try {
    ConfigClassName = getFileType(url).class;
  } catch (err) {
    return Promise.reject(err);
  }

  const configInstance = new ConfigClassName(url);
  let fileConfig;
  let viewsConfig;
  try {
    fileConfig = await configInstance.composeFileConfig();
    viewsConfig = await configInstance.composeViewsConfig(hintsConfig);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }

  dataset.addFile(fileConfig);

  let layerControllerView = false;
  let spatialView = false;
  const views = [];

  viewsConfig.forEach((v) => {
    const view = vc.addView(dataset, ...v);
    if (v[0] === 'layerController') {
      layerControllerView = view;
    }
    if (v[0] === 'spatial') {
      spatialView = view;
    }
    // this piece of code can be removed once these props are added by default to layerController
    // see this issue: https://github.com/vitessce/vitessce/issues/1454
    if (v[0] === 'layerController') {
      view.setProps({
        disable3d: [],
        disableChannelsIfRgbDetected: true,
      });
    }
    // transpose the heatmap by default
    if (v[0] === 'heatmap' && configInstance instanceof AnndataZarrAutoConfig) {
      view.setProps({ transpose: true });
    }

    views.push(view);
  });

  if (layerControllerView && spatialView && configInstance instanceof AnndataZarrAutoConfig) {
    vc.linkViews(
      [spatialView, layerControllerView],
      [
        ct.SPATIAL_SEGMENTATION_LAYER,
      ],
      [spatialSegmentationLayerValue],
    );
  }

  return views;
}

/**
 * Returns the hints that are available for the given file URLs, depending on their types.
 * @param {Array} fileUrls containing urls of files to be loaded into Vitessce
 * @returns the hints available for these file URLs
 */
export function getHintOptions(fileUrls) {
  const fileTypes = {};

  fileUrls.forEach((url) => {
    const match = getFileType(url);
    // hints config only has OME-TIFF, since settings are the same for both OME-TIFF and OME-Zarr
    if (match.name === 'OME-Zarr') {
      fileTypes['OME-TIFF'] = true;
    } else {
      fileTypes[match.name] = true;
    }
  });

  const datasetType = Object.keys(fileTypes).sort().join(',');

  return HINT_TYPE_TO_FILE_TYPE_MAP?.[datasetType] || [];
}

/**
 *
 * @param {Array} fileUrls containing urls of files to be loaded into Vitessce
 * @param {String} the hints config to be used for the dataset. Null by default
 * @returns ViewConfig as JSON
 */
export async function generateConfig(fileUrls, hintTitle = null) {
  const vc = new VitessceConfig({
    schemaVersion: '1.0.15',
    name: 'An automatically generated config. Adjust values and add layout components if needed.',
    description: 'Populate with text relevant to this visualisation.',
  });

  const allViews = [];

  const dataset = vc.addDataset('An automatically generated view config for dataset. Adjust values and add layout components if needed.');

  const hintsConfig = !hintTitle ? { views: {} } : HINTS_CONFIG?.[hintTitle];
  if (!hintsConfig) {
    throw new Error(`Hints config not found for the supplied hint: ${hintTitle}.`);
  }

  const useHints = Object.keys(hintsConfig?.views)?.length > 0;

  fileUrls.forEach((url) => {
    allViews.push(generateViewDefinition(url, vc, dataset, hintsConfig));
  });

  return Promise.all(allViews).then((views) => {
    const flattenedViews = views.flat();

    // If coordinationSpaceRequired field is set to true in the HINTS_CONFIG,
    // then insert coordination space.
    // NOTE: the user needs to manually add the coordination values for the image and
    // segmentation layers which will be visualized in the spatial/layer controller views.
    if (hintsConfig?.coordinationSpaceRequired) {
      insertCoordinationSpaceForSpatial(flattenedViews, vc);
    }

    if (!useHints) {
      const coord = calculateCoordinates(flattenedViews.length);
      for (let i = 0; i < flattenedViews.length; i++) {
        flattenedViews[i].setXYWH(...coord[i]);
      }
    } else {
      flattenedViews.forEach((vitessceConfigView) => {
        const coordinates = Object.values(hintsConfig.views[vitessceConfigView.view.component]);
        vitessceConfigView.setXYWH(...coordinates);
      });
    }
    return vc.toJSON();
  });
}
