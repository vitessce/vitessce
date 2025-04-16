/**
 * @template {any} LoaderDataType
 */
export default class LoaderResult<LoaderDataType extends unknown> {
    /**
     * @param {LoaderDataType} data
     * @param {object[]|string|null} url Single URL or array of { url, name } objects.
     * @param {object|null} coordinationValues
     * @param {RequestInit|null} requestInit
     */
    constructor(data: LoaderDataType, url: object[] | string | null, coordinationValues?: object | null, requestInit?: RequestInit | null);
    data: LoaderDataType;
    url: string | object[] | null;
    coordinationValues: object | null;
    requestInit: RequestInit | null;
}
//# sourceMappingURL=LoaderResult.d.ts.map