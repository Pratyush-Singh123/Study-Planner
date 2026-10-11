from flask import Blueprint, request, jsonify
from utils.pdf_parser import extract_text_from_pdf

syllabus_bp = Blueprint('syllabus', __name__)

@syllabus_bp.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    """
    Accepts multipart/form-data PDF file and returns extracted text.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files supported"}), 400

    try:
        content = file.read()
        extracted_text = extract_text_from_pdf(content)
        return jsonify({
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "char_count": len(extracted_text)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
