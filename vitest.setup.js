// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/setup-vitest.js
// - https://github.com/vitest-dev/vitest/issues/1377#issuecomment-1141411249
import { beforeAll, afterAll , vi} from 'vitest';
import { randomFillSync } from 'crypto';
import intersection from 'set.prototype.intersection';

import { JSDOM } from 'jsdom';
import 'vitest-canvas-mock';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Set up jsdom with a basic HTML document
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = { userAgent: 'node.js' };

class WebGLRenderingContext {
  constructor() {
    this.getExtension = vi.fn((name) => {
      const supportedExtensions = ['OES_texture_float', 'WEBGL_lose_context'];
      return supportedExtensions.includes(name) ? {} : null;
    });
    this.getSupportedExtensions = vi.fn(() => ['OES_texture_float', 'WEBGL_lose_context']);
    this.getParameter = vi.fn().mockReturnValue(1);
    this.clearColor = vi.fn();
    this.clear = vi.fn();
    this.viewport = vi.fn();
    this.createFramebuffer = vi.fn().mockReturnValue({});
    this.bindFramebuffer = vi.fn();
    this.createProgram = vi.fn().mockReturnValue({});
    this.createShader = vi.fn().mockReturnValue({});
    this.shaderSource = vi.fn();
    this.compileShader = vi.fn();
    this.getShaderParameter = vi.fn().mockReturnValue(true);
    this.getProgramParameter = vi.fn().mockReturnValue(true);
    this.linkProgram = vi.fn();
    this.useProgram = vi.fn();
    this.uniform1f = vi.fn();
    this.uniform3fv = vi.fn();
    this.vertexAttribPointer = vi.fn();
    this.enableVertexAttribArray = vi.fn();
  }
}

global.WebGL2RenderingContext = WebGLRenderingContext;
global.WebGLRenderingContext = WebGLRenderingContext;

global.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === 'webgl' || type === 'webgl2') {
    return new WebGLRenderingContext();
  }
  if (type === '2d') {
    return {
        font: '',
        measureText: vi.fn(() => ({ width: 100 })),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
    }
  }
  return null;
};

global.WebGLRenderingContext.prototype.getExtension = vi.fn((extension) => {
  if (extension === 'OES_element_index_uint' || extension === 'WEBGL_depth_texture') {
    return {};
  }
  return null;
});

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type) => {
  if (type === 'webgl' || type === 'webgl2') {
    return new WebGLRenderingContext();
  }
  return null;
});

// global.initializeWebGL = vi.fn().mockReturnValue(true);

global.initializeWebGL = vi.fn(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL not supported'); 
  return gl;
});

global.Worker = function () {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: vi.fn(),
    onerror: vi.fn(),
  };
};

beforeAll(() => {
  global.crypto = {
    getRandomValues: function (buffer) {
        return randomFillSync(buffer);
      }
  };

  global.URL.createObjectURL = () => { return ''; };
  intersection.shim();
});
