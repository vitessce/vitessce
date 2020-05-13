/* eslint-disable */
/* eslint-disable no-tabs */
import expect from 'expect';
/*
import SetsTree, { SetsTreeNode } from './sets';
import {
  handleImportTabular, handleImportJSON,
  handleExportTabular, handleExportJSON,
} from './io';

import { version } from '../../../package.json';

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
  version,
  setsTree: correctProcessedJSON,
});

const jsonPrefix = 'data:text/json;charset=utf-8,';
const correctExportedJSON = jsonPrefix + encodeURIComponent(
  // Note the '//t' below: We want a literal '/t', so we escape the '/'.
  `{"datasetId":"linnarsson-2018","setsType":"cell","version":"${version}","setsTree":[{"key":"other-selection","name":"Other selection","color":[0,0,0],"set":["cell_9","cell_10"]},{"key":"neurons","name":"Neurons","color":[0,0,0],"set":["cell_3"]},{"key":"neurons\\texcitatory","name":"Excitatory Neurons","color":[1,1,1],"set":["cell_6","cell_7","cell_8"]},{"key":"neurons\\tinhibitory","name":"Inhibitory Neurons","color":[1,0,0],"set":["cell_4","cell_5"]},{"key":"empty-selection","name":"Empty selection","color":[0,0,0]}]}`,
);
const correctExportedEmptyJSON = jsonPrefix + encodeURIComponent(
  `{"datasetId":"linnarsson-2018","setsType":"cell","version":"${version}","setsTree":[]}`,
);

const tsvPrefix = 'data:text/tsv;charset=utf-8,';
const correctExportedTSV = tsvPrefix + encodeURIComponent(
  `"Item ID"	"Set Key"	"Set Name"	"Set Color"
"cell_9"	"other-selection"	"Other selection"	"#000000"
"cell_10"	"other-selection"	"Other selection"	"#000000"
"cell_3"	"neurons"	"Neurons"	"#000000"
"cell_6"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#010101"
"cell_7"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#010101"
"cell_8"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#010101"
"cell_4"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#010000"
"cell_5"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#010000"
"NA"	"empty-selection"	"Empty selection"	"#000000"`,
);
const correctExportedEmptyTSV = tsvPrefix + encodeURIComponent(
  '"Item ID"	"Set Key"	"Set Name"	"Set Color"',
);

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
*/
