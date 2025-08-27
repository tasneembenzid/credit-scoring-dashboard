import React, { useState, useMemo, useEffect, useCallback } from 'react';

/* ================= THEME & FEATURE CONFIG ================= */
const FEATURE_DEFS = [
  { key: 'age', label: 'Age', type: 'number', placeholder: '42', min: 0 },
  { key: 'income', label: 'Monthly Income', type: 'number', placeholder: '6500' },
  { key: 'debt_to_income', label: 'Debt / Income Ratio', type: 'number', step: '0.01', placeholder: '0.35' },
  { key: 'credit_history_length', label: 'Credit History (yrs)', type: 'number', placeholder: '5' },
  { key: 'num_open_accounts', label: 'Open Accounts', type: 'number', placeholder: '7' },
  { key: 'delinquencies', label: 'Delinquencies', type: 'number', placeholder: '0' },
  { key: 'employment_status', label: 'Employment Status', type: 'select', options: ['employed', 'self-employed', 'unemployed', 'student', 'retired'] },
  { key: 'loan_amount', label: 'Loan Amount', type: 'number', placeholder: '15000' },
  { key: 'purpose', label: 'Loan Purpose', type: 'select', options: ['home', 'auto', 'education', 'business', 'medical', 'other'] }
];

const buildInitial = () => FEATURE_DEFS.reduce((a, f) => ({ ...a, [f.key]: '' }), {});

const LS_HISTORY_KEY = 'prediction_history_v1';
const MAX_HISTORY = 12;

/* ================= UTILITIES ================= */
const coerceNumbers = (obj) => {
  const out = { ...obj };
  FEATURE_DEFS.forEach(def => {
    if (def.type === 'number' && out[def.key] !== '') {
      const n = Number(out[def.key]);
      if (!Number.isNaN(n)) out[def.key] = n;
    }
  });
  return out;
};

const getCompleteness = (form) => {
  const total = FEATURE_DEFS.length;
  const filled = FEATURE_DEFS.filter(f => form[f.key] !== '').length;
  return { filled, total, pct: total === 0 ? 0 : Math.round((filled / total) * 100) };
};

/* ================= MAIN COMPONENT ================= */
export default function Prediction() {
  const [theme, setTheme] = useState('dark'); // dark | light
  const [tab, setTab] = useState('form'); // form | json | history
  const [form, setForm] = useState(buildInitial);
  const [manualJson, setManualJson] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) setHistory(saved);
    } catch (_) {}
  }, []);

  const saveHistory = useCallback((entry) => {
    const next = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(next);
    try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(next)); } catch (_) {}
  }, [history]);

  const derivedJson = useMemo(() => coerceNumbers(form), [form]);

  const effectivePayload = useMemo(() => {
    if (useManual && manualJson.trim()) {
      try { return JSON.parse(manualJson); } catch { return null; }
    }
    return derivedJson;
  }, [useManual, manualJson, derivedJson]);

  const jsonValid = effectivePayload !== null;
  const completeness = getCompleteness(form);

  const handleChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (useManual) {
      setUseManual(false);
      setManualJson('');
    }
  };

  const resetForm = () => {
    setForm(buildInitial());
    setResult(null);
    setRaw(null);
    setError('');
  };

  const handlePredict = async () => {
    setError('');
    setResult(null);
    setRaw(null);
    if (!jsonValid) {
      setError('Cannot predict: JSON invalid.');
      return;
    }
    setBusy(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(effectivePayload)
      });
      const data = await res.json().catch(() => null);
      setRaw(data);
      if (!res.ok) throw new Error(data?.message || 'Request failed');
      const predictionValue = data?.prediction ?? data;
      setResult(predictionValue);
      saveHistory({
        id: Date.now(),
        time: new Date().toISOString(),
        ms: Math.round(performance.now() - start),
        input: effectivePayload,
        output: predictionValue
      });
      setTab('history');
    } catch (e) {
      setError(e.message || 'Prediction failed');
    } finally {
      setBusy(false);
    }
  };

  const themeVars = themes[theme];

  return (
    <div style={{ ...styles.app, ...themeVars.app }}>
      <BackgroundDecor theme={theme} />
      <div style={styles.shell}>
        <Header
          theme={theme}
          setTheme={setTheme}
          completeness={completeness}
          busy={busy}
        />

        <NavTabs current={tab} onChange={setTab} counts={{ history: history.length }} />

        <main style={styles.main}>
          {tab === 'form' && (
            <FormPanel
              form={form}
              onChange={handleChange}
              resetForm={resetForm}
              completeness={completeness}
              themeVars={themeVars}
            />
          )}
          {tab === 'json' && (
            <JsonPanel
              useManual={useManual}
              setUseManual={setUseManual}
              manualJson={manualJson}
              setManualJson={setManualJson}
              derived={derivedJson}
              jsonValid={jsonValid}
              themeVars={themeVars}
            />
          )}
          {tab === 'history' && (
            <HistoryPanel
              history={history}
              setFormFromHistory={(item) => {
                setForm(Object.fromEntries(
                  FEATURE_DEFS.map(def => [def.key, item.input[def.key] ?? ''])
                ));
                setTab('form');
              }}
              clearHistory={() => {
                setHistory([]);
                try { localStorage.removeItem(LS_HISTORY_KEY); } catch (_) {}
              }}
              themeVars={themeVars}
            />
          )}
        </main>

        <ResultPanel
          result={result}
          raw={raw}
          error={error}
          busy={busy}
          onPredict={handlePredict}
          disabledPredict={!jsonValid || busy || completeness.filled === 0}
          jsonValid={jsonValid}
          themeVars={themeVars}
        />

        <Footer />
      </div>
    </div>
  );
}

/* ================= SUBCOMPONENTS ================= */

const Header = ({ theme, setTheme, completeness, busy }) => {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.brand}>
          <span style={styles.brandAccent}>Credit</span> Insight
        </h1>
        <p style={styles.tagline}>Interactive scoring playground</p>
      </div>
      <div style={styles.headerRight}>
        <CompletenessMeter completeness={completeness} busy={busy} />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
};

const NavTabs = ({ current, onChange, counts }) => {
  const tabs = [
    { key: 'form', label: 'Features' },
    { key: 'json', label: 'JSON' },
    { key: 'history', label: `History${counts.history ? ` (${counts.history})` : ''}` }
  ];
  return (
    <nav style={styles.tabsBar} aria-label="Panels">
      {tabs.map(t => (
        <button
          key={t.key}
            onClick={() => onChange(t.key)}
          style={{
            ...styles.tabBtn,
            ...(current === t.key ? styles.tabBtnActive : {})
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
};

const CompletenessMeter = ({ completeness, busy }) => {
  const { filled, total, pct } = completeness;
  return (
    <div style={styles.meterWrapper} title="Field completeness">
      <div style={styles.meterBarOuter}>
        <div style={{
          ...styles.meterBarInner,
          width: `${pct}%`,
          background: busy
            ? 'linear-gradient(90deg,#ffb347,#ffcc33,#ffb347)'
            : 'linear-gradient(90deg,#34d399,#10b981)'
        }} />
      </div>
      <div style={styles.meterLabel}>{filled}/{total}</div>
    </div>
  );
};

const FormPanel = ({ form, onChange, resetForm, completeness, themeVars }) => {
  return (
    <section style={styles.panelCard}>
      <div style={styles.panelHead}>
        <h2 style={styles.panelTitle}>Feature Inputs</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.secondaryBtn} onClick={resetForm}>Reset</button>
        </div>
      </div>
      <div style={styles.responsiveTableWrap}>
        <table style={{ ...styles.table }}>
          <thead>
            <tr>
              <th style={styles.th}>Feature</th>
              <th style={styles.th}>Value</th>
              <th style={styles.thMini}>Type</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_DEFS.map(def => (
              <tr key={def.key} style={styles.row}>
                <td style={styles.tdLabel}>
                  <label htmlFor={def.key} style={styles.label}>{def.label}</label>
                </td>
                <td style={styles.tdInput}>
                  {def.type === 'select' ? (
                    <select
                      id={def.key}
                      value={form[def.key]}
                      onChange={(e) => onChange(def.key, e.target.value)}
                      style={styles.input}
                    >
                      <option value="">— select —</option>
                      {def.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={def.key}
                      type="number"
                      inputMode="decimal"
                      step={def.step}
                      min={def.min}
                      placeholder={def.placeholder}
                      value={form[def.key]}
                      onChange={(e) => onChange(def.key, e.target.value)}
                      style={styles.input}
                    />
                  )}
                </td>
                <td style={styles.tdType}>{def.type === 'number' ? 'Numeric' : 'Categorical'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={styles.helperNote}>
        {completeness.pct < 100
          ? `Fill remaining ${completeness.total - completeness.filled} field(s) for a complete profile (optional).`
          : 'All fields filled. Ready to predict.'}
      </p>
    </section>
  );
};

const JsonPanel = ({ useManual, setUseManual, manualJson, setManualJson, derived, jsonValid }) => {
  return (
    <section style={styles.panelCard}>
      <div style={styles.panelHead}>
        <h2 style={styles.panelTitle}>JSON Payload</h2>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useManual}
            onChange={(e) => setUseManual(e.target.checked)}
          /> Edit manually
        </label>
      </div>
      <textarea
        style={styles.jsonArea}
        disabled={!useManual}
        value={useManual ? manualJson : JSON.stringify(derived, null, 2)}
        onChange={(e) => setManualJson(e.target.value)}
      />
      <div style={styles.jsonFooterRow}>
        <span style={{
          ...styles.badge,
          background: jsonValid ? 'linear-gradient(90deg,#16a34a,#22c55e)' : '#dc2626'
        }}>
          {jsonValid ? 'Valid' : 'Invalid'}
        </span>
        {!useManual && <span style={styles.muted}>Derived from form</span>}
      </div>
      <p style={styles.helperNote}>Switch to manual mode to paste or tweak arbitrary JSON.</p>
    </section>
  );
};

const HistoryPanel = ({ history, setFormFromHistory, clearHistory }) => {
  return (
    <section style={styles.panelCard}>
      <div style={styles.panelHead}>
        <h2 style={styles.panelTitle}>Prediction History</h2>
        {history.length > 0 &&
          <button style={styles.secondaryBtn} onClick={clearHistory}>Clear</button>}
      </div>
      {history.length === 0 && <p style={styles.muted}>No predictions yet.</p>}
      <ul style={styles.historyList}>
        {history.map(item => (
          <li key={item.id} style={styles.historyItem}>
            <div style={styles.historyMeta}>
              <strong>{new Date(item.time).toLocaleTimeString()}</strong>
              <span style={styles.historyMs}>{item.ms} ms</span>
            </div>
            <div style={styles.historyPayload}>
              <code style={styles.inlineCode}>
                {JSON.stringify(item.output).slice(0, 80)}
                {JSON.stringify(item.output).length > 80 ? '…' : ''}
              </code>
            </div>
            <div style={styles.historyActions}>
              <button
                style={styles.microBtn}
                onClick={() => setFormFromHistory(item)}
                title="Load input back into form"
              >Load</button>
              <details>
                <summary style={styles.microSummary}>View</summary>
                <pre style={styles.historyPre}>{JSON.stringify(item, null, 2)}</pre>
              </details>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const ResultPanel = ({ result, raw, error, busy, onPredict, disabledPredict, jsonValid, themeVars }) => {
  return (
    <section style={styles.resultDock}>
      <div style={styles.resultInner}>
        <button
          onClick={onPredict}
          disabled={disabledPredict}
          style={{
            ...styles.primaryBtn,
            opacity: disabledPredict ? 0.6 : 1
          }}
        >
          {busy ? 'Predicting…' : 'Predict'}
        </button>
        <div style={styles.statusRow}>
          {!jsonValid && <span style={styles.statusError}>Invalid JSON</span>}
          {error && <span style={styles.statusError}>{error}</span>}
          {result !== null && !error && (
            <span style={styles.statusOk}>Success</span>
          )}
        </div>
        {result !== null && (
          <div style={styles.resultCard}>
            <h3 style={styles.resultTitle}>Prediction</h3>
            <div style={styles.predValue}>
              {typeof result === 'object' ? JSON.stringify(result) : String(result)}
            </div>
            {raw && (
              <details style={styles.detailsBlock}>
                <summary style={styles.detailsSummary}>Raw Response</summary>
                <pre style={styles.rawPre}>{JSON.stringify(raw, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={styles.footer}>
    © {new Date().getFullYear()} Credit Insight — crafted UI
  </footer>
);

/* Background decorative SVG / shapes */
const BackgroundDecor = ({ theme }) => {
  return (
    <div style={styles.bgLayer} aria-hidden="true">
      <div style={{
        ...styles.blob,
        background: theme === 'dark'
          ? 'radial-gradient(circle at 30% 30%, #6366f1 0%, rgba(99,102,241,0) 70%)'
          : 'radial-gradient(circle at 30% 30%, #6366f1 0%, rgba(99,102,241,0) 70%)'
      }} />
      <div style={{
        ...styles.blob,
        top: '55%',
        left: '70%',
        background: theme === 'dark'
          ? 'radial-gradient(circle at 30% 30%, #ec4899 0%, rgba(236,72,153,0) 70%)'
          : 'radial-gradient(circle at 30% 30%, #f472b6 0%, rgba(244,114,182,0) 70%)'
      }} />
      <div style={styles.gridOverlay}/>
    </div>
  );
};

/* ================= THEMES ================= */
const themes = {
  dark: {
    app: {
      background: 'linear-gradient(135deg,#0d0f1a 0%,#131b35 35%,#1e2a47 70%,#182437 100%)',
      color: '#f1f5f9'
    }
  },
  light: {
    app: {
      background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 35%,#e0f2fe 70%,#f1f5f9 100%)',
      color: '#0f172a'
    }
  }
};

/* ================= STYLES ================= */
const focusRing = {
  outline: '2px solid #6366f1',
  outlineOffset: 2
};

const styles = {
  app: {
    minHeight: '100vh',
    position: 'relative',
    fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif',
    overflowX: 'hidden',
    padding: '28px clamp(14px,3vw,40px)',
    transition: 'background .6s ease'
  },
  shell: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1500,
    margin: '0 auto',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr auto auto',
    minHeight: 'calc(100vh - 56px)',
    gap: 18
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 28,
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  brand: {
    margin: 0,
    fontSize: 'clamp(1.9rem,3.4vw,3rem)',
    background: 'linear-gradient(90deg,#6366f1,#ec4899,#8b5cf6)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '.5px',
    fontWeight: 700
  },
  brandAccent: { },
  tagline: {
    margin: '6px 0 0',
    fontSize: '.9rem',
    letterSpacing: '.5px',
    opacity: .8
  },
  headerRight: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 20,
    flexWrap: 'wrap'
  },
  themeToggle: {
    background: 'linear-gradient(90deg,#475569,#334155)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '10px 18px',
    fontSize: '.75rem',
    borderRadius: 40,
    cursor: 'pointer',
    letterSpacing: '.5px',
    fontWeight: 600
  },
  tabsBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  },
  tabBtn: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 18px',
    fontSize: '.7rem',
    fontWeight: 600,
    letterSpacing: '.5px',
    textTransform: 'uppercase',
    borderRadius: 14,
    cursor: 'pointer',
    color: '#fff',
    transition: 'background .2s'
  },
  tabBtnActive: {
    background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
    boxShadow: '0 4px 14px -4px rgba(99,102,241,0.55)'
  },
  main: {
    display: 'grid',
    gap: 28,
    gridTemplateColumns: 'repeat(auto-fit,minmax(430px,1fr))',
    alignContent: 'start'
  },
  panelCard: {
    position: 'relative',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    borderRadius: 26,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxShadow: '0 8px 28px -8px rgba(0,0,0,0.55)'
  },
  panelHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center'
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.05rem',
    letterSpacing: '.5px',
    fontWeight: 600
  },
  responsiveTableWrap: {
    overflowX: 'auto',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.12)'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '.75rem'
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    background: 'linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))',
    fontWeight: 600,
    letterSpacing: '.5px',
    fontSize: '.6rem',
    textTransform: 'uppercase'
  },
  thMini: {
    textAlign: 'left',
    padding: '10px 14px',
    background: 'linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))',
    fontWeight: 600,
    fontSize: '.55rem',
    textTransform: 'uppercase',
    width: 90,
    letterSpacing: '.5px'
  },
  row: { borderTop: '1px solid rgba(255,255,255,0.08)' },
  tdLabel: { padding: '10px 14px', fontWeight: 500, width: 200 },
  tdInput: { padding: '10px 14px' },
  tdType: {
    padding: '10px 14px',
    fontSize: '.55rem',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
    opacity: .7
  },
  label: { display: 'inline-block' },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.25)',
    fontSize: '.75rem',
    outline: 'none',
    transition: 'border .2s, background .2s'
  },
  helperNote: {
    margin: 0,
    fontSize: '.65rem',
    letterSpacing: '.5px',
    opacity: .75
  },
  checkboxLabel: {
    fontSize: '.6rem',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
  },
  jsonArea: {
    width: '100%',
    minHeight: 260,
    fontFamily: 'ui-monospace,Consolas,monaco,monospace',
    fontSize: '.7rem',
    lineHeight: 1.4,
    padding: '14px 16px',
    borderRadius: 22,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.35)',
    color: '#f8fafc',
    resize: 'vertical',
    outline: 'none'
  },
  jsonFooterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    padding: '5px 12px 6px',
    borderRadius: 999,
    fontSize: '.55rem',
    letterSpacing: '.5px',
    fontWeight: 600,
    color: '#fff',
    textTransform: 'uppercase'
  },
  muted: { fontSize: '.55rem', letterSpacing: '.5px', opacity: .6 },
  resultDock: {
    position: 'sticky',
    bottom: 0,
    zIndex: 3,
    marginTop: 8
  },
  resultInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: 'linear-gradient(90deg,rgba(99,102,241,0.22),rgba(139,92,246,0.22))',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '18px 22px',
    borderRadius: 26,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 6px 22px -6px rgba(0,0,0,0.55)'
  },
  primaryBtn: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6 50%,#ec4899)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '14px 28px',
    fontSize: '.8rem',
    fontWeight: 700,
    letterSpacing: '.5px',
    borderRadius: 18,
    cursor: 'pointer'
  },
  secondaryBtn: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 18px',
    fontSize: '.6rem',
    fontWeight: 600,
    letterSpacing: '.5px',
    borderRadius: 16,
    cursor: 'pointer',
    textTransform: 'uppercase',
    color: '#fff'
  },
  statusRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    fontSize: '.6rem',
    letterSpacing: '.5px'
  },
  statusError: {
    background: '#dc2626',
    padding: '4px 10px',
    borderRadius: 999,
    fontWeight: 600
  },
  statusOk: {
    background: '#16a34a',
    padding: '4px 10px',
    borderRadius: 999,
    fontWeight: 600
  },
  resultCard: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 22,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  resultTitle: {
    margin: 0,
    fontSize: '.8rem',
    letterSpacing: '.5px',
    textTransform: 'uppercase',
    opacity: .85
  },
  predValue: {
    fontSize: '1.2rem',
    fontWeight: 600,
    letterSpacing: '.5px'
  },
  rawPre: {
    margin: 0,
    maxHeight: 250,
    overflow: 'auto',
    background: 'rgba(0,0,0,0.45)',
    padding: '12px 14px',
    fontSize: '.65rem',
    borderRadius: 16
  },
  detailsBlock: {
    fontSize: '.7rem'
  },
  detailsSummary: {
    cursor: 'pointer',
    fontWeight: 600,
    letterSpacing: '.5px'
  },
  meterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  meterBarOuter: {
    width: 120,
    height: 8,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    position: 'relative'
  },
  meterBarInner: {
    height: '100%',
    borderRadius: 8,
    transition: 'width .35s cubic-bezier(.4,.6,.2,1)'
  },
  meterLabel: { fontSize: '.6rem', letterSpacing: '.5px', opacity: .75 },
  historyList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  historyItem: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 18,
    padding: '12px 14px',
    display: 'grid',
    gap: 8,
    gridTemplateColumns: '120px 1fr auto',
    alignItems: 'flex-start'
  },
  historyMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '.65rem',
    letterSpacing: '.5px'
  },
  historyMs: {
    background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
    padding: '4px 8px',
    borderRadius: 999,
    fontWeight: 600
  },
  historyPayload: {
    fontSize: '.65rem',
    lineHeight: 1.4,
    wordBreak: 'break-word'
  },
  inlineCode: {
    background: 'rgba(0,0,0,0.35)',
    padding: '4px 6px',
    borderRadius: 6
  },
  historyActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end'
  },
  microBtn: {
    background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '6px 12px',
    fontSize: '.55rem',
    letterSpacing: '.5px',
    fontWeight: 600,
    borderRadius: 14,
    cursor: 'pointer'
  },
  microSummary: {
    fontSize: '.55rem',
    cursor: 'pointer',
    letterSpacing: '.5px',
    fontWeight: 600
  },
  historyPre: {
    margin: '6px 0 0',
    maxHeight: 240,
    overflow: 'auto',
    background: 'rgba(0,0,0,0.45)',
    padding: '8px 10px',
    fontSize: '.6rem',
    borderRadius: 12
  },
  resultBox: {},
  footer: {
    marginTop: 40,
    fontSize: '.6rem',
    letterSpacing: '.5px',
    opacity: .6,
    textAlign: 'center'
  },
  bgLayer: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  blob: {
    position: 'absolute',
    width: 700,
    height: 700,
    filter: 'blur(90px)',
    opacity: .55,
    transform: 'translate(-50%,-50%)'
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',
    backgroundSize: '80px 80px',
    maskImage: 'radial-gradient(circle at 60% 40%,rgba(0,0,0,.8),transparent 75%)',
    opacity: .35
  }
};
