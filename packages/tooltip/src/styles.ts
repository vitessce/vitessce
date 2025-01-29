import { Paper } from '@mui/material';
import { styled } from '@mui/material-pigment-css';


export const TooltipAnchor = styled('div')(({ theme }) => ({
  opacity: 0.9,
  padding: '5px',
  pointerEvents: 'none',
  backgroundColor: theme.palette.gridLayoutBackground,
  '& table > tbody > tr > th, & table > tbody > tr > td': {
    border: 'none',
    fontSize: '12px',
    lineHeight: 1.43,
    opacity: 0.8,
    outline: 0,
    padding: '0 2px !important',
    textAlign: 'left',
    color: theme.palette.tooltipText,
    backgroundColor: theme.palette.gridLayoutBackground,
  },
  '& table > tr:nth-child(2)': {
    backgroundColor: 'inherit !important',
  },
  '& table': {
    borderCollapse: 'collapse',
    marginBottom: '0px',
  },
}));

export const TooltipContent = styled(Paper)(({ theme }) => ({
  opacity: 0.9,
  padding: '5px',
  pointerEvents: 'none',
  backgroundColor: theme.palette.gridLayoutBackground,
  '& table > tbody > tr > th, & table > tbody > tr > td': {
    border: 'none',
    fontSize: '12px',
    lineHeight: 1.43,
    opacity: 0.8,
    outline: 0,
    padding: '0 2px !important',
    textAlign: 'left',
    color: theme.palette.tooltipText,
    backgroundColor: theme.palette.gridLayoutBackground,
  },
  '& table > tr:nth-child(2)': {
    backgroundColor: 'inherit !important',
  },
  '& table': {
    borderCollapse: 'collapse',
    marginBottom: '0px',
  },
}));
