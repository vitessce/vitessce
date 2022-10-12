import React, { useEffect, useState } from 'react';
import every from 'lodash/every';
import { makeStyles } from '@material-ui/core/styles';
import { SelectableTable } from './selectable-table/index';

const useStyles = makeStyles(theme => ({
  searchBar: {
    marginBottom: '.25rem',
    border: '0',
    padding: '2px',
    borderRadius: '2px',
  }
}))

export default function FeatureList(props) {
  const {
    hasColorEncoding,
    geneList = [],
    featureLabelsMap,
    geneSelection = [],
    geneFilter = null,
    setGeneSelection,
    enableMultiSelect,
  } = props;

  const classes = useStyles();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(geneList);

  useEffect(() => {
    const results = geneList
      .filter(gene => (
        gene.toLowerCase().includes(searchTerm.toLowerCase())
        || featureLabelsMap?.get(gene)?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    setSearchResults(results);
  }, [searchTerm, geneList, featureLabelsMap]);

  function onChange(selection) {
    if (setGeneSelection && selection) {
      if (Array.isArray(selection)) {
        if (selection.length > 0 && every(selection, s => s.key)) {
          setGeneSelection(selection.map(s => s.key));
        } else {
          setGeneSelection(null);
        }
      } else if (selection.key) {
        setGeneSelection([selection.key]);
      }
    }
  }

  const data = searchResults
    .filter(gene => (geneFilter ? geneFilter.includes(gene) : true))
    .map(
      gene => ({
        key: gene,
        name: featureLabelsMap?.get(gene) || gene,
        value: (geneSelection ? geneSelection.includes(gene) : false),
      }),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <input
        className={classes.searchBar}
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
      />
      <SelectableTable
        columns={['name']}
        data={data}
        hasColorEncoding={hasColorEncoding}
        idKey="key"
        valueKey="value"
        onChange={onChange}
        allowMultiple={enableMultiSelect}
        allowUncheck={enableMultiSelect}
        showTableHead={false}
      />
    </>
  );
}
