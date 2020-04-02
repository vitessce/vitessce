import React from 'react';
import SelectableTable from './SelectableTable';

export default function RadioTable(props) {
  const {
    columns,
    data,
    rowKey,
    onChange,
  } = props;

  return (
    <div className="selectable-radio-table">
      <SelectableTable
        columns={columns}
        data={data}
        rowKey={rowKey}
        onChange={onChange}
        allowMultiple={false}
        allowUncheck={false}
        showTableHead={false}
      />
    </div>
  );
}
