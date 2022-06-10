import React, {
  useMemo, useEffect,
} from 'react';
import isEqual from 'lodash/isEqual';
import { sum } from 'd3-array';
import TitleInfo from '../TitleInfo';
import { useReady, useUrls, useGridItemSize } from '../hooks';
import {
  useCoordination, useLoaders,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useGenomicProfilesData } from '../data-hooks';
import HiGlassLazy from './HiGlassLazy';

const GENOMIC_PROFILES_DATA_TYPES = ['genomic-profiles'];

const REFERENCE_TILESETS = {
  hg38: {
    chromosomes: 'NyITQvZsS_mOFNlz5C2LJg',
    genes: 'P0PLbQMwTYGy-5uPIQid7A',
  },
  hg19: {
    chromosomes: 'N12wVGG9SPiTkk03yUayUw',
    genes: 'OHJakQICQD6gTD7skx4EWA',
  },
  mm9: {
    chromosomes: 'WAVhNHYxQVueq6KulwgWiQ',
    genes: 'GUm5aBiLRCyz2PsBea7Yzg',
  },
  mm10: {
    chromosomes: 'EtrWT0VtScixmsmwFSd7zg',
    genes: 'QDutvmyiSrec5nX4pA5WGQ',
  },
};

/**
 * A component for visualization of genomic profiles
 * with genome-wide bar plots.
 * @param {object} props The component props.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.profileTrackUidKey The key in the genomic profiles row_info that identifies
 * each track. By default, 'path'.
 * @param {string} props.profileTrackNameKey The key in the genomic profiles row_info that
 * gives a name for each track. By default, null. When null is provided, uses the
 * profileTrackUidKey for both UID and name. If UID values are path arrays,
 * they will be converted to name strings.
 * @param {string} props.higlassServer The URL for the higlass server used to retreive
 * reference tilesets for the chromosome and gene annotations.
 * @param {string} props.assembly The genome assembly to use for the reference
 * tilesets for the chromosome and gene annotations.
 * @param {string} props.title The title of the component.
 */
export default function GenomicProfilesSubscriber(props) {
  const {
    coordinationScopes,
    theme,
    removeGridComponent,
    profileTrackUidKey = 'path',
    profileTrackNameKey = null,
    higlassServer = 'https://higlass.io/api/v1',
    assembly = 'hg38',
    title = 'Genomic Profiles',
  } = props;

  // eslint-disable-next-line no-unused-vars
  const [width, height, containerRef] = useGridItemSize();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsSetColor: cellSetColor,
    obsSetSelection: cellSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES.genomicProfiles,
    coordinationScopes,
  );

  // eslint-disable-next-line no-unused-vars
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    GENOMIC_PROFILES_DATA_TYPES,
  );
    // eslint-disable-next-line no-unused-vars
  const [urls, addUrl, resetUrls] = useUrls();

  const [genomicProfilesAttrs] = useGenomicProfilesData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const hgViewConfig = useMemo(() => {
    if (!genomicProfilesAttrs || urls.length !== 1) {
      return null;
    }
    // Get the URL to the data file from the downloadable URLs array.
    const { url } = urls[0];

    // Set up the colors to use in the HiGlass view config based on the current theme.
    const foregroundColor = (theme === 'dark' ? '#C0C0C0' : '#000000');
    const backgroundColor = (theme === 'dark' ? '#000000' : '#f1f1f1');
    const dimColor = (theme === 'dark' ? 'dimgray' : 'silver');

    // Define the "reference tracks" for chromosome labels and gene annotations.
    const referenceTracks = [
      {
        type: 'horizontal-chromosome-labels',
        server: higlassServer,
        tilesetUid: REFERENCE_TILESETS[assembly].chromosomes,
        uid: 'chromosome-labels',
        options: {
          color: foregroundColor,
          fontSize: 12,
          fontIsLeftAligned: false,
          showMousePosition: true,
          mousePositionColor: foregroundColor,
        },
        height: 30,
      },
      {
        type: 'horizontal-gene-annotations',
        server: higlassServer,
        tilesetUid: REFERENCE_TILESETS[assembly].genes,
        uid: 'gene-annotations',
        options: {
          name: 'Gene Annotations (hg38)',
          fontSize: 10,
          labelPosition: 'hidden',
          labelLeftMargin: 0,
          labelRightMargin: 0,
          labelTopMargin: 0,
          labelBottomMargin: 0,
          minHeight: 24,
          geneAnnotationHeight: 16,
          geneLabelPosition: 'outside',
          geneStrandSpacing: 4,
          showMousePosition: true,
          mousePositionColor: foregroundColor,
          plusStrandColor: foregroundColor,
          minusStrandColor: foregroundColor,
          labelColor: 'black',
          labelBackgroundColor: backgroundColor,
          trackBorderWidth: 0,
          trackBorderColor: 'black',
        },
        height: 70,
      },
    ];
    // Determine the heights of each profile track by subtracting the
    // reference track heights from the component height, then
    // dividing by the number of profiles.
    const referenceTracksHeightSum = sum(referenceTracks.map(t => t.height));
    const profileTracksHeightSum = height - referenceTracksHeightSum - 10;
    const profileTrackHeight = profileTracksHeightSum / genomicProfilesAttrs.row_infos.length;
    const profileTracks = genomicProfilesAttrs.row_infos.map((rowInfo, i) => {
      // Get the uid for the HiGlass track.
      const trackUid = rowInfo[profileTrackUidKey];
      // When profiles correspond to cell sets, the profile UID will be the cell set path array.
      const isPath = Array.isArray(trackUid);
      // Get the name for the HiGlass track: try the name key first,
      // then try the tail of the path, and otherwise the track UID.
      // eslint-disable-next-line no-nested-ternary
      const trackName = profileTrackNameKey
        ? rowInfo[profileTrackNameKey]
        : (isPath ? trackUid[trackUid.length - 1] : trackUid);
      // If the uid is a path, then try to get the corresponding cell set's color,
      // if it is currently selected.
      const setInSelection = isPath ? cellSetSelection?.find(s => isEqual(s, trackUid)) : false;
      const setColor = isPath ? cellSetColor?.find(s => isEqual(s.path, trackUid))?.color : null;
      // Get the track UID as a string before passing to HiGlass.
      const trackUidString = isPath ? trackUid.join('__') : trackUid;
      // Create the HiGlass track definition for this profile.
      const track = {
        type: 'horizontal-bar',
        uid: `bar-track-${trackUidString}`,
        data: {
          type: 'zarr-multivec',
          url,
          row: i,
        },
        options: {
          name: trackName,
          showMousePosition: true,
          mousePositionColor: foregroundColor,
          labelColor: (theme === 'dark' ? 'white' : 'black'),
          labelBackgroundColor: (theme === 'dark' ? 'black' : 'white'),
          labelShowAssembly: false,
        },
        height: profileTrackHeight,
      };
      // Set the track color if it is available.
      if (setColor && setInSelection) {
        const c = setColor;
        track.options.barFillColor = `rgb(${c[0]},${c[1]},${c[2]})`;
      } else {
        track.options.barFillColor = dimColor;
      }
      return track;
    });

    // Create the higlass view.
    // The HiGlassLazy component will fill in the fields 'uid',
    // 'initialXDomain', and 'initialYDomain'.
    const hgView = {
      tracks: {
        top: [
          ...referenceTracks,
          ...profileTracks,
        ],
        left: [],
        center: [],
        right: [],
        bottom: [],
        whole: [],
        gallery: [],
      },
      layout: {
        w: 12,
        h: 12,
        x: 0,
        y: 0,
        static: false,
      },
    };
    return hgView;
  }, [genomicProfilesAttrs, urls, theme, height, profileTrackUidKey,
    profileTrackNameKey, cellSetSelection, cellSetColor,
    higlassServer, assembly]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return (
    <div className="higlass-title-wrapper">
      <TitleInfo
        title={title}
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady={isReady}
        urls={urls}
      >
        <div className="higlass-lazy-wrapper" ref={containerRef}>
          {hgViewConfig ? (
            <HiGlassLazy
              coordinationScopes={coordinationScopes}
              theme={theme}
              hgViewConfig={hgViewConfig}
              height={height}
            />
          ) : null}
        </div>
      </TitleInfo>
    </div>
  );
}
