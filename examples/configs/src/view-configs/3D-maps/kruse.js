import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateKruse2024Configuration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Kruse',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/AW2_6A_gpINS_RtCK19_5x_simultaneous.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEv%2BFGww2RAiNfLU1u4K5NmgBQMFPTRv7I1IbrskVe2nAiEAypC2xp%2BAPScvTxXajDBFJ%2FDkOE4LN7y3KWAUa7X8B4Aq9QMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDMMRAd3asg9qheoysSrJA2ehSbS8xnRSCndYmgK67o8zRmY4BDEIM0bh6jYkm%2FxSAEiUvwnKXQNBD%2FQxq3GJMiFWZ37hwCIZEt8BaNFINdP9EyyPMIjCozWf%2FQ8MzsOMEjRolPNCc92JTQOO2tGM55whCOdGfP73%2BSE5ZbuSatcJRqV0kYNEDJR7jZP5nCvThN6HHGorLuNvcAANCEMVYtY9oUPdNCWSey6h50I%2BtISFHos0Hyjna0b8olVwIPUYj485qzXJziaXTLYlQy855MtlntSHRPZyvMXf65NStEvul%2BFhAwuuC11tLlDVIUY6iTy%2FcdG6NiArdwLih3%2F%2BQGQLZT8CF9iNcPzspzvNOc1bR4f%2BxlBE%2F24tw0hGk%2Bj20PcAkMAkt4SExagAAcgi3FkVZ8DajNVuu5Otwp2xGK0UsvLuYRi39%2FtaR3WacFNw9WicIs4tqRA5394oXm0zTP8xlSpim6a%2BhwQ%2B67CveNJr7Y0H11gzPQoL0dH4yBX2Ndt9OmpzaQlOcD5mfA9Pj6Y%2BDtImjhbfN3kBii5mG9VH9uEEHPgfkowIQOw4ZV5eFeVzcrFJGJh8XtoeX69xWZjRK8d8RAa8gNMLcUxWmdT9FBjAtGlN5ZMwnpykrwY6lAKmcbPD0%2BmGcbh0AD5oVVfZgK85%2Fdz631sVj%2Bdoipk0s7bdcwt30qFrbS3IGAR1CRNoEXaISe%2BZsSKIBKfkZK5h%2BDrrhFPORGzMlePQwbDXddsjRsUVLljLp4UXsVKjG2QglPE86UPoptUxxq8ZgtRIiu7Mi9SiQvF%2FTUAv5fzi7L%2BJNUSJzQMo1JOP57qPdHZHmrmMHx4%2B92S3uhStCAgmBa%2FiwZG5LaY9sVZsLenKXNkRlJ%2BR2tVMNC3NGnBsKFpnu%2Bv67onEMfAGfWWXPvlwr3j6BnH6pvjvFQNCrlWlS7g7YcjEN24OBAFBs0ci2OD%2F%2FOaMBgD6UrM6AHaZ1SeQlRTlGP04UEIv1CqLE0e0PWxOvo0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T004559Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AE7IYMO4A%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=95bb923d8b879967c67bb45377142bb899a09a6d93628b47590ddac40a6469ca',
    options: {
      offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/AW2_6A_gpINS_RtCK19_5x_simultaneous.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEv%2BFGww2RAiNfLU1u4K5NmgBQMFPTRv7I1IbrskVe2nAiEAypC2xp%2BAPScvTxXajDBFJ%2FDkOE4LN7y3KWAUa7X8B4Aq9QMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDMMRAd3asg9qheoysSrJA2ehSbS8xnRSCndYmgK67o8zRmY4BDEIM0bh6jYkm%2FxSAEiUvwnKXQNBD%2FQxq3GJMiFWZ37hwCIZEt8BaNFINdP9EyyPMIjCozWf%2FQ8MzsOMEjRolPNCc92JTQOO2tGM55whCOdGfP73%2BSE5ZbuSatcJRqV0kYNEDJR7jZP5nCvThN6HHGorLuNvcAANCEMVYtY9oUPdNCWSey6h50I%2BtISFHos0Hyjna0b8olVwIPUYj485qzXJziaXTLYlQy855MtlntSHRPZyvMXf65NStEvul%2BFhAwuuC11tLlDVIUY6iTy%2FcdG6NiArdwLih3%2F%2BQGQLZT8CF9iNcPzspzvNOc1bR4f%2BxlBE%2F24tw0hGk%2Bj20PcAkMAkt4SExagAAcgi3FkVZ8DajNVuu5Otwp2xGK0UsvLuYRi39%2FtaR3WacFNw9WicIs4tqRA5394oXm0zTP8xlSpim6a%2BhwQ%2B67CveNJr7Y0H11gzPQoL0dH4yBX2Ndt9OmpzaQlOcD5mfA9Pj6Y%2BDtImjhbfN3kBii5mG9VH9uEEHPgfkowIQOw4ZV5eFeVzcrFJGJh8XtoeX69xWZjRK8d8RAa8gNMLcUxWmdT9FBjAtGlN5ZMwnpykrwY6lAKmcbPD0%2BmGcbh0AD5oVVfZgK85%2Fdz631sVj%2Bdoipk0s7bdcwt30qFrbS3IGAR1CRNoEXaISe%2BZsSKIBKfkZK5h%2BDrrhFPORGzMlePQwbDXddsjRsUVLljLp4UXsVKjG2QglPE86UPoptUxxq8ZgtRIiu7Mi9SiQvF%2FTUAv5fzi7L%2BJNUSJzQMo1JOP57qPdHZHmrmMHx4%2B92S3uhStCAgmBa%2FiwZG5LaY9sVZsLenKXNkRlJ%2BR2tVMNC3NGnBsKFpnu%2Bv67onEMfAGfWWXPvlwr3j6BnH6pvjvFQNCrlWlS7g7YcjEN24OBAFBs0ci2OD%2F%2FOaMBgD6UrM6AHaZ1SeQlRTlGP04UEIv1CqLE0e0PWxOvo0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T004544Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AE7IYMO4A%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=27c793abceeba8d408aa55fa66aa7aa8919d285634b976711986ef62e988cb9e',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  }).addFile({
    fileType: 'segmentation.glb',
    // url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/kruse.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCyrPCrd4%2FIKiUnkIn2VyW8hj9icaG2IixMXSP3MbYWiwIhAJf8%2BhjtCgz3gcrAwEG5aCQnigVKpAF%2FtISKwJNt8sJqKvUDCJf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4Igxcs%2FaZpHSlCSfS2GkqyQO4YA%2B0pF9LkDFaAGlxY2Hh2gUKvrlGGpW7zF%2BSQGybTkKrKx3kL6M0iOto4J7DZED%2BVT%2BGqJCj%2FcE9tuWF57qRnWrk4cu3FiZu664YbFG0vut%2FASWS%2FKsWI0taLIBvdD%2BsZcIH0Vfoi64m4Zg8I9ZznDXTxDjsW3aYmfF1Uw0QtPsS4BEnhpmALjFKD60fUNN6b5UFJJVa1dUM1pVSmUUTIfO2yw3vamD8htAVkXJ%2BZNbKXOjfs14alPpbTehGF5O%2Bqwd85anQgaNCAJvHWqo1V89ROG9LqmjqoP9hf%2B4qMD0ilXSK%2FW1lUeq9Tdd7Gn3tfQU8PMrXqKIE89Fgk%2BhK0xPWzCJ2VtznlvDGbTKiyR9B%2BdyjN5tN5fRiqbVt9sYXym7t4rryhAQhgp4EyFk29ewxIW2%2BApsUR9LgjnXfx3PFD%2Fde7dQKYVHzNypk0AQmkYj8rSA%2FJX4TsnJuUry8p8t%2BNGG3028J7jX8SB7aGVQH78YmMI4W9p%2BrtoujKehu6EHhYkNSwucf%2BE%2BRBqNghZY82Yi3DCr%2BQAXozDgq0YOc2GvCXdWYMMmM422i9Pgy0%2FZ8hcEg0wOFb9PRo3KyZ3%2BEEsSaHCyzMPOanq8GOpMC%2FhrR42A13Oqzd4Ys89%2BWYruklR8naVQ0mv6FpMFjfW4%2Bm8JFf1vjXnIPTEqVDyDFv2cUdJlBe8EfcElS%2FqOW1O%2FFHUyD3HgKuis1f9YIGP2o079luLOqKRVUxX7jv%2FMAxbEaALAxAnOSo%2FEOjeclHJ8RvtNuVqOX9NqZMx6c5sWGLweNZTV5CgUqEW9F4EL1H4QoVDqiyXVG0n5oA2RcjvMEJ3PFLhBzN4t86j8ZR2zqLXsvXk9S7PDTd5W6uQz1s%2FUOqBbq05RWJqp5u%2Fakh5UDazwT3om2UoKddIGYo%2BMnkgjqE%2BIIMrULF5Ob2M981CTgncZlsjDp6wOjYsBZUdK0muv5VMxwsx%2BrbsOuFK0nPaY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240305T212421Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AOQ2BGXMM%2F20240305%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5d00b0df74f11fbbc40f2e2b0f57ad9ce0d16261a185734c98c9b2926ace419c',
    // url: 'http://127.0.0.1:808/kruse_full.glb',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/kruse.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEv%2BFGww2RAiNfLU1u4K5NmgBQMFPTRv7I1IbrskVe2nAiEAypC2xp%2BAPScvTxXajDBFJ%2FDkOE4LN7y3KWAUa7X8B4Aq9QMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDMMRAd3asg9qheoysSrJA2ehSbS8xnRSCndYmgK67o8zRmY4BDEIM0bh6jYkm%2FxSAEiUvwnKXQNBD%2FQxq3GJMiFWZ37hwCIZEt8BaNFINdP9EyyPMIjCozWf%2FQ8MzsOMEjRolPNCc92JTQOO2tGM55whCOdGfP73%2BSE5ZbuSatcJRqV0kYNEDJR7jZP5nCvThN6HHGorLuNvcAANCEMVYtY9oUPdNCWSey6h50I%2BtISFHos0Hyjna0b8olVwIPUYj485qzXJziaXTLYlQy855MtlntSHRPZyvMXf65NStEvul%2BFhAwuuC11tLlDVIUY6iTy%2FcdG6NiArdwLih3%2F%2BQGQLZT8CF9iNcPzspzvNOc1bR4f%2BxlBE%2F24tw0hGk%2Bj20PcAkMAkt4SExagAAcgi3FkVZ8DajNVuu5Otwp2xGK0UsvLuYRi39%2FtaR3WacFNw9WicIs4tqRA5394oXm0zTP8xlSpim6a%2BhwQ%2B67CveNJr7Y0H11gzPQoL0dH4yBX2Ndt9OmpzaQlOcD5mfA9Pj6Y%2BDtImjhbfN3kBii5mG9VH9uEEHPgfkowIQOw4ZV5eFeVzcrFJGJh8XtoeX69xWZjRK8d8RAa8gNMLcUxWmdT9FBjAtGlN5ZMwnpykrwY6lAKmcbPD0%2BmGcbh0AD5oVVfZgK85%2Fdz631sVj%2Bdoipk0s7bdcwt30qFrbS3IGAR1CRNoEXaISe%2BZsSKIBKfkZK5h%2BDrrhFPORGzMlePQwbDXddsjRsUVLljLp4UXsVKjG2QglPE86UPoptUxxq8ZgtRIiu7Mi9SiQvF%2FTUAv5fzi7L%2BJNUSJzQMo1JOP57qPdHZHmrmMHx4%2B92S3uhStCAgmBa%2FiwZG5LaY9sVZsLenKXNkRlJ%2BR2tVMNC3NGnBsKFpnu%2Bv67onEMfAGfWWXPvlwr3j6BnH6pvjvFQNCrlWlS7g7YcjEN24OBAFBs0ci2OD%2F%2FOaMBgD6UrM6AHaZ1SeQlRTlGP04UEIv1CqLE0e0PWxOvo0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T004625Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AE7IYMO4A%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=310f4c5c176201fc2e6d422828640c8e80d3677a4c7650493b22411e09778bd0',
    coordinationValues: {
      fileUid: 'gloms',
    },
  });

  const [
    colorEncodingScope,
    glomsObsTypeScope,
    glomsFeatureTypeScope,
    glomsFeatureValueTypeScope,
    glomsFeatureSelectionScope,
  ] = config.addCoordination(
    'obsColorEncoding',
    'obsType',
    'featureType',
    'featureValueType',
    'featureSelection',
  );


  colorEncodingScope.setValue('spatialChannelColor');
  glomsObsTypeScope.setValue('Cells');
  glomsFeatureTypeScope.setValue('feature');
  glomsFeatureValueTypeScope.setValue('value');
  glomsFeatureSelectionScope.setValue(['Volume']);

  const spatialThreeView = config.addView(dataset, 'spatialThree');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [1281, 1427],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [627, 673],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'gloms',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        spatialTargetX: -270,
        spatialTargetY: -950 / 2.0,
        spatialTargetZ: -950 / 2.0,
        spatialScaleX: -0.095361611229783,
        spatialScaleY: 0.125 * 2,
        spatialScaleZ: -0.125 * 2,
        spatialRotationZ: 3.14159265359,
        spatialRotationY: 1.57079632679,
        spatialSceneScaleX: 1.0,
        spatialSceneScaleY: 1.0,
        spatialSceneScaleZ: 1.0,
        segmentationChannel: CL([
          {
            obsType: 'islets',
            featureType: glomsFeatureTypeScope,
            // featureValueType: glomsFeatureValueTypeScope,
            // featureSelection: glomsFeatureSelectionScope,
            spatialTargetC: 0,
            spatialChannelColor: [0, 0, 255],
            spatialChannelOpacity: 0.5,
            spatialChannelVisible: true,
            obsColorEncoding: colorEncodingScope,
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
          },
          {
            obsType: 'ducts',
            featureType: glomsFeatureTypeScope,
            // featureValueType: glomsFeatureValueTypeScope,
            // featureSelection: glomsFeatureSelectionScope,
            spatialTargetC: 1,
            spatialChannelColor: [255, 255, 0],
            spatialChannelOpacity: 0.5,
            spatialChannelVisible: true,
            obsColorEncoding: colorEncodingScope,
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const kruse2024 = generateKruse2024Configuration();
