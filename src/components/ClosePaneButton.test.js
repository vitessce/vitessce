import React from 'react';
import uuidv4 from 'uuid/v4';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount, shallow } from 'enzyme';
import expect from 'expect';
import ClosePaneButton from './ClosePaneButton';

configure({ adapter: new Adapter() });

describe('<ClosePaneButton />', () => {
  // https://github.com/airbnb/enzyme/issues/1155,
  // issues with test library selecting ids starting with digits
  const mockId = `i${uuidv4()}`;
  it('renders a button', () => {
    const wrapper = shallow(<ClosePaneButton gridItemId={mockId} />);
    expect(wrapper.find('button').length).toEqual(1);
  });

  it('removes element with matching id', () => {
    const parentDiv = document.createElement('div');
    parentDiv.setAttribute('id', 'parent-container');
    document.body.appendChild(parentDiv);
    const wrapper = mount(<div id="mock-grid-item"><div id={mockId}><ClosePaneButton gridItemId={mockId} /></div></div>,
      { attachTo: document.getElementById('parent-container') });
    wrapper.find('button').props().onClick();
    expect(document.getElementById('mock-grid-item')).toBe(null);
  });
});