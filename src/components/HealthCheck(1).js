import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const HealthCheck = () => {
    const { t } = useLanguage();
    const [result, setResult] = useState(t('click_to_test') || 'Click the button to test...');

    const checkHealth = async () => {
        try {
            const res = await fetch('http://localhost:8000/health');
            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`${t('error') || 'Error'}: ${error.message}`);
        }
    };

    return (
        <div className="card">
            <h2>{t('system_health')}</h2>
            <button onClick={checkHealth}>{t('check_now')}</button>
            <pre>{result}</pre>
        </div>
    );
};

export default HealthCheck;
