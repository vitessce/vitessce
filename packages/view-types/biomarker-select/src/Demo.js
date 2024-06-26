import React, { useState, useCallback } from 'react';;
import { Container } from '@material-ui/core';
import { useQuery } from '@tanstack/react-query';
import { csvParse } from 'd3-dsv';
import { ScmdUi } from './scmd-ui.js';

const kgBaseUrl = 'https://storage.googleapis.com/vitessce-demo-data/enrichr-kg-september-2023';

function geneQueryFn(ctx) {
  const [fileName] = ctx.queryKey;
  return fetch(`${kgBaseUrl}/${fileName}`)
      .then(res => res.text())
      .then(res => {
        const result = csvParse(res)
        return result.map(d => ({
          kgId: d.id,
          label: d.label,
          term: `hgnc.symbol:${d.label}`,
          nodeType: 'gene',
        }));
      });
}

function cellTypeQueryFn(ctx) {
  const [fileName] = ctx.queryKey;
  return fetch(`${kgBaseUrl}/${fileName}`)
      .then(res => res.text())
      .then(res => {
        const result = csvParse(res)
        return result.map(d => ({
          kgId: d.id,
          label: d.label,
          term: d.cell_id.length ? d.cell_id : null,
          nodeType: 'cellType',
        }));
      });
}

function pathwayQueryFn(ctx) {
  const [fileName] = ctx.queryKey;
  return fetch(`${kgBaseUrl}/${fileName}`)
      .then(res => res.text())
      .then(res => {
        const result = csvParse(res)
        return result.map(d => ({
          kgId: d.id,
          label: d.pathway,
          term: `reactome:${d.acc}`,
          nodeType: 'pathway',
        }));
      });
}

function pathwayEdgeQueryFn(ctx) {
  const [fileName] = ctx.queryKey;
  return fetch(`${kgBaseUrl}/${fileName}`)
      .then(res => res.text())
      .then(res => {
        const result = csvParse(res)
        return result.map(d => ({
          source: d.source,
          target: d.target,
          relation: d.relation,
        }));
      });
}

export function Demo(props) {
  // TODO: make isSelecting a coordination type plugin.
  // TODO: use store hooks from @vitessce/vit-s to update the view config based on the selections.
  const [isSelecting, setIsSelecting] = useState(true);

  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(null);
  const [currentModalityAgnosticSelection, setCurrentModalityAgnosticSelection] = useState(null);
  const [currentModalitySpecificSelection, setCurrentModalitySpecificSelection] = useState(null);
  const [currentStratificationSelection, setCurrentStratificationSelection] = useState(null);

  // Getting all data from the network
  // TODO: use async function plugins to fetch the data.
  const geneQuery = useQuery({
    placeholderData: [],
    queryKey: ['Gene.nodes.csv'],
    queryFn: geneQueryFn,
  });
  const cellTypeQuery = useQuery({
    placeholderData: [],
    queryKey: ['HuBMAP_ASCTplusB_augmented_2022.nodes.csv'],
    queryFn: cellTypeQueryFn,
  });
  const pathwayQuery = useQuery({
    placeholderData: [],
    queryKey: ['Reactome_2022.nodes.csv'],
    queryFn: pathwayQueryFn,
  });
  const geneList = geneQuery.data;
  const cellTypeList = cellTypeQuery.data
    ?.filter(d => d.label.endsWith('Kidney'))
    .filter(d => d.term !== null);
  const pathwayList = pathwayQuery.data;
  
  console.log(geneList);
  console.log(cellTypeList);
  console.log(pathwayList);

  // Autocomplete functions
  // TODO: use async function plugins to perform autocomplete.
  const autocompleteGene = useCallback(async (inputValue) => {
    if(inputValue.length < 1 || !geneList) return [];
    return geneList.filter(d => (
      d.label.toLowerCase().includes(inputValue.toLowerCase())
      || d.term.toLowerCase().startsWith(inputValue.toLowerCase())
    ));
  }, [geneList]);

  const autocompletePathway = useCallback(async (inputValue) => {
    if(inputValue.length < 1 || !pathwayList) return [];
    return pathwayList.filter(d => (
      d.label.toLowerCase().includes(inputValue.toLowerCase())
      || d.term.toLowerCase().startsWith(inputValue.toLowerCase())
    ));
  }, [pathwayList]);

  const autocompleteNode = useCallback(async (inputValue) => {
    const geneResults = await autocompleteGene(inputValue);
    const pathwayResults = await autocompletePathway(inputValue);
    return [...geneResults, ...pathwayResults];
  }, [autocompleteGene, autocompletePathway]);

  const pathwayEdgeQuery = useQuery({
    placeholderData: [],
    queryKey: ['Reactome_2022.Reactome.Gene.edges.csv'],
    queryFn: pathwayEdgeQueryFn,
  });

  const pathwayEdges = pathwayEdgeQuery.data;

  const getPathwayEdges = useCallback(async (pathwayNode) => {
    if(!pathwayEdges || !geneList) return [];
    const matchingEdges = pathwayEdges.filter(d => d.source === pathwayNode.kgId);
    const matchingGeneIds = matchingEdges.map(d => d.target);
    const matchingGenes = geneList.filter(d => matchingGeneIds.includes(d.kgId));
    return matchingGenes;
  }, [pathwayEdges, geneList]);

  const getEdges = useCallback(async (node, targetModality) => {
    if(node.nodeType === 'pathway') return getPathwayEdges(node);
    if(node.nodeType === 'gene') return [node];
    // TODO: additional edge getter functions
    return [];
  }, [getPathwayEdges]);


  return (
    <Container>
      {isSelecting ? (
        <ScmdUi
          mode={mode}
          setMode={setMode}
          step={step}
          setStep={setStep}
          currentModalityAgnosticSelection={currentModalityAgnosticSelection}
          setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
          currentModalitySpecificSelection={currentModalitySpecificSelection}
          setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
          currentStratificationSelection={currentStratificationSelection}
          setCurrentStratificationSelection={setCurrentStratificationSelection}

          autocompleteNode={autocompleteNode}
          getEdges={getEdges}

          stratifications={[
            {
              stratificationId: 'aki-vs-hr',
              name: 'Acute kidney injury (AKI) vs. Healthy reference',
              groupType: 'clinical',
            },
            {
              stratificationId: 'aki-vs-hckd',
              name: 'Acute kidney injury (AKI) vs. Chronic kidney disease attributed to hypertension (H-CKD)',
              groupType: 'clinical',
            },
            {
              stratificationId: 'dckd-vs-hr',
              name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Healthy reference',
              groupType: 'clinical',
            },
            {
              stratificationId: 'dckd-vs-hckd',
              name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Chronic kidney disease attributed to hypertension (H-CKD)',
              groupType: 'clinical',
            },
            {
              stratificationId: 'dckd-vs-dkdr',
              name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Diabetic kidney disease "resisters"',
              groupType: 'clinical',
            },
            {
              stratificationId: 'sglt2-vs-no-sglt2',
              name: 'Chronic kidney disease attributed to diabetes (D-CKD) with SGLT2 inhibitor vs. D-CKD without SGLT2 inhibitor',
              groupType: 'clinical',
            },
            {
              stratificationId: 'ati-vs-hr',
              name: 'Acute tubular injury vs. Healthy reference',
              groupType: 'clinical',
            },
            {
              stratificationId: 'ain-vs-hr',
              name: 'Acute interstitial injury vs. Healthy reference',
              groupType: 'clinical',
            },
            {
              stratificationId: 'ati-vs-ain',
              name: 'Acute tubular injury vs. Acute interstitial nephritis',
              groupType: 'clinical',
            },
            {
              stratificationId: 'raki-vs-waki',
              name: 'Recovering AKI vs. Worsening AKI',
              groupType: 'clinical',
            },
            {
              stratificationId: 'ifta-vs-non-ifta-presence',
              name: 'Interstitial fibrosis and tubular atrophy (IFTA) vs. non-IFTA',
              groupType: 'structural-presence',
            },
            {
              stratificationId: 'gsg-vs-ngsg-presence',
              name: 'Globally sclerotic glomeruli (GSG) vs. non-GSG',
              groupType: 'structural-presence',
            },
            {
              stratificationId: 'ifta-vs-non-ifta-region',
              name: 'Interstitial fibrosis and tubular atrophy (IFTA) vs. non-IFTA',
              groupType: 'structural-region',
            },
            {
              stratificationId: 'gsg-vs-ngsg-region',
              name: 'Globally sclerotic glomeruli (GSG) vs. non-GSG',
              groupType: 'structural-region',
            }
          ]}
          onFinish={() => setIsSelecting(false)}
        />
      ) : null}
    </Container>
  );
}