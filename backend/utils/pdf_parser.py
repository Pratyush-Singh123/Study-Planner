import re
import io
import sys

def extract_questions_from_pdf(file_path_or_bytes):
    """
    Extracts text from PDF and splits into individual questions
    using standard university exam question numbering conventions.
    """
    text = ""
    try:
        import pdfplumber
        if isinstance(file_path_or_bytes, (bytes, bytearray)):
            pdf_file = io.BytesIO(file_path_or_bytes)
        else:
            pdf_file = file_path_or_bytes

        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"[pdf_parser] pdfplumber error: {e}, attempting pypdf fallback", file=sys.stderr)
        try:
            import pypdf
            if isinstance(file_path_or_bytes, (bytes, bytearray)):
                reader = pypdf.PdfReader(io.BytesIO(file_path_or_bytes))
            else:
                reader = pypdf.PdfReader(file_path_or_bytes)
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        except Exception as e2:
            print(f"[pdf_parser] pypdf error: {e2}", file=sys.stderr)

    # Split by common question numbering patterns
    patterns = [
        r'\n(?=Q\d+[\.\)])',       # Q1. Q2. Q1) Q2)
        r'\n(?=\d+[\.\)])',        # 1. 2. 1) 2)
        r'\n(?=[Qq]uestion\s+\d)', # Question 1 Question 2
    ]

    questions = []
    for pattern in patterns:
        parts = re.split(pattern, text)
        if len(parts) > 2:
            questions = [p.strip() for p in parts if len(p.strip()) > 15]
            break

    # Fallback: split by double newlines if no pattern matched
    if not questions:
        questions = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 15]

    return questions[:50]  # Cap at 50 questions
