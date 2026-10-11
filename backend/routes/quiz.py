from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm, safe_json
from prompts.prompts import QUIZ_EVALUATOR_PROMPT
from utils.auth_utils import optional_token
from database import get_db

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/evaluate', methods=['POST'])
@optional_token
def evaluate_student_answer():
    """
    POST /api/quiz/evaluate
    Request: { topic, question, studentAnswer, keyPoints, provider, apiKey, model }
    Returns: { correct, score, conceptualError, explanation, hint, relatedTopics }
    If authenticated, automatically logs mistake and updates topic gap in user's cloud database.
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

        correct = parsed.get('correct', False)
        score = parsed.get('score', 5)
        conceptual_error = parsed.get('conceptualError')
        explanation = parsed.get('explanation', '')
        hint = parsed.get('hint')
        related_topics = parsed.get('relatedTopics', [topic])

        # If user is authenticated, update their personal database study state
        if getattr(request, 'user', None) and request.user.study_state:
            db = get_db()
            study_state = request.user.study_state
            user_data = study_state.get_data()

            # Record mistake in user's DB mistakeLog if incorrect
            if not correct and conceptual_error:
                import time, random
                mistake_entry = {
                    "id": f"mistake_{int(time.time()*1000)}_{random.randint(100, 999)}",
                    "subject": data.get("subject", "General"),
                    "topic": topic,
                    "question": question,
                    "studentAnswer": student_answer,
                    "conceptualError": conceptual_error,
                    "errorCategory": "Conceptual Flaw",
                    "date": time.strftime("%Y-%m-%d"),
                    "resolved": False
                }
                mistake_log = user_data.get("mistakeLog", [])
                user_data["mistakeLog"] = [mistake_entry] + mistake_log

            # Update topic gap score in user's DB
            gap_scores = user_data.get("gapScores", {})
            curr_gap = gap_scores.get(topic, {"score": 100, "attempts": 0})
            session_gap = max(0, min(100, round(100 - score * 10)))
            new_attempts = curr_gap.get("attempts", 0) + 1
            weighted_score = round(
                (curr_gap.get("score", 100) * curr_gap.get("attempts", 0) + session_gap) / new_attempts
            )
            import datetime
            gap_scores[topic] = {
                "score": weighted_score,
                "attempts": new_attempts,
                "lastAttempted": datetime.datetime.utcnow().isoformat()
            }
            user_data["gapScores"] = gap_scores

            study_state.set_data(user_data)
            db.commit()

        return jsonify({
            "correct": correct,
            "score": score,
            "conceptualError": conceptual_error,
            "explanation": explanation,
            "hint": hint,
            "relatedTopics": related_topics
        })
    except Exception as e:
        return jsonify({"error": f"Evaluation error: {str(e)}"}), 500
