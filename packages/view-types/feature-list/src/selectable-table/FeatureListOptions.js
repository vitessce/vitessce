import React from 'react';
import { OptionsContainer, OptionSelect } from '@vitessce/vit-s';
import { TableCell, TableRow } from '@material-ui/core';
import { FEATURELIST_SORT_OPTIONS } from './constants.js';


export default function FeatureListOptions(props) {
  const {
    featureListSort,
    setFeatureListSort,
  } = props;

  function handleSortChange(event){
    setFeatureListSort(event.target.value);
  }


  return (
    <OptionsContainer>
      {/* {children} */}
      <TableRow>
        <TableCell /*className={classes.labelCell}*/ htmlFor="feature-list-sort-option-select">
          Sort features by
        </TableCell>
        <TableCell /*className={classes.inputCell}*/>
          <OptionSelect
            // className={classes.select}
            value={featureListSort}
            onChange={handleSortChange}
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
    </OptionsContainer>
  );
}
