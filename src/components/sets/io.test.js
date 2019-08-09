/* eslint-disable no-tabs */
import expect from 'expect';
import SetsTree, { SetsTreeNode } from './sets';
import {
  handleImportTabular, handleImportJSON,
  handleExportTabular, handleExportJSON,
} from './io';

const correctProcessedJSON = [{
  key: 'another-selection', name: 'Another selection', color: [128, 128, 128], set: ['1972', '4047'],
}, {
  key: 'empty-selection', name: 'Empty selection', color: [128, 128, 128],
}, {
  key: 'neurons', name: 'Neurons', color: [128, 128, 128], set: ['3085'],
}, {
  key: 'neurons\tinhibitory', name: 'Inhibitory Neurons', color: [253, 191, 111], set: ['5699', '5824'],
}, {
  key: 'neurons\texcitatory', name: 'Excitatory Neurons', color: [255, 255, 153], set: ['1796', '4723', '4691'],
}, {
  key: 'other-selection', name: 'Other selection', color: [128, 128, 128], set: ['3324', '5480'],
}];

const tabularString = `"Item ID"	"Set Key"	"Set Name"	"Set Color"
"1972"	"another-selection"	"Another selection"	"#808080"
"4047"	"another-selection"	"Another selection"	"#808080"
"NA"	"empty-selection"	"Empty selection"	"#808080"
"3085"	"neurons"	"Neurons"	"#808080"
"5699"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#fdbf6f"
"5824"	"neurons	inhibitory"	"Neurons;Inhibitory Neurons"	"#fdbf6f"
"1796"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#ffff99"
"4723"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#ffff99"
"4691"	"neurons	excitatory"	"Neurons;Excitatory Neurons"	"#ffff99"
"3324"	"other-selection"	"Other selection"	"#808080"
"5480"	"other-selection"	"Other selection"	"#808080"`;

// eslint-disable-next-line quotes
const jsonString = `{"datasetId":"linnarsson-2018","setsType":"cell","version":"0.0.17","setsTree":[{"key":"another-selection","name":"Another selection","color":[128,128,128],"set":["1972","4047"]},{"key":"empty-selection","name":"Empty selection","color":[128,128,128]},{"key":"neurons","name":"Neurons","color":[128,128,128],"set":["3085"]},{"key":"neurons\\tinhibitory","name":"Inhibitory Neurons","color":[253,191,111],"set":["5699","5824"]},{"key":"neurons\\texcitatory","name":"Excitatory Neurons","color":[255,255,153],"set":["1796","4723","4691"]},{"key":"other-selection","name":"Other selection","color":[128,128,128],"set":["3324","5480"]}]}`;

// eslint-disable-next-line quotes
const correctExportedJSON = `data:text/json;charset=utf-8,%7B%22datasetId%22%3A%22linnarsson-2018%22%2C%22setsType%22%3A%22cell%22%2C%22version%22%3A%220.0.17%22%2C%22setsTree%22%3A%5B%7B%22key%22%3A%22other-selection%22%2C%22name%22%3A%22Other%20selection%22%2C%22color%22%3A%5B%223324%22%2C%225480%22%5D%7D%2C%7B%22key%22%3A%22neurons%22%2C%22name%22%3A%22Neurons%22%2C%22color%22%3A%5B128%2C128%2C128%5D%2C%22set%22%3A%5B%223085%22%5D%7D%2C%7B%22key%22%3A%22neurons%5Ctexcitatory%22%2C%22name%22%3A%22Excitatory%20Neurons%22%2C%22color%22%3A%5B255%2C255%2C153%5D%2C%22set%22%3A%5B%221796%22%2C%224723%22%2C%224691%22%5D%7D%2C%7B%22key%22%3A%22neurons%5Ctinhibitory%22%2C%22name%22%3A%22Inhibitory%20Neurons%22%2C%22color%22%3A%5B253%2C191%2C111%5D%2C%22set%22%3A%5B%225699%22%2C%225824%22%5D%7D%2C%7B%22key%22%3A%22empty-selection%22%2C%22name%22%3A%22Empty%20selection%22%2C%22color%22%3A%5B128%2C128%2C128%5D%7D%2C%7B%22key%22%3A%22another-selection%22%2C%22name%22%3A%22Another%20selection%22%2C%22color%22%3A%5B128%2C128%2C128%5D%2C%22set%22%3A%5B%221972%22%2C%224047%22%5D%7D%5D%7D`;

// eslint-disable-next-line quotes
const correctExportedTSV = `data:text/tsv;charset=utf-8,%22Item%20ID%22%09%22Set%20Key%22%09%22Set%20Name%22%09%22Set%20Color%22%0A%22NA%22%09%22other-selection%22%09%22Other%20selection%22%09%22%23000000%22%0A%223085%22%09%22neurons%22%09%22Neurons%22%09%22%23808080%22%0A%221796%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23ffff99%22%0A%224723%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23ffff99%22%0A%224691%22%09%22neurons%09excitatory%22%09%22Neurons%3BExcitatory%20Neurons%22%09%22%23ffff99%22%0A%225699%22%09%22neurons%09inhibitory%22%09%22Neurons%3BInhibitory%20Neurons%22%09%22%23fdbf6f%22%0A%225824%22%09%22neurons%09inhibitory%22%09%22Neurons%3BInhibitory%20Neurons%22%09%22%23fdbf6f%22%0A%22NA%22%09%22empty-selection%22%09%22Empty%20selection%22%09%22%23808080%22%0A%221972%22%09%22another-selection%22%09%22Another%20selection%22%09%22%23808080%22%0A%224047%22%09%22another-selection%22%09%22Another%20selection%22%09%22%23808080%22`;


describe('io.js', () => {
  describe('importing sets', () => {
    it('can import sets from a JSON file', (done) => {
      const setsTree = {
        import: (processedJSON) => {
          expect(processedJSON.length).toEqual(correctProcessedJSON.length);
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < 6; i++) {
            expect(processedJSON[i].key).toEqual(correctProcessedJSON[i].key);
            expect(processedJSON[i].name).toEqual(correctProcessedJSON[i].name);
            expect(processedJSON[i].color).toEqual(correctProcessedJSON[i].color);
            expect(processedJSON[i].set).toEqual(correctProcessedJSON[i].set);
          }
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
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < 6; i++) {
            expect(processedJSON[i].key).toEqual(correctProcessedJSON[i].key);
            expect(processedJSON[i].name).toEqual(correctProcessedJSON[i].name);
            expect(processedJSON[i].color).toEqual(correctProcessedJSON[i].color);
            if (correctProcessedJSON.set) {
              expect(processedJSON[i].set).toEqual(correctProcessedJSON[i].set);
            }
          }
          done();
        },
      };
      handleImportTabular({
        setsTree,
      }, tabularString);
    });
  });

  describe('exporting sets', () => {
    let factorsTree;
    beforeEach(() => {
      factorsTree = new SetsTree();
      factorsTree.appendChild(new SetsTreeNode({
        setKey: 'another-selection',
        name: 'Another selection',
        color: [128, 128, 128],
        set: ['1972', '4047'],
      }));
      factorsTree.appendChild(new SetsTreeNode({
        setKey: 'empty-selection',
        name: 'Empty selection',
        color: [128, 128, 128],
      }));
      factorsTree.appendChild(new SetsTreeNode({
        setKey: 'neurons',
        name: 'Neurons',
        color: [128, 128, 128],
        set: ['3085'],
        children: [
          new SetsTreeNode({
            setKey: 'inhibitory',
            name: 'Inhibitory Neurons',
            color: [253, 191, 111],
            set: ['5699', '5824'],
          }),
          new SetsTreeNode({
            setKey: 'excitatory',
            name: 'Excitatory Neurons',
            color: [255, 255, 153],
            set: ['1796', '4723', '4691'],
          }),
        ],
      }));
      factorsTree.appendChild(new SetsTreeNode({
        setKey: 'other-selection',
        name: 'Other selection',
        color: ['3324', '5480'],
      }));
    });
    it('can export sets to a JSON file', () => {
      const dataString = handleExportJSON({ setsTree: factorsTree, setsType: 'cell', datasetId: 'linnarsson-2018' });
      expect(dataString).toEqual(correctExportedJSON);
    });
    it('can export sets to a tabular file', () => {
      const dataString = handleExportTabular({ setsTree: factorsTree });
      expect(dataString).toEqual(correctExportedTSV);
    });
  });
});
