from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm, safe_json
from prompts.prompts import RESOURCE_RECOMMENDER_PROMPT

resource_bp = Blueprint('resource', __name__)

@resource_bp.route('/recommend', methods=['POST'])
def recommend_resource():
    """
    POST /api/resource/recommend
    Request: { topic, subject, confusion, learningStyle, provider, apiKey, model }
    Returns: { resourceType, title, why, searchQuery }
    """
    data = request.json or {}
    topic = data.get('topic', 'General Topic')
    subject = data.get('subject', 'Computer Science')
    confusion = data.get('confusion', 'General Conceptual Confusion')
    learning_style = data.get('learningStyle', 'video')
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    prompt = RESOURCE_RECOMMENDER_PROMPT.format(
        subject=subject,
        topic=topic,
        confusion=confusion,
        learningStyle=learning_style
    )
    user_msg = f"Recommend single best resource for student stuck on: {confusion} in {topic}"

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
            "resourceType": parsed.get('resourceType', 'video'),
            "title": parsed.get('title', f"{topic} In-Depth Walkthrough"),
            "why": parsed.get('why', 'Focuses precisely on resolving this conceptual confusion.'),
            "searchQuery": parsed.get('searchQuery', f"{topic} {confusion} visual explanation")
        })
    except Exception as e:
        return jsonify({"error": f"Resource recommendation error: {str(e)}"}), 500
