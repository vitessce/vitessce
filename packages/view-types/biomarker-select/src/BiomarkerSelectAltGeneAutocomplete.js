import React, { useRef, useEffect, useState } from 'react';
import {
  Grid, Button, TextField,
  Typography, Add as AddIcon, Info as InfoIcon,
  Autocomplete,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@vitessce/styles';
import { VariableSizeList } from 'react-window';
import { useStyles } from './styles.js';


const LIST_ROW_HEIGHT = 48;

// We use a context to pass the extra props from ListboxComponent to the outer div element.
const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});


function ListRow(props) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: style.top + 8,
  };

  // This array is created by the renderOption function in the Autocomplete component.
  const [props0, option] = dataSet;
  const { key, ...optionProps } = props0;

  return (
    <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
      {option.label} ({option.nodeType})
    </Typography>
  );
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
  );
});

export function BiomarkerSelectAltGeneAutocomplete(props) {
  const {
    setFeatureSelection,
    autocompleteNode,
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    setCurrentModalitySpecificSelection,
  } = props;
  const { classes } = useStyles();

  const [selectedItem, setSelectedItem] = useState(null);
  const [potentialItems, setPotentialItems] = useState([]);

  const [biomarkerInfoOpen, setBiomarkerInfoOpen] = useState(false);

  const handleChange = async (event) => {
    const { value } = event.target;
    if (!value) {
      return;
    }
    const autocompleteResult = await autocompleteNode(value);
    setPotentialItems(autocompleteResult);
  };


  function confirmSelectedItem() {
    // eslint-disable-next-line max-len
    if (selectedItem && !currentModalityAgnosticSelection?.find(item => item.kgId === selectedItem?.kgId)) {
      setCurrentModalityAgnosticSelection([
        ...(currentModalityAgnosticSelection || []),
        selectedItem,
      ]);
      // TODO: directly set featureSelection coordination value here instead?
      console.log('Setting specific selection to:', selectedItem);
      const nextModalitySpecificSelection =[
        ...(currentModalityAgnosticSelection || []),
        selectedItem,
      ];
      setFeatureSelection(nextModalitySpecificSelection.map(d => d.label));
    }
  }

  function clearBiomarkerSelection() {
    setCurrentModalityAgnosticSelection([]);
    setCurrentModalitySpecificSelection([]);
    setFeatureSelection([]);
  }

  return (
    <>
      <Grid container size={12}>
        <Grid size={8}>
          <Autocomplete
            options={potentialItems}
            autoComplete
            includeInputInList
            onInputChange={handleChange}
            onChange={(event, item) => setSelectedItem(item)}
            classes={{ input: classes.searchInput }}
            renderInput={params => (
              <TextField label="Enter a gene" variant="outlined" onChange={handleChange} {...params} />
            )}
            getOptionLabel={option => option.label}
            renderOption={(props0, option, state) => (
              [props0, option, state.index]
            )}
            slotProps={{
              listbox: {
                component: ListboxComponent,
              },
            }}
          />
        </Grid>
        {selectedItem ? (
          <Grid size={4}>
            &nbsp;
            <Button
              variant="contained"
              onClick={confirmSelectedItem}
            >
              Select
            </Button>
          </Grid>
          ) : null}
      </Grid>
      {selectedItem ? (
        <>
        <Grid container size={12} flexDirection="row">
          <Button onClick={() => setBiomarkerInfoOpen(true)}>
            View {selectedItem.nodeType} info
          </Button>
        </Grid>
        <Dialog open={biomarkerInfoOpen} onClose={() => setBiomarkerInfoOpen(false)} maxWidth="md">
          <Typography variant="h4" title={selectedItem.term}>
            {selectedItem.label}
          </Typography>
          <Grid container size={12}>
            <InfoIcon />
            <Typography variant="h6">About this {selectedItem.nodeType}</Typography>
          </Grid>
          <Grid container size={12} key={selectedItem.term} sx={{ width: '800px' }}>
            <iframe
              title={`Embedded metadata page for ontology term ${selectedItem.term}`}
              src={`https://identifiers.org/${selectedItem.term}`}
              width="100%"
              height="500"
              style={{ border: 0 }}
            />
          </Grid>
        </Dialog>
        </>
      ) : null}
    </>
  );
}
