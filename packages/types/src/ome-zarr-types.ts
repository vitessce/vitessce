import type { ZarrPixelSource } from '@hms-dbmi/viv';

type Channel = {
  channelsVisible: boolean;
  color: string;
  label: string;
  window: {
    min?: number;
    max?: number;
    start: number;
    end: number;
  };
}

type Omero = {
  channels: Channel[];
  rdefs: {
    defaultT?: number;
    defaultZ?: number;
    model: string;
  };
  name?: string;
}

// See https://ngff.openmicroscopy.org/latest/#axes-md
type Axis = {
  name: string;
  type?: string;
  unit?: string;
}

type Multiscale = {
  datasets: { path: string }[];
  axes?: string[] | Axis[];
  version?: string;
  coordinateTransformations?: object[]; // TODO: stricter type
}

type SpatialDataTempAttrs = {
  channels_metadata?: {
    channels: { label: number }[];
  }
  'image-label'?: { version: string };
}

type RootAttrs = {
  omero: Omero;
  multiscales: Multiscale[];
} | SpatialDataTempAttrs;

export type LoadOmeZarrReturnValue<S extends string[]> = {
  data: ZarrPixelSource<S>[];
  metadata: RootAttrs;
};
