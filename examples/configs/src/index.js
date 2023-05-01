import { vapi } from './utils';
import {
  justScatter, justScatterExpression, justSpatial,
  codeluppi2018,
  codeluppiGating,
} from './view-configs/codeluppi';
import { eng2019 } from './view-configs/eng';
import { wang2018 } from './view-configs/wang';
import { spraggins2020, neumann2020 } from './view-configs/spraggins';
import { satija2020 } from './view-configs/satija';
import { justHiglass } from './view-configs/rao';
import { scAtacSeq10xPbmc } from './view-configs/tenx';
import { blin2019 } from './view-configs/blin';
import { omeNgffLegacy } from './view-configs/ome-ngff-legacy';
import { hubmapIntestineSnAtacSeq } from './view-configs/hubmap';
import {
  embeddingZoomConfig,
  embeddingTargetXConfig,
  embeddingTargetYConfig,
  embeddingCellSetPolygonsVisibleConfig,
} from './view-configs/coordination-types/index';
import { codeluppiViaCsv } from './view-configs/codeluppi-via-csv';
import { codeluppiViaZarr } from './view-configs/codeluppi-via-zarr';
import { combat2022cell } from './view-configs/combat_2022_cell';
import { habib2017natureMethods } from './view-configs/habib_2017_nature_methods';
import { humanLymphNode10xVisium } from './view-configs/human_lymph_node_10x_visium';
import { kuppe2022nature } from './view-configs/kuppe_2022_nature';
import { marshall2022iScience } from './view-configs/marshall_2022_iscience';
import { meta2022azimuth } from './view-configs/meta_2022_azimuth';
import { rgbOmeTiff } from './view-configs/rgb-ome-tiff';
import { segmentationsOmeTiff } from './view-configs/segmentations-ome-tiff';
import { mri } from './view-configs/mri';

export const coordinationTypeConfigs = {
  [vapi.ct.EMBEDDING_ZOOM]: embeddingZoomConfig,
  [vapi.ct.EMBEDDING_TARGET_X]: embeddingTargetXConfig,
  [vapi.ct.EMBEDDING_TARGET_Y]: embeddingTargetYConfig,
  [vapi.ct.EMBEDDING_OBS_SET_POLYGONS_VISIBLE]: embeddingCellSetPolygonsVisibleConfig,
};

// Note that the ordering of the components in the layout
// can affect the z-index of plot tooltips due to the
// resulting ordering of elements in the DOM.

export const configs = {
  'just-scatter': justScatter,
  'just-scatter-expression': justScatterExpression,
  'just-spatial': justSpatial,
  'just-higlass': justHiglass,
  'codeluppi-2018': codeluppiViaCsv,
  'codeluppi-2018-via-zarr': codeluppiViaZarr,
  'combat-2022': combat2022cell,
  'habib-2017': habib2017natureMethods,
  'human-lymph-node-10x-visium': humanLymphNode10xVisium,
  'kuppe-2022': kuppe2022nature,
  'marshall-2022': marshall2022iScience,
  'meta-2022-azimuth': meta2022azimuth,
  'eng-2019': eng2019,
  'wang-2018': wang2018,
  'spraggins-2020': spraggins2020,
  'neumann-2020': neumann2020,
  'satija-2020': satija2020,
  'sn-atac-seq-hubmap-2020': hubmapIntestineSnAtacSeq,
  'sc-atac-seq-10x-genomics-pbmc': scAtacSeq10xPbmc,
  'blin-2019': blin2019,
  'ome-ngff-v0.1': omeNgffLegacy,
  'rgb-ome-tiff': rgbOmeTiff,
  'segmentations-ome-tiff': segmentationsOmeTiff,
  // Keys which enable backwards compatibility with old links.
  'codeluppi-2018-via-json': codeluppi2018,
  'linnarsson-2018': codeluppi2018,
  gating: codeluppiGating,
  vanderbilt: spraggins2020,
  'dries-2019': eng2019,
  'mri': mri,
  ...coordinationTypeConfigs,
};

// The list of configs shown by default on the development site
// (http://localhost:3000 or dev.vitessce.io).
// To adjust the list for the docs site, see docs/src/pages/_DemoList.js
export const publicConfigs = [
  'codeluppi-2018',
  'eng-2019',
  'wang-2018',
  'spraggins-2020',
  'satija-2020',
  'blin-2019',
  'rgb-ome-tiff',
  'segmentations-ome-tiff',
  'mri',
];
