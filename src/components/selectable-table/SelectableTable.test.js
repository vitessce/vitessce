import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import expect from 'expect';
import SelectableTable from './SelectableTable';

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

configure({ adapter: new Adapter() });

describe('SelectableTable.js', () => {
  describe('<SelectableTable />', () => {
    it('renders column values', () => {
      const wrapper = mount(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          idKey={tableIdKey}
          testHeight={500}
          testWidth={500}
        />,
      );
      expect(wrapper.find('.table-row').first().text()).toEqual('XYName');
      // Since the button (although hidden) is also a table-cell, it has a blank string.
      expect(wrapper.find('.table-cell').map(node => node.text())).toEqual(['', 'X1', 'Y1', 'Tile 1', '', 'X1', 'Y2', 'Tile 2', '', 'X3', 'Y3', 'Tile 3']);
    });

    it('emits single selected object when allowMultiple is false', (done) => {
      const wrapper = mount(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          idKey={tableIdKey}
          onChange={(selection) => {
            expect(Array.isArray(selection)).toBe(false);
            expect(selection.Name).toEqual('Tile 1');
            done();
          }}
          testHeight={500}
          testWidth={500}
        />,
      );
      wrapper.find('.table-item').first().simulate('click');
    });

    it('emits an array of selected objects when allowMultiple is true', (done) => {
      const wrapper = mount(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          idKey={tableIdKey}
          allowMultiple
          onChange={(selection) => {
            expect(Array.isArray(selection)).toBe(true);
            expect(selection.length).toEqual(1);
            expect(selection[0].Name).toEqual('Tile 2');
            done();
          }}
          testHeight={500}
          testWidth={500}
        />,
      );
      wrapper.find('.table-item').at(1).simulate('click');
    });
  });
});
