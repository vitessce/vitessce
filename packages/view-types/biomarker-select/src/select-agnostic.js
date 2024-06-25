import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { useStyles } from './styles.js';
import { useQueries } from '@tanstack/react-query';
//import type { KgAutocompleteFunc, KgEdgeGetterFunc, KgNode, ConfirmatoryCartProps, ConfirmatoryStepperSelectProps } from './types.js';
import {
  Grid,
  Button,
  TextField,
  Typography,
  /*
  Box,
  FormHelperText,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Select,
  FormControl,
  InputLabel,
  autocompleteClasses,
  ListSubheader,
  Popper,
  */
} from '@material-ui/core';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, Info as InfoIcon } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { VariableSizeList } from 'react-window';

const LIST_ROW_HEIGHT = 48;

// We use a context to pass the extra props from ListboxComponent to the outer div element.
const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});


function ListRow(props) {
  const { data, index, style } = props;

  const rowProps = data[index][0];
  const { kgId, label, term, nodeType } = data[index][1];

  return (
    <Typography component="li" {...rowProps} noWrap style={style}>
      {label} ({nodeType})
    </Typography>
  )
}

function useResetCache(itemCount) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [itemCount]);
  return ref;
}

// Reference: https://mui.com/material-ui/react-autocomplete/#virtualization
const ListboxComponent = React.forwardRef((props, ref) => {
  const { children, ...other } = props;

  const itemCount = children.length;
  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          height={Math.min(8, itemCount) * LIST_ROW_HEIGHT}
          itemSize={() => LIST_ROW_HEIGHT}
          width="100%"
          innerElementType="ul"
          outerElementType={OuterElementType}
          overscanCount={5}
          ref={gridRef}
          itemCount={itemCount}
          itemData={children}
        >
          {ListRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  )
});

export function SelectAgnostic(props) {
  const {
    autocompleteNode,

    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    setCurrentStratificationSelection,

  } = props;
  const classes = useStyles();

  const [selectedItem, setSelectedItem] = React.useState(null);

  const [potentialItems, setPotentialItems] = React.useState([]);

  const handleChange = async (event) => {
    const { value } = event.target;
    if (!value) {
      return;
    }
    const autocompleteResult = await autocompleteNode(value);
    setPotentialItems(autocompleteResult);
  };


  function confirmSelectedItem() {
    if(selectedItem && !currentModalityAgnosticSelection?.find((item) => item.kgId === selectedItem?.kgId)) {
      setCurrentModalityAgnosticSelection([
        ...(currentModalityAgnosticSelection || []),
        selectedItem,
      ]);
    }
  }
  return (
    <>
        <Grid item container xs={12}>
            <Typography variant="h6">
              Search by gene, protein, pathway (by term name), or cell type:
            </Typography>
        </Grid>
        <Grid item container xs={12} style={{ marginTop: '20px' }}>
          <Grid
            item
            xs={4}
          >
            <Autocomplete
              options={potentialItems}
              autoComplete
              includeInputInList
              onInputChange={handleChange}
              onChange={(event, item) => setSelectedItem(item)}
              renderInput={(params) => (
                <TextField label="Search" variant="outlined" onChange={handleChange} {...params} />
              )}
              ListboxComponent={ListboxComponent}
              renderOption={(props, option, state) => ([props, option, state.index])}
            />
          </Grid>
          <Grid item xs={8} style={{ border: '1px solid gray', borderRadius: '4px', marginTop: '3px' }}>
            {selectedItem ? (
              <>
                <Grid container item xs={12}>
                  <Grid item xs={9}>
                    <Typography variant="h4" title={selectedItem.term}>{selectedItem.label}</Typography>
                  </Grid>
                  <Grid item xs={3} style={{ position: 'relative' }}>
                    <Button className={classes.selectButton} variant="contained" startIcon={<AddIcon />} onClick={confirmSelectedItem}>Select</Button>
                  </Grid>
                </Grid>
                <Grid container item xs={12}>
                  <InfoIcon />
                  <Typography variant="h6">About this {selectedItem.nodeType}</Typography>
                </Grid>
                <Grid container item xs={12} key={selectedItem.term}>
                  <iframe src={`https://identifiers.org/${selectedItem.term}`} width="100%" height="500" style={{ border: 0 }} />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Grid>
    </>
  );
}

