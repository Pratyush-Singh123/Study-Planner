from flask import Blueprint, request, jsonify

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/history', methods=['GET'])
def get_chat_history():
    return jsonify({
        "status": "ready",
        "coach": "GapFill AI Academic Coach"
    })
