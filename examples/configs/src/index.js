import { createStoreFromMapContents } from '@vitessce/zarr-utils';
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
import { habib2017natureMethods, habib2017natureMethodsZip, habib2017withQualityMetrics } from './view-configs/habib_2017_nature_methods.js';
import { humanLymphNode10xVisium } from './view-configs/human_lymph_node_10x_visium.js';
import { kuppe2022nature } from './view-configs/kuppe_2022_nature.js';
import { marshall2022iScience } from './view-configs/marshall_2022_iscience.js';
import { meta2022azimuth } from './view-configs/meta_2022_azimuth.js';
import { rgbOmeTiff } from './view-configs/rgb-ome-tiff.js';
import { segmentationsOmeTiff } from './view-configs/segmentations-ome-tiff.js';
import { visiumSpatialViewer } from './view-configs/visium-spatial-viewer.js';
import { blinOop2019, blinSideBySide2019 } from './view-configs/spatial-beta/blin.js';
import { codexOop2023 } from './view-configs/spatial-beta/codex.js';
import { visiumImageOop2023 } from './view-configs/spatial-beta/visium-image.js';
import { visiumSpotsOop2023 } from './view-configs/spatial-beta/visium-spots.js';
import { codeluppiOop2018 } from './view-configs/spatial-beta/codeluppi.js';
import { kpmp2023 } from './view-configs/spatial-beta/kpmp.js';
import { visiumSpatialdata2023 } from './view-configs/spatial-beta/spatialdata-visium.js';
import { visiumIoSpatialdata2023 } from './view-configs/spatial-beta/spatialdata-visium_io.js';
import { mcmicroIoSpatialdata2023 } from './view-configs/spatial-beta/spatialdata-mcmicro_io.js';
import { exemplarSmall2024, exemplarSmallPartialInit } from './view-configs/spatial-beta/exemplar-small.js';
import { lake2023 } from './view-configs/multi-sample.js';
import { salcher2022 } from './view-configs/salcher_2022.js';
import { smallMultiples } from './view-configs/small-multiples.js';

// TODO(spatialBeta):
import { kpmpOop2023 } from './view-configs/spatial-beta/kpmp-oop.js';
import { kpmpAutoInit2023 } from './view-configs/spatial-beta/kpmp-auto-init.js';
import { imsAlgorithmComparison } from './view-configs/spatial-beta/ims-algorithm-comparison.js';
import { neumanOop2023 } from './view-configs/spatial-beta/neumann-oop.js';
import { lightsheetOop2023 } from './view-configs/spatial-beta/lightsheet-oop.js';
import { visiumPolygonsOop2023 } from './view-configs/spatial-beta/visium-polygons-oop.js';
import { maynard2021 } from './view-configs/spatial-beta/spatialdata-maynard_2021.js';

import exemplarSmallCellsAdata from './json-fixtures/exemplar-small/exemplar-001.crop.cells.adata.json';
import exemplarSmallImageOmeZarr from './json-fixtures/exemplar-small/exemplar-001.crop.image.ome.json';
import exemplarSmallSegmentationsOmeZarr from './json-fixtures/exemplar-small/exemplar-001.crop.segmentations.ome.json';

// 3D Maps
import { jainkidneyDecimated } from './view-configs/3d-maps/jain-kidney-decimated.js';
import { humanLiver } from './view-configs/3d-maps/human-liver.js';
import { bloodVessel } from './view-configs/3d-maps/blood-vessel.js';
import { bloodVesselNamed } from './view-configs/3d-maps/blood-vessel-named.js';
import { bloodVesselNeighborhood } from './view-configs/3d-maps/blood-vessel-neighborhood.js';
import { sorgerBiggerNeighborhood } from './view-configs/3d-maps/sorger-bigger.js';
import { cellNeighborhood } from './view-configs/3d-maps/cell-neighborhood-named.js';
import { threeMinimal } from './view-configs/3d-maps/three-minimal.js';
import { threeMinimalLight } from './view-configs/3d-maps/three-minimal-light.js';

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
  'habib-2017-zip': habib2017natureMethodsZip,
  'habib-2017-with-quality-metrics': habib2017withQualityMetrics,
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
  'linnarsson-2018': codeluppi2018,
  'visium-spatial-viewer': visiumSpatialViewer,
  'spatialdata-visium': visiumSpatialdata2023,
  'spatialdata-visium_io': visiumIoSpatialdata2023,
  'spatialdata-mcmicro_io': mcmicroIoSpatialdata2023,
  gating: codeluppiGating,
  vanderbilt: spraggins2020,
  'dries-2019': eng2019,
  'lake-2023': lake2023,
  'salcher-2022': salcher2022,
  'maynard-2021': maynard2021,
  'small-multiples': smallMultiples,

  // Multi-level coordination with spatialBeta view:
  'blin-2019-2': blinOop2019,
  'blin-2019-3': blinSideBySide2019,
  'codex-2023': codexOop2023,
  'visium-2023-image-only': visiumImageOop2023,
  'visium-2023': visiumSpotsOop2023,
  'codeluppi-2018-2': codeluppiOop2018,
  'kpmp-2023': kpmp2023,
  'kpmp-2023-2': kpmpOop2023,
  'exemplar-small': exemplarSmall2024,
  'exemplar-small-partial-init': exemplarSmallPartialInit,

  // TODO(spatialBeta): clean up
  'ims-algorithm-comparison': imsAlgorithmComparison,
  'neumann-2020-2': neumanOop2023,
  'lightsheet-2023': lightsheetOop2023,
  'visium-2023-polygons': visiumPolygonsOop2023,
  'kpmp-auto-init': kpmpAutoInit2023,

  // 3D Maps
  'jain-2024': jainkidneyDecimated,
  'tian-2024': humanLiver,
  'sorger-2024': bloodVessel,
  'sorger-2024-2': bloodVesselNamed,
  'sorger-2024-3': sorgerBiggerNeighborhood,
  'sorger-2024-4': bloodVesselNeighborhood,
  'sorger-2024-5': cellNeighborhood,
  'kiemen-2024': threeMinimal,
  'hakimian-2021': threeMinimalLight,

  // For documentation of coordination types:
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

const exemplarSmallStores = {
  'exemplar-001.crop.cells.adata.zarr': createStoreFromMapContents(exemplarSmallCellsAdata),
  'exemplar-001.crop.image.ome.zarr': createStoreFromMapContents(exemplarSmallImageOmeZarr),
  'exemplar-001.crop.segmentations.ome.zarr': createStoreFromMapContents(exemplarSmallSegmentationsOmeZarr),
};

export const configStores = {
  'exemplar-small': exemplarSmallStores,
  'exemplar-small-partial-init': exemplarSmallStores,
};
