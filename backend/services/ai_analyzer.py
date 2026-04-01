import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Model to use — Llama 3.3 70B is free on Groq and excellent for structured analysis
MODEL = "llama-3.3-70b-versatile"


ANALYSIS_PROMPT = """You are ResumeIQ, an expert AI resume analyst. Analyze how well the given resume matches the job description.

You MUST return your analysis as a valid JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):

{{
  "match_score": <integer 0-100>,
  "summary": "<2-3 sentence overview of the match>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "gaps": [
    "<gap 1>",
    "<gap 2>",
    "<gap 3>"
  ],
  "keyword_analysis": [
    {{
      "keyword": "<skill/requirement from JD>",
      "found": <true or false>,
      "context": "<where it appears in resume, or null if not found>"
    }}
  ],
  "rewrite_suggestions": [
    {{
      "original": "<original bullet or sentence from resume>",
      "suggestion": "<improved version>",
      "reason": "<why this is better for this JD>"
    }}
  ]
}}

ANALYSIS GUIDELINES:
1. MATCH SCORE: Be realistic. 90+ means near-perfect match. 50-70 is average. Below 40 is poor match.
2. STRENGTHS: List 3-6 specific strengths. Reference actual content from the resume.
3. GAPS: List 3-6 specific gaps. Reference actual requirements from the JD that are missing.
4. KEYWORD ANALYSIS: Extract 8-15 key skills/requirements from the JD and check each against the resume.
5. REWRITE SUGGESTIONS: Provide 2-4 concrete suggestions to improve resume bullets for this specific JD.

RESUME:
{resume_text}

JOB DESCRIPTION:
{jd_text}

Return ONLY the JSON object, nothing else."""


def analyze_resume(resume_text: str, jd_text: str) -> dict:
    """
    Analyze a single resume against a job description using Groq/Llama.
    
    Args:
        resume_text: Extracted text from the resume.
        jd_text: The job description text.
        
    Returns:
        Dictionary with match_score, strengths, gaps, keyword_analysis, rewrite_suggestions.
        
    Raises:
        ValueError: If inputs are invalid.
        RuntimeError: If the AI API call fails.
    """
    # Input validation
    if not resume_text or len(resume_text.strip()) < 50:
        raise ValueError("Resume text is too short. Please provide a more detailed resume.")
    
    if not jd_text or len(jd_text.strip()) < 20:
        raise ValueError("Job description is too short. Please provide a more detailed job description.")

    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text[:8000],  # Truncate to fit context window
        jd_text=jd_text[:4000]
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise JSON generator. Output ONLY valid JSON, no markdown formatting, no explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=MODEL,
            temperature=0.3,  # Low temperature for consistent, structured output
            max_tokens=4000,
            top_p=0.9,
        )
    except Exception as e:
        raise RuntimeError(f"Groq API call failed: {str(e)}")

    raw_response = chat_completion.choices[0].message.content

    # Parse and validate the JSON response
    return _parse_ai_response(raw_response)


def _parse_ai_response(raw: str) -> dict:
    # Strip markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (with optional language tag)
        cleaned = re.sub(r'^```[a-zA-Z]*\n?', '', cleaned)
        # Remove closing fence
        cleaned = re.sub(r'\n?```$', '', cleaned)
        cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse AI response as JSON: {str(e)}\nRaw response: {raw[:500]}")

    # Validate required fields with defaults
    result = {
        "match_score": max(0, min(100, int(data.get("match_score", 50)))),
        "summary": data.get("summary", "Analysis completed."),
        "strengths": data.get("strengths", []),
        "gaps": data.get("gaps", []),
        "keyword_analysis": data.get("keyword_analysis", []),
        "rewrite_suggestions": data.get("rewrite_suggestions", []),
    }

    return result
