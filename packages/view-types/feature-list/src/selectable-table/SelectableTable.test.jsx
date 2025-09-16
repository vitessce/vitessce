import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectableTable from './SelectableTable.js';

const user = userEvent.setup();

const tableData = [
  {
    X: 'X1',
    Y: 'Y1',
    Name: 'Tile 1',
  },
  {
    X: 'X1',
    Y: 'Y2',
    Name: 'Tile 2',
  },
  {
    X: 'X3',
    Y: 'Y3',
    Name: 'Tile 3',
  },
];
const tableIdKey = 'Name';
const tableColumns = [
  'X',
  'Y',
  'Name',
];
const columnLabels = ['Label 1', 'Label 2', 'Name'];

describe('SelectableTable.js', () => {
  describe('<SelectableTable />', () => {
    it('renders column values', async () => {
      render(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          columnLabels={columnLabels}
          idKey={tableIdKey}
          testHeight={500}
          testWidth={500}
        />,
      );
      expect(await screen.findByText('Label 1'));
      expect(await screen.findByText('Label 2'));
      expect(await screen.findByText('Name'));
      // Since the button (although hidden) is also a table-cell, it has a blank string.
      expect(await screen.findAllByText('X1'));
      expect(await screen.findByText('Y2'));
      expect(await screen.findByText('Tile 3'));
    });

    it('emits single selected object when allowMultiple is false', async () => {
      const p = new Promise((resolve) => {
        render(
          <SelectableTable
            data={tableData}
            columns={tableColumns}
            columnLabels={columnLabels}
            idKey={tableIdKey}
            onChange={(selection) => {
              expect(Array.isArray(selection)).toBe(false);
              expect(selection.Name).toEqual('Tile 1');
              resolve();
            }}
            testHeight={500}
            testWidth={500}
          />,
        );
        screen.findByText('Tile 1').then((row) => {
          user.click(row);
        });
      });
      await p;
    });

    it('emits an array of selected objects when allowMultiple is true', async () => {
      const p = new Promise((resolve) => {
        render(
          <SelectableTable
            data={tableData}
            columns={tableColumns}
            columnLabels={columnLabels}
            idKey={tableIdKey}
            allowMultiple
            onChange={(selection) => {
              expect(Array.isArray(selection)).toBe(true);
              expect(selection.length).toEqual(1);
              expect(selection[0].Name).toEqual('Tile 2');
              resolve();
            }}
            testHeight={500}
            testWidth={500}
          />,
        );
        screen.findByText('Tile 2').then((row) => {
          user.click(row);
        });
      });
      await p;
    });

    it('renders single column values', async () => {
      const customTableColumns = [
        'Name',
      ];
      const customColumnLabels = ['Name'];

      render(
        <SelectableTable
          data={tableData}
          columns={customTableColumns}
          columnLabels={customColumnLabels}
          idKey={tableIdKey}
          testHeight={500}
          testWidth={500}
        />,
      );
      // write an expect statement to check that Label 1 is not rendered
      const label1 = screen.queryByText('Label 1');
      const label2 = screen.queryByText('Label 2');
      const X1 = screen.queryByText('X1');
      const Y2 = screen.queryByText('Y2');

      expect(label1).toBeNull();
      expect(label2).toBeNull();
      expect(X1).toBeNull();
      expect(Y2).toBeNull();

      expect(await screen.findByText('Tile 3'));
      expect(await screen.findByText('Name'));
    });
  });
});
