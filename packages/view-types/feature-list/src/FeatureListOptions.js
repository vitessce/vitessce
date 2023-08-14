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
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Sort Ordering
        </TableCell>
        <TableCell variant="body">
          <OptionSelect
            key="feature-list-sort-option-select"
            className={classes.select}
            value={featureListSort}
            onChange={handleFeatureListSortChange}
            inputProps={{
              id: 'feature-list-sort-option',
            }}
          >
            {FEATURELIST_SORT_OPTIONS.map(option => (
              <option id={option} value={option}>{option}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      {hasFeatureLabels ? (
        <>
          <TableRow>
            <TableCell className={classes.labelCell} variant="head" scope="row">
              Sort Key
            </TableCell>
            <TableCell variant="body">
              <OptionSelect
                key="feature-list-sort-key-select"
                className={classes.select}
                disabled={featureListSort === 'original'}
                value={featureListSortKey}
                onChange={handleFeatureListSortKeyChange}
                inputProps={{
                  'aria-label': 'Select the feature list sort key',
                  id: 'feature-list-sort-key',
                }}
              >
                {hasFeatureLabels ? (
                  <>
                    <option id={`featureLabels-${primaryColumnName}-key`} value="featureLabels">{primaryColumnName}</option>
                    <option id={`featureIndex-${ALT_COLNAME}-key`} value="featureIndex">{ALT_COLNAME}</option>
                  </>
                ) : (
                  <option id={`featureIndex-${primaryColumnName}-key`} value="featureIndex">{primaryColumnName}</option>
                )}
              </OptionSelect>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.labelCell} variant="head" scope="row">
              Show Alternate IDs
            </TableCell>
            <TableCell className={classes.inputCell} variant="body">
              <Checkbox
                className={classes.tableCheckbox}
                checked={showFeatureTable}
                onChange={handleShowTableChange}
                name="feature-list-show-table"
                color="default"
                inputProps={{
                  'aria-label': 'Checkbox for showing or hiding alternative feature ids.',
                  id: 'feature-list-show-alternative-ids',
                }}
              />
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
