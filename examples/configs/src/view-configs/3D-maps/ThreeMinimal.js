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
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/5x.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIAxdZ9m4AWNLSZMQtyIthRtMJjdTUKNLpjbaS0NolxiRAiEAoJ5BAZUwDMS7VgZdVr%2BP8MLEy41zWs%2FZ6Td%2BflVLYGIq9QMIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDO%2FL6DnR50G3q7Ue%2ByrJA3NnhkG5h2A7evpFqUiX7EioVULR4h2SD6lhk71QvtNes%2Bo9hTy7eJezIugapPd3WwD6C1f%2BOkoO35cv3zLNOqRFcqEj07judfrZU2tROyd78wXhsbifpmLY0gwqC0brV88bE%2FMOUC%2FhbAo9DodVVZx4RJCATO65oBix2IobdEm%2BbwxR5sb00d2pTFeorzV2clSsMZqBn0dK4u%2Fy9AJs8rNZ1HMaeBHFGGziR5ZGqXd36fSlYbFudqjG8KgA7TdIqRrO5kENKelYwbBueMKqQ5n%2Fp2pVwsZ3%2FfjcroRwqdoFKFD0R%2FJWrAmir7ejCvT7hQl0oFBcBPquHUY%2BF0T6T7PZxRg5DhYGMDI3TDIiQ4eU04pLMktDPbq%2F9FtA5nmfWFD5B6sWcLkcIcZxZWC2WSSsMh9%2FHfL6AYpvTQyOoUltj9QAT94wRk4rfmiHy8NVTstqb4bDXntgIoYZFV2Y6P0fcVzfqI%2F4EJ829XxPlCQdSn9KVwOY2UDWjyVU61Y5%2BAxpAkMfdEB%2Bgmx76kiUpCaPXhyryHfzkOxdxelLoZ%2Fax%2FRY4P7rjWbzijSmAyLPCmGGRgZwLVSouOGYZNTR6rYrNbB2EPIOn3Aw6pCTsAY6lAIClwoaRfYsWQsnTNEob5BncrxDWgThbG1fK7I6FL7xP4x92j6Iz8hDtm80AxerLmJeo1%2BF6mZtE9V%2BuyEXSofRL0HL82j2e1bXJmFSqe7nrl%2BYRXzy4IX%2B4JsY858lOU0JFYa6WbgkVm0gC8AQ3HMVS%2F7hb%2FatIAJD5xfsd795uNqei%2BAkFRGgmGC%2BRZqMs5ipYKzBFBBllfWNHYM5gpDEgIKyWkqRIm4EUWh25xF7F1J35mX9Yitw8tMIfBN439hU0g0cIQjEeU4wRL5ICp%2BW%2B2WH07LabGLJ1upR5Q1g30mk4l8le5rNcUT8D2H80IXcL1b340ar2zn83hI7G5MpSFMKHj7p5hfdbvCTNTnCtOpB9Xk%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T013243Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AIBODZ2UV%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f187e23bc18900f4b962676e745dfa3d03b341fe204e7f157da2ed5d2987bde5',
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/5x.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIAxdZ9m4AWNLSZMQtyIthRtMJjdTUKNLpjbaS0NolxiRAiEAoJ5BAZUwDMS7VgZdVr%2BP8MLEy41zWs%2FZ6Td%2BflVLYGIq9QMIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDO%2FL6DnR50G3q7Ue%2ByrJA3NnhkG5h2A7evpFqUiX7EioVULR4h2SD6lhk71QvtNes%2Bo9hTy7eJezIugapPd3WwD6C1f%2BOkoO35cv3zLNOqRFcqEj07judfrZU2tROyd78wXhsbifpmLY0gwqC0brV88bE%2FMOUC%2FhbAo9DodVVZx4RJCATO65oBix2IobdEm%2BbwxR5sb00d2pTFeorzV2clSsMZqBn0dK4u%2Fy9AJs8rNZ1HMaeBHFGGziR5ZGqXd36fSlYbFudqjG8KgA7TdIqRrO5kENKelYwbBueMKqQ5n%2Fp2pVwsZ3%2FfjcroRwqdoFKFD0R%2FJWrAmir7ejCvT7hQl0oFBcBPquHUY%2BF0T6T7PZxRg5DhYGMDI3TDIiQ4eU04pLMktDPbq%2F9FtA5nmfWFD5B6sWcLkcIcZxZWC2WSSsMh9%2FHfL6AYpvTQyOoUltj9QAT94wRk4rfmiHy8NVTstqb4bDXntgIoYZFV2Y6P0fcVzfqI%2F4EJ829XxPlCQdSn9KVwOY2UDWjyVU61Y5%2BAxpAkMfdEB%2Bgmx76kiUpCaPXhyryHfzkOxdxelLoZ%2Fax%2FRY4P7rjWbzijSmAyLPCmGGRgZwLVSouOGYZNTR6rYrNbB2EPIOn3Aw6pCTsAY6lAIClwoaRfYsWQsnTNEob5BncrxDWgThbG1fK7I6FL7xP4x92j6Iz8hDtm80AxerLmJeo1%2BF6mZtE9V%2BuyEXSofRL0HL82j2e1bXJmFSqe7nrl%2BYRXzy4IX%2B4JsY858lOU0JFYa6WbgkVm0gC8AQ3HMVS%2F7hb%2FatIAJD5xfsd795uNqei%2BAkFRGgmGC%2BRZqMs5ipYKzBFBBllfWNHYM5gpDEgIKyWkqRIm4EUWh25xF7F1J35mX9Yitw8tMIfBN439hU0g0cIQjEeU4wRL5ICp%2BW%2B2WH07LabGLJ1upR5Q1g30mk4l8le5rNcUT8D2H80IXcL1b340ar2zn83hI7G5MpSFMKHj7p5hfdbvCTNTnCtOpB9Xk%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T013216Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AIBODZ2UV%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=db7f55c28ba5dccbb80f36de19eb28d5fca8c4fc288794d6dc8e91231b198620",
        },
         coordinationValues: {
             fileUid: 'kidney',
         },
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        spatialRenderingMode:'3D',
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [221, 52, 151],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [524,6160],
                    },
                    {
                        spatialTargetC: 3,
                        spatialChannelColor: [29, 145, 192],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [451,1707],
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
