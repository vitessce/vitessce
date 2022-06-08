/* eslint-disable camelcase */
import expect from 'expect';
import { FileType } from '../app/constants';
import { CONVENIENCE_FILE_TYPES } from '../app/convenience-file-types';
import { fileTypeToLoaderAndSource } from './types';

describe('src/loaders/types.js', () => {
  describe('Loaders mappings', () => {
    it('every built-in file type either has a loader or is a convenience file type', () => {
      const fileTypes = Object.values(FileType).sort();
      const loaderFileTypes = Object.keys(fileTypeToLoaderAndSource);
      const convenienceFileTypes = Object.keys(CONVENIENCE_FILE_TYPES);
      const mappedFileTypes = loaderFileTypes.concat(convenienceFileTypes).sort();
      expect(fileTypes.length).toEqual(mappedFileTypes.length);
      expect(fileTypes).toEqual(mappedFileTypes);
    });
  });
});
