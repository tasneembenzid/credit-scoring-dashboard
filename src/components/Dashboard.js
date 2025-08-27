import React, { useState, useEffect } from 'react';
import HealthCheck from './HealthCheck';
import ModelInfo from './ModelInfo';
import Prediction from './Prediction';
import FeatureImportance from './FeatureImportance';
import ScoreGauge from './ScoreGauge';
import StatsCards from './StatsCards';
import RecentPredictions from './RecentPredictions';
import LanguageProvider, { useLanguage } from './LanguageProvider';

const HeaderControls = ({ toggleTheme, isDarkMode }) => {
    const { lang, setLang, t } = useLanguage();
    return (
        <div className="d-flex align-center gap-3">
            <button
                className="btn btn-secondary"
                onClick={toggleTheme}
                title="Toggle theme"
            >
                {isDarkMode ? '\u2600\ufe0f Light' : '\ud83c\udf19 Dark'}
            </button>
            <div className="d-flex align-center">
                <button className={`btn ${lang==='fr'?'btn-primary':'btn-secondary'}`} onClick={() => setLang('fr')}>FR</button>
                <button className={`btn ${lang==='ar'?'btn-primary':'btn-secondary'}`} style={{marginLeft:8}} onClick={() => setLang('ar')}>AR</button>
            </div>
            <div className="status-indicator status-online">
                <span className="status-dot"></span>
                {t('system_online')}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [stats, setStats] = useState({
        totalPredictions: 0,
        averageScore: 0,
        highRiskCount: 0,
        lowRiskCount: 0
    });

    const Inner = () => {
        const { t } = useLanguage();
        return (
            <div className="container">
                {/* Header Section */}
                <header className="dashboard-header mb-4">
                    <div className="d-flex justify-between align-center">
                        <div>
                            <h1>🎯 {t('title')}</h1>
                            <p className="text-secondary">{t('dashboard_subtitle')}</p>
                        </div>
                        <HeaderControls toggleTheme={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />
                    </div>
                </header>

                {/* Stats Overview */}
                <StatsCards stats={stats} />

                {/* Main Dashboard Grid */}
                <div className="grid grid-2 mb-4">
                    {/* Left Column */}
                    <div className="dashboard-column">
                        <HealthCheck />
                        <ModelInfo />
                    </div>

                    {/* Right Column */}
                    <div className="dashboard-column">
                        <ScoreGauge />
                        <FeatureImportance />
                    </div>
                </div>

                {/* Prediction Section */}
                <div className="prediction-section mb-4">
                    <Prediction onPredictionUpdate={setStats} />
                </div>

                {/* Recent Activity */}
                <RecentPredictions />
            </div>
        );
    };

    return (
        <LanguageProvider>
            <Inner />
        </LanguageProvider>
    );
};

export default Dashboard;
