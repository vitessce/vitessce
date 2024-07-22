import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidney() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Jain Kidney Decimated 2024',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
        options: {
            offsetsUrl: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    });

    // const organViewer = config.addView(dataset, 'organViewer').setProps({uberon: "http://purl.obolibrary.org/obo/UBERON_0004538"}); // organ with uberon
    const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "b1d41395cc87b8eff3f580cfa168283b"});
    const blockViewer = config.addView(dataset, 'blockViewer').setProps({uuidInput: "5f043da4d6347e2b6f93509c000804d1"});
    config.layout(hconcat(organViewer, blockViewer));

    const configJSON = config.toJSON();
    return configJSON;
}

export const jainKidney = generateJainKidney();
