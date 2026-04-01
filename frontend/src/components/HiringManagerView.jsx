/**
 * HiringManagerView — Bulk resume upload with ranked shortlist
 * Upload multiple resumes against a single JD, get a ranked table
 */

import { useState, useRef } from 'react';
import ResultsDashboard from './ResultsDashboard';

const API_BASE = 'http://localhost:8000';

export default function HiringManagerView() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    );
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      setError('');
    } else {
      setError('Please drop PDF files only.');
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf'
    );
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
      setError('');
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canAnalyze = () => {
    return files.length > 0 && jobDescription.trim().length >= 20;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setCandidates([]);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('resumes', file));
      formData.append('job_description', jobDescription);

      const response = await fetch(`${API_BASE}/api/analyze-bulk`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
        setAnalyzed(true);
        if (data.error) {
          setError(`Some files had issues: ${data.error}`);
        }
      } else {
        setError(data.error || 'Bulk analysis failed. Please try again.');
      }
    } catch (err) {
      setError(`Connection error: ${err.message}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setJobDescription('');
    setCandidates([]);
    setError('');
    setAnalyzed(false);
    setSelectedCandidate(null);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'mid';
    return 'low';
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  // If a candidate is selected for detail view
  if (selectedCandidate) {
    return (
      <ResultsDashboard
        result={{
          match_score: selectedCandidate.match_score,
          summary: selectedCandidate.summary,
          strengths: selectedCandidate.strengths,
          gaps: selectedCandidate.gaps,
          keyword_analysis: selectedCandidate.keyword_analysis,
          rewrite_suggestions: selectedCandidate.rewrite_suggestions,
        }}
        filename={selectedCandidate.filename}
        onBack={() => setSelectedCandidate(null)}
      />
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Hiring Manager Mode
        </div>
        <h1>
          Rank <span className="gradient-text">Candidates</span> by
          <br />Job Fit Score
        </h1>
        <p>
          Upload multiple resumes and a job description. Our AI will analyze each
          candidate and rank them by match score, giving you a sorted shortlist.
        </p>
      </section>

      {/* Error */}
      {error && (
        <div className="error-banner" id="hm-error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Show results table if analyzed */}
      {analyzed && candidates.length > 0 ? (
        <div className="ranking-section">
          <div className="results-header">
            <div>
              <h2 className="results-title">Candidate Rankings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                {candidates.length} candidate{candidates.length > 1 ? 's' : ''} analyzed • Sorted by match score
              </p>
            </div>
            <button className="back-btn" onClick={handleReset} id="new-bulk-analysis">
              ← New Search
            </button>
          </div>

          <div className="ranking-table-wrapper glass-card" style={{ transform: 'none' }}>
            <table className="ranking-table" id="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Candidate</th>
                  <th style={{ width: '200px' }}>Match Score</th>
                  <th>Top Strengths</th>
                  <th>Key Gaps</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={i} onClick={() => setSelectedCandidate(c)}>
                    <td>
                      <span className={`rank-badge ${getRankClass(i + 1)}`}>{i + 1}</span>
                    </td>
                    <td>
                      <span className="candidate-name">{c.filename.replace('.pdf', '')}</span>
                    </td>
                    <td>
                      <div className="score-bar">
                        <div className="score-bar-track">
                          <div
                            className={`score-bar-fill ${getScoreClass(c.match_score)}`}
                            style={{ width: `${c.match_score}%` }}
                          />
                        </div>
                        <span className="score-bar-value" style={{
                          color: c.match_score >= 70 ? 'var(--green-400)' :
                                 c.match_score >= 40 ? 'var(--blue-400)' : 'var(--text-warning)'
                        }}>
                          {c.match_score}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="top-strengths">
                        {c.strengths.slice(0, 2).map((s, j) => (
                          <span key={j}>✅ {s.length > 50 ? s.slice(0, 50) + '...' : s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="top-gaps">
                        {c.gaps.slice(0, 2).map((g, j) => (
                          <span key={j}>⚠️ {g.length > 50 ? g.slice(0, 50) + '...' : g}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={(e) => { e.stopPropagation(); setSelectedCandidate(c); }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <div className="hm-upload-section">
            {/* Left: Multiple Resumes */}
            <div className="upload-panel glass-card">
              <div className="panel-header">
                <div className="panel-icon blue">📚</div>
                <div>
                  <h3 className="panel-title">Candidate Resumes</h3>
                  <p className="panel-subtitle">Upload multiple PDF resumes</p>
                </div>
              </div>

              <div
                className={`multi-file-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="bulk-drop-zone"
              >
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="bulk-file-input"
                />

                {files.length === 0 ? (
                  <>
                    <div className="drop-icon">📤</div>
                    <p className="drop-text">
                      Drag & drop resumes here, or <strong>click to browse</strong>
                    </p>
                    <p className="drop-hint">Upload multiple PDF files</p>
                  </>
                ) : (
                  <div className="file-list" onClick={(e) => e.stopPropagation()}>
                    <p style={{ color: 'var(--text-accent)', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      {files.length} resume{files.length > 1 ? 's' : ''} selected
                    </p>
                    {files.map((f, i) => (
                      <div key={i} className="file-list-item">
                        <span className="file-list-item-name">📎 {f.name}</span>
                        <button
                          className="file-remove"
                          onClick={() => removeFile(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: 'var(--font-xs)',
                        marginTop: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      + Add more resumes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Job Description */}
            <div className="upload-panel glass-card">
              <div className="panel-header">
                <div className="panel-icon green">💼</div>
                <div>
                  <h3 className="panel-title">Job Description</h3>
                  <p className="panel-subtitle">Paste the role requirements</p>
                </div>
              </div>

              <textarea
                className="jd-textarea"
                placeholder="Paste the complete job description here...&#10;&#10;Include required skills, qualifications, responsibilities, and any preferred qualifications."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                id="hm-jd-input"
                style={{ minHeight: '290px' }}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <div className="analyze-section">
            <button
              className="analyze-btn"
              disabled={!canAnalyze() || loading}
              onClick={handleAnalyze}
              id="bulk-analyze-button"
            >
              {loading ? 'Analyzing...' : `✨ Rank ${files.length} Candidate${files.length !== 1 ? 's' : ''}`}
              {!loading && <span className="btn-shimmer"></span>}
            </button>
            {!canAnalyze() && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)' }}>
                Upload at least one resume and paste a job description
              </p>
            )}
          </div>
        </>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing {files.length} resume{files.length > 1 ? 's' : ''}...</p>
          <p className="loading-subtext">This may take a moment for multiple resumes</p>
        </div>
      )}
    </>
  );
}
