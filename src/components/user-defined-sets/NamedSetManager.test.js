import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import NamedSetManager from './NamedSetManager';
import * as Sets from './sets';

configure({ adapter: new Adapter() });

describe('NamedSetManager.js', () => {
  describe('<NamedSetManager />', () => {
    it('renders name and edit button when not editing', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', [1, 2, 3]);
      const wrapper = shallow(<NamedSetManager sets={setsState} name="test" />);
      expect(wrapper.find('input').length).toEqual(0);
    });

    it('renders input when editing', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', [1, 2, 3]);
      const wrapper = shallow(<NamedSetManager sets={setsState} name="test" />);
      const button = wrapper.find('button.edit-button');
      button.simulate('click', {});
      wrapper.update();
      expect(wrapper.find('input').length).toEqual(1);
    });

    it('selects a set when its select button is clicked', (done) => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', [1, 2, 3]);
      const onUpdateSets = (sets) => {
        expect(sets.currentSet.length).toEqual(3);
        done();
      };
      const wrapper = shallow(<NamedSetManager sets={setsState} name="test" onUpdateSets={onUpdateSets} />);
      const button = wrapper.find('button.select-button');
      button.simulate('click', {});
      wrapper.update();
    });
  });
});
