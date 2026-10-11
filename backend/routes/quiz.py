from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm, safe_json
from prompts.prompts import QUIZ_EVALUATOR_PROMPT

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/evaluate', methods=['POST'])
def evaluate_student_answer():
    """
    POST /api/quiz/evaluate
    Request: { topic, question, studentAnswer, keyPoints, provider, apiKey, model }
    Returns: { correct, score, conceptualError, explanation, hint, relatedTopics }
    """
    data = request.json or {}
    topic = data.get('topic', 'General Concept')
    question = data.get('question', '')
    student_answer = data.get('studentAnswer', '')
    key_points = data.get('keyPoints', ['Standard academic approach'])
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    if not student_answer.strip():
        return jsonify({
            "correct": False,
            "score": 0,
            "conceptualError": "No answer provided.",
            "explanation": "Please provide an answer to receive conceptual diagnostics.",
            "hint": "Try writing your initial thoughts or key definitions.",
            "relatedTopics": [topic]
        })

    prompt = QUIZ_EVALUATOR_PROMPT.format(
        topic=topic,
        question=question,
        keyPoints=str(key_points),
        studentAnswer=student_answer
    )

    try:
        raw_res = call_llm(
            system_prompt=prompt,
            user_message=f"Evaluate student's answer: {student_answer}",
            provider=provider,
            api_key=api_key,
            model=model
        )
        parsed = safe_json(raw_res)
        return jsonify({
            "correct": parsed.get('correct', False),
            "score": parsed.get('score', 5),
            "conceptualError": parsed.get('conceptualError'),
            "explanation": parsed.get('explanation', ''),
            "hint": parsed.get('hint'),
            "relatedTopics": parsed.get('relatedTopics', [topic])
        })
    except Exception as e:
        return jsonify({"error": f"Evaluation error: {str(e)}"}), 500
