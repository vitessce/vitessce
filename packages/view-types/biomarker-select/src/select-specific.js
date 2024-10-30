import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Grid, FormHelperText, Typography, Select, FormControl } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { useStyles } from './styles.js';


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


export function SelectSpecific(props) {
  const {
    currentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    getEdges,
  } = props;
  const classes = useStyles();

  const queries = useQueries({
    queries: currentModalityAgnosticSelection?.map(item => ({
      queryKey: [item.nodeType, item.kgId],
      queryFn: async () => {
        const matchingGenes = await getEdges(item, 'gene');
        return matchingGenes.map(d => ({ target: d, source: item }));
      },
    })) || [],
  });

  const anyLoading = queries.some(q => q.isFetching);
  const anyError = queries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? 'loading' : (anyError ? 'error' : 'success');

  const data = queries
    .flatMap(q => q.data)
    .filter(Boolean);

  const rows = useMemo(() => data.map(d => ({
    id: d.target.kgId,
    targetLabel: d.target.label,
    sourceRelationship: (d.source.nodeType === 'gene'
      ? 'Directly-selected gene'
      : `Member of ${d.source.label} ${d.source.nodeType}`
    ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [currentModalityAgnosticSelection, dataStatus]);

  // Derive the set of selected row ids from the
  // currentModalitySpecificSelection.
  const rowSelectionModel = useMemo(
    () => currentModalitySpecificSelection?.map(d => d.kgId) || [],
    [rows, currentModalitySpecificSelection],
  );

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
              defaultValue="gene"
              classes={{ select: classes.selectInput }}
              inputProps={{
                name: 'age',
                id: 'uncontrolled-native',
              }}
            >
              <option value="gene">Gene (RNA-seq)</option>
            </Select>
            <FormHelperText>Feature type (experimental modality)</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item container xs={12} style={{ height: '450px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          checkboxSelection
          onSelectionModelChange={handleSelection}
          rowSelectionModel={rowSelectionModel}
        />
      </Grid>
    </>
  );
}
