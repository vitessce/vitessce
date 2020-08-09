/* eslint-disable */
import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { DatasetLoaderContext } from './redux/contexts';

function DatasetLoaderProvider(props) {
    const { datasets, children } = props;

    // Want to store loaders in a mutable object,
    // with mapping from dataset ID to data types to loaders.
    // e.g. { dries: { cells: new CellsJsonLoader, cellSets: new CellSetsJsonLoader }}
    const loadersRef = useRef({});
    // Need to have a state variable,
    // which will cause the provider to re-render
    // with the new ref value.
    const [uids, setUids] = useState([]);

    useEffect(() => {
        if(datasets) {
            const newUids = datasets.map(d => d.uid);
            if(!isEqual(uids, newUids)) {
                loadersRef.current = newUids;
                setUids(newUids);
            }
        }
    }, [datasets, uids]);

    return (
        <DatasetLoaderContext.Provider value={loadersRef.current}>
            {children}
        </DatasetLoaderContext.Provider>
    );
}

const mapStateToProps = (state, ownProps) => ({
    datasets: state.viewConfig?.datasets,
});
  
const mapDispatchToProps = (dispatch, ownProps) => ({
    
});
  
export default connect(mapStateToProps, mapDispatchToProps)(DatasetLoaderProvider);