import expect from 'expect';
import {
  expandCellsJson,
} from './convenience-file-types';

describe('src/app/convenience-file-types.js', () => {
  describe('expandCellsJson', () => {
    it('expands when there are no options', () => {
      expect(expandCellsJson({
        fileType: 'cells.json',
        url: 'http://localhost:8000/cells.json',
      })).toEqual([
        {
          fileType: 'obsIndex.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsLocations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsSegmentations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
    it('expands when there is an array of embedding types', () => {
      expect(expandCellsJson({
        fileType: 'cells.json',
        url: 'http://localhost:8000/cells.json',
        options: {
          embeddingTypes: ['UMAP', 't-SNE'],
        },
      })).toEqual([
        {
          fileType: 'obsIndex.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsLocations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsSegmentations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsEmbedding.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 'UMAP',
          },
        },
        {
          fileType: 'obsEmbedding.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 't-SNE',
          },
        },
      ]);
    });
  });
});
