/**
 * ResumeIQ — Main App Component
 * Switches between Candidate and Hiring Manager views
 */

import { useState } from 'react';
import CandidateView from './components/CandidateView';
import HiringManagerView from './components/HiringManagerView';
import './App.css';

function App() {
  const [view, setView] = useState('candidate'); // 'candidate' or 'hiring'

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => window.location.reload()}>
            <div className="logo-icon">R</div>
            <div className="logo-text">
              Resume<span>IQ</span>
            </div>
          </div>

          <div className="view-switcher" id="view-switcher">
            <button
              className={`view-tab ${view === 'candidate' ? 'active' : ''}`}
              onClick={() => setView('candidate')}
              id="tab-candidate"
            >
              👤 Job Seeker
            </button>
            <button
              className={`view-tab ${view === 'hiring' ? 'active' : ''}`}
              onClick={() => setView('hiring')}
              id="tab-hiring"
            >
              🏢 Hiring Manager
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {view === 'candidate' ? <CandidateView /> : <HiringManagerView />}
      </main>
    </div>
  );
}

export default App;
