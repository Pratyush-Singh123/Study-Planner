from flask import Blueprint, request, jsonify
from database import get_db
from models import UserStudyState
from utils.auth_utils import token_required

user_data_bp = Blueprint("user_data", __name__)

@user_data_bp.route("/sync", methods=["GET"])
@token_required
def get_user_study_data():
    """
    GET /api/user/sync
    Retrieves the authenticated user's personal cloud database study state.
    """
    user = request.user
    db = get_db()

    study_state = user.study_state
    if not study_state:
        study_state = UserStudyState(user_id=user.id, data_json="{}")
        db.add(study_state)
        db.commit()

    return jsonify({
        "success": True,
        "data": study_state.get_data(),
        "updated_at": study_state.updated_at.isoformat() if study_state.updated_at else None,
        "user": user.to_dict()
    }), 200


@user_data_bp.route("/sync", methods=["POST"])
@token_required
def save_user_study_data():
    """
    POST /api/user/sync
    Atomically updates the authenticated user's personal cloud database study state.
    Payload: { data: { ... } }
    """
    user = request.user
    payload = request.json or {}
    new_data = payload.get("data")

    if new_data is None:
        return jsonify({"error": "Missing 'data' in request body."}), 400

    db = get_db()
    study_state = user.study_state
    if not study_state:
        study_state = UserStudyState(user_id=user.id)
        db.add(study_state)

    study_state.set_data(new_data)
    db.commit()

    return jsonify({
        "success": True,
        "message": "User study data successfully synchronized to database.",
        "updated_at": study_state.updated_at.isoformat() if study_state.updated_at else None
    }), 200
