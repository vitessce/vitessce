/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import {
  useAsyncFunction,
  useViewConfigStoreApi,
  useSetViewConfig,
  useViewConfig,
  useCoordination,
  useLoaders,
  useComparisonMetadata,
  useMatchingLoader,
  useColumnNameMapping,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { AsyncFunctionType, ViewType, COMPONENT_COORDINATION_TYPES, DataType } from '@vitessce/constants-internal';
import { BiomarkerSelectAlt } from './BiomarkerSelectAlt.js';

/**
 * Alternative biomarker select UI.
 * @param {object} props
 * @param {string} props.uuid The view uid.
 * @param {{ label: string, nodeType: string } | null} [props.biomarkerSelection] The selected
 * modality-agnostic item (e.g., a gene or pathway), stored in the view config `props` of this view.
 * Internally, it is transformed into the list of genes for the featureSelection coordination value.
 * @returns
 */
export function BiomarkerSelectAltSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    biomarkerSelection = null,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  const [{
    dataset,
    obsType,
    sampleType,
    sampleSetFilter,
    sampleSetSelection,
    featureSelection,
  }, {
    setDataset,
    setSampleSetFilter,
    setSampleSetSelection,
    setFeatureSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.BIOMARKER_SELECT],
    coordinationScopes,
  );

  const viewConfigStoreApi = useViewConfigStoreApi();
  const viewConfig = useViewConfig();
  const setViewConfig = useSetViewConfig(viewConfigStoreApi);

  // Update the biomarkerSelection value in the view config props of this view.
  const setBiomarkerSelection = useCallback((newBiomarkerSelection) => {
    const { viewConfig: currentViewConfig } = viewConfigStoreApi.getState();
    setViewConfig({
      ...currentViewConfig,
      layout: currentViewConfig.layout.map(v => (v.uid === uuid
        ? { ...v, props: { ...v.props, biomarkerSelection: newBiomarkerSelection } }
        : v
      )),
    });
  }, [viewConfigStoreApi, setViewConfig, uuid]);

  // Options for the dropdown used to switch between datasets
  // (e.g., single-cell vs. single-nucleus data modalities).
  // Only rendered when multiple datasets are present in the config.
  const datasetOptions = useMemo(() => (viewConfig?.datasets ?? []).map(d => ({
    uid: d.uid,
    name: d.name,
  })), [viewConfig?.datasets]);


  // Need obsSets and sampleSets options to obtain mapping between
  // group names and column names.
  const obsSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.OBS_SETS, { obsType },
  );
  const sampleSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.SAMPLE_SETS, { sampleType },
  );
  const sampleSetsColumnNameMappingReversed = useColumnNameMapping(sampleSetsLoader, true);

  const autocompleteFeature = useAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE);
  const transformFeature = useAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE);

  const autocompleteNode = useCallback(async (inputValue) => {
    const results = await autocompleteFeature(inputValue);
    return results.map(item => ({
      label: item.label,
      data: item,
    }));
  }, [autocompleteFeature]);
  const getEdges = useCallback(
    async (node, targetModality) => transformFeature(node, targetModality),
    [transformFeature],
  );

  // The biomarkerSelection only contains the label and nodeType
  // (e.g., when provided via URL params), so we look up the full knowledge graph node
  // (containing the kgId and ontology term) and its corresponding genes.
  const { data: resolvedBiomarker } = useQuery({
    queryKey: ['biomarkerSelectAlt', 'resolveBiomarker', biomarkerSelection?.label, biomarkerSelection?.nodeType],
    enabled: Boolean(biomarkerSelection),
    staleTime: Infinity,
    queryFn: async () => {
      const { label, nodeType } = biomarkerSelection;
      const matches = await autocompleteFeature(label);
      const node = matches.find(n => n.label === label && n.nodeType === nodeType) ?? null;
      const genes = node ? uniqBy(await transformFeature(node, 'gene'), 'label') : [];
      return { node, genes };
    },
  });

  // Initialize the featureSelection based on the biomarkerSelection,
  // in the case that only the biomarkerSelection has been provided
  // (e.g., upon initial page load with a pathway specified in the URL params).
  useEffect(() => {
    if (resolvedBiomarker && biomarkerSelection && featureSelection == null) {
      setFeatureSelection(resolvedBiomarker.genes.map(d => d.label));
    }
  }, [resolvedBiomarker, biomarkerSelection, featureSelection, setFeatureSelection]);

  const [{ comparisonMetadata }, cmpMetadataStatus, cmpMetadataUrls] = useComparisonMetadata(
    loaders, dataset, false, {}, {}, { obsType, sampleType },
  );
  const stratificationOptions = useMemo(() => {
    /*
      return array of objects like {
        stratificationId: 'aki-vs-hr',
        name: 'Acute kidney injury (AKI) vs. Healthy reference',
        stratificationType: 'sampleSet', // key changed from 'groupType'. value changed from 'clinical'
        sampleSets: [
          ['Disease Type', 'AKI'],
          ['Disease Type', 'Reference'],
        ],
      },
    */
    if (comparisonMetadata?.sample_group_pairs) {
      return comparisonMetadata.sample_group_pairs.map((sampleGroupPair) => {
        const [sampleGroupCol, sampleGroupValues] = sampleGroupPair;
        const [sampleGroupCtrl, sampleGroupCase] = sampleGroupValues;
        const groupName = sampleSetsColumnNameMappingReversed?.[sampleGroupCol];
        return {
          stratificationId: `${sampleGroupCol}_${sampleGroupCtrl}-vs-${sampleGroupCase}`,
          name: `${groupName}: ${sampleGroupCtrl} vs. ${sampleGroupCase}`,
          stratificationType: 'sampleSet',
          sampleSets: [
            // With sampleSets coming from the comparison_metadata,
            // need to use loader options from obsSets and sampleSets to get mapping
            // from column name to group name.
            [groupName, sampleGroupCtrl],
            [groupName, sampleGroupCase],
          ],
        };
      });
    }
    return null;
  }, [comparisonMetadata, sampleSetsColumnNameMappingReversed]);

  return (
    <>
      <BiomarkerSelectAlt
        setFeatureSelection={setFeatureSelection}
        setSampleSetFilter={setSampleSetFilter}
        setSampleSetSelection={setSampleSetSelection}
        sampleSetSelection={sampleSetSelection}
        biomarkerSelection={biomarkerSelection}
        setBiomarkerSelection={setBiomarkerSelection}
        resolvedBiomarker={resolvedBiomarker?.node ?? null}
        autocompleteNode={autocompleteNode}
        getEdges={getEdges}
        stratifications={stratificationOptions}
        datasetOptions={datasetOptions}
        dataset={dataset}
        setDataset={setDataset}
      />
    </>
  );
}
