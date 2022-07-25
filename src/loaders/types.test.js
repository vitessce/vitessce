import expect from 'expect';
import { FILE_TYPE_DATA_TYPE_MAPPING } from '../app/constant-relationships';
import { fileTypeToLoaderAndSource } from './types';

describe('src/loaders/types.js', () => {
  describe('Loaders mappings', () => {
    it('every atomic file type has a loader', () => {
      const atomicFileTypes = Object.keys(FILE_TYPE_DATA_TYPE_MAPPING).sort();
      const loaderFileTypes = Object.keys(fileTypeToLoaderAndSource).sort();
      expect(atomicFileTypes).toEqual(loaderFileTypes);
      expect(atomicFileTypes.length).toEqual(loaderFileTypes.length);
    });
  });
});
