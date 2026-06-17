import React, { useRef, useEffect, useState, type ComponentType } from 'react';
import {
  VariableSizeList as _VariableSizeList,
  type VariableSizeList as VariableSizeListType,
} from 'react-window'; // TODO: upgrade to v2
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

// Cast to work around react-window types being incompatible with React 18 types.
const VariableSizeList = _VariableSizeList as unknown as ComponentType<any>;

export interface AutocompleteItem {
  label: string;
  data: any; // Additional data can be included as needed
}

export interface SimpleAutocompleteProps {
  /**
   * Async function that takes a search string and returns matching items.
   */
  getMatches: (inputValue: string) => Promise<AutocompleteItem[]>;
  /**
   * Callback fired when the user selects an item from the dropdown.
   */
  onChange: (item: AutocompleteItem | null) => void;
  /**
   * Label for the text input.
   */
  textInputLabel?: string;
  /**
   * Function to get the label for an option, used in rendering the dropdown.
   */
  getItemLabel?: (option: AutocompleteItem) => string;
}

const LIST_ROW_HEIGHT = 48;

const useStyles = makeStyles()(() => ({
  searchInput: {
    lineHeight: 'initial',
    height: 'auto !important',
  },
}));

// Context to forward outer element props for the virtualized listbox.
const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function ListRow(props: { data: any[]; index: number; style: React.CSSProperties }) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + 8,
  };

  // This array is created by the renderOption function in the Autocomplete component.
  const [props0, option, getItemLabel] = dataSet;
  const { key, ...optionProps } = props0;

  return (
    <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
      {getItemLabel(option)}
    </Typography>
  );
}

function useResetCache(itemCount: number) {
  const ref = useRef<VariableSizeListType>(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [itemCount]);
  return ref;
}

// Virtualized listbox based on:
// https://mui.com/material-ui/react-autocomplete/#virtualization
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { children, ...other } = props;

  const items = children as any[];
  const itemCount = items.length;
  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          height={Math.min(8, itemCount) * LIST_ROW_HEIGHT}
          itemSize={() => LIST_ROW_HEIGHT}
          width="100%"
          innerElementType="ul"
          outerElementType={OuterElementType as any}
          overscanCount={5}
          ref={gridRef}
          itemCount={itemCount}
          itemData={items}
        >
          {ListRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

/**
 * A reusable virtualized autocomplete for searching genes (and other
 * ontology nodes such as proteins, pathways, or cell types).
 *
 * The caller supplies an async `getMatches` function that receives
 * the current input value and returns matching `AutocompleteItem[]`.
 */
export function SimpleAutocomplete(props: SimpleAutocompleteProps) {
  const {
    getMatches,
    onChange,
    textInputLabel = 'Enter a gene',
    getItemLabel = (option: AutocompleteItem) => option.label,
  } = props;
  const { classes } = useStyles();

  const [potentialItems, setPotentialItems] = useState<AutocompleteItem[]>([]);

  const handleInputChange = async (
    _event: React.SyntheticEvent,
    value: string,
  ) => {
    if (!value) {
      setPotentialItems([]);
      return;
    }
    const results = await getMatches(value);
    setPotentialItems(results);
  };

  return (
    <Autocomplete
      options={potentialItems}
      autoComplete
      includeInputInList
      onInputChange={handleInputChange}
      onChange={(_event, item) => onChange(item)}
      classes={{ input: classes.searchInput }}
      renderInput={params => (
        <TextField label={textInputLabel} variant="outlined" {...params} />
      )}
      getOptionLabel={option => option.label}
      renderOption={(props0, option, state) => (
        [props0, option, getItemLabel, state.index] as React.ReactNode
      )}
      slotProps={{
        listbox: {
          component: ListboxComponent,
        },
      }}
    />
  );
}
