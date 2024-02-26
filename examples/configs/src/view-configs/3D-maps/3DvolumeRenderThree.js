import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateJainKidneyConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Jain Kidney 2024',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCvLL6vy0JraQzG0Cz32w9cOGnjjlz3EFshvtBdy%2FlYEgIhAIm%2F5gKlvlr8IPtm08w3TciUQQjJtLvaZ%2BMUwABJhafgKvQDCMP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgyHgZwCdW1hydwol4kqyAMKb8R4V7mBq1ORXmHQAbtZY7fCg1jTLNDCjUkUX01vIR9sYqKmg3H%2FYW1svo48QGd8J2B285sFjNz5uYQ%2FGdHIzbKnLQwSDpte34Eh4U0rsGCeN59TdydcS6oqa6z7DiQCZi156MDZmPjwiZNLg4pBYYt6U08hdD3XWDxo88K7zUd8FmNafpq1JP3S2eGAJUyRj15mRQAlSK8vBK8jsw%2F8rxzDSxWOAn%2F1D2kJLiWwaXvL8RfcLOZKSj9lUA4T76zMBxARmLB260sgaaZGP5AuuTaN2pOoEm0PHo8O4%2BOAj2wRqxX0DjB2wyfJwkWeoZrh0uVetImvUrc%2BknmyVpadJGV17cjdeOqIvJWR%2BwDreKJDliJtplPyR1%2BcnsYFx%2FOEbc07Kx%2BxW8EVVGhFcexRdJDBL5OEU2Bj9aFfCUAKhbwnrYoER%2BlVIuSJupinCYVebZMNrUvCr1qv1UGPQf4%2FouRK1QNNqmcLCyHLMWwjmvcEASGBDT5QxJYmXqbbhdftBvYhGxUDv9GnqBiU5RZvG%2Bfwvm2iQPj526tPGEz6S7jGaBDDXmCM2hZfEZFCg6VOCstycZNwPiLs9IECIryWsA99lX1QVT0wrpPzrgY6kwIwR62sG7zJxueM3JZitWvpTHeFvRjogSoiCtpdDvDMiUdMGedmzO61QPssE8xHITCm9Qp67mn7PkafuEbMf5P2trCfAfzSv4cffn0w0sOo7FzJkhSwyHKaMp0PiSr3VSOz0sHLkKzrsyOpvS%2FQAXvQvW%2BqGF1yQhzxkD2NnQgGhzAQtK72DmDRaUNMXSPge7qGjY2t8FwhWiZDFhEuwwaWH7DZTL%2B1t%2F90rmt01RAcmevkFcBcNEdBNyif0xs1bNyRHUKW%2FBGRmQsOTLyhHwvwl8GizzKDthkXPMRwmo2j0gFcYmoV%2FIkKyxfFqyX0zSxb4dvvCHxXJbc1Q5nO%2B3tb%2B7upWkPyudZSLzZRW9UaG2u4Ug%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T172802Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AB3PT5X7Y%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e8665c364c2605c14ccaca6e23df7d60438e2af2f2cef27afc69365db8186a41",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCvLL6vy0JraQzG0Cz32w9cOGnjjlz3EFshvtBdy%2FlYEgIhAIm%2F5gKlvlr8IPtm08w3TciUQQjJtLvaZ%2BMUwABJhafgKvQDCMP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgyHgZwCdW1hydwol4kqyAMKb8R4V7mBq1ORXmHQAbtZY7fCg1jTLNDCjUkUX01vIR9sYqKmg3H%2FYW1svo48QGd8J2B285sFjNz5uYQ%2FGdHIzbKnLQwSDpte34Eh4U0rsGCeN59TdydcS6oqa6z7DiQCZi156MDZmPjwiZNLg4pBYYt6U08hdD3XWDxo88K7zUd8FmNafpq1JP3S2eGAJUyRj15mRQAlSK8vBK8jsw%2F8rxzDSxWOAn%2F1D2kJLiWwaXvL8RfcLOZKSj9lUA4T76zMBxARmLB260sgaaZGP5AuuTaN2pOoEm0PHo8O4%2BOAj2wRqxX0DjB2wyfJwkWeoZrh0uVetImvUrc%2BknmyVpadJGV17cjdeOqIvJWR%2BwDreKJDliJtplPyR1%2BcnsYFx%2FOEbc07Kx%2BxW8EVVGhFcexRdJDBL5OEU2Bj9aFfCUAKhbwnrYoER%2BlVIuSJupinCYVebZMNrUvCr1qv1UGPQf4%2FouRK1QNNqmcLCyHLMWwjmvcEASGBDT5QxJYmXqbbhdftBvYhGxUDv9GnqBiU5RZvG%2Bfwvm2iQPj526tPGEz6S7jGaBDDXmCM2hZfEZFCg6VOCstycZNwPiLs9IECIryWsA99lX1QVT0wrpPzrgY6kwIwR62sG7zJxueM3JZitWvpTHeFvRjogSoiCtpdDvDMiUdMGedmzO61QPssE8xHITCm9Qp67mn7PkafuEbMf5P2trCfAfzSv4cffn0w0sOo7FzJkhSwyHKaMp0PiSr3VSOz0sHLkKzrsyOpvS%2FQAXvQvW%2BqGF1yQhzxkD2NnQgGhzAQtK72DmDRaUNMXSPge7qGjY2t8FwhWiZDFhEuwwaWH7DZTL%2B1t%2F90rmt01RAcmevkFcBcNEdBNyif0xs1bNyRHUKW%2FBGRmQsOTLyhHwvwl8GizzKDthkXPMRwmo2j0gFcYmoV%2FIkKyxfFqyX0zSxb4dvvCHxXJbc1Q5nO%2B3tb%2B7upWkPyudZSLzZRW9UaG2u4Ug%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T172748Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AB3PT5X7Y%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d4b4f8bb6a493fed880c2b1cf47024d09ca3b7633ba7c66608d5239bef45dbeb",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated_gloms_compressed.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCvLL6vy0JraQzG0Cz32w9cOGnjjlz3EFshvtBdy%2FlYEgIhAIm%2F5gKlvlr8IPtm08w3TciUQQjJtLvaZ%2BMUwABJhafgKvQDCMP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgyHgZwCdW1hydwol4kqyAMKb8R4V7mBq1ORXmHQAbtZY7fCg1jTLNDCjUkUX01vIR9sYqKmg3H%2FYW1svo48QGd8J2B285sFjNz5uYQ%2FGdHIzbKnLQwSDpte34Eh4U0rsGCeN59TdydcS6oqa6z7DiQCZi156MDZmPjwiZNLg4pBYYt6U08hdD3XWDxo88K7zUd8FmNafpq1JP3S2eGAJUyRj15mRQAlSK8vBK8jsw%2F8rxzDSxWOAn%2F1D2kJLiWwaXvL8RfcLOZKSj9lUA4T76zMBxARmLB260sgaaZGP5AuuTaN2pOoEm0PHo8O4%2BOAj2wRqxX0DjB2wyfJwkWeoZrh0uVetImvUrc%2BknmyVpadJGV17cjdeOqIvJWR%2BwDreKJDliJtplPyR1%2BcnsYFx%2FOEbc07Kx%2BxW8EVVGhFcexRdJDBL5OEU2Bj9aFfCUAKhbwnrYoER%2BlVIuSJupinCYVebZMNrUvCr1qv1UGPQf4%2FouRK1QNNqmcLCyHLMWwjmvcEASGBDT5QxJYmXqbbhdftBvYhGxUDv9GnqBiU5RZvG%2Bfwvm2iQPj526tPGEz6S7jGaBDDXmCM2hZfEZFCg6VOCstycZNwPiLs9IECIryWsA99lX1QVT0wrpPzrgY6kwIwR62sG7zJxueM3JZitWvpTHeFvRjogSoiCtpdDvDMiUdMGedmzO61QPssE8xHITCm9Qp67mn7PkafuEbMf5P2trCfAfzSv4cffn0w0sOo7FzJkhSwyHKaMp0PiSr3VSOz0sHLkKzrsyOpvS%2FQAXvQvW%2BqGF1yQhzxkD2NnQgGhzAQtK72DmDRaUNMXSPge7qGjY2t8FwhWiZDFhEuwwaWH7DZTL%2B1t%2F90rmt01RAcmevkFcBcNEdBNyif0xs1bNyRHUKW%2FBGRmQsOTLyhHwvwl8GizzKDthkXPMRwmo2j0gFcYmoV%2FIkKyxfFqyX0zSxb4dvvCHxXJbc1Q5nO%2B3tb%2B7upWkPyudZSLzZRW9UaG2u4Ug%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T174058Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AB3PT5X7Y%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=226133679e3e77584d016c23578aadead8f5750a667cc45ff66615a1800b4d90',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCvLL6vy0JraQzG0Cz32w9cOGnjjlz3EFshvtBdy%2FlYEgIhAIm%2F5gKlvlr8IPtm08w3TciUQQjJtLvaZ%2BMUwABJhafgKvQDCMP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgyHgZwCdW1hydwol4kqyAMKb8R4V7mBq1ORXmHQAbtZY7fCg1jTLNDCjUkUX01vIR9sYqKmg3H%2FYW1svo48QGd8J2B285sFjNz5uYQ%2FGdHIzbKnLQwSDpte34Eh4U0rsGCeN59TdydcS6oqa6z7DiQCZi156MDZmPjwiZNLg4pBYYt6U08hdD3XWDxo88K7zUd8FmNafpq1JP3S2eGAJUyRj15mRQAlSK8vBK8jsw%2F8rxzDSxWOAn%2F1D2kJLiWwaXvL8RfcLOZKSj9lUA4T76zMBxARmLB260sgaaZGP5AuuTaN2pOoEm0PHo8O4%2BOAj2wRqxX0DjB2wyfJwkWeoZrh0uVetImvUrc%2BknmyVpadJGV17cjdeOqIvJWR%2BwDreKJDliJtplPyR1%2BcnsYFx%2FOEbc07Kx%2BxW8EVVGhFcexRdJDBL5OEU2Bj9aFfCUAKhbwnrYoER%2BlVIuSJupinCYVebZMNrUvCr1qv1UGPQf4%2FouRK1QNNqmcLCyHLMWwjmvcEASGBDT5QxJYmXqbbhdftBvYhGxUDv9GnqBiU5RZvG%2Bfwvm2iQPj526tPGEz6S7jGaBDDXmCM2hZfEZFCg6VOCstycZNwPiLs9IECIryWsA99lX1QVT0wrpPzrgY6kwIwR62sG7zJxueM3JZitWvpTHeFvRjogSoiCtpdDvDMiUdMGedmzO61QPssE8xHITCm9Qp67mn7PkafuEbMf5P2trCfAfzSv4cffn0w0sOo7FzJkhSwyHKaMp0PiSr3VSOz0sHLkKzrsyOpvS%2FQAXvQvW%2BqGF1yQhzxkD2NnQgGhzAQtK72DmDRaUNMXSPge7qGjY2t8FwhWiZDFhEuwwaWH7DZTL%2B1t%2F90rmt01RAcmevkFcBcNEdBNyif0xs1bNyRHUKW%2FBGRmQsOTLyhHwvwl8GizzKDthkXPMRwmo2j0gFcYmoV%2FIkKyxfFqyX0zSxb4dvvCHxXJbc1Q5nO%2B3tb%2B7upWkPyudZSLzZRW9UaG2u4Ug%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T172820Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AB3PT5X7Y%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8c933d3fc96a0c82b0b72ed49441fb3a10cb23a07b524f60f3a4073e3955207f',
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

export const jainkidney = generateJainKidneyConfig();
