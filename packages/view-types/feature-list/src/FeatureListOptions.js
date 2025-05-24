import React from 'react';
import { useId } from 'react-aria';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';
import { TableCell, TableRow, Checkbox } from '@vitessce/styles';
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

  const { classes } = usePlotOptionsStyles();

  return (
    <OptionsContainer>
      {children}
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label htmlFor={`feature-list-sort-option-${featureListId}`}>Sort Ordering</label>
        </TableCell>
        <TableCell variant="body">
          <OptionSelect
            className={classes.select}
            value={featureListSort}
            onChange={handleFeatureListSortChange}
            inputProps={{
              id: `feature-list-sort-option-${featureListId}`,
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
              <label htmlFor={`feature-list-sort-key-${featureListId}`}>Sort Key</label>
            </TableCell>
            <TableCell variant="body">
              <OptionSelect
                className={classes.select}
                disabled={featureListSort === 'original'}
                value={featureListSortKey}
                onChange={handleFeatureListSortKeyChange}
                inputProps={{
                  'aria-label': 'Select the feature list sort key',
                  id: `feature-list-sort-key-${featureListId}`,
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
              <label htmlFor={`feature-list-show-alternative-ids-${featureListId}`}>Show Alternate IDs</label>
            </TableCell>
            <TableCell className={classes.inputCell} variant="body">
              <Checkbox
                className={classes.tableCheckbox}
                checked={showFeatureTable}
                onChange={handleShowTableChange}
                name="feature-list-show-table"
                color="default"
                slotProps={{ input: {
                  'aria-label': 'Show or hide alternative feature ids',
                  id: `feature-list-show-alternative-ids-${featureListId}`,
                } }}
              />
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
