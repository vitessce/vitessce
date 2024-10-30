import React, { useRef, useEffect } from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { Add as AddIcon, Info as InfoIcon } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
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

  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + 8,
    },
  });
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

export function SelectAgnostic(props) {
  const {
    autocompleteNode,
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
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
    // eslint-disable-next-line max-len
    if (selectedItem && !currentModalityAgnosticSelection?.find(item => item.kgId === selectedItem?.kgId)) {
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
      <Grid item container xs={12}>
        <Grid item xs={4}>
          <Autocomplete
            options={potentialItems}
            autoComplete
            includeInputInList
            onInputChange={handleChange}
            onChange={(event, item) => setSelectedItem(item)}
            classes={{ input: classes.searchInput }}
            renderInput={params => (
              <TextField label="Search" variant="outlined" onChange={handleChange} {...params} />
            )}
            ListboxComponent={ListboxComponent}
            getOptionLabel={option => option.label}
            renderOption={option => (
              <Typography noWrap>{option.label} ({option.nodeType})</Typography>
            )}
          />
        </Grid>
        <Grid
          item
          xs={8}
          style={{
            border: selectedItem ? '1px solid gray' : '1px solid transparent',
            borderRadius: '4px',
          }}
        >
          {selectedItem ? (
            <>
              <Grid container item xs={12}>
                <Grid item xs={9}>
                  <Typography variant="h4" title={selectedItem.term}>
                    {selectedItem.label}
                  </Typography>
                </Grid>
                <Grid item xs={3} style={{ position: 'relative' }}>
                  <Button
                    className={classes.selectButton}
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={confirmSelectedItem}
                  >
                    Select
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <InfoIcon />
                <Typography variant="h6">About this {selectedItem.nodeType}</Typography>
              </Grid>
              <Grid container item xs={12} key={selectedItem.term}>
                <iframe
                  title={`Embedded metadata page for ontology term ${selectedItem.term}`}
                  src={`https://identifiers.org/${selectedItem.term}`}
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}
