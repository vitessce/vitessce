import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateCodexConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'HBM634.MSKL.575',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/expr/reg001_expr.ome.tif?token=',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/expr/reg001_expr.offsets.json?token=',
    },
    coordinationValues: {
      fileUid: 'reg001_expr',
    },
  }).addFile({
    fileType: 'obsSegmentations.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/mask/reg001_mask.ome.tif?token=',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/mask/reg001_mask.offsets.json?token=',
      // TODO: figure out why tooltips are not working with this.
      coordinateTransformations: [
        {
          type: 'scale',
          // The mask does not specify PhysicalSizeX or PhysicalSizeY,
          // but the image does (377.44nm x 377.44nm),
          // so we need to scale the mask despite it having the same
          // pixel dimensions as the image.
          scale: [377.44 / 1000, 377.44 / 1000, 1, 1, 1],
        },
      ],
    },
    coordinationValues: {
      fileUid: 'reg001_mask',
    },
  }).addFile({
    fileType: 'anndata.zarr',
    options: {
      /*
      "obsEmbedding": [
        {
          "dims": [
            0,
            1
          ],
          "embeddingType": "t-SNE",
          "path": "obsm/tsne"
        }
      ],
      "obsFeatureMatrix": {
        "path": "X"
      },
      "obsLocations": {
        "path": "obsm/xy"
      },
      */
      obsSets: [
        {
          name: 'Cell K-Means',
          path: 'obs/Cell K-Means [tSNE_All_Features]',
        },
        /*
        {
          "name": "Cell K-Means [Mean-All-SubRegions] Expression",
          "path": "obs/Cell K-Means [Mean-All-SubRegions] Expression"
        },
        {
          "name": "Cell K-Means [Mean] Expression",
          "path": "obs/Cell K-Means [Mean] Expression"
        },
        {
          "name": "Cell K-Means [Shape-Vectors]",
          "path": "obs/Cell K-Means [Shape-Vectors]"
        },
        {
          "name": "Cell K-Means [Texture]",
          "path": "obs/Cell K-Means [Texture]"
        },
        {
          "name": "Cell K-Means [Total] Expression",
          "path": "obs/Cell K-Means [Total] Expression"
        },
        {
          "name": "Cell K-Means [Covariance] Expression",
          "path": "obs/Cell K-Means [Covariance] Expression"
        }
        */
      ],
    },
    url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/anndata-zarr/reg001_expr-anndata.zarr',
  })
    .addFile({
      fileType: 'anndata.zarr',
      options: {
        obsSets: [
          {
            name: 'Cell K-Means',
            path: 'obs/Cell K-Means [tSNE_All_Features]',
          },
        ],
      },
      url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/anndata-zarr/reg001_expr-anndata.zarr',
      coordinationValues: {
        obsType: 'nucleus',
      },
    });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSetsView = config.addView(dataset, 'obsSets');

  const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

  obsSetsView.useCoordination(selectionScope, colorScope);

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'reg001_expr',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'reg001_mask',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelOpacity: 1.0,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
            obsHighlight: null,
            obsSetSelection: selectionScope,
            obsSetColor: colorScope,
          },
          {
            obsType: 'nucleus',
            spatialTargetC: 1,
            spatialChannelColor: [91, 181, 231],
            spatialChannelOpacity: 0.8,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: true,
            spatialSegmentationStrokeWidth: 1,
            obsHighlight: null,
            obsSetSelection: selectionScope,
            obsSetColor: colorScope,
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialView, vconcat(lcView, obsSetsView)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const codexOop2023 = generateCodexConfig();
