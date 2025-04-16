export default class CsvSource {
    constructor({ url, requestInit }: {
        url: any;
        requestInit: any;
    });
    url: any;
    requestInit: any;
    get data(): Promise<any>;
    _data: Promise<any> | undefined;
}
//# sourceMappingURL=CsvSource.d.ts.map