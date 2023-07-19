import { describe, it, expect } from 'vitest';
import { generateConfig, getHintOptions } from './VitessceAutoConfig.js';
import { HINT_TYPE_TO_FILE_TYPE_MAP } from './constants.js';

describe('generateConfig', () => {
  it('generates config for OME-TIFF file correctly', async () => {
    const urls = ['somefile.ome.tif'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
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
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config for Anndata-ZARR file correctly', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('generates correct config for Anndata-ZARR file with empty .zmetadata', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/emptymeta.h5ad.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error for Anndata-ZARR file with misconfigured .zmetadata', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/invalidmeta.adata.zarr'];
    // References:
    // - https://vitest.dev/api/expect.html#tothrowerror
    // - https://vitest.dev/api/expect.html#rejects
    await expect(() => generateConfig(urls))
      .rejects
      .toThrowError('Could not generate config: .zmetadata file is not valid.');
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
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
    expect(config).toEqual(expectedConfig);
  });


  it('Does the parsing when .zmetadata file not present in folder', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const config = await generateConfig(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error when URL with unsupported file format is passed', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/anndata-0.7/somefile.zarr'];

    await generateConfig(urls, 'Transcriptomics / scRNA-seq (with heatmap)').catch(
      e => expect(e.message).toContain('One or more of the URLs provided point to unsupported file types.'),
    );
  });

  // ********** TESTS WITH HINTS **********

  it('generates config with hints for OME-TIFF dataset types correctly', async () => {
    const urls = ['somefile.ome.tif'];
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const viewConfig = await generateConfig(urls, 'Image');
    expect(viewConfig).toEqual(expectedConfig);
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
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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

    const viewConfig = await generateConfig(urls, 'Image');
    expect(viewConfig).toEqual(expectedConfig);
  });

  it('generates config hints for Anndata-Zarr, OME-TIFF dataset types correctly', async () => {
    const urls = ['somefile.ome.tif', 'http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr'];
    const expectedNames = [urls[0].split('/').at(-1), urls[1].split('/').at(-1)];

    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
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
          A: null,
        },
        spatialTargetX: {
          A: null,
        },
        spatialTargetY: {
          A: null,
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
            spatialTargetX: 'A',
            spatialTargetY: 'A',
            spatialZoom: 'A',
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

    const viewConfig = await generateConfig(
      urls,
      'Spatial transcriptomics (with histology image and polygon cell segmentations)',
    );

    expect(viewConfig).toEqual(expectedConfig);
  });

  it('raises an error if the supplied dataset URLs and hint do not have any compatible views', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr'];
    const hint = 'Image';

    await generateConfig(urls, hint).catch(
      e => expect(e.message).toContain('No views found that are compatible with the supplied dataset URLs and hint.'),
    );
  });

  it('raises an error if no views are found for the supplied hint string', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr'];
    const hint = 'I do not exist';

    await generateConfig(urls, hint).catch(
      e => expect(e.message).toContain('Hints config not found for the supplied hint: I do not exist'),
    );
  });

  // ********** TESTS OF GET HINTS OPTIONS **********

  it('returns a list of hints options for the supplied dataset URLs', async () => {
    const urls = ['http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr'];
    const actualHintOptions = getHintOptions(urls);

    expect(actualHintOptions).toEqual(HINT_TYPE_TO_FILE_TYPE_MAP['AnnData-Zarr']);
  });

  it('returns a list of hints options for the supplied dataset URLs', async () => {
    const urls = [
      'http://localhost:4204/@fixtures/zarr/partials/.anndata.zarr',
      'somefile.ome.zarr',
      'http://localhost:4204/@fixtures/zarr/partials/.adata.zarr',
      'somefile.ome.tiff',
    ];
    const actualHintOptions = getHintOptions(urls);

    expect(actualHintOptions).toEqual(HINT_TYPE_TO_FILE_TYPE_MAP['AnnData-Zarr,OME-TIFF']);
  });

  it('raises an error if no hints options are found for the supplied dataset URLs', async () => {
    const urls = ['unsupportedfiletype.txt', 'unsupportedfiletype2.ome.tiff'];

    try {
      getHintOptions(urls);
    } catch (e) {
      expect(e.message).toContain('One or more of the URLs provided point to unsupported file types.');
    }
  });
});
