import { generateConfigs } from './VitessceAutoConfig.js';
import { /* HINTS_CONFIG, */ NO_HINTS_CONFIG } from './constants.js';

describe('src/VitessceAutoConfig.js with no hints', () => {
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
      e => expect(e.message).toContain('This file type is not supported.'),
    );
  });
});
