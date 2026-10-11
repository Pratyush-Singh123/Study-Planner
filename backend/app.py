import os
import sys

# Auto re-execute with backend/venv/bin/python if running outside dedicated virtualenv
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "bin", "python")
if os.path.exists(VENV_PYTHON) and sys.executable != os.path.abspath(VENV_PYTHON):
    os.execv(VENV_PYTHON, [VENV_PYTHON] + sys.argv)

# Load environment variables from backend/.env explicitly
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BACKEND_DIR, '.env'))
except ImportError:
    env_file = os.path.join(BACKEND_DIR, '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db, db_session
from routes.auth import auth_bp
from routes.user_data import user_data_bp
from routes.syllabus import syllabus_bp
from routes.pyq import pyq_bp
from routes.quiz import quiz_bp
from routes.chat import chat_bp
from routes.resource import resource_bp

app = Flask(__name__)
CORS(app)

# Initialize database tables
init_db()

# Ensure database sessions are removed at the end of the request
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_data_bp, url_prefix='/api/user')
app.register_blueprint(syllabus_bp, url_prefix='/api/syllabus')
app.register_blueprint(pyq_bp, url_prefix='/api/pyq')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(resource_bp, url_prefix='/api/resource')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "GapFill Backend API with Database & Auth",
        "version": "2.0.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"GapFill API listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
