import React from 'react';
import { useLanguage } from './LanguageProvider';

const StatsCards = ({ stats = {} }) => {
  const { t } = useLanguage();

  const statsData = [
    {
      title: t('total_predictions'),
      value: stats.totalPredictions || 0,
      icon: '📊',
      color: '#667eea',
      bgColor: 'rgba(102,126,234,0.08)'
    },
    {
      title: t('average_score'),
      value: stats.averageScore || 0,
      icon: '⭐',
      color: '#f093fb',
      bgColor: 'rgba(240,147,251,0.08)',
      suffix: '/850'
    },
    {
      title: t('high_risk'),
      value: stats.highRiskCount || 0,
      icon: '⚠️',
      color: '#ef4444',
      bgColor: 'rgba(239,68,68,0.08)'
    },
    {
      title: t('low_risk'),
      value: stats.lowRiskCount || 0,
      icon: '✅',
      color: '#22c55e',
      bgColor: 'rgba(34,197,94,0.08)'
    }
  ];

  return (
    <div className="stats-section mb-4">
      <div className="grid grid-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-header">
                <div
                  className="stat-icon"
                  style={{ background: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                </div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
