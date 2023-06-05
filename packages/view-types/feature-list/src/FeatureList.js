import React, { useEffect, useState, useMemo } from 'react';
import { every } from 'lodash-es';
import { makeStyles } from '@material-ui/core';
import { SelectableTable } from './selectable-table/index.js';

const useStyles = makeStyles(() => ({
  searchBar: {
    marginBottom: '4px',
    border: '0',
    padding: '2px',
    borderRadius: '2px',
  },
}));

export default function FeatureList(props) {
  const {
    hasColorEncoding,
    geneList = [],
    featureLabelsMap,
    geneSelection = [],
    geneFilter = null,
    setGeneSelection,
    enableMultiSelect,
    showFeatureTable,
    featureListSort,
    featureListSortKey,
    featureListTableKeys,
    defaultColumnTitle,
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

  const data = useMemo(() => {
    const preSortedData = searchResults
      .filter(gene => (geneFilter ? geneFilter.includes(gene) : true))
      .map(
        gene => ({
          key: gene,
          name: featureLabelsMap?.get(gene) || gene,
          value: (geneSelection ? geneSelection.includes(gene) : false),
        }),
      );

    if (preSortedData && featureListSortKey && featureListSort === 'alphabetical' && preSortedData.length > 0) {
      return preSortedData.sort((a, b) => a[featureListSortKey].localeCompare(b[featureListSortKey]));
    }

    return preSortedData;
  }, [
    featureListSort,
    featureListSortKey,
    searchResults,
    geneFilter,
    featureLabelsMap,
    geneSelection,
  ]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };


  let columns = Object.keys(featureListTableKeys);
  let columnLabels = Object.values(featureListTableKeys);

  if (!showFeatureTable) {
    columns = [defaultColumnTitle];
    columnLabels = [featureListTableKeys[defaultColumnTitle]];
  }

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
        columns={columns}
        columnLabels={columnLabels}
        data={data}
        hasColorEncoding={hasColorEncoding}
        idKey="key"
        valueKey="value"
        onChange={onChange}
        allowMultiple={enableMultiSelect}
        allowUncheck={enableMultiSelect}
        showTableHead={columnLabels.length > 1}
      />
    </>
  );
}
