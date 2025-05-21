import React, { useEffect, useState, useMemo } from 'react';
import { every } from 'lodash-es';
import { makeStyles } from '@vitessce/styles';
import { cleanFeatureId } from '@vitessce/utils';
import { SelectableTable } from './selectable-table/index.js';
import { ALT_COLNAME } from './constants.js';

const useStyles = makeStyles()(() => ({
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
    hasFeatureLabels,
    primaryColumnName,
  } = props;

  const { classes } = useStyles();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(geneList);

  // In FeatureListSubscriber, we think in terms of 'featureIndex' and 'featureLabels'.
  // Here in FeatureList, we need to map these to 'key' or 'name' before
  // passing to the SelectableTable component.
  const selectableTableSortKey = (featureListSortKey === 'featureIndex' ? 'key' : 'name');

  useEffect(() => {
    const results = geneList
      .filter(gene => (
        gene.toLowerCase().includes(searchTerm.toLowerCase())
        || featureLabelsMap?.get(gene)
          ?.toLowerCase().includes(searchTerm.toLowerCase())
        || featureLabelsMap?.get(cleanFeatureId(gene))
          ?.toLowerCase().includes(searchTerm.toLowerCase())
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
          name: (
            featureLabelsMap?.get(gene)
            || featureLabelsMap?.get(cleanFeatureId(gene))
            || gene
          ),
          value: (geneSelection ? geneSelection.includes(gene) : false),
        }),
      );

    if (preSortedData && featureListSort === 'alphabetical' && preSortedData.length > 0) {
      return preSortedData.sort(
        (a, b) => a[selectableTableSortKey].localeCompare(b[selectableTableSortKey]),
      );
    }

    return preSortedData;
  }, [featureListSort, selectableTableSortKey, searchResults,
    geneFilter, featureLabelsMap, geneSelection,
  ]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const [columns, columnLabels] = useMemo(() => {
    if (showFeatureTable && hasFeatureLabels) {
      return [
        ['name', 'key'],
        [primaryColumnName, ALT_COLNAME],
      ];
    }
    return [
      ['name'],
      [primaryColumnName],
    ];
  }, [showFeatureTable, primaryColumnName, hasFeatureLabels]);

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
