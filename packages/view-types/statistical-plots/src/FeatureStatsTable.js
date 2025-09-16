import React, { useMemo, useState, useCallback } from 'react';
import { DataGrid } from '@vitessce/styles';
import { capitalize } from '@vitessce/utils';
import { useFilteredVolcanoData } from './utils.js';

const ROW_ID_DELIMITER = '___';
const INITIAL_SORT_MODEL = [
  // We initially set the sorting this way
  { field: 'logFoldChange', sort: 'desc' },
];

const initialState = {
  pagination: {
    paginationModel: {
      pageSize: 10,
    },
  },
};
const pageSizeOptions = [10];

export default function FeatureStatsTable(props) {
  const {
    obsType,
    featureType,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    sampleSetSelection,
    data,
    setFeatureSelection,
    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
  } = props;

  const [
    // eslint-disable-next-line no-unused-vars
    computedData,
    filteredData,
  ] = useFilteredVolcanoData({
    data,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    featurePointFoldChangeThreshold,
    featurePointSignificanceThreshold,
    sampleSetSelection,
  });

  // Reference: https://v4.mui.com/api/data-grid/data-grid/
  const columns = useMemo(() => ([
    {
      field: 'featureId',
      headerName: capitalize(featureType),
      width: 200,
      editable: false,
    },
    {
      field: 'logFoldChange',
      headerName: 'Log Fold-Change',
      width: 200,
      editable: false,
    },
    {
      field: 'featureSignificance',
      headerName: 'P-value',
      width: 200,
      editable: false,
    },
    {
      field: 'obsSetName',
      headerName: `${capitalize(obsType)} Set`,
      width: 200,
      editable: false,
    },
  ]), [obsType, featureType]);

  const rows = useMemo(() => {
    let result = [];
    if (filteredData) {
      filteredData.forEach((comparisonObject) => {
        const { df, metadata } = comparisonObject;

        const coordinationValues = metadata.coordination_values;

        const rawObsSetPath = coordinationValues.obsSetFilter
          ? coordinationValues.obsSetFilter[0]
          : coordinationValues.obsSetSelection[0];
        const obsSetPath = [...rawObsSetPath];
        obsSetPath[0] = obsSetsColumnNameMappingReversed[rawObsSetPath[0]];
        const obsSetName = obsSetPath.at(-1);

        result = result.concat(df.map(row => ({
          ...row,
          id: `${row.featureId}${ROW_ID_DELIMITER}${obsSetName}`,
          obsSetName,
        })));
      });
    }
    return result;
  }, [filteredData, obsSetsColumnNameMappingReversed]);

  const onSelectionModelChange = useCallback((rowIds) => {
    const featureIds = Array.from(rowIds.ids).map(rowId => rowId.split(ROW_ID_DELIMITER)[0]);
    setFeatureSelection(featureIds);
  }, []);

  const rowSelectionModel = useMemo(() => ({ ids: new Set([]), type: 'include' }), []);

  const [sortModel, setSortModel] = useState(INITIAL_SORT_MODEL);

  const getRowId = useCallback(row => row.id, []);

  return (
    <DataGrid
      density="compact"
      rows={rows}
      columns={columns}
      initialState={initialState}
      pageSizeOptions={pageSizeOptions}
      // checkboxSelection // TODO: uncomment to enable multiple-row selection
      onRowSelectionModelChange={onSelectionModelChange}
      rowSelectionModel={rowSelectionModel}
      getRowId={getRowId}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
    />
  );
}
