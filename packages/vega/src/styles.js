import { css, GlobalStyles } from '@emotion/react';

export const globalVegaTooltipStyle = css(({ theme }) => ({
  '#vg-tooltip-element.vg-tooltip.custom-theme': {
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    padding: '0px',
    backgroundColor: theme.palette.gridLayoutBackground,
    color: theme.palette.secondaryForeground,
    border: 'none',
    opacity: 0.9,
    fontSize: '12px',
    borderRadius: '4px',
    '& > div': {
      backgroundColor: 'transparent',
    },
  },
}));

export const GlobalVegaTooltipStyle = () => (
  <GlobalStyles styles={globalVegaTooltipStyle} />
);
