import React from 'react';
import styles from '../pages/styles.module.css';

export default function StudyIdInput({ onInputError, onInputChange, idLength }) {
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            onInputError('Study ID cannot be empty');
        } else if (!/^\d+$/.test(value)) {
            onInputError('Study ID must be numbers only');
        } else {
            onInputError(null);
        }
        onInputChange(value);
    };
    return (
        <>
            {/* <form className="form" > */}
                <p className={styles.viewConfigInputUrlOrFileText} htmlFor="inputField"> Enter your study id
                    <span className={styles.requiredField}>*</span>
                </p>
                <input
                    type="text"
                    id="inputField"
                    className={styles.viewConfigUrlInput}
                    placeholder={`${idLength}-Digit Id`}
                    onChange={handleInputChange}
                />
            {/* </form> */}
        </>
    );
}
