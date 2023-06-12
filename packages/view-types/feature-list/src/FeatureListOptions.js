import React from 'react';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';
import { TableCell, TableRow, Checkbox } from '@material-ui/core';
import { FEATURELIST_SORT_OPTIONS, ALT_COLNAME } from './constants.js';


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
    primaryColumnName,
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
        <TableCell className={classes.plotOptionsLabelCell} htmlFor="feature-list-sort-option-select">
          Sort Ordering
        </TableCell>
        <TableCell>
          <OptionSelect
            className={classes.plotOptionsSelect}
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
      {hasFeatureLabels ? (
        <>
          <TableRow>
            <TableCell className={classes.plotOptionsLabelCell} htmlFor="feature-list-sort-key-select">
              Sort Key
            </TableCell>
            <TableCell>
              <OptionSelect
                className={classes.plotOptionsSelect}
                disabled={featureListSort === 'original'}
                value={featureListSortKey}
                onChange={handleFeatureListSortKeyChange}
                inputProps={{
                  id: 'feature-list-sort-key-select',
                }}
              >
                {hasFeatureLabels ? (
                  <>
                    <option value="featureLabels">{primaryColumnName}</option>
                    <option value="featureIndex">{ALT_COLNAME}</option>
                  </>
                ) : (
                  <option value="featureIndex">{primaryColumnName}</option>
                )}
              </OptionSelect>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.plotOptionsLabelCell}>
              Show Alternate IDs
            </TableCell>
            <TableCell className={classes.plotOptionsInputCell}>
              <Checkbox
                className={classes.plotOptionsCheckbox}
                checked={showFeatureTable}
                onChange={handleShowTableChange}
                name="feature-list-show-table"
                color="default"
              />
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
