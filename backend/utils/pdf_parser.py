"""
PDF extraction utility for GapFill
Extracts raw text from uploaded university syllabus or PYQ question papers.
"""
import io
import sys

def extract_text_from_pdf(file_bytes_or_path):
    """
    Attempts to extract text using PyMuPDF (fitz), then pypdf as fallback.
    """
    text = ""
    # Try PyMuPDF
    try:
        import fitz
        if isinstance(file_bytes_or_path, (bytes, bytearray)):
            doc = fitz.open(stream=file_bytes_or_path, filetype="pdf")
        else:
            doc = fitz.open(file_bytes_or_path)
            
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        if text.strip():
            return text.strip()
    except Exception as e:
        print(f"[pdf_parser] PyMuPDF extraction failed: {e}", file=sys.stderr)

    # Try pypdf
    try:
        import pypdf
        if isinstance(file_bytes_or_path, (bytes, bytearray)):
            reader = pypdf.PdfReader(io.BytesIO(file_bytes_or_path))
        else:
            reader = pypdf.PdfReader(file_bytes_or_path)
            
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        if text.strip():
            return text.strip()
    except Exception as e:
        print(f"[pdf_parser] pypdf extraction failed: {e}", file=sys.stderr)

    return text.strip()
