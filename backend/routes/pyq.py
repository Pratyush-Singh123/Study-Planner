from flask import Blueprint, request, jsonify
from utils.pdf_parser import extract_text_from_pdf

pyq_bp = Blueprint('pyq', __name__)

@pyq_bp.route('/parse-paper', methods=['POST'])
def parse_paper():
    """
    Accepts past question paper PDF and returns extracted questions text.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    try:
        content = file.read()
        extracted_text = extract_text_from_pdf(content)
        return jsonify({
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
