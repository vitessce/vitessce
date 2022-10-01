import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import VitessceGrid from './VitessceGrid';
import { ViewConfigProvider, createViewConfigStore, AuxiliaryProvider, createAuxiliaryStore, } from './state/hooks';
afterEach(() => {
    cleanup();
});
describe('VitessceGrid.js', () => {
    describe('<VitessceGrid />', () => {
        it('renders', () => {
            const config = {
                version: '1.0.0',
                description: 'fake description',
                datasets: [],
                name: 'fake name',
                layout: [
                    {
                        component: 'FakeComponent',
                        props: { description: 'fake prop description' },
                        uid: 'A',
                        x: 0,
                        y: 0,
                    },
                ],
            };
            function FakeComponent() {
                return _jsx("p", { children: "FakeComponent!" });
            }
            const getComponent = () => FakeComponent;
            render(_jsx(ViewConfigProvider, { createStore: createViewConfigStore, children: _jsx(AuxiliaryProvider, { createStore: createAuxiliaryStore, children: _jsx(VitessceGrid, { config: config, getComponent: getComponent }) }) }));
            expect(screen.getByText('FakeComponent!'));
        });
    });
});
