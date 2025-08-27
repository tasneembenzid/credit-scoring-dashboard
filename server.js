const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables (for DATABASE_URL)
require('dotenv').config();

// Postgres setup using connection string from environment
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/credit_dashboard';
const pool = new Pool({ connectionString });

// Ensure predictions table exists
const ensureTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        score INTEGER NOT NULL,
        risk_level VARCHAR(32),
        input_data JSONB,
        applicant_id VARCHAR(64),
        loan_amount NUMERIC,
        purpose VARCHAR(128)
    );
    `;
    await pool.query(createTableQuery);
};

// Call ensureTable on startup
ensureTable().catch(err => {
    console.error('Error ensuring predictions table exists:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running', timestamp: new Date().toISOString() });
});

// Root - helpful message (prevents "Cannot GET /" confusion)
app.get('/', (req, res) => {
    res.json({
        service: 'Credit Scoring API',
        endpoints: ['/health', '/predict', '/predictions', '/model/info', '/db/test']
    });
});

// DB connectivity test - runs a tiny query to confirm Postgres connection
app.get('/db/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 as ok');
        res.json({ ok: true, db: result.rows });
    } catch (err) {
        console.error('DB test failed:', err && err.message ? err.message : err);
        res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
});

// Model info endpoint
app.get('/model/info', (req, res) => {
    res.json({
        model_name: 'Credit Scoring Model',
        version: '1.0.0',
        algorithm: 'Random Forest',
        features: ['age', 'income', 'loan', 'credit_history', 'employment_status'],
        target: 'credit_score'
    });
});

// Prediction endpoint
app.post('/predict', (req, res) => {
    const {
        age,
        income,
        debt_to_income,
        credit_history_length,
        num_open_accounts,
        delinquencies,
        employment_status,
        loan_amount,
        purpose
    } = req.body;

    // Enhanced prediction logic with more realistic scoring
    let baseScore = 500;

    // Age factor (25-65 optimal range)
    if (age >= 25 && age <= 65) {
        baseScore += Math.min(50, (age - 25) * 1.2);
    } else if (age < 25) {
        baseScore -= (25 - age) * 2;
    } else {
        baseScore -= (age - 65) * 1.5;
    }

    // Income factor (higher income = better score)
    if (income) {
        baseScore += Math.min(150, income / 500);
    }

    // Debt to income ratio (lower is better)
    if (debt_to_income) {
        baseScore -= debt_to_income * 200;
    }

    // Credit history length (longer is better)
    if (credit_history_length) {
        baseScore += Math.min(80, credit_history_length * 15);
    }

    // Number of open accounts (moderate number is best)
    if (num_open_accounts) {
        if (num_open_accounts >= 3 && num_open_accounts <= 10) {
            baseScore += 30;
        } else if (num_open_accounts > 10) {
            baseScore -= (num_open_accounts - 10) * 5;
        } else {
            baseScore -= (3 - num_open_accounts) * 10;
        }
    }

    // Delinquencies (very negative impact)
    if (delinquencies) {
        baseScore -= delinquencies * 50;
    }

    // Employment status factor
    const employmentBonus = {
        'employed': 40,
        'self-employed': 20,
        'retired': 30,
        'student': 10,
        'unemployed': -50
    };
    if (employment_status && employmentBonus[employment_status] !== undefined) {
        baseScore += employmentBonus[employment_status];
    }

    // Loan amount vs income ratio
    if (loan_amount && income) {
        const loanToIncomeRatio = loan_amount / (income * 12);
        if (loanToIncomeRatio > 0.5) {
            baseScore -= (loanToIncomeRatio - 0.5) * 100;
        }
    }

    // Purpose factor
    const purposeBonus = {
        'home': 20,
        'education': 15,
        'auto': 10,
        'business': 5,
        'medical': 0,
        'other': -10
    };
    if (purpose && purposeBonus[purpose] !== undefined) {
        baseScore += purposeBonus[purpose];
    }

    // Ensure score is within valid range
    const score = Math.min(850, Math.max(300, Math.round(baseScore)));

    // Determine risk level
    let risk_level;
    if (score >= 750) risk_level = 'Low';
    else if (score >= 700) risk_level = 'Medium-Low';
    else if (score >= 650) risk_level = 'Medium';
    else if (score >= 600) risk_level = 'Medium-High';
    else risk_level = 'High';

    // Calculate confidence based on data completeness
    const totalFields = Object.keys(req.body).length;
    const confidence = Math.min(0.95, 0.6 + (totalFields * 0.05));

    res.json({
        prediction: score,
        risk_level: risk_level,
        confidence: Math.round(confidence * 100) / 100,
        input_data: req.body,
        factors: {
            age_impact: age ? Math.round((age >= 25 && age <= 65 ? Math.min(50, (age - 25) * 1.2) : (age < 25 ? -(25 - age) * 2 : -(age - 65) * 1.5))) : 0,
            income_impact: income ? Math.round(Math.min(150, income / 500)) : 0,
            debt_ratio_impact: debt_to_income ? Math.round(-debt_to_income * 200) : 0,
            credit_history_impact: credit_history_length ? Math.round(Math.min(80, credit_history_length * 15)) : 0,
            employment_impact: employment_status ? (employmentBonus[employment_status] || 0) : 0
        },
        recommendations: generateRecommendations(score, req.body)
    });
});

// Store prediction in Postgres when returned
app.post('/predict/store', async (req, res) => {
    const { prediction, risk_level, input_data, applicant_id, loan_amount, purpose } = req.body;
    try {
        const insertQuery = `
            INSERT INTO predictions (score, risk_level, input_data, applicant_id, loan_amount, purpose)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [prediction, risk_level, input_data || {}, applicant_id || null, loan_amount || null, purpose || null];
        const result = await pool.query(insertQuery, values);
        res.json({ success: true, row: result.rows[0] });
    } catch (err) {
        console.error('Error storing prediction:', err);
        res.status(500).json({ success: false, error: 'Failed to store prediction' });
    }
});

// Get recent predictions
app.get('/predictions', async (req, res) => {
    try {
        const q = 'SELECT id, timestamp, score, risk_level, input_data, applicant_id, loan_amount, purpose FROM predictions ORDER BY timestamp DESC LIMIT 20';
        const result = await pool.query(q);
        res.json({ predictions: result.rows });
    } catch (err) {
        console.error('Error fetching predictions:', err);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

// Helper function to generate recommendations
function generateRecommendations(score, data) {
    const recommendations = [];

    if (score < 650) {
        recommendations.push("Consider paying down existing debt to improve debt-to-income ratio");
        recommendations.push("Make all payments on time to build positive payment history");
    }

    if (data.debt_to_income > 0.4) {
        recommendations.push("Reduce debt-to-income ratio below 40% for better approval chances");
    }

    if (data.credit_history_length < 3) {
        recommendations.push("Build longer credit history by keeping old accounts open");
    }

    if (data.delinquencies > 0) {
        recommendations.push("Address any outstanding delinquencies immediately");
    }

    if (score >= 750) {
        recommendations.push("Excellent credit! You qualify for the best rates and terms");
    }

    return recommendations;
}

// Feature importance endpoint
app.get('/features/importance', (req, res) => {
    res.json({
        features: [
            { feature: 'income', importance: 0.35 },
            { feature: 'credit_history', importance: 0.25 },
            { feature: 'age', importance: 0.20 },
            { feature: 'employment_status', importance: 0.15 },
            { feature: 'loan', importance: 0.05 }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
