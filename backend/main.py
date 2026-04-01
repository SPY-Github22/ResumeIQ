from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import (
    SingleAnalysisResponse,
    AnalysisResult,
    BulkAnalysisResponse,
    BulkCandidateResult,
    KeywordAnalysis,
    RewriteSuggestion,
)
from services.pdf_parser import extract_text_from_pdf, PDFParseError
from services.ai_analyzer import analyze_resume

app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered resume matching and analysis",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ResumeIQ API"}


@app.post("/api/analyze", response_model=SingleAnalysisResponse)
async def analyze_single(
    resume: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(..., description="Job description text"),
):
    # Validate file type
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Read and parse PDF
    try:
        file_bytes = await resume.read()
        resume_text = extract_text_from_pdf(file_bytes)
    except PDFParseError as e:
        return SingleAnalysisResponse(success=False, error=str(e), filename=resume.filename)
    except Exception as e:
        return SingleAnalysisResponse(
            success=False,
            error=f"Error reading PDF: {str(e)}",
            filename=resume.filename,
        )

    # Validate JD
    if not job_description or len(job_description.strip()) < 20:
        return SingleAnalysisResponse(
            success=False,
            error="Job description is too short. Please provide at least 20 characters.",
            filename=resume.filename,
        )

    # Run AI analysis
    try:
        result_data = analyze_resume(resume_text, job_description.strip())
    except (ValueError, RuntimeError) as e:
        return SingleAnalysisResponse(success=False, error=str(e), filename=resume.filename)

    # Build structured response
    result = AnalysisResult(
        match_score=result_data["match_score"],
        summary=result_data["summary"],
        strengths=result_data["strengths"],
        gaps=result_data["gaps"],
        keyword_analysis=[
            KeywordAnalysis(**kw) for kw in result_data.get("keyword_analysis", [])
        ],
        rewrite_suggestions=[
            RewriteSuggestion(**rs) for rs in result_data.get("rewrite_suggestions", [])
        ],
    )

    return SingleAnalysisResponse(success=True, result=result, filename=resume.filename)


@app.post("/api/analyze-text", response_model=SingleAnalysisResponse)
async def analyze_text(
    resume_text: str = Form(..., description="Resume text (pasted)"),
    job_description: str = Form(..., description="Job description text"),
):
    if not resume_text or len(resume_text.strip()) < 50:
        return SingleAnalysisResponse(
            success=False,
            error="Resume text is too short. Please provide more content.",
        )

    if not job_description or len(job_description.strip()) < 20:
        return SingleAnalysisResponse(
            success=False,
            error="Job description is too short. Please provide at least 20 characters.",
        )

    try:
        result_data = analyze_resume(resume_text.strip(), job_description.strip())
    except (ValueError, RuntimeError) as e:
        return SingleAnalysisResponse(success=False, error=str(e))

    result = AnalysisResult(
        match_score=result_data["match_score"],
        summary=result_data["summary"],
        strengths=result_data["strengths"],
        gaps=result_data["gaps"],
        keyword_analysis=[
            KeywordAnalysis(**kw) for kw in result_data.get("keyword_analysis", [])
        ],
        rewrite_suggestions=[
            RewriteSuggestion(**rs) for rs in result_data.get("rewrite_suggestions", [])
        ],
    )

    return SingleAnalysisResponse(success=True, result=result)


@app.post("/api/analyze-bulk", response_model=BulkAnalysisResponse)
async def analyze_bulk(
    resumes: list[UploadFile] = File(..., description="Multiple resume PDF files"),
    job_description: str = Form(..., description="Job description text"),
):
    if not job_description or len(job_description.strip()) < 20:
        return BulkAnalysisResponse(
            success=False,
            error="Job description is too short. Please provide at least 20 characters.",
        )

    candidates = []
    errors = []

    for resume in resumes:
        if not resume.filename.lower().endswith(".pdf"):
            errors.append(f"{resume.filename}: Not a PDF file, skipped.")
            continue

        try:
            file_bytes = await resume.read()
            resume_text = extract_text_from_pdf(file_bytes)
            result_data = analyze_resume(resume_text, job_description.strip())

            candidate = BulkCandidateResult(
                filename=resume.filename,
                match_score=result_data["match_score"],
                summary=result_data["summary"],
                strengths=result_data["strengths"],
                gaps=result_data["gaps"],
                keyword_analysis=[
                    KeywordAnalysis(**kw) for kw in result_data.get("keyword_analysis", [])
                ],
                rewrite_suggestions=[
                    RewriteSuggestion(**rs) for rs in result_data.get("rewrite_suggestions", [])
                ],
            )
            candidates.append(candidate)

        except (PDFParseError, ValueError, RuntimeError) as e:
            errors.append(f"{resume.filename}: {str(e)}")
        except Exception as e:
            errors.append(f"{resume.filename}: Unexpected error — {str(e)}")

    # Sort by match score (highest first)
    candidates.sort(key=lambda c: c.match_score, reverse=True)

    return BulkAnalysisResponse(
        success=True,
        candidates=candidates,
        total_analyzed=len(candidates),
        error="; ".join(errors) if errors else None,
    )
