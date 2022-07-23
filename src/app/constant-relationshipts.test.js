import expect from 'expect';
import { FileType } from './constants';
import { FILE_TYPE_DATA_TYPE_MAPPING } from './constant-relationships';

describe('src/app/constant-relationships.js', () => {
  describe('FileType-to-DataType mappings', () => {
    it('every file type has a mapped data type', () => {
      const fileTypes = Object.values(FileType).sort();
      const mappedFileTypes = Object.keys(FILE_TYPE_DATA_TYPE_MAPPING).sort();
      expect(fileTypes.length).toEqual(mappedFileTypes.length);
      expect(fileTypes).toEqual(mappedFileTypes);
    });
  });
});
