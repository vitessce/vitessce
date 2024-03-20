import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        // url: "https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=",
        // url: "https://vitessce-data-v2.s3.amazonaws.com/data/kiemenetal/5xHE.ome.tiff",
        // url: "http://127.0.0.1:8080/cell_community.ome.tif",
        //url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        //url: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/f8ii.ome.tiff",
        // url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEnllXjNsAfToEF%2BC5M5eHCQmF6YDhL9AE9%2Fv4wf6PccAiEAyCnA4BJLseCKVc4CohnLn5ITOvFrIvxJe9bTLqRCOuEq9QMI4f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDIDZ%2FSEDvjddwnrIwSrJA9lrXR6QsLUYy1Gp%2FCAZkH3GB%2B882ZNn7F0Sf%2FC%2Fjf7%2BjPzo67c1t6MAw%2BUAae8zHx4L3wp83hZ1HHynf4KOWnYL3saBwe%2F9bf5el3XndTriZN%2BfqFfXnVy%2FNXRmoEYZeBklIlu6RQR0tAeJMYmV4IcUxoYbriGEdYPnZEeA%2BOKMJ1mfZD5V8uGI66EjT%2BwNQ2MW9eNFLQnmvgOi5dlXzi4OaQwZnv79DnCbJbsO9hV%2BzPPu3lhXkgRXXOXul6t%2FBD3NDl8Sj9HCMGx6WYvNWp7vTN288Xr3Zq5t0G2hOpWGcd4p%2FNHQTIoPUqjbzpHokoVnZezQALyikn8InKYtMthJkYcbGRRMH4Wu3t0F1ZIKAFbJPnHPcNT74zhB1dPXRxpdjdKDYdwI6e6cxf6ujxV9hREOL4JWEQAYaAoIIjPmHhHeuonvhADuSwd8HP0dIoc9kDi0jcUGiAM6%2BsFb%2BUffjQsufpAGBeV9xECcnA7lWSLvdPkXR1trSiCLAoUoRdJAm%2BWvoDgcGQs5vf9ALCxF%2Bx0BVYuOeps3IE%2Bj8FvjTpJlbkQvExt%2BP6ofOmGRGYxko%2FKG3N1xhx8z78FjDiZ3zT0CzIizRvIwlKXjrwY6lAInueTTGriaMdMq5MvAL2xP%2BwwxgoUP1V3vlU0b8BP09iIp%2F3QWm6m%2FMWElKTsuiHh5ByzZ8yaQhTtNwjHJZ0qRRbK3F0h2oeYGk6tD%2B0px9wkR3F%2Bur8IwELox3FUKd9Z%2FQAJeWmT9ESVWt0Lo%2BxBNCU09f2hsmIr1hs70%2FhSG9iz8EbRY8xwx20s9mYBSTPyz897VRSNUPqztC8GsnZIBbWfYCJs85XnPS9AT75xJnhnxdnd7gl6M0mDWbRTYEUEHjbD0Y0i60mC%2FHpDdRjxhKspfW7CI1n2KawdxssX9Nvd2qoAutIiMvoT5OSV72x%2Fder4LLaX5%2FwJ2oONOgy7hcdcDUnbsavlEq4ideQ14elO2mCY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240319T022200Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AN4C4PMUK%2F20240319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=01cb9b328b734afb4ed867d5982588edcfd18694b14787abe7b67b74fedf736b",
        //  url: "https://vitessce-data-v2.s3.amazonaws.com/data/kiemenetal/5xHE.ome.tiff",
        //   options: {
        //          offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEnllXjNsAfToEF%2BC5M5eHCQmF6YDhL9AE9%2Fv4wf6PccAiEAyCnA4BJLseCKVc4CohnLn5ITOvFrIvxJe9bTLqRCOuEq9QMI4f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDIDZ%2FSEDvjddwnrIwSrJA9lrXR6QsLUYy1Gp%2FCAZkH3GB%2B882ZNn7F0Sf%2FC%2Fjf7%2BjPzo67c1t6MAw%2BUAae8zHx4L3wp83hZ1HHynf4KOWnYL3saBwe%2F9bf5el3XndTriZN%2BfqFfXnVy%2FNXRmoEYZeBklIlu6RQR0tAeJMYmV4IcUxoYbriGEdYPnZEeA%2BOKMJ1mfZD5V8uGI66EjT%2BwNQ2MW9eNFLQnmvgOi5dlXzi4OaQwZnv79DnCbJbsO9hV%2BzPPu3lhXkgRXXOXul6t%2FBD3NDl8Sj9HCMGx6WYvNWp7vTN288Xr3Zq5t0G2hOpWGcd4p%2FNHQTIoPUqjbzpHokoVnZezQALyikn8InKYtMthJkYcbGRRMH4Wu3t0F1ZIKAFbJPnHPcNT74zhB1dPXRxpdjdKDYdwI6e6cxf6ujxV9hREOL4JWEQAYaAoIIjPmHhHeuonvhADuSwd8HP0dIoc9kDi0jcUGiAM6%2BsFb%2BUffjQsufpAGBeV9xECcnA7lWSLvdPkXR1trSiCLAoUoRdJAm%2BWvoDgcGQs5vf9ALCxF%2Bx0BVYuOeps3IE%2Bj8FvjTpJlbkQvExt%2BP6ofOmGRGYxko%2FKG3N1xhx8z78FjDiZ3zT0CzIizRvIwlKXjrwY6lAInueTTGriaMdMq5MvAL2xP%2BwwxgoUP1V3vlU0b8BP09iIp%2F3QWm6m%2FMWElKTsuiHh5ByzZ8yaQhTtNwjHJZ0qRRbK3F0h2oeYGk6tD%2B0px9wkR3F%2Bur8IwELox3FUKd9Z%2FQAJeWmT9ESVWt0Lo%2BxBNCU09f2hsmIr1hs70%2FhSG9iz8EbRY8xwx20s9mYBSTPyz897VRSNUPqztC8GsnZIBbWfYCJs85XnPS9AT75xJnhnxdnd7gl6M0mDWbRTYEUEHjbD0Y0i60mC%2FHpDdRjxhKspfW7CI1n2KawdxssX9Nvd2qoAutIiMvoT5OSV72x%2Fder4LLaX5%2FwJ2oONOgy7hcdcDUnbsavlEq4ideQ14elO2mCY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240319T022259Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AN4C4PMUK%2F20240319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8f9fb846e2a104aa02667a2d887a5aca0a524dc63760036741078fb079e30e0c",
        //   },
        url:'http://127.0.0.1:8080/pyramid.ome.tiff',
         coordinationValues: {
             fileUid: 'kidney',
         },
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        //spatialRenderingMode:'3D',
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const threeMinimal = generateThreeMinimalConfiguration();
