import { vapi } from './utils.js';
import {
  justScatter, justScatterExpression, justSpatial,
  codeluppi2018,
  codeluppiGating,
} from './view-configs/codeluppi.js';
import { eng2019 } from './view-configs/eng.js';
import { wang2018 } from './view-configs/wang.js';
import { spraggins2020, neumann2020 } from './view-configs/spraggins.js';
import { satija2020 } from './view-configs/satija.js';
import { justHiglass } from './view-configs/rao.js';
import { scAtacSeq10xPbmc } from './view-configs/tenx.js';
import { blin2019, multipleOmeZarrViaRasterJson } from './view-configs/blin.js';
import { omeNgffLegacy } from './view-configs/ome-ngff-legacy.js';
import { hubmapIntestineSnAtacSeq } from './view-configs/hubmap.js';
import {
  embeddingZoomConfig,
  embeddingTargetXConfig,
  embeddingTargetYConfig,
  embeddingCellSetPolygonsVisibleConfig,
} from './view-configs/coordination-types/index.js';
import { codeluppiViaCsv } from './view-configs/codeluppi-via-csv.js';
import { codeluppiViaZarr } from './view-configs/codeluppi-via-zarr.js';
import { combat2022cell } from './view-configs/combat_2022_cell.js';
import { habib2017natureMethods } from './view-configs/habib_2017_nature_methods.js';
import { humanLymphNode10xVisium } from './view-configs/human_lymph_node_10x_visium.js';
import { kuppe2022nature } from './view-configs/kuppe_2022_nature.js';
import { marshall2022iScience } from './view-configs/marshall_2022_iscience.js';
import { meta2022azimuth } from './view-configs/meta_2022_azimuth.js';
import { rgbOmeTiff } from './view-configs/rgb-ome-tiff.js';
import { segmentationsOmeTiff } from './view-configs/segmentations-ome-tiff.js';

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
  'ome-ngff-multi': multipleOmeZarrViaRasterJson,
  'ome-ngff-v0.1': omeNgffLegacy,
  'rgb-ome-tiff': rgbOmeTiff,
  'segmentations-ome-tiff': segmentationsOmeTiff,
  // Keys which enable backwards compatibility with old links.
  'codeluppi-2018-via-json': codeluppi2018,
  'linnarsson-2018': codeluppi2018,
  gating: codeluppiGating,
  vanderbilt: spraggins2020,
  'dries-2019': eng2019,
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
];
