/* eslint-disable max-len */
import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat,
    vconcat,
    getInitialCoordinationScopePrefix,
  } from '@vitessce/config';
  
  function generateNeuroglancerMocosko() {
    const config = new VitessceConfig({
      schemaVersion: '1.0.18',
      name: 'MOCOSCO dataset',
    });
  
  //  const sdataUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr';
  
    const pointsUrl = 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/macosko/pucks';
    const segmentationsUrl = 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/macosko/';
  
    const withPoints = true;
  
    // Note: tissue-map-tools creates an AnnotationProperty for every column in the sdata Points element dask dataframe.
    // This means that we will need to read the parquet metadata of the corresponding Points element to determine which annotation properties are available.
    // For the featureKey specifically, we can just use the spatialdata_attrs (we do not need to look in the parquet file for this).
    // This is relevant to the shader generation code in shader-utils.js,
    // e.g., we cannot just assume that
    // Reference: https://github.com/hms-dbmi/tissue-map-tools/blob/6a904241436e946ffbadef24b780a33321754991/src/tissue_map_tools/converters.py#L295
  
    // https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr/points/molecule_baysor/points.parquet/part.0.parquet
  
    const dataset = config.addDataset('My dataset');
  
    dataset.addFile({
      fileType: 'obsSegmentations.ng-precomputed',
      url: segmentationsUrl,
      options: {
        subsources: {
          default: true,
          bounds: false,
          mesh: true,
        },
        enableDefaultSubsources: false,
      },
      coordinationValues: {
        fileUid: 'merfish-meshes',
        obsType: 'cell',
      },
    });
  
    if (withPoints) {
      dataset.addFile({
        fileType: 'obsPoints.ng-annotations',
        url: pointsUrl,
        options: {
          projectionAnnotationSpacing: 2.4544585683772735,
          featureIndexProp: 'gene', // This corresponds to the prop_gene() in the Neuroglancer shader code.
          pointIndexProp: 'gene', // This corresponds to the prop_point_id() in the Neuroglancer shader code.
        },
        coordinationValues: {
          fileUid: 'merfish-points',
          obsType: 'point',
          featureType: 'gene', // Important for correspondence with obsFeatureMatrix for the gene list.
        },
      });
    }
  
    dataset.addFile({
      fileType: 'obsSets.csv',
      url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/macosko/brain_regions.csv',
      coordinationValues: {
        obsType: 'cell',
      },
      options: {
        obsIndex: 'id',
        obsSets: [
          {
            name: 'Region',
            column: 'layer',
          },
  
        ],
      },
    });
  
    const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
      // Note: this is a temporary mechanism to pass an initial NG camera state.
      // Ideally, all camera state should be passed via the existing spatialZoom, spatialTargetX, spatialRotationOrbit, etc,
      // and then NeuroglancerSubscriber should internally convert to NG-compatible values, which would eliminate the need for this.
      initialNgCameraState: {
        position: [
          6853126.5,
          2365343.75,
          5609465,
        ],
        projectionScale: 2586140.338401254,
        projectionOrientation: [
          0.5222588181495667,
          0.35620978474617004,
          -0.7747146487236023,
          -0.013324383646249771,
        ],
      },
    });
    const lcView = config.addView(dataset, 'layerControllerBeta')//.setProps({ layerPerFeatureForPoints: true });
    // const obsSets = config.addView(dataset, 'obsSets');
  
    config.linkViewsByObject([neuroglancerView, lcView], {
      spatialRenderingMode: '3D',
      spatialZoom: 0,
      spatialTargetT: 0,
      spatialTargetX: 0,
      spatialTargetY: 0,
      spatialTargetZ: 0,
      spatialRotationX: 0,
      spatialRotationY: 0,
      spatialRotationZ: 0,
      spatialRotationOrbit: 0,
    }, { meta: false });
  
    config.linkViewsByObject([neuroglancerView, lcView], {
      segmentationLayer: CL([
        {
          fileUid: 'merfish-meshes',
          spatialLayerOpacity: 1,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              obsType: 'cell',
              spatialChannelColor: [255, 0, 0],
              spatialChannelVisible: true,
              spatialChannelOpacity: 1.0,
              obsColorEncoding: 'cellSetSelection',
            },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });
  
    if (withPoints) {
      config.linkViewsByObject([neuroglancerView, lcView], {
        pointLayer: CL([
          {
            fileUid: 'merfish-points',
            obsType: 'point',
            featureType: 'gene',
            spatialLayerOpacity: 1,
            spatialLayerVisible: true,
            obsColorEncoding: 'geneSelection',
            featureColor: [
              { name: 'Ada', color: [255, 0, 0] },
            ],
          },
        ]),
      }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });
    }
  
    // config.layout(hconcat(neuroglancerView, vconcat(lcView, obsSets)));
    config.layout(hconcat(neuroglancerView, vconcat(lcView)));
    
    const configJSON = config.toJSON();
    return configJSON;
  }
  
  export const neuroglancerMocosko = generateNeuroglancerMocosko();