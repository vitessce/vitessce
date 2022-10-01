import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { VitessceGridLayout } from './VitessceGridLayout';
afterEach(() => {
    cleanup();
});
function FakeComponent(props) {
    const { text } = props;
    return _jsx("span", { children: text });
}
const layoutJson = {
    columns: {
        600: [0, 2, 4, 8],
    },
    components: [
        { component: 'FakeComponent',
            uid: 'fake',
            props: { text: 'Hello World' },
            x: 0, y: 0, w: 2 },
    ],
};
describe('VitessceGridLayout.js', () => {
    describe('<VitessceGridLayout />', () => {
        it('mount() works', () => {
            const { container } = render(_jsx(VitessceGridLayout, { layout: layoutJson, getComponent: () => FakeComponent, draggableHandle: ".my-handle" }));
            expect(screen.getByText('Hello World'));
            expect(container.querySelectorAll('.react-grid-item span:not(.react-resizable-handle)').length).toEqual(1);
            const style = container.querySelectorAll('style');
            expect(style.length).toEqual(1);
            expect(style[0].textContent).toContain('.my-handle {');
            expect(style[0].textContent).toContain('.my-handle:active {');
        });
        it('rowHeight works', () => {
            const { container } = render(_jsx(VitessceGridLayout, { layout: layoutJson, getComponent: () => FakeComponent, draggableHandle: ".my-handle", rowHeight: 123 }));
            expect(container.querySelector('.react-grid-item').style.height).toEqual('123px');
        });
    });
});
