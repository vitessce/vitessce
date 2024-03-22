import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three Lightsheet',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/Sample7_5x_ometiff.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBkaCXVzLWVhc3QtMSJHMEUCIQDVps29ALXp04O1FsuWOtAs5mW%2BHNI1lxl0PXuYa%2B9scwIgN12F2Tnb%2FYGYP0DAFvw0lFCbBys6ZEr7sWBuoBRBu10q7AMIMRABGgwxMzY1NzY1MjIwNDgiDDknfgAuutfAbUezWSrJA9ts6xJC2xCxns9HWRqyNbbxO8yAiBzk%2FEfqEbGsx9hv3B%2FkVzzofpAvBYf6sHD9lPKfVzJywjvQaznSqOXADzHBf1dDmbXdWw2UbIL0g5%2B7RbMF33VN%2F%2Fz7vG8kBgyoJOPgPuekNd7bCRY6fUX7eH9s2h9SaG9xrLfITLkMGJAl6HQfTX9Ink4hVFFyn7e0nvTa3eUAyOwsRhZdfPL63CQhyYu1BEhvI0Kyj5deq6nqkIzFb2lpZej%2B3itUBuB1uvfaZ5IOZMacmG2EGzqI0ZIrAcIf7vX351ruZXeB%2F4ZdNsLiR1uIhiUPPDNBsKiZJByyBqQP5Z1W%2F6y2Nghkqy9KRWWVpFGXq5F7iasF3j9GygYDiDVwE%2B7PwIPVs81khOHInRnjDmjP7L9kMGlgo4YusZGzcTcxpJlFWQ16AmsQ2sj6rtqxhLNMA4YbkjmDHNDoTOnLC8XgZmQUTh17a5LUMgUi7Y3og9FpvFSEUZA5jxvRhUuLBBrTKTreLerUqIyMnydzh8qWtpqscPOO3xErDuiUbOBvEX8khqZRZOAC4RRAGJVa31Y6ZdWZ9JhjNZ02%2FujbR9%2F18zifhxlyY8UTkXXOR1KiFD4w9bXxrwY6lALWvQ%2BGs%2BySMo7kyjEA%2FgnugZGSw4Tn%2FKGfx5L9zHb5xBMWecq7%2FRp0cNcvsIQn0WShefopwnxNILYLgWjIukWAa4lnbRN6w%2BvFH7hDeVoYjmsXB0PEo8BHwaqv3COkdB6Q3x%2BqxBmDarrYwDaUn0GbCbmoExtuk6H8K6QwBi7FS2hFpfEmg89cAyee%2BQeu0wiSM9wNdB6iJzxfUyOB7qtC%2FyUOKXoDshDu69lHdyQSSRe2qbdoM6CV1vLQi0GIgaBh2ne%2B5IuZBIG1h%2Fx25I%2B%2Fkvl%2FtJ25ef7TIVGu4QwE%2BA5uSiVUxdlSknmcYLJc0a2BOAWULTv%2BRKb6i6Hx06eWk%2B5gUAxDDcbwFkDSU0%2BhCIUhul8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240322T003722Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGWLQ2M6O%2F20240322%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9100024e6322170d0dcb64ab5d5db3f33052b55d0648d2eadb89278adfd63cb4",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/Sample7_5x_ometiff.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBkaCXVzLWVhc3QtMSJHMEUCIQDVps29ALXp04O1FsuWOtAs5mW%2BHNI1lxl0PXuYa%2B9scwIgN12F2Tnb%2FYGYP0DAFvw0lFCbBys6ZEr7sWBuoBRBu10q7AMIMRABGgwxMzY1NzY1MjIwNDgiDDknfgAuutfAbUezWSrJA9ts6xJC2xCxns9HWRqyNbbxO8yAiBzk%2FEfqEbGsx9hv3B%2FkVzzofpAvBYf6sHD9lPKfVzJywjvQaznSqOXADzHBf1dDmbXdWw2UbIL0g5%2B7RbMF33VN%2F%2Fz7vG8kBgyoJOPgPuekNd7bCRY6fUX7eH9s2h9SaG9xrLfITLkMGJAl6HQfTX9Ink4hVFFyn7e0nvTa3eUAyOwsRhZdfPL63CQhyYu1BEhvI0Kyj5deq6nqkIzFb2lpZej%2B3itUBuB1uvfaZ5IOZMacmG2EGzqI0ZIrAcIf7vX351ruZXeB%2F4ZdNsLiR1uIhiUPPDNBsKiZJByyBqQP5Z1W%2F6y2Nghkqy9KRWWVpFGXq5F7iasF3j9GygYDiDVwE%2B7PwIPVs81khOHInRnjDmjP7L9kMGlgo4YusZGzcTcxpJlFWQ16AmsQ2sj6rtqxhLNMA4YbkjmDHNDoTOnLC8XgZmQUTh17a5LUMgUi7Y3og9FpvFSEUZA5jxvRhUuLBBrTKTreLerUqIyMnydzh8qWtpqscPOO3xErDuiUbOBvEX8khqZRZOAC4RRAGJVa31Y6ZdWZ9JhjNZ02%2FujbR9%2F18zifhxlyY8UTkXXOR1KiFD4w9bXxrwY6lALWvQ%2BGs%2BySMo7kyjEA%2FgnugZGSw4Tn%2FKGfx5L9zHb5xBMWecq7%2FRp0cNcvsIQn0WShefopwnxNILYLgWjIukWAa4lnbRN6w%2BvFH7hDeVoYjmsXB0PEo8BHwaqv3COkdB6Q3x%2BqxBmDarrYwDaUn0GbCbmoExtuk6H8K6QwBi7FS2hFpfEmg89cAyee%2BQeu0wiSM9wNdB6iJzxfUyOB7qtC%2FyUOKXoDshDu69lHdyQSSRe2qbdoM6CV1vLQi0GIgaBh2ne%2B5IuZBIG1h%2Fx25I%2B%2Fkvl%2FtJ25ef7TIVGu4QwE%2BA5uSiVUxdlSknmcYLJc0a2BOAWULTv%2BRKb6i6Hx06eWk%2B5gUAxDDcbwFkDSU0%2BhCIUhul8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240322T003817Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGWLQ2M6O%2F20240322%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c81025f87d5ec1fd2f2fe818c19237bec1fcb0c828950e9f98b4decda9c73c42",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    });

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [255, 255, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    }
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const threeMinimalLight = generateThreeMinimalConfiguration();
