import expect from 'expect';

import {
  handleImportJSON, handleExportJSON, handleImportTabular, handleExportTabular,
} from './io';

const treeV012 = {
  version: '0.1.2',
  datatype: 'cell',
  tree: [
    {
      name: 'Clustering Algorithm',
      children: [
        {
          name: 'Cluster A',
          color: [255, 0, 0],
          set: ['cell_243', 'cell_271', 'cell_247', 'cell_248'],
        },
      ],
    },
  ],
};
const treeV013 = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [
    {
      name: 'Clustering Algorithm',
      children: [
        {
          name: 'Cluster A',
          color: [255, 0, 0],
          set: [
            ['cell_243', null],
            ['cell_271', null],
            ['cell_247', null],
            ['cell_248', null],
          ],
        },
      ],
    },
  ],
};

const treeV013WithPredictionScores = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [
    {
      name: 'Clustering Algorithm',
      children: [
        {
          name: 'Cluster A',
          color: [255, 0, 0],
          set: [
            ['cell_243', 0.5],
            ['cell_271', 0.6],
            ['cell_247', 0.12345],
            ['cell_248', 0],
          ],
        },
      ],
    },
  ],
};
const treeV012AsJson = JSON.stringify(treeV012);
const treeV013AsJson = JSON.stringify(treeV013);
const treeV013WithPredictionScoresAsJson = JSON.stringify(treeV013WithPredictionScores);

const expectedExportedJson = `data:application/json;charset=utf-8,${encodeURIComponent(treeV013AsJson)}`;
const expectedExportedJsonWithPredictionScores = `data:application/json;charset=utf-8,${encodeURIComponent(treeV013WithPredictionScoresAsJson)}`;

const treeV012AsCsv = `"groupName","setName","setColor","obsId"
"Clustering Algorithm","Cluster A","#ff0000","cell_243"
"Clustering Algorithm","Cluster A","#ff0000","cell_271"
"Clustering Algorithm","Cluster A","#ff0000","cell_247"
"Clustering Algorithm","Cluster A","#ff0000","cell_248"`;

const treeV013AsCsv = `"groupName","setName","setColor","obsId","predictionScore"
"Clustering Algorithm","Cluster A","#ff0000","cell_243","NA"
"Clustering Algorithm","Cluster A","#ff0000","cell_271","NA"
"Clustering Algorithm","Cluster A","#ff0000","cell_247","NA"
"Clustering Algorithm","Cluster A","#ff0000","cell_248","NA"`;
const expectedExportedTabular = `data:text/csv;charset=utf-8,${encodeURIComponent(treeV013AsCsv)}`;

const treeV013WithPredictionScoresAsCsv = `"groupName","setName","setColor","obsId","predictionScore"
"Clustering Algorithm","Cluster A","#ff0000","cell_243",0.5
"Clustering Algorithm","Cluster A","#ff0000","cell_271",0.6
"Clustering Algorithm","Cluster A","#ff0000","cell_247",0.12345
"Clustering Algorithm","Cluster A","#ff0000","cell_248",0`;
const expectedExportedTabularWithPredictionScores = `data:text/csv;charset=utf-8,${encodeURIComponent(treeV013WithPredictionScoresAsCsv)}`;

describe('io.js', () => {
  describe('importing sets', () => {
    it('can import cell sets from a JSON file v0.1.2', () => {
      const importedTree = handleImportJSON(treeV012AsJson, 'cell');
      expect(importedTree).toEqual(treeV013);
    });

    it('can import cell sets from a JSON file v0.1.3', () => {
      const importedTree = handleImportJSON(treeV013AsJson, 'cell');
      expect(importedTree).toEqual(treeV013);
    });

    it('can import cell sets from a JSON file v0.1.3 with prediction scores', () => {
      const importedTree = handleImportJSON(treeV013WithPredictionScoresAsJson, 'cell');
      expect(importedTree).toEqual(treeV013WithPredictionScores);
    });

    it('can import cell sets from a CSV file v0.1.2', () => {
      const importedTree = handleImportTabular(treeV012AsCsv, 'cell');
      expect(importedTree).toEqual(treeV013);
    });

    it('can import cell sets from a CSV file v0.1.3', () => {
      const importedTree = handleImportTabular(treeV013AsCsv, 'cell');
      expect(importedTree).toEqual(treeV013);
    });

    it('can import cell sets from a CSV file v0.1.3 with prediction scores', () => {
      const importedTree = handleImportTabular(treeV013WithPredictionScoresAsCsv, 'cell');
      expect(importedTree).toEqual(treeV013WithPredictionScores);
    });
  });

  describe('exporting sets', () => {
    it('can export sets to a JSON file v0.1.3', () => {
      const dataString = handleExportJSON(treeV013);
      expect(dataString).toEqual(expectedExportedJson);
    });

    it('can export sets to a JSON file v0.1.3 with prediction scores', () => {
      const dataString = handleExportJSON(treeV013WithPredictionScores);
      expect(dataString).toEqual(expectedExportedJsonWithPredictionScores);
    });

    it('can export sets to a CSV file v0.1.3', () => {
      const dataString = handleExportTabular(treeV013);
      expect(dataString).toEqual(expectedExportedTabular);
    });

    it('can export sets to a CSV file v0.1.3 with prediction scores', () => {
      const dataString = handleExportTabular(treeV013WithPredictionScores);
      expect(dataString).toEqual(expectedExportedTabularWithPredictionScores);
    });
  });
});
