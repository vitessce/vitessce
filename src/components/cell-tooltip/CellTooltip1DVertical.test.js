import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import CellTooltip1DVertical from './CellTooltip1DVertical';
import CellTooltipContent from './CellTooltipContent';

configure({ adapter: new Adapter() });

const fakeHoveredCellInfo = {
  cellId: '123',
  mappings: { xy: [1, 1], tsne: [2, 2] },
  uuid: 1,
  status: 'subcluster: Hippocampus; cluster: Excitatory neurons',
};

describe('CellTooltip1DVertical.js', () => {
  describe('<CellTooltip1DVertical />', () => {
    it('vertical highlight appears if uuid does not match', () => {
      const wrapper = shallow(
        <CellTooltip1DVertical
          hoveredCellInfo={fakeHoveredCellInfo}
          cellIndex={10}
          numCells={10}
          uuid={2}
        >
          {fakeHoveredCellInfo && (
            <CellTooltipContent
              cellId={fakeHoveredCellInfo.cellId}
              factors={fakeHoveredCellInfo.factors}
            />
          )}
        </CellTooltip1DVertical>
      );
      expect(wrapper.find('.cell-emphasis-vertical').length).toEqual(1);
    });

    it('does not appear if uuid does match', () => {
      const wrapper = shallow(
        <CellTooltip1DVertical
          hoveredCellInfo={fakeHoveredCellInfo}
          cellX={10}
          uuid={1}
        >
          {fakeHoveredCellInfo && (
            <CellTooltipContent
              cellId={fakeHoveredCellInfo.cellId}
              factors={fakeHoveredCellInfo.factors}
            />
          )}
        </CellTooltip1DVertical>
      );
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if cellIndex prop was not provided', () => {
      const wrapper = shallow(
        <CellTooltip1DVertical
          hoveredCellInfo={fakeHoveredCellInfo}
          uuid={1}
        >
          {fakeHoveredCellInfo && (
            <CellTooltipContent
              cellId={fakeHoveredCellInfo.cellId}
              factors={fakeHoveredCellInfo.factors}
            />
          )}
        </CellTooltip1DVertical>
      );
      expect(wrapper.find('div').length).toEqual(0);
    });
  });
});
