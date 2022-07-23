import expect from 'expect';
import { FileType } from './constants';
import { FILE_TYPE_DATA_TYPE_MAPPING } from './constant-relationships';
import { JOINT_FILE_TYPES } from './joint-file-types';

describe('src/app/constant-relationships.js', () => {
  describe('FileType-to-DataType mappings', () => {
    it('every file type is mapped to either a data type or a joint file type expansion function', () => {
      const fileTypes = Object.values(FileType).sort();
      const mappedFileTypes = [
        ...Object.keys(FILE_TYPE_DATA_TYPE_MAPPING),
        ...Object.keys(JOINT_FILE_TYPES),
      ].sort();
      expect(fileTypes.length).toEqual(mappedFileTypes.length);
      expect(fileTypes).toEqual(mappedFileTypes);
    });
  });
});
