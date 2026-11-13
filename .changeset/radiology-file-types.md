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

Add the `image.nifti`, `image.dicomweb`, and `image.dicom` file types for radiology volumes (such as CT and MR) in the `spatialBeta` and `layerControllerBeta` views. DICOM pixel data can be uncompressed or compressed with lossy JPEG, JPEG Lossless, JPEG-LS, JPEG 2000, HTJ2K, or RLE Lossless. The DICOM file types also read multi-frame images (such as Enhanced CT and MR), big-endian files, `MONOCHROME1` images such as radiographs, and color images such as ultrasound cine loops (shown as RGB, with frames as time points). All three file types accept an optional `name`. Compressed frames are decoded in a pool of web workers from the new `@vitessce/radiology-workers` package. The `Pool` class in `@vitessce/utils` accepts an optional number of workers. `ImageWrapper` accepts an optional image type, and `getType()` returns `'radiology'` for these images.
