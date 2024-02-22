import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Peter Sorger Blood Vessel',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHgaCXVzLWVhc3QtMSJHMEUCIGGqXO0Ws%2FTC%2BU0UqcbPqMI9bUL0CazGBjAyMf8P4%2BJoAiEAgEvYkl7D%2FULXuzDP%2FJZb8jkhOQEjw13KEsDyxsViYoEq6wMIYBABGgwxMzY1NzY1MjIwNDgiDGFkz2YWQSA6feVnkyrIAztcNYOnejn3LHS%2BGYdRNzJI91mtvBcP6AC%2B2zQgXrMrjorxGH8euClMLNvT397APdBKZcfDL050Aco161qPABqRynMWbUpMR%2FM%2FD%2FqxQvW%2BRgUEXziCnAMHh1TAwOQ6eRGm%2B2jpkxrYhhp4f1cGU2ZI9BlYiJT72lShs8Fire%2F2gtNzJBcKm%2BunEIoVYjLsM%2B%2BPx0ZkdvVQUpHE5GaeDLz07yDuhmUwLkt0zkq8r%2Bdi8YWr2kO7eovdXnSMsvbfiirXcZJnbnBeQeZO2tzzCPagD0zIPKQoa%2FyOr89vMpyWuYAsFubT%2FxLJVQBvOR2dn9%2FB9DOs22D7JDP1ua1iVVXoGiYduKoXFHZUp65q7ExCkKqfepiiQvhn2RNQKwiWAHEh5gjqKMTCx2yaRYGr%2FDqybhco%2BbjwPG%2BToCO6cqREpV42lVM5K3yB6TI9vQjWrgXngitmsQSTyjseF3N%2BJV%2Frnr9oFFCL4j56%2FtRQ%2BGNNcZe%2BMVqd3yVrVsfqOlsarykeux8N8aOyweWyhmptUt2zRiAjSQmzunA%2B1a%2FsxsMe0TWzKw2quAoUjnG3mwf3T78bAki48tKj5kYC9dbKJ%2BBZT8amY%2FA8njD9yt2uBjqUAolnoHEDfPfPbQ89WS2a4t1UQJcLyCl4SD5%2F4bK%2FHU%2B%2BOYU%2Biq6N8SPa15nk7PWhf9A0OHPNLNdxrfxdMSBuyAAd7puObtXDySq0ONd0cV7cLa39EBtOUXBZBFYysJytOgd%2BkrYWzFDVqqqONT51RvCiPUrg0s88ZnpcjqW0ItfeuRRDbyPmuXSt5r7YRIirZzaVUcy%2FiN2Vor0CZZmETOBPgAbJRCnvJVBkMkl3RmFY6VBfCeP7uQGyKYfdOTouzxHL2JprNgaaWyyUZcOx09fCgiKb%2FV5xhEqSx5DMjbjAzhdV35PfhWhaY%2FF74Uuu%2Fe4asHJzwmGUIsNZZemQjgmNZAChwNISR3y1%2BNzTKb9k41VIXg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240222T151758Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AM2533M5J%2F20240222%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5a96d6b29c9616ed18dbda70a4c38c6b199ead99036fa2afe6fd3cc97f34e371",
        //url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHgaCXVzLWVhc3QtMSJHMEUCIGGqXO0Ws%2FTC%2BU0UqcbPqMI9bUL0CazGBjAyMf8P4%2BJoAiEAgEvYkl7D%2FULXuzDP%2FJZb8jkhOQEjw13KEsDyxsViYoEq6wMIYBABGgwxMzY1NzY1MjIwNDgiDGFkz2YWQSA6feVnkyrIAztcNYOnejn3LHS%2BGYdRNzJI91mtvBcP6AC%2B2zQgXrMrjorxGH8euClMLNvT397APdBKZcfDL050Aco161qPABqRynMWbUpMR%2FM%2FD%2FqxQvW%2BRgUEXziCnAMHh1TAwOQ6eRGm%2B2jpkxrYhhp4f1cGU2ZI9BlYiJT72lShs8Fire%2F2gtNzJBcKm%2BunEIoVYjLsM%2B%2BPx0ZkdvVQUpHE5GaeDLz07yDuhmUwLkt0zkq8r%2Bdi8YWr2kO7eovdXnSMsvbfiirXcZJnbnBeQeZO2tzzCPagD0zIPKQoa%2FyOr89vMpyWuYAsFubT%2FxLJVQBvOR2dn9%2FB9DOs22D7JDP1ua1iVVXoGiYduKoXFHZUp65q7ExCkKqfepiiQvhn2RNQKwiWAHEh5gjqKMTCx2yaRYGr%2FDqybhco%2BbjwPG%2BToCO6cqREpV42lVM5K3yB6TI9vQjWrgXngitmsQSTyjseF3N%2BJV%2Frnr9oFFCL4j56%2FtRQ%2BGNNcZe%2BMVqd3yVrVsfqOlsarykeux8N8aOyweWyhmptUt2zRiAjSQmzunA%2B1a%2FsxsMe0TWzKw2quAoUjnG3mwf3T78bAki48tKj5kYC9dbKJ%2BBZT8amY%2FA8njD9yt2uBjqUAolnoHEDfPfPbQ89WS2a4t1UQJcLyCl4SD5%2F4bK%2FHU%2B%2BOYU%2Biq6N8SPa15nk7PWhf9A0OHPNLNdxrfxdMSBuyAAd7puObtXDySq0ONd0cV7cLa39EBtOUXBZBFYysJytOgd%2BkrYWzFDVqqqONT51RvCiPUrg0s88ZnpcjqW0ItfeuRRDbyPmuXSt5r7YRIirZzaVUcy%2FiN2Vor0CZZmETOBPgAbJRCnvJVBkMkl3RmFY6VBfCeP7uQGyKYfdOTouzxHL2JprNgaaWyyUZcOx09fCgiKb%2FV5xhEqSx5DMjbjAzhdV35PfhWhaY%2FF74Uuu%2Fe4asHJzwmGUIsNZZemQjgmNZAChwNISR3y1%2BNzTKb9k41VIXg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240222T151741Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AM2533M5J%2F20240222%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b3190ac444ddbe71e225d62ba4c37bf26c0828aa48de0948710e033717839ec9",
            //offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        //url: 'https://vitessce-data-v2.s3.amazonaws.com/data/bloodVessel.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHgaCXVzLWVhc3QtMSJHMEUCIGGqXO0Ws%2FTC%2BU0UqcbPqMI9bUL0CazGBjAyMf8P4%2BJoAiEAgEvYkl7D%2FULXuzDP%2FJZb8jkhOQEjw13KEsDyxsViYoEq6wMIYBABGgwxMzY1NzY1MjIwNDgiDGFkz2YWQSA6feVnkyrIAztcNYOnejn3LHS%2BGYdRNzJI91mtvBcP6AC%2B2zQgXrMrjorxGH8euClMLNvT397APdBKZcfDL050Aco161qPABqRynMWbUpMR%2FM%2FD%2FqxQvW%2BRgUEXziCnAMHh1TAwOQ6eRGm%2B2jpkxrYhhp4f1cGU2ZI9BlYiJT72lShs8Fire%2F2gtNzJBcKm%2BunEIoVYjLsM%2B%2BPx0ZkdvVQUpHE5GaeDLz07yDuhmUwLkt0zkq8r%2Bdi8YWr2kO7eovdXnSMsvbfiirXcZJnbnBeQeZO2tzzCPagD0zIPKQoa%2FyOr89vMpyWuYAsFubT%2FxLJVQBvOR2dn9%2FB9DOs22D7JDP1ua1iVVXoGiYduKoXFHZUp65q7ExCkKqfepiiQvhn2RNQKwiWAHEh5gjqKMTCx2yaRYGr%2FDqybhco%2BbjwPG%2BToCO6cqREpV42lVM5K3yB6TI9vQjWrgXngitmsQSTyjseF3N%2BJV%2Frnr9oFFCL4j56%2FtRQ%2BGNNcZe%2BMVqd3yVrVsfqOlsarykeux8N8aOyweWyhmptUt2zRiAjSQmzunA%2B1a%2FsxsMe0TWzKw2quAoUjnG3mwf3T78bAki48tKj5kYC9dbKJ%2BBZT8amY%2FA8njD9yt2uBjqUAolnoHEDfPfPbQ89WS2a4t1UQJcLyCl4SD5%2F4bK%2FHU%2B%2BOYU%2Biq6N8SPa15nk7PWhf9A0OHPNLNdxrfxdMSBuyAAd7puObtXDySq0ONd0cV7cLa39EBtOUXBZBFYysJytOgd%2BkrYWzFDVqqqONT51RvCiPUrg0s88ZnpcjqW0ItfeuRRDbyPmuXSt5r7YRIirZzaVUcy%2FiN2Vor0CZZmETOBPgAbJRCnvJVBkMkl3RmFY6VBfCeP7uQGyKYfdOTouzxHL2JprNgaaWyyUZcOx09fCgiKb%2FV5xhEqSx5DMjbjAzhdV35PfhWhaY%2FF74Uuu%2Fe4asHJzwmGUIsNZZemQjgmNZAChwNISR3y1%2BNzTKb9k41VIXg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240222T151809Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AM2533M5J%2F20240222%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7b6fa563ae95e849b822dba410c7e30e1cad445ed7f4e188b7b2ee13e47a40cc',
        //url: 'https://vitessce-data-v2.s3.amazonaws.com/data/optimized.glb',
        coordinationValues: {
            fileUid: 'Cells',
        }
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
   // const spatialVolumeView = config.addView(dataset, 'spatialBeta').setProps({ title: 'MIP' });
    const lcView = config.addView(dataset, 'layerControllerBeta');

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

    glomsObsTypeScope.setValue('Cells');
    glomsFeatureTypeScope.setValue('feature');
    glomsFeatureValueTypeScope.setValue('value');
    glomsFeatureSelectionScope.setValue(['Volume']);

    //const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

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
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [1048,5060],
                    },
                    // {
                    //     spatialTargetC: 1,
                    //     spatialChannelColor: [0, 255, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [325,721],
                    // },
                    // {
                    //     spatialTargetC: 2,
                    //     spatialChannelColor: [255, 0, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [463,680],
                    // },
                    // {
                    //     spatialTargetC: 9,
                    //     spatialChannelColor: [255, 0, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [643,810],
                    // },
                    // {
                    //     spatialTargetC: 4,
                    //     spatialChannelColor: [255, 255, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [419,2175],
                    // },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'Cells',
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
                    }
                ])
            }
        ])
    });

   // config.layout(hconcat(vconcat(spatialThreeView,spatialVolumeView), vconcat(lcView,obsSetsView, barPlot)));
    config.layout(hconcat(spatialThreeView, vconcat(lcView)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const bloodVessel = generateBloodVesselConfig();
