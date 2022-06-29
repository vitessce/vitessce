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
            "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json"
          


     
    }]}],
    coordinationSpace: {
        dataset: {
            A: 'codeluppi'
        }
    },
    'layout': [{
        'component': 'dotplot',
        coordinationScopes: {
            /*dataset: 'A'*/
        },
        'x': 0,
        'y': 0,
        'w': 8,
        'h': 9,
    },
{'component': 'genes',
props: {
    enableMultiSelect: true
  },
  coordinationScopes: {
    dataset: 'A'
},
'x': 8,
'y': 0,
'w': 2,
'h':9,
},


{
    'component': 'cellSets',
    coordinationScopes: {
        
    },
    x: 10,
      y: 0,
      w: 2,
      h: 9,
    }
    ]



}