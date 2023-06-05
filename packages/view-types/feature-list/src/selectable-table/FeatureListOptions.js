import React from 'react';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';
import { TableCell, TableRow, Checkbox } from '@material-ui/core';
import { FEATURELIST_SORT_OPTIONS } from './constants.js';


export default function FeatureListOptions(props) {
  const {
    children,
    featureListSort,
    setFeatureListSort,
    featureListSortKey,
    setFeatureListSortKey,
    showFeatureTable,
    setShowFeatureTable,
    hasFeatureLabels,
    featureListTableKeys,
  } = props;

  function handleFeatureListSortChange(event) {
    setFeatureListSort(event.target.value);
  }

  function handleFeatureListSortKeyChange(event) {
    setFeatureListSortKey(event.target.value);
  }

  function handleShowTableChange(event) {
    setShowFeatureTable(event.target.checked);
  }

  const classes = usePlotOptionsStyles();

  return (
    <OptionsContainer>
      {children}
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="feature-list-sort-option-select">
          Sort Ordering
        </TableCell>
        <TableCell>
          <OptionSelect
            className={classes.select}
            value={featureListSort}
            onChange={handleFeatureListSortChange}
            inputProps={{
              id: 'feature-list-sort-option-select',
            }}
          >
            {FEATURELIST_SORT_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      {hasFeatureLabels
        && (
          <TableRow>
            <TableCell className={classes.labelCell} htmlFor="feature-list-sort-key-select">
              Sort Key
            </TableCell>
            <TableCell>
              <OptionSelect
                className={classes.select}
                disabled={featureListSort === 'original'}
                value={featureListSortKey}
                onChange={handleFeatureListSortKeyChange}
                inputProps={{
                  id: 'feature-list-sort-key-select',
                }}
              >
                {Object.keys(featureListTableKeys).map(k => (
                  <option key={featureListTableKeys[k]} value={k}>{featureListTableKeys[k]}</option>
                ))}
              </OptionSelect>
            </TableCell>
          </TableRow>
        )
      }
      <TableRow>
        <TableCell className={classes.labelCell}>
          Show Alternate IDs
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={showFeatureTable}
            onChange={handleShowTableChange}
            name="feature-list-show-table"
            color="default"
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
