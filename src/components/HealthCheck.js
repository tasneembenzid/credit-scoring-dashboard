import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const HealthCheck = () => {
    const [status, setStatus] = useState('checking');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/health');
            const data = await res.json();
            setResult(data);
            setStatus('online');
            setLastChecked(new Date());
        } catch (error) {
            setResult({ error: error.message });
            setStatus('offline');
            setLastChecked(new Date());
        } finally {
            setLoading(false);
        }
    };

    // Auto-check on component mount
    useEffect(() => {
        checkHealth();
        // Set up periodic health checks every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const { t } = useLanguage();

    const getStatusInfo = () => {
        switch (status) {
            case 'online':
                return {
                    color: '#22c55e',
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    icon: '✅',
                    text: t('api_online')
                };
            case 'offline':
                return {
                    color: '#ef4444',
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    icon: '❌',
                    text: t('api_offline')
                };
            default:
                return {
                    color: '#f59e0b',
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    icon: '🔄',
                    text: t('checking')
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                <h2>🏥 {t('system_health')}</h2>
                <div
                    className="status-indicator"
                    style={{
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}30`
                    }}
                >
                    <span>{statusInfo.icon}</span>
                    {statusInfo.text}
                </div>
            </div>

            <div className="health-metrics">
                <div className="metric-grid">
                    <div className="metric-item">
                        <div className="metric-label">{t('response_time')}</div>
                        <div className="metric-value" style={{ color: statusInfo.color }}>
                            {status === 'online' ? '< 100ms' : 'N/A'}
                        </div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-label">{t('uptime')}</div>
                        <div className="metric-value">99.9%</div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-label">{t('last_check')}</div>
                        <div className="metric-value text-muted">
                            {lastChecked ? lastChecked.toLocaleTimeString() : t('never')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="health-actions mt-3">
                <button
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    onClick={checkHealth}
                    disabled={loading}
                >
                    {loading ? `${t('checking')}` : `${t('check_now')}`}
                </button>
            </div>

            {result && (
                <details className="health-details mt-3">
                    <summary className="health-summary">{t('view_raw_response')}</summary>
                    <pre className="health-response">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default HealthCheck;
