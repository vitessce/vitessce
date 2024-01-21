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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCXVzLWVhc3QtMSJGMEQCIBGCSgv%2B7lKP5kkDieC0u2u14Y2CjV0n3iYNLNeTVz0gAiBsk5wsrjaDIDPfSJiCwFkklKRtDdGktj%2BUTcVftMp0KCr0Awji%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMh%2BbU5fyJ7NNyKX76KsgDka%2Bvm%2BjnlFWoJBTON7x2UaxNZDA363yYp%2FQK7jHflfqW%2BHVoL1Dl0sd%2FGXM7T4o%2FV3iebuH%2FdV61WLvjicrV1jGbjsLm04WGjv8IUx97xZXGN6VmHJTGw8d%2BxbYIYGASs2SEioIKNOBUsV3Y%2Fs%2B7vWEik8yJOtmVZ5G4u2NULK%2BlVX4034UA9yjYUjlFs8mL%2B82%2FWV%2FNXtQmf2N8vSDTgg86It7SwXK4XMjriSyHvfocn46Ruu%2FAS8xWa3dQdLRMCqHOONkRKu4TPvGY%2BYE4UrW5YnGKpVvlyBx0%2B8SRm575YjrwbC%2FB3EBSC4EdzneNZpEezXTRh9gixOfptX1qhY05HNnFCzlY4RuEEK8W0RFQmSbj0OCrgoJoggkpKAIQu9iDrKrKpRg6oIIg2KJj%2BrwDeuy0Voj%2BanNnSs6X6Jf05uIaJhln2O9a2LcBV4RBlhwn2eNL47xrGoXn%2F7edxnD2pxqiOp4PndQM6uXGnJD2NPPdjQmaJ5XDI5fzd6zMKzBYXRAQu2cIT%2BI9WzUdoKyQS0JjZjYs8eOmpDpnXHEke2lS5FfY8Y3KQhg8rPJMZEw9KekV2Yd4Cps7CRHuk9a8BqihIpvnMIacp60GOpUCiRZ1%2B2Cq%2FyWMk0Csm1zkuvzuitbsvRn0i0QxJ2VQZdGiQTEXQZpAPffFAFTFO0bEiEQ3sGW5OlnnjlA0AO4cwjVaj0uNfcGF%2FFKb1%2F%2FcI3Ta0v%2B9oWGjU2D0evdnBUacahA4%2Bc4RVdzG33A83GGlrzLP3OM5jkMN2c6i2iG3B91V2BFsTAZcfVKBmt8W1S9eyhV8Qle3QQGmS5e0lFqWoyGP5MLBLY5UmuYg7C3M1QJGJFUex4TwwMS1JIK%2F9wt%2FkpwQhkNSzXxYYR2BOWNH%2F%2FroI8NsPhJIO5UvFWmcyKy8%2FEycswcyXCX%2FYcGLMbRvN6VHKQAi2dCekWtCUZAynff6UTAYbwBn8pzC8m2dVgwL3GBR6A%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240119T011952Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ABNYVRBHC%2F20240119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f7b44a59f303ea10b0a4b40af8c86d1d90653b232e1d1910e829bdbc68517645",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCXVzLWVhc3QtMSJGMEQCIBGCSgv%2B7lKP5kkDieC0u2u14Y2CjV0n3iYNLNeTVz0gAiBsk5wsrjaDIDPfSJiCwFkklKRtDdGktj%2BUTcVftMp0KCr0Awji%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMh%2BbU5fyJ7NNyKX76KsgDka%2Bvm%2BjnlFWoJBTON7x2UaxNZDA363yYp%2FQK7jHflfqW%2BHVoL1Dl0sd%2FGXM7T4o%2FV3iebuH%2FdV61WLvjicrV1jGbjsLm04WGjv8IUx97xZXGN6VmHJTGw8d%2BxbYIYGASs2SEioIKNOBUsV3Y%2Fs%2B7vWEik8yJOtmVZ5G4u2NULK%2BlVX4034UA9yjYUjlFs8mL%2B82%2FWV%2FNXtQmf2N8vSDTgg86It7SwXK4XMjriSyHvfocn46Ruu%2FAS8xWa3dQdLRMCqHOONkRKu4TPvGY%2BYE4UrW5YnGKpVvlyBx0%2B8SRm575YjrwbC%2FB3EBSC4EdzneNZpEezXTRh9gixOfptX1qhY05HNnFCzlY4RuEEK8W0RFQmSbj0OCrgoJoggkpKAIQu9iDrKrKpRg6oIIg2KJj%2BrwDeuy0Voj%2BanNnSs6X6Jf05uIaJhln2O9a2LcBV4RBlhwn2eNL47xrGoXn%2F7edxnD2pxqiOp4PndQM6uXGnJD2NPPdjQmaJ5XDI5fzd6zMKzBYXRAQu2cIT%2BI9WzUdoKyQS0JjZjYs8eOmpDpnXHEke2lS5FfY8Y3KQhg8rPJMZEw9KekV2Yd4Cps7CRHuk9a8BqihIpvnMIacp60GOpUCiRZ1%2B2Cq%2FyWMk0Csm1zkuvzuitbsvRn0i0QxJ2VQZdGiQTEXQZpAPffFAFTFO0bEiEQ3sGW5OlnnjlA0AO4cwjVaj0uNfcGF%2FFKb1%2F%2FcI3Ta0v%2B9oWGjU2D0evdnBUacahA4%2Bc4RVdzG33A83GGlrzLP3OM5jkMN2c6i2iG3B91V2BFsTAZcfVKBmt8W1S9eyhV8Qle3QQGmS5e0lFqWoyGP5MLBLY5UmuYg7C3M1QJGJFUex4TwwMS1JIK%2F9wt%2FkpwQhkNSzXxYYR2BOWNH%2F%2FroI8NsPhJIO5UvFWmcyKy8%2FEycswcyXCX%2FYcGLMbRvN6VHKQAi2dCekWtCUZAynff6UTAYbwBn8pzC8m2dVgwL3GBR6A%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240119T012008Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ABNYVRBHC%2F20240119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e373c745ee818c9e7c60b51f700bb2e9064f99863c14eed10a4442b151d49597",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCXVzLWVhc3QtMSJGMEQCIBGCSgv%2B7lKP5kkDieC0u2u14Y2CjV0n3iYNLNeTVz0gAiBsk5wsrjaDIDPfSJiCwFkklKRtDdGktj%2BUTcVftMp0KCr0Awji%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMh%2BbU5fyJ7NNyKX76KsgDka%2Bvm%2BjnlFWoJBTON7x2UaxNZDA363yYp%2FQK7jHflfqW%2BHVoL1Dl0sd%2FGXM7T4o%2FV3iebuH%2FdV61WLvjicrV1jGbjsLm04WGjv8IUx97xZXGN6VmHJTGw8d%2BxbYIYGASs2SEioIKNOBUsV3Y%2Fs%2B7vWEik8yJOtmVZ5G4u2NULK%2BlVX4034UA9yjYUjlFs8mL%2B82%2FWV%2FNXtQmf2N8vSDTgg86It7SwXK4XMjriSyHvfocn46Ruu%2FAS8xWa3dQdLRMCqHOONkRKu4TPvGY%2BYE4UrW5YnGKpVvlyBx0%2B8SRm575YjrwbC%2FB3EBSC4EdzneNZpEezXTRh9gixOfptX1qhY05HNnFCzlY4RuEEK8W0RFQmSbj0OCrgoJoggkpKAIQu9iDrKrKpRg6oIIg2KJj%2BrwDeuy0Voj%2BanNnSs6X6Jf05uIaJhln2O9a2LcBV4RBlhwn2eNL47xrGoXn%2F7edxnD2pxqiOp4PndQM6uXGnJD2NPPdjQmaJ5XDI5fzd6zMKzBYXRAQu2cIT%2BI9WzUdoKyQS0JjZjYs8eOmpDpnXHEke2lS5FfY8Y3KQhg8rPJMZEw9KekV2Yd4Cps7CRHuk9a8BqihIpvnMIacp60GOpUCiRZ1%2B2Cq%2FyWMk0Csm1zkuvzuitbsvRn0i0QxJ2VQZdGiQTEXQZpAPffFAFTFO0bEiEQ3sGW5OlnnjlA0AO4cwjVaj0uNfcGF%2FFKb1%2F%2FcI3Ta0v%2B9oWGjU2D0evdnBUacahA4%2Bc4RVdzG33A83GGlrzLP3OM5jkMN2c6i2iG3B91V2BFsTAZcfVKBmt8W1S9eyhV8Qle3QQGmS5e0lFqWoyGP5MLBLY5UmuYg7C3M1QJGJFUex4TwwMS1JIK%2F9wt%2FkpwQhkNSzXxYYR2BOWNH%2F%2FroI8NsPhJIO5UvFWmcyKy8%2FEycswcyXCX%2FYcGLMbRvN6VHKQAi2dCekWtCUZAynff6UTAYbwBn8pzC8m2dVgwL3GBR6A%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240119T012420Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ABNYVRBHC%2F20240119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=779d64230415844f8415589b2068e4c69d35cbaf4af140378917b8f0030c21f9',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCXVzLWVhc3QtMSJGMEQCIBGCSgv%2B7lKP5kkDieC0u2u14Y2CjV0n3iYNLNeTVz0gAiBsk5wsrjaDIDPfSJiCwFkklKRtDdGktj%2BUTcVftMp0KCr0Awji%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMh%2BbU5fyJ7NNyKX76KsgDka%2Bvm%2BjnlFWoJBTON7x2UaxNZDA363yYp%2FQK7jHflfqW%2BHVoL1Dl0sd%2FGXM7T4o%2FV3iebuH%2FdV61WLvjicrV1jGbjsLm04WGjv8IUx97xZXGN6VmHJTGw8d%2BxbYIYGASs2SEioIKNOBUsV3Y%2Fs%2B7vWEik8yJOtmVZ5G4u2NULK%2BlVX4034UA9yjYUjlFs8mL%2B82%2FWV%2FNXtQmf2N8vSDTgg86It7SwXK4XMjriSyHvfocn46Ruu%2FAS8xWa3dQdLRMCqHOONkRKu4TPvGY%2BYE4UrW5YnGKpVvlyBx0%2B8SRm575YjrwbC%2FB3EBSC4EdzneNZpEezXTRh9gixOfptX1qhY05HNnFCzlY4RuEEK8W0RFQmSbj0OCrgoJoggkpKAIQu9iDrKrKpRg6oIIg2KJj%2BrwDeuy0Voj%2BanNnSs6X6Jf05uIaJhln2O9a2LcBV4RBlhwn2eNL47xrGoXn%2F7edxnD2pxqiOp4PndQM6uXGnJD2NPPdjQmaJ5XDI5fzd6zMKzBYXRAQu2cIT%2BI9WzUdoKyQS0JjZjYs8eOmpDpnXHEke2lS5FfY8Y3KQhg8rPJMZEw9KekV2Yd4Cps7CRHuk9a8BqihIpvnMIacp60GOpUCiRZ1%2B2Cq%2FyWMk0Csm1zkuvzuitbsvRn0i0QxJ2VQZdGiQTEXQZpAPffFAFTFO0bEiEQ3sGW5OlnnjlA0AO4cwjVaj0uNfcGF%2FFKb1%2F%2FcI3Ta0v%2B9oWGjU2D0evdnBUacahA4%2Bc4RVdzG33A83GGlrzLP3OM5jkMN2c6i2iG3B91V2BFsTAZcfVKBmt8W1S9eyhV8Qle3QQGmS5e0lFqWoyGP5MLBLY5UmuYg7C3M1QJGJFUex4TwwMS1JIK%2F9wt%2FkpwQhkNSzXxYYR2BOWNH%2F%2FroI8NsPhJIO5UvFWmcyKy8%2FEycswcyXCX%2FYcGLMbRvN6VHKQAi2dCekWtCUZAynff6UTAYbwBn8pzC8m2dVgwL3GBR6A%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240119T011931Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ABNYVRBHC%2F20240119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=521baecff5d4346838b26a76d19efab552331d8c892d18216d34178fa3ba0a68',
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
