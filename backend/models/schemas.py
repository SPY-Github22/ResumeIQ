from pydantic import BaseModel, Field
from typing import Optional


class KeywordAnalysis(BaseModel):
    keyword: str = Field(..., description="The keyword or skill from the JD")
    found: bool = Field(..., description="Whether the keyword was found in the resume")
    context: Optional[str] = Field(None, description="Context where the keyword appears in the resume")


class RewriteSuggestion(BaseModel):
    original: str = Field(..., description="Original text from the resume")
    suggestion: str = Field(..., description="Suggested rewrite")
    reason: str = Field(..., description="Why this rewrite would improve the resume")


class AnalysisResult(BaseModel):
    match_score: int = Field(..., ge=0, le=100, description="Overall match percentage (0-100)")
    summary: str = Field(..., description="Brief summary of the match analysis")
    strengths: list[str] = Field(default_factory=list, description="Strong points in the resume for this JD")
    gaps: list[str] = Field(default_factory=list, description="Missing skills or areas to improve")
    keyword_analysis: list[KeywordAnalysis] = Field(default_factory=list, description="Per-keyword match analysis")
    rewrite_suggestions: list[RewriteSuggestion] = Field(default_factory=list, description="Suggested rewrites for resume bullets")


class SingleAnalysisResponse(BaseModel):
    success: bool
    result: Optional[AnalysisResult] = None
    error: Optional[str] = None
    filename: Optional[str] = None


class BulkCandidateResult(BaseModel):
    filename: str
    match_score: int = Field(..., ge=0, le=100)
    summary: str
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    keyword_analysis: list[KeywordAnalysis] = Field(default_factory=list)
    rewrite_suggestions: list[RewriteSuggestion] = Field(default_factory=list)


class BulkAnalysisResponse(BaseModel):
    success: bool
    candidates: list[BulkCandidateResult] = Field(default_factory=list)
    total_analyzed: int = 0
    error: Optional[str] = None
