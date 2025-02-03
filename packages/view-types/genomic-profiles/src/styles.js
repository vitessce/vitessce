/* eslint-disable max-len */
import { styled } from '@mui/material-pigment-css';

export const HiglassTitleWrapper = styled('div')(({ theme }) => ({
  height: 'calc(100% - 20px)',
  '& > div:nth-child(2)': {
    width: 'inherit',
    height: 'inherit',
    padding: '5px',
    backgroundColor: theme.palette.secondaryBackground, // map-get($theme-colors, "secondary-background");
  },
}));

export const HiglassLazyWrapper = styled('div')({
  width: 'inherit',
  height: 'inherit',
});

export const HiglassWrapperParent = styled('div')({
  display: 'block',
  position: 'relative',
  boxSizing: 'border-box',
  fontSize: '12px',
  color: '#333',
  overflow: 'hidden',
});

export const HiglassWrapper = styled('div')({
  width: 'inherit',
  height: 'inherit',
  position: 'relative',
  display: 'block',
  textAlign: 'left',
  boxSizing: 'border-box',
  '> .higlass': {
    width: '100%',
    height: '100%',
  },
  '> .higlass .react-grid-layout': {
    backgroundColor: 'transparent !important',
  },
  '> .higlass nav': {
    display: 'flex',
  },
  '> .higlass input': {
    fontSize: '12px',
  },
  '> .higlass .btn': {
    color: '#999',
    fontSize: '12px',
  },
});

// export const useStyles = makeStyles(theme => ({
//   higlassTitleWrapper: {
//     height: 'calc(100% - 20px)',
//     '& > div:nth-child(2)': {
//       width: 'inherit',
//       height: 'inherit',
//       padding: '5px',
//       backgroundColor: theme.palette.secondaryBackground, // map-get($theme-colors, "secondary-background");
//     },
//   },
//   higlassLazyWrapper: {
//     width: 'inherit',
//     height: 'inherit',
//   },
//   higlassWrapperParent: {
//     display: 'block',
//     position: 'relative',
//     boxSizing: 'border-box',
//     fontSize: '12px',
//     color: '#333',
//     overflow: 'hidden',
//   },
//   higlassWrapper: {
//     width: 'inherit',
//     height: 'inherit',
//     position: 'relative',
//     display: 'block',
//     textAlign: 'left',
//     boxSizing: 'border-box',
//     '@global .higlass': {
//       width: '100%',
//       height: '100%',
//     },
//     '@global .higlass .react-grid-layout': {
//       backgroundColor: 'transparent !important',
//     },
//     '@global .higlass nav': {
//       display: 'flex',
//     },
//     '@global .higlass input': {
//       fontSize: '12px',
//     },
//     '@global .higlass .btn': {
//       color: '#999',
//       fontSize: '12px',
//     },
//   },
// }));

/*
.vitessce-container .higlass-wrapper {
  // https://sass-lang.com/documentation/at-rules/import#nesting
  // https://sass-lang.com/documentation/at-rules/import#importing-css
  @import "../../node_modules/higlass/dist/hglib";
}
*/
