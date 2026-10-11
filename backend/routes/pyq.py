from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm, safe_json
from utils.pdf_parser import extract_questions_from_pdf
from prompts.prompts import PYQ_MAPPER_PROMPT, QUESTION_GENERATOR_PROMPT

pyq_bp = Blueprint('pyq', __name__)

@pyq_bp.route('/upload', methods=['POST'])
def upload_pyq_pdf():
    """
    POST /api/pyq/upload
    Request: multipart/form-data with PDF file
    Returns: { extractedQuestions: [string] }
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files supported"}), 400

    try:
        content = file.read()
        questions = extract_questions_from_pdf(content)
        return jsonify({
            "success": True,
            "filename": file.filename,
            "extractedQuestions": questions,
            "count": len(questions)
        })
    except Exception as e:
        return jsonify({"error": f"PDF parsing error: {str(e)}"}), 500


@pyq_bp.route('/map', methods=['POST'])
def map_pyqs():
    """
    POST /api/pyq/map
    Request: { questions: [string], topics: [string], provider, apiKey, model }
    Returns: { mappings: [{ question, topic, marks }], frequency: { topicName: count } }
    """
    data = request.json or {}
    questions = data.get('questions', [])
    topics = data.get('topics', [])
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    if not questions or not topics:
        return jsonify({"mappings": [], "frequency": {}}), 200

    user_msg = f"Topics: {topics}\n\nQuestions:\n" + "\n".join([f"- {q}" for q in questions[:30]])

    try:
        raw_res = call_llm(
            system_prompt=PYQ_MAPPER_PROMPT,
            user_message=user_msg,
            provider=provider,
            api_key=api_key,
            model=model
        )
        parsed = safe_json(raw_res)
        mappings = parsed.get('mappings', [])

        # Calculate frequency per topic
        frequency = {}
        for t in topics:
            frequency[t] = 0
        for m in mappings:
            t = m.get('topic')
            if t in frequency:
                frequency[t] += 1
            elif t:
                frequency[t] = 1

        return jsonify({
            "mappings": mappings,
            "frequency": frequency
        })
    except Exception as e:
        return jsonify({"error": f"Mapping failed: {str(e)}"}), 500


@pyq_bp.route('/generate', methods=['POST'])
def generate_questions():
    """
    POST /api/pyq/generate
    Request: { topic, subject, difficulty, count, provider, apiKey, model }
    Returns: { questions: [ { question, type, marks } ] }
    """
    data = request.json or {}
    topic = data.get('topic', 'General Topic')
    subject = data.get('subject', 'Computer Science')
    difficulty = data.get('difficulty', 'Medium')
    count = data.get('count', 3)
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    prompt = QUESTION_GENERATOR_PROMPT.format(
        subject=subject,
        topic=topic,
        difficulty=difficulty
    )
    user_msg = f"Generate {count} exam-style questions for {topic}"

    try:
        raw_res = call_llm(
            system_prompt=prompt,
            user_message=user_msg,
            provider=provider,
            api_key=api_key,
            model=model
        )
        parsed = safe_json(raw_res)
        return jsonify({
            "questions": parsed.get('questions', [])
        })
    except Exception as e:
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500
