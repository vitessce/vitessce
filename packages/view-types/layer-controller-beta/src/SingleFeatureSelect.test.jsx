import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SingleFeatureSelect } from './SingleFeatureSelect.js';

const LABEL = 'Select the feature used for colormap-based coloring';
const featureSelection = ['CD4', 'CD8', 'MS4A1'];

describe('SingleFeatureSelect.js', () => {
  describe('<SingleFeatureSelect />', () => {
    it('shows the first feature when the strategy is null', () => {
      render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy={null}
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      expect(screen.getByLabelText(LABEL).value).toEqual('CD4');
    });

    it('shows the feature referred to by name or by index', () => {
      const { rerender } = render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy="MS4A1"
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      expect(screen.getByLabelText(LABEL).value).toEqual('MS4A1');
      rerender(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy={1}
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      expect(screen.getByLabelText(LABEL).value).toEqual('CD8');
    });

    it('shows strategies that combine features', () => {
      render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy="mean"
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      expect(screen.getByLabelText(LABEL).value).toEqual('mean');
    });

    it('only offers the difference strategy for exactly two features', () => {
      const { rerender } = render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy="difference"
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      // With three features, difference falls back to the first feature.
      expect(screen.queryByRole('option', { name: /Difference/ })).toBeNull();
      expect(screen.getByLabelText(LABEL).value).toEqual('CD4');
      rerender(
        <SingleFeatureSelect
          featureSelection={['CD4', 'CD8']}
          featureAggregationStrategy="difference"
          setFeatureAggregationStrategy={() => {}}
        />,
      );
      expect(screen.getByRole('option', { name: 'Difference (CD4 − CD8)' })).toBeDefined();
      expect(screen.getByLabelText(LABEL).value).toEqual('difference');
    });

    it('sets the strategy to the selected combination', () => {
      const setFeatureAggregationStrategy = vi.fn();
      render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy={null}
          setFeatureAggregationStrategy={setFeatureAggregationStrategy}
        />,
      );
      fireEvent.change(screen.getByLabelText(LABEL), { target: { value: 'sum' } });
      expect(setFeatureAggregationStrategy).toHaveBeenCalledWith('sum');
    });

    it('refers to features with reserved names by index', () => {
      const setFeatureAggregationStrategy = vi.fn();
      render(
        <SingleFeatureSelect
          featureSelection={['CD4', 'mean']}
          featureAggregationStrategy={1}
          setFeatureAggregationStrategy={setFeatureAggregationStrategy}
        />,
      );
      expect(screen.getByLabelText(LABEL).value).toEqual('feature-index-1');
      fireEvent.change(screen.getByLabelText(LABEL), { target: { value: 'mean' } });
      expect(setFeatureAggregationStrategy).toHaveBeenCalledWith('mean');
      fireEvent.change(screen.getByLabelText(LABEL), { target: { value: 'feature-index-1' } });
      expect(setFeatureAggregationStrategy).toHaveBeenCalledWith(1);
    });

    it('sets the strategy to the selected feature name', () => {
      const setFeatureAggregationStrategy = vi.fn();
      render(
        <SingleFeatureSelect
          featureSelection={featureSelection}
          featureAggregationStrategy={null}
          setFeatureAggregationStrategy={setFeatureAggregationStrategy}
        />,
      );
      fireEvent.change(screen.getByLabelText(LABEL), { target: { value: 'CD8' } });
      expect(setFeatureAggregationStrategy).toHaveBeenCalledWith('CD8');
    });
  });
});
