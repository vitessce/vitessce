import React, { useState, useCallback, useMemo } from 'react';
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
import {
  Button, ButtonGroup, Tooltip, NativeSelect, Grid, TextField,
  Typography, Add as AddIcon, Info as InfoIcon, Autocomplete,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@vitessce/styles';
import { AnnDataSource, ComparisonMetadataAnndataLoader } from '@vitessce/zarr';
import { VariableSizeList } from 'react-window';
import { isEqual } from 'lodash-es';


export function BiomarkerSelect(props) {
  const {
    datasetUrl,
    geneSelection,
    setGeneSelection,
    sampleSetSelection,
    setSampleSetSelection,
  } = props;

  const autocompleteFeature = useAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE);
  const transformFeature = useAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE);

  const autocompleteNode = useCallback(
    async inputValue => autocompleteFeature(inputValue),
    [autocompleteFeature],
  );
  const getEdges = useCallback(
    async (node, targetModality) => transformFeature(node, targetModality),
    [transformFeature],
  );

  const [loaders, dataset, obsType, sampleType] = useMemo(() => {
    const datasetResult = "__DATASET__";
    const loadersInternMap = new InternMap([], JSON.stringify);
    const dataSource = new AnnDataSource({
          url: datasetUrl,
          fileType: 'comparisonMetadata.anndata.zarr',
          requestInit: undefined,
          refSpecUrl: null,
          store: null,
          queryClient: null, // Unused by AnnDataSource.
        });
    const loader = new ComparisonMetadataAnndataLoader(dataSource, {
        url: datasetUrl,
        options: {
          path: 'uns/comparison_metadata',
        },
        requestInit: undefined,
        fileType: 'comparisonMetadata.anndata.zarr',
        coordinationValues: {
          obsType: 'cell',
          sampleType: 'sample',
        },
      });
    loadersInternMap.set({ obsType: "cell", sampleType: "sample" }, loader);
    const loadersResult = {
      [datasetResult]: {
        loaders: loadersInternMap
      },
    };
    return [loadersResult, datasetResult, "cell", "sample"];
  }, []);

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
    <p>Biomarker select UI here</p>
  );
}