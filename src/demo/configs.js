import {
  justScatter, justScatterExpression, justSpatial, codeluppi2018,
} from './view-configs/codeluppi';
import { eng2019 } from './view-configs/eng';
import { wang2018 } from './view-configs/wang';
import { spraggins2020 } from './view-configs/spraggins';
import { satija2020 } from './view-configs/satija';
import { justHiglass } from './view-configs/rao';
import { scAtacSeq10xPbmc } from './view-configs/tenx';

// Note that the ordering of the components in the layout
// can affect the z-index of plot tooltips due to the
// resulting ordering of elements in the DOM.

export const configs = {
  'just-scatter': justScatter,
  'just-scatter-expression': justScatterExpression,
  'just-spatial': justSpatial,
  'just-higlass': justHiglass,
  'codeluppi-2018': codeluppi2018,
  'eng-2019': eng2019,
  'wang-2018': wang2018,
  'spraggins-2020': spraggins2020,
  'satija-2020': satija2020,
  'sc-atac-seq-10x-genomics-pbmc': scAtacSeq10xPbmc,
  // Keys which enable backwards compatibility with old links.
  'linnarsson-2018': codeluppi2018,
  'vanderbilt': spraggins2020,
  'dries-2019': eng2019,
};
