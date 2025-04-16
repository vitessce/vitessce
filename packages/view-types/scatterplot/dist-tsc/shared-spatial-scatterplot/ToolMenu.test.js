import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { IconTool, IconButton } from './ToolMenu.js';
afterEach(() => {
    cleanup();
});
describe('ToolMenu.js', () => {
    describe('<IconTool />', () => {
        it('renders with title attribute', () => {
            const { container } = render(_jsx(IconTool, { isActive: true, alt: "Lasso" }));
            expect(container.querySelectorAll('[title="Lasso"]').length).toEqual(1);
        });
    });
    describe('<IconButton />', () => {
        it('renders with title attribute', () => {
            const { container } = render(_jsx(IconButton, { alt: "click to recenter" }));
            expect(container.querySelectorAll('[title="click to recenter"]').length).toEqual(1);
        });
    });
});
