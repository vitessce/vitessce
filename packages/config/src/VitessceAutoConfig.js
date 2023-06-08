import { CoordinationType, FileType } from '@vitessce/constants-internal';
import {
  VitessceConfig,
} from './VitessceConfig.js';


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


  async composeViewsConfig() { /* eslint-disable-line class-methods-use-this */
    return [
      ['description'],
      ['spatial'],
      ['layerController'],
    ];
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

  async composeViewsConfig() { /* eslint-disable-line class-methods-use-this */
    return [
      ['description'],
      ['spatial'],
      ['layerController'],
      ['status'],
    ];
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
      'cluster', 'subcluster', 'cell_type', 'leiden', 'louvain', 'disease', 'organism', 'self_reported_ethnicity', 'tissue', 'sex',
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

  async composeViewsConfig() {
    this.metadataSummary = await this.setMetadataSummary();

    const views = [];

    const hasCellSetData = this.metadataSummary.obs
      .filter(key => key.toLowerCase().includes('cluster') || key.toLowerCase().includes('cell_type'));

    if (hasCellSetData.length > 0) {
      views.push(['obsSets']);
    }

    this.metadataSummary.obsm.forEach((key) => {
      if (key.toLowerCase().includes('obsm/x_umap')) {
        views.push(['scatterplot', { mapping: 'UMAP' }]);
      }
      if (key.toLowerCase().includes('obsm/x_tsne')) {
        views.push(['scatterplot', { mapping: 't-SNE' }]);
      }
      if (key.toLowerCase().includes('obsm/x_pca')) {
        views.push(['scatterplot', { mapping: 'PCA' }]);
      }
      if (key.toLowerCase().includes(('obsm/x_segmentations'))) {
        views.push(['layerController']);
      }
      if (key.toLowerCase().includes(('obsm/x_spatial'))) {
        views.push(['spatial']);
      }
    });

    if (this.metadataSummary.X) {
      views.push(['heatmap']);
      views.push(['featureList']);
    }

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

function getFileType(url) {
  const match = configClasses.find(obj => obj.extensions.filter(
    ext => url.endsWith(ext),
  ).length === 1);
  if (!match) {
    throw new Error(`Could not generate config for URL: ${url}. This file type is not supported.`);
  }
  return match;
}

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
    coords.push([x, y, width, height]);
  }

  return coords;
}

async function generateConfig(url, vc) {
  let ConfigClassName;
  try {
    ConfigClassName = getFileType(url).class;
    console.log(`**** Generating config for ${url} using ${ConfigClassName.name}`);
  } catch (err) {
    return Promise.reject(err);
  }

  const configInstance = new ConfigClassName(url);
  let fileConfig;
  let viewsConfig;
  try {
    fileConfig = await configInstance.composeFileConfig();
    viewsConfig = await configInstance.composeViewsConfig();
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }

  const dataset = vc
    .addDataset(configInstance.fileName)
    .addFile(fileConfig);

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
    if (v[0] === 'layerController' && configInstance instanceof OmeTiffAutoConfig) {
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
    const spatialSegmentationLayerValue = {
      opacity: 1,
      radius: 0,
      visible: true,
      stroked: false,
    };

    vc.linkViews(
      [spatialView, layerControllerView],
      [
        CoordinationType.SPATIAL_ZOOM,
        CoordinationType.SPATIAL_TARGET_X,
        CoordinationType.SPATIAL_TARGET_Y,
        CoordinationType.SPATIAL_SEGMENTATION_LAYER,
      ],
      [-5.5, 16000, 20000, spatialSegmentationLayerValue],
    );
  }

  return views;
}

// http://localhost:9000/example_files/codeluppi_2018_nature_methods.cells.h5ad.zarr, http://localhost:9000/example_files/codeluppi_2018_nature_methods.cells.ome.tiff

export function getFileTypes(fileUrls) {
  let fileTypes = [];

  // todo: this function is broken
  fileUrls.forEach((url) => {
    try {
      const match = getFileType(url);
      fileTypes.push(match.name);
    } catch (err) {
      console.error("not supported file type, but ignoring the error");
    }
  });

  console.log("File types: ", fileTypes);

  return fileTypes; // todo: we need to make these unique
}

export async function generateConfigs(fileUrls) {
  const vc = new VitessceConfig({
    schemaVersion: '1.0.15',
    name: 'An automatically generated config. Adjust values and add layout components if needed.',
    description: 'Populate with text relevant to this visualisation.',
  });

  const allViews = [];

  fileUrls.forEach((url) => {
    allViews.push(generateConfig(url, vc));
  });

  return Promise.all(allViews).then((views) => {
    const flattenedViews = views.flat();

    const coord = calculateCoordinates(flattenedViews.length);

    for (let i = 0; i < flattenedViews.length; i++) {
      flattenedViews[i].setXYWH(...coord[i]);
    }

    return vc.toJSON();
  });
}
