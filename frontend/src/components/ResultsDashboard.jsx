/**
 * ResultsDashboard — Full analysis results display
 * Shows score gauge, strengths, gaps, keyword analysis, and rewrite suggestions
 */

import ScoreGauge from './ScoreGauge';

export default function ResultsDashboard({ result, filename, onBack }) {
  if (!result) return null;

  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <div>
          <h2 className="results-title">Analysis Results</h2>
          {filename && (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
              📄 {filename}
            </p>
          )}
        </div>
        <button className="back-btn" onClick={onBack} id="back-to-upload">
          ← New Analysis
        </button>
      </div>

      {/* Score + Summary */}
      <div className="score-section">
        <div className="score-card glass-card">
          <ScoreGauge score={result.match_score} />
        </div>
        <div className="summary-card glass-card">
          <h3>📊 Summary</h3>
          <p className="summary-text">{result.summary}</p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="analysis-grid">
        <div className="analysis-panel glass-card">
          <h3>
            <span className="icon">✅</span>
            Strengths ({result.strengths.length})
          </h3>
          <ul className="analysis-list">
            {result.strengths.map((s, i) => (
              <li key={i} className="analysis-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="bullet strength-bullet">●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="analysis-panel glass-card">
          <h3>
            <span className="icon">⚠️</span>
            Gaps ({result.gaps.length})
          </h3>
          <ul className="analysis-list">
            {result.gaps.map((g, i) => (
              <li key={i} className="analysis-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="bullet gap-bullet">●</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keyword Analysis */}
      {result.keyword_analysis && result.keyword_analysis.length > 0 && (
        <div className="keywords-panel glass-card">
          <h3>
            <span className="icon">🔑</span>
            Keyword Analysis
          </h3>
          <div className="keywords-grid">
            {result.keyword_analysis.map((kw, i) => (
              <div
                key={i}
                className={`keyword-chip ${kw.found ? 'found' : 'missing'}`}
              >
                <span className="chip-icon">{kw.found ? '✓' : '✗'}</span>
                {kw.keyword}
                {kw.context && (
                  <span className="keyword-tooltip">{kw.context}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewrite Suggestions */}
      {result.rewrite_suggestions && result.rewrite_suggestions.length > 0 && (
        <div className="rewrite-panel glass-card">
          <h3>
            <span className="icon">✏️</span>
            Rewrite Suggestions
          </h3>
          {result.rewrite_suggestions.map((rs, i) => (
            <div key={i} className="rewrite-card">
              <p className="rewrite-label original">Original</p>
              <p className="rewrite-text">{rs.original}</p>
              <p className="rewrite-label improved">Suggested Improvement</p>
              <p className="rewrite-text improved">{rs.suggestion}</p>
              <p className="rewrite-label reason-label">Why</p>
              <p className="rewrite-reason">{rs.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
