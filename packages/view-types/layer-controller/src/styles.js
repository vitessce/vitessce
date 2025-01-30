import { styled } from '@mui/material-pigment-css';
import Grid from '@mui/material-pigment-css/Grid';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';

export const Span = styled('span')({
  width: '70px',
  textAlign: 'center',
  paddingLeft: '2px',
  paddingRight: '2px',
});

export const ValueLabel = styled('span')(({ theme }) => ({
  marginTop: '7px',
  '& span': {
    color: theme.palette.secondaryForeground, // Change color here
    backgroundColor: theme.palette.secondaryBackgroundDim, // Change color here
  },
}));

export const SelectRoot = styled('div')({
  padding: 0,
  height: 'auto',
  margin: '4px 0',
  fontSize: '14px',
  width: '100%',
});

const LayerControllerStyles = {
  width: '100%',
  flexDirection: 'column',
  padding: '0px 8px',
};

export const LayerControllerPaper = styled(Paper)(LayerControllerStyles);

export const LayerControllerAccordion = styled(Accordion)(LayerControllerStyles);

export const LayerControllerGrid = styled(Grid)({
  marginTop: '10px',
});

export const AccordionDetailsRoot = styled('div')({
  width: '100%',
  flexDirection: 'column',
  padding: '8px 8px 24px 8px',
});

export const AccordionSummaryRoot = styled('div')({
  padding: '0px 8px',
});

export const AccordionContent = styled('div')({
  margin: '4px 0px',
  minWidth: '0px',
});

export const AccordionExpanded = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(-3),
  top: theme.spacing(-1),
}));

export const AccordionExpandIcon = styled('div')(({ theme }) => ({
  '&$expanded': {
    top: theme.spacing(-1.3),
  },
}));

export const InputLabelRoot = styled('div')({
  fontSize: '14px',
});

export const OverflowEllipsisGridItem = styled(Grid)({
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const SelectionSliderRoot = styled('div')({
  marginTop: '7px',
});

export const MarkActive = styled('div')({
  backgroundColor: 'rgba(128, 128, 128, 0.7)',
});
