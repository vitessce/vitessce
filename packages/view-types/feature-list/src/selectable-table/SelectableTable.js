/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */
import React, { useEffect, useCallback, useState } from 'react';
import { AutoSizer, Table } from 'react-virtualized';
import { v4 as uuidv4 } from 'uuid';
import { union, difference, isEqual } from 'lodash-es';
import clsx from 'clsx';
import { useStyles } from './styles.js';

const SHIFT_KEYCODE = 16;

/**
 * A table with "selectable" rows.
 * @prop {string[]} columns An array of column names, corresponding to data object properties.
 * @prop {string[]} columnLabels An array of labels to be used for the columns, corresponding to `columns`.
 * columnLabels.length must be equal to columns.length.
 * @prop {object[]} data An array of data objects used to populate table rows.
 * @prop {function} onChange Callback function,
 * passed a selection object when `allowMultiple` is false (and `null` if `allowUncheck` is true),
 * or passed an array of selection objects when `allowMultiple` is true.
 * @prop {string} idKey The key for a unique identifier property of `data` objects.
 * @prop {string} valueKey If initially-selected rows are required,
 * this key specifies a boolean property of the `data` objects
 * indicating those rows that should be initially selected.
 * @prop {boolean} allowMultiple Whether to allow multiple rows to be selected.
 * @prop {boolean} allowUncheck Whether to allow selected rows to be un-checked. By default, false.
 * @prop {boolean} showTableHead Whether to show the table header element. By default, true.
 * @prop {boolean} showTableInputs Whether to show the table input elements for each row.
 * By default, false.
 */
export default function SelectableTable(props) {
  const {
    hasColorEncoding,
    columns,
    columnLabels,
    data,
    onChange,
    idKey = 'id',
    valueKey = 'value',
    allowMultiple = false,
    allowUncheck = false,
    showTableHead = true,
    showTableInputs = false,
    testHeight = undefined,
    testWidth = undefined,
  } = props;

  const [selectedRows, setSelectedRows] = useState(null);
  const [isCheckingMultiple, setIsCheckingMultiple] = useState(false);

  // Enable selecting multiple rows while the shift key is down.
  useEffect(() => {
    function onKeyDown(event) {
      if (allowMultiple && event.keyCode === SHIFT_KEYCODE) {
        setIsCheckingMultiple(true);
      }
    }

    function onKeyUp(event) {
      if (allowMultiple && event.keyCode === SHIFT_KEYCODE) {
        setIsCheckingMultiple(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [allowMultiple]);

  // Callback function to update the `selectedRows` state.
  const onSelectRow = useCallback((value, checked) => {
    if (checked || allowUncheck) {
      if (!isCheckingMultiple
        && (checked || (!checked && allowMultiple && selectedRows.length > 1))
      ) {
        setSelectedRows([value]);
      } else if (!allowMultiple && !checked) {
        setSelectedRows([]);
      } else {
        setSelectedRows(
          checked
            ? union(selectedRows || [], [value])
            : difference(selectedRows || [], [value]),
        );
      }
    }
  }, [allowMultiple, isCheckingMultiple, allowUncheck, selectedRows]);

  // Handler for checkbox input elements.
  const handleInputChange = useCallback((event) => {
    const { target } = event;
    const { checked } = target;
    const { value } = target;
    onSelectRow(value, checked);
  }, [onSelectRow]);

  // Function to map row IDs to corresponding objects
  // to pass to the `onChange` callback.
  const getDataFromIds = useCallback(ids => ids.map(id => ({
    [idKey]: id,
    data: data.find(item => item[idKey] === id),
  })), [data, idKey]);

  // Function to check if a row ID has been selected.
  const isSelected = useCallback(id => (
    Array.isArray(selectedRows) && selectedRows.includes(id)
  ), [selectedRows]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Check whether an initial set of rows should be selected.
    const initialSelectedRows = data
      .map((d) => {
        if (d[valueKey]) {
          return d[idKey];
        }
        return null;
      })
      .filter(Boolean);
    if (!isEqual(initialSelectedRows, selectedRows)) {
      if (initialSelectedRows.length > 0) {
        setSelectedRows(initialSelectedRows);
      } else {
        setSelectedRows(null);
      }
    }
  }, [data, idKey, valueKey]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Call the `onChange` prop function with an updated row or set of rows.
    if (!onChange || !selectedRows) {
      return;
    }
    const selectedRowData = getDataFromIds(selectedRows);
    if (allowMultiple) {
      onChange(selectedRowData);
    } else if (selectedRows.length === 1) {
      onChange(selectedRowData[0]);
    } else if (selectedRows.length === 0) {
      onChange(null);
    }
  }, [selectedRows, allowMultiple]);

  const { classes } = useStyles();

  // Generate a unique ID to use in (for, id) label-input pairs.
  const inputUuid = uuidv4();

  const rowRenderer = ({ index, style }) => (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      key={data[index][idKey]}
      className={clsx(classes.tableItem, classes.tableRow, { 'row-checked': isSelected(data[index][idKey]) })}
      style={style}
      role="button"
      onClick={() => onSelectRow(
        data[index][idKey],
        !isSelected(data[index][idKey]) || !hasColorEncoding,
      )}
    >
      <div className={clsx(classes.inputContainer, classes.tableCell, { [classes.hiddenInputColumn]: !showTableInputs })}>
        <label htmlFor={`${inputUuid}_${data[index][idKey]}`}>
          <input
            id={`${inputUuid}_${data[index][idKey]}`}
            type="checkbox"
            className={clsx(classes.radioOrCheckbox, isCheckingMultiple ? classes.tableCheckbox : classes.tableRadio)}
            name={inputUuid}
            value={data[index][idKey]}
            onChange={handleInputChange}
            checked={isSelected(data[index][idKey])}
          />
        </label>
      </div>
      {columns.map(column => (
        <div
          className={classes.tableCell}
          key={column}
        >
          {data[index][column]}
        </div>
      ))}
    </div>
  );

  const headerRowRenderer = ({ style }) => (
    <div className={classes.tableRow} style={style}>
      {columnLabels.map(columnLabel => (<div key={columnLabel} className={classes.tableCell} style={{ fontWeight: 'bold' }}>{columnLabel}</div>))}
    </div>
  );

  return (
    <div className={classes.selectableTable}>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            height={testHeight || height}
            gridStyle={{ outline: 'none' }}
            rowCount={data.length}
            // 24 is 1 em + padding in either direction (see _selectable_table.scss).
            rowHeight={24}
            headerHeight={showTableHead ? 24 : undefined}
            rowRenderer={rowRenderer}
            width={testWidth || width}
            headerRowRenderer={showTableHead ? headerRowRenderer : undefined}
            rowGetter={({ index }) => data[index]}
          />
        )}
      </AutoSizer>
    </div>
  );
}
