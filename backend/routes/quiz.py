from flask import Blueprint, request, jsonify

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/evaluate', methods=['POST'])
def evaluate_answer():
    """
    Backend evaluation endpoint fallback if frontend calls through API.
    """
    data = request.json or {}
    topic = data.get('topic', '')
    question = data.get('question', '')
    student_answer = data.get('student_answer', '')

    return jsonify({
        "success": True,
        "message": "Answer received for server-side evaluation.",
        "received": {
            "topic": topic,
            "answer_length": len(student_answer)
        }
    })
