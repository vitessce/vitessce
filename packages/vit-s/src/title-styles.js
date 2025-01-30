import { styled } from '@mui/material-pigment-css';

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.palette.primaryForeground,
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  flexShrink: '0',
}));

export const TitleLeft = styled('div')(({ theme }) => ({
  flexShrink: '1',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const TitleInfo = styled('div')(({ theme }) => ({
  width: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  fontSize: '80% !important',
  opacity: '.8',
  padding: '0 4px',
  justifyContent: 'center',
  lineHeight: '25px !important',
  flexShrink: '1',
  textAlign: 'right !important',
}));

export const TitleButtons = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexGrow: '1',
  flexShrink: '0',
  justifyContent: 'right',
  '& div': {
    display: 'inline-block',
  },
}));

export const Card = styled('div')(({ theme }) => ({
  border: `${theme.cardBorderSize} solid ${theme.palette.cardBorder}`,
  flex: '1 1 auto',
  minHeight: '1px',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '8px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '0',
  wordWrap: 'break-word',
  backgroundClip: 'border-box',
  borderRadius: '4px',
}));

export const NoScrollCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.secondaryBackground,
  color: theme.palette.secondaryForeground,
}));

export const ScrollCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primaryBackground,
  color: theme.palette.primaryForeground,
  '& a': {
    color: theme.palette.primaryForegroundActive,
  },
  overflowY: 'auto',
}));

export const SpatialCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.black,
  color: theme.palette.white,
  '& a': {
    color: theme.palette.white,
  },
}));
