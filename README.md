# ResumeIQ — AI-Powered Resume Matcher

An AI-powered web application that helps job seekers understand how well their resume matches a given job description, and helps hiring managers rank candidates by job fit.

## Problem Statement
Job seekers often apply to dozens of jobs without knowing how well their resume actually matches the job description. ResumeIQ solves this by using AI to instantly score the match, highlight strengths, identify gaps, and suggest improvements — giving candidates actionable feedback before they apply.

## Video link (Drive) - https://drive.google.com/drive/folders/1Y87stjtdxB8mDMKPSpzZ2JuG3gX8nCmq?usp=sharing

## Screenshots

![Screenshot 1](Screenshot%202026-04-02%20002122.png)
![Screenshot 2](Screenshot%202026-04-02%20002159.png)
![Screenshot 3](Screenshot%202026-04-02%20002214.png)
![Screenshot 4](Screenshot%202026-04-02%20002240.png)

## Features

- **Match Score (0–100%)** — Instant AI-powered compatibility score
- **Strengths Analysis** — What's strong in your resume for the role
- **Gap Identification** — What's missing or needs improvement
- **Keyword Gap Analysis** — Per-skill match breakdown
- **Rewrite Suggestions** — AI-suggested improvements for resume bullets
- **Bulk Resume Ranking** — Upload multiple resumes, get a ranked shortlist (Hiring Manager mode)

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | FastAPI (Python) | Fast async API, auto-generated docs, great for AI workloads |
| AI/NLP | Groq API (Llama 3.3 70B) | Free tier, fast inference, excellent structured output |
| PDF Parsing | PyMuPDF (fitz) | Fast, reliable text extraction from resume PDFs |
| Frontend | React + Vite | Modern build tooling, fast HMR, rich component model |

## Architecture

```
User Browser ──► React Frontend (Vite) ──► FastAPI Backend
                                              ├── PyMuPDF (PDF parsing)
                                              └── Groq API (AI analysis)
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** | API docs at **http://localhost:8000/docs**

## Screenshots

### Job Seeker View
Upload a resume and paste a job description to get instant analysis.

### Hiring Manager View
Upload multiple resumes against one JD to get a ranked candidate shortlist.

## Example User Flow

1. User visits the web app
2. Uploads their resume (PDF) and pastes a job description
3. App returns:
   - **Match Score:** 78%
   - **Strengths:** Strong Python skills, 2 relevant projects, mentions NLP experience
   - **Gaps:** Missing cloud platforms, no leadership examples, no system design experience
   - **Keyword Analysis:** Per-skill breakdown with found/missing indicators
   - **Rewrite Suggestions:** Concrete improvements for resume bullets

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Single resume PDF + JD analysis |
| POST | `/api/analyze-text` | Pasted resume text + JD analysis |
| POST | `/api/analyze-bulk` | Multiple resumes + JD (ranked shortlist) |
| GET | `/api/health` | Health check |

## Project Structure

```
├── backend/
│   ├── main.py                # FastAPI app + endpoints
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── schemas.py         # Pydantic request/response models
│   └── services/
│       ├── pdf_parser.py      # PyMuPDF text extraction
│       └── ai_analyzer.py     # Groq/Llama analysis
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── index.css          # Design system
│   │   ├── App.css            # Component styles
│   │   ├── App.jsx            # Main app + view switcher
│   │   └── components/
│   │       ├── CandidateView.jsx
│   │       ├── HiringManagerView.jsx
│   │       ├── ResultsDashboard.jsx
│   │       └── ScoreGauge.jsx
│   └── package.json
└── .gitignore
```

## License

MIT
