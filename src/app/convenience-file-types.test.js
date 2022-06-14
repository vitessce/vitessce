import expect from 'expect';
import {
  expandClustersJson,
} from './convenience-file-types';

describe('src/app/convenience-file-types.js', () => {
  describe('expandClustersJson', () => {
    it('expands clusters.json', () => {
      expect(expandClustersJson({
        fileType: 'clusters.json',
        url: 'http://localhost:8000/clusters.json',
      })).toEqual([
        {
          fileType: 'obsFeatureMatrix.clusters.json',
          url: 'http://localhost:8000/clusters.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
  });
});
