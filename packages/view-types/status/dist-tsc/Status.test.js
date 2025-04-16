import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import Status from './Status.js';
afterEach(() => {
    cleanup();
});
describe('Status.js', () => {
    describe('<Status />', () => {
        it('shows warning', async () => {
            render(_jsx(Status, { warn: "WARN" }));
            expect(await screen.findByText('WARN'));
        });
        it('shows info', async () => {
            render(_jsx(Status, { info: "INFO" }));
            expect(await screen.findByText('INFO'));
            // The warning also has the "details" class, among others,
            // so ".details" is not sufficient.
        });
        it('shows both', async () => {
            render(_jsx(Status, { info: "INFO", warn: "WARN" }));
            expect(await screen.findByText('INFO'));
            expect(await screen.findByText('WARN'));
        });
    });
});
