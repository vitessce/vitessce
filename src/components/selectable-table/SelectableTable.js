/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useCallback, useState } from 'react';
import uuidv4 from 'uuid/v4';
import union from 'lodash/union';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';

export default function SelectableTable(props) {
  const {
    columns,
    data,
    onChange,
    idKey = 'id',
    valueKey = 'value',
    allowMultiple = false,
    allowUncheck = false,
    showTableHead = true,
  } = props;

  const [selectedRows, setSelectedRows] = useState([]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const initialSelectedRows = data
      .map((d) => {
        if (d[valueKey] !== undefined && d[valueKey]) {
          return d[idKey];
        }
        return null;
      })
      .filter(Boolean);
    if (!isEqual(initialSelectedRows, selectedRows)) {
      setSelectedRows(initialSelectedRows);
    }
  }, [data, idKey, valueKey]);

  const onSelectRow = useCallback((value, checked) => {
    if (!allowMultiple) {
      if (checked) {
        setSelectedRows([value]);
      } else if (!checked && allowUncheck) {
        setSelectedRows([]);
      }
    } else if (checked) {
      setSelectedRows(union(selectedRows, [value]));
    } else if (!checked && allowUncheck) {
      setSelectedRows(difference(selectedRows, [value]));
    }
  }, [allowMultiple, allowUncheck, selectedRows]);

  const handleInputChange = useCallback((event) => {
    const { target } = event;
    const { checked } = target;
    const { value } = target;
    onSelectRow(value, checked);
  }, [onSelectRow]);

  const getRowObjectsFromIds = useCallback(ids => ids.map(id => ({
    [idKey]: id,
    data: data.find(item => item[idKey] === id),
  })), [data, idKey]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!onChange) {
      return;
    }
    const selectedRowData = getRowObjectsFromIds(selectedRows);
    if (!allowMultiple && selectedRows.length === 1) {
      onChange(selectedRowData[0]);
    } else if (!allowMultiple && selectedRows.length === 0) {
      onChange(null);
    } else if (allowMultiple) {
      onChange(selectedRowData);
    }
  }, [selectedRows]);

  const inputUuid = uuidv4();
  return (
    <div className="selectable-table">
      <form>
        <table>
          {showTableHead ? (
            <thead>
              <tr>
                <th />
                {columns.map(column => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {data.map(item => (
              <tr
                key={item[idKey]}
                className={(selectedRows.includes(item[idKey]) ? 'row-checked' : '')}
              >
                <td className="input-container">
                  <label htmlFor={`${inputUuid}_${item[idKey]}`}>
                    <input
                      id={`${inputUuid}_${item[idKey]}`}
                      type="checkbox"
                      className={(allowMultiple ? 'checkbox' : 'radio')}
                      name="selectable-table"
                      value={item[idKey]}
                      onChange={handleInputChange}
                      checked={selectedRows.includes(item[idKey])}
                    />
                  </label>
                </td>
                {columns.map(column => (
                  <td
                    key={column}
                    role="button"
                    onClick={() => onSelectRow(item[idKey], !selectedRows.includes(item[idKey]))}
                  >
                    {item[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  );
}
