const FileType = {
  // Joint file types
  ANNDATA_ZARR: "anndata.zarr",
  ANNDATA_ZARR_ZIP: "anndata.zarr.zip",
  SPATIALDATA_ZARR: "spatialdata.zarr",
  // Atomic file types
  OBS_EMBEDDING_CSV: "obsEmbedding.csv",
  OBS_SPOTS_CSV: "obsSpots.csv",
  OBS_POINTS_CSV: "obsPoints.csv",
  OBS_LOCATIONS_CSV: "obsLocations.csv",
  OBS_LABELS_CSV: "obsLabels.csv",
  FEATURE_LABELS_CSV: "featureLabels.csv",
  OBS_FEATURE_MATRIX_CSV: "obsFeatureMatrix.csv",
  OBS_SEGMENTATIONS_JSON: "obsSegmentations.json",
  OBS_SETS_CSV: "obsSets.csv",
  OBS_SETS_JSON: "obsSets.json",
  SAMPLE_SETS_CSV: "sampleSets.csv",
  // OME-Zarr
  IMAGE_OME_ZARR: "image.ome-zarr",
  OBS_SEGMENTATIONS_OME_ZARR: "obsSegmentations.ome-zarr",
  // AnnData
  OBS_FEATURE_MATRIX_ANNDATA_ZARR: "obsFeatureMatrix.anndata.zarr",
  OBS_FEATURE_COLUMNS_ANNDATA_ZARR: "obsFeatureColumns.anndata.zarr",
  OBS_SETS_ANNDATA_ZARR: "obsSets.anndata.zarr",
  OBS_EMBEDDING_ANNDATA_ZARR: "obsEmbedding.anndata.zarr",
  OBS_SPOTS_ANNDATA_ZARR: "obsSpots.anndata.zarr",
  OBS_POINTS_ANNDATA_ZARR: "obsPoints.anndata.zarr",
  OBS_LOCATIONS_ANNDATA_ZARR: "obsLocations.anndata.zarr",
  OBS_SEGMENTATIONS_ANNDATA_ZARR: "obsSegmentations.anndata.zarr",
  OBS_LABELS_ANNDATA_ZARR: "obsLabels.anndata.zarr",
  FEATURE_LABELS_ANNDATA_ZARR: "featureLabels.anndata.zarr",
  SAMPLE_EDGES_ANNDATA_ZARR: "sampleEdges.anndata.zarr",
  // AnnData - zipped
  OBS_FEATURE_MATRIX_ANNDATA_ZARR_ZIP: "obsFeatureMatrix.anndata.zarr.zip",
  OBS_FEATURE_COLUMNS_ANNDATA_ZARR_ZIP: "obsFeatureColumns.anndata.zarr.zip",
  OBS_SETS_ANNDATA_ZARR_ZIP: "obsSets.anndata.zarr.zip",
  OBS_EMBEDDING_ANNDATA_ZARR_ZIP: "obsEmbedding.anndata.zarr.zip",
  OBS_SPOTS_ANNDATA_ZARR_ZIP: "obsSpots.anndata.zarr.zip",
  OBS_POINTS_ANNDATA_ZARR_ZIP: "obsPoints.anndata.zarr.zip",
  OBS_LOCATIONS_ANNDATA_ZARR_ZIP: "obsLocations.anndata.zarr.zip",
  OBS_SEGMENTATIONS_ANNDATA_ZARR_ZIP: "obsSegmentations.anndata.zarr.zip",
  OBS_LABELS_ANNDATA_ZARR_ZIP: "obsLabels.anndata.zarr.zip",
  FEATURE_LABELS_ANNDATA_ZARR_ZIP: "featureLabels.anndata.zarr.zip",
  SAMPLE_EDGES_ANNDATA_ZARR_ZIP: "sampleEdges.anndata.zarr.zip",
  // SpatialData
  IMAGE_SPATIALDATA_ZARR: "image.spatialdata.zarr",
  LABELS_SPATIALDATA_ZARR: "labels.spatialdata.zarr",
  SHAPES_SPATIALDATA_ZARR: "shapes.spatialdata.zarr",
  OBS_FEATURE_MATRIX_SPATIALDATA_ZARR: "obsFeatureMatrix.spatialdata.zarr",
  OBS_SETS_SPATIALDATA_ZARR: "obsSets.spatialdata.zarr",
  OBS_SPOTS_SPATIALDATA_ZARR: "obsSpots.spatialdata.zarr",
  FEATURE_LABELS_SPATIALDATA_ZARR: "featureLabels.spatialdata.zarr",
  // TODO:
  // OBS_POINTS_SPATIALDATA_ZARR: 'obsPoints.spatialdata.zarr',
  // OBS_LOCATIONS_SPATIALDATA_ZARR: 'obsLocations.spatialdata.zarr',
  // MuData
  OBS_FEATURE_MATRIX_MUDATA_ZARR: "obsFeatureMatrix.mudata.zarr",
  OBS_SETS_MUDATA_ZARR: "obsSets.mudata.zarr",
  OBS_EMBEDDING_MUDATA_ZARR: "obsEmbedding.mudata.zarr",
  OBS_SPOTS_MUDATA_ZARR: "obsSpots.mudata.zarr",
  OBS_POINTS_MUDATA_ZARR: "obsPoints.mudata.zarr",
  OBS_LOCATIONS_MUDATA_ZARR: "obsLocations.mudata.zarr",
  OBS_SEGMENTATIONS_MUDATA_ZARR: "obsSegmentations.mudata.zarr",
  OBS_LABELS_MUDATA_ZARR: "obsLabels.mudata.zarr",
  FEATURE_LABELS_MUDATA_ZARR: "featureLabels.mudata.zarr",
  GENOMIC_PROFILES_ZARR: "genomic-profiles.zarr",
  NEIGHBORHOODS_JSON: "neighborhoods.json",
  // OME-TIFF
  IMAGE_OME_TIFF: "image.ome-tiff",
  OBS_SEGMENTATIONS_OME_TIFF: "obsSegmentations.ome-tiff",
  // GLB
  OBS_SEGMENTATIONS_GLB: "obsSegmentations.glb",
  // New file types to support old file types:
  // - cells.json
  OBS_EMBEDDING_CELLS_JSON: "obsEmbedding.cells.json",
  OBS_SEGMENTATIONS_CELLS_JSON: "obsSegmentations.cells.json",
  OBS_LOCATIONS_CELLS_JSON: "obsLocations.cells.json",
  OBS_LABELS_CELLS_JSON: "obsLabels.cells.json",
  // - cell-sets.json
  OBS_SETS_CELL_SETS_JSON: "obsSets.cell-sets.json",
  // - genes.json
  OBS_FEATURE_MATRIX_GENES_JSON: "obsFeatureMatrix.genes.json",
  // - clusters.json
  OBS_FEATURE_MATRIX_CLUSTERS_JSON: "obsFeatureMatrix.clusters.json",
  // - expression-matrix.zarr
  OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR: "obsFeatureMatrix.expression-matrix.zarr",
  // - raster.json
  IMAGE_RASTER_JSON: "image.raster.json",
  OBS_SEGMENTATIONS_RASTER_JSON: "obsSegmentations.raster.json",
  // - molecules.json
  OBS_LOCATIONS_MOLECULES_JSON: "obsLocations.molecules.json",
  OBS_LABELS_MOLECULES_JSON: "obsLabels.molecules.json",
  // Legacy joint file types
  CELLS_JSON: "cells.json",
  CELL_SETS_JSON: "cell-sets.json",
  ANNDATA_CELL_SETS_ZARR: "anndata-cell-sets.zarr",
  ANNDATA_CELLS_ZARR: "anndata-cells.zarr",
  EXPRESSION_MATRIX_ZARR: "expression-matrix.zarr",
  MOLECULES_JSON: "molecules.json",
  RASTER_JSON: "raster.json",
  RASTER_OME_ZARR: "raster.ome-zarr",
  CLUSTERS_JSON: "clusters.json",
  GENES_JSON: "genes.json",
  ANNDATA_EXPRESSION_MATRIX_ZARR: "anndata-expression-matrix.zarr"
};
const CoordinationType = {
  META_COORDINATION_SCOPES: "metaCoordinationScopes",
  META_COORDINATION_SCOPES_BY: "metaCoordinationScopesBy",
  DATASET: "dataset",
  // Entity types
  OBS_TYPE: "obsType",
  FEATURE_TYPE: "featureType",
  FEATURE_VALUE_TYPE: "featureValueType",
  OBS_LABELS_TYPE: "obsLabelsType",
  // Other types
  EMBEDDING_TYPE: "embeddingType",
  EMBEDDING_ZOOM: "embeddingZoom",
  EMBEDDING_ROTATION: "embeddingRotation",
  EMBEDDING_TARGET_X: "embeddingTargetX",
  EMBEDDING_TARGET_Y: "embeddingTargetY",
  EMBEDDING_TARGET_Z: "embeddingTargetZ",
  EMBEDDING_OBS_SET_POLYGONS_VISIBLE: "embeddingObsSetPolygonsVisible",
  EMBEDDING_OBS_SET_LABELS_VISIBLE: "embeddingObsSetLabelsVisible",
  EMBEDDING_OBS_SET_LABEL_SIZE: "embeddingObsSetLabelSize",
  EMBEDDING_OBS_RADIUS: "embeddingObsRadius",
  EMBEDDING_OBS_RADIUS_MODE: "embeddingObsRadiusMode",
  EMBEDDING_OBS_OPACITY: "embeddingObsOpacity",
  EMBEDDING_OBS_OPACITY_MODE: "embeddingObsOpacityMode",
  SPATIAL_ZOOM: "spatialZoom",
  SPATIAL_ROTATION: "spatialRotation",
  SPATIAL_TARGET_X: "spatialTargetX",
  SPATIAL_TARGET_Y: "spatialTargetY",
  SPATIAL_TARGET_Z: "spatialTargetZ",
  SPATIAL_TARGET_T: "spatialTargetT",
  SPATIAL_ROTATION_X: "spatialRotationX",
  SPATIAL_ROTATION_Y: "spatialRotationY",
  SPATIAL_ROTATION_Z: "spatialRotationZ",
  SPATIAL_ROTATION_ORBIT: "spatialRotationOrbit",
  SPATIAL_ORBIT_AXIS: "spatialOrbitAxis",
  SPATIAL_AXIS_FIXED: "spatialAxisFixed",
  HEATMAP_ZOOM_X: "heatmapZoomX",
  HEATMAP_ZOOM_Y: "heatmapZoomY",
  HEATMAP_TARGET_X: "heatmapTargetX",
  HEATMAP_TARGET_Y: "heatmapTargetY",
  OBS_FILTER: "obsFilter",
  OBS_HIGHLIGHT: "obsHighlight",
  OBS_SET_SELECTION: "obsSetSelection",
  OBS_SET_HIGHLIGHT: "obsSetHighlight",
  OBS_SET_EXPANSION: "obsSetExpansion",
  OBS_SET_COLOR: "obsSetColor",
  FEATURE_FILTER: "featureFilter",
  FEATURE_HIGHLIGHT: "featureHighlight",
  FEATURE_SELECTION: "featureSelection",
  FEATURE_VALUE_COLORMAP: "featureValueColormap",
  FEATURE_VALUE_TRANSFORM: "featureValueTransform",
  FEATURE_VALUE_COLORMAP_RANGE: "featureValueColormapRange",
  OBS_COLOR_ENCODING: "obsColorEncoding",
  SPATIAL_IMAGE_LAYER: "spatialImageLayer",
  SPATIAL_SEGMENTATION_LAYER: "spatialSegmentationLayer",
  SPATIAL_POINT_LAYER: "spatialPointLayer",
  SPATIAL_NEIGHBORHOOD_LAYER: "spatialNeighborhoodLayer",
  GENOMIC_ZOOM_X: "genomicZoomX",
  GENOMIC_ZOOM_Y: "genomicZoomY",
  GENOMIC_TARGET_X: "genomicTargetX",
  GENOMIC_TARGET_Y: "genomicTargetY",
  ADDITIONAL_OBS_SETS: "additionalObsSets",
  // TODO: use obsHighlight rather than moleculeHighlight.
  MOLECULE_HIGHLIGHT: "moleculeHighlight",
  GATING_FEATURE_SELECTION_X: "gatingFeatureSelectionX",
  GATING_FEATURE_SELECTION_Y: "gatingFeatureSelectionY",
  FEATURE_VALUE_TRANSFORM_COEFFICIENT: "featureValueTransformCoefficient",
  TOOLTIPS_VISIBLE: "tooltipsVisible",
  FILE_UID: "fileUid",
  IMAGE_LAYER: "imageLayer",
  IMAGE_CHANNEL: "imageChannel",
  SEGMENTATION_LAYER: "segmentationLayer",
  SEGMENTATION_CHANNEL: "segmentationChannel",
  SPATIAL_TARGET_C: "spatialTargetC",
  SPATIAL_LAYER_VISIBLE: "spatialLayerVisible",
  SPATIAL_LAYER_OPACITY: "spatialLayerOpacity",
  SPATIAL_LAYER_COLORMAP: "spatialLayerColormap",
  SPATIAL_LAYER_TRANSPARENT_COLOR: "spatialLayerTransparentColor",
  SPATIAL_LAYER_MODEL_MATRIX: "spatialLayerModelMatrix",
  SPATIAL_SEGMENTATION_FILLED: "spatialSegmentationFilled",
  SPATIAL_SEGMENTATION_STROKE_WIDTH: "spatialSegmentationStrokeWidth",
  SPATIAL_CHANNEL_COLOR: "spatialChannelColor",
  SPATIAL_CHANNEL_VISIBLE: "spatialChannelVisible",
  SPATIAL_CHANNEL_OPACITY: "spatialChannelOpacity",
  SPATIAL_CHANNEL_WINDOW: "spatialChannelWindow",
  PHOTOMETRIC_INTERPRETATION: "photometricInterpretation",
  // For 3D volume rendering
  SPATIAL_RENDERING_MODE: "spatialRenderingMode",
  // For whole spatial view
  VOLUMETRIC_RENDERING_ALGORITHM: "volumetricRenderingAlgorithm",
  // Could be per-image-layer
  SPATIAL_TARGET_RESOLUTION: "spatialTargetResolution",
  // Per-spatial-layer
  // For clipping plane sliders
  SPATIAL_SLICE_X: "spatialSliceX",
  SPATIAL_SLICE_Y: "spatialSliceY",
  SPATIAL_SLICE_Z: "spatialSliceZ",
  // For spatial spot and point layers
  SPOT_LAYER: "spotLayer",
  POINT_LAYER: "pointLayer",
  SPATIAL_SPOT_RADIUS: "spatialSpotRadius",
  // In micrometers?
  SPATIAL_SPOT_FILLED: "spatialSpotFilled",
  SPATIAL_SPOT_STROKE_WIDTH: "spatialSpotStrokeWidth",
  SPATIAL_LAYER_COLOR: "spatialLayerColor",
  PIXEL_HIGHLIGHT: "pixelHighlight",
  // Per-image-layer
  TOOLTIP_CROSSHAIRS_VISIBLE: "tooltipCrosshairsVisible",
  LEGEND_VISIBLE: "legendVisible",
  SPATIAL_CHANNEL_LABELS_VISIBLE: "spatialChannelLabelsVisible",
  SPATIAL_CHANNEL_LABELS_ORIENTATION: "spatialChannelLabelsOrientation",
  SPATIAL_CHANNEL_LABEL_SIZE: "spatialChannelLabelSize",
  // Multi-sample / comparative
  SAMPLE_TYPE: "sampleType",
  SAMPLE_SET_SELECTION: "sampleSetSelection"
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var pluralize = { exports: {} };
(function(module, exports) {
  (function(root, pluralize2) {
    if (typeof commonjsRequire === "function" && true && true) {
      module.exports = pluralize2();
    } else {
      root.pluralize = pluralize2();
    }
  })(commonjsGlobal, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index) {
        return args[index] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.isPlural = checkWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.singular = replaceWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.isSingular = checkWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      // Pronouns.
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      // Words ending in with a consonant and `o`.
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      // Ends with `us`.
      ["genus", "genera"],
      ["viscus", "viscera"],
      // Ends with `ma`.
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      // Other irregular rules.
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      // Singular words with no plurals.
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      // Regexes.
      /[^aeiou]ese$/i,
      // "chinese", "japanese"
      /deer$/i,
      // "deer", "reindeer"
      /fish$/i,
      // "fish", "blowfish", "angelfish"
      /measles$/i,
      /o[iu]s$/i,
      // "carnivorous"
      /pox$/i,
      // "chickpox", "smallpox"
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
})(pluralize);
var pluralizeExports = pluralize.exports;
const plur = /* @__PURE__ */ getDefaultExportFromCjs(pluralizeExports);
plur.addPluralRule("glomerulus", "glomeruli");
plur.addPluralRule("interstitium", "interstitia");
function getNextScope(prevScopes) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nextCharIndices = [0];
  function next() {
    const r = [];
    nextCharIndices.forEach((charIndex) => {
      r.unshift(chars[charIndex]);
    });
    let increment = true;
    for (let i = 0; i < nextCharIndices.length; i++) {
      const val = ++nextCharIndices[i];
      if (val >= chars.length) {
        nextCharIndices[i] = 0;
      } else {
        increment = false;
        break;
      }
    }
    if (increment) {
      nextCharIndices.push(0);
    }
    return r.join("");
  }
  let nextScope;
  do {
    nextScope = next();
  } while (prevScopes.includes(nextScope));
  return nextScope;
}
function createPrefixedGetNextScopeNumeric(prefix) {
  return (prevScopes) => {
    let nextScopeInt = 0;
    let nextScopeStr;
    do {
      nextScopeStr = `${prefix}${nextScopeInt}`;
      nextScopeInt += 1;
    } while (prevScopes.includes(nextScopeStr));
    return nextScopeStr;
  };
}
function getInitialCoordinationScopePrefix(datasetUid, dataType) {
  return `init_${datasetUid}_${dataType}_`;
}
function getInitialCoordinationScopeName(datasetUid, dataType, i = null) {
  const prefix = getInitialCoordinationScopePrefix(datasetUid, dataType);
  return `${prefix}${i === null ? 0 : i}`;
}
class VitessceConfigDatasetFile {
  /**
   * Construct a new file definition instance.
   * @param {string} url The URL to the file.
   * @param {string} dataType The type of data contained in the file.
   * @param {string} fileType The file type.
   * @param {object|array|null} options An optional object or array
   * which may provide additional parameters to the loader class
   * corresponding to the specified fileType.
   */
  constructor(url, fileType, coordinationValues, options) {
    this.file = {
      url,
      fileType,
      ...coordinationValues ? { coordinationValues } : {},
      ...options ? { options } : {}
    };
  }
  /**
   * @returns {object} This dataset file as a JSON object.
   */
  toJSON() {
    return this.file;
  }
}
class VitessceConfigDataset {
  /**
   * Construct a new dataset definition instance.
   * @param {string} uid The unique ID for the dataset.
   * @param {string} name The name of the dataset.
   * @param {string} description A description for the dataset.
   */
  constructor(uid, name, description) {
    this.dataset = {
      uid,
      name,
      description,
      files: []
    };
  }
  /**
   * Add a file definition to the dataset.
   * @param {object} params An object with named arguments.
   * @param {string|undefined} params.url The URL to the file.
   * @param {string} params.fileType The file type.
   * @param {object|undefined} params.coordinationValues The coordination values.
   * @param {object|array|undefined} params.options An optional object or array
   * which may provide additional parameters to the loader class
   * corresponding to the specified fileType.
   * @returns {VitessceConfigDataset} This, to allow chaining.
   */
  addFile(params, ...args) {
    let url;
    let fileType;
    let coordinationValues;
    let options;
    if (args.length > 0) {
      url = params;
      let dataType;
      if (args.length === 2) {
        [dataType, fileType] = args;
      } else if (args.length === 3) {
        [dataType, fileType, options] = args;
      }
    } else if (typeof params === "object") {
      ({
        url,
        fileType,
        options,
        coordinationValues
      } = params);
    } else {
      throw new Error("Expected addFile argument to be an object.");
    }
    this.dataset.files.push(
      new VitessceConfigDatasetFile(url, fileType, coordinationValues, options)
    );
    return this;
  }
  /**
   * @returns {object} This dataset as a JSON object.
   */
  toJSON() {
    return {
      ...this.dataset,
      files: this.dataset.files.map((f) => f.toJSON())
    };
  }
}
function useCoordinationByObjectHelper(scopes, coordinationScopes, coordinationScopesBy) {
  function processLevel(parentType, parentScope, levelType, levelVal) {
    var _a, _b;
    if (Array.isArray(levelVal)) {
      coordinationScopesBy[parentType] = {
        ...coordinationScopesBy[parentType] || {},
        [levelType]: {
          ...((_a = coordinationScopesBy[parentType]) == null ? void 0 : _a[levelType]) || {},
          [parentScope.cScope]: levelVal.map((childVal) => childVal.scope.cScope)
        }
      };
      levelVal.forEach((childVal) => {
        if (childVal.children) {
          Object.entries(childVal.children).forEach(([nextLevelType, nextLevelVal]) => processLevel(
            levelType,
            childVal.scope,
            nextLevelType,
            nextLevelVal
          ));
        }
      });
    } else {
      coordinationScopesBy[parentType] = {
        ...coordinationScopesBy[parentType] || {},
        [levelType]: {
          ...((_b = coordinationScopesBy[parentType]) == null ? void 0 : _b[levelType]) || {},
          [parentScope.cScope]: levelVal.scope.cScope
        }
      };
      if (levelVal.children) {
        Object.entries(levelVal.children).forEach(([nextLevelType, nextLevelVal]) => processLevel(
          levelType,
          levelVal.scope,
          nextLevelType,
          nextLevelVal
        ));
      }
    }
  }
  Object.entries(scopes).forEach(([topLevelType, topLevelVal]) => {
    if (Array.isArray(topLevelVal)) {
      coordinationScopes[topLevelType] = topLevelVal.map((levelVal) => levelVal.scope.cScope);
      topLevelVal.forEach((levelVal) => {
        if (levelVal.children) {
          Object.entries(levelVal.children).forEach(([nextLevelType, nextLevelVal]) => processLevel(
            topLevelType,
            levelVal.scope,
            nextLevelType,
            nextLevelVal
          ));
        }
      });
    } else {
      coordinationScopes[topLevelType] = topLevelVal.scope.cScope;
      if (topLevelVal.children) {
        Object.entries(topLevelVal.children).forEach(([nextLevelType, nextLevelVal]) => processLevel(
          topLevelType,
          topLevelVal.scope,
          nextLevelType,
          nextLevelVal
        ));
      }
    }
  });
  return [coordinationScopes, coordinationScopesBy];
}
class VitessceConfigView {
  /**
   * Construct a new view instance.
   * @param {string} component The name of the Vitessce component type.
   * @param {object} coordinationScopes A mapping from coordination type
   * names to coordination scope names.
   * @param {number} x The x-coordinate of the view in the layout.
   * @param {number} y The y-coordinate of the view in the layout.
   * @param {number} w The width of the view in the layout.
   * @param {number} h The height of the view in the layout.
   */
  constructor(component, coordinationScopes, x, y, w, h) {
    this.view = {
      component,
      coordinationScopes,
      coordinationScopesBy: void 0,
      // TODO: initialize from parameter?
      x,
      y,
      w,
      h
    };
  }
  /**
   * Attach coordination scopes to this view.
   * @param  {...VitessceConfigCoordinationScope} args A variable number of
   * coordination scope instances.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordination(...args) {
    const cScopes = args;
    cScopes.forEach((cScope) => {
      this.view.coordinationScopes[cScope.cType] = cScope.cScope;
    });
    return this;
  }
  /**
   * Attach potentially multi-level coordination scopes to this view.
   * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
   * Not intended to be a manually-constructed object.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordinationByObject(scopes) {
    if (!this.view.coordinationScopes) {
      this.view.coordinationScopes = {};
    }
    if (!this.view.coordinationScopesBy) {
      this.view.coordinationScopesBy = {};
    }
    const [nextCoordinationScopes, nextCoordinationScopesBy] = useCoordinationByObjectHelper(
      scopes,
      this.view.coordinationScopes,
      this.view.coordinationScopesBy
    );
    this.view.coordinationScopes = nextCoordinationScopes;
    this.view.coordinationScopesBy = nextCoordinationScopesBy;
    return this;
  }
  /**
   * Attach meta coordination scopes to this view.
   * @param {VitessceConfigMetaCoordinationScope} metaScope A meta coordination scope instance.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useMetaCoordination(metaScope) {
    if (!this.view.coordinationScopes) {
      this.view.coordinationScopes = {};
    }
    this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] = [
      ...this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] || [],
      metaScope.metaScope.cScope
    ];
    this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] = [
      ...this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] || [],
      metaScope.metaByScope.cScope
    ];
    return this;
  }
  /**
    * Set the x, y, w, h values for this view.
    * @param {number} x The x-coordinate of the view in the layout.
    * @param {number} y The y-coordinate of the view in the layout.
    * @param {number} w The width of the view in the layout.
    * @param {number} h The height of the view in the layout.
    * @returns {VitessceConfigView} This, to allow chaining.
    */
  setXYWH(x, y, w, h) {
    this.view.x = x;
    this.view.y = y;
    this.view.w = w;
    this.view.h = h;
    return this;
  }
  /**
   * Set props for this view.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  setProps(props) {
    this.view.props = {
      ...this.view.props || {},
      ...props
    };
    return this;
  }
  /**
   * @returns {object} This view as a JSON object.
   */
  toJSON() {
    return this.view;
  }
}
class VitessceConfigViewHConcat {
  constructor(views) {
    this.views = views;
  }
}
class VitessceConfigViewVConcat {
  constructor(views) {
    this.views = views;
  }
}
function hconcat(...views) {
  const vcvhc = new VitessceConfigViewHConcat(views);
  return vcvhc;
}
function vconcat(...views) {
  const vcvvc = new VitessceConfigViewVConcat(views);
  return vcvvc;
}
class CoordinationLevel {
  constructor(value) {
    this.value = value;
    this.cachedValue = null;
  }
  setCached(processedLevel) {
    this.cachedValue = processedLevel;
  }
  getCached() {
    return this.cachedValue;
  }
  isCached() {
    return this.cachedValue !== null;
  }
}
function CL(value) {
  return new CoordinationLevel(value);
}
class VitessceConfigCoordinationScope {
  /**
   * Construct a new coordination scope instance.
   * @param {string} cType The coordination type for this coordination scope.
   * @param {string} cScope The name of the coordination scope.
   * @param {[any]} cValue Optional. The coordination value of the coordination scope.
   */
  constructor(cType, cScope, cValue = null) {
    this.cType = cType;
    this.cScope = cScope;
    this.cValue = cValue;
  }
  /**
   * Set the coordination value of the coordination scope.
   * @param {any} cValue The value to set.
   * @returns {VitessceConfigCoordinationScope} This, to allow chaining.
   */
  setValue(cValue) {
    this.cValue = cValue;
    return this;
  }
}
class VitessceConfigMetaCoordinationScope {
  /**
   * Construct a new coordination scope instance.
   * @param {string} metaScope The name of the coordination scope for metaCoordinationScopes.
   * @param {string} metaByScope The name of the coordination scope for metaCoordinationScopesBy.
   */
  constructor(metaScope, metaByScope) {
    this.metaScope = new VitessceConfigCoordinationScope(
      CoordinationType.META_COORDINATION_SCOPES,
      metaScope
    );
    this.metaByScope = new VitessceConfigCoordinationScope(
      CoordinationType.META_COORDINATION_SCOPES_BY,
      metaByScope
    );
  }
  /**
   * Attach coordination scopes to this meta scope.
   * @param  {...VitessceConfigCoordinationScope} args A variable number of
   * coordination scope instances.
   * @returns {VitessceConfigMetaCoordinationScope} This, to allow chaining.
   */
  useCoordination(...args) {
    const cScopes = args;
    const metaScopesVal = this.metaScope.cValue;
    cScopes.forEach((cScope) => {
      metaScopesVal[cScope.cType] = cScope.cScope;
    });
    this.metaScope.setValue(metaScopesVal);
    return this;
  }
  /**
   * Attach potentially multi-level coordination scopes to this meta coordination
   * scope instance.
   * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
   * Not intended to be a manually-constructed object.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordinationByObject(scopes) {
    if (!this.metaScope.cValue) {
      this.metaScope.setValue({});
    }
    if (!this.metaByScope.cValue) {
      this.metaByScope.setValue({});
    }
    const [metaScopesVal, metaByScopesVal] = useCoordinationByObjectHelper(
      scopes,
      this.metaScope.cValue,
      this.metaByScope.cValue
    );
    this.metaScope.setValue(metaScopesVal);
    this.metaByScope.setValue(metaByScopesVal);
    return this;
  }
}
class VitessceConfig {
  /**
   * Construct a new view config instance.
   * @param {object} params An object with named arguments.
   * @param {string} params.schemaVersion The view config schema version. Required.
   * @param {string} params.name A name for the config. Optional.
   * @param {string|undefined} params.description A description for the config. Optional.
   */
  constructor(params, ...args) {
    let name;
    let description;
    let schemaVersion;
    if (typeof params === "string") {
      schemaVersion = "1.0.7";
      name = params || "";
      if (args.length === 1) {
        [description] = args;
      } else if (args.length > 1) {
        throw new Error("Expected only one VitessceConfig constructor argument.");
      }
    } else if (typeof params === "object") {
      ({ schemaVersion, name, description } = params);
      if (!name) {
        throw new Error("Expected params.name argument in VitessceConfig constructor");
      }
      if (!schemaVersion) {
        throw new Error("Expected params.schemaVersion argument in VitessceConfig constructor");
      }
    } else {
      throw new Error("Expected VitessceConfig constructor argument to be an object.");
    }
    this.config = {
      version: schemaVersion,
      name,
      description,
      datasets: [],
      coordinationSpace: {},
      layout: [],
      initStrategy: "auto"
    };
    this.getNextScope = getNextScope;
  }
  /**
   * Add a new dataset to the config.
   * @param {string} name A name for the dataset. Optional.
   * @param {string} description A description for the dataset. Optional.
   * @param {object} options Extra parameters to be used internally. Optional.
   * @param {string} options.uid Override the automatically-generated dataset ID.
   * Intended for internal usage by the VitessceConfig.fromJSON code.
   * @returns {VitessceConfigDataset} A new dataset instance.
   */
  addDataset(name = void 0, description = void 0, options = void 0) {
    const { uid } = options || {};
    const prevDatasetUids = this.config.datasets.map((d) => d.dataset.uid);
    const nextUid = uid || this.getNextScope(prevDatasetUids);
    const newDataset = new VitessceConfigDataset(nextUid, name, description);
    this.config.datasets.push(newDataset);
    const [newScope] = this.addCoordination(CoordinationType.DATASET);
    newScope.setValue(nextUid);
    return newDataset;
  }
  /**
   * Add a new view to the config.
   * @param {VitessceConfigDataset} dataset The dataset instance which defines the data
   * that will be displayed in the view.
   * @param {string} component A component name, such as "scatterplot" or "spatial".
   * @param {object} options Extra options for the component.
   * @param {number} options.x The x-coordinate for the view in the grid layout.
   * @param {number} options.y The y-coordinate for the view in the grid layout.
   * @param {number} options.w The width for the view in the grid layout.
   * @param {number} options.h The height for the view in the grid layout.
   * @param {number} options.mapping A convenience parameter for setting the EMBEDDING_TYPE
   * coordination value. Only applicable if the component is "scatterplot".
   * @returns {VitessceConfigView} A new view instance.
   */
  addView(dataset, component, options) {
    const {
      x = 0,
      y = 0,
      w = 1,
      h = 1,
      mapping = null
    } = options || {};
    const datasetMatches = this.config.coordinationSpace[CoordinationType.DATASET] ? Object.entries(this.config.coordinationSpace[CoordinationType.DATASET]).filter(([scopeName, datasetScope2]) => datasetScope2.cValue === dataset.dataset.uid).map(([scopeName]) => scopeName) : [];
    let datasetScope;
    if (datasetMatches.length === 1) {
      [datasetScope] = datasetMatches;
    } else {
      throw new Error("No coordination scope matching the dataset parameter could be found in the coordination space.");
    }
    const coordinationScopes = {
      [CoordinationType.DATASET]: datasetScope
    };
    const newView = new VitessceConfigView(component, coordinationScopes, x, y, w, h);
    if (mapping) {
      const [etScope] = this.addCoordination(CoordinationType.EMBEDDING_TYPE);
      etScope.setValue(mapping);
      newView.useCoordination(etScope);
    }
    this.config.layout.push(newView);
    return newView;
  }
  /**
   * Get an array of new coordination scope instances corresponding to coordination types
   * of interest.
   * @param {...string} args A variable number of coordination type names.
   * @returns {VitessceConfigCoordinationScope[]} An array of coordination scope instances.
   */
  addCoordination(...args) {
    const cTypes = args;
    const result = [];
    cTypes.forEach((cType) => {
      const prevScopes = this.config.coordinationSpace[cType] ? Object.keys(this.config.coordinationSpace[cType]) : [];
      const scope = new VitessceConfigCoordinationScope(cType, this.getNextScope(prevScopes));
      if (!this.config.coordinationSpace[scope.cType]) {
        this.config.coordinationSpace[scope.cType] = {};
      }
      this.config.coordinationSpace[scope.cType][scope.cScope] = scope;
      result.push(scope);
    });
    return result;
  }
  /**
   * Initialize a new meta coordination scope in the coordination space,
   * and get a reference to it in the form of a meta coordination scope instance.
   * @returns {VitessceConfigMetaCoordinationScope} A new meta coordination scope instance.
   */
  addMetaCoordination() {
    const prevMetaScopes = this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES] ? Object.keys(this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES]) : [];
    const prevMetaByScopes = this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY] ? Object.keys(this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY]) : [];
    const metaContainer = new VitessceConfigMetaCoordinationScope(
      this.getNextScope(prevMetaScopes),
      this.getNextScope(prevMetaByScopes)
    );
    if (!this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES]) {
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES] = {};
    }
    if (!this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY]) {
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY] = {};
    }
    this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES][metaContainer.metaScope.cScope] = metaContainer.metaScope;
    this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY][metaContainer.metaByScope.cScope] = metaContainer.metaByScope;
    return metaContainer;
  }
  /**
   * Set up the initial values for multi-level coordination in the coordination space.
   * Get a reference to these values to pass to the `useCoordinationByObject` method
   * of either view or meta coordination scope instances.
   * @param {object} input A (potentially nested) object with coordination types as keys
   * and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
   * instance, or a `CoordinationLevel` instance.
   * The CL function takes an array of objects as its argument, and returns a CoordinationLevel
   * instance, to support nesting.
   * @returns {object} A (potentially nested) object with coordination types as keys and values
   * being either { scope }, { scope, children }, or an array of these. Not intended to be
   * manipulated before being passed to a `useCoordinationByObject` function.
   */
  addCoordinationByObject(input) {
    const processLevel = (level) => {
      const result = {};
      if (level === null) {
        return result;
      }
      Object.entries(level).forEach(([cType, nextLevelOrInitialValue]) => {
        if (nextLevelOrInitialValue instanceof CoordinationLevel) {
          const nextLevel = nextLevelOrInitialValue.value;
          if (nextLevelOrInitialValue.isCached()) {
            result[cType] = nextLevelOrInitialValue.getCached();
          } else if (Array.isArray(nextLevel)) {
            const processedLevel = nextLevel.map((nextEl) => {
              const [dummyScope] = this.addCoordination(cType);
              dummyScope.setValue("__dummy__");
              return {
                scope: dummyScope,
                children: processLevel(nextEl)
              };
            });
            nextLevelOrInitialValue.setCached(processedLevel);
            result[cType] = processedLevel;
          } else {
            const nextEl = nextLevel;
            const [dummyScope] = this.addCoordination(cType);
            dummyScope.setValue("__dummy__");
            const processedLevel = {
              scope: dummyScope,
              children: processLevel(nextEl)
            };
            nextLevelOrInitialValue.setCached(processedLevel);
            result[cType] = processedLevel;
          }
        } else {
          const initialValue = nextLevelOrInitialValue;
          if (initialValue instanceof VitessceConfigCoordinationScope) {
            result[cType] = { scope: initialValue };
          } else {
            const [scope] = this.addCoordination(cType);
            scope.setValue(initialValue);
            result[cType] = { scope };
          }
        }
      });
      return result;
    };
    const output = processLevel(input);
    return output;
  }
  /**
   * A convenience function for setting up new coordination scopes across a set of views.
   * @param {VitessceConfigView[]} views An array of view objects to link together.
   * @param {string[]} cTypes The coordination types on which to coordinate the views.
   * @param {any[]} cValues Initial values corresponding to each coordination type.
   * Should have the same length as the cTypes array. Optional.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  linkViews(views, cTypes, cValues = null) {
    const cScopes = this.addCoordination(...cTypes);
    views.forEach((view) => {
      cScopes.forEach((cScope) => {
        view.useCoordination(cScope);
      });
    });
    if (Array.isArray(cValues) && cValues.length === cTypes.length) {
      cScopes.forEach((cScope, i) => {
        cScope.setValue(cValues[i]);
      });
    }
    return this;
  }
  /**
   * A convenience function for setting up multi-level and meta-coordination scopes
   * across a set of views.
   * @param {VitessceConfigView[]} views An array of view objects to link together.
   * @param {object} input A (potentially nested) object with coordination types as keys
   * and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
   * instance, or a `CoordinationLevel` instance.
   * The CL function takes an array of objects as its argument, and returns a CoordinationLevel
   * instance, to support nesting.
   * @param {object|null} options
   * @param {bool} options.meta Should meta-coordination be used? Optional.
   * By default, true.
   * @param {string|null} options.scopePrefix A prefix to add to all
   * coordination scope names. Optional.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  linkViewsByObject(views, input, options = null) {
    const { meta = true, scopePrefix = null } = options || {};
    if (scopePrefix) {
      this.getNextScope = createPrefixedGetNextScopeNumeric(scopePrefix);
    }
    const scopes = this.addCoordinationByObject(input);
    if (meta) {
      const metaScope = this.addMetaCoordination();
      metaScope.useCoordinationByObject(scopes);
      views.forEach((view) => {
        view.useMetaCoordination(metaScope);
      });
    } else {
      views.forEach((view) => {
        view.useCoordinationByObject(scopes);
      });
    }
    if (scopePrefix) {
      this.getNextScope = getNextScope;
    }
    return this;
  }
  /**
   * Set the value for a coordination scope.
   * If a coordination object for the coordination type does not yet exist
   * in the coordination space, it will be created.
   * @param {string} cType The coordination type.
   * @param {string} cScope The coordination scope.
   * @param {any} cValue The initial value for the coordination scope.
   * @returns {VitessceConfigCoordinationScope} A coordination scope instance.
   */
  setCoordinationValue(cType, cScope, cValue) {
    const scope = new VitessceConfigCoordinationScope(cType, cScope, cValue);
    if (!this.config.coordinationSpace[scope.cType]) {
      this.config.coordinationSpace[scope.cType] = {};
    }
    this.config.coordinationSpace[scope.cType][scope.cScope] = scope;
    return scope;
  }
  /**
   * Set the layout of views.
   * @param {VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat} viewConcat A
   * view or a concatenation of views.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  layout(viewConcat) {
    function layoutAux(obj, xMin, xMax, yMin, yMax) {
      const w = xMax - xMin;
      const h = yMax - yMin;
      if (obj instanceof VitessceConfigView) {
        obj.setXYWH(xMin, yMin, w, h);
      } else if (obj instanceof VitessceConfigViewHConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin + w / numViews * i, xMin + w / numViews * (i + 1), yMin, yMax);
        });
      } else if (obj instanceof VitessceConfigViewVConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin, xMax, yMin + h / numViews * i, yMin + h / numViews * (i + 1));
        });
      }
    }
    layoutAux(viewConcat, 0, 12, 0, 12);
    return this;
  }
  /**
   * Convert this instance to a JSON object that can be passed to the Vitessce component.
   * @returns {object} The view config as a JSON object.
   */
  toJSON() {
    return {
      ...this.config,
      datasets: this.config.datasets.map((d) => d.toJSON()),
      coordinationSpace: Object.fromEntries(
        Object.entries(this.config.coordinationSpace).map(([cType, cScopes]) => [
          cType,
          Object.fromEntries(
            Object.entries(cScopes).map(([cScopeName, cScope]) => [
              cScopeName,
              cScope.cValue
            ])
          )
        ])
      ),
      layout: this.config.layout.map((c) => c.toJSON())
    };
  }
  /**
   * Create a VitessceConfig instance from an existing view config, to enable
   * manipulation with the JavaScript API.
   * @param {object} config An existing Vitessce view config as a JSON object.
   * @returns {VitessceConfig} A new config instance, with values set to match
   * the config parameter.
   */
  static fromJSON(config) {
    const { name, description, version: schemaVersion } = config;
    const vc = new VitessceConfig({ schemaVersion, name, description });
    config.datasets.forEach((d) => {
      const newDataset = vc.addDataset(d.name, d.description, { uid: d.uid });
      d.files.forEach((f) => {
        newDataset.addFile({
          url: f.url,
          fileType: f.fileType,
          coordinationValues: f.coordinationValues,
          options: f.options
        });
      });
    });
    Object.keys(config.coordinationSpace).forEach((cType) => {
      if (cType !== CoordinationType.DATASET) {
        const cObj = config.coordinationSpace[cType];
        vc.config.coordinationSpace[cType] = {};
        Object.entries(cObj).forEach(([cScopeName, cScopeValue]) => {
          const scope = new VitessceConfigCoordinationScope(cType, cScopeName);
          scope.setValue(cScopeValue);
          vc.config.coordinationSpace[cType][cScopeName] = scope;
        });
      }
    });
    config.layout.forEach((c) => {
      const newView = new VitessceConfigView(c.component, c.coordinationScopes, c.x, c.y, c.w, c.h);
      vc.config.layout.push(newView);
    });
    return vc;
  }
}
function getCoordinationSpaceAndScopes(partialCoordinationValues, scopePrefix) {
  const vc = new VitessceConfig({ schemaVersion: "1.0.16", name: "__dummy__" });
  vc.getNextScope = createPrefixedGetNextScopeNumeric(scopePrefix);
  const dataset = vc.addDataset("__dummy__");
  const v1 = vc.addView(dataset, "__dummy__");
  vc.linkViewsByObject([v1], partialCoordinationValues, { meta: true });
  const vcJson = vc.toJSON();
  const { coordinationSpace } = vcJson;
  const { coordinationScopes } = vcJson.layout[0];
  const { coordinationScopesBy } = vcJson.layout[0];
  return {
    coordinationSpace,
    coordinationScopes,
    coordinationScopesBy
  };
}
const SINGLE_CELL_WITH_HEATMAP_VIEWS = {
  obsSets: { x: 4, y: 0, w: 4, h: 4 },
  obsSetSizes: { x: 8, y: 0, w: 4, h: 4 },
  scatterplot: { x: 0, y: 0, w: 4, h: 4 },
  heatmap: { x: 0, y: 4, w: 8, h: 4 },
  featureList: { x: 8, y: 4, w: 4, h: 4 }
};
const SINGLE_CELL_WITHOUT_HEATMAP_VIEWS = {
  obsSets: { x: 10, y: 6, w: 2, h: 6 },
  obsSetSizes: { x: 8, y: 1, w: 4, h: 6 },
  scatterplot: { x: 0, y: 0, w: 8, h: 12 },
  featureList: { x: 8, y: 6, w: 2, h: 6 }
};
const SPATIAL_TRANSCRIPTOMICS_VIEWS = {
  scatterplot: { x: 0, y: 0, w: 3, h: 4 },
  spatial: { x: 3, y: 0, w: 5, h: 4 },
  obsSets: { x: 8, y: 0, w: 4, h: 2 },
  featureList: { x: 8, y: 0, w: 4, h: 2 },
  heatmap: { x: 0, y: 4, w: 6, h: 4 },
  obsSetFeatureValueDistribution: { x: 6, y: 4, w: 6, h: 4 }
};
const SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS = {
  spatial: { x: 0, y: 0, w: 6, h: 6 },
  heatmap: { x: 0, y: 6, w: 8, h: 6 },
  layerController: { x: 8, y: 6, w: 4, h: 6 },
  obsSets: { x: 9, y: 0, w: 3, h: 6 },
  featureList: { x: 6, y: 0, w: 3, h: 6 }
};
const IMAGE_VIEWS = {
  spatial: { x: 0, y: 0, w: 8, h: 12 },
  layerController: { x: 8, y: 0, w: 4, h: 7 },
  description: { x: 8, y: 9, w: 4, h: 5 }
};
const NO_HINTS_CONFIG = {
  views: {},
  coordinationValues: {}
};
const HINTS_CONFIG = {
  "No hints are available. Generate config with no hints.": NO_HINTS_CONFIG,
  Basic: NO_HINTS_CONFIG,
  "Transcriptomics / scRNA-seq (with heatmap)": {
    views: SINGLE_CELL_WITH_HEATMAP_VIEWS
  },
  "Transcriptomics / scRNA-seq (without heatmap)": {
    views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS
  },
  "Spatial transcriptomics (with polygon cell segmentations)": {
    views: SPATIAL_TRANSCRIPTOMICS_VIEWS
  },
  "Chromatin accessibility / scATAC-seq (with heatmap)": {
    views: SINGLE_CELL_WITH_HEATMAP_VIEWS,
    coordinationValues: {
      featureType: "peak"
    }
  },
  "Chromatin accessibility / scATAC-seq (without heatmap)": {
    views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
    coordinationValues: {
      featureType: "peak"
    }
  },
  "Spatial transcriptomics (with histology image and polygon cell segmentations)": {
    views: SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS,
    coordinationSpaceRequired: true
  },
  Image: {
    views: IMAGE_VIEWS
  }
};
const HINT_TYPE_TO_FILE_TYPE_MAP = {
  "AnnData-Zarr": [
    "Basic",
    "Transcriptomics / scRNA-seq (with heatmap)",
    "Transcriptomics / scRNA-seq (without heatmap)",
    "Spatial transcriptomics (with polygon cell segmentations)",
    "Chromatin accessibility / scATAC-seq (with heatmap)",
    "Chromatin accessibility / scATAC-seq (without heatmap)"
  ],
  "OME-TIFF": [
    "Basic",
    "Image"
  ],
  "AnnData-Zarr,OME-TIFF": [
    "Basic",
    "Spatial transcriptomics (with histology image and polygon cell segmentations)"
  ]
};
const filterViews = (hintsConfig, possibleViews) => {
  const requiredViews = Object.keys(hintsConfig.views);
  if (requiredViews.length === 0) {
    return possibleViews;
  }
  const resultViews = [];
  requiredViews.forEach((requiredView) => {
    const match = possibleViews.find((possibleView) => possibleView[0] === requiredView);
    if (match)
      resultViews.push(match);
  });
  if (resultViews.length === 0) {
    throw new Error("No views found that are compatible with the supplied dataset URLs and hint.");
  }
  return resultViews;
};
class AbstractAutoConfig {
  async composeViewsConfig() {
    throw new Error("The composeViewsConfig() method has not been implemented.");
  }
  async composeFileConfig() {
    throw new Error("The composeFileConfig() method has not been implemented.");
  }
}
class OmeTiffAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.RASTER_JSON;
    this.fileName = fileUrl.split("/").at(-1);
  }
  async composeViewsConfig(hintsConfig) {
    return filterViews(
      hintsConfig,
      [["description"], ["spatial"], ["layerController"]]
    );
  }
  async composeFileConfig() {
    return {
      fileType: this.fileType,
      options: {
        images: [
          {
            metadata: {
              isBitmask: false
            },
            name: this.fileName,
            type: "ome-tiff",
            url: this.fileUrl
          }
        ],
        schemaVersion: "0.0.2",
        usePhysicalSizeScaling: false
      }
    };
  }
}
class OmeZarrAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.RASTER_OME_ZARR;
    this.fileName = fileUrl.split("/").at(-1);
  }
  async composeViewsConfig(hintsConfig) {
    return filterViews(
      hintsConfig,
      [["description"], ["spatial"], ["layerController"]]
    );
  }
  async composeFileConfig() {
    return {
      fileType: this.fileType,
      type: "raster",
      url: this.fileUrl
    };
  }
}
class AnndataZarrAutoConfig extends AbstractAutoConfig {
  constructor(fileUrl) {
    super();
    this.fileUrl = fileUrl;
    this.fileType = FileType.ANNDATA_ZARR;
    this.fileName = fileUrl.split("/").at(-1);
    this.metadataSummary = {};
  }
  async composeFileConfig() {
    var _a;
    this.metadataSummary = await this.setMetadataSummary();
    const options = {
      obsEmbedding: [],
      obsFeatureMatrix: {
        path: "X"
      }
    };
    this.metadataSummary.obsm.forEach((key) => {
      if (key.toLowerCase().includes("obsm/x_segmentations")) {
        options.obsSegmentations = { path: key };
      }
      if (key.toLowerCase().includes("obsm/x_spatial")) {
        options.obsLocations = { path: key };
      }
      if (key.toLowerCase().includes("obsm/x_umap")) {
        options.obsEmbedding.push({ path: key, embeddingType: "UMAP" });
      }
      if (key.toLowerCase().includes("obsm/x_tsne")) {
        options.obsEmbedding.push({ path: key, embeddingType: "t-SNE" });
      }
      if (key.toLowerCase().includes("obsm/x_pca")) {
        options.obsEmbedding.push({ path: key, embeddingType: "PCA" });
      }
    });
    const supportedObsSetsKeys = [
      "cluster",
      "clusters",
      "subcluster",
      "cell_type",
      "celltype",
      "leiden",
      "louvain",
      "disease",
      "organism",
      "self_reported_ethnicity",
      "tissue",
      "sex"
    ];
    this.metadataSummary.obs.forEach((key) => {
      supportedObsSetsKeys.forEach((supportedKey) => {
        if (key.toLowerCase() === ["obs", supportedKey].join("/")) {
          if (!("obsSets" in options)) {
            options.obsSets = [
              {
                name: "Cell Type",
                path: [key]
              }
            ];
          } else {
            options.obsSets[0].path.push(key);
          }
        }
      });
    });
    options.obsSets = (_a = options.obsSets) == null ? void 0 : _a.map((obsSet) => {
      if (obsSet.path.length === 1) {
        return {
          ...obsSet,
          path: obsSet.path[0]
        };
      }
      return obsSet;
    });
    return {
      options,
      fileType: this.fileType,
      url: this.fileUrl,
      coordinationValues: {
        obsType: "cell",
        featureType: "gene",
        featureValueType: "expression"
      }
    };
  }
  async composeViewsConfig(hintsConfig) {
    this.metadataSummary = await this.setMetadataSummary();
    const possibleViews = [];
    const hasCellSetData = this.metadataSummary.obs.filter((key) => key.toLowerCase().includes("cluster") || key.toLowerCase().includes("cell_type") || key.toLowerCase().includes("celltype"));
    if (hasCellSetData.length > 0) {
      possibleViews.push(["obsSets"]);
    }
    this.metadataSummary.obsm.forEach((key) => {
      if (key.toLowerCase().includes("obsm/x_umap")) {
        possibleViews.push(["scatterplot", { mapping: "UMAP" }]);
      }
      if (key.toLowerCase().includes("obsm/x_tsne")) {
        possibleViews.push(["scatterplot", { mapping: "t-SNE" }]);
      }
      if (key.toLowerCase().includes("obsm/x_pca")) {
        possibleViews.push(["scatterplot", { mapping: "PCA" }]);
      }
      if (key.toLowerCase().includes("obsm/x_segmentations")) {
        possibleViews.push(["layerController"]);
      }
      if (key.toLowerCase().includes("obsm/x_spatial")) {
        possibleViews.push(["spatial"]);
      }
    });
    possibleViews.push(["obsSetSizes"]);
    possibleViews.push(["obsSetFeatureValueDistribution"]);
    if (this.metadataSummary.X) {
      possibleViews.push(["heatmap"]);
      possibleViews.push(["featureList"]);
    }
    const views = filterViews(hintsConfig, possibleViews);
    return views;
  }
  async setMetadataSummaryWithZmetadata(response) {
    const metadataFile = await response.json();
    if (!metadataFile.metadata) {
      throw new Error("Could not generate config: .zmetadata file is not valid.");
    }
    const obsmKeys = Object.keys(metadataFile.metadata).filter((key) => key.startsWith("obsm/X_")).map((key) => key.split("/.zarray")[0]);
    const obsKeysArr = Object.keys(metadataFile.metadata).filter((key) => key.startsWith("obs/")).map((key) => key.split("/.za")[0]);
    function uniq(a) {
      return a.sort().filter((item, pos, ary) => !pos || item !== ary[pos - 1]);
    }
    const obsKeys = uniq(obsKeysArr);
    const X = Object.keys(metadataFile.metadata).filter((key) => key.startsWith("X"));
    return {
      // Array of keys in obsm that are found by the fetches above
      obsm: obsmKeys,
      // Array of keys in obs that are found by the fetches above
      obs: obsKeys,
      // Boolean indicating whether the X array was found by the fetches above
      X: X.length > 0
    };
  }
  async setMetadataSummaryWithoutZmetadata() {
    const knownMetadataFileSuffixes = [
      "/obsm/X_pca/.zarray",
      "/obsm/X_umap/.zarray",
      "/obsm/X_tsne/.zarray",
      "/obsm/X_spatial/.zarray",
      "/obsm/X_segmentations/.zarray",
      "/obs/.zattrs",
      "/X/.zarray",
      "/X/data/.zarray"
      // for https://s3.amazonaws.com/vitessce-data/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr
    ];
    const getObsmKey = (url) => {
      const obsmKeyStartIndex = `${this.fileUrl}/`.length;
      const obsmKeyEndIndex = url.length - "/.zarray".length;
      return url.substring(obsmKeyStartIndex, obsmKeyEndIndex);
    };
    const promises = knownMetadataFileSuffixes.map((suffix) => fetch(`${this.fileUrl}${suffix}`));
    const fetchResults = await Promise.all(promises);
    const okFetchResults = fetchResults.filter((j) => j.ok);
    const metadataSummary = {
      // Array of keys in obsm that are found by the fetches above
      obsm: [],
      // Array of keys in obs that are found by the fetches above
      obs: [],
      // Boolean indicating whether the X array was found by the fetches above
      X: false
    };
    const obsPromiseResult = okFetchResults.find(
      (r) => r.url === `${this.fileUrl}/obs/.zattrs`
    );
    const isObsValid = (obsAttr) => Object.keys(obsAttr).includes("column-order") && Object.keys(obsAttr).includes("encoding-version") && Object.keys(obsAttr).includes("encoding-type") && obsAttr["encoding-type"] === "dataframe" && (obsAttr["encoding-version"] === "0.1.0" || obsAttr["encoding-version"] === "0.2.0");
    if (obsPromiseResult) {
      const obsAttrs = await obsPromiseResult.json();
      if (isObsValid(obsAttrs)) {
        obsAttrs["column-order"].forEach((key) => metadataSummary.obs.push(`obs/${key}`));
      } else {
        throw new Error("Could not generate config: /obs/.zattrs file is not valid.");
      }
    }
    okFetchResults.forEach((r) => {
      if (r.url.startsWith(`${this.fileUrl}/obsm`)) {
        const obsmKey = getObsmKey(r.url);
        if (obsmKey) {
          metadataSummary.obsm.push(obsmKey);
        }
      } else if (r.url.startsWith(`${this.fileUrl}/X`)) {
        metadataSummary.X = true;
      }
    });
    return metadataSummary;
  }
  async setMetadataSummary() {
    if (Object.keys(this.metadataSummary).length > 0) {
      return this.metadataSummary;
    }
    const metadataExtension = ".zmetadata";
    const url = [this.fileUrl, metadataExtension].join("/");
    return fetch(url).then((response) => {
      if (response.ok) {
        return this.setMetadataSummaryWithZmetadata(response);
      }
      if (response.status === 404) {
        return this.setMetadataSummaryWithoutZmetadata();
      }
      throw new Error(`Could not generate config: ${response.statusText}`);
    }).catch((error) => {
      throw new Error(`Could not generate config for URL ${this.fileUrl}: ${error}`);
    });
  }
}
const configClasses = [
  {
    extensions: [".ome.tif", ".ome.tiff", ".ome.tf2", ".ome.tf8"],
    class: OmeTiffAutoConfig,
    name: "OME-TIFF"
  },
  {
    extensions: [".h5ad.zarr", ".adata.zarr", ".anndata.zarr"],
    class: AnndataZarrAutoConfig,
    name: "AnnData-Zarr"
  },
  {
    extensions: ["ome.zarr"],
    class: OmeZarrAutoConfig,
    name: "OME-Zarr"
  }
];
function calculateCoordinates(viewsNumb) {
  const rows = Math.ceil(Math.sqrt(viewsNumb));
  const cols = Math.ceil(viewsNumb / rows);
  const width = 12 / cols;
  const height = 12 / rows;
  const coords = [];
  for (let i = 0; i < viewsNumb; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * width;
    const y = row * height;
    coords.push([
      Math.floor(x),
      Math.floor(y),
      // Ensure width/height is at least 1.
      Math.max(1, Math.floor(width)),
      Math.max(1, Math.floor(height))
    ]);
  }
  return coords;
}
const spatialSegmentationLayerValue = {
  radius: 65,
  stroked: true,
  visible: true,
  opacity: 1
};
function insertCoordinationSpaceForSpatial(views, vc) {
  const [
    spatialSegmentationLayer,
    spatialImageLayer,
    spatialZoom,
    spatialTargetX,
    spatialTargetY
  ] = vc.addCoordination(
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y
  );
  spatialSegmentationLayer.setValue(spatialSegmentationLayerValue);
  spatialImageLayer.setValue([
    {
      type: "raster",
      index: 0,
      colormap: null,
      transparentColor: null,
      opacity: 1,
      domainType: "Min/Max",
      channels: [
        {
          selection: {
            c: 0
          },
          color: [
            255,
            0,
            0
          ],
          visible: true,
          slider: [
            0,
            255
          ]
        },
        {
          selection: {
            c: 1
          },
          color: [
            0,
            255,
            0
          ],
          visible: true,
          slider: [
            0,
            255
          ]
        },
        {
          selection: {
            c: 2
          },
          color: [
            0,
            0,
            255
          ],
          visible: true,
          slider: [
            0,
            255
          ]
        }
      ]
    }
  ]);
  views.forEach((view) => {
    if (view.view.component === "spatial" || view.view.component === "layerController") {
      view.useCoordination(spatialImageLayer);
      view.useCoordination(spatialSegmentationLayer);
      view.useCoordination(spatialZoom);
      view.useCoordination(spatialTargetX);
      view.useCoordination(spatialTargetY);
    }
  });
}
function getFileType(url) {
  const match = configClasses.find((obj) => obj.extensions.filter(
    (ext) => url.endsWith(ext)
  ).length === 1);
  if (!match) {
    throw new Error("One or more of the URLs provided point to unsupported file types.");
  }
  return match;
}
async function generateViewDefinition(url, vc, dataset, hintsConfig) {
  let ConfigClassName;
  try {
    ConfigClassName = getFileType(url).class;
  } catch (err) {
    return Promise.reject(err);
  }
  const configInstance = new ConfigClassName(url);
  let fileConfig;
  let viewsConfig;
  try {
    fileConfig = await configInstance.composeFileConfig();
    viewsConfig = await configInstance.composeViewsConfig(hintsConfig);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
  dataset.addFile(fileConfig);
  let layerControllerView = false;
  let spatialView = false;
  const views = [];
  viewsConfig.forEach((v) => {
    const view = vc.addView(dataset, ...v);
    if (v[0] === "layerController") {
      layerControllerView = view;
    }
    if (v[0] === "spatial") {
      spatialView = view;
    }
    if (v[0] === "layerController") {
      view.setProps({
        disable3d: [],
        disableChannelsIfRgbDetected: true
      });
    }
    if (v[0] === "heatmap" && configInstance instanceof AnndataZarrAutoConfig) {
      view.setProps({ transpose: true });
    }
    views.push(view);
  });
  if (layerControllerView && spatialView && configInstance instanceof AnndataZarrAutoConfig) {
    vc.linkViews(
      [spatialView, layerControllerView],
      [
        CoordinationType.SPATIAL_SEGMENTATION_LAYER
      ],
      [spatialSegmentationLayerValue]
    );
  }
  return views;
}
function getHintOptions(fileUrls) {
  const fileTypes = {};
  fileUrls.forEach((url) => {
    const match = getFileType(url);
    if (match.name === "OME-Zarr") {
      fileTypes["OME-TIFF"] = true;
    } else {
      fileTypes[match.name] = true;
    }
  });
  const datasetType = Object.keys(fileTypes).sort().join(",");
  return (HINT_TYPE_TO_FILE_TYPE_MAP == null ? void 0 : HINT_TYPE_TO_FILE_TYPE_MAP[datasetType]) || [];
}
async function generateConfig(fileUrls, hintTitle = null) {
  var _a;
  const vc = new VitessceConfig({
    schemaVersion: "1.0.15",
    name: "An automatically generated config. Adjust values and add layout components if needed.",
    description: "Populate with text relevant to this visualisation."
  });
  const allViews = [];
  const dataset = vc.addDataset("An automatically generated view config for dataset. Adjust values and add layout components if needed.");
  const hintsConfig = !hintTitle ? { views: {} } : HINTS_CONFIG == null ? void 0 : HINTS_CONFIG[hintTitle];
  if (!hintsConfig) {
    throw new Error(`Hints config not found for the supplied hint: ${hintTitle}.`);
  }
  const useHints = ((_a = Object.keys(hintsConfig == null ? void 0 : hintsConfig.views)) == null ? void 0 : _a.length) > 0;
  fileUrls.forEach((url) => {
    allViews.push(generateViewDefinition(url, vc, dataset, hintsConfig));
  });
  return Promise.all(allViews).then((views) => {
    const flattenedViews = views.flat();
    if (hintsConfig == null ? void 0 : hintsConfig.coordinationSpaceRequired) {
      insertCoordinationSpaceForSpatial(flattenedViews, vc);
    }
    if (!useHints) {
      const coord = calculateCoordinates(flattenedViews.length);
      for (let i = 0; i < flattenedViews.length; i++) {
        flattenedViews[i].setXYWH(...coord[i]);
      }
    } else {
      flattenedViews.forEach((vitessceConfigView) => {
        const coordinates = Object.values(hintsConfig.views[vitessceConfigView.view.component]);
        vitessceConfigView.setXYWH(...coordinates);
      });
    }
    return vc.toJSON();
  });
}
export {
  CL as CoordinationLevel,
  HINTS_CONFIG,
  HINT_TYPE_TO_FILE_TYPE_MAP,
  VitessceConfig,
  generateConfig,
  getCoordinationSpaceAndScopes,
  getHintOptions,
  getInitialCoordinationScopeName,
  getInitialCoordinationScopePrefix,
  hconcat,
  vconcat
};
