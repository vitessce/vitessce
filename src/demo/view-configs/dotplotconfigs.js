export const dotplots = {
    'version': "1.0.4",
    public: true,
    initStrategy: 'auto',
    'name': ' Sade-Feldman et al., Cell 2018',
    'description': 'Transcriptomes of 16,291 individual immune cells from 48 tumor samples of melanoma patients treated with checkpoint inhibitor',
    'datasets': [{"uid": "codeluppi",
    "name": "Codeluppi",
    "files": [{
        "type": "expression-matrix",
          "fileType": "clusters.json",
          "url": "https://vitessce-data.s3.amazonaws.com/0.0.32/master_release/sade-feldman_2018/expressionmatrix.json"},
          { 

            "type": "cell-sets",
            "fileType": "cell-sets.json",
            "url": "https://vitessce-data.s3.amazonaws.com/0.0.32/master_release/sade-feldman_2018/cellsets_data.json"},

            {
              "type": "cells",
              "fileType": "cells.json",
              "url": "https://vitessce-data.s3.amazonaws.com/0.0.32/master_release/sade-feldman_2018/tsne_data.json"
             },


     
    ]}],
    coordinationSpace: {
        dataset: {
            A: 'codeluppi'
        },
        embeddingType: {
          A: 't-SNE',
        },
        embeddingZoom: {
          A: 0.75,
        },
    },
    'layout': [{
        'component': 'dotplot',
        coordinationScopes: {
            /*dataset: 'A'*/
        },
        'x': 0,
        'y': 0,
        'w': 7,
        'h': 12,
    },
{'component': 'genes',
props: {
    enableMultiSelect: true
  },
  coordinationScopes: {
    dataset: 'A'
},
'x': 7,
'y': 0,
'w': 2,
'h':6,
},


{
    'component': 'cellSets',
    coordinationScopes: {

      },
    x: 9,
      y: 0,
      w: 3,
      h: 6,
    },

    {
    
            component: 'cellSetExpression',
          
        x: 9,
          y: 6,
          w: 3,
          h: 6,
        },


       { component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'A',
        embeddingZoom: 'A',
      },
          
          
      x: 7,
        y: 6,
        w: 2,
        h: 6,
      }
    ]



}