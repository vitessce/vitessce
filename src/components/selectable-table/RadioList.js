import React from 'react';
import SelectableTable from './SelectableTable';

/**
 * A list of styled radio buttons.
 * Implemented as a wrapper around the `SelectableTable` component.
 * @prop {object[]} data An array of objects with the properties `name` and `value`.
 * @prop {function} onChange Callback function, passed a selection object when
 * the selection has changed (or `null` if `allowUncheck` is true).
 * @prop {boolean} allowUncheck Allow radio buttons to be un-selected? By default, false.
 */
export default function RadioList(props) {
  const {
    data,
    onChange,
    allowUncheck = false,
  } = props;

  const columns = ['name'];

  return (
    <div className="radio-list">
      <SelectableTable
        columns={columns}
        data={data}
        idKey="name"
        valueKey="value"
        onChange={onChange}
        allowUncheck={allowUncheck}
        showTableHead={false}
      />
    </div>
  );
}
