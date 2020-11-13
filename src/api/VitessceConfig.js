import { getNextScope, fromEntries } from '../utils';
import { COORDINATION_TYPES } from '../app/state/coordination';

export class VitessceConfigDatasetFile {
  constructor(url, dataType, fileType) {
    this.file = {
      url,
      type: dataType,
      fileType,
    };
  }

  toJSON() {
    return this.file;
  }
}

export class VitessceConfigDataset {
  constructor(uid, name) {
    this.dataset = {
      uid,
      name,
      files: [],
    };
  }

  addFile(url, dataType, fileType) {
    this.dataset.files.push(new VitessceConfigDatasetFile(url, dataType, fileType));
  }

  toJSON() {
    return {
      ...this.dataset,
      files: this.dataset.files.map(f => f.toJSON()),
    };
  }
}

export class VitessceConfigView {
  constructor(component, coordinationScopes, x, y, w, h) {
    this.view = {
      component,
      coordinationScopes,
      x,
      y,
      w,
      h,
    };
  }

  useCoordination(...args) {
    const cScopes = args;
    cScopes.forEach((cScope) => {
      this.view.coordinationScopes[cScope.cType] = cScope.cScope;
    });
    return this;
  }

  setXYWH(x, y, w, h) {
    this.view.x = x;
    this.view.y = y;
    this.view.w = w;
    this.view.h = h;
  }

  toJSON() {
    return this.view;
  }
}

export class VitessceConfigViewHConcat {
  constructor(views) {
    this.views = views;
  }
}

export class VitessceConfigViewVConcat {
  constructor(views) {
    this.views = views;
  }
}

export function hconcat(...views) {
  const vcvhc = new VitessceConfigViewHConcat(views);
  return vcvhc;
}

export function vconcat(...views) {
  const vcvvc = new VitessceConfigViewVConcat(views);
  return vcvvc;
}

export class VitessceConfigCoordinationScope {
  constructor(cType, cScope) {
    this.cType = cType;
    this.cScope = cScope;
    this.cValue = null;
  }

  setValue(cValue) {
    this.cValue = cValue;
    return this;
  }
}

export class VitessceConfig {
  constructor(name = '', description = '') {
    this.config = {
      version: '1.0.0',
      name,
      description,
      datasets: [],
      coordinationSpace: {},
      layout: [],
      initStrategy: 'auto',
    };
  }

  addDataset(name = '', uid = null) {
    const prevDatasetUids = this.config.datasets.map(d => d.dataset.uid);
    const nextUid = (uid || getNextScope(prevDatasetUids));
    const newDataset = new VitessceConfigDataset(nextUid, name);
    this.config.datasets.push(newDataset);
    const [newScope] = this.addCoordination(COORDINATION_TYPES.DATASET);
    newScope.setValue(nextUid);
    return newDataset;
  }

  addView(dataset, component, options) {
    const {
      x = 0,
      y = 0,
      w = 1,
      h = 1,
      mapping = null,
    } = options || {};
    const datasetMatches = (
      this.config.coordinationSpace[COORDINATION_TYPES.DATASET]
        ? Object.entries(this.config.coordinationSpace[COORDINATION_TYPES.DATASET])
        // eslint-disable-next-line no-unused-vars
          .filter(([scopeName, datasetScope]) => datasetScope.cValue === dataset.dataset.uid)
          .map(([scopeName]) => scopeName)
        : []
    );
    let datasetScope;
    if (datasetMatches.length === 1) {
      [datasetScope] = datasetMatches;
    } else {
      throw new Error('No coordination scope matching the dataset parameter could be found in the coordination space.');
    }
    const coordinationScopes = {
      [COORDINATION_TYPES.DATASET]: datasetScope,
    };
    const newView = new VitessceConfigView(component, coordinationScopes, x, y, w, h);
    if (mapping) {
      const [etScope] = this.addCoordination(COORDINATION_TYPES.EMBEDDING_TYPE);
      etScope.setValue(mapping);
      newView.useCoordination(etScope);
    }
    this.config.layout.push(newView);
    return newView;
  }

  addCoordination(...args) {
    const cTypes = args;
    const result = [];
    cTypes.forEach((cType) => {
      const prevScopes = (
        this.config.coordinationSpace[cType]
          ? Object.keys(this.config.coordinationSpace[cType])
          : []
      );
      const scope = new VitessceConfigCoordinationScope(cType, getNextScope(prevScopes));
      if (!this.config.coordinationSpace[scope.cType]) {
        this.config.coordinationSpace[scope.cType] = {};
      }
      this.config.coordinationSpace[scope.cType][scope.cScope] = scope;
      result.push(scope);
    });
    return result;
  }

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
          layoutAux(view, xMin + (w / numViews) * i, xMin + (w / numViews) * (i + 1), yMin, yMax);
        });
      } else if (obj instanceof VitessceConfigViewVConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin, xMax, yMin + (h / numViews) * i, yMin + (h / numViews) * (i + 1));
        });
      }
    }

    layoutAux(viewConcat, 0, 12, 0, 12);

    return this;
  }

  toJSON() {
    return {
      ...this.config,
      datasets: this.config.datasets.map(d => d.toJSON()),
      coordinationSpace: fromEntries(
        Object.entries(this.config.coordinationSpace).map(([cType, cScopes]) => ([
          cType,
          fromEntries(
            Object.entries(cScopes).map(([cScopeName, cScope]) => ([
              cScopeName,
              cScope.cValue,
            ])),
          ),
        ])),
      ),
      layout: this.config.layout.map(c => c.toJSON()),
    };
  }

  static fromJSON(config) {
    const { name, description } = config;
    const vc = new VitessceConfig(name, description);
    config.datasets.forEach((d) => {
      const newDataset = vc.addDataset(d.name, d.uid);
      d.files.forEach((f) => {
        newDataset.addFile(
          f.url,
          f.type,
          f.fileType,
        );
      });
    });
    return vc;
  }
}
