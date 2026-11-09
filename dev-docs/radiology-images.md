# Radiology images (DICOMweb, `.dcm`, NIfTI)

Design notes for `@vitessce/radiology` (`image.dicomweb`, `image.dicom`, `image.nifti`) and `@vitessce/radiology-workers`. User-facing behavior is documented in `sites/docs/docs/data-file-types.mdx`.

## Rendering through Viv

`spatialBeta` and `layerControllerBeta` consume images only through `ImageWrapper` (`getData()` returning Viv pixel sources, and `getModelMatrix()`). A source that produces Viv pixel sources gets all existing image coordination (window, color, visibility, opacity, Z slider, 3D mode) without view changes. A Cornerstone view type was rejected: it would need a second rendering stack (vtk.js), hand-written coordination wiring (the Neuroglancer integration is about 9.1k lines), and WASM/worker bundler configuration that every downstream consumer of Vitessce would inherit.

Only `spatialBeta` and `layerControllerBeta` are targeted, not the legacy `spatial` and `layerController` views.

## Architecture

- Each loader (`NiftiLoader`, `DicomWebLoader`, `DicomLoader`) reads its format into a format-independent `Volume` (`volume.ts`): dimensions, an LPS affine, rescale slope and intercept, a default window, and a `loadRawSlice(z, t)` function.
- `toVolume()` (`dicom.ts`) turns the images of a DICOM series, read from DICOM JSON or Part 10 headers, into a `Volume`.
- `VolumeLoader` turns a `Volume` into an `ImageWrapper`, using:
  - `createSliceSource()`: a single-resolution Viv `PixelSource` that loads and caches one slice per `getRaster` call.
  - `toNgffMetadata()`: synthesized OME-NGFF `multiscales` and `omero` metadata, which `ImageWrapper` already understands.
  - The `ImageWrapper` is created with the image type `'radiology'`, so `getType()` does not report the synthesized metadata as OME-Zarr.
- `dicom-parser` and `nifti-reader-js` are imported on first use, so they are not in the main bundle.

## Geometry

- World space is DICOM LPS. NIfTI affines (RAS) are converted by negating their x and y rows. Display space negates z, so deck.gl's y-down view gives the radiological convention (patient right on screen left), matching OHIF. Niivue defaults to the neurological convention, so switch it to radiological when comparing.
- Axes that point in a negative display direction are flipped in the pixel data when slices load, so every scale is positive. `ImageWrapper.getBoundingCube()` assumes ranges of `[0, scale * size]`, so negative scales would break 3D clipping planes.
- Oblique rotation is dropped with a warning.
- Millimeters are converted to micrometers, because the beta spatial stack (including the scale bar) assumes micrometers.
- The z translation is dropped. Scanner table positions (for example, -1846 mm) put the image beyond the orthographic camera's far plane, and 2D views select slices by index. Follow-up: restore z alignment between series for 3D overlays.

## Pixel values

- DICOM slices are sorted by `ImagePositionPatient` projected onto the slice normal, not by `InstanceNumber`. Slice spacing is the median gap, and uneven spacing logs a warning. Images that do not match the rest of a series (such as localizers) are skipped with a warning.
- The modality LUT (`value * slope + intercept`) is applied when slices load. Results use `Int16Array` when they are integers that fit in 16 bits (CT in HU), and `Float32Array` otherwise. Series with a different rescale per slice (often PET) are rescaled per slice into `Float32Array`. PET values are not converted to SUV.
- `getRaster` returns a copy, because Viv's `getChannelStats` reorders rasters in place.
- Each image caches up to 256 MB of displayed slices, and evicts the least recently used slice when the cache is full. Volumes larger than that are read again when 3D mode is turned off and on.

## Codecs and workers

- JPEG-LS, JPEG 2000, and HTJ2K use the Cornerstone WebAssembly codecs. Their JavaScript is bundled, and their `.wasm` files are fetched from jsDelivr on first use and passed to the module as bytes. This avoids bundler `.wasm` handling, which is the same reason parquet-wasm is loaded from a CDN. Versions are pinned exactly in the catalog, because the bundled JavaScript must match the fetched `.wasm`.
- TODO: host the `.wasm` files on `cdn.vitessce.io` by adding the codec packages to `scripts/sync-cdn.mjs`, then update `WASM_URLS` in `packages/radiology-workers/src/decoders.js`.
- JPEG Lossless uses `jpeg-lossless-decoder-js`. RLE Lossless is decoded by `decodeRle`. Lossy JPEG (Baseline, Extended) is not supported, because it is rare for CT and MR.
- Decoding runs in a pool of 4 web workers. Each worker holds its own codec memory, so the pool is not one worker per core. The worker is in `@vitessce/radiology-workers`, which Rollup builds with the worker inlined into `dist/index.js`. An inlined worker does not depend on a relative worker URL, which fails when Vitessce is loaded from a CDN. Vite's `?worker&inline` was not used, because the docs site's webpack build reads the packages' `dist-tsc` output. `@vitessce/radiology` imports the worker package lazily, because it includes the codecs.
- The decoders are also exported as `@vitessce/radiology-workers/decoders` and run on the main thread when `Worker` is unavailable, as in unit tests (the `jsdom-worker` polyfill cannot run inline workers).
- On a 32-core desktop, workers loaded compressed volumes about 30% faster than main-thread decoding.

## Format notes

- **DICOMweb**: the `url` is the series URL. Frames are requested as Explicit VR Little Endian. A server that cannot transcode answers 406, and the request is repeated with `transfer-syntax=*`. Some servers (such as OHIF's static demo server) ignore the requested transfer syntax and return compressed frames, which are decoded. OHIF's demo server also omits the multipart `boundary` parameter, so the delimiter is read from the first line of the body.
- **`.dcm`**: headers are read with growing range requests until the PixelData tag, and the pixel data of each slice is read with a range request when it is displayed. When a server ignores `Range` and sends the whole file, the file is kept. Compressed pixel data is read to the end of the file and its fragments are joined (one frame per file). Multi-frame files are split into one slice per frame, using the per-frame and shared functional groups.
- In the jsdom test environment, `Headers` drops the `Range` header, so `DicomLoader.test.ts` stubs it with Node's `Headers`.

## Known gaps

- The accelerated 3D renderer (`spatialBeta` with the `accelerated` prop) reads Zarr chunks directly, so it does not support radiology images. It reports an error, because `getType()` returns `'radiology'`.
- Not supported: compressed multi-frame `.dcm` files, multi-frame instances over DICOMweb, `MONOCHROME1`, color images, big-endian data, oblique rotation, reslicing, and DICOM-SEG or NIfTI label maps as `obsSegmentations`.

## Milestone 2 candidates

Ordered by value to radiology users. None of these are started.

1. **Segmentations.** Load DICOM-SEG series and NIfTI label maps as `obsSegmentations`, so that segments (such as tumor masks) can be colored, selected, and linked to obs sets and other views. This is where Vitessce adds something that radiology viewers like OHIF do not. IDC hosts many SEG series to validate against. A label map has the same grid as an image, so it could reuse `Volume` and `createSliceSource`, with a bitmask loader instead of an image loader. Check how `spatialBeta` renders bitmask segmentations in 3D before scoping this.
2. **Axial, coronal, and sagittal views.** Radiologists expect three orthogonal views of a volume. The 2D views only draw slices along the stored z axis. A slice source could read along another axis, with an option to choose the plane in each view. A coronal or sagittal slice needs every stored slice, so the whole volume must be loaded first (as 3D mode already does), and the slice cache limit applies. A crosshair that links the three views would come later. Oblique rotation could be handled by the same reslicing.
3. **Series alignment.** The z translation is dropped from the model matrix (see Geometry), so different series of a study (such as T1, T2, and FLAIR MR, or PET with CT) do not line up in 3D, and `spatialTargetZ` links views by slice index instead of patient position. Linking by index only works when series share a grid, as in the Synthea comparison demo. Restoring the z translation needs a fix for the 2D camera's far plane, and slice linking needs a position-based coordination value.
4. **Compressed multi-frame files.** Enhanced CT and MR (one multi-frame file per series) are common from modern scanners. Compressed frames of a multi-frame file are not split yet: this needs the basic or extended offset table to find each frame's fragments. Over DICOMweb, multi-frame instances need one frame request per frame number (`frames/{n}`).
5. **Rarer formats.** `MONOCHROME1` (inverted grayscale, mostly radiographs), color images (such as ultrasound), lossy JPEG (Baseline and Extended), and big-endian data.
6. **Window presets.** A menu of common CT windows in the layer controller, such as brain (40/80), soft tissue (40/400), lung (-600/1500), and bone (400/1800). MR values have no standard units, so presets only apply to CT.
7. **Python package.** Check whether the `vitessce` Python package needs the new file types (`image.nifti`, `image.dicomweb`, `image.dicom`) before they can be used from Jupyter.

## Validation

Pixel values were checked against independent decodes (pydicom, nibabel, or imagecodecs), and slices were compared visually against the IDC OHIF viewer and Niivue, using the demo configs in `examples/configs/src/view-configs/radiology/`. The IDC DICOMweb proxy has a daily per-IP quota, so CI must not depend on it. No public CT or MR examples were found for HTJ2K and RLE, so they are covered only by unit test fixtures.
