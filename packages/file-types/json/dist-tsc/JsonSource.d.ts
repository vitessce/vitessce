export default class JsonSource {
    constructor({ url, requestInit }: {
        url: any;
        requestInit: any;
    });
    url: any;
    requestInit: any;
    get data(): Promise<any>;
    _data: Promise<any> | undefined;
}
//# sourceMappingURL=JsonSource.d.ts.map