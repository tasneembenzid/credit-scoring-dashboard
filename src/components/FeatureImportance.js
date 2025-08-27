import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const FeatureImportance = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getFeatureImportance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8000/features/importance');
            const data = await res.json();
            setFeatures(data.features || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFeatureImportance();
    }, []);

    const getFeatureColor = (importance) => {
        if (importance >= 0.3) return '#ef4444';
        if (importance >= 0.2) return '#f59e0b';
        if (importance >= 0.1) return '#3b82f6';
        return '#22c55e';
    };

    const { t } = useLanguage();

    const formatFeatureName = (feature) => {
        // map common feature keys to translation keys
        const map = {
            income: 'income',
            credit_history_length: 'credit_history_length',
            credit_history: 'credit_history_length',
            age: 'age',
            loan_amount: 'loan_amount_field',
            loan_amount_requested: 'loan_amount_field',
            debt_to_income: 'debt_to_income',
            num_open_accounts: 'num_open_accounts',
            delinquencies: 'delinquencies',
            employment_status: 'employment_status'
        };
        const key = map[feature] || feature;
        const translated = t(key);
        // if translation missing (t returns the key), fallback to a prettified name
        if (!translated || translated === key || translated.includes('_')) {
            return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return translated;
    };

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                <h2>📈 {t('feature_importance')}</h2>
                <button
                    className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                    onClick={getFeatureImportance}
                    disabled={loading}
                >
                    {loading ? t('predicting_short') : t('refresh')}
                </button>
            </div>

            {error && (
                <div className="error-message mb-3">
                    <span className="error-icon">⚠️</span>
                    <span>Failed to load features: {error}</span>
                </div>
            )}

            {features.length > 0 && (
                <div className="feature-importance-content">
                    <div className="features-chart">
                        {features.map((item) => (
                            <div key={item.feature} className="feature-item">
                                <div className="feature-header">
                                    <span className="feature-name">
                                        {formatFeatureName(item.feature)}
                                    </span>
                                    <span
                                        className="feature-value"
                                        style={{ color: getFeatureColor(item.importance) }}
                                    >
                                        {(item.importance * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="feature-bar">
                                    <div
                                        className="feature-progress"
                                        style={{
                                            width: `${item.importance * 100}%`,
                                            background: `linear-gradient(90deg, ${getFeatureColor(item.importance)}40, ${getFeatureColor(item.importance)})`,
                                            boxShadow: `0 2px 8px ${getFeatureColor(item.importance)}30`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="feature-insights mt-3">
                        <h4 className="mb-2">{t('key_insights')}</h4>
                        <div className="insights-list">
                            <div className="insight-item">
                                <span className="insight-icon">💰</span>
                                <span className="insight-text">
                                    <strong>{t('income')}</strong> {t('insight_income') || 'is the most significant factor affecting credit scores'}
                                </span>
                            </div>
                            <div className="insight-item">
                                <span className="insight-icon">📊</span>
                                <span className="insight-text">
                                    <strong>{t('credit_history_length')}</strong> {t('insight_history') || 'shows strong correlation with creditworthiness'}
                                </span>
                            </div>
                            <div className="insight-item">
                                <span className="insight-icon">👤</span>
                                <span className="insight-text">
                                    <strong>{t('age')}</strong> {t('insight_age') || 'demonstrates moderate impact on scoring decisions'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="feature-legend mt-3">
            <h4 className="mb-2">{t('importance_scale')}</h4>
                        <div className="legend-items">
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#ef4444' }}></div>
                <span>{t('critical')} (30%+)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#f59e0b' }}></div>
                <span>{t('high')} (20-30%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#3b82f6' }}></div>
                <span>{t('medium')} (10-20%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#22c55e' }}></div>
                <span>{t('low')} (0-10%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {features.length === 0 && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">📈</div>
                    <p className="text-muted">{t('click_refresh_model_info')}</p>
                </div>
            )}
        </div>
    );
};

export default FeatureImportance;
