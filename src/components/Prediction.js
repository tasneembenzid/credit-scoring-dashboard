import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const FEATURE_DEFS = [
    { key: 'age', label: 'age', type: 'number', placeholder: '35', min: 18, max: 100 },
    { key: 'income', label: 'income', type: 'number', placeholder: '5000', min: 0 },
    { key: 'debt_to_income', label: 'debt_to_income', type: 'number', step: '0.01', placeholder: '0.30', min: 0, max: 1 },
    { key: 'credit_history_length', label: 'credit_history_length', type: 'number', placeholder: '8', min: 0 },
    { key: 'num_open_accounts', label: 'num_open_accounts', type: 'number', placeholder: '5', min: 0 },
    { key: 'delinquencies', label: 'delinquencies', type: 'number', placeholder: '0', min: 0 },
    { key: 'employment_status', label: 'employment_status', type: 'select', options: ['employed', 'self_employed', 'unemployed', 'student', 'retired'] },
    { key: 'loan_amount', label: 'loan_amount_field', type: 'number', placeholder: '25000', min: 1000 },
    { key: 'purpose', label: 'purpose_field', type: 'select', options: ['home', 'auto', 'education', 'business', 'medical', 'other'] }
];

const buildInitialForm = () => FEATURE_DEFS.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {});

const getCompleteness = (form) => {
  const total = FEATURE_DEFS.length;
  const filled = FEATURE_DEFS.filter(f => form[f.key] !== '').length;
  return { filled, total, percentage: Math.round((filled / total) * 100) };
};

const Prediction = ({ onPredictionUpdate }) => {
    const [form, setForm] = useState(buildInitialForm);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const completeness = getCompleteness(form);
    const { t } = useLanguage();

    const handleInputChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError(''); // Clear error when user makes changes
    };

    const resetForm = () => {
        setForm(buildInitialForm());
        setResult(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Convert form data to proper types
            const payload = { ...form };
            FEATURE_DEFS.forEach(field => {
                if (field.type === 'number' && payload[field.key] !== '') {
                    payload[field.key] = Number(payload[field.key]);
                }
            });

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Prediction request failed');
            }

            const data = await response.json();
            setResult(data);

            // Update dashboard stats if callback provided
            if (onPredictionUpdate) {
                const currentStats = JSON.parse(localStorage.getItem('creditDashboardStats') || '{}');
                const newStats = {
                    totalPredictions: (currentStats.totalPredictions || 0) + 1,
                    averageScore: data.prediction,
                    highRiskCount: data.risk_level === 'High' ? (currentStats.highRiskCount || 0) + 1 : (currentStats.highRiskCount || 0),
                    lowRiskCount: data.risk_level === 'Low' ? (currentStats.lowRiskCount || 0) + 1 : (currentStats.lowRiskCount || 0)
                };
                localStorage.setItem('creditDashboardStats', JSON.stringify(newStats));
                onPredictionUpdate(newStats);
            }

            // Save to recent predictions
            const recentPredictions = JSON.parse(localStorage.getItem('recentPredictions') || '[]');
            const newPrediction = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                score: data.prediction,
                riskLevel: data.risk_level,
                applicantId: `APP-${String(Date.now()).slice(-3)}`,
                loanAmount: payload.loan_amount || 0,
                purpose: payload.purpose || 'Other'
            };
            recentPredictions.unshift(newPrediction);
            localStorage.setItem('recentPredictions', JSON.stringify(recentPredictions.slice(0, 10)));

            // Also attempt to store on server (best-effort, don't block UI)
            (async () => {
                try {
                    await fetch('http://localhost:8000/predict/store', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prediction: data.prediction,
                            risk_level: data.risk_level,
                            input_data: payload,
                            applicant_id: newPrediction.applicantId,
                            loan_amount: newPrediction.loanAmount,
                            purpose: newPrediction.purpose
                        })
                    });
                } catch (err) {
                    // silently ignore storage errors
                }
            })();

        } catch (err) {
            setError(err.message || 'Failed to get prediction');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'low': return '#22c55e';
            case 'medium-low': return '#3b82f6';
            case 'medium': return '#f59e0b';
            case 'medium-high': return '#f97316';
            case 'high': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                    <h2>🎯 {t('predict_heading')}</h2>
                    <div className="d-flex align-center gap-2">
                    <div className="completeness-indicator">
                        <span className="text-muted">{`${completeness.filled}/${completeness.total} ${t('fields_label')}`}</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${completeness.percentage}%`,
                                    background: completeness.percentage === 100 ? '#22c55e' : '#f59e0b'
                                }}
                            ></div>
                        </div>
                    </div>
                    <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetForm}
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="prediction-form">
                <div className="form-grid">
                    {FEATURE_DEFS.map((field) => (
                        <div key={field.key} className="form-group">
                            <label className="form-label" htmlFor={field.key}>
                                {t(field.label)}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    id={field.key}
                                    className="form-select"
                                    value={form[field.key]}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                >
                                    <option value="">{t('select_placeholder') || t('select_label')}</option>
                                    {field.options.map((option) => (
                                        <option key={option} value={option}>
                                            {/* map option keys to translation keys where available */}
                                            {t(field.key === 'purpose' ? `purpose_${option}` : `employment_${option.replace('-', '_')}`) || (option.charAt(0).toUpperCase() + option.slice(1))}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={field.key}
                                    type={field.type}
                                    className="form-input"
                                    placeholder={field.placeholder}
                                    value={form[field.key]}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="form-actions mt-3">
                    <button 
                        type="submit" 
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading || completeness.filled === 0}
                    >
                        {loading ? '⏳ Predicting...' : t('predict_button')}
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message mt-3">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="prediction-result mt-4">
                    <div className="result-header">
                        <h3>{t('predict_heading')}</h3>
                        <div 
                            className="status-indicator"
                            style={{
                                background: `${getRiskColor(result.risk_level)}20`,
                                color: getRiskColor(result.risk_level),
                                border: `1px solid ${getRiskColor(result.risk_level)}30`
                            }}
                        >
                            {t(result.risk_level.toLowerCase()) || result.risk_level} {t('risk_level')}
                        </div>
                    </div>

                    <div className="result-content">
                        <div className="score-display">
                            <div className="score-value" style={{ color: getRiskColor(result.risk_level) }}>
                                {result.prediction}
                            </div>
                            <div className="score-label">{t('score')}</div>
                            <div className="confidence-badge">
                                {Math.round(result.confidence * 100)}% {t('confidence')}
                            </div>
                        </div>

                        {result.factors && (
                            <div className="factors-breakdown">
                                    <h4>{t('score_factors')}</h4>
                                <div className="factors-grid">
                                    {Object.entries(result.factors).map(([key, value]) => (
                                        <div key={key} className="factor-item">
                                            <span className="factor-label">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            <span 
                                                className="factor-value"
                                                style={{ color: value >= 0 ? '#22c55e' : '#ef4444' }}
                                            >
                                                {value >= 0 ? '+' : ''}{value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.recommendations && result.recommendations.length > 0 && (
                            <div className="recommendations">
                                <h4>{t('recommendations')}</h4>
                                <ul className="recommendations-list">
                                    {result.recommendations.map((rec, index) => (
                                        <li key={`rec-${index}`} className="recommendation-item">
                                            <span className="rec-icon">💡</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prediction;
