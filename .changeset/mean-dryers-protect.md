---
"@vitessce/vit-s": patch
---

Fixes a bug in which DataSource classes were not selected correctly following JS bundle minification, as the class names were being mapped to conflicting minified strings.
