// The CSS imports are just here to be included in the UMD build,
// so they can be referenced through unpkg.
import './css/index.css'
import './css/file-drop.css'

import { HeatmapSubscriber, Heatmap } from './components/heatmap/'
import { SpatialSubscriber, Spatial } from './components/spatial/'
import { TsneSubscriber, Tsne } from './components/tsne/'
import { FileManagerPublisher } from './components/fileManager'
import { MessagesSubscriber } from './components/messages'

export default {
    HeatmapSubscriber, Heatmap,
    SpatialSubscriber, Spatial,
    TsneSubscriber, Tsne,
    FileManagerPublisher,
    MessagesSubscriber
};
