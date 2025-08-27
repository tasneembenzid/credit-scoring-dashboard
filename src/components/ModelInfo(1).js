import React, { useState } from 'react';

const ModelInfo = () => {
    const [result, setResult] = useState('Click the button to load model info...');

    const getModelInfo = async () => {
        try {
            const res = await fetch('http://localhost:8000/model/info');
            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Error: ' + error.message);
        }
    };

    return (
        <div className="card">
            <h2>Model Info</h2>
            <button onClick={getModelInfo}>Get Model Info</button>
            <pre>{result}</pre>
        </div>
    );
};

export default ModelInfo;
