import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

export async function getInfo(ids) {
  return fetch('https://search.api.hubmapconsortium.org/v3/portal/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'must_not': [{
            'exists': {
              'field': 'next_revision_uuid'
            }
          }],
          'filter': [{
            'term': {
              'entity_type.keyword': 'Sample'
            }
          }, {
            'terms': {
              'uuid': ids
            }
          }]
        }
      },
      'size': 10000
    })
  })
    .then(res => res.json())
    .then(data => {
      return data;
    });
}

export async function getDescendents(ids) {
  return fetch('https://search.api.hubmapconsortium.org/v3/portal/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'must_not': [{
            'exists': {
              'field': 'next_revision_uuid'
            }
          }],
          'filter': [{
            'term': {
              'entity_type.keyword': 'Sample'
            }
          }, {
            'terms': {
              'uuid': ids
            }
          }]
        }
      },
      'size': 10000
    })
  })
    .then(res => res.json())
    .then(data => {
      return data;
    });
}

export async function getBlocksFromOrgan(organName, gender, uuid = null) {
  const url = 'https://ccf-api.hubmapconsortium.org/v1/reference-organ-scene?organ-iri=' + organName + '&sex=' + gender;
  let ccfEntities = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })
    .then(res => res.json())
    .then(data => {
      let entitiesCollection = new Map();
      data.forEach(d => {
        if (d['entityId']?.includes('hubmap')) {
          if (d['ccf_annotations'].includes(organName)) { //Only for left Kidney
            entitiesCollection.set(d['entityId'].split('/')
              .slice(-1)[0], {
              entityId: d['entityId'].split('/')
                .slice(-1)[0],
              annotations: d['ccf_annotations'],
              transformationMatrix: d['transformMatrix'],
              color: d['color'],
            });
          }
        }
      });
      return entitiesCollection;
    });

  // console.log(ccfEntities)
  let ids = Array.from(ccfEntities.keys()); // Collecting the IDs for the next Query

  // Get Data from HUBMAP Entity API
  let hubmapEntities = await fetch('https://search.api.hubmapconsortium.org/v3/portal/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'must_not': [{
            'exists': {
              'field': 'next_revision_uuid'
            }
          }],
          'filter': [{
            'term': {
              'entity_type.keyword': 'Sample'
            }
          }, {
            'terms': {
              'uuid': ids
            }
          }]
        }
      },
      'size': 10000
    })
  })
    .then(res => res.json())
    .then(async data => {
      let hubMapEntityCollection = new Map();
      for (const hit of data.hits.hits) {
        // console.log(hit._source);
        let entity = hit._source;
        let ruiLocation = entity.rui_location;
        entity.rui_location = JSON.parse(entity.rui_location);
        let descendents = entity.immediate_descendants.map(desc => desc.uuid);
        let descendentsData = await Promise.all([getDescendents(descendents)]); // TODO - Maybe Remove with more efficient Query
        entity.immediate_descendants = descendentsData[0].hits.hits;
        if ((uuid !== null && entity.origin_samples[0].uuid == uuid) || uuid == null) {
          hubMapEntityCollection.set(entity.uuid, entity);
        }
      }
      return hubMapEntityCollection;
    });
  let blocks = Array.from(hubmapEntities.entries())
    .map(value => {
      let entity = value[1];
      return {
        id: value[0],
        x_dimension: entity.rui_location.x_dimension,
        y_dimension: entity.rui_location.y_dimension,
        z_dimension: entity.rui_location.z_dimension,
        x_rotation: entity.rui_location.placement.x_rotation,
        y_rotation: entity.rui_location.placement.y_rotation,
        z_rotation: entity.rui_location.placement.z_rotation,
        x_translation: entity.rui_location.placement.x_translation,
        y_translation: entity.rui_location.placement.y_translation,
        z_translation: entity.rui_location.placement.z_translation,
        x_scaling: entity.rui_location.placement.x_scaling,
        y_scaling: entity.rui_location.placement.y_scaling,
        z_scaling: entity.rui_location.placement.z_scaling,
      };
    });
  return {
    blocks: blocks,
    hubmapEntities: hubmapEntities,
    ccfEntities: ccfEntities
  };
}

export async function getOrganInformation(organUberon, sex) {
  const url = 'https://ccf-api.hubmapconsortium.org/v1/reference-organ-scene?organ-iri=' + organUberon + '&sex=' + sex;
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })
    .then(res => res.json())
    .then(data => {
      let retVal;
      data.forEach(d => {
        if (d.representation_of === organUberon) {
          retVal = {
            matrix: d.transformMatrix,
            uberon: d.representation_of
          };
        }
      });
      return retVal;
    });
}

export async function getOrganUberonToOntologyOrganFile(uberon) {
  const url = 'https://raw.githubusercontent.com/hubmapconsortium/hubmap-ontology/master/source_data/generated-reference-spatial-entities.jsonld';
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })
    .then(res => res.json())
    .then(data => {
      let retVal;
      data.forEach(d => {
        if (d.object !== undefined && d['representation_of'] !== undefined && d['representation_of'].includes(uberon)) {
          retVal = d;
        }
      });
      return retVal;
    });
}

export async function getObjSubPathToOntology(organID) {
  const url = 'https://raw.githubusercontent.com/hubmapconsortium/hubmap-ontology/master/source_data/generated-reference-spatial-entities.jsonld';
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })
    .then(res => res.json())
    .then(data => {
      let retVal;
      data.forEach(d => {
        if (d.object !== undefined && d['@id'].includes(organID)) {
          retVal = d;
        }
      });
      return retVal;
    });
}

export function createUnitBlock(data, color = '#808080') {
  const geometry = new BoxGeometry(2, 2, 2);
  const block = new Mesh(geometry, new MeshBasicMaterial({ color: color }));
  block.position.set(0, 0, 0);
  block.name = 'blockParent;' + data.id;
  return block;
}
