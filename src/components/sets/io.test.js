import expect from 'expect';

import {
  handleImportJSON, handleExportJSON, handleImportTabular, handleExportTabular,
} from './io';

const tree = {
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
const treeAsJson = JSON.stringify(tree);
const expectedExportedJson = `data:application/json;charset=utf-8,${encodeURIComponent(treeAsJson)}`;

const treeAsCsv = `"group_name","set_name","set_color","cell_id"
"Clustering Algorithm","Cluster A","#ff0000","cell_243"
"Clustering Algorithm","Cluster A","#ff0000","cell_271"
"Clustering Algorithm","Cluster A","#ff0000","cell_247"
"Clustering Algorithm","Cluster A","#ff0000","cell_248"`;
const expectedExportedTabular = `data:text/csv;charset=utf-8,${encodeURIComponent(treeAsCsv)}`;

describe('io.js', () => {
  describe('importing sets', () => {
    it('can import cell sets from a JSON file', () => {
      const importedTree = handleImportJSON(treeAsJson, 'cell');
      expect(importedTree).toEqual(tree);
    });

    it('can import cell sets from a CSV file', () => {
      const importedTree = handleImportTabular(treeAsCsv, 'cell');
      expect(importedTree).toEqual(tree);
    });
  });

  describe('exporting sets', () => {
    it('can export sets to a JSON file', () => {
      const dataString = handleExportJSON(tree);
      expect(dataString).toEqual(expectedExportedJson);
    });

    it('can export sets to a CSV file', () => {
      const dataString = handleExportTabular(tree);
      expect(dataString).toEqual(expectedExportedTabular);
    });
  });
});
