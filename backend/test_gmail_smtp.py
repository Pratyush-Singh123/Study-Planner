#!/usr/bin/env python3
"""
GapFill - Gmail SMTP Delivery Test Script
Tests sending a real verification OTP email directly to your inbox using a Gmail App Password.
"""
import os
import sys
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

from utils.auth_utils import send_email_otp, get_smtp_config

def main():
    print("=" * 60)
    print("🚀 GapFill — Gmail SMTP Verification Tester")
    print("=" * 60)

    host, port, user, password, sender = get_smtp_config()

    if not user or not password:
        print("\n⚠️  No Gmail credentials detected in backend/.env!")
        print("\nTo configure your free Gmail App Password:")
        print("1. Go to: https://myaccount.google.com/apppasswords")
        print("2. Create an App password named 'GapFill'")
        print("3. Copy the 16-letter password (e.g. 'abcd efgh ijkl mnop')")
        print("4. Add it to backend/.env:")
        print("   SMTP_USER=your_email@gmail.com")
        print("   SMTP_PASS=your_16_letter_app_password\n")

        # Allow user to test interactively right now if running in terminal
        if sys.stdin.isatty():
            user = input("Enter your Gmail address: ").strip()
            password = input("Enter your 16-letter Google App Password: ").strip()
            os.environ["SMTP_USER"] = user
            os.environ["SMTP_PASS"] = password
        else:
            return

    target_email = input(f"Send test verification code to [{user}]: ").strip() or user

    print(f"\n📡 Connecting to {host}:{port} via TLS as {user}...")
    success, msg = send_email_otp(target_email, "849201", purpose="registration")

    if success:
        print(f"\n🎉 SUCCESS! A real verification email with OTP '849201' has been sent to {target_email}!")
        print("👉 Check your Gmail / mail inbox (and spam folder if first time).")
    else:
        print(f"\n❌ FAILED to send email: {msg}")
        print("\nCommon fixes:")
        print("- Make sure 2-Step Verification is turned ON on your Google Account.")
        print("- Make sure you generated an 'App Password', NOT your standard Gmail login password.")

if __name__ == "__main__":
    main()
