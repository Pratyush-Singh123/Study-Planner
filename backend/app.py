import os
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
