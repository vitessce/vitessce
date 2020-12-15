/* eslint-disable */
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';

export default function ScatterplotOptions(props) {
    const {
        isLabelsOn,
        setIsLabelsOn,
        cellRadius,
        setCellRadius,
    } = props;


    function handleIsLabelOnChange(event) {
        setIsLabelsOn(event.target.checked);
    }

    return (
        <CSSTransition
            classNames="options-pane-container"
            in={true}
            appear={true}
            timeout={500}
        >
            <div className="options-pane-container">
                <h4>Scatterplot Options</h4>
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={isLabelsOn} onChange={handleIsLabelOnChange} name="scatterplot-option-cell-set-labels" />}
                        label="Cell Set Labels"
                    />
                </FormGroup>
            </div>
        </CSSTransition>
    );
}