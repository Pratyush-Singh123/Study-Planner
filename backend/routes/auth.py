import re
from flask import Blueprint, request, jsonify
from database import get_db
from models import User, UserStudyState
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_and_send_otp,
    verify_otp_code,
    generate_jwt_token,
    token_required
)

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    college = data.get("college", "").strip()

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    db = get_db()
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user and existing_user.is_verified:
        return jsonify({"error": "An account with this email already exists. Please log in."}), 409

    pwd_hash = hash_password(password)

    if existing_user:
        # Update existing unverified user
        existing_user.password_hash = pwd_hash
        existing_user.full_name = full_name or existing_user.full_name
        existing_user.college = college or existing_user.college
        db.commit()
        user = existing_user
    else:
        # Create new unverified user
        user = User(
            email=email,
            password_hash=pwd_hash,
            full_name=full_name,
            college=college,
            is_verified=False
        )
        db.add(user)
        db.commit()

    otp_code, sent, msg = create_and_send_otp(email, purpose="registration")

    return jsonify({
        "success": True,
        "message": f"Verification code sent to {email}. Please enter it to activate your account.",
        "email": email,
        "requires_otp": True,
        "dev_otp": otp_code  # Provided for frictionless development / offline testing
    }), 201


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP code are required."}), 400

    success, msg = verify_otp_code(email, otp, purpose="registration")
    if not success:
        return jsonify({"error": msg}), 400

    db = get_db()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return jsonify({"error": "User record not found."}), 404

    user.is_verified = True
    
    # Initialize default UserStudyState if not yet existing
    if not user.study_state:
        study_state = UserStudyState(user_id=user.id, data_json="{}")
        db.add(study_state)
    
    db.commit()

    token = generate_jwt_token(user.id, user.email)

    return jsonify({
        "success": True,
        "message": "Email verified successfully! Welcome to GapFill.",
        "token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.json or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email address is required."}), 400

    db = get_db()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return jsonify({"error": "No account found with this email."}), 404

    otp_code, sent, msg = create_and_send_otp(email, purpose="registration")

    return jsonify({
        "success": True,
        "message": f"New verification code sent to {email}.",
        "email": email,
        "dev_otp": otp_code
    }), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    db = get_db()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_verified:
        otp_code, _, _ = create_and_send_otp(email, purpose="registration")
        return jsonify({
            "success": False,
            "requires_otp": True,
            "email": email,
            "message": "Your email address is not yet verified. A verification code has been sent.",
            "dev_otp": otp_code
        }), 403

    token = generate_jwt_token(user.id, user.email)

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.full_name or user.email}!",
        "token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    return jsonify({
        "success": True,
        "user": request.user.to_dict()
    }), 200
