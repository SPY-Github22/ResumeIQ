import fitz  # PyMuPDF
import io
import re


class PDFParseError(Exception):
    """Custom exception for PDF parsing failures."""
    pass


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise PDFParseError(f"Could not open PDF file: {str(e)}")

    if doc.page_count == 0:
        raise PDFParseError("PDF file has no pages.")

    full_text = []

    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text("text")
        if text and text.strip():
            full_text.append(text.strip())

    doc.close()

    if not full_text:
        raise PDFParseError(
            "No readable text found in the PDF. "
            "This may be a scanned document or image-based PDF. "
            "Please try pasting your resume text instead."
        )

    combined = "\n\n".join(full_text)
    cleaned = _clean_text(combined)

    if len(cleaned) < 50:
        raise PDFParseError(
            "The extracted text is too short to be a valid resume. "
            "Please check the PDF or paste your resume text directly."
        )

    return cleaned


def _clean_text(text: str) -> str:
    # Remove non-printable characters (keep newlines and tabs)
    text = re.sub(r'[^\S\n\t]+', ' ', text)
    # Collapse multiple blank lines into at most two
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    # Final trim
    return text.strip()
