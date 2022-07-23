import expect from 'expect';
import { FileType } from '../app/constants';
import { fileTypeToLoaderAndSource } from './types';

describe('src/loaders/types.js', () => {
  describe('Loaders mappings', () => {
    it('every file type has a loader', () => {
      const fileTypes = Object.values(FileType).sort();
      const loaderFileTypes = Object.keys(fileTypeToLoaderAndSource).sort();
      expect(fileTypes.length).toEqual(loaderFileTypes.length);
      expect(fileTypes).toEqual(loaderFileTypes);
    });
  });
});
