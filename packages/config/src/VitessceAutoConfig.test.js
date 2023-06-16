import { generateConfigs, getDatasetType } from './VitessceAutoConfig.js';
import { HINTS_CONFIG, NO_HINTS_CONFIG } from './constants.js';

describe('generateConfigs with no hints', () => {
  it('generates config for OME-TIFF file correctly', async () => {
    const urls = ['somefile.ome.tif'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              fileType: 'raster.json',
              options: {
                images: [
                  {
                    metadata: {
                      isBitmask: false,
                    },
                    name: 'somefile.ome.tif',
                    type: 'ome-tiff',
                    url: urls[0],
                  },
                ],
                schemaVersion: '0.0.2',
                usePhysicalSizeScaling: false,
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 6,
          h: 6,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 0,
          w: 6,
          h: 6,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 6,
          w: 6,
          h: 6,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config for OME-ZARR file correctly', async () => {
    const urls = ['anotherfile.ome.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              url: urls[0],
              fileType: 'raster.ome-zarr',
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 6,
          h: 6,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 0,
          w: 6,
          h: 6,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 6,
          w: 6,
          h: 6,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config for Anndata-ZARR file correctly', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/.anndata.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              url: urls[0],
              fileType: 'anndata.zarr',
              coordinationValues: {
                obsType: 'cell',
                featureType: 'gene',
                featureValueType: 'expression',
              },
              options: {
                obsEmbedding: [
                  {
                    path: 'obsm/X_umap',
                    embeddingType: 'UMAP',
                  },
                ],
                obsFeatureMatrix: {
                  path: 'X',
                },
                obsSets: [
                  {
                    name: 'Cell Type',
                    path: [
                      'obs/cell_type',
                      'obs/disease',
                      'obs/leiden',
                      'obs/organism',
                      'obs/self_reported_ethnicity',
                      'obs/sex',
                      'obs/tissue'],
                  },
                ],
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
        embeddingType: {
          A: 'UMAP',
        },
      },
      layout: [
        {
          component: 'obsSets',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 6,
          h: 4,
        },
        {
          component: 'scatterplot',
          coordinationScopes: {
            dataset: 'A',
            embeddingType: 'A',
          },
          x: 6,
          y: 0,
          w: 6,
          h: 4,
        },
        {
          component: 'obsSetSizes',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          w: 6,
          x: 0,
          y: 4,
        },
        {
          component: 'obsSetFeatureValueDistribution',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          w: 6,
          x: 6,
          y: 4,
        },
        {
          component: 'heatmap',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 8,
          w: 6,
          h: 4,
          props: {
            transpose: true,
          },
        },
        {
          component: 'featureList',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 8,
          w: 6,
          h: 4,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });

  it('generates correct config for Anndata-ZARR file with empty .zmetadata', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/emptymeta.h5ad.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              url: urls[0],
              fileType: 'anndata.zarr',
              coordinationValues: {
                obsType: 'cell',
                featureType: 'gene',
                featureValueType: 'expression',
              },
              options: {
                obsEmbedding: [],
                obsFeatureMatrix: {
                  path: 'X',
                },
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'obsSetSizes',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 6,
          w: 12,
          x: 0,
          y: 0,
        },
        {
          component: 'obsSetFeatureValueDistribution',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 6,
          w: 12,
          x: 0,
          y: 6,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error for Anndata-ZARR file with misconfigured .zmetadata', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/invalidmeta.adata.zarr'];

    await generateConfigs(urls, NO_HINTS_CONFIG, '', false).catch(
      e => expect(e.message).toContain('Could not generate config: .zmetadata file is not valid.'),
    );
  });

  it('generates config for multiple files correctly', async () => {
    const urls = ['somefile.ome.tif', 'anoterfile.ome.zarr'];
    const expectedNames = [urls[0].split('/').at(-1), urls[1].split('/').at(-1)];

    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              fileType: 'raster.json',
              options: {
                images: [
                  {
                    metadata: {
                      isBitmask: false,
                    },
                    name: expectedNames[0],
                    type: 'ome-tiff',
                    url: urls[0],
                  },
                ],
                schemaVersion: '0.0.2',
                usePhysicalSizeScaling: false,
              },
            },
            {
              url: urls[1],
              fileType: 'raster.ome-zarr',
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 6,
          h: 4,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 0,
          w: 6,
          h: 4,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 4,
          w: 6,
          h: 4,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 4,
          w: 6,
          h: 4,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 8,
          w: 6,
          h: 4,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
          x: 6,
          y: 8,
          w: 6,
          h: 4,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });


  it('Does the parsing when .zmetadata file not present in folder', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: "Don't use any hints dataset.",
          files: [
            {
              url: urls[0],
              fileType: 'anndata.zarr',
              coordinationValues: {
                obsType: 'cell',
                featureType: 'gene',
                featureValueType: 'expression',
              },
              options: {
                obsEmbedding: [
                  {
                    path: 'obsm/X_umap',
                    embeddingType: 'UMAP',
                  },
                ],
                obsFeatureMatrix: {
                  path: 'X',
                },
                obsSets: [
                  {
                    name: 'Cell Type',
                    path: 'obs/leiden',
                  },
                ],
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
        embeddingType: {
          A: 'UMAP',
        },
      },
      layout: [
        {
          component: 'scatterplot',
          coordinationScopes: {
            dataset: 'A',
            embeddingType: 'A',
          },
          x: 0,
          y: 0,
          w: 6,
          h: 4,
        },
        {
          component: 'obsSetSizes',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          w: 6,
          x: 6,
          y: 0,
        },
        {
          component: 'obsSetFeatureValueDistribution',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          w: 6,
          x: 0,
          y: 4,
        },
        {
          component: 'heatmap',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          props: {
            transpose: true,
          },
          w: 6,
          x: 6,
          y: 4,
        },
        {
          component: 'featureList',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 4,
          w: 6,
          x: 0,
          y: 8,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls, NO_HINTS_CONFIG, '', false);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error when URL with unsupported file format is passed', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/anndata-0.7/somefile.zarr'];

    await generateConfigs(urls, NO_HINTS_CONFIG, '', false).catch(
      e => expect(e.message).toContain('One or more of the URLs provided point to unsupported file types.'),
    );
  });
});

describe('generateConfigs with hints', () => {
  it('generates config with hints for OME-TIFF dataset types correctly', async () => {
    const urls = ['somefile.ome.tif'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'Image dataset.',
          files: [
            {
              fileType: 'raster.json',
              options: {
                images: [
                  {
                    metadata: {
                      isBitmask: false,
                    },
                    name: 'somefile.ome.tif',
                    type: 'ome-tiff',
                    url: urls[0],
                  },
                ],
                schemaVersion: '0.0.2',
                usePhysicalSizeScaling: false,
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 8,
          h: 12,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 8,
          y: 0,
          w: 4,
          h: 7,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 5,
          w: 4,
          x: 8,
          y: 9,
        },
      ],
      initStrategy: 'auto',
    };

    const hintsConfig = HINTS_CONFIG.C.hints['2'];
    const hintsType = HINTS_CONFIG.C.hintType;

    const config = await generateConfigs(urls, hintsConfig, hintsType, true);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config with hints for OME-ZARR dataset types correctly', async () => {
    const urls = ['somefile.ome.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'Image dataset.',
          files: [
            {
              fileType: 'raster.ome-zarr',
              url: 'somefile.ome.zarr',
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
      },
      layout: [
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 0,
          w: 8,
          h: 12,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 8,
          y: 0,
          w: 4,
          h: 7,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 5,
          w: 4,
          x: 8,
          y: 9,
        },
      ],
      initStrategy: 'auto',
    };

    const hintsConfig = HINTS_CONFIG.C.hints['2'];
    const hintsType = HINTS_CONFIG.C.hintType;

    const config = await generateConfigs(urls, hintsConfig, hintsType, true);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config hints for Anndata-Zarr, OME-TIFF dataset types correctly', async () => {
    const urls = ['somefile.ome.tif', 'http://localhost:51204/@fixtures/zarr/partials/.anndata.zarr'];
    const expectedNames = [urls[0].split('/').at(-1), urls[1].split('/').at(-1)];

    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'Spatial transcriptomics (with histology image and polygon cell segmentations) dataset.',
          files: [
            {
              fileType: 'raster.json',
              options: {
                images: [
                  {
                    metadata: {
                      isBitmask: false,
                    },
                    name: expectedNames[0],
                    type: 'ome-tiff',
                    url: urls[0],
                  },
                ],
                schemaVersion: '0.0.2',
                usePhysicalSizeScaling: false,
              },
            },
            {
              url: urls[1],
              coordinationValues: {
                featureType: 'gene',
                featureValueType: 'expression',
                obsType: 'cell',
              },
              fileType: 'anndata.zarr',
              options: {
                obsFeatureMatrix: {
                  path: 'X',
                },
                obsEmbedding: [
                  {
                    embeddingType: 'UMAP',
                    path: 'obsm/X_umap',
                  },
                ],
                obsSets: [
                  {
                    name: 'Cell Type',
                    path: [
                      'obs/cell_type',
                      'obs/disease',
                      'obs/leiden',
                      'obs/organism',
                      'obs/self_reported_ethnicity',
                      'obs/sex',
                      'obs/tissue',
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
      coordinationSpace: {
        dataset: {
          A: 'A',
        },
        spatialSegmentationLayer: {
          A: {
            radius: 65,
            stroked: true,
            visible: true,
            opacity: 1,
          },
        },
        spatialImageLayer: {
          A: [
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
          ],
        },
        spatialZoom: {
          A: -2.598,
        },
        spatialTargetX: {
          A: 1008.88,
        },
        spatialTargetY: {
          A: 1004.69,
        },
      },
      layout: [
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
            spatialImageLayer: 'A',
            spatialSegmentationLayer: 'A',
            spatialTargetX: 'A',
            spatialTargetY: 'A',
            spatialZoom: 'A',
          },
          h: 6,
          w: 6,
          x: 0,
          y: 0,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
            spatialImageLayer: 'A',
            spatialSegmentationLayer: 'A',
          },
          h: 6,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
          w: 4,
          x: 8,
          y: 6,
        },
        {
          component: 'heatmap',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 6,
          w: 8,
          h: 6,
          props: {
            transpose: true,
          },
        },
        {
          component: 'obsSets',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 9,
          y: 0,
          w: 3,
          h: 6,
        },
        {
          component: 'featureList',
          coordinationScopes: {
            dataset: 'A',
          },
          h: 6,
          w: 3,
          x: 6,
          y: 0,
        },
      ],
      initStrategy: 'auto',
    };

    const hintsConfig = HINTS_CONFIG.B.hints['2'];
    const hintsType = HINTS_CONFIG.B.hintType;

    const config = await generateConfigs(urls, hintsConfig, hintsType, true);

    expect(config).toEqual(expectedConfig);
  });
});

describe('getDatasetType tests', () => {
  it('correctly identifies Anndata-Zarr file types', () => {
    const urls = ['somefile.anndata.zarr', 'anotheranndatafile.adata.zarr'];
    const datasetType = getDatasetType(urls);
    expect(datasetType).toEqual(['AnnData-Zarr']);
  });
  it('correctly identifies OME-Zarr file types', () => {
    const urls = ['somefile.ome.zarr'];
    const datasetType = getDatasetType(urls);
    expect(datasetType).toEqual(['OME-TIFF']);
  });
  it('correctly identifies OME-TIFF file types', () => {
    const urls = ['somefile.ome.tif'];
    const datasetType = getDatasetType(urls);
    expect(datasetType).toEqual(['OME-TIFF']);
  });
  it('correctly identifies [Anndata-Zarr, OME-TIFF] file types', () => {
    const urls = ['somefile.ome.tif', 'anotheranndatafile.adata.zarr'];
    const datasetType = getDatasetType(urls);
    expect(datasetType.sort()).toEqual(['AnnData-Zarr', 'OME-TIFF'].sort());
  });
  it('one or more of the URLs provided contain unsupported file types', () => {
    const urls = ['somefile.ome.tif', 'anotheranndatafile.bla.bla.bla'];
    expect(() => getDatasetType(urls)).toThrow('One or more of the URLs provided point to unsupported file types.');
  });
});
