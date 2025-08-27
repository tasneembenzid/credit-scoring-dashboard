import React from 'react';
import HealthCheck from './HealthCheck';
import ModelInfo from './ModelInfo';
import Prediction from './Prediction';
import FeatureImportance from './FeatureImportance';
import { useLanguage } from './LanguageProvider';

const Dashboard = () => {
    const { t } = useLanguage();
    return (
        <div className="container">
            <h1>📊 {t('title')}</h1>
            <p className="text-secondary">{t('dashboard_subtitle')}</p>
            <HealthCheck />
            <ModelInfo />
            <Prediction />
            <FeatureImportance />
        </div>
    );
};

export default Dashboard;
