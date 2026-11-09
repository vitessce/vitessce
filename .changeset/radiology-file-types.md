---
"@vitessce/radiology": minor
"@vitessce/radiology-workers": minor
"@vitessce/utils": minor
"@vitessce/image-utils": minor
"@vitessce/types": minor
"@vitessce/constants-internal": minor
"@vitessce/schemas": minor
"@vitessce/all": minor
---

Add the `image.nifti`, `image.dicomweb`, and `image.dicom` file types for single-channel radiology volumes (such as CT and MR) in the `spatialBeta` and `layerControllerBeta` views. DICOM pixel data can be uncompressed or compressed with JPEG Lossless, JPEG-LS, JPEG 2000, HTJ2K, or RLE Lossless. `image.dicom` also reads uncompressed multi-frame files, and all three file types accept an optional `name`. Compressed frames are decoded in a pool of web workers from the new `@vitessce/radiology-workers` package. The `Pool` class in `@vitessce/utils` accepts an optional number of workers. `ImageWrapper` accepts an optional image type, and `getType()` returns `'radiology'` for these images.
