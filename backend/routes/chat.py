from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm
from prompts.prompts import build_chatbot_system_prompt

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('', methods=['POST'])
@chat_bp.route('/', methods=['POST'])
def handle_chat_message():
    """
    POST /api/chat
    Request: { message, history: [], context: { topics, gapScores, mistakeLog, subjects }, provider, apiKey, model }
    Returns: { reply: string }
    """
    data = request.json or {}
    message = data.get('message', '')
    history = data.get('history', [])
    context = data.get('context', {})
    provider = data.get('provider', 'demo')
    api_key = data.get('apiKey')
    model = data.get('model')

    if not message.strip():
        return jsonify({"error": "Message is required"}), 400

    system_prompt = build_chatbot_system_prompt(context)

    try:
        reply = call_llm(
            system_prompt=system_prompt,
            user_message=message,
            provider=provider,
            api_key=api_key,
            model=model,
            history=history
        )
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": f"Chatbot error: {str(e)}"}), 500
