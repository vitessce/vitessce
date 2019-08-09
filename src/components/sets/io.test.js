/* eslint-disable no-tabs */
import expect from 'expect';
import SetsTree, { SetsTreeNode } from './sets';
import {
  handleImportTabular, handleImportJSON,
  handleExportTabular, handleExportJSON,
} from './io';

const tree = new SetsTree();
tree.appendChild(new SetsTreeNode({
  setKey: 'empty-selection',
  name: 'Empty selection',
  color: [0, 0, 0],
}));
tree.appendChild(new SetsTreeNode({
  setKey: 'neurons',
  name: 'Neurons',
  color: [0, 0, 0],
  set: ['cell_3'],
  children: [
    new SetsTreeNode({
      setKey: 'inhibitory',
      name: 'Inhibitory Neurons',
      color: [1, 0, 0],
      set: ['cell_4', 'cell_5'],
    }),
    new SetsTreeNode({
      setKey: 'excitatory',
      name: 'Excitatory Neurons',
      color: [1, 1, 1],
      set: ['cell_6', 'cell_7', 'cell_8'],
    }),
  ],
}));
tree.appendChild(new SetsTreeNode({
  setKey: 'other-selection',
  name: 'Other selection',
  color: [0, 0, 0],
  set: ['cell_9', 'cell_10'],
}));

const correctProcessedJSON = [{
  key: 'empty-selection', name: 'Empty selection', color: [0, 0, 0],
}, {
  key: 'neurons', name: 'Neurons', color: [0, 0, 0], set: ['cell_3'],
}, {
  key: 'neurons\tinhibitory', name: 'Inhibitory Neurons', color: [1, 0, 0], set: ['cell_4', 'cell_5'],
}, {
  key: 'neurons\texcitatory', name: 'Excitatory Neurons', color: [1, 1, 1], set: ['cell_6'],
}, {
  key: 'other-selection', name: 'Other selection', color: [0, 0, 0], set: ['cell_9', 'cell_10'],
}];

const tabularString = `"Item ID"	"Set Key"	"Set Name"	"Set Color"
"NA"	"empty-selection"	"Empty selection"	"#000000"
"cell_3"	"neurons"	"Neurons"	"#000000"
"cell_4"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#010000"
"cell_5"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#010000"
"cell_6"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#010101"
"cell_9"	"other-selection"	"Other selection"	"#000000"
"cell_10"	"other-selection"	"Other selection"	"#000000"`;

const jsonString = JSON.stringify({
  datasetId: 'linnarsson-2018',
  setsType: 'cell',
  version: '0.0.17',
  setsTree: correctProcessedJSON,
});

const correctExportedJSON = 'data:text/json;charset=utf-8,%7B%22datasetId%22%3A%22linnarsson-2018%22%2C%22setsType%22%3A%22cell%22%2C%22version%22%3A%220.0.17%22%2C%22setsTree%22%3A%5B%7B%22key%22%3A%22other-selection%22%2C%22name%22%3A%22Other%20selection%22%2C%22color%22%3A%5B0%2C0%2C0%5D%2C%22set%22%3A%5B%22cell_9%22%2C%22cell_10%22%5D%7D%2C%7B%22key%22%3A%22neurons%22%2C%22name%22%3A%22Neurons%22%2C%22color%22%3A%5B0%2C0%2C0%5D%2C%22set%22%3A%5B%22cell_3%22%5D%7D%2C%7B%22key%22%3A%22neurons%5Ctexcitatory%22%2C%22name%22%3A%22Excitatory%20Neurons%22%2C%22color%22%3A%5B1%2C1%2C1%5D%2C%22set%22%3A%5B%22cell_6%22%2C%22cell_7%22%2C%22cell_8%22%5D%7D%2C%7B%22key%22%3A%22neurons%5Ctinhibitory%22%2C%22name%22%3A%22Inhibitory%20Neurons%22%2C%22color%22%3A%5B1%2C0%2C0%5D%2C%22set%22%3A%5B%22cell_4%22%2C%22cell_5%22%5D%7D%2C%7B%22key%22%3A%22empty-selection%22%2C%22name%22%3A%22Empty%20selection%22%2C%22color%22%3A%5B0%2C0%2C0%5D%7D%5D%7D';

const correctExportedEmptyJSON = 'data:text/json;charset=utf-8,%7B%22datasetId%22%3A%22linnarsson-2018%22%2C%22setsType%22%3A%22cell%22%2C%22version%22%3A%220.0.17%22%2C%22setsTree%22%3A%5B%5D%7D';

const correctExportedTSV = 'data:text/tsv;charset=utf-8,%22Item%20ID%22%09%22Set%20Key%22%09%22Set%20Name%22%09%22Set%20Color%22%0A%22cell_9%22%09%22other-selection%22%09%22Other%20selection%22%09%22%23000000%22%0A%22cell_10%22%09%22other-selection%22%09%22Other%20selection%22%09%22%23000000%22%0A%22cell_3%22%09%22neurons%22%09%22Neurons%22%09%22%23000000%22%0A%22cell_6%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23010101%22%0A%22cell_7%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23010101%22%0A%22cell_8%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23010101%22%0A%22cell_4%22%09%22neurons%09inhibitory%22%09%22Neurons%3BInhibitory%20Neurons%22%09%22%23010000%22%0A%22cell_5%22%09%22neurons%09inhibitory%22%09%22Neurons%3BInhibitory%20Neurons%22%09%22%23010000%22%0A%22NA%22%09%22empty-selection%22%09%22Empty%20selection%22%09%22%23000000%22';

const correctExportedEmptyTSV = 'data:text/tsv;charset=utf-8,%22Item%20ID%22%09%22Set%20Key%22%09%22Set%20Name%22%09%22Set%20Color%22';

describe('io.js', () => {
  describe('importing sets', () => {
    it('can import sets from a JSON file', (done) => {
      const setsTree = {
        import: (processedJSON) => {
          expect(processedJSON.length).toEqual(correctProcessedJSON.length);
          expect(processedJSON).toEqual(correctProcessedJSON);
          done();
        },
      };
      handleImportJSON({
        datasetId: 'linnarsson-2018', setsType: 'cell', onError: () => {}, setsTree,
      }, jsonString);
    });

    it('can import sets from a TSV file', (done) => {
      const setsTree = {
        import: (processedJSON) => {
          expect(processedJSON.length).toEqual(correctProcessedJSON.length);
          expect(processedJSON).toEqual(correctProcessedJSON);
          done();
        },
      };
      handleImportTabular({
        setsTree,
      }, tabularString);
    });
  });

  describe('exporting sets', () => {
    it('can export sets to a JSON file', () => {
      const dataString = handleExportJSON({ setsTree: tree, setsType: 'cell', datasetId: 'linnarsson-2018' });
      expect(dataString).toEqual(correctExportedJSON);
    });
    it('can export sets to a tabular file', () => {
      const dataString = handleExportTabular({ setsTree: tree });
      expect(dataString).toEqual(correctExportedTSV);
    });
    it('can export to a JSON file when no sets are available', () => {
      const dataString = handleExportJSON({ setsTree: new SetsTree(), setsType: 'cell', datasetId: 'linnarsson-2018' });
      expect(dataString).toEqual(correctExportedEmptyJSON);
    });
    it('can export to a tabular file when no sets are available', () => {
      const dataString = handleExportTabular({ setsTree: new SetsTree() });
      expect(dataString).toEqual(correctExportedEmptyTSV);
    });
  });
});
