/* eslint-disable */
import React, { useEffect, useCallback, useState } from 'react';
import union from 'lodash/union';
import difference from 'lodash/difference';

export default function SelectableTable(props) {

    const {
        columns,
        data,
        rowKey,
        onChange = (v) => console.log(v),
        allowMultiple = false,
        allowUncheck = false,
        emitType = "objects",
    } = props;

    console.assert(["objects", "keys"].includes(emitType));

    const [selectedRows, setSelectedRows] = useState([]);

    const onSelectRow = useCallback((value, checked) => {
        if(!allowMultiple) {
            if(checked) {
                setSelectedRows([value]);
            } else if(!checked && allowUncheck) {
                setSelectedRows([]);
            }
        } else {
            if(checked) {
                setSelectedRows(union(selectedRows, [value]));
            } else if(!checked && allowUncheck) {
                setSelectedRows(difference(selectedRows, [value]));
            }
        }
    }, [selectedRows, allowMultiple, setSelectedRows]);

    const handleInputChange = useCallback((event) => {
        const target = event.target;
        const checked = target.checked;
        const value = target.value;
        onSelectRow(value, checked);
    }, [onSelectRow]);

    const getRowObjectsFromKeys = useCallback((keyValues) => {
        return keyValues.map(keyValue => data.find(item => item[rowKey] === keyValue));
    }, [data, rowKey]);

    useEffect(() => {
        const selectedRowData = (emitType === "objects"
            ? getRowObjectsFromKeys(selectedRows)
            : selectedRows
        );
        if(!allowMultiple && selectedRows.length === 1) {
            onChange(selectedRowData[0]);
        } else if(!allowMultiple && selectedRows.length === 0) {
            onChange(null);
        } else if(allowMultiple) {
            onChange(selectedRowData);
        }
    }, [selectedRows, getRowObjectsFromKeys, emitType, allowMultiple, onChange]);

    return (
        <div className="selectable-table">
            <form>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {columns.map(column => (
                                <th key={column}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item[rowKey]}
                                className={(selectedRows.includes(item[rowKey]) ? 'row-checked' : '')}
                            >
                                <td>
                                    <label>
                                        <input
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
