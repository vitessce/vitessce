import React from 'react';
import { useId } from 'react-aria';
import { OptionsContainer, Checkbox, StyledOptionSelect, LabelCell, InputCell } from '@vitessce/vit-s';
import { TableCell, TableRow } from '@mui/material';
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

  return (
    <OptionsContainer>
      {children}
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label htmlFor={`feature-list-sort-option-${featureListId}`}>Sort Ordering</label>
        </LabelCell>
        <TableCell variant="body">
          <StyledOptionSelect
            value={featureListSort}
            onChange={handleFeatureListSortChange}
            inputProps={{
              id: `feature-list-sort-option-${featureListId}`,
            }}
          >
            {FEATURELIST_SORT_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </StyledOptionSelect>
        </TableCell>
      </TableRow>
      {hasFeatureLabels ? (
        <>
          <TableRow>
            <LabelCell variant="head" scope="row">
              <label htmlFor={`feature-list-sort-key-${featureListId}`}>Sort Key</label>
            </LabelCell>
            <TableCell variant="body">
              <StyledOptionSelect
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
              </StyledOptionSelect>
            </TableCell>
          </TableRow>
          <TableRow>
            <LabelCell variant="head" scope="row">
              <label htmlFor={`feature-list-show-alternative-ids-${featureListId}`}>Show Alternate IDs</label>
            </LabelCell>
            <InputCell variant="body">
              <Checkbox
                checked={showFeatureTable}
                onChange={handleShowTableChange}
                name="feature-list-show-table"
                color="default"
                inputProps={{
                  'aria-label': 'Show or hide alternative feature ids',
                  id: `feature-list-show-alternative-ids-${featureListId}`,
                }}
              />
            </InputCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
