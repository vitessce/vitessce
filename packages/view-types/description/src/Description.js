import React from 'react';
import { makeStyles } from '@vitessce/styles';
import Markdown from 'react-markdown';
import { DescriptionType } from '@vitessce/constants-internal';

const useStyles = makeStyles()(theme => ({
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
      '& tr:nth-of-type(even)': {
        // TODO(monorepo): lighten color by 5%
        backgroundColor: `1px solid ${theme.palette.primaryBackground}`,
      },
    },
  },
}));

export default function Description(props) {
  const { description, metadata, descriptionType } = props;
  const { classes } = useStyles();
  return (
    <div className={classes.description}>
      {descriptionType && descriptionType === DescriptionType.MARKDOWN
        ? <Markdown>{description}</Markdown> : <p>{description}</p>}
      {metadata && Array.from(metadata.entries())
        .map(([layerIndex, { name: layerName, metadata: metadataRecord }]) => (
          metadataRecord && Object.entries(metadataRecord).length > 0 ? (
            <details key={layerIndex}>
              <summary>{layerName}</summary>
              <div className={classes.metadataContainer}>
                <table>
                  <tbody>
                    {Object.entries(metadataRecord)
                      .map(([key, value]) => (
                        <tr key={key}>
                          <th title={key}>{key}</th>
                          <td title={value}>{value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null))}
    </div>
  );
}
