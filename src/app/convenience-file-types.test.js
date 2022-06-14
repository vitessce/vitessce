import expect from 'expect';
import {
  expandGenesJson,
} from './convenience-file-types';

describe('src/app/convenience-file-types.js', () => {
  describe('expandGenesJson', () => {
    it('expands', () => {
      expect(expandGenesJson({
        fileType: 'genes.json',
        url: 'http://localhost:8000/genes.json',
      })).toEqual([
        {
          fileType: 'obsFeatureMatrix.genes.json',
          url: 'http://localhost:8000/genes.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
  });
});
