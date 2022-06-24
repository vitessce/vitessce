export const barplots = {
    'version': "1.0.4",
    public: true,
    initStrategy: 'auto',
    'name': 'MyBarPlot Config',
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
        'component': 'barplot',
        coordinationScopes: {
            dataset: 'A'
        },
        'x': 0,
        'y': 0,
        'w': 6,
        'h': 10,
    },
{'component': 'genes',
props: {
    enableMultiSelect: true
  },
  coordinationScopes: {
    dataset: 'A'
},
'x': 6,
'y': 0,
'w': 3,
'h':10,
},
{
    'component': 'cellSets',
    coordinationScopes: {
        dataset: 'A'
    },
    x: 9,
      y: 0,
      w: 3,
      h: 10,
    }
    ]



}