---
"@vitessce/annotation-controller": patch
"@vitessce/all": patch
---

Add `hasAnyAnnotationStory` function, which detects whether a view config contains a non-empty annotation story. Add `removeAnnotationControllerView` function, which removes the annotationController view and stretches the remaining views to fill the full grid width. In `addAnnotationControllerView`, match the height of the new view to the tallest column of existing views.
