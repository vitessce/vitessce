export const barplots = {
    'version': "1.0.4",
    public: true,
    initStrategy: 'auto',
    'name': 'Immunology Plot',
    'description': '',
    'datasets': [{"uid": "codeluppi",
    "name": "Codeluppi",
    "files": [{
        "type": "expression-matrix",
          "fileType": "clusters.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.clusters.json"},

          {
            "type": "cell-sets",
            "fileType": "cell-sets.json",
            "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json"},

            {
              "type": "cells",
              "fileType": "cells.json",
              "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cells.json"
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