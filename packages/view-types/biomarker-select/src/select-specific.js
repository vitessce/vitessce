import React, { useMemo } from 'react';
import { useStyles } from './styles.js';
//import type { QueryFunctionContext } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
//import type { KgAutocompleteFunc, KgEdgeGetterFunc, KgNode, ConfirmatoryCartProps, ConfirmatoryStepperSelectProps } from './types.js';
import { Stepper, Step, StepLabel, Button, Grid, FormHelperText, Typography, Select, FormControl } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';


const columns = [
  {
    field: 'targetLabel',
    headerName: 'Gene symbol',
    width: 200,
    editable: false,
  },
  {
    field: 'sourceRelationship',
    headerName: 'Relationship to modality-agnostic selections',
    width: 400,
    editable: false,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export function SelectSpecific(props) {
  const {
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    setCurrentStratificationSelection,

    getEdges,
  } = props;

  const queries = useQueries({
    queries: currentModalityAgnosticSelection?.map((item) => ({
      queryKey: [item.nodeType, item.kgId],
      queryFn: async (ctx) => {
        const matchingGenes = await getEdges(item, 'gene');
        return matchingGenes.map(d => ({ target: d, source: item }));
      },
    })) || [],
  });

  const anyLoading = queries.some(q => q.isFetching);
  const anyError = queries.some(q => q.isError);
  const dataStatus = anyLoading ? 'loading' : (anyError ? 'error' : 'success');

  const data = queries
    .flatMap(q => q.data)
    .filter(Boolean);
  
  const rows = useMemo(() => data.map((d) => ({
    id: d.target.kgId,
    targetLabel: d.target.label,
    sourceRelationship: (d.source.nodeType === 'gene'
      ? 'Directly-selected gene'
      : `Member of ${d.source.label} ${d.source.nodeType}`
    ),
  })), [currentModalityAgnosticSelection, dataStatus]);

  // Derive the set of selected row ids from the
  // currentModalitySpecificSelection.
  const rowSelectionModel = useMemo(() => {
    return currentModalitySpecificSelection?.map(d => d.kgId) || [];
  }, [rows, currentModalitySpecificSelection]);


  function handleSelection(newRowSelectionModel) {
    const newSelection = newRowSelectionModel
      .map(kgId => data.find(d => d.target.kgId === kgId)?.target)
      .filter(Boolean);
    setCurrentModalitySpecificSelection(newSelection);
  }

  return (
    <>
      <Grid item xs={6}>
        <Typography variant="h6">Select a feature type:</Typography>
      </Grid>
      <Grid item container xs={6}>
        <Grid item>
          <FormControl fullWidth>
            <Select
              native
              defaultValue={'gene'}
              inputProps={{
                name: 'age',
                id: 'uncontrolled-native',
              }}
            >
              <option value={'gene'}>Gene (RNA-seq)</option>
            </Select>
            <FormHelperText>Feature type (experimental modality)</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          onRowSelectionModelChange={handleSelection}
          rowSelectionModel={rowSelectionModel}
        />
      </Grid>
    </>
  );
}
