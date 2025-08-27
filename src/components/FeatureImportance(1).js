import React, { useState } from 'react';

const FeatureImportance = () => {
    const [result, setResult] = useState('Click the button to load feature importance...');

    const getFeatureImportance = async () => {
        try {
            const res = await fetch('http://localhost:8000/features/importance');
            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Error: ' + error.message);
        }
    };

    return (
        <div className="card">
            <h2>Feature Importance</h2>
            <button onClick={getFeatureImportance}>Get Features</button>
            <pre>{result}</pre>
        </div>
    );
};

export default FeatureImportance;
