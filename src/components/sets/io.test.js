import expect from 'expect';

import {
  handleImportJSON, handleExportJSON,
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
const expectedExportedJson = `data:text/json;charset=utf-8,${encodeURIComponent(
  '{"version":"0.1.2","datatype":"cell","tree":[{"name":"Clustering Algorithm","children":[{"name":"Cluster A","color":[255,0,0],"set":["cell_243","cell_271","cell_247","cell_248"]}]}]}',
)}`;

describe('io.js', () => {
  describe('importing sets', () => {
    it('can import cell sets from a JSON file', () => {
      const importedTree = handleImportJSON(treeAsJson, 'cell');
      expect(importedTree).toEqual(tree);
    });
  });

  describe('exporting sets', () => {
    it('can export sets to a JSON file', () => {
      const dataString = handleExportJSON(tree);
      expect(dataString).toEqual(expectedExportedJson);
    });
  });
});
