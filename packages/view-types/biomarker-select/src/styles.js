import { makeStyles } from '@vitessce/styles';

export const useStyles = makeStyles()(() => ({
  header: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  fullWidthBox: {
    width: '100%',
  },
  selectButton: {
    position: 'absolute',
    right: 0,
  },
  accordion: {
    width: '100%',
    margin: '0 !important',
  },
  accordionDetails: {
    paddingTop: 0,
  },
  cartUl: {
    marginTop: 0,
    marginBottom: 0,
  },
  selectInput: {
    height: 'auto !important',
  },
  searchInput: {
    lineHeight: 'initial',
    height: 'auto !important',
  },
}));
