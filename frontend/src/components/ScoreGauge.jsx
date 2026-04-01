/**
 * ScoreGauge — Animated circular score gauge with gradient coloring
 */

export default function ScoreGauge({ score }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreClass = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
  const scoreColor = score >= 70 ? 'var(--green-400)' : score >= 40 ? 'var(--blue-400)' : 'var(--text-warning)';

  return (
    <div className="score-gauge">
      <svg viewBox="0 0 180 180">
        <defs>
          <linearGradient id="scoreGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--green-400)" />
            <stop offset="100%" stopColor="var(--green-500)" />
          </linearGradient>
          <linearGradient id="scoreGradientMid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--blue-400)" />
            <stop offset="100%" stopColor="var(--blue-500)" />
          </linearGradient>
          <linearGradient id="scoreGradientLow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <circle className="score-gauge-bg" cx="90" cy="90" r={radius} />
        <circle
          className={`score-gauge-fill ${scoreClass}`}
          cx="90"
          cy="90"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-value">
        <span className="score-number" style={{ color: scoreColor }}>{score}%</span>
        <span className="score-label">Match Score</span>
      </div>
    </div>
  );
}
