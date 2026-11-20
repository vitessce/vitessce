// eslint-plugin-import's node resolver does not support package.json "exports",
// which mainline neuroglancer uses for its `neuroglancer/unstable/*` subpaths.
/* eslint-disable import/no-unresolved */
// Side-effect import: registers mainline Neuroglancer's frontend layer types
// (image, segmentation, annotation, ...), datasources, and kvstores.
import 'neuroglancer';
// Side-effect import: registers volume chunk format handlers (raw, compressed_segmentation).
// Normally pulled in by mainline's ui/minimal_viewer.js, which we do not use.
import 'neuroglancer/unstable/sliceview/chunk_format_handlers.js';
import { DisplayContext } from 'neuroglancer/unstable/display_context.js';
import { DataManagementContext } from 'neuroglancer/unstable/data_management_context.js';
import { Viewer } from 'neuroglancer/unstable/viewer.js';
import { setDefaultInputEventBindings } from 'neuroglancer/unstable/ui/default_input_event_bindings.js';
import {
  bindDefaultCopyHandler,
  bindDefaultPasteHandler,
} from 'neuroglancer/unstable/ui/default_clipboard_handling.js';
/* eslint-enable import/no-unresolved */

/**
 * Create a Neuroglancer viewer embedded in `target`.
 *
 * Replaces the `setupDefaultViewer({ target, bundleRoot })` export of the
 * @janelia-flyem/neuroglancer fork. Mainline's `setupDefaultViewer` binds the
 * page URL hash and the document-wide context menu, which we do not want for an
 * embedded view, so the viewer is assembled here from its parts instead.
 *
 * @param {object} options
 * @param {HTMLElement} options.target Container element for the viewer.
 * @param {Worker} options.worker A new chunk worker from @vitessce/neuroglancer-workers.
 *   Requires the patched `DataManagementContext` (patches/neuroglancer@2.41.2.patch).
 *   The viewer takes ownership: `viewer.dispose()` terminates it.
 * @returns {Viewer}
 */
export function setupViewer({ target, worker }) {
  const display = new DisplayContext(target);
  const dataContext = new DataManagementContext(display.gl, display, worker);
  const viewer = new Viewer(display, { dataContext });
  viewer.registerDisposer(display);

  setDefaultInputEventBindings(viewer.inputEventBindings);
  bindDefaultCopyHandler(viewer);
  bindDefaultPasteHandler(viewer);

  // Disable the browser context menu within the viewer only
  // (the fork's disableContextMenu(target); mainline's applies to the whole document).
  const preventContextMenu = (e) => { e.preventDefault(); };
  target.addEventListener('contextmenu', preventContextMenu);
  viewer.registerDisposer(() => target.removeEventListener('contextmenu', preventContextMenu));

  return viewer;
}
