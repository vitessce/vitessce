import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  description: {
    '& p, details, table': {
      fontSize: '80%',
      opacity: '0.8',
    },
    '& details': {
      marginBottom: '6px',
    },
    '& summary': {
      // TODO(monorepo): lighten color by 10%
      borderBottom: `1px solid ${theme.palette.primaryBackground}`,
      cursor: 'pointer',
    },
  },
  metadataContainer: {
    paddingLeft: '14px',
    '& table': {
      width: '100%',
      '& td, th': {
        outline: 'none',
        padding: '2px 2px',
        maxWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '50%',
      },
      '& tr:nth-child(even)': {
        // TODO(monorepo): lighten color by 5%
        backgroundColor: `1px solid ${theme.palette.primaryBackground}`,
      },
    },
  },
}));

export default function LinkController(props) {
  return (
    <>
      <button>Generate code</button>
      <p>Your code is 1234.</p>
    </>
  )
}
