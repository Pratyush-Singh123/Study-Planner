import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.syllabus import syllabus_bp
from routes.pyq import pyq_bp
from routes.quiz import quiz_bp
from routes.chat import chat_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(syllabus_bp, url_prefix='/api/syllabus')
app.register_blueprint(pyq_bp, url_prefix='/api/pyq')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "GapFill Backend API",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"GapFill API listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
