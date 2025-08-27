import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const ModelInfo = () => {
    const [modelData, setModelData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getModelInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8000/model/info');
            const data = await res.json();
            setModelData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getModelInfo();
    }, []);

    const { t } = useLanguage();

    const modelMetrics = [
        { label: t('accuracy') || 'Accuracy', value: '94.2%', color: '#22c55e' },
        { label: t('precision') || 'Precision', value: '91.8%', color: '#3b82f6' },
        { label: t('recall') || 'Recall', value: '89.5%', color: '#f59e0b' },
        { label: t('f1_score') || 'F1-Score', value: '90.6%', color: '#8b5cf6' }
    ];

    const formatFeatureName = (feature) => {
        const map = {
            income: 'income',
            credit_history_length: 'credit_history_length',
            credit_history: 'credit_history_length',
            age: 'age',
            loan_amount: 'loan_amount_field',
            debt_to_income: 'debt_to_income',
            num_open_accounts: 'num_open_accounts',
            delinquencies: 'delinquencies',
            employment_status: 'employment_status'
        };
        const key = map[feature] || feature;
        const translated = t(key);
        if (!translated || translated === key || translated.includes('_')) {
            return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return translated;
    };

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                <h2>🤖 {t('model_information')}</h2>
                <button
                    className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                    onClick={getModelInfo}
                    disabled={loading}
                >
                    {loading ? t('predicting_short') : t('refresh')}
                </button>
            </div>

            {error && (
                <div className="error-message mb-3">
                    <span className="error-icon">⚠️</span>
                    <span>Failed to load model info: {error}</span>
                </div>
            )}

            {modelData && (
                <div className="model-info-content">
                    <div className="model-header mb-3">
                        <div className="model-name">
                            <h3>{modelData.model_name}</h3>
                            <div className="model-version">
                                Version {modelData.version}
                            </div>
                        </div>
                        <div className="model-algorithm">
                            <div
                                className="algorithm-badge"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}
                            >
                                {modelData.algorithm}
                            </div>
                        </div>
                    </div>

                    <div className="model-metrics mb-3">
                        <h4 className="mb-2">{t('performance_metrics')}</h4>
                        <div className="metrics-grid">
                            {modelMetrics.map((metric) => (
                                <div key={metric.label} className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-label">{metric.label}</span>
                                        <span
                                            className="metric-value"
                                            style={{ color: metric.color }}
                                        >
                                            {metric.value}
                                        </span>
                                    </div>
                                    <div className="metric-bar">
                                        <div
                                            className="metric-progress"
                                            style={{
                                                width: metric.value,
                                                background: `linear-gradient(90deg, ${metric.color}40, ${metric.color})`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="model-features">
                        <h4 className="mb-2">{t('input_features')}</h4>
                        <div className="features-list">
                            {modelData.features?.map((feature) => (
                                <div key={feature} className="feature-tag">
                                    {formatFeatureName(feature)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="model-target mt-3">
                        <h4 className="mb-2">{t('target_variable')}</h4>
                        <div className="target-info">
                            <span className="target-name">{modelData.target}</span>
                            <span className="target-description text-muted">
                                {t('credit_score_range') || 'Credit score prediction (300-850 range)'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

                    {!modelData && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">🤖</div>
                    <p className="text-muted">{t('click_refresh_model_info')}</p>
                </div>
            )}
        </div>
    );
};

export default ModelInfo;
