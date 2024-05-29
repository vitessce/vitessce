import type { Readable } from '@zarrita/storage';

export type DataSourceParams = {
  url?: string;
  /** Options to pass to fetch calls. */
  requestInit?: RequestInit;
  /** A Zarrita store object. */
  store?: Readable;
  /** The file type. */
  fileType: string;
}
