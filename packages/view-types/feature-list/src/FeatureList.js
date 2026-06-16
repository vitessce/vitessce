import React, { useState, useMemo } from 'react';
import { makeStyles } from '@vitessce/styles';
import { cleanFeatureId } from '@vitessce/utils';
import { SelectableTable } from './selectable-table/index.js';
import { ALT_COLNAME } from './constants.js';

const useStyles = makeStyles()(() => ({
  searchBar: {
    marginTop: '10px',
    marginLeft: '10px',
    marginRight: '10px',
    marginBottom: '4px',
    border: '0',
    padding: '2px',
    borderRadius: '2px',
  },
}));

export default function FeatureList(props) {
  const {
    width,
    height,
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

  // In FeatureListSubscriber, we think in terms of 'featureIndex' and 'featureLabels'.
  // Here in FeatureList, we need to map these to 'key' or 'name' before
  // passing to the SelectableTable component.
  const selectableTableSortKey = (featureListSortKey === 'featureIndex' ? 'key' : 'name');

  const searchResults = useMemo(() => geneList
    .filter(gene => (
      gene.toLowerCase().includes(searchTerm.toLowerCase())
        || featureLabelsMap?.get(gene)
          ?.toLowerCase().includes(searchTerm.toLowerCase())
        || featureLabelsMap?.get(cleanFeatureId(gene))
          ?.toLowerCase().includes(searchTerm.toLowerCase())
    )), [geneList, searchTerm, featureLabelsMap]);

  function onChange(selection) {
    if (setGeneSelection && selection) {
      const selectedHiddenKeys = (geneSelection || []).filter(
        key => !searchResults.includes(key),
      );
      const selectionArray = Array.isArray(selection)
        ? selection
        : [selection];
      const incomingKeys = selectionArray.map(s => s.key).filter(
        key => searchResults.includes(key),
      );

      let newSelection;
      if (enableMultiSelect) {
        // Find which key was just clicked by diffing against current geneSelection.
        // It's either a newly added key, or if a key was removed, we keep the order as is.
        const currentVisibleSelection = (geneSelection || []).filter(
          key => searchResults.includes(key),
        );
        const addedKey = incomingKeys.find(k => !currentVisibleSelection.includes(k));

        let orderedVisibleKeys;
        if (addedKey) {
          // Keep previous order, move/append the newly clicked key to the end
          // so featureAggregationStrategy:'last' always points to the most recent click.
          orderedVisibleKeys = [
            ...currentVisibleSelection.filter(k => incomingKeys.includes(k) && k !== addedKey),
            addedKey,
          ];
        } else {
          // A key was removed — preserve the existing click order, just drop the removed one
          orderedVisibleKeys = currentVisibleSelection.filter(k => incomingKeys.includes(k));
        }
        // Safety net for any null/undefined values
        newSelection = [...selectedHiddenKeys, ...orderedVisibleKeys].filter(Boolean);
      } else {
        newSelection = incomingKeys.filter(Boolean);
      }

      if (newSelection.length > 0) {
        setGeneSelection(newSelection);
      } else {
        setGeneSelection(null);
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

  return (width > 0 && height > 0) ? (
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
        width={width}
        height={height - 34}
      />
    </>
  ) : null;
}
