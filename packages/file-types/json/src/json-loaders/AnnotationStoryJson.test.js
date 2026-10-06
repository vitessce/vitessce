import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import { JsonLoaderValidationError } from '@vitessce/error';
import AnnotationStoryJsonLoader from './AnnotationStoryJson.js';

const storyFixture = {
  uid: 'story-1',
  title: 'My story',
  frames: [],
};

function createLoader(data) {
  const dataSource = { loadJson: async () => data };
  return new AnnotationStoryJsonLoader(dataSource, {
    fileType: 'annotationStory.json',
    url: 'http://example.com/story.json',
  });
}

describe('loaders/json-loaders/AnnotationStoryJson', () => {
  it('loads the story as data and as a coordination value', async () => {
    const loader = createLoader(storyFixture);
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    expect(result.data).toEqual({ annotationStory: storyFixture });
    expect(result.coordinationValues).toEqual({ annotationStory: storyFixture });
    expect(result.url).toEqual('http://example.com/story.json');
  });

  it('returns the same result when loaded more than once', async () => {
    const loader = createLoader(storyFixture);
    const firstResult = await loader.load();
    const secondResult = await loader.load();
    expect(secondResult).toBe(firstResult);
  });

  it('throws when the JSON does not match the annotationStory schema', async () => {
    const loader = createLoader({ title: 'Missing uid and frames' });
    await expect(loader.load()).rejects.toThrow(JsonLoaderValidationError);
  });
});
