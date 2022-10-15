import '@testing-library/jest-dom';
import {
  cleanup, findByText, render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';

import SelectableTable from './SelectableTable';

const user = userEvent.setup();

afterEach(() => {
  cleanup();
});

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
const tableColumns = ['X', 'Y', 'Name'];

describe('SelectableTable.js', () => {
  describe('<SelectableTable />', () => {
    it('renders column values', async () => {
      render(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          idKey={tableIdKey}
          testHeight={500}
          testWidth={500}
        />,
      );
      expect(await screen.findByText('Name'));
      // Since the button (although hidden) is also a table-cell, it has a blank string.
      expect(await screen.findAllByText('X1'));
      expect(await screen.findByText('Y2'));
      expect(await screen.findByText('Tile 3'));
    });

    it('emits single selected object when allowMultiple is false', async () => {
      const p = new Promise((resolve, reject) => {
        render(
          <SelectableTable
            data={tableData}
            columns={tableColumns}
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
      const p = new Promise((resolve, reject) => {
        render(
          <SelectableTable
            data={tableData}
            columns={tableColumns}
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
  });
});
