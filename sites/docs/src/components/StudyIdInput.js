import React from 'react';
import styles from './styles.module.css';
import configStyles from './styles.module.css' ;

import { useState } from 'react';

// export default function StudyIdInput({setError, setStudyId}) {
    export default function StudyIdInput() {
    const [studyId, setStudyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const value = e.target.value;

        // Check if the input is not empty and only contains numbers
        if (value === '') {
            setError('Study ID cannot be empty');
        } else if (!/^\d+$/.test(value)) {
            setError('Study ID must be numbers only');
        } else {
            setError(null);
        }

        setStudyId(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform your submit action here if the input is valid
        if (!errorMessage) {
            console.log("Submitted Study ID:", studyId);
            // Additional submit logic...
        }
    };

    return (
        <div className={styles.container}>
            <form className="form" onSubmit={handleSubmit}>
                <p htmlFor="inputField">Enter your study id</p>
                <input
                    type="text"
                    id="inputField"
                    className={styles.textBox}
                    value={studyId}
                    onChange={handleInputChange}
                />
                {errorMessage && (
                    <p className={styles.errorMessage}>{errorMessage}</p>
                )}
                {/* <button type="submit" className={styles.submitButton}>
                    Submit
                </button> */}
            </form>
        </div>
    );
}
