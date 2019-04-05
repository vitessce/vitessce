import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import { DatasetList } from './components';

configure({ adapter: new Adapter() });

describe('app/components.js', () => {
  describe('<DatasetList />', () => {
    it('is empty if configs is empty', () => {
      const wrapper = shallow(<DatasetList configs={[]} />);
      expect(wrapper.find('a').length).toEqual(0);
    });

    it('has one if datasets has one', () => {
      const configs = [{ name: 'foo', id: 'bar', description: 'Foo? Bar!' }];
      const wrapper = shallow(<DatasetList configs={configs} />);
      expect(wrapper.find('a').length).toEqual(1);
    });
  });
});
