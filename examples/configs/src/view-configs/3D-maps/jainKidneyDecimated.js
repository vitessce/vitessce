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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AJP6HTYJH%2F20240312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240312T130738Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJGMEQCIEe5AryZPjP1GdvoCjVFWhxIv2tjHRb57FOcLIhfy1iHAiBVJyYgMOr1LGAqzJlswQnEtQ%2BpbNMkdEXIHdCyX64YDSqTAwhGEAEaDDEzNjU3NjUyMjA0OCIMYSeEVt24tguwOdJwKvAC8DhWn2pqJPUHPhndk%2F8X%2BfB2Pl1Dit2wMikasiEZtXPtzStvOsBBlrTdDaB6ltIVAsY%2B2mWnp9tBbUEzk7y23fhEfOZbZUzMhvVdETj4nWiV5ODFMOD8Y3K3k%2BWcm%2F4vvX%2BI4f0OAjy%2BZ7lVxvD9TsPItuwpU%2B8ZjWVhujBriPUrKksPfEH2GXudG%2BoJaDlhr7Z33g%2FP%2Be9dTeOkqVpfY9qK6lXRjIJD8h1m7yiECIDHE2o6SDOnUhJhMETeMjcCwdXGYWHXuKGT2G1KXa7yJlGt8b8TKnPgpjSHgSiYkMhemyvBW02%2FQKUqO7nibIox%2Bq7Ko%2BOYDWOLKKIUOSJebasyLCLyzLt4Q13WzJjR%2BQs36L023nmB2zZtdAKmbLEZveyqG2zuOH8FANJyvBZ%2BhH9El7oet7z1AmvCRM9h7iMi1X8v7SDUUkNP9eLQZ0Y8JJ8sp9kr91zp2A1ywMlodbogry6%2FY%2BbV0blosSph6pUw2abBrwY6pwF2gTcpIZMjHleXi7p5UZdUPaTtlepevtmrzUOqWQuEA7M6p2KJfVR%2B3%2BSSWMTSQFKlE10ZXP6IaYSCDq8yPj7i5lZEiGD6%2B2xQ0JVwIoeinrpaOEC25xUN0disYEQGH9E2wSbQVG3CPWoAxA9vioK4iCjSuXkovDAEx8NwbqISeNb8Y1KO5lpy8urggg3Kj8e8XbqUt6uB8CC6p7YfR33B9rJBffE6Bw%3D%3D&X-Amz-Signature=c27f6095ee9624b5ad55073a2fb288022959f80447ce29f05516aa3136c40fa1',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AJP6HTYJH%2F20240312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240312T130709Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJGMEQCIEe5AryZPjP1GdvoCjVFWhxIv2tjHRb57FOcLIhfy1iHAiBVJyYgMOr1LGAqzJlswQnEtQ%2BpbNMkdEXIHdCyX64YDSqTAwhGEAEaDDEzNjU3NjUyMjA0OCIMYSeEVt24tguwOdJwKvAC8DhWn2pqJPUHPhndk%2F8X%2BfB2Pl1Dit2wMikasiEZtXPtzStvOsBBlrTdDaB6ltIVAsY%2B2mWnp9tBbUEzk7y23fhEfOZbZUzMhvVdETj4nWiV5ODFMOD8Y3K3k%2BWcm%2F4vvX%2BI4f0OAjy%2BZ7lVxvD9TsPItuwpU%2B8ZjWVhujBriPUrKksPfEH2GXudG%2BoJaDlhr7Z33g%2FP%2Be9dTeOkqVpfY9qK6lXRjIJD8h1m7yiECIDHE2o6SDOnUhJhMETeMjcCwdXGYWHXuKGT2G1KXa7yJlGt8b8TKnPgpjSHgSiYkMhemyvBW02%2FQKUqO7nibIox%2Bq7Ko%2BOYDWOLKKIUOSJebasyLCLyzLt4Q13WzJjR%2BQs36L023nmB2zZtdAKmbLEZveyqG2zuOH8FANJyvBZ%2BhH9El7oet7z1AmvCRM9h7iMi1X8v7SDUUkNP9eLQZ0Y8JJ8sp9kr91zp2A1ywMlodbogry6%2FY%2BbV0blosSph6pUw2abBrwY6pwF2gTcpIZMjHleXi7p5UZdUPaTtlepevtmrzUOqWQuEA7M6p2KJfVR%2B3%2BSSWMTSQFKlE10ZXP6IaYSCDq8yPj7i5lZEiGD6%2B2xQ0JVwIoeinrpaOEC25xUN0disYEQGH9E2wSbQVG3CPWoAxA9vioK4iCjSuXkovDAEx8NwbqISeNb8Y1KO5lpy8urggg3Kj8e8XbqUt6uB8CC6p7YfR33B9rJBffE6Bw%3D%3D&X-Amz-Signature=92517c1296ce71c8e5b306d281e9bde918d482896458e641f5b667e109178b8e',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AJP6HTYJH%2F20240312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240312T130643Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJGMEQCIEe5AryZPjP1GdvoCjVFWhxIv2tjHRb57FOcLIhfy1iHAiBVJyYgMOr1LGAqzJlswQnEtQ%2BpbNMkdEXIHdCyX64YDSqTAwhGEAEaDDEzNjU3NjUyMjA0OCIMYSeEVt24tguwOdJwKvAC8DhWn2pqJPUHPhndk%2F8X%2BfB2Pl1Dit2wMikasiEZtXPtzStvOsBBlrTdDaB6ltIVAsY%2B2mWnp9tBbUEzk7y23fhEfOZbZUzMhvVdETj4nWiV5ODFMOD8Y3K3k%2BWcm%2F4vvX%2BI4f0OAjy%2BZ7lVxvD9TsPItuwpU%2B8ZjWVhujBriPUrKksPfEH2GXudG%2BoJaDlhr7Z33g%2FP%2Be9dTeOkqVpfY9qK6lXRjIJD8h1m7yiECIDHE2o6SDOnUhJhMETeMjcCwdXGYWHXuKGT2G1KXa7yJlGt8b8TKnPgpjSHgSiYkMhemyvBW02%2FQKUqO7nibIox%2Bq7Ko%2BOYDWOLKKIUOSJebasyLCLyzLt4Q13WzJjR%2BQs36L023nmB2zZtdAKmbLEZveyqG2zuOH8FANJyvBZ%2BhH9El7oet7z1AmvCRM9h7iMi1X8v7SDUUkNP9eLQZ0Y8JJ8sp9kr91zp2A1ywMlodbogry6%2FY%2BbV0blosSph6pUw2abBrwY6pwF2gTcpIZMjHleXi7p5UZdUPaTtlepevtmrzUOqWQuEA7M6p2KJfVR%2B3%2BSSWMTSQFKlE10ZXP6IaYSCDq8yPj7i5lZEiGD6%2B2xQ0JVwIoeinrpaOEC25xUN0disYEQGH9E2wSbQVG3CPWoAxA9vioK4iCjSuXkovDAEx8NwbqISeNb8Y1KO5lpy8urggg3Kj8e8XbqUt6uB8CC6p7YfR33B9rJBffE6Bw%3D%3D&X-Amz-Signature=642bb6ce50eeef197e91fbe644bb7f5c1c0c17fddc73991f53a624125338cf1f',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AJP6HTYJH%2F20240312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240312T130722Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED4aCXVzLWVhc3QtMSJGMEQCIEe5AryZPjP1GdvoCjVFWhxIv2tjHRb57FOcLIhfy1iHAiBVJyYgMOr1LGAqzJlswQnEtQ%2BpbNMkdEXIHdCyX64YDSqTAwhGEAEaDDEzNjU3NjUyMjA0OCIMYSeEVt24tguwOdJwKvAC8DhWn2pqJPUHPhndk%2F8X%2BfB2Pl1Dit2wMikasiEZtXPtzStvOsBBlrTdDaB6ltIVAsY%2B2mWnp9tBbUEzk7y23fhEfOZbZUzMhvVdETj4nWiV5ODFMOD8Y3K3k%2BWcm%2F4vvX%2BI4f0OAjy%2BZ7lVxvD9TsPItuwpU%2B8ZjWVhujBriPUrKksPfEH2GXudG%2BoJaDlhr7Z33g%2FP%2Be9dTeOkqVpfY9qK6lXRjIJD8h1m7yiECIDHE2o6SDOnUhJhMETeMjcCwdXGYWHXuKGT2G1KXa7yJlGt8b8TKnPgpjSHgSiYkMhemyvBW02%2FQKUqO7nibIox%2Bq7Ko%2BOYDWOLKKIUOSJebasyLCLyzLt4Q13WzJjR%2BQs36L023nmB2zZtdAKmbLEZveyqG2zuOH8FANJyvBZ%2BhH9El7oet7z1AmvCRM9h7iMi1X8v7SDUUkNP9eLQZ0Y8JJ8sp9kr91zp2A1ywMlodbogry6%2FY%2BbV0blosSph6pUw2abBrwY6pwF2gTcpIZMjHleXi7p5UZdUPaTtlepevtmrzUOqWQuEA7M6p2KJfVR%2B3%2BSSWMTSQFKlE10ZXP6IaYSCDq8yPj7i5lZEiGD6%2B2xQ0JVwIoeinrpaOEC25xUN0disYEQGH9E2wSbQVG3CPWoAxA9vioK4iCjSuXkovDAEx8NwbqISeNb8Y1KO5lpy8urggg3Kj8e8XbqUt6uB8CC6p7YfR33B9rJBffE6Bw%3D%3D&X-Amz-Signature=127843ea42b5d1d2a90c9a728d32190879679de5b0a37e80afe1a75859e1c771',
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

export const jainkidneyDecimated = generateJainKidneyDecimatedConfig();
