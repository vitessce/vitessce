export function guessTileSize(arr: any): number;
export function loadOmeZarr(root: any): Promise<{
    data: ZarritaPixelSource[];
    metadata: import("zarrita").Attributes;
}>;
export class ZarritaPixelSource extends viv.ZarrPixelSource<any> {
    constructor(arr: any, labels: any, tileSize: any);
    _readChunks: boolean;
}
import { viv } from '@vitessce/gl';
//# sourceMappingURL=load-ome-zarr.d.ts.map