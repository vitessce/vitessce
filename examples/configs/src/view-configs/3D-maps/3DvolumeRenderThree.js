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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHoWQRMUGtJY9%2Fvnc9lTrsvWioWmJEXv1JTfnYwNs6yxAiEAmHxqGdW%2F8TW4vSTD7L7UENEAWoddysccfSceOQmWpYIq9QMI3P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDE2UIUhxrNS41J2V4irJA7GZgiF%2FUfcfgnB4U5ua18%2BrqBvc10JJ45Y0Sx7Hz1pm%2FwZX4ZI6LgVCIpuUec%2BhnXciuPfmrlamGQSh8cPVQ7G729DbRuK4Ee2%2BBX9cIDu%2BDw7YmtLvwS18DGs2azPNFd%2BPYuOHNsnba7aL1LJ7jg37aRKJ5wi44lYEnjjoHWi4SxIkF2fIEWmz8%2FzebT4FxOaPFGZAcdTkIU38WiCYxusCU0IbQhRu%2B%2FDYyz5nU9SwT7kTCytOrw8AoVgx4cMYXHV7hQRXgS8la4CaH1FsSo3kOkyi5q5UiNHRgIm2FOChJB4alCx8FhfSjtNwiNo7ej0E0JmBY2qhYOiCY4JpZ54uY7QSJYp9YjYomlrGoyj%2FTNUSTHpUcq1k9Tt%2FrhvK3xXSV64mIW7%2FJFbj9tzRo2b4Ic9fYVxhFAsTz%2BJH9CPe97XDANvEgiGDMh3YjrEF3ntm93yBcwmsfY7XyMm0tCsk7cZadaNEZHFy%2F3JEPrVKCVXYgH4%2Feub%2BYRysx40RgPb31gluowDV4z7n2f8TQVFFchM5Usdb3TMLhgBQEGmv%2FgCiUhqC5t4pKkItszL5QdOihM3yzD4VPByYguhLwVMDsk6NIRDSXmUw5er4rgY6lAJpSir%2BEp%2Fe7iqtqZ%2BY8G5VvMUCLQ6AQeiXLAEnRYMDw5i8mhlNILMgg%2F0JwqbJO5aIWSdJ2QIf73wowfUao8vwZ5QMysLTqIlZmCcNRe%2BrDVBMy9%2Bo4MHp1zF3PTNQ%2BNmA%2BvDNkFq8ksSL7x9ESo4%2BuM3eqRF%2F6EYtXyd7lIgJjyWEHla%2Bjpy5RRDHHwcRXQ8t8uNVdMzTNDJeZGZx5IHELirwccm4%2FjgIdyn5vxu1r0mN4t4kqf9eGJs%2FsuoTV7j%2BFRU0ZcDUkfc1H5kZbNgovckHyrXN8fUGzTSXB2omR4i7i0vjH7%2FOEgbRTdgdh7uFEU9jWjJfJ8gbOBNEZmwQUfpySLQ49MUU86jRi2tyHSq4oSs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240227T191841Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AJUGQLQUX%2F20240227%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8aaf6e9e062606a7df0e6b11089aa1e40fa167e67c641b2c03a75c33b73f5458",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHoWQRMUGtJY9%2Fvnc9lTrsvWioWmJEXv1JTfnYwNs6yxAiEAmHxqGdW%2F8TW4vSTD7L7UENEAWoddysccfSceOQmWpYIq9QMI3P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDE2UIUhxrNS41J2V4irJA7GZgiF%2FUfcfgnB4U5ua18%2BrqBvc10JJ45Y0Sx7Hz1pm%2FwZX4ZI6LgVCIpuUec%2BhnXciuPfmrlamGQSh8cPVQ7G729DbRuK4Ee2%2BBX9cIDu%2BDw7YmtLvwS18DGs2azPNFd%2BPYuOHNsnba7aL1LJ7jg37aRKJ5wi44lYEnjjoHWi4SxIkF2fIEWmz8%2FzebT4FxOaPFGZAcdTkIU38WiCYxusCU0IbQhRu%2B%2FDYyz5nU9SwT7kTCytOrw8AoVgx4cMYXHV7hQRXgS8la4CaH1FsSo3kOkyi5q5UiNHRgIm2FOChJB4alCx8FhfSjtNwiNo7ej0E0JmBY2qhYOiCY4JpZ54uY7QSJYp9YjYomlrGoyj%2FTNUSTHpUcq1k9Tt%2FrhvK3xXSV64mIW7%2FJFbj9tzRo2b4Ic9fYVxhFAsTz%2BJH9CPe97XDANvEgiGDMh3YjrEF3ntm93yBcwmsfY7XyMm0tCsk7cZadaNEZHFy%2F3JEPrVKCVXYgH4%2Feub%2BYRysx40RgPb31gluowDV4z7n2f8TQVFFchM5Usdb3TMLhgBQEGmv%2FgCiUhqC5t4pKkItszL5QdOihM3yzD4VPByYguhLwVMDsk6NIRDSXmUw5er4rgY6lAJpSir%2BEp%2Fe7iqtqZ%2BY8G5VvMUCLQ6AQeiXLAEnRYMDw5i8mhlNILMgg%2F0JwqbJO5aIWSdJ2QIf73wowfUao8vwZ5QMysLTqIlZmCcNRe%2BrDVBMy9%2Bo4MHp1zF3PTNQ%2BNmA%2BvDNkFq8ksSL7x9ESo4%2BuM3eqRF%2F6EYtXyd7lIgJjyWEHla%2Bjpy5RRDHHwcRXQ8t8uNVdMzTNDJeZGZx5IHELirwccm4%2FjgIdyn5vxu1r0mN4t4kqf9eGJs%2FsuoTV7j%2BFRU0ZcDUkfc1H5kZbNgovckHyrXN8fUGzTSXB2omR4i7i0vjH7%2FOEgbRTdgdh7uFEU9jWjJfJ8gbOBNEZmwQUfpySLQ49MUU86jRi2tyHSq4oSs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240227T191915Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJUGQLQUX%2F20240227%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=35ca64733037225ba388ef599b4390a8b89ec2302d7816c0041494eca215b74b",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHoWQRMUGtJY9%2Fvnc9lTrsvWioWmJEXv1JTfnYwNs6yxAiEAmHxqGdW%2F8TW4vSTD7L7UENEAWoddysccfSceOQmWpYIq9QMI3P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDE2UIUhxrNS41J2V4irJA7GZgiF%2FUfcfgnB4U5ua18%2BrqBvc10JJ45Y0Sx7Hz1pm%2FwZX4ZI6LgVCIpuUec%2BhnXciuPfmrlamGQSh8cPVQ7G729DbRuK4Ee2%2BBX9cIDu%2BDw7YmtLvwS18DGs2azPNFd%2BPYuOHNsnba7aL1LJ7jg37aRKJ5wi44lYEnjjoHWi4SxIkF2fIEWmz8%2FzebT4FxOaPFGZAcdTkIU38WiCYxusCU0IbQhRu%2B%2FDYyz5nU9SwT7kTCytOrw8AoVgx4cMYXHV7hQRXgS8la4CaH1FsSo3kOkyi5q5UiNHRgIm2FOChJB4alCx8FhfSjtNwiNo7ej0E0JmBY2qhYOiCY4JpZ54uY7QSJYp9YjYomlrGoyj%2FTNUSTHpUcq1k9Tt%2FrhvK3xXSV64mIW7%2FJFbj9tzRo2b4Ic9fYVxhFAsTz%2BJH9CPe97XDANvEgiGDMh3YjrEF3ntm93yBcwmsfY7XyMm0tCsk7cZadaNEZHFy%2F3JEPrVKCVXYgH4%2Feub%2BYRysx40RgPb31gluowDV4z7n2f8TQVFFchM5Usdb3TMLhgBQEGmv%2FgCiUhqC5t4pKkItszL5QdOihM3yzD4VPByYguhLwVMDsk6NIRDSXmUw5er4rgY6lAJpSir%2BEp%2Fe7iqtqZ%2BY8G5VvMUCLQ6AQeiXLAEnRYMDw5i8mhlNILMgg%2F0JwqbJO5aIWSdJ2QIf73wowfUao8vwZ5QMysLTqIlZmCcNRe%2BrDVBMy9%2Bo4MHp1zF3PTNQ%2BNmA%2BvDNkFq8ksSL7x9ESo4%2BuM3eqRF%2F6EYtXyd7lIgJjyWEHla%2Bjpy5RRDHHwcRXQ8t8uNVdMzTNDJeZGZx5IHELirwccm4%2FjgIdyn5vxu1r0mN4t4kqf9eGJs%2FsuoTV7j%2BFRU0ZcDUkfc1H5kZbNgovckHyrXN8fUGzTSXB2omR4i7i0vjH7%2FOEgbRTdgdh7uFEU9jWjJfJ8gbOBNEZmwQUfpySLQ49MUU86jRi2tyHSq4oSs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240227T191826Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJUGQLQUX%2F20240227%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7f76e6f748bf0ce23d04bf31dab09443fc3c36d8be545a927f78e6cc61388c5c',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHoWQRMUGtJY9%2Fvnc9lTrsvWioWmJEXv1JTfnYwNs6yxAiEAmHxqGdW%2F8TW4vSTD7L7UENEAWoddysccfSceOQmWpYIq9QMI3P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDE2UIUhxrNS41J2V4irJA7GZgiF%2FUfcfgnB4U5ua18%2BrqBvc10JJ45Y0Sx7Hz1pm%2FwZX4ZI6LgVCIpuUec%2BhnXciuPfmrlamGQSh8cPVQ7G729DbRuK4Ee2%2BBX9cIDu%2BDw7YmtLvwS18DGs2azPNFd%2BPYuOHNsnba7aL1LJ7jg37aRKJ5wi44lYEnjjoHWi4SxIkF2fIEWmz8%2FzebT4FxOaPFGZAcdTkIU38WiCYxusCU0IbQhRu%2B%2FDYyz5nU9SwT7kTCytOrw8AoVgx4cMYXHV7hQRXgS8la4CaH1FsSo3kOkyi5q5UiNHRgIm2FOChJB4alCx8FhfSjtNwiNo7ej0E0JmBY2qhYOiCY4JpZ54uY7QSJYp9YjYomlrGoyj%2FTNUSTHpUcq1k9Tt%2FrhvK3xXSV64mIW7%2FJFbj9tzRo2b4Ic9fYVxhFAsTz%2BJH9CPe97XDANvEgiGDMh3YjrEF3ntm93yBcwmsfY7XyMm0tCsk7cZadaNEZHFy%2F3JEPrVKCVXYgH4%2Feub%2BYRysx40RgPb31gluowDV4z7n2f8TQVFFchM5Usdb3TMLhgBQEGmv%2FgCiUhqC5t4pKkItszL5QdOihM3yzD4VPByYguhLwVMDsk6NIRDSXmUw5er4rgY6lAJpSir%2BEp%2Fe7iqtqZ%2BY8G5VvMUCLQ6AQeiXLAEnRYMDw5i8mhlNILMgg%2F0JwqbJO5aIWSdJ2QIf73wowfUao8vwZ5QMysLTqIlZmCcNRe%2BrDVBMy9%2Bo4MHp1zF3PTNQ%2BNmA%2BvDNkFq8ksSL7x9ESo4%2BuM3eqRF%2F6EYtXyd7lIgJjyWEHla%2Bjpy5RRDHHwcRXQ8t8uNVdMzTNDJeZGZx5IHELirwccm4%2FjgIdyn5vxu1r0mN4t4kqf9eGJs%2FsuoTV7j%2BFRU0ZcDUkfc1H5kZbNgovckHyrXN8fUGzTSXB2omR4i7i0vjH7%2FOEgbRTdgdh7uFEU9jWjJfJ8gbOBNEZmwQUfpySLQ49MUU86jRi2tyHSq4oSs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240227T191855Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJUGQLQUX%2F20240227%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ca76bc78df175ec35048e5ab86a7489225ec0265a467f581ccf68d3b2a82d77d',
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
