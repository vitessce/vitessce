/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useFilteredVolcanoData } from './VolcanoPlot.js';
import { capitalize } from '@vitessce/utils';

// Reference: https://v4.mui.com/api/data-grid/data-grid/

const ROW_ID_DELIMITER = '___';

export default function FeatureStatsTable(props) {
  const {
    obsType,
    featureType,
    obsSetsColumnNameMapping,
    sampleSetsColumnNameMapping,
    sampleSetSelection,
    data,
    setFeatureSelection,
    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
  } = props;

  const [
    computedData,
    filteredData,
    obsSetsColumnNameMappingReversed,
  ] = useFilteredVolcanoData({
    data,
    obsSetsColumnNameMapping,
    sampleSetsColumnNameMapping,
    featurePointFoldChangeThreshold,
    featurePointSignificanceThreshold,
    sampleSetSelection,
  });

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
    if(filteredData) {
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
    const featureIds = rowIds.map(rowId => rowId.split(ROW_ID_DELIMITER)[0]);
    setFeatureSelection(featureIds);
  }, [])

  const rowSelectionModel = useMemo(() => [], []);

  const [sortModel, setSortModel] = useState([
    // We initially set the sorting this way
    { field: 'logFoldChange', sort: 'desc' }
  ]);

  const getRowId = useCallback((row) => row.id, []);

  return (
    <DataGrid
      density="compact"
      rows={rows}
      columns={columns}
      pageSize={10}
      // checkboxSelection // TODO: uncomment to enable multiple-row selection
      onSelectionModelChange={onSelectionModelChange}
      rowSelectionModel={rowSelectionModel}
      getRowId={getRowId}
      sortModel={sortModel}
      onSortModelChange={(model) => {
        console.log(model);
        setSortModel(model);
      }}
    />
  );
}
