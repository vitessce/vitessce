/* eslint-disable */
import React, {
    useMemo, useEffect, useRef, Suspense, useState,
} from 'react';
import isEqual from 'lodash/isEqual';
import TitleInfo from '../TitleInfo';
import { useReady, useUrls, useGridItemSize } from '../hooks';
import {
    useCoordination, useLoaders,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useGenomicProfilesData } from '../data-hooks';
import HiGlassLazy from './HiGlassLazy';

const HIGLASS_SERVER = "https://higlass.io/api/v1";
const GENOMIC_PROFILES_DATA_TYPES = ['genomic-profiles'];

export default function CellSetGenomicProfilesSubscriber(props) {
    const {
        coordinationScopes,
        theme,
        removeGridComponent,
    } = props;

    const loaders = useLoaders();

    // Get "props" from the coordination space.
    const [{
        dataset,
        cellSetColor,
        cellSetSelection,
    }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetGenomicProfiles, coordinationScopes);

    // eslint-disable-next-line no-unused-vars
    const [isReady, setItemIsReady, resetReadyItems] = useReady(
        GENOMIC_PROFILES_DATA_TYPES,
    );
    // eslint-disable-next-line no-unused-vars
    const [urls, addUrl, resetUrls] = useUrls();

    const [genomicProfilesAttrs] = useGenomicProfilesData(loaders, dataset, setItemIsReady, addUrl, true);

    const hgViewConfig = useMemo(() => {
        if(!genomicProfilesAttrs || urls.length !== 1) {
            return null;
        }

        const foregroundColor = (theme === "dark" ? "#C0C0C0" : "#000000");
        const backgroundColor = (theme === "dark" ? "#000000" : "#f1f1f1");
        const dimColor = (theme === "dark" ? "dimgray" : "silver");
        
        const url = urls[0].url;
        const profileTracks = genomicProfilesAttrs['row_infos'].map((rowInfo, i) => {
            const { path } = rowInfo;
            const setInSelection = cellSetSelection?.find(s => isEqual(s, path));
            const setColor = cellSetColor?.find(s => isEqual(s.path, path))?.color;
            const pathString = path.join("__");
            const track = {
                type: "horizontal-bar",
                uid: `bar-track-${pathString}`,
                "data": {
                    "type": "zarr-multivec",
                    "url": url,
                    "row": i
                },
                "options": {
                  "name": path.join(" > "),
                  "showMousePosition": true,
                  "mousePositionColor": foregroundColor,
                  "labelColor": (theme === "dark" ? "white" : "black"),
                 "labelBackgroundColor": (theme === "dark" ? "black" : "white"),
                 "labelShowAssembly": false,
                },
                "height": 30
            };
            if(setColor && setInSelection) {
                const c = setColor;
                track.options.barFillColor = `rgb(${c[0]},${c[1]},${c[2]})`;
            } else {
                track.options.barFillColor = dimColor;
            }
            return track;
        });

        const hgView = {
            tracks: {
                top: [
                    {
                        "type": "horizontal-chromosome-labels",
                        "server": HIGLASS_SERVER,
                        "tilesetUid": "NyITQvZsS_mOFNlz5C2LJg",
                        "uid": "chromosome-labels-1",
                        "options": {
                            "color": foregroundColor,
                            "fontSize": 12,
                            "fontIsLeftAligned": false,
                            "showMousePosition": true,
                            "mousePositionColor": foregroundColor,
                        },
                        "height": 30
                    },
                    {
                        "type": "horizontal-gene-annotations",
                        "server": HIGLASS_SERVER,
                        "tilesetUid": "P0PLbQMwTYGy-5uPIQid7A",
                        "uid": "gene-annotations-2",
                        "options": {
                            "name": "Gene Annotations (hg38)",
                            "fontSize": 10,
                            "labelPosition": "hidden",
                            "labelLeftMargin": 0,
                            "labelRightMargin": 0,
                            "labelTopMargin": 0,
                            "labelBottomMargin": 0,
                            "minHeight": 24,
                            "geneAnnotationHeight": 16,
                            "geneLabelPosition": "outside",
                            "geneStrandSpacing": 4,
                            "showMousePosition": true,
                            "mousePositionColor": foregroundColor,
                            "plusStrandColor": foregroundColor,
                            "minusStrandColor": foregroundColor,
                            "labelColor": "black",
                            "labelBackgroundColor": backgroundColor,
                            "trackBorderWidth": 0,
                            "trackBorderColor": "black"
                        },
                        "height": 70
                    },
                    ...profileTracks
                ],
                "left": [],
                "center": [],
                "right": [],
                "bottom": [],
                "whole": [],
                "gallery": []
            },
            "layout": {
                "w": 12,
                "h": 12,
                "x": 0,
                "y": 0,
                "moved": false,
                "static": false
            }
        };
        return hgView;
    }, [genomicProfilesAttrs, urls, cellSetColor, cellSetSelection, theme]);

    // Reset file URLs and loader progress when the dataset has changed.
    useEffect(() => {
        resetUrls();
        resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaders, dataset]);


    return (
        <div className="higlass-title-wrapper">
          <TitleInfo
            title="Cell Set Genomic Profiles"
            removeGridComponent={removeGridComponent}
            theme={theme}
            isReady={isReady}
            urls={urls}
          >
            {hgViewConfig ?
                <HiGlassLazy
                    coordinationScopes={coordinationScopes}
                    theme={theme}
                    hgViewConfig={hgViewConfig}
                />
            : null}
          </TitleInfo>
        </div>
    );
}