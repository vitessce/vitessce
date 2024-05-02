import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidneyDecimatedConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Jain Kidney Decimated 2024',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGwbkepqkQYVHCt8w9%2BYan1pdeIndceC6SdLUYl5hg3rAiAcxgWKHQHpw8YDMJhfPOjbcpMTRkXrhyQ8TRNwB%2FwxBirsAwgfEAEaDDEzNjU3NjUyMjA0OCIMk9a5Zl0J1p9ZY6bsKskDnxX%2Fqnf98hH%2FDHq9psEVXTLJqaz%2FwFsgyANO7L2gCT4jPf%2BfP%2Fy9g42ETpUKMUWXkleOIXbCFyRm1ASkt8hvyqMYEVisutHwzfGbYEmJDhMN88fjQpuIge6EXNbr7xyhKEO3bc3z6ymCUhM5uTxXY5IlY3HmeqHpcjsYISBXBHvFkSwaEiWO5dOY2xzoij2OZGbHetfUSfSGp2FRdAEGQF0XH9FARRIBQRw%2FSAxjckcSwQKWmx9E%2B2I3e6BGGUEOB%2FaCNHs1LNuRmKXB81Pqq18%2BveeUFLk4c%2FrfHQQ27PwgPfHRVKvrvGW1a7pQvD635VD%2BxlpwhI1M1e5QGoYHjl9G7123skdogRwVOqnYxsYyjBHjR6UfOELNs8LIXX00cdg71dm7ImzjgN5T31o1TP6yZ0RJrh1cONcokN6QSQfoAToeqcmj0YEG0o3VNxN1BUqXS57lhCuxi0xJBu42nu45fLeqEWYpr685AeFGqMsSQjTk64h2ZsBg7mjThKxYHXYGlGjbBBEn1E2FmCazidzuCR2y%2FPlK34Y7%2B20w0mr2fejCIHd%2FPofquiayc9VkaL1zQ4ki%2BZINVialnh5%2BW%2Flm7lcJ8FRszzDupMCxBjqVAsuS2LmfjtsscvUOabNQnSXOgmaAgcnKa3A8xWmbbafbZ4U86b%2FaGzfq3o%2Fr1dyQRc5PZwuwptKr4pj6h9GMD9d8MpzL8I%2B7tKxfQHZpHkAMuremRWkw9dUFbLgdL8%2BX5wkQaNzJdOOQiGOINVlfvDNJkJd0wjVYAZw0xqIhlHLOhIVPvdiUNCzdEeoSi5fWLCt4TmDUIlG%2BwOH04ylCFP4MlWHthsHgrafdJKe7orgtNq5INScEPDuZb46XVBPb12iLGM8wM5cNBh5DIwHszEX8pa3%2FDSropvacNEyDeG%2BXN5wd8fVpbbsX8AkTetYwSuBXQXY%2BAQOJpkjdRU0LlKKZBffbidxeDKV%2BANx7%2B54Ve006GRY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240429T213618Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AMDYIIXMD%2F20240429%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3a0b32cae111a3794c502dda0e187728e34d145bde3b3844f6af9520e8a07dd5',
    options: {
      offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGwbkepqkQYVHCt8w9%2BYan1pdeIndceC6SdLUYl5hg3rAiAcxgWKHQHpw8YDMJhfPOjbcpMTRkXrhyQ8TRNwB%2FwxBirsAwgfEAEaDDEzNjU3NjUyMjA0OCIMk9a5Zl0J1p9ZY6bsKskDnxX%2Fqnf98hH%2FDHq9psEVXTLJqaz%2FwFsgyANO7L2gCT4jPf%2BfP%2Fy9g42ETpUKMUWXkleOIXbCFyRm1ASkt8hvyqMYEVisutHwzfGbYEmJDhMN88fjQpuIge6EXNbr7xyhKEO3bc3z6ymCUhM5uTxXY5IlY3HmeqHpcjsYISBXBHvFkSwaEiWO5dOY2xzoij2OZGbHetfUSfSGp2FRdAEGQF0XH9FARRIBQRw%2FSAxjckcSwQKWmx9E%2B2I3e6BGGUEOB%2FaCNHs1LNuRmKXB81Pqq18%2BveeUFLk4c%2FrfHQQ27PwgPfHRVKvrvGW1a7pQvD635VD%2BxlpwhI1M1e5QGoYHjl9G7123skdogRwVOqnYxsYyjBHjR6UfOELNs8LIXX00cdg71dm7ImzjgN5T31o1TP6yZ0RJrh1cONcokN6QSQfoAToeqcmj0YEG0o3VNxN1BUqXS57lhCuxi0xJBu42nu45fLeqEWYpr685AeFGqMsSQjTk64h2ZsBg7mjThKxYHXYGlGjbBBEn1E2FmCazidzuCR2y%2FPlK34Y7%2B20w0mr2fejCIHd%2FPofquiayc9VkaL1zQ4ki%2BZINVialnh5%2BW%2Flm7lcJ8FRszzDupMCxBjqVAsuS2LmfjtsscvUOabNQnSXOgmaAgcnKa3A8xWmbbafbZ4U86b%2FaGzfq3o%2Fr1dyQRc5PZwuwptKr4pj6h9GMD9d8MpzL8I%2B7tKxfQHZpHkAMuremRWkw9dUFbLgdL8%2BX5wkQaNzJdOOQiGOINVlfvDNJkJd0wjVYAZw0xqIhlHLOhIVPvdiUNCzdEeoSi5fWLCt4TmDUIlG%2BwOH04ylCFP4MlWHthsHgrafdJKe7orgtNq5INScEPDuZb46XVBPb12iLGM8wM5cNBh5DIwHszEX8pa3%2FDSropvacNEyDeG%2BXN5wd8fVpbbsX8AkTetYwSuBXQXY%2BAQOJpkjdRU0LlKKZBffbidxeDKV%2BANx7%2B54Ve006GRY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240429T213633Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AMDYIIXMD%2F20240429%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ca72d4577a28ae6ddd1861c1799a7c110b4010ee85cbb76b51c33a041e4b3715',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  }).addFile({
    fileType: 'segmentation.glb',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGwbkepqkQYVHCt8w9%2BYan1pdeIndceC6SdLUYl5hg3rAiAcxgWKHQHpw8YDMJhfPOjbcpMTRkXrhyQ8TRNwB%2FwxBirsAwgfEAEaDDEzNjU3NjUyMjA0OCIMk9a5Zl0J1p9ZY6bsKskDnxX%2Fqnf98hH%2FDHq9psEVXTLJqaz%2FwFsgyANO7L2gCT4jPf%2BfP%2Fy9g42ETpUKMUWXkleOIXbCFyRm1ASkt8hvyqMYEVisutHwzfGbYEmJDhMN88fjQpuIge6EXNbr7xyhKEO3bc3z6ymCUhM5uTxXY5IlY3HmeqHpcjsYISBXBHvFkSwaEiWO5dOY2xzoij2OZGbHetfUSfSGp2FRdAEGQF0XH9FARRIBQRw%2FSAxjckcSwQKWmx9E%2B2I3e6BGGUEOB%2FaCNHs1LNuRmKXB81Pqq18%2BveeUFLk4c%2FrfHQQ27PwgPfHRVKvrvGW1a7pQvD635VD%2BxlpwhI1M1e5QGoYHjl9G7123skdogRwVOqnYxsYyjBHjR6UfOELNs8LIXX00cdg71dm7ImzjgN5T31o1TP6yZ0RJrh1cONcokN6QSQfoAToeqcmj0YEG0o3VNxN1BUqXS57lhCuxi0xJBu42nu45fLeqEWYpr685AeFGqMsSQjTk64h2ZsBg7mjThKxYHXYGlGjbBBEn1E2FmCazidzuCR2y%2FPlK34Y7%2B20w0mr2fejCIHd%2FPofquiayc9VkaL1zQ4ki%2BZINVialnh5%2BW%2Flm7lcJ8FRszzDupMCxBjqVAsuS2LmfjtsscvUOabNQnSXOgmaAgcnKa3A8xWmbbafbZ4U86b%2FaGzfq3o%2Fr1dyQRc5PZwuwptKr4pj6h9GMD9d8MpzL8I%2B7tKxfQHZpHkAMuremRWkw9dUFbLgdL8%2BX5wkQaNzJdOOQiGOINVlfvDNJkJd0wjVYAZw0xqIhlHLOhIVPvdiUNCzdEeoSi5fWLCt4TmDUIlG%2BwOH04ylCFP4MlWHthsHgrafdJKe7orgtNq5INScEPDuZb46XVBPb12iLGM8wM5cNBh5DIwHszEX8pa3%2FDSropvacNEyDeG%2BXN5wd8fVpbbsX8AkTetYwSuBXQXY%2BAQOJpkjdRU0LlKKZBffbidxeDKV%2BANx7%2B54Ve006GRY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240429T213540Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AMDYIIXMD%2F20240429%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2e252f32a30982baa6ba214021cc583ccc766771e14bbb0c0900d146cb4147ce',
    coordinationValues: {
      fileUid: 'gloms',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGwbkepqkQYVHCt8w9%2BYan1pdeIndceC6SdLUYl5hg3rAiAcxgWKHQHpw8YDMJhfPOjbcpMTRkXrhyQ8TRNwB%2FwxBirsAwgfEAEaDDEzNjU3NjUyMjA0OCIMk9a5Zl0J1p9ZY6bsKskDnxX%2Fqnf98hH%2FDHq9psEVXTLJqaz%2FwFsgyANO7L2gCT4jPf%2BfP%2Fy9g42ETpUKMUWXkleOIXbCFyRm1ASkt8hvyqMYEVisutHwzfGbYEmJDhMN88fjQpuIge6EXNbr7xyhKEO3bc3z6ymCUhM5uTxXY5IlY3HmeqHpcjsYISBXBHvFkSwaEiWO5dOY2xzoij2OZGbHetfUSfSGp2FRdAEGQF0XH9FARRIBQRw%2FSAxjckcSwQKWmx9E%2B2I3e6BGGUEOB%2FaCNHs1LNuRmKXB81Pqq18%2BveeUFLk4c%2FrfHQQ27PwgPfHRVKvrvGW1a7pQvD635VD%2BxlpwhI1M1e5QGoYHjl9G7123skdogRwVOqnYxsYyjBHjR6UfOELNs8LIXX00cdg71dm7ImzjgN5T31o1TP6yZ0RJrh1cONcokN6QSQfoAToeqcmj0YEG0o3VNxN1BUqXS57lhCuxi0xJBu42nu45fLeqEWYpr685AeFGqMsSQjTk64h2ZsBg7mjThKxYHXYGlGjbBBEn1E2FmCazidzuCR2y%2FPlK34Y7%2B20w0mr2fejCIHd%2FPofquiayc9VkaL1zQ4ki%2BZINVialnh5%2BW%2Flm7lcJ8FRszzDupMCxBjqVAsuS2LmfjtsscvUOabNQnSXOgmaAgcnKa3A8xWmbbafbZ4U86b%2FaGzfq3o%2Fr1dyQRc5PZwuwptKr4pj6h9GMD9d8MpzL8I%2B7tKxfQHZpHkAMuremRWkw9dUFbLgdL8%2BX5wkQaNzJdOOQiGOINVlfvDNJkJd0wjVYAZw0xqIhlHLOhIVPvdiUNCzdEeoSi5fWLCt4TmDUIlG%2BwOH04ylCFP4MlWHthsHgrafdJKe7orgtNq5INScEPDuZb46XVBPb12iLGM8wM5cNBh5DIwHszEX8pa3%2FDSropvacNEyDeG%2BXN5wd8fVpbbsX8AkTetYwSuBXQXY%2BAQOJpkjdRU0LlKKZBffbidxeDKV%2BANx7%2B54Ve006GRY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240429T213602Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AMDYIIXMD%2F20240429%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f2cac2021a5e0a4650b65a0d6449af35533a42f3ae247107100b13182315fdc9',
    coordinationValues: {
      obsType: 'gloms',
      featureType: 'feature',
      featureValueType: 'value',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialThree');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSetsView = config.addView(dataset, 'obsSets');
  const barPlot = config.addView(dataset, 'featureBarPlot').setProps({
    yUnits: 'microns cubed',
  });

  const [
    selectionScope,
    colorScope,
    highlightScope,
    colorEncodingScope,
    glomsObsTypeScope,
    glomsFeatureTypeScope,
    glomsFeatureValueTypeScope,
    glomsFeatureSelectionScope,
  ] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
    'obsHighlight',
    'obsColorEncoding',
    'obsType',
    'featureType',
    'featureValueType',
    'featureSelection',
  );

  colorEncodingScope.setValue('spatialChannelColor');

  glomsObsTypeScope.setValue('gloms');
  glomsFeatureTypeScope.setValue('feature');
  glomsFeatureValueTypeScope.setValue('value');
  glomsFeatureSelectionScope.setValue(['Volume']);

  // const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');
  obsSetsView.useCoordination(selectionScope, colorScope);

  // config.linkViewsByObject([spatialThreeView,spatialVolumeView, lcView], {
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [221, 52, 151],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [773, 7733],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [29, 145, 192],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2290, 6724],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'gloms',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        spatialTargetX: 430,
        spatialTargetY: -520,
        spatialTargetZ: -420,
        spatialScaleX: -0.275,
        spatialScaleY: 0.034375,
        spatialScaleZ: 0.275,
        spatialRotationX: 1.57079632679,
        spatialSceneScaleX: 1.0,
        spatialSceneScaleY: 1.0,
        spatialSceneScaleZ: 8.0,
        spatialMaterialBackside: true,
        segmentationChannel: CL([
          {
            obsType: glomsObsTypeScope,
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialTargetC: 0,
            spatialChannelColor: [253, 174, 107],
            spatialChannelOpacity: 0.5,
            spatialChannelVisible: true,
            obsColorEncoding: colorEncodingScope,
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
            obsHighlight: highlightScope,
            obsSetSelection: selectionScope,
            obsSetColor: colorScope,
          },
        ]),
      },
    ]),
  });
  config.linkViewsByObject([barPlot], {
    obsType: glomsObsTypeScope,
    featureType: glomsFeatureTypeScope,
    featureValueType: glomsFeatureValueTypeScope,
    featureSelection: glomsFeatureSelectionScope,
    obsHighlight: highlightScope,
    obsSetSelection: selectionScope,
    obsSetColor: colorScope,
    obsColorEncoding: colorEncodingScope,
  }, false);

  // config.layout(hconcat(vconcat(spatialThreeView,spatialVolumeView), vconcat(lcView,obsSetsView, barPlot)));
  config.layout(hconcat(spatialThreeView, vconcat(lcView, vconcat(obsSetsView, barPlot))));

  const configJSON = config.toJSON();
  return configJSON;
}

export const jainkidneyDecimated = generateJainKidneyDecimatedConfig();
