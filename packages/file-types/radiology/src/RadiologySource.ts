/**
 * Radiology loaders fetch their own data, so the source only holds the URL.
 */
export class RadiologySource {
  url?: string;

  requestInit?: RequestInit;

  constructor({ url, requestInit }: { url?: string; requestInit?: RequestInit }) {
    this.url = url;
    this.requestInit = requestInit;
  }
}
