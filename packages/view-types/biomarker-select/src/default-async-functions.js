// @ts-check
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { csvParse } from 'd3-dsv';
// eslint-disable-next-line import/no-unresolved
import Fuse from 'fuse.js/basic';

/** @import { KgNode, KgEdge, TargetModalityType, AutocompleteFeatureFunc, TransformFeatureFunc, GetAlternativeTermsFunc, GetTermMappingFunc } from '@vitessce/types' */
/** @import { QueryClient, QueryFunctionContext } from '@tanstack/react-query' */

const KG_BASE_URL = 'https://storage.googleapis.com/vitessce-demo-data/enrichr-kg-september-2023';
const ENSG_TO_GENE_SYMBOL_URL = 'https://vitessce-resources.s3.us-east-2.amazonaws.com/genes_filtered.json';

/**
 * @returns {Promise<KgNode[]>}
 */
function loadGeneNodes() {
  return fetch(`${KG_BASE_URL}/Gene.nodes.csv`)
    .then(res => res.text())
    .then((res) => {
      const result = csvParse(res);
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.label,
        term: `hgnc.symbol:${d.label}`,
        nodeType: 'gene',
      }));
    });
}

/**
 * @returns {Promise<KgNode[]>}
 */
function loadCellTypeNodes() {
  return fetch(`${KG_BASE_URL}/HuBMAP_ASCTplusB_augmented_2022.nodes.csv`)
    .then(res => res.text())
    .then((res) => {
      const result = csvParse(res);
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.label,
        term: d.cell_id.length ? d.cell_id : null,
        nodeType: 'cell-type',
      }));
    });
}

/**
 * @returns {Promise<KgNode[]>}
 */
function loadPathwayNodes() {
  const reactomeNodes = fetch(`${KG_BASE_URL}/Reactome_2022.nodes.csv`);
  // TODO: load both GO and Reactome nodes, concat together.
  // const goNodes = fetch(`${KG_BASE_URL}/GO_Biological_Process_2021.nodes.csv`);
  return reactomeNodes.then(res => res.text())
    .then((res) => {
      const result = csvParse(res);
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.pathway, // For reactome
        term: `REACTOME:${d.acc}`, // For reactome
        // label: d.ontology_label, // For GO_BP
        // term: d.acc, // For GO_BP
        nodeType: 'pathway',
      }));
    });
}

/**
 * @returns {Promise<Record<string,string>>}
 */
function loadEnsgToGeneSymbolMapping() {
  return fetch(ENSG_TO_GENE_SYMBOL_URL)
    .then(res => res.json());
}

// Parent app can pass in queryClient
// (to every async function) so that functions can call .fetchQuery
// Reference: https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchquery

/**
 *
 * @param {QueryFunctionContext} ctx
 * @returns
 */
async function loadFuseObject(ctx) {
  const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);

  const [geneNodes, cellTypeNodes, pathwayNodes] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ['geneNodes'],
      staleTime: Infinity,
      queryFn: loadGeneNodes,
    }),
    queryClient.fetchQuery({
      queryKey: ['cellTypeNodes'],
      staleTime: Infinity,
      queryFn: loadCellTypeNodes,
    }),
    queryClient.fetchQuery({
      queryKey: ['pathwayNodes'],
      staleTime: Infinity,
      queryFn: loadPathwayNodes,
    }),
  ]);

  const fuseOptions = {
    keys: ['label', 'term'],
  };

  // For fuzzy searching using fuse.js
  return new Fuse(
    [
      ...geneNodes,
      ...cellTypeNodes,
      ...pathwayNodes,
    ],
    fuseOptions,
  );
}

/**
 * @satisfies {AutocompleteFeatureFunc}
 * @param {object} ctx
 * @param {QueryClient} ctx.queryClient
 * @param {string} partial
 * @param {null | TargetModalityType} targetModality
 * @returns {Promise<KgNode[]>}
 */
export async function autocompleteFeature({ queryClient }, partial, targetModality) {
  if (partial.length < 1) {
    return [];
  }
  // TODO: parameterize the fuse object (via queryKey) based on targetModality?
  // Or just perform that filtering after the search?
  const fuse = await queryClient.fetchQuery({
    queryKey: ['autocompleteFeature', 'fuseObject'],
    staleTime: Infinity,
    queryFn: loadFuseObject,
    meta: { queryClient },
  });

  const results = fuse.search(partial);
  return results.map((/** @type {any} */ result) => result.item);
}

async function loadPathwayToGeneEdges() {
  const reactomeEdges = fetch(`${KG_BASE_URL}/Reactome_2022.Reactome.Gene.edges.csv`);
  // TODO: load both GO and Reactome edges, concat together.
  // const goEdges = fetch(`${KG_BASE_URL}/GO_Biological_Process_2021.GO_BP.Gene.edges.csv`);
  return reactomeEdges
    .then(res => res.text())
    .then((res) => {
      const result = csvParse(res);
      return result.map((/** @type {any} */ d) => ({
        source: d.source,
        target: d.target,
        relation: d.relation,
      }));
    });
}

/**
 * @satisfies {TransformFeatureFunc}
 * @param {object} ctx
 * @param {QueryClient} ctx.queryClient
 * @param {KgNode} nodeOrig
 * @param {TargetModalityType} targetModality
 * @returns {Promise<KgNode[]>}
 */
export async function transformFeature({ queryClient }, nodeOrig, targetModality) {
  const node = {
    ...nodeOrig,
  };
  if (targetModality === node.nodeType) {
    // For example, if the target modality is gene and the node is already a gene node.
    return [node];
  }
  if (targetModality === 'gene') {
    const geneNodes = await queryClient.fetchQuery({
      queryKey: ['geneNodes'],
      staleTime: Infinity,
      queryFn: loadGeneNodes,
    });
    if (node.nodeType === 'pathway') {
      // Pathway to genes case.
      const pathwayGeneEdges = await queryClient.fetchQuery({
        queryKey: ['pathwayGeneEdges'],
        staleTime: Infinity,
        queryFn: loadPathwayToGeneEdges,
      });

      if (!node.kgId) {
        const pathwayNodes = await queryClient.fetchQuery({
          queryKey: ['pathwayNodes'],
          staleTime: Infinity,
          queryFn: loadPathwayNodes,
        });
        const foundId = pathwayNodes.find(n => n.term === node.term)?.kgId;
        if (foundId) {
          node.kgId = foundId;
        } else {
          console.warn('Could not find matching pathway node based on term.');
        }
      }

      // TODO: support matching using ontology term (rather than requiring kgId)?
      const matchingEdges = pathwayGeneEdges.filter((/** @type {KgEdge} */ d) => d.source === node.kgId);
      const matchingGeneIds = matchingEdges.map((/** @type {KgEdge} */ d) => d.target);
      const matchingGenes = geneNodes.filter(d => matchingGeneIds.includes(d.kgId));
      return matchingGenes;
    }
    if (node.nodeType === 'cell-type') {
      // Cell type to genes case.

      // TODO: implement
    }
  }
  // TODO: handle other target modalities
  return [];
}

/**
 * @satisfies {GetAlternativeTermsFunc}
 * @param {object} ctx
 * @param {QueryClient} ctx.queryClient
 * @param {string} curie
 * @returns {Promise<string[]>} A list of curie strings.
 */
export async function getAlternativeTerms({ queryClient }, curie) {
  // Reference: https://registry.identifiers.org/registry/ensembl
  // Currently, we only map Ensembl gene IDs to gene symbols,
  // using our own JSON file.
  // In the future, we can expand this functionality.
  const inputIsEnsemblGeneId = curie.toUpperCase().startsWith('ENSEMBL:ENSG');

  if (inputIsEnsemblGeneId) {
    const idMapping = await queryClient.fetchQuery({
      queryKey: ['ensgToGeneSymbolMapping'],
      staleTime: Infinity,
      queryFn: loadEnsgToGeneSymbolMapping,
    });
    // In our current JSON file, the ENSG IDs are not prefixed with 'ENSEMBL:'.
    const ensemblId = curie.split(':')[1];
    let geneSymbol = idMapping?.[ensemblId];
    if (geneSymbol) {
      if (!geneSymbol.toUpperCase().startsWith('HGNC:')) {
        // In our current JSON file, the gene symbols are not prefixed with 'HGNC:'.
        geneSymbol = `HGNC:${geneSymbol}`;
      }
      return [geneSymbol];
    }
  }
  return [];
}

/**
 * @satisfies {GetTermMappingFunc}
 * @param {object} ctx
 * @param {QueryClient} ctx.queryClient
 * @param {string} keyCuriePrefix
 * @param {string} valCuriePrefix
 * @returns {Promise<Map<string, string>>} A mapping between curie strings.
 */
export async function getTermMapping({ queryClient }, keyCuriePrefix, valCuriePrefix) {
  if (
    (keyCuriePrefix.toUpperCase() === 'ENSEMBL' && valCuriePrefix.toUpperCase() === 'HGNC')
    || (keyCuriePrefix.toUpperCase() === 'HGNC' && valCuriePrefix.toUpperCase() === 'ENSEMBL')
  ) {
    const idMapping = await queryClient.fetchQuery({
      queryKey: ['ensgToGeneSymbolMapping'],
      staleTime: Infinity,
      queryFn: loadEnsgToGeneSymbolMapping,
    });
    const isReversed = (keyCuriePrefix.toUpperCase() === 'HGNC');
    return new Map(Object.entries(idMapping).map(([key, value]) => (
      isReversed
        ? ([`HGNC:${value}`, `ENSEMBL:${key}`])
        : ([`ENSEMBL:${key}`, `HGNC:${value}`])
    )));
  }
  throw new Error(`Mapping between ${keyCuriePrefix} and ${valCuriePrefix} is not yet implemented.`);
}
