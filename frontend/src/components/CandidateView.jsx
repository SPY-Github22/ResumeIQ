/**
 * CandidateView — Single resume upload + analysis for job seekers
 * Supports both PDF upload and text paste
 */

import { useState, useRef } from 'react';
import ResultsDashboard from './ResultsDashboard';

const API_BASE = 'http://localhost:8000';

export default function CandidateView() {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'paste'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a PDF file.');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else if (selected) {
      setError('Only PDF files are supported.');
    }
  };

  const canAnalyze = () => {
    const hasResume = inputMode === 'upload' ? file !== null : resumeText.trim().length >= 50;
    const hasJD = jobDescription.trim().length >= 20;
    return hasResume && hasJD;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;

      if (inputMode === 'upload') {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('job_description', jobDescription);

        response = await fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          body: formData,
        });
      } else {
        const formData = new FormData();
        formData.append('resume_text', resumeText);
        formData.append('job_description', jobDescription);

        response = await fetch(`${API_BASE}/api/analyze-text`, {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(`Connection error: ${err.message}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setResumeText('');
    setJobDescription('');
    setError('');
  };

  // Show results dashboard
  if (result) {
    return (
      <ResultsDashboard
        result={result}
        filename={file?.name}
        onBack={handleReset}
      />
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          AI-Powered Analysis
        </div>
        <h1>
          Match Your <span className="gradient-text">Resume</span> to
          <br />Any Job Description
        </h1>
        <p>
          Upload your resume and paste a job description to get an instant AI-powered
          match score with detailed strengths, gaps, and improvement suggestions.
        </p>
      </section>

      {/* Error */}
      {error && (
        <div className="error-banner" id="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        {/* Left: Resume */}
        <div className="upload-panel glass-card">
          <div className="panel-header">
            <div className="panel-icon blue">📄</div>
            <div>
              <h3 className="panel-title">Your Resume</h3>
              <p className="panel-subtitle">Upload a PDF or paste text</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="input-mode-toggle">
            <button
              className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
              id="mode-upload"
            >
              📁 Upload PDF
            </button>
            <button
              className={`mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
              onClick={() => setInputMode('paste')}
              id="mode-paste"
            >
              📋 Paste Text
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div
              className={`file-drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="resume-drop-zone"
            >
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="resume-file-input"
              />
              {file ? (
                <div className="file-info">
                  <span>📎</span>
                  <span className="file-info-name">{file.name}</span>
                  <button
                    className="file-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    id="remove-file"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="drop-icon">📤</div>
                  <p className="drop-text">
                    Drag & drop your resume here, or <strong>click to browse</strong>
                  </p>
                  <p className="drop-hint">Supports PDF files up to 10MB</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              className="jd-textarea"
              placeholder="Paste your full resume text here...&#10;&#10;Include your education, work experience, skills, projects, certifications, etc."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              id="resume-text-input"
              style={{ minHeight: '220px' }}
            />
          )}
        </div>

        {/* Right: Job Description */}
        <div className="upload-panel glass-card">
          <div className="panel-header">
            <div className="panel-icon green">💼</div>
            <div>
              <h3 className="panel-title">Job Description</h3>
              <p className="panel-subtitle">Paste the full job posting</p>
            </div>
          </div>

          <textarea
            className="jd-textarea"
            placeholder="Paste the complete job description here...&#10;&#10;Include required skills, qualifications, responsibilities, and any preferred qualifications."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            id="jd-text-input"
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
          id="analyze-button"
        >
          {loading ? 'Analyzing...' : '✨ Analyze Match'}
          {!loading && <span className="btn-shimmer"></span>}
        </button>
        {!canAnalyze() && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)' }}>
            {inputMode === 'upload'
              ? 'Upload a resume PDF and paste a job description to get started'
              : 'Paste at least 50 characters of resume text and a job description'}
          </p>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing your resume...</p>
          <p className="loading-subtext">Our AI is comparing your skills against the job requirements</p>
        </div>
      )}
    </>
  );
}
