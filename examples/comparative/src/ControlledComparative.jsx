import React, { useMemo } from 'react';
import { Vitessce } from '@vitessce/all';
import { ComparativePageComponent, generateComparativeConfig } from './ComparativeConfig';

export function ControlledComparative(props) {
    const {
        datasetUrl = 'https://data-2.vitessce.io/kpmp-atlas-v2/sn-rna-seq/processed/kpmp-aug-2025.adata.zarr',
        geneSelection,
        sampleSetSelection,
        theme = 'light2',
        debugMode = false,
        logLevel = undefined,
    } = props;
    const initialConfig = useMemo(() => generateComparativeConfig(datasetUrl), [datasetUrl]);
    
    return (
        <div>
            <Vitessce
                config={initialConfig}
                rowHeight={null}
                theme={theme}
                pageMode={true}
                debugMode={debugMode}
                logLevel={logLevel}
            >
                <ComparativePageComponent />
            </Vitessce>
        </div>
    );
}