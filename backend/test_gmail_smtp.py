#!/usr/bin/env python3
"""
GapFill — Standalone Gmail SMTP Verification Tester
Requires ZERO third-party libraries (uses only Python's built-in standard library).
Runs on any Python 3 installation on macOS, Linux, or Windows.
"""
import os
import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

def load_local_env():
    """Reads backend/.env if it exists without needing python-dotenv"""
    env_file = os.path.join(BACKEND_DIR, '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def send_test_email(user_email, app_password, target_email, otp_code="849201"):
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", 587))
    sender_name = os.environ.get("SMTP_FROM", f"GapFill Security <{user_email}>")

    clean_pass = app_password.replace(" ", "")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your GapFill Verification Code: {otp_code}"
    msg["From"] = sender_name
    msg["To"] = target_email

    text_fallback = f"Your GapFill verification code is {otp_code}. Valid for 10 minutes."
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
      <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
        <h2 style="color: #818cf8; text-align: center; margin-bottom: 4px;">GapFill</h2>
        <p style="color: #94a3b8; text-align: center; font-size: 13px; margin-top: 0;">Intelligent Knowledge Gap Engine & Study Companion</p>
        <p style="font-size: 14px; color: #e2e8f0; margin-top: 24px;">Hello,</p>
        <p style="font-size: 14px; color: #cbd5e1;">Use the 6-digit verification code below to verify your GapFill account:</p>
        <div style="background: #0f172a; border: 1px dashed #6366f1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <div style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">{otp_code}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Expires in 10 minutes • Do not share this code</div>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 16px;">
          GapFill • Built for Engineering Students
        </p>
      </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_fallback, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(host, port, timeout=12) as server:
        server.starttls()
        server.login(user_email, clean_pass)
        server.sendmail(user_email, [target_email], msg.as_string())

def main():
    load_local_env()

    print("\n" + "=" * 60)
    print("🚀 GapFill — Gmail SMTP Verification Tester")
    print("=" * 60)

    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASS", "").strip()

    if not user or not password:
        print("\n⚠️  No Gmail credentials found in backend/.env!")
        print("To configure:")
        print("1. Go to: https://myaccount.google.com/apppasswords")
        print("2. Create an App named 'GapFill' & copy the 16-letter password")
        print("3. Enter them below:\n")

        try:
            user = input("Your Gmail address (e.g. yourname@gmail.com): ").strip()
            password = input("Your 16-letter Google App Password: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            return

        if not user or not password:
            print("Both Gmail address and 16-letter password are required.")
            return

        # Save to backend/.env for future runs
        env_file = os.path.join(BACKEND_DIR, '.env')
        with open(env_file, 'w') as f:
            f.write(f"SMTP_HOST=smtp.gmail.com\n")
            f.write(f"SMTP_PORT=587\n")
            f.write(f"SMTP_USER={user}\n")
            f.write(f"SMTP_PASS={password}\n")
            f.write(f"SMTP_FROM=GapFill Security <{user}>\n")
            f.write(f"JWT_SECRET=gapfill_prod_secure_secret_2026\n")
        print(f"✅ Saved credentials to backend/.env")

    try:
        target = input(f"\nSend test OTP email to [{user}]: ").strip() or user
    except (KeyboardInterrupt, EOFError):
        target = user

    print(f"\n📡 Connecting to smtp.gmail.com:587 via TLS as {user}...")
    try:
        send_test_email(user, password, target, otp_code="849201")
        print(f"\n🎉 SUCCESS! A real verification email with OTP '849201' has been delivered to {target}!")
        print("👉 Check your Gmail / mail inbox (and spam folder if first time).")
    except Exception as e:
        print(f"\n❌ FAILED to send email: {e}")
        print("\nCommon fixes:")
        print("1. Ensure 2-Step Verification is turned ON on your Google account.")
        print("2. Make sure you generated an 'App Password', NOT your standard Gmail password.")

if __name__ == "__main__":
    main()
