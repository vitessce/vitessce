import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBlinConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Blin et al., PLoS Biol 2019',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7TEYK5AMTYWPBYQ%2F20240123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240123T165206Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b0c698524c08ab5a310531f66657d8cbc1db8c1bf6a8047e9eeb22a851b9e030",
        options: {
            offsetsUrl: "https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7TEYK5AMTYWPBYQ%2F20240123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240123T165057Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bb1af78ecbb79645fc817af6efd6c3151b707e99577256df4fea0bbb172d5b5",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMSJHMEUCIC3GBmlaSjxukcxgwIWjIv6Tk8rIyFW0yUG6DHSdD3OcAiEAmTjiHEcseiT6jf1OGoMBvsGdjzfRbNrikJvgduKBYh8q6wMIYxABGgwxMzY1NzY1MjIwNDgiDIZIwPthWvKBreZpJSrIAx%2FCk9ThGxYLAQbKyPQPQfzSHK0BnwX2eNmQUCO2QVHf6KneSIGnl2VJ7EeaCeBi4kqi9Kn3RLJGURkKW8UAZ9Tjtdx2e4EzA%2FYPls%2BMP%2BjfJrhbkXxyQpTZJxwDnIO4KkkzzmnS4JhdMfs8WqAIGdgVavvdBat%2FQE3Y4P5Zscia11FyLWmljFT2jXH6GRIjDuwLMyU2SywWYwbZJaISRa1LwJNBbZRTECH%2BzpoZviIug%2F8kYDRSlHXoGQQPKjAsQCQVbj5fae%2BqX6K6h9qQWmtNSLPeykg6Fm6A%2FpYc5BV0oBcDSxjbOedC%2BuYgtyrAJkcjOmPRj2JdOxtzNMGUeRHkrA0XVRS2kvTGyuPFhdE6L0TUtYosgJPmOIKdmsIyvd9YHaTEriejPFcOBW5wME8ho%2BSm6vgnG8DXCV4Q4O69CZ5pQGYYGwMaIpsM1Zb8YlMPOcL8k4QxxW0It58sNbbuHnhd6QLELDAv88YZlQh6kTcLVHYsGbOg2Aht%2FsfkQe3UvprKue9oNg2SoQtUOlzo2y7xqPfAA6Ou70kh5OuFymX8BkUpueogLfAEdF71nwKhYEADCodSwGy4cJLAu8CnnDsl6U2k2zC997%2BtBjqUAg%2FmhSAN%2FlX5Jz1F6UUToZDavdrDQpowWMhfp1BQa834mouyGUuFCGLciHJd%2B0mn5zSjzXFSQFB607e4ounc%2Bp4uyyagI4rgPe4bqYlpCUBBJlTIOg5MUzr4AZy7RwNQpdgDTGJBT7c6P42uK1Ae6al8ofsA8S%2FAbd5OhySxjdeDL9ACSvJTthzMyq2K3HYvyTtfnDO59qVJUgeRfM%2FWMqtJ2E%2FFk7eS8Op%2Bmqe7228qyVummXw8ZQZCoyw4eR0wh73QLoo0vRggwcinlbDoRyNpDF9o%2ByN3Xq3T6UU8gBFvwcsmKliTERUV8vpvbhi7B1uMEIuPxBsJyHmV5xJs2l6w8wKZyrLcWE51dsfBA8olwzdS4w%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240123T174802Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADY2X2PFR%2F20240123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2a8137ce801419cfea191bb4b281b71ff592a1ce69cb7be276bbc9e437931c50',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7TEYK5AMTYWPBYQ%2F20240123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240123T165335Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f14e7913eaa47be24f3df4ecee2e0ae8581ee3a268e2874bec9a0e5503b7c308',
        coordinationValues: {
            obsType: 'gloms',
            featureType: 'feature',
            featureValueType: 'value',
        },
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
   // const spatialVolumeView = config.addView(dataset, 'spatialBeta').setProps({ title: 'MIP' });
    const lcView = config.addView(dataset, 'layerControllerBeta');
    const obsSetsView = config.addView(dataset, 'obsSets');
    const barPlot = config.addView(dataset, 'featureBarPlot').setProps({
        yUnits: 'microns cubed'
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

    //const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');
    obsSetsView.useCoordination(selectionScope, colorScope);

    //config.linkViewsByObject([spatialThreeView,spatialVolumeView, lcView], {
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
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'gloms',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                segmentationChannel: CL([
                    {
                        obsType: glomsObsTypeScope,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialTargetC: 0,
                        spatialChannelColor: [202, 122, 166],
                        spatialChannelOpacity: 0.5,
                        spatialChannelVisible: true,
                        obsColorEncoding: colorEncodingScope,
                        spatialSegmentationFilled: false,
                        spatialSegmentationStrokeWidth: 0.01,
                        obsHighlight: highlightScope,
                        obsSetSelection: selectionScope,
                        obsSetColor: colorScope,
                    }
                ])
            }
        ])
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
    config.layout(hconcat(spatialThreeView, vconcat(lcView,obsSetsView, barPlot)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const blinOop2019Three = generateBlinConfig();
