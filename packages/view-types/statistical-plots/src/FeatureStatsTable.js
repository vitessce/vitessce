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

// Display-only formatters: sorting still uses the raw numeric values.
function formatOneDecimal(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(1) : '';
}

const SUPERSCRIPT_CHARS = {
  '-': '\u207B',
  0: '\u2070',
  1: '\u00B9',
  2: '\u00B2',
  3: '\u00B3',
  4: '\u2074',
  5: '\u2075',
  6: '\u2076',
  7: '\u2077',
  8: '\u2078',
  9: '\u2079',
};

function toSuperscript(str) {
  return str.split('').map(char => SUPERSCRIPT_CHARS[char] ?? char).join('');
}

// Scientific notation with two decimal places, e.g., 6.17 × 10⁻⁸.
function formatScientific(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }
  if (value === 0 || !Number.isFinite(value)) {
    return String(value);
  }
  const [mantissa, exponent] = value.toExponential(2).split('e');
  const exponentNumber = Number(exponent);
  if (exponentNumber === 0) {
    return mantissa;
  }
  return `${mantissa} \u00D7 10${toSuperscript(String(exponentNumber))}`;
}

// Percent expressing values are stored in the range 0-100.
function formatPercent(value) {
  const formatted = formatOneDecimal(value);
  return formatted ? `${formatted}%` : '';
}

export default function FeatureStatsTable(props) {
  const {
    obsType,
    featureType,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    sampleSetSelection,
    data,
    setFeatureSelection,
    setFeatureAggregationStrategy,
    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
    hasPercentExpressing = false,
    hasMeanExpression = false,
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
      valueFormatter: formatOneDecimal,
    },
    {
      field: 'featureSignificance',
      headerName: 'P-value',
      width: 200,
      editable: false,
      valueFormatter: formatScientific,
    },
    ...(hasPercentExpressing ? [{
      field: 'percentExpressing',
      headerName: 'Percent Expressing',
      width: 200,
      editable: false,
      valueFormatter: formatPercent,
    }] : []),
    ...(hasMeanExpression ? [{
      field: 'meanExpression',
      headerName: 'Mean Expression',
      width: 200,
      editable: false,
      valueFormatter: formatOneDecimal,
    }] : []),
    {
      field: 'obsSetName',
      headerName: `${capitalize(obsType)} Set`,
      width: 200,
      editable: false,
    },
  ]), [obsType, featureType, hasPercentExpressing, hasMeanExpression]);

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
    // We want to clear this value upon selection, in case it was previously set.
    setFeatureAggregationStrategy(null);

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
