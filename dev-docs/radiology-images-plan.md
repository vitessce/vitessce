# Plan: radiology images (DICOMweb, `.dcm`, NIfTI) via Viv

Milestone 1 of DICOM support. Status: steps 1 to 4 implemented on branch `nickakhmetov/dicom-support` (see [Implementation notes](#implementation-notes)), followed by compressed transfer syntaxes (see [Codecs](#codecs)).

## Goal

Load single-channel CT/MR volumes from three sources into the existing `spatialBeta` view, with full coordination through `layerControllerBeta` (window, color, visibility, opacity, Z slider, 3D mode), without changing either view.

Done means:

- `image.dicomweb`, `image.dicom` (`.dcm`), and `image.nifti` file types load and render.
- An IDC CT series matches the IDC OHIF viewer visually and numerically.
- The Niivue demo NIfTI files match Niivue.

## Decisions

| Topic | Decision |
|---|---|
| Rendering | Viv tile adapter. No Cornerstone renderer. |
| Codecs | Uncompressed transfer syntaxes only. Compressed data fails with a clear error. Codecs are the first follow-up (since implemented; see [Codecs](#codecs)). |
| `.dcm` series input | `options.urls` lists one URL per file. |
| Geometry | Model matrix carries spacing and origin in patient LPS millimeters, including axis flips. Oblique rotation is dropped with a warning. |
| Validation data | IDC CT (DICOMweb proxy and `.dcm` from the public S3 bucket) and Niivue demo NIfTI files. |

Background for the rendering decision: `spatialBeta` and `layerControllerBeta` consume images only through `ImageWrapper` (`getData()` returning Viv pixel sources, and `getModelMatrix()`). Any source that produces Viv pixel sources therefore gets all existing image coordination for free. A Cornerstone view type would instead need a second rendering stack (vtk.js), hand-written coordination wiring (the Neuroglancer integration is ~9.1k lines), and WASM/worker bundler configuration that every downstream consumer of Vitessce would inherit.

## Config shape

```js
{ fileType: 'image.dicomweb', url: '<dicomweb-root>/studies/<StudyUID>/series/<SeriesUID>' }
{ fileType: 'image.dicom', options: { urls: ['https://idc-open-data.s3.amazonaws.com/<series>/<instance>.dcm', /* ... */] } }
{ fileType: 'image.nifti', url: 'https://niivue.github.io/niivue-demo-images/CT_Abdo.nii.gz' }
```

`url` is already optional in file definitions. Authentication, when needed, uses the existing `requestInit` property.

## Architecture

One shared core plus three thin loaders, in a new package `packages/file-types/radiology` (`@vitessce/radiology`).

1. **`SliceSource`**: a Viv `PixelSource` backed by a per-format `loadSlice(z)` function that returns a typed array. Shape `[1, 1, Z, Y, X]`, labels `['t', 'c', 'z', 'y', 'x']`. Implements `getRaster` and `getTile`, and caches one promise per slice.
2. **`toNgffMetadata()`**: synthesizes OME-NGFF `multiscales` and `omero` metadata (axes in millimeters, scale and translation, channel name, default window, `defaultZ` at the middle slice). Because `ImageWrapper` already understands this metadata, no view or wrapper code changes.
3. **Loaders**: return the same `LoaderResult` shape as `OmeTiffLoader` (`imageLayer` and `imageChannel` coordination values, default window).

### Format specifics

| Format | Geometry and header | Pixels | Dependency |
|---|---|---|---|
| DICOMweb | One `GET {url}/metadata` request (DICOM JSON) | `GET {url}/instances/{sop}/frames/1` with `Accept: multipart/related; type="application/octet-stream"; transfer-syntax=1.2.840.10008.1.2.1`, parsed by a small single-part multipart parser | None |
| `.dcm` | Range request for the first 16 KB of each file, parsed until the PixelData tag (retry with a larger range if needed) | Range request at the PixelData offset, on demand. If the server ignores `Range` (status 200), keep the whole file. | `dicom-parser` |
| NIfTI | `nifti-reader-js` header parsing | Whole file fetched and decompressed once; slices are subarray views | `nifti-reader-js` (already in the lockfile via Neuroglancer) |

### Pixel values

- Sort slices by `ImagePositionPatient` projected onto the slice normal, not by `InstanceNumber`. Slice spacing is the median difference between consecutive positions. Non-uniform spacing logs a warning.
- Apply the modality LUT (`value * slope + intercept`). Use `Int16Array` when all results are integers that fit in 16 bits (CT in HU). Otherwise use `Float32Array`.
- Default window: DICOM `WindowCenter`/`WindowWidth` (first value) mapped to `[center - width / 2, center + width / 2]`. NIfTI `cal_min`/`cal_max`, falling back to the data range.
- Reject with a clear error: compressed transfer syntaxes, `MONOCHROME1`, `SamplesPerPixel` other than 1, `NumberOfFrames` greater than 1, and series with mixed dimensions or orientations.

### Geometry

- World space is DICOM LPS in millimeters. NIfTI affines (RAS) are converted by negating their x and y rows.
- Model matrix: scale by (column spacing, row spacing, slice spacing) and translate by the first voxel position. Axes that point in a negative display direction are flipped in the pixel data when slices load, so every scale is positive (see implementation notes).
- With deck.gl's y-down orthographic view, LPS gives the radiological display convention (patient right on screen left), matching OHIF's default. Niivue defaults to the neurological convention, so switch Niivue to radiological when comparing.

## Files touched

- New package `packages/file-types/radiology/`.
- `packages/constants-internal/src/constants.ts`: `IMAGE_DICOMWEB`, `IMAGE_DICOM`, `IMAGE_NIFTI` file types.
- `packages/constants-internal/src/constant-relationships.ts`: map the new file types to `DataType.IMAGE`.
- `packages/schemas/src/file-def-options.ts`: `imageDicomSchema` with `urls`.
- `packages/main/all/src/base-plugins.ts`: register the file types.
- Demo configs, documentation for the new file types, and a changeset.

## Validation

### Test data

All of these were checked for CORS access from `localhost`.

- **IDC NLST CT**. Study `1.2.840.113654.2.55.8191733375219125995341921872104648622`, series `1.2.840.113654.2.55.217316767140664106406491929674685667044`. 166 slices of 512 x 512, stored as uint16 with rescale intercept -1000, 0.648 mm pixels, default window 40/400. The IDC DICOMweb proxy returns uncompressed frames: `https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb`. The proxy has a 15 GB per day per-IP quota, so CI must not depend on it. The same instances exist as `.dcm` files in the public `idc-open-data` S3 bucket; generate the URL list with `idc-index` or an IDC portal manifest.
- **Niivue `CT_Abdo.nii.gz`**: int16, 255 x 178 x 256, 1.49 mm isotropic. Its non-power-of-two dimensions exercise tile edge handling.
- **Niivue `mni152.nii.gz`**: uint8 with `scl_slope` 0.363, which exercises the Float32 path.

### Checks

1. Visual comparison of the same slice and window against the IDC OHIF viewer or Niivue.
2. Numeric comparison: `spatialBeta` has no pixel-value readout, so unit tests compare voxel values against reference values computed with pydicom or nibabel.
3. DICOMweb and `.dcm` loading of the same series must produce identical slice arrays.
4. Vitest unit tests for multipart parsing, slice sorting and spacing, rescale and dtype selection, LPS matrices including the NIfTI flip, and rejection errors, using small synthetic fixtures.

## Risks

- ~~Negative scale values in the model matrix (axis flips) may break Viv tile culling or picking.~~ Avoided: data is flipped on load.
- `ImageWrapper.getType()` will report `'ome-zarr'` for the synthesized metadata. Its only caller is `spatial-accelerated`, which would then fail when it tries to read real Zarr chunks. Milestone 1 targets the Viv rendering path only. Fix later by adding dedicated types to the union.
- 3D mode loads every slice (87 MB and 166 requests for the test series). Confirm the multi-resolution `canLoad` check passes.
- Hosts that do not support HTTP range requests fall back to full downloads: slower, but correct.

## Out of scope (follow-ups)

1. Compressed transfer syntaxes (JPEG-LS, JPEG 2000, JPEG Lossless, RLE) via `@cornerstonejs/codec-*` WASM packages. This unlocks the OHIF demo DICOMweb server (which stores JPEG-LS frames and does not transcode) and most `.dcm` files in the wild.
2. Multi-frame Enhanced CT/MR, `MONOCHROME1` (CR/DX), RGB (ultrasound), and PET SUV scaling.
3. Oblique rotation and sagittal/coronal reslicing.
4. DICOM-SEG and NIfTI label maps as `obsSegmentations`.
5. Window presets, a QIDO-based series picker, and vitessce-python wrappers.

## Order of work

1. `SliceSource`, `toNgffMetadata`, and the NIfTI loader. Verify against Niivue. This proves the Viv and `ImageWrapper` integration and the axis-flip risk on the simplest format.
2. DICOMweb loader. Verify against the IDC OHIF viewer.
3. `.dcm` loader. Verify that arrays match the DICOMweb loader.
4. Tests, demo configs, documentation, and changeset.

## Defaults (open to change)

- The DICOMweb `url` is the full series URL, rather than a root URL plus UIDs in options.
- One package for all three formats.
- No `dicomweb-client` dependency: plain `fetch` plus a small multipart parser.
- Target views are `spatialBeta` and `layerControllerBeta` only, not the legacy `spatial` and `layerController` views.
- The slice cache is unbounded per image (memory is capped at one full series). Add an LRU cache if this becomes a problem.
- Scope is CT and MR. PET loads but shows rescaled raw values, not SUV.

## Implementation notes

Findings from implementing and validating steps 1 to 4. These change the design above where noted.

### Validation results

- **DICOMweb**: the IDC NLST series at display slice 82 matches IDC's OHIF viewer image 83/166 at window 40/400 (same anatomy, orientation, and slice order). Pixel values match an independent decode of the same frame with curl and numpy: slice sum -128552728, center pixel 68 HU.
- **`.dcm`**: the same series loaded from `idc-open-data` gives identical values to DICOMweb. Headers and pixels are read with range requests (206 responses).
- **NIfTI**: `CT_Abdo.nii.gz` slice 127 matches a numpy rendering of the file (slice sum -23642855). `mni152.nii.gz` renders correctly through the Float32 path.
- 3D mode (Viv `VolumeLayer`) renders the CT volume.

### Design changes

- **Flip on load instead of negative scales.** `ImageWrapper.getBoundingCube()` assumes ranges of `[0, scale * size]`, so negative scales would break 3D clipping planes. Flipping each slice when it loads costs one copy per slice.
- **Micrometers instead of millimeters.** `spatialBeta` hard-codes the scale bar unit to micrometers, and the rest of the beta spatial stack assumes micrometers. The synthesized NGFF metadata converts millimeters to micrometers, which gives a correct scale bar.
- **No z translation.** Scanner table positions (for example, -1846 mm) put the image beyond the orthographic camera's far plane, so the 2D view rendered black. 2D views select slices by index, so the z translation is dropped. Follow-up: restore z alignment between series for 3D overlays.
- **`getRaster` returns a copy.** Viv's `getChannelStats` (used by the layer controller's window range) reorders the raster in place with quickselect. The slice cache shared its arrays, so the displayed image became scrambled. Viv's own pixel sources return a fresh array on every call; this source now does too.
- **Demo configs use `initStrategy: 'auto'`.** Linking `imageLayer` in a config without `imageChannel` crashes `spatialBeta`; auto-initialization uses the loader's coordination values instead.

### Known gaps

- The initial Z slice is 0 rather than the middle slice. Loader `spatialTargetZ` values are not applied by `mergeCoordination`; this affects OME-Zarr `rdefs.defaultZ` too.
- The initial 3D camera is zoomed out too far.

## Codecs

Follow-up 1 is implemented: JPEG Lossless (`1.2.840.10008.1.2.4.57`, `.70`), JPEG-LS (`.80`, `.81`), JPEG 2000 (`.90`, `.91`), HTJ2K (`.201`, `.202`, `.203`), and RLE Lossless (`1.2.840.10008.1.2.5`), for both `image.dicomweb` and `image.dicom`. Lossy JPEG (Baseline, Extended) is out of scope because it is rare for CT/MR.

### Design

- JPEG-LS, JPEG 2000, and HTJ2K use the Cornerstone WebAssembly codecs (`@cornerstonejs/codec-charls`, `codec-openjpeg`, `codec-openjph`). Their JavaScript is bundled as lazy chunks (about 80 KB each). Their `.wasm` files are fetched from jsDelivr on first use and passed to the module as bytes, which avoids bundler `.wasm` handling and MIME type issues (the same reason parquet-wasm is loaded from a CDN). Versions are pinned exactly in the catalog, because the bundled JavaScript must match the fetched `.wasm`.
- TODO: host the `.wasm` files on `cdn.vitessce.io` by adding the codec packages to `scripts/sync-cdn.mjs`, then update `WASM_URLS` in `codecs.ts`.
- JPEG Lossless uses `jpeg-lossless-decoder-js` (plain JavaScript). RLE is decoded by a small function in `codecs.ts`.
- DICOMweb frames are still requested as Explicit VR Little Endian. A server that cannot transcode answers 406, and the request is repeated with `transfer-syntax=*`. Servers that ignore the requested transfer syntax (such as OHIF's static demo server) return compressed frames, which are decoded.
- For compressed `.dcm` files, pixel data is read from its start to the end of the file, and the fragments of the single frame are joined before decoding.
- Decoding runs on the main thread. Move it to a worker if loading many slices (3D mode) blocks the UI.

### Validation results

- **JPEG-LS (DICOMweb)**: OHIF demo server, LIDC chest CT. Display slice 67 matches viewer.ohif.org image 68/135, and matches a Python `imagecodecs` decode of the same frame (slice sum -296159814).
- **JPEG 2000 (`.dcm`)**: IDC ICDC-Glioma MR series. The first displayed slice matches a `pydicom` + `imagecodecs` decode (slice sum 12629531).
- **JPEG Lossless (`.dcm`)**: IDC TCGA-UCEC CT series. The first displayed slice matches a `pydicom` + `imagecodecs` decode (slice sum -99080085). This series includes a localizer image with a different orientation, so images that do not match the rest of a series are now skipped with a warning instead of failing the series.
- **HTJ2K and RLE**: no public CT/MR examples were found, so they are covered by unit tests with fixtures encoded by `imagecodecs`.
- Unit tests decode a fixture for each codec, using the `.wasm` files from `node_modules`.

### Findings

- OHIF's demo server responds with `Content-Type: multipart/related` without a `boundary` parameter, so the multipart delimiter is read from the first line of the body.
- In the jsdom test environment, `Headers` drops the `Range` header (browsers and Node keep it). `DicomLoader.test.ts` runs in the Node environment.
