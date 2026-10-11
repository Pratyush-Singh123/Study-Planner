from flask import Blueprint, request, jsonify
from utils.llm_caller import call_llm
from prompts.prompts import build_chatbot_system_prompt
from utils.auth_utils import optional_token
from database import get_db

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('', methods=['POST'])
@chat_bp.route('/', methods=['POST'])
@optional_token
def handle_chat_message():
    """
    POST /api/chat
    Request: { message, history: [], context: { topics, gapScores, mistakeLog, subjects }, provider, apiKey, model }
    Returns: { reply: string }
    If authenticated (Authorization: Bearer <token>), enriches the prompt with the student's actual database study records.
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

    # If user is authenticated, load their personal data from the database
    if getattr(request, 'user', None):
        user = request.user
        study_state = user.study_state
        if study_state:
            db_data = study_state.get_data()
            # If request context is sparse or empty, populate directly from user's database records
            if not context.get('subjects') and db_data.get('subjects'):
                context['subjects'] = db_data.get('subjects', [])
            if not context.get('gapScores') and db_data.get('gapScores'):
                context['gapScores'] = db_data.get('gapScores', {})
            if not context.get('mistakeLog') and db_data.get('mistakeLog'):
                context['mistakeLog'] = db_data.get('mistakeLog', [])

            context['studentName'] = user.full_name or user.email
            context['college'] = user.college or "Engineering College"

    system_prompt = build_chatbot_system_prompt(context)
    
    # Prepend student personalization banner if logged in
    if getattr(request, 'user', None):
        user = request.user
        system_prompt = f"""[AUTHENTICATED STUDENT PROFILE]
Name: {user.full_name or 'Student'}
College: {user.college or 'Engineering College'}
Account: {user.email}
Address the student with personal familiarity based on their unique study data below.
--------------------------------------------------
{system_prompt}"""

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
