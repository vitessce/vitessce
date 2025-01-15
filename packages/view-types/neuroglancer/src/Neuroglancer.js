// import React from 'react';
// import Neuroglancer from '@janelia-flyem/react-neuroglancer';


// const NeuroglancerViewer = (props) => {
//   // const imageSourceUrl = 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff';
//   const onViewerStateChanged = () => {
//     console.log("state changed", props)
//   }

//   const viewerState = {
//     layers: {
//         grayscale: {
//             type: "image",
//             source:
//               "dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg"
//         },
//         segmentation: {
//             type: "segmentation",
//             source:
//               "dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation"
//         }
//     },
//     perspectiveZoom: 20,
//     navigation: {
//         zoomFactor: 8
//     }
// }
//   return (
//     <div>
//       <Neuroglancer
//         viewerState={viewerState}
//         perspectiveZoom={viewerState.perspectiveZoom}
//         onViewerStateChanged={onViewerStateChanged}
//            brainMapsClientId="NOT_A_VALID_ID"
//   //  ngServer="https://clio-ng.janelia.org"

//       />
//     </div>
//   );
// };

// export default NeuroglancerViewer;