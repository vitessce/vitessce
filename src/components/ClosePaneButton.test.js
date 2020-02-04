import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount, shallow } from 'enzyme';
import expect from 'expect';
import ClosePaneButton from './ClosePaneButton';

configure({ adapter: new Adapter() });

describe('<ClosePaneButton />', () => {
  it('renders a button', () => {
    const wrapper = shallow(<ClosePaneButton />);
    expect(wrapper.find('button').length).toEqual(1);
  });

  it('calls on the parent removeGridComponent', () => {
    let calledMockFlag = false;
    const mockRemoveGridComponent = () => { calledMockFlag = !calledMockFlag; return null; };
    const parentDiv = document.createElement('div');
    parentDiv.setAttribute('id', 'parent-container');
    document.body.appendChild(parentDiv);
    const wrapper = mount(<div id="mock-grid-item"><div><ClosePaneButton removeGridComponent={mockRemoveGridComponent} /></div></div>,
      { attachTo: document.getElementById('parent-container') });
    wrapper.find('button').props().onClick();
    expect(calledMockFlag).toEqual(true);
  });
});
