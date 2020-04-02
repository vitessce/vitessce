/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useCallback, useState } from 'react';
import uuidv4 from 'uuid/v4';
import union from 'lodash/union';
import difference from 'lodash/difference';

export default function SelectableTable(props) {
  const {
    columns,
    data,
    rowKey,
    onChange,
    allowMultiple = false,
    allowUncheck = false,
    showTableHead = true,
  } = props;

  const [selectedRows, setSelectedRows] = useState([]);

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

  const getRowObjectsFromKeys = useCallback(keyValues => keyValues.map(keyValue => ({
    key: keyValue,
    data: data.find(item => item[rowKey] === keyValue),
  })), [data, rowKey]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!onChange) {
      return;
    }
    const selectedRowData = getRowObjectsFromKeys(selectedRows);
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
                key={item[rowKey]}
                className={(selectedRows.includes(item[rowKey]) ? 'row-checked' : '')}
              >
                <td className="input-container">
                  <label htmlFor={`${inputUuid}_${item[rowKey]}`}>
                    <input
                      id={`${inputUuid}_${item[rowKey]}`}
                      type="checkbox"
                      className={(allowMultiple ? 'checkbox' : 'radio')}
                      name="selectable-table"
                      value={item[rowKey]}
                      onChange={handleInputChange}
                      checked={selectedRows.includes(item[rowKey])}
                    />
                  </label>
                </td>
                {columns.map(column => (
                  <td
                    key={column}
                    onClick={() => onSelectRow(item[rowKey], !selectedRows.includes(item[rowKey]))}
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
