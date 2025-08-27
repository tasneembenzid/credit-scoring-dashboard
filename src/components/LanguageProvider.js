import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  fr: {
  title: "Tableau de bord de scoring de crédit",
  dashboard_subtitle: "Plateforme avancée d'évaluation des risques de crédit par IA",
  system_health: "État du système",
  response_time: "Temps de réponse",
  uptime: "Disponibilité",
  last_check: "Dernière vérification",
  check_now: "🔄 Vérifier maintenant",
  checking: "Vérification...",
  api_online: "API en ligne",
  api_offline: "API hors ligne",
  view_raw_response: "Voir la réponse brute",
  never: "Jamais",
    system_online: "Système en ligne",
    recent_predictions: "Prédictions récentes",
    refresh: "🔄 Actualiser",
    applicant_id: "ID Demandeur",
    score: "Score",
    risk_level: "Niveau de risque",
    loan_amount: "Montant du prêt",
    purpose: "Objet",
    time: "Heure",
    actions: "Actions",
    no_predictions: "Aucune prédiction pour le moment",
    predict_heading: "Prédiction de score de crédit",
    reset: "🔄 Réinitialiser",
    predict_button: "🎯 Prédire le score de crédit",
    fields_label: "{filled}/{total} champs",
    confidence: "Confiance",
    recommendations: "Recommandations",
    score_factors: "Facteurs du score",
    age: "Âge",
    income: "Revenu mensuel ($)",
    debt_to_income: "Ratio dette/revenu",
    credit_history_length: "Historique de crédit (années)",
    num_open_accounts: "Comptes ouverts",
    delinquencies: "Retards de paiement",
    employment_status: "Statut d'emploi",
    loan_amount_field: "Montant du prêt demandé ($)",
    purpose_field: "Objet du prêt",
    select_label: "Sélectionner",
    select_placeholder: "— sélectionner —",
    total_predictions: "Prédictions totales",
    average_score: "Score moyen",
    high_risk: "Haut risque",
    low_risk: "Faible risque",
    approval_rate: "Taux d'approbation",
    interest_rate: "Taux d'intérêt",
    score_insights: "Aperçus du score",

    // UI labels
    model_information: "Informations sur le modèle",
    performance_metrics: "Métriques de performance",
    input_features: "Caractéristiques d'entrée",
    target_variable: "Variable cible",
    click_refresh_model_info: "Cliquez sur actualiser pour charger les informations du modèle",
    failed_to_load_model_info: "Impossible de charger les informations du modèle",
    feature_importance: "Importance des caractéristiques",
    key_insights: "Points clés",
    importance_scale: "Échelle d'importance",
    critical: "Critique",
    high: "Haut",
    medium: "Moyen",
    low: "Faible",
    view_details: "Voir les détails",
    export: "Exporter",
    predicting: "Prédiction en cours...",
    predicting_short: "Prédiction...",
    load: "Charger",
    valid: "Valide",
    invalid: "Invalide",
    features_label: "Caractéristiques",
    json_payload: "Charge utile JSON",

    // Employment options
    employment_employed: "Employé",
    employment_self_employed: "Travailleur indépendant",
    employment_unemployed: "Sans emploi",
    employment_student: "Étudiant",
    employment_retired: "Retraité",

    // Purposes
    purpose_home: "Aménagement de la maison",
    purpose_auto: "Auto",
    purpose_education: "Éducation",
    purpose_business: "Affaires",
    purpose_medical: "Médical",
    purpose_other: "Autre",

    // Risk levels / general
    risk_excellent: "Excellent",
    risk_good: "Bon",
    risk_fair: "Moyen",
    risk_poor: "Faible",
    risk_very_poor: "Très faible",
    high: "Haut",
    medium: "Moyen",
    low: "Faible"
  },

  ar: {
  title: "لوحة نتائج الائتمان",
  dashboard_subtitle: "منصة متقدمة لتقييم مخاطر الائتمان بواسطة الذكاء الاصطناعي",
  system_health: "حالة النظام",
  response_time: "زمن الاستجابة",
  uptime: "مدة التشغيل",
  last_check: "آخر فحص",
  check_now: "🔄 تحقق الآن",
  checking: "جارٍ التحقق...",
  api_online: "API متاح",
  api_offline: "API غير متاح",
  view_raw_response: "عرض الاستجابة الخام",
  never: "أبداً",
    system_online: "النظام متصل",
    recent_predictions: "التنبؤات الأخيرة",
    refresh: "🔄 تحديث",
    applicant_id: "معرّف المتقدم",
    score: "الدرجة",
    risk_level: "مستوى المخاطرة",
    loan_amount: "مبلغ القرض",
    purpose: "الغرض",
    time: "الوقت",
    actions: "إجراءات",
    no_predictions: "لا توجد تنبؤات بعد",
    predict_heading: "تنبؤ درجة الائتمان",
    reset: "🔄 إعادة ضبط",
    predict_button: "🎯 تنبؤ درجة الائتمان",
    fields_label: "{filled}/{total} حقول",
    confidence: "ثقة",
    recommendations: "توصيات",
    score_factors: "عوامل النتيجة",
    age: "العمر",
    income: "الدخل الشهري ($)",
    debt_to_income: "نسبة الدين إلى الدخل",
    credit_history_length: "طول التاريخ الائتماني (سنوات)",
    num_open_accounts: "حسابات مفتوحة",
    delinquencies: "التأخيرات",
    employment_status: "حالة التوظيف",
    loan_amount_field: "مبلغ القرض المطلوب ($)",
    purpose_field: "غرض القرض",
    select_label: "اختر",
    select_placeholder: "— اختر —",
    total_predictions: "التنبؤات الإجمالية",
    average_score: "المعدل",
    high_risk: "خطر عالي",
    low_risk: "خطر منخفض",
    approval_rate: "معدل الموافقة",
    interest_rate: "معدل الفائدة",
    score_insights: "ملخصات النتيجة",

    // UI labels
    model_information: "معلومات النموذج",
    performance_metrics: "مؤشرات الأداء",
    input_features: "ميزات الإدخال",
    target_variable: "المتغير المستهدف",
    click_refresh_model_info: "انقر على تحديث لتحميل معلومات النموذج",
    failed_to_load_model_info: "فشل في تحميل معلومات النموذج",
    feature_importance: "أهمية الميزات",
    key_insights: "نقاط رئيسية",
    importance_scale: "مقياس الأهمية",
    critical: "حرج",
    high: "مرتفع",
    medium: "متوسط",
    low: "منخفض",
    view_details: "عرض التفاصيل",
    export: "تصدير",
    predicting: "جاري التنبؤ...",
    predicting_short: "تنبؤ...",
    load: "تحميل",
    valid: "صالح",
    invalid: "غير صالح",
    features_label: "ميزات",
    json_payload: "حمولة JSON",

    // Employment options
    employment_employed: "موظف",
    employment_self_employed: "عامل مستقل",
    employment_unemployed: "عاطل عن العمل",
    employment_student: "طالب",
    employment_retired: "متقاعد",

    // Purposes
    purpose_home: "تأثيث المنزل",
    purpose_auto: "سيارة",
    purpose_education: "تعليم",
    purpose_business: "أعمال",
    purpose_medical: "طبي",
    purpose_other: "آخر",

    // Risk levels
    risk_excellent: "ممتاز",
    risk_good: "جيد",
    risk_fair: "عادل",
    risk_poor: "ضعيف",
    risk_very_poor: "ضعيف جداً"
  }
};

export const LanguageProvider = ({ children, defaultLang = 'fr' }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('dashboard_lang') || defaultLang;
    } catch (e) {
      return defaultLang;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.body.classList.toggle('rtl', lang === 'ar');
    } catch (e) {
      // ignore (SSR or test env)
    }
  }, [lang]);

  const setLang = (newLang) => {
    setLangState(newLang);
    try { localStorage.setItem('dashboard_lang', newLang); } catch (e) { }
  };

  const t = (key, vars) => {
    const str = (translations[lang] && translations[lang][key]) || (translations['fr'] && translations['fr'][key]) || key;
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (_, v) => (vars[v] !== undefined ? String(vars[v]) : `{${v}}`));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageProvider;
