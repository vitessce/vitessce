import { generateConfigs } from './VitessceAutoConfig.js';

describe('src/VitessceAutoConfig.js', () => {
  it('generates config for OME-TIFF file correctly', async () => {
    const urls = ['somefile.ome.tif'];
    const expectedName = urls[0].split('/').at(-1);
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: expectedName,
          files: [
            {
              fileType: 'raster.json',
              options: {
                images: [
                  {
                    metadata: {
                      isBitmask: false,
                    },
                    name: expectedName,
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

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config for OME-ZARR file correctly', async () => {
    const urls = ['anotherfile.ome.zarr'];
    const expectedName = urls[0].split('/').at(-1);
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: expectedName,
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
        },
        {
          component: 'status',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 6,
          w: 6,
          h: 6,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('generates config for Anndata-ZARR file correctly', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/.anndata.zarr'];
    const expectedName = urls[0].split('/').at(-1);
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: expectedName,
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
          h: 6,
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
          h: 6,
        },
        {
          component: 'heatmap',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 6,
          w: 6,
          h: 6,
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
          y: 6,
          w: 6,
          h: 6,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('generates empty config for Anndata-ZARR file with empty .zmetadata', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/emptymeta.h5ad.zarr'];
    const expectedName = urls[0].split('/').at(-1);
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: expectedName,
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
      layout: [],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error for Anndata-ZARR file with misconfigured .zmetadata', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/invalidmeta.adata.zarr'];

    await generateConfigs(urls).catch(
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
          name: expectedNames[0],
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
          ],
        },
        {
          uid: 'B',
          name: expectedNames[1],
          files: [
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
          B: 'B',
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
          w: 4,
          h: 4,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 4,
          y: 0,
          w: 4,
          h: 4,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 8,
          y: 0,
          w: 4,
          h: 4,
          props: {
            disable3d: [],
            disableChannelsIfRgbDetected: true,
          },
        },
        {
          component: 'description',
          coordinationScopes: {
            dataset: 'B',
          },
          x: 0,
          y: 4,
          w: 4,
          h: 4,
        },
        {
          component: 'spatial',
          coordinationScopes: {
            dataset: 'B',
          },
          x: 4,
          y: 4,
          w: 4,
          h: 4,
        },
        {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'B',
          },
          x: 8,
          y: 4,
          w: 4,
          h: 4,
        },
        {
          component: 'status',
          coordinationScopes: {
            dataset: 'B',
          },
          x: 0,
          y: 8,
          w: 4,
          h: 4,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });


  it('Does the parsing when .zmetadata file not present in folder', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/partials/anndata-csr.adata.zarr'];
    const expectedName = urls[0].split('/').at(-1);
    const expectedConfig = {
      version: '1.0.15',
      name: 'An automatically generated config. Adjust values and add layout components if needed.',
      description: 'Populate with text relevant to this visualisation.',
      datasets: [
        {
          uid: 'A',
          name: expectedName,
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
                      'obs/leiden',
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
          h: 6,
        },
        {
          component: 'heatmap',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 6,
          y: 0,
          w: 6,
          h: 6,
          props: {
            transpose: true,
          },
        },
        {
          component: 'featureList',
          coordinationScopes: {
            dataset: 'A',
          },
          x: 0,
          y: 6,
          w: 6,
          h: 6,
        },
      ],
      initStrategy: 'auto',
    };

    const config = await generateConfigs(urls);
    expect(config).toEqual(expectedConfig);
  });

  it('raises an error when URL with unsupported file format is passed', async () => {
    const urls = ['http://localhost:51204/@fixtures/zarr/anndata-0.7/somefile.zarr'];

    await generateConfigs(urls).catch(
      e => expect(e.message).toContain('This file type is not supported.'),
    );
  });
});
