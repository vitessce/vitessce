import React, { useId } from 'react';
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

  const featureListId = useId();

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
              <option key={option} value={option}>{option}</option>
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
                className={classes.select}
                disabled={featureListSort === 'original'}
                value={featureListSortKey}
                onChange={handleFeatureListSortKeyChange}
                inputProps={{
                  'aria-label': 'Select the feature list sort key',
                  id: ['feature-list-sort-key', featureListId].join('-'),
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
                  id: ['feature-list-show-alternative-ids', featureListId].join('-'),
                }}
              />
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
