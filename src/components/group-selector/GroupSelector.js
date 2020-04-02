/* eslint-disable */
import React, { useEffect, useCallback } from 'react';
import { SelectableTable } from '../selectable-table';

export default function GroupSelector(props) {

    const { updateSelection } = props;

    return (
        <div className="group-selector">
            <SelectableTable
                columns={["Row", "Column", "Name"]}
                data={[
                    {
                        "Row": "1",
                        "Column": "1",
                        "Name": "Tile 1"
                    },
                    {
                        "Row": "1",
                        "Column": "2",
                        "Name": "Tile 2"
                    },
                    {
                        "Row": "1",
                        "Column": "3",
                        "Name": "Tile 3"
                    },
                    {
                        "Row": "7",
                        "Column": "7",
                        "Name": "Tile 61"
                    },
                    {
                        "Row": "7",
                        "Column": "8",
                        "Name": "Tile 62"
                    },
                    {
                        "Row": "7",
                        "Column": "9",
                        "Name": "Tile 63"
                    }
                ]}
                rowKey="Name"
            />
        </div>
    );
}
