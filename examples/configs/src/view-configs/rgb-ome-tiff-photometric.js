import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';


function generateRgbOmeTiffConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'HBM836.VTFP.364',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/98579094b2278af1ae06dfe29fe4190e/ometiff-pyramids/lab_processed/images/D239-RLL-15B3-117.ome.tif?token=AgrMGWXregW88PoOxpjkXz2j61XEBBX7gxvlV7m45DNmJJDWwmHXCYoGNmw11YyzJbw9ye7jBzOKbOf0ON38GsBpjjP',
    // url: 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif',
    coordinationValues: {
      fileUid: 'HBM836.VTFP.364',
    },
  });

  // const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  // const lcViewSimple = config.addView(dataset, 'layerControllerBeta');

  // config.linkViewsByObject([spatialViewSimple, lcViewSimple], {
  //   spatialTargetZ: 0,
  //   spatialTargetT: 0,
  //   imageLayer: CL([
  //     {
  //       fileUid: 'HBM836.VTFP.364',
  //       spatialLayerOpacity: 1,
  //       spatialLayerVisible: true,
  //       photometricInterpretation: 'BlackIsZero',
  //       // photometricInterpretation: 'RGB',
  //     },
  //   ]),

  // }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });


    const imageScopes = config.addCoordinationByObject({
        spatialTargetZ: 0,
        spatialTargetT: 0,
        imageLayer: CL([
          {
            fileUid: 'HBM836.VTFP.364',
            spatialLayerOpacity: 1,
            spatialLayerVisible: true,
            photometricInterpretation: 'BlackIsZero',
            // photometricInterpretation: 'RGB',
          },
        ]),
    
});
    
    const metaCoordinationScope = config.addMetaCoordination();
    metaCoordinationScope.useCoordinationByObject(imageScopes);
  
  
    const spatialViewSimple = config.addView(dataset, 'spatial');
    const lcViewSimple = config.addView(dataset, 'layerController');
  
  
    spatialViewSimple.useMetaCoordination(metaCoordinationScope);
    lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.layout(hconcat(spatialViewSimple, lcViewSimple));

  const configJSON = config.toJSON();
  return configJSON;
}

export const rgbOmeTiffPhotometric = generateRgbOmeTiffConfig();
