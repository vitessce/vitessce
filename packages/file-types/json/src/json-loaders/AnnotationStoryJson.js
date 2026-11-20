import { LoaderResult } from '@vitessce/abstract';
import { annotationStoryObj } from '@vitessce/schemas';
import JsonLoader from './JsonLoader.js';

export default class AnnotationStoryJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.schema = annotationStoryObj;
  }

  async load() {
    // JsonLoader.load returns the raw JSON (rather than a LoaderResult)
    // on subsequent calls, so cache the full result here.
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const payload = await super.load();
    const { data: annotationStory, url } = payload;
    // The story is provided as an initial coordination value.
    // It is only set when the coordination space value is null,
    // via initCoordinationSpace in the data hook.
    const coordinationValues = {
      annotationStory,
    };
    this.cachedResult = new LoaderResult({ annotationStory }, url, coordinationValues);
    return this.cachedResult;
  }
}
