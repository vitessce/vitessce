import React, { useState, useMemo } from 'react';
import { makeStyles, Chip } from '@vitessce/styles';
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
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginLeft: '10px',
    marginRight: '10px',
    marginBottom: '8px',
    maxHeight: '100px',
    overflowY: 'auto',
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
      const selectedVisibleKeys = selectionArray.map(s => s.key).filter(
        key => searchResults.includes(key),
      );

      const newSelection = enableMultiSelect ? (
        [...selectedHiddenKeys, ...selectedVisibleKeys]
          .filter(Boolean)
      ) : selectionArray.map(s => s.key).filter(Boolean);

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

  const handleChipDelete = (geneKey) => {
    if (setGeneSelection) {
      const newSelection = (geneSelection || []).filter(key => key !== geneKey);
      setGeneSelection(newSelection.length > 0 ? newSelection : null);
    }
  };

  const chipsHeight = enableMultiSelect && geneSelection && geneSelection.length > 0 ? 108 : 0;

  return (width > 0 && height > 0) ? (
    <>
      <input
        className={classes.searchBar}
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
      />
      {enableMultiSelect && geneSelection && geneSelection.length > 0 && (
        <div className={classes.chipsContainer}>
          {geneSelection.map(geneKey => (
            <Chip
              key={geneKey}
              label={
                featureLabelsMap?.get(geneKey)
                || featureLabelsMap?.get(cleanFeatureId(geneKey))
                || geneKey
              }
              onDelete={() => handleChipDelete(geneKey)}
              size="small"
            />
          ))}
        </div>
      )}
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
        height={height - 34 - chipsHeight}
      />
    </>
  ) : null;
}
