import React from 'react';

export default function Genes(props) {
  const { genes } = props;
  const list = genes ? genes.map(geneId => <p key={geneId}>{geneId}</p>) : [];
  return (<React.Fragment>{list}</React.Fragment>);
}
