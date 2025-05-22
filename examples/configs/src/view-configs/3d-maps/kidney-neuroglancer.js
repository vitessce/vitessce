import {
    VitessceConfig, CoordinationLevel as CL, hconcat, vconcat, getInitialCoordinationScopePrefix,
} from '@vitessce/config';


function generateKidneyNeuroglancerConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16', name: 'Kidney',
    });
    const dataset = config.addDataset('My dataset');
    dataset.addFile({
        fileType: 'obsSets.csv',
        url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/washu-kidney/ng-meshes/20_10/mesh_types.csv',
        coordinationValues: {
            obsType: 'cell',
        },
        options: {
            obsIndex: 'id', obsSets: [{
                name: 'Type', column: 'type',
            },],
        },
    });
    const obsSets = config.addView(dataset, 'obsSets');
    const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
        viewerState: {
            dimensions: {
                x: [1e-9, 'm'], y: [1e-9, 'm'], z: [1e-9, 'm']
            },
            position: [524.104736328125, 655.988525390625, 727.5358276367188],
            crossSectionScale: 1,
            projectionOrientation: [-0.10776188969612122, -0.10146749764680862, 0.08859290182590485, 0.9850091338157654],
            projectionScale: 1558.488632953483,
            layers: [{
                type: 'segmentation',
                source: 'precomputed://https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/washu-kidney/ng-meshes/20_10/',
                segments: ['5'],
                segmentColors: {
                    5: 'red',
                },
                name: 'segmentation',
            }],
            showSlices: false,
            layout: '3d',
        }
    });
    config.layout(hconcat(neuroglancerView, obsSets));

    const configJSON = config.toJSON();
    return configJSON;
}

export const kidneyNeuroglancer = generateKidneyNeuroglancerConfiguration();
