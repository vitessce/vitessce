import { describe, it, expect } from 'vitest';
import {
  generateComparativeConfig,
  getSelectedModality,
  withSelectedModality,
  getBiomarkerSelection,
  withBiomarkerSelection,
  mergeBiomarkerSelectConfig,
} from './ComparativeConfig.jsx';

const singleCellDatasetUrl = 'https://example.com/sc.adata.zarr';
const singleNucleusDatasetUrl = 'https://example.com/sn.adata.zarr';

function getScatterplot(config) {
  return config.layout.find(v => v.uid === 'scatterplot');
}

describe('generateComparativeConfig', () => {
  it('defines one dataset per provided modality', () => {
    const both = generateComparativeConfig({ singleCellDatasetUrl, singleNucleusDatasetUrl }, false);
    expect(both.datasets.map(d => d.uid)).toEqual(['sc', 'sn']);
    expect(both.datasets[1].files.every(f => f.url.startsWith(singleNucleusDatasetUrl))).toBe(true);
    expect(getSelectedModality(both)).toEqual('sc');

    const snOnly = generateComparativeConfig({ singleNucleusDatasetUrl }, true);
    expect(snOnly.datasets.map(d => d.uid)).toEqual(['sn']);
    expect(getSelectedModality(snOnly)).toEqual('sn');
  });

  it('throws when no dataset URL is provided', () => {
    expect(() => generateComparativeConfig({}, false)).toThrow();
  });

  it('links every view to the shared dataset scope', () => {
    const config = generateComparativeConfig({ singleCellDatasetUrl, singleNucleusDatasetUrl }, false, 'sn');
    expect(getSelectedModality(config)).toEqual('sn');
    expect(config.layout.every(v => v.coordinationScopes.dataset === '__comparison__')).toBe(true);
    expect(getScatterplot(config).props.circleScaleFactor).toEqual(0.5);
  });
});

describe('withSelectedModality', () => {
  const config = generateComparativeConfig({ singleCellDatasetUrl, singleNucleusDatasetUrl }, false);

  it('switches the selected dataset and modality-specific view props', () => {
    const newConfig = withSelectedModality(config, 'sn');
    expect(getSelectedModality(newConfig)).toEqual('sn');
    expect(getScatterplot(newConfig).props.circleScaleFactor).toEqual(0.5);
    expect(getScatterplot(config).props.circleScaleFactor).toEqual(0.8);
  });

  it('resets obsSetSelection to null upon a change of modality', () => {
    const withSelection = {
      ...config,
      coordinationSpace: {
        ...config.coordinationSpace,
        obsSetSelection: {
          __multi__: [['Subclass L1', 'POD'], ['Subclass L1', 'PT']],
          __single__: [['Subclass L1', 'POD']],
        },
      },
    };
    const newConfig = withSelectedModality(withSelection, 'sn');
    expect(newConfig.coordinationSpace.obsSetSelection).toEqual({
      __multi__: null,
      __single__: null,
    });
    // Selecting the already-selected modality does not reset obsSetSelection.
    expect(withSelectedModality(withSelection, 'sc')).toBe(withSelection);
  });

  it('ignores modalities that are not in the config', () => {
    const scOnly = generateComparativeConfig({ singleCellDatasetUrl }, false);
    expect(withSelectedModality(scOnly, 'sn')).toBe(scOnly);
    expect(withSelectedModality(config, 'sc')).toBe(config);
  });
});

describe('withBiomarkerSelection', () => {
  const config = generateComparativeConfig({ singleCellDatasetUrl }, true);

  it('sets the biomarkerSelection prop of the biomarkerSelectAlt view', () => {
    expect(getBiomarkerSelection(config)).toBeNull();
    const pathway = { label: 'Cell Cycle R-HSA-1640170', nodeType: 'pathway' };
    const newConfig = withBiomarkerSelection(config, pathway);
    expect(getBiomarkerSelection(newConfig)).toEqual(pathway);
    expect(withBiomarkerSelection(newConfig, { ...pathway })).toBe(newConfig);
    expect(getBiomarkerSelection(withBiomarkerSelection(newConfig, null))).toBeNull();
  });
});

describe('mergeBiomarkerSelectConfig', () => {
  const initialConfig = generateComparativeConfig({ singleCellDatasetUrl, singleNucleusDatasetUrl }, true);
  // After initialization by Vitessce, the config contains a uid.
  const currentConfig = withBiomarkerSelection({
    ...initialConfig,
    uid: 'A',
    coordinationSpace: {
      ...initialConfig.coordinationSpace,
      featureSelection: { __comparison__: ['GPRIN3'] },
      sampleSetSelection: { __comparison__: null },
    },
  }, { label: 'GPRIN3', nodeType: 'gene' });
  const params = {
    currentConfig,
    initialConfig,
    geneSelection: ['GPRIN3'],
    sampleSetSelection: null,
    biomarkerSelection: { label: 'GPRIN3', nodeType: 'gene' },
    selectedModality: 'sc',
    createUid: () => 'B',
  };

  it('returns the current config when it already reflects the outside selections', () => {
    expect(mergeBiomarkerSelectConfig(params)).toBe(currentConfig);
  });

  it('assigns a new uid when a selection changes outside (e.g., from ControlledComparative)', () => {
    const merged = mergeBiomarkerSelectConfig({
      ...params,
      geneSelection: ['AKR1B1'],
      biomarkerSelection: { label: 'AKR1B1', nodeType: 'gene' },
    });
    expect(merged.uid).toEqual('B');
    expect(getBiomarkerSelection(merged)).toEqual({ label: 'AKR1B1', nodeType: 'gene' });
    expect(merged.coordinationSpace.featureSelection.__comparison__).toEqual(['AKR1B1']);
  });

  it('assigns a new uid upon a change of modality', () => {
    const merged = mergeBiomarkerSelectConfig({ ...params, selectedModality: 'sn' });
    expect(merged.uid).toEqual('B');
    expect(getSelectedModality(merged)).toEqual('sn');
  });

  it('merges into the initial config (without a uid) prior to the first onConfigChange', () => {
    const merged = mergeBiomarkerSelectConfig({ ...params, currentConfig: null });
    expect(merged.uid).toBeUndefined();
    expect(getBiomarkerSelection(merged)).toEqual({ label: 'GPRIN3', nodeType: 'gene' });
    expect(merged.coordinationSpace.featureSelection.__comparison__).toEqual(['GPRIN3']);
  });
});
