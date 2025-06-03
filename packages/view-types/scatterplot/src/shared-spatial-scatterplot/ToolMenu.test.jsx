import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { IconTool, IconButton } from './ToolMenu.js';

describe('ToolMenu.js', () => {
  describe('<IconTool />', () => {
    it('renders with title attribute', () => {
      const { container } = render(<IconTool isActive alt="Lasso" />);
      expect(container.querySelectorAll('[title="Lasso"]').length).toEqual(1);
    });
  });

  describe('<IconButton />', () => {
    it('renders with title attribute', () => {
      const { container } = render(<IconButton alt="click to recenter" />);
      expect(container.querySelectorAll('[title="click to recenter"]').length).toEqual(1);
    });
  });
});
