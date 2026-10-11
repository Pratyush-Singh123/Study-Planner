from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm, safe_json
from prompts.prompts import SYLLABUS_PARSER_PROMPT

syllabus_bp = Blueprint('syllabus', __name__)

@syllabus_bp.route('/parse', methods=['POST'])
def parse_syllabus():
    data = request.json or {}
    subject_name = data.get('subjectName', 'Computer Science')
    syllabus_text = data.get('syllabusText', '')
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    if not syllabus_text.strip():
        return jsonify({"error": "syllabusText is required"}), 400

    user_msg = f"Subject: {subject_name}\nSyllabus:\n{syllabus_text}"

    try:
        raw_response = call_llm(
            system_prompt=SYLLABUS_PARSER_PROMPT,
            user_message=user_msg,
            provider=provider,
            api_key=api_key,
            model=model
        )
        parsed = safe_json(raw_response)
        topics = parsed.get('topics', [])
        return jsonify({"topics": topics})
    except Exception as e:
        return jsonify({"error": f"Failed to parse syllabus: {str(e)}"}), 500
