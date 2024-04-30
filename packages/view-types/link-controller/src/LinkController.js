import React, {useState, useRef, useEffect} from 'react';

export default function LinkController(props) {
    const {code, metadata} = props;
    console.log(code)
    return <div>
        <p>To join this session enter <b>{code}</b> at <a href={'https://vitessce.link'}>vitessce.link</a></p>
    </div>;
}
