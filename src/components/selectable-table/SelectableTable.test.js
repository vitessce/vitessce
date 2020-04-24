import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure, mount } from 'enzyme';
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

function assertElementHasText(wrapper, query, text) {
  expect(wrapper.find(query).text()).toEqual(text);
}

function assertElementContainsText(wrapper, query, text) {
  expect(wrapper.find(query).text()).toContain(text);
}

describe('SelectableTable.js', () => {
  describe('<SelectableTable />', () => {
    it('renders column values', () => {
      const wrapper = shallow(
        <SelectableTable
          data={tableData}
          columns={tableColumns}
          idKey={tableIdKey}
        />,
      );
      assertElementHasText(wrapper, '.selectable-table thead', 'XYName');
      assertElementContainsText(wrapper, '.selectable-table tbody', 'X1Y1Tile 1');
      assertElementContainsText(wrapper, '.selectable-table tbody', 'X1Y2Tile 2');
      assertElementContainsText(wrapper, '.selectable-table tbody', 'X3Y3Tile 3');
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
        />,
      );
      wrapper.find('.selectable-table tbody tr td').at(1).simulate('click');
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
        />,
      );
      wrapper.find('.selectable-table tbody tr td').at(5).simulate('click');
    });
  });
});
