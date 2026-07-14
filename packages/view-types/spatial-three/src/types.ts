import type {
  Vector3, Scene, Data3DTexture, Mesh, BufferGeometry, ShaderMaterial,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Volume } from './Volume.js';

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

// Three.js shader uniform — value types are heterogeneous by nature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UniformMap = Record<string, { value: any }>;

// Vitessce image loader source (from @hms-dbmi/viv).
export interface VolumeSource {
  shape: number[];
  labels: string[];
  dtype: string;
  getRaster(options: { selection: Record<string, number>; signal?: AbortSignal }):
    Promise<{ data: TypedArray }>;
}

// Vitessce image wrapper structure from the coordination system.
export interface ImageWrapper {
  image: {
    instance: {
      getData(): VolumeSource[];
      isInterleaved(): boolean;
      getChannelIndex(target: number | string): number;
      getAutoTargetResolution(): number;
    };
    loaders: Array<VolumeSource & {
      channels?: unknown[];
      meta?: { physicalSizes?: Record<string, number | undefined> };
    }>;
  };
}

// Scene transform options for obs segmentation rendering.
export interface SceneOptions {
  materialSide?: 'front' | 'back';
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  sceneScaleX?: number;
  sceneScaleY?: number;
  sceneScaleZ?: number;
  sceneRotationX?: number;
  sceneRotationY?: number;
  sceneRotationZ?: number;
}

// Obs segmentation data entry from the Vitessce coordination system.
export interface ObsSegmentationEntry {
  obsSegmentations: {
    scene: Scene;
    sceneOptions?: SceneOptions;
  };
}

// Volume shader configuration passed to setUniformsTextures.
export interface VolumeConfig {
  clim1: number;
  clim2: number;
  isothreshold: number;
  opacity: number;
  colormap: string;
}

export interface RenderingSettings {
  uniforms: UniformMap | null;
  shader: { vertexShader: string; fragmentShader: string } | null;
  meshScale: [number, number, number] | null;
  geometrySize: [number, number, number] | null;
  boxSize: [number, number, number] | null;
}

export interface SegmentationSettings {
  visible: boolean;
  color: number[];
  opacity: number;
  multiVisible: string;
  multiOpacity: string;
  multiColor: string;
  data: Record<string, ObsSegmentationEntry> | null;
  obsSets: Array<{ name: string; id: string; color: number[] }>;
}

export interface VolumeSettings {
  channelsVisible: boolean[] | null;
  allChannels: unknown[] | null;
  channelTargetC: (number | false)[] | null;
  resolution: number | null;
  data: VolumeSource[] | null;
  colors: number[][] | null;
  contrastLimits: number[][] | null;
  is3dMode: boolean;
  renderingMode: number | null;
  layerTransparency: number;
  xSlice?: [number, number] | null;
  ySlice?: [number, number] | null;
  zSlice?: [number, number] | null;
}

export interface VolumeData {
  volumes: Map<number | false, Volume>;
  textures: Map<number | false, Data3DTexture>;
  volumeMinMax: Map<number | false, number[]>;
  scale: Array<{ size: number }> | null;
  resolution: number | null;
  originalScale: number[] | null;
}

export interface GeometryAndMeshProps {
  segmentationGroup: Scene | null;
  segmentationSettings: SegmentationSettings;
  segmentationSceneScale: number[];
  renderingSettings: RenderingSettings;
  materialRef: React.RefObject<Mesh<BufferGeometry, ShaderMaterial> | null>;
  highlightEntity: (name: string, layerScope: string, channelScope: string) => void;
  setObsHighlight: (id: string | null) => void;
}

export interface MeasureLineData {
  startPoint: Vector3;
  midPoint: Vector3;
  endPoint: Vector3;
  setStartPoint: boolean;
  setEndPoint: boolean;
}

// Vitessce coordination records — these are dynamic keyed objects from the
// coordination system. Using Record<string, unknown> requires explicit casts
// at access sites, but avoids masking type errors with `any`.
export type CoordinationRecord = Record<string, unknown>;

// Props type for SpatialThree.
// Coordination objects use CoordinationRecord for type safety at the boundary.
export interface SpatialThreeProps {
  uuid?: string;
  height?: number;
  width?: number;
  // These props are inherited from the 2D spatial view but unused in 3D.
  molecules?: unknown;
  cells?: unknown;
  neighborhoods?: unknown;
  lineWidthScale?: number;
  lineWidthMaxPixels?: number;
  cellColors?: Map<string, number[]>;
  getCellCoords?: (...args: unknown[]) => unknown;
  getCellColor?: (...args: unknown[]) => unknown;
  getCellPolygon?: (...args: unknown[]) => unknown;
  getCellIsSelected?: (...args: unknown[]) => unknown;
  getMoleculeColor?: (...args: unknown[]) => unknown;
  getMoleculePosition?: (...args: unknown[]) => unknown;
  getNeighborhoodPolygon?: (...args: unknown[]) => unknown;
  updateViewInfo?: (...args: unknown[]) => unknown;
  onCellClick?: (...args: unknown[]) => unknown;
  theme?: string;
  images?: Record<string, ImageWrapper>;
  imageLayerScopes?: string[];
  imageLayerCoordination?: Array<Record<string, CoordinationRecord>>;
  imageChannelScopesByLayer?: Record<string, string[]>;
  imageChannelCoordination?: Array<Record<string, Record<string, CoordinationRecord>>>;
  obsSegmentations?: Record<string, ObsSegmentationEntry>;
  onEntitySelected?: (name: string, layerScope: string, channelScope: string) => void;
  segmentationLayerCoordination?: CoordinationRecord;
  segmentationChannelCoordination?: [
    Record<string, Record<string, CoordinationRecord>>,
    Record<string, Record<string, CoordinationRecord>>,
  ];
  segmentationChannelScopesByLayer?: Record<string, string[]>;
  spatialRenderingMode?: string;
  xrEnabled?: boolean;
}

// Segmentation channel coordination values accessed in SpatialThree.
// These are the runtime shapes from the Vitessce coordination system.
export interface SegmentationChannelValues {
  obsSetSelection: string[][];
  additionalObsSets: {
    tree: Array<{
      children: Array<{
        name: string;
        set: Array<[string, ...unknown[]]>;
      }>;
    }>;
  } | null;
  obsSetColor: Array<{ path: string[]; color: number[] }>;
  obsHighlight: string | null;
  spatialChannelColor: number[];
  spatialChannelOpacity: number;
  spatialChannelVisible: boolean;
  spatialTargetC: string;
}

export interface SegmentationChannelSetters {
  setObsHighlight: (id: string | null) => void;
}

// Re-export commonly used R3F event types for component files.
export type ClickEvent = ThreeEvent<MouseEvent>;
export type PointerOverEvent = ThreeEvent<PointerEvent>;
