import os
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from functools import wraps
import jwt
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
from models import User, EmailOTP

JWT_SECRET = os.environ.get("JWT_SECRET", "gapfill_jwt_secret_dev_production_key_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# SMTP configuration from environment variables
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER or "no-reply@gapfill.edu")

def hash_password(password: str) -> str:
    return generate_password_hash(password, method="scrypt")

def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)

def generate_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception as e:
        print("JWT decode error:", e)
        return None

def send_email_otp(to_email: str, otp_code: str, purpose: str = "registration") -> tuple[bool, str]:
    """
    Sends a branded HTML email containing the verification OTP.
    Falls back gracefully if SMTP is not configured in local environment.
    """
    subject = f"Your GapFill Verification Code: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; }}
        .card {{ max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .brand {{ font-size: 24px; font-weight: bold; color: #818cf8; letter-spacing: -0.5px; }}
        .subtitle {{ font-size: 13px; color: #94a3b8; margin-top: 4px; }}
        .otp-box {{ background: #0f172a; border: 1px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace; }}
        .expiry {{ font-size: 12px; color: #94a3b8; margin-top: 8px; }}
        .footer {{ font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">GapFill</div>
          <div class="subtitle">Intelligent Knowledge Gap Engine & Study Companion</div>
        </div>
        <p style="font-size: 15px; line-height: 1.5; color: #e2e8f0;">Hello,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
          Use the 6-digit verification code below to complete your {purpose} on GapFill:
        </p>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
          <div class="expiry">Expires in 10 minutes • Do not share this code</div>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.4;">
          If you did not initiate this request, you can safely ignore this email.
        </p>
        <div class="footer">
          GapFill • Built for Engineering Students • Secured with End-to-End Privacy
        </div>
      </div>
    </body>
    </html>
    """

    # If SMTP credentials are provided, attempt delivery
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_FROM
            msg["To"] = to_email

            text_fallback = f"Your GapFill verification code is {otp_code}. Valid for 10 minutes."
            msg.attach(MIMEText(text_fallback, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_FROM, [to_email], msg.as_string())

            print(f"📧 [SMTP] Successfully sent OTP email to {to_email}")
            return True, "Email sent successfully"
        except Exception as e:
            print(f"⚠️ [SMTP Error] Failed to send email to {to_email}: {e}")
            return False, str(e)
    else:
        # Development / local mode: print to console
        print(f"⚡ [DEV MODE] Simulated Email to {to_email} | OTP: {otp_code} ({purpose})")
        return True, "Dev mode: OTP logged to console"

def create_and_send_otp(email: str, purpose: str = "registration") -> tuple[str, bool, str]:
    db = get_db()
    otp_code = f"{secrets.randbelow(900000) + 100000:06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email and purpose
    db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.purpose == purpose,
        EmailOTP.is_used == False
    ).update({"is_used": True})

    otp_record = EmailOTP(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    sent, msg = send_email_otp(email, otp_code, purpose)
    return otp_code, sent, msg

def verify_otp_code(email: str, otp_code: str, purpose: str = "registration") -> tuple[bool, str]:
    db = get_db()
    now = datetime.utcnow()

    otp_record = db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.otp_code == otp_code.strip(),
        EmailOTP.purpose == purpose,
        EmailOTP.is_used == False,
        EmailOTP.expires_at > now
    ).order_by(EmailOTP.id.desc()).first()

    if not otp_record:
        return False, "Invalid or expired verification code."

    otp_record.is_used = True
    db.commit()
    return True, "OTP verified successfully."

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token required"}), 401

        token = auth_header.split(" ")[1]
        decoded = decode_jwt_token(token)
        if not decoded:
            return jsonify({"error": "Invalid or expired authorization token"}), 401

        user_id = decoded.get("sub")
        db = get_db()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User account no longer exists"}), 401

        request.user = user
        return f(*args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        request.user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            decoded = decode_jwt_token(token)
            if decoded:
                user_id = decoded.get("sub")
                db = get_db()
                request.user = db.query(User).filter(User.id == user_id).first()
        return f(*args, **kwargs)
    return decorated
