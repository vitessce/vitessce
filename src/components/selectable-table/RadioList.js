import React from 'react';
import SelectableTable from './SelectableTable';

export default function RadioList(props) {
  const {
    data,
    onChange,
    allowUncheck = false,
  } = props;

  const columns = ['name'];

  return (
    <div className="selectable-radio-table">
      <SelectableTable
        columns={columns}
        data={data}
        idKey="name"
        valueKey="value"
        onChange={onChange}
        allowUncheck={allowUncheck}
        allowMultiple={false}
        showTableHead={false}
      />
    </div>
  );
}
