import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const RecentPredictions = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try loading from backend first, fallback to localStorage/sample data
        const fetchFromServer = async () => {
            try {
                setLoading(true);
                const resp = await fetch('/predictions');
                if (!resp.ok) throw new Error('Server returned ' + resp.status);
                const data = await resp.json();
                if (data && data.predictions && data.predictions.length) {
                    // Normalize server rows to the component format
                    const rows = data.predictions.map((r) => ({
                        id: r.id,
                        timestamp: r.timestamp,
                        score: r.score,
                        riskLevel: r.risk_level,
                        applicantId: r.applicant_id || (`APP-${r.id}`),
                        loanAmount: r.loan_amount ? Number(r.loan_amount) : 0,
                        purpose: r.purpose || (r.input_data && r.input_data.purpose) || 'Unknown'
                    }));
                    setPredictions(rows);
                    localStorage.setItem('recentPredictions', JSON.stringify(rows));
                    setLoading(false);
                    return;
                }
            } catch (err) {
                // ignore and fallback
            } finally {
                setLoading(false);
            }

            const savedPredictions = localStorage.getItem('recentPredictions');
            if (savedPredictions) {
                setPredictions(JSON.parse(savedPredictions));
            } else {
                // Generate some sample data
                generateSampleData();
            }
        };
        fetchFromServer();
    }, []);

    const generateSampleData = () => {
        const sampleData = [
                {
                id: 1,
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                score: 742,
                riskLevel: 'Low',
                applicantId: 'APP-001',
                loanAmount: 25000,
                purpose: 'purpose_home'
            },
                {
                id: 2,
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                score: 658,
                riskLevel: 'Medium',
                applicantId: 'APP-002',
                loanAmount: 15000,
                purpose: 'purpose_auto'
            },
                {
                id: 3,
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                score: 580,
                riskLevel: 'High',
                applicantId: 'APP-003',
                loanAmount: 8000,
                purpose: 'purpose_other'
            },
                {
                id: 4,
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                score: 785,
                riskLevel: 'Low',
                applicantId: 'APP-004',
                loanAmount: 50000,
                purpose: 'purpose_business'
            },
                {
                id: 5,
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                score: 695,
                riskLevel: 'Medium',
                applicantId: 'APP-005',
                loanAmount: 12000,
                purpose: 'purpose_education'
            }
        ];
        setPredictions(sampleData);
        localStorage.setItem('recentPredictions', JSON.stringify(sampleData));
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel.toLowerCase()) {
            case 'low': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'high': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 750) return '#22c55e';
        if (score >= 700) return '#3b82f6';
        if (score >= 650) return '#f59e0b';
        return '#ef4444';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const refreshData = () => {
        setLoading(true);
        // Attempt to fetch fresh data from server, otherwise regenerate sample data
        (async () => {
            try {
                setLoading(true);
                const resp = await fetch('/predictions');
                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.predictions) {
                        const rows = data.predictions.map((r) => ({
                            id: r.id,
                            timestamp: r.timestamp,
                            score: r.score,
                            riskLevel: r.risk_level,
                            applicantId: r.applicant_id || (`APP-${r.id}`),
                            loanAmount: r.loan_amount ? Number(r.loan_amount) : 0,
                            purpose: r.purpose || (r.input_data && r.input_data.purpose) || 'Unknown'
                        }));
                        setPredictions(rows);
                        localStorage.setItem('recentPredictions', JSON.stringify(rows));
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                // fallback
            }
            // fallback to generating sample data
            generateSampleData();
            setLoading(false);
        })();
    };

    const { t } = useLanguage();

    // detect RTL for Arabic and apply table direction class
    const isRtl = (typeof document !== 'undefined') && document.documentElement && document.documentElement.dir === 'rtl';

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                <h2>🕒 {t('recent_predictions')}</h2>
                <button 
                    className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                    onClick={refreshData}
                    disabled={loading}
                >
                    {loading ? '🔄 Refreshing...' : t('refresh')}
                </button>
            </div>
            
            <div className="table-container">
                <table className={`table ${isRtl ? 'rtl-table' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    <thead>
                        <tr>
                            <th>{t('applicant_id')}</th>
                            <th>{t('score')}</th>
                            <th>{t('risk_level')}</th>
                            <th>{t('loan_amount')}</th>
                            <th>{t('purpose')}</th>
                            <th>{t('time')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {predictions.map((prediction) => (
                            <tr key={prediction.id}>
                                <td>
                                    <div className="applicant-id">
                                        <strong>{prediction.applicantId}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div 
                                        className="score-badge"
                                        style={{ 
                                            color: getScoreColor(prediction.score),
                                            fontWeight: '600'
                                        }}
                                    >
                                        {prediction.score}
                                    </div>
                                </td>
                                <td>
                                    <div 
                                        className="status-indicator"
                                        style={{
                                            background: `${getRiskColor(prediction.riskLevel)}20`,
                                            color: getRiskColor(prediction.riskLevel),
                                            border: `1px solid ${getRiskColor(prediction.riskLevel)}30`,
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {prediction.riskLevel}
                                    </div>
                                </td>
                                <td>
                                    <span className="loan-amount">
                                        ${prediction.loanAmount.toLocaleString()}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-secondary">
                                        {t(prediction.purpose) || prediction.purpose}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-muted">
                                        {formatTime(prediction.timestamp)}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-1">
                                            <button 
                                                className="btn-mini"
                                                title={t('view_details')}
                                            >
                                                👁️
                                            </button>
                                            <button 
                                                className="btn-mini"
                                                title={t('export')}
                                            >
                                                📄
                                            </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {predictions.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>{t('no_predictions')}</h3>
                    <p className="text-muted">{t('predict_heading')}</p>
                </div>
            )}
        </div>
    );
};

export default RecentPredictions;
