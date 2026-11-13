# Radiology images (DICOMweb, `.dcm`, NIfTI)

Design notes for `@vitessce/radiology` (`image.dicomweb`, `image.dicom`, `image.nifti`) and `@vitessce/radiology-workers`. User-facing behavior is documented in `sites/docs/docs/data-file-types.mdx`.

## Rendering through Viv

`spatialBeta` and `layerControllerBeta` consume images only through `ImageWrapper` (`getData()` returning Viv pixel sources, and `getModelMatrix()`). A source that produces Viv pixel sources gets all existing image coordination (window, color, visibility, opacity, Z slider, 3D mode) without view changes. A Cornerstone view type was rejected: it would need a second rendering stack (vtk.js), hand-written coordination wiring (the Neuroglancer integration is about 9.1k lines), and WASM/worker bundler configuration that every downstream consumer of Vitessce would inherit.

Only `spatialBeta` and `layerControllerBeta` are targeted, not the legacy `spatial` and `layerController` views.

## Architecture

- Each loader (`NiftiLoader`, `DicomWebLoader`, `DicomLoader`) reads its format into a format-independent `Volume` (`volume.ts`): dimensions, an LPS affine, rescale slope and intercept, a default window, and a `loadRawSlice(z, t)` function.
- `toVolume()` (`dicom.ts`) turns the images of a DICOM series into a `Volume`. The two DICOM loaders read attributes through a small `DicomAttributes` adapter (over DICOM JSON or a dicom-parser `DataSet`), so `readImage()` and `readFrames()` (which splits multi-frame images into frames, using their functional groups) are shared.
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
- RGB volumes have three channels (red, green, and blue), with OME-NGFF `omero.rdefs.model: 'color'`, which `ImageWrapper` reports as `photometricInterpretation: 'RGB'`. The views draw them like RGB OME-Zarr images. Their window is the range of the stored values.
- `MONOCHROME1` images are inverted when slices load, by negating the slope and shifting the intercept so that values keep the same range (for example, 0 to 4095 stays 0 to 4095). Viv cannot invert a window, because its shader clamps the window width to a positive value.
- `getRaster` returns a copy, because Viv's `getChannelStats` reorders rasters in place.
- Each image caches up to 256 MB of displayed slices, and evicts the least recently used slice when the cache is full. Volumes larger than that are read again when 3D mode is turned off and on.

## Codecs and workers

- Lossy JPEG, JPEG-LS, JPEG 2000, and HTJ2K use the Cornerstone WebAssembly codecs. Their JavaScript is bundled, and their `.wasm` files are fetched from jsDelivr on first use and passed to the module as bytes. This avoids bundler `.wasm` handling, which is the same reason parquet-wasm is loaded from a CDN. Versions are pinned exactly in the catalog, because the bundled JavaScript must match the fetched `.wasm`.
- TODO: host the `.wasm` files on `cdn.vitessce.io` by adding the codec packages to `scripts/sync-cdn.mjs`, then update `WASM_URLS` in `packages/radiology-workers/src/decoders.js`.
- Lossy JPEG uses libjpeg-turbo (`@cornerstonejs/codec-libjpeg-turbo-8bit`), which only decodes 8-bit data, so 12-bit JPEG Extended is not supported. libjpeg-turbo was preferred over the browser's own JPEG decoder (`createImageBitmap` in a worker), because the latter cannot run in unit tests.
- JPEG Lossless uses `jpeg-lossless-decoder-js`. RLE Lossless is decoded by `decodeRle`.
- `decodeFrame` returns color frames as RGB, with a plane per sample (all red values, then green, then blue), which is the layout of the slice source. The codecs return interleaved samples, except RLE (a segment per sample) and JPEG-LS without interleaving (mode 0). `YBR_FULL` and `YBR_FULL_422` are converted to RGB after decoding, except for lossy JPEG, which libjpeg-turbo converts. JPEG 2000 and HTJ2K decoders convert `YBR_ICT` and `YBR_RCT`.
- libjpeg-turbo decodes 3-component JPEG without a JFIF or Adobe marker as YCbCr. Some DICOM files with `PhotometricInterpretation` `RGB` store RGB samples that way (such as pydicom's `SC_jpeg_no_color_transform.dcm`), so an Adobe marker with no color transform is inserted before decoding them.
- Only the frame's shape is sent to workers, because the image objects can hold whole files.
- Decoding runs in a pool of 4 web workers. Each worker holds its own codec memory, so the pool is not one worker per core. The worker is in `@vitessce/radiology-workers`, which Rollup builds with the worker inlined into `dist/index.js`. An inlined worker does not depend on a relative worker URL, which fails when Vitessce is loaded from a CDN. Vite's `?worker&inline` was not used, because the docs site's webpack build reads the packages' `dist-tsc` output. `@vitessce/radiology` imports the worker package lazily, because it includes the codecs.
- The decoders are also exported as `@vitessce/radiology-workers/decoders` and run on the main thread when `Worker` is unavailable, as in unit tests (the `jsdom-worker` polyfill cannot run inline workers).
- On a 32-core desktop, workers loaded compressed volumes about 30% faster than main-thread decoding.

## Format notes

- **DICOMweb**: the `url` is the series URL. Each frame of a multi-frame instance is requested from `frames/{n}`. Grayscale frames are requested as Explicit VR Little Endian. Color frames are requested as stored, because a server that decompresses a `YBR_FULL_422` JPEG may convert it to RGB, while the metadata still says `YBR_FULL_422`. The `image/jpeg` media type is used for both lossy and lossless JPEG, so the transfer syntax of these frames is read from their start-of-frame marker. A server that cannot transcode answers 406, and the request is repeated with `transfer-syntax=*`. Some servers (such as OHIF's static demo server) ignore the requested transfer syntax and return compressed frames, which are decoded. OHIF's demo server also omits the multipart `boundary` parameter, so the delimiter is read from the first line of the body.
- **`.dcm`**: headers are read with growing range requests until the PixelData tag, and the pixel data of each slice is read with a range request when it is displayed. When a server ignores `Range` and sends the whole file, the file is kept. Compressed pixel data is read to the end of the file and its fragments are joined (one frame per file). Multi-frame files are split into one slice per frame, using the per-frame and shared functional groups. For compressed multi-frame files, the Basic Offset Table is read with one more range request, and gives the bytes of each frame. Without an offset table, the whole file is read once, and each frame must be one fragment. The Extended Offset Table is not supported: dicom-parser 1.8 does not know its value representation (`OV`), so these files fail with a parse error.
- Explicit VR Big Endian (retired, but found in older archives) is parsed by dicom-parser, and its pixel values are swapped to little-endian by the decoder. 8-bit big-endian pixel data stored as 16-bit words (`OW`) would need its bytes swapped in pairs, across frame boundaries, so it is rejected.
- The frames of a multi-frame image without per-frame functional groups (such as an ultrasound cine loop, or a multi-frame secondary capture) are time points of one slice, in frame order.
- A single image without `ImagePositionPatient` and `ImageOrientationPatient`, such as a radiograph, is placed at the origin, with `ImagerPixelSpacing` when it has no `PixelSpacing`. A spacing of 0 (seen in radiographs whose spacing is unknown) is treated as 1 mm.
- In the jsdom test environment, `Headers` drops the `Range` header, so `DicomLoader.test.ts` stubs it with Node's `Headers`.

## Known gaps

- The accelerated 3D renderer (`spatialBeta` with the `accelerated` prop) reads Zarr chunks directly, so it does not support radiology images. It reports an error, because `getType()` returns `'radiology'`.
- Not supported: `PALETTE COLOR` (common in ultrasound: needs a lookup through the palette tables, which DICOMweb sends as bulk data), uncompressed `YBR_FULL_422` (two luma values per chroma pair), 12-bit lossy JPEG, the physical size of ultrasound pixels (from `SequenceOfUltrasoundRegions`), the Extended Offset Table, deflated transfer syntaxes, oblique rotation, reslicing, and DICOM-SEG or NIfTI label maps as `obsSegmentations`.

## Milestone 2 candidates

Ordered by value to radiology users. Items 4 and 5 are mostly done; the others are not started.

1. **Segmentations.** Load DICOM-SEG series and NIfTI label maps as `obsSegmentations`, so that segments (such as tumor masks) can be colored, selected, and linked to obs sets and other views. This is where Vitessce adds something that radiology viewers like OHIF do not. IDC hosts many SEG series to validate against. A label map has the same grid as an image, so it could reuse `Volume` and `createSliceSource`, with a bitmask loader instead of an image loader. Check how `spatialBeta` renders bitmask segmentations in 3D before scoping this.
2. **Axial, coronal, and sagittal views.** Radiologists expect three orthogonal views of a volume. The 2D views only draw slices along the stored z axis. A slice source could read along another axis, with an option to choose the plane in each view. A coronal or sagittal slice needs every stored slice, so the whole volume must be loaded first (as 3D mode already does), and the slice cache limit applies. A crosshair that links the three views would come later. Oblique rotation could be handled by the same reslicing.
3. **Series alignment.** The z translation is dropped from the model matrix (see Geometry), so different series of a study (such as T1, T2, and FLAIR MR, or PET with CT) do not line up in 3D, and `spatialTargetZ` links views by slice index instead of patient position. Linking by index only works when series share a grid, as in the Synthea comparison demo. Restoring the z translation needs a fix for the 2D camera's far plane, and slice linking needs a position-based coordination value.
4. ~~**Compressed multi-frame files.**~~ Done, except for the Extended Offset Table, which needs dicom-parser to support `OV`. Multi-frame instances over DICOMweb are also done.
5. ~~**Rarer formats.**~~ `MONOCHROME1`, big-endian data, color, lossy JPEG, and ultrasound cine loops are done. Remaining: `PALETTE COLOR` and the physical size of ultrasound pixels.
6. **Window presets.** A menu of common CT windows in the layer controller, such as brain (40/80), soft tissue (40/400), lung (-600/1500), and bone (400/1800). MR values have no standard units, so presets only apply to CT.
7. **Python package.** Check whether the `vitessce` Python package needs the new file types (`image.nifti`, `image.dicomweb`, `image.dicom`) before they can be used from Jupyter.

## Validation

Pixel values were checked against independent decodes (pydicom, nibabel, or imagecodecs), and slices were compared visually against the IDC OHIF viewer and Niivue, using the demo configs in `examples/configs/src/view-configs/radiology/`. The IDC DICOMweb proxy has a daily per-IP quota, so CI must not depend on it. No public CT or MR examples were found for HTJ2K and RLE, so they are covered only by unit test fixtures.

Multi-frame, big-endian, and `MONOCHROME1` support was checked against pydicom on these files, served locally with range requests:

- Enhanced CT built with highdicom (`LegacyConvertedEnhancedCTImage`) from the 166 slices of the NLST demo series, saved uncompressed, as RLE Lossless with and without a Basic Offset Table, and as JPEG-LS with one. Every frame matched.
- The pydicom test files `MR_small_bigendian.dcm` (big-endian MR) and `RG1_UNCR.dcm`, `RG1_J2KR.dcm`, and `RG3_UNCR.dcm` (`MONOCHROME1` CR radiographs without a position, uncompressed and JPEG 2000).
- The 61 color test files of pydicom, compared with pydicom's decode (with Pillow for lossy JPEG). 57 matched exactly, including lossy JPEG (`RGB`, `YBR_FULL`, and `YBR_FULL_422`), JPEG-LS with line and sample interleaving, JPEG 2000 (`YBR_ICT` and `YBR_RCT`), HTJ2K, RLE, 16-bit and 32-bit samples, planar configuration 1, big-endian data, and the 120-frame ultrasound cine `color3d_jpeg_baseline.dcm` (first, middle, and last frames). Lossy HTJ2K differed by at most 1 in 0.07% of values. The other 3 files are rejected: a malformed file that pydicom cannot read either, uncompressed `YBR_FULL_422`, and 8-bit `OW` big-endian data.
