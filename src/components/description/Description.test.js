import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import Description from './Description';


configure({ adapter: new Adapter() });

function assertElementHasText(wrapper, query, text) {
  expect(wrapper.find(query).text()).toEqual(text);
}

describe('Description.js', () => {
  describe('<Description />', () => {
    it('shows text', () => {
      const wrapper = shallow(<Description description="Some text" />);
      assertElementHasText(wrapper, '[className="description"]', 'Some text');
    });

    it('shows metadata', () => {
      const layerId = String(0.1234);
      const layerName = 'My layer';
      const metadata = {
        [layerName]: {
          ids: new Set([layerId]),
          metadata: {
            Channels: 4,
            'Pixels Type': 'uint16',
          },
        },
      };
      const wrapper = shallow(<Description metadata={metadata} />);
      assertElementHasText(wrapper, '[className="description"]', 'My layerChannels4Pixels Typeuint16');
    });
  });
});
