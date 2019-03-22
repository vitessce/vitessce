import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import expect from 'expect';
import Heatmap from './Heatmap';

configure({ adapter: new Adapter() });

describe('Heatmap.js', () => {
  describe('<Heatmap />', () => {
    it('has 3 canvases', () => {
      const wrapper = mount(
        <Heatmap
          clusters={{ cols: {}, rows: {}, matrix: {} }}
          selectedCellIds={{}}
          cellColors={{}}
        />,
      );
      expect(wrapper.find('canvas').length).toEqual(3);
    });
  });
});
