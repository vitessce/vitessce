import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { PluginViewType } from '@vitessce/plugins';
import VitessceGrid from './VitessceGrid.js';
import { ViewConfigProvider, createViewConfigStore, AuxiliaryProvider, createAuxiliaryStore, } from './state/hooks.js';
afterEach(() => {
    cleanup();
});
describe('VitessceGrid.js', () => {
    describe('<VitessceGrid />', () => {
        it('renders', async () => {
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
            function createViewConfigStoreClosure() {
                return createViewConfigStore(null, config);
            }
            function FakeComponent() {
                return _jsx("p", { children: "FakeComponent!" });
            }
            const viewTypes = [new PluginViewType('FakeComponent', FakeComponent, [])];
            const fileTypes = [];
            const coordinationTypes = [];
            render(_jsx(ViewConfigProvider, { createStore: createViewConfigStoreClosure, children: _jsx(AuxiliaryProvider, { createStore: createAuxiliaryStore, children: _jsx(VitessceGrid, { success: true, configKey: null, config: config, viewTypes: viewTypes, fileTypes: fileTypes, coordinationTypes: coordinationTypes }) }) }));
            expect(await screen.findByText('FakeComponent!'));
        });
    });
});
