import React, { useEffect, useState } from 'react';
import { SelectableTable } from '../selectable-table/index';

export default function Genes(props) {
  const {
    hasColorEncoding,
    geneList = [],
    geneSelection = [],
    geneFilter = null,
    setGeneSelection,
    enableToggling,
  } = props;

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(geneList);

  useEffect(() => {
    const results = geneList
      .filter(gene => gene.toLowerCase().includes(searchTerm.toLowerCase()));
    setSearchResults(results);
  }, [searchTerm, geneList]);

  function onChange(selection) {
    if (setGeneSelection && selection && Array.isArray(selection)) {
      setGeneSelection(selection.map(s => s.name));
    }
  }

  const data = searchResults
    .filter(gene => (geneFilter ? geneFilter.includes(gene) : true))
    .sort((a, b) => a.localeCompare(b))
    .map(
      gene => ({ name: gene, value: (geneSelection ? geneSelection.includes(gene) : false) }),
    );

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <input
        className="search-bar"
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
      />
      <SelectableTable
        columns={['name']}
        data={data}
        hasColorEncoding={hasColorEncoding}
        idKey="name"
        valueKey="value"
        onChange={onChange}
        allowMultiple="shift+click"
        allowUncheck={enableToggling}
        showTableHead={false}
      />
    </>
  );
}
