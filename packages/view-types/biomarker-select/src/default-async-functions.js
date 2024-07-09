// @ts-check
import { csvParse } from 'd3-dsv';
import Fuse from 'fuse.js/basic';

/** @import { KgNode,TargetModalityType, AutocompleteFeatureFunc } from '@vitessce/types' */
/** @import { QueryClient, QueryFunctionContext } from '@tanstack/react-query' */


const KG_BASE_URL = 'https://storage.googleapis.com/vitessce-demo-data/enrichr-kg-september-2023';

// TODO: parent app could pass in queryClient (to every async function) to be able to call .fetchQuery
// Reference https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchquery


/**
 * @returns {Promise<KgNode[]>}
 */
function loadGeneNodes() {
  return fetch(`${KG_BASE_URL}/Gene.nodes.csv`)
    .then(res => res.text())
    .then(res => {
      const result = csvParse(res)
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.label,
        term: `hgnc.symbol:${d.label}`,
        nodeType: 'gene',
      }));
    });
}

function loadCellTypeNodes() {
  return fetch(`${KG_BASE_URL}/HuBMAP_ASCTplusB_augmented_2022.nodes.csv`)
    .then(res => res.text())
    .then(res => {
      const result = csvParse(res)
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.label,
        term: d.cell_id.length ? d.cell_id : null,
        nodeType: 'cellType',
      }));
    });
}

/**
 * @returns {Promise<KgNode[]>}
 */
function loadPathwayNodes() {
  return fetch(`${KG_BASE_URL}/Reactome_2022.nodes.csv`)
    .then(res => res.text())
    .then(res => {
      const result = csvParse(res)
      return result.map((/** @type {any} */ d) => ({
        kgId: d.id,
        label: d.pathway,
        term: `reactome:${d.acc}`,
        nodeType: 'pathway',
      }));
    });
}

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
  if(partial.length < 1) {
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
