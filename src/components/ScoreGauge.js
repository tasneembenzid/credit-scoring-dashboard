import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const ScoreGauge = ({ score = 750, maxScore = 850, minScore = 300 }) => {
    const [animatedScore, setAnimatedScore] = useState(minScore);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 500);
        return () => clearTimeout(timer);
    }, [score]);

    const percentage = ((animatedScore - minScore) / (maxScore - minScore)) * 100;
    const circumference = 2 * Math.PI * 90;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const { t } = useLanguage();

    const getRiskLevel = (score) => {
        if (score >= 750) return { level: t('risk_excellent') || 'Excellent', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
        if (score >= 700) return { level: t('risk_good') || 'Good', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
        if (score >= 650) return { level: t('risk_fair') || 'Fair', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
        if (score >= 600) return { level: t('risk_poor') || 'Poor', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
        return { level: t('risk_very_poor') || 'Very Poor', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)' };
    };

    const riskInfo = getRiskLevel(animatedScore);

    return (
        <div className="card">
            <div className="d-flex justify-between align-center mb-3">
                <h2>📊 {t('score')}</h2>
                <div 
                    className="status-indicator"
                    style={{ 
                        background: riskInfo.bgColor, 
                        color: riskInfo.color,
                        border: `1px solid ${riskInfo.color}30`
                    }}
                >
                    {riskInfo.level}
                </div>
            </div>
            
            <div className="score-gauge-container">
                <div className="gauge-wrapper">
                    <svg width="200" height="200" className="gauge-svg">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="8"
                        />
                        
                        {/* Progress circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={riskInfo.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 100 100)"
                            style={{
                                transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: `drop-shadow(0 0 8px ${riskInfo.color}40)`
                            }}
                        />
                        
                        {/* Score text */}
                        <text
                            x="100"
                            y="95"
                            textAnchor="middle"
                            className="gauge-score"
                            fill={riskInfo.color}
                            fontSize="36"
                            fontWeight="700"
                        >
                            {Math.round(animatedScore)}
                        </text>
                        
                        {/* Max score text */}
                        <text
                            x="100"
                            y="115"
                            textAnchor="middle"
                            fill="var(--text-secondary)"
                            fontSize="14"
                            fontWeight="500"
                        >
                            / {maxScore}
                        </text>
                    </svg>
                </div>
                
                <div className="gauge-details">
                    <div className="score-breakdown">
                        <div className="score-range">
                            <div className="range-item">
                                <div className="range-color" style={{ background: '#dc2626' }}></div>
                                <span>300-579</span>
                                <span className="text-muted">{t('risk_poor') || 'Poor'}</span>
                            </div>
                            <div className="range-item">
                                <div className="range-color" style={{ background: '#f59e0b' }}></div>
                                <span>580-669</span>
                                <span className="text-muted">{t('risk_fair') || 'Fair'}</span>
                            </div>
                            <div className="range-item">
                                <div className="range-color" style={{ background: '#3b82f6' }}></div>
                                <span>670-739</span>
                                <span className="text-muted">{t('risk_good') || 'Good'}</span>
                            </div>
                            <div className="range-item">
                                <div className="range-color" style={{ background: '#22c55e' }}></div>
                                <span>740-850</span>
                                <span className="text-muted">{t('risk_excellent') || 'Excellent'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="score-insights mt-3">
                <h3 className="mb-2">{t('score_insights')}</h3>
                <div className="insights-grid">
                    <div className="insight-item">
                        <span className="insight-label">{t('approval_rate')}</span>
                        <span className="insight-value" style={{ color: riskInfo.color }}>
                            {animatedScore >= 750 ? '95%' : animatedScore >= 700 ? '85%' : animatedScore >= 650 ? '65%' : '35%'}
                        </span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">{t('interest_rate')}</span>
                        <span className="insight-value">
                            {animatedScore >= 750 ? '3.5%' : animatedScore >= 700 ? '5.2%' : animatedScore >= 650 ? '8.1%' : '12.5%'}
                        </span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">{t('risk_level')}</span>
                        <span className="insight-value" style={{ color: riskInfo.color }}>
                            {riskInfo.level}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;
