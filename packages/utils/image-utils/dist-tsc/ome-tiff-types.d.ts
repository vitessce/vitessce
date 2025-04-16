import type { TiffPixelSource } from '@hms-dbmi/viv';
type DimensionOrder = 'XYZCT' | 'XYZTC' | 'XYCTZ' | 'XYCZT' | 'XYTCZ' | 'XYTZC';
type PixelType = 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float' | 'bit' | 'double' | 'complex' | 'double-complex';
type UnitsLength = 'Ym' | 'Zm' | 'Em' | 'Pm' | 'Tm' | 'Gm' | 'Mm' | 'km' | 'hm' | 'dam' | 'm' | 'dm' | 'cm' | 'mm' | 'µm' | 'nm' | 'pm' | 'fm' | 'am' | 'zm' | 'ym' | 'Å' | 'thou' | 'li' | 'in' | 'ft' | 'yd' | 'mi' | 'ua' | 'ly' | 'pc' | 'pt' | 'pixel' | 'reference frame';
type Channel = {
    ID: string;
    SamplesPerPixel: number;
    Name?: string;
    Color?: number[];
};
type Pixels = {
    Channels: Channel[];
    TiffData: {
        IFD: string;
        PlaneCount: number;
    };
    PhysicalSizeX: number;
    PhysicalSizeXUnit: UnitsLength;
    PhysicalSizeY: number;
    PhysicalSizeYUnit: UnitsLength;
    PhysicalSizeZ: number;
    PhysicalSizeZUnit: UnitsLength;
    SizeT: number;
    SizeC: number;
    SizeZ: number;
    SizeY: number;
    SizeX: number;
    SignificantBits: number;
    BigEndian: boolean;
    Interleaved: boolean;
    ID: string;
    DimensionOrder: DimensionOrder;
    Type: PixelType;
};
type Image = {
    ID: string;
    Name: string;
    AquisitionDate?: string;
    Description?: string;
    Pixels: Pixels;
    InstrumentRef: {
        ID: string;
    };
    ObjectiveSettings: {
        ID: string;
    };
};
export type LoadOmeTiffReturnValue<S extends string[]> = {
    data: TiffPixelSource<S>[];
    metadata: Image;
};
export {};
//# sourceMappingURL=ome-tiff-types.d.ts.map