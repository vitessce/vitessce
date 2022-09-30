/* eslint-disable max-len */
// import React from 'react';
// import Adapter from 'enzyme-adapter-react-16';
// import { mount, configure } from 'enzyme';
// import Ajv from 'ajv';
// import expect from 'expect';
// import Vitessce from './Vitessce';
// import { configs } from './api';
// import configSchema from '../schemas/config.schema.json';

// configure({ adapter: new Adapter() });

// describe('Vitessce.js', () => {
//   describe('<Vitessce />', () => {
//     it('Produces valid view config', (done) => {
//       const config = configs['linnarsson-2018'];
//       let updatedConfig = {};
//       // eslint-disable-next-line no-return-assign
//       const wrapper = mount(<Vitessce config={config} onConfigChange={c => updatedConfig = c} />);
//       setTimeout(() => {
//         // Simulate usage of some of the app
//         wrapper.find('[id^="deckgl-overlay-"]').at(0).simulate('wheel', { deltaY: 1000, deltaX: 1000 });
//         wrapper.find('[id^="deckgl-overlay-"]').at(1).simulate('wheel', { deltaY: 1000, deltaX: 1000 });
//         wrapper.find('[id^="deckgl-overlay-"]').at(2).simulate('wheel', { deltaY: 1000, deltaX: 1000 });
//         const validate = new Ajv().compile(configSchema);
//         const valid = validate(updatedConfig);
//         if (!valid) {
//           const failureReason = JSON.stringify(validate.errors, null, 2);
//           console.error(failureReason);
//         }
//         expect(valid).toEqual(true);
//         wrapper.unmount();
//         done();
//       }, 20000);
//     }).timeout(30000);
//   });
// });
